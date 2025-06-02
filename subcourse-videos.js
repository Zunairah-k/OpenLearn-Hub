let currentQuizData = [];
// STEP 1: Fetch videos.json from local data folder
const API_URL = "./videos.json";
let allVideos = []; // Global to use across filters

// STEP 2: Fetch the data and pass it directly to displayVideos (no conversion needed)
fetch(API_URL)
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    allVideos = data;
    displayVideos(allVideos); // No conversion needed!
    setupFilters();
  })
  .catch(error => {
    console.error("Error fetching videos:", error);
    document.querySelector(".video-container").innerHTML = "<p>Failed to load videos.</p>";
  });

// STEP 3: Display the videos based on subcourse from URL
function getSubCourseFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const subcourseName = urlParams.get("name") || "";
  return decodeURIComponent(subcourseName).toLowerCase().trim();
}

function displayVideos(data) {
  const container = document.querySelector(".video-container");
  container.innerHTML = ""; // Clear previous

  const subCourse = getSubCourseFromURL();

  // Filter videos ONLY for current subcourse
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


    videoWrapper.innerHTML = `
      <div class="video-card">
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
        </div>
        <iframe
          src="https://www.youtube.com/embed/${video.videoId}"
          frameborder="0"
          allowfullscreen
          class="video-frame"
          style="display:none"
        ></iframe>
      </div>
    `;

    videoWrapper.querySelector(".quiz-btn").addEventListener("click", () => {
  const btn = videoWrapper.querySelector(".quiz-btn");
  const videoId = btn.getAttribute("data-video-id");
  const title = btn.getAttribute("data-title");

  fetch("https://openlearn-hub-backend.onrender.com/generate-quiz", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
      body: JSON.stringify({ 
      videoTitle: title,
      difficulty: "beginner",  
      topic: subCourse        
    })

  })
    .then(res => res.json())
    .then(data => {
  if (!data.quiz || !Array.isArray(data.quiz)) {
    throw new Error("Quiz data missing or invalid");
  }
  showQuizModal(data.quiz);
})
    .catch(err => {
      console.error("Quiz fetch failed:", err);
      alert("Quiz generation failed. Please try again.");
    });
});

function showQuizModal(quizData) {
  currentQuizData = quizData; // 👈 Save for global access
  const modal = document.createElement("div");
  modal.className = "quiz-modal";

  let html = `<div class="quiz-box"><h3>Quiz</h3><ol>`;

  quizData.forEach((q, idx) => {
    html += `<li>
      <p>${q.question}</p>
      ${q.options.map(opt => `
        <label><input type="radio" name="q${idx}" value="${opt}"> ${opt}</label><br>
      `).join("")}
    </li>`;
  });

  html += `</ol><button onclick="submitQuiz(this)">Submit</button></div>`;
  modal.innerHTML = html;
  document.body.appendChild(modal);
}

function submitQuiz(button) {
  const box = button.closest(".quiz-box");
  const questions = box.querySelectorAll("ol > li");
  let score = 0;

  questions.forEach((q, i) => {
    const selected = q.querySelector("input[type='radio']:checked");
    const answer = currentQuizData[i].answer;
    if (selected && selected.value === answer) {
      score++;
    }
  });

  alert(`You scored ${score} out of ${currentQuizData.length}!`);
  document.querySelector(".quiz-modal").remove();
}

    videoWrapper.querySelector(".video-thumbnail").addEventListener("click", () => {
      const iframe = videoWrapper.querySelector(".video-frame");
      iframe.style.display = "block";
    });

    container.appendChild(videoWrapper);
  });
}
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
