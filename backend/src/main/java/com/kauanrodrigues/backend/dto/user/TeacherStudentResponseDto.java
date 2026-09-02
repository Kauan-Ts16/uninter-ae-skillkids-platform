package com.kauanrodrigues.backend.dto.user;

import java.util.UUID;

public record TeacherStudentResponseDto(UUID id, String name, String email, boolean active) {
}
