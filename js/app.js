/* 
  Smart Campus — Student Management & Academic Intelligence System
  app.js: Layout Manager, Role-Based Navigation, Theme, Global Events
*/

// ── THEME: Apply immediately before render to prevent flash ──────────────────
(function() {
  const t = localStorage.getItem("edu_theme") || "light";
  document.documentElement.setAttribute("data-theme", t);
})();

document.addEventListener("DOMContentLoaded", () => {
  if (typeof auth === "undefined") return;
  auth.requireAuth();

  const user = auth.getCurrentUser();
  if (!user) { window.location.href = "../login.html"; return; }

  // RBAC Page Enforcement
  const pageId = document.body.getAttribute("data-page-id");
  if (user.role === 'Student') {
    const allowedPages = ['dashboard', 'courses', 'marks', 'attendance', 'examinations', 'profile', 'settings', 'homework'];
    if (pageId && !allowedPages.includes(pageId)) {
      window.location.href = "dashboard.html";
      return;
    }
  } else if (user.role === 'Faculty') {
    const restrictedPages = ['departments', 'faculty'];
    if (pageId && restrictedPages.includes(pageId)) {
      window.location.href = "dashboard.html";
      return;
    }
  }

  initTheme();
  renderSidebar();
  renderTopNavbar();
  highlightActiveNav();

  if (user.role === 'Student') {
    const adminBtns = document.querySelectorAll('#addStudentBtn, #scheduleExamBtn, #markAttendanceBtn, #addCourseBtn, #addMarksBtn, .admin-only, .faculty-only');
    adminBtns.forEach(btn => { if (btn) btn.style.display = 'none'; });
  }

  setupGlobalEvents();
  initCommandPalette();
  addPageTransition();
  applyLanguage(localStorage.getItem("edu_lang") || "en");
  add3DBackgrounds();
});

function add3DBackgrounds() {
  if (document.querySelector('.bg-icon-1')) return;
  const bgHTML = `
    <i class="fas fa-graduation-cap bg-icon-1"></i>
    <i class="fas fa-feather-alt bg-icon-2"></i>
    <i class="fas fa-star bg-icon-3"></i>
  `;
  document.body.insertAdjacentHTML('afterbegin', bgHTML);
}

