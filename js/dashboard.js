/* 
  EduPortal — Role-Based Dashboard Logic
  Admin    → Full system statistics & management overview
  Faculty  → Teaching load, student count, recent activity
  Student  → Personal academics: my marks, attendance, courses, exams
*/

document.addEventListener("DOMContentLoaded", () => {
  const user = auth.getCurrentUser();
  if (!user) return;

  const role = user.role;
  if (role === "Admin") {
    renderAdminDashboard();
  } else if (role === "Faculty") {
    renderFacultyDashboard(user);
  } else if (role === "Student") {
    renderStudentDashboard(user);
  }
});

/* =========================================================
   ADMIN DASHBOARD
   ========================================================= */
async function renderAdminDashboard() {
  // Inject admin HTML layout
  document.getElementById("dashboardContent").innerHTML = adminDashboardHTML();

  try {
    const [students, faculty, depts, courses] = await Promise.all([
      api.getStudents(), api.getFaculty(), api.getDepartments(), api.getCourses()
    ]);

    animateCount("statTotalStudents", students.length);
    animateCount("statTotalFaculty", faculty.length);
    animateCount("statTotalCourses", courses.filter(c => c.status === "Active").length);
    animateCount("statTotalDepts", depts.length);

    renderRecentStudentsTable(students.slice(-5).reverse());
    renderAdminActivities();
    renderDistribution(students, depts);
  } catch (err) {
    showToast("Error loading admin dashboard", "error");
  }
}

function adminDashboardHTML() {
  return `
    <!-- Stat Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-info"><span class="stat-label">Total Students</span><div class="stat-value" id="statTotalStudents">0</div></div>
        <div class="stat-icon-wrapper blue"><i class="fas fa-user-graduate"></i></div>
      </div>
      <div class="stat-card">
        <div class="stat-info"><span class="stat-label">Total Faculty</span><div class="stat-value" id="statTotalFaculty">0</div></div>
        <div class="stat-icon-wrapper green"><i class="fas fa-chalkboard-teacher"></i></div>
      </div>
      <div class="stat-card">
        <div class="stat-info"><span class="stat-label">Active Courses</span><div class="stat-value" id="statTotalCourses">0</div></div>
        <div class="stat-icon-wrapper purple"><i class="fas fa-book-open"></i></div>
      </div>
      <div class="stat-card">
        <div class="stat-info"><span class="stat-label">Departments</span><div class="stat-value" id="statTotalDepts">0</div></div>
        <div class="stat-icon-wrapper amber"><i class="fas fa-building"></i></div>
      </div>
    </div>

    <!-- Dashboard Grid -->
    <div class="dashboard-grid">
      <div>
        <!-- Quick Actions -->
        <div class="card">
          <h3 style="font-size:16px;font-weight:700;margin-bottom:16px;color:var(--text-primary);">Quick Actions</h3>
          <div class="quick-actions-grid">
            <a href="students.html" class="action-btn-card"><i class="fas fa-user-plus"></i><span>Add Student</span></a>
            <a href="faculty.html" class="action-btn-card"><i class="fas fa-user-tie"></i><span>Add Faculty</span></a>
            <a href="courses.html" class="action-btn-card"><i class="fas fa-journal-whills"></i><span>Add Course</span></a>
            <a href="departments.html" class="action-btn-card"><i class="fas fa-layer-group"></i><span>Add Dept</span></a>
          </div>
        </div>
        <!-- Recent Students -->
        <div class="card" style="margin-bottom:0;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <h3 style="font-size:16px;font-weight:700;color:var(--text-primary);">Recently Enrolled Students</h3>
            <a href="students.html" style="font-size:13px;font-weight:600;">View All <i class="fas fa-arrow-right"></i></a>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead><tr><th>ID</th><th>Student Name</th><th>Department</th><th>Year</th><th>Status</th></tr></thead>
              <tbody id="recentStudentsTableBody"><tr><td colspan="5" class="empty-state"><div class="spinner"></div></td></tr></tbody>
            </table>
          </div>
        </div>
      </div>
      <div>
        <!-- Distribution -->
        <div class="card">
          <h3 style="font-size:16px;font-weight:700;margin-bottom:16px;color:var(--text-primary);">Student Distribution</h3>
          <div class="distribution-list" id="distributionList">
            <div class="spinner"></div>
          </div>
        </div>
        <!-- Recent Activity -->
        <div class="card" style="margin-bottom:0;">
          <h3 style="font-size:16px;font-weight:700;margin-bottom:16px;color:var(--text-primary);">Recent Activities</h3>
          <ul class="activity-list" id="activityFeedContainer"><li class="activity-item"><div class="spinner"></div></li></ul>
        </div>
      </div>
    </div>
  `;
}

