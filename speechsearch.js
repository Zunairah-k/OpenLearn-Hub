// Check if browser supports Web Speech API
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US'; // Set language
recognition.continuous = false; // Stops listening after one phrase
recognition.interimResults = false; // Get final results only

// When speech is detected
recognition.onresult = function(event) {
    let speechText = event.results[0][0].transcript; 
    document.getElementById("searchInput").value = speechText; // Fill search bar
    searchCourses(speechText); // Trigger search
};

// Function to start recognition
function startSpeechRecognition() {
    recognition.start();
}

// Error handling
recognition.onerror = function(event) {
    console.error("Speech recognition error:", event.error);
};