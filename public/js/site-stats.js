/* Counts what people open, for the owner's developer panel (/admin/dev,
   lib/site-stats.js): a lesson opened, a game started, a sheet printed or
   downloaded. Only the thing's id and name are sent — once per page view —
   and nothing is kept on the device. Loaded by pwa.js.

     PleyiStats.hit("lesson" | "game" | "download", id, title)

   Downloads count by themselves too: any print, and any link with a
   `download` attribute. */

(function () {
  if (window.PleyiStats?.ready) return;
  const queued = window.PleyiStats?.q || [];

  const sent = new Set();
  let lastDownloadAt = 0;

  // Private pages (a student's file, the admin pages) aren't counted.
  const PRIVATE = /^\/(s|p|c|admin)(\/|$)/;

  function hit(kind, id, title) {
    if (!id || PRIVATE.test(location.pathname)) return;
    if (kind === "download") lastDownloadAt = Date.now();
    const key = `${kind}:${id}`;
    if (sent.has(key)) return;
    sent.add(key);
    try {
      const body = JSON.stringify({ kind, id: String(id), title: String(title || "") });
      if (navigator.sendBeacon) navigator.sendBeacon("/api/stats/hit", new Blob([body], { type: "application/json" }));
      else fetch("/api/stats/hit", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
    } catch {
      /* counting is never worth an error */
    }
  }

  window.PleyiStats = { hit, ready: true };
  queued.forEach((args) => hit(...args));

  // A print nobody named (a page's own print button): the page's name.
  addEventListener("beforeprint", () => {
    if (Date.now() - lastDownloadAt < 3000) return;
    hit("download", `print${location.pathname}${location.search}`, document.title);
  });

  document.addEventListener(
    "click",
    (e) => {
      const link = e.target.closest?.("a[download]");
      if (!link) return;
      const file = link.getAttribute("download") || link.pathname.split("/").pop() || "";
      hit("download", link.pathname, file.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " "));
    },
    true
  );
})();
