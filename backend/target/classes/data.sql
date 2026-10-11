-- Insert Default Courses
INSERT INTO courses (id, course_code, course_name, department, credits, professor) VALUES 
(1, 'CS101', 'Object Oriented Programming with Java', 'Computer Science', 4, 'Dr. Aris Thorne'),
(2, 'CS201', 'Database Management Systems & JDBC', 'Computer Science', 4, 'Prof. Elena Rostova'),
(3, 'CS301', 'Web Development with React JS', 'Information Technology', 3, 'Dr. Marcus Vance'),
(4, 'CS401', 'Enterprise Application Architecture Spring Boot', 'Computer Science', 4, 'Prof. Sophia Lin'),
(5, 'EC101', 'Digital Electronics & Logic Design', 'Electronics', 3, 'Dr. Vikramaditya Sen');

-- Insert Initial Students (Demonstrating OOP inheritance model in DB)
INSERT INTO students (id, first_name, last_name, email, phone, gender, date_of_birth, roll_number, department, gpa, semester, status, address) VALUES
(101, 'Aarav', 'Sharma', 'aarav.sharma@university.edu', '+91 9876543210', 'MALE', '2003-05-14', 'CS2026-001', 'Computer Science', 3.85, 5, 'ACTIVE', '12 Park Street, Tech Hub, Campus City'),
(102, 'Ananya', 'Patel', 'ananya.patel@university.edu', '+91 9876543211', 'FEMALE', '2003-09-22', 'CS2026-002', 'Computer Science', 3.92, 5, 'ACTIVE', '45 Green Ridge, Metro Heights'),
(103, 'Rohan', 'Verma', 'rohan.verma@university.edu', '+91 9876543212', 'MALE', '2002-11-30', 'IT2026-015', 'Information Technology', 3.40, 6, 'ACTIVE', '88 Silicon Valley Ave, Innovation District'),
(104, 'Priya', 'Sundaram', 'priya.sundaram@university.edu', '+91 9876543213', 'FEMALE', '2004-01-18', 'EC2026-008', 'Electronics', 3.75, 4, 'ACTIVE', '102 Lake View Towers, Garden City'),
(105, 'Kabir', 'Deshmukh', 'kabir.deshmukh@university.edu', '+91 9876543214', 'MALE', '2003-08-05', 'CS2026-042', 'Computer Science', 3.10, 5, 'INACTIVE', '54 Heritage Enclave, North Campus');

-- Insert Attendance Records
INSERT INTO attendance (id, student_id, course_id, attendance_date, status, remarks) VALUES
(1, 101, 1, '2026-09-20', 'PRESENT', 'Regular lecture attendance'),
(2, 101, 1, '2026-09-22', 'PRESENT', 'Lab experiment 05 completed'),
(3, 101, 1, '2026-09-24', 'PRESENT', 'Active participation in OOP Q&A'),
(4, 102, 1, '2026-09-20', 'PRESENT', 'Regular lecture attendance'),
(5, 102, 1, '2026-09-22', 'PRESENT', 'Lab experiment 05 completed'),
(6, 103, 3, '2026-09-21', 'LATE', 'Arrived 10 mins after start'),
(7, 104, 5, '2026-09-23', 'ABSENT', 'Medical leave submitted'),
(8, 105, 1, '2026-09-20', 'ABSENT', 'Unexcused absence');
