package com.novabank;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class NovaBankApplication {
    public static void main(String[] args) {
        SpringApplication.run(NovaBankApplication.class, args);
    }
}
