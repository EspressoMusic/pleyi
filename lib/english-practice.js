const fs = require("fs");
const path = require("path");
const vm = require("vm");
const crypto = require("crypto");
const { getFirestore } = require("./firebase-admin");

/**
 * "Create new exercises" on the Learn English page: when a student finishes
 * an exercise and wants more of the same, the AI writes new items in that
 * exercise's own format, a second blind pass solves them and drops every item
 * whose answer doesn't come out the same, and what survives is kept in a
 * shared bank — so the next student who asks gets them at once.
 *
 * The exercises themselves are read from the page's data files
 * (public/js/english-*.js), so the client only sends ids, never content.
 *
 * Bank storage: Firestore (`englishPractice/{topic__exercise}`) when a
 * service account is configured, otherwise data/english-practice.json —
 * same split as lib/student-progress.js.
 */

const PUBLIC_JS = path.join(__dirname, "..", "public", "js");
const DATA_FILES = ["english-vocab.js", "english-data.js", "english-reading.js"];
const BANK_FILE = path.join(__dirname, "..", "data", "english-practice.json");
const COLLECTION = "englishPractice";

const BANK_CAP = { reading: 40, default: 300 };
const SEEN_CAP = 600;
const JOBS_PER_IP_HOUR = 40;
const JOBS_PER_DAY = Number(process.env.ENGLISH_AI_DAILY_JOBS) || 400;
const CALL_TIMEOUT_MS = 120000;

/* ── Exercise data (the same files the page loads) ── */

let catalog = null;
let catalogStamp = "";

function loadCatalog() {
  const stamp = DATA_FILES.map((f) => fs.statSync(path.join(PUBLIC_JS, f)).mtimeMs).join("|");
  if (catalog && stamp === catalogStamp) return catalog;
  const sandbox = { window: {} };
  sandbox.window.window = sandbox.window;
  vm.createContext(sandbox);
  DATA_FILES.forEach((file) => {
    vm.runInContext(fs.readFileSync(path.join(PUBLIC_JS, file), "utf8"), sandbox, { filename: file });
  });
  catalog = { topics: sandbox.window.ENGLISH_TOPICS || [], vocab: sandbox.window.ENGLISH_VOCAB || {} };
  catalogStamp = stamp;
  return catalog;
}

function findExercise(topicId, exerciseId) {
  const { topics, vocab } = loadCatalog();
  const topic = topics.find((t) => t.id === topicId);
  const ex = topic?.exercises?.find((e) => e.id === exerciseId);
  return ex ? { topic, ex, vocab } : null;
}

// What kind of item an exercise is made of.
function formatOf(ex) {
  if (ex.type === "reading") return "reading";
  if (ex.words) return "word";
  if (ex.type === "match") return "pair";
  if (ex.type === "choice") return ex.options ? "choice-shared" : "choice";
  return ex.type; // truefalse, write, order
}

function roundSize(ex, format) {
  if (format === "reading") return 1;
  if (ex.type === "match") return format === "word" ? 4 : ex.boardSize || 6;
  return ex.roundSize || 10;
}

function originals(ex, vocab) {
  if (ex.type === "reading") return [{ passage: ex.passage, questions: ex.questions }];
  if (ex.words) return ex.words.map((id) => ({ word: id, en: vocab[id]?.en || id }));
  return ex.pairs || ex.questions || [];
}

/* ── Keys: one signature per item, used to skip repeats ── */

function plain(str) {
  return String(str ?? "")
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/[^a-z0-9'_֐-׿]+/g, " ")
    .trim();
}

function signature(format, item) {
  switch (format) {
    case "reading":
      return `read:${plain(item.passage?.title)}`;
    case "word":
      return `word:${item.word}:${plain(item.text)}`;
    case "pair":
      return `pair:${plain(item.a)}`;
    case "order":
      return `order:${plain(item.answer)}`;
    default:
      return `${format}:${plain(item.text)}`;
  }
}

function hashKey(sig) {
  return `n${crypto.createHash("sha1").update(sig).digest("hex").slice(0, 11)}`;
}

/* ── Checks shared with the page (english-learning.js) ── */

function normalize(str) {
  return String(str || "")
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/\s+/g, " ")
    .replace(/[.!?]+$/, "")
    .trim();
}

