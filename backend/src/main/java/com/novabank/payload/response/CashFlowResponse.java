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
public class CashFlowResponse {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CashFlowPoint {
        private String date; // YYYY-MM-DD
        private BigDecimal inflow;
        private BigDecimal outflow;
        private BigDecimal netFlow;
    }

    private List<CashFlowPoint> historicalData;
    private List<CashFlowPoint> forecastedData;
    private BigDecimal netInflow30Days;
    private BigDecimal netOutflow30Days;
    private BigDecimal projectedBalanceEnd30Days;
    private String AIRecommendation;
}
