const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { getFirestore } = require("./firebase-admin");
const { studentMap, subjectMaps, mergedLessonId, isStageTest, isPathStage } = require("./english-map");
const { moreCertificates, noteAllCertificates } = require("./certificates");
const { stickersFor } = require("./stickers");
const classesLib = require("./classes");

/**
 * Student files, opened by the teacher at /admin/students. Each file has a
 * secret link key (/s/<key>); whatever the student does through it —
 * exercises, lessons, games — is recorded in the file, next to the teacher's
 * homework, notes and "where we are" text. Students never sign in.
 *
 * Teachers sign in with Google, and every file belongs to the teacher who
 * opened it (`ownerUid`): the teacher-side calls all take that uid and treat
 * someone else's file as not found. Files from before sign-in have no owner
 * until a teacher claims them with the teacher PIN (claimUnowned).
 *
 * Uses Firestore (`students/{id}` + `students/{id}/activity`, and the mistake
 * bank in `students/{id}/meta/review`) when a service account is configured,
 * so files survive redeploys. Falls back to the local
 * JSON file (data/student-progress.json) when it isn't — same split as
 * lib/premium.js.
 */

const PROGRESS_FILE = path.join(__dirname, "..", "data", "student-progress.json");
const COLLECTION = "students";
const LOCAL_ACTIVITY_CAP = 1000;
const ACTIVITY_READ_LIMIT = 400;
const MAX_MISTAKES = 20;
const MAX_NOTES = 200;
const MAX_HOMEWORK = 200;
const MAX_HELP = 30;
const HELP_GAP_MS = 60 * 1000;

/* ── Tests: the teacher picks topics on the student's file and the student
   gets a test with new questions from each (public/js/english-tests.js,
   run by english-learning.js #test/<id>). A test is handed in once; after
   that the student can ask for a retake, and every retake the teacher
   allows lets it be handed in once more. Each hand-in is an attempt with
   its grade and the grade of every topic; its answers stay in the activity
   it came with (`activityId`), so the file itself stays small. ── */
const MAX_TESTS = 50;
const MAX_TEST_TOPICS = 8;

/* ── Stage tests: at the end of every stage of the English path the student
   can take tests on all of its topics, many kinds (english-tests.js,
   ENGLISH_STAGE_TESTS), with no teacher sending them. Each one is handed in
   once and never again: `stageTests` keeps it by "<stage id>.<kind>", with
   the same grades as a teacher's test. ── */
const STAGE_TEST = "stage-test";
const MAX_STAGE_TOPICS = 24;
const MAX_TEST_MISTAKES = 30;
const MAX_TEST_ASKED = 40;

/* ── The placement test (#placement on the English page): it climbs the
   path's stages until the questions get too hard, and says which stage to
   start in. The file keeps the last result (`placement`: the stage's id,
   how many stages were passed and when); the teacher sees it on the file
   and in the class report, and the student's map starts from it until the
   student practices something newer. A teacher's task for it is topicId
   and exerciseId "placement". It earns no points (it can be taken again
   any time), and its mistakes stay out of the reports: it asks on purpose
   until the student doesn't know. ── */
const PLACEMENT = "placement";
const KEY_PATTERN = /^[A-Za-z0-9_-]{20,64}$/;

const KINDS = ["exercise", "lesson", "presentation", "game"];

/* ── Points: every right answer earns points, more on harder levels, so the
   more a student practices — and the better — the higher they climb on
   their class leaderboard. Exercises send their level (1–3, reading passages
   and exams 1–4); older activities without one get the level their type
   stands for, the same defaults as public/js/english-more.js. A reading exam
   (type "exam") counts each question as two half-points (it can give half
   credit), so its right answers are worth double. ── */
const LEVEL_POINTS = { 1: 10, 2: 15, 3: 20, 4: 25 };
const TYPE_LEVEL = {
  choice: 1,
  match: 1,
  picture: 1,
  "pick-picture": 1,
  translate: 1,
  listen: 2,
  truefalse: 2,
  order: 2,
  letters: 2,
  "find-error": 2,
  "sentence-choice": 2,
  speak: 2,
  write: 3,
  dictation: 3,
};
const PERFECT_BONUS = 20;
const ROUND_POINTS_CAP = 600;
// A game's right answers come fast (a minute of picking pictures), so each
// is worth less than an exercise answer; its stars make up the difference.
const GAME_POINTS_PER_RIGHT = 5;
const GAME_POINTS_PER_STAR = 10;
const GAME_POINTS_CAP = 300;
// Games that don't report right answers (the general games on /play).
const GAME_FLAT_POINTS = 10;
const LEADERBOARD_CAP = 100;

/* ── Mistake bank: every question the student got wrong in the English
   practice, until they answer it right REVIEW_GOAL times in a row; a new
   mistake starts the count over (public/js/mistake-bank.js keeps the same
   rules for its copy in the browser). It lives apart from the file, in
   students/{id}/meta/review, because the leaderboard reads every file of the
   class and the bank can be long. The question itself is kept as JSON text,
   since Firestore can't store arrays inside arrays. ── */
const REVIEW_GOAL = 3;
const REVIEW_CAP = 200;
const MAX_REVIEW_OPS = 40;
const MAX_REVIEW_ITEM = 2500;

/* ── Flashcards: where every vocabulary word stands on the student's cards
   ("כרטיסיות מילים" on the English page) — its box (1–6, a box up for each
   "I knew it"), the day it comes back and the day it was first shown. The
   page works the boxes out (english-learning.js) and sends each word's new
   place; the file only keeps them, in students/{id}/meta/cards like the
   mistake bank. A word in box CARDS_LEARNED or higher counts as learned. ── */
const CARDS_LEARNED = 4;
const CARDS_CAP = 400;
const MAX_CARD_OPS = 60;
const WORD_ID = /^[a-z0-9-]{1,40}$/;
const DAY = /^\d{4}-\d{2}-\d{2}$/;

function pointsFor(activity) {
  if (activity.type === PLACEMENT) return 0;
  if (activity.kind === "exercise") {
    const level = activity.level || TYPE_LEVEL[activity.type] || 1;
    const perRight = LEVEL_POINTS[level] || LEVEL_POINTS[1];
    // A mistakes-only retry goes over questions already counted once.
    if (activity.isRetry) return Math.min(ROUND_POINTS_CAP, Math.round((activity.score * perRight) / 2));
    const perfect = activity.total >= 4 && activity.score === activity.total;
    return Math.min(ROUND_POINTS_CAP, activity.score * perRight + (perfect ? PERFECT_BONUS : 0));
  }
  if (activity.kind === "game") {
    if (activity.correct == null) return GAME_FLAT_POINTS;
    return Math.min(GAME_POINTS_CAP, activity.correct * GAME_POINTS_PER_RIGHT + (activity.stars || 0) * GAME_POINTS_PER_STAR);
  }
  return 0;
}

// The Sunday that starts `date`'s week in Israel, as YYYY-MM-DD — weekly
// points start over every Sunday.
function weekOf(date = new Date()) {
  const day = new Date(date).toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" });
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - d.getUTCDay());
  return d.toISOString().slice(0, 10);
}

function addPoints(student, activity) {
  const points = { total: 0, week: 0, weekOf: "", ...student.points };
  const week = weekOf(activity.at);
  if (week > points.weekOf) {
    points.week = 0;
    points.weekOf = week;
  }
  points.total += activity.points;
  if (week === points.weekOf) points.week += activity.points;
  student.points = points;
}

// Files from before points existed: their totals, worked out from the
// activity they already have.
function backfillPoints(student, activities) {
  student.points = { total: 0, week: 0, weekOf: weekOf() };
  activities.forEach((a) => {
    if (KINDS.includes(a.kind)) addPoints(student, { ...a, points: a.points ?? pointsFor(a) });
  });
  return student.points;
}

// The lessons a file's activity opened (lesson id → the last time), for
// files from before the file kept them (`lessonsSeen`, for the student's map).
function lessonsSeenFrom(activities) {
  const seen = {};
  activities.forEach((a) => {
    if (a.kind === "lesson" && a.itemId && !(seen[a.itemId] >= a.at)) seen[a.itemId] = a.at;
  });
  return seen;
}

// What the student and the leaderboard see: this week's points are 0 until
// the student practices in it.
function pointsView(student) {
  const p = student.points || {};
  return { total: p.total || 0, week: p.weekOf === weekOf() ? p.week || 0 : 0 };
}

// Classmates see a first name and the initial of the last one.
function shortName(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return parts[0] || "";
  return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
}

function notFound(message = "התלמיד לא נמצא") {
  const err = new Error(message);
  err.status = 404;
  return err;
}

// The teacher turned the student's sign-in off ("השבתת כניסה" in the file):
// the link and the email stop working, the file and its progress stay.
function blockedError() {
  const err = new Error("הכניסה לחשבון הושבתה. לפרטים פנו למורה");
  err.status = 403;
  return err;
}

function str(value, max = 200) {
  return String(value ?? "").trim().slice(0, max);
}

function num(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.round(n)));
}

