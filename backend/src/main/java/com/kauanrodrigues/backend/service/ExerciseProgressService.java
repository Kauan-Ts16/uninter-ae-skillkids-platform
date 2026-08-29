package com.kauanrodrigues.backend.service;

import com.kauanrodrigues.backend.dto.exerciseProgress.ExerciseAnswerPostDto;
import com.kauanrodrigues.backend.dto.exerciseProgress.ExerciseAnswerResponseDto;
import com.kauanrodrigues.backend.dto.exerciseProgress.ExerciseProgressResponseDto;
import com.kauanrodrigues.backend.exception.ExceptionGeneric;
import com.kauanrodrigues.backend.mapper.ExerciseProgressMapper;
import com.kauanrodrigues.backend.model.ExerciseModel;
import com.kauanrodrigues.backend.model.ExerciseProgressModel;
import com.kauanrodrigues.backend.model.UserModel;
import com.kauanrodrigues.backend.repository.ExerciseProgressRepository;
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


    @Transactional
    public ExerciseAnswerResponseDto answer(ExerciseAnswerPostDto dto) {
        validator.validateAnswerRequest(dto);

        UserModel student = userService.findModelByIdAndActive(dto.studentId(), true);
        ExerciseModel exercise = exerciseService.findModelByIdAndActive(dto.exerciseId(), true);
        ExerciseProgressModel progress = repository.findByStudentIdAndExerciseId(dto.studentId(), dto.exerciseId()).orElse(null);

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

    private ExerciseProgressModel createProgress(UserModel student, ExerciseModel exercise) {
        ExerciseProgressModel progress = new ExerciseProgressModel();

        progress.setStudent(student);
        progress.setExercise(exercise);

        return progress;
    }

}
