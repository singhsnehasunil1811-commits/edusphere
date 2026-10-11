/* 
  EduPortal Centralized API Service Layer
  Provides mock REST API endpoints stored in localStorage with fetch-ready architecture
  Target Backend: Java Spring Boot REST API (http://localhost:8080/api)
*/

const API_BASE_URL = "http://localhost:8080/api";
const USE_MOCK_DATA = true; // Toggle to false when Spring Boot backend is connected

// Initial Mock Seed Data
const DEFAULT_DEPARTMENTS = [
  { id: 1, deptId: "DEP-101", name: "Computer Science & Engineering", head: "Dr. Rajesh Kumar", studentsCount: 180, facultyCount: 12, status: "Active" },
  { id: 2, deptId: "DEP-102", name: "Information Technology", head: "Dr. Meera Nambiar", studentsCount: 120, facultyCount: 9, status: "Active" },
  { id: 3, deptId: "DEP-103", name: "Electronics & Communication", head: "Prof. Vikram Malhotra", studentsCount: 140, facultyCount: 10, status: "Active" },
  { id: 4, deptId: "DEP-104", name: "Mechanical Engineering", head: "Dr. Suresh Patil", studentsCount: 95, facultyCount: 8, status: "Active" }
];

const DEFAULT_COURSES = [
  { id: 1, courseId: "CRS-201", code: "CS301", name: "Data Structures & Algorithms", department: "Computer Science & Engineering", duration: "4 Months", semester: 3, credits: 4, faculty: "Dr. Rajesh Kumar", status: "Active" },
  { id: 2, courseId: "CRS-202", code: "CS302", name: "Full Stack Java Development", department: "Computer Science & Engineering", duration: "4 Months", semester: 5, credits: 4, faculty: "Prof. Sunita Patel", status: "Active" },
  { id: 3, courseId: "CRS-203", code: "IT401", name: "Database Management Systems", department: "Information Technology", duration: "4 Months", semester: 4, credits: 3, faculty: "Dr. Meera Nambiar", status: "Active" },
  { id: 4, courseId: "CRS-204", code: "EC205", name: "Microprocessors & Embedded Systems", department: "Electronics & Communication", duration: "4 Months", semester: 4, credits: 4, faculty: "Prof. Vikram Malhotra", status: "Active" }
];

const DEFAULT_FACULTY = [
  { id: 1, facultyId: "FAC-001", name: "Dr. Rajesh Kumar", email: "rajesh.kumar@college.edu", phone: "+91 9876543210", department: "Computer Science & Engineering", designation: "Professor & HOD", joiningDate: "2015-06-15", qualification: "Ph.D. in Computer Science", passedOutFrom: "IIT Delhi (2008)", experienceYears: 16, medicalConditions: "None (Healthy)", bloodGroup: "O+ Positive", doctorContact: "+91 98111-22334" },
  { id: 2, facultyId: "FAC-002", name: "Prof. Sunita Patel", email: "sunita.patel@college.edu", phone: "+91 9876543211", department: "Computer Science & Engineering", designation: "Associate Professor", joiningDate: "2018-08-10", qualification: "M.Tech in Software Engineering", passedOutFrom: "BITS Pilani (2012)", experienceYears: 12, medicalConditions: "Mild Asthma", bloodGroup: "B+ Positive", doctorContact: "+91 98222-33445" },
  { id: 3, facultyId: "FAC-003", name: "Dr. Meera Nambiar", email: "meera.nambiar@college.edu", phone: "+91 9876543212", department: "Information Technology", designation: "Professor & HOD", joiningDate: "2016-01-20", qualification: "Ph.D. in Data Science", passedOutFrom: "IISc Bangalore (2010)", experienceYears: 14, medicalConditions: "None (Healthy)", bloodGroup: "A+ Positive", doctorContact: "+91 98333-44556" },
  { id: 4, facultyId: "FAC-004", name: "Prof. Vikram Malhotra", email: "vikram.m@college.edu", phone: "+91 9876543213", department: "Electronics & Communication", designation: "Assistant Professor", joiningDate: "2020-07-01", qualification: "M.Tech in VLSI", passedOutFrom: "IIT Bombay (2015)", experienceYears: 8, medicalConditions: "Hypertension (Controlled)", bloodGroup: "AB+ Positive", doctorContact: "+91 98444-55667" }
];

const DEFAULT_STUDENTS = [
  { id: 1, studentId: "STU-1001", rollNo: "21CS001", name: "Aarav Sharma", email: "aarav.sharma@student.edu", phone: "+91 9123456780", gender: "Male", dob: "2002-05-14", department: "Computer Science & Engineering", course: "B.Tech CSE", year: "3rd Year", semester: 5, division: "A", address: "Mumbai, Maharashtra", admissionDate: "2021-08-10", status: "Active", photo: "" },
  { id: 2, studentId: "STU-1002", rollNo: "21CS002", name: "Ananya Verma", email: "ananya.v@student.edu", phone: "+91 9123456781", gender: "Female", dob: "2003-01-22", department: "Computer Science & Engineering", course: "B.Tech CSE", year: "3rd Year", semester: 5, division: "A", address: "Pune, Maharashtra", admissionDate: "2021-08-12", status: "Active", photo: "" },
  { id: 3, studentId: "STU-1003", rollNo: "21IT015", name: "Rohan Gupta", email: "rohan.g@student.edu", phone: "+91 9123456782", gender: "Male", dob: "2002-11-05", department: "Information Technology", course: "B.Tech IT", year: "2nd Year", semester: 3, division: "B", address: "Bengaluru, Karnataka", admissionDate: "2022-09-01", status: "Active", photo: "" },
  { id: 4, studentId: "STU-1004", rollNo: "21EC044", name: "Priya Deshmukh", email: "priya.d@student.edu", phone: "+91 9123456783", gender: "Female", dob: "2003-03-30", department: "Electronics & Communication", course: "B.Tech ECE", year: "4th Year", semester: 7, division: "A", address: "Hyderabad, Telangana", admissionDate: "2020-08-05", status: "Active", photo: "" }
];

