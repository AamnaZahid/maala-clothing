package com.maala.shop.config;

import com.maala.shop.entity.Role;
import com.maala.shop.entity.User;
import com.maala.shop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile("prod")
@RequiredArgsConstructor
@Slf4j
public class ProdAdminBootstrap implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:}")
    private String adminEmail;

    @Value("${app.admin.password:}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        if (userRepository.existsByRole(Role.ADMIN)) {
            return;
        }
        if (adminEmail == null || adminEmail.isBlank() || adminPassword == null || adminPassword.isBlank()) {
            log.warn("No ADMIN user and app.admin.email/password not set — create admin via database or env vars");
            return;
        }
        userRepository.save(User.builder()
                .name("Jiya")
                .email(adminEmail.trim())
                .role(Role.ADMIN)
                .passwordHash(passwordEncoder.encode(adminPassword))
                .mustChangePassword(true)
                .build());
        log.info("Production admin user created for {}", adminEmail);
    }
}
