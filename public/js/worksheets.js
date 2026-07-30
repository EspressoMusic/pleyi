/* Worksheets page — catalog filters (same pattern as ready-lessons) */

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const WORKSHEET_CATALOG = {
    "word-memory": { subject: "english", grades: ["ag", "dv", "zh"], topic: "games", playUrl: "/room" },
    hangman: { subject: "english", grades: ["ag", "dv", "zh"], topic: "games", playUrl: "/room" },
    trivia: { subject: "english", grades: ["dv", "zh"], topic: "games", playUrl: "/room" },
    "spot-diff": { subject: "english", grades: ["ag", "dv"], topic: "games", playUrl: "/room" },
    animals: { subject: "english", grades: ["ag"], topic: "animals" },
    colors: { subject: "english", grades: ["ag", "dv"], topic: "colors" },
    letters: { subject: "english", grades: ["ag"], topic: "letters" },
    fruits: { subject: "english", grades: ["ag", "dv"], topic: "food" },
    "word-match": { subject: "english", grades: ["dv"], topic: "vocabulary" },
    "new-words": { subject: "english", grades: ["zh"], topic: "vocabulary" },
    sentences: { subject: "english", grades: ["dv", "zh"], topic: "grammar" },
    summary: { subject: "english", grades: ["ag", "dv", "zh"], topic: "summary" },
  };

  const WORKSHEET_TOPICS = {
    english: {
      ag: [
        { id: "games", label: "משחקים" },
        { id: "animals", label: "חיות" },
        { id: "colors", label: "צבעים" },
        { id: "letters", label: "אותיות" },
        { id: "food", label: "אוכל" },
        { id: "summary", label: "סיכום" },
      ],
      dv: [
        { id: "games", label: "משחקים" },
        { id: "colors", label: "צבעים" },
        { id: "food", label: "אוכל" },
        { id: "vocabulary", label: "אוצר מילים" },
        { id: "grammar", label: "דקדוק" },
        { id: "summary", label: "סיכום" },
      ],
      zh: [
        { id: "games", label: "משחקים" },
        { id: "vocabulary", label: "אוצר מילים" },
        { id: "grammar", label: "דקדוק" },
        { id: "summary", label: "סיכום" },
      ],
    },
  };

  function bindWorksheetFilters() {
    const filtersRoot = $("#worksheetFilters");
    const topicMenu = $("#filterTopicMenu");
    const subjectValue = $("#filterSubjectValue");
    const gradeValue = $("#filterGradeValue");
    const topicValue = $("#filterTopicValue");
    const tiles = $$(".svc-tile[data-worksheet]");
    const empty = $("#worksheetEmptyState");
    if (!filtersRoot || !topicMenu || !tiles.length) return;

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
      const subjects = state.subject === "all" ? Object.keys(WORKSHEET_TOPICS) : [state.subject];
      const grades = state.grade === "all" ? ["ag", "dv", "zh"] : [state.grade];
      const seen = new Map();
      subjects.forEach((subject) => {
        grades.forEach((grade) => {
          (WORKSHEET_TOPICS[subject]?.[grade] || []).forEach((topic) => {
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
      tiles.forEach((tile) => {
        const item = WORKSHEET_CATALOG[tile.dataset.worksheet];
        if (!item) {
          tile.classList.add("hidden");
          return;
        }
        const matchSubject = state.subject === "all" || item.subject === state.subject;
        const matchGrade = state.grade === "all" || item.grades.includes(state.grade);
        const matchTopic = state.topic === "all" || item.topic === state.topic;
        const show = matchSubject && matchGrade && matchTopic;
        tile.classList.toggle("hidden", !show);
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

  function bindTileClicks() {
    $$(".svc-tile[data-worksheet]").forEach((tile) => {
      const item = WORKSHEET_CATALOG[tile.dataset.worksheet];
      if (!item?.playUrl) return;
      tile.classList.add("svc-tile--playable");
      tile.addEventListener("click", () => {
        window.location.href = item.playUrl;
      });
      tile.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          window.location.href = item.playUrl;
        }
      });
      tile.setAttribute("tabindex", "0");
      tile.setAttribute("role", "button");
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindWorksheetFilters();
    bindTileClicks();
  });
})();
