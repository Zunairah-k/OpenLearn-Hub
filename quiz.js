async function generateQuiz(videoTitle, difficulty, topic) {
  const res = await fetch("https://openlearn-hub-backend.onrender.com/generate-quiz", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ videoTitle, difficulty, topic })
  });

  const data = await res.json();
  return data.quiz;
}

function renderQuiz(quiz, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  quiz.forEach((q, index) => {
    const questionEl = document.createElement("div");
    questionEl.classList.add("quiz-question");

    questionEl.innerHTML = `
      <p><strong>Q${index + 1}:</strong> ${q.question}</p>
      ${q.options.map((opt, i) => `
        <label><input type="radio" name="q${index}" value="${opt}"> ${opt}</label><br/>
      `).join("")}
    `;
    container.appendChild(questionEl);
  });

  const submitBtn = document.createElement("button");
  submitBtn.textContent = "Submit Quiz";
  submitBtn.onclick = () => evaluateQuiz(quiz, containerId);
  container.appendChild(submitBtn);
}

function evaluateQuiz(quiz, containerId) {
  let score = 0;

  quiz.forEach((q, index) => {
    const selected = document.querySelector(`input[name="q${index}"]:checked`);
    if (selected && selected.value === q.answer) score++;
  });

  alert(`You scored ${score}/${quiz.length}`);
  saveQuizResult(score, quiz.length);
}

function saveQuizResult(score, total) {
  const uid = localStorage.getItem("uid");
  const videoId = new URLSearchParams(window.location.search).get("videoId");

  fetch("https://openlearn-hub-backend.onrender.com/submit-quiz", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid, videoId, score, total, difficulty: "beginner" })
  });
}
