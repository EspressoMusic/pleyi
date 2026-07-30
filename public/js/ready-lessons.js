/* Ready lessons — catalog, filters, player, minimal cards */

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const SUBJECT_LABELS = { english: "אנגלית", math: "חשבון" };

  const LESSON_CATALOG = {
    intro: {
      id: "intro",
      name: "הקדמה - חלק א",
      nameMain: "הקדמה",
      namePart: "חלק א",
      subject: "english",
      grades: ["ag", "dv", "zh"],
      topic: "intro",
      gradeLabel: "כל הכיתות",
      duration: "30 דק'",
      summary: "היכרות, מטרות השיעור וחימום קצר לפני הלמידה.",
      vocab: [],
      games: [
        { id: "word-memory", label: "זיכרון מילים", icon: "🧠" },
        { id: "hangman", label: "איש תלוי", icon: "🎯" },
      ],
      slides: [
        {
          type: "content",
          title: "הקדמה",
          subtitle: "פתיחה",
          body: "ברוכים הבאים! בשיעור זה נכיר את מטרות הלמידה, נחמם יחד ונתרגל מילים בסיסיות.",
          image: "👋",
        },
        {
          type: "content",
          title: "מה נלמד היום?",
          subtitle: "מטרות",
          body: "נלמד מילים חדשות, נתרגל יחד בכיתה — ונסיים במשחק קצר לחיזוק.",
          image: "📋",
        },
        {
          type: "content",
          title: "Let's Warm Up",
          subtitle: "חימום",
          body: "Say hello! · Repeat after me. · Ready? Let's start!",
          image: "✨",
        },
        { type: "games", title: "זמן לתרגל!", subtitle: "משחקים" },
        {
          type: "content",
          title: "סוף השיעור",
          subtitle: "כל הכבוד!",
          body: "תודה על ההשתתפות!",
          image: "🎉",
        },
      ],
    },
  };

  const LESSON_TOPICS = {
    english: {
      ag: [{ id: "intro", label: "הקדמה" }],
      dv: [{ id: "intro", label: "הקדמה" }],
      zh: [{ id: "intro", label: "הקדמה" }],
    },
    math: {
      ag: [
        { id: "addition", label: "חיבור" },
        { id: "subtraction", label: "חיסור" },
        { id: "shapes", label: "צורות" },
      ],
      dv: [
        { id: "multiplication", label: "כפל" },
        { id: "division", label: "חילוק" },
        { id: "fractions", label: "שברים" },
      ],
      zh: [
        { id: "equations", label: "משוואות" },
        { id: "percentages", label: "אחוזים" },
        { id: "geometry", label: "גאומטריה" },
      ],
    },
  };

  function bindLessonFilters() {
    const filtersRoot = $("#lessonFilters");
    const topicMenu = $("#filterTopicMenu");
    const subjectValue = $("#filterSubjectValue");
    const gradeValue = $("#filterGradeValue");
    const topicValue = $("#filterTopicValue");
    const cards = $$(".svc-lesson-card[data-lesson]");
    const empty = $("#lessonEmptyState");
    if (!filtersRoot || !topicMenu || !cards.length) return;

    const state = { subject: "all", grade: "all", topic: "all" };
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

    function bindDropdown(wrap, trigger, menu, onSelect) {
      trigger?.addEventListener("click", (e) => {
        e.stopPropagation();
        openDropdownMenu(wrap, trigger, menu);
      });

      $$("button", menu).forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          $$("button", menu).forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          onSelect(btn);
          closeDropdown();
        });
      });
    }

    function getTopicOptions() {
      const subjects = state.subject === "all" ? Object.keys(LESSON_TOPICS) : [state.subject];
      const grades = state.grade === "all" ? ["ag", "dv", "zh"] : [state.grade];
      const seen = new Map();
      subjects.forEach((subject) => {
        grades.forEach((grade) => {
          (LESSON_TOPICS[subject]?.[grade] || []).forEach((topic) => {
            if (!seen.has(topic.id)) seen.set(topic.id, topic.label);
          });
        });
      });
      return [{ id: "all", label: "הכל" }, ...[...seen.entries()].map(([id, label]) => ({ id, label }))];
    }

    function renderTopicMenu() {
      const topics = getTopicOptions();
      if (!topics.some((t) => t.id === state.topic)) state.topic = "all";

      topicMenu.innerHTML = topics
        .map(
          (t) =>
            `<li><button type="button" data-topic="${t.id}" class="${state.topic === t.id ? "active" : ""}">${t.label}</button></li>`
        )
        .join("");

      const current = topics.find((t) => t.id === state.topic);
      if (topicValue) topicValue.textContent = current?.label || "הכל";

      $$("button", topicMenu).forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          state.topic = btn.dataset.topic;
          $$("button", topicMenu).forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          if (topicValue) topicValue.textContent = btn.textContent;
          closeDropdown();
          applyFilters();
        });
      });
    }

    function applyFilters() {
      let visible = 0;
      cards.forEach((card) => {
        const lesson = LESSON_CATALOG[card.dataset.lesson];
        if (!lesson) {
          card.classList.add("hidden");
          return;
        }
        const matchSubject = state.subject === "all" || lesson.subject === state.subject;
        const matchGrade = state.grade === "all" || lesson.grades.includes(state.grade);
        const matchTopic = state.topic === "all" || lesson.topic === state.topic;
        const show = matchSubject && matchGrade && matchTopic;
        card.classList.toggle("hidden", !show);
        if (show) visible += 1;
      });
      empty?.classList.toggle("hidden", visible > 0);
    }

    bindDropdown(
      $('[data-filter-key="subject"]', filtersRoot),
      $("#filterSubjectTrigger"),
      $("#filterSubjectMenu"),
      (btn) => {
        state.subject = btn.dataset.subject;
        if (subjectValue) subjectValue.textContent = btn.textContent;
        renderTopicMenu();
        applyFilters();
      }
    );

    bindDropdown(
      $('[data-filter-key="grade"]', filtersRoot),
      $("#filterGradeTrigger"),
      $("#filterGradeMenu"),
      (btn) => {
        state.grade = btn.dataset.grade;
        if (gradeValue) gradeValue.textContent = btn.textContent;
        renderTopicMenu();
        applyFilters();
      }
    );

    $("#filterTopicTrigger")?.addEventListener("click", (e) => {
      e.stopPropagation();
      const wrap = $('[data-filter-key="topic"]', filtersRoot);
      openDropdownMenu(wrap, $("#filterTopicTrigger"), topicMenu);
    });

    document.addEventListener("click", closeDropdown);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeDropdown();
    });

    renderTopicMenu();
    applyFilters();
  }

  function bindCardInfo() {
    let openPanel = null;

    function closeOpenPanel() {
      if (!openPanel) return;
      openPanel.panel.classList.add("hidden");
      openPanel.toggle.setAttribute("aria-expanded", "false");
      openPanel = null;
    }

    $$(".svc-lesson-card[data-lesson]").forEach((card) => {
      const toggle = $(".svc-lesson-info-toggle", card);
      const panel = $(".svc-lesson-info-panel", card);
      if (!toggle || !panel) return;

      toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        if (openPanel?.panel === panel) {
          closeOpenPanel();
          return;
        }
        closeOpenPanel();
        panel.classList.remove("hidden");
        toggle.setAttribute("aria-expanded", "true");
        openPanel = { panel, toggle };
      });

      panel.addEventListener("click", (e) => e.stopPropagation());
    });

    document.addEventListener("click", closeOpenPanel);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeOpenPanel();
    });
  }

  const LESSON_RETURN_KEY = "gameclass-lesson-return";
  const LESSON_RESTORE_KEY = "gameclass-lesson-restore";
  const LP_THEME_KEY = "pleyi-lesson-player-theme";

  function bindLessonPlayerTheme(shell, themeBtn, player) {
    if (!shell || !themeBtn) return;

    function applyPlayerTheme(isDark) {
      shell.classList.toggle("is-dark", isDark);
      player?.classList.toggle("is-dark", isDark);
      themeBtn.classList.toggle("is-dark", isDark);
      themeBtn.setAttribute("aria-pressed", isDark ? "true" : "false");
      themeBtn.setAttribute("aria-label", isDark ? "מעבר למצב בהיר" : "מעבר למצב כהה");
      themeBtn.setAttribute("title", isDark ? "מצב בהיר" : "מצב כהה");
      try {
        localStorage.setItem(LP_THEME_KEY, isDark ? "dark" : "light");
      } catch {
        /* ignore */
      }
    }

    function readPlayerTheme() {
      try {
        const stored = localStorage.getItem(LP_THEME_KEY);
        if (stored === "dark" || stored === "light") return stored === "dark";
      } catch {
        /* ignore */
      }
      return false;
    }

    applyPlayerTheme(readPlayerTheme());
    themeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      applyPlayerTheme(!shell.classList.contains("is-dark"));
    });
  }

  function launchLessonGame(lesson, gameId, slideIndex) {
    const text = lesson.vocab.map((v) => `${v.en}=${v.he}`).join("\n");
    sessionStorage.setItem(
      LESSON_RETURN_KEY,
      JSON.stringify({
        lessonId: lesson.id,
        slideIndex,
        returnUrl: "/services/ready-lessons",
        lessonName: lesson.name,
      })
    );
    window.CreateGameFlow?.launchGame({
      text,
      items: lesson.vocab,
      subject: lesson.subject,
      gamePick: gameId,
    });
  }

  function bindLessonPlayer() {
    const player = $("#lessonPlayer");
    const slideEl = $("#lessonPlayerSlide");
    const progressEl = $("#lessonPlayerProgress");
    const titleEl = $("#lessonPlayerLessonTitle");
    const dotsWrap = $("#lessonPlayerDots");
    const prevBtn = $("#lessonPlayerPrev");
    const nextBtn = $("#lessonPlayerNext");
    const prevMobile = $("#lessonPlayerPrevMobile");
    const nextMobile = $("#lessonPlayerNextMobile");
    const closeBtn = $("#lessonPlayerClose");
    const expandBtn = $("#lessonPlayerExpand");
    const themeBtn = $("#lessonPlayerTheme");
    const backdrop = $("#lessonPlayerBackdrop");
    const shell = $(".lesson-player-shell", player);
    if (!player || !slideEl) return;

    if (player.parentElement !== document.body) {
      document.body.appendChild(player);
    }

    bindLessonPlayerTheme(shell, themeBtn, player);

    let lesson = null;
    let steps = [];
    let index = 0;

    const EXPAND_ICON = `<svg class="lesson-player-expand-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H3v5M16 3h5v5M16 21h5v-5M8 21H3v-5"/></svg>`;
    const COMPRESS_ICON = `<svg class="lesson-player-expand-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 14h6v6M20 10h-6V4M14 20v-6h6M10 4v6H4"/></svg>`;

    function setExpanded(expanded) {
      player.classList.toggle("is-expanded", expanded);
      document.body.classList.toggle("lesson-player-expanded", expanded);
      if (expandBtn) {
        expandBtn.setAttribute("aria-pressed", expanded ? "true" : "false");
        expandBtn.setAttribute("aria-label", expanded ? "חזור לחלון קטן" : "הגדל למסך מלא");
        expandBtn.innerHTML = expanded ? COMPRESS_ICON : EXPAND_ICON;
      }
    }

    function renderGamesSlide(slide) {
      const games = lesson.games || [];
      return `
        <div class="lp-slide-inner">
          <div class="lp-slide-image" aria-hidden="true">🎮</div>
          <div class="lp-slide-text">
            <p class="lp-slide-kicker">${slide.subtitle || "משחקים"}</p>
            <h2 class="lp-slide-title">${slide.title}</h2>
            <p class="lp-slide-games-intro">בחרו משחק — התוכן יהיה מהמילים שלמדנו בשיעור.</p>
          </div>
          <div class="lp-slide-games">
            <div class="lp-game-options">
              ${games
                .map(
                  (g) =>
                    `<button type="button" class="lp-game-btn" data-game-id="${g.id}">
                      <span class="lp-game-btn-icon" aria-hidden="true">${g.icon || "🎮"}</span>
                      <span class="lp-game-btn-label">${g.label}</span>
                    </button>`
                )
                .join("")}
            </div>
          </div>
        </div>`;
    }

    function renderContentSlide(slide) {
      const itemsHtml = slide.items?.length
        ? `<ul class="lp-slide-list">${slide.items
            .map((it) => `<li><span dir="ltr">${it.en}</span><span>${it.he}</span></li>`)
            .join("")}</ul>`
        : slide.body
          ? `<p class="lp-slide-body">${slide.body.replace(/\n/g, "<br>")}</p>`
          : "";

      return `
        <div class="lp-slide-inner">
          ${slide.image ? `<div class="lp-slide-image" aria-hidden="true">${slide.image}</div>` : ""}
          <div class="lp-slide-text">
            ${slide.subtitle ? `<p class="lp-slide-kicker">${slide.subtitle}</p>` : ""}
            <h2 class="lp-slide-title">${slide.title}</h2>
            ${itemsHtml}
          </div>
        </div>`;
    }

    function animateSlide(html, direction = 0) {
      const current = $(".lp-slide-inner", slideEl);

      const showNew = () => {
        slideEl.innerHTML = html;
        const inner = $(".lp-slide-inner", slideEl);
        if (!inner) return;
        if (direction > 0) inner.classList.add("from-next");
        if (direction < 0) inner.classList.add("from-prev");
        requestAnimationFrame(() => {
          requestAnimationFrame(() => inner.classList.add("is-visible"));
        });

        $$(".lp-game-btn", slideEl).forEach((btn) => {
          btn.addEventListener("click", () => launchLessonGame(lesson, btn.dataset.gameId, index));
        });
      };

      if (current?.classList.contains("is-visible")) {
        current.classList.add("is-exiting");
        if (direction > 0) current.classList.add("to-prev");
        if (direction < 0) current.classList.add("to-next");
        current.classList.remove("is-visible");
        setTimeout(showNew, 220);
        return;
      }

      showNew();
    }

    function renderDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = steps
        .map(
          (_, i) =>
            `<button type="button" class="lesson-player-dot${i === index ? " active" : ""}" data-i="${i}" aria-label="שקופית ${i + 1}"></button>`
        )
        .join("");
      $$(".lesson-player-dot", dotsWrap).forEach((dot) => {
        dot.addEventListener("click", () => goTo(Number(dot.dataset.i)));
      });
    }

    function updateNav() {
      const total = steps.length;
      if (progressEl) progressEl.textContent = `${index + 1} / ${total}`;
      const atStart = index === 0;
      const atEnd = index >= total - 1;
      [prevBtn, prevMobile].forEach((b) => {
        if (b) b.disabled = atStart;
      });
      [nextBtn, nextMobile].forEach((b) => {
        if (b) b.disabled = atEnd;
      });
      $$(".lesson-player-dot", dotsWrap).forEach((dot, i) => dot.classList.toggle("active", i === index));
    }

    function renderStep(direction = 0) {
      const slide = steps[index];
      const html = slide.type === "games" ? renderGamesSlide(slide) : renderContentSlide(slide);
      animateSlide(html, direction);
      updateNav();
    }

    function goTo(i) {
      if (i < 0 || i >= steps.length) return;
      const direction = i > index ? 1 : i < index ? -1 : 0;
      index = i;
      renderStep(direction);
    }

    function open(lessonId) {
      lesson = LESSON_CATALOG[lessonId];
      if (!lesson) return;
      steps = lesson.slides || [];
      index = 0;
      if (titleEl) titleEl.textContent = lesson.name;
      renderDots();
      renderStep();
      player.classList.remove("hidden");
      player.setAttribute("aria-hidden", "false");
      setExpanded(false);
      document.body.style.overflow = "hidden";
    }

    function close() {
      player.classList.add("hidden");
      player.setAttribute("aria-hidden", "true");
      setExpanded(false);
      document.body.style.overflow = "";
      lesson = null;
    }

    function step(delta) {
      goTo(index + delta);
    }

    $$(".js-lesson-open").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        open(btn.dataset.lesson);
      });
    });

    closeBtn?.addEventListener("click", close);
    expandBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      setExpanded(!player.classList.contains("is-expanded"));
    });
    backdrop?.addEventListener("click", close);
    $(".lesson-player-shell", player)?.addEventListener("click", (e) => e.stopPropagation());
    prevBtn?.addEventListener("click", () => step(-1));
    nextBtn?.addEventListener("click", () => step(1));
    prevMobile?.addEventListener("click", () => step(-1));
    nextMobile?.addEventListener("click", () => step(1));

    document.addEventListener("keydown", (e) => {
      if (player.classList.contains("hidden")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") step(1);
      if (e.key === "ArrowRight") step(-1);
    });

    function tryRestoreLessonFromGame() {
      const raw = sessionStorage.getItem(LESSON_RESTORE_KEY);
      if (!raw) return;
      sessionStorage.removeItem(LESSON_RESTORE_KEY);
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        return;
      }
      if (!data?.lessonId || !LESSON_CATALOG[data.lessonId]) return;
      open(data.lessonId);
      if (data.slideIndex === "end") {
        goTo(steps.length - 1);
        return;
      }
      const slideIndex = Number(data.slideIndex);
      if (Number.isFinite(slideIndex) && slideIndex > 0) {
        goTo(slideIndex);
      }
    }

    tryRestoreLessonFromGame();
  }

  function syncLessonCardTitles() {
    $$(".svc-lesson-card[data-lesson]").forEach((card) => {
      const lesson = LESSON_CATALOG[card.dataset.lesson];
      if (!lesson) return;
      const nameEl = $(".svc-lesson-name", card);
      const partEl = $(".svc-lesson-part", card);
      if (nameEl) nameEl.textContent = lesson.nameMain || lesson.name;
      if (partEl) partEl.textContent = lesson.namePart || "";
    });
  }

  function init() {
    syncLessonCardTitles();
    bindLessonFilters();
    bindCardInfo();
    bindLessonPlayer();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.ReadyLessons = { catalog: LESSON_CATALOG, subjectLabels: SUBJECT_LABELS };
})();
