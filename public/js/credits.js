/* Pleyi — credits (nav badge disabled; balance still tracked in UserData) */

(function () {
  function removeBadge() {
    document.getElementById("navCreditsBadge")?.remove();
  }

  function render() {
    removeBadge();
  }

  async function refresh() {
    removeBadge();
    if (!window.GameAuth?.getUser?.()) return;

    if (window.GameAuth?.isDevPreviewUser?.()) return;

    try {
      await UserData.ensureCreditsInitialized?.();
    } catch (err) {
      console.error(err);
    }
  }

  document.addEventListener("credits-updated", () => removeBadge());

  document.addEventListener("premium-updated", () => refresh());

  window.GameAuth?.onUserChange?.((user) => {
    if (user) refresh();
    else removeBadge();
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", refresh);
  } else {
    refresh();
  }

  window.PleyiCredits = { refresh, render };
})();
