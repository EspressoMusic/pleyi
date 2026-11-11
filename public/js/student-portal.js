/* Student page (/s/<key>) — the personal link the teacher sends.
   Three tabs: the tasks the teacher left the student, "my map" — the
   English learning path from the first letters to reading an unseen, with
   what the student did on it (lib/english-map.js) — and the library, every
   learning area to practise in on their own. Opening the page links
   this device to the student's file, so whatever they solve on the site is
   saved there. */

(function () {
  const app = document.getElementById("stuApp");
  const key = decodeURIComponent(location.pathname.split("/")[2] || "");
  // The teacher's "מפת ההתקדמות" (?view=teacher): the map alone, and this
  // device stays unlinked from the student's file.
  const teacherView = new URLSearchParams(location.search).get("view") === "teacher";

  const ICONS = {
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5L20 7"/></svg>`,
    flag: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 21V4"/><path d="M5 4h12l-2.5 4.5L17 13H5"/></svg>`,
    trophy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3h8v6a4 4 0 0 1-8 0V3z"/><path d="M8 5H4.5A3.5 3.5 0 0 0 8 10.5M16 5h3.5A3.5 3.5 0 0 1 16 10.5"/><path d="M12 13v4M8 21h8M9.5 17h5"/></svg>`,
    close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>`,
    flame: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22c4.1 0 7-2.8 7-6.8 0-3.6-2.3-6-4.1-8.2-.4 2-1.4 3.3-2.6 3.8.3-3.1-1-6.3-3.8-8.3.1 3.2-1.6 5.4-3.2 7.4C4.2 11.5 5 13.6 5 15.2 5 19.2 7.9 22 12 22Z"/><path d="M12 22c-1.7 0-3-1.3-3-3 0-1.8 1.4-3 2.2-4.3.5 1 1.3 1.6 2 1.8.4-1 .3-2 0-3 1.4 1.1 2.8 2.8 2.8 4.9 0 2.1-1.6 3.6-4 3.6Z"/></svg>`,
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

  /* ── The daily challenge: five short questions a day on the English page
     (#daily), and the streak of days in a row. ── */

  const DAY_LETTERS = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];

  function dailyHtml(daily) {
    if (!daily) return "";
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
      <section class="stu-daily${daily.doneToday ? " is-done" : ""}">
        <div class="stu-daily-head">
          <span class="stu-daily-icon" aria-hidden="true">${ICONS.flame}</span>
          <div class="stu-daily-text">
            <h2 class="stu-daily-title"><span class="stu-key">האתגר היומי</span></h2>
            <p class="stu-daily-line">${daily.doneToday ? "עשית את האתגר של היום!" : "5 שאלות קצרות בכל יום."}</p>
            <p class="stu-daily-line"><b>${esc(streak)}</b></p>
          </div>
        </div>
        <ol class="stu-daily-week" aria-label="7 הימים האחרונים">${days}</ol>
        <a class="btn ${daily.doneToday ? "" : "btn-primary "}btn-candy stu-btn" href="/services/english?s=${encodeURIComponent(key)}#daily">${daily.doneToday ? "סבב נוסף" : "להתחיל"}</a>
      </section>`;
  }

  function tasksHtml(student) {
    const list = sorted(student.homework || []);
    const done = list.filter((hw) => hw.doneAt).length;
    const open = list.length - done;
    const lead = !list.length
      ? "עוד אין משימות. כשהמורה ישאיר לך תרגילים, הם יופיעו כאן."
      : open
        ? "אלה המשימות שהמורה השאיר לך. בהצלחה!"
        : "כל המשימות בוצעו — כל הכבוד!";
    return `
      ${dailyHtml(student.daily)}
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
      ${
        open
          ? ""
          : `<div class="stu-free">
              <h2 class="stu-free-title">רוצים לתרגל עוד?</h2>
              <p>בספרייה יש שיעורים ותרגילים בכל המקצועות.</p>
              <a class="btn btn-primary btn-candy stu-btn" href="#library">לספרייה</a>
            </div>`
      }
      <div class="stu-help">
        <button type="button" class="btn btn-candy stu-btn stu-help-btn" id="stuHelpBtn">צריך עזרה? לכתוב למורה</button>
      </div>
      <dialog class="stu-dlg" id="stuHelpDlg" aria-labelledby="stuHelpTitle"></dialog>`;
  }

  /* ── "צריך עזרה": a short message to the teacher, who sees it in the bell
     on their room page (/my-room). ── */

  function helpFormHtml() {
    return `
      <div class="stu-dlg-body">
        <div class="stu-dlg-head">
          <h2 class="stu-dlg-title" id="stuHelpTitle"><span class="stu-help-key">בקשת עזרה</span></h2>
          <button type="button" class="stu-dlg-close" data-close aria-label="סגירה">${ICONS.close}</button>
        </div>
        <p class="stu-help-lead">כתבו למורה במה צריך עזרה.</p>
        <textarea class="stu-help-text" id="stuHelpText" rows="3" maxlength="300" placeholder="למשל: לא הבנתי את התרגיל השני"></textarea>
        <p class="stu-help-error" id="stuHelpError" hidden></p>
        <button type="button" class="btn btn-primary btn-candy stu-btn stu-dlg-go" id="stuHelpSend">שליחה למורה</button>
      </div>`;
  }

  function helpSentHtml() {
    return `
      <div class="stu-dlg-body">
        <div class="stu-dlg-head">
          <h2 class="stu-dlg-title" id="stuHelpTitle"><span class="stu-help-key">הבקשה נשלחה!</span></h2>
          <button type="button" class="stu-dlg-close" data-close aria-label="סגירה">${ICONS.close}</button>
        </div>
        <p class="stu-help-lead">המורה יראה אותה ויעזור לך.</p>
        <button type="button" class="btn btn-primary btn-candy stu-btn stu-dlg-go" data-close>סגירה</button>
      </div>`;
  }

  function bindHelp() {
    const dialog = document.getElementById("stuHelpDlg");
    const btn = document.getElementById("stuHelpBtn");
    if (!dialog || !btn) return;
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog || e.target.closest("[data-close]")) dialog.close();
    });
    btn.addEventListener("click", () => {
      dialog.innerHTML = helpFormHtml();
      const send = document.getElementById("stuHelpSend");
      const error = document.getElementById("stuHelpError");
      send.addEventListener("click", async () => {
        send.disabled = true;
        error.hidden = true;
        try {
          const res = await fetch("/api/help", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-student-key": key },
            body: JSON.stringify({ text: document.getElementById("stuHelpText").value }),
          });
          const data = await res.json();
          if (!data.ok) throw new Error(data.error);
          dialog.innerHTML = helpSentHtml();
        } catch (e) {
          // A network failure (TypeError) has an English message of its own.
          error.textContent = (!(e instanceof TypeError) && e.message) || "לא הצלחנו לשלוח. נסו שוב.";
          error.hidden = false;
          send.disabled = false;
        }
      });
      dialog.showModal();
    });
  }

  /* ── "My map": the learning path as a winding road. Every topic is a
     circle on it, numbered as on the Learn English page, coloured by what
     the student did; each stage is a sign on the road, and the road leads
     to the goal — reading an unseen. The vocabulary topics sit on the side.
     Tapping a topic shows its lessons and the exercises the student solved. ── */

  const TABS = [
    { id: "tasks", label: "המשימות שלי" },
    { id: "map", label: "המפה שלי" },
    { id: "library", label: "הספרייה" },
  ];

  const STATUS = {
    done: { node: "סיימת", count: "סיימת", about: "סיימת את כל הנושא — כל הכבוד!" },
    started: { node: "התחלת", count: "התחלת", about: "התחלת את הנושא." },
    skipped: { node: "דילגת", count: "דילגת", about: "דילגת על הנושא הזה.\nאפשר לחזור אליו מתי שרוצים." },
    ahead: { node: "", count: "לפניך", about: "עוד לא הגעת לנושא הזה." },
  };

  // The road is drawn in a box this wide, with the topics swaying from side
  // to side of its middle; heights are in px too.
  const ROAD_W = 320;
  const MID = ROAD_W / 2;
  const SWAY = [0, 58, 88, 58, 0, -58, -88, -58];
  const START_H = 96;
  const STAGE_H = 124;
  const TOPIC_H = 150;
  const GOAL_H = 190;

  let current = null;

  function currentTab() {
    const tab = location.hash.slice(1);
    return TABS.some((item) => item.id === tab) ? tab : "tasks";
  }

  function initial(name) {
    return Array.from(String(name || "").trim())[0] || "";
  }

  function topicUrl(topic) {
    return `/services/english?s=${encodeURIComponent(key)}#${encodeURIComponent(topic.id)}`;
  }

  function percent(topic) {
    return topic.items ? Math.round((topic.did / topic.items) * 100) : 0;
  }

  // Where everything sits on the road: the start, each stage's sign and its
  // topics, and the goal — and the points the road goes through.
  function roadLayout(stages) {
    const points = [{ x: MID, y: 40 }];
    const parts = [];
    let y = START_H;
    let num = 0;
    stages.forEach((stage, index) => {
      parts.push({ kind: "stage", stage, index, y });
      points.push({ x: MID, y: y + STAGE_H / 2 });
      y += STAGE_H;
      stage.topics.forEach((topic) => {
        const x = MID + SWAY[num % SWAY.length];
        num++;
        parts.push({ kind: "topic", topic, num, x, y: y + 40 });
        points.push({ x, y: y + 40, topic });
        y += TOPIC_H;
      });
    });
    const goalY = y + 56;
    points.push({ x: MID, y: goalY, goal: true });
    return { parts, points, goalY, height: y + GOAL_H, count: num };
  }

  // A smooth S between every two points.
  function curve(points) {
    return points
      .map((p, i) => {
        if (!i) return `M${p.x} ${p.y}`;
        const q = points[i - 1];
        const mid = (q.y + p.y) / 2;
        return `C${q.x} ${mid} ${p.x} ${mid} ${p.x} ${p.y}`;
      })
      .join(" ");
  }

  // "השוואה: bigger, the biggest" → its Hebrew name and its English words,
  // each on a line of its own (mixed on one line, they come out jumbled).
  function titleParts(title) {
    const match = /^(.+?)(?::\s+|\s+[–-]\s+|(?<=\?)\s+)([A-Za-z].*)$/.exec(title);
    return match ? [match[1], match[2]] : [title, ""];
  }

  // `pinSide`: on the road, the "you are here" pin stands beside the circle,
  // on the side of the road's middle ("left" / "right"); elsewhere above it.
  function nodeHtml(topic, num, here, style = "", pinSide = "") {
    const status = STATUS[topic.status];
    const pct = percent(topic);
    const label = topic.status === "started" ? `${status.node} · <span dir="ltr">${pct}%</span>` : status.node;
    const [name, en] = titleParts(topic.title);
    return `
      <button type="button" class="stu-node is-${topic.status}${here ? " is-here" : ""}" data-topic="${esc(topic.id)}" style="${style}--p:${pct}"
        aria-label="${num}. ${esc(topic.title)}${status.node ? ` — ${esc(status.node)}` : ""}${here ? " — אתה כאן" : ""}">
        ${here ? `<span class="stu-node-pin${pinSide ? ` is-${pinSide}` : ""}" aria-hidden="true">${esc(initial(current.name))}</span>` : ""}
        <span class="stu-node-dot" aria-hidden="true">${topic.status === "done" ? ICONS.check : num}</span>
        <span class="stu-node-text" aria-hidden="true">
          <span class="stu-node-title">${esc(name)}</span>
          ${en ? `<span class="stu-node-en" dir="ltr" lang="en">${esc(en)}</span>` : ""}
          ${label ? `<span class="stu-node-status">${label}</span>` : ""}
        </span>
      </button>`;
  }

  function stageHtml(stage, index, y) {
    const dots = stage.topics.map((topic) => `<i class="stu-mini is-${topic.status}"></i>`).join("");
    const done = stage.topics.filter((topic) => topic.status === "done").length;
    return `
      <div class="stu-stage" style="top:${y + 18}px">
        <span class="stu-stage-head"><span class="stu-key">שלב ${index + 1}</span> ${esc(stage.title)}</span>
        <span class="stu-stage-dots" role="img" aria-label="סיימת ${done} מתוך ${stage.topics.length} נושאים">${dots}</span>
      </div>`;
  }

  function roadHtml(stages, here) {
    const { parts, points, goalY, height } = roadLayout(stages);
    const topics = points.filter((p) => p.topic);
    // The road the student walked: up to the furthest topic they did
    // something in, and to the goal once every topic is done.
    const last = points.reduce((end, p, i) => (p.topic && p.topic.did ? i : end), 0);
    const walked = topics.every((p) => p.topic.status === "done") ? points : points.slice(0, last + 1);
    const goalDone = walked.length === points.length;
    const body = parts
      .map((part) =>
        part.kind === "stage"
          ? stageHtml(part.stage, part.index, part.y)
          : nodeHtml(part.topic, part.num, part.topic.id === here, `left:${part.x}px;top:${part.y}px;`, part.x > MID ? "left" : "right")
      )
      .join("");
    return `
      <div class="stu-road" style="height:${height}px">
        <svg class="stu-road-svg" width="${ROAD_W}" height="${height}" viewBox="0 0 ${ROAD_W} ${height}" aria-hidden="true" focusable="false">
          <path class="stu-road-edge" d="${curve(points)}"/>
          <path class="stu-road-way" d="${curve(points)}"/>
          ${walked.length > 1 ? `<path class="stu-road-walked" d="${curve(walked)}"/>` : ""}
          <path class="stu-road-lane" d="${curve(points)}"/>
        </svg>
        <div class="stu-start" style="top:${points[0].y}px"><span class="stu-start-icon">${ICONS.flag}</span>התחלה</div>
        ${body}
        <div class="stu-goal${goalDone ? " is-done" : ""}" style="top:${goalY}px">
          <span class="stu-goal-icon">${ICONS.trophy}</span>
          <span class="stu-goal-text">המטרה: להבין אנסין!</span>
        </div>
      </div>`;
  }

  function sideHtml(stage, firstNum, here) {
    return `
      <section class="stu-side">
        <h2 class="stu-side-title"><span class="stu-key">לאורך כל הדרך</span> ${esc(stage.title)}</h2>
        <div class="stu-side-grid">${stage.topics.map((topic, i) => nodeHtml(topic, firstNum + i, topic.id === here)).join("")}</div>
      </section>`;
  }

  function mapHtml(student) {
    const map = student.map;
    if (!map?.stages?.length) return `<p class="stu-lead">לא הצלחנו לטעון את המפה. נסו לרענן.</p>`;
    const road = map.stages.filter((stage) => !stage.side);
    const side = map.stages.filter((stage) => stage.side);
    const all = map.stages.flatMap((stage) => stage.topics);
    const counts = Object.keys(STATUS).map((status) => {
      const n = all.filter((topic) => topic.status === status).length;
      return `<li class="stu-legend-item"><i class="stu-mini is-${status}"></i>${STATUS[status].count} <b>${n}</b></li>`;
    });
    const roadCount = road.reduce((sum, stage) => sum + stage.topics.length, 0);
    return `
      <section class="stu-map-head">
        <h2 class="stu-map-title">המסע שלי באנגלית</h2>
        <p class="stu-map-lead">מהאותיות הראשונות ועד להבין אנסין.</p>
        <p class="stu-map-lead">לחצו על נושא כדי לראות מה עשיתם בו.</p>
        <ul class="stu-legend">${counts.join("")}</ul>
        ${map.here ? `<button type="button" class="btn btn-primary btn-candy stu-btn stu-to-here" id="stuToHere">למקום שלי במפה</button>` : ""}
      </section>
      ${roadHtml(road, map.here)}
      ${side.map((stage) => sideHtml(stage, roadCount + 1, map.here)).join("")}
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

  function bindMap(student) {
    const dialog = document.getElementById("stuTopicDlg");
    const nums = new Map();
    let num = 0;
    student.map.stages.forEach((stage) => stage.topics.forEach((topic) => nums.set(topic.id, { topic, num: ++num })));
    app.querySelectorAll(".stu-node").forEach((node) => {
      node.addEventListener("click", () => {
        const found = nums.get(node.dataset.topic);
        if (!found || !dialog) return;
        dialog.innerHTML = `<div class="stu-dlg-body">${topicInfoHtml(found.topic, found.num, found.topic.id === student.map.here)}</div>`;
        document.getElementById("stuDlgClose").addEventListener("click", () => dialog.close());
        dialog.showModal();
      });
    });
    // A tap on the dimmed page around the dialog closes it.
    dialog?.addEventListener("click", (e) => {
      if (e.target === dialog) dialog.close();
    });
    document.getElementById("stuToHere")?.addEventListener("click", () => {
      app.querySelector(".stu-node.is-here")?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  /* ── The library: every learning area on the site (the subjects as in
     subject-practice.js AREAS), to practise in even with no tasks left.
     What the student solves there is saved to their file as well. ── */

  const LIBRARY = [
    { slug: "english", title: "אנגלית", about: "מהאותיות הראשונות ועד אנסין" },
    { slug: "math", title: "חשבון", about: "מחיבור וחיסור ועד אלגברה" },
    { slug: "hebrew", title: "עברית", about: "קריאה, דקדוק וכתיבה" },
    { slug: "science", title: "מדעים", about: "צמחים, חשמל, אנרגיה ועוד" },
    { slug: "geography", title: "גאוגרפיה", about: "מפות, ארץ ישראל והעולם" },
    { slug: "history", title: "היסטוריה", about: "מימי בית ראשון ועד המדינה" },
    { slug: "lifeskills", title: "כישורי חיים", about: "כסף, זמן ובטיחות ברשת" },
    { slug: "body", title: "גוף האדם", about: "הלב, הריאות, המוח ועוד" },
    { slug: "health", title: "נפלאות הבריאה", about: "הרי געש, סופות וקשת" },
  ];

  function libraryHtml() {
    return `
      <p class="stu-lead">בחרו מקצוע ולמדו מתי שרוצים.</p>
      <p class="stu-lead">בכל מקצוע יש שיעורים ותרגילים.</p>
      <ul class="stu-lib">
        ${LIBRARY.map(
          (area) => `
          <li>
            <a class="stu-lib-card" href="/services/${area.slug}?s=${encodeURIComponent(key)}">
              <span class="stu-lib-title">${esc(area.title)}</span>
              <span class="stu-lib-about">${esc(area.about)}</span>
            </a>
          </li>`
        ).join("")}
      </ul>`;
  }

  function render(student) {
    current = student;
    document.title = `${student.name} — Pleyi`;
    if (teacherView) {
      app.innerHTML = `<h1 class="stu-hello">${esc(student.name)}</h1>${mapHtml(student)}`;
      bindMap(student);
      return;
    }
    const tab = currentTab();
    app.innerHTML = `
      <h1 class="stu-hello">שלום, ${esc(student.name)}!</h1>
      <nav class="stu-tabs" aria-label="העמוד שלי">
        ${TABS.map((item) => `<a class="stu-tab${item.id === tab ? " is-on" : ""}" href="#${item.id}"${item.id === tab ? ' aria-current="page"' : ""}>${item.label}</a>`).join("")}
      </nav>
      ${tab === "map" ? mapHtml(student) : tab === "library" ? libraryHtml() : tasksHtml(student)}`;
    if (tab === "map") bindMap(student);
    else if (tab === "tasks") bindHelp();
  }

  window.addEventListener("hashchange", () => {
    if (current) render(current);
  });

  function renderInvalid() {
    app.innerHTML = `
      <h1 class="stu-hello">אופס!</h1>
      <p class="stu-lead">הקישור הזה לא תקין או שכבר לא פעיל. בקשו מהמורה קישור חדש.</p>`;
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
      if (res.status === 404) {
        if (!teacherView) window.StudentProgress.clear();
        renderInvalid();
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
