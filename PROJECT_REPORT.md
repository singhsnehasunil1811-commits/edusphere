# ACADEMIC PROJECT REPORT

**PROJECT TITLE:** EDUSPHERE — APSIT INTELLIGENCE PLATFORM  
**SUBTITLE:** Integrated Academic Success & Student Management Portal  
**INSTITUTION:** A. P. Shah Institute of Technology (APSIT), Thane  
**DEPARTMENT:** Computer Engineering / Information Technology  
**COURSE:** Full Stack Java Programming (FSJP) Mini Project  
**ACADEMIC YEAR:** 2025–2026  
**CANDIDATE NAME:** Sneha Singh  
**GITHUB REPOSITORY:** https://github.com/singhsnehasunil1811-commits/edusphere  

---

## 1. CERTIFICATE / DECLARATION

This is to certify that the project entitled **"EDUSPHERE — APSIT Intelligence Platform"** is a bonafide work carried out by **Sneha Singh** under the guidance of the faculty of the Department of Computer Engineering / Information Technology, A. P. Shah Institute of Technology, in partial fulfillment of the requirements for the degree and coursework of **Full Stack Java Programming (FSJP)**.

---

## 2. ABSTRACT

In contemporary educational institutions, academic records such as attendance logs, examination performance, student profiles, and curriculum allocations are frequently handled across disconnected platforms or manual registries. This fragmentation introduces delays in administrative decision-making and impairs timely interventions for academically vulnerable students.

**EDUSPHERE — APSIT Intelligence Platform** is an enterprise-grade academic management system engineered to provide a centralized portal for students, teaching faculty, and administrators. Built with a responsive, modern glassmorphic interface, interactive 3D visual elements, and a robust Java Spring Boot architectural foundation, the platform delivers:
1. Multi-role Access Control (Admin, Faculty, Student),
2. Real-time Attendance Shortage Detection (75% statutory threshold),
3. Automated Continuous Assessment & Grade Calculations (Internal 30 + External 70 marks),
4. Interactive Onboarding & User Registration,
5. EduAssist Context-Aware Virtual Academic Assistant.

The solution ensures high availability and resilience through an adaptive data layer that interoperates with both cloud REST endpoints and browser-based client state persistence.

---

## 3. INTRODUCTION & MOTIVATION

Academic management systems serve as the operational backbone of engineering colleges. At **A. P. Shah Institute of Technology (APSIT)**, students and faculty require an intuitive, low-latency digital workspace to review schedules, submit assessments, and monitor curricular progress.

### Primary Objectives:
- **Centralization:** Consolidate student information, department data, course catalogs, and examination reports into one interface.
- **Academic Monitoring:** Automate attendance deficit alerts so that learners falling below 75% receive instant visual warnings before semester examinations.
- **Accurate Evaluation:** Eliminate manual calculation discrepancies in grade assignments through a standardized, rule-based grading pipeline.
- **Modern User Experience:** Provide a high-aesthetic user interface with dark/light theming, keyboard accessibility, mobile adaptability, and interactive 3D visual anchors.

---

## 4. SYSTEM ARCHITECTURE & DESIGN

The application is structured into a clean three-tiered modular architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                   PRESENTATION TIER (UI)                    │
│  - Semantic HTML5 & Modern CSS3 Design Tokens               │
│  - Canvas 2D Dynamic Ambient Particle Background            │
│  - 3D Rotating Logo Component ("E" Core + Orbital Rings)    │
│  - Responsive Mobile Navigation Drawer & Toast Alerts       │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                 APPLICATION & STATE LOGIC                   │
│  - js/auth.js       : Session Guards & RBAC Validation      │
│  - js/api.js        : REST Adapter & Persistent Local DB   │
│  - js/marks.js      : Real-Time Grade & Evaluation Math     │
│  - js/attendance.js : 75% Shortage Radar & Recovery Logic   │
│  - js/chatbot.js    : EduAssist Rule-Based AI Assistant     │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                     BACKEND & DATA TIER                     │
│  - Java 17+ / Spring Boot REST Controllers                  │
│  - Spring Data JPA Repositories & Hibernate ORM             │
│  - Inheritance Mapping: Person (Superclass) -> Student      │
│  - H2 Relational In-Memory Database / MariaDB Engine        │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. OBJECT-ORIENTED PROGRAMMING (OOP) PRINCIPLES APPLIED

The platform strictly reflects foundational object-oriented design patterns required by the FSJP curriculum:

