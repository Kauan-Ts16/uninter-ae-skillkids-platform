package com.kauanrodrigues.backend.controller.user;

import com.kauanrodrigues.backend.dto.user.UserPasswordPatchDto;
import com.kauanrodrigues.backend.dto.user.UserPatchDto;
import com.kauanrodrigues.backend.dto.user.UserResponseDto;
import com.kauanrodrigues.backend.security.CurrentUserService;
import com.kauanrodrigues.backend.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/skillkids-platform/account")
@RequiredArgsConstructor
public class AccountController {

    private final UserService service;

    private final CurrentUserService currentUserService;


    @GetMapping
    public ResponseEntity<UserResponseDto> findCurrentUser() {
        UUID userId = currentUserService.getCurrentUserId();
        return ResponseEntity.status(HttpStatus.OK).body(service.findActiveById(userId));
    }

    @PatchMapping
    public ResponseEntity<UserResponseDto> updateCurrentUser(@RequestBody UserPatchDto dto) {
        UUID userId = currentUserService.getCurrentUserId();

        return ResponseEntity.status(HttpStatus.OK).body(service.update(userId, dto));
    }

    @PatchMapping("/password")
    public ResponseEntity<Void> changePassword(@RequestBody UserPasswordPatchDto dto) {
        UUID userId = currentUserService.getCurrentUserId();

        service.changePassword(userId, dto);

        return ResponseEntity.noContent().build();
    }

}
