/* Student page (/s/<key>) — the personal link the teacher sends.
   Shows the student's name on top, their homework and their progress;
   opening it links this device to the student's file, so whatever they
   solve on the site is saved there. */

(function () {
  const app = document.getElementById("stuApp");
  const key = decodeURIComponent(location.pathname.split("/")[2] || "");

  const ICONS = {
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5L20 7"/></svg>`,
    star: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="m12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3-4.6-4.4 6.3-.9L12 2.8Z"/></svg>`,
    target: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/></svg>`,
    clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,
    chevron: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>`,
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

  function fmtDay(iso) {
    const d = new Date(iso);
    const day = (x) => `${x.getFullYear()}-${x.getMonth()}-${x.getDate()}`;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (day(d) === day(new Date())) return "היום";
    if (day(d) === day(yesterday)) return "אתמול";
    return d.toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" });
  }

  function fmtNum(n) {
    return Number(n || 0).toLocaleString("he-IL");
  }

  // Same thresholds as the stars on the exercise results screen.
  function starsFor(score, total) {
    const ratio = total ? score / total : 0;
    return ratio === 1 ? 3 : ratio >= 0.7 ? 2 : ratio >= 0.4 ? 1 : 0;
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

  function homeworkCard(hw, index) {
    const late = !hw.doneAt && hw.dueDate && hw.dueDate < todayKey();
    const due = hw.dueDate ? `<span class="stu-hw-due${late ? " is-late" : ""}">${late ? "באיחור — " : ""}עד ${esc(fmtDue(hw.dueDate))}</span>` : "";
    const action = hw.doneAt
      ? `<span class="stu-hw-done">בוצע! <span dir="ltr">${hw.score}/${hw.total}</span></span>
         <a class="btn btn-candy stu-btn stu-btn--again" href="${esc(exerciseUrl(hw))}">לתרגל שוב</a>`
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

  // The student's name in the page header, so it is the first thing they see.
  function renderMe(name) {
    const me = document.getElementById("stuMe");
    if (!me) return;
    if (!name) {
      me.hidden = true;
      me.innerHTML = "";
      return;
    }
    me.innerHTML = `
      <span class="stu-me-avatar" aria-hidden="true">${esc(Array.from(name.trim())[0] || "")}</span>
      <span class="stu-me-name">${esc(name)}</span>`;
    me.hidden = false;
    document.title = `${name} — Pleyi`;
  }

  function statTile({ icon, value, label, sub = "", id = "" }) {
    return `
      <li class="stu-stat">
        <span class="stu-stat-icon">${icon}</span>
        <span class="stu-stat-value"${id ? ` id="${id}"` : ""} dir="ltr">${esc(value)}</span>
        <span class="stu-stat-label">${esc(label)}</span>
        ${sub ? `<span class="stu-stat-sub">${esc(sub)}</span>` : ""}
      </li>`;
  }

  function starsHtml(score, total) {
    const stars = starsFor(score, total);
    return `<span class="stu-ex-stars" role="img" aria-label="${stars} כוכבים מתוך 3">${[0, 1, 2]
      .map((i) => `<span${i < stars ? ` class="is-on"` : ""}>${ICONS.star}</span>`)
      .join("")}</span>`;
  }

  function topicHtml(topic, index) {
    const count = topic.exercises.length;
    const rows = topic.exercises
      .map(
        (ex) => `
          <li class="stu-ex">
            <span class="stu-ex-title">${esc(ex.title)}</span>
            ${starsHtml(ex.score, ex.total)}
            <span class="stu-ex-score" dir="ltr">${ex.score}/${ex.total}</span>
          </li>`
      )
      .join("");
    return `
      <details class="stu-topic"${index === 0 ? " open" : ""}>
        <summary>
          <span class="stu-topic-title">${esc(topic.title)}</span>
          <span class="stu-topic-count">${count === 1 ? "תרגיל אחד" : `${count} תרגילים`}</span>
          <span class="stu-topic-chevron">${ICONS.chevron}</span>
        </summary>
        <ul class="stu-ex-list">${rows}</ul>
      </details>`;
  }

  // "My progress": running totals and the best score of every exercise the
  // student finished, by topic. Files from before points existed have no
  // points yet — renderBoard fills them in from the leaderboard.
  function progressHtml(p) {
    if (!p) return "";
    const started = p.finished || p.rounds || p.games || p.lessons;
    const minutes = p.practiceMin || 0;
    const time = minutes < 60
      ? { value: fmtNum(minutes), label: "דקות תרגול" }
      : { value: fmtNum(Math.round(minutes / 6) / 10), label: "שעות תרגול" };
    const body = !started
      ? `<p class="stu-mine-empty">עוד לא תרגלת. כל תרגיל שתסיים יופיע כאן — עם הציון הכי טוב שלך.</p>`
      : `
        <ul class="stu-stats">
          ${statTile({ icon: ICONS.star, value: p.points ? fmtNum(p.points.total) : "…", label: "נקודות", sub: p.points?.week ? `השבוע: ${fmtNum(p.points.week)}` : "", id: "stuStatPoints" })}
          ${statTile({ icon: ICONS.check, value: fmtNum(p.finished), label: p.finished === 1 ? "תרגיל הושלם" : "תרגילים הושלמו" })}
          ${statTile({ icon: ICONS.target, value: p.average == null ? "—" : `${p.average}%`, label: "ציון ממוצע" })}
          ${statTile({ icon: ICONS.clock, value: time.value, label: time.label })}
        </ul>
        ${p.topics?.length ? `<h3 class="stu-mine-sub">התרגילים שסיימתי</h3><div class="stu-topics">${p.topics.map(topicHtml).join("")}</div>` : ""}`;
    return `
      <section class="stu-mine" id="progress" aria-labelledby="stuMineTitle">
        <h2 class="stu-mine-title" id="stuMineTitle">ההתקדמות שלי</h2>
        ${p.lastActive ? `<p class="stu-mine-last">תרגלת לאחרונה: <b>${esc(fmtDay(p.lastActive))}</b></p>` : ""}
        ${body}
      </section>`;
  }

  function render(student) {
    renderMe(student.name);
    const list = sorted(student.homework || []);
    const done = list.filter((hw) => hw.doneAt).length;
    const open = list.length - done;
    const lead = !list.length
      ? "עוד אין שיעורי בית. בינתיים אפשר לתרגל כל נושא שרוצים."
      : open
        ? "אלה שיעורי הבית שלך באנגלית. בהצלחה!"
        : "כל שיעורי הבית בוצעו — כל הכבוד!";

    app.innerHTML = `
      <h1 class="stu-hello">שלום, ${esc(student.name)}!</h1>
      <p class="stu-lead">${esc(lead)}</p>
      ${
        list.length
          ? `<div class="stu-progress">
              <span class="stu-progress-label">בוצעו <span dir="ltr">${done}/${list.length}</span></span>
              <div class="stu-progress-bar" role="img" aria-label="בוצעו ${done} מתוך ${list.length}"><span style="width:${Math.round((done / list.length) * 100)}%"></span></div>
            </div>
            <ol class="stu-hw-list">${list.map(homeworkCard).join("")}</ol>`
          : ""
      }
      ${progressHtml(student.progress)}
      <div id="stuReview"></div>
      <section class="stu-board" id="stuBoard" aria-labelledby="stuBoardTitle">
        <div class="stu-board-head">
          <span class="stu-board-icon">${window.Leaderboard?.icon || ""}</span>
          <h2 class="stu-board-title" id="stuBoardTitle">טבלת השיאים של הכיתה</h2>
        </div>
        <p class="stu-board-me" id="stuBoardMe"></p>
        <div id="stuBoardBody"><p class="lb-empty">טוען את הטבלה…</p></div>
        ${window.Leaderboard?.rulesHtml() || ""}
      </section>
      <div class="stu-free">
        <h2 class="stu-free-title">רוצים לתרגל עוד?</h2>
        <p>כל תרגול באתר נשמר אצל המורה — וכל תשובה נכונה מוסיפה לכם נקודות.</p>
        <a class="btn btn-candy stu-btn stu-btn--again" href="/services/english?s=${encodeURIComponent(key)}">לכל הנושאים</a>
      </div>`;
    renderBoard();
    renderReview();
    // The "my progress" link on the exercise screen lands here (#progress),
    // but the section didn't exist yet when the browser looked for it.
    if (location.hash === "#progress") document.getElementById("progress")?.scrollIntoView();
  }

  // The questions waiting in the student's mistake bank (mistake-bank.js).
  async function renderReview() {
    const bank = window.MistakeBank;
    if (!bank) return;
    await bank.ready();
    const box = document.getElementById("stuReview");
    const count = bank.count();
    if (!box || !count) return;
    box.innerHTML = `
      <div class="stu-free stu-review">
        <h2 class="stu-free-title">החזרה האישית שלי</h2>
        <p>${count === 1 ? "שאלה אחת שטעית בה מחכה לחזרה." : `${count} שאלות שטעית בהן מחכות לחזרה.`} כל שאלה יוצאת מהמאגר אחרי ${bank.GOAL} תשובות נכונות ברצף.</p>
        <a class="btn btn-primary btn-candy stu-btn" href="/services/english?s=${encodeURIComponent(key)}#my-mistakes">לחזרה על הטעויות</a>
      </div>`;
  }

  // The class leaderboard, and where the student stands in it.
  async function renderBoard() {
    const data = await window.StudentProgress?.leaderboard();
    const body = document.getElementById("stuBoardBody");
    if (!body) return;
    if (!data) {
      body.innerHTML = `<p class="lb-empty">לא הצלחנו לטעון את הטבלה. נסו לרענן את הדף.</p>`;
      return;
    }
    const me = data.rows.find((row) => row.isMe);
    if (me) {
      const rank = 1 + data.rows.filter((row) => row.total > me.total).length;
      const points = me.total === 1 ? "נקודה אחת" : `${me.total.toLocaleString("he-IL")} נקודות`;
      document.getElementById("stuBoardMe").innerHTML = `יש לך <b>${esc(points)}</b>${me.total ? ` · מקום <b>${rank}</b> בכיתה` : ""}`;
      const stat = document.getElementById("stuStatPoints");
      if (stat) stat.textContent = fmtNum(me.total);
    }
    window.Leaderboard.bind(body, data.rows, { limit: 10 });
  }

  function renderInvalid() {
    renderMe("");
    app.innerHTML = `
      <h1 class="stu-hello">אופס!</h1>
      <p class="stu-lead">הקישור הזה לא תקין או שכבר לא פעיל. בקשו מהמורה קישור חדש.</p>`;
  }

  async function init() {
    if (!window.StudentProgress?.setKey(key)) {
      renderInvalid();
      return;
    }
    // The students are Hebrew speakers, so the site opens in Hebrew for them
    // unless this device already chose a language.
    try {
      if (!localStorage.getItem("pleyi-lang")) localStorage.setItem("pleyi-lang", "he");
    } catch {
      /* ignore */
    }
    try {
      const res = await fetch(`/api/student/${encodeURIComponent(key)}`);
      if (res.status === 404) {
        window.StudentProgress.clear();
        renderInvalid();
        return;
      }
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      render(data.student);
    } catch {
      app.innerHTML = `<p class="stu-lead">לא הצלחנו לטעון את שיעורי הבית. בדקו את החיבור לאינטרנט ונסו לרענן.</p>`;
    }
  }

  init();
  // Coming back from an exercise with the browser's back button can restore
  // this page from cache — reload the homework so finished items show as done.
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) init();
  });
})();
