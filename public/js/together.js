/* Play together (/together) — English word games with friends.

   Two modes:
   - One on one: two players, one minute, the most points wins.
   - Survival: the whole group plays, everyone has three hearts, the game
     gets faster, and the last one still in wins.
   Three games: catch the word (words fall, catch the picture's word), picture
   and word (pick the English word), listen and pick (pick the picture).

   lib/together.js keeps the room. Every phone runs the game itself from the
   round's seed and sends its score and hearts; the server ends the round and
   ranks the players. A host who doesn't play (a teacher on the board) and a
   player who joined mid-round see the live standings instead.

   The words are the picture-vocabulary topics (english-vocab.js). */

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const app = $("#tgApp");
  const stage = $("#tgStage");
  if (!app || !stage || typeof window.io !== "function") return;

  const NAME_KEY = "pleyi-together-name";
  // The room this tab is in, so a reload goes back into it.
  const SESSION_KEY = "pleyi-together-session";
  const MIN_WORDS = 6;
  // These pictures show a girl or a woman (the same list as english-games.js).
  const SKIP_PICTURES = new Set(["mother", "sister", "grandmother", "family", "hair"]);
  const pictureUrl = (id) => `/images/english/vocab/${id}.svg`;

  const ICONS = {
    duel: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6.5" cy="7" r="3"/><circle cx="17.5" cy="7" r="3"/><path d="M1.5 20v-1.5A4.5 4.5 0 0 1 6 14h1a4.5 4.5 0 0 1 4.5 4.5V20M12.5 20v-1.5A4.5 4.5 0 0 1 17 14h1a4.5 4.5 0 0 1 4.5 4.5V20"/></svg>`,
    survival: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.5 4 5.5v6c0 5 3.4 8.6 8 10 4.6-1.4 8-5 8-10v-6l-8-3Z"/><path d="M12 15.8s-3.6-2.2-3.6-4.8a2 2 0 0 1 3.6-1.2 2 2 0 0 1 3.6 1.2c0 2.6-3.6 4.8-3.6 4.8Z"/></svg>`,
    catch: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="2.5" width="7" height="5" rx="1.5"/><rect x="13" y="6.5" width="8" height="5" rx="1.5"/><path d="M6.5 9.5v2.5M17 13.5v2M3 15.5l2.2 5h13.6l2.2-5Z"/></svg>`,
    pick: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="12" rx="2"/><circle cx="8.5" cy="7.5" r="1.6"/><path d="m21 12-4.5-4.5L8 15M3 19h7M14 19h7"/></svg>`,
    listen: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4Z"/><path d="M15.5 9a4 4 0 0 1 0 6M18.3 6.3a8 8 0 0 1 0 11.4"/></svg>`,
    crown: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="#000" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M3 8.5 7.5 12 12 5l4.5 7L21 8.5 19 18H5Z"/></svg>`,
    heart: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.6s-8-4.8-8-10.5a4.4 4.4 0 0 1 8-2.6 4.4 4.4 0 0 1 8 2.6c0 5.7-8 10.5-8 10.5Z"/></svg>`,
    star: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="#000" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="m12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3-4.6-4.4 6.3-.9Z"/></svg>`,
    clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9.5 2.5h5"/></svg>`,
    people: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3.3"/><path d="M2.5 20v-1a5 5 0 0 1 5-5h3a5 5 0 0 1 5 5v1"/><path d="M16 4.9a3.3 3.3 0 0 1 0 6.3M18.5 14a5 5 0 0 1 3 4.6V20"/></svg>`,
    link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 14a4.5 4.5 0 0 0 6.4 0l3.2-3.2a4.5 4.5 0 0 0-6.4-6.4L12 5.6"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3.2 3.2a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2"/></svg>`,
  };

  const MODES = {
    duel: {
      title: "אחד על אחד",
      how: ["שני שחקנים, דקה אחת.", "מי שצובר יותר נקודות — מנצח."],
    },
    survival: {
      title: "הישרדות",
      how: ["כל הקבוצה משחקת. לכל אחד 3 לבבות.", "כל טעות מורידה לב, והמשחק נהיה מהיר יותר.", "מי שנשאר אחרון — מנצח."],
    },
  };

  const GAMES = {
    catch: {
      title: "תופסים מילים",
      how: ["למעלה יש תמונה.", "מילים באנגלית נופלות מלמעלה.", "תופסים רק את המילה של התמונה!"],
      play: playCatch,
    },
    pick: {
      title: "תמונה ומילה",
      how: ["רואים תמונה.", "בוחרים מהר את המילה הנכונה באנגלית."],
      play: (run) => playQuiz(run, "pick"),
    },
    listen: {
      title: "שומעים ובוחרים",
      how: ["שומעים מילה באנגלית.", "בוחרים מהר את התמונה הנכונה."],
      play: (run) => playQuiz(run, "listen"),
    },
  };

  const ERRORS = {
    name: "כתבו את השם שלכם.",
    code: "כתבו את קוד המשחק (4 ספרות).",
    "no-room": "לא מצאנו משחק עם הקוד הזה. בדקו את הקוד.",
    "name-taken": "השם הזה כבר תפוס במשחק. נסו שם אחר.",
    full: "המשחק מלא.",
    offline: "אין חיבור לשרת. נסו שוב בעוד רגע.",
  };

  const START_BLOCKS = {
    "need-one-more": "מחכים לעוד שחקן.",
    "duel-too-many": "באחד על אחד משחקים רק שניים. כדי שכולם ישחקו — בחרו הישרדות.",
  };

  /* ── Words ── */

  const TOPICS = (window.ENGLISH_VOCAB_CATEGORIES || [])
    .map((cat) => ({ id: cat.id, title: cat.title, words: cat.words.filter((w) => !SKIP_PICTURES.has(w.id)) }))
    .filter((topic) => topic.words.length >= MIN_WORDS);

  // One word per English spelling ("orange" is a color and a fruit).
  function uniqueWords(list) {
    const seen = new Set();
    return list.filter((w) => {
      const key = w.en.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function topicWords(id) {
    const topic = TOPICS.find((t) => t.id === id);
    return uniqueWords(topic ? topic.words : TOPICS.flatMap((t) => t.words));
  }

  function topicTitle(id) {
    return TOPICS.find((t) => t.id === id)?.title || "כל הנושאים";
  }

  /* ── Helpers ── */

  function esc(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function toast(msg) {
    const el = $("#toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.remove("hidden");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.add("hidden"), 2400);
  }

  function readName() {
    try {
      return localStorage.getItem(NAME_KEY) || "";
    } catch {
      return "";
    }
  }

  function saveName(name) {
    try {
      localStorage.setItem(NAME_KEY, name);
    } catch {
      /* private mode */
    }
  }

  function readSession() {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
    } catch {
      return null;
    }
  }

  function writeSession(value) {
    try {
      if (value) sessionStorage.setItem(SESSION_KEY, JSON.stringify(value));
      else sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* private mode */
    }
  }

  function joinUrl(roomCode) {
    return `${location.origin}/together?code=${roomCode}`;
  }

  function setAddress(roomCode) {
    const url = roomCode ? `/together?code=${roomCode}` : "/together";
    history.replaceState(null, "", url);
  }

  function pointsText(n) {
    return n === 1 ? "נקודה אחת" : `${n} נקודות`;
  }

  function heartsHtml(count, max) {
    return Array.from({ length: max }, (_, i) => `<span class="tg-heart${i < count ? " is-on" : ""}">${ICONS.heart}</span>`).join("");
  }

  function clockText(ms) {
    const sec = Math.max(0, Math.ceil(ms / 1000));
    return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
  }

  // The same numbers on every phone for the same seed (mulberry32).
  function makeRng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffle(list, rng) {
    const a = [...list];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pickOne(list, rng) {
    return list[Math.floor(rng() * list.length)];
  }

  /* ── Sound effects (Web Audio, no files) ── */

  let audioCtx = null;

  function sfx(kind) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    try {
      audioCtx = audioCtx || new Ctx();
      if (audioCtx.state === "suspended") audioCtx.resume();
    } catch {
      return;
    }
    const notes = {
      right: [
        [784, 0, 0.14, "triangle"],
        [1047, 0.08, 0.26, "triangle"],
      ],
      wrong: [[170, 0, 0.26, "sawtooth"]],
      out: [
        [330, 0, 0.2, "triangle"],
        [220, 0.16, 0.36, "triangle"],
      ],
      win: [
        [523, 0, 0.16, "triangle"],
        [659, 0.12, 0.16, "triangle"],
        [784, 0.24, 0.34, "triangle"],
      ],
    }[kind];
    (notes || []).forEach(([freq, at, dur, type]) => {
      const start = audioCtx.currentTime + at;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(type === "sawtooth" ? 0.07 : 0.14, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(start);
      osc.stop(start + dur + 0.05);
    });
  }

  function speak(text) {
    window.PleyiSpeech?.say(text);
  }

  /* ── Connection ── */

  const params = new URLSearchParams(location.search);
  const linkCode = /^\d{4}$/.test(params.get("code") || "") ? params.get("code") : "";
  const linkTopic = params.get("topic") || "";

  const socket = window.io();
  let code = null;
  let me = null; // { id, token }
  let room = null; // the latest room view from the server
  let lobbyCode = null; // the room the lobby on screen was built for
  let stageRound = 0; // the round the stage on screen shows
  let run = null; // the game running on this phone
  let stageStartAt = 0; // when the round on the stage starts and ends
  let stageEndAt = 0;
  let stageClock = null;
  let lostLine = false;

  socket.on("connect", () => {
    if (code && me) rejoin();
    if (lostLine) {
      lostLine = false;
      paintConnection();
    }
  });

  socket.on("disconnect", () => {
    if (!code) return;
    lostLine = true;
    paintConnection();
  });

  socket.on("tg:room", (view) => onRoom(view));

  socket.on("tg:kicked", () => {
    leaveLocal();
    toast("הוצאתם מהמשחק.");
  });

  function emit(event, payload) {
    return new Promise((resolve) => {
      if (!socket.connected) return resolve({ ok: false, error: "offline" });
      socket.timeout(8000).emit(event, payload, (err, res) => resolve(err ? { ok: false, error: "offline" } : res || { ok: false }));
    });
  }

  function enterRoom(res) {
    code = res.code;
    me = res.me;
    writeSession({ code, token: me.token });
    setAddress(code);
    onRoom(res.room);
  }

  async function rejoin() {
    const res = await emit("tg:rejoin", { code, token: me.token });
    if (res.ok) {
      enterRoom(res);
      return;
    }
    if (res.error === "offline") return;
    const wasIn = !!room;
    leaveLocal();
    if (wasIn) toast("המשחק נסגר.");
  }

  function leaveLocal() {
    stopRun();
    closeStage();
    code = null;
    me = null;
    room = null;
    lobbyCode = null;
    writeSession(null);
    setAddress(null);
    renderStart();
  }

  async function leave() {
    if (code) await emit("tg:leave");
    leaveLocal();
  }

  function paintConnection() {
    $$(".tg-offline").forEach((el) => el.classList.toggle("hidden", !lostLine));
  }

  function isHost() {
    return !!room && !!me && room.hostId === me.id;
  }

  function myPlayer() {
    return room?.players.find((p) => p.id === me?.id) || null;
  }

  /* ── Start: name, open a game or join one with a code ── */

  function renderStart() {
    stopRun();
    const joinFirst = !!linkCode;
    const createPanel = `
      <div class="tg-panel tg-option">
        <h2 class="tg-option-title">פתיחת משחק</h2>
        <p class="tg-note">פותחים משחק ומקבלים קוד.</p>
        <p class="tg-note">שולחים את הקוד לחברים.</p>
        <button type="button" class="btn btn-primary btn-candy font-cartoon tg-main-btn" data-act="create">פתיחת משחק</button>
      </div>`;
    const joinPanel = `
      <div class="tg-panel tg-option">
        <h2 class="tg-option-title">יש לי קוד</h2>
        <label class="tg-sr" for="tgCode">קוד המשחק</label>
        <input class="tg-input tg-code-input" id="tgCode" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" dir="ltr" placeholder="1234" value="${esc(linkCode)}" />
        <button type="button" class="btn btn-primary btn-candy font-cartoon tg-main-btn" data-act="join">הצטרפות</button>
      </div>`;
    app.innerHTML = `
      <div class="tg-start">
        <div class="tg-panel tg-name-panel">
          <label class="tg-label" for="tgName"><span class="tg-key">איך קוראים לכם?</span></label>
          <input class="tg-input" id="tgName" type="text" maxlength="14" autocomplete="nickname" placeholder="השם שלכם" value="${esc(readName())}" />
        </div>
        <div class="tg-start-grid">${joinFirst ? joinPanel + createPanel : createPanel + joinPanel}</div>
        <p class="tg-error hidden" id="tgError" role="alert"></p>
        <div class="tg-modes">
          ${Object.entries(MODES)
            .map(
              ([id, mode]) => `
            <div class="tg-panel tg-mode-card">
              <span class="tg-mode-icon">${ICONS[id]}</span>
              <h3 class="tg-mode-title">${esc(mode.title)}</h3>
              ${mode.how.map((line) => `<p class="tg-note">${esc(line)}</p>`).join("")}
            </div>`
            )
            .join("")}
        </div>
      </div>`;
    const nameInput = $("#tgName");
    if (joinFirst && !nameInput.value) nameInput.focus();
  }

  function startError(key) {
    const el = $("#tgError");
    if (!el) return;
    el.textContent = ERRORS[key] || ERRORS.offline;
    el.classList.toggle("hidden", !key);
  }

  function nameFromInput() {
    const name = ($("#tgName")?.value || "").replace(/\s+/g, " ").trim().slice(0, 14);
    if (!name) {
      startError("name");
      $("#tgName")?.focus();
      return "";
    }
    saveName(name);
    return name;
  }

  async function createRoom(btn) {
    const name = nameFromInput();
    if (!name) return;
    btn.disabled = true;
    const res = await emit("tg:create", { name });
    btn.disabled = false;
    if (!res.ok) return startError(res.error);
    enterRoom(res);
    if (linkTopic && TOPICS.some((t) => t.id === linkTopic)) emit("tg:settings", { topic: linkTopic });
  }

  async function joinRoom(btn) {
    const name = nameFromInput();
    if (!name) return;
    const value = ($("#tgCode")?.value || "").replace(/\D/g, "");
    if (value.length !== 4) {
      startError("code");
      $("#tgCode")?.focus();
      return;
    }
    btn.disabled = true;
    const res = await emit("tg:join", { code: value, name });
    btn.disabled = false;
    if (!res.ok) return startError(res.error);
    enterRoom(res);
  }

  /* ── Lobby: the code, the players and the host's choices ── */

  function choiceTiles(group, items, selected, host) {
    return Object.entries(items)
      .map(
        ([id, item]) => `
        <button type="button" class="tg-choice${id === selected ? " is-on" : ""}" data-group="${group}" data-value="${id}" aria-pressed="${id === selected}"${host ? "" : " disabled"}>
          <span class="tg-choice-icon">${ICONS[id]}</span>
          <span class="tg-choice-title">${esc(item.title)}</span>
        </button>`
      )
      .join("");
  }

  function buildLobby() {
    lobbyCode = code;
    app.innerHTML = `
      <div class="tg-lobby">
        <p class="tg-offline hidden" role="status">החיבור נותק. מתחברים שוב…</p>
        <div class="tg-lobby-grid">
          <div class="tg-panel tg-code-panel">
            <p class="tg-label"><span class="tg-key">קוד המשחק</span></p>
            <p class="tg-code" dir="ltr">${esc(code)}</p>
            <img class="tg-qr" src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=${encodeURIComponent(joinUrl(code))}" alt="קוד QR להצטרפות" width="140" height="140" loading="lazy" />
            <p class="tg-note">שלחו לחברים את הקוד או את הקישור.</p>
            <button type="button" class="tg-btn-alt" data-act="copy">${ICONS.link}<span>העתקת קישור</span></button>
          </div>
          <div class="tg-panel tg-players-panel">
            <p class="tg-label"><span class="tg-key">השחקנים</span> <span class="tg-count" id="tgPlayerCount"></span></p>
            <ul class="tg-players" id="tgPlayers"></ul>
          </div>
        </div>
        <div class="tg-panel tg-settings">
          <p class="tg-label"><span class="tg-key">מצב</span></p>
          <div class="tg-choices tg-choices--2" id="tgModes"></div>
          <div class="tg-how" id="tgModeHow"></div>
          <p class="tg-label"><span class="tg-key">משחק</span></p>
          <div class="tg-choices tg-choices--3" id="tgGames"></div>
          <div class="tg-how" id="tgGameHow"></div>
          <label class="tg-label" for="tgTopic"><span class="tg-key">נושא המילים</span></label>
          <select class="tg-input tg-select" id="tgTopic">
            <option value="all">כל הנושאים</option>
            ${TOPICS.map((t) => `<option value="${esc(t.id)}">${esc(t.title)}</option>`).join("")}
          </select>
          <label class="tg-check" id="tgHostPlaysRow"><input type="checkbox" id="tgHostPlays" /> <span>גם אני משחק/ת</span></label>
        </div>
        <div class="tg-start-row">
          <button type="button" class="btn btn-primary btn-candy font-cartoon tg-main-btn" data-act="start" id="tgStartBtn">מתחילים!</button>
          <p class="tg-start-note" id="tgStartNote"></p>
          <button type="button" class="tg-link-btn" data-act="leave">יציאה מהמשחק</button>
        </div>
      </div>`;
    paintConnection();
  }

  function paintLobby() {
    if (lobbyCode !== code || !$(".tg-lobby", app)) buildLobby();
    const host = isHost();
    const s = room.settings;

    $("#tgModes").innerHTML = choiceTiles("mode", MODES, s.mode, host);
    $("#tgGames").innerHTML = choiceTiles("game", GAMES, s.game, host);
    $("#tgModeHow").innerHTML = MODES[s.mode].how.map((line) => `<p class="tg-note">${esc(line)}</p>`).join("");
    $("#tgGameHow").innerHTML = GAMES[s.game].how.map((line) => `<p class="tg-note">${esc(line)}</p>`).join("");

    const topic = $("#tgTopic");
    if (document.activeElement !== topic) topic.value = TOPICS.some((t) => t.id === s.topic) ? s.topic : "all";
    topic.disabled = !host;
    $("#tgHostPlays").checked = s.hostPlays;
    $("#tgHostPlaysRow").classList.toggle("hidden", !host);

    const players = room.players.filter((p) => !p.left);
    $("#tgPlayerCount").textContent = `(${players.length})`;
    $("#tgPlayers").innerHTML = players
      .map((p) => {
        const isMe = p.id === me.id;
        const crown = p.id === room.hostId ? `<span class="tg-crown" role="img" aria-label="פותח/ת המשחק" title="פותח/ת המשחק">${ICONS.crown}</span>` : "";
        const kick = host && !isMe ? `<button type="button" class="tg-kick" data-act="kick" data-id="${esc(p.id)}" aria-label="הוצאת ${esc(p.name)} מהמשחק">×</button>` : "";
        return `<li class="tg-player${isMe ? " is-me" : ""}${p.connected ? "" : " is-away"}">${crown}<span class="tg-player-name">${esc(p.name)}</span>${isMe ? `<span class="tg-player-me">(אני)</span>` : ""}${kick}</li>`;
      })
      .join("");

    const startBtn = $("#tgStartBtn");
    const note = $("#tgStartNote");
    startBtn.classList.toggle("hidden", !host);
    startBtn.disabled = !!room.startBlock;
    note.textContent = host ? START_BLOCKS[room.startBlock] || "" : "מחכים שהמשחק יתחיל…";
  }

  app.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-act], .tg-choice");
    if (!btn || btn.disabled) return;
    if (btn.classList.contains("tg-choice")) {
      if (isHost()) emit("tg:settings", { [btn.dataset.group]: btn.dataset.value });
      return;
    }
    const act = btn.dataset.act;
    if (act === "create") createRoom(btn);
    else if (act === "join") joinRoom(btn);
    else if (act === "start") startRound(btn);
    else if (act === "leave") leave();
    else if (act === "kick") emit("tg:kick", { id: btn.dataset.id });
    else if (act === "copy") copyLink();
  });

  app.addEventListener("change", (e) => {
    if (!isHost()) return;
    if (e.target.id === "tgTopic") emit("tg:settings", { topic: e.target.value });
    if (e.target.id === "tgHostPlays") emit("tg:settings", { hostPlays: e.target.checked });
  });

  app.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    if (e.target.id === "tgCode") $("[data-act='join']", app)?.click();
    else if (e.target.id === "tgName") $(linkCode ? "[data-act='join']" : "[data-act='create']", app)?.click();
  });

  app.addEventListener("input", (e) => {
    if (e.target.id === "tgCode") e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (e.target.id === "tgName" || e.target.id === "tgCode") startError("");
  });

  async function copyLink() {
    const url = joinUrl(code);
    try {
      await navigator.clipboard.writeText(url);
      toast("הקישור הועתק");
    } catch {
      window.prompt("העתיקו את הקישור:", url);
    }
  }

  async function startRound(btn) {
    btn.disabled = true;
    // The words' sounds and pictures, before the countdown ends.
    preload(room.settings);
    const res = await emit("tg:start");
    if (!res.ok && res.error) toast(START_BLOCKS[res.error] || ERRORS.offline);
  }

  // A topic's pictures and sounds load before the countdown ends; "all the
  // topics" is too many, so those load as they come up.
  function preload(settings) {
    const words = topicWords(settings.topic);
    if (words.length > 40) return;
    window.PleyiSpeech?.preload(words.map((w) => w.en));
    words.forEach((w) => {
      new Image().src = pictureUrl(w.id);
    });
  }

  /* ── Room updates ── */

  function onRoom(view) {
    if (!me || !view || view.code !== code) return;
    const prev = room;
    room = view;
    if (!myPlayer()) {
      leaveLocal();
      return;
    }
    paintLobby();
    if (view.phase === "lobby") {
      stopRun();
      closeStage();
      return;
    }
    if (prev?.phase === "lobby" || !prev) preload(view.round || view.settings);
    syncStage(prev);
  }

  /* ── The game screen ── */

  function openStage() {
    stage.classList.remove("hidden");
    document.documentElement.classList.add("tg-open");
  }

  function closeStage() {
    stageRound = 0;
    clearInterval(stageClock);
    stage.classList.add("hidden");
    stage.innerHTML = "";
    document.documentElement.classList.remove("tg-open");
  }

  function buildStage() {
    const round = room.round;
    stageRound = round.id;
    stage.innerHTML = `
      <div class="tg-bar">
        <button type="button" class="tg-round-btn" data-act="exit" aria-label="יציאה מהמשחק">×</button>
        <h2 class="tg-stage-title" id="tgStageTitle">${esc(GAMES[round.game].title)}</h2>
        <div class="tg-bar-end" id="tgBarEnd"></div>
      </div>
      <div class="tg-hud" id="tgHud"></div>
      <div class="tg-board" id="tgBoard"></div>
      <div class="tg-overlay hidden" id="tgOverlay"></div>
      <div class="tg-flash" id="tgFlash" aria-live="polite"></div>
      <p class="tg-offline tg-offline--stage hidden" role="status">החיבור נותק. מתחברים שוב…</p>`;
    paintConnection();
    openStage();
    clearInterval(stageClock);
    if (round.endIn != null) {
      stageStartAt = performance.now() + round.startIn;
      stageEndAt = performance.now() + round.endIn;
      stageClock = setInterval(paintClock, 250);
    }
    $("[data-act='exit']", stage).focus({ preventScroll: true });
  }

  function syncStage(prev) {
    const round = room.round;
    const mine = myPlayer();
    if (!round) return;
    const fresh = stageRound !== round.id;
    if (fresh) {
      stopRun();
      buildStage();
    }

    if (room.phase === "results") {
      if (run) stopRun();
      showResults();
      return;
    }

    // In the round on this phone, or watching it.
    const inRound = mine.playing && !mine.left;
    if (fresh) {
      if (inRound && !mine.out) startRun(mine);
      else showWatch();
    }
    if (prev && prev.round?.id === round.id) announceOuts(prev);
    paintHud();
    if (!run || run.ended) paintWatchList();
  }

  // "Dan is out!" when someone runs out of hearts.
  function announceOuts(prev) {
    if (room.round.mode !== "survival") return;
    const before = new Map(prev.players.map((p) => [p.id, p.out]));
    room.players.forEach((p) => {
      if (p.playing && p.out && before.get(p.id) === false && p.id !== me.id) flash(`${p.name} בחוץ!`, "is-out");
    });
  }

  function flash(text, kind = "") {
    const el = $("#tgFlash", stage);
    if (!el) return;
    const item = document.createElement("span");
    item.className = `tg-flash-item ${kind}`;
    item.textContent = text;
    // Over the title, one at a time — the newest.
    el.replaceChildren(item);
    setTimeout(() => item.remove(), 1800);
  }

  function alivePlayers() {
    return room.players.filter((p) => p.playing && !p.out && !p.left);
  }

  function paintHud() {
    const round = room.round;
    const barEnd = $("#tgBarEnd", stage);
    const hud = $("#tgHud", stage);
    if (!barEnd || !hud) return;
    const inRun = run && !run.ended;

    if (round.mode === "duel") {
      if (!barEnd.firstChild) barEnd.innerHTML = `<span class="tg-pill tg-pill--time">${ICONS.clock}<b id="tgClock">1:00</b></span>`;
      const players = room.players.filter((p) => p.playing);
      const mine = players.find((p) => p.id === me.id);
      const others = players.filter((p) => p.id !== me.id);
      const side = (p, isMe) => {
        const score = isMe && run ? run.score : p.score;
        return `<span class="tg-vs-side${isMe ? " is-me" : ""}"><span class="tg-vs-name">${esc(isMe ? "אני" : p.name)}</span><b class="tg-vs-score">${score}</b></span>`;
      };
      const sides = mine ? [side(mine, true), ...others.map((p) => side(p, false))] : others.map((p) => side(p, false));
      hud.innerHTML = `<div class="tg-vs">${sides.join(`<span class="tg-vs-sep">נגד</span>`)}</div>`;
    } else {
      const alive = alivePlayers().length;
      const total = room.players.filter((p) => p.playing).length;
      barEnd.innerHTML = `<span class="tg-pill" title="נשארו במשחק">${ICONS.people}<b>${alive}/${total}</b></span>`;
      hud.innerHTML = inRun
        ? `<div class="tg-hud-row">
            <span class="tg-pill tg-pill--hearts" role="img" aria-label="נשארו ${run.hearts} לבבות">${heartsHtml(run.hearts, run.maxHearts)}</span>
            <span class="tg-pill">${ICONS.star}<b>${run.score}</b></span>
          </div>`
        : "";
    }
  }

  function paintClock() {
    const el = $("#tgClock", stage);
    if (!el || !room?.round || room.round.mode !== "duel") return;
    // A full minute during the countdown.
    el.textContent = clockText(Math.min(stageEndAt - stageStartAt, stageEndAt - performance.now()));
  }

  // The live standings — for a host who doesn't play, a player who joined
  // during the round, and a player who is out.
  function watchListHtml() {
    const survival = room.round.mode === "survival";
    const players = room.players
      .filter((p) => p.playing)
      .sort((a, b) => (survival && a.out !== b.out ? (a.out ? 1 : -1) : b.score - a.score));
    return `<ol class="tg-live">${players
      .map(
        (p) => `
        <li class="tg-live-row${p.out ? " is-out" : ""}${p.id === me.id ? " is-me" : ""}">
          <span class="tg-live-name">${esc(p.name)}</span>
          ${survival ? `<span class="tg-live-hearts">${heartsHtml(p.hearts, room.round.hearts)}</span>` : ""}
          <span class="tg-live-score">${p.score}</span>
        </li>`
      )
      .join("")}</ol>`;
  }

  function showWatch() {
    const mine = myPlayer();
    const board = $("#tgBoard", stage);
    // The server may not have heard about the last heart yet.
    const out = (mine.playing && mine.out) || (run?.survival && run.hearts <= 0);
    let lead = "";
    if (out) lead = `<p class="tg-watch-lead">נגמרו הלבבות!</p><p class="tg-note">מחכים לסוף המשחק…</p>`;
    else if (!mine.playing && mine.id !== room.hostId) lead = `<p class="tg-watch-lead">המשחק כבר התחיל.</p><p class="tg-note">תצטרפו לסיבוב הבא.</p>`;
    board.innerHTML = `<div class="tg-watch">${lead}<div class="tg-watch-list" id="tgWatchList"></div></div>`;
    if (room.phase === "countdown") countdown(room.round.startIn);
    paintWatchList();
  }

  function paintWatchList() {
    const el = $("#tgWatchList", stage);
    if (el) el.innerHTML = watchListHtml();
  }

  function countdown(ms) {
    const overlay = $("#tgOverlay", stage);
    const startAt = performance.now() + ms;
    const tick = () => {
      if (!overlay.isConnected) return;
      const left = startAt - performance.now();
      if (left <= 0) {
        overlay.innerHTML = `<span class="tg-count-num tg-count-go">קדימה!</span>`;
        overlay.classList.add("is-fading");
        setTimeout(() => {
          overlay.classList.add("hidden");
          overlay.classList.remove("is-fading");
        }, 600);
        return;
      }
      const n = Math.min(3, Math.ceil(left / 1000));
      if (overlay.dataset.n !== String(n)) {
        overlay.dataset.n = String(n);
        overlay.innerHTML = `<span class="tg-count-num">${n}</span>`;
      }
      requestAnimationFrame(tick);
    };
    overlay.classList.remove("hidden");
    overlay.dataset.n = "";
    tick();
  }

  function showResults() {
    const results = room.results || [];
    const board = $("#tgBoard", stage);
    const overlay = $("#tgOverlay", stage);
    overlay.classList.add("hidden");
    $("#tgFlash", stage).innerHTML = "";
    $("#tgHud", stage).innerHTML = "";
    $("#tgBarEnd", stage).innerHTML = "";
    if (board.dataset.results === String(room.round.id)) {
      paintResultActions();
      return;
    }
    board.dataset.results = String(room.round.id);

    const top = results.filter((r) => r.place === 1);
    const mine = results.find((r) => r.id === me.id);
    let title;
    if (mine?.place === 1 && top.length === 1) title = "ניצחתם!";
    else if (top.length > 1 && (!mine || mine.place === 1)) title = "תיקו!";
    else title = top[0] ? `במקום הראשון: ${top[0].name}` : "המשחק נגמר";
    const sub = mine && mine.place > 1 ? `<p class="tg-note">המקום שלכם: ${mine.place}</p>` : "";
    if (mine) sfx(mine.place === 1 ? "win" : "out");

    board.innerHTML = `
      <div class="tg-results">
        <h3 class="tg-results-title"><span class="tg-key">${esc(title)}</span></h3>
        ${sub}
        <ol class="tg-rank">
          ${results
            .map(
              (r) => `
            <li class="tg-rank-row${r.id === me.id ? " is-me" : ""}${r.place === 1 ? " is-first" : ""}">
              <span class="tg-rank-place">${r.place}</span>
              <span class="tg-rank-name">${esc(r.name)}${r.left ? ` <small>(יצא/ה)</small>` : ""}</span>
              <span class="tg-rank-score">${esc(pointsText(r.score))}</span>
            </li>`
            )
            .join("")}
        </ol>
        <div class="tg-results-actions" id="tgResultActions"></div>
      </div>`;
    paintResultActions();
  }

  function paintResultActions() {
    const el = $("#tgResultActions", stage);
    if (!el) return;
    el.innerHTML = isHost()
      ? `<button type="button" class="btn btn-primary btn-candy font-cartoon tg-main-btn" data-act="again">עוד סיבוב</button>
         <button type="button" class="tg-btn-alt" data-act="lobby">משחק אחר</button>
         ${room.startBlock ? `<p class="tg-start-note">${esc(START_BLOCKS[room.startBlock] || "")}</p>` : ""}`
      : `<p class="tg-note">מחכים לסיבוב הבא…</p>`;
    const again = $("[data-act='again']", el);
    if (again) again.disabled = !!room.startBlock;
  }

  stage.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-act]");
    if (!btn || btn.disabled) return;
    const act = btn.dataset.act;
    if (act === "exit") {
      const playingNow = run && !run.ended && room?.phase !== "results";
      if (playingNow && !window.confirm("לצאת מהמשחק?")) return;
      leave();
    } else if (act === "again") {
      btn.disabled = true;
      emit("tg:start").then((res) => {
        if (!res.ok && res.error) toast(START_BLOCKS[res.error] || ERRORS.offline);
        btn.disabled = false;
      });
    } else if (act === "lobby") emit("tg:lobby");
  });

  /* ── A round on this phone ── */

  function startRun(mine) {
    const round = room.round;
    const now = performance.now();
    run = {
      round,
      words: topicWords(round.topic),
      rng: makeRng(round.seed),
      survival: round.mode === "survival",
      maxHearts: round.hearts,
      hearts: mine.hearts,
      score: mine.score,
      startAt: now + round.startIn,
      endAt: round.endIn != null ? now + round.endIn : Infinity,
      ended: false,
      timers: new Set(),
      cleanups: [],
    };
    const r = run;
    r.later = (fn, ms) => {
      const id = setTimeout(() => {
        r.timers.delete(id);
        if (!r.ended) fn();
      }, ms);
      r.timers.add(id);
    };
    r.on = (el, type, fn, opts) => {
      el.addEventListener(type, fn, opts);
      r.cleanups.push(() => el.removeEventListener(type, fn, opts));
    };
    r.board = $("#tgBoard", stage);

    countdown(round.startIn);
    GAMES[round.game].play(r);

    // The duel clock.
    if (!r.survival) {
      const clock = setInterval(() => {
        if (!r.ended && performance.now() >= r.endAt) endRun("time");
      }, 200);
      r.cleanups.push(() => clearInterval(clock));
    }
  }

  function report() {
    if (run) emit("tg:progress", { score: run.score, hearts: run.hearts });
  }

  function addPoints(n) {
    if (!run || run.ended) return;
    run.score = Math.max(0, run.score + n);
    paintHud();
    report();
  }

  // A mistake: survival takes a heart, the last one ends the round here.
  function hurt() {
    if (!run || run.ended || !run.survival) return;
    run.hearts = Math.max(0, run.hearts - 1);
    paintHud();
    $(".tg-pill--hearts", stage)?.classList.add("is-hit");
    report();
    if (run.hearts <= 0) endRun("out");
  }

  function endRun(reason) {
    if (!run || run.ended) return;
    run.ended = true;
    clearRunTimers(run);
    report();
    const overlay = $("#tgOverlay", stage);
    if (reason === "out") {
      sfx("out");
      showWatch();
    } else if (overlay) {
      overlay.classList.remove("hidden", "is-fading");
      overlay.innerHTML = `<div class="tg-overlay-card"><p class="tg-watch-lead">נגמר הזמן!</p><p class="tg-note">צברתם ${esc(pointsText(run.score))}.</p><p class="tg-note">מחכים לתוצאות…</p></div>`;
    }
    paintHud();
  }

  function clearRunTimers(r) {
    r.timers.forEach((id) => clearTimeout(id));
    r.timers.clear();
    cancelAnimationFrame(r.frame);
    r.cleanups.forEach((fn) => fn());
    r.cleanups = [];
  }

  function stopRun() {
    if (!run) return;
    run.ended = true;
    clearRunTimers(run);
    window.PleyiSpeech?.stop();
    run = null;
  }

  // Runs fn(dt seconds, t seconds since the start) every frame once the
  // countdown is over.
  function loop(r, fn) {
    let last = 0;
    const step = (ts) => {
      if (r.ended) return;
      const now = performance.now();
      if (now >= r.startAt) {
        const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0;
        last = ts;
        fn(dt, (now - r.startAt) / 1000);
      }
      r.frame = requestAnimationFrame(step);
    };
    r.frame = requestAnimationFrame(step);
  }

  /* ════════ Catch the word — English words fall; catch the picture's word ════════ */

  function playCatch(r) {
    r.board.innerHTML = `
      <div class="tg-catch">
        <div class="tg-catch-target">
          <span class="tg-catch-label">תפסו:</span>
          <img class="tg-catch-pic" id="tgCatchPic" alt="" />
          <span class="tg-catch-he" id="tgCatchHe"></span>
        </div>
        <div class="tg-sky" id="tgSky"></div>
      </div>`;
    const sky = $("#tgSky", r.board);
    const pic = $("#tgCatchPic", r.board);
    const he = $("#tgCatchHe", r.board);
    const st = { target: null, drops: [], nextSpawn: 0.2, color: 0 };

    // Seconds a word takes to fall, and between two words — both shrink.
    const fallSec = (t) => Math.max(r.survival ? 1.9 : 2.8, 6.2 - t * 0.04);
    const spawnGap = (t) => Math.max(0.48, 1.15 - t * 0.008);
    const live = () => st.drops.filter((d) => !d.done);

    function setTarget() {
      const others = r.words.filter((w) => w !== st.target);
      st.target = pickOne(others, r.rng);
      pic.src = pictureUrl(st.target.id);
      he.textContent = st.target.he;
      pic.parentElement.classList.remove("is-new");
      void pic.parentElement.offsetWidth;
      pic.parentElement.classList.add("is-new");
    }

    function spawn(t) {
      const W = sky.clientWidth;
      if (!W) return;
      const lanes = Math.max(3, Math.min(5, Math.floor(W / 160)));
      const laneW = W / lanes;
      // A lane is free once its last word has fallen a little way.
      const busy = new Set(live().filter((d) => d.y < 70).map((d) => d.lane));
      const free = [...Array(lanes).keys()].filter((l) => !busy.has(l));
      if (!free.length) return;
      const onScreen = new Set(live().map((d) => d.word));
      let word;
      if (!onScreen.has(st.target)) word = st.target;
      else {
        const fresh = r.words.filter((w) => w !== st.target && !onScreen.has(w));
        word = pickOne(fresh.length ? fresh : r.words.filter((w) => w !== st.target), r.rng);
      }
      const lane = pickOne(free, r.rng);
      const el = document.createElement("button");
      el.type = "button";
      el.className = `tg-drop tg-drop--c${st.color++ % 5}`;
      el.dir = "ltr";
      el.textContent = word.en;
      el.style.maxWidth = `${Math.floor(laneW - 8)}px`;
      sky.appendChild(el);
      // A long word gets smaller rather than broken in two.
      let size = parseFloat(getComputedStyle(el).fontSize);
      while (el.scrollWidth > el.clientWidth + 1 && size > 12) {
        size -= 2;
        el.style.fontSize = `${size}px`;
      }
      const d = { el, word, lane, y: -el.offsetHeight - 4, x: lane * laneW + laneW / 2, done: false };
      d.speed = (sky.clientHeight + el.offsetHeight + 8) / fallSec(t);
      place(d);
      st.drops.push(d);
    }

    function place(d) {
      d.el.style.transform = `translate(calc(${d.x}px - 50%), ${d.y}px)`;
    }

    function retire(d, cls) {
      d.done = true;
      if (cls) d.el.classList.add(cls);
      d.el.disabled = true;
      setTimeout(() => d.el.remove(), cls ? 420 : 0);
    }

    function tap(d) {
      if (d.done || r.ended || performance.now() < r.startAt) return;
      if (d.word === st.target) {
        retire(d, "is-caught");
        sfx("right");
        speak(d.word.en);
        addPoints(1);
        setTarget();
        st.nextSpawn = Math.min(st.nextSpawn, st.t + 0.2);
      } else {
        retire(d, "is-wrong");
        sfx("wrong");
        if (r.survival) hurt();
        else addPoints(-1);
      }
    }

    r.on(sky, "pointerdown", (e) => {
      const el = e.target.closest(".tg-drop");
      const d = el && st.drops.find((x) => x.el === el);
      if (d) {
        e.preventDefault();
        tap(d);
      }
    });

    setTarget();
    st.t = 0;
    loop(r, (dt, t) => {
      st.t = t;
      if (t >= st.nextSpawn) {
        spawn(t);
        st.nextSpawn = t + spawnGap(t);
      }
      const H = sky.clientHeight;
      live().forEach((d) => {
        d.y += d.speed * dt;
        place(d);
        if (d.y > H) {
          const missed = d.word === st.target;
          retire(d, null);
          // Letting the picture's word fall costs a heart in survival.
          if (missed && r.survival) {
            sfx("wrong");
            hurt();
          }
        }
      });
      if (st.drops.length > 40) st.drops = live();
    });
  }

  /* ════════ Picture and word / Listen and pick — four answers, quickly ════════ */

  function playQuiz(r, kind) {
    const listen = kind === "listen";
    r.board.innerHTML = `
      <div class="tg-quiz tg-quiz--${kind}">
        <div class="tg-quiz-ask" id="tgAsk"></div>
        ${r.survival ? `<div class="tg-quiz-timer" aria-hidden="true"><span id="tgQuizBar"></span></div>` : ""}
        <div class="tg-quiz-options" id="tgOptions"></div>
      </div>`;
    const ask = $("#tgAsk", r.board);
    const options = $("#tgOptions", r.board);
    const bar = $("#tgQuizBar", r.board);
    const st = { deck: [], q: 0, target: null, locked: true, deadline: 0, limit: 0 };

    // Survival: less time for each question, down to a quick tap.
    const limitSec = (q) => Math.max(listen ? 3.4 : 2.6, (listen ? 8.5 : 7.5) - q * 0.22);

    function nextTarget() {
      if (!st.deck.length) {
        st.deck = shuffle(r.words, r.rng);
        if (st.deck[0] === st.target && st.deck.length > 1) st.deck.push(st.deck.shift());
      }
      return st.deck.shift();
    }

    function newQuestion() {
      st.target = nextTarget();
      const others = shuffle(
        r.words.filter((w) => w !== st.target),
        r.rng
      ).slice(0, 3);
      const choices = shuffle([st.target, ...others], r.rng);
      ask.innerHTML = listen
        ? `<button type="button" class="tg-quiz-say" id="tgSay" aria-label="שמעו שוב">${ICONS.listen}<span>שמעו שוב</span></button>`
        : `<img class="tg-quiz-pic" src="${esc(pictureUrl(st.target.id))}" alt="" />`;
      options.innerHTML = choices
        .map((w, i) =>
          listen
            ? `<button type="button" class="tg-option-btn tg-option-btn--pic" data-i="${i}" aria-label="${esc(w.he)}"><img src="${esc(pictureUrl(w.id))}" alt="" draggable="false" /></button>`
            : `<button type="button" class="tg-option-btn" data-i="${i}" dir="ltr">${esc(w.en)}</button>`
        )
        .join("");
      st.choices = choices;
      st.locked = false;
      st.q += 1;
      if (listen) r.later(() => speak(st.target.en), 120);
      if (r.survival) {
        st.limit = limitSec(st.q) * 1000;
        st.deadline = performance.now() + st.limit;
      }
    }

    function reveal(chosen) {
      $$(".tg-option-btn", options).forEach((btn, i) => {
        const w = st.choices[i];
        btn.disabled = true;
        if (w === st.target) btn.classList.add("is-right");
        else if (i === chosen) btn.classList.add("is-wrong");
      });
    }

    function answer(i) {
      if (st.locked || r.ended || performance.now() < r.startAt) return;
      st.locked = true;
      const right = st.choices[i] === st.target;
      reveal(i);
      if (right) {
        sfx("right");
        if (!listen) speak(st.target.en);
        addPoints(1);
        r.later(newQuestion, 450);
      } else {
        sfx("wrong");
        if (r.survival) hurt();
        // A wrong guess in a duel costs a moment, so guessing doesn't pay.
        r.later(newQuestion, r.survival ? 1000 : 1500);
      }
    }

    function timeUp() {
      st.locked = true;
      reveal(-1);
      sfx("wrong");
      flash("נגמר הזמן!", "is-out");
      hurt();
      r.later(newQuestion, 1000);
    }

    r.on(options, "click", (e) => {
      const btn = e.target.closest(".tg-option-btn");
      if (btn) answer(Number(btn.dataset.i));
    });
    r.on(ask, "click", (e) => {
      if (e.target.closest("#tgSay")) speak(st.target.en);
    });

    // The first question waits for the countdown.
    r.later(newQuestion, Math.max(0, r.startAt - performance.now()));
    if (r.survival) {
      loop(r, () => {
        if (st.locked || !st.deadline) return;
        const left = st.deadline - performance.now();
        if (bar) bar.style.transform = `scaleX(${Math.max(0, left / st.limit)})`;
        if (left <= 0) timeUp();
      });
    }
  }

  /* ── Start ── */

  const saved = readSession();
  if (saved?.code && saved?.token) {
    code = saved.code;
    me = { id: null, token: saved.token };
    app.innerHTML = `<p class="tg-note tg-loading">מתחברים למשחק…</p>`;
    // Socket "connect" runs the rejoin; if the server is unreachable the
    // start screen shows after a while.
    setTimeout(() => {
      if (code && !room) leaveLocal();
    }, 9000);
  } else {
    renderStart();
  }
})();