// ── THEME ────────────────────────────────────────────────────────────────────
function initTheme() {
  const savedTheme = localStorage.getItem("edu_theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("edu_theme", next);
  updateThemeIcon(next);
  showToast(`Switched to ${next === "dark" ? "🌙 Dark" : "☀️ Light"} mode`, "info");
}

function updateThemeIcon(theme) {
  const btn = document.getElementById("themeToggleBtn");
  if (btn) btn.innerHTML = theme === "dark"
    ? `<i class="fas fa-sun"></i>`
    : `<i class="fas fa-moon"></i>`;
}

// ── ROLE-BASED SIDEBAR MENUS ─────────────────────────────────────────────────
function getSidebarMenu(role) {
  const adminMenu = `
    <li class="menu-label">Main Menu</li>
    <li class="nav-item"><a href="dashboard.html" class="nav-link" data-page="dashboard"><i class="fas fa-chart-pie"></i> Dashboard</a></li>
    <li class="nav-item"><a href="students.html" class="nav-link" data-page="students"><i class="fas fa-user-graduate"></i> Students</a></li>
    <li class="nav-item"><a href="faculty.html" class="nav-link" data-page="faculty"><i class="fas fa-chalkboard-teacher"></i> Faculty</a></li>
    <li class="nav-item"><a href="departments.html" class="nav-link" data-page="departments"><i class="fas fa-building"></i> Departments</a></li>
    <li class="nav-item"><a href="courses.html" class="nav-link" data-page="courses"><i class="fas fa-book-open"></i> Courses</a></li>
    <li class="menu-label">Academic</li>
    <li class="nav-item"><a href="homework.html" class="nav-link" data-page="homework"><i class="fas fa-file-signature"></i> Add Homework</a></li>
    <li class="nav-item"><a href="marks.html" class="nav-link" data-page="marks"><i class="fas fa-chart-line"></i> Marks & Performance</a></li>
    <li class="nav-item"><a href="attendance.html" class="nav-link" data-page="attendance"><i class="fas fa-calendar-check"></i> Attendance</a></li>
    <li class="nav-item"><a href="examinations.html" class="nav-link" data-page="examinations"><i class="fas fa-award"></i> Examinations</a></li>
    <li class="nav-item"><a href="reports.html" class="nav-link" data-page="reports"><i class="fas fa-chart-bar"></i> Reports</a></li>
    <li class="nav-item"><a href="student-analytics.html" class="nav-link" data-page="analytics"><i class="fas fa-chart-pie"></i> Student Analytics</a></li>
    <li class="menu-label">Account</li>
    <li class="nav-item"><a href="profile.html" class="nav-link" data-page="profile"><i class="fas fa-user-circle"></i> Profile</a></li>
    <li class="nav-item"><a href="settings.html" class="nav-link" data-page="settings"><i class="fas fa-cog"></i> Settings</a></li>
  `;

  const facultyMenu = `
    <li class="menu-label">Faculty Portal</li>
    <li class="nav-item"><a href="dashboard.html" class="nav-link" data-page="dashboard"><i class="fas fa-chart-pie"></i> Dashboard</a></li>
    <li class="nav-item"><a href="students.html" class="nav-link" data-page="students"><i class="fas fa-user-graduate"></i> My Students</a></li>
    <li class="nav-item"><a href="courses.html" class="nav-link" data-page="courses"><i class="fas fa-book-open"></i> My Courses</a></li>
    <li class="menu-label">Academic</li>
    <li class="nav-item"><a href="homework.html" class="nav-link" data-page="homework"><i class="fas fa-file-signature"></i> Add Homework</a></li>
    <li class="nav-item"><a href="marks.html" class="nav-link" data-page="marks"><i class="fas fa-chart-line"></i> Marks & Performance</a></li>
    <li class="nav-item"><a href="attendance.html" class="nav-link" data-page="attendance"><i class="fas fa-calendar-check"></i> Attendance</a></li>
    <li class="nav-item"><a href="examinations.html" class="nav-link" data-page="examinations"><i class="fas fa-award"></i> Examinations</a></li>
    <li class="nav-item"><a href="student-analytics.html" class="nav-link" data-page="analytics"><i class="fas fa-chart-pie"></i> Student Analytics</a></li>
    <li class="menu-label">Account</li>
    <li class="nav-item"><a href="profile.html" class="nav-link" data-page="profile"><i class="fas fa-user-circle"></i> Profile</a></li>
    <li class="nav-item"><a href="settings.html" class="nav-link" data-page="settings"><i class="fas fa-cog"></i> Settings</a></li>
  `;

  const studentMenu = `
    <li class="menu-label">Student Portal</li>
    <li class="nav-item"><a href="dashboard.html" class="nav-link" data-page="dashboard"><i class="fas fa-home"></i> My Dashboard</a></li>
    <li class="menu-label">My Academics</li>
    <li class="nav-item"><a href="homework.html" class="nav-link" data-page="homework"><i class="fas fa-tasks"></i> Homework & Assignments</a></li>
    <li class="nav-item"><a href="courses.html" class="nav-link" data-page="courses"><i class="fas fa-book-open"></i> My Courses</a></li>
    <li class="nav-item"><a href="marks.html" class="nav-link" data-page="marks"><i class="fas fa-chart-line"></i> Marks & Performance</a></li>
    <li class="nav-item"><a href="attendance.html" class="nav-link" data-page="attendance"><i class="fas fa-calendar-check"></i> My Attendance</a></li>
    <li class="nav-item"><a href="examinations.html" class="nav-link" data-page="examinations"><i class="fas fa-award"></i> Examinations</a></li>
    <li class="menu-label">Account</li>
    <li class="nav-item"><a href="student-profile.html" class="nav-link" data-page="profile"><i class="fas fa-user-circle"></i> My Profile</a></li>
    <li class="nav-item"><a href="settings.html" class="nav-link" data-page="settings"><i class="fas fa-cog"></i> Settings</a></li>
  `;

  return { Admin: adminMenu, Faculty: facultyMenu, Student: studentMenu }[role] || adminMenu;
}

function getRoleColor(role) {
  return { Admin: "#8b5cf6", Faculty: "#06b6d4", Student: "#ec4899" }[role] || "#8b5cf6";
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

// ── SIDEBAR ──────────────────────────────────────────────────────────────────
function renderSidebar() {
  const container = document.getElementById("sidebarContainer");
  if (!container) return;
  const user = auth.getCurrentUser();
  if (!user) return;

  const initial = (user.name || "?").charAt(0).toUpperCase();
  const avatarColor = getRoleColor(user.role);
  const menuHTML = getSidebarMenu(user.role);

  container.innerHTML = `
    <div class="sidebar-header">
      <div class="brand-logo">
        <div class="custom-logo-container">
          <div class="logo-core">
            <div class="logo-a">A</div>
            <div class="orbit-ring ring-1"></div>
            <div class="orbit-ring ring-2"></div>
            <div class="orbit-ring ring-3"></div>
            <i class="fas fa-graduation-cap logo-cap"></i>
            <i class="fas fa-star sparkle s1"></i>
            <i class="fas fa-star sparkle s2"></i>
            <i class="fas fa-star sparkle s3"></i>
          </div>
        </div>
        <span style="background:linear-gradient(90deg,#06b6d4,#8b5cf6,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;letter-spacing:3px;font-size:15px;font-weight:900;">ACADRIX</span>
      </div>
    </div>
    <ul class="sidebar-menu">
      ${menuHTML}
      <li class="nav-item" style="margin-top:12px;">
        <a href="#" onclick="auth.logout()" class="nav-link logout-link">
          <i class="fas fa-sign-out-alt"></i> Logout
        </a>
      </li>
    </ul>
    <div class="sidebar-footer">
      <div class="user-badge">
        <div class="user-avatar" style="background:${avatarColor};">${initial}</div>
        <div class="user-info">
          <span class="user-name">${user.name}</span>
          <span class="user-role">${user.role}</span>
        </div>
      </div>
    </div>
  `;
}

// ── TOP NAVBAR ───────────────────────────────────────────────────────────────
function renderTopNavbar() {
  const container = document.getElementById("topNavbarContainer");
  if (!container) return;
  const title = document.body.getAttribute("data-page-title") || "Dashboard";
  const user = auth.getCurrentUser();
  const initial = user ? (user.name || "?").charAt(0).toUpperCase() : "?";
  const avatarColor = user ? getRoleColor(user.role) : "#2563eb";

  container.innerHTML = `
    <div class="navbar-left">
      <button class="toggle-sidebar-btn" id="mobileSidebarToggle" aria-label="Toggle sidebar">
        <i class="fas fa-bars"></i>
      </button>
      <h1 class="page-header-title">${title}</h1>
    </div>
    <div class="navbar-right">
      <div class="global-search-wrap">
        <div class="global-search-box" id="globalSearchBox">
          <i class="fas fa-search"></i>
          <input type="text" id="globalSearchInput" placeholder="Search students, faculty... (Ctrl+K)" autocomplete="off" aria-label="Global search">
          <kbd class="search-kbd">⌘K</kbd>
        </div>
        <div class="global-search-results" id="globalSearchResults"></div>
      </div>
      <button class="theme-toggle-btn" id="themeToggleBtn" onclick="toggleTheme()" title="Toggle Light/Dark Mode" aria-label="Toggle theme">
        <i class="fas fa-moon"></i>
      </button>
      <div class="icon-btn notif-btn" id="notifBtn" title="Notifications" aria-label="Notifications" tabindex="0">
        <i class="fas fa-bell"></i>
        <span class="notification-badge" id="notifBadge"></span>
      </div>
      <div class="navbar-profile-wrap" id="profileWrap">
        <button class="user-avatar navbar-avatar" style="background:${avatarColor}; color:white;" id="profileMenuBtn" aria-label="Profile menu" aria-expanded="false">
          ${initial}
        </button>
        <div class="profile-dropdown" id="profileDropdown" role="menu">
          <div class="profile-dropdown-header">
            <div class="pd-avatar" style="background:${avatarColor};">${initial}</div>
            <div>
              <div class="pd-name">${user ? user.name : ""}</div>
              <div class="pd-role">${user ? user.role : ""}</div>
            </div>
          </div>
          <hr class="pd-divider">
          <a href="#" onclick="window.location.href = (auth.getCurrentUser() && auth.getCurrentUser().role === 'Student') ? 'student-profile.html' : 'profile.html'" class="pd-item"><i class="fas fa-user-circle"></i> My Profile</a>
          <a href="settings.html" class="pd-item"><i class="fas fa-cog"></i> Settings</a>
          <button class="pd-item" onclick="toggleTheme()"><i class="fas fa-moon"></i> Toggle Theme</button>
          <hr class="pd-divider">
          <button class="pd-item pd-logout" onclick="auth.logout()"><i class="fas fa-sign-out-alt"></i> Logout</button>
        </div>
      </div>
    </div>
    <!-- Notification Panel -->
    <div class="notif-panel" id="notifPanel" role="dialog" aria-label="Notifications">
      <div class="notif-panel-header">
        <span>Notifications</span>
        <button class="notif-mark-all" id="markAllRead">Mark all read</button>
      </div>
      <div class="notif-list" id="notifList"></div>
    </div>
  `;

  updateThemeIcon(localStorage.getItem("edu_theme") || "light");
  initNotifications();
  initGlobalSearch();
}

// ── NOTIFICATION CENTER ───────────────────────────────────────────────────────
const DEFAULT_NOTIFICATIONS = [
  { id: 1, text: "New student Aarav Sharma enrolled in CSE", time: "10 mins ago", icon: "fa-user-plus", read: false },
  { id: 2, text: "Mid-term marks published for Full Stack Java", time: "1 hour ago", icon: "fa-file-alt", read: false },
  { id: 3, text: "Attendance recorded for 5th Sem CSE batch", time: "3 hours ago", icon: "fa-calendar-check", read: true },
  { id: 4, text: "End-semester exams scheduled for November 20", time: "1 day ago", icon: "fa-award", read: true },
  { id: 5, text: "New course CS302 added to curriculum", time: "2 days ago", icon: "fa-book-open", read: true }
];

function getNotificationsList() {
  const stored = localStorage.getItem("edu_notifications");
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  localStorage.setItem("edu_notifications", JSON.stringify(DEFAULT_NOTIFICATIONS));
  return DEFAULT_NOTIFICATIONS;
}

window.addSystemNotification = function(text, icon = "fa-bell", targetRole = null) {
  const list = getNotificationsList();
  const newNotif = {
    id: Date.now(),
    text: text,
    time: "Just now",
    icon: icon,
    read: false,
    targetRole: targetRole
  };
  list.unshift(newNotif);
  localStorage.setItem("edu_notifications", JSON.stringify(list));
  if (typeof renderNotifications === "function") {
    renderNotifications();
  }
  return newNotif;
};

function initNotifications() {
  renderNotifications();

  const btn = document.getElementById("notifBtn");
  const panel = document.getElementById("notifPanel");
  if (!btn || !panel) return;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    panel.classList.toggle("active");
    if (panel.classList.contains("active")) {
      markNotifBadge();
    }
  });

  document.getElementById("markAllRead")?.addEventListener("click", () => {
    const list = getNotificationsList();
    list.forEach(n => n.read = true);
    localStorage.setItem("edu_notifications", JSON.stringify(list));
    renderNotifications();
    markNotifBadge();
  });

  document.addEventListener("click", (e) => {
    if (!btn.contains(e.target) && !panel.contains(e.target)) {
      panel.classList.remove("active");
    }
  });
}

