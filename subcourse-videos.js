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
