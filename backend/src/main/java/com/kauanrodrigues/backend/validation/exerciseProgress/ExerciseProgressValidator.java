package com.kauanrodrigues.backend.validation.exerciseProgress;

import com.kauanrodrigues.backend.dto.exerciseProgress.ExerciseAnswerPostDto;
import com.kauanrodrigues.backend.enums.RoleName;
import com.kauanrodrigues.backend.exception.ExceptionGeneric;
import com.kauanrodrigues.backend.model.ExerciseModel;
import com.kauanrodrigues.backend.model.ExerciseProgressModel;
import com.kauanrodrigues.backend.model.UserModel;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ExerciseProgressValidator {

    private final ExerciseProgressFormatValidator formatValidator;


    public void validateAnswerRequest(ExerciseAnswerPostDto dto) {
        formatValidator.validateForAnswer(dto);
    }

    public void validateForAnswer(ExerciseAnswerPostDto dto, UserModel student, ExerciseModel exercise, ExerciseProgressModel progress) {
        validateStudentForProgress(student);
        validateSelectedOptionIndex(dto.selectedOptionIndex(), exercise);
        validateProgress(progress);
    }

    public void validateStudentForProgress(UserModel student) {
        if (student.getRole().getRoleName() != RoleName.STUDENT) {
            throw new ExceptionGeneric("Invalid student!", "The informed user must have the STUDENT role.", HttpStatus.BAD_REQUEST);
        }
    }

    private void validateSelectedOptionIndex(Integer selectedOptionIndex, ExerciseModel exercise) {
        if (selectedOptionIndex >= exercise.getOptions().size()) {
            throw new ExceptionGeneric("Invalid selected option!", "The selected option index is outside the available options.", HttpStatus.BAD_REQUEST);
        }
    }

    private void validateProgress(ExerciseProgressModel progress) {
        if (progress != null && progress.isCompleted()) {
            throw new ExceptionGeneric("Exercise already completed!", "The student has already completed this exercise.", HttpStatus.CONFLICT);
        }
    }

}
