import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", function () {
    const signupForm = document.getElementById("signup-form");
    const togglePasswords = document.querySelectorAll(".toggle-password");
    const googleSignupBtn = document.getElementById("google-signup");

    //email/password signup
    if (signupForm) {
        signupForm.addEventListener("submit", async function (event) {
            event.preventDefault(); // Prevent form refresh

            const fullName = document.getElementById("fullname").value;
            const username = document.getElementById("username").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirm-password").value;

            if (password !== confirmPassword) {
                alert("Passwords do not match!");
                return;
            }
            if (fullName.length < 3 || username.length < 3) {
                alert("Please enter a valid full name and username.");
                return;
            }
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Store user details in Firestore
                await setDoc(doc(db, "users", user.uid), {
                    fullName: fullName,
                    username: username,
                    email: email,
                    createdAt: new Date().toISOString() //ensures consistent timestamp format
                });

                console.log("User signed up:", user);
                alert("Signup successful! Redirecting to login...");
                window.location.href = "signin.html";
            } catch (error) {
                console.error("Signup failed:", error.message);
                alert("Signup failed: " + error.message);
            }
        });
    }
    //toggle password visibility
    togglePasswords.forEach(toggle => {
        toggle.addEventListener("click", function () {
            const inputGroup = this.closest(".input-group");
            const passwordField = inputGroup.querySelector("input");
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
    //google sign-in
    if (googleSignupBtn) {
        googleSignupBtn.addEventListener("click", function () {
            const provider = new GoogleAuthProvider();

            signInWithPopup(auth, provider)
                .then((result) => {
                    console.log("Google sign-in success:", result.user);
                    alert("Google sign-in successful!");
                    window.location.href = "signin.html";
                })
                .catch(error => alert("Google sign-in failed: " + error.message));
        });
    }
});
