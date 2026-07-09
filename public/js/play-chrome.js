/* Yellow top strip + room-style panels for /play */

(function () {
  const MATERIAL_KEY = "gameclass-play-material";
  const SOUND_KEY = "gameclass-play-sound";

  function readHostRoom() {
    try {
      return JSON.parse(sessionStorage.getItem("gameclass-host") || "null");
    } catch {
      return null;
    }
  }

  function readMaterial() {
    try {
      return sessionStorage.getItem(MATERIAL_KEY) || "";
    } catch {
      return "";
    }
  }

  function saveMaterial(text) {
    sessionStorage.setItem(MATERIAL_KEY, text || "");
  }

  function readSoundEnabled() {
    try {
      const v = sessionStorage.getItem(SOUND_KEY);
      return v !== "0";
    } catch {
      return true;
    }
  }

  function saveSoundEnabled(on) {
    sessionStorage.setItem(SOUND_KEY, on ? "1" : "0");
    window.GameEngine?.setSoundEnabled?.(on);
  }

  function showToast(msg) {
    const t = document.getElementById("playToast");
    if (!t) return;
    t.textContent = msg;
    t.classList.remove("hidden");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => t.classList.add("hidden"), 2800);
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function parseMaterialCount(text, subject) {
    const catalog = window.GAMES_CATALOG;
    if (!catalog?.parseContent || !text.trim()) return 0;
    return catalog.parseContent(text, subject || "english").length;
  }

  function renderGameToggles(gameId, container) {
    const schema = window.PlaySettings?.schema(gameId) || [];
    const group = document.getElementById("playGameSettingsGroup");
    if (!container) return;
    if (!schema.length) {
      container.innerHTML = "";
      group?.classList.add("hidden");
      return;
    }
    group?.classList.remove("hidden");
    const values = window.PlaySettings.get(gameId);
    container.innerHTML = schema
      .map(
        (def) => `
      <label class="room-setting-toggle" for="playSetting_${def.key}">
        <span class="room-setting-toggle-label">${escapeHtml(def.label)}</span>
        <span class="room-setting-toggle-switch">
          <input type="checkbox" id="playSetting_${def.key}" data-setting-key="${def.key}" ${
          values[def.key] ? "checked" : ""
        } />
          <span class="room-setting-toggle-ui" aria-hidden="true"></span>
        </span>
      </label>`
      )
      .join("");

    container.querySelectorAll("input[data-setting-key]").forEach((input) => {
      input.addEventListener("change", () => {
        window.PlaySettings.set(gameId, input.dataset.settingKey, input.checked);
        showToast("הגדרות המשחק עודכנו");
      });
    });
  }

  function initPlayChrome(gameId) {
    const params = new URLSearchParams(window.location.search);
    const roomCode = params.get("room") || readHostRoom()?.code || "";

    const roomPill = document.getElementById("playRoomCodePill");
    const roomCodeEl = document.getElementById("playRoomCode");
    const roomLink = document.getElementById("playRoomLink");
    const settingsBtn = document.getElementById("openPlaySettingsBtn");
    const settingsPanel = document.getElementById("playSettingsPanel");
    const settingsList = document.getElementById("playSettingsList");
    const gamesBtn = document.getElementById("playGamesBtn");
    const gamesPanel = document.getElementById("playGamesPanel");
    const gamePicker = document.getElementById("playGamePicker");
    const materialPanel = document.getElementById("playMaterialPanel");
    const materialInput = document.getElementById("playMaterialInput");

    saveSoundEnabled(readSoundEnabled());

    let gameLabel = window.SoloGames?.names?.[gameId];
    if (!gameLabel && window.GAMES_CATALOG) {
      for (const key of ["english", "math", "tanakh", "science"]) {
        const found = window.GAMES_CATALOG[key]?.find((g) => g.id === gameId);
        if (found) {
          gameLabel = found.title;
          break;
        }
      }
    }
    gameLabel = gameLabel || gameId;
    if (gamesBtn && !roomCode) {
      gamesBtn.textContent = gameLabel;
    }
    const namePill = document.getElementById("playGameNamePill");
    if (namePill && !roomCode) namePill.classList.add("hidden");

    if (roomCode && roomPill && roomCodeEl) {
      roomPill.classList.remove("hidden");
      roomCodeEl.textContent = roomCode;
      roomLink?.classList.remove("hidden");
      if (roomLink) roomLink.href = `/room?code=${encodeURIComponent(roomCode)}`;
    }

    if (gamesBtn && roomCode) {
      gamesBtn.textContent = "חזרה לחדר";
    }

    function closeGamesPanel() {
      gamesPanel?.classList.add("hidden");
      gamesBtn?.setAttribute("aria-expanded", "false");
    }

    function closeSettings() {
      settingsPanel?.classList.add("hidden");
      settingsBtn?.setAttribute("aria-expanded", "false");
    }

    function closeMaterialPanel() {
      materialPanel?.classList.add("hidden");
    }

    function closeAllPanels() {
      closeGamesPanel();
      closeSettings();
      closeMaterialPanel();
    }

    function renderGamePicker() {
      if (!gamePicker) return;
      const meta = window.PlaySession?.getMeta() || {};
      const subject = meta.subject || "english";
      const pickerGames = [
        { id: "word-memory", title: "זיכרון", icon: "🧠" },
        { id: "hangman", title: "איש תלוי", icon: "🎯" },
        { id: "spot-diff", title: "מצא הבדלים", icon: "🔍" },
        { id: "tower-stack", title: "מגדל קוביות", icon: "🗼" },
        { id: "word-shop", title: "חנות", icon: "🏪" },
      ];
      const catalogGames = window.GAMES_CATALOG?.[subject] || [];
      const games = pickerGames.map((pick) => {
        const fromCatalog = catalogGames.find((g) => g.id === pick.id);
        return { ...pick, icon: fromCatalog?.icon || pick.icon };
      });
      gamePicker.innerHTML = games
        .map((g) =>
          window.PleyiPremium?.pickerButtonHtml
            ? window.PleyiPremium.pickerButtonHtml(g, { isActive: g.id === gameId, escapeFn: escapeHtml })
            : `
        <button type="button" class="room-game-btn${g.id === gameId ? " is-active" : ""}" data-game-id="${escapeHtml(g.id)}">
          <span class="room-game-btn-icon">${escapeHtml(g.icon || "🎮")}</span>
          <span class="room-game-btn-label">${escapeHtml(g.title)}</span>
        </button>`
        )
        .join("");

      gamePicker.querySelectorAll("[data-game-id]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const nextId = btn.dataset.gameId;
          if (!nextId || nextId === gameId) {
            closeGamesPanel();
            return;
          }
          if (window.PleyiPremium?.ensurePremiumAccess && !window.PleyiPremium.ensurePremiumAccess(nextId)) {
            return;
          }
          const m = window.PlaySession?.getMeta() || {};
          window.GAME_CONTENT?.launchPlay({
            subject: m.subject || "english",
            gameId: nextId,
            level: m.level || "medium",
            topic: m.topic || "all",
            gameTitle: btn.querySelector(".room-game-btn-label")?.textContent || nextId,
          });
        });
      });
    }

    function syncMaterialSummary() {
      const meta = window.PlaySession?.getMeta() || {};
      const clearBtn = document.getElementById("playClearMaterialBtn");
      const text = readMaterial();
      const count = parseMaterialCount(text, meta.subject || "english");
      clearBtn?.classList.toggle("hidden", count === 0);
    }

    function renderSettingsPanel() {
      if (!settingsList) return;

      settingsList.innerHTML = `
        <label class="room-setting-toggle" for="playEnableGameSoundToggle">
          <span class="room-setting-toggle-label">קול במשחק</span>
          <span class="room-setting-toggle-switch">
            <input type="checkbox" id="playEnableGameSoundToggle" ${readSoundEnabled() ? "checked" : ""} />
            <span class="room-setting-toggle-ui" aria-hidden="true"></span>
          </span>
        </label>
        <div class="room-setting-game-group hidden" id="playGameSettingsGroup">
          <p class="room-setting-mode-heading">הגדרות משחק</p>
          <div class="room-settings-list" id="playGameSettingsList"></div>
        </div>
        <div class="room-setting-material-group">
          <p class="room-setting-mode-heading">חומר לימודי</p>
          <button type="button" class="room-setting-material-btn btn-candy" id="openPlayMaterialBtn">הוסף / ערוך חומר לימודי</button>
          <button type="button" class="room-setting-material-clear hidden" id="playClearMaterialBtn">הסר חומר לימודי</button>
        </div>`;

      renderGameToggles(gameId, document.getElementById("playGameSettingsList"));
      syncMaterialSummary();

      document.getElementById("playEnableGameSoundToggle")?.addEventListener("change", (e) => {
        saveSoundEnabled(e.target.checked);
        showToast("ההגדרות עודכנו");
      });

      document.getElementById("openPlayMaterialBtn")?.addEventListener("click", () => {
        closeSettings();
        if (materialInput) materialInput.value = readMaterial();
        materialPanel?.classList.remove("hidden");
      });

      document.getElementById("playClearMaterialBtn")?.addEventListener("click", () => {
        if (!confirm("להסיר את החומר הלימודי? המשחקים יחזרו למילון ברירת המחדל.")) return;
        saveMaterial("");
        window.PlaySession?.updateContent({ usePreset: true });
        syncMaterialSummary();
        showToast("החומר הוסר");
      });
    }

    function openSettings() {
      closeGamesPanel();
      closeMaterialPanel();
      renderSettingsPanel();
      settingsPanel?.classList.remove("hidden");
      settingsBtn?.setAttribute("aria-expanded", "true");
    }

    function openGamesPanel() {
      if (roomCode) {
        window.location.href = `/room?code=${encodeURIComponent(roomCode)}`;
        return;
      }
      closeSettings();
      closeMaterialPanel();
      renderGamePicker();
      gamesPanel?.classList.remove("hidden");
      gamesBtn?.setAttribute("aria-expanded", "true");
    }

    gamesBtn?.addEventListener("click", openGamesPanel);
    document.getElementById("closePlayGamesBtn")?.addEventListener("click", closeGamesPanel);
    document.getElementById("playGamesPanelBackdrop")?.addEventListener("click", closeGamesPanel);

    settingsBtn?.addEventListener("click", openSettings);
    document.getElementById("closePlaySettingsBtn")?.addEventListener("click", closeSettings);
    document.getElementById("playSettingsBackdrop")?.addEventListener("click", closeSettings);

    document.getElementById("closePlayMaterialBtn")?.addEventListener("click", closeMaterialPanel);
    document.getElementById("playCancelMaterialBtn")?.addEventListener("click", closeMaterialPanel);
    document.getElementById("playMaterialPanelBackdrop")?.addEventListener("click", closeMaterialPanel);

    document.getElementById("playSaveMaterialBtn")?.addEventListener("click", () => {
      const meta = window.PlaySession?.getMeta() || {};
      const subject = meta.subject || "english";
      const raw = materialInput?.value || "";

      if (!raw.trim()) {
        saveMaterial("");
        window.PlaySession?.updateContent({ usePreset: true });
        showToast("החומר הוסר");
        closeMaterialPanel();
        syncMaterialSummary();
        return;
      }

      const parsed = window.LEARNING_PARSE?.normalizeLearningContent(raw, subject);
      const items = parsed?.items || [];
      const normalized = parsed?.normalized || raw.trim();

      if (!items.length) {
        showToast("לא הצלחנו לזהות פריטים — נסו להדביק זוגות מילים, למשל: apple=תפוח");
        return;
      }
      if (items.length < 2) {
        showToast("הזינו לפחות 2 פריטים");
        return;
      }

      if (materialInput) materialInput.value = normalized;
      saveMaterial(normalized);
      window.PlaySession?.updateContent({ useMaterial: true });
      showToast(`נשמרו ${items.length} פריטים`);
      closeMaterialPanel();
      syncMaterialSummary();
    });

    window.AI_LESSON?.bindGenerateButton(
      document.getElementById("playAiGenerateBtn"),
      () => ({
        text: materialInput?.value || "",
        subject: (window.PlaySession?.getMeta() || {}).subject || "english",
      }),
      {
        onToast: showToast,
        onSuccess: (result) => {
          if (materialInput) materialInput.value = result.normalized;
        },
      }
    );

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (!materialPanel?.classList.contains("hidden")) closeMaterialPanel();
      else if (!gamesPanel?.classList.contains("hidden")) closeGamesPanel();
      else if (!settingsPanel?.classList.contains("hidden")) closeSettings();
    });

    window.addEventListener("play-content-updated", () => {
      renderGamePicker();
      syncMaterialSummary();
    });

    document.addEventListener("premium-updated", () => {
      renderGamePicker();
    });

    renderGamePicker();
  }

  window.initPlayChrome = initPlayChrome;
  window.playShowToast = showToast;
  window.playReadMaterial = readMaterial;
})();
