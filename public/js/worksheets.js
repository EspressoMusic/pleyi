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
    let backdrop = $("#coloringZoomBackdrop");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.id = "coloringZoomBackdrop";
      backdrop.className = "coloring-zoom-backdrop";
      backdrop.setAttribute("aria-hidden", "true");
      document.body.appendChild(backdrop);
    }

    const images = $$(".svc-tile-image--turquoise img");
    if (!images.length) return;

    let active = null;

    function rectFromDomRect(r) {
      return { top: r.top, left: r.left, width: r.width, height: r.height };
    }

    function applyRect(el, rect) {
      el.style.transform = "none";
      el.style.right = "auto";
      el.style.bottom = "auto";
      el.style.top = `${rect.top}px`;
      el.style.left = `${rect.left}px`;
      el.style.width = `${rect.width}px`;
      el.style.height = `${rect.height}px`;
    }

    const ZOOM_MAX_WIDTH = 580;

    function endRectFromStart(startRect) {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const pad = 16;
      const maxW = Math.min(vw * 0.88, ZOOM_MAX_WIDTH);
      const maxH = vh * 0.82;
      const scale = Math.min(maxW / startRect.width, maxH / startRect.height);
      const width = startRect.width * scale;
      const height = startRect.height * scale;
      return {
        top: Math.max(pad, (vh - height) / 2),
        left: Math.max(pad, (vw - width) / 2),
        width,
        height,
      };
    }

    function teardownFlyout(flyout, container) {
      flyout.remove();
      container?.classList.remove("is-zoom-source-hidden");
    }

    function closeZoom(animate = true) {
      if (!active) return;
      const { flyout, container, startRect } = active;
      active = null;

      backdrop.classList.remove("is-visible");
      backdrop.setAttribute("aria-hidden", "true");
      document.body.classList.remove("coloring-zoom-open");

      if (!animate) {
        teardownFlyout(flyout, container);
        return;
      }

      flyout.classList.remove("is-zoomed");
      applyRect(flyout, startRect);

      let finished = false;
      const finish = (e) => {
        if (finished || (e && e.target !== flyout)) return;
        finished = true;
        flyout.removeEventListener("transitionend", finish);
        teardownFlyout(flyout, container);
      };
      flyout.addEventListener("transitionend", finish);
      window.setTimeout(finish, 450);
    }

    function openZoom(img) {
      if (active?.img === img) {
        closeZoom();
        return;
      }
      if (active) closeZoom(false);

      const container = img.closest(".svc-tile-image--turquoise");
      if (!container) return;

      const startRect = rectFromDomRect(container.getBoundingClientRect());
      const endRect = endRectFromStart(startRect);

      const flyout = document.createElement("div");
      flyout.className = "coloring-zoom-flyout";
      flyout.setAttribute("role", "dialog");
      flyout.setAttribute("aria-modal", "true");
      flyout.setAttribute("aria-label", img.alt || "תצוגה מוגדלת");

      const downloadLink = $(".svc-tile-download", container);

      const inner = document.createElement("div");
      inner.className =
        "coloring-zoom-flyout-inner svc-tile-image svc-tile-image--turquoise";

      const frame = document.createElement("div");
      frame.className = "coloring-zoom-flyout-frame";

      const clone = img.cloneNode(true);
      clone.removeAttribute("loading");

      const actions = document.createElement("div");
      actions.className = "coloring-zoom-actions svc-tile-actions";

      const download = document.createElement("a");
      download.className = "btn svc-tile-download btn-candy font-cartoon";
      download.textContent = "להורדה";
      if (downloadLink) {
        download.href = downloadLink.href;
        download.download = downloadLink.download || "";
      } else {
        download.href = img.src;
        download.download = "";
      }

      const printBtn = document.createElement("button");
      printBtn.type = "button";
      printBtn.className = "btn svc-tile-print btn-candy font-cartoon";
      printBtn.textContent = "הדפסה";
      printBtn.setAttribute("aria-label", `הדפסת ${img.alt || "דף"}`);
      printBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        printWorksheetImage(img.src, img.alt);
      });

      actions.appendChild(download);
      actions.appendChild(printBtn);

      const closeBtn = document.createElement("button");
      closeBtn.type = "button";
      closeBtn.className = "coloring-zoom-close";
      closeBtn.setAttribute("aria-label", "סגירה");
      closeBtn.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/></svg>';
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        closeZoom();
      });

      frame.appendChild(clone);
      inner.appendChild(frame);
      inner.appendChild(actions);
      flyout.appendChild(inner);
      flyout.appendChild(closeBtn);
      document.body.appendChild(flyout);

      applyRect(flyout, startRect);
      container.classList.add("is-zoom-source-hidden");

      void flyout.offsetWidth;

      backdrop.classList.add("is-visible");
      backdrop.setAttribute("aria-hidden", "false");
      document.body.classList.add("coloring-zoom-open");

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          flyout.classList.add("is-zoomed");
          applyRect(flyout, endRect);
        });
      });

      active = { flyout, img, container, startRect };
      closeBtn.focus();
    }

    images.forEach((img) => {
      img.addEventListener("click", (e) => {
        e.stopPropagation();
        openZoom(img);
      });
    });

    backdrop.addEventListener("click", () => closeZoom());
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && active) closeZoom();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    addPrintButtons();
    bindWorksheetFilters();
    bindColoringZoom();
  });
})();
