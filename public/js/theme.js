/* Site theme — light / dark with persistence */

(function () {
  "use strict";

  var STORAGE_KEY = "pleyi-theme";
  var DARK = "dark";
  var LIGHT = "light";

  function readStored() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored === DARK || stored === LIGHT) return stored;

      var a11yRaw = localStorage.getItem("gameclass-a11y");
      if (a11yRaw) {
        var a11y = JSON.parse(a11yRaw);
        if (a11y.darkMode) return DARK;
      }
    } catch (e) { /* ignore */ }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? DARK : LIGHT;
  }

  function writeStored(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) { /* ignore */ }
  }

  function syncA11yDarkMode(isDark) {
    try {
      var raw = localStorage.getItem("gameclass-a11y");
      if (!raw) return;
      var a11y = JSON.parse(raw);
      a11y.darkMode = isDark;
      localStorage.setItem("gameclass-a11y", JSON.stringify(a11y));
    } catch (e) { /* ignore */ }
  }

  function apply(theme) {
    var next = theme === DARK ? DARK : LIGHT;
    document.documentElement.setAttribute("data-theme", next);

    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", next === DARK ? "#0f2220" : "#00C9B7");

    syncA11yDarkMode(next === DARK);
  }

  function toggle() {
    var current = document.documentElement.getAttribute("data-theme") === DARK ? DARK : LIGHT;
    var next = current === DARK ? LIGHT : DARK;
    writeStored(next);
    apply(next);
    return next;
  }

  function initTheme() {
    apply(LIGHT);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTheme);
  } else {
    initTheme();
  }

  window.PleyiTheme = {
    apply: apply,
    toggle: toggle,
    readStored: readStored,
    DARK: DARK,
    LIGHT: LIGHT,
  };
})();
