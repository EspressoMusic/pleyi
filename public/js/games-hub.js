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
  const userLibrary = document.getElementById("userLibrary");
  const teacherRoomName = document.getElementById("teacherRoomName");
  const teacherRoomAvatar = document.getElementById("teacherRoomAvatar");
  const teacherRoomSub = document.getElementById("teacherRoomSub");
  const teacherFavoritesList = document.getElementById("teacherFavoritesList");
  const teacherCreatedList = document.getElementById("teacherCreatedList");
  const teacherRecentList = document.getElementById("teacherRecentList");
  const teacherLessonsList = document.getElementById("teacherLessonsList");
  const teacherFavoritesCount = document.getElementById("teacherFavoritesCount");
  const teacherCreatedCount = document.getElementById("teacherCreatedCount");
  const teacherRecentCount = document.getElementById("teacherRecentCount");

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
      starred: true,
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

  const FREE_LESSON_PACKS = [
    {
      id: "en-animals",
      subject: "english",
      topic: "animals",
      level: "easy",
      title: "חיות באנגלית",
      desc: "מילים בסיסיות על חיות מחמד וברייה",
      icon: "🐾",
      gameId: "word-memory",
    },
    {
      id: "en-food",
      subject: "english",
      topic: "food",
      level: "easy",
      title: "אוכל ושתייה",
      desc: "תפוח, מים ומילים יומיומיות באנגלית",
      icon: "🍎",
      gameId: "vocabulary-duel",
    },
    {
      id: "en-school",
      subject: "english",
      topic: "school",
      level: "easy",
      title: "בית ספר",
      desc: "מורה, תלמיד, ספר ומילות כיתה",
      icon: "🏫",
      gameId: "word-memory",
    },
    {
      id: "en-family",
      subject: "english",
      topic: "family",
      level: "medium",
      title: "משפחה וחברים",
      desc: "מילים על קשרים ויחסים חברתיים",
      icon: "👨‍👩‍👧",
      gameId: "vocabulary-duel",
    },
    {
      id: "math-add",
      subject: "math",
      topic: "addition",
      level: "easy",
      title: "חיבור בסיסי",
      desc: "תרגילי חיבור לכיתות א׳–ב׳",
      icon: "➕",
      gameId: "math-duel",
    },
    {
      id: "math-mult",
      subject: "math",
      topic: "multiplication",
      level: "medium",
      title: "לוח הכפל",
      desc: "תרגילי כפל בקצב מהיר",
      icon: "✖️",
      gameId: "math-blitz",
    },
    {
      id: "math-sub",
      subject: "math",
      topic: "subtraction",
      level: "easy",
      title: "חיסור",
      desc: "תרגילי חיסור מדורגים",
      icon: "➖",
      gameId: "math-duel",
    },
    {
      id: "en-actions",
      subject: "english",
      topic: "actions",
      level: "medium",
      title: "פעלים ותארים",
      desc: "run, happy, big ומילים דומות",
      icon: "🏃",
      gameId: "tower-stack",
    },
  ];

  function applyPreviewNav(user) {
    document.getElementById("authLoginBtn")?.classList.add("hidden");
    document.getElementById("mobileLoginBtn")?.classList.add("hidden");
    document.getElementById("authUserMenu")?.classList.remove("hidden");
    const userName = document.getElementById("authUserName");
    if (userName) userName.textContent = user.name;
    const userPhoto = document.getElementById("authUserPhoto");
    const userInitial = document.getElementById("authUserInitial");
    if (userPhoto && userInitial) {
      userPhoto.removeAttribute("src");
      userPhoto.classList.add("hidden");
      userInitial.textContent = (user.name || "?").charAt(0).toUpperCase();
      userInitial.classList.remove("hidden");
    }
  }

  function showTeacherDesignPreview() {
    const previewUser = {
      name: "מורה לדוגמה",
      photoURL: null,
      email: "teacher@preview.local",
    };
    const applyPreviewUser = () => {
      window.GameAuth?.setDevPreviewUser?.(previewUser);
      applyPreviewNav(previewUser);
    };
    applyPreviewUser();
    requestAnimationFrame(() => {
      applyPreviewUser();
      setTimeout(applyPreviewUser, 250);
      setTimeout(applyPreviewUser, 800);
    });
    userLibrary?.classList.remove("hidden");
    renderTeacherRoom(PREVIEW_SAVED_GAMES, PREVIEW_PLAY_HISTORY, previewUser);
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
    if (customFileName) customFileName.textContent = `טוען ${file.name}…`;
    try {
      customContent.value = await window.extractMaterialText(file);
      if (customFileName) customFileName.textContent = file.name;
      if (customFileInput) {
        const dt = new DataTransfer();
        dt.items.add(file);
        customFileInput.files = dt.files;
      }
      updatePreview();
    } catch (e) {
      showToast(e.message || "לא ניתן לקרוא את הקובץ");
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
      return;
    }

    try {
      const { balance, allowance } = await UserData.getCredits();
      customGameQuota.classList.remove("hidden");
      const low = balance < UserData.AI_GAME_CREDIT_COST;
      customGameQuota.classList.toggle("is-limit", low);
      customGameQuota.innerHTML = low
        ? `אין קרדיטים ליצירה עם AI. <a href="/premium">שדרגו מנוי</a> לקבלת קרדיטים נוספים.`
        : `יצירה עם AI: <strong>${balance}</strong> קרדיטים נותרו (מתוך ${allowance}).`;
    } catch {
      customGameQuota.classList.add("hidden");
    }
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatPremiumDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" });
  }

  function lessonPackContent(pack) {
    const pool = window.GAME_CONTENT?.getPool?.(pack.subject, pack.level, pack.topic) || [];
    return pool.map((item) => `${item.en} — ${item.he}`).join("\n");
  }

  function lessonPackItems(pack) {
    return window.GAME_CONTENT?.getPool?.(pack.subject, pack.level, pack.topic) || [];
  }

  function updateTeacherHeader(user) {
    const name = user?.name || "מורה";
    if (teacherRoomName) teacherRoomName.textContent = name;
    if (!teacherRoomAvatar) return;

    if (user?.photoURL) {
      teacherRoomAvatar.innerHTML = `<img src="${escapeHtml(user.photoURL)}" alt="" width="52" height="52" referrerpolicy="no-referrer" />`;
      return;
    }

    teacherRoomAvatar.textContent = name.charAt(0).toUpperCase();
  }

  async function renderTeacherSubscription() {
    if (!teacherRoomSub) return;

    let creditsMeta = "";
    try {
      const { balance, allowance } = await UserData.getCredits();
      creditsMeta = `<p class="teacher-room-sub-meta">${balance} קרדיטים נותרו (מתוך ${allowance})</p>`;
    } catch {
      /* ignore */
    }

    const premium = window.PleyiPremium?.hasPremium?.();
    if (premium) {
      const until = formatPremiumDate(window.PleyiPremium?.getStatus?.()?.premiumUntil);
      teacherRoomSub.className = "teacher-room-sub is-premium";
      teacherRoomSub.innerHTML = `
        <div>
          <p class="teacher-room-sub-label">מצב מנוי</p>
          <p class="teacher-room-sub-title">פרימיום פעיל</p>
          ${until ? `<p class="teacher-room-sub-meta">בתוקף עד ${escapeHtml(until)}</p>` : ""}
          ${creditsMeta}
        </div>
        <a href="/premium" class="teacher-room-sub-action">ניהול מנוי</a>`;
      return;
    }

    try {
      teacherRoomSub.className = "teacher-room-sub";
      teacherRoomSub.innerHTML = `
        <div>
          <p class="teacher-room-sub-label">מצב מנוי</p>
          <p class="teacher-room-sub-title">תוכנית חינמית</p>
          ${creditsMeta || `<p class="teacher-room-sub-meta">${UserData.DEFAULT_CREDITS} קרדיטים ליצירת משחק עם AI</p>`}
        </div>
        <a href="/premium" class="teacher-room-sub-action">שדרוג לפרימיום</a>`;
    } catch {
      teacherRoomSub.className = "teacher-room-sub";
      teacherRoomSub.innerHTML = `
        <div>
          <p class="teacher-room-sub-label">מצב מנוי</p>
          <p class="teacher-room-sub-title">תוכנית חינמית</p>
        </div>
        <a href="/premium" class="teacher-room-sub-action">שדרוג לפרימיום</a>`;
    }
  }

  function renderTeacherGameRows(listEl, games, { showStar = true, showEdit = true, showDelete = true } = {}) {
    if (!listEl) return;
    if (!games.length) {
      listEl.innerHTML = '<p class="teacher-empty">אין פריטים להצגה כרגע.</p>';
      return;
    }

    listEl.innerHTML = games
      .map(
        (g) => `
      <article class="teacher-game-row${g.starred ? " is-starred" : ""}">
        ${
          showStar
            ? `<button type="button" class="teacher-game-star${g.starred ? " is-active" : ""}" data-star-saved="${g.id}" aria-label="${g.starred ? "הסר ממועדפים" : "הוסף למועדפים"}" aria-pressed="${g.starred ? "true" : "false"}">${g.starred ? "★" : "☆"}</button>`
            : ""
        }
        <div class="teacher-game-info">
          <h4 class="font-cartoon">${escapeHtml(g.title)}</h4>
          <p>${subjectLabel(g.subject)} · ${gameName(g.gameId)} · ${g.items?.length || 0} פריטים</p>
          <time>${UserData.formatDate(g.updatedAt || g.createdAt)}</time>
        </div>
        <div class="teacher-game-actions">
          <button type="button" class="teacher-btn teacher-btn-play" data-play-saved="${g.id}">שחק</button>
          ${showEdit ? `<button type="button" class="teacher-btn teacher-btn-ghost" data-edit-saved="${g.id}">ערוך</button>` : ""}
          ${showDelete ? `<button type="button" class="teacher-btn teacher-btn-ghost teacher-btn-danger" data-delete-saved="${g.id}" aria-label="מחק">🗑</button>` : ""}
        </div>
      </article>`
      )
      .join("");

    bindTeacherSavedGameActions(listEl, games, { showStar, showEdit, showDelete });
  }

  function bindTeacherSavedGameActions(listEl, games, { showStar, showEdit, showDelete }) {
    listEl.querySelectorAll("[data-play-saved]").forEach((btn) => {
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

    if (showEdit) {
      listEl.querySelectorAll("[data-edit-saved]").forEach((btn) => {
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
    }

    if (showStar) {
      listEl.querySelectorAll("[data-star-saved]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const res = await UserData.toggleSavedGameStar(btn.dataset.starSaved);
          if (!res.ok) {
            showToast(res.error || "לא ניתן לעדכן מועדפים");
            return;
          }
          await refreshLibrary();
        });
      });
    }

    if (showDelete) {
      listEl.querySelectorAll("[data-delete-saved]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          if (!confirm("למחוק את המשחק השמור?")) return;
          await UserData.deleteSavedGame(btn.dataset.deleteSaved);
          if (editingSavedId === btn.dataset.deleteSaved) editingSavedId = null;
          await refreshLibrary();
          showToast("המשחק נמחק");
        });
      });
    }
  }

  function renderTeacherHistory(entries) {
    if (!teacherRecentList) return;
    if (!entries.length) {
      teacherRecentList.innerHTML =
        '<p class="teacher-empty">עדיין אין היסטוריה. שחקו משחק — הניקוד יישמר כאן.</p>';
      return;
    }

    teacherRecentList.innerHTML = entries
      .map(
        (e) => `
      <article class="teacher-game-row">
        <div class="teacher-game-info">
          <h4 class="font-cartoon">${escapeHtml(e.gameTitle)}${e.isCustom ? " (מותאם)" : ""}</h4>
          <p>ניקוד: <strong>${e.score ?? 0}</strong>${e.reason ? ` · ${escapeHtml(e.reason)}` : ""}</p>
          <time>${UserData.formatDate(e.playedAt)}</time>
        </div>
        <div class="teacher-game-actions">
          <a href="/play/${e.gameId}" class="teacher-btn teacher-btn-ghost">שחק שוב</a>
        </div>
      </article>`
      )
      .join("");
  }

  function renderTeacherLessonPacks() {
    if (!teacherLessonsList) return;

    teacherLessonsList.innerHTML = FREE_LESSON_PACKS.map(
      (pack) => `
      <article class="teacher-lesson-card">
        <span class="teacher-lesson-icon" aria-hidden="true">${pack.icon}</span>
        <h4 class="font-cartoon">${escapeHtml(pack.title)}</h4>
        <p>${escapeHtml(pack.desc)}</p>
        <span class="teacher-lesson-meta">${escapeHtml(subjectLabel(pack.subject))} · ${lessonPackItems(pack).length} פריטים</span>
        <div class="teacher-lesson-actions">
          <button type="button" class="teacher-btn teacher-btn-play" data-lesson-use="${pack.id}">צור משחק</button>
          <button type="button" class="teacher-btn teacher-btn-ghost" data-lesson-play="${pack.id}">שחק</button>
        </div>
      </article>`
    ).join("");

    teacherLessonsList.querySelectorAll("[data-lesson-use]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const pack = FREE_LESSON_PACKS.find((p) => p.id === btn.dataset.lessonUse);
        if (!pack) return;
        editingSavedId = null;
        customSubject.value = pack.subject;
        customTitle.value = pack.title;
        customContent.value = lessonPackContent(pack);
        updateCustomGameOptions();
        customGamePick.value = pack.gameId;
        updatePreview();
        openCustomModal({ advanced: true });
        showToast("מערך שיעור נטען — ערכו ושמרו");
      });
    });

    teacherLessonsList.querySelectorAll("[data-lesson-play]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const pack = FREE_LESSON_PACKS.find((p) => p.id === btn.dataset.lessonPlay);
        if (!pack) return;
        window.GAME_CONTENT?.launchPlay?.({
          subject: pack.subject,
          gameId: pack.gameId,
          level: pack.level,
          topic: pack.topic,
          gameTitle: pack.title,
        });
      });
    });
  }

  async function renderTeacherRoom(saved, history, userOverride) {
    const user = userOverride || window.GameAuth?.getUser();
    if (!user) return;

    updateTeacherHeader(user);
    await renderTeacherSubscription();

    const favorites = saved.filter((g) => g.starred);
    if (teacherFavoritesCount) teacherFavoritesCount.textContent = String(favorites.length);
    if (teacherCreatedCount) teacherCreatedCount.textContent = String(saved.length);
    if (teacherRecentCount) teacherRecentCount.textContent = String(history.length);

    renderTeacherGameRows(teacherFavoritesList, favorites, { showStar: true, showEdit: true, showDelete: false });
    if (!favorites.length && teacherFavoritesList) {
      teacherFavoritesList.innerHTML =
        '<p class="teacher-empty">אין עדיין מועדפים. סמנו ★ במשחק שיצרתם.</p>';
    }

    if (!saved.length && teacherCreatedList) {
      teacherCreatedList.innerHTML =
        '<p class="teacher-empty">עדיין לא יצרתם משחקים. צרו משחק מותאם — הוא יישמר כאן.</p>';
    } else {
      renderTeacherGameRows(teacherCreatedList, saved);
    }

    renderTeacherHistory(history);
    renderTeacherLessonPacks();
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
      await renderTeacherRoom(saved, history);
    } catch (err) {
      console.error(err);
      if (teacherCreatedList) {
        teacherCreatedList.innerHTML =
          '<p class="teacher-empty">לא הצלחנו לטעון נתונים. ודאו ש-Firestore מוגדר.</p>';
      }
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
  }

  document.getElementById("navMyGamesLink")?.addEventListener("click", (e) => {
    e.preventDefault();
    window.GameAuth?._closeUserDropdown?.();
    scrollToMyGames();
  });

  document.getElementById("teacherRoomLogout")?.addEventListener("click", async () => {
    await window.GameAuth?.logout?.();
    showToast("התנתקת בהצלחה");
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

  if (window.location.hash === "#myGames" && (window.GameAuth?.getUser() || TEACHER_PREVIEW)) {
    scrollToMyGames();
  }

  window.addEventListener("hashchange", () => {
    if (window.location.hash === "#myGames" && (window.GameAuth?.getUser() || TEACHER_PREVIEW)) {
      scrollToMyGames();
    }
  });

  document.addEventListener("premium-updated", () => {
    renderGrid();
    updateCustomQuotaDisplay();
    if (window.GameAuth?.getUser() || TEACHER_PREVIEW) {
      refreshLibrary();
      renderTeacherSubscription();
      if (TEACHER_PREVIEW) showTeacherDesignPreview();
    }
  });

  document.addEventListener("credits-updated", () => {
    renderTeacherSubscription();
    updateCustomQuotaDisplay();
  });

  applyDisabledSubjects();
  renderSkillFilters();
  renderGrid();
  updateCustomGameOptions();
  updatePreview();
  refreshLibrary();
  if (!TEACHER_PREVIEW && window.GameAuth?.getUser()) resumePendingCreate();
  if (TEACHER_PREVIEW) showTeacherDesignPreview();

  if (sessionStorage.getItem("pleyi-open-custom") === "1") {
    sessionStorage.removeItem("pleyi-open-custom");
    openCustomModal();
  }

  const editRaw = sessionStorage.getItem("pleyi-edit-game");
  if (editRaw) {
    sessionStorage.removeItem("pleyi-edit-game");
    try {
      const game = JSON.parse(editRaw);
      editingSavedId = game.id;
      if (customTitle) customTitle.value = game.title || "";
      if (customSubject) customSubject.value = game.subject || activeSubject;
      if (customContent) customContent.value = game.content || "";
      updateCustomGameOptions();
      if (customGamePick && game.gameId) customGamePick.value = game.gameId;
      updatePreview();
      openCustomModal({ advanced: true });
      showToast("עריכת משחק — שמרו כדי לעדכן");
    } catch {
      /* ignore bad payload */
    }
  }
})();
