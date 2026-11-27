const fs = require("fs");
const path = require("path");
const vm = require("vm");
const seo = require("./seo");
const siteSearch = require("./site-search");
const englishPractice = require("./english-practice");

/**
 * "שאלו את השועל" — the site's fox (public/js/site-fox.js) answers in a few
 * simple Hebrew lines and points to lessons, exercises and pages on the site.
 *
 *   POST /api/fox/ask { message, history: [{ role: "user"|"fox", text }], page, animal }
 *     → { ok, reply, links: [{ t: title, k: kind, u: url }], ai }
 *
 * The model picks links only by id from a catalog built here (the site
 * search's list, every topic of English and of the school subjects with its
 * grades), so it can't make up an address. Without an AI key, over the
 * limits, or when the model fails, the fox answers from a word search of the
 * same catalog (ai: false). Nothing the user writes is saved.
 */

const JS_DIR = path.join(__dirname, "..", "public", "js");
const SUBJECT_FILES = ["subject-lessons.js", "subject-practice.js", "curriculum-grades.js"];

const MAX_MESSAGE = 300;
const MAX_HISTORY = 6;
const MAX_LINKS = 4;
// Lessons and posts sent to the model: the ones that match the question best.
const MAX_POOL = 40;
// Topics that match the question, listed again on top of the catalog.
const MAX_TOPICS = 8;
const ASK_TIMEOUT_MS = 30000;
// Per visitor, and for the whole site in a day (to keep the AI bill small).
const PER_HOUR = 30;
const PER_DAY_ALL = 2000;

const GRADE_LETTERS = "אבגדהוזחט";
const grades = (list) =>
  Array.isArray(list) && list.length
    ? list
        .map((n) => GRADE_LETTERS[n - 1])
        .filter(Boolean)
        .join(",")
    : "";

/* ── The catalog ── */

function loadSubjects() {
  const win = { addEventListener() {} };
  const context = vm.createContext({ window: win, location: { pathname: "/", search: "" }, document: { getElementById: () => null }, URLSearchParams });
  SUBJECT_FILES.forEach((file) => vm.runInContext(fs.readFileSync(path.join(JS_DIR, file), "utf8"), context, { filename: file }));
  return win;
}

// Every item: { id, t, k, u, s, g, topic }. Topics get the ids t1, t2…; the
// same number with x is that topic's exercises (practiceOf).
function buildCatalog() {
  const items = [];
  const lessonGrades = new Map();
  let n = 0;
  const add = (item) => items.push({ ...item, id: `${item.topic ? "t" : "i"}${++n}` });

  let subjects = {};
  try {
    subjects = loadSubjects();
  } catch (err) {
    console.error("fox-chat: the subject areas didn't load:", err.message);
  }
  const subjectGrades = subjects.CURRICULUM_GRADES || {};
  const englishGrades = subjects.CURRICULUM_GRADES_ENGLISH || {};

  const index = siteSearch.buildIndex();
  index.filter((item) => item.k === "דף").forEach((item) => add(item));

  (seo.loadData().ENGLISH_TOPICS || []).forEach((topic) => {
    const g = grades(englishGrades[topic.id]);
    const ids = topic.lessons || (topic.lesson ? [topic.lesson] : []);
    ids.forEach((id) => g && lessonGrades.set(id, g));
    add({ t: topic.title, k: "נושא באנגלית", u: `/services/english#${encodeURIComponent(topic.id)}`, s: topic.titleEn || "", g, topic: true });
  });

  Object.entries(subjects.SUBJECT_AREAS || {}).forEach(([areaId, area]) => {
    const base = areaId === "road-safety" ? "/road-safety" : `/services/${areaId}`;
    area.topics.forEach((topic) => {
      const own = subjectGrades[topic.id];
      const lessons = topic.lessons || [];
      lessons.forEach((id) => lessonGrades.set(id, grades(subjectGrades[id] || own)));
      // A topic without grades of its own has its lessons' grades.
      const all = own || [...new Set(lessons.flatMap((id) => subjectGrades[id] || []))].sort((a, b) => a - b);
      add({ t: topic.title, k: `נושא ב${area.title}`, u: `${base}#${encodeURIComponent(topic.id)}`, s: "", g: grades(all), topic: true });
    });
  });

  // The lessons library and the blog. A lesson's grades: its own, or its topic's.
  index
    .filter((item) => item.k !== "דף" && item.k !== "נושא באנגלית")
    .forEach((item) => {
      const lessonId = /[?&]lesson=([^&]+)/.exec(item.u)?.[1];
      const id = lessonId && decodeURIComponent(lessonId);
      const g = id ? grades(subjectGrades[id]) || lessonGrades.get(id) || "" : "";
      add({ ...item, g });
    });

  items.forEach((item) => {
    item.title = ` ${norm(item.t)}`;
    item.text = ` ${norm(`${item.t} ${item.k} ${item.s}`)}`;
  });
  return { items, byId: new Map(items.map((item) => [item.id, item])) };
}

