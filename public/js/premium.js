/* Premium games — word-shop */

(function () {
  const PREMIUM_GAMES = new Set(["word-shop"]);
  const CACHE_KEY = "pleyi-premium-cache";

  let status = { isPremium: false, premiumUntil: null, plan: null };
  let plans = null;
  let settings = null;
  let creditsByPlan = { free: 10, monthly: 50, yearly: 120 };
  let selectedPlan = "yearly";
  let payMethod = "card";
  let pendingTarget = null;
  let modalBuilt = false;

  function currentLang() {
    try {
      return localStorage.getItem("pleyi-lang") || document.documentElement.lang || "he";
    } catch {
      return document.documentElement.lang || "he";
    }
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" });
  }

  function readCache(uid) {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (data?.uid !== uid) return null;
      return data;
    } catch {
      return null;
    }
  }

  function writeCache(uid) {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ uid, ...status }));
  }

  function notifyUpdate() {
    document.dispatchEvent(new CustomEvent("premium-updated"));
  }

  // The server verifies this token itself — it never trusts a client-supplied
  // uid for premium status/activation.
  async function getIdToken() {
    try {
      return (await window.FirebaseApp?.auth?.currentUser?.getIdToken?.()) || null;
    } catch {
      return null;
    }
  }

  async function loadPlans() {
    const res = await fetch("/api/premium/plans");
    const data = await res.json();
    if (data.ok) {
      plans = data.plans;
      settings = data.settings || null;
      if (data.creditsByPlan) creditsByPlan = data.creditsByPlan;
    }
  }

  async function fetchStatus() {
    const user = window.GameAuth?.getUser();
    if (!user?.uid) {
      status = { isPremium: false, premiumUntil: null, plan: null };
      sessionStorage.removeItem(CACHE_KEY);
      return status;
    }

    const cached = readCache(user.uid);
    if (cached?.isPremium) status = cached;

    try {
      const idToken = await getIdToken();
      if (!idToken) return status;
      const res = await fetch("/api/premium/status", {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await res.json();
      if (data.ok) {
        status = {
          isPremium: !!data.isPremium,
          premiumUntil: data.premiumUntil || null,
          plan: data.plan || null,
        };
        writeCache(user.uid);
      }
    } catch {
      /* keep cache */
    }
    return status;
  }

  function isPremiumGame(gameId) {
    return PREMIUM_GAMES.has(gameId);
  }

  function hasPremium() {
    return !!status.isPremium;
  }

  function canPlayGame(gameId) {
    return !isPremiumGame(gameId) || hasPremium();
  }

  function ensureModal() {
    if (modalBuilt || document.getElementById("premiumModal")) {
      modalBuilt = true;
      return;
    }
    modalBuilt = true;

    document.body.insertAdjacentHTML(
      "beforeend",
      `<div class="premium-modal hidden" id="premiumModal" role="dialog" aria-modal="true" aria-labelledby="premiumModalTitle">
        <div class="premium-modal-backdrop" id="premiumModalBackdrop"></div>
        <div class="premium-modal-sheet">
          <button type="button" class="premium-modal-close" id="premiumModalClose" aria-label="סגירה">×</button>
          <div id="premiumModalBody"></div>
        </div>
      </div>`
    );

    document.getElementById("premiumModalClose")?.addEventListener("click", closeModal);
    document.getElementById("premiumModalBackdrop")?.addEventListener("click", closeModal);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });
  }

  function gameDisplayName(gameId) {
    if (gameId === "hangman") return "איש תלוי";
    if (gameId === "word-shop") return "חנות קטנה";
    return "משחק זה";
  }

  function lessonDisplayName(lessonId) {
    const names = {
      intro: "הקדמה לשפה האנגלית",
      colors: "צבעים",
      numbers: "מספרים",
      animals: "בעלי חיים",
      family: "משפחה",
      health: "נפלאות הבריאה",
    };
    return names[lessonId] || "שיעור זה";
  }

  // Accepts either a bare gameId string (existing game call sites) or
  // { kind: "lesson"|"game", id, name } so the same lock modal can front
  // premium games and premium lessons.
  function resolveTarget(target) {
    if (target && typeof target === "object") {
      return {
        kind: target.kind || "game",
        id: target.id,
        name: target.name || (target.kind === "lesson" ? lessonDisplayName(target.id) : gameDisplayName(target.id)),
      };
    }
    return { kind: "game", id: target, name: gameDisplayName(target) };
  }

  function subscribeUrl(target) {
    const t = resolveTarget(target);
    if (!t.id) return "/premium";
    const key = t.kind === "lesson" ? "lesson" : "game";
    return `/premium?${key}=${encodeURIComponent(t.id)}`;
  }

  function planButtonsHtml() {
    const list = plans || {
      monthly: { id: "monthly", label: "חודשי", price: 29, priceUSD: 8.9, badge: "גמיש" },
      yearly: { id: "yearly", label: "שנתי", price: 299, badge: "חסכון" },
    };
    const useUsd = currentLang() === "en";
    return Object.values(list)
      .map((p) => {
        const priceLabel = useUsd && p.priceUSD ? `$${p.priceUSD}` : `₪${p.price}`;
        return `
      <button type="button" class="premium-plan-btn${p.id === selectedPlan ? " is-active" : ""}" data-plan="${escapeHtml(p.id)}">
        <span class="premium-plan-badge">${escapeHtml(p.badge || "")}</span>
        <span class="premium-plan-label">${escapeHtml(p.label)}</span>
        <span class="premium-plan-price">${priceLabel}</span>
        <span class="premium-plan-credits">${creditsByPlan[p.id] || creditsByPlan.free || 10} קרדיטים</span>
      </button>`;
      })
      .join("");
  }

  function renderModalBody() {
    const body = document.getElementById("premiumModalBody");
    if (!body) return;

    const target = resolveTarget(pendingTarget);

    if (hasPremium()) {
      body.innerHTML = `
        <div class="premium-success">
          <div class="premium-modal-icon" aria-hidden="true">✓</div>
          <h3>מנוי פרימיום פעיל</h3>
          <p>בתוקף עד ${escapeHtml(formatDate(status.premiumUntil))}</p>
        </div>`;
      return;
    }

    const isLesson = target.kind === "lesson";
    body.innerHTML = `
      <div class="premium-modal-icon" aria-hidden="true">🔒</div>
      <h2 class="premium-modal-title" id="premiumModalTitle">${isLesson ? "שיעור פרימיום" : "משחק פרימיום"}</h2>
      <p class="premium-modal-desc">${isLesson ? "השיעור" : "המשחק"} <strong>${escapeHtml(target.name)}</strong> זמין למנויי פרימיום.</p>
      <a class="premium-modal-cta" href="${escapeHtml(subscribeUrl(target))}">להרשמת מנוי</a>`;
  }

  function bindSignupPageEvents() {
    const root = document.getElementById("premiumSignupRoot");
    if (!root) return;

    root.querySelectorAll(".premium-plan-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedPlan = btn.dataset.plan || "yearly";
        renderSignupPage();
      });
    });

    root.querySelectorAll(".premium-pay-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        payMethod = tab.dataset.pay || "card";
        renderSignupPage();
      });
    });

    document.getElementById("premiumLoginBtn")?.addEventListener("click", async () => {
      const res = await window.GameAuth?.signInWithGoogle?.();
      if (res?.error) showError(res.error);
      else renderSignupPage();
    });

    document.getElementById("premiumSubmitBtn")?.addEventListener("click", subscribe);
  }

  function renderSignupPage() {
    const root = document.getElementById("premiumSignupRoot");
    if (!root) return;

    const user = window.GameAuth?.getUser();
    const params = new URLSearchParams(window.location.search);
    const returnLesson = params.get("lesson");
    const returnGame = params.get("game");
    const target = returnLesson ? resolveTarget({ kind: "lesson", id: returnLesson }) : resolveTarget(returnGame);

    if (hasPremium()) {
      root.innerHTML = `
        <div class="premium-success">
          <div class="premium-modal-icon" aria-hidden="true">✓</div>
          <h2 class="premium-page-title">מנוי פרימיום</h2>
          <h3>המנוי שלכם פעיל</h3>
          <p>בתוקף עד ${escapeHtml(formatDate(status.premiumUntil))}</p>
          <a href="/room" class="premium-modal-cta">חזרה לחדר</a>
        </div>`;
      return;
    }

    const bitPhone = settings?.bitPhone || "0586122187";
    const bitName = settings?.bitPayName || "Pleyi";
    const plan = (plans && plans[selectedPlan]) || { price: selectedPlan === "yearly" ? 299 : 29 };
    const unlockPhrase = target.kind === "lesson" ? "ותכנים נוספים" : "ומשחקים נוספים";
    const itemLabel = target.kind === "lesson" ? "השיעור" : "המשחק";

    root.innerHTML = `
      <header class="premium-page-header">
        <span class="premium-page-badge">פרימיום</span>
        <h1 class="premium-page-title">מנוי פרימיום</h1>
        <p class="premium-page-lead">${target.id ? `פתחו את ${itemLabel} <strong>${escapeHtml(target.name)}</strong> ${unlockPhrase} עם מנוי פעיל.` : "גישה למשחקי פרימיום וקרדיטים ליצירת משחקים עם AI."}</p>
      </header>
      ${
        user
          ? ""
          : `<p class="premium-login-hint">יש להתחבר כדי לרכוש מנוי</p>
             <button type="button" class="premium-login-btn" id="premiumLoginBtn">התחברות עם Google</button>`
      }
      <div class="premium-plans" id="premiumPlans">${planButtonsHtml()}</div>
      <div class="premium-pay-tabs">
        <button type="button" class="premium-pay-tab${payMethod === "card" ? " is-active" : ""}" data-pay="card">כרטיס אשראי</button>
        <button type="button" class="premium-pay-tab${payMethod === "bit" ? " is-active" : ""}" data-pay="bit">ביט</button>
      </div>
      <div class="premium-pay-panel${payMethod === "card" ? "" : " hidden"}" id="premiumPayCard">
        <div class="premium-field">
          <label for="premiumCardNumber">מספר כרטיס</label>
          <input type="text" id="premiumCardNumber" inputmode="numeric" autocomplete="cc-number" placeholder="0000 0000 0000 0000" dir="ltr" />
        </div>
      </div>
      <div class="premium-pay-panel${payMethod === "bit" ? "" : " hidden"}" id="premiumPayBit">
        <div class="premium-bit-box">
          <p>שלמו <strong>₪${plan.price}</strong> בביט ל־<strong dir="ltr">${escapeHtml(bitPhone)}</strong></p>
          <p>שם: ${escapeHtml(bitName)}</p>
        </div>
      </div>
      <p class="premium-error hidden" id="premiumError"></p>
      <button type="button" class="premium-submit-btn" id="premiumSubmitBtn"${user ? "" : " disabled"}>שלמו וקבלו פרימיום</button>`;

    bindSignupPageEvents();
  }

  function showError(msg) {
    const el = document.getElementById("premiumError");
    if (!el) return;
    el.textContent = msg || "שגיאה";
    el.classList.remove("hidden");
  }

  function openModal(target) {
    ensureModal();
    pendingTarget = target || pendingTarget;
    renderModalBody();
    document.getElementById("premiumModal")?.classList.remove("hidden");
  }

  function closeModal() {
    document.getElementById("premiumModal")?.classList.add("hidden");
    pendingTarget = null;
  }

  async function subscribe() {
    const user = window.GameAuth?.getUser();
    if (!user?.uid) {
      showError("יש להתחבר לפני התשלום");
      return;
    }

    if (payMethod === "card") {
      const card = document.getElementById("premiumCardNumber")?.value.replace(/\s/g, "") || "";
      if (card.length < 12) {
        showError("מספר כרטיס לא תקין");
        return;
      }
    }

    const btn = document.getElementById("premiumSubmitBtn");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "מעבד...";
    }

    try {
      const idToken = await getIdToken();
      if (!idToken) {
        showError("יש להתחבר מחדש");
        return;
      }
      const res = await fetch("/api/premium/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({
          email: user.email || "",
          planId: selectedPlan,
          method: payMethod,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        showError(data.error || "התשלום נכשל");
        return;
      }

      status = {
        isPremium: true,
        premiumUntil: data.premiumUntil,
        plan: data.plan,
      };
      writeCache(user.uid);

      if (window.UserData?.syncPremiumStatus) {
        window.UserData.syncPremiumStatus(status).catch(() => {});
      }

      if (window.UserData?.grantPlanCredits) {
        await UserData.grantPlanCredits(data.plan || selectedPlan);
      }

      notifyUpdate();
      if (document.getElementById("premiumSignupRoot")) {
        renderSignupPage();
      } else {
        renderModalBody();
        setTimeout(closeModal, 1800);
      }
    } catch {
      showError("שגיאת רשת — נסו שוב");
    } finally {
      if (btn) {
        btn.disabled = !window.GameAuth?.getUser();
        btn.textContent = "שלמו וקבלו פרימיום";
      }
    }
  }

  function ensurePremiumAccess(gameId) {
    if (canPlayGame(gameId)) return true;
    openModal(gameId);
    return false;
  }

  function ensureLessonAccess(lessonId, lessonName) {
    if (hasPremium()) return true;
    openModal({ kind: "lesson", id: lessonId, name: lessonName });
    return false;
  }

  function pickerButtonHtml(g, { isActive, escapeFn }) {
    const esc = escapeFn || escapeHtml;
    const locked = isPremiumGame(g.id) && !hasPremium();
    return `
      <button type="button" class="room-game-btn${isActive ? " is-active" : ""}${locked ? " is-premium-locked" : ""}" data-game-id="${esc(g.id)}" data-premium-locked="${locked ? "1" : "0"}">
        ${locked ? '<span class="room-game-premium-lock" aria-hidden="true">🔒</span><span class="room-game-premium-badge">פרימיום</span>' : ""}
        <span class="room-game-btn-icon">${esc(g.icon || "🎮")}</span>
        <span class="room-game-btn-label">${esc(g.title)}</span>
      </button>`;
  }

  function decorateHubCard(card) {
    if (!card) return;
    const gameId = card.dataset.gameId;
    const locked = isPremiumGame(gameId) && !hasPremium();
    card.classList.toggle("is-premium-locked", locked);
    let lock = card.querySelector(".hub-premium-lock");
    if (locked && !lock) {
      card.insertAdjacentHTML("afterbegin", '<span class="hub-premium-lock" aria-hidden="true">🔒</span>');
    } else if (!locked && lock) {
      lock.remove();
    }
    const playBtn = card.querySelector(".hub-game-play-btn");
    if (playBtn) playBtn.textContent = "שחק עכשיו";
  }

  function updateRoomGameButtons() {
    document.querySelectorAll(".room-game-btn[data-game]").forEach((btn) => {
      const gameId = btn.dataset.game;
      if (!isPremiumGame(gameId)) return;
      const locked = !hasPremium();
      btn.classList.toggle("is-premium-locked", locked);
      btn.dataset.premiumLocked = locked ? "1" : "0";
      let lock = btn.querySelector(".room-game-premium-lock");
      let badge = btn.querySelector(".room-game-premium-badge");
      if (locked && !lock) {
        btn.insertAdjacentHTML(
          "afterbegin",
          '<span class="room-game-premium-lock" aria-hidden="true">🔒</span><span class="room-game-premium-badge">פרימיום</span>'
        );
      } else if (!locked) {
        lock?.remove();
        badge?.remove();
      }
    });
  }

  async function init() {
    ensureModal();
    await loadPlans();
    window.GameAuth?.onUserChange?.(async (user) => {
      if (user) await fetchStatus();
      else {
        status = { isPremium: false, premiumUntil: null, plan: null };
        sessionStorage.removeItem(CACHE_KEY);
      }
      if (document.getElementById("premiumSignupRoot")) renderSignupPage();
      notifyUpdate();
    });
    if (window.GameAuth?.getUser()) await fetchStatus();
    if (document.getElementById("premiumSignupRoot")) renderSignupPage();
    notifyUpdate();
  }

  window.PleyiPremium = {
    PREMIUM_GAMES,
    init,
    refresh: fetchStatus,
    getStatus() {
      return { ...status };
    },
    hasPremium,
    isPremiumGame,
    canPlayGame,
    ensurePremiumAccess,
    ensureLessonAccess,
    openModal,
    closeModal,
    pickerButtonHtml,
    decorateHubCard,
    updateRoomGameButtons,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => init());
  } else {
    init();
  }
})();
