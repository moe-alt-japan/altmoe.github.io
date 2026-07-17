
const vocabulary = [
  ["New Zealand", "ニュージーランド", "🇳🇿"],
  ["puppy, puppies", "子イヌ", "🐶"],
  ["of", "～の", "🔗"],
  ["someday", "いつか", "🌅"],
  ["lot", "[a lotまたはlotsで]たくさん", "📦"],
  ["they", "彼らは、彼女らは", "👥"],
  ["animal(s)", "動物", "🐾"],
  ["visit", "～を訪ねる", "✈️"],
  ["Japan", "日本", "🇯🇵"],
  ["many", "たくさんの、多くの", "👥"],
  ["one of", "～の1つ[1人]", "1️⃣"],
  ["a lot of", "たくさんの、多数の", "📚"],
  ["How many ...?", "どれくらい多くの、いくつの", "❓"],
  ["they’re", "⇐ they are", "💬"],
  ["noon", "正午、真昼", "☀️"],
  ["last", "最後の、最終の", "🏁"],
  ["like", "～のような", "👍"],
  ["o’clock", "～時", "🕐"],
  ["netball", "ネットボール", "🏐"],
  ["time", "時刻", "⏰"],
  ["afternoon", "午後", "🌤️"],
  ["sport(s)", "スポーツ", "🏅"],
  ["a.m.", "午前", "🌅"],
  ["p.m.", "午後", "🌇"],
  ["basketball", "バスケットボール", "🏀"],
  ["Sounds ...", "～そうですね。", "👂"],
  ["front", "前、正面", "⬆️"],
  ["be", "～である、～になる", "✨"],
  ["nervous", "緊張して", "😰"],
  ["worry", "心配する、悩む", "😟"],
  ["yourself", "あなた自身を[に]", "🪞"],
  ["sheep", "ヒツジ", "🐑"],
  ["kiwi(s)", "キーウィ", "🥝"],
  ["right", "正しい、正確な", "✅"],
  ["turn", "順番、番", "🔄"],
  ["please", "どうぞ、お願いします", "🙏"],
  ["look", "見る、目を向ける", "👀"],
  ["enjoy oneself", "楽しむ、楽しく過ごす", "🎉"],
  ["look at", "～を見る", "🔎"]
];

const pastelColors = [
  "#ffd8d8", "#d8e9ff", "#dcf7df", "#fff0c7", "#eadcff",
  "#d7f4f2", "#ffe0f0", "#e8f0c9", "#f7dfc8", "#dbe4ff",
  "#f6d7ff", "#d8f5e8", "#fff4d7", "#e0edff", "#f9dddd"
];

let xp = Number(localStorage.getItem("nhXp") || 0);
let soundOn = localStorage.getItem("nhSound") !== "off";
let quizItems = [];
let quizIndex = 0;
let quizScore = 0;
let quizAnswered = false;

const xpValue = document.getElementById("xpValue");
xpValue.textContent = xp;

function saveXP(points) {
  xp += points;
  xpValue.textContent = xp;
  localStorage.setItem("nhXp", xp);
}

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function beep(frequency = 520, duration = 0.08) {
  if (!soundOn) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = frequency;
    gain.gain.value = 0.05;
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (_) {}
}

function confetti() {
  const wrap = document.getElementById("celebration");
  const colors = ["#ff6b6b", "#ffd93d", "#6bcB77", "#4d96ff", "#b983ff"];
  for (let i = 0; i < 70; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = `${Math.random() * 0.5}s`;
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    wrap.appendChild(piece);
    setTimeout(() => piece.remove(), 2400);
  }
}

