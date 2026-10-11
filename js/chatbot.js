/* 
  EduAssist AI Floating Chatbot Module
  Smart rule-based engine with role awareness, live data queries & 50+ topic patterns
*/

document.addEventListener("DOMContentLoaded", () => {
  initChatbot();
});

function initChatbot() {
  const chatHTML = `
    <!-- Floating Action Button -->
    <button class="chatbot-fab" id="chatbotFab" title="Ask EduAssist Assistant">
      <i class="fas fa-robot"></i>
      <span class="unread-badge"></span>
    </button>

    <!-- Chat Window Container -->
    <div class="chatbot-window" id="chatbotWindow">
      <div class="chatbot-header">
        <div class="chatbot-header-info">
          <div class="chatbot-avatar"><i class="fas fa-robot"></i></div>
          <div class="chatbot-title-box">
            <h4>EduAssist <span style="font-size:10px;background:#10b981;color:#fff;padding:2px 6px;border-radius:99px;font-weight:500;margin-left:4px;">AI</span></h4>
            <p id="chatbotStatusLine">Your intelligent college assistant</p>
          </div>
        </div>
        <button class="chatbot-close-btn" id="chatbotCloseBtn"><i class="fas fa-times"></i></button>
      </div>

      <!-- Messages Area -->
      <div class="chatbot-messages" id="chatMessages">
        <div class="message-bubble bot">
          Hello! I'm <strong>EduAssist</strong> 👋<br>
          I can answer questions about your <strong>marks, attendance, courses, exams, faculty</strong> and more.<br>
          What would you like to know?
          <div class="chat-timestamp">${getCurrentTimeString()}</div>
        </div>
      </div>

      <!-- Quick Question Chips -->
      <div class="chatbot-quick-questions" id="quickChipsArea">
        <button class="quick-chip" onclick="sendQuickQuestion('What is my attendance?')">My Attendance</button>
        <button class="quick-chip" onclick="sendQuickQuestion('What are my marks?')">My Marks</button>
        <button class="quick-chip" onclick="sendQuickQuestion('Show upcoming exams')">Upcoming Exams</button>
        <button class="quick-chip" onclick="sendQuickQuestion('List available courses')">Courses</button>
        <button class="quick-chip" onclick="sendQuickQuestion('How do I add a student?')">Add Student</button>
        <button class="quick-chip" onclick="sendQuickQuestion('Help')">Help</button>
      </div>

      <!-- Input Area -->
      <form class="chatbot-input-area" id="chatForm">
        <input type="text" class="chatbot-input" id="chatInput" placeholder="Ask me anything..." autocomplete="off" />
        <button type="submit" class="chatbot-send-btn"><i class="fas fa-paper-plane"></i></button>
      </form>
    </div>
  `;

  const container = document.createElement("div");
  container.id = "chatbotRootContainer";
  container.innerHTML = chatHTML;
  document.body.appendChild(container);

  const fab      = document.getElementById("chatbotFab");
  const win      = document.getElementById("chatbotWindow");
  const closeBtn = document.getElementById("chatbotCloseBtn");
  const form     = document.getElementById("chatForm");

  fab.addEventListener("click", () => win.classList.toggle("active"));
  closeBtn.addEventListener("click", () => win.classList.remove("active"));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("chatInput");
    const text  = input.value.trim();
    if (text) { processUserMessage(text); input.value = ""; }
  });
}

// ───────────────────────────────────────────────
// Message Processing
// ───────────────────────────────────────────────
async function processUserMessage(messageText) {
  appendMessage(messageText, "user");
  const typingId = appendTypingIndicator();

  // Small delay to feel natural
  const delay = 500 + Math.random() * 400;
  setTimeout(async () => {
    const reply = await getSmartReply(messageText);
    removeTypingIndicator(typingId);
    appendMessage(reply, "bot");
  }, delay);
}

function sendQuickQuestion(q) { processUserMessage(q); }

