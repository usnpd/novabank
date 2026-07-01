package com.novabank.service;

import com.novabank.enums.AccountType;
import com.novabank.exception.ResourceNotFoundException;
import com.novabank.model.Account;
import com.novabank.model.Transaction;
import com.novabank.model.User;
import com.novabank.payload.request.AccountRequest;
import com.novabank.payload.response.AccountResponse;
import com.novabank.payload.response.AccountSummaryResponse;
import com.novabank.repository.AccountRepository;
import com.novabank.repository.TransactionRepository;
import com.novabank.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@Slf4j
public class AccountServiceImpl implements AccountService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    @Transactional
    public AccountResponse createAccount(AccountRequest request, String email) {
        log.info("Creating account: {} for user: {}", request.getAccountName(), email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        String accountNumber = generateUniqueAccountNumber();

        Account account = Account.builder()
                .accountName(request.getAccountName())
                .accountNumber(accountNumber)
                .balance(request.getInitialBalance())
                .accountType(AccountType.valueOf(request.getAccountType().toUpperCase()))
                .user(user)
                .build();

        Account saved = accountRepository.save(account);
        return convertToResponse(saved);
    }

    @Override
    public List<AccountSummaryResponse> getAccountSummaries(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        List<Account> accounts = accountRepository.findByUserId(user.getId());
        return accounts.stream().map(account -> {
            List<Transaction> txns = transactionRepository.findByAccountIdOrderByCreatedAtDesc(account.getId());
            
            List<BigDecimal> sparkline = new ArrayList<>();
            BigDecimal currentVal = account.getBalance();
            sparkline.add(currentVal);
            
            for (int i = 0; i < Math.min(txns.size(), 7); i++) {
                Transaction t = txns.get(i);
                if (t.getTransactionType() == com.novabank.enums.TransactionType.CREDIT) {
                    currentVal = currentVal.subtract(t.getAmount());
                } else {
                    currentVal = currentVal.add(t.getAmount());
                }
                sparkline.add(currentVal);
            }
            Collections.reverse(sparkline);

            return AccountSummaryResponse.builder()
                    .id(account.getId())
                    .accountName(account.getAccountName())
                    .accountNumber(account.getAccountNumber())
                    .balance(account.getBalance())
                    .accountType(account.getAccountType().name())
                    .sparklineData(sparkline)
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    public List<AccountResponse> getAllAccountsForUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
        return accountRepository.findByUserId(user.getId()).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AccountResponse getAccountById(Long accountId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", accountId));

        if (!account.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied: You do not own this account.");
        }

        return convertToResponse(account);
    }

    private String generateUniqueAccountNumber() {
        Random random = new Random();
        String number;
        do {
            long rawNumber = (long) (random.nextDouble() * 9_000_000_000L) + 1_000_000_000L;
            number = "US" + rawNumber;
        } while (accountRepository.existsByAccountNumber(number));
        return number;
    }

    private AccountResponse convertToResponse(Account account) {
        return AccountResponse.builder()
                .id(account.getId())
                .accountNumber(account.getAccountNumber())
                .accountName(account.getAccountName())
                .balance(account.getBalance())
                .accountType(account.getAccountType().name())
                .createdAt(account.getCreatedAt())
                .build();
    }
}
