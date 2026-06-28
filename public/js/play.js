/* Bootstrap /play/:gameId */

(function () {
  let customMeta = null;

  try {
    const raw = sessionStorage.getItem("gameclass-custom");
    if (raw) {
      customMeta = JSON.parse(raw);
      if (customMeta.isPreset && window.GAME_CONTENT) {
        window._activeGameData = GAME_CONTENT.buildGameData(
          customMeta.subject,
          customMeta.level || "medium",
          customMeta.topic || "all"
        );
      } else if (customMeta.vocab?.length) {
        const base = customMeta.subject === "math" ? window.MATH_DATA : window.VOCAB_DATA;
        window._activeGameData = { ...base, VOCAB: customMeta.vocab };
      }
    }
  } catch {
    /* ignore */
  }

  const path = window.location.pathname.replace(/\/+$/, "");
  const match = path.match(/^\/play\/([a-z-]+)$/);
  const gameId = match ? match[1] : null;

  const titleEl = document.getElementById("playTitle");
  const scoreEl = document.getElementById("playScore");
  const root = document.getElementById("playRoot");

  if (!gameId || !SoloGames.names[gameId]) {
    titleEl.textContent = "משחק לא נמצא";
    root.innerHTML = `<div class="play-error"><p>המשחק לא קיים.</p><p><a href="/">← חזרה לאתר</a></p></div>`;
    return;
  }

  const displayTitle = customMeta?.title || SoloGames.names[gameId];
  titleEl.textContent = displayTitle;
  document.title = `${displayTitle} — Pleyi`;

  const ui = {
    setScore(n) {
      scoreEl.textContent = String(n);
    },
    onGameOver(score, reason) {
      if (!window.UserData || !window.GameAuth?.getUser()) return;
      UserData.recordPlay({
        gameId,
        gameTitle: displayTitle,
        customGameId: customMeta?.savedGameId || null,
        isCustom: !!customMeta?.vocab?.length,
        score,
        reason,
      }).catch((err) => console.warn("history save failed", err));
    },
  };

  const cleanup = SoloGames.mount(gameId, root, ui);
  window.addEventListener("beforeunload", () => cleanup?.());
})();
