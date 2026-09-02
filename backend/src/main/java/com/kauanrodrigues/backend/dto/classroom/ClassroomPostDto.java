package com.kauanrodrigues.backend.dto.classroom;

import java.util.UUID;

public record ClassroomPostDto(String name, UUID teacherId) {
}
