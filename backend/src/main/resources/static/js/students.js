/* 
  Student Management Page Controller
  Supports CRUD operations, search, filter, pagination, and modal forms
*/

let allStudents = [];
let filteredStudents = [];
let currentPage = 1;
const pageSize = 5;

document.addEventListener("DOMContentLoaded", () => {
  enforceRoleAuthority();
  loadStudentsData();
  setupEventListeners();
});

function enforceRoleAuthority() {
  const user = auth.getCurrentUser() || {};
  const addBtn = document.getElementById("addStudentBtn");
  if (user.role === "Student" && addBtn) {
    addBtn.style.display = "none";
  }
}

async function loadStudentsData() {
  try {
    allStudents = await api.getStudents();
    applyFilters();
  } catch (err) {
    showToast("Failed to fetch students data", "error");
  }
}

function setupEventListeners() {
  const searchInput = document.getElementById("studentSearchInput");
  const deptFilter = document.getElementById("deptFilterSelect");
  const yearFilter = document.getElementById("yearFilterSelect");

  if (searchInput) searchInput.addEventListener("input", applyFilters);
  if (deptFilter) deptFilter.addEventListener("change", applyFilters);
  if (yearFilter) yearFilter.addEventListener("change", applyFilters);

  const addForm = document.getElementById("addStudentForm");
  if (addForm) {
    addForm.addEventListener("submit", handleAddStudent);
  }

  const editForm = document.getElementById("editStudentForm");
  if (editForm) {
    editForm.addEventListener("submit", handleEditStudent);
  }
}

function applyFilters() {
  const search = (document.getElementById("studentSearchInput")?.value || "").toLowerCase();
  const dept = document.getElementById("deptFilterSelect")?.value || "ALL";
  const year = document.getElementById("yearFilterSelect")?.value || "ALL";

  filteredStudents = allStudents.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search) ||
      s.rollNo.toLowerCase().includes(search) ||
      s.email.toLowerCase().includes(search) ||
      s.studentId.toLowerCase().includes(search);
    const matchesDept = dept === "ALL" || s.department === dept;
    const matchesYear = year === "ALL" || s.year === year;

    return matchesSearch && matchesDept && matchesYear;
  });

  currentPage = 1;
  renderStudentsTable();
}

