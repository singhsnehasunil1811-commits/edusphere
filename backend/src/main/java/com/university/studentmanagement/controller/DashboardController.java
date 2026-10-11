package com.university.studentmanagement.controller;

import com.university.studentmanagement.dto.DashboardSummary;
import com.university.studentmanagement.service.AttendanceService;
import com.university.studentmanagement.service.CourseService;
import com.university.studentmanagement.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final StudentService studentService;
    private final CourseService courseService;
    private final AttendanceService attendanceService;

    @Autowired
    public DashboardController(StudentService studentService,
                               CourseService courseService,
                               AttendanceService attendanceService) {
        this.studentService = studentService;
        this.courseService = courseService;
        this.attendanceService = attendanceService;
    }

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummary> getDashboardSummary() {
        Long totalStudents = studentService.getTotalStudentCount();
        Long totalCourses = courseService.getTotalCourseCount();
        Double avgGpa = studentService.getAverageGpa();
        Double attendancePct = attendanceService.getOverallAttendancePercentage();

        DashboardSummary summary = new DashboardSummary(totalStudents, totalCourses, avgGpa, attendancePct);
        return ResponseEntity.ok(summary);
    }
}
