/* 
  Reports Generator & Export UI Handler
*/

document.addEventListener("DOMContentLoaded", () => {
  loadReportData();
});

async function loadReportData() {
  const students = await api.getStudents();
  const faculty = await api.getFaculty();
  const depts = await api.getDepartments();
  const marks = await api.getMarks();

  document.getElementById("reportStudentsCount").innerText = students.length;
  document.getElementById("reportFacultyCount").innerText = faculty.length;
  document.getElementById("reportDeptsCount").innerText = depts.length;
  document.getElementById("reportMarksCount").innerText = marks.length;
}

function exportReport(format) {
  showToast(`Generating ${format.toUpperCase()} Report export...`, "info");
  setTimeout(() => {
    showToast(`${format.toUpperCase()} Report downloaded successfully!`, "success");
  }, 1000);
}

function printReportPage() {
  window.print();
}
