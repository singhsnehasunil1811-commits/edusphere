// STUDENT360 — Admin User Management Module
const Users = {
  list: [],

  async init() {
    if (!Auth.isAdmin()) return;
    await this.loadUsers();
  },

  async loadUsers() {
    const roleFilter = document.getElementById('user-filter-role')?.value || '';
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:24px;">Loading users...</td></tr>';

    try {
      const url = roleFilter ? `/users?role=${roleFilter}` : '/users';
      this.list = await API.get(url) || [];
      this.renderTable(this.list);
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--danger); padding:24px;">${err.message}</td></tr>`;
    }
  },

  renderTable(items) {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;

    if (items.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:24px; color:var(--text-muted);">No users found.</td></tr>';
      return;
    }

    tbody.innerHTML = items.map(u => `
      <tr>
        <td>#${u.id}</td>
        <td><b>${u.fullName}</b></td>
        <td>${u.email}</td>
        <td><span class="badge badge-role-${u.role.toLowerCase()}">${u.role}</span></td>
        <td><span class="badge ${u.enabled ? 'badge-active' : 'badge-inactive'}">${u.enabled ? 'ACTIVE' : 'DISABLED'}</span></td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-sm btn-secondary" onclick="Users.openResetModal(${u.id}, '${u.email}')">🔑 Reset Pwd</button>
            <button class="btn btn-sm ${u.enabled ? 'btn-danger' : 'btn-primary'}" onclick="Users.toggleStatus(${u.id}, ${u.enabled})">
              ${u.enabled ? 'Disable' : 'Enable'}
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  openAddModal() {
    document.getElementById('user-form').reset();
    document.getElementById('user-form-modal').classList.add('active');
  },

  async saveUser(event) {
    event.preventDefault();
    const body = {
      fullName: document.getElementById('user-name-input').value.trim(),
      email: document.getElementById('user-email-input').value.trim(),
      password: document.getElementById('user-password-input').value,
      role: document.getElementById('user-role-input').value
    };

    try {
      await API.post('/users', body);
      API.toast('New user created successfully!', 'success');
      document.getElementById('user-form-modal').classList.remove('active');
      await this.loadUsers();
    } catch (err) {
      API.toast(err.message, 'error');
    }
  },

  openResetModal(id, email) {
    document.getElementById('reset-user-id').value = id;
    document.getElementById('reset-user-email').textContent = email;
    document.getElementById('reset-new-password').value = '';
    document.getElementById('user-reset-modal').classList.add('active');
  },

  async submitResetPassword(event) {
    event.preventDefault();
    const id = document.getElementById('reset-user-id').value;
    const newPassword = document.getElementById('reset-new-password').value;

    try {
      await API.put(`/users/${id}/reset-password`, { newPassword });
      API.toast('Password reset successfully!', 'success');
      document.getElementById('user-reset-modal').classList.remove('active');
    } catch (err) {
      API.toast(err.message, 'error');
    }
  },

  async toggleStatus(id, currentlyEnabled) {
    try {
      if (currentlyEnabled) {
        await API.put(`/users/${id}/disable`, {});
        API.toast('User disabled', 'warning');
      } else {
        await API.put(`/users/${id}/enable`, {});
        API.toast('User enabled', 'success');
      }
      await this.loadUsers();
    } catch (err) {
      API.toast(err.message, 'error');
    }
  }
};
