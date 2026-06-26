/* GameClass — main app */

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
  return `${window.location.origin}/join?code=${code}`;
}

function updateRoomJoinLink(code) {
  const link = $("#roomJoinLink");
  if (!link || !code) return;
  const url = roomJoinUrl(code);
  link.href = url;
  link.textContent = url;
}

function t(key) {
  return typeof I18n !== "undefined" ? I18n.t(key) : key;
}

function openModal(mode) {
  state.modalMode = mode;
  $("#modalTitle").textContent =
    mode === "teacher" ? "פתיחת חדר כיתה" : "הצטרפות לחדר";
  $("#modalDesc").textContent =
    mode === "teacher"
      ? "הזינו את שם החדר — תקבלו קוד לשיתוף עם התלמידים"
      : "הזינו קוד חדר ושם — או השתמשו בדף /join מהטלפון";
  $("#modalNameLabel").textContent = mode === "teacher" ? "שם החדר" : "השם שלך";
  $("#playerName").placeholder = mode === "teacher" ? "למשל: אנגלית ז׳" : "למשל: דנה";
  $("#formSubmit").textContent = mode === "teacher" ? "פתח חדר" : "הצטרף";
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
  $("#teacherStatus").classList.toggle("waiting", !room.teacherConnected);

  const students = room.students || [];
  const listEl = $("#studentsList");
  if (listEl) {
    listEl.innerHTML =
      students.length === 0
        ? '<p class="students-empty">ממתינים לתלמידים — שלחו את הקישור או QR</p>'
        : students
            .map(
              (s) =>
                `<div class="student-chip"><span class="student-dot"></span>${s.name} <strong>${s.score || 0} נק׳</strong></div>`
            )
            .join("");
  }
  $("#studentCountBadge").textContent = String(students.length);

  const joinUrl = roomJoinUrl(room.code);
  const qrImg = $("#roomQrCode");
  if (qrImg) {
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=${encodeURIComponent(joinUrl)}`;
  }
  $("#joinUrlDisplay").textContent = joinUrl;

  $("#scoreTeacher").textContent = `מורה: ${room.scores?.teacher ?? 0}`;

  const isTeacher = state.role === "teacher";
  const hasStudents = students.length > 0;
  $("#lobbyHint").textContent = hasStudents
    ? isTeacher
      ? "בחרו משחק — כל התלמידים ישחקו מהטלפון!"
      : "ממתינים שהמורה יתחיל משחק..."
    : "שתפו QR או קישור — התלמידים יצטרפו מהטלפון";

  $$(".game-btn").forEach((btn) => {
    btn.disabled = isTeacher && !hasStudents;
  });
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
    playerId: socket.id,
    playerKey: state.role === "teacher" ? "teacher" : socket.id,
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

function openTeacherRoom() {
  openModal("teacher");
}

document.getElementById("openClassroomBtn")?.addEventListener("click", () => openModal("teacher"));
document.getElementById("heroClassroomBtn")?.addEventListener("click", () => openModal("teacher"));
document.getElementById("howClassroomBtn")?.addEventListener("click", () => openModal("teacher"));
document.getElementById("gamesClassroomBtn")?.addEventListener("click", () => openModal("teacher"));
document.getElementById("mobileClassroomBtn")?.addEventListener("click", () => {
  openModal("teacher");
  $("#menuToggle")?.classList.remove("open");
  $("#mobileNav")?.classList.remove("open");
});

initContactExtras();
GameAuth?.bindModals(showToast);
document.getElementById("mobileLoginBtn")?.addEventListener("click", () => {
  document.getElementById("loginModal")?.classList.remove("hidden");
  $("#menuToggle")?.classList.remove("open");
  $("#mobileNav")?.classList.remove("open");
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
    navigator.clipboard?.writeText(code).then(() => showToast(t("toast.codeCopied")));
  }
});

$("#copyJoinLinkBtn")?.addEventListener("click", () => {
  const code = $("#roomCodeDisplay")?.textContent;
  if (code && code !== "------") {
    navigator.clipboard?.writeText(roomJoinUrl(code)).then(() => showToast(t("toast.linkCopied")));
  }
});

document.getElementById("dashBackHome")?.addEventListener("click", () => showView("landing"));

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
  const joinCode = params.get("join") || params.get("code");
  if (joinCode && /^\d{6}$/.test(joinCode)) {
    window.location.href = `/join?code=${joinCode}`;
  }
})();

$("#contactForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  showToast(t("toast.contactSent"));
  e.target.reset();
});

function formatWhatsAppPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("972")) return digits;
  if (digits.startsWith("0")) return `972${digits.slice(1)}`;
  return digits;
}

let contactWaNum = formatWhatsAppPhone("0586122187");

function initContactExtras() {
  const siteUrl = `${window.location.origin}${window.location.pathname.replace(/\/$/, "") || ""}`;
  const qrImg = document.getElementById("siteQrCode");
  if (qrImg) {
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(siteUrl)}`;
  }

  const copyBtn = document.getElementById("copySiteUrlBtn");
  if (copyBtn && !copyBtn.dataset.bound) {
    copyBtn.dataset.bound = "1";
    copyBtn.addEventListener("click", () => {
      navigator.clipboard?.writeText(siteUrl).then(() => showToast(t("toast.linkCopied")));
    });
  }

  updateWhatsAppLink();

  fetch("/api/booking/settings")
    .then((r) => r.json())
    .then((data) => {
      if (!data?.ok) return;
      const phone = data.whatsappPhone || data.bitPhone || "0586122187";
      contactWaNum = formatWhatsAppPhone(phone);
      updateWhatsAppLink();
    })
    .catch(() => {});
}

function updateWhatsAppLink() {
  const btn = document.getElementById("whatsappBtn");
  if (btn && contactWaNum) {
    const text = encodeURIComponent(t("toast.waText"));
    btn.href = `https://wa.me/${contactWaNum}?text=${text}`;
  }
}

initContactExtras();

window.addEventListener("gameclass:lang", () => {
  if (!$("#joinModal")?.classList.contains("hidden")) {
    openModal(state.modalMode);
  }
  updateWhatsAppLink();
});

$$(".game-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const gameId = btn.dataset.game;
    if (state.role === "teacher" && state.room) {
      socket.emit("game:start", { gameId }, (res) => {
        if (res?.ok) showToast("המשחק התחיל!");
        else showToast(res?.error || "לא ניתן להתחיל");
      });
      return;
    }
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
socket.on("room:update", (room) => {
  updateRoomUI(room);
  if (state.activeGame && room.activeGame) renderGame();
});

socket.on("room:student-joined", ({ name }) => {
  showToast(`${name} הצטרף/ה מהטלפון!`);
});

socket.on("room:student-left", ({ name }) => {
  showToast(`${name} התנתק/ה`);
  state.activeGame = null;
  renderGame();
});

socket.on("room:partner-joined", ({ name }) => {
  showToast(`${name} הצטרף/ה!`);
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