const DEFAULT_COMPLAINTS = [
  { id: 1, studentId: "STU-1003", studentName: "Rohan Gupta", facultyName: "Prof. Sunita Patel", facultyEmail: "sunita.patel@college.edu", category: "Low Attendance & Assignments Deficit", severity: "High", description: "Student has missed consecutive labs and failed to submit DBMS Assignment 2.", date: "2026-10-08", status: "Pending", actionRequested: "Parent Notification & Counseling" },
  { id: 2, studentId: "STU-1001", studentName: "Aarav Sharma", facultyName: "Dr. Rajesh Kumar", facultyEmail: "rajesh.kumar@college.edu", category: "Disciplinary Warning", severity: "Medium", description: "Disruption during Operating Systems lecture on Oct 5th.", date: "2026-10-06", status: "Under Review", actionRequested: "Warning Letter" }
];

const DEFAULT_MARKS = [
  // Aarav Sharma (STU-1001)
  { id: 1,  studentId: "STU-1001", studentName: "Aarav Sharma",   subject: "Full Stack Java Development",    subjectCode: "CS302", internalMarks: 28, externalMarks: 62, totalMarks: 90, grade: "A+", percentage: 90, semester: 5, examType: "Regular" },
  { id: 2,  studentId: "STU-1001", studentName: "Aarav Sharma",   subject: "Data Structures & Algorithms",     subjectCode: "CS301", internalMarks: 25, externalMarks: 58, totalMarks: 83, grade: "A",  percentage: 83, semester: 5, examType: "Regular" },
  { id: 3,  studentId: "STU-1001", studentName: "Aarav Sharma",   subject: "Operating Systems",               subjectCode: "CS303", internalMarks: 27, externalMarks: 55, totalMarks: 82, grade: "A",  percentage: 82, semester: 5, examType: "Regular" },
  { id: 4,  studentId: "STU-1001", studentName: "Aarav Sharma",   subject: "Computer Networks",               subjectCode: "CS304", internalMarks: 22, externalMarks: 48, totalMarks: 70, grade: "B+", percentage: 70, semester: 5, examType: "Regular" },
  { id: 5,  studentId: "STU-1001", studentName: "Aarav Sharma",   subject: "Software Engineering",            subjectCode: "CS305", internalMarks: 29, externalMarks: 65, totalMarks: 94, grade: "A+", percentage: 94, semester: 5, examType: "Regular" },
  // Ananya Verma (STU-1002)
  { id: 6,  studentId: "STU-1002", studentName: "Ananya Verma",   subject: "Full Stack Java Development",    subjectCode: "CS302", internalMarks: 26, externalMarks: 58, totalMarks: 84, grade: "A",  percentage: 84, semester: 5, examType: "Regular" },
  { id: 7,  studentId: "STU-1002", studentName: "Ananya Verma",   subject: "Data Structures & Algorithms",     subjectCode: "CS301", internalMarks: 29, externalMarks: 63, totalMarks: 92, grade: "A+", percentage: 92, semester: 5, examType: "Regular" },
  { id: 8,  studentId: "STU-1002", studentName: "Ananya Verma",   subject: "Operating Systems",               subjectCode: "CS303", internalMarks: 24, externalMarks: 52, totalMarks: 76, grade: "B+", percentage: 76, semester: 5, examType: "Regular" },
  { id: 9,  studentId: "STU-1002", studentName: "Ananya Verma",   subject: "Computer Networks",               subjectCode: "CS304", internalMarks: 27, externalMarks: 61, totalMarks: 88, grade: "A",  percentage: 88, semester: 5, examType: "Regular" },
  { id: 10, studentId: "STU-1002", studentName: "Ananya Verma",   subject: "Software Engineering",            subjectCode: "CS305", internalMarks: 23, externalMarks: 49, totalMarks: 72, grade: "B+", percentage: 72, semester: 5, examType: "Regular" },
  // Rohan Gupta (STU-1003)
  { id: 11, studentId: "STU-1003", studentName: "Rohan Gupta",    subject: "Database Management Systems",    subjectCode: "IT401", internalMarks: 22, externalMarks: 53, totalMarks: 75, grade: "B+", percentage: 75, semester: 3, examType: "Regular" },
  { id: 12, studentId: "STU-1003", studentName: "Rohan Gupta",    subject: "Web Technologies",                subjectCode: "IT402", internalMarks: 19, externalMarks: 43, totalMarks: 62, grade: "B",  percentage: 62, semester: 3, examType: "Regular" },
  { id: 13, studentId: "STU-1003", studentName: "Rohan Gupta",    subject: "Python Programming",              subjectCode: "IT403", internalMarks: 25, externalMarks: 57, totalMarks: 82, grade: "A",  percentage: 82, semester: 3, examType: "Regular" },
  { id: 14, studentId: "STU-1003", studentName: "Rohan Gupta",    subject: "Computer Organization",          subjectCode: "IT404", internalMarks: 18, externalMarks: 37, totalMarks: 55, grade: "C",  percentage: 55, semester: 3, examType: "Regular" },
  // Priya Deshmukh (STU-1004)
  { id: 15, studentId: "STU-1004", studentName: "Priya Deshmukh", subject: "Microprocessors & Embedded Systems", subjectCode: "EC205", internalMarks: 27, externalMarks: 60, totalMarks: 87, grade: "A",  percentage: 87, semester: 7, examType: "Regular" },
  { id: 16, studentId: "STU-1004", studentName: "Priya Deshmukh", subject: "Digital Signal Processing",      subjectCode: "EC206", internalMarks: 24, externalMarks: 54, totalMarks: 78, grade: "B+", percentage: 78, semester: 7, examType: "Regular" },
  { id: 17, studentId: "STU-1004", studentName: "Priya Deshmukh", subject: "VLSI Design",                    subjectCode: "EC207", internalMarks: 29, externalMarks: 64, totalMarks: 93, grade: "A+", percentage: 93, semester: 7, examType: "Regular" },
  { id: 18, studentId: "STU-1004", studentName: "Priya Deshmukh", subject: "Antenna Theory",                 subjectCode: "EC208", internalMarks: 20, externalMarks: 45, totalMarks: 65, grade: "B",  percentage: 65, semester: 7, examType: "Regular" }
];

