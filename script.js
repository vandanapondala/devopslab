
// ===================================
// GRADELY - STUDENT MARKS ANALYSIS
// ===================================

const subjects = [
    "english",
    "math",
    "science",
    "computer",
    "social"
];

const subjectNames = [
    "English",
    "Mathematics",
    "Science",
    "Computer",
    "Social Science"
];

// Load saved student data
let students = JSON.parse(
    localStorage.getItem("students") || "[]"
);

// ===================================
// 1. CALCULATE MARKS AND GRADE
// ===================================

function calculate(student) {

    const total = subjects.reduce(
        (sum, key) => sum + Number(student.marks[key]), 0
    );

    const percentage = total / 5;

    // A student must score at least 35 in every subject
    const passed = subjects.every(
        key => Number(student.marks[key]) >= 35
    );

    let grade = "F";

    if (percentage >= 90) grade = "A+";
    else if (percentage >= 80) grade = "A";
    else if (percentage >= 70) grade = "B";
    else if (percentage >= 60) grade = "C";
    else if (percentage >= 50) grade = "D";
    else if (percentage >= 35) grade = "E";

    return {
        total: total,
        percentage: percentage,
        grade: grade,
        result: passed ? "Pass" : "Fail"
    };
}

// ===================================
// 2. SAVE STUDENT DATA
// ===================================

function save() {

    localStorage.setItem(
        "students",
        JSON.stringify(students)
    );

}

// ===================================
// 3. ADD NEW STUDENT
// ===================================

function addStudent(event) {

    event.preventDefault();

    const name = document
        .getElementById("name")
        .value.trim();

    const roll = document
        .getElementById("roll")
        .value.trim();

    const marks = {};

    subjects.forEach(key => {

        marks[key] = Number(
            document.getElementById(key).value
        );

    });

    // Validate marks
    if (
        !name ||
        !roll ||
        subjects.some(key =>
            !Number.isInteger(marks[key]) ||
            marks[key] < 0 ||
            marks[key] > 100
        )
    ) {

        alert("Please enter valid marks between 0 and 100.");
        return;

    }

    // Check duplicate roll number
    if (
        students.some(student =>
            student.roll.toLowerCase() === roll.toLowerCase()
        )
    ) {

        alert("This roll number already exists!");
        return;

    }

    // Add new student
    students.push({
        name: name,
        roll: roll,
        marks: marks
    });

    save();

    alert("Student added successfully!");

    window.location.href = "students.html";

}

// ===================================
// 4. DISPLAY STUDENT RECORDS
// ===================================

function displayStudents() {

    const tbody = document.getElementById("studentTable");

    if (!tbody) return;

    const search = document
        .getElementById("search")
        .value.toLowerCase();

    tbody.innerHTML = "";

    students.forEach((student, index) => {

        if (
            !student.name.toLowerCase().includes(search) &&
            !student.roll.toLowerCase().includes(search)
        ) {
            return;
        }

        const data = calculate(student);

        const row = document.createElement("tr");

        const values = [
            student.name,
            student.roll,
            data.total + "/500",
            data.percentage.toFixed(2) + "%",
            data.grade
        ];

        values.forEach(value => {

            const cell = document.createElement("td");

            cell.textContent = value;

            row.appendChild(cell);

        });

        // Result status
        const statusCell = document.createElement("td");

        const badge = document.createElement("span");

        badge.className =
            "status " + data.result.toLowerCase();

        badge.textContent = data.result;

        statusCell.appendChild(badge);

        row.appendChild(statusCell);

        // Delete button
        const actionCell = document.createElement("td");

        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";

        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", () => {

            if (confirm("Are you sure you want to delete this student?")) {

                students.splice(index, 1);

                save();

                displayStudents();

            }

        });

        actionCell.appendChild(deleteButton);

        row.appendChild(actionCell);

        tbody.appendChild(row);

    });

}

// ===================================
// 5. UPDATE DASHBOARD
// ===================================

