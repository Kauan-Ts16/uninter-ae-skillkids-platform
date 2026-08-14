package com.kauanrodrigues.backend.controller;

import com.kauanrodrigues.backend.dto.user.UserPasswordPatchDto;
import com.kauanrodrigues.backend.dto.user.UserPatchDto;
import com.kauanrodrigues.backend.dto.user.UserPostDto;
import com.kauanrodrigues.backend.dto.user.UserResponseDto;
import com.kauanrodrigues.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/skillkids-platform/users")
public class UserController {

    private final UserService service;


    @PostMapping
    public ResponseEntity<UserResponseDto> save(@RequestBody UserPostDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.save(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable(name = "id")UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<UserResponseDto> update(@PathVariable(name = "id")UUID id, @RequestBody UserPatchDto dto) {
        return ResponseEntity.status(HttpStatus.OK).body(service.update(id, dto));
    }

    @PatchMapping("/{id}/password")
    public ResponseEntity<Void> changePassword(@PathVariable(name = "id")UUID id, @RequestBody UserPasswordPatchDto dto) {
        service.changePassword(id, dto);
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
    public ResponseEntity<List<UserResponseDto>> findAll() {
        return ResponseEntity.status(HttpStatus.OK).body(service.findAll());
    }

    @GetMapping("/active")
    public ResponseEntity<List<UserResponseDto>> findAllActive() {
        return ResponseEntity.status(HttpStatus.OK).body(service.findAllActive());
    }

    @GetMapping("/inactive")
    public ResponseEntity<List<UserResponseDto>> findAllInactive() {
        return ResponseEntity.status(HttpStatus.OK).body(service.findAllInactive());
    }

    @GetMapping("/active/{id}")
    public ResponseEntity<UserResponseDto> findActiveById(@PathVariable(name = "id")UUID id) {
        return ResponseEntity.status(HttpStatus.OK).body(service.findActiveById(id));
    }

    @GetMapping("/inactive/{id}")
    public ResponseEntity<UserResponseDto> findInactiveById(@PathVariable(name = "id")UUID id) {
        return ResponseEntity.status(HttpStatus.OK).body(service.findInactiveById(id));
    }

}