function renderFlashcards(words = vocabulary) {
  const grid = document.getElementById("flashcardGrid");
  grid.innerHTML = "";
  words.forEach(([english, japanese, emoji], index) => {
    const card = document.createElement("article");
    card.className = "flashcard";
    card.innerHTML = `
      <div class="flashcard-inner">
        <div class="flashcard-face flashcard-front" style="background:${pastelColors[index % pastelColors.length]}">
          <div class="emoji">${emoji}</div>
          <div class="word">${english}</div>
        </div>
        <div class="flashcard-face flashcard-back" style="background:${pastelColors[(index + 5) % pastelColors.length]}">
          <div class="meaning">${japanese}</div>
        </div>
      </div>`;
    card.addEventListener("click", () => {
      card.classList.toggle("flipped");
      beep(470);
    });
    grid.appendChild(card);
  });
}

document.getElementById("shuffleBtn").addEventListener("click", () => {
  renderFlashcards(shuffle(vocabulary));
  beep(620);
});

document.querySelectorAll(".mode-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".mode-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".mode-section").forEach(s => s.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.mode).classList.add("active");
    if (btn.dataset.mode === "quiz") startQuiz();
    if (btn.dataset.mode === "matching") startMatching();
    if (btn.dataset.mode === "memory") startMemory();
  });
});

function startQuiz() {
  quizItems = shuffle(vocabulary).slice(0, 10);
  quizIndex = 0;
  quizScore = 0;
  quizAnswered = false;
  renderQuiz();
}

function renderQuiz() {
  const current = quizItems[quizIndex];
  if (!current) {
    document.getElementById("quizPrompt").textContent = `Finished! ${quizScore} / 10`;
    document.getElementById("quizChoices").innerHTML = "";
    document.getElementById("quizFeedback").textContent =
      quizScore >= 8 ? "Excellent! すばらしい！" : "Good job! もう一度挑戦しよう！";
    document.getElementById("quizNextBtn").classList.add("hidden");
    saveXP(quizScore * 5);
    confetti();
    return;
  }

  quizAnswered = false;
  document.getElementById("quizProgress").textContent = `${quizIndex + 1} / ${quizItems.length}`;
  document.getElementById("quizScore").textContent = `Score: ${quizScore}`;
  document.getElementById("quizPrompt").textContent = current[1];
  document.getElementById("quizFeedback").textContent = "";
  document.getElementById("quizNextBtn").classList.add("hidden");

  const wrong = shuffle(vocabulary.filter(v => v[0] !== current[0])).slice(0, 3);
  const choices = shuffle([current, ...wrong]);
  const area = document.getElementById("quizChoices");
  area.innerHTML = "";

  choices.forEach(choice => {
    const button = document.createElement("button");
    button.className = "choice-btn";
    button.textContent = choice[0];
    button.addEventListener("click", () => {
      if (quizAnswered) return;
      quizAnswered = true;
      const buttons = [...document.querySelectorAll(".choice-btn")];
      buttons.forEach(b => {
        if (b.textContent === current[0]) b.classList.add("correct");
      });

      if (choice[0] === current[0]) {
        button.classList.add("correct");
        quizScore++;
        saveXP(10);
        document.getElementById("quizFeedback").textContent = "Correct! 正解！ +10 XP";
        beep(760);
      } else {
        button.classList.add("wrong");
        document.getElementById("quizFeedback").textContent = `Answer: ${current[0]}`;
        beep(220);
      }

      document.getElementById("quizScore").textContent = `Score: ${quizScore}`;
      document.getElementById("quizNextBtn").classList.remove("hidden");
    });
    area.appendChild(button);
  });
}

document.getElementById("quizNextBtn").addEventListener("click", () => {
  quizIndex++;
  renderQuiz();
});

