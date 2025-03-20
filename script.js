setTimeout(() => {
    console.log("Auth:", window.auth);
    console.log("DB:", window.db);
}, 2000);
//firebase config (DONT REMOVE)
import { auth, db, signInWithEmailAndPassword } from "./firebase.js";
console.log("Auth:", auth); // Debugging Firebase
console.log("DB:", db); // Debugging Firestore

document.addEventListener("DOMContentLoaded", function () {
 if (window.location.href.includes("signin.html")) {
        const loginForm = document.getElementById("loginForm");
    
        if (loginForm) {
            loginForm.addEventListener("submit", function (event) {
                event.preventDefault();  // Prevent form refresh
                const email = document.getElementById("email").value;
                const password = document.getElementById("password").value;
    
                signInWithEmailAndPassword(auth, email, password)
                    .then((userCredential) => {
                        console.log("User logged in:", userCredential.user);
                        alert("Login successful!");
                        window.location.href = "index.html";
                    })
                    .catch((error) => {
                        console.error("Login failed:", error.message);
                        alert("Login failed: " + error.message);
                    });
            });
        }
    }
});
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
window.learnNew = learnNew;
window.showMotivation = showMotivation;
window.surpriseMe = surpriseMe;