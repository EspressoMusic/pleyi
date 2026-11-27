/**
 * The certificates on the student's page ("התעודות שלי") beyond the stages'
 * (lib/english-map.js): one for finishing the whole English road — every
 * stage's certificate but the vocabulary's — and some for big achievements
 * (exercises, lessons, the daily challenge, points). Each is worked out from
 * the file when the page loads; the day it was earned is kept in the file
 * (`certificates`, by its id) after the activity that earned it.
 *
 * The achievements count only what the file itself has, so they can be
 * noted after any activity (lib/stickers.js counts them the same way).
 */

const { studentMap, noteCertificates } = require("./english-map");
const { counts } = require("./stickers");

const ACHIEVEMENTS = [
  { id: "exercises-50", title: "50 תרגילים", how: "לסיים 50 תרגילים.", icon: "notebook", need: 50, of: "finished" },
  { id: "exercises-150", title: "150 תרגילים", how: "לסיים 150 תרגילים.", icon: "trophy", need: 150, of: "finished" },
  { id: "perfect-10", title: "10 בלי טעויות", how: "לסיים 10 תרגילים בלי אף טעות.", icon: "target", need: 10, of: "perfect" },
  { id: "lessons-30", title: "30 שיעורים", how: "לצפות ב-30 שיעורים.", icon: "bulb", need: 30, of: "lessons" },
  { id: "streak-5", title: "5 ימים ברצף", how: "לעשות את האתגר היומי 5 ימים ברצף.", icon: "flame", need: 5, of: "streak" },
  { id: "daily-20", title: "20 אתגרים יומיים", how: "לעשות את האתגר היומי ב-20 ימים.", icon: "calendar", need: 20, of: "dailyDays" },
  { id: "points-2000", title: "2,000 נקודות", how: "לצבור 2,000 נקודות.", icon: "coin", need: 2000, of: "points" },
  { id: "points-10000", title: "10,000 נקודות", how: "לצבור 10,000 נקודות.", icon: "gem", need: 10000, of: "points" },
];

const ALL_ID = "english-all";

// [{ id, kind: "all" | "achievement", title, how?, icon?, have, need,
// earned, at }]. `map`: the student's English map, when it's at hand.
function moreCertificates(student, map = studentMap(student)) {
  const kept = student.certificates || {};
  const road = map.stages.filter((stage) => !stage.side);
  const have = road.filter((stage) => stage.cert.earned).length;
  const allEarned = !!road.length && have === road.length;
  const last = road.map((stage) => stage.cert.at || "").sort().pop() || null;
  const all = {
    id: ALL_ID,
    kind: "all",
    title: "כל האנגלית",
    have,
    need: road.length,
    earned: allEarned,
    at: allEarned ? kept[ALL_ID] || last : null,
  };
  const now = counts(student, { map });
  const achievements = ACHIEVEMENTS.map(({ of, ...cert }) => ({
    ...cert,
    kind: "achievement",
    have: Math.min(now[of], cert.need),
    earned: now[of] >= cert.need,
    at: now[of] >= cert.need ? kept[cert.id] || null : null,
  }));
  return [all, ...achievements];
}

// After an activity: the day of every certificate just earned — the
// stages' (lib/english-map.js), the whole road's and the achievements'.
function noteAllCertificates(student) {
  noteCertificates(student);
  const today = new Date().toISOString();
  moreCertificates(student).forEach((cert) => {
    if (!cert.earned || student.certificates?.[cert.id]) return;
    student.certificates = { ...student.certificates, [cert.id]: cert.at || today };
  });
}

module.exports = { moreCertificates, noteAllCertificates };