const DEFAULT_ATTENDANCE = [
  { id: 1, studentId: "STU-1001", studentName: "Aarav Sharma",   subject: "Full Stack Java Development",    date: "2026-09-25", status: "Present", totalClasses: 40, presentClasses: 36, percentage: 90 },
  { id: 2, studentId: "STU-1001", studentName: "Aarav Sharma",   subject: "Data Structures & Algorithms",     date: "2026-09-25", status: "Present", totalClasses: 38, presentClasses: 35, percentage: 92 },
  { id: 3, studentId: "STU-1001", studentName: "Aarav Sharma",   subject: "Operating Systems",               date: "2026-09-25", status: "Present", totalClasses: 36, presentClasses: 30, percentage: 83 },
  { id: 4, studentId: "STU-1001", studentName: "Aarav Sharma",   subject: "Computer Networks",               date: "2026-09-25", status: "Absent",  totalClasses: 35, presentClasses: 25, percentage: 71 },
  { id: 5, studentId: "STU-1001", studentName: "Aarav Sharma",   subject: "Software Engineering",            date: "2026-09-25", status: "Present", totalClasses: 40, presentClasses: 38, percentage: 95 },
  { id: 6, studentId: "STU-1002", studentName: "Ananya Verma",   subject: "Full Stack Java Development",    date: "2026-09-25", status: "Present", totalClasses: 40, presentClasses: 38, percentage: 95 },
  { id: 7, studentId: "STU-1002", studentName: "Ananya Verma",   subject: "Data Structures & Algorithms",     date: "2026-09-25", status: "Present", totalClasses: 38, presentClasses: 37, percentage: 97 },
  { id: 8, studentId: "STU-1002", studentName: "Ananya Verma",   subject: "Operating Systems",               date: "2026-09-25", status: "Present", totalClasses: 36, presentClasses: 32, percentage: 89 },
  { id: 9, studentId: "STU-1002", studentName: "Ananya Verma",   subject: "Computer Networks",               date: "2026-09-25", status: "Present", totalClasses: 35, presentClasses: 33, percentage: 94 },
  { id: 10,studentId: "STU-1002", studentName: "Ananya Verma",   subject: "Software Engineering",            date: "2026-09-25", status: "Absent",  totalClasses: 40, presentClasses: 28, percentage: 70 },
  { id: 11,studentId: "STU-1003", studentName: "Rohan Gupta",    subject: "Database Management Systems",    date: "2026-09-25", status: "Absent",  totalClasses: 40, presentClasses: 28, percentage: 70 },
  { id: 12,studentId: "STU-1003", studentName: "Rohan Gupta",    subject: "Web Technologies",                date: "2026-09-25", status: "Present", totalClasses: 36, presentClasses: 30, percentage: 83 },
  { id: 13,studentId: "STU-1003", studentName: "Rohan Gupta",    subject: "Python Programming",              date: "2026-09-25", status: "Present", totalClasses: 38, presentClasses: 36, percentage: 95 },
  { id: 14,studentId: "STU-1003", studentName: "Rohan Gupta",    subject: "Computer Organization",          date: "2026-09-25", status: "Absent",  totalClasses: 35, presentClasses: 22, percentage: 63 },
  { id: 15,studentId: "STU-1004", studentName: "Priya Deshmukh", subject: "Microprocessors & Embedded Systems", date: "2026-09-25", status: "Present", totalClasses: 40, presentClasses: 37, percentage: 93 },
  { id: 16,studentId: "STU-1004", studentName: "Priya Deshmukh", subject: "Digital Signal Processing",      date: "2026-09-25", status: "Present", totalClasses: 38, presentClasses: 34, percentage: 89 },
  { id: 17,studentId: "STU-1004", studentName: "Priya Deshmukh", subject: "VLSI Design",                    date: "2026-09-25", status: "Present", totalClasses: 36, presentClasses: 35, percentage: 97 },
  { id: 18,studentId: "STU-1004", studentName: "Priya Deshmukh", subject: "Antenna Theory",                 date: "2026-09-25", status: "Absent",  totalClasses: 35, presentClasses: 24, percentage: 69 }
];

