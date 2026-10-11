/*
  Marks & Performance Analytics — Role-Aware
  - Student: sees ONLY their own marks, colorful subject charts + overall dashboard
  - Admin/Faculty: sees ALL students' marks table + can add marks
*/

/* ── Color palette for subjects ─────────────────────────────── */
const SUBJECT_COLORS = [
  { bg: '#6366f1', light: 'rgba(99,102,241,0.15)',  border: '#4f46e5' },
  { bg: '#ec4899', light: 'rgba(236,72,153,0.15)',  border: '#db2777' },
  { bg: '#f59e0b', light: 'rgba(245,158,11,0.15)',  border: '#d97706' },
  { bg: '#10b981', light: 'rgba(16,185,129,0.15)',  border: '#059669' },
  { bg: '#06b6d4', light: 'rgba(6,182,212,0.15)',   border: '#0891b2' },
  { bg: '#f97316', light: 'rgba(249,115,22,0.15)',  border: '#ea580c' },
  { bg: '#8b5cf6', light: 'rgba(139,92,246,0.15)',  border: '#7c3aed' },
  { bg: '#ef4444', light: 'rgba(239,68,68,0.15)',   border: '#dc2626' },
];

/* Keep track of Chart.js instances to destroy before re-render */
const activeCharts = {};

function destroyChart(id) {
  if (activeCharts[id]) {
    activeCharts[id].destroy();
    delete activeCharts[id];
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initMarksPage();
  setupMarksForm();
});

async function initMarksPage() {
  const user = auth.getCurrentUser();
  if (!user) return;

  const role = user.role;
  const content = document.getElementById('marksPageContent');

  if (role === 'Student') {
    await renderStudentView(user, content);
  } else {
    await renderAdminFacultyView(role, content);
  }
}

/* ══════════════════════════════════════════════════════════════
   STUDENT VIEW — only their own data
══════════════════════════════════════════════════════════════ */
async function renderStudentView(user, content) {
  // Determine student ID — from login session or map by name
  let studentId = user.studentId;
  if (!studentId) {
    // Map username → studentId using the students list
    const students = await api.getStudents();
    const match = students.find(s =>
      s.name.toLowerCase() === (user.name || '').toLowerCase() ||
      s.email.toLowerCase() === (user.email || '').toLowerCase()
    );
    studentId = match ? match.studentId : 'STU-1001'; // fallback demo
  }

  // Load data in parallel including live homework assignments with submission status
  const [marks, attendance, homework, monthly, studentAssignments] = await Promise.all([
    api.getMarksByStudent(studentId),
    api.getAttendanceByStudent(studentId),
    api.getHomeworkByStudent(studentId),
    api.getMonthlyPerformanceByStudent(studentId),
    api.getStudentAssignmentsWithStatus(studentId)
  ]);

  window._studentAssignments = studentAssignments;
  window._currentStudentUser = user;
  window._currentStudentId = studentId;

  // Real KPI calculations
  const avgMarks = marks.length ? Math.round(marks.reduce((s, m) => s + m.percentage, 0) / marks.length) : 0;
  const avgAtt   = attendance.length ? Math.round(attendance.reduce((s, a) => s + a.percentage, 0) / attendance.length) : 0;
  
  const totalAssigned = studentAssignments.length;
  const totalCompleted = studentAssignments.filter(a => a.isCompleted).length;
  const pendingCount = totalAssigned - totalCompleted;
  const avgHW = totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : (homework.length ? Math.round(homework.reduce((s, h) => s + h.percentage, 0) / homework.length) : 0);
  const topSubject = marks.length ? marks.reduce((best, m) => m.percentage > best.percentage ? m : best, marks[0]) : null;

  content.innerHTML = `
    <!-- Hero KPI Banner -->
    <div class="marks-hero">
      <div class="marks-hero-title"><i class="fas fa-chart-line" style="margin-right:10px;"></i>Marks &amp; Academic Performance Analytics</div>
      <div class="marks-hero-sub">Detailed breakdown of your subject marks, overall trends &amp; academic progression</div>
      <div class="marks-kpi-row">
        <div class="kpi-card">
          <div class="kpi-icon" style="color:#a5f3fc;">📚</div>
          <div class="kpi-value">${marks.length}</div>
          <div class="kpi-label">Subjects</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="color:#bbf7d0;">🏆</div>
          <div class="kpi-value">${avgMarks}%</div>
          <div class="kpi-label">Avg. Marks</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="color:#fde68a;">📅</div>
          <div class="kpi-value">${avgAtt}%</div>
          <div class="kpi-label">Avg. Attendance</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="color:#fca5a5;">✏️</div>
          <div class="kpi-value">${avgHW}%</div>
          <div class="kpi-label">Homework Done</div>
        </div>
        ${topSubject ? `
        <div class="kpi-card">
          <div class="kpi-icon" style="color:#e9d5ff;">⭐</div>
          <div class="kpi-value">${topSubject.grade}</div>
          <div class="kpi-label">Best Grade (${topSubject.subjectCode})</div>
        </div>` : ''}
      </div>
    </div>

    <!-- Tabs -->
    <div class="marks-tabs">
      <div class="marks-tab active" onclick="switchTab('tab-marks', this)"><i class="fas fa-star" style="margin-right:6px;"></i>Subject Marks</div>
      <div class="marks-tab" onclick="switchTab('tab-attendance', this)"><i class="fas fa-calendar-check" style="margin-right:6px;"></i>Attendance</div>
      <div class="marks-tab" onclick="switchTab('tab-homework', this)"><i class="fas fa-pencil-alt" style="margin-right:6px;"></i>Homework &amp; Tasks (${totalCompleted}/${totalAssigned})</div>
      <div class="marks-tab" onclick="switchTab('tab-overall', this)"><i class="fas fa-chart-line" style="margin-right:6px;"></i>Overall Performance Trends</div>
    </div>

    <!-- TAB: Subject Marks -->
    <div class="tab-panel active" id="tab-marks">
      <div class="section-title">
        <div class="stitle-icon" style="background:rgba(99,102,241,0.15); color:#6366f1;"><i class="fas fa-book"></i></div>
        Subject-wise Marks
      </div>
      <div class="subjects-grid" id="subjectsGrid"></div>
      <!-- Comparison bar chart -->
      <div class="section-title" style="margin-top:32px;">
        <div class="stitle-icon" style="background:rgba(16,185,129,0.15); color:#10b981;"><i class="fas fa-chart-bar"></i></div>
        All Subjects Comparison
      </div>
      <div class="chart-card">
        <div class="chart-card-title">Marks Comparison — All Subjects</div>
        <div class="chart-card-sub">Internal vs External marks for each subject</div>
        <div class="chart-wrap-lg"><canvas id="subjectCompareChart"></canvas></div>
      </div>
    </div>

    <!-- TAB: Attendance -->
    <div class="tab-panel" id="tab-attendance">
      <div class="section-title">
        <div class="stitle-icon" style="background:rgba(6,182,212,0.15); color:#06b6d4;"><i class="fas fa-calendar-alt"></i></div>
        Attendance by Subject
      </div>
      <div class="att-subj-grid" id="attendanceGrid"></div>
      <div class="section-title" style="margin-top:32px;">
        <div class="stitle-icon" style="background:rgba(245,158,11,0.15); color:#f59e0b;"><i class="fas fa-chart-area"></i></div>
        Attendance Overview Chart
      </div>
      <div class="chart-card">
        <div class="chart-card-title">Attendance % per Subject</div>
        <div class="chart-card-sub">75% is the minimum required for exam eligibility</div>
        <div class="chart-wrap-lg"><canvas id="attendanceChart"></canvas></div>
      </div>
    </div>

    <!-- TAB: Homework -->
    <div class="tab-panel" id="tab-homework">
      <div class="section-title">
        <div class="stitle-icon" style="background:rgba(249,115,22,0.15); color:#f97316;"><i class="fas fa-tasks"></i></div>
        Interactive Homework &amp; Coursework Submissions
      </div>

      <!-- Real Homework KPI cards -->
      <div class="admin-kpi-row" style="margin-bottom:20px;">
        <div class="admin-kpi-card">
          <div class="admin-kpi-icon" style="background:rgba(99,102,241,0.15); color:#6366f1;"><i class="fas fa-book-reader"></i></div>
          <div>
            <div class="admin-kpi-num">${totalAssigned}</div>
            <div class="admin-kpi-label">Assigned Homework</div>
          </div>
        </div>
        <div class="admin-kpi-card">
          <div class="admin-kpi-icon" style="background:rgba(16,185,129,0.15); color:#10b981;"><i class="fas fa-check-circle"></i></div>
          <div>
            <div class="admin-kpi-num">${totalCompleted}</div>
            <div class="admin-kpi-label">Completed Homework</div>
          </div>
        </div>
        <div class="admin-kpi-card">
          <div class="admin-kpi-icon" style="background:rgba(245,158,11,0.15); color:#f59e0b;"><i class="fas fa-hourglass-half"></i></div>
          <div>
            <div class="admin-kpi-num">${pendingCount}</div>
            <div class="admin-kpi-label">Pending Attempt</div>
          </div>
        </div>
        <div class="admin-kpi-card">
          <div class="admin-kpi-icon" style="background:rgba(6,182,212,0.15); color:#06b6d4;"><i class="fas fa-percentage"></i></div>
          <div>
            <div class="admin-kpi-num">${avgHW}%</div>
            <div class="admin-kpi-label">Real Completion Rate</div>
          </div>
        </div>
      </div>

      <!-- Homework Assignments Cards Grid -->
      <div class="section-title" style="margin-top:20px; font-size:16px;">
        <div class="stitle-icon" style="background:rgba(99,102,241,0.15); color:#6366f1;"><i class="fas fa-clipboard-list"></i></div>
        Course Assignments &amp; Quizzes
      </div>
      <div id="studentHomeworkGrid" class="hw-assignment-grid"></div>

      <!-- Subject-wise Progress and Charts -->
      <div class="section-title" style="margin-top:32px;">
        <div class="stitle-icon" style="background:rgba(139,92,246,0.15); color:#8b5cf6;"><i class="fas fa-chart-pie"></i></div>
        Subject-wise Real Completion Rate
      </div>
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:20px;">
        <div class="chart-card">
          <div class="chart-card-title">Subject-wise Completion Rate</div>
          <div class="chart-card-sub">Dynamic real progress calculated from your submitted homework</div>
          <div id="homeworkList"></div>
        </div>
        <div class="chart-card">
          <div class="chart-card-title">Completion Distribution</div>
          <div class="chart-card-sub">Submissions distribution across subjects</div>
          <div class="chart-wrap"><canvas id="homeworkDoughnut"></canvas></div>
        </div>
      </div>
    </div>

    <!-- TAB: Overall Trend -->
    <div class="tab-panel" id="tab-overall">
      <div class="section-title">
        <div class="stitle-icon" style="background:rgba(99,102,241,0.15); color:#6366f1;"><i class="fas fa-chart-line"></i></div>
        Overall Subject Performance &amp; Cumulative Trend
      </div>
      <div class="chart-card full-width" style="margin-bottom:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
          <div>
            <div class="chart-card-title">Subject-wise Marks &amp; Cumulative Average Trend</div>
            <div class="chart-card-sub">Dynamic progression across your updated examination &amp; internal assessment records</div>
          </div>
          <div id="studentTrendBadge"></div>
        </div>
        <div class="chart-wrap-lg"><canvas id="overallMarksTrendChart"></canvas></div>
      </div>

      <div class="section-title" style="margin-top:28px;">
        <div class="stitle-icon" style="background:rgba(16,185,129,0.15); color:#10b981;"><i class="fas fa-chart-line"></i></div>
        Monthly Academic Growth &amp; Performance Trend
      </div>
      <div class="chart-card full-width" style="margin-bottom:24px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:14px;">
          <div>
            <div class="chart-card-title" style="font-size:16px;">Monthly Performance vs University Benchmarks</div>
            <div class="chart-card-sub" style="margin-bottom:0;">
              Visual track comparing your marks, attendance, and homework over time against Pass (40%) and Distinction (75%) thresholds.
            </div>
          </div>
          <!-- Filter Buttons to view single metric or all -->
          <div style="display:flex; gap:6px; flex-wrap:wrap;" id="monthlyMetricFilters">
            <button type="button" class="chart-pill-btn active" onclick="setMonthlyTrendFilter('all', this)">All Indicators</button>
            <button type="button" class="chart-pill-btn" onclick="setMonthlyTrendFilter('marks', this)">Marks Only</button>
            <button type="button" class="chart-pill-btn" onclick="setMonthlyTrendFilter('attendance', this)">Attendance Only</button>
            <button type="button" class="chart-pill-btn" onclick="setMonthlyTrendFilter('homework', this)">Homework Only</button>
          </div>
        </div>

        <!-- Quick Summary Badges Bar -->
        <div id="monthlyQuickStats" style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:14px;"></div>

        <div class="chart-wrap-lg" style="height:280px;"><canvas id="monthlyTrendChart"></canvas></div>

        <!-- Understanding Your Graph: Explanation & Verdict Guide -->
        <div class="trend-guide-grid" id="trendGuideGrid"></div>
      </div>

      <div class="overall-grid">
        <div class="chart-card">
          <div class="chart-card-title">Marks Distribution</div>
          <div class="chart-card-sub">How are your marks spread?</div>
          <div class="chart-wrap"><canvas id="marksPieChart"></canvas></div>
        </div>
        <div class="chart-card">
          <div class="chart-card-title">Performance Radar</div>
          <div class="chart-card-sub">Multi-dimensional performance</div>
          <div class="chart-wrap"><canvas id="radarChart"></canvas></div>
        </div>
      </div>

      <div class="section-title" style="margin-top:28px;">
        <div class="stitle-icon" style="background:rgba(236,72,153,0.15); color:#ec4899;"><i class="fas fa-lightbulb"></i></div>
        Performance Insights
      </div>
      <div id="insightChips" class="insight-chips"></div>
    </div>
  `;

  renderSubjectCards(marks);
  renderSubjectCompareChart(marks);
  renderAttendanceGrid(attendance);
  renderAttendanceChart(attendance);
  renderHomeworkSection(homework, studentAssignments);
  renderOverallSubjectTrendChart(marks);
  renderMonthlyTrend(monthly, marks, attendance, homework);
  renderMarksPie(marks);
  renderRadarChart(marks, attendance, homework);
  renderInsights(marks, attendance, homework);
}