function renderNotifications() {
  const listEl = document.getElementById("notifList");
  if (!listEl) return;
  const list = getNotificationsList();
  const unread = list.filter(n => !n.read).length;
  const badge = document.getElementById("notifBadge");
  if (badge) badge.style.display = unread > 0 ? "block" : "none";

  listEl.innerHTML = list.map(n => `
    <div class="notif-item ${n.read ? "read" : ""}">
      <div class="notif-icon"><i class="fas ${n.icon}"></i></div>
      <div class="notif-content">
        <div class="notif-text">${n.text}</div>
        <div class="notif-time">${n.time}</div>
      </div>
      ${!n.read ? '<div class="notif-dot"></div>' : ''}
    </div>
  `).join("");
}

function markNotifBadge() {
  const badge = document.getElementById("notifBadge");
  const list = getNotificationsList();
  const unread = list.filter(n => !n.read).length;
  if (badge) badge.style.display = unread > 0 ? "block" : "none";
}

// ── GLOBAL SEARCH ─────────────────────────────────────────────────────────────
function initGlobalSearch() {
  const input = document.getElementById("globalSearchInput");
  const results = document.getElementById("globalSearchResults");
  if (!input || !results) return;

  let searchTimeout;
  input.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    const q = input.value.trim();
    if (!q) { results.style.display = "none"; return; }
    searchTimeout = setTimeout(() => runGlobalSearch(q), 200);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { results.style.display = "none"; input.blur(); }
    if (e.key === "ArrowDown") {
      const items = results.querySelectorAll(".sr-item");
      if (items.length) items[0].focus();
    }
  });

  document.addEventListener("click", (e) => {
    if (!input.closest(".global-search-wrap").contains(e.target)) {
      results.style.display = "none";
    }
  });
}

