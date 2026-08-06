/* Mobile navigation for hub / secondary pages */

(function () {
  const menuToggle = document.getElementById("menuToggle");
  const mobileNav = document.getElementById("mobileNav");
  if (!menuToggle || !mobileNav) return;

  const closeMenu = () => {
    menuToggle.classList.remove("open");
    mobileNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  };

  menuToggle.addEventListener("click", () => {
    const open = !mobileNav.classList.contains("open");
    menuToggle.classList.toggle("open", open);
    mobileNav.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.getElementById("mobileLoginBtn")?.addEventListener("click", () => {
    closeMenu();
    document.getElementById("authLoginBtn")?.click();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  const servicesBtn = document.getElementById("navServicesBtn");
  const servicesDropdown = document.getElementById("navServicesDropdown");
  const navbarEl = document.getElementById("navbar");
  if (servicesBtn && servicesDropdown) {
    const positionDropdown = () => {
      if (!navbarEl) return;
      const navRect = navbarEl.getBoundingClientRect();
      const btnRect = servicesBtn.getBoundingClientRect();
      servicesDropdown.style.left = `${btnRect.left + btnRect.width / 2 - navRect.left}px`;
    };

    servicesBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = servicesDropdown.classList.toggle("hidden") === false;
      servicesBtn.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) positionDropdown();
    });
    servicesDropdown.addEventListener("click", (e) => e.stopPropagation());
    document.addEventListener("click", () => {
      servicesDropdown.classList.add("hidden");
      servicesBtn.setAttribute("aria-expanded", "false");
    });
    window.addEventListener(
      "resize",
      () => {
        if (!servicesDropdown.classList.contains("hidden")) positionDropdown();
      },
      { passive: true }
    );
  }

  const mobileServicesBtn = document.getElementById("mobileServicesBtn");
  const mobileServicesPanel = document.getElementById("mobileServicesPanel");
  if (mobileServicesBtn && mobileServicesPanel) {
    mobileServicesBtn.addEventListener("click", () => {
      const open = mobileServicesPanel.classList.toggle("hidden") === false;
      mobileServicesBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
})();
