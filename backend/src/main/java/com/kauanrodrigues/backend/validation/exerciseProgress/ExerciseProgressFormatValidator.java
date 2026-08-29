package com.kauanrodrigues.backend.validation.exerciseProgress;

import com.kauanrodrigues.backend.dto.exerciseProgress.ExerciseAnswerPostDto;
import com.kauanrodrigues.backend.exception.ExceptionGeneric;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class ExerciseProgressFormatValidator {

    public void validateForAnswer(ExerciseAnswerPostDto dto) {
        validateStudentId(dto.studentId());
        validateExerciseId(dto.exerciseId());
        validateSelectedOptionIndex(dto.selectedOptionIndex());
    }

    private void validateStudentId(UUID studentId) {
        if (studentId == null) {
            throw new ExceptionGeneric("Invalid student!", "The student is required.", HttpStatus.BAD_REQUEST);
        }
    }

    private void validateExerciseId(UUID exerciseId) {
        if (exerciseId == null) {
            throw new ExceptionGeneric("Invalid exercise!", "The exercise is required.", HttpStatus.BAD_REQUEST);
        }
    }

    private void validateSelectedOptionIndex(Integer selectedOptionIndex) {
        if (selectedOptionIndex == null) {
            throw new ExceptionGeneric("Invalid selected option!", "The selected option is required.", HttpStatus.BAD_REQUEST);

        }

        if (selectedOptionIndex < 0) {
            throw new ExceptionGeneric("Invalid selected option!", "The selected option cannot be negative.", HttpStatus.BAD_REQUEST);
        }
    }

}
