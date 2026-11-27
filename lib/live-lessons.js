/* Live lesson (שיעור חי, public/js/live-lesson.js + /live) — the teacher
   presents a lesson on the site, and every student who joined sees the same
   slide on their own screen.

   The server keeps only what the teacher shows right now (which lesson,
   which slide, "הסבר מורחב", picture slides) and who is watching. It's all
   in memory — nothing is saved. A session has a 4-digit code the students
   type on /live; the teacher can also open it to their classes ("הכיתות
   שלי"), and then a student's own page (/s/<key>) shows a join button.
   It lives while the teacher's page is open, and HOST_GRACE_MS after it
   closed — moving to another page of the site keeps it going.

   Client → server (all with a callback):
     live:create  { state }               teacher → { ok, code, token, viewers }
     live:host    { code, token }         teacher, after a reload or on another page
                                          → { ok, code, state, viewers, classIds }
     live:state   { state }               teacher, on every slide change
     live:tap     { s, k, p, t, o, x, y, wx, wy }  teacher tapped the slide (no callback)
     live:classes { ids, idToken }        teacher: the classes whose students get a join button
     live:end                             teacher
     live:join    { code, name, token }   student → { ok, me: { token }, state, hostOnline }
     live:leave                           student
     live:watch   { key }                 a student's own page: tell me when my class has a live lesson
   Server → client:
     live:state   state                   students
     live:tap     tap                     students: where the teacher tapped
     live:host    { online }              students
     live:ended                           students
     live:viewers [{ id, name }]          teacher
     live:class   [{ code, title }]       a student's own page */

const crypto = require("crypto");
const classes = require("./classes");
const studentProgress = require("./student-progress");
const { verifyIdToken } = require("./firebase-admin");

const MAX_VIEWERS = 120;
const MAX_SESSIONS = 300;
// The teacher's page closed (or moved to another page): the lesson waits.
const HOST_GRACE_MS = 30 * 60000;
// A student's line dropped (a reload): they keep their place this long.
const VIEWER_GRACE_MS = 20000;
// Students hear that the teacher is away only after this — a page change
// on the teacher's side takes a second or two.
const HOST_AWAY_NOTICE_MS = 6000;
const MAX_HOURS = 6;

const sessions = new Map();

function newCode() {
  let code;
  do {
    code = String(1000 + Math.floor(Math.random() * 9000));
  } while (sessions.has(code));
  return code;
}

function token() {
  return crypto.randomBytes(16).toString("hex");
}

