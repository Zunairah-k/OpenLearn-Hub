function learnNew() {
    window.location.href = "/courses/random"; // Update with your actual random course URL
}

function showMotivation() {
    const quotes = [
        "“The beautiful thing about learning is that no one can take it away from you.” – B.B. King",
        "“An investment in knowledge pays the best interest.” – Benjamin Franklin",
        "“Live as if you were to die tomorrow. Learn as if you were to live forever.” – Gandhi"
    ];
    document.getElementById("footer-message").innerText = quotes[Math.floor(Math.random() * quotes.length)];
}

function surpriseMe() {
    window.location.href = "/courses/trending"; // Update with your trending course URL
}