/* Student mobile join page */

(function () {
  const socket = io();
  const state = {
    role: "student",
    room: null,
    playerId: null,
    activeGame: null,
    gameState: null,
    suspended: false,
  };

  const $ = (id) => document.getElementById(id);

  function toast(msg) {
    const t = $("toast");
    t.textContent = msg;
    t.classList.remove("hidden");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.add("hidden"), 2800);
  }

  function showError(msg) {
    const el = $("joinError");
    el.textContent = msg;
    el.classList.remove("hidden");
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderChatLog(messages) {
    const log = $("studentChatLog");
    if (!log) return;
    if (!messages?.length) {
      log.innerHTML = '<p class="room-chat-empty">שלחו אימוג\'י!</p>';
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

  function updateSuspendedUI() {
    $("studentSuspended")?.classList.toggle("hidden", !state.suspended);
    $("studentEmojiBar")?.classList.toggle("hidden", state.suspended);
  }

  function enterRoom(data) {
    state.room = data;
    state.playerId = data.playerId || socket.id;
    const me = data.students?.find((s) => s.id === state.playerId);
    state.suspended = !!me?.suspended;

    $("joinScreen").classList.add("hidden");
    $("studentRoom").classList.remove("hidden");
    $("studentWelcome").textContent = data.roomTitle || data.teacherName || "חדר כיתה";
    $("studentCode").textContent = data.code;

    if (data.chat) renderChatLog(data.chat);
    updateSuspendedUI();

    if (data.activeGame && data.gameState) {
      state.activeGame = data.activeGame;
      state.gameState = data.gameState;
      renderGame();
    }
  }

  function gameCtx() {
    return {
      role: "student",
      playerId: state.playerId,
      playerKey: state.playerId,
      room: state.room,
      scores: state.room?.scores,
      sendAction: (action, data, cb) => {
        if (state.suspended) {
          toast("הושהיתם על ידי המורה");
          return;
        }
        socket.emit("game:action", { action, data }, (res) => {
          if (res?.error) toast(res.error);
          else if (res?.correct === true) toast("נכון! 🎉");
          else if (res?.correct === false) toast("לא נכון");
          cb?.(res);
        });
      },
    };
  }

  function renderGame() {
    if (!state.activeGame || !state.gameState) {
      $("studentWaiting").classList.remove("hidden");
      $("studentGame").classList.add("hidden");
      return;
    }
    $("studentWaiting").classList.add("hidden");
    $("studentGame").classList.remove("hidden");
    const root = $("studentGameContent");
    root.innerHTML = Games.render(state.activeGame, state.gameState, gameCtx());
    Games.bind(state.activeGame, root, gameCtx());
  }

  const params = new URLSearchParams(location.search);
  const preCode = params.get("code") || params.get("join");
  if (preCode && /^\d{6}$/.test(preCode)) $("joinCode").value = preCode;

  $("joinForm").addEventListener("submit", (e) => {
    e.preventDefault();
    $("joinError").classList.add("hidden");
    const code = $("joinCode").value.trim();
    const name = $("joinName").value.trim();
    if (!/^\d{6}$/.test(code)) return showError("קוד חדר חייב להיות 6 ספרות");
    if (!name) return showError("נא להזין שם");

    socket.emit("room:join", { code, name }, (res) => {
      if (res?.ok) enterRoom(res);
      else showError(res?.error || "שגיאה בהצטרפות");
    });
  });

  $("joinLeave").addEventListener("click", () => {
    location.href = "/";
  });

  $("studentEmojiBar")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-emoji]");
    if (!btn || state.suspended) return;
    socket.emit("room:chat", { emoji: btn.dataset.emoji }, (res) => {
      if (res?.ok === false) toast(res?.error || "לא ניתן לשלוח");
    });
  });

  socket.on("game:state", ({ activeGame, state: gs }) => {
    state.activeGame = activeGame;
    state.gameState = gs;
    renderGame();
    toast("המשחק התחיל!");
  });

  socket.on("game:left", () => {
    state.activeGame = null;
    state.gameState = null;
    renderGame();
  });

  socket.on("room:update", (room) => {
    state.room = { ...state.room, ...room };
    if (room.students) {
      const me = room.students.find((s) => s.id === state.playerId);
      if (me) state.suspended = !!me.suspended;
    }
    updateSuspendedUI();
    if (room.chat) renderChatLog(room.chat);
  });

  socket.on("room:chat", (msg) => {
    if (!state.room) return;
    state.room.chat = [...(state.room.chat || []), msg].slice(-50);
    renderChatLog(state.room.chat);
  });

  socket.on("room:suspended", ({ suspended }) => {
    state.suspended = !!suspended;
    updateSuspendedUI();
    toast(suspended ? "הושהיתם על ידי המורה" : "ההשהיה בוטלה");
  });

  socket.on("room:kicked", ({ reason }) => {
    toast(reason || "הוצאתם מהחדר");
    setTimeout(() => (location.href = "/join"), 1500);
  });

  socket.on("room:closed", ({ reason }) => {
    toast(reason || "החדר נסגר");
    setTimeout(() => (location.href = "/"), 1500);
  });
})();
