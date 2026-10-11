/* 
  Course Management Logic
  - Admin & Faculty: Add, edit, and delete courses
  - Student: View-only curriculum & enrolled subjects
*/

let courseList = [];

document.addEventListener("DOMContentLoaded", () => {
  const user = typeof auth !== "undefined" ? auth.getCurrentUser() : null;
  const isStudent = user && user.role === "Student";

  const addBtn = document.getElementById("addCourseBtn");
  if (addBtn) {
    addBtn.style.display = isStudent ? "none" : "inline-flex";
  }

  loadCourses();
  const form = document.getElementById("addCourseForm");
  if (form) form.addEventListener("submit", handleAddCourse);
});

async function loadCourses() {
  try {
    courseList = await api.getCourses();
    renderCoursesTable(courseList);
  } catch (err) {
    showToast("Error loading courses", "error");
  }
}

function renderCoursesTable(courses) {
  const tbody = document.getElementById("coursesTableBody");
  if (!tbody) return;

  const isStudent = typeof auth !== "undefined" && auth.getCurrentUser()?.role === "Student";

  if (!courses || courses.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty-state">No courses added.</td></tr>`;
    return;
  }

  tbody.innerHTML = courses.map(c => `
    <tr>
      <td><strong>${c.courseId}</strong></td>
      <td><span class="badge badge-secondary">${c.code}</span></td>
      <td><strong>${c.name}</strong></td>
      <td>${c.department}</td>
      <td>Sem ${c.semester}</td>
      <td><span class="badge badge-info">${c.credits} Credits</span></td>
      <td>${c.faculty}</td>
      <td>
        ${isStudent ? '<span style="font-size:12px;color:var(--text-muted);">Enrolled</span>' : `<button class="btn btn-danger btn-sm btn-icon-only" onclick="deleteCourseItem(${c.id})" title="Delete Course"><i class="fas fa-trash"></i></button>`}
      </td>
    </tr>
  `).join("");
}

async function handleAddCourse(e) {
  e.preventDefault();
  const user = typeof auth !== "undefined" ? auth.getCurrentUser() : null;
  if (!user || user.role === "Student") {
    showToast("Permission denied: Students cannot create courses.", "warning");
    closeModal("addCourseModal");
    return;
  }

  if (!validation.validateRequiredFields("addCourseForm")) return;

  const data = {
    code: document.getElementById("crsCode").value,
    name: document.getElementById("crsName").value,
    department: document.getElementById("crsDept").value,
    semester: parseInt(document.getElementById("crsSem").value) || 1,
    credits: parseInt(document.getElementById("crsCredits").value) || 3,
    faculty: document.getElementById("crsFaculty").value,
    duration: "4 Months",
    status: "Active"
  };

  try {
    await api.createCourse(data);
    showToast("Course created successfully!", "success");
    closeModal("addCourseModal");
    document.getElementById("addCourseForm").reset();
    await loadCourses();
  } catch (err) {
    showToast("Error creating course", "error");
  }
}

function deleteCourseItem(id) {
  const user = typeof auth !== "undefined" ? auth.getCurrentUser() : null;
  if (!user || user.role === "Student") {
    showToast("Permission denied: Students cannot delete courses.", "warning");
    return;
  }

  showConfirm("Delete Course", "Are you sure you want to remove this course from curriculum?", async () => {
    try {
      await api.deleteCourse(id);
      showToast("Course removed successfully", "success");
      await loadCourses();
    } catch (err) {
      showToast("Failed to delete course", "error");
    }
  });
}
