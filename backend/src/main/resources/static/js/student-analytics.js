/*
  Student Analytics — Admin & Faculty view
  Full per-student performance: marks, attendance, homework, monthly trend
*/

const COLORS = [
  '#6366f1','#ec4899','#f59e0b','#10b981',
  '#06b6d4','#f97316','#8b5cf6','#ef4444'
];

const activeCharts = {};
function destroyChart(id) {
  if (activeCharts[id]) { activeCharts[id].destroy(); delete activeCharts[id]; }
}

document.addEventListener('DOMContentLoaded', async () => {
  auth.requireRole(['Admin', 'Faculty']);
  await initAnalyticsPage();
});

async function initAnalyticsPage() {
  const students = await api.getStudents();
  const picker = document.getElementById('studentPicker');
  students.forEach(s => {
    picker.innerHTML += `<option value="${s.studentId}">${s.name} (${s.rollNo})</option>`;
  });

  // Load overview table
  await renderAllStudentsOverview(students);
}

/* ── All-students overview table ─────────────────────────────── */
async function renderAllStudentsOverview(students) {
  const allMarks = await api.getMarks();
  const allAtt   = await api.getAttendance();
  const tbody = document.getElementById('allStudentsBody');
  if (!tbody) return;

  tbody.innerHTML = students.map(s => {
    const sMarks = allMarks.filter(m => m.studentId === s.studentId);
    const sAtt   = allAtt.filter(a => a.studentId === s.studentId);

    const avgMarks = sMarks.length ? Math.round(sMarks.reduce((x, m) => x + m.percentage, 0) / sMarks.length) : 0;
    const avgAtt   = sAtt.length   ? Math.round(sAtt.reduce((x, a) => x + a.percentage, 0) / sAtt.length)   : 0;
    const bestGrade = sMarks.length ? sMarks.reduce((b, m) => m.percentage > b.percentage ? m : b, sMarks[0]).grade : 'N/A';

    let perfLabel, perfClass;
    if      (avgMarks >= 85) { perfLabel = '🏆 Excellent'; perfClass = 'perf-excellent'; }
    else if (avgMarks >= 70) { perfLabel = '👍 Good';      perfClass = 'perf-good'; }
    else if (avgMarks >= 55) { perfLabel = '📈 Average';   perfClass = 'perf-average'; }
    else                     { perfLabel = '⚠️ Needs Help'; perfClass = 'perf-poor'; }

    return `
      <tr>
        <td>
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="width:32px; height:32px; border-radius:8px; background:${getStudentColor(s.studentId)};
              display:flex; align-items:center; justify-content:center; color:#fff; font-weight:700; font-size:13px; flex-shrink:0;">
              ${s.name.charAt(0)}
            </div>
            <div>
              <div style="font-weight:700; font-size:13px; color:var(--text-primary);">${s.name}</div>
              <div style="font-size:11px; color:var(--text-muted);">${s.rollNo}</div>
            </div>
          </div>
        </td>
        <td><strong>${s.studentId}</strong></td>
        <td style="font-size:12px;">${s.department}</td>
        <td>
          <div style="display:flex; align-items:center; gap:8px;">
            <div style="flex:1; height:6px; background:var(--bg-tertiary); border-radius:99px; min-width:60px;">
              <div style="height:100%; width:${avgMarks}%; background:${avgMarks >= 75 ? '#10b981' : avgMarks >= 55 ? '#f59e0b' : '#ef4444'}; border-radius:99px;"></div>
            </div>
            <span style="font-weight:700; font-size:13px; color:var(--text-primary);">${avgMarks}%</span>
          </div>
        </td>
        <td>
          <span style="font-weight:700; color:${avgAtt >= 75 ? '#10b981' : '#ef4444'};">${avgAtt}%</span>
        </td>
        <td><span class="badge badge-success">${sMarks.length}</span></td>
        <td><span class="badge badge-${['A+','A'].includes(bestGrade) ? 'success' : 'warning'}">${bestGrade}</span></td>
        <td><span class="performance-badge ${perfClass}">${perfLabel}</span></td>
      </tr>
    `;
  }).join('');
}

