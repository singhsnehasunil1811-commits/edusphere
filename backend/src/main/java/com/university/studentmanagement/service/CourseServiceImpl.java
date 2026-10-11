package com.university.studentmanagement.service;

import com.university.studentmanagement.exception.DuplicateResourceException;
import com.university.studentmanagement.exception.ResourceNotFoundException;
import com.university.studentmanagement.model.Course;
import com.university.studentmanagement.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;

    @Autowired
    public CourseServiceImpl(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    @Override
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    @Override
    public Course getCourseById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", id));
    }

    @Override
    public Course createCourse(Course course) {
        if (courseRepository.existsByCourseCode(course.getCourseCode())) {
            throw new DuplicateResourceException("Course with code '" + course.getCourseCode() + "' already exists.");
        }
        return courseRepository.save(course);
    }

    @Override
    public Course updateCourse(Long id, Course courseDetails) {
        Course course = getCourseById(id);
        course.setCourseName(courseDetails.getCourseName());
        course.setDepartment(courseDetails.getDepartment());
        course.setCredits(courseDetails.getCredits());
        course.setProfessor(courseDetails.getProfessor());
        return courseRepository.save(course);
    }

    @Override
    public void deleteCourse(Long id) {
        Course course = getCourseById(id);
        courseRepository.delete(course);
    }

    @Override
    public Long getTotalCourseCount() {
        return courseRepository.count();
    }
}
