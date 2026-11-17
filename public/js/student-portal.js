/* Student page (/s/<key>) — the personal link the teacher sends.
   The page shows the tasks the teacher left the student. A bar of squares
   on top opens the rest: the daily challenge, "my map" — the English
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
    return `/services/english?s=${encodeURIComponent(key)}#${encodeURIComponent(hw.topicId)}/${encodeURIComponent(hw.exerciseId)}`;
  }

  // Open work first (soonest due date first), then what's done.
  function sorted(list) {
    const open = list.filter((hw) => !hw.doneAt).sort((a, b) => (a.dueDate || "9999").localeCompare(b.dueDate || "9999") || a.assignedAt.localeCompare(b.assignedAt));
    const done = list.filter((hw) => hw.doneAt).sort((a, b) => b.doneAt.localeCompare(a.doneAt));
    return [...open, ...done];
  }

  function hwLate(hw) {
    return !hw.doneAt && !!hw.dueDate && hw.dueDate < todayKey();
  }

  function homeworkCard(hw, index) {
    const late = hwLate(hw);
    const due = hw.dueDate ? `<span class="stu-hw-due${late ? " is-late" : ""}">${late ? "באיחור — " : ""}עד ${esc(fmtDue(hw.dueDate))}</span>` : "";
    const lesson = hw.type === "lesson";
    const action = hw.doneAt
      ? `<span class="stu-hw-done">${lesson ? "צפית!" : `בוצע! <span dir="ltr">${hw.score}/${hw.total}</span>`}</span>
         <a class="btn btn-candy stu-btn stu-btn--again" href="${esc(exerciseUrl(hw))}">${lesson ? "לצפות שוב" : "לתרגל שוב"}</a>`
      : `<a class="btn btn-primary btn-candy stu-btn" href="${esc(exerciseUrl(hw))}">להתחלה</a>`;
    return `
      <li class="stu-hw${hw.doneAt ? " is-done" : ""}${late ? " is-late" : ""}">
        <span class="stu-hw-badge" aria-hidden="true">${hw.doneAt ? ICONS.check : index + 1}</span>
        <div class="stu-hw-body">
          <span class="stu-hw-topic">${esc(hw.topicTitle)}</span>
          <span class="stu-hw-title">${esc(hw.exerciseTitle)}</span>
          ${due}
          ${hw.note ? `<span class="stu-hw-note">מהמורה: ${esc(hw.note)}</span>` : ""}
        </div>
        <div class="stu-hw-action">${action}</div>
      </li>`;
  }

  /* ── The bar on top, above the name: a square for each thing beside the
     tasks. The flame (the daily challenge: five short questions a day on
     the English page, and the streak of days in a row), the map and the
     prizes open in place of the tasks; the books open the lesson library. ── */

  const DAY_LETTERS = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];

  // The squares' own pictures: colored in, with an ink outline.
  const TILE_ICONS = {
    flame: `<svg viewBox="0 0 48 48" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path fill="#ff4d3d" d="M24 44c8.2 0 14-5.6 14-13.6 0-7.2-4.6-12-8.2-16.4-.8 4-2.8 6.6-5.2 7.6.6-6.2-2-12.6-7.6-16.6.2 6.4-3.2 10.8-6.4 14.8C8.4 23 10 27.2 10 30.4 10 38.4 15.8 44 24 44Z"/><path fill="#ffd84d" d="M24 44c-3.4 0-6-2.6-6-6 0-3.6 2.8-6 4.4-8.6 1 2 2.6 3.2 4 3.6.8-2 .6-4 0-6 2.8 2.2 5.6 5.6 5.6 9.8 0 4.2-3.2 7.2-8 7.2Z"/></svg>`,
    map: `<svg viewBox="0 0 48 48" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path fill="#fff3c4" d="M5 13l12-5v28L5 41Z"/><path fill="#ffe08a" d="M17 8l14 5v28l-14-5Z"/><path fill="#fff3c4" d="M31 13l12-5v28l-12 5Z"/><path fill="none" stroke="#ff4d3d" stroke-width="2.5" stroke-dasharray="1 4.5" d="M9 35c3-4 6-2 9-6s6-5 9-3"/><path fill="#ff4d3d" stroke-width="2.5" d="M34 31s-6.5-6.4-6.5-11a6.5 6.5 0 0 1 13 0c0 4.6-6.5 11-6.5 11Z"/><circle cx="34" cy="20" r="2.3" fill="#fff" stroke-width="2"/></svg>`,
    ribbon: `<svg viewBox="0 0 48 48" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path fill="#4d9dff" d="M17 27 12 43l6.5-2.5L22 46l4-15Z"/><path fill="#ff5a5a" d="M31 27l5 16-6.5-2.5L26 46l-4-15Z"/><circle cx="24" cy="19" r="13" fill="#ffd23f"/><path fill="#ff9f1c" stroke-width="2" d="M24 12l1.76 4.57 4.9.27-3.81 3.09 1.26 4.73L24 22l-4.11 2.66 1.26-4.73-3.81-3.09 4.9-.27Z"/></svg>`,
    library: `<svg viewBox="0 0 48 48" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="8" width="9" height="32" rx="2" fill="#ff6b6b"/><rect x="17" y="13" width="9" height="27" rx="2" fill="#4d9dff"/><rect x="33" y="13" width="9" height="27" rx="2" fill="#3ccf91" transform="rotate(-14 33 40)"/><path fill="none" d="M6 15h9M6 33h9M17 20h9M3 41.5h42"/></svg>`,
  };

  // `fresh`: a dot on the prizes while a new sticker or certificate waits there.
  function topBarHtml(daily, tab, fresh) {
    const link = (id, icon, label, extra = "", check = "", href = `#${id}`) =>
      `<a class="stu-top-item${tab === id ? " is-on" : ""}" href="${href}" aria-label="${label}${extra ? " — יש פרס חדש" : ""}${check ? " — עשית היום" : ""}"${tab === id ? ' aria-current="page"' : ""}>
        <span class="stu-daily-tile stu-${id}-tile">${icon}${extra}${check}</span>
        <span class="stu-top-label" aria-hidden="true">${label}</span>
      </a>`;
    const check = daily?.doneToday ? `<i class="stu-daily-tile-check" aria-hidden="true">${ICONS.check}</i>` : "";
    return `
      <nav class="stu-side-tiles" aria-label="העמוד שלי">
        ${daily ? link("daily", TILE_ICONS.flame, "אתגר יומי", "", check) : ""}
        ${link("map", TILE_ICONS.map, "המפה שלי")}
        ${link("prizes", TILE_ICONS.ribbon, "הפרסים שלי", fresh ? `<i class="stu-top-dot" aria-hidden="true"></i>` : "")}
        ${link("library", TILE_ICONS.library, "ספרייה", "", "", LIBRARY_URL)}
      </nav>`;
  }

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
    const fresh = newStickers(student);
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
    return testIsOpen(test) && !test.attempts?.length && !!test.dueDate && test.dueDate < todayKey();
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
        : test.dueDate
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
    const left = list.filter(testIsOpen).map((test) => ({ title: test.title, late: testLate(test) }));
    return boxHtml("stuTests", "מבחנים", left, `<ol class="stu-hw-list">${list.map(testCard).join("")}</ol>`);
  }

  /* ── The tasks tab: the homework, and the tests when the teacher sent
     any — each in a small box that lists only what's left. Tapping the box
     opens it to the details: the due dates, the teacher's notes, the
     buttons and what's already done. ── */

  // The boxes open now. They stay open when the page draws again (after
  // asking for a retake, or coming back from another tab).
  const openBoxes = new Set();

  // A line for each thing left: its number and its name, red once it's late.
  function leftRowHtml(item, index) {
    return `
      <li${item.late ? ' class="is-late"' : ""}>
        <span class="stu-box-num" aria-hidden="true">${index + 1}</span>
        <span class="stu-box-name">${esc(item.title)}</span>
        ${item.late ? `<span class="stu-box-late">באיחור</span>` : ""}
      </li>`;
  }

  function boxHtml(id, title, left, details) {
    const open = openBoxes.has(id);
    const count = left.length
      ? `<span class="stu-box-count">נשארו <b dir="ltr">${left.length}</b></span>`
      : `<span class="stu-box-count is-done">${ICONS.check}הכול בוצע</span>`;
    return `
      <section class="stu-box${open ? " is-open" : ""}" data-box="${id}">
        <div class="stu-box-head">
          <h2 class="stu-box-title">
            <button type="button" class="stu-box-open" aria-expanded="${open}" aria-controls="${id}More"><span class="stu-key">${esc(title)}</span></button>
          </h2>
          ${count}
          <span class="stu-box-chev" aria-hidden="true">${ICONS.chevron}</span>
        </div>
        ${left.length ? `<ol class="stu-box-left">${left.map(leftRowHtml).join("")}</ol>` : ""}
        <div class="stu-box-more" id="${id}More"${open ? "" : " hidden"}>${details}</div>
      </section>`;
  }

  function bindTasks() {
    app.querySelectorAll(".stu-box-open").forEach((btn) =>
      btn.addEventListener("click", () => {
        const box = btn.closest(".stu-box");
        const open = !box.classList.contains("is-open");
        box.classList.toggle("is-open", open);
        btn.setAttribute("aria-expanded", String(open));
        box.querySelector(".stu-box-more").hidden = !open;
        if (open) openBoxes.add(box.dataset.box);
        else openBoxes.delete(box.dataset.box);
      })
    );
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

  function tasksHtml(student) {
    const list = sorted(student.homework || []);
    const done = list.filter((hw) => hw.doneAt).length;
    const left = list.filter((hw) => !hw.doneAt).map((hw) => ({ title: hw.exerciseTitle, late: hwLate(hw) }));
    // The homework's box sits under the tests' one, when the teacher sent
    // any; with no homework, one line.
    const homework = list.length
      ? boxHtml(
          "stuHw",
          "שיעורי בית",
          left,
          `<div class="stu-progress">
             <span class="stu-progress-label">בוצעו <span dir="ltr">${done}/${list.length}</span></span>
             <div class="stu-progress-bar" role="img" aria-label="בוצעו ${done} מתוך ${list.length}"><span style="width:${Math.round((done / list.length) * 100)}%"></span></div>
           </div>
           <ol class="stu-hw-list">${list.map(homeworkCard).join("")}</ol>`
        )
      : `<section class="stu-box stu-box--empty">
          <h2 class="stu-box-title"><span class="stu-key">שיעורי בית</span></h2>
          <p class="stu-box-none">המורה לא השאיר שיעורי בית בינתיים</p>
        </section>`;
    return `
      ${testsHtml(student)}
      ${homework}
      ${newPrizeHtml(student)}
      ${cardsHtml(student.cards)}`;
  }

  /* ── "My map": the learning path, a stage at a time. On top, how far the
     student got on the whole path; under it a card for every stage, up to
     the goal — reading an unseen — and the vocabulary topics after it. One
     stage is open: the one the student practiced in last. An open stage
     shows its topics as numbered dots, coloured by what the student did,
     and the topic picked under them — how far they got and the way into
     it; its lessons and the exercises they solved open in a dialog. ── */

  // What the page can show, by the link's #hash; the tasks when there's none.
  const VIEWS = ["tasks", "daily", "map", "prizes", "library"];

  const TAB_TITLES = { daily: "האתגר היומי", map: "ההתקדמות שלי", prizes: "הפרסים שלי" };

  const STATUS = {
    done: { node: "סיימת", about: "סיימת את כל הנושא — כל הכבוד!" },
    started: { node: "התחלת", about: "התחלת את הנושא." },
    skipped: { node: "דילגת", about: "דילגת על הנושא הזה.\nאפשר לחזור אליו מתי שרוצים." },
    ahead: { node: "עוד לא", about: "עוד לא הגעת לנושא הזה." },
  };

  let current = null;

  function currentTab() {
    const tab = location.hash.slice(1);
    return VIEWS.includes(tab) ? tab : "tasks";
  }

  function topicUrl(topic) {
    return `/services/english?s=${encodeURIComponent(key)}#${encodeURIComponent(topic.id)}`;
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

  // The stage open with the map, and its topic: where the student practiced
  // last, or else the first topic they haven't finished. None once every
  // topic is done.
  function startPoint(map) {
    const stages = map.stages;
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

  // The picked topic: its name and the way into it. How far the student
  // got, its lessons and the exercises they solved open from the "i".
  function focusHtml(topic) {
    const [name, en] = titleParts(topic.title);
    return `
      <div class="stu-focus">
        <h3 class="stu-focus-title">
          ${esc(name)}
          ${en ? `<span class="stu-focus-en" dir="ltr" lang="en">${esc(en)}</span>` : ""}
        </h3>
        <div class="stu-focus-acts">
          <a class="btn btn-primary btn-candy stu-btn" href="${esc(topicUrl(topic))}">${topic.did ? "להמשיך" : "להתחיל"}</a>
          <button type="button" class="stu-focus-more" data-topic="${esc(topic.id)}" aria-haspopup="dialog" aria-label="שיעורים ותרגילים" title="שיעורים ותרגילים">${ICONS.info}</button>
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
      !stage.side && last > 0 ? `<span class="stu-steps-walked" style="width:calc((100% - 30px) * ${last / (topics.length - 1)})"></span>` : "";
    return `
      <div class="stu-steps${stage.side ? " is-loose" : ""}">
        ${walked}
        ${topics.map((topic, i) => stepHtml(topic, i, first + i, i === picked, topic.id === here)).join("")}
      </div>
      ${focusHtml(topics[picked])}`;
  }

  // A stage's card: its name, and a ring with its number that fills with
  // how much of it is done. Tapping the card opens it. Green once every
  // topic is done, yellow for the stage the student is in. (Certificates
  // are on the prizes tab.)
  function stageHtml(stages, index, first, open, picked, here) {
    const { stage, num } = stageName(stages, index);
    const done = stage.topics.filter((topic) => topic.status === "done").length;
    const total = stage.topics.length;
    const pct = share(stage.topics);
    const tint = done === total ? "#e4f8ea" : stage.topics.some((topic) => topic.id === here) ? "#fff4d6" : "#eaf5ff";
    const ring =
      done === total
        ? `<span class="stu-ring is-full" aria-hidden="true">${ICONS.check}</span>`
        : `<span class="stu-ring${pct ? "" : " is-zero"}" style="--p:${pct}" aria-hidden="true">${num || ICONS.cards}</span>`;
    return `
      <section class="stu-stage${open ? " is-open" : ""}" data-stage="${index}" style="--tint:${tint}">
        <div class="stu-stage-head">
          ${ring}
          <h2 class="stu-stage-title">
            <button type="button" class="stu-stage-open" aria-expanded="${open}" aria-controls="stuStage${index}"
              aria-label="${esc(stage.title)} — ${num ? `שלב ${num}` : "לאורך כל הדרך"}, ${done} מתוך ${total} נושאים">${esc(stage.title)}</button>
          </h2>
          <span class="stu-stage-chev" aria-hidden="true">${ICONS.chevron}</span>
        </div>
        <div class="stu-stage-body" id="stuStage${index}"${open ? "" : " hidden"}>${stageBodyHtml(stage, first, picked, here)}</div>
      </section>`;
  }

  // The whole path: the share of its lessons and exercises the student did.
  // The student's page has its title on top ("ההתקדמות שלי").
  function summaryHtml(map) {
    const topics = map.stages.flatMap((stage) => stage.topics);
    const pct = share(topics);
    return `
      <section class="stu-map-sum">
        ${teacherView ? `<h2 class="stu-sum-title"><span class="stu-key">ההתקדמות</span></h2>` : ""}
        <div class="stu-sum-head">
          <span class="stu-bar" role="img" aria-label="עשית ${pct}% מהדרך"><span style="width:${pct}%"></span></span>
          <b class="stu-sum-pct" dir="ltr">${pct}%</b>
        </div>
      </section>`;
  }

  function mapHtml(student) {
    const map = student.map;
    if (!map?.stages?.length) return `<p class="stu-lead">לא הצלחנו לטעון את המפה. נסו לרענן.</p>`;
    const start = startPoint(map);
    const firsts = firstNums(map.stages);
    const road = map.stages.filter((stage) => !stage.side).flatMap((stage) => stage.topics);
    const stages = (side) =>
      map.stages
        .map((stage, index) =>
          !!stage.side === side
            ? stageHtml(map.stages, index, firsts[index], index === start.stage, index === start.stage ? start.topic : firstOpen(stage), map.here)
            : ""
        )
        .join("");
    return `
      <div class="stu-map">
        ${summaryHtml(map)}
        ${stages(false)}
        <p class="stu-goal${road.every((topic) => topic.status === "done") ? " is-done" : ""}">
          <span class="stu-goal-icon">${ICONS.trophy}</span>המטרה: להבין אנסין!
        </p>
        ${stages(true)}
      </div>
      <dialog class="stu-dlg" id="stuTopicDlg" aria-labelledby="stuDlgTitle"></dialog>`;
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
    const solved = topic.done.length
      ? `<ul class="stu-dlg-list">
           ${topic.done
             .map(
               (ex) => `
             <li class="stu-dlg-row is-on">
               <span class="stu-dlg-mark" aria-hidden="true">${ICONS.check}</span>
               <span class="stu-dlg-name">${esc(ex.title)}</span>
               <span class="stu-dlg-val" dir="ltr">${ex.score}/${ex.total}</span>
             </li>`
             )
             .join("")}
         </ul>`
      : `<p class="stu-dlg-none">עוד לא פתרת תרגילים בנושא הזה.</p>`;
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
      <h3 class="stu-dlg-sub">תרגילים · פתרת <span dir="ltr">${topic.done.length}/${topic.exercises}</span></h3>
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
    const map = student.map;
    const box = app.querySelector(".stu-map");
    const dialog = document.getElementById("stuTopicDlg");
    const firsts = firstNums(map?.stages || []);
    box?.addEventListener("click", (e) => {
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
    // A tap on the dimmed page around the dialog closes it.
    dialog?.addEventListener("click", (e) => {
      if (e.target === dialog) dialog.close();
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

  async function openCertificate(student, index) {
    const dialog = document.getElementById("stuCertDlg");
    const stages = student.map?.stages || [];
    if (!dialog || !stages[index]?.cert?.earned) return;
    const { stage, num } = stageName(stages, index);
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
          <button type="button" class="btn btn-candy stu-btn stu-cert-act" id="stuCertPrintBtn" disabled>${ICONS.print}<span>הדפסה</span></button>
        </div>
      </div>`;
    dialog.showModal();

    const canvas = await window.PleyiCertificate.draw({
      name: student.name,
      line: num ? `על סיום שלב ${num} במסלול האנגלית` : "על סיום שלב אוצר המילים במסלול האנגלית",
      stage: stage.title,
      stageEn: stage.titleEn || "",
      date: fmtDay(stage.cert.at || new Date().toISOString()),
    });
    const src = canvas.toDataURL("image/png");
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    const file = new File([blob], `pleyi-certificate-${num || "words"}.png`, { type: "image/png" });
    dialog.querySelector(".stu-cert-pic").innerHTML = `<img src="${src}" alt="תעודת הצטיינות של ${esc(student.name)}: ${esc(stage.title)}" />`;

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
        navigator.share({ files: [file], title: "התעודה שלי", text: "קיבלתי תעודה באנגלית! pleyschool.com" }).catch(() => {})
      );
    }
  }

  function certInfoHtml(stages, index) {
    const { stage, num } = stageName(stages, index);
    const { have, need } = stage.cert;
    return `
      <div class="stu-dlg-body stu-sticker-info">
        <div class="stu-dlg-head">
          <span class="stu-dlg-num">${num ? `שלב ${num}` : "לאורך הדרך"}</span>
          <button type="button" class="stu-dlg-close" data-close aria-label="סגירה">${ICONS.close}</button>
        </div>
        <span class="stu-cert-badge" aria-hidden="true">${ICONS.lock}</span>
        <h2 class="stu-dlg-title" id="stuPrizeTitle"><span class="stu-key">${esc(stage.title)}</span></h2>
        <p class="stu-cert-how">בכל נושא בשלב:</p>
        <ul class="stu-cert-steps">
          <li>לראות את כל השיעורים</li>
          <li>לקבל 80 ומעלה ב־3 מכל 4 תרגילים</li>
        </ul>
        <p class="stu-sticker-have">נושאים מוכנים: <b dir="ltr">${have}/${need}</b></p>
      </div>`;
  }

  function bindCertButtons(student) {
    const dialog = document.getElementById("stuCertDlg");
    if (!dialog) return;
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog || e.target.closest("[data-close]")) dialog.close();
    });
    app.querySelectorAll("[data-cert]").forEach((btn) => {
      btn.addEventListener("click", () => openCertificate(student, Number(btn.dataset.cert)));
    });
    // A locked certificate (the prizes, a stage on the map): what it takes.
    const info = document.getElementById("stuPrizeDlg");
    app.querySelectorAll("[data-cert-info]").forEach((btn) => {
      btn.addEventListener("click", () => {
        info.innerHTML = certInfoHtml(student.map.stages, Number(btn.dataset.certInfo));
        info.showModal();
      });
    });
  }

  /* ── The library: the site's lesson library, as teachers see it, with
     only a way back to this page (from=student in ready-lessons.html). ── */

  const LIBRARY_URL = "/services/ready-lessons?from=student";

  /* ── "My prizes": the certificates, then the stickers. A sticker the
     student earned since they last opened this tab is marked new (this
     device remembers what it showed). ── */

  const SEEN_KEY = "pleyi-stickers-seen";

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

  // A small tile per stage (its number in the circle, "ABC" for the words);
  // tapping it opens the certificate or, while locked, what it takes.
  function certTileHtml(stages, index, fresh) {
    const { stage, num, label } = stageName(stages, index);
    const { have, need, earned } = stage.cert;
    return `
      <li>
        <button type="button" class="stu-cert-tile${earned ? " is-earned" : ""}" ${earned ? "data-cert" : "data-cert-info"}="${index}" aria-label="${esc(label)}${earned ? " — יש תעודה" : ""}">
          ${fresh ? `<span class="stu-sticker-new">חדש!</span>` : ""}
          <span class="stu-cert-tile-num${num ? "" : " is-words"}" dir="ltr" aria-hidden="true">${num || "ABC"}${earned ? `<i>${ICONS.ribbon}</i>` : ""}</span>
          <span class="stu-cert-tile-name">${esc(stage.title)}</span>
          <span class="stu-cert-tile-bar" aria-label="נושאים מוכנים: ${have} מתוך ${need}"><i style="width:${Math.round((have / need) * 100)}%"></i></span>
        </button>
      </li>`;
  }

  function prizesHtml(student) {
    const stages = student.map?.stages || [];
    const stickers = student.stickers || [];
    const fresh = new Set(newStickers(student).map((s) => s.id));
    const freshCerts = new Set(window.StudentProgress?.newCertificates(student) || []);
    return `
      <section class="stu-prizes">
        <h2 class="stu-prizes-title"><span class="stu-key">התעודות שלי</span></h2>
        <ul class="stu-cert-tiles">${stages.map((s, i) => certTileHtml(stages, i, freshCerts.has(s.titleEn))).join("")}</ul>
      </section>
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
      </section>
      <dialog class="stu-dlg" id="stuPrizeDlg" aria-labelledby="stuPrizeTitle"></dialog>
      <dialog class="stu-dlg stu-cert-dlg" id="stuCertDlg" aria-label="תעודה"></dialog>`;
  }

  function stickerInfoHtml(s) {
    return `
      <div class="stu-dlg-body stu-sticker-info">
        <div class="stu-dlg-head">
          <span class="stu-dlg-num">${s.earned ? "קיבלת!" : "עוד לא"}</span>
          <button type="button" class="stu-dlg-close" data-close aria-label="סגירה">${ICONS.close}</button>
        </div>
        ${stickerArtHtml(s)}
        <h2 class="stu-dlg-title" id="stuPrizeTitle"><span class="stu-key">${esc(s.title)}</span></h2>
        <p class="stu-sticker-how">איך מקבלים: ${esc(s.how)}</p>
        <p class="stu-sticker-have">${s.earned ? "קיבלת את המדבקה הזאת. כל הכבוד!" : `עד עכשיו: <b dir="ltr">${s.have.toLocaleString("en-US")}/${s.need.toLocaleString("en-US")}</b>`}</p>
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
  function setHello(text) {
    const line = document.getElementById("stuHello");
    if (line) line.textContent = text;
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
    // No daily challenge in the file (an old server): its tab is the tasks.
    const tab = currentTab() === "daily" && !student.daily ? "tasks" : currentTab();
    // An old #library link: the library is its own page now.
    if (tab === "library") {
      location.replace(LIBRARY_URL);
      return;
    }
    const body =
      tab === "daily" ? dailyHtml(student.daily)
      : tab === "map" ? mapHtml(student)
      : tab === "prizes" ? prizesHtml(student)
      : tasksHtml(student);
    // A dot on the prizes while a new sticker or certificate waits there.
    const fresh = tab !== "prizes" && (newStickers(student).length > 0 || (window.StudentProgress?.newCertificates(student) || []).length > 0);
    // The other tabs have a small way back to the tasks in the corner.
    const back = tab === "tasks"
      ? ""
      : `<a class="stu-back-btn" href="#tasks" aria-label="חזרה לשיעורי הבית">${ICONS.arrow}<span>חזרה</span></a>`;
    // On top: hello on the tasks, the tab's title on the others.
    setHello(TAB_TITLES[tab] || `שלום, ${student.name}!`);
    app.innerHTML = `
      ${topBarHtml(student.daily, tab, fresh)}
      ${back}
      ${body}`;
    if (tab === "map") bindMap(student);
    else if (tab === "prizes") bindPrizes(student);
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
      render(data.student);
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
