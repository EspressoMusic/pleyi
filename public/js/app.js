/* English Play — main app */

const socket = io();

const state = {
  role: null,
  room: null,
  activeGame: null,
  gameState: null,
  scores: { teacher: 0, student: 0 },
  modalMode: "student",
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function showToast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.remove("hidden");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => t.classList.add("hidden"), 2800);
}

function showView(view) {
  $("#landingView").classList.toggle("hidden", view !== "landing");
  $("#roomView").classList.toggle("hidden", view !== "room");
  $("#teacherDashView")?.classList.toggle("hidden", view !== "teacher");
  document.body.classList.toggle("in-room", view === "room");
}

function roomJoinUrl(code) {
  return `${window.location.origin}${window.location.pathname}?join=${code}`;
}

function updateRoomJoinLink(code) {
  const link = $("#roomJoinLink");
  if (!link || !code) return;
  const url = roomJoinUrl(code);
  link.href = url;
  link.textContent = url;
}

function openModal(mode) {
  state.modalMode = mode;
  $("#modalTitle").textContent = mode === "teacher" ? "יצירת חדר — מורה" : "הצטרפות — תלמיד";
  $("#modalDesc").textContent =
    mode === "teacher"
      ? "הזינו את שמכם ויצרו חדר חדש"
      : "הזינו את שמכם ואת קוד החדר שקיבלתם מהמורה";
  $("#codeField").classList.toggle("hidden", mode === "teacher");
  $("#formError").classList.add("hidden");
  $("#joinForm").reset();
  $("#joinModal").classList.remove("hidden");
  setTimeout(() => $("#playerName").focus(), 100);
}

function closeModal() {
  $("#joinModal").classList.add("hidden");
}

function updateRoomUI(room) {
  if (!room) return;
  state.room = room;
  $("#roomCodeDisplay").textContent = room.code;
  updateRoomJoinLink(room.code);
  $("#teacherNameDisplay").textContent = room.teacherName || "מורה";
  $("#studentNameDisplay").textContent = room.studentConnected
    ? room.studentName
    : "ממתין לתלמיד...";
  $("#teacherStatus").classList.toggle("waiting", !room.teacherConnected);
  $("#studentStatus").classList.toggle("waiting", !room.studentConnected);
  $("#scoreTeacher").textContent = `מורה: ${room.scores?.teacher ?? 0}`;
  $("#scoreStudent").textContent = `תלמיד: ${room.scores?.student ?? 0}`;

  const bothIn = room.teacherConnected && room.studentConnected;
  const isTeacher = state.role === "teacher";
  $("#lobbyHint").textContent = bothIn
    ? "לחצו על משחק — ייפתח בדף חדש לשחק מיד!"
    : "לחצו על משחק לתרגול לבד, או המתינו לשותף לשיעור חי";

  $$(".game-btn").forEach((btn) => {
    btn.disabled = false;
  });

  $("#roomTabs")?.classList.toggle("hidden", !isTeacher);
}

function renderGame() {
  if (!state.activeGame || !state.gameState) {
    $("#gamePanel").classList.add("hidden");
    $("#lobbyPanel").classList.remove("hidden");
    return;
  }

  $("#lobbyPanel").classList.add("hidden");
  $("#gamePanel").classList.remove("hidden");
  $("#activeGameTitle").textContent = GAME_NAMES[state.activeGame] || state.activeGame;

  const ctx = {
    role: state.role,
    room: state.room,
    scores: state.scores,
    sendAction: (action, data) => {
      socket.emit("game:action", { action, data }, (res) => {
        if (res?.ok === false) {
          showToast("פעולה לא זמינה");
          return;
        }
        if (res?.correct === true) showToast("נכון! 🎉");
        else if (res?.correct === false) showToast("לא נכון — היריב עדיין במרוץ!");
        else if (res?.matched > 0) showToast(`התאמה! +${res.matched * 5} נקודות`);
      });
    },
  };

  const content = $("#gameContent");
  content.innerHTML = Games.render(state.activeGame, state.gameState, ctx);
  Games.bind(state.activeGame, content, ctx);
}

function enterRoom(data) {
  state.role = data.role;
  state.room = data;
  state.scores = data.scores || { teacher: 0, student: 0 };
  if (data.activeGame && data.gameState) {
    state.activeGame = data.activeGame;
    state.gameState = data.gameState;
  }
  showView("room");
  updateRoomUI(data);
  renderGame();
  closeModal();
  if (data.role === "teacher") {
    showToast(`חדר נוצר! קוד: ${data.code}`);
    updateRoomJoinLink(data.code);
    window.teacherDashAutoAuth?.();
  } else {
    showToast("הצטרפת בהצלחה!");
  }
}

/* Loader */
window.addEventListener("load", () => {
  setTimeout(() => $("#loader")?.classList.add("gone"), 400);
});

/* Nav scroll */
window.addEventListener(
  "scroll",
  () => {
    $("#navbar")?.classList.toggle("scrolled", window.scrollY > 50);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    if (h > 0) $("#scrollProgress").style.width = Math.min(100, (window.scrollY / h) * 100) + "%";
  },
  { passive: true }
);

/* Scroll animations — see scroll-animations.js */

