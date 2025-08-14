
// Data Storage
const gradeSubjects = {
  9: ["Mathematics", "English", "Physics", "Chemistry", "Biology", "History", "Geography", "Computer", "Civics"],
  10: ["Mathematics", "English", "Chemistry", "Biology", "Geography", "History", "Economics", "Computer", "PhysicalEducation"],
  11: {
    "Natural Science": ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Computer"],
    "Social Science": ["History", "Geography", "Economics", "English", "Civics", "Computer"]
  },
  12: {
    "Natural Science": ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Computer"],
    "Social Science": ["History", "Geography", "Business", "English", "Civics", "Computer"]
  }
};

const users = {
  admin: [{ username: "admin", password: "admin123", name: "System Admin" }]
};

let students = JSON.parse(localStorage.getItem("students")) || [];

let teachers = JSON.parse(localStorage.getItem("teachers")) || [];

let scores = JSON.parse(localStorage.getItem("scores")) || [];

let comments = JSON.parse(localStorage.getItem("comments")) || [];

let currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

// Utility Functions
function saveData() {
  localStorage.setItem("students", JSON.stringify(students));
  localStorage.setItem("teachers", JSON.stringify(teachers));
  localStorage.setItem("scores", JSON.stringify(scores));
  localStorage.setItem("comments", JSON.stringify(comments));
}

function showPage(pageId) {
  document.querySelectorAll('[id$="Page"]').forEach((page) => {
    page.classList.add("hidden");
  });
  document.getElementById(pageId).classList.remove("hidden");
  renderHeader();
}

function nextStudentId() {
  const ids = students.map((s) => s.id);
  return ids.length ? Math.max(...ids) + 1 : 100;
}

function nextTeacherId() {
  const ids = teachers.map((t) => t.id);
  return ids.length ? Math.max(...ids) + 1 : 1;
}

function nextCommentId() {
  return comments.length ? Math.max(...comments.map((c) => c.id)) + 1 : 1;
}

function findStudent(id) {
  return students.find((s) => Number(s.id) === Number(id));
}

function findTeacher(id) {
  return teachers.find((t) => Number(t.id) === Number(id));
}

