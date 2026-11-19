/* Personal room (/my-room) — "שלום" + a bell with the students' updates
   (a task done, a request for help), then one equal tile per category:
   students, recent activity, saved lessons and games. A tile opens its
   list in a dialog. */

(function () {
  const catalog = window.GAMES_CATALOG;
  const contentSection = document.getElementById("myRoomContent");

  const PREVIEW =
    location.hostname === "localhost" &&
    new URLSearchParams(location.search).get("preview") === "teacher";

  const GUEST_PREVIEW_USER = {
    uid: "guest-preview",
    name: "אורח (דוגמה)",
    email: "guest@preview.local",
    photoURL: null,
  };

  const HOUR = 3600000;
  const DAY = 86400000;

  const PREVIEW_SAVED = [
    {
      id: "preview-1",
      title: "אוצר מילים — יחידה 3",
      subject: "english",
      gameId: "word-memory",
      items: Array(12),
      starred: true,
      updatedAt: Date.now() - DAY,
      createdAt: Date.now() - 4 * DAY,
    },
  ];

  const PREVIEW_HISTORY = [
    {
      gameTitle: "מגדל מילים",
      gameId: "tower-stack",
      score: 840,
      isCustom: false,
      playedAt: Date.now() - 2 * DAY - 3 * HOUR,
    },
  ];

  const PREVIEW_STUDENTS = [
    {
      id: "preview-david",
      name: "דוד",
      createdAt: new Date(Date.now() - 6 * DAY).toISOString(),
      homework: [
        { exerciseTitle: "Present Simple — בחירה", assignedAt: new Date(Date.now() - DAY - 2 * HOUR).toISOString(), doneAt: new Date(Date.now() - 40 * 60000).toISOString(), score: 9, total: 10 },
        { exerciseTitle: "Present Simple — השלמה", assignedAt: new Date(Date.now() - DAY - 2 * HOUR).toISOString(), doneAt: null },
      ],
      help: [{ text: "לא הבנתי מתי מוסיפים s", at: new Date(Date.now() - 2 * HOUR).toISOString() }],
    },
    {
      id: "preview-yosef",
      name: "יוסף",
      createdAt: new Date(Date.now() - 6 * DAY).toISOString(),
      homework: [
        { exerciseTitle: "מילות שאלה", assignedAt: new Date(Date.now() - 3 * DAY).toISOString(), doneAt: new Date(Date.now() - DAY - 5 * HOUR).toISOString(), score: 7, total: 10 },
      ],
      help: [],
    },
  ];

  const PREVIEW_MY_LESSONS = [
    { id: "preview-lesson", subject: "english", title: "צבעים", createdAt: new Date(Date.now() - DAY).toISOString() },
  ];

  let savedGames = [];
  let playHistory = [];
  let savedLessons = [];
  let lessonHistory = [];
  let students = [];
  let myLessons = [];

  // Saved lessons are opened from the lessons library (?lesson= opens the slides).
  const LESSON_OPEN_PATH = "/services/ready-lessons";
  const RECENT_COUNT = 4;

  const ICONS = {
    lesson: '<path d="M4 5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2V5z"/><path d="M4 20a2 2 0 0 0 2 2h13v-4"/>',
    saved: '<path d="M6 3h12v18l-6-4-6 4V3z"/>',
    task: '<path d="M5 21V4"/><path d="M5 4h12l-2.5 4.5L17 13H5"/>',
    student: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    game: '<rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 11v3M5.5 12.5h3"/><path d="M16 11.5h.01M18 13.5h.01"/>',
    created: '<path d="M12 5v14M5 12h14"/>',
    done: '<path d="m5 12 5 5L20 7"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7"/><path d="M12 17h.01"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    chart: '<path d="M3 20h18M6 16v-4M11 16V6M16 16v-7"/>',
    heart: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20z"/>',
    create: '<path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/>',
    misc: '<rect x="4" y="4" width="6" height="6" rx="1.5"/><rect x="14" y="4" width="6" height="6" rx="1.5"/><rect x="4" y="14" width="6" height="6" rx="1.5"/><rect x="14" y="14" width="6" height="6" rx="1.5"/>',
  };

  function icon(name) {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
  }

  function lessonById(id) {
    const lessons = window.ReadyLessons;
    const lesson = lessons?.catalog?.[id];
    return lesson ? lessons.localize(lesson) : null;
  }

  function lessonTitle(lesson) {
    return lesson.namePart ? `${lesson.nameMain} – ${lesson.namePart}` : lesson.nameMain || lesson.name;
  }

  function lessonUrl(id) {
    return `${LESSON_OPEN_PATH}?lesson=${encodeURIComponent(id)}`;
  }

  function isGuestPreviewAllowed() {
    if (window.GameAuth?.isDevHost?.()) return true;
    const host = location.hostname;
    return (
      (host === "localhost" || host === "127.0.0.1") &&
      new URLSearchParams(location.search).get("guest") === "1"
    );
  }

  function usePreviewData() {
    return (
      PREVIEW ||
      window.GameAuth?.isDevPreviewUser?.() ||
      sessionStorage.getItem("pleyi-guest-preview") === "1"
    );
  }

  function showToast(msg) {
    const t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.remove("hidden");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => t.classList.add("hidden"), 2800);
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function subjectLabel(key) {
    return catalog?.subjects?.[key] || key;
  }

  function gameName(gameId) {
    const all = catalog?.allGamesList?.() || [...(catalog?.english || []), ...(catalog?.math || [])];
    return all.find((g) => g.id === gameId)?.title || gameId;
  }

  // Firestore timestamps, ISO strings and plain milliseconds alike.
  function ms(ts) {
    if (!ts) return 0;
    if (typeof ts === "number") return ts;
    if (typeof ts === "string") return Date.parse(ts) || 0;
    return ts.toMillis?.() || 0;
  }

  function dayStart(t) {
    const d = new Date(t);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }

  function dayLabel(t) {
    const days = Math.round((dayStart(Date.now()) - dayStart(t)) / DAY);
    if (days === 0) return "היום";
    if (days === 1) return "אתמול";
    return new Date(t).toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" });
  }

  function clock(t) {
    return new Date(t).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
  }

  function whenLabel(t) {
    const days = Math.round((dayStart(Date.now()) - dayStart(t)) / DAY);
    if (days <= 1) return `${dayLabel(t)}, ${clock(t)}`;
    return new Date(t).toLocaleDateString("he-IL", { day: "numeric", month: "short" });
  }

  /* ── My activity: lessons opened and saved, tasks given, students added,
     games played and created — newest first. ── */

  function myActivity() {
    const list = [];
    lessonHistory.forEach((e) => {
      const lesson = lessonById(e.id);
      if (lesson) list.push({ at: e.at, icon: "lesson", verb: "פתחתי את השיעור", title: lessonTitle(lesson), href: lessonUrl(e.id) });
    });
    savedLessons.forEach((e) => {
      const lesson = lessonById(e.lessonId);
      if (lesson && e.at) list.push({ at: e.at, icon: "saved", verb: "שמרתי את השיעור", title: lessonTitle(lesson), href: lessonUrl(e.lessonId) });
    });
    students.forEach((s) => {
      const href = `/admin/students#${encodeURIComponent(s.id)}`;
      if (s.createdAt) list.push({ at: ms(s.createdAt), icon: "student", verb: "פתחתי קובץ לתלמיד", title: s.name, href });
      // Exercises given together share their assignedAt — one line for them.
      const given = new Map();
      (s.homework || []).forEach((hw) => {
        if (hw.assignedAt) given.set(hw.assignedAt, [...(given.get(hw.assignedAt) || []), hw]);
      });
      given.forEach((tasks, at) => {
        list.push(
          tasks.length === 1
            ? { at: ms(at), icon: "task", verb: `נתתי משימה ל${s.name}:`, title: tasks[0].exerciseTitle, href }
            : { at: ms(at), icon: "task", verb: `נתתי ${tasks.length} משימות לתלמיד`, title: s.name, href }
        );
      });
    });
    playHistory.forEach((e) => {
      list.push({ at: ms(e.playedAt), icon: "game", verb: "שיחקתי במשחק", title: e.gameTitle, href: `/play/${encodeURIComponent(e.gameId)}` });
    });
    savedGames.forEach((g) => {
      if (g.createdAt) list.push({ at: ms(g.createdAt), icon: "created", verb: "יצרתי את המשחק", title: g.title });
    });
    return list.filter((e) => e.at).sort((a, b) => b.at - a.at);
  }

  function activityRowHtml(e, { time = whenLabel, extraClass = "" } = {}) {
    // <bdi>: an English exercise title doesn't jumble the Hebrew around it.
    const text = `<span class="room-act-verb">${escapeHtml(e.verb)}</span>${e.title ? ` <b><bdi>${escapeHtml(e.title)}</bdi></b>` : ""}${
      e.score ? ` <span class="room-act-score" dir="ltr">${escapeHtml(e.score)}</span>` : ""
    }`;
    return `
      <div class="room-act${extraClass}">
        <span class="room-act-icon">${icon(e.icon)}</span>
        ${e.href ? `<a class="room-act-text" href="${escapeHtml(e.href)}">${text}</a>` : `<span class="room-act-text">${text}</span>`}
        <span class="room-act-when">${escapeHtml(time(e.at))}</span>
      </div>`;
  }

  // The box shows lessons and games only, not students and tasks.
  const RECENT_KINDS = new Set(["lesson", "saved", "game", "created"]);

  function activityHtml() {
    const list = myActivity().filter((e) => RECENT_KINDS.has(e.icon)).slice(0, RECENT_COUNT);
    return list.length
      ? `<div class="room-inline-list">${list.map((e) => activityRowHtml(e)).join("")}</div>`
      : `<p class="room-box-empty">עדיין אין פעילות.<br>שיעור שפותחים מהספרייה יופיע כאן.<br><a href="${LESSON_OPEN_PATH}">לספריית השיעורים</a></p>`;
  }

  function dialogHtml(titleId, title, body) {
    return `
      <div class="room-dlg-body">
        <div class="room-dlg-head">
          <h2 class="room-dlg-title" id="${titleId}"><span class="room-key">${escapeHtml(title)}</span></h2>
          <button type="button" class="room-dlg-close" data-close aria-label="סגירה">${icon("close")}</button>
        </div>
        ${body}
      </div>`;
  }

  /* ── The bell: what the students did — a task done, a request for help
     ("צריך עזרה" on their page). Updates newer than the last time the bell
     was opened on this device are counted as new. ── */

  function seenKey() {
    return `pleyi-bell-seen-${currentUser?.uid || ""}`;
  }

  function bellSeenAt() {
    try {
      return Number(localStorage.getItem(seenKey())) || 0;
    } catch {
      return 0;
    }
  }

  function studentUpdates() {
    const list = [];
    students.forEach((s) => {
      const href = `/admin/students#${encodeURIComponent(s.id)}`;
      (s.homework || []).forEach((hw) => {
        if (!hw.doneAt) return;
        const score = hw.total ? `${hw.score}/${hw.total}` : "";
        list.push({ at: ms(hw.doneAt), icon: "done", who: s.name, verb: "סיים משימה", title: hw.exerciseTitle, score, href });
      });
      (s.help || []).forEach((h) => {
        list.push({ at: ms(h.at), icon: "help", who: s.name, verb: "ביקש עזרה", title: h.text ? `"${h.text}"` : "", href, help: true });
      });
      // A test handed in, and a request for a retake still waiting.
      (s.tests || []).forEach((test) => {
        (test.attempts || []).forEach((a) => {
          list.push({ at: ms(a.at), icon: "done", who: s.name, verb: "הגיש מבחן", title: test.title, score: a.total ? `${a.score}/${a.total}` : "", href });
        });
        if (test.retakeAt) list.push({ at: ms(test.retakeAt), icon: "help", who: s.name, verb: "ביקש מבחן חוזר", title: test.title, href, help: true });
      });
    });
    return list.filter((e) => e.at).sort((a, b) => b.at - a.at).slice(0, 40);
  }

  /* One update = its own small rectangle: who and what on top, the
     exercise underneath, the date and score on the side. */
  function bellNoteHtml(e, isNew) {
    return `
      <a class="room-note${isNew ? " is-new" : ""}${e.help ? " is-help" : ""}" href="${escapeHtml(e.href)}">
        <span class="room-act-icon">${icon(e.icon)}</span>
        <span class="room-note-main">
          <span class="room-note-line"><b><bdi>${escapeHtml(e.who)}</bdi></b> <span class="room-note-verb">${escapeHtml(e.verb)}</span></span>
          ${e.title ? `<span class="room-note-line room-note-title"><bdi>${escapeHtml(e.title)}</bdi></span>` : ""}
        </span>
        <span class="room-note-side">
          <span class="room-act-when">${isNew ? `<span class="room-note-dot" aria-label="חדש"></span>` : ""}${escapeHtml(whenLabel(e.at))}</span>
          ${e.score ? `<span class="room-act-score" dir="ltr">${escapeHtml(e.score)}</span>` : ""}
        </span>
      </a>`;
  }

  function renderBell() {
    const count = document.getElementById("roomBellCount");
    if (!count) return;
    const seen = bellSeenAt();
    const fresh = studentUpdates().filter((e) => e.at > seen).length;
    count.classList.toggle("hidden", !fresh);
    const bell = document.getElementById("roomBell");
    bell?.classList.toggle("has-new", !!fresh);
    bell?.setAttribute("aria-label", fresh ? `עדכונים מהתלמידים (${fresh} חדשים)` : "עדכונים מהתלמידים");
  }

  function openBell() {
    const dialog = document.getElementById("roomBellDlg");
    if (!dialog) return;
    const seen = bellSeenAt();
    const list = studentUpdates();
    const body = list.length
      ? `<div class="room-notes">${list.map((e) => bellNoteHtml(e, e.at > seen)).join("")}</div>`
      : `<p class="room-box-empty">אין עדכונים עדיין.<br>כשתלמיד יסיים משימה או יבקש עזרה, זה יופיע כאן.</p>`;
    dialog.innerHTML = dialogHtml("roomBellTitle", "עדכונים מהתלמידים", body);
    dialog.showModal();
    try {
      localStorage.setItem(seenKey(), String(Date.now()));
    } catch {
      /* ignore */
    }
    renderBell();
  }

  // A lesson being edited isn't closed by mistake with its changes unsaved.
  function mayClose(dialog) {
    return dialog.dataset.dirty !== "1" || confirm("לצאת בלי לשמור את השינויים?");
  }

  document.querySelectorAll(".room-dlg").forEach((dialog) => {
    // A tap on the dimmed page around the dialog, or on ×, closes it.
    dialog.addEventListener("click", (e) => {
      if ((e.target === dialog || e.target.closest("[data-close]")) && mayClose(dialog)) dialog.close();
    });
    dialog.addEventListener("cancel", (e) => {
      if (!mayClose(dialog)) e.preventDefault();
    });
  });
  document.getElementById("roomBell")?.addEventListener("click", openBell);

  /* ── Saved lessons and games ── */

  const TRASH_ICON_SVG =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>';

  function savedRowHtml(g, { showStar = true, showDelete = false } = {}) {
    const playLabel = window.I18n?.t("myRoom.play") || "שחק";
    const favLabel = window.I18n?.t("myRoom.favAria") || "מועדפים";
    const deleteLabel = window.I18n?.t("myRoom.deleteAria") || "מחק";
    return `
      <div class="room-list-row">
        <div class="room-list-info">
          <p class="room-list-title">${escapeHtml(g.title)}</p>
          <p class="room-list-meta">${escapeHtml(subjectLabel(g.subject))} · ${escapeHtml(gameName(g.gameId))}</p>
        </div>
        <div class="room-list-actions">
          ${
            showStar
              ? `<button type="button" class="room-list-star${g.starred ? " is-active" : ""}" data-star="${escapeHtml(g.id)}" aria-label="${escapeHtml(favLabel)}">${g.starred ? "★" : "☆"}</button>`
              : ""
          }
          <button type="button" class="room-list-play" data-play="${escapeHtml(g.id)}">${escapeHtml(playLabel)}</button>
          ${showDelete ? `<button type="button" class="room-list-delete" data-delete="${escapeHtml(g.id)}" aria-label="${escapeHtml(deleteLabel)}">${TRASH_ICON_SVG}</button>` : ""}
        </div>
      </div>`;
  }

  const REMOVE_ICON_SVG =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  function lessonRowHtml(id) {
    const lesson = lessonById(id);
    const subject = window.ReadyLessons.subjectLabels?.[lesson.subject] || "";
    return `
      <div class="room-list-row">
        <div class="room-list-info">
          <p class="room-list-title">${escapeHtml(lessonTitle(lesson))}</p>
          ${subject ? `<p class="room-list-meta">${escapeHtml(subject)}</p>` : ""}
        </div>
        <div class="room-list-actions">
          <a href="${lessonUrl(id)}" class="room-list-play">פתיחה</a>
          <button type="button" class="room-list-delete" data-unsave-lesson="${escapeHtml(id)}" aria-label="הסרה מהשמורים" title="הסרה מהשמורים">${REMOVE_ICON_SVG}</button>
        </div>
      </div>`;
  }

  const NO_LESSONS_HTML = `<p class="room-box-empty">עדיין לא שמרת שיעורים.<br>לשמירה לוחצים על סימן השמירה בחלון המידע של השיעור.<br><a href="${LESSON_OPEN_PATH}">לספריית השיעורים</a></p>`;

  function getSectionItems(section) {
    if (section === "lessons") return { type: "lessons", items: savedLessons.map((e) => e.lessonId).filter(lessonById) };
    if (section === "favorites") return { type: "saved", items: savedGames.filter((g) => g.starred) };
    return { type: "saved", items: savedGames };
  }

  function sectionHtml(section) {
    const { type, items } = getSectionItems(section);
    if (type === "lessons") {
      return items.length ? `<div class="room-inline-list">${items.map(lessonRowHtml).join("")}</div>` : NO_LESSONS_HTML;
    }
    const showDelete = section === "created";
    return `<div class="room-inline-list">${items.map((g) => savedRowHtml(g, { showStar: true, showDelete })).join("")}</div>`;
  }

  /* ── "יצירת שיעור": the teacher picks a subject and writes a topic, the AI
     writes a short slide lesson (lib/teacher-lessons.js). The lessons made
     are listed under the form; each opens in the lessons library's player
     and can be given to a student as a task from the student's file. ── */

  const CREATE_SUBJECTS = [
    ["english", "אנגלית"],
    ["math", "חשבון"],
    ["hebrew", "עברית"],
    ["science", "מדעים"],
    ["geography", "גאוגרפיה"],
    ["history", "היסטוריה"],
  ];

  async function myLessonsApi(method = "GET", path = "", body) {
    const token = await window.FirebaseApp?.auth?.currentUser?.getIdToken().catch(() => "");
    if (!token) throw new Error("צריך להתחבר כדי ליצור שיעור");
    const res = await fetch(`/api/my-lessons${path}`, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) throw new Error(data.error || "משהו השתבש — נסו שוב");
    return data;
  }

  async function getMyLessons() {
    const token = await window.FirebaseApp?.auth?.currentUser?.getIdToken().catch(() => "");
    if (!token) return [];
    return (await myLessonsApi()).lessons || [];
  }

  function myLessonRowHtml(lesson) {
    const subject = CREATE_SUBJECTS.find(([id]) => id === lesson.subject)?.[1] || "";
    return `
      <div class="room-note room-mine">
        <span class="room-act-icon">${icon("lesson")}</span>
        <span class="room-note-main">
          <span class="room-note-line room-note-title"><bdi>${escapeHtml(lesson.title)}</bdi></span>
          ${subject ? `<span class="room-note-line room-note-verb">${escapeHtml(subject)}</span>` : ""}
        </span>
        <a href="${LESSON_OPEN_PATH}?mylesson=${encodeURIComponent(lesson.id)}" class="room-list-play">פתיחה</a>
        <button type="button" class="room-list-play room-edit-open" data-edit-mylesson="${escapeHtml(lesson.id)}">עריכה</button>
        <button type="button" class="room-list-delete" data-delete-mylesson="${escapeHtml(lesson.id)}" aria-label="מחיקת השיעור" title="מחיקת השיעור">${TRASH_ICON_SVG}</button>
      </div>`;
  }

  function createHtml() {
    const subjects = CREATE_SUBJECTS.map(
      ([id, label], i) => `
        <label class="room-create-subject">
          <input type="radio" name="subject" value="${id}"${i === 0 ? " checked" : ""} />
          <span>${label}</span>
        </label>`
    ).join("");
    return `
      <form class="room-create" id="roomCreateForm">
        <p class="room-create-label"><span class="room-key">מקצוע</span></p>
        <div class="room-create-subjects">${subjects}</div>
        <label class="room-create-label" for="roomCreateTopic"><span class="room-key">על מה השיעור?</span></label>
        <input type="text" class="room-create-input" id="roomCreateTopic" name="topic" maxlength="200" required placeholder="למשל: צבעים, שברים, מחזור המים" />
        <button type="submit" class="room-create-go">יצירת שיעור</button>
        <p class="room-create-wait hidden" aria-live="polite">בונים את השיעור… זה לוקח עד דקה</p>
      </form>
      <h3 class="room-mine-head"><span class="room-key">השיעורים שלי</span></h3>
      <p class="room-edit-tip">אפשר גם לקחת שיעור מ<a href="${LESSON_OPEN_PATH}">ספריית השיעורים</a></p>
      <p class="room-edit-tip">בחלון ה־i של השיעור לוחצים על הכפתור הירוק</p>
      ${myLessons.length ? `<div class="room-notes">${myLessons.map(myLessonRowHtml).join("")}</div>` : ""}`;
  }

  function bindCreate(container) {
    const form = container.querySelector("#roomCreateForm");
    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const go = form.querySelector(".room-create-go");
      const wait = form.querySelector(".room-create-wait");
      go.disabled = true;
      wait.classList.remove("hidden");
      try {
        const data = await myLessonsApi("POST", "", { subject: form.elements.subject.value, topic: form.elements.topic.value });
        myLessons = [data.lesson, ...myLessons];
        openBox("create");
        showToast("השיעור מוכן!");
      } catch (err) {
        showToast(err.message);
        go.disabled = false;
        wait.classList.add("hidden");
      }
    });

    container.querySelectorAll("[data-edit-mylesson]").forEach((btn) => {
      btn.addEventListener("click", () => openEditor(btn.dataset.editMylesson));
    });

    container.querySelectorAll("[data-delete-mylesson]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm("למחוק את השיעור?")) return;
        try {
          await myLessonsApi("DELETE", `/${encodeURIComponent(btn.dataset.deleteMylesson)}`);
          myLessons = myLessons.filter((l) => l.id !== btn.dataset.deleteMylesson);
          openBox("create");
          showToast("השיעור נמחק");
        } catch (err) {
          showToast(err.message);
        }
      });
    });
  }

  /* ── Editing a lesson of the teacher's (one the AI wrote, or a copy of a
     site lesson): its name, each slide's text, slides added, moved or
     removed, and the class discussion questions. A slide's drawing or table
     from the site's lesson isn't edited here — the server keeps it. ── */

  const EDIT_TEXT_FIELDS = ["key", "title", "lines", "examples", "more"];

  function textLines(text) {
    return String(text || "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
  }

  // A "more" line can be an example card: [example, explanation] ↔ "a | b".
  function moreToText(more) {
    return (more || []).map((l) => (Array.isArray(l) ? `${l[0]} | ${l[1] || ""}`.trim() : l)).join("\n");
  }

  function textToMore(text) {
    return textLines(text).map((l) => {
      const card = /^(.+?)\s+\|\s*(.*)$/.exec(l);
      return card ? [card[1], card[2]] : l;
    });
  }

  function plainTitle(title) {
    return String(title || "").replace(/\*\*/g, "") || "שקופית חדשה";
  }

  function exampleRowHtml([a, b] = ["", ""]) {
    return `
      <div class="room-edit-ex">
        <input type="text" class="room-create-input" data-ex="a" maxlength="160" value="${escapeHtml(a)}" placeholder="דוגמה" />
        <input type="text" class="room-create-input" data-ex="b" maxlength="160" value="${escapeHtml(b)}" placeholder="הסבר" />
        <button type="button" class="room-list-delete" data-ex-remove aria-label="מחיקת הדוגמה" title="מחיקת הדוגמה">${REMOVE_ICON_SVG}</button>
      </div>`;
  }

  function slideEditHtml(slide, open = false) {
    const hasPicture = Object.keys(slide).some((k) => !EDIT_TEXT_FIELDS.includes(k));
    return `
      <details class="room-edit-slide" data-key="${escapeHtml(slide.key || "")}"${open ? " open" : ""}>
        <summary><span class="room-edit-num"></span><bdi class="room-edit-sum">${escapeHtml(plainTitle(slide.title))}</bdi></summary>
        <div class="room-edit-body">
          <label class="room-create-label">כותרת
            <input type="text" class="room-create-input" data-field="title" maxlength="80" value="${escapeHtml(slide.title)}" />
          </label>
          <label class="room-create-label">שורות בשקופית
            <textarea class="room-create-input" data-field="lines" rows="3">${escapeHtml((slide.lines || []).join("\n"))}</textarea>
          </label>
          <p class="room-create-label">דוגמאות</p>
          <div class="room-edit-exs">${(slide.examples || []).map(exampleRowHtml).join("")}</div>
          <button type="button" class="room-edit-small" data-ex-add>+ דוגמה</button>
          <label class="room-create-label">הסבר מורחב (בלחיצה על הנורה)
            <textarea class="room-create-input" data-field="more" rows="4">${escapeHtml(moreToText(slide.more))}</textarea>
          </label>
          ${hasPicture ? `<p class="room-edit-tip">הציור או הטבלה של השקופית נשארים כמו שהם</p>` : ""}
          <div class="room-edit-tools">
            <button type="button" class="room-edit-small" data-move="-1">הזזה למעלה</button>
            <button type="button" class="room-edit-small" data-move="1">הזזה למטה</button>
            <button type="button" class="room-edit-small is-danger" data-slide-remove>מחיקת השקופית</button>
          </div>
        </div>
      </details>`;
  }

  function editorHtml(lesson) {
    return `
      <form class="room-create room-edit" id="roomEditForm">
        <label class="room-create-label" for="roomEditName"><span class="room-key">שם השיעור</span></label>
        <input type="text" class="room-create-input" id="roomEditName" name="name" maxlength="60" required value="${escapeHtml(lesson.name)}" />
        <h3 class="room-mine-head"><span class="room-key">שקופיות</span></h3>
        <p class="room-edit-tip">לוחצים על שקופית כדי לשנות אותה</p>
        <p class="room-edit-tip">כל שורה בתיבה היא שורה בשקופית</p>
        <p class="room-edit-tip">מילה בין כוכביות, כך: **מילה**, תופיע מודגשת</p>
        <div class="room-edit-slides">${lesson.slides.map((slide) => slideEditHtml(slide)).join("")}</div>
        <button type="button" class="room-edit-small room-edit-add" data-slide-add>+ הוספת שקופית</button>
        <label class="room-mine-head" for="roomEditDiscuss"><span class="room-key">שאלות לדיון בכיתה</span></label>
        <textarea class="room-create-input" id="roomEditDiscuss" name="discuss" rows="3">${escapeHtml((lesson.discuss || []).join("\n"))}</textarea>
        <div class="room-edit-foot">
          <button type="submit" class="room-create-go">שמירה</button>
          <a href="${LESSON_OPEN_PATH}?mylesson=${encodeURIComponent(lesson.id)}" class="room-list-play">צפייה בשיעור</a>
          <button type="button" class="room-edit-small" data-edit-back>חזרה לרשימה</button>
        </div>
      </form>`;
  }

  function renumberSlides(form) {
    form.querySelectorAll(".room-edit-slide").forEach((el, i) => {
      el.querySelector(".room-edit-num").textContent = i + 1;
    });
  }

  function readSlides(form) {
    return [...form.querySelectorAll(".room-edit-slide")].map((el) => ({
      key: el.dataset.key,
      title: el.querySelector('[data-field="title"]').value,
      lines: textLines(el.querySelector('[data-field="lines"]').value),
      examples: [...el.querySelectorAll(".room-edit-ex")]
        .map((row) => [row.querySelector('[data-ex="a"]').value.trim(), row.querySelector('[data-ex="b"]').value.trim()])
        .filter(([a]) => a),
      more: textToMore(el.querySelector('[data-field="more"]').value),
    }));
  }

  function bindEditor(dialog, lesson) {
    const form = dialog.querySelector("#roomEditForm");
    const markDirty = () => (dialog.dataset.dirty = "1");
    form.addEventListener("input", (e) => {
      markDirty();
      if (e.target.dataset.field === "title") {
        e.target.closest(".room-edit-slide").querySelector(".room-edit-sum").textContent = plainTitle(e.target.value);
      }
    });
    renumberSlides(form);

    form.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      const slide = btn.closest(".room-edit-slide");
      if (btn.hasAttribute("data-ex-add")) {
        slide.querySelector(".room-edit-exs").insertAdjacentHTML("beforeend", exampleRowHtml());
        slide.querySelector(".room-edit-ex:last-child input").focus();
      } else if (btn.hasAttribute("data-ex-remove")) {
        btn.closest(".room-edit-ex").remove();
      } else if (btn.dataset.move) {
        const other = btn.dataset.move === "-1" ? slide.previousElementSibling : slide.nextElementSibling;
        if (!other) return;
        if (btn.dataset.move === "-1") other.before(slide);
        else other.after(slide);
        btn.focus();
      } else if (btn.hasAttribute("data-slide-remove")) {
        if (!confirm("למחוק את השקופית?")) return;
        slide.remove();
      } else if (btn.hasAttribute("data-slide-add")) {
        const list = form.querySelector(".room-edit-slides");
        list.insertAdjacentHTML("beforeend", slideEditHtml({ title: "", lines: [] }, true));
        list.lastElementChild.querySelector('[data-field="title"]').focus();
      } else if (btn.hasAttribute("data-edit-back")) {
        if (mayClose(dialog)) openBox("create");
        return;
      } else {
        return;
      }
      markDirty();
      renumberSlides(form);
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const go = form.querySelector(".room-create-go");
      go.disabled = true;
      try {
        const data = await myLessonsApi("PUT", `/${encodeURIComponent(lesson.id)}`, {
          name: form.elements.name.value,
          slides: readSlides(form),
          discuss: textLines(form.elements.discuss.value),
        });
        myLessons = myLessons.map((l) => (l.id === lesson.id ? data.lesson : l));
        delete dialog.dataset.dirty;
        showToast("השינויים נשמרו");
        // The server's copy again: new slides now have their keys.
        await openEditor(lesson.id, { keepScroll: true });
      } catch (err) {
        showToast(err.message);
        go.disabled = false;
      }
    });
  }

  async function openEditor(id, { keepScroll = false } = {}) {
    const dialog = document.getElementById("roomBoxDlg");
    if (!dialog) return;
    let lesson;
    try {
      lesson = (await myLessonsApi("GET", `/${encodeURIComponent(id)}`)).lesson;
    } catch (err) {
      showToast(err.message);
      return;
    }
    const scroll = dialog.scrollTop;
    dialog.dataset.box = "edit";
    delete dialog.dataset.dirty;
    dialog.innerHTML = dialogHtml("roomBoxTitle", "עריכת שיעור", editorHtml(lesson));
    bindEditor(dialog, lesson);
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = keepScroll ? scroll : 0;
  }

  // "שונות": recent activity and saved lessons, one under the other.
  function miscHtml() {
    return `
      <div class="room-misc">
        <h3 class="room-mine-head"><span class="room-key">פעילות אחרונה</span></h3>
        ${activityHtml()}
        <h3 class="room-mine-head"><span class="room-key">שיעורים ששמרתי</span></h3>
        ${sectionHtml("lessons")}
      </div>`;
  }

  const BOX_BODIES = {
    misc: miscHtml,
    favorites: () => sectionHtml("favorites"),
    created: () => sectionHtml("created"),
    create: createHtml,
  };

  function openBox(key) {
    const dialog = document.getElementById("roomBoxDlg");
    const tile = document.querySelector(`.room-tile[data-box="${key}"]`);
    if (!dialog || !tile || !BOX_BODIES[key]) return;
    dialog.dataset.box = key;
    delete dialog.dataset.dirty;
    dialog.innerHTML = dialogHtml("roomBoxTitle", tile.querySelector(".room-tile-title").textContent.trim(), BOX_BODIES[key]());
    bindSectionActions(dialog);
    bindCreate(dialog);
    if (!dialog.open) dialog.showModal();
  }

  document.querySelectorAll(".room-tile").forEach((tile) => {
    tile.querySelector("[data-icon]").innerHTML = icon(tile.querySelector("[data-icon]").dataset.icon);
    if (tile.dataset.box) tile.addEventListener("click", () => openBox(tile.dataset.box));
  });

  function renderAll() {
    // An empty games tile is hidden.
    ["favorites", "created"].forEach((section) => {
      document.querySelector(`.room-tile[data-box="${section}"]`)?.classList.toggle("hidden", !getSectionItems(section).items.length);
    });
    // A dialog left open shows the fresh list (after a star, a remove…).
    const dialog = document.getElementById("roomBoxDlg");
    if (dialog?.open && dialog.dataset.box !== "edit") openBox(dialog.dataset.box);
    renderBell();
    document.getElementById("roomFootLink")?.classList.toggle("hidden", !savedGames.length && !playHistory.length);
  }

  function bindSectionActions(container) {
    container.querySelectorAll("[data-play]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const game = savedGames.find((x) => x.id === btn.dataset.play);
        if (!game) return;
        UserData.launchGame({
          subject: game.subject,
          gameId: game.gameId,
          items: game.items,
          title: game.title,
          savedGameId: game.id,
        });
      });
    });

    container.querySelectorAll("[data-star]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const res = await UserData.toggleSavedGameStar(btn.dataset.star);
        if (!res.ok) {
          showToast(res.error || window.I18n?.t("myRoom.updateError") || "לא ניתן לעדכן");
          return;
        }
        await loadData();
      });
    });

    container.querySelectorAll("[data-unsave-lesson]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const res = await UserData.toggleFavoriteLesson(btn.dataset.unsaveLesson);
        if (!res.ok) {
          showToast(res.error || "לא ניתן לעדכן");
          return;
        }
        await loadData();
        showToast("השיעור הוסר מהשמורים");
      });
    });

    container.querySelectorAll("[data-delete]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm(window.I18n?.t("myRoom.confirmDelete") || "למחוק את המשחק?")) return;
        await UserData.deleteSavedGame(btn.dataset.delete);
        await loadData();
        showToast(window.I18n?.t("myRoom.deleted") || "נמחק");
      });
    });
  }

  // The teacher's student files — for the bell, and the tasks given and
  // students added in the activity history.
  async function getStudents() {
    const token = await window.FirebaseApp?.auth?.currentUser?.getIdToken().catch(() => "");
    if (!token) return [];
    const res = await fetch("/api/admin/students", { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error);
    return data.students || [];
  }

  async function loadData() {
    if (usePreviewData()) {
      const ids = Object.keys(window.ReadyLessons?.catalog || {});
      savedGames = PREVIEW_SAVED;
      playHistory = PREVIEW_HISTORY;
      savedLessons = ids.slice(0, 2).map((lessonId, i) => ({ lessonId, at: Date.now() - (3 + i) * DAY }));
      lessonHistory = [{ id: ids[2], at: Date.now() - HOUR }, { id: ids[0], at: Date.now() - DAY - 4 * HOUR }].filter((e) => e.id);
      students = PREVIEW_STUDENTS;
      myLessons = PREVIEW_MY_LESSONS;
      renderAll();
      return;
    }

    // Each list loads on its own, so one failed query (e.g. a missing index) doesn't blank the others.
    const names = ["savedGames", "playHistory", "favoriteLessons", "lessonHistory", "students", "myLessons"];
    const results = await Promise.allSettled([
      UserData.getSavedGames(),
      UserData.getPlayHistory(120),
      UserData.getFavoriteLessonEntries(),
      UserData.getLessonHistory(),
      getStudents(),
      getMyLessons(),
    ]);
    results.forEach((r, i) => {
      if (r.status === "rejected") console.error(`my-room: ${names[i]} failed to load`, r.reason);
    });
    [savedGames, playHistory, savedLessons, lessonHistory, students, myLessons] = results.map((r) => (r.status === "fulfilled" ? r.value : []));
    // Newest saved lesson first.
    savedLessons.sort((a, b) => b.at - a.at);
    renderAll();

    // Back from the lessons library with a copied lesson: its editor opens.
    const params = new URLSearchParams(location.search);
    const editId = params.get("edit");
    if (editId) {
      params.delete("edit");
      const rest = params.toString();
      history.replaceState(null, "", `${location.pathname}${rest ? `?${rest}` : ""}${location.hash}`);
      openEditor(editId);
    }

    if (results.every((r) => r.status === "rejected")) {
      showToast(window.I18n?.t("myRoom.loadError") || "לא הצלחנו לטעון נתונים");
    }
  }

  let currentUser = null;

  function showRoom(user) {
    currentUser = user;
    const hello = document.getElementById("roomHello");
    const firstName = String(user.name || "").trim().split(/\s+/)[0];
    if (hello) hello.textContent = firstName ? `שלום, ${firstName}!` : "שלום!";
    contentSection?.classList.remove("hidden");
    document.getElementById("roomBell")?.classList.remove("hidden");
    loadData();
  }

  window.addEventListener("gameclass:lang", () => {
    if (!currentUser) return;
    renderAll();
  });

  function redirectToLogin() {
    if (window.GameAuth?.openLoginModal) {
      window.GameAuth.openLoginModal("/my-room");
      return;
    }
    window.location.replace("/?login=1&next=%2Fmy-room");
  }

  function enterGuestPreview() {
    sessionStorage.setItem("pleyi-guest-preview", "1");
    if (window.GameAuth?.signInDevPreview) {
      window.GameAuth.signInDevPreview({ redirect: false });
    } else {
      updateGuestNav(GUEST_PREVIEW_USER);
    }
    showRoom(GUEST_PREVIEW_USER);
  }
  function updateGuestNav(user) {
    document.getElementById("authLoginBtn")?.classList.add("hidden");
    document.getElementById("authUserMenu")?.classList.remove("hidden");
    const userName = document.getElementById("authUserName");
    if (userName) userName.textContent = user.name;
    const userPhoto = document.getElementById("authUserPhoto");
    const userInitial = document.getElementById("authUserInitial");
    if (userPhoto && userInitial) {
      if (user.photoURL) {
        userPhoto.src = user.photoURL;
        userPhoto.classList.remove("hidden");
        userInitial.classList.add("hidden");
      } else {
        userPhoto.removeAttribute("src");
        userPhoto.classList.add("hidden");
        userInitial.textContent = (user.name || "?").charAt(0).toUpperCase();
        userInitial.classList.remove("hidden");
      }
    }
  }

  function clearGuestPreview() {
    sessionStorage.removeItem("pleyi-guest-preview");
  }

  function applyPreviewUser() {
    const previewUser = {
      uid: "preview",
      name: "מורה לדוגמה",
      photoURL: null,
      email: "teacher@preview.local",
    };
    window.GameAuth?.setDevPreviewUser?.(previewUser);
    updateGuestNav(previewUser);
    showRoom(previewUser);
  }

  document.getElementById("myRoomCreateBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    sessionStorage.setItem("pleyi-open-custom", "1");
    window.location.href = "/room?create=1";
  });

  window.GameAuth?.bindModals(showToast);

  const autoGuest =
    isGuestPreviewAllowed() &&
    (new URLSearchParams(location.search).get("guest") === "1" ||
      sessionStorage.getItem("pleyi-guest-preview") === "1" ||
      sessionStorage.getItem("pleyi-dev-preview") === "1");

  function handleAuthState(user) {
    if (PREVIEW) return;
    if (!window.GameAuth?._ready) return;
    if (user) {
      showRoom(user);
      return;
    }
    if (autoGuest) {
      enterGuestPreview();
      return;
    }
    if (window.GameAuth?.isDevHost?.()) {
      enterGuestPreview();
      return;
    }
    clearGuestPreview();
    redirectToLogin();
  }

  window.GameAuth?.onUserChange(handleAuthState);

  if (PREVIEW) applyPreviewUser();
  else if (window.GameAuth?.getUser()) showRoom(window.GameAuth.getUser());
})();
