// STUDENT360 — Marks Entry & Grading Module
const Marks = {
  subjects: [],
  students: [],

  async init() {
    await this.loadMetadata();
    if (Auth.isStudent()) {
      await this.loadMyMarks();
    } else {
      await this.loadMarksList();
    }
  },

  async loadMetadata() {
    try {
      this.subjects = await API.get('/subjects') || [];
      this.students = await API.get('/students') || [];
      this.populateDropdowns();
    } catch (e) {
      console.error('Marks metadata error:', e);
    }
  },

  populateDropdowns() {
    const subSel = document.getElementById('marks-filter-subject');
    const formSubSel = document.getElementById('marks-form-subject');
    const formStuSel = document.getElementById('marks-form-student');

    if (subSel) {
      subSel.innerHTML = '<option value="">All Subjects</option>' +
        this.subjects.map(s => `<option value="${s.id}">${s.code} - ${s.name}</option>`).join('');
    }
    if (formSubSel) {
      formSubSel.innerHTML = '<option value="">Select Subject *</option>' +
        this.subjects.map(s => `<option value="${s.id}">${s.code} - ${s.name} (${s.credits} Credits)</option>`).join('');
    }
    if (formStuSel) {
      formStuSel.innerHTML = '<option value="">Select Student *</option>' +
        this.students.map(s => `<option value="${s.id}">${s.rollNumber} - ${s.firstName} ${s.lastName}</option>`).join('');
    }
  },

  async loadMarksList() {
    const subId = document.getElementById('marks-filter-subject')?.value;
    const tbody = document.getElementById('marks-table-body');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:24px;">Loading marks records...</td></tr>';

    try {
      let data = [];
      if (subId) {
        data = await API.get(`/marks/subject/${subId}`) || [];
      } else {
        // Collect across subjects or demo student
        data = await API.get('/marks/subject/1') || [];
      }
      this.renderTable(data);
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; color:var(--danger); padding:24px;">${err.message}</td></tr>`;
    }
  },

  renderTable(list) {
    const tbody = document.getElementById('marks-table-body');
    if (!tbody) return;

    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:24px; color:var(--text-muted);">No marks recorded for this subject.</td></tr>';
      return;
    }

    const canEdit = Auth.isAdmin() || Auth.isTeacher();

    tbody.innerHTML = list.map(m => `
      <tr>
        <td><b>${m.studentRoll}</b></td>
        <td>${m.studentName}</td>
        <td><b>${m.subjectCode}</b><br><small style="color:var(--text-muted)">${m.subjectName}</small></td>
        <td>${m.internal}/20</td>
        <td>${m.assignment}/20</td>
        <td>${m.midterm}/30</td>
        <td>${m.endSem}/30</td>
        <td>
          <b style="font-size:1.05rem;">${m.total}/100</b> (${m.percentage}%)
          <br><span class="badge badge-active">${m.grade} (${m.gradePoints} pts)</span>
        </td>
        <td>
          ${canEdit ? `
            <button class="btn btn-sm btn-secondary" onclick="Marks.openEditModal(${m.studentId}, ${m.subjectId}, ${m.internal}, ${m.assignment}, ${m.midterm}, ${m.endSem})">Edit</button>
          ` : ''}
        </td>
      </tr>
    `).join('');
  },

  computePreview() {
    const inVal = Number(document.getElementById('marks-in')?.value || 0);
    const asVal = Number(document.getElementById('marks-as')?.value || 0);
    const midVal = Number(document.getElementById('marks-mid')?.value || 0);
    const endVal = Number(document.getElementById('marks-end')?.value || 0);

    const total = inVal + asVal + midVal + endVal;
    let grade = 'F';
    let pts = 0;
    if (total >= 90) { grade = 'A+'; pts = 10; }
    else if (total >= 80) { grade = 'A'; pts = 9; }
    else if (total >= 70) { grade = 'B+'; pts = 8; }
    else if (total >= 60) { grade = 'B'; pts = 7; }
    else if (total >= 50) { grade = 'C'; pts = 6; }
    else if (total >= 40) { grade = 'D'; pts = 5; }

    const prevEl = document.getElementById('marks-preview');
    if (prevEl) {
      prevEl.innerHTML = `Total: <b>${total}/100</b> (${total}%) · Grade: <span class="badge badge-active">${grade}</span> · Points: <b>${pts}</b>`;
    }
  },

  openAddModal() {
    document.getElementById('marks-form').reset();
    this.computePreview();
    document.getElementById('marks-form-modal').classList.add('active');
  },

  openEditModal(studentId, subjectId, internal, assignment, midterm, endSem) {
    document.getElementById('marks-form-student').value = studentId;
    document.getElementById('marks-form-subject').value = subjectId;
    document.getElementById('marks-in').value = internal;
    document.getElementById('marks-as').value = assignment;
    document.getElementById('marks-mid').value = midterm;
    document.getElementById('marks-end').value = endSem;
    this.computePreview();
    document.getElementById('marks-form-modal').classList.add('active');
  },

  async saveMarks(event) {
    event.preventDefault();
    const errContainer = document.getElementById('marks-form-errors');
    errContainer.innerHTML = '';

    const body = {
      studentId: Number(document.getElementById('marks-form-student').value),
      subjectId: Number(document.getElementById('marks-form-subject').value),
      internal: Number(document.getElementById('marks-in').value),
      assignment: Number(document.getElementById('marks-as').value),
      midterm: Number(document.getElementById('marks-mid').value),
      endSem: Number(document.getElementById('marks-end').value)
    };

    try {
      await API.post('/marks', body);
      API.toast('Marks entered successfully!', 'success');
      document.getElementById('marks-form-modal').classList.remove('active');
      await this.loadMarksList();
      Dashboard.loadStats();
    } catch (err) {
      if (err.errors) {
        errContainer.innerHTML = Object.entries(err.errors).map(([k, v]) => `<div>• ${v}</div>`).join('');
      } else {
        errContainer.innerHTML = `<div>• ${err.message}</div>`;
      }
    }
  },

  async loadMyMarks() {
    const container = document.getElementById('my-marks-container');
    if (!container) return;

    try {
      const gpa = await API.get('/marks/my/gpa');
      container.innerHTML = `
        <div class="stats-grid" style="margin-bottom:20px;">
          <div class="stat-card glass">
            <div class="stat-content">
              <div class="stat-number" style="color:var(--secondary)">${gpa.cgpa}</div>
              <div class="stat-label">Cumulative GPA (CGPA)</div>
            </div>
          </div>
          <div class="stat-card glass">
            <div class="stat-content">
              <div class="stat-number">${gpa.gpa}</div>
              <div class="stat-label">Current Semester GPA</div>
            </div>
          </div>
        </div>

        ${(gpa.semesters || []).map(sem => `
          <div class="glass" style="padding:20px; margin-bottom:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <h3>Semester ${sem.semester}</h3>
              <div><b>GPA: ${sem.gpa}</b> · <small style="color:var(--text-muted)">Credits: ${sem.totalCredits}</small></div>
            </div>
            <table class="data-table">
              <thead><tr><th>Subject</th><th>Internal (20)</th><th>Assignment (20)</th><th>Midsem (30)</th><th>Endsem (30)</th><th>Total</th><th>Grade</th></tr></thead>
              <tbody>
                ${(sem.subjects || []).map(s => `
                  <tr>
                    <td><b>${s.subjectCode}</b> - ${s.subjectName}</td>
                    <td>${s.internal}</td>
                    <td>${s.assignment}</td>
                    <td>${s.midterm}</td>
                    <td>${s.endSem}</td>
                    <td><b>${s.total}/100</b></td>
                    <td><span class="badge badge-active">${s.grade} (${s.gradePoints})</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `).join('')}
      `;
    } catch (err) {
      container.innerHTML = `<div style="color:var(--danger); padding:20px;">${err.message}</div>`;
    }
  }
};