// ───────────────────────────────────────────────
// Main Smart Reply Engine
// ───────────────────────────────────────────────
async function getSmartReply(msg) {
  const text = msg.toLowerCase().trim();
  const user = (typeof auth !== "undefined") ? auth.getCurrentUser() : null;
  const role = user ? user.role : "Guest";

  // ── GREETINGS ──────────────────────────────────
  if (/^(hi|hello|hey|helo|hii|namaste|namaskar|good morning|good afternoon|good evening|sup|yo)\b/.test(text)) {
    const greet = ["Hello", "Hi there", "Hey", "Namaste"][Math.floor(Math.random()*4)];
    const name  = user ? `, ${user.name.split(" ")[0]}` : "";
    return `${greet}${name}! 👋 How can I help you today? You can ask about marks, attendance, courses, exams, or anything about the portal.`;
  }

  // ── HOW ARE YOU ────────────────────────────────
  if (/how are you|how r u|kaisa|aap kaisa|what's up/.test(text)) {
    return "I'm doing great, thank you for asking! 😊 Ready to help you with anything related to EduPortal. What do you need?";
  }

  // ── THANKS ─────────────────────────────────────
  if (/^(thanks|thank you|thx|ty|shukriya|dhanyawad)/.test(text)) {
    return "You're welcome! 😊 Feel free to ask if you need anything else.";
  }

  // ── MY ATTENDANCE (Live data) ──────────────────
  if (/my attendance|attendance percentage|attendance kitna|kitni attendance|attendance status|meri attendance/.test(text)) {
    if (role === "Student" && user && user.studentId) {
      const att = getStudentAttendance(user.studentId);
      if (att.length) {
        const rows = att.map(a => `• <strong>${a.subject}</strong>: ${a.presentClasses}/${a.totalClasses} classes — <strong>${a.percentage}%</strong> ${a.percentage < 75 ? '⚠️ <em>(Below 75% — shortage!)</em>' : '✅'}`).join("<br>");
        const avg = Math.round(att.reduce((s,a) => s + a.percentage, 0) / att.length);
        return `📊 <strong>Your Attendance Summary:</strong><br><br>${rows}<br><br><strong>Overall Average: ${avg}%</strong>${avg < 75 ? "<br>⚠️ <em>Warning: You are below the 75% minimum requirement in some subjects!</em>" : "<br>✅ Great — you're above the minimum attendance threshold!"}`;
      }
      return "No attendance records found for your profile yet. Your attendance will appear here once it's recorded by your faculty.";
    }
    if (role === "Admin" || role === "Faculty") {
      const att = getStorageData("edu_attendance");
      return `📊 There are <strong>${att.length}</strong> attendance records in the system across all students. Go to the <strong>Attendance</strong> page to view and manage them.`;
    }
    return "Go to the <strong>Attendance</strong> section in the sidebar to check attendance percentages.";
  }

  // ── MY MARKS / GRADES (Live data) ─────────────
  if (/my marks|my grade|my result|mera result|mera marks|meri marks|marks kya hain|score|kitne marks/.test(text)) {
    if (role === "Student" && user && user.studentId) {
      const marks = getStudentMarks(user.studentId);
      if (marks.length) {
        const rows = marks.map(m => `• <strong>${m.subject}</strong> (${m.subjectCode}): Internal ${m.internalMarks} + External ${m.externalMarks} = <strong>${m.totalMarks}/100</strong> — Grade: <strong>${m.grade}</strong>`).join("<br>");
        const avg  = Math.round(marks.reduce((s,m) => s + m.percentage, 0) / marks.length);
        return `📝 <strong>Your Marks:</strong><br><br>${rows}<br><br><strong>Average Score: ${avg}%</strong>`;
      }
      return "No marks have been recorded for your profile yet. Check back after your exams.";
    }
    if (role === "Admin" || role === "Faculty") {
      return "Go to the <strong>Marks</strong> section to enter and manage student marks, grades, and percentages.";
    }
    return "Navigate to <strong>My Marks</strong> from the sidebar to view your subject-wise grades.";
  }

  // ── UPCOMING EXAMS (Live data) ─────────────────
  if (/exam|test|schedule|timetable|upcoming|pariksha|imtihan/.test(text)) {
    const exams = getStorageData("edu_examinations");
    if (exams.length) {
      const upcoming = exams.filter(e => e.status === "Scheduled");
      if (upcoming.length) {
        const rows = upcoming.map(e => `• <strong>${e.subject}</strong> — ${e.examType} on 📅 <strong>${formatDate(e.examDate)}</strong>`).join("<br>");
        return `📅 <strong>Upcoming Exams:</strong><br><br>${rows}<br><br>Visit the <strong>Examinations</strong> page for full details and result cards.`;
      }
    }
    return "No upcoming exams are scheduled right now. Check the <strong>Examinations</strong> page for the latest schedule.";
  }

  // ── COURSES (Live data) ────────────────────────
  if (/course|subject|curriculum|syllabus|kitne course|which course|available course/.test(text)) {
    const courses = getStorageData("edu_courses").filter(c => c.status === "Active");
    if (courses.length) {
      const rows = courses.map(c => `• <strong>${c.name}</strong> (${c.code}) — Sem ${c.semester}, ${c.credits} credits — <em>${c.faculty}</em>`).join("<br>");
      return `📚 <strong>Active Courses (${courses.length}):</strong><br><br>${rows}`;
    }
    return "Go to the <strong>Courses</strong> page to see all active courses, their credits, faculty, and semester details.";
  }

  // ── STUDENTS ───────────────────────────────────
  if (/student list|all students|kitne students|total student|students count|how many student/.test(text)) {
    const students = getStorageData("edu_students");
    return `👥 There are currently <strong>${students.length} students</strong> enrolled in the system. Visit the <strong>Students</strong> page to search, filter, and manage all student records.`;
  }

  if (/add student|new student|enroll student|register student/.test(text)) {
    return `To add a new student:<br>1️⃣ Click <strong>Students</strong> in the sidebar<br>2️⃣ Click the <strong>"+ Add Student"</strong> button (top right)<br>3️⃣ Fill in the name, email, department, year etc.<br>4️⃣ Click <strong>Save</strong>`;
  }

  if (/delete student|remove student/.test(text)) {
    return "To delete a student: Go to <strong>Students</strong> page → Find the student → Click the 🗑️ <strong>Delete</strong> icon in the Actions column → Confirm deletion.";
  }

  // ── FACULTY ───────────────────────────────────
  if (/faculty|teacher|professor|lecturer|staff list|kitne faculty/.test(text)) {
    const faculty = getStorageData("edu_faculty");
    const rows    = faculty.map(f => `• <strong>${f.name}</strong> — ${f.designation}, ${f.department}`).join("<br>");
    return `👩‍🏫 <strong>Faculty Members (${faculty.length}):</strong><br><br>${rows}<br><br>Visit the <strong>Faculty</strong> page for contact numbers and full details.`;
  }

  if (/add faculty|new faculty/.test(text)) {
    return `To add a faculty member:<br>1️⃣ Click <strong>Faculty</strong> in the sidebar<br>2️⃣ Click <strong>"+ Add Faculty"</strong><br>3️⃣ Fill name, email, department, qualification<br>4️⃣ Click <strong>Save</strong>`;
  }

  // ── DEPARTMENTS ───────────────────────────────
  if (/department|dept|branch|kitne department/.test(text)) {
    const depts = getStorageData("edu_departments");
    const rows  = depts.map(d => `• <strong>${d.name}</strong> — HOD: ${d.head} | Students: ${d.studentsCount}`).join("<br>");
    return `🏢 <strong>Departments (${depts.length}):</strong><br><br>${rows}`;
  }

  // ── ATTENDANCE SHORTAGE ────────────────────────
  if (/shortage|below 75|less attendance|attendance problem|kitni chahiye attendance|minimum attendance/.test(text)) {
    return `⚠️ <strong>Attendance Policy:</strong><br><br>• Minimum required: <strong>75%</strong><br>• Below 75% = <strong>Attendance Shortage</strong><br>• Students with shortage may be <strong>debarred from exams</strong><br>• Contact your HOD immediately if you have a shortage<br><br>Check your attendance in <strong>My Attendance</strong> section.`;
  }

  // ── MARKS CALCULATION ─────────────────────────
  if (/how marks calculated|grading system|grade kaise|marking scheme|internal external/.test(text)) {
    return `📊 <strong>Marking Scheme:</strong><br><br>• <strong>Internal Marks</strong>: 30 (Assignments + Practicals + Mid-term)<br>• <strong>External Marks</strong>: 70 (End-semester exam)<br>• <strong>Total</strong>: 100 marks per subject<br><br><strong>Grade Chart:</strong><br>• A+ = 90–100% 🌟<br>• A = 80–89%<br>• B+ = 70–79%<br>• B = 60–69%<br>• C = 50–59%<br>• D = 40–49%<br>• F = Below 40% ❌`;
  }

  // ── PASSWORD / LOGIN ───────────────────────────
  if (/password|forgot|reset|change password|login issue|login problem/.test(text)) {
    return `🔐 <strong>Password Help:</strong><br><br>• On the login page, click <strong>"Forgot Password?"</strong><br>• Enter your registered institutional email<br>• You'll receive a reset link<br><br>To change your password after login: Go to <strong>Profile</strong> → <strong>Change Password</strong> section.`;
  }

  // ── PROFILE ───────────────────────────────────
  if (/profile|my info|my details|personal info|update info/.test(text)) {
    return "Click <strong>My Profile</strong> in the sidebar to view and update your personal information, photo, contact number, and address.";
  }

  // ── DARK MODE / THEME ─────────────────────────
  if (/dark mode|light mode|theme|night mode|background/.test(text)) {
    return "🌙 Toggle between <strong>Light and Dark mode</strong> using the moon/sun 🌙☀️ icon in the top navigation bar (top right). Your preference is saved automatically!";
  }

  // ── LOGOUT ────────────────────────────────────
  if (/logout|log out|sign out|exit/.test(text)) {
    return "To logout: Click the <strong>Logout</strong> button at the bottom of the left sidebar. You'll be redirected to the login page.";
  }

  // ── REPORTS ───────────────────────────────────
  if (/report|print|export|download|pdf|csv/.test(text)) {
    return "📄 Go to the <strong>Reports</strong> page from the sidebar to generate and print reports for Students, Faculty, Marks, and Attendance. You can also export data to CSV format.";
  }

  // ── SETTINGS ──────────────────────────────────
  if (/setting|preference|language|notification/.test(text)) {
    return "⚙️ Go to <strong>Settings</strong> in the sidebar to manage your app preferences, notification settings, and language options.";
  }

  // ── SEMESTER ──────────────────────────────────
  if (/semester|sem|current sem/.test(text)) {
    if (role === "Student" && user) {
      return `📅 You are currently in <strong>Semester ${user.semester || "N/A"}</strong>, ${user.year || ""} — ${user.department || ""}`;
    }
    return "Semester information is shown in your student profile. Check the <strong>Students</strong> page or your <strong>My Profile</strong> section.";
  }

  // ── WHO AM I / MY INFO ────────────────────────
  if (/who am i|my name|my role|mera naam|meri id|student id/.test(text)) {
    if (user) {
      return `👤 <strong>Your Profile:</strong><br>• Name: <strong>${user.name}</strong><br>• Role: <strong>${user.role}</strong><br>• Email: ${user.email || "N/A"}${user.studentId ? `<br>• Student ID: <strong>${user.studentId}</strong>` : ""}${user.department ? `<br>• Department: ${user.department}` : ""}${user.year ? `<br>• Year: ${user.year}` : ""}`;
    }
    return "Please log in to see your profile information.";
  }

  // ── HOW TO USE / NAVIGATION ───────────────────
  if (/how to use|navigate|guide|tutorial|start|beginning/.test(text)) {
    return `🗺️ <strong>How to use EduPortal:</strong><br><br>1. Use the <strong>left sidebar</strong> to navigate between pages<br>2. <strong>Dashboard</strong> shows your overview and stats<br>3. <strong>Students / Faculty</strong> — manage records<br>4. <strong>Marks</strong> — enter and view grades<br>5. <strong>Attendance</strong> — daily attendance tracking<br>6. <strong>Examinations</strong> — view exam schedule<br>7. <strong>Reports</strong> — generate printable reports<br><br>Ask me about any feature! 😊`;
  }

  // ── HELP ──────────────────────────────────────
  if (/^help$|what can you do|what do you know|capabilities/.test(text)) {
    return `🤖 <strong>I can help you with:</strong><br><br>📊 <em>Attendance</em> — "What is my attendance?"<br>📝 <em>Marks</em> — "What are my marks?"<br>📅 <em>Exams</em> — "Show upcoming exams"<br>📚 <em>Courses</em> — "List available courses"<br>👥 <em>Students</em> — "How do I add a student?"<br>👩‍🏫 <em>Faculty</em> — "Show all faculty"<br>🏢 <em>Departments</em> — "List departments"<br>🔐 <em>Password</em> — "How to reset password?"<br>🌙 <em>Theme</em> — "How to enable dark mode?"<br><br>Just type your question naturally!`;
  }

  // ── FALLBACK ──────────────────────────────────
  const suggestions = ["My Attendance", "My Marks", "Upcoming Exams", "Course List", "Faculty List", "Help"];
  return `I'm not sure about that, but I can help with:<br><br>${suggestions.map(s => `💬 "<em>${s}</em>"`).join(" · ")}<br><br>Try rephrasing or ask something from the list above!`;
}

