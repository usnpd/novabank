package com.novabank.service;

public interface FraudDetectionService {
    void scanAndFlagTransactionSync(Long transactionId);
    void scanTransactionAsync(Long transactionId);
}
