/* Play together (/together, public/js/together.js) — English word games for
   two players (one on one) or a whole group (survival).

   The server keeps the room: who is in it, the host's choice of mode, game
   and topic, and everyone's score and hearts. Every phone runs the game
   itself from the round's seed and reports its score and hearts; the server
   decides when the round ends and who won. Nothing is stored — a room lives
   in memory while someone is in it.

   Client → server (all with a callback):
     tg:create { name }                → { ok, code, me: { id, token }, room }
     tg:join   { code, name }          → { ok, code, me, room }
     tg:rejoin { code, token }         → { ok, code, me, room }   (after a reload or a dropped line)
     tg:settings { mode, game, topic, hostPlays }   host, in the lobby
     tg:start                          host, from the lobby or the results
     tg:progress { score, hearts }     a player, during the round
     tg:lobby                          host, from the results back to the lobby
     tg:kick { id }                    host
     tg:leave
   Server → client:
     tg:room  room view (roomView)
     tg:kicked */

const crypto = require("crypto");

// Off for now (the site owner, 2026-11-11): /together sends to the class
// games page, no page links to it, and the socket events aren't mounted.
const ENABLED = false;

const MODES = ["duel", "survival"];
const GAMES = ["catch", "pick", "listen"];
const MAX_PLAYERS = 40;
const HEARTS = 3;
const COUNTDOWN_MS = 3800;
const DUEL_MS = 60000;
// A survival round that somehow never ends (everyone stays alive) stops here.
const SURVIVAL_MAX_MS = 6 * 60000;
// Scores sent after the duel clock ran out still count for this long.
const END_GRACE_MS = 1200;
// A player whose line dropped keeps their place this long.
const DROP_GRACE_MS = 15000;
const EMPTY_ROOM_MS = 2 * 60000;

const rooms = new Map();

function newCode() {
  let code;
  do {
    code = String(1000 + Math.floor(Math.random() * 9000));
  } while (rooms.has(code));
  return code;
}

