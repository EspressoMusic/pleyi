/* "מה חדש" on the home page — one card at a time, newest first.

   - The cards turn by themselves; on phones a swipe turns them too.
   - Hovering or focusing the carousel pauses them, a swipe stops them,
     and they never turn under prefers-reduced-motion. */

(function () {
  const AUTO_MS = 7000;
  const SWIPE_PX = 40;

  const root = document.querySelector("[data-news-carousel]");
  if (!root) return;
  const list = root.querySelector(".news-list");
  const items = [...root.querySelectorAll(".news-item")];
  if (items.length < 2) return;

  let index = Math.max(0, items.findIndex((item) => item.classList.contains("is-active")));
  let timer = null;
  let stopped = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let paused = false;

  function show(i, byVisitor) {
    index = (i + items.length) % items.length;
    items.forEach((item, n) => {
      const active = n === index;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-label", `${n + 1} מתוך ${items.length}`);
      item.toggleAttribute("inert", !active);
      item.setAttribute("aria-hidden", String(!active));
    });
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

  root.addEventListener("mouseenter", () => (paused = true));
  root.addEventListener("mouseleave", () => (paused = false));
  root.addEventListener("focusin", () => (paused = true));
  root.addEventListener("focusout", () => (paused = false));

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
