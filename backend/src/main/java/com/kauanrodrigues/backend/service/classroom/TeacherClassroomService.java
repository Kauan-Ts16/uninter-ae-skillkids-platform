package com.kauanrodrigues.backend.service.classroom;

import com.kauanrodrigues.backend.dto.classroom.ClassroomResponseDto;
import com.kauanrodrigues.backend.dto.classroom.TeacherClassroomPostDto;
import com.kauanrodrigues.backend.dto.user.TeacherStudentResponseDto;
import com.kauanrodrigues.backend.enums.RoleName;
import com.kauanrodrigues.backend.exception.ExceptionGeneric;
import com.kauanrodrigues.backend.mapper.ClassroomMapper;
import com.kauanrodrigues.backend.mapper.UserMapper;
import com.kauanrodrigues.backend.model.ClassroomModel;
import com.kauanrodrigues.backend.model.UserModel;
import com.kauanrodrigues.backend.repository.ClassroomRepository;
import com.kauanrodrigues.backend.repository.UserRepository;
import com.kauanrodrigues.backend.security.CurrentUserService;
import com.kauanrodrigues.backend.service.user.UserService;
import com.kauanrodrigues.backend.validation.classroom.ClassroomValidator;
import com.kauanrodrigues.backend.validation.user.UserValidator;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TeacherClassroomService {

    private final ClassroomRepository classroomRepository;

    private final UserRepository userRepository;

    private final UserService userService;

    private final CurrentUserService currentUserService;

    private final ClassroomJoinCodeService joinCodeService;

    private final ClassroomValidator validator;

    private final UserValidator userValidator;


    @Transactional
    public ClassroomResponseDto save(TeacherClassroomPostDto dto) {
        UUID teacherId = currentUserService.getCurrentUserId();

        UserModel teacher = userService.findModelByIdAndActive(teacherId, true);

        userValidator.validateTeacher(teacher);
        validator.validateForTeacherCreate(dto);

        ClassroomModel classroom = ClassroomMapper.toModel(dto, teacher);

        classroom.setJoinCode(joinCodeService.generateJoinCode());

        classroom = classroomRepository.saveAndFlush(classroom);

        return ClassroomMapper.toResponse(classroom);
    }

    @Transactional
    public TeacherStudentResponseDto addStudent(UUID classroomId, UUID studentId) {
        ClassroomModel classroom = findModelById(classroomId);

        UserModel student = userService.findModelByIdAndActive(studentId, true);

        userValidator.validateStudentWithoutClassroom(student);

        student.setClassroom(classroom);

        return UserMapper.toTeacherStudentResponse(student);
    }

    @Transactional
    public void removeStudent(UUID classroomId, UUID studentId) {
        ClassroomModel classroom = findModelById(classroomId);

        UserModel student = userService.findModelById(studentId);

        userValidator.validateStudent(student);

        if (student.getClassroom() == null || !student.getClassroom().getId().equals(classroom.getId())) {
            throw new ExceptionGeneric("Student not assigned!", "The selected student is not assigned to this classroom.", HttpStatus.CONFLICT);
        }

        student.setClassroom(null);
    }

    public List<ClassroomResponseDto> findAll() {
        UUID teacherId = currentUserService.getCurrentUserId();

        return classroomRepository
                .findAllByTeacher_IdAndActive(teacherId, true)
                .stream()
                .map(ClassroomMapper::toResponse)
                .toList();
    }

    public List<TeacherStudentResponseDto> findAvailableStudents() {
        return userRepository.findAllByRole_RoleNameAndActiveAndClassroomIsNull(RoleName.STUDENT, true)
                .stream()
                .map(UserMapper::toTeacherStudentResponse)
                .toList();
    }

    public List<TeacherStudentResponseDto> findAllStudents(UUID classroomId) {
        ClassroomModel classroom = findModelById(classroomId);

        return userRepository.findAllByClassroom_Id(classroom.getId())
                .stream()
                .map(UserMapper::toTeacherStudentResponse)
                .toList();
    }

    public ClassroomResponseDto findById(UUID classroomId) {
        return ClassroomMapper.toResponse(findModelById(classroomId));
    }

    private ClassroomModel findModelById(UUID classroomId) {
        UUID teacherId = currentUserService.getCurrentUserId();

        return classroomRepository.findByIdAndTeacher_IdAndActive(classroomId, teacherId, true)
                .orElseThrow(() -> new ExceptionGeneric("Classroom not found!", "No active classroom found for the authenticated teacher with id: " + classroomId, HttpStatus.NOT_FOUND));
    }

}
