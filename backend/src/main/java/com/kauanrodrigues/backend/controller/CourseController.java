package com.kauanrodrigues.backend.controller;

import com.kauanrodrigues.backend.dto.course.CoursePatchDto;
import com.kauanrodrigues.backend.dto.course.CoursePostDto;
import com.kauanrodrigues.backend.dto.course.CourseResponseDto;
import com.kauanrodrigues.backend.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/skillkids-platform/courses")
public class CourseController {

    private final CourseService service;


    @PostMapping
    public ResponseEntity<CourseResponseDto> save(@RequestBody CoursePostDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.save(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable(name = "id")UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<CourseResponseDto> update(@PathVariable(name = "id")UUID id, @RequestBody CoursePatchDto dto) {
        return ResponseEntity.status(HttpStatus.OK).body(service.update(id, dto));
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
    public ResponseEntity<List<CourseResponseDto>> findAll() {
        return ResponseEntity.status(HttpStatus.OK).body(service.findAll());
    }

    @GetMapping("/active")
    public ResponseEntity<List<CourseResponseDto>> findAllActive() {
        return ResponseEntity.status(HttpStatus.OK).body(service.findAllActive());
    }

    @GetMapping("/inactive")
    public ResponseEntity<List<CourseResponseDto>> findAllInactive() {
        return ResponseEntity.status(HttpStatus.OK).body(service.findAllInactive());
    }

    @GetMapping("/active/{id}")
    public ResponseEntity<CourseResponseDto> findActiveById(@PathVariable(name = "id")UUID id) {
        return ResponseEntity.status(HttpStatus.OK).body(service.findActiveById(id));
    }

    @GetMapping("/inactive/{id}")
    public ResponseEntity<CourseResponseDto> findInactiveById(@PathVariable(name = "id")UUID id) {
        return ResponseEntity.status(HttpStatus.OK).body(service.findInactiveById(id));
    }

}
