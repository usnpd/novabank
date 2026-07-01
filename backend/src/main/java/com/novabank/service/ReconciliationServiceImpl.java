package com.novabank.service;

import com.novabank.enums.TransactionCategory;
import com.novabank.enums.TransactionType;
import com.novabank.model.Transaction;
import com.novabank.model.User;
import com.novabank.payload.response.ReconciliationResponse;
import com.novabank.repository.TransactionRepository;
import com.novabank.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ReconciliationServiceImpl implements ReconciliationService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AIService aiService;

    @Override
    public ReconciliationResponse reconcileMonthlySpending(String email, String month1, String month2) {
        log.info("Reconciling months {} and {} for user {}", month1, month2, email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDate start1 = LocalDate.parse(month1 + "-01", formatter);
        LocalDate end1 = start1.plusMonths(1).minusDays(1);

        LocalDate start2 = LocalDate.parse(month2 + "-01", formatter);
        LocalDate end2 = start2.plusMonths(1).minusDays(1);

        List<Transaction> txns1 = transactionRepository.findByAccountUserIdAndCreatedAtBetween(
                user.getId(), start1.atStartOfDay(), end1.atTime(23, 59, 59));

        List<Transaction> txns2 = transactionRepository.findByAccountUserIdAndCreatedAtBetween(
                user.getId(), start2.atStartOfDay(), end2.atTime(23, 59, 59));

        Map<TransactionCategory, BigDecimal> debits1 = groupDebitsByCategory(txns1);
        Map<TransactionCategory, BigDecimal> debits2 = groupDebitsByCategory(txns2);

        List<ReconciliationResponse.CategoryReconciliationDetail> details = new ArrayList<>();

        for (TransactionCategory cat : TransactionCategory.values()) {
            BigDecimal amt1 = debits1.getOrDefault(cat, BigDecimal.ZERO);
            BigDecimal amt2 = debits2.getOrDefault(cat, BigDecimal.ZERO);

            if (amt1.compareTo(BigDecimal.ZERO) == 0 && amt2.compareTo(BigDecimal.ZERO) == 0) {
                continue;
            }

            BigDecimal variance = amt2.subtract(amt1);
            double varPct = 0.0;
            String status = "MATCHED";

            if (amt1.compareTo(BigDecimal.ZERO) > 0) {
                varPct = variance.multiply(new BigDecimal("100"))
                        .divide(amt1, 2, RoundingMode.HALF_UP).doubleValue();
                if (Math.abs(varPct) > 15.0) {
                    status = "DISCREPANCY";
                }
            } else {
                status = "NEW";
                varPct = 100.0;
            }

            String explanation = String.format("Variance of %s%.2f%% compared to last month.",
                    varPct >= 0 ? "+" : "", varPct);

            details.add(ReconciliationResponse.CategoryReconciliationDetail.builder()
                    .category(cat.name())
                    .month1Amount(amt1)
                    .month2Amount(amt2)
                    .variance(variance)
                    .variancePercentage(varPct)
                    .status(status)
                    .explanation(explanation)
                    .build());
        }

        String auditPrompt = details.stream()
                .map(d -> String.format("{category:\"%s\", month1: %s, month2: %s, variance: %s, status:\"%s\"}",
                        d.getCategory(), d.getMonth1Amount(), d.getMonth2Amount(), d.getVariance(), d.getStatus()))
                .collect(Collectors.joining(", ", "[", "]"));

        String aiAuditReport = aiService.reconcileTransactions(auditPrompt);

        return ReconciliationResponse.builder()
                .month1(month1)
                .month2(month2)
                .categories(details)
                .aiAuditReport(aiAuditReport)
                .build();
    }

    private Map<TransactionCategory, BigDecimal> groupDebitsByCategory(List<Transaction> txns) {
        Map<TransactionCategory, BigDecimal> map = new HashMap<>();
        for (Transaction t : txns) {
            if (t.getTransactionType() == TransactionType.DEBIT) {
                map.put(t.getCategory(), map.getOrDefault(t.getCategory(), BigDecimal.ZERO).add(t.getAmount()));
            }
        }
        return map;
    }
}