function renderRecentStudentsTable(list) {
  const tbody = document.getElementById("recentStudentsTableBody");
  if (!tbody) return;
  if (!list.length) { tbody.innerHTML = `<tr><td colspan="5" class="empty-state">No students yet</td></tr>`; return; }
  tbody.innerHTML = list.map(s => `
    <tr>
      <td><strong>${s.studentId}</strong></td>
      <td>
        <div style="display:flex;align-items:center;gap:10px;">
          <div class="table-avatar">${s.name.charAt(0)}</div>
          <div><div style="font-weight:600;">${s.name}</div><div style="font-size:11px;color:var(--text-muted);">${s.email}</div></div>
        </div>
      </td>
      <td>${s.department}</td>
      <td><span class="badge badge-info">${s.year}</span></td>
      <td><span class="badge badge-success">${s.status || "Active"}</span></td>
    </tr>
  `).join("");
}

function renderDistribution(students, depts) {
  const container = document.getElementById("distributionList");
  if (!container) return;
  if (!students.length) { container.innerHTML = `<p style="color:var(--text-muted);font-size:13px;">No data yet</p>`; return; }

  const counts = {};
  students.forEach(s => { counts[s.department] = (counts[s.department] || 0) + 1; });
  const total = students.length;
  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
  let html = "";
  Object.entries(counts).forEach(([dept, count], i) => {
    const pct = Math.round((count / total) * 100);
    const shortDept = dept.replace("Computer Science & Engineering","CSE").replace("Information Technology","IT").replace("Electronics & Communication","ECE").replace("Mechanical Engineering","Mech");
    html += `
      <div class="distribution-item">
        <div class="dist-header"><span>${shortDept}</span><span>${pct}%</span></div>
        <div class="dist-bar-bg"><div class="dist-bar-fill" style="width:${pct}%;background:${colors[i%colors.length]};"></div></div>
      </div>`;
  });
  container.innerHTML = html;
}

function renderAdminActivities() {
  const container = document.getElementById("activityFeedContainer");
  if (!container) return;
  const marks = JSON.parse(localStorage.getItem("edu_marks") || "[]");
  const recentMarks = marks.slice(-2).reverse();
  
  const activities = [
    ...recentMarks.map(m => ({
      title: "Marks Updated",
      desc: `${m.studentName} scored ${m.totalMarks}/100 in ${m.subject} (${m.grade})`,
      time: "Recent",
      icon: "fa-file-signature"
    })),
    { title: "New Student Enrolled", desc: "Aarav Sharma enrolled in CSE Department", time: "Today", icon: "fa-user-plus" },
    { title: "Attendance Recorded", desc: "Faculty marked classroom attendance", time: "Today", icon: "fa-calendar-check" },
    { title: "Examination Scheduled", desc: "Upcoming end-semester timetable active", time: "1 day ago", icon: "fa-award" }
  ];

  container.innerHTML = activities.slice(0, 5).map(a => `
    <li class="activity-item">
      <div class="activity-avatar"><i class="fas ${a.icon}"></i></div>
      <div class="activity-details">
        <div class="activity-text"><strong>${a.title}</strong> — ${a.desc}</div>
        <div class="activity-time">${a.time}</div>
      </div>
    </li>
  `).join("");
}

/* =========================================================
   FACULTY DASHBOARD
   ========================================================= */
