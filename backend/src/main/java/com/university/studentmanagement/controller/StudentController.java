package com.university.studentmanagement.controller;

import com.university.studentmanagement.model.Student;
import com.university.studentmanagement.model.StudentStatus;
import com.university.studentmanagement.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Module VI: Spring Boot REST Controller handling HTTP Endpoints (GET, POST, PUT, DELETE)
 */
@RestController
@RequestMapping("/api/v1/students")
@CrossOrigin(origins = "*")
public class StudentController {

    private final StudentService studentService;

    @Autowired
    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    // GET /api/v1/students - Retrieve all students or filter by search query
    @GetMapping
    public ResponseEntity<List<Student>> getAllStudents(@RequestParam(required = false) String search,
                                                        @RequestParam(required = false) String department,
                                                        @RequestParam(required = false) StudentStatus status) {
        if (search != null && !search.trim().isEmpty()) {
            return ResponseEntity.ok(studentService.searchStudents(search));
        }
        if (department != null && !department.trim().isEmpty()) {
            return ResponseEntity.ok(studentService.getStudentsByDepartment(department));
        }
        if (status != null) {
            return ResponseEntity.ok(studentService.getStudentsByStatus(status));
        }
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    // GET /api/v1/students/{id} - Get single student
    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    // POST /api/v1/students - Create new student
    @PostMapping
    public ResponseEntity<Student> createStudent(@Valid @RequestBody Student student) {
        Student createdStudent = studentService.createStudent(student);
        return new ResponseEntity<>(createdStudent, HttpStatus.CREATED);
    }

    // PUT /api/v1/students/{id} - Update existing student
    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(@PathVariable Long id,
                                                @Valid @RequestBody Student studentDetails) {
        Student updatedStudent = studentService.updateStudent(id, studentDetails);
        return ResponseEntity.ok(updatedStudent);
    }

    // DELETE /api/v1/students/{id} - Delete student
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }
}
