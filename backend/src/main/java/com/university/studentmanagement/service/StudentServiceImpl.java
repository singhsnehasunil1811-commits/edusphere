package com.university.studentmanagement.service;

import com.university.studentmanagement.exception.DuplicateResourceException;
import com.university.studentmanagement.exception.ResourceNotFoundException;
import com.university.studentmanagement.model.Student;
import com.university.studentmanagement.model.StudentStatus;
import com.university.studentmanagement.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Module VI: Spring Service Implementation showcasing Inversion of Control (@Service, @Autowired)
 */
@Service
@Transactional
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;

    @Autowired
    public StudentServiceImpl(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @Override
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    @Override
    public Student getStudentById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));
    }

    @Override
    public Student createStudent(Student student) {
        if (studentRepository.existsByEmail(student.getEmail())) {
            throw new DuplicateResourceException("Student with email '" + student.getEmail() + "' already exists.");
        }
        if (studentRepository.existsByRollNumber(student.getRollNumber())) {
            throw new DuplicateResourceException("Student with roll number '" + student.getRollNumber() + "' already exists.");
        }
        return studentRepository.save(student);
    }

    @Override
    public Student updateStudent(Long id, Student studentDetails) {
        Student student = getStudentById(id);

        // Check unique constraints if values changed
        if (!student.getEmail().equalsIgnoreCase(studentDetails.getEmail()) &&
                studentRepository.existsByEmail(studentDetails.getEmail())) {
            throw new DuplicateResourceException("Email '" + studentDetails.getEmail() + "' is already taken.");
        }

        if (!student.getRollNumber().equalsIgnoreCase(studentDetails.getRollNumber()) &&
                studentRepository.existsByRollNumber(studentDetails.getRollNumber())) {
            throw new DuplicateResourceException("Roll number '" + studentDetails.getRollNumber() + "' is already taken.");
        }

        student.setFirstName(studentDetails.getFirstName());
        student.setLastName(studentDetails.getLastName());
        student.setEmail(studentDetails.getEmail());
        student.setPhone(studentDetails.getPhone());
        student.setGender(studentDetails.getGender());
        student.setDateOfBirth(studentDetails.getDateOfBirth());
        student.setRollNumber(studentDetails.getRollNumber());
        student.setDepartment(studentDetails.getDepartment());
        student.setGpa(studentDetails.getGpa());
        student.setSemester(studentDetails.getSemester());
        student.setStatus(studentDetails.getStatus());
        student.setAddress(studentDetails.getAddress());

        return studentRepository.save(student);
    }

    @Override
    public void deleteStudent(Long id) {
        Student student = getStudentById(id);
        studentRepository.delete(student);
    }

    @Override
    public List<Student> searchStudents(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllStudents();
        }
        return studentRepository.searchStudents(query.trim());
    }

    @Override
    public List<Student> getStudentsByDepartment(String department) {
        return studentRepository.findByDepartment(department);
    }

    @Override
    public List<Student> getStudentsByStatus(StudentStatus status) {
        return studentRepository.findByStatus(status);
    }

    @Override
    public Long getTotalStudentCount() {
        return studentRepository.count();
    }

    @Override
    public Double getAverageGpa() {
        Double avg = studentRepository.getAverageGpa();
        return avg != null ? Math.round(avg * 100.0) / 100.0 : 0.0;
    }
}
