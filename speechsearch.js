// Check if the browser supports Speech Recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const micButton = document.getElementById("micButton"); // Ensure micButton exists
const searchInput = document.getElementById("searchInput"); // Ensure searchInput exists

if (SpeechRecognition && micButton && searchInput) {
    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Stops listening after one sentence
    recognition.lang = "en-US"; // Set the language

    micButton.addEventListener("click", () => {
        recognition.start(); // Start voice recognition
        micButton.classList.add("listening"); // Optional: Add visual effect
    });

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.trim(); // Get detected speech
        searchInput.value = transcript; // Insert into input field
        recognition.stop(); // Stop recognition
        micButton.classList.remove("listening"); // Remove visual effect
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        recognition.stop();
        micButton.classList.remove("listening");
    };

    recognition.onend = () => {
        micButton.classList.remove("listening"); // Ensure visual effect is removed
    };
} else {
    if (micButton) {
        micButton.addEventListener("click", () => {
            alert("Speech recognition is not supported in this browser.");
        });
    }
}
/*search qeuery*/
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");

    if (searchInput) {
        searchInput.addEventListener("keypress", (event) => {
            if (event.key === "Enter") {
                event.preventDefault(); // Prevent form submission
                const query = searchInput.value.trim();

                if (query) {
                    console.log("Search Query:", query); // Check in console if it logs
                } else {
                    console.log("Empty search query");
                }
            }
        });
    }
});
/*search button */
document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.querySelector(".searchButton");
    const searchInput = document.getElementById("searchInput");

    searchButton.addEventListener("click", function () {
        let query = searchInput.value.trim(); // Get input value and remove spaces

        if (query !== "") {
            console.log("Searching for:", query); // Debugging: Shows search query in console
            alert(`Searching for: ${query}`); // Replace with actual search function
        } else {
            alert("Please enter a search term.");
        }
    });

    // Pressing 'Enter' in the input should also trigger the search
    searchInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            searchButton.click();
        }
    });
});