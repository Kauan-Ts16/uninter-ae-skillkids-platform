package com.kauanrodrigues.backend.controller;

import com.kauanrodrigues.backend.dto.exercise.ExerciseOptionsPatchDto;
import com.kauanrodrigues.backend.dto.exercise.ExercisePatchDto;
import com.kauanrodrigues.backend.dto.exercise.ExercisePostDto;
import com.kauanrodrigues.backend.dto.exercise.ExerciseResponseDto;
import com.kauanrodrigues.backend.service.ExerciseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/skillkids-platform/exercises")
@RequiredArgsConstructor
public class ExerciseController {

    private final ExerciseService service;


    @PostMapping
    public ResponseEntity<ExerciseResponseDto> save(@RequestBody ExercisePostDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.save(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable(name = "id")UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ExerciseResponseDto> update(@PathVariable(name = "id")UUID id, @RequestBody ExercisePatchDto dto) {
        return ResponseEntity.status(HttpStatus.OK).body(service.update(id, dto));
    }

    @PatchMapping("/{id}/options")
    public ResponseEntity<ExerciseResponseDto> updateOptions(@PathVariable(name = "id")UUID id, @RequestBody ExerciseOptionsPatchDto dto) {
        return ResponseEntity.status(HttpStatus.OK).body(service.updateOptions(id, dto));
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivate(@PathVariable(name = "id")UUID id) {
        service.deactivate(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<Void> activate(@PathVariable(name = "id")UUID id) {
        service.activate(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<ExerciseResponseDto>> findAll() {
        return ResponseEntity.status(HttpStatus.OK).body(service.findAll());
    }

    @GetMapping("/active")
    public ResponseEntity<List<ExerciseResponseDto>> findAllActive() {
        return ResponseEntity.status(HttpStatus.OK).body(service.findAllActive());
    }

    @GetMapping("/inactive")
    public ResponseEntity<List<ExerciseResponseDto>> findAllInactive() {
        return ResponseEntity.status(HttpStatus.OK).body(service.findAllInactive());
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<ExerciseResponseDto>> findAllByCourse(@PathVariable(name = "courseId")UUID courseId) {
        return ResponseEntity.status(HttpStatus.OK).body(service.findAllByCourseId(courseId));
    }

    @GetMapping("/active/{id}")
    public ResponseEntity<ExerciseResponseDto> findActiveById(@PathVariable(name = "id")UUID id) {
        return ResponseEntity.status(HttpStatus.OK).body(service.findActiveById(id));
    }

    @GetMapping("/inactive/{id}")
    public ResponseEntity<ExerciseResponseDto> findInactiveById(@PathVariable(name = "id")UUID id) {
        return ResponseEntity.status(HttpStatus.OK).body(service.findInactiveById(id));
    }

}
