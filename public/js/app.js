/* Pleyi — main app */

const ROOM_LOG = "[Pleyi Room]";

function roomLog(...args) {
  console.log(ROOM_LOG, ...args);
}

function roomLogError(...args) {
  console.error(ROOM_LOG, ...args);
}

if (typeof io === "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    const warn = document.createElement("p");
    warn.className = "form-error";
    warn.style.cssText = "margin:12px;text-align:center;font-weight:700";
    warn.textContent =
      "אין חיבור לשרת — הריצו npm start וגלשו ל-http://localhost:3456 (לא לפתוח קובץ HTML מהמחשב)";
    document.body.prepend(warn);
    roomLogError("socket.io not loaded");
  });
}

const socket =
  typeof io !== "undefined"
    ? io()
    : {
        connected: false,
        active: false,
        on() {},
        once() {},
        off() {},
        connect() {},
        emit(_event, _payload, cb) {
          if (typeof cb === "function") {
            cb({ ok: false, error: "אין חיבור לשרת — הריצו npm start" });
          }
        },
      };

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
  const landing = $("#landingView");
  const room = $("#roomView");
  const dash = $("#teacherDashView");
  if (!landing || !room) return;

  const inRoom = view === "room";
  landing.classList.toggle("hidden", view !== "landing");
  room.classList.toggle("hidden", !inRoom);
  dash?.classList.toggle("hidden", view !== "teacher");
  document.body.classList.toggle("in-room", inRoom);
  document.documentElement.classList.toggle("in-room", inRoom);

  if (inRoom) {
    window.scrollTo(0, 0);
    room.setAttribute("tabindex", "-1");
    room.focus({ preventScroll: true });
  }
}

function isInRoom() {
  return state.role === "teacher" && !!state.room && !$("#roomView")?.classList.contains("hidden");
}

window.GameClassApp = { isInRoom, showView, enterRoom: null };

function waitForSocket(timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    if (socket.connected) {
      resolve();
      return;
    }
    const timer = setTimeout(() => {
      socket.off("connect", onConnect);
      reject(new Error("לא מתחבר לשרת — ודאו שהשרת רץ (npm start) ושאתם ב-http://localhost:3456"));
    }, timeoutMs);
    function onConnect() {
      clearTimeout(timer);
      resolve();
    }
    socket.once("connect", onConnect);
    if (!socket.active) socket.connect();
  });
}

function emitAck(event, payload, timeoutMs = 12000) {
  return waitForSocket(timeoutMs).then(
    () =>
      new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("השרת לא עונה — בדקו שהוא פועל")), timeoutMs);
        socket.emit(event, payload, (res) => {
          clearTimeout(timer);
          if (res === undefined) reject(new Error("אין תשובה מהשרת"));
          else resolve(res);
        });
      })
  );
}

function roomJoinUrl(code) {
  return `${window.location.origin}/join?code=${code}`;
}

function updateRoomJoinLink(code) {
  const joinPage = document.getElementById("openJoinPageBtn");
  if (joinPage && code) joinPage.href = `/join?code=${code}`;
}

function t(key) {
  return typeof I18n !== "undefined" ? I18n.t(key) : key;
}

