package com.kauanrodrigues.backend.controller.exercise;

import com.kauanrodrigues.backend.dto.exercise.ExerciseResponseDto;
import com.kauanrodrigues.backend.service.exercise.ExerciseService;
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
@RequestMapping("/skillkids-platform/teacher/exercises")
@RequiredArgsConstructor
public class TeacherExerciseController {

    private final ExerciseService service;


    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<ExerciseResponseDto>> findAllByCourse(@PathVariable(name = "courseId") UUID courseId) {
        return ResponseEntity.status(HttpStatus.OK).body(service.findAllAvailableByCourseId(courseId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExerciseResponseDto> findById(@PathVariable(name = "id") UUID id) {
        return ResponseEntity.status(HttpStatus.OK).body(service.findAvailableById(id));
    }

}
