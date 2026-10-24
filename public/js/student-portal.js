/* Student homework page (/s/<key>) — the personal link the teacher sends.
   Shows the student's homework; opening it links this device to the
   student's file, so whatever they solve on the site is saved there. */

(function () {
  const app = document.getElementById("stuApp");
  const key = decodeURIComponent(location.pathname.split("/")[2] || "");

  const ICONS = {
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5L20 7"/></svg>`,
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

  function render(student) {
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
    }
    window.Leaderboard.bind(body, data.rows, { limit: 10 });
  }

  function renderInvalid() {
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