// The student's sign-in email, as the teacher writes it on the file; "" when
// it isn't an email.
function cleanEmail(value) {
  const email = str(value, 254).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

function newKey() {
  return crypto.randomBytes(18).toString("base64url");
}

function isKey(key) {
  return KEY_PATTERN.test(String(key || ""));
}

function cleanActivity(raw) {
  const kind = KINDS.includes(raw?.kind) ? raw.kind : null;
  if (!kind) throw new Error("סוג פעילות לא תקין");
  const base = { id: crypto.randomBytes(8).toString("hex"), kind, at: new Date().toISOString() };

  if (kind === "exercise") {
    const total = num(raw.total, 0, 500);
    if (!str(raw.topicId) || !str(raw.exerciseId) || !total) throw new Error("חסרים פרטי תרגיל");
    const activity = {
      ...base,
      topicId: str(raw.topicId, 80),
      topicTitle: str(raw.topicTitle, 120),
      exerciseId: str(raw.exerciseId, 80),
      exerciseTitle: str(raw.exerciseTitle, 160),
      type: str(raw.type, 30),
      level: raw.level == null ? null : num(raw.level, 1, 4),
      score: num(raw.score, 0, total),
      total,
      isRetry: !!raw.isRetry,
      isNew: !!raw.isNew,
      durationSec: num(raw.durationSec, 0, 6 * 3600),
      // A mistakes retry sends the score of the round it fixed, after the fix.
      ...(raw.isRetry && num(raw.fixedTotal, 0, 500)
        ? { fixedScore: num(raw.fixedScore, 0, num(raw.fixedTotal, 0, 500)), fixedTotal: num(raw.fixedTotal, 0, 500) }
        : {}),
      mistakes: (Array.isArray(raw.mistakes) ? raw.mistakes : []).slice(0, isTestType(raw.type) ? MAX_TEST_MISTAKES : MAX_MISTAKES).map((m) => ({
        prompt: str(m?.prompt, 200),
        answer: str(m?.answer, 200),
        given: str(m?.given, 200),
      })),
      ...(isTestType(raw.type) ? testResult(raw, total, raw.type === STAGE_TEST ? MAX_STAGE_TOPICS : MAX_TEST_TOPICS) : {}),
      ...(raw.type === PLACEMENT ? placementResult(raw) : {}),
    };
    return { ...activity, points: pointsFor(activity) };
  }

  if (kind === "game") {
    if (!str(raw.gameId)) throw new Error("חסר מזהה משחק");
    const activity = {
      ...base,
      gameId: str(raw.gameId, 80),
      gameTitle: str(raw.gameTitle, 160),
      score: num(raw.score, 0, 1e7),
      correct: raw.correct == null ? null : num(raw.correct, 0, 200),
      stars: num(raw.stars, 0, 3),
    };
    return { ...activity, points: pointsFor(activity) };
  }

  // lesson / presentation
  if (!str(raw.itemId)) throw new Error("חסר מזהה שיעור");
  return {
    ...base,
    topicId: str(raw.topicId, 80),
    topicTitle: str(raw.topicTitle, 120),
    itemId: str(raw.itemId, 80),
    itemTitle: str(raw.itemTitle, 160),
  };
}

function isTestType(type) {
  return type === "test" || type === STAGE_TEST;
}

// A placement test's result: the stage to start in, a stage of the path.
function placementResult(raw) {
  const stageId = str(raw.stageId, 80);
  if (!isPathStage(stageId)) throw new Error("שלב לא תקין");
  return { stageId, passed: num(raw.passed, 0, 20) };
}

// A test's hand-in: the grade of every topic ({ topicId: { score, total } })
// and the questions it asked ("topicId:index"), so a retake can ask others.
function testResult(raw, total, maxTopics) {
  const byTopic = {};
  Object.entries(raw.byTopic && typeof raw.byTopic === "object" ? raw.byTopic : {})
    .slice(0, maxTopics)
    .forEach(([topicId, r]) => {
      const id = str(topicId, 80);
      const t = num(r?.total, 0, total);
      if (id && t) byTopic[id] = { score: num(r?.score, 0, t), total: t };
    });
  const asked = (Array.isArray(raw.asked) ? raw.asked : []).map((k) => str(k, 90)).filter(Boolean).slice(0, MAX_TEST_ASKED);
  return { byTopic, asked };
}

// How many questions a test asks from each topic, so a test of a few topics
// stays about as long as one of a single topic.
function testPerTopic(topics) {
  return topics === 1 ? 10 : topics === 2 ? 6 : topics === 3 ? 5 : topics === 4 ? 4 : 3;
}

function testOpen(test) {
  return (test.attempts || []).length < (test.allowed || 1);
}

// The test a hand-in is for, while it can still be handed in. Not a 404:
// the student page forgets its link on one.
function openTest(student, testId) {
  const test = (student.tests || []).find((t) => t.id === testId);
  if (!test) throw new Error("המבחן לא נמצא — אולי המורה הסיר אותו");
  if (!testOpen(test)) throw Object.assign(new Error("המבחן כבר הוגש"), { status: 409 });
  return test;
}

// A stage test, while it was never handed in.
function openStageTest(student, id) {
  if (!isStageTest(id)) throw new Error("המבחן לא נמצא");
  if (student.stageTests?.[id]) throw Object.assign(new Error("המבחן כבר הוגש"), { status: 409 });
}

// What the student's pages get of the stage tests: the grades and the
// questions asked (so the next test of the stage asks others), not the
// answers.
function stageTestsView(student) {
  return Object.fromEntries(
    Object.entries(student.stageTests || {}).map(([id, { at, score, total, byTopic, asked }]) => [id, { at, score, total, byTopic: byTopic || {}, asked: asked || [] }])
  );
}

// What the student's page gets of a test: the grades, not the answers.
function testView(test) {
  return {
    id: test.id,
    title: test.title,
    topics: test.topics || [],
    perTopic: test.perTopic,
    dueDate: test.dueDate || "",
    note: test.note || "",
    assignedAt: test.assignedAt,
    allowed: test.allowed || 1,
    retakeAt: test.retakeAt || null,
    retakeDeclinedAt: test.retakeDeclinedAt || null,
    attempts: (test.attempts || []).map(({ at, score, total, byTopic, asked }) => ({ at, score, total, byTopic: byTopic || {}, asked: asked || [] })),
  };
}

function newStudent(owner, { name } = {}) {
  const cleanName = str(name, 80);
  if (!cleanName) throw new Error("חסר שם תלמיד");
  return {
    id: crypto.randomBytes(8).toString("hex"),
    key: newKey(),
    ownerUid: owner.uid,
    ownerEmail: owner.email || "",
    name: cleanName,
    focus: "",
    focusUpdatedAt: null,
    notes: [],
    homework: [],
    createdAt: new Date().toISOString(),
    lastActive: null,
    counts: { exercises: 0, lessons: 0, games: 0, practiceSec: 0 },
    best: {},
    points: { total: 0, week: 0, weekOf: "" },
  };
}

function ratio(score, total) {
  return total ? score / total : 0;
}

// Applies one activity to the file's running totals and homework, in place.
// Files from before points existed get theirs (backfillPoints) first.
function applyActivity(student, activity) {
  // Throws when the test can't be handed in, before anything changes.
  const test = activity.type === "test" ? openTest(student, activity.exerciseId) : null;
  if (activity.type === STAGE_TEST) openStageTest(student, activity.exerciseId);
  student.lastActive = activity.at;
  student.counts = { exercises: 0, lessons: 0, games: 0, practiceSec: 0, ...student.counts };
  student.best = student.best || {};
  if (activity.points) addPoints(student, activity);

  if (activity.kind === "game") {
    student.counts.games++;
    return;
  }
  if (activity.kind !== "exercise") {
    student.counts.lessons++;
    if (activity.kind !== "lesson") return;
    student.lessonsSeen = { ...student.lessonsSeen, [activity.itemId]: activity.at };
    // A lesson task (exerciseId "lesson-<id>") is done once the lesson is opened.
    (student.homework || []).forEach((hw) => {
      if (hw.type !== "lesson" || mergedLessonId(hw.exerciseId.replace(/^lesson-/, "")) !== activity.itemId) return;
      hw.attempts = (hw.attempts || 0) + 1;
      hw.lastAt = activity.at;
      if (!hw.doneAt) hw.doneAt = activity.at;
    });
    return;
  }

  student.counts.exercises++;
  student.counts.practiceSec += activity.durationSec;
  if (test) {
    const { at, score, total, byTopic, asked, id: activityId } = activity;
    test.attempts = [...(test.attempts || []), { at, score, total, byTopic, asked, activityId }];
    test.retakeAt = null;
    return;
  }
  if (activity.type === STAGE_TEST) {
    const { at, score, total, byTopic, asked, id: activityId } = activity;
    student.stageTests = { ...student.stageTests, [activity.exerciseId]: { at, score, total, byTopic, asked, activityId } };
    return;
  }
  // A round of "my mistakes" mixes questions from many exercises, so it is
  // practice time but no exercise's score — and so is the daily challenge,
  // which keeps the streak of days in a row instead.
  if (activity.type === "daily") {
    addDaily(student, activity.at);
    return;
  }
  if (activity.type === "review") return;
  if (activity.type === PLACEMENT) {
    const { at, stageId, passed, score, total, id: activityId } = activity;
    student.placement = { at, stageId, passed, score, total, activityId };
    (student.homework || []).forEach((hw) => {
      if (hw.topicId !== PLACEMENT) return;
      hw.attempts = (hw.attempts || 0) + 1;
      hw.lastAt = at;
      if (!hw.doneAt) {
        hw.doneAt = at;
        hw.score = score;
        hw.total = total;
      }
    });
    return;
  }
  const key = `${activity.topicId}/${activity.exerciseId}`;
  const prev = student.best[key];
  const entry = prev || { score: 0, total: activity.total, attempts: 0, firstAt: activity.at };
  entry.attempts++;
  entry.topicTitle = activity.topicTitle;
  entry.title = activity.exerciseTitle;
  entry.type = activity.type;
  entry.lastAt = activity.at;
  entry.lastScore = activity.score;
  entry.lastTotal = activity.total;
  // A mistakes-only retry is a partial round, so its own score never becomes
  // the best score. What counts is the round it fixed: that round's score
  // plus the answers the student got right now (fixedScore / fixedTotal).
  if (activity.isRetry && !activity.fixedTotal) {
    student.best[key] = entry;
    return;
  }
  const score = activity.isRetry ? activity.fixedScore : activity.score;
  const total = activity.isRetry ? activity.fixedTotal : activity.total;
  if (!prev?.bestAt || ratio(score, total) >= ratio(entry.score, entry.total)) {
    entry.score = score;
    entry.total = total;
    entry.bestAt = activity.at;
  }
  student.best[key] = entry;
  applySetTasks(student, key, activity, score, total);

  (student.homework || []).forEach((hw) => {
    if (hw.topicId !== activity.topicId || hw.exerciseId !== activity.exerciseId) return;
    if (!activity.isRetry) hw.attempts = (hw.attempts || 0) + 1;
    hw.lastAt = activity.at;
    if (!hw.doneAt) hw.doneAt = activity.at;
    if (hw.score == null || ratio(score, total) >= ratio(hw.score, hw.total)) {
      hw.score = score;
      hw.total = total;
    }
  });
}

/* ── Tasks from the teacher's diary (lib/teacher-diary.js): a planned lesson
   becomes two tasks on every file it is sent to — the lesson (type
   "lesson") and its practice set (type "set": the exercises in `items`,
   "topicId/exerciseId"), both with `opensOn`, the lesson's day; the
   student's page shows them locked until then. A set is done once every
   one of its exercises was finished in a round after it was sent; `parts`
   keeps the best score of each, and the task's score is their sum.
   `diaryId` ties the tasks to the lesson in the diary. `page`: the learning
   area the task opens in (/services/math …), English when there is none. ── */

const SET_TASK = "set";
const MAX_SET_ITEMS = 60;

function applySetTasks(student, key, activity, score, total) {
  (student.homework || []).forEach((hw) => {
    if (hw.type !== SET_TASK || !(hw.items || []).includes(key)) return;
    const parts = hw.parts || [];
    const part = parts.find((p) => p.k === key);
    if (!part) parts.push({ k: key, s: score, t: total });
    else if (ratio(score, total) >= ratio(part.s, part.t)) Object.assign(part, { s: score, t: total });
    hw.parts = parts;
    if (!activity.isRetry) hw.attempts = (hw.attempts || 0) + 1;
    hw.lastAt = activity.at;
    hw.score = parts.reduce((n, p) => n + (p.s || 0), 0);
    hw.total = parts.reduce((n, p) => n + (p.t || 0), 0);
    if (!hw.doneAt && hw.items.every((k) => parts.some((p) => p.k === k))) hw.doneAt = activity.at;
  });
}

// A task that waits for its day (`opensOn`, Israel time) isn't open work yet.
function isLocked(hw, today) {
  return !!hw.opensOn && hw.opensOn > today;
}

function diaryTask(task, lesson, now) {
  const set = str(task?.type, 30) === SET_TASK;
  return {
    id: crypto.randomBytes(6).toString("hex"),
    topicId: str(task?.topicId, 80),
    exerciseId: str(task?.exerciseId, 80),
    topicTitle: str(task?.topicTitle, 120),
    exerciseTitle: str(task?.exerciseTitle, 160),
    type: set ? SET_TASK : str(task?.type, 30),
    ...(/^\/[a-z/-]{1,40}$/.test(String(task?.page || "")) ? { page: task.page } : {}),
    ...(set ? { items: (Array.isArray(task.items) ? task.items : []).map((k) => str(k, 170)).filter(Boolean).slice(0, MAX_SET_ITEMS), parts: [] } : {}),
    opensOn: lesson.opensOn,
    diaryId: lesson.diaryId,
    dueDate: "",
    note: "",
    assignedAt: now,
    attempts: 0,
    doneAt: null,
    lastAt: null,
    score: null,
    total: null,
  };
}

// Runs `mutate` on every file of the teacher that `filter` takes: one
// transaction a file on Firestore, one write of the local file.
async function editOwnedFiles(uid, filter, mutate) {
  const db = getFirestore();
  if (db) {
    const docs = (await db.collection(COLLECTION).where("ownerUid", "==", uid).get()).docs.filter((d) => filter(d.data()));
    let changed = 0;
    for (let i = 0; i < docs.length; i += 10) {
      const results = await Promise.all(
        docs.slice(i, i + 10).map((d) =>
          db.runTransaction(async (tx) => {
            const doc = await tx.get(d.ref);
            const student = doc.data();
            if (!doc.exists || !ownedBy(student, uid) || !mutate(student)) return false;
            tx.set(d.ref, student);
            return true;
          })
        )
      );
      changed += results.filter(Boolean).length;
    }
    return { files: docs.length, changed };
  }
  const data = loadLocal();
  const files = Object.values(data.students).filter((s) => ownedBy(s, uid) && filter(s));
  const changed = files.filter((s) => mutate(s)).length;
  if (changed) saveLocal(data);
  return { files: files.length, changed };
}

// `lessons`: [{ diaryId, opensOn, tasks: [...] }]. Every file of the
// teacher (or of the class `classId`) gets the tasks it doesn't have yet;
// a file with its sign-in turned off is left out. `students`: how many
// files the lessons are on now.
async function sendDiaryTasks(uid, { classId = "", lessons = [] } = {}) {
  if (!uid) throw new Error("יש להתחבר מחדש");
  const list = lessons.filter((l) => /^\d{4}-\d{2}-\d{2}$/.test(String(l?.opensOn || "")) && str(l?.diaryId) && l.tasks?.length);
  const now = new Date().toISOString();
  const { files } = await editOwnedFiles(
    uid,
    (s) => !s.blocked && (!classId || (s.classIds || []).includes(classId)),
    (student) => {
      const homework = student.homework || [];
      const has = new Set(homework.filter((hw) => hw.diaryId).map((hw) => `${hw.diaryId}/${hw.exerciseId}`));
      const added = list.flatMap((lesson) =>
        lesson.tasks.filter((task) => !has.has(`${lesson.diaryId}/${str(task?.exerciseId, 80)}`)).map((task) => diaryTask(task, lesson, now))
      );
      if (!added.length) return false;
      student.homework = [...homework, ...added].slice(-MAX_HOMEWORK);
      return true;
    }
  );
  return { students: files };
}

// A lesson taken off the diary: its tasks leave the files of the students
// that didn't start them.
async function removeDiaryTasks(uid, diaryIds = []) {
  const ids = new Set(diaryIds.map(String));
  if (!uid || !ids.size) return { changed: 0 };
  const untouched = (hw) => ids.has(hw.diaryId) && !hw.doneAt && !hw.attempts;
  const { changed } = await editOwnedFiles(
    uid,
    (s) => (s.homework || []).some(untouched),
    (student) => {
      student.homework = (student.homework || []).filter((hw) => !untouched(hw));
      return true;
    }
  );
  return { changed };
}

/* ── The daily challenge (#daily on the English page): five short questions
   a day. Finishing one on a day (Israel time) keeps the streak going; a
   whole day without one starts it over. ── */

const DAILY_DAYS_KEPT = 60;

function dayBefore(day) {
  return shiftDay(day, -1).slice(0, 10);
}

function addDaily(student, at) {
  const day = israelDay(at);
  const daily = { streak: 0, best: 0, last: "", days: [], ...student.daily };
  if (daily.last === day) return;
  daily.streak = daily.last === dayBefore(day) ? daily.streak + 1 : 1;
  daily.best = Math.max(daily.best, daily.streak);
  daily.last = day;
  daily.days = [...daily.days, day].slice(-DAILY_DAYS_KEPT);
  student.daily = daily;
}

// The streak as it stands today (0 once a day went by without the
// challenge), and the last 7 days, oldest first.
function dailyView(student) {
  const today = israelDay(new Date());
  const daily = student.daily || {};
  const alive = daily.last === today || daily.last === dayBefore(today);
  const done = new Set(daily.days || []);
  return {
    streak: alive ? daily.streak || 0 : 0,
    best: daily.best || 0,
    doneToday: daily.last === today,
    week: Array.from({ length: 7 }, (_, i) => {
      const day = shiftDay(today, i - 6).slice(0, 10);
      return { day, done: done.has(day) };
    }),
  };
}

/* ── Local file storage ── */

function loadLocal() {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      const data = JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf8"));
      return { students: data.students || {} };
    }
  } catch {
    /* ignore */
  }
  return { students: {} };
}

