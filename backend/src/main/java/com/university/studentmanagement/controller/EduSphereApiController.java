package com.university.studentmanagement.controller;

import com.university.studentmanagement.model.Attendance;
import com.university.studentmanagement.model.Course;
import com.university.studentmanagement.model.Gender;
import com.university.studentmanagement.model.Student;
import com.university.studentmanagement.model.StudentStatus;
import com.university.studentmanagement.service.AttendanceService;
import com.university.studentmanagement.service.CourseService;
import com.university.studentmanagement.service.StudentService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

/**
 * EduSphere Full Integration REST Controller.
 * Bridges the EduSphere Rich Frontend with the Student Management Backend services.
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class EduSphereApiController {

    private final StudentService studentService;
    private final CourseService courseService;
    private final AttendanceService attendanceService;

    // In-memory ledgers for modules to provide full functionality seamlessly
    private final List<Map<String, Object>> notices = new ArrayList<>();
    private final List<Map<String, Object>> timetable = new ArrayList<>();
    private final List<Map<String, Object>> fees = new ArrayList<>();
    private final List<Map<String, Object>> marks = new ArrayList<>();
    private final List<Map<String, Object>> users = new ArrayList<>();

    @Autowired
    public EduSphereApiController(StudentService studentService,
                                  CourseService courseService,
                                  AttendanceService attendanceService) {
        this.studentService = studentService;
        this.courseService = courseService;
        this.attendanceService = attendanceService;
        initMockData();
    }

    private Map<String, Object> mapOf(Object... kvs) {
        Map<String, Object> map = new LinkedHashMap<>();
        for (int i = 0; i < kvs.length; i += 2) {
            map.put(String.valueOf(kvs[i]), kvs[i + 1]);
        }
        return map;
    }

    private void initMockData() {
        // Users
        users.add(mapOf("id", 1, "fullName", "System Administrator", "email", "admin@student360.com", "role", "ADMIN", "active", true));
        users.add(mapOf("id", 2, "fullName", "Dr. Rajesh Kumar", "email", "teacher@student360.com", "role", "TEACHER", "active", true));
        users.add(mapOf("id", 3, "fullName", "Aarav Sharma", "email", "student@student360.com", "role", "STUDENT", "active", true));

        // Notices
        notices.add(mapOf("id", 1, "title", "Mid-Semester Examinations Schedule Released", "content", "All students must review their respective timetables and report discrepancies.", "priority", "URGENT", "date", "2026-10-15", "targetAudience", "ALL", "createdByName", "System Administrator"));
        notices.add(mapOf("id", 2, "title", "Annual Tech Fest - HackSphere 2026 Registration Open", "content", "Register teams for the 36-hour hackathon before October 25th.", "priority", "IMPORTANT", "date", "2026-10-18", "targetAudience", "STUDENTS", "createdByName", "Dr. Rajesh Kumar"));
        notices.add(mapOf("id", 3, "title", "Faculty Development Workshop on Spring Boot 3", "content", "Mandatory technical refresher for CS and IT faculty members.", "priority", "NORMAL", "date", "2026-10-20", "targetAudience", "TEACHERS", "createdByName", "System Administrator"));

        // Timetable
        timetable.add(mapOf("id", 1, "day", "MONDAY", "startTime", "09:00", "endTime", "10:30", "subjectCode", "CS101", "subjectName", "Java Programming & OOP", "teacherName", "Dr. Aris Thorne", "room", "Lab 201"));
        timetable.add(mapOf("id", 2, "day", "MONDAY", "startTime", "11:00", "endTime", "12:30", "subjectCode", "CS201", "subjectName", "Database Systems & JDBC", "teacherName", "Prof. Elena Rostova", "room", "Room 305"));
        timetable.add(mapOf("id", 3, "day", "TUESDAY", "startTime", "10:00", "endTime", "11:30", "subjectCode", "CS401", "subjectName", "Enterprise Spring Boot", "teacherName", "Prof. Sophia Lin", "room", "Lab 402"));
        timetable.add(mapOf("id", 4, "day", "WEDNESDAY", "startTime", "13:30", "endTime", "15:00", "subjectCode", "EC101", "subjectName", "Digital Electronics", "teacherName", "Dr. Vikramaditya Sen", "room", "Room 108"));
        timetable.add(mapOf("id", 5, "day", "THURSDAY", "startTime", "09:00", "endTime", "10:30", "subjectCode", "CS301", "subjectName", "Web Development & React", "teacherName", "Dr. Marcus Vance", "room", "Lab 204"));

        // Fees
        fees.add(mapOf("id", 1, "studentId", 101, "studentName", "Aarav Sharma", "studentRoll", "CS2026-001", "academicYear", "2026-2027", "totalFees", 95000.0, "paidAmount", 95000.0, "remaining", 0.0, "status", "PAID", "dueDate", "2026-11-30"));
        fees.add(mapOf("id", 2, "studentId", 102, "studentName", "Ananya Patel", "studentRoll", "CS2026-002", "academicYear", "2026-2027", "totalFees", 95000.0, "paidAmount", 60000.0, "remaining", 35000.0, "status", "PARTIALLY_PAID", "dueDate", "2026-11-30"));
        fees.add(mapOf("id", 3, "studentId", 103, "studentName", "Rohan Verma", "studentRoll", "IT2026-015", "academicYear", "2026-2027", "totalFees", 90000.0, "paidAmount", 0.0, "remaining", 90000.0, "status", "PENDING", "dueDate", "2026-11-30"));
        fees.add(mapOf("id", 4, "studentId", 104, "studentName", "Priya Sundaram", "studentRoll", "EC2026-008", "academicYear", "2026-2027", "totalFees", 92000.0, "paidAmount", 92000.0, "remaining", 0.0, "status", "PAID", "dueDate", "2026-11-30"));
        fees.add(mapOf("id", 5, "studentId", 105, "studentName", "Kabir Deshmukh", "studentRoll", "CS2026-042", "academicYear", "2026-2027", "totalFees", 95000.0, "paidAmount", 45000.0, "remaining", 50000.0, "status", "PARTIALLY_PAID", "dueDate", "2026-11-30"));

        // Marks
        marks.add(mapOf("id", 1, "studentId", 101, "studentName", "Aarav Sharma", "studentRoll", "CS2026-001", "subjectCode", "CS101", "subjectName", "Java Programming & OOP", "internal", 18, "assignment", 19, "midterm", 28, "endSem", 27, "total", 92, "percentage", 92.0, "grade", "A+", "gradePoints", 10.0));
        marks.add(mapOf("id", 2, "studentId", 101, "studentName", "Aarav Sharma", "studentRoll", "CS2026-001", "subjectCode", "CS201", "subjectName", "Database Systems & JDBC", "internal", 17, "assignment", 18, "midterm", 25, "endSem", 26, "total", 86, "percentage", 86.0, "grade", "A", "gradePoints", 9.0));
        marks.add(mapOf("id", 3, "studentId", 102, "studentName", "Ananya Patel", "studentRoll", "CS2026-002", "subjectCode", "CS101", "subjectName", "Java Programming & OOP", "internal", 19, "assignment", 20, "midterm", 29, "endSem", 28, "total", 96, "percentage", 96.0, "grade", "A+", "gradePoints", 10.0));
    }

    // ─────────────────────────────────────────────────────────────
    // AUTHENTICATION ENDPOINTS
    // ─────────────────────────────────────────────────────────────
    @PostMapping("/auth/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credentials, HttpSession session) {
        String email = credentials.getOrDefault("email", "").trim().toLowerCase();
        String role = credentials.getOrDefault("role", "ADMIN").trim().toUpperCase();

        String fullName = "EduSphere User";
        if (email.contains("admin") || "ADMIN".equals(role)) {
            role = "ADMIN";
            fullName = "System Administrator";
        } else if (email.contains("teacher") || "TEACHER".equals(role)) {
            role = "TEACHER";
            fullName = "Dr. Rajesh Kumar";
        } else if (email.contains("student") || "STUDENT".equals(role)) {
            role = "STUDENT";
            fullName = "Aarav Sharma";
        }

        Map<String, Object> user = new LinkedHashMap<>();
        user.put("id", 1L);
        user.put("email", email.isEmpty() ? "admin@student360.com" : email);
        user.put("fullName", fullName);
        user.put("role", role);

        session.setAttribute("user", user);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/auth/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(HttpSession session) {
        @SuppressWarnings("unchecked")
        Map<String, Object> user = (Map<String, Object>) session.getAttribute("user");
        if (user == null) {
            user = mapOf("id", 1L, "email", "admin@student360.com", "fullName", "System Administrator", "role", "ADMIN");
        }
        return ResponseEntity.ok(user);
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<Map<String, String>> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    // ─────────────────────────────────────────────────────────────
    // DASHBOARD ENDPOINT
    // ─────────────────────────────────────────────────────────────
    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalStudents", studentService.getTotalStudentCount());
        stats.put("activeTeachers", 18);
        stats.put("activeCourses", courseService.getTotalCourseCount());
        stats.put("overallAttendance", attendanceService.getOverallAttendancePercentage());
        stats.put("pendingFees", 125000.0);
        stats.put("attendanceTrend", List.of(82, 85, 87, 88, 89, 91));
        return ResponseEntity.ok(stats);
    }

    // ─────────────────────────────────────────────────────────────
    // STUDENTS ENDPOINTS (PAGED & CRUD)
    // ─────────────────────────────────────────────────────────────
    @GetMapping("/students")
    public ResponseEntity<List<Map<String, Object>>> getStudentsList() {
        List<Student> list = studentService.getAllStudents();
        List<Map<String, Object>> mapped = new ArrayList<>();
        for (Student s : list) {
            mapped.add(mapStudentToDto(s));
        }
        return ResponseEntity.ok(mapped);
    }

    @GetMapping("/students/paged")
    public ResponseEntity<Map<String, Object>> getStudentsPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String departmentId,
            @RequestParam(required = false) String status) {

        List<Student> all = studentService.getAllStudents();
        List<Map<String, Object>> filtered = new ArrayList<>();

        for (Student s : all) {
            boolean matches = true;
            if (q != null && !q.trim().isEmpty()) {
                String search = q.toLowerCase();
                String name = (s.getFirstName() + " " + s.getLastName()).toLowerCase();
                String roll = s.getRollNumber() != null ? s.getRollNumber().toLowerCase() : "";
                matches = name.contains(search) || roll.contains(search);
            }
            if (matches && status != null && !status.trim().isEmpty()) {
                matches = s.getStatus() != null && s.getStatus().name().equalsIgnoreCase(status);
            }
            if (matches) {
                filtered.add(mapStudentToDto(s));
            }
        }

        int totalElements = filtered.size();
        int totalPages = (int) Math.ceil((double) totalElements / size);
        int start = Math.min(page * size, totalElements);
        int end = Math.min(start + size, totalElements);
        List<Map<String, Object>> content = filtered.subList(start, end);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("content", content);
        response.put("totalElements", totalElements);
        response.put("pageNumber", page);
        response.put("pageSize", size);
        response.put("totalPages", Math.max(1, totalPages));
        response.put("isFirst", page == 0);
        response.put("isLast", page >= totalPages - 1);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/students/{id}")
    public ResponseEntity<Map<String, Object>> getStudentById(@PathVariable Long id) {
        Student s = studentService.getStudentById(id);
        return ResponseEntity.ok(mapStudentToDto(s));
    }

    @GetMapping("/students/profile/me")
    public ResponseEntity<Map<String, Object>> getMyProfile() {
        List<Student> list = studentService.getAllStudents();
        Student first = list.isEmpty() ? null : list.get(0);
        if (first == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(mapStudentToDto(first));
    }

    @PostMapping("/students")
    public ResponseEntity<Student> createStudent(@RequestBody Map<String, Object> req) {
        Student s = new Student();
        s.setFirstName((String) req.getOrDefault("firstName", ""));
        s.setLastName((String) req.getOrDefault("lastName", ""));
        s.setEmail((String) req.getOrDefault("email", "student" + System.currentTimeMillis() + "@university.edu"));
        s.setPhone((String) req.getOrDefault("phone", "+91 9000000000"));
        s.setGender(Gender.MALE);
        s.setRollNumber((String) req.getOrDefault("rollNumber", "CS2026-" + (System.currentTimeMillis() % 1000)));
        s.setDepartment((String) req.getOrDefault("department", "Computer Science"));
        s.setGpa(3.5);
        s.setSemester(Integer.parseInt(req.getOrDefault("semester", "5").toString()));
        s.setStatus(StudentStatus.ACTIVE);
        s.setAddress((String) req.getOrDefault("address", "University Campus"));
        Student created = studentService.createStudent(s);
        return ResponseEntity.ok(created);
    }

    @DeleteMapping("/students/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }

    private Map<String, Object> mapStudentToDto(Student s) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", s.getId());
        m.put("firstName", s.getFirstName());
        m.put("lastName", s.getLastName());
        m.put("email", s.getEmail());
        m.put("phone", s.getPhone());
        m.put("rollNumber", s.getRollNumber());
        m.put("studentCode", "STU-" + s.getId());
        m.put("departmentName", s.getDepartment());
        m.put("courseName", "B.Tech " + s.getDepartment());
        m.put("year", s.getSemester() != null ? (s.getSemester() + 1) / 2 : 3);
        m.put("semester", s.getSemester() != null ? s.getSemester() : 5);
        m.put("status", s.getStatus() != null ? s.getStatus().name() : "ACTIVE");
        m.put("gpa", s.getGpa() != null ? s.getGpa() : 3.75);
        m.put("address", s.getAddress());
        return m;
    }

    // ─────────────────────────────────────────────────────────────
    // METADATA (DEPARTMENTS & COURSES)
    // ─────────────────────────────────────────────────────────────
    @GetMapping("/departments")
    public ResponseEntity<List<Map<String, Object>>> getDepartments() {
        return ResponseEntity.ok(List.of(
                mapOf("id", 1, "name", "Computer Science & Engineering", "code", "CSE"),
                mapOf("id", 2, "name", "Information Technology", "code", "IT"),
                mapOf("id", 3, "name", "Electronics & Communication", "code", "ECE"),
                mapOf("id", 4, "name", "Mechanical Engineering", "code", "ME")
        ));
    }

    @GetMapping("/courses")
    public ResponseEntity<List<Map<String, Object>>> getCourses() {
        List<Course> courses = courseService.getAllCourses();
        List<Map<String, Object>> mapped = new ArrayList<>();
        for (Course c : courses) {
            mapped.add(mapOf(
                    "id", c.getId(),
                    "code", c.getCourseCode(),
                    "name", c.getCourseName(),
                    "department", c.getDepartment(),
                    "credits", c.getCredits(),
                    "professor", c.getProfessor() != null ? c.getProfessor() : "Faculty"
            ));
        }
        return ResponseEntity.ok(mapped);
    }

    // ─────────────────────────────────────────────────────────────
    // ATTENDANCE & MARKS
    // ─────────────────────────────────────────────────────────────
    @GetMapping("/attendance")
    public ResponseEntity<List<Map<String, Object>>> getAllAttendance() {
        List<Attendance> list = attendanceService.getAllAttendanceRecords();
        List<Map<String, Object>> mapped = new ArrayList<>();
        for (Attendance a : list) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", a.getId());
            m.put("studentId", a.getStudent() != null ? a.getStudent().getId() : 101);
            m.put("studentName", a.getStudent() != null ? a.getStudent().getFirstName() + " " + a.getStudent().getLastName() : "Aarav Sharma");
            m.put("studentRoll", a.getStudent() != null ? a.getStudent().getRollNumber() : "CS2026-001");
            m.put("courseName", a.getCourse() != null ? a.getCourse().getCourseName() : "Core Subject");
            m.put("date", a.getAttendanceDate() != null ? a.getAttendanceDate().toString() : "2026-09-20");
            m.put("status", a.getStatus() != null ? a.getStatus().name() : "PRESENT");
            m.put("remarks", a.getRemarks());
            mapped.add(m);
        }
        return ResponseEntity.ok(mapped);
    }

    @GetMapping("/attendance/student/{studentId}")
    public ResponseEntity<List<Attendance>> getStudentAttendance(@PathVariable Long studentId) {
        return ResponseEntity.ok(attendanceService.getAttendanceByStudentId(studentId));
    }

    @GetMapping("/marks")
    public ResponseEntity<List<Map<String, Object>>> getMarks() {
        return ResponseEntity.ok(marks);
    }

    // ─────────────────────────────────────────────────────────────
    // FEES, NOTICES, TIMETABLE, USERS
    // ─────────────────────────────────────────────────────────────
    @GetMapping("/fees")
    public ResponseEntity<List<Map<String, Object>>> getFees() {
        return ResponseEntity.ok(fees);
    }

    @PostMapping("/fees/{id}/pay")
    public ResponseEntity<Map<String, Object>> payFee(@PathVariable Long id, @RequestBody Map<String, Object> req) {
        for (Map<String, Object> f : fees) {
            if (f.get("id").equals(id.intValue()) || f.get("id").equals(id)) {
                double amount = Double.parseDouble(req.getOrDefault("amount", "10000").toString());
                double paid = ((Number) f.get("paidAmount")).doubleValue() + amount;
                double total = ((Number) f.get("totalFees")).doubleValue();
                double remaining = Math.max(0, total - paid);
                f.put("paidAmount", paid);
                f.put("remaining", remaining);
                f.put("status", remaining == 0 ? "PAID" : "PARTIALLY_PAID");
                return ResponseEntity.ok(f);
            }
        }
        return ResponseEntity.ok(Map.of("message", "Payment recorded successfully"));
    }

    @GetMapping("/notices")
    public ResponseEntity<List<Map<String, Object>>> getNotices() {
        return ResponseEntity.ok(notices);
    }

    @GetMapping("/timetable")
    public ResponseEntity<List<Map<String, Object>>> getTimetable() {
        return ResponseEntity.ok(timetable);
    }

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getUsers() {
        return ResponseEntity.ok(users);
    }
}
