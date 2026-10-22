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
 * Uses Firestore (`students/{id}` + `students/{id}/activity`) when a service
 * account is configured, so files survive redeploys. Falls back to the local
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
    return {
      ...base,
      topicId: str(raw.topicId, 80),
      topicTitle: str(raw.topicTitle, 120),
      exerciseId: str(raw.exerciseId, 80),
      exerciseTitle: str(raw.exerciseTitle, 160),
      type: str(raw.type, 30),
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
  }

  if (kind === "game") {
    if (!str(raw.gameId)) throw new Error("חסר מזהה משחק");
    return {
      ...base,
      gameId: str(raw.gameId, 80),
      gameTitle: str(raw.gameTitle, 160),
      score: num(raw.score, 0, 1e7),
    };
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

function newStudent(owner, { name, grade } = {}) {
  const cleanName = str(name, 80);
  if (!cleanName) throw new Error("חסר שם תלמיד");
  return {
    id: crypto.randomBytes(8).toString("hex"),
    key: newKey(),
    ownerUid: owner.uid,
    ownerEmail: owner.email || "",
    name: cleanName,
    grade: str(grade, 60),
    focus: "",
    focusUpdatedAt: null,
    notes: [],
    homework: [],
    createdAt: new Date().toISOString(),
    lastActive: null,
    counts: { exercises: 0, lessons: 0, games: 0, practiceSec: 0 },
    best: {},
  };
}

function ratio(score, total) {
  return total ? score / total : 0;
}

// Applies one activity to the file's running totals and homework, in place.
function applyActivity(student, activity) {
  student.lastActive = activity.at;
  student.counts = { exercises: 0, lessons: 0, games: 0, practiceSec: 0, ...student.counts };
  student.best = student.best || {};

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
  const { activity, ...student } = record;
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
  // Only what the student page needs — the teacher's notes stay private.
  return { name: student.name, homework: student.homework || [] };
}

async function recordActivity(key, rawActivity) {
  if (!isKey(key)) throw notFound("הקישור לא תקין");
  const activity = cleanActivity(rawActivity);
  const db = getFirestore();
  if (db) {
    const ref = await firestoreRefByKey(db, key);
    if (!ref) throw notFound("הקישור לא תקין");
    await db.runTransaction(async (tx) => {
      const doc = await tx.get(ref);
      const student = doc.data();
      applyActivity(student, activity);
      tx.set(ref, student);
      tx.set(ref.collection("activity").doc(activity.id), activity);
    });
    return activity;
  }

  const data = loadLocal();
  const record = Object.values(data.students).find((s) => s.key === key);
  if (!record) throw notFound("הקישור לא תקין");
  applyActivity(record, activity);
  record.activity = [activity, ...(record.activity || [])].slice(0, LOCAL_ACTIVITY_CAP);
  saveLocal(data);
  return activity;
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
  const list = db
    ? (await db.collection(COLLECTION).where("ownerUid", "==", uid).get()).docs.map((d) => d.data())
    : Object.values(loadLocal().students).filter((s) => ownedBy(s, uid)).map(withoutActivity);
  // Most recently active first; files nobody has used yet by when they were opened.
  return list.sort((a, b) => String(b.lastActive || b.createdAt).localeCompare(String(a.lastActive || a.createdAt)));
}

async function getStudent(uid, id) {
  const db = getFirestore();
  if (db) {
    const ref = db.collection(COLLECTION).doc(id);
    const doc = await ref.get();
    if (!doc.exists || !ownedBy(doc.data(), uid)) return null;
    const snap = await ref.collection("activity").orderBy("at", "desc").limit(ACTIVITY_READ_LIMIT).get();
    return { ...doc.data(), activity: snap.docs.map((d) => d.data()) };
  }
  const record = loadLocal().students[id];
  if (!ownedBy(record, uid)) return null;
  return { ...record, activity: (record.activity || []).slice(0, ACTIVITY_READ_LIMIT) };
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

function updateDetails(uid, id, fields = {}) {
  return editStudent(uid, id, (student) => {
    if ("name" in fields) {
      const name = str(fields.name, 80);
      if (!name) throw new Error("חסר שם תלמיד");
      student.name = name;
    }
    if ("grade" in fields) student.grade = str(fields.grade, 60);
    if ("focus" in fields) {
      student.focus = str(fields.focus, 2000);
      student.focusUpdatedAt = new Date().toISOString();
    }
    return { name: student.name, grade: student.grade, focus: student.focus, focusUpdatedAt: student.focusUpdatedAt || null };
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
    const activity = await ref.collection("activity").get();
    // Firestore batches cap at 500 writes.
    for (let i = 0; i < activity.docs.length; i += 450) {
      const batch = db.batch();
      activity.docs.slice(i, i + 450).forEach((d) => batch.delete(d.ref));
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
  storageMode,
  countUnowned,
  claimUnowned,
  createStudent,
  listStudents,
  getStudent,
  updateDetails,
  addNote,
  deleteNote,
  addHomework,
  deleteHomework,
  regenerateKey,
  deleteStudent,
};
