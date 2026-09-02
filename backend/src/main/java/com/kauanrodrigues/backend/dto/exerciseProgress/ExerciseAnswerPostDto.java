package com.kauanrodrigues.backend.dto.exerciseProgress;

import java.util.UUID;

public record ExerciseAnswerPostDto(UUID exerciseId, Integer selectedOptionIndex) {
}
