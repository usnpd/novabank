package com.novabank.service;

import com.novabank.enums.AlertType;
import com.novabank.enums.TransactionCategory;
import com.novabank.enums.TransactionType;
import com.novabank.exception.InsufficientFundsException;
import com.novabank.exception.ResourceNotFoundException;
import com.novabank.model.Account;
import com.novabank.model.Alert;
import com.novabank.model.Transaction;
import com.novabank.model.User;
import com.novabank.payload.request.TransactionRequest;
import com.novabank.payload.response.TransactionResponse;
import com.novabank.repository.AccountRepository;
import com.novabank.repository.AlertRepository;
import com.novabank.repository.TransactionRepository;
import com.novabank.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private FraudDetectionService fraudDetectionService;

    private String generateTxnRef(String prefix) {
        String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        return prefix + "-" + uuid;
    }

    @Transactional
    public TransactionResponse addTransaction(TransactionRequest request, String email) {
        log.info("Processing transaction of amount: {} for account: {}", request.getAmount(), request.getAccountId());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        Account account = accountRepository.findById(request.getAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", request.getAccountId()));

        if (!account.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied: You do not own this account.");
        }

        TransactionType type = TransactionType.valueOf(request.getTransactionType().toUpperCase());
        TransactionCategory category = TransactionCategory.valueOf(request.getCategory().toUpperCase());

        // Validate balances for DEBIT
        if (type == TransactionType.DEBIT) {
            if (account.getBalance().compareTo(request.getAmount()) < 0) {
                throw new InsufficientFundsException("Insufficient funds. Account balance is: " + account.getBalance());
            }
            account.setBalance(account.getBalance().subtract(request.getAmount()));
        } else {
            account.setBalance(account.getBalance().add(request.getAmount()));
        }

        accountRepository.save(account);

        String ref = generateTxnRef("TXN");
        Transaction transaction = Transaction.builder()
                .referenceNumber(ref)
                .amount(request.getAmount())
                .transactionType(type)
                .category(category)
                .description(request.getDescription())
                .account(account)
                .counterPartyAccount(request.getCounterPartyAccount())
                .isRecurring(request.getIsRecurring())
                .build();

        Transaction saved = transactionRepository.save(transaction);

        // Alert checks
        // 1. Large transaction size flag: Trigger LARGE_TRANSACTION immediately if amount > 50,000
        if (request.getAmount().compareTo(new BigDecimal("50000")) > 0) {
            Alert alert = Alert.builder()
                    .alertType(AlertType.LARGE_TRANSACTION)
                    .message("HIGH: Large transaction detected on account " + account.getAccountNumber() + ". Reference: " + ref + ", Amount: $" + request.getAmount())
                    .severity("WARNING")
                    .transaction(saved)
                    .user(user)
                    .build();
            alertRepository.save(alert);
            log.warn("Large transaction alert created for amount: {}", request.getAmount());
        }

        // 2. Low balance check: Trigger alert if savings/current falls below $500
        if (account.getBalance().compareTo(new BigDecimal("500")) < 0) {
            Alert alert = Alert.builder()
                    .alertType(AlertType.LOW_BALANCE)
                    .message("INFO: Low balance warning. Account " + account.getAccountNumber() + " balance is now $" + account.getBalance())
                    .severity("INFO")
                    .user(user)
                    .build();
            alertRepository.save(alert);
        }

        // Asynchronously call Gemini to score fraud
        fraudDetectionService.scanTransactionAsync(saved.getId());

        return convertToResponse(saved);
    }

    @Transactional
    public List<TransactionResponse> transferBetweenAccounts(String sourceAccNumber, String targetAccNumber, BigDecimal amount, String description, String email) {
        log.info("Processing transfer of {} from {} to {}", amount, sourceAccNumber, targetAccNumber);
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        Account sourceAccount = accountRepository.findByAccountNumber(sourceAccNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "accountNumber", sourceAccNumber));

        Account targetAccount = accountRepository.findByAccountNumber(targetAccNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "accountNumber", targetAccNumber));

        if (!sourceAccount.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied: You do not own the source account.");
        }

        if (sourceAccount.getBalance().compareTo(amount) < 0) {
            throw new InsufficientFundsException("Insufficient funds. Account balance is: " + sourceAccount.getBalance());
        }

        // Update balances
        sourceAccount.setBalance(sourceAccount.getBalance().subtract(amount));
        targetAccount.setBalance(targetAccount.getBalance().add(amount));

        accountRepository.save(sourceAccount);
        accountRepository.save(targetAccount);

        String outRef = generateTxnRef("TXN-OUT");
        String inRef = generateTxnRef("TXN-IN");

        Transaction debitTxn = Transaction.builder()
                .referenceNumber(outRef)
                .amount(amount)
                .transactionType(TransactionType.DEBIT)
                .category(TransactionCategory.TRANSFER)
                .description(description != null ? description : "Funds transfer out")
                .account(sourceAccount)
                .counterPartyAccount(targetAccNumber)
                .isRecurring(false)
                .build();

        Transaction creditTxn = Transaction.builder()
                .referenceNumber(inRef)
                .amount(amount)
                .transactionType(TransactionType.CREDIT)
                .category(TransactionCategory.TRANSFER)
                .description(description != null ? description : "Funds transfer in")
                .account(targetAccount)
                .counterPartyAccount(sourceAccNumber)
                .isRecurring(false)
                .build();

        Transaction savedDebit = transactionRepository.save(debitTxn);
        Transaction savedCredit = transactionRepository.save(creditTxn);

        // Async fraud scans for both
        fraudDetectionService.scanTransactionAsync(savedDebit.getId());
        fraudDetectionService.scanTransactionAsync(savedCredit.getId());

        return List.of(convertToResponse(savedDebit), convertToResponse(savedCredit));
    }

    public List<TransactionResponse> getTransactionsForAccount(Long accountId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", accountId));

        if (!account.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied: You do not own this account.");
        }

        return transactionRepository.findByAccountIdOrderByCreatedAtDesc(accountId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<TransactionResponse> getTransactionsForUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        return transactionRepository.findByAccountUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private TransactionResponse convertToResponse(Transaction txn) {
        return TransactionResponse.builder()
                .id(txn.getId())
                .referenceNumber(txn.getReferenceNumber())
                .amount(txn.getAmount())
                .transactionType(txn.getTransactionType().name())
                .category(txn.getCategory().name())
                .description(txn.getDescription())
                .accountId(txn.getAccount().getId())
                .accountNumber(txn.getAccount().getAccountNumber())
                .accountName(txn.getAccount().getAccountName())
                .counterPartyAccount(txn.getCounterPartyAccount())
                .isRecurring(txn.getIsRecurring())
                .fraudScore(txn.getFraudScore())
                .fraudRisk(txn.getFraudRisk())
                .anomalyReason(txn.getAnomalyReason())
                .createdAt(txn.getCreatedAt())
                .build();
    }
}