function updateDashboard() {

    const total = students.length;

    let pass = 0;
    let fail = 0;
    let totalPercentage = 0;

    students.forEach(student => {

        const data = calculate(student);

        totalPercentage += data.percentage;

        if (data.result === "Pass") {
            pass++;
        } else {
            fail++;
        }

    });

    const average = total
        ? totalPercentage / total
        : 0;

    function setText(id, value) {

        const element = document.getElementById(id);

        if (element) {
            element.textContent = value;
        }

    }

    setText("totalStudents", total);

    setText(
        "classAverage",
        average.toFixed(2) + "%"
    );

    setText("passStudents", pass);

    setText("failStudents", fail);

    // Find topper
    const sorted = [...students].sort(
        (a, b) =>
            calculate(b).percentage -
            calculate(a).percentage
    );

    const topper = sorted[0];

    if (topper) {

        const data = calculate(topper);

        setText("topper", topper.name);

        setText(
            "topperMarks",
            topper.roll + " | " +
            data.percentage.toFixed(2) +
            "% | Grade " + data.grade
        );

    } else {

        setText("topper", "No records yet");

        setText(
            "topperMarks",
            "Add students to discover the topper."
        );

    }

}

// ===================================
// 6. DISPLAY LEADERBOARD
// ===================================

function displayLeaderboard() {

    const tbody = document.getElementById(
        "leaderboardTable"
    );

    if (!tbody) return;

    tbody.innerHTML = "";

    const sorted = [...students].sort(
        (a, b) =>
            calculate(b).percentage -
            calculate(a).percentage
    );

    sorted.slice(0, 10).forEach((student, index) => {

        const data = calculate(student);

        const row = document.createElement("tr");

        const rank = ["🥇", "🥈", "🥉"][index] || (index + 1);

        const values = [
            rank,
            student.name,
            student.roll,
            data.total + "/500",
            data.percentage.toFixed(2) + "%",
            data.grade
        ];

        values.forEach((value, i) => {

            const cell = document.createElement("td");

            cell.textContent = value;

            if (i === 0) {
                cell.className = "rank";
            }

            row.appendChild(cell);

        });

        tbody.appendChild(row);

    });

}

// ===================================
// 7. CREATE PERFORMANCE CHARTS
// ===================================

function updateCharts() {

    if (typeof Chart === "undefined") return;

    const marksCanvas = document.getElementById("marksChart");

    const resultCanvas = document.getElementById("resultChart");

    Chart.defaults.color = "#aaaac4";

    Chart.defaults.font.family = "Inter";

    // Subject performance bar chart
    if (marksCanvas) {

        const averages = subjects.map(key => {

            if (students.length === 0) return 0;

            const total = students.reduce(
                (sum, student) =>
                    sum + Number(student.marks[key]),
                0
            );

            return total / students.length;

        });

        new Chart(marksCanvas, {

            type: "bar",

            data: {

                labels: subjectNames,

                datasets: [{

                    label: "Average Marks",

                    data: averages,

                    backgroundColor: [
                        "#a78bfa",
                        "#60a5fa",
                        "#4ade80",
                        "#fb923c",
                        "#f472b6"
                    ],

                    borderRadius: 8,

                    maxBarThickness: 45

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {
                        display: false
                    }

                },

                scales: {

                    y: {

                        beginAtZero: true,

                        max: 100,

                        grid: {
                            color: "#292940"
                        }

                    },

                    x: {

                        grid: {
                            display: false
                        }

                    }

                }

            }

        });

    }

    // Pass and fail doughnut chart
    if (resultCanvas) {

        const pass = students.filter(
            student =>
                calculate(student).result === "Pass"
        ).length;

        const fail = students.length - pass;

        new Chart(resultCanvas, {

            type: "doughnut",

            data: {

                labels: ["Passed", "Failed"],

                datasets: [{

                    data: [pass, fail],

                    backgroundColor: [
                        "#4ade80",
                        "#fb7185"
                    ],

                    borderColor: "#151527",

                    borderWidth: 5,

                    hoverOffset: 10

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                cutout: "70%",

                plugins: {

                    legend: {
                        position: "bottom"
                    }

                }

            }

        });

    }

}

// ===================================
// 8. PAGE INITIALIZATION
// ===================================

document.addEventListener("DOMContentLoaded", () => {

    // Add student form
    const form = document.getElementById("studentForm");

    if (form) {

        form.addEventListener(
            "submit",
            addStudent
        );

    }

    // Student search
    const search = document.getElementById("search");

    if (search) {

        search.addEventListener(
            "input",
            displayStudents
        );

    }

    // Load all page features
    updateDashboard();

    displayStudents();

    updateCharts();

    displayLeaderboard();

});