function saveLocal(data) {
  fs.mkdirSync(path.dirname(PROGRESS_FILE), { recursive: true });
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(data, null, 2), "utf8");
}

function withoutActivity(record) {
  const { activity, review, cards, ...student } = record;
  return student;
}

function ownedBy(student, uid) {
  return !!uid && student?.ownerUid === uid;
}

// Every student-side call finds the file by its key here (or localByKey),
// so a file with its sign-in turned off answers none of them.
async function firestoreRefByKey(db, key) {
  const snap = await db.collection(COLLECTION).where("key", "==", key).limit(1).get();
  if (snap.empty) return null;
  if (snap.docs[0].get("blocked")) throw blockedError();
  return snap.docs[0].ref;
}

function localByKey(students, key) {
  const record = Object.values(students).find((s) => s.key === key) || null;
  if (record?.blocked) throw blockedError();
  return record;
}

/* ── Student side (by link key) ── */

async function getPortal(key) {
  if (!isKey(key)) return null;
  const db = getFirestore();
  let student;
  let review;
  let cards;
  if (db) {
    const ref = await firestoreRefByKey(db, key);
    student = ref ? (await ref.get()).data() : null;
    if (!student) return null;
    // Files from before `lessonsSeen` get it from their lessons' activity
    // (and keep it from their next activity on).
    if (!student.lessonsSeen) {
      const lessons = await ref.collection("activity").where("kind", "==", "lesson").get();
      student.lessonsSeen = lessonsSeenFrom(lessons.docs.map((d) => d.data()));
    }
    const [reviewSnap, cardsSnap] = await Promise.all([reviewDoc(ref).get(), cardsDoc(ref).get()]);
    review = reviewSnap.exists ? reviewSnap.data() : null;
    cards = cardsSnap.exists ? cardsSnap.data() : null;
  } else {
    student = localByKey(loadLocal().students, key);
    if (!student) return null;
    if (!student.lessonsSeen) student.lessonsSeen = lessonsSeenFrom(student.activity || []);
    review = student.review;
    cards = student.cards;
  }
  // Only what the student pages need — the teacher's notes stay private.
  // Points come with the leaderboard (getLeaderboard), which backfills them.
  // `finished`: the exercises with a whole round done ("topicId/exerciseId"),
  // so the practice page can mark them on any device. `map`: the learning
  // path with what the student did on it (lib/english-map.js), with a
  // certificate for every stage; `subjects`: the school subjects the student
  // practiced, each with its own map. `moreCerts`: the whole road's and the
  // achievements' certificates (lib/certificates.js). `stickers`:
  // lib/stickers.js.
  const best = student.best || {};
  const finished = Object.keys(best).filter((k) => best[k]?.bestAt);
  const map = studentMap(student);
  const cardsNow = cardsSummary(cards);
  return {
    name: student.name,
    homework: student.homework || [],
    placement: placementView(student),
    tests: (student.tests || []).map(testView),
    stageTests: stageTestsView(student),
    classes: await portalClasses(student),
    finished,
    progress: progressView(student, finished),
    map,
    subjects: subjectMaps(student),
    moreCerts: moreCertificates(student, map),
    daily: dailyView(student),
    cards: cardsNow,
    stickers: stickersFor(student, { map, mastered: review?.mastered || 0, cards: cardsNow.learned }),
  };
}

// The last placement test, as the student's pages get it.
function placementView(student) {
  const p = student.placement;
  return p?.stageId ? { stageId: p.stageId, passed: p.passed || 0, at: p.at } : null;
}

// "My progress" on the student page: running totals, and the finished
// exercises grouped by topic (most recently practiced topic first) with the
// best score of each. `points` is null on files from before points existed —
// the page then takes the total from the leaderboard, which backfills it.
function progressView(student, finished) {
  const counts = { exercises: 0, lessons: 0, games: 0, practiceSec: 0, ...student.counts };
  const topics = new Map();
  finished.forEach((k) => {
    const entry = student.best[k];
    const topicId = k.split("/")[0];
    const topic = topics.get(topicId) || { title: entry.topicTitle || "", lastAt: "", exercises: [] };
    topic.exercises.push({
      title: entry.title || "",
      score: entry.score,
      total: entry.total,
      attempts: entry.attempts || 1,
      lastAt: entry.lastAt || entry.bestAt,
    });
    if ((entry.lastAt || "") > topic.lastAt) topic.lastAt = entry.lastAt;
    topics.set(topicId, topic);
  });
  const list = [...topics.values()].sort((a, b) => b.lastAt.localeCompare(a.lastAt));
  list.forEach((topic) => topic.exercises.sort((a, b) => (b.lastAt || "").localeCompare(a.lastAt || "")));
  const ratios = finished.map((k) => ratio(student.best[k].score, student.best[k].total));
  return {
    points: student.points ? pointsView(student) : null,
    finished: finished.length,
    rounds: counts.exercises,
    lessons: counts.lessons,
    games: counts.games,
    practiceMin: Math.round(counts.practiceSec / 60),
    average: ratios.length ? Math.round((ratios.reduce((sum, r) => sum + r, 0) / ratios.length) * 100) : null,
    lastActive: student.lastActive || null,
    topics: list,
  };
}

