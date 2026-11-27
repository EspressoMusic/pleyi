/* Live lesson — the students' side (/live, /live/<code>; lib/live-lessons.js,
   the teacher presents with live-lesson.js).

   The student types the teacher's 4-digit code and a name — a student whose
   device has their file (/s/<key>) comes with their name, and a link with
   the code joins at once. Then the lesson player shows whatever slide the
   teacher shows, with no arrows: the teacher moves it. Between lessons a
   waiting screen; when the teacher ends, a goodbye. */

(() => {
  const app = document.getElementById("liveApp");
  const NAME_KEY = "pleyi-live-name";
  const tokenKey = (code) => `pleyi-live-viewer-${code}`;

  const ICONS = {
    live: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none"/><path d="M8.2 15.8a5.4 5.4 0 0 1 0-7.6M15.8 8.2a5.4 5.4 0 0 1 0 7.6M5.3 18.7a9.5 9.5 0 0 1 0-13.4M18.7 5.3a9.5 9.5 0 0 1 0 13.4"/></svg>`,
    board: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M12 16v4M8 20h8"/></svg>`,
  };

  function esc(str) {
    return String(str ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  }

  function codeFromUrl() {
    const fromPath = decodeURIComponent(location.pathname.split("/")[2] || "");
    const value = fromPath || new URLSearchParams(location.search).get("code") || "";
    return /^\d{4}$/.test(value.trim()) ? value.trim() : "";
  }

  let code = codeFromUrl();
  let me = null; // { token, name }
  let joined = false;
  let joining = false;
  let state = null;
  let hostOnline = true;
  let screen = "loading";
  let errorText = "";
  let knownName = "";

  const player = () => window.ReadyLessons?.player?.();
  const homeUrl = () => window.StudentProgress?.homeUrl?.() || "/";
  const homeLabel = () => (window.StudentProgress?.homeUrl?.() ? "לאזור האישי" : "לדף הבית");

  function savedToken(c) {
    try {
      return sessionStorage.getItem(tokenKey(c)) || "";
    } catch {
      return "";
    }
  }

  function saveToken(c, tok) {
    try {
      if (tok) sessionStorage.setItem(tokenKey(c), tok);
      else sessionStorage.removeItem(tokenKey(c));
    } catch {
      /* ignore */
    }
  }

  /* ── Screens behind the player ── */

  function formHtml() {
    return `
      <section class="lv-card">
        <span class="lv-art">${ICONS.live}</span>
        <h1 class="lv-title">שיעור חי</h1>
        <p class="lv-line">כותבים את הקוד שהמורה נתן</p>
        <form class="lv-form" id="lvForm" novalidate>
          <label class="lv-label" for="lvCode">הקוד</label>
          <input class="lv-input lv-input--code" id="lvCode" inputmode="numeric" autocomplete="off" maxlength="4" dir="ltr" value="${esc(code)}" placeholder="0000"/>
          <label class="lv-label" for="lvName">השם שלי</label>
          <input class="lv-input" id="lvName" autocomplete="given-name" maxlength="18" value="${esc(knownName)}"/>
          <p class="lv-error${errorText ? "" : " hidden"}" role="alert">${esc(errorText)}</p>
          <button type="submit" class="lv-btn" ${joining ? "disabled" : ""}>${joining ? "נכנסים…" : "כניסה לשיעור"}</button>
        </form>
      </section>`;
  }

  function messageHtml({ title, lines = [], buttons = "" }) {
    return `
      <section class="lv-card">
        <span class="lv-art">${ICONS.board}</span>
        <h1 class="lv-title">${esc(title)}</h1>
        ${lines.map((l) => `<p class="lv-line">${l}</p>`).join("")}
        ${buttons ? `<div class="lv-actions">${buttons}</div>` : ""}
      </section>`;
  }

  function render() {
    if (screen === "loading") {
      app.innerHTML = `<p class="lv-loading">טוען…</p>`;
    } else if (screen === "form") {
      app.innerHTML = formHtml();
      bindForm();
    } else if (screen === "waiting") {
      app.innerHTML = messageHtml({
        title: "נכנסתם לשיעור!",
        lines: [
          `שלום, <bdi>${esc(me?.name || "")}</bdi>`,
          hostOnline ? "מחכים שהמורה יפתח שיעור" : "המורה התנתק לרגע — מחכים שיחזור",
          "השיעור יופיע כאן לבד",
        ],
        buttons: `<button type="button" class="lv-btn lv-btn--soft" data-lv="leave">יציאה</button>`,
      });
      app.querySelector(".lv-card")?.classList.add("is-waiting");
    } else if (screen === "missing") {
      app.innerHTML = messageHtml({
        title: "רגע…",
        lines: ["המורה פתח שיעור שלא נפתח כאן", "מחכים לשקופית הבאה"],
        buttons: `<button type="button" class="lv-btn lv-btn--soft" data-lv="leave">יציאה</button>`,
      });
    } else if (screen === "left") {
      app.innerHTML = messageHtml({
        title: "יצאתם מהשיעור",
        buttons: `
          <button type="button" class="lv-btn" data-lv="rejoin">חזרה לשיעור</button>
          <a class="lv-btn lv-btn--soft" href="${esc(homeUrl())}">${homeLabel()}</a>`,
      });
    } else if (screen === "ended") {
      app.innerHTML = messageHtml({
        title: "השיעור החי הסתיים",
        lines: ["כל הכבוד שהשתתפתם!"],
        buttons: `<a class="lv-btn" href="${esc(homeUrl())}">${homeLabel()}</a>`,
      });
    }
  }

  function show(next) {
    screen = next;
    render();
  }

  app.addEventListener("click", (e) => {
    const act = e.target.closest("[data-lv]")?.dataset.lv;
    if (act === "leave") leave();
    else if (act === "rejoin") join(code, me?.name || knownName);
  });

  function bindForm() {
    const form = document.getElementById("lvForm");
    const codeInput = document.getElementById("lvCode");
    const nameInput = document.getElementById("lvName");
    codeInput.addEventListener("input", () => {
      codeInput.value = codeInput.value.replace(/\D/g, "").slice(0, 4);
    });
    (code ? nameInput : codeInput).focus({ preventScroll: true });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const c = codeInput.value.trim();
      const name = nameInput.value.trim();
      if (!/^\d{4}$/.test(c)) return fail("הקוד הוא 4 ספרות");
      if (!name) return fail("כתבו את השם שלכם");
      join(c, name);
    });
  }

  function fail(text) {
    errorText = text;
    joining = false;
    show("form");
  }

  /* ── The live line ── */

  const socket = window.io();

  function join(c, name) {
    if (joining) return;
    joining = true;
    errorText = "";
    if (screen === "form") render();
    const tok = savedToken(c);
    socket.emit("live:join", { code: c, name, token: tok }, (res) => {
      joining = false;
      if (!res?.ok) {
        if (tok && res?.error !== "no-session") {
          saveToken(c, "");
          return join(c, name);
        }
        saveToken(c, "");
        const messages = { "no-session": "לא מצאנו שיעור עם הקוד הזה", name: "כתבו את השם שלכם", full: "השיעור מלא" };
        code = c;
        return fail(messages[res?.error] || "משהו השתבש — נסו שוב");
      }
      code = res.code;
      me = res.me;
      joined = true;
      hostOnline = res.hostOnline !== false;
      saveToken(code, me.token);
      try {
        localStorage.setItem(NAME_KEY, me.name);
      } catch {
        /* ignore */
      }
      if (location.pathname !== `/live/${code}`) history.replaceState(null, "", `/live/${code}`);
      apply(res.state);
    });
  }

  function leave() {
    joined = false;
    state = null;
    socket.emit("live:leave", {});
    saveToken(code, "");
    player()?.close();
    show("left");
  }

  let applyTurn = 0;
  async function apply(next) {
    state = next;
    if (!joined) return;
    const turn = ++applyTurn;
    const p = player();
    if (!next?.lessonId) {
      p?.follow(null);
      show("waiting");
      syncTag();
      return;
    }
    const ready = await window.ReadyLessons.loadCustom(next.lessonId);
    if (turn !== applyTurn || !joined) return;
    if (!ready || !p?.follow(next)) {
      p?.close();
      show("missing");
      return;
    }
    if (screen !== "waiting") show("waiting");
    syncTag();
  }

  // "שיעור חי" on the player's bar — or that the teacher's line dropped.
  function syncTag() {
    const p = player();
    const bar = document.querySelector("#lessonPlayer .lesson-player-top");
    if (!p || !bar) return;
    let tag = bar.querySelector(".lv-tag");
    if (!tag) {
      tag = document.createElement("span");
      tag.className = "lv-tag";
      bar.querySelector(".lesson-player-progress")?.after(tag);
    }
    const away = !hostOnline || !socket.connected;
    tag.classList.toggle("is-away", away);
    tag.innerHTML = `<i aria-hidden="true"></i><span>${!socket.connected ? "מתחברים שוב…" : away ? "המורה התנתק לרגע" : "שיעור חי"}</span>`;
  }

  socket.on("connect", () => {
    if (joined && me) {
      socket.emit("live:join", { code, name: me.name, token: me.token }, (res) => {
        if (!res?.ok) {
          if (res?.error === "no-session") ended();
          return;
        }
        me = res.me;
        hostOnline = res.hostOnline !== false;
        saveToken(code, me.token);
        apply(res.state);
      });
    }
    syncTag();
  });

  socket.on("disconnect", syncTag);

  socket.on("live:state", (next) => apply(next));

  // Where the teacher tapped on the slide.
  socket.on("live:tap", (tap) => {
    if (joined && state?.lessonId) player()?.showTap?.(tap);
  });

  socket.on("live:host", ({ online } = {}) => {
    hostOnline = !!online;
    syncTag();
    if (screen === "waiting" && !state?.lessonId) render();
  });

  function ended() {
    joined = false;
    state = null;
    saveToken(code, "");
    player()?.close();
    show("ended");
  }

  socket.on("live:ended", ended);

  /* ── Start ── */

  async function init() {
    player()?.onExit(leave);
    try {
      knownName = localStorage.getItem(NAME_KEY) || "";
    } catch {
      /* ignore */
    }
    // A student whose device has their file comes with their own name.
    if (window.StudentProgress?.isLinked?.()) {
      const profile = await window.StudentProgress.profile().catch(() => null);
      if (profile?.name) knownName = String(profile.name).slice(0, 18);
    }
    if (code && (knownName || savedToken(code))) join(code, knownName);
    else show("form");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
