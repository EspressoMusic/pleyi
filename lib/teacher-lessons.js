const fs = require("fs");
const path = require("path");
const vm = require("vm");
const crypto = require("crypto");
const { getFirestore } = require("./firebase-admin");
const { askModel, isConfigured } = require("./english-practice");

/**
 * Lessons a teacher creates on /my-room ("יצירת שיעור"): the teacher names a
 * subject and a topic, the AI writes a short slide lesson in the same shape
 * as the site's own short lessons (public/js/english-lessons.js,
 * subject-lessons.js), and it's saved to the teacher. Only that teacher sees
 * it in their list; it opens by its id (/services/ready-lessons?mylesson=<id>),
 * which is also how a student opens it as a task.
 *
 * A teacher can also copy one of the site's short lessons into their list
 * (the "i" dialog in the lessons library), and edit any lesson of theirs:
 * the name, each slide's text, new slides, the discussion questions.
 *
 * Firestore (`teacherLessons/{id}`) when a service account is configured,
 * else the local data/teacher-lessons.json — same split as student-progress.
 * Firestore can't keep arrays inside arrays, so the lesson is kept as JSON text.
 */

const LESSONS_FILE = path.join(__dirname, "..", "data", "teacher-lessons.json");
const PUBLIC_JS = path.join(__dirname, "..", "public", "js");
const SITE_LESSON_FILES = ["english-lessons.js", "subject-lessons.js"];
const COLLECTION = "teacherLessons";
const MAX_PER_TEACHER = 100;
const DAILY_LIMIT = 15;
const ID_PATTERN = /^[a-f0-9]{24}$/;

const SUBJECTS = {
  english: "English (for Hebrew-speaking kids)",
  math: "math",
  hebrew: "Hebrew language",
  science: "science",
  geography: "geography",
  history: "history",
};

/* ── The model's lesson ── */

const SYSTEM = `You write short slide lessons for Israeli schoolchildren, in Hebrew, for a learning website.
Write very simple Hebrew, like for small kids: short words, short lines, one idea per slide.
Content rules (strict): no female names, no girls or women in examples or sentences — use boys, animals and objects. No romance or love stories. Nothing violent or scary. Respectful of a religious audience.
Never mention how many minutes anything takes.
Answer with JSON only.`;

function lessonPrompt(subject, topic) {
  const english = subject === "english";
  return `Write a short lesson.
Subject: ${SUBJECTS[subject]}
Topic (from the teacher): ${topic}

JSON shape:
{
  "name": "the topic's name in Hebrew, 1-4 words",
  "summary": "one Hebrew sentence: what the kids learn",
  "vocab": [["term", "short Hebrew meaning"], ...],
  "slides": [
    {
      "title": "2-4 Hebrew words, the key word wrapped in **double stars**",
      "lines": ["1-2 short Hebrew lines, up to 8 words each"],
      "examples": [["example", "its Hebrew explanation"]],
      "more": ["4-5 short Hebrew lines that explain the slide in more detail"]
    }
  ],
  "quiz": [["question in Hebrew", "hint", ["option", "option", "option"], 0, "short Hebrew reason"]],
  "discuss": ["class discussion question in Hebrew", "another one"]
}

Rules:
- 6-7 slides. One idea per slide, from easy to harder. The last slide is a summary titled "**לסיכום**".
- Every slide has 1-3 "examples" (never a slide with text only).
- Wrap 1-2 key words per line in **double stars**.
- vocab: 5-8 terms from the lesson.
- quiz: exactly 5 questions, 3 options each; the 4th item is the index (0-2) of the right option. Ask only about what the slides taught; one option is clearly right and the others clearly wrong.
- discuss: exactly 2 questions the teacher asks the class about the lesson.
${
  english
    ? `- English lesson: examples are [English sentence, Hebrew translation]; vocab is [English word, Hebrew translation].
- Quiz: the question is a short English sentence or question, the options are in English, and the hint (2nd item) is its Hebrew translation.
- In Hebrew lines, never put punctuation right after an English word.
- Use simple English a child can read.

A good slide:
{"title": "מתי אות **גדולה**?", "lines": ["בתחילת משפט", "ובשם של ילד או של מקום"], "examples": [["**T**om is from **I**srael.", "טום מישראל"]], "more": ["רוב הזמן כותבים באותיות **קטנות**", "אות **גדולה** באה בתחילת משפט", "וגם בשם של ילד, של עיר או של ארץ", "Tom הוא שם, ו־Israel היא ארץ – לכן אות גדולה"]}
A good quiz item:
["I ___ a boy.", "אני ילד", ["am", "is", "are"], 0, "עם I תמיד בא am"]`
    : `- Write everything in Hebrew. The hint (2nd quiz item) is an exercise to show big (like "7 + 5"), or "" when there is none.
- Use plain numbers and symbols (+ - × : =), no LaTeX.

A good slide:
{"title": "**חצי**", "lines": ["מחלקים ל־**2** חלקים שווים", "לוקחים חלק **אחד**"], "examples": [["1 מתוך 2", "חצי"]], "more": ["חותכים פיצה ל־**2** חלקים שווים", "כל חלק הוא **חצי**", "לוקחים חלק **אחד** – לקחנו חצי", "קוראים: **אחד חלקי שתיים**"]}
A good quiz item:
["חילקנו עוגה ל־3 חלקים שווים. איך קוראים לחלק אחד?", "", ["חצי", "שליש", "רבע"], 1, "3 חלקים – כל חלק הוא שליש"]`
}`;
}

