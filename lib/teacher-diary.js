const fs = require("fs");
const path = require("path");
const vm = require("vm");
const crypto = require("crypto");
const { getFirestore } = require("./firebase-admin");

/**
 * The teacher's diary ("היומן שלי" on /my-room): a plan of the school days,
 * a week or a month at a time. Each day has the goals the teacher wrote for
 * it and the lessons planned for it, picked from the site's lessons
 * (English and the school subjects) or the teacher's own lessons.
 *
 * A planned lesson can be sent to the students: every file of the teacher
 * (or of one of the teacher's classes) gets two tasks — the lesson itself
 * and its practice set, the exercises of that lesson only (the same set as
 * "תרגול לשיעור N" on the topic's page) — that open on the lesson's day.
 * Until then the student sees them locked (lib/student-progress.js keeps
 * the tasks, `opensOn`). With "שליחה אוטומטית" on, every lesson the teacher
 * plans is sent as it is saved.
 *
 * One record per teacher: Firestore `teacherDiary/{uid}` when a service
 * account is configured, else the local data/teacher-diary.json — the same
 * split as lib/classes.js.
 */

const DIARY_FILE = path.join(__dirname, "..", "data", "teacher-diary.json");
const COLLECTION = "teacherDiary";
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const ID = /^[a-f0-9]{12}$/;
const MAX_DAYS = 500;
const MAX_LESSONS = 8;
const MAX_GOALS = 8;
const MAX_SEND_DAYS = 62;

const JS_DIR = path.join(__dirname, "..", "public", "js");
// In the order the English page loads them: english-more.js builds each
// lesson's extra exercises from the topics the others made.
const ENGLISH_FILES = ["english-vocab.js", "english-lessons.js", "english-data.js", "english-reading.js", "english-reading-sets.js", "english-dict.js", "english-more.js"];
const SUBJECT_FILES = ["subject-lessons.js", "subject-practice.js"];
const AREA_PAGES = { english: "/services/english", "road-safety": "/road-safety" };
// A topic page leaves these out of a lesson's practice: a passage is its
// own kind of work, and speaking only shows where the browser hears speech.
const NOT_PRACTICE = new Set(["reading", "speak", "exam"]);

function str(value, max = 200) {
  return String(value ?? "").trim().slice(0, max);
}

function fail(message, status = 400) {
  return Object.assign(new Error(message), { status });
}

function newId() {
  return crypto.randomBytes(6).toString("hex");
}

function israelToday() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" });
}

/* ── The lessons: every lesson of the site's learning paths, with its topic
   and its practice set, read once from the same files the browser uses. ── */

let catalog = null;

function runFiles(files, globals = {}) {
  const win = { addEventListener() {} };
  const context = vm.createContext({ window: win, URLSearchParams, ...globals });
  files.forEach((file) => vm.runInContext(fs.readFileSync(path.join(JS_DIR, file), "utf8"), context, { filename: file }));
  return win;
}

// "שיעור 2 – Hello, Goodbye" in the picker; "<topic> – <part>" on the
// student's task, where there is no topic around it.
function lessonNames(topic, lesson, num, count) {
  const part = lesson?.part || "";
  return {
    title: count > 1 ? (part ? `שיעור ${num} – ${part}` : `שיעור ${num}`) : part || lesson?.name || topic.title,
    name: part ? `${topic.title} – ${part}` : count > 1 ? `${topic.title} – שיעור ${num}` : topic.title,
  };
}

// A lesson's practice: the page's #<topic>/set-<lesson> for a topic of two
// lessons or more (english-learning.js practiceSets), its whole practice
// for a topic of one (#<topic>/practice).
function practiceOf(topic, lessonId, lessonIds) {
  const practice = (topic.exercises || []).filter((ex) => !NOT_PRACTICE.has(ex.type));
  let list;
  if (topic.sets?.length) {
    const set = topic.sets.find((s) => s.lesson === lessonId);
    list = set ? practice.filter((ex) => ex.set === set.id) : [];
  } else if (lessonIds.length > 1 && practice.some((ex) => ex.lesson)) {
    list = practice.filter((ex) => ex.lesson === lessonId);
  } else {
    list = practice.filter((ex) => !ex.set);
  }
  if (!list.length) return null;
  return {
    hash: lessonIds.length > 1 && list.length < practice.length ? `set-${lessonId}` : "practice",
    items: list.map((ex) => `${topic.id}/${ex.id}`),
  };
}

