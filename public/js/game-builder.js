/* Game-builder page — ready-made games grid, filters, and custom-create toggle */

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const catalog = window.GAMES_CATALOG;
  const grid = $("#readyGamesGrid");
  if (!catalog || !grid) return;

  const PREVIEW_COLORS = ["teal", "yellow", "pink", "orange"];

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

  const GAME_TYPE_ICONS = {
    "tower-stack": "🗼",
    "vocabulary-duel": "⚔️",
    "word-memory": "🧠",
    hangman: "🎯",
    "spot-diff": "🔍",
    "sentence-scramble": "📝",
    "word-runner": "🏃",
    "candy-match": "🍬",
    "word-shop": "🛒",
    "math-blitz": "⚡",
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

  function cardHtml(game, index) {
    const color = PREVIEW_COLORS[index % PREVIEW_COLORS.length];
    const level = game.level || "medium";
    const summary = catalog.gameSummary ? catalog.gameSummary(game.desc) : game.desc || "";
    return `
      <article class="svc-lesson-card" data-game-id="${game.id}" data-game-subject="${game._subject}" data-game-level="${level}" data-game-title="${escapeHtml(game.title)}">
        <div class="svc-lesson-preview svc-lesson-preview--${color}">${game.icon || "🎮"}</div>
        <div class="svc-lesson-body">
          <h3>${escapeHtml(game.title)}</h3>
          <ul class="svc-lesson-meta">
            <li>${escapeHtml(catalog.subjects?.[game._subject] || game._subject)}</li>
            <li>${escapeHtml(catalog.levelLabel ? catalog.levelLabel(level) : level)}</li>
          </ul>
          <p>${escapeHtml(summary)}</p>
          <button type="button" class="btn btn-primary btn-candy font-cartoon svc-game-play-btn">שחק עכשיו</button>
        </div>
      </article>`;
  }

  const state = { subject: "all", gameType: "all", level: "all" };

  function renderGrid() {
    const games = allReadyGames().filter((g) => {
      if (state.subject !== "all" && g._subject !== state.subject) return false;
      if (state.gameType !== "all" && g.id !== state.gameType) return false;
      if (state.level !== "all" && (g.level || "medium") !== state.level) return false;
      return true;
    });

    grid.innerHTML = games.map(cardHtml).join("");
    $("#readyGamesEmpty")?.classList.toggle("hidden", games.length > 0);

    grid.querySelectorAll(".svc-game-play-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const card = btn.closest("[data-game-id]");
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
      });
    });
  }

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

  // --- Custom-create toggle ---
  const toggleBtn = $("#toggleCustomCreateBtn");
  const createBox = $("#svcCreateBox");
  toggleBtn?.addEventListener("click", () => {
    const open = createBox?.classList.toggle("hidden") === false;
    toggleBtn.setAttribute("aria-expanded", open ? "true" : "false");
    toggleBtn.classList.toggle("is-open", open);
    if (open) createBox?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
})();
