import React, { useState } from 'react';
import { Search, Filter, Plus, Edit, Trash2, Mail, Phone, MapPin, Eye, AlertCircle } from 'lucide-react';

export default function StudentList({ students, onAddStudent, onEditStudent, onDeleteStudent, searchQuery, setSearchQuery }) {
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [viewStudent, setViewStudent] = useState(null);

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = searchQuery === '' || 
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDept = selectedDept === 'ALL' || student.department === selectedDept;
    const matchesStatus = selectedStatus === 'ALL' || student.status === selectedStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const departments = ['ALL', 'Computer Science', 'Information Technology', 'Electronics'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Search & Filter Header Bar */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Search input */}
        <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            className="input-field"
            placeholder="Search by name, email, roll number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          
          <select 
            className="input-field" 
            value={selectedDept} 
            onChange={(e) => setSelectedDept(e.target.value)}
            style={{ width: 'auto' }}
          >
            {departments.map(dept => (
              <option key={dept} value={dept} style={{ background: '#111827' }}>
                Dept: {dept}
              </option>
            ))}
          </select>

          <select 
            className="input-field" 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="ALL" style={{ background: '#111827' }}>Status: ALL</option>
            <option value="ACTIVE" style={{ background: '#111827' }}>ACTIVE</option>
            <option value="INACTIVE" style={{ background: '#111827' }}>INACTIVE</option>
            <option value="GRADUATED" style={{ background: '#111827' }}>GRADUATED</option>
          </select>

          <button className="btn btn-primary" onClick={onAddStudent}>
            <Plus size={18} /> Add Student
          </button>
        </div>

      </div>

      {/* Student Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Student Name</th>
              <th>Contact Info</th>
              <th>Department</th>
              <th>Semester</th>
              <th>GPA</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  <AlertCircle size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
                  <p>No student records found matching your filter criteria.</p>
                </td>
              </tr>
            ) : (
              filteredStudents.map(student => (
                <tr key={student.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#818cf8' }}>
                    {student.rollNumber}
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{student.firstName} {student.lastName}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Gender: {student.gender}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Mail size={12} color="var(--text-muted)" /> {student.email}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={12} color="var(--text-muted)" /> {student.phone}
                    </div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{student.department}</td>
                  <td style={{ fontWeight: 600 }}>Sem {student.semester || 1}</td>
                  <td style={{ fontWeight: 700, color: (student.gpa || 0) >= 3.5 ? '#34d399' : '#f59e0b' }}>
                    {student.gpa ? student.gpa.toFixed(2) : 'N/A'}
                  </td>
                  <td>
                    <span className={`badge badge-${(student.status || 'ACTIVE').toLowerCase()}`}>
                      {student.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => setViewStudent(student)}
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => onEditStudent(student)}
                        title="Edit Student"
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        className="btn btn-danger btn-sm" 
                        onClick={() => onDeleteStudent(student.id)}
                        title="Delete Student"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View Detail Modal */}
      {viewStudent && (
        <div className="modal-backdrop" onClick={() => setViewStudent(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Student Profile Details</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setViewStudent(null)}>✕</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-highlight)' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#818cf8' }}>
                  {viewStudent.firstName} {viewStudent.lastName}
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Roll Number: {viewStudent.rollNumber}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.9rem' }}>
                <div><strong>Email:</strong> {viewStudent.email}</div>
                <div><strong>Phone:</strong> {viewStudent.phone}</div>
                <div><strong>Department:</strong> {viewStudent.department}</div>
                <div><strong>Semester:</strong> {viewStudent.semester}</div>
                <div><strong>GPA:</strong> {viewStudent.gpa}</div>
                <div><strong>Gender:</strong> {viewStudent.gender}</div>
                <div><strong>Date of Birth:</strong> {viewStudent.dateOfBirth || 'N/A'}</div>
                <div><strong>Status:</strong> {viewStudent.status}</div>
              </div>

              {viewStudent.address && (
                <div style={{ fontSize: '0.9rem' }}>
                  <strong>Address:</strong> {viewStudent.address}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button className="btn btn-secondary" onClick={() => setViewStudent(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
