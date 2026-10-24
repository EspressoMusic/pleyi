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
  ICONS.download = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5"/><path d="M5 20h14"/></svg>`;

  const VIEW_KEY = "adm-list-view";

  // The signed-in teacher ({ name, email, photoURL }), null when signed out.
  let account = null;
  let gateError = "";
  // "local" means the server has no Firestore credential, so files live in a
  // file on the server that a redeploy wipes.
  let storage = "firestore";
  let unclaimed = 0;
  let students = [];
  let current = null;
  let historyShown = HISTORY_PAGE;
  let listQuery = "";
  let listSort = "recent";
  let listView = readStored(VIEW_KEY) === "table" ? "table" : "cards";
  // Table view: key "" keeps the server order (most recently active first).
  let tableSort = { key: "", dir: 1 };

  /* ── Helpers ── */

  function readStored(key) {
    try {
      return localStorage.getItem(key) || "";
    } catch {
      return "";
    }
  }

  function saveStored(key, value) {
    try {
      if (value) localStorage.setItem(key, value);
      else localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }

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

  // The class leaderboard as the teacher sees it — full names (students see
  // first names and an initial).
  function boardCardHtml() {
    if (!window.Leaderboard) return "";
    return `
      <div class="adm-card adm-board">
        <div class="adm-board-head">
          <span class="adm-board-icon">${window.Leaderboard.icon}</span>
          <div>
            <h3 class="adm-h3">טבלת השיאים</h3>
            <p class="adm-muted">כל תשובה נכונה מזכה את התלמיד בנקודות, ובתרגילים קשים יותר בנקודות רבות יותר. התלמידים רואים את הטבלה בקישור האישי שלהם, עם שם פרטי ואות ראשונה של שם המשפחה.</p>
          </div>
        </div>
        <div id="admBoard"></div>
        ${window.Leaderboard.rulesHtml()}
      </div>`;
  }

  function bindBoard() {
    const box = $("#admBoard");
    if (!box) return;
    const rows = students.map((s) => ({ name: s.name, ...pointsOf(s), isMe: false }));
    window.Leaderboard.bind(box, rows, { limit: 10 });
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
      unclaimed = data.unclaimed || 0;
      renderList();
    } catch (e) {
      if (account) view.innerHTML = `<p class="adm-error">${esc(e.message)}</p>`;
    }
  }

  function isLocalHost() {
    return ["localhost", "127.0.0.1"].includes(location.hostname);
  }

  // Shown above the list: a warning while the server can't keep files for
  // good, and the one-time claim of files opened before Google sign-in.
  function listNotices() {
    const parts = [];
    if (storage === "local" && !isLocalHost()) {
      parts.push(`
        <div class="adm-card adm-notice" role="note">
          <h3 class="adm-h3">התיקים עוד לא נשמרים לתמיד</h3>
          <p>השרת עדיין לא מחובר למסד הנתונים של Firebase, ולכן התיקים נשמרים רק בקובץ זמני על השרת ועלולים להימחק בעדכון הבא של האתר. כדי שיישמרו לתמיד צריך להגדיר בשרת את <code dir="ltr">FIREBASE_SERVICE_ACCOUNT</code>.</p>
        </div>`);
    }
    if (unclaimed) {
      parts.push(`
        <form class="adm-card adm-claim" id="admClaimForm">
          <h3 class="adm-h3">${unclaimed === 1 ? "יש תיק אחד" : `יש ${unclaimed} תיקים`} מלפני הכניסה עם Google</h3>
          <p class="adm-muted">הזינו את קוד המורה כדי לצרף אותם לחשבון שלכם. אחרי הצירוף הם יופיעו כאן עם כל ההתקדמות שנשמרה בהם.</p>
          <div class="adm-claim-row">
            <label class="adm-field">
              <span>קוד מורה</span>
              <input type="password" id="admClaimPin" required autocomplete="current-password" dir="ltr" />
            </label>
            <button type="submit" class="btn btn-primary btn-candy adm-create-btn">צירוף התיקים</button>
          </div>
        </form>`);
    }
    return parts.join("");
  }

  function filteredStudents() {
    const q = listQuery.trim().toLowerCase();
    return students.filter((s) => !q || [s.name, s.grade].some((v) => String(v || "").toLowerCase().includes(q)));
  }

  function sortedStudents() {
    const list = filteredStudents();
    if (listSort === "name") return list.sort((a, b) => a.name.localeCompare(b.name, "he"));
    if (listSort === "avg") return list.sort((a, b) => (summarize(b).avg ?? -1) - (summarize(a).avg ?? -1));
    if (listSort === "points") return list.sort((a, b) => pointsOf(b).total - pointsOf(a).total);
    return list;
  }

  function renderList() {
    const view = $("#admListView");
    const weekAgo = Date.now() - 7 * DAY_MS;
    const activeWeek = students.filter((s) => s.lastActive && new Date(s.lastActive).getTime() >= weekAgo).length;
    const openHomework = students.reduce((n, s) => n + (s.homework || []).filter((hw) => !hw.doneAt).length, 0);

    view.innerHTML = `
      <div class="adm-page-head">
        <h2 class="adm-h1">התלמידים שלי</h2>
        <p class="adm-muted">פותחים תיק לכל תלמיד ושולחים לו את הקישור האישי. כל מה שהוא פותר דרך הקישור נשמר בתיק — התלמיד לא צריך להירשם.</p>
      </div>

      ${listNotices()}

      <form class="adm-card adm-create" id="admCreateForm">
        <h3 class="adm-h3">פתיחת תיק חדש</h3>
        <div class="adm-create-row">
          <label class="adm-field">
            <span>שם התלמיד</span>
            <input type="text" id="admNewName" maxlength="80" required placeholder="למשל: נועה כהן" />
          </label>
          <label class="adm-field">
            <span>כיתה / רמה (לא חובה)</span>
            <input type="text" id="admNewGrade" maxlength="60" placeholder="למשל: כיתה ד׳" />
          </label>
          <button type="submit" class="btn btn-primary btn-candy adm-create-btn">פתיחת תיק</button>
        </div>
      </form>

      ${
        students.length
          ? `<div class="adm-tiles adm-tiles--3">
              ${tile("תלמידים", students.length)}
              ${tile("פעילים בשבוע האחרון", activeWeek)}
              ${tile("שיעורי בית שממתינים", openHomework)}
            </div>
            ${boardCardHtml()}
            <div class="adm-list-tools">
              <label class="adm-search">
                <span class="adm-sr">חיפוש תלמיד</span>
                <input type="search" id="admSearch" placeholder="חיפוש לפי שם או כיתה" value="${esc(listQuery)}" />
              </label>
              <div class="adm-view-toggle" role="group" aria-label="תצוגת הרשימה">
                <button type="button" data-view="cards" aria-pressed="${listView === "cards"}">כרטיסים</button>
                <button type="button" data-view="table" aria-pressed="${listView === "table"}">טבלה</button>
              </div>
              <label class="adm-sort${listView === "table" ? " hidden" : ""}" id="admSortWrap">
                <span>מיון:</span>
                <select id="admSort">
                  <option value="recent"${listSort === "recent" ? " selected" : ""}>פעילות אחרונה</option>
                  <option value="name"${listSort === "name" ? " selected" : ""}>שם</option>
                  <option value="avg"${listSort === "avg" ? " selected" : ""}>ציון ממוצע</option>
                  <option value="points"${listSort === "points" ? " selected" : ""}>נקודות</option>
                </select>
              </label>
            </div>
            <div class="adm-students" id="admStudents"></div>`
          : `<div class="adm-card adm-empty">
              <h3 class="adm-h3">עוד אין תיקים</h3>
              <p>פתחו תיק לתלמיד הראשון בטופס שלמעלה, ואז שלחו לו את הקישור שלו.</p>
            </div>`
      }`;

    renderStudentRows();
    bindBoard();
    $("#admCreateForm").addEventListener("submit", (e) => {
      e.preventDefault();
      withBusy(e.submitter, async () => {
        const { student } = await api("/api/admin/students", {
          method: "POST",
          body: { name: $("#admNewName").value, grade: $("#admNewGrade").value },
        });
        students = [student, ...students];
        showToast("התיק נפתח — עכשיו אפשר לתת שיעורי בית ולשלוח את הקישור");
        location.hash = encodeURIComponent(student.id);
      });
    });
    $("#admClaimForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      withBusy(e.submitter, async () => {
        const { claimed } = await api("/api/admin/students/claim", {
          method: "POST",
          headers: { "X-Teacher-Pin": $("#admClaimPin").value.trim() },
        });
        showToast(!claimed ? "אין תיקים לצרף" : claimed === 1 ? "תיק אחד צורף לחשבון שלכם" : `${claimed} תיקים צורפו לחשבון שלכם`);
        loadList();
      });
    });
    $("#admSearch")?.addEventListener("input", (e) => {
      listQuery = e.target.value;
      renderStudentRows();
    });
    $("#admSort")?.addEventListener("change", (e) => {
      listSort = e.target.value;
      renderStudentRows();
    });
    $$(".adm-view-toggle [data-view]").forEach((btn) =>
      btn.addEventListener("click", () => {
        listView = btn.dataset.view;
        saveStored(VIEW_KEY, listView);
        $$(".adm-view-toggle [data-view]").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        $("#admSortWrap").classList.toggle("hidden", listView === "table");
        renderStudentRows();
      })
    );
  }

  function renderStudentRows() {
    const box = $("#admStudents");
    if (!box) return;
    const list = listView === "table" ? filteredStudents() : sortedStudents();
    if (!list.length) {
      box.innerHTML = `<p class="adm-muted adm-no-match">לא נמצאו תלמידים לחיפוש הזה.</p>`;
      return;
    }
    if (listView === "table") {
      renderTable(box, list);
      return;
    }
    box.innerHTML = list
      .map((s) => {
        const sum = summarize(s);
        const open = sum.hwTotal - sum.hwDone;
        return `
          <a class="adm-student" href="#${encodeURIComponent(s.id)}">
            ${avatarHtml(s)}
            <span class="adm-student-id">
              <span class="adm-student-name">${esc(s.name)}</span>
              <span class="adm-student-sub">${esc(s.grade || "")}</span>
            </span>
            <span class="adm-student-stat">
              <span class="adm-stat-label">שיעורי בית</span>
              <span class="adm-stat-value adm-stat-value--sm">${sum.hwTotal ? `<span dir="ltr">${sum.hwDone}/${sum.hwTotal}</span> בוצעו${open ? ` · ${open === 1 ? "אחד ממתין" : `${open} ממתינים`}` : ""}` : "לא ניתנו"}</span>
            </span>
            <span class="adm-student-stat adm-student-progress">
              <span class="adm-stat-label">תרגילים שהושלמו</span>
              <span class="adm-stat-value"><span dir="ltr">${sum.completed}/${TOTAL_EXERCISES}</span></span>
              ${meterHtml(sum.completed, TOTAL_EXERCISES, `${sum.completed} מתוך ${TOTAL_EXERCISES} תרגילים`)}
            </span>
            <span class="adm-student-stat">
              <span class="adm-stat-label">ציון ממוצע</span>
              <span class="adm-stat-value">${sum.avg == null ? "—" : `${sum.avg}%`}</span>
            </span>
            <span class="adm-student-stat">
              <span class="adm-stat-label">נקודות</span>
              <span class="adm-stat-value">${fmtNum(pointsOf(s).total)}</span>
            </span>
            <span class="adm-student-stat">
              <span class="adm-stat-label">פעילות אחרונה</span>
              <span class="adm-stat-value adm-stat-value--sm">${s.lastActive ? esc(relTime(s.lastActive)) : "עוד לא נכנס"}</span>
            </span>
            <span class="adm-student-go">${ICONS.chevron}</span>
          </a>`;
      })
      .join("");
  }

  /* ── Class table: one row per student, one column per topic ── */

  // A topic's standing for one student: full rounds done there and their average best score.
  function topicStats(s, topic) {
    const best = s.best || {};
    const recs = (topic.exercises || []).map((ex) => best[`${topic.id}/${ex.id}`]).filter(Boolean);
    const full = recs.filter((r) => r.bestAt);
    return {
      done: full.length,
      count: topic.exercises?.length || 0,
      avg: full.length ? Math.round(full.reduce((n, r) => n + pct(r.score, r.total), 0) / full.length) : null,
      started: recs.length > 0,
    };
  }

  // The topic of the exercise the student practiced most recently.
  function lastTopicTitle(s) {
    let latest = null;
    Object.entries(s.best || {}).forEach(([key, rec]) => {
      if (rec.lastAt && (!latest || rec.lastAt > latest.rec.lastAt)) latest = { key, rec };
    });
    if (!latest) return "";
    const topicId = latest.key.split("/")[0];
    return TOPICS.find((tp) => tp.id === topicId)?.title || latest.rec.topicTitle || "";
  }

  function tableRow(s) {
    const today = todayKey();
    return {
      s,
      sum: summarize(s),
      late: (s.homework || []).filter((hw) => !hw.doneAt && hw.dueDate && hw.dueDate < today).length,
      lastTopic: lastTopicTitle(s),
      topics: TOPICS.map((topic) => topicStats(s, topic)),
    };
  }

  const TABLE_SORTS = {
    name: (r) => r.s.name,
    active: (r) => (r.s.lastActive ? new Date(r.s.lastActive).getTime() : null),
    hw: (r) => (r.sum.hwTotal ? r.sum.hwDone / r.sum.hwTotal : null),
    done: (r) => r.sum.completed,
    avg: (r) => r.sum.avg,
  };

  function sortValue(r, key) {
    return key.startsWith("topic:") ? r.topics[Number(key.slice(6))].avg : TABLE_SORTS[key](r);
  }

  // Empty values (never active, no homework, topic not practiced) stay last either way.
  function sortTableRows(rows) {
    const { key, dir } = tableSort;
    if (!key) return rows;
    return [...rows].sort((a, b) => {
      const va = sortValue(a, key);
      const vb = sortValue(b, key);
      if (va == null || vb == null) return (va == null) - (vb == null);
      return (typeof va === "string" ? va.localeCompare(vb, "he") : va - vb) * dir;
    });
  }

  function sortTh(key, label, cls = "") {
    const sorted = tableSort.key === key;
    return `
      <th scope="col" class="${cls}"${sorted ? ` aria-sort="${tableSort.dir > 0 ? "ascending" : "descending"}"` : ""}>
        <button type="button" class="adm-th-btn" data-sort="${esc(key)}"><span class="adm-th-label">${label}</span><span class="adm-sort-mark" aria-hidden="true"></span></button>
      </th>`;
  }

  // A color-coded score cell; the number in it carries the meaning on its own.
  function heatTd(avg, sub, attrs = "", emptyLabel = "—") {
    const cls = avg != null ? level(avg).cls : "none";
    return `
      <td class="adm-heat"${attrs}>
        <span class="adm-heat-box adm-heat--${cls}">
          <span class="adm-heat-val">${avg != null ? `${avg}%` : emptyLabel}</span>
          ${sub ? `<span class="adm-heat-sub">${sub}</span>` : ""}
        </span>
      </td>`;
  }

  function studentsLabel(n) {
    return n === 1 ? "תלמיד אחד" : `${n} תלמידים`;
  }

  function tableRowHtml(r) {
    const { s, sum } = r;
    const idleDays = s.lastActive ? Math.round((startOfDay(Date.now()) - startOfDay(s.lastActive)) / DAY_MS) : 0;
    const open = sum.hwTotal - sum.hwDone;
    const active = s.lastActive
      ? `<span class="adm-grid-val">${esc(relTime(s.lastActive))}</span>
         ${r.lastTopic ? `<span class="adm-grid-sub">נושא: ${esc(r.lastTopic)}</span>` : ""}
         ${idleDays >= 7 ? pill("low", `${idleDays} ימים בלי פעילות`) : ""}`
      : pill("none", "עוד לא נכנס");
    const homework = sum.hwTotal
      ? `<span class="adm-grid-val"><span dir="ltr">${sum.hwDone}/${sum.hwTotal}</span> בוצעו</span>
         ${r.late ? pill("low", `${r.late} באיחור`) : open ? `<span class="adm-grid-sub">${open === 1 ? "אחד ממתין" : `${open} ממתינים`}</span>` : ""}`
      : `<span class="adm-grid-sub">לא ניתנו</span>`;
    return `
      <tr data-id="${esc(s.id)}">
        <th scope="row" class="adm-grid-name-col">
          <a class="adm-grid-name" href="#${encodeURIComponent(s.id)}">${esc(s.name)}</a>
          ${s.grade ? `<span class="adm-grid-sub">${esc(s.grade)}</span>` : ""}
        </th>
        <td><span class="adm-grid-stack">${active}</span></td>
        <td><span class="adm-grid-stack">${homework}</span></td>
        <td>
          <span class="adm-grid-stack">
            <span class="adm-grid-val"><span dir="ltr">${sum.completed}/${TOTAL_EXERCISES}</span></span>
            ${meterHtml(sum.completed, TOTAL_EXERCISES, `${sum.completed} מתוך ${TOTAL_EXERCISES} תרגילים`)}
          </span>
        </td>
        ${heatTd(sum.avg, sum.avg != null ? level(sum.avg).label : "")}
        ${r.topics
          .map((t, i) => heatTd(t.avg, t.started ? `<span dir="ltr">${t.done}/${t.count}</span>` : "", ` data-topic="${i}"`, t.started ? "התחיל" : "—"))
          .join("")}
      </tr>`;
  }

  function tableFootHtml(rows) {
    const mean = (vals) => (vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null);
    const weekAgo = Date.now() - 7 * DAY_MS;
    const activeWeek = rows.filter((r) => r.s.lastActive && new Date(r.s.lastActive).getTime() >= weekAgo).length;
    const hwDone = rows.reduce((n, r) => n + r.sum.hwDone, 0);
    const hwTotal = rows.reduce((n, r) => n + r.sum.hwTotal, 0);
    const late = rows.reduce((n, r) => n + r.late, 0);
    const avgs = rows.map((r) => r.sum.avg).filter((v) => v != null);
    const avg = mean(avgs);
    return `
      <tr>
        <th scope="row" class="adm-grid-name-col">
          <span class="adm-grid-val">כל הכיתה</span>
          <span class="adm-grid-sub">${studentsLabel(rows.length)}</span>
        </th>
        <td><span class="adm-grid-val">${activeWeek} פעילים השבוע</span></td>
        <td>
          <span class="adm-grid-stack">
            ${hwTotal ? `<span class="adm-grid-val"><span dir="ltr">${hwDone}/${hwTotal}</span> בוצעו</span>` : `<span class="adm-grid-sub">לא ניתנו</span>`}
            ${late ? pill("low", `${late} באיחור`) : ""}
          </span>
        </td>
        <td>
          <span class="adm-grid-stack">
            <span class="adm-grid-val"><span dir="ltr">${mean(rows.map((r) => r.sum.completed))}/${TOTAL_EXERCISES}</span></span>
            <span class="adm-grid-sub">בממוצע לתלמיד</span>
          </span>
        </td>
        ${heatTd(avg, avgs.length ? studentsLabel(avgs.length) : "")}
        ${TOPICS.map((_, i) => {
          const vals = rows.map((r) => r.topics[i].avg).filter((v) => v != null);
          return heatTd(mean(vals), vals.length ? studentsLabel(vals.length) : "");
        }).join("")}
      </tr>`;
  }

  function topicTipHtml(s, topic) {
    const best = s.best || {};
    const items = (topic.exercises || []).map((ex) => {
      const rec = best[`${topic.id}/${ex.id}`];
      const value = rec?.bestAt
        ? `<span dir="ltr">${rec.score}/${rec.total}</span> · ${pct(rec.score, rec.total)}%`
        : rec
          ? "רק תרגול טעויות"
          : "טרם תורגל";
      return `<li${rec?.bestAt ? "" : ` class="is-untouched"`}><span dir="auto">${esc(ex.title)}</span><span class="adm-grid-tip-val">${value}</span></li>`;
    });
    return `<strong>${esc(s.name)} · ${esc(topic.title)}</strong><ul>${items.join("")}</ul>`;
  }

  function renderTable(box, list) {
    const rows = sortTableRows(list.map(tableRow));
    box.innerHTML = `
      <div class="adm-card adm-grid-card">
        <div class="adm-grid-head">
          <div>
            <h3 class="adm-h3">מבט על כל הכיתה</h3>
            <p class="adm-muted adm-small">הציון בכל נושא הוא ממוצע התוצאות הטובות בתרגילים שהתלמיד סיים בו. לחיצה על כותרת ממיינת את הטבלה, ולחיצה על שורה פותחת את התיק.</p>
          </div>
          <button type="button" class="btn btn-outline btn-candy btn-sm adm-icon-label adm-btn-white" id="admExport">${ICONS.download}<span>הורדה לאקסל</span></button>
        </div>
        <ul class="adm-legend" aria-label="מקרא הצבעים">
          <li><span class="adm-legend-swatch adm-heat--good"></span>מצוין · <span dir="ltr">90%–100%</span></li>
          <li><span class="adm-legend-swatch adm-heat--ok"></span>טוב · <span dir="ltr">70%–89%</span></li>
          <li><span class="adm-legend-swatch adm-heat--low"></span>לחזור על זה · <span dir="ltr">0%–69%</span></li>
          <li><span class="adm-legend-swatch adm-heat--none"></span>טרם תורגל</li>
        </ul>
        <div class="adm-grid-scroll">
          <table class="adm-grid">
            <thead>
              <tr>
                ${sortTh("name", "תלמיד", "adm-grid-name-col")}
                ${sortTh("active", "פעילות אחרונה")}
                ${sortTh("hw", "שיעורי בית")}
                ${sortTh("done", "תרגילים שהושלמו")}
                ${sortTh("avg", "ציון ממוצע", "adm-grid-heat-col")}
                ${TOPICS.map((topic, i) => sortTh(`topic:${i}`, `${esc(topic.title)}<span class="adm-th-sub">${topic.exercises?.length || 0} תרגילים</span>`, "adm-grid-heat-col")).join("")}
              </tr>
            </thead>
            <tbody>${rows.map(tableRowHtml).join("")}</tbody>
            ${rows.length > 1 ? `<tfoot>${tableFootHtml(rows)}</tfoot>` : ""}
          </table>
        </div>
        <div class="adm-grid-tip hidden" id="admGridTip" role="tooltip"></div>
      </div>`;
    bindTable(box, rows);
  }

  function bindTable(box, rows) {
    const card = $(".adm-grid-card", box);
    const tip = $("#admGridTip", box);
    const tbody = $("tbody", box);
    const byId = new Map(rows.map((r) => [r.s.id, r]));
    const touch = matchMedia("(hover: none)").matches;
    let tipCell = null;

    function hideTip() {
      tipCell = null;
      tip.classList.add("hidden");
    }

    // The tooltip lives inside the card (not on <body>), positioned against it.
    function showTip(cell) {
      const r = byId.get(cell.closest("tr").dataset.id);
      const topic = TOPICS[Number(cell.dataset.topic)];
      if (!r || !topic) return;
      tipCell = cell;
      tip.innerHTML = topicTipHtml(r.s, topic);
      tip.classList.remove("hidden");
      const cardBox = card.getBoundingClientRect();
      const cellBox = cell.getBoundingClientRect();
      const left = cellBox.left + cellBox.width / 2 - cardBox.left - card.clientLeft - tip.offsetWidth / 2;
      const above = cellBox.top - cardBox.top - card.clientTop - tip.offsetHeight - 6;
      tip.style.left = `${Math.max(8, Math.min(card.clientWidth - tip.offsetWidth - 8, left))}px`;
      tip.style.top = `${above >= 0 ? above : cellBox.bottom - cardBox.top - card.clientTop + 6}px`;
    }

    $("thead", box).addEventListener("click", (e) => {
      const btn = e.target.closest("[data-sort]");
      if (!btn) return;
      const key = btn.dataset.sort;
      // Names read best A→Z; numbers highest first, latest activity first.
      tableSort = tableSort.key === key ? { key, dir: -tableSort.dir } : { key, dir: key === "name" ? 1 : -1 };
      renderStudentRows();
      $(`[data-sort="${key}"]`, box)?.focus();
    });

    tbody.addEventListener("pointerover", (e) => {
      if (e.pointerType === "touch") return;
      const cell = e.target.closest("[data-topic]");
      if (!cell) hideTip();
      else if (cell !== tipCell) showTip(cell);
    });
    tbody.addEventListener("pointerleave", hideTip);
    $(".adm-grid-scroll", box).addEventListener("scroll", hideTip, { passive: true });

    tbody.addEventListener("click", (e) => {
      if (e.target.closest("a")) return;
      const cell = e.target.closest("[data-topic]");
      // On a touch screen a tap on a topic shows its exercises; the name opens the file.
      if (cell && touch) {
        if (cell === tipCell) hideTip();
        else showTip(cell);
        return;
      }
      if (String(getSelection())) return;
      const tr = e.target.closest("tr[data-id]");
      if (tr) location.hash = encodeURIComponent(tr.dataset.id);
    });
    card.addEventListener("click", (e) => {
      if (!e.target.closest("[data-topic]")) hideTip();
    });

    $("#admExport").addEventListener("click", () => exportCsv(rows));
  }

  /* CSV for Excel: a BOM so Hebrew opens correctly, one row per student. */

  function csvCell(value) {
    let text = value == null ? "" : String(value);
    // Keep Excel from running a typed note as a formula.
    if (typeof value === "string" && /^[=+\-@\t\r]/.test(text)) text = `'${text}`;
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }

  function csvDate(iso) {
    return iso ? `${dayKey(new Date(iso))} ${fmtTime(iso)}` : "";
  }

  function exportCsv(rows) {
    const head = [
      "שם",
      "כיתה / רמה",
      "פעילות אחרונה",
      "נושא אחרון שתורגל",
      "שיעורי בית שניתנו",
      "שיעורי בית שבוצעו",
      "שיעורי בית באיחור",
      `תרגילים שהושלמו (מתוך ${TOTAL_EXERCISES})`,
      "ציון ממוצע (%)",
      ...TOPICS.flatMap((topic) => [`${topic.title} — תרגילים שהושלמו (מתוך ${topic.exercises?.length || 0})`, `${topic.title} — ציון ממוצע (%)`]),
      "איפה אנחנו עומדים",
    ];
    const lines = rows.map((r) => [
      r.s.name,
      r.s.grade || "",
      csvDate(r.s.lastActive),
      r.lastTopic,
      r.sum.hwTotal,
      r.sum.hwDone,
      r.late,
      r.sum.completed,
      r.sum.avg,
      ...r.topics.flatMap((t) => [t.done, t.avg]),
      r.s.focus || "",
    ]);
    const csv = [head, ...lines].map((line) => line.map(csvCell).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `תלמידים-${todayKey()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast("הקובץ ירד — אפשר לפתוח אותו באקסל");
  }

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
          ${s.grade ? `<p class="adm-profile-sub">${esc(s.grade)}</p>` : ""}
          <p class="adm-muted">התיק נפתח: ${esc(fmtDate(s.createdAt))} · ${s.lastActive ? `פעילות אחרונה: ${esc(relTime(s.lastActive))}` : "עוד לא נכנס לקישור"}</p>
        </div>
      </div>

      <div class="adm-card adm-link-card" id="admLinkCard">${linkCardHtml(s)}</div>

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
          <div class="adm-card">
            <h3 class="adm-h3">התקדמות לפי נושא</h3>
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
            <h3 class="adm-h3">היסטוריית פעילות</h3>
            <div id="admHistory">${historyHtml(s)}</div>
          </div>
        </div>

        <aside class="adm-detail-side">
          <form class="adm-card" id="admFocusForm">
            <h3 class="adm-h3">איפה אנחנו עומדים</h3>
            <p class="adm-muted adm-card-lead">על מה עובדים עכשיו ומה השלב הבא.</p>
            <textarea id="admFocus" rows="5" placeholder="למשל: סיימנו כינויי גוף, עכשיו עוברים לפועל להיות. לחזק כתיבה.">${esc(s.focus || "")}</textarea>
            <div class="adm-form-foot">
              <span class="adm-muted adm-small" id="admFocusStamp">${s.focusUpdatedAt ? `עודכן: ${esc(fmtDate(s.focusUpdatedAt))}` : ""}</span>
              <button type="submit" class="btn btn-primary btn-candy btn-sm">שמירה</button>
            </div>
          </form>

          <div class="adm-card">
            <h3 class="adm-h3">יומן הערות</h3>
            <form id="admNoteForm" class="adm-note-form">
              <textarea id="admNoteText" rows="3" placeholder="הערה על השיעור או על התלמיד…" required></textarea>
              <button type="submit" class="btn btn-primary btn-candy btn-sm">הוספת הערה</button>
            </form>
            <ul class="adm-notes" id="admNotes">${notesHtml(s)}</ul>
          </div>

          <form class="adm-card" id="admDetailsForm">
            <h3 class="adm-h3">פרטי התלמיד</h3>
            <label class="adm-field">
              <span>שם התלמיד</span>
              <input type="text" id="admName" maxlength="80" required value="${esc(s.name)}" />
            </label>
            <label class="adm-field">
              <span>כיתה / רמה</span>
              <input type="text" id="admGrade" maxlength="60" value="${esc(s.grade || "")}" placeholder="למשל: כיתה ד׳, מתחילים" />
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
        <div>
          <h3 class="adm-h3">הקישור האישי של ${esc(s.name)}</h3>
          <p class="adm-muted adm-small">שלחו לתלמיד את הקישור. הוא יראה בו את שיעורי הבית, וכל מה שיפתור יישמר בתיק הזה. אין צורך בהרשמה או בסיסמה.</p>
        </div>
      </div>
      <div class="adm-link-row">
        <input type="text" class="adm-link-input" id="admLinkInput" value="${esc(url)}" readonly dir="ltr" aria-label="הקישור האישי" />
        <div class="adm-link-actions">
          <button type="button" class="btn btn-primary btn-candy btn-sm adm-icon-label" id="admCopyLink">${ICONS.copy}<span>העתקה</span></button>
          <a class="btn btn-outline btn-candy btn-sm adm-icon-label adm-btn-white" href="${esc(whatsappUrl(s))}" target="_blank" rel="noopener">${ICONS.chat}<span>שליחה בוואטסאפ</span></a>
          <a class="btn btn-outline btn-candy btn-sm adm-icon-label adm-btn-white" href="${esc(url)}" target="_blank" rel="noopener">${ICONS.open}<span>תצוגה כמו התלמיד</span></a>
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
      <form class="adm-hw-form" id="admHwForm">
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

    const blocks = TOPICS.map((topic) => {
      const rows = (topic.exercises || []).map((ex) => ({ ex, rec: best[`${topic.id}/${ex.id}`] }));
      const done = rows.filter((r) => r.rec?.bestAt).length;
      const lessonSeen = opened.get(topic.id);
      const started = done || rows.some((r) => r.rec) || lessonSeen;
      return `
        <details class="adm-topic"${started ? " open" : ""}>
          <summary class="adm-topic-head">
            <span class="adm-topic-title">${esc(topic.title)}</span>
            <span class="adm-topic-count" dir="ltr">${done}/${rows.length}</span>
            ${meterHtml(done, rows.length, `${done} מתוך ${rows.length} תרגילים בנושא ${topic.title}`)}
          </summary>
          ${lessonSeen ? `<p class="adm-topic-lesson">השיעור נפתח לאחרונה: ${esc(fmtDate(lessonSeen))}</p>` : ""}
          <ul class="adm-ex-list">${rows.map(({ ex, rec }) => exerciseRowHtml(ex.title, ex.type, rec)).join("")}</ul>
        </details>`;
    });

    // Exercises recorded under ids that are no longer on the site.
    const known = topicExerciseKeys();
    const extra = Object.entries(best).filter(([key]) => !known.has(key));
    if (extra.length) {
      blocks.push(`
        <details class="adm-topic">
          <summary class="adm-topic-head"><span class="adm-topic-title">תרגילים שהוסרו מהאתר</span><span class="adm-topic-count">${extra.length}</span></summary>
          <ul class="adm-ex-list">${extra.map(([key, rec]) => exerciseRowHtml(rec.title || key, rec.type, rec)).join("")}</ul>
        </details>`);
    }
    return blocks.join("") || `<p class="adm-muted">אין נושאים באתר.</p>`;
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
          body: { name: $("#admName").value, grade: $("#admGrade").value },
        });
        Object.assign(current, { name: res.name, grade: res.grade });
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
