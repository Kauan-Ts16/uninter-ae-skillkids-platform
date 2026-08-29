package com.kauanrodrigues.backend.validation.exercise;

import com.kauanrodrigues.backend.dto.exercise.ExerciseOptionsPatchDto;
import com.kauanrodrigues.backend.dto.exercise.ExercisePatchDto;
import com.kauanrodrigues.backend.dto.exercise.ExercisePostDto;
import com.kauanrodrigues.backend.exception.ExceptionGeneric;
import com.kauanrodrigues.backend.model.ExerciseModel;
import com.kauanrodrigues.backend.repository.ExerciseProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ExerciseValidator {

    private final ExerciseFormatValidator formatValidator;

    private final ExerciseProgressRepository exerciseProgressRepository;


    public void validateForCreate(ExercisePostDto dto) {
        formatValidator.validateTitleForCreate(dto.title());
        formatValidator.validateDescriptionForCreate(dto.description());
        formatValidator.validateDifficultyForCreate(dto.difficulty());
        formatValidator.validateOptions(dto.options());
        formatValidator.validateCorrectOptionIndex(dto.correctOptionIndex(), dto.options());
        validateCourseId(dto.courseId());
    }

    public void validateForUpdate(ExercisePatchDto dto) {
        validateUpdateFields(dto);

        formatValidator.validateTitleForUpdate(dto.title());
        formatValidator.validateDescriptionForUpdate(dto.description());
    }

    public void validateForDelete(ExerciseModel exercise) {
        if (exerciseProgressRepository.existsByExerciseId(exercise.getId())) {
            throw new ExceptionGeneric("Exercise cannot be deleted!", "The exercise has student progress.", HttpStatus.CONFLICT);
        }
    }

    public void validateForOptionsUpdate(ExerciseOptionsPatchDto dto) {
        formatValidator.validateOptions(dto.options());
        formatValidator.validateCorrectOptionIndex(dto.correctOptionIndex(), dto.options());
    }

    public void validateOptionsChange(ExerciseModel exercise) {
        if (exerciseProgressRepository.existsByExerciseId(exercise.getId())) {
            throw new ExceptionGeneric("Exercise options cannot be updated!", "The exercise has student progress.", HttpStatus.CONFLICT);
        }
    }

    private void validateCourseId(UUID courseId) {
        if (courseId == null) {
            throw new ExceptionGeneric("Invalid course!", "Course id is required.", HttpStatus.BAD_REQUEST);
        }
    }

    private void validateUpdateFields(ExercisePatchDto dto) {
        if (dto.title() == null && dto.description() == null && dto.difficulty() == null) {
            throw new ExceptionGeneric("No fields provided!", "Provide at least one field to update.", HttpStatus.BAD_REQUEST);
        }
    }

}
