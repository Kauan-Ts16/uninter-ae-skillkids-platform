package com.kauanrodrigues.backend.dto.user;

import com.kauanrodrigues.backend.enums.RoleName;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserResponseDto(UUID id, String name, String email, RoleName role, UUID classroomId, String classroomName, boolean active, LocalDateTime createdAt, LocalDateTime updatedAt) {
}
