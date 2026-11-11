const fs = require("fs");
const path = require("path");
const vm = require("vm");
const seo = require("./seo");

/**
 * The site search behind the fox (public/js/site-fox.js). One list of the
 * site's pages, lessons and English topics, built the first time it's asked
 * for:
 *
 *   GET /api/search-index → [{ t: title, k: kind, u: url, s: more words to match }]
 *
 * The lessons come from the same files the lessons library runs
 * (services/ready-lessons.html), so a new lesson shows up by itself.
 */

const JS_DIR = path.join(__dirname, "..", "public", "js");
// The lessons library's load order, up to ready-lessons.js.
const LESSON_FILES = [
  "english-vocab.js",
  "lesson-sentences-he.js",
  "english-dict.js",
  "english-lessons.js",
  "lesson-figures.js",
  "subject-lessons.js",
  "curriculum-grades.js",
  "ready-lessons.js",
];

// [url, title, more words]. The subject areas and the blog posts are added
// from their lists below.
const PAGES = [
  ["/services/ready-lessons", "ספריית השיעורים", "שיעורים מוכנים מצגות"],
  ["/services/english", "לומדים אנגלית", "english תרגילים קטעי קריאה מבחנים"],
  ["/services/worksheets", "דפי עבודה", "הדפסה יצירה צביעה"],
  ["/services/class-games", "משחקים לשיעור חברה", "משחקי לוח כיתה"],
  ["/together", "משחקים ביחד באנגלית", "אחד על אחד הישרדות קבוצה חברים תופסים מילים קוד משחק"],
  ["/services/game-builder", "יצירת משחק", "בונה משחקים"],
  ["/services/family", "משחקים להורים והילדים", "משפחה בבית"],
  ["/lesson-plans", "מערכי שיעור", ""],
  ["/games", "משחקים", ""],
  ["/my-room", "החדר שלי", "שיעורים ששמרתי"],
  ["/english", "מדריך אנגלית", "english"],
  ["/premium", "מנוי פרימיום", "תשלום"],
  ["/blog", "בלוג", "מאמרים טיפים"],
  ["/", "דף הבית", "ראשי"],
  ["/legal/accessibility.html", "הצהרת נגישות", ""],
  ["/legal/privacy.html", "מדיניות פרטיות", ""],
  ["/legal/terms.html", "תנאי שימוש", ""],
];
const SUBJECT_AREAS = ["math", "hebrew", "science", "geography", "history", "lifeskills", "body", "health"];

function loadLessons() {
  const noop = () => {};
  const none = () => null;
  // Just enough of a browser for the files to fill the catalog: the page
  // never finishes loading, so ready-lessons.js never draws anything.
  const win = {
    addEventListener: noop,
    matchMedia: () => ({ matches: false, addEventListener: noop }),
    location: { search: "", hash: "", pathname: "/" },
    localStorage: { getItem: none, setItem: noop },
    document: {
      readyState: "loading",
      addEventListener: noop,
      querySelector: none,
      querySelectorAll: () => [],
      getElementById: none,
      documentElement: { dataset: {}, lang: "he" },
      createElement: () => ({ style: {}, classList: { add: noop } }),
    },
  };
  win.window = win;
  const context = vm.createContext(Object.assign(win, { console, URLSearchParams, setTimeout, clearTimeout }));
  LESSON_FILES.forEach((file) => {
    vm.runInContext(fs.readFileSync(path.join(JS_DIR, file), "utf8"), context, { filename: file });
  });
  return win.ReadyLessons;
}

function buildIndex() {
  const items = PAGES.map(([u, t, s]) => ({ t, k: "דף", u, s }));

  let lessons = null;
  try {
    lessons = loadLessons();
  } catch (err) {
    console.error("site-search: the lessons didn't load:", err.message);
  }
  const labels = lessons?.subjectLabels || {};
  SUBJECT_AREAS.forEach((id) => {
    if (labels[id]) items.push({ t: `לומדים ${labels[id]}`, k: "דף", u: `/services/${id}`, s: "תרגול שיעורים" });
  });

  (seo.loadData().ENGLISH_TOPICS || []).forEach((topic) => {
    items.push({ t: topic.title, k: "נושא באנגלית", u: `/services/english#${encodeURIComponent(topic.id)}`, s: topic.titleEn || "" });
  });

  Object.values(lessons?.catalog || {}).forEach((lesson) => {
    items.push({
      t: lesson.namePart || lesson.name,
      k: `שיעור ${labels[lesson.subject] || ""}`.trim(),
      u: `/services/ready-lessons?lesson=${encodeURIComponent(lesson.id)}`,
      s: [lesson.nameMain, lesson.summary, ...(lesson.vocab || []).map((word) => word.en)].filter(Boolean).join(" "),
    });
  });

  seo.STATIC_PAGES.filter(([url]) => url.startsWith("/blog/")).forEach(([url, file]) => {
    const title = seo.pageTitle(file);
    if (title) items.push({ t: title, k: "בלוג", u: url, s: "" });
  });
  return items;
}

let built = null;
function index() {
  if (!built) built = JSON.stringify(buildIndex());
  return built;
}

/** Adds GET /api/search-index to an express app. */
function mount(app) {
  app.get("/api/search-index", (_req, res) => {
    // Changes only with a deploy; the ETag lets the browser keep its copy.
    res.set("Cache-Control", "no-cache");
    res.type("json").send(index());
  });
}

module.exports = { mount, buildIndex };
