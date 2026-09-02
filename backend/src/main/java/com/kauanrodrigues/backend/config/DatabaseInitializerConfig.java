package com.kauanrodrigues.backend.config;

import com.kauanrodrigues.backend.dto.user.UserPostDto;
import com.kauanrodrigues.backend.enums.RoleName;
import com.kauanrodrigues.backend.model.RoleModel;
import com.kauanrodrigues.backend.repository.RoleRepository;
import com.kauanrodrigues.backend.repository.UserRepository;
import com.kauanrodrigues.backend.service.user.UserService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DatabaseInitializerConfig {

    @Bean
    CommandLineRunner initializeRoles(RoleRepository roleRepository,
                                      UserRepository userRepository,
                                      UserService userService,
                                      @Value("${skillkids.admin.name}") String adminName,
                                      @Value("${skillkids.admin.email}") String adminEmail,
                                      @Value("${skillkids.admin.password}") String adminPassword) {
        return args -> {

            for (RoleName roleName : RoleName.values()) {

                if (roleRepository.findByRoleName(roleName).isEmpty()) {

                    RoleModel role = new RoleModel();
                    role.setRoleName(roleName);

                    roleRepository.save(role);
                }
            }

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
        };
    }
}