// ───────────────────────────────────────────────
// Live Data Helpers (reads from localStorage)
// ───────────────────────────────────────────────
function getStorageData(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
}

function getStudentMarks(studentId) {
  return getStorageData("edu_marks").filter(m => m.studentId === studentId);
}

function getStudentAttendance(studentId) {
  return getStorageData("edu_attendance").filter(a => a.studentId === studentId);
}

function formatDate(dateStr) {
  if (!dateStr) return "TBD";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch { return dateStr; }
}

// ───────────────────────────────────────────────
// DOM Helpers
// ───────────────────────────────────────────────
function appendMessage(text, sender) {
  const container = document.getElementById("chatMessages");
  const bubble    = document.createElement("div");
  bubble.className = `message-bubble ${sender}`;
  bubble.innerHTML  = `${text}<div class="chat-timestamp">${getCurrentTimeString()}</div>`;
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

function appendTypingIndicator() {
  const container = document.getElementById("chatMessages");
  const typing    = document.createElement("div");
  const id        = "typing-" + Date.now();
  typing.id        = id;
  typing.className = "message-bubble bot";
  typing.innerHTML = `<span style="display:flex;align-items:center;gap:6px;"><span style="width:7px;height:7px;border-radius:50%;background:#94a3b8;animation:typingDot 1s infinite 0s;display:inline-block;"></span><span style="width:7px;height:7px;border-radius:50%;background:#94a3b8;animation:typingDot 1s infinite 0.2s;display:inline-block;"></span><span style="width:7px;height:7px;border-radius:50%;background:#94a3b8;animation:typingDot 1s infinite 0.4s;display:inline-block;"></span></span>`;
  // Add keyframe if not added
  if (!document.getElementById("typingDotStyle")) {
    const s = document.createElement("style");
    s.id = "typingDotStyle";
    s.innerHTML = `@keyframes typingDot{0%,80%,100%{transform:scale(0.6);opacity:0.5}40%{transform:scale(1);opacity:1}}`;
    document.head.appendChild(s);
  }
  container.appendChild(typing);
  container.scrollTop = container.scrollHeight;
  return id;
}

function removeTypingIndicator(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function getCurrentTimeString() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

