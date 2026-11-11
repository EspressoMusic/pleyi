/* Home title look — the "נראות" button in the footer picks a style for the
   site name (the looks are in clean-site.css), kept in this browser. */

(function () {
  const KEY = "pleyi-logo-style";
  const STYLES = [
    { id: "round", name: "עגול וחמוד" },
    { id: "comic", name: "קומיקס מצויר" },
    { id: "kid", name: "כתב יד של ילד" },
    { id: "blocks", name: "תלת־ממד" },
    { id: "sticker", name: "מדבקה" },
    { id: "shiny", name: "מבריק" },
    { id: "tilt", name: "שובב" },
  ];

  function stored() {
    try {
      const id = localStorage.getItem(KEY);
      return STYLES.some((s) => s.id === id) ? id : STYLES[0].id;
    } catch {
      return STYLES[0].id;
    }
  }

  function save(id) {
    try {
      localStorage.setItem(KEY, id);
    } catch {
      /* ignore */
    }
  }

  // Right away (this script comes after the title), so the old look never shows.
  const title = document.querySelector("#home .hero-site-name");
  if (title) title.dataset.logoStyle = stored();

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.querySelector(".logo-style-btn");
    const dialog = document.querySelector(".logo-style-dialog");
    if (!title || !btn || !dialog) return;
    const grid = dialog.querySelector(".logo-style-grid");

    grid.innerHTML = STYLES.map(
      (s) =>
        `<button type="button" class="logo-style-tile" data-id="${s.id}">` +
        `<span class="logo-style-preview" data-logo-style="${s.id}" aria-hidden="true"></span>` +
        `<span class="logo-style-name">${s.name}</span></button>`
    ).join("");
    grid.querySelectorAll(".logo-style-preview").forEach((el) => window.I18n.applyHeroSiteName(el));

    function markChosen() {
      grid.querySelectorAll(".logo-style-tile").forEach((tile) => {
        tile.setAttribute("aria-pressed", String(tile.dataset.id === title.dataset.logoStyle));
      });
    }

    btn.addEventListener("click", () => {
      markChosen();
      dialog.showModal();
    });

    // Picking a look closes the picker and goes up to the title to see it big.
    grid.addEventListener("click", (e) => {
      const tile = e.target.closest(".logo-style-tile");
      if (!tile) return;
      title.dataset.logoStyle = tile.dataset.id;
      save(tile.dataset.id);
      markChosen();
      dialog.close();
      document.getElementById("home")?.scrollIntoView({ behavior: "smooth" });
    });

    dialog.querySelector(".news-zoom-close").addEventListener("click", () => dialog.close());
    // A click on the dark backdrop around the box closes it.
    dialog.addEventListener("click", (e) => {
      if (e.target !== dialog) return;
      const r = dialog.getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (!inside) dialog.close();
    });
  });
})();