function buildArea(id, title, stages, topicsById, lessonsById) {
  const page = AREA_PAGES[id] || `/services/${id}`;
  const index = [];
  const out = stages
    .map((stage) => ({
      title: stage.title,
      topics: stage.topics
        .map((topicId) => topicsById.get(topicId))
        .filter(Boolean)
        .map((topic) => {
          const ids = topic.lessons || (topic.lesson ? [topic.lesson] : []);
          const lessons = ids.map((lessonId, i) => {
            const names = lessonNames(topic, lessonsById.get(lessonId), i + 1, ids.length);
            index.push({
              id: lessonId,
              area: id,
              page,
              topicId: topic.id,
              topicTitle: topic.title,
              ...names,
              practice: practiceOf(topic, lessonId, ids),
            });
            return { id: lessonId, ...names };
          });
          return { id: topic.id, title: topic.title, lessons };
        })
        .filter((topic) => topic.lessons.length),
    }))
    .filter((stage) => stage.topics.length);
  return { area: { id, title, stages: out }, index };
}

function loadCatalog() {
  if (catalog) return catalog;
  const areas = [];
  const lessons = new Map();
  const add = ({ area, index }) => {
    if (!area.stages.length) return;
    areas.push(area);
    index.forEach((lesson) => {
      if (!lessons.has(lesson.id)) lessons.set(lesson.id, lesson);
    });
  };
  try {
    const win = runFiles(ENGLISH_FILES);
    const topics = new Map((win.ENGLISH_TOPICS || []).map((t) => [t.id, t]));
    const short = new Map((win.ENGLISH_SHORT_LESSONS || []).map((l) => [l.id, l]));
    add(buildArea("english", "אנגלית", win.ENGLISH_PATH || [], topics, short));
    catalog = { merged: win.ENGLISH_LESSON_MERGED || {} };
  } catch (err) {
    console.error("teacher diary: English lessons:", err.message);
    catalog = { merged: {} };
  }
  try {
    const win = runFiles(SUBJECT_FILES, { location: { pathname: "/", search: "" }, document: { getElementById: () => null } });
    const short = new Map((win.SUBJECT_SHORT_LESSONS || []).map((l) => [l.id, l]));
    Object.entries(win.SUBJECT_AREAS || {}).forEach(([id, area]) => {
      const topics = new Map(area.topics.map((t) => [t.id, t]));
      add(buildArea(id, area.title, area.path, topics, short));
    });
  } catch (err) {
    console.error("teacher diary: subject lessons:", err.message);
  }
  catalog.areas = areas;
  catalog.lessons = lessons;
  return catalog;
}

// The picker's list: areas → stages → topics → lessons ({ id, title, name }).
function getCatalog() {
  return { areas: loadCatalog().areas };
}

// A site lesson by its id (a merged short lesson by the one it went into).
function siteLesson(id) {
  const { lessons, merged } = loadCatalog();
  return lessons.get(id) || lessons.get(merged[id]) || null;
}

/* ── Storage ── */

function loadLocal() {
  try {
    if (fs.existsSync(DIARY_FILE)) return JSON.parse(fs.readFileSync(DIARY_FILE, "utf8")) || {};
  } catch {
    /* ignore */
  }
  return {};
}

function saveLocal(all) {
  fs.mkdirSync(path.dirname(DIARY_FILE), { recursive: true });
  fs.writeFileSync(DIARY_FILE, JSON.stringify(all, null, 2), "utf8");
}

function emptyDiary(uid) {
  return { uid, auto: false, target: "all", days: {}, updatedAt: null };
}

async function readDiary(uid) {
  const db = getFirestore();
  if (db) {
    const doc = await db.collection(COLLECTION).doc(uid).get();
    return doc.exists ? { ...emptyDiary(uid), ...doc.data() } : emptyDiary(uid);
  }
  return { ...emptyDiary(uid), ...loadLocal()[uid] };
}

