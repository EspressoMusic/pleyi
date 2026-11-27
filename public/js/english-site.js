/* English (/learn-english) — the English mini site inside Pleyi, built like
   the road-safety site (/road-safety) but with an English look: letters of
   the ABC falling in the background, a line of an English notebook between
   the parts, toy ABC blocks beside the title.
   - Lessons (#lessons): every short English lesson (english-lessons.js),
     in the learning path's stages, opened in the shared lesson player
     (ready-lessons.js).
   - Exercises (#practice): the English learning path, run by
     english-learning.js in #engMain (its topics, exercises and games).
   - Games (#games): the English games (english-games.js) with the words of
     the topic picked on top; a game runs in the exercises' screen
     (#<topic>/game-<id>), and its back arrow comes back here.
   - מה חדש: the newest updates on the home page (news-carousel.js turns
     them, so they are drawn as soon as this file runs), every update on
     #news.
   The home page, the lessons library, the games, the exercises and מה חדש
   are each a page of their own (showPage). Boys' names only, no pictures of
   girls. */
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (list) => list[Math.floor(Math.random() * list.length)];
  const motionOff = () =>
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.visual === "minimal";

  const ENG = () => window.EnglishLearning;
  // The word games (the trivia is on each topic page, after its exercises).
  const GAMES = () => (window.EnglishGames?.list || []).filter((g) => !g.questions);

  const ICONS = {
    toc: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6h12M9 12h12M9 18h12"/><circle cx="4" cy="6" r="1.2" fill="currentColor"/><circle cx="4" cy="12" r="1.2" fill="currentColor"/><circle cx="4" cy="18" r="1.2" fill="currentColor"/></svg>`,
    chevron: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>`,
  };

  /* ── Pages: the home page, and the lessons library, the games, the
     exercises and מה חדש, each on its own address (#lessons, #games,
     #practice, #news). Any other address is the exercises engine's (a
     topic, an exercise or a game). html[data-es-page] shows the page's
     parts (english-site.css); a script in the page's <head> sets it before
     the first paint. ── */

  const PAGES = ["lessons", "games", "practice", "news"];

  function pageOf() {
    const hash = decodeURIComponent(location.hash.replace(/^#/, ""));
    if (!hash) return "home";
    return PAGES.includes(hash) ? hash : "engine";
  }

  function showPage() {
    const page = pageOf();
    document.documentElement.dataset.esPage = page;
    // A topic, an exercise or a game belongs to the exercises page.
    const current = page === "engine" ? "practice" : page;
    $$("[data-es-page]").forEach((link) => {
      if (link.dataset.esPage === current) link.setAttribute("aria-current", "page");
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

  /* ── The title: "English" in the Pleyi home title's letters (Fredoka, a
     thick ink outline, the home title's colors). They drop in one by one,
     sway, and a letter does a somersault when touched (and a random one
     every few seconds), as on the Pleyi home page. ── */

  const TITLE_COLORS = ["#ff6b9d", "#ffe135", "#00e5cc", "#ff8fcb", "#ffd700", "#62ebe0", "#ff9a3c"];

  function splitTitle() {
    const title = $("#esTitle");
    if (!title) return;
    const text = title.textContent.trim();
    title.setAttribute("aria-label", text);
    title.innerHTML = `<span class="es-word" aria-hidden="true">${[...text]
      .map((ch, i) => `<span class="es-ch" style="--ch-color:${TITLE_COLORS[i % TITLE_COLORS.length]};--ch-delay:${(i * 0.14).toFixed(2)}s" data-ch="${esc(ch)}">${esc(ch)}</span>`)
      .join("")}</span>`;
  }

  const HOP_FRAMES = [
    { translate: "0 0", rotate: "0deg", scale: "1 1" },
    { translate: "0 8%", rotate: "0deg", scale: "1.18 0.84", offset: 0.14 },
    { translate: "0 -55%", rotate: "180deg", scale: "0.94 1.08", offset: 0.5 },
    { translate: "0 10%", rotate: "360deg", scale: "1.22 0.8", offset: 0.82 },
    { translate: "0 0", rotate: "360deg", scale: "1 1" },
  ];

  function letterHop(ch) {
    if (!ch || ch.dataset.hopping || motionOff()) return;
    if (ch.getAnimations().some((a) => a.animationName === "es-ch-drop" && a.playState !== "finished")) return;
    ch.dataset.hopping = "1";
    const anim = ch.animate(HOP_FRAMES, { duration: 850, easing: "ease-in-out" });
    const done = () => delete ch.dataset.hopping;
    anim.onfinish = done;
    anim.oncancel = done;
    // The fox stands on the first letter: it hops along.
    if (!ch.previousElementSibling) buddyHop($(".es-buddy"));
  }

  function bindTitle() {
    const title = $("#esTitle");
    if (!title) return;
    title.addEventListener("pointerover", (e) => letterHop(e.target.closest(".es-ch")));
    title.addEventListener("click", (e) => letterHop(e.target.closest(".es-ch")));
    let last = -1;
    setInterval(() => {
      if (document.hidden || pageOf() !== "home") return;
      const letters = $$(".es-ch", title);
      if (letters.length < 2) return;
      let i;
      do i = Math.floor(Math.random() * letters.length);
      while (i === last);
      last = i;
      letterHop(letters[i]);
    }, 3500);
  }

  /* ── The site's mascot: the Pleyi fox (or the animal picked in "נראות"),
     drawn by site-fox.js and perched on the title's first letter. It hops
     when tapped. ── */

  function buddyHop(buddy) {
    if (!buddy || motionOff()) return;
    buddy.classList.remove("is-hop");
    void buddy.offsetWidth;
    buddy.classList.add("is-hop", "is-landed");
  }

  // The first letter sways up and down (es-ch-bounce); the fox standing on
  // it sways with it (es-buddy-ride, the same timing), started at the very
  // same moment so its feet never sink into the letter.
  function rideWithFirstLetter(buddy, letter) {
    if (!letter || !buddy.getAnimations) return;
    const sway = letter.getAnimations().find((a) => a.animationName === "es-ch-bounce");
    const ride = buddy.getAnimations().find((a) => a.animationName === "es-buddy-ride");
    if (!sway || !ride) return;
    Promise.all([sway.ready, ride.ready])
      .then(() => {
        ride.startTime = sway.startTime;
      })
      .catch(() => {});
  }

  function addBuddy() {
    const word = $("#esTitle .es-word");
    if (!word || !window.PleyiFox) return;
    const buddy = document.createElement("span");
    buddy.className = "es-buddy";
    buddy.innerHTML = `<span class="es-buddy-fig">${window.PleyiFox.draw()}</span>`;
    word.append(buddy);
    rideWithFirstLetter(buddy, word.firstElementChild);
    $(".es-buddy-fig", buddy).addEventListener("animationend", (e) => {
      if (e.animationName === "es-buddy-hop") buddy.classList.remove("is-hop");
      if (e.animationName === "es-buddy-land") buddy.classList.add("is-landed");
    });
    buddy.addEventListener("click", (e) => {
      e.stopPropagation();
      buddyHop(buddy);
    });
  }

  /* ── The ABC blocks beside the title, in the title's look: a hand-drawn
     ink outline, the color a little off it (a gap at the top and the
     right), a hatched shadow to the bottom left, and the letter in the
     title's letters. A and B side by side, C on top. Now and then one
     jumps; a tap makes it jump too. ── */

  const BLOCKS = [
    // letter, x, y, block color, letter color, seed of the outline's wobble
    ["A", 6, 116, "#ff6b9d", "#ffe135", 11],
    ["B", 130, 116, "#00e5cc", "#ff8fcb", 23],
    ["C", 68, 6, "#ffe135", "#00e5cc", 37],
  ];
  const S = 104;
  const SHADOW = 10;

  // A rounded square drawn by hand: every side bows a little, never twice
  // alike (a small seeded random, so the blocks look the same every visit).
  function roughSquare(x, y, size, seed) {
    let s = seed;
    const rnd = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280 - 0.5;
    };
    const j = (v, amount = 2.6) => (v + rnd() * amount).toFixed(1);
    const r = 16;
    const [l, t, rt, b] = [x, y, x + size, y + size];
    const mid = (a, c) => (a + c) / 2;
    return (
      `M${j(l + r)} ${j(t)}` +
      `Q${j(mid(l, rt), 5)} ${j(t, 4)} ${j(rt - r)} ${j(t)}` +
      `Q${j(rt)} ${j(t)} ${j(rt)} ${j(t + r)}` +
      `Q${j(rt, 4)} ${j(mid(t, b), 5)} ${j(rt)} ${j(b - r)}` +
      `Q${j(rt)} ${j(b)} ${j(rt - r)} ${j(b)}` +
      `Q${j(mid(l, rt), 5)} ${j(b, 4)} ${j(l + r)} ${j(b)}` +
      `Q${j(l)} ${j(b)} ${j(l)} ${j(b - r)}` +
      `Q${j(l, 4)} ${j(mid(t, b), 5)} ${j(l)} ${j(t + r)}` +
      `Q${j(l)} ${j(t)} ${j(l + r)} ${j(t)}Z`
    );
  }

  function block([letter, x, y, color, letterColor, seed]) {
    const cx = x + S / 2;
    const cy = y + S / 2 + 3;
    const outline = roughSquare(x, y, S, seed);
    return `
      <g class="es-block" data-letter="${letter}" style="transform-origin:${cx}px ${y + S}px">
        <path d="${roughSquare(x - SHADOW, y + SHADOW, S, seed + 5)}" fill="url(#esHatch)"/>
        <path d="${roughSquare(x - 1.5, y + 6, S - 4.5, seed + 9)}" fill="${color}"/>
        <path d="${outline}" fill="none" stroke="#000" stroke-width="5.5" stroke-linejoin="round"/>
        <path d="${roughSquare(x + 0.8, y - 0.6, S, seed + 3)}" fill="none" stroke="#000" stroke-width="2" stroke-linejoin="round"/>
        <text class="es-block-fill" x="${cx}" y="${cy}" fill="${letterColor}">${letter}</text>
        <text class="es-block-ink" x="${cx}" y="${cy}">${letter}</text>
      </g>`;
  }

  function heroBlocks() {
    return `<svg class="es-blocks" viewBox="0 0 240 226" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="esHatch" width="3.6" height="3.6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <rect x="0" y="0" width="1.9" height="3.6" fill="#000"/>
        </pattern>
      </defs>
      ${BLOCKS.map(block).join("")}
    </svg>`;
  }

  function blockJump(g) {
    if (!g || g.dataset.jumping || motionOff()) return;
    g.dataset.jumping = "1";
    const anim = g.animate(
      [
        { transform: "none" },
        { transform: "translateY(4px) scale(1.1, 0.88)", offset: 0.15 },
        { transform: "translateY(-46px) rotate(-8deg)", offset: 0.5 },
        { transform: "translateY(4px) scale(1.1, 0.9)", offset: 0.85 },
        { transform: "none" },
      ],
      { duration: 720, easing: "ease-in-out" }
    );
    const done = () => delete g.dataset.jumping;
    anim.onfinish = done;
    anim.oncancel = done;
  }

  function bindBlocks(art) {
    art.addEventListener("click", (e) => blockJump(e.target.closest(".es-block")));
    setInterval(() => {
      if (document.hidden || pageOf() !== "home") return;
      blockJump(pick($$(".es-block", art)));
    }, 4200);
  }

  /* ── The background: the Pleyi site's slow fall and side waves
     (ambient-bg.js), with letters of the ABC instead of dots. ── */

  const BG_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const BG_COLORS = ["rgba(58, 34, 168, 0.5)", "rgba(80, 52, 196, 0.45)", "rgba(40, 24, 130, 0.5)", "rgba(255, 255, 255, 0.55)"];

  const SIDE_WAVES = `
    <svg viewBox="0 0 140 1000" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path fill="rgba(58,34,168,0.16)" d="M0,0 C72,95 18,210 88,340 C118,420 42,560 96,690 C124,770 54,900 0,1000 L0,0 Z"/>
      <path fill="rgba(45,28,140,0.24)" d="M0,0 C48,160 92,300 36,460 C-8,610 64,760 28,1000 L0,1000 L0,0 Z"/>
    </svg>`;

  function background() {
    if ($(".es-ambient")) return;
    const layer = document.createElement("div");
    layer.className = "es-ambient";
    layer.setAttribute("aria-hidden", "true");
    const reduced = motionOff();
    let html = ["left", "right"].map((side) => `<div class="es-amb-side es-amb-side--${side}">${SIDE_WAVES}</div>`).join("");
    for (let i = 0; i < (reduced ? 16 : 34); i++) {
      const dur = rand(18, 44);
      const style = [
        `--l-size:${rand(18, 52).toFixed(0)}px`,
        `--l-opacity:${rand(0.35, 0.85).toFixed(2)}`,
        `--l-turn:${rand(-40, 40).toFixed(0)}deg`,
        `--drift:${rand(-30, 30).toFixed(0)}px`,
        `color:${pick(BG_COLORS)}`,
        `left:${rand(0, 97).toFixed(1)}%`,
        `animation-duration:${dur.toFixed(1)}s`,
        `animation-delay:${(-rand(0, dur)).toFixed(1)}s`,
      ];
      if (reduced) style.push(`top:${rand(0, 95).toFixed(1)}%`);
      html += `<span class="es-amb-letter" style="${style.join(";")}">${pick([...BG_LETTERS])}</span>`;
    }
    layer.innerHTML = html;
    document.body.prepend(layer);
  }

  /* ── Lessons: the library, in the learning path's stages, each lesson a
     card exactly like the Pleyi lessons library's (ready-lessons.html
     .svc-lesson-card, its sticker look in service-landing.css): the number
     on top, the "i" that turns it over to the summary, the lesson's name
     and "פתיחה" ── */

  const SHORT = () => new Map((window.ENGLISH_SHORT_LESSONS || []).map((l) => [l.id, l]));

  function lessonStages() {
    const eng = ENG();
    if (!eng) return [];
    const short = SHORT();
    const catalog = window.ReadyLessons?.catalog || {};
    let num = 0;
    return eng
      .path()
      .map((stage) => ({
        ...stage,
        lessons: stage.topics.flatMap((topic) =>
          eng.lessonIds(topic).map((id, i, ids) => {
            const entry = short.get(id);
            const raw = catalog[id];
            // A topic of several lessons: the lesson's own part as the
            // title, and the topic's name with its number under it.
            const title = entry?.part || entry?.name || raw?.namePart || raw?.name || id;
            const sub = ids.length > 1 ? `${entry?.name || eng.title(topic)} ${i + 1}` : entry?.part ? entry.name : "";
            return { id, topic, title, sub, num: ++num };
          })
        ),
      }))
      .filter((stage) => stage.lessons.length);
  }

  // As in the library (ready-lessons.js setCardPart): "אותיות וצלילים 1 – H
  // עד T" is the topic on one line and what this lesson does under it.
  function cardPartHtml(text) {
    const [head, ...rest] = String(text).split(/\s+[–-]\s+/);
    if (!rest.length) return esc(text);
    return [head, rest.join(" – ")].map((line) => `<span class="svc-lesson-part-line">${esc(line)}</span>`).join("");
  }

  function lessonCard(lesson, learned) {
    const raw = window.ReadyLessons?.catalog?.[lesson.id];
    const name = raw?.nameMain || "אנגלית";
    const part = raw?.namePart || (lesson.sub ? `${lesson.sub} – ${lesson.title}` : lesson.title);
    return `
      <article class="svc-lesson-card" data-lesson="${esc(lesson.id)}">
        <div class="svc-lesson-preview">
          <span class="svc-lesson-num" aria-hidden="true">${lesson.num}</span>
          <button type="button" class="svc-lesson-info-toggle" aria-label="מידע על השיעור" aria-expanded="false">i</button>
          <span class="svc-lesson-learned-badge${learned.has(lesson.id) ? "" : " hidden"}">נלמד</span>
          <div class="svc-lesson-title-wrap">
            <span class="svc-lesson-name">${esc(name)}</span>
            <span class="svc-lesson-part">${cardPartHtml(part)}</span>
          </div>
          <button type="button" class="btn btn-primary btn-candy font-cartoon js-lesson-open" aria-label="${esc(`פתיחת שיעור ${lesson.num} – ${part}`)}">פתיחה</button>
        </div>
      </article>`;
  }

  // Every topic has its own sticker color (six in turn, service-landing.css
  // data-tone 0-5), never the same as the card beside it or the card above
  // it; the tilt changes card by card too.
  const TONES = 6;
  function toneRows() {
    let top = null;
    let row = [];
    let above = [];
    $$("#esLessonList .svc-lesson-card").forEach((card, i) => {
      const y = card.getBoundingClientRect().top;
      if (top !== null && Math.abs(y - top) > 4) {
        above = row;
        row = [];
      }
      top = y;
      const left = row[row.length - 1];
      const up = above[row.length];
      let tone = i % TONES;
      while (tone === left || tone === up) tone = (tone + 1) % TONES;
      row.push(tone);
      card.dataset.tone = tone;
      card.dataset.tilt = i % 4;
    });
  }

  // A long name shrinks to fit its square (ready-lessons.js
  // fitLessonCardTitle), never clipped.
  function fitCardTitle(wrap) {
    wrap.style.removeProperty("--card-fit");
    if (!wrap.clientHeight) return;
    const cs = getComputedStyle(wrap);
    const room = wrap.clientHeight - parseFloat(cs.paddingTop || "0") - parseFloat(cs.paddingBottom || "0");
    const parts = [...wrap.children];
    const gap = (parseFloat(cs.rowGap || "0") || 0) * Math.max(0, parts.length - 1);
    const needed = () => parts.reduce((h, el) => h + el.offsetHeight, 0) + gap;
    let scale = 1;
    while (scale > 0.55 + 1e-6 && needed() > room) {
      scale = Math.max(0.55, scale - 0.05);
      wrap.style.setProperty("--card-fit", scale.toFixed(2));
    }
  }

  function fitLessonCards() {
    $$("#esLessonList .svc-lesson-title-wrap").forEach(fitCardTitle);
  }

  function readLearned() {
    try {
      return new Set(window.ReadyLessons?.learned?.() || []);
    } catch {
      return new Set();
    }
  }

  // The table of contents under the title, as on the English page: each
  // stage opens to its numbered lessons, and a lesson starts right away.
  function lessonTocHtml(stages) {
    const row = (lesson) => `
      <li><button type="button" class="eng-toc-topic-link es-toc-lesson" data-es-lesson="${esc(lesson.id)}"><span class="eng-toc-num">${lesson.num}</span><span>${esc(lesson.sub ? `${lesson.sub} – ${lesson.title}` : lesson.title)}</span></button></li>`;
    return `
      <details class="eng-toc" id="esToc">
        <summary class="eng-toc-head">${ICONS.toc}<span>תוכן עניינים</span><span class="eng-toc-chevron">${ICONS.chevron}</span></summary>
        <div class="eng-toc-body">
          ${stages.map((s) => `
            <details class="eng-toc-stage" name="es-toc-stage">
              <summary class="eng-toc-stage-head"><span class="eng-path-stage-num">שלב ${s.stageNum}</span><span class="eng-toc-stage-title">${esc(s.title)}</span><span class="eng-toc-chevron">${ICONS.chevron}</span></summary>
              <ol class="eng-toc-topics">${s.lessons.map(row).join("")}</ol>
            </details>`).join("")}
        </div>
      </details>`;
  }

  function renderLessons() {
    const list = $("#esLessonList");
    if (!list) return;
    const stages = lessonStages();
    const learned = readLearned();
    list.innerHTML =
      lessonTocHtml(stages) +
      stages
        .map(
          (s) => `
        <div class="eng-topic-group eng-path-stage" data-level="${s.level}">
          <h3 class="eng-group-title eng-path-title"><span class="eng-path-stage-num">שלב ${s.stageNum}</span>${esc(s.title)}</h3>
          <div class="svc-lesson-grid">${s.lessons.map((lesson) => lessonCard(lesson, learned)).join("")}</div>
        </div>`
        )
        .join("");
    // The page is hidden until #lessons: the colors and the titles' fit
    // wait for the cards to have a size, and follow the width after.
    if (typeof ResizeObserver !== "undefined") {
      let frame = 0;
      new ResizeObserver(() => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          toneRows();
          fitLessonCards();
        });
      }).observe(list);
    }
    toneRows();
    document.fonts?.ready.then(fitLessonCards);
  }

  // A tap on a card opens its lesson; its "i" turns it over (and a tap on
  // the back, anywhere else, or Escape turns it back).
  function bindLessonCards() {
    const list = $("#esLessonList");
    if (!list) return;
    const flip = (card, toBack, focus) => window.ReadyLessons?.flipCard?.(card, toBack, focus);
    list.addEventListener("click", (e) => {
      const card = e.target.closest(".svc-lesson-card");
      if (!card || e.target.closest(".svc-lesson-back")) return;
      if (e.target.closest(".svc-lesson-info-toggle")) {
        e.preventDefault();
        flip(card, true, true);
        return;
      }
      if (e.target.closest(".svc-lesson-preview")) openLesson(card.dataset.lesson);
    });
    document.addEventListener("click", (e) => {
      const open = $("#esLessonList .svc-lesson-card.is-flipped");
      if (open && !open.contains(e.target)) flip(open, false, false);
    });
    document.addEventListener("keydown", (e) => {
      const open = $("#esLessonList .svc-lesson-card.is-flipped");
      if (e.key === "Escape" && open) flip(open, false, true);
    });
  }

  function openLesson(id) {
    const raw = window.ReadyLessons?.catalog?.[id];
    if (!raw) return;
    window.StudentProgress?.record({ kind: "lesson", topicId: raw.topic, topicTitle: raw.namePart || raw.name, itemId: id, itemTitle: raw.namePart || raw.name });
    if (window.ReadyLessons?.openLesson) window.ReadyLessons.openLesson(id);
    else location.href = `/services/ready-lessons?lesson=${encodeURIComponent(id)}`;
  }

  /* ── Games: a card per English game; they play with the words of the
     topic picked on top (only the games that topic has enough words for
     show). The game opens in the exercises' screen, and its back arrow (and
     its results' "back to the topic") come back to the games. ── */

  const TOPIC_KEY = "pleyi-eng-site-game-topic";
  const FROM_KEY = "pleyi-eng-site-from-games";
  const DEFAULT_TOPIC = "vocab-animals";

  // Every topic that has a game, in the path's order.
  function gameTopics() {
    const eng = ENG();
    if (!eng) return [];
    const ids = new Set(GAMES().flatMap((g) => eng.gameTopics(g.id).map((t) => t.id)));
    return eng
      .path()
      .flatMap((stage) => stage.topics)
      .filter((topic) => ids.has(topic.id));
  }

  function chosenTopic(topics) {
    let id = null;
    try {
      id = localStorage.getItem(TOPIC_KEY);
    } catch {
      /* private window: the first topic */
    }
    return topics.find((t) => t.id === id) || topics.find((t) => t.id === DEFAULT_TOPIC) || topics[0] || null;
  }

  function saveTopic(id) {
    try {
      localStorage.setItem(TOPIC_KEY, id);
    } catch {
      /* the choice just isn't kept */
    }
  }

  // Each game card's color, in turn.
  const CARD_COLORS = ["#ffe873", "#9ff0b5", "#a9d8ff", "#ffb8d2", "#dcc9ff", "#ffcf9e"];

  function renderGames() {
    const list = $("#esGameList");
    const bar = $("#esGameTopic");
    const eng = ENG();
    if (!list || !bar || !eng) return;
    const topics = gameTopics();
    const topic = chosenTopic(topics);
    if (!topic) {
      bar.innerHTML = "";
      list.innerHTML = "";
      return;
    }
    // The topic picker: the Pleyi filter bar (service-landing.css), as the
    // grade filter on the exercises page.
    bar.innerHTML = `
      <div class="svc-filter-bar eng-grade-bar es-topic-bar">
        <div class="svc-filter-dropdown">
          <button type="button" class="svc-filter-trigger" id="esTopicTrigger" aria-expanded="false" aria-controls="esTopicMenu">
            <span class="svc-filter-trigger-label">מילים של</span>
            <span class="svc-filter-trigger-value">${esc(eng.title(topic))}</span>
          </button>
          <ul class="svc-filter-menu hidden" id="esTopicMenu">
            ${topics.map((t) => `<li><button type="button" data-es-topic="${esc(t.id)}"${t === topic ? ' class="active"' : ""}>${esc(eng.title(t))}</button></li>`).join("")}
          </ul>
        </div>
      </div>`;
    const games = GAMES().filter((g) => eng.gameTopics(g.id).some((t) => t.id === topic.id));
    list.innerHTML = games
      .map(
        (g, i) => `
      <div class="es-card es-game-card">
        <a class="es-card-art" href="#${esc(topic.id)}/game-${esc(g.id)}" data-es-game="${esc(topic.id)}/game-${esc(g.id)}" style="--card-color:${CARD_COLORS[i % CARD_COLORS.length]}" tabindex="-1" aria-hidden="true">${g.icon}</a>
        <h3 class="es-card-title">${esc(g.title)}</h3>
        <div class="es-card-actions">
          <a class="btn btn-primary btn-candy font-cartoon es-open" href="#${esc(topic.id)}/game-${esc(g.id)}" data-es-game="${esc(topic.id)}/game-${esc(g.id)}" aria-label="${esc(`לשחק: ${g.title} – ${eng.title(topic)}`)}">לשחק</a>
        </div>
      </div>`
      )
      .join("");
    bindTopicBar();
  }

  function bindTopicBar() {
    const trigger = $("#esTopicTrigger");
    const menu = $("#esTopicMenu");
    if (!trigger || !menu) return;
    const close = () => {
      menu.classList.add("hidden");
      trigger.setAttribute("aria-expanded", "false");
      trigger.parentElement.classList.remove("is-open");
      document.removeEventListener("click", close);
    };
    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!menu.classList.contains("hidden")) return close();
      menu.classList.remove("hidden");
      trigger.setAttribute("aria-expanded", "true");
      trigger.parentElement.classList.add("is-open");
      document.addEventListener("click", close);
    });
    menu.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-es-topic]");
      if (!btn) return;
      close();
      saveTopic(btn.dataset.esTopic);
      renderGames();
      $("#esTopicTrigger")?.focus();
    });
  }

  // A game opened from the games page: its way back leads here.
  function fromGames() {
    try {
      return sessionStorage.getItem(FROM_KEY);
    } catch {
      return null;
    }
  }

  function setFromGames(path) {
    try {
      if (path) sessionStorage.setItem(FROM_KEY, path);
      else sessionStorage.removeItem(FROM_KEY);
    } catch {
      /* the back arrow just goes to the topic */
    }
  }

  function gameBack(e) {
    const from = fromGames();
    if (!from || decodeURIComponent(location.hash.slice(1)) !== from) return false;
    const link = e.target.closest("#engExerciseView a[href]");
    if (!link || link.getAttribute("href") !== `#${from.split("/")[0]}`) return false;
    e.preventDefault();
    setFromGames(null);
    location.hash = "games";
    return true;
  }

  /* ── מה חדש: the newest cards on the home page, every update on #news ── */

  const SHOTS = "/images/news/";
  const HOME_CARDS = 5;

  // Pictures for the cards with no screenshot: a game's icon, or a book.
  const ART = {
    lesson: `<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M60 30c-12-8-28-10-44-8v66c16-2 32 0 44 8 12-8 28-10 44-8V22c-16-2-32 0-44 8z" fill="#fff3a8" stroke="#000" stroke-width="5" stroke-linejoin="round"/><path d="M60 30v66M26 40c8-1 16 0 24 3M26 54c8-1 16 0 24 3M70 43c8-3 16-4 24-3M70 57c8-3 16-4 24-3" fill="none" stroke="#000" stroke-width="4" stroke-linecap="round"/></svg>`,
    abc: `<svg viewBox="0 0 120 120" aria-hidden="true"><rect x="10" y="40" width="48" height="48" rx="6" fill="#ff6b9d" stroke="#000" stroke-width="5"/><rect x="62" y="40" width="48" height="48" rx="6" fill="#00e5cc" stroke="#000" stroke-width="5"/><text x="34" y="65" text-anchor="middle" dominant-baseline="central" font-family="Fredoka, sans-serif" font-weight="700" font-size="32" fill="#fff" stroke="#000" stroke-width="6" paint-order="stroke">A</text><text x="86" y="65" text-anchor="middle" dominant-baseline="central" font-family="Fredoka, sans-serif" font-weight="700" font-size="32" fill="#fff" stroke="#000" stroke-width="6" paint-order="stroke">B</text></svg>`,
  };

  function newsItems() {
    const eng = ENG();
    // As many as the lessons library shows.
    const lessonList = lessonStages();
    const lessons = lessonList.reduce((n, s) => n + s.lessons.length, 0);
    const stages = lessonList.length;
    const topics = eng ? eng.path().reduce((n, s) => n + s.topics.length, 0) : 0;
    const games = GAMES();
    return [
      {
        kind: "site",
        title: "אתר אנגלית משלו",
        lines: ["שיעורים, משחקים ותרגילים", "הכול באנגלית, במקום אחד"],
        art: ART.abc,
        go: { label: "לספריית השיעורים", href: "#lessons" },
      },
      {
        kind: "games",
        title: `${games.length} משחקי אנגלית`,
        lines: ["זיכרון, בלונים, נחש, בינגו ועוד", "בוחרים נושא ומשחקים עם המילים שלו"],
        art: games[0]?.icon || ART.abc,
        go: { label: "למשחקים", href: "#games" },
      },
      {
        kind: "lessons",
        title: `${lessons} שיעורים קצרים`,
        lines: ["מה־ABC ועד קריאת קטע", `${stages} שלבים לפי הסדר`],
        shot: "english-lessons",
        go: { label: "לספריית השיעורים", href: "#lessons" },
      },
      {
        kind: "practice",
        title: "תרגילים לכל נושא",
        lines: [`${topics} נושאים לתרגול`, "כל נושא לפי השיעורים שלו"],
        art: ART.lesson,
        go: { label: "לתרגילים", href: "#practice" },
      },
      {
        kind: "practice",
        title: "מחברת טעויות ומבחני קריאה",
        lines: ["חוזרים על מה שטעינו בו", "ונבחנים על קטע קריאה עם שעון"],
        shot: "mistakes",
        shots: ["mistakes", "reading-exam"],
        go: { label: "לתרגילים", href: "#practice" },
      },
    ];
  }

  const KINDS = [
    { id: "lessons", title: "שיעורים" },
    { id: "games", title: "משחקים" },
    { id: "practice", title: "תרגילים" },
    { id: "site", title: "האתר" },
  ];

  const big = (shot) => `${SHOTS}${shot}.webp`;
  const thumbImg = (shot) => `<img src="${esc(`${SHOTS}${shot}-thumb.webp`)}" alt="" width="240" height="320" loading="lazy" draggable="false" />`;
  const newsLines = (item) => item.lines.map((line) => `<p class="news-text">${esc(line)}</p>`).join("");

  function renderNewsHome(items) {
    const list = $("#esNewsList");
    if (!list) return;
    list.innerHTML = items
      .slice(0, HOME_CARDS)
      .map(
        (item, i) => `
        <li class="news-item es-news-open${i ? "" : " is-active"}" aria-roledescription="slide" tabindex="0">
          <div class="news-body">
            <h3 class="news-title">${esc(item.title)}</h3>
            ${newsLines(item)}
          </div>
          ${item.shot ? `<span class="news-shot">${thumbImg(item.shot)}</span>` : `<span class="news-shot news-shot--art">${item.art}</span>`}
        </li>`
      )
      .join("");
    // A card opens #news, the page with every update.
    list.addEventListener("click", (e) => {
      if (e.target.closest(".es-news-open")) location.hash = "news";
    });
    list.addEventListener("keydown", (e) => {
      if ((e.key === "Enter" || e.key === " ") && e.target.matches(".es-news-open")) {
        e.preventDefault();
        e.target.click();
      }
    });
  }

  function renderNewsPage(items) {
    const feed = $("#esNewsFeed");
    if (!feed) return;
    const shotBtn = (item) =>
      item.shot
        ? `<button type="button" class="news-shot" data-es-shots="${esc((item.shots || [item.shot]).map(big).join(" "))}" aria-label="${esc(`לראות בתמונה: ${item.title}`)}">${thumbImg(item.shot)}</button>`
        : `<span class="news-shot news-shot--art">${item.art}</span>`;
    feed.innerHTML = KINDS.map((kind) => ({ ...kind, items: items.filter((item) => item.kind === kind.id) }))
      .filter((kind) => kind.items.length)
      .map(
        (kind) => `
        <div class="es-news-group">
          <h3 class="eng-group-title eng-path-title">${esc(kind.title)}</h3>
          <ol class="es-news-cards">
            ${kind.items
              .map(
                (item) => `
              <li class="es-news-card">
                <div class="news-body">
                  <h4 class="news-title">${esc(item.title)}</h4>
                  ${newsLines(item)}
                  <div class="es-news-actions"><a class="btn btn-primary btn-candy font-cartoon es-news-go" href="${esc(item.go.href)}">${esc(item.go.label)}</a></div>
                </div>
                ${shotBtn(item)}
              </li>`
              )
              .join("")}
          </ol>
        </div>`
      )
      .join("");

    // A card's picture opens big in the home page's dialog (its close
    // button and backdrop are wired by news-carousel.js).
    feed.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-es-shots]");
      const zoom = $(".news-zoom");
      if (!btn || !zoom) return;
      const shots = btn.dataset.esShots.split(/\s+/);
      const title = btn.closest(".es-news-card")?.querySelector(".news-title")?.textContent || "";
      const img = $(".news-zoom-img", zoom);
      $(".news-zoom-key", zoom).textContent = title;
      $(".news-zoom-nav", zoom).hidden = true;
      img.src = shots[0];
      img.alt = title;
      zoom.showModal();
    });
  }

  /* ── Wiring ── */

  function setMenu(open) {
    $("#esMenu")?.classList.toggle("open", open);
    $("#esMenuToggle")?.classList.toggle("open", open);
    $("#esMenuToggle")?.setAttribute("aria-expanded", open ? "true" : "false");
    document.documentElement.classList.toggle("es-menu-open", open);
  }

  function bind() {
    $("#esMenuToggle")?.addEventListener("click", () => setMenu(!$("#esMenu")?.classList.contains("open")));
    // Any choice in the menu (a part, the Pleyi link, sign-in) closes it.
    $("#esMenu")?.addEventListener("click", (e) => {
      if (e.target.closest("a, button")) setMenu(false);
    });

    document.addEventListener("click", (e) => {
      if (barBack(e) || gameBack(e)) return;
      const lessonBtn = e.target.closest("[data-es-lesson]");
      if (lessonBtn) return openLesson(lessonBtn.dataset.esLesson);
      const gameLink = e.target.closest("[data-es-game]");
      if (gameLink) setFromGames(gameLink.dataset.esGame);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && $("#esMenu")?.classList.contains("open")) setMenu(false);
    });
    // After the engine's own hashchange (english-learning.js binds first).
    // The phone's back button changes the page too: the menu closes.
    addEventListener("hashchange", () => {
      setMenu(false);
      showPage();
      // Leaving the game for anywhere but the games page forgets the way back.
      const from = fromGames();
      if (from && decodeURIComponent(location.hash.slice(1)) !== from) setFromGames(null);
    });
  }

  function init() {
    background();
    splitTitle();
    addBuddy();
    bindTitle();
    const art = $("#esHeroArt");
    if (art) {
      art.innerHTML = heroBlocks();
      bindBlocks(art);
    }
    showPage();
    renderLessons();
    bindLessonCards();
    renderGames();
    bind();
  }

  // מה חדש now, before news-carousel.js (the next script) looks for its
  // cards; the rest once the page and the engine are ready.
  const news = newsItems();
  renderNewsHome(news);
  renderNewsPage(news);

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