/* Mobile menu */
$("#menuToggle")?.addEventListener("click", () => {
  $("#menuToggle").classList.toggle("open");
  $("#mobileNav").classList.toggle("open");
});
$$("#mobileNav a").forEach((a) =>
  a.addEventListener("click", () => {
    $("#menuToggle")?.classList.remove("open");
    $("#mobileNav")?.classList.remove("open");
  })
);

function scrollToBooking() {
  document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
  $("#menuToggle")?.classList.remove("open");
  $("#mobileNav")?.classList.remove("open");
}

["#navBookBtn", "#mobileBookBtn", "#heroBookBtn"].forEach((sel) => {
  $(sel)?.addEventListener("click", (e) => {
    e.preventDefault();
    scrollToBooking();
  });
});

$("#modalClose")?.addEventListener("click", closeModal);
$("#joinModal")?.addEventListener("click", (e) => {
  if (e.target === $("#joinModal")) closeModal();
});

$("#joinForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("#playerName").value.trim();
  const err = $("#formError");
  err.classList.add("hidden");

  if (!name) {
    err.textContent = "נא להזין שם";
    err.classList.remove("hidden");
    return;
  }

  if (state.modalMode === "teacher") {
    socket.emit("room:create", { name }, (res) => {
      if (res?.ok) enterRoom(res);
      else {
        err.textContent = res?.error || "שגיאה";
        err.classList.remove("hidden");
      }
    });
  } else {
    const code = $("#roomCodeInput").value.trim();
    if (!/^\d{6}$/.test(code)) {
      err.textContent = "קוד חדר חייב להיות 6 ספרות";
      err.classList.remove("hidden");
      return;
    }
    socket.emit("room:join", { code, name }, (res) => {
      if (res?.ok) enterRoom(res);
      else {
        err.textContent = res?.error || "שגיאה";
        err.classList.remove("hidden");
      }
    });
  }
});

$("#copyCodeBtn")?.addEventListener("click", () => {
  const code = $("#roomCodeDisplay")?.textContent;
  if (code) {
    navigator.clipboard?.writeText(code).then(() => showToast("הקוד הועתק!"));
  }
});

$("#copyJoinLinkBtn")?.addEventListener("click", () => {
  const code = $("#roomCodeDisplay")?.textContent;
  if (code && code !== "------") {
    navigator.clipboard?.writeText(roomJoinUrl(code)).then(() => showToast("הקישור הועתק!"));
  }
});

document.getElementById("openTeacherRoomBtn")?.addEventListener("click", () => openModal("teacher"));
document.getElementById("openStudentRoomBtn")?.addEventListener("click", () => openModal("student"));

function openPlayGame(gameId) {
  window.open(`/play/${gameId}`, "_blank", "noopener");
}

function closeGamePreview() {
  document.getElementById("gamePreviewModal")?.classList.add("hidden");
}

document.getElementById("gamePreviewClose")?.addEventListener("click", closeGamePreview);
document.getElementById("gamePreviewModal")?.addEventListener("click", (e) => {
  if (e.target.id === "gamePreviewModal") closeGamePreview();
});

(function handleJoinFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const joinCode = params.get("join");
  if (joinCode && /^\d{6}$/.test(joinCode)) {
    window.addEventListener("load", () => {
      openModal("student");
      const input = document.getElementById("roomCodeInput");
      if (input) input.value = joinCode;
      history.replaceState({}, "", window.location.pathname + window.location.hash);
    });
  }
})();

$("#contactForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  showToast("ההודעה נשלחה! אחזור אליכם בהקדם");
  e.target.reset();
});

$$(".game-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const gameId = btn.dataset.game;
    openPlayGame(gameId);
  });
});

$("#leaveGameBtn")?.addEventListener("click", () => {
  socket.emit("game:action", { action: "leave-game" });
});

$("#leaveRoomBtn")?.addEventListener("click", () => {
  state.role = null;
  state.room = null;
  state.activeGame = null;
  showView("landing");
  socket.disconnect();
  socket.connect();
  showToast("עזבת את החדר");
});

$("#logoHome")?.addEventListener("click", (e) => {
  e.preventDefault();
  if (!state.room) showView("landing");
});

document.getElementById("dashBackHome")?.addEventListener("click", () => showView("landing"));

/* Socket events */
socket.on("room:update", (room) => updateRoomUI(room));

socket.on("room:partner-joined", ({ name }) => {
  showToast(`${name} הצטרף/ה!`);
});

socket.on("room:partner-left", () => {
  showToast("התלמיד התנתק");
  state.activeGame = null;
  renderGame();
});

socket.on("room:closed", ({ reason }) => {
  showToast(reason || "החדר נסגר");
  state.role = null;
  state.room = null;
  showView("landing");
});

socket.on("game:state", ({ activeGame, state: gs, scores }) => {
  state.activeGame = activeGame;
  state.gameState = gs;
  state.scores = scores;
  if (state.room) {
    state.room.scores = scores;
    state.room.activeGame = activeGame;
    updateRoomUI(state.room);
  }
  renderGame();
});

socket.on("game:left", () => {
  state.activeGame = null;
  state.gameState = null;
  renderGame();
});
