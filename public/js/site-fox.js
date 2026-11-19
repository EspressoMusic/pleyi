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
     shows it around (PleyiFox.tour). It is off until someone turns it on
     with the "מדריך" button beside the corner fox.
   - Instead of the fox it can be another animal (a cat, a bear…), picked
     with "נראות" on the home page and kept in this browser. */

(function () {
  const GREETING = "היי! לחצו עליי כדי לחפש באתר";
  const GREETED_KEY = "pleyi-fox-greeted";
  const BUBBLE_MS = 3600;
  const CHAT = "היי, למידה נעימה! אני פה לעזור!";
  const CHAT_FIRST_MS = 20000;
  const CHAT_EVERY_MS = 60000;

  const HEAD = "M60 40C79 40 95 51 95 67C95 81 79 94 60 94C41 94 25 81 25 67C25 51 41 40 60 40Z";
  const BODY = "M60 86C80 86 90 102 90 114C90 122 80 126 60 126C40 126 30 122 30 114C30 102 40 86 60 86Z";
  const CAP_BAND = "M44 41V34Q60 29 76 34V41Q60 47 44 41Z";
  const CAP_BOARD = "M60 21L89 30.5L60 40L31 30.5Z";
  const NOSE = "M54 77Q60 74 66 77Q63.5 83 60 83.5Q56.5 83 54 77Z";
  const SNOUT = "M60 72C70 72 77 78 80 85C74 91 67 94 60 94C53 94 46 91 40 85C43 78 50 72 60 72Z";
  const MOUTH = '<path class="f-thin" d="M60 83V86.5M54 87.5Q57 90 60 86.5Q63 90 66 87.5"/>';

  // The right ear (and whiskers, eye patch…) is the left one in a mirror.
  const FLIP = 'transform="matrix(-1 0 0 1 120 0)"';
  const pair = (left) => `${left}<g ${FLIP}>${left}</g>`;
  const ears = (left) => `<g class="fox-ear fox-ear-l">${left}</g><g class="fox-ear fox-ear-r"><g ${FLIP}>${left}</g></g>`;
  const tail = (shapes) => `<g class="fox-tail">${shapes}</g>`;

  // The lion's mane: round bumps all around the head.
  function mane(bumps) {
    const at = (i) => {
      const a = (i / bumps) * 2 * Math.PI;
      return [60 + 45 * Math.sin(a), 66 - 42 * Math.cos(a)];
    };
    let [x, y] = at(0);
    let d = `M${x.toFixed(1)} ${y.toFixed(1)}`;
    for (let i = 1; i <= bumps; i++) {
      const [nx, ny] = at(i);
      const r = (Math.hypot(nx - x, ny - y) * 0.56).toFixed(1);
      d += `A${r} ${r} 0 0 1 ${nx.toFixed(1)} ${ny.toFixed(1)}`;
      [x, y] = [nx, ny];
    }
    return `${d}Z`;
  }

  // The mascot: the fox, or another animal picked with "נראות" on the home
  // page (logo-style.js). All of them are drawn alike — flat shapes, dot eyes,
  // one thick line and the cap — in layers: `back` behind the head (ears,
  // tail), `face` on the head, `front` over the head's line. Colors: body,
  // cream (snout) and dark (site-fox.css).
  const ANIMALS = [
    {
      id: "fox",
      name: "שועל",
      colors: ["#f7b55e", "#fff1d9"],
      back:
        tail('<path class="f-body" d="M80 123C100 128 117 116 115 97C114 86 105 82 99 87C104 96 101 108 84 109Z"/>') +
        ears('<path class="f-body" d="M50 44C42 30 22 13 9 5C6 22 13 45 30 61Z"/>'),
      face: `<path class="f-cream" d="${SNOUT}"/>`,
    },
    {
      id: "cat",
      name: "חתול",
      colors: ["#b9c3d1", "#f4f6fa"],
      back:
        tail('<path class="f-body" d="M82 121C102 124 114 110 110 92C108 84 100 84 100 91C102 104 96 112 82 112Z"/>') +
        ears(
          '<path class="f-body" d="M34 52C30 40 27 26 27 12C38 16 48 26 56 41Z"/>' +
            '<path class="f-pink" d="M35 44C33 36 32 29 32 21C38 25 43 30 47 37Z"/>'
        ),
      face: '<path class="f-cream" d="M60 73C68 73 74 78 76 84C71 90 66 93 60 93C54 93 49 90 44 84C46 78 52 73 60 73Z"/>',
      front: pair('<path class="f-thin" d="M15 72L35 76.5M15 84L35 81.5"/>'),
      nose: "M55 77Q60 75 65 77Q62.5 81.5 60 82Q57.5 81.5 55 77Z",
      mouth: '<path class="f-thin" d="M60 82V84.5M54 85.5Q57 88.5 60 84.5Q63 88.5 66 85.5"/>',
    },
    {
      id: "dog",
      name: "כלב",
      colors: ["#e3b47e", "#fff4e3", "#93603a"],
      back: tail('<path class="f-body" d="M84 116C96 113 104 103 106 91C107 85 101 83 98 88C96 97 92 103 82 106Z"/>'),
      face: '<path class="f-cream" d="M60 71C71 71 79 78 79 85C74 91 67 94 60 94C53 94 46 91 41 85C41 78 49 71 60 71Z"/>',
      // Floppy ears, over the head.
      front: ears('<path class="f-dark" d="M41 45C29 41 16 50 15 66C14 80 20 89 29 88C36 87 35 72 39 58Z"/>'),
      nose: "M53 76Q60 72 67 76Q64 83 60 83.5Q56 83 53 76Z",
      mouth:
        '<path class="f-pink f-tongue" d="M56 87.5Q60 89 64 87.5Q64.5 95 60 95Q55.5 95 56 87.5Z"/>' +
        '<path class="f-thin" d="M51 84Q55.5 89 60 84.5Q64.5 89 69 84"/>',
    },
    {
      id: "bear",
      name: "דוב",
      colors: ["#b98154", "#ecd3b2"],
      back:
        tail('<circle class="f-body" cx="93" cy="111" r="8"/>') +
        ears('<circle class="f-body" cx="31" cy="47" r="13"/><circle class="f-cream" cx="31" cy="47" r="6"/>'),
      face: '<path class="f-cream" d="M60 71C70 71 76 76 76 82C76 88 69 91 60 91C51 91 44 88 44 82C44 76 50 71 60 71Z"/>',
      nose: "M54 75.5Q60 72.5 66 75.5Q63.5 81 60 81.5Q56.5 81 54 75.5Z",
      mouth: MOUTH,
    },
    {
      id: "bunny",
      name: "ארנב",
      colors: ["#e8e2ef", "#ffffff"],
      back:
        tail('<circle class="f-light" cx="92" cy="114" r="9"/>') +
        ears(
          '<path class="f-body" d="M45 47C37 35 25 21 19 9C17 4 10 5 10 11C11 25 21 43 33 56Z"/>' +
            '<path class="f-pink" d="M39 46C32 36 23 25 16 14C17 25 24 39 32 50Z"/>'
        ),
      face:
        '<path class="f-cream" d="M60 74C67 74 72 78 73 83C69 88 65 90 60 90C55 90 51 88 47 83C48 78 53 74 60 74Z"/>' +
        pair('<circle class="f-pink" cx="36" cy="78" r="5"/>'),
      nose: "M56 77Q60 75.5 64 77Q62 80.5 60 81Q58 80.5 56 77Z",
      mouth:
        '<path class="f-tooth" d="M54.5 83H65.5V90Q65.5 92 63.5 92H56.5Q54.5 92 54.5 90Z"/>' +
        '<path class="f-tooth" d="M60 83V92"/>',
    },
    {
      id: "panda",
      name: "פנדה",
      colors: ["#fbfbfb", "#fbfbfb", "#2f3442"],
      back: ears('<circle class="f-dark" cx="32" cy="46" r="12"/>'),
      face: pair('<path class="f-patch" d="M35 58C39 50 52 51 55.5 60C59 70 52 79 44 79C36 78.5 31.5 66 35 58Z"/>'),
      mouth: MOUTH,
    },
    {
      id: "lion",
      name: "אריה",
      colors: ["#f6c453", "#fff0c4", "#e07b2a"],
      back:
        `<path class="f-dark" d="${mane(10)}"/>` +
        tail(
          '<path class="f-tail-out" d="M84 121C98 125 106 117 106 104"/><path class="f-tail-in" d="M84 121C98 125 106 117 106 104"/>' +
            '<path class="f-dark" d="M106 104C100 101 99 92 105 89C111 86 117 93 114 100C112 104 109 105 106 104Z"/>'
        ) +
        ears('<circle class="f-body" cx="31" cy="44" r="9"/><circle class="f-cream" cx="31" cy="44" r="4"/>'),
      face: `<path class="f-cream" d="${SNOUT}"/>`,
      mouth: MOUTH,
    },
  ];

  const ANIMAL_KEY = "pleyi-mascot";
  let animal = storedAnimal();

  function storedAnimal() {
    try {
      const id = localStorage.getItem(ANIMAL_KEY);
      return ANIMALS.some((a) => a.id === id) ? id : ANIMALS[0].id;
    } catch {
      return ANIMALS[0].id;
    }
  }

  function draw(id = animal) {
    const a = ANIMALS.find((one) => one.id === id) || ANIMALS[0];
    const [body, cream, dark = body] = a.colors;
    return `<svg class="site-fox-svg" data-animal="${a.id}" viewBox="0 0 120 132" style="--fox-body:${body};--fox-cream:${cream};--fox-dark:${dark}" aria-hidden="true" focusable="false">
    ${a.back}
    <path class="f-body f-torso" d="${BODY}"/>
    <path class="f-body" d="${HEAD}"/>
    ${a.face || ""}
    <path class="f-line" d="${HEAD}"/>
    ${a.front || ""}
    <g class="fox-pupils">
      <g class="fox-eyes">
        <circle class="f-pupil" cx="47" cy="65" r="5.6"/>
        <circle class="f-pupil" cx="73" cy="65" r="5.6"/>
      </g>
    </g>
    <path class="f-nose" d="${a.nose || NOSE}"/>
    ${a.mouth || ""}
    <path class="f-cap" d="${CAP_BAND}"/>
    <path class="f-cap" d="${CAP_BOARD}"/>
  </svg>`;
  }

  // Every mascot on the page turns into the new animal at once.
  function setAnimal(id) {
    if (!ANIMALS.some((a) => a.id === id)) return;
    animal = id;
    try {
      localStorage.setItem(ANIMAL_KEY, id);
    } catch {}
    document.querySelectorAll(".site-fox .site-fox-svg, .site-search-fox .site-fox-svg").forEach((svg) => {
      svg.outerHTML = draw(id);
    });
  }

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
    fox.innerHTML = `<span class="site-fox-fig">${draw()}</span><span class="site-fox-bubble"></span>`;
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
          <span class="site-search-fox" aria-hidden="true">${draw()}</span>
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
    const guideBtn = makeGuideButton();
    if (guideBtn) el.querySelector(".site-search-box").append(guideBtn);
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
  // Set by the guide button (makeGuideButton): each person turns it on for
  // themselves, in their own browser.
  const GUIDE_ON_KEY = "pleyi-guide-on";
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

  function guideEnabled() {
    try {
      return localStorage.getItem(GUIDE_ON_KEY) === "1" && !localStorage.getItem(TOUR_OFF_KEY);
    } catch {
      return false;
    }
  }

  function tour(id, steps) {
    if (touring || !guideEnabled()) return false;
    let saved;
    try {
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
        <span class="site-fox site-fox--tour" aria-hidden="true"><span class="site-fox-fig">${draw()}</span></span>
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

  // svg: the chosen animal's drawing, for pages that show it themselves
  // (english-games.js). animals, draw and setAnimal: the picker in "נראות".
  window.PleyiFox = {
    tour,
    get svg() {
      return draw();
    },
    animals: ANIMALS.map(({ id, name }) => ({ id, name })),
    animal: () => animal,
    draw,
    setAnimal,
  };

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
  // step of the page's guides was shown, or the guide is turned off.
  let guideWatch = null;
  function startGuides() {
    guideWatch?.disconnect();
    let guides = GUIDES.filter(guideOn);
    if (!guides.length || !guideEnabled()) return;
    let timer = 0;
    const watch = (guideWatch = new MutationObserver(soon));
    function run() {
      timer = 0;
      if (watch !== guideWatch) return;
      if (!guideEnabled()) return watch.disconnect();
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

  // In the list the fox opens, on pages that have a guide. Turning it on
  // closes the list and starts the guide over from the beginning, everywhere;
  // tapping again turns it off.
  function makeGuideButton() {
    if (!GUIDES.some(guideOn)) return null;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "site-guide-btn";
    btn.innerHTML = `<span class="site-guide-btn-icon" aria-hidden="true">?</span><span class="site-guide-btn-text"></span>`;
    const sync = () => {
      const on = guideEnabled();
      btn.setAttribute("aria-pressed", String(on));
      btn.querySelector(".site-guide-btn-text").textContent = on ? "כיבוי מדריך" : "הפעלת מדריך";
    };
    btn.addEventListener("click", () => {
      const on = !guideEnabled();
      try {
        if (on) {
          Object.keys(localStorage)
            .filter((key) => key.startsWith(TOUR_KEY) && key !== TOUR_OFF_KEY)
            .forEach((key) => localStorage.removeItem(key));
          localStorage.setItem(GUIDE_ON_KEY, "1");
        } else localStorage.removeItem(GUIDE_ON_KEY);
      } catch {}
      sync();
      if (!on) return;
      closeSearch(false);
      startGuides();
    });
    sync();
    return btn;
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
    // A page that puts the fox on its title itself (road-safety.js) only
    // takes the drawing, without the corner fox and the guide.
    if (document.documentElement.dataset.siteFox === "drawing") return;
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
