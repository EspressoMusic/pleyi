/* Games hub — subject panel + custom builder + Firebase library */

(function () {
  const catalog = window.GAMES_CATALOG;
  if (!catalog) return;

  const grid = document.getElementById("gamesGrid");
  const gridEmpty = document.getElementById("hubGridEmpty");
  const skillFilters = document.getElementById("hubSkillFilters");
  const skillFiltersList = document.getElementById("hubSkillFiltersList");
  const tabs = document.querySelectorAll(".hub-tab");
  const customForm = document.getElementById("customGameForm");
  const customModal = document.getElementById("customGameModal");
  const customSubject = document.getElementById("customSubject");
  const customContent = document.getElementById("customContent");
  const customTitle = document.getElementById("customTitle");
  const customGamePick = document.getElementById("customGamePick");
  const customPreview = document.getElementById("customPreview");
  const customAdvancedPanel = document.getElementById("customAdvancedPanel");
  const customFileInput = document.getElementById("customFileInput");
  const customFileBtn = document.getElementById("customFileBtn");
  const customFileName = document.getElementById("customFileName");
  const customInputBox = document.getElementById("customInputBox");
  const customCreateBtn = document.getElementById("customCreateBtn");
  const customGameQuota = document.getElementById("customGameQuota");
  const libraryGameQuota = document.getElementById("libraryGameQuota");
  const userLibrary = document.getElementById("userLibrary");
  const savedGamesList = document.getElementById("savedGamesList");
  const playHistoryList = document.getElementById("playHistoryList");
  const savedGamesPanel = document.getElementById("savedGamesPanel");
  const playHistoryPanel = document.getElementById("playHistoryPanel");
  const libraryTabs = document.querySelectorAll(".hub-library-tab");

  const DISABLED_SUBJECTS = new Set(["lifeskills", "science"]);

  const TEACHER_PREVIEW =
    location.hostname === "localhost" &&
    new URLSearchParams(location.search).get("preview") === "teacher";

  const PREVIEW_SAVED_GAMES = [
    {
      id: "preview-1",
      title: "אוצר מילים — יחידה 3",
      subject: "english",
      gameId: "word-memory",
      items: Array(12),
      starred: true,
      updatedAt: Date.now() - 86400000,
    },
    {
      id: "preview-2",
      title: "חיבור וחיסור — כיתה ג׳",
      subject: "math",
      gameId: "math-blitz",
      items: Array(20),
      starred: false,
      createdAt: Date.now() - 3 * 86400000,
    },
    {
      id: "preview-3",
      title: "מילות שאלה באנגלית",
      subject: "english",
      gameId: "vocabulary-duel",
      items: Array(8),
      starred: false,
      updatedAt: Date.now() - 7 * 86400000,
    },
  ];

  const PREVIEW_PLAY_HISTORY = [
    {
      gameTitle: "מגדל מילים",
      gameId: "tower-stack",
      score: 840,
      isCustom: false,
      playedAt: Date.now() - 3600000,
    },
    {
      gameTitle: "אוצר מילים — יחידה 3",
      gameId: "word-memory",
      score: 12,
      isCustom: true,
      reason: "12/12",
      playedAt: Date.now() - 2 * 86400000,
    },
    {
      gameTitle: "ברק מתמטי",
      gameId: "math-blitz",
      score: 7,
      isCustom: false,
      reason: "7/10",
      playedAt: Date.now() - 5 * 86400000,
    },
  ];

  function showTeacherDesignPreview() {
    const previewUser = {
      name: "מורה לדוגמה",
      photoURL: null,
      email: "teacher@preview.local",
    };
    const applyPreviewUser = () => window.GameAuth?.setDevPreviewUser?.(previewUser);
    applyPreviewUser();
    requestAnimationFrame(() => {
      applyPreviewUser();
      setTimeout(applyPreviewUser, 200);
    });
    userLibrary?.classList.remove("hidden");
    if (libraryGameQuota) {
      libraryGameQuota.innerHTML =
        'משחקים שיצרתם נשמרים אוטומטית. נותרו <strong>3</strong> מתוך 5 יצירות השבוע · סמנו ★ כדי להציג ראשונים.';
    }
    renderSavedGames(PREVIEW_SAVED_GAMES);
    renderPlayHistory(PREVIEW_PLAY_HISTORY);
    requestAnimationFrame(() => scrollToMyGames());
  }

  function applyDisabledSubjects() {
    tabs.forEach((tab) => {
      const subject = tab.dataset.subject;
      if (!DISABLED_SUBJECTS.has(subject)) return;
      tab.disabled = true;
      tab.setAttribute("aria-disabled", "true");
      tab.classList.add("is-disabled");
      tab.title = "בקרוב";
    });

    customSubject?.querySelectorAll("option").forEach((opt) => {
      if (DISABLED_SUBJECTS.has(opt.value)) opt.disabled = true;
    });
  }

  let activeSubject = "english";
  let editingSavedId = null;
  let pendingCreateAfterLogin = false;
  let activeSkillFilter = null;

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

  function sortLockedGamesLast(games) {
    const isLocked = (game) =>
      window.PleyiPremium?.isPremiumGame?.(game.id) && !window.PleyiPremium?.hasPremium?.();
    return [...games].sort((a, b) => {
      const aLocked = isLocked(a);
      const bLocked = isLocked(b);
      if (aLocked !== bLocked) return aLocked ? 1 : -1;
      return 0;
    });
  }

  function gamesForSubject() {
    const games = catalog[activeSubject] || [];
    const filtered = activeSkillFilter
      ? games.filter((game) => (game.tags || []).includes(activeSkillFilter))
      : games;
    return sortLockedGamesLast(filtered);
  }

  function renderSkillFilters() {
    if (!skillFilters || !skillFiltersList) return;
    const skills = catalog.skillsForSubject(activeSubject);
    if (!skills.length) {
      skillFilters.classList.add("hidden");
      skillFiltersList.innerHTML = "";
      return;
    }
    skillFilters.classList.remove("hidden");
    skillFiltersList.innerHTML = skills
      .map((tag) => skillTagHtml(tag, { filterBtn: true, active: activeSkillFilter === tag }))
      .join("");
  }

  skillFiltersList?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-skill]");
    if (!btn) return;
    const skill = btn.dataset.skill;
    activeSkillFilter = activeSkillFilter === skill ? null : skill;
    renderSkillFilters();
    renderGrid();
  });

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
    grid?.classList.toggle("hidden", games.length === 0 && !!activeSkillFilter);
    gridEmpty?.classList.toggle("hidden", games.length > 0 || !activeSkillFilter);
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

  function setAdvancedOpen(open) {
    customAdvancedPanel?.classList.toggle("hidden", !open);
  }

  function resetFileInput() {
    if (customFileInput) customFileInput.value = "";
    if (customFileName) customFileName.textContent = "";
  }

  function openCustomModal({ advanced = false } = {}) {
    if (customSubject) customSubject.value = activeSubject;
    updateCustomGameOptions();
    updatePreview();
    setAdvancedOpen(advanced);
    resetFileInput();
    customModal?.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    updateCustomQuotaDisplay();
  }

  function closeCustomModal() {
    customModal?.classList.add("hidden");
    document.body.style.overflow = "";
    setAdvancedOpen(false);
    resetFileInput();
  }

  document.getElementById("openCustomModalBtn")?.addEventListener("click", () => openCustomModal());

  customFileBtn?.addEventListener("click", () => customFileInput?.click());

  async function loadCustomFile(file) {
    if (!file) return;
    if (file.size > 1024 * 1024) {
      showToast("הקובץ גדול מדי (מקסימום 1MB)");
      resetFileInput();
      return;
    }
    try {
      customContent.value = await file.text();
      if (customFileName) customFileName.textContent = file.name;
      if (customFileInput) {
        const dt = new DataTransfer();
        dt.items.add(file);
        customFileInput.files = dt.files;
      }
      updatePreview();
    } catch {
      showToast("לא ניתן לקרוא את הקובץ");
      resetFileInput();
    }
  }

  customFileInput?.addEventListener("change", async () => {
    await loadCustomFile(customFileInput.files?.[0]);
  });

  customInputBox?.addEventListener("dragover", (e) => {
    e.preventDefault();
    customInputBox.classList.add("is-dragover");
  });

  customInputBox?.addEventListener("dragleave", () => {
    customInputBox.classList.remove("is-dragover");
  });

  customInputBox?.addEventListener("drop", async (e) => {
    e.preventDefault();
    customInputBox.classList.remove("is-dragover");
    const file = e.dataTransfer?.files?.[0];
    if (file) await loadCustomFile(file);
  });

  customContent?.addEventListener("input", () => {
    if (customFileInput?.value) resetFileInput();
    updatePreview();
  });
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
      if (tab.disabled || DISABLED_SUBJECTS.has(tab.dataset.subject)) return;
      activeSubject = tab.dataset.subject;
      tabs.forEach((t) => t.classList.toggle("active", t === tab));
      activeSkillFilter = null;
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
    if (DISABLED_SUBJECTS.has(customSubject.value)) {
      customSubject.value = activeSubject;
      return;
    }
    updateCustomGameOptions();
    updatePreview();
  });
  customTitle?.addEventListener("input", updatePreview);
  customGamePick?.addEventListener("change", updatePreview);

  async function updateCustomQuotaDisplay() {
    if (!customGameQuota) return;

    if (!window.GameAuth?.getUser()) {
      customGameQuota.classList.add("hidden");
      customGameQuota.textContent = "";
      customCreateBtn?.removeAttribute("disabled");
      return;
    }

    try {
      const quota = await UserData.getCustomGameQuota();
      if (quota.isPremium) {
        customGameQuota.classList.add("hidden");
        customGameQuota.textContent = "";
        customCreateBtn?.removeAttribute("disabled");
        return;
      }

      customGameQuota.classList.remove("hidden");
      if (quota.allowed) {
        customGameQuota.classList.remove("is-limit");
        customGameQuota.innerHTML = `נותרו <strong>${quota.remaining}</strong> מתוך ${quota.limit} משחקים מותאמים השבוע (גרסה חינמית).`;
        if (!editingSavedId) customCreateBtn?.removeAttribute("disabled");
      } else {
        customGameQuota.classList.add("is-limit");
        customGameQuota.innerHTML = `הגעתם למכסה השבועית (${quota.limit} משחקים). <a href="/premium">שדרגו לפרימיום</a> ליצירה ללא הגבלה.`;
        if (!editingSavedId) customCreateBtn?.setAttribute("disabled", "disabled");
      }
    } catch {
      customGameQuota.classList.add("hidden");
      customCreateBtn?.removeAttribute("disabled");
    }
  }

  async function updateLibraryQuotaDisplay() {
    if (!libraryGameQuota || !window.GameAuth?.getUser()) return;

    try {
      const quota = await UserData.getCustomGameQuota();
      if (quota.isPremium) {
        libraryGameQuota.textContent =
          "משחקים שיצרתם נשמרים אוטומטית. סמנו ★ כדי להציג ראשונים.";
        return;
      }

      libraryGameQuota.innerHTML = quota.allowed
        ? `משחקים שיצרתם נשמרים אוטומטית. נותרו <strong>${quota.remaining}</strong> מתוך ${quota.limit} יצירות השבוע · סמנו ★ כדי להציג ראשונים.`
        : `הגעתם למכסה — ${quota.limit} משחקים מותאמים בשבוע. <a href="/premium">שדרגו לפרימיום</a> ליצירה ללא הגבלה. סמנו ★ כדי להציג ראשונים.`;
    } catch {
      libraryGameQuota.textContent =
        "משחקים שיצרתם נשמרים אוטומטית. סמנו ★ כדי להציג ראשונים.";
    }
  }

  async function persistAndLaunchGame({ launch = true } = {}) {
    const { subject, items, gameId, title, content } = getFormData();
    if (items.length < 2) {
      showToast("הזינו לפחות 2 שורות (מילה=תרגום או תרגיל=תשובה)");
      return null;
    }

    if (!window.GameAuth?.getUser()) {
      pendingCreateAfterLogin = true;
      sessionStorage.setItem(
        "pleyi-pending-create",
        JSON.stringify({ subject, items, gameId, title, content, editingSavedId })
      );
      showToast("התחברו — המשחק יישמר אוטומטית");
      document.getElementById("loginModal")?.classList.remove("hidden");
      return null;
    }

    let savedGameId = editingSavedId;
    const isUpdate = !!editingSavedId;

    if (editingSavedId) {
      await UserData.updateCustomGame(editingSavedId, { title, subject, gameId, content, items });
    } else {
      const res = await UserData.saveCustomGame({ title, subject, gameId, content, items });
      if (!res.ok) {
        showToast(res.error || "שגיאה בשמירה");
        if (res.limitReached) updateCustomQuotaDisplay();
        return null;
      }
      savedGameId = res.id;
      editingSavedId = res.id;
    }

    await refreshLibrary();
    updateCustomQuotaDisplay();

    if (launch) {
      UserData.launchGame({ subject, gameId, items, title, savedGameId });
      closeCustomModal();
      showToast(isUpdate ? "המשחק עודכן, נשמר ונפתח" : "המשחק נשמר ונפתח");
    } else {
      showToast(isUpdate ? "המשחק עודכן ונשמר" : "המשחק נשמר אוטומטית");
    }

    return savedGameId;
  }

  customForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    await persistAndLaunchGame({ launch: true });
  });

  document.getElementById("customExampleBtn")?.addEventListener("click", () => {
    editingSavedId = null;
    const subject = customSubject.value;
    if (subject === "math") {
      customContent.value = `5+3=8\n12-4=8\n6×7=42\n56÷8=7\n9+6=15\n20-7=13`;
    } else if (subject === "lifeskills") {
      customContent.value = `אמפתיה=הבנת רגשות האחר\nתקציב=תוכנית לניהול כסף\nהאזנה פעילה=להקשיב תוך הבנת הדובר\nניהול זמן=תכנון משימות לפי סדר עדיפויות\nבטיחות באינטרנט=שמירה על פרטיות ברשת`;
    } else if (subject === "science") {
      customContent.value = `H2O=מים\nO2=חמצן\nCO2=פחמן דו-חמצני\nאטום=יחידת החומר\nמולקולה=שני אטומים ומעלה`;
    } else {
      customContent.value = `apple=תפוח\nbook=ספר\nhappy=שמח\nrun=לרוץ\nfriend=חבר\ncat=חתול`;
    }
    updatePreview();
  });

  window.AI_LESSON?.bindGenerateButton(
    document.getElementById("customAiGenerateBtn"),
    () => ({ text: customContent?.value || "", subject: customSubject?.value || "english" }),
    {
      onToast: showToast,
      onSuccess: (result) => {
        if (customContent) customContent.value = result.normalized;
        if (customTitle && result.title) customTitle.value = result.title;
        if (customGamePick && result.gameId) {
          const hasOption = [...customGamePick.options].some((o) => o.value === result.gameId);
          customGamePick.value = hasOption ? result.gameId : "auto";
        }
        updatePreview();
      },
    }
  );

  function renderSavedGames(games) {
    if (!savedGamesList) return;
    if (!games.length) {
      savedGamesList.innerHTML =
        '<p class="hub-library-empty">עדיין לא יצרתם משחקים. צרו משחק מותאם — הוא יישמר אוטומטית כאן.</p>';
      return;
    }

    savedGamesList.innerHTML = games
      .map(
        (g) => `
      <article class="hub-library-item sticker-card sticker-white${g.starred ? " is-starred" : ""}">
        <button type="button" class="hub-library-star${g.starred ? " is-active" : ""}" data-star-saved="${g.id}" aria-label="${g.starred ? "הסר כוכב" : "סמן כוכב"}" aria-pressed="${g.starred ? "true" : "false"}">${g.starred ? "★" : "☆"}</button>
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
        openCustomModal({ advanced: true });
        showToast("עריכת משחק — שמרו כדי לעדכן");
      });
    });

    savedGamesList.querySelectorAll("[data-star-saved]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const res = await UserData.toggleSavedGameStar(btn.dataset.starSaved);
        if (!res.ok) {
          showToast(res.error || "לא ניתן לעדכן כוכב");
          return;
        }
        await refreshLibrary();
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
    if (TEACHER_PREVIEW) return;

    if (!window.GameAuth?.getUser()) {
      userLibrary?.classList.add("hidden");
      return;
    }

    userLibrary?.classList.remove("hidden");

    try {
      const [saved, history] = await Promise.all([
        UserData.getSavedGames(),
        UserData.getPlayHistory(),
      ]);
      renderSavedGames(saved);
      renderPlayHistory(history);
      await updateLibraryQuotaDisplay();
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

  async function resumePendingCreate() {
    const raw = sessionStorage.getItem("pleyi-pending-create");
    if (!raw || !window.GameAuth?.getUser()) return;

    sessionStorage.removeItem("pleyi-pending-create");
    pendingCreateAfterLogin = false;

    try {
      const pending = JSON.parse(raw);
      if (customSubject) customSubject.value = pending.subject || activeSubject;
      if (customTitle) customTitle.value = pending.title || "";
      if (customContent) customContent.value = pending.content || "";
      editingSavedId = pending.editingSavedId || null;
      updateCustomGameOptions();
      if (customGamePick && pending.gameId) customGamePick.value = pending.gameId;
      updatePreview();
      openCustomModal({ advanced: !!pending.title });
      await persistAndLaunchGame({ launch: true });
    } catch {
      /* ignore bad pending payload */
    }
  }

  function scrollToMyGames() {
    document.getElementById("myGames")?.scrollIntoView({ behavior: "smooth", block: "start" });
    libraryTabs.forEach((t) => t.classList.toggle("active", t.dataset.lib === "saved"));
    savedGamesPanel?.classList.remove("hidden");
    playHistoryPanel?.classList.add("hidden");
  }

  document.getElementById("navMyGamesLink")?.addEventListener("click", (e) => {
    e.preventDefault();
    window.GameAuth?._closeUserDropdown?.();
    scrollToMyGames();
  });

  window.GameAuth?.bindModals(showToast);
  window.GameAuth?.onUserChange(async (user) => {
    if (TEACHER_PREVIEW) return;
    await refreshLibrary();
    updateCustomQuotaDisplay();
    if (user) {
      if (window.location.hash === "#myGames") scrollToMyGames();
      await resumePendingCreate();
    }
  });

  } else if (window.location.hash === "#myGames" && window.GameAuth?.getUser()) {
    scrollToMyGames();
  }

  window.addEventListener("hashchange", () => {
    if (TEACHER_PREVIEW) {
      if (window.location.hash === "#myGames") scrollToMyGames();
      return;
    }
    if (window.location.hash === "#myGames" && window.GameAuth?.getUser()) scrollToMyGames();
  });
  document.addEventListener("premium-updated", () => {
    renderGrid();
    updateCustomQuotaDisplay();
    updateLibraryQuotaDisplay();
  });

  applyDisabledSubjects();
  renderSkillFilters();
  renderGrid();
  updateCustomGameOptions();
  updatePreview();
  refreshLibrary();
  if (!TEACHER_PREVIEW && window.GameAuth?.getUser()) resumePendingCreate();
  if (TEACHER_PREVIEW) showTeacherDesignPreview();
})();