function renderStudentsTable() {
  const tbody = document.getElementById("studentsTableBody");
  const paginationInfo = document.getElementById("paginationInfo");
  const paginationControls = document.getElementById("paginationControls");
  if (!tbody) return;

  const user = auth.getCurrentUser() || {};
  const isStudent = user.role === "Student";
  const isAdmin = user.role === "Admin";
  const isFaculty = user.role === "Faculty";

  if (filteredStudents.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10">
          <div class="empty-state">
            <i class="fas fa-user-slash"></i>
            <h3>No Students Found</h3>
            <p>Try adjusting your search criteria or add a new student.</p>
          </div>
        </td>
      </tr>
    `;
    if (paginationInfo) paginationInfo.innerText = "Showing 0 of 0 students";
    if (paginationControls) paginationControls.innerHTML = "";
    return;
  }

  const start = (currentPage - 1) * pageSize;
  const end = Math.min(start + pageSize, filteredStudents.length);
  const pageItems = filteredStudents.slice(start, end);

  tbody.innerHTML = pageItems.map(s => `
    <tr>
      <td><strong>${s.studentId}</strong></td>
      <td>
        <div class="table-avatar" style="background:var(--primary-color); color:#fff; font-weight:700;">${s.name.charAt(0)}</div>
      </td>
      <td>
        <strong>${s.name}</strong>
        <div style="font-size:11px; color:var(--text-muted);">${s.gender}, DOB: ${s.dob || 'N/A'}</div>
      </td>
      <td>${s.rollNo}</td>
      <td>${s.department}</td>
      <td>${s.course}</td>
      <td><span class="badge badge-info">${s.year}</span></td>
      <td>${s.email}</td>
      <td><span class="badge badge-success">${s.status || "Active"}</span></td>
      <td>
        <div class="action-buttons">
          <button class="btn btn-secondary btn-sm btn-icon-only" onclick="viewStudentProfile('${s.id}')" title="View Profile"><i class="fas fa-eye"></i></button>
          ${!isStudent ? `<button class="btn btn-secondary btn-sm btn-icon-only" onclick="openEditStudentModal(${s.id})" title="Edit"><i class="fas fa-edit"></i></button>` : ''}
          ${!isStudent ? `<button class="btn btn-danger btn-sm btn-icon-only" onclick="confirmDeleteStudent(${s.id})" title="Delete"><i class="fas fa-trash-alt"></i></button>` : ''}
        </div>
      </td>
    </tr>
  `).join("");

  // Pagination UI
  const totalPages = Math.ceil(filteredStudents.length / pageSize);
  if (paginationInfo) {
    paginationInfo.innerText = `Showing ${start + 1} to ${end} of ${filteredStudents.length} students`;
  }

  if (paginationControls) {
    let btns = `<button class="page-btn" ${currentPage === 1 ? "disabled" : ""} onclick="changePage(${currentPage - 1})"><i class="fas fa-chevron-left"></i></button>`;
    for (let i = 1; i <= totalPages; i++) {
      btns += `<button class="page-btn ${i === currentPage ? "active" : ""}" onclick="changePage(${i})">${i}</button>`;
    }
    btns += `<button class="page-btn" ${currentPage === totalPages ? "disabled" : ""} onclick="changePage(${currentPage + 1})"><i class="fas fa-chevron-right"></i></button>`;
    paginationControls.innerHTML = btns;
  }
}

function changePage(page) {
  currentPage = page;
  renderStudentsTable();
}

// Add Student Handler
async function handleAddStudent(e) {
  e.preventDefault();
  const user = typeof auth !== "undefined" ? auth.getCurrentUser() : null;
  if (!user || user.role === "Student") {
    showToast("Permission denied: Students cannot add new students.", "warning");
    closeModal("addStudentModal");
    return;
  }
  if (!validation.validateRequiredFields("addStudentForm")) return;

  const data = {
    name: document.getElementById("addName").value,
    rollNo: document.getElementById("addRollNo").value,
    email: document.getElementById("addEmail").value,
    phone: document.getElementById("addPhone").value,
    gender: document.getElementById("addGender").value,
    dob: document.getElementById("addDob").value,
    department: document.getElementById("addDepartment").value,
    course: document.getElementById("addCourse").value,
    year: document.getElementById("addYear").value,
    semester: parseInt(document.getElementById("addSemester").value),
    division: document.getElementById("addDivision").value,
    address: document.getElementById("addAddress").value,
    admissionDate: document.getElementById("addAdmissionDate").value || new Date().toISOString().split('T')[0],
    status: "Active"
  };

  try {
    await api.createStudent(data);
    showToast("Student added successfully!", "success");
    closeModal("addStudentModal");
    document.getElementById("addStudentForm").reset();
    await loadStudentsData();
  } catch (err) {
    showToast("Failed to create student", "error");
  }
}

// Edit Student Modal Populate
function openEditStudentModal(id) {
  const s = allStudents.find(item => item.id === id);
  if (!s) return;

  document.getElementById("editStudentId").value = s.id;
  document.getElementById("editName").value = s.name;
  document.getElementById("editRollNo").value = s.rollNo;
  document.getElementById("editEmail").value = s.email;
  document.getElementById("editPhone").value = s.phone || "";
  document.getElementById("editGender").value = s.gender || "Male";
  document.getElementById("editDob").value = s.dob || "";
  document.getElementById("editDepartment").value = s.department;
  document.getElementById("editCourse").value = s.course;
  document.getElementById("editYear").value = s.year;
  document.getElementById("editSemester").value = s.semester || 1;
  document.getElementById("editDivision").value = s.division || "A";
  document.getElementById("editAddress").value = s.address || "";

  openModal("editStudentModal");
}

async function handleEditStudent(e) {
  e.preventDefault();
  const user = typeof auth !== "undefined" ? auth.getCurrentUser() : null;
  if (!user || user.role === "Student") {
    showToast("Permission denied: Students cannot edit student records.", "warning");
    closeModal("editStudentModal");
    return;
  }
  if (!validation.validateRequiredFields("editStudentForm")) return;

  const id = parseInt(document.getElementById("editStudentId").value);
  const data = {
    name: document.getElementById("editName").value,
    rollNo: document.getElementById("editRollNo").value,
    email: document.getElementById("editEmail").value,
    phone: document.getElementById("editPhone").value,
    gender: document.getElementById("editGender").value,
    dob: document.getElementById("editDob").value,
    department: document.getElementById("editDepartment").value,
    course: document.getElementById("editCourse").value,
    year: document.getElementById("editYear").value,
    semester: parseInt(document.getElementById("editSemester").value),
    division: document.getElementById("editDivision").value,
    address: document.getElementById("editAddress").value
  };

  try {
    await api.updateStudent(id, data);
    showToast("Student updated successfully!", "success");
    closeModal("editStudentModal");
    await loadStudentsData();
  } catch (err) {
    showToast("Failed to update student", "error");
  }
}

// Delete Confirmation
function confirmDeleteStudent(id) {
  const user = typeof auth !== "undefined" ? auth.getCurrentUser() : null;
  if (!user || user.role === "Student") {
    showToast("Permission denied: Students cannot delete student records.", "warning");
    return;
  }
  showConfirm("Delete Student", "Are you sure you want to delete this student record? This action cannot be undone.", async () => {
    try {
      await api.deleteStudent(id);
      showToast("Student deleted successfully", "success");
      await loadStudentsData();
    } catch (err) {
      showToast("Failed to delete student", "error");
    }
  });
}

function viewStudentProfile(id) {
  window.location.href = `student-profile.html?id=${id}`;
}