/* ── Subject Cards ─────────────────────────────────────────── */
function renderSubjectCards(marks) {
  const grid = document.getElementById('subjectsGrid');
  if (!grid) return;
  grid.innerHTML = marks.map((m, i) => {
    const col = SUBJECT_COLORS[i % SUBJECT_COLORS.length];
    const gradePct = m.percentage;
    return `
      <div class="subject-card">
        <div class="subject-card-accent" style="background:${col.bg};"></div>
        <div class="subject-card-header">
          <div>
            <div class="subject-name">${m.subject}</div>
            <div class="subject-code">${m.subjectCode} · Sem ${m.semester}</div>
          </div>
          <div class="grade-badge-big" style="background:${col.bg};">${m.grade}</div>
        </div>
        <div class="subject-chart-wrap">
          <canvas id="subjectMiniChart${i}"></canvas>
        </div>
        <div class="marks-breakdown">
          <div class="marks-item">
            <div class="marks-item-val" style="color:${col.bg};">${m.internalMarks}</div>
            <div class="marks-item-lab">Internal /30</div>
          </div>
          <div class="marks-item">
            <div class="marks-item-val" style="color:${col.bg};">${m.externalMarks}</div>
            <div class="marks-item-lab">External /70</div>
          </div>
          <div class="marks-item">
            <div class="marks-item-val" style="color:${col.bg};">${m.totalMarks}</div>
            <div class="marks-item-lab">Total /100</div>
          </div>
        </div>
        <div class="progress-bar-wrap">
          <div class="progress-bar-label">
            <span>Score</span>
            <span style="color:${col.bg}; font-weight:700;">${gradePct}%</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width:${gradePct}%; background:${col.bg};"></div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Draw mini bar charts for each subject card
  marks.forEach((m, i) => {
    const col = SUBJECT_COLORS[i % SUBJECT_COLORS.length];
    const ctx = document.getElementById(`subjectMiniChart${i}`)?.getContext('2d');
    if (!ctx) return;
    destroyChart(`mini${i}`);
    activeCharts[`mini${i}`] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Internal', 'External', 'Total'],
        datasets: [{
          data: [m.internalMarks, m.externalMarks, m.totalMarks],
          backgroundColor: [col.light, col.light, col.bg],
          borderColor: [col.border, col.border, col.border],
          borderWidth: 1.5,
          borderRadius: 6,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            max: 100,
            grid: { color: 'rgba(0,0,0,0.04)' },
            ticks: { font: { size: 9 }, color: '#94a3b8' }
          },
          x: { grid: { display: false }, ticks: { font: { size: 9 }, color: '#94a3b8' } }
        }
      }
    });
  });
}

/* ── Subject Comparison Chart ──────────────────────────────── */
function renderSubjectCompareChart(marks) {
  const ctx = document.getElementById('subjectCompareChart')?.getContext('2d');
  if (!ctx) return;
  destroyChart('subjectCompare');
  activeCharts['subjectCompare'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: marks.map(m => m.subjectCode),
      datasets: [
        {
          label: 'Internal',
          data: marks.map(m => m.internalMarks),
          backgroundColor: SUBJECT_COLORS.map(c => c.light),
          borderColor: SUBJECT_COLORS.map(c => c.border),
          borderWidth: 2,
          borderRadius: 6,
        },
        {
          label: 'External',
          data: marks.map(m => m.externalMarks),
          backgroundColor: SUBJECT_COLORS.map(c => c.bg),
          borderColor: SUBJECT_COLORS.map(c => c.border),
          borderWidth: 2,
          borderRadius: 6,
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', labels: { boxWidth: 12, font: { size: 12 } } },
        tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y}` } }
      },
      scales: {
        y: { max: 100, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#94a3b8' } },
        x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
      }
    }
  });
}

/* ── Attendance Doughnut Rings ─────────────────────────────── */
function renderAttendanceGrid(attendance) {
  const grid = document.getElementById('attendanceGrid');
  if (!grid) return;

  grid.innerHTML = attendance.map((a, i) => {
    const col = SUBJECT_COLORS[i % SUBJECT_COLORS.length];
    const isGood = a.percentage >= 75;
    return `
      <div class="att-subj-card">
        <div class="att-ring">
          <canvas id="attRing${i}" width="80" height="80"></canvas>
          <div class="att-ring-label">${a.percentage}%</div>
        </div>
        <div class="att-subj-name">${a.subject.length > 24 ? a.subject.substring(0,22)+'…' : a.subject}</div>
        <div class="att-subj-status" style="color:${isGood ? '#10b981' : '#ef4444'};">
          <i class="fas fa-${isGood ? 'check-circle' : 'exclamation-triangle'}"></i>
          ${isGood ? 'Eligible' : 'Shortage'} · ${a.presentClasses}/${a.totalClasses}
        </div>
      </div>
    `;
  }).join('');

  attendance.forEach((a, i) => {
    const col = SUBJECT_COLORS[i % SUBJECT_COLORS.length];
    const ctx = document.getElementById(`attRing${i}`)?.getContext('2d');
    if (!ctx) return;
    destroyChart(`attRing${i}`);
    activeCharts[`attRing${i}`] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [a.percentage, 100 - a.percentage],
          backgroundColor: [col.bg, 'rgba(0,0,0,0.06)'],
          borderWidth: 0,
        }]
      },
      options: {
        responsive: false,
        cutout: '72%',
        plugins: { legend: { display: false }, tooltip: { enabled: false } }
      }
    });
  });
}

