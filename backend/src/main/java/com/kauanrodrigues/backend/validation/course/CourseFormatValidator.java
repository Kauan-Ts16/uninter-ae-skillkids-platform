package com.kauanrodrigues.backend.validation.course;

import com.kauanrodrigues.backend.exception.ExceptionGeneric;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Component
public class CourseFormatValidator {

    public void validateTitleForCreate(String title) {
        if (title == null) {
            throw new ExceptionGeneric("Invalid course title!", "The course title is required.", HttpStatus.BAD_REQUEST);
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
            throw new ExceptionGeneric("Invalid course description!", "The course description is required.", HttpStatus.BAD_REQUEST);
        }

        validateDescription(description);
    }

    public void validateDescriptionForUpdate(String description) {
        if (description != null) {
            validateDescription(description);
        }
    }

    public void validateTitle(String title) {
        if (title.isBlank()) {
            throw new ExceptionGeneric("Invalid course title!", "The course title cannot be blank.", HttpStatus.BAD_REQUEST);
        }

        if (title.length() < 3 || title.length() > 100) {
            throw new ExceptionGeneric("Invalid course title!", "The course title must be between 3 and 100 characters.", HttpStatus.BAD_REQUEST);
        }
    }

    public void validateDescription(String description) {
        if (description.isBlank()) {
            throw new ExceptionGeneric("Invalid course description!", "The course description cannot be blank.", HttpStatus.BAD_REQUEST);
        }

        if (description.length() < 3 || description.length() > 500) {
            throw new ExceptionGeneric("Invalid course description!", "The course description must be between 3 and 500 characters.", HttpStatus.BAD_REQUEST);
        }
    }

}
