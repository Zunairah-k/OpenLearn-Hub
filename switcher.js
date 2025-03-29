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
// Wait for DOM to load
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search");
    const searchButton = document.getElementById("search-btn");

    if (!searchInput || !searchButton) return;

    // Handle Enter key press in input
    searchInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            searchButton.click(); // Trigger click
        }
    });

    // Handle click on search button
    searchButton.addEventListener("click", function () {
        const query = searchInput.value.trim();

        if (query !== "") {
            console.log("Searching for:", query); // Replace this with actual search logic
            alert(`Searching for: ${query}`);
        } else {
            alert("Please enter a search term.");
        }
    });
});