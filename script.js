// app.js - matches your HTML structure & IDs

// ---------- challenge database (icons + prompts) ----------
const challengeDatabase = {
  Art: {
    icon: "🎨",
    challenges: [
      "Create a self-portrait using only three colors",
      "Draw your favorite place using only lines, no shading",
      "Make a collage representing your current mood",
      "Paint a mini landscape with your fingers",
      "Sketch 10 different facial expressions in 20 minutes",
      "Create abstract art inspired by your favorite song"
    ]
  },
  Guitar: {
    icon: "🎸",
    challenges: [
      "Learn and record a 30-second riff from your favorite song",
      "Practice chord transitions for 20 minutes",
      "Write a simple 4-chord progression and record it",
      "Learn to play 'Happy Birthday' in 3 keys",
      "Practice fingerpicking for 15 minutes",
      "Record yourself improvising over a backing track"
    ]
  },
  Piano: {
    icon: "🎹",
    challenges: [
      "Learn the first 8 bars of 'Für Elise'",
      "Practice C major scale 10× with correct fingering",
      "Learn a simple version of 'Let It Be'",
      "Compose and record an 8-bar melody",
      "Play 'Twinkle Twinkle' in different octaves",
      "Learn basic jazz chords: Cmaj7, Dm7, G7"
    ]
  },
  Coding: {
    icon: "💻",
    challenges: [
      "Build a simple calculator using HTML/CSS/JS",
      "Create a random quote generator",
      "Make a to-do list with add/remove",
      "Build a color palette generator",
      "Make a countdown timer for an event",
      "Solve one coding challenge online"
    ]
  },
  Skating: {
    icon: "🛹",
    challenges: [
      "Practice ollies: land 10 clean ones in a row",
      "Ride switch stance for 5 minutes straight",
      "Master kickturns both sides",
      "Balance on your board for 60s",
      "Practice pumping to gain speed",
      "Film yourself doing your best trick"
    ]
  },
  Crochet: {
    icon: "🧶",
    challenges: [
      "Make a granny square",
      "Create a basic dishcloth using single crochet",
      "Learn double crochet and make a 6-inch swatch",
      "Make a fringe bookmark",
      "Create 5 small flowers",
      "Start a small scarf (10+ rows)"
    ]
  },
  Sewing: {
    icon: "✂️",
    challenges: [
      "Sew a tote bag (simple straight seams)",
      "Make fabric coasters",
      "Practice different hand stitches on scraps",
      "Create a pillowcase with French seams",
      "Make bookmarks with ribbons",
      "Add patches/appliques to a garment"
    ]
  },
  Cooking: {
    icon: "👩‍🍳",
    challenges: [
      "Try a recipe from a new cuisine",
      "Bake bread from scratch (any type)",
      "Create a dish using only what you have",
      "Make pasta from scratch",
      "Try a new technique (braising, grilling)",
      "Make a meal with 5+ veg"
    ]
  }
};

// ---------- storage helpers ----------
function getUser(email) {
  const raw = localStorage.getItem("hobbyverse_user_" + email);
  return raw ? JSON.parse(raw) : null;
}
function saveUser(email, userObj) {
  localStorage.setItem("hobbyverse_user_" + email, JSON.stringify(userObj));
}
function getGame(email) {
  const raw = localStorage.getItem("hobbyverse_game_" + email);
  if (raw) return JSON.parse(raw);
  // default game data
  return {
    level: 1,
    xp: 0,
    completed: 0,
    streak: 0,
    rerollsLeft: 1,
    lastDaily: null // { date: 'Wed Sep 10 2025', challenges: [ {hobby, icon, text, xp}, ... ] }
  };
}
function saveGame(email, gameObj) {
  localStorage.setItem("hobbyverse_game_" + email, JSON.stringify(gameObj));
}

// ---------- state ----------
let currentEmail = null; // email of signed-in user

// ---------- small utils ----------
function shuffle(arr) {
  return arr.slice().sort(() => Math.random() - 0.5);
}
function todayStr() {
  return new Date().toDateString();
}

// ---------- AUTH (uses your HTML IDs: loginEmail/loginPassword etc.) ----------
function showSignup() {
  document.getElementById("loginForm").classList.add("hidden");
  document.getElementById("signupForm").classList.remove("hidden");
}
function showLogin() {
  document.getElementById("signupForm").classList.add("hidden");
  document.getElementById("loginForm").classList.remove("hidden");
}