function startMatching() {
  const round = shuffle(vocabulary).slice(0, 6);
  const english = round.map((item, i) => ({text: item[0], id: i}));
  const japanese = shuffle(round.map((item, i) => ({text: item[1], id: i})));
  const board = document.getElementById("matchingBoard");
  board.innerHTML = `<div class="match-column" id="englishCol"></div><div class="match-column" id="japaneseCol"></div>`;
  let selectedEnglish = null;
  let selectedJapanese = null;
  let matched = 0;

  function check() {
    if (!selectedEnglish || !selectedJapanese) return;
    if (selectedEnglish.dataset.id === selectedJapanese.dataset.id) {
      selectedEnglish.classList.add("matched");
      selectedJapanese.classList.add("matched");
      matched++;
      saveXP(10);
      beep(760);
      document.getElementById("matchProgress").textContent = `${matched} / 6`;
      if (matched === 6) {
        confetti();
        saveXP(25);
      }
    } else {
      beep(220);
    }
    selectedEnglish?.classList.remove("selected");
    selectedJapanese?.classList.remove("selected");
    selectedEnglish = null;
    selectedJapanese = null;
  }

  english.forEach(item => {
    const card = document.createElement("button");
    card.className = "match-card";
    card.textContent = item.text;
    card.dataset.id = item.id;
    card.addEventListener("click", () => {
      document.querySelectorAll("#englishCol .match-card").forEach(c => c.classList.remove("selected"));
      selectedEnglish = card;
      card.classList.add("selected");
      check();
    });
    document.getElementById("englishCol").appendChild(card);
  });

  japanese.forEach(item => {
    const card = document.createElement("button");
    card.className = "match-card";
    card.textContent = item.text;
    card.dataset.id = item.id;
    card.addEventListener("click", () => {
      document.querySelectorAll("#japaneseCol .match-card").forEach(c => c.classList.remove("selected"));
      selectedJapanese = card;
      card.classList.add("selected");
      check();
    });
    document.getElementById("japaneseCol").appendChild(card);
  });

  document.getElementById("matchProgress").textContent = "0 / 6";
}

document.getElementById("newMatchingBtn").addEventListener("click", startMatching);

function startMemory() {
  const round = shuffle(vocabulary).slice(0, 6);
  const cards = shuffle(round.flatMap((item, id) => [
    {id, text: item[0], type: "en"},
    {id, text: item[1], type: "ja"}
  ]));

  const board = document.getElementById("memoryBoard");
  board.innerHTML = "";
  let first = null;
  let lock = false;
  let matched = 0;

  cards.forEach(cardData => {
    const card = document.createElement("button");
    card.className = "memory-card";
    card.textContent = "?";
    card.dataset.id = cardData.id;
    card.dataset.text = cardData.text;

    card.addEventListener("click", () => {
      if (lock || card.classList.contains("matched") || card === first) return;
      card.classList.add("revealed");
      card.textContent = card.dataset.text;
      beep(480);

      if (!first) {
        first = card;
        return;
      }

      lock = true;
      if (first.dataset.id === card.dataset.id) {
        setTimeout(() => {
          first.classList.add("matched");
          card.classList.add("matched");
          matched++;
          document.getElementById("memoryProgress").textContent = `${matched} / 6`;
          saveXP(12);
          beep(760);
          first = null;
          lock = false;
          if (matched === 6) {
            confetti();
            saveXP(25);
          }
        }, 450);
      } else {
        setTimeout(() => {
          first.classList.remove("revealed");
          card.classList.remove("revealed");
          first.textContent = "?";
          card.textContent = "?";
          first = null;
          lock = false;
          beep(220);
        }, 850);
      }
    });

    board.appendChild(card);
  });

  document.getElementById("memoryProgress").textContent = "0 / 6";
}

document.getElementById("newMemoryBtn").addEventListener("click", startMemory);

document.getElementById("themeBtn").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const dark = document.body.classList.contains("dark");
  localStorage.setItem("nhTheme", dark ? "dark" : "light");
  document.getElementById("themeBtn").textContent = dark ? "🌙" : "☀️";
});

document.getElementById("soundBtn").addEventListener("click", () => {
  soundOn = !soundOn;
  localStorage.setItem("nhSound", soundOn ? "on" : "off");
  document.getElementById("soundBtn").textContent = soundOn ? "🔊" : "🔇";
});

if (localStorage.getItem("nhTheme") === "dark") {
  document.body.classList.add("dark");
  document.getElementById("themeBtn").textContent = "🌙";
}
document.getElementById("soundBtn").textContent = soundOn ? "🔊" : "🔇";

renderFlashcards();
