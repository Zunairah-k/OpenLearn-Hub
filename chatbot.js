//test1 
console.log("✅ chatbot.js loaded");

// Toggle chatbot visibility
function toggleChatbot() {
    const chatbot = document.getElementById("chatbot-container");
    chatbot.style.display = chatbot.style.display === "flex" ? "none" : "flex";
}

// Handle message sending
function sendMessage() {
    const userInput = document.getElementById("user-input").value;
    if (!userInput.trim()) return;

    displayMessage(userInput, "user");
    document.getElementById("user-input").value = "";

     // Show animated typing indicator
     const typingIndicator = displayTypingIndicator();
     //test2
     console.log("📨 sendMessage triggered");
     console.log("User input:", userInput);

    // Send the message to the backend
    fetch("https://openlearn-hub-backend.onrender.com/recommend-courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput })
    })
    
    .then(response => response.json())
    .then(data => {
            removeTypingIndicator(); // Remove typing dots
            if (Array.isArray(data.recommendation)) {
            data.recommendation.forEach(msg => displayMessage(msg, "bot"));
        } else {
            displayMessage(data.recommendation, "bot");
        }
    })

    .catch(error => {
        console.error("Error:", error);
        removeTypingIndicator(); // Remove typing dots
        displayMessage("Oops! Something went wrong.", "bot");
    });
    //test3
    console.log("🚀 Sending request to backend...");

}

// Display messages in chat
function displayMessage(message, sender) {
    const messagesContainer = document.getElementById("chatbot-messages");

    // Remove typing indicator if bot is responding
    if (sender === "bot") removeTypingIndicator();

    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", sender === "user" ? "user-message" : "bot-message");
    const img = document.createElement("img");
    img.src = sender === "user" ? "./human-logo.png" : "./chatbot-logo.png"; 
    img.alt = sender === "user" ? "User" : "Bot"; // Set alt text to avoid broken images
    img.classList.add("avatar");
    
    // Text bubble
    const textDiv = document.createElement("div");
    textDiv.classList.add("bubble");
    textDiv.innerHTML = message.replace(/<br>/g, "\n");

    // Append elements in correct order
    if (sender === "user") {
        msgDiv.appendChild(textDiv);
        msgDiv.appendChild(img);  // User's avatar on right
    } else {
        msgDiv.appendChild(img);  // Bot's avatar on left
        msgDiv.appendChild(textDiv);
    }

    messagesContainer.appendChild(msgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Display animated typing indicator
function displayTypingIndicator() {
    const messagesContainer = document.getElementById("chatbot-messages");

    // Avoid duplicate indicators
    if (document.getElementById("typing-indicator")) return;

    const typingDiv = document.createElement("div");
    typingDiv.classList.add("message", "bot-message", "typing-indicator");
    typingDiv.id = "typing-indicator";
    
    typingDiv.innerHTML = `
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
    const typingMsg = document.getElementById("typing-indicator");
    if (typingMsg) typingMsg.remove();
}


// Handle Enter key in input
function handleKeyPress(event) {
    if (event.key === "Enter") sendMessage();
}
