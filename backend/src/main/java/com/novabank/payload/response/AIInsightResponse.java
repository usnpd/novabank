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
public class AIInsightResponse {
    private String portfolioHealthGrade;
    private Integer savingsRateScore;
    private Integer spendingOptimizationScore;
    private String portfolioSummary;
    private List<String> actionChecklist;
    private String gradeReasoning;
}