// `daily`: after a daily challenge, the streak it made.
async function recordActivity(key, rawActivity) {
  if (!isKey(key)) throw notFound("הקישור לא תקין");
  const activity = cleanActivity(rawActivity);
  const after = (student) => ({ points: pointsView(student), ...(activity.type === "daily" ? { daily: dailyView(student) } : {}) });
  const db = getFirestore();
  if (db) {
    const ref = await firestoreRefByKey(db, key);
    if (!ref) throw notFound("הקישור לא תקין");
    const result = await db.runTransaction(async (tx) => {
      const doc = await tx.get(ref);
      const student = doc.data();
      if (!student.points || !student.lessonsSeen) {
        const past = (await tx.get(ref.collection("activity"))).docs.map((d) => d.data());
        if (!student.points) backfillPoints(student, past);
        if (!student.lessonsSeen) student.lessonsSeen = lessonsSeenFrom(past);
      }
      applyActivity(student, activity);
      noteAllCertificates(student);
      tx.set(ref, student);
      tx.set(ref.collection("activity").doc(activity.id), activity);
      return after(student);
    });
    return { activity, ...result };
  }

  const data = loadLocal();
  const record = localByKey(data.students, key);
  if (!record) throw notFound("הקישור לא תקין");
  if (!record.points) backfillPoints(record, record.activity || []);
  if (!record.lessonsSeen) record.lessonsSeen = lessonsSeenFrom(record.activity || []);
  applyActivity(record, activity);
  noteAllCertificates(record);
  record.activity = [activity, ...(record.activity || [])].slice(0, LOCAL_ACTIVITY_CAP);
  saveLocal(data);
  return { activity, ...after(record) };
}

// "צריך עזרה" on the student page: the request is kept in the file (`help`,
// newest first) and the teacher sees it in the bell on /my-room. One a
// minute, so a few taps on the button don't send the same request again.
async function askHelp(key, text) {
  if (!isKey(key)) throw notFound("הקישור לא תקין");
  const request = { id: crypto.randomBytes(6).toString("hex"), text: str(text, 300), at: new Date().toISOString() };
  const add = (student) => {
    const last = student.help?.[0];
    if (last && Date.now() - Date.parse(last.at) < HELP_GAP_MS) throw new Error("הבקשה כבר נשלחה. המורה יראה אותה בקרוב");
    student.help = [request, ...(student.help || [])].slice(0, MAX_HELP);
  };
  const db = getFirestore();
  if (db) {
    const ref = await firestoreRefByKey(db, key);
    if (!ref) throw notFound("הקישור לא תקין");
    await db.runTransaction(async (tx) => {
      const student = (await tx.get(ref)).data();
      add(student);
      tx.update(ref, { help: student.help });
    });
    return {};
  }
  const data = loadLocal();
  const record = localByKey(data.students, key);
  if (!record) throw notFound("הקישור לא תקין");
  add(record);
  saveLocal(data);
  return {};
}

// "בקשת מבחן חוזר" after a test was handed in: it shows on the test on the
// teacher's file and in the bell on /my-room, until the teacher answers.
async function askRetake(key, testId) {
  if (!isKey(key)) throw notFound("הקישור לא תקין");
  const ask = (student) => {
    const test = (student.tests || []).find((t) => t.id === testId);
    if (!test) throw new Error("המבחן לא נמצא — אולי המורה הסיר אותו");
    if (testOpen(test)) throw new Error("המבחן פתוח — אפשר לגשת אליו עכשיו");
    if (test.retakeAt) throw new Error("כבר ביקשת מבחן חוזר. המורה יראה את הבקשה");
    test.retakeAt = new Date().toISOString();
    test.retakeDeclinedAt = null;
    return { test: testView(test) };
  };
  const db = getFirestore();
  if (db) {
    const ref = await firestoreRefByKey(db, key);
    if (!ref) throw notFound("הקישור לא תקין");
    return db.runTransaction(async (tx) => {
      const student = (await tx.get(ref)).data();
      const result = ask(student);
      tx.update(ref, { tests: student.tests });
      return result;
    });
  }
  const data = loadLocal();
  const record = localByKey(data.students, key);
  if (!record) throw notFound("הקישור לא תקין");
  const result = ask(record);
  saveLocal(data);
  return result;
}

/* ── Classes (lib/classes.js): a student joins one by its link (/c/<code>)
   and is in it by `classIds` on the file, with when they joined
   (`classJoinedAt`, for the teacher's bell). The tasks and assignments
   from the class the student marked done are in `classDone` (post id →
   when). ── */

const MAX_CLASS_MEMBERS = 80;
const MAX_CLASS_DONE = 300;
const DONE_KINDS = ["task", "assignment"];

function closedError() {
  const err = new Error("ההצטרפות לכיתה סגורה כרגע. פנו למורה");
  err.status = 403;
  return err;
}

// A student-side change by the link key; `fields` are what it writes back.
async function editByKey(key, fields, mutate) {
  if (!isKey(key)) throw notFound("הקישור לא תקין");
  const db = getFirestore();
  if (db) {
    const ref = await firestoreRefByKey(db, key);
    if (!ref) throw notFound("הקישור לא תקין");
    return db.runTransaction(async (tx) => {
      const student = (await tx.get(ref)).data();
      const result = mutate(student);
      tx.update(ref, Object.fromEntries(fields.map((f) => [f, student[f] ?? null])));
      return result;
    });
  }
  const data = loadLocal();
  const record = localByKey(data.students, key);
  if (!record) throw notFound("הקישור לא תקין");
  const result = mutate(record);
  saveLocal(data);
  return result;
}

async function fileByKey(key) {
  if (!isKey(key)) return null;
  const db = getFirestore();
  if (db) {
    const ref = await firestoreRefByKey(db, key);
    return ref ? (await ref.get()).data() : null;
  }
  const record = localByKey(loadLocal().students, key);
  return record ? withoutActivity(record) : null;
}

// The classes a student's file is in — for a live lesson opened to them
// (lib/live-lessons.js). A wrong or blocked key has none.
async function classIdsByKey(key) {
  const student = await fileByKey(key).catch(() => null);
  return Array.isArray(student?.classIds) ? student.classIds.map(String) : [];
}

async function classMembers(classId) {
  const db = getFirestore();
  if (db) return (await db.collection(COLLECTION).where("classIds", "array-contains", classId).get()).docs.map((d) => d.data());
  return Object.values(loadLocal().students).filter((s) => (s.classIds || []).includes(classId));
}

function sameName(a, b) {
  const plain = (name) => str(name).replace(/\s+/g, " ").toLowerCase();
  return plain(a) === plain(b);
}

function addToClass(student, cls) {
  if ((student.classIds || []).includes(cls.id)) return;
  student.classIds = [...(student.classIds || []), cls.id];
  student.classJoinedAt = { ...(student.classJoinedAt || {}), [cls.id]: new Date().toISOString() };
}

// The join page: who this device is — the name on its file — when that
// file is the class teacher's; else null, and the page asks for a name.
async function classGuest(cls, key) {
  let student = null;
  try {
    student = await fileByKey(key);
  } catch {
    // A file with its sign-in turned off: the page asks for a name.
  }
  if (!student || student.ownerUid !== cls.ownerUid) return null;
  return { name: student.name, member: (student.classIds || []).includes(cls.id) };
}

// Joining by the class's link: with the file this device is linked to
// (`key`) when it's the class teacher's, else a new file of that teacher by
// the name the student wrote. Answers with the file's key, for the device
// to keep.
async function joinClass(cls, { key, name } = {}) {
  const guest = key ? await classGuest(cls, key) : null;
  if (guest) {
    if (!guest.member && !cls.open) throw closedError();
    await editByKey(key, ["classIds", "classJoinedAt"], (student) => addToClass(student, cls));
    return { key, name: guest.name };
  }
  if (!cls.open) throw closedError();
  const cleanName = str(name, 80);
  if (cleanName.length < 2) throw new Error("כתבו את השם שלכם");
  const members = await classMembers(cls.id);
  if (members.length >= MAX_CLASS_MEMBERS) throw Object.assign(new Error("הכיתה מלאה. פנו למורה"), { status: 409 });
  // The same kid on a second device would get a second file — the teacher's
  // personal link brings them in with the first one.
  if (members.some((s) => sameName(s.name, cleanName))) {
    throw Object.assign(
      new Error("השם הזה כבר רשום בכיתה.\nאם זה אתם — בקשו מהמורה את הקישור האישי שלכם.\nאם לא — הוסיפו את האות הראשונה של שם המשפחה."),
      { status: 409 }
    );
  }
  const student = newStudent({ uid: cls.ownerUid, email: cls.ownerEmail }, { name: cleanName });
  student.joinedVia = "class";
  addToClass(student, cls);
  const db = getFirestore();
  if (db) {
    await db.collection(COLLECTION).doc(student.id).set(student);
  } else {
    const data = loadLocal();
    data.students[student.id] = { ...student, activity: [] };
    saveLocal(data);
  }
  return { key: student.key, name: student.name };
}

// The teacher adds files from the student list to a class ("הוספת
// תלמידים" in the class). Files already in it stay as they are; a class
// holds up to MAX_CLASS_MEMBERS.
async function addStudentsToClass(uid, cls, ids) {
  const wanted = [...new Set((Array.isArray(ids) ? ids : []).map((id) => String(id || "")))].filter((id) => /^[a-f0-9]{16}$/.test(id));
  if (!wanted.length) throw new Error("לא נבחרו תלמידים");
  const members = await classMembers(cls.id);
  const inClass = new Set(members.map((s) => s.id));
  const fresh = wanted.filter((id) => !inClass.has(id));
  const room = MAX_CLASS_MEMBERS - members.length;
  if (fresh.length > room) {
    throw Object.assign(new Error(room > 0 ? `בכיתה יש מקום רק לעוד ${room} תלמידים` : "הכיתה מלאה"), { status: 409 });
  }
  const added = [];
  for (const id of fresh) {
    try {
      await editStudent(uid, id, (student) => addToClass(student, cls));
      added.push(id);
    } catch (err) {
      // A file that was deleted meanwhile, or isn't this teacher's.
      if (err.status !== 404) throw err;
    }
  }
  return { added };
}

// An exercise sent to the class (kind "exercise") is done once the student
// solved it — or saw the lesson — after it was sent: the score is the best
// round since then when that's the best one ever, else the last round.
function classTaskDone(student, post) {
  const task = post.task;
  if (!task) return null;
  if (task.type === "lesson") {
    const seen = student.lessonsSeen?.[mergedLessonId(task.exerciseId.replace(/^lesson-/, ""))];
    return seen && seen >= post.at ? { doneAt: seen } : null;
  }
  const entry = student.best?.[`${task.topicId}/${task.exerciseId}`];
  if (!entry?.lastAt || entry.lastAt < post.at) return null;
  const best = entry.bestAt && entry.bestAt >= post.at;
  return { doneAt: entry.lastAt, score: best ? entry.score : entry.lastScore, total: best ? entry.total : entry.lastTotal };
}

// The student page's "הכיתה שלי": each class with its updates, newest first,
// and when the student marked a task or an assignment done (or solved an
// exercise sent to the class).
async function portalClasses(student) {
  if (!student.classIds?.length) return [];
  const done = student.classDone || {};
  const list = await classesLib.getMany(student.classIds).catch((err) => {
    console.warn(`[classes] ${err.message}`);
    return [];
  });
  return list.map((c) => ({
    id: c.id,
    name: c.name,
    teacherName: c.teacherName || "",
    posts: c.posts.map((p) =>
      p.kind === "exercise" ? { ...p, doneAt: null, ...classTaskDone(student, p) } : { ...p, doneAt: done[p.id] || null }
    ),
  }));
}

