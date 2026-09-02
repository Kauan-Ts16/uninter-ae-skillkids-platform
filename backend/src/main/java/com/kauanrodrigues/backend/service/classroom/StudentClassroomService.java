package com.kauanrodrigues.backend.service.classroom;

import com.kauanrodrigues.backend.dto.classroom.ClassroomResponseDto;
import com.kauanrodrigues.backend.dto.classroom.StudentJoinClassroomDto;
import com.kauanrodrigues.backend.exception.ExceptionGeneric;
import com.kauanrodrigues.backend.mapper.ClassroomMapper;
import com.kauanrodrigues.backend.model.ClassroomModel;
import com.kauanrodrigues.backend.model.UserModel;
import com.kauanrodrigues.backend.repository.ClassroomRepository;
import com.kauanrodrigues.backend.security.CurrentUserService;
import com.kauanrodrigues.backend.service.user.UserService;
import com.kauanrodrigues.backend.validation.user.UserValidator;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StudentClassroomService {

    private final ClassroomRepository classroomRepository;

    private final UserService userService;

    private final CurrentUserService currentUserService;

    private final UserValidator userValidator;


    @Transactional
    public ClassroomResponseDto join(StudentJoinClassroomDto dto) {
        UUID studentId = currentUserService.getCurrentUserId();

        UserModel student = userService.findModelByIdAndActive(studentId, true);

        userValidator.validateStudentWithoutClassroom(student);

        if (dto.joinCode() == null || dto.joinCode().isBlank()) {
            throw new ExceptionGeneric("Invalid join code!", "The classroom join code is required.", HttpStatus.BAD_REQUEST);
        }

        ClassroomModel classroom = classroomRepository.findByJoinCodeIgnoreCaseAndActive(dto.joinCode().trim(), true)
                .orElseThrow(() -> new ExceptionGeneric("Classroom not found!", "No active classroom was found with the provided join code.", HttpStatus.NOT_FOUND));

        student.setClassroom(classroom);

        return ClassroomMapper.toResponse(classroom);
    }

    @Transactional
    public void leave() {
        UUID studentId = currentUserService.getCurrentUserId();

        UserModel student = userService.findModelByIdAndActive(studentId, true);

        userValidator.validateStudent(student);

        if (student.getClassroom() == null) {
            throw new ExceptionGeneric("Classroom not found!", "The student is not assigned to a classroom.", HttpStatus.NOT_FOUND);
        }

        student.setClassroom(null);
    }

    public ClassroomResponseDto findCurrentClassroom() {
        UUID studentId = currentUserService.getCurrentUserId();

        UserModel student = userService.findModelByIdAndActive(studentId, true);

        if (student.getClassroom() == null) {
            throw new ExceptionGeneric("Classroom not found!", "The student is not assigned to a classroom.", HttpStatus.NOT_FOUND);
        }

        return ClassroomMapper.toResponse(student.getClassroom());
    }

}
