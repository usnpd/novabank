package com.novabank.controller;

import com.novabank.payload.request.TransactionRequest;
import com.novabank.payload.response.TransactionResponse;
import com.novabank.service.TransactionService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    private String getAuthenticatedUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> addTransaction(@Valid @RequestBody TransactionRequest request) {
        String email = getAuthenticatedUserEmail();
        TransactionResponse response = transactionService.addTransaction(request, email);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/transfer")
    public ResponseEntity<List<TransactionResponse>> transferFunds(@Valid @RequestBody TransferRequest request) {
        String email = getAuthenticatedUserEmail();
        List<TransactionResponse> response = transactionService.transferBetweenAccounts(
                request.getSourceAccountNumber(),
                request.getTargetAccountNumber(),
                request.getAmount(),
                request.getDescription(),
                email);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<TransactionResponse>> getTransactions() {
        String email = getAuthenticatedUserEmail();
        List<TransactionResponse> response = transactionService.getTransactionsForUser(email);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/account/{accountId}")
    public ResponseEntity<List<TransactionResponse>> getTransactionsForAccount(@PathVariable Long accountId) {
        String email = getAuthenticatedUserEmail();
        List<TransactionResponse> response = transactionService.getTransactionsForAccount(accountId, email);
        return ResponseEntity.ok(response);
    }

    @Data
    public static class TransferRequest {
        @NotBlank(message = "Source account number is required")
        private String sourceAccountNumber;

        @NotBlank(message = "Target account number is required")
        private String targetAccountNumber;

        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
        private BigDecimal amount;

        private String description;
    }
}