function signup() {
  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim().toLowerCase();
  const password = document.getElementById("signupPassword").value;

  if (!name || !email || !password) { alert("Please fill all fields"); return; }
  if (getUser(email)) { alert("User already exists — try signing in"); return; }

  const user = {
    name,
    email,
    password,
    avatar: null,
    hobbies: [],
    username: null,
    createdAt: new Date().toISOString()
  };
  saveUser(email, user);
  // initialize game
  saveGame(email, getGame(email));
  currentEmail = email;
  showProfileSetup();
}

function login() {
  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) { alert("Please fill all fields"); return; }
  const user = getUser(email);
  if (!user) { alert("User not found. Please create an account first."); return; }
  if (user.password !== password) { alert("Incorrect password"); return; }

  currentEmail = email;
  // if no profile set (avatar/hobbies/username), force profile setup
  if (!user.avatar || !user.hobbies || user.hobbies.length < 1 || !user.username) {
    // set temp setup data from user (if any)
    showProfileSetup();
    // prefill any available picks (optional)
    return;
  }

  showDashboard(); // shows dashboard & loads everything
}

// ---------- PROFILE SETUP (uses your existing HTML steps/avatar/hobbies/username) ----------
let setupTemp = { avatar: null, hobbies: [], username: "" };

function showProfileSetup() {
  document.getElementById("authScreen").classList.add("hidden");
  document.getElementById("profileSetup").classList.remove("hidden");
  // reset step UI
  document.getElementById("avatarStep").classList.remove("hidden");
  document.getElementById("hobbiesStep").classList.add("hidden");
  document.getElementById("usernameStep").classList.add("hidden");
  document.getElementById("step1").classList.add("active");
  document.getElementById("step2").classList.remove("active");
  document.getElementById("step3").classList.remove("active");
  document.getElementById("avatarNext").disabled = true;
  document.getElementById("hobbiesNext").disabled = true;
  setupTemp = { avatar: null, hobbies: [], username: "" };
  // clear selections in UI
  document.querySelectorAll(".avatar-option").forEach(el => el.classList.remove("selected"));
  document.querySelectorAll(".hobby-card").forEach(el => el.classList.remove("selected"));
}

function selectAvatar(emoji) {
  // mark selection visually
  document.querySelectorAll(".avatar-option").forEach(el => el.classList.remove("selected"));
  const found = Array.from(document.querySelectorAll(".avatar-option")).find(el => el.textContent.trim() === emoji);
  if (found) found.classList.add("selected");
  setupTemp.avatar = emoji;
  document.getElementById("avatarNext").disabled = false;
}

function toggleHobby(hobbyName) {
  // find card by hobby text
  const cards = Array.from(document.querySelectorAll(".hobby-card"));
  const card = cards.find(c => c.querySelector(".hobby-name") && c.querySelector(".hobby-name").textContent.trim() === hobbyName);
  if (!card) return;
  const isSelected = card.classList.contains("selected");
  if (isSelected) {
    card.classList.remove("selected");
    setupTemp.hobbies = setupTemp.hobbies.filter(h => h !== hobbyName);
  } else {
    card.classList.add("selected");
    setupTemp.hobbies.push(hobbyName);
  }
  document.getElementById("hobbiesNext").disabled = setupTemp.hobbies.length < 3;
}

function nextStep() {
  const step1 = document.getElementById("step1");
  const step2 = document.getElementById("step2");
  const step3 = document.getElementById("step3");

  if (step1.classList.contains("active")) {
    // go to hobbies
    document.getElementById("avatarStep").classList.add("hidden");
    document.getElementById("hobbiesStep").classList.remove("hidden");
    step1.classList.remove("active"); step1.classList.add("completed");
    step2.classList.remove("pending"); step2.classList.add("active");
  } else if (step2.classList.contains("active")) {
    // go to username
    document.getElementById("hobbiesStep").classList.add("hidden");
    document.getElementById("usernameStep").classList.remove("hidden");
    step2.classList.remove("active"); step2.classList.add("completed");
    step3.classList.remove("pending"); step3.classList.add("active");
    // prefill suggestion
    const suggestion = (setupTemp.avatar || "user").toString().replace(/\s+/g,'').toLowerCase() + Math.floor(Math.random()*999);
    document.getElementById("usernameInput").value = suggestion;
  }
}

function completeSetup() {
  const username = document.getElementById("usernameInput").value.trim();
  if (!username) { alert("Please enter a username"); return; }
  setupTemp.username = username;

  // load user object (signup saved a skeleton earlier)
  const email = currentEmail;
  if (!email) { alert("Unexpected error: no email in session"); return; }
  const user = getUser(email);
  if (!user) { alert("User missing (try signing in again)"); return; }

  user.avatar = setupTemp.avatar;
  user.hobbies = setupTemp.hobbies.slice();
  user.username = setupTemp.username;
  saveUser(email, user);

  // init or reset game data
  const game = {
    level: 1,
    xp: 0,
    completed: 0,
    streak: 0,
    rerollsLeft: 1,
    lastDaily: null
  };
  saveGame(email, game);

  showDashboard();
}