/* ── Attendance Bar Chart ──────────────────────────────────── */
function renderAttendanceChart(attendance) {
  const ctx = document.getElementById('attendanceChart')?.getContext('2d');
  if (!ctx) return;
  destroyChart('attendanceBar');
  activeCharts['attendanceBar'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: attendance.map(a => a.subject.length > 18 ? a.subject.substring(0,16)+'…' : a.subject),
      datasets: [{
        label: 'Attendance %',
        data: attendance.map(a => a.percentage),
        backgroundColor: attendance.map((a, i) => SUBJECT_COLORS[i % SUBJECT_COLORS.length].bg),
        borderRadius: 8,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        annotation: {},
        tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y}% attendance` } }
      },
      scales: {
        y: {
          min: 0, max: 100,
          grid: { color: 'rgba(0,0,0,0.05)' },
          ticks: { callback: v => v + '%', color: '#94a3b8' }
        },
        x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
      }
    }
  });
}

/* ── Homework Section ──────────────────────────────────────── */
function renderHomeworkSection(homework, studentAssignments = []) {
  // 1. Render Student Active Homework Assignment Cards Grid
  const gridEl = document.getElementById('studentHomeworkGrid');
  if (gridEl) {
    if (!studentAssignments || studentAssignments.length === 0) {
      gridEl.innerHTML = `
        <div style="grid-column:1/-1; background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:14px; padding:32px; text-align:center;">
          <i class="fas fa-tasks" style="font-size:36px; color:var(--text-muted); margin-bottom:12px;"></i>
          <h4 style="color:var(--text-primary); margin-bottom:4px;">No Homework Assigned Yet</h4>
          <p style="font-size:12px; color:var(--text-muted);">Your faculty will publish quizzes and homework assignments here shortly.</p>
        </div>
      `;
    } else {
      gridEl.innerHTML = studentAssignments.map((a, i) => {
        const col = SUBJECT_COLORS[i % SUBJECT_COLORS.length];
        const qCount = (a.questions || []).length;
        const isDone = a.isCompleted && a.submission;

        let completionBannerHtml = '';
        if (isDone) {
          const sub = a.submission;
          completionBannerHtml = `
            <div class="hw-completion-banner">
              <i class="fas fa-check-circle"></i>
              <div style="flex:1;">
                <div class="hw-completion-title">Completed · Score: ${sub.score} / ${sub.totalQuestions} (${sub.percentage}%)</div>
                <div class="hw-completion-date"><i class="fas fa-calendar-check"></i> Completed on: <strong>${sub.completedDate}</strong></div>
                ${sub.uploadedFileName ? `
                  <div style="font-size:11px; color:var(--text-secondary); margin-top:3px; display:flex; align-items:center; gap:5px;">
                    <i class="fas fa-paperclip" style="color:#ef4444;"></i> Attached: <strong>${sub.uploadedFileName}</strong> (${sub.uploadedFileSize || 'PDF'})
                  </div>
                ` : ''}
              </div>
            </div>
          `;
        }

        return `
          <div class="hw-assignment-card">
            <div class="hw-assignment-accent" style="background:${col.bg};"></div>
            <div>
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
                <div>
                  <span class="hw-tag" style="background:${col.light}; color:${col.bg}; border-color:transparent; font-weight:700;">
                    ${a.subjectCode || 'ACAD'} · Sem ${a.semester || 5}
                  </span>
                  <div style="font-size:11px; color:var(--text-muted); margin-top:4px;">
                    <i class="fas fa-calendar-alt"></i> Due: ${a.dueDate || 'Flexible'} · <i class="fas fa-chalkboard-teacher"></i> ${a.facultyName || 'Faculty'}
                  </div>
                </div>
                ${isDone 
                  ? `<span class="hw-badge-completed"><i class="fas fa-check-circle"></i> Completed</span>`
                  : `<span class="hw-badge-pending"><i class="fas fa-clock"></i> Pending Attempt</span>`
                }
              </div>

              <h4 style="font-size:15px; font-weight:700; color:var(--text-primary); line-height:1.3; margin-bottom:8px;">
                ${a.title}
              </h4>
              <p style="font-size:12px; color:var(--text-muted); line-height:1.4; margin-bottom:12px;">
                ${a.description ? (a.description.length > 130 ? a.description.substring(0, 126) + '…' : a.description) : 'No instructions provided.'}
              </p>

              <!-- Tags for MCQs and PDF upload -->
              <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:10px;">
                <span class="hw-tag"><i class="fas fa-list-ol"></i> ${qCount} MCQs</span>
                ${a.allowPdfUpload 
                  ? `<span class="hw-tag" style="color:#ef4444;"><i class="fas fa-file-pdf"></i> PDF Upload Allowed</span>`
                  : `<span class="hw-tag"><i class="fas fa-ban"></i> MCQs Only</span>`
                }
              </div>

              ${completionBannerHtml}
            </div>

            <div style="margin-top:14px; padding-top:12px; border-top:1px solid var(--border-color); display:flex; justify-content:flex-end;">
              ${isDone
                ? `<button class="btn btn-secondary btn-sm" onclick="reviewCompletedHomework(${a.id})"><i class="fas fa-eye"></i> Review Attempt</button>`
                : `<button class="btn btn-primary btn-sm" onclick="openAttemptHomeworkModal(${a.id})"><i class="fas fa-pencil-alt"></i> Attempt Homework</button>`
              }
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // 2. Render Subject-wise Bars List
  const list = document.getElementById('homeworkList');
  if (list && homework) {
    list.innerHTML = homework.map((h, i) => {
      const col = SUBJECT_COLORS[i % SUBJECT_COLORS.length];
      return `
        <div class="hw-row">
          <div class="hw-subject">${h.subject}</div>
          <div class="hw-bar-wrap">
            <div class="hw-bar-bg">
              <div class="hw-bar-fill" style="width:${h.percentage}%; background:${col.bg};"></div>
            </div>
          </div>
          <div class="hw-stat" style="color:${col.bg}; font-weight:700;">${h.completed}/${h.total}</div>
          <div class="hw-stat">${h.percentage}%</div>
        </div>
      `;
    }).join('');
  }

  // 3. Doughnut for homework
  const ctx = document.getElementById('homeworkDoughnut')?.getContext('2d');
  if (!ctx || !homework || !homework.length) return;
  destroyChart('hwDoughnut');

  const totalComp = homework.reduce((s, h) => s + (h.completed || 0), 0);
  const totalAssign = homework.reduce((s, h) => s + (h.total || 0), 0);

  if (totalComp === 0) {
    // Student has not completed any homework yet — show 100% Pending indicator
    activeCharts['hwDoughnut'] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Pending Attempt', 'Completed'],
        datasets: [{
          data: [totalAssign || 1, 0],
          backgroundColor: ['rgba(245, 158, 11, 0.4)', '#10b981'],
          borderWidth: 2,
          borderColor: '#1e293b'
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 }, color: '#94a3b8' } },
          tooltip: { callbacks: { label: () => ` 0 completed / ${totalAssign} pending attempt` } }
        }
      }
    });
  } else {
    activeCharts['hwDoughnut'] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: homework.map(h => h.subject.length > 16 ? h.subject.substring(0,14)+'…' : h.subject),
        datasets: [{
          data: homework.map(h => h.completed),
          backgroundColor: SUBJECT_COLORS.map(c => c.bg),
          borderWidth: 2,
          borderColor: '#fff',
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        cutout: '55%',
        plugins: {
          legend: { position: 'right', labels: { boxWidth: 10, font: { size: 11 } } },
          tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed} completed` } }
        }
      }
    });
  }
}

/* ── Overall Subject Performance & Cumulative Trend Chart ───── */
function renderOverallSubjectTrendChart(marks) {
  const ctx = document.getElementById('overallMarksTrendChart')?.getContext('2d');
  if (!ctx) return;

  const badgeEl = document.getElementById('studentTrendBadge');
  if (!marks || marks.length === 0) {
    if (badgeEl) badgeEl.innerHTML = '<span class="badge badge-warning">No Marks Recorded</span>';
    destroyChart('overallMarksTrend');
    return;
  }

  const avgMarks = Math.round(marks.reduce((s, m) => s + (m.percentage || 0), 0) / marks.length);
  if (badgeEl) {
    const badgeClass = avgMarks >= 75 ? 'badge-success' : avgMarks >= 50 ? 'badge-primary' : 'badge-danger';
    const trendIcon = avgMarks >= 75 ? 'fa-arrow-trend-up' : avgMarks >= 50 ? 'fa-chart-line' : 'fa-arrow-trend-down';
    badgeEl.innerHTML = `<span class="badge ${badgeClass}" style="font-size:13px; padding:6px 14px;"><i class="fas ${trendIcon}" style="margin-right:6px;"></i>Overall Average: ${avgMarks}%</span>`;
  }

  // Calculate cumulative average progression at each subject record
  let runningSum = 0;
  const cumulativeAvg = marks.map((m, idx) => {
    runningSum += (m.percentage || 0);
    return Math.round(runningSum / (idx + 1));
  });

  destroyChart('overallMarksTrend');
  activeCharts['overallMarksTrend'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: marks.map(m => m.subjectCode ? `${m.subjectCode} (${(m.subject || '').substring(0, 14)}..)` : (m.subject || 'Subject')),
      datasets: [
        {
          label: 'Total Subject Score (%)',
          data: marks.map(m => m.percentage || 0),
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.12)',
          fill: true,
          tension: 0.35,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: '#6366f1',
          borderWidth: 3
        },
        {
          label: 'Cumulative Average Trend (%)',
          data: cumulativeAvg,
          borderColor: '#ec4899',
          borderDash: [6, 4],
          borderWidth: 2.5,
          fill: false,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: '#ec4899'
        },
        {
          label: 'Passing Benchmark (40%)',
          data: marks.map(() => 40),
          borderColor: '#ef4444',
          borderDash: [4, 4],
          borderWidth: 1.5,
          pointRadius: 0,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top', labels: { boxWidth: 12, font: { size: 12 } } },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y}%`
          }
        }
      },
      scales: {
        y: {
          min: 0,
          max: 100,
          grid: { color: 'rgba(0,0,0,0.05)' },
          ticks: { callback: v => v + '%', color: '#94a3b8' }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#94a3b8', font: { size: 11 } }
        }
      }
    }
  });
}

/* ── Monthly Trend Chart & Dynamic Explanatory Guide ───────── */
window._monthlyTrendCache = null;

function renderMonthlyTrend(monthly, marks = [], attendance = [], homework = []) {
  const ctx = document.getElementById('monthlyTrendChart')?.getContext('2d');
  if (!ctx) return;

  // Calculate live values from records
  const liveMarks = (marks && marks.length > 0)
    ? Math.round(marks.reduce((s, m) => s + (m.percentage || 0), 0) / marks.length)
    : 84;
  const liveAtt = (attendance && attendance.length > 0)
    ? Math.round(attendance.reduce((s, a) => s + (a.percentage || 0), 0) / attendance.length)
    : 90;

  // Strict true homework percentage based only on this student's actual submissions
  const studentAssignments = window._studentAssignments || [];
  const totalAssigned = studentAssignments.length;
  const totalCompleted = studentAssignments.filter(a => a.isCompleted).length;
  const liveHw = totalAssigned > 0
    ? Math.round((totalCompleted / totalAssigned) * 100)
    : (homework && homework.length > 0 ? Math.round(homework.reduce((s, h) => s + (h.percentage || 0), 0) / homework.length) : 0);

  let trendData = Array.isArray(monthly) && monthly.length > 0 ? [...monthly] : [];

  // Guarantee trendData is NEVER empty — synthesize realistic semester milestones if needed
  if (trendData.length === 0) {
    trendData = [
      { month: 'Jul (Unit 1)',   avgMarks: Math.max(50, liveMarks - 11), attendance: Math.max(68, liveAtt - 7), homeworkDone: 0 },
      { month: 'Aug (Mid-Sem)',  avgMarks: Math.max(55, liveMarks - 7),  attendance: Math.max(72, liveAtt - 4), homeworkDone: 0 },
      { month: 'Sep (Unit 2)',   avgMarks: Math.max(60, liveMarks - 3),  attendance: Math.max(75, liveAtt - 2), homeworkDone: 0 },
      { month: 'Oct (Current)',  avgMarks: liveMarks,                    attendance: liveAtt,                   homeworkDone: liveHw }
    ];
  } else {
    // Calibrate the records: if student has not attempted homework (liveHw === 0), all months are 0%
    // If student attempted homework, earlier months are 0% and current active month (Oct) has their true percentage
    const lastIdx = trendData.length - 1;
    trendData = trendData.map((item, idx) => {
      const isLatest = idx === lastIdx || item.month === 'Oct' || item.month === 'Oct (Current)';
      return {
        ...item,
        avgMarks: isLatest ? liveMarks : (item.avgMarks || 0),
        attendance: isLatest ? liveAtt : (item.attendance || 0),
        homeworkDone: (isLatest && totalCompleted > 0) ? liveHw : 0
      };
    });
  }

  window._monthlyTrendCache = { trendData, activeFilter: 'all' };

  // Render quick badges
  const statsEl = document.getElementById('monthlyQuickStats');
  if (statsEl) {
    const latest = trendData[trendData.length - 1];
    const standingTier = latest.avgMarks >= 75
      ? 'Distinction (>=75%)'
      : (latest.avgMarks >= 50 ? 'First Class' : 'Pass Standard');
    const badgeClass = latest.avgMarks >= 75 ? 'badge-success' : (latest.avgMarks >= 50 ? 'badge-primary' : 'badge-warning');

    statsEl.innerHTML = `
      <span class="badge badge-primary" style="font-size:12px; padding:6px 12px; background:rgba(99,102,241,0.18); color:#818cf8; border:1px solid rgba(99,102,241,0.3);">
        <i class="fas fa-graduation-cap" style="margin-right:5px;"></i> Marks: <strong>${latest.avgMarks}%</strong>
      </span>
      <span class="badge badge-success" style="font-size:12px; padding:6px 12px; background:rgba(16,185,129,0.18); color:#34d399; border:1px solid rgba(16,185,129,0.3);">
        <i class="fas fa-calendar-check" style="margin-right:5px;"></i> Attendance: <strong>${latest.attendance}%</strong>
      </span>
      <span class="badge badge-warning" style="font-size:12px; padding:6px 12px; background:rgba(245,158,11,0.18); color:#fbbf24; border:1px solid rgba(245,158,11,0.3);">
        <i class="fas fa-pencil-alt" style="margin-right:5px;"></i> Homework: <strong>${latest.homeworkDone}%</strong> ${totalCompleted > 0 ? `(${totalCompleted}/${totalAssigned} done)` : '(0 attempts)'}
      </span>
      <span class="badge ${badgeClass}" style="font-size:12px; padding:6px 12px;">
        <i class="fas fa-award" style="margin-right:5px;"></i> Tier: <strong>${standingTier}</strong>
      </span>
    `;
  }

  // Draw chart with benchmark lines
  drawMonthlyTrendCanvas(ctx, trendData, 'all');

  // Render "Understanding Your Graph" explanation cards
  renderTrendGuide(trendData);
}

