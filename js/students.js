// STUDENT360 — Students Management & Profile Module
const Students = {
  departments: [],
  courses: [],
  currentPage: 0,
  pageSize: 10,
  currentSort: 'id',
  currentSortDir: 'asc',
  selectedStudent: null,

  async init() {
    await this.loadMetadata();
    await this.loadStudents();
  },

  async loadMetadata() {
    try {
      this.departments = await API.get('/departments') || [];
      this.courses = await API.get('/courses') || [];
      this.populateDropdowns();
    } catch (e) {
      console.error('Metadata load error:', e);
    }
  },

  populateDropdowns() {
    const deptSelect = document.getElementById('student-filter-dept');
    const formDeptSelect = document.getElementById('student-form-dept');
    const courseSelect = document.getElementById('student-filter-course');
    const formCourseSelect = document.getElementById('student-form-course');

    const deptOptions = '<option value="">All Departments</option>' +
      this.departments.map(d => `<option value="${d.id}">${d.name} (${d.code || ''})</option>`).join('');

    const formDeptOptions = '<option value="">Select Department *</option>' +
      this.departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('');

    const courseOptions = '<option value="">All Courses</option>' +
      this.courses.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

    const formCourseOptions = '<option value="">Select Course</option>' +
      this.courses.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

    if (deptSelect) deptSelect.innerHTML = deptOptions;
    if (formDeptSelect) formDeptSelect.innerHTML = formDeptOptions;
    if (courseSelect) courseSelect.innerHTML = courseOptions;
    if (formCourseSelect) formCourseSelect.innerHTML = formCourseOptions;
  },

  async loadStudents(page = 0) {
    this.currentPage = page;
    const q = document.getElementById('student-search')?.value || '';
    const deptId = document.getElementById('student-filter-dept')?.value || '';
    const courseId = document.getElementById('student-filter-course')?.value || '';
    const sem = document.getElementById('student-filter-sem')?.value || '';
    const year = document.getElementById('student-filter-year')?.value || '';
    const status = document.getElementById('student-filter-status')?.value || '';

    let url = `/students/paged?page=${page}&size=${this.pageSize}&sortBy=${this.currentSort}&sortDir=${this.currentSortDir}`;
    if (q) url += `&q=${encodeURIComponent(q)}`;
    if (deptId) url += `&departmentId=${deptId}`;
    if (courseId) url += `&courseId=${courseId}`;
    if (sem) url += `&semester=${sem}`;
    if (year) url += `&year=${year}`;
    if (status) url += `&status=${status}`;

    const tbody = document.getElementById('students-table-body');
    if (tbody) tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:30px;">Loading students...</td></tr>';

    try {
      const data = await API.get(url);
      this.renderTable(data);
      this.renderPagination(data);
    } catch (err) {
      if (tbody) tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--danger); padding:30px;">${err.message}</td></tr>`;
    }
  },

  renderTable(pagedData) {
    const tbody = document.getElementById('students-table-body');
    if (!tbody) return;

    if (!pagedData.content || pagedData.content.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:30px; color:var(--text-muted);">No student records found matching criteria.</td></tr>';
      return;
    }

    const isAdmin = Auth.isAdmin();

    tbody.innerHTML = pagedData.content.map(s => `
      <tr>
        <td><b>${s.rollNumber}</b><br><small style="color:var(--text-muted)">${s.studentCode}</small></td>
        <td>
          <a href="javascript:void(0)" onclick="Students.viewProfile(${s.id})" style="font-weight:600; color:var(--text); text-decoration:none;">
            ${s.firstName} ${s.lastName}
          </a>
          <br><small style="color:var(--text-muted)">${s.email}</small>
        </td>
        <td>${s.departmentName || '-'}</td>
        <td>${s.courseName ? s.courseName.replace('B.Tech ', '') : '-'}</td>
        <td>Yr ${s.year} / Sem ${s.semester}</td>
        <td><span class="badge badge-${s.status.toLowerCase()}">${s.status}</span></td>
        <td style="text-align:right;">
          <div style="display:inline-flex; gap:6px;">
            <button class="btn btn-sm btn-secondary" onclick="Students.viewProfile(${s.id})" title="View Profile">👁</button>
            <button class="btn btn-sm btn-secondary" onclick="window.open('/api/advanced/transcript/pdf/${s.id}', '_blank')" title="Download PDF Transcript">📄</button>
            ${isAdmin ? `
              <button class="btn btn-sm btn-secondary" onclick="Students.openEditModal(${s.id})" title="Edit">✏</button>
              <button class="btn btn-sm btn-danger" onclick="Students.deleteStudent(${s.id})" title="Delete">🗑</button>
            ` : ''}
          </div>
        </td>
      </tr>
    `).join('');
  },

  renderPagination(pagedData) {
    const infoEl = document.getElementById('students-page-info');
    const controlsEl = document.getElementById('students-page-controls');
    if (!infoEl || !controlsEl) return;

    const start = pagedData.totalElements === 0 ? 0 : pagedData.pageNumber * pagedData.pageSize + 1;
    const end = Math.min((pagedData.pageNumber + 1) * pagedData.pageSize, pagedData.totalElements);
    infoEl.textContent = `Showing ${start} to ${end} of ${pagedData.totalElements} records`;

    let html = '';
    html += `<button class="btn btn-sm btn-secondary" ${pagedData.isFirst ? 'disabled' : ''} onclick="Students.loadStudents(${pagedData.pageNumber - 1})">Prev</button>`;

    for (let p = 0; p < pagedData.totalPages; p++) {
      if (p === 0 || p === pagedData.totalPages - 1 || Math.abs(p - pagedData.pageNumber) <= 1) {
        html += `<button class="btn btn-sm ${p === pagedData.pageNumber ? 'btn-primary' : 'btn-secondary'}" onclick="Students.loadStudents(${p})">${p + 1}</button>`;
      } else if (Math.abs(p - pagedData.pageNumber) === 2) {
        html += `<span style="padding:0 4px; color:var(--text-muted)">...</span>`;
      }
    }

    html += `<button class="btn btn-sm btn-secondary" ${pagedData.isLast ? 'disabled' : ''} onclick="Students.loadStudents(${pagedData.pageNumber + 1})">Next</button>`;
    controlsEl.innerHTML = html;
  },

  async viewProfile(studentId) {
    try {
      const p = await API.get(`/students/${studentId}/profile`);
      this.selectedStudent = p;
      this.renderProfileModal(p);
    } catch (err) {
      API.toast(err.message, 'error');
    }
  },

  renderProfileModal(p) {
    const modal = document.getElementById('student-profile-modal');
    if (!modal) return;

    document.getElementById('modal-prof-name').textContent = `${p.firstName} ${p.lastName}`;
    document.getElementById('modal-prof-roll').textContent = `${p.rollNumber} · ${p.studentCode}`;
    document.getElementById('modal-prof-email').textContent = p.email;
    document.getElementById('modal-prof-phone').textContent = p.phone || 'N/A';
    document.getElementById('modal-prof-dept').textContent = p.departmentName;
    document.getElementById('modal-prof-course').textContent = p.courseName || 'N/A';
    document.getElementById('modal-prof-yearsem').textContent = `Year ${p.year} · Semester ${p.semester}`;
    document.getElementById('modal-prof-admission').textContent = p.admissionDate || 'N/A';

    const pdfBtn = document.getElementById('modal-prof-pdf-btn');
    if (pdfBtn) {
      pdfBtn.onclick = () => window.open(`/api/advanced/transcript/pdf/${p.id}`, '_blank');
    }

    // Metrics
    const attEl = document.getElementById('modal-prof-att');
    if (attEl) {
      attEl.textContent = `${p.attendancePercentage}%`;
      attEl.style.color = p.belowAttendanceThreshold ? '#ef4444' : '#10b981';
    }

    const marksEl = document.getElementById('modal-prof-marks');
    if (marksEl) marksEl.textContent = `${p.averageMarks}%`;

    const cgpaEl = document.getElementById('modal-prof-cgpa');
    if (cgpaEl) cgpaEl.textContent = `${p.cgpa} / 10.0`;

    const feeEl = document.getElementById('modal-prof-fee');
    if (feeEl) {
      feeEl.textContent = p.feeStatus;
      feeEl.className = `badge badge-${p.feeStatus.toLowerCase().replace('_', '-')}`;
    }

    // Marks table
    const marksTbody = document.getElementById('modal-prof-marks-body');
    if (marksTbody) {
      if (!p.recentMarks || p.recentMarks.length === 0) {
        marksTbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">No marks recorded</td></tr>';
      } else {
        marksTbody.innerHTML = p.recentMarks.map(m => `
          <tr>
            <td><b>${m.subjectCode}</b><br><small>${m.subjectName}</small></td>
            <td>${m.internal}/20</td>
            <td>${m.assignment}/20</td>
            <td>${m.endSem}/30</td>
            <td><b>${m.total}/100</b> · <span class="badge badge-active">${m.grade}</span></td>
          </tr>
        `).join('');
      }
    }

    // Activity timeline
    const actContainer = document.getElementById('modal-prof-activity');
    if (actContainer) {
      if (!p.recentActivity || p.recentActivity.length === 0) {
        actContainer.innerHTML = '<div style="color:var(--text-muted)">No recent activity</div>';
      } else {
        actContainer.innerHTML = p.recentActivity.map(a => `
          <div style="padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.05); font-size:0.85rem;">
            <span class="badge badge-info" style="margin-right:6px;">${a.type}</span>
            <span>${a.description}</span>
          </div>
        `).join('');
      }
    }

    modal.classList.add('active');
  },

  openAddModal() {
    document.getElementById('student-modal-title').textContent = 'Add New Student';
    document.getElementById('student-form').reset();
    document.getElementById('student-id-input').value = '';
    document.getElementById('student-form-errors').innerHTML = '';
    document.getElementById('student-form-modal').classList.add('active');
  },

  async openEditModal(studentId) {
    try {
      const s = await API.get(`/students/${studentId}`);
      document.getElementById('student-modal-title').textContent = 'Edit Student';
      document.getElementById('student-id-input').value = s.id;
      document.getElementById('student-code-input').value = s.studentCode;
      document.getElementById('student-roll-input').value = s.rollNumber;
      document.getElementById('student-fn-input').value = s.firstName;
      document.getElementById('student-ln-input').value = s.lastName;
      document.getElementById('student-email-input').value = s.email;
      document.getElementById('student-phone-input').value = s.phone || '';
      document.getElementById('student-form-dept').value = s.departmentId || '';
      document.getElementById('student-form-course').value = s.courseId || '';
      document.getElementById('student-year-input').value = s.year;
      document.getElementById('student-sem-input').value = s.semester;
      document.getElementById('student-status-input').value = s.status;
      document.getElementById('student-form-errors').innerHTML = '';
      document.getElementById('student-form-modal').classList.add('active');
    } catch (e) {
      API.toast(e.message, 'error');
    }
  },

  async saveStudent(event) {
    event.preventDefault();
    const errContainer = document.getElementById('student-form-errors');
    errContainer.innerHTML = '';

    const id = document.getElementById('student-id-input').value;
    const body = {
      studentCode: document.getElementById('student-code-input').value.trim(),
      rollNumber: document.getElementById('student-roll-input').value.trim(),
      firstName: document.getElementById('student-fn-input').value.trim(),
      lastName: document.getElementById('student-ln-input').value.trim(),
      email: document.getElementById('student-email-input').value.trim(),
      phone: document.getElementById('student-phone-input').value.trim(),
      departmentId: Number(document.getElementById('student-form-dept').value),
      courseId: document.getElementById('student-form-course').value ? Number(document.getElementById('student-form-course').value) : null,
      year: Number(document.getElementById('student-year-input').value),
      semester: Number(document.getElementById('student-sem-input').value),
      status: document.getElementById('student-status-input').value
    };

    try {
      if (id) {
        await API.put(`/students/${id}`, body);
        API.toast('Student updated successfully!', 'success');
      } else {
        await API.post('/students', body);
        API.toast('Student registered successfully!', 'success');
      }
      document.getElementById('student-form-modal').classList.remove('active');
      await this.loadStudents(this.currentPage);
      Dashboard.loadStats();
    } catch (err) {
      if (err.errors) {
        errContainer.innerHTML = Object.entries(err.errors).map(([k, v]) => `<div>• ${v}</div>`).join('');
      } else {
        errContainer.innerHTML = `<div>• ${err.message}</div>`;
      }
    }
  },

  async deleteStudent(studentId) {
    if (!confirm('Are you sure you want to delete this student record? This action cannot be undone.')) {
      return;
    }
    try {
      await API.delete(`/students/${studentId}`);
      API.toast('Student deleted successfully', 'success');
      await this.loadStudents(this.currentPage);
      Dashboard.loadStats();
    } catch (err) {
      API.toast(err.message, 'error');
    }
  }
};