function openModal(mode) {
  state.modalMode = mode;
  roomLog("open modal", mode);
  $("#modalTitle").textContent =
    mode === "teacher" ? t("modal.openRoom.title") : t("modal.joinRoom.title");
  const descEl = $("#modalDesc");
  if (mode === "teacher") {
    descEl.textContent = "";
    descEl.classList.add("hidden");
  } else {
    descEl.textContent = t("modal.joinDesc");
    descEl.classList.remove("hidden");
  }
  $("#modalNameLabel").textContent = mode === "teacher" ? t("modal.roomName") : t("modal.yourName");
  $("#playerName").placeholder = mode === "teacher" ? t("modal.roomNamePh") : t("modal.namePh");
  $("#joinNameField")?.classList.toggle("hidden", mode === "teacher");
  $("#playerName").required = mode !== "teacher";
  $("#formSubmit").textContent = mode === "teacher" ? t("modal.openBtn") : t("modal.joinBtn");
  $("#codeField").classList.toggle("hidden", mode === "teacher");
  $("#joinMaterialGroup")?.classList.toggle("hidden", mode !== "teacher");
  $("#joinModal")?.classList.toggle("join-modal--teacher", mode === "teacher");
  $("#formError").classList.add("hidden");
  $("#joinForm").reset();
  resetMaterialFileUI("join");
  $("#joinModal").classList.remove("hidden");
  const connHint = document.getElementById("socketConnHint");
  if (connHint) {
    connHint.textContent = socket.connected
      ? ""
      : "מתחבר לשרת… אם זה נתקע, ודאו שהשרת רץ (npm start).";
    connHint.classList.toggle("hidden", socket.connected);
  }
  setTimeout(() => {
    if (mode === "teacher") $("#joinMaterialInput")?.focus();
    else $("#playerName")?.focus();
  }, 100);
}

function closeModal() {
  $("#joinModal")?.classList.add("hidden");
  const submitBtn = $("#formSubmit");
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = state.modalMode === "teacher" ? "פתח חדר" : "הצטרף";
  }
}

function openPlayModeModal() {
  const modal = $("#playModeModal");
  if (!modal) return;
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  setTimeout(() => $("#playModeGroupBtn")?.focus(), 100);
}

function closePlayModeModal() {
  const modal = $("#playModeModal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
}

function bindPlayModeModal() {
  $("#heroPlayNowBtn")?.addEventListener("click", openPlayModeModal);
  $("#playModeClose")?.addEventListener("click", closePlayModeModal);
  $("#playModeModal")?.addEventListener("click", (e) => {
    if (e.target === $("#playModeModal")) closePlayModeModal();
  });
  $("#playModeGroupBtn")?.addEventListener("click", () => {
    closePlayModeModal();
    openModal("teacher");
  });
  $("#playModeSoloBtn")?.addEventListener("click", () => {
    closePlayModeModal();
    openSoloContentModal();
  });
}

function parseMaterialText(text, subject = "english") {
  const catalog = window.GAMES_CATALOG;
  if (!catalog?.parseContent) return { items: [] };
  const parsed = catalog.parseContent(String(text || "").trim(), subject);
  const items = Array.isArray(parsed) ? parsed : parsed?.items || [];
  return { items };
}

function resetMaterialFileUI(prefix) {
  const fileInput = document.getElementById(`${prefix}MaterialFile`);
  const fileName = document.getElementById(`${prefix}MaterialFileName`);
  if (fileInput) fileInput.value = "";
  if (fileName) fileName.textContent = "";
}

async function loadMaterialFile(prefix, file) {
  const textarea = document.getElementById(`${prefix}MaterialInput`);
  const fileInput = document.getElementById(`${prefix}MaterialFile`);
  const fileName = document.getElementById(`${prefix}MaterialFileName`);
  const box = document.getElementById(`${prefix}MaterialBox`);
  if (!file || !textarea) return;
  if (fileName) fileName.textContent = `טוען ${file.name}…`;
  try {
    textarea.value = await window.extractMaterialText(file);
    if (fileName) fileName.textContent = file.name;
    if (fileInput) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInput.files = dt.files;
    }
    box?.classList.remove("is-dragover");
  } catch (e) {
    showToast(e.message || "לא ניתן לקרוא את הקובץ");
    resetMaterialFileUI(prefix);
  }
}

