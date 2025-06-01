import { auth, db } from './firebase.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js';
import { doc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js';

window.addEventListener('DOMContentLoaded', () => {
  const nameDisplay = document.getElementById('nameDisplay');
  const avatar = document.getElementById('avatar');
  const logoutBtn = document.getElementById('logoutBtn');

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();

        const fullName = userData.fullName || 'User';
        nameDisplay.textContent = `Welcome, ${fullName}!`;
        avatar.textContent = fullName.charAt(0).toUpperCase();

        const completedVideos = userData.completedVideos || {};
        const completedCount = Object.keys(completedVideos).length;
        document.getElementById('coursesWatchedCount').textContent = completedCount;
        document.getElementById('completedVideosDisplay').textContent = completedCount;

        const weeklyGoal = userData.weeklyGoal || 0;
        document.getElementById('weeklyGoalDisplay').textContent = weeklyGoal > 0 ? weeklyGoal : 'Not set';

        let progressPercent = 0;
        if (weeklyGoal > 0) {
          progressPercent = Math.min((completedCount / weeklyGoal) * 100, 100);
        }
        document.getElementById('goalsProgressPercent').textContent = `${Math.round(progressPercent)}%`;
        document.getElementById('weeklyProgressPercent').textContent = `${Math.round(progressPercent)}%`;

      } else {
        nameDisplay.textContent = 'Welcome!';
        avatar.textContent = '?';
        document.getElementById('coursesWatchedCount').textContent = '0';
        document.getElementById('completedVideosDisplay').textContent = '0';
        document.getElementById('weeklyGoalDisplay').textContent = 'Not set';
        document.getElementById('goalsProgressPercent').textContent = '0%';
        document.getElementById('weeklyProgressPercent').textContent = '0%';
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

document.getElementById('saveGoalBtn').addEventListener('click', async () => {
  const goalInput = document.getElementById('goalInput');
  const statusMsg = document.getElementById('goalStatusMsg');
  const goal = parseInt(goalInput.value);

  if (!isNaN(goal) && goal > 0) {
    const user = auth.currentUser;
    const userDocRef = doc(db, 'users', user.uid);

    await updateDoc(userDocRef, {
      weeklyGoal: goal
    });

    document.getElementById('weeklyGoalDisplay').textContent = goal;
    const completed = parseInt(document.getElementById('completedVideosDisplay').textContent);
    const percent = Math.min((completed / goal) * 100, 100);
    document.getElementById('goalsProgressPercent').textContent = `${Math.round(percent)}%`;
    document.getElementById('weeklyProgressPercent').textContent = `${Math.round(percent)}%`;

    statusMsg.textContent = 'Weekly goal updated!';
    statusMsg.style.color = 'green';

    setTimeout(() => {
      statusMsg.textContent = '';
    }, 3000);
  } else {
    statusMsg.textContent = 'Please enter a valid number!';
    statusMsg.style.color = 'red';
  }
});

document.querySelectorAll('.sidebar-nav li[data-section]').forEach(item => {
  item.addEventListener('click', () => {
    const sectionId = item.getAttribute('data-section');

    if (sectionId === 'progress' || sectionId === 'goals') {
      const dashboardSection = document.getElementById('dashboard');
      const headings = dashboardSection.querySelectorAll('h3.sub-heading');

      let targetHeading = null;
      headings.forEach(h => {
        if (h.textContent.trim().toLowerCase() === sectionId) {
          targetHeading = h;
        }
      });

      if (targetHeading) {
        targetHeading.scrollIntoView({ behavior: 'smooth', block: 'start' });

        targetHeading.classList.add('highlighted');

        setTimeout(() => {
          targetHeading.classList.remove('highlighted');
        }, 2000);
      }

      document.querySelectorAll('.sidebar-nav li').forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
    } else {
      document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
      document.querySelectorAll('.sidebar-nav li').forEach(nav => nav.classList.remove('active'));

      document.getElementById(sectionId).classList.add('active');
      item.classList.add('active');
    }
  });
});