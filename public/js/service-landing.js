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
  animals: {
    vocab: [
      { en: "cat", he: "חתול" },
      { en: "dog", he: "כלב" },
      { en: "bird", he: "ציפור" },
      { en: "fish", he: "דג" },
    ],
    slides: [
      { title: "Animals in English", body: "שיעור מוכן לכיתות א–ג · 45 דקות" },
      { title: "New words", body: "cat — חתול\n dog — כלב\n bird — ציפור\n fish — דג" },
      { title: "Let's play!", body: "משחק זיכרון + דף צביעה — הכל מוכן לשיעור" },
    ],
  },
  colors: {
    vocab: [
      { en: "red", he: "אדום" },
      { en: "blue", he: "כחול" },
      { en: "green", he: "ירוק" },
      { en: "yellow", he: "צהוב" },
    ],
    slides: [
      { title: "Colors & Shapes", body: "שיעור מוכן לכיתות א–ד · 40 דקות" },
      { title: "Colors", body: "red — אדום\n blue — כחול\n green — ירוק\n yellow — צהוב" },
      { title: "Shapes", body: "circle — עיגול\n square — ריבוע\n triangle — משולש" },
    ],
  },
  family: {
    vocab: [
      { en: "mother", he: "אמא" },
      { en: "father", he: "אבא" },
      { en: "sister", he: "אחות" },
      { en: "brother", he: "אח" },
    ],
    slides: [
      { title: "My Family", body: "שיעור מוכן לכיתות ב–ד · 45 דקות" },
      { title: "Family words", body: "mother — אמא\n father — אבא\n sister — אחות\n brother — אח" },
      { title: "Activity", body: "דף עבודה + משחק התאמה — מוכן להצגה על הלוח" },
    ],
  },
  food: {
    vocab: [
      { en: "apple", he: "תפוח" },
      { en: "water", he: "מים" },
      { en: "bread", he: "לחם" },
      { en: "milk", he: "חלב" },
    ],
    slides: [
      { title: "Food & Drinks", body: "שיעור מוכן לכיתות ג–ה · 45 דקות" },
      { title: "Vocabulary", body: "apple — תפוח\n water — מים\n bread — לחם\n milk — חלב" },
      { title: "Wrap up", body: "חימום, תרגול ומשחק סיום — מערך מלא כמו מצגת" },
    ],
  },
};

function bindLessonFlow() {
  const confirmModal = $("#lessonConfirmModal");
  const confirmBody = $("#lessonConfirmBody");
  const confirmOpenBtn = $("#lessonConfirmOpen");
  const confirmCancelBtn = $("#lessonConfirmCancel");
  const confirmCloseBtn = $("#lessonConfirmClose");

  const fsModal = $("#lessonFullscreenModal");
  const fsTitle = $("#lessonFullscreenTitle");
  const slideView = $("#lessonSlideView");
  const slideTitle = $("#lessonSlideTitle");
  const slideBody = $("#lessonSlideBody");
  const gameView = $("#lessonGameView");
  const dotsWrap = $("#lessonSlideDots");
  const prevBtn = $("#lessonSlidePrev");
  const nextBtn = $("#lessonSlideNext");
  const playGameBtn = $("#lessonPlayGameBtn");
  const fsCloseBtn = $("#lessonFullscreenClose");
  if (!confirmModal || !fsModal || !slideTitle || !slideBody) return;

  let currentLessonId = null;
  let currentLessonName = "";
  let slides = [];
  let vocab = [];
  let index = 0; // 0..slides.length-1 = content slides, slides.length = game step

  function renderDots() {
    if (!dotsWrap) return;
    const total = slides.length + 1;
    dotsWrap.innerHTML = Array.from(
      { length: total },
      (_, i) => `<button type="button" class="svc-slide-dot${i === index ? " active" : ""}" data-i="${i}" aria-label="שקופית ${i + 1}"></button>`
    ).join("");
    $$(".svc-slide-dot", dotsWrap).forEach((dot) => {
      dot.addEventListener("click", () => {
        index = Number(dot.dataset.i);
        renderStep();
      });
    });
  }

  function renderStep() {
    const onGameStep = index >= slides.length;
    slideView?.classList.toggle("hidden", onGameStep);
    gameView?.classList.toggle("hidden", !onGameStep);

    if (!onGameStep) {
      const slide = slides[index];
      slideTitle.textContent = slide.title;
      slideBody.textContent = slide.body;
    }

    $$(".svc-slide-dot", dotsWrap).forEach((dot, i) => dot.classList.toggle("active", i === index));
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = onGameStep;
  }

  function openConfirm(lessonId, lessonName) {
    currentLessonId = lessonId;
    currentLessonName = lessonName || "";
    if (confirmBody) confirmBody.textContent = `לפתוח את השיעור "${currentLessonName}" ולהציג אותו על הלוח?`;
    confirmModal.classList.remove("hidden");
    confirmModal.setAttribute("aria-hidden", "false");
  }

  function closeConfirm() {
    confirmModal.classList.add("hidden");
    confirmModal.setAttribute("aria-hidden", "true");
  }

  function openFullscreen() {
    const data = LESSON_SLIDES[currentLessonId];
    slides = data?.slides || [];
    vocab = data?.vocab || [];
    index = 0;
    if (fsTitle) fsTitle.textContent = currentLessonName;
    renderDots();
    renderStep();
    fsModal.classList.remove("hidden");
    fsModal.setAttribute("aria-hidden", "false");
  }

  function closeFullscreen() {
    fsModal.classList.add("hidden");
    fsModal.setAttribute("aria-hidden", "true");
  }

  $$(".js-lesson-preview").forEach((btn) => {
    btn.addEventListener("click", () => openConfirm(btn.dataset.lesson, btn.dataset.lessonName));
  });

  confirmOpenBtn?.addEventListener("click", () => {
    closeConfirm();
    openFullscreen();
  });
  confirmCancelBtn?.addEventListener("click", closeConfirm);
  confirmCloseBtn?.addEventListener("click", closeConfirm);
  confirmModal.addEventListener("click", (e) => {
    if (e.target === confirmModal) closeConfirm();
  });

  fsCloseBtn?.addEventListener("click", closeFullscreen);
  prevBtn?.addEventListener("click", () => {
    if (index > 0) {
      index -= 1;
      renderStep();
    }
  });
  nextBtn?.addEventListener("click", () => {
    if (index < slides.length) {
      index += 1;
      renderStep();
    }
  });

  playGameBtn?.addEventListener("click", () => {
    if (!vocab.length) return;
    const text = vocab.map((v) => `${v.en}=${v.he}`).join("\n");
    window.CreateGameFlow?.launchGame({ text, items: vocab, subject: "english", gamePick: "word-memory" });
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
  bindLessonFlow();
  bindCreateGameForm();
  hideLoader();
});
