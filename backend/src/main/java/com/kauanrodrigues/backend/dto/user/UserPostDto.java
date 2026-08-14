package com.kauanrodrigues.backend.dto.user;

import com.kauanrodrigues.backend.enums.RoleName;

public record UserPostDto(String name, String email, String password, RoleName role) {
}
