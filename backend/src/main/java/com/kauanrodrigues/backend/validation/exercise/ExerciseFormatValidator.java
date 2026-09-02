package com.kauanrodrigues.backend.validation.exercise;

import com.kauanrodrigues.backend.enums.ExerciseDifficulty;
import com.kauanrodrigues.backend.exception.ExceptionGeneric;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
public class ExerciseFormatValidator {

    public void validateTitleForCreate(String title) {
        if (title == null) {
            throw new ExceptionGeneric("Invalid exercise title!", "The exercise title is required.", HttpStatus.BAD_REQUEST);
        }

        validateTitle(title);
    }

    public void validateTitleForUpdate(String title) {
        if (title != null) {
            validateTitle(title);
        }
    }

    public void validateDescriptionForCreate(String description) {
        if (description == null) {
            throw new ExceptionGeneric("Invalid exercise description!", "The exercise description is required.", HttpStatus.BAD_REQUEST);
        }

        validateDescription(description);
    }

    public void validateDescriptionForUpdate(String description) {
        if (description != null) {
            validateDescription(description);
        }
    }

    public void validateDifficultyForCreate(ExerciseDifficulty difficulty) {
        if (difficulty == null) {
            throw new ExceptionGeneric("Invalid exercise difficulty!", "The exercise difficulty is required.", HttpStatus.BAD_REQUEST);
        }
    }

    public void validateTitle(String title) {
        if (title.isBlank()) {
            throw new ExceptionGeneric("Invalid exercise title!", "The exercise title cannot be blank.", HttpStatus.BAD_REQUEST);
        }

        if (title.length() < 3 || title.length() > 100) {
            throw new ExceptionGeneric("Invalid exercise title!", "The exercise title must be between 3 and 100 characters.", HttpStatus.BAD_REQUEST);
        }
    }

    public void validateDescription(String description) {
        if (description.isBlank()) {
            throw new ExceptionGeneric("Invalid exercise description!", "The exercise description cannot be blank.", HttpStatus.BAD_REQUEST);
        }

        if (description.length() < 3 || description.length() > 500) {
            throw new ExceptionGeneric("Invalid exercise description!", "The exercise description must be between 3 and 500 characters.", HttpStatus.BAD_REQUEST);
        }
    }

    public void validateOptions(List<String> options) {
        if (options == null) {
            throw new ExceptionGeneric("Invalid exercise options!", "The exercise options are required.", HttpStatus.BAD_REQUEST);
        }

        if (options.size() < 2 || options.size() > 4) {
            throw new ExceptionGeneric("Invalid exercise options!", "The exercise must have between 2 and 4 options.", HttpStatus.BAD_REQUEST);
        }

        Set<String> normalizedOptions = new HashSet<>();

        for (String option : options) {
            if (option == null || option.isBlank()) {
                throw new ExceptionGeneric("Invalid exercise options!", "The exercise options cannot be null or blank.", HttpStatus.BAD_REQUEST);
            }

            String normalizedOption = option.trim().toLowerCase();

            if (!normalizedOptions.add(normalizedOption)) {
                throw new ExceptionGeneric("Invalid exercise options!", "The exercise options cannot contain duplicates.", HttpStatus.BAD_REQUEST);
            }
        }
    }

    public void validateCorrectOptionIndex(Integer correctOptionIndex, List<String> options) {
        if (correctOptionIndex == null) {
            throw new ExceptionGeneric("Invalid exercise correct option index!", "The exercise correct option index is required.", HttpStatus.BAD_REQUEST);
        }

        if (correctOptionIndex < 0 || correctOptionIndex >= options.size()) {
            throw new ExceptionGeneric("Invalid exercise correct option index!", "The exercise correct option index must reference an existing option.", HttpStatus.BAD_REQUEST);
        }
    }

}
