import React from 'react';
import { Users, BookOpen, Award, CheckCircle2, TrendingUp, Sparkles, Plus, ArrowRight } from 'lucide-react';

export default function Dashboard({ students, courses, attendance, onAddStudent, setActiveTab }) {
  const activeStudents = students.filter(s => s.status === 'ACTIVE').length;
  const avgGpa = students.length > 0 
    ? (students.reduce((acc, s) => acc + (s.gpa || 0), 0) / students.length).toFixed(2)
    : '0.00';

  const presentCount = attendance.filter(a => a.status === 'PRESENT').length;
  const attendanceRate = attendance.length > 0 
    ? ((presentCount / attendance.length) * 100).toFixed(1)
    : '94.2';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Banner */}
      <div className="glass-panel" style={{ 
        padding: '32px', 
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(236, 72, 153, 0.1))',
        borderColor: 'rgba(99, 102, 241, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '12px' }}>
            <Sparkles size={14} /> Full Stack Java Practical Project
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
            Welcome to Student Management Portal
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '650px', fontSize: '0.95rem' }}>
            Architected with <strong>Spring Boot REST API</strong> backend (Modules I, II, III & VI) and <strong>React SPA</strong> frontend (Modules IV & V) with H2 database integration.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary" onClick={onAddStudent}>
            <Plus size={18} /> Register Student
          </button>
          <button className="btn btn-secondary" onClick={() => setActiveTab('students')}>
            View Directory <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '14px', borderRadius: '16px', color: '#818cf8' }}>
            <Users size={28} />
          </div>
          <div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL ENROLLED</p>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '2px' }}>{students.length}</h3>
            <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 600 }}>{activeStudents} Active Students</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{ background: 'rgba(236, 72, 153, 0.15)', padding: '14px', borderRadius: '16px', color: '#f472b6' }}>
            <BookOpen size={28} />
          </div>
          <div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>ACTIVE COURSES</p>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '2px' }}>{courses.length}</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Java, Web & Spring</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{ background: 'rgba(20, 184, 166, 0.15)', padding: '14px', borderRadius: '16px', color: '#2dd4bf' }}>
            <Award size={28} />
          </div>
          <div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>AVERAGE GPA</p>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '2px' }}>{avgGpa} / 4.0</h3>
            <span style={{ fontSize: '0.78rem', color: '#2dd4bf', fontWeight: 600 }}>Academic Excellence</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '14px', borderRadius: '16px', color: '#34d399' }}>
            <CheckCircle2 size={28} />
          </div>
          <div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>AVG ATTENDANCE</p>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '2px' }}>{attendanceRate}%</h3>
            <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 600 }}>Tracked via JDBC</span>
          </div>
        </div>

      </div>

      {/* Recent Students & Quick Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', flexWrap: 'wrap' }}>
        
        {/* Recent Registered Students */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Top Performing Students</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('students')}>View All</button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student Name</th>
                <th>Department</th>
                <th>GPA</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.slice(0, 4).map(student => (
                <tr key={student.id}>
                  <td style={{ fontFamily: 'monospace', color: '#818cf8', fontWeight: 600 }}>{student.rollNumber}</td>
                  <td style={{ fontWeight: 600 }}>{student.firstName} {student.lastName}</td>
                  <td>{student.department}</td>
                  <td style={{ fontWeight: 700, color: student.gpa >= 3.5 ? '#34d399' : '#f59e0b' }}>
                    {student.gpa ? student.gpa.toFixed(2) : 'N/A'}
                  </td>
                  <td>
                    <span className={`badge badge-${student.status.toLowerCase()}`}>
                      {student.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Featured Course Highlights */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px' }}>Syllabus Course Modules</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {courses.slice(0, 3).map(course => (
                <div key={course.id} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ec4899', fontFamily: 'monospace' }}>{course.courseCode}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{course.credits} Credits</span>
                  </div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: '4px' }}>{course.courseName}</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>Instructor: {course.professor}</p>
                </div>
              ))}
            </div>
          </div>
          
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('courses')} style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}>
            Manage All Courses
          </button>
        </div>

      </div>

    </div>
  );
}
