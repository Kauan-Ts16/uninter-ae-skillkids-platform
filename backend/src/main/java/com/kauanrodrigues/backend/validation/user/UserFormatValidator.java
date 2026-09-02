package com.kauanrodrigues.backend.validation.user;

import com.kauanrodrigues.backend.exception.ExceptionGeneric;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Component
public class UserFormatValidator {

    private static final String EMAIL_REGEX = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";


    public void validateNameForCreate(String name) {
        if (name == null) {
            throw new ExceptionGeneric("Invalid user name!", "The user name is required.", HttpStatus.BAD_REQUEST);
        }

        validateName(name);
    }

    public void validateNameForUpdate(String name) {
        if (name != null) {
            validateName(name);
        }
    }

    public void validateEmailForCreate(String email) {
        if (email == null) {
            throw new ExceptionGeneric("Invalid user email!", "The user email is required.", HttpStatus.BAD_REQUEST);
        }

        validateEmail(email);
    }

    public void validateEmailForUpdate(String email) {
        if (email != null) {
            validateEmail(email);
        }
    }

    public void validatePassword(String password) {
        if (password == null) {
            throw new ExceptionGeneric("Invalid user password!", "The user password is required.", HttpStatus.BAD_REQUEST);
        }

        if (password.isBlank()) {
            throw new ExceptionGeneric("Invalid user password!", "The user password cannot be blank.", HttpStatus.BAD_REQUEST);
        }

        if (password.length() < 6 || password.length() > 50) {
            throw new ExceptionGeneric("Invalid user password!", "The user password must be between 6 and 50 characters.", HttpStatus.BAD_REQUEST);
        }
    }

    private void validateName(String name) {
        if (name.isBlank()) {
            throw new ExceptionGeneric("Invalid user name!", "The user name cannot be blank.", HttpStatus.BAD_REQUEST);
        }

        if (name.length() < 3 || name.length() > 100) {
            throw new ExceptionGeneric("Invalid user name!", "The user name must be between 3 and 100 characters.", HttpStatus.BAD_REQUEST);
        }
    }

    private void validateEmail(String email) {
        if (email.isBlank()) {
            throw new ExceptionGeneric("Invalid user email!", "The user email cannot be blank.", HttpStatus.BAD_REQUEST);
        }

        if (!email.matches(EMAIL_REGEX)) {
            throw new ExceptionGeneric("Invalid user email!", "The user email format is invalid.", HttpStatus.BAD_REQUEST);
        }

        if (email.length() < 6 || email.length() > 254) {
            throw new ExceptionGeneric("Invalid user email!", "The user email must be between 6 and 254 characters.", HttpStatus.BAD_REQUEST);
        }
    }

}
