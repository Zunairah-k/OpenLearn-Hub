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
  await updateDoc(userDoc, {
    [`completedVideos.${videoId}`]: true
  });
}

async function unmarkVideoCompleted(uid, videoId) {
  const userDoc = doc(db, "users", uid);
  await updateDoc(userDoc, {
    [`completedVideos.${videoId}`]: deleteField()
  });
}

function isVideoCompleted(completedVideos, videoId) {
  return !!completedVideos?.[videoId];
}

// ---------------- FETCH + DISPLAY ----------------

function getSubCourseFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return decodeURIComponent(urlParams.get("name") || "").toLowerCase().trim();
}

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

    const thumbnail = videoWrapper.querySelector(".video-thumbnail");
    const iframe = videoWrapper.querySelector("iframe");
    thumbnail.addEventListener("click", () => {
      iframe.style.display = "block";
    });

    const checkbox = videoWrapper.querySelector("input[type='checkbox']");
    checkbox.addEventListener("change", async () => {
      if (checkbox.checked) {
        await markVideoCompleted(user.uid, video.videoId);
        videoWrapper.classList.add("completed");
      } else {
        await unmarkVideoCompleted(user.uid, video.videoId);
        videoWrapper.classList.remove("completed");
      }
    });

    container.appendChild(videoWrapper);
  });
}

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