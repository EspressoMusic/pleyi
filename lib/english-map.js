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
 */

// The vocabulary topics are a stage of the path but not a step on the road:
// their words go with every stage, so they sit on the side of the map and
// are never skipped.
const SIDE_TOPIC = "vocabulary";
const CERT_SHARE = 0.75;
const CERT_SCORE = 0.8;

let learningPath = null;

// "שיעור 2 – Hello, Goodbye". A vocabulary topic's picture lesson isn't a
// short lesson, so it has no part to name.
function lessonTitle(lesson, num) {
  if (!lesson) return "שיעור בתמונות";
  return lesson.part ? `שיעור ${num} – ${lesson.part}` : `שיעור ${num}`;
}

function pathTopics() {
  if (learningPath) return learningPath;
  const data = loadData();
  const topics = new Map((data.ENGLISH_TOPICS || []).map((topic) => [topic.id, topic]));
  const lessons = new Map((data.ENGLISH_SHORT_LESSONS || []).map((lesson) => [lesson.id, lesson]));
  learningPath = (data.ENGLISH_PATH || []).map((stage) => ({
    title: stage.title,
    titleEn: stage.titleEn || stage.title,
    side: stage.topics.includes(SIDE_TOPIC),
    topics: stage.topics
      .map((id) => topics.get(id))
      .filter(Boolean)
      .map((topic) => {
        const ids = topic.lessons || (topic.lesson ? [topic.lesson] : []);
        return {
          id: topic.id,
          title: topic.title,
          lessons: ids.map((id, i) => ({ id, title: lessonTitle(lessons.get(id), i + 1) })),
          exercises: (topic.exercises || []).map((ex) => ex.id),
        };
      }),
  }));
  return learningPath;
}

// `lessonsSeen`: lesson id → the last time the student opened it.
function studentMap(student) {
  const best = student.best || {};
  const seen = student.lessonsSeen || {};
  const stages = pathTopics().map((stage) => ({
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
  // A file from before certificates were kept: the day of the stage's last
  // practice stands in for the day it was earned.
  const kept = student.certificates || {};
  const ready = (topic) =>
    topic.items > 0 &&
    topic.lessons.every((lesson) => lesson.seen) &&
    topic.done.filter((ex) => ex.total && ex.score / ex.total >= CERT_SCORE).length >= Math.ceil(topic.exercises * CERT_SHARE);
  stages.forEach((stage) => {
    const have = stage.topics.filter(ready).length;
    const earned = !!stage.topics.length && have === stage.topics.length;
    const last = stage.topics.map((topic) => topic.lastAt).sort().pop() || "";
    stage.cert = { have, need: stage.topics.length, earned, at: earned ? kept[stage.titleEn] || last : null };
  });
  // Where the student is: the topic they practiced last.
  return { stages, here: here?.id || null };
}

// Keeps the day of every certificate the student has earned (in place),
// after an activity: the stage's last practice is when it happened.
function noteCertificates(student) {
  studentMap(student).stages.forEach((stage) => {
    if (!stage.cert.earned || student.certificates?.[stage.titleEn]) return;
    student.certificates = { ...student.certificates, [stage.titleEn]: stage.cert.at };
  });
}

module.exports = { studentMap, noteCertificates };