function cleanName(name) {
  return String(name || "")
    .replace(/[\u0000-\u001f<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 14);
}

function newPlayer(name, socketId) {
  return {
    id: crypto.randomBytes(5).toString("hex"),
    token: crypto.randomBytes(16).toString("hex"),
    name,
    socketId,
    connected: true,
    joinedAt: Date.now(),
    dropTimer: null,
    playing: false,
    score: 0,
    hearts: HEARTS,
    out: false,
    outAt: 0,
    left: false,
  };
}

function roundPlayers(room) {
  return [...room.players.values()].filter((p) => p.playing);
}

// The players who take part when the host presses start.
function readyPlayers(room) {
  return [...room.players.values()].filter((p) => p.connected && (p.id !== room.hostId || room.settings.hostPlays));
}

// Why the round can't start yet, or "".
function startBlock(room) {
  const n = readyPlayers(room).length;
  if (room.settings.mode === "duel") {
    if (n < 2) return "need-one-more";
    if (n > 2) return "duel-too-many";
    return "";
  }
  return n < 2 ? "need-one-more" : "";
}

// The order at the end: survival — who lasted longest, duel — most points.
// Players who left the round come last.
function ranking(room) {
  const list = roundPlayers(room);
  const survival = room.round?.mode === "survival";
  list.sort((a, b) => {
    if (a.left !== b.left) return a.left ? 1 : -1;
    if (survival) {
      if (a.out !== b.out) return a.out ? 1 : -1;
      if (a.out && a.outAt !== b.outAt) return b.outAt - a.outAt;
    }
    return b.score - a.score;
  });
  let place = 0;
  return list.map((p, i) => {
    const prev = list[i - 1];
    const same = prev && prev.left === p.left && prev.score === p.score && (!survival || (prev.out === p.out && (!p.out || prev.outAt === p.outAt)));
    if (!same) place = i + 1;
    return { id: p.id, name: p.name, score: p.score, hearts: p.hearts, out: p.out, left: p.left, place };
  });
}

function roomView(room) {
  const now = Date.now();
  const round = room.round;
  return {
    code: room.code,
    phase: room.phase,
    hostId: room.hostId,
    settings: room.settings,
    startBlock: startBlock(room),
    players: [...room.players.values()].map((p) => ({
      id: p.id,
      name: p.name,
      connected: p.connected,
      playing: p.playing,
      score: p.score,
      hearts: p.hearts,
      out: p.out,
      left: p.left,
    })),
    round:
      round && room.phase !== "lobby"
        ? {
            id: round.id,
            seed: round.seed,
            mode: round.mode,
            game: round.game,
            topic: round.topic,
            hearts: HEARTS,
            // Relative times — the phones' clocks don't agree with ours.
            startIn: Math.max(0, round.startsAt - now),
            endIn: round.endsAt ? Math.max(0, round.endsAt - now) : null,
          }
        : null,
    results: room.phase === "results" ? room.results : null,
  };
}

function mount(io) {
  function emitRoom(room) {
    clearTimeout(room.emitTimer);
    room.emitTimer = null;
    io.to(`tg:${room.code}`).emit("tg:room", roomView(room));
  }

  // Score updates arrive often during a round — send them in small batches.
  function emitSoon(room) {
    if (room.emitTimer) return;
    room.emitTimer = setTimeout(() => emitRoom(room), 120);
  }

  function clearRoundTimers(room) {
    clearTimeout(room.startTimer);
    clearTimeout(room.endTimer);
    clearTimeout(room.capTimer);
    room.startTimer = null;
    room.endTimer = null;
    room.capTimer = null;
  }

  function finishRound(room) {
    if (room.phase !== "playing" && room.phase !== "countdown") return;
    clearRoundTimers(room);
    room.phase = "results";
    room.results = ranking(room);
    emitRoom(room);
  }

  // Survival ends when one player (or nobody) is still in; a duel ends when
  // a player left it.
  function checkRoundEnd(room) {
    if (room.phase !== "playing" && room.phase !== "countdown") return;
    const list = roundPlayers(room);
    if (room.round.mode === "survival") {
      const alive = list.filter((p) => !p.out && !p.left);
      if (alive.length <= 1) {
        clearTimeout(room.endTimer);
        // A moment for the last scores to arrive.
        room.endTimer = setTimeout(() => finishRound(room), 400);
      }
    } else if (list.some((p) => p.left)) {
      finishRound(room);
    }
  }

  function startRound(room) {
    clearRoundTimers(room);
    const players = readyPlayers(room);
    room.players.forEach((p) => {
      p.playing = players.includes(p);
      p.score = 0;
      p.hearts = HEARTS;
      p.out = false;
      p.outAt = 0;
      p.left = false;
    });
    const { mode, game, topic } = room.settings;
    const startsAt = Date.now() + COUNTDOWN_MS;
    room.round = {
      id: (room.round?.id || 0) + 1,
      seed: Math.floor(Math.random() * 2 ** 31),
      mode,
      game,
      topic,
      startsAt,
      endsAt: mode === "duel" ? startsAt + DUEL_MS : null,
    };
    room.phase = "countdown";
    room.results = null;
    room.startTimer = setTimeout(() => {
      if (room.phase !== "countdown") return;
      room.phase = "playing";
      emitRoom(room);
    }, COUNTDOWN_MS);
    if (mode === "duel") room.endTimer = setTimeout(() => finishRound(room), COUNTDOWN_MS + DUEL_MS + END_GRACE_MS);
    else room.capTimer = setTimeout(() => finishRound(room), COUNTDOWN_MS + SURVIVAL_MAX_MS);
    emitRoom(room);
  }

  function deleteRoom(room) {
    clearRoundTimers(room);
    clearTimeout(room.emptyTimer);
    clearTimeout(room.emitTimer);
    room.players.forEach((p) => clearTimeout(p.dropTimer));
    rooms.delete(room.code);
  }

  // The earliest player still connected runs the room when the host is gone.
  function passHost(room) {
    const next = [...room.players.values()].filter((p) => p.connected && p.id !== room.hostId).sort((a, b) => a.joinedAt - b.joinedAt)[0];
    if (next) room.hostId = next.id;
  }

  function removePlayer(room, player) {
    clearTimeout(player.dropTimer);
    if (player.playing && (room.phase === "playing" || room.phase === "countdown")) {
      // Out of the round, but still on its results.
      player.left = true;
      player.connected = false;
      if (!player.out) {
        player.out = true;
        player.outAt = Date.now();
      }
      player.removed = true;
    } else {
      room.players.delete(player.id);
    }
    if (room.hostId === player.id) passHost(room);
    checkRoundEnd(room);
    if (![...room.players.values()].some((p) => p.connected)) {
      deleteRoom(room);
      return;
    }
    emitRoom(room);
  }

  // Players who left during a round go once it is over.
  function sweepRemoved(room) {
    room.players.forEach((p) => {
      if (p.removed) room.players.delete(p.id);
    });
  }

  function watchEmpty(room) {
    clearTimeout(room.emptyTimer);
    if ([...room.players.values()].some((p) => p.connected)) return;
    room.emptyTimer = setTimeout(() => deleteRoom(room), EMPTY_ROOM_MS);
  }

  function attach(socket, room, player) {
    clearTimeout(player.dropTimer);
    clearTimeout(room.emptyTimer);
    player.socketId = socket.id;
    player.connected = true;
    socket.data.tg = { code: room.code, id: player.id };
    socket.join(`tg:${room.code}`);
  }

  function context(socket) {
    const ref = socket.data.tg;
    if (!ref) return {};
    const room = rooms.get(ref.code);
    const player = room?.players.get(ref.id);
    if (!room || !player || player.removed || player.socketId !== socket.id) return {};
    return { room, player, isHost: room.hostId === player.id };
  }

  function welcome(room, player) {
    return { ok: true, code: room.code, me: { id: player.id, token: player.token }, room: roomView(room) };
  }

  io.on("connection", (socket) => {
    socket.on("tg:create", ({ name } = {}, cb) => {
      const clean = cleanName(name);
      if (!clean) return cb?.({ ok: false, error: "name" });
      const code = newCode();
      const player = newPlayer(clean, socket.id);
      const room = {
        code,
        hostId: player.id,
        phase: "lobby",
        settings: { mode: "duel", game: "catch", topic: "all", hostPlays: true },
        players: new Map([[player.id, player]]),
        round: null,
        results: null,
      };
      rooms.set(code, room);
      attach(socket, room, player);
      cb?.(welcome(room, player));
    });

    socket.on("tg:join", ({ code, name } = {}, cb) => {
      const room = rooms.get(String(code || "").trim());
      if (!room) return cb?.({ ok: false, error: "no-room" });
      const clean = cleanName(name);
      if (!clean) return cb?.({ ok: false, error: "name" });
      const taken = [...room.players.values()].some((p) => !p.removed && p.name.toLowerCase() === clean.toLowerCase());
      if (taken) return cb?.({ ok: false, error: "name-taken" });
      if (room.players.size >= MAX_PLAYERS) return cb?.({ ok: false, error: "full" });
      const player = newPlayer(clean, socket.id);
      room.players.set(player.id, player);
      attach(socket, room, player);
      cb?.(welcome(room, player));
      emitRoom(room);
    });

    socket.on("tg:rejoin", ({ code, token } = {}, cb) => {
      const room = rooms.get(String(code || ""));
      const player = room && [...room.players.values()].find((p) => p.token === token && !p.removed);
      if (!player) return cb?.({ ok: false, error: "no-room" });
      attach(socket, room, player);
      cb?.(welcome(room, player));
      emitRoom(room);
    });

    socket.on("tg:settings", (payload = {}, cb) => {
      const { room, isHost } = context(socket);
      if (!room || !isHost) return cb?.({ ok: false });
      if (room.phase !== "lobby" && room.phase !== "results") return cb?.({ ok: false });
      const s = room.settings;
      if (MODES.includes(payload.mode)) s.mode = payload.mode;
      if (GAMES.includes(payload.game)) s.game = payload.game;
      if (typeof payload.topic === "string" && /^[a-z0-9-]{1,32}$/.test(payload.topic)) s.topic = payload.topic;
      if (typeof payload.hostPlays === "boolean") s.hostPlays = payload.hostPlays;
      cb?.({ ok: true });
      emitRoom(room);
    });

    socket.on("tg:start", (_payload, cb) => {
      const { room, isHost } = context(socket);
      if (!room || !isHost) return cb?.({ ok: false });
      if (room.phase !== "lobby" && room.phase !== "results") return cb?.({ ok: false });
      sweepRemoved(room);
      const block = startBlock(room);
      if (block) {
        emitRoom(room);
        return cb?.({ ok: false, error: block });
      }
      startRound(room);
      cb?.({ ok: true });
    });

    socket.on("tg:progress", ({ score, hearts } = {}, cb) => {
      const { room, player } = context(socket);
      if (!room || !player?.playing || player.out || room.phase !== "playing") return cb?.({ ok: false });
      // No more points than a quick player could really get by now.
      const elapsed = Math.max(0, Date.now() - room.round.startsAt);
      const cap = Math.ceil(elapsed / 300) + 3;
      const s = Math.floor(Number(score));
      if (Number.isFinite(s)) player.score = Math.max(0, Math.min(cap, s));
      if (room.round.mode === "survival") {
        const h = Math.floor(Number(hearts));
        // Hearts only go down.
        if (Number.isFinite(h)) player.hearts = Math.max(0, Math.min(player.hearts, h));
        if (player.hearts <= 0) {
          player.out = true;
          player.outAt = Date.now();
          checkRoundEnd(room);
          emitRoom(room);
          return cb?.({ ok: true });
        }
      }
      emitSoon(room);
      cb?.({ ok: true });
    });

    socket.on("tg:lobby", (_payload, cb) => {
      const { room, isHost } = context(socket);
      if (!room || !isHost || room.phase !== "results") return cb?.({ ok: false });
      sweepRemoved(room);
      room.phase = "lobby";
      room.results = null;
      cb?.({ ok: true });
      emitRoom(room);
    });

    socket.on("tg:kick", ({ id } = {}, cb) => {
      const { room, isHost } = context(socket);
      const target = room?.players.get(String(id || ""));
      if (!room || !isHost || !target || target.id === room.hostId) return cb?.({ ok: false });
      const targetSocket = io.sockets.sockets.get(target.socketId);
      if (targetSocket) {
        targetSocket.leave(`tg:${room.code}`);
        targetSocket.data.tg = null;
        targetSocket.emit("tg:kicked");
      }
      removePlayer(room, target);
      cb?.({ ok: true });
    });

    socket.on("tg:leave", (_payload, cb) => {
      const { room, player } = context(socket);
      socket.data.tg = null;
      if (room) {
        socket.leave(`tg:${room.code}`);
        removePlayer(room, player);
      }
      cb?.({ ok: true });
    });

    socket.on("disconnect", () => {
      const { room, player } = context(socket);
      if (!room) return;
      player.connected = false;
      player.dropTimer = setTimeout(() => {
        if (rooms.get(room.code) === room && room.players.get(player.id) === player && !player.connected) removePlayer(room, player);
      }, DROP_GRACE_MS);
      watchEmpty(room);
      emitRoom(room);
    });
  });
}

module.exports = { mount, ENABLED };