function drawMonthlyTrendCanvas(ctx, trendData, filter = 'all') {
  destroyChart('monthlyTrend');

  const allDatasets = [
    {
      id: 'marks',
      label: 'Avg. Marks %',
      data: trendData.map(m => m.avgMarks),
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99,102,241,0.14)',
      fill: true,
      tension: 0.35,
      borderWidth: 3,
      pointRadius: 6,
      pointHoverRadius: 8,
      pointBackgroundColor: '#6366f1',
    },
    {
      id: 'attendance',
      label: 'Attendance %',
      data: trendData.map(m => m.attendance),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16,185,129,0.08)',
      fill: filter === 'attendance',
      tension: 0.35,
      borderWidth: 2.5,
      pointRadius: 5,
      pointHoverRadius: 7,
      pointBackgroundColor: '#10b981',
    },
    {
      id: 'homework',
      label: 'Homework Done %',
      data: trendData.map(m => m.homeworkDone),
      borderColor: '#f59e0b',
      backgroundColor: 'rgba(245,158,11,0.08)',
      fill: filter === 'homework',
      tension: 0.35,
      borderWidth: 2.5,
      pointRadius: 5,
      pointHoverRadius: 7,
      pointBackgroundColor: '#f59e0b',
    },
    {
      id: 'distinction',
      label: 'Distinction Benchmark (75%)',
      data: trendData.map(() => 75),
      borderColor: '#06b6d4',
      borderDash: [5, 4],
      borderWidth: 1.5,
      pointRadius: 0,
      fill: false,
    },
    {
      id: 'pass',
      label: 'Passing Benchmark (40%)',
      data: trendData.map(() => 40),
      borderColor: '#ef4444',
      borderDash: [4, 4],
      borderWidth: 1.5,
      pointRadius: 0,
      fill: false,
    }
  ];

  let visibleDatasets = allDatasets;
  if (filter === 'marks') {
    visibleDatasets = allDatasets.filter(d => ['marks', 'distinction', 'pass'].includes(d.id));
  } else if (filter === 'attendance') {
    visibleDatasets = allDatasets.filter(d => ['attendance', 'distinction'].includes(d.id));
  } else if (filter === 'homework') {
    visibleDatasets = allDatasets.filter(d => ['homework', 'distinction'].includes(d.id));
  }

  activeCharts['monthlyTrend'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: trendData.map(m => m.month),
      datasets: visibleDatasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'top',
          labels: { boxWidth: 12, font: { size: 12 }, color: '#94a3b8' }
        },
        tooltip: {
          callbacks: {
            label: ctx => {
              const val = ctx.parsed.y;
              if (ctx.dataset.id === 'marks') {
                const grade = val >= 75 ? 'Distinction' : (val >= 60 ? 'First Class' : (val >= 40 ? 'Pass' : 'Needs Attention'));
                return ` Marks: ${val}% (${grade})`;
              }
              if (ctx.dataset.id === 'attendance') {
                return ` Attendance: ${val}% (${val >= 75 ? 'Exam Eligible' : 'Attendance Shortage'})`;
              }
              if (ctx.dataset.id === 'homework') {
                return ` Homework: ${val}% Completed`;
              }
              return ` ${ctx.dataset.label}: ${val}%`;
            }
          }
        }
      },
      scales: {
        y: {
          min: 0,
          max: 100,
          grid: { color: 'rgba(255,255,255,0.06)' },
          ticks: { callback: v => v + '%', color: '#94a3b8' }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#94a3b8', font: { size: 11 } }
        }
      }
    }
  });
}

window.setMonthlyTrendFilter = function(filter, btn) {
  document.querySelectorAll('#monthlyMetricFilters .chart-pill-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const ctx = document.getElementById('monthlyTrendChart')?.getContext('2d');
  if (!ctx || !window._monthlyTrendCache) return;

  drawMonthlyTrendCanvas(ctx, window._monthlyTrendCache.trendData, filter);
};

function renderTrendGuide(trendData) {
  const guideGrid = document.getElementById('trendGuideGrid');
  if (!guideGrid || !trendData || trendData.length === 0) return;

  const first = trendData[0];
  const latest = trendData[trendData.length - 1];
  const marksGrowth = (latest.avgMarks || 0) - (first.avgMarks || 0);
  const growthSign = marksGrowth >= 0 ? '+' : '';
  const isDistinction = (latest.avgMarks || 0) >= 75;
  const isAttSafe = (latest.attendance || 0) >= 75;

  guideGrid.innerHTML = `
    <div class="trend-guide-card">
      <div class="trend-guide-icon" style="background:rgba(99,102,241,0.15); color:#6366f1;">
        <i class="fas fa-chart-line"></i>
      </div>
      <div>
        <div class="trend-guide-title">Performance Growth: ${growthSign}${marksGrowth}%</div>
        <div class="trend-guide-desc">
          Marks progressed from ${first.avgMarks}% in ${first.month} to ${latest.avgMarks}% in ${latest.month}. Positive learning trajectory.
        </div>
      </div>
    </div>

    <div class="trend-guide-card">
      <div class="trend-guide-icon" style="background:rgba(6,182,212,0.15); color:#06b6d4;">
        <i class="fas fa-bullseye"></i>
      </div>
      <div>
        <div class="trend-guide-title">Benchmark Clearance: ${isDistinction ? 'Distinction Tier' : 'First Class'}</div>
        <div class="trend-guide-desc">
          Current score (${latest.avgMarks}%) is ${latest.avgMarks - 40}% above the passing line (40%) and ${isDistinction ? 'exceeds' : 'approaching'} the 75% distinction goal.
        </div>
      </div>
    </div>

    <div class="trend-guide-card">
      <div class="trend-guide-icon" style="background:rgba(16,185,129,0.15); color:#10b981;">
        <i class="fas fa-calendar-check"></i>
      </div>
      <div>
        <div class="trend-guide-title">Attendance Compliance: ${latest.attendance}%</div>
        <div class="trend-guide-desc">
          ${isAttSafe ? 'Compliant with university 75% attendance rule. Fully eligible for all examination halls.' : 'Attendance is currently below 75%. Please attend upcoming classes to avoid shortage.'}
        </div>
      </div>
    </div>

    <div class="trend-guide-card">
      <div class="trend-guide-icon" style="background:rgba(245,158,11,0.15); color:#f59e0b;">
        <i class="fas ${(latest.homeworkDone || 0) > 0 ? 'fa-pencil-alt' : 'fa-hourglass-half'}"></i>
      </div>
      <div>
        <div class="trend-guide-title">Homework Activity: ${(latest.homeworkDone || 0) > 0 ? `${latest.homeworkDone}% Completed` : '0% (No Attempts Yet)'}</div>
        <div class="trend-guide-desc">
          ${(latest.homeworkDone || 0) > 0 
            ? `Real submissions recorded: coursework quizzes attempted and added to your performance graph.`
            : `You have not attempted any homework yet. Complete pending coursework quizzes to record your true percentage.`
          }
        </div>
      </div>
    </div>
  `;
}

/* ── Marks Grade Pie ────────────────────────────────────────── */
function renderMarksPie(marks) {
  const ctx = document.getElementById('marksPieChart')?.getContext('2d');
  if (!ctx) return;

  const gradeMap = {};
  marks.forEach(m => { gradeMap[m.grade] = (gradeMap[m.grade] || 0) + 1; });

  destroyChart('marksPie');
  activeCharts['marksPie'] = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(gradeMap),
      datasets: [{
        data: Object.values(gradeMap),
        backgroundColor: SUBJECT_COLORS.map(c => c.bg),
        borderWidth: 2,
        borderColor: '#fff',
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } }
      }
    }
  });
}

/* ── Performance Radar ─────────────────────────────────────── */
function renderRadarChart(marks, attendance, homework) {
  const ctx = document.getElementById('radarChart')?.getContext('2d');
  if (!ctx) return;

  const avgMarks = marks.length ? Math.round(marks.reduce((s, m) => s + m.percentage, 0) / marks.length) : 0;
  const avgAtt   = attendance.length ? Math.round(attendance.reduce((s, a) => s + a.percentage, 0) / attendance.length) : 0;
  const studentAssignments = window._studentAssignments || [];
  const totalAssigned = studentAssignments.length;
  const totalCompleted = studentAssignments.filter(a => a.isCompleted).length;
  const avgHW    = totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : (homework.length ? Math.round(homework.reduce((s, h) => s + h.percentage, 0) / homework.length) : 0);
  const gradeScore = marks.length ? Math.round(marks.filter(m => ['A+','A'].includes(m.grade)).length / marks.length * 100) : 0;
  const passRate   = marks.length ? Math.round(marks.filter(m => m.percentage >= 40).length / marks.length * 100) : 0;

  destroyChart('radar');
  activeCharts['radar'] = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Avg. Marks', 'Attendance', 'Homework', 'A/A+ Rate', 'Pass Rate'],
      datasets: [{
        label: 'Your Performance',
        data: [avgMarks, avgAtt, avgHW, gradeScore, passRate],
        backgroundColor: 'rgba(99,102,241,0.2)',
        borderColor: '#6366f1',
        pointBackgroundColor: '#6366f1',
        pointRadius: 5,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: {
        r: {
          min: 0, max: 100,
          ticks: { stepSize: 20, font: { size: 9 }, color: '#94a3b8', backdropColor: 'transparent' },
          grid: { color: 'rgba(0,0,0,0.08)' },
          pointLabels: { font: { size: 11 }, color: '#64748b' }
        }
      },
      plugins: { legend: { display: false } }
    }
  });
}

