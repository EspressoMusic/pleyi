/* Who's on the site right now — for the owner's developer panel (/admin/dev).

   Every open page that's on screen says "here" every 25 seconds
   (public/js/presence.js), and "gone" when it's hidden or closed. All we get
   is a random id made for that one page view and the page's address. It's
   kept only in memory, and a page is forgotten a minute after its last word
   (or right away on "gone"). Nothing is saved, and a restart starts over. */

const WINDOW_MS = 60000;
const MAX_PAGES = 20000;
const PRUNE_EVERY_MS = 5000;

const pages = new Map(); // id → { path, at }
let peak = { count: 0, at: null };
let lastPrune = 0;

const ID_PATTERN = /^[a-z0-9]{8,40}$/i;

// Only the page's path, without a student's or class's private key in it.
function cleanPath(raw) {
  let p = String(raw || "").split(/[?#]/)[0].slice(0, 120);
  if (!p.startsWith("/")) return null;
  p = p.replace(/^\/(s|p|c)\/[^/]+.*/, "/$1/*").replace(/\/+$/, "") || "/";
  return /^[\w\-./*]+$/.test(p) ? p : "/?";
}

function prune(now = Date.now()) {
  if (now - lastPrune < PRUNE_EVERY_MS) return;
  lastPrune = now;
  pages.forEach((page, id) => {
    if (now - page.at > WINDOW_MS) pages.delete(id);
  });
}

function ping({ id, path, leave } = {}) {
  if (typeof id !== "string" || !ID_PATTERN.test(id)) return;
  if (leave) {
    pages.delete(id);
    return;
  }
  const clean = cleanPath(path);
  if (!clean) return;
  const now = Date.now();
  prune(now);
  if (!pages.has(id) && pages.size >= MAX_PAGES) return;
  pages.set(id, { path: clean, at: now });
  if (pages.size > peak.count) peak = { count: pages.size, at: new Date(now).toISOString() };
}

function live() {
  lastPrune = 0;
  prune();
  const byPath = new Map();
  pages.forEach(({ path }) => byPath.set(path, (byPath.get(path) || 0) + 1));
  return {
    now: pages.size,
    pages: [...byPath].map(([path, count]) => ({ path, count })).sort((a, b) => b.count - a.count || a.path.localeCompare(b.path)),
    peak,
  };
}

function mount(app) {
  app.post("/api/presence", (req, res) => {
    ping(req.body || {});
    res.status(204).end();
  });
}

module.exports = { mount, live };
