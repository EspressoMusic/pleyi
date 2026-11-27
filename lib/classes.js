const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { getFirestore } = require("./firebase-admin");

/**
 * Classes the teacher opens on /my-room ("הכיתות שלי"): a name, a join link
 * (/c/<code>) the teacher sends the class, and the updates the teacher posts
 * to it — a message, a task, an assignment, a guide. A student who opens the
 * link writes their name and gets a student file of that teacher, in the
 * class (or joins with the file this device is already linked to); the
 * updates then show on their page (/s/<key>#class).
 *
 * Who is in a class is kept on the student files (`classIds`, see
 * lib/student-progress.js), so the teacher's student list has them too.
 *
 * Firestore (`classes/{id}`) when a service account is configured, else the
 * local data/classes.json — same split as student-progress.
 */

const CLASSES_FILE = path.join(__dirname, "..", "data", "classes.json");
const COLLECTION = "classes";
const MAX_PER_TEACHER = 30;
const MAX_POSTS = 100;
// No 0/O or 1/I: the code is read off the board and typed by kids.
const CODE_LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;
const CODE_PATTERN = /^[A-Z2-9]{6}$/;
const ID_PATTERN = /^[a-f0-9]{16}$/;
const DAY = /^\d{4}-\d{2}-\d{2}$/;

// "note" a message, "task" a task, "assignment" something to hand in,
// "guide" instructions, "exercise" an exercise or a lesson from the English
// library (`task`) that every student in the class opens from the chat.
// Tasks and assignments are marked done by the students; an exercise is
// done once the student solved it after it was sent (lib/student-progress.js).
// The labels are in the pages.
const KINDS = ["note", "task", "assignment", "guide", "exercise"];
const TASK_ID = /^[A-Za-z0-9_-]{1,80}$/;

function str(value, max = 200) {
  return String(value ?? "").trim().slice(0, max);
}

