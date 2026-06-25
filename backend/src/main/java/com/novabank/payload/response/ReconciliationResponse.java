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
public class ReconciliationResponse {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryReconciliationDetail {
        private String category;
        private BigDecimal month1Amount;
        private BigDecimal month2Amount;
        private BigDecimal variance;
        private Double variancePercentage;
        private String status; // MATCHED, DISCREPANCY, NEW
        private String explanation;
    }

    private String month1;
    private String month2;
    private List<CategoryReconciliationDetail> categories;
    private String aiAuditReport;
}
