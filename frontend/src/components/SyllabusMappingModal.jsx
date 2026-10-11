import React from 'react';
import { Award, BookOpen, CheckCircle, Code, Layers, Server, ShieldCheck, X } from 'lucide-react';

export default function SyllabusMappingModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const syllabusMapping = [
    {
      module: "Module I: Introduction to OOP in Java",
      outcomes: "LO 1 - Objects, Class, Encapsulation, Abstraction, Polymorphism, Constructors & Overloading",
      files: ["Person.java (Abstract Class)", "Student.java (Subclass)", "Gender.java"],
      description: "Implemented abstract base class 'Person' with getter/setter encapsulation, overloaded constructors, and abstract method getRoleDescription()."
    },
    {
      module: "Module II: Inheritance & Exception Handling",
      outcomes: "LO 2 - Types of Inheritance, Method Overriding, Abstract Classes, Custom Exceptions, ControllerAdvice",
      files: ["Student.java (extends Person)", "ResourceNotFoundException.java", "GlobalExceptionHandler.java"],
      description: "Demonstrates inheritance ('Student extends Person'), method overriding, user-defined exceptions, and Spring @ControllerAdvice for global error handling."
    },
    {
      module: "Module III: Client and Server Side Programming",
      outcomes: "LO 3 - JDBC Architecture, Drivers, Database Connectivity & Entity Repositories",
      files: ["schema.sql", "data.sql", "StudentRepository.java", "H2 Database Configuration"],
      description: "Configured Spring Data JPA / JDBC persistence with H2 database, initial SQL schema scripts, and custom JPQL database queries."
    },
    {
      module: "Module IV: Fundamentals of JavaScript & DOM",
      outcomes: "LO 4 - JavaScript Conditionals, Functions, DOM HTML Features, Events, Regex Form Validation & Fetch API",
      files: ["StudentModal.jsx", "index.css", "App.jsx (fetch APIs & async/await)"],
      description: "Implemented JavaScript client-side email and phone regex validation, DOM event listeners, and asynchronous HTTP fetch requests."
    },
    {
      module: "Module V: Web Programming using React",
      outcomes: "LO 5 - React Framework, Components, React State & Props, Hooks, SPA Routing & Conditional Rendering",
      files: ["App.jsx", "Header.jsx", "Dashboard.jsx", "StudentList.jsx", "CourseManager.jsx"],
      description: "Built single page web app (SPA) using React 18, functional components, useState, useEffect, props passing, and dynamic conditional tab rendering."
    },
    {
      module: "Module VI: Applications of Spring Framework",
      outcomes: "LO 6 - Spring Boot, Microservice Architecture, Dependency Injection (IoC), Spring Annotations & RESTful APIs",
      files: ["StudentManagementApplication.java", "StudentController.java", "StudentServiceImpl.java", "pom.xml"],
      description: "Developed production RESTful Web Services with @RestController, loose coupling via @Service interfaces, and @Autowired dependency injection."
    }
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '800px' }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Award size={26} color="#ec4899" />
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Full Stack Java Syllabus Mapping</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Course Code: 2163611 | Lab Evaluation Guide</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Content list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '60vh', overflowY: 'auto', paddingRight: '6px' }}>
          {syllabusMapping.map((item, idx) => (
            <div key={idx} style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#818cf8' }}>{item.module}</h4>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                  {item.outcomes.split(' - ')[0]}
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '8px' }}>{item.description}</p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {item.files.map((file, i) => (
                  <span key={i} style={{ fontSize: '0.75rem', fontFamily: 'monospace', background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                    <Code size={10} style={{ display: 'inline', marginRight: '4px' }} /> {file}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button className="btn btn-primary" onClick={onClose}>Close Syllabus View</button>
        </div>

      </div>
    </div>
  );
}