function cleanName(name) {
  return String(name || "")
    .replace(/[\u0000-\u001f<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 18);
}

function cleanText(text, max) {
  return String(text || "")
    .replace(/[\u0000-\u001f<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

// What the teacher shows. No lesson = the player is closed.
function cleanState(raw) {
  raw = raw && typeof raw === "object" ? raw : {};
  const lessonId = /^[A-Za-z0-9_-]{1,80}$/.test(String(raw.lessonId || "")) ? String(raw.lessonId) : null;
  const index = Math.floor(Number(raw.index));
  const total = Math.floor(Number(raw.total));
  return {
    lessonId,
    index: lessonId && Number.isFinite(index) ? Math.max(0, Math.min(999, index)) : 0,
    total: lessonId && Number.isFinite(total) ? Math.max(0, Math.min(999, total)) : 0,
    more: !!raw.more,
    pdf: !!raw.pdf,
    title: lessonId ? cleanText(raw.title, 80) : "",
  };
}

// Where the teacher tapped on the slide (ready-lessons.js tapPoint): the
// letter or element it hit by its path from the slide, where inside it, and
// the share of the stage as a fallback. Only for the slide it was on (s).
function cleanTap(raw) {
  if (!raw || typeof raw !== "object" || !["text", "el", "wrap"].includes(raw.k)) return null;
  const num = (v, lo, hi) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.max(lo, Math.min(hi, Math.round(n * 1000) / 1000)) : 0;
  };
  const path = Array.isArray(raw.p) ? raw.p.slice(0, 40).map((i) => Math.floor(Number(i))) : [];
  if (path.some((i) => !Number.isFinite(i) || i < 0 || i > 5000)) return null;
  const tag = String(raw.t || "").toLowerCase();
  return {
    s: cleanText(raw.s, 120),
    k: raw.k,
    p: path,
    t: /^[a-z][a-z0-9-]{0,20}$/.test(tag) ? tag : "",
    o: Math.max(0, Math.min(100000, Math.floor(Number(raw.o) || 0))),
    x: num(raw.x, -20, 20),
    y: num(raw.y, -20, 20),
    wx: num(raw.wx, 0, 1),
    wy: num(raw.wy, 0, 1),
  };
}

// Taps closer than this are dropped (a finger dragged over the slide).
const TAP_GAP_MS = 120;

function viewerList(session) {
  return [...session.viewers.values()]
    .filter((v) => !v.removed)
    .sort((a, b) => a.joinedAt - b.joinedAt)
    .map((v) => ({ id: v.id, name: v.name, online: v.connected }));
}

function mount(io) {
  function room(code) {
    return `live:${code}`;
  }

  function emitViewers(session) {
    if (session.hostSocketId) io.to(session.hostSocketId).emit("live:viewers", viewerList(session));
  }

  // The students of the session's classes, on their own pages.
  function emitClasses(classIds) {
    classIds.forEach((id) => {
      const list = [...sessions.values()]
        .filter((s) => s.classIds.includes(id))
        .map((s) => ({ code: s.code, title: s.state.title }));
      io.to(`liveclass:${id}`).emit("live:class", list);
    });
  }

  function end(session) {
    if (sessions.get(session.code) !== session) return;
    sessions.delete(session.code);
    clearTimeout(session.hostTimer);
    clearTimeout(session.awayTimer);
    clearTimeout(session.lifeTimer);
    session.viewers.forEach((v) => clearTimeout(v.dropTimer));
    io.to(room(session.code)).emit("live:ended");
    io.in(room(session.code)).socketsLeave(room(session.code));
    emitClasses(session.classIds);
  }

  function attachHost(socket, session) {
    if (session.hostSocketId && session.hostSocketId !== socket.id) {
      const old = io.sockets.sockets.get(session.hostSocketId);
      if (old?.data.liveHost === session.code) old.data.liveHost = null;
    }
    socket.data.liveHost = session.code;
    session.hostSocketId = socket.id;
    clearTimeout(session.hostTimer);
    clearTimeout(session.awayTimer);
    if (!session.hostOnline) {
      session.hostOnline = true;
      io.to(room(session.code)).emit("live:host", { online: true });
    }
  }

  function hostSession(socket) {
    const session = sessions.get(socket.data.liveHost || "");
    return session && session.hostSocketId === socket.id ? session : null;
  }

  function viewerOf(socket) {
    const ref = socket.data.liveViewer;
    const session = ref && sessions.get(ref.code);
    const viewer = session?.viewers.get(ref.id);
    return viewer && !viewer.removed && viewer.socketId === socket.id ? { session, viewer } : {};
  }

  function removeViewer(session, viewer) {
    viewer.removed = true;
    clearTimeout(viewer.dropTimer);
    session.viewers.delete(viewer.id);
    emitViewers(session);
  }

  io.on("connection", (socket) => {
    socket.on("live:create", ({ state } = {}, cb) => {
      if (sessions.size >= MAX_SESSIONS) return cb?.({ ok: false, error: "busy" });
      // One session per teacher's page: a second press reopens the first.
      const current = hostSession(socket);
      if (current) return cb?.({ ok: true, code: current.code, token: current.token, viewers: viewerList(current), classIds: current.classIds });
      const session = {
        code: newCode(),
        token: token(),
        state: cleanState(state),
        viewers: new Map(),
        classIds: [],
        hostSocketId: null,
        hostOnline: false,
        hostTimer: null,
        awayTimer: null,
        lifeTimer: null,
        createdAt: Date.now(),
      };
      session.lifeTimer = setTimeout(() => end(session), MAX_HOURS * 3600000);
      sessions.set(session.code, session);
      attachHost(socket, session);
      cb?.({ ok: true, code: session.code, token: session.token, viewers: [], classIds: [] });
    });

    socket.on("live:host", ({ code, token: tok } = {}, cb) => {
      const session = sessions.get(String(code || ""));
      if (!session || !tok || session.token !== tok) return cb?.({ ok: false, error: "no-session" });
      attachHost(socket, session);
      cb?.({ ok: true, code: session.code, state: session.state, viewers: viewerList(session), classIds: session.classIds });
    });

    socket.on("live:state", ({ state } = {}, cb) => {
      const session = hostSession(socket);
      if (!session) return cb?.({ ok: false });
      const before = session.state.title;
      session.state = cleanState(state);
      io.to(room(session.code)).emit("live:state", session.state);
      if (session.state.title !== before && session.classIds.length) emitClasses(session.classIds);
      cb?.({ ok: true });
    });

    // No callback — a tap is gone in a moment anyway.
    socket.on("live:tap", (raw) => {
      const session = hostSession(socket);
      if (!session) return;
      const now = Date.now();
      if (now - (session.tapAt || 0) < TAP_GAP_MS) return;
      const tap = cleanTap(raw);
      if (!tap) return;
      session.tapAt = now;
      io.to(room(session.code)).emit("live:tap", tap);
    });

    // Only the teacher's own classes (checked by their signed-in account).
    socket.on("live:classes", async ({ ids, idToken } = {}, cb) => {
      const session = hostSession(socket);
      if (!session) return cb?.({ ok: false });
      try {
        const want = [...new Set((Array.isArray(ids) ? ids : []).map(String))].slice(0, 20);
        let mine = [];
        if (want.length) {
          const decoded = await verifyIdToken(idToken);
          if (!decoded?.uid) return cb?.({ ok: false, error: "auth" });
          const found = await Promise.all(want.map((id) => classes.getOwn(decoded.uid, id).then(() => id).catch(() => null)));
          mine = found.filter(Boolean);
        }
        if (sessions.get(session.code) !== session) return cb?.({ ok: false });
        const touched = [...new Set([...session.classIds, ...mine])];
        session.classIds = mine;
        emitClasses(touched);
        cb?.({ ok: true, classIds: mine });
      } catch (err) {
        console.warn(`[live] classes: ${err.message}`);
        cb?.({ ok: false });
      }
    });

    socket.on("live:end", (_payload, cb) => {
      const session = hostSession(socket);
      if (session) end(session);
      socket.data.liveHost = null;
      cb?.({ ok: true });
    });

    socket.on("live:join", ({ code, name, token: tok } = {}, cb) => {
      const session = sessions.get(String(code || "").trim());
      if (!session) return cb?.({ ok: false, error: "no-session" });
      const prev = viewerOf(socket);
      if (prev.viewer) removeViewer(prev.session, prev.viewer);
      let viewer = tok ? [...session.viewers.values()].find((v) => v.token === tok && !v.removed) : null;
      if (viewer) {
        clearTimeout(viewer.dropTimer);
        const old = io.sockets.sockets.get(viewer.socketId);
        if (old && old.id !== socket.id) {
          old.leave(room(session.code));
          old.data.liveViewer = null;
        }
      } else {
        const clean = cleanName(name);
        if (!clean) return cb?.({ ok: false, error: "name" });
        if (session.viewers.size >= MAX_VIEWERS) return cb?.({ ok: false, error: "full" });
        viewer = { id: crypto.randomBytes(5).toString("hex"), token: token(), name: clean, joinedAt: Date.now(), dropTimer: null };
        session.viewers.set(viewer.id, viewer);
      }
      viewer.socketId = socket.id;
      viewer.connected = true;
      socket.data.liveViewer = { code: session.code, id: viewer.id };
      socket.join(room(session.code));
      cb?.({ ok: true, code: session.code, me: { token: viewer.token, name: viewer.name }, state: session.state, hostOnline: session.hostOnline });
      emitViewers(session);
    });

    socket.on("live:leave", (_payload, cb) => {
      const { session, viewer } = viewerOf(socket);
      socket.data.liveViewer = null;
      if (session) {
        socket.leave(room(session.code));
        removeViewer(session, viewer);
      }
      cb?.({ ok: true });
    });

    // A student's own page: the live lessons of the student's classes, now
    // and whenever one starts or ends.
    socket.on("live:watch", async ({ key } = {}, cb) => {
      try {
        const ids = await studentProgress.classIdsByKey(String(key || ""));
        ids.forEach((id) => socket.join(`liveclass:${id}`));
        const list = [...sessions.values()]
          .filter((s) => s.classIds.some((id) => ids.includes(id)))
          .map((s) => ({ code: s.code, title: s.state.title }));
        cb?.({ ok: true, live: list });
      } catch {
        cb?.({ ok: false });
      }
    });

    socket.on("disconnect", () => {
      const session = hostSession(socket);
      if (session) {
        session.hostSocketId = null;
        session.hostTimer = setTimeout(() => end(session), HOST_GRACE_MS);
        session.awayTimer = setTimeout(() => {
          if (sessions.get(session.code) !== session || session.hostSocketId) return;
          session.hostOnline = false;
          io.to(room(session.code)).emit("live:host", { online: false });
        }, HOST_AWAY_NOTICE_MS);
      }
      const { session: watched, viewer } = viewerOf(socket);
      if (viewer) {
        viewer.connected = false;
        viewer.dropTimer = setTimeout(() => {
          if (!viewer.connected && watched.viewers.get(viewer.id) === viewer) removeViewer(watched, viewer);
        }, VIEWER_GRACE_MS);
        emitViewers(watched);
      }
    });
  });
}

module.exports = { mount };
