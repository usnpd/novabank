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
public class AccountSummaryResponse {
    private Long id;
    private String accountNumber;
    private String accountName;
    private BigDecimal balance;
    private String accountType;
    private List<BigDecimal> sparklineData;
}
