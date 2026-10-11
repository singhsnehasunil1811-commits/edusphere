package com.university.studentmanagement.service;

import com.university.studentmanagement.dto.AttendanceRequest;
import com.university.studentmanagement.model.Attendance;

import java.util.List;

public interface AttendanceService {
    List<Attendance> getAllAttendanceRecords();
    List<Attendance> getAttendanceByStudentId(Long studentId);
    List<Attendance> getAttendanceByCourseId(Long courseId);
    Attendance recordAttendance(AttendanceRequest request);
    Double getOverallAttendancePercentage();
}
