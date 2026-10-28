/* Installing Pleyi as an app — the manifest (/manifest.webmanifest, built in
   server.js) and the service worker (/sw.js) make the site installable.

   - The installed app opens where it was installed from: a student's own
     page (/s/<key>, or the English page with their key), the teacher's
     student list, or else the home page. On iPhones the installed app
     doesn't share the browser's storage, so the student's key has to travel
     in that address.
   - Install buttons: a [data-pwa-install] block is shown by the page's CSS
     under html.pwa-can-install. Its [data-pwa-install-btn] opens the
     browser's install prompt, or — where the browser has none (iPhones) —
     the steps in its [data-pwa-help]. */

(function () {
  const KEY_PATTERN = /^[A-Za-z0-9_-]{20,64}$/;
  const root = document.documentElement;
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const mobile = ios || /Android|Mobi/i.test(navigator.userAgent);
  let installPrompt = null;

  const SHARE_ICON = `<svg class="pwa-share-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="שיתוף"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M8 10H6a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1h-2"/></svg>`;

  function standalone() {
    return matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
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
    root.classList.toggle("pwa-can-install", !standalone() && (!!installPrompt || mobile));
  }

  function helpHtml() {
    const steps = ios
      ? [`לחצו על כפתור השיתוף ${SHARE_ICON}`, `בחרו "הוספה למסך הבית"`, `לחצו "הוסף"`]
      : ["לחצו על התפריט של הדפדפן (שלוש הנקודות)", `בחרו "התקנת אפליקציה" או "הוספה למסך הבית"`];
    return `
      <ol class="pwa-steps">${steps.map((step) => `<li>${step}</li>`).join("")}</ol>
      <p class="pwa-note">הקישור נפתח בתוך וואטסאפ? פתחו אותו קודם בדפדפן.</p>`;
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
        await prompt.userChoice;
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
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
  }
})();
