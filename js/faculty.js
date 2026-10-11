/* 
  Faculty Management & Complaints Controller
  Role Authority Enforcement:
  - Admin: Can add faculty, delete faculty, view & manage student complaints
  - Faculty: Can view faculty directory, file student complaints
  - Student: Read-only directory view; no add/delete authority
*/

let facultyList = [];
let studentList = [];
let complaintsList = [];

document.addEventListener("DOMContentLoaded", () => {
  enforceRoleAuthority();
  loadFacultyData();
  loadComplaintsData();
  setupFacultyEvents();
});

function enforceRoleAuthority() {
  const user = auth.getCurrentUser() || {};
  const role = user.role || "Admin";

  const addBtn = document.getElementById("addFacultyBtn");
  const fileComplaintBtn = document.getElementById("fileComplaintBtn");
  const studentNotice = document.getElementById("studentNoticeBanner");
  const actionsHeader = document.getElementById("facActionsHeader");

  if (role === "Student") {
    if (addBtn) addBtn.style.display = "none";
    if (fileComplaintBtn) fileComplaintBtn.style.display = "none";
    if (studentNotice) studentNotice.style.display = "block";
    if (actionsHeader) actionsHeader.style.display = "none";
  } else if (role === "Faculty") {
    if (addBtn) addBtn.style.display = "none";
    if (fileComplaintBtn) fileComplaintBtn.style.display = "inline-flex";
  } else {
    // Admin
    if (addBtn) addBtn.style.display = "inline-flex";
    if (fileComplaintBtn) fileComplaintBtn.style.display = "inline-flex";
  }
}

async function loadFacultyData() {
  try {
    facultyList = await api.getFaculty();
    renderFacultyTable(facultyList);
  } catch (err) {
    showToast("Error loading faculty data", "error");
  }
}

async function loadComplaintsData() {
  try {
    complaintsList = await api.getComplaints();
    studentList = await api.getStudents();
    renderComplaintsTable(complaintsList);
    populateStudentSelect(studentList);
  } catch (err) {
    console.error(err);
  }
}

function setupFacultyEvents() {
  const search = document.getElementById("facultySearch");
  if (search) {
    search.addEventListener("input", () => {
      const q = search.value.toLowerCase();
      const filtered = facultyList.filter(f => 
        f.name.toLowerCase().includes(q) || 
        f.department.toLowerCase().includes(q) ||
        (f.passedOutFrom && f.passedOutFrom.toLowerCase().includes(q))
      );
      renderFacultyTable(filtered);
    });
  }

  const addForm = document.getElementById("addFacultyForm");
  if (addForm) {
    addForm.addEventListener("submit", handleAddFaculty);
  }

  const complaintForm = document.getElementById("fileComplaintForm");
  if (complaintForm) {
    complaintForm.addEventListener("submit", handleFileComplaint);
  }
}

function renderFacultyTable(data) {
  const tbody = document.getElementById("facultyTableBody");
  if (!tbody) return;

  const user = auth.getCurrentUser() || {};
  const isStudent = user.role === "Student";

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="${isStudent ? 7 : 8}" class="empty-state">No faculty members found.</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map(f => `
    <tr>
      <td><strong>${f.facultyId}</strong></td>
      <td>
        <div style="display:flex; align-items:center; gap:10px;">
          <div class="table-avatar" style="background:var(--primary-color); color:#fff; font-weight:700;">${f.name.charAt(0)}</div>
          <div>
            <div style="font-weight:700; color:var(--text-primary);">${f.name}</div>
            <div style="font-size:11px; color:var(--text-muted);">${f.qualification}</div>
          </div>
        </div>
      </td>
      <td><span style="font-weight:600; font-size:12px;">${f.passedOutFrom || 'IIT Delhi (2008)'}</span></td>
      <td><span class="badge badge-info">${f.experienceYears || 12} Years</span></td>
      <td>${f.department}</td>
      <td><span class="badge badge-success">${f.designation}</span></td>
      <td>
        <div style="font-size:12px; color:var(--text-secondary);">
          <i class="fas fa-heartbeat" style="color:var(--accent-2); margin-right:4px;"></i> ${f.medicalConditions || 'Healthy (No conditions)'}
        </div>
      </td>
      ${!isStudent ? `
      <td>
        <button class="btn btn-danger btn-sm btn-icon-only" onclick="deleteFacultyMember(${f.id})" title="Delete"><i class="fas fa-trash"></i></button>
      </td>` : ''}
    </tr>
  `).join("");
}

function populateStudentSelect(students) {
  const select = document.getElementById("complaintStudentSelect");
  if (!select) return;

  select.innerHTML = `<option value="">-- Select Student --</option>` + students.map(s => `
    <option value="${s.studentId}|${s.name}">${s.name} (${s.rollNo} - ${s.department})</option>
  `).join("");
}