function getStudentColor(id) {
  const colors = ['#6366f1','#ec4899','#10b981','#f59e0b'];
  const idx = parseInt(id.replace(/\D/g,'')) % colors.length;
  return colors[idx];
}

/* ── Per-student analytics ───────────────────────────────────── */
window.loadStudentAnalytics = async function(studentId) {
  const content = document.getElementById('analyticsContent');
  if (!studentId) {
    content.innerHTML = `<div class="loading-overlay"><i class="fas fa-chart-pie" style="font-size:48px; color:var(--primary-color); margin-bottom:16px;"></i><p style="font-size:16px; font-weight:600; color:var(--text-primary);">Select a student above</p></div>`;
    return;
  }

  content.innerHTML = `<div class="loading-overlay"><div class="spinner" style="margin:0 auto;"></div><p style="margin-top:12px;">Loading analytics...</p></div>`;

  const [students, marks, attendance, homework, monthly] = await Promise.all([
    api.getStudents(),
    api.getMarksByStudent(studentId),
    api.getAttendanceByStudent(studentId),
    api.getHomeworkByStudent(studentId),
    api.getMonthlyPerformanceByStudent(studentId)
  ]);

  const student = students.find(s => s.studentId === studentId);
  if (!student) { content.innerHTML = '<p>Student not found.</p>'; return; }

  const avgMarks = marks.length ? Math.round(marks.reduce((s, m) => s + m.percentage, 0) / marks.length) : 0;
  const avgAtt   = attendance.length ? Math.round(attendance.reduce((s, a) => s + a.percentage, 0) / attendance.length) : 0;
  const avgHW    = homework.length ? Math.round(homework.reduce((s, h) => s + h.percentage, 0) / homework.length) : 0;
  const topMark  = marks.length ? marks.reduce((b, m) => m.percentage > b.percentage ? m : b, marks[0]) : null;
  const avatarColor = getStudentColor(studentId);

  content.innerHTML = `
    <!-- Student Profile Card -->
    <div class="student-profile-card">
      <div class="stu-avatar-big" style="background:${avatarColor};">${student.name.charAt(0)}</div>
      <div class="stu-info">
        <h3>${student.name}</h3>
        <p>${student.studentId} &bull; ${student.rollNo} &bull; ${student.department}</p>
        <p>${student.course} &bull; ${student.year} &bull; Sem ${student.semester}</p>
      </div>
      <div class="stu-kpis">
        <div class="stu-kpi">
          <div class="stu-kpi-val" style="color:#6366f1;">${avgMarks}%</div>
          <div class="stu-kpi-lab">Avg Marks</div>
        </div>
        <div class="stu-kpi">
          <div class="stu-kpi-val" style="color:${avgAtt >= 75 ? '#10b981' : '#ef4444'};">${avgAtt}%</div>
          <div class="stu-kpi-lab">Attendance</div>
        </div>
        <div class="stu-kpi">
          <div class="stu-kpi-val" style="color:#f59e0b;">${avgHW}%</div>
          <div class="stu-kpi-lab">Homework</div>
        </div>
        <div class="stu-kpi">
          <div class="stu-kpi-val" style="color:#ec4899;">${marks.length}</div>
          <div class="stu-kpi-lab">Subjects</div>
        </div>
        ${topMark ? `
        <div class="stu-kpi">
          <div class="stu-kpi-val" style="color:#8b5cf6;">${topMark.grade}</div>
          <div class="stu-kpi-lab">Best Grade</div>
        </div>` : ''}
      </div>
    </div>

    <!-- Charts Grid Row 1 -->
    <div class="analytics-grid">
      <!-- Monthly Trend -->
      <div class="chart-card full">
        <div class="chart-card-title"><i class="fas fa-chart-line" style="background:rgba(99,102,241,0.15); color:#6366f1;"></i> Monthly Performance Trend</div>
        <div class="chart-card-sub">Marks, Attendance & Homework Done over months</div>
        <div class="chart-wrap-lg"><canvas id="a_monthlyTrend"></canvas></div>
      </div>

      <!-- Marks per subject bar -->
      <div class="chart-card">
        <div class="chart-card-title"><i class="fas fa-star" style="background:rgba(245,158,11,0.15); color:#f59e0b;"></i> Subject Marks</div>
        <div class="chart-card-sub">Total score in each subject</div>
        <div class="chart-wrap"><canvas id="a_subjectBar"></canvas></div>
      </div>

      <!-- Attendance per subject -->
      <div class="chart-card">
        <div class="chart-card-title"><i class="fas fa-calendar-check" style="background:rgba(16,185,129,0.15); color:#10b981;"></i> Subject Attendance</div>
        <div class="chart-card-sub">Attendance % per subject (75% min required)</div>
        <div class="chart-wrap"><canvas id="a_attBar"></canvas></div>
      </div>

      <!-- Homework doughnut -->
      <div class="chart-card">
        <div class="chart-card-title"><i class="fas fa-pencil-alt" style="background:rgba(249,115,22,0.15); color:#f97316;"></i> Homework Completion</div>
        <div class="chart-card-sub">Assignments completed vs pending per subject</div>
        <div class="chart-wrap"><canvas id="a_hwDoughnut"></canvas></div>
      </div>

      <!-- Radar -->
      <div class="chart-card">
        <div class="chart-card-title"><i class="fas fa-circle-notch" style="background:rgba(139,92,246,0.15); color:#8b5cf6;"></i> Performance Radar</div>
        <div class="chart-card-sub">Multi-dimensional overview</div>
        <div class="chart-wrap"><canvas id="a_radar"></canvas></div>
      </div>
    </div>

    <!-- Subject-wise progress bars -->
    <div class="chart-card" style="margin-bottom:20px;">
      <div class="chart-card-title"><i class="fas fa-list" style="background:rgba(6,182,212,0.15); color:#06b6d4;"></i> Subject Marks Breakdown</div>
      <div class="chart-card-sub">Internal, External & Total with visual progress</div>
      <table class="mini-table">
        <thead>
          <tr>
            <th>Subject</th>
            <th>Code</th>
            <th>Internal</th>
            <th>External</th>
            <th>Total</th>
            <th>Grade</th>
            <th>Progress</th>
          </tr>
        </thead>
        <tbody>
          ${marks.map((m, i) => {
            const col = COLORS[i % COLORS.length];
            return `
              <tr>
                <td style="font-weight:600; color:var(--text-primary);">${m.subject}</td>
                <td><span class="badge badge-success" style="font-size:10px;">${m.subjectCode}</span></td>
                <td>${m.internalMarks}/30</td>
                <td>${m.externalMarks}/70</td>
                <td><strong>${m.totalMarks}/100</strong></td>
                <td><span style="font-weight:800; color:${col};">${m.grade}</span></td>
                <td style="min-width:120px;">
                  <div style="height:6px; background:var(--bg-tertiary); border-radius:99px;">
                    <div style="height:100%; width:${m.percentage}%; background:${col}; border-radius:99px;"></div>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;

  // Draw all charts
  renderA_MonthlyTrend(monthly, marks);
  renderA_SubjectBar(marks);
  renderA_AttBar(attendance);
  renderA_HWDoughnut(homework);
  renderA_Radar(marks, attendance, homework);
};

