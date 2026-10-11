package com.university.studentmanagement.repository;

import com.university.studentmanagement.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudentId(Long studentId);
    List<Attendance> findByCourseId(Long courseId);
    List<Attendance> findByAttendanceDate(LocalDate attendanceDate);
    
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.status = 'PRESENT'")
    Long countPresent();

    @Query("SELECT COUNT(a) FROM Attendance a")
    Long countTotalRecords();
}