async function runGlobalSearch(q) {
  const results = document.getElementById("globalSearchResults");
  if (!results) return;

  try {
    const [students, faculty, courses] = await Promise.all([
      api.getStudents(), api.getFaculty(), api.getCourses()
    ]);

    const qLow = q.toLowerCase();
    const highlight = (text) => {
      const idx = text.toLowerCase().indexOf(qLow);
      if (idx === -1) return text;
      return text.slice(0, idx) + `<mark>${text.slice(idx, idx + q.length)}</mark>` + text.slice(idx + q.length);
    };

    const matches = [];
    students.filter(s => s.name.toLowerCase().includes(qLow) || (s.rollNo || "").toLowerCase().includes(qLow))
      .slice(0, 3).forEach(s => matches.push({ type: "Student", icon: "fa-user-graduate", label: s.name, sub: s.rollNo, href: `students.html` }));
    faculty.filter(f => f.name.toLowerCase().includes(qLow))
      .slice(0, 2).forEach(f => matches.push({ type: "Faculty", icon: "fa-chalkboard-teacher", label: f.name, sub: f.department, href: `faculty.html` }));
    courses.filter(c => c.name.toLowerCase().includes(qLow) || (c.code || "").toLowerCase().includes(qLow))
      .slice(0, 2).forEach(c => matches.push({ type: "Course", icon: "fa-book-open", label: c.name, sub: c.code, href: `courses.html` }));

    if (!matches.length) {
      results.innerHTML = `<div class="sr-empty">No results for "<strong>${q}</strong>"</div>`;
    } else {
      results.innerHTML = matches.map((m, i) => `
        <a href="${m.href}" class="sr-item" tabindex="0" data-index="${i}">
          <div class="sr-icon"><i class="fas ${m.icon}"></i></div>
          <div class="sr-info">
            <div class="sr-label">${highlight(m.label)}</div>
            <div class="sr-sub">${m.type} · ${m.sub || ""}</div>
          </div>
          <i class="fas fa-arrow-right sr-arrow"></i>
        </a>
      `).join("");
    }
    results.style.display = "block";

    // Keyboard navigation in results
    results.querySelectorAll(".sr-item").forEach((item, i, all) => {
      item.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown") { e.preventDefault(); all[i+1]?.focus(); }
        if (e.key === "ArrowUp") { e.preventDefault(); i === 0 ? document.getElementById("globalSearchInput").focus() : all[i-1]?.focus(); }
        if (e.key === "Escape") { results.style.display = "none"; document.getElementById("globalSearchInput").focus(); }
      });
    });
  } catch {
    results.innerHTML = `<div class="sr-empty">Search unavailable</div>`;
    results.style.display = "block";
  }
}