// Keeps the line breaks the teacher wrote; trims the rest.
function text(value, max) {
  return String(value ?? "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max);
}

function fail(message, status = 400) {
  return Object.assign(new Error(message), { status });
}

function notFound() {
  return fail("הכיתה לא נמצאה", 404);
}

function newCodeText() {
  const bytes = crypto.randomBytes(CODE_LENGTH);
  return [...bytes].map((b) => CODE_LETTERS[b % CODE_LETTERS.length]).join("");
}

function cleanCode(code) {
  const value = String(code || "").trim().toUpperCase();
  return CODE_PATTERN.test(value) ? value : "";
}

// A web address, or a page of the site ("/services/…").
function cleanLink(value) {
  const link = str(value, 500);
  if (!link) return "";
  if (/^\/(?!\/)/.test(link)) return link;
  try {
    const url = new URL(link);
    if (url.protocol === "https:" || url.protocol === "http:") return url.href;
  } catch {
    /* falls through */
  }
  throw fail("הקישור לא תקין — הוא צריך להתחיל ב־https://");
}

/* ── Storage ── */

function loadLocal() {
  try {
    if (fs.existsSync(CLASSES_FILE)) return JSON.parse(fs.readFileSync(CLASSES_FILE, "utf8")).classes || {};
  } catch {
    /* ignore */
  }
  return {};
}

function saveLocal(classes) {
  fs.mkdirSync(path.dirname(CLASSES_FILE), { recursive: true });
  fs.writeFileSync(CLASSES_FILE, JSON.stringify({ classes }, null, 2), "utf8");
}

async function ownClasses(uid) {
  const db = getFirestore();
  if (db) return (await db.collection(COLLECTION).where("ownerUid", "==", uid).get()).docs.map((d) => d.data());
  return Object.values(loadLocal()).filter((c) => c.ownerUid === uid);
}

async function writeRecord(record) {
  const db = getFirestore();
  if (db) {
    await db.collection(COLLECTION).doc(record.id).set(record);
    return;
  }
  const all = loadLocal();
  all[record.id] = record;
  saveLocal(all);
}

async function findRecord(id) {
  if (!ID_PATTERN.test(String(id || ""))) return null;
  const db = getFirestore();
  if (db) {
    const doc = await db.collection(COLLECTION).doc(id).get();
    return doc.exists ? doc.data() : null;
  }
  return loadLocal()[id] || null;
}

async function ownRecord(uid, id) {
  const record = await findRecord(id);
  if (!record || !uid || record.ownerUid !== uid) throw notFound();
  return record;
}

async function codeTaken(code) {
  const db = getFirestore();
  if (db) return !(await db.collection(COLLECTION).where("code", "==", code).limit(1).get()).empty;
  return Object.values(loadLocal()).some((c) => c.code === code);
}

async function uniqueCode() {
  for (let i = 0; i < 8; i++) {
    const code = newCodeText();
    if (!(await codeTaken(code))) return code;
  }
  throw fail("לא הצלחנו ליצור קוד לכיתה — נסו שוב", 500);
}

// Newest update first.
function view(record) {
  return { ...record, posts: [...(record.posts || [])].sort((a, b) => b.at.localeCompare(a.at)) };
}

/* ── Teacher side (by owner uid) ── */

async function listClasses(uid) {
  if (!uid) return [];
  const list = await ownClasses(uid);
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(view);
}

async function createClass(owner, { name, teacherName } = {}) {
  const uid = owner?.uid;
  if (!uid) throw fail("יש להתחבר מחדש", 401);
  const cleanName = str(name, 60);
  if (!cleanName) throw fail("כתבו שם לכיתה");
  if ((await ownClasses(uid)).length >= MAX_PER_TEACHER) throw fail(`אפשר לפתוח עד ${MAX_PER_TEACHER} כיתות — מחקו כיתה ישנה`);
  const record = {
    id: crypto.randomBytes(8).toString("hex"),
    ownerUid: uid,
    ownerEmail: owner.email || "",
    teacherName: str(teacherName, 60),
    name: cleanName,
    code: await uniqueCode(),
    open: true,
    createdAt: new Date().toISOString(),
    posts: [],
  };
  await writeRecord(record);
  return view(record);
}

// The name, and whether new students can still join (`open`).
async function updateClass(uid, id, fields = {}) {
  const record = await ownRecord(uid, id);
  if ("name" in fields) {
    const name = str(fields.name, 60);
    if (!name) throw fail("כתבו שם לכיתה");
    record.name = name;
  }
  if ("open" in fields) record.open = fields.open === true;
  await writeRecord(record);
  return view(record);
}

// A new join link; the old one stops working right away. Students already
// in the class stay in it.
async function newCode(uid, id) {
  const record = await ownRecord(uid, id);
  record.code = await uniqueCode();
  await writeRecord(record);
  return view(record);
}

async function deleteClass(uid, id) {
  await ownRecord(uid, id);
  const db = getFirestore();
  if (db) {
    await db.collection(COLLECTION).doc(id).delete();
    return;
  }
  const all = loadLocal();
  delete all[id];
  saveLocal(all);
}

// The exercise (or lesson, exerciseId "lesson-<id>") an "exercise" post
// sends, as the English library names it.
function cleanTask(task) {
  const topicId = str(task?.topicId, 80);
  const exerciseId = str(task?.exerciseId, 80);
  if (!TASK_ID.test(topicId) || !TASK_ID.test(exerciseId) || topicId === "mix" || topicId === "my-lessons") {
    throw fail("בחרו תרגיל לשליחה");
  }
  return {
    topicId,
    exerciseId,
    topicTitle: str(task.topicTitle, 120),
    exerciseTitle: str(task.exerciseTitle, 160),
    type: exerciseId.startsWith("lesson-") ? "lesson" : str(task.type, 30),
  };
}

// The class is a chat: the teacher writes one message; the title (older
// updates had one) is optional. An exercise needs no words.
async function addPost(uid, id, fields = {}) {
  const record = await ownRecord(uid, id);
  const kind = KINDS.includes(fields.kind) ? fields.kind : "note";
  const task = kind === "exercise" ? cleanTask(fields.task) : null;
  const title = str(fields.title, 120);
  const body = text(fields.text, 1500);
  if (!task && !title && !body) throw fail("כתבו מה לשלוח לכיתה");
  const post = {
    id: crypto.randomBytes(6).toString("hex"),
    kind,
    title,
    text: body,
    ...(task ? { task } : {}),
    dueDate: DAY.test(String(fields.dueDate || "")) ? fields.dueDate : "",
    link: cleanLink(fields.link),
    at: new Date().toISOString(),
  };
  record.posts = [...(record.posts || []), post].slice(-MAX_POSTS);
  await writeRecord(record);
  return view(record);
}

async function deletePost(uid, id, postId) {
  const record = await ownRecord(uid, id);
  record.posts = (record.posts || []).filter((p) => p.id !== postId);
  await writeRecord(record);
  return view(record);
}

// The teacher's own class, for adding students to it.
async function getOwn(uid, id) {
  return ownRecord(uid, id);
}

/* ── Student side ── */

// The class a join link opens, or null.
async function findByCode(code) {
  const clean = cleanCode(code);
  if (!clean) return null;
  const db = getFirestore();
  if (db) {
    const snap = await db.collection(COLLECTION).where("code", "==", clean).limit(1).get();
    return snap.empty ? null : snap.docs[0].data();
  }
  return Object.values(loadLocal()).find((c) => c.code === clean) || null;
}

// The classes of a student's file, in the order given; deleted ones are left out.
async function getMany(ids) {
  const list = (Array.isArray(ids) ? ids : []).filter((id) => ID_PATTERN.test(String(id || ""))).slice(0, 20);
  if (!list.length) return [];
  const db = getFirestore();
  if (db) {
    const docs = await db.getAll(...list.map((id) => db.collection(COLLECTION).doc(id)));
    return docs.filter((d) => d.exists).map((d) => view(d.data()));
  }
  const all = loadLocal();
  return list.map((id) => all[id]).filter(Boolean).map(view);
}

module.exports = {
  KINDS,
  listClasses,
  createClass,
  updateClass,
  newCode,
  deleteClass,
  addPost,
  deletePost,
  getOwn,
  findByCode,
  getMany,
};
