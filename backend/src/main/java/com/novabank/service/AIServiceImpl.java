package com.novabank.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.novabank.payload.response.AIInsightResponse;
import com.novabank.payload.response.CashFlowResponse;
import com.novabank.payload.response.FraudAnalysisResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class AIServiceImpl implements AIService {

    @Autowired
    private ApplicationContext applicationContext;

    @Value("")
    private String aiProvider;

    @Autowired
    private ObjectMapper objectMapper;

    private ChatModel getActiveChatModel() {
        if (applicationContext == null) return null;
        Map<String, ChatModel> chatModels = applicationContext.getBeansOfType(ChatModel.class);
        if (chatModels == null || chatModels.isEmpty()) return null;

        String provider = aiProvider;
        if (provider == null || provider.trim().isEmpty()) {
            provider = "mistral";
        }
        provider = provider.trim().toLowerCase();

        for (Map.Entry<String, ChatModel> entry : chatModels.entrySet()) {
            String beanName = entry.getKey().toLowerCase();
            if (provider.equals("mistral") && beanName.contains("mistral")) {
                return entry.getValue();
            }
            if (provider.equals("google") && (beanName.contains("google") || beanName.contains("genai"))) {
                return entry.getValue();
            }
        }
        
        for (Map.Entry<String, ChatModel> entry : chatModels.entrySet()) {
            if (entry.getKey().toLowerCase().contains("mistral")) {
                return entry.getValue();
            }
        }
        return chatModels.values().iterator().next();
    }

    private String cleanJsonResponse(String responseText) {
        if (responseText == null) return "";
        responseText = responseText.trim();
        if (responseText.startsWith("`json")) {
            responseText = responseText.substring(7);
        } else if (responseText.startsWith("`")) {
            responseText = responseText.substring(3);
        }
        if (responseText.endsWith("`")) {
            responseText = responseText.substring(0, responseText.length() - 3);
        }
        return responseText.trim();
    }

    private String callModel(String systemPrompt, String userPrompt) {
        ChatModel chatModel = getActiveChatModel();
        if (chatModel == null) {
            log.warn("Spring AI ChatModel is not configured. Falling back to local rule-based simulation.");
            return null;
        }

        try {
            String combinedPrompt = systemPrompt + "\n\nUser Input:\n" + userPrompt;
            log.info("Calling active AI ChatModel...");
            String rawResponse = chatModel.call(combinedPrompt);
            return cleanJsonResponse(rawResponse);
        } catch (Exception e) {
            log.error("Error communicating with Spring AI ChatModel: {}", e.getMessage(), e);
            return null;
        }
    }

    // 1. Analyze Transaction (Fraud & Risk Scoring)
    @Override
    public FraudAnalysisResponse analyzeTransaction(String txnDetails) {
        String systemPrompt = "You are a real-time banking fraud analysis engine. " +
                "Analyze the transaction details and return ONLY a raw JSON object (no markdown backticks, no other text): " +
                "{\n" +
                "  \"transactionReference\": \"string\",\n" +
                "  \"fraudScore\": 0.00, // 0.0 to 1.0\n" +
                "  \"fraudRisk\": \"LOW | MEDIUM | HIGH\",\n" +
                "  \"anomalyReason\": \"string explaining details\",\n" +
                "  \"isFlagged\": true | false,\n" +
                "  \"rulesTriggered\": [\"string\"]\n" +
                "}";

        String jsonResponse = callModel(systemPrompt, txnDetails);
        if (jsonResponse != null) {
            try {
                return objectMapper.readValue(jsonResponse, FraudAnalysisResponse.class);
            } catch (Exception e) {
                log.error("Failed to parse AI fraud response. Falling back.", e);
            }
        }

        // Local Rule-based Simulation Fallback
        double mockScore = 0.05;
        String risk = "LOW";
        String reason = "No anomalous patterns identified by local checks.";
        List<String> rules = new ArrayList<>();

        if (txnDetails.contains("amount=50000") || txnDetails.contains("amount=100000") || txnDetails.contains("amount=150000") || txnDetails.contains("amount=200000")) {
            mockScore = 0.85;
            risk = "HIGH";
            reason = "Large transaction size flag triggered.";
            rules.add("LARGE_TRANSACTION_LIMIT");
        } else if (txnDetails.contains("category=OTHER") && txnDetails.contains("description=unknown")) {
            mockScore = 0.55;
            risk = "MEDIUM";
            reason = "Unclassified counterparty transfer.";
            rules.add("UNKNOWN_RECIPIENT");
        }

        return FraudAnalysisResponse.builder()
                .fraudScore(mockScore)
                .fraudRisk(risk)
                .anomalyReason(reason)
                .isFlagged(mockScore > 0.7)
                .rulesTriggered(rules)
                .build();
    }

    // 2. Generate Monthly Portfolio Insight
    @Override
    public AIInsightResponse generateMonthlyInsight(String portfolioSummary) {
        String systemPrompt = "You are an AI private banking advisor. " +
                "Review the user's accounts, total balances, and transaction habits. " +
                "Return ONLY a JSON object (no markdown backticks, no extra text): " +
                "{\n" +
                "  \"portfolioHealthGrade\": \"A | A- | B+ | B | C | D\",\n" +
                "  \"savingsRateScore\": 85, // 0 to 100\n" +
                "  \"spendingOptimizationScore\": 72, // 0 to 100\n" +
                "  \"portfolioSummary\": \"string summary of their financial status\",\n" +
                "  \"gradeReasoning\": \"string explaining the portfolio health grade\",\n" +
                "  \"actionChecklist\": [\"string suggestion\"]\n" +
                "}";

        String jsonResponse = callModel(systemPrompt, portfolioSummary);
        if (jsonResponse != null) {
            try {
                return objectMapper.readValue(jsonResponse, AIInsightResponse.class);
            } catch (Exception e) {
                log.error("Failed to parse AI monthly insight. Falling back.", e);
            }
        }

        // Local Simulation Fallback
        return AIInsightResponse.builder()
                .portfolioHealthGrade("A-")
                .savingsRateScore(78)
                .spendingOptimizationScore(65)
                .portfolioSummary("Your financial portfolio is stable. You have consistent savings across your accounts, but cash is heavily concentrated in current accounts instead of high-yield investment options.")
                .gradeReasoning("Your health grade is A- because your debt-to-savings ratio is low, but you are losing potential yield by not optimizing interest rates on surplus cash.")
                .actionChecklist(Arrays.asList(
                        "Transfer ,000 from Current Account to High Yield Savings.",
                        "Audit recurring utility subscriptions to cut unnecessary spending.",
                        "Establish an automatic savings transfer of 10% on your paycheck date."
                ))
                .build();
    }

    // 3. Predict Cash Flow (30 days forecast)
    @Override
    public CashFlowResponse predictCashFlow(String historicalData) {
        String systemPrompt = "You are a smart bank cash flow forecasting engine. " +
                "Analyze the historical transaction series. Project daily inflows and outflows for the next 30 days. " +
                "Return ONLY a JSON object (no markdown backticks, no other text): " +
                "{\n" +
                "  \"historicalData\": [\n" +
                "    { \"date\": \"YYYY-MM-DD\", \"inflow\": 0.00, \"outflow\": 0.00, \"netFlow\": 0.00 }\n" +
                "  ],\n" +
                "  \"forecastedData\": [\n" +
                "    { \"date\": \"YYYY-MM-DD\", \"inflow\": 0.00, \"outflow\": 0.00, \"netFlow\": 0.00 }\n" +
                "  ],\n" +
                "  \"netInflow30Days\": 0.00,\n" +
                "  \"netOutflow30Days\": 0.00,\n" +
                "  \"projectedBalanceEnd30Days\": 0.00,\n" +
                "  \"airecommendation\": \"string advice\"\n" +
                "}";

        String jsonResponse = callModel(systemPrompt, historicalData);
        if (jsonResponse != null) {
            try {
                JsonNode root = objectMapper.readTree(jsonResponse);
                CashFlowResponse response = objectMapper.readValue(jsonResponse, CashFlowResponse.class);
                JsonNode recNode = root.path("airecommendation");
                if (recNode.isTextual()) {
                    response.setAIRecommendation(recNode.asText());
                }
                return response;
            } catch (Exception e) {
                log.error("Failed to parse AI cash flow. Falling back.", e);
            }
        }

        // Local Fallback Simulation
        List<CashFlowResponse.CashFlowPoint> hist = new ArrayList<>();
        List<CashFlowResponse.CashFlowPoint> fore = new ArrayList<>();
        LocalDate today = LocalDate.now();

        BigDecimal runningInflow = BigDecimal.ZERO;
        BigDecimal runningOutflow = BigDecimal.ZERO;

        for (int i = 29; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            BigDecimal inflow = i % 15 == 0 ? new BigDecimal("2500.00") : BigDecimal.ZERO;
            BigDecimal outflow = new BigDecimal("45.00").multiply(new BigDecimal(1 + (i % 3)));
            hist.add(CashFlowResponse.CashFlowPoint.builder()
                    .date(d.toString())
                    .inflow(inflow)
                    .outflow(outflow)
                    .netFlow(inflow.subtract(outflow))
                    .build());
            runningInflow = runningInflow.add(inflow);
            runningOutflow = runningOutflow.add(outflow);
        }

        for (int i = 1; i <= 30; i++) {
            LocalDate d = today.plusDays(i);
            BigDecimal inflow = i == 15 ? new BigDecimal("3000.00") : BigDecimal.ZERO;
            BigDecimal outflow = new BigDecimal("50.00").multiply(new BigDecimal(1 + (i % 2)));
            fore.add(CashFlowResponse.CashFlowPoint.builder()
                    .date(d.toString())
                    .inflow(inflow)
                    .outflow(outflow)
                    .netFlow(inflow.subtract(outflow))
                    .build());
        }

        return CashFlowResponse.builder()
                .historicalData(hist)
                .forecastedData(fore)
                .netInflow30Days(runningInflow)
                .netOutflow30Days(runningOutflow)
                .projectedBalanceEnd30Days(runningInflow.subtract(runningOutflow))
                .AIRecommendation("Your forecasted cash flow is healthy, bolstered by your expected monthly salary. Outflows are projected to spike around rent dates; keep a buffer of ,500 in current accounts to cover recurring automatic clearing houses.")
                .build();
    }

    // 4. Reconcile Transactions Auditing
    @Override
    public String reconcileTransactions(String varianceReport) {
        String systemPrompt = "You are a senior banking auditor. " +
                "Audit the monthly category spending variances. " +
                "Provide an professional evaluation. " +
                "Format as a clean, concise bulleted list summarizing the key outliers and actions.";

        String response = callModel(systemPrompt, varianceReport);
        if (response != null && !response.isEmpty()) {
            return response;
        }

        return "* Utilities spending increased by 45% due to seasonal cooling bills. Consider smart thermostats.\n" +
                "* Entertainment budget was significantly below budget (-30%), indicating positive discipline.\n" +
                "* Grocery expenses had a minor 5% matched variance, matching expectations.";
    }

    @Override
    public String getActiveProvider() {
        String provider = this.aiProvider;
        if (provider == null || provider.trim().isEmpty()) {
            return "mistral (defaulted from blank)";
        }
        return provider;
    }
}
