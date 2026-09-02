package com.kauanrodrigues.backend.dto.exerciseProgress;

import java.time.LocalDateTime;
import java.util.UUID;

public record ExerciseAnswerResponseDto(UUID progressId, UUID studentId, UUID exerciseId, boolean correct,
                                        Integer attempts, boolean completed, LocalDateTime lastAnsweredAt) {
}
