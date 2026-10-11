package com.university.studentmanagement.service;

import com.university.studentmanagement.dto.AttendanceRequest;
import com.university.studentmanagement.exception.ResourceNotFoundException;
import com.university.studentmanagement.model.Attendance;
import com.university.studentmanagement.model.Course;
import com.university.studentmanagement.model.Student;
import com.university.studentmanagement.repository.AttendanceRepository;
import com.university.studentmanagement.repository.CourseRepository;
import com.university.studentmanagement.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;

    @Autowired
    public AttendanceServiceImpl(AttendanceRepository attendanceRepository,
                                 StudentRepository studentRepository,
                                 CourseRepository courseRepository) {
        this.attendanceRepository = attendanceRepository;
        this.studentRepository = studentRepository;
        this.courseRepository = courseRepository;
    }

    @Override
    public List<Attendance> getAllAttendanceRecords() {
        return attendanceRepository.findAll();
    }

    @Override
    public List<Attendance> getAttendanceByStudentId(Long studentId) {
        return attendanceRepository.findByStudentId(studentId);
    }

    @Override
    public List<Attendance> getAttendanceByCourseId(Long courseId) {
        return attendanceRepository.findByCourseId(courseId);
    }

    @Override
    public Attendance recordAttendance(AttendanceRequest request) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", request.getStudentId()));

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", request.getCourseId()));

        Attendance attendance = new Attendance();
        attendance.setStudent(student);
        attendance.setCourse(course);
        attendance.setAttendanceDate(request.getAttendanceDate());
        attendance.setStatus(request.getStatus());
        attendance.setRemarks(request.getRemarks());

        return attendanceRepository.save(attendance);
    }

    @Override
    public Double getOverallAttendancePercentage() {
        Long total = attendanceRepository.countTotalRecords();
        if (total == 0) return 100.0;
        Long present = attendanceRepository.countPresent();
        double pct = ((double) present / total) * 100.0;
        return Math.round(pct * 10.0) / 10.0;
    }
}
