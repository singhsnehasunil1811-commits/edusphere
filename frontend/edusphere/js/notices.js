// STUDENT360 — Notices & Circulars Module
const Notices = {
  list: [],

  async init() {
    await this.loadNotices();
  },

  async loadNotices() {
    const container = document.getElementById('notices-cards-container');
    if (!container) return;

    container.innerHTML = '<div style="color:var(--text-muted); padding:20px;">Loading notices...</div>';

    try {
      this.list = await API.get('/notices') || [];
      this.renderNotices(this.list);
    } catch (err) {
      container.innerHTML = `<div style="color:var(--danger); padding:20px;">${err.message}</div>`;
    }
  },

  renderNotices(items) {
    const container = document.getElementById('notices-cards-container');
    if (!container) return;

    if (items.length === 0) {
      container.innerHTML = '<div style="color:var(--text-muted); padding:20px;">No official notices at this time.</div>';
      return;
    }

    const canManage = Auth.isAdmin() || Auth.isTeacher();

    container.innerHTML = items.map(n => {
      const pColor = n.priority === 'URGENT' ? '#ef4444' : (n.priority === 'IMPORTANT' ? '#f59e0b' : '#06b6d4');
      return `
        <div class="glass tilt-card" style="padding:22px; margin-bottom:18px; border-left:5px solid ${pColor};">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="badge badge-${n.priority.toLowerCase()}">${n.priority}</span>
              <span class="badge badge-info">Audience: ${n.targetAudience}</span>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:0.8rem; color:var(--text-muted);">📅 ${n.date}</span>
              ${canManage ? `
                <button class="btn btn-sm btn-danger btn-icon" onclick="Notices.deleteNotice(${n.id})" title="Delete">✕</button>
              ` : ''}
            </div>
          </div>
          <h3 style="font-size:1.15rem; margin-bottom:8px;">${n.title}</h3>
          <p style="font-size:0.92rem; color:var(--text); line-height:1.6; white-space:pre-line;">${n.content}</p>
          <div style="font-size:0.75rem; color:var(--text-muted); margin-top:12px;">
            Published by: <b>${n.createdByName || 'Administration'}</b>
          </div>
        </div>
      `;
    }).join('');

    Dashboard.init3DTilt();
  },

  openAddModal() {
    document.getElementById('notice-form').reset();
    document.getElementById('notice-form-modal').classList.add('active');
  },

  async saveNotice(event) {
    event.preventDefault();
    const body = {
      title: document.getElementById('notice-title-input').value.trim(),
      content: document.getElementById('notice-content-input').value.trim(),
      priority: document.getElementById('notice-priority-input').value,
      targetAudience: document.getElementById('notice-audience-input').value
    };

    try {
      await API.post('/notices', body);
      API.toast('Notice published successfully!', 'success');
      document.getElementById('notice-form-modal').classList.remove('active');
      await this.loadNotices();
      Dashboard.loadStats();
    } catch (err) {
      API.toast(err.message, 'error');
    }
  },

  async deleteNotice(id) {
    if (!confirm('Are you sure you want to delete this notice?')) return;
    try {
      await API.delete(`/notices/${id}`);
      API.toast('Notice deleted', 'success');
      await this.loadNotices();
      Dashboard.loadStats();
    } catch (err) {
      API.toast(err.message, 'error');
    }
  }
};
