package com.university.studentmanagement.controller;

import com.university.studentmanagement.dto.AttendanceRequest;
import com.university.studentmanagement.model.Attendance;
import com.university.studentmanagement.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @Autowired
    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping
    public ResponseEntity<List<Attendance>> getAllAttendance() {
        return ResponseEntity.ok(attendanceService.getAllAttendanceRecords());
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Attendance>> getByStudentId(@PathVariable Long studentId) {
        return ResponseEntity.ok(attendanceService.getAttendanceByStudentId(studentId));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Attendance>> getByCourseId(@PathVariable Long courseId) {
        return ResponseEntity.ok(attendanceService.getAttendanceByCourseId(courseId));
    }

    @PostMapping
    public ResponseEntity<Attendance> recordAttendance(@Valid @RequestBody AttendanceRequest request) {
        Attendance recorded = attendanceService.recordAttendance(request);
        return new ResponseEntity<>(recorded, HttpStatus.CREATED);
    }
}
