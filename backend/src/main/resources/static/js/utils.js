/* 
  EduPortal UI Utilities & Helper Functions
*/

// Toast Notification Manager
function showToast(message, type = "success") {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  const iconClass = type === "success" ? "fa-check-circle" : type === "error" ? "fa-exclamation-circle" : "fa-info-circle";

  toast.innerHTML = `
    <i class="fas ${iconClass}"></i>
    <span style="flex:1;">${message}</span>
    <button onclick="this.parentElement.remove()" style="color:inherit; opacity:0.6;"><i class="fas fa-times"></i></button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Modal Helpers
function openModal(modalId) {
  if (typeof auth !== "undefined") {
    const user = auth.getCurrentUser();
    if (user && user.role === "Student") {
      const restrictedModals = [
        "addMarksModal", "addExamModal", "addStudentModal",
        "editStudentModal", "addCourseModal", "addFacultyModal",
        "addDeptModal", "markAttendanceModal"
      ];
      if (restrictedModals.includes(modalId)) {
        showToast("Access Restricted: Only faculty and administration can perform this action.", "warning");
        return;
      }
    }
  }

  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("active");
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("active");
  }
}

// Global modal backdrop click listener
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-backdrop')) {
    e.target.classList.remove('active');
  }
});

// Global Confirmation Dialog
function showConfirm(title, message, callback) {
  let confirmModal = document.getElementById("confirmModal");
  if (!confirmModal) {
    confirmModal = document.createElement("div");
    confirmModal.id = "confirmModal";
    confirmModal.className = "modal-backdrop";
    confirmModal.innerHTML = `
      <div class="modal" style="max-width: 400px;">
        <div class="modal-header">
          <h3 class="modal-title" id="confirmTitle">${title}</h3>
          <button class="modal-close" onclick="closeModal('confirmModal')"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <p id="confirmMessage" style="color: var(--text-secondary);">${message}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('confirmModal')">Cancel</button>
          <button class="btn btn-danger" id="confirmActionBtn">Confirm</button>
        </div>
      </div>
    `;
    document.body.appendChild(confirmModal);
  } else {
    document.getElementById("confirmTitle").innerText = title;
    document.getElementById("confirmMessage").innerText = message;
  }

  const actionBtn = document.getElementById("confirmActionBtn");
  actionBtn.onclick = () => {
    closeModal("confirmModal");
    callback();
  };

  openModal("confirmModal");
}

// Marks & Grade Calculation System
function calculateGradeAndPercentage(internal, external) {
  const intVal = parseFloat(internal) || 0;
  const extVal = parseFloat(external) || 0;
  const total = intVal + extVal;
  const percentage = Math.min(100, Math.round(total));

  let grade = "F";
  let status = "Fail";

  if (percentage >= 90) { grade = "A+"; status = "Pass"; }
  else if (percentage >= 80) { grade = "A"; status = "Pass"; }
  else if (percentage >= 70) { grade = "B+"; status = "Pass"; }
  else if (percentage >= 60) { grade = "B"; status = "Pass"; }
  else if (percentage >= 50) { grade = "C"; status = "Pass"; }
  else if (percentage >= 40) { grade = "D"; status = "Pass"; }
  else { grade = "F"; status = "Fail"; }

  return { totalMarks: total, percentage, grade, status };
}

// Attendance Percentage & Badge Helper
function calculateAttendancePercentage(present, total) {
  const p = parseInt(present) || 0;
  const t = parseInt(total) || 1;
  const percentage = Math.round((p / t) * 100);
  const status = percentage >= 75 ? "Good" : "Low";
  return { percentage, status };
}

// Format Date to User Friendly String
function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
