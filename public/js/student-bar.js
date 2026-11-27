/* The bar of squares glued to the bottom of a student's own page (/s/<key>):
   for now three — the library on the right, the student's own area in the
   middle (a round button raised above the bar: the homework, and the class
   from there) and the map on the left. ALL_TABS brings back the daily
   challenge and the prizes.
   student-portal.js draws it there. The library pages draw it too when the
   student opened them from that bar (?from=student), so the student's own
   area stays at the bottom: the lesson library (ready-lessons.js) and the
   English area (english-learning.js), where a student who learns English
   only goes straight from the bar. Styles: css/student-bar.css. */

window.StudentBar = (() => {
  // The squares' own pictures: colored in, with an ink outline.
  const ICONS = {
    flame: `<svg viewBox="0 0 48 48" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path fill="#ff4d3d" d="M24 44c8.2 0 14-5.6 14-13.6 0-7.2-4.6-12-8.2-16.4-.8 4-2.8 6.6-5.2 7.6.6-6.2-2-12.6-7.6-16.6.2 6.4-3.2 10.8-6.4 14.8C8.4 23 10 27.2 10 30.4 10 38.4 15.8 44 24 44Z"/><path fill="#ffd84d" d="M24 44c-3.4 0-6-2.6-6-6 0-3.6 2.8-6 4.4-8.6 1 2 2.6 3.2 4 3.6.8-2 .6-4 0-6 2.8 2.2 5.6 5.6 5.6 9.8 0 4.2-3.2 7.2-8 7.2Z"/></svg>`,
    map: `<svg viewBox="0 0 48 48" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path fill="#fff3c4" d="M5 13l12-5v28L5 41Z"/><path fill="#ffe08a" d="M17 8l14 5v28l-14-5Z"/><path fill="#fff3c4" d="M31 13l12-5v28l-12 5Z"/><path fill="none" stroke="#ff4d3d" stroke-width="2.5" stroke-dasharray="1 4.5" d="M9 35c3-4 6-2 9-6s6-5 9-3"/><path fill="#ff4d3d" stroke-width="2.5" d="M34 31s-6.5-6.4-6.5-11a6.5 6.5 0 0 1 13 0c0 4.6-6.5 11-6.5 11Z"/><circle cx="34" cy="20" r="2.3" fill="#fff" stroke-width="2"/></svg>`,
    ribbon: `<svg viewBox="0 0 48 48" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path fill="#4d9dff" d="M17 27 12 43l6.5-2.5L22 46l4-15Z"/><path fill="#ff5a5a" d="M31 27l5 16-6.5-2.5L26 46l-4-15Z"/><circle cx="24" cy="19" r="13" fill="#ffd23f"/><path fill="#ff9f1c" stroke-width="2" d="M24 12l1.76 4.57 4.9.27-3.81 3.09 1.26 4.73L24 22l-4.11 2.66 1.26-4.73-3.81-3.09 4.9-.27Z"/></svg>`,
    library: `<svg viewBox="0 0 48 48" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="8" width="9" height="32" rx="2" fill="#ff6b6b"/><rect x="17" y="13" width="9" height="27" rx="2" fill="#4d9dff"/><rect x="33" y="13" width="9" height="27" rx="2" fill="#3ccf91" transform="rotate(-14 33 40)"/><path fill="none" d="M6 15h9M6 33h9M17 20h9M3 41.5h42"/></svg>`,
    // A house with a red roof: the student's own area, in the bar's middle.
    home: `<svg viewBox="0 0 48 48" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path fill="#ffe9a8" d="M10 22v20h28V22"/><path fill="#ff5a4d" d="M4 24 24 7l20 17"/><path fill="#4d9dff" d="M19 42V31a5 5 0 0 1 10 0v11"/><rect x="31" y="9" width="5" height="8" fill="#c98a4b"/><circle cx="25.5" cy="36" r="0.6" fill="currentColor" stroke-width="1.6"/></svg>`,
    // A green board with chalk writing on a wooden stand: the class.
    board: `<svg viewBox="0 0 48 48" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path fill="none" d="M15 36l-4 9M33 36l4 9"/><rect x="4" y="7" width="40" height="29" rx="3" fill="#c98a4b"/><rect x="8" y="11" width="32" height="21" rx="1.5" fill="#2fae6e"/><path fill="none" stroke="#fff" stroke-width="2.6" d="M13 18h14M13 24h9"/><path fill="none" stroke="#ffd84d" stroke-width="2.6" d="m29 25 3 3 5-7"/></svg>`,
  };

  // false for now: the bar has only the library, the student's own area and
  // the map; the daily challenge and the prizes are hidden (their #hash
  // opens the student's own area — student-portal.js).
  const ALL_TABS = false;

  const CHECK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5L20 7"/></svg>`;

  // What this device already showed the student — the same keys as
  // student-portal.js, which marks them seen.
  const STICKERS_SEEN_KEY = "pleyi-stickers-seen";
  const CLASS_SEEN_KEY = "pleyi-class-seen";

  // The library. A student who practiced no school subject (lib/english-map.js
  // `subjects`) learns English only, and goes straight to the English area;
  // the others get the site's lesson library, with every subject.
  function libraryUrl(student) {
    return (student?.subjects || []).length ? "/services/ready-lessons?from=student" : "/services/english?from=student";
  }

  // `tab`: the square that's open, pressed in; tapped again it leads back to
  // the tasks. `home`: "" on the student's own page, where the squares are
  // #hash links, or "/s/<key>" on another page. `fresh`: a dot on the prizes
  // while a new sticker or certificate waits there. `classDot`: null with no
  // class; true while new updates wait.
  function html({ student, tab, home = "", fresh = false, classDot = null }) {
    const daily = student?.daily;
    const dot = `<i class="stu-top-dot" aria-hidden="true"></i>`;
    const link = (id, icon, label, extra = "", check = "", href = `${home}#${id}`, news = "יש פרס חדש") =>
      `<a class="stu-top-item${tab === id ? " is-on" : ""}" href="${tab === id ? `${home}#tasks` : href}" aria-label="${label}${extra ? ` — ${news}` : ""}${check ? " — עשית היום" : ""}"${tab === id ? ' aria-current="page"' : ""}>
        <span class="stu-daily-tile stu-${id}-tile">${icon}${extra}${check}</span>
        <span class="stu-top-label" aria-hidden="true">${label}</span>
      </a>`;
    const check = daily?.doneToday ? `<i class="stu-daily-tile-check" aria-hidden="true">${CHECK}</i>` : "";
    // The middle: the student's own area — the homework, and the class
    // (#class) is reached from there. Pressed in on both; a dot while a new
    // update from the teacher waits in the class.
    const mine = tab === "tasks" || tab === "class";
    const area = `<a class="stu-top-item stu-home-item${mine ? " is-on" : ""}" href="${home}#tasks" aria-label="האזור האישי${classDot ? " — יש עדכון חדש מהמורה" : ""}"${mine ? ' aria-current="page"' : ""}>
        <span class="stu-daily-tile stu-home-tile">${ICONS.home}${classDot ? dot : ""}</span>
        <span class="stu-top-label" aria-hidden="true">האזור האישי</span>
      </a>`;
    // For now three squares: the library on the right, the student's own
    // area in the middle, the map on the left (ALL_TABS brings back the
    // daily challenge and the prizes).
    if (!ALL_TABS) {
      return `
      <nav class="stu-side-tiles" aria-label="העמוד שלי">
        ${link("library", ICONS.library, "ספרייה", "", "", libraryUrl(student))}
        ${area}
        ${link("map", ICONS.map, "המפה")}
      </nav>`;
    }
    return `
      <nav class="stu-side-tiles" aria-label="העמוד שלי">
        ${daily ? link("daily", ICONS.flame, "אתגר יומי", "", check) : ""}
        ${link("map", ICONS.map, "המפה")}
        ${area}
        ${link("prizes", ICONS.ribbon, "הפרסים", fresh ? dot : "")}
        ${link("library", ICONS.library, "ספרייה", "", "", libraryUrl(student))}
      </nav>`;
  }

  function seen(storageKey, key) {
    try {
      return (JSON.parse(localStorage.getItem(storageKey)) || {})[key];
    } catch {
      return undefined;
    }
  }

  // The dots, for a page other than the student's own. Nothing counts as new
  // before the student's page first showed it.
  function dots(student, key) {
    const stickers = seen(STICKERS_SEEN_KEY, key);
    const newSticker = !!stickers && (student.stickers || []).some((s) => s.earned && !stickers.includes(s.id));
    const newCert = (window.StudentProgress?.newCertificates(student) || []).length > 0;
    const classes = student.classes || [];
    const classSeen = seen(CLASS_SEEN_KEY, key) || "";
    const newPost = classes.some((c) => (c.posts || []).some((p) => p.at > classSeen));
    return { fresh: newSticker || newCert, classDot: classes.length ? newPost : null };
  }

  // On a library page: the bar at the bottom, the library pressed in. Only
  // for a student who came through their own link (StudentProgress).
  async function mount() {
    const progress = window.StudentProgress;
    const student = progress?.fromLink() ? await progress.profile() : null;
    const key = progress?.key();
    document.querySelector("body > .stu-side-tiles")?.remove();
    document.documentElement.classList.toggle("has-stu-bar", !!(student && key));
    if (!student || !key) return;
    const { fresh, classDot } = dots(student, key);
    document.body.insertAdjacentHTML("beforeend", html({ student, tab: "library", home: `/s/${encodeURIComponent(key)}`, fresh, classDot }));
  }

  return { ICONS, ALL_TABS, html, libraryUrl, mount };
})();
