/* Home title — a letter does a somersault when touched, and a random one every few seconds */

(function () {
  const HOP_FRAMES = [
    { translate: "0 0", rotate: "0deg", scale: "1 1" },
    { translate: "0 8%", rotate: "0deg", scale: "1.18 0.84", offset: 0.14 },
    { translate: "0 -55%", rotate: "180deg", scale: "0.94 1.08", offset: 0.5 },
    { translate: "0 10%", rotate: "360deg", scale: "1.22 0.8", offset: 0.82 },
    { translate: "0 0", rotate: "360deg", scale: "1 1" },
  ];
  const AUTO_HOP_MS = 3500;

  function motionOff() {
    return (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.dataset.visual === "minimal"
    );
  }

  function stillDropping(ch) {
    return ch.getAnimations().some((a) => a.animationName === "hero-site-ch-drop" && a.playState !== "finished");
  }

  function hop(ch) {
    if (!ch || ch.dataset.hopping || motionOff() || stillDropping(ch)) return;
    ch.dataset.hopping = "1";
    // The "שובב" look tilts the letters (logo-style.js); the somersault starts from that tilt.
    const tilt = parseFloat(getComputedStyle(ch).rotate) || 0;
    const frames = HOP_FRAMES.map((f) => ({ ...f, rotate: `${parseFloat(f.rotate) + tilt}deg` }));
    const anim = ch.animate(frames, { duration: 850, easing: "ease-in-out" });
    const done = () => delete ch.dataset.hopping;
    anim.onfinish = done;
    anim.oncancel = done;
    // The fox perched on the title hops along (site-fox.js).
    ch.dispatchEvent(new CustomEvent("hero-letter-hop", { bubbles: true }));
  }

  document.addEventListener("DOMContentLoaded", () => {
    const title = document.querySelector("#home .hero-site-name");
    if (!title) return;

    title.addEventListener("pointerover", (e) => hop(e.target.closest(".hero-site-ch")));

    let last = -1;
    setInterval(() => {
      if (document.hidden) return;
      const letters = title.querySelectorAll(".hero-site-ch");
      if (letters.length < 2) return;
      let i;
      do i = Math.floor(Math.random() * letters.length);
      while (i === last);
      last = i;
      hop(letters[i]);
    }, AUTO_HOP_MS);
  });
})();
