/*
  EduPortal — Homework & Assignment Hub Controller (js/homework.js)
  Supports:
  - Faculty: "Add Homework" with dynamic MCQs, PDF upload permission toggle, real-time student submission tracking
  - Student: Real-time homework list, quiz solver, PDF uploader, completion date & score tracking
  - Instant multi-role notifications between Faculty & Students
*/

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

let _currentAttemptPdf = null;
let _allHomeworkAssignments = [];
let _allHomeworkSubmissions = [];
let _studentAssignments = [];

document.addEventListener('DOMContentLoaded', () => {
  initHomeworkPage();
  setupHomeworkEvents();
});

async function initHomeworkPage() {
  const user = auth.getCurrentUser();
  if (!user) return;

  const content = document.getElementById('homeworkMainContent');
  if (!content) return;

  if (user.role === 'Student') {
    await renderStudentHomeworkPage(user, content);
  } else {
    await renderFacultyHomeworkPage(user, content);
  }
}

/* ══════════════════════════════════════════════════════════════
   FACULTY VIEW: ADD HOMEWORK & MONITOR SUBMISSIONS
══════════════════════════════════════════════════════════════ */
async function renderFacultyHomeworkPage(user, content) {
  const [assignments, submissions] = await Promise.all([
    api.getHomeworkAssignments(),
    api.getHomeworkSubmissions()
  ]);

  _allHomeworkAssignments = assignments;
  _allHomeworkSubmissions = submissions;

  const totalAssignments = assignments.length;
  const totalSubmissions = submissions.length;
  const uniqueStudents = [...new Set(submissions.map(s => s.studentId))].length;
  const avgScore = submissions.length 
    ? Math.round(submissions.reduce((s, sub) => s + (sub.percentage || 0), 0) / submissions.length) 
    : 0;

  content.innerHTML = `
    <!-- Faculty Hero Banner -->
    <div class="hw-hero">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:16px;">
        <div>
          <div class="hw-hero-title">
            <i class="fas fa-file-signature"></i>
            Faculty Homework &amp; Coursework Management Hub
          </div>
          <div class="hw-hero-sub">
            Create homework assignments with Multiple Choice Questions (MCQs) and optional PDF document uploads. Students get live updates immediately.
          </div>
        </div>
        <button class="btn btn-warning" onclick="openAddHomeworkModal()" style="font-weight:700; padding:10px 20px; font-size:14px;">
          <i class="fas fa-plus-circle"></i> Add Homework
        </button>
      </div>

      <!-- KPI Summary Row -->
      <div class="hw-kpi-row">
        <div class="hw-kpi-card">
          <div class="hw-kpi-value">${totalAssignments}</div>
          <div class="hw-kpi-label">Active Assignments</div>
        </div>
        <div class="hw-kpi-card">
          <div class="hw-kpi-value">${totalSubmissions}</div>
          <div class="hw-kpi-label">Total Submissions</div>
        </div>
        <div class="hw-kpi-card">
          <div class="hw-kpi-value">${uniqueStudents}</div>
          <div class="hw-kpi-label">Students Completed</div>
        </div>
        <div class="hw-kpi-card">
          <div class="hw-kpi-value">${avgScore}%</div>
          <div class="hw-kpi-label">Average Score</div>
        </div>
      </div>
    </div>

    <!-- Filter Bar -->
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:16px;">
      <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
        <select id="facultySubFilter" class="form-control" style="max-width:240px;" onchange="filterFacultyHomework()">
          <option value="">All Subjects</option>
        </select>
        <input type="text" id="facultySearchFilter" class="form-control" placeholder="Search by title..." style="max-width:220px;" oninput="filterFacultyHomework()">
      </div>
      <button class="btn btn-primary btn-sm" onclick="openAddHomeworkModal()">
        <i class="fas fa-plus"></i> Add New Homework
      </button>
    </div>

    <!-- Assignments Grid -->
    <div id="facultyHwCardsGrid" class="hw-assignment-grid"></div>
  `;

  populateFacultySubjectFilter(assignments);
  renderFacultyCards(assignments);
}

