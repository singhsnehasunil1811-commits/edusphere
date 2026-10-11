# TECH STACK AND WORKING MECHANISM
## EDUSPHERE — APSIT INTELLIGENCE PLATFORM
**Institution:** A. P. Shah Institute of Technology (APSIT), Thane  
**Candidate:** Sneha Singh (`singhsnehasunil1811-commits`)  
**Project:** Full Stack Java Programming (FSJP) Mini Project  
**Repository:** https://github.com/singhsnehasunil1811-commits/edusphere  

---

## 1. COMPLETE TECH STACK

### 1.1 FRONTEND TECHNOLOGIES
- **HTML5:** Semantic document structure for all 18 views including landing hero, security login, student records, faculty directory, marks entry, and exam schedules.
- **CSS3 & Modern Design Tokens:** Glassmorphism styling, responsive flexbox/grid layouts, dark/light theme variables, and custom typography.
- **CSS 3D Transforms & Keyframes:** Powers the 3D rotating EduSphere brand logo featuring 3 concentric orbital rings (spinRing1, spinRing2, spinRing3), floating graduation cap, and rotating core displaying the letter "E".
- **HTML5 2D Canvas API:** Real-time ambient background particle system calculating velocity vectors for floating nodes.
- **JavaScript (Vanilla ES6+):** Zero-dependency modular client architecture handling routing, DOM binding, and asynchronous workflows.
- **Font Awesome 6.4.0:** Vector icon pack for intuitive dashboard navigation, status pills, and action controls.

### 1.2 CLIENT MODULES & LOGIC ENGINES (js/)
- **auth.js (Authentication & RBAC):** Role-based access control (Admin, Faculty, Student), password strength evaluation, and URL session protection guards.
- **api.js (Data Layer & Bridge):** Centralized state management with integrated mock database (localStorage) and seamless REST bridge to Spring Boot controllers.
- **marks.js (Grading Engine):** Automated assessment calculator combining internal and external marks into letter grades and GPAs.
- **attendance.js (Shortage Radar):** Automated 75% attendance compliance engine calculating deficit metrics and recovery lecture targets.
- **chatbot.js (EduAssist Virtual Bot):** Context-aware helper bot providing instant guidance on academic rules and navigation.
- **app.js (Layout Manager):** Dynamic sidebar generation adapting options based on active user privileges.

### 1.3 BACKEND TECHNOLOGIES
- **Java 17 (LTS):** Enterprise object-oriented language applying inheritance, encapsulation, polymorphism, and abstraction.
- **Spring Boot 3.x:** Micro-framework running an embedded Apache Tomcat server on port 8080.
- **RESTful Web Services:** Clean JSON endpoints for student records, courses, attendance, and evaluation queries.
- **Spring Data JPA & Hibernate ORM:** Object-relational mapping binding Java entities to database schemas.
- **Apache Maven:** Build and dependency management tool.

### 1.4 DATABASE & STORAGE
- **H2 In-Memory Database:** Embedded relational engine pre-loaded with data.sql for rapid testing and demonstrations.
- **MariaDB / MySQL (Port 3306):** Relational production-ready database engine.
- **Browser LocalStorage:** Resilient client cache (edu_user, edu_token, edu_students, edu_faculty, edu_custom_users).

### 1.5 DEPLOYMENT & VERSION CONTROL
- **Git & GitHub:** Version controlled under branch trail and published to github.com/singhsnehasunil1811-commits/edusphere.
- **Vercel:** Configured with vercel.json for static edge deployment with clean URLs and security headers.

---

## 2. SYSTEM WORKING & STEP-BY-STEP DATA FLOW

### STEP 1: HERO LANDING & SYSTEM TELEMETRY (index.html)
1. User navigates to http://localhost:8080/index.html.
2. Background Canvas initializes, animating particles across the viewport.
3. 3D EduSphere Logo renders in the navbar with rotating core and orbital rings.
4. Live telemetry counters display campus stats: 4 Departments, 105+ Enrolled Students, 88.5% Average Attendance, 3.78 Mean GPA.
5. User clicks "Sign In" to proceed to the authentication portal.

### STEP 2: AUTHENTICATION & ROLE-BASED ACCESS CONTROL (login.html)
1. User selects their role tab: Admin, Faculty, or Student.
2. User enters credentials or clicks one of the Quick Demo Fill buttons:
   - Admin: admin@college.edu.in / admin123
   - Faculty: faculty@college.edu.in / admin123
   - Student: student@college.edu.in / admin123
3. The auth.login() function checks inputs against built-in credentials and custom registered users.
4. If valid, an authentication token (edu_token) and profile payload (edu_user) are saved to localStorage.
5. User is redirected to pages/dashboard.html.

### STEP 3: SELF-SERVICE USER REGISTRATION
1. Prospective users click "Create New Account" on the login card.
2. An interactive signup modal opens without reloading the page.
3. Selecting "Student" dynamically exposes Semester and Roll Number fields.
4. Form validation verifies name, valid email, matching passwords, and minimum 8-character password strength.
5. On submission, the system generates a unique identifier (e.g., STU-CS-2001), stores credentials in edu_custom_users, appends the record into the student/faculty directory, and auto-fills the login form.

### STEP 4: DASHBOARD & ROLE-SPECIFIC NAVIGATION (dashboard.html)
1. The route guard (auth.requireAuth()) verifies that an active session token exists.
2. app.js inspects the role and builds the sidebar:
   - Admin: Full system access (Students, Faculty, Departments, Courses, Marks, Attendance, Reports, Settings).
   - Faculty: Student directory, Marks entry, Attendance tracker, and Course schedules.
   - Student: Personal profile, My Marks, My Attendance, and Class notices.
3. Summary cards render live metrics and recent activity feeds.

### STEP 5: AUTOMATED MARKS EVALUATION ENGINE (marks.html)
1. Faculty selects a student and course subject.
2. Faculty enters Internal Assessment marks (0 to 30) and External Exam marks (0 to 70).
3. Live listener calculates:
   Total = Internal + External (out of 100)
   Percentage = (Total / 100) * 100
4. Automated letter grade assignment:
   - >= 90% : Grade A+ (Exceptional)
   - >= 80% : Grade A (Excellent)
   - >= 70% : Grade B+ (Very Good)
   - >= 60% : Grade B (Good)
   - >= 50% : Grade C (Satisfactory)
   - >= 40% : Grade D (Pass)
   - < 40%  : Grade F (Fail)
5. Record updates the student's cumulative grade sheet instantly.

### STEP 6: ATTENDANCE SHORTAGE RADAR ENGINE (attendance.html)
1. System tracks attended classes (A) against total conducted classes (T).
2. Computes percentage: (A / T) * 100.
3. If percentage >= 75%: Status is marked with a Green "Good Standing" badge.
4. If percentage < 75%: Triggers a Red "Shortage Alert" badge and calculates required recovery classes (C):
   C = ceil((0.75 * T - A) / 0.25)
5. Generates human-readable recommendation: "Student must attend next C consecutive lectures to regain examination eligibility."

### STEP 7: EDUASSIST VIRTUAL ACADEMIC ASSISTANT (chatbot.js)
1. Floating robot widget accessible across every page.
2. Parses user inquiries against keyword dictionaries (e.g., "attendance", "grade", "exam", "course").
3. Returns instant answers regarding college regulations, criteria, and quick action navigation links.

### STEP 8: SESSION TERMINATION
1. Clicking "Logout" invokes auth.logout().
2. Session tokens (edu_token, edu_user) are purged from storage.
3. Browser safely redirects back to login.html.