async function renderFacultyDashboard(user) {
  document.getElementById("dashboardContent").innerHTML = facultyDashboardHTML(user);

  try {
    const [students, courses] = await Promise.all([api.getStudents(), api.getCourses()]);
    // Faculty sees only their dept students & courses
    const myDept = user.department || "";
    const myStudents = myDept ? students.filter(s => s.department === myDept) : students;
    const myCourses  = myDept ? courses.filter(c => c.department === myDept) : courses;

    animateCount("fStatStudents", myStudents.length);
    animateCount("fStatCourses",  myCourses.length);
    animateCount("fStatSemesters", [...new Set(myStudents.map(s => s.semester))].length);

    renderFacultyStudentTable(myStudents.slice(0, 5));
  } catch(err) {
    showToast("Error loading faculty dashboard", "error");
  }
}

function facultyDashboardHTML(user) {
  return `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-info"><span class="stat-label">My Students</span><div class="stat-value" id="fStatStudents">0</div></div>
        <div class="stat-icon-wrapper blue"><i class="fas fa-user-graduate"></i></div>
      </div>
      <div class="stat-card">
        <div class="stat-info"><span class="stat-label">My Courses</span><div class="stat-value" id="fStatCourses">0</div></div>
        <div class="stat-icon-wrapper green"><i class="fas fa-book-open"></i></div>
      </div>
      <div class="stat-card">
        <div class="stat-info"><span class="stat-label">Active Semesters</span><div class="stat-value" id="fStatSemesters">0</div></div>
        <div class="stat-icon-wrapper purple"><i class="fas fa-layer-group"></i></div>
      </div>
      <div class="stat-card">
        <div class="stat-info"><span class="stat-label">Department</span><div class="stat-value" style="font-size:13px;line-height:1.3;">${user.department || "CSE"}</div></div>
        <div class="stat-icon-wrapper amber"><i class="fas fa-building"></i></div>
      </div>
    </div>
    <div class="dashboard-grid">
      <div>
        <div class="card">
          <h3 style="font-size:16px;font-weight:700;margin-bottom:16px;">Quick Actions</h3>
          <div class="quick-actions-grid">
            <a href="marks.html" class="action-btn-card"><i class="fas fa-file-invoice"></i><span>Enter Marks</span></a>
            <a href="attendance.html" class="action-btn-card"><i class="fas fa-calendar-check"></i><span>Attendance</span></a>
            <a href="examinations.html" class="action-btn-card"><i class="fas fa-award"></i><span>Exams</span></a>
            <a href="students.html" class="action-btn-card"><i class="fas fa-user-graduate"></i><span>Students</span></a>
          </div>
        </div>
        <div class="card" style="margin-bottom:0;">
          <h3 style="font-size:16px;font-weight:700;margin-bottom:16px;">My Students</h3>
          <div class="table-container">
            <table class="data-table">
              <thead><tr><th>ID</th><th>Name</th><th>Year</th><th>Status</th></tr></thead>
              <tbody id="fStudentTable"><tr><td colspan="4" class="empty-state"><div class="spinner"></div></td></tr></tbody>
            </table>
          </div>
        </div>
      </div>
      <div>
        <div class="card" style="margin-bottom:0;">
          <h3 style="font-size:16px;font-weight:700;margin-bottom:16px;">Recent Academic Activities</h3>
          <ul class="activity-list">
            ${(() => {
              const marks = JSON.parse(localStorage.getItem("edu_marks") || "[]");
              const recent = marks.slice(-2).reverse();
              const acts = [
                ...recent.map(m => ({ title: "Marks Entry Logged", desc: `${m.studentName} — ${m.subject} (${m.totalMarks}/100, ${m.grade})`, time: "Recent", icon: "fa-file-invoice" })),
                { title: "Attendance Window Open", desc: "Mark attendance for today's classes", time: "Today", icon: "fa-calendar-check" },
                { title: "Exam Schedule Active", desc: "Exam timetable published for students", time: "Active", icon: "fa-award" }
              ];
              return acts.map(a => `<li class="activity-item"><div class="activity-avatar"><i class="fas ${a.icon}"></i></div><div class="activity-details"><div class="activity-text"><strong>${a.title}</strong> — ${a.desc}</div><div class="activity-time">${a.time}</div></div></li>`).join("");
            })()}
          </ul>
        </div>
      </div>
    </div>
  `;
}

