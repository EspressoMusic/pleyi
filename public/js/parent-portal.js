/* The parents' page (/p/<key>) — a second link the teacher sends home. It
   only shows how the student is doing (lib/student-progress.js
   getParentView): this week, the daily challenge streak, the teacher's tasks
   and the last exercises solved. Opening it doesn't link this device to the
   student's file, so nothing done here is saved there. */

(function () {
  const app = document.getElementById("parApp");
  const key = decodeURIComponent(location.pathname.split("/")[2] || "");

  const DAY_LETTERS = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];
  const RECENT_TASKS_DONE = 3;

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

  function dayName(day, opts = { weekday: "long", day: "numeric", month: "long" }) {
    const [y, m, d] = day.slice(0, 10).split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("he-IL", opts);
  }

  function count(n, one, many) {
    return n === 1 ? one : `${n} ${many}`;
  }

  function tile(value, label) {
    return `<li class="par-tile"><b dir="ltr">${esc(value)}</b><span>${esc(label)}</span></li>`;
  }

  function weekHtml(week) {
    return `
      <section class="par-card">
        <h2 class="par-title"><span class="stu-key">השבוע</span></h2>
        <ul class="par-tiles">
          ${tile(week.days, week.days === 1 ? "יום תרגול" : "ימי תרגול")}
          ${tile(week.rounds, "תרגילים")}
          ${tile(week.practiceMin, "דקות תרגול")}
          ${tile(week.average == null ? "—" : `${week.average}`, "ציון ממוצע")}
        </ul>
        <p class="par-note">השבוע התחיל ב${esc(dayName(week.from, { weekday: "long", day: "numeric", month: "long" }))}.</p>
      </section>`;
  }

  function dailyHtml(daily) {
    const days = daily.week
      .map((d, i) => {
        const letter = DAY_LETTERS[new Date(`${d.day}T12:00:00Z`).getUTCDay()];
        return `<li class="${d.done ? "is-done" : ""}${i === daily.week.length - 1 ? " is-today" : ""}" aria-label="${letter}: ${d.done ? "עשה את האתגר" : "בלי אתגר"}"><i aria-hidden="true">${d.done ? ICONS.check : ""}</i><span aria-hidden="true">${letter}</span></li>`;
      })
      .join("");
    return `
      <section class="par-card par-card--daily">
        <h2 class="par-title"><span class="stu-key">האתגר היומי</span></h2>
        <p class="par-line">5 שאלות קצרות באנגלית בכל יום.</p>
        <p class="par-line">${daily.streak ? `רצף עכשיו: <b>${esc(count(daily.streak, "יום אחד", "ימים"))}</b>` : "אין רצף כרגע."}</p>
        ${daily.best > 1 ? `<p class="par-line">השיא: ${esc(count(daily.best, "יום אחד", "ימים"))}</p>` : ""}
        <ol class="stu-daily-week par-daily-week" aria-label="7 הימים האחרונים">${days}</ol>
      </section>`;
  }

  // Open tasks first (late ones on top), then the last few done.
  function tasksHtml(homework, today) {
    if (!homework.length) return "";
    const open = homework.filter((hw) => !hw.doneAt).sort((a, b) => (a.dueDate || "9999").localeCompare(b.dueDate || "9999"));
    const done = homework.filter((hw) => hw.doneAt).sort((a, b) => b.doneAt.localeCompare(a.doneAt));
    const row = (hw) => {
      const late = !hw.doneAt && hw.dueDate && hw.dueDate < today;
      const sub = hw.doneAt
        ? `בוצע ב־${dayName(hw.doneAt, { day: "numeric", month: "long" })}`
        : hw.dueDate
          ? `${late ? "באיחור — " : ""}עד ${dayName(hw.dueDate)}`
          : "עוד לא בוצע";
      const val = hw.doneAt && hw.total ? `<span class="par-row-val" dir="ltr">${hw.score}/${hw.total}</span>` : "";
      return `
        <li class="par-row${hw.doneAt ? " is-done" : ""}${late ? " is-late" : ""}">
          <div class="par-row-body">
            <span class="par-row-title">${esc(hw.exerciseTitle)}</span>
            <span class="par-row-sub">${esc(hw.topicTitle)}</span>
            <span class="par-row-sub">${esc(sub)}</span>
          </div>
          ${val}
        </li>`;
    };
    return `
      <section class="par-card">
        <h2 class="par-title"><span class="stu-key">משימות מהמורה</span></h2>
        <p class="par-line">בוצעו <span dir="ltr">${done.length}/${homework.length}</span></p>
        <ul class="par-list">${[...open, ...done.slice(0, RECENT_TASKS_DONE)].map(row).join("")}</ul>
      </section>`;
  }

  function recentHtml(recent) {
    if (!recent.length) return "";
    return `
      <section class="par-card">
        <h2 class="par-title"><span class="stu-key">תרגילים אחרונים</span></h2>
        <ul class="par-list">
          ${recent
            .map(
              (ex) => `
            <li class="par-row">
              <div class="par-row-body">
                <span class="par-row-title">${esc(ex.title)}</span>
                <span class="par-row-sub">${esc(ex.topicTitle)}</span>
                <span class="par-row-sub">${esc(dayName(ex.at, { day: "numeric", month: "long" }))}</span>
              </div>
              <span class="par-row-val" dir="ltr">${ex.score}/${ex.total}</span>
            </li>`
            )
            .join("")}
        </ul>
      </section>`;
  }

  function render(view) {
    document.title = `${view.name} — דף להורים — Pleyi`;
    const last = view.lastActive ? `תרגול אחרון: ${dayName(view.lastActive)}` : "עוד לא התחיל לתרגל באתר.";
    app.innerHTML = `
      <h1 class="stu-hello">${esc(view.name)}</h1>
      <p class="par-sub">דף להורים</p>
      <p class="par-sub">${esc(last)}</p>
      ${weekHtml(view.week)}
      ${dailyHtml(view.daily)}
      ${tasksHtml(view.homework || [], view.today)}
      ${recentHtml(view.recent || [])}
      <p class="par-foot">הדף מתעדכן לבד בכל פעם שפותחים אותו.</p>`;
  }

  function renderInvalid() {
    app.innerHTML = `
      <h1 class="stu-hello">אופס!</h1>
      <p class="stu-lead">הקישור הזה לא תקין או שכבר לא פעיל. בקשו מהמורה קישור חדש.</p>`;
  }

  async function init() {
    if (!/^[A-Za-z0-9_-]{20,64}$/.test(key)) {
      renderInvalid();
      return;
    }
    try {
      const res = await fetch(`/api/parent/${encodeURIComponent(key)}`);
      if (res.status === 404) {
        renderInvalid();
        return;
      }
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      render(data.view);
    } catch {
      app.innerHTML = `<p class="stu-lead">לא הצלחנו לטעון את הדף. בדקו את החיבור לאינטרנט ונסו לרענן.</p>`;
    }
  }

  init();
})();
