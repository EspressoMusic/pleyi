/* Learn English — printable worksheets page (/services/english-worksheet).

   ?topic=<topic id>&sheet=<sheet id | "all">&answers=1
   Renders a topic's pack from english-printables.js as A4 pages. The toolbar
   switches sheets, shows the answer key (the same pages with the answers
   written in), and prints. The sheets themselves are English worksheets, so
   they stay left-to-right; only the toolbar follows the site language. */

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);

  const PACKS = window.ENGLISH_PRINTABLES || {};
  const TOPICS = window.ENGLISH_TOPICS || [];
  const PAGE_WIDTH_PX = 794; // 210mm at 96dpi

  const STR = {
    he: {
      back: "חזרה לנושא",
      backTopics: "חזרה לנושאים",
      heading: (title) => `דפי עבודה להדפסה · ${title}`,
      all: "כל הדפים",
      sheet: (n) => `דף ${n}`,
      answers: "דף תשובות",
      print: "הדפסה",
      langSwitch: "EN",
      langLabel: "English",
      tip: "בחלון ההדפסה אפשר גם לשמור כ-PDF. כשדף התשובות מופעל, מודפסים הדפים עם התשובות.",
      missing: "לא מצאנו דפי עבודה לנושא הזה.",
      docTitle: (title) => `${title} — דפי עבודה`,
    },
    en: {
      back: "Back to topic",
      backTopics: "Back to topics",
      heading: (title) => `Printable worksheets · ${title}`,
      all: "All sheets",
      sheet: (n) => `Sheet ${n}`,
      answers: "Answer key",
      print: "Print",
      langSwitch: "עב",
      langLabel: "עברית",
      tip: "In the print window you can also save as PDF. With the answer key on, the pages print with the answers.",
      missing: "We couldn't find worksheets for this topic.",
      docTitle: (title) => `${title} — worksheets`,
    },
  };

  const params = new URLSearchParams(window.location.search);
  const topicId = params.get("topic") || "";
  const pack = PACKS[topicId];
  const topic = TOPICS.find((tp) => tp.id === topicId);

  // Same lock as i18n.js: the site stays in Hebrew for now (null unlocks it).
  const LOCKED_LANG = "he";

  const state = {
    lang: readLang(),
    sheet: params.get("sheet") || "all",
    answers: params.get("answers") === "1",
  };

  // Same key and default as i18n.js, without its page-wide side effects.
  function readLang() {
    if (LOCKED_LANG) return LOCKED_LANG;
    try {
      return localStorage.getItem("pleyi-lang") === "he" ? "he" : "en";
    } catch {
      return "en";
    }
  }

  function saveLang(lang) {
    try {
      localStorage.setItem("pleyi-lang", lang);
    } catch {
      /* ignore */
    }
  }

  function t(key, ...args) {
    const val = STR[state.lang][key];
    return typeof val === "function" ? val(...args) : val;
  }

  function esc(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function topicTitle() {
    if (!topic) return topicId;
    return state.lang === "en" ? topic.titleEn : topic.title;
  }

  /* ── Sheet pieces ── */

  // A blank sized for the longest answer in its task, so the student copy
  // and the answer key share the same layout.
  function blankHtml(answer, width, solved = false) {
    return `<span class="ws-blank${solved ? " is-solved" : ""}" style="--w:${width}ch"><span class="ws-ans">${esc(answer)}</span></span>`;
  }

  function blankWidth(answers, min = 5, extra = 3) {
    return Math.max(min, Math.max(...answers.map((a) => String(a).length)) + extra);
  }

  function withBlank(text, blank) {
    const [before, after = ""] = String(text).split("___");
    return `${esc(before)}${blank}${esc(after)}`;
  }

  function circleHtml(task) {
    const items = task.items
      .map((item) => {
        const options = (item.options || task.options)
          .map((opt) => `<span class="ws-opt${opt === item.answer ? " is-answer" : ""}">${esc(opt)}</span>`)
          .join('<span class="ws-opt-sep">/</span>');
        return `<li>${withBlank(item.text, `<span class="ws-opts">(${options})</span>`)}</li>`;
      })
      .join("");
    return `<ol class="ws-list ws-list--circle">${items}</ol>`;
  }

  function fillHtml(task) {
    // Picture cards are narrow, so their blanks are a little shorter.
    const pictures = task.items.some((i) => i.img);
    const width = pictures ? blankWidth(task.items.map((i) => i.answer), 5, 2) : blankWidth(task.items.map((i) => i.answer));
    const items = task.items
      .map((item) => {
        const sentence = withBlank(item.text, blankHtml(item.answer, width, item.example));
        if (!pictures) return `<li class="${item.example ? "is-example" : ""}">${sentence}</li>`;
        return `
          <li class="ws-pic">
            <img src="/images/english/vocab/${esc(item.img)}.svg" alt="" />
            <span class="ws-pic-text">${sentence}</span>
          </li>`;
      })
      .join("");
    return `<ol class="ws-list ws-list--fill${pictures ? " ws-list--pics" : ""}" style="--cols:${task.cols || 1}">${items}</ol>`;
  }

  function answerLineHtml(item, solved = false) {
    const alt = item.alt ? `<span class="ws-alt">or: ${esc(item.alt)}</span>` : "";
    return `<span class="ws-line${solved ? " is-solved" : ""}"><span class="ws-ans">${esc(item.answer)}${alt}</span></span>`;
  }

  // A Hebrew sentence (a translation task) reads right-to-left but stays
  // next to its number.
  function rewriteHtml(task) {
    const src = (text) =>
      /[֐-׿]/.test(text) ? `<span class="ws-src ws-src--he" dir="rtl">${esc(text)}</span>` : `<span class="ws-src">${esc(text)}</span>`;
    const row = (item, solved) => `
      <li class="ws-row${solved ? " is-example" : ""}">
        ${src(item.text)}
        <span class="ws-arrow" aria-hidden="true">→</span>
        ${answerLineHtml(item, solved)}
      </li>`;
    const example = task.example ? row(task.example, true) : "";
    return `<ol class="ws-list ws-list--rows">${example}${task.items.map((item) => row(item, false)).join("")}</ol>`;
  }

  function orderHtml(task) {
    const items = task.items
      .map(
        (item) => `
          <li class="ws-row ws-row--order">
            <span class="ws-words">${item.words.map((w) => `<span class="ws-word">${esc(w)}</span>`).join("")}</span>
            <span class="ws-arrow" aria-hidden="true">→</span>
            ${answerLineHtml(item)}
          </li>`
      )
      .join("");
    return `<ol class="ws-list ws-list--rows">${items}</ol>`;
  }

  function aboutHtml(task) {
    const items = task.items
      .map((item) => `<li class="ws-about">${withBlank(item.text, blankHtml(item.sample, 22))}</li>`)
      .join("");
    return `<ol class="ws-list ws-list--about">${items}</ol>`;
  }

  const TASK_RENDERERS = {
    circle: circleHtml,
    fill: fillHtml,
    rewrite: rewriteHtml,
    order: orderHtml,
    about: aboutHtml,
  };

  function taskHtml(task, index) {
    const body = TASK_RENDERERS[task.type]?.(task) || "";
    const he = state.lang === "he" ? `<span class="ws-task-he" dir="rtl">${esc(task.instructions)}</span>` : "";
    return `
      <section class="ws-task ws-task--${esc(task.type)}">
        <h3 class="ws-task-head">
          <span class="ws-task-num">${index + 1}</span>
          <span class="ws-task-en">${esc(task.instructionsEn)}</span>
          ${he}
        </h3>
        ${body}
      </section>`;
  }

  function rememberHtml(remember) {
    if (!remember) return "";
    const note = state.lang === "he" ? `<p class="ws-remember-note" dir="rtl">${esc(remember.note)}</p>` : `<p class="ws-remember-note">${esc(remember.noteEn)}</p>`;
    const chips = (remember.chips || []).map((c) => `<span class="ws-chip">${esc(c)}</span>`).join("");
    return `
      <div class="ws-remember">
        <div class="ws-remember-top">
          <span class="ws-remember-label">Remember!</span>
          ${note}
        </div>
        <div class="ws-chips">${chips}</div>
      </div>`;
  }

  function sheetHtml(sheet, index) {
    const total = pack.sheets.length;
    const heTitle = state.lang === "he" && topic ? `<span class="ws-title-he" dir="rtl">${esc(topic.title)} · ${esc(sheet.title)}</span>` : "";
    return `
      <article class="ws-page" data-sheet="${esc(sheet.id)}">
        <header class="ws-head">
          <div class="ws-head-titles">
            <h2 class="ws-title">${esc(sheet.titleEn)}</h2>
            ${heTitle}
          </div>
          <div class="ws-head-side">
            <div class="ws-head-tags">
              <span class="ws-topic">${esc(topic?.titleEn || topicId)}</span>
              <span class="ws-sheet-num">Worksheet ${index + 1}<small> of ${total}</small></span>
            </div>
            <span class="ws-key-badge">Answer key</span>
          </div>
        </header>
        <div class="ws-fields">
          <span class="ws-field">Name:<i></i></span>
          <span class="ws-field ws-field--short">Class:<i></i></span>
          <span class="ws-field ws-field--short">Date:<i></i></span>
        </div>
        ${rememberHtml(sheet.remember)}
        <div class="ws-tasks">${sheet.tasks.map(taskHtml).join("")}</div>
        <footer class="ws-foot">
          <span><b>Pleyi</b> · pleyschool.com</span>
          <span>${esc(topic?.titleEn || "")} · ${index + 1} / ${total}</span>
        </footer>
      </article>`;
  }

  /* ── Page ── */

  function selectedSheets() {
    if (state.sheet === "all") return pack.sheets;
    const one = pack.sheets.filter((s) => s.id === state.sheet);
    return one.length ? one : pack.sheets;
  }

  function syncUrl() {
    const next = new URLSearchParams({ topic: topicId });
    if (state.sheet !== "all") next.set("sheet", state.sheet);
    if (state.answers) next.set("answers", "1");
    window.history.replaceState(null, "", `${window.location.pathname}?${next}`);
  }

  function renderToolbar() {
    document.documentElement.lang = state.lang;
    document.documentElement.dir = state.lang === "en" ? "ltr" : "rtl";
    $("#wsBack").href = pack ? `/services/english#${encodeURIComponent(topicId)}` : "/services/english";
    $("#wsBackLabel").textContent = pack ? t("back") : t("backTopics");
    $("#wsToolbarTitle").textContent = t("heading", topicTitle());
    $("#wsLang").textContent = t("langSwitch");
    $("#wsLang").setAttribute("aria-label", t("langLabel"));
    $("#wsLang").hidden = !!LOCKED_LANG;
    $("#wsAnswersLabel").textContent = t("answers");
    $("#wsAnswers").checked = state.answers;
    $("#wsPrintLabel").textContent = t("print");
    $("#wsTip").textContent = t("tip");
    $(".ws-toolbar-row--controls").hidden = !pack;
    $("#wsTip").hidden = !pack;

    const picker = $("#wsSheetPicker");
    const chip = (id, label) =>
      `<button type="button" class="ws-pick${state.sheet === id ? " is-on" : ""}" data-sheet="${esc(id)}" aria-pressed="${state.sheet === id}">${esc(label)}</button>`;
    picker.innerHTML = pack
      ? chip("all", t("all")) +
        pack.sheets.map((s, i) => chip(s.id, `${t("sheet", i + 1)} · ${state.lang === "en" ? s.titleEn : s.title}`)).join("")
      : "";
  }

  function renderPages() {
    const pages = $("#wsPages");
    if (!pack) {
      pages.innerHTML = `<p class="ws-missing">${esc(t("missing"))}</p>`;
      return;
    }
    const sheets = selectedSheets();
    pages.innerHTML = sheets.map((s) => sheetHtml(s, pack.sheets.indexOf(s))).join("");
    document.body.classList.toggle("show-answers", state.answers);
    const sheetName = sheets.length === 1 ? ` ${sheets[0].titleEn}` : "";
    document.title = `${t("docTitle", topic?.titleEn || topicId)}${sheetName}${state.answers ? " (answer key)" : ""}`;
    fitPages();
  }

  function render() {
    renderToolbar();
    renderPages();
  }

  // Shrink the A4 pages to fit narrow screens (printing resets the zoom).
  function fitPages() {
    const stage = $("#wsStage");
    const room = stage.clientWidth - 32;
    const zoom = Math.min(1, room / PAGE_WIDTH_PX);
    $("#wsPages").style.setProperty("--ws-zoom", zoom.toFixed(3));
  }

  function bind() {
    $("#wsSheetPicker").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-sheet]");
      if (!btn) return;
      state.sheet = btn.dataset.sheet;
      syncUrl();
      render();
    });
    $("#wsAnswers").addEventListener("change", (e) => {
      state.answers = e.target.checked;
      syncUrl();
      renderPages();
    });
    $("#wsLang").addEventListener("click", () => {
      state.lang = state.lang === "he" ? "en" : "he";
      saveLang(state.lang);
      render();
    });
    $("#wsPrint").addEventListener("click", () => window.print());
    window.addEventListener("resize", fitPages);
  }

  bind();
  render();
})();
