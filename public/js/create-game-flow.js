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
      hint: "מלאו זוגות של מילה ותרגום — אפשר להוסיף כמה שרוצים.",
      lengthLabel: (n) => `${n} זוגות`,
      fields: { left: "מילה", right: "תרגום", leftPh: "apple", rightPh: "תפוח" },
    },
    "vocabulary-duel": {
      minItems: 4,
      hint: "מלאו לפחות 4 מילים עם תרגום — כל שורה תהפוך לשאלה אחת בטריוויה.",
      lengthLabel: (n) => `${n} שאלות`,
      fields: { left: "מילה", right: "תרגום", leftPh: "book", rightPh: "ספר" },
    },
    hangman: {
      minItems: 1,
      hint: "מלאו מילים באנגלית עם תרגום — כל מילה תהיה סבב ניחוש אחד.",
      lengthLabel: (n) => `${n} מילים`,
      fields: { left: "מילה באנגלית", right: "תרגום", leftPh: "banana", rightPh: "בננה" },
    },
    "spot-diff": {
      minItems: 6,
      hint: "מלאו לפחות 6 פריטים — כל שורה תהפוך לסיבוב אחד במשחק.",
      lengthLabel: (n) => `${n} סיבובים`,
      fields: { left: "פריט", right: "תרגום", leftPh: "dog", rightPh: "כלב" },
    },
    "tower-stack": {
      minItems: 3,
      hint: "מלאו זוגות מילה ותרגום — במשחק תצטרכו לשפוט אם התרגום שמוצג נכון או שגוי.",
      lengthLabel: (n) => `${n} מילים במאגר`,
      fields: { left: "מילה", right: "תרגום", leftPh: "sun", rightPh: "שמש" },
    },
  };

  const LOCAL_GAMES_KEY = "pleyi-local-games";
  const LOCAL_GAMES_MAX = 20;

  function getLocalGames() {
    try {
      const raw = JSON.parse(localStorage.getItem(LOCAL_GAMES_KEY) || "[]");
      return Array.isArray(raw) ? raw : [];
    } catch {
      return [];
    }
  }

  function saveLocalGame({ title, subject, gameId, items }) {
    const entry = {
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      subject,
      gameId,
      items,
      createdAt: Date.now(),
    };
    const list = [entry, ...getLocalGames()].slice(0, LOCAL_GAMES_MAX);
    localStorage.setItem(LOCAL_GAMES_KEY, JSON.stringify(list));
    return entry;
  }

  function generatedTitle(gameId) {
    const date = new Date().toLocaleDateString("he-IL");
    return `${gameTitle(gameId)} — ${date}`;
  }

  async function persistCreatedGame({ subject, gameId, items, title, content }) {
    const finalTitle = title || generatedTitle(gameId);
    const user = window.GameAuth?.getUser?.();
    if (user) {
      const res = await window.UserData?.saveCustomGame({
        title: finalTitle,
        subject,
        gameId,
        content: content || "",
        items,
      });
      if (!res?.ok) {
        return { ok: false, local: false, quotaMessage: res?.error || null };
      }
      return { ok: true, local: false, savedGameId: res.id };
    }
    saveLocalGame({ title: finalTitle, subject, gameId, items });
    return { ok: true, local: true };
  }

  function gameRules(gameId) {
    return GAME_RULES[gameId] || {
      minItems: 2,
      hint: "מלאו זוגות מילה ותרגום — אפשר להוסיף כמה שרוצים.",
      lengthLabel: (n) => `${n} פריטים`,
      fields: { left: "מילה", right: "תרגום", leftPh: "word", rightPh: "תרגום" },
    };
  }

  function renderGamePicker(container, subject, selectedId, onSelect) {
    if (!container) return;
    const games = window.GAMES_CATALOG?.[subject] || window.GAMES_CATALOG?.english || [];
    container.innerHTML = games
      .map(
        (g) => `
        <button type="button" class="svc-game-pick-btn${selectedId === g.id ? " is-selected" : ""}" data-game-id="${g.id}">
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
    getLocalGames,
    saveLocalGame,
    persistCreatedGame,
  };
})();
