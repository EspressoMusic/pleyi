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

  const GAME_RULES = {
    "word-memory": {
      minItems: 2,
      hint: "הדביקו מילים ותרגומים (שורה לכל זוג). כל פריט = זוג אחד במשחק.",
      lengthLabel: (n) => `${n} זוגות`,
    },
    "vocabulary-duel": {
      minItems: 4,
      hint: "הדביקו לפחות 4 מילים עם תרגום. כל פריט = שאלה אחת בטריוויה.",
      lengthLabel: (n) => `${n} שאלות`,
    },
    hangman: {
      minItems: 1,
      hint: "הדביקו מילים באנגלית עם תרגום. כל פריט = מילה אחת לניחוש.",
      lengthLabel: (n) => `${n} מילים`,
    },
    "spot-diff": {
      minItems: 6,
      hint: "הדביקו לפחות 6 פריטים. כל פריט = סיבוב אחד במשחק.",
      lengthLabel: (n) => `${n} סיבובים`,
    },
    "tower-stack": {
      minItems: 3,
      hint: "הדביקו מילים עם תרגום — התוכן שלכם יופיע על הקוביות במגדל.",
      lengthLabel: (n) => `${n} מילים במאגר`,
    },
  };

  function gameRules(gameId) {
    return GAME_RULES[gameId] || {
      minItems: 2,
      hint: "הדביקו תוכן לימודי בפורמט: מילה=תרגום (שורה לכל פריט).",
      lengthLabel: (n) => `${n} פריטים`,
    };
  }

  function renderGamePicker(container, subject, selectedId, onSelect) {
    if (!container) return;
    const games = window.GAMES_CATALOG?.[subject] || window.GAMES_CATALOG?.english || [];
    container.innerHTML = games
      .map(
        (g) => `
        <button type="button" class="svc-game-pick-btn${selectedId === g.id ? " is-selected" : ""}" data-game-id="${g.id}">
          <span class="svc-game-pick-icon" aria-hidden="true">${window.GAMES_CATALOG.gameIcon(g)}</span>
          <span class="svc-game-pick-title">${g.title}</span>
          <span class="svc-game-pick-desc">${g.desc || ""}</span>
        </button>`
      )
      .join("");

    container.querySelectorAll("[data-game-id]").forEach((btn) => {
      btn.addEventListener("click", () => onSelect?.(btn.dataset.gameId));
    });
  }

  function validateItemsForGame(gameId, items) {
    const min = gameRules(gameId).minItems;
    if (!items.length) {
      return { ok: false, error: "הדביקו תוכן לימודי או העלו קובץ" };
    }
    if (items.length < min) {
      return {
        ok: false,
        error: `למשחק ${gameTitle(gameId)} נדרשים לפחות ${min} פריטים (זוהו ${items.length})`,
      };
    }
    return { ok: true };
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
    if (!items.length || !gameId) {
      previewEl.classList.add("hidden");
      previewEl.innerHTML = "";
      return;
    }
    const rules = gameRules(gameId);
    previewEl.classList.remove("hidden");
    previewEl.innerHTML = `
      <p><strong>${items.length}</strong> פריטים זוהו · אורך המשחק: <strong>${rules.lengthLabel(items.length)}</strong></p>
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
    gameRules,
    renderGamePicker,
    validateItemsForGame,
    GAME_RULES,
  };
})();