const DEFAULT_HOMEWORK_ASSIGNMENTS = [
  {
    id: 1,
    title: "Java OOP, Multithreading & Concurrency",
    subject: "Full Stack Java Development",
    subjectCode: "CS302",
    semester: 5,
    dueDate: "2026-10-25",
    facultyName: "Prof. Sunita Patel",
    facultyEmail: "sunita.patel@college.edu",
    description: "Answer the conceptual MCQs on thread life-cycle, synchronization, and collections. Upload your code or dry-run PDF if required.",
    allowPdfUpload: true,
    createdAt: "2026-10-05",
    questions: [
      {
        id: 1,
        question: "Which interface must a class implement to define an executable thread task in Java?",
        options: ["Runnable", "Callable", "Threadable", "Process"],
        correctOption: 0
      },
      {
        id: 2,
        question: "Which keyword prevents race conditions when accessing a critical section or shared method?",
        options: ["volatile", "synchronized", "transient", "atomic"],
        correctOption: 1
      },
      {
        id: 3,
        question: "Which Java collection class does NOT permit duplicate elements?",
        options: ["ArrayList", "LinkedList", "HashSet", "Vector"],
        correctOption: 2
      }
    ]
  },
  {
    id: 2,
    title: "Binary Search Trees & Traversal Techniques",
    subject: "Data Structures & Algorithms",
    subjectCode: "CS301",
    semester: 5,
    dueDate: "2026-10-28",
    facultyName: "Dr. Rajesh Kumar",
    facultyEmail: "rajesh.kumar@college.edu",
    description: "Complete the tree traversal & complexity questions. Handwritten dry-run or diagram PDF upload is encouraged.",
    allowPdfUpload: true,
    createdAt: "2026-10-06",
    questions: [
      {
        id: 1,
        question: "What is the average-case time complexity of searching in a balanced Binary Search Tree?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        correctOption: 1
      },
      {
        id: 2,
        question: "Which traversal of a Binary Search Tree produces elements in sorted ascending sequence?",
        options: ["Pre-order", "In-order", "Post-order", "Level-order"],
        correctOption: 1
      }
    ]
  },
  {
    id: 3,
    title: "Database Normalization & Relational Schema",
    subject: "Database Management Systems",
    subjectCode: "CS303",
    semester: 5,
    dueDate: "2026-10-30",
    facultyName: "Prof. Sunita Patel",
    facultyEmail: "sunita.patel@college.edu",
    description: "Solve the functional dependency and normalization MCQs. PDF upload is optional.",
    allowPdfUpload: false,
    createdAt: "2026-10-08",
    questions: [
      {
        id: 1,
        question: "Which normal form strictly eliminates transitive functional dependencies?",
        options: ["1NF", "2NF", "3NF", "BCNF"],
        correctOption: 2
      },
      {
        id: 2,
        question: "Which SQL clause is used to filter records after aggregation with GROUP BY?",
        options: ["WHERE", "HAVING", "ORDER BY", "FILTER"],
        correctOption: 1
      }
    ]
  }
];

const DEFAULT_HOMEWORK_SUBMISSIONS = [
  {
    id: 1,
    assignmentId: 1,
    studentId: "STU-1001",
    studentName: "Aarav Sharma",
    completedDate: "09 Oct 2026, 02:30 PM",
    score: 3,
    totalQuestions: 3,
    percentage: 100,
    answers: [0, 1, 2],
    uploadedFileName: "Java_Multithreading_Solution_Aarav.pdf",
    uploadedFileSize: "420 KB",
    status: "Completed"
  }
];

const DEFAULT_HOMEWORK = [
  { id: 1,  studentId: "STU-1001", studentName: "Aarav Sharma",   subject: "Full Stack Java Development",    month: "Jun", total: 1, completed: 1, percentage: 100 },
  { id: 2,  studentId: "STU-1001", studentName: "Aarav Sharma",   subject: "Data Structures & Algorithms",     month: "Jun", total: 1, completed: 0, percentage: 0  },
  { id: 3,  studentId: "STU-1001", studentName: "Aarav Sharma",   subject: "Database Management Systems",     month: "Jun", total: 1, completed: 0, percentage: 0  }
];

const DEFAULT_MONTHLY_PERFORMANCE = [
  // Aarav Sharma (STU-1001) — 1 completed out of 3 = 33% in active month Oct
  { studentId: "STU-1001", month: "May",  avgMarks: 75, attendance: 82, homeworkDone: 0 },
  { studentId: "STU-1001", month: "Jun",  avgMarks: 80, attendance: 85, homeworkDone: 0 },
  { studentId: "STU-1001", month: "Jul",  avgMarks: 83, attendance: 88, homeworkDone: 0 },
  { studentId: "STU-1001", month: "Aug",  avgMarks: 86, attendance: 90, homeworkDone: 0 },
  { studentId: "STU-1001", month: "Sep",  avgMarks: 84, attendance: 87, homeworkDone: 0 },
  { studentId: "STU-1001", month: "Oct",  avgMarks: 90, attendance: 92, homeworkDone: 33 },
  // Ananya Verma (STU-1002) — 0 attempts = 0% across all months
  { studentId: "STU-1002", month: "May",  avgMarks: 82, attendance: 90, homeworkDone: 0 },
  { studentId: "STU-1002", month: "Jun",  avgMarks: 85, attendance: 92, homeworkDone: 0 },
  { studentId: "STU-1002", month: "Jul",  avgMarks: 88, attendance: 95, homeworkDone: 0 },
  { studentId: "STU-1002", month: "Aug",  avgMarks: 86, attendance: 93, homeworkDone: 0 },
  { studentId: "STU-1002", month: "Sep",  avgMarks: 90, attendance: 96, homeworkDone: 0 },
  { studentId: "STU-1002", month: "Oct",  avgMarks: 92, attendance: 97, homeworkDone: 0 },
  // Rohan Gupta (STU-1003) — 0 attempts = 0% across all months
  { studentId: "STU-1003", month: "May",  avgMarks: 60, attendance: 68, homeworkDone: 0 },
  { studentId: "STU-1003", month: "Jun",  avgMarks: 63, attendance: 72, homeworkDone: 0 },
  { studentId: "STU-1003", month: "Jul",  avgMarks: 68, attendance: 75, homeworkDone: 0 },
  { studentId: "STU-1003", month: "Aug",  avgMarks: 70, attendance: 78, homeworkDone: 0 },
  { studentId: "STU-1003", month: "Sep",  avgMarks: 72, attendance: 80, homeworkDone: 0 },
  { studentId: "STU-1003", month: "Oct",  avgMarks: 74, attendance: 82, homeworkDone: 0 },
  // Priya Deshmukh (STU-1004) — 0 attempts = 0% across all months
  { studentId: "STU-1004", month: "May",  avgMarks: 79, attendance: 88, homeworkDone: 0 },
  { studentId: "STU-1004", month: "Jun",  avgMarks: 82, attendance: 90, homeworkDone: 0 },
  { studentId: "STU-1004", month: "Jul",  avgMarks: 85, attendance: 92, homeworkDone: 0 },
  { studentId: "STU-1004", month: "Aug",  avgMarks: 88, attendance: 93, homeworkDone: 0 },
  { studentId: "STU-1004", month: "Sep",  avgMarks: 86, attendance: 91, homeworkDone: 0 },
  { studentId: "STU-1004", month: "Oct",  avgMarks: 90, attendance: 94, homeworkDone: 0 }
];

