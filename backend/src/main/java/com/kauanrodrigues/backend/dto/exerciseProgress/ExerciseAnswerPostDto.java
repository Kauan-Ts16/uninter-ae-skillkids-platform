package com.kauanrodrigues.backend.dto.exerciseProgress;

import java.util.UUID;

public record ExerciseAnswerPostDto(UUID studentId, UUID exerciseId, Integer selectedOptionIndex) {
}
