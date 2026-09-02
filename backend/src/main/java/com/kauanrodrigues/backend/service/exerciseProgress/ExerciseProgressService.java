package com.kauanrodrigues.backend.service.exerciseProgress;

import com.kauanrodrigues.backend.dto.exerciseProgress.ExerciseAnswerPostDto;
import com.kauanrodrigues.backend.dto.exerciseProgress.ExerciseAnswerResponseDto;
import com.kauanrodrigues.backend.dto.exerciseProgress.ExerciseProgressResponseDto;
import com.kauanrodrigues.backend.exception.ExceptionGeneric;
import com.kauanrodrigues.backend.mapper.ExerciseProgressMapper;
import com.kauanrodrigues.backend.model.ExerciseModel;
import com.kauanrodrigues.backend.model.ExerciseProgressModel;
import com.kauanrodrigues.backend.model.UserModel;
import com.kauanrodrigues.backend.repository.ExerciseProgressRepository;
import com.kauanrodrigues.backend.security.CurrentUserService;
import com.kauanrodrigues.backend.service.exercise.ExerciseService;
import com.kauanrodrigues.backend.service.user.UserService;
import com.kauanrodrigues.backend.validation.exerciseProgress.ExerciseProgressValidator;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ExerciseProgressService {

    private final ExerciseProgressRepository repository;

    private final ExerciseProgressValidator validator;

    private final UserService userService;

    private final ExerciseService exerciseService;

    private final CurrentUserService currentUserService;


    @Transactional
    public ExerciseAnswerResponseDto answer(ExerciseAnswerPostDto dto) {
        validator.validateAnswerRequest(dto);

        UUID studentId = currentUserService.getCurrentUserId();

        UserModel student = userService.findModelByIdAndActive(studentId, true);
        ExerciseModel exercise = exerciseService.findAvailableModelById(dto.exerciseId());
        ExerciseProgressModel progress = repository.findByStudentIdAndExerciseId(studentId, dto.exerciseId()).orElse(null);

        validator.validateForAnswer(dto, student, exercise, progress);

        if (progress == null) {
            progress = createProgress(student, exercise);
        }

        boolean correct = dto.selectedOptionIndex().equals(exercise.getCorrectOptionIndex());

        progress.setAttempts(progress.getAttempts() + 1);

        if (correct) {
            progress.setCompleted(true);
        }

        progress.setLastAnsweredAt(LocalDateTime.now());

        progress = repository.saveAndFlush(progress);

        return ExerciseProgressMapper.toAnswerResponse(progress, correct);

    }

    public List<ExerciseProgressResponseDto> findAllByStudentId(UUID studentId) {
        UserModel student = userService.findModelById(studentId);

        validator.validateStudentForProgress(student);

        return repository.findAllByStudentId(studentId)
                .stream()
                .map(ExerciseProgressMapper::toResponse)
                .toList();
    }

    public ExerciseProgressResponseDto findByStudentAndExercise(UUID studentId, UUID exerciseId) {
        UserModel student = userService.findModelById(studentId);

        validator.validateStudentForProgress(student);

        ExerciseProgressModel progress = repository.findByStudentIdAndExerciseId(studentId, exerciseId)
                .orElseThrow(() -> new ExceptionGeneric("Exercise progress not found!", "No exercise progress was found for the informed student and exercise.", HttpStatus.NOT_FOUND));

        return ExerciseProgressMapper.toResponse(progress);
    }

    public List<ExerciseProgressResponseDto> findAllForCurrentStudent() {
        UUID studentId = currentUserService.getCurrentUserId();

        UserModel student = userService.findModelByIdAndActive(studentId, true);

        validator.validateStudentForProgress(student);

        return repository.findAllByStudentId(studentId)
                .stream()
                .map(ExerciseProgressMapper::toResponse)
                .toList();
    }

    public ExerciseProgressResponseDto findForCurrentStudentByExercise(UUID exerciseId) {
        UUID studentId = currentUserService.getCurrentUserId();

        UserModel student = userService.findModelByIdAndActive(studentId, true);

        validator.validateStudentForProgress(student);

        ExerciseProgressModel progress = repository.findByStudentIdAndExerciseId(studentId, exerciseId)
                        .orElseThrow(() -> new ExceptionGeneric("Exercise progress not found!", "No exercise progress was found for the authenticated student and exercise.", HttpStatus.NOT_FOUND));

        return ExerciseProgressMapper.toResponse(progress);
    }

    public List<ExerciseProgressResponseDto> findAllForTeacherByStudentId(UUID studentId) {
        UserModel student = findStudentForCurrentTeacher(studentId);

        return repository.findAllByStudentId(student.getId())
                .stream()
                .map(ExerciseProgressMapper::toResponse)
                .toList();
    }

    public ExerciseProgressResponseDto findForTeacherByStudentAndExercise(UUID studentId, UUID exerciseId) {
        UserModel student = findStudentForCurrentTeacher(studentId);

        ExerciseProgressModel progress = repository.findByStudentIdAndExerciseId(student.getId(), exerciseId)
                        .orElseThrow(() -> new ExceptionGeneric("Exercise progress not found!", "No exercise progress was found for the informed student and exercise.", HttpStatus.NOT_FOUND));

        return ExerciseProgressMapper.toResponse(progress);
    }

    private ExerciseProgressModel createProgress(UserModel student, ExerciseModel exercise) {
        ExerciseProgressModel progress = new ExerciseProgressModel();

        progress.setStudent(student);
        progress.setExercise(exercise);

        return progress;
    }

    private UserModel findStudentForCurrentTeacher(UUID studentId) {
        UUID teacherId = currentUserService.getCurrentUserId();

        UserModel student = userService.findModelById(studentId);

        validator.validateStudentForProgress(student);

        if (student.getClassroom() == null || !student.getClassroom().isActive() || student.getClassroom().getTeacher() == null
                || !student.getClassroom().getTeacher().getId().equals(teacherId)) {
            throw new ExceptionGeneric("Student not found!", "No student assigned to an active classroom of the authenticated teacher was found with id: " + studentId, HttpStatus.NOT_FOUND);
        }

        return student;
    }

}
