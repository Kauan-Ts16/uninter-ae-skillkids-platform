package com.kauanrodrigues.backend.validation.user;

import com.kauanrodrigues.backend.dto.user.UserPasswordPatchDto;
import com.kauanrodrigues.backend.dto.user.UserPatchDto;
import com.kauanrodrigues.backend.dto.user.UserPostDto;
import com.kauanrodrigues.backend.enums.RoleName;
import com.kauanrodrigues.backend.exception.ExceptionGeneric;
import com.kauanrodrigues.backend.model.UserModel;
import com.kauanrodrigues.backend.repository.ClassroomRepository;
import com.kauanrodrigues.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class UserValidator {

    private final UserRepository repository;

    private final ClassroomRepository classroomRepository;

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

    public void validateForDelete(UserModel user) {
        if (classroomRepository.existsByTeacher_Id(user.getId())) {
            throw new ExceptionGeneric("User cannot be deleted!", "The user is assigned as teacher to a classroom.", HttpStatus.CONFLICT);
        }
    }

    public void validatePasswordChange(UserPasswordPatchDto dto) {
        formatValidator.validatePassword(dto.password());
    }

    public void validateStudent(UserModel student) {
        if (student.getRole().getRoleName() != RoleName.STUDENT) {
            throw new ExceptionGeneric("Invalid student!", "The selected user must have Student role.", HttpStatus.BAD_REQUEST);
        }
    }

    public void validateClassroom(RoleName roleName, UUID classroomId) {
        if (classroomId != null && roleName != RoleName.STUDENT) {
            throw new ExceptionGeneric("Invalid classroom!", "Only users with STUDENT role can be assigned to a classroom.", HttpStatus.BAD_REQUEST);
        }
    }

    public void validateClassroomId(UUID classroomId) {
        if (classroomId == null) {
            throw new ExceptionGeneric("Invalid classroom!", "classroom id is required.", HttpStatus.BAD_REQUEST);
        }
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
