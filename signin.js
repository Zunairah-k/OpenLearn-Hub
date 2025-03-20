import { auth } from "./firebase.js";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const forgotPasswordLink = document.querySelector(".forgot-password");
    const passwordInputs = document.querySelectorAll(".password-input");
    const togglePasswords = document.querySelectorAll(".toggle-password");

    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault(); // Prevent form refresh

            const email = document.getElementById("email").value; // FIXED: Corrected ID
            const password = document.getElementById("password").value;

            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    console.log("User logged in:", user);

                    // Store user info (Optional)
                    localStorage.setItem("user", JSON.stringify(user));

                    alert("Login successful!");
                    window.location.href = "index.html";
                })
                .catch((error) => {
                    console.error("Login failed:", error.message);
                    alert("Login failed: " + error.message);
                });
        });
    }
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener("click", function (event) {
            event.preventDefault();
            const email = prompt("Enter your email to reset password:");

            if (email) {
                sendPasswordResetEmail(auth, email)
                    .then(() => alert("Password reset email sent! Check your inbox."))
                    .catch(error => alert("Error: " + error.message));
            }
        });
    }
  togglePasswords.forEach(toggle => {
        toggle.addEventListener("click", function () {
            const passwordField = this.previousElementSibling; // Selects the input field before the eye icon
            const icon = this.querySelector("i");

            if (passwordField.type === "password") {
                passwordField.type = "text";
                icon.classList.remove("fa-eye-slash");
                icon.classList.add("fa-eye");
            } else {
                passwordField.type = "password";
                icon.classList.remove("fa-eye");
                icon.classList.add("fa-eye-slash");
            }
        });
    });
});