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
})();
