/* Bootstrap /play/:gameId */

(function () {
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

  let customMeta = null;
  try {
    const raw = sessionStorage.getItem("gameclass-custom");
    if (raw) customMeta = JSON.parse(raw);
  } catch {
    /* ignore */
  }

  if (!customMeta) {
    customMeta = { subject: "english", level: "medium", topic: "all", isPreset: true, gameId };
  }

  let cleanup = null;
  let displayTitle = customMeta.title || SoloGames.names[gameId];

  function materialItems() {
    const text = window.playReadMaterial?.() || "";
    const subject = customMeta.subject || "english";
    if (!text.trim() || !window.GAMES_CATALOG?.parseContent) return [];
    return GAMES_CATALOG.parseContent(text, subject);
  }

  function applyGameData() {
    let items = [];
    if (!customMeta.isPreset) {
      items = customMeta.vocab?.length ? customMeta.vocab : materialItems();
    }

    if (items.length >= 2) {
      const base = customMeta.subject === "math" ? window.MATH_DATA : window.VOCAB_DATA;
      window._activeGameData = { ...base, VOCAB: items };
      customMeta = { ...customMeta, vocab: items, isPreset: false };
      return;
    }

    if (customMeta.isPreset && window.GAME_CONTENT) {
      window._activeGameData = GAME_CONTENT.buildGameData(
        customMeta.subject || "english",
        customMeta.level || "medium",
        customMeta.topic || "all"
      );
    } else if (customMeta.vocab?.length) {
      const base = customMeta.subject === "math" ? window.MATH_DATA : window.VOCAB_DATA;
      window._activeGameData = { ...base, VOCAB: customMeta.vocab };
    } else if (window.GAME_CONTENT) {
      window._activeGameData = GAME_CONTENT.buildGameData("english", "medium", "all");
    }
  }

  function persistMeta() {
    sessionStorage.setItem("gameclass-custom", JSON.stringify({ ...customMeta, gameId }));
  }

  function updateTitleDisplay() {
    titleEl.textContent = displayTitle;
    document.title = `${displayTitle} — Pleyi`;
    const namePill = document.getElementById("playGameNamePill");
    if (namePill) namePill.textContent = displayTitle;
  }

  function mountGame() {
    cleanup?.();
    root.innerHTML = "";
    scoreEl.textContent = "0";
    applyGameData();
    cleanup = SoloGames.mount(gameId, root, ui);
  }

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
        isCustom: !!customMeta?.vocab?.length && !customMeta?.isPreset,
        score,
        reason,
      }).catch((err) => console.warn("history save failed", err));
    },
  };

  window.PlaySession = {
    gameId,
    getMeta() {
      return { ...customMeta, gameId };
    },
    updateContent({ topic, level, subject, usePreset, useMaterial } = {}) {
      if (typeof subject === "string") customMeta.subject = subject;
      if (typeof topic === "string") customMeta.topic = topic;
      if (typeof level === "string") customMeta.level = level;

      if (useMaterial || (!usePreset && materialItems().length >= 2)) {
        const items = materialItems();
        customMeta = {
          ...customMeta,
          gameId,
          vocab: items,
          isPreset: false,
        };
      } else if (usePreset) {
        customMeta = {
          ...customMeta,
          gameId,
          isPreset: true,
        };
        delete customMeta.vocab;
      } else {
        customMeta = {
          ...customMeta,
          gameId,
          isPreset: true,
        };
      }

      persistMeta();
      mountGame();
      window.dispatchEvent(new CustomEvent("play-content-updated"));
    },
    remount: mountGame,
  };

  async function startPlay() {
    if (window.PleyiPremium?.isPremiumGame?.(gameId)) {
      await window.PleyiPremium.refresh?.().catch(() => {});
      if (!window.PleyiPremium.hasPremium()) {
        root.innerHTML = `
          <div class="play-premium-gate">
            <p>המשחק <strong>${displayTitle}</strong> זמין למנויי פרימיום.</p>
            <a class="btn btn-primary btn-candy font-cartoon" href="/premium?game=${encodeURIComponent(gameId)}">להרשמת מנוי</a>
          </div>`;
        window.PleyiPremium.openModal(gameId);
        return;
      }
    }
    mountGame();
  }

  document.addEventListener("premium-updated", () => {
    if (window.PleyiPremium?.isPremiumGame?.(gameId) && window.PleyiPremium.hasPremium()) {
      startPlay();
    }
  });

  updateTitleDisplay();
  persistMeta();
  window.initPlayChrome?.(gameId);
  startPlay();

  window.addEventListener("beforeunload", () => cleanup?.());
})();
