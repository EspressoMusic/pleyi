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

  function syncToggleButtons(theme) {
    var isDark = theme === DARK;
    document.querySelectorAll(".theme-toggle-btn").forEach(function (btn) {
      btn.setAttribute("aria-pressed", isDark ? "true" : "false");
      btn.setAttribute("aria-label", isDark ? "מעבר למצב בהיר" : "מעבר למצב כהה");
      btn.classList.toggle("is-dark", isDark);
    });
  }

  function apply(theme) {
    var next = theme === DARK ? DARK : LIGHT;
    document.documentElement.setAttribute("data-theme", next);

    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", next === DARK ? "#0f2220" : "#00C9B7");

    syncA11yDarkMode(next === DARK);
    syncToggleButtons(next);
  }

  function toggle() {
    var current = document.documentElement.getAttribute("data-theme") === DARK ? DARK : LIGHT;
    var next = current === DARK ? LIGHT : DARK;
    writeStored(next);
    apply(next);
    return next;
  }

  function createToggleButton() {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "theme-toggle-btn lang-toggle lang-toggle--sm";
    btn.innerHTML =
      '<span class="theme-toggle-btn__sun" aria-hidden="true">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">' +
          '<circle cx="12" cy="12" r="4"/>' +
          '<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>' +
        "</svg></span>" +
      '<span class="theme-toggle-btn__moon" aria-hidden="true">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M21 13.2A8.5 8.5 0 0 1 10.8 3 7 7 0 1 0 21 13.2z"/>' +
        "</svg></span>";
    btn.addEventListener("click", toggle);
    return btn;
  }

  function mountToggle(container, position) {
    if (!container || container.querySelector(".theme-toggle-btn")) return;

    var btn = createToggleButton();
    var langToggle = container.querySelector("[data-lang-toggle]");
    var menuToggle = container.querySelector(".menu-toggle");

    if (position === "prepend") {
      container.insertBefore(btn, container.firstChild);
    } else if (langToggle) {
      container.insertBefore(btn, langToggle);
    } else if (menuToggle) {
      container.insertBefore(btn, menuToggle);
    } else {
      container.appendChild(btn);
    }
  }

  function mountToggles() {
    if (document.body.classList.contains("page-ready-lessons")) return;
    mountToggle(document.querySelector(".nav-actions"));
    mountToggle(document.querySelector("#mobileNav"), "prepend");
    mountToggle(document.querySelector(".play-top-strip-actions"));
    mountToggle(document.querySelector(".room-nav-inner"));
    mountToggle(document.querySelector(".join-header"));
    syncToggleButtons(document.documentElement.getAttribute("data-theme") === DARK ? DARK : LIGHT);
  }

  function initTheme() {
    if (document.body.classList.contains("page-ready-lessons")) {
      document.documentElement.setAttribute("data-theme", "light");
      return;
    }
    apply(readStored());
    mountToggles();
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