// ── COMMAND PALETTE ───────────────────────────────────────────────────────────
const COMMANDS = [
  { label: "Add Student", icon: "fa-user-plus", action: () => { window.location.href = "students.html"; }, tag: "navigate" },
  { label: "View All Students", icon: "fa-users", action: () => { window.location.href = "students.html"; }, tag: "navigate" },
  { label: "Add Faculty", icon: "fa-chalkboard-teacher", action: () => { window.location.href = "faculty.html"; }, tag: "navigate" },
  { label: "View Courses", icon: "fa-book-open", action: () => { window.location.href = "courses.html"; }, tag: "navigate" },
  { label: "Record Attendance", icon: "fa-calendar-check", action: () => { window.location.href = "attendance.html"; }, tag: "navigate" },
  { label: "Marks & Performance Analytics", icon: "fa-chart-line", action: () => { window.location.href = "marks.html"; }, tag: "navigate" },
  { label: "Generate Report", icon: "fa-chart-bar", action: () => { window.location.href = "reports.html"; }, tag: "action" },
  { label: "Open Chatbot", icon: "fa-robot", action: () => { document.getElementById("chatbotFab")?.click(); }, tag: "action" },
  { label: "Toggle Dark Mode", icon: "fa-moon", action: toggleTheme, tag: "action" },
  { label: "Go to Dashboard", icon: "fa-chart-pie", action: () => { window.location.href = "dashboard.html"; }, tag: "navigate" },
  { label: "View Profile", icon: "fa-user-circle", action: () => { window.location.href = (auth.getCurrentUser() && auth.getCurrentUser().role === 'Student') ? 'student-profile.html' : 'profile.html'; }, tag: "navigate" },
  { label: "Logout", icon: "fa-sign-out-alt", action: () => auth.logout(), tag: "action" }
];