function keywordHit(text, key) {
  if (!key) return false;
  if (/^[a-z0-9]/.test(key)) {
    return new RegExp(`(^|[^a-z0-9'])${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(text);
  }
  return text.includes(key);
}

function openIsRight(keywords, given) {
  const text = normalize(given);
  return keywords.every((group) => group.some((key) => keywordHit(text, normalize(key))));
}

/* ── Content rules: anything that slips past the prompt is dropped here ── */

const FEMALE_NAMES = [
  "Anna", "Ann", "Anne", "Annie", "Mia", "Sarah", "Sara", "Noa", "Dana", "Maya", "Lily", "Lilly", "Emma", "Olivia",
  "Sophie", "Sophia", "Ella", "Emily", "Lucy", "Kate", "Katie", "Mary", "Lisa", "Amy", "Chloe", "Zoe", "Hannah",
  "Chana", "Rachel", "Leah", "Lea", "Rivka", "Rebecca", "Esther", "Miriam", "Tamar", "Yael", "Shira", "Michal",
  "Avigail", "Abigail", "Ruth", "Rina", "Tali", "Noga", "Efrat", "Ayelet", "Hila", "Liat", "Keren", "Yaara",
  "Maayan", "Jessica", "Jennifer", "Linda", "Susan", "Nancy", "Betty", "Helen", "Alice", "Ellie", "Ava", "Isabella",
  "Mila", "Nora", "Jane", "Julia", "Laura", "Sally", "Molly", "Polly", "Nina", "Tina", "Eva", "Beth", "Bella",
  "Clara", "Diana", "Elena", "Fiona", "Gina", "Jenny", "Kelly", "Lola", "Megan", "Paula", "Rita", "Sue", "Wendy",
  "Batya", "Dina", "Naomi", "Orly", "Shoshana", "Sigal", "Yafa", "Galit", "Merav", "Inbal", "Neta", "Talia",
];
const FEMALE_NAME_RE = new RegExp(`\\b(${FEMALE_NAMES.join("|")})\\b`);
const BANNED_RE =
  /\b(girlfriends?|boyfriends?|kiss\w*|romanc\w*|romantic|crush(es)?|in love|dating|valentine\w*|sweetheart|flirt\w*|christmas|xmas|easter|halloween|santa|pork|bacon|ham|shrimps?|lobsters?|cheeseburgers?|beer|vodka|church\w*|guns?|kill\w*|blood\w*)\b/i;

function textOf(value) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(textOf).join(" ");
  if (value && typeof value === "object") return Object.values(value).map(textOf).join(" ");
  return "";
}

function breaksRules(item) {
  const text = textOf(item);
  return FEMALE_NAME_RE.test(text) || BANNED_RE.test(text);
}

/* ── Prompts ── */

const SYSTEM = `You write practice material for an English-learning website for Israeli school children (native Hebrew speakers, about ages 8-14). Your English is simple, natural and 100% correct (American spelling). Your Hebrew is natural and correct.

Content rules — every item must follow them:
- Characters are mostly boys, men, animals and objects. Use only boys' and men's names (for example Dan, Omer, Yossi, Noam, Ari, Ben, Tom, Eitan, David, Avi, Uri, Gil, Itai, Roy). Never give a girl or a woman a name. "she", "mom", "sister" and "grandma" may appear when the grammar needs them.
- No romance of any kind: no love stories, crushes, dating or kissing.
- Holidays and customs, when they come up, are Jewish ones (Shabbat, Rosh Hashanah, Sukkot, Hanukkah, Purim, Pesach). Never Christmas, Easter, Halloween or Valentine's Day. No pork, ham, bacon or seafood, and no meat together with milk.
- Nothing scary, violent, rude or sad. Everyday kids' life: school, home, family, friends, food, animals, sports, nature, trips, hobbies.
- Every item must be new: never repeat or lightly reword an item you are shown.

Return only valid JSON.`;

const VERIFY_SYSTEM = `You are a careful English teacher in Israel checking exercises for children before they are published. Solve every item yourself, honestly and independently. Return only valid JSON.`;

// The Hebrew translation keeps a ___ only where the Hebrew word would give
// the answer away — the exercise's own items show whether that ever happens.
function heNote(format, own) {
  if (format === "order") return `"he": the Hebrew translation of the whole sentence, with no blanks — the student builds the English sentence from it.`;
  if (format === "word") return `"he": the Hebrew translation of the sentence, with ___ in the place of the practice word.`;
  const fixNote = format === "truefalse" ? " For a wrong item, translate the intended (corrected) meaning." : "";
  return own.some((it) => String(it.he || "").includes("___"))
    ? `"he": a natural Hebrew translation. Keep a ___ blank in the Hebrew only where translating the tested word would give the answer away, exactly as the examples do; otherwise translate the whole sentence.${fixNote}`
    : `"he": a natural Hebrew translation of the whole sentence, with no blanks, like the examples.${fixNote}`;
}

const FIELD_NOTES = {
  hint: `"hint": a short hint in parentheses, used the same way as in the examples.`,
  context: `"context": the Hebrew word shown under the item, used the same way as in the examples.`,
  say: `"say": how the whole English word sounds, written in Hebrew letters with niqqud the way an Israeli student would read it, like the examples.`,
  accept: `"accept": a list of other fully correct answers (for example a contraction), only when there are any.`,
  fix: `"fix": for a wrong item, the same text corrected.`,
};

function sample(list, n) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, n);
}

// Optional fields an exercise's own items use — new items use the same ones.
function usedFields(items, fields) {
  return fields.filter((f) => items.some((item) => item[f] !== undefined && item[f] !== ""));
}

const OPTIONAL = {
  "choice-shared": ["he", "hint", "context", "say"],
  choice: ["he", "hint", "context", "say"],
  truefalse: ["he", "fix"],
  write: ["he", "hint", "accept"],
  order: ["he"],
  pair: [],
  word: ["he"],
};

function itemCount(ex, format) {
  if (format === "word") return Math.min(16, Math.max(8, ex.words.length + 4));
  if (format === "pair") return Math.max(8, (ex.boardSize || 6) + 3);
  if (format === "order") return 12;
  return 14;
}

function header(topic, ex) {
  return [
    `Topic: ${topic.titleEn} (${topic.title})${topic.lessonSummaryEn ? ` — ${topic.lessonSummaryEn}` : ""}`,
    `Exercise: ${ex.titleEn || ex.title}`,
    `Instructions the student sees: ${ex.instructionsEn || ""} (Hebrew: ${ex.instructions || ""})`,
  ].join("\n");
}

function formatRules(format, ex, vocab) {
  switch (format) {
    case "choice-shared":
      return [
        `Each item: {"text": ..., "answer": ...} plus the optional fields below.`,
        `"text" has exactly one ___ blank, like the examples.`,
        `The answer buttons are always: ${ex.options.map((o) => JSON.stringify(o)).join(", ")}. "answer" is one of them, and exactly ONE of them may correctly fill the blank — every other button must be clearly wrong.`,
        `Spread the answers over all the buttons.`,
      ];
    case "choice":
      return [
        `Each item: {"text": ..., "options": [...], "answer": ...} plus the optional fields below.`,
        `"text" has exactly one ___ blank, like the examples. "options" has the same number of choices as the examples; "answer" is one of them, and exactly ONE option may correctly fill the blank — the others must be clearly wrong.`,
      ];
    case "truefalse":
      return [
        `Each item: {"text": ..., "correct": true or false} plus the optional fields below.`,
        `"correct" answers the exercise's question for that text. About half the items are correct and half are wrong; a wrong item has exactly one clear mistake of the kind this exercise practices.`,
      ];
    case "write":
      return [
        `Each item: {"text": ..., "answer": ...} plus the optional fields below.`,
        `"text" has exactly one ___ blank. "answer" is exactly what the student types into it, and it must be the only correct answer (list real alternatives in "accept").`,
      ];
    case "order":
      return [
        `Each item: {"answer": ...} plus the optional fields below.`,
        `"answer" is what the student builds from shuffled pieces, split on spaces — the same kind and length as the examples. The pieces must fit together in exactly ONE correct order: avoid time words or adverbs that could also go somewhere else.`,
      ];
    case "pair":
      return [
        `Each item: {"a": ..., "b": ...} — the same kind of pair as the examples.`,
        `Within your list every "a" is different and every "b" is different, and no "b" could also match another "a".`,
      ];
    case "word": {
      const words = ex.words.map((id) => `- ${id}: "${vocab[id]?.en || id}" (${vocab[id]?.he || ""})`).join("\n");
      return [
        `This exercise practices these words (picture words):\n${words}`,
        `Write short sentences that use them: each item is {"word": <word id from the list>, "text": ..., "he": ...}.`,
        `"text" is one simple sentence (4 to 10 words) with exactly one ___ blank, where the blank is exactly that English word as written in the list — same form, no plural, no other ending. Don't start the sentence with the blank.`,
        `The sentence must make clear what the word means, and it must not contain any other word from the list.`,
        `Use as many different words as you can, at most two sentences per word.`,
      ];
    }
    default:
      return [];
  }
}

