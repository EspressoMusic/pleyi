(function () {
  "use strict";

  var STORAGE_KEY = "gameclass-a11y";
  var defaultState = {
    textSize: "",
    highContrast: false,
    darkMode: false,
    reduceMotion: false,
    readableFont: false,
    underlineLinks: false,
    letterSpacing: false,
    focusStrong: false,
    grayscale: false,
  };

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return Object.assign({}, defaultState);
      return Object.assign({}, defaultState, JSON.parse(raw));
    } catch (e) {
      return Object.assign({}, defaultState);
    }
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) { /* ignore */ }
  }

  var CLASS_MAP = {
    textSize: ["a11y-text-md", "a11y-text-lg", "a11y-text-xl"],
    highContrast: "a11y-high-contrast",
    darkMode: "a11y-dark-mode",
    reduceMotion: "a11y-reduce-motion",
    readableFont: "a11y-readable-font",
    underlineLinks: "a11y-underline-links",
    letterSpacing: "a11y-letter-spacing",
    focusStrong: "a11y-focus-strong",
    grayscale: "a11y-grayscale",
  };

  function applyState(state) {
    var root = document.documentElement;
    CLASS_MAP.textSize.forEach(function (c) { root.classList.remove(c); });
    if (state.textSize) root.classList.add("a11y-text-" + state.textSize);

    ["highContrast", "darkMode", "reduceMotion", "readableFont", "underlineLinks",
      "letterSpacing", "focusStrong", "grayscale"].forEach(function (key) {
      var cls = CLASS_MAP[key];
      root.classList.toggle(cls, !!state[key]);
    });
  }

  var state = loadState();
  applyState(state);

  function ensureMount() {
    var mount = document.getElementById("siteA11yMount");
    if (mount) return mount;

    mount = document.createElement("div");
    mount.id = "siteA11yMount";
    mount.className = "site-a11y-mount";

    var footerInner = document.querySelector(".site-footer .footer-inner");
    var footerMini = document.querySelector(".site-footer-mini");
    var legalContainer = document.querySelector(".legal-page .container");

    if (footerInner) {
      footerInner.appendChild(mount);
    } else if (footerMini) {
      var copy = footerMini.querySelector(".footer-copy");
      if (copy) footerMini.insertBefore(mount, copy);
      else footerMini.appendChild(mount);
    } else if (legalContainer) {
      legalContainer.appendChild(mount);
    } else {
      var bar = document.createElement("footer");
      bar.className = "site-a11y-bar";
      document.body.appendChild(bar);
      bar.appendChild(mount);
    }

    return mount;
  }

  function createWidget() {
    if (document.getElementById("a11yWidgetRoot")) return;

    var mount = ensureMount();

    var root = document.createElement("div");
    root.className = "a11y-widget-root";
    root.id = "a11yWidgetRoot";

    root.innerHTML =
      '<button type="button" class="a11y-toggle" id="a11yToggle" aria-label="פתיחת תפריט נגישות" aria-expanded="false" aria-controls="a11yPanel">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
          '<path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm8 7h-3.17c-.51 0-.94-.39-1-.89L15.5 4.5C15.09 3.09 13.82 2 12.36 2H11.64c-1.46 0-2.73 1.09-3.14 2.5L8.17 10.11c-.06.5-.49.89-1 .89H4c-1.1 0-2 .9-2 2v1c0 .55.45 1 1 1h1v7c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-7h1c.55 0 1-.45 1-1v-1c0-1.1-.9-2-2-2zM7 20v-7h10v7H7z"/>' +
        '</svg>' +
        '<span class="a11y-toggle-label">נגישות</span>' +
      '</button>' +
      '<div class="a11y-panel" id="a11yPanel" role="dialog" aria-label="הגדרות נגישות" aria-hidden="true">' +
        '<div class="a11y-panel-header">' +
          '<h2>נגישות</h2>' +
          '<button type="button" class="a11y-close" id="a11yClose" aria-label="סגירת תפריט נגישות">×</button>' +
        '</div>' +
        '<div class="a11y-group">' +
          '<p class="a11y-group-title">גודל טקסט</p>' +
          '<div class="a11y-row" role="group" aria-label="גודל טקסט">' +
            '<button type="button" class="a11y-btn" data-a11y="textSize" data-value="">רגיל</button>' +
            '<button type="button" class="a11y-btn" data-a11y="textSize" data-value="md">בינוני</button>' +
            '<button type="button" class="a11y-btn" data-a11y="textSize" data-value="lg">גדול</button>' +
            '<button type="button" class="a11y-btn" data-a11y="textSize" data-value="xl">גדול מאוד</button>' +
          '</div>' +
        '</div>' +
        '<div class="a11y-group">' +
          '<p class="a11y-group-title">תצוגה</p>' +
          '<div class="a11y-row">' +
            '<button type="button" class="a11y-btn" data-a11y="highContrast" data-toggle="true">ניגודיות גבוהה</button>' +
            '<button type="button" class="a11y-btn" data-a11y="darkMode" data-toggle="true">מצב כהה</button>' +
            '<button type="button" class="a11y-btn" data-a11y="grayscale" data-toggle="true">גווני אפור</button>' +
            '<button type="button" class="a11y-btn" data-a11y="readableFont" data-toggle="true">גופן קריא</button>' +
          '</div>' +
        '</div>' +
        '<div class="a11y-group">' +
          '<p class="a11y-group-title">קריאות וניווט</p>' +
          '<div class="a11y-row">' +
            '<button type="button" class="a11y-btn" data-a11y="underlineLinks" data-toggle="true">הדגשת קישורים</button>' +
            '<button type="button" class="a11y-btn" data-a11y="letterSpacing" data-toggle="true">ריווח אותיות</button>' +
            '<button type="button" class="a11y-btn" data-a11y="focusStrong" data-toggle="true">הדגשת מיקוד</button>' +
            '<button type="button" class="a11y-btn" data-a11y="reduceMotion" data-toggle="true">עצירת אנימציות</button>' +
          '</div>' +
        '</div>' +
        '<div class="a11y-group">' +
          '<button type="button" class="a11y-btn a11y-btn--full" id="a11yReset">איפוס הגדרות</button>' +
        '</div>' +
        '<a href="/legal/accessibility.html" class="a11y-statement-link">הצהרת נגישות מלאה</a>' +
      '</div>';

    mount.appendChild(root);

    var toggle = document.getElementById("a11yToggle");
    var panel = document.getElementById("a11yPanel");
    var closeBtn = document.getElementById("a11yClose");

    function setOpen(open) {
      panel.classList.toggle("is-open", open);
      panel.setAttribute("aria-hidden", open ? "false" : "true");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) {
        var first = panel.querySelector(".a11y-btn");
        if (first) first.focus();
      }
    }

    toggle.addEventListener("click", function () {
      setOpen(!panel.classList.contains("is-open"));
    });

    closeBtn.addEventListener("click", function () {
      setOpen(false);
      toggle.focus();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && panel.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });

    document.addEventListener("click", function (e) {
      if (!root.contains(e.target) && panel.classList.contains("is-open")) {
        setOpen(false);
      }
    });

    function syncButtons() {
      root.querySelectorAll("[data-a11y]").forEach(function (btn) {
        var key = btn.getAttribute("data-a11y");
        var isToggle = btn.hasAttribute("data-toggle");
        if (isToggle) {
          btn.classList.toggle("is-active", !!state[key]);
        } else {
          var val = btn.getAttribute("data-value");
          btn.classList.toggle("is-active", state[key] === val);
        }
      });
    }

    root.querySelectorAll("[data-a11y]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var key = btn.getAttribute("data-a11y");
        if (btn.hasAttribute("data-toggle")) {
          state[key] = !state[key];
        } else {
          state[key] = btn.getAttribute("data-value");
        }
        saveState(state);
        applyState(state);
        syncButtons();
      });
    });

    document.getElementById("a11yReset").addEventListener("click", function () {
      state = Object.assign({}, defaultState);
      saveState(state);
      applyState(state);
      syncButtons();
    });

    syncButtons();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createWidget);
  } else {
    createWidget();
  }

  window.GameClassA11y = { applyState: applyState, loadState: loadState };
})();
