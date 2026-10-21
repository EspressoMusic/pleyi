/* Learn English — topic grid, topic page (lesson + practice + reading),
   exercise runner, reading runner and slide viewer. Content lives in
   english-vocab.js, english-data.js and english-reading.js; lessons open in
   the shared lesson player from ready-lessons.js.

   Routes (hash): ""                    → topic grid
                  "#<topic>"            → topic page
                  "#<topic>/<exercise>" → exercise runner */

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const TOPICS = window.ENGLISH_TOPICS || [];
  const VOCAB = window.ENGLISH_VOCAB || {};
  const BEST_KEY = "pleyi-english-best";
  const AUTO_NEXT_MS = 1100;
  const AUTO_NEXT_WITH_FIX_MS = 2200;

  const STR = {
    he: {
      open: "כניסה",
      back: "חזרה לנושאים",
      backToTopic: "חזרה לנושא",
      stepLesson: "השיעור",
      stepPractice: "תרגול",
      openLesson: "פתיחת השיעור",
      lessonMeta: (slides, duration) => `${slides} שקופיות · ${duration}`,
      noExercises: "עוד אין תרגילים בנושא הזה.",
      view: "צפייה",
      practice: "לתרגול",
      slides: (n) => `${n} שקופיות`,
      sentences: (n) => `${n} משפטים`,
      words: (n) => `${n} מילים`,
      pairs: (n) => `${n} זוגות`,
      best: (s, t) => `השיא שלך: ${s}/${t}`,
      progress: (i, t) => `שאלה ${i} מתוך ${t}`,
      matchProgress: (m, t) => `${m} מתוך ${t} זוגות`,
      correct: "נכון!",
      wrong: (a) => `התשובה הנכונה: ${a}`,
      next: "הבא",
      finish: "לתוצאות",
      check: "בדיקה",
      trueBtn: "נכון",
      falseBtn: "לא נכון",
      sentenceWasRight: "המשפט דווקא נכון!",
      sentenceWasWrong: "המשפט לא נכון.",
      fixLabel: "המשפט הנכון:",
      typeHere: "כתבו כאן",
      emptyAnswer: "כתבו תשובה קודם",
      orderHint: "לחצו על המילים לפי הסדר",
      play: "השמעה",
      playAgain: "השמעה שוב",
      noSpeech: "הדפדפן לא תומך בהשמעה, אז הנה המילה:",
      speakWord: (w) => `השמע: ${w}`,
      matchDone: "כל הזוגות הותאמו!",
      sound: "צלילים",
      soundOn: "השתקת הצלילים",
      soundOff: "הפעלת הצלילים",
      translate: "תרגום",
      translateOn: "הסתרת התרגום",
      translateOff: "הצגת תרגום לעברית",
      gradeLabel: "הציון שלך",
      score: (s, t) => `${s} מתוך ${t} תשובות נכונות`,
      perfect: "מושלם! כל התשובות נכונות!",
      great: "כל הכבוד! עוד קצת ואתם שם.",
      keepGoing: "התחלה טובה — תרגלו שוב ותשתפרו.",
      again: "סבב חדש",
      retryMistakes: "לתרגל את הטעויות",
      mistakesTitle: "מה כדאי לחזור עליו",
      copyLink: "העתקת קישור לתרגיל",
      copied: "הקישור הועתק!",
      studentBar: (name) => `התרגול נשמר בתיק של ${name}`,
      myHomework: "שיעורי הבית שלי",
      backToHomework: "לשיעורי הבית",
      notMe: "זה לא אני",
      notMeConfirm: (name) => `להפסיק לשמור את התרגול בתיק של ${name} במכשיר הזה?`,
      prevSlide: "שקופית קודמת",
      nextSlide: "שקופית הבאה",
      close: "סגירה",
      fullscreen: "מסך מלא",
      stepReading: "קטע קריאה",
      stepPrint: "דפי עבודה להדפסה",
      printLead: "דפי תרגול לכיתה או לבית — מדפיסים, פותרים בעיפרון ובודקים עם דף התשובות.",
      printSheet: (n) => `דף ${n}`,
      printMeta: (n) => `${n} משימות · עמוד A4`,
      printAll: "כל הדפים יחד",
      printAllMeta: (n) => `${n} עמודים · עם דף תשובות למורה`,
      printAction: "להדפסה",
      readingLibraryLead: "קטעי קריאה עם שאלות — אמריקאיות, נכון / לא נכון ושאלות פתוחות. רמה 1 הכי קלה, רמה 4 הכי מאתגרת.",
      level: (n) => `רמה ${n}`,
      levelName: (n) => ["", "קל", "בינוני", "מתקדם", "מאתגר"][n] || "",
      readingMeta: (w, q) => `${w} מילים · ${q} שאלות`,
      readingTitle: (n) => `קטע קריאה · רמה ${n}`,
      readingCount: (n) => `${n} קטעי קריאה בארבע רמות`,
      markStep: "שלב 1: מסמנים בטקסט",
      markFoundLabel: "נמצאו",
      markOf: (t) => `מתוך ${t}`,
      markMisses: (n) => (n === 1 ? "סימון שגוי אחד" : `${n} סימונים שגויים`),
      markReveal: "הראו לי מה חסר",
      toQuestions: "לשאלות",
      markAllFound: "מצאתם את כולן!",
      markRevealed: "המילים שחסרו מסומנות עכשיו בכתום.",
      questionNum: (i, t) => `שאלה ${i} מתוך ${t}`,
      answerHe: "ענו בעברית",
      answerEn: "Answer in English",
      answerAny: "ענו במילים שלכם",
      modelAnswer: "תשובה לדוגמה:",
      openRight: "תשובה טובה!",
      openWrong: "לא בדיוק — חפשו את התשובה בטקסט.",
      readAloud: "הקראה",
      readAloudOn: "עצירת ההקראה",
      readAloudOff: "הקראת הטקסט בקול",
      glossary: "מילים חשובות:",
      partMark: (s, t) => `סימון: ${s} מתוך ${t}`,
      partQuestions: (s, t) => `שאלות: ${s} מתוך ${t}`,
      reviewMissed: "לא סומנו:",
      reviewWrongMarks: "סומנו בטעות:",
      yourAnswer: "כתבתם:",
      expandText: "הגדלת הטקסט",
      collapseText: "חזרה למשימה",
      helpButton: "הסבר ודוגמה",
      helpOpen: (name) => `הסבר ודוגמה: ${name}`,
      helpWhat: "מה עושים?",
      helpExample: "דוגמה",
      helpStart: "להתחלת התרגיל",
      helpGotIt: "הבנתי",
      helpReadingWhat: "קוראים את הקטע באנגלית ועונים על השאלות.",
      helpReadingMarkWhat: "קוראים את הקטע באנגלית, מסמנים בו מילים ועונים על השאלות.",
      helpReadQuestions: "עונים על השאלות.",
      helpTips: {
        choice: "לוחצים על התשובה הנכונה. במחשב אפשר גם להקיש על המספר שלה.",
        truefalse: "לוחצים על „נכון” או על „לא נכון”. כשהמשפט לא נכון, מופיע המשפט המתוקן.",
        write: "כותבים את התשובה באנגלית ולוחצים על „בדיקה” (או על Enter).",
        order: "לוחצים על המילים לפי הסדר. לחיצה על מילה שכבר במשפט מחזירה אותה. בסוף לוחצים על „בדיקה”.",
        picture: "לוחצים על המילה הנכונה. במחשב אפשר גם להקיש על המספר שלה.",
        "pick-picture": "לוחצים על התמונה הנכונה. הרמקול ליד המילה משמיע אותה.",
        listen: "המילה מושמעת מיד, ולחיצה על הרמקול משמיעה אותה שוב. אחר כך לוחצים על התמונה הנכונה.",
        match: "לוחצים על משהו בצד אחד ואז על מה שמתאים לו בצד השני, עד שכל הזוגות מחוברים.",
        reading: "מסמנים מילה בלחיצה עליה, ובסוף לוחצים על „לשאלות”.",
      },
    },
    en: {
      open: "Open",
      back: "Back to topics",
      backToTopic: "Back to topic",
      stepLesson: "The lesson",
      stepPractice: "Practice",
      openLesson: "Open the lesson",
      lessonMeta: (slides, duration) => `${slides} slides · ${duration}`,
      noExercises: "No exercises for this topic yet.",
      view: "View",
      practice: "Practice",
      slides: (n) => `${n} slides`,
      sentences: (n) => `${n} sentences`,
      words: (n) => `${n} words`,
      pairs: (n) => `${n} pairs`,
      best: (s, t) => `Your best: ${s}/${t}`,
      progress: (i, t) => `Question ${i} of ${t}`,
      matchProgress: (m, t) => `${m} of ${t} pairs`,
      correct: "Correct!",
      wrong: (a) => `The right answer: ${a}`,
      next: "Next",
      finish: "See results",
      check: "Check",
      trueBtn: "True",
      falseBtn: "False",
      sentenceWasRight: "The sentence was actually right!",
      sentenceWasWrong: "The sentence is wrong.",
      fixLabel: "Correct sentence:",
      typeHere: "Type here",
      emptyAnswer: "Type an answer first",
      orderHint: "Click the words in order",
      play: "Play",
      playAgain: "Play again",
      noSpeech: "Your browser can't play audio, so here is the word:",
      speakWord: (w) => `Play: ${w}`,
      matchDone: "All pairs matched!",
      sound: "Sounds",
      soundOn: "Mute sounds",
      soundOff: "Turn sounds on",
      translate: "Translation",
      translateOn: "Hide the translation",
      translateOff: "Show the Hebrew translation",
      gradeLabel: "Your grade",
      score: (s, t) => `${s} of ${t} answers correct`,
      perfect: "Perfect! Every answer is right!",
      great: "Well done! Almost there.",
      keepGoing: "Good start — practice again to improve.",
      again: "New round",
      retryMistakes: "Practice my mistakes",
      mistakesTitle: "Worth reviewing",
      copyLink: "Copy exercise link",
      copied: "Link copied!",
      studentBar: (name) => `Your practice is saved for ${name}`,
      myHomework: "My homework",
      backToHomework: "Back to my homework",
      notMe: "Not me",
      notMeConfirm: (name) => `Stop saving practice for ${name} on this device?`,
      prevSlide: "Previous slide",
      nextSlide: "Next slide",
      close: "Close",
      fullscreen: "Fullscreen",
      stepReading: "Reading passage",
      stepPrint: "Printable worksheets",
      printLead: "Practice pages for class or home — print them, solve with a pencil, and check with the answer key.",
      printSheet: (n) => `Sheet ${n}`,
      printMeta: (n) => `${n} tasks · A4 page`,
      printAll: "All sheets together",
      printAllMeta: (n) => `${n} pages · with a teacher answer key`,
      printAction: "Print",
      readingLibraryLead: "Reading passages with questions — multiple choice, true / false and open questions. Level 1 is the easiest, level 4 the most challenging.",
      level: (n) => `Level ${n}`,
      levelName: (n) => ["", "Easy", "Medium", "Advanced", "Challenging"][n] || "",
      readingMeta: (w, q) => `${w} words · ${q} questions`,
      readingTitle: (n) => `Reading · Level ${n}`,
      readingCount: (n) => `${n} reading passages in four levels`,
      markStep: "Step 1: Mark the text",
      markFoundLabel: "Found",
      markOf: (t) => `of ${t}`,
      markMisses: (n) => (n === 1 ? "1 wrong mark" : `${n} wrong marks`),
      markReveal: "Show me what's missing",
      toQuestions: "To the questions",
      markAllFound: "You found them all!",
      markRevealed: "The missing words are now marked in orange.",
      questionNum: (i, t) => `Question ${i} of ${t}`,
      answerHe: "Answer in Hebrew",
      answerEn: "Answer in English",
      answerAny: "Answer in your own words",
      modelAnswer: "Sample answer:",
      openRight: "Good answer!",
      openWrong: "Not quite — look for the answer in the text.",
      readAloud: "Read aloud",
      readAloudOn: "Stop reading",
      readAloudOff: "Read the text aloud",
      glossary: "Key words:",
      partMark: (s, t) => `Marking: ${s} of ${t}`,
      partQuestions: (s, t) => `Questions: ${s} of ${t}`,
      reviewMissed: "Not marked:",
      reviewWrongMarks: "Marked by mistake:",
      yourAnswer: "You wrote:",
      expandText: "Enlarge the text",
      collapseText: "Back to the task",
      helpButton: "How it works",
      helpOpen: (name) => `How it works: ${name}`,
      helpWhat: "What to do",
      helpExample: "Example",
      helpStart: "Start the exercise",
      helpGotIt: "Got it",
      helpReadingWhat: "Read the passage in English and answer the questions.",
      helpReadingMarkWhat: "Read the passage in English, mark words in it, and answer the questions.",
      helpReadQuestions: "Answer the questions.",
      helpTips: {
        choice: "Click the right answer. On a computer you can also press its number.",
        truefalse: "Click \"True\" or \"False\". When the sentence is wrong, the corrected sentence appears.",
        write: "Type the answer in English and click \"Check\" (or press Enter).",
        order: "Click the words in order. Clicking a word that is already in the sentence sends it back. Then click \"Check\".",
        picture: "Click the right word. On a computer you can also press its number.",
        "pick-picture": "Click the right picture. The speaker next to the word plays it.",
        listen: "The word plays right away, and the speaker plays it again. Then click the right picture.",
        match: "Click something on one side, then what matches it on the other side, until every pair is joined.",
        reading: "Click a word to mark it, then click \"To the questions\".",
      },
    },
  };

  const ICONS = {
    slides: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M12 16v4M8 20h8"/></svg>`,
    choice: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="5" rx="2"/><rect x="3" y="13" width="18" height="5" rx="2"/><path d="m14 6.5 1.5 1.5 3-3"/></svg>`,
    truefalse: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 12 3 3 5-6"/><path d="m14 9 6 6M20 9l-6 6"/></svg>`,
    write: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/></svg>`,
    order: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="8" width="6" height="8" rx="1.5"/><rect x="9" y="8" width="6" height="8" rx="1.5"/><rect x="16" y="8" width="6" height="8" rx="1.5"/></svg>`,
    picture: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 17-5-5-9 8"/></svg>`,
    listen: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 5V4L8 9H4Z"/><path d="M16.2 8.8a5 5 0 0 1 0 6.4"/><path d="M18.8 6.2a9 9 0 0 1 0 11.6"/></svg>`,
    match: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="5" cy="6" r="2.5"/><circle cx="5" cy="18" r="2.5"/><circle cx="19" cy="6" r="2.5"/><circle cx="19" cy="18" r="2.5"/><path d="M7.5 6 16.5 18M7.5 18 16.5 6"/></svg>`,
    link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5L20 7"/></svg>`,
    cross: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>`,
    star: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8L12 2.8Z"/></svg>`,
    expand: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H3v5M16 3h5v5M16 21h5v-5M8 21H3v-5"/></svg>`,
    collapse: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8h5V3M21 8h-5V3M21 16h-5v5M3 16h5v5"/></svg>`,
    soundOff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 5V4L8 9H4Z"/><path d="m16.5 9.5 5 5M21.5 9.5l-5 5"/></svg>`,
    back: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
    translate: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"/></svg>`,
    reading: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 5.5C4.5 4 8 4 12 6c4-2 7.5-2 10-.5V19c-2.5-1.5-6-1.5-10 .5-4-2-7.5-2-10-.5V5.5Z"/><path d="M12 6v13.5"/><path d="M5 9h3.5M5 12h3.5M15.5 9H19M15.5 12H19"/></svg>`,
    highlighter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 15 7.5-7.5a2.1 2.1 0 0 0-3-3L6 12l-1 4 4-1Z"/><path d="M4 20h7"/></svg>`,
    play: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M10 8.5v7l5.5-3.5L10 8.5Z" fill="currentColor"/></svg>`,
    stop: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor"/></svg>`,
    info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="5.5" r="1.4" fill="currentColor" stroke-width="1.6"/><path d="M12 11v8.5"/></svg>`,
    arrowDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v15M6 13l6 6 6-6"/></svg>`,
  };
  ICONS.print = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/></svg>`;
  ICONS["pick-picture"] = ICONS.picture;

  function lang() {
    return window.I18n?.lang === "en" ? "en" : "he";
  }

  function t(key, ...args) {
    const val = STR[lang()][key];
    return typeof val === "function" ? val(...args) : val;
  }

  function loc(obj, field) {
    if (lang() === "en" && obj[`${field}En`]) return obj[`${field}En`];
    return obj[field] || "";
  }

  function esc(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function shuffle(list) {
    const arr = [...list];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function findTopic(id) {
    return TOPICS.find((topic) => topic.id === id) || null;
  }

  function findExercise(topic, id) {
    return topic?.exercises?.find((ex) => ex.id === id) || null;
  }

  function imgUrl(wordId) {
    return `/images/english/vocab/${wordId}.svg`;
  }

  function wordItem(id) {
    const v = VOCAB[id];
    return v ? { word: id, en: v.en, he: v.he, img: imgUrl(id), accept: v.accept || [] } : null;
  }

  // Typed answers: ignore case, extra spaces, trailing punctuation and
  // curly/backtick apostrophes that phone keyboards insert.
  function normalize(str) {
    return String(str || "")
      .toLowerCase()
      .replace(/[’‘`´]/g, "'")
      .replace(/\s+/g, " ")
      .replace(/[.!?]+$/, "")
      .trim();
  }

  function readBest() {
    try {
      return JSON.parse(localStorage.getItem(BEST_KEY)) || {};
    } catch {
      return {};
    }
  }

  function saveBest(key, score, total) {
    const all = readBest();
    const prev = all[key];
    if (prev && prev.score / prev.total >= score / total) return;
    all[key] = { score, total };
    try {
      localStorage.setItem(BEST_KEY, JSON.stringify(all));
    } catch {
      /* ignore */
    }
  }

  function showToast(msg) {
    const toast = $("#toast");
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.remove("hidden");
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => toast.classList.add("hidden"), 2200);
  }

  /* ── Speech (pronunciation) ── */

  const PREFERRED_VOICES = [
    "Google US English",
    "Microsoft Aria Online (Natural)",
    "Microsoft Jenny Online (Natural)",
    "Samantha",
  ];
  let cachedVoice;

  function canSpeak() {
    return "speechSynthesis" in window && typeof window.SpeechSynthesisUtterance === "function";
  }

  function pickVoice() {
    if (cachedVoice !== undefined) return cachedVoice;
    const voices = window.speechSynthesis?.getVoices?.() || [];
    if (!voices.length) return null;
    cachedVoice =
      voices.find((v) => PREFERRED_VOICES.includes(v.name)) ||
      voices.find((v) => /^en/i.test(v.lang) && /(natural|online|google)/i.test(v.name)) ||
      voices.find((v) => v.lang === "en-US") ||
      voices.find((v) => /^en/i.test(v.lang)) ||
      null;
    return cachedVoice;
  }

  if (canSpeak()) {
    window.speechSynthesis.addEventListener?.("voiceschanged", () => {
      cachedVoice = undefined;
    });
  }

  function speak(text) {
    if (!canSpeak() || !text) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = 0.9;
    const voice = pickVoice();
    if (voice) {
      utter.voice = voice;
      utter.lang = voice.lang;
    }
    window.speechSynthesis.speak(utter);
  }

  function speakBtn(text, extraClass = "") {
    if (!canSpeak()) return "";
    return `<button type="button" class="eng-speak ${extraClass}" data-say="${esc(text)}" aria-label="${esc(t("speakWord", text))}">${ICONS.listen}</button>`;
  }

  /* ── Runner preferences (sound effects, translation) ── */

  const SOUND_KEY = "pleyi-english-sound";
  const TRANSLATE_KEY = "pleyi-english-translate";

  function readFlag(key, fallback) {
    try {
      const val = localStorage.getItem(key);
      return val === null ? fallback : val === "1";
    } catch {
      return fallback;
    }
  }

  function saveFlag(key, on) {
    try {
      localStorage.setItem(key, on ? "1" : "0");
    } catch {
      /* ignore */
    }
  }

  const prefs = {
    sound: readFlag(SOUND_KEY, true),
    translate: readFlag(TRANSLATE_KEY, false),
  };

  /* ── Sound effects (Web Audio, no files) ── */

  let audioCtx = null;

  function audio() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      try {
        audioCtx = new Ctx();
      } catch {
        return null;
      }
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  // One note: quick attack, exponential fade. `at` is seconds from now, `to`
  // slides the pitch, `filter` is a low-pass cutoff that softens harsh waves.
  function tone(ctx, { freq, to, at = 0, dur = 0.2, type = "sine", vol = 0.12, filter }) {
    const start = ctx.currentTime + at;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (to) osc.frequency.exponentialRampToValueAtTime(to, start + dur);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(vol, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    let out = osc;
    if (filter) {
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = filter;
      osc.connect(lp);
      out = lp;
    }
    out.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + dur + 0.05);
  }

  const SFX = {
    // Bright two-note chime.
    right: [
      { freq: 784, dur: 0.16, type: "triangle", vol: 0.18 },
      { freq: 1047, at: 0.09, dur: 0.34, type: "triangle", vol: 0.18 },
      { freq: 2093, at: 0.09, dur: 0.26, vol: 0.035 },
    ],
    // Game-show "disqualified" buzzer: two low, falling buzzes.
    wrong: [
      { freq: 165, to: 150, dur: 0.2, type: "sawtooth", vol: 0.16, filter: 1100 },
      { freq: 125, to: 95, at: 0.22, dur: 0.42, type: "sawtooth", vol: 0.16, filter: 1100 },
    ],
    // Rising arpeggio when the results screen opens.
    finish: [523, 659, 784, 1047].map((freq, i) => ({ freq, at: i * 0.11, dur: i === 3 ? 0.55 : 0.2, type: "triangle", vol: 0.15 })),
    // Short blips for marking words in a reading passage, which happens many
    // times in a row: a light tick for a found word, a soft buzz for a miss.
    tick: [
      { freq: 880, dur: 0.1, type: "triangle", vol: 0.14 },
      { freq: 1320, at: 0.05, dur: 0.14, type: "triangle", vol: 0.1 },
    ],
    miss: [{ freq: 190, to: 140, dur: 0.22, type: "sawtooth", vol: 0.12, filter: 900 }],
  };

  function playSfx(name) {
    if (!prefs.sound) return;
    const ctx = audio();
    if (!ctx) return;
    SFX[name].forEach((note) => tone(ctx, note));
  }

  /* ── Views ── */

  const views = {
    topics: () => $("#engTopicsView"),
    topic: () => $("#engTopicView"),
    exercise: () => $("#engExerciseView"),
  };

  function showView(name) {
    Object.entries(views).forEach(([key, get]) => get()?.classList.toggle("hidden", key !== name));
    $("#engHero")?.classList.toggle("hidden", name !== "topics");
    // The exercise screen is a fixed, non-scrolling page without the site navbar or footer.
    document.documentElement.classList.toggle("eng-runner-open", name === "exercise");
  }

  // Shown when this device opened a student's personal link: whose file the
  // practice goes to, and the way back to their homework page.
  async function renderStudentBar() {
    $("#engStudentBar")?.remove();
    const student = await window.StudentProgress?.profile();
    if (!student) return;
    const bar = document.createElement("div");
    bar.id = "engStudentBar";
    bar.className = "eng-student-bar";
    bar.innerHTML = `
      <span class="eng-student-bar-text">${esc(t("studentBar", student.name))}</span>
      <a class="eng-student-bar-link" href="${esc(window.StudentProgress.homeUrl())}">${esc(t("myHomework"))}</a>
      <button type="button" class="eng-student-bar-out" id="engNotMe">${esc(t("notMe"))}</button>`;
    $("#engMain .container")?.prepend(bar);
    $("#engNotMe").addEventListener("click", () => {
      if (!confirm(t("notMeConfirm", student.name))) return;
      window.StudentProgress.clear();
      bar.remove();
    });
  }

  // The topic grid is split into groups; a topic's `group` defaults to "grammar".
  const GROUPS = [
    { id: "grammar", title: "שיעורים לפי נושא", titleEn: "Lessons by topic" },
    { id: "reading", title: "הבנת הנקרא", titleEn: "Reading comprehension" },
    { id: "vocab", title: "אוצר מילים לפי נושאים", titleEn: "Vocabulary by topic" },
  ];

  function topicGroup(topic) {
    return topic.group || "grammar";
  }

  function readingUnits(topic) {
    return (topic.exercises || []).filter((ex) => ex.type === "reading");
  }

  function topicTileHtml(topic) {
    const sub = lang() === "en" ? "" : `<span class="eng-topic-sub" dir="ltr">${esc(topic.titleEn)}</span>`;
    if (topicGroup(topic) === "reading") {
      return `
        <article class="eng-topic-card eng-topic-card--wide">
          <a class="eng-topic-tile eng-topic-tile--wide" href="#${esc(topic.id)}">
            <span class="eng-topic-wide-icon">${ICONS.reading}</span>
            <span class="eng-topic-wide-text">
              <span class="eng-topic-title">${esc(loc(topic, "title"))}</span>
              <span class="eng-topic-sub">${esc(t("readingCount", readingUnits(topic).length))}</span>
            </span>
            <span class="btn btn-primary btn-candy font-cartoon eng-topic-open">${esc(t("open"))}</span>
          </a>
        </article>`;
    }
    const img = topic.cover ? `<img class="eng-topic-img" src="${esc(imgUrl(topic.cover))}" alt="" draggable="false" />` : "";
    return `
      <article class="eng-topic-card">
        <a class="eng-topic-tile${img ? " has-img" : ""}" href="#${esc(topic.id)}">
          ${img}
          <span class="eng-topic-title">${esc(loc(topic, "title"))}</span>
          ${sub}
          <span class="btn btn-primary btn-candy font-cartoon eng-topic-open">${esc(t("open"))}</span>
        </a>
      </article>`;
  }

  function renderTopicGrid() {
    const grid = $("#engTopicGrid");
    if (!grid) return;
    grid.innerHTML = GROUPS.map((group) => {
      const topics = TOPICS.filter((topic) => topicGroup(topic) === group.id);
      if (!topics.length) return "";
      return `
        <div class="eng-topic-group">
          <h2 class="eng-group-title">${esc(loc(group, "title"))}</h2>
          <div class="eng-topic-grid${group.id === "reading" ? " eng-topic-grid--wide" : ""}">${topics.map(topicTileHtml).join("")}</div>
        </div>`;
    }).join("");
  }

  function lessonFor(topic) {
    const catalog = window.ReadyLessons?.catalog;
    const raw = topic.lesson && catalog?.[topic.lesson];
    if (!raw) return null;
    return window.ReadyLessons.localize ? window.ReadyLessons.localize(raw) : raw;
  }

  // Lesson durations are stored in Hebrew ("25 דק'").
  function durationLabel(duration) {
    if (lang() !== "en") return duration || "";
    const minutes = String(duration || "").match(/\d+/);
    return minutes ? `${minutes[0]} min` : "";
  }

  function exerciseCountLabel(ex) {
    if (ex.type === "match") return ex.pairs ? t("pairs", ex.pairs.length) : t("words", ex.words.length);
    if (ex.words) return t("words", ex.words.length);
    return t("sentences", ex.questions.length);
  }

  function passageWordCount(ex) {
    return ex.passage.text
      .join(" ")
      .split(/\s+/)
      .filter((w) => /[A-Za-z0-9]/.test(w)).length;
  }

  // A reading passage card: its level, how hard that is, and its title.
  // Inside a topic the four cards are levels of one passage set, so the level
  // leads; in the reading library the passage title leads.
  // The cards are not links themselves: their title link stretches over the
  // whole card, so the "i" help button can sit inside without nesting a
  // button in a link.
  function levelCardHtml(topic, ex, best, levelFirst) {
    const record = best[`${topic.id}/${ex.id}`];
    const bars = [1, 2, 3, 4].map((n) => `<i${n <= ex.level ? ' class="is-on"' : ""}></i>`).join("");
    return `
      <div class="eng-level-card eng-level-card--${ex.level}${levelFirst ? "" : " is-library"}">
        <span class="eng-level-head">
          <span class="eng-level-name">${esc(t("level", ex.level))}</span>
          <span class="eng-level-bars" role="img" aria-label="${esc(t("levelName", ex.level))}">${bars}</span>
          ${infoBtnHtml(ex)}
        </span>
        <a class="eng-level-title eng-card-link" href="#${esc(topic.id)}/${esc(ex.id)}" dir="ltr">${esc(ex.passage.title)}</a>
        <span class="eng-level-meta">${esc(t("readingMeta", passageWordCount(ex), ex.questions.length))}</span>
        ${record ? `<span class="eng-ex-best">${esc(t("best", record.score, record.total))}</span>` : ""}
      </div>`;
  }

  // Printable worksheets (english-printables.js): a card per sheet and one
  // for the whole pack, each opening the print page.
  function printCardsHtml(topic) {
    const pack = window.ENGLISH_PRINTABLES?.[topic.id];
    if (!pack?.sheets?.length) return "";
    const href = (sheet) =>
      `/services/english-worksheet?topic=${encodeURIComponent(topic.id)}${sheet ? `&sheet=${encodeURIComponent(sheet)}` : ""}`;
    const card = (link, title, meta, extraClass = "") => `
      <div class="eng-ex-card eng-ex-card--print${extraClass}">
        <span class="eng-ex-icon">${ICONS.print}</span>
        <span class="eng-ex-text">
          <a class="eng-ex-title eng-card-link" href="${esc(link)}">${esc(title)}</a>
          <span class="eng-ex-meta">${esc(meta)}</span>
        </span>
        <span class="eng-item-action" aria-hidden="true">${esc(t("printAction"))}</span>
      </div>`;
    const sheets = pack.sheets
      .map((sheet, i) => card(href(sheet.id), `${t("printSheet", i + 1)} · ${loc(sheet, "title")}`, t("printMeta", sheet.tasks.length)))
      .join("");
    return sheets + card(href(null), t("printAll"), t("printAllMeta", pack.sheets.length), " eng-ex-card--print-all");
  }

  function renderTopic(topic) {
    const view = views.topic();
    if (!view) return;
    const best = readBest();
    const lesson = lessonFor(topic);

    const lessonCard = lesson
      ? `
        <div class="eng-lesson-card">
          <span class="eng-lesson-icon">${ICONS.slides}</span>
          <div class="eng-lesson-text">
            <h4 class="eng-lesson-title">${esc(lesson.namePart || lesson.name)}</h4>
            <p class="eng-lesson-meta">${esc(t("lessonMeta", lesson.slides?.length || 0, durationLabel(lesson.duration)))}</p>
            <p class="eng-lesson-summary">${esc(loc(topic, "lessonSummary") || lesson.summary || "")}</p>
          </div>
          <button type="button" class="btn btn-primary btn-candy font-cartoon eng-lesson-open" data-lesson="${esc(topic.lesson)}">${esc(t("openLesson"))}</button>
        </div>`
      : "";

    const decks = (topic.presentations || [])
      .map(
        (p) => `
          <a class="eng-item eng-item--slides" href="#" data-presentation="${esc(p.id)}">
            <span class="eng-item-icon">${ICONS.slides}</span>
            <span class="eng-item-text">
              <span class="eng-item-title">${esc(loc(p, "title"))}</span>
              <span class="eng-item-meta">${esc(t("slides", p.slides?.length || 0))}</span>
            </span>
            <span class="eng-item-action">${esc(t("view"))}</span>
          </a>`
      )
      .join("");

    const exercises = (topic.exercises || [])
      .filter((ex) => ex.type !== "reading")
      .map((ex) => {
        const record = best[`${topic.id}/${ex.id}`];
        const bestLine = record ? `<span class="eng-ex-best">${esc(t("best", record.score, record.total))}</span>` : "";
        return `
          <div class="eng-ex-card eng-ex-card--${esc(ex.type)}">
            <span class="eng-ex-icon">${ICONS[ex.type] || ICONS.choice}</span>
            <span class="eng-ex-text">
              <a class="eng-ex-title eng-card-link" href="#${esc(topic.id)}/${esc(ex.id)}">${esc(loc(ex, "title"))}</a>
              <span class="eng-ex-meta">${esc(exerciseCountLabel(ex))}</span>
              ${bestLine}
            </span>
            ${infoBtnHtml(ex)}
            <span class="eng-item-action" aria-hidden="true">${esc(t("practice"))}</span>
          </div>`;
      })
      .join("");

    const printables = printCardsHtml(topic);
    const units = readingUnits(topic);
    let stepNum = 0;
    const step = (title, body) => `
      <section class="eng-step">
        <h3 class="eng-step-title"><span class="eng-step-num">${++stepNum}</span>${esc(title)}</h3>
        ${body}
      </section>`;

    const head = `
      <div class="eng-topic-head">
        <a class="eng-back" href="#" aria-label="${esc(t("back"))}" title="${esc(t("back"))}">${ICONS.back}</a>
        <h2 class="font-cartoon eng-topic-heading">${esc(loc(topic, "title"))}</h2>
        ${lang() === "he" ? `<p class="eng-topic-heading-en" dir="ltr">${esc(topic.titleEn)}</p>` : ""}
      </div>`;

    if (topicGroup(topic) === "reading") {
      // The reading library: every passage, grouped by level.
      const levels = [1, 2, 3, 4]
        .map((level) => {
          const list = units.filter((ex) => ex.level === level);
          if (!list.length) return "";
          return `
            <section class="eng-step">
              <h3 class="eng-step-title"><span class="eng-step-num eng-step-num--level-${level}">${level}</span>${esc(`${t("level", level)} · ${t("levelName", level)}`)}</h3>
              <div class="eng-level-grid">${list.map((ex) => levelCardHtml(topic, ex, best, false)).join("")}</div>
            </section>`;
        })
        .join("");
      view.innerHTML = `${head}<p class="eng-step-lead eng-step-lead--page">${esc(t("readingLibraryLead"))}</p>${levels}`;
      bindHelpButtons(view, topic);
      return;
    }

    view.innerHTML = `
      ${head}
      ${lessonCard || decks ? step(t("stepLesson"), `${lessonCard}${decks ? `<div class="eng-item-list">${decks}</div>` : ""}`) : ""}
      ${step(t("stepPractice"), exercises ? `<div class="eng-ex-grid">${exercises}</div>` : `<p class="eng-empty">${esc(t("noExercises"))}</p>`)}
      ${
        units.length
          ? step(
              t("stepReading"),
              `<div class="eng-level-grid">${units.map((ex) => levelCardHtml(topic, ex, best, true)).join("")}</div>`
            )
          : ""
      }
      ${printables ? step(t("stepPrint"), `<p class="eng-step-lead">${esc(t("printLead"))}</p><div class="eng-ex-grid">${printables}</div>`) : ""}`;

    bindHelpButtons(view, topic);
    $(".eng-lesson-open", view)?.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.lesson;
      const raw = window.ReadyLessons?.catalog?.[id];
      window.StudentProgress?.record({
        kind: "lesson",
        topicId: topic.id,
        topicTitle: topic.title,
        itemId: id,
        itemTitle: raw?.namePart || raw?.name || id,
      });
      if (window.ReadyLessons?.openLesson) window.ReadyLessons.openLesson(id);
      else window.location.href = `/services/ready-lessons?lesson=${encodeURIComponent(id)}`;
    });

    $$("[data-presentation]", view).forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const pres = topic.presentations.find((p) => p.id === link.dataset.presentation);
        if (!pres) return;
        window.StudentProgress?.record({
          kind: "presentation",
          topicId: topic.id,
          topicTitle: topic.title,
          itemId: pres.id,
          itemTitle: pres.title,
        });
        slideViewer.open(pres);
      });
    });
  }

  /* ── Exercise runner ── */

  const runner = {
    topic: null,
    exercise: null,
    round: [],
    index: 0,
    score: 0,
    total: 0,
    mistakes: [],
    mistakeLog: [],
    answered: false,
    phase: "question",
    isRetry: false,
    timer: null,
    state: null,
    startedAt: 0,
    recorded: false,
  };


  function buildRound(ex) {
    // A passage's questions follow the text, so they keep their order.
    if (ex.type === "reading") return [...ex.questions];
    if (ex.type === "match") {
      const pairs = ex.pairs || ex.words.map((id) => ({ a: VOCAB[id].en, img: imgUrl(id), word: id }));
      return [{ pairs: shuffle(pairs).slice(0, ex.boardSize || 6) }];
    }
    const pool = ex.words ? ex.words.map(wordItem).filter(Boolean) : ex.questions;
    return shuffle(pool).slice(0, ex.roundSize || 10);
  }

  function startExercise(topic, exercise, round = null) {
    clearTimeout(runner.timer);
    runner.topic = topic;
    runner.exercise = exercise;
    runner.isRetry = !!round;
    runner.round = round || buildRound(exercise);
    runner.total = exercise.type === "match" ? runner.round.reduce((n, b) => n + b.pairs.length, 0) : runner.round.length;
    runner.index = 0;
    runner.ringIndex = 0;
    runner.score = 0;
    runner.mistakes = [];
    runner.mistakeLog = [];
    runner.startedAt = Date.now();
    runner.recorded = false;
    if (exercise.type === "reading") startReading();
    else renderQuestion();
  }

  // Sentence exercises whose questions carry a Hebrew translation (`he`).
  // Order exercises also have `he`, but there it is the prompt itself.
  function hasTranslation(exercise) {
    return ["choice", "truefalse", "write", "reading"].includes(exercise.type) && !!exercise.questions?.some((q) => q.he);
  }

  function toolsHtml() {
    const showTranslate = runner.phase === "question" && hasTranslation(runner.exercise);
    const showReadAloud = runner.exercise?.type === "reading" && runner.phase !== "results" && canSpeak();
    const tool = (id, on, icon, label, title) =>
      `<button type="button" class="eng-tool" id="${id}" aria-pressed="${on}" title="${esc(title)}">${icon}<span>${esc(label)}</span></button>`;
    return `
      ${showReadAloud ? tool("engReadAloud", readAloud.on, readAloud.on ? ICONS.stop : ICONS.play, t("readAloud"), t(readAloud.on ? "readAloudOn" : "readAloudOff")) : ""}
      ${showTranslate ? tool("engTranslateToggle", prefs.translate, ICONS.translate, t("translate"), t(prefs.translate ? "translateOn" : "translateOff")) : ""}
      ${tool("engSoundToggle", prefs.sound, prefs.sound ? ICONS.listen : ICONS.soundOff, t("sound"), t(prefs.sound ? "soundOn" : "soundOff"))}`;
  }

  function renderTools() {
    const box = $("#engRunnerTools");
    if (!box) return;
    box.innerHTML = toolsHtml();
    $("#engSoundToggle")?.addEventListener("click", () => {
      prefs.sound = !prefs.sound;
      saveFlag(SOUND_KEY, prefs.sound);
      renderTools();
      $("#engSoundToggle")?.focus({ preventScroll: true });
    });
    $("#engTranslateToggle")?.addEventListener("click", () => {
      prefs.translate = !prefs.translate;
      saveFlag(TRANSLATE_KEY, prefs.translate);
      $(".eng-runner-card")?.classList.toggle("is-translated", prefs.translate);
      renderTools();
      // A typing question keeps the cursor in its input.
      const input = $("#engInput");
      if (input && !runner.answered) input.focus({ preventScroll: true });
      else $("#engTranslateToggle")?.focus({ preventScroll: true });
    });
    $("#engReadAloud")?.addEventListener("click", () => {
      readAloud.toggle();
      $("#engReadAloud")?.focus({ preventScroll: true });
    });
  }

  // Reads the passage aloud, one utterance per paragraph (long utterances get
  // cut off in some browsers). Any other speech or navigation cancels it.
  const readAloud = {
    on: false,
    run: 0,
    toggle() {
      if (this.on) {
        this.stop();
        return;
      }
      const paragraphs = runner.exercise?.passage?.text;
      if (!canSpeak() || !paragraphs) return;
      window.speechSynthesis.cancel();
      const run = ++this.run;
      this.on = true;
      paragraphs.forEach((para, i) => {
        const utter = new SpeechSynthesisUtterance(para.replace(/[[\]]/g, ""));
        utter.lang = "en-US";
        utter.rate = 0.85;
        const voice = pickVoice();
        if (voice) {
          utter.voice = voice;
          utter.lang = voice.lang;
        }
        if (i === paragraphs.length - 1) utter.onend = () => this.done(run);
        utter.onerror = () => this.done(run);
        window.speechSynthesis.speak(utter);
      });
      renderTools();
    },
    stop() {
      this.run++;
      if (this.on) window.speechSynthesis?.cancel?.();
      this.on = false;
      renderTools();
    },
    done(run) {
      if (run !== this.run) return;
      this.on = false;
      renderTools();
    },
  };

  // `progress` sits in the header bar, outside the card.
  function renderRunnerShell(inner, progress = "") {
    const view = views.exercise();
    const { topic, exercise } = runner;
    const isReading = exercise.type === "reading";
    view.classList.toggle("is-reading", isReading);
    view.innerHTML = `
      <div class="eng-runner-head">
        <div class="eng-runner-title-row">
          <h2 class="font-cartoon eng-runner-title">${esc(isReading ? t("readingTitle", exercise.level) : loc(exercise, "title"))}</h2>
          ${runner.phase === "results" ? "" : infoBtnHtml(exercise)}
        </div>
        <div class="eng-runner-bar">
          <a class="eng-back" href="#${esc(topic.id)}" aria-label="${esc(t("backToTopic"))}" title="${esc(t("backToTopic"))}">${ICONS.back}</a>
          ${progress}
          <div class="eng-runner-tools" id="engRunnerTools"></div>
        </div>
      </div>
      <div class="eng-runner-card eng-runner-card--${esc(exercise.type)}${prefs.translate ? " is-translated" : ""}">${inner}</div>`;
    renderTools();
    bindHelpButtons(view, topic);
    $$(".eng-speak", view).forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        speak(btn.dataset.say);
      });
    });
  }

  const RING_R = 20;
  const RING_C = 2 * Math.PI * RING_R;

  // One arc per question around the ring, starting at 12 o'clock: `done` arcs
  // are filled, the `current` one is tinted, and the `fresh` one draws itself in.
  function ringHtml(total, done, current = -1, fresh = -1) {
    const step = 360 / total;
    const gap = total > 1 ? Math.min(10, 120 / total) : 0;
    const len = ((RING_C * (step - gap)) / 360).toFixed(2);
    const arc = (i, cls, extra = "") =>
      `<circle class="eng-ring-seg ${cls}" cx="24" cy="24" r="${RING_R}" stroke-dasharray="${len} ${RING_C.toFixed(2)}" transform="rotate(${(-90 + i * step + gap / 2).toFixed(2)} 24 24)"${extra} />`;
    const arcs = Array.from({ length: total }, (_, i) => i);
    return (
      arcs.map((i) => arc(i, "eng-ring-track")).join("") +
      arcs
        .filter((i) => i < done || i === current)
        .map((i) =>
          i === current ? arc(i, "eng-ring-fill is-current") : arc(i, `eng-ring-fill${i === fresh ? " is-new" : ""}`, ` style="--seg:${len}px"`)
        )
        .join("")
    );
  }

  function progressHtml({ label, num, total, done, current = -1, fresh = -1 }) {
    return `
      <div class="eng-progress" id="engProgress" role="img" aria-label="${esc(label)}">
        <span class="eng-ring" aria-hidden="true">
          <svg viewBox="0 0 48 48" id="engRing">${ringHtml(total, done, current, fresh)}</svg>
          <span class="eng-ring-num" id="engRingNum">${num}</span>
        </span>
      </div>`;
  }

  function questionProgress() {
    const { index, round } = runner;
    // Only a newly reached question animates its arc, not a re-render of the
    // same one (e.g. on a language switch).
    const fresh = runner.ringIndex === index ? -1 : index - 1;
    runner.ringIndex = index;
    return progressHtml({ label: t("progress", index + 1, round.length), num: index + 1, total: round.length, done: index, current: index, fresh });
  }

  function instructionsHtml() {
    return `<p class="eng-instructions">${esc(loc(runner.exercise, "instructions"))}</p>`;
  }

  const feedbackHtml = `<div class="eng-feedback" id="engFeedback" aria-live="polite"></div>`;

  function sentenceHtml(question, filled, state) {
    // A missing letter inside a word ("___og") gets a letter-wide blank.
    // Decided by the options, not the answer, so the blank's width never
    // hints which option is right (e.g. a / an).
    const options = question.options || runner.exercise?.options || [];
    const letterCls = options.length && options.every((opt) => opt.length === 1) ? " is-letter" : "";
    const blank = filled
      ? `<span class="eng-blank${letterCls} is-${state}" dir="ltr">${esc(filled)}</span>`
      : `<span class="eng-blank${letterCls}">&nbsp;</span>`;
    const hint = question.hint ? ` <span class="eng-hint">(${esc(question.hint)})</span>` : "";
    const parts = esc(question.text).split("___");
    if (parts.length < 2) return `${esc(question.text)} ${blank}${hint}`;
    return `${parts[0]}${blank}${hint}${parts.slice(1).join("___")}`;
  }

  function contextHtml(question) {
    return question.context ? `<span class="eng-context">${esc(question.context)}</span>` : "";
  }

  // Always rendered when the question has one; the runner card's
  // is-translated class decides whether it shows.
  function translationHtml(question) {
    if (!question.he) return "";
    const text = esc(question.he).split("___").join(`<span class="eng-tr-blank"></span>`);
    return `<p class="eng-translation" dir="rtl" lang="he">${text}</p>`;
  }

  function renderQuestion() {
    runner.answered = false;
    runner.phase = "question";
    runner.state = null;
    const type = runner.exercise.type;
    (TYPES[type] || TYPES.choice).render(runner.round[runner.index]);
  }

  function answerButtons() {
    return $$(".js-answer", views.exercise());
  }

  function lockAnswers() {
    answerButtons().forEach((btn) => {
      btn.disabled = true;
    });
  }

  function onRight(message = t("correct"), delay = AUTO_NEXT_MS) {
    runner.score++;
    playSfx("right");
    $("#engFeedback").innerHTML = `<span class="eng-feedback-msg is-right">${ICONS.check}<span>${esc(message)}</span></span>`;
    runner.timer = setTimeout(goNext, delay);
  }

  // A plain-text summary of a missed question for the teacher's progress page.
  // Stored in Hebrew, since that page is Hebrew-only.
  function mistakeRecord(q, given) {
    const type = runner.exercise.type;
    if (type === "match") return { prompt: q.a, answer: q.b || VOCAB[q.word]?.he || "", given: "" };
    if (type === "truefalse") {
      const answer = q.correct ? "נכון" : `לא נכון${q.fix ? ` — ${q.fix}` : ""}`;
      return { prompt: q.text, answer, given: given ? "נכון" : "לא נכון" };
    }
    if (q.word) return { prompt: q.he, answer: q.en, given };
    if (type === "order") return { prompt: q.he || "", answer: q.answer, given };
    return { prompt: q.hint ? `${q.text} (${q.hint})` : q.text, answer: q.answer, given };
  }

  function onWrong(question, messageHtml, given = "") {
    runner.mistakes.push(question);
    runner.mistakeLog.push(mistakeRecord(question, given));
    playSfx("wrong");
    const isLast = runner.index === runner.round.length - 1;
    $("#engFeedback").innerHTML = `
      <span class="eng-feedback-msg is-wrong">${ICONS.cross}<span dir="auto">${messageHtml}</span></span>
      <button type="button" class="btn btn-primary btn-candy font-cartoon eng-next" id="engNext">${esc(isLast ? t("finish") : t("next"))}</button>`;
    $("#engNext").addEventListener("click", goNext);
    $("#engNext").focus({ preventScroll: true });
  }

  function goNext() {
    clearTimeout(runner.timer);
    if (!runner.answered) return;
    if (runner.exercise.type === "reading") {
      readingNext();
      return;
    }
    if (runner.index < runner.round.length - 1) {
      runner.index++;
      renderQuestion();
    } else {
      renderResults();
      playSfx("finish");
    }
  }

  // Up to `count` answer words for a picture question: the right one plus
  // random others from the same exercise.
  function wordOptions(question, count = 4) {
    const others = shuffle(runner.exercise.words.filter((id) => id !== question.word)).slice(0, count - 1);
    return shuffle([question.word, ...others]).map(wordItem);
  }

  const TYPES = {
    choice: {
      render(q) {
        const options = q.options ? shuffle(q.options) : runner.exercise.options;
        renderRunnerShell(`
          ${instructionsHtml()}
          <div class="eng-sentence" dir="ltr"><p id="engSentence">${sentenceHtml(q)}</p>${contextHtml(q)}${translationHtml(q)}</div>
          <div class="eng-options" dir="ltr">
            ${options
              .map(
                (opt, i) =>
                  `<button type="button" class="eng-option js-answer" data-option="${esc(opt)}"><span class="eng-option-key">${i + 1}</span>${esc(opt)}</button>`
              )
              .join("")}
          </div>
          ${feedbackHtml}`,
          questionProgress()
        );
        answerButtons().forEach((btn) => btn.addEventListener("click", () => this.answer(q, btn.dataset.option)));
      },
      answer(q, choice) {
        if (runner.answered) return;
        runner.answered = true;
        const isRight = choice === q.answer;
        lockAnswers();
        answerButtons().forEach((btn) => {
          if (btn.dataset.option === q.answer) btn.classList.add("is-right");
          else if (btn.dataset.option === choice) btn.classList.add("is-wrong");
        });
        $("#engSentence").innerHTML = sentenceHtml(q, q.answer, isRight ? "right" : "wrong");
        if (isRight) onRight();
        else onWrong(q, esc(t("wrong", q.answer)), choice);
      },
      review: (q) => `<span dir="ltr">${sentenceHtml(q, q.answer, "right")}${q.context ? ` <span class="eng-context-inline">${esc(q.context)}</span>` : ""}</span>`,
    },

    truefalse: {
      render(q) {
        renderRunnerShell(`
          ${instructionsHtml()}
          <div class="eng-sentence" dir="ltr"><p id="engSentence">${esc(q.text)}</p><div id="engFix"></div>${translationHtml(q)}</div>
          <div class="eng-options eng-options--tf">
            <button type="button" class="eng-tf-btn eng-tf-btn--true js-answer" data-value="true">${ICONS.check}<span>${esc(t("trueBtn"))}</span></button>
            <button type="button" class="eng-tf-btn eng-tf-btn--false js-answer" data-value="false">${ICONS.cross}<span>${esc(t("falseBtn"))}</span></button>
          </div>
          ${feedbackHtml}`,
          questionProgress()
        );
        answerButtons().forEach((btn) => btn.addEventListener("click", () => this.answer(q, btn.dataset.value === "true")));
      },
      answer(q, value) {
        if (runner.answered) return;
        runner.answered = true;
        const isRight = value === q.correct;
        lockAnswers();
        answerButtons().forEach((btn) => {
          const btnValue = btn.dataset.value === "true";
          if (btnValue === q.correct) btn.classList.add("is-right");
          else if (btnValue === value) btn.classList.add("is-wrong");
        });
        if (!q.correct && q.fix) {
          $("#engSentence").classList.add("is-struck");
          $("#engFix").innerHTML = `<p class="eng-fix">${ICONS.check}<span>${esc(q.fix)}</span></p>`;
        }
        if (isRight) onRight(t("correct"), q.correct ? AUTO_NEXT_MS : AUTO_NEXT_WITH_FIX_MS);
        else onWrong(q, esc(q.correct ? t("sentenceWasRight") : t("sentenceWasWrong")), value);
      },
      review: (q) =>
        q.correct
          ? `<span dir="ltr">${esc(q.text)}</span> <span class="eng-review-tag">${esc(t("trueBtn"))}</span>`
          : `<span dir="ltr"><s class="eng-review-wrong">${esc(q.text)}</s> → <strong>${esc(q.fix || "")}</strong></span>`,
    },

    write: {
      render(q) {
        const input = `<input type="text" class="eng-input" id="engInput" dir="ltr" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done" aria-label="${esc(t("typeHere"))}" placeholder="${esc(q.word ? t("typeHere") : "")}" />`;
        const prompt = q.word
          ? `<div class="eng-picture-box"><img class="eng-picture-img" src="${esc(q.img)}" alt="" draggable="false" /><span class="eng-picture-he">${esc(q.he)}</span></div>
             <div class="eng-write-solo" dir="ltr">${input}<span id="engCorrection"></span></div>`
          : (() => {
              const parts = esc(q.text).split("___");
              const hint = q.hint ? ` <span class="eng-hint">(${esc(q.hint)})</span>` : "";
              return `<div class="eng-sentence" dir="ltr"><p id="engSentence">${parts[0]}<span class="eng-input-wrap">${input}<span id="engCorrection"></span></span>${hint}${parts.slice(1).join("___")}</p>${translationHtml(q)}</div>`;
            })();
        renderRunnerShell(`
          ${instructionsHtml()}
          ${prompt}
          <div class="eng-actions"><button type="button" class="btn btn-primary btn-candy font-cartoon eng-check" id="engCheck">${esc(t("check"))}</button></div>
          ${feedbackHtml}`,
          questionProgress()
        );
        const inputEl = $("#engInput");
        inputEl.addEventListener("keydown", (e) => {
          if (e.key !== "Enter") return;
          e.preventDefault();
          if (runner.answered) goNext();
          else this.answer(q);
        });
        $("#engCheck").addEventListener("click", () => this.answer(q));
        inputEl.focus({ preventScroll: true });
      },
      answer(q) {
        if (runner.answered) return;
        const inputEl = $("#engInput");
        if (!inputEl.value.trim()) {
          inputEl.classList.remove("is-shake");
          void inputEl.offsetWidth;
          inputEl.classList.add("is-shake");
          inputEl.placeholder = t("emptyAnswer");
          inputEl.focus({ preventScroll: true });
          return;
        }
        runner.answered = true;
        const answer = q.word ? q.en : q.answer;
        const accepted = [answer, ...(q.accept || [])].map(normalize);
        const isRight = accepted.includes(normalize(inputEl.value));
        inputEl.readOnly = true;
        inputEl.classList.add(isRight ? "is-right" : "is-wrong");
        $(".eng-actions", views.exercise())?.classList.add("hidden");
        if (isRight) {
          onRight();
        } else {
          $("#engCorrection").innerHTML = `<span class="eng-correction">${esc(answer)}</span>`;
          onWrong(q, esc(t("wrong", answer)), inputEl.value.trim());
        }
      },
      review: (q) =>
        q.word
          ? `<span class="eng-review-word"><img src="${esc(q.img)}" alt="" /><span dir="ltr">${esc(q.en)}</span> — ${esc(q.he)}</span>`
          : `<span dir="ltr">${sentenceHtml(q, q.answer, "right")}</span>`,
    },

    order: {
      render(q) {
        const tokens = q.answer.split(" ");
        let bank = shuffle(tokens.map((_, i) => i));
        for (let tries = 0; tries < 6 && tokens.length > 1 && bank.every((v, i) => tokens[v] === tokens[i]); tries++) {
          bank = shuffle(bank);
        }
        runner.state = { tokens, bank, placed: [] };
        renderRunnerShell(`
          ${instructionsHtml()}
          ${q.he ? `<p class="eng-order-he">${esc(q.he)}</p>` : ""}
          <div class="eng-order-line" id="engOrderLine" dir="ltr"></div>
          <div class="eng-order-bank" id="engOrderBank" dir="ltr"></div>
          <div class="eng-actions"><button type="button" class="btn btn-primary btn-candy font-cartoon eng-check" id="engCheck" disabled>${esc(t("check"))}</button></div>
          ${feedbackHtml}`,
          questionProgress()
        );
        $("#engCheck").addEventListener("click", () => this.answer(q));
        this.draw();
      },
      draw() {
        const { tokens, bank, placed } = runner.state;
        const line = $("#engOrderLine");
        line.innerHTML = placed.length
          ? placed.map((i) => `<button type="button" class="eng-chip is-placed" data-i="${i}">${esc(tokens[i])}</button>`).join("")
          : `<span class="eng-order-placeholder">${esc(t("orderHint"))}</span>`;
        $("#engOrderBank").innerHTML = bank
          .map(
            (i) =>
              `<button type="button" class="eng-chip${placed.includes(i) ? " is-used" : ""}" data-i="${i}"${placed.includes(i) ? ' tabindex="-1" aria-hidden="true"' : ""}>${esc(tokens[i])}</button>`
          )
          .join("");
        $("#engCheck").disabled = runner.answered || placed.length !== tokens.length;
        if (runner.answered) return;
        $$("#engOrderLine .eng-chip").forEach((chip) =>
          chip.addEventListener("click", () => {
            runner.state.placed = placed.filter((i) => i !== Number(chip.dataset.i));
            this.draw();
          })
        );
        $$("#engOrderBank .eng-chip:not(.is-used)").forEach((chip) =>
          chip.addEventListener("click", () => {
            runner.state.placed = [...placed, Number(chip.dataset.i)];
            this.draw();
          })
        );
      },
      answer(q) {
        if (runner.answered) return;
        const { tokens, placed } = runner.state;
        if (placed.length !== tokens.length) return;
        runner.answered = true;
        const isRight = placed.map((i) => tokens[i]).join(" ") === q.answer;
        this.draw();
        $$("#engOrderLine .eng-chip").forEach((chip) => {
          chip.disabled = true;
        });
        // Every chip is placed by now, so the bank and Check button are empty space.
        $("#engOrderBank").classList.add("hidden");
        $(".eng-actions", views.exercise())?.classList.add("hidden");
        $("#engOrderLine").classList.add(isRight ? "is-right" : "is-wrong");
        if (isRight) onRight();
        else onWrong(q, `${esc(t("fixLabel"))} <span dir="ltr">${esc(q.answer)}</span>`, placed.map((i) => tokens[i]).join(" "));
      },
      review: (q) => `<span dir="ltr">${esc(q.answer)}</span>${q.he ? ` <span class="eng-review-he">${esc(q.he)}</span>` : ""}`,
    },

    picture: {
      render(q) {
        const options = wordOptions(q);
        renderRunnerShell(`
          ${instructionsHtml()}
          <div class="eng-picture-box"><img class="eng-picture-img" src="${esc(q.img)}" alt="" draggable="false" /></div>
          <div class="eng-options" dir="ltr">
            ${options
              .map(
                (o, i) =>
                  `<button type="button" class="eng-option js-answer" data-word="${esc(o.word)}"><span class="eng-option-key">${i + 1}</span>${esc(o.en)}</button>`
              )
              .join("")}
          </div>
          ${feedbackHtml}`,
          questionProgress()
        );
        answerButtons().forEach((btn) => btn.addEventListener("click", () => pictureAnswer(q, btn.dataset.word)));
      },
      review: (q) => `<span class="eng-review-word"><img src="${esc(q.img)}" alt="" /><span dir="ltr">${esc(q.en)}</span> — ${esc(q.he)}</span>`,
    },

    "pick-picture": {
      render(q) {
        renderRunnerShell(`
          ${instructionsHtml()}
          <div class="eng-word-prompt" dir="ltr"><span class="eng-word-big">${esc(q.en)}</span>${speakBtn(q.en)}</div>
          ${picOptionsHtml(wordOptions(q))}
          ${feedbackHtml}`,
          questionProgress()
        );
        answerButtons().forEach((btn) => btn.addEventListener("click", () => pictureAnswer(q, btn.dataset.word)));
      },
    },

    listen: {
      render(q) {
        const prompt = canSpeak()
          ? `<div class="eng-listen-prompt">
               <button type="button" class="eng-listen-btn" id="engListenBtn" aria-label="${esc(t("play"))}">${ICONS.listen}</button>
               <span class="eng-listen-label" id="engListenLabel">${esc(t("playAgain"))}</span>
             </div>`
          : `<div class="eng-listen-prompt"><p class="eng-listen-fallback">${esc(t("noSpeech"))}</p><span class="eng-word-big" dir="ltr">${esc(q.en)}</span></div>`;
        renderRunnerShell(`
          ${instructionsHtml()}
          ${prompt}
          ${picOptionsHtml(wordOptions(q))}
          ${feedbackHtml}`,
          questionProgress()
        );
        answerButtons().forEach((btn) => btn.addEventListener("click", () => pictureAnswer(q, btn.dataset.word)));
        $("#engListenBtn")?.addEventListener("click", () => speak(q.en));
        // Clicking the previous answer counts as user activation, so the
        // browser lets the word play on its own.
        setTimeout(() => {
          if (runner.round[runner.index] === q && !runner.answered) speak(q.en);
        }, 350);
      },
    },

    match: {
      render(board) {
        const sideA = shuffle(board.pairs.map((p, i) => ({ p, i })));
        const sideB = shuffle(board.pairs.map((p, i) => ({ p, i })));
        runner.state = { board, selected: null, matched: new Set(), errored: new Set() };
        const itemB = ({ p, i }) =>
          p.img
            ? `<button type="button" class="eng-match-item eng-match-item--img" data-side="b" data-i="${i}"><img src="${esc(p.img)}" alt="" draggable="false" /></button>`
            : `<button type="button" class="eng-match-item" data-side="b" data-i="${i}" dir="auto">${esc(p.b)}</button>`;
        const total = board.pairs.length;
        renderRunnerShell(
          `
          ${instructionsHtml()}
          <div class="eng-match" dir="ltr">
            <div class="eng-match-col">${sideA.map(({ p, i }) => `<button type="button" class="eng-match-item" data-side="a" data-i="${i}" dir="ltr">${esc(p.a)}</button>`).join("")}</div>
            <div class="eng-match-col">${sideB.map(itemB).join("")}</div>
          </div>
          ${feedbackHtml}`,
          progressHtml({ label: t("matchProgress", 0, total), num: 0, total, done: 0 })
        );
        $$(".eng-match-item").forEach((item) => item.addEventListener("click", () => this.pick(item)));
      },
      pick(item) {
        const st = runner.state;
        if (runner.answered || item.classList.contains("is-matched")) return;
        if (!st.selected || st.selected.dataset.side === item.dataset.side) {
          st.selected?.classList.remove("is-selected");
          st.selected = st.selected === item ? null : item;
          st.selected?.classList.add("is-selected");
          return;
        }
        const first = st.selected;
        first.classList.remove("is-selected");
        st.selected = null;
        if (first.dataset.i === item.dataset.i) {
          [first, item].forEach((el) => {
            el.classList.add("is-matched");
            el.disabled = true;
          });
          st.matched.add(Number(item.dataset.i));
          playSfx("right");
          const total = st.board.pairs.length;
          const done = st.matched.size;
          $("#engProgress").setAttribute("aria-label", t("matchProgress", done, total));
          $("#engRingNum").textContent = done;
          $("#engRing").innerHTML = ringHtml(total, done, -1, done - 1);
          if (done === total) this.finish();
        } else {
          // The first item picked is the one the student was trying to match.
          st.errored.add(Number(first.dataset.i));
          playSfx("wrong");
          [first, item].forEach((el) => {
            el.classList.remove("is-wrong");
            void el.offsetWidth;
            el.classList.add("is-wrong");
            setTimeout(() => el.classList.remove("is-wrong"), 650);
          });
        }
      },
      finish() {
        runner.answered = true;
        const { board, errored } = runner.state;
        runner.score += board.pairs.length - errored.size;
        board.pairs.forEach((p, i) => {
          if (!errored.has(i)) return;
          runner.mistakes.push(p);
          runner.mistakeLog.push(mistakeRecord(p));
        });
        $("#engFeedback").innerHTML = `<span class="eng-feedback-msg is-right">${ICONS.check}<span>${esc(t("matchDone"))}</span></span>`;
        runner.timer = setTimeout(goNext, AUTO_NEXT_MS);
      },
      review: (p) =>
        p.img
          ? `<span class="eng-review-word"><img src="${esc(p.img)}" alt="" /><span dir="ltr">${esc(p.a)}</span></span>`
          : `<span dir="ltr">${esc(p.a)}</span> — <span dir="auto">${esc(p.b)}</span>`,
    },
  };
  TYPES["pick-picture"].review = TYPES.picture.review;
  TYPES.listen.review = TYPES.picture.review;

  function picOptionsHtml(options) {
    return `
      <div class="eng-pic-options">
        ${options
          .map(
            (o, i) =>
              `<button type="button" class="eng-pic-option js-answer" data-word="${esc(o.word)}" aria-label="${i + 1}"><span class="eng-option-key">${i + 1}</span><img src="${esc(o.img)}" alt="" draggable="false" /><span class="eng-pic-label" dir="ltr">${esc(o.en)}</span></button>`
          )
          .join("")}
      </div>`;
  }

  // Shared by picture / pick-picture / listen: the answer is a vocab word id.
  function pictureAnswer(q, wordId) {
    if (runner.answered) return;
    runner.answered = true;
    const isRight = wordId === q.word;
    lockAnswers();
    answerButtons().forEach((btn) => {
      btn.classList.add("is-revealed");
      if (btn.dataset.word === q.word) btn.classList.add("is-right");
      else if (btn.dataset.word === wordId) btn.classList.add("is-wrong");
    });
    $("#engListenLabel")?.replaceChildren(document.createTextNode(q.en));
    if (isRight) {
      onRight(`${t("correct")} ${q.en} — ${q.he}`);
    } else {
      onWrong(q, `${esc(t("wrong", ""))}<span dir="ltr">${esc(q.en)}</span> — ${esc(q.he)} ${speakBtn(q.en, "eng-speak--inline")}`, VOCAB[wordId]?.en || wordId);
      $$("#engFeedback .eng-speak").forEach((btn) => btn.addEventListener("click", () => speak(btn.dataset.say)));
    }
  }

  /* ── Reading passages (unseen) ──
     A passage is a list of paragraphs in which [word] or [two words] marks a
     word the student has to find. Stage "mark" (only when the unit has
     `mark`): click every such word in the text — each one found is a point,
     each wrong click takes one away. Stage "questions": multiple choice (mc),
     true / false (tf) and open questions, one at a time, with the passage
     still on screen. */

  const TOKEN_RE = /\[([^\]]+)\]|([A-Za-z0-9]+(?:['’][A-Za-z]+)*(?:-[A-Za-z0-9]+)*)|([^[A-Za-z0-9]+)/g;
  const OPTION_KEYS = ["a", "b", "c", "d", "e"];

  function parsePassage(paragraphs) {
    const tokens = [];
    paragraphs.forEach((para, p) => {
      for (const m of para.matchAll(TOKEN_RE)) {
        if (m[1] !== undefined) tokens.push({ text: m[1], word: true, target: true, p });
        else if (m[2] !== undefined) tokens.push({ text: m[2], word: true, target: false, p });
        else tokens.push({ text: m[3], word: false, target: false, p });
      }
    });
    return tokens;
  }

  function startReading() {
    const ex = runner.exercise;
    const tokens = parsePassage(ex.passage.text);
    const targets = tokens.flatMap((tok, i) => (tok.target ? [i] : []));
    const marking = !!ex.mark && targets.length > 0;
    runner.read = {
      tokens,
      targets,
      marking,
      stage: marking ? "mark" : "questions",
      found: new Set(),
      misses: new Set(),
      revealed: new Set(),
      markScore: 0,
      qScore: 0,
    };
    runner.total = (marking ? targets.length : 0) + runner.round.length;
    if (!marking) prepareQuestion();
    renderReading();
  }

  function markComplete() {
    const st = runner.read;
    return st.found.size + st.revealed.size === st.targets.length;
  }

  // Multiple-choice options are shuffled once per question, so a re-render
  // (e.g. a language switch) keeps them in place.
  function prepareQuestion() {
    const q = runner.round[runner.index];
    runner.answered = false;
    runner.state = { order: q.type === "mc" ? shuffle(q.options.map((_, i) => i)) : null };
  }

  // One arc for the marking step plus one per question; the number in the
  // middle is the question number (a highlighter while marking).
  function readingProgress() {
    const st = runner.read;
    const steps = (st.marking ? 1 : 0) + runner.round.length;
    const pos = st.stage === "mark" ? 0 : (st.marking ? 1 : 0) + runner.index;
    const fresh = runner.ringIndex === pos ? -1 : pos - 1;
    runner.ringIndex = pos;
    const label = st.stage === "mark" ? t("markStep") : t("questionNum", runner.index + 1, runner.round.length);
    const num = st.stage === "mark" ? `<span class="eng-ring-icon">${ICONS.highlighter}</span>` : runner.index + 1;
    return progressHtml({ label, num, total: steps, done: pos, current: pos, fresh });
  }

  function passageHtml(interactive) {
    const st = runner.read;
    const paras = [];
    st.tokens.forEach((tok, i) => {
      let html = esc(tok.text);
      if (tok.word) {
        const cls = st.found.has(i)
          ? " is-found"
          : st.revealed.has(i)
            ? " is-revealed"
            : st.misses.has(i) && st.stage === "mark"
              ? " is-miss"
              : "";
        // Spans, not <button>s: a button is an atomic inline box, so a line
        // could break between a word and the period after it.
        html = interactive
          ? `<span class="eng-tok${cls}" role="button" tabindex="0" data-t="${i}">${html}</span>`
          : `<span class="eng-tok${cls}">${html}</span>`;
      }
      (paras[tok.p] ||= []).push(html);
    });
    return paras.map((p) => `<p>${p.join("")}</p>`).join("");
  }

  function renderReading() {
    const st = runner.read;
    const ex = runner.exercise;
    runner.phase = st.stage === "mark" ? "mark" : "question";
    const interactive = st.stage === "mark" && !markComplete();
    const glossary = ex.passage.glossary?.length
      ? `<p class="eng-read-glossary"><span class="eng-read-glossary-title" dir="auto">${esc(t("glossary"))}</span>${ex.passage.glossary
          .map((g) => `<span class="eng-read-gloss"><b>${esc(g.en)}</b> = <span dir="rtl" lang="he">${esc(g.he)}</span></span>`)
          .join("")}</p>`
      : "";
    // Phones stack the passage over the task; the expand button gives the
    // passage the whole card for a moment (the task comes back on a second tap).
    renderRunnerShell(
      `<div class="eng-read is-${st.stage}">
        <div class="eng-read-side">
          <article class="eng-read-passage" id="engReadPassage" lang="en" dir="ltr">
            <h3 class="eng-read-title">${esc(ex.passage.title)}</h3>
            <div class="eng-read-text${interactive ? " is-marking" : ""}" id="engReadText">${passageHtml(interactive)}</div>
            ${glossary}
          </article>
          <button type="button" class="eng-read-expand" id="engReadExpand" aria-pressed="false" aria-label="${esc(t("expandText"))}" title="${esc(t("expandText"))}">${ICONS.expand}</button>
        </div>
        <div class="eng-read-task" id="engReadTask"></div>
      </div>`,
      readingProgress()
    );
    const text = $("#engReadText");
    text.addEventListener("click", (e) => {
      const tok = e.target.closest(".eng-tok[tabindex]");
      if (tok) markToken(tok);
    });
    text.addEventListener("keydown", (e) => {
      const tok = e.target.closest?.(".eng-tok[tabindex]");
      if (!tok || (e.key !== "Enter" && e.key !== " ")) return;
      e.preventDefault();
      markToken(tok);
    });
    $("#engReadExpand").addEventListener("click", (e) => {
      const btn = e.currentTarget;
      const open = $(".eng-read").classList.toggle("is-text-open");
      btn.setAttribute("aria-pressed", String(open));
      btn.innerHTML = open ? ICONS.collapse : ICONS.expand;
      btn.setAttribute("aria-label", t(open ? "collapseText" : "expandText"));
      btn.title = t(open ? "collapseText" : "expandText");
    });
    renderReadingTask();
  }

  function renderReadingTask() {
    const box = $("#engReadTask");
    if (!box) return;
    // A new task brings the task box back if the passage was enlarged.
    if ($(".eng-read")?.classList.contains("is-text-open")) $("#engReadExpand")?.click();
    if (runner.read.stage === "mark") renderMarkTask(box);
    else renderQuestionTask(box);
    box.scrollTop = 0;
  }

  /* Marking stage */

  function markCountHtml() {
    const st = runner.read;
    const misses = st.misses.size;
    return `
      <span class="eng-read-found">${esc(t("markFoundLabel"))} <b>${st.found.size}</b> ${esc(t("markOf", st.targets.length))}</span>
      ${misses ? `<span class="eng-read-misses">${esc(t("markMisses", misses))}</span>` : ""}`;
  }

  function markDoneHtml() {
    return runner.read.revealed.size
      ? `<span class="eng-feedback-msg is-shown">${ICONS.highlighter}<span>${esc(t("markRevealed"))}</span></span>`
      : `<span class="eng-feedback-msg is-right">${ICONS.check}<span>${esc(t("markAllFound"))}</span></span>`;
  }

  function renderMarkTask(box) {
    const ex = runner.exercise;
    const done = markComplete();
    box.innerHTML = `
      <p class="eng-read-step">${esc(t("markStep"))}</p>
      <div class="eng-read-mark-head">
        <p class="eng-read-instr">${esc(loc(ex.mark, "text"))}</p>
        ${ex.mark.hint ? `<p class="eng-read-hint" dir="ltr">${esc(ex.mark.hint)}</p>` : ""}
      </div>
      <div class="eng-read-mark-foot">
        <div class="eng-read-count" id="engMarkCount" aria-live="polite">${markCountHtml()}</div>
        <div class="eng-read-actions">
          <button type="button" class="eng-read-reveal${done ? " hidden" : ""}" id="engMarkReveal">${esc(t("markReveal"))}</button>
          <button type="button" class="btn btn-primary btn-candy font-cartoon eng-check" id="engToQuestions"${done ? "" : " disabled"}>${esc(t("toQuestions"))}</button>
        </div>
      </div>
      <div class="eng-feedback eng-read-feedback" id="engFeedback" aria-live="polite">${done ? markDoneHtml() : ""}</div>`;
    $("#engMarkReveal").addEventListener("click", revealMarks);
    $("#engToQuestions").addEventListener("click", finishMarking);
  }

  function markToken(btn) {
    const st = runner.read;
    if (st.stage !== "mark" || markComplete()) return;
    const i = Number(btn.dataset.t);
    if (st.found.has(i) || st.misses.has(i)) return;
    if (st.tokens[i].target) {
      st.found.add(i);
      btn.classList.add("is-found");
      playSfx(markComplete() ? "right" : "tick");
    } else {
      st.misses.add(i);
      btn.classList.add("is-miss");
      playSfx("miss");
    }
    updateMarkStatus();
  }

  function updateMarkStatus() {
    $("#engMarkCount").innerHTML = markCountHtml();
    if (!markComplete()) return;
    // Every word is found or shown: the text locks and the questions open.
    $("#engReadText").classList.remove("is-marking");
    $$("#engReadText .eng-tok[tabindex]").forEach((tok) => {
      tok.removeAttribute("tabindex");
      tok.removeAttribute("role");
    });
    $("#engMarkReveal").classList.add("hidden");
    $("#engToQuestions").disabled = false;
    $("#engFeedback").innerHTML = markDoneHtml();
    $("#engToQuestions").focus({ preventScroll: true });
  }

  function revealMarks() {
    const st = runner.read;
    let first = null;
    st.targets.forEach((i) => {
      if (st.found.has(i)) return;
      st.revealed.add(i);
      const tok = $(`#engReadText .eng-tok[data-t="${i}"]`);
      tok?.classList.add("is-revealed");
      first ||= tok;
    });
    updateMarkStatus();
    // Bring the first missing word into view inside the passage box (not
    // scrollIntoView, which would also scroll the fixed page).
    const passage = $("#engReadPassage");
    if (first && passage && passage.scrollHeight > passage.clientHeight) {
      passage.scrollTop = Math.max(0, first.offsetTop - passage.offsetTop - 40);
    }
  }

  function finishMarking() {
    const st = runner.read;
    if (st.stage !== "mark" || !markComplete()) return;
    st.markScore = Math.max(0, st.found.size - st.misses.size);
    runner.score += st.markScore;
    const words = (set) => [...set].sort((a, b) => a - b).map((i) => st.tokens[i].text);
    const missed = words(st.revealed);
    const wrong = [...new Set(words(st.misses))];
    if (missed.length || wrong.length) {
      runner.mistakes.push({ kind: "mark", missed, wrong });
      runner.mistakeLog.push({
        prompt: `סימון בטקסט: ${runner.exercise.mark.text}`,
        answer: missed.length ? `לא סומנו: ${missed.join(", ")}` : "כל המילים סומנו",
        given: wrong.length ? `סומנו בטעות: ${wrong.join(", ")}` : "",
      });
    }
    st.stage = "questions";
    runner.index = 0;
    prepareQuestion();
    renderReading();
  }

  /* Questions stage */

  function readTranslationHtml(q) {
    return q.he ? `<p class="eng-translation" dir="rtl" lang="he">${esc(q.he)}</p>` : "";
  }

  function openQuestionText(q) {
    return lang() === "en" && q.qEn ? q.qEn : q.q;
  }

  function renderQuestionTask(box) {
    const q = runner.round[runner.index];
    let body;
    if (q.type === "mc") {
      body = `
        <p class="eng-read-q" dir="ltr">${esc(q.q)}</p>
        ${readTranslationHtml(q)}
        <div class="eng-read-options">
          ${runner.state.order
            .map(
              (oi, k) =>
                `<button type="button" class="eng-read-option js-answer" data-i="${oi}" dir="ltr"><span class="eng-read-option-key">${OPTION_KEYS[k]}</span><span class="eng-read-option-text">${esc(q.options[oi])}</span></button>`
            )
            .join("")}
        </div>`;
    } else if (q.type === "tf") {
      body = `
        <p class="eng-read-q" dir="ltr">${esc(q.q)}</p>
        ${readTranslationHtml(q)}
        <div class="eng-options eng-options--tf">
          <button type="button" class="eng-tf-btn eng-tf-btn--true js-answer" data-value="true">${ICONS.check}<span>${esc(t("trueBtn"))}</span></button>
          <button type="button" class="eng-tf-btn eng-tf-btn--false js-answer" data-value="false">${ICONS.cross}<span>${esc(t("falseBtn"))}</span></button>
        </div>`;
    } else {
      const inHebrew = q.lang === "he";
      const langNote = inHebrew ? (lang() === "he" ? t("answerHe") : t("answerAny")) : t("answerEn");
      body = `
        <p class="eng-read-q" dir="auto">${esc(openQuestionText(q))}</p>
        ${inHebrew ? "" : readTranslationHtml(q)}
        <p class="eng-read-lang">${ICONS.write}<span>${esc(langNote)}</span></p>
        <textarea class="eng-read-input" id="engInput" rows="2" dir="${inHebrew ? "auto" : "ltr"}" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="done" aria-label="${esc(t("typeHere"))}" placeholder="${esc(t("typeHere"))}"></textarea>
        <div id="engModel"></div>
        <div class="eng-actions"><button type="button" class="btn btn-primary btn-candy font-cartoon eng-check" id="engCheck">${esc(t("check"))}</button></div>`;
    }
    box.innerHTML = `
      <p class="eng-read-step">${esc(t("questionNum", runner.index + 1, runner.round.length))}</p>
      ${body}
      <div class="eng-feedback eng-read-feedback" id="engFeedback" aria-live="polite"></div>`;

    if (q.type === "mc") {
      answerButtons().forEach((btn) => btn.addEventListener("click", () => answerMc(q, Number(btn.dataset.i))));
    } else if (q.type === "tf") {
      answerButtons().forEach((btn) => btn.addEventListener("click", () => answerTf(q, btn.dataset.value === "true")));
    } else {
      const input = $("#engInput");
      input.addEventListener("keydown", (e) => {
        if (e.key !== "Enter" || e.shiftKey) return;
        e.preventDefault();
        if (runner.answered) goNext();
        else answerOpen(q);
      });
      $("#engCheck").addEventListener("click", () => answerOpen(q));
      // Phones would pop the keyboard over the passage; let the student tap in.
      if (window.matchMedia("(hover: hover)").matches) input.focus({ preventScroll: true });
    }
  }

  function answerMc(q, chosen) {
    if (runner.answered) return;
    runner.answered = true;
    lockAnswers();
    const isRight = q.options[chosen] === q.answer;
    answerButtons().forEach((btn) => {
      const i = Number(btn.dataset.i);
      if (q.options[i] === q.answer) btn.classList.add("is-right");
      else if (i === chosen) btn.classList.add("is-wrong");
    });
    if (isRight) readRight();
    else readWrong(q, `${esc(t("wrong", ""))}<span dir="ltr">${esc(q.answer)}</span>`, q.options[chosen]);
  }

  function answerTf(q, value) {
    if (runner.answered) return;
    runner.answered = true;
    lockAnswers();
    answerButtons().forEach((btn) => {
      const btnValue = btn.dataset.value === "true";
      if (btnValue === q.answer) btn.classList.add("is-right");
      else if (btnValue === value) btn.classList.add("is-wrong");
    });
    if (value === q.answer) readRight();
    else readWrong(q, esc(t("wrong", t(q.answer ? "trueBtn" : "falseBtn"))), value);
  }

  // Open answers are checked by keywords: `keywords` is a list of groups, and
  // the answer has to contain one word from every group. English keywords
  // match at the start of a word (so "play" also matches "played"); Hebrew
  // ones anywhere, since Hebrew attaches prefixes (ה, ב, ו...) to the word.
  function keywordHit(text, key) {
    if (!key) return false;
    if (/^[a-z0-9]/.test(key)) {
      return new RegExp(`(^|[^a-z0-9'])${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(text);
    }
    return text.includes(key);
  }

  function openIsRight(q, given) {
    const text = normalize(given);
    return (q.keywords || []).every((group) => group.some((key) => keywordHit(text, normalize(key))));
  }

  function answerOpen(q) {
    if (runner.answered) return;
    const input = $("#engInput");
    const given = input.value.trim();
    if (!given) {
      input.classList.remove("is-shake");
      void input.offsetWidth;
      input.classList.add("is-shake");
      input.placeholder = t("emptyAnswer");
      input.focus({ preventScroll: true });
      return;
    }
    runner.answered = true;
    input.readOnly = true;
    const isRight = openIsRight(q, given);
    input.classList.add(isRight ? "is-right" : "is-wrong");
    $("#engReadTask .eng-actions")?.classList.add("hidden");
    const model = lang() === "en" && q.answerEn ? q.answerEn : q.answer;
    $("#engModel").innerHTML = `<p class="eng-read-model"><span class="eng-read-model-label">${esc(t("modelAnswer"))}</span> <span dir="auto">${esc(model)}</span></p>`;
    // An open answer always waits for "Next", so there is time to compare it
    // with the sample answer.
    if (isRight) readRight(t("openRight"), false);
    else readWrong(q, esc(t("openWrong")), given);
  }

  function readNextButton() {
    const isLast = runner.index === runner.round.length - 1;
    return `<button type="button" class="btn btn-primary btn-candy font-cartoon eng-next" id="engNext">${esc(isLast ? t("finish") : t("next"))}</button>`;
  }

  function bindReadNext() {
    $("#engNext").addEventListener("click", goNext);
    $("#engNext").focus({ preventScroll: true });
  }

  function readRight(message = t("correct"), auto = true) {
    runner.score++;
    runner.read.qScore++;
    playSfx("right");
    $("#engFeedback").innerHTML = `<span class="eng-feedback-msg is-right">${ICONS.check}<span>${esc(message)}</span></span>${auto ? "" : readNextButton()}`;
    if (auto) runner.timer = setTimeout(goNext, AUTO_NEXT_MS);
    else bindReadNext();
  }

  function readWrong(q, messageHtml, given) {
    runner.mistakes.push({ kind: "q", q, given });
    runner.mistakeLog.push({
      prompt: openQuestionText(q),
      answer: q.type === "tf" ? (q.answer ? "נכון" : "לא נכון") : q.answer,
      given: q.type === "tf" ? (given ? "נכון" : "לא נכון") : String(given ?? ""),
    });
    playSfx("wrong");
    $("#engFeedback").innerHTML = `<span class="eng-feedback-msg is-wrong">${ICONS.cross}<span dir="auto">${messageHtml}</span></span>${readNextButton()}`;
    bindReadNext();
  }

  function readingNext() {
    if (runner.index < runner.round.length - 1) {
      runner.index++;
      prepareQuestion();
      renderReadingTask();
      const progress = $("#engProgress");
      if (progress) progress.outerHTML = readingProgress();
    } else {
      readAloud.stop();
      renderResults();
      playSfx("finish");
    }
  }

  TYPES.reading = {
    review(m) {
      if (m.kind === "mark") {
        const parts = [];
        if (m.missed.length) parts.push(`${esc(t("reviewMissed"))} <span dir="ltr"><strong>${esc(m.missed.join(", "))}</strong></span>`);
        if (m.wrong.length) parts.push(`${esc(t("reviewWrongMarks"))} <span dir="ltr"><s class="eng-review-wrong">${esc(m.wrong.join(", "))}</s></span>`);
        return parts.join("<br>");
      }
      // Question and answer on separate lines: they are often in different
      // languages, and one mixed line would come out jumbled.
      const { q, given } = m;
      const answer = q.type === "tf" ? t(q.answer ? "trueBtn" : "falseBtn") : q.type === "open" && lang() === "en" && q.answerEn ? q.answerEn : q.answer;
      const yours = q.type === "open" ? `<span class="eng-review-line eng-review-he"><span>${esc(t("yourAnswer"))}</span> <bdi>${esc(given)}</bdi></span>` : "";
      return `<span class="eng-review-line" dir="auto">${esc(openQuestionText(q))}</span><span class="eng-review-line eng-review-answer">${ICONS.check}<bdi>${esc(answer)}</bdi></span>${yours}`;
    },
  };

  // Sends a finished round to the student's file (when this device opened the
  // teacher's personal link) — once, so re-rendering the results on a language
  // switch doesn't resend it.
  function recordRound() {
    if (runner.recorded) return;
    runner.recorded = true;
    const { score, total, topic, exercise, isRetry, mistakeLog, startedAt } = runner;
    const activity = {
      kind: "exercise",
      topicId: topic.id,
      topicTitle: topic.title,
      exerciseId: exercise.id,
      exerciseTitle: exercise.title,
      type: exercise.type,
      score,
      total,
      isRetry,
      durationSec: Math.round((Date.now() - startedAt) / 1000),
      mistakes: mistakeLog,
    };
    window.StudentProgress?.record(activity);
  }

  function homeworkButtonHtml() {
    const home = window.StudentProgress?.homeUrl();
    return home ? `<a class="btn btn-candy font-cartoon eng-btn-secondary" href="${esc(home)}">${esc(t("backToHomework"))}</a>` : "";
  }

  function renderResults() {
    const { score, total, mistakes, topic, exercise, isRetry } = runner;
    runner.phase = "results";
    recordRound();
    const ratio = total ? score / total : 0;
    const grade = Math.round(ratio * 100);
    const stars = ratio === 1 ? 3 : ratio >= 0.7 ? 2 : ratio >= 0.4 ? 1 : 0;
    const message = ratio === 1 ? t("perfect") : ratio >= 0.7 ? t("great") : t("keepGoing");

    // A mistakes-only retry is a partial round, so it doesn't count as a best score.
    if (!isRetry) saveBest(`${topic.id}/${exercise.id}`, score, total);

    // A reading round reports its two parts separately; it has no
    // mistakes-only retry, since its questions depend on the whole passage.
    const isReading = exercise.type === "reading";
    const read = runner.read;
    const countLine = isReading
      ? [read.marking ? t("partMark", read.markScore, read.targets.length) : "", t("partQuestions", read.qScore, runner.round.length)]
          .filter(Boolean)
          .join(" · ")
      : t("score", score, total);

    const review = (TYPES[exercise.type] || TYPES.choice).review;
    const mistakesList = mistakes.length
      ? `<div class="eng-mistakes">
          <h3>${esc(t("mistakesTitle"))}</h3>
          <ul>${mistakes.map((q) => `<li>${review(q)}</li>`).join("")}</ul>
        </div>`
      : "";

    renderRunnerShell(`
      <div class="eng-results">
        <div class="eng-stars" aria-hidden="true">
          ${[1, 2, 3].map((n) => `<span class="eng-star${n <= stars ? " is-on" : ""}">${ICONS.star}</span>`).join("")}
        </div>
        <div class="eng-grade">
          <span class="eng-grade-label">${esc(t("gradeLabel"))}</span>
          <p class="eng-score font-cartoon">${grade}</p>
        </div>
        <p class="eng-results-count">${esc(countLine)}</p>
        <p class="eng-results-msg">${esc(message)}</p>
        <div class="eng-results-actions">
          <button type="button" class="btn btn-primary btn-candy font-cartoon" id="engAgain">${esc(t("again"))}</button>
          ${mistakes.length && !isReading ? `<button type="button" class="btn btn-candy font-cartoon eng-btn-secondary" id="engRetryMistakes">${esc(t("retryMistakes"))}</button>` : ""}
          ${homeworkButtonHtml()}
        </div>
        ${mistakesList}
        <button type="button" class="eng-copy-link" id="engCopyLink">${ICONS.link}<span>${esc(t("copyLink"))}</span></button>
      </div>`);

    $("#engAgain").addEventListener("click", () => startExercise(topic, exercise));
    $("#engRetryMistakes")?.addEventListener("click", () => {
      const retry = exercise.type === "match" ? [{ pairs: shuffle(mistakes) }] : shuffle(mistakes);
      startExercise(topic, exercise, retry);
    });
    $("#engCopyLink").addEventListener("click", async () => {
      const url = `${location.origin}${location.pathname}#${topic.id}/${exercise.id}`;
      try {
        await navigator.clipboard.writeText(url);
        showToast(t("copied"));
      } catch {
        /* ignore */
      }
    });
  }

  function bindRunnerKeys() {
    document.addEventListener("keydown", (e) => {
      if (views.exercise()?.classList.contains("hidden") || slideViewer.isOpen() || help.isOpen()) return;
      if (document.querySelector("#lessonPlayer:not(.hidden)")) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (runner.phase !== "question") return;
      // Typing exercises handle their own keys inside the input.
      if (e.target.closest?.("input, textarea")) return;
      if (!runner.answered && /^[1-9]$/.test(e.key)) {
        const btn = answerButtons()[Number(e.key) - 1];
        if (btn && !btn.disabled) {
          e.preventDefault();
          btn.click();
        }
      } else if (runner.answered && e.key === "Enter" && document.activeElement?.id !== "engNext") {
        // Enter on the focused Next button is already handled by its own click.
        e.preventDefault();
        goNext();
      }
    });
  }

  /* ── Exercise help: the "i" button next to every exercise opens what to do
     in it and a worked example taken from the exercise's own content. ── */

  function exerciseName(ex) {
    return ex.type === "reading" ? ex.passage.title : loc(ex, "title");
  }

  function infoBtnHtml(ex) {
    return `<button type="button" class="eng-info-btn" data-help="${esc(ex.id)}" aria-haspopup="dialog" aria-label="${esc(t("helpOpen", exerciseName(ex)))}" title="${esc(t("helpButton"))}">${ICONS.info}</button>`;
  }

  function bindHelpButtons(view, topic) {
    const inRunner = view === views.exercise();
    $$("[data-help]", view).forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const ex = findExercise(topic, btn.dataset.help);
        if (ex) help.open(topic, ex, inRunner, btn);
      });
    });
  }

  // Hebrew text with English bits in it (e.g. "(a, e, i, o, u)"): each
  // English run is isolated and kept in one piece, so a line break inside it
  // never scrambles its direction. Parentheses join a run only as a pair
  // around English, so a Hebrew "(… Enter)" keeps its own.
  const LATIN_RUN = /\([A-Za-z][^\u0590-\u05FF()]*\)|[A-Za-z](?:[^\u0590-\u05FF()]*[A-Za-z])?/g;

  function mixedText(str) {
    const text = String(str ?? "");
    if (lang() !== "he") return esc(text);
    let html = "";
    let last = 0;
    for (const m of text.matchAll(LATIN_RUN)) {
      html += `${esc(text.slice(last, m.index))}<bdi class="eng-help-ltr" dir="ltr">${esc(m[0])}</bdi>`;
      last = m.index + m[0].length;
    }
    return html + esc(text.slice(last));
  }

  // The right answer goes in the middle, so the example doesn't suggest it is
  // always the first option.
  function answerInMiddle(options, answer) {
    const others = options.filter((o) => o !== answer);
    others.splice(Math.floor(others.length / 2), 0, answer);
    return others;
  }

  // A scrambled version of a sentence's words that is never the sentence itself.
  function scrambleWords(tokens) {
    const mixed = [...tokens.filter((_, i) => i % 2), ...tokens.filter((_, i) => !(i % 2))];
    return mixed.join(" ") === tokens.join(" ") ? [...tokens].reverse() : mixed;
  }

  // The sentence with its blank filled by `answer`, styled by `cls`.
  function helpSentence(q, answer, cls) {
    // A missing letter inside a word ("___og") gets a letter-wide fill.
    const fill = `<span class="${cls}${answer.length === 1 ? " is-letter" : ""}">${esc(answer)}</span>`;
    const hint = q.hint ? ` <span class="eng-help-hint">(${esc(q.hint)})</span>` : "";
    const parts = esc(q.text).split("___");
    const body = parts.length < 2 ? `${esc(q.text)} ${fill}${hint}` : `${parts[0]}${fill}${hint}${parts.slice(1).join("___")}`;
    return `<p class="eng-help-sentence" dir="ltr">${body}</p>`;
  }

  function helpTranslation(he) {
    if (!he) return "";
    return `<p class="eng-help-tr" dir="rtl" lang="he">${esc(he).split("___").join('<span class="eng-tr-blank"></span>')}</p>`;
  }

  function helpOptions(options, answer) {
    return `<div class="eng-help-options" dir="ltr">${options
      .map((o) => (o === answer ? `<span class="eng-help-opt is-right">${ICONS.check}${esc(o)}</span>` : `<span class="eng-help-opt">${esc(o)}</span>`))
      .join("")}</div>`;
  }

  function helpPics(items, rightWord) {
    return `<div class="eng-help-pics">${items
      .map(
        (w) => `
          <span class="eng-help-pic${w.word === rightWord ? " is-right" : ""}">
            <img src="${esc(w.img)}" alt="" draggable="false" />
            ${w.word === rightWord ? `<span class="eng-help-pic-check">${ICONS.check}</span>` : ""}
          </span>`
      )
      .join("")}</div>`;
  }

  function helpBadge(isTrue) {
    return isTrue
      ? `<span class="eng-help-badge is-true">${ICONS.check}${esc(t("trueBtn"))}</span>`
      : `<span class="eng-help-badge is-false">${ICONS.cross}${esc(t("falseBtn"))}</span>`;
  }

  const helpArrow = `<span class="eng-help-arrow">${ICONS.arrowDown}</span>`;

  // The first few words of a picture exercise, with the first one as the answer.
  function helpWords(ex, count = 3) {
    return ex.words.slice(0, count).map(wordItem).filter(Boolean);
  }

  const HELP_EXAMPLES = {
    choice(ex) {
      const q = ex.questions[0];
      const options = q.options ? answerInMiddle(q.options, q.answer) : ex.options || [];
      return `
        ${helpSentence(q, q.answer, "eng-help-fill")}
        ${q.context ? `<span class="eng-help-context">${esc(q.context)}</span>` : ""}
        ${helpTranslation(q.he)}
        ${helpOptions(options, q.answer)}`;
    },
    truefalse(ex) {
      const right = ex.questions.find((q) => q.correct);
      const wrong = ex.questions.find((q) => !q.correct && q.fix) || ex.questions.find((q) => !q.correct);
      const row = (q) => `
        <div class="eng-help-tf-row">
          <p class="eng-help-sentence" dir="ltr">${esc(q.text)}</p>
          ${helpBadge(q.correct)}
          ${!q.correct && q.fix ? `<p class="eng-help-fix"><span>${esc(t("fixLabel"))}</span><b dir="ltr">${esc(q.fix)}</b></p>` : ""}
        </div>`;
      return `<div class="eng-help-tf">${[right, wrong].filter(Boolean).map(row).join("")}</div>`;
    },
    write(ex) {
      if (ex.words) {
        const [w] = helpWords(ex, 1);
        return `
          <span class="eng-help-picture"><img src="${esc(w.img)}" alt="" draggable="false" /><span>${esc(w.he)}</span></span>
          <p class="eng-help-sentence" dir="ltr"><span class="eng-help-typed">${esc(w.en)}</span></p>`;
      }
      const q = ex.questions[0];
      return `${helpSentence(q, q.answer, "eng-help-typed")}${helpTranslation(q.he)}`;
    },
    order(ex) {
      const q = ex.questions.find((item) => item.answer.split(" ").length >= 3) || ex.questions[0];
      const tokens = q.answer.split(" ");
      const chips = (list, cls = "") => `<div class="eng-help-chips" dir="ltr">${list.map((w) => `<span class="eng-help-chip${cls}">${esc(w)}</span>`).join("")}</div>`;
      return `
        ${q.he ? `<p class="eng-help-tr eng-help-tr--prompt" dir="rtl" lang="he">${esc(q.he)}</p>` : ""}
        ${chips(scrambleWords(tokens))}
        ${helpArrow}
        ${chips(tokens, " is-right")}`;
    },
    picture(ex) {
      const words = helpWords(ex);
      const [w] = words;
      return `
        <span class="eng-help-picture"><img src="${esc(w.img)}" alt="" draggable="false" /></span>
        ${helpOptions(answerInMiddle(words.map((item) => item.en), w.en), w.en)}`;
    },
    "pick-picture"(ex) {
      const words = helpWords(ex);
      const [w] = words;
      return `
        <p class="eng-help-word" dir="ltr">${esc(w.en)}</p>
        ${helpPics(answerInMiddle(words, w), w.word)}`;
    },
    listen(ex) {
      const words = helpWords(ex);
      const [w] = words;
      const prompt = canSpeak()
        ? `<button type="button" class="eng-help-speak" data-say="${esc(w.en)}" aria-label="${esc(t("speakWord", w.en))}">${ICONS.listen}</button>`
        : "";
      return `
        <div class="eng-help-listen">${prompt}<span class="eng-help-heard" dir="ltr">“${esc(w.en)}”</span></div>
        ${helpPics(answerInMiddle(words, w), w.word)}`;
    },
    match(ex) {
      const pairs = (ex.pairs || ex.words.map((id) => ({ a: VOCAB[id]?.en, img: imgUrl(id) }))).slice(0, 3);
      return `
        <div class="eng-help-pairs" dir="ltr">${pairs
          .map(
            (p) => `
              <div class="eng-help-pair">
                <span class="eng-help-chip is-right">${esc(p.a)}</span>
                <span class="eng-help-pair-line"></span>
                ${p.img ? `<span class="eng-help-pic is-right eng-help-pic--small"><img src="${esc(p.img)}" alt="" draggable="false" /></span>` : `<span class="eng-help-chip is-right" dir="auto">${esc(p.b)}</span>`}
              </div>`
          )
          .join("")}</div>`;
    },
    reading(ex) {
      // The shortest closed question, so the example stays small.
      const size = (item) => item.q.length + (item.options || ["true"]).join("").length;
      const closed = ex.questions.filter((item) => item.type !== "open");
      const q = closed.length ? closed.reduce((a, b) => (size(b) < size(a) ? b : a)) : ex.questions[0];
      let answer = "";
      if (q.type === "mc") answer = helpOptions(answerInMiddle(q.options, q.answer), q.answer);
      else if (q.type === "tf") answer = helpBadge(q.answer);
      else answer = `<p class="eng-help-tr">${esc(t("modelAnswer"))} ${esc(lang() === "en" && q.answerEn ? q.answerEn : q.answer)}</p>`;
      const question = `<p class="eng-help-q" dir="auto">${esc(q.type === "open" ? openQuestionText(q) : q.q)}</p>${answer}`;
      if (!ex.mark) return question;
      // A short stretch of the passage around the first word to find, with
      // the words to find already marked. A [bracketed] word keeps its
      // punctuation, and a [two words] group stays one token.
      const tokens = ex.passage.text.join(" ").match(/\S*\[[^\]]+\]\S*|\S+/g);
      const from = Math.max(0, tokens.findIndex((tok) => tok.includes("[")) - 2);
      const to = Math.min(tokens.length, from + 9);
      const marked = tokens
        .slice(from, to)
        .map((tok) => esc(tok).replace(/\[([^\]]+)\]/g, '<mark class="eng-help-mark">$1</mark>'))
        .join(" ");
      return `
        <p class="eng-help-step"><b class="eng-help-step-num">1</b><span>${mixedText(loc(ex.mark, "text"))}</span></p>
        <p class="eng-help-passage" dir="ltr" lang="en">${from ? "… " : ""}${marked}${to < tokens.length ? " …" : ""}</p>
        <p class="eng-help-step"><b class="eng-help-step-num">2</b><span>${esc(t("helpReadQuestions"))}</span></p>
        ${question}`;
    },
  };

  const help = (() => {
    let current = null;
    let lastFocus = null;
    let root = null;

    function build() {
      root = document.createElement("div");
      root.className = "eng-help hidden";
      root.id = "engHelp";
      root.setAttribute("role", "dialog");
      root.setAttribute("aria-modal", "true");
      root.setAttribute("aria-labelledby", "engHelpTitle");
      document.body.appendChild(root);
      root.addEventListener("click", (e) => {
        if (e.target.closest("[data-help-close]")) close();
        const speakBtn = e.target.closest(".eng-help-speak");
        if (speakBtn) speak(speakBtn.dataset.say);
      });
      document.addEventListener("keydown", (e) => {
        if (!isOpen()) return;
        if (e.key === "Escape") {
          e.preventDefault();
          close();
        } else if (e.key === "Tab") {
          // Keep keyboard focus inside the dialog.
          const items = $$("button, a[href]", $(".eng-help-card", root));
          const first = items[0];
          const last = items[items.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      });
    }

    function render() {
      const { topic, ex, inRunner } = current;
      const isReading = ex.type === "reading";
      const icon = isReading ? ICONS.reading : ICONS[ex.type] || ICONS.choice;
      const what = isReading ? t(ex.mark ? "helpReadingMarkWhat" : "helpReadingWhat") : loc(ex, "instructions");
      // Library passages have nothing to mark, so the marking tip doesn't apply.
      const tip = !isReading || ex.mark ? t("helpTips")[ex.type] || t("helpTips").choice : "";
      const action = inRunner
        ? `<button type="button" class="btn btn-primary btn-candy font-cartoon eng-help-go" data-help-close>${esc(t("helpGotIt"))}</button>`
        : `<a class="btn btn-primary btn-candy font-cartoon eng-help-go" href="#${esc(topic.id)}/${esc(ex.id)}">${esc(t("helpStart"))}</a>`;
      root.innerHTML = `
        <div class="eng-help-backdrop" data-help-close></div>
        <div class="eng-help-card eng-help-card--${esc(ex.type)}${isReading ? ` eng-help-card--level-${ex.level}` : ""}">
          <div class="eng-help-head">
            <span class="eng-help-icon">${icon}</span>
            <div class="eng-help-heading">
              <p class="eng-help-kicker">${esc(t("helpButton"))}</p>
              <h2 class="eng-help-title" id="engHelpTitle">${isReading ? `<bdi dir="ltr">${esc(exerciseName(ex))}</bdi>` : esc(exerciseName(ex))}</h2>
            </div>
            <button type="button" class="eng-help-close" data-help-close aria-label="${esc(t("close"))}">${ICONS.cross}</button>
          </div>
          <div class="eng-help-block">
            <h3 class="eng-help-label">${esc(t("helpWhat"))}</h3>
            <p class="eng-help-what">${mixedText(what)}</p>
            ${tip ? `<p class="eng-help-tip">${mixedText(tip)}</p>` : ""}
          </div>
          <div class="eng-help-block">
            <h3 class="eng-help-label">${esc(t("helpExample"))}</h3>
            <div class="eng-help-example">${(HELP_EXAMPLES[ex.type] || HELP_EXAMPLES.choice)(ex)}</div>
          </div>
          <div class="eng-help-actions">${action}</div>
        </div>`;
    }

    function open(topic, ex, inRunner, opener) {
      if (!root) build();
      current = { topic, ex, inRunner };
      lastFocus = opener || document.activeElement;
      render();
      root.classList.remove("hidden");
      document.body.classList.add("eng-help-open");
      $(".eng-help-go", root)?.focus({ preventScroll: true });
    }

    // `restoreFocus` is false when the page itself is changing (navigation).
    function close(restoreFocus = true) {
      if (!isOpen()) return;
      root.classList.add("hidden");
      document.body.classList.remove("eng-help-open");
      window.speechSynthesis?.cancel?.();
      if (restoreFocus) {
        // A language switch may have re-rendered the button that opened the dialog.
        const target = lastFocus?.isConnected ? lastFocus : $(`[data-help="${CSS.escape(current.ex.id)}"]`);
        target?.focus?.({ preventScroll: true });
      }
      current = null;
    }

    function isOpen() {
      return !!root && !root.classList.contains("hidden");
    }

    function refresh() {
      if (!isOpen()) return;
      render();
      $(".eng-help-go", root)?.focus({ preventScroll: true });
    }

    return { open, close, isOpen, refresh };
  })();

  /* ── Slide viewer (image-based presentations) ── */

  const slideViewer = (() => {
    let slides = [];
    let index = 0;
    let lastFocus = null;

    const el = () => $("#engSlideViewer");

    function render() {
      $("#engSlideImg").src = slides[index];
      $("#engSlideCounter").textContent = `${index + 1} / ${slides.length}`;
      $("#engSlidePrev").disabled = index === 0;
      $("#engSlideNext").disabled = index === slides.length - 1;
    }

    function go(delta) {
      const nextIndex = Math.min(slides.length - 1, Math.max(0, index + delta));
      if (nextIndex === index) return;
      index = nextIndex;
      render();
    }

    function open(pres) {
      if (!pres.slides?.length) return;
      slides = pres.slides;
      index = 0;
      lastFocus = document.activeElement;
      $("#engSlideTitle").textContent = loc(pres, "title");
      el().classList.remove("hidden");
      el().setAttribute("aria-hidden", "false");
      document.body.classList.add("eng-viewer-open");
      render();
      $("#engSlideClose").focus({ preventScroll: true });
    }

    function close() {
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
      el().classList.add("hidden");
      el().setAttribute("aria-hidden", "true");
      document.body.classList.remove("eng-viewer-open");
      lastFocus?.focus?.({ preventScroll: true });
    }

    function isOpen() {
      return !!el() && !el().classList.contains("hidden");
    }

    function bind() {
      if (!el()) return;
      $("#engSlideClose").addEventListener("click", close);
      $("#engSlideBackdrop").addEventListener("click", close);
      // In RTL the "previous" arrow sits on the right, so buttons map by meaning, not side.
      $("#engSlidePrev").addEventListener("click", () => go(-1));
      $("#engSlideNext").addEventListener("click", () => go(1));
      $("#engSlideFullscreen").addEventListener("click", () => {
        const shell = $("#engSlideShell");
        if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
        else shell.requestFullscreen?.().catch(() => {});
      });
      document.addEventListener("keydown", (e) => {
        if (!isOpen()) return;
        const rtl = document.documentElement.dir === "rtl";
        if (e.key === "Escape" && !document.fullscreenElement) close();
        else if (e.key === "ArrowRight") go(rtl ? -1 : 1);
        else if (e.key === "ArrowLeft") go(rtl ? 1 : -1);
        else if (e.key === " " || e.key === "PageDown") {
          e.preventDefault();
          go(1);
        } else if (e.key === "PageUp") go(-1);
      });
    }

    return { open, close, isOpen, bind };
  })();

  /* ── Routing ── */

  function route() {
    clearTimeout(runner.timer);
    readAloud.stop();
    window.speechSynthesis?.cancel?.();
    if (slideViewer.isOpen()) slideViewer.close();
    const [topicId, exerciseId] = decodeURIComponent(location.hash.replace(/^#/, "")).split("/");
    const topic = findTopic(topicId);
    const exercise = findExercise(topic, exerciseId);

    if (topic && exercise) {
      showView("exercise");
      startExercise(topic, exercise);
    } else if (topic) {
      showView("topic");
      renderTopic(topic);
    } else {
      showView("topics");
      renderTopicGrid();
    }
    window.scrollTo({ top: 0 });
  }

  function applyStaticLabels() {
    $("#engSlidePrev")?.setAttribute("aria-label", t("prevSlide"));
    $("#engSlideNext")?.setAttribute("aria-label", t("nextSlide"));
    $("#engSlideClose")?.setAttribute("aria-label", t("close"));
    $("#engSlideFullscreen")?.setAttribute("aria-label", t("fullscreen"));
    const fs = $("#engSlideFullscreen");
    if (fs && !fs.innerHTML.trim()) fs.innerHTML = ICONS.expand;
  }

  function init() {
    slideViewer.bind();
    bindRunnerKeys();
    applyStaticLabels();
    route();
    window.addEventListener("hashchange", () => {
      help.close(false);
      route();
    });
    // Re-render on language switch. An exercise in progress keeps its place
    // instead of restarting; screens holding the student's own input (typed
    // text, placed words, matched pairs) or an answered question stay as they are.
    window.addEventListener("gameclass:lang", () => {
      applyStaticLabels();
      renderStudentBar();
      help.refresh();
      if (views.exercise()?.classList.contains("hidden")) {
        route();
      } else if (runner.phase === "results") {
        renderResults();
      } else if (runner.exercise?.type === "reading") {
        // Marked words are kept in state, so the marking stage can always
        // re-render; a question only before it is answered, and never one
        // with typed text in it.
        const q = runner.round[runner.index];
        if (runner.read.stage === "mark" || (!runner.answered && q?.type !== "open")) renderReading();
      } else if (!runner.answered && !["write", "order", "match", "listen"].includes(runner.exercise?.type)) {
        renderQuestion();
      }
    });
    renderStudentBar();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
