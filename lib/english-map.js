const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { loadData } = require("./seo");

/**
 * The map on the student's page (/s/<key>): the English learning path
 * (ENGLISH_PATH) from the first letters to reading a passage, with what the
 * student did in every topic — the lessons they opened and the exercises they
 * finished — and the topics they skipped on the way. The path is read once
 * from the same data files the browser uses (lib/seo.js).
 *
 * A topic is "done" when every lesson and exercise in it is, "started" when
 * some are, "skipped" when nothing is but a later topic on the road has
 * something, and "ahead" otherwise.
 *
 * Every stage has a certificate: the student earns it once every topic in
 * the stage is ready — all its lessons opened and a best score of CERT_SCORE
 * or more in CERT_SHARE of its exercises. The day it was earned is kept in
 * the file (`certificates`, by the stage's English title).
 *
 * Every English stage has tests on all of its topics, many kinds, each
 * handed in once (public/js/english-tests.js, ENGLISH_STAGE_TESTS): the map
 * lists a stage's kinds with the grade of the ones the student handed in
 * (`stageTests` in the file, by "<stage id>.<kind>").
 *
 * Every school subject (public/js/subject-practice.js) has a map of its own,
 * the same way, from its path; the page shows the ones the student did
 * something in (subjectMaps), with a certificate for each stage too. More
 * certificates (the whole English road, achievements): lib/certificates.js.
 */

// The vocabulary topics are a stage of the path but not a step on the road:
// their words go with every stage, so they sit on the side of the map and
// are never skipped.
const SIDE_TOPIC = "vocabulary";
const CERT_SHARE = 0.75;
const CERT_SCORE = 0.8;

const JS_DIR = path.join(__dirname, "..", "public", "js");
const SUBJECT_FILES = ["subject-lessons.js", "subject-practice.js"];

let learningPath = null;
let subjectPaths = null;
let mergedLessons = null;
let stageKinds = null;

// A short lesson merged into the one before it ("there-is-2" → "there-is-1",
// english-lessons.js): a lesson task sent before the merge is done once the
// student opens the merged lesson.
function mergedLessonId(id) {
  if (!mergedLessons) mergedLessons = loadData().ENGLISH_LESSON_MERGED || {};
  return mergedLessons[id] || id;
}

// "שיעור 2 – Hello, Goodbye". A lesson that isn't a short one — a
// vocabulary topic's picture lesson, a subject's long lesson — has no part
// to name: it's `other`.
function lessonTitle(lesson, num, other) {
  if (!lesson) return other;
  return lesson.part ? `שיעור ${num} – ${lesson.part}` : `שיעור ${num}`;
}

function pathTopics() {
  if (learningPath) return learningPath;
  const data = loadData();
  const topics = new Map((data.ENGLISH_TOPICS || []).map((topic) => [topic.id, topic]));
  const lessons = new Map((data.ENGLISH_SHORT_LESSONS || []).map((lesson) => [lesson.id, lesson]));
  learningPath = (data.ENGLISH_PATH || []).map((stage) => ({
    id: stage.id,
    title: stage.title,
    titleEn: stage.titleEn || stage.title,
    side: !!stage.side || stage.topics.includes(SIDE_TOPIC),
    topics: stage.topics
      .map((id) => topics.get(id))
      .filter(Boolean)
      .map((topic) => {
        const ids = topic.lessons || (topic.lesson ? [topic.lesson] : []);
        return {
          id: topic.id,
          title: topic.title,
          lessons: ids.map((id, i) => ({ id, title: lessonTitle(lessons.get(id), i + 1, "שיעור בתמונות") })),
          // The letters topic's practice sets (`set`) are extra practice: the
          // topic and its certificate don't wait for them.
          exercises: (topic.exercises || []).filter((ex) => !ex.set).map((ex) => ex.id),
        };
      }),
  }));
  return learningPath;
}

// The school subjects' paths, by the area's id (math, hebrew …). The browser
// file reads its page's address at the end, so it runs here with a blank one.
// If it can't run, the page just shows English.
function subjectAreas() {
  if (subjectPaths) return subjectPaths;
  const win = { addEventListener() {} };
  const context = vm.createContext({ window: win, location: { pathname: "/", search: "" }, document: { getElementById: () => null }, URLSearchParams });
  try {
    SUBJECT_FILES.forEach((file) => vm.runInContext(fs.readFileSync(path.join(JS_DIR, file), "utf8"), context, { filename: file }));
  } catch (err) {
    console.error("subject areas for the student map:", err.message);
    subjectPaths = [];
    return subjectPaths;
  }
  const lessons = new Map((win.SUBJECT_SHORT_LESSONS || []).map((lesson) => [lesson.id, lesson]));
  subjectPaths = Object.entries(win.SUBJECT_AREAS || {}).map(([id, area]) => {
    const topics = new Map(area.topics.map((topic) => [topic.id, topic]));
    return {
      id,
      title: area.title,
      stages: area.path.map((stage) => ({
        title: stage.title,
        side: false,
        topics: stage.topics
          .map((topicId) => topics.get(topicId))
          .filter(Boolean)
          .map((topic) => ({
            id: topic.id,
            title: topic.title,
            lessons: topic.lessons.map((lessonId, i) => ({ id: lessonId, title: lessonTitle(lessons.get(lessonId), i + 1, "השיעור") })),
            exercises: topic.exercises.map((ex) => ex.id),
          })),
      })),
    };
  });
  return subjectPaths;
}

