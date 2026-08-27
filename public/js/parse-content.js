/* Client-side learning material parser (mirrors lib/parse-content.js) */

(function () {
  function hasHebrew(text) {
    return /[\u0590-\u05FF]/.test(text);
  }

  function hasLatin(text) {
    return /[a-zA-Z]/.test(text);
  }

  function normalizeLabel(text) {
    return String(text || "")
      .replace(/[:：.…,;]+$/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  const SKIP_LABELS = new Set(
    [
      "חומר לימודי",
      "חומר לימוד",
      "learning material",
      "למשפטים",
      "למילים",
      "מילים",
      "מילון",
      "אוצר מילים",
      "נושא",
      "שם המשחק",
      "תוכן",
      "תוכן השיעור",
      "דוגמה",
      "דוגמא",
      "הערות",
      "example",
      "vocabulary",
      "words",
      "שמור חומר לימודי",
      "הכנת שיעור",
      "הוסף / ערוך חומר לימודי",
    ].map(normalizeLabel)
  );

  function isSkippedLabel(text) {
    return SKIP_LABELS.has(normalizeLabel(text));
  }

  function stripLinePrefix(line) {
    return String(line || "")
      .replace(/^[\s•·●◦▪▫\-*–—]+/, "")
      .replace(/^\d+[\.\)\]:]\s*/, "")
      .trim();
  }

  function isHeaderLine(line) {
    const cleaned = stripLinePrefix(line);
    if (!cleaned) return true;
    if (isSkippedLabel(cleaned)) return true;
    if (/^[\u0590-\u05FFa-zA-Z0-9\s'"״׳\-–—]{2,48}[:：]\s*$/.test(cleaned)) return true;
    return false;
  }

  function splitPairLine(line) {
    const cleaned = stripLinePrefix(line);
    if (!cleaned || isHeaderLine(cleaned)) return null;

    const parenMatch = cleaned.match(/^(.+?)\s*[\(\[]\s*(.+?)\s*[\)\]]\s*$/);
    if (parenMatch) return [parenMatch[1].trim(), parenMatch[2].trim()];

    if (cleaned.includes("\t")) {
      const parts = cleaned.split("\t").map((s) => s.trim()).filter(Boolean);
      if (parts.length >= 2) return [parts[0], parts.slice(1).join(" ")];
    }

    if (cleaned.includes("=")) {
      const eqIdx = cleaned.lastIndexOf("=");
      if (eqIdx > 0) {
        const left = cleaned.slice(0, eqIdx).trim();
        const right = cleaned.slice(eqIdx + 1).trim();
        if (left && right) return [left, right];
      }
    }

    for (const sep of [" - ", " – ", " — ", " | ", "|", ";"]) {
      if (!cleaned.includes(sep)) continue;
      const parts = cleaned.split(sep).map((s) => s.trim()).filter(Boolean);
      if (parts.length === 2) return parts;
    }

    if (cleaned.includes(":") || cleaned.includes("：")) {
      const colon = cleaned.includes(":") ? ":" : "：";
      const parts = cleaned.split(colon).map((s) => s.trim()).filter(Boolean);
      if (parts.length === 2 && !isSkippedLabel(parts[0])) return parts;
    }

    const commaParts = cleaned.split(",").map((s) => s.trim()).filter(Boolean);
    if (commaParts.length === 2) return commaParts;

    const spaced = cleaned.match(/^(.+?)\s{2,}(.+)$/);
    if (spaced) return [spaced[1].trim(), spaced[2].trim()];

    return null;
  }

  /* Multiple-choice question blocks — "question, then 2-8 answer lines" paragraphs,
     used to auto-build trivia (vocabulary-duel) questions from pasted quiz text. */

  const ANSWER_LINE_RE = /^(?:תשובה|נכון|answer|correct)\s*[:\-–]?\s*([A-Da-dא-ד1-4])\s*[.\)]?$/i;

  const LETTER_TO_INDEX = {
    a: 0, b: 1, c: 2, d: 3,
    "א": 0, "ב": 1, "ג": 2, "ד": 3,
    "1": 0, "2": 1, "3": 2, "4": 3,
  };

  function letterToIndex(ch) {
    const key = String(ch || "").toLowerCase();
    return key in LETTER_TO_INDEX ? LETTER_TO_INDEX[key] : null;
  }

  function stripOptionPrefix(text) {
    return String(text || "")
      .replace(/^[\s•·●◦▪▫\-–—]+/, "")
      .replace(/^(?:[A-Za-z]|[א-ת])[\.\)\]:]\s*/, "")
      .replace(/^\d+[\.\)\]:]\s*/, "")
      .trim();
  }

  function extractCorrectMarker(line) {
    let text = String(line || "").trim();
    let isCorrect = false;

    const trailingRe = /\s*(?:\(\s*(?:correct|נכון)\s*\)|[*✓✔])\s*$/i;
    if (trailingRe.test(text)) {
      isCorrect = true;
      text = text.replace(trailingRe, "").trim();
    }

    const leadingRe = /^[*✓✔]\s*/;
    if (leadingRe.test(text)) {
      isCorrect = true;
      text = text.replace(leadingRe, "").trim();
    }

    return { text, isCorrect };
  }

  function groupParagraphs(text) {
    const rawLines = String(text || "").split(/\r?\n/);
    const paragraphs = [];
    let current = [];
    for (const raw of rawLines) {
      const trimmed = raw.trim();
      if (!trimmed) {
        if (current.length) paragraphs.push(current);
        current = [];
      } else {
        current.push(trimmed);
      }
    }
    if (current.length) paragraphs.push(current);
    return paragraphs;
  }

  function matchingPairRatio(lines) {
    if (!lines.length) return 0;
    const matches = lines.filter((line) => !isHeaderLine(line) && splitPairLine(line)).length;
    return matches / lines.length;
  }

  function isLikelyQuestionBlock(paragraph) {
    if (paragraph.length < 3 || paragraph.length > 9) return false;
    if (!/[?？]\s*$/.test(paragraph[0])) return false;
    const longOptions = paragraph.slice(1).filter((l) => l.length > 60).length;
    if (longOptions > 1) return false;
    return matchingPairRatio(paragraph) < 0.5;
  }

  function buildQuestionItem(paragraphLines, subject) {
    const question = stripLinePrefix(paragraphLines[0]);
    if (!question) return null;

    let answerFromLine = null;
    const rawOptionLines = [];
    for (const raw of paragraphLines.slice(1)) {
      const m = raw.trim().match(ANSWER_LINE_RE);
      if (m) {
        answerFromLine = letterToIndex(m[1]);
        continue;
      }
      rawOptionLines.push(raw);
    }

    const parsedOptions = rawOptionLines
      .map((raw) => {
        const { text: marked, isCorrect } = extractCorrectMarker(raw);
        return { text: stripOptionPrefix(marked), isCorrect };
      })
      .filter((o) => o.text);

    if (parsedOptions.length < 2 || parsedOptions.length > 8) return null;

    let correctIndex = parsedOptions.findIndex((o) => o.isCorrect);
    if (correctIndex === -1) {
      correctIndex = answerFromLine != null && answerFromLine < parsedOptions.length ? answerFromLine : 0;
    }

    const correct = parsedOptions[correctIndex]?.text;
    if (!correct) return null;

    return {
      en: question,
      he: correct,
      options: parsedOptions.map((o) => o.text),
      hint: "",
      emoji: itemEmoji(subject),
    };
  }

  function isValidLearningPair(left, right, subject) {
    if (!left || !right || left === right) return false;
    if (isSkippedLabel(left) || isSkippedLabel(right)) return false;

    const leftHe = hasHebrew(left);
    const rightHe = hasHebrew(right);
    const leftEn = hasLatin(left);
    const rightEn = hasLatin(right);

    if (subject === "math") {
      return /[\d+\-*/()]/.test(left) && /[\d]/.test(right);
    }

    if (subject === "english") {
      if (leftEn && rightHe && !rightEn) return true;
      if (rightEn && leftHe && !leftEn) return true;
      if (leftEn && rightHe && rightEn) return true;
      if (rightEn && leftHe && leftEn) return true;
      if (leftHe && rightHe && !leftEn && !rightEn) return false;
      if (leftEn && rightEn && !leftHe && !rightHe) return false;
      return false;
    }

    if (subject === "lifeskills" || subject === "science") {
      if (leftHe && rightHe) return !isSkippedLabel(left) && !isSkippedLabel(right);
      return (leftEn && rightHe) || (rightEn && leftHe);
    }

    return (leftEn && rightHe) || (rightEn && leftHe);
  }

  function assignPairSides(left, right, subject) {
    if (subject === "math") return { en: left, he: right };

    const leftHe = hasHebrew(left);
    const rightHe = hasHebrew(right);
    const leftEn = hasLatin(left);
    const rightEn = hasLatin(right);

    if (leftHe && rightEn && !leftEn) return { en: right, he: left };
    if (rightHe && leftEn && !rightEn) return { en: left, he: right };
    if (subject === "lifeskills" || subject === "science") {
      if (leftHe && rightHe && !leftEn && !rightEn) return { en: left, he: right };
    }
    return { en: left, he: right };
  }

  function itemHint(en, subject) {
    if (subject === "math") return "פתרו את התרגיל";
    if (subject === "lifeskills") return `מה המשמעות של ${en}?`;
    if (subject === "science") return `מה ההגדרה של ${en}?`;
    if (String(en).includes(" ")) return `סדרו: ${en}`;
    return `What is ${en}?`;
  }

  function itemEmoji(subject) {
    if (subject === "math") return "🔢";
    if (subject === "lifeskills") return "🌱";
    if (subject === "science") return "🔬";
    return "📖";
  }

  function parseLearningContent(text, subject = "english") {
    const paragraphs = groupParagraphs(text);
    const items = [];
    const seen = new Set();

    for (const paragraph of paragraphs) {
      if (isLikelyQuestionBlock(paragraph)) {
        const q = buildQuestionItem(paragraph, subject);
        if (q) {
          const key = `Q\0${q.en}`;
          if (!seen.has(key)) {
            seen.add(key);
            items.push(q);
          }
          continue;
        }
      }

      for (const line of paragraph) {
        if (isHeaderLine(line)) continue;
        const pair = splitPairLine(line);
        if (!pair) continue;
        const [left, right] = pair;
        if (!isValidLearningPair(left, right, subject)) continue;

        const { en, he } = assignPairSides(left, right, subject);
        const key = `${en}\0${he}`;
        if (seen.has(key)) continue;
        seen.add(key);

        items.push({
          en,
          he,
          hint: itemHint(en, subject),
          emoji: itemEmoji(subject),
        });
      }
    }

    return items;
  }

  function formatLearningContent(items) {
    return items.map((item) => `${item.en}=${item.he}`).join("\n");
  }

  function normalizeLearningContent(text, subject = "english") {
    const items = parseLearningContent(text, subject);
    return {
      items,
      normalized: formatLearningContent(items),
    };
  }

  // A real word=translation / exercise=answer list is made almost entirely of
  // pair lines. A pasted article or an uploaded worksheet is mostly prose,
  // instructions, and questions — a couple of lines may accidentally parse as
  // a "pair" (e.g. "שאלה 1: What is your name?"), but that's noise, not
  // content. Require most lines to be real pairs before treating the text as
  // ready to use as-is, otherwise it should go through the AI.
  // A question block collapses many lines into one item, so it can't be judged
  // by the same per-line ratio as plain pairs — it counts as one matched unit
  // out of one attempted unit when it parses successfully.
  function looksLikeReadyPairs(text, subject = "english") {
    const paragraphs = groupParagraphs(text);
    if (!paragraphs.length) return false;

    let totalUnits = 0;
    let matchedUnits = 0;
    let itemCount = 0;

    for (const paragraph of paragraphs) {
      if (isLikelyQuestionBlock(paragraph)) {
        totalUnits += 1;
        if (buildQuestionItem(paragraph, subject)) {
          matchedUnits += 1;
          itemCount += 1;
        }
        continue;
      }
      totalUnits += paragraph.length;
      const matched = paragraph.filter((line) => !isHeaderLine(line) && splitPairLine(line)).length;
      matchedUnits += matched;
      itemCount += matched;
    }

    if (itemCount < 2) return false;
    return matchedUnits / totalUnits >= 0.6;
  }

  window.LEARNING_PARSE = {
    parseLearningContent,
    formatLearningContent,
    normalizeLearningContent,
    looksLikeReadyPairs,
    itemHint,
    itemEmoji,
  };
})();
