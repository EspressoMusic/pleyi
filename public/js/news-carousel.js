/* "מה חדש" on the home page — one card at a time, newest first.

   - The cards turn by themselves; the side arrows and, on phones, a swipe
     turn them too.
   - Hovering or focusing the carousel pauses them, a swipe stops them,
     and they never turn under prefers-reduced-motion.
   - A card's picture ([data-news-shots]: one or more image addresses)
     opens big in a dialog, and stops the cards. */

(function () {
  const AUTO_MS = 5000;
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

  // Small arrows on the card's sides; right to left, the right one goes back.
  root.querySelector(".news-arrow--prev")?.addEventListener("click", () => show(index - 1, true));
  root.querySelector(".news-arrow--next")?.addEventListener("click", () => show(index + 1, true));

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

  const zoom = document.querySelector(".news-zoom");
  if (zoom) {
    const img = zoom.querySelector(".news-zoom-img");
    const nav = zoom.querySelector(".news-zoom-nav");
    const prev = zoom.querySelector(".news-zoom-arrow--prev");
    const next = zoom.querySelector(".news-zoom-arrow--next");
    const count = zoom.querySelector(".news-zoom-count");
    let shots = [];
    let at = 0;

    function showShot(i) {
      at = (i + shots.length) % shots.length;
      img.src = shots[at];
      nav.hidden = shots.length < 2;
      count.textContent = `${at + 1} מתוך ${shots.length}`;
    }

    root.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-news-shots]");
      if (!btn) return;
      stop();
      shots = btn.dataset.newsShots.split(/\s+/).filter(Boolean);
      const title = btn.closest(".news-item")?.querySelector(".news-title")?.textContent || "";
      zoom.querySelector(".news-zoom-key").textContent = title;
      img.alt = title;
      showShot(0);
      zoom.showModal();
    });

    prev.addEventListener("click", () => showShot(at - 1));
    next.addEventListener("click", () => showShot(at + 1));
    zoom.querySelector(".news-zoom-close").addEventListener("click", () => zoom.close());
    // A click on the dark backdrop around the box closes it.
    zoom.addEventListener("click", (e) => {
      if (e.target === zoom) {
        const r = zoom.getBoundingClientRect();
        const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
        if (!inside) zoom.close();
      }
    });
    // Right to left: the right arrow key goes back.
    zoom.addEventListener("keydown", (e) => {
      if (shots.length < 2) return;
      if (e.key === "ArrowRight") showShot(at - 1);
      else if (e.key === "ArrowLeft") showShot(at + 1);
    });
  }

  show(index, false);
  if (!stopped) timer = setInterval(tick, AUTO_MS);
})();