// "סיימתי" on a task or an assignment from the class, or taking it back.
async function markClassPost(key, postId, done) {
  const student = await fileByKey(key);
  if (!student) throw notFound("הקישור לא תקין");
  const id = str(postId, 40);
  const post = (await classesLib.getMany(student.classIds)).flatMap((c) => c.posts).find((p) => p.id === id);
  if (!post || !DONE_KINDS.includes(post.kind)) throw notFound("העדכון לא נמצא — אולי המורה הסיר אותו");
  return editByKey(key, ["classDone"], (s) => {
    const map = { ...(s.classDone || {}) };
    if (done) map[id] ||= new Date().toISOString();
    else delete map[id];
    s.classDone = Object.fromEntries(Object.entries(map).sort((a, b) => b[1].localeCompare(a[1])).slice(0, MAX_CLASS_DONE));
    return { doneAt: s.classDone[id] || null };
  });
}

// The teacher takes a student out of a class; the file stays.
function leaveClass(uid, id, classId) {
  return editStudent(uid, id, (student) => {
    student.classIds = (student.classIds || []).filter((c) => c !== classId);
    if (student.classJoinedAt) delete student.classJoinedAt[classId];
    return {};
  });
}

// A deleted class leaves its students' files.
async function dropClass(uid, classId) {
  const members = (await classMembers(classId)).filter((s) => ownedBy(s, uid));
  for (const s of members) await leaveClass(uid, s.id, classId);
}

/* ── Leaderboard: a student's class is every file of the same teacher ── */

// Gives files from before points existed their totals, once, and saves them.
async function withPoints(list) {
  const missing = list.filter((s) => !s.points);
  if (!missing.length) return list;
  const db = getFirestore();
  if (db) {
    await Promise.all(
      missing.map((student) => {
        const ref = db.collection(COLLECTION).doc(student.id);
        return db.runTransaction(async (tx) => {
          const doc = await tx.get(ref);
          if (!doc.exists) return;
          const fresh = doc.data();
          if (fresh.points) {
            student.points = fresh.points;
            return;
          }
          student.points = backfillPoints(fresh, (await tx.get(ref.collection("activity"))).docs.map((d) => d.data()));
          tx.update(ref, { points: student.points });
        });
      })
    );
    return list;
  }
  const data = loadLocal();
  missing.forEach((student) => {
    const record = data.students[student.id];
    student.points = record ? backfillPoints(record, record.activity || []) : { total: 0, week: 0, weekOf: weekOf() };
  });
  saveLocal(data);
  return list;
}

// What a click on a name shows: the exercises the student finished, the
// rounds and time they practiced, and the games they played (all time).
function boardStats(s) {
  const counts = { exercises: 0, games: 0, practiceSec: 0, ...s.counts };
  const best = s.best || {};
  return {
    finished: Object.keys(best).filter((k) => best[k]?.bestAt).length,
    rounds: counts.exercises,
    practiceSec: counts.practiceSec,
    games: counts.games,
  };
}

function rankRows(list, meId) {
  return list
    .map((s) => ({ s, ...pointsView(s) }))
    .sort((a, b) => b.total - a.total || a.s.name.localeCompare(b.s.name, "he"))
    .slice(0, LEADERBOARD_CAP)
    .map(({ s, total, week }) => ({
      name: s.id === meId ? s.name : shortName(s.name),
      total,
      week,
      isMe: s.id === meId,
      stats: boardStats(s),
    }));
}

// The class leaderboard for the student with this link. Classmates' links
// and ids never leave the server, and their last names are cut to an initial.
// Each row brings its practice totals (boardStats), never the teacher's notes.
async function getLeaderboard(key) {
  if (!isKey(key)) throw notFound("הקישור לא תקין");
  const db = getFirestore();
  let me;
  let classmates;
  if (db) {
    const ref = await firestoreRefByKey(db, key);
    if (!ref) throw notFound("הקישור לא תקין");
    me = (await ref.get()).data();
    classmates = me.ownerUid
      ? (await db.collection(COLLECTION).where("ownerUid", "==", me.ownerUid).get()).docs.map((d) => d.data())
      : [me];
  } else {
    const all = Object.values(loadLocal().students);
    me = localByKey(all, key);
    if (!me) throw notFound("הקישור לא תקין");
    classmates = (me.ownerUid ? all.filter((s) => s.ownerUid === me.ownerUid) : [me]).map(withoutActivity);
  }
  await withPoints(classmates);
  return { rows: rankRows(classmates, me.id), weekOf: weekOf() };
}

/* ── Mistake bank (by link key) ── */

function emptyReview() {
  return { entries: [], mastered: 0 };
}

// A right answer is just its question's id; a wrong one brings the question
// and where it is from.
function cleanReviewOp(raw) {
  const id = str(raw?.id, 300);
  if (!id) return null;
  if (raw.right) return { id, right: true };
  if (!raw.item || typeof raw.item !== "object") return null;
  const item = JSON.stringify(raw.item);
  if (item.length > MAX_REVIEW_ITEM) return null;
  return {
    id,
    right: false,
    topicId: str(raw.topicId, 80),
    exerciseId: str(raw.exerciseId, 80),
    topicTitle: str(raw.topicTitle, 120),
    exerciseTitle: str(raw.exerciseTitle, 160),
    type: str(raw.type, 30),
    level: num(raw.level, 1, 4),
    prompt: str(raw.prompt, 200),
    answer: str(raw.answer, 200),
    item,
  };
}

// Applies answers to the bank in place. When it is full, the questions
// closest to leaving it (and then the oldest mistakes) make room.
function applyReview(bank, ops, at) {
  const byId = new Map((bank.entries || []).map((e) => [e.id, e]));
  ops.forEach((op) => {
    const entry = byId.get(op.id);
    if (op.right) {
      if (!entry) return;
      entry.streak = (entry.streak || 0) + 1;
      entry.lastAt = at;
      if (entry.streak >= REVIEW_GOAL) {
        byId.delete(op.id);
        bank.mastered = (bank.mastered || 0) + 1;
      }
      return;
    }
    const { right, ...fields } = op;
    byId.set(op.id, { ...fields, streak: 0, wrong: (entry?.wrong || 0) + 1, firstAt: entry?.firstAt || at, lastAt: at, wrongAt: at });
  });
  let entries = [...byId.values()];
  if (entries.length > REVIEW_CAP) {
    const keep = new Set(
      [...entries]
        .sort((a, b) => (a.streak || 0) - (b.streak || 0) || String(b.wrongAt).localeCompare(String(a.wrongAt)))
        .slice(0, REVIEW_CAP)
        .map((e) => e.id)
    );
    entries = entries.filter((e) => keep.has(e.id));
  }
  bank.entries = entries;
  bank.mastered = bank.mastered || 0;
  return bank;
}

// What the student's page gets: the questions parsed back from JSON.
function reviewView(bank) {
  const entries = (bank?.entries || [])
    .map(({ item, ...entry }) => {
      try {
        return { ...entry, item: JSON.parse(item) };
      } catch {
        return null;
      }
    })
    .filter(Boolean);
  return { entries, mastered: bank?.mastered || 0 };
}

// What the teacher sees: what each question was, without the question data.
function reviewSummary(bank) {
  return {
    entries: (bank?.entries || []).map(({ item, ...entry }) => entry),
    mastered: bank?.mastered || 0,
  };
}

// The student's card in the teacher's list: how many mistakes are open and
// the most-missed few.
const REVIEW_PREVIEW = 5;

function reviewPreview(bank) {
  const entries = (bank?.entries || [])
    .slice()
    .sort((a, b) => (b.wrong || 0) - (a.wrong || 0) || String(b.wrongAt).localeCompare(String(a.wrongAt)))
    .slice(0, REVIEW_PREVIEW)
    .map(({ prompt, answer, exerciseTitle, wrong }) => ({ prompt, answer, exerciseTitle, wrong }));
  return { count: (bank?.entries || []).length, entries };
}

function reviewDoc(ref) {
  return ref.collection("meta").doc("review");
}

async function getReview(key) {
  if (!isKey(key)) throw notFound("הקישור לא תקין");
  const db = getFirestore();
  if (db) {
    const ref = await firestoreRefByKey(db, key);
    if (!ref) throw notFound("הקישור לא תקין");
    const doc = await reviewDoc(ref).get();
    return reviewView(doc.exists ? doc.data() : emptyReview());
  }
  const record = localByKey(loadLocal().students, key);
  if (!record) throw notFound("הקישור לא תקין");
  return reviewView(record.review);
}

async function recordReview(key, rawOps) {
  if (!isKey(key)) throw notFound("הקישור לא תקין");
  const ops = (Array.isArray(rawOps) ? rawOps : []).slice(0, MAX_REVIEW_OPS).map(cleanReviewOp).filter(Boolean);
  const at = new Date().toISOString();
  const db = getFirestore();
  if (db) {
    const ref = await firestoreRefByKey(db, key);
    if (!ref) throw notFound("הקישור לא תקין");
    if (!ops.length) return { count: null };
    return db.runTransaction(async (tx) => {
      const doc = await tx.get(reviewDoc(ref));
      const bank = applyReview(doc.exists ? doc.data() : emptyReview(), ops, at);
      tx.set(reviewDoc(ref), bank);
      return { count: bank.entries.length, mastered: bank.mastered };
    });
  }
  const data = loadLocal();
  const record = localByKey(data.students, key);
  if (!record) throw notFound("הקישור לא תקין");
  if (!ops.length) return { count: null };
  record.review = applyReview(record.review || emptyReview(), ops, at);
  saveLocal(data);
  return { count: record.review.entries.length, mastered: record.review.mastered };
}

/* ── Flashcards (by link key) ── */

function cardsDoc(ref) {
  return ref.collection("meta").doc("cards");
}

// A word's new place: { id, b (box), d (the day it comes back), f (the day
// it was first shown) }.
function cleanCardOp(raw) {
  const id = str(raw?.id, 40);
  if (!WORD_ID.test(id) || !DAY.test(String(raw.d)) || !DAY.test(String(raw.f))) return null;
  return { id, b: num(raw.b, 1, 6), d: String(raw.d), f: String(raw.f) };
}

// When the file is full, the words seen longest ago make room (it only
// happens if the site ever has more words than CARDS_CAP).
function applyCards(deck, ops, at) {
  const words = { ...deck?.words };
  ops.forEach(({ id, ...place }) => {
    words[id] = place;
  });
  const ids = Object.keys(words);
  if (ids.length > CARDS_CAP) {
    ids
      .sort((a, b) => words[a].f.localeCompare(words[b].f))
      .slice(0, ids.length - CARDS_CAP)
      .forEach((id) => delete words[id]);
  }
  return { words, at };
}