let catalog = null;
function getCatalog() {
  if (!catalog) catalog = buildCatalog();
  return catalog;
}

// "x12": topic t12's exercises.
function linkOf(id) {
  const { byId } = getCatalog();
  const practice = /^x(\d+)$/.exec(id);
  const item = byId.get(practice ? `t${practice[1]}` : id);
  if (!item) return null;
  if (practice && item.topic) return { t: `תרגילים: ${item.t}`, k: item.k.replace(/^נושא/, "תרגול"), u: `${item.u}/practice` };
  return { t: item.t, k: item.k, u: item.u };
}

/* ── The word search (the same rules as the search the fox opens) ── */

// Hebrew words take ו, ה, ב, ל, מ, ש, כ in front ("השברים", "בגוף").
const PREFIX = /^[והבלמשכ]/;
const STOP = new Set(
  (
    "אני אנחנו אתה את אתם הוא היא זה זאת זו יש אין של על עם אל מה מי איך איפה למה כמה מתי אפשר רוצה רוצים רציתי " +
    "צריך צריכים ללמוד לומד לומדים לתרגל תרגול תרגיל תרגילים שיעור שיעורים משהו קצת יותר הכי טוב כן לא גם או אבל " +
    "היי הי שלום בבקשה תודה לי לנו לו לך באתר אתר מחפש מחפשים תמצא תמצאי תן תני תביא עזרה תעזור כיתה בכיתה ילד ילדים " +
    "the a an i want to learn practice some please"
  ).split(" ")
);

