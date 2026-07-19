/* Pleyi — Firestore: saved games + play history + credits */

const FREE_WEEKLY_CUSTOM_GAMES = 2;
const CREDITS_BY_PLAN = { free: 10, monthly: 50, yearly: 120 };
const DEFAULT_CREDITS = CREDITS_BY_PLAN.free;
const AI_GAME_CREDIT_COST = 1;

window.UserData = {
  FREE_WEEKLY_CUSTOM_GAMES,
  CREDITS_BY_PLAN,
  DEFAULT_CREDITS,
  AI_GAME_CREDIT_COST,

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

  _creditsAllowanceForPlan(planId) {
    if (planId && CREDITS_BY_PLAN[planId]) return CREDITS_BY_PLAN[planId];
    if (this._isPremiumUser()) {
      const plan = window.PleyiPremium?.getStatus?.()?.plan;
      if (plan && CREDITS_BY_PLAN[plan]) return CREDITS_BY_PLAN[plan];
    }
    return CREDITS_BY_PLAN.free;
  },

  _dispatchCredits(balance, allowance) {
    document.dispatchEvent(
      new CustomEvent("credits-updated", { detail: { balance, allowance } })
    );
  },

  async ensureCreditsInitialized() {
    const uid = this._uid();
    const db = this._db();
    if (!uid || !db) return null;

    if (window.GameAuth?.isDevPreviewUser?.()) {
      if (sessionStorage.getItem("pleyi-dev-credits") == null) {
        sessionStorage.setItem("pleyi-dev-credits", String(DEFAULT_CREDITS));
      }
      const balance = parseInt(sessionStorage.getItem("pleyi-dev-credits"), 10);
      this._dispatchCredits(balance, DEFAULT_CREDITS);
      return { balance, allowance: DEFAULT_CREDITS, plan: "free" };
    }

    const ref = db.collection("users").doc(uid);
    const doc = await ref.get();
    const data = doc.data() || {};

    if (data.creditsBalance == null) {
      const allowance = this._creditsAllowanceForPlan(data.creditsPlan);
      const balance = allowance;
      await ref.set(
        {
          creditsBalance: balance,
          creditsAllowance: allowance,
          creditsPlan: data.creditsPlan || "free",
          creditsUpdatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      this._dispatchCredits(balance, allowance);
      return { balance, allowance, plan: data.creditsPlan || "free" };
    }

    const balance = data.creditsBalance;
    const allowance = data.creditsAllowance ?? this._creditsAllowanceForPlan(data.creditsPlan);
    this._dispatchCredits(balance, allowance);
    return { balance, allowance, plan: data.creditsPlan || "free" };
  },

  async getCredits() {
    const uid = this._uid();
    if (!uid) return { balance: 0, allowance: DEFAULT_CREDITS, plan: "free" };

    if (window.GameAuth?.isDevPreviewUser?.()) {
      const balance = parseInt(sessionStorage.getItem("pleyi-dev-credits") || String(DEFAULT_CREDITS), 10);
      return { balance, allowance: DEFAULT_CREDITS, plan: "free" };
    }

    const db = this._db();
    if (!db) return { balance: 0, allowance: DEFAULT_CREDITS, plan: "free" };

    const doc = await db.collection("users").doc(uid).get();
    const data = doc.data() || {};
    if (data.creditsBalance == null) return this.ensureCreditsInitialized();

    return {
      balance: data.creditsBalance,
      allowance: data.creditsAllowance ?? this._creditsAllowanceForPlan(data.creditsPlan),
      plan: data.creditsPlan || "free",
    };
  },

  async canSpendCredits(amount = AI_GAME_CREDIT_COST) {
    const { balance } = await this.getCredits();
    return balance >= amount;
  },

  async spendCredits(amount = AI_GAME_CREDIT_COST) {
    const uid = this._uid();
    if (!uid) return { ok: false, error: "יש להתחבר כדי להשתמש בקרדיטים" };

    if (window.GameAuth?.isDevPreviewUser?.()) {
      let balance = parseInt(sessionStorage.getItem("pleyi-dev-credits") || String(DEFAULT_CREDITS), 10);
      if (balance < amount) {
        return {
          ok: false,
          noCredits: true,
          balance,
          error: `אין מספיק קרדיטים (נדרש ${amount}, נותרו ${balance}).`,
        };
      }
      balance -= amount;
      sessionStorage.setItem("pleyi-dev-credits", String(balance));
      this._dispatchCredits(balance, DEFAULT_CREDITS);
      return { ok: true, balance };
    }

    const db = this._db();
    if (!db) return { ok: false, error: "אין חיבור לנתונים" };

    const userRef = db.collection("users").doc(uid);
    try {
      const balance = await db.runTransaction(async (tx) => {
        const doc = await tx.get(userRef);
        const data = doc.data() || {};
        let current = data.creditsBalance;
        if (current == null) current = DEFAULT_CREDITS;
        if (current < amount) throw new Error("NO_CREDITS");
        const next = current - amount;
        tx.set(
          userRef,
          {
            creditsBalance: next,
            creditsUpdatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
        return next;
      });
      const allowance = (await userRef.get()).data()?.creditsAllowance ?? DEFAULT_CREDITS;
      this._dispatchCredits(balance, allowance);
      return { ok: true, balance };
    } catch (err) {
      if (err?.message === "NO_CREDITS") {
        const { balance } = await this.getCredits();
        return {
          ok: false,
          noCredits: true,
          balance,
          error: `אין מספיק קרדיטים (נדרש ${amount}, נותרו ${balance}).`,
        };
      }
      throw err;
    }
  },

  async grantPlanCredits(planId) {
    const uid = this._uid();
    const db = this._db();
    if (!uid || !db) return { ok: false };

    const allowance = this._creditsAllowanceForPlan(planId);
    await db.collection("users").doc(uid).set(
      {
        creditsBalance: allowance,
        creditsAllowance: allowance,
        creditsPlan: planId || "free",
        creditsUpdatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    this._dispatchCredits(allowance, allowance);
    return { ok: true, balance: allowance, allowance };
  },

  async savePlannedGame({ title, date, notes = "" }) {
    const uid = this._uid();
    const db = this._db();
    if (!uid || !db) return { ok: false, error: "יש להתחבר" };
    if (!title?.trim() || !date) return { ok: false, error: "חסר כותרת או תאריך" };

    const ref = await db.collection("plannedGames").add({
      userId: uid,
      title: title.trim(),
      date: String(date),
      notes: String(notes || "").trim(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    return { ok: true, id: ref.id };
  },

  async getPlannedGames(limit = 120) {
    const uid = this._uid();
    const db = this._db();
    if (!uid || !db) return [];

    const snap = await db
      .collection("plannedGames")
      .where("userId", "==", uid)
      .limit(limit)
      .get();

    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => String(a.date).localeCompare(String(b.date)));
  },

  async deletePlannedGame(id) {
    const uid = this._uid();
    const db = this._db();
    if (!uid || !db) return { ok: false };

    const ref = db.collection("plannedGames").doc(id);
    const doc = await ref.get();
    if (!doc.exists || doc.data().userId !== uid) return { ok: false };
    await ref.delete();
    return { ok: true };
  },

  dateKeyFromTimestamp(ts) {
    if (!ts) return "";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
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
