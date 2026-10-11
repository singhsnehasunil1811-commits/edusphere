import React from 'react';
import { GraduationCap, BookOpen, Users, CalendarCheck, Award, Code2, Server } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, onOpenSyllabusModal, isBackendConnected }) {
  return (
    <header className="glass-panel" style={{ borderRadius: '0 0 20px 20px', borderTop: 'none', padding: '16px 28px', marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #6366f1, #ec4899)', 
            padding: '10px', 
            borderRadius: '14px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
          }}>
            <GraduationCap size={28} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Academia<span style={{ color: '#6366f1', WebkitTextFillColor: 'initial' }}>Pulse</span>
            </h1>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Full Stack Java Student Management System
            </p>
          </div>
        </div>

        {/* Navigation Tabs (React SPA - LO 5) */}
        <nav style={{ display: 'flex', gap: '6px', background: 'rgba(15, 23, 42, 0.7)', padding: '6px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <button 
            className={`btn btn-sm ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('dashboard')}
            style={{ border: 'none' }}
          >
            <Users size={16} /> Overview
          </button>
          
          <button 
            className={`btn btn-sm ${activeTab === 'students' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('students')}
            style={{ border: 'none' }}
          >
            <GraduationCap size={16} /> Students Directory
          </button>
          
          <button 
            className={`btn btn-sm ${activeTab === 'courses' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('courses')}
            style={{ border: 'none' }}
          >
            <BookOpen size={16} /> Courses
          </button>

          <button 
            className={`btn btn-sm ${activeTab === 'attendance' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('attendance')}
            style={{ border: 'none' }}
          >
            <CalendarCheck size={16} /> Attendance
          </button>
        </nav>

        {/* Extra Actions & Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: isBackendConnected ? '#34d399' : '#f87171', background: 'rgba(15,23,42,0.6)', padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
            <Server size={14} />
            <span style={{ fontWeight: 600 }}>{isBackendConnected ? 'Spring Boot REST Connected' : 'Simulated / Standalone'}</span>
          </div>

          <button 
            className="btn btn-secondary btn-sm"
            onClick={onOpenSyllabusModal}
            style={{ borderColor: 'rgba(236, 72, 153, 0.4)', background: 'rgba(236, 72, 153, 0.1)', color: '#f472b6' }}
          >
            <Award size={16} /> Syllabus Mapping (LO1-LO6)
          </button>
        </div>

      </div>
    </header>
  );
}
