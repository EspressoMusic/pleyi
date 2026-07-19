/* Pleyi — credits badge in nav */

(function () {
  const DEV_KEY = "pleyi-dev-credits";

  function ensureBadge() {
    let badge = document.getElementById("navCreditsBadge");
    if (badge) return badge;

    const navActions = document.querySelector(".nav-actions");
    if (!navActions) return null;

    badge = document.createElement("div");
    badge.className = "nav-credits hidden";
    badge.id = "navCreditsBadge";
    badge.innerHTML = `
      <span class="nav-credits-icon" aria-hidden="true">◆</span>
      <span class="nav-credits-count" id="navCreditsCount">0</span>
      <span class="nav-credits-label">קרדיטים</span>`;
    badge.title = "קרדיטים ליצירת משחק עם AI";

    const userMenu = document.getElementById("authUserMenu");
    if (userMenu) navActions.insertBefore(badge, userMenu);
    else navActions.prepend(badge);

    return badge;
  }

  function render(balance, allowance) {
    const badge = ensureBadge();
    const countEl = document.getElementById("navCreditsCount");
    if (!badge || !countEl) return;

    const user = window.GameAuth?.getUser?.();
    if (!user) {
      badge.classList.add("hidden");
      return;
    }

    badge.classList.remove("hidden");
    countEl.textContent = String(balance ?? 0);
    badge.title = `קרדיטים ליצירת משחק עם AI — ${balance ?? 0} מתוך ${allowance ?? UserData.DEFAULT_CREDITS}`;
    badge.classList.toggle("is-low", (balance ?? 0) <= 2);
  }

  async function refresh() {
    if (!window.GameAuth?.getUser?.()) {
      render(0, UserData.DEFAULT_CREDITS);
      return;
    }

    if (window.GameAuth?.isDevPreviewUser?.()) {
      const balance = parseInt(sessionStorage.getItem(DEV_KEY) || String(UserData.DEFAULT_CREDITS), 10);
      render(balance, UserData.DEFAULT_CREDITS);
      return;
    }

    try {
      await UserData.ensureCreditsInitialized?.();
      const { balance, allowance } = await UserData.getCredits();
      render(balance, allowance);
    } catch (err) {
      console.error(err);
    }
  }

  document.addEventListener("credits-updated", (e) => {
    render(e.detail?.balance, e.detail?.allowance);
  });

  document.addEventListener("premium-updated", () => refresh());

  window.GameAuth?.onUserChange?.((user) => {
    if (user) refresh();
    else render(0, UserData.DEFAULT_CREDITS);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", refresh);
  } else {
    refresh();
  }

  window.PleyiCredits = { refresh, render };
})();
