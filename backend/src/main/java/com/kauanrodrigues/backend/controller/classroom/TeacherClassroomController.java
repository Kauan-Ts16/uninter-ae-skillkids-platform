package com.kauanrodrigues.backend.controller.classroom;

import com.kauanrodrigues.backend.dto.classroom.ClassroomResponseDto;
import com.kauanrodrigues.backend.dto.classroom.TeacherClassroomPostDto;
import com.kauanrodrigues.backend.dto.user.TeacherStudentResponseDto;
import com.kauanrodrigues.backend.service.classroom.TeacherClassroomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/skillkids-platform/teacher/classrooms")
@RequiredArgsConstructor
public class TeacherClassroomController {

    private final TeacherClassroomService service;


    @PostMapping
    public ResponseEntity<ClassroomResponseDto> save(@RequestBody TeacherClassroomPostDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.save(dto));
    }

    @PatchMapping("/{id}/students/{studentId}")
    public ResponseEntity<TeacherStudentResponseDto> addStudent(@PathVariable(name = "id") UUID classroomId, @PathVariable(name = "studentId") UUID studentId) {
        return ResponseEntity.status(HttpStatus.OK).body(service.addStudent(classroomId, studentId));
    }

    @DeleteMapping("/{id}/students/{studentId}")
    public ResponseEntity<Void> removeStudent(@PathVariable(name = "id") UUID classroomId, @PathVariable(name = "studentId") UUID studentId) {
        service.removeStudent(classroomId, studentId);

        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<ClassroomResponseDto>> findAll() {
        return ResponseEntity.status(HttpStatus.OK).body(service.findAll());
    }

    @GetMapping("/students/available")
    public ResponseEntity<List<TeacherStudentResponseDto>> findAvailableStudents() {
        return ResponseEntity.status(HttpStatus.OK).body(service.findAvailableStudents());
    }

    @GetMapping("/{id}/students")
    public ResponseEntity<List<TeacherStudentResponseDto>> findAllStudents(@PathVariable(name = "id") UUID id) {
        return ResponseEntity.status(HttpStatus.OK).body(service.findAllStudents(id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClassroomResponseDto> findById(@PathVariable(name = "id") UUID id) {
        return ResponseEntity.status(HttpStatus.OK).body(service.findById(id));
    }

}