// What the student's page shows: the words learned, and today's cards.
function cardsSummary(deck) {
  const today = israelDay(new Date());
  const words = Object.values(deck?.words || {});
  return {
    seen: words.length,
    learned: words.filter((w) => w.b >= CARDS_LEARNED).length,
    due: words.filter((w) => w.d <= today).length,
  };
}

async function getCards(key) {
  if (!isKey(key)) throw notFound("הקישור לא תקין");
  const db = getFirestore();
  if (db) {
    const ref = await firestoreRefByKey(db, key);
    if (!ref) throw notFound("הקישור לא תקין");
    const doc = await cardsDoc(ref).get();
    return { words: doc.exists ? doc.data().words || {} : {} };
  }
  const record = localByKey(loadLocal().students, key);
  if (!record) throw notFound("הקישור לא תקין");
  return { words: record.cards?.words || {} };
}

async function recordCards(key, rawOps) {
  if (!isKey(key)) throw notFound("הקישור לא תקין");
  const ops = (Array.isArray(rawOps) ? rawOps : []).slice(0, MAX_CARD_OPS).map(cleanCardOp).filter(Boolean);
  const at = new Date().toISOString();
  const db = getFirestore();
  if (db) {
    const ref = await firestoreRefByKey(db, key);
    if (!ref) throw notFound("הקישור לא תקין");
    if (!ops.length) return {};
    return db.runTransaction(async (tx) => {
      const doc = await tx.get(cardsDoc(ref));
      const deck = applyCards(doc.exists ? doc.data() : null, ops, at);
      tx.set(cardsDoc(ref), deck);
      return { learned: cardsSummary(deck).learned };
    });
  }
  const data = loadLocal();
  const record = localByKey(data.students, key);
  if (!record) throw notFound("הקישור לא תקין");
  if (!ops.length) return {};
  record.cards = applyCards(record.cards, ops, at);
  saveLocal(data);
  return { learned: cardsSummary(record.cards).learned };
}

/* ── Teacher side (by owner uid + file id) ── */

function storageMode() {
  return getFirestore() ? "firestore" : "local";
}

async function createStudent(owner, fields) {
  if (!owner?.uid) throw new Error("יש להתחבר מחדש");
  const student = newStudent(owner, fields);
  const db = getFirestore();
  if (db) {
    await db.collection(COLLECTION).doc(student.id).set(student);
    return student;
  }
  const data = loadLocal();
  data.students[student.id] = { ...student, activity: [] };
  saveLocal(data);
  return student;
}

async function listStudents(uid) {
  if (!uid) return [];
  const db = getFirestore();
  let list;
  if (db) {
    const docs = (await db.collection(COLLECTION).where("ownerUid", "==", uid).get()).docs;
    const banks = docs.length ? await db.getAll(...docs.map((d) => reviewDoc(d.ref))) : [];
    list = docs.map((d, i) => ({ ...d.data(), review: reviewPreview(banks[i].exists ? banks[i].data() : null) }));
  } else {
    list = Object.values(loadLocal().students)
      .filter((s) => ownedBy(s, uid))
      .map((s) => ({ ...withoutActivity(s), review: reviewPreview(s.review) }));
  }
  await withPoints(list);
  // The points the teacher's leaderboard shows (this week's reset on Sunday).
  list.forEach((s) => {
    s.pointsNow = pointsView(s);
  });
  // Most recently active first; files nobody has used yet by when they were opened.
  return list.sort((a, b) => String(b.lastActive || b.createdAt).localeCompare(String(a.lastActive || a.createdAt)));
}

async function getStudent(uid, id) {
  const db = getFirestore();
  if (db) {
    const ref = db.collection(COLLECTION).doc(id);
    const doc = await ref.get();
    if (!doc.exists || !ownedBy(doc.data(), uid)) return null;
    const [snap, review] = await Promise.all([
      ref.collection("activity").orderBy("at", "desc").limit(ACTIVITY_READ_LIMIT).get(),
      reviewDoc(ref).get(),
    ]);
    const [student] = await withPoints([doc.data()]);
    return {
      ...student,
      pointsNow: pointsView(student),
      activity: snap.docs.map((d) => d.data()),
      review: reviewSummary(review.exists ? review.data() : null),
    };
  }
  const record = loadLocal().students[id];
  if (!ownedBy(record, uid)) return null;
  const [student] = await withPoints([withoutActivity(record)]);
  return {
    ...student,
    pointsNow: pointsView(student),
    activity: (record.activity || []).slice(0, ACTIVITY_READ_LIMIT),
    review: reviewSummary(record.review),
  };
}

// Teacher-side edits. `mutate` changes the file in place and returns what
// the caller should get back.
async function editStudent(uid, id, mutate) {
  const db = getFirestore();
  if (db) {
    const ref = db.collection(COLLECTION).doc(id);
    return db.runTransaction(async (tx) => {
      const doc = await tx.get(ref);
      if (!doc.exists || !ownedBy(doc.data(), uid)) throw notFound();
      const student = doc.data();
      const result = mutate(student);
      tx.set(ref, student);
      return result;
    });
  }
  const data = loadLocal();
  const record = data.students[id];
  if (!ownedBy(record, uid)) throw notFound();
  const result = mutate(record);
  saveLocal(data);
  return result;
}

async function updateDetails(uid, id, fields = {}) {
  return editStudent(uid, id, (student) => {
    if ("name" in fields) {
      const name = str(fields.name, 80);
      if (!name) throw new Error("חסר שם תלמיד");
      student.name = name;
    }
    if ("focus" in fields) {
      student.focus = str(fields.focus, 2000);
      student.focusUpdatedAt = new Date().toISOString();
    }
    // Empty clears it — the student then gets in by the link only.
    if ("email" in fields) {
      const email = cleanEmail(fields.email);
      if (str(fields.email) && !email) throw new Error("כתובת המייל לא תקינה");
      student.email = email;
    }
    if ("blocked" in fields) student.blocked = fields.blocked === true;
    return {
      name: student.name,
      focus: student.focus,
      focusUpdatedAt: student.focusUpdatedAt || null,
      email: student.email || "",
      blocked: !!student.blocked,
    };
  });
}

// Signing in on the site as a student: the files whose teacher wrote this
// email on them. Usually one; a student of two teachers has two. The route
// checks the email is the student's own (Firebase verified it) first.
async function findByEmail(email) {
  const clean = cleanEmail(email);
  if (!clean) return [];
  const db = getFirestore();
  const list = db
    ? (await db.collection(COLLECTION).where("email", "==", clean).limit(10).get()).docs.map((d) => d.data())
    : Object.values(loadLocal().students).filter((s) => s.email === clean);
  // Files with the sign-in turned off are left out; if that's all of them,
  // the student is told so rather than that the email isn't known.
  const open = list.filter((s) => !s.blocked);
  if (list.length && !open.length) throw blockedError();
  return open.map((s) => ({ key: s.key, name: s.name }));
}

function addNote(uid, id, text) {
  const clean = str(text, 2000);
  if (!clean) return Promise.reject(new Error("ההערה ריקה"));
  return editStudent(uid, id, (student) => {
    const note = { id: crypto.randomBytes(6).toString("hex"), text: clean, at: new Date().toISOString() };
    student.notes = [note, ...(student.notes || [])].slice(0, MAX_NOTES);
    return note;
  });
}

function deleteNote(uid, id, noteId) {
  return editStudent(uid, id, (student) => {
    student.notes = (student.notes || []).filter((n) => n.id !== noteId);
    return { ok: true };
  });
}

// Adds exercises and lessons (type "lesson", exerciseId "lesson-<id>") to the
// student's homework. One that is already assigned and not done yet isn't
// added twice. A mixed practice (topicId
// "mix") brings the exercises its questions come from in `items`; its
// exerciseId is the task's own id, so each one is a task of its own.
function addHomework(uid, id, items, { dueDate, note } = {}) {
  const list = (Array.isArray(items) ? items : []).filter((it) => str(it?.topicId) && str(it?.exerciseId));
  if (!list.length) return Promise.reject(new Error("לא נבחר תרגיל"));
  const due = /^\d{4}-\d{2}-\d{2}$/.test(String(dueDate || "")) ? dueDate : "";
  return editStudent(uid, id, (student) => {
    const homework = student.homework || [];
    const open = new Set(homework.filter((hw) => !hw.doneAt).map((hw) => `${hw.topicId}/${hw.exerciseId}`));
    const now = new Date().toISOString();
    const added = list
      .filter((it) => !open.has(`${str(it.topicId, 80)}/${str(it.exerciseId, 80)}`))
      .map((it) => {
        const id = crypto.randomBytes(6).toString("hex");
        const mix = str(it.topicId, 80) === "mix";
        return {
          id,
          topicId: str(it.topicId, 80),
          exerciseId: mix ? id : str(it.exerciseId, 80),
          topicTitle: str(it.topicTitle, 120),
          exerciseTitle: str(it.exerciseTitle, 160),
          type: str(it.type, 30),
          ...(mix ? { items: (Array.isArray(it.items) ? it.items : []).map((k) => str(k, 170)).filter(Boolean).slice(0, 300) } : {}),
          dueDate: due,
          note: str(note, 300),
          assignedAt: now,
          attempts: 0,
          doneAt: null,
          lastAt: null,
          score: null,
          total: null,
        };
      });
    student.homework = [...homework, ...added].slice(-MAX_HOMEWORK);
    return { added: added.length, skipped: list.length - added.length, homework: student.homework };
  });
}

function deleteHomework(uid, id, homeworkId) {
  return editStudent(uid, id, (student) => {
    student.homework = (student.homework || []).filter((hw) => hw.id !== homeworkId);
    return { homework: student.homework };
  });
}

// A test from the topics the teacher picked ([{ id, title }], in their
// order), with an optional name, due date and note to the student.
function addTest(uid, id, fields = {}) {
  const seen = new Set();
  const topics = (Array.isArray(fields.topics) ? fields.topics : [])
    .map((t) => ({ id: str(t?.id, 80), title: str(t?.title, 120) }))
    .filter((t) => t.id && t.title && !seen.has(t.id) && seen.add(t.id))
    .slice(0, MAX_TEST_TOPICS);
  if (!topics.length) return Promise.reject(new Error("בחרו לפחות נושא אחד למבחן"));
  const due = DAY.test(String(fields.dueDate || "")) ? fields.dueDate : "";
  return editStudent(uid, id, (student) => {
    const test = {
      id: crypto.randomBytes(6).toString("hex"),
      title: str(fields.title, 120) || (topics.length === 1 ? `מבחן: ${topics[0].title}` : `מבחן ב־${topics.length} נושאים`),
      topics,
      perTopic: testPerTopic(topics.length),
      dueDate: due,
      note: str(fields.note, 300),
      assignedAt: new Date().toISOString(),
      allowed: 1,
      attempts: [],
      retakeAt: null,
    };
    student.tests = [...(student.tests || []), test].slice(-MAX_TESTS);
    return { test, tests: student.tests };
  });
}

function deleteTest(uid, id, testId) {
  return editStudent(uid, id, (student) => {
    student.tests = (student.tests || []).filter((t) => t.id !== testId);
    return { tests: student.tests };
  });
}

