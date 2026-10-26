/* Admin — student files (/admin/students). The teacher signs in with Google
   and sees only the files they opened. The teacher opens a file per student,
   assigns homework and sends the student's personal link; everything the
   student does through it shows up here. Exercise names and totals come from
   english-data.js.

   Routes (hash): ""      → all files
                  "#<id>" → one student's file */

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const TOPICS = window.ENGLISH_TOPICS || [];
  const TOTAL_EXERCISES = TOPICS.reduce((n, topic) => n + (topic.exercises?.length || 0), 0);
  const DAY_MS = 86400000;
  const HISTORY_PAGE = 40;
  const TREND_ROUNDS = 30;

  const TYPE_LABELS = {
    choice: "בחירה",
    truefalse: "נכון / לא נכון",
    write: "כתיבה",
    order: "סידור משפט",
    picture: "תמונות",
    "pick-picture": "תמונות",
    listen: "האזנה",
    match: "התאמה",
    reading: "קטע קריאה",
    "find-error": "מציאת טעות",
    "sentence-choice": "בחירת משפט",
    letters: "בניית מילה",
    dictation: "הכתבה",
    translate: "תרגום",
    exam: "מבחן הבנת הנקרא",
    review: "חזרה על טעויות",
  };

  const ICONS = {
    exercise: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/></svg>`,
    lesson: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M12 16v4M8 20h8"/></svg>`,
    game: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="7" width="20" height="11" rx="4"/><path d="M7 11v3M5.5 12.5h3"/><circle cx="16" cy="11.5" r="1" fill="currentColor"/><circle cx="18" cy="13.5" r="1" fill="currentColor"/></svg>`,
    trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>`,
    chevron: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>`,
    link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
    copy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg>`,
    chat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.6-5.2A8.5 8.5 0 1 1 21 12Z"/></svg>`,
    open: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>`,
  };
  ICONS.presentation = ICONS.lesson;
  ICONS.info = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="5.5" r="1.4" fill="currentColor" stroke-width="1.6"/><path d="M12 11v8.5"/></svg>`;
  ICONS.cross = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>`;
  ICONS.chart = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M3 20h18M6 16v-4M11 16V6M16 16v-7"/></svg>`;
  ICONS.flag = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 21V4h12l-2.5 4L17 12H5"/></svg>`;
  ICONS.note = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/></svg>`;
  ICONS.user = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>`;
  ICONS.plus = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>`;

  // The signed-in teacher ({ name, email, photoURL }), null when signed out.
  let account = null;
  let gateError = "";
  // "local" means the server has no Firestore credential, so files live in a
  // file on the server that a redeploy wipes.
  let storage = "firestore";
  let students = [];
  let current = null;
  let historyShown = HISTORY_PAGE;

  /* ── Helpers ── */

  function esc(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function showToast(msg) {
    const toast = $("#toast");
    toast.textContent = msg;
    toast.classList.remove("hidden");
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => toast.classList.add("hidden"), 2600);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.cssText = "position:fixed;top:0;opacity:0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      return ok;
    }
  }

  async function api(path, { method = "GET", body, headers = {} } = {}) {
    // getIdToken() hands back a fresh token when the cached one has expired.
    const token = await window.FirebaseApp?.auth?.currentUser?.getIdToken().catch(() => "");
    const res = await fetch(path, {
      method,
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) {
      // The server didn't accept the sign-in: sign out, and the auth listener
      // shows the gate with this message.
      gateError = data.error || "יש להתחבר מחדש";
      window.FirebaseApp?.auth?.signOut();
      throw new Error(gateError);
    }
    if (!res.ok || data.ok === false) throw new Error(data.error || "שגיאה בטעינת הנתונים");
    return data;
  }

  function fmtDate(iso) {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("he-IL", { day: "numeric", month: "short", year: "numeric" });
  }

  function fmtTime(iso) {
    return new Date(iso).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
  }

  // A YYYY-MM-DD due date, read as a local calendar day.
  function fmtDue(day) {
    const [y, m, d] = day.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("he-IL", { weekday: "short", day: "numeric", month: "short" });
  }

  function dayKey(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function todayKey() {
    return dayKey(new Date());
  }

  function startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }

  function dayLabel(iso) {
    const days = Math.round((startOfDay(Date.now()) - startOfDay(iso)) / DAY_MS);
    if (days === 0) return "היום";
    if (days === 1) return "אתמול";
    return new Date(iso).toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }

  function relTime(iso) {
    if (!iso) return "";
    const days = Math.round((startOfDay(Date.now()) - startOfDay(iso)) / DAY_MS);
    if (days <= 0) return `היום, ${fmtTime(iso)}`;
    if (days === 1) return "אתמול";
    if (days < 7) return `לפני ${days} ימים`;
    return fmtDate(iso);
  }

  function fmtDuration(sec) {
    const minutes = Math.round((sec || 0) / 60);
    if (!sec) return "0 דק'";
    if (minutes < 1) return "פחות מדקה";
    if (minutes < 60) return `${minutes} דק'`;
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest ? `${hours} ש' ${rest} דק'` : `${hours} ש'`;
  }

  function pct(score, total) {
    return total ? Math.round((score / total) * 100) : 0;
  }

  // Status buckets for a score — always shown with their text label, never color alone.
  function level(percent) {
    if (percent >= 90) return { cls: "good", label: "מצוין" };
    if (percent >= 70) return { cls: "ok", label: "טוב" };
    return { cls: "low", label: "לחזור על זה" };
  }

  function pill(cls, html) {
    return `<span class="adm-pill adm-pill--${cls}"><span class="adm-pill-dot" aria-hidden="true"></span>${html}</span>`;
  }

  function scorePill(score, total) {
    const p = pct(score, total);
    const lv = level(p);
    return pill(lv.cls, `<span dir="ltr">${score}/${total}</span> · ${p}% · ${lv.label}`);
  }

  function avatarHtml(s, size = "") {
    return `<span class="adm-avatar adm-avatar--initial ${size}" aria-hidden="true">${esc(String(s.name || "?").trim().charAt(0) || "?")}</span>`;
  }

  function meterHtml(done, total, label) {
    const width = total ? Math.round((done / total) * 100) : 0;
    return `<div class="adm-meter" role="img" aria-label="${esc(label)}"><span style="width:${width}%"></span></div>`;
  }

  function portalUrl(s) {
    return `${location.origin}/s/${encodeURIComponent(s.key)}`;
  }

  function exerciseUrl(s, hw) {
    return `${location.origin}/services/english?s=${encodeURIComponent(s.key)}#${hw.topicId}/${hw.exerciseId}`;
  }

  function whatsappUrl(s) {
    const text = `שלום ${s.name}! זה הקישור האישי שלך לשיעורי הבית באנגלית:\n${portalUrl(s)}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }

  function topicExerciseKeys() {
    return new Set(TOPICS.flatMap((topic) => (topic.exercises || []).map((ex) => `${topic.id}/${ex.id}`)));
  }

  // Full (non-retry) rounds only: a mistakes-only retry never sets a best score.
  function summarize(s) {
    const known = topicExerciseKeys();
    const entries = Object.entries(s.best || {}).filter(([, e]) => e.bestAt);
    const completed = entries.filter(([key]) => known.has(key)).length;
    const avg = entries.length ? Math.round(entries.reduce((n, [, e]) => n + pct(e.score, e.total), 0) / entries.length) : null;
    const mastered = entries.filter(([, e]) => pct(e.score, e.total) >= 90).length;
    const homework = s.homework || [];
    const hwDone = homework.filter((hw) => hw.doneAt).length;
    return { completed, avg, mastered, hwDone, hwTotal: homework.length };
  }

  function homeworkStatus(hw) {
    if (hw.doneAt) {
      const p = pct(hw.score, hw.total);
      return { done: true, html: pill(level(p).cls, `בוצע · <span dir="ltr">${hw.score}/${hw.total}</span> · ${p}%`) };
    }
    if (hw.dueDate && hw.dueDate < todayKey()) return { late: true, html: pill("low", "באיחור") };
    return { html: pill("none", "ממתין") };
  }

  // Open work first (soonest due date first, undated last), then what's done, newest first.
  function sortedHomework(list) {
    const open = list.filter((hw) => !hw.doneAt).sort((a, b) => (a.dueDate || "9999").localeCompare(b.dueDate || "9999") || a.assignedAt.localeCompare(b.assignedAt));
    const done = list.filter((hw) => hw.doneAt).sort((a, b) => b.doneAt.localeCompare(a.doneAt));
    return [...open, ...done];
  }

  // Points this week and in all, as the class leaderboard counts them.
  function pointsOf(s) {
    return { total: s.pointsNow?.total || 0, week: s.pointsNow?.week || 0 };
  }

  function fmtNum(n) {
    return Number(n || 0).toLocaleString("he-IL");
  }

  function tile(label, value, note = "") {
    return `
      <div class="adm-tile">
        <span class="adm-tile-label">${esc(label)}</span>
        <span class="adm-tile-value">${value}</span>
        ${note ? `<span class="adm-tile-note">${esc(note)}</span>` : ""}
      </div>`;
  }

  /* ── Google sign-in ── */

  const SIGN_IN_ERRORS = {
    "auth/popup-closed-by-user": "חלון ההתחברות נסגר לפני שההתחברות הסתיימה",
    "auth/cancelled-popup-request": "חלון ההתחברות נסגר לפני שההתחברות הסתיימה",
    "auth/popup-blocked": "הדפדפן חסם את חלון ההתחברות — אפשרו חלונות קופצים ונסו שוב",
    "auth/network-request-failed": "בעיית רשת — בדקו את החיבור לאינטרנט",
    "auth/unauthorized-domain": "הכתובת הזאת עוד לא מורשית להתחברות ב-Firebase",
    "auth/operation-not-allowed": "ההתחברות עם Google לא מופעלת ב-Firebase",
  };

  function showOnly(id) {
    ["admGate", "admListView", "admDetailView"].forEach((key) => $(`#${key}`).classList.toggle("hidden", key !== id));
  }

  function showGate(error = "") {
    showOnly("admGate");
    const err = $("#admGateError");
    err.textContent = error;
    err.classList.toggle("hidden", !error);
  }

  function renderAccount() {
    document.body.classList.toggle("adm-signed-in", !!account);
    $("#admAccount").classList.toggle("hidden", !account);
    if (!account) return;
    $("#admAccountAvatar").innerHTML = account.photoURL
      ? `<img src="${esc(account.photoURL)}" alt="" referrerpolicy="no-referrer" />`
      : esc(account.name.charAt(0).toUpperCase());
    $("#admAccountName").textContent = account.name;
    $("#admAccount").title = account.email || "";
  }

  async function signIn() {
    const btn = $("#admGoogleBtn");
    btn.disabled = true;
    $("#admGoogleLabel").textContent = "מתחבר…";
    $("#admGateError").classList.add("hidden");
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      // The auth listener in init() takes over once this resolves.
      await FirebaseApp.auth.signInWithPopup(provider);
    } catch (err) {
      showGate(SIGN_IN_ERRORS[err?.code] || "ההתחברות נכשלה. נסו שוב");
    } finally {
      btn.disabled = false;
      $("#admGoogleLabel").textContent = "התחברות עם Google";
    }
  }

  /* ── All files ── */

  async function loadList() {
    showOnly("admListView");
    const view = $("#admListView");
    if (!students.length) view.innerHTML = `<p class="adm-loading">טוען תלמידים…</p>`;
    try {
      const data = await api("/api/admin/students");
      students = data.students || [];
      storage = data.storage || "firestore";
      renderList();
    } catch (e) {
      if (account) view.innerHTML = `<p class="adm-error">${esc(e.message)}</p>`;
    }
  }

  function isLocalHost() {
    return ["localhost", "127.0.0.1"].includes(location.hostname);
  }

  // Shown above the list: a warning while the server can't keep files for good.
  function listNotices() {
    const parts = [];
    if (storage === "local" && !isLocalHost()) {
      parts.push(`
        <div class="adm-card adm-notice" role="note">
          <h3 class="adm-h3">התיקים עוד לא נשמרים לתמיד</h3>
          <p>השרת עדיין לא מחובר למסד הנתונים של Firebase, ולכן התיקים נשמרים רק בקובץ זמני על השרת ועלולים להימחק בעדכון הבא של האתר. כדי שיישמרו לתמיד צריך להגדיר בשרת את <code dir="ltr">FIREBASE_SERVICE_ACCOUNT</code>.</p>
        </div>`);
    }
    return parts.join("");
  }

  function renderList() {
    const view = $("#admListView");
    view.innerHTML = `
      <div class="adm-page-head">
        <h2 class="adm-h1">התלמידים שלי</h2>
      </div>

      ${listNotices()}

      ${foldToggleHtml("admAddToggle", "admCreateForm", ICONS.plus, "הוספת תלמיד")}

      <form class="adm-card adm-create hidden" id="admCreateForm">
        <div class="adm-fold-head">
          <h3 class="adm-h3">הוספת תלמיד</h3>
          ${foldCloseHtml()}
        </div>
        <div class="adm-create-row">
          <label class="adm-field">
            <span>שם התלמיד</span>
            <input type="text" id="admNewName" maxlength="80" required placeholder="למשל: יוסי כהן" />
          </label>
          <label class="adm-field">
            <span>מספר תלמיד</span>
            <input type="text" id="admNewNumber" inputmode="numeric" pattern="[0-9]{1,6}" maxlength="6" required value="${nextNumber()}" />
          </label>
          <button type="submit" class="btn btn-primary btn-candy adm-create-btn">הוספה</button>
        </div>
      </form>

      ${students.length ? `<div class="adm-students">${students.map(studentCardHtml).join("")}</div>` : ""}`;

    bindFold($("#admAddToggle"), $("#admCreateForm"), "#admNewName");

    $("#admCreateForm").addEventListener("submit", (e) => {
      e.preventDefault();
      withBusy(e.submitter, async () => {
        const { student } = await api("/api/admin/students", {
          method: "POST",
          body: { name: $("#admNewName").value, number: $("#admNewNumber").value },
        });
        students = [student, ...students];
        showToast("התלמיד נוסף — עכשיו אפשר לתת שיעורי בית ולשלוח את הקישור");
        location.hash = encodeURIComponent(student.id);
      });
    });

    $$("[data-student-info]", view).forEach((btn) =>
      btn.addEventListener("click", () => {
        const s = students.find((st) => st.id === btn.dataset.studentInfo);
        if (s) studentInfo.open(s, btn);
      })
    );
  }

  /* A card folded into a small rectangle until the teacher clicks it; the
     card's [data-fold-close] button folds it back. */

  function foldToggleHtml(id, panelId, icon, label) {
    return `
      <button type="button" class="adm-fold-toggle" id="${id}" aria-expanded="false" aria-controls="${panelId}">
        <span class="adm-fold-icon">${icon}</span>
        <span>${label}</span>
      </button>`;
  }

  function foldCloseHtml() {
    return `<button type="button" class="adm-info-close" data-fold-close aria-label="סגירה">${ICONS.cross}</button>`;
  }

  // The listener sits on the panel itself, so a close button in content
  // that gets re-rendered (a new link) keeps working.
  function bindFold(toggle, panel, focusSel) {
    const setOpen = (open) => {
      toggle.classList.toggle("hidden", open);
      toggle.setAttribute("aria-expanded", String(open));
      panel.classList.toggle("hidden", !open);
      (open ? $(focusSel, panel) : toggle).focus();
    };
    toggle.addEventListener("click", () => setOpen(true));
    panel.addEventListener("click", (e) => {
      if (e.target.closest("[data-fold-close]")) setOpen(false);
    });
  }

  // The create form suggests the number after the highest one in the list.
  function nextNumber() {
    return Math.max(0, ...students.map((s) => s.number || 0)) + 1;
  }

  /* One card per student with their overall score; its "i" dialog lists the
     exercises they solved and the mistakes still open in their review bank. */

  const CARD_EXERCISES = 5;
  const CARD_MISTAKES = 4;
  const EXERCISE_TITLES = new Map(TOPICS.flatMap((topic) => (topic.exercises || []).map((ex) => [`${topic.id}/${ex.id}`, ex.title])));

  // Full rounds only, most recently practiced first.
  function solvedExercises(s) {
    return Object.entries(s.best || {})
      .filter(([, e]) => e.bestAt)
      .sort(([, a], [, b]) => String(b.lastAt || b.bestAt).localeCompare(String(a.lastAt || a.bestAt)))
      .map(([key, e]) => ({ title: EXERCISE_TITLES.get(key) || e.title || key, score: e.score, total: e.total }));
  }

  // The list brings a preview of the bank ({ count, entries }); a file opened
  // since then brings all of it.
  function openMistakes(s) {
    const entries = [...(s.review?.entries || [])].sort(
      (a, b) => (b.wrong || 0) - (a.wrong || 0) || String(b.wrongAt || "").localeCompare(String(a.wrongAt || ""))
    );
    return { count: s.review?.count ?? entries.length, entries: entries.slice(0, CARD_MISTAKES) };
  }

  function moreHtml(n) {
    return n > 0 ? `<p class="adm-card-more">ועוד ${n}</p>` : "";
  }

  // The card shows only the name and the overall score; the name link
  // stretches over the whole card, and the "i" button above it opens the rest.
  function studentCardHtml(s) {
    const { avg } = summarize(s);
    const lv = avg == null ? null : level(avg);
    return `
      <div class="adm-student">
        ${avatarHtml(s)}
        <a class="adm-student-link" href="#${encodeURIComponent(s.id)}">
          <span class="adm-student-name">${esc(s.name)}</span>
        </a>
        <div class="adm-student-score adm-score--${lv ? lv.cls : "none"}">
          <span class="adm-student-score-val">${avg == null ? "—" : `${avg}%`}</span>
          <span class="adm-student-score-label">${lv ? `ציון כללי · ${lv.label}` : "ציון כללי"}</span>
        </div>
        <button type="button" class="adm-info-btn" data-student-info="${esc(s.id)}" aria-haspopup="dialog" aria-label="מידע על ${esc(s.name)}" title="מידע על התלמיד">${ICONS.info}</button>
      </div>`;
  }

  /* The card's "i" dialog: the student's number and last visit, the exercises
     they solved and the mistakes still open. */

  function studentInfoHtml(s) {
    const solved = solvedExercises(s);
    const mistakes = openMistakes(s);
    const sub = [s.number ? `מספר ${s.number}` : "", s.lastActive ? `פעילות אחרונה: ${relTime(s.lastActive)}` : "עוד לא נכנס לקישור"].filter(Boolean).join(" · ");
    return `
      <div class="adm-info-backdrop" data-info-close></div>
      <div class="adm-info-card">
        <div class="adm-info-head">
          ${avatarHtml(s)}
          <div class="adm-student-id">
            <h2 class="adm-info-title" id="admInfoTitle">${esc(s.name)}</h2>
            <span class="adm-student-sub">${esc(sub)}</span>
          </div>
          <button type="button" class="adm-info-close" data-info-close aria-label="סגירה">${ICONS.cross}</button>
        </div>

        <div class="adm-student-block">
          <h4 class="adm-student-block-title">תרגילים שפתר <span class="adm-student-count">${solved.length}</span></h4>
          ${
            solved.length
              ? `<ul class="adm-card-list">
                  ${solved
                    .slice(0, CARD_EXERCISES)
                    .map((ex) => {
                      const p = pct(ex.score, ex.total);
                      return `<li class="adm-card-ex"><span class="adm-card-ex-title">${esc(ex.title)}</span>${pill(level(p).cls, `<span dir="ltr">${ex.score}/${ex.total}</span>`)}</li>`;
                    })
                    .join("")}
                </ul>
                ${moreHtml(solved.length - CARD_EXERCISES)}`
              : `<p class="adm-card-empty">עוד לא פתר תרגילים</p>`
          }
        </div>

        <div class="adm-student-block">
          <h4 class="adm-student-block-title">טעויות <span class="adm-student-count${mistakes.count ? " is-low" : ""}">${mistakes.count}</span></h4>
          ${
            mistakes.count
              ? `<ul class="adm-card-list">
                  ${mistakes.entries
                    .map(
                      (m) => `
                    <li class="adm-card-mistake">
                      ${m.prompt ? `<span class="adm-card-mistake-prompt" dir="auto">${esc(m.prompt)}</span>` : ""}
                      <span class="adm-card-mistake-answer">נכון: <strong dir="auto">${esc(m.answer)}</strong>${(m.wrong || 1) > 1 ? ` · טעה ${m.wrong} פעמים` : ""}</span>
                    </li>`
                    )
                    .join("")}
                </ul>
                ${moreHtml(mistakes.count - mistakes.entries.length)}`
              : `<p class="adm-card-empty">אין טעויות פתוחות</p>`
          }
        </div>

        <a class="btn btn-primary btn-candy adm-info-go" href="#${encodeURIComponent(s.id)}" data-info-close>פתיחת התיק</a>
      </div>`;
  }

  const studentInfo = (() => {
    let root = null;
    let lastFocus = null;

    function build() {
      root = document.createElement("div");
      root.className = "adm-info hidden";
      root.setAttribute("role", "dialog");
      root.setAttribute("aria-modal", "true");
      root.setAttribute("aria-labelledby", "admInfoTitle");
      document.body.appendChild(root);
      root.addEventListener("click", (e) => {
        if (e.target.closest("[data-info-close]")) close(!e.target.closest(".adm-info-go"));
      });
      document.addEventListener("keydown", (e) => {
        if (!isOpen()) return;
        if (e.key === "Escape") {
          e.preventDefault();
          close();
        } else if (e.key === "Tab") {
          // Keep keyboard focus inside the dialog.
          const items = $$("button, a[href]", $(".adm-info-card", root));
          const first = items[0];
          const last = items[items.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      });
    }

    function open(s, opener) {
      if (!root) build();
      lastFocus = opener;
      root.innerHTML = studentInfoHtml(s);
      root.classList.remove("hidden");
      document.body.classList.add("adm-info-open");
      $(".adm-info-go", root).focus({ preventScroll: true });
    }

    // `restoreFocus` is false when the dialog's link opens the student's file.
    function close(restoreFocus = true) {
      if (!isOpen()) return;
      root.classList.add("hidden");
      document.body.classList.remove("adm-info-open");
      if (restoreFocus && lastFocus?.isConnected) lastFocus.focus({ preventScroll: true });
    }

    function isOpen() {
      return !!root && !root.classList.contains("hidden");
    }

    return { open, close };
  })();

  /* ── One file ── */

  async function loadStudent(id) {
    showOnly("admDetailView");
    const view = $("#admDetailView");
    view.innerHTML = `<p class="adm-loading">טוען…</p>`;
    try {
      current = (await api(`/api/admin/students/${encodeURIComponent(id)}`)).student;
      historyShown = HISTORY_PAGE;
      renderStudent();
    } catch (e) {
      if (account) view.innerHTML = `<a class="adm-back" href="#">חזרה לכל התלמידים</a><p class="adm-error">${esc(e.message)}</p>`;
    }
  }

  function renderStudent() {
    const s = current;
    const sum = summarize(s);
    const counts = { exercises: 0, lessons: 0, games: 0, practiceSec: 0, ...s.counts };
    const view = $("#admDetailView");

    view.innerHTML = `
      <a class="adm-back" href="#">חזרה לכל התלמידים</a>
      <div class="adm-card adm-profile">
        ${avatarHtml(s, "adm-avatar--lg")}
        <div class="adm-profile-text">
          <h2 class="adm-h1">${esc(s.name)}</h2>
          ${s.number ? `<p class="adm-profile-sub">מספר תלמיד: ${esc(s.number)}</p>` : ""}
          <p class="adm-muted">התיק נפתח: ${esc(fmtDate(s.createdAt))} · ${s.lastActive ? `פעילות אחרונה: ${esc(relTime(s.lastActive))}` : "עוד לא נכנס לקישור"}</p>
        </div>
      </div>

      ${foldToggleHtml("admLinkToggle", "admLinkCard", ICONS.link, "הקישור האישי")}
      <div class="adm-card adm-link-card hidden" id="admLinkCard">${linkCardHtml(s)}</div>

      <div class="adm-tiles">
        ${tile("שיעורי בית שבוצעו", sum.hwTotal ? `<span dir="ltr">${sum.hwDone}/${sum.hwTotal}</span>` : "—")}
        ${tile("תרגילים שהושלמו", `<span dir="ltr">${sum.completed}/${TOTAL_EXERCISES}</span>`, sum.mastered ? `${sum.mastered} בציון 90% ומעלה` : "")}
        ${tile("ציון ממוצע", sum.avg == null ? "—" : `${sum.avg}%`, "לפי התוצאה הטובה בכל תרגיל")}
        ${tile("סבבי תרגול", counts.exercises)}
        ${tile("זמן תרגול", esc(fmtDuration(counts.practiceSec)))}
        ${tile("שיעורים ומשחקים", counts.lessons + counts.games)}
        ${tile("נקודות", fmtNum(pointsOf(s).total), `השבוע: ${fmtNum(pointsOf(s).week)}`)}
      </div>

      <div class="adm-detail-grid">
        <div class="adm-detail-main">
          <div class="adm-card">
            <h3 class="adm-h3">שיעורי בית</h3>
            <p class="adm-muted adm-card-lead">בחרו תרגיל או נושא שלם — הם יופיעו לתלמיד בקישור האישי שלו, ויסומנו כבוצעו כשיסיים אותם.</p>
            ${homeworkFormHtml()}
            <div id="admHomework">${homeworkListHtml(s)}</div>
          </div>
          ${foldToggleHtml("admTopicsToggle", "admTopicsCard", ICONS.chart, "התקדמות לפי נושא")}
          <div class="adm-card hidden" id="admTopicsCard">
            <div class="adm-fold-head">
              <h3 class="adm-h3">התקדמות לפי נושא</h3>
              ${foldCloseHtml()}
            </div>
            ${topicsHtml(s)}
          </div>
          <div class="adm-card">
            <h3 class="adm-h3">מגמת ציונים</h3>
            <p class="adm-muted adm-card-lead">הציון בכל סבב תרגול מלא, לפי הסדר (${TREND_ROUNDS} האחרונים).</p>
            ${trendHtml(s)}
          </div>
          <div class="adm-card">
            <h3 class="adm-h3">נקודות לחיזוק</h3>
            <p class="adm-muted adm-card-lead">השאלות שהתלמיד טעה בהן הכי הרבה פעמים.</p>
            ${weakSpotsHtml(s)}
          </div>
          <div class="adm-card">
            <h3 class="adm-h3">החזרה האישית</h3>
            <p class="adm-muted adm-card-lead">השאלות שהתלמיד טעה בהן ועדיין לא תרגל עד הסוף. שאלה יוצאת מהמאגר אחרי 3 תשובות נכונות ברצף.</p>
            ${reviewBankHtml(s)}
          </div>
          <div class="adm-card">
            <h3 class="adm-h3">היסטוריית פעילות</h3>
            <div id="admHistory">${historyHtml(s)}</div>
          </div>
        </div>

        <aside class="adm-detail-side">
          ${foldToggleHtml("admFocusToggle", "admFocusForm", ICONS.flag, "איפה אנחנו עומדים")}
          <form class="adm-card hidden" id="admFocusForm">
            <div class="adm-fold-head">
              <h3 class="adm-h3">איפה אנחנו עומדים</h3>
              ${foldCloseHtml()}
            </div>
            <p class="adm-muted adm-card-lead">על מה עובדים עכשיו ומה השלב הבא.</p>
            <textarea id="admFocus" rows="5" placeholder="למשל: סיימנו כינויי גוף, עכשיו עוברים לפועל להיות. לחזק כתיבה.">${esc(s.focus || "")}</textarea>
            <div class="adm-form-foot">
              <span class="adm-muted adm-small" id="admFocusStamp">${s.focusUpdatedAt ? `עודכן: ${esc(fmtDate(s.focusUpdatedAt))}` : ""}</span>
              <button type="submit" class="btn btn-primary btn-candy btn-sm">שמירה</button>
            </div>
          </form>

          ${foldToggleHtml("admNotesToggle", "admNotesCard", ICONS.note, "יומן הערות")}
          <div class="adm-card hidden" id="admNotesCard">
            <div class="adm-fold-head">
              <h3 class="adm-h3">יומן הערות</h3>
              ${foldCloseHtml()}
            </div>
            <form id="admNoteForm" class="adm-note-form">
              <textarea id="admNoteText" rows="3" placeholder="הערה על השיעור או על התלמיד…" required></textarea>
              <button type="submit" class="btn btn-primary btn-candy btn-sm">הוספת הערה</button>
            </form>
            <ul class="adm-notes" id="admNotes">${notesHtml(s)}</ul>
          </div>

          ${foldToggleHtml("admDetailsToggle", "admDetailsForm", ICONS.user, "פרטי התלמיד")}
          <form class="adm-card hidden" id="admDetailsForm">
            <div class="adm-fold-head">
              <h3 class="adm-h3">פרטי התלמיד</h3>
              ${foldCloseHtml()}
            </div>
            <label class="adm-field">
              <span>שם התלמיד</span>
              <input type="text" id="admName" maxlength="80" required value="${esc(s.name)}" />
            </label>
            <label class="adm-field">
              <span>מספר תלמיד</span>
              <input type="text" id="admNumber" inputmode="numeric" pattern="[0-9]{1,6}" maxlength="6" required value="${esc(s.number || "")}" />
            </label>
            <div class="adm-form-foot">
              <span></span>
              <button type="submit" class="btn btn-primary btn-candy btn-sm">שמירת פרטים</button>
            </div>
          </form>

          <button type="button" class="adm-danger-btn" id="admDeleteStudent">${ICONS.trash}<span>מחיקת התיק וכל הנתונים שבו</span></button>
        </aside>
      </div>`;

    bindStudent();
    drawTrend();
  }

  function linkCardHtml(s) {
    const url = portalUrl(s);
    return `
      <div class="adm-link-head">
        <span class="adm-link-icon">${ICONS.link}</span>
        <div class="adm-link-text">
          <h3 class="adm-h3">הקישור האישי של ${esc(s.name)}</h3>
          <p class="adm-muted adm-small">שלחו לתלמיד את הקישור. הוא יראה בו את שיעורי הבית, וכל מה שיפתור יישמר בתיק הזה. אין צורך בהרשמה או בסיסמה.</p>
        </div>
        ${foldCloseHtml()}
      </div>
      <div class="adm-link-row">
        <input type="text" class="adm-link-input" id="admLinkInput" value="${esc(url)}" readonly dir="ltr" aria-label="הקישור האישי" />
        <div class="adm-link-actions">
          <button type="button" class="btn btn-primary btn-candy btn-sm adm-icon-label" id="admCopyLink">${ICONS.copy}<span>העתקה</span></button>
          <a class="btn btn-outline btn-candy btn-sm adm-icon-label" href="${esc(whatsappUrl(s))}" target="_blank" rel="noopener">${ICONS.chat}<span>שליחה בוואטסאפ</span></a>
          <a class="btn btn-outline btn-candy btn-sm adm-icon-label" href="${esc(url)}" target="_blank" rel="noopener">${ICONS.open}<span>תצוגה כמו התלמיד</span></a>
        </div>
      </div>
      <button type="button" class="adm-text-btn" id="admNewKey">הקישור דלף או נשלח בטעות? יצירת קישור חדש</button>`;
  }

  function homeworkFormHtml() {
    const groups = TOPICS.map((topic) => {
      const exercises = topic.exercises || [];
      return `
        <optgroup label="${esc(topic.title)}">
          ${exercises.length > 1 ? `<option value="topic:${esc(topic.id)}">כל הנושא — ${exercises.length} תרגילים</option>` : ""}
          ${exercises.map((ex) => `<option value="${esc(topic.id)}/${esc(ex.id)}">${esc(ex.title)} · ${esc(TYPE_LABELS[ex.type] || "")}</option>`).join("")}
        </optgroup>`;
    }).join("");
    return `
      ${foldToggleHtml("admHwToggle", "admHwForm", ICONS.plus, "הוספת שיעורי בית")}
      <form class="adm-hw-form hidden" id="admHwForm">
        <div class="adm-hw-form-head">
          <span class="adm-hw-form-title">הוספת שיעורי בית</span>
          ${foldCloseHtml()}
        </div>
        <label class="adm-field adm-hw-pick">
          <span>מה לתרגל</span>
          <select id="admHwPick" required>
            <option value="">בחרו תרגיל או נושא…</option>
            ${groups}
          </select>
        </label>
        <label class="adm-field adm-hw-due">
          <span>עד תאריך (לא חובה)</span>
          <input type="date" id="admHwDue" min="${todayKey()}" />
        </label>
        <label class="adm-field adm-hw-note">
          <span>הערה לתלמיד (לא חובה)</span>
          <input type="text" id="admHwNote" maxlength="300" placeholder="למשל: שימו לב להבדל בין is ל-are" />
        </label>
        <button type="submit" class="btn btn-primary btn-candy btn-sm adm-hw-add">הוספה לשיעורי הבית</button>
      </form>`;
  }

  function homeworkListHtml(s) {
    const list = sortedHomework(s.homework || []);
    if (!list.length) return `<p class="adm-muted adm-hw-empty">עוד לא ניתנו שיעורי בית.</p>`;
    const done = list.filter((hw) => hw.doneAt).length;
    return `
      <p class="adm-hw-summary"><span dir="ltr">${done}/${list.length}</span> בוצעו</p>
      <ul class="adm-hw-list">
        ${list
          .map((hw) => {
            const status = homeworkStatus(hw);
            const meta = [
              hw.topicTitle,
              TYPE_LABELS[hw.type] || "",
              `ניתן: ${fmtDate(hw.assignedAt)}`,
              hw.dueDate ? `עד: ${fmtDue(hw.dueDate)}` : "",
              hw.doneAt ? `בוצע: ${fmtDate(hw.doneAt)}${hw.attempts > 1 ? ` (${hw.attempts} ניסיונות)` : ""}` : "",
            ].filter(Boolean);
            return `
              <li class="adm-hw${status.done ? " is-done" : ""}${status.late ? " is-late" : ""}">
                <span class="adm-hw-text">
                  <span class="adm-hw-title">${esc(hw.exerciseTitle)}</span>
                  <span class="adm-hw-meta">${esc(meta.join(" · "))}</span>
                  ${hw.note ? `<span class="adm-hw-note-text">הערה: ${esc(hw.note)}</span>` : ""}
                </span>
                ${status.html}
                <span class="adm-hw-actions">
                  <button type="button" class="adm-icon-btn" data-copy-hw="${esc(hw.id)}" aria-label="העתקת קישור ישיר לתרגיל" title="העתקת קישור ישיר לתרגיל">${ICONS.link}</button>
                  <button type="button" class="adm-icon-btn" data-del-hw="${esc(hw.id)}" aria-label="הסרה משיעורי הבית" title="הסרה משיעורי הבית">${ICONS.trash}</button>
                </span>
              </li>`;
          })
          .join("")}
      </ul>`;
  }

  function topicsHtml(s) {
    const best = s.best || {};
    const opened = new Map();
    (s.activity || []).forEach((a) => {
      if ((a.kind === "lesson" || a.kind === "presentation") && a.topicId && !opened.has(a.topicId)) opened.set(a.topicId, a.at);
    });

    // Topics the student started show first; the rest wait behind a toggle.
    const learned = [];
    const notLearned = [];
    TOPICS.forEach((topic) => {
      const rows = (topic.exercises || []).map((ex) => ({ ex, rec: best[`${topic.id}/${ex.id}`] }));
      const done = rows.filter((r) => r.rec?.bestAt).length;
      const lessonSeen = opened.get(topic.id);
      const started = done || rows.some((r) => r.rec) || lessonSeen;
      (started ? learned : notLearned).push(`
        <details class="adm-topic"${started ? " open" : ""}>
          <summary class="adm-topic-head">
            <span class="adm-topic-title">${esc(topic.title)}</span>
            <span class="adm-topic-count" dir="ltr">${done}/${rows.length}</span>
            ${meterHtml(done, rows.length, `${done} מתוך ${rows.length} תרגילים בנושא ${topic.title}`)}
          </summary>
          ${lessonSeen ? `<p class="adm-topic-lesson">השיעור נפתח לאחרונה: ${esc(fmtDate(lessonSeen))}</p>` : ""}
          <ul class="adm-ex-list">${rows.map(({ ex, rec }) => exerciseRowHtml(ex.title, ex.type, rec)).join("")}</ul>
        </details>`);
    });

    // Exercises recorded under ids that are no longer on the site.
    const known = topicExerciseKeys();
    const extra = Object.entries(best).filter(([key]) => !known.has(key));
    if (extra.length) {
      learned.push(`
        <details class="adm-topic">
          <summary class="adm-topic-head"><span class="adm-topic-title">תרגילים שהוסרו מהאתר</span><span class="adm-topic-count">${extra.length}</span></summary>
          <ul class="adm-ex-list">${extra.map(([key, rec]) => exerciseRowHtml(rec.title || key, rec.type, rec)).join("")}</ul>
        </details>`);
    }
    if (!learned.length && !notLearned.length) return `<p class="adm-muted">אין נושאים באתר.</p>`;
    return `
      ${learned.length ? learned.join("") : `<p class="adm-muted">עוד לא התחלנו אף נושא.</p>`}
      ${notLearned.length ? `
        <details class="adm-topics-rest">
          <summary class="adm-fold-toggle">
            <span class="adm-fold-icon">${ICONS.plus}</span>
            <span>נושאים שעוד לא למדנו (${notLearned.length})</span>
          </summary>
          ${notLearned.join("")}
        </details>` : ""}`;
  }

  function exerciseRowHtml(title, type, rec) {
    let status;
    if (rec?.bestAt) status = scorePill(rec.score, rec.total);
    else if (rec) status = pill("none", "רק תרגול טעויות");
    else status = pill("none", "טרם תורגל");
    const meta = rec
      ? `${rec.attempts} ${rec.attempts === 1 ? "ניסיון" : "ניסיונות"} · אחרון: ${esc(fmtDate(rec.lastAt))}${rec.lastTotal && rec.attempts > 1 ? ` (<span dir="ltr">${rec.lastScore}/${rec.lastTotal}</span>)` : ""}`
      : "";
    return `
      <li class="adm-ex${rec ? "" : " is-untouched"}">
        <span class="adm-ex-text">
          <span class="adm-ex-title">${esc(title)}</span>
          <span class="adm-ex-meta">${esc(TYPE_LABELS[type] || "")}${meta ? ` · ${meta}` : ""}</span>
        </span>
        ${status}
      </li>`;
  }

  /* Score trend — one series, so the card title names it and no legend is needed. */

  function trendRounds(s) {
    return (s.activity || [])
      .filter((a) => a.kind === "exercise" && !a.isRetry && a.total)
      .slice(0, TREND_ROUNDS)
      .reverse();
  }

  const CHART = { top: 16, right: 16, bottom: 30, left: 44 };

  function trendHtml(s) {
    if (trendRounds(s).length < 2) {
      return `<p class="adm-muted">המגמה תופיע אחרי לפחות שני סבבי תרגול מלאים.</p>`;
    }
    return `<div class="adm-chart" id="admChart" dir="ltr"></div>`;
  }

  // Drawn at the container's real pixel width (one SVG unit = one pixel), so
  // tick labels keep their size on a phone instead of shrinking with a viewBox.
  function drawTrend() {
    const chart = $("#admChart");
    if (!chart || !current) return;
    const rounds = trendRounds(current);
    const w = Math.max(260, Math.round(chart.clientWidth));
    const h = w < 480 ? 190 : 220;
    const { top, right, bottom, left } = CHART;
    const plotW = w - left - right;
    const plotH = h - top - bottom;
    const x = (i) => left + (i / (rounds.length - 1)) * plotW;
    const y = (p) => top + plotH - (p / 100) * plotH;
    const points = rounds.map((r, i) => ({ x: x(i), y: y(pct(r.score, r.total)) }));
    const grid = [0, 50, 100]
      .map(
        (p) => `
          <line class="adm-chart-grid" x1="${left}" x2="${w - right}" y1="${y(p)}" y2="${y(p)}" />
          <text class="adm-chart-tick" x="${left - 8}" y="${y(p) + 4}" text-anchor="end">${p}%</text>`
      )
      .join("");
    const path = points.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    const dotsSvg = points.map((p, i) => `<circle class="adm-chart-dot" data-i="${i}" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4" />`).join("");

    chart.innerHTML = `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="ציון בכל סבב תרגול, ${rounds.length} סבבים">
        ${grid}
        <line class="adm-chart-cross hidden" id="admChartCross" y1="${top}" y2="${top + plotH}" />
        <path class="adm-chart-line" d="${path}" />
        ${dotsSvg}
        <text class="adm-chart-tick" x="${left}" y="${h - 8}" text-anchor="start">${esc(fmtDate(rounds[0].at))}</text>
        <text class="adm-chart-tick" x="${w - right}" y="${h - 8}" text-anchor="end">${esc(fmtDate(rounds[rounds.length - 1].at))}</text>
        <rect class="adm-chart-hit" id="admChartHit" x="${left - 10}" y="0" width="${plotW + 20}" height="${h}" />
      </svg>
      <div class="adm-chart-tip hidden" id="admChartTip" dir="rtl"></div>`;

    const svg = $("svg", chart);
    const hit = $("#admChartHit");
    const cross = $("#admChartCross");
    const tip = $("#admChartTip");
    const dots = $$(".adm-chart-dot", chart);

    function hide() {
      cross.classList.add("hidden");
      tip.classList.add("hidden");
      dots.forEach((d) => d.classList.remove("is-active"));
    }

    function show(clientX) {
      const box = svg.getBoundingClientRect();
      const scale = box.width / w;
      const svgX = (clientX - box.left) / scale;
      const i = Math.max(0, Math.min(rounds.length - 1, Math.round(((svgX - left) / plotW) * (rounds.length - 1))));
      const dot = dots[i];
      const cx = Number(dot.getAttribute("cx"));
      const cy = Number(dot.getAttribute("cy"));
      dots.forEach((d) => d.classList.toggle("is-active", d === dot));
      cross.setAttribute("x1", cx);
      cross.setAttribute("x2", cx);
      cross.classList.remove("hidden");
      const r = rounds[i];
      tip.innerHTML = `
        <strong>${esc(r.exerciseTitle)}</strong>
        <span>${esc(r.topicTitle)} · ${esc(fmtDate(r.at))}</span>
        <span>ציון: <span dir="ltr">${r.score}/${r.total}</span> (${pct(r.score, r.total)}%)</span>`;
      tip.classList.remove("hidden");
      const tipW = tip.offsetWidth;
      const px = cx * scale;
      tip.style.left = `${Math.min(box.width - tipW, Math.max(0, px - tipW / 2))}px`;
      tip.style.top = `${Math.max(0, cy * scale - tip.offsetHeight - 14)}px`;
    }

    hit.addEventListener("pointermove", (e) => show(e.clientX));
    hit.addEventListener("pointerdown", (e) => show(e.clientX));
    hit.addEventListener("pointerleave", hide);
  }

  function weakSpotsHtml(s) {
    const map = new Map();
    (s.activity || []).forEach((a) => {
      if (a.kind !== "exercise") return;
      (a.mistakes || []).forEach((m) => {
        const key = `${m.prompt}|${m.answer}`;
        const entry = map.get(key) || { ...m, count: 0, given: new Set(), exercise: a.exerciseTitle, topic: a.topicTitle };
        entry.count++;
        if (m.given) entry.given.add(m.given);
        map.set(key, entry);
      });
    });
    const list = [...map.values()].sort((a, b) => b.count - a.count).slice(0, 10);
    if (!list.length) return `<p class="adm-muted">עוד אין טעויות רשומות.</p>`;
    return `
      <ul class="adm-weak">
        ${list
          .map(
            (m) => `
          <li class="adm-weak-item">
            <span class="adm-weak-count">${m.count}×</span>
            <span class="adm-weak-text">
              ${m.prompt ? `<span class="adm-weak-prompt" dir="auto">${esc(m.prompt)}</span>` : ""}
              <span class="adm-weak-answer">תשובה נכונה: <strong dir="auto">${esc(m.answer)}</strong></span>
              ${m.given.size ? `<span class="adm-weak-given">ענו: <span dir="auto">${esc([...m.given].slice(0, 3).join(", "))}</span></span>` : ""}
              <span class="adm-weak-from">${esc(m.topic)} · ${esc(m.exercise)}</span>
            </span>
          </li>`
          )
          .join("")}
      </ul>`;
  }

  // The student's mistake bank (public/js/mistake-bank.js): what is still
  // open, the most-missed first, and how close each one is to leaving.
  const REVIEW_GOAL = 3;
  const REVIEW_SHOWN = 12;

  function reviewBankHtml(s) {
    const entries = s.review?.entries || [];
    const mastered = s.review?.mastered || 0;
    if (!entries.length) {
      return `<p class="adm-muted">${mastered ? `אין כרגע שאלות פתוחות. ${mastered === 1 ? "שאלה אחת כבר יצאה" : `${mastered} שאלות כבר יצאו`} מהמאגר.` : "עוד אין שאלות במאגר."}</p>`;
    }
    const list = [...entries].sort((a, b) => (b.wrong || 0) - (a.wrong || 0) || String(b.wrongAt).localeCompare(String(a.wrongAt)));
    return `
      <p class="adm-hw-summary">${entries.length === 1 ? "שאלה אחת פתוחה" : `${entries.length} שאלות פתוחות`}${mastered ? ` · ${mastered} יצאו מהמאגר` : ""}</p>
      <ul class="adm-weak">
        ${list
          .slice(0, REVIEW_SHOWN)
          .map((e) => {
            const streak = Math.min(REVIEW_GOAL, e.streak || 0);
            return `
          <li class="adm-weak-item">
            <span class="adm-weak-count">${e.wrong || 1}×</span>
            <span class="adm-weak-text">
              ${e.prompt ? `<span class="adm-weak-prompt" dir="auto">${esc(e.prompt)}</span>` : ""}
              <span class="adm-weak-answer">תשובה נכונה: <strong dir="auto">${esc(e.answer)}</strong></span>
              <span class="adm-weak-from">${esc(e.topicTitle)} · ${esc(e.exerciseTitle)} · ענה נכון ברצף: <span dir="ltr">${streak}/${REVIEW_GOAL}</span></span>
            </span>
          </li>`;
          })
          .join("")}
      </ul>
      ${entries.length > REVIEW_SHOWN ? `<p class="adm-muted adm-small">ועוד ${entries.length - REVIEW_SHOWN}.</p>` : ""}`;
  }

  function activityHtml(a) {
    const time = `<span class="adm-act-time">${esc(fmtTime(a.at))}</span>`;
    if (a.kind === "exercise") {
      const mistakes = a.mistakes || [];
      const details = mistakes.length
        ? `<details class="adm-act-mistakes">
            <summary>${mistakes.length === 1 ? "טעות אחת" : `${mistakes.length} טעויות`}</summary>
            <ul>${mistakes
              .map(
                (m) => `
              <li>
                ${m.prompt ? `<span dir="auto">${esc(m.prompt)}</span>` : ""}
                <span>נכון: <strong dir="auto">${esc(m.answer)}</strong>${m.given ? ` · ענו: <span class="adm-given" dir="auto">${esc(m.given)}</span>` : ""}</span>
              </li>`
              )
              .join("")}</ul>
          </details>`
        : "";
      return `
        <li class="adm-act">
          <span class="adm-act-icon">${ICONS.exercise}</span>
          <div class="adm-act-body">
            <div class="adm-act-line">
              <span class="adm-act-title">${esc(a.exerciseTitle)}</span>
              ${scorePill(a.score, a.total)}
            </div>
            <span class="adm-act-meta">${esc(a.topicTitle)} · ${esc(TYPE_LABELS[a.type] || "")}${a.isRetry ? " · תרגול טעויות" : ""}${a.isNew ? " · תרגילים חדשים" : ""} · ${esc(fmtDuration(a.durationSec))} · ${time}</span>
            ${details}
          </div>
        </li>`;
    }
    if (a.kind === "game") {
      return `
        <li class="adm-act">
          <span class="adm-act-icon">${ICONS.game}</span>
          <div class="adm-act-body">
            <span class="adm-act-title">משחק: ${esc(a.gameTitle || a.gameId)}</span>
            <span class="adm-act-meta">ניקוד: ${esc(a.score)} · ${time}</span>
          </div>
        </li>`;
    }
    const what = a.kind === "presentation" ? "צפייה במצגת" : "פתיחת שיעור";
    return `
      <li class="adm-act">
        <span class="adm-act-icon">${ICONS.lesson}</span>
        <div class="adm-act-body">
          <span class="adm-act-title">${what}: ${esc(a.itemTitle)}</span>
          <span class="adm-act-meta">${esc(a.topicTitle)} · ${time}</span>
        </div>
      </li>`;
  }

  function historyHtml(s) {
    const all = s.activity || [];
    if (!all.length) return `<p class="adm-muted">עוד אין פעילות. היא תופיע כאן ברגע שהתלמיד יפתור תרגיל דרך הקישור.</p>`;
    const groups = [];
    all.slice(0, historyShown).forEach((a) => {
      const day = startOfDay(a.at);
      const last = groups[groups.length - 1];
      if (last?.day === day) last.items.push(a);
      else groups.push({ day, label: dayLabel(a.at), items: [a] });
    });
    return `
      ${groups
        .map(
          (g) => `
        <div class="adm-day">
          <h4 class="adm-day-title">${esc(g.label)}</h4>
          <ul class="adm-acts">${g.items.map(activityHtml).join("")}</ul>
        </div>`
        )
        .join("")}
      ${all.length > historyShown ? `<button type="button" class="adm-more" id="admMore">הצגת פעילות קודמת</button>` : ""}`;
  }

  function notesHtml(s) {
    const notes = s.notes || [];
    if (!notes.length) return `<li class="adm-muted adm-notes-empty">עוד אין הערות.</li>`;
    return notes
      .map(
        (n) => `
        <li class="adm-note">
          <div class="adm-note-head">
            <span class="adm-note-date">${esc(fmtDate(n.at))}</span>
            <button type="button" class="adm-icon-btn" data-note="${esc(n.id)}" aria-label="מחיקת ההערה">${ICONS.trash}</button>
          </div>
          <p class="adm-note-text" dir="auto">${esc(n.text)}</p>
        </li>`
      )
      .join("");
  }

  function syncListEntry() {
    const i = students.findIndex((s) => s.id === current.id);
    if (i >= 0) {
      const { activity, ...file } = current;
      students[i] = file;
    }
  }

  async function withBusy(button, fn) {
    if (button) button.disabled = true;
    try {
      await fn();
    } catch (e) {
      if (account) showToast(e.message);
    } finally {
      if (button) button.disabled = false;
    }
  }

  // Selected option → the exercises it stands for ("topic:<id>" is the whole topic).
  function pickedExercises(value) {
    const items = (topic, exercises) =>
      exercises.map((ex) => ({ topicId: topic.id, exerciseId: ex.id, topicTitle: topic.title, exerciseTitle: ex.title, type: ex.type }));
    if (value.startsWith("topic:")) {
      const topic = TOPICS.find((tp) => tp.id === value.slice(6));
      return topic ? items(topic, topic.exercises || []) : [];
    }
    const [topicId, exerciseId] = value.split("/");
    const topic = TOPICS.find((tp) => tp.id === topicId);
    const ex = topic?.exercises?.find((e) => e.id === exerciseId);
    return ex ? items(topic, [ex]) : [];
  }

  function bindLinkCard() {
    const id = encodeURIComponent(current.id);
    $("#admCopyLink").addEventListener("click", async () => {
      if (await copyText(portalUrl(current))) {
        showToast("הקישור הועתק — אפשר להדביק ולשלוח לתלמיד");
        return;
      }
      $("#admLinkInput").focus();
      $("#admLinkInput").select();
      showToast("הקישור מסומן — לחצו Ctrl+C כדי להעתיק");
    });
    $("#admLinkInput").addEventListener("focus", (e) => e.target.select());
    $("#admNewKey").addEventListener("click", (e) => {
      if (!confirm(`ליצור ל${current.name} קישור חדש? הקישור הקודם יפסיק לעבוד, וצריך יהיה לשלוח לתלמיד את החדש. ההתקדמות שנשמרה לא נמחקת.`)) return;
      withBusy(e.currentTarget, async () => {
        const { key } = await api(`/api/admin/students/${id}/key`, { method: "POST" });
        current.key = key;
        syncListEntry();
        $("#admLinkCard").innerHTML = linkCardHtml(current);
        bindLinkCard();
        showToast("נוצר קישור חדש — שלחו אותו לתלמיד");
      });
    });
  }

  function bindStudent() {
    const id = encodeURIComponent(current.id);
    bindFold($("#admLinkToggle"), $("#admLinkCard"), "#admCopyLink");
    bindFold($("#admHwToggle"), $("#admHwForm"), "#admHwPick");
    bindFold($("#admTopicsToggle"), $("#admTopicsCard"), "[data-fold-close]");
    bindFold($("#admFocusToggle"), $("#admFocusForm"), "#admFocus");
    bindFold($("#admNotesToggle"), $("#admNotesCard"), "#admNoteText");
    bindFold($("#admDetailsToggle"), $("#admDetailsForm"), "#admName");
    bindLinkCard();

    $("#admHwForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const items = pickedExercises($("#admHwPick").value);
      if (!items.length) return;
      withBusy(e.submitter, async () => {
        const res = await api(`/api/admin/students/${id}/homework`, {
          method: "POST",
          body: { items, dueDate: $("#admHwDue").value, note: $("#admHwNote").value },
        });
        current.homework = res.homework;
        syncListEntry();
        $("#admHomework").innerHTML = homeworkListHtml(current);
        $("#admHwPick").value = "";
        $("#admHwNote").value = "";
        if (!res.added) showToast("התרגילים האלה כבר בשיעורי הבית ועוד לא בוצעו");
        else showToast(res.skipped ? `נוספו ${res.added} תרגילים (${res.skipped} כבר היו ברשימה)` : res.added === 1 ? "התרגיל נוסף לשיעורי הבית" : `נוספו ${res.added} תרגילים לשיעורי הבית`);
      });
    });

    $("#admHomework").addEventListener("click", async (e) => {
      const copyBtn = e.target.closest("[data-copy-hw]");
      const delBtn = e.target.closest("[data-del-hw]");
      if (copyBtn) {
        const hw = (current.homework || []).find((h) => h.id === copyBtn.dataset.copyHw);
        if (hw) showToast((await copyText(exerciseUrl(current, hw))) ? "הקישור הישיר לתרגיל הועתק" : "לא הצלחנו להעתיק");
        return;
      }
      if (!delBtn || !confirm("להסיר את התרגיל משיעורי הבית?")) return;
      withBusy(delBtn, async () => {
        const res = await api(`/api/admin/students/${id}/homework/${encodeURIComponent(delBtn.dataset.delHw)}`, { method: "DELETE" });
        current.homework = res.homework;
        syncListEntry();
        $("#admHomework").innerHTML = homeworkListHtml(current);
      });
    });

    $("#admFocusForm").addEventListener("submit", (e) => {
      e.preventDefault();
      withBusy(e.submitter, async () => {
        const res = await api(`/api/admin/students/${id}`, { method: "PATCH", body: { focus: $("#admFocus").value } });
        Object.assign(current, { focus: res.focus, focusUpdatedAt: res.focusUpdatedAt });
        syncListEntry();
        $("#admFocusStamp").textContent = res.focusUpdatedAt ? `עודכן: ${fmtDate(res.focusUpdatedAt)}` : "";
        showToast("נשמר");
      });
    });

    $("#admDetailsForm").addEventListener("submit", (e) => {
      e.preventDefault();
      withBusy(e.submitter, async () => {
        const res = await api(`/api/admin/students/${id}`, {
          method: "PATCH",
          body: { name: $("#admName").value, number: $("#admNumber").value },
        });
        Object.assign(current, { name: res.name, number: res.number });
        syncListEntry();
        renderStudent();
        showToast("הפרטים נשמרו");
      });
    });

    $("#admNoteForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const text = $("#admNoteText").value.trim();
      if (!text) return;
      withBusy(e.submitter, async () => {
        const { note } = await api(`/api/admin/students/${id}/notes`, { method: "POST", body: { text } });
        current.notes = [note, ...(current.notes || [])];
        syncListEntry();
        $("#admNoteText").value = "";
        $("#admNotes").innerHTML = notesHtml(current);
        showToast("ההערה נוספה");
      });
    });

    $("#admNotes").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-note]");
      if (!btn || !confirm("למחוק את ההערה?")) return;
      withBusy(btn, async () => {
        await api(`/api/admin/students/${id}/notes/${encodeURIComponent(btn.dataset.note)}`, { method: "DELETE" });
        current.notes = (current.notes || []).filter((n) => n.id !== btn.dataset.note);
        syncListEntry();
        $("#admNotes").innerHTML = notesHtml(current);
      });
    });

    $("#admHistory").addEventListener("click", (e) => {
      if (!e.target.closest("#admMore")) return;
      historyShown += HISTORY_PAGE;
      $("#admHistory").innerHTML = historyHtml(current);
    });

    $("#admDeleteStudent").addEventListener("click", (e) => {
      if (!confirm(`למחוק את התיק של ${current.name}, כולל כל ההתקדמות, שיעורי הבית וההערות? הקישור שלו יפסיק לעבוד, ואי אפשר לבטל את זה.`)) return;
      withBusy(e.currentTarget, async () => {
        await api(`/api/admin/students/${id}`, { method: "DELETE" });
        students = students.filter((s) => s.id !== current.id);
        current = null;
        showToast("התיק נמחק");
        location.hash = "";
      });
    });
  }

  /* ── Routing ── */

  function route() {
    studentInfo.close(false);
    if (!account) {
      showGate(gateError);
      gateError = "";
      return;
    }
    const id = decodeURIComponent(location.hash.replace(/^#/, ""));
    if (id) loadStudent(id);
    else loadList();
    window.scrollTo({ top: 0 });
  }

  async function init() {
    window.addEventListener("hashchange", route);
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(drawTrend, 150);
    });

    // Firebase remembers the sign-in on this device, so a returning teacher
    // lands straight on their files; until it answers, just show loading.
    showOnly("admListView");
    $("#admListView").innerHTML = `<p class="adm-loading">טוען…</p>`;
    const ready = await window.FirebaseApp?.ready;
    if (!ready) {
      showGate("ההתחברות עם Google עדיין לא מוגדרת באתר (חסרות הגדרות Firebase)");
      return;
    }
    $("#admGoogleBtn").disabled = false;
    $("#admGoogleBtn").addEventListener("click", signIn);
    $("#admSignOut").addEventListener("click", () => FirebaseApp.auth.signOut());

    FirebaseApp.auth.onAuthStateChanged((user) => {
      account = user
        ? { name: user.displayName || user.email?.split("@")[0] || "מורה", email: user.email || "", photoURL: user.photoURL || "" }
        : null;
      // A different teacher may sign in next on this device — drop the last one's files.
      students = [];
      current = null;
      renderAccount();
      route();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
