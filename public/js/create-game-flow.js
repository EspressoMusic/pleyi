/* Shared: parse material → pick game → launch /play */

(function () {
  function parseItems(text, subject = "english") {
    const catalog = window.GAMES_CATALOG;
    if (!catalog?.parseContent) return [];
    const parsed = catalog.parseContent(String(text || "").trim(), subject);
    return Array.isArray(parsed) ? parsed : parsed?.items || [];
  }

  function gameTitle(gameId) {
    const catalog = window.GAMES_CATALOG;
    const game = catalog?.english?.find((g) => g.id === gameId);
    return game?.title || gameId;
  }

  function populateGamePick(selectEl, subject = "english") {
    if (!selectEl) return;
    const games = window.GAMES_CATALOG?.[subject] || window.GAMES_CATALOG?.english || [];
    selectEl.innerHTML =
      `<option value="auto">בחירה אוטומטית (מומלץ)</option>` +
      games.map((g) => `<option value="${g.id}">${g.title}</option>`).join("");
  }

  function resolveGameId(items, gamePick, subject = "english") {
    if (gamePick && gamePick !== "auto") return gamePick;
    return window.GAMES_CATALOG.pickGameForContent(items, subject);
  }

  function updatePreview(previewEl, items, gameId) {
    if (!previewEl) return;
    if (!items.length) {
      previewEl.classList.add("hidden");
      previewEl.innerHTML = "";
      return;
    }
    previewEl.classList.remove("hidden");
    previewEl.innerHTML = `
      <p><strong>${items.length}</strong> פריטים זוהו · משחק: <strong>${gameTitle(gameId)}</strong></p>
      <ul class="create-game-preview-list">${items
        .slice(0, 4)
        .map((it) => `<li dir="ltr"><span>${it.en}</span> → <span dir="rtl">${it.he}</span></li>`)
        .join("")}${items.length > 4 ? `<li>… ועוד ${items.length - 4}</li>` : ""}</ul>`;
  }

  async function ensureContent(text, subject = "english") {
    const trimmed = String(text || "").trim();
    if (!trimmed) {
      return { ok: false, error: "הדביקו תוכן לימודי או העלו קובץ" };
    }

    let items = parseItems(trimmed, subject);
    const ready = window.LEARNING_PARSE?.looksLikeReadyPairs
      ? window.LEARNING_PARSE.looksLikeReadyPairs(trimmed, subject)
      : items.length >= 2;
    if (ready) {
      return { ok: true, text: trimmed, items };
    }

    const status = await window.AI_LESSON?.checkStatus?.();
    if (!status?.configured) {
      return {
        ok: false,
        error:
          "לא זוהו מספיק פריטים. הזינו לפחות 2 שורות בפורמט: מילה=תרגום (למשל apple=תפוח), או הפעילו AI בשרת.",
      };
    }

    if (!window.GameAuth?.getUser()) {
      if (window.GameAuth?.isDevHost?.()) {
        window.GameAuth.signInDevPreview();
      } else {
        return {
          ok: false,
          error: "לניתוח קובץ חופשי נדרשת התחברות — ה-AI יחלץ מושגים מהחומר.",
          needsLogin: true,
        };
      }
    }

    try {
      const result = await window.AI_LESSON.generate({ lessonText: trimmed, subject });
      const normalized = result.normalized || trimmed;
      items = parseItems(normalized, subject);
      if (items.length < 2) {
        return { ok: false, error: "ה-AI לא הצליח לחלץ מספיק פריטים מהחומר" };
      }
      return {
        ok: true,
        text: normalized,
        items,
        aiGameId: result.gameId || null,
      };
    } catch (e) {
      return { ok: false, error: e.message || "שגיאה ביצירת המשחק עם AI" };
    }
  }

  function launchGame({ text, items, subject = "english", gamePick = "auto", aiGameId = null }) {
    const gameId = aiGameId && gamePick === "auto" ? aiGameId : resolveGameId(items, gamePick, subject);
    sessionStorage.setItem(
      "gameclass-custom",
      JSON.stringify({
        subject,
        gameId,
        vocab: items,
        title: "שיעור מותאם",
        savedGameId: null,
      })
    );
    sessionStorage.setItem("gameclass-play-material", text.trim());
    window.location.href = `/play/${gameId}`;
    return { ok: true, gameId };
  }

  window.CreateGameFlow = {
    parseItems,
    populateGamePick,
    resolveGameId,
    updatePreview,
    ensureContent,
    launchGame,
    gameTitle,
  };
})();
