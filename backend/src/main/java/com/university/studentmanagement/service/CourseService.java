package com.university.studentmanagement.service;

import com.university.studentmanagement.model.Course;

import java.util.List;

public interface CourseService {
    List<Course> getAllCourses();
    Course getCourseById(Long id);
    Course createCourse(Course course);
    Course updateCourse(Long id, Course courseDetails);
    void deleteCourse(Long id);
    Long getTotalCourseCount();
}
