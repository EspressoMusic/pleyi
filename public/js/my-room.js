/* Personal room (/my-room) — "שלום" + a bell with the students' updates
   (a task done, a request for help, joining a class), then one equal tile
   per category: students, the teacher's classes, recent activity, saved
   lessons and games. A tile opens its list in a dialog. */

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
  // A due date on a class post is off for now (as on the student's page);
  // true brings the "עד מתי?" field back.
  const DUE_DATES = false;

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
      classIds: ["preview-class"],
      classJoinedAt: { "preview-class": new Date(Date.now() - 5 * HOUR).toISOString() },
      classDone: { "preview-post": new Date(Date.now() - HOUR).toISOString() },
      best: {
        "greetings/greetings-when": {
          score: 8,
          total: 10,
          lastScore: 8,
          lastTotal: 10,
          bestAt: new Date(Date.now() - 30 * 60000).toISOString(),
          lastAt: new Date(Date.now() - 30 * 60000).toISOString(),
        },
      },
    },
    {
      id: "preview-yosef",
      name: "יוסף",
      createdAt: new Date(Date.now() - 6 * DAY).toISOString(),
      homework: [
        { exerciseTitle: "מילות שאלה", assignedAt: new Date(Date.now() - 3 * DAY).toISOString(), doneAt: new Date(Date.now() - DAY - 5 * HOUR).toISOString(), score: 7, total: 10 },
      ],
      help: [],
      classIds: ["preview-class"],
    },
    { id: "preview-ariel", name: "אריאל", createdAt: new Date(Date.now() - 2 * DAY).toISOString(), homework: [], help: [] },
    { id: "preview-noam", name: "נועם", createdAt: new Date(Date.now() - 2 * DAY).toISOString(), homework: [], help: [] },
  ];

  const PREVIEW_CLASSES = [
    {
      id: "preview-class",
      name: "ו׳2",
      code: "K7M2QX",
      open: true,
      posts: [
        { id: "preview-note", kind: "note", title: "", text: "שלום לכולם!\nברוכים הבאים לכיתה.", dueDate: "", link: "", at: new Date(Date.now() - DAY - 2 * HOUR).toISOString() },
        { id: "preview-guide", kind: "guide", title: "", text: "איך מתרגלים באתר:\nנכנסים לקישור האישי ובוחרים תרגול.", dueDate: "", link: "/services/english", at: new Date(Date.now() - DAY - HOUR).toISOString() },
        { id: "preview-post", kind: "task", title: "", text: "לתרגל את Present Simple\nועונים על כל השאלות.", dueDate: new Date(Date.now() + DAY).toLocaleDateString("en-CA"), link: "", at: new Date(Date.now() - 3 * HOUR).toISOString() },
        {
          id: "preview-exercise",
          kind: "exercise",
          title: "",
          text: "עושים עד מחר בבוקר",
          task: { topicId: "greetings", exerciseId: "greetings-when", topicTitle: "ברכות והיכרות", exerciseTitle: "מה אומרים?", type: "choice" },
          dueDate: "",
          link: "",
          at: new Date(Date.now() - 2 * HOUR).toISOString(),
        },
      ],
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
  let classes = [];

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
    pulse: '<path d="M3 12h4l3-7 4 14 3-7h4"/>',
    heart: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20z"/>',
    create: '<path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/>',
    board: '<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8 20l1.5-4M16 20l-1.5-4M7 8.5h6M7 11.5h4"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4M8 14h2M14 14h2M8 17.5h2"/>',
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
    const classById = new Map(classes.map((c) => [c.id, c]));
    const postById = new Map(classes.flatMap((c) => c.posts.map((p) => [p.id, p])));
    students.forEach((s) => {
      const href = `/admin/students#${encodeURIComponent(s.id)}`;
      // Joined one of the classes, and a class task marked done.
      (s.classIds || []).forEach((id) => {
        const c = classById.get(id);
        const at = s.classJoinedAt?.[id];
        if (c && at) list.push({ at: ms(at), icon: "student", who: s.name, verb: "הצטרף לכיתה", title: c.name, href });
      });
      Object.entries(s.classDone || {}).forEach(([id, at]) => {
        const post = postById.get(id);
        if (post) list.push({ at: ms(at), icon: "done", who: s.name, verb: `סיים ${POST_KINDS[post.kind] || "משימה"}`, title: postLabel(post), href });
      });
      // An exercise sent to one of the student's classes, solved.
      (s.classIds || []).forEach((id) => {
        (classById.get(id)?.posts || []).forEach((p) => {
          const done = p.kind === "exercise" && taskDone(s, p);
          if (!done) return;
          const verb = p.task.type === "lesson" ? "צפה בשיעור מהכיתה" : "פתר תרגיל מהכיתה";
          list.push({ at: ms(done.doneAt), icon: "done", who: s.name, verb, title: p.task.exerciseTitle, score: done.total ? `${done.score}/${done.total}` : "", href });
        });
      });
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

  /* ── "הכיתות שלי": the teacher opens a class and sends its join link
     (/c/<code>); each student who opens it writes their name and gets a
     file in the class (lib/classes.js). The updates the teacher writes to
     the class — a message, a task, an assignment, a guide — show on the
     students' pages, and the teacher sees who finished each task. The
     students in a class are the student files with its id in `classIds`. ── */

  const POST_KINDS = { note: "הודעה", exercise: "תרגיל", task: "משימה", assignment: "מטלה", guide: "הדרכה" };
  const DONE_KINDS = ["task", "assignment"];

  // An exercise sent to the class (kind "exercise": an exercise or a lesson
  // from the English library, `task`) is done once the student solved it —
  // or saw the lesson — after it was sent. Same as classTaskDone in
  // lib/student-progress.js.
  function taskDone(s, p) {
    const task = p.task;
    if (!task) return null;
    if (task.type === "lesson") {
      const seen = s.lessonsSeen?.[task.exerciseId.replace(/^lesson-/, "")];
      return seen && seen >= p.at ? { doneAt: seen } : null;
    }
    const entry = s.best?.[`${task.topicId}/${task.exerciseId}`];
    if (!entry?.lastAt || entry.lastAt < p.at) return null;
    const best = entry.bestAt && entry.bestAt >= p.at;
    return { doneAt: entry.lastAt, score: best ? entry.score : entry.lastScore, total: best ? entry.total : entry.lastTotal };
  }

  // The teacher opens the exercise as it is, to see it.
  function taskUrl(task) {
    return `/services/english#${encodeURIComponent(task.topicId)}/${encodeURIComponent(task.exerciseId)}`;
  }

  async function classesApi(method = "GET", path = "", body) {
    const token = await window.FirebaseApp?.auth?.currentUser?.getIdToken().catch(() => "");
    if (!token) throw new Error("צריך להתחבר כדי לנהל כיתות");
    const res = await fetch(`/api/my-classes${path}`, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) throw new Error(data.error || "משהו השתבש — נסו שוב");
    return data;
  }

  async function getClasses() {
    const token = await window.FirebaseApp?.auth?.currentUser?.getIdToken().catch(() => "");
    if (!token) return [];
    return (await classesApi()).classes || [];
  }

  function classMembers(c) {
    return students.filter((s) => (s.classIds || []).includes(c.id)).sort((a, b) => a.name.localeCompare(b.name, "he"));
  }

  function studentsCount(n) {
    if (!n) return "עוד אין תלמידים";
    return n === 1 ? "תלמיד אחד" : `${n} תלמידים`;
  }

  function joinUrl(c) {
    return `${location.origin}/c/${encodeURIComponent(c.code)}`;
  }

  function joinWhatsappUrl(c) {
    return `https://wa.me/?text=${encodeURIComponent(`הצטרפו לכיתה "${c.name}" ב־Pleyi:\n${joinUrl(c)}`)}`;
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

  function fmtDue(day) {
    const [y, m, d] = day.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" });
  }

  function classRowHtml(c) {
    return `
      <div class="room-note room-mine">
        <span class="room-act-icon">${icon("board")}</span>
        <span class="room-note-main">
          <span class="room-note-line room-note-title"><bdi>${escapeHtml(c.name)}</bdi></span>
          <span class="room-note-line room-note-verb">${escapeHtml(studentsCount(classMembers(c).length))}</span>
        </span>
        <button type="button" class="room-list-play" data-open-class="${escapeHtml(c.id)}">כניסה</button>
      </div>`;
  }

  // A new class = a yellow rectangle like a class's, with a plus. A tap
  // turns it into the name field and the "פתיחת כיתה" button.
  function classesHtml() {
    return `
      <div class="room-notes">
        <button type="button" class="room-note room-class-add" data-class-add>
          <span class="room-act-icon">${icon("created")}</span>
          <span class="room-note-main">
            <span class="room-note-line room-note-title">הוספת כיתה חדשה</span>
          </span>
        </button>
        <form class="room-note room-class-add room-class-add-form" id="roomClassForm" hidden>
          <label class="room-create-label" for="roomClassName">איך קוראים לכיתה?</label>
          <input type="text" class="room-create-input" id="roomClassName" name="name" maxlength="60" required placeholder="למשל: ו׳2 או קבוצת אנגלית" />
          <button type="submit" class="room-create-go">פתיחת כיתה</button>
        </form>
        ${classes.map(classRowHtml).join("")}
      </div>
      ${classes.length ? "" : `<p class="room-box-empty">עוד אין כיתות.<br>פותחים כיתה ושולחים לתלמידים את הקישור.<br>כל עדכון שכותבים לכיתה מגיע אליהם.</p>`}`;
  }

  function bindClasses(container) {
    const add = container.querySelector("[data-class-add]");
    const form = container.querySelector("#roomClassForm");
    add?.addEventListener("click", () => {
      add.hidden = true;
      form.hidden = false;
      // A fresh list arriving now must not wipe the name being typed.
      container.dataset.dirty = "1";
      form.elements.name.focus();
    });
    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const go = form.querySelector(".room-create-go");
      go.disabled = true;
      try {
        const data = await classesApi("POST", "", { name: form.elements.name.value, teacherName: currentUser?.name || "" });
        classes = [data.class, ...classes];
        openClass(data.class.id);
        showToast("הכיתה נפתחה!");
      } catch (err) {
        showToast(err.message);
        go.disabled = false;
      }
    });
    container.querySelectorAll("[data-open-class]").forEach((btn) => {
      btn.addEventListener("click", () => openClass(btn.dataset.openClass));
    });
  }

  /* ── The class is a chat, as in a WhatsApp group where only the teacher
     writes (class-chat.css): on top the class's name — a tap opens its
     details (who joined, the join switch, rename / new link / delete) — and
     the buttons that add students from the teacher's list and copy or
     share the join link; the messages, oldest on top; at the bottom what to
     send (הודעה / תרגיל / משימה / מטלה / הדרכה), the words and "+" for a
     due date and a link. A "תרגיל" is picked from the English library and
     every student in the class opens it from the chat. The details, the
     students to add and the library take the messages' place (panes). ── */

  const KIND_HINTS = {
    note: "כתבו הודעה לכיתה",
    exercise: "מילה לכיתה (לא חובה)",
    task: "מה המשימה?",
    assignment: "מה צריך להגיש?",
    guide: "כתבו את ההדרכה",
  };

  const CHAT_ICONS = {
    back: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6h.01"/>',
    link: '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>',
    share: '<circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="m8.3 10.7 7.4-4.3M8.3 13.3l7.4 4.3"/>',
    send: '<path d="M21 11.5 3 3l6.5 18 3-7.5L21 11.5Z"/><path d="M12.5 13.5 3 3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    ticks: '<path d="m2 12.5 4.5 4.5L15 8.5"/><path d="m10.5 16.5.5.5 8.5-8.5"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    addUser: '<circle cx="9.5" cy="8" r="3.8"/><path d="M2.5 20.5a7 7 0 0 1 14 0"/><path d="M19 8v6M16 11h6"/>',
    books: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    pencil: '<path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/>',
  };

  function chatIcon(name) {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${CHAT_ICONS[name]}</svg>`;
  }

  const chatDay = (iso) => new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" });

  // The day chip between the messages.
  function chatDayLabel(iso) {
    if (chatDay(iso) === chatDay(new Date().toISOString())) return "היום";
    if (chatDay(iso) === chatDay(new Date(Date.now() - DAY).toISOString())) return "אתמול";
    return new Date(iso).toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Jerusalem" });
  }

  function chatTime(iso) {
    return new Date(iso).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jerusalem" });
  }

  // Older updates had a title; a chat message is just its words.
  function postLabel(p) {
    if (p.kind === "exercise" && p.task) return p.task.exerciseTitle;
    return p.title || String(p.text || "").split("\n")[0].slice(0, 80);
  }

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
    speak: "דיבור",
    chat: "שיחה עם הבוט",
  };

  // The exercise in a message, or the one picked in the composer: its name,
  // and its topic under it.
  function taskCardHtml(task, tag = "span", attrs = "") {
    const lesson = task.type === "lesson";
    const type = !lesson && TYPE_LABELS[task.type] ? ` · ${TYPE_LABELS[task.type]}` : "";
    return `
      <${tag} class="cc-task"${attrs}>
        <span class="cc-task-icon">${chatIcon(lesson ? "books" : "pencil")}</span>
        <span class="cc-task-text">
          <b><bdi>${escapeHtml(task.exerciseTitle)}</bdi></b>
          <small><bdi>${escapeHtml(task.topicTitle)}</bdi>${escapeHtml(type)}</small>
        </span>
      </${tag}>`;
  }

  // One message sent; on a task, an assignment or an exercise, who finished
  // it (from the class's files) — on an exercise with each one's score. The
  // first of a day has the bubble's tail.
  function chatMsgHtml(p, members, tail) {
    const exercise = p.kind === "exercise" && p.task;
    const doneOf = (s) => (exercise ? taskDone(s, p) : s.classDone?.[p.id] ? {} : null);
    const tracked = (exercise || DONE_KINDS.includes(p.kind)) && members.length;
    const rows = tracked ? members.map((s) => ({ s, done: doneOf(s) })) : [];
    // Who finished first, by name; then who didn't yet.
    rows.sort((a, b) => Number(!a.done) - Number(!b.done));
    const names = rows
      .map(({ s, done }) => {
        const score = done?.total ? ` <span dir="ltr">${done.score}/${done.total}</span>` : "";
        return `<li${done ? ' class="is-done"' : ""}>${done ? icon("done") : ""}<bdi>${escapeHtml(s.name)}</bdi>${score}</li>`;
      })
      .join("");
    const doneCount = rows.filter((r) => r.done).length;
    const verb = exercise ? (p.task.type === "lesson" ? "צפו" : "פתרו") : "סיימו";
    return `
      <li class="cc-msg is-out is-${escapeHtml(p.kind)}${tail ? " has-tail" : ""}">
        ${p.kind !== "note" ? `<span class="cc-kind">${escapeHtml(POST_KINDS[p.kind] || POST_KINDS.note)}</span>` : ""}
        ${exercise ? taskCardHtml(p.task, "a", ` href="${escapeHtml(taskUrl(p.task))}" target="_blank" rel="noopener" title="פתיחת התרגיל"`) : ""}
        ${p.title ? `<p class="cc-title"><bdi>${escapeHtml(p.title)}</bdi></p>` : ""}
        ${p.text ? `<p class="cc-text">${escapeHtml(p.text)}</p>` : ""}
        ${DUE_DATES && p.dueDate ? `<span class="cc-due">${chatIcon("calendar")}עד ${escapeHtml(fmtDue(p.dueDate))}</span>` : ""}
        ${p.link ? `<a class="cc-link" href="${escapeHtml(p.link)}" target="_blank" rel="noopener noreferrer">${chatIcon("link")}<bdi dir="ltr">${escapeHtml(p.link)}</bdi></a>` : ""}
        ${tracked ? `<details class="cc-done"><summary>${verb} ${doneCount} מתוך ${members.length}</summary><ul>${names}</ul></details>` : ""}
        <span class="cc-meta">
          <button type="button" class="cc-del" data-delete-post="${escapeHtml(p.id)}" aria-label="מחיקת ההודעה" title="מחיקת ההודעה">${TRASH_ICON_SVG}</button>
          <span class="cc-time">${escapeHtml(chatTime(p.at))}</span>
          <span class="cc-ticks" role="img" aria-label="נשלח">${chatIcon("ticks")}</span>
        </span>
      </li>`;
  }

  function chatLogHtml(c, members) {
    const notes = [];
    if (!members.length) {
      notes.push(`
        <li class="cc-notice">
          עוד אין תלמידים בכיתה.<br>מוסיפים את התלמידים שלך מהרשימה,<br>או שולחים להם את הקישור בכפתורים למעלה.
          <button type="button" class="cc-invite-btn cc-notice-btn" data-class-add-students>${chatIcon("addUser")}הוספת התלמידים שלי</button>
        </li>`);
    }
    if (!c.posts.length) notes.push(`<li class="cc-notice">בוחרים למטה מה שולחים: הודעה, תרגיל, משימה, מטלה או הדרכה.<br>כל מה ששולחים כאן מגיע לכל התלמידים בכיתה.</li>`);
    let lastDay = "";
    const messages = [...c.posts]
      .sort((a, b) => a.at.localeCompare(b.at))
      .map((p) => {
        const newDay = chatDay(p.at) !== lastDay;
        lastDay = chatDay(p.at);
        return `${newDay ? `<li class="cc-day"><span>${escapeHtml(chatDayLabel(p.at))}</span></li>` : ""}${chatMsgHtml(p, members, newDay)}`;
      });
    return notes.join("") + messages.join("");
  }

  function memberRowHtml(s) {
    return `
      <div class="room-note room-mine">
        <span class="room-act-icon">${icon("student")}</span>
        <a class="room-note-main room-member-link" href="/admin/students#${encodeURIComponent(s.id)}">
          <span class="room-note-line room-note-title"><bdi>${escapeHtml(s.name)}</bdi></span>
        </a>
        <button type="button" class="room-list-delete" data-remove-member="${escapeHtml(s.id)}" aria-label="הוצאה מהכיתה" title="הוצאה מהכיתה">${REMOVE_ICON_SVG}</button>
      </div>`;
  }

  /* "הוספת תלמידים": the teacher's student files not in the class yet, all
     ticked, to add in one tap. */
  function notInClass(c) {
    return students.filter((s) => !(s.classIds || []).includes(c.id)).sort((a, b) => a.name.localeCompare(b.name, "he"));
  }

  function addCountText(n) {
    if (!n) return "בחרו תלמידים";
    return n === 1 ? "הוספת תלמיד אחד לכיתה" : `הוספת ${n} תלמידים לכיתה`;
  }

  function addPaneHtml(c) {
    const others = notInClass(c);
    const head = `<h3 class="room-mine-head"><span class="room-key">הוספת תלמידים לכיתה</span></h3>`;
    if (!students.length) {
      return `${head}<p class="room-box-empty">עוד אין לך תלמידים ברשימה.<br>מוסיפים תלמידים ב<a href="/admin/students">ניהול תלמידים</a>,<br>או שולחים להם את הקישור לכיתה.</p>`;
    }
    if (!others.length) return `${head}<p class="room-box-empty">כל התלמידים שלך כבר בכיתה.</p>`;
    const rows = others
      .map(
        (s) => `
          <label class="room-note room-mine cc-add-row">
            <input type="checkbox" class="cc-add-check" value="${escapeHtml(s.id)}" checked />
            <span class="room-note-main"><span class="room-note-line room-note-title"><bdi>${escapeHtml(s.name)}</bdi></span></span>
          </label>`
      )
      .join("");
    return `
      ${head}
      <p class="room-edit-tip">התלמידים המסומנים ייכנסו לכיתה.</p>
      <p class="room-edit-tip">הם יראו את כל מה ששולחים בכיתה, בדף האישי שלהם.</p>
      <button type="button" class="room-edit-small cc-add-all" data-add-all>ביטול הבחירה</button>
      <div class="room-notes cc-add-list">${rows}</div>
      <button type="button" class="room-create-go cc-add-go" data-add-go>${addCountText(others.length)}</button>`;
  }

  function classViewHtml(c) {
    const members = classMembers(c);
    const kinds = Object.entries(POST_KINDS)
      .map(
        ([id, label], i) => `
          <label class="cc-pick is-${id}">
            <input type="radio" name="kind" value="${id}"${i === 0 ? " checked" : ""} />
            <span>${label}</span>
          </label>`
      )
      .join("");
    return `
      <div class="class-chat room-chat">
        <header class="cc-head">
          <button type="button" class="cc-head-btn" data-class-back aria-label="חזרה" title="חזרה">${chatIcon("back")}</button>
          <button type="button" class="cc-head-main" data-class-info>
            <span class="cc-avatar" aria-hidden="true">${icon("board")}</span>
            <span class="cc-head-text">
              <b class="cc-name" id="roomBoxTitle"><bdi>${escapeHtml(c.name)}</bdi></b>
              <span class="cc-sub">${escapeHtml(studentsCount(members.length))}</span>
            </span>
          </button>
          <button type="button" class="cc-head-btn" data-class-info aria-pressed="false" aria-label="פרטי הכיתה" title="פרטי הכיתה">${chatIcon("info")}</button>
          <button type="button" class="room-dlg-close" data-close aria-label="סגירה">${icon("close")}</button>
        </header>
        <div class="cc-invite">
          <button type="button" class="cc-invite-btn" data-class-add-students>${chatIcon("addUser")}הוספת תלמידים</button>
          <button type="button" class="cc-invite-btn" data-class-copy>${chatIcon("link")}העתקת הקישור</button>
          <button type="button" class="cc-invite-btn" data-class-share>${chatIcon("share")}שיתוף הזמנה</button>
        </div>
        <ol class="cc-log" aria-label="ההודעות לכיתה">${chatLogHtml(c, members)}</ol>
        <form class="cc-compose" id="roomPostForm">
          <div class="cc-kinds" role="radiogroup" aria-label="מה שולחים?">
            <span class="cc-kinds-label" aria-hidden="true">שולחים:</span>
            ${kinds}
          </div>
          <div class="cc-task-pick" hidden></div>
          <div class="cc-extra" hidden>
            ${DUE_DATES ? `<label class="cc-field"><span>עד מתי?</span><input type="date" class="cc-field-input" name="dueDate" /></label>` : ""}
            <label class="cc-field"><span>קישור</span><input type="text" class="cc-field-input" name="link" maxlength="500" dir="ltr" inputmode="url" placeholder="https://" /></label>
          </div>
          <div class="cc-row">
            <button type="button" class="cc-attach" data-chat-extra aria-expanded="false" aria-label="${DUE_DATES ? "הוספת תאריך או קישור" : "הוספת קישור"}" title="${DUE_DATES ? "תאריך או קישור" : "קישור"}">${chatIcon("plus")}</button>
            <textarea class="cc-input" name="text" rows="1" maxlength="1500" placeholder="${KIND_HINTS.note}" aria-label="ההודעה"></textarea>
            <button type="submit" class="cc-send" aria-label="שליחה לכיתה" title="שליחה">${chatIcon("send")}</button>
          </div>
        </form>
        <div class="cc-pane cc-info" data-pane="info" hidden>
          <section class="room-class-join">
            <p class="room-edit-tip">מוסיפים את התלמידים שלך בכפתור "הוספת תלמידים".</p>
            <p class="room-edit-tip">או שולחים להם את הקישור בכפתורים למעלה.</p>
            <p class="room-edit-tip">מי שנכנס בקישור כותב את השם שלו ונכנס לכיתה.</p>
            <label class="room-class-open">
              <input type="checkbox" data-class-open${c.open ? " checked" : ""} />
              <span>תלמידים חדשים יכולים להצטרף בקישור</span>
            </label>
          </section>
          <h3 class="room-mine-head"><span class="room-key">תלמידים בכיתה</span></h3>
          ${
            members.length
              ? `<div class="room-notes">${members.map(memberRowHtml).join("")}</div>`
              : `<p class="room-box-empty">עוד אין תלמידים בכיתה.</p>`
          }
          <button type="button" class="room-edit-small cc-info-add" data-class-add-students>+ הוספת תלמידים מהרשימה</button>
          <div class="room-edit-foot">
            <button type="button" class="room-edit-small" data-class-rename>שינוי שם</button>
            <button type="button" class="room-edit-small" data-class-code>קישור חדש</button>
            <button type="button" class="room-edit-small is-danger" data-class-delete>מחיקת הכיתה</button>
          </div>
        </div>
        <div class="cc-pane cc-add" data-pane="add" hidden>${addPaneHtml(c)}</div>
        <div class="cc-pane cc-lib" data-pane="lib" hidden aria-live="polite"></div>
      </div>`;
  }

  function replaceClass(updated) {
    classes = classes.map((c) => (c.id === updated.id ? updated : c));
  }

  // A pane — the class's details ("info"), the students to add ("add") or
  // the library ("lib") — instead of the chat, or back to the chat ("").
  // Back in the chat it opens at the newest message.
  function showClassPane(dialog, pane = "") {
    dialog.dataset.classPane = pane;
    dialog.querySelectorAll(".cc-pane").forEach((el) => (el.hidden = el.dataset.pane !== pane));
    dialog.querySelector(".cc-log").hidden = !!pane;
    dialog.querySelector(".cc-compose").hidden = !!pane;
    dialog.querySelectorAll(".cc-head [aria-pressed]").forEach((btn) => btn.setAttribute("aria-pressed", String(pane === "info")));
    if (!pane) {
      const log = dialog.querySelector(".cc-log");
      log.scrollTop = log.scrollHeight;
    } else {
      dialog.querySelector(`.cc-pane[data-pane="${pane}"]`).scrollTop = 0;
    }
  }

  /* ── The library for a "תרגיל": the English path's stages with a
     numbered tile per topic (as on the English page), and inside a topic
     its lessons, exercises, reading passages and exams. One tap picks it.
     The English page's data loads the first time the library opens. ── */

  const ENGLISH_DATA_SCRIPTS = [
    "/js/english-data.js?v=32",
    "/js/english-reading.js?v=12",
    "/js/english-reading-sets.js?v=1",
    "/js/english-more.js?v=5",
    "/js/english-chat.js?v=1",
    "/js/english-exams.js?v=2",
  ];
  const loadedScripts = new Set();
  let englishLoading = null;

  // In order: each one adds to the topics of the one before. A script that
  // loaded stays loaded, so a retry never runs it twice.
  function loadEnglishLibrary() {
    englishLoading ||= ENGLISH_DATA_SCRIPTS.reduce(
      (chain, src) =>
        chain.then(() => {
          if (loadedScripts.has(src)) return null;
          return new Promise((resolve, reject) => {
            const el = document.createElement("script");
            el.src = src;
            el.onload = () => {
              loadedScripts.add(src);
              resolve();
            };
            el.onerror = reject;
            document.head.appendChild(el);
          });
        }),
      Promise.resolve()
    ).then(
      () => (window.ENGLISH_TOPICS || []).length > 0,
      () => {
        englishLoading = null;
        return false;
      }
    );
    return englishLoading;
  }

  function libLessonTasks(topic) {
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

  function libGroups(topic) {
    const task = (ex) => ({ topicId: topic.id, exerciseId: ex.id, topicTitle: topic.title, exerciseTitle: ex.title, type: ex.type });
    const exercises = topic.exercises || [];
    const byLevel = (a, b) => (a.level || 1) - (b.level || 1);
    return [
      {
        title: "תרגילים",
        tasks: exercises
          .filter((ex) => ex.type !== "reading" && ex.type !== "exam")
          .sort((a, b) => practiceLevel(a) - practiceLevel(b))
          .map(task),
      },
      { title: "שיעורים", tasks: libLessonTasks(topic) },
      { title: "קטעי קריאה", tasks: exercises.filter((ex) => ex.type === "reading").sort(byLevel).map(task) },
      { title: "מבחנים", tasks: exercises.filter((ex) => ex.type === "exam").map(task) },
    ].filter((group) => group.tasks.length);
  }

  function libHomeHtml() {
    const topics = window.ENGLISH_TOPICS || [];
    const path = window.ENGLISH_PATH || [];
    const inPath = new Set(path.flatMap((stage) => stage.topics));
    const stages = path.map((stage, i) => ({
      title: `שלב ${i + 1} · ${stage.title}`,
      topics: stage.topics.map((id) => topics.find((tp) => tp.id === id)).filter(Boolean),
    }));
    const rest = topics.filter((tp) => !inPath.has(tp.id));
    if (rest.length) stages.push({ title: "עוד נושאים", topics: rest });
    let num = 0;
    const tile = (topic) => `
      <button type="button" class="cc-lib-tile" data-lib-topic="${escapeHtml(topic.id)}">
        <span class="cc-lib-num" aria-hidden="true">${++num}</span>
        <span class="cc-lib-tile-title">${escapeHtml(topic.title)}</span>
        ${topic.titleEn ? `<span class="cc-lib-tile-sub" dir="ltr">${escapeHtml(topic.titleEn)}</span>` : ""}
      </button>`;
    return `
      <h3 class="room-mine-head"><span class="room-key">בחירת תרגיל לכיתה</span></h3>
      <p class="room-edit-tip">בוחרים נושא, ואז תרגיל או שיעור.</p>
      ${stages
        .map((stage) => `<h4 class="cc-lib-stage">${escapeHtml(stage.title)}</h4><div class="cc-lib-tiles">${stage.topics.map(tile).join("")}</div>`)
        .join("")}`;
  }

  // `shown` gets the topic's tasks, by their place on screen.
  function libTopicHtml(topic, shown) {
    const groups = libGroups(topic);
    const body = groups.length
      ? groups
          .map((group) => {
            const items = group.tasks
              .map((task) => {
                shown.push(task);
                const sub = group.title === "תרגילים" ? TYPE_LABELS[task.type] || "" : "";
                return `
                  <button type="button" class="cc-lib-item" data-lib-pick="${shown.length - 1}">
                    <span class="cc-lib-item-title"><bdi>${escapeHtml(task.exerciseTitle)}</bdi></span>
                    ${sub ? `<span class="cc-lib-item-sub">${escapeHtml(sub)}</span>` : ""}
                  </button>`;
              })
              .join("");
            return `<h4 class="cc-lib-stage">${group.title}</h4><div class="cc-lib-items">${items}</div>`;
          })
          .join("")
      : `<p class="room-box-empty">בנושא הזה אין עדיין תרגילים.</p>`;
    return `
      <button type="button" class="room-edit-small cc-lib-up" data-lib-home>חזרה לכל הנושאים</button>
      <h3 class="room-mine-head"><span class="room-key">${escapeHtml(topic.title)}</span></h3>
      <p class="room-edit-tip">לוחצים על תרגיל כדי לבחור אותו.</p>
      ${body}`;
  }

  function bindClassView(dialog, c) {
    const run = async (button, fn) => {
      if (button) button.disabled = true;
      try {
        await fn();
      } catch (err) {
        showToast(err.message);
        if (button) button.disabled = false;
      }
    };
    const path = `/${encodeURIComponent(c.id)}`;
    const fine = () => matchMedia("(pointer: fine)").matches;
    const pane = () => dialog.dataset.classPane || "";

    dialog.querySelector("[data-class-copy]")?.addEventListener("click", async () => {
      showToast((await copyText(joinUrl(c))) ? "הקישור הועתק" : "לא הצלחנו להעתיק — נסו שוב");
    });

    // On a phone the phone's own share menu; on a computer WhatsApp.
    dialog.querySelector("[data-class-share]")?.addEventListener("click", async () => {
      if (navigator.share && !fine()) {
        try {
          await navigator.share({ title: c.name, text: `הצטרפו לכיתה "${c.name}" ב־Pleyi:`, url: joinUrl(c) });
          return;
        } catch (err) {
          if (err.name === "AbortError") return;
        }
      }
      window.open(joinWhatsappUrl(c), "_blank", "noopener");
    });

    dialog.querySelectorAll("[data-class-info]").forEach((btn) =>
      btn.addEventListener("click", () => showClassPane(dialog, pane() === "info" ? "" : "info"))
    );

    // Inside a topic of the library back to its topics; from a pane back to
    // the chat; from the chat back to the classes.
    dialog.querySelector("[data-class-back]")?.addEventListener("click", () => {
      if (pane() === "lib" && libAt) showLib("");
      else if (pane()) showClassPane(dialog, "");
      else if (mayClose(dialog)) openBox("classes");
    });

    /* ── Adding students from the list ── */
    const addPane = dialog.querySelector(".cc-add");
    const addChecks = () => [...addPane.querySelectorAll(".cc-add-check")];
    const refreshAdd = () => {
      const checks = addChecks();
      const picked = checks.filter((el) => el.checked).length;
      const go = addPane.querySelector("[data-add-go]");
      if (go) {
        go.textContent = addCountText(picked);
        go.disabled = !picked;
      }
      const all = addPane.querySelector("[data-add-all]");
      if (all) all.textContent = picked === checks.length ? "ביטול הבחירה" : "בחירת כולם";
    };
    dialog.querySelectorAll("[data-class-add-students]").forEach((btn) =>
      btn.addEventListener("click", () => {
        showClassPane(dialog, "add");
        refreshAdd();
      })
    );
    addPane.addEventListener("change", refreshAdd);
    addPane.querySelector("[data-add-all]")?.addEventListener("click", () => {
      const checks = addChecks();
      const on = !checks.every((el) => el.checked);
      checks.forEach((el) => (el.checked = on));
      refreshAdd();
    });
    addPane.querySelector("[data-add-go]")?.addEventListener("click", (e) => {
      const ids = addChecks()
        .filter((el) => el.checked)
        .map((el) => el.value);
      if (!ids.length) return;
      run(e.currentTarget, async () => {
        const { added = [] } = await classesApi("POST", `${path}/members`, { ids });
        const now = new Date().toISOString();
        students.forEach((s) => {
          if (!added.includes(s.id)) return;
          s.classIds = [...(s.classIds || []), c.id];
          s.classJoinedAt = { ...(s.classJoinedAt || {}), [c.id]: now };
        });
        dialog.dataset.classPane = "";
        openClass(c.id);
        showToast(added.length === 1 ? "תלמיד אחד נוסף לכיתה" : `${added.length} תלמידים נוספו לכיתה`);
      });
    });

    const openToggle = dialog.querySelector("[data-class-open]");
    openToggle?.addEventListener("change", async () => {
      try {
        replaceClass((await classesApi("PATCH", path, { open: openToggle.checked })).class);
        showToast(openToggle.checked ? "אפשר להצטרף לכיתה" : "ההצטרפות לכיתה נסגרה");
      } catch (err) {
        openToggle.checked = !openToggle.checked;
        showToast(err.message);
      }
    });

    const form = dialog.querySelector("#roomPostForm");
    const input = form.elements.text;
    const extra = form.querySelector(".cc-extra");
    const extraBtn = form.querySelector("[data-chat-extra]");
    const taskPick = form.querySelector(".cc-task-pick");
    // The exercise picked for a "תרגיל", till it's sent.
    let chosen = null;
    const markDirty = () => {
      if (chosen || [input, form.elements.dueDate, form.elements.link].some((el) => el?.value.trim())) dialog.dataset.dirty = "1";
      else delete dialog.dataset.dirty;
    };
    const renderTaskPick = () => {
      taskPick.hidden = form.elements.kind.value !== "exercise";
      taskPick.innerHTML = chosen
        ? `${taskCardHtml(chosen)}<button type="button" class="room-edit-small cc-task-change" data-lib-open>החלפה</button>`
        : `<button type="button" class="cc-task-choose" data-lib-open>${chatIcon("books")}<span>בחירת תרגיל מהספרייה</span></button>`;
    };
    renderTaskPick();
    taskPick.addEventListener("click", (e) => {
      if (e.target.closest("[data-lib-open]")) openLib();
    });

    /* ── The library pane ── */
    const libPane = dialog.querySelector(".cc-lib");
    let libAt = "";
    let libShown = [];

    async function showLib(topicId) {
      libAt = topicId;
      if (!(window.ENGLISH_TOPICS || []).length) {
        libPane.innerHTML = `<p class="room-box-empty">טוענים את הספרייה…</p>`;
        if (!(await loadEnglishLibrary())) {
          libPane.innerHTML = `<p class="room-box-empty">לא הצלחנו לטעון את הספרייה.<br><button type="button" class="room-edit-small" data-lib-retry>לנסות שוב</button></p>`;
          return;
        }
        if (pane() !== "lib") return;
      }
      const topic = topicId && window.ENGLISH_TOPICS.find((tp) => tp.id === topicId);
      libShown = [];
      libPane.innerHTML = topic ? libTopicHtml(topic, libShown) : libHomeHtml();
      libPane.scrollTop = 0;
      if (!topic && libReturnTo) {
        libPane.querySelector(`[data-lib-topic="${CSS.escape(libReturnTo)}"]`)?.scrollIntoView({ block: "center" });
      }
      libReturnTo = topic ? topic.id : "";
    }
    let libReturnTo = "";

    function openLib() {
      showClassPane(dialog, "lib");
      showLib("");
    }

    libPane.addEventListener("click", (e) => {
      const el = e.target.closest("button");
      if (!el) return;
      if (el.matches("[data-lib-retry]")) showLib(libAt);
      else if (el.matches("[data-lib-home]")) showLib("");
      else if (el.dataset.libTopic) showLib(el.dataset.libTopic);
      else if (el.dataset.libPick) {
        chosen = libShown[Number(el.dataset.libPick)] || null;
        libAt = "";
        libReturnTo = "";
        renderTaskPick();
        markDirty();
        showClassPane(dialog, "");
        if (fine()) input.focus();
      }
    });

    const showExtra = (on) => {
      extra.hidden = !on;
      extraBtn.setAttribute("aria-expanded", String(on));
    };
    extraBtn.addEventListener("click", () => showExtra(extra.hidden));
    // A task or an assignment usually has a date: its fields open. A
    // "תרגיל" opens the library, till one is picked.
    form.addEventListener("change", (e) => {
      if (e.target.name !== "kind") return;
      input.placeholder = KIND_HINTS[e.target.value] || KIND_HINTS.note;
      if (DONE_KINDS.includes(e.target.value)) showExtra(true);
      renderTaskPick();
      if (e.target.value === "exercise" && !chosen) openLib();
    });
    // The box grows with the words; what's typed isn't wiped by a refresh.
    form.addEventListener("input", () => {
      input.style.height = "auto";
      input.style.height = `${Math.min(input.scrollHeight + 5, 140)}px`;
      markDirty();
    });
    // On a computer Enter sends and Shift+Enter starts a new line.
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey && !e.isComposing && fine()) {
        e.preventDefault();
        form.requestSubmit();
      }
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const kind = form.elements.kind.value;
      if (kind === "exercise" && !chosen) {
        showToast("בחרו תרגיל לשליחה");
        openLib();
        return;
      }
      if (kind !== "exercise" && !input.value.trim()) {
        input.focus();
        showToast("כתבו מה לשלוח לכיתה");
        return;
      }
      run(form.querySelector(".cc-send"), async () => {
        const data = await classesApi("POST", `${path}/posts`, {
          kind,
          text: input.value,
          dueDate: form.elements.dueDate?.value || "",
          link: form.elements.link.value,
          ...(kind === "exercise" ? { task: chosen } : {}),
        });
        replaceClass(data.class);
        delete dialog.dataset.dirty;
        openClass(c.id);
        if (kind === "exercise") showToast("התרגיל נשלח לכל התלמידים בכיתה");
        if (fine()) dialog.querySelector(".cc-input")?.focus();
      });
    });

    dialog.querySelectorAll("[data-delete-post]").forEach((btn) =>
      btn.addEventListener("click", () => {
        if (!confirm("למחוק את ההודעה? התלמידים לא יראו אותה יותר")) return;
        run(btn, async () => {
          replaceClass((await classesApi("DELETE", `${path}/posts/${encodeURIComponent(btn.dataset.deletePost)}`)).class);
          openClass(c.id, { keepScroll: true });
        });
      })
    );

    dialog.querySelectorAll("[data-remove-member]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const s = students.find((x) => x.id === btn.dataset.removeMember);
        if (!s || !confirm(`להוציא את ${s.name} מהכיתה? התיק שלו יישאר ברשימת התלמידים`)) return;
        run(btn, async () => {
          await classesApi("DELETE", `${path}/members/${encodeURIComponent(s.id)}`);
          s.classIds = (s.classIds || []).filter((id) => id !== c.id);
          openClass(c.id, { keepScroll: true });
        });
      })
    );

    dialog.querySelector("[data-class-rename]")?.addEventListener("click", (e) => {
      const name = prompt("השם החדש של הכיתה", c.name);
      if (!name || name.trim() === c.name) return;
      run(e.currentTarget, async () => {
        replaceClass((await classesApi("PATCH", path, { name })).class);
        openClass(c.id, { keepScroll: true });
      });
    });

    dialog.querySelector("[data-class-code]")?.addEventListener("click", (e) => {
      if (!confirm("הקישור הישן יפסיק לעבוד. תלמידים שכבר בכיתה יישארו בה. ליצור קישור חדש?")) return;
      run(e.currentTarget, async () => {
        replaceClass((await classesApi("POST", `${path}/code`)).class);
        openClass(c.id, { keepScroll: true });
        showToast("נוצר קישור חדש");
      });
    });

    dialog.querySelector("[data-class-delete]")?.addEventListener("click", (e) => {
      if (!confirm(`למחוק את הכיתה "${c.name}"? ההודעות יימחקו. התלמידים יישארו ברשימת התלמידים`)) return;
      run(e.currentTarget, async () => {
        await classesApi("DELETE", path);
        classes = classes.filter((x) => x.id !== c.id);
        students.forEach((s) => {
          s.classIds = (s.classIds || []).filter((id) => id !== c.id);
        });
        delete dialog.dataset.dirty;
        openBox("classes");
        showToast("הכיתה נמחקה");
      });
    });
  }

  // `keepScroll`: a refresh of the same class keeps the chat (or the
  // details) where it was; otherwise the chat opens at the newest message.
  // The library and the students to add are never kept: back to the chat.
  function openClass(id, { keepScroll = false } = {}) {
    const dialog = document.getElementById("roomBoxDlg");
    const c = classes.find((x) => x.id === id);
    if (!dialog || !c) return;
    const same = dialog.open && dialog.dataset.box === "class" && dialog.dataset.classId === c.id;
    const logScroll = dialog.querySelector(".cc-log")?.scrollTop;
    const infoScroll = dialog.querySelector(".cc-info")?.scrollTop;
    dialog.dataset.box = "class";
    dialog.dataset.classId = c.id;
    delete dialog.dataset.dirty;
    dialog.innerHTML = classViewHtml(c);
    bindClassView(dialog, c);
    if (!dialog.open) dialog.showModal();
    const info = same && dialog.dataset.classPane === "info";
    showClassPane(dialog, info ? "info" : "");
    if (same && keepScroll) {
      if (info) dialog.querySelector(".cc-info").scrollTop = infoScroll || 0;
      else dialog.querySelector(".cc-log").scrollTop = logScroll || 0;
    }
  }

  // "שונות": recent activity, saved lessons and the games lists, one under
  // the other. An empty games list is left out.
  function miscHtml() {
    const games = [
      ["favorites", "משחקים שאהבתי"],
      ["created", "משחקים שיצרתי"],
    ]
      .filter(([section]) => getSectionItems(section).items.length)
      .map(([section, title]) => `
        <h3 class="room-mine-head"><span class="room-key">${title}</span></h3>
        ${sectionHtml(section)}`)
      .join("");
    return `
      <div class="room-misc">
        <h3 class="room-mine-head"><span class="room-key">פעילות אחרונה</span></h3>
        ${activityHtml()}
        <h3 class="room-mine-head"><span class="room-key">שיעורים ששמרתי</span></h3>
        ${sectionHtml("lessons")}
        ${games}
      </div>`;
  }

  // "היומן שלי": public/js/my-room-diary.js draws and runs it.
  const BOX_BODIES = {
    misc: miscHtml,
    create: createHtml,
    classes: classesHtml,
    diary: () => window.RoomDiary?.html() || "",
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
    bindClasses(dialog);
    if (key === "diary") window.RoomDiary?.bind(dialog);
    if (!dialog.open) dialog.showModal();
  }

  document.querySelectorAll(".room-tile").forEach((tile) => {
    tile.querySelector("[data-icon]").innerHTML = icon(tile.querySelector("[data-icon]").dataset.icon);
    if (tile.dataset.box) tile.addEventListener("click", () => openBox(tile.dataset.box));
  });

  function renderAll() {
    // A dialog left open shows the fresh list (after a star, a remove…).
    const dialog = document.getElementById("roomBoxDlg");
    if (dialog?.open && dialog.dataset.box === "class") {
      // Not while the teacher picks an exercise or students to add.
      const picking = ["lib", "add"].includes(dialog.dataset.classPane);
      if (dialog.dataset.dirty !== "1" && !picking) openClass(dialog.dataset.classId, { keepScroll: true });
    } else if (dialog?.open && dialog.dataset.box === "diary") {
      // The diary keeps its own place (the week, the day being edited).
      window.RoomDiary?.refresh();
    } else if (dialog?.open && dialog.dataset.box !== "edit" && dialog.dataset.dirty !== "1") openBox(dialog.dataset.box);
    renderBell();
    // The "+ פתיחת חדר" button under the tiles is hidden for now.
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
      classes = PREVIEW_CLASSES;
      renderAll();
      return;
    }

    // Each list loads on its own, so one failed query (e.g. a missing index) doesn't blank the others.
    const names = ["savedGames", "playHistory", "favoriteLessons", "lessonHistory", "students", "myLessons", "classes"];
    const results = await Promise.allSettled([
      UserData.getSavedGames(),
      UserData.getPlayHistory(120),
      UserData.getFavoriteLessonEntries(),
      UserData.getLessonHistory(),
      getStudents(),
      getMyLessons(),
      getClasses(),
    ]);
    results.forEach((r, i) => {
      if (r.status === "rejected") console.error(`my-room: ${names[i]} failed to load`, r.reason);
    });
    [savedGames, playHistory, savedLessons, lessonHistory, students, myLessons, classes] = results.map((r) => (r.status === "fulfilled" ? r.value : []));
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

  // What the diary (my-room-diary.js) takes from the room: the sign-in, the
  // teacher's students, classes and own lessons, the preview mode, the
  // toast and the dialog's guard against closing with unsaved changes.
  window.MyRoom = {
    token: () => window.FirebaseApp?.auth?.currentUser?.getIdToken().catch(() => "") || Promise.resolve(""),
    students: () => students,
    classes: () => classes,
    myLessons: () => myLessons,
    preview: usePreviewData,
    toast: showToast,
    mayClose,
    icon,
  };

  if (PREVIEW) applyPreviewUser();
  else if (window.GameAuth?.getUser()) showRoom(window.GameAuth.getUser());
})();