function bindMaterialUpload(prefix) {
  const box = document.getElementById(`${prefix}MaterialBox`);
  const textarea = document.getElementById(`${prefix}MaterialInput`);
  const fileInput = document.getElementById(`${prefix}MaterialFile`);
  const fileBtn = document.getElementById(`${prefix}MaterialFileBtn`);
  if (!box || !textarea) return;

  fileBtn?.addEventListener("click", () => fileInput?.click());
  fileInput?.addEventListener("change", () => loadMaterialFile(prefix, fileInput.files?.[0]));
  textarea.addEventListener("input", () => {
    if (fileInput?.value) resetMaterialFileUI(prefix);
  });
  box.addEventListener("dragover", (e) => {
    e.preventDefault();
    box.classList.add("is-dragover");
  });
  box.addEventListener("dragleave", () => box.classList.remove("is-dragover"));
  box.addEventListener("drop", (e) => {
    e.preventDefault();
    box.classList.remove("is-dragover");
    const file = e.dataTransfer?.files?.[0];
    if (file) loadMaterialFile(prefix, file);
  });
}

function launchSoloFromMaterial(text) {
  const { items } = parseMaterialText(text);
  if (items.length < 2) {
    return { ok: false, error: "הזינו לפחות 2 פריטים (מילה=תרגום או תרגיל=תשובה)" };
  }
  const catalog = window.GAMES_CATALOG;
  const subject = "english";
  const gameId = catalog.pickGameForContent(items, subject);
  sessionStorage.setItem(
    "gameclass-custom",
    JSON.stringify({
      subject,
      gameId,
      vocab: items,
      title: "שיעור מותאם",
      savedGameId: null,
    })
  );
  sessionStorage.setItem("gameclass-play-material", text.trim());
  window.location.href = `/play/${gameId}`;
  return { ok: true };
}

function openSoloContentModal() {
  const modal = $("#soloContentModal");
  if (!modal) return;
  $("#soloMaterialInput").value = "";
  resetMaterialFileUI("solo");
  $("#soloContentError")?.classList.add("hidden");
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  setTimeout(() => $("#soloMaterialInput")?.focus(), 100);
}

