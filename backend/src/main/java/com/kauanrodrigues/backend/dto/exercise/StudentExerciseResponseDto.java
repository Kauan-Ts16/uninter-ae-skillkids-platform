package com.kauanrodrigues.backend.dto.exercise;

import com.kauanrodrigues.backend.enums.ExerciseDifficulty;

import java.util.List;
import java.util.UUID;

public record StudentExerciseResponseDto(UUID id, String title, String description, ExerciseDifficulty difficulty,
                                         Integer sequence, List<String> options, UUID courseId, String courseTitle) {
}
