const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PREMIUM_GAMES = ["hangman", "word-shop"];

const FREE_WEEKLY_CUSTOM_GAMES = 2;

const PLANS = {
  monthly: {
    id: "monthly",
    label: "חודשי",
    price: 39,
    currency: "ILS",
    days: 31,
    badge: "גמיש",
  },
  yearly: {
    id: "yearly",
    label: "שנתי",
    price: 299,
    currency: "ILS",
    days: 365,
    badge: "חסכון",
  },
};

const SUBSCRIPTIONS_FILE = path.join(__dirname, "..", "data", "premium-subscriptions.json");

function loadSubscriptions() {
  try {
    if (fs.existsSync(SUBSCRIPTIONS_FILE)) {
      return JSON.parse(fs.readFileSync(SUBSCRIPTIONS_FILE, "utf8"));
    }
  } catch {
    /* ignore */
  }
  return {};
}

function saveSubscriptions(data) {
  fs.mkdirSync(path.dirname(SUBSCRIPTIONS_FILE), { recursive: true });
  fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(data, null, 2), "utf8");
}

function isPremiumActive(record) {
  if (!record?.premiumUntil) return false;
  return new Date(record.premiumUntil) > new Date();
}

function getStatus(uid) {
  if (!uid) {
    return { isPremium: false, premiumUntil: null, plan: null };
  }
  const subs = loadSubscriptions();
  const record = subs[uid];
  return {
    isPremium: isPremiumActive(record),
    premiumUntil: record?.premiumUntil || null,
    plan: record?.plan || null,
  };
}

function activateSubscription(uid, email, planId, method) {
  const plan = PLANS[planId];
  if (!plan) throw new Error("תוכנית מנוי לא קיימת");
  if (!uid) throw new Error("יש להתחבר כדי לרכוש מנוי");

  const subs = loadSubscriptions();
  const existing = subs[uid];
  let start = new Date();
  if (isPremiumActive(existing)) {
    start = new Date(existing.premiumUntil);
  }

  const until = new Date(start.getTime() + plan.days * 86400000);
  const paymentId = `${method || "card"}_${crypto.randomBytes(6).toString("hex")}`;

  subs[uid] = {
    uid,
    email: (email || "").trim(),
    plan: planId,
    premiumUntil: until.toISOString(),
    paymentId,
    paymentMethod: method || "card",
    updatedAt: new Date().toISOString(),
  };

  saveSubscriptions(subs);
  return subs[uid];
}

function isPremiumGame(gameId) {
  return PREMIUM_GAMES.includes(gameId);
}

module.exports = {
  PREMIUM_GAMES,
  PLANS,
  FREE_WEEKLY_CUSTOM_GAMES,
  getStatus,
  activateSubscription,
  isPremiumGame,
  isPremiumActive,
};
