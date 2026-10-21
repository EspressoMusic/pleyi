/* Shared behavior for service landing pages */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function bindNavServices() {
  const btn = $("#navServicesBtn");
  const dropdown = $("#navServicesDropdown");
  if (!btn || !dropdown) return;

  const navbarEl = document.getElementById("navbar");

  const positionDropdown = () => {
    if (!navbarEl) return;
    const navRect = navbarEl.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    dropdown.style.left = `${btnRect.left + btnRect.width / 2 - navRect.left}px`;
  };

  const clearDesktopNavActive = () => {
    $$(".nav-links a.active").forEach((a) => a.classList.remove("active"));
  };

  const restoreDesktopNavActive = () => {
    window.dispatchEvent(new Event("scroll"));
  };

  let closeTimer = null;

  const openDropdown = () => {
    clearTimeout(closeTimer);
    positionDropdown();
    clearDesktopNavActive();
    dropdown.classList.remove("hidden");
    requestAnimationFrame(() => dropdown.classList.add("open"));
    btn.setAttribute("aria-expanded", "true");
  };

  const closeDropdown = () => {
    if (dropdown.classList.contains("hidden")) return;
    const wasOpen = dropdown.classList.contains("open");
    dropdown.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => dropdown.classList.add("hidden"), 240);
    if (wasOpen) restoreDesktopNavActive();
  };

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (dropdown.classList.contains("open")) closeDropdown();
    else openDropdown();
  });

  window.addEventListener(
    "resize",
    () => {
      if (dropdown.classList.contains("open")) positionDropdown();
    },
    { passive: true }
  );

  document.addEventListener("click", () => closeDropdown());

  dropdown.addEventListener("click", (e) => e.stopPropagation());

  dropdown.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => closeDropdown());
  });
}

function bindMobileMenu() {
  $("#menuToggle")?.addEventListener("click", () => {
    $("#menuToggle")?.classList.toggle("open");
    $("#mobileNav")?.classList.toggle("open");
    if (!$("#mobileNav")?.classList.contains("open")) {
      const wasOpen = !$("#mobileServicesPanel")?.classList.contains("hidden");
      $("#mobileServicesPanel")?.classList.add("hidden");
      $("#mobileServicesBtn")?.setAttribute("aria-expanded", "false");
      if (wasOpen) window.dispatchEvent(new Event("scroll"));
    }
  });
  $$("#mobileNav > a").forEach((a) => {
    a.addEventListener("click", () => {
      $("#menuToggle")?.classList.remove("open");
      $("#mobileNav")?.classList.remove("open");
      $("#mobileServicesPanel")?.classList.add("hidden");
      $("#mobileServicesBtn")?.setAttribute("aria-expanded", "false");
    });
  });
}

function bindMobileNavServices() {
  const btn = $("#mobileServicesBtn");
  const panel = $("#mobileServicesPanel");
  if (!btn || !panel) return;

  const clearMobileNavActive = () => {
    $$("#mobileNav a.active").forEach((a) => a.classList.remove("active"));
  };

  const restoreMobileNavActive = () => {
    window.dispatchEvent(new Event("scroll"));
  };

  btn.addEventListener("click", () => {
    const open = panel.classList.toggle("hidden") === false;
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) clearMobileNavActive();
    else restoreMobileNavActive();
  });

  panel.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      panel.classList.add("hidden");
      btn.setAttribute("aria-expanded", "false");
      $("#menuToggle")?.classList.remove("open");
      $("#mobileNav")?.classList.remove("open");
    });
  });
}

function bindScrollProgress() {
  const bar = $("#scrollProgress");
  if (!bar) return;
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    bar.style.width = `${pct}%`;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

function hideLoader() {
  const loader = $("#loader");
  if (!loader) return;
  loader.classList.add("hidden");
}

function bindCategoryTabs() {
  const buttons = $$(".svc-category-btn[data-category]");
  const panels = $$(".svc-panel");
  if (!buttons.length || !panels.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.category;
      buttons.forEach((b) => b.classList.toggle("active", b === btn));
      panels.forEach((p) => p.classList.toggle("hidden", p.dataset.category !== target));
    });
  });
}

