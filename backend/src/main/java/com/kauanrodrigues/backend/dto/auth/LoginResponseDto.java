package com.kauanrodrigues.backend.dto.auth;

public record LoginResponseDto(String accessToken, String tokenType, Long expiresIn) {
}
