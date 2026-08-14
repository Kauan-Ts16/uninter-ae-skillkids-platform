package com.kauanrodrigues.backend.exception;

import java.time.LocalDateTime;

public record ErrorResponse(
        String title,
        String message,
        int status,
        LocalDateTime time
) {

    public ErrorResponse(String title, String message, int status) {
        this(title, message, status, LocalDateTime.now());
    }
}
