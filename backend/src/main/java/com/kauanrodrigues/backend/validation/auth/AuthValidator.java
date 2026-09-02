package com.kauanrodrigues.backend.validation.auth;

import com.kauanrodrigues.backend.dto.auth.LoginPostDto;
import com.kauanrodrigues.backend.dto.auth.RegisterPostDto;
import com.kauanrodrigues.backend.enums.RoleName;
import com.kauanrodrigues.backend.exception.ExceptionGeneric;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Component
public class AuthValidator {

    public void validateForRegister(RegisterPostDto dto) {
        if (dto.role() == null) {
            throw new ExceptionGeneric("Invalid role!", "The role is required.", HttpStatus.BAD_REQUEST);
        }

        if (dto.role() != RoleName.STUDENT && dto.role() != RoleName.TEACHER) {
            throw new ExceptionGeneric("Invalid role!", "Public registration is allowed only for STUDENT or TEACHER.", HttpStatus.BAD_REQUEST);
        }
    }

    public void validateLogin(LoginPostDto dto) {
        if (dto.email() == null) {
            throw new ExceptionGeneric("Invalid email!", "The email is required.", HttpStatus.BAD_REQUEST);
        }

        if (dto.email().isBlank()) {
            throw new ExceptionGeneric("Invalid email!", "The email cannot be blank.", HttpStatus.BAD_REQUEST);
        }

        if (dto.password() == null) {
            throw new ExceptionGeneric("Invalid password!", "The password is required.", HttpStatus.BAD_REQUEST);
        }

        if (dto.password().isBlank()) {
            throw new ExceptionGeneric("Invalid password!", "The password cannot be blank.", HttpStatus.BAD_REQUEST);
        }
    }

}
