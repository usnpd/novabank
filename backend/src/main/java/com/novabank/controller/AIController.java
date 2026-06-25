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

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai")
@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AIController {

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
    public ResponseEntity<CashFlowResponse> getCashFlowProjections() {
        String email = getAuthenticatedUserEmail();
        CashFlowResponse response = cashFlowService.predictCashFlow(email);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reconcile")
    public ResponseEntity<ReconciliationResponse> reconcileStatement(
            @RequestParam String month1,
            @RequestParam String month2) {
        String email = getAuthenticatedUserEmail();
        ReconciliationResponse response = reconciliationService.reconcileMonthlySpending(email, month1, month2);
        return ResponseEntity.ok(response);
    }
}
