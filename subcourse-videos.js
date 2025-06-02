let currentQuizData = [];
// STEP 1: Fetch videos.json from local data folder
import {
  getFirestore,
  doc,
  updateDoc,
  getDoc,
  deleteField
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

const API_URL = "./videos.json";
const db = getFirestore();
const auth = getAuth();
let allVideos = [];

// ---------------- FIREBASE HANDLERS ----------------

async function getCompletedVideos(uid) {
  const docRef = doc(db, "users", uid);
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data().completedVideos || {} : {};
}

async function markVideoCompleted(uid, videoId) {
  const userDoc = doc(db, "users", uid);
  const timestamp = Date.now();
  await updateDoc(userDoc, {
    [`completedVideos.${videoId}`]: {
      completed: true,
      timestamp: timestamp
    }
  });
}

async function unmarkVideoCompleted(uid, videoId) {
  const userDoc = doc(db, "users", uid);
  await updateDoc(userDoc, {
    [`completedVideos.${videoId}`]: deleteField()
  });
}

function isVideoCompleted(completedVideos, videoId) {
  return !!completedVideos?.[videoId]?.completed;
}

// ---------------- FETCH + DISPLAY ----------------

function getSubCourseFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return decodeURIComponent(urlParams.get("name") || "").toLowerCase().trim();
}

window.submitQuiz = async function(button) {
  const box = button.closest(".quiz-box");
  const questions = box.querySelectorAll("ol > li");
  let score = 0;

  questions.forEach((q, i) => {
    const selected = q.querySelector("input[type='radio']:checked");
    const answer = currentQuizData[i].answer;
    //if (selected && selected.value.trim().startsWith(answer)) {
     if (selected && selected.value.trim().charAt(0)==answer) {
    //if (selected && selected.value.trim().split('.')[0]=== answer) {
      score++;
    }
  });

  const total = currentQuizData.length;

  // ✅ Send to backend
  const user = auth.currentUser;
  if (user) {
    try {
      await fetch("https://openlearn-hub-backend.onrender.com/submit-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          uid: user.uid,
          videoId: box.closest(".quiz-modal").getAttribute("data-video-id"),
          score,
          total,
          difficulty: "beginner" // You can make this dynamic later
        })
      });
    } catch (err) {
      console.error("Failed to submit quiz result:", err);
    }
  }

  alert(`🎉 You scored ${score} out of ${total}!`);
  document.querySelector(".quiz-modal").remove();
};


async function displayVideos(data) {
  const container = document.querySelector(".video-container");
  container.innerHTML = "";

  const subCourse = getSubCourseFromURL();
  const user = auth.currentUser;

  if (!user) {
    container.innerHTML = "<p>Please log in to track progress.</p>";
    return;
  }

  const completedVideos = await getCompletedVideos(user.uid);

  const videosToShow = data.filter(video =>
    video.subCourse?.toLowerCase().trim() === subCourse
  );

  if (!videosToShow.length) {
    container.innerHTML = "<p>No videos found for this subcourse.</p>";
    return;
  }

  videosToShow.forEach(video => {
    const languageDisplay = Array.isArray(video.language)
      ? video.language.join(", ")
      : video.language;

    const videoWrapper = document.createElement("div");
    videoWrapper.classList.add("video-wrapper");

    const isCompleted = isVideoCompleted(completedVideos, video.videoId);

    videoWrapper.innerHTML = `
      <div class="video-card ${isCompleted ? "completed" : ""}">
        <img src="${video.thumbnail}" class="video-thumbnail" alt="Video Thumbnail">
        <div class="video-info">
          <h4 class="video-title">${video.title}</h4>
          <p class="video-description">${video.description}</p>
          <p class="video-meta">
            <strong>Level:</strong> ${video.level} |
            <strong>Duration:</strong> ${video.duration} |
            <strong>Language:</strong> ${languageDisplay}
          </p>
          <button class="quiz-btn" data-video-id="${video.videoId}" data-title="${video.title}">📝 Take Quiz</button>
          <label class="completion-checkbox">
            <input type="checkbox" data-video-id="${video.videoId}" ${isCompleted ? "checked" : ""}>
            Mark as Completed
          </label>
        </div>
        <iframe
          src="https://www.youtube.com/embed/${video.videoId}?enablejsapi=1"
          frameborder="0"
          allowfullscreen
          class="video-frame"
          style="display:none"
          id="yt-${video.videoId}"
        ></iframe>
      </div>
    `;

    videoWrapper.querySelector(".quiz-btn").addEventListener("click", () => {
      const loader = document.createElement("div");
loader.className = "quiz-loading";
loader.innerHTML = "⏳ Generating quiz...";
document.body.appendChild(loader);
  const btn = videoWrapper.querySelector(".quiz-btn");
  const videoId = btn.getAttribute("data-video-id");
  const title = btn.getAttribute("data-title");
  const subCourse = getSubCourseFromURL(); // you already have this function

  fetch("https://openlearn-hub-backend.onrender.com/generate-quiz", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      videoTitle: title,
      difficulty: "beginner", // make dynamic later if needed
      topic: subCourse
    })
  })
    .then(res => res.json())
    .then(data => {
      if (!data.quiz || !Array.isArray(data.quiz)) {
        throw new Error("Quiz data missing or invalid");
      }
      showQuizModal(data.quiz, videoId); 

    })
    .catch(err => {
      console.error("Quiz fetch failed:", err);
      alert("Quiz generation failed. Please try again.");
    });
});

