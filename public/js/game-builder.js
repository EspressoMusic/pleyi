/* Game-builder page — ready-made games grid, filters, and custom-create toggle */

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const catalog = window.GAMES_CATALOG;
  const grid = $("#readyGamesGrid");
  const createBox = $("#svcCreateBox");
  if (!catalog || !grid) return;

  const GAME_TYPE_LABELS = {
    "tower-stack": "מגדל מילים",
    "vocabulary-duel": "טריוויה",
    "word-memory": "זיכרון",
    hangman: "איש תלוי",
    "spot-diff": "מצא את ההבדל",
    "sentence-scramble": "סדר משפט",
    "word-runner": "מרוץ מכשולים",
    "candy-match": "התאמת ממתקים",
    "word-shop": "חנות",
    "math-blitz": "ברק מהיר",
  };

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function enabledSubjects() {
    return (catalog.allSubjects?.() || []).filter((s) => (catalog[s] || []).length);
  }

  function allReadyGames() {
    const list = [];
    enabledSubjects().forEach((subject) => {
      (catalog[subject] || []).forEach((g) => list.push({ ...g, _subject: subject }));
    });
    return list;
  }

  function cardHtml(game) {
    const level = game.level || "medium";
    const subject = game._subject;
    const subjectLabel = catalog.subjects?.[subject] || subject;
    const levelLabel = catalog.levelLabel ? catalog.levelLabel(level) : level;
    const typeLabel = GAME_TYPE_LABELS[game.id] || game.title;
    const summary = catalog.gameSummary ? catalog.gameSummary(game.desc) : game.desc || "";
    return `
      <article class="svc-lesson-card" data-game-id="${game.id}" data-game-subject="${subject}" data-game-level="${level}" data-game-title="${escapeHtml(game.title)}">
        <div class="svc-lesson-preview">
          <button type="button" class="svc-lesson-info-toggle" data-info-subject="${escapeHtml(subjectLabel)}" data-info-type="${escapeHtml(typeLabel)}" data-info-level="${escapeHtml(levelLabel)}" data-info-desc="${escapeHtml(summary)}" aria-label="מידע נוסף">i</button>
          <span class="svc-game-preview-fallback" aria-hidden="true">
            <strong>${escapeHtml(game.title)}</strong>
            <span>${escapeHtml(subjectLabel)}</span>
          </span>
          <button type="button" class="btn btn-primary btn-candy font-cartoon svc-game-play-btn">שחק עכשיו</button>
        </div>
      </article>`;
  }

  function customTileHtml() {
    return `
      <button type="button" class="svc-lesson-card svc-custom-tile" id="toggleCustomCreateBtn" aria-expanded="false" aria-controls="svcCreateBox">
        <span class="svc-lesson-preview svc-custom-tile-preview"></span>
        <span class="svc-lesson-body svc-custom-tile-body">
          <span class="svc-custom-tile-title font-cartoon">ליצירת משחק אישי</span>
        </span>
      </button>`;
  }

  const state = { subject: "all", gameType: "all", level: "all" };

  function renderGrid() {
    const games = allReadyGames().filter((g) => {
      if (state.subject !== "all" && g._subject !== state.subject) return false;
      if (state.gameType !== "all" && g.id !== state.gameType) return false;
      if (state.level !== "all" && (g.level || "medium") !== state.level) return false;
      return true;
    });

    grid.innerHTML = games.map(cardHtml).join("") + customTileHtml();
    $("#readyGamesEmpty")?.classList.toggle("hidden", games.length > 0);
  }

  // --- Game info modal (title, subject, type, level, description — opened from the "i" toggle) ---
  const infoModal = $("#gameInfoModal");
  let infoModalCard = null;

  function launchGameFromCard(card) {
    if (!card || !window.GAME_CONTENT) return;
    const gameId = card.dataset.gameId;
    if (window.PleyiPremium?.ensurePremiumAccess && !window.PleyiPremium.ensurePremiumAccess(gameId)) return;
    window.GAME_CONTENT.launchPlay({
      subject: card.dataset.gameSubject,
      gameId,
      level: card.dataset.gameLevel,
      topic: "all",
      gameTitle: card.dataset.gameTitle,
    });
  }

  function closeInfoModal() {
    infoModal?.classList.add("hidden");
    infoModalCard = null;
  }

  function openInfoModal(btn) {
    const card = btn.closest("[data-game-id]");
    if (!infoModal || !card) return;
    infoModalCard = card;
    $("#gameInfoTitle", infoModal).textContent = card.dataset.gameTitle || "";
    $("#gameInfoSubject", infoModal).textContent = btn.dataset.infoSubject || "";
    $("#gameInfoType", infoModal).textContent = btn.dataset.infoType || "";
    $("#gameInfoLevel", infoModal).textContent = btn.dataset.infoLevel || "";
    $("#gameInfoSummary", infoModal).textContent = btn.dataset.infoDesc || "";
    infoModal.classList.remove("hidden");
  }

  infoModal?.addEventListener("click", (e) => {
    if (e.target === infoModal) closeInfoModal();
  });
  $("#gameInfoClose")?.addEventListener("click", closeInfoModal);
  $("#gameInfoPlayBtn")?.addEventListener("click", () => {
    const card = infoModalCard;
    closeInfoModal();
    launchGameFromCard(card);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !infoModal?.classList.contains("hidden")) closeInfoModal();
  });

  // --- Grid clicks (play, info, custom-create tile) ---
  grid.addEventListener("click", (e) => {
    const infoBtn = e.target.closest(".svc-lesson-info-toggle");
    if (infoBtn) {
      e.stopPropagation();
      openInfoModal(infoBtn);
      return;
    }

    const customTile = e.target.closest("#toggleCustomCreateBtn");
    if (customTile) {
      const open = createBox?.classList.toggle("hidden") === false;
      customTile.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) createBox?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const playBtn = e.target.closest(".svc-game-play-btn");
    if (playBtn) launchGameFromCard(playBtn.closest("[data-game-id]"));
  });

  // --- Filter dropdowns (same interaction pattern as ready-lessons.js) ---
  let openDropdown = null;

  function closeDropdown() {
    if (!openDropdown) return;
    openDropdown.menu.classList.add("hidden");
    openDropdown.trigger.setAttribute("aria-expanded", "false");
    openDropdown.wrap.classList.remove("is-open");
    openDropdown = null;
  }

  function openDropdownMenu(wrap, trigger, menu) {
    if (openDropdown?.wrap === wrap) {
      closeDropdown();
      return;
    }
    closeDropdown();
    menu.classList.remove("hidden");
    trigger.setAttribute("aria-expanded", "true");
    wrap.classList.add("is-open");
    openDropdown = { wrap, trigger, menu };
  }

  function buildMenu(menuEl, valueEl, options, key) {
    if (!menuEl) return;
    menuEl.innerHTML = options
      .map(
        (o) =>
          `<li><button type="button" data-value="${escapeHtml(o.id)}" class="${state[key] === o.id ? "active" : ""}">${escapeHtml(o.label)}</button></li>`
      )
      .join("");

    menuEl.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        state[key] = btn.dataset.value;
        menuEl.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b === btn));
        if (valueEl) valueEl.textContent = btn.textContent;
        closeDropdown();
        if (key === "subject") buildGameTypeMenu();
        renderGrid();
      });
    });
  }

  function buildSubjectMenu() {
    const options = [
      { id: "all", label: "הכל" },
      ...enabledSubjects().map((s) => ({ id: s, label: catalog.subjects?.[s] || s })),
    ];
    buildMenu($("#filterGameSubjectMenu"), $("#filterGameSubjectValue"), options, "subject");
  }

  function buildGameTypeMenu() {
    const ids = new Set();
    enabledSubjects().forEach((s) => {
      if (state.subject !== "all" && state.subject !== s) return;
      (catalog[s] || []).forEach((g) => ids.add(g.id));
    });
    if (!ids.has(state.gameType)) state.gameType = "all";
    const options = [{ id: "all", label: "הכל" }, ...[...ids].map((id) => ({ id, label: GAME_TYPE_LABELS[id] || id }))];
    buildMenu($("#filterGameTypeMenu"), $("#filterGameTypeValue"), options, "gameType");
  }

  function buildLevelMenu() {
    const options = [
      { id: "all", label: "הכל" },
      ...Object.entries(catalog.levels || {}).map(([id, label]) => ({ id, label })),
    ];
    buildMenu($("#filterGameLevelMenu"), $("#filterGameLevelValue"), options, "level");
  }

  function bindTrigger(wrapSel, triggerSel, menuSel) {
    const wrap = $(wrapSel);
    const trigger = $(triggerSel);
    const menu = $(menuSel);
    if (!wrap || !trigger || !menu) return;
    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      openDropdownMenu(wrap, trigger, menu);
    });
    menu.addEventListener("click", (e) => e.stopPropagation());
  }

  bindTrigger('[data-filter-key="subject"]', "#filterGameSubjectTrigger", "#filterGameSubjectMenu");
  bindTrigger('[data-filter-key="gameType"]', "#filterGameTypeTrigger", "#filterGameTypeMenu");
  bindTrigger('[data-filter-key="level"]', "#filterGameLevelTrigger", "#filterGameLevelMenu");

  document.addEventListener("click", closeDropdown);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDropdown();
  });

  buildSubjectMenu();
  buildGameTypeMenu();
  buildLevelMenu();
  renderGrid();
})();
