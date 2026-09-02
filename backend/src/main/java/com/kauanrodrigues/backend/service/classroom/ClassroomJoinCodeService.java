package com.kauanrodrigues.backend.service.classroom;

import com.kauanrodrigues.backend.repository.ClassroomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ClassroomJoinCodeService {

    private final ClassroomRepository repository;


    public String generateJoinCode() {
        String joinCode;

        do {
            joinCode = UUID.randomUUID()
                    .toString()
                    .substring(0, 6)
                    .toUpperCase();
        } while (repository.existsByJoinCode(joinCode));

        return joinCode;
    }
}
