// STUDENT360 — Attendance Tracking & Bulk Marker Module
const Attendance = {
  subjects: [],
  selectedSubject: null,
  roster: [],

  async init() {
    await this.loadSubjects();
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('attendance-date');
    if (dateInput) dateInput.value = today;

    if (Auth.isStudent()) {
      await this.loadMyAttendance();
    } else {
      await this.loadClassRoster();
    }
  },

  async loadSubjects() {
    try {
      this.subjects = await API.get('/subjects') || [];
      const sel = document.getElementById('attendance-subject-select');
      if (sel) {
        sel.innerHTML = this.subjects.map(s => `
          <option value="${s.id}">${s.code} - ${s.name} (Sem ${s.semester})</option>
        `).join('');
      }
    } catch (e) {
      console.error('Subjects load error:', e);
    }
  },

  async loadClassRoster() {
    const subId = document.getElementById('attendance-subject-select')?.value;
    const date = document.getElementById('attendance-date')?.value || new Date().toISOString().split('T')[0];
    if (!subId) return;

    const sub = this.subjects.find(s => s.id == subId);
    this.selectedSubject = sub;

    const tbody = document.getElementById('attendance-roster-body');
    if (tbody) tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:24px;">Loading class roster...</td></tr>';

    try {
      // Fetch students in this course / semester
      let students = [];
      if (sub && sub.courseId) {
        students = await API.get(`/students?courseId=${sub.courseId}&semester=${sub.semester}`);
        if (!students || students.length === 0) {
          students = await API.get(`/students?courseId=${sub.courseId}`);
        }
      }
      if (!students || students.length === 0) {
        students = await API.get('/students');
      }

      // Check existing attendance for this date
      const existing = await API.get(`/attendance/subject/${subId}?date=${date}`) || [];
      const statusMap = {};
      existing.forEach(r => statusMap[r.studentId] = r.status);

      this.roster = students;
      this.renderRoster(students, statusMap);
    } catch (err) {
      if (tbody) tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--danger); padding:24px;">${err.message}</td></tr>`;
    }
  },

  renderRoster(students, statusMap) {
    const tbody = document.getElementById('attendance-roster-body');
    if (!tbody) return;

    if (students.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:24px; color:var(--text-muted);">No enrolled students found for this class.</td></tr>';
      return;
    }

    tbody.innerHTML = students.map((s, idx) => {
      const currentStatus = statusMap[s.id] || 'PRESENT';
      return `
        <tr>
          <td>${idx + 1}</td>
          <td><b>${s.rollNumber}</b></td>
          <td>${s.firstName} ${s.lastName}</td>
          <td>
            <div style="display:flex; gap:16px; align-items:center;">
              <label style="cursor:pointer; display:flex; align-items:center; gap:6px;">
                <input type="radio" name="att_status_${s.id}" value="PRESENT" ${currentStatus === 'PRESENT' ? 'checked' : ''}>
                <span class="badge badge-present">PRESENT</span>
              </label>
              <label style="cursor:pointer; display:flex; align-items:center; gap:6px;">
                <input type="radio" name="att_status_${s.id}" value="ABSENT" ${currentStatus === 'ABSENT' ? 'checked' : ''}>
                <span class="badge badge-absent">ABSENT</span>
              </label>
              <input type="text" id="att_rem_${s.id}" placeholder="Remarks" style="padding:4px 8px; font-size:0.8rem; width:130px; background:rgba(255,255,255,0.05); border:1px solid var(--border); border-radius:6px; color:var(--text);">
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  markAll(status) {
    this.roster.forEach(s => {
      const radio = document.querySelector(`input[name="att_status_${s.id}"][value="${status}"]`);
      if (radio) radio.checked = true;
    });
  },

  async saveBulkAttendance() {
    const subId = document.getElementById('attendance-subject-select')?.value;
    const date = document.getElementById('attendance-date')?.value;

    if (!subId || !date) {
      API.toast('Please select subject and date', 'warning');
      return;
    }

    const entries = this.roster.map(s => {
      const radio = document.querySelector(`input[name="att_status_${s.id}"]:checked`);
      const status = radio ? radio.value : 'PRESENT';
      const remarks = document.getElementById(`att_rem_${s.id}`)?.value || '';
      return {
        studentId: s.id,
        status: status,
        remarks: remarks
      };
    });

    try {
      await API.post('/attendance/bulk', {
        subjectId: Number(subId),
        date: date,
        entries: entries
      });
      API.toast(`Attendance successfully saved for ${entries.length} students!`, 'success');
      Dashboard.loadStats();
    } catch (err) {
      API.toast(err.message, 'error');
    }
  },

  async loadMyAttendance() {
    const container = document.getElementById('my-attendance-summary');
    if (!container) return;

    try {
      const sum = await API.get('/attendance/my-summary');
      this.renderStudentSummary(sum, container);
    } catch (err) {
      container.innerHTML = `<div style="color:var(--danger); padding:20px;">${err.message}</div>`;
    }
  },

  renderStudentSummary(sum, container) {
    const statusColor = sum.belowThreshold ? '#ef4444' : '#10b981';
    container.innerHTML = `
      <div class="stats-grid" style="margin-bottom:20px;">
        <div class="stat-card glass">
          <div class="stat-content">
            <div class="stat-number" style="color:${statusColor}">${sum.overallPercentage}%</div>
            <div class="stat-label">Overall Attendance ${sum.belowThreshold ? '(BELOW 75% THRESHOLD)' : '(GOOD STANDING)'}</div>
          </div>
        </div>
        <div class="stat-card glass">
          <div class="stat-content">
            <div class="stat-number">${sum.attendedClasses} / ${sum.totalClasses}</div>
            <div class="stat-label">Attended / Total Lectures</div>
          </div>
        </div>
      </div>

      <div class="glass" style="padding:20px; margin-bottom:20px;">
        <h3 style="margin-bottom:14px;">Subject-wise Attendance</h3>
        <table class="data-table">
          <thead><tr><th>Subject</th><th>Attended</th><th>Total</th><th>Percentage</th><th>Status</th></tr></thead>
          <tbody>
            ${(sum.subjectSummaries || []).map(s => `
              <tr>
                <td><b>${s.subjectCode}</b> - ${s.subjectName}</td>
                <td>${s.attended}</td>
                <td>${s.total}</td>
                <td><b>${s.percentage}%</b></td>
                <td><span class="badge ${s.belowThreshold ? 'badge-absent' : 'badge-present'}">${s.belowThreshold ? 'BELOW 75%' : 'NORMAL'}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
};