function renderComplaintsTable(complaints) {
  const tbody = document.getElementById("complaintsTableBody");
  const badge = document.getElementById("complaintsCountBadge");
  if (!tbody) return;

  if (badge) badge.innerText = `${complaints.length} Logs`;

  if (!complaints || complaints.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty-state">No student complaints registered yet.</td></tr>`;
    return;
  }

  const user = auth.getCurrentUser() || {};
  const isAdmin = user.role === "Admin";

  tbody.innerHTML = complaints.map(c => `
    <tr>
      <td><span style="font-size:12px; color:var(--text-muted);">${c.date}</span></td>
      <td><strong>${c.studentName}</strong> <br><small style="color:var(--text-muted);">${c.studentId}</small></td>
      <td>${c.facultyName}</td>
      <td><span class="badge badge-info">${c.category}</span></td>
      <td>
        <span class="badge ${c.severity === 'Critical' ? 'badge-danger' : c.severity === 'High' ? 'badge-warning' : 'badge-secondary'}">
          ${c.severity}
        </span>
      </td>
      <td>
        <div style="font-size:12px;">${c.description}</div>
        <div style="font-size:11px; color:var(--primary-color); margin-top:2px;">Requested: ${c.actionRequested || 'Warning'}</div>
      </td>
      <td>
        <span class="badge ${c.status === 'Resolved' ? 'badge-success' : c.status === 'Under Review' ? 'badge-warning' : 'badge-danger'}">
          ${c.status}
        </span>
      </td>
      <td>
        ${isAdmin ? `
          <select class="form-control" style="font-size:11px; padding:4px 8px; width:auto;" onchange="updateComplaintStatus(${c.id}, this.value)">
            <option value="Pending" ${c.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="Under Review" ${c.status === 'Under Review' ? 'selected' : ''}>Under Review</option>
            <option value="Resolved" ${c.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
          </select>
        ` : `<span style="font-size:11px; color:var(--text-muted);">${c.status}</span>`}
      </td>
    </tr>
  `).join("");
}

async function handleAddFaculty(e) {
  e.preventDefault();
  if (!validation.validateRequiredFields("addFacultyForm")) return;

  const data = {
    name: document.getElementById("facName").value,
    email: document.getElementById("facEmail").value,
    phone: document.getElementById("facPhone").value,
    qualification: document.getElementById("facQualification").value,
    passedOutFrom: document.getElementById("facPassedOut").value,
    experienceYears: parseInt(document.getElementById("facExperience").value) || 5,
    department: document.getElementById("facDept").value,
    designation: document.getElementById("facDesignation").value,
    medicalConditions: document.getElementById("facMedical").value || "None (Healthy)",
    bloodGroup: document.getElementById("facBloodGroup").value || "O+ Positive",
    joiningDate: new Date().toISOString().split('T')[0]
  };

  try {
    await api.createFaculty(data);
    showToast("Faculty member added successfully!", "success");
    closeModal("addFacultyModal");
    document.getElementById("addFacultyForm").reset();
    await loadFacultyData();
  } catch (err) {
    showToast("Failed to add faculty member", "error");
  }
}

async function handleFileComplaint(e) {
  e.preventDefault();
  const studentVal = document.getElementById("complaintStudentSelect").value;
  if (!studentVal) {
    showToast("Please select a student", "error");
    return;
  }

  const [studentId, studentName] = studentVal.split("|");
  const user = auth.getCurrentUser() || {};

  const complaintData = {
    studentId,
    studentName,
    facultyName: user.name || "Faculty Member",
    facultyEmail: user.email || "faculty@college.edu",
    category: document.getElementById("complaintCategory").value,
    severity: document.getElementById("complaintSeverity").value,
    description: document.getElementById("complaintDescription").value,
    actionRequested: document.getElementById("complaintActionRequested").value || "Parent Notification & Warning",
  };

  try {
    await api.createComplaint(complaintData);
    showToast("Student complaint filed successfully!", "success");
    closeModal("fileComplaintModal");
    document.getElementById("fileComplaintForm").reset();
    await loadComplaintsData();
  } catch (err) {
    showToast("Failed to file complaint", "error");
  }
}

async function updateComplaintStatus(id, newStatus) {
  try {
    await api.updateComplaintStatus(id, newStatus);
    showToast(`Complaint status updated to ${newStatus}`, "info");
    await loadComplaintsData();
  } catch (err) {
    showToast("Failed to update complaint status", "error");
  }
}

function deleteFacultyMember(id) {
  showConfirm("Delete Faculty", "Are you sure you want to delete this faculty member?", async () => {
    try {
      await api.deleteFaculty(id);
      showToast("Faculty member removed", "success");
      await loadFacultyData();
    } catch (err) {
      showToast("Error removing faculty", "error");
    }
  });
}
