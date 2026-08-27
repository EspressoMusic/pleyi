(function () {
  "use strict";

  if (!window.PleyiTheme && !document.querySelector('script[src*="theme.js"]') && !document.body.classList.contains("page-ready-lessons")) {
    var themeScript = document.createElement("script");
    themeScript.src = "/js/theme.js?v=1";
    (document.head || document.documentElement).appendChild(themeScript);
  }

  if (!document.querySelector('script[src*="ambient-bg"]') && !document.querySelector(".ambient-bg")) {
    var ambientScript = document.createElement("script");
    ambientScript.src = "/js/ambient-bg.js?v=3";
    ambientScript.defer = true;
    (document.head || document.documentElement).appendChild(ambientScript);
  }

  if (document.getElementById("navbar") && !document.querySelector('script[src*="nav-pin"]')) {
    var navPinScript = document.createElement("script");
    navPinScript.src = "/js/nav-pin.js?v=3";
    navPinScript.defer = true;
    (document.head || document.documentElement).appendChild(navPinScript);
  }

  if (!document.querySelector('script[src*="scroll-animations"]') && !document.body.classList.contains("play-body")) {
    var scrollScript = document.createElement("script");
    scrollScript.src = "/js/scroll-animations.js?v=4";
    scrollScript.defer = true;
    (document.head || document.documentElement).appendChild(scrollScript);
  }

  var STORAGE_KEY = "gameclass-cookies-v1";

  function acceptEssential() {
    try {
      localStorage.setItem(STORAGE_KEY, "essential");
    } catch (e) { /* ignore */ }
    hideBanner();
  }

  function hasConsent() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      return v === "accepted" || v === "essential";
    } catch (e) {
      return false;
    }
  }

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, "accepted");
    } catch (e) { /* ignore */ }
    hideBanner();
  }

  function hideBanner() {
    var banner = document.getElementById("cookieBanner");
    if (banner) {
      banner.classList.remove("is-visible");
      setTimeout(function () { banner.remove(); }, 350);
    }
  }

  function createBanner() {
    if (hasConsent() || document.getElementById("cookieBanner")) return;

    var banner = document.createElement("div");
    banner.className = "cookie-banner";
    banner.id = "cookieBanner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "הודעת עוגיות");
    banner.innerHTML =
      '<p>האתר משתמש בעוגיות לתפעול והעדפות. <a href="/legal/cookies.html">מדיניות עוגיות</a></p>' +
      '<div class="cookie-banner-actions">' +
        '<button type="button" class="btn-cookie btn-cookie-accept" id="cookieAccept">אני מסכים/ה</button>' +
        '<button type="button" class="btn-cookie btn-cookie-essential" id="cookieEssential">רק הכרחי</button>' +
      '</div>';

    document.body.appendChild(banner);
    requestAnimationFrame(function () {
      banner.classList.add("is-visible");
    });

    document.getElementById("cookieAccept").addEventListener("click", accept);
    document.getElementById("cookieEssential").addEventListener("click", acceptEssential);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createBanner);
  } else {
    createBanner();
  }
})();
