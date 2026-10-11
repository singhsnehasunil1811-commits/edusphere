/* 
  Examinations & Result Card Generator Logic
  - Admin & Faculty: Can schedule exams, cancel exams, and view all student results
  - Student: View-only timetable schedule and personal published result cards
*/

let examList = [];

document.addEventListener("DOMContentLoaded", () => {
  const user = typeof auth !== "undefined" ? auth.getCurrentUser() : null;
  const isStudent = user && user.role === "Student";

  // Hide Schedule button for students
  const schedBtn = document.getElementById("scheduleExamBtn");
  if (schedBtn) {
    schedBtn.style.display = isStudent ? "none" : "inline-flex";
  }

  // Pre-fill exam date if empty
  const dateInput = document.getElementById("examDateInput");
  if (dateInput && !dateInput.value) {
    const d = new Date();
    d.setDate(d.getDate() + 14); // 2 weeks ahead
    dateInput.value = d.toISOString().split("T")[0];
  }

  loadExaminations();

  const form = document.getElementById("addExamForm");
  if (form) form.addEventListener("submit", handleAddExam);
});

async function loadExaminations() {
  try {
    examList = await api.getExaminations();
    renderExamsTable(examList);
    await loadResultCardPreview();
  } catch (err) {
    console.error("Error loading examinations:", err);
    showToast("Error loading examinations", "error");
  }
}

function renderExamsTable(list) {
  const tbody = document.getElementById("examTableBody");
  if (!tbody) return;

  const isStudent = typeof auth !== "undefined" && auth.getCurrentUser()?.role === "Student";

  if (!list || list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty-state">No scheduled exams in timetable.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(e => `
    <tr>
      <td><strong>${e.examName}</strong></td>
      <td>Semester ${e.semester}</td>
      <td><strong>${e.subject}</strong></td>
      <td>${formatDate(e.examDate)}</td>
      <td><span class="badge badge-info">${e.examType}</span></td>
      <td><span class="badge badge-success">${e.status}</span></td>
      <td>
        ${isStudent ? '<span style="font-size:12px;color:var(--text-muted);">View Only</span>' : `<button class="btn btn-danger btn-sm btn-icon-only" onclick="deleteExamSchedule(${e.id})" title="Cancel Exam Schedule"><i class="fas fa-trash"></i></button>`}
      </td>
    </tr>
  `).join("");
}

async function loadResultCardPreview() {
  const container = document.getElementById("resultCardsContainer");
  if (!container) return;

  const marks = await api.getMarks();
  const user = typeof auth !== "undefined" ? auth.getCurrentUser() : null;
  const isStudent = user && user.role === "Student";

  // If student, filter to only their results
  let displayMarks = marks;
  if (isStudent) {
    const sid = user.studentId || "STU-1001";
    displayMarks = marks.filter(m => m.studentId === sid);
  }

  if (!displayMarks || displayMarks.length === 0) {
    container.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;">No semester result cards published yet.</div>`;
    return;
  }

  container.innerHTML = displayMarks.map(m => `
    <div class="card" style="margin-bottom:0; border-left: 4px solid ${m.percentage >= 40 ? 'var(--success-color)' : 'var(--danger-color)'};">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
        <div>
          <h3 style="font-size:16px; font-weight:700; color:var(--text-primary);">${m.studentName}</h3>
          <span style="font-size:12px; color:var(--text-muted);">ID: ${m.studentId} | Sem ${m.semester}</span>
        </div>
        <span class="badge ${m.percentage >= 40 ? 'badge-success' : 'badge-danger'}">${m.percentage >= 40 ? 'PASSED' : 'FAILED'}</span>
      </div>
      
      <div style="background-color:var(--bg-tertiary); padding:12px; border-radius:var(--radius-sm); margin-bottom:12px;">
        <div style="font-weight:600; font-size:13px; color:var(--text-primary);">${m.subject}</div>
        <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-secondary); margin-top:4px;">
          <span>Internal: ${m.internalMarks}/30</span>
          <span>External: ${m.externalMarks}/70</span>
        </div>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-color); padding-top:10px;">
        <div>
          <span style="font-size:11px; color:var(--text-muted); display:block;">FINAL GRADE</span>
          <strong style="font-size:16px; color:var(--primary-color);">${m.grade} (${m.percentage}%)</strong>
        </div>
        <button class="btn btn-secondary btn-sm print-keep" onclick="printResultCard('${m.studentId}')"><i class="fas fa-print"></i> Print Result</button>
      </div>
    </div>
  `).join("");
}

async function handleAddExam(e) {
  e.preventDefault();
  const user = typeof auth !== "undefined" ? auth.getCurrentUser() : null;
  if (!user || user.role === "Student") {
    showToast("Permission denied: Students cannot schedule exams.", "warning");
    closeModal("addExamModal");
    return;
  }

  const titleEl = document.getElementById("examTitle");
  const semEl = document.getElementById("examSem");
  const subEl = document.getElementById("examSubject");
  const dateEl = document.getElementById("examDateInput");
  const typeEl = document.getElementById("examTypeSelect");

  if (!titleEl.value.trim() || !subEl.value.trim() || !dateEl.value) {
    showToast("Please fill all required fields (*)", "warning");
    return;
  }

  const data = {
    examName: titleEl.value.trim(),
    semester: parseInt(semEl.value) || 5,
    subject: subEl.value.trim(),
    examDate: dateEl.value,
    examType: typeEl.value || "End-Term",
    status: "Scheduled"
  };

  try {
    await api.createExamination(data);
    showToast("Exam scheduled successfully!", "success");
    closeModal("addExamModal");
    document.getElementById("addExamForm").reset();
    await loadExaminations();
  } catch (err) {
    console.error("Error scheduling exam:", err);
    showToast("Error scheduling exam. Please try again.", "error");
  }
}

window.deleteExamSchedule = async function(id) {
  const user = typeof auth !== "undefined" ? auth.getCurrentUser() : null;
  if (!user || user.role === "Student") {
    showToast("Permission denied: Students cannot delete exams.", "warning");
    return;
  }
  showConfirm("Cancel Examination", "Are you sure you want to remove this scheduled exam?", async () => {
    try {
      await api.deleteExamination(id);
      showToast("Exam schedule removed successfully!", "success");
      await loadExaminations();
    } catch (err) {
      console.error("Error deleting exam:", err);
      showToast("Failed to delete exam schedule", "error");
    }
  });
};

function printResultCard(studentId) {
  window.print();
}
