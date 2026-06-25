package com.novabank.payload.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FraudAnalysisResponse {
    private String transactionReference;
    private Double fraudScore;
    private String fraudRisk;
    private String anomalyReason;
    private Boolean isFlagged;
    private List<String> rulesTriggered;
}
