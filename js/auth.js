/*
  auth.js — Acadrix Authentication & Session Manager
  Supports: Admin, Faculty, Student roles
  Features: Login, Logout, Remember Me, Approval Status, Email Verification
*/

const auth = {

  /* ─── Credentials (demo / mock) ─────────────────────────── */
  _credentials: [
    // Built-in demo accounts
    { username: 'admin@college.edu.in', email: 'admin@college.edu.in', password: 'admin123', role: 'Admin',    name: 'Dr. Administrator',  status: 'approved' },
    { username: 'admin@college.edu',    email: 'admin@college.edu',    password: 'admin123', role: 'Admin',    name: 'Dr. Administrator',  status: 'approved' },
    { username: 'admin',                email: 'admin@college.edu.in', password: 'admin123', role: 'Admin',    name: 'Dr. Administrator',  status: 'approved' },
    { username: 'faculty@college.edu.in', email: 'faculty@college.edu.in', password: 'admin123', role: 'Faculty', name: 'Prof. Sunita Patel', status: 'approved' },
    { username: 'faculty@college.edu',  email: 'faculty@college.edu',  password: 'admin123', role: 'Faculty', name: 'Prof. Sunita Patel', status: 'approved' },
    { username: 'faculty',              email: 'faculty@college.edu.in', password: 'admin123', role: 'Faculty', name: 'Prof. Sunita Patel', status: 'approved' },
    { username: 'student@college.edu.in', email: 'student@college.edu.in', password: 'admin123', role: 'Student', name: 'Aarav Sharma', status: 'approved' },
    { username: 'student@college.edu',  email: 'student@college.edu',  password: 'admin123', role: 'Student', name: 'Aarav Sharma',        status: 'approved' },
    { username: 'student',              email: 'student@college.edu.in', password: 'admin123', role: 'Student', name: 'Aarav Sharma',      status: 'approved' },
    // Additional faculty
    { username: 'rajesh.kumar@college.edu', email: 'rajesh.kumar@college.edu', password: 'admin123', role: 'Faculty', name: 'Dr. Rajesh Kumar',    status: 'approved' },
    { username: 'sunita.patel@college.edu', email: 'sunita.patel@college.edu', password: 'admin123', role: 'Faculty', name: 'Prof. Sunita Patel',  status: 'approved' },
    // Additional students
    { username: 'aarav.sharma@student.edu',  email: 'aarav.sharma@student.edu',  password: 'student123', role: 'Student', name: 'Aarav Sharma',  status: 'approved' },
    { username: 'ananya.v@student.edu',      email: 'ananya.v@student.edu',      password: 'student123', role: 'Student', name: 'Ananya Verma',  status: 'approved' },
    { username: 'rohan.g@student.edu',       email: 'rohan.g@student.edu',       password: 'student123', role: 'Student', name: 'Rohan Gupta',   status: 'approved' },
  ],

  /* ─── Login ──────────────────────────────────────────────── */
  async login(username, password, role) {
    try {
      // Attempt real API first (will fail gracefully in demo)
      const response = await api.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password, role })
      });
      if (response.token) {
        this._saveSession(response.user, response.token);
        return { success: true, user: response.user };
      }
    } catch (_) {
      // Fall through to local mock auth
    }

    return this._localLogin(username, password, role);
  },

  /* ─── Local / Mock Auth ──────────────────────────────────── */
  _localLogin(username, password, role) {
    const u = username.trim().toLowerCase();
    const p = password.trim();

    // Check built-in accounts first by username/email
    let userRecord = this._credentials.find(c => c.username.toLowerCase() === u || c.email.toLowerCase() === u);
    let isCustom = false;

    // If not found in built-in, check custom users
    if (!userRecord) {
      const customUsers = JSON.parse(localStorage.getItem('edu_custom_users') || '[]');
      userRecord = customUsers.find(c => c.email.toLowerCase() === u);
      isCustom = true;
    }

    if (!userRecord) {
      return { success: false, message: 'Invalid email/username or password. Please try again.' };
    }

    // Now check role
    if (userRecord.role !== role) {
      return { success: false, message: `This email is registered as a ${userRecord.role}. Please select the "${userRecord.role}" role tab to log in.` };
    }

    // Now check password
    if (userRecord.password !== p) {
      return { success: false, message: 'Invalid email/username or password. Please try again.' };
    }

    // Check status
    if (userRecord.status === 'pending' || !userRecord.status) {
      return { success: false, pending: true, message: 'Your account is pending admin approval. Please check your email.' };
    }
    if (userRecord.status === 'suspended') {
      return { success: false, message: 'Your account has been suspended. Please contact admin.' };
    }

    const user = { 
      name: userRecord.name, 
      email: userRecord.email, 
      role: userRecord.role, 
      username: userRecord.username || userRecord.email, 
      status: userRecord.status,
      studentId: userRecord.studentId || (userRecord.role === 'Student' ? 'STU-1001' : undefined),
      department: userRecord.department || (userRecord.role === 'Student' ? 'Computer Science & Engineering' : undefined),
      semester: userRecord.semester || (userRecord.role === 'Student' ? 5 : undefined),
      year: userRecord.year || (userRecord.role === 'Student' ? '3rd Year' : undefined)
    };
    this._saveSession(user, (isCustom ? 'custom-token-' : 'demo-token-') + Date.now());
    return { success: true, user };
  },

  /* ─── Session Helpers ────────────────────────────────────── */
  _saveSession(user, token) {
    localStorage.setItem('edu_user', JSON.stringify(user));
    localStorage.setItem('edu_token', token);
  },

  logout() {
    localStorage.removeItem('edu_user');
    localStorage.removeItem('edu_token');
    // Navigate up if in /pages/
    const path = window.location.pathname;
    window.location.href = path.includes('/pages/') ? '../login.html' : 'login.html';
  },

  getCurrentUser() {
    try {
      const u = JSON.parse(localStorage.getItem('edu_user') || 'null');
      if (u && u.role === 'Student' && !u.studentId) {
        const students = JSON.parse(localStorage.getItem('edu_students') || '[]');
        const match = students.find(s =>
          (s.email && u.email && s.email.toLowerCase() === u.email.toLowerCase()) ||
          (s.name && u.name && s.name.toLowerCase() === u.name.toLowerCase())
        );
        u.studentId = match ? match.studentId : 'STU-1001';
        u.department = u.department || (match ? match.department : 'Computer Science & Engineering');
        u.semester = u.semester || (match ? match.semester : 5);
        u.year = u.year || (match ? match.year : '3rd Year');
        localStorage.setItem('edu_user', JSON.stringify(u));
      }
      return u;
    } catch { return null; }
  },

  isLoggedIn() {
    return !!(localStorage.getItem('edu_user') && localStorage.getItem('edu_token'));
  },

  getCurrentRole() {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  },

  isStudent() {
    const user = this.getCurrentUser();
    return !!(user && user.role === 'Student');
  },

  isFacultyOrAdmin() {
    const user = this.getCurrentUser();
    return !!(user && (user.role === 'Faculty' || user.role === 'Admin'));
  },

  requireAuth() {
    if (!this.isLoggedIn()) {
      const path = window.location.pathname;
      window.location.href = path.includes('/pages/') ? '../login.html' : 'login.html';
    }
  },

  requireRole(allowedRoles) {
    this.requireAuth();
    const role = this.getCurrentRole();
    if (role && !allowedRoles.includes(role)) {
      this.logout();
    }
  },

  /* ─── Admin: Approve / Reject Users ─────────────────────── */
  getPendingUsers() {
    const users = JSON.parse(localStorage.getItem('edu_custom_users') || '[]');
    return users.filter(u => !u.status || u.status === 'pending');
  },

  approveUser(email) {
    const users = JSON.parse(localStorage.getItem('edu_custom_users') || '[]');
    const idx = users.findIndex(u => u.email === email);
    if (idx !== -1) { users[idx].status = 'approved'; localStorage.setItem('edu_custom_users', JSON.stringify(users)); return true; }
    return false;
  },

  rejectUser(email) {
    const users = JSON.parse(localStorage.getItem('edu_custom_users') || '[]');
    const idx = users.findIndex(u => u.email === email);
    if (idx !== -1) { users[idx].status = 'rejected'; localStorage.setItem('edu_custom_users', JSON.stringify(users)); return true; }
    return false;
  }
};
