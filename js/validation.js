/* 
  EduPortal Client-Side Form Validation Module
*/

const validation = {
  isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  },

  isValidPhone(phone) {
    const re = /^(\+91[\-\s]?)?[0-9]{10}$/;
    return re.test(String(phone).trim());
  },

  isValidRollNumber(rollNo) {
    return rollNo && rollNo.trim().length >= 4;
  },

  validateRequiredFields(formId) {
    const form = document.getElementById(formId);
    if (!form) return true;

    let isValid = true;
    const inputs = form.querySelectorAll("[data-required='true'], [required]");

    inputs.forEach(input => {
      const val = input.value.trim();
      const parent = input.closest(".form-group") || input.parentElement;
      let errorElement = parent.querySelector(".form-error");

      if (!val) {
        isValid = false;
        input.classList.add("is-invalid");
        if (!errorElement) {
          errorElement = document.createElement("span");
          errorElement.className = "form-error";
          errorElement.innerText = "This field is required.";
          parent.appendChild(errorElement);
        }
        errorElement.style.display = "block";
      } else {
        input.classList.remove("is-invalid");
        if (errorElement) errorElement.style.display = "none";
      }
    });

    return isValid;
  },

  clearFormErrors(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    form.querySelectorAll(".is-invalid").forEach(el => el.classList.remove("is-invalid"));
    form.querySelectorAll(".form-error").forEach(el => el.style.display = "none");
  }
};
