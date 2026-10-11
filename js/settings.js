/* 
  Settings Page Handler
  Supports Theme switching & Hindi/English Language Translation
*/

document.addEventListener("DOMContentLoaded", () => {
  const currentTheme = localStorage.getItem("edu_theme") || "light";
  const currentLang = localStorage.getItem("edu_lang") || "en";

  const themeSelect = document.getElementById("settingsThemeSelect");
  if (themeSelect) {
    themeSelect.value = currentTheme;
    themeSelect.addEventListener("change", (e) => {
      const val = e.target.value;
      document.documentElement.setAttribute("data-theme", val);
      localStorage.setItem("edu_theme", val);
      showToast(`Theme updated to ${val.toUpperCase()}`, "info");
    });
  }

  const langSelect = document.getElementById("settingsLangSelect");
  if (langSelect) {
    langSelect.value = currentLang;
    langSelect.addEventListener("change", (e) => {
      const val = e.target.value;
      localStorage.setItem("edu_lang", val);
      if (typeof applyLanguage === "function") {
        applyLanguage(val);
      }
      showToast(`Language changed to ${val === "hi" ? "Hindi (हिन्दी)" : "English"}`, "success");
    });
  }

  const saveBtn = document.getElementById("saveSettingsBtn");
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const tVal = themeSelect ? themeSelect.value : currentTheme;
      const lVal = langSelect ? langSelect.value : currentLang;

      localStorage.setItem("edu_theme", tVal);
      localStorage.setItem("edu_lang", lVal);
      document.documentElement.setAttribute("data-theme", tVal);

      if (typeof applyLanguage === "function") {
        applyLanguage(lVal);
      }

      showToast("Preferences saved successfully!", "success");
    });
  }
});