const DEFAULT_EXAMINATIONS = [
  { id: 1, examName: "Mid-Semester Examination 2026", semester: 5, subject: "Full Stack Java Development", examDate: "2026-10-15", examType: "Mid-Term", status: "Scheduled" },
  { id: 2, examName: "End-Semester Practical Exam", semester: 5, subject: "Data Structures & Algorithms", examDate: "2026-11-20", examType: "Practical", status: "Scheduled" }
];

// Local Storage Helper Initialization
function initMockDatabase() {
  if (!localStorage.getItem("edu_students")) localStorage.setItem("edu_students", JSON.stringify(DEFAULT_STUDENTS));
  if (!localStorage.getItem("edu_faculty")) localStorage.setItem("edu_faculty", JSON.stringify(DEFAULT_FACULTY));
  if (!localStorage.getItem("edu_departments")) localStorage.setItem("edu_departments", JSON.stringify(DEFAULT_DEPARTMENTS));
  if (!localStorage.getItem("edu_courses")) localStorage.setItem("edu_courses", JSON.stringify(DEFAULT_COURSES));
  if (!localStorage.getItem("edu_marks")) localStorage.setItem("edu_marks", JSON.stringify(DEFAULT_MARKS));
  if (!localStorage.getItem("edu_attendance")) localStorage.setItem("edu_attendance", JSON.stringify(DEFAULT_ATTENDANCE));
  if (!localStorage.getItem("edu_homework")) localStorage.setItem("edu_homework", JSON.stringify(DEFAULT_HOMEWORK));
  if (!localStorage.getItem("edu_homework_assignments")) localStorage.setItem("edu_homework_assignments", JSON.stringify(DEFAULT_HOMEWORK_ASSIGNMENTS));
  if (!localStorage.getItem("edu_homework_submissions")) localStorage.setItem("edu_homework_submissions", JSON.stringify(DEFAULT_HOMEWORK_SUBMISSIONS));
  if (!localStorage.getItem("edu_monthly_performance")) localStorage.setItem("edu_monthly_performance", JSON.stringify(DEFAULT_MONTHLY_PERFORMANCE));
  if (!localStorage.getItem("edu_examinations")) localStorage.setItem("edu_examinations", JSON.stringify(DEFAULT_EXAMINATIONS));
  if (!localStorage.getItem("edu_complaints")) localStorage.setItem("edu_complaints", JSON.stringify(DEFAULT_COMPLAINTS));

  // Sanitize cached monthly performance to purge any stale fake percentages
  try {
    const cachedMp = JSON.parse(localStorage.getItem("edu_monthly_performance") || "[]");
    if (cachedMp.some(m => m.homeworkDone > 35)) {
      localStorage.setItem("edu_monthly_performance", JSON.stringify(DEFAULT_MONTHLY_PERFORMANCE));
    }
  } catch (e) {}
}

initMockDatabase();

// Sync any custom signed-up students into edu_students list so Admin & Faculty see updated details
function syncCustomStudents() {
  let students = JSON.parse(localStorage.getItem("edu_students") || "[]");
  const customUsers = JSON.parse(localStorage.getItem("edu_custom_users") || "[]");
  let updated = false;

  customUsers.filter(u => u.role === "Student").forEach(u => {
    const exists = students.some(s => s.email && s.email.toLowerCase() === u.email.toLowerCase());
    if (!exists) {
      students.push({
        id: Date.now() + Math.floor(Math.random() * 1000),
        studentId: `STU-${Math.floor(1000 + Math.random() * 9000)}`,
        rollNo: u.rollNo || `21CS${Math.floor(100 + Math.random() * 900)}`,
        name: u.name,
        email: u.email,
        phone: u.phone || "+91 9876543210",
        gender: u.gender || "Male",
        dob: u.dob || "2002-06-15",
        department: u.department || "Computer Science & Engineering",
        course: u.course || "B.Tech CSE",
        year: u.year || "3rd Year",
        semester: u.semester || 5,
        division: "A",
        address: "Registered Student",
        admissionDate: new Date().toISOString().split("T")[0],
        status: u.status === "approved" ? "Active" : (u.status || "Active")
      });
      updated = true;
    }
  });

  if (updated) {
    localStorage.setItem("edu_students", JSON.stringify(students));
  }
}

