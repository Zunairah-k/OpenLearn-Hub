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
performSearch();
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

// Search Button & Enter Key Trigger
document.addEventListener("DOMContentLoaded", () => {
    const searchButton = document.querySelector(".searchButton");

    if (searchButton && searchInput) {
        searchButton.addEventListener("click", performSearch);

        searchInput.addEventListener("keypress", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                performSearch();
            }
        });
    }
});