function renderFacultyStudentTable(list) {
  const tbody = document.getElementById("fStudentTable");
  if (!tbody) return;
  if (!list.length) { tbody.innerHTML = `<tr><td colspan="4" class="empty-state">No students in your department</td></tr>`; return; }
  tbody.innerHTML = list.map(s => `
    <tr>
      <td><strong>${s.studentId}</strong></td>
      <td><div style="display:flex;align-items:center;gap:8px;"><div class="table-avatar">${s.name.charAt(0)}</div>${s.name}</div></td>
      <td><span class="badge badge-info">${s.year}</span></td>
      <td><span class="badge badge-success">${s.status||"Active"}</span></td>
    </tr>
  `).join("");
}

/* =========================================================
   STUDENT DASHBOARD  (starts at 0 — real data only)
   ========================================================= */
async function renderStudentDashboard(user) {
  document.getElementById("dashboardContent").innerHTML = studentDashboardHTML(user);

  try {
    let sid = user.studentId || "";
    if (!sid) {
      const allStudents = await api.getStudents();
      const match = allStudents.find(s =>
        (s.email && user.email && s.email.toLowerCase() === user.email.toLowerCase()) ||
        (s.name && user.name && s.name.toLowerCase() === user.name.toLowerCase())
      );
      sid = match ? match.studentId : "STU-1001";
      user.studentId = sid;
    }

    const [allMarks, allAttendance, allCourses, allExams, studentAssignments] = await Promise.all([
      api.getMarks(),
      api.getAttendance(),
      api.getCourses(),
      api.getExaminations(),
      api.getStudentAssignmentsWithStatus(sid)
    ]);

    // Filter to only THIS student's data
    const myMarks      = allMarks.filter(m => m.studentId === sid);
    const myAttendance = allAttendance.filter(a => a.studentId === sid);
    const myExams      = allExams.filter(e => !user.semester || e.semester === user.semester || e.semester === 5);

    // Calculate real aggregates
    const avgPct    = myMarks.length ? Math.round(myMarks.reduce((s,m)=>s+(m.percentage||0),0)/myMarks.length) : 0;
    const avgAtt    = myAttendance.length ? Math.round(myAttendance.reduce((s,a)=>s+(a.percentage||0),0)/myAttendance.length) : 0;
    const myDeptCourses = allCourses.filter(c => (!user.department || c.department === user.department));

    // Calculate THIS student's TRUE homework completion rate
    const totalAssigned = studentAssignments.length;
    const totalCompleted = studentAssignments.filter(a => a.isCompleted).length;
    const hwCompletionPct = totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0;

    animateCount("sStatMarks",    avgPct);
    animateCount("sStatAtt",      avgAtt);
    animateCount("sStatHw",       hwCompletionPct);
    animateCount("sStatCourses",  myDeptCourses.length || allCourses.length);
    animateCount("sStatExams",    myExams.length);

    const hwSubEl = document.getElementById("sStatHwSub");
    if (hwSubEl) {
      hwSubEl.innerText = `${totalCompleted}/${totalAssigned} completed`;
    }

    renderStudentMarksTable(myMarks);
    renderStudentAttTable(myAttendance);
    renderStudentDashboardHomework(studentAssignments);
    renderStudentExams(myExams);
  } catch(err) {
    showToast("Error loading your dashboard", "error");
  }
}