// `lean`: fewer examples, for a second try after a network filter blocked
// the full request.
function itemPrompt({ topic, ex, vocab, format, avoid, count, lean = false }) {
  const own = originals(ex, vocab);
  const fields = format === "word" ? ["he"] : usedFields(own, OPTIONAL[format] || []);
  const examples = format === "word" ? [] : sample(own, lean ? 3 : 8);
  const lines = [
    header(topic, ex),
    "",
    "Format:",
    ...formatRules(format, ex, vocab).map((r) => `- ${r}`),
    ...(fields.length
      ? ["", "Optional fields (use them exactly like the examples):", ...fields.map((f) => `- ${f === "he" ? heNote(format, own) : FIELD_NOTES[f]}`)]
      : []),
    "",
    ...(examples.length ? ["Examples from this exercise (match their level, length and style):", ...examples.map((e) => JSON.stringify(e)), ""] : []),
    ...(avoid.length ? ["Already used — do not repeat or reword these:", ...avoid.map((a) => `- ${a}`), ""] : []),
    `Write ${count} NEW items. Return {"items": [...]}.`,
  ];
  return lines.join("\n");
}

function wordCount(paragraphs) {
  return paragraphs.join(" ").split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;
}

function readingPrompt({ topic, ex, avoid }) {
  const level = ex.level;
  const counts = { mc: 0, tf: 0, open: 0 };
  ex.questions.forEach((q) => counts[q.type]++);
  const mcOptions = ex.questions.find((q) => q.type === "mc")?.options?.length || (level <= 2 ? 3 : 4);
  const example = { passage: ex.passage, ...(ex.mark ? { mark: ex.mark } : {}), questions: ex.questions };
  const openRule =
    level <= 2
      ? `{"type": "open", "lang": "he", "q": <question in Hebrew>, "qEn": <the same question in English>, "answer": <short sample answer in Hebrew>, "answerEn": <the same in English>, "keywords": [[...], ...]}`
      : `{"type": "open", "lang": "en", "q": <question in English>, "he": <the same question in Hebrew>, "answer": <short sample answer in English>, "keywords": [[...], ...]}`;
  const lines = [
    `Topic: ${topic.titleEn} (${topic.title})${topic.lessonSummaryEn ? ` — ${topic.lessonSummaryEn}` : ""}`,
    `Write ONE new reading passage ("unseen") for level ${level} of 4 (1 is the easiest). Match the example's level: about ${wordCount(ex.passage.text)} words in ${ex.passage.text.length} paragraphs, the same kind of vocabulary and sentences.`,
    `Tell a new, different everyday story with a new title.`,
    ex.mark
      ? `Marking stage — the student will do this: "${ex.mark.textEn}"${ex.mark.hint ? ` (${ex.mark.hint})` : ""}. Use these target words many times (at least 8). In "text", put EVERY occurrence of a word or phrase the student must mark in [square brackets] — every single one, and nothing else in brackets. Any unbracketed word that a student could reasonably think fits the instruction would be graded as a wrong click, so don't use such words at all: ${ex.mark.hint ? `if the hint lists the forms (${ex.mark.hint}), use only those forms — not other words of the same kind (for example no was / were when the hint is am · is · are)` : "keep every word of that kind bracketed"}.`
      : `No marking stage: no square brackets anywhere in the text.`,
    `Questions follow the order of the text: ${counts.mc} multiple choice, ${counts.tf} true/false and ${counts.open} open, like the example:`,
    `- {"type": "mc", "q": ..., "he": <Hebrew translation of q>, "options": [${mcOptions} options], "optionsHe": [the same options in Hebrew, in the same order], "answer": <exactly one of the options>} — only one option is right according to the text.`,
    `- {"type": "tf", "q": <a statement>, "he": <Hebrew translation>, "answer": true or false} — clearly true or clearly false according to the text.`,
    `- ${openRule}`,
    `  "keywords" are groups of words: an answer counts as right when it contains one word from every group. English keywords match the start of a word ("play" matches "played"); ${level <= 2 ? `put Hebrew forms (without prefixes like ה, ב, ו) and English words in each group. ` : ""}The sample answer must contain a word from every group.`,
    ex.passage.glossary?.length ? `"glossary": 3-5 harder words from the text, [{"en": ..., "he": ...}].` : `"glossary": null.`,
    `"words": the Hebrew meaning, as used in this text, of every noun, verb, adjective and adverb in the text, written exactly as it appears there but in lowercase ({"woke": "התעורר", "puppies": "גורים"}); a phrasal verb or a fixed phrase as one entry ("wakes up", "a lot of"). Leave out names and small words like a, the, and, is.`,
    "",
    "The example (the same level and topic):",
    JSON.stringify(example),
    "",
    ...(avoid.length ? ["Titles already used — write a different story:", ...avoid.map((a) => `- ${a}`), ""] : []),
    `Return {"passage": {"title": ..., "text": [paragraphs], "glossary": ..., "words": {...}}, "questions": [...]}.`,
  ];
  return lines.join("\n");
}

/* ── Model calls ── */

// Each Gemini model has its own rate limits (on the free tier: a few calls a
// minute and 20 a day), so the fallbacks add capacity as well as covering a
// model that is busy.
const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-3.5-flash", "gemini-flash-latest", "gemini-3-flash-preview", "gemini-flash-lite-latest"];
const OPENAI_MODELS = ["gpt-4.1-mini", "gpt-4o-mini"];

