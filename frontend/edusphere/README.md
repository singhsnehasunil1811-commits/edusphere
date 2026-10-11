# Frontend Integration Guide for EduSphere / Student Management

This folder contains **all frontend files** (HTML, CSS, JavaScript) extracted and ready to plug directly into any backend project.

---

## 📁 Directory Structure

```text
frontend-standalone/
│
├── index.html            # Landing / Hero page (scrollable sections, live metrics)
├── login.html            # Dedicated login portal with demo credential chips
├── app.html              # Core application dashboard & role-specific views
│
├── css/
│   └── styles.css        # Tech theme (dark/light), glassmorphism, animations & circular cursor
│
└── js/
    ├── api.js            # Fetch wrapper, error toast handling & credentials
    ├── auth.js           # Session checking, role validation & UI visibility restrictions
    ├── cursor.js         # Circular follower cursor tracker
    ├── dashboard.js      # Dashboard charts, metric counters & particle canvas
    ├── students.js       # Student directory, modal profiler & transcript downloads
    ├── attendance.js     # Daily attendance marker & student attendance breakdown
    ├── marks.js          # Marks entry, grade computation & student GPA breakdown
    ├── assignments.js    # Assignment submission & teacher coursework manager
    ├── fees.js           # Fee management ledger & payment status
    ├── notices.js        # Campus circulars & announcements
    ├── timetable.js      # Weekly lecture timetable grid
    └── users.js          # User account administration (Admin view)
```

---

## 🔌 How to Combine with Your Friend's Backend

### Option A: If Your Friend Uses Spring Boot (Java)
Copy the files directly into their Maven project structure:
* **Destination path:** `backend/src/main/resources/static/`
* Once pasted there, Spring Boot will serve them automatically at:
  * `http://localhost:8080/index.html` (Landing)
  * `http://localhost:8080/login.html` (Login)
  * `http://localhost:8080/app.html` (Dashboard)

---

### Option B: If Your Friend Runs a Separate Backend Server (Node.js, Express, Django, FastAPI, Spring Boot on another port)
If the frontend runs on port `3000` (or `5500` via Live Server) and their backend runs on `http://localhost:8080`:

1. Open `js/api.js` line 3:
   ```javascript
   // Change from:
   baseUrl: '/api',

   // To (their backend address):
   baseUrl: 'http://localhost:8080/api',
   ```
2. In `js/api.js` line 7:
   ```javascript
   // Change from:
   credentials: 'same-origin',

   // To (allow cross-port cookies/sessions):
   credentials: 'include',
   ```
3. Ensure their backend has **CORS** enabled for your frontend origin with `allowCredentials = true`.

---

## 📡 API Endpoints Required by this Frontend

| Module | Endpoint | Method | Expected Output |
| :--- | :--- | :--- | :--- |
| **Auth** | `/api/auth/login` | `POST` | Sets session cookie / returns authenticated user |
| **Auth** | `/api/auth/me` | `GET` | Returns current user `{ email, fullName, role }` |
| **Auth** | `/api/auth/logout` | `POST` | Clears session cookie |
| **Dashboard** | `/api/dashboard/stats` | `GET` | Counts, averages, and charts data |
| **Students** | `/api/students` | `GET`, `POST` | Pageable students list & student registration |
| **Profile** | `/api/students/profile/me`| `GET` | Current student's profile & grades |
| **Attendance** | `/api/attendance` | `GET`, `POST` | Roster list & bulk attendance save |
| **Marks** | `/api/marks` | `GET`, `POST` | Examination marks & grading points |
| **Assignments**| `/api/assignments` | `GET`, `POST` | Course assignments & submissions |
| **Fees** | `/api/fees` | `GET`, `POST` | Institutional fee ledger & payment recording |
| **Notices** | `/api/notices` | `GET`, `POST` | Campus notices |
| **Timetable** | `/api/timetable` | `GET`, `POST` | Weekly schedule slots |
| **Users** | `/api/users` | `GET`, `POST` | User credential management |
