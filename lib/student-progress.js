const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { getFirestore } = require("./firebase-admin");

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

function pointsFor(activity) {
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

function str(value, max = 200) {
  return String(value ?? "").trim().slice(0, max);
}

function num(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.round(n)));
}

// The teacher's number for the student — whole, 1-999999, one per student
// in each teacher's list.
function studentNumber(value) {
  const text = String(value ?? "").trim();
  if (!/^\d{1,6}$/.test(text) || !Number(text)) throw new Error("מספר תלמיד צריך להיות מספר שלם, 1 עד 999999");
  return Number(text);
}

async function assertNumberFree(uid, number, exceptId = null) {
  const db = getFirestore();
  const taken = db
    ? (await db.collection(COLLECTION).where("ownerUid", "==", uid).where("number", "==", number).get()).docs.some((d) => d.id !== exceptId)
    : Object.values(loadLocal().students).some((s) => ownedBy(s, uid) && s.number === number && s.id !== exceptId);
  if (taken) throw new Error(`כבר יש תלמיד עם המספר ${number}`);
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
      mistakes: (Array.isArray(raw.mistakes) ? raw.mistakes : []).slice(0, MAX_MISTAKES).map((m) => ({
        prompt: str(m?.prompt, 200),
        answer: str(m?.answer, 200),
        given: str(m?.given, 200),
      })),
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

function newStudent(owner, { name, number } = {}) {
  const cleanName = str(name, 80);
  if (!cleanName) throw new Error("חסר שם תלמיד");
  return {
    id: crypto.randomBytes(8).toString("hex"),
    key: newKey(),
    ownerUid: owner.uid,
    ownerEmail: owner.email || "",
    name: cleanName,
    number: studentNumber(number),
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
    return;
  }

  student.counts.exercises++;
  student.counts.practiceSec += activity.durationSec;
  // A round of "my mistakes" mixes questions from many exercises, so it is
  // practice time but no exercise's score.
  if (activity.type === "review") return;
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
  // A mistakes-only retry is a partial round, so it never becomes the best
  // score and doesn't complete homework.
  if (activity.isRetry) {
    student.best[key] = entry;
    return;
  }
  if (!prev?.bestAt || ratio(activity.score, activity.total) >= ratio(entry.score, entry.total)) {
    entry.score = activity.score;
    entry.total = activity.total;
    entry.bestAt = activity.at;
  }
  student.best[key] = entry;

  (student.homework || []).forEach((hw) => {
    if (hw.topicId !== activity.topicId || hw.exerciseId !== activity.exerciseId) return;
    hw.attempts = (hw.attempts || 0) + 1;
    hw.lastAt = activity.at;
    if (!hw.doneAt) hw.doneAt = activity.at;
    if (hw.score == null || ratio(activity.score, activity.total) >= ratio(hw.score, hw.total)) {
      hw.score = activity.score;
      hw.total = activity.total;
    }
  });
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
  const { activity, review, ...student } = record;
  return student;
}

function ownedBy(student, uid) {
  return !!uid && student?.ownerUid === uid;
}

async function firestoreRefByKey(db, key) {
  const snap = await db.collection(COLLECTION).where("key", "==", key).limit(1).get();
  return snap.empty ? null : snap.docs[0].ref;
}

/* ── Student side (by link key) ── */

async function getPortal(key) {
  if (!isKey(key)) return null;
  const db = getFirestore();
  let student;
  if (db) {
    const ref = await firestoreRefByKey(db, key);
    student = ref ? (await ref.get()).data() : null;
  } else {
    student = Object.values(loadLocal().students).find((s) => s.key === key) || null;
  }
  if (!student) return null;
  // Only what the student pages need — the teacher's notes stay private.
  // Points come with the leaderboard (getLeaderboard), which backfills them.
  // `finished`: the exercises with a whole round done ("topicId/exerciseId"),
  // so the practice page can mark them on any device.
  const best = student.best || {};
  const finished = Object.keys(best).filter((k) => best[k]?.bestAt);
  return { name: student.name, homework: student.homework || [], finished, progress: progressView(student, finished) };
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

async function recordActivity(key, rawActivity) {
  if (!isKey(key)) throw notFound("הקישור לא תקין");
  const activity = cleanActivity(rawActivity);
  const db = getFirestore();
  if (db) {
    const ref = await firestoreRefByKey(db, key);
    if (!ref) throw notFound("הקישור לא תקין");
    const points = await db.runTransaction(async (tx) => {
      const doc = await tx.get(ref);
      const student = doc.data();
      if (!student.points) backfillPoints(student, (await tx.get(ref.collection("activity"))).docs.map((d) => d.data()));
      applyActivity(student, activity);
      tx.set(ref, student);
      tx.set(ref.collection("activity").doc(activity.id), activity);
      return pointsView(student);
    });
    return { activity, points };
  }

  const data = loadLocal();
  const record = Object.values(data.students).find((s) => s.key === key);
  if (!record) throw notFound("הקישור לא תקין");
  if (!record.points) backfillPoints(record, record.activity || []);
  applyActivity(record, activity);
  record.activity = [activity, ...(record.activity || [])].slice(0, LOCAL_ACTIVITY_CAP);
  saveLocal(data);
  return { activity, points: pointsView(record) };
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
    }));
}

