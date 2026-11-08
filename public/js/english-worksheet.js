/* Learn English — printable worksheets page (/services/english-worksheet).

   ?topic=<topic id>&sheet=<sheet id | "all">&answers=1
   Renders a topic's pack from english-printables.js as A4 pages.
   ?topic=<topic id>&exercise=<exercise id>&answers=1
   Renders one of the topic's practice exercises (english-exercise-sheets.js),
   on as many pages as its questions need.
   The toolbar switches sheets, shows the answer key (the same pages with the
   answers written in), prints, and downloads the pages as a PDF file. The
   sheets themselves are English worksheets, so they stay left-to-right; only
   the toolbar follows the site language. */

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);

  const PACKS = window.ENGLISH_PRINTABLES || {};
  const TOPICS = window.ENGLISH_TOPICS || [];
  const PAGE_WIDTH_PX = 794; // 210mm at 96dpi
  const PDF_SCALE = 3; // about 290dpi on paper
  const PDF_LIBS = ["/js/vendor/html2canvas.min.js?v=1", "/js/vendor/jspdf.umd.min.js?v=1"];

  const STR = {
    he: {
      back: "חזרה לנושא",
      backTopics: "חזרה לנושאים",
      heading: (title) => `דפי עבודה להדפסה · ${title}`,
      all: "כל הדפים",
      sheet: (n) => `דף ${n}`,
      answers: "דף תשובות",
      print: "הדפסה",
      download: "הורדת PDF",
      downloading: "מכין את הקובץ...",
      downloadFailed: "לא הצלחנו ליצור את הקובץ. נסו שוב, או השתמשו בכפתור ההדפסה.",
      langSwitch: "EN",
      langLabel: "English",
      tip: "כשדף התשובות מופעל, הקובץ וההדפסה יוצאים עם התשובות.",
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
      download: "Download PDF",
      downloading: "Preparing the file...",
      downloadFailed: "We couldn't create the file. Try again, or use the print button.",
      langSwitch: "עב",
      langLabel: "עברית",
      tip: "With the answer key on, the file and the print include the answers.",
      missing: "We couldn't find worksheets for this topic.",
      docTitle: (title) => `${title} — worksheets`,
    },
  };

  const params = new URLSearchParams(window.location.search);
  const topicId = params.get("topic") || "";
  const pack = PACKS[topicId];
  const topic = TOPICS.find((tp) => tp.id === topicId);
  const exercises = window.EnglishExerciseSheets?.forTopic(topic) || [];
  const exerciseMode = params.has("exercise") && exercises.length > 0;
  const hasSheets = exerciseMode || !!pack;

  // Same lock as i18n.js: the site stays in Hebrew for now (null unlocks it).
  const LOCKED_LANG = "he";

  const state = {
    lang: readLang(),
    sheet: exerciseMode ? params.get("exercise") : params.get("sheet") || "all",
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

  /* ── An exercise as a sheet ── */

  function selectedExercise() {
    return exercises.find((ex) => ex.id === state.sheet) || exercises[0];
  }

  function exercisePageHtml(sheet, first) {
    const heTitle = state.lang === "he" && topic ? `<span class="ws-title-he" dir="rtl">${esc(topic.title)} · ${esc(sheet.title)}</span>` : "";
    const top = first
      ? `
        <div class="ws-fields">
          <span class="ws-field">Name:<i></i></span>
          <span class="ws-field ws-field--short">Class:<i></i></span>
          <span class="ws-field ws-field--short">Date:<i></i></span>
        </div>
        <h3 class="ws-task-head wx-instr">
          ${state.lang === "he" ? `<span class="ws-task-he" dir="rtl">${esc(sheet.instructions)}</span>` : `<span class="ws-task-en">${esc(sheet.instructionsEn)}</span>`}
        </h3>`
      : "";
    return `
      <article class="ws-page wx-page wx-page--${esc(sheet.type)}">
        <header class="ws-head">
          <div class="ws-head-titles">
            <h2 class="ws-title">${esc(sheet.titleEn)}</h2>
            ${heTitle}
          </div>
          <div class="ws-head-side">
            <div class="ws-head-tags">
              <span class="ws-topic">${esc(topic?.titleEn || topicId)}</span>
              <span class="ws-sheet-num wx-page-num" hidden></span>
            </div>
            <span class="ws-key-badge">Answer key</span>
          </div>
        </header>
        ${top}
        <ol class="wx-rows"></ol>
        <footer class="ws-foot">
          <span><b>Pleyi</b> · pleyschool.com</span>
          <span class="wx-foot-num">${esc(topic?.titleEn || "")}</span>
        </footer>
      </article>`;
  }

  // The rows go on real pages, measured at full size: a row that doesn't fit
  // opens the next page.
  function renderExercisePages() {
    const pages = $("#wsPages");
    const sheet = window.EnglishExerciseSheets.build(selectedExercise());
    pages.style.setProperty("--ws-zoom", "1");
    pages.innerHTML = exercisePageHtml(sheet, true);
    let box = $(".wx-rows", pages);
    sheet.rows.forEach((row) => {
      box.insertAdjacentHTML("beforeend", row);
      if (box.scrollHeight <= box.clientHeight || box.children.length === 1) return;
      const moved = box.lastElementChild;
      pages.insertAdjacentHTML("beforeend", exercisePageHtml(sheet, false));
      box = $(".wx-rows", pages.lastElementChild);
      box.append(moved);
    });

    const total = pages.children.length;
    if (total > 1) {
      [...pages.children].forEach((page, i) => {
        const pill = $(".wx-page-num", page);
        pill.hidden = false;
        pill.textContent = `Page ${i + 1} of ${total}`;
        $(".wx-foot-num", page).textContent = `${topic?.titleEn || ""} · ${i + 1} / ${total}`;
      });
    }
    document.body.classList.toggle("show-answers", state.answers);
    document.title = `${t("docTitle", topic?.titleEn || topicId)} ${sheet.titleEn}${state.answers ? " (answer key)" : ""}`;
    fitPages();
  }

  /* ── PDF file ── */

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const tag = document.createElement("script");
      tag.src = src;
      tag.onload = resolve;
      tag.onerror = () => reject(new Error(`Could not load ${src}`));
      document.head.append(tag);
    });
  }

  // Only someone who downloads a file needs these two large libraries.
  let pdfLibs = null;
  function loadPdfLibs() {
    pdfLibs ||= Promise.all(PDF_LIBS.map(loadScript)).catch((err) => {
      pdfLibs = null;
      throw err;
    });
    return pdfLibs;
  }

  function pdfFileName() {
    const slug = (text) =>
      String(text || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    let name = "";
    if (exerciseMode) name = window.EnglishExerciseSheets.build(selectedExercise()).titleEn;
    else if (state.sheet !== "all") name = pack.sheets.find((s) => s.id === state.sheet)?.titleEn;
    return `${[slug(topic?.titleEn || topicId), slug(name), state.answers ? "answers" : ""].filter(Boolean).join("-")}.pdf`;
  }

  // Each page is photographed from a full-size copy (the preview may be zoomed
  // out), which keeps the Hebrew and the pictures exactly as on screen.
  async function downloadPdf() {
    const btn = $("#wsDownload");
    const label = $("#wsDownloadLabel");
    btn.disabled = true;
    label.textContent = t("downloading");
    const copy = document.createElement("div");
    copy.className = "ws-capture";
    copy.innerHTML = $("#wsPages").innerHTML;
    document.body.append(copy);
    try {
      await Promise.all([loadPdfLibs(), document.fonts?.ready]);
      const pdf = new window.jspdf.jsPDF({ unit: "mm", format: "a4", compress: true });
      for (const [i, page] of [...copy.children].entries()) {
        const canvas = await window.html2canvas(page, { scale: PDF_SCALE, backgroundColor: "#ffffff", logging: false });
        if (i > 0) pdf.addPage();
        pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, 210, 297);
      }
      pdf.save(pdfFileName());
    } catch (err) {
      console.error(err);
      window.alert(t("downloadFailed"));
    } finally {
      copy.remove();
      btn.disabled = false;
      label.textContent = t("download");
    }
  }

  /* ── Page ── */

  function selectedSheets() {
    if (state.sheet === "all") return pack.sheets;
    const one = pack.sheets.filter((s) => s.id === state.sheet);
    return one.length ? one : pack.sheets;
  }

  function syncUrl() {
    const next = new URLSearchParams({ topic: topicId });
    if (exerciseMode) next.set("exercise", state.sheet);
    else if (state.sheet !== "all") next.set("sheet", state.sheet);
    if (state.answers) next.set("answers", "1");
    window.history.replaceState(null, "", `${window.location.pathname}?${next}`);
  }

  function renderToolbar() {
    document.documentElement.lang = state.lang;
    document.documentElement.dir = state.lang === "en" ? "ltr" : "rtl";
    $("#wsBack").href = hasSheets ? `/services/english#${encodeURIComponent(topicId)}` : "/services/english";
    $("#wsBackLabel").textContent = hasSheets ? t("back") : t("backTopics");
    $("#wsToolbarTitle").textContent = t("heading", topicTitle());
    $("#wsLang").textContent = t("langSwitch");
    $("#wsLang").setAttribute("aria-label", t("langLabel"));
    $("#wsLang").hidden = !!LOCKED_LANG;
    $("#wsAnswersLabel").textContent = t("answers");
    $("#wsAnswers").checked = state.answers;
    $("#wsPrintLabel").textContent = t("print");
    $("#wsDownloadLabel").textContent = t("download");
    $("#wsTip").textContent = t("tip");
    $(".ws-toolbar-row--controls").hidden = !hasSheets;
    $("#wsTip").hidden = !hasSheets;

    const picker = $("#wsSheetPicker");
    const chip = (id, label) =>
      `<button type="button" class="ws-pick${state.sheet === id ? " is-on" : ""}" data-sheet="${esc(id)}" aria-pressed="${state.sheet === id}">${esc(label)}</button>`;
    picker.classList.toggle("is-exercises", exerciseMode);
    picker.innerHTML = exerciseMode
      ? exercises.map((ex) => chip(ex.id, state.lang === "en" ? ex.titleEn : ex.title)).join("")
      : pack
      ? chip("all", t("all")) +
        pack.sheets.map((s, i) => chip(s.id, `${t("sheet", i + 1)} · ${state.lang === "en" ? s.titleEn : s.title}`)).join("")
      : "";
  }

  function renderPages() {
    const pages = $("#wsPages");
    if (exerciseMode) {
      renderExercisePages();
      return;
    }
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
    $("#wsDownload").addEventListener("click", downloadPdf);
    window.addEventListener("resize", fitPages);
  }

  bind();
  render();
  // The page breaks depend on the text's real size.
  if (exerciseMode) document.fonts?.ready.then(renderPages);
})();
