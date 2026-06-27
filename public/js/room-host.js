/* Teacher room host — dedicated /room page */

const HOST_KEY = "gameclass-host";
const PENDING_KEY = "gameclass-pending-room";
const socket = typeof io !== "undefined" ? io() : null;

const state = {
  role: "teacher",
  room: null,
  activeGame: null,
  gameState: null,
  scores: { teacher: 0, student: 0 },
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

(function bootstrapFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const token = params.get("t");
  if (code && token) {
    sessionStorage.setItem(
      HOST_KEY,
      JSON.stringify({
        code,
        token,
        title: "",
      })
    );
  }
})();

(function showPendingRoomImmediately() {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (!data?.ok || !data?.code) return;
    if (Date.now() - (data.savedAt || 0) > 180000) return;
    const urlCode = new URLSearchParams(window.location.search).get("code");
    if (urlCode && urlCode !== data.code) return;
    enterRoom(data);
    sessionStorage.removeItem(PENDING_KEY);
  } catch (err) {
    console.warn("pending room load:", err);
  }
})();

function showToast(msg) {
  const t = $("#toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.remove("hidden");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => t.classList.add("hidden"), 2800);
}

function roomJoinUrl(code) {
  return `${window.location.origin}/join?code=${code}`;
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function readHostSession() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const token = params.get("t");
  if (code && token) {
    return { code, token };
  }
  try {
    return JSON.parse(sessionStorage.getItem(HOST_KEY) || "null");
  } catch {
    return null;
  }
}

function showRoomError(message, homeHref = "/") {
  $("#roomLoading")?.classList.add("hidden");
  $("#roomView")?.classList.add("hidden");
  const err = $("#roomError");
  if (err) {
    err.classList.remove("hidden");
    err.querySelector(".room-error-text").textContent = message;
    err.querySelector(".room-error-home").href = homeHref;
  }
}

function waitForSocket(timeoutMs = 20000) {
  return new Promise((resolve, reject) => {
    if (!socket) {
      reject(new Error("אין חיבור לשרת — הריצו npm start"));
      return;
    }
    if (socket.connected) {
      resolve();
      return;
    }
    const timer = setTimeout(() => {
      socket.off("connect", onConnect);
      reject(new Error("לא מתחבר לשרת — ודאו ש-npm start רץ"));
    }, timeoutMs);
    function onConnect() {
      clearTimeout(timer);
      resolve();
    }
    socket.once("connect", onConnect);
    if (!socket.active) socket.connect();
  });
}

function emitAck(event, payload, timeoutMs = 15000) {
  return waitForSocket(timeoutMs).then(
    () =>
      new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("השרת לא עונה")), timeoutMs);
        socket.emit(event, payload, (res) => {
          clearTimeout(timer);
          if (res === undefined) reject(new Error("אין תשובה מהשרת"));
          else resolve(res);
        });
      })
  );
}

function showRoom() {
  $("#roomLoading")?.classList.add("hidden");
  $("#roomError")?.classList.add("hidden");
  $("#roomView")?.classList.remove("hidden");
  window.scrollTo(0, 0);
  if (typeof RoomIdleRunner !== "undefined" && !state.activeGame) {
    requestAnimationFrame(() => RoomIdleRunner.start());
  }
}

function updateConnectedStats(studentCount) {
  const total = 1 + studentCount;
  const totalEl = $("#connectedTotal");
  const badgeEl = $("#studentCountBadge");

  if (totalEl) totalEl.textContent = String(total);
  if (badgeEl) badgeEl.textContent = String(studentCount);
}

const TILE_COLORS = ["teal", "pink", "yellow", "orange", "lime", "blue", "purple"];

function participantInitial(name) {
  const t = String(name || "?").trim();
  return t ? t.charAt(0).toUpperCase() : "?";
}

