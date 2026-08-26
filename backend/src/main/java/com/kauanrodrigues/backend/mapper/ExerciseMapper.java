package com.kauanrodrigues.backend.mapper;

import com.kauanrodrigues.backend.dto.exercise.ExerciseOptionsPatchDto;
import com.kauanrodrigues.backend.dto.exercise.ExercisePatchDto;
import com.kauanrodrigues.backend.dto.exercise.ExercisePostDto;
import com.kauanrodrigues.backend.dto.exercise.ExerciseResponseDto;
import com.kauanrodrigues.backend.model.CourseModel;
import com.kauanrodrigues.backend.model.ExerciseModel;

public class ExerciseMapper {

    public static ExerciseModel toModel(ExercisePostDto input, CourseModel course) {
        ExerciseModel output = new ExerciseModel();

        output.setTitle(input.title());
        output.setDescription(input.description());
        output.setDifficulty(input.difficulty());
        output.setOptions(input.options());
        output.setCorrectOptionIndex(input.correctOptionIndex());
        output.setCourse(course);

        return output;
    }

    public static void updateModel(ExercisePatchDto input, ExerciseModel output) {
        if (input.title() != null) {
            output.setTitle(input.title());
        }

        if (input.description() != null) {
            output.setDescription(input.description());
        }

        if (input.difficulty() != null) {
            output.setDifficulty(input.difficulty());
        }
    }

    public static ExerciseResponseDto toResponse(ExerciseModel exercise) {

        return new ExerciseResponseDto(
                exercise.getId(),
                exercise.getTitle(),
                exercise.getDescription(),
                exercise.getDifficulty(),
                exercise.getSequence(),
                exercise.getOptions(),
                exercise.getCorrectOptionIndex(),
                exercise.getCourse().getId(),
                exercise.getCourse().getTitle(),
                exercise.isActive(),
                exercise.getCreatedAt(),
                exercise.getUpdatedAt()
        );
    }

}
