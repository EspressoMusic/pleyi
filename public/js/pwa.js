/* Installing Pleyi as an app — the manifest (/manifest.webmanifest, built in
   server.js) and the service worker (/sw.js) make the site installable.

   - The installed app opens where it was installed from: a student's own
     page (/s/<key>, or the English page with their key), the teacher's
     student list, or else /app (public/app.html), which still sends a
     student whose link this phone opened to their page. On iPhones the
     installed app doesn't share the browser's storage, so the student's key
     has to travel in that address.
   - Install buttons: a [data-pwa-install] block is shown by the page's CSS
     under html.pwa-can-install. Its [data-pwa-install-btn] opens the
     browser's install prompt, or — where the browser has none (iPhones) —
     the steps in its [data-pwa-help]. After an install the page gets
     html.pwa-installed, and inside the app html.pwa-app.
   - Every page's phone menu and footer link to the download page
     (/download, public/download.html).
   - The fox loading screen, only inside the app: when the app opens, and
     when a page of it takes a moment to come. This file runs in the page's
     head (no defer), so the fox is there before the page shows.
     A [data-pwa-fox] gets the same hopping fox (the download page). */

(function () {
  const KEY_PATTERN = /^[A-Za-z0-9_-]{20,64}$/;
  const root = document.documentElement;
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const mobile = ios || /Android|Mobi/i.test(navigator.userAgent);
  const STARTED = Date.now();
  // sessionStorage: the app was opened in this session / app.html saw the
  // Android app open it / a page of the app showed the fox on its way out.
  const LAUNCHED_KEY = "pleyi-app-launched";
  const APP_KEY = "pleyi-app";
  const NAV_KEY = "pleyi-app-nav";
  let installPrompt = null;
  let navTimer = 0;
  let navLoader = null;

  const SHARE_ICON = `<svg class="pwa-share-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="שיתוף"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M8 10H6a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1h-2"/></svg>`;

  // The site's fox (site-fox.js draws the same one, but loads too late).
  const FOX_HEAD = "M60 40C79 40 95 51 95 67C95 81 79 94 60 94C41 94 25 81 25 67C25 51 41 40 60 40Z";
  const FOX_SVG = `<svg class="pwa-fox-svg" viewBox="0 0 120 132" aria-hidden="true" focusable="false">
    <g fill="#f7b55e" stroke="#000" stroke-width="8" stroke-linejoin="round" stroke-linecap="round">
      <path class="pwa-fox-tail" d="M80 123C100 128 117 116 115 97C114 86 105 82 99 87C104 96 101 108 84 109Z"/>
      <path class="pwa-fox-ear-l" d="M50 44C42 30 22 13 9 5C6 22 13 45 30 61Z"/>
      <path class="pwa-fox-ear-r" d="M70 44C78 30 98 13 111 5C114 22 107 45 90 61Z"/>
      <path d="M60 86C80 86 90 102 90 114C90 122 80 126 60 126C40 126 30 122 30 114C30 102 40 86 60 86Z"/>
      <path d="${FOX_HEAD}"/>
      <path fill="#fff1d9" stroke="none" d="M60 72C70 72 77 78 80 85C74 91 67 94 60 94C53 94 46 91 40 85C43 78 50 72 60 72Z"/>
      <path fill="none" d="${FOX_HEAD}"/>
      <g class="pwa-fox-eyes" fill="#000" stroke="none"><circle cx="47" cy="65" r="5.6"/><circle cx="73" cy="65" r="5.6"/></g>
      <path fill="#000" stroke="none" d="M54 77Q60 74 66 77Q63.5 83 60 83.5Q56.5 83 54 77Z"/>
      <path fill="#3a4050" d="M44 41V34Q60 29 76 34V41Q60 47 44 41Z"/>
      <path fill="#3a4050" d="M60 21L89 30.5L60 40L31 30.5Z"/>
    </g>
  </svg>`;

  // In the page's head, before any of the site's CSS. position:fixed needs
  // !important: ambient-bg.css makes the body's children position:relative.
  const FOX_STYLE = `
.pwa-loader{position:fixed!important;inset:0;z-index:2147483000!important;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;background:#e0fbf8;transition:opacity .3s ease,visibility .3s}
html[data-theme="dark"] .pwa-loader{background:#0f2220}
.pwa-loader.is-in{animation:pwa-loader-in .2s ease-out}
.pwa-loader.is-done{opacity:0;visibility:hidden;pointer-events:none}
.pwa-loader .pwa-fox{width:124px}
.pwa-fox{display:flex;flex-direction:column;align-items:center}
.pwa-fox::after{content:"";width:62%;height:11px;margin-top:2px;border-radius:50%;background:rgba(0,0,0,.2);animation:pwa-fox-shadow .9s cubic-bezier(.3,0,.4,1) infinite}
.pwa-fox-svg{display:block;width:100%;height:auto;overflow:visible;transform-origin:50% 100%;animation:pwa-fox-hop .9s cubic-bezier(.3,0,.4,1) infinite}
.pwa-fox-tail{transform-box:fill-box;transform-origin:5% 80%;animation:pwa-fox-wag .45s ease-in-out infinite alternate}
.pwa-fox-ear-l,.pwa-fox-ear-r{transform-box:fill-box;animation:pwa-fox-ears .9s ease-in-out infinite}
.pwa-fox-ear-l{transform-origin:80% 90%}
.pwa-fox-ear-r{transform-origin:20% 90%;animation-direction:reverse}
.pwa-fox-eyes{transform-box:fill-box;transform-origin:50% 50%;animation:pwa-fox-blink 3.2s infinite}
.pwa-loader-bar{position:relative;width:150px;height:18px;border:3px solid #000;border-radius:999px;background:#fff3c4;box-shadow:3px 3px 0 #000;overflow:hidden}
.pwa-loader-bar::before{content:"";position:absolute;top:0;bottom:0;right:0;width:45%;border-radius:999px;background:#00c9b7;animation:pwa-bar 1.1s ease-in-out infinite}
.pwa-loader-text{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
@keyframes pwa-loader-in{from{opacity:0}}
@keyframes pwa-fox-hop{0%,100%{transform:translateY(0) scale(1.08,.92)}15%,85%{transform:translateY(0) scale(1)}50%{transform:translateY(-30px) scale(.96,1.04)}}
@keyframes pwa-fox-shadow{0%,15%,85%,100%{transform:scale(1)}50%{transform:scale(.55);opacity:.5}}
@keyframes pwa-fox-wag{from{transform:rotate(-10deg)}to{transform:rotate(12deg)}}
@keyframes pwa-fox-ears{0%,100%{transform:none}50%{transform:rotate(-8deg)}}
@keyframes pwa-fox-blink{0%,92%,100%{transform:none}96%{transform:scaleY(.15)}}
@keyframes pwa-bar{from{transform:translateX(110%)}to{transform:translateX(-230%)}}
@media (prefers-reduced-motion:reduce){.pwa-fox *,.pwa-fox::after,.pwa-loader-bar::before{animation:none!important}.pwa-loader-bar::before{width:100%;opacity:.6}}
html[data-visual="minimal"] .pwa-fox *,html[data-visual="minimal"] .pwa-fox::after,html[data-visual="minimal"] .pwa-loader-bar::before{animation:none!important}`;

  function standalone() {
    if (matchMedia("(display-mode: standalone)").matches || navigator.standalone === true) return true;
    try {
      return sessionStorage.getItem(APP_KEY) === "1";
    } catch {
      return false;
    }
  }

  function studentKey() {
    const fromUrl = new URLSearchParams(location.search).get("s") || "";
    if (KEY_PATTERN.test(fromUrl)) return fromUrl;
    try {
      const stored = localStorage.getItem("pleyi-student-key") || "";
      return KEY_PATTERN.test(stored) ? stored : "";
    } catch {
      return "";
    }
  }

  function startUrl() {
    const path = location.pathname.replace(/\/+$/, "") || "/";
    if (/^\/s\/[A-Za-z0-9_-]{20,64}$/.test(path) || path === "/admin/students") return path;
    if (path === "/services/english") {
      const key = studentKey();
      return key ? `${path}?s=${key}` : path;
    }
    return "/";
  }

  function pointManifest() {
    const link = document.querySelector('link[rel="manifest"]');
    const start = startUrl();
    if (link && start !== "/") link.href = `/manifest.webmanifest?start=${encodeURIComponent(start)}`;
  }

  // Phones can always add the site to the home screen (from the browser's
  // menu at worst); computers only when the browser offers to install it.
  function refresh() {
    const app = standalone();
    root.classList.toggle("pwa-app", app);
    root.classList.toggle("pwa-can-install", !app && (!!installPrompt || mobile));
  }

  function helpHtml() {
    const steps = ios
      ? [`לחצו על כפתור השיתוף ${SHARE_ICON}`, `בחרו "הוספה למסך הבית"`, `לחצו "הוסף"`]
      : mobile
        ? ["לחצו על התפריט של הדפדפן (שלוש הנקודות)", `בחרו "התקנת אפליקציה" או "הוספה למסך הבית"`]
        : ["פתחו את האתר בדפדפן כרום או אדג'", "לחצו על סמל ההתקנה בצד של שורת הכתובת"];
    const note = mobile ? `<p class="pwa-note">הקישור נפתח בתוך וואטסאפ? פתחו אותו קודם בדפדפן.</p>` : "";
    return `<ol class="pwa-steps">${steps.map((step) => `<li>${step}</li>`).join("")}</ol>${note}`;
  }

  function addFoxStyle() {
    if (document.getElementById("pwa-fox-style")) return;
    const style = document.createElement("style");
    style.id = "pwa-fox-style";
    style.textContent = FOX_STYLE;
    document.head.appendChild(style);
  }

  function makeLoader() {
    addFoxStyle();
    const loader = document.createElement("div");
    loader.className = "pwa-loader";
    loader.setAttribute("role", "status");
    loader.innerHTML = `<span class="pwa-fox">${FOX_SVG}</span><span class="pwa-loader-bar"></span><span class="pwa-loader-text">טוען…</span>`;
    return loader;
  }

  // In the head the body doesn't exist yet: the fox goes in the moment it
  // does, before the browser draws anything of the page.
  function showLoader(loader) {
    if (document.body) {
      document.body.appendChild(loader);
      return;
    }
    const watch = new MutationObserver(() => {
      if (!document.body) return;
      watch.disconnect();
      document.body.prepend(loader);
    });
    watch.observe(root, { childList: true });
  }

  function hideLoader(loader) {
    if (!loader || loader.classList.contains("is-done")) return;
    loader.classList.add("is-done");
    setTimeout(() => loader.remove(), 400);
  }

  // When the app opens, the fox stays until the page has loaded — and long
  // enough to see it hop. A page that the app's previous page was slow to
  // bring keeps the fox that page showed, until it has loaded.
  function bootLoader() {
    if (!standalone()) return;
    let launch = false;
    let fromNav = false;
    try {
      launch = !sessionStorage.getItem(LAUNCHED_KEY);
      fromNav = Date.now() - Number(sessionStorage.getItem(NAV_KEY) || 0) < 15000;
      sessionStorage.setItem(LAUNCHED_KEY, "1");
      sessionStorage.removeItem(NAV_KEY);
    } catch {
      return;
    }
    if (!launch && !fromNav) return;
    const loader = makeLoader();
    showLoader(loader);
    const minMs = launch ? 1300 : 0;
    const finish = () => setTimeout(() => hideLoader(loader), Math.max(0, STARTED + minMs - Date.now()));
    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish, { once: true });
    // Slow pictures or scripts don't keep the page hidden.
    setTimeout(() => hideLoader(loader), launch ? 4500 : 3000);
  }

  function stopNavLoader() {
    clearTimeout(navTimer);
    hideLoader(navLoader);
    navLoader = null;
    try {
      sessionStorage.removeItem(NAV_KEY);
    } catch {
      /* ignore */
    }
  }

  // A link to another page of the app: if it hasn't come within a moment,
  // the fox shows (and the next page keeps it, bootLoader).
  function leavesToPage(e) {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
    const link = e.target.closest?.("a[href]");
    if (!link || (link.target && link.target !== "_self") || link.hasAttribute("download")) return false;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin) return false;
    if (url.pathname === location.pathname && url.search === location.search) return false;
    return !/\.(?!html?$)\w+$/.test(url.pathname);
  }

  document.addEventListener("click", (e) => {
    if (!standalone() || !leavesToPage(e)) return;
    // After the page's own handlers, which may keep the click on the page.
    setTimeout(() => {
      if (e.defaultPrevented) return;
      clearTimeout(navTimer);
      navTimer = setTimeout(() => {
        try {
          sessionStorage.setItem(NAV_KEY, String(Date.now()));
        } catch {
          /* ignore */
        }
        hideLoader(navLoader);
        navLoader = makeLoader();
        navLoader.classList.add("is-in");
        showLoader(navLoader);
        // The link didn't leave the page after all.
        navTimer = setTimeout(stopNavLoader, 8000);
      }, 300);
    });
  });

  // Back on a page the browser kept as it was (the back button).
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) stopNavLoader();
  });

  function addDownloadLinks() {
    if (standalone()) return;
    document.querySelectorAll(".mobile-nav, .site-legal-nav").forEach((nav) => {
      if (nav.querySelector('a[href="/download"]')) return;
      const link = document.createElement("a");
      link.href = "/download";
      link.textContent = "הורדת האפליקציה";
      nav.insertBefore(link, nav.querySelector(".mobile-nav-auth"));
    });
  }

  function drawFoxes() {
    const spots = document.querySelectorAll("[data-pwa-fox]");
    if (!spots.length) return;
    addFoxStyle();
    spots.forEach((spot) => {
      spot.innerHTML = `<span class="pwa-fox">${FOX_SVG}</span>`;
    });
  }

  window.addEventListener("beforeinstallprompt", (e) => {
    // No automatic banner — it would cover the exercise screens. The page's
    // install button shows the prompt instead.
    e.preventDefault();
    installPrompt = e;
    refresh();
  });

  window.addEventListener("appinstalled", () => {
    installPrompt = null;
    root.classList.remove("pwa-can-install");
    root.classList.add("pwa-installed");
  });

  document.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-pwa-install-btn]");
    if (!btn) return;
    if (installPrompt) {
      // The browser hands out each prompt once.
      const prompt = installPrompt;
      installPrompt = null;
      try {
        await prompt.prompt();
        const choice = await prompt.userChoice;
        if (choice.outcome === "accepted") root.classList.add("pwa-installed");
      } catch {
        installPrompt = prompt;
      }
      refresh();
      return;
    }
    const help = btn.closest("[data-pwa-install]")?.querySelector("[data-pwa-help]");
    if (!help) return;
    if (!help.innerHTML.trim()) help.innerHTML = helpHtml();
    help.hidden = !help.hidden;
    btn.setAttribute("aria-expanded", String(!help.hidden));
  });

  pointManifest();
  refresh();
  bootLoader();
  const onReady = () => {
    addDownloadLinks();
    drawFoxes();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", onReady, { once: true });
  else onReady();
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
  }
})();