function renderA_MonthlyTrend(monthly, marks = []) {
  const ctx = document.getElementById('a_monthlyTrend')?.getContext('2d');
  if (!ctx) return;

  let trendData = Array.isArray(monthly) ? [...monthly] : [];
  if (marks && marks.length > 0 && trendData.length > 0) {
    const liveAvg = Math.round(marks.reduce((s, m) => s + (m.percentage || 0), 0) / marks.length);
    trendData = trendData.map((item, idx) => {
      if (idx === trendData.length - 1) {
        return { ...item, avgMarks: liveAvg };
      }
      return item;
    });
  }

  destroyChart('a_monthly');
  activeCharts['a_monthly'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: trendData.map(m => m.month),
      datasets: [
        { label: 'Avg. Marks %', data: trendData.map(m => m.avgMarks), borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', fill: true, tension: 0.4, pointRadius: 5, pointBackgroundColor: '#6366f1' },
        { label: 'Attendance %', data: trendData.map(m => m.attendance), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.08)', fill: true, tension: 0.4, pointRadius: 5, pointBackgroundColor: '#10b981' },
        { label: 'Homework %',   data: trendData.map(m => m.homeworkDone), borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.08)', fill: true, tension: 0.4, pointRadius: 5, pointBackgroundColor: '#f59e0b' }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { position: 'top', labels: { boxWidth: 12 } } },
      scales: {
        y: { min: 0, max: 100, ticks: { callback: v => v + '%', color: '#94a3b8' }, grid: { color: 'rgba(0,0,0,0.05)' } },
        x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
      }
    }
  });
}