function initCommandPalette() {
  // Create palette DOM
  if (document.getElementById("commandPalette")) return;
  const palette = document.createElement("div");
  palette.id = "commandPalette";
  palette.className = "cmd-palette-backdrop";
  palette.setAttribute("role", "dialog");
  palette.setAttribute("aria-modal", "true");
  palette.innerHTML = `
    <div class="cmd-palette-box">
      <div class="cmd-search-row">
        <i class="fas fa-terminal cmd-icon"></i>
        <input type="text" id="cmdInput" class="cmd-input" placeholder="Search or run a command..." autocomplete="off" aria-label="Command palette search">
        <kbd class="cmd-esc-hint">ESC</kbd>
      </div>
      <div class="cmd-results" id="cmdResults"></div>
    </div>
  `;
  document.body.appendChild(palette);

  // Keyboard shortcut: Ctrl+K
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      openCommandPalette();
    }
    if (e.key === "Escape") closeCommandPalette();
  });

  palette.addEventListener("click", (e) => {
    if (e.target === palette) closeCommandPalette();
  });

  const cmdInput = document.getElementById("cmdInput");
  cmdInput.addEventListener("input", () => renderCommandResults(cmdInput.value));
  cmdInput.addEventListener("keydown", navigateCommandResults);
}

function openCommandPalette() {
  const p = document.getElementById("commandPalette");
  if (!p) return;
  p.classList.add("active");
  const inp = document.getElementById("cmdInput");
  inp.value = "";
  renderCommandResults("");
  setTimeout(() => inp.focus(), 50);
}

function closeCommandPalette() {
  document.getElementById("commandPalette")?.classList.remove("active");
}

function renderCommandResults(q) {
  const results = document.getElementById("cmdResults");
  if (!results) return;
  const filtered = q
    ? COMMANDS.filter(c => c.label.toLowerCase().includes(q.toLowerCase()))
    : COMMANDS;

  results.innerHTML = filtered.map((c, i) => `
    <button class="cmd-item ${i === 0 ? "cmd-item-active" : ""}" data-index="${i}" onclick="runCommand(${i},${JSON.stringify(q)})">
      <span class="cmd-item-icon"><i class="fas ${c.icon}"></i></span>
      <span class="cmd-item-label">${c.label}</span>
      <span class="cmd-item-tag">${c.tag}</span>
    </button>
  `).join("") || `<div class="cmd-empty">No commands found</div>`;
}

function runCommand(index, q) {
  const filtered = q
    ? COMMANDS.filter(c => c.label.toLowerCase().includes(q.toLowerCase()))
    : COMMANDS;
  filtered[index]?.action();
  closeCommandPalette();
}

function navigateCommandResults(e) {
  const items = document.querySelectorAll(".cmd-item");
  const active = document.querySelector(".cmd-item-active");
  let idx = Array.from(items).indexOf(active);
  if (e.key === "ArrowDown") { e.preventDefault(); idx = (idx + 1) % items.length; }
  else if (e.key === "ArrowUp") { e.preventDefault(); idx = (idx - 1 + items.length) % items.length; }
  else if (e.key === "Enter") {
    e.preventDefault();
    active?.click();
    return;
  } else return;
  items.forEach(i => i.classList.remove("cmd-item-active"));
  items[idx]?.classList.add("cmd-item-active");
  items[idx]?.scrollIntoView({ block: "nearest" });
}

