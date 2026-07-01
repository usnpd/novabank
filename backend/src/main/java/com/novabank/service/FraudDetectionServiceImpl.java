package com.novabank.service;

import com.novabank.enums.AlertType;
import com.novabank.model.Alert;
import com.novabank.model.Transaction;
import com.novabank.payload.response.FraudAnalysisResponse;
import com.novabank.repository.AlertRepository;
import com.novabank.repository.TransactionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.concurrent.CompletableFuture;

@Service
@Slf4j
public class FraudDetectionServiceImpl implements FraudDetectionService {

    @Autowired
    private AIService aiService;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private AlertRepository alertRepository;

    @Override
    @Transactional
    public void scanAndFlagTransactionSync(Long transactionId) {
        log.info("Scanning transaction ID: {} for fraud...", transactionId);
        Transaction transaction = transactionRepository.findById(transactionId).orElse(null);
        if (transaction == null) {
            log.error("Transaction not found for scanning: {}", transactionId);
            return;
        }

        String details = String.format("id=%d, referenceNumber=%s, amount=%s, transactionType=%s, category=%s, description=%s",
                transaction.getId(),
                transaction.getReferenceNumber(),
                transaction.getAmount().toString(),
                transaction.getTransactionType().name(),
                transaction.getCategory().name(),
                transaction.getDescription());

        try {
            FraudAnalysisResponse response = aiService.analyzeTransaction(details);
            
            transaction.setFraudScore(response.getFraudScore());
            transaction.setFraudRisk(response.getFraudRisk());
            transaction.setAnomalyReason(response.getAnomalyReason());
            transactionRepository.save(transaction);

            log.info("Transaction {} fraud risk: {}, score: {}", transaction.getReferenceNumber(), response.getFraudRisk(), response.getFraudScore());

            if (response.getFraudScore() > 0.7) {
                Alert alert = Alert.builder()
                        .alertType(AlertType.FRAUD_SUSPECTED)
                        .message("CRITICAL: Suspicious activity detected on transaction " + transaction.getReferenceNumber() + ". AI Flagged reason: " + response.getAnomalyReason())
                        .severity("CRITICAL")
                        .transaction(transaction)
                        .user(transaction.getAccount().getUser())
                        .build();
                alertRepository.save(alert);
                log.warn("CRITICAL: Fraud suspected alert created for user {}", transaction.getAccount().getUser().getEmail());
            }

        } catch (Exception e) {
            log.error("Failed to run fraud scan on transaction: {}", transactionId, e);
        }
    }

    @Override
    public void scanTransactionAsync(Long transactionId) {
        CompletableFuture.runAsync(() -> {
            try {
                Thread.sleep(100);
                scanAndFlagTransactionSync(transactionId);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
    }
}