const str = (value, max) => (typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "").slice(0, max);

function pairs(list, max, len = 160) {
  return (Array.isArray(list) ? list : [])
    .map((p) => (Array.isArray(p) ? [str(p[0], len), str(p[1], len)] : null))
    .filter((p) => p && p[0])
    .slice(0, max);
}

function lines(list, max, len = 160) {
  return (Array.isArray(list) ? list : []).map((l) => str(l, len)).filter(Boolean).slice(0, max);
}

// The right answer moves to a random place, so it isn't always first.
function quizItem(raw) {
  if (!Array.isArray(raw)) return null;
  const q = str(raw[0], 240);
  const options = lines(raw[2], 4, 120);
  const answer = Number(raw[3]);
  if (!q || options.length < 2 || !Number.isInteger(answer) || answer < 0 || answer >= options.length) return null;
  const right = options[answer];
  const others = options.filter((_, i) => i !== answer);
  const at = crypto.randomInt(options.length);
  others.splice(at, 0, right);
  return [q, str(raw[1], 160), others, at, str(raw[4], 240)];
}

function cleanLesson(raw) {
  const slides = (Array.isArray(raw?.slides) ? raw.slides : [])
    .map((s) => {
      const slide = { title: str(s?.title, 80), lines: lines(s?.lines, 3) };
      const examples = pairs(s?.examples, 4);
      const more = lines(s?.more, 7);
      if (examples.length) slide.examples = examples;
      if (more.length) slide.more = more;
      return slide;
    })
    .filter((s) => s.title && (s.lines.length || s.examples))
    .slice(0, 9);
  const lesson = {
    name: str(raw?.name, 60),
    summary: str(raw?.summary, 240),
    vocab: pairs(raw?.vocab, 10, 80),
    slides,
    quiz: (Array.isArray(raw?.quiz) ? raw.quiz : []).map(quizItem).filter(Boolean).slice(0, 6),
    discuss: lines(raw?.discuss, 3, 200),
  };
  if (!lesson.name || slides.length < 3 || lesson.quiz.length < 2) throw new Error("השיעור לא נוצר כמו שצריך — נסו שוב");
  if (!lesson.discuss.length) lesson.discuss = ["מה למדנו היום?", "איפה פוגשים את זה בחיים?"];
  return lesson;
}

/* ── Storage ── */

function loadLocal() {
  try {
    if (fs.existsSync(LESSONS_FILE)) return JSON.parse(fs.readFileSync(LESSONS_FILE, "utf8")).lessons || {};
  } catch {
    /* ignore */
  }
  return {};
}

function saveLocal(lessons) {
  fs.mkdirSync(path.dirname(LESSONS_FILE), { recursive: true });
  fs.writeFileSync(LESSONS_FILE, JSON.stringify({ lessons }, null, 2), "utf8");
}

// A stored record → what the list shows.
function row(record) {
  return { id: record.id, subject: record.subject, title: record.title, createdAt: record.createdAt };
}

async function ownLessons(uid) {
  const db = getFirestore();
  if (db) {
    const snap = await db.collection(COLLECTION).where("ownerUid", "==", uid).get();
    return snap.docs.map((d) => d.data());
  }
  return Object.values(loadLocal()).filter((r) => r.ownerUid === uid);
}

async function listLessons(uid) {
  const list = await ownLessons(uid);
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(row);
}

// How many lessons each teacher made today (resets with the server, which is
// fine: it only keeps one teacher from using up the AI quota).
const madeToday = new Map();

