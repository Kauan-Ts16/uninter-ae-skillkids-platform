package com.kauanrodrigues.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth

                        .requestMatchers("/skillkids-platform/auth/**").permitAll()

                        .requestMatchers("/skillkids-platform/users/**").hasRole("ADMIN")

                        .requestMatchers("/skillkids-platform/classrooms/**").hasRole("ADMIN")

                        .requestMatchers("/skillkids-platform/teacher/classrooms/**").hasRole("TEACHER")

                        .requestMatchers("/skillkids-platform/student/classrooms/**").hasRole("STUDENT")

                        .requestMatchers(HttpMethod.GET, "/skillkids-platform/courses/active", "/skillkids-platform/courses/active/{id}").hasAnyRole("ADMIN", "TEACHER", "STUDENT")

                        .requestMatchers("/skillkids-platform/courses/**").hasRole("ADMIN")

                        .requestMatchers("/skillkids-platform/exercises/**").hasRole("ADMIN")

                        .requestMatchers("/skillkids-platform/teacher/exercises/**").hasRole("TEACHER")

                        .requestMatchers("/skillkids-platform/student/exercises/**").hasRole("STUDENT")

                        .requestMatchers("/skillkids-platform/exercise-progress/**").hasRole("ADMIN")

                        .requestMatchers("/skillkids-platform/student/exercise-progress/**").hasRole("STUDENT")

                        .requestMatchers("/skillkids-platform/teacher/exercise-progress/**").hasRole("TEACHER")

                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())));

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception{
        return configuration.getAuthenticationManager();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter authoritiesConverter = new JwtGrantedAuthoritiesConverter();

        authoritiesConverter.setAuthoritiesClaimName("role");
        authoritiesConverter.setAuthorityPrefix("ROLE_");

        JwtAuthenticationConverter authenticationConverter = new JwtAuthenticationConverter();

        authenticationConverter.setJwtGrantedAuthoritiesConverter(authoritiesConverter);

        return authenticationConverter;
    }

}
