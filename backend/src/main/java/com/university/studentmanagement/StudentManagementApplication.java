package com.university.studentmanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main Spring Boot Application Entry Point for Student Management System
 * Full Stack Java Programming Lab Project (Module VI)
 */
@SpringBootApplication
public class StudentManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(StudentManagementApplication.class, args);
        System.out.println("\n==========================================================================");
        System.out.println("🚀 Student Management System Backend Server is Running!");
        System.out.println("🌐 API Base URL: http://localhost:8080/api/v1/students");
        System.out.println("🗄️ H2 Database Console: http://localhost:8080/h2-console");
        System.out.println("==========================================================================\n");
    }
}
