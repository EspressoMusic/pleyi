/* The developer panel's (/admin/dev) password.

   The password lives only in the DEV_PANEL_PASSWORD environment variable
   (.env locally, Render's environment in production). Until it's set,
   nobody can sign in.

   A right password gets an HttpOnly cookie that holds an expiry time and a
   signature made with the password itself, so changing the password signs
   everyone out. Wrong guesses are limited per address. */

const crypto = require("crypto");

const COOKIE = "pleyi_dev";
const COOKIE_PATH = "/api/admin/dev";
const SESSION_DAYS = 30;
const MAX_FAILS = 8;
const FAIL_WINDOW_MS = 15 * 60 * 1000;

const fails = new Map(); // address → { count, since }

const password = () => String(process.env.DEV_PANEL_PASSWORD || "");

const sha = (text) => crypto.createHash("sha256").update(String(text)).digest();

function sign(exp) {
  return crypto.createHmac("sha256", password()).update(`dev-panel:${exp}`).digest("hex");
}

function readCookie(req) {
  const raw = req.headers.cookie || "";
  for (const part of raw.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === COOKIE) return decodeURIComponent(rest.join("="));
  }
  return "";
}

function isSignedIn(req) {
  if (!password()) return false;
  const [exp, sig] = readCookie(req).split(".");
  if (!exp || !sig || !/^\d+$/.test(exp) || Number(exp) < Date.now()) return false;
  const want = Buffer.from(sign(exp));
  const got = Buffer.from(sig);
  return got.length === want.length && crypto.timingSafeEqual(got, want);
}

// Render's proxy adds the caller's address last.
function address(req) {
  const fwd = String(req.headers["x-forwarded-for"] || "").split(",").map((s) => s.trim()).filter(Boolean);
  return fwd[fwd.length - 1] || req.socket?.remoteAddress || "?";
}

function blocked(addr) {
  const f = fails.get(addr);
  if (!f) return false;
  if (Date.now() - f.since > FAIL_WINDOW_MS) {
    fails.delete(addr);
    return false;
  }
  return f.count >= MAX_FAILS;
}

function noteFail(addr) {
  const f = fails.get(addr);
  if (!f || Date.now() - f.since > FAIL_WINDOW_MS) fails.set(addr, { count: 1, since: Date.now() });
  else f.count += 1;
}

function setCookie(req, res, value, maxAgeSec) {
  const secure = req.secure || req.headers["x-forwarded-proto"] === "https";
  res.set(
    "Set-Cookie",
    `${COOKIE}=${encodeURIComponent(value)}; Path=${COOKIE_PATH}; Max-Age=${maxAgeSec}; HttpOnly; SameSite=Strict${secure ? "; Secure" : ""}`
  );
}

function requireDevPassword(req, res, next) {
  if (!isSignedIn(req)) return res.status(401).json({ ok: false, error: "צריך להיכנס עם הסיסמה" });
  next();
}

function mount(app) {
  app.post("/api/admin/dev/login", (req, res) => {
    res.set("Cache-Control", "no-store");
    if (!password()) return res.status(503).json({ ok: false, error: "עוד לא הוגדרה סיסמה לפאנל" });
    const addr = address(req);
    if (blocked(addr)) return res.status(429).json({ ok: false, error: "יותר מדי ניסיונות. נסו שוב בעוד רבע שעה" });
    const given = String(req.body?.password || "");
    if (!crypto.timingSafeEqual(sha(given), sha(password()))) {
      noteFail(addr);
      return res.status(401).json({ ok: false, error: "הסיסמה לא נכונה" });
    }
    fails.delete(addr);
    const exp = Date.now() + SESSION_DAYS * 86400000;
    setCookie(req, res, `${exp}.${sign(exp)}`, SESSION_DAYS * 86400);
    res.json({ ok: true });
  });

  app.post("/api/admin/dev/logout", (req, res) => {
    setCookie(req, res, "", 0);
    res.json({ ok: true });
  });
}

module.exports = { mount, requireDevPassword };
