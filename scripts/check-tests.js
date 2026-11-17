// Checks the test questions (public/js/english-tests.js): every topic has a
// bank, every question is well formed, and none repeats a practice item —
// an exercise question (english-data.js, english-more.js) or a worksheet
// item (english-printables.js) — since a test must ask new questions.
// Run: node scripts/check-tests.js   (exit code 1 when anything is found)
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const FILES = [
  "public/js/vocab-data.js",
  "public/js/english-vocab.js",
  "public/js/english-data.js",
  "public/js/english-more.js",
  "public/js/english-printables.js",
  "public/js/english-tests.js",
];
const MIN_QUESTIONS = 10;
// The test draws up to this many questions from one topic.
const MAX_DRAW = 10;

const ctx = { window: {}, console };
vm.createContext(ctx);
for (const file of FILES) {
  try {
    vm.runInContext(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), ctx);
  } catch (e) {
    if (file.endsWith("english-tests.js")) throw e;
  }
}
const { ENGLISH_TOPICS: TOPICS = [], ENGLISH_TESTS: TESTS = {}, ENGLISH_TEST_ASK: ASK = {}, ENGLISH_PRINTABLES: PRINTABLES = {} } = ctx.window;

const problems = [];
const flag = (where, msg) => problems.push(`${where}  ${msg}`);

// Lower case, no punctuation or extra spaces, so "He is." and "he is" match.
// A blank stays as "_", so a question's frame matches only another frame.
const norm = (s) =>
  String(s || "")
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/_+/g, " _ ")
    .replace(/[^a-z0-9'_ ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const filled = (text, answer) => (String(text || "").includes("___") ? String(text).replace("___", answer) : "");
const blank = (text) => String(text || "").includes("___");

// Every question frame ("I ___ a dog.") and every whole sentence a practice
// item shows or answers with.
const frames = new Set();
const sentences = new Set();
const addPractice = (...list) =>
  list.forEach((s) => {
    if (!s || norm(s).split(" ").length < 2) return;
    (blank(s) ? frames : sentences).add(norm(s));
  });
TOPICS.forEach((topic) =>
  (topic.exercises || []).forEach((ex) =>
    (ex.questions || []).forEach((q) => {
      addPractice(q.text, q.answer, q.fix, q.full, filled(q.text, q.answer));
      (q.options || []).forEach((opt) => q.text || addPractice(opt));
    })
  )
);
Object.values(PRINTABLES).forEach((pack) =>
  (pack.sheets || []).forEach((sheet) =>
    (sheet.tasks || []).forEach((task) =>
      (task.items || []).forEach((it) => addPractice(it.text, it.answer, it.alt, filled(it.text, it.answer)))
    )
  )
);

// Female words and names stay out of new content.
const FEMALE_WORD = /\b(she|her|hers|herself|girl|girls|woman|women|lady|queen|princess|aunt|grandma|mom's|noa|dana|lily|maya|sara|sarah|rachel)\b/i;
const FEMALE_TITLE = /\b(Mrs|Miss|Ms)\b/;
const female = (text) => (text.match(FEMALE_WORD) || text.match(FEMALE_TITLE) || [])[0];

const topicIds = new Set(TOPICS.map((tp) => tp.id));
TOPICS.forEach((tp) => TESTS[tp.id] || flag(tp.id, "no test questions for this topic"));

const seen = new Map();
Object.entries(TESTS).forEach(([topicId, list]) => {
  if (!topicIds.has(topicId)) flag(topicId, "no such topic in english-data.js");
  if (list.length < MIN_QUESTIONS) flag(topicId, `only ${list.length} questions (at least ${MIN_QUESTIONS})`);
  if (list.length <= MAX_DRAW) flag(topicId, `${list.length} questions: a one-topic test asks ${MAX_DRAW}, so a retake would ask the same ones`);
  list.forEach((q, i) => {
    const where = `${topicId} #${i + 1}`;
    const shown = q.type === "order" ? q.answer : q.text;
    if (q.ask && !ASK[q.ask]) flag(where, `unknown ask "${q.ask}"`);
    if (q.type === "choice") {
      if (!Array.isArray(q.options) || q.options.length < 2) flag(where, "a choice needs two options or more");
      else if (!q.options.includes(q.answer)) flag(where, `answer "${q.answer}" is not an option`);
      else if (new Set(q.options).size !== q.options.length) flag(where, "the same option twice");
    } else if (q.type === "truefalse") {
      if (q.fix && norm(q.fix) === norm(q.text)) flag(where, "the fix is the same sentence");
    } else if (q.type === "write") {
      if (!String(q.text).includes("___")) flag(where, "a write question needs a ___ blank");
      if (!q.answer) flag(where, "no answer");
    } else if (q.type === "order") {
      if (/\s{2}/.test(q.answer) || q.answer.trim() !== q.answer) flag(where, "extra spaces in the sentence");
      if (q.answer.split(" ").length < 3) flag(where, "too short to put in order");
    } else {
      flag(where, `unknown type "${q.type}"`);
    }
    const text = [q.text, q.answer, q.fix, ...(q.options || [])].join(" ");
    if (female(text)) flag(where, `female word: ${female(text)}`);
    // The question as asked and as answered must not be a practice item.
    [shown, q.fix, filled(q.text, q.answer)]
      .filter(Boolean)
      .map(norm)
      .filter((s) => s.split(" ").length > 2)
      .forEach((s) => (s.includes("_") ? frames : sentences).has(s) && flag(where, `repeats a practice item: "${s}"`));
    const key = norm(filled(q.text, q.answer) || shown);
    if (seen.has(key)) flag(where, `same question as ${seen.get(key)}`);
    else seen.set(key, where);
  });
});

problems.forEach((p) => console.log(p));
const count = Object.values(TESTS).reduce((n, list) => n + list.length, 0);
console.log(problems.length ? `\n${problems.length} problems` : `OK — ${Object.keys(TESTS).length} topics, ${count} questions`);
process.exitCode = problems.length ? 1 : 0;
