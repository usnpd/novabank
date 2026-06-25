package com.novabank.controller;

import com.novabank.payload.request.AccountRequest;
import com.novabank.payload.response.AccountResponse;
import com.novabank.service.AccountService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AccountController {

    @Autowired
    private AccountService accountService;

    private String getAuthenticatedUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @PostMapping
    public ResponseEntity<AccountResponse> createAccount(@Valid @RequestBody AccountRequest request) {
        String email = getAuthenticatedUserEmail();
        AccountResponse response = accountService.createAccount(request, email);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<AccountResponse>> getAccounts() {
        String email = getAuthenticatedUserEmail();
        List<AccountResponse> response = accountService.getAllAccountsForUser(email);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccountResponse> getAccountById(@PathVariable Long id) {
        String email = getAuthenticatedUserEmail();
        AccountResponse response = accountService.getAccountById(id, email);
        return ResponseEntity.ok(response);
    }
}
