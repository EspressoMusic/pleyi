/* Prints (as JSON) every English word and sentence that gets a ready-made
   audio clip: all the vocabulary, the dictionary, what the lessons say and the
   dictation sentences. Longer texts (reading passages) and exercises the AI
   writes on the spot stay with the browser's voice (public/js/speech.js).
   Run through generate-english-audio.py. */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const JS = path.join(__dirname, "..", "public", "js");
const MAX_LENGTH = 120;

const context = {
  window: { I18n: { lang: "he" } },
  console,
  document: { addEventListener() {}, querySelector: () => null },
  location: {},
  navigator: {},
  localStorage: { getItem: () => null, setItem() {} },
};
vm.createContext(context);
["english-vocab", "english-data", "english-more", "english-lessons", "english-dict", "lesson-sentences-he"].forEach((file) => {
  vm.runInContext(fs.readFileSync(path.join(JS, `${file}.js`), "utf8"), context);
});
const { window: w } = context;

const texts = new Set();
const add = (text) => {
  const clean = String(text || "").replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
  if (/[a-z]/i.test(clean) && !/[֐-׿_]/.test(clean) && clean.length <= MAX_LENGTH) texts.add(clean);
};

Object.values(w.ENGLISH_VOCAB).forEach((word) => add(word.en));
Object.keys(w.ENGLISH_DICT).forEach(add);
Object.keys(w.LESSON_SENTENCES_HE).forEach(add);

(w.ENGLISH_VOCAB_CATEGORIES || []).forEach((cat) => cat.sentences.forEach((s) => add(s.en)));

// The lessons' examples and speakable lines.
const walk = (node) => {
  if (Array.isArray(node)) node.forEach(walk);
  else if (node && typeof node === "object") {
    Object.entries(node).forEach(([key, value]) => {
      if (["en", "say", "speak"].includes(key) && typeof value === "string") add(value);
      // A short lesson's examples are [english, hebrew] rows.
      else if (key === "examples" && Array.isArray(value)) value.forEach((row) => add(Array.isArray(row) ? row[0] : row.en));
      else walk(value);
    });
  }
};
walk(w.ENGLISH_SHORT_LESSONS);

// Dictation: hearing the sentence is the whole exercise.
w.ENGLISH_TOPICS.forEach((topic) => {
  (topic.exercises || []).forEach((ex) => {
    if (ex.type === "dictation") (ex.questions || []).forEach((q) => add(q.answer));
  });
});

process.stdout.write(JSON.stringify([...texts]));