function closeSoloContentModal() {
  const modal = $("#soloContentModal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
}

function bindSoloContentModal() {
  bindMaterialUpload("solo");
  bindMaterialUpload("join");
  $("#soloContentClose")?.addEventListener("click", closeSoloContentModal);
  $("#soloContentModal")?.addEventListener("click", (e) => {
    if (e.target === $("#soloContentModal")) closeSoloContentModal();
  });
  $("#soloLaunchBtn")?.addEventListener("click", () => {
    const err = $("#soloContentError");
    const text = $("#soloMaterialInput")?.value || "";
    err?.classList.add("hidden");
    const result = launchSoloFromMaterial(text);
    if (!result.ok) {
      if (err) {
        err.textContent = result.error;
        err.classList.remove("hidden");
      } else {
        showToast(result.error);
      }
    }
  });
}

function updateRoomUI(room) {
  if (!room) return;
  state.room = room;
  $("#roomCodeDisplay").textContent = room.code;
  $("#roomTitleDisplay").textContent = room.roomTitle || room.teacherName || "חדר כיתה";
  updateRoomJoinLink(room.code);

  const students = room.students || [];
  const listEl = $("#studentsList");
  const isTeacher = state.role === "teacher";
  if (listEl) {
    listEl.innerHTML =
      students.length === 0
        ? '<p class="students-empty">ממתינים לתלמידים — שתפו קישור או QR</p>'
        : students
            .map(
              (s) => `
              <div class="student-chip${s.suspended ? " student-chip--suspended" : ""}" data-student-id="${s.id}">
                <div class="student-chip-main">
                  <span class="student-dot${s.suspended ? " waiting" : ""}"></span>
                  <span class="student-chip-name">${escapeHtml(s.name)}</span>
                  <strong class="student-chip-score">${s.score || 0} נק׳</strong>
                  ${s.suspended ? '<span class="student-suspended-tag">מושהה</span>' : ""}
                </div>
                ${
                  isTeacher
                    ? `<div class="student-chip-actions">
                  <button type="button" class="student-action-btn student-action-btn--promote" data-action="transfer" data-student-id="${s.id}" title="העבר ניהול">👑</button>
                  <button type="button" class="student-action-btn" data-action="suspend" data-student-id="${s.id}" title="${s.suspended ? "בטל השהיה" : "השהה"}">${s.suspended ? "▶️" : "⏸"}</button>
                  <button type="button" class="student-action-btn student-action-btn--kick" data-action="kick" data-student-id="${s.id}" title="העף">✕</button>
                </div>`
                    : ""
                }
              </div>`
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

  const hasStudents = students.length > 0;
  $("#lobbyHint").textContent = hasStudents
    ? isTeacher
      ? "בחרו משחק — כל התלמידים ייכנסו אוטומטית למשחק!"
      : "ממתינים שהמורה יתחיל משחק..."
    : "שתפו קישור או QR — התלמידים יצטרפו מהטלפון";

  $$(".game-btn").forEach((btn) => {
    btn.disabled = false;
  });

  if (room.chat) renderChatLog(room.chat);
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderChatLog(messages) {
  const log = $("#roomChatLog");
  if (!log) return;
  if (!messages?.length) {
    log.innerHTML = '<p class="room-chat-empty">שלחו אימוג\'י — כולם רואים!</p>';
    return;
  }
  log.innerHTML = messages
    .map(
      (m) =>
        `<div class="room-chat-msg room-chat-msg--${m.role}"><span class="room-chat-emoji">${m.emoji}</span><span class="room-chat-who">${escapeHtml(m.fromName)}</span></div>`
    )
    .join("");
  log.scrollTop = log.scrollHeight;
}

function sendRoomEmoji(emoji) {
  socket.emit("room:chat", { emoji }, (res) => {
    if (res?.ok === false) showToast(res?.error || "לא ניתן לשלוח");
  });
}

function renderGame() {
  if (!state.activeGame || !state.gameState) {
    $("#gamePanel").classList.add("hidden");
    $("#lobbyPanel").classList.remove("hidden");
    document.querySelector(".room-classroom-bar")?.classList.remove("hidden");
    return;
  }

  $("#lobbyPanel").classList.add("hidden");
  document.querySelector(".room-classroom-bar")?.classList.add("hidden");
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

function saveHostSession(data, title) {
  if (!data?.code) {
    roomLogError("saveHostSession skipped — no code");
    return false;
  }
  sessionStorage.setItem(
    "gameclass-host",
    JSON.stringify({
      code: data.code,
      token: data.teacherToken || "",
      title: data.roomTitle || data.teacherName || title || "",
    })
  );
  return true;
}

function savePendingRoom(data, roomName) {
  sessionStorage.setItem(
    "gameclass-pending-room",
    JSON.stringify({
      ...data,
      role: "teacher",
      roomTitle: data.roomTitle || data.teacherName || roomName,
      savedAt: Date.now(),
    })
  );
}

function navigateToRoomUrl(url) {
  roomLog(`navigating to ${url}`);
  try {
    const target = new URL(url, window.location.origin);
    const form = document.createElement("form");
    form.method = "GET";
    form.action = target.pathname;
    target.searchParams.forEach((value, key) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
    roomLog("navigation executed");
  } catch (err) {
    roomLogError("form navigation failed, using location.href", err);
    window.location.href = url;
    roomLog("navigation executed (href fallback)");
  }
}

function showRoomRedirectOverlay() {
  let el = document.getElementById("roomRedirectOverlay");
  if (!el) {
    el = document.createElement("div");
    el.id = "roomRedirectOverlay";
    el.className = "room-redirect-overlay";
    el.innerHTML = '<p class="font-cartoon">פותח חדר…</p>';
    document.body.appendChild(el);
  }
  el.classList.remove("hidden");
}

function goToTeacherRoom(data, roomName) {
  if (!data?.code) {
    roomLogError("goToTeacherRoom aborted — missing room code", data);
    showToast("שגיאה: לא התקבל קוד חדר מהשרת");
    return;
  }

  savePendingRoom(data, roomName);
  const savedHost = saveHostSession(data, roomName);
  const savedPending = !!sessionStorage.getItem("gameclass-pending-room");
  roomLog("saved room data", {
    code: data.code,
    host: savedHost,
    pending: savedPending,
    hasToken: !!data.teacherToken,
  });

  closeModal();
  showRoomRedirectOverlay();

  const q = new URLSearchParams();
  q.set("code", data.code);
  if (data.teacherToken) q.set("t", data.teacherToken);

  const url = `${window.location.origin}/room?${q.toString()}`;
  navigateToRoomUrl(url);
}

function enterRoom(data) {
  if (!data?.ok && !data?.code) return;
  state.role = data.role;
  state.room = data;
  state.scores = data.scores || { teacher: 0, student: 0 };
  state.activeGame = data.activeGame || null;
  state.gameState = data.gameState || null;

  closeModal();
  showView("room");

  try {
    updateRoomUI(data);
    if (data.chat) renderChatLog(data.chat);
    renderGame();
  } catch (err) {
    console.error("enterRoom UI error:", err);
  }

  if (data.role === "teacher") {
    showToast(`חדר «${data.roomTitle || data.teacherName || ""}» נוצר! קוד: ${data.code}`);
    updateRoomJoinLink(data.code);
  } else {
    showToast("הצטרפת בהצלחה!");
  }
}

window.GameClassApp.enterRoom = enterRoom;

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

function bindOpenRoomFlow() {
  const openRoomBtnIds = [
    "openClassroomBtn",
    "howClassroomBtn",
    "mobileClassroomBtn",
    "dashStartLessonBtn",
  ];

  openRoomBtnIds.forEach((id) => {
    const btn = document.getElementById(id);
    if (!btn || btn.dataset.roomBound) return;
    btn.dataset.roomBound = "1";
    btn.addEventListener("click", () => {
      roomLog("clicked open room (open modal)");
      openModal("teacher");
      if (id === "mobileClassroomBtn") {
        $("#menuToggle")?.classList.remove("open");
        $("#mobileNav")?.classList.remove("open");
      }
    });
  });

  const joinForm = document.getElementById("joinForm");
  const submitBtn = document.getElementById("formSubmit");

  if (!joinForm) {
    roomLogError("joinForm not found — submit handler not bound");
    return;
  }
  if (joinForm.dataset.roomBound) return;
  joinForm.dataset.roomBound = "1";

  submitBtn?.addEventListener("click", () => {
    roomLog("clicked open room");
  });

  joinForm.addEventListener("submit", handleJoinFormSubmit);
  roomLog("joinForm bound OK");
}

async function handleJoinFormSubmit(e) {
  e.preventDefault();
  roomLog("form submit", { mode: state.modalMode });

  const name =
    state.modalMode === "teacher"
      ? window.GameAuth?.getUser()?.name || "חדר כיתה"
      : $("#playerName").value.trim();
  const err = $("#formError");
  const submitBtn = $("#formSubmit");
  err.classList.add("hidden");

  if (!name) {
    err.textContent = "נא להזין שם";
    err.classList.remove("hidden");
    roomLogError("submit blocked — empty name");
    return;
  }

  const prevLabel = submitBtn?.textContent;
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "פותח חדר…";
  }

  try {
    if (state.modalMode === "teacher") {
      const materialText = $("#joinMaterialInput")?.value?.trim() || "";
      if (materialText) {
        const { items } = parseMaterialText(materialText);
        if (items.length < 1) {
          err.textContent = "לא זוהו פריטים בתוכן — נסו: apple=תפוח";
          err.classList.remove("hidden");
          return;
        }
      }
      roomLog("room:create sending…", { name, hasMaterial: !!materialText });
      const res = await emitAck("room:create", {
        name,
        learningMaterial: materialText || undefined,
      });
      roomLog("room:create response", res);

      if (res?.ok && res?.code) {
        roomLog(`created room code ${res.code}`);
        goToTeacherRoom(res, name);
        return;
      }
      throw new Error(res?.error || "שגיאה ביצירת חדר — לא התקבל קוד");
    }

    const code = $("#roomCodeInput").value.trim();
    if (!/^\d{6}$/.test(code)) {
      err.textContent = "קוד חדר חייב להיות 6 ספרות";
      err.classList.remove("hidden");
      return;
    }
    const res = await emitAck("room:join", { code, name });
    if (res?.ok) enterRoom(res);
    else throw new Error(res?.error || "שגיאה");
  } catch (ex) {
    roomLogError("room create/join failed", ex);
    err.textContent = ex.message || "שגיאה";
    err.classList.remove("hidden");
    showToast(ex.message || "שגיאה");
  } finally {
    if (submitBtn && !window.location.pathname.includes("/room")) {
      submitBtn.disabled = false;
      submitBtn.textContent = prevLabel || "פתח חדר";
    }
  }
}

function openTeacherRoom() {
  roomLog("clicked open room (open modal)");
  openModal("teacher");
}

bindOpenRoomFlow();

(function handleOpenRoomFromPlay() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("openRoom") !== "1") return;

  let pending = null;
  try {
    pending = JSON.parse(sessionStorage.getItem("gameclass-pending-room-game") || "null");
  } catch {
    /* ignore */
  }

  if (pending?.gameId) {
    window.location.replace("/room?create=1");
    return;
  }

  params.delete("openRoom");
  const clean = params.toString();
  history.replaceState(null, "", clean ? `/?${clean}` : "/");

  openModal("teacher");
  if (pending?.material && $("#joinMaterialInput")) {
    $("#joinMaterialInput").value = pending.material;
  }
})();
bindPlayModeModal();
bindSoloContentModal();

GameAuth?.bindModals(showToast);
GameAuth?.onUserChange?.((user) => {
  if (user && !GameAuth.isDevPreviewUser?.()) {
    window.location.href = "/my-room";
  }
});
document.getElementById("mobileLoginBtn")?.addEventListener("click", () => {
  document.getElementById("loginModal")?.classList.remove("hidden");
  $("#menuToggle")?.classList.remove("open");
  $("#mobileNav")?.classList.remove("open");
});

$("#modalClose")?.addEventListener("click", closeModal);
$("#joinModal")?.addEventListener("click", (e) => {
  if (e.target === $("#joinModal")) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (!$("#playModeModal")?.classList.contains("hidden")) {
    closePlayModeModal();
    return;
  }
  if (!$("#soloContentModal")?.classList.contains("hidden")) {
    closeSoloContentModal();
    return;
  }
  if (!$("#joinModal")?.classList.contains("hidden")) closeModal();
});

socket.on("connect", () => {
  const connHint = document.getElementById("socketConnHint");
  if (connHint) connHint.classList.add("hidden");
});

socket.on("connect_error", () => {
  showToast("לא מתחבר לשרת — ודאו ש-npm start רץ");
});

socket.on("disconnect", () => {
  if (state.room) showToast("החיבור נותק — מנסה להתחבר מחדש…");
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

$("#shareRoomBtn")?.addEventListener("click", async () => {
  const code = $("#roomCodeDisplay")?.textContent;
  if (!code || code === "------") return;
  const url = roomJoinUrl(code);
  const title = $("#roomTitleDisplay")?.textContent || "חדר Pleyi";
  if (navigator.share) {
    try {
      await navigator.share({ title, text: `הצטרפו לחדר ${title}`, url });
      return;
    } catch {
      /* cancelled or failed — fall through to copy */
    }
  }
  navigator.clipboard?.writeText(url).then(() => showToast("הקישור הועתק"));
});

$("#roomEmojiBar")?.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-emoji]");
  if (btn) sendRoomEmoji(btn.dataset.emoji);
});

$("#studentsList")?.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn || state.role !== "teacher") return;
  const studentId = btn.dataset.studentId;
  const action = btn.dataset.action;
  if (action === "kick") {
    if (!confirm("להעיף את התלמיד/ה מהחדר?")) return;
    socket.emit("room:kick", { studentId }, (res) => {
      if (res?.ok) showToast("התלמיד/ה הוצא/ה מהחדר");
      else showToast(res?.error || "שגיאה");
    });
  } else if (action === "transfer") {
    const chip = btn.closest(".student-chip");
    const name = chip?.querySelector(".student-chip-name")?.textContent?.trim() || "משתתף/ת";
    if (!confirm(`להעביר את ניהול החדר ל${name}?`)) return;
    socket.emit("room:transfer-manager", { targetId: studentId }, (res) => {
      if (res?.ok) showToast("ניהול החדר הועבר");
      else showToast(res?.error || "שגיאה");
    });
  } else if (action === "suspend") {
    const chip = btn.closest(".student-chip");
    const suspending = !chip?.classList.contains("student-chip--suspended");
    socket.emit("room:suspend", { studentId, suspend: suspending }, (res) => {
      if (res?.ok) showToast(suspending ? "התלמיד/ה הושהה" : "ההשהיה בוטלה");
      else showToast(res?.error || "שגיאה");
    });
  }
});

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
    window.location.href = `/join?code=${joinCode}`;
  }
})();


function formatWhatsAppPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("972")) return digits;
  if (digits.startsWith("0")) return `972${digits.slice(1)}`;
  return digits;
}

let contactWaNum = formatWhatsAppPhone("0586122187");

function initContactExtras() {
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
  sessionStorage.removeItem("gameclass-host");
  document.title = "Pleyi — לימוד דרך משחקים";
  history.replaceState(null, "", "/");
  showView("landing");
  socket.emit("room:leave-teacher", {}, () => {
    socket.disconnect();
    socket.connect();
  });
  showToast("עזבת את החדר");
});

function guardNavWhileInRoom(e) {
  if (state.role === "teacher" && state.room) {
    e.preventDefault();
    showToast("אתם בחדר כיתה — «עזוב חדר» לחזרה לדף הבית");
  }
}

$("#logoHome")?.addEventListener("click", (e) => {
  if (state.room) {
    e.preventDefault();
    guardNavWhileInRoom(e);
    return;
  }
  showView("landing");
});

document.querySelectorAll('.nav-pill[href^="#"], #mobileNav a[href^="#"]').forEach((a) => {
  a.addEventListener("click", guardNavWhileInRoom);
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
  sessionStorage.removeItem("gameclass-host");
  document.title = "Pleyi — לימוד דרך משחקים";
  history.replaceState(null, "", "/");
  showView("landing");
});

socket.on("room:manager-transferred", ({ demoted, teacherToken, code, message }) => {
  if (demoted) {
    sessionStorage.removeItem("gameclass-host");
    showToast(message || "העברת את ניהול החדר");
    setTimeout(() => {
      window.location.href = `/join?code=${code || state.room?.code || ""}`;
    }, 1500);
    return;
  }
  showToast(message || "קיבלת/י את ניהול החדר!");
  const roomCode = code || state.room?.code;
  sessionStorage.setItem(
    "gameclass-host",
    JSON.stringify({
      code: roomCode,
      token: teacherToken,
      title: state.room?.roomTitle || state.room?.teacherName || "",
    })
  );
  setTimeout(() => {
    const q = new URLSearchParams();
    q.set("code", roomCode);
    q.set("t", teacherToken);
    window.location.href = `/room?${q.toString()}`;
  }, 1500);
});

socket.on("room:chat", (msg) => {
  if (!state.room) return;
  state.room.chat = [...(state.room.chat || []), msg].slice(-50);
  renderChatLog(state.room.chat);
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

roomLog("app.js ready", {
  joinForm: !!document.getElementById("joinForm"),
  socketIo: typeof io !== "undefined",
});
