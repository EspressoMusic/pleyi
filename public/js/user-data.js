/* Pleyi — Firestore: saved games + play history */

const FREE_WEEKLY_CUSTOM_GAMES = 2;

window.UserData = {
  FREE_WEEKLY_CUSTOM_GAMES,

  _uid() {
    return window.GameAuth?.getUser()?.uid || null;
  },

  _db() {
    return window.FirebaseApp?.db || null;
  },

  _weekStartDate(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - day);
    return d;
  },

  _isPremiumUser() {
    return !!window.PleyiPremium?.hasPremium?.();
  },

  async countCustomGamesThisWeek() {
    const uid = this._uid();
    const db = this._db();
    if (!uid || !db) return 0;

    const weekStart = this._weekStartDate();
    const weekStartTs = firebase.firestore.Timestamp.fromDate(weekStart);

    try {
      const snap = await db
        .collection("savedGames")
        .where("userId", "==", uid)
        .where("createdAt", ">=", weekStartTs)
        .get();
      return snap.size;
    } catch (err) {
      if (err?.code !== "failed-precondition") throw err;
      const games = await this.getSavedGames();
      const weekMs = weekStart.getTime();
      return games.filter((g) => (g.createdAt?.toMillis?.() ?? 0) >= weekMs).length;
    }
  },

  async getCustomGameQuota() {
    const limit = FREE_WEEKLY_CUSTOM_GAMES;
    if (this._isPremiumUser()) {
      return {
        isPremium: true,
        limit: null,
        used: 0,
        remaining: null,
        allowed: true,
        message: null,
      };
    }

    const used = await this.countCustomGamesThisWeek();
    const remaining = Math.max(0, limit - used);
    const allowed = used < limit;

    return {
      isPremium: false,
      limit,
      used,
      remaining,
      allowed,
      message: allowed
        ? null
        : `הגעתם למכסה — ${limit} משחקים מותאמים בשבוע בגרסה החינמית. שדרגו לפרימיום ליצירה ללא הגבלה.`,
    };
  },

  async saveCustomGame({ title, subject, gameId, content, items }) {
    const uid = this._uid();
    const db = this._db();
    if (!uid || !db) return { ok: false, error: "יש להתחבר כדי לשמור" };

    if (!this._isPremiumUser()) {
      const quota = await this.getCustomGameQuota();
      if (!quota.allowed) {
        return { ok: false, error: quota.message, limitReached: true };
      }
    }

    const doc = {
      userId: uid,
      title: title || "שיעור מותאם אישית",
      subject,
      gameId,
      content,
      items,
      starred: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    const ref = await db.collection("savedGames").add(doc);
    return { ok: true, id: ref.id };
  },

  async updateCustomGame(id, { title, subject, gameId, content, items }) {
    const uid = this._uid();
    const db = this._db();
    if (!uid || !db) return { ok: false, error: "יש להתחבר" };

    await db.collection("savedGames").doc(id).update({
      title: title || "שיעור מותאם אישית",
      subject,
      gameId,
      content,
      items,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    return { ok: true, id };
  },

  async getSavedGames() {
    const uid = this._uid();
    const db = this._db();
    if (!uid || !db) return [];

    const snap = await db
      .collection("savedGames")
      .where("userId", "==", uid)
      .orderBy("updatedAt", "desc")
      .limit(50)
      .get();

    return snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => {
      const starredDiff = Number(!!b.starred) - Number(!!a.starred);
      if (starredDiff) return starredDiff;
      const ta = a.updatedAt?.toMillis?.() ?? a.createdAt?.toMillis?.() ?? 0;
      const tb = b.updatedAt?.toMillis?.() ?? b.createdAt?.toMillis?.() ?? 0;
      return tb - ta;
    });
  },

  async toggleSavedGameStar(id) {
    const uid = this._uid();
    const db = this._db();
    if (!uid || !db) return { ok: false, error: "יש להתחבר" };

    const ref = db.collection("savedGames").doc(id);
    const doc = await ref.get();
    if (!doc.exists || doc.data().userId !== uid) return { ok: false, error: "לא נמצא" };

    const starred = !doc.data().starred;
    await ref.update({
      starred,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    return { ok: true, starred };
  },

  async deleteSavedGame(id) {
    const uid = this._uid();
    const db = this._db();
    if (!uid || !db) return { ok: false };

    const ref = db.collection("savedGames").doc(id);
    const doc = await ref.get();
    if (!doc.exists || doc.data().userId !== uid) return { ok: false };
    await ref.delete();
    return { ok: true };
  },

  async recordPlay({ gameId, gameTitle, customGameId, isCustom, score, reason }) {
    const uid = this._uid();
    const db = this._db();
    if (!uid || !db) return;

    await db.collection("playHistory").add({
      userId: uid,
      gameId,
      gameTitle: gameTitle || gameId,
      customGameId: customGameId || null,
      isCustom: !!isCustom,
      score: score ?? 0,
      reason: reason || "",
      playedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  },

  async getPlayHistory(limit = 30) {
    const uid = this._uid();
    const db = this._db();
    if (!uid || !db) return [];

    const snap = await db
      .collection("playHistory")
      .where("userId", "==", uid)
      .orderBy("playedAt", "desc")
      .limit(limit)
      .get();

    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  launchGame({ subject, gameId, items, title, savedGameId }) {
    sessionStorage.setItem(
      "gameclass-custom",
      JSON.stringify({
        subject,
        gameId,
        vocab: items,
        title: title || "שיעור מותאם אישית",
        savedGameId: savedGameId || null,
      })
    );
    window.open(`/play/${gameId}`, "_blank", "noopener");
  },

  formatDate(ts) {
    if (!ts) return "";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("he-IL", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  async syncPremiumStatus({ isPremium, premiumUntil, plan } = {}) {
    const uid = this._uid();
    const db = this._db();
    if (!uid || !db) return { ok: false };

    await db.collection("users").doc(uid).set(
      {
        premium: {
          isPremium: !!isPremium,
          premiumUntil: premiumUntil || null,
          plan: plan || null,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        },
      },
      { merge: true }
    );
    return { ok: true };
  },
};
