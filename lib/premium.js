const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { getFirestore } = require("./firebase-admin");

const PREMIUM_GAMES = ["hangman", "word-shop"];

const FREE_WEEKLY_CUSTOM_GAMES = 2;

const CREDITS_BY_PLAN = {
  free: 10,
  monthly: 50,
  yearly: 120,
};

const DEFAULT_CREDITS = CREDITS_BY_PLAN.free;
const AI_GAME_CREDIT_COST = 1;

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

/**
 * Uses Firestore (`users/{uid}.premium`) when a service account is configured, so
 * subscription status survives redeploys. Falls back to the local JSON file
 * (data/premium-subscriptions.json) for local dev when it isn't.
 */
async function getRecord(uid) {
  const db = getFirestore();
  if (db) {
    const doc = await db.collection("users").doc(uid).get();
    return doc.data()?.premium || null;
  }
  const subs = loadSubscriptions();
  return subs[uid] || null;
}

async function saveRecord(uid, record) {
  const db = getFirestore();
  if (db) {
    await db.collection("users").doc(uid).set({ premium: record }, { merge: true });
    return;
  }
  const subs = loadSubscriptions();
  subs[uid] = record;
  saveSubscriptions(subs);
}

async function getStatus(uid) {
  if (!uid) {
    return { isPremium: false, premiumUntil: null, plan: null };
  }
  const record = await getRecord(uid);
  return {
    isPremium: isPremiumActive(record),
    premiumUntil: record?.premiumUntil || null,
    plan: record?.plan || null,
  };
}

async function activateSubscription(uid, email, planId, method) {
  const plan = PLANS[planId];
  if (!plan) throw new Error("תוכנית מנוי לא קיימת");
  if (!uid) throw new Error("יש להתחבר כדי לרכוש מנוי");

  const existing = await getRecord(uid);
  let start = new Date();
  if (isPremiumActive(existing)) {
    start = new Date(existing.premiumUntil);
  }

  const until = new Date(start.getTime() + plan.days * 86400000);
  const paymentId = `${method || "card"}_${crypto.randomBytes(6).toString("hex")}`;

  const record = {
    uid,
    email: (email || "").trim(),
    plan: planId,
    premiumUntil: until.toISOString(),
    paymentId,
    paymentMethod: method || "card",
    updatedAt: new Date().toISOString(),
  };

  await saveRecord(uid, record);
  return record;
}

function isPremiumGame(gameId) {
  return PREMIUM_GAMES.includes(gameId);
}

module.exports = {
  PREMIUM_GAMES,
  PLANS,
  FREE_WEEKLY_CUSTOM_GAMES,
  CREDITS_BY_PLAN,
  DEFAULT_CREDITS,
  AI_GAME_CREDIT_COST,
  getStatus,
  activateSubscription,
  isPremiumGame,
  isPremiumActive,
};
