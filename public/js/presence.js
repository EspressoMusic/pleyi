/* Counts who's on the site right now, for the owner's developer panel
   (/admin/dev, lib/presence.js). While this page is on screen it says "here"
   every 25 seconds, and "gone" when it's hidden or closed. Only a random id
   made for this page view and the page's address are sent. Nothing is kept
   on the device. Loaded by pwa.js (and directly by pages without it). */

(function () {
  if (window.__pleyiPresence || !navigator.sendBeacon) return;
  window.__pleyiPresence = true;

  const EVERY_MS = 25000;
  const id = Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
  let timer = null;

  function send(leave) {
    try {
      const body = JSON.stringify({ id, path: location.pathname, leave: !!leave });
      navigator.sendBeacon("/api/presence", new Blob([body], { type: "application/json" }));
    } catch {
      /* counting is never worth an error */
    }
  }

  function start() {
    if (timer) return;
    send(false);
    timer = setInterval(() => send(false), EVERY_MS);
  }

  function stop() {
    if (!timer) return;
    clearInterval(timer);
    timer = null;
    send(true);
  }

  document.addEventListener("visibilitychange", () => (document.visibilityState === "visible" ? start() : stop()));
  addEventListener("pagehide", stop);
  addEventListener("pageshow", (e) => {
    if (e.persisted && document.visibilityState === "visible") start();
  });
  if (document.visibilityState === "visible") start();
})();
