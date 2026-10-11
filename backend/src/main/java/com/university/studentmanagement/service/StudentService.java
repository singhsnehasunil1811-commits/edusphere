package com.university.studentmanagement.service;

import com.university.studentmanagement.model.Student;
import com.university.studentmanagement.model.StudentStatus;

import java.util.List;

/**
 * Module VI: Spring Service Layer Interface (Loose coupling & Dependency Injection)
 */
public interface StudentService {
    List<Student> getAllStudents();
    Student getStudentById(Long id);
    Student createStudent(Student student);
    Student updateStudent(Long id, Student studentDetails);
    void deleteStudent(Long id);
    List<Student> searchStudents(String query);
    List<Student> getStudentsByDepartment(String department);
    List<Student> getStudentsByStatus(StudentStatus status);
    Long getTotalStudentCount();
    Double getAverageGpa();
}
