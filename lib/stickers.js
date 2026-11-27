/**
 * Stickers on the student's page (/s/<key>, "הפרסים שלי"): small prizes for
 * practising — exercises finished, rounds without a mistake, lessons watched,
 * the daily challenge, points, mistakes fixed, words learned on the
 * flashcards, certificates and games. Each is worked out from the file every
 * time the page loads, so nothing new is stored. The page draws each one
 * from its `icon` and `color` (student-portal.js).
 *
 * The streak stickers stop at 5 days in a row: a student who doesn't
 * practise on Shabbat can't keep a longer one, so the days themselves count
 * after that (`daily-20`, `daily-50`).
 */

const STICKERS = [
  { id: "first-exercise", title: "צעד ראשון", how: "לסיים תרגיל אחד.", icon: "flag", color: "teal", need: 1, of: "finished" },
  { id: "exercises-10", title: "מתאמן", how: "לסיים 10 תרגילים.", icon: "notebook", color: "teal", need: 10, of: "finished" },
  { id: "exercises-50", title: "אלוף התרגול", how: "לסיים 50 תרגילים.", icon: "trophy", color: "teal", need: 50, of: "finished" },
  { id: "exercises-150", title: "מאסטר", how: "לסיים 150 תרגילים.", icon: "crown", color: "teal", need: 150, of: "finished" },
  { id: "perfect-1", title: "בלי טעויות", how: "לסיים תרגיל בלי אף טעות.", icon: "star", color: "yellow", need: 1, of: "perfect" },
  { id: "perfect-10", title: "עין חדה", how: "לסיים 10 תרגילים בלי אף טעות.", icon: "target", color: "yellow", need: 10, of: "perfect" },
  { id: "lesson-1", title: "סקרן", how: "לצפות בשיעור אחד.", icon: "screen", color: "blue", need: 1, of: "lessons" },
  { id: "lessons-10", title: "חובב שיעורים", how: "לצפות ב-10 שיעורים.", icon: "book", color: "blue", need: 10, of: "lessons" },
  { id: "lessons-30", title: "יודע הכל", how: "לצפות ב-30 שיעורים.", icon: "bulb", color: "blue", need: 30, of: "lessons" },
  { id: "streak-3", title: "3 ימים ברצף", how: "לעשות את האתגר היומי 3 ימים ברצף.", icon: "flame", color: "orange", need: 3, of: "streak" },
  { id: "streak-5", title: "5 ימים ברצף", how: "לעשות את האתגר היומי 5 ימים ברצף.", icon: "flame", color: "red", need: 5, of: "streak" },
  { id: "daily-20", title: "20 אתגרים", how: "לעשות את האתגר היומי ב-20 ימים.", icon: "calendar", color: "orange", need: 20, of: "dailyDays" },
  { id: "daily-50", title: "50 אתגרים", how: "לעשות את האתגר היומי ב-50 ימים.", icon: "calendar", color: "red", need: 50, of: "dailyDays" },
  { id: "points-500", title: "500 נקודות", how: "לצבור 500 נקודות.", icon: "coin", color: "yellow", need: 500, of: "points" },
  { id: "points-2000", title: "2,000 נקודות", how: "לצבור 2,000 נקודות.", icon: "coin", color: "orange", need: 2000, of: "points" },
  { id: "points-10000", title: "10,000 נקודות", how: "לצבור 10,000 נקודות.", icon: "gem", color: "purple", need: 10000, of: "points" },
  { id: "review-10", title: "מתקן טעויות", how: "לתקן 10 שאלות ב„הטעויות שלי”.", icon: "review", color: "green", need: 10, of: "mastered" },
  { id: "review-50", title: "לומד מטעויות", how: "לתקן 50 שאלות ב„הטעויות שלי”.", icon: "review", color: "purple", need: 50, of: "mastered" },
  { id: "cards-10", title: "10 מילים", how: "ללמוד 10 מילים בכרטיסיות.", icon: "cards", color: "green", need: 10, of: "cards" },
  { id: "cards-50", title: "50 מילים", how: "ללמוד 50 מילים בכרטיסיות.", icon: "cards", color: "blue", need: 50, of: "cards" },
  { id: "cards-150", title: "150 מילים", how: "ללמוד 150 מילים בכרטיסיות.", icon: "cards", color: "purple", need: 150, of: "cards" },
  { id: "games-10", title: "שחקן", how: "לשחק 10 משחקים.", icon: "game", color: "green", need: 10, of: "games" },
  { id: "cert-1", title: "תעודה ראשונה", how: "לקבל תעודה על שלב במסלול.", icon: "medal", color: "yellow", need: 1, of: "certificates" },
  { id: "cert-4", title: "חצי מהדרך", how: "לקבל 4 תעודות.", icon: "medal", color: "orange", need: 4, of: "certificates" },
  { id: "cert-all", title: "הגעתי למטרה", how: "לקבל תעודה על כל השלבים במסלול.", icon: "mountain", color: "purple", need: 0, of: "certificates" },
];

// What the file has, counted the way the stickers ask. `map` is the
// student's map (lib/english-map.js), `mastered` the mistakes fixed in the
// review bank, `cards` the words learned on the flashcards.
function counts(student, { map, mastered = 0, cards = 0 }) {
  const best = Object.values(student.best || {}).filter((entry) => entry?.bestAt);
  const daily = student.daily || {};
  return {
    finished: best.length,
    perfect: best.filter((entry) => entry.total >= 4 && entry.score === entry.total).length,
    lessons: Object.keys(student.lessonsSeen || {}).length,
    streak: daily.best || 0,
    dailyDays: (daily.days || []).length,
    points: student.points?.total || 0,
    mastered,
    cards,
    games: student.counts?.games || 0,
    certificates: (map?.stages || []).filter((stage) => stage.cert?.earned).length,
  };
}

function stickersFor(student, extra) {
  const have = counts(student, extra);
  const stages = extra.map?.stages?.length || 0;
  return STICKERS.map(({ of, ...sticker }) => {
    const need = sticker.need || stages;
    return { ...sticker, need, have: Math.min(have[of], need), earned: have[of] >= need };
  });
}

module.exports = { stickersFor, counts };
