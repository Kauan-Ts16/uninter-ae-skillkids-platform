package com.kauanrodrigues.backend.service.auth;

import com.kauanrodrigues.backend.dto.auth.LoginPostDto;
import com.kauanrodrigues.backend.dto.auth.LoginResponseDto;
import com.kauanrodrigues.backend.dto.auth.RegisterPostDto;
import com.kauanrodrigues.backend.dto.user.UserPostDto;
import com.kauanrodrigues.backend.dto.user.UserResponseDto;
import com.kauanrodrigues.backend.exception.ExceptionGeneric;
import com.kauanrodrigues.backend.model.UserModel;
import com.kauanrodrigues.backend.repository.UserRepository;
import com.kauanrodrigues.backend.security.JwtService;
import com.kauanrodrigues.backend.service.user.UserService;
import com.kauanrodrigues.backend.validation.auth.AuthValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;

    private final UserRepository userRepository;

    private final AuthValidator validator;

    private final JwtService jwtService;

    private final UserService userService;


    public UserResponseDto register(RegisterPostDto dto) {
        validator.validateForRegister(dto);

        UserPostDto userPostDto = new UserPostDto(
                dto.name(),
                dto.email(),
                dto.password(),
                dto.role(),
                null
        );

        return userService.save(userPostDto);
    }

    public LoginResponseDto login(LoginPostDto dto) {
        validator.validateLogin(dto);

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(dto.email(), dto.password())
            );

            UserModel user = userRepository.findByEmailIgnoreCase(authentication.getName())
                    .orElseThrow(() -> new ExceptionGeneric("Authentication failed!", "Invalid email or password.", HttpStatus.UNAUTHORIZED));

            String accessToken = jwtService.generateToken(user);

            return new LoginResponseDto(
                    accessToken,
                    "Bearer",
                    jwtService.getExpiration()
            );
        } catch (AuthenticationException exception) {
            throw new ExceptionGeneric("Authentication failed!", "Invalid email or password.", HttpStatus.UNAUTHORIZED);
        }
    }

}
