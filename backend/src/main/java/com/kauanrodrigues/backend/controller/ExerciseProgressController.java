package com.kauanrodrigues.backend.controller;

import com.kauanrodrigues.backend.dto.exerciseProgress.ExerciseAnswerPostDto;
import com.kauanrodrigues.backend.dto.exerciseProgress.ExerciseAnswerResponseDto;
import com.kauanrodrigues.backend.dto.exerciseProgress.ExerciseProgressResponseDto;
import com.kauanrodrigues.backend.service.ExerciseProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/skillkids-platform/exercise-progress")
@RequiredArgsConstructor
public class ExerciseProgressController {

    private final ExerciseProgressService service;


    @PostMapping("/answer")
    public ResponseEntity<ExerciseAnswerResponseDto> answer(@RequestBody ExerciseAnswerPostDto dto) {
        return ResponseEntity.status(HttpStatus.OK).body(service.answer(dto));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<ExerciseProgressResponseDto>> findAllByStudentId(@PathVariable(name = "studentId")UUID studentId) {
        return ResponseEntity.status(HttpStatus.OK).body(service.findAllByStudentId(studentId));
    }

    @GetMapping("/student/{studentId}/exercise/{exerciseId}")
    public ResponseEntity<ExerciseProgressResponseDto> findByStudentAndExercise(@PathVariable(name = "studentId")UUID studentId, @PathVariable(name = "exerciseId")UUID exerciseId) {
        return ResponseEntity.status(HttpStatus.OK).body(service.findByStudentAndExercise(studentId, exerciseId));
    }

}