// Utility for getting data from mock storage
function getStorageItem(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

function setStorageItem(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// API Methods
const api = {
  // Generic HTTP Request Handler
  async request(endpoint, options = {}) {
    if (USE_MOCK_DATA) {
      return this.mockHandler(endpoint, options);
    }
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      },
      ...options
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
  },

  // Mock Request Processing logic
  async mockHandler(endpoint, options) {
    const method = options.method || "GET";
    const body = options.body ? JSON.parse(options.body) : null;

    // Simulate network delay
    await new Promise(res => setTimeout(res, 150));

    // Auth Login — role-strict: email must match the selected role
    if (endpoint === "/auth/login") {
      const { username, password, role } = body;

      const USERS = {
        admin: {
          emails: ["admin", "admin@college.edu", "admin@college.edu.in"],
          password: "admin123",
          role: "Admin",
          user: { name: "Dr. Administrator", email: "admin@college.edu.in", role: "Admin", avatar: "A" }
        },
        faculty: {
          emails: ["faculty", "faculty@college.edu", "faculty@college.edu.in", "rajesh.kumar@college.edu", "sunita.patel@college.edu", "meera.nambiar@college.edu", "vikram.m@college.edu"],
          password: "admin123",
          role: "Faculty",
          user: { name: "Prof. Sunita Patel", email: "faculty@college.edu.in", role: "Faculty", avatar: "S", department: "Computer Science & Engineering" }
        },
        student: {
          emails: ["student", "student@college.edu", "student@college.edu.in", "aarav.sharma@student.edu", "ananya.v@student.edu", "rohan.g@student.edu", "priya.d@student.edu"],
          password: "admin123",
          role: "Student",
          user: { name: "Aarav Sharma", email: "student@college.edu.in", role: "Student", avatar: "A", studentId: "STU-1001", department: "Computer Science & Engineering", year: "3rd Year", semester: 5 }
        }
      };

      const usernameLower = username.toLowerCase().trim();
      let matched = null;

      for (const key of Object.keys(USERS)) {
        const u = USERS[key];
        if (u.emails.includes(usernameLower) && password === u.password) {
          matched = u;
          break;
        }
      }

      if (!matched) {
        // Fallback to local storage for custom registered users
        const customUsers = JSON.parse(localStorage.getItem("edu_custom_users") || "[]");
        const found = customUsers.find(u => u.email === usernameLower && u.password === password);
        if (found) {
          matched = { role: found.role, user: { name: found.name, email: found.email, role: found.role, avatar: found.name.charAt(0) } };
        } else {
          throw new Error("Invalid username or password!");
        }
      }

      // Role must match — prevent admin logging in as student and vice versa
      if (matched.role !== role) {
        throw new Error(`These credentials belong to ${matched.role} portal. Please select '${matched.role}' role.`);
      }

      return { success: true, token: "mock-jwt-" + matched.role.toLowerCase(), user: matched.user };
    }

    // Students Endpoints
    if (endpoint.startsWith("/students")) {
      syncCustomStudents();
      let students = getStorageItem("edu_students");
      if (method === "GET") return students;
      if (method === "POST") {
        const newStudent = { id: Date.now(), studentId: `STU-${Math.floor(1000 + Math.random() * 9000)}`, ...body };
        students.push(newStudent);
        setStorageItem("edu_students", students);
        return newStudent;
      }
      if (method === "PUT") {
        const id = parseInt(endpoint.split("/")[2]);
        students = students.map(s => s.id === id ? { ...s, ...body } : s);
        setStorageItem("edu_students", students);
        return body;
      }
      if (method === "DELETE") {
        const id = parseInt(endpoint.split("/")[2]);
        students = students.filter(s => s.id !== id);
        setStorageItem("edu_students", students);
        return { success: true };
      }
    }

    // Faculty Endpoints
    if (endpoint.startsWith("/faculty")) {
      let faculty = getStorageItem("edu_faculty");
      if (method === "GET") return faculty;
      if (method === "POST") {
        const newFac = { id: Date.now(), facultyId: `FAC-00${faculty.length + 1}`, ...body };
        faculty.push(newFac);
        setStorageItem("edu_faculty", faculty);
        return newFac;
      }
      if (method === "PUT") {
        const id = parseInt(endpoint.split("/")[2]);
        faculty = faculty.map(f => f.id === id ? { ...f, ...body } : f);
        setStorageItem("edu_faculty", faculty);
        return body;
      }
      if (method === "DELETE") {
        const id = parseInt(endpoint.split("/")[2]);
        faculty = faculty.filter(f => f.id !== id);
        setStorageItem("edu_faculty", faculty);
        return { success: true };
      }
    }

    // Complaints Endpoints
    if (endpoint.startsWith("/complaints")) {
      let complaints = getStorageItem("edu_complaints");
      if (method === "GET") return complaints;
      if (method === "POST") {
        const newC = { id: Date.now(), date: new Date().toISOString().split("T")[0], status: "Pending", ...body };
        complaints.unshift(newC);
        setStorageItem("edu_complaints", complaints);
        return newC;
      }
      if (method === "PUT") {
        const id = parseInt(endpoint.split("/")[2]);
        complaints = complaints.map(c => c.id === id ? { ...c, ...body } : c);
        setStorageItem("edu_complaints", complaints);
        return body;
      }
    }

    // Department Endpoints
    if (endpoint.startsWith("/departments")) {
      let depts = getStorageItem("edu_departments");
      if (method === "GET") return depts;
      if (method === "POST") {
        const newDept = { id: Date.now(), deptId: `DEP-10${depts.length + 1}`, ...body };
        depts.push(newDept);
        setStorageItem("edu_departments", depts);
        return newDept;
      }
      if (method === "PUT") {
        const id = parseInt(endpoint.split("/")[2]);
        depts = depts.map(d => d.id === id ? { ...d, ...body } : d);
        setStorageItem("edu_departments", depts);
        return body;
      }
      if (method === "DELETE") {
        const id = parseInt(endpoint.split("/")[2]);
        depts = depts.filter(d => d.id !== id);
        setStorageItem("edu_departments", depts);
        return { success: true };
      }
    }

    // Courses Endpoints
    if (endpoint.startsWith("/courses")) {
      let courses = getStorageItem("edu_courses");
      if (method === "GET") return courses;
      if (method === "POST") {
        const newCourse = { id: Date.now(), courseId: `CRS-${courses.length + 201}`, ...body };
        courses.push(newCourse);
        setStorageItem("edu_courses", courses);
        return newCourse;
      }
      if (method === "PUT") {
        const id = parseInt(endpoint.split("/")[2]);
        courses = courses.map(c => c.id === id ? { ...c, ...body } : c);
        setStorageItem("edu_courses", courses);
        return body;
      }
      if (method === "DELETE") {
        const id = parseInt(endpoint.split("/")[2]);
        courses = courses.filter(c => c.id !== id);
        setStorageItem("edu_courses", courses);
        return { success: true };
      }
    }

    // Marks Endpoints
    if (endpoint.startsWith("/marks")) {
      let marks = getStorageItem("edu_marks");
      if (method === "GET") return marks;
      if (method === "POST") {
        const newMark = { id: Date.now(), ...body };
        const existingIdx = marks.findIndex(m => m.studentId === newMark.studentId && (m.subjectCode === newMark.subjectCode || (m.subject && newMark.subject && m.subject.toLowerCase() === newMark.subject.toLowerCase())));
        if (existingIdx >= 0) {
          marks[existingIdx] = { ...marks[existingIdx], ...newMark };
        } else {
          marks.push(newMark);
        }
        setStorageItem("edu_marks", marks);
        return newMark;
      }
      if (method === "DELETE") {
        const id = parseInt(endpoint.split("/")[2]);
        marks = marks.filter(m => m.id !== id);
        setStorageItem("edu_marks", marks);
        return { success: true };
      }
    }

    // Attendance Endpoints
    if (endpoint.startsWith("/attendance")) {
      let att = getStorageItem("edu_attendance");
      if (method === "GET") return att;
      if (method === "POST") {
        const newAtt = { id: Date.now(), ...body };
        att.push(newAtt);
        setStorageItem("edu_attendance", att);
        return newAtt;
      }
    }

    // Examinations Endpoints
    if (endpoint.startsWith("/examinations")) {
      let exams = getStorageItem("edu_examinations");
      if (method === "GET") return exams;
      if (method === "POST") {
        const newExam = { id: Date.now(), ...body };
        exams.push(newExam);
        setStorageItem("edu_examinations", exams);
        return newExam;
      }
      if (method === "DELETE") {
        const id = parseInt(endpoint.split("/")[2]);
        exams = exams.filter(e => e.id !== id);
        setStorageItem("edu_examinations", exams);
        return { success: true };
      }
    }

    // Chatbot Endpoint
    if (endpoint === "/chatbot/message") {
      return { reply: "EduAssist response for: " + body.message };
    }

    return {};
  },

  // Public High Level Helper Methods
  getStudents() { return this.request("/students"); },
  createStudent(data) { return this.request("/students", { method: "POST", body: JSON.stringify(data) }); },
  updateStudent(id, data) { return this.request(`/students/${id}`, { method: "PUT", body: JSON.stringify(data) }); },
  deleteStudent(id) { return this.request(`/students/${id}`, { method: "DELETE" }); },

  getFaculty() { return this.request("/faculty"); },
  createFaculty(data) { return this.request("/faculty", { method: "POST", body: JSON.stringify(data) }); },
  updateFaculty(id, data) { return this.request(`/faculty/${id}`, { method: "PUT", body: JSON.stringify(data) }); },
  deleteFaculty(id) { return this.request(`/faculty/${id}`, { method: "DELETE" }); },

  getDepartments() { return this.request("/departments"); },
  createDepartment(data) { return this.request("/departments", { method: "POST", body: JSON.stringify(data) }); },
  updateDepartment(id, data) { return this.request(`/departments/${id}`, { method: "PUT", body: JSON.stringify(data) }); },
  deleteDepartment(id) { return this.request(`/departments/${id}`, { method: "DELETE" }); },

  getCourses() { return this.request("/courses"); },
  createCourse(data) { return this.request("/courses", { method: "POST", body: JSON.stringify(data) }); },
  updateCourse(id, data) { return this.request(`/courses/${id}`, { method: "PUT", body: JSON.stringify(data) }); },
  deleteCourse(id) { return this.request(`/courses/${id}`, { method: "DELETE" }); },

  getMarks() { return this.request("/marks"); },
  saveMarks(data) { return this.request("/marks", { method: "POST", body: JSON.stringify(data) }); },
  deleteMark(id) { return this.request(`/marks/${id}`, { method: "DELETE" }); },
  getMarksByStudent(studentId) {
    const marks = getStorageItem("edu_marks") || [];
    let list = marks.filter(m => m.studentId === studentId);
    if (!list.length) {
      const user = (typeof auth !== 'undefined' && auth.getCurrentUser) ? auth.getCurrentUser() : null;
      if (user && user.name) {
        list = marks.filter(m => (m.studentName || '').toLowerCase() === user.name.toLowerCase());
      }
    }
    return Promise.resolve(list);
  },

  getAttendance() { return this.request("/attendance"); },
  saveAttendance(data) { return this.request("/attendance", { method: "POST", body: JSON.stringify(data) }); },
  getAttendanceByStudent(studentId) {
    const att = getStorageItem("edu_attendance") || [];
    let list = att.filter(a => a.studentId === studentId);
    if (!list.length) {
      const fallback = att.filter(a => a.studentId === "STU-1001");
      list = fallback.length ? fallback.map(a => ({ ...a, studentId })) : DEFAULT_ATTENDANCE.filter(a => a.studentId === "STU-1001").map(a => ({ ...a, studentId }));
    }
    return Promise.resolve(list);
  },

  // Homework & Assignments Hub
  getHomeworkAssignments() {
    return Promise.resolve(getStorageItem("edu_homework_assignments") || []);
  },
  saveHomeworkAssignment(data) {
    let list = getStorageItem("edu_homework_assignments") || [];
    const newAssignment = {
      id: Date.now(),
      createdAt: new Date().toISOString().split("T")[0],
      ...data
    };
    list.unshift(newAssignment);
    setStorageItem("edu_homework_assignments", list);
    return Promise.resolve(newAssignment);
  },
  deleteHomeworkAssignment(id) {
    let list = getStorageItem("edu_homework_assignments") || [];
    list = list.filter(a => a.id !== id);
    setStorageItem("edu_homework_assignments", list);
    let subs = getStorageItem("edu_homework_submissions") || [];
    subs = subs.filter(s => s.assignmentId !== id);
    setStorageItem("edu_homework_submissions", subs);
    return Promise.resolve({ success: true });
  },
  getHomeworkSubmissions(assignmentId = null) {
    let subs = getStorageItem("edu_homework_submissions") || [];
    if (assignmentId !== null && assignmentId !== undefined) {
      subs = subs.filter(s => String(s.assignmentId) === String(assignmentId));
    }
    return Promise.resolve(subs);
  },
  submitHomework(submissionData) {
    let subs = getStorageItem("edu_homework_submissions") || [];
    const existingIdx = subs.findIndex(s => String(s.assignmentId) === String(submissionData.assignmentId) && s.studentId === submissionData.studentId);
    const record = {
      id: Date.now(),
      ...submissionData
    };
    if (existingIdx >= 0) {
      subs[existingIdx] = record;
    } else {
      subs.unshift(record);
    }
    setStorageItem("edu_homework_submissions", subs);
    this.syncStudentHomeworkStats(submissionData.studentId);
    return Promise.resolve(record);
  },
  syncStudentHomeworkStats(studentId) {
    const assignments = getStorageItem("edu_homework_assignments") || [];
    const subs = getStorageItem("edu_homework_submissions") || [];
    const studentSubs = subs.filter(s => s.studentId === studentId);

    const subjectMap = {};
    assignments.forEach(a => {
      const subj = a.subject || "General";
      if (!subjectMap[subj]) {
        subjectMap[subj] = { total: 0, completed: 0, subjectCode: a.subjectCode || "" };
      }
      subjectMap[subj].total += 1;
      const isDone = studentSubs.some(s => String(s.assignmentId) === String(a.id));
      if (isDone) subjectMap[subj].completed += 1;
    });

    const hwList = Object.keys(subjectMap).map((subj, idx) => {
      const t = subjectMap[subj].total;
      const c = subjectMap[subj].completed;
      const pct = t > 0 ? Math.round((c / t) * 100) : 0;
      return {
        id: idx + 1,
        studentId: studentId,
        subject: subj,
        month: "Oct",
        total: t,
        completed: c,
        percentage: pct
      };
    });

    let allHw = getStorageItem("edu_homework") || [];
    allHw = allHw.filter(h => h.studentId !== studentId).concat(hwList);
    setStorageItem("edu_homework", allHw);
    return hwList;
  },
  getStudentAssignmentsWithStatus(studentId) {
    const assignments = getStorageItem("edu_homework_assignments") || [];
    const subs = getStorageItem("edu_homework_submissions") || [];
    const studentSubs = subs.filter(s => s.studentId === studentId);

    return Promise.resolve(assignments.map(a => {
      const sub = studentSubs.find(s => String(s.assignmentId) === String(a.id));
      return {
        ...a,
        isCompleted: !!sub,
        submission: sub || null
      };
    }));
  },
  getHomework() { return Promise.resolve(getStorageItem("edu_homework") || []); },
  getHomeworkByStudent(studentId) {
    const stats = this.syncStudentHomeworkStats(studentId);
    return Promise.resolve(stats);
  },

  getMonthlyPerformance() { return Promise.resolve(getStorageItem("edu_monthly_performance") || []); },
  getMonthlyPerformanceByStudent(studentId) {
    const mp = getStorageItem("edu_monthly_performance") || [];
    let list = mp.filter(m => m.studentId === studentId);
    if (!list.length) {
      const months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"];
      const baseMarks = 75;
      const baseAtt = 85;
      list = months.map((month, idx) => ({
        studentId,
        month,
        avgMarks: Math.min(100, Math.max(40, baseMarks + (idx * 2) - 4)),
        attendance: Math.min(100, Math.max(50, baseAtt + (idx * 1) - 2)),
        homeworkDone: 0
      }));
    }

    // Dynamic real homework calculation for THIS specific student
    const assignments = getStorageItem("edu_homework_assignments") || [];
    const subs = getStorageItem("edu_homework_submissions") || [];
    const studentSubs = subs.filter(s => s.studentId === studentId);

    const totalAssigned = assignments.length;
    const completedCount = studentSubs.length;
    const realHwPct = totalAssigned > 0 ? Math.round((completedCount / totalAssigned) * 100) : 0;

    // Strict truth:
    // If student has 0 completed attempts, ALL months have homeworkDone = 0.
    // If student has completed attempts, earlier months have 0, and the active coursework month (Oct) has realHwPct!
    list = list.map((item, idx) => {
      const isLatestMonth = (idx === list.length - 1) || item.month === "Oct";
      return {
        ...item,
        homeworkDone: (isLatestMonth && completedCount > 0) ? realHwPct : 0
      };
    });

    return Promise.resolve(list);
  },

  getExaminations() { return this.request("/examinations"); },
  createExamination(data) { return this.request("/examinations", { method: "POST", body: JSON.stringify(data) }); },
  deleteExamination(id) { return this.request(`/examinations/${id}`, { method: "DELETE" }); },

  getComplaints() { return this.request("/complaints"); },
  createComplaint(data) { return this.request("/complaints", { method: "POST", body: JSON.stringify(data) }); },
  updateComplaintStatus(id, status) { return this.request(`/complaints/${id}`, { method: "PUT", body: JSON.stringify({ status }) }); },

  sendChatMessage(message) { return this.request("/chatbot/message", { method: "POST", body: JSON.stringify({ message }) }); }
};
