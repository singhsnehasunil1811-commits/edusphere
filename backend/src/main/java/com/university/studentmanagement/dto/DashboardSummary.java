package com.university.studentmanagement.dto;

public class DashboardSummary {
    private Long totalStudents;
    private Long totalCourses;
    private Double averageGpa;
    private Double attendancePercentage;

    public DashboardSummary() {}

    public DashboardSummary(Long totalStudents, Long totalCourses, Double averageGpa, Double attendancePercentage) {
        this.totalStudents = totalStudents;
        this.totalCourses = totalCourses;
        this.averageGpa = averageGpa;
        this.attendancePercentage = attendancePercentage;
    }

    public Long getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(Long totalStudents) {
        this.totalStudents = totalStudents;
    }

    public Long getTotalCourses() {
        return totalCourses;
    }

    public void setTotalCourses(Long totalCourses) {
        this.totalCourses = totalCourses;
    }

    public Double getAverageGpa() {
        return averageGpa;
    }

    public void setAverageGpa(Double averageGpa) {
        this.averageGpa = averageGpa;
    }

    public Double getAttendancePercentage() {
        return attendancePercentage;
    }

    public void setAttendancePercentage(Double attendancePercentage) {
        this.attendancePercentage = attendancePercentage;
    }
}
