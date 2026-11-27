/* The developer panel (/admin/dev) — for the site owner only.

   The page itself (private/dev-panel/index.html) holds no data: everything
   comes from /api/admin/dev/overview, which server.js guards with
   requireOwner (a verified Google sign-in on one of OWNER_EMAILS).
   The panel only reads — it never changes anything on the site.

   Requiring this file also starts keeping the server's last warnings and
   errors (console.warn / console.error) in memory, so the panel can show
   them. They're lost on a restart. */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { getFirestore } = require("./firebase-admin");

const ROOT = path.join(__dirname, "..");
const STARTED_AT = new Date();

/* ── The last warnings and errors ── */

const LOG_LIMIT = 100;
const log = [];

function keep(level, args) {
  const text = args
    .map((a) => (a instanceof Error ? a.stack || a.message : typeof a === "string" ? a : safeJson(a)))
    .join(" ")
    .slice(0, 2000);
  log.push({ at: new Date().toISOString(), level, text });
  if (log.length > LOG_LIMIT) log.shift();
}

function safeJson(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

["warn", "error"].forEach((level) => {
  const original = console[level].bind(console);
  console[level] = (...args) => {
    try {
      keep(level, args);
    } catch {
      /* never let the log break the server */
    }
    original(...args);
  };
});

process.on("unhandledRejection", (reason) => console.error("[unhandledRejection]", reason));

/* ── Which version is running ── */

let versionCache;

function version() {
  if (versionCache !== undefined) return versionCache;
  versionCache = null;
  if (process.env.RENDER_GIT_COMMIT) {
    versionCache = { commit: process.env.RENDER_GIT_COMMIT.slice(0, 7), subject: "", date: "" };
    return versionCache;
  }
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%h%n%s%n%cI"], { cwd: ROOT, timeout: 3000, encoding: "utf8" });
    const [commit, subject, date] = out.trim().split("\n");
    versionCache = { commit, subject, date };
  } catch {
    /* no git here */
  }
  return versionCache;
}

/* ── On/off switches in the code ──
   Every top-level `const NAME = true|false;` in the server and the site's
   scripts, with the comment written right above it. */

const FLAG_FILES = () => [
  "server.js",
  ...fs.readdirSync(path.join(ROOT, "lib")).filter((f) => f.endsWith(".js")).map((f) => `lib/${f}`),
  ...fs.readdirSync(path.join(ROOT, "public", "js")).filter((f) => f.endsWith(".js")).map((f) => `public/js/${f}`),
];

const FLAG_LINE = /^\s*(?:const|let|var) ([A-Z][A-Z0-9_]+) = (true|false);/;

function scanFlags() {
  const flags = [];
  FLAG_FILES().forEach((file) => {
    let lines;
    try {
      lines = fs.readFileSync(path.join(ROOT, file), "utf8").split(/\r?\n/);
    } catch {
      return;
    }
    lines.forEach((line, i) => {
      const m = FLAG_LINE.exec(line);
      if (!m) return;
      const note = [];
      for (let j = i - 1; j >= 0 && /^\s*\/\//.test(lines[j]); j--) note.unshift(lines[j].replace(/^\s*\/\/\s?/, ""));
      flags.push({ name: m[1], on: m[2] === "true", file, line: i + 1, note: note.join(" ").trim() });
    });
  });
  return flags;
}

/* ── How many students, teachers, classes ──
   Read straight from the same places lib/student-progress.js,
   lib/classes.js and lib/teacher-lessons.js keep them. */

const DAY_MS = 86400000;
const COUNTS_TTL_MS = 60000;
let countsCache = null;

function readLocal(file, key) {
  try {
    return Object.values(JSON.parse(fs.readFileSync(path.join(ROOT, "data", file), "utf8"))[key] || {});
  } catch {
    return [];
  }
}

function summarize(students, classCount, lessonCount) {
  const weekAgo = new Date(Date.now() - 7 * DAY_MS).toISOString();
  const teachers = new Set(students.map((s) => s.ownerUid).filter(Boolean));
  return {
    students: students.length,
    teachers: teachers.size,
    activeWeek: students.filter((s) => (s.lastActive || "") >= weekAgo).length,
    newWeek: students.filter((s) => (s.createdAt || "") >= weekAgo).length,
    classes: classCount,
    teacherLessons: lessonCount,
  };
}

async function counts() {
  if (countsCache && Date.now() - countsCache.at < COUNTS_TTL_MS) return countsCache.data;
  const db = getFirestore();
  let data;
  if (db) {
    const [students, classes, lessons] = await Promise.all([
      db.collection("students").select("ownerUid", "lastActive", "createdAt").get(),
      db.collection("classes").count().get(),
      db.collection("teacherLessons").count().get(),
    ]);
    data = summarize(students.docs.map((d) => d.data()), classes.data().count, lessons.data().count);
  } else {
    data = summarize(
      readLocal("student-progress.json", "students"),
      readLocal("classes.json", "classes").length,
      readLocal("teacher-lessons.json", "lessons").length
    );
  }
  countsCache = { at: Date.now(), data };
  return data;
}

/* ── Everything the panel shows ── */

const mb = (bytes) => Math.round(bytes / 1048576);

async function overview({ ownerEmails, models }) {
  const mem = process.memoryUsage();
  let data = null;
  let dataError = null;
  try {
    data = await counts();
  } catch (err) {
    dataError = err.message;
  }
  return {
    now: new Date().toISOString(),
    server: {
      host: process.env.RENDER ? "Render" : "מחשב מקומי",
      startedAt: STARTED_AT.toISOString(),
      uptimeSec: Math.round(process.uptime()),
      node: process.version,
      memoryMb: { rss: mb(mem.rss), heapUsed: mb(mem.heapUsed), heapTotal: mb(mem.heapTotal) },
      version: version(),
    },
    // Only whether each key is set — never the keys themselves.
    services: {
      firebaseSignIn: !!(process.env.FIREBASE_API_KEY || fs.existsSync(path.join(ROOT, "data", "firebase.json"))),
      storage: getFirestore() ? "firestore" : "local",
      openai: !!process.env.OPENAI_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY,
      brevo: !!(process.env.BREVO_API_KEY && Number(process.env.BREVO_LIST_ID)),
      ownerEmails: ownerEmails.length,
    },
    models,
    data,
    dataError,
    flags: scanFlags(),
    log: log.slice().reverse(),
  };
}

module.exports = { overview };
