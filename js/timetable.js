// STUDENT360 — Timetable & Weekly Schedule Module
const Timetable = {
  slots: [],
  subjects: [],
  teachers: [],

  async init() {
    await this.loadMetadata();
    await this.loadSchedule();
  },

  async loadMetadata() {
    try {
      this.subjects = await API.get('/subjects') || [];
      this.teachers = await API.get('/teachers') || [];

      const subSel = document.getElementById('tt-form-subject');
      const tchSel = document.getElementById('tt-form-teacher');

      if (subSel) {
        subSel.innerHTML = '<option value="">Select Subject *</option>' +
          this.subjects.map(s => `<option value="${s.id}">${s.code} - ${s.name}</option>`).join('');
      }
      if (tchSel) {
        tchSel.innerHTML = '<option value="">Select Faculty *</option>' +
          this.teachers.map(t => `<option value="${t.id}">${t.firstName} ${t.lastName} (${t.designation || 'Faculty'})</option>`).join('');
      }
    } catch (e) {
      console.error('Timetable metadata error:', e);
    }
  },

  async loadSchedule() {
    try {
      this.slots = await API.get('/timetable') || [];
      this.renderWeeklyGrid(this.slots);
    } catch (err) {
      console.error('Timetable load error:', err);
    }
  },

  renderWeeklyGrid(items) {
    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

    days.forEach(day => {
      const col = document.getElementById(`tt-col-${day.toLowerCase()}`);
      if (!col) return;

      const daySlots = items.filter(s => s.day === day)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

      if (daySlots.length === 0) {
        col.innerHTML = '<div style="color:var(--text-muted); font-size:0.8rem; text-align:center; padding:12px;">No lectures</div>';
        return;
      }

      const isAdmin = Auth.isAdmin();

      col.innerHTML = daySlots.map(s => `
        <div class="slot-card">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="slot-time">⏰ ${s.startTime.substring(0, 5)} - ${s.endTime.substring(0, 5)}</span>
            ${isAdmin ? `<button onclick="Timetable.deleteSlot(${s.id})" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:0.75rem;">✕</button>` : ''}
          </div>
          <div class="slot-subject">${s.subjectCode} · ${s.subjectName}</div>
          <div class="slot-meta">👤 ${s.teacherName}</div>
          <div class="slot-meta">📍 Room: <b>${s.room}</b></div>
        </div>
      `).join('');
    });
  },

  openAddModal() {
    document.getElementById('tt-form').reset();
    document.getElementById('tt-form-modal').classList.add('active');
  },

  async saveSlot(event) {
    event.preventDefault();
    const body = {
      day: document.getElementById('tt-day-input').value,
      startTime: document.getElementById('tt-start-input').value,
      endTime: document.getElementById('tt-end-input').value,
      subjectId: Number(document.getElementById('tt-form-subject').value),
      teacherId: Number(document.getElementById('tt-form-teacher').value),
      room: document.getElementById('tt-room-input').value.trim()
    };

    try {
      await API.post('/timetable', body);
      API.toast('Schedule slot added!', 'success');
      document.getElementById('tt-form-modal').classList.remove('active');
      await this.loadSchedule();
    } catch (err) {
      API.toast(err.message, 'error');
    }
  },

  async deleteSlot(id) {
    if (!confirm('Remove this timetable slot?')) return;
    try {
      await API.delete(`/timetable/${id}`);
      API.toast('Slot removed', 'success');
      await this.loadSchedule();
    } catch (err) {
      API.toast(err.message, 'error');
    }
  }
};
