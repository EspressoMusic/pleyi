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

  function getPrintArea() {
    let area = document.getElementById("svcPrintArea");
    if (!area) {
      area = document.createElement("div");
      area.id = "svcPrintArea";
      document.body.appendChild(area);
    }
    return area;
  }

  function printWorksheetImage(src, title) {
    const area = getPrintArea();
    area.innerHTML = "";
    const img = document.createElement("img");
    img.alt = title || "";

    const cleanup = () => {
      document.body.classList.remove("is-printing-tile");
      area.innerHTML = "";
      window.removeEventListener("afterprint", cleanup);
    };

    const startPrint = () => {
      img.removeEventListener("load", startPrint);
      window.addEventListener("afterprint", cleanup, { once: true });
      document.body.classList.add("is-printing-tile");
      window.print();
    };

    img.addEventListener("load", startPrint);
    area.appendChild(img);
    img.src = src;
    if (img.complete && img.naturalWidth > 0) startPrint();
  }

  function addPrintButtons() {
    $$(".svc-tile-image--turquoise").forEach((container) => {
      const downloadLink = $(".svc-tile-download", container);
      const img = $("img", container);
      if (!downloadLink || !img || downloadLink.parentElement.classList.contains("svc-tile-actions")) return;

      const actions = document.createElement("div");
      actions.className = "svc-tile-actions";
      downloadLink.replaceWith(actions);
      actions.appendChild(downloadLink);

      const printBtn = document.createElement("button");
      printBtn.type = "button";
      printBtn.className = "btn svc-tile-print btn-candy font-cartoon";
      printBtn.textContent = "הדפסה";
      printBtn.setAttribute("aria-label", `הדפסת ${img.alt || "דף"}`);
      printBtn.addEventListener("click", () => printWorksheetImage(img.src, img.alt));
      actions.appendChild(printBtn);
    });
  }

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

  function bindColoringZoom() {
    const boxes = $$(".svc-tile-image--turquoise");
    const backdrop = $("#coloringZoomBackdrop");
    if (!boxes.length || !backdrop) return;

    let active = null; // { box, article, homeRect }

    function setRect(el, rect) {
      el.style.top = rect.top + "px";
      el.style.left = rect.left + "px";
      el.style.width = rect.width + "px";
      el.style.height = rect.height + "px";
      el.style.transform = "none";
    }

    function closeZoom() {
      if (!active) return;
      const { box, article, homeRect } = active;
      active = null;
      backdrop.classList.remove("is-visible");
      setRect(box, homeRect);

      const cleanup = () => {
        box.classList.remove("is-zoomed");
        box.style.cssText = "";
        if (article) article.style.minHeight = "";
        box.removeEventListener("transitionend", cleanup);
      };
      box.addEventListener("transitionend", cleanup);
    }

    function openZoom(box) {
      if (active && active.box === box) return;
      if (active) closeZoom();

      const article = box.closest(".svc-tile");
      const rect = box.getBoundingClientRect();
      if (article) article.style.minHeight = rect.height + "px";

      setRect(box, rect);
      box.classList.add("is-zoomed");
      void box.offsetWidth; // force reflow so the start position is registered

      backdrop.classList.add("is-visible");

      requestAnimationFrame(() => {
        const size = Math.min(window.innerWidth * 0.88, window.innerHeight * 0.82, 560);
        box.style.top = "50%";
        box.style.left = "50%";
        box.style.width = size + "px";
        box.style.height = size + "px";
        box.style.transform = "translate(-50%, -50%)";
      });

      active = { box, article, homeRect: rect };
    }

    boxes.forEach((box) => {
      const img = $("img", box);
      img?.addEventListener("click", () => {
        if (active?.box === box) {
          closeZoom();
        } else {
          openZoom(box);
        }
      });
    });

    backdrop.addEventListener("click", closeZoom);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeZoom();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    addPrintButtons();
    bindWorksheetFilters();
    bindColoringZoom();
  });
})();
