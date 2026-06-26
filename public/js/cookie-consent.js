(function () {
  "use strict";

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