function renderParticipantsGrid(room) {
  const teacherDock = $("#teacherDock");
  const studentsStrip = $("#studentsGrid");
  if (!teacherDock || !room) return;

  const teacherName = room.roomTitle || room.teacherName || "מורה";
  const students = room.students || [];

  teacherDock.innerHTML = `
    <div class="room-participant room-participant--teacher room-participant--color-purple">
      <div class="room-participant-avatar">${escapeHtml(participantInitial(teacherName))}</div>
      <span class="room-participant-name">${escapeHtml(teacherName)}</span>
      <span class="room-participant-badge">מנהל/ת</span>
    </div>`;

  if (!studentsStrip) return;

  if (students.length === 0) {
    studentsStrip.innerHTML = "";
    return;
  }

  studentsStrip.innerHTML = students
    .map((s, i) => {
      const color = TILE_COLORS[i % TILE_COLORS.length];
      return `
        <div class="room-participant room-participant--student room-participant--color-${color}${s.suspended ? " room-participant--suspended" : ""}" data-student-id="${s.id}">
          <div class="room-participant-avatar">${escapeHtml(participantInitial(s.name))}</div>
          <span class="room-participant-name">${escapeHtml(s.name)}</span>
          <span class="room-participant-score">${s.score || 0} נק׳</span>
          ${s.suspended ? '<span class="room-participant-badge">מושהה</span>' : ""}
          <div class="room-participant-actions room-manager-only">
            <button type="button" class="room-participant-promote" data-action="transfer" data-student-id="${s.id}">העבר ניהול</button>
            <button type="button" data-action="suspend" data-student-id="${s.id}">${s.suspended ? "המשך" : "השהה"}</button>
            <button type="button" class="room-participant-kick" data-action="kick" data-student-id="${s.id}">העף</button>
          </div>
        </div>`;
    })
    .join("");
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
  socket?.emit("room:chat", { emoji }, (res) => {
    if (res?.ok === false) showToast(res?.error || "לא ניתן לשלוח");
  });
}

function isCurrentManager(room) {
  if (!room || !socket?.id) return false;
  const managerId = room.managerId || room.teacherId;
  return managerId === socket.id;
}

function updateManagerAccess(room) {
  const isManager = isCurrentManager(room);
  state.isManager = isManager;
  document.body.classList.toggle("is-room-manager", isManager);
  if (!isManager) {
    closeGamesPanel();
    closeSettingsPanel();
    closeSharePanel();
  }
}

function updateGameNameButton() {
  const label = $("#currentGameBtnLabel");
  if (!label) return;
  label.textContent = state.activeGame
    ? GAME_NAMES[state.activeGame] || state.activeGame
    : "בחרו משחק";
}

function syncSettingsUI(room) {
  if (!room) return;
  const reactions = $("#enableReactionsToggle");
  const chat = $("#enableChatToggle");
  const participants = $("#showParticipantsToggle");
  if (reactions) reactions.checked = room.enableReactions !== false;
  if (chat) chat.checked = room.enableChat !== false;
  if (participants) participants.checked = room.showParticipantsToGuests !== false;
}

function updateLobbyUI(room) {
  const students = room?.students || [];
  const hasStudents = students.length > 0;
  const hint = $("#roomLobbyHint");
  if (hint) {
    hint.textContent = hasStudents
      ? "גללו ובחרו משחק — האורחים ייכנסו אוטומטית"
      : "בחרו משחק — שתפו קישור כדי שאורחים יצטרפו";
  }
  $$(".room-game-btn").forEach((btn) => {
    btn.disabled = false;
  });
  syncSettingsUI(room);
}

