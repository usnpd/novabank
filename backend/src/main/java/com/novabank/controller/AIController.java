package com.novabank.controller;

import com.novabank.payload.response.AIInsightResponse;
import com.novabank.payload.response.CashFlowResponse;
import com.novabank.payload.response.ReconciliationResponse;
import com.novabank.service.AccountService;
import com.novabank.service.CashFlowService;
import com.novabank.service.AIService;
import com.novabank.service.ReconciliationService;
import com.novabank.payload.response.AccountSummaryResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import org.springframework.context.ApplicationContext;
import org.springframework.ai.chat.model.ChatModel;
import java.util.Map;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AIController {

    @Autowired
    private ApplicationContext applicationContext;

    @Autowired
    private AIService aiService;

    @Autowired
    private CashFlowService cashFlowService;

    @Autowired
    private ReconciliationService reconciliationService;

    @Autowired
    private AccountService accountService;

    private String getAuthenticatedUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @GetMapping("/insights")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<AIInsightResponse> getInsights() {
        String email = getAuthenticatedUserEmail();
        
        // Build portfolio summary string to send as context to Gemini
        List<AccountSummaryResponse> summaries = accountService.getAccountSummaries(email);
        String summaryContext = summaries.stream()
                .map(s -> String.format("{accountName:\"%s\",type:\"%s\",balance:%s}",
                        s.getAccountName(), s.getAccountType(), s.getBalance().toString()))
                .collect(Collectors.joining(", ", "Accounts portfolio: [", "]"));

        AIInsightResponse response = aiService.generateMonthlyInsight(summaryContext);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/cashflow")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<CashFlowResponse> getCashFlowProjections() {
        String email = getAuthenticatedUserEmail();
        CashFlowResponse response = cashFlowService.predictCashFlow(email);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reconcile")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ReconciliationResponse> reconcileStatement(
            @RequestParam String month1,
            @RequestParam String month2) {
        String email = getAuthenticatedUserEmail();
        ReconciliationResponse response = reconciliationService.reconcileMonthlySpending(email, month1, month2);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/test")
    public ResponseEntity<java.util.Map<String, Object>> testAI() {
        java.util.Map<String, Object> status = new java.util.HashMap<>();
        String email = getAuthenticatedUserEmail();
        status.put("user", email);
        
        String configuredProvider = System.getenv("NOVABANK_AI_PROVIDER") != null ? System.getenv("NOVABANK_AI_PROVIDER") : "mistral";
        status.put("configuredProvider", configuredProvider);
        
        String mistralKey = System.getenv("MISTRAL_API_KEY");
        String geminiKey = System.getenv("GEMINI_API_KEY");
        status.put("mistralKeyPresent", mistralKey != null && !mistralKey.trim().isEmpty());
        status.put("geminiKeyPresent", geminiKey != null && !geminiKey.trim().isEmpty());
        
        try {
            long startTime = System.currentTimeMillis();
            com.novabank.payload.response.FraudAnalysisResponse response = aiService.analyzeTransaction("id=1, referenceNumber=TEST, amount=100.00, transactionType=DEBIT, category=GROCERIES, description=test");
            long duration = System.currentTimeMillis() - startTime;
            
            status.put("status", "SUCCESS");
            status.put("responseTimeMs", duration);
            status.put("anomalyReason", response.getAnomalyReason());
            boolean isMock = "No anomalous patterns identified by local checks.".equals(response.getAnomalyReason()) || "Large transaction size flag triggered.".equals(response.getAnomalyReason());
            status.put("isMockFallback", isMock);
        } catch (Exception e) {
            status.put("status", "ERROR");
            status.put("errorMessage", e.getMessage());
        }

        try {
            Map<String, ChatModel> chatModels = applicationContext.getBeansOfType(ChatModel.class);
            ChatModel activeModel = null;
            
            for (Map.Entry<String, ChatModel> entry : chatModels.entrySet()) {
                String beanName = entry.getKey().toLowerCase();
                if (configuredProvider.equalsIgnoreCase("mistral") && beanName.contains("mistral")) {
                    activeModel = entry.getValue();
                } else if (configuredProvider.equalsIgnoreCase("google") && (beanName.contains("google") || beanName.contains("genai"))) {
                    activeModel = entry.getValue();
                }
            }
            if (activeModel == null && !chatModels.isEmpty()) {
                activeModel = chatModels.values().iterator().next();
            }
            
            if (activeModel != null) {
                status.put("resolvedModelBean", activeModel.getClass().getName());
                long startCall = System.currentTimeMillis();
                String raw = activeModel.call("Respond with only the word OK");
                status.put("rawCallResult", raw);
                status.put("callTimeMs", System.currentTimeMillis() - startCall);
            } else {
                status.put("resolvedModelBean", "NONE");
            }
        } catch (Exception e) {
            status.put("directCallError", e.toString());
            java.io.StringWriter sw = new java.io.StringWriter();
            e.printStackTrace(new java.io.PrintWriter(sw));
            status.put("directCallStackTrace", sw.toString());
        }
        
        return ResponseEntity.ok(status);
    }
}
