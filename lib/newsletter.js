/**
 * Newsletter sign-up: adds the email to a contact list in Brevo (brevo.com).
 * The newsletter itself is written and sent from Brevo's own site, which also
 * adds the unsubscribe link. Needs BREVO_API_KEY + BREVO_LIST_ID; without them
 * the home-page form stays hidden.
 */

const BREVO_CONTACTS_URL = "https://api.brevo.com/v3/contacts";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// A few tries per address per 10 minutes, so the form can't be used to flood the list.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const recentByIp = new Map();

function isConfigured() {
  return !!(process.env.BREVO_API_KEY && Number(process.env.BREVO_LIST_ID));
}

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function checkRate(ip) {
  const now = Date.now();
  for (const [key, entry] of recentByIp) {
    if (now > entry.reset) recentByIp.delete(key);
  }
  const entry = recentByIp.get(ip) || { count: 0, reset: now + WINDOW_MS };
  entry.count += 1;
  recentByIp.set(ip, entry);
  if (entry.count > MAX_PER_WINDOW) throw httpError(429, "יותר מדי ניסיונות. נסו שוב מאוחר יותר");
}

async function subscribe({ email, ip }) {
  if (!isConfigured()) throw httpError(503, "ההרשמה עוד לא פתוחה");
  const clean = String(email || "").trim().toLowerCase();
  if (clean.length > 254 || !EMAIL_RE.test(clean)) throw httpError(400, "כתובת המייל לא נראית תקינה");
  checkRate(ip || "unknown");

  const resp = await fetch(BREVO_CONTACTS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    // updateEnabled: someone already in Brevo is just added to the list again.
    body: JSON.stringify({
      email: clean,
      listIds: [Number(process.env.BREVO_LIST_ID)],
      updateEnabled: true,
    }),
  });
  if (resp.ok) return { subscribed: true };

  const data = await resp.json().catch(() => ({}));
  if (data.code === "invalid_parameter") throw httpError(400, "כתובת המייל לא נראית תקינה");
  console.error("Brevo sign-up failed:", resp.status, data.code, data.message);
  throw httpError(502, "משהו השתבש. נסו שוב מאוחר יותר");
}

module.exports = { isConfigured, subscribe };
