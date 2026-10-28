/* "מה חדש" on the home page — one card at a time, newest first.

   - The arrows and dots switch cards; on phones a swipe does too.
   - The cards turn by themselves until the visitor touches the carousel
     (hovering or focusing it only pauses them), and never under
     prefers-reduced-motion.
   - The hidden cards are inert, so their "נסה עכשיו" links can't be tabbed to. */

(function () {
  const AUTO_MS = 7000;
  const SWIPE_PX = 40;

  const root = document.querySelector("[data-news-carousel]");
  if (!root) return;
  const list = root.querySelector(".news-list");
  const items = [...root.querySelectorAll(".news-item")];
  const dotsBox = root.querySelector("[data-news-dots]");
  if (items.length < 2) {
    root.classList.add("news-carousel--single");
    return;
  }

  let index = Math.max(0, items.findIndex((item) => item.classList.contains("is-active")));
  let timer = null;
  let stopped = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let paused = false;

  const dots = items.map((item, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "news-dot";
    dot.setAttribute("aria-label", `חידוש ${i + 1} מתוך ${items.length}`);
    dot.addEventListener("click", () => show(i, true));
    dotsBox.appendChild(dot);
    return dot;
  });

  function show(i, byVisitor) {
    index = (i + items.length) % items.length;
    items.forEach((item, n) => {
      const active = n === index;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-label", `${n + 1} מתוך ${items.length}`);
      item.toggleAttribute("inert", !active);
      item.setAttribute("aria-hidden", String(!active));
    });
    dots.forEach((dot, n) => dot.setAttribute("aria-current", String(n === index)));
    if (byVisitor) stop();
  }

  // Once the visitor takes over, screen readers announce each new card.
  function stop() {
    stopped = true;
    clearInterval(timer);
    list.setAttribute("aria-live", "polite");
  }

  function tick() {
    if (!paused && !document.hidden) show(index + 1, false);
  }

  root.querySelector("[data-news-prev]").addEventListener("click", () => show(index - 1, true));
  root.querySelector("[data-news-next]").addEventListener("click", () => show(index + 1, true));

  root.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") show(index + 1, true);
    else if (e.key === "ArrowRight") show(index - 1, true);
  });

  root.addEventListener("mouseenter", () => (paused = true));
  root.addEventListener("mouseleave", () => (paused = false));
  root.addEventListener("focusin", () => (paused = true));
  root.addEventListener("focusout", () => (paused = false));
  // Opening the install steps on the first card stops the turning too.
  root.addEventListener("click", (e) => {
    if (e.target.closest("[data-pwa-install-btn]")) stop();
  });

  // Right to left, the next card waits on the left: dragging right brings it in.
  let startX = null;
  let startY = 0;
  list.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });
  list.addEventListener("touchend", (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    startX = null;
    if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(dy)) return;
    show(dx > 0 ? index + 1 : index - 1, true);
  }, { passive: true });

  show(index, false);
  if (!stopped) timer = setInterval(tick, AUTO_MS);
})();
