/* 
  Attendance Management Logic
*/
        
let attendanceList = [];

document.addEventListener("DOMContentLoaded", () => {
  loadAttendanceData();
  setupAttendanceForm();
});

async function loadAttendanceData() {
  try {
    const currentUser = auth.getCurrentUser();
    
    if (currentUser && currentUser.role === 'Student') {
      const students = await api.getStudents();
      const s = students.find(item => item.email && item.email.toLowerCase() === currentUser.email.toLowerCase());
      if (s) {
        attendanceList = await api.getAttendanceByStudent(s.studentId);
      } else {
        attendanceList = [];
      }
      
      const btn = document.getElementById("markAttendanceBtn");
      if (btn) btn.style.display = "none";
    } else {
      attendanceList = await api.getAttendance();
    }
    
    renderAttendanceTable(attendanceList);
    if (!currentUser || currentUser.role !== 'Student') {
      populateAttendanceStudentSelect();
    }
  } catch (err) {
    showToast("Error loading attendance data", "error");
  }
}

async function populateAttendanceStudentSelect() {
  const select = document.getElementById("attStudentSelect");
  if (!select) return;

  const students = await api.getStudents();
  select.innerHTML = `<option value="">Select Student...</option>` +
    students.map(s => `<option value="${s.studentId}">${s.name} (${s.rollNo})</option>`).join("");
}

function setupAttendanceForm() {
  const form = document.getElementById("markAttendanceForm");
  if (form) form.addEventListener("submit", handleMarkAttendance);
}

function renderAttendanceTable(list) {
  const tbody = document.getElementById("attendanceTableBody");
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty-state">No attendance records logged.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(a => {
    const isGood = a.percentage >= 75;
    const pctBadge = isGood ? 'badge-success' : 'badge-danger';
    return `
      <tr>
        <td><strong>${a.studentId}</strong></td>
        <td><strong>${a.studentName}</strong></td>
        <td>${a.subject}</td>
        <td>${formatDate(a.date)}</td>
        <td>${a.presentClasses} / ${a.totalClasses}</td>
        <td><span class="badge ${pctBadge}">${a.percentage}%</span></td>
        <td><span class="badge ${a.status === 'Present' ? 'badge-success' : 'badge-danger'}">${a.status}</span></td>
        <td>
          ${isGood ? '<span style="color:var(--success-color); font-size:12px;"><i class="fas fa-check-circle"></i> Eligible</span>' : '<span style="color:var(--danger-color); font-size:12px;"><i class="fas fa-exclamation-triangle"></i> Shortage</span>'}
        </td>
      </tr>
    `;
  }).join("");
}

async function handleMarkAttendance(e) {
  e.preventDefault();
  if (!validation.validateRequiredFields("markAttendanceForm")) return;

  const select = document.getElementById("attStudentSelect");
  const selectedOptionText = select.options[select.selectedIndex].text;
  const studentName = selectedOptionText.split("(")[0].trim();

  const totalClasses = parseInt(document.getElementById("attTotalClasses").value) || 40;
  const presentClasses = parseInt(document.getElementById("attPresentClasses").value) || 30;
  const percentage = Math.round((presentClasses / totalClasses) * 100);

  const data = {
    studentId: select.value,
    studentName: studentName,
    subject: document.getElementById("attSubject").value,
    date: document.getElementById("attDate").value || new Date().toISOString().split('T')[0],
    status: document.getElementById("attStatus").value,
    totalClasses: totalClasses,
    presentClasses: presentClasses,
    percentage: percentage
  };

  try {
    await api.saveAttendance(data);
    showToast("Attendance logged successfully!", "success");
    closeModal("markAttendanceModal");
    document.getElementById("markAttendanceForm").reset();
    await loadAttendanceData();
  } catch (err) {
    showToast("Error saving attendance", "error");
  }
}
