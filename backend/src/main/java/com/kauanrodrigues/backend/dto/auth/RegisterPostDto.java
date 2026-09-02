package com.kauanrodrigues.backend.dto.auth;

import com.kauanrodrigues.backend.enums.RoleName;

public record RegisterPostDto(String name, String email, String password, RoleName role) {
}
