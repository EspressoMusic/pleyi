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
    mix: "תרגול מעורב",
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
  ICONS.info = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="5.5" r="1.4" fill="currentColor" stroke-width="1.6"/><path d="M12 11v8.5"/></svg>`;
  ICONS.cross = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>`;
  ICONS.chart = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M3 20h18M6 16v-4M11 16V6M16 16v-7"/></svg>`;
  ICONS.flag = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 21V4h12l-2.5 4L17 12H5"/></svg>`;
  ICONS.note = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/></svg>`;
  ICONS.plus = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>`;
  ICONS.phone = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/></svg>`;
  ICONS.map = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/></svg>`;
  ICONS.pencil = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="m13.5 6.5 4 4"/></svg>`;
  ICONS.trend = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/></svg>`;
  ICONS.target = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>`;
  ICONS.clock = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`;

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

  function portalUrl(s) {
    return `${location.origin}/s/${encodeURIComponent(s.key)}`;
  }

  function exerciseUrl(s, hw) {
    return `${location.origin}/services/english?s=${encodeURIComponent(s.key)}#${hw.topicId}/${hw.exerciseId}`;
  }

  function whatsappUrl(s) {
    const text = `שלום ${s.name}! זה הקישור האישי שלך למשימות באנגלית:\n${portalUrl(s)}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }

  // Full (non-retry) rounds only: a mistakes-only retry never sets a best score.
  function summarize(s) {
    const entries = Object.values(s.best || {}).filter((e) => e.bestAt);
    const avg = entries.length ? Math.round(entries.reduce((n, e) => n + pct(e.score, e.total), 0) / entries.length) : null;
    return { avg };
  }

  function homeworkStatus(hw) {
    if (hw.doneAt) {
      const p = pct(hw.score, hw.total);
      return { done: true, html: pill(level(p).cls, `בוצע · <span dir="ltr">${hw.score}/${hw.total}</span>`) };
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

  function setAccountMenu(open) {
    $("#admAccountMenu").classList.toggle("hidden", !open);
    $("#admAccountToggle").setAttribute("aria-expanded", open ? "true" : "false");
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

      <div class="adm-students adm-add-row">
        ${foldToggleHtml("admAddToggle", "admCreateForm", ICONS.plus, "הוספת תלמיד")}
      </div>

      <div class="adm-install" data-pwa-install>
        <button type="button" class="adm-fold-toggle" data-pwa-install-btn aria-expanded="false">
          <span class="adm-fold-icon">${ICONS.phone}</span>
          <span>התקנה כאפליקציה</span>
        </button>
        <div class="adm-card adm-install-help" data-pwa-help hidden></div>
      </div>

      <form class="adm-card adm-create hidden" id="admCreateForm">
        <div class="adm-fold-head">
          <h3 class="adm-h3">הוספת תלמיד</h3>
          ${foldCloseHtml()}
        </div>
        <div class="adm-create-row">
          <label class="adm-field">
            <span>שם התלמיד</span>
            <input type="text" id="admNewName" maxlength="80" required placeholder="למשל: יוסי כ." />
          </label>
          <button type="submit" class="btn btn-primary btn-candy adm-create-btn">הוספה</button>
        </div>
        <div class="adm-create-hints">
          <p class="adm-muted adm-small">מספיק שם פרטי ואות משם המשפחה. בלי מידע רגיש: בריאות, אבחונים או ת״ז</p>
          <p class="adm-muted adm-small">פתיחת תיק = אישור שיש לכם רשות מההורים או מבית הספר</p>
        </div>
      </form>

      ${students.length ? `<div class="adm-students">${students.map(studentCardHtml).join("")}</div>` : ""}`;

    bindFold($("#admAddToggle"), $("#admCreateForm"), "#admNewName");

    $("#admCreateForm").addEventListener("submit", (e) => {
      e.preventDefault();
      withBusy(e.submitter, async () => {
        const { student } = await api("/api/admin/students", {
          method: "POST",
          body: { name: $("#admNewName").value },
        });
        students = [student, ...students];
        showToast("התלמיד נוסף — עכשיו אפשר להוסיף משימות ולשלוח את הקישור");
        location.hash = encodeURIComponent(student.id);
      });
    });

    $$("[data-student-info]", view).forEach((btn) =>
      btn.addEventListener("click", () => {
        const s = students.find((st) => st.id === btn.dataset.studentInfo);
        if (s) openStudentInfo(s, btn);
      })
    );
  }

  // The card's "i" dialog; its pencil opens a small form to rename the student.
  function openStudentInfo(s, opener) {
    infoDialog.open(studentInfoHtml(s), opener);
    const card = $(".adm-info .adm-info-card");
    const form = $("[data-rename-form]", card);
    const input = $("input", form);
    const edit = $("[data-rename]", card);
    const setEditing = (on) => {
      form.classList.toggle("hidden", !on);
      edit.classList.toggle("hidden", on);
      if (on) input.select();
      (on ? input : edit).focus();
    };
    edit.addEventListener("click", () => setEditing(true));
    $("[data-rename-cancel]", form).addEventListener("click", () => {
      input.value = s.name;
      setEditing(false);
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      withBusy(e.submitter, async () => {
        const res = await api(`/api/admin/students/${encodeURIComponent(s.id)}`, { method: "PATCH", body: { name: input.value } });
        s.name = res.name;
        renderList();
        openStudentInfo(s, $(`[data-student-info="${CSS.escape(s.id)}"]`));
        showToast("השם נשמר");
      });
    });
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

  /* The rows behind "מתקדם": a title only, and an "i" that says what the
     row holds. Clicking a row opens its card in place (bindFold); the map
     row opens the student's map in a new tab instead. */

  const FILE_ROWS = {
    summary: { id: "admSummary", title: "סיכום", info: ["הציון הממוצע של התלמיד וכמה זמן תרגל.", "גם מתי נפתח התיק ומתי נכנס לאחרונה."] },
    map: { id: "admMap", title: "מפת ההתקדמות", info: ["המפה שהתלמיד רואה בקישור שלו.", "רואים אילו נושאים סיים, איפה הוא עכשיו ומה עוד לפניו.", "נפתחת בחלון חדש."] },
    trend: { id: "admTrend", title: "מגמת ציונים", info: ["הציון בכל סבב תרגול מלא, לפי הסדר.", `רואים את ${TREND_ROUNDS} הסבבים האחרונים.`] },
    review: { id: "admReview", title: "נקודות לחיזוק", info: ["השאלות שהתלמיד טעה בהן.", "שאלה יוצאת מהרשימה אחרי 3 תשובות נכונות ברצף."] },
    history: { id: "admHistory", title: "היסטוריית פעילות", info: ["כל מה שהתלמיד עשה דרך הקישור, מהחדש לישן."] },
    focus: { id: "admFocus", title: "איפה אנחנו עומדים", info: ["על מה עובדים עכשיו ומה השלב הבא.", "רק אתם רואים את זה."] },
    notes: { id: "admNotes", title: "יומן הערות", info: ["הערות שלכם על השיעורים ועל התלמיד.", "רק אתם רואים אותן."] },
  };

  function rowHtml(key, icon, href = "") {
    const row = FILE_ROWS[key];
    const inner = `<span class="adm-fold-icon">${icon}</span><span>${row.title}</span>`;
    return `
      <div class="adm-row">
        ${
          href
            ? `<a class="adm-row-btn" href="${esc(href)}" target="_blank" rel="noopener">${inner}</a>`
            : `<button type="button" class="adm-row-btn" id="${row.id}Toggle" aria-expanded="false" aria-controls="${row.id}Card">${inner}</button>`
        }
        <button type="button" class="adm-info-btn" data-row-info="${key}" aria-haspopup="dialog" aria-label="מה זה ${row.title}" title="מה זה">${ICONS.info}</button>
      </div>`;
  }

  function rowHeadHtml(key) {
    return `
      <div class="adm-fold-head">
        <h3 class="adm-h3">${FILE_ROWS[key].title}</h3>
        ${foldCloseHtml()}
      </div>`;
  }

  function rowInfoHtml(key) {
    const row = FILE_ROWS[key];
    return `
      <div class="adm-info-backdrop" data-info-close></div>
      <div class="adm-info-card">
        <div class="adm-info-head">
          <h2 class="adm-info-title" id="admInfoTitle">${row.title}</h2>
          <button type="button" class="adm-info-close" data-info-close aria-label="סגירה">${ICONS.cross}</button>
        </div>
        ${row.info.map((line) => `<p class="adm-row-info">${line}</p>`).join("")}
      </div>`;
  }

  // The listener sits on the panel itself, so a close button in content
  // that gets re-rendered (a new link) keeps working. A toggle inside a
  // row (rowHtml) hides the whole row, "i" included.
  function bindFold(toggle, panel, focusSel, onOpen) {
    const setOpen = (open) => {
      (toggle.closest(".adm-row") || toggle).classList.toggle("hidden", open);
      toggle.setAttribute("aria-expanded", String(open));
      panel.classList.toggle("hidden", !open);
      if (open) onOpen?.();
      (open ? $(focusSel, panel) : toggle).focus();
    };
    toggle.addEventListener("click", () => setOpen(true));
    panel.addEventListener("click", (e) => {
      if (e.target.closest("[data-fold-close]")) setOpen(false);
    });
  }


  /* One card per student with their overall score; its "i" dialog lists the
     exercises they solved and the mistakes still open in their review bank. */

  const CARD_EXERCISES = 5;
  const CARD_MISTAKES = 4;
  const EXERCISE_TITLES = new Map(TOPICS.flatMap((topic) => (topic.exercises || []).map((ex) => [`${topic.id}/${ex.id}`, ex.title])));
  const TOPIC_TITLES = new Map(TOPICS.map((topic) => [topic.id, topic.title]));

  // Full rounds only, most recently practiced first.
  function solvedExercises(s) {
    return Object.entries(s.best || {})
      .filter(([, e]) => e.bestAt)
      .sort(([, a], [, b]) => String(b.lastAt || b.bestAt).localeCompare(String(a.lastAt || a.bestAt)))
      .map(([key, e]) => ({
        key,
        title: EXERCISE_TITLES.get(key) || e.title || key,
        topicTitle: TOPIC_TITLES.get(key.split("/")[0]) || e.topicTitle || "",
        type: e.type,
        score: e.score,
        total: e.total,
      }));
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

  /* The card's "i" dialog: the student's last visit, the exercises they
     solved and the mistakes still open. */

  function studentInfoHtml(s) {
    const solved = solvedExercises(s);
    const mistakes = openMistakes(s);
    const sub = s.lastActive ? `פעילות אחרונה: ${relTime(s.lastActive)}` : "עוד לא נכנס לקישור";
    return `
      <div class="adm-info-backdrop" data-info-close></div>
      <div class="adm-info-card">
        <div class="adm-info-head">
          ${avatarHtml(s)}
          <div class="adm-student-id">
            <h2 class="adm-info-title" id="admInfoTitle">${esc(s.name)}</h2>
            <span class="adm-student-sub">${esc(sub)}</span>
          </div>
          <button type="button" class="adm-info-close" data-rename aria-label="עריכת שם" title="עריכת שם">${ICONS.pencil}</button>
          <button type="button" class="adm-info-close" data-info-close aria-label="סגירה">${ICONS.cross}</button>
        </div>

        <form class="adm-rename hidden" data-rename-form>
          <label class="adm-field">
            <span>שם התלמיד</span>
            <input type="text" maxlength="80" required value="${esc(s.name)}" />
          </label>
          <div class="adm-rename-actions">
            <button type="button" class="btn btn-outline btn-candy btn-sm" data-rename-cancel>ביטול</button>
            <button type="submit" class="btn btn-primary btn-candy btn-sm">שמירה</button>
          </div>
        </form>

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

  // One dialog for both the student card's "i" and a solved exercise in the file.
  const infoDialog = (() => {
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
          const items = $$("button, a[href], input", $(".adm-info-card", root)).filter((el) => el.offsetParent);
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

    function open(html, opener) {
      if (!root) build();
      lastFocus = opener;
      root.innerHTML = html;
      root.classList.remove("hidden");
      document.body.classList.add("adm-info-open");
      ($(".adm-info-go", root) || $(".adm-info-close", root)).focus({ preventScroll: true });
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
      if (account) view.innerHTML = `<a class="adm-back" href="#">חזרה</a><p class="adm-error">${esc(e.message)}</p>`;
    }
  }

  function renderStudent() {
    const s = current;
    const { avg } = summarize(s);
    const view = $("#admDetailView");

    view.innerHTML = `
      <div class="adm-file-top">
        <div class="adm-file-tools">
          ${foldToggleHtml("admLinkToggle", "admLinkCard", ICONS.link, "הקישור האישי")}
          ${foldToggleHtml("admDetailsToggle", "admDetailsCard", ICONS.pencil, "עריכת שם")}
        </div>
        <a class="adm-back" href="#">חזרה</a>
      </div>
      <div class="adm-card adm-link-card hidden" id="admLinkCard">${linkCardHtml(s)}</div>
      <form class="adm-card hidden" id="admDetailsCard">
        <div class="adm-fold-head">
          <h3 class="adm-h3">עריכת שם</h3>
          ${foldCloseHtml()}
        </div>
        <label class="adm-field">
          <span>שם התלמיד</span>
          <input type="text" id="admName" maxlength="80" required value="${esc(s.name)}" />
        </label>
        <div class="adm-form-foot">
          <span class="adm-muted adm-small">השם החדש יופיע גם בקישור של התלמיד</span>
          <button type="submit" class="btn btn-primary btn-candy btn-sm">שמירה</button>
        </div>
      </form>

      <!-- The tasks the student sees on his link — the only thing there. -->
      <h2 class="adm-h1 adm-solved-head">משימות</h2>
      ${homeworkFormHtml(s)}
      <div id="admHomework">${homeworkListHtml(s)}</div>

      <h2 class="adm-h1 adm-solved-head">תרגילים</h2>
      ${solvedGridHtml(s)}

      <!-- The rest of the file stays folded until the teacher asks for it:
           one row per part, each opening in place. -->
      <details class="adm-advanced" id="admAdvanced">
        <summary class="adm-fold-toggle">
          <span class="adm-fold-icon">${ICONS.plus}</span>
          <span>מתקדם</span>
        </summary>

        <div class="adm-rows">
          ${rowHtml("summary", ICONS.chart)}
          <div class="adm-card hidden" id="admSummaryCard">
            ${rowHeadHtml("summary")}
            <p class="adm-muted">התיק נפתח: ${esc(fmtDate(s.createdAt))} · ${s.lastActive ? `פעילות אחרונה: ${esc(relTime(s.lastActive))}` : "עוד לא נכנס לקישור"}</p>
            <div class="adm-tiles">
              ${tile("ציון ממוצע", avg == null ? "—" : `${avg}%`)}
              ${tile("זמן תרגול", esc(fmtDuration(s.counts?.practiceSec || 0)))}
            </div>
          </div>

          ${rowHtml("map", ICONS.map, `${portalUrl(s)}?view=teacher#map`)}

          ${rowHtml("trend", ICONS.trend)}
          <div class="adm-card hidden" id="admTrendCard">
            ${rowHeadHtml("trend")}
            ${trendHtml(s)}
          </div>

          ${rowHtml("review", ICONS.target)}
          <div class="adm-card hidden" id="admReviewCard">
            ${rowHeadHtml("review")}
            ${reviewBankHtml(s)}
          </div>

          ${rowHtml("history", ICONS.clock)}
          <div class="adm-card hidden" id="admHistoryCard">
            ${rowHeadHtml("history")}
            <div id="admHistory">${historyHtml(s)}</div>
          </div>

          ${rowHtml("focus", ICONS.flag)}
          <form class="adm-card hidden" id="admFocusCard">
            ${rowHeadHtml("focus")}
            <textarea id="admFocus" rows="5" placeholder="למשל: סיימנו כינויי גוף, עכשיו עוברים לפועל להיות. לחזק כתיבה.">${esc(s.focus || "")}</textarea>
            <div class="adm-form-foot">
              <span class="adm-muted adm-small" id="admFocusStamp">${s.focusUpdatedAt ? `עודכן: ${esc(fmtDate(s.focusUpdatedAt))}` : ""}</span>
              <button type="submit" class="btn btn-primary btn-candy btn-sm">שמירה</button>
            </div>
          </form>

          ${rowHtml("notes", ICONS.note)}
          <div class="adm-card hidden" id="admNotesCard">
            ${rowHeadHtml("notes")}
            <form id="admNoteForm" class="adm-note-form">
              <textarea id="admNoteText" rows="3" placeholder="הערה על השיעור או על התלמיד…" required></textarea>
              <button type="submit" class="btn btn-primary btn-candy btn-sm">הוספת הערה</button>
            </form>
            <ul class="adm-notes" id="admNotes">${notesHtml(s)}</ul>
          </div>
        </div>

        <button type="button" class="adm-danger-btn" id="admDeleteStudent">${ICONS.trash}<span>מחיקת התיק וכל הנתונים שבו</span></button>
      </details>`;

    bindStudent();
    drawTrend();
  }

  function linkCardHtml(s) {
    const url = portalUrl(s);
    return `
      <div class="adm-link-head">
        <span class="adm-link-icon">${ICONS.link}</span>
        <div class="adm-link-text">
          <h3 class="adm-h3">הקישור האישי</h3>
          <p class="adm-muted adm-small">שלחו לתלמיד את הקישור. הוא יראה בו את המשימות שתשאירו לו, וכל מה שיפתור יישמר בתיק הזה. אין צורך בהרשמה או בסיסמה.</p>
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

  /* The file's simple view: a rectangle per exercise the student solved.
     Clicking one opens his last rounds of it with every answer he got wrong
     (a round records only the wrong answers). */

  const SOLVED_ROUNDS = 3;

  function solvedGridHtml(s) {
    const solved = solvedExercises(s);
    if (!solved.length) return `<p class="adm-muted">עדיין אין פעילות</p>`;
    return `
      <div class="adm-solved">
        ${solved
          .map(
            (ex) => `
          <button type="button" class="adm-solved-card" data-solved="${esc(ex.key)}" aria-haspopup="dialog">
            <span class="adm-solved-topic">${esc(ex.topicTitle)}</span>
            <span class="adm-solved-title">${esc(ex.title)}</span>
            ${pill(level(pct(ex.score, ex.total)).cls, `<span dir="ltr">${ex.score}/${ex.total}</span>`)}
          </button>`
          )
          .join("")}
      </div>`;
  }

  // A mistakes retry that fixed its round: the round's score after the fix.
  function fixedNote(a) {
    return a.fixedTotal ? ` · הציון תוקן ל-<span dir="ltr">${a.fixedScore}/${a.fixedTotal}</span>` : "";
  }

  function roundHtml(a) {
    const mistakes = a.mistakes || [];
    let body;
    if (mistakes.length) {
      body = `
        <ul class="adm-round-list">
          ${mistakes
            .map(
              (m) => `
            <li class="adm-round-mistake">
              ${m.prompt ? `<span class="adm-round-prompt" dir="auto">${esc(m.prompt)}</span>` : ""}
              <span class="adm-round-answer">${m.given ? `ענה: <strong class="adm-round-given" dir="auto">${esc(m.given)}</strong> · ` : ""}נכון: <strong dir="auto">${esc(m.answer)}</strong></span>
            </li>`
            )
            .join("")}
        </ul>`;
    } else if (a.score >= a.total) {
      body = `<p class="adm-round-note">כל התשובות נכונות</p>`;
    } else {
      body = `<p class="adm-round-note">התשובות של הסבב הזה לא נשמרו</p>`;
    }
    return `
      <li class="adm-round">
        <div class="adm-round-head">
          <span class="adm-round-when">${esc(relTime(a.at))}${a.isRetry ? " · תרגול טעויות" : ""}${fixedNote(a)}</span>
          ${scorePill(a.score, a.total)}
        </div>
        ${body}
      </li>`;
  }

  function solvedDialogHtml(s, key) {
    const ex = solvedExercises(s).find((e) => e.key === key);
    if (!ex) return "";
    const rounds = (s.activity || []).filter((a) => a.kind === "exercise" && `${a.topicId}/${a.exerciseId}` === key);
    return `
      <div class="adm-info-backdrop" data-info-close></div>
      <div class="adm-info-card">
        <div class="adm-info-head">
          <div class="adm-student-id">
            <h2 class="adm-info-title" id="admInfoTitle">${esc(ex.title)}</h2>
            <span class="adm-student-sub">${esc([ex.topicTitle, TYPE_LABELS[ex.type] || ""].filter(Boolean).join(" · "))}</span>
          </div>
          <button type="button" class="adm-info-close" data-info-close aria-label="סגירה">${ICONS.cross}</button>
        </div>
        ${
          rounds.length
            ? `<ul class="adm-rounds">${rounds.slice(0, SOLVED_ROUNDS).map(roundHtml).join("")}</ul>
               ${rounds.length > SOLVED_ROUNDS ? `<p class="adm-card-more">ועוד ${rounds.length - SOLVED_ROUNDS} סבבים קודמים — בהיסטוריה שב"מתקדם"</p>` : ""}`
            : `<p class="adm-card-empty">הציון הכי טוב: <span dir="ltr">${ex.score}/${ex.total}</span>. פרטי התשובות כבר לא שמורים.</p>`
        }
      </div>`;
  }

  // The exercises a mixed practice can take questions from: the ones the
  // student solved, except passages and exams (their questions need the text).
  function mixKeys(s) {
    return solvedExercises(s)
      .map((ex) => ex.key)
      .filter((key) => {
        const [topicId, exerciseId] = key.split("/");
        const ex = TOPICS.find((tp) => tp.id === topicId)?.exercises?.find((e) => e.id === exerciseId);
        return ex && ex.type !== "reading" && ex.type !== "exam";
      });
  }

  function mixTopicCount(keys) {
    return new Set(keys.map((key) => key.split("/")[0])).size;
  }

  function homeworkFormHtml(s) {
    const mix = mixKeys(s);
    const mixTopics = mixTopicCount(mix);
    const mixOption = mix.length
      ? `<optgroup label="תרגול מעורב — שאלות מכל מה שפתר">
          <option value="mix">תרגול מעורב · ${mixTopics === 1 ? "נושא אחד" : `${mixTopics} נושאים`}</option>
        </optgroup>`
      : "";
    const groups = TOPICS.map((topic) => {
      const exercises = topic.exercises || [];
      return `
        <optgroup label="${esc(topic.title)}">
          ${exercises.length > 1 ? `<option value="topic:${esc(topic.id)}">כל הנושא — ${exercises.length} תרגילים</option>` : ""}
          ${exercises.map((ex) => `<option value="${esc(topic.id)}/${esc(ex.id)}">${esc(ex.title)} · ${esc(TYPE_LABELS[ex.type] || "")}</option>`).join("")}
        </optgroup>`;
    }).join("");
    return `
      ${foldToggleHtml("admHwToggle", "admHwForm", ICONS.plus, "הוספת משימה")}
      <form class="adm-hw-form hidden" id="admHwForm">
        <div class="adm-hw-form-head">
          <span class="adm-hw-form-title">הוספת משימה</span>
          ${foldCloseHtml()}
        </div>
        <label class="adm-field adm-hw-pick">
          <span>מה לתרגל</span>
          <select id="admHwPick" required>
            <option value="">בחרו תרגיל או נושא…</option>
            ${mixOption}
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
        <button type="submit" class="btn btn-primary btn-candy btn-sm adm-hw-add">הוספה למשימות</button>
      </form>`;
  }

  // A rectangle per task, like the solved exercises below it.
  function homeworkListHtml(s) {
    const list = sortedHomework(s.homework || []);
    if (!list.length) return "";
    const done = list.filter((hw) => hw.doneAt).length;
    return `
      <p class="adm-hw-summary"><span dir="ltr">${done}/${list.length}</span> בוצעו</p>
      <ul class="adm-solved adm-tasks">
        ${list
          .map((hw) => {
            const status = homeworkStatus(hw);
            return `
              <li class="adm-solved-card adm-task${status.done ? " is-done" : ""}${status.late ? " is-late" : ""}">
                <span class="adm-solved-topic">${esc(hw.topicTitle)}</span>
                <span class="adm-solved-title">${esc(hw.exerciseTitle)}</span>
                ${hw.dueDate ? `<span class="adm-task-due">עד: ${esc(fmtDue(hw.dueDate))}</span>` : ""}
                ${hw.note ? `<span class="adm-task-note">הערה: ${esc(hw.note)}</span>` : ""}
                <span class="adm-task-foot">
                  ${status.html}
                  <span class="adm-hw-actions">
                    <button type="button" class="adm-icon-btn" data-copy-hw="${esc(hw.id)}" aria-label="העתקת קישור ישיר לתרגיל" title="העתקת קישור ישיר לתרגיל">${ICONS.link}</button>
                    <button type="button" class="adm-icon-btn" data-del-hw="${esc(hw.id)}" aria-label="הסרה מהמשימות" title="הסרה מהמשימות">${ICONS.trash}</button>
                  </span>
                </span>
              </li>`;
          })
          .join("")}
      </ul>`;
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
            <span class="adm-act-meta">${esc(a.topicTitle)} · ${esc(TYPE_LABELS[a.type] || "")}${a.isRetry ? " · תרגול טעויות" : ""}${fixedNote(a)}${a.isNew ? " · תרגילים חדשים" : ""} · ${esc(fmtDuration(a.durationSec))} · ${time}</span>
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

  // Selected option → the exercises it stands for ("topic:<id>" is the whole
  // topic, "mix" one task with questions from everything the student solved).
  function pickedExercises(value) {
    if (value === "mix") {
      const keys = mixKeys(current);
      const topics = mixTopicCount(keys);
      if (!keys.length) return [];
      return [{
        topicId: "mix",
        exerciseId: "mix",
        topicTitle: "תרגול מעורב",
        exerciseTitle: topics === 1 ? "שאלות מעורבבות מנושא אחד" : `שאלות מעורבבות מ-${topics} נושאים`,
        type: "mix",
        items: keys,
      }];
    }
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
    bindFold($("#admSummaryToggle"), $("#admSummaryCard"), "[data-fold-close]");
    // The chart was drawn while folded, with no width to measure.
    bindFold($("#admTrendToggle"), $("#admTrendCard"), "[data-fold-close]", drawTrend);
    bindFold($("#admReviewToggle"), $("#admReviewCard"), "[data-fold-close]");
    bindFold($("#admHistoryToggle"), $("#admHistoryCard"), "[data-fold-close]");
    bindFold($("#admFocusToggle"), $("#admFocusCard"), "#admFocus");
    bindFold($("#admNotesToggle"), $("#admNotesCard"), "#admNoteText");
    bindFold($("#admDetailsToggle"), $("#admDetailsCard"), "#admName");
    bindLinkCard();
    $$("[data-solved]").forEach((btn) =>
      btn.addEventListener("click", () => infoDialog.open(solvedDialogHtml(current, btn.dataset.solved), btn))
    );
    $$("[data-row-info]").forEach((btn) =>
      btn.addEventListener("click", () => infoDialog.open(rowInfoHtml(btn.dataset.rowInfo), btn))
    );

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
        if (!res.added) showToast("התרגילים האלה כבר במשימות ועוד לא בוצעו");
        else showToast(res.skipped ? `נוספו ${res.added} תרגילים (${res.skipped} כבר היו ברשימה)` : res.added === 1 ? "התרגיל נוסף למשימות" : `נוספו ${res.added} תרגילים למשימות`);
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
      if (!delBtn || !confirm("להסיר את התרגיל מהמשימות?")) return;
      withBusy(delBtn, async () => {
        const res = await api(`/api/admin/students/${id}/homework/${encodeURIComponent(delBtn.dataset.delHw)}`, { method: "DELETE" });
        current.homework = res.homework;
        syncListEntry();
        $("#admHomework").innerHTML = homeworkListHtml(current);
      });
    });

    $("#admFocusCard").addEventListener("submit", (e) => {
      e.preventDefault();
      withBusy(e.submitter, async () => {
        const res = await api(`/api/admin/students/${id}`, { method: "PATCH", body: { focus: $("#admFocus").value } });
        Object.assign(current, { focus: res.focus, focusUpdatedAt: res.focusUpdatedAt });
        syncListEntry();
        $("#admFocusStamp").textContent = res.focusUpdatedAt ? `עודכן: ${fmtDate(res.focusUpdatedAt)}` : "";
        showToast("נשמר");
      });
    });

    $("#admDetailsCard").addEventListener("submit", (e) => {
      e.preventDefault();
      withBusy(e.submitter, async () => {
        const res = await api(`/api/admin/students/${id}`, {
          method: "PATCH",
          body: { name: $("#admName").value },
        });
        current.name = res.name;
        syncListEntry();
        renderStudent();
        showToast("השם נשמר");
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
      if (!confirm(`למחוק את התיק של ${current.name}, כולל כל ההתקדמות, המשימות וההערות? הקישור שלו יפסיק לעבוד, ואי אפשר לבטל את זה.`)) return;
      withBusy(e.currentTarget, async () => {
        await api(`/api/admin/students/${id}`, { method: "DELETE" });
        students = students.filter((s) => s.id !== current.id);
        current = null;
        showToast("התיק נמחק");
        location.hash = "";
      });
    });
  }

  /* ── Weekly report (#report, or #report/<Sunday> for an earlier week):
     who practiced, who got stuck and on what, and the class's topics and
     common mistakes. Weeks run Sunday to Saturday, like the points. ── */

  let report = null;

  // A week's Sunday (YYYY-MM-DD) moved by `weeks`.
  function shiftWeek(sunday, weeks) {
    const [y, m, d] = sunday.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d + weeks * 7)).toISOString().slice(0, 10);
  }

  // "25–31 באוקטובר", or "29 בספטמבר – 5 באוקטובר" across two months.
  function weekRange(sunday) {
    const [y, m, d] = sunday.split("-").map(Number);
    const start = new Date(y, m - 1, d);
    const end = new Date(y, m - 1, d + 6);
    const full = (date) => date.toLocaleDateString("he-IL", { day: "numeric", month: "long" });
    return start.getMonth() === end.getMonth() ? `${d}–${full(end)}` : `${full(start)} – ${full(end)}`;
  }

  function weekHash(sunday) {
    return sunday === report.current ? "#report" : `#report/${sunday}`;
  }

  async function loadReport(week) {
    showOnly("admDetailView");
    const view = $("#admDetailView");
    view.innerHTML = `<p class="adm-loading">טוען את הדוח…</p>`;
    try {
      report = (await api(`/api/admin/students/report${week ? `?week=${encodeURIComponent(week)}` : ""}`)).report;
      renderReport();
    } catch (e) {
      if (account) view.innerHTML = `<a class="adm-back" href="#">חזרה</a><p class="adm-error">${esc(e.message)}</p>`;
    }
  }

  function renderReport() {
    const r = report;
    const t = r.totals;
    const isCurrent = r.week === r.current;
    const next = isCurrent
      ? `<span class="adm-week-btn is-off" aria-hidden="true">${ICONS.chevron}</span>`
      : `<a class="adm-week-btn" href="${weekHash(shiftWeek(r.week, 1))}" aria-label="השבוע הבא" title="השבוע הבא">${ICONS.chevron}</a>`;
    $("#admDetailView").innerHTML = `
      <a class="adm-back" href="#">חזרה</a>
      <div class="adm-page-head">
        <h2 class="adm-h1">הדוח השבועי</h2>
      </div>
      <nav class="adm-week" aria-label="בחירת שבוע">
        <a class="adm-week-btn adm-week-btn--prev" href="${weekHash(shiftWeek(r.week, -1))}" aria-label="השבוע הקודם" title="השבוע הקודם">${ICONS.chevron}</a>
        <span class="adm-week-label">${isCurrent ? "השבוע · " : ""}${esc(weekRange(r.week))}</span>
        ${next}
      </nav>
      ${
        t.students
          ? `
        <div class="adm-tiles">
          ${tile("תרגלו", `<span dir="ltr">${t.practiced}/${t.students}</span>`, "תלמידים")}
          ${tile("זמן תרגול", esc(fmtDuration(t.practiceSec)), "של כל הכיתה")}
          ${tile("סבבי תרגול", fmtNum(t.rounds))}
          ${tile("ציון ממוצע", t.average == null ? "—" : `${t.average}%`)}
        </div>
        <div class="adm-report-grid">
          ${reportStuckHtml(r)}
          ${reportIdleHtml(r)}
          ${reportTopicsHtml(r)}
          ${reportMistakesHtml(r)}
          ${reportStudentsHtml(r)}
        </div>`
          : `<p class="adm-muted adm-report-none">עוד אין תלמידים ברשימה. הוסיפו תלמידים, והדוח יתמלא כשיתרגלו.</p>`
      }`;
  }

  function reportCard(title, count, lead, body, countLow = false) {
    return `
      <div class="adm-card">
        <h3 class="adm-h3 adm-report-title">${esc(title)}${count == null ? "" : ` <span class="adm-student-count${countLow ? " is-low" : ""}">${count}</span>`}</h3>
        ${lead ? `<p class="adm-muted adm-card-lead">${esc(lead)}</p>` : ""}
        ${body}
      </div>`;
  }

  function studentLinkHtml(s) {
    return `<a class="adm-report-name" href="#${encodeURIComponent(s.id)}">${esc(s.name)}</a>`;
  }

  function reportStuckHtml(r) {
    const stuck = r.students.filter((s) => s.stuck.length).sort((a, b) => b.stuck.length - a.stuck.length);
    const body = stuck.length
      ? `<ul class="adm-report-list">
          ${stuck
            .map(
              (s) => `
            <li class="adm-report-block">
              ${studentLinkHtml(s)}
              <ul class="adm-ex-list adm-report-rows">
                ${s.stuck
                  .map(
                    (ex) => `
                  <li class="adm-ex">
                    <span class="adm-ex-text">
                      <span class="adm-ex-title">${esc(ex.title)}</span>
                      <span class="adm-ex-meta">${esc(ex.topicTitle)}${ex.attempts > 1 ? ` · ${ex.attempts} ניסיונות` : ""}</span>
                    </span>
                    ${scorePill(ex.score, ex.total)}
                  </li>`
                  )
                  .join("")}
              </ul>
            </li>`
            )
            .join("")}
        </ul>`
      : `<p class="adm-card-empty">${r.totals.practiced ? `אף אחד לא נתקע — כל התרגילים מעל ${r.low}%.` : "עוד לא תרגלו בשבוע הזה."}</p>`;
    return reportCard("מי נתקע", stuck.length, `תרגילים שהציון הכי טוב בהם בשבוע הזה היה מתחת ל-${r.low}%.`, body, stuck.length > 0);
  }

  function reportIdleHtml(r) {
    const idle = r.students.filter((s) => !s.practiced).sort((a, b) => b.homeworkLate - a.homeworkLate || a.name.localeCompare(b.name, "he"));
    const body = idle.length
      ? `<ul class="adm-report-chips">
          ${idle
            .map(
              (s) => `
            <li class="adm-report-chip">
              ${studentLinkHtml(s)}
              ${s.homeworkLate ? pill("low", `משימות באיחור: ${s.homeworkLate === 1 ? "תרגיל אחד" : `${s.homeworkLate} תרגילים`}`) : ""}
            </li>`
            )
            .join("")}
        </ul>`
      : `<p class="adm-card-empty">כולם תרגלו בשבוע הזה.</p>`;
    return reportCard("לא תרגלו", idle.length, "", body, idle.length > 0);
  }

  function reportTopicsHtml(r) {
    const body = r.topics.length
      ? `<ul class="adm-ex-list adm-report-rows">
          ${r.topics
            .map((topic) => {
              const lv = level(topic.average);
              return `
            <li class="adm-ex">
              <span class="adm-ex-text">
                <span class="adm-ex-title">${esc(topic.title)}</span>
                <span class="adm-ex-meta">${topic.students === 1 ? "תלמיד אחד" : `${topic.students} תלמידים`} · ${topic.rounds === 1 ? "סבב אחד" : `${topic.rounds} סבבים`}</span>
              </span>
              ${pill(lv.cls, `${topic.average}% · ${lv.label}`)}
            </li>`;
            })
            .join("")}
        </ul>`
      : `<p class="adm-card-empty">לא תורגלו נושאים בשבוע הזה.</p>`;
    return reportCard("נושאים", null, r.topics.length > 1 ? "הנושא הכי קשה — למעלה." : "", body);
  }

  function reportMistakesHtml(r) {
    if (!r.mistakes.length) return reportCard("טעויות נפוצות", null, "", `<p class="adm-card-empty">אין טעויות רשומות בשבוע הזה.</p>`);
    const body = `
      <ul class="adm-weak">
        ${r.mistakes
          .map(
            (m) => `
          <li class="adm-weak-item">
            <span class="adm-weak-count">${m.times}×</span>
            <span class="adm-weak-text">
              ${m.prompt ? `<span class="adm-weak-prompt" dir="auto">${esc(m.prompt)}</span>` : ""}
              <span class="adm-weak-answer">תשובה נכונה: <strong dir="auto">${esc(m.answer)}</strong></span>
              <span class="adm-weak-from">${esc(m.topicTitle)} · ${esc(m.exerciseTitle)} · ${m.students === 1 ? "תלמיד אחד" : `${m.students} תלמידים`}</span>
            </span>
          </li>`
          )
          .join("")}
      </ul>`;
    return reportCard("טעויות נפוצות", null, "כדאי לעבור עליהן בכיתה.", body);
  }

  // Everyone, the busiest first; those who didn't practice at the end.
  function reportStudentsHtml(r) {
    const list = [...r.students].sort(
      (a, b) => Number(b.practiced) - Number(a.practiced) || b.practiceSec - a.practiceSec || b.rounds - a.rounds || a.name.localeCompare(b.name, "he")
    );
    const rows = list
      .map((s) => {
        const meta = s.practiced
          ? [
              s.days === 1 ? "יום אחד" : `${s.days} ימים`,
              s.rounds === 1 ? "סבב אחד" : `${s.rounds} סבבים`,
              s.practiceSec ? fmtDuration(s.practiceSec) : "",
              s.lessons + s.games ? `${s.lessons + s.games} שיעורים ומשחקים` : "",
              `${fmtNum(s.points)} נקודות`,
            ].filter(Boolean)
          : [];
        const status = !s.practiced
          ? pill("none", "לא תרגל")
          : s.average == null
            ? pill("none", "בלי ציון")
            : pill(level(s.average).cls, `${s.average}% · ${level(s.average).label}`);
        return `
          <li class="adm-ex${s.practiced ? "" : " is-untouched"}">
            <span class="adm-ex-text">
              ${studentLinkHtml(s)}
              ${meta.length ? `<span class="adm-ex-meta">${esc(meta.join(" · "))}</span>` : ""}
            </span>
            ${status}
          </li>`;
      })
      .join("");
    return reportCard("כל התלמידים", null, "", `<ul class="adm-ex-list adm-report-rows">${rows}</ul>`);
  }

  /* ── Routing ── */

  function route() {
    infoDialog.close(false);
    if (!account) {
      showGate(gateError);
      gateError = "";
      return;
    }
    const id = decodeURIComponent(location.hash.replace(/^#/, ""));
    const week = id.match(/^report(?:\/(\d{4}-\d{2}-\d{2}))?$/);
    if (week) loadReport(week[1]);
    else if (id) loadStudent(id);
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
    $("#admSignOut").addEventListener("click", () => {
      setAccountMenu(false);
      FirebaseApp.auth.signOut();
    });
    $("#admAccountToggle").addEventListener("click", () => {
      setAccountMenu($("#admAccountMenu").classList.contains("hidden"));
    });
    document.addEventListener("click", (e) => {
      if (!$("#admAccount").contains(e.target)) setAccountMenu(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setAccountMenu(false);
    });

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
