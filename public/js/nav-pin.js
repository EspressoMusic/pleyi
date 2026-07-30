/* Keep the top navbar fixed while scrolling — no background changes */

(function () {
  "use strict";

  function pinNavbar() {
    var nav = document.getElementById("navbar");
    if (!nav) return;

    nav.style.setProperty("position", "fixed", "important");
    nav.style.setProperty("top", "0", "important");
    nav.style.setProperty("left", "0", "important");
    nav.style.setProperty("right", "0", "important");
    nav.style.setProperty("width", "100%", "important");
    nav.style.setProperty("z-index", "1000", "important");
    nav.style.setProperty("transform", "none", "important");

    if (document.body.classList.contains("clean-site")) {
      var topInset = parseFloat(getComputedStyle(document.documentElement).paddingTop) || 0;
      var safeTop = Number.isFinite(topInset) ? topInset : 0;
      document.body.style.setProperty("--clean-nav-clear", nav.offsetHeight + safeTop + "px");
    }
  }

  function init() {
    pinNavbar();
    window.addEventListener("resize", pinNavbar, { passive: true });
    window.addEventListener("load", pinNavbar);
    requestAnimationFrame(pinNavbar);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
