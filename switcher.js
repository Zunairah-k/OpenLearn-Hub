document.addEventListener("DOMContentLoaded", function () {
    const selectedCategory = localStorage.getItem("selectedCategory");
    const body = document.body;

    // Theme mapping
    const themes = {
        "Tech & Programming": "tech-theme",
        "Business & Finance": "business-theme",
        "Languages": "language-theme",
        "Personal Development & Productivity": "personal-theme",
        "Highly Demanded Courses": "demanded-theme"
    };

    // Apply the correct theme class
    if (selectedCategory && themes[selectedCategory]) {
        body.classList.add(themes[selectedCategory]);
    }
});