function ordinal(n) {
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function generateUsername(firstName, lastName) {
  const cleanFirstName = firstName.toLowerCase().replace(/[^a-z]/g, "");
  const cleanLastName = lastName.toLowerCase().replace(/[^a-z]/g, "").slice(0, 3);
  return `${cleanFirstName}.${cleanLastName}`;
}

function generateTeacherUsername(firstName, middleName) {
  const cleanFirst = firstName.toLowerCase().replace(/[^a-z]/g, "");
  const cleanMiddle = middleName.toLowerCase().replace(/[^a-z]/g, "").substring(0, 3);
  const randomDigit = Math.floor(Math.random() * 10);
  return `${cleanFirst}.${cleanMiddle}${randomDigit}`;
}

function toggleStreamSelection() {
  const grade = document.getElementById("grade").value;
  const streamLabel = document.getElementById("streamLabel");
  const streamSelect = document.getElementById("stream");
  if (grade === "11" || grade === "12") {
    streamLabel.classList.remove("hidden");
    streamSelect.classList.remove("hidden");
  } else {
    streamLabel.classList.add("hidden");
    streamSelect.classList.add("hidden");
    streamSelect.value = "";
  }
}

// Header Rendering
function renderHeader() {
  const nav = document.getElementById("headerNav");
  const greeting = document.getElementById("userGreeting");
  nav.innerHTML = "";
  greeting.innerHTML = currentUser ? `Welcome, ${currentUser.name}` : "Guest";

  if (!currentUser) {
    nav.innerHTML = `
      <a  style="color: black;" href="javascript:showPage('loginPage')">Home</a>
      <a   style="color: black;" href="#about">About</a>
    `;
  } else if (currentUser.role === "student") {
    nav.innerHTML = `
      <a href="javascript:showPage('studentPage')">Home</a>
      <a href="javascript:document.getElementById('viewScoresBtn').click()">View Scores</a>
      <a href="javascript:document.getElementById('viewBehaviorBtn').click()">View Behavior</a>
      <a href="javascript:renderStudentComments()">Comments</a>
      <a href="javascript:signOut()">Sign Out</a>
    `;
  } else if (currentUser.role === "teacher") {
    nav.innerHTML = `
      <a href="javascript:showPage('teacherPage')">Home</a>
      <a href="javascript:document.getElementById('submitScoreBtn').click()">Enter Scores</a>
      <a href="javascript:document.getElementById('submitBehaviorBtn').click()">Assign Behavior</a>
      <a href="javascript:renderTeacherComments()">Comments</a>
      <a href="javascript:signOut()">Sign Out</a>
    `;
  } else if (currentUser.role === "admin") {
    nav.innerHTML = `
      <a href="javascript:showPage('adminPage')">Home</a>
      <a href="javascript:showPage('registerPage')">Register Student</a>
      <a href="javascript:registerTeacher()">Register Teacher</a>
      <a href="javascript:viewStudentInfo()">Student Info</a>
      <a href="javascript:signOut()">Sign Out</a>
    `;
  }
}

// Login/Logout Functions
function setRole(role) {
  document.getElementById("role").value = role;
  const buttons = document.querySelectorAll(".role-btn");
  buttons.forEach((btn) => {
    btn.classList.remove("active");
    if (btn.textContent.toLowerCase() === role) {
      btn.classList.add("active");
    }
  });
}

function login(event) {
  event.preventDefault();
  const role = document.getElementById("role").value;
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  let user;
  if (role === "student") {
    user = students.find((s) => s.username === username && s.password === password);
  } else if (role === "teacher") {
    user = teachers.find((t) => t.username === username && t.password === password);
  } else if (role === "admin") {
    user = users.admin.find((u) => u.username === username && u.password === password);
  }

  if (user) {
    currentUser = {
      role,
      id: user.id || null,
      username: user.username,
      name: user.name || `${user.firstName} ${user.middleName} ${user.lastName}`,
      grade: user.grade || null,
      section: user.section || null,
      stream: user.stream || null,
      subjectSpecialty: user.subjectSpecialty || null,
      gradeLevels: user.gradeLevels || null,
      teacherSection: user.section || null
    };
    sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
    if (role === "student") showPage("studentPage");
    else if (role === "teacher") showPage("teacherPage");
    else if (role === "admin") showPage("adminPage");
    initializeDashboard();
    renderHeader();
  } else {
    document.getElementById("loginMessage").textContent = "Invalid credentials";
  }
}

function signOut() {
  sessionStorage.removeItem("currentUser");
  currentUser = null;
  showPage("loginPage");
  document.getElementById("loginForm").reset();
  document.getElementById("loginMessage").textContent = "";
  renderHeader();
}

// Dashboard Initialization
function initializeDashboard() {
  if (!currentUser) {
    showPage("loginPage");
    return;
  }

  if (currentUser.role === "admin" || currentUser.role === "teacher") {
    document.getElementById("registerBtn").addEventListener("click", registerStudent);
  }

  if (currentUser.role === "teacher") {
    const teacher = teachers.find(t => t.id === currentUser.id);
    if (teacher) {
      document.getElementById("teacherInfo").innerHTML = `
        <p><strong>Teacher:</strong> ${teacher.firstName} ${teacher.middleName} ${teacher.lastName}</p>
        <p><strong>Gender:</strong> ${teacher.gender}</p>
        <p><strong>Specialty:</strong> ${teacher.subjectSpecialty}</p>
        <p><strong>Grades:</strong> ${teacher.gradeLevels.join(", ")}</p>
        <p><strong>Section:</strong> ${teacher.section}</p>
      `;
      const teacherGradeEl = document.getElementById("teacherGrade");
      const teacherSectionEl = document.getElementById("teacherSection");
      const teacherBehaviorGradeEl = document.getElementById("teacherBehaviorGrade");
      const teacherBehaviorSectionEl = document.getElementById("teacherBehaviorSection");
      teacherGradeEl.innerHTML = teacher.gradeLevels.map(g => `<option value="${g}">Grade ${g}</option>`).join('');
      teacherGradeEl.value = teacher.gradeLevels[0] || "";
      teacherSectionEl.value = teacher.section || "";
      teacherBehaviorGradeEl.innerHTML = teacher.gradeLevels.map(g => `<option value="${g}">Grade ${g}</option>`).join('');
      teacherBehaviorGradeEl.value = teacher.gradeLevels[0] || "";
      teacherBehaviorSectionEl.value = teacher.section || "";
      fillTeacherSubjects();
      populateStudentSelects();
      populateBehaviorStudentSelects();
    }

    document.getElementById("submitScoreBtn").addEventListener("click", submitScore);
    document.getElementById("submitBehaviorBtn").addEventListener("click", submitBehaviorGrade);
    renderTeacherComments();
  }

  if (currentUser.role === "student") {
    document.getElementById("viewScoresBtn").addEventListener("click", viewScores);
    document.getElementById("viewBehaviorBtn").addEventListener("click", viewBehaviorGrades);
    document.getElementById("sendCommentBtn").addEventListener("click", sendComment);
    renderStudentComments();
  }

  if (currentUser.role === "admin") {
    renderStudentsTable();
    renderTeachersTable();
    renderCommentsTable();
  }
}

// Register Student
function registerStudent() {
  const firstName = document.getElementById("firstName").value.trim();
  const middleName = document.getElementById("middleName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const emergencyName = document.getElementById("emergencyName").value.trim();
  const emergencyPhone = document.getElementById("emergencyPhone").value.trim();
  const gender = document.getElementById("gender").value;
  const grade = document.getElementById("grade").value;
  const section = document.getElementById("section").value;
  const stream = document.getElementById("stream").value;
  const msgEl = document.getElementById("registerMsg");
  msgEl.textContent = "";

  if (!firstName || !middleName || !lastName || !phone || !emergencyName || !emergencyPhone || !gender || !grade || !section) {
    alert("Please fill all required fields");
    return;
  }

  if ((grade === "11" || grade === "12") && !stream) {
    alert("Please select a stream for Grade 11 or 12");
    return;
  }

  const newId = nextStudentId();
  const username = generateUsername(firstName, lastName);
  const password = "student123";

  if (students.some((s) => s.username === username)) {
    alert("Username already exists. Please modify the first or last name.");
    return;
  }

  const student = {
    id: newId, firstName, middleName, lastName, phone, emergencyName,
    emergencyPhone, gender, grade: Number(grade), section, stream,
    username, password, behavior: {}
  };

  students.push(student);
  saveData();
  msgEl.innerHTML = `
    <div class="credential-box">
      <p>Registered ${firstName} ${middleName} ${lastName} with ID ${newId}</p>
      <p><strong>Username:</strong> ${username}</p>
      <p><strong>Password:</strong> ${password}</p>
    </div>
  `;
  document.getElementById("firstName").value = "";
  document.getElementById("middleName").value = "";
  document.getElementById("lastName").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("emergencyName").value = "";
  document.getElementById("emergencyPhone").value = "";
  document.getElementById("gender").value = "";
  document.getElementById("grade").value = "";
  document.getElementById("stream").value = "";
  document.getElementById("section").value = "";
  toggleStreamSelection();
  if (currentUser.role === "admin") {
    renderStudentsTable();
  }
}

// Register Teacher
function registerTeacher() {
  const firstName = document.getElementById("teacherFirstName").value.trim();
  const middleName = document.getElementById("teacherMiddleName").value.trim();
  const lastName = document.getElementById("teacherLastName").value.trim();
  const gender = document.getElementById("teacherGender").value;
  const subject = document.getElementById("teacherSubjectSpecialty").value;
  const section = document.getElementById("teacherSection").value;
  const gradeLevels = [];
  if (document.getElementById("grade9").checked) gradeLevels.push(9);
  if (document.getElementById("grade10").checked) gradeLevels.push(10);
  if (document.getElementById("grade11").checked) gradeLevels.push(11);
  if (document.getElementById("grade12").checked) gradeLevels.push(12);
  const msgEl = document.getElementById("teacherRegisterMsg");
  msgEl.textContent = "";

  if (!firstName || !middleName || !lastName || !gender || !subject || !section || gradeLevels.length === 0) {
    alert("Please fill all required fields");
    return;
  }

  let username = generateTeacherUsername(firstName, middleName);
  let attempts = 0;
  while (teachers.some(t => t.username === username) && attempts < 10) {
    username = generateTeacherUsername(firstName, middleName);
    attempts++;
  }
  if (teachers.some(t => t.username === username)) {
    alert("Unable to generate a unique username. Please try a different name.");
    return;
  }

  const newTeacher = {
    id: nextTeacherId(), firstName, middleName, lastName, gender,
    username, password: "321", subjectSpecialty: subject,
    gradeLevels, section
  };

  teachers.push(newTeacher);
  saveData();
  msgEl.innerHTML = `
    <div class="credential-box">
      <p>Teacher registered successfully!</p>
      <p><strong>Username:</strong> ${username}</p>
      <p><strong>Password:</strong> 321</p>
    </div>
  `;
  document.getElementById("teacherFirstName").value = "";
  document.getElementById("teacherMiddleName").value = "";
  document.getElementById("teacherLastName").value = "";
  document.getElementById("teacherGender").value = "";
  document.getElementById("teacherSubjectSpecialty").value = "";
  document.getElementById("teacherSection").value = "";
  document.getElementById("grade9").checked = false;
  document.getElementById("grade10").checked = false;
  document.getElementById("grade11").checked = false;
  document.getElementById("grade12").checked = false;
  renderTeachersTable();
}

// Teacher Functions
function fillTeacherSubjects() {
  const teacher = teachers.find(t => t.id === currentUser.id);
  const selectedGrade = Number(document.getElementById("teacherGrade").value);
  const teacherSubjectEl = document.getElementById("teacherSubject");
  teacherSubjectEl.innerHTML = '<option value="">-- Select Subject --</option>';
  if (teacher && teacher.subjectSpecialty && selectedGrade) {
    let subjects = [];
    if (selectedGrade >= 11) {
      for (const stream in gradeSubjects[selectedGrade]) {
        gradeSubjects[selectedGrade][stream].forEach(sub => {
          if (!subjects.includes(sub)) subjects.push(sub);
        });
      }
    } else {
      subjects = gradeSubjects[selectedGrade] || [];
    }
    subjects.sort();
    subjects.forEach(subject => {
      const disabled = subject !== teacher.subjectSpecialty ? 'disabled' : '';
      teacherSubjectEl.innerHTML += `<option value="${subject}" ${disabled}>${subject}</option>`;
    });
  }
}

function populateStudentSelects() {
  const teacherStudentSelect = document.getElementById("teacherStudentSelect");
  const selectedGrade = Number(document.getElementById("teacherGrade").value);
  const selectedSection = document.getElementById("teacherSection").value;
  teacherStudentSelect.innerHTML = '<option value="">-- Select student --</option>';
  const filteredStudents = students
    .filter(s => s.grade === selectedGrade && s.section === selectedSection)
    .sort((a, b) => {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });
  if (filteredStudents.length === 0) {
    teacherStudentSelect.innerHTML = '<option value="">No students found</option>';
  } else {
    filteredStudents.forEach((s) => {
      const label = `${s.id} — ${s.firstName} ${s.lastName} (G${s.grade} ${s.section}${s.stream ? `, ${s.stream}` : ''})`;
      teacherStudentSelect.innerHTML += `<option value="${s.id}">${label}</option>`;
    });
  }
  fillTeacherSubjects();
}

function populateBehaviorStudentSelects() {
  const teacherBehaviorStudentSelect = document.getElementById("teacherBehaviorStudentSelect");
  const selectedGrade = Number(document.getElementById("teacherBehaviorGrade").value);
  const selectedSection = document.getElementById("teacherBehaviorSection").value;
  teacherBehaviorStudentSelect.innerHTML = '<option value="">-- Select student --</option>';
  const filteredStudents = students
    .filter(s => s.grade === selectedGrade && s.section === selectedSection)
    .sort((a, b) => {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });
  if (filteredStudents.length === 0) {
    teacherBehaviorStudentSelect.innerHTML = '<option value="">No students found</option>';
  } else {
    filteredStudents.forEach((s) => {
      const label = `${s.id} — ${s.firstName} ${s.lastName} (G${s.grade} ${s.section}${s.stream ? `, ${s.stream}` : ''})`;
      teacherBehaviorStudentSelect.innerHTML += `<option value="${s.id}">${label}</option>`;
    });
  }
}

function submitScore() {
  const grade = Number(document.getElementById("teacherGrade").value);
  const section = document.getElementById("teacherSection").value;
  const selectedId = Number(document.getElementById("teacherStudentSelect").value) || null;
  const typedId = Number(document.getElementById("teacherStudentId").value) || null;
  const studentId = typedId || selectedId;
  const subject = document.getElementById("teacherSubject").value;
  const term = document.getElementById("teacherTerm").value;
  const exam = document.getElementById("teacherExam").value;
  const score = Number(document.getElementById("teacherScore").value);
  const msgEl = document.getElementById("teacherMsg");

  if (!studentId || !subject || !term || !exam || isNaN(score) || score < 0 || score > 100) {
    alert("Please fill all fields with valid values (score between 0 and 100)");
    return;
  }

  const teacher = teachers.find(t => t.id === currentUser.id);
  if (!teacher) {
    alert("Teacher not found.");
    return;
  }

  if (subject !== teacher.subjectSpecialty) {
    alert("You can only submit scores for your subject specialty.");
    return;
  }

  if (!teacher.gradeLevels.includes(grade)) {
    alert("You can only submit scores for your assigned grade levels.");
    return;
  }

  if (section !== teacher.section) {
    alert("You can only submit scores for your assigned section.");
    return;
  }

  const student = students.find(s => s.id === studentId);
  if (!student || student.grade !== grade || student.section !== section) {
    alert("Selected student does not match the selected grade or section.");
    return;
  }

  const subjects = (grade >= 11 && student.stream) 
    ? gradeSubjects[grade][student.stream] || []
    : gradeSubjects[grade] || [];
  if (!subjects.includes(subject)) {
    alert("Selected subject is not available for this student's grade/stream.");
    return;
  }

  const existingIndex = scores.findIndex(
    (s) => s.student_id === studentId && s.subject === subject &&
           s.term === term && s.exam_type === exam && s.section === section
  );

  if (existingIndex >= 0) {
    scores[existingIndex].score = score;
    msgEl.textContent = `Updated score for student ${studentId} in ${subject}`;
  } else {
    scores.push({
      student_id: studentId, subject, exam_type: exam, score, term,
      section, entered_by: currentUser.username
    });
    msgEl.textContent = `Added score for student ${studentId} in ${subject}`;
  }

  saveData();
  document.getElementById("teacherScore").value = "";
}

function submitBehaviorGrade() {
  const grade = Number(document.getElementById("teacherBehaviorGrade").value);
  const section = document.getElementById("teacherBehaviorSection").value;
  const studentId = Number(document.getElementById("teacherBehaviorStudentSelect").value);
  const behaviorScore = document.getElementById("teacherBehaviorScore").value;
  const term = document.getElementById("teacherBehaviorTerm").value;
  const msgEl = document.getElementById("teacherBehaviorMsg");

  if (!studentId || !behaviorScore || !term) {
    alert("Please select a student, behavior grade, and term");
    return;
  }

  const teacher = teachers.find(t => t.id === currentUser.id);
  if (!teacher) {
    alert("Teacher not found.");
    return;
  }

  if (!teacher.gradeLevels.includes(grade)) {
    alert("You can only assign behavior grades for your assigned grade levels.");
    return;
  }

  if (section !== teacher.section) {
    alert("You can only assign behavior grades for your assigned section.");
    return;
  }

  const student = students.find(s => s.id === studentId);
  if (!student || student.grade !== grade || student.section !== section) {
    alert("Selected student does not match the selected grade or section.");
    return;
  }

  student.behavior = student.behavior || {};
  student.behavior[term] = behaviorScore;
  saveData();
  msgEl.textContent = `Assigned behavior grade ${behaviorScore} for student ${studentId} in ${term}`;
  document.getElementById("teacherBehaviorScore").value = "";
}

function renderTeacherComments() {
  const container = document.getElementById("teacherCommentsContainer");
  container.innerHTML = "";
  const teacher = teachers.find(t => t.id === currentUser.id);
  const pendingComments = comments.filter(
    c => c.status === "pending" && 
         students.some(s => s.id === c.student_id && s.section === teacher.section)
  );

  if (pendingComments.length === 0) {
    container.innerHTML = "<p>No pending comments.</p>";
    return;
  }

  pendingComments.forEach((c) => {
    const student = students.find((s) => s.id === c.student_id);
    const div = document.createElement("div");
    div.className = "comment-block";
    div.innerHTML = `
      <p><strong>Student ${c.student_id}${student ? ` (${student.firstName} ${student.middleName} ${student.lastName})` : ""}:</strong></p>
      <p>${c.text}</p>
      <textarea id="resp_${c.id}" rows="3" placeholder="Write response..."></textarea>
      <button onclick="sendResponse(${c.id})" class="primary" style="margin-top:8px;">Send Response</button>
    `;
    container.appendChild(div);
  });
}

function sendResponse(commentId) {
  const response = document.getElementById(`resp_${commentId}`).value.trim();
  if (!response) {
    alert("Please write a response");
    return;
  }

  const commentIndex = comments.findIndex((c) => c.id === commentId);
  if (commentIndex >= 0) {
    comments[commentIndex].response = response;
    comments[commentIndex].status = "responded";
    comments[commentIndex].responded_by = currentUser.username;
    comments[commentIndex].response_date = new Date().toISOString();
    saveData();
    renderTeacherComments();
    if (currentUser.role === "admin") {
      renderCommentsTable();
    }
  }
}

// Student Functions
function viewScores() {
  const term = document.getElementById("viewTerm").value;
  const studentId = currentUser.id;
  const container = document.getElementById("scoresTable");

  const student = students.find((s) => s.id === studentId);
  if (!student) {
    container.innerHTML = "<p>Student record not found.</p>";
    return;
  }

  const studentScores = scores.filter(
    (s) => s.student_id === studentId && s.section === student.section &&
           (term === "All" || s.term === term)
  );

  if (studentScores.length === 0) {
    container.innerHTML = `<p>No scores found for ${term}.</p>`;
    return;
  }

  const subjects = {};
  const examTypes = ["Assignment", "Midterm", "Final", "Quiz"];
  const allSubjects = (student.grade >= 11 && student.stream) 
    ? gradeSubjects[student.grade][student.stream] || []
    : gradeSubjects[student.grade] || [];

  allSubjects.forEach((sub) => {
    subjects[sub] = {
      Term1: { Assignment: null, Midterm: null, Final: null, Quiz: null },
      Term2: { Assignment: null, Midterm: null, Final: null, Quiz: null }
    };
  });

  studentScores.forEach((score) => {
    const termKey = score.term.replace(" ", "");
    if (subjects[score.subject]) {
      subjects[score.subject][termKey][score.exam_type] = score.score;
    }
  });

  let subjectAverages = {};
  let term1Total = 0;
  let term2Total = 0;
  let term1SubjectCount = 0;
  let term2SubjectCount = 0;
  let term1SumAvgs = 0;
  let term2SumAvgs = 0;
  let overallAverage = 0;

  for (const [subject, terms] of Object.entries(subjects)) {
    const term1Scores = Object.values(terms.Term1).filter(score => score !== null);
    const term2Scores = Object.values(terms.Term2).filter(score => score !== null);
    const term1TotalSub = term1Scores.reduce((sum, score) => sum + score, 0);
    const term2TotalSub = term2Scores.reduce((sum, score) => sum + score, 0);
    const term1Avg = term1Scores.length > 0 ? term1TotalSub / term1Scores.length : 0;
    const term2Avg = term2Scores.length > 0 ? term2TotalSub / term2Scores.length : 0;
    const subjectAvg = ( (term1Avg > 0 ? term1Avg : 0) + (term2Avg > 0 ? term2Avg : 0) ) / ( (term1Avg > 0 ? 1 : 0) + (term2Avg > 0 ? 1 : 0) ) || 0;

    subjectAverages[subject] = {
      term1: { scores: terms.Term1, total: term1TotalSub, avg: term1Avg },
      term2: { scores: terms.Term2, total: term2TotalSub, avg: term2Avg },
      overallAvg: subjectAvg
    };

    term1Total += term1TotalSub;
    term2Total += term2TotalSub;
    if (term1TotalSub > 0) {
      term1SubjectCount++;
      term1SumAvgs += term1Avg;
    }
    if (term2TotalSub > 0) {
      term2SubjectCount++;
      term2SumAvgs += term2Avg;
    }
  }

  if (term === "Term 1") {
    overallAverage = term1SubjectCount > 0 ? term1SumAvgs / term1SubjectCount : 0;
  } else if (term === "Term 2") {
    overallAverage = term2SubjectCount > 0 ? term2SumAvgs / term2SubjectCount : 0;
  } else if (term === "All") {
    const validAverages = Object.values(subjectAverages)
      .filter(data => data.overallAvg > 0)
      .map(data => data.overallAvg);
    overallAverage = validAverages.length > 0 ? 
      validAverages.reduce((sum, avg) => sum + avg, 0) / validAverages.length : 0;
  }

  const allStudentsInGradeAndSection = students.filter(
    s => s.grade === student.grade && s.section === student.section && s.stream === student.stream
  );

  const studentRankings = allStudentsInGradeAndSection.map(s => {
    const sScores = scores.filter(score => score.student_id === s.id && (term === "All" || score.term === term));
    const sSubjects = {};
    const sAllSubjects = (s.grade >= 11 && s.stream) 
      ? gradeSubjects[s.grade][s.stream] || []
      : gradeSubjects[s.grade] || [];

    sAllSubjects.forEach((sub) => {
      sSubjects[sub] = {
        Term1: { Assignment: null, Midterm: null, Final: null, Quiz: null },
        Term2: { Assignment: null, Midterm: null, Final: null, Quiz: null }
      };
    });

    sScores.forEach((score) => {
      const termKey = score.term.replace(" ", "");
      if (sSubjects[score.subject]) {
        sSubjects[score.subject][termKey][score.exam_type] = score.score;
      }
    });

    let sTerm1SumAvgs = 0;
    let sTerm1Count = 0;
    let sTerm2SumAvgs = 0;
    let sTerm2Count = 0;

    for (const [sub, terms] of Object.entries(sSubjects)) {
      const t1Scores = Object.values(terms.Term1).filter(score => score !== null);
      const t1Avg = t1Scores.length > 0 ? t1Scores.reduce((sum, score) => sum + score, 0) / t1Scores.length : 0;
      const t2Scores = Object.values(terms.Term2).filter(score => score !== null);
      const t2Avg = t2Scores.length > 0 ? t2Scores.reduce((sum, score) => sum + score, 0) / t2Scores.length : 0;

      if (t1Avg > 0) {
        sTerm1SumAvgs += t1Avg;
        sTerm1Count++;
      }
      if (t2Avg > 0) {
        sTerm2SumAvgs += t2Avg;
        sTerm2Count++;
      }
    }

    let sOverallAvg = 0;
    if (term === "Term 1") {
      sOverallAvg = sTerm1Count > 0 ? sTerm1SumAvgs / sTerm1Count : 0;
    } else if (term === "Term 2") {
      sOverallAvg = sTerm2Count > 0 ? sTerm2SumAvgs / sTerm2Count : 0;
    } else {
      let sSubAvgs = [];
      for (const [sub, terms] of Object.entries(sSubjects)) {
        const t1Scores = Object.values(terms.Term1).filter(score => score !== null);
        const t1Avg = t1Scores.length > 0 ? t1Scores.reduce((sum, score) => sum + score, 0) / t1Scores.length : 0;
        const t2Scores = Object.values(terms.Term2).filter(score => score !== null);
        const t2Avg = t2Scores.length > 0 ? t2Scores.reduce((sum, score) => sum + score, 0) / t2Scores.length : 0;
        let sumTerms = 0;
        let countTerms = 0;
        if (t1Avg > 0) { sumTerms += t1Avg; countTerms++; }
        if (t2Avg > 0) { sumTerms += t2Avg; countTerms++; }
        const subAvg = countTerms > 0 ? sumTerms / countTerms : 0;
        if (subAvg > 0) sSubAvgs.push(subAvg);
      }
      sOverallAvg = sSubAvgs.length > 0 ? sSubAvgs.reduce((sum, avg) => sum + avg, 0) / sSubAvgs.length : 0;
    }

    return { id: s.id, name: `${s.firstName} ${s.lastName}`, overallAvg: sOverallAvg };
  });

  studentRankings.sort((a, b) => b.overallAvg - a.overallAvg);
  const studentRank = studentRankings.findIndex(r => r.id === studentId) + 1;
  const totalStudents = studentRankings.length;

  let html = `<p><strong>Student:</strong> ${student.firstName} ${student.middleName} ${student.lastName} | <strong>Grade:</strong> ${student.grade} | <strong>Section:</strong> ${student.section}${student.stream ? ` | <strong>Stream:</strong> ${student.stream}` : ''} | <strong>Rank:</strong> ${studentRank}${ordinal(studentRank)} of ${totalStudents}</p>`;
  html += `<table>
      <thead>
          <tr>
              <th rowspan="2">Subject</th>
              <th colspan="5">Term 1</th>
              ${term === "All" ? '<th colspan="5">Term 2</th><th rowspan="2" class="average-column">Average</th>' : ''}
          </tr>
          <tr>
              <th>Assign</th>
              <th>Mid</th>
              <th>Final</th>
              <th>Quiz</th>
              <th>Avg</th>
              ${term === "All" ? `
              <th>Assign</th>
              <th>Mid</th>
              <th>Final</th>
              <th>Quiz</th>
              <th>Avg</th>` : ''}
          </tr>
      </thead>
      <tbody>`;

  for (const [subject, data] of Object.entries(subjectAverages)) {
    if (
      (term === "Term 1" && data.term1.total > 0) ||
      (term === "Term 2" && data.term2.total > 0) ||
      (term === "All" && (data.term1.total > 0 || data.term2.total > 0))
    ) {
      html += `<tr>
          <td>${subject}</td>
          <td>${data.term1.scores.Assignment || '-'}</td>
          <td>${data.term1.scores.Midterm || '-'}</td>
          <td>${data.term1.scores.Final || '-'}</td>
          <td>${data.term1.scores.Quiz || '-'}</td>
          <td>${data.term1.avg > 0 ? data.term1.avg.toFixed(2) : '-'}</td>
          ${term === "All" ? `
          <td>${data.term2.scores.Assignment || '-'}</td>
          <td>${data.term2.scores.Midterm || '-'}</td>
          <td>${data.term2.scores.Final || '-'}</td>
          <td>${data.term2.scores.Quiz || '-'}</td>
          <td>${data.term2.avg > 0 ? data.term2.avg.toFixed(2) : '-'}</td>
          <td class="average-column">${data.overallAvg > 0 ? data.overallAvg.toFixed(2) : '-'}</td>` : ''}
      </tr>`;
    }
  }

  const status = overallAverage >= 50 ? "Pass" : "Fail";
  const statusClass = status === "Pass" ? "status-pass" : "status-fail";

  html += `</tbody>
      <tfoot>
          <tr>
              <th rowspan="2">Overall</th>
              <th colspan="4"></th>
              ${term === "All" ? `<th>${term1SubjectCount > 0 ? (term1SumAvgs / term1SubjectCount).toFixed(2) : '-'}</th>
              <th colspan="4"></th>
              <th>${term2SubjectCount > 0 ? (term2SumAvgs / term2SubjectCount).toFixed(2) : '-'}</th>
              <th class="average-column">` : `<th>`}
                  Avg: ${overallAverage.toFixed(2)}<br>
                  Rank: ${studentRank}${ordinal(studentRank)}/${totalStudents}<br>
                  Status: <span class="${statusClass}">${status}</span>
              </th>
          </tr>
          <tr>
              <th colspan="${term === "All" ? '11' : '5'}"></th>
          </tr>
      </tfoot>
  </table>`;

  container.innerHTML = html;
  if (term === "All") {
    document.querySelectorAll('.average-column').forEach(el => {
      el.style.display = 'table-cell';
    });
  } else {
    document.querySelectorAll('.average-column').forEach(el => {
      el.style.display = 'none';
    });
  }
}

function viewBehaviorGrades() {
  const term = document.getElementById("viewBehaviorTerm").value;
  const studentId = currentUser.id;
  const container = document.getElementById("behaviorTable");

  const student = students.find((s) => s.id === studentId);
  if (!student) {
    container.innerHTML = "<p>Student record not found.</p>";
    return;
  }

  const behavior = student.behavior || {};
  let html = `<p><strong>Student:</strong> ${student.firstName} ${student.middleName} ${student.lastName} | <strong>Grade:</strong> ${student.grade} | <strong>Section:</strong> ${student.section}${student.stream ? ` | <strong>Stream:</strong> ${student.stream}` : ''}</p>`;
  html += `<table>
      <thead>
          <tr>
              <th>Term</th>
              <th>Behavior Grade</th>
          </tr>
      </thead>
      <tbody>`;

  if (term === "All") {
    if (!behavior["Term 1"] && !behavior["Term 2"]) {
      container.innerHTML = "<p>No behavior grades found.</p>";
      return;
    }
    html += `
      <tr><td>Term 1</td><td>${behavior["Term 1"] || '-'}</td></tr>
      <tr><td>Term 2</td><td>${behavior["Term 2"] || '-'}</td></tr>
    `;
  } else {
    if (!behavior[term]) {
      container.innerHTML = `<p>No behavior grade found for ${term}.</p>`;
      return;
    }
    html += `<tr><td>${term}</td><td>${behavior[term]}</td></tr>`;
  }

  html += `</tbody></table>`;
  container.innerHTML = html;
}

function sendComment() {
  const text = document.getElementById("studentComment").value.trim();
  if (!text) {
    alert("Please write your comment");
    return;
  }

  const commentId = nextCommentId();
  comments.push({
    id: commentId, student_id: currentUser.id, text,
    date: new Date().toISOString(), status: "pending",
    response: null, responded_by: null, response_date: null
  });

  saveData();
  document.getElementById("studentCommentMsg").textContent = "Comment sent successfully!";
  document.getElementById("studentComment").value = "";
  renderStudentComments();
  if (currentUser.role === "teacher") {
    renderTeacherComments();
  } else if (currentUser.role === "admin") {
    renderCommentsTable();
  }
}

function renderStudentComments() {
  const container = document.getElementById("studentCommentsList");
  container.innerHTML = "";
  const studentComments = comments.filter((c) => c.student_id === currentUser.id);

  if (studentComments.length === 0) {
    container.innerHTML = "<p>No comments yet.</p>";
    return;
  }

  studentComments.forEach((c) => {
    const div = document.createElement("div");
    div.className = "comment-block";
    div.innerHTML = `
      <p><strong>${new Date(c.date).toLocaleString()}:</strong> ${c.text}</p>
      ${
        c.status === "responded"
          ? `<div class="response"><strong>Response from teacher (${new Date(c.response_date).toLocaleString()}):</strong><p>${c.response}</p></div>`
          : `<p><em>Waiting for teacher response...</em></p>`
      }
    `;
    container.appendChild(div);
  });
}

// Admin Functions
function renderStudentsTable() {
  const tbody = document.getElementById("studentsTableBody");
  tbody.innerHTML = "";
  students.sort((a, b) => {
    const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
    const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
    return nameA.localeCompare(nameB);
  }).forEach((student) => {
    const behavior = student.behavior || {};
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${student.id}</td>
      <td>${student.firstName} ${student.middleName} ${student.lastName}</td>
      <td>${student.grade}</td>
      <td>${student.section}</td>
      <td>${student.stream || '-'}</td>
      <td>${student.gender}</td>
      <td>${student.phone}</td>
      <td>${student.emergencyName} (${student.emergencyPhone})</td>
      <td>${student.username}</td>
      <td>Term 1: ${behavior["Term 1"] || '-'}, Term 2: ${behavior["Term 2"] || '-'}</td>
      <td>
        <button onclick="editStudent(${student.id})" class="secondary" style="padding:4px 8px;font-size:12px;">Edit</button>
        <button onclick="deleteStudent(${student.id})" style="padding:4px 8px;font-size:12px;color:red;">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderTeachersTable() {
  const tbody = document.getElementById("teachersTableBody");
  tbody.innerHTML = "";
  teachers.sort((a, b) => {
    const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
    const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
    return nameA.localeCompare(nameB);
  }).forEach((teacher) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${teacher.id}</td>
      <td>${teacher.firstName} ${teacher.middleName} ${teacher.lastName}</td>
      <td>${teacher.gender}</td>
      <td>${teacher.subjectSpecialty}</td>
      <td>${teacher.gradeLevels.join(", ")}</td>
      <td>${teacher.section}</td>
      <td>${teacher.username}</td>
      <td>
        <button onclick="editTeacher(${teacher.id})" class="secondary" style="padding:4px 8px;font-size:12px;">Edit</button>
        <button onclick="deleteTeacher(${teacher.id})" style="padding:4px 8px;font-size:12px;color:red;">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderCommentsTable() {
  const tbody = document.getElementById("commentsTableBody");
  tbody.innerHTML = "";
  comments.forEach((comment) => {
    const student = students.find((s) => s.id === comment.student_id);
    const studentName = student ? `${student.firstName} ${student.middleName} ${student.lastName}` : "Unknown";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${comment.id}</td>
      <td>${studentName} (${comment.student_id})</td>
      <td>${comment.text}</td>
      <td>${comment.response || "-"}</td>
      <td>${comment.status}</td>
      <td>
        <button onclick="deleteComment(${comment.id})" style="padding:4px 8px;font-size:12px;color:red;">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function viewStudentInfo() {
  const studentId = Number(document.getElementById("adminStudentId").value);
  const container = document.getElementById("studentInfoTable");
  container.innerHTML = "";

  const student = students.find(s => s.id === studentId);
  if (!student) {
    container.innerHTML = "<p>Student not found.</p>";
    return;
  }

  const studentScores = scores.filter(s => s.student_id === studentId);
  const behavior = student.behavior || {};
  let html = `<h3>Student Information</h3>
      <p><strong>ID:</strong> ${student.id}</p>
      <p><strong>Name:</strong> ${student.firstName} ${student.middleName} ${student.lastName}</p>
      <p><strong>Gender:</strong> ${student.gender}</p>
      <p><strong>Grade:</strong> ${student.grade}</p>
      <p><strong>Section:</strong> ${student.section}</p>
      <p><strong>Stream:</strong> ${student.stream || '-'}</p>
      <p><strong>Phone:</strong> ${student.phone}</p>
      <p><strong>Emergency Contact:</strong> ${student.emergencyName} (${student.emergencyPhone})</p>
      <p><strong>Username:</strong> ${student.username}</p>
      <h4>Behavior Grades</h4>
      <p>Term 1: ${behavior["Term 1"] || '-'}</p>
      <p>Term 2: ${behavior["Term 2"] || '-'}</p>
      <h4>Scores</h4>`;

  if (studentScores.length === 0) {
    html += "<p>No scores available.</p>";
  } else {
    html += `<table>
        <thead>
            <tr>
                <th>Subject</th>
                <th>Exam Type</th>
                <th>Term</th>
                <th>Score</th>
            </tr>
        </thead>
        <tbody>`;
    studentScores.forEach(score => {
      html += `
        <tr>
            <td>${score.subject}</td>
            <td>${score.exam_type}</td>
            <td>${score.term}</td>
            <td>${score.score}</td>
        </tr>`;
    });
    html += `</tbody></table>`;
  }

  container.innerHTML = html;
}

function viewTeacherInfo() {
  const teacherId = Number(document.getElementById("adminTeacherId").value);
  const container = document.getElementById("teacherInfoTable");
  container.innerHTML = "";

  const teacher = teachers.find(t => t.id === teacherId);
  if (!teacher) {
    container.innerHTML = "<p>Teacher not found.</p>";
    return;
  }

  let html = `<h3>Teacher Information</h3>
      <p><strong>ID:</strong> ${teacher.id}</p>
      <p><strong>Name:</strong> ${teacher.firstName} ${teacher.middleName} ${teacher.lastName}</p>
      <p><strong>Gender:</strong> ${teacher.gender}</p>
      <p><strong>Subject Specialty:</strong> ${teacher.subjectSpecialty}</p>
      <p><strong>Grade Levels:</strong> ${teacher.gradeLevels.join(", ")}</p>
      <p><strong>Section:</strong> ${teacher.section}</p>
      <p><strong>Username:</strong> ${teacher.username}</p>
      <h4>Assigned Scores</h4>`;

  const teacherScores = scores.filter(s => s.entered_by === teacher.username);
  if (teacherScores.length === 0) {
    html += "<p>No scores assigned.</p>";
  } else {
    html += `<table>
        <thead>
            <tr>
                <th>Student ID</th>
                <th>Subject</th>
                <th>Exam Type</th>
                <th>Term</th>
                <th>Score</th>
            </tr>
        </thead>
        <tbody>`;
    teacherScores.forEach(score => {
      html += `
        <tr>
            <td>${score.student_id}</td>
            <td>${score.subject}</td>
            <td>${score.exam_type}</td>
            <td>${score.term}</td>
            <td>${score.score}</td>
        </tr>`;
    });
    html += `</tbody></table>`;
  }

  container.innerHTML = html;
}

function editTeacher(id) {
  const teacher = teachers.find(t => t.id === id);
  if (!teacher) {
    alert("Teacher not found.");
    return;
  }
  showPage("adminPage"); // Stay on admin page or create a separate edit page if needed
  // For simplicity, we'll use alert to simulate editing; in a real system, open a form
  alert(`Edit teacher ${id} - This would open an edit form in a real application`);
  // To implement full editing, create a separate form similar to registration and populate it with teacher data
}

function deleteStudent(id) {
  if (confirm(`Are you sure you want to delete student ${id}? This will also delete all their scores and comments.`)) {
    students = students.filter((s) => s.id !== id);
    scores = scores.filter((s) => s.student_id !== id);
    comments = comments.filter((c) => c.student_id === id);
    saveData();
    renderStudentsTable();
    renderCommentsTable();
  }
}

function deleteTeacher(id) {
  if (confirm(`Are you sure you want to delete teacher ${id}? This will remove all their associated data.`)) {
    teachers = teachers.filter((t) => t.id !== id);
    scores = scores.filter((s) => s.entered_by !== teachers.find(t => t.id === id)?.username);
    comments = comments.filter((c) => c.responded_by !== teachers.find(t => t.id === id)?.username);
    saveData();
    renderTeachersTable();
    renderCommentsTable();
  }
}

function deleteComment(id) {
  if (confirm("Delete this comment?")) {
    comments = comments.filter((c) => c.id !== id);
    saveData();
    renderCommentsTable();
    if (currentUser.role === "teacher") {
      renderTeacherComments();
    } else if (currentUser.role === "student") {
      renderStudentComments();
    }
  }
}

// Initialize
if (currentUser) {
  if (currentUser.role === "student") showPage("studentPage");
  else if (currentUser.role === "teacher") showPage("teacherPage");
  else if (currentUser.role === "admin") showPage("adminPage");
  initializeDashboard();
} else {
  showPage("loginPage");
}
renderHeader();