// The oldest days go first once the diary holds MAX_DAYS of them.
function trimDays(diary) {
  const keys = Object.keys(diary.days).sort();
  keys.slice(0, Math.max(0, keys.length - MAX_DAYS)).forEach((k) => delete diary.days[k]);
}

async function editDiary(uid, mutate) {
  const db = getFirestore();
  if (db) {
    const ref = db.collection(COLLECTION).doc(uid);
    return db.runTransaction(async (tx) => {
      const doc = await tx.get(ref);
      const diary = doc.exists ? { ...emptyDiary(uid), ...doc.data() } : emptyDiary(uid);
      const result = mutate(diary);
      trimDays(diary);
      diary.updatedAt = new Date().toISOString();
      tx.set(ref, diary);
      return result;
    });
  }
  const all = loadLocal();
  const diary = { ...emptyDiary(uid), ...all[uid] };
  const result = mutate(diary);
  trimDays(diary);
  diary.updatedAt = new Date().toISOString();
  all[uid] = diary;
  saveLocal(all);
  return result;
}

function view(diary) {
  return { auto: !!diary.auto, target: diary.target || "all", days: diary.days || {} };
}

/* ── The teacher's side ── */

function cleanTarget(value, classIds) {
  const target = str(value, 40);
  return target !== "all" && classIds.includes(target) ? target : "all";
}

// A lesson the teacher made (/my-room "יצירת שיעור"): "my-<id>".
const MY_LESSON = /^my-([A-Za-z0-9_-]{6,40})$/;

// What a planned lesson keeps: the lesson's id and names, and once sent,
// when and to how many files.
function lessonEntry(lessonId, myLessons) {
  const mine = String(lessonId).match(MY_LESSON);
  if (mine) {
    const own = myLessons.find((l) => l.id === mine[1]);
    if (!own) return null;
    return { lessonId, area: "mine", name: own.title || "השיעור שלי", topicTitle: "השיעורים שלי" };
  }
  const lesson = siteLesson(lessonId);
  if (!lesson) return null;
  return { lessonId: lesson.id, area: lesson.area, name: lesson.name, topicTitle: lesson.topicTitle };
}

// The tasks a planned lesson becomes on a student's file.
function tasksOf(entry) {
  const mine = entry.lessonId.match(MY_LESSON);
  if (mine) {
    return [{ topicId: "my-lessons", exerciseId: `lesson-${entry.lessonId}`, topicTitle: "השיעורים שלי", exerciseTitle: entry.name, type: "lesson" }];
  }
  const lesson = siteLesson(entry.lessonId);
  if (!lesson) return [];
  const tasks = [
    { topicId: lesson.topicId, exerciseId: `lesson-${lesson.id}`, topicTitle: lesson.topicTitle, exerciseTitle: lesson.name, type: "lesson", page: lesson.page },
  ];
  if (lesson.practice) {
    tasks.push({
      topicId: lesson.topicId,
      exerciseId: lesson.practice.hash,
      topicTitle: lesson.topicTitle,
      exerciseTitle: `תרגול: ${lesson.name}`,
      type: "set",
      page: lesson.page,
      items: lesson.practice.items,
    });
  }
  return tasks;
}

