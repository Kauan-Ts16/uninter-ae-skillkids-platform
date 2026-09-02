package com.kauanrodrigues.backend.controller.classroom;

import com.kauanrodrigues.backend.dto.classroom.ClassroomResponseDto;
import com.kauanrodrigues.backend.dto.classroom.StudentJoinClassroomDto;
import com.kauanrodrigues.backend.service.classroom.StudentClassroomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/skillkids-platform/student/classrooms")
public class StudentClassroomController {

    private final StudentClassroomService service;


    @PatchMapping("/join")
    public ResponseEntity<ClassroomResponseDto> join(@RequestBody StudentJoinClassroomDto dto) {
        return ResponseEntity.status(HttpStatus.OK).body(service.join(dto));
    }

    @DeleteMapping
    public ResponseEntity<Void> leave() {
        service.leave();
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<ClassroomResponseDto> findCurrentClassroom() {
        return ResponseEntity.status(HttpStatus.OK).body(service.findCurrentClassroom());
    }

}