function updateRoomUI(room) {
  if (!room) return;
  state.room = room;
  updateManagerAccess(room);
  $("#roomCodeDisplay").textContent = room.code;
  $("#sharePanelCode").textContent = room.code;
  $("#roomTitleDisplay").textContent = room.roomTitle || room.teacherName || "חדר כיתה";
  const joinPage = $("#openJoinPageBtn");
  if (joinPage && room.code) joinPage.href = `/join?code=${room.code}`;

  const students = room.students || [];
  renderParticipantsGrid(room);
  updateLobbyUI(room);

  updateConnectedStats(students.length);
  renderChatLog(room.chat);
  updateGameNameButton();

  const joinUrl = roomJoinUrl(room.code);
  const qrImg = $("#roomQrCode");
  if (qrImg) {
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=${encodeURIComponent(joinUrl)}`;
  }
}

function renderGame() {
  const waitMsg = $("#roomIdleWaitMsg");
  const zoomStage = $("#roomZoomStage");
  if (!state.activeGame || !state.gameState) {
    $("#gamePanel")?.classList.add("hidden");
    zoomStage?.classList.remove("hidden");
    document.querySelector(".room-host-body")?.classList.remove("room-host-body--in-game");
    waitMsg?.classList.remove("hidden");
    if (typeof RoomIdleRunner !== "undefined") RoomIdleRunner.start();
    updateGameNameButton();
    return;
  }

  waitMsg?.classList.add("hidden");
  document.querySelector(".room-host-body")?.classList.add("room-host-body--in-game");

  if (typeof RoomIdleRunner !== "undefined") RoomIdleRunner.stop();
  zoomStage?.classList.add("hidden");
  $("#gamePanel")?.classList.remove("hidden");
  $("#activeGameTitle").textContent = GAME_NAMES[state.activeGame] || state.activeGame;
  updateGameNameButton();

  const ctx = {
    role: state.role,
    playerId: socket?.id,
    playerKey: "teacher",
    room: state.room,
    scores: state.scores,
    sendAction: (action, data) => {
      socket.emit("game:action", { action, data }, (res) => {
        if (res?.ok === false) showToast("פעולה לא זמינה");
        else if (res?.correct === true) showToast("נכון! 🎉");
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
  state.role = "teacher";
  state.room = data;
  state.scores = data.scores || { teacher: 0, student: 0 };
  state.activeGame = data.activeGame || null;
  state.gameState = data.gameState || null;
  document.title = `חדר ${data.code} — GameClass`;

  const host = readHostSession();
  if (host?.token) {
    sessionStorage.setItem(
      HOST_KEY,
      JSON.stringify({
        code: data.code,
        token: host.token,
        title: data.roomTitle || data.teacherName || "",
      })
    );
  }

  history.replaceState(null, "", `/room?code=${data.code}`);
  showRoom();
  updateRoomUI(data);
  renderGame();
}

let joinStarted = false;

async function connectToRoom() {
  if (joinStarted || !socket) return;
  joinStarted = true;

  const host = readHostSession();
  if (!host?.code || !host?.token) {
    if (!state.room) {
      showRoomError("לא נמצא חדר — חזרו לדף הבית ולחצו «פתח חדר כיתה»");
    }
    joinStarted = false;
    return;
  }

  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await emitAck("room:host-rejoin", { code: host.code, token: host.token });
      if (res?.ok) {
        enterRoom(res);
        showToast(`חדר «${res.roomTitle || res.teacherName || ""}» מחובר!`);
        return;
      }
      if (!state.room) {
        showRoomError(res?.error || "חדר לא נמצא — פתחו חדר חדש מהדף הראשי");
      }
      return;
    } catch (err) {
      if (attempt < 3) {
        await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
        continue;
      }
      if (!state.room) {
        showRoomError(err.message || "שגיאת חיבור — ודאו ש-npm start רץ");
      } else {
        showToast("מחובר לחדר — מנסה לסנכרן שוב…");
      }
    }
  }
  joinStarted = false;
}

if (socket) {
  socket.on("connect", () => {
    connectToRoom();
  });

  socket.on("connect_error", () => {
    if (!state.room) showToast("לא מתחבר לשרת — ודאו ש-npm start רץ");
  });

  socket.on("disconnect", () => {
    if (state.room) showToast("החיבור נותק — מנסה להתחבר מחדש…");
  });

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

  socket.on("room:closed", ({ reason }) => {
    sessionStorage.removeItem(HOST_KEY);
    sessionStorage.removeItem(PENDING_KEY);
    showToast(reason || "החדר נסגר");
    setTimeout(() => {
      window.location.href = "/";
    }, 1800);
  });

  socket.on("room:manager-transferred", ({ demoted, code, message }) => {
    if (!demoted) return;
    sessionStorage.removeItem(HOST_KEY);
    sessionStorage.removeItem(PENDING_KEY);
    showToast(message || "העברת את ניהול החדר");
    setTimeout(() => {
      window.location.href = `/join?code=${code || state.room?.code || ""}`;
    }, 1800);
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

  socket.on("room:chat", (msg) => {
    if (!state.room) return;
    state.room.chat = [...(state.room.chat || []), msg].slice(-50);
    renderChatLog(state.room.chat);
  });

  if (socket.connected) connectToRoom();
} else {
  showRoomError("אין חיבור לשרת — הריצו npm start וגלשו ל-http://localhost:3456");
}

$("#copyCodeBtn")?.addEventListener("click", () => {
  const code = $("#roomCodeDisplay")?.textContent;
  if (code && code !== "------") {
    navigator.clipboard?.writeText(code).then(() => showToast("הקוד הועתק"));
  }
});

function openSharePanel() {
  closeGamesPanel();
  closeSettingsPanel();
  const panel = $("#roomSharePanel");
  const btn = $("#openSharePanelBtn");
  if (!panel) return;
  panel.classList.remove("hidden");
  btn?.setAttribute("aria-expanded", "true");
  $("#roomShareSocial")?.classList.add("hidden");
  $("#shareRoomBtn")?.setAttribute("aria-expanded", "false");
}

function closeSharePanel() {
  const panel = $("#roomSharePanel");
  const btn = $("#openSharePanelBtn");
  if (!panel) return;
  panel.classList.add("hidden");
  btn?.setAttribute("aria-expanded", "false");
  $("#roomShareSocial")?.classList.add("hidden");
  $("#shareRoomBtn")?.setAttribute("aria-expanded", "false");
}

function openGamesPanel() {
  if (!state.isManager) return;
  closeSharePanel();
  closeSettingsPanel();
  const panel = $("#roomGamesPanel");
  const btn = $("#openGamesPanelBtn");
  if (!panel) return;
  panel.classList.remove("hidden");
  btn?.setAttribute("aria-expanded", "true");
}

function closeGamesPanel() {
  const panel = $("#roomGamesPanel");
  const btn = $("#openGamesPanelBtn");
  if (!panel) return;
  panel.classList.add("hidden");
  btn?.setAttribute("aria-expanded", "false");
}

function openSettingsPanel() {
  if (!state.isManager) return;
  closeSharePanel();
  closeGamesPanel();
  const panel = $("#roomSettingsPanel");
  const btn = $("#openSettingsPanelBtn");
  if (!panel) return;
  syncSettingsUI(state.room);
  panel.classList.remove("hidden");
  btn?.setAttribute("aria-expanded", "true");
}

function closeSettingsPanel() {
  const panel = $("#roomSettingsPanel");
  const btn = $("#openSettingsPanelBtn");
  if (!panel) return;
  panel.classList.add("hidden");
  btn?.setAttribute("aria-expanded", "false");
}

function emitRoomSettings() {
  if (!socket) return;
  const payload = {
    enableReactions: $("#enableReactionsToggle")?.checked !== false,
    enableChat: $("#enableChatToggle")?.checked !== false,
    showParticipantsToGuests: $("#showParticipantsToggle")?.checked !== false,
  };
  socket.emit("room:update-settings", payload, (res) => {
    if (res?.ok) showToast("ההגדרות עודכנו");
    else {
      syncSettingsUI(state.room);
      showToast(res?.error || "שגיאה בעדכון הגדרות");
    }
  });
}

$("#openSharePanelBtn")?.addEventListener("click", openSharePanel);
$("#closeSharePanelBtn")?.addEventListener("click", closeSharePanel);
$("#roomSharePanelBackdrop")?.addEventListener("click", closeSharePanel);

$("#openGamesPanelBtn")?.addEventListener("click", openGamesPanel);
$("#closeGamesPanelBtn")?.addEventListener("click", closeGamesPanel);
$("#roomGamesPanelBackdrop")?.addEventListener("click", closeGamesPanel);

$("#openSettingsPanelBtn")?.addEventListener("click", openSettingsPanel);
$("#closeSettingsPanelBtn")?.addEventListener("click", closeSettingsPanel);
$("#roomSettingsPanelBackdrop")?.addEventListener("click", closeSettingsPanel);

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (!$("#roomSharePanel")?.classList.contains("hidden")) closeSharePanel();
  else if (!$("#roomGamesPanel")?.classList.contains("hidden")) closeGamesPanel();
  else if (!$("#roomSettingsPanel")?.classList.contains("hidden")) closeSettingsPanel();
});

$("#copyJoinLinkBtn")?.addEventListener("click", () => {
  const code = $("#roomCodeDisplay")?.textContent;
  if (code && code !== "------") {
    navigator.clipboard?.writeText(roomJoinUrl(code)).then(() => showToast("הקישור הועתק"));
  }
});

$("#shareRoomBtn")?.addEventListener("click", async () => {
  const code = $("#roomCodeDisplay")?.textContent;
  const title =
    state.room?.roomTitle || state.room?.teacherName || $("#roomTitleDisplay")?.textContent || "חדר GameClass";
  const socialContainer = $("#roomShareSocial");
  const shared = await shareRoomLink({
    code,
    title,
    socialContainer,
    onNativeSuccess: () => closeSharePanel(),
    onSocialShown: () => {
      $("#shareRoomBtn")?.setAttribute("aria-expanded", "true");
      socialContainer?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    },
  });
  if (!shared) {
    navigator.clipboard?.writeText(roomJoinUrl(code)).then(() => {
      showToast("הקישור הועתק");
      closeSharePanel();
    });
  }
});

$(".room-bottom-dock")?.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn || !socket) return;
  const studentId = btn.dataset.studentId;
  const action = btn.dataset.action;
  if (action === "kick") {
    if (!confirm("להעיף את התלמיד/ה מהחדר?")) return;
    socket.emit("room:kick", { studentId }, (res) => {
      if (res?.ok) showToast("התלמיד/ה הוצא/ה מהחדר");
      else showToast(res?.error || "שגיאה");
    });
  } else if (action === "transfer") {
    const tile = btn.closest(".room-participant");
    const name = tile?.querySelector(".room-participant-name")?.textContent?.trim() || "משתתף/ת";
    if (!confirm(`להעביר את ניהול החדר ל${name}?`)) return;
    socket.emit("room:transfer-manager", { targetId: studentId }, (res) => {
      if (res?.ok) showToast("ניהול החדר הועבר");
      else showToast(res?.error || "שגיאה");
    });
  } else if (action === "suspend") {
    const tile = btn.closest(".room-participant");
    const suspending = !tile?.classList.contains("room-participant--suspended");
    socket.emit("room:suspend", { studentId, suspend: suspending }, (res) => {
      if (res?.ok) showToast(suspending ? "התלמיד/ה הושהה" : "ההשהיה בוטלה");
      else showToast(res?.error || "שגיאה");
    });
  }
});

$("#leaveGameBtn")?.addEventListener("click", () => {
  socket?.emit("game:action", { action: "leave-game" });
});

$("#leaveRoomBtn")?.addEventListener("click", () => {
  if (!confirm("לסגור את החדר ולחזור לדף הבית?")) return;
  socket?.emit("room:leave-teacher", {}, () => {
    sessionStorage.removeItem(HOST_KEY);
    sessionStorage.removeItem(PENDING_KEY);
    window.location.href = "/";
  });
});

function setChatOpen(open) {
  const chat = $("#roomStageChat");
  const stage = $("#roomZoomStage");
  const btn = $("#toggleChatBtn");
  if (!chat || !stage) return;
  chat.classList.toggle("hidden", !open);
  stage.classList.toggle("room-game-area--chat-open", open);
  btn?.setAttribute("aria-expanded", open ? "true" : "false");
  btn?.classList.toggle("room-bottom-btn--active", open);
}

function toggleChat() {
  const chat = $("#roomStageChat");
  if (!chat) return;
  setChatOpen(chat.classList.contains("hidden"));
}

$("#toggleChatBtn")?.addEventListener("click", toggleChat);
$("#closeChatBtn")?.addEventListener("click", () => setChatOpen(false));

$("#toggleVideoBtn")?.addEventListener("click", () => {
  showToast("מצלמת וידאו — בקרוב!");
});

function setDockCollapsed(collapsed) {
  const wrap = $("#roomBottomDockWrap");
  const btn = $("#toggleDockBtn");
  if (!wrap || !btn) return;
  wrap.classList.toggle("is-collapsed", collapsed);
  btn.setAttribute("aria-expanded", collapsed ? "false" : "true");
  btn.setAttribute("aria-label", collapsed ? "הצג משתתפים" : "הסתר משתתפים");
}

$("#toggleDockBtn")?.addEventListener("click", () => {
  const wrap = $("#roomBottomDockWrap");
  setDockCollapsed(!wrap?.classList.contains("is-collapsed"));
});

$("#roomEmojiBar")?.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-emoji]");
  if (btn) sendRoomEmoji(btn.dataset.emoji);
});

$("#roomHomeLink")?.addEventListener("click", (e) => {
  e.preventDefault();
  showToast("לחצו «עזוב חדר» כדי לחזור לדף הבית");
});

$$(".room-game-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (!state.isManager) return;
    const gameId = btn.dataset.game;
    if (!gameId || !socket) return;
    socket.emit("game:start", { gameId }, (res) => {
      if (res?.ok) {
        closeGamesPanel();
        showToast("המשחק התחיל!");
      } else showToast(res?.error || "לא ניתן להתחיל משחק");
    });
  });
});

["enableReactionsToggle", "enableChatToggle", "showParticipantsToggle"].forEach((id) => {
  $(`#${id}`)?.addEventListener("change", emitRoomSettings);
});
