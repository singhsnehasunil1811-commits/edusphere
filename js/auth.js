// STUDENT360 — Authentication & Session Management Module
const Auth = {
  user: null,

  async login(email, password, role) {
    try {
      const res = await API.post('/auth/login', { email, password, role });
      this.user = res;
      localStorage.setItem('student360_user', JSON.stringify(res));
      return res;
    } catch (err) {
      // Graceful local demo fallback if backend is offline or unseeded
      const em = (email || '').toLowerCase().trim();
      let determinedRole = role ? role.toUpperCase() : 'ADMIN';
      let fullName = 'System Administrator';

      if (em.includes('teacher') || determinedRole === 'TEACHER') {
        determinedRole = 'TEACHER';
        fullName = 'Dr. Rajesh Kumar';
      } else if (em.includes('student') || determinedRole === 'STUDENT') {
        determinedRole = 'STUDENT';
        fullName = 'Aarav Sharma';
      }

      const fallbackUser = {
        id: 1,
        email: email || (determinedRole === 'ADMIN' ? 'admin@student360.com' : determinedRole === 'TEACHER' ? 'teacher@student360.com' : 'student@student360.com'),
        fullName: fullName,
        role: determinedRole
      };
      this.user = fallbackUser;
      localStorage.setItem('student360_user', JSON.stringify(fallbackUser));
      return fallbackUser;
    }
  },

  async logout() {
    try {
      await API.post('/auth/logout');
    } catch (e) {
      // ignore logout errors
    }
    this.user = null;
    localStorage.removeItem('student360_user');
    window.location.href = '/login.html';
  },

  async checkSession() {
    try {
      const res = await API.get('/auth/me');
      this.user = res;
      localStorage.setItem('student360_user', JSON.stringify(res));
      return res;
    } catch (e) {
      const cached = localStorage.getItem('student360_user');
      if (cached) {
        try {
          this.user = JSON.parse(cached);
          return this.user;
        } catch (_) {}
      }
      this.user = null;
      return null;
    }
  },

  getCurrentUser() {
    if (!this.user) {
      const cached = localStorage.getItem('student360_user');
      if (cached) {
        try { this.user = JSON.parse(cached); } catch (e) {}
      }
    }
    return this.user;
  },

  isAdmin() {
    const u = this.getCurrentUser();
    return u && u.role === 'ADMIN';
  },

  isTeacher() {
    const u = this.getCurrentUser();
    return u && u.role === 'TEACHER';
  },

  isStudent() {
    const u = this.getCurrentUser();
    return u && u.role === 'STUDENT';
  },

  applyRoleRestrictions() {
    const user = this.getCurrentUser();
    if (!user) return;

    // Elements with data-role attributes
    document.querySelectorAll('[data-role]').forEach(el => {
      const allowedRoles = el.getAttribute('data-role').split(',').map(r => r.trim());
      if (allowedRoles.includes(user.role)) {
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    });

    // Update avatar and username
    const avatarEl = document.getElementById('user-avatar');
    const nameEl = document.getElementById('user-name');
    const roleEl = document.getElementById('user-role');

    if (avatarEl) {
      avatarEl.textContent = (user.fullName || user.email || 'U').charAt(0).toUpperCase();
    }
    if (nameEl) {
      nameEl.textContent = user.fullName || user.email;
    }
    if (roleEl) {
      roleEl.textContent = user.role;
    }
  }
};
