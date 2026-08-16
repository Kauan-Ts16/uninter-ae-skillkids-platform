package com.kauanrodrigues.backend.dto.course;

import java.time.LocalDateTime;
import java.util.UUID;

public record CourseResponseDto(UUID id, String title, String description, boolean active, LocalDateTime createdAt, LocalDateTime updatedAt) {
}
