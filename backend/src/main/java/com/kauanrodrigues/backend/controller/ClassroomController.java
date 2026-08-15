package com.kauanrodrigues.backend.controller;

import com.kauanrodrigues.backend.dto.classroom.ClassroomPatchDto;
import com.kauanrodrigues.backend.dto.classroom.ClassroomPostDto;
import com.kauanrodrigues.backend.dto.classroom.ClassroomResponseDto;
import com.kauanrodrigues.backend.dto.classroom.TeacherPatchDto;
import com.kauanrodrigues.backend.service.ClassroomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/skillkids-platform/classrooms")
public class ClassroomController {

    private final ClassroomService service;


    @PostMapping
    public ResponseEntity<ClassroomResponseDto> save(@RequestBody ClassroomPostDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.save(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable(name = "id") UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ClassroomResponseDto> update(@PathVariable(name = "id")UUID id, @RequestBody ClassroomPatchDto dto) {
        return ResponseEntity.status(HttpStatus.OK).body(service.update(id, dto));
    }

    @PatchMapping("/{id}/teacher")
    public ResponseEntity<ClassroomResponseDto> updateTeacher(@PathVariable(name = "id")UUID id, @RequestBody TeacherPatchDto dto) {
        return ResponseEntity.status(HttpStatus.OK).body(service.updateTeacher(id, dto));
    }

    @DeleteMapping("/{id}/teacher")
    public ResponseEntity<Void> removeTeacher(@PathVariable(name = "id")UUID id) {
        service.removeTeacher(id);
        return ResponseEntity.noContent().build();
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
    public ResponseEntity<List<ClassroomResponseDto>> findAll() {
        return ResponseEntity.status(HttpStatus.OK).body(service.findAll());
    }

    @GetMapping("/active")
    public ResponseEntity<List<ClassroomResponseDto>> findAllActive() {
        return ResponseEntity.status(HttpStatus.OK).body(service.findAllActive());
    }

    @GetMapping("/inactive")
    public ResponseEntity<List<ClassroomResponseDto>> findAllInactive() {
        return ResponseEntity.status(HttpStatus.OK).body(service.findAllInactive());
    }

    @GetMapping("/active/{id}")
    public ResponseEntity<ClassroomResponseDto> findActiveById(@PathVariable(name = "id")UUID id) {
        return ResponseEntity.status(HttpStatus.OK).body(service.findActiveById(id));
    }

    @GetMapping("/inactive/{id}")
    public ResponseEntity<ClassroomResponseDto> findInactiveById(@PathVariable(name = "id")UUID id) {
        return ResponseEntity.status(HttpStatus.OK).body(service.findInactiveById(id));
    }


}
