import React, { useState, useEffect } from 'react';
import { Save, X, AlertCircle } from 'lucide-react';

export default function StudentModal({ isOpen, onClose, onSave, editingStudent }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'MALE',
    dateOfBirth: '',
    rollNumber: '',
    department: 'Computer Science',
    gpa: '3.50',
    semester: '5',
    status: 'ACTIVE',
    address: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingStudent) {
      setFormData({
        firstName: editingStudent.firstName || '',
        lastName: editingStudent.lastName || '',
        email: editingStudent.email || '',
        phone: editingStudent.phone || '',
        gender: editingStudent.gender || 'MALE',
        dateOfBirth: editingStudent.dateOfBirth || '',
        rollNumber: editingStudent.rollNumber || '',
        department: editingStudent.department || 'Computer Science',
        gpa: editingStudent.gpa != null ? String(editingStudent.gpa) : '3.50',
        semester: editingStudent.semester != null ? String(editingStudent.semester) : '5',
        status: editingStudent.status || 'ACTIVE',
        address: editingStudent.address || ''
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        gender: 'MALE',
        dateOfBirth: '2003-05-14',
        rollNumber: `CS2026-${Math.floor(100 + Math.random() * 900)}`,
        department: 'Computer Science',
        gpa: '3.65',
        semester: '5',
        status: 'ACTIVE',
        address: ''
      });
    }
    setErrors({});
  }, [editingStudent, isOpen]);

  if (!isOpen) return null;

  // Module IV: JavaScript Client-side Validation (Regex check for email & phone)
  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';

    // Email regex validation (LO 4 syllabus experiment requirement)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address (must contain @ and . domain)';
    }

    if (!formData.rollNumber.trim()) newErrors.rollNumber = 'Roll number is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';

    const gpaVal = parseFloat(formData.gpa);
    if (isNaN(gpaVal) || gpaVal < 0 || gpaVal > 4.0) {
      newErrors.gpa = 'GPA must be a valid number between 0.00 and 4.00';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSave({
      ...formData,
      gpa: parseFloat(formData.gpa),
      semester: parseInt(formData.semester, 10),
      id: editingStudent ? editingStudent.id : undefined
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
            {editingStudent ? 'Edit Student Record' : 'Register New Student'}
          </h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>First Name *</label>
              <input 
                type="text" 
                className="input-field"
                value={formData.firstName}
                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="e.g. Aarav"
              />
              {errors.firstName && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.firstName}</span>}
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Last Name *</label>
              <input 
                type="text" 
                className="input-field"
                value={formData.lastName}
                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="e.g. Sharma"
              />
              {errors.lastName && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.lastName}</span>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Email Address * (JS Validated)</label>
              <input 
                type="email" 
                className="input-field"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="student@university.edu"
              />
              {errors.email && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.email}</span>}
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Roll Number *</label>
              <input 
                type="text" 
                className="input-field"
                value={formData.rollNumber}
                onChange={e => setFormData({ ...formData, rollNumber: e.target.value })}
                placeholder="CS2026-001"
              />
              {errors.rollNumber && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.rollNumber}</span>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Phone *</label>
              <input 
                type="text" 
                className="input-field"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 9876543210"
              />
              {errors.phone && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.phone}</span>}
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Department</label>
              <select 
                className="input-field"
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
              >
                <option value="Computer Science" style={{ background: '#111827' }}>Computer Science</option>
                <option value="Information Technology" style={{ background: '#111827' }}>Information Technology</option>
                <option value="Electronics" style={{ background: '#111827' }}>Electronics</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Semester</label>
              <select 
                className="input-field"
                value={formData.semester}
                onChange={e => setFormData({ ...formData, semester: e.target.value })}
              >
                {[1,2,3,4,5,6,7,8].map(sem => (
                  <option key={sem} value={sem} style={{ background: '#111827' }}>Semester {sem}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>GPA (0.00 - 4.00)</label>
              <input 
                type="number" 
                step="0.01"
                className="input-field"
                value={formData.gpa}
                onChange={e => setFormData({ ...formData, gpa: e.target.value })}
              />
              {errors.gpa && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.gpa}</span>}
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Gender</label>
              <select 
                className="input-field"
                value={formData.gender}
                onChange={e => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="MALE" style={{ background: '#111827' }}>MALE</option>
                <option value="FEMALE" style={{ background: '#111827' }}>FEMALE</option>
                <option value="OTHER" style={{ background: '#111827' }}>OTHER</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Status</label>
              <select 
                className="input-field"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="ACTIVE" style={{ background: '#111827' }}>ACTIVE</option>
                <option value="INACTIVE" style={{ background: '#111827' }}>INACTIVE</option>
                <option value="GRADUATED" style={{ background: '#111827' }}>GRADUATED</option>
                <option value="SUSPENDED" style={{ background: '#111827' }}>SUSPENDED</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Address</label>
            <input 
              type="text" 
              className="input-field"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              placeholder="Campus address / city"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> Save Record
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
