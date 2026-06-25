package com.novabank.payload.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private List<AccountSummaryResponse> accounts;
    private List<TransactionResponse> recentTransactions;
    private BigDecimal totalSavings;
    private BigDecimal totalCurrent;
    private BigDecimal totalCredit;
    private BigDecimal totalInvestments;
    private Integer unreadAlertCount;
    private List<AlertResponse> alerts;
}
