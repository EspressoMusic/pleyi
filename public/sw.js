/* Pleyi service worker — it is what lets the site be installed as an app
   (an icon on the phone's home screen, opening without the browser bars).

   It doesn't cache the site: every page and file still comes from the
   network, and the ?v=N on each link keeps them fresh as before. Only when
   there is no connection does a page request get the small offline page. */

const CACHE = "pleyi-offline-v1";
const OFFLINE_URL = "/offline.html";

// Where the browser can't keep files (blocked storage, some private modes)
// the worker installs anyway — the app still installs, just with no
// offline page.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.add(new Request(OFFLINE_URL, { cache: "reload" })))
      .catch(() => {})
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)));
      // Lets the page request start while the worker is still waking up.
      if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
      await self.clients.claim();
    })()
  );
});

// Pages only — files, API calls and the game rooms' socket go straight to
// the network without the worker.
self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;
  event.respondWith(
    (async () => {
      try {
        return (await event.preloadResponse) || (await fetch(event.request));
      } catch {
        return (await caches.match(OFFLINE_URL)) || Response.error();
      }
    })()
  );
});
