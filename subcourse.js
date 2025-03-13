// List of Sub-Courses
const subCourses = {
    "Tech & Programming": [
        "Full-Stack Web Development",
        "Data Science & Machine Learning",
        "AI & Deep Learning",
        "Cybersecurity & Ethical Hacking",
        "Blockchain & Web3 Development",
        "DevOps & Cloud Computing",
        "Android & iOS App Development"
    ],
    "Business & Finance": [
        "Stock Market & Crypto Trading",
        "Digital Marketing & SEO",
        "Entrepreneurship & Startups"
    ],
    "Personal Development & Productivity": [
        "Public Speaking & Communication Skills",
        "Time Management & Productivity Hacks",
        "Freelancing & Side Hustles"
    ],
    "Languages": [
        "English",
        "Spanish",
        "Mandarin Chinese",
        "Russian",
        "Korean & Japanese"
    ],
    "Highly Demanded Courses": [
        "English Speaking & IELTS Preparation",
        "Swift (iOS Development)",
        "Dart (Flutter)"
    ]
};

// Get selected category from localStorage or URL
const category = localStorage.getItem("selectedCategory") || "Tech & Programming";

// Update Page Title & Breadcrumb
document.getElementById("page-title").innerText = category;
document.getElementById("category-title").innerText = category;

// Populate Sub-Course Grid
const courseGrid = document.getElementById("sub-course-grid");
courseGrid.innerHTML = subCourses[category].map(course => `
    <div class="course-card">
        <h3>${course}</h3>
        <button onclick="markCompleted('${course}')">Mark as Completed</button>
        <button onclick="bookmarkCourse('${course}')">Bookmark</button>
    </div>
`).join("");

// Search Functionality
document.getElementById("search").addEventListener("input", function() {
    let query = this.value.toLowerCase();
    document.querySelectorAll(".course-card").forEach(course => {
        let title = course.querySelector("h3").innerText.toLowerCase();
        course.style.display = title.includes(query) ? "block" : "none";
    });
});

// Mark Course as Completed
function markCompleted(courseName) {
    let completed = JSON.parse(localStorage.getItem("completedCourses")) || [];
    if (!completed.includes(courseName)) {
        completed.push(courseName);
        localStorage.setItem("completedCourses", JSON.stringify(completed));
        alert(courseName + " marked as completed!");
    }
}

// Bookmark Course
function bookmarkCourse(courseName) {
    let bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];
    if (!bookmarks.includes(courseName)) {
        bookmarks.push(courseName);
        localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
        alert(courseName + " bookmarked!");
    }
}
