package com.kauanrodrigues.backend.config;

import com.kauanrodrigues.backend.enums.RoleName;
import com.kauanrodrigues.backend.model.RoleModel;
import com.kauanrodrigues.backend.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DatabaseInitializerConfig {

    @Bean
    CommandLineRunner initializeRoles(RoleRepository repository) {
        return args -> {

            for (RoleName roleName : RoleName.values()) {

                if (repository.findByRoleName(roleName).isEmpty()) {

                    RoleModel role = new RoleModel();
                    role.setRoleName(roleName);

                    repository.save(role);
                }
            }
        };
    }
}