1. **Inheritance & Hierarchical Modeling:**
   - Base Abstract Class: `Person` containing universally shared identity fields (`id`, `firstName`, `lastName`, `email`, `phone`, `gender`).
   - Derived Entity: `Student extends Person` adding domain-specific fields (`rollNumber`, `department`, `gpa`, `semester`, `status`).
2. **Encapsulation:**
   - Private attributes wrapped with strongly validated accessor and mutator methods.
3. **Data Abstraction & Separation of Concerns:**
   - Controller classes handle HTTP request routing, Service layers encapsulate business workflows, and Repositories isolate persistence queries.
4. **Polymorphic Execution:**
   - Dynamic role-based UI adaptations where the identical application shell loads tailored navigation options depending on whether the authenticated principal is an Administrator, Faculty, or Student.

---

## 6. MODULE-WISE FUNCTIONAL SPECIFICATIONS

### 6.1 Landing & Scroll Hero (`index.html`)
- Ambient canvas particle animation with high-contrast typography.
- Real-time campus telemetry statistics (4 Engineering Departments, 105+ Enrolled Students, 88.5% Average Attendance, 3.78 Mean GPA).
- Direct call-to-action routing into the security portal.

### 6.2 Authentication & Security Portal (`login.html`)
- Role-based tabs (Admin, Faculty, Student) with pre-configured quick demo fill buttons for presentation convenience.
- Secure session tokens stored using browser local storage keys with path-aware route guards.
- Password strength meter assessing character length, uppercase, numbers, and special symbol compliance.

### 6.3 Self-Service User Registration Modal
- Modal dialog permitting new users to sign up into the live environment.
- Context-sensitive form logic: selecting the "Student" role dynamically prompts for Semester and Roll Number.
- Duplicate email prevention checks and instant auto-population into the login fields upon successful account generation.

### 6.4 Core Academic Management Views (`pages/`)
- **Student Success Directory (`students.html`):** Complete CRUD interface, live search across names/roll numbers, departmental filtering, and detailed student profile viewing.
- **Faculty Directory (`faculty.html`):** Roster of professors and lecturers, qualifications, experience, and contact points.
- **Curriculum & Courses (`courses.html`):** Course catalog including credit allocations, course codes, and instructor assignments.
- **Attendance Shortage Radar (`attendance.html`):** Automated percentage calculation flagging records under 75% with recovery advisories.
- **Automated Marks Evaluation (`marks.html`):** Evaluation grid factoring internal (30) and external (70) scores, instantaneously producing percentages, grades (A+, A, B+, B, C, D, F), and grade point averages.
- **EduAssist Academic Bot:** On-page floating assistant capable of resolving common academic FAQs regarding attendance criteria, marks calculation, and administrative workflows.

---

## 7. EVALUATION CRITERIA & RESULTS

| Test Vector | Expected Outcome | Observed Result | Status |
|---|---|---|---|
| User Authentication | Validate role & password, store session | Authenticated; redirected to Dashboard | PASS |
| New Account Signup | Add user to credentials & student registry | Profile created & login credentials auto-filled | PASS |
| Attendance Calculation | Identify students with attendance < 75% | Shortage badge highlighted with recovery data | PASS |
| Grade Computation | 30 internal + 70 external -> Automated grade | Percentage & letter grade rendered live | PASS |
| Endpoint Availability | All 18 application routes return HTTP 200 | Verified across all pages | PASS |
| Responsive Layout | Proper rendering across mobile and desktop | Clean layout adjustment via media queries | PASS |

---

## 8. DEPLOYMENT & EXECUTION INSTRUCTIONS

### Localhost Execution:
1. Open PowerShell or Command Prompt.
2. Ensure Spring Boot server is active on `http://localhost:8080`.
3. Launch portal by opening `http://localhost:8080/index.html` or `http://localhost:8080/login.html`.

### Default Demonstration Credentials:
- **Admin:** `admin@college.edu.in` / `admin123`
- **Faculty:** `faculty@college.edu.in` / `admin123`
- **Student:** `student@college.edu.in` / `admin123`

---

## 9. CONCLUSION & FUTURE SCOPE

The **EDUSPHERE APSIT Intelligence Platform** fulfills the objectives of an enterprise-grade academic portal by blending dependable full-stack engineering standards with a contemporary user experience. 

### Future Enhancements:
- Direct integration with university RFID/biometric hardware sensors for automated classroom check-ins.
- Automated SMS/Email alerting gateways notifying guardians of severe attendance deficits.
- Predictive machine learning algorithms to identify students requiring early academic mentoring.