// OpenAI first (a paid key, with high limits); Gemini, when there is a key
// for it, only as a fallback.
function providers() {
  const list = [];
  if (process.env.OPENAI_API_KEY) {
    const models = [process.env.OPENAI_MODEL, ...OPENAI_MODELS].filter(Boolean);
    [...new Set(models)].forEach((model) => list.push({ kind: "openai", model }));
  }
  if (process.env.GEMINI_API_KEY) {
    const models = [process.env.ENGLISH_AI_MODEL, ...GEMINI_MODELS].filter(Boolean);
    [...new Set(models)].forEach((model) => list.push({ kind: "gemini", model }));
  }
  return list;
}

function isConfigured() {
  return providers().length > 0;
}

function parseJson(raw) {
  const text = String(raw || "").trim();
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch {
        /* reported below */
      }
    }
    throw new Error(`Unreadable AI response: ${text.slice(0, 160)}`);
  }
}

async function callGemini(model, system, prompt, temperature) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(CALL_TIMEOUT_MS),
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature, maxOutputTokens: 24576, responseMimeType: "application/json" },
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error?.message || `Gemini error (${res.status})`);
    err.status = res.status;
    const details = data?.error?.details || [];
    const delay = details.find((d) => d.retryDelay)?.retryDelay;
    if (delay) err.retryMs = Math.ceil(parseFloat(delay) * 1000);
    err.daily = details.some((d) => (d.violations || []).some((v) => /PerDay/i.test(v.quotaId || "")));
    throw err;
  }
  const candidate = data?.candidates?.[0];
  if (candidate?.finishReason && !["STOP", "MAX_TOKENS"].includes(candidate.finishReason)) {
    throw new Error(`Gemini stopped: ${candidate.finishReason}`);
  }
  return (candidate?.content?.parts || [])
    .filter((p) => !p.thought)
    .map((p) => p.text || "")
    .join("");
}

async function callOpenAI(model, system, prompt, temperature) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    signal: AbortSignal.timeout(CALL_TIMEOUT_MS),
    body: JSON.stringify({
      model,
      // Reasoning models (o-series, gpt-5) accept only their default temperature.
      ...(/^(o\d|gpt-5)/.test(model) ? {} : { temperature }),
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
    }),
  });
  const body = await res.text();
  // A filtering internet provider (e.g. a "kosher" filter) can answer in
  // OpenAI's place with its own block page.
  if (/^\s*</.test(body)) {
    const err = new Error("The request was blocked by a network filter (an HTML page came back instead of OpenAI's answer)");
    err.filtered = true;
    throw err;
  }
  let data = {};
  try {
    data = JSON.parse(body);
  } catch {
    /* handled below */
  }
  if (!res.ok) {
    const err = new Error(data?.error?.message || `OpenAI error (${res.status})`);
    err.status = res.status;
    // No credit left on the account: no point retrying soon.
    err.daily = data?.error?.code === "insufficient_quota";
    throw err;
  }
  return data?.choices?.[0]?.message?.content || "";
}

// At most two model calls at a time, so a burst of requests queues up
// instead of running into the per-minute limit all at once.
const MAX_CALLS = 2;
let activeCalls = 0;
const callQueue = [];

async function withCallSlot(fn) {
  if (activeCalls >= MAX_CALLS) await new Promise((resolve) => callQueue.push(resolve));
  activeCalls++;
  try {
    return await fn();
  } finally {
    activeCalls--;
    callQueue.shift()?.();
  }
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Models that are out of quota (or gone) are skipped until this time.
const resting = new Map();

function rest(p, err) {
  let ms = 10 * 60000;
  if (err.status === 429) ms = err.daily ? 3600000 : Math.max(err.retryMs || 0, 60000);
  else if (err.status === 401 || err.status === 403 || err.status === 404 || err.status === 400) ms = 6 * 3600000;
  resting.set(`${p.kind}/${p.model}`, Date.now() + ms);
}

// Tries each configured model in turn (a busy or failing one falls through).
// A model over its per-minute limit is retried once when the wait is short;
// one over its daily limit rests until the limit resets.
async function askModel(system, prompt, temperature) {
  let lastError = new Error("No AI provider is available right now");
  for (const p of providers()) {
    if ((resting.get(`${p.kind}/${p.model}`) || 0) > Date.now()) continue;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const raw = await withCallSlot(() =>
          p.kind === "gemini" ? callGemini(p.model, system, prompt, temperature) : callOpenAI(p.model, system, prompt, temperature)
        );
        return parseJson(raw);
      } catch (err) {
        lastError = err;
        console.warn(`[english-practice] ${p.kind}/${p.model} failed: ${err.message.split("\n")[0]}`);
        if (attempt === 0 && err.status === 429 && !err.daily && err.retryMs && err.retryMs <= 30000) {
          await wait(err.retryMs + 500);
          continue;
        }
        if (err.status && err.status !== 503 && err.status !== 500) rest(p, err);
        break;
      }
    }
  }
  throw lastError;
}

/* ── Cleaning the model's items ── */

const str = (value, max) => (typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "").slice(0, max);
const blanks = (text) => text.split("___").length - 1;