function norm(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[֑-ׇ]/g, "")
    .replace(/[״"׳'`]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function has(text, word) {
  return text.includes(word) || (word.length > 3 && PREFIX.test(word) && text.includes(` ${word.slice(1)}`));
}

function queryWords(text) {
  return [...new Set(norm(text).split(" "))].filter((w) => w.length >= 2 && !STOP.has(w) && !(PREFIX.test(w) && STOP.has(w.slice(1))));
}

function score(item, words) {
  return words.reduce((sum, w) => sum + (has(item.title, w) ? 3 : has(item.text, w) ? 1 : 0), 0);
}

function search(items, words, limit) {
  if (!words.length) return [];
  return items
    .map((item, i) => ({ item, i, score: score(item, words) }))
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .slice(0, limit)
    .map((hit) => hit.item);
}

/* ── Limits ── */

const visits = new Map();
let day = { date: "", count: 0 };

function allowed(ip) {
  const now = Date.now();
  const today = new Date().toISOString().slice(0, 10);
  if (day.date !== today) day = { date: today, count: 0 };
  if (day.count >= PER_DAY_ALL) return false;
  const recent = (visits.get(ip) || []).filter((t) => now - t < 3600000);
  if (recent.length >= PER_HOUR) {
    visits.set(ip, recent);
    return false;
  }
  recent.push(now);
  visits.set(ip, recent);
  day.count++;
  // Forgets visitors who went quiet, so the map stays small.
  if (visits.size > 5000) {
    for (const [key, times] of visits) if (!times.some((t) => now - t < 3600000)) visits.delete(key);
  }
  return true;
}

/* ── The fox's answer ── */

const ANIMALS = ["שועל", "חתול", "כלב", "דוב", "ארנב", "פנדה", "אריה"];

function systemPrompt(animal) {
  return [
    `You are "ה${animal}" — the ${animal === "שועל" ? "fennec fox" : "animal"} mascot of Pleyi (פלייסקול), an Israeli learning website for kids, parents and teachers:`,
    "English, math, Hebrew, science, geography, history, the human body, road safety, class games and printable worksheets.",
    "You talk with kids (ages 6–14), parents and teachers on the site. Your one job: help them find the right lesson, exercise, game or page ON THIS SITE,",
    "and say in a few words what they will do there.",
    "",
    "Rules:",
    "- Write ONLY in very simple Hebrew, as to a young child, even when they write in English.",
    "  1–2 short sentences (up to 3 when you ask a question), each under 10 words and one idea, separated by \\n.",
    "- Don't repeat the titles of your links: they show under your words as buttons. Say what to do, e.g. \"קודם השיעור, ואז התרגילים\".",
    "- A small question with a one-word answer (how to say a word in English, 3×4): answer it in a few words, then link where to learn more.",
    "- No emoji, no markdown, no addresses in the text. Speak to the reader in the plural (לחצו, נסו, בחרו), like the site does. You are a boy fox: speak of yourself in the masculine (אני שמח).",
    "- Links: ONLY ids from the CATALOG below, 1–4 of them, the best first. Never invent pages, lessons or addresses.",
    "  If nothing in the catalog fits, say so kindly and offer the closest thing the site has.",
    "- A topic (id t…) opens its page, which has the topic's lessons and then its exercises.",
    "  The same number with x (t12 → x12) goes straight to that topic's exercises.",
    "  When they want to practice (לתרגל, תרגילים, תרגול), the FIRST link is the matching topic's x id; a lesson may follow.",
    "  When they want to learn, the topic (t…) or one lesson (i…) comes first.",
    "- A lesson id (i…) opens one lesson in the lessons library.",
    "- Grades are Hebrew letters (א = 1st grade … ט = 9th). When they say their grade, prefer items of that grade.",
    "  English beginners start with the first English topics (letters, greetings).",
    "- When the question is vague, give one or two good starting links and ask one short question (which subject? which grade?).",
    "- Don't solve homework or test questions with several steps; send them to the lesson that teaches it.",
    "- Anything not about learning on this site (personal questions, news, chat, anything not for kids): say kindly that you help find lessons and exercises here.",
    "- Never ask for personal details (name, phone, address, school) and don't repeat them.",
    "- No romance, no girls' or women's names, nothing scary or violent.",
    "",
    'Return JSON only: {"reply": "line\\nline", "links": ["id", ...]}',
  ].join("\n");
}

function catalogLine(item) {
  const extra = item.k === "דף" || item.topic ? item.s : item.s.slice(0, 70);
  return [item.id, item.t, item.k, item.g ? `כיתות ${item.g}` : "", extra].filter(Boolean).join(" | ");
}

function userPrompt({ message, history, page }, words) {
  const { items } = getCatalog();
  const always = items.filter((item) => item.topic || item.k === "דף");
  const topics = search(
    items.filter((item) => item.topic),
    words,
    MAX_TOPICS
  );
  const pool = search(
    items.filter((item) => !item.topic && item.k !== "דף"),
    words,
    MAX_POOL
  );
  const here = items.find((item) => item.k === "דף" && item.u === page.split("#")[0]);
  const lines = [
    `The page they are on now: ${here ? here.t : "-"} (${page || "/"})`,
    "",
    "CATALOG (id | title | kind | grades | more):",
    ...always.map(catalogLine),
    ...(topics.length ? ["", "Topics whose words match the question, best first:", ...topics.map(catalogLine)] : []),
    ...(pool.length ? ["", "Lessons and posts that may fit:", ...pool.map(catalogLine)] : []),
    "",
    "CONVERSATION:",
    ...history.map((m) => `${m.role === "fox" ? "fox" : "user"}: ${m.text}`),
    `user: ${message}`,
  ];
  return lines.join("\n");
}

function cleanReply(text) {
  return String(text || "")
    .replace(/\p{Extended_Pictographic}|️/gu, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[*#_`]/g, "")
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, 4)
    .join("\n")
    .slice(0, 400);
}

function cleanLinks(ids) {
  const seen = new Set();
  return (Array.isArray(ids) ? ids : [])
    .map((id) => linkOf(String(id).trim()))
    .filter((link) => link && !seen.has(link.u) && seen.add(link.u))
    .slice(0, MAX_LINKS);
}

// Without the model: the best matches of the word search.
function fallback(words) {
  const { items } = getCatalog();
  const links = search(items, words, MAX_LINKS).map((item) => linkOf(item.id));
  return {
    reply: links.length ? "הנה מה שמצאתי:" : "לא מצאתי משהו מתאים.\nנסו לכתוב נושא, למשל: שברים או צבעים באנגלית",
    links,
    ai: false,
  };
}

function cleanInput(body) {
  const message = String(body?.message || "").replace(/\s+/g, " ").trim().slice(0, MAX_MESSAGE);
  const history = (Array.isArray(body?.history) ? body.history : [])
    .filter((m) => m && (m.role === "user" || m.role === "fox") && typeof m.text === "string")
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role, text: m.text.replace(/\s+/g, " ").trim().slice(0, MAX_MESSAGE) }))
    .filter((m) => m.text);
  const page = String(body?.page || "/").slice(0, 160);
  const animal = ANIMALS.includes(body?.animal) ? body.animal : ANIMALS[0];
  return { message, history, page, animal };
}