function studentDashboardHTML(user) {
  return `
    <!-- Welcome Banner -->
    <div class="card" style="background:linear-gradient(135deg,#2563eb,#06b6d4);border:none;margin-bottom:24px;">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;">
        <div>
          <p style="color:rgba(255,255,255,0.75);font-size:13px;margin-bottom:4px;">Welcome back 👋</p>
          <h2 style="color:#fff;font-size:22px;font-weight:700;">${user.name}</h2>
          <p style="color:rgba(255,255,255,0.8);font-size:13px;margin-top:4px;">${user.department || "—"} &nbsp;|&nbsp; ${user.year || "—"} &nbsp;|&nbsp; Sem ${user.semester || "—"} &nbsp;|&nbsp; ${user.studentId || "—"}</p>
        </div>
        <div style="background:rgba(255,255,255,0.15);padding:12px 20px;border-radius:12px;text-align:center;">
          <div style="color:#fff;font-size:11px;letter-spacing:1px;text-transform:uppercase;">Student ID</div>
          <div style="color:#fff;font-size:20px;font-weight:800;">${user.studentId || "N/A"}</div>
        </div>
      </div>
    </div>

    <!-- Stat Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-info"><span class="stat-label">Avg. Score</span><div class="stat-value" id="sStatMarks">0<span style="font-size:14px;">%</span></div></div>
        <div class="stat-icon-wrapper blue"><i class="fas fa-file-invoice"></i></div>
      </div>
      <div class="stat-card">
        <div class="stat-info"><span class="stat-label">Attendance</span><div class="stat-value" id="sStatAtt">0<span style="font-size:14px;">%</span></div></div>
        <div class="stat-icon-wrapper green"><i class="fas fa-calendar-check"></i></div>
      </div>
      <div class="stat-card">
        <div class="stat-info">
          <span class="stat-label">Homework Done</span>
          <div class="stat-value" id="sStatHw">0<span style="font-size:14px;">%</span></div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:2px;" id="sStatHwSub">0 completed</div>
        </div>
        <div class="stat-icon-wrapper amber"><i class="fas fa-pencil-alt"></i></div>
      </div>
      <div class="stat-card">
        <div class="stat-info"><span class="stat-label">Enrolled Courses</span><div class="stat-value" id="sStatCourses">0</div></div>
        <div class="stat-icon-wrapper purple"><i class="fas fa-book-open"></i></div>
      </div>
      <div class="stat-card">
        <div class="stat-info"><span class="stat-label">Upcoming Exams</span><div class="stat-value" id="sStatExams">0</div></div>
        <div class="stat-icon-wrapper red"><i class="fas fa-award"></i></div>
      </div>
    </div>

    <div class="dashboard-grid">
      <div>
        <!-- My Marks -->
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <h3 style="font-size:16px;font-weight:700;">My Marks</h3>
            <a href="marks.html" style="font-size:13px;font-weight:600;">View All <i class="fas fa-arrow-right"></i></a>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead><tr><th>Subject</th><th>Internal</th><th>External</th><th>Grade</th></tr></thead>
              <tbody id="sMarksTable"><tr><td colspan="4" class="empty-state"><div class="spinner"></div></td></tr></tbody>
            </table>
          </div>
        </div>
        <!-- My Attendance -->
        <div class="card" style="margin-bottom:0;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <h3 style="font-size:16px;font-weight:700;">My Attendance</h3>
            <a href="attendance.html" style="font-size:13px;font-weight:600;">View All <i class="fas fa-arrow-right"></i></a>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead><tr><th>Subject</th><th>Present</th><th>Total</th><th>%</th></tr></thead>
              <tbody id="sAttTable"><tr><td colspan="4" class="empty-state"><div class="spinner"></div></td></tr></tbody>
            </table>
          </div>
        </div>
      </div>
      <div>
        <!-- My Homework & Coursework Tasks -->
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
            <div>
              <h3 style="font-size:16px;font-weight:700;"><i class="fas fa-pencil-alt" style="color:var(--warning-color);margin-right:8px;"></i>Coursework &amp; Homework Tasks</h3>
              <p style="font-size:12px;color:var(--text-muted);margin-top:2px;">Real assignment progress based on your attempts</p>
            </div>
            <a href="homework.html" style="font-size:13px;font-weight:600;">View All <i class="fas fa-arrow-right"></i></a>
          </div>
          <div id="sHomeworkList">
            <div class="spinner"></div>
          </div>
        </div>

        <!-- Upcoming Exams -->
        <div class="card" style="margin-bottom:0;">
          <h3 style="font-size:16px;font-weight:700;margin-bottom:16px;">Upcoming Exams</h3>
          <ul class="activity-list" id="sExamList"><li class="activity-item"><div class="spinner"></div></li></ul>
        </div>
      </div>
    </div>
  `;
}

