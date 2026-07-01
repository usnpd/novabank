package com.novabank.service;

import com.novabank.model.Transaction;
import com.novabank.model.User;
import com.novabank.payload.response.CashFlowResponse;
import com.novabank.repository.TransactionRepository;
import com.novabank.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class CashFlowServiceImpl implements CashFlowService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AIService aiService;

    @Override
    public CashFlowResponse predictCashFlow(String email) {
        log.info("Calculating cash flow projections for user: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        LocalDateTime start = LocalDateTime.now().minusDays(30);
        LocalDateTime end = LocalDateTime.now();
        List<Transaction> recentTxns = transactionRepository.findByAccountUserIdAndCreatedAtBetween(user.getId(), start, end);

        String historicalString = recentTxns.stream()
                .map(t -> String.format("{date:\"%s\",type:\"%s\",amount:%s,category:\"%s\"}",
                        t.getCreatedAt().toLocalDate().toString(),
                        t.getTransactionType().name(),
                        t.getAmount().toString(),
                        t.getCategory().name()))
                .collect(Collectors.joining(", ", "[", "]"));

        return aiService.predictCashFlow(historicalString);
    }
}
