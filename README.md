# EduPortal - College Student Management System with AI Assistant

A complete, modern, professional, responsive frontend application built for a college **Full Stack Java Programming** project.

---

## 📁 Complete Folder Structure

```
student-management-system/
│
├── index.html                  # Entry point & auth redirect guard
├── login.html                  # Professional login page (Admin, Faculty, Student roles)
│
├── pages/                      # Application Page Views
│   ├── dashboard.html          # Admin Dashboard (Stats, Quick Actions, Activity Feed)
│   ├── students.html           # Student Management (CRUD, Search, Filter, Pagination)
│   ├── student-profile.html    # Detailed Student Profile View
│   ├── faculty.html            # Faculty Directory Management
│   ├── departments.html        # Academic Department Management
│   ├── courses.html            # Curriculum & Course Management
│   ├── marks.html              # Marks Entry & Automated Grade Calculator
│   ├── attendance.html         # Attendance Tracker & Shortage Alerts
│   ├── examinations.html       # Exam Timetable & Result Cards Generator
│   ├── reports.html            # Analytical Data Reports & Print/Export UI
│   ├── profile.html            # User Account Profile & Change Password
│   └── settings.html           # Dark/Light Mode & App Preferences
│
├── css/                        # Design System & Theme Styling
│   ├── style.css               # CSS Variables (Light/Dark themes), Modals, Toasts
│   ├── dashboard.css           # Stats Cards, Progress Bars, Quick Actions Grid
│   ├── forms.css               # Form Controls, Floating Inputs, Validation states
│   ├── tables.css              # Data Tables, Pagination Controls, Badges
│   ├── chatbot.css             # EduAssist Floating Widget & Message Bubbles
│   └── responsive.css          # Mobile Drawer & Responsive Breakpoints
│
├── js/                         # Modular JavaScript Architecture
│   ├── api.js                  # Centralized REST API Service (Mock Database + Fetch Bridge)
│   ├── auth.js                 # Authentication & Session Guard Manager
│   ├── utils.js                # Toast Alerts, Modal Controls, Grade & Attendance Math
│   ├── validation.js           # Client-side Form Validation Rules
│   ├── app.js                  # Shared Layout, Sidebar Navigation, Theme Toggle
│   ├── chatbot.js              # EduAssist AI Rule Assistant & Quick Chips
│   ├── dashboard.js            # Dashboard Statistics & Activity Feed Logic
│   ├── students.js             # Student CRUD operations, Filter, Search, Pagination
│   ├── faculty.js              # Faculty CRUD logic
│   ├── departments.js          # Department CRUD logic
│   ├── courses.js              # Course CRUD logic
│   ├── marks.js                # Live Grade & Percentage Calculation
│   ├── attendance.js           # Attendance Register & Shortage Calculation
│   ├── examinations.js         # Exam Schedules & Printable Result Cards
│   ├── reports.js              # Report Filters & CSV/PDF Mock Exports
│   ├── profile.js              # User Profile Editor
│   └── settings.js             # Theme & Language Preference Manager
│
└── README.md                   # Full Documentation & Backend Integration Guide
```

---

## 🚀 How to Run the Frontend

1. Simply navigate to the project directory:
   `C:\Users\Shivangi D Yadav\.gemini\antigravity-ide\scratch\student-management-system`
2. Open `login.html` or `index.html` in any modern web browser (Google Chrome, Microsoft Edge, Firefox, etc.).
3. You can also host it using any local HTTP server (e.g., Live Server in VS Code, `npx serve`, or `python -m http.server 3000`).

---

## 🧪 How to Test Each Feature

### 1. Authentication (`login.html`)
- Select role (**Admin**, **Faculty**, or **Student**).
- Click any of the **Quick Demo Fill** buttons at the bottom for instant credentials.
- Click **Sign In** to navigate into the Admin Dashboard.
- Test **Show/Hide Password** (eye icon) and **Forgot Password** modal.

### 2. Dark / Light Mode
- Click the **Moon / Sun** icon in the top navigation bar or go to **Settings**.
- Theme automatically toggles and persists across all pages using `localStorage`.

### 3. EduAssist Floating AI Chatbot
- Click the **floating robot icon** in the bottom right of any page.
- Try quick question buttons like *"How do I add a student?"*, *"How can I check marks?"*, or *"Help"*.
- Type custom queries into the chat box.

### 4. Student Management (`students.html`)
- **Add Student**: Click `+ Add Student`, fill the modal form, and submit.
- **Search**: Type in the search box to filter by name, roll number, or ID.
- **Filter**: Filter by Department or Year.
- **View Profile**: Click the eye icon on any student row to view their full profile card (`student-profile.html`).
- **Edit & Delete**: Edit details or trigger the confirmation dialog to delete.

### 5. Marks & Automated Grading (`marks.html`)
- Click `+ Add Student Marks`.
- Select a student, subject, internal marks (max 30), and external marks (max 70).
- Observe the **Automated Live Grade Preview** (A+, A, B+, B, C, D, F).
- Submit to render the new record in the evaluation table.

### 6. Attendance Tracker (`attendance.html`)
- Click `Mark Attendance`.
- Enter attended vs total lectures to calculate attendance percentage.
- Observe the **Good** (>= 75%) vs **Shortage** (< 75%) badge indicators.

### 7. Examinations & Result Cards (`examinations.html`)
- View scheduled exams or add a new exam schedule.
- Browse **Published Semester Result Cards**.
- Click **Print Result** to generate a clean printable statement of marks.

---

## 🔌 Future Spring Boot REST API Integration

When you build the Java Spring Boot backend, set up controllers matching these endpoints:

| Feature | Method | Spring Boot Endpoint | Frontend API Method in `api.js` |
| :--- | :--- | :--- | :--- |
| **Authentication** | `POST` | `/api/auth/login` | `api.request("/auth/login", { method: "POST", body })` |
| **Students** | `GET` | `/api/students` | `api.getStudents()` |
| **Get Student** | `GET` | `/api/students/{id}` | `api.request("/students/" + id)` |
| **Create Student** | `POST` | `/api/students` | `api.createStudent(data)` |
| **Update Student** | `PUT` | `/api/students/{id}` | `api.updateStudent(id, data)` |
| **Delete Student** | `DELETE` | `/api/students/{id}` | `api.deleteStudent(id)` |
| **Faculty** | `GET` / `POST` | `/api/faculty` | `api.getFaculty()` / `api.createFaculty(data)` |
| **Departments** | `GET` / `POST` | `/api/departments` | `api.getDepartments()` / `api.createDepartment(data)` |
| **Courses** | `GET` / `POST` | `/api/courses` | `api.getCourses()` / `api.createCourse(data)` |
| **Marks** | `GET` / `POST` | `/api/marks` | `api.getMarks()` / `api.saveMarks(data)` |
| **Attendance** | `GET` / `POST` | `/api/attendance` | `api.getAttendance()` / `api.saveAttendance(data)` |
| **Examinations** | `GET` / `POST` | `/api/examinations` | `api.getExaminations()` / `api.createExamination(data)` |
| **Chatbot AI** | `POST` | `/api/chatbot/message` | `api.sendChatMessage(message)` |

---

## ⚙️ How Frontend Connects to Spring Boot Backend

In `js/api.js`, simply change:

```javascript
const API_BASE_URL = "http://localhost:8080/api";
const USE_MOCK_DATA = false; // Set to false when Spring Boot app is running!
```

No rewrite of HTML, CSS, or JS UI logic is needed. The frontend seamlessly switches from in-memory localStorage to real Spring Boot REST API calls!