function populateFacultySubjectFilter(assignments) {
  const sel = document.getElementById('facultySubFilter');
  if (!sel) return;
  const subjects = [...new Set(assignments.map(a => a.subject))];
  sel.innerHTML = '<option value="">All Subjects</option>' +
    subjects.map(s => `<option value="${s}">${s}</option>`).join('');
}

function filterFacultyHomework() {
  const sub = document.getElementById('facultySubFilter')?.value || '';
  const search = (document.getElementById('facultySearchFilter')?.value || '').toLowerCase();

  const filtered = _allHomeworkAssignments.filter(a => {
    const matchesSub = !sub || a.subject === sub;
    const matchesSearch = !search || (a.title || '').toLowerCase().includes(search) || (a.description || '').toLowerCase().includes(search);
    return matchesSub && matchesSearch;
  });

  renderFacultyCards(filtered);
}

function renderFacultyCards(assignments) {
  const grid = document.getElementById('facultyHwCardsGrid');
  if (!grid) return;

  if (!assignments || !assignments.length) {
    grid.innerHTML = `
      <div style="grid-column:1/-1; background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:14px; padding:36px; text-align:center;">
        <i class="fas fa-tasks" style="font-size:36px; color:var(--text-muted); margin-bottom:12px;"></i>
        <h4 style="color:var(--text-primary); margin-bottom:4px;">No Homework Found</h4>
        <p style="font-size:13px; color:var(--text-muted); margin-bottom:14px;">Publish an assignment to notify students.</p>
        <button class="btn btn-warning btn-sm" onclick="openAddHomeworkModal()"><i class="fas fa-plus"></i> Add Homework Now</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = assignments.map((a, i) => {
    const col = SUBJECT_COLORS[i % SUBJECT_COLORS.length];
    const subs = _allHomeworkSubmissions.filter(s => String(s.assignmentId) === String(a.id));
    const subCount = subs.length;
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

/* ══════════════════════════════════════════════════════════════
   STUDENT VIEW: REAL DATA, SUBMIT HOMEWORK & VIEW COMPLETION DATE
══════════════════════════════════════════════════════════════ */
async function renderStudentHomeworkPage(user, content) {
  let studentId = user.studentId;
  if (!studentId) {
    const students = await api.getStudents();
    const match = students.find(s =>
      s.name.toLowerCase() === (user.name || '').toLowerCase() ||
      s.email.toLowerCase() === (user.email || '').toLowerCase()
    );
    studentId = match ? match.studentId : 'STU-1001';
  }

  const studentAssignments = await api.getStudentAssignmentsWithStatus(studentId);
  _studentAssignments = studentAssignments;
  window._currentStudentId = studentId;

  const totalAssigned = studentAssignments.length;
  const completedAssignments = studentAssignments.filter(a => a.isCompleted);
  const totalCompleted = completedAssignments.length;
  const pendingCount = totalAssigned - totalCompleted;
  const completionRate = totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0;

  content.innerHTML = `
    <!-- Student Hero Banner -->
    <div class="hw-hero">
      <div class="hw-hero-title">
        <i class="fas fa-tasks"></i>
        My Real Homework &amp; Assignment Portal
      </div>
      <div class="hw-hero-sub">
        Attempt interactive multiple choice questions and upload your solution documents. Track exact completion timestamps and verified scores.
      </div>

      <!-- Real Student KPI Cards -->
      <div class="hw-kpi-row">
        <div class="hw-kpi-card">
          <div class="hw-kpi-value">${totalAssigned}</div>
          <div class="hw-kpi-label">Assigned Homework</div>
        </div>
        <div class="hw-kpi-card">
          <div class="hw-kpi-value" style="color:#bbf7d0;">${totalCompleted}</div>
          <div class="hw-kpi-label">Completed Homework</div>
        </div>
        <div class="hw-kpi-card">
          <div class="hw-kpi-value" style="color:#fde68a;">${pendingCount}</div>
          <div class="hw-kpi-label">Pending Attempt</div>
        </div>
        <div class="hw-kpi-card">
          <div class="hw-kpi-value" style="color:#a5f3fc;">${completionRate}%</div>
          <div class="hw-kpi-label">Real Completion Rate</div>
        </div>
      </div>
    </div>

    <!-- Student Filter Bar -->
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:16px;">
      <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
        <select id="studentSubFilter" class="form-control" style="max-width:220px;" onchange="filterStudentHomework()">
          <option value="">All Subjects</option>
        </select>
        <select id="studentStatusFilter" class="form-control" style="max-width:180px;" onchange="filterStudentHomework()">
          <option value="">All Statuses</option>
          <option value="pending">Pending Attempt</option>
          <option value="completed">Completed</option>
        </select>
        <input type="text" id="studentSearchFilter" class="form-control" placeholder="Search assignment..." style="max-width:200px;" oninput="filterStudentHomework()">
      </div>
      <span class="badge badge-info" style="font-size:12px; padding:6px 12px;">
        <i class="fas fa-check-double"></i> Real Dynamic Records
      </span>
    </div>

    <!-- Student Cards Grid -->
    <div id="studentHwCardsGrid" class="hw-assignment-grid"></div>
  `;

  populateStudentSubjectFilter(studentAssignments);
  renderStudentCards(studentAssignments);
}

function populateStudentSubjectFilter(assignments) {
  const sel = document.getElementById('studentSubFilter');
  if (!sel) return;
  const subjects = [...new Set(assignments.map(a => a.subject))];
  sel.innerHTML = '<option value="">All Subjects</option>' +
    subjects.map(s => `<option value="${s}">${s}</option>`).join('');
}

function filterStudentHomework() {
  const sub = document.getElementById('studentSubFilter')?.value || '';
  const status = document.getElementById('studentStatusFilter')?.value || '';
  const search = (document.getElementById('studentSearchFilter')?.value || '').toLowerCase();

  const filtered = _studentAssignments.filter(a => {
    const matchesSub = !sub || a.subject === sub;
    const matchesStatus = !status || (status === 'completed' ? a.isCompleted : !a.isCompleted);
    const matchesSearch = !search || (a.title || '').toLowerCase().includes(search) || (a.description || '').toLowerCase().includes(search);
    return matchesSub && matchesStatus && matchesSearch;
  });

  renderStudentCards(filtered);
}

function renderStudentCards(assignments) {
  const grid = document.getElementById('studentHwCardsGrid');
  if (!grid) return;

  if (!assignments || !assignments.length) {
    grid.innerHTML = `
      <div style="grid-column:1/-1; background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:14px; padding:36px; text-align:center;">
        <i class="fas fa-clipboard-check" style="font-size:36px; color:var(--text-muted); margin-bottom:12px;"></i>
        <h4 style="color:var(--text-primary); margin-bottom:4px;">No Homework Matching Criteria</h4>
        <p style="font-size:13px; color:var(--text-muted);">Try adjusting your filter settings above.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = assignments.map((a, i) => {
    const col = SUBJECT_COLORS[i % SUBJECT_COLORS.length];
    const qCount = (a.questions || []).length;
    const isDone = a.isCompleted && a.submission;

    let bannerHtml = '';
    if (isDone) {
      const sub = a.submission;
      bannerHtml = `
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

          <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:10px;">
            <span class="hw-tag"><i class="fas fa-list-ol"></i> ${qCount} MCQs</span>
            ${a.allowPdfUpload 
              ? `<span class="hw-tag" style="color:#ef4444;"><i class="fas fa-file-pdf"></i> PDF Upload Allowed</span>`
              : `<span class="hw-tag"><i class="fas fa-ban"></i> MCQs Only</span>`
            }
          </div>

          ${bannerHtml}
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

/* ══════════════════════════════════════════════════════════════
   SHARED MODAL & EVENT ACTIONS
══════════════════════════════════════════════════════════════ */

// Open Add Homework Modal
window.openAddHomeworkModal = async function() {
  const form = document.getElementById('addHomeworkForm');
  if (form) form.reset();

  const subSel = document.getElementById('hwSubjectSelect');
  if (subSel) {
    const courses = await api.getCourses();
    subSel.innerHTML = '<option value="">Select Subject...</option>' +
      courses.map(c => `<option value="${c.name}" data-code="${c.code}" data-sem="${c.semester}">${c.name} (${c.code})</option>`).join('');
  }

  const dueInput = document.getElementById('hwDueDate');
  if (dueInput) {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    dueInput.value = d.toISOString().split('T')[0];
  }

  const mcqContainer = document.getElementById('hwMcqContainer');
  if (mcqContainer) {
    mcqContainer.innerHTML = '';
    addNewMcqQuestionRow('Explain and identify the primary architectural principle of this topic:', 'Inheritance & Encapsulation', 'Polymorphism & Abstraction', 'Modular Decomposition', 'State Redirection', 0);
    addNewMcqQuestionRow('What is the optimal complexity or best practice for standard implementation?', 'O(1) Constant Time', 'O(log n) Logarithmic', 'O(n) Linear Time', 'O(n^2) Quadratic', 1);
  }

  openModal('addHomeworkModal');
};

window.handleHwSubjectChange = function() {
  const sel = document.getElementById('hwSubjectSelect');
  if (!sel) return;
  const opt = sel.options[sel.selectedIndex];
  if (opt && opt.dataset.code) {
    document.getElementById('hwSubjectCode').value = opt.dataset.code;
    document.getElementById('hwSemester').value = opt.dataset.sem || 5;
  }
};

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
    Array.from(container.children).forEach((child, idx) => {
      const badge = child.querySelector('.badge');
      if (badge) badge.innerText = `Q${idx + 1}`;
    });
  }
};

// Handle Faculty Publishing New Homework
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

    // Notify all students in real time
    if (typeof window.addSystemNotification === 'function') {
      window.addSystemNotification(
        `📢 New Homework Assigned: "${title}" for ${subject} (Due: ${dueDate})`,
        'fa-file-signature',
        'Student'
      );
    }

    showToast(`🎉 Homework "${title}" published successfully! Students have received updates.`, 'success');
    closeModal('addHomeworkModal');
    await initHomeworkPage();
  } catch {
    showToast('Failed to save homework assignment', 'error');
  }
}

// View Homework Submissions
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

// Delete Homework
window.deleteHomeworkAssignment = function(assignmentId) {
  showConfirm('Delete Homework Assignment', 'Are you sure you want to delete this homework? All student submissions for it will also be deleted.', async () => {
    try {
      await api.deleteHomeworkAssignment(assignmentId);
      showToast('Homework assignment deleted successfully.', 'success');
      await initHomeworkPage();
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

  const pdfSection = document.getElementById('attemptPdfUploadSection');
  if (pdfSection) {
    pdfSection.style.display = assignment.allowPdfUpload ? 'block' : 'none';
  }

  openModal('attemptHomeworkModal');
};

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

    // Notify Faculty
    if (typeof window.addSystemNotification === 'function') {
      window.addSystemNotification(
        `${studentName} (${studentId}) has completed the homework: "${assignment.title}" on ${completedDate}`,
        'fa-clipboard-check',
        'Faculty'
      );
    }

    showToast(`🎉 Homework Completed! Score: ${score}/${totalQuestions} (${pct}%) on ${completedDate}`, 'success');
    closeModal('attemptHomeworkModal');

    await initHomeworkPage();
  } catch (err) {
    showToast('Failed to submit homework', 'error');
  }
}

function setupHomeworkEvents() {
  const addForm = document.getElementById('addHomeworkForm');
  if (addForm) addForm.addEventListener('submit', handlePublishHomework);

  const attemptForm = document.getElementById('attemptHomeworkForm');
  if (attemptForm) attemptForm.addEventListener('submit', handleStudentSubmitHomework);

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
