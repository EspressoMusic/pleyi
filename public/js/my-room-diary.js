/* My room — "היומן שלי": the teacher's diary, a week or a month at a time
   (lib/teacher-diary.js). Every school day has goals the teacher writes and
   lessons picked from the site's lessons (English, the school subjects) or
   the teacher's own. A planned lesson can be sent to the students: the
   lesson and its practice set land in their tasks, locked until the
   lesson's day. With "שליחה אוטומטית" on, every lesson goes out as the day
   is saved. my-room.js opens it in its dialog (BOX_BODIES.diary) and lends
   it the sign-in, the students and classes (window.MyRoom). */

(function () {
  // Saturday has no school: the week and the month show Sunday to Friday.
  const SHOW_SATURDAY = false;
  const MAX_LESSONS = 8;
  const MAX_GOALS = 8;
  const DAY_NAMES = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
  const DAY_LETTERS = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];
  const MONTHS = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
  const MINE = "mine";

  const SVG = {
    prev: '<path d="m9 6 6 6-6 6"/>',
    next: '<path d="m15 6-6 6 6 6"/>',
    lesson: '<path d="M4 5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2V5z"/><path d="M4 20a2 2 0 0 0 2 2h13v-4"/>',
    goal: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    check: '<path d="m5 12 5 5L20 7"/>',
    send: '<path d="M21 3 10 14"/><path d="M21 3 14.5 21l-4.5-7-7-4.5Z"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7.5a4 4 0 0 1 8 0V11"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  };

  function svg(name) {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SVG[name]}</svg>`;
  }

  function esc(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  const room = () => window.MyRoom;

  /* ── Days: "YYYY-MM-DD" on the teacher's own clock ── */

  function keyOf(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function dateOf(key) {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function todayKey() {
    return keyOf(new Date());
  }

  function addDays(key, n) {
    const d = dateOf(key);
    d.setDate(d.getDate() + n);
    return keyOf(d);
  }

  const schoolDay = (key) => SHOW_SATURDAY || dateOf(key).getDay() !== 6;

  function weekDays(key) {
    const start = addDays(key, -dateOf(key).getDay());
    return Array.from({ length: 7 }, (_, i) => addDays(start, i)).filter(schoolDay);
  }

  // The month as rows of weeks; a day of another month is null.
  function monthWeeks(key) {
    const first = dateOf(key);
    first.setDate(1);
    const month = first.getMonth();
    let day = addDays(keyOf(first), -first.getDay());
    const weeks = [];
    while (dateOf(day).getMonth() === month || weeks.length === 0) {
      weeks.push(Array.from({ length: 7 }, (_, i) => addDays(day, i)).filter(schoolDay).map((k) => (dateOf(k).getMonth() === month ? k : null)));
      day = addDays(day, 7);
    }
    return weeks;
  }

  function dayTitle(key) {
    const d = dateOf(key);
    return `יום ${DAY_NAMES[d.getDay()]}, ${d.getDate()} ב${MONTHS[d.getMonth()]}`;
  }

  function shortDate(key) {
    const d = dateOf(key);
    return `${d.getDate()}.${d.getMonth() + 1}`;
  }

  /* ── State ── */

  const state = {
    loaded: false,
    diary: { auto: false, target: "all", days: {} },
    view: "week",
    anchor: todayKey(),
    pane: "",
    edit: null,
    area: "english",
    query: "",
    catalog: null,
    index: new Map(),
    busy: false,
  };
  let dialog = null;
  let loading = null;

  const dayOf = (key) => state.diary.days[key] || { goals: [], lessons: [] };

  function shownDays() {
    return state.view === "week" ? weekDays(state.anchor) : monthWeeks(state.anchor).flat().filter(Boolean);
  }

  function rangeLabel() {
    if (state.view === "month") {
      const d = dateOf(state.anchor);
      return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    }
    const days = weekDays(state.anchor);
    const a = dateOf(days[0]);
    const b = dateOf(days[days.length - 1]);
    return a.getMonth() === b.getMonth()
      ? `${a.getDate()}–${b.getDate()} ב${MONTHS[b.getMonth()]}`
      : `${a.getDate()} ב${MONTHS[a.getMonth()]} – ${b.getDate()} ב${MONTHS[b.getMonth()]}`;
  }

  /* ── The server (or, in the preview, the page itself) ── */

  async function api(method, path, body) {
    const token = await room().token();
    if (!token) throw new Error("צריך להתחבר כדי להשתמש ביומן");
    const res = await fetch(`/api/my-diary${path}`, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) throw new Error(data.error || "משהו השתבש — נסו שוב");
    return data;
  }

  // The preview (?preview=teacher on localhost) keeps the diary in the page.
  const preview = {
    newId: () => Math.random().toString(16).slice(2, 14).padEnd(12, "0"),
    send(days, again) {
      const now = new Date().toISOString();
      let lessons = 0;
      days.forEach((k) =>
        (state.diary.days[k]?.lessons || []).forEach((l) => {
          if (l.sentAt && !again) return;
          l.sentAt = now;
          l.sentTo = room().students().length;
          lessons++;
        })
      );
      return { diary: state.diary, sent: { lessons, students: lessons ? room().students().length : 0 } };
    },
    saveDay(key, body) {
      const before = dayOf(key).lessons;
      const lessons = body.lessons.map((l) => before.find((b) => b.id === l.id) || { id: preview.newId(), ...l, sentAt: null, sentTo: 0 });
      if (!body.goals.length && !lessons.length) delete state.diary.days[key];
      else state.diary.days[key] = { goals: body.goals.map((text) => ({ text })), lessons };
      return state.diary.auto ? preview.send([key], false) : { diary: state.diary };
    },
  };

  async function loadDiary() {
    if (room().preview()) {
      state.loaded = true;
      return;
    }
    const { diary } = await api("GET", "");
    state.diary = diary;
    state.loaded = true;
  }

  // The lessons to pick from (/api/diary-catalog), indexed by id for their
  // names; the teacher's own lessons are an area of their own.
  async function loadCatalog() {
    if (state.catalog) return state.catalog;
    const res = await fetch("/api/diary-catalog");
    const data = await res.json().catch(() => ({}));
    if (!data.ok) throw new Error(data.error || "לא הצלחנו לטעון את השיעורים");
    state.catalog = data.areas || [];
    state.catalog.forEach((area) =>
      area.stages.forEach((stage) =>
        stage.topics.forEach((topic) =>
          topic.lessons.forEach((lesson) => {
            if (!state.index.has(lesson.id)) state.index.set(lesson.id, { ...lesson, topicTitle: topic.title, areaTitle: area.title });
          })
        )
      )
    );
    return state.catalog;
  }

  function myLessonsArea() {
    const list = room().myLessons() || [];
    if (!list.length) return null;
    return {
      id: MINE,
      title: "השיעורים שלי",
      stages: [{ title: "", topics: [{ id: MINE, title: "השיעורים שיצרתי", lessons: list.map((l) => ({ id: `my-${l.id}`, title: l.title, name: l.title })) }] }],
    };
  }

  /* ── The students: who the lessons go to, and who finished their practice ── */

  function targetStudents() {
    const all = (room().students() || []).filter((s) => !s.blocked);
    const target = state.diary.target;
    return target && target !== "all" ? all.filter((s) => (s.classIds || []).includes(target)) : all;
  }

  function finishedCount(lesson) {
    return (room().students() || []).filter((s) => (s.homework || []).some((hw) => hw.diaryId === lesson.id && hw.type === "set" && hw.doneAt)).length;
  }

  function studentsText(n) {
    return n === 1 ? "תלמיד אחד" : `${n} תלמידים`;
  }

  // What the toast says after a sending.
  function sentText(sent, days) {
    if (!sent) return "";
    if (!sent.lessons) return "אין שיעורים חדשים לשליחה";
    if (!sent.students) return "השיעורים נשמרו. עוד אין תלמידים לשלוח אליהם";
    const opens = days.length === 1 ? (days[0] > todayKey() ? ` · ייפתח להם ב־${shortDate(days[0])}` : " · פתוח להם כבר עכשיו") : "";
    return `נשלח ל־${studentsText(sent.students)}${opens}`;
  }

  /* ── The main view: the week or the month ── */

  function lessonChipHtml(l) {
    return `
      <li class="dy-chip${l.sentAt ? " is-sent" : ""}">
        <span class="dy-chip-icon">${svg("lesson")}</span>
        <span class="dy-chip-text"><bdi>${esc(l.name)}</bdi></span>
        ${l.sentAt ? `<span class="dy-chip-sent" title="נשלח לתלמידים" aria-label="נשלח לתלמידים">${svg("check")}</span>` : ""}
      </li>`;
  }

  function weekHtml() {
    const today = todayKey();
    return `
      <ol class="dy-week">
        ${weekDays(state.anchor)
          .map((key) => {
            const day = dayOf(key);
            const d = dateOf(key);
            const empty = !day.goals.length && !day.lessons.length;
            const unsent = day.lessons.filter((l) => !l.sentAt).length;
            return `
              <li class="dy-day${key === today ? " is-today" : ""}${key < today ? " is-past" : ""}${empty ? " is-empty" : ""}">
                <button type="button" class="dy-day-open" data-day="${key}" aria-label="${esc(dayTitle(key))}">
                  <span class="dy-day-name">${DAY_NAMES[d.getDay()]}</span>
                  <span class="dy-day-date">${shortDate(key)}</span>
                  ${key === today ? `<span class="dy-day-now">היום</span>` : ""}
                </button>
                ${day.goals.length ? `<ul class="dy-goals">${day.goals.map((g) => `<li>${svg("goal")}<span>${esc(g.text)}</span></li>`).join("")}</ul>` : ""}
                ${day.lessons.length ? `<ul class="dy-chips">${day.lessons.map(lessonChipHtml).join("")}</ul>` : ""}
                <span class="dy-day-foot">${
                  empty
                    ? `${svg("plus")}<span>הוספה</span>`
                    : unsent
                      ? `<span class="dy-day-wait">${unsent === 1 ? "שיעור אחד לא נשלח" : `${unsent} שיעורים לא נשלחו`}</span>`
                      : day.lessons.length
                        ? `<span class="dy-day-ok">${svg("check")}נשלח לתלמידים</span>`
                        : ""
                }</span>
              </li>`;
          })
          .join("")}
      </ol>`;
  }

  function monthHtml() {
    const today = todayKey();
    const head = [0, 1, 2, 3, 4, 5, 6]
      .filter((i) => SHOW_SATURDAY || i !== 6)
      .map((i) => `<span class="dy-month-wd">${DAY_LETTERS[i]}</span>`)
      .join("");
    const cells = monthWeeks(state.anchor)
      .flat()
      .map((key) => {
        if (!key) return `<span class="dy-cell is-out" aria-hidden="true"></span>`;
        const day = dayOf(key);
        const shown = day.lessons.slice(0, 2);
        const more = day.lessons.length - shown.length;
        const unsent = day.lessons.some((l) => !l.sentAt);
        const label = `${dayTitle(key)}${day.lessons.length ? ` — ${day.lessons.length === 1 ? "שיעור אחד" : `${day.lessons.length} שיעורים`}` : ""}`;
        return `
          <button type="button" class="dy-cell${key === today ? " is-today" : ""}${key < today ? " is-past" : ""}${day.lessons.length || day.goals.length ? " has-plan" : ""}" data-day="${key}" aria-label="${esc(label)}">
            <span class="dy-cell-num">${dateOf(key).getDate()}</span>
            ${shown.map((l) => `<span class="dy-cell-lesson${l.sentAt ? " is-sent" : ""}"><bdi>${esc(l.name)}</bdi></span>`).join("")}
            ${more > 0 ? `<span class="dy-cell-more">+${more}</span>` : ""}
            <span class="dy-cell-dots" aria-hidden="true">
              ${day.goals.length ? `<i class="dy-dot dy-dot--goal"></i>` : ""}
              ${day.lessons.length ? `<i class="dy-dot${unsent ? "" : " dy-dot--sent"}"></i>` : ""}
            </span>
          </button>`;
      })
      .join("");
    return `
      <div class="dy-month${SHOW_SATURDAY ? " dy-month--7" : ""}">
        <div class="dy-month-head">${head}</div>
        <div class="dy-month-grid">${cells}</div>
      </div>`;
  }

  function targetHtml() {
    const classes = room().classes() || [];
    const all = (room().students() || []).filter((s) => !s.blocked).length;
    if (!classes.length) return `<span class="dy-target-one">לכל התלמידים (${all})</span>`;
    const options = [`<option value="all">לכל התלמידים (${all})</option>`]
      .concat(classes.map((c) => `<option value="${esc(c.id)}"${state.diary.target === c.id ? " selected" : ""}>כיתה ${esc(c.name)}</option>`))
      .join("");
    return `<label class="dy-target"><span class="dy-target-label">שולחים:</span><select data-target>${options}</select></label>`;
  }

  function mainHtml() {
    const week = state.view === "week";
    const unsent = shownDays().reduce((n, key) => n + dayOf(key).lessons.filter((l) => !l.sentAt).length, 0);
    return `
      <div class="dy-top">
        <div class="dy-views" role="group" aria-label="תצוגת היומן">
          <button type="button" class="dy-view${week ? " is-on" : ""}" data-view="week" aria-pressed="${week}">שבוע</button>
          <button type="button" class="dy-view${week ? "" : " is-on"}" data-view="month" aria-pressed="${!week}">חודש</button>
        </div>
        <div class="dy-nav">
          <button type="button" class="dy-arrow" data-move="-1" aria-label="${week ? "השבוע הקודם" : "החודש הקודם"}">${svg("prev")}</button>
          <span class="dy-range">${esc(rangeLabel())}</span>
          <button type="button" class="dy-arrow" data-move="1" aria-label="${week ? "השבוע הבא" : "החודש הבא"}">${svg("next")}</button>
          <button type="button" class="dy-today" data-today>היום</button>
        </div>
      </div>
      <div class="dy-send">
        <label class="dy-auto">
          <input type="checkbox" data-auto${state.diary.auto ? " checked" : ""} />
          <span class="dy-switch" aria-hidden="true"></span>
          <span class="dy-auto-text">שליחה אוטומטית לתלמידים</span>
        </label>
        ${targetHtml()}
      </div>
      <div class="dy-tips">
        <p>לוחצים על יום כדי להוסיף לו שיעורים ומטרות.</p>
        <p>${state.diary.auto ? "כל שיעור שמוסיפים נשלח מיד לתלמידים, עם התרגול שלו." : "התלמידים מקבלים את השיעור ואת התרגול שלו."}</p>
        <p>אצל התלמידים הוא נעול עד היום של השיעור.</p>
      </div>
      ${week ? weekHtml() : monthHtml()}
      ${
        unsent && !state.diary.auto
          ? `<button type="button" class="dy-send-all" data-send-range>${svg("send")}<span>שליחת ${unsent === 1 ? "השיעור" : `${unsent} השיעורים`} ש${week ? "בשבוע" : "בחודש"} לתלמידים</span></button>`
          : ""
      }`;
  }

  /* ── A day: its goals and lessons ── */

  function lessonStatus(l, key) {
    if (!l.id) return "חדש · יישמר בלחיצה על שמירה";
    if (!l.sentAt) return "עוד לא נשלח לתלמידים";
    const done = finishedCount(l);
    const when = key > todayKey() ? ` · נפתח להם ב־${shortDate(key)}` : "";
    return `נשלח ל־${studentsText(l.sentTo || 0)}${when}${done ? ` · סיימו את התרגול: ${done}` : ""}`;
  }

  function dayPaneHtml() {
    const { key, goals, lessons } = state.edit;
    const auto = state.diary.auto;
    const opened = key <= todayKey();
    const notes = auto
      ? ["בשמירה השיעורים נשלחים לתלמידים, עם התרגול של כל שיעור."]
      : ["״שמירה״ שומרת ביומן בלבד.", "״שמירה ושליחה״ שולחת לתלמידים את השיעור ואת התרגול שלו."];
    notes.push(opened ? "היום הזה כבר הגיע, אז אצל התלמידים זה ייפתח מיד." : `אצל התלמידים זה נעול עד ${dayTitle(key)}.`);
    return `
      <div class="dy-pane">
        <div class="dy-pane-head">
          <button type="button" class="dy-back" data-back>${svg("prev")}<span>חזרה ליומן</span></button>
        </div>
        <h3 class="dy-pane-title"><span class="room-key">${esc(dayTitle(key))}</span></h3>
        <section class="dy-part">
          <h4 class="dy-part-title">${svg("goal")}<span>מטרות</span></h4>
          ${
            goals.length
              ? `<ul class="dy-goal-list">${goals
                  .map(
                    (text, i) => `
                    <li>
                      <input type="text" class="room-create-input dy-goal-input" data-goal="${i}" value="${esc(text)}" maxlength="200" placeholder="למשל: התלמידים אומרים שלום באנגלית" aria-label="מטרה ${i + 1}" />
                      <button type="button" class="dy-x" data-del-goal="${i}" aria-label="מחיקת המטרה">${svg("close")}</button>
                    </li>`
                  )
                  .join("")}</ul>`
              : `<p class="dy-none">עוד אין מטרות ליום הזה.</p>`
          }
          ${goals.length < MAX_GOALS ? `<button type="button" class="dy-add" data-add-goal>${svg("plus")}<span>הוספת מטרה</span></button>` : ""}
        </section>
        <section class="dy-part">
          <h4 class="dy-part-title">${svg("lesson")}<span>שיעורים</span></h4>
          ${
            lessons.length
              ? `<ul class="dy-lesson-list">${lessons
                  .map(
                    (l, i) => `
                    <li class="dy-lesson-row${l.sentAt ? " is-sent" : ""}">
                      <span class="dy-lesson-icon">${svg("lesson")}</span>
                      <span class="dy-lesson-text">
                        <span class="dy-lesson-name"><bdi>${esc(l.name)}</bdi></span>
                        <span class="dy-lesson-meta">${esc(l.areaTitle || l.topicTitle || "")}</span>
                        <span class="dy-lesson-meta">${esc(lessonStatus(l, key))}</span>
                      </span>
                      <button type="button" class="dy-x" data-del-lesson="${i}" aria-label="הסרת השיעור">${svg("close")}</button>
                    </li>`
                  )
                  .join("")}</ul>`
              : `<p class="dy-none">עוד אין שיעורים ליום הזה.</p>`
          }
          ${lessons.length < MAX_LESSONS ? `<button type="button" class="dy-add" data-pick>${svg("plus")}<span>הוספת שיעור</span></button>` : ""}
        </section>
        <div class="dy-tips">${notes.map((n) => `<p>${esc(n)}</p>`).join("")}</div>
        <div class="dy-actions">
          <button type="button" class="room-create-go dy-save" data-save>שמירה</button>
          ${!auto && lessons.length ? `<button type="button" class="dy-save-send" data-save-send>${svg("send")}<span>שמירה ושליחה לתלמידים</span></button>` : ""}
        </div>
      </div>`;
  }

  /* ── Picking a lesson: a subject, then its stages, topics and lessons; or
     a search over all of them ── */

  function pickAreas() {
    const mine = myLessonsArea();
    return [...(state.catalog || []), ...(mine ? [mine] : [])];
  }

  function pickListHtml() {
    const chosen = new Set(state.edit.lessons.map((l) => l.lessonId));
    const query = state.query.trim();
    const match = (text) => String(text || "").toLowerCase().includes(query.toLowerCase());
    const areas = query.length >= 2 ? pickAreas() : pickAreas().filter((a) => a.id === state.area);
    let num = 0;
    const groups = areas
      .flatMap((area) =>
        area.stages.map((stage, si) => {
          const topics = stage.topics
            .map((topic) => ({ topic, lessons: query.length >= 2 ? topic.lessons.filter((l) => match(topic.title) || match(l.title) || match(l.name)) : topic.lessons }))
            .filter((t) => t.lessons.length);
          if (!topics.length) return "";
          const title = query.length >= 2 ? `${area.title}${stage.title ? ` · ${stage.title}` : ""}` : stage.title ? `שלב ${si + 1} · ${stage.title}` : "";
          return `
            ${title ? `<h4 class="dy-pick-stage">${esc(title)}</h4>` : ""}
            ${topics
              .map(
                ({ topic, lessons }) => `
                <div class="dy-pick-topic">
                  <p class="dy-pick-topic-title">${area.id === MINE ? "" : `<span class="dy-pick-num">${++num}</span>`}<span>${esc(topic.title)}</span></p>
                  <div class="dy-pick-lessons">
                    ${lessons
                      .map((l) => {
                        const on = chosen.has(l.id);
                        return `<button type="button" class="dy-pick-lesson${on ? " is-on" : ""}" data-pick-lesson="${esc(l.id)}" data-area="${esc(area.id)}"${on ? ' aria-pressed="true"' : ""}>${on ? svg("check") : ""}<bdi>${esc(l.title)}</bdi></button>`;
                      })
                      .join("")}
                  </div>
                </div>`
              )
              .join("")}`;
        })
      )
      .join("");
    return groups || `<p class="dy-none">${query.length >= 2 ? "לא מצאנו שיעור כזה." : "אין כאן שיעורים."}</p>`;
  }

  function pickPaneHtml() {
    if (!state.catalog) return `<div class="dy-pane"><p class="dy-loading">טוענים את השיעורים…</p></div>`;
    const chips = pickAreas()
      .map(
        (area) => `
        <label class="room-create-subject">
          <input type="radio" name="dyArea" value="${esc(area.id)}"${area.id === state.area ? " checked" : ""} />
          <span>${esc(area.title)}</span>
        </label>`
      )
      .join("");
    return `
      <div class="dy-pane">
        <div class="dy-pane-head">
          <button type="button" class="dy-back" data-back-day>${svg("prev")}<span>חזרה ליום</span></button>
        </div>
        <h3 class="dy-pane-title"><span class="room-key">בחירת שיעור</span></h3>
        <div class="room-create-subjects dy-areas">${chips}</div>
        <label class="dy-search">
          ${svg("search")}
          <input type="search" class="room-create-input" data-search value="${esc(state.query)}" placeholder="חיפוש שיעור בכל המקצועות" aria-label="חיפוש שיעור" />
        </label>
        <div class="dy-pick-list" id="dyPickList">${pickListHtml()}</div>
      </div>`;
  }

  /* ── Drawing and binding ── */

  function root() {
    return dialog?.querySelector("#roomDiary");
  }

  function render() {
    const el = root();
    if (!el) return;
    if (!state.loaded) {
      el.innerHTML = `<p class="dy-loading">טוענים את היומן…</p>`;
      return;
    }
    el.innerHTML = state.pane === "day" ? dayPaneHtml() : state.pane === "pick" ? pickPaneHtml() : mainHtml();
    el.dataset.pane = state.pane || "main";
    bindPane(el);
  }

  function dirty(on = true) {
    if (!dialog) return;
    if (on) dialog.dataset.dirty = "1";
    else delete dialog.dataset.dirty;
  }

  function openDay(key) {
    const day = dayOf(key);
    state.edit = {
      key,
      goals: day.goals.map((g) => g.text),
      lessons: day.lessons.map((l) => ({ ...l, areaTitle: state.index.get(l.lessonId)?.areaTitle || l.topicTitle || "" })),
    };
    state.pane = "day";
    dirty(false);
    render();
    dialog.scrollTop = 0;
  }

  function backToMain() {
    if (!room().mayClose(dialog)) return;
    dirty(false);
    state.pane = "";
    state.edit = null;
    render();
  }

  async function openPick() {
    readGoals();
    state.pane = "pick";
    state.query = "";
    render();
    dialog.scrollTop = 0;
    try {
      await loadCatalog();
      if (state.pane === "pick") render();
    } catch (err) {
      room().toast(err.message);
      state.pane = "day";
      render();
    }
  }

  function readGoals() {
    root()
      ?.querySelectorAll("[data-goal]")
      .forEach((input) => {
        state.edit.goals[Number(input.dataset.goal)] = input.value;
      });
  }

  function busy(on) {
    state.busy = on;
    root()
      ?.querySelectorAll("button, input, select")
      .forEach((el) => {
        el.disabled = on;
      });
  }

  async function saveDay(send) {
    if (state.busy) return;
    readGoals();
    const { key } = state.edit;
    const body = {
      goals: state.edit.goals.map((g) => g.trim()).filter(Boolean),
      lessons: state.edit.lessons.map((l) => (l.id ? { id: l.id } : { lessonId: l.lessonId, name: l.name, topicTitle: l.topicTitle, area: l.area })),
    };
    busy(true);
    try {
      let res = room().preview() ? preview.saveDay(key, body) : await api("PUT", `/days/${key}`, body);
      state.diary = res.diary;
      if (send) res = room().preview() ? preview.send([key], true) : await api("POST", "/send", { days: [key], again: true });
      state.diary = res.diary;
      room().toast(sentText(res.sent, [key]) || "היום נשמר ביומן");
      dirty(false);
      state.pane = "";
      state.edit = null;
    } catch (err) {
      room().toast(err.message);
    }
    state.busy = false;
    render();
  }

  async function sendRange() {
    if (state.busy) return;
    const days = shownDays().filter((key) => dayOf(key).lessons.some((l) => !l.sentAt));
    const n = targetStudents().length;
    if (!confirm(`לשלוח את השיעורים ל־${studentsText(n)}?\nאצל התלמידים כל שיעור נעול עד היום שלו.`)) return;
    busy(true);
    try {
      const res = room().preview() ? preview.send(days, false) : await api("POST", "/send", { days });
      state.diary = res.diary;
      room().toast(sentText(res.sent, days));
    } catch (err) {
      room().toast(err.message);
    }
    state.busy = false;
    render();
  }

  async function saveSettings(fields, input) {
    if (state.busy) return;
    if (fields.auto) {
      const today = todayKey();
      const waiting = Object.entries(state.diary.days)
        .filter(([key]) => key >= today)
        .reduce((n, [, day]) => n + day.lessons.filter((l) => !l.sentAt).length, 0);
      if (waiting && !confirm(`ביומן יש ${waiting === 1 ? "שיעור אחד" : `${waiting} שיעורים`} מהיום והלאה שעוד לא נשלחו.\nלשלוח אותם עכשיו לתלמידים?`)) {
        if (input) input.checked = false;
        return;
      }
    }
    busy(true);
    try {
      let res;
      if (room().preview()) {
        Object.assign(state.diary, fields);
        res = fields.auto ? preview.send(Object.keys(state.diary.days).filter((k) => k >= todayKey()), false) : { diary: state.diary };
      } else {
        res = await api("PATCH", "", fields);
      }
      state.diary = res.diary;
      if ("auto" in fields) room().toast(fields.auto ? `השליחה האוטומטית פועלת${res.sent?.lessons ? ` · ${sentText(res.sent, [])}` : ""}` : "השליחה האוטומטית כבויה");
      else room().toast("נשמר");
    } catch (err) {
      room().toast(err.message);
    }
    state.busy = false;
    render();
  }

  function bindPane(el) {
    // The week or the month.
    el.querySelectorAll("[data-view]").forEach((btn) =>
      btn.addEventListener("click", () => {
        // The month of the week on screen: the month of its Sunday.
        if (btn.dataset.view === "month" && state.view === "week") state.anchor = weekDays(state.anchor)[0];
        state.view = btn.dataset.view;
        render();
      })
    );
    el.querySelectorAll("[data-move]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const step = Number(btn.dataset.move);
        if (state.view === "week") state.anchor = addDays(state.anchor, 7 * step);
        else {
          const d = dateOf(state.anchor);
          state.anchor = keyOf(new Date(d.getFullYear(), d.getMonth() + step, 1));
        }
        render();
      })
    );
    el.querySelector("[data-today]")?.addEventListener("click", () => {
      state.anchor = todayKey();
      render();
    });
    el.querySelectorAll("[data-day]").forEach((btn) => btn.addEventListener("click", () => openDay(btn.dataset.day)));
    // A tap anywhere on a day card of the week opens it.
    el.querySelectorAll(".dy-day").forEach((card) =>
      card.addEventListener("click", (e) => {
        if (!e.target.closest("[data-day]")) openDay(card.querySelector("[data-day]").dataset.day);
      })
    );
    el.querySelector("[data-auto]")?.addEventListener("change", (e) => saveSettings({ auto: e.target.checked }, e.target));
    el.querySelector("[data-target]")?.addEventListener("change", (e) => saveSettings({ target: e.target.value }));
    el.querySelector("[data-send-range]")?.addEventListener("click", sendRange);

    // A day.
    el.querySelector("[data-back]")?.addEventListener("click", backToMain);
    el.querySelectorAll("[data-goal]").forEach((input) => input.addEventListener("input", () => dirty()));
    el.querySelector("[data-add-goal]")?.addEventListener("click", () => {
      readGoals();
      state.edit.goals.push("");
      dirty();
      render();
      const inputs = root().querySelectorAll("[data-goal]");
      inputs[inputs.length - 1]?.focus();
    });
    el.querySelectorAll("[data-del-goal]").forEach((btn) =>
      btn.addEventListener("click", () => {
        readGoals();
        state.edit.goals.splice(Number(btn.dataset.delGoal), 1);
        dirty();
        render();
      })
    );
    el.querySelectorAll("[data-del-lesson]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const lesson = state.edit.lessons[Number(btn.dataset.delLesson)];
        if (lesson?.sentAt && !confirm("השיעור כבר נשלח לתלמידים.\nבשמירה הוא יוסר גם אצל מי שעוד לא התחיל אותו. להסיר?")) return;
        readGoals();
        state.edit.lessons.splice(Number(btn.dataset.delLesson), 1);
        dirty();
        render();
      })
    );
    el.querySelector("[data-pick]")?.addEventListener("click", openPick);
    el.querySelector("[data-save]")?.addEventListener("click", () => saveDay(false));
    el.querySelector("[data-save-send]")?.addEventListener("click", () => saveDay(true));

    // Picking a lesson.
    el.querySelector("[data-back-day]")?.addEventListener("click", () => {
      state.pane = "day";
      render();
    });
    el.querySelectorAll('input[name="dyArea"]').forEach((input) =>
      input.addEventListener("change", () => {
        state.area = input.value;
        state.query = "";
        render();
      })
    );
    el.querySelector("[data-search]")?.addEventListener("input", (e) => {
      state.query = e.target.value;
      const list = root().querySelector("#dyPickList");
      list.innerHTML = pickListHtml();
      bindPickLessons(list);
    });
    bindPickLessons(el);
  }

  function bindPickLessons(el) {
    el.querySelectorAll("[data-pick-lesson]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const id = btn.dataset.pickLesson;
        if (state.edit.lessons.some((l) => l.lessonId === id)) return;
        if (state.edit.lessons.length >= MAX_LESSONS) {
          room().toast(`אפשר עד ${MAX_LESSONS} שיעורים ביום`);
          return;
        }
        const mine = btn.dataset.area === MINE;
        const info = mine ? null : state.index.get(id);
        const own = mine ? (room().myLessons() || []).find((l) => `my-${l.id}` === id) : null;
        state.edit.lessons.push({
          lessonId: id,
          name: mine ? own?.title || "השיעור שלי" : info?.name || btn.textContent.trim(),
          topicTitle: mine ? "השיעורים שלי" : info?.topicTitle || "",
          areaTitle: mine ? "השיעורים שלי" : info?.areaTitle || "",
          area: mine ? MINE : btn.dataset.area,
        });
        dirty();
        state.pane = "day";
        render();
        room().toast("השיעור נוסף ליום");
      })
    );
  }

  window.RoomDiary = {
    html: () => `<div class="dy" id="roomDiary"><p class="dy-loading">טוענים את היומן…</p></div>`,
    // The dialog opened (or opened again) on the diary: the main view.
    bind(dlg) {
      dialog = dlg;
      state.pane = "";
      state.edit = null;
      if (state.loaded) {
        render();
        return;
      }
      loading ||= loadDiary().catch((err) => {
        loading = null;
        throw err;
      });
      loading.then(render, (err) => {
        const el = root();
        if (el) el.innerHTML = `<p class="dy-loading">${esc(err.message || "לא הצלחנו לטעון את היומן")}</p>`;
      });
      // The names of the lessons in the picker, ready by the time it opens.
      loadCatalog().catch(() => {});
    },
    // The room's lists loaded again (students, classes): the main view
    // redraws with them; a day being edited stays as it is.
    refresh() {
      if (dialog?.open && dialog.dataset.box === "diary" && !state.pane && state.loaded) render();
    },
  };
})();
