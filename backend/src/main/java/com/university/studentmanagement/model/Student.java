package com.university.studentmanagement.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

/**
 * LO 1 & LO 2: Demonstrates Inheritance (extends Person), Encapsulation, Method Overriding (@Override getRoleDescription).
 */
@Entity
@Table(name = "students")
public class Student extends Person {

    @NotBlank(message = "Roll number is required")
    @Column(name = "roll_number", nullable = false, unique = true)
    private String rollNumber;

    @NotBlank(message = "Department is required")
    @Column(name = "department", nullable = false)
    private String department;

    @Min(value = 0, message = "GPA cannot be negative")
    @Max(value = 4, message = "GPA maximum is 4.0")
    @Column(name = "gpa")
    private Double gpa;

    @Column(name = "semester")
    private Integer semester;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private StudentStatus status = StudentStatus.ACTIVE;

    @Column(name = "address")
    private String address;

    // Default Constructor
    public Student() {
        super();
    }

    // Overloaded Constructor utilizing super keyword (LO 2)
    public Student(Long id, String firstName, String lastName, String email, String phone, Gender gender,
                   LocalDate dateOfBirth, String rollNumber, String department, Double gpa, Integer semester,
                   StudentStatus status, String address) {
        super(id, firstName, lastName, email, phone, gender, dateOfBirth);
        this.rollNumber = rollNumber;
        this.department = department;
        this.gpa = gpa;
        this.semester = semester;
        this.status = status;
        this.address = address;
    }

    // Module II: Method Overriding
    @Override
    public String getRoleDescription() {
        return "Student enrolled in " + department + " (Roll No: " + rollNumber + ")";
    }

    // Encapsulation Getters and Setters
    public String getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Double getGpa() {
        return gpa;
    }

    public void setGpa(Double gpa) {
        this.gpa = gpa;
    }

    public Integer getSemester() {
        return semester;
    }

    public void setSemester(Integer semester) {
        this.semester = semester;
    }

    public StudentStatus getStatus() {
        return status;
    }

    public void setStatus(StudentStatus status) {
        this.status = status;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }
}
