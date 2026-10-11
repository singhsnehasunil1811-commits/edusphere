/* 
  Department Management Logic
*/

let departmentList = [];

document.addEventListener("DOMContentLoaded", () => {
  loadDepartments();
  const form = document.getElementById("addDeptForm");
  if (form) form.addEventListener("submit", handleAddDept);
});

async function loadDepartments() {
  try {
    departmentList = await api.getDepartments();
    renderDepartmentsGrid(departmentList);
  } catch (err) {
    showToast("Error loading departments", "error");
  }
}

function renderDepartmentsGrid(depts) {
  const container = document.getElementById("deptContainer");
  if (!container) return;

  if (depts.length === 0) {
    container.innerHTML = `<div class="empty-state">No departments created yet.</div>`;
    return;
  }

  container.innerHTML = depts.map(d => `
    <div class="card" style="margin-bottom:0;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px;">
        <div>
          <span class="badge badge-secondary">${d.deptId}</span>
          <h3 style="font-size:16px; font-weight:700; margin-top:6px; color:var(--text-primary);">${d.name}</h3>
        </div>
        <button class="btn btn-danger btn-sm btn-icon-only" onclick="deleteDept(${d.id})" title="Delete"><i class="fas fa-trash"></i></button>
      </div>
      <div style="font-size:13px; color:var(--text-secondary); margin-bottom:12px;">
        <i class="fas fa-user-tie" style="color:var(--primary-color); margin-right:6px;"></i> HOD: <strong>${d.head}</strong>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-muted); border-top:1px solid var(--border-color); padding-top:12px;">
        <span><i class="fas fa-user-graduate"></i> ${d.studentsCount || 0} Students</span>
        <span><i class="fas fa-chalkboard-teacher"></i> ${d.facultyCount || 0} Faculty</span>
      </div>
    </div>
  `).join("");
}

async function handleAddDept(e) {
  e.preventDefault();
  if (!validation.validateRequiredFields("addDeptForm")) return;

  const data = {
    name: document.getElementById("deptName").value,
    head: document.getElementById("deptHead").value,
    studentsCount: parseInt(document.getElementById("deptStudentsCount").value) || 0,
    facultyCount: parseInt(document.getElementById("deptFacultyCount").value) || 0,
    status: "Active"
  };

  try {
    await api.createDepartment(data);
    showToast("Department created!", "success");
    closeModal("addDeptModal");
    document.getElementById("addDeptForm").reset();
    await loadDepartments();
  } catch (err) {
    showToast("Error creating department", "error");
  }
}

function deleteDept(id) {
  showConfirm("Delete Department", "Are you sure you want to delete this department?", async () => {
    try {
      await api.deleteDepartment(id);
      showToast("Department deleted", "success");
      await loadDepartments();
    } catch (err) {
      showToast("Error deleting department", "error");
    }
  });
}
