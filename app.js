const fallbackFacts = [
  {
    id: 1,
    title: "India's Digital Public Infrastructure model adopted by multiple countries",
    topic: "Polity & Governance",
    examTag: "UPSC/SSC",
    detail:
      "Several nations are studying India's UPI, Aadhaar-style architecture, and digital payment governance as case studies for public service delivery.",
  },
];

const fallbackQuiz = [
  {
    question: "UPI in India is best categorized as:",
    options: ["A tax law", "A digital public payment infrastructure", "A satellite program", "A census initiative"],
    answer: "A digital public payment infrastructure",
  },
];

const STORAGE_KEYS = {
  bookmarks: "gkPulseBookmarks",
  streakDate: "gkPulseLastVisitDate",
  streakCount: "gkPulseStreakCount",
};

let activeTopic = "All";
let visibleFacts = [];
let facts = fallbackFacts;
let quizBank = fallbackQuiz;
let dataLastUpdated = "Unknown";
let bookmarks = new Set(JSON.parse(localStorage.getItem(STORAGE_KEYS.bookmarks) || "[]"));

const els = {
  date: document.getElementById("today-date"),
  count: document.getElementById("daily-count"),
  streak: document.getElementById("streak-count"),
  filters: document.getElementById("topic-filters"),
  factsList: document.getElementById("facts-list"),
  bookmarkList: document.getElementById("bookmark-list"),
  quizBox: document.getElementById("quiz-box"),
  refreshBtn: document.getElementById("refresh-btn"),
  clearBookmarks: document.getElementById("clear-bookmarks"),
  dataStatus: document.getElementById("data-status"),
};

async function loadData() {
  try {
    const response = await fetch("./data/current-affairs.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();

    if (Array.isArray(payload.facts) && payload.facts.length > 0) facts = payload.facts;
    if (Array.isArray(payload.quizBank) && payload.quizBank.length > 0) quizBank = payload.quizBank;
    dataLastUpdated = payload.lastUpdated || "Unknown";
    els.dataStatus.textContent = `Live dataset loaded. Last updated: ${dataLastUpdated}.`;
  } catch (error) {
    els.dataStatus.textContent = "Could not load live dataset. Running with fallback sample data.";
    console.error("Data loading failed:", error);
  }
}

function formatDate(date = new Date()) {
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function updateStreak() {
  const today = new Date();
  const todayISO = today.toISOString().slice(0, 10);
  const lastVisit = localStorage.getItem(STORAGE_KEYS.streakDate);
  const lastCount = Number(localStorage.getItem(STORAGE_KEYS.streakCount) || 0);

  let streakCount = lastCount;
  if (!lastVisit) streakCount = 1;
  else {
    const diffDays = Math.floor((new Date(todayISO) - new Date(lastVisit)) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) streakCount += 1;
    else if (diffDays > 1) streakCount = 1;
  }

  localStorage.setItem(STORAGE_KEYS.streakDate, todayISO);
  localStorage.setItem(STORAGE_KEYS.streakCount, String(streakCount));
  els.streak.textContent = streakCount;
}

function pickFacts() {
  const source = activeTopic === "All" ? facts : facts.filter((fact) => fact.topic === activeTopic);
  const shuffled = [...source].sort(() => Math.random() - 0.5);
  visibleFacts = shuffled.slice(0, Math.min(5, shuffled.length));
  els.count.textContent = visibleFacts.length;
}

function renderFilters() {
  const topics = ["All", ...new Set(facts.map((fact) => fact.topic))];
  els.filters.innerHTML = "";

  topics.forEach((topic) => {
    const btn = document.createElement("button");
    btn.className = `chip ${activeTopic === topic ? "active" : ""}`;
    btn.textContent = topic;
    btn.addEventListener("click", () => {
      activeTopic = topic;
      renderFilters();
      pickFacts();
      renderFacts();
    });
    els.filters.appendChild(btn);
  });
}

function persistBookmarks() {
  localStorage.setItem(STORAGE_KEYS.bookmarks, JSON.stringify([...bookmarks]));
}

function renderBookmarks() {
  els.bookmarkList.innerHTML = "";

  if (bookmarks.size === 0) {
    const li = document.createElement("li");
    li.textContent = "No bookmarks yet — save key updates for weekend revision.";
    els.bookmarkList.appendChild(li);
    return;
  }

  [...bookmarks]
    .map((id) => facts.find((fact) => fact.id === id))
    .filter(Boolean)
    .forEach((fact) => {
      const li = document.createElement("li");
      li.textContent = `${fact.title} (${fact.topic})`;
      els.bookmarkList.appendChild(li);
    });
}

function renderFacts() {
  els.factsList.innerHTML = "";

  if (visibleFacts.length === 0) {
    els.factsList.innerHTML = '<p class="hint">No facts in this topic yet.</p>';
    return;
  }

  visibleFacts.forEach((fact) => {
    const card = document.createElement("article");
    card.className = "fact-card";

    const isSaved = bookmarks.has(fact.id);
    card.innerHTML = `
      <h3>${fact.title}</h3>
      <div class="meta">
        <span class="tag">${fact.topic}</span>
        <span class="tag">${fact.examTag}</span>
      </div>
      <p>${fact.detail}</p>
      <button class="btn btn--primary">${isSaved ? "Bookmarked" : "Bookmark"}</button>
    `;

    card.querySelector("button").addEventListener("click", () => {
      if (bookmarks.has(fact.id)) bookmarks.delete(fact.id);
      else bookmarks.add(fact.id);
      persistBookmarks();
      renderFacts();
      renderBookmarks();
    });

    els.factsList.appendChild(card);
  });
}

function renderQuiz() {
  if (!quizBank.length) return;
  const idx = new Date().getDate() % quizBank.length;
  const quiz = quizBank[idx];
  els.quizBox.innerHTML = `<h3>${quiz.question}</h3>`;

  quiz.options.forEach((option) => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.textContent = option;

    btn.addEventListener("click", () => {
      const options = els.quizBox.querySelectorAll(".option");
      options.forEach((item) => {
        item.disabled = true;
        if (item.textContent === quiz.answer) item.classList.add("correct");
      });
      if (option !== quiz.answer) btn.classList.add("incorrect");
    });

    els.quizBox.appendChild(btn);
  });
}

async function init() {
  els.date.textContent = formatDate();
  updateStreak();
  await loadData();
  renderFilters();
  pickFacts();
  renderFacts();
  renderBookmarks();
  renderQuiz();

  els.refreshBtn.addEventListener("click", () => {
    pickFacts();
    renderFacts();
  });

  els.clearBookmarks.addEventListener("click", () => {
    bookmarks = new Set();
    persistBookmarks();
    renderFacts();
    renderBookmarks();
  });
}

init();
