package com.novabank.controller;

import com.novabank.exception.ResourceNotFoundException;
import com.novabank.model.Alert;
import com.novabank.model.User;
import com.novabank.payload.response.AlertResponse;
import com.novabank.payload.response.DashboardResponse;
import com.novabank.payload.response.TransactionResponse;
import com.novabank.payload.response.AccountSummaryResponse;
import com.novabank.repository.AlertRepository;
import com.novabank.repository.UserRepository;
import com.novabank.service.AccountService;
import com.novabank.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DashboardController {

    @Autowired
    private AccountService accountService;

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private UserRepository userRepository;

    private String getAuthenticatedUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @GetMapping
    public ResponseEntity<DashboardResponse> getDashboard() {
        String email = getAuthenticatedUserEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        List<AccountSummaryResponse> accounts = accountService.getAccountSummaries(email);
        List<TransactionResponse> transactions = transactionService.getTransactionsForUser(email);
        
        // Take recent 5 transactions
        List<TransactionResponse> recentTransactions = transactions.stream()
                .limit(5)
                .collect(Collectors.toList());

        // Sum account balances by type
        BigDecimal totalSavings = BigDecimal.ZERO;
        BigDecimal totalCurrent = BigDecimal.ZERO;
        BigDecimal totalCredit = BigDecimal.ZERO;
        BigDecimal totalInvestments = BigDecimal.ZERO;

        for (AccountSummaryResponse acc : accounts) {
            switch (acc.getAccountType().toUpperCase()) {
                case "SAVINGS":
                    totalSavings = totalSavings.add(acc.getBalance());
                    break;
                case "CURRENT":
                    totalCurrent = totalCurrent.add(acc.getBalance());
                    break;
                case "CREDIT":
                    totalCredit = totalCredit.add(acc.getBalance());
                    break;
                case "INVESTMENT":
                    totalInvestments = totalInvestments.add(acc.getBalance());
                    break;
            }
        }

        // Fetch alerts
        List<Alert> alerts = alertRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        List<AlertResponse> alertResponses = alerts.stream().map(a -> AlertResponse.builder()
                .id(a.getId())
                .alertType(a.getAlertType().name())
                .message(a.getMessage())
                .severity(a.getSeverity())
                .isRead(a.getIsRead())
                .transactionReference(a.getTransaction() != null ? a.getTransaction().getReferenceNumber() : null)
                .createdAt(a.getCreatedAt())
                .build()).collect(Collectors.toList());

        int unreadCount = (int) alertResponses.stream().filter(a -> !a.getIsRead()).count();

        DashboardResponse response = DashboardResponse.builder()
                .accounts(accounts)
                .recentTransactions(recentTransactions)
                .totalSavings(totalSavings)
                .totalCurrent(totalCurrent)
                .totalCredit(totalCredit)
                .totalInvestments(totalInvestments)
                .unreadAlertCount(unreadCount)
                .alerts(alertResponses)
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/alerts/{id}/read")
    public ResponseEntity<?> markAlertAsRead(@PathVariable Long id) {
        String email = getAuthenticatedUserEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alert", "id", id));

        if (!alert.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied: You do not own this alert.");
        }

        alert.setIsRead(true);
        alertRepository.save(alert);

        return ResponseEntity.ok().build();
    }
}
