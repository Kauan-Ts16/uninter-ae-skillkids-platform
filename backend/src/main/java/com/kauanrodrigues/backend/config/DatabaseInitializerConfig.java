package com.kauanrodrigues.backend.config;

import com.kauanrodrigues.backend.dto.course.CoursePostDto;
import com.kauanrodrigues.backend.dto.exercise.ExercisePostDto;
import com.kauanrodrigues.backend.dto.user.UserPostDto;
import com.kauanrodrigues.backend.enums.ExerciseDifficulty;
import com.kauanrodrigues.backend.enums.RoleName;
import com.kauanrodrigues.backend.model.CourseModel;
import com.kauanrodrigues.backend.model.RoleModel;
import com.kauanrodrigues.backend.repository.CourseRepository;
import com.kauanrodrigues.backend.repository.ExerciseRepository;
import com.kauanrodrigues.backend.repository.RoleRepository;
import com.kauanrodrigues.backend.repository.UserRepository;
import com.kauanrodrigues.backend.service.course.CourseService;
import com.kauanrodrigues.backend.service.exercise.ExerciseService;
import com.kauanrodrigues.backend.service.user.UserService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.UUID;

@Configuration
public class DatabaseInitializerConfig {

    @Bean
    CommandLineRunner initializeDatabase(
            RoleRepository roleRepository,
            UserRepository userRepository,
            UserService userService,
            CourseRepository courseRepository,
            ExerciseRepository exerciseRepository,
            CourseService courseService,
            ExerciseService exerciseService,
            @Value("${skillkids.admin.name}") String adminName,
            @Value("${skillkids.admin.email}") String adminEmail,
            @Value("${skillkids.admin.password}") String adminPassword
    ) {

        return args -> {

            initializeRoles(roleRepository);

            initializeAdmin(
                    userRepository,
                    userService,
                    adminName,
                    adminEmail,
                    adminPassword
            );

            initializeCourses(
                    courseRepository,
                    exerciseRepository,
                    courseService,
                    exerciseService
            );
        };
    }

    private void initializeRoles(RoleRepository roleRepository) {

        for (RoleName roleName : RoleName.values()) {

            if (roleRepository.findByRoleName(roleName).isEmpty()) {

                RoleModel role = new RoleModel();
                role.setRoleName(roleName);

                roleRepository.save(role);
            }
        }
    }

    private void initializeAdmin(
            UserRepository userRepository,
            UserService userService,
            String adminName,
            String adminEmail,
            String adminPassword
    ) {

        if (userRepository.findByEmailIgnoreCase(adminEmail).isEmpty()) {

            UserPostDto admin = new UserPostDto(
                    adminName,
                    adminEmail,
                    adminPassword,
                    RoleName.ADMIN,
                    null
            );

            userService.save(admin);
        }
    }

