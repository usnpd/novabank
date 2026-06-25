package com.novabank.exception;

import org.springframework.http.HttpStatus;

public class APIException extends RuntimeException {
    private static final long serialVersionUID = 1L;

    private final HttpStatus status;

    public APIException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
