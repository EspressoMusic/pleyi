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
  const buttons = $$(".svc-category-btn");
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

const LESSON_SLIDES = {
  animals: [
    { title: "Animals in English", body: "שיעור מוכן לכיתות א–ג · 45 דקות" },
    { title: "New words", body: "cat — חתול\n dog — כלב\n bird — ציפור\n fish — דג" },
    { title: "Let's play!", body: "משחק זיכרון + דף צביעה — הכל מוכן לשיעור" },
  ],
  colors: [
    { title: "Colors & Shapes", body: "שיעור מוכן לכיתות א–ד · 40 דקות" },
    { title: "Colors", body: "red — אדום\n blue — כחול\n green — ירוק\n yellow — צהוב" },
    { title: "Shapes", body: "circle — עיגול\n square — ריבוע\n triangle — משולש" },
  ],
  family: [
    { title: "My Family", body: "שיעור מוכן לכיתות ב–ד · 45 דקות" },
    { title: "Family words", body: "mother — אמא\n father — אבא\n sister — אחות\n brother — אח" },
    { title: "Activity", body: "דף עבודה + משחק התאמה — מוכן להצגה על הלוח" },
  ],
  food: [
    { title: "Food & Drinks", body: "שיעור מוכן לכיתות ג–ה · 45 דקות" },
    { title: "Vocabulary", body: "apple — תפוח\n water — מים\n bread — לחם\n milk — חלב" },
    { title: "Wrap up", body: "חימום, תרגול ומשחק סיום — מערך מלא כמו מצגת" },
  ],
};

function bindLessonPreview() {
  const modal = $("#lessonPreviewModal");
  const titleEl = $("#lessonPreviewTitle");
  const slideTitle = $("#lessonSlideTitle");
  const slideBody = $("#lessonSlideBody");
  const dotsWrap = $("#lessonSlideDots");
  const prevBtn = $("#lessonSlidePrev");
  const nextBtn = $("#lessonSlideNext");
  if (!modal || !slideTitle || !slideBody) return;

  let slides = [];
  let index = 0;

  function renderSlide() {
    const slide = slides[index];
    if (!slide) return;
    slideTitle.textContent = slide.title;
    slideBody.textContent = slide.body;
    if (titleEl) titleEl.textContent = slide.title;
    $$(".svc-slide-dot").forEach((dot, i) => dot.classList.toggle("active", i === index));
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === slides.length - 1;
  }

  function openPreview(lessonId, lessonName) {
    slides = LESSON_SLIDES[lessonId] || [];
    index = 0;
    if (titleEl) titleEl.textContent = lessonName || "";
    if (dotsWrap) {
      dotsWrap.innerHTML = slides.map((_, i) => `<button type="button" class="svc-slide-dot${i === 0 ? " active" : ""}" data-i="${i}" aria-label="שקופית ${i + 1}"></button>`).join("");
      $$(".svc-slide-dot", dotsWrap).forEach((dot) => {
        dot.addEventListener("click", () => {
          index = Number(dot.dataset.i);
          renderSlide();
        });
      });
    }
    renderSlide();
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
  }

  function closePreview() {
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
  }

  $$(".js-lesson-preview").forEach((btn) => {
    btn.addEventListener("click", () => openPreview(btn.dataset.lesson, btn.dataset.lessonName));
  });

  $("#lessonPreviewClose")?.addEventListener("click", closePreview);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closePreview();
  });
  prevBtn?.addEventListener("click", () => {
    if (index > 0) {
      index -= 1;
      renderSlide();
    }
  });
  nextBtn?.addEventListener("click", () => {
    if (index < slides.length - 1) {
      index += 1;
      renderSlide();
    }
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
  bindLessonPreview();
  bindCreateGameForm();
  hideLoader();
});
