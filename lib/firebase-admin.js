const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

const SERVICE_ACCOUNT_PATH = path.join(__dirname, "..", "data", "firebase-service-account.json");

let app;
let initTried = false;

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
    app = admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    return app;
  } catch (err) {
    console.error("Firebase Admin init failed — falling back to local file storage:", err.message);
    return null;
  }
}

function getFirestore() {
  const a = getAdminApp();
  return a ? admin.firestore() : null;
}

module.exports = { getFirestore };