// ---------- DASHBOARD / daily challenges ----------
function showDashboard() {
  document.getElementById("authScreen").classList.add("hidden");
  document.getElementById("profileSetup").classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");
  updateDashboard();
}

function updateDashboard() {
  const email = currentEmail;
  if (!email) return;
  const user = getUser(email);
  const game = getGame(email);

  // user info
  document.getElementById("dashboardAvatar").textContent = user.avatar || "🌸";
  document.getElementById("dashboardUsername").textContent = user.username || user.name || email;
  document.getElementById("dashboardLevel").textContent = game.level;

  document.getElementById("levelNumber").textContent = game.level;
  document.getElementById("currentXP").textContent = `${game.xp} / 1000`;
  document.getElementById("completedChallenges").textContent = game.completed;
  document.getElementById("currentStreak").textContent = game.streak;

  // xp bar
  const xpPercent = Math.min((game.xp / 1000) * 100, 100);
  document.getElementById("xpBar").style.width = xpPercent + "%";

  // daily challenges
  ensureDailyChallenges(email);
  renderDailyChallenges(email);

  // reroll status
  updateRerollStatus(email);

  // selected hobbies display
  const hobbiesContainer = document.getElementById("selectedHobbies");
  hobbiesContainer.innerHTML = "";
  (user.hobbies || []).forEach(hobby => {
    const div = document.createElement("div");
    div.className = "hobby-tag";
    div.textContent = hobby;
    hobbiesContainer.appendChild(div);
  });
}

// ensure there's a daily set for today
function ensureDailyChallenges(email) {
  const game = getGame(email);
  const user = getUser(email);
  const today = todayStr();

  if (game.lastDaily && game.lastDaily.date === today) return; // already has today

  // pick hobbies: prefer user's hobbies, fallback to challengeDatabase keys
  let pool = Array.isArray(user.hobbies) && user.hobbies.length ? user.hobbies.slice() : Object.keys(challengeDatabase);
  if (!pool.length) pool = Object.keys(challengeDatabase);

  const hobbyCount = Math.random() < 0.5 ? 1 : 2;
  const picked = shuffle(pool).slice(0, Math.min(hobbyCount, pool.length));

  const challenges = picked.map(hobbyName => {
    const db = challengeDatabase[hobbyName] || { icon: "✨", challenges: ["Try something new!"] };
    const text = db.challenges[Math.floor(Math.random() * db.challenges.length)];
    return { hobby: hobbyName, icon: db.icon, text, xp: 200 + Math.floor(Math.random() * 101) }; // 200-300 XP
  });

  game.lastDaily = { date: today, challenges };
  saveGame(email, game);
}

// render into your dashboard challenge area
function renderDailyChallenges(email) {
  const game = getGame(email);
  const containerIcon = document.getElementById("challengeIcon");
  const containerName = document.getElementById("challengeName");
  const textEl = document.getElementById("challengeText");
  const actionsWrapper = document.querySelector(".challenge-actions");

  const arr = (game.lastDaily && game.lastDaily.challenges) ? game.lastDaily.challenges : [];

  if (arr.length === 0) {
    containerIcon.textContent = "🎉";
    containerName.textContent = "No challenges";
    textEl.textContent = "You completed today's challenges — nice job! Come back tomorrow for new ones.";
    actionsWrapper.innerHTML = `<button class="btn-complete" onclick="claimDailyAll()">Claim All</button>`;
    return;
  }

  // show first challenge's hobby as the tag (or "Daily")
  containerIcon.textContent = arr[0].icon || "✨";
  containerName.textContent = arr.length === 1 ? arr[0].hobby : "Daily Challenges";

  // list challenges with numbered bullets + XP and per-item complete buttons
  let html = "<ol style='padding-left:18px; margin:8px 0;'>";
  arr.forEach((c, idx) => {
    html += `<li style="margin-bottom:8px;"> <strong>${c.hobby}</strong>: ${c.text} <span style="font-weight:600">(+${c.xp} XP)</span></li>`;
  });
  html += "</ol>";
  textEl.innerHTML = html;

  // build action buttons: one button per challenge, and reroll
  let actionsHtml = "";
  arr.forEach((c, idx) => {
    actionsHtml += `<button class="btn-complete" style="margin-right:8px" onclick="completeDailyChallenge(${idx})">Complete #${idx+1} (+${c.xp})</button>`;
  });
  actionsHtml += `<button class="btn-reroll" id="rerollBtn" style="margin-left:6px" onclick="rerollDaily()">🎲 Reroll</button>`;
  actionsWrapper.innerHTML = actionsHtml;

  updateRerollStatus(email);
}

