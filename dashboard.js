import { auth, db } from './firebase.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js';
import { doc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js';

window.addEventListener('DOMContentLoaded', () => {
  const nameDisplay = document.getElementById('nameDisplay');
  const avatar = document.getElementById('avatar');
  const logoutBtn = document.getElementById('logoutBtn');

async function loadQuizResults(uid) {
  //const quizResultsRef = doc(db, "users", uid);
  const quizSnapshot = await fetch(`https://openlearn-hub-backend.onrender.com/quiz-results/${uid}`);
  const results = await quizSnapshot.json();

  if (!Array.isArray(results)) return;
    
  document.getElementById("quizzesAttemptedCount").textContent = results.length;

  const labels = [];
  const data = [];
  const backgroundColors = [];

  results.forEach(result => {
    const percent = Math.round((result.score / result.total) * 100);
    const label = result.videoId || "Quiz";

    labels.push(label);
    data.push(percent);
    if (percent >= 80) backgroundColors.push("green");
    else if (percent >= 50) backgroundColors.push("orange");
    else backgroundColors.push("red");
  });

  const ctx = document.getElementById("quizChart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Quiz Accuracy (%)",
        data,
        backgroundColor: backgroundColors
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  });
  // Count perfect quizzes
let perfectScoreCount = 0;

results.forEach(result => {
  const percent = Math.round((result.score / result.total) * 100);
  if (percent === 100) perfectScoreCount++;  // ✅ Count 100% scores
});

// Unlock Perfectionist Badge if 5 or more perfect scores
const perfectionistBadge = document.getElementById('perfectionistBadge');
if (perfectionistBadge) {
  if (perfectScoreCount >= 5) {
    perfectionistBadge.classList.add('unlocked');
    perfectionistBadge.classList.remove('locked');
  } else {
    perfectionistBadge.classList.remove('unlocked');
    perfectionistBadge.classList.add('locked');
  }
}
}

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();

          const fullName = userData.fullName || 'User';
          nameDisplay.textContent = `Welcome, ${fullName}!`;
          avatar.textContent = fullName.charAt(0).toUpperCase();

          const completedVideos = userData.completedVideos || {};
          // 🔥 Count completed videos per main category
const categoryCounts = {};

for (const videoId in completedVideos) {
  const category = videoId.split('-')[0]; // Get prefix before the first dash
  if (!categoryCounts[category]) {
    categoryCounts[category] = 0;
  }
  categoryCounts[category]++;
}

// 🔥 Prepare data for pie chart
const pieLabels = Object.keys(categoryCounts).map(cat => {
  if (cat === "tech") return "Tech & Programming";
  if (cat === "business") return "Business & Finance";
  if (cat === "languages") return "Languages";
  if (cat === "personal") return "Personal Development";
  if (cat === "demanded") return "Highly Demanded Courses";
  return cat;
});

const pieData = Object.values(categoryCounts);
const pieColors = ["#3b82f6", "#22c55e", "#f97316", "#a855f7", "#ec4899"];

// 🔥 Render pie chart
const pieCtx = document.getElementById("courseCategoryPie").getContext("2d");

new Chart(pieCtx, {
  type: "pie",
  data: {
    labels: pieLabels,
    datasets: [{
      label: "Videos Completed by Category",
      data: pieData,
      backgroundColor: pieColors
    }]
  },
  options: {
    responsive: true
  }
});
          const completedCount = Object.keys(completedVideos).length;
          document.getElementById('coursesWatchedCount').textContent = completedCount;
          document.getElementById('completedVideosDisplay').textContent = completedCount;

          // Get current week range (Monday to Sunday)
          const now = new Date();
          const currentDay = now.getDay(); // 0=Sun, 1=Mon...
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - currentDay + 1); // Monday
          startOfWeek.setHours(0, 0, 0, 0);
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          endOfWeek.setHours(23, 59, 59, 999);

          let weeklyCompletedCount = 0;
          for (const videoId in completedVideos) {
            const videoData = completedVideos[videoId];
            if (videoData.timestamp) {
              const completedDate = new Date(videoData.timestamp);
              if (completedDate >= startOfWeek && completedDate <= endOfWeek) {
                weeklyCompletedCount++;
              }
            }
          }

          const weeklyGoal = userData.weeklyGoal || 0;
          document.getElementById('weeklyGoalDisplay').textContent = weeklyGoal > 0 ? weeklyGoal : 'Not set';

          let progressPercent = 0;
          if (weeklyGoal > 0) {
            progressPercent = Math.min((weeklyCompletedCount / weeklyGoal) * 100, 100);
          }
          document.getElementById('goalsProgressPercent').textContent = `${Math.round(progressPercent)}%`;
          document.getElementById('weeklyProgressPercent').textContent = `${Math.round(progressPercent)}%`;

          // Save counts globally for other uses if needed
          window.weeklyCompletedCount = weeklyCompletedCount;
          window.totalCompletedCount = completedCount;
          window.completedVideoTimestamps = completedVideos;

          // Update badges here
          updateBadges(completedCount, weeklyCompletedCount);
          console.log("📊 About to load quiz results for:", user.uid);
          await loadQuizResults(user.uid); 

        } else {
          resetUI();
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        resetUI();
      }
    } else {
      window.location.href = 'signin.html';
    }

  });

  function resetUI() {
    nameDisplay.textContent = 'Welcome!';
    avatar.textContent = '?';
    document.getElementById('coursesWatchedCount').textContent = '0';
    document.getElementById('completedVideosDisplay').textContent = '0';
    document.getElementById('weeklyGoalDisplay').textContent = 'Not set';
    document.getElementById('goalsProgressPercent').textContent = '0%';
    document.getElementById('weeklyProgressPercent').textContent = '0%';
  }

  // Badge logic function
  function updateBadges(completedCount, weeklyCompletedCount) {
    const starterBadge = document.getElementById('starterBadge');
    const scholarBadge = document.getElementById('scholarBadge');
    const streakBadge = document.getElementById('streakBadge');
    const perfectionistBadge = document.getElementById('perfectionistBadge');

    // Starter badge unlock condition: 1+ completed courses
    if (starterBadge) {
      if (completedCount >= 1) {
        starterBadge.classList.add('unlocked');
        starterBadge.classList.remove('locked');
      } else {
        starterBadge.classList.remove('unlocked');
        starterBadge.classList.add('locked');
      }
    }

    // Scholar badge unlock condition: 5+ completed courses
    if (scholarBadge) {
      if (completedCount >= 5) {
        scholarBadge.classList.add('unlocked');
        scholarBadge.classList.remove('locked');
      } else {
        scholarBadge.classList.remove('unlocked');
        scholarBadge.classList.add('locked');
      }
    }

    // Snapstreak style streak badge unlock
// Streak badge unlock condition: 3+ courses completed in one week
if (streakBadge) {
  if (weeklyCompletedCount >= 3) {
    streakBadge.classList.add('unlocked');
    streakBadge.classList.remove('locked');
  } else {
    streakBadge.classList.remove('unlocked');
    streakBadge.classList.add('locked');
  }
}
  }

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

  //async function loadQuizResults(uid) {

  // Save weekly goal button inside DOMContentLoaded!
  document.getElementById('saveGoalBtn').addEventListener('click', async () => {
    const goalInput = document.getElementById('goalInput');
    const statusMsg = document.getElementById('goalStatusMsg');
    const goal = parseInt(goalInput.value);

    if (!isNaN(goal) && goal > 0) {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('User not logged in');

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
      } catch (error) {
        statusMsg.textContent = 'Failed to update goal!';
        statusMsg.style.color = 'red';
        console.error(error);
      }
    } else {
      statusMsg.textContent = 'Please enter a valid number!';
      statusMsg.style.color = 'red';
    }
  });

  // Sidebar navigation click handler
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
});