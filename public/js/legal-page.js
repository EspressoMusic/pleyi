/* Legal pages — back-to-top button */

(function () {
  "use strict";

  var btn = document.getElementById("legalTopBtn");
  if (!btn) return;

  var SHOW_AFTER = 320;
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function onScroll() {
    btn.classList.toggle("is-visible", window.scrollY > SHOW_AFTER);
  }

  btn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
  });

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
