package com.kauanrodrigues.backend.mapper;

import com.kauanrodrigues.backend.dto.exerciseProgress.ExerciseAnswerResponseDto;
import com.kauanrodrigues.backend.dto.exerciseProgress.ExerciseProgressResponseDto;
import com.kauanrodrigues.backend.model.ExerciseProgressModel;

public class ExerciseProgressMapper {

    public static ExerciseProgressResponseDto toResponse(ExerciseProgressModel progress) {
        return new ExerciseProgressResponseDto(
                progress.getId(),
                progress.getStudent().getId(),
                progress.getExercise().getId(),
                progress.getAttempts(),
                progress.isCompleted(),
                progress.getLastAnsweredAt()
        );
    }

    public static ExerciseAnswerResponseDto toAnswerResponse(ExerciseProgressModel progress, boolean correct) {
        return new ExerciseAnswerResponseDto(
                progress.getId(),
                progress.getStudent().getId(),
                progress.getExercise().getId(),
                correct,
                progress.getAttempts(),
                progress.isCompleted(),
                progress.getLastAnsweredAt()
        );
    }
}
