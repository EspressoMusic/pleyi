/* The "נראות" button in the footer: picks the site's look (colorful, or
   clean and professional — site-pro.css, set early on every page by
   theme.js), the home title's look (clean-site.css) and the mascot animal
   (site-fox.js). All are kept in this browser. */

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
  const SITE_STYLES = [
    { id: "colorful", name: "צבעוני", desc: "שמח ומשחקי" },
    { id: "pro", name: "מקצועי", desc: "נקי ורגוע" },
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

  // A tiny page drawn in each look: a title, two cards and a button.
  const SITE_PREVIEW =
    '<span class="site-style-preview" aria-hidden="true">' +
    '<span class="ssp-title"></span>' +
    '<span class="ssp-cards"><span class="ssp-card"></span><span class="ssp-card"></span></span>' +
    '<span class="ssp-btn"></span></span>';

  const CHECK = '<span class="look-check" aria-hidden="true"></span>';

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.querySelector(".logo-style-btn");
    const dialog = document.querySelector(".logo-style-dialog");
    if (!title || !btn || !dialog) return;
    const siteGrid = dialog.querySelector(".site-style-grid");
    const list = dialog.querySelector(".logo-style-list");
    const logoGroup = dialog.querySelector(".look-group--logo");
    const animalGrid = dialog.querySelector(".look-animal-grid");
    const fox = () => window.PleyiFox;

    siteGrid.innerHTML = SITE_STYLES.map(
      (s) =>
        `<button type="button" class="site-style-tile" data-id="${s.id}">` +
        SITE_PREVIEW.replace('class="site-style-preview"', `class="site-style-preview site-style-preview--${s.id}"`) +
        `<span class="site-style-text">${CHECK}<span class="site-style-name">${s.name}</span>` +
        `<span class="site-style-desc">${s.desc}</span></span></button>`
    ).join("");

    list.innerHTML = STYLES.map(
      (s) =>
        `<button type="button" class="logo-style-row" data-id="${s.id}">` +
        `${CHECK}<span class="logo-style-name">${s.name}</span>` +
        `<span class="logo-style-preview" data-logo-style="${s.id}" aria-hidden="true"></span></button>`
    ).join("");
    list.querySelectorAll(".logo-style-preview").forEach((el) => window.I18n.applyHeroSiteName(el));

    // The animals come from site-fox.js, which loads later (defer).
    function drawAnimals() {
      if (animalGrid.childElementCount || !fox()?.animals) return;
      animalGrid.innerHTML = fox()
        .animals.map(
          (a) =>
            `<button type="button" class="look-animal-tile" data-id="${a.id}">${CHECK}` +
            `<span class="look-animal-fig">${fox().draw(a.id)}</span>` +
            `<span class="look-animal-name">${a.name}</span></button>`
        )
        .join("");
    }

    const siteStyle = () => (window.PleyiTheme ? window.PleyiTheme.siteStyle() : "colorful");

    function markChosen() {
      siteGrid.querySelectorAll(".site-style-tile").forEach((tile) => {
        tile.setAttribute("aria-pressed", String(tile.dataset.id === siteStyle()));
      });
      list.querySelectorAll(".logo-style-row").forEach((row) => {
        row.setAttribute("aria-pressed", String(row.dataset.id === title.dataset.logoStyle));
      });
      animalGrid.querySelectorAll(".look-animal-tile").forEach((tile) => {
        tile.setAttribute("aria-pressed", String(tile.dataset.id === fox().animal()));
      });
      // The professional look has its own plain title, so the title looks are only for the colorful one.
      logoGroup.hidden = siteStyle() === "pro";
    }

    btn.addEventListener("click", () => {
      drawAnimals();
      markChosen();
      dialog.showModal();
    });

    // The site's look changes at once, the box included, so it stays open.
    siteGrid.addEventListener("click", (e) => {
      const tile = e.target.closest(".site-style-tile");
      if (!tile || !window.PleyiTheme) return;
      window.PleyiTheme.setSiteStyle(tile.dataset.id);
      markChosen();
    });

    // Picking a title look closes the picker and goes up to the title to see it big.
    list.addEventListener("click", (e) => {
      const row = e.target.closest(".logo-style-row");
      if (!row) return;
      title.dataset.logoStyle = row.dataset.id;
      save(row.dataset.id);
      markChosen();
      dialog.close();
      document.getElementById("home")?.scrollIntoView({ behavior: "smooth" });
    });

    // Picking an animal too: in the colorful look it sits on the title, in
    // the professional one only in the corner, where it already shows.
    animalGrid.addEventListener("click", (e) => {
      const tile = e.target.closest(".look-animal-tile");
      if (!tile) return;
      fox().setAnimal(tile.dataset.id);
      markChosen();
      dialog.close();
      if (siteStyle() !== "pro") document.getElementById("home")?.scrollIntoView({ behavior: "smooth" });
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