// `allow`: one more hand-in (the student's request, or the teacher's own
// choice); otherwise the request is turned down and the student may ask again.
function answerRetake(uid, id, testId, allow) {
  return editStudent(uid, id, (student) => {
    const test = (student.tests || []).find((t) => t.id === testId);
    if (!test) throw notFound("המבחן לא נמצא");
    if (allow) {
      if (!testOpen(test)) test.allowed = (test.attempts || []).length + 1;
      test.retakeDeclinedAt = null;
    } else if (test.retakeAt) {
      test.retakeDeclinedAt = new Date().toISOString();
    }
    test.retakeAt = null;
    return { tests: student.tests };
  });
}

// A new link for the file; the old one stops working right away.
function regenerateKey(uid, id) {
  return editStudent(uid, id, (student) => {
    student.key = newKey();
    return { key: student.key };
  });
}

async function deleteStudent(uid, id) {
  const db = getFirestore();
  if (db) {
    const ref = db.collection(COLLECTION).doc(id);
    if (!ownedBy((await ref.get()).data(), uid)) throw notFound();
    const [activity, meta] = await Promise.all([ref.collection("activity").get(), ref.collection("meta").get()]);
    const docs = [...activity.docs, ...meta.docs];
    // Firestore batches cap at 500 writes.
    for (let i = 0; i < docs.length; i += 450) {
      const batch = db.batch();
      docs.slice(i, i + 450).forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
    await ref.delete();
    return;
  }
  const data = loadLocal();
  if (!ownedBy(data.students[id], uid)) throw notFound();
  delete data.students[id];
  saveLocal(data);
}

/* ── Weekly report: what the teacher's class did in one week — Sunday to
   Saturday, Israel time, the same week the points start over in. Who
   practiced and how much, who got stuck (an exercise whose best round of
   the week stayed under REPORT_LOW), the topics practiced (hardest first)
   and the questions most of the class got wrong. ── */

const REPORT_LOW = 70;
const REPORT_MISTAKES = 8;

function israelDay(iso) {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" });
}

// `day` (YYYY-MM-DD) moved by `days`, as the ISO time of that midnight in UTC.
function shiftDay(day, days) {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

// Every file of the teacher with its activity in `week`. The query takes a
// day more on each side (Israel is ahead of UTC); weekOf cuts it exactly.
async function weekFiles(uid, week) {
  const from = shiftDay(week, -1);
  const to = shiftDay(week, 8);
  const db = getFirestore();
  let files;
  if (db) {
    const docs = (await db.collection(COLLECTION).where("ownerUid", "==", uid).get()).docs;
    const snaps = await Promise.all(
      docs.map((d) => d.ref.collection("activity").where("at", ">=", from).where("at", "<", to).get())
    );
    files = docs.map((d, i) => ({ student: d.data(), activity: snaps[i].docs.map((a) => a.data()) }));
  } else {
    files = Object.values(loadLocal().students)
      .filter((s) => ownedBy(s, uid))
      .map((s) => ({ student: withoutActivity(s), activity: s.activity || [] }));
  }
  files.forEach((file) => {
    file.activity = file.activity.filter((a) => a.at >= from && a.at < to && weekOf(a.at) === week);
  });
  return files;
}

// One student's week. A round's score counts toward its exercise (the best
// full round of the week); mistakes-only retries and "my mistakes" rounds are
// practice time only, as on the student's file.
function studentWeek(student, activity, today) {
  const days = new Set();
  const exercises = new Map();
  const week = { rounds: 0, practiceSec: 0, lessons: 0, games: 0, points: 0 };
  activity.forEach((a) => {
    days.add(israelDay(a.at));
    week.points += a.points || 0;
    if (a.kind === "game") week.games++;
    if (a.kind === "lesson" || a.kind === "presentation") week.lessons++;
    if (a.kind !== "exercise") return;
    week.rounds++;
    week.practiceSec += a.durationSec || 0;
    if (a.isRetry || a.type === "review" || a.type === "daily" || a.type === PLACEMENT || !a.total) return;
    const key = `${a.topicId}/${a.exerciseId}`;
    const ex = exercises.get(key) || { topicId: a.topicId, topicTitle: a.topicTitle, title: a.exerciseTitle, score: 0, total: a.total, attempts: 0 };
    if (!ex.attempts || ratio(a.score, a.total) > ratio(ex.score, ex.total)) {
      ex.score = a.score;
      ex.total = a.total;
    }
    ex.attempts++;
    exercises.set(key, ex);
  });
  const list = [...exercises.values()];
  const open = (student.homework || []).filter((hw) => !hw.doneAt && !isLocked(hw, today));
  return {
    id: student.id,
    name: student.name,
    practiced: activity.length > 0,
    days: days.size,
    ...week,
    average: list.length ? Math.round((list.reduce((n, ex) => n + ratio(ex.score, ex.total), 0) / list.length) * 100) : null,
    exercises: list,
    stuck: list
      .filter((ex) => ratio(ex.score, ex.total) * 100 < REPORT_LOW)
      .sort((a, b) => ratio(a.score, a.total) - ratio(b.score, b.total))
      .map(({ topicId, ...ex }) => ex),
    homeworkOpen: open.length,
    homeworkLate: open.filter((hw) => hw.dueDate && hw.dueDate < today).length,
  };
}

async function weeklyReport(uid, requestedWeek) {
  if (!uid) throw new Error("יש להתחבר מחדש");
  const current = weekOf();
  const asked = /^\d{4}-\d{2}-\d{2}$/.test(String(requestedWeek || "")) ? weekOf(`${requestedWeek}T12:00:00Z`) : current;
  const week = asked > current ? current : asked;
  const today = israelDay(new Date());
  const files = await weekFiles(uid, week);

  const students = files.map(({ student, activity }) => studentWeek(student, activity, today));

  const topics = new Map();
  students.forEach((s) => {
    s.exercises.forEach((ex) => {
      const topic = topics.get(ex.topicId) || { title: ex.topicTitle, students: new Set(), rounds: 0, ratios: [] };
      topic.students.add(s.id);
      topic.rounds += ex.attempts;
      topic.ratios.push(ratio(ex.score, ex.total));
      topics.set(ex.topicId, topic);
    });
    delete s.exercises;
  });

  const mistakes = new Map();
  files.forEach(({ student, activity }) => {
    activity.forEach((a) => {
      // The placement test asks until the student doesn't know.
      if (a.type === PLACEMENT) return;
      (a.mistakes || []).forEach((m) => {
        if (!m.answer) return;
        const key = `${m.prompt}|${m.answer}`;
        const entry = mistakes.get(key) || { prompt: m.prompt, answer: m.answer, topicTitle: a.topicTitle, exerciseTitle: a.exerciseTitle, students: new Set(), times: 0 };
        entry.students.add(student.id);
        entry.times++;
        mistakes.set(key, entry);
      });
    });
  });

  const practiced = students.filter((s) => s.practiced);
  const averages = practiced.map((s) => s.average).filter((avg) => avg != null);
  return {
    week,
    current,
    low: REPORT_LOW,
    totals: {
      students: students.length,
      practiced: practiced.length,
      rounds: practiced.reduce((n, s) => n + s.rounds, 0),
      practiceSec: practiced.reduce((n, s) => n + s.practiceSec, 0),
      average: averages.length ? Math.round(averages.reduce((n, avg) => n + avg, 0) / averages.length) : null,
    },
    students,
    topics: [...topics.values()]
      .map((t) => ({
        title: t.title,
        students: t.students.size,
        rounds: t.rounds,
        average: Math.round((t.ratios.reduce((n, r) => n + r, 0) / t.ratios.length) * 100),
      }))
      .sort((a, b) => a.average - b.average || b.students - a.students),
    mistakes: [...mistakes.values()]
      .map((m) => ({ ...m, students: m.students.size }))
      .sort((a, b) => b.students - a.students || b.times - a.times)
      .slice(0, REPORT_MISTAKES),
  };
}

/* ── The students' reports (#days, #week and #month on /admin/students):
   what each of the teacher's students did on every day of a range (Israel
   time) — the lessons they opened, the exercises they practiced and the
   games they played. The page sums the days up into the daily, weekly and
   monthly reports. A day's rounds of the same exercise are one entry: how
   many rounds, the time and the best full round of that day. ── */

const DAYS_REPORT_MAX = 62;

function daysBetween(from, to) {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000);
}

// Every file of the teacher with its activity from `from` to `to` (both
// whole days). The query takes a day more on each side, like weekFiles.
async function rangeFiles(uid, from, to) {
  const start = shiftDay(from, -1);
  const end = shiftDay(to, 2);
  const db = getFirestore();
  let files;
  if (db) {
    const docs = (await db.collection(COLLECTION).where("ownerUid", "==", uid).get()).docs;
    const snaps = await Promise.all(
      docs.map((d) => d.ref.collection("activity").where("at", ">=", start).where("at", "<", end).get())
    );
    files = docs.map((d, i) => ({ student: d.data(), activity: snaps[i].docs.map((a) => a.data()) }));
  } else {
    files = Object.values(loadLocal().students)
      .filter((s) => ownedBy(s, uid))
      .map((s) => ({ student: withoutActivity(s), activity: s.activity || [] }));
  }
  files.forEach((file) => {
    file.activity = file.activity
      .filter((a) => a.at >= start && a.at < end && KINDS.includes(a.kind))
      .filter((a) => {
        const day = israelDay(a.at);
        return day >= from && day <= to;
      })
      .sort((a, b) => a.at.localeCompare(b.at));
  });
  return files;
}

// One day's activity (oldest first) as entries, in the order they started.
function dayEntries(activity) {
  const entries = new Map();
  activity.forEach((a) => {
    const key = a.kind === "exercise" ? `x:${a.topicId}/${a.exerciseId}` : a.kind === "game" ? `g:${a.gameId}` : `l:${a.kind}:${a.itemId}`;
    let entry = entries.get(key);
    if (!entry) {
      entry =
        a.kind === "exercise"
          ? { kind: "exercise", at: a.at, topicId: a.topicId, topicTitle: a.topicTitle, exerciseId: a.exerciseId, title: a.exerciseTitle, type: a.type, rounds: 0, practiceSec: 0, score: null, total: null }
          : a.kind === "game"
            ? { kind: "game", at: a.at, gameId: a.gameId, title: a.gameTitle || a.gameId, rounds: 0, score: null }
            : { kind: a.kind, at: a.at, topicId: a.topicId, topicTitle: a.topicTitle, itemId: a.itemId, title: a.itemTitle, rounds: 0 };
      entries.set(key, entry);
    }
    entry.rounds++;
    if (a.kind === "game") {
      if (entry.score == null || a.score > entry.score) entry.score = a.score;
      return;
    }
    if (a.kind !== "exercise") return;
    entry.practiceSec += a.durationSec || 0;
    // A mistakes-only retry is a partial round: time, not a score.
    if (a.isRetry || !a.total) return;
    if (entry.total == null || ratio(a.score, a.total) > ratio(entry.score, entry.total)) {
      entry.score = a.score;
      entry.total = a.total;
    }
  });
  return [...entries.values()];
}

function studentDays(student, activity) {
  const byDay = new Map();
  activity.forEach((a) => {
    const day = israelDay(a.at);
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day).push(a);
  });
  const days = [...byDay.entries()].map(([day, list]) => ({ day, entries: dayEntries(list) }));

  // The best full round of every exercise in the range, for the average (the
  // mistakes review and the daily challenge mix many exercises, so they
  // don't count).
  const best = new Map();
  const totals = { days: days.length, lessons: 0, rounds: 0, games: 0, practiceSec: 0 };
  days.forEach(({ entries }) => {
    entries.forEach((e) => {
      if (e.kind === "game") totals.games += e.rounds;
      else if (e.kind !== "exercise") totals.lessons++;
      else {
        totals.rounds += e.rounds;
        totals.practiceSec += e.practiceSec;
        if (e.total == null || MIXED_TOPICS.has(e.topicId) || e.type === "review" || e.type === "daily") return;
        const key = `${e.topicId}/${e.exerciseId}`;
        const prev = best.get(key);
        if (!prev || ratio(e.score, e.total) > prev) best.set(key, ratio(e.score, e.total));
      }
    });
  });
  return {
    id: student.id,
    name: student.name,
    totals: { ...totals, average: averagePct([...best.values()]) },
    days,
  };
}

