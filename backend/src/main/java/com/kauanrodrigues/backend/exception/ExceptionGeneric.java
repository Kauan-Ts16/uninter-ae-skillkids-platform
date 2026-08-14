package com.kauanrodrigues.backend.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class ExceptionGeneric extends RuntimeException {

    private final String title;
    private final HttpStatus status;


    public ExceptionGeneric(
            String title,
            String message,
            HttpStatus status
    ) {
        super(message);

        this.title = title;
        this.status = status;
    }
}
