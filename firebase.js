export {};
// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDODk8Pq3lbgeEhdQfbtCVJbWYqapQxad4",
    authDomain: "openlearn-hub.firebaseapp.com",
    projectId: "openlearn-hub",
    storageBucket: "openlearn-hub.firebasestorage.app",
    messagingSenderId: "916886893773",
    appId: "1:916886893773:web:e47d4088792b5af8212584",
    measurementId: "G-284K0V9YQX"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* Export Firebase modules
export { auth, db, signInWithEmailAndPassword };

console.log("Firebase initialized:", app);
console.log("Auth instance:", auth);
console.log("Firestore instance:", db);

window.auth = auth;
window.db = db;

window.auth = auth;
window.db = db;
window.signInWithEmailAndPassword = signInWithEmailAndPassword;*/

// Attach to window only after DOM is ready
window.onload = () => {
  window.firebaseApp = app;
  window.auth = auth;
  window.db = db;
  window.getAuth = getAuth;
  window.getFirestore = getFirestore;
  
  console.log("Firebase initialized:", app);
  console.log("Auth instance:", auth);
  console.log("Firestore instance:", db);

  console.log("window.auth:", window.auth);
  console.log("window.db:", window.db);
};

// Export Firebase modules
export { auth, db, signInWithEmailAndPassword };