async function daysReport(uid, requestedFrom, requestedTo) {
  if (!uid) throw new Error("יש להתחבר מחדש");
  const today = israelDay(new Date());
  let to = DAY.test(String(requestedTo || "")) ? requestedTo : today;
  let from = DAY.test(String(requestedFrom || "")) ? requestedFrom : weekOf();
  if (to > today) to = today;
  if (from > to) [from, to] = [to, from];
  if (daysBetween(from, to) >= DAYS_REPORT_MAX) from = shiftDay(to, 1 - DAYS_REPORT_MAX).slice(0, 10);

  const files = await rangeFiles(uid, from, to);
  const students = files
    .map(({ student, activity }) => studentDays(student, activity))
    .sort((a, b) => a.name.localeCompare(b.name, "he"));
  return { from, to, today, max: DAYS_REPORT_MAX, students };
}

/* ── The class at a glance (#class on /admin/students): every topic the
   teacher's students practiced, from all their rounds so far — who
   practiced it and their average in it — and the questions the class still
   gets wrong (open in the students' mistake banks), the most students
   first. Built from the files' best scores and banks, so no activity is
   read. ── */

const CLASS_MISTAKES = 60;
// Rounds that mix questions from many topics (and the placement test's).
const MIXED_TOPICS = new Set(["mix", "daily", "review", PLACEMENT]);

function averagePct(ratios) {
  return ratios.length ? Math.round((ratios.reduce((n, r) => n + r, 0) / ratios.length) * 100) : null;
}

async function classView(uid) {
  if (!uid) throw new Error("יש להתחבר מחדש");
  const db = getFirestore();
  let files;
  if (db) {
    const docs = (await db.collection(COLLECTION).where("ownerUid", "==", uid).get()).docs;
    const banks = docs.length ? await db.getAll(...docs.map((d) => reviewDoc(d.ref))) : [];
    files = docs.map((d, i) => ({ student: d.data(), bank: banks[i].exists ? banks[i].data() : null }));
  } else {
    files = Object.values(loadLocal().students)
      .filter((s) => ownedBy(s, uid))
      .map((s) => ({ student: s, bank: s.review || null }));
  }

  const topics = new Map();
  const students = files.map(({ student, bank }) => {
    // Full rounds only, as on the student's file (summarize in admin-students.js).
    const best = Object.entries(student.best || {}).filter(([, e]) => e.bestAt);
    const byTopic = new Map();
    best.forEach(([key, e]) => {
      const topicId = key.split("/")[0];
      if (MIXED_TOPICS.has(topicId)) return;
      const t = byTopic.get(topicId) || { title: e.topicTitle, ratios: [], weak: [] };
      t.ratios.push(ratio(e.score, e.total));
      // The exercises whose best round stayed under REPORT_LOW, for a
      // practice round of them from the report.
      if (ratio(e.score, e.total) * 100 < REPORT_LOW) t.weak.push(key.split("/").slice(1).join("/"));
      byTopic.set(topicId, t);
    });
    byTopic.forEach((t, topicId) => {
      const topic = topics.get(topicId) || { id: topicId, title: t.title, students: [] };
      topic.students.push({ id: student.id, average: averagePct(t.ratios), exercises: t.ratios.length, weak: t.weak });
      topics.set(topicId, topic);
    });
    return {
      id: student.id,
      name: student.name,
      practiced: best.length > 0,
      average: averagePct(best.map(([, e]) => ratio(e.score, e.total))),
      practiceSec: student.counts?.practiceSec || 0,
      mistakes: (bank?.entries || []).length,
      placement: placementView(student),
    };
  });

  const mistakes = new Map();
  files.forEach(({ student, bank }) => {
    (bank?.entries || []).forEach((e) => {
      if (!e.answer || MIXED_TOPICS.has(e.topicId)) return;
      const m = mistakes.get(e.id) || {
        topicId: e.topicId,
        topicTitle: e.topicTitle,
        exerciseTitle: e.exerciseTitle,
        prompt: e.prompt,
        answer: e.answer,
        students: [],
        times: 0,
      };
      m.students.push(student.id);
      m.times += e.wrong || 1;
      mistakes.set(e.id, m);
    });
  });

  const averages = students.map((s) => s.average).filter((avg) => avg != null);
  return {
    totals: {
      students: students.length,
      practiced: students.filter((s) => s.practiced).length,
      practiceSec: students.reduce((n, s) => n + s.practiceSec, 0),
      average: averages.length ? Math.round(averages.reduce((n, avg) => n + avg, 0) / averages.length) : null,
    },
    students,
    // The hardest first; a topic more students practiced before one with fewer.
    topics: [...topics.values()]
      .map((t) => ({ ...t, average: Math.round(t.students.reduce((n, s) => n + s.average, 0) / t.students.length) }))
      .sort((a, b) => a.average - b.average || b.students.length - a.students.length),
    mistakes: [...mistakes.values()]
      .sort((a, b) => b.students.length - a.students.length || b.times - a.times)
      .slice(0, CLASS_MISTAKES),
  };
}

/* ── The parents' link (/p/<parentKey>): a page that only shows how the
   student is doing — this week, the daily challenge streak, the teacher's
   tasks and the last exercises solved. The teacher makes it from the
   student's file; a new one stops the old one. Nothing done there goes to
   the file, and the student's own link and the teacher's notes stay out. ── */

const PARENT_RECENT = 6;

function parentLink(uid, id, renew = false) {
  return editStudent(uid, id, (student) => {
    if (!student.parentKey || renew) student.parentKey = newKey();
    return { parentKey: student.parentKey };
  });
}

async function getParentView(key) {
  if (!isKey(key)) return null;
  const week = weekOf();
  const from = shiftDay(week, -1);
  const db = getFirestore();
  let student;
  let activity;
  if (db) {
    const snap = await db.collection(COLLECTION).where("parentKey", "==", key).limit(1).get();
    if (snap.empty) return null;
    student = snap.docs[0].data();
    activity = (await snap.docs[0].ref.collection("activity").where("at", ">=", from).get()).docs.map((d) => d.data());
  } else {
    student = Object.values(loadLocal().students).find((s) => s.parentKey === key);
    if (!student) return null;
    activity = student.activity || [];
  }
  const today = israelDay(new Date());
  const now = studentWeek(student, activity.filter((a) => a.at >= from && weekOf(a.at) === week), today);
  const best = student.best || {};
  return {
    name: student.name,
    lastActive: student.lastActive || null,
    week: {
      from: week,
      days: now.days,
      rounds: now.rounds,
      practiceMin: Math.round(now.practiceSec / 60),
      average: now.average,
    },
    daily: dailyView(student),
    homework: (student.homework || []).map((hw) => ({
      topicTitle: hw.topicTitle,
      exerciseTitle: hw.exerciseTitle,
      dueDate: hw.dueDate || "",
      doneAt: hw.doneAt || null,
      score: hw.score,
      total: hw.total,
    })),
    recent: Object.values(best)
      .filter((entry) => entry?.bestAt)
      .sort((a, b) => String(b.lastAt || b.bestAt).localeCompare(String(a.lastAt || a.bestAt)))
      .slice(0, PARENT_RECENT)
      .map((entry) => ({ topicTitle: entry.topicTitle || "", title: entry.title || "", score: entry.score, total: entry.total, at: entry.lastAt || entry.bestAt })),
    today,
  };
}

/* ── Files from before Google sign-in ── */

// No new file is ever opened without an owner, so the count only goes down:
// Firestore is scanned once per server start, not on every list load.
let unownedCount = null;

async function countUnowned() {
  if (unownedCount != null) return unownedCount;
  const db = getFirestore();
  unownedCount = db
    ? (await db.collection(COLLECTION).select("ownerUid").get()).docs.filter((d) => !d.data().ownerUid).length
    : Object.values(loadLocal().students).filter((s) => !s.ownerUid).length;
  return unownedCount;
}

// Gives every file that has no owner yet to this teacher. The route checks
// the teacher PIN first, so only the site owner can do it.
async function claimUnowned(owner) {
  if (!owner?.uid) throw new Error("יש להתחבר מחדש");
  const db = getFirestore();
  let claimed = 0;
  if (db) {
    const docs = (await db.collection(COLLECTION).select("ownerUid").get()).docs.filter((d) => !d.data().ownerUid);
    // Firestore batches cap at 500 writes.
    for (let i = 0; i < docs.length; i += 450) {
      const batch = db.batch();
      docs.slice(i, i + 450).forEach((d) => batch.update(d.ref, { ownerUid: owner.uid, ownerEmail: owner.email || "" }));
      await batch.commit();
    }
    claimed = docs.length;
  } else {
    const data = loadLocal();
    Object.values(data.students).forEach((s) => {
      if (s.ownerUid) return;
      s.ownerUid = owner.uid;
      s.ownerEmail = owner.email || "";
      claimed++;
    });
    if (claimed) saveLocal(data);
  }
  unownedCount = 0;
  return { claimed };
}

module.exports = {
  getPortal,
  recordActivity,
  askHelp,
  askRetake,
  classGuest,
  joinClass,
  addStudentsToClass,
  markClassPost,
  classIdsByKey,
  leaveClass,
  dropClass,
  getLeaderboard,
  getReview,
  recordReview,
  getCards,
  recordCards,
  storageMode,
  countUnowned,
  claimUnowned,
  createStudent,
  listStudents,
  getStudent,
  weeklyReport,
  daysReport,
  classView,
  parentLink,
  getParentView,
  updateDetails,
  findByEmail,
  addNote,
  deleteNote,
  addHomework,
  deleteHomework,
  sendDiaryTasks,
  removeDiaryTasks,
  addTest,
  deleteTest,
  answerRetake,
  regenerateKey,
  deleteStudent,
};