// The class leaderboard for the student with this link. Classmates' links
// and ids never leave the server, and their last names are cut to an initial.
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
    me = all.find((s) => s.key === key);
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
  const record = Object.values(loadLocal().students).find((s) => s.key === key);
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
  const record = Object.values(data.students).find((s) => s.key === key);
  if (!record) throw notFound("הקישור לא תקין");
  if (!ops.length) return { count: null };
  record.review = applyReview(record.review || emptyReview(), ops, at);
  saveLocal(data);
  return { count: record.review.entries.length, mastered: record.review.mastered };
}

/* ── Teacher side (by owner uid + file id) ── */

function storageMode() {
  return getFirestore() ? "firestore" : "local";
}

async function createStudent(owner, fields) {
  if (!owner?.uid) throw new Error("יש להתחבר מחדש");
  const student = newStudent(owner, fields);
  await assertNumberFree(owner.uid, student.number);
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
  const number = "number" in fields ? studentNumber(fields.number) : null;
  if (number != null) await assertNumberFree(uid, number, id);
  return editStudent(uid, id, (student) => {
    if ("name" in fields) {
      const name = str(fields.name, 80);
      if (!name) throw new Error("חסר שם תלמיד");
      student.name = name;
    }
    if (number != null) student.number = number;
    if ("focus" in fields) {
      student.focus = str(fields.focus, 2000);
      student.focusUpdatedAt = new Date().toISOString();
    }
    return { name: student.name, number: student.number ?? null, focus: student.focus, focusUpdatedAt: student.focusUpdatedAt || null };
  });
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

// Adds exercises to the student's homework. An exercise that is already
// assigned and not done yet isn't added twice.
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
      .map((it) => ({
        id: crypto.randomBytes(6).toString("hex"),
        topicId: str(it.topicId, 80),
        exerciseId: str(it.exerciseId, 80),
        topicTitle: str(it.topicTitle, 120),
        exerciseTitle: str(it.exerciseTitle, 160),
        type: str(it.type, 30),
        dueDate: due,
        note: str(note, 300),
        assignedAt: now,
        attempts: 0,
        doneAt: null,
        lastAt: null,
        score: null,
        total: null,
      }));
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
    if (a.isRetry || a.type === "review" || !a.total) return;
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
  const open = (student.homework || []).filter((hw) => !hw.doneAt);
  return {
    id: student.id,
    name: student.name,
    number: student.number ?? null,
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
  getLeaderboard,
  getReview,
  recordReview,
  storageMode,
  countUnowned,
  claimUnowned,
  createStudent,
  listStudents,
  getStudent,
  weeklyReport,
  updateDetails,
  addNote,
  deleteNote,
  addHomework,
  deleteHomework,
  regenerateKey,
  deleteStudent,
};
