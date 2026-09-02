package com.kauanrodrigues.backend.controller.exerciseProgress;

import com.kauanrodrigues.backend.dto.exerciseProgress.ExerciseAnswerPostDto;
import com.kauanrodrigues.backend.dto.exerciseProgress.ExerciseAnswerResponseDto;
import com.kauanrodrigues.backend.dto.exerciseProgress.ExerciseProgressResponseDto;
import com.kauanrodrigues.backend.service.exerciseProgress.ExerciseProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/skillkids-platform/student/exercise-progress")
@RequiredArgsConstructor
public class StudentExerciseProgressController {

    private final ExerciseProgressService service;


    @PostMapping("/answer")
    public ResponseEntity<ExerciseAnswerResponseDto> answer(@RequestBody ExerciseAnswerPostDto dto) {
        return ResponseEntity.status(HttpStatus.OK).body(service.answer(dto));
    }

    @GetMapping
    public ResponseEntity<List<ExerciseProgressResponseDto>> findAll() {
        return ResponseEntity.status(HttpStatus.OK).body(service.findAllForCurrentStudent());
    }

    @GetMapping("/exercise/{exerciseId}")
    public ResponseEntity<ExerciseProgressResponseDto> findByExercise(@PathVariable(name = "exerciseId") UUID exerciseId) {
        return ResponseEntity.status(HttpStatus.OK).body(service.findForCurrentStudentByExercise(exerciseId));
    }

}