function renderA_SubjectBar(marks) {
  const ctx = document.getElementById('a_subjectBar')?.getContext('2d');
  if (!ctx) return;
  destroyChart('a_subjBar');
  activeCharts['a_subjBar'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: marks.map(m => m.subjectCode),
      datasets: [{
        label: 'Total Marks',
        data: marks.map(m => m.totalMarks),
        backgroundColor: COLORS.slice(0, marks.length),
        borderRadius: 8,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { max: 100, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(0,0,0,0.05)' } },
        x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
      }
    }
  });
}

function renderA_AttBar(attendance) {
  const ctx = document.getElementById('a_attBar')?.getContext('2d');
  if (!ctx) return;
  destroyChart('a_att');
  activeCharts['a_att'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: attendance.map(a => a.subject.length > 16 ? a.subject.substring(0,14)+'…' : a.subject),
      datasets: [{
        label: 'Attendance %',
        data: attendance.map(a => a.percentage),
        backgroundColor: attendance.map(a => a.percentage >= 75 ? '#10b981' : '#ef4444'),
        borderRadius: 8,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { min: 0, max: 100, ticks: { callback: v => v + '%', color: '#94a3b8' }, grid: { color: 'rgba(0,0,0,0.05)' } },
        x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } }
      }
    }
  });
}

function renderA_HWDoughnut(homework) {
  const ctx = document.getElementById('a_hwDoughnut')?.getContext('2d');
  if (!ctx) return;
  destroyChart('a_hw');

  const totalComp = (homework || []).reduce((s, h) => s + (h.completed || 0), 0);
  const totalAssign = (homework || []).reduce((s, h) => s + (h.total || 0), 0);

  if (totalComp === 0) {
    activeCharts['a_hw'] = new Chart(ctx, {
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
    activeCharts['a_hw'] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: homework.map(h => h.subject.length > 16 ? h.subject.substring(0,14)+'…' : h.subject),
        datasets: [{
          data: homework.map(h => h.completed),
          backgroundColor: COLORS.slice(0, homework.length),
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        cutout: '55%',
        plugins: { legend: { position: 'right', labels: { boxWidth: 10, font: { size: 11 } } } }
      }
    });
  }
}

function renderA_Radar(marks, attendance, homework) {
  const ctx = document.getElementById('a_radar')?.getContext('2d');
  if (!ctx) return;
  const avgMarks = marks.length ? Math.round(marks.reduce((s, m) => s + m.percentage, 0) / marks.length) : 0;
  const avgAtt   = attendance.length ? Math.round(attendance.reduce((s, a) => s + a.percentage, 0) / attendance.length) : 0;
  const avgHW    = homework.length ? Math.round(homework.reduce((s, h) => s + h.percentage, 0) / homework.length) : 0;
  const gradeScore = marks.length ? Math.round(marks.filter(m => ['A+','A'].includes(m.grade)).length / marks.length * 100) : 0;
  const passRate   = marks.length ? Math.round(marks.filter(m => m.percentage >= 40).length / marks.length * 100) : 0;

  destroyChart('a_radar');
  activeCharts['a_radar'] = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Avg. Marks', 'Attendance', 'Homework', 'A/A+ Rate', 'Pass Rate'],
      datasets: [{
        label: 'Performance',
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
