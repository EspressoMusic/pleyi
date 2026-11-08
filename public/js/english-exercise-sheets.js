/* Learn English — the site's practice exercises as printable sheets, so a
   student without a phone can do the same exercise on paper.

   Used by english-worksheet.js (/services/english-worksheet?topic=<id>
   &exercise=<id>), which lays the rows out on A4 pages. Unlike
   english-printables.js nothing is written here: the rows come from the
   exercise's own questions, with their Hebrew translations.

   build(exercise) → { title, titleEn, instructions, instructionsEn, type, rows }
   rows: HTML strings, numbered, each kept whole on one page. Every answer is
   already in the row (.ws-ans, .is-answer) and only shows in the answer key,
   so the student copy and the key share one layout.

   Mixed-up options are shuffled from the question's own text: each copy of a
   sheet, and its answer key, comes out the same. */

(function () {
  // The instructions on the site say "click"; on paper they say what to do
  // with a pencil. [English, Hebrew]
  const PAPER = {
    truefalse: ["Is the sentence written correctly? Circle.", "האם המשפט כתוב נכון? הקיפו: נכון או לא נכון."],
    choice: ["Circle the right word.", "הקיפו את המילה הנכונה."],
    write: ["Write the missing word on the line.", "כתבו את המילה החסרה על הקו."],
    order: ["Put the words in order and write the sentence.", "סדרו את המילים וכתבו את המשפט על הקו."],
    match: ["Draw a line between each pair.", "חברו בקו כל זוג שמתאים."],
    "find-error": ["Circle the wrong word in each sentence.", "בכל משפט יש טעות אחת. הקיפו את המילה שלא נכונה."],
    "sentence-choice": ["Circle the sentence that is written correctly.", "הקיפו את המשפט שכתוב נכון."],
    letters: ["Use the letters to write the missing word. Some letters are extra!", "כתבו את המילה החסרה בעזרת האותיות. יש גם אותיות מיותרות!"],
    dictation: ["Listen and write the sentence on the line.", "המורה או ההורה מקריאים כל משפט. כתבו אותו על הקו."],
  };

  const TRUE_LABEL = "נכון";
  const FALSE_LABEL = "לא נכון";

  function esc(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function mixed(list, seed) {
    let h = 2166136261;
    for (const ch of String(seed)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
    const next = () => (h = (Math.imul(h, 1664525) + 1013904223) >>> 0) / 2 ** 32;
    const out = [...list];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    // Never hand out the answer already in order.
    if (out.length > 1 && out.every((v, i) => v === list[i])) out.push(out.shift());
    return out;
  }

  const num = (i) => `<span class="wx-num">${i + 1}.</span>`;

  function heHtml(q) {
    const he = q.he || q.context || q.hint;
    return he ? `<p class="wx-he" dir="rtl">${esc(he)}</p>` : "";
  }

  function blankHtml(answer) {
    return `<span class="ws-blank" style="--w:${String(answer).length + 6}ch"><span class="ws-ans">${esc(answer)}</span></span>`;
  }

  function withBlank(text, blank) {
    const [before, after = ""] = String(text).split("___");
    return `${esc(before)}${blank}${esc(after)}`;
  }

  function optsHtml(options, answer) {
    return `<div class="wx-opts">${options
      .map((opt) => `<span class="ws-opt${opt === answer ? " is-answer" : ""}">${esc(opt)}</span>`)
      .join("")}</div>`;
  }

  // The sentence and its translation, with whatever the student marks on the side.
  function sideRow(i, sentence, q, side) {
    return `
      <li class="wx-row wx-row--side">
        ${num(i)}
        <div class="wx-body"><p class="wx-en">${sentence}</p>${heHtml(q)}</div>
        ${side}
      </li>`;
  }

  // A prompt line and a whole line to write on under it.
  function lineRow(i, prompt, answer) {
    return `
      <li class="wx-row wx-row--line">
        ${num(i)}
        <div class="wx-body">
          <div class="wx-prompt">${prompt}</div>
          <span class="ws-line"><span class="ws-ans">${esc(answer)}</span></span>
        </div>
      </li>`;
  }

  // One block for the whole board, so its lines stay together on one page.
  // Each right-hand item stands on a row of its own, and the answer key draws
  // the lines from the rows' numbers.
  function matchRows(ex) {
    const right = mixed(ex.pairs.map((p) => p.b), ex.id);
    const n = ex.pairs.length;
    const lines = ex.pairs
      .map((p, i) => `<line x1="0" y1="${i + 0.5}" x2="100" y2="${right.indexOf(p.b) + 0.5}" stroke="#e03131" stroke-width="2.5" vector-effect="non-scaling-stroke"/>`)
      .join("");
    const cell = (text, side, i) =>
      `<span class="wx-match-cell wx-match-cell--${side}" style="grid-row:${i + 1}">${side === "a" ? num(i) : ""}<b>${esc(text)}</b><i></i></span>`;
    return [
      `<li class="wx-row wx-match" style="--n:${n}">
        ${ex.pairs.map((p, i) => cell(p.a, "a", i)).join("")}
        <svg class="wx-match-lines" viewBox="0 0 100 ${n}" preserveAspectRatio="none" aria-hidden="true">${lines}</svg>
        ${right.map((text, i) => cell(text, "b", i)).join("")}
      </li>`,
    ];
  }

  const ROWS = {
    truefalse: (ex) =>
      ex.questions.map((q, i) => {
        const fix = !q.correct && q.fix ? `<span class="ws-ans wx-fix"> → ${esc(q.fix)}</span>` : "";
        return sideRow(i, `${esc(q.text)}${fix}`, q, optsHtml([TRUE_LABEL, FALSE_LABEL], q.correct ? TRUE_LABEL : FALSE_LABEL));
      }),

    choice: (ex) => ex.questions.map((q, i) => sideRow(i, withBlank(q.text, blankHtml(q.answer)), q, optsHtml(q.options || ex.options, q.answer))),

    write: (ex) => ex.questions.map((q, i) => sideRow(i, withBlank(q.text, blankHtml(q.answer)), q, "")),

    order: (ex) =>
      ex.questions.map((q, i) => {
        const words = mixed(q.answer.split(" "), q.answer);
        return lineRow(i, `<span class="ws-words">${words.map((w) => `<span class="ws-word">${esc(w)}</span>`).join("")}</span>${heHtml(q)}`, q.answer);
      }),

    match: matchRows,

    // Every word looks the same, so the student copy doesn't point at the mistake.
    "find-error": (ex) =>
      ex.questions.map((q, i) => {
        const words = q.text
          .split(" ")
          .map((w, n) => `<span class="ws-opt wx-word${n >= q.from && n < q.to ? " is-answer" : ""}">${esc(w)}</span>`)
          .join("");
        return sideRow(i, `${words}<span class="ws-ans wx-fix"> → ${esc(q.fix)}</span>`, q, "");
      }),

    // Three sentences for each question: two questions share a row.
    "sentence-choice": (ex) => {
      const cards = ex.questions.map(
        (q, i) => `
          <div class="wx-choice">
            <div class="wx-choice-head">${num(i)}${heHtml(q)}</div>
            ${mixed(q.options, q.answer)
              .map((opt) => `<span class="wx-choice-opt"><span class="ws-opt${opt === q.answer ? " is-answer" : ""}">${esc(opt)}</span></span>`)
              .join("")}
          </div>`
      );
      const rows = [];
      for (let i = 0; i < cards.length; i += 2) rows.push(`<li class="wx-row wx-row--pair">${cards[i]}${cards[i + 1] || ""}</li>`);
      return rows;
    },

    letters: (ex) =>
      ex.questions.map((q, i) => {
        const letters = mixed([...q.answer, ...(q.extra || [])], q.text);
        return sideRow(i, withBlank(q.text, blankHtml(q.answer)), q, `<div class="ws-words wx-letters">${letters.map((l) => `<span class="ws-word">${esc(l)}</span>`).join("")}</div>`);
      }),

    dictation: (ex) => ex.questions.map((q, i) => lineRow(i, heHtml(q), q.answer)),
  };

  window.EnglishExerciseSheets = {
    // The topics whose exercises print for now: one, until the sheets are approved.
    topics: ["tobe"],

    // A topic's exercises that have a paper form, easiest first.
    forTopic(topic) {
      if (!topic || !this.topics.includes(topic.id)) return [];
      return (topic.exercises || [])
        .filter((ex) => ROWS[ex.type] && (ex.type !== "match" || ex.pairs))
        .sort((a, b) => (a.level || 1) - (b.level || 1));
    },

    build(ex) {
      const [instructionsEn, instructions] = PAPER[ex.type];
      const titleEn = String(ex.titleEn).replace(/^Type\b/, "Write");
      return { title: ex.title, titleEn, instructions, instructionsEn, type: ex.type, rows: ROWS[ex.type](ex) };
    },
  };
})();
