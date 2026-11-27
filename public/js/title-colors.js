/* The yellow, ink-outlined titles in the colors of the home page's site name
   "פלייסקול" (i18n.js applyHeroSiteName): each letter its own color, in the
   same order. The thick ink outline is drawn once for the whole title, under
   the letters, by its ::before (styles.css .title-colored), so one letter's
   outline never covers the next letter.

   The big page titles (the hero lines, e.g. "לומדים כישורי חיים!") too, all
   their lines, the colors running on from one line to the next. The home
   page's line under "פלייסקול" stays as it is.

   Titles a page writes or changes later are colored as they change. A title
   that is not painted yellow (the professional look, site-pro.css) stays
   plain, and goes back to plain when the look changes. */

(function () {
  const COLORS = ["#ff6b9d", "#ffe135", "#00e5cc", "#ff8fcb", "#ffd700", "#62ebe0", "#ff9a3c"];

  const HERO_LINE = ".hero-title.font-cartoon .line";

  // The yellow titles (styles.css, the Fredoka list) and the page titles.
  const TITLES = [
    HERO_LINE,
    ".clean-section-title.font-cartoon",
    ".room-title.font-cartoon",
    ".room-hello-title",
    ".eng-topic-heading.font-cartoon",
    ".eng-fc-sub.font-cartoon",
    ".svc-my-games-title.font-cartoon",
    ".hub-body :is(.hub-title, .teacher-room-name, .hub-custom-header h2, .modal-custom-title, .game-info-title).font-cartoon",
    ".rs-heading:is(.rs-page-title, .rs-section-title)",
    ".es-heading:is(.es-page-title, .es-section-title)",
    ".adm-top-title",
  ].join(",");

  // --memyellow, in the light and the dark theme.
  const YELLOW = new Set(["rgb(255, 225, 53)", "rgb(212, 184, 0)"]);

  const seg = window.Intl && Intl.Segmenter ? new Intl.Segmenter("he", { granularity: "grapheme" }) : null;
  const letters = (text) => (seg ? Array.from(seg.segment(text), (s) => s.segment) : [...text]);
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Still colored as we left it (the page has not written new text into it).
  function current(el) {
    return (
      el.classList.contains("title-colored") &&
      el.dataset.titleText === el.textContent &&
      // The same text written over it again is plain text: no letters left.
      el.children.length > 0 &&
      [...el.children].every((c) => c.classList.contains("title-ch"))
    );
  }

  function strip(el) {
    el.classList.remove("title-colored", "title-colored--placed");
    delete el.dataset.titleText;
    el.style.removeProperty("--title-ink");
    if (el.dataset.titleLabel) {
      el.removeAttribute("aria-label");
      delete el.dataset.titleLabel;
    }
  }

  function canColor(el, colored) {
    const text = colored ? el.dataset.titleText : el.textContent;
    if (!text || !text.trim()) return false;
    if (!colored && el.children.length) return false; // icons or markup inside: left alone
    const cs = getComputedStyle(el);
    if (el.matches(HERO_LINE)) {
      if (el.closest("#home")) return false; // the line under "פלייסקול"
      if (document.documentElement.dataset.siteStyle === "pro") return false;
    } else if (!YELLOW.has(cs.webkitTextFillColor)) return false;
    if (/flex|grid/.test(cs.display)) return false; // each letter would become its own item
    if (!colored && getComputedStyle(el, "::before").content !== "none") return false;
    return true;
  }

  const isSpace = (ch) => /^\s+$/.test(ch);

  // A title's second line goes on with the colors where the first one stopped.
  function firstColor(el) {
    if (!el.matches(HERO_LINE)) return 0;
    let n = 0;
    for (const line of el.closest(".hero-title").querySelectorAll(".line")) {
      if (line === el) break;
      n += letters(line.dataset.titleText || line.textContent).filter((ch) => !isSpace(ch)).length;
    }
    return n;
  }

  function paint(el) {
    const text = el.textContent;
    const cs = getComputedStyle(el);
    let i = firstColor(el);
    const html = letters(text)
      .map((ch) => (isSpace(ch) ? ch : `<span class="title-ch" style="--ch-color:${COLORS[i++ % COLORS.length]}">${esc(ch)}</span>`))
      .join("");
    el.dataset.titleText = text;
    el.style.setProperty("--title-ink", cs.webkitTextStrokeColor);
    if (cs.position === "static") el.classList.add("title-colored--placed");
    el.classList.add("title-colored");
    if (!el.hasAttribute("aria-label")) {
      el.setAttribute("aria-label", text.trim());
      el.dataset.titleLabel = "1";
    }
    el.innerHTML = html;
  }

  function refresh(el) {
    const colored = current(el);
    if (!colored && el.classList.contains("title-colored")) strip(el);
    const ok = canColor(el, colored);
    if (colored && !ok) {
      el.textContent = el.dataset.titleText;
      strip(el);
    } else if (!colored && ok) {
      paint(el);
    }
  }

  const refreshAll = () => document.querySelectorAll(TITLES).forEach(refresh);

  // Runs before the page paints the change, so a rewritten title never shows half done.
  const watch = new MutationObserver((records) => {
    const found = new Set();
    for (const r of records) {
      if (r.type === "attributes") return refreshAll();
      const target = r.target.nodeType === 1 ? r.target : r.target.parentElement;
      const title = target && target.closest(TITLES);
      if (title) found.add(title);
      r.addedNodes.forEach((n) => {
        if (n.nodeType !== 1) return;
        if (n.matches(TITLES)) found.add(n);
        n.querySelectorAll(TITLES).forEach((t) => found.add(t));
      });
    }
    found.forEach(refresh);
  });

  function start() {
    refreshAll();
    watch.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["data-site-style", "data-theme"],
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
