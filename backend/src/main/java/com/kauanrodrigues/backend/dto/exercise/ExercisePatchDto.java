package com.kauanrodrigues.backend.dto.exercise;

import com.kauanrodrigues.backend.enums.ExerciseDifficulty;

public record ExercisePatchDto(String title, String description, ExerciseDifficulty difficulty) {
}
