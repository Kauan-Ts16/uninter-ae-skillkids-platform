package com.kauanrodrigues.backend.validation.user;

import com.kauanrodrigues.backend.dto.user.UserPasswordPatchDto;
import com.kauanrodrigues.backend.dto.user.UserPatchDto;
import com.kauanrodrigues.backend.dto.user.UserPostDto;
import com.kauanrodrigues.backend.enums.RoleName;
import com.kauanrodrigues.backend.exception.ExceptionGeneric;
import com.kauanrodrigues.backend.model.UserModel;
import com.kauanrodrigues.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserValidator {

    private final UserRepository repository;
    private final UserFormatValidator formatValidator;


    public void validateForCreate(UserPostDto dto) {
        formatValidator.validateNameForCreate(dto.name());
        formatValidator.validateEmailForCreate(dto.email());
        formatValidator.validatePassword(dto.password());

        validateRoleForCreate(dto.role());
        validateUniqueEmail(dto.email());
    }

    public void validateForUpdate(UserModel user, UserPatchDto dto) {
        validateUpdateFields(dto);

        formatValidator.validateNameForUpdate(dto.name());
        formatValidator.validateEmailForUpdate(dto.email());

        if (dto.email() != null && !user.getEmail().equalsIgnoreCase(dto.email())) {
            validateUniqueEmail(dto.email());
        }
    }

    public void validatePasswordChange(UserPasswordPatchDto dto) {
        formatValidator.validatePassword(dto.password());
    }

    private void validateUpdateFields(UserPatchDto dto) {
        if (dto.name() == null && dto.email() == null) {
            throw new ExceptionGeneric("No fields provided!", "Provide at least one field to update.", HttpStatus.BAD_REQUEST);
        }
    }

    private void validateRoleForCreate(RoleName role) {
        if (role == null) {
            throw new ExceptionGeneric("Invalid user role!", "The user role is required.", HttpStatus.BAD_REQUEST);
        }
    }

    private void validateUniqueEmail(String email) {
        if (repository.existsByEmailIgnoreCase(email)) {
            throw new ExceptionGeneric("Email already exists!", "A user with this email already exists.", HttpStatus.CONFLICT);
        }
    }

}