function countToday(uid) {
  const day = new Date().toISOString().slice(0, 10);
  const entry = madeToday.get(uid);
  return entry?.day === day ? entry.count : 0;
}

async function createLesson(uid, { subject, topic } = {}) {
  if (!uid) throw Object.assign(new Error("יש להתחבר מחדש"), { status: 401 });
  if (!SUBJECTS[subject]) throw new Error("בחרו מקצוע");
  const about = str(topic, 200);
  if (about.length < 2) throw new Error("כתבו על מה השיעור");
  if (!isConfigured()) throw Object.assign(new Error("יצירת שיעורים לא זמינה כרגע"), { status: 503 });
  if (countToday(uid) >= DAILY_LIMIT) throw Object.assign(new Error(`אפשר ליצור עד ${DAILY_LIMIT} שיעורים ביום`), { status: 429 });
  if ((await ownLessons(uid)).length >= MAX_PER_TEACHER) throw new Error(`אפשר לשמור עד ${MAX_PER_TEACHER} שיעורים — מחקו שיעור ישן`);

  let lesson;
  try {
    lesson = cleanLesson(await askModel(SYSTEM, lessonPrompt(subject, about), 0.7));
  } catch (err) {
    console.warn(`[teacher-lessons] ${err.message.split("\n")[0]}`);
    throw Object.assign(new Error(err.message.startsWith("השיעור") ? err.message : "לא הצלחנו ליצור את השיעור — נסו שוב בעוד דקה"), { status: 502 });
  }
  const day = new Date().toISOString().slice(0, 10);
  madeToday.set(uid, { day, count: countToday(uid) + 1 });

  const record = {
    id: crypto.randomBytes(12).toString("hex"),
    ownerUid: uid,
    subject,
    topic: about,
    title: lesson.name,
    createdAt: new Date().toISOString(),
    data: JSON.stringify(lesson),
  };
  await writeRecord(record);
  return { lesson: row(record) };
}

async function findLesson(id) {
  if (!ID_PATTERN.test(String(id || ""))) return null;
  const db = getFirestore();
  if (db) {
    const doc = await db.collection(COLLECTION).doc(id).get();
    return doc.exists ? doc.data() : null;
  }
  return loadLocal()[id] || null;
}

async function deleteLesson(uid, id) {
  const record = await findLesson(id);
  if (!record || record.ownerUid !== uid) throw Object.assign(new Error("השיעור לא נמצא"), { status: 404 });
  const db = getFirestore();
  if (db) {
    await db.collection(COLLECTION).doc(id).delete();
  } else {
    const all = loadLocal();
    delete all[id];
    saveLocal(all);
  }
  return {};
}

// The lesson itself, for the lesson player — anyone with its id (the
// teacher, or a student it was given to as a task).
async function getLesson(id) {
  const record = await findLesson(id);
  if (!record) throw Object.assign(new Error("השיעור לא נמצא"), { status: 404 });
  return { lesson: { id: record.id, subject: record.subject, ...JSON.parse(record.data) } };
}

async function writeRecord(record) {
  const db = getFirestore();
  if (db) {
    await db.collection(COLLECTION).doc(record.id).set(record);
  } else {
    const all = loadLocal();
    all[record.id] = record;
    saveLocal(all);
  }
}

/* ── Copying a site lesson ── */

// The site's short lessons, read from the same files the page loads.
let siteLessons = null;
let siteStamp = "";

function loadSiteLessons() {
  const stamp = SITE_LESSON_FILES.map((f) => fs.statSync(path.join(PUBLIC_JS, f)).mtimeMs).join("|");
  if (siteLessons && stamp === siteStamp) return siteLessons;
  const sandbox = { window: {} };
  sandbox.window.window = sandbox.window;
  vm.createContext(sandbox);
  SITE_LESSON_FILES.forEach((file) => {
    vm.runInContext(fs.readFileSync(path.join(PUBLIC_JS, file), "utf8"), sandbox, { filename: file });
  });
  const list = [...(sandbox.window.ENGLISH_SHORT_LESSONS || []), ...(sandbox.window.SUBJECT_SHORT_LESSONS || [])];
  siteLessons = new Map(list.map((entry) => [entry.id, entry]));
  siteStamp = stamp;
  return siteLessons;
}

