package com.novabank.payload.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {
    private Long id;
    private String referenceNumber;
    private BigDecimal amount;
    private String transactionType;
    private String category;
    private String description;
    private Long accountId;
    private String accountNumber;
    private String accountName;
    private String counterPartyAccount;
    private Boolean isRecurring;
    private Double fraudScore;
    private String fraudRisk;
    private String anomalyReason;
    private LocalDateTime createdAt;
}
