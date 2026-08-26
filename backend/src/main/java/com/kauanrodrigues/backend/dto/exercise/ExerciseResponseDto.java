package com.kauanrodrigues.backend.dto.exercise;

import com.kauanrodrigues.backend.enums.ExerciseDifficulty;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record ExerciseResponseDto(UUID id, String title, String description, ExerciseDifficulty difficulty,
                                  Integer sequence, List<String> options, Integer correctOptionIndex,
                                  UUID courseId, String courseTitle, boolean active,
                                  LocalDateTime createdAt, LocalDateTime updatedAt) {
}