module.exports = function createDiary({ studentProgress, classes, teacherLessons }) {
  async function classIdsOf(uid) {
    return (await classes.listClasses(uid)).map((c) => c.id);
  }

  // Sends the lessons of `days` that weren't sent yet — or, with `again`,
  // all of them, so files opened since get them too (a file that has a
  // lesson's tasks never gets them twice).
  async function sendDays(uid, days, { again = false } = {}) {
    const diary = await readDiary(uid);
    const wanted = new Set(days.filter((d) => DAY.test(d)));
    const lessons = [];
    Object.entries(diary.days)
      .filter(([day]) => wanted.has(day))
      .forEach(([day, entry]) =>
        (entry.lessons || []).forEach((l) => {
          if (again || !l.sentAt) lessons.push({ diaryId: l.id, opensOn: day, tasks: tasksOf(l) });
        })
      );
    const sendable = lessons.filter((l) => l.tasks.length);
    if (!sendable.length) return { lessons: 0, students: 0, diary: view(diary) };
    const classId = diary.target !== "all" && (await classIdsOf(uid)).includes(diary.target) ? diary.target : "";
    const { students } = await studentProgress.sendDiaryTasks(uid, { classId, lessons: sendable });
    const now = new Date().toISOString();
    const sentIds = new Set(sendable.map((l) => l.diaryId));
    const updated = await editDiary(uid, (d) => {
      Object.values(d.days).forEach((entry) =>
        (entry.lessons || []).forEach((l) => {
          if (!sentIds.has(l.id)) return;
          l.sentAt = now;
          l.sentTo = students;
        })
      );
      return view(d);
    });
    return { lessons: sendable.length, students, diary: updated };
  }

  async function get(uid) {
    return { diary: view(await readDiary(uid)) };
  }

  async function saveSettings(uid, fields = {}) {
    const classIds = await classIdsOf(uid);
    let turnedOn = false;
    await editDiary(uid, (diary) => {
      if ("auto" in fields) {
        turnedOn = fields.auto === true && !diary.auto;
        diary.auto = fields.auto === true;
      }
      if ("target" in fields) diary.target = cleanTarget(fields.target, classIds);
    });
    // Turning "send by itself" on sends what is planned from today on.
    if (turnedOn) {
      const today = israelToday();
      const days = Object.keys((await readDiary(uid)).days).filter((d) => d >= today);
      const sent = await sendDays(uid, days.slice(0, MAX_SEND_DAYS * 4));
      return { diary: sent.diary, sent: { lessons: sent.lessons, students: sent.students } };
    }
    return get(uid);
  }

  // A day as the teacher saved it: its goals (text) and its lessons, each
  // either one already planned ({ id }) or a new one ({ lessonId }). A sent
  // lesson that is taken off leaves the files of the students that didn't
  // start it.
  async function saveDay(uid, day, body = {}) {
    if (!DAY.test(String(day))) throw fail("תאריך לא תקין");
    const goals = (Array.isArray(body.goals) ? body.goals : [])
      .map((g) => str(typeof g === "string" ? g : g?.text, 200))
      .filter(Boolean)
      .slice(0, MAX_GOALS);
    const asked = (Array.isArray(body.lessons) ? body.lessons : []).slice(0, MAX_LESSONS);
    const needsMine = asked.some((l) => MY_LESSON.test(String(l?.lessonId || "")));
    const myLessons = needsMine ? await teacherLessons.listLessons(uid) : [];
    let removed = [];
    let fresh = [];
    const diary = await editDiary(uid, (d) => {
      const before = d.days[day]?.lessons || [];
      const kept = [];
      asked.forEach((l) => {
        const id = str(l?.id, 20);
        const old = ID.test(id) && before.find((b) => b.id === id);
        if (old) {
          kept.push(old);
          return;
        }
        const entry = lessonEntry(str(l?.lessonId, 80), myLessons);
        if (entry) kept.push({ id: newId(), ...entry, sentAt: null, sentTo: 0 });
      });
      removed = before.filter((b) => b.sentAt && !kept.some((k) => k.id === b.id)).map((b) => b.id);
      fresh = kept.filter((k) => !k.sentAt);
      if (!goals.length && !kept.length) delete d.days[day];
      else d.days[day] = { goals: goals.map((text) => ({ text })), lessons: kept };
      return d;
    });
    if (removed.length) await studentProgress.removeDiaryTasks(uid, removed);
    if (diary.auto && fresh.length) {
      const sent = await sendDays(uid, [day]);
      return { diary: sent.diary, sent: { lessons: sent.lessons, students: sent.students } };
    }
    return { diary: view(diary) };
  }

  // "שליחה לתלמידים" on a day or a week: `days` and whether to send again.
  async function send(uid, body = {}) {
    const days = (Array.isArray(body.days) ? body.days : []).map((d) => str(d, 10)).slice(0, MAX_SEND_DAYS);
    if (!days.length) throw fail("לא נבחר יום");
    const sent = await sendDays(uid, days, { again: body.again === true });
    return { diary: sent.diary, sent: { lessons: sent.lessons, students: sent.students } };
  }

  return { getCatalog, get, saveSettings, saveDay, send };
};
