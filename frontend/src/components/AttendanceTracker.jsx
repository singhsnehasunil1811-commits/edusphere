import React, { useState } from 'react';
import { Calendar, CheckCircle2, XCircle, Clock, AlertTriangle, Plus, Filter } from 'lucide-react';

export default function AttendanceTracker({ attendance, students, courses, onRecordAttendance }) {
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [newAttendance, setNewAttendance] = useState({
    studentId: students[0]?.id || 101,
    courseId: courses[0]?.id || 1,
    attendanceDate: new Date().toISOString().split('T')[0],
    status: 'PRESENT',
    remarks: 'Regular lecture'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onRecordAttendance(newAttendance);
    setShowMarkModal(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PRESENT':
        return <span className="badge badge-active" style={{ background: 'rgba(16, 185, 129, 0.2)' }}><CheckCircle2 size={12} /> Present</span>;
      case 'ABSENT':
        return <span className="badge badge-suspended" style={{ background: 'rgba(239, 68, 68, 0.2)' }}><XCircle size={12} /> Absent</span>;
      case 'LATE':
        return <span className="badge badge-inactive" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }}><Clock size={12} /> Late</span>;
      default:
        return <span className="badge badge-inactive">{status}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Student Attendance Registry</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Modules III & IV: Date-driven tracking with JDBC database storage & DOM events
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowMarkModal(true)}>
          <Plus size={18} /> Record Attendance
        </button>
      </div>

      {/* Attendance Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Student Roll & Name</th>
              <th>Course Name</th>
              <th>Status</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map(item => {
              const student = item.student || students.find(s => s.id === item.studentId) || { rollNumber: 'CS2026', firstName: 'Student', lastName: '' };
              const course = item.course || courses.find(c => c.id === item.courseId) || { courseName: 'Java Programming' };
              
              return (
                <tr key={item.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {item.attendanceDate}
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{student.firstName} {student.lastName}</div>
                    <div style={{ fontSize: '0.78rem', color: '#818cf8', fontFamily: 'monospace' }}>{student.rollNumber}</div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{course.courseName}</td>
                  <td>{getStatusBadge(item.status)}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{item.remarks || 'N/A'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showMarkModal && (
        <div className="modal-backdrop" onClick={() => setShowMarkModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '18px' }}>Mark Student Attendance</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Select Student</label>
                <select 
                  className="input-field"
                  value={newAttendance.studentId}
                  onChange={e => setNewAttendance({ ...newAttendance, studentId: Number(e.target.value) })}
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id} style={{ background: '#111827' }}>
                      {s.rollNumber} - {s.firstName} {s.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Select Course</label>
                <select 
                  className="input-field"
                  value={newAttendance.courseId}
                  onChange={e => setNewAttendance({ ...newAttendance, courseId: Number(e.target.value) })}
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id} style={{ background: '#111827' }}>
                      {c.courseCode} - {c.courseName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Date</label>
                <input 
                  type="date"
                  className="input-field"
                  value={newAttendance.attendanceDate}
                  onChange={e => setNewAttendance({ ...newAttendance, attendanceDate: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Attendance Status</label>
                <select 
                  className="input-field"
                  value={newAttendance.status}
                  onChange={e => setNewAttendance({ ...newAttendance, status: e.target.value })}
                >
                  <option value="PRESENT" style={{ background: '#111827' }}>PRESENT</option>
                  <option value="ABSENT" style={{ background: '#111827' }}>ABSENT</option>
                  <option value="LATE" style={{ background: '#111827' }}>LATE</option>
                  <option value="EXCUSED" style={{ background: '#111827' }}>EXCUSED</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Remarks</label>
                <input 
                  type="text"
                  className="input-field"
                  placeholder="e.g. Lab Session 03"
                  value={newAttendance.remarks}
                  onChange={e => setNewAttendance({ ...newAttendance, remarks: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowMarkModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Attendance</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