async function copyLesson(uid, { lessonId } = {}) {
  if (!uid) throw Object.assign(new Error("יש להתחבר מחדש"), { status: 401 });
  const entry = loadSiteLessons().get(String(lessonId || ""));
  if (!entry) throw Object.assign(new Error("את השיעור הזה אי אפשר להוסיף"), { status: 404 });
  if ((await ownLessons(uid)).length >= MAX_PER_TEACHER) throw new Error(`אפשר לשמור עד ${MAX_PER_TEACHER} שיעורים — מחקו שיעור ישן`);

  const title = entry.part ? `${entry.name} – ${entry.part}` : entry.name;
  const lesson = {
    name: title,
    summary: entry.summary || "",
    vocab: entry.vocab || [],
    slides: withKeys(entry.slides),
    quiz: entry.quiz || [],
    discuss: entry.discuss || [],
  };
  const record = {
    id: crypto.randomBytes(12).toString("hex"),
    ownerUid: uid,
    subject: entry.subject || "english",
    topic: title,
    source: entry.id,
    title,
    createdAt: new Date().toISOString(),
    data: JSON.stringify(lesson),
  };
  await writeRecord(record);
  return { lesson: row(record) };
}

/* ── Editing ── */

// The text a teacher edits on a slide. Everything else a slide has (a
// drawing, a table, chips…) came from the site's own lesson and stays as it
// was: the server keeps it by the slide's key, never takes it from the page.
const TEXT_FIELDS = ["title", "lines", "examples", "more"];

// The "more" lines (the slide's lightbulb) can hold example cards too:
// [example, explanation] between the lines.
function moreLines(list, max) {
  return (Array.isArray(list) ? list : [])
    .map((l) => (Array.isArray(l) ? (str(l[0], 160) ? [str(l[0], 160), str(l[1], 160)] : "") : str(l, 160)))
    .filter(Boolean)
    .slice(0, max);
}

// Every slide gets a key, so a saved edit finds its slide after moves.
function withKeys(slides) {
  return (slides || []).map((slide, i) => ({ ...slide, key: slide.key || `s${i}` }));
}

async function ownRecord(uid, id) {
  const record = await findLesson(id);
  if (!record || record.ownerUid !== uid) throw Object.assign(new Error("השיעור לא נמצא"), { status: 404 });
  return record;
}

// The whole lesson, for the teacher's editor.
async function getOwnLesson(uid, id) {
  const record = await ownRecord(uid, id);
  const lesson = JSON.parse(record.data);
  return { lesson: { id: record.id, subject: record.subject, ...lesson, slides: withKeys(lesson.slides) } };
}

async function saveLesson(uid, id, { name, slides, discuss } = {}) {
  const record = await ownRecord(uid, id);
  const lesson = JSON.parse(record.data);
  const before = new Map(withKeys(lesson.slides).map((slide) => [slide.key, slide]));

  const nextSlides = (Array.isArray(slides) ? slides : []).slice(0, 20).map((s) => {
    const old = before.get(String(s?.key || ""));
    before.delete(old?.key);
    const keep = old ? Object.fromEntries(Object.entries(old).filter(([k]) => !TEXT_FIELDS.includes(k))) : {};
    const slide = { ...keep, key: old ? old.key : `n${crypto.randomBytes(4).toString("hex")}`, title: str(s?.title, 80) };
    const text = lines(s?.lines, 4);
    const examples = pairs(s?.examples, 4);
    const more = moreLines(s?.more, 8);
    if (text.length) slide.lines = text;
    if (examples.length) slide.examples = examples;
    if (more.length) slide.more = more;
    return slide;
  });
  // A slide needs a title and something to show under it.
  const shows = (s) => s.lines || s.examples || Object.keys(s).some((k) => !TEXT_FIELDS.includes(k) && k !== "key");
  const bad = nextSlides.findIndex((s) => !s.title || !shows(s));
  if (bad >= 0) throw new Error(`בשקופית ${bad + 1} חסרים כותרת או שורה`);
  if (!nextSlides.length) throw new Error("צריך לפחות שקופית אחת");

  const title = str(name, 60);
  if (!title) throw new Error("כתבו שם לשיעור");
  lesson.name = title;
  lesson.slides = nextSlides;
  const questions = lines(discuss, 3, 200);
  if (questions.length) lesson.discuss = questions;

  record.title = title;
  record.updatedAt = new Date().toISOString();
  record.data = JSON.stringify(lesson);
  await writeRecord(record);
  return { lesson: row(record) };
}

module.exports = { listLessons, createLesson, copyLesson, deleteLesson, getLesson, getOwnLesson, saveLesson };