// ── ACTIVE NAV HIGHLIGHT ──────────────────────────────────────────────────────
function highlightActiveNav() {
  const pageName = document.body.getAttribute("data-page-id");
  if (!pageName) return;
  document.querySelectorAll(".nav-link").forEach(link => {
    if (link.getAttribute("data-page") === pageName) link.classList.add("active");
  });
}

// ── PROFILE DROPDOWN ──────────────────────────────────────────────────────────
function setupGlobalEvents() {
  // Mobile sidebar toggle
  const sidebar = document.getElementById("sidebarContainer");
  document.addEventListener("click", (e) => {
    const toggleBtn = document.getElementById("mobileSidebarToggle");
    if (toggleBtn?.contains(e.target)) {
      sidebar?.classList.toggle("mobile-open");
      return;
    }
    if (sidebar?.classList.contains("mobile-open") && !sidebar.contains(e.target)) {
      sidebar.classList.remove("mobile-open");
    }
  });

  // Profile dropdown
  const profileBtn = document.getElementById("profileMenuBtn");
  const profileDropdown = document.getElementById("profileDropdown");
  profileBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = profileDropdown?.classList.toggle("active");
    profileBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
  document.addEventListener("click", (e) => {
    if (!profileBtn?.contains(e.target) && !profileDropdown?.contains(e.target)) {
      profileDropdown?.classList.remove("active");
      profileBtn?.setAttribute("aria-expanded", "false");
    }
  });
}

// ── PAGE TRANSITIONS ──────────────────────────────────────────────────────────
function addPageTransition() {
  document.body.classList.add("page-entering");
  requestAnimationFrame(() => {
    document.body.classList.add("page-visible");
  });
  // Intercept in-page navigation for smooth transitions
  document.querySelectorAll("a[href]").forEach(link => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("javascript")) return;
    link.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      document.body.classList.add("page-leaving");
      setTimeout(() => { window.location.href = href; }, 200);
    });
  });
}

// ── LANGUAGE & HINDI TRANSLATION SYSTEM ────────────────────────────────────────
const HINDI_MAP = {
  "Main Menu": "मुख्य मेनू",
  "Faculty Portal": "शिक्षक पोर्टल",
  "Student Portal": "छात्र पोर्टल",
  "Dashboard": "डैशबोर्ड",
  "My Dashboard": "मेरा डैशबोर्ड",
  "Students": "छात्र",
  "My Students": "मेरे छात्र",
  "Faculty": "शिक्षक (Faculty)",
  "Departments": "विभाग (Departments)",
  "Courses": "पाठ्यक्रम (Courses)",
  "My Courses": "मेरे पाठ्यक्रम",
  "Academic": "शैक्षणिक",
  "My Academics": "मेरी पढ़ाई",
  "Marks": "अंक तालिका (Marks)",
  "My Marks": "मेरे अंक",
  "Enter Marks": "अंक दर्ज करें",
  "Attendance": "उपस्थिति (Attendance)",
  "My Attendance": "मेरी उपस्थिति",
  "Examinations": "परीक्षाएँ (Examinations)",
  "Reports": "रिपोर्ट्स (Reports)",
  "Student Analytics": "छात्र विश्लेषण",
  "Profile": "प्रोफ़ाइल",
  "My Profile": "मेरी प्रोफ़ाइल",
  "Settings": "सेटिंग्स (Settings)",
  "Logout": "लॉग आउट",
  "Application Preferences": "ऐप्लिकेशन प्राथमिकतियाँ",
  "Theme Mode Preference": "थीम मोड चुनिए",
  "System Language": "सिस्टम भाषा",
  "Email Notifications": "ईमेल सूचनाएं",
  "Save Preferences": "प्राथमिकताएं सहेजें",
  "User Account Profile": "उपयोगकर्ता खाता प्रोफ़ाइल"
};

function applyLanguage(lang) {
  const selected = lang || localStorage.getItem("edu_lang") || "en";
  localStorage.setItem("edu_lang", selected);
  document.documentElement.setAttribute("lang", selected);

  if (selected === "hi") {
    document.querySelectorAll(".nav-link, .menu-label, .modal-title, .form-label, h1.page-header-title, h2, h3, button.btn-primary").forEach(el => {
      // Traverse nodes to replace text content
      for (let node of el.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
          const txt = node.textContent.trim();
          if (HINDI_MAP[txt]) {
            node.textContent = " " + HINDI_MAP[txt] + " ";
          }
        }
      }
    });
  }
}
