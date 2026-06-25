package com.novabank.payload.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionRequest {

    @NotNull(message = "Account ID is required")
    private Long accountId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;

    @NotBlank(message = "Transaction type is required")
    private String transactionType; // CREDIT or DEBIT

    @NotBlank(message = "Category is required")
    private String category; // SALARY, RENT, GROCERIES, etc.

    private String description;

    private String counterPartyAccount; // Used for transfers

    @Builder.Default
    private Boolean isRecurring = false;
}