// What the student did on a path: `lessonsSeen` is lesson id → the last
// time the student opened it.
function walkPath(student, pathStages) {
  const best = student.best || {};
  const seen = student.lessonsSeen || {};
  const stages = pathStages.map((stage) => ({
    ...(stage.id ? { id: stage.id } : {}),
    title: stage.title,
    titleEn: stage.titleEn,
    side: stage.side,
    topics: stage.topics.map((topic) => {
      const lessons = topic.lessons.map((lesson) => ({ title: lesson.title, seen: !!seen[lesson.id] }));
      const done = topic.exercises
        .map((id) => ({ id, entry: best[`${topic.id}/${id}`] }))
        .filter(({ entry }) => entry?.bestAt)
        .map(({ id, entry }) => ({ id, title: entry.title || "", score: entry.score, total: entry.total, at: entry.lastAt || entry.bestAt }));
      const times = [...done.map((ex) => ex.at), ...topic.lessons.map((lesson) => seen[lesson.id] || "")];
      return {
        id: topic.id,
        title: topic.title,
        lessons,
        exercises: topic.exercises.length,
        done,
        items: topic.lessons.length + topic.exercises.length,
        did: lessons.filter((lesson) => lesson.seen).length + done.length,
        lastAt: times.sort().pop() || "",
      };
    }),
  }));

  const road = stages.filter((stage) => !stage.side).flatMap((stage) => stage.topics);
  const frontier = road.reduce((last, topic, i) => (topic.lastAt ? i : last), -1);
  let here = null;
  stages.forEach((stage) =>
    stage.topics.forEach((topic) => {
      if (topic.items && topic.did === topic.items) topic.status = "done";
      else if (topic.did) topic.status = "started";
      else if (!stage.side && road.indexOf(topic) < frontier) topic.status = "skipped";
      else topic.status = "ahead";
      if (topic.lastAt && (!here || topic.lastAt > here.lastAt)) here = topic;
    })
  );
  // Where the student is: the topic they practiced last.
  return { stages, here: here?.id || null };
}

// A stage's certificate, kept in the file by `id`: how many of its topics
// are ready, out of all. A file from before certificates were kept: the day
// of the stage's last practice stands in for the day it was earned.
function stageCert(student, stage, id) {
  const ready = (topic) =>
    topic.items > 0 &&
    topic.lessons.every((lesson) => lesson.seen) &&
    topic.done.filter((ex) => ex.total && ex.score / ex.total >= CERT_SCORE).length >= Math.ceil(topic.exercises * CERT_SHARE);
  const have = stage.topics.filter(ready).length;
  const earned = !!stage.topics.length && have === stage.topics.length;
  const last = stage.topics.map((topic) => topic.lastAt).sort().pop() || "";
  return { id, have, need: stage.topics.length, earned, at: earned ? student.certificates?.[id] || last : null };
}

// Stage id → the kinds of test it has ([{ id, title }]), from the test bank
// (english-tests.js runs on top of the path's data, as in the browser).
function stageTestKinds() {
  if (stageKinds) return stageKinds;
  const win = loadData();
  const file = "english-tests.js";
  vm.runInContext(fs.readFileSync(path.join(JS_DIR, file), "utf8"), vm.createContext({ window: win }), { filename: file });
  stageKinds = new Map(
    (win.ENGLISH_PATH || []).map((stage) => [stage.id, (win.ENGLISH_STAGE_KINDS?.(stage) || []).map((kind) => ({ id: kind.id, title: kind.title }))])
  );
  return stageKinds;
}

// "<stage id>.<kind>" of a test the path has.
function isStageTest(id) {
  const [stageId, kindId] = String(id || "").split(".");
  return !!stageTestKinds().get(stageId)?.some((kind) => kind.id === kindId);
}

// A stage's tests, each with the grade it got once handed in.
function stageTestsOf(student, stage) {
  return (stageTestKinds().get(stage.id) || []).map((kind) => {
    const id = `${stage.id}.${kind.id}`;
    const done = student.stageTests?.[id];
    return { id, kind: kind.id, title: kind.title, done: done ? { score: done.score, total: done.total, at: done.at } : null };
  });
}

// A stage of the English path, by id (the placement test's result).
function isPathStage(id) {
  return !!id && pathTopics().some((stage) => stage.id === id);
}

// `placement`: the stage the last placement test said to start in — the
// student's map starts there until the student practices after it.
function studentMap(student) {
  const { stages, here } = walkPath(student, pathTopics());
  stages.forEach((stage) => {
    stage.cert = stageCert(student, stage, stage.titleEn);
    stage.tests = stageTestsOf(student, stage);
  });
  const placed = student.placement;
  return { stages, here, placement: placed && isPathStage(placed.stageId) ? { stageId: placed.stageId, at: placed.at } : null };
}

// The school subjects the student did something in, in the areas' order:
// [{ id, title, map }]. Their stages have certificates too, by
// "<subject>:<stage title>".
function subjectMaps(student) {
  return subjectAreas()
    .map((area) => {
      const map = walkPath(student, area.stages);
      map.stages.forEach((stage) => (stage.cert = stageCert(student, stage, `${area.id}:${stage.title}`)));
      return { id: area.id, title: area.title, map };
    })
    .filter((subject) => subject.map.here);
}

// Keeps the day of every stage certificate the student has earned — English
// and the school subjects — in place, after an activity: the stage's last
// practice is when it happened.
function noteCertificates(student) {
  const stages = [...studentMap(student).stages, ...subjectMaps(student).flatMap((subject) => subject.map.stages)];
  stages.forEach(({ cert }) => {
    if (!cert.earned || student.certificates?.[cert.id]) return;
    student.certificates = { ...student.certificates, [cert.id]: cert.at };
  });
}

module.exports = { studentMap, subjectMaps, noteCertificates, mergedLessonId, isStageTest, isPathStage };
