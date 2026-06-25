package com.novabank.repository;

import com.novabank.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByAccountIdOrderByCreatedAtDesc(Long accountId);
    List<Transaction> findByAccountUserIdOrderByCreatedAtDesc(Long userId);
    List<Transaction> findByAccountUserIdAndCreatedAtBetween(Long userId, LocalDateTime start, LocalDateTime end);
}
