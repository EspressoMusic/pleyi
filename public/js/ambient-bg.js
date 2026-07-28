/* Ambient background — turquoise particles + layered side waves */

(function () {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DOT_COUNT = prefersReduced ? 18 : 44;

  const DOT_COLORS = [
    "rgba(0, 130, 118, 0.75)",
    "rgba(0, 110, 100, 0.82)",
    "rgba(0, 158, 142, 0.7)",
    "rgba(0, 95, 86, 0.78)",
  ];

  const DOT_GLOWS = [
    "rgba(0, 110, 100, 0.35)",
    "rgba(0, 130, 118, 0.28)",
    "rgba(0, 95, 86, 0.32)",
  ];

  const SIDE_WAVE_SVG = `
    <svg viewBox="0 0 140 1000" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path fill="rgba(0,130,118,0.16)" d="M0,0 C72,95 18,210 88,340 C118,420 42,560 96,690 C124,770 54,900 0,1000 L0,0 Z"/>
      <path fill="rgba(0,110,100,0.26)" d="M0,0 C48,160 92,300 36,460 C-8,610 64,760 28,1000 L0,1000 L0,0 Z"/>
      <path fill="rgba(0,95,86,0.36)" d="M0,0 C86,130 12,290 74,430 C108,530 34,680 82,830 C106,910 48,960 0,1000 L0,0 Z"/>
    </svg>`;

  function createDots(container) {
    for (let i = 0; i < DOT_COUNT; i += 1) {
      const dot = document.createElement("span");
      dot.className = "ambient-bg__dot";

      const size = 2 + Math.random() * 5;
      const left = Math.random() * 100;
      const opacity = 0.18 + Math.random() * 0.42;
      const duration = 14 + Math.random() * 26;
      const delay = Math.random() * duration;
      const drift = -28 + Math.random() * 56;
      const color = DOT_COLORS[Math.floor(Math.random() * DOT_COLORS.length)];
      const glow = DOT_GLOWS[Math.floor(Math.random() * DOT_GLOWS.length)];

      dot.style.setProperty("--dot-size", `${size.toFixed(1)}px`);
      dot.style.setProperty("--dot-opacity", opacity.toFixed(2));
      dot.style.setProperty("--drift", `${drift.toFixed(0)}px`);
      dot.style.setProperty("--dot-color", color);
      dot.style.setProperty("--dot-glow", glow);
      dot.style.left = `${left.toFixed(1)}%`;
      dot.style.animationDuration = `${duration.toFixed(1)}s`;
      dot.style.animationDelay = `${(-delay).toFixed(1)}s`;

      if (prefersReduced) {
        dot.style.top = `${Math.random() * 100}%`;
      }

      container.appendChild(dot);
    }
  }

  function createSide(side) {
    const el = document.createElement("div");
    el.className = `ambient-bg__side ambient-bg__side--${side}`;
    el.innerHTML = SIDE_WAVE_SVG;
    return el;
  }

  function init() {
    if (!document.body.classList.contains("clean-site")) return;
    if (document.querySelector(".ambient-bg")) return;

    const wrap = document.createElement("div");
    wrap.className = "ambient-bg";
    wrap.setAttribute("aria-hidden", "true");

    wrap.appendChild(createSide("left"));
    wrap.appendChild(createSide("right"));

    const particles = document.createElement("div");
    particles.className = "ambient-bg__particles";
    wrap.appendChild(particles);

    document.body.insertBefore(wrap, document.body.firstChild);
    createDots(particles);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
