/* The site's fennec fox — Pleyschool's mascot (site-fox.css).

   - A small fox sits in the bottom corner of every page. Tapping it makes it
     hop and opens the site search (the list comes from /api/search-index,
     lib/site-search.js).
   - On pages with a big hero title, a bigger fox perches on the title, and
     the corner fox waits until the title scrolls out of view.
   - Its eyes follow the mouse. Only the corner fox talks: on the first
     visit it says that it searches, and every so often it says hello.
   - The corner fox steps aside while a dialog, a lesson or an exercise
     screen is open (site-fox.css).
   - The guide: the first time someone opens a part of the site, the fox
     shows it around (PleyiFox.tour). */

(function () {
  const GREETING = "היי! לחצו עליי כדי לחפש באתר";
  const GREETED_KEY = "pleyi-fox-greeted";
  const BUBBLE_MS = 3600;
  const CHAT = "היי, למידה נעימה! אני פה לעזור!";
  const CHAT_FIRST_MS = 20000;
  const CHAT_EVERY_MS = 60000;

  const HEAD = "M60 40C79 40 95 51 95 67C95 81 79 94 60 94C41 94 25 81 25 67C25 51 41 40 60 40Z";
  const BODY = "M60 86C80 86 90 102 90 114C90 122 80 126 60 126C40 126 30 122 30 114C30 102 40 86 60 86Z";
  const EAR_L = "M50 44C42 30 22 13 9 5C6 22 13 45 30 61Z";
  const EAR_R = "M70 44C78 30 98 13 111 5C114 22 107 45 90 61Z";
  const TAIL = "M80 123C100 128 117 116 115 97C114 86 105 82 99 87C104 96 101 108 84 109Z";
  const CAP_BAND = "M44 41V34Q60 29 76 34V41Q60 47 44 41Z";
  const CAP_BOARD = "M60 21L89 30.5L60 40L31 30.5Z";

  // A minimal fox: flat shapes, dot eyes and one thick line everywhere.
  const FOX_SVG = `<svg class="site-fox-svg" viewBox="0 0 120 132" aria-hidden="true" focusable="false">
    <g class="fox-tail">
      <path class="f-body" d="${TAIL}"/>
    </g>
    <g class="fox-ear fox-ear-l">
      <path class="f-body" d="${EAR_L}"/>
    </g>
    <g class="fox-ear fox-ear-r">
      <path class="f-body" d="${EAR_R}"/>
    </g>
    <path class="f-body" d="${BODY}"/>
    <path class="f-body" d="${HEAD}"/>
    <path class="f-cream" d="M60 72C70 72 77 78 80 85C74 91 67 94 60 94C53 94 46 91 40 85C43 78 50 72 60 72Z"/>
    <path class="f-line" d="${HEAD}"/>
    <g class="fox-pupils">
      <g class="fox-eyes">
        <circle class="f-pupil" cx="47" cy="65" r="5.6"/>
        <circle class="f-pupil" cx="73" cy="65" r="5.6"/>
      </g>
    </g>
    <path class="f-nose" d="M54 77Q60 74 66 77Q63.5 83 60 83.5Q56.5 83 54 77Z"/>
    <path class="f-cap" d="${CAP_BAND}"/>
    <path class="f-cap" d="${CAP_BOARD}"/>
  </svg>`;

  const bubbleTimers = new WeakMap();

  function motionOff() {
    return (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.dataset.visual === "minimal"
    );
  }

  function makeFox(tag, kind) {
    const fox = document.createElement(tag);
    fox.className = `site-fox site-fox--${kind}`;
    fox.innerHTML = `<span class="site-fox-fig">${FOX_SVG}</span><span class="site-fox-bubble"></span>`;
    // The foxes on one page don't blink together.
    fox.style.setProperty("--fox-blink-delay", `${(Math.random() * 3).toFixed(2)}s`);
    fox.querySelector(".site-fox-fig").addEventListener("animationend", (e) => {
      if (e.animationName === "site-fox-hop") fox.classList.remove("is-hop");
      if (e.animationName === "site-fox-land") fox.classList.add("is-landed");
    });
    fox.addEventListener("click", () => {
      hop(fox);
      fox.querySelector(".site-fox-bubble").classList.remove("is-on");
      openSearch(fox);
    });
    // Starts loading the list before the click.
    fox.addEventListener("pointerenter", loadIndex);
    fox.addEventListener("focus", loadIndex);
    return fox;
  }

  function hop(fox) {
    if (motionOff()) return;
    fox.classList.remove("is-hop");
    void fox.offsetWidth;
    fox.classList.add("is-hop", "is-landed");
  }

  // A somersault in step with the letter under the fox (hero-title.js): same
  // length and easing, crouching and landing with it, and at the top it is
  // upside down just above the upside-down letter.
  function flip(fox, letter) {
    if (motionOff()) return;
    const fig = fox.querySelector(".site-fox-fig");
    const h = letter.offsetHeight;
    const f = fig.offsetHeight;
    const step = (y, turn, sx, sy) => ({ transform: `translateY(${y.toFixed(1)}px) rotate(${turn}deg) scale(${sx}, ${sy})` });
    const frames = [
      step(0, 0, 1, 1),
      { ...step(0.16 * h + 0.08 * f, 0, 1.16, 0.84), offset: 0.14 },
      { ...step(-(0.59 * h + 0.2 * f), 180, 0.94, 1.08), offset: 0.5 },
      { ...step(0.2 * h + 0.09 * f, 360, 1.2, 0.82), offset: 0.82 },
      step(0, 360, 1, 1),
    ];
    fox.classList.add("is-flip");
    const anim = fig.animate(frames, { duration: 850, easing: "ease-in-out" });
    anim.onfinish = anim.oncancel = () => fox.classList.remove("is-flip");
  }

  function say(fox, text) {
    const bubble = fox.querySelector(".site-fox-bubble");
    bubble.textContent = text;
    bubble.classList.add("is-on");
    clearTimeout(bubbleTimers.get(fox));
    bubbleTimers.set(fox, setTimeout(() => bubble.classList.remove("is-on"), BUBBLE_MS));
  }

  /* ── The search ── */

  const MAX_RESULTS = 12;
  // Hebrew words take ו, ה, ב, ל, מ, ש, כ in front ("השברים", "בגוף").
  const PREFIX = /^[והבלמשכ]/;
  let indexPromise = null;
  let panel = null;
  let opener = null;

  function loadIndex() {
    if (!indexPromise) {
      indexPromise = fetch("/api/search-index")
        .then((res) => {
          if (!res.ok) throw new Error(res.status);
          return res.json();
        })
        // A space in front, so has() can tell where a word starts.
        .then((items) =>
          items.map((item) => ({ ...item, title: ` ${norm(item.t)}`, text: ` ${norm(`${item.t} ${item.k} ${item.s}`)}` }))
        );
      indexPromise.catch(() => (indexPromise = null));
    }
    return indexPromise;
  }

  // Without niqqud, quotes, dashes and capital letters.
  function norm(text) {
    return String(text)
      .toLowerCase()
      .replace(/[֑-ׇ]/g, "")
      .replace(/[״"׳'`]/g, "")
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim();
  }

  // Without its front letter, a word counts only at the start of a word:
  // "בגוף" finds "גוף", but "שברים" doesn't find "איברים".
  function has(text, word) {
    return text.includes(word) || (word.length > 3 && PREFIX.test(word) && text.includes(` ${word.slice(1)}`));
  }

  function find(items, query) {
    const q = norm(query);
    const words = q.split(" ");
    return items
      .map((item, i) => {
        if (!words.every((word) => has(item.text, word))) return null;
        let score = words.filter((word) => has(item.title, word)).length * 10;
        if (item.title.includes(q)) score += 30;
        if (item.title.startsWith(` ${q}`)) score += 20;
        if (item.title === ` ${q}`) score += 40;
        return { item, score, i };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score || a.i - b.i)
      .slice(0, MAX_RESULTS)
      .map((hit) => hit.item);
  }

  function makePanel() {
    const el = document.createElement("div");
    el.className = "site-search";
    el.hidden = true;
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-labelledby", "site-search-title");
    el.innerHTML = `
      <div class="site-search-backdrop"></div>
      <div class="site-search-box">
        <div class="site-search-head">
          <span class="site-search-fox" aria-hidden="true">${FOX_SVG}</span>
          <p class="site-search-title" id="site-search-title"><span class="site-search-key">מה מחפשים?</span></p>
          <button type="button" class="site-search-close" aria-label="סגירה"></button>
        </div>
        <label class="site-search-field">
          <svg class="site-search-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg>
          <input type="search" class="site-search-input" placeholder="שיעור, נושא או דף" autocomplete="off" enterkeyhint="search" aria-label="חיפוש באתר"/>
        </label>
        <p class="site-search-note" role="status"></p>
        <ul class="site-search-results"></ul>
      </div>`;
    const input = el.querySelector(".site-search-input");
    input.addEventListener("input", render);
    input.addEventListener("keydown", (e) => {
      const first = el.querySelector(".site-search-results a");
      if (e.key === "Enter" && first) {
        e.preventDefault();
        first.click();
      } else if (e.key === "ArrowDown" && first) {
        e.preventDefault();
        first.focus();
      }
    });
    el.querySelector(".site-search-results").addEventListener("keydown", (e) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      e.preventDefault();
      const row = e.target.closest("li");
      const next = e.key === "ArrowDown" ? row?.nextElementSibling : row?.previousElementSibling;
      (next ? next.querySelector("a") : input).focus();
    });
    // A link to a place on this page (an English topic) only changes the
    // hash, so the panel closes itself.
    el.querySelector(".site-search-results").addEventListener("click", (e) => {
      if (e.target.closest("a")) closeSearch(false);
    });
    el.querySelector(".site-search-backdrop").addEventListener("click", () => closeSearch());
    el.querySelector(".site-search-close").addEventListener("click", () => closeSearch());
    el.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeSearch();
      if (e.key !== "Tab") return;
      // Focus stays inside the panel.
      const stops = [...el.querySelectorAll("button, input, a")];
      const edge = e.shiftKey ? stops[0] : stops[stops.length - 1];
      if (document.activeElement === edge) {
        e.preventDefault();
        (e.shiftKey ? stops[stops.length - 1] : stops[0]).focus();
      }
    });
    document.body.append(el);
    return el;
  }

  function render() {
    const input = panel.querySelector(".site-search-input");
    const note = panel.querySelector(".site-search-note");
    const list = panel.querySelector(".site-search-results");
    const query = input.value;
    // Nothing typed yet: only the box. The list loads now, so the first
    // letters find it ready.
    if (!norm(query)) {
      note.textContent = "";
      list.innerHTML = "";
      loadIndex().catch(() => {});
      return;
    }
    note.textContent = "מחפש…";
    loadIndex().then(
      (items) => {
        if (input.value !== query) return;
        const hits = find(items, query);
        note.textContent = hits.length ? "" : "לא מצאנו. נסו מילה אחרת";
        list.innerHTML = "";
        hits.forEach((item) => {
          const li = document.createElement("li");
          const a = document.createElement("a");
          a.className = "site-search-hit";
          a.href = item.u;
          a.innerHTML = `<span class="site-search-hit-title"></span><span class="site-search-hit-kind"></span>`;
          a.firstElementChild.textContent = item.t;
          a.lastElementChild.textContent = item.k;
          li.append(a);
          list.append(li);
        });
      },
      () => {
        if (input.value !== query) return;
        note.textContent = "החיפוש לא נטען. נסו שוב";
        list.innerHTML = "";
      }
    );
  }

  function openSearch(fox) {
    if (!panel) panel = makePanel();
    if (!panel.hidden) return;
    opener = fox.tagName === "BUTTON" ? fox : null;
    panel.hidden = false;
    document.documentElement.classList.add("site-search-open");
    const input = panel.querySelector(".site-search-input");
    input.value = "";
    render();
    input.focus();
  }

  function closeSearch(returnFocus = true) {
    if (!panel || panel.hidden) return;
    panel.hidden = true;
    document.documentElement.classList.remove("site-search-open");
    if (returnFocus) opener?.focus();
  }

  /* ── The guide ──
     The page goes dark, one thing at a time stays lit, and a card with the
     fox says in a short line what it is. tour(id, steps), each step
     { id, el, title, text }: el is an element or a selector, or a list of
     them (the first one on screen is used, so a button can have a phone
     twin); text is a line or a list of lines. Each step is shown once per
     browser. A step whose element isn't on screen waits for a time it is (a
     button only some lessons have), and then comes on its own. */

  const TOUR_KEY = "pleyi-tour-";
  // Set by the screenshot scripts (scripts/capture-home-demo.js): no guide.
  const TOUR_OFF_KEY = "pleyi-tour-off";
  const TOUR_PAD = 6;
  const TOUR_GAP = 14;
  const TOUR_EDGE = 12;
  let touring = false;

  // What is open over the page (the list the corner fox steps aside for,
  // site-fox.css): only what is inside it can be lit.
  const COVERS =
    'dialog[open], .modal-overlay:not(.hidden), .lesson-player:not(.hidden), [aria-modal="true"]:not(.hidden, [hidden], .hidden *, [aria-hidden="true"])';

  // `open`: the guide is on, so it is the thing over the page.
  function onScreen(el, open = false) {
    if (!el || el.closest(".hidden, [hidden]")) return false;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    if (open) return true;
    if ([...document.querySelectorAll(COVERS)].some((cover) => !cover.contains(el))) return false;
    // In the window, nothing else may lie on it (a menu, the cookie bar).
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    if (x < 0 || y < 0 || x >= window.innerWidth || y >= window.innerHeight) return true;
    const hit = document.elementFromPoint(x, y);
    return !hit || el.contains(hit) || hit.contains(el);
  }

  function pick(spec, open = false) {
    return []
      .concat(spec)
      .flatMap((one) => (typeof one === "string" ? [...document.querySelectorAll(one)] : [one]))
      .find((el) => onScreen(el, open));
  }

  function tour(id, steps) {
    if (touring) return false;
    let saved;
    try {
      if (localStorage.getItem(TOUR_OFF_KEY)) return false;
      saved = localStorage.getItem(TOUR_KEY + id);
    } catch {
      return false;
    }
    let seen = [];
    try {
      seen = [].concat(JSON.parse(saved) || []);
    } catch {}
    const shown = steps
      .filter((s) => !seen.includes(s.id))
      .map((s) => ({ ...s, spec: s.el, el: pick(s.el) }))
      .filter((s) => s.el);
    if (!shown.length) return false;
    try {
      localStorage.setItem(TOUR_KEY + id, JSON.stringify([...seen, ...shown.map((s) => s.id)]));
    } catch {}
    touring = true;

    const el = document.createElement("div");
    el.className = "site-tour";
    el.dir = "rtl";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-labelledby", "site-tour-title");
    el.innerHTML = `
      <div class="site-tour-hole"></div>
      <div class="site-tour-card">
        <span class="site-fox site-fox--tour" aria-hidden="true"><span class="site-fox-fig">${FOX_SVG}</span></span>
        <div class="site-tour-body" aria-live="polite">
          <p class="site-tour-title" id="site-tour-title"><span class="site-tour-key"></span></p>
          <p class="site-tour-text"></p>
        </div>
        <div class="site-tour-foot">
          <span class="site-tour-count" dir="ltr"></span>
          <button type="button" class="site-tour-skip">דלג</button>
          <button type="button" class="site-tour-next"></button>
        </div>
      </div>`;
    const hole = el.querySelector(".site-tour-hole");
    const card = el.querySelector(".site-tour-card");
    const fox = el.querySelector(".site-fox");
    const skipBtn = el.querySelector(".site-tour-skip");
    const nextBtn = el.querySelector(".site-tour-next");
    const back = document.activeElement;
    let at = 0;
    let queued = false;

    fox.querySelector(".site-fox-fig").addEventListener("animationend", (e) => {
      if (e.animationName === "site-fox-hop") fox.classList.remove("is-hop");
    });

    // The lit box hugs the element; the card goes under it, or above it, or
    // (a big area) over its bottom.
    function place() {
      queued = false;
      // The page drew itself again under the guide (fresh data came in).
      if (!shown[at].el.isConnected) shown[at].el = pick(shown[at].spec, true) || shown[at].el;
      const r = shown[at].el.getBoundingClientRect();
      const vw = document.documentElement.clientWidth;
      const vh = window.innerHeight;
      const left = Math.max(TOUR_EDGE / 2, r.left - TOUR_PAD);
      const top = Math.max(TOUR_EDGE / 2, r.top - TOUR_PAD);
      const right = Math.min(vw - TOUR_EDGE / 2, r.right + TOUR_PAD);
      const bottom = Math.min(vh - TOUR_EDGE / 2, r.bottom + TOUR_PAD);
      const small = Math.min(right - left, bottom - top) <= 64;
      Object.assign(hole.style, {
        left: `${left}px`,
        top: `${top}px`,
        width: `${right - left}px`,
        height: `${bottom - top}px`,
        borderRadius: small ? `${Math.min(right - left, bottom - top) / 2}px` : "",
      });
      const cw = card.offsetWidth;
      const ch = card.offsetHeight;
      let y = vh - ch - TOUR_EDGE;
      if (vh - bottom >= ch + TOUR_GAP + TOUR_EDGE) y = bottom + TOUR_GAP;
      else if (top >= ch + TOUR_GAP + TOUR_EDGE) y = top - TOUR_GAP - ch;
      const x = Math.min(Math.max(TOUR_EDGE, (left + right) / 2 - cw / 2), vw - cw - TOUR_EDGE);
      card.style.left = `${x}px`;
      card.style.top = `${Math.max(TOUR_EDGE, y)}px`;
    }

    function queue() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(place);
    }

    function show(i) {
      at = i;
      const step = shown[at];
      const last = at === shown.length - 1;
      el.querySelector(".site-tour-key").textContent = step.title;
      el.querySelector(".site-tour-text").replaceChildren(
        ...[].concat(step.text).map((line) => {
          const span = document.createElement("span");
          span.className = "site-tour-line";
          span.textContent = line;
          return span;
        })
      );
      el.querySelector(".site-tour-count").textContent = shown.length > 1 ? `${at + 1} / ${shown.length}` : "";
      nextBtn.textContent = last ? "הבנתי" : "הבא";
      skipBtn.hidden = last;
      if (!step.el.isConnected) step.el = pick(step.spec, true) || step.el;
      const r = step.el.getBoundingClientRect();
      if (r.top < 0 || r.bottom > window.innerHeight) step.el.scrollIntoView({ block: "center" });
      place();
      hop(fox);
      nextBtn.focus({ preventScroll: true });
    }

    // Keys don't reach the page under it: Esc closes the guide, not the
    // lesson, and the arrows don't turn the slides.
    function onKey(e) {
      e.stopPropagation();
      if (e.key === "Escape") end();
      else if (e.key === "Tab") {
        // Focus stays on the card's two buttons.
        e.preventDefault();
        const stops = [nextBtn, skipBtn].filter((b) => !b.hidden);
        stops[(stops.indexOf(document.activeElement) + 1) % stops.length].focus();
      } else if (e.key.startsWith("Arrow") || e.key.startsWith("Page")) e.preventDefault();
    }

    function end() {
      if (!touring) return;
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("resize", queue);
      window.removeEventListener("scroll", queue, true);
      el.classList.remove("is-on");
      setTimeout(() => el.remove(), 200);
      touring = false;
      back?.focus?.({ preventScroll: true });
    }

    nextBtn.addEventListener("click", () => (at === shown.length - 1 ? end() : show(at + 1)));
    skipBtn.addEventListener("click", end);
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("resize", queue);
    window.addEventListener("scroll", queue, true);
    document.body.append(el);
    show(0);
    requestAnimationFrame(() => el.classList.add("is-on"));
    return true;
  }

  // svg: the fox drawing, for pages that show it themselves (english-games.js).
  window.PleyiFox = { tour, svg: FOX_SVG };

  /* ── The guide of each part of the site ──
     The fox waits for each step's element to come on screen (the page loads
     its data, a tab or an exercise opens) and shows it then. `page` is the
     address the guide is on; `skip` holds it while that is on screen (a game
     in play). The lesson slides have their own (ready-lessons.js). */

  const GUIDE_WAIT = 800;
  const LEARN = /^\/services\/(english|math|hebrew|science|geography|history|lifeskills|body|health)\/?$/;
  const SUBJECT = /^\/services\/(math|hebrew|science|geography|history|lifeskills|body|health)\/?$/;
  const DAILY_TEXT = ["5 שאלות קצרות בכל יום", "עושים כל יום ושומרים על הרצף"];

  const GUIDES = [
    {
      id: "english",
      page: /^\/services\/english\/?$/,
      // Only on the topics: a topic's page has a guide of its own.
      skip: "#engTopicsView.hidden",
      steps: [
        { id: "stages", el: "#engTopicGrid .eng-path-title", title: "שלבים", text: ["היי! כאן לומדים אנגלית", "הנושאים מסודרים בשלבים, לפי הסדר"] },
        { id: "topic", el: "#engTopicGrid .eng-topic-tile", title: "נושא", text: "לוחצים על נושא ונכנסים אליו" },
        { id: "grade", el: "#engGradeTrigger", title: "כיתה", text: "בוחרים כיתה, ורואים רק את הנושאים שלה" },
        { id: "daily", el: "#engTopDaily", title: "אתגר יומי", text: DAILY_TEXT },
        { id: "board", el: "#engTopBoard", title: "טבלת הניקוד", text: "כאן רואים את הנקודות של כל הכיתה" },
      ],
    },
    {
      id: "subject",
      page: SUBJECT,
      skip: "#engTopicsView.hidden",
      steps: [
        { id: "stages", el: "#engTopicGrid .eng-path-title", title: "שלבים", text: ["היי! כאן לומדים ומתרגלים", "הנושאים מסודרים בשלבים, לפי הסדר"] },
        { id: "topic", el: "#engTopicGrid .eng-topic-tile", title: "נושא", text: "לוחצים על נושא ונכנסים אליו" },
        { id: "grade", el: "#engGradeTrigger", title: "כיתה", text: "בוחרים כיתה, ורואים רק את הנושאים שלה" },
      ],
    },
    {
      // A topic's page, in English and in the school subjects.
      id: "topic",
      page: LEARN,
      steps: [
        { id: "lesson", el: ".eng-lesson-card .eng-lesson-open", title: "שיעור", text: ["היי! כאן הנושא", "קודם רואים את השיעור"] },
        {
          id: "exercise",
          el: ".eng-ex-grid .eng-ex-card:not(.eng-ex-card--print, .eng-ex-card--game, .eng-ex-card--reading)",
          title: "תרגילים",
          text: ["אחרי השיעור מתרגלים", "הראשון הכי קל"],
        },
        { id: "info", el: ".eng-ex-card [data-help]", title: "הכפתור i", text: ["כאן רואים פרטים על התרגיל", "רמה, מספר שאלות והציון הכי טוב"] },
        { id: "paper", el: ".eng-ex-card a.eng-info-btn", title: "דף להדפסה", text: "מדפיסים את התרגיל ופותרים על דף" },
        { id: "mistakes", el: "#engReviewStrip", title: "הטעויות שלי", text: "מתרגלים שוב שאלות שטעיתם בהן" },
        { id: "reading", el: ".eng-ex-card--reading", title: "קטע קריאה", text: "קוראים טקסט קצר ועונים על שאלות" },
        { id: "games", el: ".eng-ex-card--game", title: "משחקים", text: "משחקים עם המילים של הנושא" },
        { id: "print", el: ".eng-ex-card--print", title: "דפי עבודה", text: "דפים על כל הנושא, להדפסה" },
        { id: "next", el: ".eng-next-topic", title: "הנושא הבא", text: "סיימתם? ממשיכים לנושא הבא" },
        { id: "level", el: ".eng-level-card", title: "קטעים לפי רמה", text: ["בוחרים קטע לקריאה", "רמה 1 הכי קלה"] },
        { id: "cards", el: ".eng-fc-vocab-link", title: "כרטיסיות מילים", text: "לומדים מילים חדשות בכרטיסים" },
        { id: "back", el: '#engBarBack .eng-back[href^="#"]', title: "חזרה", text: "חוזרים לכל הנושאים" },
      ],
    },
    {
      // The exercise screen, in English and in the school subjects.
      id: "exercise",
      page: LEARN,
      skip: ".eng-runner-card--game",
      steps: [
        { id: "what", el: ".eng-exercise-view .eng-instructions", title: "מה עושים?", text: ["היי! כאן מתרגלים", "כאן כתוב מה צריך לעשות"] },
        { id: "bar", el: "#engProgress", title: "הפס", text: "כאן רואים כמה שאלות נשארו" },
        { id: "speak", el: ".eng-runner-card .eng-speak, .eng-runner-card .eng-word-tap", title: "שומעים", text: "לוחצים ושומעים איך אומרים את זה" },
        { id: "listen", el: "#engListenBtn", title: "הקשבה", text: "לוחצים ושומעים את המילה" },
        { id: "slow", el: "#engSlowBtn", title: "לאט", text: "שומעים שוב, יותר לאט" },
        { id: "mic", el: "#engMicBtn", title: "מיקרופון", text: "לוחצים ואומרים את המילה באנגלית" },
        { id: "text", el: "#engReadText", title: "הטקסט", text: ["קודם קוראים את כל הטקסט", "אחר כך עונים על שאלות"] },
        { id: "to-questions", el: ".eng-read.is-read #engReadGo", title: "לשאלות", text: "קראתם? לוחצים ועוברים לשאלות" },
        { id: "text-back", el: "#engReadBack", title: "חזרה לטקסט", text: "שכחתם משהו? חוזרים לקרוא" },
        { id: "timer", el: "#engExamTimer", title: "השעון", text: "כאן רואים כמה זמן נשאר" },
        { id: "flip", el: "#engFcFlip", title: "להפוך", text: "לוחצים ורואים מה כתוב מאחור" },
        { id: "check", el: "#engCheck", title: "בדיקה", text: "בסוף לוחצים כאן ובודקים את התשובה" },
        { id: "settings", el: "#engSettingsBtn", title: "הגדרות", text: ["כאן יש עזרים לתרגיל", "למשל צלילים וצבע לכרטיס"] },
        { id: "grade", el: ".eng-results .eng-grade", title: "הציון", text: "כאן רואים כמה הצלחתם" },
        { id: "points", el: "#engEarned .eng-earned-pill", title: "נקודות", text: "על כל תרגול מקבלים נקודות" },
        { id: "again", el: "#engAgain", title: "סבב חדש", text: "מתרגלים שוב, עם שאלות חדשות" },
        { id: "fix", el: "#engRetryMistakes", title: "הטעויות", text: "מתרגלים רק את השאלות שטעיתם בהן" },
        { id: "back", el: ".eng-runner-top .eng-back", title: "יציאה", text: "יוצאים מהתרגיל" },
      ],
    },
    {
      id: "library",
      page: /^\/services\/ready-lessons\/?$/,
      steps: [
        { id: "filters", el: "#lessonFilters", title: "סינון", text: ["היי! כאן כל השיעורים", "כאן בוחרים מקצוע, כיתה ונושא"] },
        { id: "info", el: ".svc-lesson-card[data-lesson] .svc-lesson-info-toggle", title: "הכפתור i", text: "כאן רואים על מה השיעור" },
        { id: "open", el: ".svc-lesson-card[data-lesson] .js-lesson-open", title: "פתיחה", text: "פותחים את השיעור" },
        { id: "save", el: "#lessonInfoFavBtn", title: "שמירה", text: "שומרים את השיעור לפעם אחרת" },
        { id: "share", el: "#lessonInfoShareBtn", title: "שיתוף", text: "שולחים את השיעור לתלמידים" },
        { id: "back", el: "#studentBack", title: "חזרה", text: "חוזרים לעמוד שלכם" },
      ],
    },
    {
      id: "worksheets",
      page: /^\/services\/worksheets\/?$/,
      steps: [
        { id: "type", el: "#filterTypeTrigger", title: "סוג הדף", text: ["היי! כאן דפים להדפסה", "בוחרים: צביעה, סודוקו ועוד"] },
        { id: "level", el: "#filterDifficultyTrigger", title: "רמת קושי", text: "בוחרים דף קל, בינוני או קשה" },
        { id: "download", el: "#worksheetGrid .svc-tile-download", title: "להורדה", text: "שומרים את הדף במחשב או בטלפון" },
        { id: "print", el: "#worksheetGrid .svc-tile-print", title: "הדפסה", text: "מדפיסים את הדף מיד" },
      ],
    },
    {
      id: "class-games",
      page: /^\/services\/class-games\/?$/,
      steps: [
        { id: "game", el: "#classGamesGrid .cg-card", title: "משחק", text: ["היי! כאן משחקים עם כל הכיתה", "כל ריבוע הוא משחק"] },
        { id: "filters", el: "#cgFilters", title: "סינון", text: "בוחרים סוג משחק ורמה" },
        { id: "info", el: "#classGamesGrid .cg-card-info", title: "איך משחקים", text: "לוחצים על i וקוראים את החוקים" },
        { id: "play", el: "#classGamesGrid .cg-card-play", title: "שחק", text: "פותחים את המשחק על הלוח בכיתה" },
        { id: "instr", el: ".cg-runner .cg-instr", title: "מה עושים", text: "כאן כתוב מה עושים עכשיו" },
        { id: "full", el: '.cg-runner [data-act="fullscreen"]', title: "מסך מלא", text: "מגדילים את המשחק לכל הלוח" },
        { id: "close", el: '.cg-runner [data-act="close"]', title: "יציאה", text: "סוגרים את המשחק" },
      ],
    },
  ];

  function guideOn(guide) {
    return typeof guide.page === "function" ? guide.page() : guide.page.test(location.pathname);
  }

  function guideDone(guide) {
    try {
      const seen = [].concat(JSON.parse(localStorage.getItem(TOUR_KEY + guide.id)) || []);
      return guide.steps.every((s) => seen.includes(s.id));
    } catch {
      return true;
    }
  }

  // Looks again a moment after anything on the page changes, until every
  // step of the page's guides was shown.
  function startGuides() {
    let guides = GUIDES.filter(guideOn);
    if (!guides.length) return;
    let timer = 0;
    const watch = new MutationObserver(soon);
    function run() {
      timer = 0;
      guides = guides.filter((g) => !guideDone(g));
      if (!guides.length) return watch.disconnect();
      guides.some((g) => !(g.skip && document.querySelector(g.skip)) && tour(g.id, g.steps));
    }
    function soon() {
      if (!timer) timer = setTimeout(run, GUIDE_WAIT);
    }
    watch.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "hidden", "open"] });
    soon();
  }

  // Home: on the site name. Other pages: on the first line of the big title,
  // or on a title marked data-fox-perch (my room's hello).
  // The fox goes in a wrapper beside the text, since i18n rewrites the text.
  function addHeroFox() {
    const name = document.querySelector("#home .hero-site-name");
    const target = name || document.querySelector(".clean-section--hero .hero-title .line, [data-fox-perch]");
    if (!target) return null;
    const perch = document.createElement(name ? "div" : "span");
    perch.className = `site-fox-perch site-fox-perch--${name ? "name" : "line"}`;
    target.before(perch);
    perch.append(target);
    const fox = makeFox("span", "hero");
    fox.setAttribute("aria-hidden", "true");
    perch.append(fox);
    // When a letter of the site name somersaults, the fox hops too — once it
    // has landed, and without restarting a hop that is still going. The first
    // letter is the one it stands on, so with that one it somersaults along.
    target.addEventListener("hero-letter-hop", (e) => {
      if (!fox.classList.contains("is-landed") || fox.matches(".is-hop, .is-flip")) return;
      if (e.target === target.querySelector(".hero-site-ch")) flip(fox, e.target);
      else hop(fox);
    });
    return fox;
  }

  function addCornerFox() {
    const dock = document.createElement("div");
    dock.className = "site-fox-dock";
    const fox = makeFox("button", "dock");
    fox.type = "button";
    fox.setAttribute("aria-label", "חיפוש באתר");
    fox.querySelector(".site-fox-bubble").setAttribute("role", "status");
    dock.append(fox);
    document.body.append(dock);
    return dock;
  }

  function followPointer(foxes) {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    let x = 0;
    let y = 0;
    let queued = false;
    window.addEventListener(
      "pointermove",
      (e) => {
        x = e.clientX;
        y = e.clientY;
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => {
          queued = false;
          if (motionOff()) return;
          foxes.forEach((fox) => {
            const r = fox.getBoundingClientRect();
            if (!r.width) return;
            const dx = x - (r.left + r.width / 2);
            const dy = y - (r.top + r.height * 0.5);
            const d = Math.hypot(dx, dy) || 1;
            const reach = Math.min(1, d / 160) * 2.8;
            fox.querySelector(".fox-pupils").setAttribute(
              "transform",
              `translate(${((dx / d) * reach).toFixed(2)} ${((dy / d) * reach).toFixed(2)})`
            );
          });
        });
      },
      { passive: true }
    );
  }

  // While a hero fox sits on the title, the corner fox is away, so the
  // greeting waits until it comes out.
  function greetOnce(dock) {
    try {
      if (localStorage.getItem(GREETED_KEY)) return;
    } catch {
      return;
    }
    const fox = dock.querySelector(".site-fox");
    const greet = (delay) =>
      setTimeout(() => {
        // Not while the guide is on: the greeting waits for it.
        if (touring) return greet(1500);
        try {
          localStorage.setItem(GREETED_KEY, "1");
        } catch {}
        hop(fox);
        say(fox, GREETING);
      }, delay);
    if (!dock.classList.contains("is-away")) return greet(1400);
    const watch = new MutationObserver(() => {
      if (dock.classList.contains("is-away")) return;
      watch.disconnect();
      greet(600);
    });
    watch.observe(dock, { attributes: true, attributeFilter: ["class"] });
  }

  // Every so often, the corner fox says hello — not while the tab is in the
  // background, the search is open, or the fox is away or under a dialog.
  function chatNowAndThen(dock) {
    const fox = dock.querySelector(".site-fox");
    const tick = () => {
      const searching = panel && !panel.hidden;
      const away = dock.classList.contains("is-away");
      if (!document.hidden && !searching && !away && !touring && fox.getBoundingClientRect().width) {
        hop(fox);
        say(fox, CHAT);
      }
      setTimeout(tick, CHAT_EVERY_MS);
    };
    setTimeout(tick, CHAT_FIRST_MS);
  }

  function init() {
    const heroFox = addHeroFox();
    const dock = addCornerFox();
    const cornerFox = dock.querySelector(".site-fox");
    if (heroFox) {
      dock.classList.add("is-away");
      new IntersectionObserver(([entry]) => dock.classList.toggle("is-away", entry.isIntersecting)).observe(heroFox);
    }
    followPointer(heroFox ? [heroFox, cornerFox] : [cornerFox]);
    greetOnce(dock);
    chatNowAndThen(dock);
    startGuides();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
