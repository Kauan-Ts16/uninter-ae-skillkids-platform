package com.kauanrodrigues.backend.validation.course;

import com.kauanrodrigues.backend.dto.course.CoursePatchDto;
import com.kauanrodrigues.backend.dto.course.CoursePostDto;
import com.kauanrodrigues.backend.exception.ExceptionGeneric;
import com.kauanrodrigues.backend.model.CourseModel;
import com.kauanrodrigues.backend.repository.CourseRepository;
import com.kauanrodrigues.backend.repository.ExerciseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CourseValidator {

    private final CourseFormatValidator formatValidator;

    private final CourseRepository repository;

    private final ExerciseRepository exerciseRepository;


    public void validateForCreate(CoursePostDto dto) {
        formatValidator.validateTitleForCreate(dto.title());
        formatValidator.validateDescriptionForCreate(dto.description());

        validateUniqueTitle(dto.title());
    }

    public void validateForUpdate(CoursePatchDto dto, CourseModel course) {
        validateUpdateFields(dto);

        formatValidator.validateTitleForUpdate(dto.title());
        formatValidator.validateDescriptionForUpdate(dto.description());

        if (dto.title() != null && !course.getTitle().equalsIgnoreCase(dto.title())) {
            validateUniqueTitle(dto.title());
        }
    }

    public void validateDelete(CourseModel course) {
        if (exerciseRepository.existsByCourseId(course.getId())) {
            throw new ExceptionGeneric("Course cannot be deleted!", "The course cannot deleted because it has exercises associated with it.", HttpStatus.BAD_REQUEST);
        }
    }

    private void validateUpdateFields(CoursePatchDto dto) {
        if (dto.title() == null && dto.description() == null) {
            throw new ExceptionGeneric("No fields provided!", "Provide at least one field to update.", HttpStatus.BAD_REQUEST);
        }
    }

    private void validateUniqueTitle(String title) {
        if (repository.existsByTitleIgnoreCase(title)) {
            throw new ExceptionGeneric("Title already exists!", "A course with this title already exists.", HttpStatus.CONFLICT);
        }
    }

}
