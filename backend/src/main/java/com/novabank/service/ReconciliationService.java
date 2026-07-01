package com.novabank.service;

import com.novabank.payload.response.ReconciliationResponse;

public interface ReconciliationService {
    ReconciliationResponse reconcileMonthlySpending(String email, String month1, String month2);
}