/* ── Performance Insights ─────────────────────────────────── */
function renderInsights(marks, attendance, homework) {
  const chips = document.getElementById('insightChips');
  if (!chips) return;
  const insights = [];

  const avgMarks = marks.length ? Math.round(marks.reduce((s, m) => s + m.percentage, 0) / marks.length) : 0;
  const avgAtt   = attendance.length ? Math.round(attendance.reduce((s, a) => s + a.percentage, 0) / attendance.length) : 0;
  const avgHW    = homework.length ? Math.round(homework.reduce((s, h) => s + h.percentage, 0) / homework.length) : 0;
  const lowAtt   = attendance.filter(a => a.percentage < 75);
  const topMark  = marks.length ? marks.reduce((b, m) => m.percentage > b.percentage ? m : b, marks[0]) : null;

  if (avgMarks >= 85) insights.push({ icon: 'fa-star', color: '#f59e0b', text: `Excellent academic performance — ${avgMarks}% average!` });
  else if (avgMarks >= 70) insights.push({ icon: 'fa-thumbs-up', color: '#10b981', text: `Good performance — ${avgMarks}% average marks` });
  else insights.push({ icon: 'fa-exclamation-circle', color: '#ef4444', text: `Marks need improvement — ${avgMarks}% average` });

  if (avgAtt >= 85) insights.push({ icon: 'fa-calendar-check', color: '#10b981', text: `Great attendance — ${avgAtt}% average` });
  else if (lowAtt.length > 0) insights.push({ icon: 'fa-calendar-times', color: '#ef4444', text: `${lowAtt.length} subject(s) have attendance below 75%` });

  if (avgHW >= 90) insights.push({ icon: 'fa-pencil-alt', color: '#8b5cf6', text: `Exceptional homework discipline — ${avgHW}% completion!` });
  else if (avgHW < 70) insights.push({ icon: 'fa-pencil-alt', color: '#f59e0b', text: `Homework completion at ${avgHW}% — try to improve` });

  if (topMark) insights.push({ icon: 'fa-trophy', color: '#6366f1', text: `Best subject: ${topMark.subject} (${topMark.percentage}%)` });

  chips.innerHTML = insights.map(ins => `
    <div class="insight-chip">
      <i class="fas ${ins.icon}" style="color:${ins.color};"></i>
      ${ins.text}
    </div>
  `).join('');
}

/* ── Tab Switcher ────────────────────────────────────────────── */
function switchTab(tabId, el) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.marks-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(tabId)?.classList.add('active');
  el.classList.add('active');

  // Trigger resize so Chart.js recalculates dimensions on visible tab
  setTimeout(() => {
    Object.values(activeCharts).forEach(c => {
      if (c && typeof c.resize === 'function') c.resize();
    });
    window.dispatchEvent(new Event('resize'));
  }, 60);
}

/* ══════════════════════════════════════════════════════════════
   ADMIN / FACULTY VIEW — all students table + dynamic trend graph
══════════════════════════════════════════════════════════════ */
async function renderAdminFacultyView(role, content) {
  const marksList = await api.getMarks();

  content.innerHTML = `
    <div class="table-toolbar" style="margin-bottom:20px;">
      <div>
        <h2 style="font-size:22px; font-weight:800; color:var(--text-primary); display:flex; align-items:center; gap:10px;">
          <i class="fas fa-chart-line" style="color:var(--primary-color);"></i>
          Marks &amp; Performance Analytics
        </h2>
        <p style="font-size:13px; color:var(--text-muted); margin-top:4px;">
          Comprehensive marks records, automated grading, live performance trends, and student homework hub.
        </p>
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <button class="btn btn-warning" onclick="openAddHomeworkModal()">
          <i class="fas fa-file-signature"></i> Add Homework
        </button>
        <button class="btn btn-primary" onclick="openModal('addMarksModal')">
          <i class="fas fa-plus-circle"></i> Add Student Marks
        </button>
      </div>
    </div>

    <!-- Faculty / Admin Tabs -->
    <div class="marks-tabs" style="margin-bottom:24px;">
      <div class="marks-tab active" onclick="switchFacultyTab('fac-tab-marks', this)"><i class="fas fa-poll" style="margin-right:6px;"></i>Student Marks &amp; Performance</div>
      <div class="marks-tab" onclick="switchFacultyTab('fac-tab-homework', this)"><i class="fas fa-tasks" style="margin-right:6px;"></i>Homework &amp; Assignments Hub</div>
    </div>

    <!-- TAB 1: Marks & Performance -->
    <div class="tab-panel active" id="fac-tab-marks">
      <!-- Dynamic KPI Summary Row -->
      <div class="admin-kpi-row" id="adminMarksKpis">
        <div class="admin-kpi-card">
          <div class="admin-kpi-icon" style="background:rgba(99,102,241,0.15); color:#6366f1;">
            <i class="fas fa-book-open"></i>
          </div>
          <div>
            <div class="admin-kpi-num" id="kpiTotalRecords">0</div>
            <div class="admin-kpi-label">Total Records</div>
          </div>
        </div>
        <div class="admin-kpi-card">
          <div class="admin-kpi-icon" style="background:rgba(16,185,129,0.15); color:#10b981;">
            <i class="fas fa-percentage"></i>
          </div>
          <div>
            <div class="admin-kpi-num" id="kpiClassAvg">0%</div>
            <div class="admin-kpi-label">Overall Average</div>
          </div>
        </div>
        <div class="admin-kpi-card">
          <div class="admin-kpi-icon" style="background:rgba(245,158,11,0.15); color:#f59e0b;">
            <i class="fas fa-trophy"></i>
          </div>
          <div>
            <div class="admin-kpi-num" id="kpiHighestScore">0%</div>
            <div class="admin-kpi-label">Highest Score</div>
          </div>
        </div>
        <div class="admin-kpi-card">
          <div class="admin-kpi-icon" style="background:rgba(6,182,212,0.15); color:#06b6d4;">
            <i class="fas fa-user-check"></i>
          </div>
          <div>
            <div class="admin-kpi-num" id="kpiPassRate">0%</div>
            <div class="admin-kpi-label">Pass Rate</div>
          </div>
        </div>
      </div>

      <!-- Overall Marks & Performance Trend Graph -->
      <div class="chart-card full-width" style="margin-bottom:24px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:14px;">
          <div>
            <div class="chart-card-title" style="font-size:16px;">
              <i class="fas fa-chart-line" style="color:var(--primary-color); margin-right:8px;"></i>
              Overall Marks &amp; Performance Trend Graph
            </div>
            <div class="chart-card-sub" id="adminTrendSub" style="margin-bottom:0;">
              Dynamic trend line showing subject averages, highest achievements, and score progression as records are updated.
            </div>
          </div>
          <div style="display:flex; gap:8px;" id="adminTrendPills">
            <span class="badge badge-info" id="trendRecordCountBadge">-- Records</span>
          </div>
        </div>
        <div class="chart-wrap-lg" style="height:280px;">
          <canvas id="adminMarksTrendChart"></canvas>
        </div>
      </div>

      <!-- Filter row -->
      <div style="display:flex; gap:12px; margin-bottom:16px; flex-wrap:wrap; align-items:center;">
        <select id="filterStudent" class="form-control" style="max-width:220px;" onchange="filterMarksTable()">
          <option value="">All Students</option>
        </select>
        <select id="filterSubject" class="form-control" style="max-width:220px;" onchange="filterMarksTable()">
          <option value="">All Subjects</option>
        </select>
        <input type="text" id="filterSearch" class="form-control" placeholder="Search student name…" style="max-width:200px;" oninput="filterMarksTable()">
        <button class="btn btn-secondary btn-sm" onclick="resetMarksFilter()" style="height:38px;">
          <i class="fas fa-redo"></i> Reset
        </button>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Student Name</th>
              <th>Subject &amp; Code</th>
              <th>Internal (30)</th>
              <th>External (70)</th>
              <th>Total (100)</th>
              <th>Percentage</th>
              <th>Grade</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="marksTableBody">
            <tr><td colspan="10" class="empty-state"><div class="spinner"></div> Loading...</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB 2: Faculty Homework Hub -->
    <div class="tab-panel" id="fac-tab-homework">
      <div class="table-toolbar" style="margin-bottom:16px;">
        <div>
          <h3 style="font-size:18px; font-weight:700; color:var(--text-primary); margin:0;">
            <i class="fas fa-book-reader" style="color:var(--primary-color); margin-right:8px;"></i>
            Faculty Homework &amp; Coursework Management
          </h3>
          <p style="font-size:12px; color:var(--text-muted); margin:4px 0 0;">
            Publish homework with multiple choice questions (MCQs) and optional PDF solution uploads. Track live student completions.
          </p>
        </div>
        <button class="btn btn-warning btn-sm" onclick="openAddHomeworkModal()">
          <i class="fas fa-plus"></i> Add New Homework
        </button>
      </div>

      <!-- Faculty Homework KPI Stats -->
      <div class="admin-kpi-row" id="facultyHwKpiRow" style="margin-bottom:20px;"></div>

      <!-- Faculty Homework Cards Grid -->
      <div id="facultyHomeworkGrid" class="hw-assignment-grid"></div>
    </div>
  `;

  window._allMarks = marksList;
  populateFilterDropdowns(marksList);
  renderMarksTable(marksList);
  updateAdminKpis(marksList);
  renderAdminMarksTrendChart(marksList);
  populateStudentSelect();
  renderFacultyHomeworkHub();
}

function populateFilterDropdowns(marksList) {
  const stuSel = document.getElementById('filterStudent');
  const subSel = document.getElementById('filterSubject');
  if (!stuSel || !subSel) return;
  const currentStu = stuSel.value;
  const currentSub = subSel.value;

  const students = [...new Set(marksList.map(m => m.studentId + '|' + m.studentName))];
  const subjects  = [...new Set(marksList.map(m => m.subjectCode + '|' + m.subject))];

  stuSel.innerHTML = '<option value="">All Students</option>' +
    students.map(s => {
      const [id, name] = s.split('|');
      return `<option value="${id}">${name} (${id})</option>`;
    }).join('');

  subSel.innerHTML = '<option value="">All Subjects</option>' +
    subjects.map(s => {
      const [code, name] = s.split('|');
      return `<option value="${code}">${code} – ${(name || '').substring(0, 24)}</option>`;
    }).join('');

  if (currentStu) stuSel.value = currentStu;
  if (currentSub) subSel.value = currentSub;
}

function updateAdminKpis(marks) {
  const totEl = document.getElementById('kpiTotalRecords');
  const avgEl = document.getElementById('kpiClassAvg');
  const highEl = document.getElementById('kpiHighestScore');
  const passEl = document.getElementById('kpiPassRate');

  if (!totEl || !avgEl || !highEl || !passEl) return;

  if (!marks || marks.length === 0) {
    totEl.innerText = '0';
    avgEl.innerText = '0%';
    highEl.innerText = '0%';
    passEl.innerText = '0%';
    return;
  }

  const total = marks.length;
  const avg = Math.round(marks.reduce((s, m) => s + (m.percentage || 0), 0) / total);
  const highest = Math.max(...marks.map(m => m.percentage || 0));
  const passCount = marks.filter(m => (m.percentage || 0) >= 40).length;
  const passRate = Math.round((passCount / total) * 100);

  totEl.innerText = total;
  avgEl.innerText = avg + '%';
  highEl.innerText = highest + '%';
  passEl.innerText = passRate + '%';
}