function renderStudentDashboardHomework(assignments) {
  const container = document.getElementById("sHomeworkList");
  if (!container) return;
  if (!assignments || !assignments.length) {
    container.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:13px;"><i class="fas fa-tasks" style="font-size:24px;display:block;margin-bottom:8px;opacity:0.3;"></i>No homework assigned currently</div>`;
    return;
  }

  const completed = assignments.filter(a => a.isCompleted);
  let summaryBanner = '';
  if (completed.length === 0) {
    summaryBanner = `
      <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.25);border-radius:10px;padding:10px 14px;margin-bottom:12px;display:flex;align-items:center;gap:10px;">
        <i class="fas fa-info-circle" style="color:#f59e0b;font-size:16px;"></i>
        <div style="font-size:12px;color:var(--text-secondary);line-height:1.4;">
          <strong>0% Completed:</strong> You have not attempted any homework yet. Attempt your coursework to record your score!
        </div>
      </div>
    `;
  } else {
    summaryBanner = `
      <div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.25);border-radius:10px;padding:10px 14px;margin-bottom:12px;display:flex;align-items:center;gap:10px;">
        <i class="fas fa-check-circle" style="color:#10b981;font-size:16px;"></i>
        <div style="font-size:12px;color:var(--text-secondary);line-height:1.4;">
          <strong>${completed.length} of ${assignments.length} Completed (${Math.round(completed.length / assignments.length * 100)}%):</strong> Real submissions added to your personal profile.
        </div>
      </div>
    `;
  }

  container.innerHTML = summaryBanner + assignments.slice(0, 3).map(a => {
    const isDone = a.isCompleted && a.submission;
    const sub = a.submission;
    return `
      <div style="padding:12px 14px;background:var(--bg-tertiary);border-radius:10px;margin-bottom:8px;border:1px solid var(--border-color);display:flex;justify-content:space-between;align-items:center;gap:12px;">
        <div style="flex:1;min-width:0;">
          <div style="font-weight:600;font-size:13px;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
            ${a.title}
          </div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">
            ${a.subjectCode || 'ACAD'} &bull; Due: ${a.dueDate || 'Flexible'}
          </div>
          ${isDone ? `
            <div style="font-size:11px;color:#10b981;margin-top:3px;font-weight:600;">
              <i class="fas fa-check-circle"></i> Scored: ${sub.score}/${sub.totalQuestions} (${sub.percentage}%) &bull; ${sub.completedDate || 'Submitted'}
            </div>
          ` : ''}
        </div>
        <div>
          ${isDone 
            ? `<a href="homework.html" class="badge badge-success" style="text-decoration:none;font-size:11px;padding:4px 8px;"><i class="fas fa-check"></i> Completed</a>`
            : `<a href="homework.html" class="btn btn-primary btn-sm" style="font-size:11px;padding:4px 10px;white-space:nowrap;"><i class="fas fa-pencil-alt"></i> Attempt</a>`
          }
        </div>
      </div>
    `;
  }).join("");
}

function renderStudentMarksTable(marks) {
  const tbody = document.getElementById("sMarksTable");
  if (!tbody) return;
  if (!marks.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="empty-state"><i class="fas fa-file-invoice" style="font-size:28px;display:block;margin-bottom:8px;opacity:0.3;"></i>No marks recorded yet</td></tr>`;
    return;
  }
  const gradeColor = { "A+":"badge-success","A":"badge-success","B+":"badge-info","B":"badge-info","C":"badge-warning","D":"badge-warning","F":"badge-danger" };
  tbody.innerHTML = marks.map(m => `
    <tr>
      <td><div style="font-weight:600;">${m.subject}</div><div style="font-size:11px;color:var(--text-muted);">${m.subjectCode}</div></td>
      <td>${m.internalMarks ?? "—"}</td>
      <td>${m.externalMarks ?? "—"}</td>
      <td><span class="badge ${gradeColor[m.grade]||'badge-secondary'}">${m.grade || "—"}</span></td>
    </tr>
  `).join("");
}

function renderStudentAttTable(att) {
  const tbody = document.getElementById("sAttTable");
  if (!tbody) return;
  if (!att.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="empty-state"><i class="fas fa-calendar-check" style="font-size:28px;display:block;margin-bottom:8px;opacity:0.3;"></i>No attendance recorded yet</td></tr>`;
    return;
  }
  tbody.innerHTML = att.map(a => {
    const pct = a.percentage || 0;
    const badge = pct >= 75 ? "badge-success" : pct >= 60 ? "badge-warning" : "badge-danger";
    return `<tr>
      <td><strong>${a.subject}</strong></td>
      <td>${a.presentClasses ?? "—"}</td>
      <td>${a.totalClasses ?? "—"}</td>
      <td><span class="badge ${badge}">${pct}%</span></td>
    </tr>`;
  }).join("");
}

