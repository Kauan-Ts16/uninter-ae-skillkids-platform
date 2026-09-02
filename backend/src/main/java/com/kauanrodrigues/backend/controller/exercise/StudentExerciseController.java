package com.kauanrodrigues.backend.controller.exercise;

import com.kauanrodrigues.backend.dto.exercise.StudentExerciseResponseDto;
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
@RequiredArgsConstructor
@RequestMapping("/skillkids-platform/student/exercises")
public class StudentExerciseController {

    private final ExerciseService service;


    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<StudentExerciseResponseDto>> findAllByCourse(@PathVariable(name = "courseId") UUID courseId) {
        return ResponseEntity.status(HttpStatus.OK).body(service.findAllAvailableForStudentByCourseId(courseId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentExerciseResponseDto> findById(@PathVariable(name = "id") UUID id) {
        return ResponseEntity.status(HttpStatus.OK).body(service.findAvailableForStudentById(id));
    }

}
