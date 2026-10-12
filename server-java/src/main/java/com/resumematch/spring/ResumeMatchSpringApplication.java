package com.resumematch.spring;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

/**
 * Spring Boot 3 Application Entry Point
 * 
 * When running with Maven or in IntelliJ IDEA / Eclipse:
 *   mvn spring-boot:run
 */
@SpringBootApplication
@ComponentScan(basePackages = {"com.resumematch.spring", "com.resumematch.algorithms", "com.resumematch.data"})
public class ResumeMatchSpringApplication {
    public static void main(String[] args) {
        SpringApplication.run(ResumeMatchSpringApplication.class, args);
    }
}
