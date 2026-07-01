package com.novabank.service;

import com.novabank.payload.request.TransactionRequest;
import com.novabank.payload.response.TransactionResponse;

import java.math.BigDecimal;
import java.util.List;

public interface TransactionService {
    TransactionResponse addTransaction(TransactionRequest request, String email);
    List<TransactionResponse> transferBetweenAccounts(String sourceAccNumber, String targetAccNumber, BigDecimal amount, String description, String email);
    List<TransactionResponse> getTransactionsForAccount(Long accountId, String email);
    List<TransactionResponse> getTransactionsForUser(String email);
}
