package com.kauanrodrigues.backend.dto.exercise;

import com.kauanrodrigues.backend.enums.ExerciseDifficulty;

import java.util.List;
import java.util.UUID;

public record ExercisePostDto(String title, String description, ExerciseDifficulty difficulty,
                              List<String > options, Integer correctOptionIndex, UUID courseId) {
}
