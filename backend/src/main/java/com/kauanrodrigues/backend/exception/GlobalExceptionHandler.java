package com.kauanrodrigues.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
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

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleHttpMessageNotReadable(
            HttpMessageNotReadableException exception
    ) {

        ErrorResponse response = new ErrorResponse(
                "Invalid request!",
                "The request body contains an invalid value.",
                HttpStatus.BAD_REQUEST.value()
        );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }
}
