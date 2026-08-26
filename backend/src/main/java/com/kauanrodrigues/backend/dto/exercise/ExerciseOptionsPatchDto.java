package com.kauanrodrigues.backend.dto.exercise;

import java.util.List;

public record ExerciseOptionsPatchDto(List<String> options, Integer correctOptionIndex) {
}
