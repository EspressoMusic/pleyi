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
    const lines = String(text || "")
      .split(/\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    const items = [];
    const seen = new Set();

    for (const line of lines) {
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

  window.LEARNING_PARSE = {
    parseLearningContent,
    formatLearningContent,
    normalizeLearningContent,
  };
})();
