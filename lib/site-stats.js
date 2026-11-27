/* What people open on the site — for the developer panel (/admin/dev):
   lessons opened, games started and sheets printed or downloaded.

   Each page sends one "hit" per thing per page view (public/js/site-stats.js),
   with just the thing's id and name — nothing about who sent it. The totals
   are kept in memory and written once a minute to Firestore (siteStats/totals)
   or, without it, to data/site-stats.json. */

const fs = require("fs");
const path = require("path");
const { FieldValue } = require("firebase-admin/firestore");
const { getFirestore } = require("./firebase-admin");

const KINDS = ["lesson", "game", "download"];
const LOCAL_FILE = path.join(__dirname, "..", "data", "site-stats.json");
const COLLECTION = "siteStats";
const DOC = "totals";
const FLUSH_EVERY_MS = 60000;
const MAX_IDS_PER_KIND = 3000;
const MAX_HITS_PER_ADDRESS = 150; // in ADDRESS_WINDOW_MS
const ADDRESS_WINDOW_MS = 10 * 60 * 1000;

const empty = () => ({ lesson: {}, game: {}, download: {} });

let mirror = null; // what's saved + everything since → { since, lesson: { id: { t, n } }, … }
let pending = empty(); // not written yet → { id: { t, n } }
let loading = null;
let flushing = false;
const perAddress = new Map(); // address → { count, since }

const cleanId = (raw) =>
  String(raw || "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);

const cleanTitle = (raw) => String(raw || "").replace(/\s+/g, " ").trim().slice(0, 80);

function add(into, kind, id, title, n) {
  const bucket = into[kind] || (into[kind] = {});
  const entry = bucket[id] || (bucket[id] = { t: "", n: 0 });
  entry.n += n;
  if (title) entry.t = title;
}

async function readSaved() {
  const db = getFirestore();
  if (db) {
    const doc = await db.collection(COLLECTION).doc(DOC).get();
    return doc.exists ? doc.data() : null;
  }
  try {
    if (fs.existsSync(LOCAL_FILE)) return JSON.parse(fs.readFileSync(LOCAL_FILE, "utf8"));
  } catch {
    /* a broken file starts over */
  }
  return null;
}

function load() {
  if (!loading) {
    loading = readSaved()
      .catch((err) => {
        console.warn("[site-stats] read failed:", err.message);
        return null;
      })
      .then((saved) => {
        mirror = { since: saved?.since || new Date().toISOString(), ...empty() };
        KINDS.forEach((kind) =>
          Object.entries(saved?.[kind] || {}).forEach(([id, e]) => add(mirror, kind, id, e?.t, Number(e?.n) || 0))
        );
        KINDS.forEach((kind) => Object.entries(pending[kind]).forEach(([id, e]) => add(mirror, kind, id, e.t, e.n)));
      });
  }
  return loading;
}

function allowed(address) {
  const now = Date.now();
  const a = perAddress.get(address);
  if (!a || now - a.since > ADDRESS_WINDOW_MS) {
    if (perAddress.size > 5000) perAddress.clear();
    perAddress.set(address, { count: 1, since: now });
    return true;
  }
  a.count += 1;
  return a.count <= MAX_HITS_PER_ADDRESS;
}

function hit({ kind, id, title } = {}, address = "?") {
  if (!KINDS.includes(kind)) return;
  const cleanedId = cleanId(id);
  if (!cleanedId || !allowed(address)) return;
  const known = mirror?.[kind]?.[cleanedId] || pending[kind][cleanedId];
  if (!known && Object.keys(mirror?.[kind] || pending[kind]).length >= MAX_IDS_PER_KIND) return;
  const t = cleanTitle(title);
  add(pending, kind, cleanedId, t, 1);
  if (mirror) add(mirror, kind, cleanedId, t, 1);
  else load();
}

async function flush() {
  if (flushing) return;
  await load();
  const batch = pending;
  if (!KINDS.some((kind) => Object.keys(batch[kind]).length)) return;
  pending = empty();
  flushing = true;
  try {
    const db = getFirestore();
    if (db) {
      const update = { since: mirror.since };
      KINDS.forEach((kind) => {
        const part = {};
        Object.entries(batch[kind]).forEach(([id, e]) => {
          part[id] = { n: FieldValue.increment(e.n), ...(e.t ? { t: e.t } : {}) };
        });
        if (Object.keys(part).length) update[kind] = part;
      });
      await db.collection(COLLECTION).doc(DOC).set(update, { merge: true });
    } else {
      fs.mkdirSync(path.dirname(LOCAL_FILE), { recursive: true });
      fs.writeFileSync(LOCAL_FILE, JSON.stringify(mirror), "utf8");
    }
  } catch (err) {
    console.warn("[site-stats] write failed:", err.message);
    KINDS.forEach((kind) => Object.entries(batch[kind]).forEach(([id, e]) => add(pending, kind, id, e.t, e.n)));
  } finally {
    flushing = false;
  }
}

// The most opened of each kind, for the panel.
async function top(limit = 5) {
  await load();
  const out = { since: mirror.since };
  KINDS.forEach((kind) => {
    const list = Object.entries(mirror[kind]).map(([id, e]) => ({ id, title: e.t || id, count: e.n }));
    out[kind] = {
      total: list.reduce((sum, e) => sum + e.count, 0),
      top: list.sort((a, b) => b.count - a.count).slice(0, limit),
    };
  });
  return out;
}

// Render's proxy adds the caller's address last.
function address(req) {
  const fwd = String(req.headers["x-forwarded-for"] || "").split(",").map((s) => s.trim()).filter(Boolean);
  return fwd[fwd.length - 1] || req.socket?.remoteAddress || "?";
}

function mount(app) {
  app.post("/api/stats/hit", (req, res) => {
    hit(req.body || {}, address(req));
    res.status(204).end();
  });
  setInterval(flush, FLUSH_EVERY_MS).unref();
  // On a restart, write what's left — but never hold the restart up.
  const last = () => {
    setTimeout(() => process.exit(0), 3000).unref();
    flush().finally(() => process.exit(0));
  };
  process.once("SIGTERM", last);
  process.once("SIGINT", last);
}

module.exports = { mount, hit, top };
