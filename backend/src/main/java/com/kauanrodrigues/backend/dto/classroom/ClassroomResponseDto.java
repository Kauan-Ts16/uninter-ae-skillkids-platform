package com.kauanrodrigues.backend.dto.classroom;

import java.time.LocalDateTime;
import java.util.UUID;

public record ClassroomResponseDto(UUID id, String name, String joinCode, UUID teacherId, String teacherName, boolean active, LocalDateTime createdAt, LocalDateTime updatedAt) {
}
