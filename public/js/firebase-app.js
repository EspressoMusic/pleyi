/* Firebase initialization — config from /api/firebase-config */

window.FirebaseApp = {
  auth: null,
  db: null,
  configured: false,
  ready: null,
};

window.FirebaseApp.ready = (async function initFirebase() {
  if (typeof firebase === "undefined") return false;
  try {
    const res = await fetch("/api/firebase-config");
    const config = await res.json();
    if (!config?.apiKey || !config?.projectId) return false;

    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    }

    window.FirebaseApp.auth = firebase.auth();
    // Pages that only sign in (e.g. /admin/students) skip the Firestore SDK.
    window.FirebaseApp.db = firebase.firestore ? firebase.firestore() : null;
    window.FirebaseApp.configured = true;
    return true;
  } catch (err) {
    console.warn("Firebase not configured:", err);
    return false;
  }
})();
