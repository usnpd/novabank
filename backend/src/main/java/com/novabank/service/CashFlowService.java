package com.novabank.service;

import com.novabank.payload.response.CashFlowResponse;

public interface CashFlowService {
    CashFlowResponse predictCashFlow(String email);
}
