package com.kauanrodrigues.backend.controller.user;

import com.kauanrodrigues.backend.dto.auth.LoginPostDto;
import com.kauanrodrigues.backend.dto.auth.LoginResponseDto;
import com.kauanrodrigues.backend.dto.auth.RegisterPostDto;
import com.kauanrodrigues.backend.dto.user.UserResponseDto;
import com.kauanrodrigues.backend.service.auth.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/skillkids-platform/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService service;


    @PostMapping("/register")
    public ResponseEntity<UserResponseDto> register(@RequestBody RegisterPostDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.register(dto));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@RequestBody LoginPostDto dto) {
        return ResponseEntity.status(HttpStatus.OK).body(service.login(dto));
    }

}
