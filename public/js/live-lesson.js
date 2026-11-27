/* Live lesson — the teacher's side (lib/live-lessons.js, the students watch
   on /live with live-view.js).

   A "הצגה לכיתה" button on the lesson player's top bar starts a live
   lesson: a plain window over the slide shows a 4-digit code and the
   address for the board, who joined, and the teacher's classes ("הכיתות
   שלי") to open it to. From then on every slide the player shows goes to the students.
   Closing the player keeps the lesson going (the students wait for the
   next one); a small bar at the bottom of the page says it's on, with
   "סיום". The session is remembered on this device for a few hours, so
   another page of the site picks it up again. */

(() => {
  const STORE_KEY = "pleyi-live-host";
  const MAX_AGE_MS = 6 * 3600000;

  const ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none"/><path d="M8.2 15.8a5.4 5.4 0 0 1 0-7.6M15.8 8.2a5.4 5.4 0 0 1 0 7.6M5.3 18.7a9.5 9.5 0 0 1 0-13.4M18.7 5.3a9.5 9.5 0 0 1 0 13.4"/></svg>`;
  const X_ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>`;
  const COPY_ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>`;

  const $ = (sel, root = document) => root.querySelector(sel);

  function esc(str) {
    return String(str ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  }

  let player = null;
  let socket = null;
  let live = null; // { code, token }
  let viewers = [];
  let classIds = [];
  let myClasses = null; // the signed-in teacher's classes, once loaded
  let classesLoading = false;
  let sentHere = false; // sent a slide from this page (so a dropped line re-sends it)
  let btn = null;
  let panel = null;
  let bar = null;
  let panelMode = "closed"; // closed | connecting | error | open
  let errorText = "";

  function isStudent() {
    return document.documentElement.classList.contains("from-student") || !!window.StudentProgress?.fromLink?.();
  }

  function joinUrl() {
    return live ? `${location.origin}/live/${live.code}` : "";
  }

  function save() {
    try {
      if (live) localStorage.setItem(STORE_KEY, JSON.stringify({ ...live, at: Date.now() }));
      else localStorage.removeItem(STORE_KEY);
    } catch {
      /* ignore */
    }
  }

  function saved() {
    try {
      const data = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
      if (data?.code && data?.token && Date.now() - (data.at || 0) < MAX_AGE_MS) return { code: data.code, token: data.token };
    } catch {
      /* ignore */
    }
    return null;
  }

  function loadSocketLib() {
    if (window.io) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "/socket.io/socket.io.js";
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  async function connect() {
    if (socket) return socket;
    await loadSocketLib();
    socket = window.io();
    socket.on("connect", () => {
      if (live) rejoin();
    });
    socket.on("live:viewers", (list) => {
      viewers = Array.isArray(list) ? list : [];
      sync();
    });
    return socket;
  }

  function ack(event, payload, ms = 8000) {
    return new Promise((resolve) => {
      let done = false;
      const timer = setTimeout(() => {
        done = true;
        resolve(null);
      }, ms);
      socket.emit(event, payload, (res) => {
        if (done) return;
        clearTimeout(timer);
        resolve(res);
      });
    });
  }

  // Back after a dropped line, a reload or on another page.
  async function rejoin() {
    const res = await ack("live:host", live);
    if (!res?.ok) {
      stopped();
      return;
    }
    viewers = res.viewers || [];
    classIds = res.classIds || [];
    // What this page shows now. Another page with the player closed keeps
    // the students on the last slide until the teacher opens something.
    if (sentHere || player.state()) send(player.state());
    sync();
  }

  function send(state) {
    if (!live || !socket?.connected) return;
    sentHere = true;
    socket.emit("live:state", { state });
  }

  async function start() {
    panelMode = "connecting";
    renderPanel();
    try {
      await connect();
    } catch {
      panelMode = "error";
      errorText = "אין חיבור לשרת. נסו שוב בעוד רגע";
      renderPanel();
      return;
    }
    const res = await ack("live:create", { state: player.state() });
    if (!res?.ok) {
      panelMode = "error";
      errorText = "לא הצלחנו לפתוח שיעור חי. נסו שוב";
      renderPanel();
      return;
    }
    live = { code: res.code, token: res.token };
    viewers = res.viewers || [];
    classIds = res.classIds || [];
    sentHere = true;
    save();
    panelMode = "open";
    sync();
  }

  function stopped() {
    live = null;
    viewers = [];
    classIds = [];
    save();
    panelMode = "closed";
    sync();
  }

  async function end() {
    if (socket?.connected) await ack("live:end", {}, 4000);
    stopped();
  }

  /* ── The teacher's classes: open the lesson to them ── */

  async function idToken() {
    return (await window.FirebaseApp?.auth?.currentUser?.getIdToken().catch(() => "")) || "";
  }

  async function loadClasses() {
    if (myClasses || classesLoading) return;
    const token = await idToken();
    if (!token) return;
    classesLoading = true;
    try {
      const data = await (await fetch("/api/my-classes", { headers: { Authorization: `Bearer ${token}` } })).json();
      myClasses = data.ok ? (data.classes || []).map((c) => ({ id: c.id, name: c.name })) : [];
    } catch {
      myClasses = null;
    }
    classesLoading = false;
    renderPanel();
  }

  async function toggleClass(id) {
    const want = classIds.includes(id) ? classIds.filter((c) => c !== id) : [...classIds, id];
    classIds = want;
    renderPanel();
    const res = await ack("live:classes", { ids: want, idToken: await idToken() });
    if (res?.ok) classIds = res.classIds || [];
    renderPanel();
  }

  /* ── The window over the slide ── */

  // Who joined: one quiet line of names (the ones who left are faded).
  function namesHtml() {
    if (!viewers.length) return "";
    const names = viewers
      .slice(0, 40)
      .map((v) => `<bdi${v.online === false ? ' class="is-away"' : ""}>${esc(v.name)}</bdi>`)
      .join(", ");
    const more = viewers.length > 40 ? ` +${viewers.length - 40}` : "";
    return `<p class="lp-live-names">${names}${more}</p>`;
  }

  function countText() {
    const n = viewers.filter((v) => v.online !== false).length;
    return n === 1 ? "תלמיד אחד" : `${n} תלמידים`;
  }

  function classesHtml() {
    if (!myClasses?.length) return "";
    const chips = myClasses
      .map((c) => {
        const on = classIds.includes(c.id);
        return `<button type="button" class="lp-live-class${on ? " is-on" : ""}" data-class="${esc(c.id)}" aria-pressed="${on}"><bdi>${esc(c.name)}</bdi></button>`;
      })
      .join("");
    return `<div class="lp-live-classes"><span class="lp-live-label">פתיחה לכיתות</span>${chips}</div>`;
  }

  function panelHtml() {
    if (panelMode === "connecting") {
      return `<p class="lp-live-wait">פותחים שיעור חי…</p>`;
    }
    if (panelMode === "error") {
      return `
        <p class="lp-live-wait">${esc(errorText)}</p>
        <div class="lp-live-actions"><button type="button" class="lp-live-go" data-live="retry">לנסות שוב</button></div>`;
    }
    // Just the code and the address (a tap copies the link); X goes back
    // to the lesson, "סיום" ends it.
    const host = location.host.replace(/^www\./, "");
    return `
      <div class="lp-live-main">
        <p class="lp-live-code" dir="ltr">${esc(live.code)}</p>
        <button type="button" class="lp-live-url" data-live="copy" title="העתקת הקישור"><span dir="ltr">${esc(host)}/live</span>${COPY_ICON}</button>
        ${namesHtml()}
        ${classesHtml()}
      </div>
      <p class="lp-live-foot">
        <span class="lp-live-dot" aria-hidden="true"></span>
        <span>${countText()}</span>
        <span class="lp-live-sep" aria-hidden="true">·</span>
        <button type="button" class="lp-live-end" data-live="end">סיום</button>
      </p>`;
  }

  function renderPanel() {
    if (!player) return;
    const shell = player.shell();
    if (panelMode === "closed") {
      panel?.remove();
      panel = null;
      return;
    }
    if (!panel) {
      panel = document.createElement("div");
      panel.className = "lp-live-panel";
      panel.setAttribute("role", "dialog");
      panel.setAttribute("aria-label", "שיעור חי לכיתה");
      panel.addEventListener("click", onPanelClick);
      shell.appendChild(panel);
    }
    panel.innerHTML = `<button type="button" class="lp-live-x" data-live="close" aria-label="סגירה">${X_ICON}</button>${panelHtml()}`;
    if (panelMode === "open" && myClasses === null) loadClasses();
  }

  async function onPanelClick(e) {
    e.stopPropagation();
    const cls = e.target.closest("[data-class]");
    if (cls) {
      toggleClass(cls.dataset.class);
      return;
    }
    const act = e.target.closest("[data-live]")?.dataset.live;
    if (act === "close") {
      panelMode = "closed";
      sync();
    } else if (act === "retry") {
      start();
    } else if (act === "end") {
      end();
    } else if (act === "copy") {
      const b = e.target.closest("button");
      try {
        await navigator.clipboard.writeText(joinUrl());
        flash(b, "הקישור הועתק");
      } catch {
        flash(b, joinUrl());
      }
    }
  }

  function flash(button, text) {
    const label = button?.querySelector("span");
    if (!label) return;
    const before = label.textContent;
    label.textContent = text;
    setTimeout(() => {
      if (label.isConnected) label.textContent = before;
    }, 1600);
  }

  /* ── The button on the player's bar and the bar on the page ── */

  function syncButton() {
    if (!btn) return;
    btn.classList.toggle("is-live", !!live);
    btn.setAttribute("aria-label", live ? `שיעור חי — ${viewers.length} תלמידים` : "הצגה לכיתה");
    btn.setAttribute("title", live ? "שיעור חי" : "הצגה לכיתה");
    const count = $(".lp-live-count", btn);
    if (count) {
      count.textContent = String(viewers.filter((v) => v.online !== false).length);
      count.classList.toggle("hidden", !live);
    }
  }

  function syncBar() {
    const playerOpen = !!player.state();
    if (!live || playerOpen) {
      bar?.remove();
      bar = null;
      return;
    }
    if (!bar) {
      bar = document.createElement("div");
      bar.className = "lp-live-bar";
      bar.addEventListener("click", (e) => {
        if (e.target.closest("[data-live='end']")) end();
      });
      document.body.appendChild(bar);
    }
    const n = viewers.filter((v) => v.online !== false).length;
    bar.innerHTML = `
      <span class="lp-live-dot" aria-hidden="true"></span>
      <span class="lp-live-bar-text">שיעור חי · קוד <b dir="ltr">${esc(live.code)}</b> · ${n} בשיעור</span>
      <span class="lp-live-bar-hint">פותחים שיעור והוא מופיע אצל התלמידים</span>
      <button type="button" class="lp-live-bar-end" data-live="end">סיום</button>`;
  }

  function sync() {
    syncButton();
    syncBar();
    renderPanel();
  }

  function init() {
    player = window.ReadyLessons?.player?.();
    const actions = player?.actions();
    if (!player || !actions || isStudent()) return;
    btn = document.createElement("button");
    btn.type = "button";
    btn.className = "lesson-player-live";
    btn.innerHTML = `${ICON}<span class="lp-live-count hidden" aria-hidden="true"></span>`;
    actions.prepend(btn);
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!live) start();
      else {
        panelMode = panelMode === "open" ? "closed" : "open";
        sync();
      }
    });
    syncButton();

    // Where the teacher taps on the slide shows on the students' screens
    // (and here too, so the teacher sees what they see).
    player.slideWrap?.()?.addEventListener(
      "pointerdown",
      (e) => {
        if (!live || !socket?.connected || !e.isPrimary || (e.pointerType === "mouse" && e.button !== 0)) return;
        const point = player.tapPoint(e.clientX, e.clientY, e.target);
        if (!point) return;
        player.showTapAt(e.clientX, e.clientY);
        socket.emit("live:tap", point);
      },
      true
    );

    document.addEventListener("lessonplayer:change", (e) => {
      if (!e.detail) panelMode = "closed";
      send(e.detail);
      sync();
    });

    window.GameAuth?.onUserChange?.(() => {
      myClasses = null;
      if (panelMode === "open") loadClasses();
    });

    // A live lesson this device started on another page (or before a reload).
    const prev = saved();
    if (prev) {
      live = prev;
      connect().catch(() => stopped());
      sync();
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
