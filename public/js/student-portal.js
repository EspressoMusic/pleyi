/* Student page (/s/<key>) — the personal link the teacher sends.
   The page shows the tasks the teacher left the student. A bar of squares
   on top opens the rest: the class's updates from the teacher (when the
   student joined a class), the daily challenge, "my map" — the English
   learning path from the first letters to reading an unseen, with what the
   student did on it (lib/english-map.js) — "my prizes" — a certificate to
   print for every stage of the path and the stickers (lib/stickers.js) —
   and the library — the site's lesson library (/services/ready-lessons).
   Opening the page links this device to the
   student's file, so whatever they solve on the site is saved there. */

(function () {
  const app = document.getElementById("stuApp");
  const key = decodeURIComponent(location.pathname.split("/")[2] || "");
  // The teacher's "מפת ההתקדמות" (?view=teacher): the map alone, and this
  // device stays unlinked from the student's file.
  const teacherView = new URLSearchParams(location.search).get("view") === "teacher";
  // Due dates and "באיחור" are off for now (and in the teacher's forms);
  // true brings them back.
  const DUE_DATES = false;

  const ICONS = {
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5L20 7"/></svg>`,
    chevron: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>`,
    trophy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3h8v6a4 4 0 0 1-8 0V3z"/><path d="M8 5H4.5A3.5 3.5 0 0 0 8 10.5M16 5h3.5A3.5 3.5 0 0 1 16 10.5"/><path d="M12 13v4M8 21h8M9.5 17h5"/></svg>`,
    close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>`,
    info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="5.5" r="1.4" fill="currentColor" stroke-width="1.6"/><path d="M12 11v8.5"/></svg>`,
    flame: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22c4.1 0 7-2.8 7-6.8 0-3.6-2.3-6-4.1-8.2-.4 2-1.4 3.3-2.6 3.8.3-3.1-1-6.3-3.8-8.3.1 3.2-1.6 5.4-3.2 7.4C4.2 11.5 5 13.6 5 15.2 5 19.2 7.9 22 12 22Z"/><path d="M12 22c-1.7 0-3-1.3-3-3 0-1.8 1.4-3 2.2-4.3.5 1 1.3 1.6 2 1.8.4-1 .3-2 0-3 1.4 1.1 2.8 2.8 2.8 4.9 0 2.1-1.6 3.6-4 3.6Z"/></svg>`,
    cards: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m8.5 3.6 9.2 2.5a1.6 1.6 0 0 1 1.1 2L15.6 20"/><rect x="3.5" y="6.5" width="11" height="15" rx="1.8"/><path d="M6.5 11h5M6.5 14h3.5"/></svg>`,
    // A rosette with two ribbons: a certificate.
    ribbon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="9" r="6"/><circle cx="12" cy="9" r="2.6"/><path d="m8.4 13.8-2 7.2 3.4-1.6 2.2 2.6M15.6 13.8l2 7.2-3.4-1.6-2.2 2.6"/></svg>`,
    print: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/></svg>`,
    lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7.5a4 4 0 0 1 8 0V11"/></svg>`,
    download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>`,
    share: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="m8.3 10.7 7.4-4.3M8.3 13.3l7.4 4.3"/></svg>`,
    // Books on a shelf, the last one leaning: the library.
    library: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="4.5" height="16" rx="1"/><rect x="9" y="6" width="4.5" height="13" rx="1"/><rect x="15.2" y="6" width="4.5" height="13" rx="1" transform="rotate(-14 17.45 12.5)"/><path d="M3 7.5h4.5M9 10h4.5M2 21.5h20"/></svg>`,
    // A folded map with a winding road on it.
    map: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6.5 8.5 4l7 2.5L21 4v13.5L15.5 20l-7-2.5L3 20Z"/><path d="M8.5 4v13.5M15.5 6.5V20"/></svg>`,
    arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
    go: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>`,
    test: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8.5 4.5h-2a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-13a2 2 0 0 0-2-2h-2"/><rect x="8.5" y="2.5" width="7" height="4" rx="1.2"/><path d="m8.5 13.5 2.3 2.3 4.7-4.8"/></svg>`,
    bubble: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4.5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8l-5 4v-4H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z"/></svg>`,
    calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>`,
    // A task's tag: a checked circle (done), a clock (late) — as the topic page's.
    statusDone: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="currentColor"/><path d="m7 12.5 3.3 3.3L17 9" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,
  };

  function esc(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function fmtDue(day) {
    const [y, m, d] = day.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" });
  }

  function exerciseUrl(hw) {
    // A lesson the teacher created ("lesson-my-<id>") plays in the library's player.
    if (hw.topicId === "my-lessons") {
      return `/services/ready-lessons?from=student&mylesson=${encodeURIComponent(hw.exerciseId.replace(/^lesson-my-/, ""))}&s=${encodeURIComponent(key)}`;
    }
    // A task from the teacher's diary may be in a school subject's area (`page`).
    const page = /^\/[a-z/-]+$/.test(hw.page || "") ? hw.page : "/services/english";
    return `${page}?s=${encodeURIComponent(key)}#${encodeURIComponent(hw.topicId)}/${encodeURIComponent(hw.exerciseId)}`;
  }

  // A task from the teacher's diary opens on its lesson's day (`opensOn`):
  // until then it shows locked, under "נפתח בקרוב".
  function isLocked(hw) {
    return !hw.doneAt && !!hw.opensOn && hw.opensOn > todayKey();
  }

  // Open work first (soonest due date first), then what's done.
  function sorted(list) {
    const open = list.filter((hw) => !hw.doneAt && !isLocked(hw)).sort((a, b) => (a.opensOn || "").localeCompare(b.opensOn || "") || (a.dueDate || "9999").localeCompare(b.dueDate || "9999") || a.assignedAt.localeCompare(b.assignedAt));
    const done = list.filter((hw) => hw.doneAt).sort((a, b) => b.doneAt.localeCompare(a.doneAt));
    return [...open, ...done];
  }

  // The locked tasks, the soonest day first; a day's in the order they were
  // sent (each lesson, then its practice).
  function lockedTasks(list) {
    return list.filter(isLocked).sort((a, b) => a.opensOn.localeCompare(b.opensOn) || a.assignedAt.localeCompare(b.assignedAt));
  }

  function opensLabel(day) {
    const [y, m, d] = day.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) return "נפתח מחר";
    return `נפתח ב${date.toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "numeric" })}`;
  }

  function hwLate(hw) {
    return DUE_DATES && !hw.doneAt && !!hw.dueDate && hw.dueDate < todayKey();
  }

  // The level an exercise type stands for, the same as english-more.js: the
  // number on the card's notebook.
  const TYPE_LEVEL = { choice: 1, match: 1, picture: 1, "pick-picture": 1, translate: 1, listen: 2, truefalse: 2, order: 2, letters: 2, "find-error": 2, "sentence-choice": 2, speak: 2, write: 3, dictation: 3 };

  // A spiral notebook with the level on its page, as on the topic page.
  const exerciseIcon = (level) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="2.5" width="15" height="19" rx="2.5"/><path d="M3 7h4M3 12h4M3 17h4"/><text class="stu-ex-num" x="13" y="16.4" text-anchor="middle">${level}</text></svg>`;

  // A task looks much as its exercise does on the topic page
  // (english-learning.js exerciseCard): the notebook with the level, the
  // name and the yellow "לתרגול" — no "i". "בוצע" / "באיחור" is a tag on
  // the card's top edge.
  // A lesson's practice from the diary (type "set") has a notebook pile for
  // an icon, and once started, how many of its exercises are done.
  function homeworkCard(hw) {
    const late = hwLate(hw);
    const lesson = hw.type === "lesson";
    const set = hw.type === "set";
    const locked = isLocked(hw);
    const tag = hw.doneAt
      ? `<span class="stu-ex-tag is-done">${ICONS.statusDone}<span>${lesson ? "צפית" : "בוצע"}</span></span>`
      : locked
        ? `<span class="stu-ex-tag is-locked">${ICONS.lock}<span>${esc(opensLabel(hw.opensOn))}</span></span>`
        : late
          ? `<span class="stu-ex-tag is-late">${ICONS.clock}<span>באיחור</span></span>`
          : "";
    const icon = lesson ? TASK_ICONS.lesson : set ? TASK_ICONS.set : exerciseIcon(TYPE_LEVEL[hw.type] || 1);
    const total = set ? (hw.items || []).length : 0;
    const did = set ? (hw.parts || []).length : 0;
    const progress = set && !hw.doneAt && !locked && did ? `<span class="stu-ex-sub">${did} מתוך ${total} תרגילים</span>` : "";
    const title = locked
      ? `<span class="stu-ex-title">${esc(hw.exerciseTitle)}</span>`
      : `<a class="stu-ex-title" href="${esc(exerciseUrl(hw))}">${esc(hw.exerciseTitle)}</a>`;
    return `
      <li class="stu-ex-card${locked ? " is-locked" : ""}">
        ${tag}
        <span class="stu-ex-icon${lesson || set ? "" : " stu-ex-icon--level"}">${icon}</span>
        <span class="stu-ex-text">
          ${title}
          ${progress}
        </span>
        ${locked ? "" : `<span class="stu-ex-action" aria-hidden="true">${lesson ? "לשיעור" : hw.topicId === "placement" ? "למבחן" : "לתרגול"}</span>`}
      </li>`;
  }

  /* ── The bar on top, above the name: a square for each thing beside the
     tasks. The flame (the daily challenge: five short questions a day on
     the English page, and the streak of days in a row), the map and the
     prizes open in place of the tasks; the books open the lesson library. ── */

  const DAY_LETTERS = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];

  // The squares' own pictures, and the bar itself: student-bar.js, which
  // the library pages draw it with too.
  const TILE_ICONS = window.StudentBar.ICONS;

  // The daily challenge's tab: the streak, the last 7 days, and the way to
  // today's round on the English page (#daily/go).
  function dailyHtml(daily) {
    const streak = daily.streak
      ? daily.streak === 1 ? "רצף: יום אחד" : `רצף: ${daily.streak} ימים`
      : "התחילו רצף היום!";
    const days = (daily.week || [])
      .map((d, i, week) => {
        const letter = DAY_LETTERS[new Date(`${d.day}T12:00:00Z`).getUTCDay()];
        return `<li class="${d.done ? "is-done" : ""}${i === week.length - 1 ? " is-today" : ""}" aria-label="${letter}: ${d.done ? "עשית את האתגר" : "בלי אתגר"}"><i aria-hidden="true">${d.done ? ICONS.check : ""}</i><span aria-hidden="true">${letter}</span></li>`;
      })
      .join("");
    return `
      <section class="stu-daily stu-daily-page">
        <p class="stu-daily-line">5 שאלות קצרות בכל יום.</p>
        <p class="stu-daily-line">השאלות מעורבבות מהתרגילים שפתרת.</p>
        <p class="stu-daily-line">עושים את האתגר כל יום, והרצף גדל.</p>
        <div class="stu-daily-flame">${TILE_ICONS.flame}${daily.streak ? `<span>${daily.streak}</span>` : ""}</div>
        <p class="stu-daily-big">${esc(streak)}</p>
        <ol class="stu-daily-week" aria-label="7 הימים האחרונים">${days}</ol>
        ${daily.best > 1 ? `<p class="stu-daily-line">השיא שלך: ${daily.best} ימים</p>` : ""}
        ${daily.doneToday ? `<p class="stu-daily-line">עשית את האתגר של היום!</p>` : ""}
        <a class="btn ${daily.doneToday ? "" : "btn-primary "}btn-candy stu-btn stu-daily-go" href="/services/english?s=${encodeURIComponent(key)}#daily/go">${daily.doneToday ? "סבב נוסף" : "להתחיל"}</a>
      </section>`;
  }

  /* ── The word cards (#cards on the English page): how many wait today. ── */

  // Hidden for now; true brings the tile back to the tasks tab.
  const SHOW_CARDS_TILE = false;

  function cardsHtml(cards) {
    if (!SHOW_CARDS_TILE || !cards) return "";
    const line = cards.due
      ? cards.due === 1 ? "כרטיס אחד מחכה לך היום." : `${cards.due} כרטיסים מחכים לך היום.`
      : cards.seen ? "סיימת את הכרטיסים של היום!" : "לומדים מילים חדשות בכרטיסים.";
    return `
      <section class="stu-daily stu-cards">
        <div class="stu-daily-head">
          <span class="stu-daily-icon" aria-hidden="true">${ICONS.cards}</span>
          <div class="stu-daily-text">
            <h2 class="stu-daily-title"><span class="stu-key">כרטיסיות מילים</span></h2>
            <p class="stu-daily-line">${esc(line)}</p>
            ${cards.learned ? `<p class="stu-daily-line"><b>${cards.learned === 1 ? "למדת מילה אחת" : `למדת ${cards.learned} מילים`}</b></p>` : ""}
          </div>
        </div>
        <a class="btn ${cards.due || !cards.seen ? "btn-primary " : ""}btn-candy stu-btn" href="/services/english?s=${encodeURIComponent(key)}#cards">לכרטיסיות</a>
      </section>`;
  }

  // A new sticker since the student last looked at their prizes.
  function newPrizeHtml(student) {
    const fresh = STICKERS_ON ? newStickers(student) : [];
    if (!fresh.length) return "";
    return `
      <a class="stu-new-prize" href="#prizes">
        ${stickerArtHtml(fresh[0])}
        <span class="stu-new-prize-text">
          <b>${fresh.length === 1 ? "קיבלת מדבקה חדשה!" : `קיבלת ${fresh.length} מדבקות חדשות!`}</b>
          <span>לפרסים שלי</span>
        </span>
      </a>`;
  }

  /* ── "הכיתה שלי" (#class): the updates the teacher posted to the classes
     the student joined (lib/classes.js) — a message, a task, an assignment,
     a guide — as a WhatsApp-like chat (class-chat.css). A task or an assignment has a "סיימתי" button,
     and the teacher sees who finished. Updates newer than the last visit
     to the tab are new: a dot on the class's square, and a note on the
     tasks. ── */

  const POST_KINDS = { note: "הודעה", exercise: "תרגיל", task: "משימה", assignment: "מטלה", guide: "הדרכה" };
  const DONE_KINDS = ["task", "assignment"];
  const CLASS_SEEN_KEY = "pleyi-class-seen";

  function allPosts(student) {
    return (student.classes || []).flatMap((c) => c.posts).sort((a, b) => b.at.localeCompare(a.at));
  }

  function classSeenAt() {
    try {
      return (JSON.parse(localStorage.getItem(CLASS_SEEN_KEY)) || {})[key] || "";
    } catch {
      return "";
    }
  }

  function markClassSeen(student) {
    const newest = allPosts(student)[0]?.at;
    if (!newest) return;
    try {
      const all = JSON.parse(localStorage.getItem(CLASS_SEEN_KEY)) || {};
      all[key] = newest;
      localStorage.setItem(CLASS_SEEN_KEY, JSON.stringify(all));
    } catch {
      /* ignore */
    }
  }

  function newPosts(student) {
    const seen = classSeenAt();
    return allPosts(student).filter((p) => p.at > seen);
  }

  // Older updates had a title; a chat message is just its words.
  function postLabel(post) {
    if (post.kind === "exercise" && post.task) return post.task.exerciseTitle;
    return post.title || String(post.text || "").split("\n")[0].slice(0, 80);
  }

  const chatDay = (iso) => new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" });

  // The day chip between the messages, as in WhatsApp.
  function chatDayLabel(iso) {
    if (chatDay(iso) === chatDay(new Date().toISOString())) return "היום";
    if (chatDay(iso) === chatDay(new Date(Date.now() - 86400000).toISOString())) return "אתמול";
    return new Date(iso).toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Jerusalem" });
  }

  function chatTime(iso) {
    return new Date(iso).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jerusalem" });
  }

  // A page of the site opens here; any other address in a new tab.
  function postLinkHtml(link) {
    if (!link) return "";
    const outside = !link.startsWith("/");
    return `<a class="btn btn-candy stu-btn stu-btn--again" href="${esc(link)}"${outside ? ' target="_blank" rel="noopener noreferrer"' : ""}>פתיחת הקישור</a>`;
  }

  const TASK_ICONS = {
    exercise: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/></svg>',
    // Two notebooks, one on the other, with a check: a lesson's practice.
    set: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3.5h10a2 2 0 0 1 2 2v11"/><rect x="4" y="6.5" width="13" height="15" rx="2"/><path d="m7.5 14 2.5 2.5 4-4.5"/></svg>',
    lesson: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  };

  // An exercise the teacher sent the class: its name and topic, and the
  // button that opens it — done once solved after it was sent (the server
  // works that out), with the score.
  function classTaskHtml(post) {
    const task = post.task;
    const lesson = task.type === "lesson";
    const url = exerciseUrl(task);
    const action = post.doneAt
      ? `<span class="stu-hw-done">${ICONS.check} ${lesson ? "צפית!" : `בוצע!${post.total ? ` <span dir="ltr">${post.score}/${post.total}</span>` : ""}`}</span>
         <a class="btn btn-candy stu-btn stu-btn--again" href="${esc(url)}">${lesson ? "לצפות שוב" : "לתרגל שוב"}</a>`
      : `<a class="btn btn-primary btn-candy stu-btn" href="${esc(url)}">${lesson ? "לשיעור" : "להתחלה"}</a>`;
    return {
      card: `
        <span class="cc-task">
          <span class="cc-task-icon">${lesson ? TASK_ICONS.lesson : TASK_ICONS.exercise}</span>
          <span class="cc-task-text">
            <b><bdi>${esc(task.exerciseTitle)}</bdi></b>
            <small><bdi>${esc(task.topicTitle)}</bdi></small>
          </span>
        </span>`,
      action,
    };
  }

  // One message from the teacher: a chip for a task / an assignment / a
  // guide / an exercise, the words, the due date, and "סיימתי" on a task
  // (an exercise has its own button).
  function chatMsgHtml(post, tail) {
    const exercise = post.kind === "exercise" && post.task ? classTaskHtml(post) : null;
    const canDone = DONE_KINDS.includes(post.kind);
    const late = DUE_DATES && (canDone || exercise) && !post.doneAt && !!post.dueDate && post.dueDate < todayKey();
    const done = exercise
      ? exercise.action
      : canDone
      ? post.doneAt
        ? `<span class="stu-hw-done">${ICONS.check} סיימתי!</span>
           <button type="button" class="stu-post-undo" data-post-done="${esc(post.id)}" data-done="0">ביטול</button>`
        : `<button type="button" class="btn btn-primary btn-candy stu-btn" data-post-done="${esc(post.id)}" data-done="1">סיימתי</button>`
      : "";
    return `
      <li class="cc-msg is-in is-${esc(post.kind)}${tail ? " has-tail" : ""}${post.doneAt ? " is-done" : ""}">
        ${post.kind !== "note" ? `<span class="cc-kind">${esc(POST_KINDS[post.kind] || POST_KINDS.note)}</span>` : ""}
        ${exercise ? exercise.card : ""}
        ${post.title ? `<p class="cc-title">${esc(post.title)}</p>` : ""}
        ${post.text ? `<p class="cc-text">${esc(post.text)}</p>` : ""}
        ${DUE_DATES && post.dueDate ? `<span class="cc-due${late ? " is-late" : ""}">${ICONS.calendar}${late ? "באיחור — " : ""}עד ${esc(fmtDue(post.dueDate))}</span>` : ""}
        ${post.link || done ? `<div class="cc-actions">${postLinkHtml(post.link)}${done}</div>` : ""}
        <span class="cc-meta"><span class="cc-time">${esc(chatTime(post.at))}</span></span>
      </li>`;
  }

  // The messages oldest first, a day chip where the day changes, and a
  // "הודעות חדשות" bar before the first one since the last visit.
  function chatLogHtml(posts, seen) {
    let lastDay = "";
    let unread = false;
    return [...posts]
      .sort((a, b) => a.at.localeCompare(b.at))
      .map((post) => {
        let head = "";
        if (chatDay(post.at) !== lastDay) {
          lastDay = chatDay(post.at);
          head += `<li class="cc-day"><span>${esc(chatDayLabel(post.at))}</span></li>`;
        }
        if (seen && post.at > seen && !unread) {
          unread = true;
          head += `<li class="cc-unread" data-unread><span>הודעות חדשות</span></li>`;
        }
        return head + chatMsgHtml(post, !!head);
      })
      .join("");
  }

  // Each class the student joined is a chat, as in a WhatsApp group where
  // only the teacher writes. `seen`: the newest update shown on the last
  // visit, read before this visit marks everything seen.
  function classHtml(student, seen) {
    return liveHtml() + (student.classes || [])
      .map(
        (c) => `
        <section class="stu-class class-chat" data-chat="${esc(c.id)}">
          <header class="cc-head">
            <span class="cc-avatar" aria-hidden="true">${TILE_ICONS.board}</span>
            <span class="cc-head-text">
              <b class="cc-name"><bdi>${esc(c.name)}</bdi></b>
              ${c.teacherName ? `<span class="cc-sub">המורה: <bdi>${esc(c.teacherName)}</bdi></span>` : ""}
            </span>
          </header>
          <ol class="cc-log" aria-label="ההודעות מהמורה">
            ${c.posts.length ? chatLogHtml(c.posts, seen) : `<li class="cc-notice">המורה עוד לא שלח הודעות לכיתה</li>`}
          </ol>
          <p class="cc-locked">${ICONS.lock}רק המורה שולח הודעות בכיתה</p>
        </section>`
      )
      .join("");
  }

  // The chat opens at the new messages, or at the newest; after "סיימתי"
  // it stays where it was.
  let chatScroll = null;

  function bindClass() {
    app.querySelectorAll(".class-chat").forEach((chat) => {
      const log = chat.querySelector(".cc-log");
      const kept = chatScroll?.[chat.dataset.chat];
      if (kept !== undefined) log.scrollTop = kept;
      else {
        const unread = log.querySelector("[data-unread]");
        log.scrollTop = unread ? unread.offsetTop - 8 : log.scrollHeight;
      }
    });
    chatScroll = null;
    app.querySelectorAll("[data-post-done]").forEach((btn) =>
      btn.addEventListener("click", async () => {
        btn.disabled = true;
        chatScroll = Object.fromEntries([...app.querySelectorAll(".class-chat")].map((chat) => [chat.dataset.chat, chat.querySelector(".cc-log").scrollTop]));
        try {
          const res = await fetch("/api/class-done", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-student-key": key },
            body: JSON.stringify({ postId: btn.dataset.postDone, done: btn.dataset.done === "1" }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data.ok) throw new Error(data.error || "לא הצלחנו לשמור — נסו שוב");
          const post = allPosts(current).find((p) => p.id === btn.dataset.postDone);
          if (post) post.doneAt = data.doneAt;
          render(current);
        } catch (err) {
          btn.disabled = false;
          btn.insertAdjacentHTML("afterend", `<span class="stu-test-error" role="alert">${esc(err.message)}</span>`);
        }
      })
    );
  }

  // On the tasks (the student's own area): the way into the class, for a
  // student in one — what's new from the teacher while updates wait.
  function newClassHtml(student) {
    const classes = student.classes || [];
    if (!classes.length) return "";
    const fresh = newPosts(student);
    const title = fresh.length ? (fresh.length === 1 ? "עדכון חדש מהמורה!" : `${fresh.length} עדכונים חדשים מהמורה!`) : "חדר הכיתה";
    const line = fresh.length ? postLabel(fresh[0]) : classes.length === 1 ? classes[0].name : `${classes.length} כיתות`;
    return `
      <a class="stu-new-prize stu-new-class${fresh.length ? " is-fresh" : ""}" href="#class">
        <span class="stu-new-class-art">${TILE_ICONS.board}</span>
        <span class="stu-new-prize-text">
          <b>${title}</b>
          <span><bdi>${esc(line)}</bdi></span>
        </span>
        ${fresh.length ? `<i class="stu-top-dot" aria-hidden="true"></i>` : ""}
      </a>`;
  }

  /* ── Tests the teacher sent: each opens on the English page (#test/<id>).
     Once handed in it shows its grade and a way to ask for a retake; a
     retake the teacher opened shows as a test to take again. ── */

  function testUrl(test) {
    return `/services/english?s=${encodeURIComponent(key)}#test/${encodeURIComponent(test.id)}`;
  }

  function testIsOpen(test) {
    return (test.attempts || []).length < (test.allowed || 1);
  }

  // Open tests first (soonest due first), then the handed-in ones, newest first.
  function sortedTests(list) {
    const lastAt = (t) => String(t.attempts?.[t.attempts.length - 1]?.at || "");
    const open = list.filter(testIsOpen).sort((a, b) => (a.dueDate || "9999").localeCompare(b.dueDate || "9999") || a.assignedAt.localeCompare(b.assignedAt));
    const done = list.filter((t) => !testIsOpen(t)).sort((a, b) => lastAt(b).localeCompare(lastAt(a)));
    return [...open, ...done];
  }

  function testLate(test) {
    return DUE_DATES && testIsOpen(test) && !test.attempts?.length && !!test.dueDate && test.dueDate < todayKey();
  }

  // A test card says little: its name, one small chip (the date, or the
  // grade once handed in) and the teacher's word in a bubble. The topics
  // show inside the test.
  function testCard(test) {
    const attempts = test.attempts || [];
    const last = attempts[attempts.length - 1];
    const open = testIsOpen(test);
    const late = testLate(test);
    const grade = last?.total ? Math.round((last.score / last.total) * 100) : 0;
    const [y, m, d] = (test.dueDate || "").split("-").map(Number);
    const chip = !open
      ? `<span class="stu-test-chip is-grade">ציון <b dir="ltr">${grade}</b></span>${
          !test.retakeAt && test.retakeDeclinedAt ? `<span class="stu-test-chip">לא נפתח מבחן חוזר</span>` : ""
        }`
      : late
        ? `<span class="stu-test-chip is-late">באיחור</span>`
        : DUE_DATES && test.dueDate
          ? `<span class="stu-test-chip">${ICONS.calendar}עד ${esc(new Date(y, m - 1, d).toLocaleDateString("he-IL", { day: "numeric", month: "long" }))}</span>`
          : "";
    const note = open && test.note ? `<span class="stu-test-chip stu-test-note">${ICONS.bubble}${esc(test.note)}</span>` : "";
    const action = open
      ? `<a class="btn btn-primary btn-candy stu-btn" href="${esc(testUrl(test))}">${last ? "מבחן חוזר" : "התחלה"}${ICONS.go}</a>`
      : test.retakeAt
        ? `<span class="stu-test-asked">ביקשת מבחן חוזר</span>`
        : `<button type="button" class="btn btn-candy stu-btn stu-btn--again" data-retake="${esc(test.id)}">בקשת מבחן חוזר</button>`;
    return `
      <li class="stu-hw stu-test${open ? "" : " is-done"}${late ? " is-late" : ""}">
        <span class="stu-hw-badge" aria-hidden="true">${open ? ICONS.test : ICONS.check}</span>
        <div class="stu-hw-body">
          <span class="stu-hw-title">${esc(test.title)}</span>
          ${chip || note ? `<span class="stu-test-meta">${chip}${note}</span>` : ""}
        </div>
        <div class="stu-hw-action">${action}</div>
      </li>`;
  }

  function testsHtml(student) {
    const list = sortedTests(student.tests || []);
    if (!list.length) return "";
    return boxHtml("מבחנים", list.filter(testIsOpen).length, `<ol class="stu-hw-list">${list.map(testCard).join("")}</ol>`);
  }

  /* ── The tasks tab: the homework, and the tests when the teacher sent
     any — each straight on the page, no box: a title with how many are
     left, then a row for each. ── */

  function boxHtml(title, left, details, extra = "") {
    // No "how many left" pill — only a "done" mark once nothing is left.
    const count = left ? "" : `<span class="stu-box-count is-done">${ICONS.check}הכול בוצע</span>`;
    return `
      <section class="stu-box${extra ? ` ${extra}` : ""}">
        <div class="stu-box-head">
          <h2 class="stu-box-title"><span class="stu-key">${esc(title)}</span></h2>
          ${count}
        </div>
        ${details}
      </section>`;
  }

  function bindTasks() {
    app.querySelectorAll("[data-retake]").forEach((btn) =>
      btn.addEventListener("click", async () => {
        btn.disabled = true;
        const res = await window.StudentProgress.askRetake(btn.dataset.retake);
        const test = (current?.tests || []).find((t) => t.id === btn.dataset.retake);
        if (res.ok && test) {
          Object.assign(test, res.test);
          render(current);
          return;
        }
        btn.disabled = false;
        btn.insertAdjacentHTML("afterend", `<span class="stu-test-error" role="alert">${esc(res.error)}</span>`);
      })
    );
  }

  /* ── A live lesson the teacher opened to the student's class (lib/
     live-lessons.js): on top of the personal area and the class, a button
     into it (/live/<code>). It comes and goes as the teacher starts and
     ends it — the page listens on the live line. ── */
  let liveNow = [];
  const LIVE_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none"/><path d="M8.2 15.8a5.4 5.4 0 0 1 0-7.6M15.8 8.2a5.4 5.4 0 0 1 0 7.6M5.3 18.7a9.5 9.5 0 0 1 0-13.4M18.7 5.3a9.5 9.5 0 0 1 0 13.4"/></svg>`;

  function liveHtml() {
    return liveNow
      .map(
        (l) => `
      <a class="stu-new-prize stu-live-now" href="/live/${encodeURIComponent(l.code)}">
        <span class="stu-live-art">${LIVE_ICON}</span>
        <span class="stu-new-prize-text">
          <b>המורה מציג שיעור עכשיו!</b>
          <span><bdi>${esc(l.title || "לוחצים ונכנסים לשיעור")}</bdi></span>
        </span>
        <span class="stu-live-go">הצטרפות</span>
      </a>`
      )
      .join("");
  }

  function setLive(list) {
    const next = (Array.isArray(list) ? list : []).filter((l) => /^\d{4}$/.test(String(l?.code || "")));
    if (JSON.stringify(next) === JSON.stringify(liveNow)) return;
    liveNow = next;
    if (current && ["tasks", "class"].includes(currentTab())) render(current);
  }

  function watchLive(student) {
    if (teacherView || !(student.classes || []).length || window.__stuLiveWatch) return;
    window.__stuLiveWatch = true;
    const s = document.createElement("script");
    s.src = "/socket.io/socket.io.js";
    s.onload = () => {
      const socket = window.io();
      socket.on("connect", () => {
        socket.emit("live:watch", { key }, (res) => {
          if (res?.ok) setLive(res.live);
        });
      });
      socket.on("live:class", setLive);
    };
    document.head.appendChild(s);
  }

  function tasksHtml(student) {
    const list = sorted(student.homework || []);
    const left = list.filter((hw) => !hw.doneAt).length;
    const locked = lockedTasks(student.homework || []);
    // The homework sits under the tests, when the teacher sent any; with no
    // homework, one line.
    const homework = list.length
      ? boxHtml("משימות", left, `<ul class="stu-ex-grid">${list.map(homeworkCard).join("")}</ul>`, "stu-box--ex")
      : `<section class="stu-box stu-box--empty">
          <h2 class="stu-box-title"><span class="stu-key">משימות</span></h2>
          <p class="stu-box-none">${locked.length ? "אין משימות פתוחות היום" : "המורה לא השאיר משימות בינתיים"}</p>
        </section>`;
    // What the teacher planned for the coming days: locked until its day.
    const soon = locked.length
      ? `<section class="stu-box stu-box--ex stu-box--soon">
          <div class="stu-box-head">
            <h2 class="stu-box-title"><span class="stu-key">נפתח בקרוב</span></h2>
          </div>
          <ul class="stu-ex-grid">${locked.map(homeworkCard).join("")}</ul>
        </section>`
      : "";
    return `
      ${liveHtml()}
      ${newClassHtml(student)}
      ${testsHtml(student)}
      ${homework}
      ${soon}
      ${newPrizeHtml(student)}
      ${cardsHtml(student.cards)}`;
  }

  /* ── "My map": the learning path, a stage at a time. On top, how far the
     student got on the whole path; under it a card for every stage, up to
     the goal — reading an unseen — and the vocabulary topics after it. One
     stage is open: the one the student practiced in last. An open stage
     shows its topics as numbered dots, coloured by what the student did,
     and the topic picked under them — how far they got and the way into
     it; its lessons and the exercises they solved open in a dialog.
     Every subject the student practiced has a map of its own: with more
     than one, buttons on top pick it — at first the one practiced last. ── */

  // What the page can show, by the link's #hash; the tasks when there's none.
  const VIEWS = ["tasks", "class", "daily", "map", "prizes", "library"];

  const STATUS = {
    done: { node: "סיימת", about: "סיימת את כל הנושא — כל הכבוד!" },
    started: { node: "התחלת", about: "התחלת את הנושא." },
    skipped: { node: "דילגת", about: "דילגת על הנושא הזה.\nאפשר לחזור אליו מתי שרוצים." },
    ahead: { node: "עוד לא", about: "עוד לא הגעת לנושא הזה." },
  };

  let current = null;

  // The subject the map shows ({ id, title, map }), and the one the student
  // picked on its buttons.
  let shown = null;
  let pickedSubject = null;

  // Where a subject's topics are; the school subjects are /services/<id>.
  const SUBJECT_PAGES = { english: "/services/english", "road-safety": "/road-safety" };

  // The daily challenge and the prizes are off the bar for now
  // (StudentBar.ALL_TABS): their #hash opens the student's own area.
  const HIDDEN_VIEWS = window.StudentBar.ALL_TABS ? [] : ["daily", "prizes"];

  function currentTab() {
    const tab = location.hash.slice(1);
    return VIEWS.includes(tab) && !HIDDEN_VIEWS.includes(tab) ? tab : "tasks";
  }

  // Coming in through the link from outside the site (a message, a saved
  // link, the app), the page always opens on the student's own area, even
  // with an old #hash on it; from the site's own pages (the bar on a library
  // page), the back button or a reload it keeps the #hash.
  (() => {
    if (!location.hash || location.hash === "#tasks" || teacherView) return;
    const nav = performance.getEntriesByType?.("navigation")?.[0];
    if (nav && nav.type !== "navigate") return;
    let fromSite = false;
    try {
      fromSite = !!document.referrer && new URL(document.referrer).origin === location.origin;
    } catch {
      /* ignore */
    }
    if (!fromSite) history.replaceState(null, "", location.pathname + location.search);
  })();

  function topicUrl(topic) {
    const page = SUBJECT_PAGES[shown.id] || `/services/${shown.id}`;
    return `${page}?s=${encodeURIComponent(key)}#${encodeURIComponent(topic.id)}`;
  }

  function percent(topic) {
    return topic.items ? Math.round((topic.did / topic.items) * 100) : 0;
  }

  // The share of the lessons and exercises the student did in these topics.
  function share(topics) {
    const items = topics.reduce((sum, topic) => sum + topic.items, 0);
    const did = topics.reduce((sum, topic) => sum + topic.did, 0);
    return items ? Math.round((did / items) * 100) : 0;
  }

  // Each stage's first topic number: they run on along the whole path, as
  // on the Learn English page.
  function firstNums(stages) {
    let num = 1;
    return stages.map((stage) => {
      const first = num;
      num += stage.topics.length;
      return first;
    });
  }

  // The topic a stage shows when it opens: the first one not done yet.
  function firstOpen(stage) {
    return Math.max(0, stage.topics.findIndex((topic) => topic.status !== "done"));
  }

  // The stage the placement test (#placement on the English page) said to
  // start in, while the student hasn't practiced since; -1 otherwise. Only
  // the English map has one (lib/english-map.js).
  function placedStage(map) {
    const placed = map.placement;
    if (!placed?.stageId) return -1;
    const last = lastPractice(map);
    if (last && last > placed.at) return -1;
    return map.stages.findIndex((stage) => stage.id === placed.stageId);
  }

  // The stage open with the map, and its topic: just after a placement test
  // its stage, else where the student practiced last, or else the first
  // topic they haven't finished. None once every topic is done.
  function startPoint(map) {
    const stages = map.stages;
    const placed = placedStage(map);
    if (placed >= 0) return { stage: placed, topic: firstOpen(stages[placed]) };
    let stage = stages.findIndex((s) => s.topics.some((topic) => topic.id === map.here));
    if (stage >= 0) return { stage, topic: stages[stage].topics.findIndex((topic) => topic.id === map.here) };
    stage = stages.findIndex((s) => s.topics.some((topic) => topic.status !== "done"));
    return { stage, topic: stage >= 0 ? firstOpen(stages[stage]) : 0 };
  }

  // "השוואה: bigger, the biggest" → its Hebrew name and its English words,
  // each on a line of its own (mixed on one line, they come out jumbled).
  function titleParts(title) {
    const match = /^(.+?)(?::\s+|\s+[–-]\s+|(?<=\?)\s+)([A-Za-z].*)$/.exec(title);
    return match ? [match[1], match[2]] : [title, ""];
  }

  // A topic's dot: its number (a check once it's done), coloured by what
  // the student did. The topic they practiced last glows.
  function stepHtml(topic, i, num, picked, here) {
    const pct = percent(topic);
    return `
      <button type="button" class="stu-step is-${topic.status}${picked ? " is-picked" : ""}${here ? " is-here" : ""}" data-step="${i}" style="--p:${pct}" aria-pressed="${picked}"
        aria-label="נושא ${num}: ${esc(topic.title)} — ${esc(STATUS[topic.status].node)}${topic.status === "started" ? ` ${pct}%` : ""}">${topic.status === "done" ? ICONS.check : num}</button>`;
  }

  // The picked topic: its name and the way into it. The teacher has an "i"
  // too, with its lessons and the exercises the student solved.
  function focusHtml(topic) {
    const [name, en] = titleParts(topic.title);
    const more = teacherView
      ? `<button type="button" class="stu-focus-more" data-topic="${esc(topic.id)}" aria-haspopup="dialog" aria-label="שיעורים ותרגילים" title="שיעורים ותרגילים">${ICONS.info}</button>`
      : "";
    return `
      <div class="stu-focus">
        <h3 class="stu-focus-title">
          ${esc(name)}
          ${en ? `<span class="stu-focus-en" dir="ltr" lang="en">${esc(en)}</span>` : ""}
        </h3>
        <div class="stu-focus-acts">
          <a class="btn btn-primary btn-candy stu-btn" href="${esc(topicUrl(topic))}">${topic.did ? "להמשיך" : "להתחיל"}</a>
          ${more}
        </div>
      </div>`;
  }

  // An open stage: its topics as dots on a line — green up to the furthest
  // one the student did something in — and the picked topic under them.
  // The vocabulary topics have no order, so no line.
  function stageBodyHtml(stage, first, picked, here) {
    const topics = stage.topics;
    const last = topics.reduce((end, topic, i) => (topic.did ? i : end), -1);
    const walked =
      !stage.side && last > 0 ? `<span class="stu-steps-walked" style="width:calc((100% - 36px) * ${last / (topics.length - 1)})"></span>` : "";
    return `
      <div class="stu-steps${stage.side ? " is-loose" : ""}">
        ${walked}
        ${topics.map((topic, i) => stepHtml(topic, i, first + i, i === picked, topic.id === here)).join("")}
      </div>
      ${focusHtml(topics[picked])}`;
  }

  // A stage's card: its name, and a ring with its number that fills with
  // how much of it is done. Tapping the card opens it. Green once every
  // topic is done, yellow for the stage the student goes on in — that card
  // also says where to go on, with a way straight into it. (Certificates
  // are on the prizes tab.)
  function stageHtml(stages, index, first, open, picked, here, next) {
    const { stage, num } = stageName(stages, index);
    const done = stage.topics.filter((topic) => topic.status === "done").length;
    const total = stage.topics.length;
    const pct = share(stage.topics);
    const goOn = next && stage.topics.includes(next);
    const mark = next ? goOn : stage.topics.some((topic) => topic.id === here);
    const tint = done === total ? "#e4f8ea" : mark ? "#fff4d6" : "#eaf5ff";
    const ring =
      done === total
        ? `<span class="stu-ring is-full" aria-hidden="true">${ICONS.check}</span>`
        : `<span class="stu-ring${pct ? "" : " is-zero"}" style="--p:${pct}" aria-hidden="true">${num || ICONS.cards}</span>`;
    const [nextName] = goOn ? titleParts(next.title) : [""];
    return `
      <section class="stu-stage${open ? " is-open" : ""}${goOn ? " is-next" : ""}" data-stage="${index}" style="--tint:${tint}">
        <div class="stu-stage-head">
          ${ring}
          <h2 class="stu-stage-title">
            <button type="button" class="stu-stage-open" aria-expanded="${open}" aria-controls="stuStage${index}"
              aria-label="${esc(stage.title)} — ${num ? `שלב ${num}` : "לאורך כל הדרך"}, ${done} מתוך ${total} נושאים">${esc(stage.title)}</button>
            ${goOn ? `<span class="stu-stage-next">${next.did ? "ממשיכים מכאן" : "הצעד הבא"}: <b>${esc(nextName)}</b></span>` : ""}
          </h2>
          ${goOn ? `<a class="stu-stage-go" href="${esc(topicUrl(next))}" aria-label="${next.did ? "ממשיכים מכאן" : "הצעד הבא"}: ${esc(nextName)}">${ICONS.go}</a>` : ""}
          <span class="stu-stage-chev" aria-hidden="true">${ICONS.chevron}</span>
        </div>
        <div class="stu-stage-body" id="stuStage${index}"${open ? "" : " hidden"}>${stageBodyHtml(stage, first, picked, here)}</div>
      </section>`;
  }

  // The subjects on the map: English and the school subjects the student
  // did something in (lib/english-map.js) — English alone when there's none.
  function mapSubjects(student) {
    const english = { id: "english", title: "אנגלית", map: student.map };
    const list = [english, ...(student.subjects || [])].filter((subject) => subject.map?.here);
    return list.length ? list : [english];
  }

  function lastPractice(map) {
    return map.stages.flatMap((stage) => stage.topics).reduce((last, topic) => (topic.lastAt > last ? topic.lastAt : last), "");
  }

  function subjectShare(subject) {
    return share(subject.map.stages.flatMap((stage) => stage.topics));
  }

  // The whole path: a box that fills with moving liquid up to the share of
  // its lessons and exercises the student did, the subject's name and that
  // share on it. The student's page has its title on top ("ההתקדמות שלי").
  // A tap on it lists every subject the student started, to switch to.
  function summaryHtml(subject) {
    const pct = subjectShare(subject);
    const title = [teacherView ? "ההתקדמות" : "", subject.title].filter(Boolean).join(" · ");
    return `
      <button type="button" class="stu-map-sum stu-tank" style="--p:${pct}" aria-haspopup="dialog" aria-label="${esc(title)}: עשית ${pct}% מהדרך. החלפת מקצוע">
        <span class="stu-tank-liquid" aria-hidden="true"></span>
        <span class="stu-tank-text" aria-hidden="true">
          <span class="stu-tank-name">${esc(title)}</span>
          <b class="stu-tank-pct" dir="ltr">${pct}%</b>
        </span>
      </button>`;
  }

  // The subjects the student started, each with how far they got; the one
  // shown is teal.
  function subjectsDialogHtml(list) {
    return `
      <div class="stu-dlg-body">
        <div class="stu-dlg-head">
          <span class="stu-dlg-num"></span>
          <button type="button" class="stu-dlg-close" id="stuDlgClose" aria-label="סגירה">${ICONS.close}</button>
        </div>
        <h2 class="stu-dlg-title" id="stuDlgTitle"><span class="stu-key">המקצועות שלי</span></h2>
        <ul class="stu-subj-list">
          ${list
            .map((subject) => {
              const pct = subjectShare(subject);
              return `
            <li>
              <button type="button" class="stu-subj${subject === shown ? " is-on" : ""}" data-subject="${esc(subject.id)}" aria-pressed="${subject === shown}" style="--p:${pct}">
                <span class="stu-subj-name">${esc(subject.title)}</span>
                <span class="stu-subj-bar" aria-hidden="true"><i></i></span>
                <b class="stu-subj-pct" dir="ltr">${pct}%</b>
              </button>
            </li>`;
            })
            .join("")}
        </ul>
        ${list.length < 2 ? `<p class="stu-dlg-none">כשמתחילים לתרגל מקצוע נוסף,<br>הוא יופיע כאן.</p>` : ""}
      </div>`;
  }

  // The end of the road: a finish gate — a checkered banner on two striped
  // posts with waving flags — and under it the trophy on a podium, stars
  // twinkling around it; how many topics are left under the words. Once
  // every topic is done the trophy is a button and confetti falls
  // (bindFinish).
  const FINISH_SPARK = (x, y, s, delay) =>
    `<g transform="translate(${x} ${y})"><path class="stu-gate-spark" style="animation-delay:${delay}s" d="M0 ${-s}Q0 0 ${s} 0Q0 0 0 ${s}Q0 0 ${-s} 0Q0 0 0 ${-s}Z"/></g>`;

  const FINISH_GATE = `<svg class="stu-gate-art" viewBox="0 0 320 200" aria-hidden="true">
      <defs>
        <pattern id="stuGateChk" width="18" height="18" patternUnits="userSpaceOnUse" x="14" y="34">
          <rect width="18" height="18" fill="#fff"/>
          <rect width="9" height="9" fill="#000"/>
          <rect x="9" y="9" width="9" height="9" fill="#000"/>
        </pattern>
        <pattern id="stuGatePole" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
          <rect width="16" height="16" fill="#eaf5ff"/>
          <rect width="16" height="8" fill="#3aa7ef"/>
        </pattern>
      </defs>
      <g stroke="#000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <path d="M32 36V6M288 36V6" stroke-width="4"/>
        <path class="stu-gate-flag" d="M34 8 64 17 34 26Z" fill="#ff5a5f"/>
        <path class="stu-gate-flag is-right" d="M286 8 256 17 286 26Z" fill="#FFE135"/>
        <rect x="27" y="44" width="16" height="152" rx="5" fill="#000" stroke="none"/>
        <rect x="283" y="44" width="16" height="152" rx="5" fill="#000" stroke="none"/>
        <rect x="24" y="40" width="16" height="152" rx="5" fill="url(#stuGatePole)"/>
        <rect x="280" y="40" width="16" height="152" rx="5" fill="url(#stuGatePole)"/>
        <rect x="17" y="38" width="292" height="36" rx="8" fill="#000" stroke="none"/>
        <rect x="14" y="34" width="292" height="36" rx="8" fill="url(#stuGateChk)"/>
        <rect x="121" y="170" width="84" height="26" rx="6" fill="#000" stroke="none"/>
        <rect x="118" y="166" width="84" height="26" rx="6" fill="#eaf5ff"/>
        <path d="m160 172 2.4 4.8 5.3.8-3.8 3.7.9 5.2-4.8-2.5-4.8 2.5.9-5.2-3.8-3.7 5.3-.8Z" fill="#FFE135" stroke-width="2"/>
        <g fill="#FFE135" stroke-width="2">
          ${FINISH_SPARK(98, 104, 11, 0)}${FINISH_SPARK(224, 96, 13, -0.6)}${FINISH_SPARK(116, 146, 7, -1.1)}${FINISH_SPARK(208, 144, 8, -1.5)}
        </g>
      </g>
    </svg>`;

  const FINISH_CUP = `<svg viewBox="0 0 48 48" aria-hidden="true" stroke="#000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 10H8a6.5 6.5 0 0 0 8 9M34 10h6a6.5 6.5 0 0 1-8 9" fill="none"/>
      <path d="M13 5h22v13a11 11 0 0 1-22 0V5Z" fill="#FFE135"/>
      <path d="M20 29h8l1 7h-10l1-7Z" fill="#FFE135"/>
      <rect x="14" y="36" width="20" height="7" rx="2" fill="#FFE135"/>
      <path d="m24 10 1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4-2.9-2.8 4-.6Z" fill="#fff" stroke-width="2"/>
    </svg>`;

  function finishHtml(map) {
    const topics = map.stages.flatMap((stage) => stage.topics);
    const left = topics.filter((topic) => topic.status !== "done").length;
    if (!topics.length || left)
      return `
      <section class="stu-finish" aria-label="היעד הסופי">
        <span class="stu-gate">
          ${FINISH_GATE}
          <span class="stu-finish-cup">${FINISH_CUP}</span>
        </span>
        <b class="stu-finish-text"><span class="stu-key">היעד הסופי</span></b>
        ${left ? `<span class="stu-finish-left">${left === 1 ? "עוד נושא אחד לגביע" : `עוד ${left} נושאים לגביע`}</span>` : ""}
      </section>`;
    return `
      <section class="stu-finish is-done" aria-label="הגעת ליעד הסופי">
        <span class="stu-confetti" aria-hidden="true"></span>
        <span class="stu-gate">
          ${FINISH_GATE}
          <button type="button" class="stu-finish-cup" aria-label="עוד קונפטי">${FINISH_CUP}</button>
        </span>
        <b class="stu-finish-text"><span class="stu-key">הגעת ליעד! כל הכבוד!</span></b>
      </section>`;
  }

  // Confetti over the finish once it comes into view, and again on every
  // tap on the trophy.
  const CONFETTI_COLORS = ["#FFE135", "#00E5CC", "#3aa7ef", "#1f9d55", "#ff9f1c", "#fff"];

  function burstConfetti(layer) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    layer.innerHTML = Array.from({ length: 46 }, (_, i) => {
      const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
      const style = [
        `--x:${(Math.random() * 100).toFixed(1)}%`,
        `--drift:${Math.round(Math.random() * 80 - 40)}px`,
        `--spin:${Math.round(Math.random() * 720 - 360)}deg`,
        `--delay:${(Math.random() * 0.6).toFixed(2)}s`,
        `--dur:${(1.8 + Math.random() * 1.4).toFixed(2)}s`,
        `background:${color}`,
      ].join(";");
      return `<i class="${i % 3 === 0 ? "is-round" : ""}" style="${style}"></i>`;
    }).join("");
  }

  function bindFinish(box) {
    const finish = box.querySelector(".stu-finish.is-done");
    if (!finish) return;
    const layer = finish.querySelector(".stu-confetti");
    finish.querySelector(".stu-finish-cup").addEventListener("click", () => burstConfetti(layer));
    if (!("IntersectionObserver" in window)) return burstConfetti(layer);
    const seen = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      seen.disconnect();
      burstConfetti(layer);
    }, { threshold: 0.6 });
    seen.observe(finish);
  }

  // Where to go on: the topic the student practiced last while it isn't
  // done, or else the first one after it on the road that isn't (then from
  // the road's start, then the vocabulary topics). None once all are done.
  function nextTopic(map) {
    const road = map.stages.filter((stage) => !stage.side).flatMap((stage) => stage.topics);
    const side = map.stages.filter((stage) => stage.side).flatMap((stage) => stage.topics);
    const open = (topic) => topic.status !== "done";
    // Just after a placement test: the first open topic from its stage on.
    const placed = placedStage(map);
    if (placed >= 0) {
      const from = road.indexOf(map.stages[placed].topics[0]);
      const after = from >= 0 ? road.slice(from).find(open) : null;
      if (after) return after;
    }
    const here = [...road, ...side].find((topic) => topic.id === map.here);
    if (here && open(here)) return here;
    return road.slice(road.indexOf(here) + 1).find(open) || road.find(open) || side.find(open) || null;
  }

  function mapHtml(student) {
    return `
      <div class="stu-map">${mapBodyHtml(student)}</div>
      <dialog class="stu-dlg" id="stuTopicDlg" aria-labelledby="stuDlgTitle"></dialog>`;
  }

  function mapBodyHtml(student) {
    const list = mapSubjects(student);
    shown =
      list.find((subject) => subject.id === pickedSubject) ||
      list.reduce((last, subject) => (lastPractice(subject.map) > lastPractice(last.map) ? subject : last));
    const map = shown.map;
    if (!map?.stages?.length) return `<p class="stu-lead">לא הצלחנו לטעון את המפה. נסו לרענן.</p>`;
    const start = startPoint(map);
    const firsts = firstNums(map.stages);
    // Where the student goes on: its stage's card says so (not the teacher's).
    const next = teacherView ? null : nextTopic(map);
    const stages = (side) =>
      map.stages
        .map((stage, index) =>
          !!stage.side === side
            ? stageHtml(map.stages, index, firsts[index], index === start.stage, index === start.stage ? start.topic : firstOpen(stage), map.here, next)
            : ""
        )
        .join("");
    return `
      ${summaryHtml(shown)}
      ${stages(false)}
      ${stages(true)}
      ${finishHtml(map)}`;
  }

  function topicInfoHtml(topic, num, here) {
    const [name, en] = titleParts(topic.title);
    const lessons = topic.lessons.length
      ? `<h3 class="stu-dlg-sub">שיעורים</h3>
         <ul class="stu-dlg-list">
           ${topic.lessons
             .map(
               (lesson) => `
             <li class="stu-dlg-row${lesson.seen ? " is-on" : ""}">
               <span class="stu-dlg-mark" aria-hidden="true">${lesson.seen ? ICONS.check : ""}</span>
               <span class="stu-dlg-name">${esc(lesson.title)}</span>
               <span class="stu-dlg-val">${lesson.seen ? "צפית" : "עוד לא"}</span>
             </li>`
             )
             .join("")}
         </ul>`
      : "";
    // The exercises solved: closed in a rectangle that opens on a tap.
    const solvedHead = `תרגילים · פתרת <span dir="ltr">${topic.done.length}/${topic.exercises}</span>`;
    const solved = topic.done.length
      ? `<details class="stu-fold">
         <summary class="stu-dlg-sub stu-fold-sum">${solvedHead}<span class="stu-box-chev" aria-hidden="true">${ICONS.chevron}</span></summary>
         <ul class="stu-dlg-list">
           ${topic.done
             .map(
               (ex) => `
             <li class="stu-dlg-row is-on">
               <span class="stu-dlg-mark" aria-hidden="true">${ICONS.check}</span>
               <span class="stu-dlg-name"><bdi>${esc(ex.title)}</bdi></span>
               <span class="stu-dlg-val" dir="ltr">${ex.score}/${ex.total}</span>
             </li>`
             )
             .join("")}
         </ul>
         </details>`
      : `<h3 class="stu-dlg-sub">${solvedHead}</h3>
         <p class="stu-dlg-none">עוד לא פתרת תרגילים בנושא הזה.</p>`;
    const about = STATUS[topic.status].about.split("\n");
    if (topic.status === "started") about.push(`עשית ${topic.did} מתוך ${topic.items}.`);
    if (here) about.push("כאן תרגלת בפעם האחרונה.");
    return `
      <div class="stu-dlg-head">
        <span class="stu-dlg-num">נושא ${num}</span>
        <button type="button" class="stu-dlg-close" id="stuDlgClose" aria-label="סגירה">${ICONS.close}</button>
      </div>
      <h2 class="stu-dlg-title" id="stuDlgTitle">
        <span class="stu-key">${esc(name)}</span>
        ${en ? `<span class="stu-dlg-en" dir="ltr" lang="en">${esc(en)}</span>` : ""}
      </h2>
      <div class="stu-dlg-status is-${topic.status}">${about.map((line) => `<p>${esc(line)}</p>`).join("")}</div>
      ${lessons}
      ${solved}
      <div class="stu-dlg-foot">
        <a class="btn btn-primary btn-candy stu-btn stu-dlg-go" href="${esc(topicUrl(topic))}">${topic.did ? "להמשיך בנושא" : "להתחיל את הנושא"}</a>
      </div>`;
  }

  function setStageOpen(card, open) {
    card.classList.toggle("is-open", open);
    card.querySelector(".stu-stage-open").setAttribute("aria-expanded", String(open));
    card.querySelector(".stu-stage-body").hidden = !open;
  }

  function bindMap(student) {
    const box = app.querySelector(".stu-map");
    const dialog = document.getElementById("stuTopicDlg");
    if (box) bindFinish(box);
    box?.addEventListener("click", (e) => {
      // The box on top: the subjects the student started, to switch to.
      if (e.target.closest(".stu-tank") && dialog) {
        dialog.innerHTML = subjectsDialogHtml(mapSubjects(student));
        document.getElementById("stuDlgClose").addEventListener("click", () => dialog.close());
        dialog.showModal();
        return;
      }
      const map = shown.map;
      const firsts = firstNums(map.stages);
      const card = e.target.closest(".stu-stage");
      if (!card) return;
      const index = Number(card.dataset.stage);
      const stage = map.stages[index];
      // A stage opens, and the one that was open closes.
      if (e.target.closest(".stu-stage-open")) {
        const open = !card.classList.contains("is-open");
        box.querySelectorAll(".stu-stage.is-open").forEach((other) => setStageOpen(other, false));
        setStageOpen(card, open);
        if (open) card.scrollIntoView({ behavior: "smooth", block: "nearest" });
        return;
      }
      const step = e.target.closest("[data-step]");
      if (step) {
        const picked = Number(step.dataset.step);
        card.querySelector(".stu-stage-body").innerHTML = stageBodyHtml(stage, firsts[index], picked, map.here);
        card.querySelector(`[data-step="${picked}"]`)?.focus();
        return;
      }
      const more = e.target.closest(".stu-focus-more");
      if (more && dialog) {
        const i = stage.topics.findIndex((topic) => topic.id === more.dataset.topic);
        dialog.innerHTML = `<div class="stu-dlg-body">${topicInfoHtml(stage.topics[i], firsts[index] + i, stage.topics[i].id === map.here)}</div>`;
        document.getElementById("stuDlgClose").addEventListener("click", () => dialog.close());
        dialog.showModal();
      }
    });
    // A tap on the dimmed page around the dialog closes it. A subject in
    // it: its map in place of this one.
    dialog?.addEventListener("click", (e) => {
      if (e.target === dialog) return dialog.close();
      const pick = e.target.closest("[data-subject]");
      if (!pick) return;
      dialog.close();
      if (pick.dataset.subject === shown?.id) return;
      pickedSubject = pick.dataset.subject;
      box.innerHTML = mapBodyHtml(student);
      bindFinish(box);
      box.querySelector(".stu-tank")?.focus();
    });
  }

  /* ── Certificates: one for every stage of the path, earned once every
     topic in it is ready (lib/english-map.js). An earned one opens as a
     picture (certificate.js) to download, share or print; a locked one
     tells what is missing. ── */

  function fmtDay(iso) {
    return new Date(iso).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jerusalem" });
  }

  // The vocabulary stage isn't a step on the road, so it has no number.
  function stageName(stages, index) {
    const stage = stages[index];
    const num = stage.side ? 0 : stages.filter((s) => !s.side).indexOf(stage) + 1;
    return { stage, num, label: num ? `שלב ${num}: ${stage.title}` : stage.title };
  }

  // The picture prints alone: a copy of it goes into a box that only the
  // print shows.
  async function printCertificate(src) {
    let box = document.getElementById("stuCertPrint");
    if (!box) {
      box = document.createElement("div");
      box.id = "stuCertPrint";
      document.body.appendChild(box);
    }
    box.innerHTML = `<img alt="" src="${src}" />`;
    await box.firstChild.decode().catch(() => {});
    document.documentElement.classList.add("stu-printing-cert");
    window.addEventListener("afterprint", () => document.documentElement.classList.remove("stu-printing-cert"), { once: true });
    window.print();
  }

  function downloadFile(file) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(file);
    a.download = file.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 10000);
  }

  async function openCertificate(student, cert, index) {
    const dialog = document.getElementById("stuCertDlg");
    if (!dialog || !cert?.earned) return;
    dialog.innerHTML = `
      <div class="stu-dlg-body">
        <div class="stu-dlg-head">
          <h2 class="stu-dlg-title"><span class="stu-key">התעודה שלי</span></h2>
          <button type="button" class="stu-dlg-close" data-close aria-label="סגירה">${ICONS.close}</button>
        </div>
        <div class="stu-cert-pic"><p class="stu-cert-wait">מכינים את התעודה…</p></div>
        <div class="stu-cert-actions">
          <button type="button" class="btn btn-primary btn-candy stu-btn stu-cert-act" id="stuCertSave" disabled>${ICONS.download}<span>הורדה</span></button>
          <button type="button" class="btn btn-candy stu-btn stu-cert-act hidden" id="stuCertShare" disabled>${ICONS.share}<span>שיתוף</span></button>
          <button type="button" class="btn btn-candy stu-btn stu-cert-act stu-cert-print" id="stuCertPrintBtn" disabled>${ICONS.print}<span>הדפסה</span></button>
        </div>
      </div>
      <dialog class="stu-cert-full" id="stuCertFull" aria-label="התעודה מקרוב">
        <button type="button" class="stu-dlg-close stu-cert-full-close" data-full-close aria-label="סגירה">${ICONS.close}</button>
        <div class="stu-cert-full-scroll"></div>
      </dialog>`;
    dialog.showModal();

    const canvas = await window.PleyiCertificate.draw({
      name: student.name,
      line: cert.line,
      stage: cert.title,
      stageEn: cert.en || "",
      date: fmtDay(cert.at || new Date().toISOString()),
    });
    const src = canvas.toDataURL("image/png");
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    const file = new File([blob], `pleyi-certificate-${index + 1}.png`, { type: "image/png" });
    const alt = `תעודת הצטיינות של ${esc(student.name)}: ${esc(cert.title)}`;
    dialog.querySelector(".stu-cert-pic").innerHTML = `
      <button type="button" class="stu-cert-zoom" aria-label="לראות את התעודה מקרוב"><img src="${src}" alt="${alt}" /></button>`;
    // A tap on the certificate: it fills the screen, big, to look at up close
    // (dragged around when it's bigger than the screen).
    const full = document.getElementById("stuCertFull");
    const scroller = full.querySelector(".stu-cert-full-scroll");
    scroller.innerHTML = `<img src="${src}" alt="${alt}" />`;
    dialog.querySelector(".stu-cert-zoom").addEventListener("click", () => {
      full.showModal();
      scroller.scrollLeft = (scroller.scrollWidth - scroller.clientWidth) / 2;
      scroller.scrollTop = (scroller.scrollHeight - scroller.clientHeight) / 2;
    });
    full.addEventListener("click", (e) => {
      if (e.target.closest("[data-full-close]") || e.target === scroller) full.close();
    });

    const save = document.getElementById("stuCertSave");
    const share = document.getElementById("stuCertShare");
    const print = document.getElementById("stuCertPrintBtn");
    [save, share, print].forEach((btn) => (btn.disabled = false));
    save.addEventListener("click", () => downloadFile(file));
    print.addEventListener("click", () => printCertificate(src));
    // Only the picture is shared — never the student's own link.
    if (navigator.canShare?.({ files: [file] })) {
      share.classList.remove("hidden");
      share.addEventListener("click", () =>
        navigator.share({ files: [file], title: "התעודה שלי", text: `${cert.shareText} pleyschool.com` }).catch(() => {})
      );
    }
  }

  function certInfoHtml(cert) {
    const count = (label) => `<p class="stu-sticker-have">${label}: <b dir="ltr">${cert.have.toLocaleString("en-US")}/${cert.need.toLocaleString("en-US")}</b></p>`;
    const how =
      cert.kind === "stage"
        ? `<p class="stu-cert-how">בכל נושא בשלב:</p>
           <ul class="stu-cert-steps">
             <li>לראות את כל השיעורים</li>
             <li>לקבל 80 ומעלה ב־3 מכל 4 תרגילים</li>
           </ul>
           ${count("נושאים מוכנים")}`
        : cert.kind === "all"
          ? `<p class="stu-cert-how">לקבל את התעודות של כל ${cert.need} השלבים באנגלית.</p>
             ${count("תעודות של שלבים")}`
          : `<p class="stu-cert-how">${esc(cert.how)}</p>
             ${count("עד עכשיו")}`;
    return `
      <div class="stu-dlg-body stu-sticker-info">
        <div class="stu-dlg-head">
          <span class="stu-dlg-num">${esc(cert.tag)}</span>
          <button type="button" class="stu-dlg-close" data-close aria-label="סגירה">${ICONS.close}</button>
        </div>
        <span class="stu-cert-badge" aria-hidden="true">${ICONS.lock}</span>
        <h2 class="stu-dlg-title" id="stuPrizeTitle"><span class="stu-key">${esc(cert.title)}</span></h2>
        ${how}
      </div>`;
  }

  function bindCertButtons(student) {
    const dialog = document.getElementById("stuCertDlg");
    if (!dialog) return;
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog || e.target.closest("[data-close]")) dialog.close();
    });
    const certs = certGroups(student).flatMap((group) => group.certs);
    app.querySelectorAll("[data-cert]").forEach((btn) => {
      const index = Number(btn.dataset.cert);
      btn.addEventListener("click", () => openCertificate(student, certs[index], index));
    });
    // A locked certificate: what it takes.
    const info = document.getElementById("stuPrizeDlg");
    app.querySelectorAll("[data-cert-info]").forEach((btn) => {
      btn.addEventListener("click", () => {
        info.innerHTML = certInfoHtml(certs[Number(btn.dataset.certInfo)]);
        info.showModal();
      });
    });
  }

  /* ── The library is a page of its own: the English area for a student who
     learns English only, else the site's lesson library — each with this
     page's bar at the bottom (StudentBar.libraryUrl, student-bar.js). ── */

  /* ── "My prizes": the certificates, then the stickers. A sticker the
     student earned since they last opened this tab is marked new (this
     device remembers what it showed). ── */

  const SEEN_KEY = "pleyi-stickers-seen";

  // The stickers are hidden for now (2026-11-23): only the certificates show.
  const STICKERS_ON = false;

  // On this computer only (never the live site): a few certificates earned,
  // to see how the tiles look. Remove once real ones are there to look at.
  const CERT_DEMO = ["localhost", "127.0.0.1"].includes(location.hostname);

  function demoCertificates(student) {
    (student.map?.stages || []).forEach((stage, i) => {
      if (!stage.cert) return;
      const need = stage.cert.need || 1;
      if ([0, 1, 3, 8].includes(i)) Object.assign(stage.cert, { earned: true, have: need });
      else if (i === 2 || i === 4) Object.assign(stage.cert, { have: Math.max(1, Math.floor(need / 2)) });
    });
  }

  // Each sticker's drawing, by its `icon` (lib/stickers.js).
  const STICKER_ART = {
    flag: `<path d="M8 27V6"/><path d="M8 6h15l-3 5 3 5H8"/>`,
    notebook: `<rect x="9" y="5" width="15" height="22" rx="2.5"/><path d="M6 10h5M6 16h5M6 22h5M14 11h6M14 16h6"/>`,
    trophy: `<path d="M10 6h12v6a6 6 0 0 1-12 0V6Z"/><path d="M10 8H6.5a4 4 0 0 0 4 5M22 8h3.5a4 4 0 0 1-4 5M16 18v4M11 27h10M12.5 22h7l.5 5h-8l.5-5Z"/>`,
    crown: `<path d="M5 24 3.5 10l7 5L16 6l5.5 9 7-5L27 24Z"/><path d="M6 27.5h20"/>`,
    star: `<path d="M16 4.5l3.6 7.4 8.1 1.1-5.9 5.7 1.4 8L16 22.9l-7.2 3.8 1.4-8-5.9-5.7 8.1-1.1Z"/>`,
    target: `<circle cx="16" cy="16" r="11"/><circle cx="16" cy="16" r="6.5"/><circle cx="16" cy="16" r="2" fill="currentColor"/>`,
    screen: `<rect x="4" y="6" width="24" height="16" rx="2.5"/><path d="M16 22v5M11 27h10"/><path d="m14 11 5 3-5 3Z" fill="currentColor"/>`,
    book: `<path d="M3.5 8C7 6 11 6 16 8.5c5-2.5 9-2.5 12.5-.5v17c-3.5-2-7.5-2-12.5.5-5-2.5-9-2.5-12.5-.5Z"/><path d="M16 8.5v17"/>`,
    bulb: `<path d="M11.5 21.5c0-3-4-5-4-10a8.5 8.5 0 0 1 17 0c0 5-4 7-4 10Z"/><path d="M12 25h8M13.5 28.5h5"/>`,
    flame: `<path d="M16 29c5.5 0 9.3-3.7 9.3-9 0-4.8-3-8-5.4-10.9-.6 2.7-1.9 4.4-3.5 5 .4-4.1-1.3-8.4-5-11 .1 4.2-2.1 7.2-4.2 9.8-1.7 2.2-1.6 5-1.6 7.1 0 5.3 3.9 9 10.4 9Z"/>`,
    calendar: `<rect x="5" y="7" width="22" height="20" rx="2.5"/><path d="M5 13h22M11 4v6M21 4v6"/><path d="m11.5 20 3 3 6-6"/>`,
    // A stack of coins (a coin with a mark on its face could read as a symbol).
    coin: `<ellipse cx="16" cy="8.5" rx="9" ry="3.5"/><path d="M7 8.5v5c0 1.9 4 3.5 9 3.5s9-1.6 9-3.5v-5"/><path d="M7 13.5v5c0 1.9 4 3.5 9 3.5s9-1.6 9-3.5v-5"/><path d="M7 18.5v4.5c0 1.9 4 3.5 9 3.5s9-1.6 9-3.5v-4.5"/>`,
    gem: `<path d="M9 6h14l5 7-12 14L4 13Z"/><path d="M4 13h24M12.5 6 16 13l3.5-7M16 13v14"/>`,
    review: `<path d="M26 14.5a10 10 0 0 0-17.9-6.1L6 10.5"/><path d="M6 4.5v6h6"/><path d="M6 17.5a10 10 0 0 0 17.9 6.1l2.1-2.1"/><path d="M26 27.5v-6h-6"/>`,
    cards: `<path d="m11.5 4.5 12.3 3.3a2 2 0 0 1 1.4 2.5L21 26.5"/><rect x="5" y="8.5" width="14.5" height="19.5" rx="2.2"/><path d="M9 15h6.5M9 19h4.5"/>`,
    game: `<path d="M9 10h14a6 6 0 0 1 6 6.5l-.6 5.5a3.5 3.5 0 0 1-6.2 1.9L19.5 21h-7l-2.7 2.9a3.5 3.5 0 0 1-6.2-1.9L3 16.5A6 6 0 0 1 9 10Z"/><path d="M10 14v5M7.5 16.5h5"/><circle cx="21" cy="15" r="1.3" fill="currentColor"/><circle cx="24" cy="18" r="1.3" fill="currentColor"/>`,
    medal: `<circle cx="16" cy="19" r="8"/><path d="m16 15 1.4 2.8 3 .4-2.2 2.1.5 3L16 21.9l-2.7 1.4.5-3-2.2-2.1 3-.4Z"/><path d="M11 12 7 4h6l3 6M21 12l4-8h-6l-3 6"/>`,
    mountain: `<path d="M3 27 12 11l5 8 3-5 9 13Z"/><path d="M12 11V4l6 2.5L12 9"/>`,
  };

  function stickerArtHtml(sticker) {
    return `
      <span class="stu-sticker-art is-${esc(sticker.color)}${sticker.earned ? "" : " is-locked"}" aria-hidden="true">
        <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${STICKER_ART[sticker.icon] || STICKER_ART.star}</svg>
        ${sticker.earned ? "" : `<span class="stu-sticker-lock">${ICONS.lock}</span>`}
      </span>`;
  }

  function seenStickers() {
    try {
      const all = JSON.parse(localStorage.getItem(SEEN_KEY)) || {};
      return new Set(all[key] || []);
    } catch {
      return new Set();
    }
  }

  function markStickersSeen(ids) {
    try {
      const all = JSON.parse(localStorage.getItem(SEEN_KEY)) || {};
      all[key] = ids;
      localStorage.setItem(SEEN_KEY, JSON.stringify(all));
    } catch {
      /* ignore */
    }
  }

  // Earned and not shown yet. The first visit to the page shows nothing as
  // new, so a student who had stickers already doesn't get them all at once.
  function newStickers(student) {
    const earned = (student.stickers || []).filter((s) => s.earned);
    let all = null;
    try {
      all = JSON.parse(localStorage.getItem(SEEN_KEY)) || {};
    } catch {
      return [];
    }
    if (!all[key]) {
      markStickersSeen(earned.map((s) => s.id));
      return [];
    }
    const seen = seenStickers();
    return earned.filter((s) => !seen.has(s.id));
  }

  // Every certificate, in groups: English — its stages and the whole road —
  // then every school subject the student practiced, a certificate per
  // stage, then the achievements (lib/certificates.js). Each: { id, kind
  // ("stage" | "all" | "achievement"), title, en, tag, num | words | icon,
  // have, need, earned, at, line (on the certificate), shareText }.
  function certGroups(student) {
    const stages = student.map?.stages || [];
    const more = student.moreCerts || [];
    const english = stages
      .filter((stage) => stage.cert)
      .map((stage) => {
        const { num } = stageName(stages, stages.indexOf(stage));
        return {
          ...stage.cert,
          id: stage.titleEn,
          kind: "stage",
          title: stage.title,
          en: stage.titleEn || "",
          tag: num ? `שלב ${num}` : "לאורך הדרך",
          num,
          words: !num,
          line: num ? `על סיום שלב ${num} במסלול האנגלית` : "על סיום שלב אוצר המילים במסלול האנגלית",
          shareText: "קיבלתי תעודה באנגלית!",
        };
      });
    const all = more.find((cert) => cert.kind === "all");
    if (all) {
      english.push({ ...all, en: "The whole English path", tag: "כל הדרך", icon: "mountain", line: "על סיום כל מסלול האנגלית", shareText: "סיימתי את כל מסלול האנגלית!" });
    }
    const subjects = (student.subjects || []).map((subject) => ({
      title: subject.title,
      certs: subject.map.stages
        .filter((stage) => stage.cert)
        .map((stage, i) => ({
          ...stage.cert,
          kind: "stage",
          title: stage.title,
          en: "",
          tag: `שלב ${i + 1}`,
          num: i + 1,
          line: `על סיום שלב ${i + 1} במסלול ${subject.title}`,
          shareText: `קיבלתי תעודה ב${subject.title}!`,
        })),
    }));
    const achievements = more
      .filter((cert) => cert.kind === "achievement")
      .map((cert) => ({ ...cert, en: "", tag: "הישג", line: "על הישג מיוחד", shareText: "קיבלתי תעודת הישג!" }));
    return [{ title: "אנגלית", certs: english }, ...subjects, { title: "הישגים", certs: achievements }].filter((group) => group.certs.length);
  }

  // A small tile per certificate, each in its own color: the stage's number
  // in a circle with a lock ("ABC" for the words, a drawing for the rest)
  // and how far the student got; once earned, a medal instead. Tapping it
  // opens the certificate or, while locked, what it takes. `index`: its
  // place in all the certificates, `color` in its group.
  function certTileHtml(cert, index, color, fresh) {
    const { have, need, earned } = cert;
    const inside = cert.num
      ? cert.num
      : cert.words
        ? "ABC"
        : `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${STICKER_ART[cert.icon] || STICKER_ART.star}</svg>`;
    const art = earned
      ? `<span class="stu-cert-tile-medal" aria-hidden="true">${TILE_ICONS.ribbon}</span>`
      : `<span class="stu-cert-tile-num${cert.words ? " is-words" : ""}${!cert.num && !cert.words ? " is-icon" : ""}" dir="ltr" aria-hidden="true">${inside}<i>${ICONS.lock}</i></span>`;
    const label = cert.kind === "stage" ? `${cert.tag}: ${cert.title}` : cert.title;
    return `
      <li>
        <button type="button" class="stu-cert-tile is-c${color % 6}${earned ? " is-earned" : ""}" ${earned ? "data-cert" : "data-cert-info"}="${index}" aria-label="${esc(label)}${earned ? " — יש תעודה" : ""}">
          ${fresh ? `<span class="stu-sticker-new">חדש!</span>` : ""}
          ${art}
          <span class="stu-cert-tile-name">${esc(cert.title)}</span>
          <span class="stu-cert-tile-bar" aria-label="עד עכשיו: ${have} מתוך ${need}"><i style="width:${Math.round((have / Math.max(1, need)) * 100)}%"></i></span>
        </button>
      </li>`;
  }

  function prizesHtml(student) {
    const stickers = student.stickers || [];
    const fresh = new Set(newStickers(student).map((s) => s.id));
    const freshCerts = new Set(window.StudentProgress?.newCertificates(student) || []);
    let index = 0;
    const groups = certGroups(student)
      .map(
        (group) => `
      <h2 class="stu-prizes-title is-out"><span class="stu-key">${esc(group.title)}</span></h2>
      <section class="stu-prizes is-certs" aria-label="${esc(group.title)}">
        <ul class="stu-cert-tiles">${group.certs.map((cert, i) => certTileHtml(cert, index++, i, freshCerts.has(cert.id))).join("")}</ul>
      </section>`
      )
      .join("");
    return `
      ${groups}
      ${STICKERS_ON ? stickersHtml(stickers, fresh) : ""}
      <dialog class="stu-dlg" id="stuPrizeDlg" aria-labelledby="stuPrizeTitle"></dialog>
      <dialog class="stu-dlg stu-cert-dlg" id="stuCertDlg" aria-label="תעודה"></dialog>`;
  }

  function stickersHtml(stickers, fresh) {
    return `
      <section class="stu-prizes">
        <h2 class="stu-prizes-title"><span class="stu-key">המדבקות שלי</span></h2>
        <ul class="stu-stickers">
          ${stickers
            .map(
              (s, i) => `
            <li>
              <button type="button" class="stu-sticker${s.earned ? " is-earned" : ""}" data-sticker="${i}">
                ${fresh.has(s.id) ? `<span class="stu-sticker-new">חדש!</span>` : ""}
                ${stickerArtHtml(s)}
                <span class="stu-sticker-name">${esc(s.title)}</span>
              </button>
            </li>`
            )
            .join("")}
        </ul>
      </section>`;
  }

  function stickerInfoHtml(s) {
    return `
      <div class="stu-dlg-body stu-sticker-info">
        <div class="stu-dlg-head">
          <span class="stu-dlg-num${s.earned ? " stu-sticker-cheer" : ""}">${s.earned ? "קיבלת!" : "עוד לא"}</span>
          <button type="button" class="stu-dlg-close" data-close aria-label="סגירה">${ICONS.close}</button>
        </div>
        ${stickerArtHtml(s)}
        <h2 class="stu-dlg-title" id="stuPrizeTitle"><span class="stu-key">${esc(s.title)}</span></h2>
        <p class="stu-sticker-how">איך מקבלים: ${esc(s.how)}</p>
        <p class="stu-sticker-have">${s.earned ? `קיבלת את המדבקה הזאת.<span class="stu-sticker-cheer">כל הכבוד!</span>` : `עד עכשיו: <b dir="ltr">${s.have.toLocaleString("en-US")}/${s.need.toLocaleString("en-US")}</b>`}</p>
      </div>`;
  }

  function bindPrizes(student) {
    const dialog = document.getElementById("stuPrizeDlg");
    dialog?.addEventListener("click", (e) => {
      if (e.target === dialog || e.target.closest("[data-close]")) dialog.close();
    });
    app.querySelectorAll("[data-sticker]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const s = student.stickers[Number(btn.dataset.sticker)];
        if (!s || !dialog) return;
        dialog.innerHTML = stickerInfoHtml(s);
        dialog.showModal();
      });
    });
    bindCertButtons(student);
    // What this tab showed is no longer new (a certificate's dot on the
    // Learn English page's medal goes too).
    markStickersSeen((student.stickers || []).filter((s) => s.earned).map((s) => s.id));
    window.StudentProgress?.markCertificatesSeen(student);
  }

  // The hello on top is in the page itself (student.html), with the fox
  // perched on it; only its words change.
  // No text: the line is hidden (the tabs have no title on top).
  function setHello(text) {
    const line = document.getElementById("stuHello");
    if (!line) return;
    line.textContent = text || "";
    const head = line.closest(".stu-hello");
    if (head) head.hidden = !text;
  }

  function render(student) {
    current = student;
    document.title = `${student.name} — Pleyi`;
    if (teacherView) {
      setHello(student.name);
      app.innerHTML = mapHtml(student);
      bindMap(student);
      return;
    }
    // No daily challenge in the file (an old server), or no class: that tab
    // is the tasks.
    const classes = student.classes || [];
    const tab = (currentTab() === "daily" && !student.daily) || (currentTab() === "class" && !classes.length) ? "tasks" : currentTab();
    // An old #library link: the library is its own page now.
    if (tab === "library") {
      location.replace(window.StudentBar.libraryUrl(student));
      return;
    }
    // The class tab shows what's new since the last visit, then counts it seen.
    const seenPosts = classSeenAt();
    if (tab === "class") markClassSeen(student);
    const body =
      tab === "class" ? classHtml(student, seenPosts)
      : tab === "daily" ? dailyHtml(student.daily)
      : tab === "map" ? mapHtml(student)
      : tab === "prizes" ? prizesHtml(student)
      : tasksHtml(student);
    // A dot on the prizes while a new sticker or certificate waits there.
    const fresh = tab !== "prizes" && ((STICKERS_ON && newStickers(student).length > 0) || (window.StudentProgress?.newCertificates(student) || []).length > 0);
    const classDot = classes.length ? newPosts(student).length > 0 : null;
    // The other tabs have a small way back to the tasks in the corner — not
    // the daily challenge (its square on the bar leads back instead), the
    // map or the certificates.
    const back = ["tasks", "daily", "map", "prizes"].includes(tab)
      ? ""
      : `<a class="stu-back-btn" href="#tasks" aria-label="חזרה לשיעורי הבית">${ICONS.arrow}<span>חזרה</span></a>`;
    // On top: hello on the tasks; the other tabs have no title.
    setHello(tab === "tasks" ? `שלום, ${student.name}!` : "");
    app.innerHTML = `
      ${window.StudentBar.html({ student, tab, fresh, classDot })}
      ${back}
      ${body}`;
    if (tab === "map") bindMap(student);
    else if (tab === "prizes") bindPrizes(student);
    else if (tab === "class") bindClass();
    else if (tab === "tasks") bindTasks();
  }

  window.addEventListener("hashchange", () => {
    if (current) render(current);
  });

  function renderInvalid() {
    setHello("אופס!");
    app.innerHTML = `<p class="stu-lead">הקישור הזה לא תקין או שכבר לא פעיל. בקשו מהמורה קישור חדש.</p>`;
  }

  // The teacher turned the sign-in off ("פרטי התלמיד" in the file).
  function renderBlocked() {
    setHello("אופס!");
    app.innerHTML = `
      <p class="stu-lead">הכניסה לחשבון הושבתה.</p>
      <p class="stu-lead">לפרטים פנו למורה.</p>`;
  }

  async function init() {
    if (teacherView ? !key : !window.StudentProgress?.setKey(key)) {
      renderInvalid();
      return;
    }
    // The students are Hebrew speakers, so the site opens in Hebrew for them
    // unless this device already chose a language.
    try {
      if (!teacherView && !localStorage.getItem("pleyi-lang")) localStorage.setItem("pleyi-lang", "he");
    } catch {
      /* ignore */
    }
    try {
      const res = await fetch(`/api/student/${encodeURIComponent(key)}`);
      if (res.status === 404 || res.status === 403) {
        if (!teacherView) window.StudentProgress.clear();
        if (res.status === 403) renderBlocked();
        else renderInvalid();
        return;
      }
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      if (CERT_DEMO) demoCertificates(data.student);
      render(data.student);
      watchLive(data.student);
    } catch {
      app.innerHTML = `<p class="stu-lead">לא הצלחנו לטעון את המשימות. בדקו את החיבור לאינטרנט ונסו לרענן.</p>`;
    }
  }

  init();
  // Coming back from an exercise with the browser's back button can restore
  // this page from cache — reload the tasks so finished ones show as done.
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) init();
  });
})();