function renderStudentExams(exams) {
  const container = document.getElementById("sExamList");
  if (!container) return;
  if (!exams.length) {
    container.innerHTML = `<li style="text-align:center;padding:24px;color:var(--text-muted);"><i class="fas fa-calendar-alt" style="font-size:28px;display:block;margin-bottom:8px;opacity:0.3;"></i>No upcoming exams scheduled</li>`;
    return;
  }
  container.innerHTML = exams.map(e => `
    <li class="activity-item">
      <div class="activity-avatar" style="background:var(--warning-bg);color:var(--warning-color);"><i class="fas fa-award"></i></div>
      <div class="activity-details">
        <div class="activity-text"><strong>${e.subject}</strong> — ${e.examType}</div>
        <div class="activity-time">📅 ${e.examDate ? new Date(e.examDate).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) : "TBD"}</div>
      </div>
    </li>
  `).join("");
}

/* =========================================================
   SHARED UTILITIES
   ========================================================= */
function animateCount(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  // Keep any suffix (% sign) that was already in innerHTML
  const suffix = el.innerHTML.replace(/[0-9]/g, "");
  let start = 0;
  const duration = 900;
  const startTime = performance.now();
  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const val = Math.round(eased * target);
    el.innerHTML = val + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}


async function loadDashboardData() {
  try {
    const students = await api.getStudents();
    const faculty = await api.getFaculty();
    const depts = await api.getDepartments();
    const courses = await api.getCourses();

    // Update Top Metric Stat Cards
    document.getElementById("statTotalStudents").innerText = students.length;
    document.getElementById("statTotalFaculty").innerText = faculty.length;
    document.getElementById("statTotalCourses").innerText = courses.length;
    document.getElementById("statTotalDepts").innerText = depts.length;

    // Render Recent Students Table Preview
    renderRecentStudents(students.slice(-5).reverse());

    // Render Recent Activity Feed
    renderRecentActivities();
  } catch (err) {
    showToast("Error loading dashboard metrics", "error");
  }
}

function renderRecentStudents(recentList) {
  const container = document.getElementById("recentStudentsTableBody");
  if (!container) return;

  if (recentList.length === 0) {
    container.innerHTML = `<tr><td colspan="5" class="empty-state">No students found</td></tr>`;
    return;
  }

  container.innerHTML = recentList.map(s => `
    <tr>
      <td><strong>${s.studentId}</strong></td>
      <td>
        <div style="display:flex; align-items:center; gap:10px;">
          <div class="table-avatar">${s.name.charAt(0)}</div>
          <div>
            <div style="font-weight:600;">${s.name}</div>
            <div style="font-size:11px; color:var(--text-muted);">${s.email}</div>
          </div>
        </div>
      </td>
      <td>${s.department}</td>
      <td><span class="badge badge-info">${s.year}</span></td>
      <td><span class="badge badge-success">${s.status || "Active"}</span></td>
    </tr>
  `).join("");
}

function renderRecentActivities() {
  const container = document.getElementById("activityFeedContainer");
  if (!container) return;

  const activities = [
    { title: "New Student Enrolled", desc: "Aarav Sharma added to Computer Science & Eng.", time: "10 mins ago", icon: "fa-user-plus" },
    { title: "Marks Updated", desc: "Mid-Term marks published for Full Stack Java", time: "1 hour ago", icon: "fa-file-signature" },
    { title: "Attendance Recorded", desc: "Prof. Sunita marked attendance for 5th Sem", time: "3 hours ago", icon: "fa-calendar-check" },
    { title: "New Course Created", desc: "CS302 - Full Stack Java added to curriculum", time: "1 day ago", icon: "fa-book-open" }
  ];

  container.innerHTML = activities.map(a => `
    <li class="activity-item">
      <div class="activity-avatar"><i class="fas ${a.icon}"></i></div>
      <div class="activity-details">
        <div class="activity-text"><strong>${a.title}</strong> - ${a.desc}</div>
        <div class="activity-time">${a.time}</div>
      </div>
    </li>
  `).join("");
}