function cleanItem(format, raw, ex, vocab, fields) {
  if (!raw || typeof raw !== "object") return null;
  const item = {};
  const keep = (field, max) => {
    if (!fields.includes(field)) return;
    const val = str(raw[field], max);
    if (val) item[field] = val;
  };

  switch (format) {
    case "choice-shared": {
      item.text = str(raw.text, 160);
      item.answer = str(raw.answer, 60);
      if (blanks(item.text) !== 1 || !ex.options.includes(item.answer)) return null;
      ["he", "hint", "context", "say"].forEach((f) => keep(f, 160));
      break;
    }
    case "choice": {
      item.text = str(raw.text, 160);
      const options = Array.isArray(raw.options) ? raw.options.map((o) => str(o, 80)).filter(Boolean) : [];
      item.options = [...new Set(options)];
      item.answer = str(raw.answer, 80);
      if (blanks(item.text) !== 1 || item.options.length < 2 || item.options.length > 5 || !item.options.includes(item.answer)) return null;
      ["he", "hint", "context", "say"].forEach((f) => keep(f, 160));
      break;
    }
    case "truefalse": {
      item.text = str(raw.text, 180);
      if (!item.text || typeof raw.correct !== "boolean") return null;
      item.correct = raw.correct;
      keep("he", 180);
      if (!item.correct && fields.includes("fix")) {
        item.fix = str(raw.fix, 180);
        if (!item.fix || plain(item.fix) === plain(item.text)) return null;
      }
      break;
    }
    case "write": {
      item.text = str(raw.text, 160);
      item.answer = str(raw.answer, 50);
      if (blanks(item.text) !== 1 || !item.answer) return null;
      ["he", "hint"].forEach((f) => keep(f, 160));
      if (fields.includes("accept") && Array.isArray(raw.accept)) {
        const accept = raw.accept.map((a) => str(a, 50)).filter((a) => a && normalize(a) !== normalize(item.answer));
        if (accept.length) item.accept = accept.slice(0, 4);
      }
      break;
    }
    case "order": {
      item.answer = str(raw.answer, 90);
      const tokens = item.answer.split(" ").length;
      if (tokens < 2 || tokens > 12) return null;
      keep("he", 160);
      break;
    }
    case "pair": {
      item.a = str(raw.a, 70);
      item.b = str(raw.b, 70);
      if (!item.a || !item.b || plain(item.a) === plain(item.b)) return null;
      break;
    }
    case "word": {
      item.word = str(raw.word, 40);
      item.text = str(raw.text, 120);
      if (!ex.words.includes(item.word) || blanks(item.text) !== 1 || item.text.startsWith("___")) return null;
      // No other practice word in the sentence, so the picture to pick is clear.
      const filled = ` ${plain(item.text.replace("___", vocab[item.word]?.en || ""))} `;
      const clash = ex.words.some((id) => id !== item.word && filled.includes(` ${plain(vocab[id]?.en)} `));
      if (clash) return null;
      keep("he", 160);
      break;
    }
    default:
      return null;
  }
  return breaksRules(item) ? null : item;
}

/* Reading passages */

const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function phraseRe(phrase) {
  const body = phrase
    .trim()
    .split(/\s+/)
    .map((w) => escRe(w).replace(/'/g, "['’]"))
    .join("\\s+");
  return new RegExp(`(?<![A-Za-z0-9'’\\[-])(${body})(?![A-Za-z0-9'’\\]-])`, "gi");
}

// Adds brackets around every unbracketed occurrence of `phrases`.
function bracketPhrases(paragraphs, phrases) {
  const list = [...new Set(phrases.map((p) => p.trim()).filter(Boolean))].sort((a, b) => b.length - a.length);
  return paragraphs.map((para) =>
    para
      .split(/(\[[^\]]*\])/)
      .map((part) => {
        if (part.startsWith("[")) return part;
        return list.reduce((text, phrase) => text.replace(phraseRe(phrase), "[$1]"), part);
      })
      .join("")
  );
}

function unbracketPhrases(paragraphs, phrases) {
  const wanted = new Set(phrases.map((p) => p.trim().toLowerCase()));
  return paragraphs.map((para) => para.replace(/\[([^\]]+)\]/g, (whole, inner) => (wanted.has(inner.trim().toLowerCase()) ? inner : whole)));
}

function bracketed(paragraphs) {
  return paragraphs.flatMap((p) => [...p.matchAll(/\[([^\]]+)\]/g)].map((m) => m[1]));
}

function cleanQuestion(raw, level) {
  if (!raw || typeof raw !== "object") return null;
  const q = { type: raw.type };
  if (raw.type === "mc") {
    q.q = str(raw.q, 200);
    // Each option keeps its Hebrew version next to it (used by the page's
    // "Hebrew questions" switch), and a repeated option is dropped with it.
    const rawHe = Array.isArray(raw.optionsHe) ? raw.optionsHe : [];
    const pairs = (Array.isArray(raw.options) ? raw.options : [])
      .map((o, i) => [str(o, 120), str(rawHe[i], 120)])
      .filter(([o], i, all) => o && all.findIndex(([other]) => other === o) === i);
    q.options = pairs.map(([o]) => o);
    q.answer = str(raw.answer, 120);
    if (!q.q || q.options.length < 3 || q.options.length > 4 || !q.options.includes(q.answer)) return null;
    if (str(raw.he, 200)) q.he = str(raw.he, 200);
    if (q.he && pairs.every(([, he]) => he) && rawHe.length === raw.options.length) q.optionsHe = pairs.map(([, he]) => he);
  } else if (raw.type === "tf") {
    q.q = str(raw.q, 200);
    if (!q.q || typeof raw.answer !== "boolean") return null;
    q.answer = raw.answer;
    if (str(raw.he, 200)) q.he = str(raw.he, 200);
  } else if (raw.type === "open") {
    q.lang = level <= 2 ? "he" : "en";
    q.q = str(raw.q, 220);
    q.answer = str(raw.answer, 220);
    q.keywords = (Array.isArray(raw.keywords) ? raw.keywords : [])
      .map((group) => (Array.isArray(group) ? group.map((k) => str(k, 40)).filter(Boolean) : []))
      .filter((group) => group.length);
    if (!q.q || !q.answer || !openIsRight(q.keywords, q.answer)) return null;
    if (q.lang === "he") {
      q.qEn = str(raw.qEn, 220);
      q.answerEn = str(raw.answerEn, 220);
      if (!q.qEn || !q.answerEn || !openIsRight(q.keywords, q.answerEn)) return null;
    } else if (str(raw.he, 220)) {
      q.he = str(raw.he, 220);
    }
  } else {
    return null;
  }
  return q;
}

