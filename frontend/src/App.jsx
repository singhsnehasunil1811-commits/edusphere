import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import StudentModal from './components/StudentModal';
import CourseManager from './components/CourseManager';
import AttendanceTracker from './components/AttendanceTracker';
import SyllabusMappingModal from './components/SyllabusMappingModal';

// Initial fallback mock dataset matching backend SQL schema
const initialStudentsMock = [
  { id: 101, firstName: 'Aarav', lastName: 'Sharma', email: 'aarav.sharma@university.edu', phone: '+91 9876543210', gender: 'MALE', dateOfBirth: '2003-05-14', rollNumber: 'CS2026-001', department: 'Computer Science', gpa: 3.85, semester: 5, status: 'ACTIVE', address: '12 Park Street, Tech Hub' },
  { id: 102, firstName: 'Ananya', lastName: 'Patel', email: 'ananya.patel@university.edu', phone: '+91 9876543211', gender: 'FEMALE', dateOfBirth: '2003-09-22', rollNumber: 'CS2026-002', department: 'Computer Science', gpa: 3.92, semester: 5, status: 'ACTIVE', address: '45 Green Ridge, Metro Heights' },
  { id: 103, firstName: 'Rohan', lastName: 'Verma', email: 'rohan.verma@university.edu', phone: '+91 9876543212', gender: 'MALE', dateOfBirth: '2002-11-30', rollNumber: 'IT2026-015', department: 'Information Technology', gpa: 3.40, semester: 6, status: 'ACTIVE', address: '88 Silicon Valley Ave' },
  { id: 104, firstName: 'Priya', lastName: 'Sundaram', email: 'priya.sundaram@university.edu', phone: '+91 9876543213', gender: 'FEMALE', dateOfBirth: '2004-01-18', rollNumber: 'EC2026-008', department: 'Electronics', gpa: 3.75, semester: 4, status: 'ACTIVE', address: '102 Lake View Towers' },
  { id: 105, firstName: 'Kabir', lastName: 'Deshmukh', email: 'kabir.deshmukh@university.edu', phone: '+91 9876543214', gender: 'MALE', dateOfBirth: '2003-08-05', rollNumber: 'CS2026-042', department: 'Computer Science', gpa: 3.10, semester: 5, status: 'INACTIVE', address: '54 Heritage Enclave' }
];

const initialCoursesMock = [
  { id: 1, courseCode: 'CS101', courseName: 'Object Oriented Programming with Java', department: 'Computer Science', credits: 4, professor: 'Dr. Aris Thorne' },
  { id: 2, courseCode: 'CS201', courseName: 'Database Management Systems & JDBC', department: 'Computer Science', credits: 4, professor: 'Prof. Elena Rostova' },
  { id: 3, courseCode: 'CS301', courseName: 'Web Development with React JS', department: 'Information Technology', credits: 3, professor: 'Dr. Marcus Vance' },
  { id: 4, courseCode: 'CS401', courseName: 'Enterprise Application Architecture Spring Boot', department: 'Computer Science', credits: 4, professor: 'Prof. Sophia Lin' },
  { id: 5, courseCode: 'EC101', courseName: 'Digital Electronics & Logic Design', department: 'Electronics', credits: 3, professor: 'Dr. Vikramaditya Sen' }
];

