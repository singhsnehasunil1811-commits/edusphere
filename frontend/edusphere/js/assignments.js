// STUDENT360 — Assignments & Submissions Module
const Assignments = {
  list: [],
  subjects: [],

  async init() {
    await this.loadSubjects();
    await this.loadAssignments();
  },

  async loadSubjects() {
    try {
      this.subjects = await API.get('/subjects') || [];
      const sel = document.getElementById('assignment-form-subject');
      if (sel) {
        sel.innerHTML = '<option value="">Select Subject *</option>' +
          this.subjects.map(s => `<option value="${s.id}">${s.code} - ${s.name}</option>`).join('');
      }
    } catch (e) {
      console.error('Error loading subjects:', e);
    }
  },

  async loadAssignments() {
    const container = document.getElementById('assignments-cards-grid');
    if (!container) return;

    container.innerHTML = '<div style="color:var(--text-muted); padding:20px;">Loading assignments...</div>';

    try {
      this.list = await API.get('/assignments') || [];
      this.renderCards(this.list);
    } catch (err) {
      container.innerHTML = `<div style="color:var(--danger); padding:20px;">${err.message}</div>`;
    }
  },

  renderCards(items) {
    const container = document.getElementById('assignments-cards-grid');
    if (!container) return;

    if (items.length === 0) {
      container.innerHTML = '<div style="color:var(--text-muted); padding:20px;">No assignments posted yet.</div>';
      return;
    }

    const isStudent = Auth.isStudent();
    const canCreate = Auth.isAdmin() || Auth.isTeacher();

    container.innerHTML = items.map(a => {
      const isPast = new Date(a.deadline) < new Date();
      return `
        <div class="glass tilt-card" style="padding:22px; display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
              <span class="badge badge-info">${a.subjectName || 'Subject'}</span>
              <span class="badge ${isPast ? 'badge-absent' : 'badge-warning'}">Due: ${a.deadline}</span>
            </div>
            <h3 style="font-size:1.1rem; margin-bottom:8px;">${a.title}</h3>
            <p style="font-size:0.86rem; color:var(--text-muted); margin-bottom:16px;">${a.description}</p>
          </div>
          <div>
            <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:12px; display:flex; justify-content:space-between;">
              <span>Max Marks: <b>${a.maxMarks}</b></span>
              <span>By: ${a.teacherName || 'Faculty'}</span>
            </div>
            ${isStudent ? `
              <button class="btn btn-primary btn-sm" style="width:100%;" onclick="Assignments.openSubmitModal(${a.id}, '${a.title.replace(/'/g, "\\'")}')">
                📤 Submit Assignment
              </button>
            ` : ''}
            ${canCreate ? `
              <div style="display:flex; gap:8px;">
                <button class="btn btn-secondary btn-sm" style="flex:1;" onclick="Assignments.viewSubmissions(${a.id})">Submissions</button>
                <button class="btn btn-danger btn-sm" onclick="Assignments.deleteAssignment(${a.id})">🗑</button>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    Dashboard.init3DTilt();
  },

  openAddModal() {
    document.getElementById('assignment-form').reset();
    document.getElementById('assignment-form-modal').classList.add('active');
  },

  async saveAssignment(event) {
    event.preventDefault();
    const body = {
      title: document.getElementById('assignment-title-input').value.trim(),
      description: document.getElementById('assignment-desc-input').value.trim(),
      subjectId: Number(document.getElementById('assignment-form-subject').value),
      deadline: document.getElementById('assignment-deadline-input').value,
      maxMarks: Number(document.getElementById('assignment-marks-input').value),
      teacherId: 1 // default faculty
    };

    try {
      await API.post('/assignments', body);
      API.toast('Assignment posted successfully!', 'success');
      document.getElementById('assignment-form-modal').classList.remove('active');
      await this.loadAssignments();
    } catch (err) {
      API.toast(err.message, 'error');
    }
  },

  openSubmitModal(assignmentId, title) {
    document.getElementById('submit-assign-id').value = assignmentId;
    document.getElementById('submit-assign-title').textContent = title;
    document.getElementById('assignment-submit-modal').classList.add('active');
  },

  async submitAssignment(event) {
    event.preventDefault();
    const assignId = document.getElementById('submit-assign-id').value;
    try {
      await API.post(`/assignments/${assignId}/submit`, {});
      API.toast('Assignment submitted successfully!', 'success');
      document.getElementById('assignment-submit-modal').classList.remove('active');
    } catch (err) {
      API.toast(err.message, 'error');
    }
  },

  async viewSubmissions(assignId) {
    try {
      const subs = await API.get(`/assignments/${assignId}/submissions`) || [];
      const tbody = document.getElementById('submissions-table-body');
      if (tbody) {
        if (subs.length === 0) {
          tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px; color:var(--text-muted);">No submissions received yet.</td></tr>';
        } else {
          tbody.innerHTML = subs.map(s => `
            <tr>
              <td>${s.studentName}</td>
              <td>${s.assignmentTitle}</td>
              <td>${s.submittedAt ? s.submittedAt.replace('T', ' ').substring(0, 16) : '-'}</td>
              <td><span class="badge badge-${s.status.toLowerCase()}">${s.status}</span></td>
            </tr>
          `).join('');
        }
      }
      document.getElementById('submissions-modal').classList.add('active');
    } catch (err) {
      API.toast(err.message, 'error');
    }
  },

  async deleteAssignment(id) {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await API.delete(`/assignments/${id}`);
      API.toast('Assignment deleted', 'success');
      await this.loadAssignments();
    } catch (err) {
      API.toast(err.message, 'error');
    }
  }
};
