package com.kauanrodrigues.backend.controller.exerciseProgress;

import com.kauanrodrigues.backend.dto.exerciseProgress.ExerciseProgressResponseDto;
import com.kauanrodrigues.backend.service.exerciseProgress.ExerciseProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/skillkids-platform/exercise-progress")
@RequiredArgsConstructor
public class ExerciseProgressController {

    private final ExerciseProgressService service;


    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<ExerciseProgressResponseDto>> findAllByStudentId(@PathVariable(name = "studentId")UUID studentId) {
        return ResponseEntity.status(HttpStatus.OK).body(service.findAllByStudentId(studentId));
    }

    @GetMapping("/student/{studentId}/exercise/{exerciseId}")
    public ResponseEntity<ExerciseProgressResponseDto> findByStudentAndExercise(@PathVariable(name = "studentId")UUID studentId, @PathVariable(name = "exerciseId")UUID exerciseId) {
        return ResponseEntity.status(HttpStatus.OK).body(service.findByStudentAndExercise(studentId, exerciseId));
    }

}