function renderAdminMarksTrendChart(marks) {
  const ctx = document.getElementById('adminMarksTrendChart')?.getContext('2d');
  if (!ctx) return;

  const countBadge = document.getElementById('trendRecordCountBadge');
  const subText = document.getElementById('adminTrendSub');
  if (countBadge) countBadge.innerText = `${marks ? marks.length : 0} Records Active`;

  if (!marks || marks.length === 0) {
    destroyChart('adminMarksTrend');
    if (subText) subText.innerText = 'No records match the current filter.';
    return;
  }

  // Check if single student is selected or active
  const studentIds = [...new Set(marks.map(m => m.studentId))];
  const isSingleStudent = studentIds.length === 1;

  let labels = [];
  let avgDataset = [];
  let highDataset = [];
  let benchmarkDataset = [];

  if (isSingleStudent) {
    const studentName = marks[0].studentName || 'Student';
    if (subText) subText.innerText = `Subject performance progression for ${studentName} across all updated marks records`;
    labels = marks.map(m => m.subjectCode ? `${m.subjectCode} (${(m.subject || '').substring(0, 14)}..)` : (m.subject || 'Subject'));
    avgDataset = marks.map(m => m.percentage || 0);
    highDataset = marks.map(m => Math.round(((m.internalMarks || 0) / 30) * 100)); // Internal %
    benchmarkDataset = marks.map(() => 40);
  } else {
    // Group by subjectCode
    const subjectMap = {};
    marks.forEach(m => {
      const key = m.subjectCode || m.subject;
      if (!subjectMap[key]) {
        subjectMap[key] = {
          code: m.subjectCode || key,
          name: m.subject || key,
          scores: []
        };
      }
      subjectMap[key].scores.push(m.percentage || 0);
    });

    labels = Object.keys(subjectMap).map(k => {
      const s = subjectMap[k];
      return s.code ? `${s.code} (${s.name.substring(0, 12)}..)` : s.name;
    });

    avgDataset = Object.keys(subjectMap).map(k => {
      const arr = subjectMap[k].scores;
      return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
    });

    highDataset = Object.keys(subjectMap).map(k => {
      return Math.max(...subjectMap[k].scores);
    });

    benchmarkDataset = labels.map(() => 40);

    if (subText) {
      subText.innerText = `Subject-wise average performance, highest score ceiling, and passing benchmark (${marks.length} total records)`;
    }
  }

  destroyChart('adminMarksTrend');
  activeCharts['adminMarksTrend'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: isSingleStudent ? 'Total Score (%)' : 'Subject Average Score (%)',
          data: avgDataset,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.12)',
          fill: true,
          tension: 0.35,
          borderWidth: 3,
          pointRadius: 6,
          pointBackgroundColor: '#6366f1',
          pointHoverRadius: 8
        },
        {
          label: isSingleStudent ? 'Internal Score (/30 %)' : 'Highest Recorded Score (%)',
          data: highDataset,
          borderColor: '#10b981',
          borderDash: [5, 4],
          borderWidth: 2,
          fill: false,
          tension: 0.3,
          pointRadius: 5,
          pointBackgroundColor: '#10b981'
        },
        {
          label: 'Passing Benchmark (40%)',
          data: benchmarkDataset,
          borderColor: '#ef4444',
          borderDash: [4, 4],
          borderWidth: 1.5,
          fill: false,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top', labels: { boxWidth: 12, font: { size: 12 } } },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y}%`
          }
        }
      },
      scales: {
        y: {
          min: 0,
          max: 100,
          grid: { color: 'rgba(0,0,0,0.05)' },
          ticks: { callback: v => v + '%', color: '#94a3b8' }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#94a3b8', font: { size: 11 } }
        }
      }
    }
  });
}

window.filterMarksTable = function() {
  const stuFilter  = document.getElementById('filterStudent')?.value;
  const subFilter  = document.getElementById('filterSubject')?.value;
  const txtFilter  = document.getElementById('filterSearch')?.value.toLowerCase();
  let data = window._allMarks || [];
  if (stuFilter) data = data.filter(m => m.studentId === stuFilter);
  if (subFilter) data = data.filter(m => m.subjectCode === subFilter);
  if (txtFilter) data = data.filter(m => (m.studentName || '').toLowerCase().includes(txtFilter));
  renderMarksTable(data);
  updateAdminKpis(data);
  renderAdminMarksTrendChart(data);
};

window.resetMarksFilter = function() {
  const stu = document.getElementById('filterStudent');
  const sub = document.getElementById('filterSubject');
  const txt = document.getElementById('filterSearch');
  if (stu) stu.value = '';
  if (sub) sub.value = '';
  if (txt) txt.value = '';
  filterMarksTable();
};

function renderMarksTable(marks) {
  const tbody = document.getElementById('marksTableBody');
  if (!tbody) return;
  if (!marks.length) {
    tbody.innerHTML = `<tr><td colspan="10" class="empty-state">No mark records found matching criteria.</td></tr>`;
    return;
  }
  const isStudent = auth.getCurrentUser()?.role === 'Student';
  tbody.innerHTML = marks.map(m => {
    const gradeBadge = m.grade === 'F' ? 'badge-danger' : ['A+', 'A'].includes(m.grade) ? 'badge-success' : 'badge-warning';
    return `
      <tr>
        <td><strong>${m.studentId}</strong></td>
        <td><strong>${m.studentName}</strong></td>
        <td>${m.subject} (${m.subjectCode})</td>
        <td>${m.internalMarks} / 30</td>
        <td>${m.externalMarks} / 70</td>
        <td><strong>${m.totalMarks}</strong></td>
        <td>${m.percentage}%</td>
        <td><span class="badge ${gradeBadge}">${m.grade}</span></td>
        <td><span class="badge ${m.percentage >= 40 ? 'badge-success' : 'badge-danger'}">${m.percentage >= 40 ? 'Pass' : 'Fail'}</span></td>
        <td>
          ${isStudent ? '<span style="color:var(--text-muted);font-size:12px;">View Only</span>' : `<button class="btn btn-danger btn-sm btn-icon-only" onclick="deleteMarkRecord(${m.id})" title="Delete Marks"><i class="fas fa-trash"></i></button>`}
        </td>
      </tr>
    `;
  }).join('');
}

window.deleteMarkRecord = async function(id) {
  const currentUser = auth.getCurrentUser();
  if (!currentUser || currentUser.role === 'Student') {
    showToast('Permission denied: Students cannot delete marks.', 'warning');
    return;
  }
  showConfirm('Delete Marks Record', 'Are you sure you want to delete this marks record?', async () => {
    try {
      await api.deleteMark(id);
      showToast('Marks record deleted successfully!', 'success');
      const marksList = await api.getMarks();
      window._allMarks = marksList;
      populateFilterDropdowns(marksList);
      renderMarksTable(marksList);
      updateAdminKpis(marksList);
      renderAdminMarksTrendChart(marksList);
    } catch {
      showToast('Failed to delete marks record', 'error');
    }
  });
};

/* ── Add Marks Form ───────────────────────────────────────── */
async function populateStudentSelect() {
  const select = document.getElementById('markStudentSelect');
  if (!select) return;
  const students = await api.getStudents();
  select.innerHTML = `<option value="">Select Student...</option>` +
    students.map(s => `<option value="${s.studentId}">${s.name} (${s.rollNo})</option>`).join('');
}

function setupMarksForm() {
  const intInput = document.getElementById('internalMarks');
  const extInput = document.getElementById('externalMarks');
  const form     = document.getElementById('addMarksForm');

  const updateCalc = () => {
    const res = calculateGradeAndPercentage(parseFloat(intInput?.value)||0, parseFloat(extInput?.value)||0);
    document.getElementById('calcTotal').innerText = res.totalMarks;
    document.getElementById('calcPercentage').innerText = res.percentage + '%';
    document.getElementById('calcGrade').innerText = res.grade;
  };

  if (intInput) intInput.addEventListener('input', updateCalc);
  if (extInput) extInput.addEventListener('input', updateCalc);
  if (form) form.addEventListener('submit', handleAddMarks);
}

async function handleAddMarks(e) {
  e.preventDefault();
  const user = typeof auth !== 'undefined' ? auth.getCurrentUser() : null;
  if (!user || user.role === 'Student') {
    showToast('Permission denied: Only faculty and administration can enter marks.', 'warning');
    closeModal('addMarksModal');
    return;
  }
  if (!validation.validateRequiredFields('addMarksForm')) return;

  const select = document.getElementById('markStudentSelect');
  const studentName = select.options[select.selectedIndex].text.split('(')[0].trim();
  const internal = parseFloat(document.getElementById('internalMarks').value);
  const external = parseFloat(document.getElementById('externalMarks').value);
  const calc = calculateGradeAndPercentage(internal, external);

  const data = {
    studentId: select.value,
    studentName,
    subject: document.getElementById('markSubject').value,
    subjectCode: document.getElementById('markSubjectCode').value,
    internalMarks: internal,
    externalMarks: external,
    totalMarks: calc.totalMarks,
    percentage: calc.percentage,
    grade: calc.grade,
    semester: parseInt(document.getElementById('markSemester').value),
    examType: document.getElementById('markExamType').value
  };

  try {
    await api.saveMarks(data);
    showToast('Marks submitted successfully!', 'success');
    closeModal('addMarksModal');
    document.getElementById('addMarksForm').reset();
    
    // Reload and immediately update overall trend graph, KPIs & table
    const marksList = await api.getMarks();
    window._allMarks = marksList;
    populateFilterDropdowns(marksList);
    renderMarksTable(marksList);
    updateAdminKpis(marksList);
    renderAdminMarksTrendChart(marksList);
  } catch {
    showToast('Error saving marks', 'error');
  }
}

/* ══════════════════════════════════════════════════════════════
   HOMEWORK & ASSIGNMENT MANAGEMENT HUB (FACULTY & STUDENT)
══════════════════════════════════════════════════════════════ */

let _currentAttemptPdf = null;

// Tab switcher for Faculty view
window.switchFacultyTab = function(tabId, tabEl) {
  document.querySelectorAll('#fac-tab-marks, #fac-tab-homework').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.marks-tabs .marks-tab').forEach(t => t.classList.remove('active'));
  
  const panel = document.getElementById(tabId);
  if (panel) panel.classList.add('active');
  if (tabEl) tabEl.classList.add('active');

  if (tabId === 'fac-tab-homework') {
    renderFacultyHomeworkHub();
  }
};

