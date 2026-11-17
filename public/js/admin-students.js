/* Admin — student files (/admin/students). The teacher signs in with Google
   and sees only the files they opened. The teacher opens a file per student,
   assigns homework and sends the student's personal link; everything the
   student does through it shows up here. Exercise names and totals come from
   english-data.js.

   Routes (hash): ""        → all files
                  "#class"  → the class at a glance
                  "#report" → the weekly report
                  "#<id>"   → one student's file */

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const TOPICS = window.ENGLISH_TOPICS || [];
  const DAY_MS = 86400000;
  const HISTORY_PAGE = 40;
  const TREND_ROUNDS = 30;
  // The parents' link is off for now (and in server.js too).
  const PARENTS_ENABLED = false;

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
    speak: "דיבור",
    chat: "שיחה עם הבוט",
    lesson: "שיעור",
    test: "מבחן",
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
    share: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg>`,
    // A grown-up and a child: the parents' link.
    parents: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="5.5" r="2.8"/><path d="M3 21v-6.5A4 4 0 0 1 7 10.5h2a4 4 0 0 1 4 4V21"/><circle cx="17.5" cy="10" r="2.2"/><path d="M14.5 21v-4a3 3 0 0 1 3-3 3 3 0 0 1 3 3v4"/></svg>`,
  };
  ICONS.info = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="5.5" r="1.4" fill="currentColor" stroke-width="1.6"/><path d="M12 11v8.5"/></svg>`;
  ICONS.cross = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>`;
  ICONS.flag = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 21V4h12l-2.5 4L17 12H5"/></svg>`;
  ICONS.note = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/></svg>`;
  ICONS.plus = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>`;
  ICONS.phone = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/></svg>`;
  ICONS.map = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/></svg>`;
  ICONS.pencil = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="m13.5 6.5 4 4"/></svg>`;
  // One person: the student's details.
  ICONS.user = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/></svg>`;
  // A padlock: the student's sign-in turned off.
  ICONS.lock = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>`;
  ICONS.trend = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/></svg>`;
  ICONS.target = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>`;
  ICONS.clock = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`;
  ICONS.check = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>`;
  // Books on a shelf: the library the tasks are chosen from.
  ICONS.books = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="4.5" height="16" rx="1"/><rect x="9.5" y="4" width="4.5" height="16" rx="1"/><path d="m16.2 5.2 3.9-1 2.6 15.4-3.9 1z"/><path d="M3 20h19"/></svg>`;
  ICONS.calendar = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>`;

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

  function shareText(s) {
    return `שלום ${s.name}! זה הקישור האישי שלך למשימות באנגלית:\n${portalUrl(s)}`;
  }

  function whatsappUrl(s) {
    return `https://wa.me/?text=${encodeURIComponent(shareText(s))}`;
  }

  // The parents' page (/p/<key>): shows only, made from the file on request.
  function parentUrl(s) {
    return `${location.origin}/p/${encodeURIComponent(s.parentKey)}`;
  }

  function parentWhatsappUrl(s) {
    const text = `שלום! בקישור הזה אפשר לראות את ההתקדמות של ${s.name} באנגלית:\n${parentUrl(s)}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }

  // Full (non-retry) rounds only: a mistakes-only retry never sets a best score.
  function summarize(s) {
    const entries = Object.values(s.best || {}).filter((e) => e.bestAt);
    const avg = entries.length ? Math.round(entries.reduce((n, e) => n + pct(e.score, e.total), 0) / entries.length) : null;
    return { avg };
  }

  function homeworkStatus(hw) {
    if (hw.doneAt && hw.type === "lesson") return { done: true, html: pill("good", "צפה בשיעור") };
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
    "auth/operation-not-allowed": "שיטת ההתחברות הזו עוד לא הופעלה ב-Firebase",
    "auth/invalid-credential": "המייל או הסיסמה לא נכונים",
    "auth/invalid-login-credentials": "המייל או הסיסמה לא נכונים",
    "auth/wrong-password": "המייל או הסיסמה לא נכונים",
    "auth/user-not-found": "המייל הזה עוד לא רשום — לחצו \"פעם ראשונה? הרשמה\"",
    "auth/email-already-in-use": "המייל הזה כבר רשום — לחצו \"כבר נרשמתם? כניסה\"",
    "auth/weak-password": "הסיסמה קצרה מדי — לפחות 6 תווים",
    "auth/invalid-email": "כתובת המייל לא תקינה",
    "auth/missing-password": "כתבו סיסמה",
    "auth/too-many-requests": "יותר מדי ניסיונות — נסו שוב בעוד כמה דקות",
    "auth/user-disabled": "החשבון הזה חסום",
  };

  function showOnly(id) {
    ["admGate", "admListView", "admDetailView"].forEach((key) => $(`#${key}`).classList.toggle("hidden", key !== id));
  }

  function showGate(error = "", notice = "") {
    showOnly("admGate");
    const err = $("#admGateError");
    err.textContent = error;
    err.classList.toggle("hidden", !error);
    $("#admGateNote").textContent = notice;
    $("#admGateNote").classList.toggle("hidden", !notice);
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

  // Email + password, besides Google; "הרשמה" opens the account.
  let emailMode = "signin";

  function setEmailMode(mode) {
    emailMode = mode;
    const signup = mode === "signup";
    $("#admLoginName").classList.toggle("hidden", !signup);
    $("#admLoginPassword").setAttribute("autocomplete", signup ? "new-password" : "current-password");
    $("#admLoginSubmit").textContent = signup ? "הרשמה" : "כניסה";
    $("#admLoginMode").textContent = signup ? "כבר נרשמתם? כניסה" : "פעם ראשונה? הרשמה";
    $("#admLoginForgot").classList.toggle("hidden", signup);
  }

  async function emailSignIn(e) {
    e.preventDefault();
    const email = $("#admLoginEmail").value.trim();
    const password = $("#admLoginPassword").value;
    if (!email || !password) {
      showGate("כתבו מייל וסיסמה");
      return;
    }
    const btn = $("#admLoginSubmit");
    const label = btn.textContent;
    btn.disabled = true;
    btn.textContent = "מתחבר…";
    showGate();
    try {
      if (emailMode === "signup") {
        const { user } = await FirebaseApp.auth.createUserWithEmailAndPassword(email, password);
        const name = $("#admLoginName").value.trim();
        if (name) {
          await user.updateProfile({ displayName: name });
          // The auth listener already ran, before the name was set.
          if (account) {
            account.name = name;
            renderAccount();
          }
        }
      } else {
        // The auth listener in init() takes over once this resolves.
        await FirebaseApp.auth.signInWithEmailAndPassword(email, password);
      }
      $("#admEmailLogin").reset();
    } catch (err) {
      showGate(SIGN_IN_ERRORS[err?.code] || "ההתחברות נכשלה. נסו שוב");
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  }

  // Firebase answers the same for an email it doesn't know.
  async function resetPassword() {
    const email = $("#admLoginEmail").value.trim();
    if (!email) {
      showGate("כתבו קודם את המייל, ואז לחצו \"שכחתי סיסמה\"");
      $("#admLoginEmail").focus();
      return;
    }
    try {
      await FirebaseApp.auth.sendPasswordResetEmail(email);
      showGate("", `אם המייל ⁨${email}⁩ רשום, שלחנו אליו קישור לבחירת סיסמה חדשה.`);
    } catch (err) {
      showGate(SIGN_IN_ERRORS[err?.code] || "השליחה נכשלה. נסו שוב");
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
    map: { id: "admMap", title: "מפת ההתקדמות", info: ["המפה שהתלמיד רואה בקישור שלו.", "רואים אילו נושאים סיים, איפה הוא עכשיו ומה עוד לפניו.", "נפתחת בחלון חדש."] },
    trend: { id: "admTrend", title: "מגמת ציונים", info: ["הציון בכל סבב תרגול מלא, לפי הסדר.", `רואים את ${TREND_ROUNDS} הסבבים האחרונים.`] },
    review: { id: "admReview", title: "נקודות לחיזוק", info: ["השאלות שהתלמיד טעה בהן.", "שאלה יוצאת מהרשימה אחרי 3 תשובות נכונות ברצף."] },
    history: { id: "admHistory", title: "היסטוריית פעילות", info: ["כל מה שהתלמיד עשה דרך הקישור, מהחדש לישן."] },
    focus: { id: "admFocus", title: "איפה אנחנו עומדים", info: ["על מה עובדים עכשיו ומה השלב הבא.", "רק אתם רואים את זה."] },
    notes: { id: "admNotes", title: "יומן הערות", info: ["הערות שלכם על השיעורים ועל התלמיד.", "רק אתם רואים אותן."] },
    login: { id: "admLogin", title: "כניסה עם מייל", info: ["התלמיד נכנס עם המייל הזה בכל מכשיר, גם בלי הקישור.", `באתר: "התחברות", ואז "תלמיד".`] },
    renew: { id: "admRenew", title: "קישור חדש", info: ["כשהקישור נשלח בטעות למישהו אחר.", "הקישור הקודם יפסיק לעבוד, וצריך לשלוח לתלמיד את החדש."] },
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


  /* One card per student with their overall score. */

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

  // The card shows only the name and the overall score; the name link
  // stretches over the whole card.
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
      </div>`;
  }

  // One dialog for a solved exercise in the file and a row's "i".
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
        if (e.target.closest("[data-info-close]")) close();
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
      $(".adm-info-close", root).focus({ preventScroll: true });
    }

    // `restoreFocus` is false when the page moves to another view.
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
      if (account) view.innerHTML = `<p class="adm-error">${esc(e.message)}</p>`;
    }
  }

  function renderStudent() {
    const s = current;
    const view = $("#admDetailView");

    view.innerHTML = `
      <div class="adm-file-top">
        <div class="adm-file-tools">
          ${foldToggleHtml("admLinkToggle", "admLinkCard", ICONS.link, "הקישור האישי")}
          ${foldToggleHtml("admDetailsToggle", "admDetailsCard", ICONS.user, "פרטי התלמיד")}
          ${PARENTS_ENABLED ? foldToggleHtml("admParentToggle", "admParentCard", ICONS.parents, "קישור להורים") : ""}
        </div>
      </div>
      <p class="adm-blocked-note${s.blocked ? "" : " hidden"}" id="admBlockedNote">${ICONS.lock}<span>הכניסה של התלמיד מושבתת</span></p>
      <div class="adm-card adm-link-card hidden" id="admLinkCard">${linkCardHtml()}</div>
      ${PARENTS_ENABLED ? `<div class="adm-card adm-link-card hidden" id="admParentCard">${parentCardHtml(s)}</div>` : ""}
      <div class="adm-card hidden" id="admDetailsCard">
        <div class="adm-fold-head">
          <h3 class="adm-h3">פרטי התלמיד</h3>
          ${foldCloseHtml()}
        </div>
        <form id="admNameForm">
          <label class="adm-field">
            <span>שם התלמיד</span>
            <input type="text" id="admName" maxlength="80" required value="${esc(s.name)}" />
          </label>
          <div class="adm-form-foot">
            <span class="adm-muted adm-small">השם החדש יופיע גם בקישור של התלמיד</span>
            <button type="submit" class="btn btn-primary btn-candy btn-sm">שמירה</button>
          </div>
        </form>
        <div class="adm-access" id="admAccess">${accessHtml(s)}</div>
      </div>

      <!-- Up top: the links and the student at a glance; the tasks and the
           solved exercises come below. -->
      <h2 class="adm-h1 adm-solved-head">סיכום</h2>
      <div class="adm-tiles adm-file-summary" id="admFileSummary">${summaryHtml(s)}</div>

      <!-- The tasks the student sees on his link — the only thing there. -->
      <h2 class="adm-h1 adm-solved-head adm-file-section">משימות</h2>
      ${homeworkFormHtml(s)}
      <div id="admHomework">${homeworkListHtml(s)}</div>

      <!-- Tests: new questions from the topics the teacher picks, a grade
           at the end, and the student's requests for a retake. -->
      <h2 class="adm-h1 adm-solved-head adm-file-section">מבחנים</h2>
      ${testFormHtml()}
      <div id="admTests">${testListHtml(s)}</div>

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

          <!-- Signing in on the site instead of the link (the login dialog's
               "תלמיד"): the student's own email, Google or with a password. -->
          ${rowHtml("login", ICONS.chat)}
          <form class="adm-card adm-email-form hidden" id="admLoginCard">
            ${rowHeadHtml("login")}
            <label class="adm-field">
              <span>המייל של התלמיד</span>
              <input type="email" id="admEmail" maxlength="254" dir="ltr" placeholder="student@gmail.com" value="${esc(s.email || "")}" />
            </label>
            <p class="adm-muted adm-small">באתר: "התחברות", ואז "תלמיד".</p>
            <div class="adm-form-foot">
              <span></span>
              <button type="submit" class="btn btn-primary btn-candy btn-sm">שמירה</button>
            </div>
          </form>

          ${rowHtml("renew", ICONS.link)}
          <div class="adm-card adm-email-form hidden" id="admRenewCard">
            ${rowHeadHtml("renew")}
            <p class="adm-muted adm-small">הקישור הקודם יפסיק לעבוד.</p>
            <p class="adm-muted adm-small">ההתקדמות שנשמרה לא נמחקת.</p>
            <div class="adm-form-foot">
              <span></span>
              <button type="button" class="btn btn-primary btn-candy btn-sm" id="admNewKey">יצירת קישור חדש</button>
            </div>
          </div>
        </div>

        <button type="button" class="adm-danger-btn" id="admDeleteStudent">${ICONS.trash}<span>מחיקת התיק וכל הנתונים שבו</span></button>
      </details>`;

    bindStudent();
    drawTrend();
  }

  // "כניסה לחשבון" in the student's details: turned off, the link and the
  // email sign-in stop working until it's turned back on; the file stays.
  function accessHtml(s) {
    if (s.blocked) {
      return `
        <p class="adm-access-title">כניסה לחשבון</p>
        <p class="adm-access-state is-off">${ICONS.lock}<span>הכניסה מושבתת</span></p>
        <p class="adm-muted adm-small">התלמיד לא יכול להיכנס, לא עם הקישור ולא עם המייל.</p>
        <p class="adm-muted adm-small">ההתקדמות שלו שמורה.</p>
        <div class="adm-form-foot">
          <span></span>
          <button type="button" class="btn btn-primary btn-candy btn-sm" id="admAccessBtn">החזרת הכניסה</button>
        </div>`;
    }
    return `
      <p class="adm-access-title">כניסה לחשבון</p>
      <p class="adm-access-state">${ICONS.check}<span>התלמיד יכול להיכנס</span></p>
      <p class="adm-muted adm-small">אחרי השבתה, הקישור והמייל לא יעבדו.</p>
      <p class="adm-muted adm-small">ההתקדמות לא נמחקת, ואפשר להחזיר את הכניסה בכל רגע.</p>
      <button type="button" class="adm-danger-btn" id="admAccessBtn">${ICONS.lock}<span>השבתת כניסה</span></button>`;
  }

  // The student at a glance, right under the links.
  function summaryHtml(s) {
    const { avg } = summarize(s);
    const homework = s.homework || [];
    const done = homework.filter((hw) => hw.doneAt).length;
    // Day and month only, so the date fits a phone's half-width tile.
    const shortDate = (iso) => new Date(iso).toLocaleDateString("he-IL", { day: "numeric", month: "short" });
    const lastActive = s.lastActive && relTime(s.lastActive) === fmtDate(s.lastActive) ? shortDate(s.lastActive) : relTime(s.lastActive);
    return `
      ${tile("ציון ממוצע", avg == null ? "—" : `${avg}%`, avg == null ? "" : level(avg).label)}
      ${tile("זמן תרגול", esc(fmtDuration(s.counts?.practiceSec || 0)))}
      ${tile("משימות שבוצעו", homework.length ? `<span dir="ltr">${done}/${homework.length}</span>` : "—")}
      ${tile("פעילות אחרונה", s.lastActive ? esc(lastActive) : "—", s.lastActive ? `התיק נפתח: ${shortDate(s.createdAt)}` : "עוד לא נכנס לקישור")}`;
  }

  // Copy and share only; the email sign-in and a new link sit in "מתקדם".
  function linkCardHtml() {
    return `
      <div class="adm-link-head adm-link-head--solo">
        <span class="adm-link-icon">${ICONS.link}</span>
        <div class="adm-link-text">
          <h3 class="adm-h3">הקישור האישי</h3>
        </div>
        ${foldCloseHtml()}
      </div>
      <div class="adm-link-row">
        <div class="adm-link-actions">
          <button type="button" class="btn btn-primary btn-candy btn-sm adm-icon-label" id="admCopyLink">${ICONS.copy}<span>העתקה</span></button>
          <button type="button" class="btn btn-primary btn-candy btn-sm adm-icon-label" id="admShareLink">${ICONS.share}<span>שיתוף</span></button>
        </div>
      </div>`;
  }

  function parentCardHtml(s) {
    const head = `
      <div class="adm-link-head">
        <span class="adm-link-icon">${ICONS.parents}</span>
        <div class="adm-link-text">
          <h3 class="adm-h3">קישור להורים</h3>
          <p class="adm-muted adm-small">ההורים רואים בו מה ${esc(s.name)} עשה השבוע, את המשימות ואת הרצף באתגר היומי.</p>
          <p class="adm-muted adm-small">רק צפייה: ההערות שלכם והקישור של התלמיד לא מופיעים בו.</p>
        </div>
        ${foldCloseHtml()}
      </div>`;
    if (!s.parentKey) {
      return `${head}
        <button type="button" class="btn btn-primary btn-candy btn-sm adm-icon-label" id="admMakeParent">${ICONS.link}<span>יצירת קישור להורים</span></button>`;
    }
    const url = parentUrl(s);
    return `${head}
      <div class="adm-link-row">
        <input type="text" class="adm-link-input" id="admParentInput" value="${esc(url)}" readonly dir="ltr" aria-label="קישור להורים" />
        <div class="adm-link-actions">
          <button type="button" class="btn btn-primary btn-candy btn-sm adm-icon-label" id="admCopyParent">${ICONS.copy}<span>העתקה</span></button>
          <a class="btn btn-outline btn-candy btn-sm adm-icon-label" href="${esc(parentWhatsappUrl(s))}" target="_blank" rel="noopener">${ICONS.chat}<span>שליחה בוואטסאפ</span></a>
          <a class="btn btn-outline btn-candy btn-sm adm-icon-label" href="${esc(url)}" target="_blank" rel="noopener">${ICONS.open}<span>תצוגה כמו ההורים</span></a>
        </div>
      </div>
      <button type="button" class="adm-text-btn" id="admNewParent">הקישור נשלח בטעות? יצירת קישור חדש להורים</button>`;
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

  // The mixed practice as a task: questions from every exercise the student
  // solved (mixKeys). Null until they solved one.
  function mixTask(s) {
    const keys = mixKeys(s);
    if (!keys.length) return null;
    const topics = mixTopicCount(keys);
    return {
      topicId: "mix",
      exerciseId: "mix",
      topicTitle: "תרגול מעורב",
      exerciseTitle: topics === 1 ? "שאלות מעורבבות מנושא אחד" : `שאלות מעורבבות מ-${topics} נושאים`,
      type: "mix",
      items: keys,
    };
  }

  /* ── Choosing tasks from the library ──
     "בחירה מהספרייה" opens the English library the way the English page
     shows it: the path's stages with a numbered tile per topic, and inside a
     topic its lessons and exercises to tick. What's ticked waits in `picked`
     until the form adds it to the tasks. */

  const PATH = window.ENGLISH_PATH || [];
  const LESSONS_SRC = "/js/english-lessons.js?v=8";
  // "topicId/exerciseId" (or "mix") → the task the form sends.
  let picked = new Map();
  let lessonsLoading = null;

  function taskKey(task) {
    return task.topicId === "mix" ? "mix" : `${task.topicId}/${task.exerciseId}`;
  }

  // The short lessons' names are in english-lessons.js, which only the
  // library needs, so it loads the first time the library opens.
  function loadLessons() {
    if (window.ENGLISH_SHORT_LESSONS) return Promise.resolve();
    lessonsLoading ||= new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = LESSONS_SRC;
      script.onload = resolve;
      script.onerror = () => {
        lessonsLoading = null;
        resolve();
      };
      document.head.appendChild(script);
    });
    return lessonsLoading;
  }

  // A topic's slide lessons as tasks: "שיעור 2 – לא ושאלות" in a topic split
  // into numbered lessons, else "שיעור – <its name>". The student's link
  // opens the lesson (#<topic>/lesson-<id>) and the task is done once seen.
  function lessonTasks(topic) {
    const ids = topic.lessons || (topic.lesson ? [topic.lesson] : []);
    const short = window.ENGLISH_SHORT_LESSONS || [];
    return ids.map((id, i) => {
      const lesson = short.find((l) => l.id === id);
      const title =
        ids.length > 1
          ? lesson?.part ? `שיעור ${i + 1} – ${lesson.part}` : `שיעור ${i + 1}`
          : `שיעור – ${lesson?.name || topic.title}`;
      return { topicId: topic.id, exerciseId: `lesson-${id}`, topicTitle: topic.title, exerciseTitle: title, type: "lesson" };
    });
  }

  // Practice in level order, easiest first, as on the topic's page.
  function practiceLevel(ex) {
    return Math.min(3, Math.max(1, ex.level || window.ENGLISH_TYPE_LEVEL?.[ex.type] || 1));
  }

  function topicGroups(topic) {
    const task = (ex) => ({ topicId: topic.id, exerciseId: ex.id, topicTitle: topic.title, exerciseTitle: ex.title, type: ex.type });
    const exercises = topic.exercises || [];
    const byLevel = (a, b) => (a.level || 1) - (b.level || 1);
    return [
      { title: "שיעורים", tasks: lessonTasks(topic) },
      {
        title: "תרגילים",
        tasks: exercises
          .filter((ex) => ex.type !== "reading" && ex.type !== "exam")
          .sort((a, b) => practiceLevel(a) - practiceLevel(b))
          .map(task),
      },
      { title: "קטעי קריאה", tasks: exercises.filter((ex) => ex.type === "reading").sort(byLevel).map(task) },
      { title: "מבחנים", tasks: exercises.filter((ex) => ex.type === "exam").map(task) },
    ].filter((group) => group.tasks.length);
  }

  function pickedCountText(n) {
    if (!n) return "עוד לא נבחר כלום";
    return n === 1 ? "נבחרה משימה אחת" : `נבחרו ${n} משימות`;
  }

  const library = (() => {
    let root = null;
    let opener = null;
    // The tasks on screen, by key, for ticking them.
    let shown = new Map();
    let homeScroll = 0;
    let showing = 0;
    // The topic on screen, "" on the library itself.
    let at = "";
    // "tasks", or "test": a topic tile is picked as a whole (testPicked).
    let mode = "tasks";

    function build() {
      root = document.createElement("div");
      root.className = "adm-info adm-lib hidden";
      root.setAttribute("role", "dialog");
      root.setAttribute("aria-modal", "true");
      root.setAttribute("aria-labelledby", "admLibTitle");
      root.innerHTML = `
        <div class="adm-info-backdrop" data-lib-close></div>
        <div class="adm-info-card adm-lib-card">
          <div class="adm-info-head">
            <button type="button" class="adm-info-close adm-lib-back hidden" data-lib-home aria-label="חזרה לכל הנושאים" title="חזרה לכל הנושאים">${ICONS.chevron}</button>
            <h2 class="adm-info-title" id="admLibTitle"></h2>
            <button type="button" class="adm-info-close" data-lib-close aria-label="סגירה">${ICONS.cross}</button>
          </div>
          <div class="adm-lib-body"></div>
          <div class="adm-lib-foot">
            <span class="adm-lib-count" aria-live="polite"></span>
            <button type="button" class="btn btn-primary btn-candy btn-sm" data-lib-close>סיום</button>
          </div>
        </div>`;
      document.body.appendChild(root);
      root.addEventListener("click", onClick);
      document.addEventListener("keydown", (e) => {
        if (!isOpen()) return;
        if (e.key === "Escape") {
          e.preventDefault();
          close();
        } else if (e.key === "Tab") {
          // Keep keyboard focus inside the dialog.
          const items = $$("button", $(".adm-lib-card", root)).filter((el) => el.offsetParent);
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

    function onClick(e) {
      const el = e.target.closest("button, [data-lib-close]");
      if (!el) return;
      if (el.matches("[data-lib-close]")) close();
      else if (el.matches("[data-lib-home]")) show("");
      else if (el.dataset.libTopic && mode === "test") toggleTestTopic(el.dataset.libTopic);
      else if (el.dataset.libTopic) show(el.dataset.libTopic);
      else if (el.dataset.libItem) setPicked([el.dataset.libItem], !picked.has(el.dataset.libItem));
      else if (el.matches("[data-lib-all]")) {
        const keys = groupKeys(el);
        setPicked(keys, !keys.every((key) => picked.has(key)));
      }
    }

    function groupKeys(el) {
      return $$("[data-lib-item]", el.closest(".adm-lib-group")).map((item) => item.dataset.libItem);
    }

    function setPicked(keys, on) {
      keys.forEach((key) => (on ? picked.set(key, shown.get(key)) : picked.delete(key)));
      refresh();
    }

    function toggleTestTopic(topicId) {
      const topic = TOPICS.find((tp) => tp.id === topicId);
      if (!topic) return;
      if (testPicked.has(topicId)) testPicked.delete(topicId);
      else if (testPicked.size >= MAX_TEST_TOPICS) showToast(`אפשר לבחור עד ${MAX_TEST_TOPICS} נושאים למבחן אחד`);
      else testPicked.set(topicId, { id: topic.id, title: topic.title });
      refresh();
    }

    function refresh() {
      if (mode === "test") {
        $$("[data-lib-topic]", root).forEach((el) => {
          const on = testPicked.has(el.dataset.libTopic);
          el.classList.toggle("is-picked", on);
          el.setAttribute("aria-pressed", String(on));
          $(".adm-lib-tile-picked", el)?.classList.toggle("hidden", !on);
        });
        $(".adm-lib-count", root).textContent = testTopicsText(testPicked.size);
        return;
      }
      $$("[data-lib-item]", root).forEach((el) => {
        const on = picked.has(el.dataset.libItem);
        el.classList.toggle("is-picked", on);
        el.setAttribute("aria-pressed", String(on));
      });
      $$("[data-lib-all]", root).forEach((btn) => {
        btn.textContent = groupKeys(btn).every((key) => picked.has(key)) ? "ביטול הבחירה" : "בחירת הכל";
      });
      $(".adm-lib-count", root).textContent = pickedCountText(picked.size);
    }

    function itemHtml(task, title, sub = "") {
      const key = taskKey(task);
      shown.set(key, task);
      return `
        <button type="button" class="adm-lib-item" data-lib-item="${esc(key)}" aria-pressed="false">
          <span class="adm-lib-check" aria-hidden="true">${ICONS.check}</span>
          <span class="adm-lib-item-text">
            <span class="adm-lib-item-title"><bdi>${esc(title)}</bdi></span>
            ${sub ? `<span class="adm-lib-item-sub">${esc(sub)}</span>` : ""}
          </span>
        </button>`;
    }

    function groupHtml(title, body, allBtn = false) {
      return `
        <div class="adm-lib-group">
          <div class="adm-lib-group-head">
            <h3 class="adm-lib-heading">${title}</h3>
            ${allBtn ? `<button type="button" class="adm-lib-all" data-lib-all></button>` : ""}
          </div>
          ${body}
        </div>`;
    }

    // The library: the path's stages, a numbered tile per topic (numbered
    // over the whole path, like the English page).
    function homeHtml() {
      const testing = mode === "test";
      const mix = !testing && mixTask(current);
      const inPath = new Set(PATH.flatMap((stage) => stage.topics));
      const stages = PATH.map((stage, i) => ({
        title: `<span class="adm-lib-key">שלב ${i + 1}</span>${esc(stage.title)}`,
        topics: stage.topics.map((id) => TOPICS.find((tp) => tp.id === id)).filter(Boolean),
      }));
      const rest = TOPICS.filter((tp) => !inPath.has(tp.id));
      if (rest.length) stages.push({ title: `<span class="adm-lib-key">עוד נושאים</span>`, topics: rest });
      let num = 0;
      // A test's topic is picked right on its tile (only topics with test
      // questions); the numbers stay the path's.
      const testTile = (topic) => {
        num++;
        if (!TEST_BANK[topic.id]?.length) return "";
        return `
          <button type="button" class="adm-lib-tile" data-lib-topic="${esc(topic.id)}" aria-pressed="false">
            <span class="adm-lib-num" aria-hidden="true">${num}</span>
            <span class="adm-lib-tile-title">${esc(topic.title)}</span>
            ${topic.titleEn ? `<span class="adm-lib-tile-sub" dir="ltr">${esc(topic.titleEn)}</span>` : ""}
            <span class="adm-lib-tile-picked hidden">${ICONS.check}<span>נבחר</span></span>
          </button>`;
      };
      if (testing) return stages.map((stage) => groupHtml(stage.title, `<div class="adm-lib-tiles">${stage.topics.map(testTile).join("")}</div>`)).join("");
      const tile = (topic) => {
        const count = [...picked.values()].filter((task) => task.topicId === topic.id).length;
        return `
          <button type="button" class="adm-lib-tile${count ? " has-picked" : ""}" data-lib-topic="${esc(topic.id)}">
            <span class="adm-lib-num" aria-hidden="true">${++num}</span>
            <span class="adm-lib-tile-title">${esc(topic.title)}</span>
            ${topic.titleEn ? `<span class="adm-lib-tile-sub" dir="ltr">${esc(topic.titleEn)}</span>` : ""}
            ${count ? `<span class="adm-lib-tile-picked">${count === 1 ? "נבחרה 1" : `נבחרו ${count}`}</span>` : ""}
          </button>`;
      };
      return `
        ${mix ? groupHtml(`<span class="adm-lib-key">תרגול מעורב</span>`, `<div class="adm-lib-items">${itemHtml(mix, "תרגול מעורב", mix.exerciseTitle)}</div>`) : ""}
        ${stages.map((stage) => groupHtml(stage.title, `<div class="adm-lib-tiles">${stage.topics.map(tile).join("")}</div>`)).join("")}`;
    }

    function topicHtml(topic) {
      const groups = topicGroups(topic);
      if (!groups.length) return `<p class="adm-muted">בנושא הזה אין עדיין שיעורים או תרגילים.</p>`;
      return groups
        .map((group) => {
          const items = group.tasks
            .map((task) => itemHtml(task, task.exerciseTitle, group.title === "תרגילים" ? TYPE_LABELS[task.type] || "" : ""))
            .join("");
          return groupHtml(`<span class="adm-lib-key">${group.title}</span>`, `<div class="adm-lib-items">${items}</div>`, group.tasks.length > 1);
        })
        .join("");
    }

    async function show(topicId) {
      const token = ++showing;
      const body = $(".adm-lib-body", root);
      const topic = topicId && TOPICS.find((tp) => tp.id === topicId);
      const leaving = $(".adm-lib-tiles", body) ? body.scrollTop : null;
      if (topic) await loadLessons();
      if (token !== showing) return;
      if (leaving != null) homeScroll = leaving;
      const from = at;
      at = topic ? topic.id : "";
      shown = new Map();
      $("#admLibTitle").textContent = topic ? topic.title : mode === "test" ? "נושאי המבחן" : "הספרייה";
      $("[data-lib-home]", root).classList.toggle("hidden", !topic);
      body.innerHTML = topic ? topicHtml(topic) : homeHtml();
      body.scrollTop = topic ? 0 : homeScroll;
      refresh();
      // Back on the library, focus goes to the topic just left.
      const focusEl = topic ? $("[data-lib-home]", root) : from ? $(`[data-lib-topic="${CSS.escape(from)}"]`, body) : null;
      (focusEl || $("[data-lib-close]:not(.adm-info-backdrop)", root)).focus({ preventScroll: true });
    }

    function open(fromBtn, openMode = "tasks") {
      if (!root) build();
      opener = fromBtn;
      mode = openMode;
      homeScroll = 0;
      at = "";
      if (mode === "tasks") loadLessons();
      root.classList.remove("hidden");
      document.body.classList.add("adm-info-open");
      show("");
    }

    // `restoreFocus` is false when the page moves to another view.
    function close(restoreFocus = true) {
      if (!isOpen()) return;
      root.classList.add("hidden");
      document.body.classList.remove("adm-info-open");
      if (mode === "test") renderTestPicked();
      else renderPicked();
      if (restoreFocus && opener?.isConnected) opener.focus({ preventScroll: true });
    }

    function isOpen() {
      return !!root && !root.classList.contains("hidden");
    }

    return { open, close };
  })();

  // What's chosen, under the library button: one chip per topic.
  function renderPicked() {
    const list = $("#admHwChosen");
    if (!list) return;
    const byTopic = new Map();
    picked.forEach((task) => byTopic.set(task.topicId, [...(byTopic.get(task.topicId) || []), task]));
    list.innerHTML = [...byTopic.entries()]
      .map(([topicId, tasks]) => {
        const what = tasks.length === 1 ? tasks[0].exerciseTitle : `${tasks.length} משימות`;
        return `
          <li class="adm-hw-chip">
            <span class="adm-hw-chip-text"><b>${esc(tasks[0].topicTitle)}</b> · ${esc(what)}</span>
            <button type="button" class="adm-hw-chip-x" data-unpick="${esc(topicId)}" aria-label="הסרה: ${esc(tasks[0].topicTitle)}" title="הסרה">${ICONS.cross}</button>
          </li>`;
      })
      .join("");
    list.classList.toggle("hidden", !picked.size);
    $("#admLibOpenLabel").textContent = picked.size ? `${pickedCountText(picked.size)} · שינוי` : "בחירה מהספרייה";
  }

  function homeworkFormHtml() {
    return `
      ${foldToggleHtml("admHwToggle", "admHwForm", ICONS.plus, "הוספת משימה")}
      <form class="adm-hw-form hidden" id="admHwForm">
        <div class="adm-hw-form-head">
          <span class="adm-hw-form-title">הוספת משימה</span>
          ${foldCloseHtml()}
        </div>
        <button type="button" class="adm-lib-open" id="admLibOpen" aria-haspopup="dialog">
          <span class="adm-lib-open-icon">${ICONS.books}</span>
          <b id="admLibOpenLabel">בחירה מהספרייה</b>
          <small>נושא ותרגילים לתלמיד</small>
        </button>
        <ul class="adm-hw-chosen hidden" id="admHwChosen" aria-label="מה נבחר"></ul>
        <div class="adm-hw-extras">
          <button type="button" class="adm-hw-extra" data-hw-extra="admHwDueField" aria-expanded="false" aria-controls="admHwDueField">${ICONS.calendar}<span>תאריך</span></button>
          <button type="button" class="adm-hw-extra" data-hw-extra="admHwNoteField" aria-expanded="false" aria-controls="admHwNoteField">${ICONS.pencil}<span>הערה</span></button>
        </div>
        <label class="adm-field hidden" id="admHwDueField">
          <span>עד תאריך</span>
          <input type="date" id="admHwDue" min="${todayKey()}" />
        </label>
        <label class="adm-field hidden" id="admHwNoteField">
          <span>הערה לתלמיד</span>
          <input type="text" id="admHwNote" maxlength="300" placeholder="למשל: שימו לב להבדל בין is ל-are" />
        </label>
        <button type="submit" class="btn btn-primary btn-candy adm-hw-add">${ICONS.plus}<span>הוספה למשימות</span></button>
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
                    <button type="button" class="adm-icon-btn" data-copy-hw="${esc(hw.id)}" aria-label="העתקת קישור ישיר" title="העתקת קישור ישיר">${ICONS.link}</button>
                    <button type="button" class="adm-icon-btn" data-del-hw="${esc(hw.id)}" aria-label="הסרה מהמשימות" title="הסרה מהמשימות">${ICONS.trash}</button>
                  </span>
                </span>
              </li>`;
          })
          .join("")}
      </ul>`;
  }

  /* ── Tests: "שליחת מבחן" picks topics in the library (a tile is a whole
     topic) and sends a test with new questions from each
     (english-tests.js). Once the student hands it in, its rectangle shows
     the grade; the "i" shows each topic's grade and the wrong answers. A
     student's request for a retake waits on the rectangle until the
     teacher opens one or turns it down (lib/student-progress.js). ── */

  const TEST_BANK = window.ENGLISH_TESTS || {};
  const MAX_TEST_TOPICS = 8;
  // topicId → { id, title }, in the order they were picked.
  let testPicked = new Map();

  // The same rule as lib/student-progress.js testPerTopic.
  function testPerTopic(topics) {
    return topics === 1 ? 10 : topics === 2 ? 6 : topics === 3 ? 5 : topics === 4 ? 4 : 3;
  }

  function testTopicsText(n) {
    if (!n) return "עוד לא נבחר נושא";
    return n === 1 ? "נבחר נושא אחד" : `נבחרו ${n} נושאים`;
  }

  function testQuestionCount(topicIds, perTopic = testPerTopic(topicIds.length)) {
    return topicIds.reduce((n, id) => n + Math.min(perTopic, TEST_BANK[id]?.length || 0), 0);
  }

  function testIsOpen(test) {
    return (test.attempts || []).length < (test.allowed || 1);
  }

  function lastAttempt(test) {
    const list = test.attempts || [];
    return list[list.length - 1] || null;
  }

  // What's chosen, under the topics button: one chip per topic.
  function renderTestPicked() {
    const list = $("#admTestChosen");
    if (!list) return;
    list.innerHTML = [...testPicked.values()]
      .map(
        (tp) => `
          <li class="adm-hw-chip">
            <span class="adm-hw-chip-text"><b>${esc(tp.title)}</b></span>
            <button type="button" class="adm-hw-chip-x" data-unpick-test="${esc(tp.id)}" aria-label="הסרה: ${esc(tp.title)}" title="הסרה">${ICONS.cross}</button>
          </li>`
      )
      .join("");
    list.classList.toggle("hidden", !testPicked.size);
    $("#admTestLibLabel").textContent = testPicked.size ? `${testTopicsText(testPicked.size)} · שינוי` : "בחירת נושאים";
    const sum = $("#admTestSum");
    const count = testQuestionCount([...testPicked.keys()]);
    sum.textContent = count ? `${count} שאלות במבחן` : "";
    sum.classList.toggle("hidden", !count);
    $("#admTestTitle").placeholder = testPicked.size === 1 ? `מבחן: ${[...testPicked.values()][0].title}` : testPicked.size ? `מבחן ב־${testPicked.size} נושאים` : "מבחן";
  }

  function testFormHtml() {
    return `
      ${foldToggleHtml("admTestToggle", "admTestForm", ICONS.plus, "שליחת מבחן")}
      <form class="adm-hw-form hidden" id="admTestForm">
        <div class="adm-hw-form-head">
          <span class="adm-hw-form-title">שליחת מבחן</span>
          ${foldCloseHtml()}
        </div>
        <div class="adm-field adm-hw-pick">
          <span>נושאי המבחן</span>
          <button type="button" class="adm-lib-open" id="admTestLibOpen" aria-haspopup="dialog">
            <span class="adm-lib-open-icon">${ICONS.books}</span>
            <span id="admTestLibLabel">בחירת נושאים</span>
          </button>
        </div>
        <label class="adm-field adm-hw-due">
          <span>עד תאריך (לא חובה)</span>
          <input type="date" id="admTestDue" min="${todayKey()}" />
        </label>
        <ul class="adm-hw-chosen hidden" id="admTestChosen" aria-label="הנושאים שנבחרו"></ul>
        <p class="adm-test-sum hidden" id="admTestSum" aria-live="polite"></p>
        <p class="adm-test-about">השאלות במבחן חדשות — הן לא מופיעות בתרגולים.</p>
        <label class="adm-field adm-hw-note">
          <span>שם המבחן (לא חובה)</span>
          <input type="text" id="admTestTitle" maxlength="120" placeholder="מבחן" />
        </label>
        <label class="adm-field adm-hw-note">
          <span>הערה לתלמיד (לא חובה)</span>
          <input type="text" id="admTestNote" maxlength="300" placeholder="למשל: קראו כל שאלה עד הסוף. בהצלחה!" />
        </label>
        <button type="submit" class="btn btn-primary btn-candy btn-sm adm-hw-add">שליחת המבחן</button>
      </form>`;
  }

  function testStatus(test) {
    const last = lastAttempt(test);
    if (test.retakeAt) return { html: pill("low", "ביקש מבחן חוזר"), asked: true, done: !!last };
    if (testIsOpen(test) && last) return { html: pill("none", "מבחן חוזר פתוח") };
    if (last) {
      const p = pct(last.score, last.total);
      return { done: true, html: pill(level(p).cls, `ציון ${p}`) };
    }
    if (test.dueDate && test.dueDate < todayKey()) return { late: true, html: pill("low", "באיחור") };
    return { html: pill("none", "ממתין") };
  }

  // Requests for a retake first, then open tests (soonest due first), then
  // the handed-in ones, newest first.
  function sortedTests(list) {
    const key = (t) => (t.retakeAt ? 0 : testIsOpen(t) ? 1 : 2);
    return [...list].sort((a, b) => {
      if (key(a) !== key(b)) return key(a) - key(b);
      if (key(a) === 1) return (a.dueDate || "9999").localeCompare(b.dueDate || "9999") || a.assignedAt.localeCompare(b.assignedAt);
      return String(lastAttempt(b)?.at || b.retakeAt || "").localeCompare(String(lastAttempt(a)?.at || a.retakeAt || ""));
    });
  }

  function testTopicsLine(test) {
    const topics = test.topics || [];
    return topics.length <= 3 ? topics.map((tp) => tp.title).join(" · ") : `${topics.length} נושאים`;
  }

  function testListHtml(s) {
    const list = sortedTests(s.tests || []);
    if (!list.length) return "";
    return `
      <ul class="adm-solved adm-tasks">
        ${list
          .map((test) => {
            const status = testStatus(test);
            return `
              <li class="adm-solved-card adm-task adm-test${status.done ? " is-done" : ""}${status.late ? " is-late" : ""}${status.asked ? " is-asked" : ""}">
                <span class="adm-solved-topic">מבחן · ${esc(testTopicsLine(test))}</span>
                <span class="adm-solved-title">${esc(test.title)}</span>
                ${test.dueDate && testIsOpen(test) ? `<span class="adm-task-due">עד: ${esc(fmtDue(test.dueDate))}</span>` : ""}
                ${
                  status.asked
                    ? `<span class="adm-test-ask">
                        <button type="button" class="btn btn-primary btn-candy btn-sm" data-test-allow="${esc(test.id)}">אישור מבחן חוזר</button>
                        <button type="button" class="adm-text-btn" data-test-decline="${esc(test.id)}">לא עכשיו</button>
                      </span>`
                    : ""
                }
                <span class="adm-task-foot">
                  ${status.html}
                  <span class="adm-hw-actions">
                    <button type="button" class="adm-icon-btn" data-test-info="${esc(test.id)}" aria-haspopup="dialog" aria-label="פרטי המבחן" title="פרטי המבחן">${ICONS.info}</button>
                    <button type="button" class="adm-icon-btn" data-del-test="${esc(test.id)}" aria-label="מחיקת המבחן" title="מחיקת המבחן">${ICONS.trash}</button>
                  </span>
                </span>
              </li>`;
          })
          .join("")}
      </ul>`;
  }

  // Each hand-in: its grade, each topic's grade and the wrong answers (from
  // the activity it came with, while the file still has it).
  function attemptHtml(s, test, attempt, i) {
    const topics = (test.topics || [])
      .filter((tp) => attempt.byTopic?.[tp.id]?.total)
      .map((tp) => {
        const r = attempt.byTopic[tp.id];
        return `<li class="adm-test-topic"><span>${esc(tp.title)}</span>${pill(level(pct(r.score, r.total)).cls, `<span dir="ltr">${r.score}/${r.total}</span>`)}</li>`;
      })
      .join("");
    const activity = (s.activity || []).find((a) => a.id === attempt.activityId);
    const mistakes = activity?.mistakes || [];
    const wrong = mistakes.length
      ? `<ul class="adm-round-list">${mistakes
          .map(
            (m) => `
            <li class="adm-round-mistake">
              ${m.prompt ? `<span class="adm-round-prompt" dir="auto">${esc(m.prompt)}</span>` : ""}
              <span class="adm-round-answer">${m.given ? `ענה: <strong class="adm-round-given" dir="auto">${esc(m.given)}</strong> · ` : ""}נכון: <strong dir="auto">${esc(m.answer)}</strong></span>
            </li>`
          )
          .join("")}</ul>`
      : attempt.score >= attempt.total
        ? `<p class="adm-round-note">כל התשובות נכונות</p>`
        : `<p class="adm-round-note">התשובות של המבחן הזה כבר לא שמורות</p>`;
    return `
      <li class="adm-round">
        <div class="adm-round-head">
          <span class="adm-round-when">${i ? `מבחן חוזר ${i > 1 ? i : ""} · ` : ""}${esc(relTime(attempt.at))}</span>
          ${scorePill(attempt.score, attempt.total)}
        </div>
        ${topics && (test.topics || []).length > 1 ? `<ul class="adm-test-topics">${topics}</ul>` : ""}
        ${wrong}
      </li>`;
  }

  function testDialogHtml(s, testId) {
    const test = (s.tests || []).find((t) => t.id === testId);
    if (!test) return "";
    const attempts = test.attempts || [];
    const canReopen = attempts.length && !testIsOpen(test) && !test.retakeAt;
    return `
      <div class="adm-info-backdrop" data-info-close></div>
      <div class="adm-info-card">
        <div class="adm-info-head">
          <div class="adm-student-id">
            <h2 class="adm-info-title" id="admInfoTitle">${esc(test.title)}</h2>
            <span class="adm-student-sub">נשלח: ${esc(fmtDate(test.assignedAt))}${test.dueDate ? ` · עד: ${esc(fmtDue(test.dueDate))}` : ""}</span>
          </div>
          <button type="button" class="adm-info-close" data-info-close aria-label="סגירה">${ICONS.cross}</button>
        </div>
        <p class="adm-row-info"><b class="adm-test-key">נושאים</b> ${esc((test.topics || []).map((tp) => tp.title).join(" · "))}</p>
        <p class="adm-row-info"><b class="adm-test-key">שאלות</b> ${testQuestionCount((test.topics || []).map((tp) => tp.id), test.perTopic)}</p>
        ${test.note ? `<p class="adm-row-info"><b class="adm-test-key">הערה</b> ${esc(test.note)}</p>` : ""}
        ${
          attempts.length
            ? `<ul class="adm-rounds">${attempts.map((a, i) => attemptHtml(s, test, a, i)).reverse().join("")}</ul>`
            : `<p class="adm-card-empty">${testIsOpen(test) ? "התלמיד עוד לא הגיש את המבחן." : ""}</p>`
        }
        ${testIsOpen(test) && attempts.length ? `<p class="adm-row-info">מבחן חוזר פתוח — מחכה שהתלמיד יגיש.</p>` : ""}
        ${canReopen ? `<button type="button" class="btn btn-outline btn-candy btn-sm adm-test-reopen" data-test-allow="${esc(test.id)}">פתיחת מבחן חוזר</button>` : ""}
      </div>`;
  }

  function bindTests() {
    const id = encodeURIComponent(current.id);
    bindFold($("#admTestToggle"), $("#admTestForm"), "#admTestLibOpen");
    // A new file starts with no topic chosen.
    testPicked = new Map();
    const redraw = () => {
      $("#admTests").innerHTML = testListHtml(current);
    };
    const answer = (button, testId, allow) =>
      withBusy(button, async () => {
        const res = await api(`/api/admin/students/${id}/tests/${encodeURIComponent(testId)}/retake`, { method: "POST", body: { allow } });
        current.tests = res.tests;
        syncListEntry();
        redraw();
        infoDialog.close();
        showToast(allow ? "המבחן החוזר נפתח — התלמיד יכול לגשת אליו מהקישור" : "הבקשה נדחתה. התלמיד יכול לבקש שוב");
      });

    $("#admTestLibOpen").addEventListener("click", (e) => library.open(e.currentTarget, "test"));
    $("#admTestChosen").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-unpick-test]");
      if (!btn) return;
      testPicked.delete(btn.dataset.unpickTest);
      renderTestPicked();
      $("#admTestLibOpen").focus();
    });

    $("#admTestForm").addEventListener("submit", (e) => {
      e.preventDefault();
      if (!testPicked.size) {
        showToast("בחרו קודם נושא אחד לפחות");
        return;
      }
      withBusy(e.submitter, async () => {
        const res = await api(`/api/admin/students/${id}/tests`, {
          method: "POST",
          body: { topics: [...testPicked.values()], title: $("#admTestTitle").value, dueDate: $("#admTestDue").value, note: $("#admTestNote").value },
        });
        current.tests = res.tests;
        syncListEntry();
        redraw();
        testPicked = new Map();
        renderTestPicked();
        $("#admTestTitle").value = "";
        $("#admTestNote").value = "";
        $("#admTestDue").value = "";
        showToast("המבחן נשלח — התלמיד יראה אותו בקישור שלו");
      });
    });

    $("#admTests").addEventListener("click", (e) => {
      const el = e.target.closest("[data-test-allow], [data-test-decline], [data-test-info], [data-del-test]");
      if (!el) return;
      if (el.dataset.testAllow) answer(el, el.dataset.testAllow, true);
      else if (el.dataset.testDecline) answer(el, el.dataset.testDecline, false);
      else if (el.dataset.testInfo) {
        infoDialog.open(testDialogHtml(current, el.dataset.testInfo), el);
        $(".adm-info:not(.adm-lib) [data-test-allow]")?.addEventListener("click", (ev) => answer(ev.currentTarget, ev.currentTarget.dataset.testAllow, true));
      } else if (confirm("למחוק את המבחן? הציונים שלו יימחקו מהתיק.")) {
        withBusy(el, async () => {
          const res = await api(`/api/admin/students/${id}/tests/${encodeURIComponent(el.dataset.delTest)}`, { method: "DELETE" });
          current.tests = res.tests;
          syncListEntry();
          redraw();
        });
      }
    });
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

  function bindLinkCard() {
    const id = encodeURIComponent(current.id);
    $("#admCopyLink").addEventListener("click", async () => {
      const url = portalUrl(current);
      // The card no longer shows the link, so a blocked copy offers it to copy by hand.
      if (await copyText(url)) showToast("הקישור הועתק — אפשר להדביק ולשלוח לתלמיד");
      else prompt("העתיקו את הקישור:", url);
    });
    // The phone's share sheet; a computer without one gets WhatsApp.
    $("#admShareLink").addEventListener("click", async () => {
      if (!navigator.share) {
        window.open(whatsappUrl(current), "_blank", "noopener");
        return;
      }
      try {
        await navigator.share({ text: shareText(current) });
      } catch (e) {
        if (e.name !== "AbortError") window.open(whatsappUrl(current), "_blank", "noopener");
      }
    });
    $("#admNewKey").addEventListener("click", (e) => {
      if (!confirm(`ליצור ל${current.name} קישור חדש? הקישור הקודם יפסיק לעבוד, וצריך יהיה לשלוח לתלמיד את החדש. ההתקדמות שנשמרה לא נמחקת.`)) return;
      withBusy(e.currentTarget, async () => {
        const { key } = await api(`/api/admin/students/${id}/key`, { method: "POST" });
        current.key = key;
        syncListEntry();
        showToast("נוצר קישור חדש — שלחו אותו לתלמיד");
      });
    });
    $("#admLoginCard").addEventListener("submit", (e) => {
      e.preventDefault();
      withBusy(e.submitter, async () => {
        const res = await api(`/api/admin/students/${id}`, { method: "PATCH", body: { email: $("#admEmail").value } });
        current.email = res.email;
        syncListEntry();
        $("#admEmail").value = res.email;
        showToast(res.email ? "נשמר — התלמיד יכול להיכנס עם המייל" : "המייל נמחק — התלמיד נכנס רק עם הקישור");
      });
    });
  }

  // Makes the parents' link (or a new one, `renew`) and redraws the card.
  function bindParentCard() {
    const id = encodeURIComponent(current.id);
    const make = (btn, renew) =>
      withBusy(btn, async () => {
        const { parentKey } = await api(`/api/admin/students/${id}/parent-key`, { method: "POST", body: { renew } });
        current.parentKey = parentKey;
        syncListEntry();
        $("#admParentCard").innerHTML = parentCardHtml(current);
        bindParentCard();
        showToast(renew ? "נוצר קישור חדש — הקודם כבר לא עובד" : "הקישור להורים מוכן");
        $("#admCopyParent")?.focus();
      });
    $("#admMakeParent")?.addEventListener("click", (e) => make(e.currentTarget, false));
    $("#admNewParent")?.addEventListener("click", (e) => {
      if (!confirm("ליצור קישור חדש להורים? הקישור הקודם יפסיק לעבוד.")) return;
      make(e.currentTarget, true);
    });
    $("#admCopyParent")?.addEventListener("click", async () => {
      if (await copyText(parentUrl(current))) {
        showToast("הקישור הועתק — אפשר להדביק ולשלוח להורים");
        return;
      }
      $("#admParentInput").focus();
      $("#admParentInput").select();
      showToast("הקישור מסומן — לחצו Ctrl+C כדי להעתיק");
    });
    $("#admParentInput")?.addEventListener("focus", (e) => e.target.select());
  }

  function bindStudent() {
    const id = encodeURIComponent(current.id);
    bindFold($("#admLinkToggle"), $("#admLinkCard"), "#admCopyLink");
    if (PARENTS_ENABLED) bindFold($("#admParentToggle"), $("#admParentCard"), "#admMakeParent, #admCopyParent");
    bindFold($("#admHwToggle"), $("#admHwForm"), "#admLibOpen");
    // The chart was drawn while folded, with no width to measure.
    bindFold($("#admTrendToggle"), $("#admTrendCard"), "[data-fold-close]", drawTrend);
    bindFold($("#admReviewToggle"), $("#admReviewCard"), "[data-fold-close]");
    bindFold($("#admHistoryToggle"), $("#admHistoryCard"), "[data-fold-close]");
    bindFold($("#admFocusToggle"), $("#admFocusCard"), "#admFocus");
    bindFold($("#admNotesToggle"), $("#admNotesCard"), "#admNoteText");
    bindFold($("#admDetailsToggle"), $("#admDetailsCard"), "#admName");
    bindFold($("#admLoginToggle"), $("#admLoginCard"), "#admEmail");
    bindFold($("#admRenewToggle"), $("#admRenewCard"), "#admNewKey");
    bindLinkCard();
    if (PARENTS_ENABLED) bindParentCard();
    $$("[data-solved]").forEach((btn) =>
      btn.addEventListener("click", () => infoDialog.open(solvedDialogHtml(current, btn.dataset.solved), btn))
    );
    $$("[data-row-info]").forEach((btn) =>
      btn.addEventListener("click", () => infoDialog.open(rowInfoHtml(btn.dataset.rowInfo), btn))
    );

    // The summary counts the tasks, so it's redrawn with the list.
    const redrawHomework = () => {
      $("#admHomework").innerHTML = homeworkListHtml(current);
      $("#admFileSummary").innerHTML = summaryHtml(current);
    };

    // A new file starts with nothing chosen.
    picked = new Map();
    $("#admLibOpen").addEventListener("click", (e) => library.open(e.currentTarget));
    $("#admHwChosen").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-unpick]");
      if (!btn) return;
      picked.forEach((task, key) => task.topicId === btn.dataset.unpick && picked.delete(key));
      renderPicked();
      $("#admLibOpen").focus();
    });
    // "תאריך" / "הערה" open their field; closing one empties it, so what's
    // hidden isn't sent.
    $$("[data-hw-extra]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const field = $(`#${btn.dataset.hwExtra}`);
        const input = $("input", field);
        const open = field.classList.toggle("hidden") === false;
        btn.setAttribute("aria-expanded", String(open));
        if (open) input.focus();
        else input.value = "";
      })
    );

    $("#admHwForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const items = [...picked.values()];
      if (!items.length) {
        showToast("בחרו קודם שיעור או תרגיל מהספרייה");
        return;
      }
      withBusy(e.submitter, async () => {
        const res = await api(`/api/admin/students/${id}/homework`, {
          method: "POST",
          body: { items, dueDate: $("#admHwDue").value, note: $("#admHwNote").value },
        });
        current.homework = res.homework;
        syncListEntry();
        redrawHomework();
        picked = new Map();
        renderPicked();
        $("#admHwNote").value = "";
        if (!res.added) showToast("המשימות האלה כבר ברשימה ועוד לא בוצעו");
        else showToast(res.skipped ? `נוספו ${res.added} משימות (${res.skipped} כבר היו ברשימה)` : res.added === 1 ? "המשימה נוספה" : `נוספו ${res.added} משימות`);
      });
    });

    $("#admHomework").addEventListener("click", async (e) => {
      const copyBtn = e.target.closest("[data-copy-hw]");
      const delBtn = e.target.closest("[data-del-hw]");
      if (copyBtn) {
        const hw = (current.homework || []).find((h) => h.id === copyBtn.dataset.copyHw);
        if (hw) showToast((await copyText(exerciseUrl(current, hw))) ? (hw.type === "lesson" ? "הקישור הישיר לשיעור הועתק" : "הקישור הישיר לתרגיל הועתק") : "לא הצלחנו להעתיק");
        return;
      }
      if (!delBtn || !confirm("להסיר את המשימה?")) return;
      withBusy(delBtn, async () => {
        const res = await api(`/api/admin/students/${id}/homework/${encodeURIComponent(delBtn.dataset.delHw)}`, { method: "DELETE" });
        current.homework = res.homework;
        syncListEntry();
        redrawHomework();
      });
    });

    bindTests();

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

    // On the box, so the button keeps working after it's redrawn.
    $("#admAccess").addEventListener("click", (e) => {
      const btn = e.target.closest("#admAccessBtn");
      if (!btn) return;
      const blocked = !current.blocked;
      if (blocked && !confirm(`להשבית ל${current.name} את הכניסה? הקישור והמייל יפסיקו לעבוד עד שתחזירו אותה. ההתקדמות לא נמחקת.`)) return;
      withBusy(btn, async () => {
        const res = await api(`/api/admin/students/${id}`, { method: "PATCH", body: { blocked } });
        current.blocked = res.blocked;
        syncListEntry();
        $("#admAccess").innerHTML = accessHtml(current);
        $("#admBlockedNote").classList.toggle("hidden", !current.blocked);
        $("#admAccessBtn").focus();
        showToast(res.blocked ? "הכניסה הושבתה" : "הכניסה הוחזרה — התלמיד יכול להיכנס");
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
      if (account) view.innerHTML = `<p class="adm-error">${esc(e.message)}</p>`;
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

  /* ── The class at a glance (#class): from everything the students
     practiced so far — a rectangle per topic with the class's average in
     it (hardest first), opening who practiced it and how they did, and the
     questions the students still get wrong. ── */

  const CLASS_MISTAKES = 10;
  const CLASS_TOPIC_MISTAKES = 5;

  let classData = null;

  async function loadClass() {
    showOnly("admDetailView");
    const view = $("#admDetailView");
    view.innerHTML = `<p class="adm-loading">טוען את הכיתה…</p>`;
    try {
      classData = (await api("/api/admin/students/class")).class;
      renderClass();
    } catch (e) {
      if (account) view.innerHTML = `<p class="adm-error">${esc(e.message)}</p>`;
    }
  }

  function classTopicTitle(topic) {
    return TOPIC_TITLES.get(topic.id) || topic.title || topic.id;
  }

  function studentsText(n) {
    return n === 1 ? "תלמיד אחד" : `${n} תלמידים`;
  }

  function renderClass() {
    const c = classData;
    const t = c.totals;
    const view = $("#admDetailView");
    if (!t.students) {
      view.innerHTML = `
        <div class="adm-page-head"><h2 class="adm-h1">דוח הכיתה</h2></div>
        <p class="adm-muted adm-report-none">עוד אין תלמידים ברשימה. הוסיפו תלמידים, והעמוד יתמלא כשיתרגלו.</p>`;
      return;
    }
    view.innerHTML = `
      <div class="adm-file-top">
        <div class="adm-file-tools">
          <a class="adm-fold-toggle" href="#report">
            <span class="adm-fold-icon">${ICONS.clock}</span>
            <span>הדוח השבועי</span>
          </a>
        </div>
      </div>
      <h2 class="adm-h1 adm-solved-head">דוח הכיתה</h2>
      <div class="adm-tiles adm-file-summary">
        ${tile("תרגלו", `<span dir="ltr">${t.practiced}/${t.students}</span>`, "תלמידים")}
        ${tile("ציון ממוצע", t.average == null ? "—" : `${t.average}%`, t.average == null ? "" : level(t.average).label)}
        ${tile("זמן תרגול", esc(fmtDuration(t.practiceSec)), "של כל הכיתה")}
        ${tile("נושאים", fmtNum(c.topics.length), "שתורגלו")}
      </div>

      <h2 class="adm-h1 adm-solved-head adm-file-section">נושאים</h2>
      ${
        c.topics.length
          ? `<p class="adm-muted adm-class-lead">הנושא הכי קשה לכיתה — ראשון.</p>
             <p class="adm-muted adm-class-lead">לחיצה על נושא מראה כל תלמיד.</p>
             <div class="adm-solved adm-class-topics" id="admClassTopics">${c.topics.map(classTopicCardHtml).join("")}</div>`
          : `<p class="adm-muted">עוד לא תרגלו. כשהתלמידים יפתרו תרגילים בקישור שלהם, הנושאים יופיעו כאן.</p>`
      }

      <h2 class="adm-h1 adm-solved-head adm-file-section">טעויות נפוצות</h2>
      ${
        c.mistakes.length
          ? `<p class="adm-muted adm-class-lead">שאלות שהתלמידים עדיין טועים בהן.</p>
             <p class="adm-muted adm-class-lead">כדאי לעבור עליהן בכיתה.</p>
             ${classMistakesHtml(c.mistakes.slice(0, CLASS_MISTAKES))}`
          : `<p class="adm-muted">אין כרגע שאלות שהתלמידים טועים בהן.</p>`
      }`;

    $("#admClassTopics")?.addEventListener("click", (e) => {
      const card = e.target.closest("[data-class-topic]");
      if (card) infoDialog.open(classTopicDialogHtml(card.dataset.classTopic), card);
    });
  }

  // One thin line: the topic and the class's average. Who practiced it is in its window.
  function classTopicCardHtml(topic) {
    const lv = level(topic.average);
    return `
      <button type="button" class="adm-solved-card adm-class-topic" data-class-topic="${esc(topic.id)}" aria-haspopup="dialog">
        <span class="adm-solved-title">${esc(classTopicTitle(topic))}</span>
        ${pill(lv.cls, `${topic.average}% · ${lv.label}`)}
      </button>`;
  }

  // Who still gets each question wrong: their names while they fit a line.
  function classMistakesHtml(list) {
    const names = new Map(classData.students.map((s) => [s.id, s.name]));
    return `
      <ul class="adm-weak adm-class-weak">
        ${list
          .map((m) => {
            const who = m.students.length <= 3 ? `: ${m.students.map((id) => names.get(id)).join(", ")}` : "";
            return `
          <li class="adm-weak-item">
            <span class="adm-weak-count" title="${esc(studentsText(m.students.length))}">${m.students.length}</span>
            <span class="adm-weak-text">
              ${m.prompt ? `<span class="adm-weak-prompt" dir="auto">${esc(m.prompt)}</span>` : ""}
              <span class="adm-weak-answer">תשובה נכונה: <strong dir="auto">${esc(m.answer)}</strong></span>
              <span class="adm-weak-from">${esc(`${TOPIC_TITLES.get(m.topicId) || m.topicTitle} · ${m.exerciseTitle}`)}</span>
              <span class="adm-weak-from">${esc(`טועים בה ${studentsText(m.students.length)}${who}`)}</span>
            </span>
          </li>`;
          })
          .join("")}
      </ul>`;
  }

  function classTopicDialogHtml(topicId) {
    const c = classData;
    const topic = c.topics.find((tp) => tp.id === topicId);
    if (!topic) return "";
    const byId = new Map(c.students.map((s) => [s.id, s]));
    const done = new Set(topic.students.map((s) => s.id));
    const rows = [...topic.students]
      .sort((a, b) => a.average - b.average || byId.get(a.id).name.localeCompare(byId.get(b.id).name, "he"))
      .map((s) => {
        const lv = level(s.average);
        return `
          <li class="adm-ex">
            <span class="adm-ex-text">
              ${studentLinkHtml(byId.get(s.id))}
              <span class="adm-ex-meta">${s.exercises === 1 ? "תרגיל אחד" : `${s.exercises} תרגילים`}</span>
            </span>
            ${pill(lv.cls, `${s.average}% · ${lv.label}`)}
          </li>`;
      })
      .join("");
    const notYet = c.students.filter((s) => !done.has(s.id)).sort((a, b) => a.name.localeCompare(b.name, "he"));
    const mistakes = c.mistakes.filter((m) => m.topicId === topicId).slice(0, CLASS_TOPIC_MISTAKES);
    return `
      <div class="adm-info-backdrop" data-info-close></div>
      <div class="adm-info-card">
        <div class="adm-info-head">
          <div class="adm-student-id">
            <h2 class="adm-info-title" id="admInfoTitle">${esc(classTopicTitle(topic))}</h2>
            <span class="adm-student-sub">ממוצע הכיתה: ${topic.average}% · תרגלו: <span dir="ltr">${topic.students.length}/${c.totals.students}</span></span>
          </div>
          <button type="button" class="adm-info-close" data-info-close aria-label="סגירה">${ICONS.cross}</button>
        </div>
        <h3 class="adm-lib-heading"><b class="adm-lib-key">לפי תלמיד</b></h3>
        <ul class="adm-ex-list adm-report-rows adm-class-rows">${rows}</ul>
        ${
          notYet.length
            ? `<h3 class="adm-lib-heading"><b class="adm-lib-key">עוד לא תרגלו</b></h3>
               <ul class="adm-report-chips">${notYet.map((s) => `<li class="adm-report-chip adm-class-chip">${studentLinkHtml(s)}</li>`).join("")}</ul>`
            : ""
        }
        ${mistakes.length ? `<h3 class="adm-lib-heading"><b class="adm-lib-key">טעויות נפוצות</b></h3>${classMistakesHtml(mistakes)}` : ""}
      </div>`;
  }

  /* ── Routing ── */

  function route() {
    infoDialog.close(false);
    library.close(false);
    if (!account) {
      showGate(gateError);
      gateError = "";
      return;
    }
    const id = decodeURIComponent(location.hash.replace(/^#/, ""));
    const week = id.match(/^report(?:\/(\d{4}-\d{2}-\d{2}))?$/);
    if (week) loadReport(week[1]);
    else if (id === "class") loadClass();
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
      showGate("ההתחברות עדיין לא מוגדרת באתר (חסרות הגדרות Firebase)");
      return;
    }
    // The reset email in Hebrew.
    FirebaseApp.auth.languageCode = "he";
    $("#admGoogleBtn").disabled = false;
    $("#admGoogleBtn").addEventListener("click", signIn);
    $("#admLoginSubmit").disabled = false;
    $("#admEmailLogin").addEventListener("submit", emailSignIn);
    $("#admLoginMode").addEventListener("click", () => {
      showGate();
      setEmailMode(emailMode === "signup" ? "signin" : "signup");
    });
    $("#admLoginForgot").addEventListener("click", resetPassword);
    // The header's "חזרה" goes to the previous page; opened straight from a
    // link (no history), it falls back to the site.
    $("#admBack").addEventListener("click", (e) => {
      if (history.length > 1) {
        e.preventDefault();
        history.back();
      }
    });
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