async function ask(body, ip) {
  const input = cleanInput(body);
  if (!input.message) {
    const err = new Error("Empty question");
    err.status = 400;
    throw err;
  }
  // A follow-up ("ולכיתה ד?") searches with the question before it too.
  const lastAsked = [...input.history].reverse().find((m) => m.role === "user");
  const words = queryWords(input.message);
  const searchWords = words.length ? words : queryWords(lastAsked?.text || "");
  if (!englishPractice.isConfigured() || !allowed(ip)) return fallback(searchWords);
  const poolWords = lastAsked ? [...new Set([...words, ...queryWords(lastAsked.text)])] : words;
  try {
    const answer = await Promise.race([
      englishPractice.askModel(systemPrompt(input.animal), userPrompt(input, poolWords), 0.4),
      new Promise((_, reject) => setTimeout(() => reject(new Error("The fox took too long")), ASK_TIMEOUT_MS)),
    ]);
    // Now and then the model names the field otherwise.
    const reply = cleanReply(answer?.reply || answer?.text || answer?.message || answer?.answer);
    if (!reply) throw new Error("Empty fox reply");
    return { reply, links: cleanLinks(answer?.links), ai: true };
  } catch (err) {
    console.warn(`[fox-chat] ${err.message.split("\n")[0]}`);
    return fallback(searchWords);
  }
}

/** Adds POST /api/fox/ask to an express app. */
function mount(app, clientIp) {
  app.post("/api/fox/ask", async (req, res) => {
    try {
      res.json({ ok: true, ...(await ask(req.body, clientIp(req))) });
    } catch (e) {
      res.status(e.status || 500).json({ ok: false, error: e.message });
    }
  });
}

module.exports = { mount, ask, _internal: { getCatalog, queryWords, search, userPrompt, systemPrompt, linkOf } };
