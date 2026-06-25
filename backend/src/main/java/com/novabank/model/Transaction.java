package com.novabank.model;

import com.novabank.enums.TransactionCategory;
import com.novabank.enums.TransactionType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"account"})
@ToString(exclude = {"account"})
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String referenceNumber;

    @Column(nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TransactionType transactionType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TransactionCategory category;

    @Column(length = 500)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    private String counterPartyAccount;

    @Builder.Default
    private Boolean isRecurring = false;

    @Builder.Default
    private Double fraudScore = 0.0;

    @Column(length = 20)
    private String fraudRisk;

    @Column(length = 1000)
    private String anomalyReason;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.isRecurring == null) {
            this.isRecurring = false;
        }
        if (this.fraudScore == null) {
            this.fraudScore = 0.0;
        }
    }
}
