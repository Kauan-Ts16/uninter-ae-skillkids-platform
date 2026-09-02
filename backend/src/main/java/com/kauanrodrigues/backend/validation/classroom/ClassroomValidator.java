package com.kauanrodrigues.backend.validation.classroom;

import com.kauanrodrigues.backend.dto.classroom.ClassroomPatchDto;
import com.kauanrodrigues.backend.dto.classroom.ClassroomPostDto;
import com.kauanrodrigues.backend.dto.classroom.TeacherClassroomPostDto;
import com.kauanrodrigues.backend.exception.ExceptionGeneric;
import com.kauanrodrigues.backend.model.ClassroomModel;
import com.kauanrodrigues.backend.repository.ClassroomRepository;
import com.kauanrodrigues.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ClassroomValidator {

    private final ClassroomRepository repository;

    private final UserRepository userRepository;


    public void validateForCreate(ClassroomPostDto dto) {
        validateName(dto.name());
        validateUniqueName(dto.name());
    }

    public void validateForTeacherCreate(TeacherClassroomPostDto dto) {
        validateName(dto.name());
        validateUniqueName(dto.name());
    }

    public void validateForUpdate(ClassroomPatchDto dto, ClassroomModel classroom) {
        validateName(dto.name());

        if (!dto.name().equalsIgnoreCase(classroom.getName())) {
            validateUniqueName(dto.name());
        }
    }

    public void validateForDelete(ClassroomModel classroom) {
        if (userRepository.existsByClassroom_Id(classroom.getId())) {
            throw new ExceptionGeneric("Classroom cannot be deleted!", "The classroom has students assigned to it.", HttpStatus.CONFLICT);
        }
    }

    public void validateTeacherId(UUID teacherId) {
        if (teacherId == null) {
            throw new ExceptionGeneric("Invalid teacher!", "Teacher id is required.", HttpStatus.BAD_REQUEST);
        }
    }

    private void validateName(String name) {
        if (name == null) {
            throw new ExceptionGeneric("Invalid classroom name!", "The classroom name is required.", HttpStatus.BAD_REQUEST);
        }

        if (name.isBlank()) {
            throw new ExceptionGeneric("Invalid classroom name!", "The classroom name cannot be blank.", HttpStatus.BAD_REQUEST);
        }

        if (name.length() < 3 || name.length() > 50) {
            throw new ExceptionGeneric("Invalid classroom name!", "The classroom name must be between 3 and 50 characters.", HttpStatus.BAD_REQUEST);
        }
    }

    private void validateUniqueName(String name) {
        if (repository.existsByNameIgnoreCase(name)) {
            throw new ExceptionGeneric("Classroom name already exists!", "A classroom with this name already exists.", HttpStatus.CONFLICT);
        }
    }

}