// complete one challenge by index
function completeDailyChallenge(index) {
  const email = currentEmail;
  if (!email) return alert("Not signed in");
  const game = getGame(email);
  if (!game.lastDaily || !game.lastDaily.challenges || !game.lastDaily.challenges[index]) return alert("That challenge is gone");
  const ch = game.lastDaily.challenges[index];

  // award xp & stats
  game.xp += ch.xp;
  game.completed = (game.completed || 0) + 1;
  game.streak = (game.streak || 0) + 1;

  // level up if >=1000 xp
  if (game.xp >= 1000) {
    game.level = (game.level || 1) + 1;
    game.xp = game.xp - 1000; // carryover
    // simple popup
    setTimeout(()=> alert(`🎉 LEVEL UP! You reached level ${game.level}!`), 20);
  }

  // remove completed challenge from today's list
  game.lastDaily.challenges.splice(index, 1);
  saveGame(email, game);
  updateDashboard();
  alert(`🌟 You gained ${ch.xp} XP!`);
}

// complete all remaining challenges quickly (claim)
function claimDailyAll() {
  const email = currentEmail;
  if (!email) return;
  const game = getGame(email);
  const arr = (game.lastDaily && game.lastDaily.challenges) ? game.lastDaily.challenges : [];
  arr.forEach(c => {
    game.xp += c.xp;
    game.completed = (game.completed||0) + 1;
    game.streak = (game.streak||0) + 1;
  });
  game.lastDaily.challenges = [];
  // level up handling (loop)
  while (game.xp >= 1000) {
    game.level = (game.level||1) + 1;
    game.xp -= 1000;
  }
  saveGame(email, game);
  updateDashboard();
  alert(`All challenges claimed!`);
}

// reroll today's challenges (consumes reroll)
function rerollDaily() {
  const email = currentEmail;
  if (!email) return;
  const game = getGame(email);
  if ((game.rerollsLeft || 0) <= 0) { alert("No rerolls left!"); return; }

  // pick new set (from user's hobbies if possible)
  const user = getUser(email);
  let pool = Array.isArray(user.hobbies) && user.hobbies.length ? user.hobbies.slice() : Object.keys(challengeDatabase);
  if (!pool.length) pool = Object.keys(challengeDatabase);
  const hobbyCount = Math.random() < 0.5 ? 1 : 2;
  const picked = shuffle(pool).slice(0, Math.min(hobbyCount, pool.length));
  const newCh = picked.map(hobbyName => {
    const db = challengeDatabase[hobbyName] || { icon: "✨", challenges: ["Try something new!"] };
    const text = db.challenges[Math.floor(Math.random() * db.challenges.length)];
    return { hobby: hobbyName, icon: db.icon, text, xp: 200 + Math.floor(Math.random()*101) };
  });
  game.lastDaily = { date: todayStr(), challenges: newCh };
  game.rerollsLeft = (game.rerollsLeft || 0) - 1;
  saveGame(email, game);
  updateDashboard();
}

// update reroll UI text + disable
function updateRerollStatus(email) {
  const game = getGame(email);
  const rerollBtn = document.getElementById("rerollBtn");
  const rerollStatus = document.getElementById("rerollStatus");
  if (!rerollStatus) return;
  const left = (game.rerollsLeft || 0);
  rerollStatus.textContent = left > 0 ? `${left} reroll available` : "No rerolls remaining";
  if (rerollBtn) rerollBtn.disabled = left <= 0;
}

// ---------- logout ----------
function logout() {
  if (!confirm("Are you sure you want to sign out?")) return;
  currentEmail = null;
  // reset UI: show auth
  document.getElementById("dashboard").classList.add("hidden");
  document.getElementById("authScreen").classList.remove("hidden");
  // clear any sensitive fields
  document.getElementById("loginEmail").value = "";
  document.getElementById("loginPassword").value = "";
}

// ---------- init ----------
document.addEventListener("DOMContentLoaded", () => {
  // ensure login/signup forms are in correct visible state
  document.getElementById("authScreen").classList.remove("hidden");
  document.getElementById("profileSetup").classList.add("hidden");
  document.getElementById("dashboard").classList.add("hidden");
});
