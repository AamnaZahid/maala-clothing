package com.maala.shop.config;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DatabaseKeepAliveTask {

    private final EntityManager entityManager;

    @Scheduled(fixedRate = 21600000)
    public void keepDatabaseAlive() {
        try {
            entityManager.createNativeQuery("SELECT 1").getSingleResult();
            log.info("Database keep-alive ping sent");
        } catch (Exception e) {
            log.warn("Keep-alive ping failed: {}", e.getMessage());
        }
    }
}
