/* Games hub — subject panel + custom builder + Firebase library */

(function () {
  const catalog = window.GAMES_CATALOG;
  if (!catalog) return;

  const grid = document.getElementById("gamesGrid");
  const gridEmpty = document.getElementById("hubGridEmpty");
  const skillFilters = document.getElementById("hubSkillFilters");
  const skillFiltersList = document.getElementById("hubSkillFiltersList");
  const skillFiltersClear = document.getElementById("hubSkillFiltersClear");
  const tabs = document.querySelectorAll(".hub-tab");
  const customForm = document.getElementById("customGameForm");
  const customModal = document.getElementById("customGameModal");
  const customSubject = document.getElementById("customSubject");
  const customContent = document.getElementById("customContent");
  const customTitle = document.getElementById("customTitle");
  const customGamePick = document.getElementById("customGamePick");
  const customPreview = document.getElementById("customPreview");
  const customSaveBtn = document.getElementById("customSaveBtn");
  const userLibrary = document.getElementById("userLibrary");
  const savedGamesList = document.getElementById("savedGamesList");
  const playHistoryList = document.getElementById("playHistoryList");
  const savedGamesPanel = document.getElementById("savedGamesPanel");
  const playHistoryPanel = document.getElementById("playHistoryPanel");
  const libraryTabs = document.querySelectorAll(".hub-library-tab");

  let activeSubject = "english";
  let editingSavedId = null;
  const activeSkillFilters = new Set();

  function showToast(msg) {
    const t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.remove("hidden");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => t.classList.add("hidden"), 2800);
  }

  function allGames() {
    return catalog.allGamesList ? catalog.allGamesList() : [...catalog.english, ...catalog.math];
  }

  function subjectLabel(key) {
    return catalog.subjects?.[key] || key;
  }

  function gameName(gameId) {
    return allGames().find((g) => g.id === gameId)?.title || gameId;
  }

  function gameSummary(desc) {
    return catalog.gameSummary ? catalog.gameSummary(desc) : desc || "";
  }

  const STICKER_COLORS = ["purple", "yellow", "teal", "pink", "orange", "lime", "blue", "green", "white"];

  const CARD_COLORS = ["purple", "pink", "teal", "orange", "lime", "blue", "green"];

  let cardColors = [];

  function getHubGridCols() {
    if (window.matchMedia("(min-width: 900px)").matches) return 3;
    if (window.matchMedia("(min-width: 640px)").matches) return 2;
    return 1;
  }

  function buildCardColors(count, cols) {
    const assigned = [];
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const banned = new Set();
      if (col > 0) banned.add(assigned[i - 1]);
      if (row > 0) {
        banned.add(assigned[i - cols]);
        if (col > 0) banned.add(assigned[i - cols - 1]);
        if (col < cols - 1) banned.add(assigned[i - cols + 1]);
      }
      const used = new Set(assigned);
      const pick =
        CARD_COLORS.find((c) => !banned.has(c) && !used.has(c)) ||
        CARD_COLORS.find((c) => !banned.has(c)) ||
        CARD_COLORS[i % CARD_COLORS.length];
      assigned.push(pick);
    }
    return assigned;
  }

  function cardColorForIndex(index) {
    return cardColors[index] || CARD_COLORS[index % CARD_COLORS.length];
  }

  function applyModalSticker(el, color) {
    if (!el) return;
    STICKER_COLORS.forEach((c) => el.classList.remove(`sticker-${c}`));
    if (color) el.classList.add(`sticker-${color}`);
  }

  function skillTagHtml(tag, { filterBtn = false, active = false } = {}) {
    const color = catalog.skillColor(tag);
    const base = `game-info-tag game-info-tag--${color}`;
    if (filterBtn) {
      return `<button type="button" class="hub-skill-filter ${base}${active ? " is-active" : ""}" data-skill="${escapeHtml(tag)}" aria-pressed="${active}">${escapeHtml(tag)}</button>`;
    }
    return `<span class="${base}">${escapeHtml(tag)}</span>`;
  }

  function gamesForSubject() {
    const games = catalog[activeSubject] || [];
    if (!activeSkillFilters.size) return games;
    return games.filter((game) => (game.tags || []).some((tag) => activeSkillFilters.has(tag)));
  }

  function renderSkillFilters() {
    if (!skillFilters || !skillFiltersList) return;
    const skills = catalog.skillsForSubject(activeSubject);
    if (!skills.length) {
      skillFilters.classList.add("hidden");
      skillFiltersList.innerHTML = "";
      skillFiltersClear?.classList.add("hidden");
      return;
    }
    skillFilters.classList.remove("hidden");
    skillFiltersList.innerHTML = skills
      .map((tag) => skillTagHtml(tag, { filterBtn: true, active: activeSkillFilters.has(tag) }))
      .join("");
    skillFiltersClear?.classList.toggle("hidden", activeSkillFilters.size === 0);
  }

  function clearSkillFilters() {
    activeSkillFilters.clear();
    renderSkillFilters();
    renderGrid();
  }

  skillFiltersList?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-skill]");
    if (!btn) return;
    const skill = btn.dataset.skill;
    if (activeSkillFilters.has(skill)) activeSkillFilters.delete(skill);
    else activeSkillFilters.add(skill);
    renderSkillFilters();
    renderGrid();
  });

  skillFiltersClear?.addEventListener("click", clearSkillFilters);

  function cardHtml(game, index) {
    const color = cardColorForIndex(index);
    const sticker = `sticker-${color}`;
    const meta = catalog.gameMeta(game, activeSubject);
    const skillsText = meta.skills.join(" · ");
    const summary = gameSummary(game.desc);
    return `
      <article class="hub-game-card pitch-card sticker-card ${sticker}" data-game-id="${game.id}" data-game-title="${escapeHtml(game.title)}" data-game-desc="${escapeHtml(summary)}" data-game-color="${color}">
        <button type="button" class="hub-game-info-btn" aria-label="מידע על ${escapeHtml(game.title)}"
          data-game-color="${color}"
          data-info-icon="${escapeHtml(game.icon || "🎮")}"
          data-info-title="${escapeHtml(game.title)}"
          data-info-about="${escapeHtml(meta.about)}"
          data-info-content="${escapeHtml(meta.content)}"
          data-info-skills="${escapeHtml(skillsText)}">
          <span aria-hidden="true">i</span>
        </button>
        <h3 class="hub-game-title font-cartoon">${game.title}</h3>
        <button type="button" class="hub-game-play-btn btn btn-primary btn-candy btn-full">שחק עכשיו</button>
      </article>`;
  }

  function renderGrid() {
    const games = gamesForSubject();
    cardColors = buildCardColors(games.length, getHubGridCols());
    if (grid) grid.innerHTML = games.map((game, index) => cardHtml(game, index)).join("");
    grid?.querySelectorAll(".hub-game-card").forEach((card) => {
      window.PleyiPremium?.decorateHubCard?.(card);
    });
    grid?.classList.toggle("hidden", games.length === 0 && activeSkillFilters.size > 0);
    gridEmpty?.classList.toggle("hidden", games.length > 0 || activeSkillFilters.size === 0);
  }

  let gridResizeTimer;
  window.addEventListener("resize", () => {
    if (!grid) return;
    clearTimeout(gridResizeTimer);
    gridResizeTimer = setTimeout(renderGrid, 150);
  });

  grid?.addEventListener("click", (e) => {
    if (e.target.closest(".hub-game-info-btn")) {
      e.stopPropagation();
      openGameInfo(e.target.closest(".hub-game-info-btn"));
      return;
    }
    const card = e.target.closest(".hub-game-card");
    if (card) launchGameFromHub(card);
  });

  function launchGameFromHub(card) {
    const gameId = card.dataset.gameId;
    const gameTitle = card.dataset.gameTitle;
    if (!gameId || !window.GAME_CONTENT) return;
    if (window.PleyiPremium?.ensurePremiumAccess && !window.PleyiPremium.ensurePremiumAccess(gameId)) return;
    GAME_CONTENT.launchPlay({
      subject: activeSubject,
      gameId,
      level: "medium",
      topic: "all",
      gameTitle,
    });
  }

  /* play setup modal removed — games open on /play with full room-style chrome */

  const gameInfoModal = document.getElementById("gameInfoModal");
  const gameInfoModalBox = gameInfoModal?.querySelector(".modal-game-info");
  const gameInfoTitle = document.getElementById("gameInfoTitle");
  const gameInfoIcon = document.getElementById("gameInfoIcon");
  const gameInfoAbout = document.getElementById("gameInfoAbout");
  const gameInfoContent = document.getElementById("gameInfoContent");
  const gameInfoSkills = document.getElementById("gameInfoSkills");

  function openGameInfo(btn) {
    if (!gameInfoModal) return;
    applyModalSticker(gameInfoModalBox, btn.dataset.gameColor);
    if (gameInfoIcon) gameInfoIcon.textContent = btn.dataset.infoIcon || "🎮";
    gameInfoTitle.textContent = btn.dataset.infoTitle || "";
    gameInfoAbout.textContent = btn.dataset.infoAbout || "";
    gameInfoContent.textContent = btn.dataset.infoContent || "";
    if (gameInfoSkills) {
      const tags = (btn.dataset.infoSkills || "")
        .split(" · ")
        .map((s) => s.trim())
        .filter(Boolean);
      gameInfoSkills.innerHTML = tags.length
        ? tags.map((tag) => skillTagHtml(tag)).join("")
        : `<span class="game-info-tag game-info-tag--muted">כללי</span>`;
    }
    gameInfoModal.classList.remove("hidden");
  }

  function closeGameInfo() {
    gameInfoModal?.classList.add("hidden");
  }

  document.getElementById("gameInfoClose")?.addEventListener("click", closeGameInfo);
  gameInfoModal?.addEventListener("click", (e) => {
    if (e.target.id === "gameInfoModal") closeGameInfo();
  });

  function openCustomModal() {
    if (customSubject) customSubject.value = activeSubject;
    updateCustomGameOptions();
    updatePreview();
    customModal?.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  function closeCustomModal() {
    customModal?.classList.add("hidden");
    document.body.style.overflow = "";
  }

  document.getElementById("openCustomModalBtn")?.addEventListener("click", openCustomModal);
  document.getElementById("customModalClose")?.addEventListener("click", closeCustomModal);
  customModal?.addEventListener("click", (e) => {
    if (e.target.id === "customGameModal") closeCustomModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && customModal && !customModal.classList.contains("hidden")) {
      closeCustomModal();
    }
  });

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      activeSubject = tab.dataset.subject;
      tabs.forEach((t) => t.classList.toggle("active", t === tab));
      activeSkillFilters.clear();
      renderSkillFilters();
      renderGrid();
      updateCustomGameOptions();
    });
  });

  function updateCustomGameOptions() {
    const subject = customSubject.value;
    const games = catalog[subject] || [];
    customGamePick.innerHTML =
      `<option value="auto">בחירה אוטומטית (מומלץ)</option>` +
      games.map((g) => `<option value="${g.id}">${g.title}</option>`).join("");
  }

  function getFormData() {
    const subject = customSubject.value;
    const items = catalog.parseContent(customContent.value, subject);
    const gameId =
      customGamePick.value === "auto" ? catalog.pickGameForContent(items, subject) : customGamePick.value;
    const title = customTitle?.value.trim() || "שיעור מותאם אישית";
    return { subject, items, gameId, title, content: customContent.value.trim() };
  }

  function updatePreview() {
    const { subject, items, gameId } = getFormData();
    if (!items.length) {
      customPreview.innerHTML = '<p class="hub-preview-empty">הזינו תוכן כדי לראות תצוגה מקדימה</p>';
      return;
    }
    customPreview.innerHTML = `
      <p><strong>${items.length}</strong> פריטים זוהו · משחק מומלץ: <strong>${gameName(gameId)}</strong></p>
      <ul class="hub-preview-list">${items
        .slice(0, 5)
        .map((it) => `<li dir="ltr"><span>${it.en}</span> → <span dir="rtl">${it.he}</span></li>`)
        .join("")}${items.length > 5 ? `<li>… ועוד ${items.length - 5}</li>` : ""}</ul>`;
  }

  customSubject?.addEventListener("change", () => {
    updateCustomGameOptions();
    updatePreview();
  });
  customContent?.addEventListener("input", updatePreview);
  customTitle?.addEventListener("input", updatePreview);
  customGamePick?.addEventListener("change", updatePreview);

  async function saveToAccount({ launch = false } = {}) {
    const { subject, items, gameId, title, content } = getFormData();
    if (items.length < 2) {
      showToast("הזינו לפחות 2 שורות");
      return null;
    }
    if (!window.GameAuth?.getUser()) {
      showToast("התחברו כדי לשמור");
      document.getElementById("loginModal")?.classList.remove("hidden");
      return null;
    }

    let savedId = editingSavedId;
    const isUpdate = !!editingSavedId;
    const payload = { title, subject, gameId, content, items };

    if (editingSavedId) {
      await UserData.updateCustomGame(editingSavedId, payload);
    } else {
      const res = await UserData.saveCustomGame(payload);
      if (!res.ok) {
        showToast(res.error || "שגיאה בשמירה");
        return null;
      }
      savedId = res.id;
      editingSavedId = savedId;
    }

    await refreshLibrary();
    showToast(isUpdate ? "המשחק עודכן!" : "המשחק נשמר!");

    if (launch) {
      UserData.launchGame({ subject, gameId, items, title, savedGameId: savedId });
    }
    return savedId;
  }

  customSaveBtn?.addEventListener("click", () => saveToAccount({ launch: false }));

  customForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const { subject, items, gameId, title, content } = getFormData();
    if (items.length < 2) {
      showToast("הזינו לפחות 2 שורות (מילה=תרגום או תרגיל=תשובה)");
      return;
    }

    let savedGameId = editingSavedId;
    if (window.GameAuth?.getUser()) {
      if (editingSavedId) {
        await UserData.updateCustomGame(editingSavedId, { title, subject, gameId, content, items });
      } else {
        const res = await UserData.saveCustomGame({ title, subject, gameId, content, items });
        if (res.ok) {
          savedGameId = res.id;
          editingSavedId = res.id;
        }
      }
      await refreshLibrary();
    }

    UserData.launchGame({
      subject,
      gameId,
      items,
      title,
      savedGameId: savedGameId || null,
    });
    closeCustomModal();
    showToast("המשחק נפתח בחלון חדש");
  });

  document.getElementById("customExampleBtn")?.addEventListener("click", () => {
    editingSavedId = null;
    const subject = customSubject.value;
    if (subject === "math") {
      customContent.value = `5+3=8\n12-4=8\n6×7=42\n56÷8=7\n9+6=15\n20-7=13`;
    } else if (subject === "tanakh") {
      customContent.value = `בראשית=בתחילת\nשמים=רקיע\nארץ=יבשה\nאור=יום\nמים=ים`;
    } else if (subject === "science") {
      customContent.value = `H2O=מים\nO2=חמצן\nCO2=פחמן דו-חמצני\nאטום=יחידת החומר\nמולקולה=שני אטומים ומעלה`;
    } else {
      customContent.value = `apple=תפוח\nbook=ספר\nhappy=שמח\nrun=לרוץ\nfriend=חבר\ncat=חתול`;
    }
    updatePreview();
  });

  function renderSavedGames(games) {
    if (!savedGamesList) return;
    if (!games.length) {
      savedGamesList.innerHTML =
        '<p class="hub-library-empty">עדיין לא שמרתם משחקים. צרו משחק מותאם למטה ולחצו «שמור לחשבון».</p>';
      return;
    }

    savedGamesList.innerHTML = games
      .map(
        (g) => `
      <article class="hub-library-item sticker-card sticker-white">
        <div class="hub-library-item-body">
          <h3 class="font-cartoon">${escapeHtml(g.title)}</h3>
          <p>${subjectLabel(g.subject)} · ${gameName(g.gameId)} · ${g.items?.length || 0} פריטים</p>
          <time>${UserData.formatDate(g.updatedAt || g.createdAt)}</time>
        </div>
        <div class="hub-library-item-actions">
          <button type="button" class="btn btn-primary btn-candy btn-sm" data-play-saved="${g.id}">▶ שחק</button>
          <button type="button" class="btn btn-outline btn-candy btn-sm" data-edit-saved="${g.id}">✏️ ערוך</button>
          <button type="button" class="btn btn-outline btn-candy btn-sm hub-btn-danger" data-delete-saved="${g.id}">🗑</button>
        </div>
      </article>`
      )
      .join("");

    savedGamesList.querySelectorAll("[data-play-saved]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const game = games.find((x) => x.id === btn.dataset.playSaved);
        if (!game) return;
        UserData.launchGame({
          subject: game.subject,
          gameId: game.gameId,
          items: game.items,
          title: game.title,
          savedGameId: game.id,
        });
      });
    });

    savedGamesList.querySelectorAll("[data-edit-saved]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const game = games.find((x) => x.id === btn.dataset.editSaved);
        if (!game) return;
        editingSavedId = game.id;
        customTitle.value = game.title || "";
        customSubject.value = game.subject;
        customContent.value = game.content || "";
        updateCustomGameOptions();
        customGamePick.value = game.gameId;
        updatePreview();
        openCustomModal();
        showToast("עריכת משחק — שמרו כדי לעדכן");
      });
    });

    savedGamesList.querySelectorAll("[data-delete-saved]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm("למחוק את המשחק השמור?")) return;
        await UserData.deleteSavedGame(btn.dataset.deleteSaved);
        if (editingSavedId === btn.dataset.deleteSaved) editingSavedId = null;
        await refreshLibrary();
        showToast("המשחק נמחק");
      });
    });
  }

  function renderPlayHistory(entries) {
    if (!playHistoryList) return;
    if (!entries.length) {
      playHistoryList.innerHTML =
        '<p class="hub-library-empty">עדיין אין היסטוריה. שחקו משחק — הניקוד יישמר כאן.</p>';
      return;
    }

    playHistoryList.innerHTML = entries
      .map(
        (e) => `
      <article class="hub-library-item sticker-card sticker-white">
        <div class="hub-library-item-body">
          <h3 class="font-cartoon">${escapeHtml(e.gameTitle)}${e.isCustom ? " (מותאם)" : ""}</h3>
          <p>ניקוד: <strong>${e.score ?? 0}</strong>${e.reason ? ` · ${escapeHtml(e.reason)}` : ""}</p>
          <time>${UserData.formatDate(e.playedAt)}</time>
        </div>
        <div class="hub-library-item-actions">
          <a href="/play/${e.gameId}" target="_blank" rel="noopener" class="btn btn-outline btn-candy btn-sm">שחק שוב</a>
        </div>
      </article>`
      )
      .join("");
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  async function refreshLibrary() {
    if (!window.GameAuth?.getUser()) {
      userLibrary?.classList.add("hidden");
      customSaveBtn?.classList.add("hidden");
      return;
    }

    userLibrary?.classList.remove("hidden");
    customSaveBtn?.classList.remove("hidden");

    try {
      const [saved, history] = await Promise.all([
        UserData.getSavedGames(),
        UserData.getPlayHistory(),
      ]);
      renderSavedGames(saved);
      renderPlayHistory(history);
    } catch (err) {
      console.error(err);
      savedGamesList.innerHTML =
        '<p class="hub-library-empty">לא הצלחנו לטעון נתונים. ודאו ש-Firestore מוגדר.</p>';
    }
  }

  libraryTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      libraryTabs.forEach((t) => t.classList.toggle("active", t === tab));
      const isSaved = tab.dataset.lib === "saved";
      savedGamesPanel?.classList.toggle("hidden", !isSaved);
      playHistoryPanel?.classList.toggle("hidden", isSaved);
    });
  });

  window.GameAuth?.bindModals(showToast);
  window.GameAuth?.onUserChange(() => refreshLibrary());
  document.addEventListener("premium-updated", () => renderGrid());

  renderSkillFilters();
  renderGrid();
  updateCustomGameOptions();
  updatePreview();
  refreshLibrary();
})();
