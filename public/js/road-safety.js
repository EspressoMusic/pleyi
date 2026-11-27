/* זהירות בדרכים (/road-safety) — the road-safety mini site inside Pleyi.
   - Lessons: the "road" lessons of subject-lessons.js, opened in the shared
     lesson player (ready-lessons.js).
   - Exercises: the "road-safety" area of subject-practice.js, run by
     english-learning.js in #engMain (its path, topic pages and runner).
   - Games: the four games below, each on a fixed screen over the page.
   The home page (title, מי אנחנו, צור קשר), the lessons library, the games
   and the exercises are each a page of their own: #lessons, #games,
   #practice (showPage). Boys' names only, no pictures of girls. */
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const fig = (kind, opts = {}) => window.LESSON_FIGURES?.[kind]?.(opts) || "";
  const shuffle = (list) => {
    const a = [...list];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const ICONS = {
    info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M12 11v6"/><circle cx="12" cy="7.4" r="0.9" fill="currentColor"/></svg>`,
    // Just the "i", for a round button (no circle in a circle).
    infoMark: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="5.5" r="1.4" fill="currentColor" stroke-width="1.6"/><path d="M12 11v8.5"/></svg>`,
    // A turning arrow: the flipped lesson tile's "turn back".
    turnBack: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 3.5V9h5.5"/></svg>`,
    heart: (full) =>
      `<svg class="rs-heart${full ? "" : " is-empty"}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.2 3 4.5 6.6 4.5c2.1 0 3.6 1.2 5.4 3.2 1.8-2 3.3-3.2 5.4-3.2 3.6 0 5.7 3.7 4.2 7.2C19.5 16.4 12 21 12 21Z" stroke="#000" stroke-width="3" stroke-linejoin="round"/></svg>`,
    star: (on) =>
      `<svg class="rs-star${on ? " is-on" : ""}" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.6 2.9 6 6.5.8-4.8 4.5 1.2 6.5L12 17.3l-5.8 3.1 1.2-6.5-4.8-4.5 6.5-.8z" stroke="#000" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
    // Points right; english-learning.css flips it to point on in RTL.
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>`,
    cross: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>`,
    // The exercises' back arrow (points right: "back" in RTL).
    back: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
    // The table of contents' head and chevron, as on the English page.
    toc: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6h12M9 12h12M9 18h12"/><circle cx="4" cy="6" r="1.2" fill="currentColor"/><circle cx="4" cy="12" r="1.2" fill="currentColor"/><circle cx="4" cy="18" r="1.2" fill="currentColor"/></svg>`,
    chevron: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>`,
    car: `<svg viewBox="0 0 120 60" aria-hidden="true"><rect x="4" y="6" width="112" height="48" rx="16" fill="#ff3b5c" stroke="#000" stroke-width="5"/><rect x="70" y="13" width="22" height="34" rx="6" fill="#b3e5fc" stroke="#000" stroke-width="4"/><rect x="22" y="15" width="16" height="30" rx="5" fill="#b3e5fc" stroke="#000" stroke-width="4"/><circle cx="110" cy="17" r="5" fill="#fff59d" stroke="#000" stroke-width="2.5"/><circle cx="110" cy="43" r="5" fill="#fff59d" stroke="#000" stroke-width="2.5"/></svg>`,
  };

  /* ── Pages: the home page, and the lessons library, the games, the
     exercises and מה חדש, each on its own address (#lessons, #games,
     #practice, #news; מה חדש is road-news.js's). Any
     other address is the exercises engine's (a topic or an exercise).
     html[data-rs-page] shows the page's parts (road-safety.css); a script in
     the page's <head> sets it before the first paint. ── */

  const PAGES = ["lessons", "games", "practice", "news"];

  function pageOf() {
    const hash = decodeURIComponent(location.hash.replace(/^#/, ""));
    if (!hash) return "home";
    return PAGES.includes(hash) ? hash : "engine";
  }

  function showPage() {
    const page = pageOf();
    document.documentElement.dataset.rsPage = page;
    // An exercise topic belongs to the exercises page.
    const current = page === "engine" ? "practice" : page;
    $$("[data-rs-page]").forEach((link) => {
      if (link.dataset.rsPage === current) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  // The bar's back arrow: from a topic up to the exercises page, and from
  // the lessons, games or exercises page to this site's home page (the
  // engine points them at its topics and at the Pleyi site).
  function barBack(e) {
    const back = e.target.closest("#engBarBack .eng-back");
    if (!back) return false;
    const page = pageOf();
    if (page === "engine" && back.getAttribute("href") === "#") {
      e.preventDefault();
      location.hash = "practice";
      return true;
    }
    if (PAGES.includes(page)) {
      e.preventDefault();
      location.hash = "";
      return true;
    }
    return false;
  }

  /* ── The title: the Pleyi home title's outlined letters, lit like the
     pedestrian light beside it: the top word red, the bottom word green,
     each lit while its lamp is on and flashing with it (runHeroLight gives
     the title the light's data-on; road-safety.css). The letters come on
     one by one when the page opens ── */

  function splitTitle() {
    const title = $("#rsTitle");
    if (!title) return;
    const text = title.textContent.trim();
    title.setAttribute("aria-label", text);
    let i = 0;
    const letter = (ch) => `<span class="rs-ch" style="--ch-delay:${(i++ * 0.14).toFixed(2)}s">${esc(ch)}</span>`;
    title.innerHTML = text
      .split(/\s+/)
      .map((word, w) => `<span class="rs-word rs-word--${w ? "green" : "red"}" aria-hidden="true">${[...word].map(letter).join("")}</span>`)
      .join(" ");
  }

  /* ── The site's mascot: the Pleyi fox (or the animal picked in "נראות"),
     drawn by site-fox.js and perched on the title's first letter as on the
     Pleyi home page. It blinks and hops when tapped ── */

  const motionOff = () =>
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.visual === "minimal";

  function buddyHop(buddy) {
    if (motionOff()) return;
    buddy.classList.remove("is-hop");
    void buddy.offsetWidth;
    buddy.classList.add("is-hop", "is-landed");
  }

  function addBuddy() {
    const title = $("#rsTitle");
    const word = title && $(".rs-word", title);
    if (!word || !window.PleyiFox) return;
    const buddy = document.createElement("span");
    buddy.className = "rs-buddy";
    buddy.innerHTML = `<span class="rs-buddy-fig">${window.PleyiFox.draw()}</span>`;
    word.append(buddy);
    const body = $(".rs-buddy-fig", buddy);
    body.addEventListener("animationend", (e) => {
      if (e.animationName === "rs-buddy-hop") buddy.classList.remove("is-hop");
      if (e.animationName === "rs-buddy-land") buddy.classList.add("is-landed");
    });
    buddy.addEventListener("click", () => buddyHop(buddy));
  }

  function setLights(svg, on) {
    svg.dataset.on = on;
  }

  /* ── Lessons: the library, in the exercises' path stages, each lesson a
     numbered square tile like the English page's topics ── */

  const LESSONS = () => (window.SUBJECT_SHORT_LESSONS || []).filter((l) => l.subject === "road");

  // The back of a lesson tile: the lesson in two short lines.
  const LESSON_BRIEF = {
    "road-street": ["מדרכה – להולכי רגל", "כביש – למכוניות"],
    "road-body": ["הגוף שלנו תופס מקום", "נשארים רחוק מהכביש"],
    "road-moves": ["ליד הכביש – בזהירות", "מסובבים את כל הראש"],
    "road-stop": ["עוצרים בשפת המדרכה", "מכונית לא עוצרת מיד"],
    "road-walk": ["הולכים על המדרכה", "ביד של מבוגר"],
    "road-park": ["רכב נוסע גם אחורה", "לא משחקים ליד רכב"],
    "road-cross": ["חוצים במעבר חצייה", "שמאלה, ימינה ושוב שמאלה"],
    "road-lights": ["באדום – מחכים", "בירוק – מסתכלים וחוצים"],
    "road-group": ["בטיול הולכים בטור", "חוצים רק כשהמורה אומר"],
    "road-school": ["דרך בטוחה לבית הספר", "יוצאים בזמן"],
    "road-signs": ["תמרור אומר מה לעשות", "משולש, עיגול ומרובע"],
    "road-signs2": ["שלושה סוגי תמרורים", "אזהרה, הוריה ומודיעין"],
    "road-marks": ["סימונים על הכביש", "אדום-לבן – אסור לעצור"],
    "road-see": ["רואים את המכוניות", "והנהג רואה אותנו"],
    "road-rail": ["חוצים כשהמחסום למעלה", "רכבת לא עוצרת מהר"],
    "road-car": ["ברכב חוגרים תמיד", "יוצאים לצד המדרכה"],
    "road-shuttle": ["בהסעה – חוגרים", "לא רצים לאוטובוס"],
    "road-bike": ["רוכבים תמיד עם קסדה", "במעבר חצייה – יורדים"],
    "road-ride": ["רוכבים בשביל אופניים", "לפני פנייה מסמנים ביד"],
    "road-electric": ["חשמליים – רק מגיל 16", "עם קסדה, לא על המדרכה"],
    "road-city": ["יש כמה סוגי דרכים", "בכל דרך – סכנה אחרת"],
    "road-busy": ["בעיר הצפופה יש סכנות", "מכירים אותן ונזהרים"],
    "road-free": ["אין מעבר חצייה?", "בוחרים מקום שרואים רחוק"],
    "road-why": ["למה המעבר דווקא כאן?", "גם שם עוצרים ומסתכלים"],
    "road-wide": ["בכביש רחב – כמה נתיבים", "בודקים כל נתיב"],
    "road-junction": ["בצומת מכוניות גם פונות", "גם בירוק – מסתכלים"],
    "road-route": ["קצר זה לא תמיד בטוח", "מתכננים עם מבוגר"],
    "road-speed": ["מכונית לא עוצרת מיד", "לא חוצים מול מכונית"],
    "road-focus": ["בדרך – בלי טלפון", "ובלי אוזניות"],
    "road-choice": ["אנחנו אחראים על עצמנו", "מותר לסרב לדבר מסוכן"],
    "road-help": ["ראינו תאונה – לא רצים", "קוראים למבוגר"],
    "road-winter": ["בגשם הכביש חלק", "מכונית עוצרת לאט יותר"],
    "road-holiday": ["בחגים יוצאים יותר", "ונזהרים יותר"],
  };

  // A lesson without a brief: the summary's first sentence.
  const lessonBrief = (lesson) =>
    LESSON_BRIEF[lesson.id] || [String(lesson.summary || "").split(/(?<=[.!?])\s+/)[0]].filter(Boolean);

  // The whole tile opens the lesson ("פתיחה" stretches over it, road-safety.css);
  // the "i" in the corner flips the tile to its back: the lesson in short.
  function lessonTile(lesson, num) {
    return `
      <article class="eng-topic-card">
        <div class="eng-topic-tile has-num rs-lesson-tile">
          <span class="eng-path-num" aria-hidden="true">${num}</span>
          <span class="eng-topic-title">${esc(lesson.name)}</span>
          <span class="rs-lesson-back" aria-hidden="true"><span class="rs-lesson-back-text">${lessonBrief(lesson).map((line) => `<span>${esc(line)}</span>`).join("")}</span></span>
          <span class="rs-lesson-actions">
            <button type="button" class="rs-info-btn rs-lesson-info" data-rs-lesson-info="${esc(lesson.id)}" aria-pressed="false" aria-label="${esc(`בקצרה על השיעור ${lesson.name}`)}" title="בקצרה">${ICONS.infoMark}</button>
            <button type="button" class="font-cartoon eng-topic-open rs-lesson-open" data-rs-lesson="${esc(lesson.id)}" aria-label="${esc(`שיעור ${num} – ${lesson.name}`)}">פתיחה</button>
          </span>
        </div>
      </article>`;
  }

  // The back's lines sit between the "i" and "פתיחה", as big as fit there.
  function fitLessonBack(tile) {
    const back = tile.querySelector(".rs-lesson-back");
    const text = back?.firstElementChild;
    const actions = tile.querySelector(".rs-lesson-actions");
    if (!text || !actions) return;
    back.style.bottom = `${tile.clientHeight - actions.offsetTop + 6}px`;
    text.style.fontSize = "";
    let size = parseFloat(getComputedStyle(text).fontSize);
    while (text.offsetHeight > back.clientHeight && size > 13) {
      size -= 1;
      text.style.fontSize = `${size}px`;
    }
  }

  // The "i": the tile turns over (half a turn, swap the faces, half a turn
  // back); pressed again, it turns back to the front.
  function flipLessonTile(btn) {
    const tile = btn.closest(".rs-lesson-tile");
    const card = tile?.closest(".eng-topic-card");
    if (!card || card.dataset.flipping) return;
    const flipped = !tile.classList.contains("is-flipped");
    const name = tile.querySelector(".eng-topic-title")?.textContent || "";
    const swap = () => {
      tile.classList.toggle("is-flipped", flipped);
      tile.querySelector(".rs-lesson-back")?.setAttribute("aria-hidden", flipped ? "false" : "true");
      btn.setAttribute("aria-pressed", flipped ? "true" : "false");
      btn.setAttribute("aria-label", flipped ? `חזרה לכרטיס ${name}` : `בקצרה על השיעור ${name}`);
      btn.title = flipped ? "חזרה" : "בקצרה";
      btn.innerHTML = flipped ? ICONS.turnBack : ICONS.infoMark;
      if (flipped) fitLessonBack(tile);
    };
    if (!card.animate || matchMedia("(prefers-reduced-motion: reduce)").matches) return swap();
    card.dataset.flipping = "1";
    const turn = (from, to, easing) =>
      card.animate(
        [{ transform: `perspective(900px) rotateY(${from}deg)` }, { transform: `perspective(900px) rotateY(${to}deg)` }],
        { duration: 180, easing, fill: "forwards" }
      );
    const first = turn(0, 90, "ease-in");
    first.finished
      .then(() => {
        swap();
        const second = turn(-90, 0, "ease-out");
        first.cancel();
        return second.finished.then(() => second.cancel());
      })
      .catch(() => swap())
      .finally(() => delete card.dataset.flipping);
  }

  // The table of contents under the title, as on the English page: each stage
  // opens to its numbered lessons, and a lesson starts right away.
  function lessonTocHtml(stages) {
    const row = ({ lesson, num }) => `
      <li><button type="button" class="eng-toc-topic-link rs-toc-lesson" data-rs-lesson="${esc(lesson.id)}"><span class="eng-toc-num">${num}</span><span>${esc(lesson.name)}</span></button></li>`;
    return `
      <details class="eng-toc" id="rsToc">
        <summary class="eng-toc-head">${ICONS.toc}<span>תוכן עניינים</span><span class="eng-toc-chevron">${ICONS.chevron}</span></summary>
        <div class="eng-toc-body">
          ${stages.map((s) => `
            <details class="eng-toc-stage" name="rs-toc-stage">
              <summary class="eng-toc-stage-head">${s.title ? `<span class="eng-path-stage-num">שלב ${s.stageNum}</span>` : ""}<span class="eng-toc-stage-title">${esc(s.title || "עוד שיעורים")}</span><span class="eng-toc-chevron">${ICONS.chevron}</span></summary>
              <ol class="eng-toc-topics">${s.lessons.map(row).join("")}</ol>
            </details>`).join("")}
        </div>
      </details>`;
  }

  function renderLessons() {
    const list = $("#rsLessonList");
    if (!list) return;
    const lessons = LESSONS();
    // A stage's tiles share one color by how hard it is, as on the exercises'
    // path (english-learning.js): green first, red and gray last.
    const path = window.LEARN_SUBJECT?.path || [];
    const graded = path.filter((stage) => stage.level == null);
    const level = (stage) =>
      stage.level ?? (graded.length > 1 ? Math.round((graded.indexOf(stage) * 7) / (graded.length - 1)) : 0);
    const stages = path.map((stage) => ({
      title: stage.title,
      level: level(stage),
      lessons: lessons.filter((l) => stage.topics.includes(l.topic)),
    }));
    // A lesson outside the stages still shows, at the end.
    const rest = lessons.filter((l) => !stages.some((s) => s.lessons.includes(l)));
    if (rest.length) stages.push({ title: "", lessons: rest });
    // Numbered over the whole path.
    let num = 0;
    const numbered = stages
      .filter((s) => s.lessons.length)
      .map((s, i) => ({ ...s, stageNum: i + 1, lessons: s.lessons.map((l) => ({ lesson: l, num: ++num })) }));
    list.innerHTML =
      lessonTocHtml(numbered) +
      numbered
        .map(
          (s) => `
        <div class="eng-topic-group eng-path-stage"${s.level != null ? ` data-level="${s.level}"` : ""}>
          ${s.title ? `<h3 class="eng-group-title eng-path-title"><span class="eng-path-stage-num">שלב ${s.stageNum}</span>${esc(s.title)}</h3>` : ""}
          <div class="eng-topic-grid">${s.lessons.map(({ lesson, num }) => lessonTile(lesson, num)).join("")}</div>
        </div>`
        )
        .join("");
  }

  function openLesson(id) {
    const lesson = LESSONS().find((l) => l.id === id);
    if (!lesson) return;
    window.StudentProgress?.record({ kind: "lesson", topicId: lesson.topic, topicTitle: lesson.name, itemId: id, itemTitle: lesson.name });
    if (window.ReadyLessons?.openLesson) window.ReadyLessons.openLesson(id);
    else location.href = `/services/ready-lessons?lesson=${encodeURIComponent(id)}`;
  }

  /* ── A game's "i" dialog ── */

  let infoGo = null;
  function openInfo(title, lines, goLabel, onGo) {
    $("#rsInfoTitle").textContent = title;
    $("#rsInfoLines").innerHTML = lines.map((line) => `<li>${esc(line)}</li>`).join("");
    $("#rsInfoGo").textContent = goLabel;
    infoGo = onGo;
    $("#rsInfoModal").classList.remove("hidden");
    $("#rsInfoGo").focus();
  }
  function closeInfo() {
    $("#rsInfoModal")?.classList.add("hidden");
    infoGo = null;
  }

  /* ── Games ── */

  const BEST_KEY = "pleyi-road-best";
  function readBest() {
    try {
      return JSON.parse(localStorage.getItem(BEST_KEY) || "{}") || {};
    } catch {
      return {};
    }
  }
  function saveBest(id, stars) {
    const best = readBest();
    if ((best[id] || 0) >= stars) return;
    best[id] = stars;
    try {
      localStorage.setItem(BEST_KEY, JSON.stringify(best));
    } catch {
      /* private window: the best score just isn't kept */
    }
  }

  // A line under the game's board: what happened, in color.
  function say(el, text, kind = "") {
    if (!el) return;
    el.textContent = text;
    el.className = `rs-feedback${kind ? ` is-${kind}` : ""}`;
  }

  const SAFE_ART = `<svg viewBox="0 0 220 150" aria-hidden="true"><rect x="10" y="20" width="92" height="110" rx="18" fill="#9ff0b5" stroke="#000" stroke-width="5"/><path d="m32 76 16 16 34-36" fill="none" stroke="#000" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><rect x="118" y="20" width="92" height="110" rx="18" fill="#ff9a9a" stroke="#000" stroke-width="5"/><path d="M144 50l40 50M184 50l-40 50" stroke="#000" stroke-width="10" stroke-linecap="round"/></svg>`;

  const GAMES = [
    // On the PAT game's city (road-city.js, road-cases.js).
    {
      id: "cases",
      title: "תקין או לא תקין?",
      art: () => window.RsCases.art(),
      how: ["צופים במה שקורה בכביש", "התמונה עוצרת – ובוחרים: תקין או לא תקין", "אפשר לצפות שוב לפני שעונים", "8 מקרים בכל משחק"],
      ready: () => !!window.RsCases,
      start: (stage, ui) => window.RsCases.start(stage, ui, { icons: ICONS, say }),
    },
    {
      id: "light",
      title: "חוצים בירוק",
      art: () => fig("plight", { on: "green" }),
      how: ["מחכים לאיש הירוק – ואז לוחצים „חוצים!”", "באדום – לא לוחצים", "מכונית לא עצרה? מחכים שתעבור", "8 חציות בבטחה – וניצחתם"],
      start: lightGame,
    },
    {
      id: "memory",
      title: "זיכרון תמרורים",
      art: () => fig("signs", { ks: ["stop", "crosswalk"] }),
      how: ["הופכים שני קלפים", "מוצאים כל תמרור ואת השם שלו", "כמה שפחות תורות – יותר כוכבים"],
      start: memoryGame,
    },
    // The sign quizzes: all the signs of SIGNS, ten a game.
    {
      id: "signname",
      title: "מה אומר התמרור?",
      art: () => fig("signs", { ks: ["giveway", "noparking"] }),
      how: ["רואים תמרור", "ובוחרים מה הוא אומר", "יש תמרורים שנראים כמעט אותו דבר – מסתכלים טוב", "10 תמרורים בכל משחק"],
      soft: true,
      start: (stage, ui) => signQuiz(stage, ui, "name"),
    },
    {
      id: "signpick",
      title: "איזה תמרור?",
      art: () => fig("signs", { ks: ["bike", "nobikes"] }),
      how: ["קוראים את שם התמרור", "ולוחצים על התמרור הנכון מתוך ארבעה", "10 תמרורים בכל משחק"],
      soft: true,
      start: (stage, ui) => signQuiz(stage, ui, "pick"),
    },
    {
      id: "safe",
      title: "בטוח או מסוכן?",
      art: () => SAFE_ART,
      how: ["קוראים מה הילד עושה", "ובוחרים: בטוח או מסוכן", "10 שאלות בכל משחק"],
      soft: true,
      start: safeGame,
    },
    {
      id: "order",
      title: "מה קודם?",
      art: () => fig("crossing", { k: "look" }),
      how: ["לוחצים על השלבים לפי הסדר", "מה עושים קודם – ומה אחר כך", "5 מצבים בדרך"],
      soft: true,
      start: orderGame,
    },
    // The picture games (road-scenes.js): their cards show once they have a picture.
    {
      id: "find",
      title: "מצאו בתמונה",
      art: () => sceneArt("find"),
      how: ["מחפשים בתמונה את הדברים שברשימה", "לוחצים על כל דבר שמוצאים", "אפשר להגדיל את התמונה עם +", "תקועים? „רמז” מראה איפה – אבל עולה כוכב"],
      ready: () => SCENES("find").length > 0,
      start: findGame,
    },
    {
      id: "wrong",
      title: "מה לא בסדר?",
      art: () => sceneArt("wrong"),
      how: ["מחפשים בתמונה מה מסוכן", "לוחצים על כל דבר שלא בסדר", "ולומדים מה צריך לעשות במקום", "אפשר להגדיל את התמונה עם +"],
      ready: () => SCENES("wrong").length > 0,
      start: wrongGame,
    },
  ];

  // The games that can be played now (the picture games wait for theirs);
  // מה חדש (road-news.js) announces a new one by itself.
  const readyGames = () => GAMES.filter((g) => !g.ready || g.ready());
  window.RsGames = readyGames;

  function renderGames() {
    const list = $("#rsGameList");
    if (!list) return;
    list.innerHTML = readyGames().map(
      (g) => `
      <div class="rs-card rs-game-card rs-game-card--${g.id} rs-asphalt rs-asphalt--soft">
        <button type="button" class="rs-card-art" data-rs-game="${g.id}" aria-label="${esc(g.title)}">${g.art()}</button>
        <h3 class="rs-card-title">${esc(g.title)}</h3>
        <div class="rs-card-actions">
          <button type="button" class="btn btn-primary btn-candy font-cartoon rs-open" data-rs-game="${g.id}">לשחק</button>
        </div>
      </div>`
    ).join("");
  }

  const shell = {
    game: null,
    stop: null,
    open(game) {
      this.close(false);
      this.game = game;
      window.PleyiStats?.hit("game", `road-${game.id}`, game.title);
      $("#rsGameTitle").textContent = game.title;
      // A question game (soft) looks like the exercises: their round back
      // arrow instead of the cross (road-safety.css, .rs-game.is-soft).
      $("#rsGame").classList.toggle("is-soft", !!game.soft);
      $("#rsGameClose").innerHTML = game.soft ? ICONS.back : ICONS.cross;
      $("#rsGameClose").setAttribute("aria-label", game.soft ? "חזרה למשחקים" : "סגירה");
      $("#rsGame").classList.remove("hidden");
      $("#rsGame").setAttribute("aria-hidden", "false");
      document.documentElement.classList.add("rs-game-open");
      this.run();
    },
    run() {
      // A fresh, empty stage: the games bind clicks on it, and the last
      // game's listeners must not stay on and answer too.
      const old = $("#rsGameStage");
      const stage = old.cloneNode(false);
      old.replaceWith(stage);
      $("#rsGameStatus").innerHTML = "";
      this.stop?.();
      this.stop = this.game.start(stage, {
        status: (html) => ($("#rsGameStatus").innerHTML = html),
        finish: (result) => this.results(result),
      });
    },
    // The end of a game: stars, the score and what to do next.
    results({ stars, score, text }) {
      this.stop?.();
      this.stop = null;
      saveBest(this.game.id, stars);
      $("#rsGameStatus").innerHTML = "";
      $("#rsGameStage").innerHTML = `
        <div class="rs-results">
          <div class="rs-stars" role="img" aria-label="${stars} כוכבים מתוך 3">${[1, 2, 3].map((n) => ICONS.star(n <= stars)).join("")}</div>
          <p class="rs-results-score font-cartoon">${esc(score)}</p>
          <p class="rs-results-text">${esc(text)}</p>
          <div class="rs-results-actions">
            <button type="button" class="btn btn-primary btn-candy font-cartoon" data-rs-again>עוד פעם</button>
            <button type="button" class="btn btn-candy font-cartoon rs-btn-soft" data-rs-close>למשחקים</button>
          </div>
        </div>`;
      $("#rsGameStage [data-rs-again]").focus();
    },
    close(restoreFocus = true) {
      if (!this.game) return;
      this.stop?.();
      this.stop = null;
      const id = this.game.id;
      this.game = null;
      $("#rsGame").classList.add("hidden");
      $("#rsGame").setAttribute("aria-hidden", "true");
      $("#rsGameStage").innerHTML = "";
      document.documentElement.classList.remove("rs-game-open");
      if (restoreFocus) $(`.rs-open[data-rs-game="${id}"]`)?.focus();
    },
  };

  /* חוצים בירוק — the pedestrians' light goes red, green, flashing green.
     Press "חוצים!" on a steady green only, and not while a car that didn't
     stop is still passing. */
  function lightGame(stage, ui) {
    const GOAL = 8;
    let hearts = 3;
    let crossed = 0;
    let mistakes = 0;
    let rounds = 0;
    let phase = "red";
    let carOn = false;
    let busy = false;
    const timers = new Set();
    const later = (fn, ms) => {
      const t = setTimeout(() => {
        timers.delete(t);
        fn();
      }, ms);
      timers.add(t);
    };
    const clearAll = () => {
      timers.forEach(clearTimeout);
      timers.clear();
    };

    // The street on the map's grass: the hero's light beside a long crossing.
    stage.innerHTML = `
      <div class="rs-lg">
        <div class="rs-lg-scene">
          <div class="rs-lg-light" id="rsLgLight">${heroLight("rsLgTl")}</div>
          <div class="rs-lg-road" id="rsLgRoad"><span class="rs-lg-zebra"></span><span class="rs-lg-car" id="rsLgCar">${ICONS.car}</span></div>
        </div>
        <p class="rs-feedback" id="rsLgMsg" aria-live="polite">מחכים לאיש הירוק</p>
        <div class="rs-lg-dots" id="rsLgDots" aria-hidden="true"></div>
        <button type="button" class="btn btn-candy font-cartoon rs-go-btn" id="rsLgGo">חוצים!</button>
      </div>`;
    const light = $("#rsLgLight", stage);
    const msg = $("#rsLgMsg", stage);
    const car = $("#rsLgCar", stage);
    const road = $("#rsLgRoad", stage);
    const draw = (on) => setLights(light.firstElementChild, on);

    function status() {
      ui.status(`<span class="rs-hearts" role="img" aria-label="${hearts} לבבות">${[1, 2, 3].map((n) => ICONS.heart(n <= hearts)).join("")}</span><span class="rs-chip">${crossed}/${GOAL}</span>`);
      $("#rsLgDots", stage).innerHTML = Array.from({ length: GOAL }, (_, i) => `<span class="${i < crossed ? "is-done" : ""}"></span>`).join("");
    }

    function setPhase(p) {
      clearAll();
      phase = p;
      if (p === "red") {
        carOn = false;
        draw("red");
        later(() => setPhase("green"), 1500 + Math.random() * 1800);
      } else if (p === "green") {
        draw("green");
        rounds++;
        // Sometimes a car doesn't stop: the green still means "look first".
        carOn = rounds > 1 && Math.random() < 0.35;
        if (carOn) {
          car.classList.remove("is-driving");
          void car.offsetWidth;
          car.classList.add("is-driving");
          later(() => (carOn = false), 1500);
        }
        // In Israel the walkers' green doesn't flash: it turns straight to red.
        later(() => setPhase("red"), 3600);
      }
    }

    function resume() {
      busy = false;
      road.classList.remove("is-safe", "is-bad");
      say(msg, "מחכים לאיש הירוק");
      setPhase("red");
    }

    function press() {
      if (busy) return;
      busy = true;
      clearAll();
      if (phase === "green" && !carOn) {
        crossed++;
        road.classList.add("is-safe");
        say(msg, "עברתם בבטחה!", "good");
        status();
        if (crossed >= GOAL) {
          later(() => ui.finish({ stars: Math.max(1, 3 - mistakes), score: `${crossed} חציות בבטחה`, text: mistakes ? "כל הכבוד! בפעם הבאה – אפילו בלי טעויות." : "מושלם! חציתם רק בירוק, ובלי אף טעות." }), 900);
        } else later(resume, 1000);
        return;
      }
      hearts--;
      mistakes++;
      road.classList.add("is-bad");
      const why = phase === "green" ? "מכונית לא עצרה – מחכים שתעבור" : "אדום – עומדים ומחכים";
      say(msg, why, "bad");
      status();
      if (hearts <= 0) {
        later(() => ui.finish({ stars: crossed >= 5 ? 1 : 0, score: `${crossed} חציות בבטחה`, text: "נגמרו הלבבות. נסו שוב – חוצים רק באיש ירוק." }), 1500);
      } else later(resume, 1600);
    }

    const goBtn = $("#rsLgGo", stage);
    goBtn.addEventListener("click", press);
    const onKey = (e) => {
      // The keyboard's space or Enter crosses too, unless a button has the focus.
      if ((e.key === " " || e.key === "Enter") && !document.activeElement?.closest?.("button, a")) {
        e.preventDefault();
        press();
      }
    };
    document.addEventListener("keydown", onKey);
    status();
    setPhase("red");
    goBtn.focus();
    return () => {
      clearAll();
      document.removeEventListener("keydown", onKey);
    };
  }

  /* The signs of the sign games (drawn by lesson-figures.js): the name, what
     the sign tells us, its family (the same shape and colors) and its twins
     (a sign that looks almost the same). A question's wrong answers are its
     twins and its family first, so none of them is a give-away. */
  const SIGNS = [
    { k: "stop", name: "עצור", says: "עוצרים לגמרי – ורק אז ממשיכים", fam: "first", twins: ["giveway"] },
    { k: "giveway", name: "תן זכות קדימה", says: "נותנים לאחרים לעבור קודם", fam: "first", twins: ["stop"] },
    { k: "railx", name: "מפגש עם מסילת רכבת", says: "כאן הכביש חוצה את פסי הרכבת", fam: "first", twins: [] },
    { k: "children", name: "זהירות, ילדים", says: "יש כאן הרבה ילדים – הנהגים נוסעים לאט", fam: "warn", twins: ["walkers"] },
    { k: "walkers", name: "מעבר חצייה לפניך", says: "עוד מעט יש מעבר חצייה – הנהגים מאטים", fam: "warn", twins: ["crosswalk", "children"] },
    { k: "roadworks", name: "עבודות בכביש", says: "עובדים בכביש – נוסעים לאט ובזהירות", fam: "warn", twins: [] },
    { k: "lightsahead", name: "רמזור לפניך", says: "עוד מעט יש רמזור – מתכוננים לעצור", fam: "warn", twins: [] },
    { k: "bump", name: "פס האטה", says: "יש בכביש פס האטה – המכוניות מאטות", fam: "warn", twins: [] },
    { k: "noentry", name: "אין כניסה", says: "אסור למכוניות להיכנס לרחוב הזה", fam: "no", twins: ["noparking"] },
    { k: "nowalk", name: "אסור להולכי רגל", says: "כאן אסור ללכת ברגל", fam: "no", twins: ["walkpath"] },
    { k: "nobikes", name: "אסור לרכוב על אופניים", says: "כאן לא רוכבים – הולכים ליד האופניים", fam: "no", twins: ["bike"] },
    { k: "speed30", name: "מהירות מרבית 30", says: "אסור לנסוע מהר יותר מ־30", fam: "no", twins: [] },
    { k: "noparking", name: "אסור להחנות", says: "כאן אסור להשאיר מכונית", fam: "no", twins: ["parking", "noentry"] },
    { k: "bike", name: "שביל אופניים", says: "השביל הזה לרוכבי אופניים", fam: "blue", twins: ["nobikes", "walkpath"] },
    { k: "walkpath", name: "שביל להולכי רגל", says: "השביל הזה רק להולכים ברגל", fam: "blue", twins: ["nowalk", "bike"] },
    { k: "roundabout", name: "כיכר", says: "נוסעים מסביב לכיכר", fam: "blue", twins: ["oneway"] },
    { k: "crosswalk", name: "מעבר חצייה", says: "כאן חוצים את הכביש", fam: "blue", twins: ["walkers"] },
    { k: "parking", name: "חניה", says: "כאן מותר להחנות", fam: "blue", twins: ["noparking"] },
    { k: "busstop", name: "תחנת אוטובוס", says: "כאן האוטובוס עוצר", fam: "blue", twins: ["parking"] },
    { k: "oneway", name: "רחוב חד־סטרי", says: "המכוניות נוסעות כאן רק לכיוון אחד", fam: "blue", twins: ["roundabout"] },
  ];
  const signOf = (k) => SIGNS.find((s) => s.k === k);

  // Three wrong answers for a sign: its twins, its family, then any.
  function signDecoys(sign) {
    const others = SIGNS.filter((s) => s !== sign);
    const pick = [...shuffle(sign.twins.map(signOf)), ...shuffle(others.filter((s) => s.fam === sign.fam)), ...shuffle(others)];
    return [...new Set(pick)].slice(0, 3);
  }

  /* זיכרון תמרורים — six of the signs and their names, face down. */
  const MEMORY_PAIRS = 6;

  function memoryGame(stage, ui) {
    const cards = shuffle(shuffle(SIGNS).slice(0, MEMORY_PAIRS).flatMap(({ k, name }) => [{ k, name, sign: true }, { k, name, sign: false }]));
    let open = [];
    let matched = 0;
    let moves = 0;
    let timer = 0;
    stage.innerHTML = `
      <div class="rs-mem">
        <p class="rs-feedback" id="rsMemMsg" aria-live="polite">מצאו כל תמרור ואת השם שלו</p>
        <div class="rs-mem-grid">${cards
          .map(
            (c, i) => `
          <button type="button" class="rs-mem-card" data-i="${i}" aria-label="קלף ${i + 1}">
            <span class="rs-mem-back" aria-hidden="true">?</span>
            <span class="rs-mem-face" aria-hidden="true">${c.sign ? fig("signs", { ks: [c.k] }) : `<span class="rs-mem-name">${esc(c.name)}</span>`}</span>
          </button>`
          )
          .join("")}</div>
      </div>`;
    const msg = $("#rsMemMsg", stage);
    const btn = (i) => $(`.rs-mem-card[data-i="${i}"]`, stage);
    const status = () => ui.status(`<span class="rs-chip">זוגות ${matched}/${MEMORY_PAIRS}</span><span class="rs-chip">תורות ${moves}</span>`);
    const show = (i, on) => {
      btn(i).classList.toggle("is-open", on);
      btn(i).setAttribute("aria-label", on ? (cards[i].sign ? `תמרור` : cards[i].name) : `קלף ${i + 1}`);
    };

    stage.addEventListener("click", (e) => {
      const b = e.target.closest(".rs-mem-card");
      if (!b || open.length >= 2) return;
      const i = Number(b.dataset.i);
      if (b.classList.contains("is-open") || b.classList.contains("is-matched")) return;
      show(i, true);
      open.push(i);
      if (open.length < 2) return;
      moves++;
      const [a, c] = open;
      if (cards[a].k === cards[c].k) {
        [a, c].forEach((j) => btn(j).classList.add("is-matched"));
        matched++;
        open = [];
        say(msg, `יופי! ${cards[a].name}`, "good");
        status();
        if (matched === MEMORY_PAIRS) {
          const stars = moves <= 9 ? 3 : moves <= 13 ? 2 : 1;
          timer = setTimeout(() => ui.finish({ stars, score: `${moves} תורות`, text: "מצאתם את כל התמרורים!" }), 900);
        }
        return;
      }
      status();
      say(msg, "לא זוג – נסו לזכור איפה הם", "bad");
      timer = setTimeout(() => {
        [a, c].forEach((j) => show(j, false));
        open = [];
      }, 1000);
    });
    status();
    return () => clearTimeout(timer);
  }

  /* מה אומר התמרור? (mode "name": a sign, and four names) and איזה תמרור?
     (mode "pick": a name, and four signs). Ten signs a game; the next game
     starts with the ten that weren't in the last one, so two games show
     them all. */
  const SIGN_ROUND = 10;

  function signRound(mode) {
    const key = `pleyi-road-signs-${mode}`;
    let last = [];
    try {
      last = JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
      /* no storage: any ten */
    }
    const fresh = SIGNS.filter((s) => !last.includes(s.k));
    const round = [...shuffle(fresh), ...shuffle(SIGNS.filter((s) => !fresh.includes(s)))].slice(0, SIGN_ROUND);
    try {
      localStorage.setItem(key, JSON.stringify(round.map((s) => s.k)));
    } catch {
      /* private window */
    }
    return shuffle(round);
  }

  function signQuiz(stage, ui, mode) {
    const items = signRound(mode);
    const signPic = (k) => fig("signs", { ks: [k] });
    let index = 0;
    let right = 0;
    let choices = [];
    let timer = 0;
    function show() {
      const sign = items[index];
      choices = shuffle([sign, ...signDecoys(sign)]);
      const answers =
        mode === "name"
          ? choices.map((s) => `<button type="button" class="eng-option" data-k="${s.k}">${esc(s.name)}</button>`).join("")
          : choices.map((s, i) => `<button type="button" class="eng-option rs-sq-pic" data-k="${s.k}" aria-label="${esc(`תמרור ${i + 1}`)}">${signPic(s.k)}</button>`).join("");
      stage.innerHTML = `
        <div class="rs-quiz rs-sq rs-sq--${mode}">
          ${quizHead(mode === "name" ? "בחרו את השם של התמרור." : "לחצו על התמרור הנכון.", SIGN_ROUND, index)}
          ${mode === "name" ? `<div class="rs-sq-sign">${signPic(sign.k)}</div>` : `<div class="eng-sentence"><p>${esc(sign.name)}</p></div>`}
          <div class="eng-options rs-sq-answers">${answers}</div>
          <div class="eng-feedback" id="rsSqMsg" aria-live="polite"></div>
        </div>`;
    }
    function next() {
      clearTimeout(timer);
      index++;
      if (index < SIGN_ROUND) return show();
      const stars = right >= 9 ? 3 : right >= 7 ? 2 : right >= 5 ? 1 : 0;
      ui.finish({ stars, score: `${right} מתוך ${SIGN_ROUND}`, text: right >= 9 ? "מעולה! אתם מכירים את התמרורים." : "כל הכבוד! שחקו שוב – ויבואו תמרורים אחרים." });
    }
    stage.addEventListener("click", (e) => {
      if (e.target.closest("[data-rs-next]")) return next();
      const b = e.target.closest(".eng-option");
      if (!b || b.disabled) return;
      const sign = items[index];
      const chosen = signOf(b.dataset.k);
      const ok = chosen === sign;
      if (ok) right++;
      $$(".eng-option", stage).forEach((x) => {
        x.disabled = true;
        if (x.dataset.k === sign.k) x.classList.add("is-right");
      });
      if (!ok) b.classList.add("is-wrong");
      const msg = $("#rsSqMsg", stage);
      // A wrong sign picked: what that sign says, so it's learned too.
      const shown = ok || mode === "name" ? sign : chosen;
      quizSay(msg, ok, ok ? `נכון! ${sign.says}` : `זה „${shown.name}” – ${shown.says}`);
      if (ok) {
        timer = setTimeout(next, 1800);
        return;
      }
      msg.insertAdjacentHTML("beforeend", `<button type="button" class="btn btn-primary btn-candy font-cartoon eng-next" data-rs-next>${index === SIGN_ROUND - 1 ? "לתוצאות" : "הבא"}</button>`);
      $("[data-rs-next]", msg).focus({ preventScroll: true });
    });
    show();
    return () => clearTimeout(timer);
  }

  /* בטוח או מסוכן? — ten things boys do on the way; safe or dangerous.
     None of them plain (the sidewalk, a helmet): each has a catch — the
     green light with an ambulance coming, the helmet on an electric bike,
     the belt under the arm. */
  const SAFE_BANK = [
    ["האיש ירוק, אבל אמבולנס עם סירנה מתקרב – דני מחכה שיעבור", true, "לאמבולנס נותנים לעבור, גם באיש ירוק"],
    ["יוסי התחיל לחצות בירוק, ובאמצע האור התחיל להבהב – הוא ממשיך בהליכה לצד השני", true, "באמצע הכביש לא חוזרים אחורה"],
    ["רון חוצה במעבר חצייה, ובאמצע הוא חוזר אחורה כי האור התחיל להבהב", false, "באמצע הכביש ממשיכים לצד השני – לא חוזרים"],
    ["הכביש ריק לגמרי, ובכל זאת משה מחכה לאיש הירוק", true, "באדום מחכים – גם כשהכביש נראה ריק"],
    ["הכביש ריק, אז תומר חוצה באדום", false, "מכונית יכולה להגיע מהר מעבר לפינה"],
    ["האיש ירוק, ועידו מתחיל לחצות מיד בלי להסתכל", false, "גם בירוק מסתכלים – לפעמים נהג לא עוצר"],
    ["איתי מחכה לירוק כשהוא עומד על הכביש, צעד אחרי שפת המדרכה", false, "מחכים על המדרכה, לא על הכביש"],
    ["מכונית עצרה לאבי במעבר החצייה, ולפני שהוא ממשיך הוא בודק גם את הנתיב השני", true, "מכונית אחת עצרה – לא כולן"],
    ["מכונית אחת עצרה לרון, והוא רץ מהר לצד השני", false, "בנתיב השני אולי מגיעה מכונית, ובריצה אפשר ליפול"],
    ["מכונית עצרה לפני מעבר החצייה, אבל הנהג מסתכל בטלפון – דני מחכה שהנהג יראה אותו", true, "חוצים רק כשבטוחים שהנהג ראה אותנו"],
    ["אבי חוצה צמוד לאיש מבוגר, ולא מסתכל בעצמו", false, "כל אחד מסתכל בעצמו לפני שחוצה"],
    ["תומר יורד מהאופניים לפני מעבר החצייה, ומוביל אותם ביד", true, "במעבר חצייה הולכים, לא רוכבים"],
    ["יוסי חוצה במעבר חצייה כשהוא רוכב על האופניים, עם קסדה", false, "במעבר חצייה יורדים מהאופניים – גם עם קסדה"],
    ["אבי בן 10 רוכב על אופניים חשמליים, עם קסדה", false, "אופניים חשמליים – רק מגיל 16"],
    ["עידו רוכב על אופניים בערב עם קסדה, אבל בלי פנס", false, "בחושך צריך פנס לבן מקדימה ואדום מאחור"],
    ["עידו ירד מההסעה, חיכה שהיא תיסע, ורק אז הלך למעבר החצייה", true, "כשההסעה עומדת היא מסתירה את הכביש"],
    ["משה ירד מהאוטובוס וחוצה מיד מאחוריו", false, "האוטובוס מסתיר אותו מהמכוניות – מחכים שייסע"],
    ["יוסי מחכה לאוטובוס על שפת המדרכה, כדי להיות ראשון בתור", false, "מחכים רחוק משפת הכביש"],
    ["איתי חוגר את החגורה מתחת ליד, ולא על הכתף", false, "החגורה עוברת על הכתף ועל הירכיים"],
    ["איתי חוגר חגורה גם כשהנסיעה היא רק עד סוף הרחוב", true, "חוגרים בכל נסיעה, גם קצרה"],
    ["אבי יוצא מהרכב מהדלת של המדרכה, גם כשצריך לזחול על המושב", true, "בצד של הכביש נוסעות מכוניות"],
    ["דני יוצא מהרכב מהדלת של הכביש, כי היא קרובה אליו", false, "יוצאים רק מהדלת של המדרכה"],
    ["משה מוריד אוזנייה אחת, ושומע מוזיקה רק באוזן השנייה כשהוא חוצה", false, "חוצים בלי אוזניות בכלל – שומעים את כל המכוניות"],
    ["יוסי לובש אפוד זוהר כשהוא הולך בערב, גם כשיש פנסי רחוב", true, "האפוד זוהר באורות של המכוניות"],
    ["אין מדרכה, ורון הולך בצד שמאל של הכביש, מול המכוניות", true, "כך הוא רואה את המכוניות שבאות"],
    ["אין מדרכה, ותומר הולך בצד ימין, עם הגב למכוניות", false, "הולכים בצד שמאל – מול המכוניות"],
    ["רון חוצה בקו ישר, ולא באלכסון דרך הצומת", true, "בקו ישר הדרך הכי קצרה"],
    ["החבר של תומר קורא לו מהצד השני של הכביש, ותומר רץ אליו", false, "עוצרים, מסתכלים, וחוצים רק במעבר חצייה"],
    ["הכדור של דני התגלגל לכביש – הוא מסתכל ימינה ושמאלה ורץ להביא אותו", false, "לא רצים אחרי כדור – קוראים למבוגר"],
    ["יוסי חוצה בין שתי מכוניות חונות, כי משם קרוב יותר", false, "שם הנהגים לא רואים אותו"],
  ];

  /* The question games (soft: בטוח או מסוכן?, מה קודם?) look like the
     exercises' questions (english-learning.js): the instructions and the
     progress dots on top, the question with its answers right under it, and
     a line with a check or a cross. Their classes are the exercises' own;
     road-safety.css gives them the exercises' soft look. */
  function quizHead(instructions, total, current) {
    const dots = Array.from({ length: total }, (_, i) => `<span class="eng-bar-seg${i < current ? " is-done" : i === current ? " is-current" : ""}"></span>`).join("");
    return `
      <p class="eng-instructions">${esc(instructions)}</p>
      <div class="eng-progress" role="img" aria-label="${esc(`${current + 1} מתוך ${total}`)}"><div class="eng-bar" aria-hidden="true">${dots}</div></div>`;
  }

  const quizSay = (el, ok, text) =>
    (el.innerHTML = `<span class="eng-feedback-msg is-${ok ? "right" : "wrong"}">${ok ? ICONS.check : ICONS.cross}<span>${esc(text)}</span></span>`);

  // A right answer moves on by itself; after a wrong one, "הבא" does.
  function safeGame(stage, ui) {
    const ROUND = 10;
    const items = shuffle(SAFE_BANK).slice(0, ROUND);
    let index = 0;
    let right = 0;
    let timer = 0;
    function show() {
      stage.innerHTML = `
        <div class="rs-quiz rs-safe">
          ${quizHead("קראו ובחרו: בטוח או מסוכן.", ROUND, index)}
          <div class="eng-sentence"><p>${esc(items[index][0])}</p></div>
          <div class="eng-options">
            <button type="button" class="eng-option" data-safe="1">בטוח</button>
            <button type="button" class="eng-option" data-safe="0">מסוכן</button>
          </div>
          <div class="eng-feedback" id="rsSafeMsg" aria-live="polite"></div>
        </div>`;
    }
    function next() {
      clearTimeout(timer);
      index++;
      if (index < ROUND) return show();
      const stars = right >= 9 ? 3 : right >= 7 ? 2 : right >= 5 ? 1 : 0;
      ui.finish({ stars, score: `${right} מתוך ${ROUND}`, text: right >= 9 ? "מעולה! אתם יודעים לשמור על עצמכם בדרך." : "כל הכבוד! נסו שוב ותגיעו ל־10." });
    }
    stage.addEventListener("click", (e) => {
      if (e.target.closest("[data-rs-next]")) return next();
      const b = e.target.closest(".eng-option");
      if (!b || b.disabled) return;
      const [, safe, why] = items[index];
      const ok = (b.dataset.safe === "1") === safe;
      if (ok) right++;
      $$(".eng-option", stage).forEach((x) => {
        x.disabled = true;
        if ((x.dataset.safe === "1") === safe) x.classList.add("is-right");
      });
      if (!ok) b.classList.add("is-wrong");
      const msg = $("#rsSafeMsg", stage);
      quizSay(msg, ok, `${ok ? "נכון!" : safe ? "זה בטוח." : "זה מסוכן."} ${why}`);
      if (ok) {
        timer = setTimeout(next, 1800);
        return;
      }
      msg.insertAdjacentHTML("beforeend", `<button type="button" class="btn btn-primary btn-candy font-cartoon eng-next" data-rs-next>${index === ROUND - 1 ? "לתוצאות" : "הבא"}</button>`);
      $("[data-rs-next]", msg).focus({ preventScroll: true });
    });
    show();
    return () => clearTimeout(timer);
  }

  /* מה קודם? — the steps of five situations on the way, in order. */
  const ORDERS = [
    ["חוצים במעבר חצייה", ["עוצרים בשפת המדרכה", "מסתכלים שמאלה", "מסתכלים ימינה", "שוב שמאלה", "חוצים בהליכה"]],
    ["חוצים ברמזור", ["לוחצים על הכפתור", "מחכים לאיש הירוק", "מסתכלים לשני הצדדים", "חוצים בהליכה"]],
    ["נוסעים ברכב", ["נכנסים לרכב", "חוגרים חגורה", "נוסעים בשקט", "יוצאים מצד המדרכה"]],
    ["יורדים מההסעה", ["האוטובוס עוצר", "יורדים למדרכה", "מחכים שהאוטובוס ייסע", "חוצים במעבר חצייה"]],
    ["יוצאים לרכיבה", ["חובשים קסדה", "בודקים את הבלמים", "רוכבים בשביל אופניים", "במעבר חצייה יורדים והולכים"]],
  ];

  function orderGame(stage, ui) {
    const rounds = shuffle(ORDERS);
    let round = 0;
    let step = 0;
    let mistakes = 0;
    let timer = 0;
    function show() {
      const [title, steps] = rounds[round];
      step = 0;
      stage.innerHTML = `
        <div class="rs-quiz rs-order">
          ${quizHead("לחצו על השלבים לפי הסדר: מה עושים קודם?", rounds.length, round)}
          <div class="eng-sentence"><p>${esc(title)}</p></div>
          <ol class="rs-order-slots">${steps.map(() => `<li></li>`).join("")}</ol>
          <div class="rs-order-steps">${shuffle(steps.map((s, i) => [s, i]))
            .map(([s, i]) => `<button type="button" class="eng-chip rs-order-step" data-i="${i}">${esc(s)}</button>`)
            .join("")}</div>
          <div class="eng-feedback" id="rsOrderMsg" aria-live="polite"></div>
        </div>`;
    }
    stage.addEventListener("click", (e) => {
      const b = e.target.closest(".rs-order-step");
      if (!b || b.disabled) return;
      const msg = $("#rsOrderMsg", stage);
      const steps = rounds[round][1];
      if (Number(b.dataset.i) !== step) {
        mistakes++;
        b.classList.remove("is-wrong");
        void b.offsetWidth;
        b.classList.add("is-wrong");
        quizSay(msg, false, "עוד לא – מה בא לפני זה?");
        return;
      }
      $$(".rs-order-step.is-wrong", stage).forEach((x) => x.classList.remove("is-wrong"));
      b.disabled = true;
      b.classList.add("is-used");
      const slot = $$(".rs-order-slots li", stage)[step];
      slot.textContent = steps[step];
      slot.classList.add("is-filled");
      step++;
      if (step < steps.length) {
        quizSay(msg, true, "נכון! ומה אחר כך?");
        return;
      }
      quizSay(msg, true, "כל הכבוד – הסדר נכון!");
      timer = setTimeout(() => {
        round++;
        if (round < rounds.length) return show();
        const stars = mistakes <= 1 ? 3 : mistakes <= 4 ? 2 : 1;
        ui.finish({ stars, score: mistakes ? `${mistakes} טעויות` : "בלי טעויות", text: "אתם יודעים מה עושים – ובאיזה סדר!" });
      }, 1300);
    });
    show();
    return () => clearTimeout(timer);
  }

  /* ── The picture games: a street picture (road-scenes.js) to search, with
     the found places ringed on top. The picture zooms inside its own view
     (it pans there), so the screen itself never scrolls. ── */

  const SCENES = (kind) => window.RoadScenes?.[kind] || [];
  const sceneArt = (kind) => {
    const scene = SCENES(kind)[0];
    return scene ? `<img class="rs-card-img" src="${esc(scene.src)}" alt="" loading="lazy">` : "";
  };

  // Each new game takes the next picture, so they all get a turn.
  function nextScene(kind) {
    const list = SCENES(kind);
    const key = `pleyi-road-scene-${kind}`;
    let i = 0;
    try {
      i = (Number(localStorage.getItem(key)) || 0) % list.length;
      localStorage.setItem(key, String(i + 1));
    } catch {
      i = Math.floor(Math.random() * list.length);
    }
    return list[i];
  }

  const ZOOMS = [1, 1.6, 2.4];

  // The board's zoom and taps. onTap(x, y, slack) gets the spot in the
  // picture's own pixels; the returned object rings, marks and hints.
  function pictureBoard(stage, scene, onTap) {
    const view = $(".rs-pic-view", stage);
    const pic = $(".rs-pic", stage);
    const marks = $(".rs-pic-marks", stage);
    let zoom = 0;
    function fit() {
      const r = view.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const k = Math.min(r.width / scene.w, r.height / scene.h) * ZOOMS[zoom];
      pic.style.width = `${Math.round(scene.w * k)}px`;
      pic.style.height = `${Math.round(scene.h * k)}px`;
    }
    function setZoom(step) {
      const before = ZOOMS[zoom];
      zoom = Math.max(0, Math.min(ZOOMS.length - 1, zoom + step));
      // Keep the middle of the view where it was.
      const cx = (view.scrollLeft + view.clientWidth / 2) / before;
      const cy = (view.scrollTop + view.clientHeight / 2) / before;
      fit();
      view.scrollLeft = cx * ZOOMS[zoom] - view.clientWidth / 2;
      view.scrollTop = cy * ZOOMS[zoom] - view.clientHeight / 2;
      $$("[data-zoom]", stage).forEach((b) => (b.disabled = (b.dataset.zoom === "1" && zoom === ZOOMS.length - 1) || (b.dataset.zoom === "-1" && zoom === 0)));
    }
    // A pan (a drag of the zoomed picture) is no click, so only real taps count.
    pic.addEventListener("click", (e) => {
      const r = pic.getBoundingClientRect();
      const scale = r.width / scene.w;
      onTap((e.clientX - r.left) / scale, (e.clientY - r.top) / scale, 16 / scale);
    });
    stage.addEventListener("click", (e) => {
      const b = e.target.closest("[data-zoom]");
      if (b && !b.disabled) setZoom(Number(b.dataset.zoom));
    });
    const onResize = () => fit();
    window.addEventListener("resize", onResize);
    requestAnimationFrame(() => setZoom(0));
    const ring = ([x, y, w, h], cls) =>
      `<ellipse class="${cls}" cx="${x + w / 2}" cy="${y + h / 2}" rx="${w / 2 + 14}" ry="${h / 2 + 14}" vector-effect="non-scaling-stroke"/>`;
    return {
      ring: (box, cls = "is-found") => marks.insertAdjacentHTML("beforeend", ring(box, cls)),
      miss(x, y) {
        const s = scene.w / 40;
        marks.insertAdjacentHTML("beforeend", `<path class="rs-pic-miss" d="M${x - s} ${y - s}L${x + s} ${y + s}M${x + s} ${y - s}L${x - s} ${y + s}" vector-effect="non-scaling-stroke"/>`);
        const mark = marks.lastElementChild;
        setTimeout(() => mark.remove(), 700);
      },
      // A hint: a blinking ring on the place, and the view moves to it.
      hint(box) {
        marks.insertAdjacentHTML("beforeend", ring(box, "is-hint"));
        const mark = marks.lastElementChild;
        setTimeout(() => mark.remove(), 2400);
        const k = pic.getBoundingClientRect().width / scene.w;
        view.scrollTo({ left: (box[0] + box[2] / 2) * k - view.clientWidth / 2, top: (box[1] + box[3] / 2) * k - view.clientHeight / 2, behavior: "smooth" });
      },
      stop: () => window.removeEventListener("resize", onResize),
    };
  }

  const near = ([x, y, w, h], px, py, slack) => px >= x - slack && px <= x + w + slack && py >= y - slack && py <= y + h + slack;
  const pictureStars = (misses, hints) => {
    const cost = misses + hints * 3;
    return cost <= 2 ? 3 : cost <= 6 ? 2 : 1;
  };

  function boardHtml(scene, bottom) {
    return `
      <div class="rs-pg">
        <p class="rs-feedback" id="rsPgMsg" aria-live="polite"></p>
        <div class="rs-pic-wrap">
          <div class="rs-pic-view">
            <div class="rs-pic">
              <img src="${esc(scene.src)}" alt="${esc(scene.title)}" draggable="false">
              <svg class="rs-pic-marks" viewBox="0 0 ${scene.w} ${scene.h}" aria-hidden="true"></svg>
            </div>
          </div>
          <div class="rs-pic-tools">
            <button type="button" class="rs-pic-btn" data-zoom="1" aria-label="הגדלה">+</button>
            <button type="button" class="rs-pic-btn" data-zoom="-1" aria-label="הקטנה">−</button>
            <button type="button" class="rs-pic-btn rs-pic-btn--hint" data-hint>רמז</button>
          </div>
        </div>
        ${bottom}
      </div>`;
  }

  /* מצאו בתמונה — the things in the list, hidden in the picture. */
  function findGame(stage, ui) {
    const scene = nextScene("find");
    const items = scene.items;
    const found = new Set();
    let misses = 0;
    let hints = 0;
    let timer = 0;
    stage.innerHTML = boardHtml(
      scene,
      `<ul class="rs-pg-list">${items
        .map((it, i) => `<li data-i="${i}">${it.img ? `<img src="${esc(it.img)}" alt="">` : ""}<span>${esc(it.name)}</span></li>`)
        .join("")}</ul>`
    );
    const msg = $("#rsPgMsg", stage);
    const status = () => ui.status(`<span class="rs-chip">${found.size}/${items.length}</span>`);
    say(msg, `${scene.title} – מצאו את כל מה שברשימה`);
    const board = pictureBoard(stage, scene, (x, y, slack) => {
      const i = items.findIndex((it, j) => !found.has(j) && near(it.box, x, y, slack));
      if (i < 0) {
        misses++;
        board.miss(x, y);
        return;
      }
      found.add(i);
      board.ring(items[i].box);
      $(`.rs-pg-list li[data-i="${i}"]`, stage).classList.add("is-found");
      say(msg, `מצאתם: ${items[i].name}`, "good");
      status();
      if (found.size === items.length) {
        timer = setTimeout(() => ui.finish({ stars: pictureStars(misses, hints), score: `${items.length} מתוך ${items.length}`, text: "מצאתם הכול! עיניים פקוחות – כמו בדרך." }), 1100);
      }
    });
    stage.addEventListener("click", (e) => {
      if (!e.target.closest("[data-hint]")) return;
      const i = items.findIndex((_, j) => !found.has(j));
      if (i < 0) return;
      hints++;
      board.hint(items[i].box);
      say(msg, `רמז: ${items[i].name} – כאן בערך`);
    });
    status();
    return () => {
      clearTimeout(timer);
      board.stop();
    };
  }

  /* מה לא בסדר? — the dangers in the picture, and what to do instead. */
  function wrongGame(stage, ui) {
    const scene = nextScene("wrong");
    const spots = scene.spots;
    const found = new Set();
    let misses = 0;
    let hints = 0;
    let timer = 0;
    stage.innerHTML = boardHtml(scene, `<ol class="rs-pg-found" id="rsPgFound"></ol>`);
    const msg = $("#rsPgMsg", stage);
    const status = () => ui.status(`<span class="rs-chip">${found.size}/${spots.length}</span>`);
    say(msg, `יש בתמונה ${spots.length} דברים מסוכנים – מצאו אותם`);
    const board = pictureBoard(stage, scene, (x, y, slack) => {
      const i = spots.findIndex((sp, j) => !found.has(j) && near(sp.box, x, y, slack));
      if (i < 0) {
        misses++;
        board.miss(x, y);
        return;
      }
      found.add(i);
      board.ring(spots[i].box, "is-wrong");
      say(msg, `${spots[i].says} – ${spots[i].fix}`, "good");
      $("#rsPgFound", stage).insertAdjacentHTML("beforeend", `<li><b>${esc(spots[i].says)}</b> – ${esc(spots[i].fix)}</li>`);
      status();
      if (found.size === spots.length) {
        timer = setTimeout(() => ui.finish({ stars: pictureStars(misses, hints), score: `${spots.length} מתוך ${spots.length}`, text: "מצאתם את כל הסכנות – ואתם יודעים מה עושים נכון!" }), 1800);
      }
    });
    stage.addEventListener("click", (e) => {
      if (!e.target.closest("[data-hint]")) return;
      const i = spots.findIndex((_, j) => !found.has(j));
      if (i < 0) return;
      hints++;
      board.hint(spots[i].box);
      say(msg, "רמז: חפשו כאן");
    });
    status();
    return () => {
      clearTimeout(timer);
      board.stop();
    };
  }

  /* ── Wiring ── */

  // The phone menu (the yellow button in the bar).
  function setMenu(open) {
    $("#rsMenu")?.classList.toggle("open", open);
    $("#rsMenuToggle")?.classList.toggle("open", open);
    $("#rsMenuToggle")?.setAttribute("aria-expanded", open ? "true" : "false");
    document.documentElement.classList.toggle("rs-menu-open", open);
  }

  function bind() {
    $("#rsMenuToggle")?.addEventListener("click", () => setMenu(!$("#rsMenu")?.classList.contains("open")));
    // Any choice in the menu (a part, the Pleyi link, sign-in) closes it.
    $("#rsMenu")?.addEventListener("click", (e) => {
      if (e.target.closest("a, button")) setMenu(false);
    });

    document.addEventListener("click", (e) => {
      if (barBack(e)) return;
      const lessonInfo = e.target.closest("[data-rs-lesson-info]");
      if (lessonInfo) return flipLessonTile(lessonInfo);
      const lessonBtn = e.target.closest("[data-rs-lesson]");
      if (lessonBtn) return openLesson(lessonBtn.dataset.rsLesson);

      const gameInfo = e.target.closest("[data-rs-game-info]");
      if (gameInfo) {
        const game = GAMES.find((g) => g.id === gameInfo.dataset.rsGameInfo);
        const best = readBest()[game?.id];
        if (game) openInfo(game.title, [...game.how, ...(best ? [`השיא שלך: ${best} כוכבים`] : [])], "לשחק", () => shell.open(game));
        return;
      }
      const gameBtn = e.target.closest("[data-rs-game]");
      if (gameBtn) {
        const game = GAMES.find((g) => g.id === gameBtn.dataset.rsGame);
        if (game) shell.open(game);
        return;
      }
      if (e.target.closest("[data-rs-again]")) return shell.run();
      if (e.target.closest("[data-rs-close]")) return shell.close();
    });

    // A flipped tile's lines refit when the page's width changes.
    window.addEventListener("resize", () => document.querySelectorAll(".rs-lesson-tile.is-flipped").forEach(fitLessonBack));

    $("#rsInfoGo")?.addEventListener("click", () => {
      const run = infoGo;
      closeInfo();
      run?.();
    });
    $("#rsInfoClose")?.addEventListener("click", closeInfo);
    $("#rsInfoModal")?.addEventListener("click", (e) => {
      if (e.target.id === "rsInfoModal") closeInfo();
    });
    $("#rsGameClose")?.addEventListener("click", () => shell.close());
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if ($("#rsMenu")?.classList.contains("open")) setMenu(false);
      else if (!$("#rsInfoModal")?.classList.contains("hidden")) closeInfo();
      else if (shell.game) shell.close();
    });
    // After the engine's own hashchange (english-learning.js binds first).
    // The phone's back button changes the page too: the menu, a dialog or
    // a game over the page closes, so it never stays over another page.
    addEventListener("hashchange", () => {
      setMenu(false);
      closeInfo();
      shell.close(false);
      showPage();
    });
  }

  /* ── The hero's pedestrian light: a detailed drawing that goes red, green,
     flashing green, and red again ── */

  // The standing man and the walking man, centered on (x, y), 68 tall.
  const standingMan = (x, y) =>
    `<circle cx="${x}" cy="${y - 26}" r="8"/>` +
    `<rect x="${x - 11}" y="${y - 15}" width="22" height="25" rx="6"/>` +
    `<rect x="${x - 18}" y="${y - 14}" width="6" height="24" rx="3"/><rect x="${x + 12}" y="${y - 14}" width="6" height="24" rx="3"/>` +
    `<rect x="${x - 10}" y="${y + 6}" width="8" height="28" rx="4"/><rect x="${x + 2}" y="${y + 6}" width="8" height="28" rx="4"/>`;
  const walkingMan = (x, y) =>
    `<circle cx="${x + 4}" cy="${y - 27}" r="8"/>` +
    `<g fill="none" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">` +
    `<polyline points="${x + 2},${y - 15} ${x - 2},${y + 4}"/>` +
    `<polyline points="${x - 2},${y + 4} ${x + 8},${y + 18} ${x + 14},${y + 32}"/>` +
    `<polyline points="${x - 2},${y + 4} ${x - 10},${y + 18} ${x - 17},${y + 30}"/>` +
    `<polyline points="${x + 1},${y - 12} ${x - 8},${y - 3} ${x - 12},${y + 6}"/>` +
    `<polyline points="${x + 1},${y - 12} ${x + 10},${y - 4} ${x + 14},${y + 4}"/></g>`;

  // One lamp: a window, a visor over the lens, the man dark and lit.
  function heroLamp(name, cy, color, deep, man, id) {
    return (
      `<g class="rs-tl-${name}">` +
      `<rect x="64" y="${cy - 52}" width="112" height="104" rx="16" fill="#0b1013" stroke="#000" stroke-width="3"/>` +
      `<circle cx="120" cy="${cy}" r="44" fill="url(#${id}Lens)"/>` +
      `<g class="rs-tl-off" fill="#34434b" stroke="#34434b">${man(120, cy)}</g>` +
      `<g class="rs-tl-on">` +
      `<circle cx="120" cy="${cy}" r="44" fill="${deep}"/>` +
      `<circle cx="120" cy="${cy}" r="40" fill="${color}" opacity="0.35" filter="url(#${id}Halo)"/>` +
      `<g fill="${color}" stroke="${color}" filter="url(#${id}Glow)">${man(120, cy)}</g></g>` +
      `<circle cx="120" cy="${cy}" r="44" fill="url(#${id}Dots)"/>` +
      `<ellipse cx="98" cy="${cy - 16}" rx="13" ry="6" fill="#fff" opacity="0.14" transform="rotate(-35 98 ${cy - 16})"/>` +
      `<path d="M66 ${cy - 4} Q66 ${cy - 58} 120 ${cy - 58} Q174 ${cy - 58} 174 ${cy - 4} L165 ${cy - 4} Q165 ${cy - 47} 120 ${cy - 47} Q75 ${cy - 47} 75 ${cy - 4} Z" fill="#1c262c" stroke="#000" stroke-width="3" stroke-linejoin="round"/>` +
      `</g>`
    );
  }

  // `id` starts the ids of its gradients and filters, so two lights can share a page.
  function heroLight(id = "rsTl") {
    const defs =
      `<defs>` +
      `<linearGradient id="${id}Body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#44555e"/><stop offset="1" stop-color="#232e34"/></linearGradient>` +
      `<linearGradient id="${id}Pole" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#78909c"/><stop offset="0.35" stop-color="#e3eaee"/><stop offset="1" stop-color="#607d8b"/></linearGradient>` +
      `<radialGradient id="${id}Lens" cx="0.5" cy="0.45" r="0.6"><stop offset="0" stop-color="#1d272c"/><stop offset="1" stop-color="#06090b"/></radialGradient>` +
      `<pattern id="${id}Dots" width="4" height="4" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="0.85" fill="#000" opacity="0.35"/></pattern>` +
      `<filter id="${id}Halo" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9"/></filter>` +
      `<filter id="${id}Glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>` +
      `</defs>`;
    // The pole, its collar and foot, and the case.
    const pole =
      `<rect x="106" y="240" width="28" height="180"/>` +
      `<rect x="90" y="414" width="60" height="14" rx="5"/>` +
      `<rect x="103" y="392" width="34" height="11" rx="3"/>`;
    const caseRect = (x, y) => `<rect x="${x}" y="${y}" width="136" height="250" rx="22"/>`;
    return (
      `<svg class="rs-tl" data-on="red" viewBox="0 0 240 440" xmlns="http://www.w3.org/2000/svg">${defs}` +
      `<ellipse cx="120" cy="430" rx="62" ry="7" fill="#000" opacity="0.14"/>` +
      // The outline, as thick as the title letters' (half of it shows: 11 of
      // 440, with the light 2.1 times the title's size), and the case's hard
      // shadow, both behind the drawing.
      `<g fill="#000" stroke="#000" stroke-width="22" stroke-linejoin="round">${caseRect(59, 22)}${pole}${caseRect(52, 14)}</g>` +
      `<rect x="106" y="240" width="28" height="180" fill="url(#${id}Pole)"/>` +
      `<rect x="90" y="414" width="60" height="14" rx="5" fill="#78909c" stroke="#000" stroke-width="4"/>` +
      `<rect x="103" y="392" width="34" height="11" rx="3" fill="#90a4ae" stroke="#000" stroke-width="3"/>` +
      `<rect x="52" y="14" width="136" height="250" rx="22" fill="url(#${id}Body)"/>` +
      `<rect x="58" y="20" width="124" height="238" rx="17" fill="none" stroke="#fff" stroke-opacity="0.1" stroke-width="2"/>` +
      heroLamp("red", 80, "#ff4d4d", "#3a0b0e", standingMan, id) +
      heroLamp("green", 198, "#2bff88", "#06361d", walkingMan, id) +
      [[64, 26], [176, 26], [64, 252], [176, 252]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#11181c"/>`).join("") +
      `</svg>`
    );
  }

  // Red 4 s, green 5 s (the walkers' green doesn't flash in Israel). The
  // title's words light with it.
  function runHeroLight(svg) {
    const lights = [svg, $("#rsTitle")].filter(Boolean);
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      lights.forEach((el) => setLights(el, "green"));
      return;
    }
    const steps = [["red", 4000], ["green", 5000]];
    let i = 0;
    const next = (wait) =>
      setTimeout(() => {
        i = (i + 1) % steps.length;
        show();
      }, wait);
    const show = (first) => {
      const [on, ms] = steps[i];
      lights.forEach((el) => setLights(el, on));
      // The first red is short, so the change shows soon after the page opens.
      next(first ? 2200 : ms);
    };
    show(true);
  }

  function init() {
    splitTitle();
    addBuddy();
    const art = $("#rsHeroArt");
    if (art) {
      art.innerHTML = heroLight();
      runHeroLight(art.firstElementChild);
    }
    showPage();
    renderLessons();
    renderGames();
    bind();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