function bindCreateGameForm() {
  const form = $("#svcCreateForm");
  const stepPick = $("#svcCreateStepPick");
  const stepContent = $("#svcCreateStepContent");
  const pickGrid = $("#svcGamePickGrid");
  const textarea = $("#svcMaterialInput");
  const fieldRows = $("#svcFieldRows");
  const addRowBtn = $("#svcFieldAddBtn");
  const err = $("#svcCreateError");
  const gamePickInput = $("#svcGamePick");
  const selectedLabel = $("#svcSelectedGameLabel");
  const contentHint = $("#svcContentHint");
  const backBtn = $("#svcCreateBack");
  if (!pickGrid) return;
  const pairCountBox = $("#svcPairCount");
  const pairCountBtns = $$(".svc-pair-count-btn", pairCountBox);

  let selectedGameId = "";
  let selectedPairCount = 6;

  pairCountBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedPairCount = Number(btn.dataset.pairs) || 6;
      pairCountBtns.forEach((b) => b.classList.toggle("is-selected", b === btn));
    });
  });

  // The word/translation columns are explicit, labeled inputs, not pasted free
  // text — so items are built straight from row values instead of routing
  // through the free-text parser's English/Hebrew script-detection heuristics,
  // which would silently drop valid rows (e.g. two Hebrew synonyms, an English
  // word paired with an English synonym, or numbers) that don't fit the guess.
  function collectFieldItems() {
    const items = [];
    const seen = new Set();
    $$(".svc-field-row", fieldRows).forEach((row) => {
      const left = row.querySelector(".svc-field-left")?.value.trim() || "";
      const right = row.querySelector(".svc-field-right")?.value.trim() || "";
      if (!left || !right) return;
      const key = `${left}\0${right}`;
      if (seen.has(key)) return;
      seen.add(key);
      items.push({
        en: left,
        he: right,
        hint: window.LEARNING_PARSE?.itemHint?.(left, "english") || `What is ${left}?`,
        emoji: window.LEARNING_PARSE?.itemEmoji?.("english") || "📖",
      });
    });
    return items;
  }

  function updatePreview() {
    window.CreateGameFlow?.updatePreview($("#svcPreview"), collectFieldItems(), selectedGameId);
  }

  function addFieldRow(leftVal = "", rightVal = "") {
    if (!fieldRows) return null;
    const fields = (window.CreateGameFlow?.gameRules(selectedGameId) || {}).fields || {
      leftPh: "מילה",
      rightPh: "תרגום",
    };
    const row = document.createElement("div");
    row.className = "svc-field-row";
    row.innerHTML = `
      <input type="text" class="svc-field-left" placeholder="${escapeHtml(fields.leftPh || "")}" dir="ltr" value="${escapeHtml(leftVal)}" />
      <span class="svc-field-row-arrow" aria-hidden="true">=</span>
      <input type="text" class="svc-field-right" placeholder="${escapeHtml(fields.rightPh || "")}" dir="rtl" value="${escapeHtml(rightVal)}" />
      <button type="button" class="svc-field-remove" aria-label="הסרת שורה">
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>
      </button>
    `;
    row.querySelector(".svc-field-left")?.addEventListener("input", updatePreview);
    row.querySelector(".svc-field-right")?.addEventListener("input", updatePreview);
    row.querySelector(".svc-field-remove")?.addEventListener("click", () => {
      row.remove();
      updatePreview();
    });
    fieldRows.appendChild(row);
    return row;
  }

  function renderFieldRows(gameId, prefillItems) {
    if (!fieldRows) return;
    fieldRows.innerHTML = "";
    const rules = window.CreateGameFlow?.gameRules(gameId);
    if (prefillItems && prefillItems.length) {
      prefillItems.forEach((it) => addFieldRow(it.en, it.he));
    } else {
      const startCount = Math.max(rules?.minItems || 2, 3);
      for (let i = 0; i < startCount; i++) addFieldRow();
    }
  }

  addRowBtn?.addEventListener("click", () => {
    addFieldRow();
    const rows = $$(".svc-field-row", fieldRows);
    rows[rows.length - 1]?.querySelector(".svc-field-left")?.focus();
  });

  function showStepContent(gameId) {
    selectedGameId = gameId;
    if (gamePickInput) gamePickInput.value = gameId;
    const rules = window.CreateGameFlow?.gameRules(gameId);
    if (selectedLabel) {
      selectedLabel.textContent = window.CreateGameFlow?.gameTitle(gameId) || gameId;
    }
    if (contentHint) {
      contentHint.textContent = rules?.hint || "מלאו תוכן לימודי או העלו קובץ.";
    }
    pairCountBox?.classList.toggle("hidden", gameId !== "word-memory");
    stepPick?.classList.add("hidden");
    stepContent?.classList.remove("hidden");
    err?.classList.add("hidden");
    renderFieldRows(gameId);
    updatePreview();
    setTimeout(() => $(".svc-field-left", fieldRows)?.focus(), 120);
  }

  function showStepPick() {
    selectedGameId = "";
    if (gamePickInput) gamePickInput.value = "";
    stepContent?.classList.add("hidden");
    stepPick?.classList.remove("hidden");
    err?.classList.add("hidden");
  }

  window.CreateGameFlow?.renderGamePicker(pickGrid, "english", "", (gameId) => {
    showStepContent(gameId);
  });

  backBtn?.addEventListener("click", showStepPick);

  const submit = async (e) => {
    e?.preventDefault();
    err?.classList.add("hidden");

    if (!selectedGameId) {
      if (err) {
        err.textContent = "בחרו סוג משחק לפני ההעלאה";
        err.classList.remove("hidden");
      }
      showStepPick();
      return;
    }

    const btn = $("#svcCreateBtn");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "מעבד…";
    }

    try {
      const items = collectFieldItems();
      if (!items.length) {
        if (err) {
          err.textContent = "מלאו לפחות שורה אחת עם מילה ותרגום";
          err.classList.remove("hidden");
        }
        return;
      }

      const valid = window.CreateGameFlow.validateItemsForGame(selectedGameId, items);
      if (!valid.ok) {
        if (err) {
          err.textContent = valid.error;
          err.classList.remove("hidden");
        }
        return;
      }

      const text = window.LEARNING_PARSE?.formatLearningContent
        ? window.LEARNING_PARSE.formatLearningContent(items)
        : items.map((it) => `${it.en}=${it.he}`).join("\n");
      if (textarea) textarea.value = text;
      updatePreview();

      if (selectedGameId === "word-memory") {
        sessionStorage.setItem("gameclass-custom-pair-count", String(selectedPairCount));
      } else {
        sessionStorage.removeItem("gameclass-custom-pair-count");
      }

      const saved = await window.CreateGameFlow.persistCreatedGame({
        subject: "english",
        gameId: selectedGameId,
        items,
        content: text,
      });
      if (!saved.ok && saved.quotaMessage) {
        showToast(saved.quotaMessage);
      }

      window.CreateGameFlow.launchGame({
        text,
        items,
        subject: "english",
        gamePick: selectedGameId,
      });
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = "התחל משחק";
      }
    }
  };

  form?.addEventListener("submit", submit);
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function bindMyGamesSection() {
  const section = $("#svcMyGames");
  const list = $("#svcMyGamesList");
  const loginBtn = $("#svcMyGamesLoginBtn");
  if (!section || !list) return;

  function render(user) {
    if (user) {
      section.classList.add("hidden");
      return;
    }
    const games = window.CreateGameFlow?.getLocalGames() || [];
    if (!games.length) {
      section.classList.add("hidden");
      return;
    }
    list.innerHTML = games
      .map(
        (g) => `
        <div class="svc-my-games-row">
          <span class="svc-my-games-row-title">${escapeHtml(g.title)}</span>
          <button type="button" class="btn btn-outline btn-candy btn-sm svc-my-games-play" data-play="${escapeHtml(g.id)}">${window.I18n?.lang === "en" ? "Open" : "פתח"}</button>
        </div>`
      )
      .join("");
    section.classList.remove("hidden");

    list.querySelectorAll("[data-play]").forEach((playBtn) => {
      playBtn.addEventListener("click", () => {
        const game = games.find((g) => g.id === playBtn.dataset.play);
        if (!game) return;
        window.CreateGameFlow?.launchGame({
          text: "",
          items: game.items,
          subject: game.subject,
          gamePick: game.gameId,
        });
      });
    });
  }

  loginBtn?.addEventListener("click", () => {
    window.GameAuth?.openLoginModal(window.location.pathname + window.location.search);
  });

  window.GameAuth?.onUserChange((user) => render(user));
}

function syncNavClearance() {
  const nav = document.getElementById("navbar");
  if (!nav || !document.body.classList.contains("clean-site")) return;
  document.body.style.setProperty("--clean-nav-clear", `${nav.offsetHeight}px`);
}

function bindNavbarScroll() {
  const nav = document.getElementById("navbar");
  if (!nav) return;
  const onScroll = () => {
    nav.classList.toggle("scrolled", window.scrollY > 50);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.remove("hidden");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.add("hidden"), 3200);
}

function bindAuth() {
  if (!document.getElementById("authLoginBtn")) return;
  window.GameAuth?.bindModals(showToast);
  document.getElementById("mobileLoginBtn")?.addEventListener("click", () => {
    $("#menuToggle")?.classList.remove("open");
    $("#mobileNav")?.classList.remove("open");
    window.GameAuth?.openLoginModal(window.location.pathname + window.location.search);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  syncNavClearance();
  window.addEventListener("resize", syncNavClearance, { passive: true });
  bindNavServices();
  bindMobileMenu();
  bindMobileNavServices();
  bindNavbarScroll();
  bindAuth();
  bindScrollProgress();
  bindCategoryTabs();
  bindCreateGameForm();
  bindMyGamesSection();
  hideLoader();
});
