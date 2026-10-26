const fs = require("fs");
const path = require("path");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore: getAdminFirestore } = require("firebase-admin/firestore");

const SERVICE_ACCOUNT_PATH = path.join(__dirname, "..", "data", "firebase-service-account.json");
const FIREBASE_CONFIG_PATH = path.join(__dirname, "..", "data", "firebase.json");

let app;
let initTried = false;

function getApiKey() {
  if (process.env.FIREBASE_API_KEY) return process.env.FIREBASE_API_KEY;
  if (fs.existsSync(FIREBASE_CONFIG_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(FIREBASE_CONFIG_PATH, "utf8")).apiKey || null;
    } catch {
      return null;
    }
  }
  return null;
}

function loadServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  }
  if (fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    return JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, "utf8"));
  }
  return null;
}

function getAdminApp() {
  if (initTried) return app || null;
  initTried = true;
  try {
    const serviceAccount = loadServiceAccount();
    if (!serviceAccount) return null;
    app = initializeApp({ credential: cert(serviceAccount) });
    return app;
  } catch (err) {
    console.error("Firebase Admin init failed — falling back to local file storage:", err.message);
    return null;
  }
}

function getFirestore() {
  const a = getAdminApp();
  return a ? getAdminFirestore(a) : null;
}

/**
 * Verifies a client-supplied Firebase Auth ID token server-side, so endpoints
 * that act on a `uid` (premium status/subscription) can trust it actually
 * belongs to the caller instead of taking a raw uid from the request body.
 * Uses the Identity Toolkit REST API with the public client API key — this
 * works even when no Admin SDK service account is configured locally.
 * Returns the verified { uid, email } or null if the token is missing/invalid.
 */
async function verifyIdToken(idToken) {
  const apiKey = getApiKey();
  if (!apiKey || !idToken) return null;
  try {
    const resp = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      }
    );
    if (!resp.ok) return null;
    const data = await resp.json();
    const user = data.users?.[0];
    return user ? { uid: user.localId, email: user.email || null } : null;
  } catch {
    return null;
  }
}

module.exports = { getFirestore, verifyIdToken };
