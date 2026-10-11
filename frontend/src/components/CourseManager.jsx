import React, { useState } from 'react';
import { BookOpen, Plus, Trash2, User, Award, CheckCircle } from 'lucide-react';

export default function CourseManager({ courses, onAddCourse, onDeleteCourse }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCourse, setNewCourse] = useState({
    courseCode: '',
    courseName: '',
    department: 'Computer Science',
    credits: 4,
    professor: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newCourse.courseCode || !newCourse.courseName) return;
    onAddCourse(newCourse);
    setNewCourse({ courseCode: '', courseName: '', department: 'Computer Science', credits: 4, professor: '' });
    setShowAddForm(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Course & Curriculum Management</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Module VI: Spring Data JPA Course Repositories & RESTful API mapping
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={18} /> {showAddForm ? 'Close Form' : 'Create Course'}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="glass-panel" style={{ padding: '24px', borderColor: 'var(--border-highlight)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>New Course Details</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 1.5fr auto', gap: '12px', alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Code *</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="CS501" 
                value={newCourse.courseCode}
                onChange={e => setNewCourse({ ...newCourse, courseCode: e.target.value })}
                required 
              />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Course Title *</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Advanced Microservices with Spring" 
                value={newCourse.courseName}
                onChange={e => setNewCourse({ ...newCourse, courseName: e.target.value })}
                required 
              />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Department</label>
              <select 
                className="input-field" 
                value={newCourse.department}
                onChange={e => setNewCourse({ ...newCourse, department: e.target.value })}
              >
                <option value="Computer Science" style={{ background: '#111827' }}>Computer Science</option>
                <option value="Information Technology" style={{ background: '#111827' }}>IT</option>
                <option value="Electronics" style={{ background: '#111827' }}>Electronics</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Credits</label>
              <input 
                type="number" 
                className="input-field" 
                value={newCourse.credits}
                onChange={e => setNewCourse({ ...newCourse, credits: parseInt(e.target.value, 10) })}
                min="1" max="6"
              />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Instructor</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Dr. Smith" 
                value={newCourse.professor}
                onChange={e => setNewCourse({ ...newCourse, professor: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ height: '42px' }}>Save</button>
          </form>
        </div>
      )}

      {/* Grid of Courses */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {courses.map(course => (
          <div key={course.id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ 
                  background: 'rgba(236, 72, 153, 0.15)', 
                  color: '#f472b6', 
                  fontFamily: 'monospace', 
                  fontWeight: 800, 
                  padding: '4px 10px', 
                  borderRadius: '6px',
                  fontSize: '0.85rem'
                }}>
                  {course.courseCode}
                </span>
                <span className="badge badge-active">{course.credits} Credits</span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '8px' }}>{course.courseName}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Department: <strong>{course.department}</strong>
              </p>
            </div>

            <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <User size={14} /> {course.professor || 'Assigned Instructor'}
              </div>
              <button className="btn btn-danger btn-sm" onClick={() => onDeleteCourse(course.id)}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
