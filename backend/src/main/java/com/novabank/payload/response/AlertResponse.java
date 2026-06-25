package com.novabank.payload.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertResponse {
    private Long id;
    private String alertType;
    private String message;
    private String severity;
    private Boolean isRead;
    private String transactionReference;
    private LocalDateTime createdAt;
}
