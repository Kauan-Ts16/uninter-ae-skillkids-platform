package com.kauanrodrigues.backend.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ExceptionGeneric.class)
    public ResponseEntity<ErrorResponse> handleExceptionGeneric(
            ExceptionGeneric exception
    ) {

        ErrorResponse response = new ErrorResponse(
                exception.getTitle(),
                exception.getMessage(),
                exception.getStatus().value()
        );

        return ResponseEntity
                .status(exception.getStatus())
                .body(response);
    }
}