// Render Faculty Homework Hub
async function renderFacultyHomeworkHub() {
  const gridEl = document.getElementById('facultyHomeworkGrid');
  const kpiEl = document.getElementById('facultyHwKpiRow');
  if (!gridEl) return;

  const [assignments, submissions] = await Promise.all([
    api.getHomeworkAssignments(),
    api.getHomeworkSubmissions()
  ]);

  // Faculty KPIs
  const totalAssignments = assignments.length;
  const totalSubmissions = submissions.length;
  const avgScore = submissions.length 
    ? Math.round(submissions.reduce((s, sub) => s + (sub.percentage || 0), 0) / submissions.length) 
    : 0;
  const uniqueStudents = [...new Set(submissions.map(s => s.studentId))].length;

  if (kpiEl) {
    kpiEl.innerHTML = `
      <div class="admin-kpi-card">
        <div class="admin-kpi-icon" style="background:rgba(99,102,241,0.15); color:#6366f1;"><i class="fas fa-file-signature"></i></div>
        <div>
          <div class="admin-kpi-num">${totalAssignments}</div>
          <div class="admin-kpi-label">Active Homework</div>
        </div>
      </div>
      <div class="admin-kpi-card">
        <div class="admin-kpi-icon" style="background:rgba(16,185,129,0.15); color:#10b981;"><i class="fas fa-clipboard-check"></i></div>
        <div>
          <div class="admin-kpi-num">${totalSubmissions}</div>
          <div class="admin-kpi-label">Student Submissions</div>
        </div>
      </div>
      <div class="admin-kpi-card">
        <div class="admin-kpi-icon" style="background:rgba(245,158,11,0.15); color:#f59e0b;"><i class="fas fa-user-graduate"></i></div>
        <div>
          <div class="admin-kpi-num">${uniqueStudents}</div>
          <div class="admin-kpi-label">Students Completed</div>
        </div>
      </div>
      <div class="admin-kpi-card">
        <div class="admin-kpi-icon" style="background:rgba(6,182,212,0.15); color:#06b6d4;"><i class="fas fa-award"></i></div>
        <div>
          <div class="admin-kpi-num">${avgScore}%</div>
          <div class="admin-kpi-label">Average Score</div>
        </div>
      </div>
    `;
  }

  if (!assignments || assignments.length === 0) {
    gridEl.innerHTML = `
      <div style="grid-column:1/-1; background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:14px; padding:36px; text-align:center;">
        <i class="fas fa-folder-open" style="font-size:36px; color:var(--text-muted); margin-bottom:12px;"></i>
        <h4 style="color:var(--text-primary); margin-bottom:4px;">No Homework Assignments Published</h4>
        <p style="font-size:13px; color:var(--text-muted); margin-bottom:16px;">Publish your first homework assignment with MCQs and optional PDF file submissions.</p>
        <button class="btn btn-primary btn-sm" onclick="openAddHomeworkModal()"><i class="fas fa-plus"></i> Add Homework Now</button>
      </div>
    `;
    return;
  }

  gridEl.innerHTML = assignments.map((a, i) => {
    const col = SUBJECT_COLORS[i % SUBJECT_COLORS.length];
    const assignmentSubs = submissions.filter(s => String(s.assignmentId) === String(a.id));
    const subCount = assignmentSubs.length;
    const qCount = (a.questions || []).length;

    return `
      <div class="hw-assignment-card">
        <div class="hw-assignment-accent" style="background:${col.bg};"></div>
        <div>
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
            <div>
              <span class="hw-tag" style="background:${col.light}; color:${col.bg}; border-color:transparent; font-weight:700;">
                ${a.subjectCode || 'ACAD'} · Sem ${a.semester || 5}
              </span>
              <div style="font-size:11px; color:var(--text-muted); margin-top:4px;">
                <i class="fas fa-calendar-alt"></i> Due: ${a.dueDate || 'Flexible'} · <i class="fas fa-user-edit"></i> ${a.facultyName || 'Faculty'}
              </div>
            </div>
            <span class="badge ${subCount > 0 ? 'badge-success' : 'badge-secondary'}" style="font-size:11px;">
              <i class="fas fa-users"></i> ${subCount} Submitted
            </span>
          </div>

          <h4 style="font-size:16px; font-weight:700; color:var(--text-primary); line-height:1.3; margin-bottom:8px;">
            ${a.title}
          </h4>
          <p style="font-size:12px; color:var(--text-muted); line-height:1.4; margin-bottom:12px;">
            ${a.description ? (a.description.length > 130 ? a.description.substring(0, 126) + '…' : a.description) : 'No description provided.'}
          </p>

          <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:12px;">
            <span class="hw-tag"><i class="fas fa-list-ol"></i> ${qCount} MCQs</span>
            ${a.allowPdfUpload 
              ? `<span class="hw-tag" style="color:#ef4444;"><i class="fas fa-file-pdf"></i> PDF Upload Enabled</span>`
              : `<span class="hw-tag"><i class="fas fa-ban"></i> MCQs Only</span>`
            }
          </div>
        </div>

        <div style="margin-top:14px; padding-top:12px; border-top:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center;">
          <button class="btn btn-outline btn-sm" onclick="viewHomeworkSubmissions(${a.id})">
            <i class="fas fa-eye"></i> View Submissions (${subCount})
          </button>
          <button class="btn btn-sm" style="color:#ef4444; border:1px solid rgba(239,68,68,0.3); background:transparent;" onclick="deleteHomeworkAssignment(${a.id})" title="Delete Assignment">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Open Add Homework Modal
window.openAddHomeworkModal = async function() {
  const form = document.getElementById('addHomeworkForm');
  if (form) form.reset();

  // Populate Subjects dropdown from courses
  const subSel = document.getElementById('hwSubjectSelect');
  if (subSel) {
    const courses = await api.getCourses();
    subSel.innerHTML = '<option value="">Select Subject...</option>' +
      courses.map(c => `<option value="${c.name}" data-code="${c.code}" data-sem="${c.semester}">${c.name} (${c.code})</option>`).join('');
  }

  // Set default due date to 10 days from today
  const dueInput = document.getElementById('hwDueDate');
  if (dueInput) {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    dueInput.value = d.toISOString().split('T')[0];
  }

  // Clear and add 2 default MCQ rows
  const mcqContainer = document.getElementById('hwMcqContainer');
  if (mcqContainer) {
    mcqContainer.innerHTML = '';
    addNewMcqQuestionRow('Explain and identify the primary architectural principle of this topic:', 'Inheritance & Encapsulation', 'Polymorphism & Abstraction', 'Modular Decomposition', 'State Redirection', 0);
    addNewMcqQuestionRow('What is the optimal complexity or best practice for standard implementation?', 'O(1) Constant Time', 'O(log n) Logarithmic', 'O(n) Linear Time', 'O(n^2) Quadratic', 1);
  }

  openModal('addHomeworkModal');
};

// Auto-fill course details when selecting subject
window.handleHwSubjectChange = function() {
  const sel = document.getElementById('hwSubjectSelect');
  if (!sel) return;
  const opt = sel.options[sel.selectedIndex];
  if (opt && opt.dataset.code) {
    document.getElementById('hwSubjectCode').value = opt.dataset.code;
    document.getElementById('hwSemester').value = opt.dataset.sem || 5;
  }
};

// Add dynamic MCQ question row in Add Homework Modal
window.addNewMcqQuestionRow = function(prompt = '', opt0 = '', opt1 = '', opt2 = '', opt3 = '', correct = 0) {
  const container = document.getElementById('hwMcqContainer');
  if (!container) return;

  const qIndex = container.children.length;
  const qId = 'mcq_q_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

  const row = document.createElement('div');
  row.className = 'hw-q-builder-item';
  row.innerHTML = `
    <div class="hw-q-builder-header">
      <span style="font-size:13px; font-weight:700; color:var(--text-primary);">
        <span class="badge badge-primary" style="margin-right:6px;">Q${qIndex + 1}</span> MCQ Question
      </span>
      <button type="button" class="btn btn-sm" style="color:#ef4444; background:transparent; border:none; padding:2px 6px;" onclick="removeMcqQuestionRow(this)">
        <i class="fas fa-trash"></i> Remove
      </button>
    </div>
    <div class="form-group" style="margin-bottom:10px;">
      <input type="text" class="form-control hw-q-prompt" placeholder="Enter Question Prompt..." required value="${prompt}">
    </div>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:10px;">
      <div style="display:flex; align-items:center; gap:6px;">
        <input type="radio" name="correct_${qId}" value="0" ${correct === 0 ? 'checked' : ''} title="Mark as correct answer" style="accent-color:var(--primary-color);">
        <input type="text" class="form-control hw-q-opt-0" placeholder="Option A" required value="${opt0}" style="font-size:12px;">
      </div>
      <div style="display:flex; align-items:center; gap:6px;">
        <input type="radio" name="correct_${qId}" value="1" ${correct === 1 ? 'checked' : ''} title="Mark as correct answer" style="accent-color:var(--primary-color);">
        <input type="text" class="form-control hw-q-opt-1" placeholder="Option B" required value="${opt1}" style="font-size:12px;">
      </div>
      <div style="display:flex; align-items:center; gap:6px;">
        <input type="radio" name="correct_${qId}" value="2" ${correct === 2 ? 'checked' : ''} title="Mark as correct answer" style="accent-color:var(--primary-color);">
        <input type="text" class="form-control hw-q-opt-2" placeholder="Option C" required value="${opt2}" style="font-size:12px;">
      </div>
      <div style="display:flex; align-items:center; gap:6px;">
        <input type="radio" name="correct_${qId}" value="3" ${correct === 3 ? 'checked' : ''} title="Mark as correct answer" style="accent-color:var(--primary-color);">
        <input type="text" class="form-control hw-q-opt-3" placeholder="Option D" required value="${opt3}" style="font-size:12px;">
      </div>
    </div>
    <div style="font-size:11px; color:var(--text-muted); display:flex; align-items:center; gap:4px;">
      <i class="fas fa-info-circle"></i> Select the radio circle next to the correct answer choice.
    </div>
  `;
  container.appendChild(row);
};

window.removeMcqQuestionRow = function(btn) {
  const container = document.getElementById('hwMcqContainer');
  const item = btn.closest('.hw-q-builder-item');
  if (container && item) {
    if (container.children.length <= 1) {
      showToast('Each homework must contain at least 1 question.', 'warning');
      return;
    }
    item.remove();
    // Re-index questions badges
    Array.from(container.children).forEach((child, idx) => {
      const badge = child.querySelector('.badge');
      if (badge) badge.innerText = `Q${idx + 1}`;
    });
  }
};

// Handle Faculty Homework Submission Form
async function handlePublishHomework(e) {
  e.preventDefault();
  const user = auth.getCurrentUser();
  if (user && user.role === 'Student') {
    showToast('Permission denied: Students cannot publish homework.', 'warning');
    closeModal('addHomeworkModal');
    return;
  }

  const subject = document.getElementById('hwSubjectSelect').value;
  const subjectCode = document.getElementById('hwSubjectCode').value.trim();
  const title = document.getElementById('hwTitle').value.trim();
  const semester = parseInt(document.getElementById('hwSemester').value) || 5;
  const dueDate = document.getElementById('hwDueDate').value;
  const allowPdfUpload = document.getElementById('hwAllowPdfUpload').checked;
  const description = document.getElementById('hwDescription').value.trim();

  // Extract questions
  const qItems = document.querySelectorAll('#hwMcqContainer .hw-q-builder-item');
  if (!qItems.length) {
    showToast('Please add at least one multiple choice question.', 'warning');
    return;
  }

  const questions = [];
  for (let idx = 0; idx < qItems.length; idx++) {
    const item = qItems[idx];
    const prompt = item.querySelector('.hw-q-prompt')?.value.trim();
    const opt0 = item.querySelector('.hw-q-opt-0')?.value.trim();
    const opt1 = item.querySelector('.hw-q-opt-1')?.value.trim();
    const opt2 = item.querySelector('.hw-q-opt-2')?.value.trim();
    const opt3 = item.querySelector('.hw-q-opt-3')?.value.trim();
    const checkedRadio = item.querySelector('input[type="radio"]:checked');
    const correctOption = checkedRadio ? parseInt(checkedRadio.value) : 0;

    if (!prompt || !opt0 || !opt1 || !opt2 || !opt3) {
      showToast(`Please complete all 4 options for Question ${idx + 1}.`, 'warning');
      return;
    }

    questions.push({
      id: idx + 1,
      question: prompt,
      options: [opt0, opt1, opt2, opt3],
      correctOption: correctOption
    });
  }

  const newAssignment = {
    title,
    subject,
    subjectCode,
    semester,
    dueDate,
    facultyName: user ? user.name : 'Faculty Coordinator',
    facultyEmail: user ? user.email : 'faculty@college.edu',
    description,
    allowPdfUpload,
    questions
  };

  try {
    await api.saveHomeworkAssignment(newAssignment);
    
    // Send immediate notification so students get real-time updates of the new homework
    if (typeof window.addSystemNotification === 'function') {
      window.addSystemNotification(
        `📢 New Homework Assigned: "${title}" for ${subject} (Due: ${dueDate})`,
        'fa-file-signature',
        'Student'
      );
    }

    showToast(`🎉 Homework "${title}" published successfully! Students have been notified.`, 'success');
    closeModal('addHomeworkModal');
    renderFacultyHomeworkHub();
  } catch {
    showToast('Failed to save homework assignment', 'error');
  }
}

// View Homework Submissions (Faculty side)
window.viewHomeworkSubmissions = async function(assignmentId) {
  const [assignments, submissions, students] = await Promise.all([
    api.getHomeworkAssignments(),
    api.getHomeworkSubmissions(assignmentId),
    api.getStudents()
  ]);

  const assignment = assignments.find(a => String(a.id) === String(assignmentId));
  const modalTitle = document.getElementById('submissionsModalTitle');
  const modalSub = document.getElementById('submissionsModalSub');
  const badge = document.getElementById('submissionsCountBadge');
  const tbody = document.getElementById('submissionsTableBody');

  if (modalTitle) modalTitle.innerText = assignment ? assignment.title : 'Homework Submissions';
  if (modalSub) modalSub.innerText = assignment ? `${assignment.subject} (${assignment.subjectCode}) · Sem ${assignment.semester} · Due: ${assignment.dueDate}` : '';
  if (badge) badge.innerText = `${submissions.length} Student Submission${submissions.length === 1 ? '' : 's'}`;

  if (!tbody) return;
  if (!submissions.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-state">No students have completed this homework yet.</td></tr>`;
  } else {
    tbody.innerHTML = submissions.map(s => {
      const stu = students.find(st => st.studentId === s.studentId);
      const rollNo = stu ? ` (${stu.rollNo})` : '';
      return `
        <tr>
          <td><strong>${s.studentId}</strong></td>
          <td><strong>${s.studentName}${rollNo}</strong></td>
          <td><i class="fas fa-calendar-check" style="color:#10b981; margin-right:5px;"></i>${s.completedDate}</td>
          <td>
            <span class="badge ${s.percentage >= 70 ? 'badge-success' : 'badge-warning'}">
              ${s.score} / ${s.totalQuestions} (${s.percentage}%)
            </span>
          </td>
          <td>
            ${s.uploadedFileName 
              ? `<a href="javascript:void(0)" onclick="alert('Viewing student solution file:\\n${s.uploadedFileName}\\nFile Size: ${s.uploadedFileSize || '320 KB'}\\nStatus: Verified PDF Document')" style="color:var(--primary-color); font-weight:600; display:inline-flex; align-items:center; gap:5px;">
                  <i class="fas fa-file-pdf" style="color:#ef4444;"></i> ${s.uploadedFileName}
                </a>`
              : `<span style="color:var(--text-muted); font-size:12px;">No file required</span>`
            }
          </td>
          <td><span class="badge badge-success"><i class="fas fa-check"></i> Completed</span></td>
        </tr>
      `;
    }).join('');
  }

  openModal('viewSubmissionsModal');
};

// Delete Homework Assignment (Faculty side)
window.deleteHomeworkAssignment = function(assignmentId) {
  showConfirm('Delete Homework Assignment', 'Are you sure you want to delete this homework? All student submissions for it will also be deleted.', async () => {
    try {
      await api.deleteHomeworkAssignment(assignmentId);
      showToast('Homework assignment deleted successfully.', 'success');
      renderFacultyHomeworkHub();
    } catch {
      showToast('Failed to delete assignment', 'error');
    }
  });
};

// Student Attempt Homework
window.openAttemptHomeworkModal = async function(assignmentId) {
  const assignments = await api.getHomeworkAssignments();
  const assignment = assignments.find(a => String(a.id) === String(assignmentId));
  if (!assignment) {
    showToast('Assignment not found', 'error');
    return;
  }

  _currentAttemptPdf = null;
  const pdfInput = document.getElementById('hwPdfFileInput');
  if (pdfInput) pdfInput.value = '';
  const pdfPreview = document.getElementById('uploadedPdfPreview');
  if (pdfPreview) pdfPreview.style.display = 'none';

  document.getElementById('attemptHwAssignmentId').value = assignment.id;
  document.getElementById('attemptHwModalTitle').innerText = assignment.title;
  document.getElementById('attemptHwModalSub').innerText = `${assignment.subject} (${assignment.subjectCode}) · Faculty: ${assignment.facultyName || 'Faculty'} · Due: ${assignment.dueDate}`;
  document.getElementById('attemptHwInstructions').innerText = assignment.description || 'Answer all questions below and upload your solution file if allowed.';

  // Render Questions
  const qContainer = document.getElementById('attemptQuestionsContainer');
  const questions = assignment.questions || [];
  if (qContainer) {
    qContainer.innerHTML = questions.map((q, idx) => `
      <div class="quiz-q-card">
        <div class="quiz-q-title">
          <span class="badge badge-primary">Q${idx + 1}</span>
          <span>${q.question}</span>
        </div>
        <div>
          ${q.options.map((opt, optIdx) => `
            <label class="quiz-opt-item">
              <input type="radio" name="attempt_q_${idx}" value="${optIdx}" required>
              <span style="font-weight:700; color:var(--text-primary); margin-left:4px;">${['A','B','C','D'][optIdx]}.</span>
              <span style="color:var(--text-secondary);">${opt}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  // Handle PDF upload section visibility
  const pdfSection = document.getElementById('attemptPdfUploadSection');
  if (pdfSection) {
    pdfSection.style.display = assignment.allowPdfUpload ? 'block' : 'none';
  }

  openModal('attemptHomeworkModal');
};

// Student Review Attempt Modal
window.reviewCompletedHomework = async function(assignmentId) {
  const user = auth.getCurrentUser();
  const studentId = user?.studentId || window._currentStudentId || 'STU-1001';
  const [assignments, submissions] = await Promise.all([
    api.getHomeworkAssignments(),
    api.getHomeworkSubmissions(assignmentId)
  ]);

  const assignment = assignments.find(a => String(a.id) === String(assignmentId));
  const sub = submissions.find(s => s.studentId === studentId);

  if (!assignment || !sub) {
    showToast('Submission details not found', 'info');
    return;
  }

  alert(`📋 Homework Completion Review:\n\nTitle: ${assignment.title}\nSubject: ${assignment.subject}\nStatus: Completed\nCompletion Date: ${sub.completedDate}\nScore: ${sub.score} / ${sub.totalQuestions} (${sub.percentage}%)\nAttached Document: ${sub.uploadedFileName || 'None'}`);
};

// File Upload Handler for student attempt
window.handleStudentPdfSelected = function(e) {
  const file = e.target.files[0];
  if (!file) return;

  const sizeKb = (file.size / 1024).toFixed(0);
  _currentAttemptPdf = {
    name: file.name,
    size: sizeKb > 1024 ? (sizeKb / 1024).toFixed(1) + ' MB' : sizeKb + ' KB'
  };

  const nameEl = document.getElementById('uploadedPdfName');
  const sizeEl = document.getElementById('uploadedPdfSize');
  const previewEl = document.getElementById('uploadedPdfPreview');

  if (nameEl) nameEl.innerText = _currentAttemptPdf.name;
  if (sizeEl) sizeEl.innerText = _currentAttemptPdf.size;
  if (previewEl) previewEl.style.display = 'block';

  showToast(`Attached file: ${file.name}`, 'info');
};

window.removeUploadedPdf = function() {
  _currentAttemptPdf = null;
  const pdfInput = document.getElementById('hwPdfFileInput');
  if (pdfInput) pdfInput.value = '';
  const previewEl = document.getElementById('uploadedPdfPreview');
  if (previewEl) previewEl.style.display = 'none';
};

// Handle Student Submitting Completed Homework
async function handleStudentSubmitHomework(e) {
  e.preventDefault();
  const assignmentId = document.getElementById('attemptHwAssignmentId').value;
  const assignments = await api.getHomeworkAssignments();
  const assignment = assignments.find(a => String(a.id) === String(assignmentId));
  if (!assignment) {
    showToast('Assignment error', 'error');
    return;
  }

  const currentUser = auth.getCurrentUser();
  const studentId = currentUser?.studentId || window._currentStudentId || 'STU-1001';
  const studentName = currentUser?.name || 'Aarav Sharma';

  const questions = assignment.questions || [];
  let score = 0;
  const answers = [];

  for (let idx = 0; idx < questions.length; idx++) {
    const radio = document.querySelector(`input[name="attempt_q_${idx}"]:checked`);
    if (!radio) {
      showToast(`Please answer Question ${idx + 1}.`, 'warning');
      return;
    }
    const selected = parseInt(radio.value);
    answers.push(selected);
    if (selected === questions[idx].correctOption) {
      score++;
    }
  }

  const totalQuestions = questions.length;
  const pct = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 100;

  // Real timestamp format: "11 Oct 2026, 09:45 AM"
  const now = new Date();
  const completedDate = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' +
    now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const submissionRecord = {
    assignmentId: assignment.id,
    studentId: studentId,
    studentName: studentName,
    completedDate: completedDate,
    score: score,
    totalQuestions: totalQuestions,
    percentage: pct,
    answers: answers,
    uploadedFileName: _currentAttemptPdf ? _currentAttemptPdf.name : null,
    uploadedFileSize: _currentAttemptPdf ? _currentAttemptPdf.size : null,
    status: "Completed"
  };

  try {
    await api.submitHomework(submissionRecord);

    // Send real notification to Faculty
    if (typeof window.addSystemNotification === 'function') {
      window.addSystemNotification(
        `${studentName} (${studentId}) has completed the homework: "${assignment.title}" on ${completedDate}`,
        'fa-clipboard-check',
        'Faculty'
      );
    }

    showToast(`🎉 Homework Completed! Score: ${score}/${totalQuestions} (${pct}%) on ${completedDate}`, 'success');
    closeModal('attemptHomeworkModal');

    // Reload page to display real completed badge, timestamp & recalculate charts
    await initMarksPage();
  } catch (err) {
    showToast('Failed to submit homework', 'error');
  }
}

// Setup homework forms and drag-drop events
function setupHomeworkForms() {
  const addForm = document.getElementById('addHomeworkForm');
  if (addForm) addForm.addEventListener('submit', handlePublishHomework);

  const attemptForm = document.getElementById('attemptHomeworkForm');
  if (attemptForm) attemptForm.addEventListener('submit', handleStudentSubmitHomework);

  // Drag and drop for PDF file uploader
  const dropZone = document.getElementById('pdfDropZone');
  if (dropZone) {
    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.style.borderColor = 'var(--primary-color)';
      }, false);
    });
    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.style.borderColor = 'var(--border-color)';
      }, false);
    });
    dropZone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files.length) {
        handleStudentPdfSelected({ target: { files: files } });
      }
    });
  }
}

// Hook setupHomeworkForms into DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  setupHomeworkForms();
});

