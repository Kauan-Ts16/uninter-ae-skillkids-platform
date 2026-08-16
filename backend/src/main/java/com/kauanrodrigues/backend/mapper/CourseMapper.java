package com.kauanrodrigues.backend.mapper;

import com.kauanrodrigues.backend.dto.course.CoursePatchDto;
import com.kauanrodrigues.backend.dto.course.CoursePostDto;
import com.kauanrodrigues.backend.dto.course.CourseResponseDto;
import com.kauanrodrigues.backend.model.CourseModel;

public class CourseMapper {

    public static CourseModel toModel(CoursePostDto input) {
        CourseModel output = new CourseModel();

        output.setTitle(input.title());
        output.setDescription(input.description());

        return output;
    }

    public static void updateModel(CoursePatchDto input, CourseModel output) {
        if (input.title() != null) {
            output.setTitle(input.title());
        }

        if (input.description() != null) {
            output.setDescription(input.description());
        }
    }

    public static CourseResponseDto toResponse(CourseModel course) {
        return new CourseResponseDto(
                course.getId(),
                course.getTitle(),
                course.getDescription(),
                course.isActive(),
                course.getCreatedAt(),
                course.getUpdatedAt()
        );
    }
}