    private void initializeCourses(
            CourseRepository courseRepository,
            ExerciseRepository exerciseRepository,
            CourseService courseService,
            ExerciseService exerciseService
    ) {

        UUID firstCourseId = initializeCourse(
                courseRepository,
                exerciseRepository,
                courseService,
                exerciseService,
                "Primeiros passos",
                "Aprenda os primeiros comandos de lógica de programação.",
                List.of(
                        new ExerciseSeed(
                                "Andar e pular",
                                "Primeiro, ande. Depois, pule. Qual é a ordem?",
                                ExerciseDifficulty.EASY,
                                List.of(
                                        "Andar → Pular",
                                        "Pular → Andar",
                                        "Andar → Andar"
                                ),
                                0
                        ),
                        new ExerciseSeed(
                                "Siga os comandos",
                                "Pular → Andar → Parar. O que faz logo depois de pular?",
                                ExerciseDifficulty.EASY,
                                List.of(
                                        "Para",
                                        "Anda",
                                        "Pula novamente"
                                ),
                                1
                        ),
                        new ExerciseSeed(
                                "Hora de parar",
                                "Faça o robô andar duas vezes e depois parar. Qual sequência usar?",
                                ExerciseDifficulty.EASY,
                                List.of(
                                        "Andar → Parar → Andar",
                                        "Parar → Andar → Andar",
                                        "Andar → Andar → Parar"
                                ),
                                2
                        ),
                        new ExerciseSeed(
                                "Encontre o erro",
                                "O robô deve pular e depois parar. Ele recebeu: Pular → Andar. Qual comando deve substituir Andar?",
                                ExerciseDifficulty.EASY,
                                List.of(
                                        "Parar",
                                        "Andar",
                                        "Pular"
                                ),
                                0
                        )
                )
        );

        UUID secondCourseId = initializeCourse(
                courseRepository,
                exerciseRepository,
                courseService,
                exerciseService,
                "Siga os comandos",
                "Aprenda a interpretar, organizar e corrigir sequências de comandos.",
                List.of(
                        new ExerciseSeed(
                                "Antes de parar",
                                "Andar → Pular → Bater palmas → Parar. O que acontece imediatamente antes de parar?",
                                ExerciseDifficulty.EASY,
                                List.of(
                                        "Anda",
                                        "Pula",
                                        "Bate palmas"
                                ),
                                2
                        ),
                        new ExerciseSeed(
                                "Quantas vezes ele anda?",
                                "Andar → Pular → Andar → Andar. Quantas vezes o robô anda?",
                                ExerciseDifficulty.EASY,
                                List.of(
                                        "Duas",
                                        "Três",
                                        "Quatro"
                                ),
                                1
                        ),
                        new ExerciseSeed(
                                "Para onde ele foi?",
                                "Direita → Direita → Esquerda. Qual foi o resultado final?",
                                ExerciseDifficulty.EASY,
                                List.of(
                                        "Mesmo lugar",
                                        "Um passo à direita",
                                        "Dois passos à direita"
                                ),
                                1
                        ),
                        new ExerciseSeed(
                                "Troque a ordem",
                                "O robô deve fazer Andar → Pular → Parar, mas recebeu Pular → Andar → Parar. O que fazer?",
                                ExerciseDifficulty.MEDIUM,
                                List.of(
                                        "Trocar os dois primeiros comandos",
                                        "Retirar Parar",
                                        "Acrescentar Andar final"
                                ),
                                0
                        ),
                        new ExerciseSeed(
                                "Um comando a mais",
                                "O robô precisa andar duas vezes e depois parar, mas recebeu Andar → Andar → Andar → Parar. O que fazer?",
                                ExerciseDifficulty.MEDIUM,
                                List.of(
                                        "Retirar Parar",
                                        "Acrescentar Andar",
                                        "Retirar um Andar"
                                ),
                                2
                        ),
                        new ExerciseSeed(
                                "Caminhos diferentes, mesmo destino",
                                "Qual sequência também pode representar o mesmo resultado de Direita → Direita → Esquerda?",
                                ExerciseDifficulty.MEDIUM,
                                List.of(
                                        "Direita → Esquerda → Direita",
                                        "Direita → Direita",
                                        "Esquerda → Esquerda → Direita"
                                ),
                                0
                        )
                )
        );

        initializeCourse(
                courseRepository,
                exerciseRepository,
                courseService,
                exerciseService,
                "Padrões e repetições",
                "Aprenda a identificar padrões e utilizar repetições em sequências.",
                List.of(
                        new ExerciseSeed(
                                "Qual vem depois?",
                                "Andar → Pular → Andar → ___. Qual comando vem depois?",
                                ExerciseDifficulty.EASY,
                                List.of(
                                        "Andar",
                                        "Pular",
                                        "Parar"
                                ),
                                1
                        ),
                        new ExerciseSeed(
                                "Um comando mais curto",
                                "O robô deve bater palmas quatro vezes. Quantas repetições são necessárias?",
                                ExerciseDifficulty.MEDIUM,
                                List.of(
                                        "Repetir 2 vezes",
                                        "Repetir 3 vezes",
                                        "Repetir 4 vezes"
                                ),
                                2
                        ),
                        new ExerciseSeed(
                                "Caminhada do robô",
                                "Repita 3 vezes: Andar → Andar. Quantos passos o robô dará?",
                                ExerciseDifficulty.MEDIUM,
                                List.of(
                                        "Seis",
                                        "Três",
                                        "Dois"
                                ),
                                0
                        ),
                        new ExerciseSeed(
                                "Depois da repetição",
                                "Repita 2 vezes: Andar → Pular. Depois: Andar. Quantas ações serão realizadas?",
                                ExerciseDifficulty.HARD,
                                List.of(
                                        "Duas",
                                        "Três",
                                        "Quatro"
                                ),
                                1
                        )
                )
        );
    }

    private UUID initializeCourse(
            CourseRepository courseRepository,
            ExerciseRepository exerciseRepository,
            CourseService courseService,
            ExerciseService exerciseService,
            String title,
            String description,
            List<ExerciseSeed> exercises
    ) {

        UUID courseId = courseRepository.findAll()
                .stream()
                .filter(course -> course.getTitle().equalsIgnoreCase(title))
                .map(CourseModel::getId)
                .findFirst()
                .orElse(null);

        if (courseId == null) {

            courseId = courseService.save(
                    new CoursePostDto(
                            title,
                            description
                    )
            ).id();
        }

        if (!exerciseRepository.existsByCourseId(courseId)) {

            for (ExerciseSeed exercise : exercises) {

                exerciseService.save(
                        new ExercisePostDto(
                                exercise.title(),
                                exercise.description(),
                                exercise.difficulty(),
                                exercise.options(),
                                exercise.correctOptionIndex(),
                                courseId
                        )
                );
            }
        }

        return courseId;
    }

    private record ExerciseSeed(
            String title,
            String description,
            ExerciseDifficulty difficulty,
            List<String> options,
            Integer correctOptionIndex
    ) {
    }
}