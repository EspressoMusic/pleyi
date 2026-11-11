/* The site's fennec fox — Pleyschool's mascot (site-fox.css).

   - A small fox sits in the bottom corner of every page. Tapping it makes it
     hop and opens the site search (the list comes from /api/search-index,
     lib/site-search.js).
   - On pages with a big hero title, a bigger fox perches on the title, and
     the corner fox waits until the title scrolls out of view.
   - Its eyes follow the mouse. Only the corner fox talks: on the first
     visit it says that it searches, and every so often it says hello.
   - The corner fox steps aside while a dialog, a lesson or an exercise
     screen is open (site-fox.css). */

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
  // Shown before anything is typed: the site's main pages.
  const START_COUNT = 6;
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
    if (!q) return items.slice(0, START_COUNT);
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

  // Home: on the site name. Other pages: on the first line of the big title.
  // The fox goes in a wrapper beside the text, since i18n rewrites the text.
  function addHeroFox() {
    const name = document.querySelector("#home .hero-site-name");
    const target = name || document.querySelector(".clean-section--hero .hero-title .line");
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
      if (!document.hidden && !searching && !away && fox.getBoundingClientRect().width) {
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
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
