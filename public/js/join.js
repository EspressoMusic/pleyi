/* Student mobile join page */

(function () {
  const socket = io();
  const state = { role: "student", room: null, playerId: null, activeGame: null, gameState: null };

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

  function enterRoom(data) {
    state.room = data;
    state.playerId = data.playerId || socket.id;
    $("joinScreen").classList.add("hidden");
    $("studentRoom").classList.remove("hidden");
    $("studentWelcome").textContent = `שלום, ${data.students?.find((s) => s.id === state.playerId)?.name || "תלמיד"}!`;
    $("studentCode").textContent = data.code;
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
        socket.emit("game:action", { action, data }, (res) => {
          if (res?.correct === true) toast("נכון! 🎉");
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

  socket.on("game:state", ({ activeGame, state: gs }) => {
    state.activeGame = activeGame;
    state.gameState = gs;
    renderGame();
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
      if (me) $("studentWelcome").textContent = `שלום, ${me.name}!`;
    }
  });

  socket.on("room:closed", ({ reason }) => {
    toast(reason || "החדר נסגר");
    setTimeout(() => (location.href = "/"), 1500);
  });
})();
