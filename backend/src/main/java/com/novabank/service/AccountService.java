package com.novabank.service;

import com.novabank.payload.request.AccountRequest;
import com.novabank.payload.response.AccountResponse;
import com.novabank.payload.response.AccountSummaryResponse;

import java.util.List;

public interface AccountService {
    AccountResponse createAccount(AccountRequest request, String email);
    List<AccountSummaryResponse> getAccountSummaries(String email);
    List<AccountResponse> getAllAccountsForUser(String email);
    AccountResponse getAccountById(Long accountId, String email);
}
