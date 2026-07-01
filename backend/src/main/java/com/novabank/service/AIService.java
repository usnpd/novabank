package com.novabank.service;

import com.novabank.payload.response.AIInsightResponse;
import com.novabank.payload.response.CashFlowResponse;
import com.novabank.payload.response.FraudAnalysisResponse;

public interface AIService {
    FraudAnalysisResponse analyzeTransaction(String txnDetails);
    AIInsightResponse generateMonthlyInsight(String portfolioSummary);
    CashFlowResponse predictCashFlow(String historicalData);
    String reconcileTransactions(String varianceReport);
}