const initialAttendanceMock = [
  { id: 1, studentId: 101, courseId: 1, attendanceDate: '2026-09-20', status: 'PRESENT', remarks: 'Regular lecture' },
  { id: 2, studentId: 101, courseId: 1, attendanceDate: '2026-09-22', status: 'PRESENT', remarks: 'Lab experiment 05' },
  { id: 3, studentId: 102, courseId: 1, attendanceDate: '2026-09-20', status: 'PRESENT', remarks: 'Regular lecture' },
  { id: 4, studentId: 103, courseId: 3, attendanceDate: '2026-09-21', status: 'LATE', remarks: 'Arrived 10m late' },
  { id: 5, studentId: 104, courseId: 5, attendanceDate: '2026-09-23', status: 'ABSENT', remarks: 'Medical leave' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState(initialStudentsMock);
  const [courses, setCourses] = useState(initialCoursesMock);
  const [attendance, setAttendance] = useState(initialAttendanceMock);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [isSyllabusOpen, setIsSyllabusOpen] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  const API_BASE = '/api/v1';

  // Fetch initial data from Spring Boot REST API
  useEffect(() => {
    fetchStudents();
    fetchCourses();
    fetchAttendance();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${API_BASE}/students`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
        setIsBackendConnected(true);
      }
    } catch (err) {
      console.log('Using local state mode for students REST API');
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${API_BASE}/courses`);
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch (err) {
      console.log('Using local state mode for courses REST API');
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await fetch(`${API_BASE}/attendance`);
      if (res.ok) {
        const data = await res.json();
        setAttendance(data);
      }
    } catch (err) {
      console.log('Using local state mode for attendance REST API');
    }
  };

  // Student CRUD Handlers
  const handleSaveStudent = async (studentData) => {
    if (editingStudent) {
      // Update
      if (isBackendConnected) {
        try {
          const res = await fetch(`${API_BASE}/students/${editingStudent.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentData)
          });
          if (res.ok) {
            fetchStudents();
          }
        } catch (err) {
          console.error(err);
        }
      }
      setStudents(prev => prev.map(s => s.id === editingStudent.id ? { ...studentData, id: s.id } : s));
    } else {
      // Create
      if (isBackendConnected) {
        try {
          const res = await fetch(`${API_BASE}/students`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentData)
          });
          if (res.ok) {
            fetchStudents();
          }
        } catch (err) {
          console.error(err);
        }
      }
      const newId = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 101;
      setStudents(prev => [{ ...studentData, id: newId }, ...prev]);
    }
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student record?')) return;
    
    if (isBackendConnected) {
      try {
        await fetch(`${API_BASE}/students/${id}`, { method: 'DELETE' });
        fetchStudents();
      } catch (err) {
        console.error(err);
      }
    }
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  // Course Handlers
  const handleAddCourse = (courseData) => {
    const newId = courses.length > 0 ? Math.max(...courses.map(c => c.id)) + 1 : 1;
    setCourses(prev => [...prev, { ...courseData, id: newId }]);
  };

  const handleDeleteCourse = (id) => {
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  // Attendance Handlers
  const handleRecordAttendance = (attendanceData) => {
    const newId = attendance.length > 0 ? Math.max(...attendance.map(a => a.id)) + 1 : 1;
    setAttendance(prev => [{ ...attendanceData, id: newId }, ...prev]);
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px 60px 24px' }}>
      
      {/* Header & Nav */}
      <Header 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSyllabusModal={() => setIsSyllabusOpen(true)}
        isBackendConnected={isBackendConnected}
      />

      {/* Main Content Area */}
      <main>
        {activeTab === 'dashboard' && (
          <Dashboard 
            students={students}
            courses={courses}
            attendance={attendance}
            onAddStudent={() => { setEditingStudent(null); setIsModalOpen(true); }}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'students' && (
          <StudentList 
            students={students}
            onAddStudent={() => { setEditingStudent(null); setIsModalOpen(true); }}
            onEditStudent={handleEditStudent}
            onDeleteStudent={handleDeleteStudent}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}

        {activeTab === 'courses' && (
          <CourseManager 
            courses={courses}
            onAddCourse={handleAddCourse}
            onDeleteCourse={handleDeleteCourse}
          />
        )}

        {activeTab === 'attendance' && (
          <AttendanceTracker 
            attendance={attendance}
            students={students}
            courses={courses}
            onRecordAttendance={handleRecordAttendance}
          />
        )}
      </main>

      {/* Add / Edit Student Modal */}
      <StudentModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingStudent(null); }}
        onSave={handleSaveStudent}
        editingStudent={editingStudent}
      />

      {/* Syllabus Evaluation Mapping Modal */}
      <SyllabusMappingModal 
        isOpen={isSyllabusOpen}
        onClose={() => setIsSyllabusOpen(false)}
      />

    </div>
  );
}