const thumbnail = videoWrapper.querySelector(".video-thumbnail");
    const iframe = videoWrapper.querySelector("iframe");
    thumbnail.addEventListener("click", () => {
      iframe.style.display = "block";
    });

    const checkbox = videoWrapper.querySelector("input[type='checkbox']");
    checkbox.addEventListener("change", async () => {
      if (checkbox.checked) {
        await markVideoCompleted(user.uid, video.videoId);
        videoWrapper.querySelector(".video-card").classList.add("completed");
      } else {
        await unmarkVideoCompleted(user.uid, video.videoId);
        videoWrapper.querySelector(".video-card").classList.remove("completed");
      }
    });

    container.appendChild(videoWrapper);
  });
}

function showQuizModal(quizData, videoId) {
  currentQuizData = quizData;

  const modal = document.createElement("div");
  modal.className = "quiz-modal";
  modal.setAttribute("data-video-id", videoId); 

  // HTML: Close button + quiz box
  let html = `
    <div class="quiz-box">
      <div class="quiz-header">
        <h3>🧠 Quiz</h3>
        <button class="close-btn" onclick="closeQuizModal()">❌</button>
      </div>
      <ol>
  `;

  quizData.forEach((q, idx) => {
    html += `<li>
      <p>${q.question}</p>
      ${q.options.map(opt => `
        <label><input type="radio" name="q${idx}" value="${opt}"> ${opt}</label><br>
      `).join("")}
    </li>`;
  });

  html += `</ol>
      <button onclick="submitQuiz(this)">Submit</button>
    </div>`;

  modal.innerHTML = html;
  document.body.appendChild(modal);
}

/* Handle form submission
  document.getElementById("quizForm").addEventListener("submit", function (e) {
    e.preventDefault();
    submitQuiz();
  });*/

  window.closeQuizModal = function() {
  document.querySelector(".quiz-modal")?.remove();
  document.getElementById("quizLoading")?.classList.add("hidden"); // Just in case it's stuck
};

// ---------------- FILTERS ----------------

function setupFilters() {
  const levelFilter = document.getElementById("filter-level");
  const durationFilter = document.getElementById("filter-duration");
  const languageFilter = document.getElementById("filter-language");

  const subCourse = getSubCourseFromURL();
  document.getElementById("subcourse-title").textContent = subCourse
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  function applyFilters() {
    const selectedLevel = levelFilter.value;
    const selectedDuration = durationFilter.value;
    const selectedLanguage = languageFilter.value;

    const filtered = allVideos.filter(video => {
      const matchSubCourse = video.subCourse?.toLowerCase().trim() === subCourse;
      const matchLevel = !selectedLevel || video.level === selectedLevel;
      const matchDuration = !selectedDuration || video.duration === selectedDuration;
      const matchLanguage = !selectedLanguage ||
        (Array.isArray(video.language)
          ? video.language.includes(selectedLanguage)
          : video.language === selectedLanguage);

      return matchSubCourse && matchLevel && matchDuration && matchLanguage;
    });

    displayVideos(filtered);
  }

  levelFilter.addEventListener("change", applyFilters);
  durationFilter.addEventListener("change", applyFilters);
  languageFilter.addEventListener("change", applyFilters);
}

// ---------------- YOUTUBE API (Auto Complete) ----------------

function setupYouTubeAPI() {
  window.onYouTubeIframeAPIReady = () => {
    const iframes = document.querySelectorAll("iframe[id^='yt-']");
    iframes.forEach(iframe => {
      const player = new YT.Player(iframe.id, {
        events: {
          'onStateChange': async (event) => {
            if (event.data === YT.PlayerState.ENDED) {
              const videoId = iframe.id.replace("yt-", "");
              const user = auth.currentUser;
              if (user) {
                await markVideoCompleted(user.uid, videoId);
                const card = iframe.closest(".video-card");
                if (card) card.classList.add("completed");
              }
            }
          }
        }
      });
    });
  };

  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  document.body.appendChild(tag);
}

// ---------------- INIT ----------------

onAuthStateChanged(auth, (user) => {
  if (user) {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        allVideos = data;
        displayVideos(allVideos);
        setupFilters();
        setupYouTubeAPI();
      })
      .catch(err => {
        console.error("Error fetching videos.json:", err);
        document.querySelector(".video-container").innerHTML = "<p>Failed to load videos.</p>";
      });
  } else {
    document.querySelector(".video-container").innerHTML = "<p>Please log in to view videos.</p>";
  }
});