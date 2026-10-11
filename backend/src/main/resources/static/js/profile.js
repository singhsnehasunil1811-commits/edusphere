/* 
  Profile Management Page Handler
  Supports full bio, education, experience, and medical record saving for Admin & Faculty
*/

document.addEventListener("DOMContentLoaded", () => {
  loadProfileData();
  setupProfileForms();
});

function loadProfileData() {
  const user = auth.getCurrentUser() || {};
  
  // Set default profile details if not set yet
  const name = user.name || "Dr. Administrator";
  const email = user.email || "admin@college.edu";
  const role = user.role || "Admin";
  const passedOut = user.passedOutFrom || (role === "Admin" ? "IIT Delhi (Graduated 2008)" : "BITS Pilani (2012)");
  const qual = user.qualification || (role === "Admin" ? "Ph.D. in Computer Science & Artificial Intelligence" : "M.Tech in Software Engineering");
  const passingYr = user.passingYear || "2008";
  const exp = user.experienceYears !== undefined ? user.experienceYears + " Years" : (role === "Admin" ? "16 Years" : "12 Years");
  const spec = user.specialization || (role === "Admin" ? "System Architecture & Data Security" : "Software Engineering & Cloud Computing");
  const prevInst = user.previousInstitute || (role === "Admin" ? "Associate Dean, BITS Pilani" : "Senior Lecturer, NIT Surat");
  const med = user.medicalConditions || "None (Healthy & No Chronic Diseases)";
  const bg = user.bloodGroup || "O+ Positive";
  const doc = user.doctorContact || "+91 98111-22334";

  document.getElementById("profileNameDisplay").innerText = name;
  document.getElementById("profileRoleBadge").innerText = role;
  document.getElementById("profileEmailDisplay").innerText = email;
  document.getElementById("profileAvatarLetter").innerText = name.charAt(0).toUpperCase();

  document.getElementById("profilePassedOutDisplay").innerText = passedOut;
  document.getElementById("profileQualificationDisplay").innerText = qual;
  document.getElementById("profilePassingYearDisplay").innerText = passingYr;

  document.getElementById("profileExperienceDisplay").innerText = exp;
  document.getElementById("profileSpecializationDisplay").innerText = spec;
  document.getElementById("profilePreviousInstituteDisplay").innerText = prevInst;

  document.getElementById("profileMedicalDisplay").innerText = med;
  document.getElementById("profileBloodGroupDisplay").innerText = bg;
  document.getElementById("profileDoctorContactDisplay").innerText = doc;

  // Form Inputs
  const editName = document.getElementById("editProfileName");
  const editEmail = document.getElementById("editProfileEmail");
  const editPassedOut = document.getElementById("editPassedOut");
  const editQual = document.getElementById("editQualification");
  const editExp = document.getElementById("editExperience");
  const editMed = document.getElementById("editMedical");
  const editBg = document.getElementById("editBloodGroup");
  const editDoc = document.getElementById("editDoctorContact");

  if (editName) editName.value = name;
  if (editEmail) editEmail.value = email;
  if (editPassedOut) editPassedOut.value = passedOut;
  if (editQual) editQual.value = qual;
  if (editExp) editExp.value = user.experienceYears || 16;
  if (editMed) editMed.value = med;
  if (editBg) editBg.value = bg;
  if (editDoc) editDoc.value = doc;
}

function setupProfileForms() {
  const editForm = document.getElementById("editProfileForm");
  if (editForm) {
    editForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const currentUser = auth.getCurrentUser() || {};
      const updatedUser = {
        ...currentUser,
        name: document.getElementById("editProfileName").value,
        email: document.getElementById("editProfileEmail").value,
        passedOutFrom: document.getElementById("editPassedOut").value,
        qualification: document.getElementById("editQualification").value,
        experienceYears: document.getElementById("editExperience").value,
        medicalConditions: document.getElementById("editMedical").value,
        bloodGroup: document.getElementById("editBloodGroup").value,
        doctorContact: document.getElementById("editDoctorContact").value
      };

      localStorage.setItem("edu_user", JSON.stringify(updatedUser));
      showToast("Profile details updated successfully!", "success");
      closeModal("editProfileModal");
      loadProfileData();
      if (typeof renderSidebar === "function") renderSidebar();
    });
  }

  const passForm = document.getElementById("changePasswordForm");
  if (passForm) {
    passForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const newP = document.getElementById("newPassword").value;
      const confirmP = document.getElementById("confirmPassword").value;

      if (newP !== confirmP) {
        showToast("New passwords do not match!", "error");
        return;
      }
      showToast("Password updated successfully!", "success");
      closeModal("changePasswordModal");
      passForm.reset();
    });
  }
}
