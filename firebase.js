export {};
// Import Firebase modules
// firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDODk8Pq3lbgeEhdQfbtCVJbWYqapQxad4",
  authDomain: "openlearn-hub.firebaseapp.com",
  projectId: "openlearn-hub",
  storageBucket: "openlearn-hub.appspot.com",
  messagingSenderId: "916886893773",
  appId: "1:916886893773:web:e47d4088792b5af8212584",
  measurementId: "G-284K0V9YQX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.onload = () => {
  window.firebaseApp = app;
  window.auth = auth;
  window.db = db;
};

export { 
  auth, 
  db, 
  signInWithEmailAndPassword,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc
};