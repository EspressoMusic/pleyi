(function () {
  "use strict";

  var STORAGE_KEY = "pleyi-visual";
  var MINIMAL = "minimal";
  var COLORFUL = "colorful";

  function readStored() {
    try {
      return localStorage.getItem(STORAGE_KEY) === MINIMAL;
    } catch (e) {
      return false;
    }
  }

  function writeStored(minimal) {
    try {
      localStorage.setItem(STORAGE_KEY, minimal ? MINIMAL : COLORFUL);
    } catch (e) { /* ignore */ }
  }

  function apply(minimal) {
    var root = document.documentElement;
    root.setAttribute("data-visual", minimal ? MINIMAL : COLORFUL);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", minimal ? "#f0f2f4" : "#0066FF");
    document.querySelectorAll(".visual-mode-btn").forEach(function (btn) {
      btn.setAttribute("aria-pressed", minimal ? "true" : "false");
      btn.setAttribute(
        "aria-label",
        minimal ? "חזרה לתצוגה צבעונית" : "מעבר לתצוגה מינימלית"
      );
      var label = btn.querySelector(".visual-mode-btn__label");
      if (label) label.textContent = minimal ? "צבעוני" : "מינימלי";
      btn.classList.toggle("is-active", minimal);
    });
  }

  function createToggleButton() {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "visual-mode-btn";
    btn.innerHTML =
      '<span class="visual-mode-btn__icon" aria-hidden="true">' +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '<rect x="3" y="3" width="18" height="18" rx="4"/>' +
      '<path d="M8 12h8"/>' +
      "</svg></span>" +
      '<span class="visual-mode-btn__label">מינימלי</span>';
    btn.addEventListener("click", function () {
      var next = document.documentElement.getAttribute("data-visual") !== MINIMAL;
      writeStored(next);
      apply(next);
    });
    return btn;
  }

  function mountToggle(container, position) {
    if (!container || container.querySelector(".visual-mode-btn")) return;
    var btn = createToggleButton();
    if (position === "append") container.appendChild(btn);
    else if (position === "prepend") container.insertBefore(btn, container.firstChild);
    else container.appendChild(btn);
    apply(readStored());
  }

  function mountToggles() {
    mountToggle(document.querySelector(".nav-actions"), "prepend");
    mountToggle(document.querySelector(".room-nav-actions"), "prepend");
    mountToggle(document.querySelector(".join-header"), "append");
    mountToggle(document.querySelector(".room-nav-inner"), "prepend");
    mountToggle(document.querySelector(".play-top-strip-actions"), "prepend");
    mountToggle(document.querySelector("#mobileNav"), "prepend");

    if (!document.querySelector(".visual-mode-btn")) {
      var fallback = document.body;
      if (fallback) {
        var fixed = createToggleButton();
        fixed.classList.add("visual-mode-btn--fixed");
        fallback.appendChild(fixed);
        apply(readStored());
      }
    } else {
      apply(readStored());
    }
  }

  apply(readStored());

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountToggles);
  } else {
    mountToggles();
  }

  window.PleyiVisualTheme = {
    isMinimal: function () {
      return document.documentElement.getAttribute("data-visual") === MINIMAL;
    },
    setMinimal: function (on) {
      writeStored(!!on);
      apply(!!on);
    },
    toggle: function () {
      var next = document.documentElement.getAttribute("data-visual") !== MINIMAL;
      writeStored(next);
      apply(next);
      return next;
    },
  };
})();