function cleanPassage(raw, ex) {
  const passage = raw?.passage;
  const title = str(passage?.title, 70);
  let text = (Array.isArray(passage?.text) ? passage.text : []).map((p) => str(p, 1200)).filter(Boolean);
  if (!title || text.length < 2 || text.length > 8) return null;
  if (text.some((p) => /\[[^\]]*\[|\][^[]*\]/.test(p) || (p.match(/\[/g) || []).length !== (p.match(/\]/g) || []).length)) return null;
  if (ex.mark) {
    // Every occurrence of a marked word must be marked, or clicking it
    // would count as a mistake.
    text = bracketPhrases(text, bracketed(text));
    if (bracketed(text).length < 4) return null;
  } else {
    text = text.map((p) => p.replace(/[[\]]/g, ""));
  }
  const glossary = Array.isArray(passage.glossary)
    ? passage.glossary
        .map((g) => ({ en: str(g?.en, 40), he: str(g?.he, 40) }))
        .filter((g) => g.en && g.he)
        .slice(0, 6)
    : [];
  const questions = (Array.isArray(raw.questions) ? raw.questions : []).map((q) => cleanQuestion(q, ex.level)).filter(Boolean);
  if (questions.length < 4) return null;
  const words = passageWords(passage.words, text);
  const item = { passage: { title, text, glossary: glossary.length ? glossary : null, ...(words ? { words } : {}) }, questions };
  return breaksRules(item) ? null : item;
}

// The passage's own word meanings for the page's "Translate words": only
// words and phrases that are in the text, with a Hebrew meaning.
function passageWords(raw, paragraphs) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const plainText = ` ${plain(paragraphs.join(" ").replace(/[[\]]/g, ""))} `;
  const words = {};
  for (const [en, he] of Object.entries(raw).slice(0, 400)) {
    const key = str(en, 40).toLowerCase().replace(/[’‘]/g, "'");
    const meaning = str(he, 60);
    if (!key || !/[֐-׿]/.test(meaning) || !plainText.includes(` ${plain(key)} `)) continue;
    words[key] = meaning;
  }
  return Object.keys(words).length ? words : null;
}

/* ── The blind check: the model solves the new items without the answers ── */

const shuffled = (list) => sample(list, list.length);

// Every check also asks for a teacher's verdict on the item as a whole.
function qualityNote(format) {
  const wrongOk = format === "truefalse" ? ` A wrong item is MEANT to have one mistake (that is the exercise) and its "hebrew" translates the corrected meaning — that alone does not make it not ok.` : "";
  return `Also judge each item as a teacher: "ok": false when it is wrong, unclear, unnatural, or too hard for this exercise, or when its hint, Hebrew word or Hebrew translation doesn't really fit; otherwise "ok": true.${wrongOk}`;
}

// A network filter sometimes blocks a long check; the halves usually pass.
async function verifyItems(args) {
  try {
    return await verifyBatch(args);
  } catch (err) {
    if (!err.filtered || args.items.length < 4) throw err;
    const half = Math.ceil(args.items.length / 2);
    const [a, b] = [args.items.slice(0, half), args.items.slice(half)];
    return [...(await verifyItems({ ...args, items: a }).catch(() => [])), ...(await verifyItems({ ...args, items: b }).catch(() => []))];
  }
}

async function verifyBatch({ topic, ex, vocab, format, items }) {
  if (!items.length) return [];
  const head = `${header(topic, ex)}\n\n`;
  const extras = (it) => ({ ...(it.hint ? { hint: it.hint } : {}), ...(it.context ? { context: it.context } : {}), ...(it.say ? { sounds: it.say } : {}), ...(it.he ? { hebrew: it.he } : {}) });
  const lines = (list) => list.map((l) => JSON.stringify(l)).join("\n");
  let prompt;
  let judge;

  if (format === "choice-shared" || format === "choice") {
    const list = items.map((it, id) => ({ id, text: it.text, ...extras(it), options: it.options || ex.options }));
    prompt = `${head}For each item, list EVERY option that correctly fills the ___ blank (normally exactly one). ${qualityNote(format)} Return {"items": [{"id": ..., "fits": [...], "ok": true|false}]}.\n\n${lines(list)}`;
    judge = (it, v) => Array.isArray(v.fits) && v.fits.length === 1 && v.fits[0] === it.answer;
  } else if (format === "truefalse") {
    const list = items.map((it, id) => ({ id, text: it.text, ...extras(it) }));
    prompt = `${head}For each item, answer the exercise's question ("${ex.instructionsEn}") with true or false. ${qualityNote(format)} Return {"items": [{"id": ..., "correct": true|false, "ok": true|false}]}.\n\n${lines(list)}`;
    judge = (it, v) => v.correct === it.correct;
  } else if (format === "write") {
    const list = items.map((it, id) => ({ id, text: it.text, ...extras(it) }));
    prompt = `${head}For each item, write what goes in the ___ blank. List every fully correct answer (usually one). ${qualityNote(format)} Return {"items": [{"id": ..., "answers": [...], "ok": true|false}]}.\n\n${lines(list)}`;
    judge = (it, v) => {
      if (!Array.isArray(v.answers) || !v.answers.length || v.answers.length > 3) return false;
      const answers = v.answers.map(normalize);
      if (!answers.includes(normalize(it.answer))) return false;
      const extra = v.answers.filter((a) => normalize(a) !== normalize(it.answer) && !(it.accept || []).some((x) => normalize(x) === normalize(a)));
      if (extra.length) it.accept = [...(it.accept || []), ...extra.map((a) => str(a, 50))];
      return true;
    };
  } else if (format === "order") {
    const list = items.map((it, id) => ({ id, pieces: shuffled(it.answer.split(" ")), ...extras(it) }));
    prompt = `${head}Each item is a list of pieces in a random order${items.some((it) => it.he) ? ', and "hebrew" is the sentence the student builds it from' : ""}. Put ALL the pieces together, each exactly once, into a correct sentence (or sequence). List every correct order you can find, each as one string with single spaces. ${qualityNote(format)} Return {"items": [{"id": ..., "orders": [...], "ok": true|false}]}.\n\n${lines(list)}`;
    judge = (it, v) => Array.isArray(v.orders) && v.orders.length === 1 && str(v.orders[0], 200) === it.answer;
  } else if (format === "pair") {
    const a = items.map((it, id) => ({ id, a: it.a }));
    const b = shuffled(items.map((it) => it.b));
    prompt = `${head}Match every A to the B that goes with it. If an A could go with more than one B, set "unclear": true. ${qualityNote(format)} Return {"items": [{"id": ..., "b": ..., "unclear": false, "ok": true|false}]}.\n\nA:\n${lines(a)}\n\nB:\n${lines(b)}`;
    judge = (it, v) => !v.unclear && str(v.b, 200) === it.b;
  } else if (format === "word") {
    const words = ex.words.map((id) => vocab[id]?.en || id);
    const list = items.map((it, id) => ({ id, text: it.text, ...extras(it) }));
    prompt = `${head}Words: ${words.map((w) => JSON.stringify(w)).join(", ")}\n\nFor each sentence, list EVERY word from the list that fits the ___ blank naturally (written exactly as in the list). ${qualityNote(format)} Return {"items": [{"id": ..., "fits": [...], "ok": true|false}]}.\n\n${lines(list)}`;
    // A matching board needs a sentence only one picture fits; the other
    // exercises show the picture (or say the word), so any fit is enough.
    judge = (it, v) => {
      const en = vocab[it.word]?.en;
      if (!Array.isArray(v.fits) || !v.fits.includes(en)) return false;
      return ex.type !== "match" || v.fits.length === 1;
    };
  } else {
    return [];
  }

  const result = await askModel(VERIFY_SYSTEM, prompt, 0);
  const verdicts = new Map((Array.isArray(result?.items) ? result.items : []).map((v) => [Number(v?.id), v]));
  return items.filter((it, id) => {
    const v = verdicts.get(id);
    return v && v.ok !== false && judge(it, v);
  });
}

