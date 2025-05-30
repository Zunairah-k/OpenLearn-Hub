import { auth, db } from './firebase.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js';

window.addEventListener('DOMContentLoaded', () => {
  const nameDisplay = document.getElementById('nameDisplay');
  const avatar = document.getElementById('avatar');
  const logoutBtn = document.getElementById('logoutBtn');

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const fullName = userDoc.data().fullName;
        nameDisplay.textContent = `Welcome, ${fullName}!`;
        avatar.textContent = fullName.charAt(0).toUpperCase();
      } else {
        nameDisplay.textContent = 'Welcome!';
        avatar.textContent = '?';
      }
    } else {
      window.location.href = 'signin.html';
    }
  });

  logoutBtn.addEventListener('click', () => {
    document.getElementById('logoutPopup').classList.remove('hidden');
  });

  document.getElementById('confirmLogout').addEventListener('click', () => {
    signOut(auth).then(() => {
      window.location.href = 'signin.html';
    }).catch((error) => {
      alert('Error signing out: ' + error.message);
    });
  });

  document.getElementById('cancelLogout').addEventListener('click', () => {
    document.getElementById('logoutPopup').classList.add('hidden');
  });
});
document.querySelectorAll('.sidebar-nav li[data-section]').forEach(item => {
  item.addEventListener('click', () => {
    // Remove active class from all sections and sidebar items
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.sidebar-nav li').forEach(nav => nav.classList.remove('active'));

    // Add active to clicked nav item
    item.classList.add('active');

    // Show corresponding section
    const sectionId = item.getAttribute('data-section');
    document.getElementById(sectionId).classList.add('active');
  });
});