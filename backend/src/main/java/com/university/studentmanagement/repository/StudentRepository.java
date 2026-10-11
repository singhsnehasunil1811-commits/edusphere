package com.university.studentmanagement.repository;

import com.university.studentmanagement.model.Student;
import com.university.studentmanagement.model.StudentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Module III & VI: Spring Data JPA Repository for JDBC database interactions
 */
@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByEmail(String email);

    Optional<Student> findByRollNumber(String rollNumber);

    boolean existsByEmail(String email);

    boolean existsByRollNumber(String rollNumber);

    List<Student> findByDepartment(String department);

    List<Student> findByStatus(StudentStatus status);

    @Query("SELECT s FROM Student s WHERE " +
           "LOWER(s.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.rollNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.department) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Student> searchStudents(@Param("query") String query);

    @Query("SELECT AVG(s.gpa) FROM Student s WHERE s.status = 'ACTIVE'")
    Double getAverageGpa();
}
