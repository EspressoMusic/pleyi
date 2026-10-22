/* Learn English — vocabulary games for the picture-vocabulary topics (the
   "vocab" group and the basic "vocabulary" topic). english-learning.js lists
   them on the topic page and runs them in the fixed exercise screen at
   "#<topic>/game-<id>"; the games themselves live here.

   EnglishGames.list            — [{ id, title, titleEn, desc, descEn, icon }]
   EnglishGames.usable(words)   — the words a game may show (no pictures of
                                  girls or women); a topic needs MIN_WORDS.
   EnglishGames.bestText(topicId, gameId) — "Your record: …" or "".
   EnglishGames.start(gameId, ctx) → { stop(), relabel() }
     ctx: { topic, words: [{ word, en, he, img }], shell(inner, hud),
            speak(text), canSpeak(), sfx(name), homeworkHtml(), copyLink(),
            record(activity), icons: { listen, star, link },
            backToLesson — set when the game was opened from a lesson's
            games slide; the results then lead back there }

   Every game opens on a how-to screen with a start button, so timers only
   run once the student is ready, and ends on a results screen with stars,
   the score, the personal record and the words worth going over again. */

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const BEST_KEY = "pleyi-english-game-best";
  const MIN_WORDS = 4;
  // These pictures show a girl or a woman, and the games show pictures only.
  const SKIP_PICTURES = new Set(["mother", "sister", "grandmother", "family", "hair"]);

  const ICONS = {
    memory: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="6" width="10" height="14" rx="2"/><path d="M8.5 4.6 9 4a2 2 0 0 1 1.6-.6l8.4.9a2 2 0 0 1 1.8 2.2l-1.2 11.2a2 2 0 0 1-2.2 1.8l-2.4-.3"/><path d="M5.9 11a1.7 1.7 0 1 1 2.4 1.5c-.5.3-.8.7-.8 1.2v.3"/><circle cx="7.5" cy="16.6" r=".6" fill="currentColor"/></svg>`,
    speed: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="13.5" r="8"/><path d="M12 9.5v4l2.6 2.2M9.5 2.5h5M12 2.5v3M19.4 5.6l1.4 1.4"/></svg>`,
    balloons: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.5c-3.7 0-6.5 2.9-6.5 6.7 0 4.2 3.3 7.7 6.5 7.7s6.5-3.5 6.5-7.7c0-3.8-2.8-6.7-6.5-6.7Z"/><path d="m10.8 16.8-.9 1.6h4.2l-.9-1.6"/><path d="M12 18.4c0 1.7-1.6 1.9-1.6 3.4"/><path d="M8.8 7.4a3.6 3.6 0 0 1 2.4-2"/></svg>`,
    scramble: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="9" width="6" height="7" rx="1.5"/><rect x="9" y="5" width="6" height="7" rx="1.5"/><rect x="16" y="11" width="6" height="7" rx="1.5"/><path d="M4 20.5c2.5 1 5 1 7.5 0M11 3.2c-1.8-.9-4-.6-5.5.8"/></svg>`,
    heart: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.6s-8-4.8-8-10.5a4.4 4.4 0 0 1 8-2.6 4.4 4.4 0 0 1 8 2.6c0 5.7-8 10.5-8 10.5Z"/></svg>`,
    moves: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 11.5a8 8 0 0 1 13.6-5.2L20 8.6M20 3.5v5.1h-5.1"/><path d="M20 12.5a8 8 0 0 1-13.6 5.2L4 15.4M4 20.5v-5.1h5.1"/></svg>`,
    hint: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3Z"/></svg>`,
    trophy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 4h10v5a5 5 0 0 1-10 0V4Z"/><path d="M7 6H4v1.5A3.5 3.5 0 0 0 7.5 11M17 6h3v1.5a3.5 3.5 0 0 1-3.5 3.5M12 14v3.5M8 21h8M9.5 17.5h5l.5 3.5H9l.5-3.5Z"/></svg>`,
    question: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8.8 8.6a3.3 3.3 0 1 1 4.6 3c-.9.4-1.4 1.2-1.4 2.2v.7"/><circle cx="12" cy="18.3" r="1.2" fill="currentColor" stroke="none"/></svg>`,
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5L20 7"/></svg>`,
    cross: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>`,
  };

  const STR = {
    he: {
      start: "מתחילים!",
      again: "משחק נוסף",
      backToTopic: "חזרה לנושא",
      backToLesson: "חזרה לשיעור",
      copyLink: "העתקת קישור למשחק",
      newBest: "שיא חדש!",
      bestLine: (v) => `השיא שלך: ${v}`,
      points: (n) => (n === 1 ? "נקודה אחת" : `${n} נקודות`),
      movesCount: (n) => (n === 1 ? "תור אחד" : `${n} תורות`),
      pointsLabel: "נקודות",
      movesLabel: "תורות",
      hudMoves: "תורות",
      hudPairs: "זוגות",
      hudTime: "זמן",
      hudScore: "נקודות",
      hudWord: "מילה",
      hudLives: (n) => `נשארו ${n} לבבות`,
      perfect: "מושלם! אתם אלופים!",
      great: "כל הכבוד!",
      good: "יפה מאוד! עוד קצת ותשברו את השיא.",
      keepGoing: "תרגול עושה מושלם — נסו שוב!",
      reviewTitle: "מילים לחזור עליהן (לחצו כדי לשמוע)",
      speakWord: (w) => `השמע: ${w}`,

      memoryHow: "כל הקלפים הפוכים. הופכים שני קלפים: אם המילה מתאימה לתמונה — הם נשארים פתוחים. מצאו את כל הזוגות בכמה שפחות תורות!",
      memoryCard: (n) => `קלף ${n}`,
      memoryResult: (time) => `סיימתם בזמן ${time}`,

      speedHow: "מופיעה תמונה — בוחרים מהר את המילה הנכונה. יש לכם 60 שניות. כל טעות מורידה 3 שניות, וכל 5 תשובות נכונות ברצף מוסיפות 5 שניות!",
      plusTime: (n) => `רצף! +${n} שניות`,
      minusTime: (n) => `−${n} שניות`,
      timeUp: "נגמר הזמן!",
      speedResult: (right, wrong) =>
        `${right === 1 ? "תשובה נכונה אחת" : `${right} תשובות נכונות`} · ${wrong === 0 ? "בלי טעויות" : wrong === 1 ? "טעות אחת" : `${wrong} טעויות`}`,

      balloonsHow: "למעלה כתובה מילה באנגלית, ואפשר גם לשמוע אותה. פוצצו את הבלון עם התמונה שלה לפני שהוא עף! טעות או בלון שברח מורידים לב — ויש לכם 3. הבלונים עפים מהר יותר ככל שמצליחים.",
      popThis: "פוצצו את:",
      sayTarget: "השמעת המילה",
      escaped: (w) => `הבלון ברח! זה היה ${w}`,
      wrongPop: (en, he) => `זה ${en} — ${he}`,
      outOfLives: "נגמרו הלבבות!",
      balloonsResult: (n) => (n === 1 ? "פוצצתם בלון אחד" : `פוצצתם ${n} בלונים`),

      scrambleHow: "סדרו את האותיות וכתבו באנגלית את המילה שבתמונה. לוחצים על האותיות לפי הסדר, ולחיצה על אות שכבר הונחה מחזירה אותה. נתקעתם? כפתור הרמז מגלה אות — אבל מוריד נקודות.",
      hint: "רמז",
      tryAgain: "כמעט! נסו שוב",
      slotLabel: (n) => `אות ${n}`,
      scrambleResult: (clean, total) => `${clean} מתוך ${total} מילים בלי עזרה`,
    },
    en: {
      start: "Start!",
      again: "Play again",
      backToTopic: "Back to topic",
      backToLesson: "Back to the lesson",
      copyLink: "Copy a link to this game",
      newBest: "New record!",
      bestLine: (v) => `Your record: ${v}`,
      points: (n) => (n === 1 ? "1 point" : `${n} points`),
      movesCount: (n) => (n === 1 ? "1 move" : `${n} moves`),
      pointsLabel: "Points",
      movesLabel: "Moves",
      hudMoves: "Moves",
      hudPairs: "Pairs",
      hudTime: "Time",
      hudScore: "Points",
      hudWord: "Word",
      hudLives: (n) => `${n} hearts left`,
      perfect: "Perfect! You're a champion!",
      great: "Well done!",
      good: "Very nice! A little more and you'll break your record.",
      keepGoing: "Practice makes perfect — try again!",
      reviewTitle: "Words to go over (click to hear them)",
      speakWord: (w) => `Play: ${w}`,

      memoryHow: "All the cards are face down. Flip two cards: if the word matches the picture, they stay open. Find all the pairs in as few moves as you can!",
      memoryCard: (n) => `Card ${n}`,
      memoryResult: (time) => `Finished in ${time}`,

      speedHow: "A picture appears — quickly choose the right word. You have 60 seconds. Every mistake takes away 3 seconds, and every 5 right answers in a row add 5 seconds!",
      plusTime: (n) => `Streak! +${n} seconds`,
      minusTime: (n) => `−${n} seconds`,
      timeUp: "Time's up!",
      speedResult: (right, wrong) => `${right} right · ${wrong === 0 ? "no mistakes" : wrong === 1 ? "1 mistake" : `${wrong} mistakes`}`,

      balloonsHow: "An English word is written at the top, and you can hear it too. Pop the balloon with its picture before it flies away! A mistake or a balloon that gets away costs a heart — and you have 3. The balloons fly faster as you succeed.",
      popThis: "Pop the:",
      sayTarget: "Play the word",
      escaped: (w) => `It got away! That was ${w}`,
      wrongPop: (en) => `That's ${en}`,
      outOfLives: "No hearts left!",
      balloonsResult: (n) => (n === 1 ? "You popped 1 balloon" : `You popped ${n} balloons`),

      scrambleHow: "Put the letters in order to spell the English word for the picture. Click the letters in order; clicking a letter you already placed sends it back. Stuck? The hint button shows a letter — but costs points.",
      hint: "Hint",
      tryAgain: "Almost! Try again",
      slotLabel: (n) => `Letter ${n}`,
      scrambleResult: (clean, total) => `${clean} of ${total} words without help`,
    },
  };

  function lang() {
    return window.I18n?.lang === "en" ? "en" : "he";
  }

  function T(key, ...args) {
    const val = STR[lang()][key] ?? STR.he[key];
    return typeof val === "function" ? val(...args) : val;
  }

  function loc(obj, field) {
    return (lang() === "en" && obj[`${field}En`]) || obj[field] || "";
  }

  function esc(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function shuffle(list) {
    const a = [...list];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pickOne(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function clockText(sec) {
    return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
  }

  /* ── Records (this device only) ── */

  function readBest() {
    try {
      return JSON.parse(localStorage.getItem(BEST_KEY)) || {};
    } catch {
      return {};
    }
  }

  // Returns true when `value` is a new record.
  function saveBest(key, value, lowerIsBetter) {
    const all = readBest();
    const prev = all[key];
    if (prev != null && (lowerIsBetter ? prev <= value : prev >= value)) return false;
    all[key] = value;
    try {
      localStorage.setItem(BEST_KEY, JSON.stringify(all));
    } catch {
      /* ignore */
    }
    return true;
  }

  /* ── Header pills (score, time, moves…) ── */

  function pillHtml(id, icon, label, value) {
    return `<span class="eng-hud-pill" id="${id}" title="${esc(label)}">${icon}<span class="eng-hud-label">${esc(label)}</span><b class="eng-hud-value">${esc(value)}</b></span>`;
  }

  function setPill(id, value) {
    const el = $(`#${id} .eng-hud-value`);
    if (el) el.textContent = value;
  }

  function bumpPill(id, cls = "is-bumped") {
    const el = $(`#${id}`);
    if (!el) return;
    el.classList.remove("is-bumped", "is-hit");
    void el.offsetWidth;
    el.classList.add(cls);
  }

  function flash(html, kind = "") {
    const box = $("#engGameFlash");
    if (!box) return;
    const icon = kind === "right" ? ICONS.check : kind === "wrong" ? ICONS.cross : "";
    box.innerHTML = `<span class="eng-game-flash-msg${kind ? ` is-${kind}` : ""}">${icon}<span>${html}</span></span>`;
  }

  /* ── One game session: timers, frames and listeners that `stop()` (leaving
     the screen) or the next phase clear in one go. ── */

  function createRun(game, ctx) {
    const timers = new Set();
    let raf = 0;
    let offs = [];
    const run = {
      game,
      ctx,
      words: ctx.words,
      key: `${ctx.topic.id}/${game.id}`,
      phase: "intro",
      stopped: false,
      result: null,
      startedAt: 0,
      later(fn, ms) {
        const id = setTimeout(() => {
          timers.delete(id);
          if (!run.stopped) fn();
        }, ms);
        timers.add(id);
        return id;
      },
      cancel(id) {
        clearTimeout(id);
        timers.delete(id);
      },
      frame(fn) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame((ts) => {
          if (!run.stopped) fn(ts);
        });
      },
      on(target, type, fn, opts) {
        target.addEventListener(type, fn, opts);
        offs.push(() => target.removeEventListener(type, fn, opts));
      },
      observe(el, fn) {
        if (!window.ResizeObserver) {
          run.on(window, "resize", fn);
          return;
        }
        const ro = new ResizeObserver(() => fn());
        ro.observe(el);
        offs.push(() => ro.disconnect());
      },
      clear() {
        timers.forEach((id) => clearTimeout(id));
        timers.clear();
        cancelAnimationFrame(raf);
        offs.forEach((off) => off());
        offs = [];
      },
      stop() {
        run.stopped = true;
        run.clear();
      },
      shell(inner, hud = "") {
        return ctx.shell(inner, hud);
      },
      sfx(name) {
        ctx.sfx?.(name);
      },
      speak(text) {
        ctx.speak?.(text);
      },
    };
    return run;
  }

  function speakBtnHtml(run, text, id = "", extraClass = "") {
    if (!run.ctx.canSpeak?.()) return "";
    return `<button type="button" class="eng-speak ${extraClass}"${id ? ` id="${id}"` : ""} data-say="${esc(text)}" aria-label="${esc(T("speakWord", text))}">${run.ctx.icons.listen}</button>`;
  }

  /* ── How-to screen ── */

  function showIntro(run) {
    run.clear();
    run.phase = "intro";
    const { game } = run;
    const best = bestText(run.ctx.topic.id, game.id);
    run.shell(`
      <div class="eng-game-intro">
        <span class="eng-game-badge eng-game-badge--${game.id}">${game.icon}</span>
        <p class="eng-game-howto">${esc(T(`${game.id}How`))}</p>
        ${best ? `<p class="eng-game-best">${ICONS.trophy}<span>${esc(best)}</span></p>` : ""}
        <button type="button" class="btn btn-primary btn-candy font-cartoon eng-game-start" id="engGameStart">${esc(T("start"))}</button>
      </div>`);
    // Pictures load while the student reads the how-to.
    run.words.forEach((w) => {
      const img = new Image();
      img.src = w.img;
    });
    const btn = $("#engGameStart");
    btn.addEventListener("click", () => begin(run));
    btn.focus({ preventScroll: true });
  }

  function begin(run) {
    run.clear();
    run.phase = "play";
    run.result = null;
    run.startedAt = Date.now();
    run.game.play(run);
  }

  /* ── Results screen ──
     r: { value, label, detail, stars, review: [words], recordScore } */

  function finish(run, r) {
    run.clear();
    run.phase = "results";
    const { game, ctx } = run;
    r.isBest = saveBest(run.key, r.value, !!game.lowerIsBetter);
    run.result = r;
    ctx.record?.({
      kind: "game",
      gameId: run.key,
      gameTitle: `${game.title} · ${ctx.topic.title}`,
      score: r.recordScore ?? r.value,
      durationSec: Math.round((Date.now() - run.startedAt) / 1000),
    });
    run.sfx("finish");
    renderResults(run);
  }

  function renderResults(run) {
    const r = run.result;
    const { game, ctx } = run;
    const message = r.stars === 3 ? T("perfect") : r.stars === 2 ? T("great") : r.stars === 1 ? T("good") : T("keepGoing");
    const best = bestText(ctx.topic.id, game.id);
    const review = (r.review || []).slice(0, 8);
    const reviewHtml = review.length
      ? `<div class="eng-game-review">
          <h3>${esc(T("reviewTitle"))}</h3>
          <ul>${review
            .map(
              (w) => `
            <li><button type="button" class="eng-game-chip" data-say="${esc(w.en)}">
              <img src="${esc(w.img)}" alt="" draggable="false" />
              <span class="eng-game-chip-en" dir="ltr">${esc(w.en)}</span>
              <span class="eng-game-chip-he">${esc(w.he)}</span>
            </button></li>`
            )
            .join("")}</ul>
        </div>`
      : "";
    run.shell(`
      <div class="eng-results eng-game-results">
        <div class="eng-stars" aria-hidden="true">
          ${[1, 2, 3].map((n) => `<span class="eng-star${n <= r.stars ? " is-on" : ""}">${ctx.icons.star}</span>`).join("")}
        </div>
        <div class="eng-grade">
          <span class="eng-grade-label">${esc(T(r.label))}</span>
          <p class="eng-score font-cartoon">${esc(r.value)}</p>
        </div>
        ${
          r.isBest
            ? `<p class="eng-game-best is-new">${ICONS.trophy}<span>${esc(T("newBest"))}</span></p>`
            : best
              ? `<p class="eng-game-best">${ICONS.trophy}<span>${esc(best)}</span></p>`
              : ""
        }
        <p class="eng-results-count">${esc(r.detail)}</p>
        <p class="eng-results-msg">${esc(message)}</p>
        <div class="eng-results-actions">
          <button type="button" class="btn btn-primary btn-candy font-cartoon" id="engGameAgain">${esc(T("again"))}</button>
          ${
            ctx.backToLesson
              ? `<button type="button" class="btn btn-candy font-cartoon eng-btn-secondary" id="engGameToLesson">${esc(T("backToLesson"))}</button>`
              : `<a class="btn btn-candy font-cartoon eng-btn-secondary" href="#${esc(ctx.topic.id)}">${esc(T("backToTopic"))}</a>`
          }
          ${ctx.homeworkHtml?.() || ""}
        </div>
        ${reviewHtml}
        <button type="button" class="eng-copy-link" id="engGameCopy">${ctx.icons.link}<span>${esc(T("copyLink"))}</span></button>
      </div>`);
    $("#engGameAgain").addEventListener("click", () => begin(run));
    $("#engGameToLesson")?.addEventListener("click", () => ctx.backToLesson());
    $("#engGameCopy").addEventListener("click", () => ctx.copyLink?.());
    $$(".eng-game-chip").forEach((chip) => chip.addEventListener("click", () => run.speak(chip.dataset.say)));
  }

  /* ── Lays a grid of `count` square cells out to fill `stage`: tries every
     column count and keeps the one with the biggest cells. ── */

  function fitGrid(run, stage, board, count, maxCell) {
    const apply = () => {
      const W = stage.clientWidth;
      const H = stage.clientHeight;
      if (!W || !H) return;
      const gap = Math.min(W, H) < 420 ? 8 : 12;
      let best = { rank: 0, cell: 0, cols: count };
      for (let cols = 1; cols <= count; cols++) {
        const rows = Math.ceil(count / cols);
        const cell = Math.min((W - gap * (cols - 1)) / cols, (H - gap * (rows - 1)) / rows);
        // An uneven last row looks messy — prefer layouts without one.
        const rank = cell * (count % cols === 0 ? 1 : 0.94);
        if (rank > best.rank) best = { rank, cell, cols };
      }
      board.style.setProperty("--cols", best.cols);
      board.style.setProperty("--cell", `${Math.floor(Math.min(best.cell, maxCell))}px`);
      board.style.setProperty("--gap", `${gap}px`);
    };
    apply();
    run.observe(stage, apply);
  }

  /* ════════ Game 1: Memory — find each word and its picture ════════ */

  function playMemory(run) {
    const chosen = shuffle(run.words).slice(0, Math.min(6, run.words.length));
    const cards = shuffle(chosen.flatMap((w) => [{ w, kind: "img" }, { w, kind: "word" }]));
    const st = { open: [], found: 0, moves: 0, closeTimer: 0, pairs: chosen.length };

    const cardHtml = (c, i) => {
      const longest = Math.max(...c.w.en.split(/\s+/).map((part) => part.length));
      const front =
        c.kind === "img"
          ? `<img src="${esc(c.w.img)}" alt="" draggable="false" />`
          : `<span class="eng-mem-word" lang="en" dir="ltr" style="--len:${Math.max(4, longest)}">${esc(c.w.en)}</span>`;
      return `
        <button type="button" class="eng-mem-card" data-i="${i}" aria-label="${esc(T("memoryCard", i + 1))}">
          <span class="eng-mem-inner">
            <span class="eng-mem-face eng-mem-back">${ICONS.question}</span>
            <span class="eng-mem-face eng-mem-front">${front}</span>
          </span>
        </button>`;
    };

    run.shell(
      `
      <div class="eng-game-stage" id="engGameStage">
        <div class="eng-mem-board" id="engMemBoard" dir="ltr">${cards.map(cardHtml).join("")}</div>
      </div>
      <div class="eng-game-flash" id="engGameFlash" aria-live="polite"></div>`,
      pillHtml("engHudMoves", ICONS.moves, T("hudMoves"), 0) + pillHtml("engHudPairs", ICONS.memory, T("hudPairs"), `0/${st.pairs}`)
    );

    const cardEl = (i) => $(`.eng-mem-card[data-i="${i}"]`);
    fitGrid(run, $("#engGameStage"), $("#engMemBoard"), cards.length, 170);

    function closeOpen() {
      run.cancel(st.closeTimer);
      st.open.forEach((i) => {
        cards[i].open = false;
        const el = cardEl(i);
        el.classList.remove("is-open", "is-miss");
        el.setAttribute("aria-label", T("memoryCard", i + 1));
      });
      st.open = [];
    }

    function flip(i) {
      const card = cards[i];
      // A wrong pair still showing closes right away when the next card is
      // picked — which may be one of those two.
      if (st.open.length === 2) closeOpen();
      if (card.done || card.open) return;
      card.open = true;
      const el = cardEl(i);
      el.classList.add("is-open");
      el.setAttribute("aria-label", card.kind === "img" ? card.w.he : card.w.en);
      run.sfx("flip");
      st.open.push(i);
      if (st.open.length < 2) return;

      st.moves++;
      setPill("engHudMoves", st.moves);
      const [a, b] = st.open.map((j) => cards[j]);
      if (a.w.word === b.w.word) {
        st.open.forEach((j) => {
          cards[j].done = true;
          cardEl(j).classList.add("is-matched");
          cardEl(j).disabled = true;
        });
        st.open = [];
        st.found++;
        setPill("engHudPairs", `${st.found}/${st.pairs}`);
        bumpPill("engHudPairs");
        run.sfx("right");
        run.speak(a.w.en);
        flash(`<bdi dir="ltr">${esc(a.w.en)}</bdi> — ${esc(a.w.he)}`, "right");
        if (st.found === st.pairs) run.later(done, 1100);
      } else {
        st.open.forEach((j) => cardEl(j).classList.add("is-miss"));
        st.closeTimer = run.later(closeOpen, 1200);
      }
    }

    function done() {
      const sec = Math.round((Date.now() - run.startedAt) / 1000);
      const { moves, pairs } = st;
      finish(run, {
        value: moves,
        label: "movesLabel",
        detail: T("memoryResult", clockText(sec)),
        stars: moves <= pairs * 1.5 ? 3 : moves <= pairs * 2.25 ? 2 : 1,
        recordScore: T("movesCount", moves),
      });
    }

    $$(".eng-mem-card").forEach((btn) => btn.addEventListener("click", () => flip(Number(btn.dataset.i))));
  }

  /* ════════ Game 2: Beat the clock — name as many pictures as you can ════════ */

  function playSpeed(run) {
    const DURATION = 60000;
    const st = { score: 0, wrong: 0, streak: 0, endAt: performance.now() + DURATION, q: null, locked: false, over: false, missed: new Map(), hiddenLeft: null };

    run.shell(
      `
      <div class="eng-time-bar" aria-hidden="true"><span class="eng-time-fill" id="engTimeFill"></span></div>
      <div class="eng-game-stage eng-speed-stage" id="engGameStage">
        <img class="eng-speed-img" id="engSpeedImg" alt="" draggable="false" />
      </div>
      <div class="eng-speed-options" id="engSpeedOptions" dir="ltr"></div>
      <div class="eng-game-flash" id="engGameFlash" aria-live="polite"></div>`,
      pillHtml("engHudTime", ICONS.speed, T("hudTime"), 60) + pillHtml("engHudScore", run.ctx.icons.star, T("hudScore"), 0)
    );

    const img = $("#engSpeedImg");
    const optionsBox = $("#engSpeedOptions");
    const fill = $("#engTimeFill");

    function next() {
      if (st.over) return;
      const q = pickOne(run.words.filter((w) => w.word !== st.q?.word));
      st.q = q;
      st.locked = false;
      const options = shuffle([q, ...shuffle(run.words.filter((w) => w.word !== q.word)).slice(0, 3)]);
      img.src = q.img;
      img.classList.remove("is-in");
      void img.offsetWidth;
      img.classList.add("is-in");
      optionsBox.innerHTML = options
        .map(
          (o, i) =>
            `<button type="button" class="eng-option eng-speed-option" data-word="${esc(o.word)}"><span class="eng-option-key">${i + 1}</span>${esc(o.en)}</button>`
        )
        .join("");
      $$(".eng-speed-option", optionsBox).forEach((btn) => btn.addEventListener("click", () => answer(btn)));
    }

    function answer(btn) {
      if (st.locked || st.over) return;
      st.locked = true;
      const q = st.q;
      $$(".eng-speed-option", optionsBox).forEach((b) => {
        b.disabled = true;
        if (b.dataset.word === q.word) b.classList.add("is-right");
      });
      if (btn.dataset.word === q.word) {
        st.score++;
        st.streak++;
        setPill("engHudScore", st.score);
        bumpPill("engHudScore");
        run.sfx("right");
        if (st.streak % 5 === 0) {
          st.endAt += 5000;
          bumpPill("engHudTime");
          flash(esc(T("plusTime", 5)), "right");
        } else {
          flash(`<bdi dir="ltr">${esc(q.en)}</bdi> — ${esc(q.he)}`, "right");
        }
        run.later(next, 420);
      } else {
        st.wrong++;
        st.streak = 0;
        st.endAt -= 3000;
        st.missed.set(q.word, q);
        btn.classList.add("is-wrong");
        bumpPill("engHudTime", "is-hit");
        run.sfx("wrong");
        flash(`${esc(T("minusTime", 3))} · <bdi dir="ltr">${esc(q.en)}</bdi> — ${esc(q.he)}`, "wrong");
        run.later(next, 1150);
      }
    }

    let shownSec = 60;
    function loop() {
      if (st.over) return;
      const left = Math.max(0, st.endAt - performance.now());
      fill.style.transform = `scaleX(${Math.min(1, left / DURATION)})`;
      const sec = Math.ceil(left / 1000);
      if (sec !== shownSec) {
        shownSec = sec;
        setPill("engHudTime", sec);
        $("#engHudTime")?.classList.toggle("is-low", sec <= 10);
        fill.classList.toggle("is-low", sec <= 10);
      }
      if (left <= 0) {
        end();
        return;
      }
      run.frame(loop);
    }

    function end() {
      st.over = true;
      $$(".eng-speed-option", optionsBox).forEach((b) => (b.disabled = true));
      flash(esc(T("timeUp")));
      run.later(() => {
        const { score, wrong } = st;
        finish(run, {
          value: score,
          label: "pointsLabel",
          detail: T("speedResult", score, wrong),
          stars: score >= 20 ? 3 : score >= 12 ? 2 : score >= 5 ? 1 : 0,
          review: [...st.missed.values()],
        });
      }, 1000);
    }

    // The clock stops while the tab is hidden.
    run.on(document, "visibilitychange", () => {
      if (st.over) return;
      if (document.hidden) {
        st.hiddenLeft = st.endAt - performance.now();
      } else if (st.hiddenLeft != null) {
        st.endAt = performance.now() + st.hiddenLeft;
        st.hiddenLeft = null;
        run.frame(loop);
      }
    });
    run.on(document, "keydown", (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey || !/^[1-4]$/.test(e.key)) return;
      const btn = $$(".eng-speed-option", optionsBox)[Number(e.key) - 1];
      if (btn && !btn.disabled) {
        e.preventDefault();
        btn.click();
      }
    });

    next();
    run.frame(loop);
  }

  /* ════════ Game 3: Balloon pop — pop the balloon with the word's picture ════════ */

  function playBalloons(run) {
    const LIVES = 3;
    const st = { score: 0, lives: LIVES, balloons: [], target: null, lastTs: 0, spawnIn: 0, over: false, missed: new Map(), color: 0 };

    const heartsHtml = () =>
      `<span class="eng-hud-pill eng-hud-hearts" id="engHudLives" role="img" aria-label="${esc(T("hudLives", st.lives))}">${Array.from(
        { length: LIVES },
        (_, i) => `<span class="eng-heart${i < st.lives ? " is-on" : ""}">${ICONS.heart}</span>`
      ).join("")}</span>`;

    run.shell(
      `
      <div class="eng-balloon-target">
        <span class="eng-balloon-target-label">${esc(T("popThis"))}</span>
        <span class="eng-balloon-word" id="engBalloonWord" dir="ltr"></span>
        ${run.ctx.canSpeak?.() ? `<button type="button" class="eng-speak" id="engBalloonSay" aria-label="${esc(T("sayTarget"))}">${run.ctx.icons.listen}</button>` : ""}
      </div>
      <div class="eng-game-stage eng-balloon-sky" id="engGameStage">
        <span class="eng-cloud eng-cloud--1" aria-hidden="true"></span>
        <span class="eng-cloud eng-cloud--2" aria-hidden="true"></span>
        <div class="eng-game-flash eng-balloon-flash" id="engGameFlash" aria-live="polite"></div>
      </div>`,
      heartsHtml() + pillHtml("engHudScore", run.ctx.icons.star, T("hudScore"), 0)
    );

    const sky = $("#engGameStage");
    const wordEl = $("#engBalloonWord");

    const balloonSize = () => Math.round(Math.max(66, Math.min(126, sky.clientWidth / 3.7, sky.clientHeight / 3.3)));
    // Seconds a balloon takes to cross the sky — shorter as the score grows.
    const travelSec = () => Math.max(3.6, 8 - st.score * 0.2);
    // Balloons still in play (a wrongly clicked one keeps floating, disabled).
    const live = () => st.balloons.filter((b) => !b.gone && !b.hit);
    const targetInSky = () => live().some((b) => b.word.word === st.target.word);

    function newTarget() {
      st.target = pickOne(run.words.filter((w) => w.word !== st.target?.word));
      wordEl.textContent = st.target.en;
      wordEl.classList.remove("is-in");
      void wordEl.offsetWidth;
      wordEl.classList.add("is-in");
      run.later(() => run.speak(st.target.en), 250);
      // Send its balloon up soon when none is in the sky yet.
      if (!targetInSky()) st.spawnIn = Math.min(st.spawnIn, 0.15);
    }

    function spawn() {
      const W = sky.clientWidth;
      const H = sky.clientHeight;
      if (!W || !H) return false;
      const s = balloonSize();
      const h = s * 1.55;
      const lanes = Math.max(2, Math.min(5, Math.floor(W / (s * 1.15))));
      const laneW = W / lanes;
      // A lane is free once its last balloon has floated clear of the bottom.
      const busy = new Set(st.balloons.filter((b) => !b.removed && b.y > H - h * 1.05).map((b) => b.lane));
      const free = [...Array(lanes).keys()].filter((l) => !busy.has(l));
      if (!free.length) return false;
      const lane = pickOne(free);

      let word;
      if (!targetInSky()) {
        word = st.target;
      } else {
        const inSky = new Set(live().map((b) => b.word.word));
        const others = run.words.filter((w) => w.word !== st.target.word);
        const fresh = others.filter((w) => !inSky.has(w.word));
        word = pickOne(fresh.length ? fresh : others);
      }

      const el = document.createElement("button");
      el.type = "button";
      el.className = `eng-balloon eng-balloon--c${st.color++ % 6}`;
      el.style.setProperty("--size", `${s}px`);
      el.setAttribute("aria-label", word.he);
      el.innerHTML = `<span class="eng-balloon-body"><img src="${esc(word.img)}" alt="" draggable="false" /></span><span class="eng-balloon-string"></span>`;
      const x = lane * laneW + (laneW - s) / 2 + (Math.random() - 0.5) * Math.max(0, laneW - s) * 0.6;
      const b = { el, word, lane, x, y: H + 4, s, h, speed: (H + h) / travelSec(), phase: Math.random() * Math.PI * 2, gone: false, removed: false };
      el.style.transform = `translate3d(${x}px, ${b.y}px, 0)`;
      sky.appendChild(el);
      st.balloons.push(b);
      return true;
    }

    function remove(b) {
      b.gone = true;
      b.removed = true;
      b.el.remove();
    }

    function loseLife(messageHtml) {
      st.lives = Math.max(0, st.lives - 1);
      const hearts = $("#engHudLives");
      if (hearts) hearts.outerHTML = heartsHtml();
      bumpPill("engHudLives", "is-hit");
      run.sfx("wrong");
      flash(messageHtml, "wrong");
      if (st.lives === 0) gameOver();
    }

    function hit(el) {
      const b = st.balloons.find((x) => x.el === el);
      if (!b || b.gone || b.hit || st.over) return;
      b.hit = true;
      el.disabled = true;
      if (b.word.word === st.target.word) {
        b.gone = true;
        el.classList.add("is-popped");
        run.later(() => remove(b), 420);
        st.score++;
        setPill("engHudScore", st.score);
        bumpPill("engHudScore");
        run.sfx("pop");
        flash(`<bdi dir="ltr">${esc(b.word.en)}</bdi> — ${esc(b.word.he)}`, "right");
        newTarget();
      } else {
        el.classList.add("is-wrong");
        st.missed.set(st.target.word, st.target);
        loseLife(`<bdi>${esc(T("wrongPop", b.word.en, b.word.he))}</bdi>`);
      }
    }

    function loop(ts) {
      if (st.over) return;
      const dt = st.lastTs ? Math.min(0.05, (ts - st.lastTs) / 1000) : 0;
      st.lastTs = ts;
      st.spawnIn -= dt;
      if (st.spawnIn <= 0) st.spawnIn = spawn() ? Math.max(0.6, travelSec() / 5.5) : 0.2;
      const t = ts / 1000;
      for (const b of st.balloons) {
        if (b.gone) continue;
        b.y -= b.speed * dt;
        const sway = Math.sin(t * 1.6 + b.phase) * b.s * 0.08;
        b.el.style.transform = `translate3d(${b.x + sway}px, ${b.y}px, 0)`;
        if (b.y < -b.h) {
          const wasTarget = !b.hit && b.word.word === st.target.word;
          remove(b);
          if (wasTarget) {
            st.missed.set(b.word.word, b.word);
            loseLife(`${esc(T("escaped", ""))}<bdi dir="ltr">${esc(b.word.en)}</bdi>`);
            if (st.over) return;
            newTarget();
          }
        }
      }
      st.balloons = st.balloons.filter((b) => !b.removed);
      run.frame(loop);
    }

    function gameOver() {
      st.over = true;
      live().forEach((b) => (b.el.disabled = true));
      flash(esc(T("outOfLives")), "wrong");
      run.later(() => {
        const { score } = st;
        finish(run, {
          value: score,
          label: "pointsLabel",
          detail: T("balloonsResult", score),
          stars: score >= 20 ? 3 : score >= 10 ? 2 : score >= 4 ? 1 : 0,
          review: [...st.missed.values()],
        });
      }, 1400);
    }

    // Balloons move, so they react on press rather than on a full click;
    // keyboard presses (click with detail 0) still count.
    sky.addEventListener("pointerdown", (e) => {
      const el = e.target.closest(".eng-balloon");
      if (!el) return;
      e.preventDefault();
      hit(el);
    });
    sky.addEventListener("click", (e) => {
      const el = e.target.closest(".eng-balloon");
      if (el && e.detail === 0) hit(el);
    });
    $("#engBalloonSay")?.addEventListener("click", () => run.speak(st.target.en));
    // Coming back to the tab doesn't jump the balloons forward.
    run.on(document, "visibilitychange", () => {
      if (!document.hidden) st.lastTs = 0;
    });

    newTarget();
    run.frame(loop);
  }

  /* ════════ Game 4: Letter scramble — spell the picture's word with tiles ════════ */

  const isLetter = (ch) => /[A-Za-z]/.test(ch);

  function playScramble(run) {
    const list = shuffle(run.words.filter((w) => [...w.en].filter(isLetter).length >= 2)).slice(0, 8);
    const st = { list, index: 0, score: 0, clean: 0, missed: new Map(), cur: null, max: list.length * 10 };
    const hud = () =>
      pillHtml("engHudWord", ICONS.scramble, T("hudWord"), `${st.index + 1}/${list.length}`) +
      pillHtml("engHudScore", run.ctx.icons.star, T("hudScore"), st.score);

    function renderWord() {
      const w = list[st.index];
      const chars = [...w.en];
      const answer = chars.filter(isLetter);
      // Shuffle until the tiles don't already spell the word.
      let order = shuffle(answer.map((_, k) => k));
      for (let tries = 0; tries < 12 && order.every((k, i) => answer[k].toLowerCase() === answer[i].toLowerCase()); tries++) {
        order = shuffle(order);
      }
      st.cur = {
        w,
        answer,
        tiles: order.map((k) => ({ ch: answer[k], used: false })),
        slots: answer.map(() => null),
        locked: new Set(),
        hints: 0,
        wrongs: 0,
        done: false,
        checking: false,
      };

      let slot = 0;
      const slotsHtml = w.en
        .split(" ")
        .map(
          (part) =>
            `<span class="eng-scr-word">${[...part]
              .map((ch) =>
                isLetter(ch)
                  ? `<button type="button" class="eng-scr-slot" data-s="${slot}" aria-label="${esc(T("slotLabel", ++slot))}"></button>`
                  : `<span class="eng-scr-fixed">${esc(ch)}</span>`
              )
              .join("")}</span>`
        )
        .join("");
      const longest = Math.max(...w.en.split(" ").map((part) => part.length));

      run.shell(
        `
        <div class="eng-game-stage eng-scr-stage" id="engGameStage">
          <img class="eng-scr-img" src="${esc(w.img)}" alt="" draggable="false" />
        </div>
        <p class="eng-scr-he">${esc(w.he)}</p>
        <div class="eng-scr-board" dir="ltr" style="--n:${Math.max(6, longest, Math.ceil(answer.length / 2))}">
          <div class="eng-scr-slots" id="engScrSlots">${slotsHtml}</div>
          <div class="eng-scr-tiles" id="engScrTiles">${st.cur.tiles
            .map((tile, k) => `<button type="button" class="eng-scr-tile" data-k="${k}">${esc(tile.ch)}</button>`)
            .join("")}</div>
        </div>
        <div class="eng-scr-actions">
          <button type="button" class="eng-tool eng-scr-hint" id="engScrHint">${ICONS.hint}<span>${esc(T("hint"))}</span></button>
        </div>
        <div class="eng-game-flash" id="engGameFlash" aria-live="polite"></div>`,
        hud()
      );

      $$(".eng-scr-tile").forEach((btn) => btn.addEventListener("click", () => place(Number(btn.dataset.k))));
      $$(".eng-scr-slot").forEach((btn) => btn.addEventListener("click", () => unplace(Number(btn.dataset.s))));
      $("#engScrHint").addEventListener("click", hint);
    }

    const slotEl = (s) => $(`.eng-scr-slot[data-s="${s}"]`);
    const tileEl = (k) => $(`.eng-scr-tile[data-k="${k}"]`);

    function setSlot(s, k) {
      const cur = st.cur;
      cur.slots[s] = k;
      const el = slotEl(s);
      el.textContent = k == null ? "" : cur.tiles[k].ch;
      el.classList.toggle("is-filled", k != null);
    }

    function place(k, s = st.cur.slots.indexOf(null)) {
      const cur = st.cur;
      if (cur.done || cur.checking || cur.tiles[k].used || s < 0) return;
      cur.tiles[k].used = true;
      tileEl(k).classList.add("is-used");
      tileEl(k).disabled = true;
      setSlot(s, k);
      run.sfx("tick");
      if (!cur.slots.includes(null)) check();
    }

    function unplace(s) {
      const cur = st.cur;
      const k = cur.slots[s];
      if (cur.done || cur.checking || k == null || cur.locked.has(s)) return;
      cur.tiles[k].used = false;
      tileEl(k).classList.remove("is-used");
      tileEl(k).disabled = false;
      setSlot(s, null);
    }

    function returnLoose() {
      st.cur.slots.forEach((k, s) => {
        if (k != null && !st.cur.locked.has(s)) unplace(s);
      });
    }

    function check() {
      const cur = st.cur;
      const word = cur.slots.map((k) => cur.tiles[k].ch).join("");
      if (word.toLowerCase() === cur.answer.join("").toLowerCase()) {
        solved();
        return;
      }
      cur.wrongs++;
      cur.checking = true;
      $$(".eng-scr-slot:not(.is-hint)").forEach((el) => el.classList.add("is-wrong"));
      run.sfx("wrong");
      flash(esc(T("tryAgain")), "wrong");
      run.later(() => {
        cur.checking = false;
        $$(".eng-scr-slot").forEach((el) => el.classList.remove("is-wrong"));
        returnLoose();
      }, 750);
    }

    function hint() {
      const cur = st.cur;
      if (cur.done || cur.checking) return;
      returnLoose();
      const s = cur.slots.indexOf(null);
      if (s < 0) return;
      const need = cur.answer[s].toLowerCase();
      const k = cur.tiles.findIndex((tile) => !tile.used && tile.ch.toLowerCase() === need);
      if (k < 0) return;
      cur.hints++;
      cur.locked.add(s);
      slotEl(s).classList.add("is-hint");
      slotEl(s).disabled = true;
      place(k, s);
    }

    function solved() {
      const cur = st.cur;
      cur.done = true;
      const points = Math.max(0, 10 - 3 * cur.hints - 2 * cur.wrongs);
      st.score += points;
      if (!cur.hints && !cur.wrongs) st.clean++;
      else st.missed.set(cur.w.word, cur.w);
      setPill("engHudScore", st.score);
      bumpPill("engHudScore");
      $$(".eng-scr-slot").forEach((el) => {
        el.classList.add("is-right");
        el.disabled = true;
      });
      $("#engScrHint").disabled = true;
      run.sfx("right");
      run.speak(cur.w.en);
      flash(`<bdi dir="ltr">${esc(cur.w.en)}</bdi> — ${esc(cur.w.he)} · <bdi dir="ltr">+${points}</bdi>`, "right");
      run.later(() => {
        st.index++;
        if (st.index < list.length) {
          renderWord();
          return;
        }
        const ratio = st.max ? st.score / st.max : 0;
        finish(run, {
          value: st.score,
          label: "pointsLabel",
          detail: T("scrambleResult", st.clean, list.length),
          stars: ratio >= 0.9 ? 3 : ratio >= 0.65 ? 2 : ratio >= 0.35 ? 1 : 0,
          review: [...st.missed.values()],
          recordScore: `${st.score}/${st.max}`,
        });
      }, 1500);
    }

    // On a computer the letters can be typed, and Backspace takes one back.
    run.on(document, "keydown", (e) => {
      const cur = st.cur;
      if (!cur || cur.done || cur.checking || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "Backspace") {
        const s = cur.slots.map((k, i) => (k != null && !cur.locked.has(i) ? i : -1)).filter((i) => i >= 0).pop();
        if (s != null) {
          e.preventDefault();
          unplace(s);
        }
        return;
      }
      if (e.key.length !== 1 || !isLetter(e.key)) return;
      const k = cur.tiles.findIndex((tile) => !tile.used && tile.ch.toLowerCase() === e.key.toLowerCase());
      if (k >= 0) {
        e.preventDefault();
        place(k);
      }
    });

    renderWord();
  }

  /* ── Catalog ── */

  const GAMES = [
    {
      id: "memory",
      title: "משחק הזיכרון",
      titleEn: "Memory Game",
      desc: "הופכים קלפים ומוצאים כל מילה עם התמונה שלה",
      descEn: "Flip cards and find each word with its picture",
      icon: ICONS.memory,
      lowerIsBetter: true,
      bestValue: (v) => T("movesCount", v),
      play: playMemory,
    },
    {
      id: "speed",
      title: "מרוץ נגד השעון",
      titleEn: "Beat the Clock",
      desc: "כמה תמונות תזהו ב-60 שניות?",
      descEn: "How many pictures can you name in 60 seconds?",
      icon: ICONS.speed,
      bestValue: (v) => T("points", v),
      play: playSpeed,
    },
    {
      id: "balloons",
      title: "פיצוץ בלונים",
      titleEn: "Balloon Pop",
      desc: "שומעים מילה ומפוצצים את הבלון הנכון — לפני שהוא עף",
      descEn: "Hear a word and pop the right balloon before it flies away",
      icon: ICONS.balloons,
      bestValue: (v) => T("points", v),
      play: playBalloons,
    },
    {
      id: "scramble",
      title: "אותיות מבולבלות",
      titleEn: "Letter Scramble",
      desc: "מסדרים את האותיות וכותבים את המילה שבתמונה",
      descEn: "Unscramble the letters to spell the picture's word",
      icon: ICONS.scramble,
      bestValue: (v) => T("points", v),
      play: playScramble,
    },
  ];

  function find(id) {
    return GAMES.find((g) => g.id === id) || null;
  }

  function bestText(topicId, gameId) {
    const game = find(gameId);
    const value = readBest()[`${topicId}/${gameId}`];
    return game && value != null ? T("bestLine", game.bestValue(value)) : "";
  }

  window.EnglishGames = {
    MIN_WORDS,
    list: GAMES,
    find,
    loc,
    bestText,
    usable(words) {
      return (words || []).filter((w) => w && !SKIP_PICTURES.has(w.word));
    },
    start(gameId, ctx) {
      const game = find(gameId);
      if (!game) return null;
      const run = createRun(game, ctx);
      showIntro(run);
      return {
        game,
        stop: () => run.stop(),
        // A language switch redraws the how-to and results screens; a game in
        // progress keeps going as it is.
        relabel() {
          if (run.stopped) return;
          if (run.phase === "intro") showIntro(run);
          else if (run.phase === "results" && run.result) renderResults(run);
        },
      };
    },
  };
})();