async function verifyPassage({ topic, ex, item }) {
  const plainText = item.passage.text.map((p) => p.replace(/[[\]]/g, "")).join("\n\n");
  const closed = item.questions
    .map((q, id) => ({ id, q }))
    .filter(({ q }) => q.type !== "open")
    .map(({ id, q }) => ({ id, type: q.type, question: q.q, ...(q.type === "mc" ? { options: q.options } : {}) }));
  const markTask = ex.mark
    ? `\n\nMarking check. The student must do this: "${ex.mark.textEn}"${ex.mark.hint ? ` (${ex.mark.hint})` : ""}. Here is the text with the words to mark in [brackets]:\n${item.passage.text.join("\n\n")}\n\nList words or phrases that should be marked but are NOT in brackets ("missing"), and bracketed ones that should NOT be marked ("extra"). Empty lists if all is right.`
    : "";
  const open = item.questions
    .map((q, id) => ({ id, q }))
    .filter(({ q }) => q.type === "open")
    .map(({ id, q }) => ({ id, type: "open", question: q.qEn || q.q, sampleAnswer: q.answerEn || q.answer }));
  const prompt = `Topic: ${topic.titleEn}. A level ${ex.level} reading passage for children:\n\n${plainText}\n\nAnswer each question according to the text: for "mc" give the one right option exactly as written, for "tf" give true or false.\n${closed.map((c) => JSON.stringify(c)).join("\n")}\n\nOpen questions (only check them):\n${open.map((c) => JSON.stringify(c)).join("\n")}\n\nIn "bad", list the ids of any question (open ones too) that is unclear, has more than one right answer, or that the text doesn't answer.${markTask}\n\nReturn {"answers": [{"id": ..., "answer": ...}], "bad": [...]${ex.mark ? `, "missing": [...], "extra": [...]` : ""}}.`;

  const result = await askModel(VERIFY_SYSTEM, prompt, 0);
  const answers = new Map((Array.isArray(result?.answers) ? result.answers : []).map((a) => [Number(a?.id), a?.answer]));
  const bad = new Set((Array.isArray(result?.bad) ? result.bad : []).map(Number));
  const questions = item.questions.filter((q, id) => {
    if (bad.has(id)) return false;
    if (q.type === "open") return true;
    const given = answers.get(id);
    return q.type === "tf" ? given === q.answer || String(given).toLowerCase() === String(q.answer) : given === q.answer;
  });
  if (questions.length < 4) return null;

  let text = item.passage.text;
  if (ex.mark) {
    const missing = (Array.isArray(result?.missing) ? result.missing : []).map((m) => str(m, 40)).filter(Boolean);
    const extra = (Array.isArray(result?.extra) ? result.extra : []).map((m) => str(m, 40)).filter(Boolean);
    if (missing.length + extra.length > 6) return null;
    text = bracketPhrases(unbracketPhrases(text, extra), missing);
    if (bracketed(text).length < 4) return null;
  }
  return { ...item, passage: { ...item.passage, text }, questions };
}

/* ── Bank storage ── */

const banks = new Map();

function bankId(topicId, exerciseId) {
  return `${topicId}__${exerciseId}`.replace(/[^A-Za-z0-9_-]/g, "_");
}

function loadLocal() {
  try {
    if (fs.existsSync(BANK_FILE)) return JSON.parse(fs.readFileSync(BANK_FILE, "utf8")).banks || {};
  } catch {
    /* ignore */
  }
  return {};
}

async function readBank(id) {
  if (banks.has(id)) return banks.get(id);
  const db = getFirestore();
  let items = [];
  if (db) {
    const doc = await db.collection(COLLECTION).doc(id).get();
    items = doc.exists ? doc.data().items || [] : [];
  } else {
    items = loadLocal()[id] || [];
  }
  banks.set(id, items);
  return items;
}

async function writeBank(id, items) {
  banks.set(id, items);
  const db = getFirestore();
  if (db) {
    await db.collection(COLLECTION).doc(id).set({ items, updatedAt: new Date().toISOString() });
    return;
  }
  const all = loadLocal();
  all[id] = items;
  fs.mkdirSync(path.dirname(BANK_FILE), { recursive: true });
  fs.writeFileSync(BANK_FILE, JSON.stringify({ banks: all }, null, 1), "utf8");
}

/* ── Limits: AI jobs per visitor per hour and in total per day ── */

const ipJobs = new Map();
let dayJobs = { day: "", count: 0 };

function allowJob(ip) {
  const now = Date.now();
  const today = new Date().toISOString().slice(0, 10);
  if (dayJobs.day !== today) dayJobs = { day: today, count: 0 };
  if (dayJobs.count >= JOBS_PER_DAY) return false;
  const recent = (ipJobs.get(ip) || []).filter((t) => now - t < 3600000);
  if (recent.length >= JOBS_PER_IP_HOUR) return false;
  recent.push(now);
  ipJobs.set(ip, recent);
  dayJobs.count++;
  return true;
}

/* ── Generating ── */

const inflight = new Map();

