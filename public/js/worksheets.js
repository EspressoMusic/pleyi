/* Worksheets page — category filter (coloring / activity / reading) */

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const CATEGORY_LABELS = {
    coloring: "דפי צביעה",
    activity: "דפי פעילות",
    reading: "קטעי קריאה",
    sudoku: "סודוקו",
    crossword: "תשבץ",
    numberColoring: "צביעה עם מספרים",
    lineTracing: "שרטוט קווים",
  };

  function bindWorksheetFilters() {
    const filtersRoot = $("#worksheetFilters");
    const typeMenu = $("#filterTypeMenu");
    const typeValue = $("#filterTypeValue");
    const typeTrigger = $("#filterTypeTrigger");
    const tiles = $$(".svc-tile[data-category]");
    const empty = $("#worksheetEmptyState");
    if (!filtersRoot || !typeMenu || !tiles.length) return;

    let currentType = "coloring";
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

    function applyFilters() {
      let visible = 0;
      tiles.forEach((tile) => {
        const show = tile.dataset.category === currentType;
        tile.classList.toggle("hidden", !show);
        if (show) visible += 1;
      });
      empty?.classList.toggle("hidden", visible > 0);
    }

    typeTrigger?.addEventListener("click", (e) => {
      e.stopPropagation();
      const wrap = $('[data-filter-key="type"]', filtersRoot);
      openDropdownMenu(wrap, typeTrigger, typeMenu);
    });

    $$("button", typeMenu).forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        currentType = btn.dataset.type || "coloring";
        $$("button", typeMenu).forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        if (typeValue) typeValue.textContent = CATEGORY_LABELS[currentType] || btn.textContent;
        closeDropdown();
        applyFilters();
      });
    });

    document.addEventListener("click", closeDropdown);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeDropdown();
    });

    applyFilters();
  }

  document.addEventListener("DOMContentLoaded", bindWorksheetFilters);
})();
