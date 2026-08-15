package com.kauanrodrigues.backend.dto.user;

import com.kauanrodrigues.backend.enums.RoleName;

import java.util.UUID;

public record UserPostDto(String name, String email, String password, RoleName role, UUID classroomId) {
}