// Some exercises have nothing left to add (all 26 capital/small letters are
// already in "letters-match"). After two batches in a row with nothing new,
// such an exercise isn't sent to the AI again for a day.
const barren = new Map();

function noteYield(id, added) {
  if (added) {
    barren.delete(id);
    return;
  }
  const entry = barren.get(id) || { misses: 0, until: 0 };
  entry.misses++;
  if (entry.misses >= 2) entry.until = Date.now() + 24 * 3600000;
  barren.set(id, entry);
}

async function generate(found, id) {
  const { topic, ex, vocab } = found;
  const format = formatOf(ex);
  const bank = await readBank(id);
  const own = originals(ex, vocab);
  const taken = new Set([...own, ...bank].map((item) => signature(format, item)));

  let fresh;
  let written = 0;
  if (format === "reading") {
    const sameLevel = topic.exercises.filter((e) => e.type === "reading" && e.level === ex.level).map((e) => e.passage.title);
    const avoid = [...new Set([...sameLevel, ...bank.map((b) => b.passage.title)])].slice(-40);
    const raw = await askModel(SYSTEM, readingPrompt({ topic, ex, avoid }), 0.9);
    const cleaned = cleanPassage(raw, ex);
    const checked = cleaned && !taken.has(signature(format, cleaned)) ? await verifyPassage({ topic, ex, item: cleaned }) : null;
    written = raw?.passage ? 1 : 0;
    fresh = checked ? [checked] : [];
  } else {
    const fields = format === "word" ? ["he"] : usedFields(own, OPTIONAL[format] || []);
    // A short "already used" list: exact repeats are dropped afterwards anyway,
    // and long requests get blocked by some filtering internet providers.
    const avoidSource = format === "word" ? bank.slice(-16) : [...sample(own, 12), ...bank.slice(-12)];
    const avoid = avoidSource.map((item) => item.text || item.answer || (item.a ? `${item.a} — ${item.b}` : "")).filter(Boolean);
    const ask = (lean) => askModel(SYSTEM, itemPrompt({ topic, ex, vocab, format, avoid: lean ? [] : avoid, count: itemCount(ex, format), lean }), 0.9);
    const raw = await ask(false).catch((err) => {
      if (!err.filtered) throw err;
      return ask(true);
    });
    const seenNow = new Set(taken);
    const seenB = new Set(format === "pair" ? own.concat(bank).map((p) => plain(p.b)) : []);
    const cleaned = (Array.isArray(raw?.items) ? raw.items : [])
      .map((r) => cleanItem(format, r, ex, vocab, fields))
      .filter((item) => {
        if (!item) return false;
        const sig = signature(format, item);
        if (seenNow.has(sig)) return false;
        if (format === "pair" && seenB.has(plain(item.b))) return false;
        seenNow.add(sig);
        if (format === "pair") seenB.add(plain(item.b));
        return true;
      });
    written = Array.isArray(raw?.items) ? raw.items.length : 0;
    fresh = await verifyItems({ topic, ex, vocab, format, items: cleaned });
  }

  const at = new Date().toISOString();
  const added = fresh.map((item) => ({ ...item, key: hashKey(signature(format, item)), at }));
  noteYield(id, added.length);
  if (added.length) {
    const cap = format === "reading" ? BANK_CAP.reading : BANK_CAP.default;
    await writeBank(id, [...bank, ...added].slice(-cap));
  }
  console.log(`[english-practice] ${id}: ${written} written, ${added.length} passed the checks (${format})`);
  return added.length;
}

function startJob(found, id, ip) {
  if (inflight.has(id)) return inflight.get(id);
  if ((barren.get(id)?.until || 0) > Date.now()) return null;
  if (!isConfigured() || !allowJob(ip)) return null;
  const job = generate(found, id)
    .catch((err) => {
      console.warn(`[english-practice] ${id}: ${err.message}`);
      return 0;
    })
    .finally(() => inflight.delete(id));
  inflight.set(id, job);
  return job;
}

function lookup(topicId, exerciseId) {
  const found = findExercise(String(topicId || ""), String(exerciseId || ""));
  if (!found) {
    const err = new Error("התרגיל לא נמצא");
    err.status = 404;
    throw err;
  }
  return found;
}

function seenSet(seen) {
  return new Set((Array.isArray(seen) ? seen : []).slice(-SEEN_CAP).map((k) => String(k).slice(0, 24)));
}

async function unseenItems(id, seen) {
  return (await readBank(id)).filter((item) => !seen.has(item.key));
}

// Strips bank-only fields before an item goes to the page.
function forClient(item) {
  const { at, ...rest } = item;
  return rest;
}

/**
 * New items for one exercise that this student hasn't seen. Answers from
 * the bank when it has enough; otherwise waits for a new batch. Either way
 * it tops the bank up in the background for next time.
 */
async function getPractice({ topicId, exerciseId, seen, ip }) {
  const found = lookup(topicId, exerciseId);
  const id = bankId(found.topic.id, found.ex.id);
  const want = roundSize(found.ex, formatOf(found.ex));
  const seenKeys = seenSet(seen);
  let fresh = await unseenItems(id, seenKeys);

  if (fresh.length < Math.ceil(want / 2)) {
    const job = startJob(found, id, ip);
    if (job) {
      await job;
      fresh = await unseenItems(id, seenKeys);
    }
  }
  if (fresh.length - want < want) startJob(found, id, ip);
  return { items: sample(fresh, want).map(forClient), aiReady: isConfigured() };
}

// Called when a student starts an exercise: gets new items ready while they
// practice, so "create new exercises" at the end doesn't have to wait.
async function preparePractice({ topicId, exerciseId, seen, ip }) {
  const found = lookup(topicId, exerciseId);
  const id = bankId(found.topic.id, found.ex.id);
  const want = roundSize(found.ex, formatOf(found.ex));
  const fresh = await unseenItems(id, seenSet(seen));
  if (fresh.length < want * 2) startJob(found, id, ip);
  return { ready: Math.min(fresh.length, want) };
}

module.exports = {
  isConfigured,
  getPractice,
  preparePractice,
  // for scripts/tests
  _internal: { findExercise, formatOf, generate, bankId, cleanItem, cleanPassage, bracketPhrases, signature },
};
