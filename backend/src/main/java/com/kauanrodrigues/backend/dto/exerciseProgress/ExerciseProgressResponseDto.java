package com.kauanrodrigues.backend.dto.exerciseProgress;

import java.time.LocalDateTime;
import java.util.UUID;

public record ExerciseProgressResponseDto(UUID id, UUID studentId, UUID exerciseId, Integer attempts,
                                          boolean completed, LocalDateTime lastAnsweredAt) {
}
