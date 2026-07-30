/* Shared behavior for service landing pages */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function bindNavServices() {
  const btn = $("#navServicesBtn");
  const dropdown = $("#navServicesDropdown");
  if (!btn || !dropdown) return;

  const clearDesktopNavActive = () => {
    $$(".nav-links a.active").forEach((a) => a.classList.remove("active"));
  };

  const restoreDesktopNavActive = () => {
    window.dispatchEvent(new Event("scroll"));
  };

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = dropdown.classList.toggle("hidden") === false;
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) clearDesktopNavActive();
    else restoreDesktopNavActive();
  });

  document.addEventListener("click", () => {
    const wasOpen = !dropdown.classList.contains("hidden");
    dropdown.classList.add("hidden");
    btn.setAttribute("aria-expanded", "false");
    if (wasOpen) restoreDesktopNavActive();
  });

  dropdown.addEventListener("click", (e) => e.stopPropagation());
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
  const textarea = $("#svcMaterialInput");
  const fileInput = $("#svcMaterialFile");
  const fileBtn = $("#svcMaterialFileBtn");
  const fileName = $("#svcMaterialFileName");
  const box = $("#svcMaterialBox");
  const err = $("#svcCreateError");
  const gamePick = $("#svcGamePick");
  if (!textarea) return;

  window.CreateGameFlow?.populateGamePick(gamePick, "english");

  function updatePreview() {
    const items = window.CreateGameFlow?.parseItems(textarea.value, "english") || [];
    const gameId = window.CreateGameFlow?.resolveGameId(items, gamePick?.value || "auto", "english");
    window.CreateGameFlow?.updatePreview($("#svcPreview"), items, gameId);
  }

  async function loadFile(file) {
    if (!file) return;
    if (fileName) fileName.textContent = `טוען ${file.name}…`;
    try {
      textarea.value = await window.extractMaterialText(file);
      if (fileName) fileName.textContent = file.name;
      updatePreview();
    } catch (e) {
      if (err) {
        err.textContent = e.message || "לא ניתן לקרוא את הקובץ";
        err.classList.remove("hidden");
      }
    }
  }

  fileBtn?.addEventListener("click", () => fileInput?.click());
  fileInput?.addEventListener("change", () => loadFile(fileInput.files?.[0]));
  textarea.addEventListener("input", updatePreview);
  gamePick?.addEventListener("change", updatePreview);
  box?.addEventListener("dragover", (e) => {
    e.preventDefault();
    box.classList.add("is-dragover");
  });
  box?.addEventListener("dragleave", () => box.classList.remove("is-dragover"));
  box?.addEventListener("drop", (e) => {
    e.preventDefault();
    box.classList.remove("is-dragover");
    loadFile(e.dataTransfer?.files?.[0]);
  });

  const submit = async (e) => {
    e?.preventDefault();
    err?.classList.add("hidden");
    const btn = $("#svcCreateBtn");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "מעבד…";
    }

    try {
      let text = textarea.value || "";
      const ready = await window.CreateGameFlow.ensureContent(text, "english");
      if (!ready.ok) {
        if (err) {
          err.textContent = ready.error;
          err.classList.remove("hidden");
        }
        return;
      }

      text = ready.text;
      textarea.value = text;
      updatePreview();
      window.CreateGameFlow.launchGame({
        text,
        items: ready.items,
        subject: "english",
        gamePick: gamePick?.value || "auto",
        aiGameId: ready.aiGameId,
      });
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = "התחל משחק";
      }
    }
  };

  form?.addEventListener("submit", submit);
  updatePreview();
}

function syncNavClearance() {
  const nav = document.getElementById("navbar");
  if (!nav || !document.body.classList.contains("clean-site")) return;
  nav.style.setProperty("position", "fixed", "important");
  nav.style.setProperty("top", "0", "important");
  nav.style.setProperty("left", "0", "important");
  nav.style.setProperty("right", "0", "important");
  nav.style.setProperty("width", "100%", "important");
  nav.style.setProperty("z-index", "300", "important");
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
  hideLoader();
});
