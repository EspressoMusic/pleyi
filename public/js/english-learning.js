/* Learn English — topic grid, topic page (lesson + practice + reading),
   exercise runner, reading runner and slide viewer. Content lives in
   english-vocab.js, english-data.js and english-reading.js; lessons open in
   the shared lesson player from ready-lessons.js.

   Routes (hash): ""                    → topic grid
                  "#<topic>"            → topic page
                  "#<topic>/<exercise>" → exercise runner (a reading exam too)
                  "#my-mistakes[/<topic>]" → a round from the mistake bank
                  "#cards[/today|/<category>]" → the word cards */

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  // A school subject's page (services/subject.html) runs this same engine on
  // its own topics and path (subject-practice.js): Hebrew questions, read
  // right to left, with math bits in them.
  const SUBJECT = window.LEARN_SUBJECT || null;
  const TOPICS = SUBJECT ? SUBJECT.topics : window.ENGLISH_TOPICS || [];
  const VOCAB = window.ENGLISH_VOCAB || {};
  const TEXT_DIR = SUBJECT ? "rtl" : "ltr";
  const BEST_KEY = "pleyi-english-best";
  const AUTO_NEXT_MS = 1100;
  const AUTO_NEXT_WITH_FIX_MS = 2200;

  const STR = {
    he: {
      open: "כניסה",
      back: "חזרה לנושאים",
      backToSite: "חזרה לאתר",
      backToTopic: "חזרה לנושא",
      stepGames: "משחקים",
      backToLesson: "חזרה לשיעור",
      playGame: "לשחק",
      playTogether: "משחק עם חברים",
      openLesson: "פתיחת השיעור",
      lessonInfo: "מידע על השיעור",
      lessonWhat: "מה לומדים בשיעור",
      lessonNum: (n) => `שיעור ${n}`,
      noExercises: "עוד אין תרגילים בנושא הזה.",
      view: "צפייה",
      practice: "לתרגול",
      slides: (n) => `${n} שקופיות`,
      sentences: (n) => `${n} משפטים`,
      questionsCount: (n) => `${n} שאלות`,
      words: (n) => `${n} מילים`,
      pairs: (n) => `${n} זוגות`,
      best: (s, t) => `השיא שלך: ${s}/${t}`,
      statusDone: "בוצע",
      statusProgress: "בתהליך",
      statusCovered: (p) => `עברת על ${p}% מהתרגיל`,
      progress: (i, t) => `שאלה ${i} מתוך ${t}`,
      matchProgress: (m, t) => `${m} מתוך ${t} זוגות`,
      correct: "נכון!",
      wrong: (a) => `התשובה הנכונה: ${a}`,
      wrongLabel: "התשובה הנכונה:",
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
      cardColorTitle: "צבע כרטיס השאלה",
      settings: "הגדרות",
      soundOff: "הפעלת הצלילים",
      translate: "תרגום",
      translateOn: "הסתרת התרגום",
      translateOff: "הצגת תרגום לעברית",
      gradeLabel: "הציון שלך",
      score: (s, t) => `${s} מתוך ${t} תשובות נכונות`,
      perfect: "מושלם! כל התשובות נכונות!",
      great: "כל הכבוד! עוד קצת ואתם שם.",
      keepGoing: "התחלה טובה — תרגלו שוב ותשתפרו.",
      cheerPerfect: "מושלם",
      cheerGreat: "כל הכבוד",
      again: "סבב חדש",
      retryMistakes: "לתרגל את הטעויות",
      fixedCount: (f, w, s, t) => `תיקנת ${f} מתוך ${w} טעויות · עכשיו ${s} מתוך ${t} נכונות`,
      fixedAll: "תיקנת את כל הטעויות — הציון עלה!",
      fixedSome: "הציון עלה! אפשר לתקן גם את מה שנשאר.",
      fixedNone: "עוד לא תיקנת — נסו שוב את הטעויות.",
      makingNew: "מכינים סבב חדש…",
      mistakesTitle: "מה כדאי לחזור עליו",
      copied: "הקישור הועתק!",
      hello: (name) => `שלום ${name}`,
      leaderboard: "טבלת השיאים",
      newCertLabel: "יש תעודה חדשה",
      newCert: "קיבלת תעודה חדשה!",
      newCertGo: "לתעודות שלי",
      backToHomework: "למשימות שלי",
      prevSlide: "שקופית קודמת",
      nextSlide: "שקופית הבאה",
      close: "סגירה",
      fullscreen: "מסך מלא",
      printLead: "דפי תרגול לכיתה או לבית — מדפיסים, פותרים בעיפרון ובודקים עם דף התשובות.",
      printSheet: (n) => `דף ${n}`,
      printAll: "כל הדפים יחד",
      printAction: "להדפסה",
      paperSheet: (name) => `דף להורדה ולהדפסה: ${name}`,
      level: (n) => `רמה ${n}`,
      levelName: (n) => ["", "קל", "בינוני", "מתקדם", "מאתגר"][n] || "",
      readingMeta: (w, q) => `${w} מילים · ${q} שאלות`,
      readingTitle: "קטע קריאה",
      vocabHub: "אוצר מילים לפי נושאים",
      stage: (n) => `שלב ${n}`,
      toc: "תוכן עניינים",
      grade: "כיתה",
      allGrades: "הכל",
      noGradeTopics: "עוד אין כאן נושאים לכיתה הזו.",
      nextTopic: "הנושא הבא",
      markStep: "שלב 1: מסמנים בטקסט",
      markFoundLabel: "נמצאו",
      markOf: (t) => `מתוך ${t}`,
      markMisses: (n) => (n === 1 ? "סימון שגוי אחד" : `${n} סימונים שגויים`),
      markReveal: "הראו לי מה חסר",
      toQuestions: "לשאלות",
      readStep: "קוראים את הקטע",
      readInstr: "קראו את הטקסט, ואחר כך עברו לשאלות.",
      questionsInstr: "ענו על השאלות לפי הטקסט.",
      backToText: "חזרה לטקסט",
      backToQuestion: "חזרה לשאלה",
      markAllFound: "מצאתם את כולן!",
      markRevealed: "מה שחסר מסומן בכתום.",
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
      wordsTool: "תרגום מילים",
      wordsToolOn: "כיבוי תרגום המילים",
      wordsToolOff: "לחיצה על מילה בקטע מראה את התרגום שלה",
      heQuestions: "שאלות בעברית",
      heQuestionsOn: "הצגת השאלות באנגלית",
      heQuestionsOff: "הצגת השאלות בעברית",
      dictNone: "עוד אין לנו תרגום למילה הזו.",
      dictFrom: (base) => `צורה של ${base}`,
      dictMarkNote: "כדי לסמן מילים, כבו את „תרגום מילים”.",
      glossary: "מילים חשובות:",
      partMark: (s, t) => `סימון: ${s} מתוך ${t}`,
      partQuestions: (s, t) => `שאלות: ${s} מתוך ${t}`,
      reviewMissed: "לא סומנו:",
      reviewWrongMarks: "סומנו בטעות:",
      yourAnswer: "כתבתם:",
      helpButton: "הסבר ודוגמה",
      helpOpen: (name) => `הסבר ודוגמה: ${name}`,
      helpWhat: "מה עושים?",
      helpStart: "להתחלת התרגיל",
      helpGotIt: "הבנתי",
      helpReadingWhat: "קוראים את הקטע באנגלית ועונים על השאלות.",
      helpReadingMarkWhat: "קוראים את הקטע באנגלית, מסמנים בו מילים ועונים על השאלות.",
      helpReadQuestions: "עונים על השאלות.",
      helpReadTools: "צריכים עזרה? „תרגום מילים” מראה מה אומרת כל מילה שלוחצים עליה בקטע, ו„שאלות בעברית” מציג את השאלות בעברית.",
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
        "find-error": "קוראים את המשפט ולוחצים על המילה שלא נכונה. אחר כך מופיע המשפט המתוקן.",
        "sentence-choice": "קוראים את כל המשפטים ולוחצים על המשפט שכתוב נכון. במחשב אפשר גם להקיש על המספר שלו.",
        letters: "לוחצים על האותיות לפי הסדר. לחיצה על אות שכבר הונחה מחזירה אותה. בסוף לוחצים על „בדיקה”. במחשב אפשר גם להקליד.",
        dictation: "שומעים, כותבים באנגלית ולוחצים על „בדיקה” (או על Enter). הרמקול משמיע שוב, וכפתור „לאט” משמיע לאט יותר.",
        translate: "לוחצים על התרגום הנכון. במחשב אפשר גם להקיש על המספר שלו.",
        speak: "שומעים את המילה, לוחצים על המיקרופון ואומרים אותה באנגלית. לכל מילה יש 3 ניסיונות.",
        chat: "רובו אומר משפט באנגלית, ושומעים אותו. לוחצים על התשובה שמתאימה לו. במחשב אפשר גם להקיש על המספר שלה.",
      },
      foundError: "מצאתם את הטעות!",
      fixWordLabel: "המילה הנכונה:",
      errorWas: "הטעות:",
      shouldBe: "צריך:",
      soundsLike: "נשמע:",
      sayTool: "איך קוראים בעברית",
      sayToolOn: "הסתרת ההגייה באותיות עבריות",
      sayToolOff: "הצגת איך המילה נשמעת, באותיות עבריות",
      slow: "לאט",
      slowLabel: "השמעה איטית",
      noSpeechWrite: "הדפדפן לא תומך בהשמעה — כתבו באנגלית:",
      lettersLabel: (n) => `אות ${n}`,
      earned: (n) => `+${n} נקודות`,
      earnedTotal: (n) => `סה״כ ${n.toLocaleString("he-IL")}`,
      loading: "טוען…",
      reviewTitle: "חזרה על הטעויות שלי",
      reviewCardTitle: "החזרה האישית שלי",
      reviewCardDone: (m) => `אין כרגע טעויות לחזור עליהן — כל הכבוד! ${m === 1 ? "שאלה אחת כבר יצאה" : `${m} שאלות כבר יצאו`} מהמאגר.`,
      reviewTopic: (n) => `${n === 1 ? "שאלה אחת" : `${n} שאלות`} מהנושא הזה מחכות לכם בחזרה האישית.`,
      reviewTopicGo: "לחזרה",
      reviewEmpty: "אין כרגע שאלות לחזור עליהן.",
      reviewEmptyLead: "כל טעות בתרגול נשמרת כאן, כדי שתוכלו לחזור עליה עד שתדעו אותה.",
      reviewStreak: (s, g) => `ענו נכון ${s} מתוך ${g} פעמים ברצף`,
      reviewOut: "יצאה מהמאגר!",
      reviewOutCount: (n) => (n === 1 ? "שאלה אחת יצאה מהמאגר" : `${n} שאלות יצאו מהמאגר`),
      reviewLeft: (n) => (n ? `נשארו במאגר: ${n}` : "המאגר ריק — כל הכבוד!"),
      reviewAgain: "סבב חזרה נוסף",
      mixTitle: "תרגול מעורב",
      mixAgain: "סבב מעורב חדש",
      mixMissing: "התרגול הזה לא נמצא",
      mixMissingLead: "אולי המורה הסיר אותו מהמשימות.",
      testTitle: "מבחן",
      testMissing: "המבחן לא נמצא",
      testMissingLead: "אולי המורה הסיר אותו. אפשר לחזור למשימות.",
      testLinkOnly: "המבחן נפתח מהקישור האישי שהמורה שלח.",
      testCount: (n) => `${n} שאלות`,
      testRules: ["עונים על כל שאלה ועוברים לבאה.", "התשובות נבדקות רק בסוף.", "בסוף תקבלו ציון, והמורה יראה אותו."],
      testResume: (n, total) => `כבר עניתם על ${n} מתוך ${total} שאלות. ממשיכים מאותו מקום.`,
      testStart: "להתחלת המבחן",
      testGoOn: "להמשך המבחן",
      testRetakeBadge: "מבחן חוזר",
      testNote: "מהמורה:",
      testConfirm: "אישור",
      testSaving: "שולחים את המבחן למורה…",
      testSaved: "המבחן נשלח למורה",
      testRetry: "לשלוח שוב",
      testByTopic: "הציון בכל נושא",
      testDoneTitle: "המבחן כבר הוגש",
      testAskRetake: "בקשת מבחן חוזר",
      testAsked: "ביקשת מבחן חוזר. המורה יחליט אם לפתוח אותו.",
      testDeclined: "המורה לא פתח מבחן חוזר הפעם. אפשר לבקש שוב.",
      dailyTitle: "האתגר היומי",
      dailyPageLead: ["5 שאלות קצרות בכל יום.", "השאלות הן ממה שכבר למדתם.", "עושים את האתגר כל יום, והרצף גדל."],
      dailyLeadDone: "עשיתם את האתגר של היום!",
      dailyStart: "להתחיל",
      dailyMore: "סבב נוסף",
      dailyStreak: (n) => (n === 1 ? "רצף: יום אחד" : `רצף: ${n} ימים`),
      dailyStreakNone: "התחילו רצף היום!",
      dailyStreakBig: (n) => (n === 1 ? "יום ראשון ברצף!" : `רצף של ${n} ימים!`),
      dailyBest: (n) => `השיא שלכם: ${n} ימים`,
      dailyWeek: "7 הימים האחרונים",
      dailyDayDone: (d) => `${d}: עשיתם את האתגר`,
      dailyDayMissed: (d) => `${d}: בלי אתגר`,
      dailyTomorrow: "מחר יש אתגר חדש. כדאי לחזור!",
      dailyAgainToday: "את האתגר של היום כבר עשיתם. הסבב הזה הוא תרגול נוסף.",
      dailyMissing: "אין עדיין שאלות לאתגר",
      dailyMissingLead: "פתרו תרגיל אחד באחד הנושאים, ונסו שוב.",
      dayLetters: ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"],
      cardsTitle: "כרטיסיות מילים",
      cardsTitleEn: "Word cards",
      cardsLead: ["רואים מילה באנגלית ונזכרים מה היא אומרת.", "הופכים את הכרטיס ובודקים.", "מילה שידעתם תחזור בעוד כמה ימים.", "מילה שלא ידעתם תחזור מהר."],
      cardsLearned: (n, all) => `למדתם ${n} מתוך ${all} מילים`,
      cardsToday: "הכרטיסים של היום",
      cardsDueLine: (n) => (n === 1 ? "כרטיס אחד לחזור עליו" : `${n} כרטיסים לחזור עליהם`),
      cardsNewLine: (n) => (n === 1 ? "מילה חדשה אחת" : `${n} מילים חדשות`),
      cardsTodayDone: "סיימתם להיום! אפשר ללמוד מילים חדשות מנושא.",
      cardsGo: "להתחיל",
      cardsTopics: "מילים לפי נושא",
      cardsTopicDone: (n, all) => `למדתם ${n} מתוך ${all}`,
      cardsNew: "מילה חדשה",
      cardsAsk: "מה המילה הזאת?",
      cardsFlip: "להפוך את הכרטיס",
      cardsGotIt: "הבנתי",
      cardsKnew: "ידעתי",
      cardsNotYet: "עוד לא",
      cardsFlipHint: "לחצו על הכרטיס כדי להפוך אותו",
      cardsProgress: (i, n) => `כרטיס ${i} מתוך ${n}`,
      cardsNone: "אין כרגע כרטיסים כאן",
      cardsNoneLead: "את כל המילים כבר ראיתם היום. חזרו מחר, או בחרו נושא אחר.",
      cardsDoneBig: "סיימתם את הכרטיסים!",
      cardsScore: (s, n) => `ידעתם ${s} מתוך ${n}`,
      cardsLearnedNow: (n) => (n === 1 ? "למדתם מילה אחת!" : `למדתם ${n} מילים!`),
      cardsTomorrow: (n) => (n ? `מחר ${n === 1 ? "יחכה לכם כרטיס אחד" : `יחכו לכם ${n} כרטיסים`}.` : "מחר יחכו לכם מילים חדשות."),
      cardsMore: "עוד כרטיסים",
      cardsBack: "חזרה לכרטיסיות",
      cardsVocabLink: "ללמוד את המילים בכרטיסיות",
      chatTitle: "שיחה עם הבוט",
      chatTitleEn: "Chat with the bot",
      chatLead: ["הבוט מדבר איתכם באנגלית.", "בכל פעם בוחרים מה לענות לו.", "יש שיחות קלות, בינוניות ומתקדמות."],
      chatBack: "חזרה לשיחות",
      chatBot: "רובו",
      chatMe: "אני",
      chatLevels: ["שיחות קלות", "שיחות בינוניות", "שיחות מתקדמות"],
      chatWrong: "זה לא מתאים לשיחה.",
      chatGo: "לשיחה",
      speakMic: "להקלטה",
      speakTap: "לחצו על המיקרופון ואמרו את המילה",
      speakListening: "מקשיבים… אמרו את המילה",
      speakHeard: "שמענו:",
      speakAgain: (n) => (n === 1 ? "נסו שוב. נשאר ניסיון אחד." : `נסו שוב. נשארו ${n} ניסיונות.`),
      speakNoSound: "לא שמענו כלום. לחצו שוב ודברו קרוב לטלפון.",
      speakNoMic: "צריך לאשר למיקרופון. לחצו על המנעול שליד הכתובת ואשרו „מיקרופון”.",
      speakOffline: "בדיקת הדיבור צריכה אינטרנט. בדקו את החיבור ונסו שוב.",
      speakNoSupport: "הדפדפן הזה לא יכול לשמוע דיבור. נסו בכרום.",
      speakSkip: "לדלג על המילה",
      speakAnswer: "אומרים:",
      speakRight: "מעולה! אמרתם נכון:",
      mistakesSaved: "הטעויות נשמרו בחזרה האישית שלכם, כדי שתוכלו לחזור עליהן גם בפעם אחרת.",
      reviewPictureInstr: "מה רואים בתמונה? בחרו את המילה הנכונה.",
      reviewPairInstr: "מה מתאים? בחרו את התשובה הנכונה.",
      examTitle: "מבחן",
      examsLead: "מבחני הבנת הנקרא כמו בכיתה: קטע באנגלית ושאלות מכל הסוגים, עם שעון. עונים על הכול, מגישים, ורק אז רואים ציון ותשובות נכונות.",
      examHow: [
        "אפשר לעבור בין השאלות ולשנות תשובות עד ההגשה.",
        "התשובות נשמרות, וגם השעון ממשיך לרוץ כשיוצאים מהמבחן.",
        "בסוף: ציון, פירוט לפי סוג השאלה ובדיקה של כל תשובה.",
      ],
      examMeta: (w, q, m) => `${w} מילים · ${q} שאלות · ${m} דקות`,
      examBest: (g) => `הציון הכי גבוה שלך: ${g}`,
      examFactTime: (m) => `${m} דקות`,
      examFactQuestions: (n) => `${n} שאלות`,
      examFactWords: (n) => `${n} מילים`,
      examRules: [
        "קוראים את הקטע ועונים על השאלות. הקטע נשאר על המסך כל הזמן.",
        "אפשר לעבור בין השאלות ולשנות תשובות עד שמגישים.",
        "כשהזמן נגמר, המבחן מוגש לבד.",
      ],
      examRulesHe: "בשאלות הפתוחות עונים בעברית.",
      examRulesEn: "בשאלות הפתוחות עונים באנגלית.",
      examStart: "להתחלת המבחן",
      examStartUntimed: "בלי שעון",
      examResume: "להמשיך את המבחן",
      examRestart: "להתחיל מחדש",
      examResumeNote: (time) => `התחלתם את המבחן הזה. ${time ? `נשארו ${time}.` : ""}`,
      examTimeLeft: (time) => `נשארו ${time}`,
      examElapsed: (time) => `עברו ${time}`,
      examNavLabel: "מעבר בין השאלות",
      examQuestionLabel: (i, answered) => `שאלה ${i}${answered ? " (נענתה)" : ""}`,
      examPrev: "הקודמת",
      examNext: "הבאה",
      examSubmit: "להגשה",
      examConfirmTitle: "להגיש את המבחן?",
      examConfirmMissing: (n) => (n === 1 ? "נשארה שאלה אחת בלי תשובה." : `נשארו ${n} שאלות בלי תשובה.`),
      examConfirmAll: "עניתם על כל השאלות.",
      examConfirmNote: "אחרי ההגשה כבר אי אפשר לשנות תשובות.",
      examConfirmYes: "כן, להגיש",
      examConfirmNo: "חזרה למבחן",
      examTimeUp: "הזמן נגמר, והמבחן הוגש.",
      examTypes: {
        mc: "שאלות אמריקאיות",
        tf: "נכון / לא נכון",
        open: "שאלות פתוחות",
        complete: "השלמת משפטים",
        word: "אוצר מילים",
        multi: "בחירת שתי תשובות",
        quote: "ציטוט מהטקסט",
        sequence: "סדר האירועים",
      },
      examTypeOne: {
        mc: "שאלה אמריקאית",
        tf: "נכון / לא נכון",
        open: "שאלה פתוחה",
        complete: "השלמת משפט",
        word: "אוצר מילים",
        multi: "בחירת שתי תשובות",
        quote: "ציטוט מהטקסט",
        sequence: "סדר האירועים",
      },
      examPickTwo: (n) => `בחרו ${n} תשובות.`,
      examPickedMax: (n) => `כבר בחרתם ${n}. כדי להחליף, לחצו קודם על תשובה שבחרתם.`,
      examQuoteNone: "עוד לא נבחר משפט.",
      examQuoteChosen: "המשפט שבחרתם:",
      examQuoteClear: "ביטול הבחירה",
      examQuotePick: "לבחור משפט בטקסט",
      examSequenceHow: "לחצו על האירועים לפי הסדר שבו קרו. לחיצה נוספת מבטלת.",
      examSequenceClear: "להתחיל את הסידור מחדש",
      examCompleteHow: "השלימו את המשפט באנגלית.",
      examWordHow: "כתבו את המילה באנגלית, כמו שהיא כתובה בטקסט.",
      examGrade: "הציון במבחן",
      examTimeUsed: (time) => `זמן: ${time}`,
      examByType: "לפי סוג השאלה",
      examReview: "התשובות שלכם",
      examYours: "התשובה שלכם:",
      examRight: "התשובה הנכונה:",
      examModel: "תשובה לדוגמה:",
      examNoAnswer: "לא נענתה",
      examPartial: "חצי נקודה",
      examRetake: "לעשות שוב",
      examAll: "לכל המבחנים",
      examPassage: "לטקסט",
      examBackToResults: "חזרה לתוצאות",
      examLink: "רוצים לבדוק את עצמכם במבחן אמיתי, עם שעון?",
      examLinkGo: "למבחני הבנת הנקרא",
      paragraph: (n) => `פסקה ${n}`,
      minutesSeconds: (m, s) => `${m}:${String(s).padStart(2, "0")}`,
    },
    en: {
      open: "Open",
      back: "Back to topics",
      backToSite: "Back to the site",
      backToTopic: "Back to topic",
      stepGames: "Games",
      backToLesson: "Back to the lesson",
      playGame: "Play",
      playTogether: "Play with friends",
      openLesson: "Open the lesson",
      lessonInfo: "About the lesson",
      lessonWhat: "What the lesson teaches",
      lessonNum: (n) => `Lesson ${n}`,
      noExercises: "No exercises for this topic yet.",
      view: "View",
      practice: "Practice",
      slides: (n) => `${n} slides`,
      sentences: (n) => `${n} sentences`,
      questionsCount: (n) => `${n} questions`,
      words: (n) => `${n} words`,
      pairs: (n) => `${n} pairs`,
      best: (s, t) => `Your best: ${s}/${t}`,
      statusDone: "Done",
      statusProgress: "In progress",
      statusCovered: (p) => `You've been through ${p}% of it`,
      progress: (i, t) => `Question ${i} of ${t}`,
      matchProgress: (m, t) => `${m} of ${t} pairs`,
      correct: "Correct!",
      wrong: (a) => `The right answer: ${a}`,
      wrongLabel: "The right answer:",
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
      cardColorTitle: "Question card color",
      settings: "Settings",
      soundOff: "Turn sounds on",
      translate: "Translation",
      translateOn: "Hide the translation",
      translateOff: "Show the Hebrew translation",
      gradeLabel: "Your grade",
      score: (s, t) => `${s} of ${t} answers correct`,
      perfect: "Perfect! Every answer is right!",
      great: "Well done! Almost there.",
      keepGoing: "Good start — practice again to improve.",
      cheerPerfect: "Perfect",
      cheerGreat: "Well done",
      again: "New round",
      retryMistakes: "Practice my mistakes",
      fixedCount: (f, w, s, t) => `You fixed ${f} of ${w} mistakes · now ${s} of ${t} correct`,
      fixedAll: "You fixed every mistake — your grade went up!",
      fixedSome: "Your grade went up! You can fix the rest too.",
      fixedNone: "Not fixed yet — try your mistakes again.",
      makingNew: "Getting a new round ready…",
      mistakesTitle: "Worth reviewing",
      copied: "Link copied!",
      hello: (name) => `Hello ${name}`,
      leaderboard: "Leaderboard",
      newCertLabel: "A new certificate",
      newCert: "You got a new certificate!",
      newCertGo: "To my certificates",
      backToHomework: "Back to my tasks",
      prevSlide: "Previous slide",
      nextSlide: "Next slide",
      close: "Close",
      fullscreen: "Fullscreen",
      printLead: "Practice pages for class or home — print them, solve with a pencil, and check with the answer key.",
      printSheet: (n) => `Sheet ${n}`,
      printAll: "All sheets together",
      printAction: "Print",
      paperSheet: (name) => `Sheet to download and print: ${name}`,
      level: (n) => `Level ${n}`,
      levelName: (n) => ["", "Easy", "Medium", "Advanced", "Challenging"][n] || "",
      readingMeta: (w, q) => `${w} words · ${q} questions`,
      readingTitle: "Reading",
      vocabHub: "Vocabulary by topic",
      stage: (n) => `Stage ${n}`,
      toc: "Contents",
      grade: "Grade",
      allGrades: "All",
      noGradeTopics: "No topics for this grade here yet.",
      nextTopic: "Next topic",
      markStep: "Step 1: Mark the text",
      markFoundLabel: "Found",
      markOf: (t) => `of ${t}`,
      markMisses: (n) => (n === 1 ? "1 wrong mark" : `${n} wrong marks`),
      markReveal: "Show me what's missing",
      toQuestions: "To the questions",
      readStep: "Read the passage",
      readInstr: "Read the text, then go on to the questions.",
      questionsInstr: "Answer the questions about the text.",
      backToText: "Back to the text",
      backToQuestion: "Back to the question",
      markAllFound: "You found them all!",
      markRevealed: "What you missed is marked in orange.",
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
      wordsTool: "Translate words",
      wordsToolOn: "Turn off word translation",
      wordsToolOff: "Click a word in the text to see it in Hebrew",
      heQuestions: "Hebrew questions",
      heQuestionsOn: "Show the questions in English",
      heQuestionsOff: "Show the questions in Hebrew",
      dictNone: "No translation for this word yet.",
      dictFrom: (base) => `A form of ${base}`,
      dictMarkNote: "To mark words, turn off \"Translate words\".",
      glossary: "Key words:",
      partMark: (s, t) => `Marking: ${s} of ${t}`,
      partQuestions: (s, t) => `Questions: ${s} of ${t}`,
      reviewMissed: "Not marked:",
      reviewWrongMarks: "Marked by mistake:",
      yourAnswer: "You wrote:",
      helpButton: "How it works",
      helpOpen: (name) => `How it works: ${name}`,
      helpWhat: "What to do",
      helpStart: "Start the exercise",
      helpGotIt: "Got it",
      helpReadingWhat: "Read the passage in English and answer the questions.",
      helpReadingMarkWhat: "Read the passage in English, mark words in it, and answer the questions.",
      helpReadQuestions: "Answer the questions.",
      helpReadTools: "Need help? \"Translate words\" shows what a word means when you click it in the text, and \"Hebrew questions\" shows the questions in Hebrew.",
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
        "find-error": "Read the sentence and click the wrong word. Then the corrected sentence appears.",
        "sentence-choice": "Read all the sentences and click the one that is written correctly. On a computer you can also press its number.",
        letters: "Click the letters in order. Clicking a letter that is already placed sends it back. Then click \"Check\". On a computer you can also type.",
        dictation: "Listen, type it in English and click \"Check\" (or press Enter). The speaker plays it again, and \"Slow\" plays it slower.",
        translate: "Click the right translation. On a computer you can also press its number.",
        speak: "Listen to the word, click the microphone and say it in English. Every word has 3 tries.",
        chat: "Robo says something in English, out loud. Click the reply that fits it. On a computer you can also press its number.",
      },
      foundError: "You found the mistake!",
      fixWordLabel: "The right word:",
      errorWas: "The mistake:",
      shouldBe: "Should be:",
      soundsLike: "Sounds:",
      sayTool: "Say it in Hebrew letters",
      sayToolOn: "Hide the Hebrew-letter sound",
      sayToolOff: "Show how the word sounds, in Hebrew letters",
      slow: "Slow",
      slowLabel: "Play slowly",
      noSpeechWrite: "Your browser can't play audio — type it in English:",
      lettersLabel: (n) => `Letter ${n}`,
      earned: (n) => `+${n} points`,
      earnedTotal: (n) => `Total ${n.toLocaleString("en-US")}`,
      loading: "Loading…",
      reviewTitle: "My mistakes",
      reviewCardTitle: "My mistakes to review",
      reviewCardDone: (m) => `Nothing to review right now — well done! ${m === 1 ? "1 question has" : `${m} questions have`} already left your list.`,
      reviewTopic: (n) => `${n === 1 ? "1 question" : `${n} questions`} from this topic ${n === 1 ? "is" : "are"} waiting in your review.`,
      reviewTopicGo: "Review",
      reviewEmpty: "There's nothing to review right now.",
      reviewEmptyLead: "Every mistake you make in practice is saved here, so you can come back to it until you know it.",
      reviewStreak: (s, g) => `Right ${s} of ${g} times in a row`,
      reviewOut: "Off your list!",
      reviewOutCount: (n) => (n === 1 ? "1 question left your list" : `${n} questions left your list`),
      reviewLeft: (n) => (n ? `Still on your list: ${n}` : "Your list is empty — well done!"),
      reviewAgain: "Another review round",
      mixTitle: "Mixed practice",
      mixAgain: "New mixed round",
      mixMissing: "This practice wasn't found",
      mixMissingLead: "Maybe your teacher removed it from your tasks.",
      testTitle: "Test",
      testMissing: "This test wasn't found",
      testMissingLead: "Maybe your teacher removed it. You can go back to your tasks.",
      testLinkOnly: "The test opens from the personal link your teacher sent.",
      testCount: (n) => `${n} questions`,
      testRules: ["Answer each question and move on to the next.", "The answers are checked only at the end.", "You get a grade at the end, and your teacher sees it."],
      testResume: (n, total) => `You already answered ${n} of ${total} questions. Go on from where you stopped.`,
      testStart: "Start the test",
      testGoOn: "Go on with the test",
      testRetakeBadge: "Retake",
      testNote: "From your teacher:",
      testConfirm: "Confirm",
      testSaving: "Sending the test to your teacher…",
      testSaved: "Sent to your teacher",
      testRetry: "Send again",
      testByTopic: "Your grade in each topic",
      testDoneTitle: "This test was handed in",
      testAskRetake: "Ask for a retake",
      testAsked: "You asked for a retake. Your teacher will decide.",
      testDeclined: "Your teacher didn't open a retake this time. You can ask again.",
      dailyTitle: "Daily challenge",
      dailyPageLead: ["5 short questions every day.", "The questions are about what you already learned.", "Do the challenge every day and your streak grows."],
      dailyLeadDone: "You did today's challenge!",
      dailyStart: "Start",
      dailyMore: "Another round",
      dailyStreak: (n) => (n === 1 ? "Streak: 1 day" : `Streak: ${n} days`),
      dailyStreakNone: "Start a streak today!",
      dailyStreakBig: (n) => (n === 1 ? "Day one of your streak!" : `A ${n}-day streak!`),
      dailyBest: (n) => `Your best: ${n} days`,
      dailyWeek: "The last 7 days",
      dailyDayDone: (d) => `${d}: challenge done`,
      dailyDayMissed: (d) => `${d}: no challenge`,
      dailyTomorrow: "A new challenge comes tomorrow. Come back!",
      dailyAgainToday: "You already did today's challenge. This round is extra practice.",
      dailyMissing: "No questions for the challenge yet",
      dailyMissingLead: "Solve one exercise in any topic, then try again.",
      cardsTitle: "Word cards",
      cardsTitleEn: "",
      cardsLead: ["See a word in English and remember what it means.", "Flip the card and check.", "A word you knew comes back in a few days.", "A word you didn't know comes back soon."],
      cardsLearned: (n, all) => `You learned ${n} of ${all} words`,
      cardsToday: "Today's cards",
      cardsDueLine: (n) => (n === 1 ? "1 card to review" : `${n} cards to review`),
      cardsNewLine: (n) => (n === 1 ? "1 new word" : `${n} new words`),
      cardsTodayDone: "Done for today! You can learn new words from a topic.",
      cardsGo: "Start",
      cardsTopics: "Words by topic",
      cardsTopicDone: (n, all) => `Learned ${n} of ${all}`,
      cardsNew: "New word",
      cardsAsk: "What is this word?",
      cardsFlip: "Flip the card",
      cardsGotIt: "Got it",
      cardsKnew: "I knew it",
      cardsNotYet: "Not yet",
      cardsFlipHint: "Tap the card to flip it",
      cardsProgress: (i, n) => `Card ${i} of ${n}`,
      cardsNone: "No cards here right now",
      cardsNoneLead: "You've seen all these words today. Come back tomorrow, or pick another topic.",
      cardsDoneBig: "You finished the cards!",
      cardsScore: (s, n) => `You knew ${s} of ${n}`,
      cardsLearnedNow: (n) => (n === 1 ? "You learned a word!" : `You learned ${n} words!`),
      cardsTomorrow: (n) => (n ? `Tomorrow ${n === 1 ? "1 card is" : `${n} cards are`} waiting.` : "Tomorrow new words are waiting."),
      cardsMore: "More cards",
      cardsBack: "Back to word cards",
      cardsVocabLink: "Learn the words on cards",
      chatTitle: "Chat with the bot",
      chatTitleEn: "",
      chatLead: ["The bot talks with you in English.", "Each time, choose what to answer.", "There are easy, medium and advanced chats."],
      chatBack: "Back to the chats",
      chatBot: "Robo",
      chatMe: "Me",
      chatLevels: ["Easy chats", "Medium chats", "Advanced chats"],
      chatWrong: "That doesn't fit the chat.",
      chatGo: "Chat",
      dayLetters: ["S", "M", "T", "W", "T", "F", "S"],
      speakMic: "Record",
      speakTap: "Click the microphone and say the word",
      speakListening: "Listening… say the word",
      speakHeard: "We heard:",
      speakAgain: (n) => (n === 1 ? "Try again. One try left." : `Try again. ${n} tries left.`),
      speakNoSound: "We didn't hear anything. Click again and speak close to the phone.",
      speakNoMic: "The microphone needs your OK. Click the lock next to the address and allow \"Microphone\".",
      speakOffline: "Checking speech needs the internet. Check the connection and try again.",
      speakNoSupport: "This browser can't hear speech. Try Chrome.",
      speakSkip: "Skip this word",
      speakAnswer: "You say:",
      speakRight: "Great! You said it right:",
      mistakesSaved: "Your mistakes were saved to your review, so you can practice them another time too.",
      reviewPictureInstr: "What's in the picture? Choose the right word.",
      reviewPairInstr: "What matches? Choose the right answer.",
      examTitle: "Exam",
      examsLead: "Reading exams like in class: a passage in English and every kind of question, with a timer. Answer everything, hand it in, and only then see your grade and the right answers.",
      examHow: [
        "You can move between the questions and change answers until you hand it in.",
        "Your answers are saved, and the timer keeps running when you leave the exam.",
        "At the end: a grade, a breakdown by question type and a check of every answer.",
      ],
      examMeta: (w, q, m) => `${w} words · ${q} questions · ${m} minutes`,
      examBest: (g) => `Your best grade: ${g}`,
      examFactTime: (m) => `${m} minutes`,
      examFactQuestions: (n) => `${n} questions`,
      examFactWords: (n) => `${n} words`,
      examRules: [
        "Read the passage and answer the questions. The passage stays on the screen the whole time.",
        "You can move between the questions and change answers until you hand the exam in.",
        "When the time is up, the exam is handed in by itself.",
      ],
      examRulesHe: "Answer the open questions in Hebrew.",
      examRulesEn: "Answer the open questions in English.",
      examStart: "Start the exam",
      examStartUntimed: "Without a timer",
      examResume: "Continue the exam",
      examRestart: "Start over",
      examResumeNote: (time) => `You started this exam. ${time ? `${time} left.` : ""}`,
      examTimeLeft: (time) => `${time} left`,
      examElapsed: (time) => `${time} so far`,
      examNavLabel: "Go to a question",
      examQuestionLabel: (i, answered) => `Question ${i}${answered ? " (answered)" : ""}`,
      examPrev: "Previous",
      examNext: "Next",
      examSubmit: "Hand in",
      examConfirmTitle: "Hand in the exam?",
      examConfirmMissing: (n) => (n === 1 ? "1 question has no answer yet." : `${n} questions have no answer yet.`),
      examConfirmAll: "You answered every question.",
      examConfirmNote: "After you hand it in, you can't change your answers.",
      examConfirmYes: "Yes, hand it in",
      examConfirmNo: "Back to the exam",
      examTimeUp: "Time is up, so the exam was handed in.",
      examTypes: {
        mc: "Multiple choice",
        tf: "True / false",
        open: "Open questions",
        complete: "Complete the sentence",
        word: "Vocabulary",
        multi: "Choose two answers",
        quote: "Quote from the text",
        sequence: "Order of events",
      },
      examTypeOne: {
        mc: "Multiple choice",
        tf: "True / false",
        open: "Open question",
        complete: "Complete the sentence",
        word: "Vocabulary",
        multi: "Choose two answers",
        quote: "Quote from the text",
        sequence: "Order of events",
      },
      examPickTwo: (n) => `Choose ${n} answers.`,
      examPickedMax: (n) => `You already chose ${n}. To change, first click an answer you chose.`,
      examQuoteNone: "No sentence chosen yet.",
      examQuoteChosen: "The sentence you chose:",
      examQuoteClear: "Clear the choice",
      examQuotePick: "Choose a sentence in the text",
      examSequenceHow: "Click the events in the order they happened. Click again to undo.",
      examSequenceClear: "Start the order over",
      examCompleteHow: "Complete the sentence in English.",
      examWordHow: "Type the English word as it is written in the text.",
      examGrade: "Your exam grade",
      examTimeUsed: (time) => `Time: ${time}`,
      examByType: "By question type",
      examReview: "Your answers",
      examYours: "Your answer:",
      examRight: "The right answer:",
      examModel: "Sample answer:",
      examNoAnswer: "Not answered",
      examPartial: "Half a point",
      examRetake: "Take it again",
      examAll: "All exams",
      examPassage: "The text",
      examBackToResults: "Back to the results",
      examLink: "Want to test yourself in a real exam, with a timer?",
      examLinkGo: "To the reading exams",
      paragraph: (n) => `Paragraph ${n}`,
      minutesSeconds: (m, s) => `${m}:${String(s).padStart(2, "0")}`,
    },
  };

  // On a subject page the answer is typed in Hebrew or as a number.
  if (SUBJECT) {
    STR.he.helpTips.write = "כותבים את התשובה ולוחצים על „בדיקה” (או על Enter).";
    STR.en.helpTips.write = "Type the answer and click “Check” (or press Enter).";
  }

  const ICONS = {
    download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="m7 11 5 5 5-5"/><path d="M4 21h16"/></svg>`,
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
    // A word with a speech bubble over it: "what does this word mean?"
    wordMeaning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 2.5h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-5l-2 2.5-2-2.5H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z"/><path d="M8 6.5h8M8 9.5h5"/><path d="M3 18.5h4M10 18.5h4M17 18.5h4M3 21.5h6"/></svg>`,
    highlighter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 15 7.5-7.5a2.1 2.1 0 0 0-3-3L6 12l-1 4 4-1Z"/><path d="M4 20h7"/></svg>`,
    play: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M10 8.5v7l5.5-3.5L10 8.5Z" fill="currentColor"/></svg>`,
    stop: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor"/></svg>`,
    info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="5.5" r="1.4" fill="currentColor" stroke-width="1.6"/><path d="M12 11v8.5"/></svg>`,
    arrowDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v15M6 13l6 6 6-6"/></svg>`,
    toc: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6h12M9 12h12M9 18h12"/><circle cx="4" cy="6" r="1.2" fill="currentColor"/><circle cx="4" cy="12" r="1.2" fill="currentColor"/><circle cx="4" cy="18" r="1.2" fill="currentColor"/></svg>`,
    chevron: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>`,
  };
  ICONS.print = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/></svg>`;
  ICONS.spinner = `<svg class="eng-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke-opacity="0.25"/><path d="M21 12a9 9 0 0 0-9-9"/></svg>`;
  ICONS["pick-picture"] = ICONS.picture;
  ICONS["find-error"] = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5M8 8.5l5 4M13 8.5l-5 4"/></svg>`;
  ICONS["sentence-choice"] = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="3.5" width="19" height="5" rx="2"/><rect x="2.5" y="10" width="19" height="5" rx="2"/><path d="M5.5 6h10M5.5 12.5h7"/><path d="m3.5 19.5 2 2 4-4M12 19.5h8"/></svg>`;
  ICONS.letters = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="6" width="9" height="12" rx="2"/><rect x="13" y="6" width="9" height="12" rx="2"/><path d="m4.5 15 2-6 2 6M5.2 13h2.6M15.5 9h2.2a1.5 1.5 0 0 1 0 3h-2.2V9Zm0 3h2.6a1.5 1.5 0 0 1 0 3h-2.6v-3Z"/></svg>`;
  ICONS.dictation = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8v5h3l4 4V4L6 8H3Z"/><path d="M13.5 8.5a4 4 0 0 1 0 4"/><path d="M14 21h3l5-5-3-3-5 5v3Z"/></svg>`;
  ICONS.trophy = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 4h10v5a5 5 0 0 1-10 0V4Z"/><path d="M7 6H4v1.5A3.5 3.5 0 0 0 7.5 11M17 6h3v1.5a3.5 3.5 0 0 1-3.5 3.5M12 14v3.5M8 21h8M9.5 17.5h5l.5 3.5H9l.5-3.5Z"/></svg>`;
  ICONS.slow = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 5V4L8 9H4Z"/><path d="M16.5 10v4M20 10v4"/></svg>`;
  // A clipboard with a checked line and a clock: a timed exam.
  ICONS.exam = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 4H6.5A1.5 1.5 0 0 0 5 5.5v14A1.5 1.5 0 0 0 6.5 21H11"/><path d="M15 4h2.5A1.5 1.5 0 0 1 19 5.5V11"/><rect x="9" y="2.5" width="6" height="3" rx="1"/><path d="m8 10 1.5 1.5L12 9M8 15h3"/><circle cx="17.5" cy="17.5" r="4"/><path d="M17.5 15.6v2l1.3 1"/></svg>`;
  // Two arrows going round: practice it again.
  ICONS.review = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 0 0-14.3-4.9L4 8"/><path d="M4 3.5V8h4.5"/><path d="M4 13a8 8 0 0 0 14.3 4.9L20 16"/><path d="M20 20.5V16h-4.5"/></svg>`;
  ICONS.clock = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`;
  // An exercise's status on its card: a checked circle, a half-full one.
  ICONS.statusDone = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="currentColor"/><path d="m7 12.5 3.3 3.3L17 9" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  ICONS.statusProgress = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" stroke-width="3"/><path d="M12 6a6 6 0 0 1 0 12Z" fill="currentColor"/></svg>`;
  ICONS.palette = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18c1.3 0 2.1-.9 2.1-2 0-.6-.3-1-.6-1.4-.3-.4-.6-.9-.6-1.5 0-1.1.9-2 2-2h2.3A4.8 4.8 0 0 0 21 9.3C21 5.8 17 3 12 3Z"/><circle cx="7.5" cy="11.5" r="1.1" fill="currentColor"/><circle cx="9.5" cy="7.2" r="1.1" fill="currentColor"/><circle cx="14.5" cy="7.2" r="1.1" fill="currentColor"/></svg>`;
  ICONS.settings = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2ZM15 12a3 3 0 1 0-6 0 3 3 0 1 0 6 0Z" fill-rule="evenodd"/></svg>`;
  // Two Hebrew letters: the "how it sounds in Hebrew letters" switch.
  ICONS.sayHe = `<svg viewBox="0 0 24 24" aria-hidden="true"><text x="12" y="17.5" text-anchor="middle" direction="rtl" font-family="Arial, sans-serif" font-size="14" font-weight="800" fill="currentColor">אב</text></svg>`;
  // A spiral notebook with the exercise's level on its page: every practice
  // exercise card on a topic page.
  const exerciseIcon = (level) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="2.5" width="15" height="19" rx="2.5"/><path d="M3 7h4M3 12h4M3 17h4"/><text class="eng-ex-num" x="13" y="16.4" text-anchor="middle">${level}</text></svg>`;
  ICONS.mic = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2.5" width="6" height="12" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7"/></svg>`;
  ICONS.speak = ICONS.mic;
  // A flame: the daily challenge's streak.
  ICONS.flame = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22c4.1 0 7-2.8 7-6.8 0-3.6-2.3-6-4.1-8.2-.4 2-1.4 3.3-2.6 3.8.3-3.1-1-6.3-3.8-8.3.1 3.2-1.6 5.4-3.2 7.4C4.2 11.5 5 13.6 5 15.2 5 19.2 7.9 22 12 22Z"/><path d="M12 22c-1.7 0-3-1.3-3-3 0-1.8 1.4-3 2.2-4.3.5 1 1.3 1.6 2 1.8.4-1 .3-2 0-3 1.4 1.1 2.8 2.8 2.8 4.9 0 2.1-1.6 3.6-4 3.6Z"/></svg>`;
  // A medal on its ribbon: the class leaderboard.
  ICONS.medal = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.5 2.5 10.6 9.2M16.5 2.5l-3.1 6.7"/><circle cx="12" cy="15" r="6"/><path d="m12 11.8 1 2 2.2.3-1.6 1.5.4 2.2-2-1.1-2 1.1.4-2.2-1.6-1.5 2.2-.3Z" fill="currentColor" stroke-width="1"/></svg>`;
  // The same two in colour, for the buttons on top: a red flame with a
  // yellow heart, a gold medal on a red and a blue ribbon.
  ICONS.flameColor = `<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22c4.1 0 7-2.8 7-6.8 0-3.6-2.3-6-4.1-8.2-.4 2-1.4 3.3-2.6 3.8.3-3.1-1-6.3-3.8-8.3.1 3.2-1.6 5.4-3.2 7.4C4.2 11.5 5 13.6 5 15.2 5 19.2 7.9 22 12 22Z" fill="#ff5a36"/><path d="M12 22c-1.7 0-3-1.3-3-3 0-1.8 1.4-3 2.2-4.3.5 1 1.3 1.6 2 1.8.4-1 .3-2 0-3 1.4 1.1 2.8 2.8 2.8 4.9 0 2.1-1.6 3.6-4 3.6Z" fill="#ffd93b"/></svg>`;
  ICONS.medalColor = `<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18.5 1.8H14l-3.6 7.7h4.5Z" fill="#2fb5ff"/><path d="M5.5 1.8H10l3.6 7.7H9.1Z" fill="#ff4d5e"/><circle cx="12" cy="15.5" r="6.4" fill="#ffd23f"/><circle cx="12" cy="15.5" r="4.4" fill="#ffae00"/><path d="m12 12.3 1 2 2.2.3-1.6 1.5.4 2.2-2-1.1-2 1.1.4-2.2-1.6-1.5 2.2-.3Z" fill="#fff6c9" stroke-width="1.1"/></svg>`;
  ICONS.flag = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/></svg>`;
  // Two cards, one tilted behind the other: the word cards.
  // Robo, the chat bot (english-chat.js), and the student he talks with.
  ICONS.robo = `<svg viewBox="0 0 48 48" stroke="#000" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M24 4v6" fill="none"/><circle cx="24" cy="4.5" r="2.6" fill="#ff5a6e"/><rect x="7" y="10" width="34" height="27" rx="9" fill="#7fd8ff"/><rect x="12.5" y="16" width="23" height="13" rx="6.5" fill="#eaf5ff"/><circle cx="19.5" cy="22.5" r="2.6" fill="#000" stroke="none"/><circle cx="28.5" cy="22.5" r="2.6" fill="#000" stroke="none"/><path d="M20.5 33h7" fill="none"/><path d="M7 21H4v8h3M41 21h3v8h-3" fill="#ffd23f"/><path d="M14 37v3.5h20V37" fill="#7fd8ff"/></svg>`;
  ICONS.me = `<svg viewBox="0 0 48 48" stroke="#000" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 44c0-9 7-14 16-14s16 5 16 14Z" fill="#ffd23f"/><circle cx="24" cy="18" r="10" fill="#ffd9b0"/><path d="M14.2 16.5c1-6 5-9 9.8-9s9 3 9.8 9c-3-1.6-7-2.4-9.8-5-2.8 2.6-6.8 3.4-9.8 5Z" fill="#6b4a2b"/><circle cx="20.3" cy="19.5" r="1.4" fill="#000" stroke="none"/><circle cx="27.7" cy="19.5" r="1.4" fill="#000" stroke="none"/><path d="M21 23.6c1.8 1.4 4.2 1.4 6 0" fill="none"/></svg>`;
  ICONS.chatColor = `<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 5.5A2.5 2.5 0 0 1 5.5 3h9A2.5 2.5 0 0 1 17 5.5v5a2.5 2.5 0 0 1-2.5 2.5H9l-4 3.5V13h.5A2.5 2.5 0 0 1 3 10.5Z" fill="#ffffff"/><path d="M19 8.5h.5A2.5 2.5 0 0 1 22 11v4.5a2.5 2.5 0 0 1-2.5 2.5H19v3l-3.6-3H12a2.5 2.5 0 0 1-2.5-2.5V15" fill="#ffd23f"/><circle cx="7" cy="8" r="1" fill="currentColor" stroke="none"/><circle cx="10" cy="8" r="1" fill="currentColor" stroke="none"/><circle cx="13" cy="8" r="1" fill="currentColor" stroke="none"/></svg>`;
  ICONS.cards = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m8.5 3.6 9.2 2.5a1.6 1.6 0 0 1 1.1 2L15.6 20"/><rect x="3.5" y="6.5" width="11" height="15" rx="1.8"/><path d="M6.5 11h5M6.5 14h3.5"/></svg>`;

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

  // Cards name a passage in Hebrew; the reading screen keeps the English title.
  function passageTitle(ex) {
    return (lang() === "he" && ex.passage.titleHe) || ex.passage.title;
  }

  function esc(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // A question, an answer, an option or a match card: English as it is, or on
  // a subject page Hebrew where "$...$" is math and {a|b} a fraction — or
  // plain math ("x = 4", "6 × 7 = 42"), which reads left to right. Drawn by
  // ready-lessons.js, like the lessons.
  function aHtml(str) {
    return SUBJECT && window.ReadyLessons?.autoHtml ? window.ReadyLessons.autoHtml(String(str ?? "")) : esc(str);
  }
  const qHtml = aHtml;

  // Plain text for the teacher's page: no math marks.
  function plainText(str) {
    if (!SUBJECT) return str;
    return String(str ?? "")
      .replace(/\{([^{}|]*)\|([^{}]*)\}/g, "$1/$2")
      .replace(/√\{([^{}]*)\}/g, "√$1")
      .replace(/\$|\*\*/g, "");
  }

  // A subject question's drawing (lesson-figures.js) and its big math line,
  // where "___" is the blank (`blank`: what goes there).
  function figHtml(q) {
    const draw = q?.fig && window.LESSON_FIGURES?.[q.fig.kind];
    return draw ? `<div class="eng-fig${draw.tall ? " eng-fig--tall" : ""}">${draw(q.fig)}</div>` : "";
  }

  function mathLineHtml(q, blank = "") {
    if (!q?.math || !window.ReadyLessons?.mathHtml) return "";
    const parts = window.ReadyLessons.mathHtml(q.math).split("___");
    return `<span class="eng-math-line" dir="ltr">${parts.length < 2 ? parts[0] : `${parts[0]}${blank}${parts.slice(1).join("___")}`}</span>`;
  }

  // Each sentence of an explanation is a point of its own, so it gets its own
  // line. "e.g." and a "Listen! —" mid-sentence don't end one.
  function byLine(text, toHtml = esc) {
    return String(text ?? "")
      .split(/(?<=[.!?])(?<!\be\.g\.)\s+(?![—-])/)
      .map(toHtml)
      .join("<br>");
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
    return v ? { word: id, en: v.en, he: v.he, say: sayOf(v.en), img: imgUrl(v.img || id), accept: v.accept || [] } : null;
  }

  // How an English vocabulary word sounds, in Hebrew letters ("" if unknown).
  function sayOf(en) {
    return window.ENGLISH_SAY?.[String(en || "").trim().toLowerCase()] || "";
  }

  // Typed answers: ignore case, extra spaces, trailing punctuation and
  // curly/backtick apostrophes that phone keyboards insert.
  function normalize(str) {
    const out = String(str || "")
      .toLowerCase()
      .replace(/[’‘`´]/g, "'")
      .replace(/\s+/g, " ")
      .replace(/[.!?]+$/, "")
      .trim();
    // A subject answer: a long minus or a dash is a minus, "1,000" is 1000,
    // spaces and Hebrew vowel marks don't count.
    if (!SUBJECT) return out;
    return out
      .replace(/[−–]/g, "-")
      .replace(/(\d),(?=\d{3}\b)/g, "$1")
      .replace(/[֑-ׇ]/g, "")
      .replace(/\s+/g, "");
  }

  // Two typed numbers that are the same number ("2.50" and "2.5").
  function sameNumber(a, b) {
    const num = (s) => (/^-?\d*\.?\d+$/.test(s) ? Number(s) : NaN);
    const x = num(normalize(a));
    const y = num(normalize(b));
    return !Number.isNaN(x) && !Number.isNaN(y) && Math.abs(x - y) < 1e-9;
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

  function canSpeak() {
    return window.PleyiSpeech.canSpeak();
  }

  function speak(text, rate) {
    window.PleyiSpeech.say(text, rate);
  }

  function speakBtn(text, extraClass = "") {
    if (!canSpeak()) return "";
    return `<button type="button" class="eng-speak ${extraClass}" data-say="${esc(text)}" aria-label="${esc(t("speakWord", text))}">${ICONS.listen}</button>`;
  }

  /* ── Runner preferences (sound effects, translation) ── */

  // "-v2": sounds start on again for everyone, even after an old "off".
  const SOUND_KEY = "pleyi-english-sound-v2";
  const TRANSLATE_KEY = "pleyi-english-translate";
  // Reading passages: click a word to see it in Hebrew; questions in Hebrew.
  const WORDS_KEY = "pleyi-english-read-words";
  const HE_QUESTIONS_KEY = "pleyi-english-read-he";
  // Vocabulary words: how each one sounds, in Hebrew letters.
  const SAY_KEY = "pleyi-english-say";
  // The question card's color. Light colors only, so the black text and the
  // white answer buttons keep their contrast.
  const CARD_COLOR_KEY = "pleyi-english-card-color";
  const CARD_COLORS = [
    { id: "white", he: "לבן", en: "White" },
    { id: "mint", he: "מנטה", en: "Mint" },
    { id: "sky", he: "שמיים", en: "Sky" },
    { id: "lavender", he: "לבנדר", en: "Lavender" },
    { id: "pink", he: "ורוד", en: "Pink" },
    { id: "peach", he: "אפרסק", en: "Peach" },
    { id: "lemon", he: "לימון", en: "Lemon" },
    { id: "sand", he: "חול", en: "Sand" },
  ];

  // Default: a soft sky blue, not white. A saved choice (white too) wins.
  const DEFAULT_CARD_COLOR = "sky";

  function readCardColor() {
    try {
      const id = localStorage.getItem(CARD_COLOR_KEY);
      return CARD_COLORS.some((c) => c.id === id) ? id : DEFAULT_CARD_COLOR;
    } catch {
      return DEFAULT_CARD_COLOR;
    }
  }

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
    words: readFlag(WORDS_KEY, false),
    heQuestions: readFlag(HE_QUESTIONS_KEY, false),
    say: readFlag(SAY_KEY, false),
    cardColor: readCardColor(),
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
    // Vocabulary games (english-games.js): a soft swish for turning a memory
    // card, and a burst with a bright ring for popping a balloon.
    flip: [{ freq: 520, to: 820, dur: 0.09, type: "triangle", vol: 0.08 }],
    pop: [
      { freq: 1500, to: 260, dur: 0.08, type: "square", vol: 0.06, filter: 2600 },
      { freq: 988, at: 0.05, dur: 0.16, type: "triangle", vol: 0.14 },
      { freq: 1319, at: 0.11, dur: 0.24, type: "triangle", vol: 0.12 },
    ],
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
    // Practice screens get the soft, flat look (no black outlines); the game
    // and word-card shells take it off again.
    document.documentElement.classList.toggle("eng-soft", name === "exercise");
    // The flame and the medal on top show on the topics page only.
    document.documentElement.classList.toggle("eng-topics-open", name === "topics");
    settingsOpen = false;
    $("#engBarBack")?.replaceChildren();
  }

  // A topic page's back arrow moves up into the top bar, on one row with the
  // sign-in button, instead of taking a row of its own above the title.
  function dockBack() {
    const back = $(".eng-topic-head > .eng-back", views.topic());
    if (back) $("#engBarBack")?.replaceChildren(back);
  }

  // The topics page has no page above it here, so its arrow leaves to the
  // site, or to the personal area of a student who came through their link.
  function dockSiteBack() {
    const bar = $("#engBarBack");
    const home = window.StudentProgress?.fromLink() ? window.StudentProgress.homeUrl() : null;
    const label = t(home ? "backToHomework" : "backToSite");
    if (bar) bar.innerHTML = `<a class="eng-back" href="${esc(home || "/")}" aria-label="${esc(label)}" title="${esc(label)}">${ICONS.back}</a>`;
  }

  // Shown when this tab came through a student's personal link: the page
  // title becomes a hello with the student's name (the fox stays perched on
  // it), the student's menu on top, and no sign-in button or user circle.
  // A visit through the site gets none of these, even on a device that once
  // opened a student's link.
  async function renderStudentBar() {
    const student = window.StudentProgress?.fromLink() ? await window.StudentProgress.profile() : null;
    document.documentElement.classList.toggle("eng-student-linked", !!student);
    renderTopMenu(!!student);
    const line = $("#engHero .hero-title .line");
    if (!student || !line) return;
    // No data-i18n: a language switch would bring the old title back.
    line.removeAttribute("data-i18n");
    line.textContent = t("hello", student.name);
  }

  /* ── The student's menu on top, for a student who came through their
     link only: a medal that opens the class leaderboard (leaderboard.js), a
     flame that leads to the daily challenge's page, and the chat. ── */

  function renderTopMenu(linked) {
    if (SUBJECT) return;
    if (!linked) {
      $("#engTopMenu")?.remove();
      return;
    }
    let menu = $("#engTopMenu");
    if (!menu) {
      menu = document.createElement("div");
      menu.id = "engTopMenu";
      menu.className = "eng-top-menu";
      $("#engBarBack")?.after(menu);
    }
    const board = linked && window.Leaderboard;
    menu.innerHTML = `
      ${board ? `<button type="button" class="eng-top-btn eng-top-btn--medal" id="engTopBoard" aria-haspopup="dialog" aria-label="${esc(t("leaderboard"))}" title="${esc(t("leaderboard"))}">${ICONS.medalColor}</button>` : ""}
      <button type="button" class="eng-top-btn eng-top-btn--daily" id="engTopDaily" aria-label="${esc(t("dailyTitle"))}" title="${esc(t("dailyTitle"))}">${ICONS.flameColor}</button>
      ${window.ENGLISH_CHATS?.length ? `<button type="button" class="eng-top-btn eng-top-btn--chat" id="engTopChat" aria-label="${esc(t("chatTitle"))}" title="${esc(t("chatTitle"))}">${ICONS.chatColor}</button>` : ""}`;
    if (board) $("#engTopBoard").addEventListener("click", () => window.Leaderboard.open({ top: certNewsHtml() }));
    $("#engTopDaily").addEventListener("click", () => {
      location.hash = DAILY_ROUTE;
    });
    $("#engTopChat")?.addEventListener("click", () => {
      location.hash = CHAT_ROUTE;
    });
    refreshTopDaily();
    refreshTopBoard();
  }

  // A red dot on the medal, and the medal shaking, while a certificate the
  // student earned waits unseen on their page (/s/<key>#prizes, which marks
  // it seen). `fresh`: ask the server again, after practice that may have
  // earned one.
  let newCerts = [];

  async function refreshTopBoard(fresh = false) {
    if (!$("#engTopBoard")) return;
    const student = await window.StudentProgress.profile({ fresh });
    const btn = $("#engTopBoard");
    if (!btn || !student) return;
    newCerts = window.StudentProgress.newCertificates(student);
    const has = newCerts.length > 0;
    btn.classList.toggle("has-new", has);
    btn.setAttribute("aria-label", has ? `${t("leaderboard")} — ${t("newCertLabel")}` : t("leaderboard"));
    btn.querySelector(".eng-top-btn-dot")?.remove();
    if (has) btn.insertAdjacentHTML("beforeend", `<i class="eng-top-btn-dot" aria-hidden="true"></i>`);
  }

  // Over the leaderboard, while a certificate is new: the way to it.
  function certNewsHtml() {
    const home = window.StudentProgress?.homeUrl();
    if (!newCerts.length || !home) return "";
    return `
      <a class="eng-cert-news" href="${esc(home)}#prizes">
        <span class="eng-cert-news-icon">${ICONS.medalColor}</span>
        <span class="eng-cert-news-text">
          <b>${esc(t("newCert"))}</b>
          <span>${esc(t("newCertGo"))}</span>
        </span>
      </a>`;
  }

  // A check on the flame once today's challenge is done.
  async function refreshTopDaily() {
    const btn = $("#engTopDaily");
    if (!btn) return;
    const view = await dailyState();
    btn.classList.toggle("is-done", view.doneToday);
    btn.querySelector(".eng-top-btn-check")?.remove();
    if (view.doneToday) btn.insertAdjacentHTML("beforeend", `<i class="eng-top-btn-check" aria-hidden="true">${ICONS.check}</i>`);
  }

  /* ── "My mistakes" (mistake-bank.js): a line on a topic's page, with how
     many questions wait for review. ── */

  function reviewStripHtml(topic) {
    const count = window.MistakeBank?.count(topic.id) || 0;
    if (!count) return "";
    return `
      <div class="eng-review-strip" id="engReviewStrip">
        <span class="eng-review-strip-icon">${ICONS.review}</span>
        <span class="eng-review-strip-text">${esc(t("reviewTopic", count))}</span>
        <a class="btn btn-candy font-cartoon eng-review-strip-go" href="#${REVIEW_ROUTE}/${esc(topic.id)}">${esc(t("reviewTopicGo"))}</a>
      </div>`;
  }

  // The topic grid is split into groups; a topic's `group` defaults to "grammar".
  // The first group opens the page, so it has no heading.
  const GROUPS = [
    { id: "grammar" },
    { id: "reading", title: "הבנת הנקרא", titleEn: "Reading comprehension" },
    { id: "vocab", title: "אוצר מילים", titleEn: "Vocabulary" },
  ];

  function topicGroup(topic) {
    return topic.group || "grammar";
  }

  // The learning path (english-data.js): the topics in teaching order, in
  // stages. When it is set, the topic grid shows it instead of the groups.
  const PATH = SUBJECT ? SUBJECT.path : window.ENGLISH_PATH || [];

  function pathTopics() {
    return PATH.flatMap((stage) => stage.topics).map(findTopic).filter(Boolean);
  }

  // The topic after this one on the path, for the "next topic" link.
  function nextPathTopic(topic) {
    const list = pathTopics();
    const i = list.indexOf(topic);
    return i >= 0 ? list[i + 1] || null : null;
  }

  function nextTopicHtml(topic) {
    const next = nextPathTopic(topic);
    if (!next) return "";
    return `
      <a class="eng-next-topic" href="#${esc(next.id)}">
        <span class="eng-next-topic-label">${esc(t("nextTopic"))}</span>
        <span class="eng-next-topic-title">${esc(loc(next, "title"))}</span>
        <span class="eng-next-topic-arrow" aria-hidden="true">${ICONS.back}</span>
      </a>`;
  }

  function readingUnits(topic) {
    return (topic.exercises || []).filter((ex) => ex.type === "reading");
  }

  // The reading exams (english-exams.js) and the "my mistakes" practice,
  // which lives at #my-mistakes (or #my-mistakes/<topic> for one topic).
  const EXAMS_TOPIC = "exams";
  const REVIEW_ROUTE = "my-mistakes";
  // The vocabulary topics sit behind one card, on their own page at #vocab.
  const VOCAB_ROUTE = "vocab";

  function vocabTopics() {
    return TOPICS.filter((topic) => topicGroup(topic) === "vocab");
  }

  // A plain square tile, like a topic's, with a picture from the first topic.
  function vocabCardHtml(topics) {
    const cover = topics.find((topic) => topic.cover)?.cover;
    const img = cover ? `<img class="eng-topic-img" src="${esc(imgUrl(cover))}" alt="" draggable="false" />` : "";
    const sub = lang() === "en" ? "" : `<span class="eng-topic-sub" dir="ltr">Vocabulary by topic</span>`;
    return `
      <article class="eng-topic-card">
        <a class="eng-topic-tile${img ? " has-img" : ""}" href="#${VOCAB_ROUTE}">
          ${img}
          <span class="eng-topic-title">${esc(t("vocabHub"))}</span>
          ${sub}
          <span class="font-cartoon eng-topic-open">${esc(t("open"))}${ICONS.back}</span>
        </a>
      </article>`;
  }

  function renderVocabHub() {
    const view = views.topic();
    if (!view) return;
    view.innerHTML = `
      <div class="eng-topic-head">
        <a class="eng-back" href="#" aria-label="${esc(t("back"))}" title="${esc(t("back"))}">${ICONS.back}</a>
        <h2 class="font-cartoon eng-topic-heading">${esc(t("vocabHub"))}</h2>
        ${lang() === "he" ? `<p class="eng-topic-heading-en" dir="ltr">Vocabulary by topic</p>` : ""}
      </div>
      ${SUBJECT ? "" : `<p class="eng-fc-vocab"><a class="btn btn-candy font-cartoon eng-fc-vocab-link" href="#${CARDS_ROUTE}">${ICONS.cards}<span>${esc(t("cardsVocabLink"))}</span></a></p>`}
      <div class="eng-topic-grid">${vocabTopics().map((topic, i) => topicTileHtml(topic, i + 1)).join("")}</div>`;
  }

  // `num`: the topic's place on the learning path, shown on the tile. Every
  // topic (reading and exams too) is a plain square tile.
  function topicTileHtml(topic, num) {
    const sub = lang() === "en" || !topic.titleEn ? "" : `<span class="eng-topic-sub" dir="ltr">${esc(topic.titleEn)}</span>`;
    const badge = num ? `<span class="eng-path-num" aria-hidden="true">${num}</span>` : "";
    const img = topic.cover ? `<img class="eng-topic-img" src="${esc(imgUrl(topic.cover))}" alt="" draggable="false" />` : "";
    return `
      <article class="eng-topic-card">
        <a class="eng-topic-tile${img ? " has-img" : ""}${badge ? " has-num" : ""}" href="#${esc(topic.id)}">
          ${badge}
          ${img}
          <span class="eng-topic-title">${esc(loc(topic, "title"))}</span>
          ${sub}
          <span class="font-cartoon eng-topic-open">${esc(t("open"))}${ICONS.back}</span>
        </a>
      </article>`;
  }

  // The path filters by grade (curriculum-grades.js through ready-lessons.js):
  // in a school subject a topic shows when one of its lessons is learned in
  // that grade; in English, by the topic's own grades. "?grade=7" keeps the
  // choice in the address. A student who came through their link sees the
  // whole path, with no filter.
  const GRADES = window.StudentProgress?.isLinked() ? null : window.ReadyLessons?.grades || null;
  let gradeFilter = GRADES ? GRADES.fromUrl() : "all";

  function topicGrades(topic) {
    if (!SUBJECT) return GRADES.englishTopic(topic.id);
    return [...new Set(topicLessonIds(topic).flatMap((id) => lessonById(id)?.schoolGrades || []))];
  }

  function topicInGrade(topic) {
    return gradeFilter === "all" || topicGrades(topic).includes(Number(gradeFilter));
  }

  // Only in an area where some topic is in the curriculum at all.
  function gradeBarHtml() {
    if (!GRADES || !pathTopics().some((topic) => topicGrades(topic).length)) return "";
    const options = ["all", ...Array.from({ length: GRADES.count }, (_, i) => String(i + 1))];
    const label = (grade) => (grade === "all" ? t("allGrades") : GRADES.name(Number(grade)));
    return `
      <div class="svc-filter-bar eng-grade-bar">
        <div class="svc-filter-dropdown">
          <button type="button" class="svc-filter-trigger" id="engGradeTrigger" aria-expanded="false" aria-controls="engGradeMenu">
            <span class="svc-filter-trigger-label">${esc(t("grade"))}</span>
            <span class="svc-filter-trigger-value">${esc(label(gradeFilter))}</span>
          </button>
          <ul class="svc-filter-menu hidden" id="engGradeMenu">
            ${options.map((grade) => `<li><button type="button" data-grade="${grade}"${grade === gradeFilter ? ' class="active"' : ""}>${esc(label(grade))}</button></li>`).join("")}
          </ul>
        </div>
      </div>`;
  }

  function bindGradeBar(grid) {
    const trigger = $("#engGradeTrigger", grid);
    const menu = $("#engGradeMenu", grid);
    if (!trigger || !menu) return;
    const close = () => {
      menu.classList.add("hidden");
      trigger.setAttribute("aria-expanded", "false");
      trigger.parentElement.classList.remove("is-open");
      document.removeEventListener("click", close);
    };
    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!menu.classList.contains("hidden")) return close();
      menu.classList.remove("hidden");
      trigger.setAttribute("aria-expanded", "true");
      trigger.parentElement.classList.add("is-open");
      document.addEventListener("click", close);
    });
    menu.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-grade]");
      if (!btn) return;
      close();
      gradeFilter = btn.dataset.grade;
      GRADES.setInUrl(gradeFilter);
      renderTopicGrid();
    });
  }

  // The path's stages with the topics the grade filter shows. A topic is
  // numbered over the whole path, so it keeps its number when the filter
  // hides others.
  function visiblePath() {
    let num = 0;
    return PATH.map((stage, i) => ({
      stage,
      stageNum: i + 1,
      topics: stage.topics
        .map(findTopic)
        .filter(Boolean)
        .map((topic) => ({ topic, num: ++num }))
        .filter(({ topic }) => topicInGrade(topic)),
    })).filter(({ topics }) => topics.length);
  }

  // The table of contents above the path: each stage opens to its topics and
  // their lessons. A topic opens its page; a lesson starts right away.
  function pathTocHtml(stages) {
    const lessonRow = (topic, id) => `
      <li><button type="button" class="eng-toc-lesson" data-toc-topic="${esc(topic.id)}" data-toc-lesson="${esc(id)}">${ICONS.slides}<span>${lessonTitleHtml(topic, id)}</span></button></li>`;
    const topicRow = ({ topic, num }) => {
      const lessons = topicLessonIds(topic).map((id) => lessonRow(topic, id)).join("");
      return `
        <li class="eng-toc-topic">
          <a class="eng-toc-topic-link" href="#${esc(topic.id)}"><span class="eng-toc-num">${num}</span><span>${esc(loc(topic, "title"))}</span></a>
          ${lessons ? `<ul class="eng-toc-lessons">${lessons}</ul>` : ""}
        </li>`;
    };
    return `
      <details class="eng-toc" id="engToc">
        <summary class="eng-toc-head">${ICONS.toc}<span>${esc(t("toc"))}</span><span class="eng-toc-chevron">${ICONS.chevron}</span></summary>
        <div class="eng-toc-body">
          ${stages.map(({ stage, stageNum, topics }) => `
            <details class="eng-toc-stage" name="eng-toc-stage">
              <summary class="eng-toc-stage-head"><span class="eng-path-stage-num">${esc(t("stage", stageNum))}</span><span class="eng-toc-stage-title">${esc(loc(stage, "title"))}</span><span class="eng-toc-chevron">${ICONS.chevron}</span></summary>
              <ol class="eng-toc-topics">${topics.map(topicRow).join("")}</ol>
            </details>`).join("")}
        </div>
      </details>`;
  }

  function bindPathToc(grid) {
    $$("[data-toc-lesson]", grid).forEach((btn) =>
      btn.addEventListener("click", () => openTopicLesson(findTopic(btn.dataset.tocTopic), btn.dataset.tocLesson))
    );
  }

  function renderTopicGrid() {
    const grid = $("#engTopicGrid");
    if (!grid) return;
    if (PATH.length) {
      const path = visiblePath();
      const stages = path.map(({ stage, stageNum, topics }) => `
        <div class="eng-topic-group eng-path-stage">
          <h2 class="eng-group-title eng-path-title"><span class="eng-path-stage-num">${esc(t("stage", stageNum))}</span>${esc(loc(stage, "title"))}</h2>
          <div class="eng-topic-grid">${topics.map(({ topic, num }) => topicTileHtml(topic, num)).join("")}</div>
        </div>`).join("");
      // A grade change redraws the grid; the contents stay open if they were.
      const tocOpen = $("#engToc", grid)?.open;
      grid.innerHTML = gradeBarHtml() + (stages ? pathTocHtml(path) + stages : `<p class="eng-grade-empty">${esc(t("noGradeTopics"))}</p>`);
      if (tocOpen) $("#engToc", grid).open = true;
      bindGradeBar(grid);
      bindPathToc(grid);
      return;
    }
    grid.innerHTML = GROUPS.map((group) => {
      const topics = TOPICS.filter((topic) => topicGroup(topic) === group.id);
      if (!topics.length) return "";
      const tiles = group.id === "vocab" ? vocabCardHtml(topics) : topics.map((topic) => topicTileHtml(topic)).join("");
      return `
        <div class="eng-topic-group">
          ${group.title ? `<h2 class="eng-group-title">${esc(loc(group, "title"))}</h2>` : ""}
          <div class="eng-topic-grid">${tiles}</div>
        </div>`;
    }).join("");
  }

  // A topic's slide lessons: `lessons` (split into short numbered lessons)
  // or its one `lesson`.
  function topicLessonIds(topic) {
    const catalog = window.ReadyLessons?.catalog || {};
    return (topic.lessons || (topic.lesson ? [topic.lesson] : [])).filter((id) => catalog[id]);
  }

  function lessonById(id) {
    const raw = id && window.ReadyLessons?.catalog?.[id];
    if (!raw) return null;
    return window.ReadyLessons.localize ? window.ReadyLessons.localize(raw) : raw;
  }

  // The card title: "שיעור 2 – לא ושאלות" for a numbered lesson, else its name.
  function lessonTitleHtml(topic, id) {
    const ids = topicLessonIds(topic);
    const lesson = lessonById(id);
    if (ids.length < 2) return esc(lesson.namePart || lesson.name);
    const num = t("lessonNum", ids.indexOf(id) + 1);
    return lesson.partTitle ? `${esc(num)} – ${mixedText(lesson.partTitle)}` : esc(num);
  }

  function lessonLevel(topic) {
    return window.ENGLISH_LESSON_LEVELS?.[topic.id] || 1;
  }

  // The lesson's screen icon with its level written on the screen.
  function lessonIconHtml(level) {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M12 17v3M8 20h8"/><text x="12" y="10.3" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="900" fill="currentColor" stroke="none">${level}</text></svg>`;
  }

  function levelLabel(level) {
    return `${t("level", level)} · ${t("levelName", level)}`;
  }

  // The info dialog's facts (level, size), each in its own small tag.
  function factsHtml(facts) {
    return facts.map((fact) => `<span class="eng-help-fact">${esc(fact)}</span>`).join("");
  }

  // Practice exercises have levels 1–3 (english-more.js); reading passages
  // and exams 1–4.
  function exerciseLevel(ex) {
    if (ex.type === "reading" || ex.type === "exam") return ex.level || 1;
    return Math.min(3, Math.max(1, ex.level || window.ENGLISH_TYPE_LEVEL?.[ex.type] || 1));
  }

  function exerciseCountLabel(ex) {
    if (ex.type === "match") return ex.pairs ? t("pairs", ex.pairs.length) : t("words", ex.words.length);
    // Picture true / false asks about every word twice.
    if (ex.questions?.[0]?.img) return t("words", new Set(ex.questions.map((q) => q.word)).size);
    if (ex.words) return t("words", ex.words.length);
    return t(SUBJECT ? "questionsCount" : "sentences", ex.questions.length);
  }

  function passageWordCount(ex) {
    return ex.passage.text
      .join(" ")
      .split(/\s+/)
      .filter((w) => /[A-Za-z0-9]/.test(w)).length;
  }

  // A reading library card: the passage title, its level and how hard that is.
  // The cards are not links themselves: their title link stretches over the
  // whole card, so the "i" help button can sit inside without nesting a
  // button in a link.
  function levelCardHtml(topic, ex, best, started) {
    const record = best[`${topic.id}/${ex.id}`];
    const bars = [1, 2, 3, 4].map((n) => `<i${n <= ex.level ? ' class="is-on"' : ""}></i>`).join("");
    return `
      <div class="eng-level-card eng-level-card--${ex.level} is-library">
        <span class="eng-level-head">
          <span class="eng-level-name">${esc(t("level", ex.level))}</span>
          <span class="eng-level-bars" role="img" aria-label="${esc(t("levelName", ex.level))}">${bars}</span>
          ${infoBtnHtml(ex)}
        </span>
        <a class="eng-level-title eng-card-link" href="#${esc(topic.id)}/${esc(ex.id)}" dir="auto">${esc(passageTitle(ex))}</a>
        <span class="eng-level-meta">${esc(t("readingMeta", passageWordCount(ex), ex.questions.length))}</span>
        ${statusHtml(exerciseStatus(topic, ex, best, started))}
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
    const card = (link, title) => `
      <div class="eng-ex-card eng-ex-card--print">
        <span class="eng-ex-icon">${ICONS.print}</span>
        <span class="eng-ex-text">
          <a class="eng-ex-title eng-card-link" href="${esc(link)}">${esc(title)}</a>
        </span>
        <span class="eng-item-action" aria-hidden="true">${esc(t("printAction"))}</span>
      </div>`;
    const sheets = pack.sheets.map((sheet, i) => card(href(sheet.id), `${t("printSheet", i + 1)} · ${loc(sheet, "title")}`)).join("");
    return sheets + card(href(null), t("printAll"));
  }

  /* ── Vocabulary games (english-games.js) — on the picture-vocabulary topics,
     with the words their picture exercises use. ── */

  const GAME_EXERCISE_TYPES = ["picture", "pick-picture", "listen", "match"];

  function gameWords(topic) {
    const games = window.EnglishGames;
    if (!games || !topic || (topicGroup(topic) !== "vocab" && topic.id !== "vocabulary")) return [];
    const ids = new Set();
    (topic.exercises || []).forEach((ex) => {
      if (GAME_EXERCISE_TYPES.includes(ex.type)) (ex.words || []).forEach((id) => ids.add(id));
    });
    const words = games.usable([...ids].map(wordItem));
    return words.length >= games.MIN_WORDS ? words : [];
  }

  function findGame(topic, id) {
    const gameId = /^game-(.+)$/.exec(id || "")?.[1];
    const game = gameId ? window.EnglishGames.find(gameId) : null;
    return game && window.EnglishGames.fits(game, gameWords(topic)) ? game : null;
  }

  // One on one or group survival with the topic's words (/together). Off
  // for now, like the page itself (lib/together.js ENABLED).
  const TOGETHER_ON = false;
  const TOGETHER_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6.5" cy="7" r="3"/><circle cx="17.5" cy="7" r="3"/><path d="M1.5 20v-1.5A4.5 4.5 0 0 1 6 14h1a4.5 4.5 0 0 1 4.5 4.5V20M12.5 20v-1.5A4.5 4.5 0 0 1 17 14h1a4.5 4.5 0 0 1 4.5 4.5V20"/></svg>`;

  function togetherCardHtml(topic) {
    if (!TOGETHER_ON) return "";
    const category = /^vocab-(.+)$/.exec(topic.id)?.[1];
    const href = category ? `/together?topic=${encodeURIComponent(category)}` : "/together";
    return `
      <div class="eng-ex-card eng-ex-card--game eng-ex-card--game-together">
        <span class="eng-ex-icon">${TOGETHER_ICON}</span>
        <span class="eng-ex-text">
          <a class="eng-ex-title eng-card-link" href="${esc(href)}">${esc(t("playTogether"))}</a>
        </span>
        <span class="eng-item-action" aria-hidden="true">${esc(t("playGame"))}</span>
      </div>`;
  }

  function gameCardsHtml(topic) {
    const words = gameWords(topic);
    if (!words.length) return "";
    const games = window.EnglishGames;
    return games
      .listFor(words)
      .map((game) => {
        const best = games.bestText(topic.id, game.id);
        return `
          <div class="eng-ex-card eng-ex-card--game eng-ex-card--game-${esc(game.id)}">
            <span class="eng-ex-icon">${game.icon}</span>
            <span class="eng-ex-text">
              <a class="eng-ex-title eng-card-link" href="#${esc(topic.id)}/game-${esc(game.id)}">${esc(loc(game, "title"))}</a>
              ${best ? `<span class="eng-ex-best">${esc(best)}</span>` : ""}
            </span>
            <span class="eng-item-action" aria-hidden="true">${esc(t("playGame"))}</span>
          </div>`;
      })
      .join("") + togetherCardHtml(topic);
  }

  // Opens a topic's slide lesson (from its card or its "i" dialog).
  function openTopicLesson(topic, id = topicLessonIds(topic)[0]) {
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
  }

  function renderTopic(topic) {
    const view = views.topic();
    if (!view) return;
    const best = readBest();
    const started = readStarted();
    const lessonIds = topicLessonIds(topic);

    // The lesson's slide count, length and summary are in its "i" dialog.
    // A topic split into numbered lessons shows the number on the icon.
    const lessonCard = lessonIds
      .map((id, i) => {
        const iconLabel = lessonIds.length > 1 ? t("lessonNum", i + 1) : levelLabel(lessonLevel(topic));
        const iconNum = lessonIds.length > 1 ? i + 1 : lessonLevel(topic);
        return `
        <div class="eng-lesson-card" data-lesson-id="${esc(id)}">
          <span class="eng-lesson-icon" role="img" aria-label="${esc(iconLabel)}" title="${esc(iconLabel)}">${lessonIconHtml(iconNum)}</span>
          <h4 class="eng-lesson-title">${lessonTitleHtml(topic, id)}</h4>
          <div class="eng-lesson-actions">
            <button type="button" class="eng-info-btn" data-lesson-info="${esc(id)}" aria-haspopup="dialog" aria-label="${esc(t("lessonInfo"))}" title="${esc(t("lessonInfo"))}">${ICONS.info}</button>
            <button type="button" class="btn btn-primary btn-candy font-cartoon eng-lesson-open" data-lesson-id="${esc(id)}">${esc(t("openLesson"))}</button>
          </div>
        </div>`;
      })
      .join("");

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

    // Exercise and reading passage cards: the title, and on the side whether
    // the student did it already. The level, the question count and the best
    // score are in the "i" dialog.
    const exerciseCard = (ex) => {
      const reading = ex.type === "reading";
      return `
        <div class="eng-ex-card eng-ex-card--${esc(ex.type)}${reading ? ` eng-ex-card--level-${ex.level}` : ""}">
          <span class="eng-ex-icon${reading ? "" : " eng-ex-icon--level"}">${reading ? ICONS.reading : exerciseIcon(exerciseLevel(ex))}</span>
          <span class="eng-ex-text">
            <a class="eng-ex-title eng-card-link" href="#${esc(topic.id)}/${esc(ex.id)}">${reading ? `<bdi>${esc(passageTitle(ex))}</bdi>` : esc(loc(ex, "title"))}</a>
          </span>
          ${statusHtml(exerciseStatus(topic, ex, best, started))}
          ${paperBtnHtml(topic, ex)}
          ${infoBtnHtml(ex)}
          <span class="eng-item-action" aria-hidden="true">${esc(t("practice"))}</span>
        </div>`;
    };
    // Practice exercises in level order (english-more.js), easiest first.
    const practice = (topic.exercises || [])
      .filter((ex) => ex.type !== "reading" && (ex.type !== "speak" || canListen()))
      .sort((a, b) => exerciseLevel(a) - exerciseLevel(b));
    const exercises = practice.length ? `<div class="eng-ex-grid">${practice.map(exerciseCard).join("")}</div>` : "";

    const printables = printCardsHtml(topic);
    const gameCards = gameCardsHtml(topic);
    const units = readingUnits(topic);
    const step = (body) => `<section class="eng-step">${body}</section>`;

    // A vocabulary topic on the path goes back to the path, not the hub.
    const backHref = topicGroup(topic) === "vocab" && !PATH.length ? `#${VOCAB_ROUTE}` : "#";
    const head = `
      <div class="eng-topic-head">
        <a class="eng-back" href="${backHref}" aria-label="${esc(t("back"))}" title="${esc(t("back"))}">${ICONS.back}</a>
        <h2 class="font-cartoon eng-topic-heading">${esc(loc(topic, "title"))}</h2>
        ${lang() === "he" && topic.titleEn ? `<p class="eng-topic-heading-en" dir="ltr">${esc(topic.titleEn)}</p>` : ""}
      </div>`;

    if (topic.id === EXAMS_TOPIC) {
      view.innerHTML = `${head}${examsPageHtml(topic, best, started)}`;
      return;
    }

    if (topicGroup(topic) === "reading") {
      // The reading library: every passage, grouped by level.
      const levels = [1, 2, 3, 4]
        .map((level) => {
          const list = units.filter((ex) => ex.level === level);
          if (!list.length) return "";
          return `
            <section class="eng-step">
              <h3 class="eng-step-title"><span class="eng-step-num eng-step-num--level-${level}">${level}</span>${esc(`${t("level", level)} · ${t("levelName", level)}`)}</h3>
              <div class="eng-level-grid">${list.map((ex) => levelCardHtml(topic, ex, best, started)).join("")}</div>
            </section>`;
        })
        .join("");
      view.innerHTML = `${head}${levels}${nextTopicHtml(topic)}`;
      bindHelpButtons(view, topic);
      return;
    }

    view.innerHTML = `
      ${head}
      ${lessonCard || decks ? step(`${lessonCard}${decks ? `<div class="eng-item-list">${decks}</div>` : ""}`) : ""}
      ${step(
        `<div id="engReviewSlot">${reviewStripHtml(topic)}</div>${exercises || (gameCards ? "" : `<p class="eng-empty">${esc(t("noExercises"))}</p>`)}${
          gameCards
            ? `<div class="eng-practice-games">
                <h4 class="eng-practice-sub">${esc(t("stepGames"))}</h4>
                <div class="eng-ex-grid">${gameCards}</div>
              </div>`
            : ""
        }`
      )}
      ${
        units.length
          ? step(
              `<div class="eng-ex-grid">${units.map(exerciseCard).join("")}</div>${
                topic.id === "bagrut" && findTopic(EXAMS_TOPIC) ? examLinkHtml() : ""
              }`
            )
          : ""
      }
      ${printables ? step(`<p class="eng-step-lead">${esc(t("printLead"))}</p><div class="eng-ex-grid">${printables}</div>`) : ""}
      ${nextTopicHtml(topic)}`;

    bindHelpButtons(view, topic);
    $$(".eng-lesson-open", view).forEach((btn) =>
      btn.addEventListener("click", () => openTopicLesson(topic, btn.dataset.lessonId))
    );
    $$("[data-lesson-info]", view).forEach((btn) =>
      btn.addEventListener("click", (e) => help.openLesson(topic, e.currentTarget, btn.dataset.lessonInfo))
    );

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
    // A mistakes retry: the score of the round it fixes ({ score, total }).
    fix: null,
    isNew: false,
    newRequest: null,
    prepared: false,
    timer: null,
    state: null,
    startedAt: 0,
    recorded: false,
    // A "my mistakes" round (startReview): where each question is from.
    review: null,
    // A reading exam in progress (startExam).
    exam: null,
  };

  /* ── Seen items: a new round starts with the questions the student hasn't
     had yet, and "create new exercises" asks the server only for ones they
     haven't seen. Kept per exercise in this browser, oldest first. ── */

  const SEEN_KEY = "pleyi-english-seen";
  const SEEN_CAP = 600;

  function readSeen() {
    try {
      return JSON.parse(localStorage.getItem(SEEN_KEY)) || {};
    } catch {
      return {};
    }
  }

  function seenKeys(topic, ex) {
    return readSeen()[`${topic.id}/${ex.id}`] || [];
  }

  // Moves `keys` to the end of the exercise's list (the most recently seen).
  function markSeen(topic, ex, keys) {
    if (!keys.length) return;
    const all = readSeen();
    const id = `${topic.id}/${ex.id}`;
    const now = new Set(keys);
    all[id] = [...(all[id] || []).filter((k) => !now.has(k)), ...keys].slice(-SEEN_CAP);
    try {
      localStorage.setItem(SEEN_KEY, JSON.stringify(all));
    } catch {
      /* ignore */
    }
  }

  // A short id for one of the exercise's own items; new items from the
  // server bring their own `key`.
  function itemKey(item) {
    if (item.key) return item.key;
    const str = JSON.stringify([item.word, item.text, item.answer, item.a, item.b]);
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = (h * 33 + str.charCodeAt(i)) | 0;
    return `p${(h >>> 0).toString(36)}`;
  }

  function poolOf(ex) {
    if (ex.type === "match") return ex.pairs || ex.words.map((id) => ({ a: VOCAB[id].en, img: imgUrl(id), word: id }));
    return ex.words ? ex.words.map(wordItem).filter(Boolean) : ex.questions;
  }

  // `size` items of `pool`: the ones not seen yet first, then the ones seen
  // longest ago — so rounds go through the whole exercise before repeating.
  function freshest(pool, size, seen) {
    const order = new Map(seen.map((k, i) => [k, i]));
    const unseen = shuffle(pool.filter((item) => !order.has(itemKey(item))));
    const old = pool.filter((item) => order.has(itemKey(item))).sort((a, b) => order.get(itemKey(a)) - order.get(itemKey(b)));
    return shuffle([...unseen, ...old].slice(0, Math.max(0, size)));
  }

  function buildRound(topic, ex) {
    // A passage's questions follow the text, and a chat's lines one another,
    // so they keep their order.
    if (ex.type === "reading" || ex.type === "exam" || ex.type === "chat") return [...ex.questions];
    const seen = seenKeys(topic, ex);
    if (ex.type === "match") return [{ pairs: freshest(poolOf(ex), ex.boardSize || 6, seen) }];
    return freshest(poolOf(ex), ex.roundSize || 10, seen);
  }

  /* ── An exercise's status on its card: "done" once a whole round was
     finished and every item of the exercise has come up (a round draws only
     part of a big exercise), "in progress" from the moment it opens. Kept in
     this browser; a student's file adds the rounds they finished on other
     devices (fileFinished). ── */

  const STARTED_KEY = "pleyi-english-started";
  let fileFinished = new Set();

  function readStarted() {
    try {
      return JSON.parse(localStorage.getItem(STARTED_KEY)) || {};
    } catch {
      return {};
    }
  }

  function markStarted(topic, ex) {
    const all = readStarted();
    const id = `${topic.id}/${ex.id}`;
    if (all[id]) return;
    all[id] = 1;
    try {
      localStorage.setItem(STARTED_KEY, JSON.stringify(all));
    } catch {
      /* ignore */
    }
  }

  // A passage, an exam, or an exercise whose items all fit in one round.
  function fitsOneRound(ex) {
    if (ex.type === "reading" || ex.type === "exam") return true;
    return poolOf(ex).length <= (ex.type === "match" ? ex.boardSize || 6 : ex.roundSize || 10);
  }

  // The share of the exercise's items the student has had, 0–1.
  function coverage(topic, ex) {
    const pool = poolOf(ex);
    if (!pool.length) return 1;
    const seen = new Set(seenKeys(topic, ex));
    return pool.filter((item) => seen.has(itemKey(item))).length / pool.length;
  }

  // "done", "progress" or "". An exam left in the middle is in progress
  // even when an earlier one was handed in.
  function exerciseStatus(topic, ex, best = readBest(), started = readStarted()) {
    const id = `${topic.id}/${ex.id}`;
    if (ex.type === "exam" && readExamSaves()[examSaveId(ex)]) return "progress";
    const finished = !!best[id] || fileFinished.has(id);
    if (finished && (fitsOneRound(ex) || coverage(topic, ex) >= 1)) return "done";
    return finished || started[id] || seenKeys(topic, ex).length ? "progress" : "";
  }

  function statusHtml(status) {
    if (!status) return "";
    const done = status === "done";
    return `<span class="eng-status eng-status--${status}">${done ? ICONS.statusDone : ICONS.statusProgress}<span>${esc(t(done ? "statusDone" : "statusProgress"))}</span></span>`;
  }

  // mode: "retry" — only the last round's mistakes, fixing the score `fix`
  // of that round; "new" — a round of new items made by the server (see
  // makeNewRound).
  // So that the speaker button starts right away.
  function preloadRoundSpeech() {
    const said = runner.round.flatMap((q) => (q?.pairs ? q.pairs.map((pair) => pair.en) : [q?.en, q?.answer]));
    window.PleyiSpeech.preload(said.filter((text) => typeof text === "string"));
  }

  function startExercise(topic, exercise, round = null, mode = round ? "retry" : "", fix = null) {
    clearTimeout(runner.timer);
    stopExamTimer();
    runner.review = null;
    runner.exam = null;
    runner.topic = topic;
    runner.exercise = exercise;
    runner.isRetry = mode === "retry";
    runner.fix = runner.isRetry ? fix : null;
    runner.isNew = mode === "new";
    runner.newRequest = null;
    runner.prepared = false;
    runner.round = round || buildRound(topic, exercise);
    preloadRoundSpeech();
    runner.total = exercise.type === "match" ? runner.round.reduce((n, b) => n + b.pairs.length, 0) : runner.round.length;
    runner.index = 0;
    runner.barIndex = 0;
    runner.score = 0;
    runner.mistakes = [];
    runner.mistakeLog = [];
    runner.startedAt = Date.now();
    runner.recorded = false;
    runner.earned = null;
    // A new reading passage counts as seen once it opens.
    if (exercise.key) markSeen(topic, exercise, [exercise.key]);
    markStarted(topic, exercise);
    if (exercise.type === "reading") startReading();
    else if (exercise.type === "exam") startExam();
    else renderQuestion();
  }

  /* ── New exercises: the server writes new items in the exercise's own
     format (lib/english-practice.js) and keeps them in a shared bank. ── */

  // `waitMs`: how long to wait for the answer before giving up on it.
  function practiceRequest(path, topic, ex, waitMs = 0) {
    return fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicId: topic.id, exerciseId: ex.id, seen: seenKeys(topic, ex) }),
      signal: waitMs && window.AbortSignal?.timeout ? AbortSignal.timeout(waitMs) : undefined,
    });
  }

  // Sent when a round ends: the server gets new items ready while the
  // student looks at the results, so the button rarely has to wait.
  function preparePractice(topic, ex) {
    if (SUBJECT) return;
    practiceRequest("/api/english/practice/prepare", topic, ex).catch(() => {});
  }

  // A practice word in a new sentence from the server ({ word, text, he }).
  // On a matching board the sentence takes the word's place.
  function sentenceWord(item, isMatch) {
    const base = wordItem(item.word);
    if (!base) return null;
    if (isMatch) return { a: item.text, img: base.img, word: item.word, key: item.key };
    return { ...base, text: item.text, sentenceHe: item.he || "", key: item.key };
  }

  // A round of the server's new items, topped up with the exercise's own
  // unseen items when there are too few. Null when there is nothing new.
  function newRound(topic, ex, items) {
    if (ex.type === "reading") {
      const [unit] = items;
      if (!unit?.passage || !unit.questions?.length) return null;
      const exercise = { ...ex, key: unit.key, passage: unit.passage, questions: unit.questions };
      return { exercise, round: [...unit.questions] };
    }
    const isMatch = ex.type === "match";
    const size = isMatch ? (ex.words ? 4 : ex.boardSize || 6) : ex.roundSize || 10;
    const seen = seenKeys(topic, ex);
    const seenSet = new Set(seen);
    let fresh = items.map((item) => (item.word ? sentenceWord(item, isMatch) : item)).filter(Boolean);
    let pool = poolOf(ex);
    if (!fresh.length && !pool.some((item) => !seenSet.has(itemKey(item)))) return null;
    // A board shows each picture once, so a word may be on it only once.
    if (isMatch && ex.words) {
      const words = new Set();
      fresh = fresh.filter((p) => !words.has(p.word) && words.add(p.word)).slice(0, size);
      pool = pool.filter((p) => !words.has(p.word));
    }
    fresh = fresh.slice(0, size);
    const picked = shuffle([...fresh, ...freshest(pool, size - fresh.length, seen)]);
    return { exercise: ex, round: isMatch ? [{ pairs: picked }] : picked, fromPool: !fresh.length };
  }

  // "New round" waits this long for the server's items; past that the round
  // is the exercise's own items, and the server keeps writing for next time.
  const NEW_ROUND_WAIT_MS = 8000;

  function againButtonHtml() {
    const busy = !!runner.newRequest;
    return `<button type="button" class="btn btn-primary btn-candy font-cartoon eng-btn-again" id="engAgain"${busy ? ' disabled aria-busy="true"' : ""}>${busy ? ICONS.spinner : ""}<span>${esc(t(busy ? "makingNew" : "again"))}</span></button>`;
  }

  function refreshAgainButton() {
    const btn = $("#engAgain");
    if (!btn) return;
    btn.outerHTML = againButtonHtml();
    $("#engAgain").addEventListener("click", makeNewRound);
  }

  // "New round": the server's new items topped up with the exercise's own
  // unseen ones, or a plain round of the exercise when there is nothing new.
  // Built-in exercises (english-more.js) and the subject pages have no
  // server items.
  async function makeNewRound() {
    if (runner.newRequest) return;
    const { topic } = runner;
    const ex = findExercise(topic, runner.exercise.id) || runner.exercise;
    if (ex.derived || SUBJECT) {
      startExercise(topic, ex);
      return;
    }
    const request = {};
    runner.newRequest = request;
    refreshAgainButton();
    let items = [];
    try {
      const res = await practiceRequest("/api/english/practice", topic, ex, NEW_ROUND_WAIT_MS);
      const data = await res.json();
      if (data.ok) items = data.items || [];
    } catch {
      /* offline, a server error or too long a wait: the exercise's own items */
    }
    // The student may have moved on while the items were being made.
    const stillHere = runner.newRequest === request && runner.phase === "results" && !views.exercise()?.classList.contains("hidden");
    if (!stillHere) return;
    runner.newRequest = null;
    const next = newRound(topic, ex, items);
    if (next) startExercise(topic, next.exercise, next.round, "new");
    else startExercise(topic, ex);
  }

  /* ── Game runner: a vocabulary game (english-games.js) in the same fixed
     screen as the exercises. The game draws its own card content and header
     pills (score, time, hearts…) through `shell`. ── */

  let activeGame = null;

  function stopGame() {
    activeGame?.stop();
    activeGame = null;
  }

  /* A picture game opened from a lesson's games slide: ready-lessons.js
     stores where it came from, and the game's back arrow and results lead
     back to that slide (on this page, or on the lessons library). */
  const LESSON_RETURN_KEY = "gameclass-lesson-return";
  const LESSON_RESTORE_KEY = "gameclass-lesson-restore";
  let gameLessonReturn = null;

  function readLessonReturn(hashPath) {
    try {
      const ret = JSON.parse(sessionStorage.getItem(LESSON_RETURN_KEY) || "null");
      return ret?.pictureGame === hashPath && ret.returnUrl ? ret : null;
    } catch {
      return null;
    }
  }

  function forgetLessonReturn() {
    gameLessonReturn = null;
    try {
      sessionStorage.removeItem(LESSON_RETURN_KEY);
    } catch {
      /* ignore */
    }
  }

  function backToLesson() {
    const ret = gameLessonReturn;
    if (!ret) return;
    forgetLessonReturn();
    const [path, hash = ""] = ret.returnUrl.split("#");
    if (path === location.pathname && window.ReadyLessons?.resumeLesson) {
      // The lesson was opened here: back to its topic page, with the lesson on top.
      location.hash = hash;
      window.ReadyLessons.resumeLesson(ret.lessonId, ret.slideIndex);
      return;
    }
    try {
      sessionStorage.setItem(LESSON_RESTORE_KEY, JSON.stringify({ lessonId: ret.lessonId, slideIndex: ret.slideIndex }));
    } catch {
      /* ignore */
    }
    location.href = ret.returnUrl;
  }

  function renderGameShell(game, topic, inner, hud = "") {
    const view = views.exercise();
    const backLabel = gameLessonReturn ? "backToLesson" : "backToTopic";
    runner.gameId = game.id;
    view.classList.remove("is-reading");
    document.documentElement.classList.remove("eng-soft");
    view.innerHTML = `
      <div class="eng-runner-head">
        <div class="eng-runner-top">
          <a class="eng-back" id="engGameBack" href="#${esc(topic.id)}" aria-label="${esc(t(backLabel))}" title="${esc(t(backLabel))}">${ICONS.back}</a>
          <div class="eng-runner-title-row">
            <h2 class="font-cartoon eng-runner-title">${esc(loc(game, "title"))}</h2>
            <span class="eng-game-topic">${esc(loc(topic, "title"))}</span>
          </div>
          <div class="eng-runner-tools" id="engRunnerTools"></div>
        </div>
        <div class="eng-game-hud" id="engGameHud">${hud}</div>
      </div>
      <div class="eng-runner-card eng-runner-card--game eng-runner-card--game-${esc(game.id)}${cardColorClass()}${prefs.say ? " is-say" : ""}">${inner}</div>`;
    if (gameLessonReturn) {
      $("#engGameBack").addEventListener("click", (e) => {
        e.preventDefault();
        backToLesson();
      });
    }
    renderTools();
    $$(".eng-speak[data-say]", view).forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        speak(btn.dataset.say);
      });
    });
    return $(".eng-runner-card", view);
  }

  async function copyLink(hashPath) {
    try {
      await navigator.clipboard.writeText(`${location.origin}${location.pathname}#${hashPath}`);
      showToast(t("copied"));
    } catch {
      /* ignore */
    }
  }

  function startGame(topic, game) {
    stopGame();
    clearTimeout(runner.timer);
    stopExamTimer();
    runner.review = null;
    runner.exam = null;
    runner.topic = topic;
    runner.exercise = null;
    runner.phase = "game";
    gameLessonReturn = readLessonReturn(`${topic.id}/game-${game.id}`);
    activeGame = window.EnglishGames.start(game.id, {
      topic,
      words: gameWords(topic),
      backToLesson: gameLessonReturn ? backToLesson : null,
      shell: (inner, hud) => renderGameShell(game, topic, inner, hud),
      speak,
      canSpeak,
      sfx: playSfx,
      icons: { listen: ICONS.listen, star: ICONS.star, link: ICONS.link },
      homeworkHtml: homeworkButtonHtml,
      copyLink: () => copyLink(`${topic.id}/game-${game.id}`),
      record: (activity) => {
        const run = activeGame;
        window.StudentProgress?.record({ ...activity, topicId: topic.id, topicTitle: topic.title }).then((result) => {
          if (result && run && run === activeGame) showEarned(result);
        });
      },
    });
  }

  // Sentence exercises whose questions carry a Hebrew translation (`he`).
  // Order exercises also have `he`, but there it is the prompt itself.
  // Picture words in new sentences carry theirs in `sentenceHe`. Reading
  // passages have their own switch, "Hebrew questions".
  function hasTranslation(exercise) {
    if (runner.round.some((q) => q?.sentenceHe)) return true;
    return ["choice", "truefalse", "write", "find-error", "letters", "dictation", "chat"].includes(exercise.type) && !!exercise.questions?.some((q) => q.he);
  }

  function toolsHtml() {
    const isReading = runner.exercise?.type === "reading";
    const isExam = runner.exercise?.type === "exam";
    const showTranslate = runner.phase === "question" && hasTranslation(runner.exercise);
    const showSay = (runner.phase === "question" && roundHasSay()) || (runner.phase === "game" && ["hunt", "bingo"].includes(runner.gameId));
    const showReadAloud = isReading && runner.phase !== "results" && canSpeak();
    const showWords = isReading && runner.phase !== "results";
    const showHeQuestions =
      ((isReading && runner.phase === "question") || (isExam && runner.phase === "exam")) && runner.round.some(hebrewQuestion);
    // Each switch is a row in the settings menu, with an on/off knob.
    const tool = (id, on, icon, label, title) =>
      `<button type="button" class="eng-setting" id="${id}" aria-pressed="${on}" title="${esc(title)}">${icon}<span class="eng-setting-label">${esc(label)}</span><span class="eng-switch" aria-hidden="true"></span></button>`;
    return `
      <div class="eng-settings">
        <button type="button" class="eng-settings-btn" id="engSettingsBtn" aria-haspopup="true" aria-expanded="${settingsOpen}" aria-controls="engSettingsMenu" aria-label="${esc(t("settings"))}" title="${esc(t("settings"))}">${ICONS.settings}</button>
        <div class="eng-settings-menu${settingsOpen ? "" : " hidden"}" id="engSettingsMenu" role="group" aria-label="${esc(t("settings"))}">
          ${showReadAloud ? tool("engReadAloud", readAloud.on, readAloud.on ? ICONS.stop : ICONS.play, t("readAloud"), t(readAloud.on ? "readAloudOn" : "readAloudOff")) : ""}
          ${showWords ? tool("engWordsToggle", prefs.words, ICONS.wordMeaning, t("wordsTool"), t(prefs.words ? "wordsToolOn" : "wordsToolOff")) : ""}
          ${showHeQuestions ? tool("engHeQuestions", prefs.heQuestions, ICONS.translate, t("heQuestions"), t(prefs.heQuestions ? "heQuestionsOn" : "heQuestionsOff")) : ""}
          ${showTranslate ? tool("engTranslateToggle", prefs.translate, ICONS.translate, t("translate"), t(prefs.translate ? "translateOn" : "translateOff")) : ""}
          ${showSay ? tool("engSayToggle", prefs.say, ICONS.sayHe, t("sayTool"), t(prefs.say ? "sayToolOn" : "sayToolOff")) : ""}
          ${tool("engSoundToggle", prefs.sound, prefs.sound ? ICONS.listen : ICONS.soundOff, t("sound"), t(prefs.sound ? "soundOn" : "soundOff"))}
          <div class="eng-settings-colors">
            <button type="button" class="eng-setting" id="engColorToggle" aria-expanded="${colorsOpen}" aria-controls="engColorSwatches">${ICONS.palette}<span class="eng-setting-label">${esc(t("cardColorTitle"))}</span><span class="eng-color-current eng-color-swatch--${prefs.cardColor}" aria-hidden="true"></span><span class="eng-color-chevron" aria-hidden="true"></span></button>
            <div class="eng-color-swatches${colorsOpen ? "" : " hidden"}" id="engColorSwatches" role="group" aria-label="${esc(t("cardColorTitle"))}">
              ${CARD_COLORS.map(
                (c) =>
                  `<button type="button" class="eng-color-swatch eng-color-swatch--${c.id}" data-card-color="${c.id}" aria-pressed="${c.id === prefs.cardColor}" aria-label="${esc(c[lang()] || c.he)}" title="${esc(c[lang()] || c.he)}"></button>`
              ).join("")}
            </div>
          </div>
        </div>
      </div>`;
  }

  function cardColorClass() {
    return prefs.cardColor === "white" ? "" : ` eng-card-color--${prefs.cardColor}`;
  }

  // The settings menu stays open while its switches re-render the tools.
  // The color row starts folded; a click on it shows the swatches.
  let settingsOpen = false;
  let colorsOpen = false;

  function closeSettings(focusButton) {
    if (!settingsOpen) return;
    settingsOpen = false;
    colorsOpen = false;
    $("#engColorSwatches")?.classList.add("hidden");
    $("#engColorToggle")?.setAttribute("aria-expanded", "false");
    $("#engSettingsMenu")?.classList.add("hidden");
    $("#engSettingsBtn")?.setAttribute("aria-expanded", "false");
    if (focusButton) $("#engSettingsBtn")?.focus({ preventScroll: true });
  }

  // A click anywhere outside the settings menu closes it.
  document.addEventListener("click", (e) => {
    if (!e.target.closest?.(".eng-settings")) closeSettings(false);
  });

  function bindSettings() {
    const btn = $("#engSettingsBtn");
    const menu = $("#engSettingsMenu");
    if (!btn || !menu) return;
    btn.addEventListener("click", () => {
      if (settingsOpen) {
        closeSettings(false);
        return;
      }
      settingsOpen = true;
      menu.classList.remove("hidden");
      btn.setAttribute("aria-expanded", "true");
      $("button", menu)?.focus({ preventScroll: true });
    });
    // Escape closes the menu without leaving the exercise.
    menu.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      e.stopPropagation();
      closeSettings(true);
    });
    const colorToggle = $("#engColorToggle", menu);
    colorToggle?.addEventListener("click", () => {
      colorsOpen = !colorsOpen;
      $("#engColorSwatches", menu)?.classList.toggle("hidden", !colorsOpen);
      colorToggle.setAttribute("aria-expanded", String(colorsOpen));
    });
    $$("[data-card-color]", menu).forEach((swatch) => {
      swatch.addEventListener("click", () => {
        prefs.cardColor = swatch.dataset.cardColor;
        try {
          localStorage.setItem(CARD_COLOR_KEY, prefs.cardColor);
        } catch {
          /* ignore */
        }
        const card = $(".eng-runner-card");
        if (card) {
          CARD_COLORS.forEach((c) => card.classList.remove(`eng-card-color--${c.id}`));
          if (prefs.cardColor !== "white") card.classList.add(`eng-card-color--${prefs.cardColor}`);
        }
        $$("[data-card-color]", menu).forEach((s) => s.setAttribute("aria-pressed", String(s === swatch)));
        const current = $(".eng-color-current", menu);
        if (current) current.className = `eng-color-current eng-color-swatch--${prefs.cardColor}`;
      });
    });
  }

  function renderTools() {
    const box = $("#engRunnerTools");
    if (!box) return;
    box.innerHTML = toolsHtml();
    bindSettings();
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
      fitCard();
      // A typing question keeps the cursor in its input.
      const input = $("#engInput");
      if (input && !runner.answered) input.focus({ preventScroll: true });
      else $("#engTranslateToggle")?.focus({ preventScroll: true });
    });
    $("#engSayToggle")?.addEventListener("click", toggleSay);
    $("#engReadAloud")?.addEventListener("click", () => {
      readAloud.toggle();
      $("#engReadAloud")?.focus({ preventScroll: true });
    });
    $("#engWordsToggle")?.addEventListener("click", () => {
      prefs.words = !prefs.words;
      saveFlag(WORDS_KEY, prefs.words);
      refreshPassage();
      renderTools();
      $("#engWordsToggle")?.focus({ preventScroll: true });
    });
    // Both languages are already on the page, so switching never loses an
    // answer in progress.
    $("#engHeQuestions")?.addEventListener("click", () => {
      prefs.heQuestions = !prefs.heQuestions;
      saveFlag(HE_QUESTIONS_KEY, prefs.heQuestions);
      $(".eng-runner-card")?.classList.toggle("is-he-q", prefs.heQuestions);
      renderTools();
      $("#engHeQuestions")?.focus({ preventScroll: true });
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
      window.PleyiSpeech.stop();
      const run = ++this.run;
      this.on = true;
      paragraphs.forEach((para, i) => {
        const utter = window.PleyiSpeech.utterance(para.replace(/[[\]]/g, ""), 0.85);
        if (i === paragraphs.length - 1) utter.onend = () => this.done(run);
        utter.onerror = () => this.done(run);
        window.speechSynthesis.speak(utter);
      });
      renderTools();
    },
    stop() {
      this.run++;
      if (this.on) window.PleyiSpeech.stop();
      this.on = false;
      renderTools();
    },
    done(run) {
      if (run !== this.run) return;
      this.on = false;
      renderTools();
    },
  };

  function runnerTitle() {
    const { exercise } = runner;
    if (runner.review?.test) return runner.review.test.title || t("testTitle");
    if (runner.review) return t(runner.review.daily ? "dailyTitle" : runner.review.mix ? "mixTitle" : "reviewTitle");
    if (exercise.type === "reading") return t("readingTitle");
    if (exercise.type === "exam") return t("examTitle");
    return loc(exercise, "title");
  }

  // A reading or exam shows its level in small text under the title.
  function runnerSubtitleHtml() {
    const { exercise } = runner;
    if (runner.review || (exercise.type !== "reading" && exercise.type !== "exam")) return "";
    return `<p class="eng-runner-sub">${esc(t("level", exercise.level))}</p>`;
  }

  // A review question: the topic and exercise it is from, and how close it
  // is to leaving the bank (a mixed practice shows where it is from only).
  function reviewFromHtml() {
    const item = runner.review?.items[runner.index];
    if (!item || runner.phase === "results") return "";
    if (runner.review.test) return `<span class="eng-game-topic eng-review-from"><span>${esc(loc(item.topic, "title"))}</span></span>`;
    if (runner.review.mix || runner.review.daily) return `<span class="eng-game-topic eng-review-from"><span>${esc(loc(item.topic, "title"))} · ${esc(loc(item.source, "title"))}</span></span>`;
    const goal = window.MistakeBank.GOAL;
    const streak = Math.min(goal, window.MistakeBank.streakOf(item.id));
    const dots = Array.from({ length: goal }, (_, i) => `<i${i < streak ? ' class="is-on"' : ""}></i>`).join("");
    return `
      <span class="eng-game-topic eng-review-from">
        <span>${esc(loc(item.topic, "title"))} · ${esc(loc(item.source, "title"))}</span>
        <span class="eng-review-dots" role="img" aria-label="${esc(t("reviewStreak", streak, goal))}" title="${esc(t("reviewStreak", streak, goal))}">${dots}</span>
      </span>`;
  }

  // The back arrow, the title and the settings button share the top row;
  // `progress` is the bar under them, outside the card.
  function renderRunnerShell(inner, progress = "") {
    const view = views.exercise();
    const { topic, exercise } = runner;
    const isReading = exercise.type === "reading";
    view.classList.toggle("is-reading", isReading || exercise.type === "exam");
    document.documentElement.classList.add("eng-soft");
    const back = runner.review ? runner.review.back : runner.back || `#${topic.id}`;
    const backLabel = inTest()
      ? t("backToHomework")
      : back === `#${CHAT_ROUTE}`
        ? t("chatBack")
        : back === "#" || back === `#${DAILY_ROUTE}`
          ? t("back")
          : t("backToTopic");
    view.innerHTML = `
      <div class="eng-runner-head">
        <div class="eng-runner-top">
          <a class="eng-back" href="${esc(back)}" aria-label="${esc(backLabel)}" title="${esc(backLabel)}">${ICONS.back}</a>
          <div class="eng-runner-title-row">
            <h2 class="font-cartoon eng-runner-title">${esc(runnerTitle())}</h2>
            ${runnerSubtitleHtml()}
            ${reviewFromHtml()}
          </div>
          <div class="eng-runner-tools" id="engRunnerTools"></div>
        </div>
        ${progress}
      </div>
      <div class="eng-runner-card eng-runner-card--${esc(exercise.type)}${cardColorClass()}${prefs.translate ? " is-translated" : ""}${prefs.heQuestions ? " is-he-q" : ""}${prefs.say ? " is-say" : ""}">${inner}</div>`;
    // The instructions sit on the page above the card, not inside it — over
    // the progress bar when there is one.
    const instructions = $(".eng-runner-card > .eng-instructions", view);
    const bar = $(".eng-runner-head > .eng-progress", view);
    if (bar && instructions) bar.before(instructions);
    else if (instructions) view.insertBefore(instructions, instructions.parentElement);
    // A test checks nothing on the way, so its button only confirms.
    if (inTest() && $("#engCheck", view)) $("#engCheck", view).textContent = t("testConfirm");
    renderTools();
    $$(".eng-speak, .eng-word-tap", view).forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        speak(btn.dataset.say);
      });
    });
  }

  // One segment per question along the bar, from the start side: `done`
  // segments are filled, the `current` one is tinted, and the `fresh` one
  // fills itself in.
  function barHtml(total, done, current = -1, fresh = -1) {
    return Array.from({ length: total }, (_, i) => {
      const cls = i < done ? ` is-done${i === fresh ? " is-new" : ""}` : i === current ? " is-current" : "";
      return `<span class="eng-bar-seg${cls}"></span>`;
    }).join("");
  }

  function progressHtml({ label, total, done, current = -1, fresh = -1 }) {
    return `
      <div class="eng-progress" id="engProgress" role="img" aria-label="${esc(label)}">
        <div class="eng-bar" id="engBar" aria-hidden="true">${barHtml(total, done, current, fresh)}</div>
      </div>`;
  }

  function questionProgress() {
    const { index, round } = runner;
    // Only a newly reached question animates its segment, not a re-render of
    // the same one (e.g. on a language switch).
    const fresh = runner.barIndex === index ? -1 : index - 1;
    runner.barIndex = index;
    return progressHtml({ label: t("progress", index + 1, round.length), total: round.length, done: index, current: index, fresh });
  }

  // The instructions sit in a plain box on a soft fill.
  function instrBoxHtml(body, textClass = "") {
    return `
      <div class="eng-instructions eng-instr">
        <div class="eng-instr-main">
          <div class="eng-instr-text${textClass}">${body}</div>
        </div>
      </div>`;
  }

  function instructionsHtml() {
    return instrBoxHtml(`<p class="eng-instr-line">${byLine(loc(runner.exercise, "instructions"))}</p>`);
  }

  const feedbackHtml = `<div class="eng-feedback" id="engFeedback" aria-live="polite"></div>`;

  // The check button waits in the feedback area, which is empty until the
  // answer — one row less on a phone. The feedback replaces it.
  function feedbackWithCheckHtml(disabled = false) {
    return `<div class="eng-feedback" id="engFeedback" aria-live="polite"><button type="button" class="btn btn-primary btn-candy font-cartoon eng-check" id="engCheck"${disabled ? " disabled" : ""}>${esc(t("check"))}</button></div>`;
  }

  function sentenceHtml(question, filled, state) {
    // A missing letter inside a word ("___og") gets a letter-wide blank.
    // Decided by the options, not the answer, so the blank's width never
    // hints which option is right (e.g. a / an).
    const options = question.options || runner.exercise?.options || [];
    const letterCls = options.length && options.every((opt) => opt.length === 1) ? " is-letter" : "";
    const blank = filled
      ? `<span class="eng-blank${letterCls} is-${state}"${SUBJECT ? "" : ' dir="ltr"'}>${aHtml(filled)}</span>`
      : `<span class="eng-blank${letterCls}">&nbsp;</span>`;
    const hint = question.hint ? ` <span class="eng-hint">(${esc(question.hint)})</span>` : "";
    // A subject question with its exercise on a big math line: the blank is
    // there, and the question has none when the options answer it as a whole.
    if (question.math) {
      const text = question.text ? `<span class="eng-q-text">${qHtml(question.text)}</span>` : "";
      return `${text}${mathLineHtml(question, question.math.includes("___") ? blank : "")}`;
    }
    const parts = qHtml(question.text).split("___");
    if (parts.length < 2) return SUBJECT ? parts[0] : `${parts[0]} ${blank}${hint}`;
    return `${parts[0]}${blank}${hint}${parts.slice(1).join("___")}`;
  }

  // The Hebrew word, and when the item has one, how the English word
  // sounds in Hebrew letters — for a student who doesn't know the word yet.
  function contextHtml(question) {
    if (!question.context) return "";
    const chip = `<span class="eng-context">${esc(question.context)}</span>`;
    if (!question.say) return chip;
    return `<span class="eng-context-row" dir="rtl" lang="he">${chip}<span class="eng-context eng-say"><bdi class="eng-say-label">${esc(t("soundsLike"))}</bdi>${esc(question.say)}</span></span>`;
  }

  /* How a vocabulary word sounds in Hebrew letters ("פִישׁ" for fish). Always
     rendered when the word has one; the runner card's is-say class decides
     whether it shows, switched from the settings menu. */

  // A row of its own under the word.
  function sayRowHtml(en) {
    const say = sayOf(en);
    return say ? `<span class="eng-say-row" dir="rtl" lang="he"><span class="eng-say eng-say-line">${esc(say)}</span></span>` : "";
  }

  // Smaller, inside an answer button or a match card.
  function sayOptHtml(en) {
    const say = sayOf(en);
    return say ? `<span class="eng-say-opt" dir="rtl" lang="he">${esc(say)}</span>` : "";
  }

  // A big English word and its sound line; tapping the word says it.
  function wordPromptHtml(en) {
    const word = canSpeak()
      ? `<button type="button" class="eng-word-big eng-word-tap" data-say="${esc(en)}" aria-label="${esc(t("speakWord", en))}">${esc(en)}</button>`
      : `<span class="eng-word-big">${esc(en)}</span>`;
    return `<div class="eng-word-prompt" dir="ltr">${word}${sayRowHtml(en)}</div>`;
  }

  // The Hebrew word under a picture, with the sound line (beside the word
  // in a small picture box, under it in a big one).
  function pictureHeHtml(q) {
    return `<span class="eng-picture-he-row"><span class="eng-picture-he">${esc(q.he)}</span>${sayRowHtml(q.en)}</span>`;
  }

  // Listening shows no word to sound out.
  function roundHasSay() {
    if (runner.exercise?.type === "listen") return false;
    return runner.round.some((q) => q && (sayOf(q.en) || (q.img && sayOf(q.text)) || q.pairs?.some((p) => sayOf(p.a))));
  }

  // The match buttons grow to fit what is in them; when the board then runs
  // past the card, its text and pictures shrink a step at a time until it fits.
  function fitMatchBoard() {
    const board = $(".eng-match");
    const card = board?.closest(".eng-runner-card");
    if (!board || !card) return;
    const items = $$(".eng-match-item", board);
    const tooBig = () => card.scrollHeight > card.clientHeight + 1 || items.some((it) => it.scrollWidth > it.clientWidth + 1);
    let fit = 1;
    board.style.setProperty("--fit", fit);
    while (fit > 0.6 && tooBig()) {
      fit = Math.round((fit - 0.05) * 100) / 100;
      board.style.setProperty("--fit", fit);
    }
  }

  // Any other question card: when it runs past the screen (a long sentence
  // with its translation, a small phone), everything in it shrinks a step at
  // a time until it fits, so the next button never ends up under the edge.
  function fitCard() {
    const card = $(".eng-runner-card");
    if (!card) return;
    card.style.removeProperty("--card-fit");
    if (!document.documentElement.classList.contains("eng-runner-open")) return;
    if (card.matches(".eng-runner-card--game") || $(".eng-match, .eng-read, .eng-results", card)) return;
    let fit = 1;
    while (fit > 0.7 && card.scrollHeight > card.clientHeight + 1) {
      fit = Math.round((fit - 0.05) * 100) / 100;
      card.style.setProperty("--card-fit", fit);
    }
  }

  function fitRunner() {
    fitMatchBoard();
    fitCard();
  }

  let fitFrame = 0;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(fitFrame);
    fitFrame = requestAnimationFrame(fitRunner);
  });
  document.fonts?.ready.then(fitRunner);

  function toggleSay() {
    prefs.say = !prefs.say;
    saveFlag(SAY_KEY, prefs.say);
    $(".eng-runner-card")?.classList.toggle("is-say", prefs.say);
    renderTools();
    fitRunner();
    // A typing question keeps the cursor in its input.
    const input = $("#engInput");
    if (input && !runner.answered) input.focus({ preventScroll: true });
    else $("#engSayToggle")?.focus({ preventScroll: true });
  }

  // Always rendered when the question has one; the runner card's
  // is-translated class decides whether it shows.
  function translationHtml(question) {
    if (!question.he) return "";
    const text = esc(question.he).split("___").join(`<span class="eng-tr-blank"></span>`);
    return `<p class="eng-translation" dir="rtl" lang="he">${text}</p>`;
  }

  function renderQuestion() {
    stopListening();
    runner.answered = false;
    runner.phase = "question";
    runner.state = null;
    // A review round shows each question with its own topic and exercise.
    const item = runner.review?.items[runner.index];
    if (item) {
      runner.topic = item.topic;
      runner.exercise = item.exercise;
    }
    const type = runner.exercise.type;
    const q = runner.round[runner.index];
    if (!runner.isRetry && !item) markSeen(runner.topic, runner.exercise, type === "match" ? q.pairs.map(itemKey) : [itemKey(q)]);
    (TYPES[type] || TYPES.choice).render(q);
    fitCard();
  }

  /* ── Mistake bank (mistake-bank.js): every answer to a practice question
     goes there. A wrong one keeps the question for "my mistakes"; a right one
     counts toward taking it out. Reading passages and exams stay out, since
     their questions need the whole text. ── */

  // Where a question is from: in a review round its own topic, exercise and
  // bank id; otherwise the runner's.
  function bankContext(q) {
    const item = runner.review?.items[runner.index];
    if (item) return { id: item.id, topic: item.topic, exercise: item.source, item: item.item };
    const { topic, exercise } = runner;
    if (!topic || !exercise || ["reading", "exam", "speak"].includes(exercise.type)) return null;
    return { id: `${topic.id}/${exercise.id}/${itemKey(q)}`, topic, exercise, item: q };
  }

  // Returns true when this right answer took the question out of the bank.
  function bankAnswer(q, right, given = "") {
    const bank = window.MistakeBank;
    const ctx = bank && q && bankContext(q);
    if (!ctx) return false;
    if (right) return bank.answer(ctx.id, true);
    const { prompt, answer } = mistakeRecord(q, given);
    bank.answer(ctx.id, false, {
      topicId: ctx.topic.id,
      exerciseId: ctx.exercise.id,
      topicTitle: ctx.topic.title,
      exerciseTitle: ctx.exercise.title,
      type: ctx.exercise.type,
      level: exerciseLevel(ctx.exercise),
      item: ctx.item,
      prompt,
      answer,
    });
    return false;
  }

  function bankOutHtml() {
    return `<span class="eng-review-out">${ICONS.star}<span>${esc(t("reviewOut"))}</span></span>`;
  }

  function answerButtons() {
    return $$(".js-answer", views.exercise());
  }

  // "The right answer: …" — on a subject page the answer may be math.
  function wrongHtml(answer) {
    return SUBJECT ? `${esc(t("wrongLabel"))} ${aHtml(answer)}` : esc(t("wrong", answer));
  }

  // Whether the question has a blank for its answer (in its math line, or
  // in its text when it has none).
  function hasBlank(q) {
    return String(q.math || q.text || "").includes("___");
  }

  function lockAnswers() {
    answerButtons().forEach((btn) => {
      btn.disabled = true;
    });
  }

  // A test shows no right or wrong on the way: the answer is kept and the
  // next question comes (english-tests.js, #test/<id>).
  function inTest() {
    return !!runner.review?.test;
  }

  function testAnswer(q, isRight, given) {
    if (isRight) runner.score++;
    else {
      runner.mistakes.push(q);
      runner.mistakeLog.push(mistakeRecord(q, given));
    }
    saveTestProgress();
    runner.timer = setTimeout(goNext, TEST_NEXT_MS);
  }

  function onRight(message = t("correct"), delay = AUTO_NEXT_MS) {
    runner.score++;
    playSfx("right");
    const out = bankAnswer(runner.round[runner.index], true);
    if (out && runner.review) runner.review.out++;
    $("#engFeedback").innerHTML = `<span class="eng-feedback-msg is-right">${ICONS.check}<span>${esc(message)}</span></span>${out ? bankOutHtml() : ""}`;
    fitCard();
    runner.timer = setTimeout(goNext, delay + (out ? 500 : 0));
  }

  // A plain-text summary of a missed question for the teacher's progress page.
  // Stored in Hebrew, since that page is Hebrew-only.
  function mistakeRecord(q, given) {
    const record = mistakeRecordOf(q, given);
    if (!SUBJECT) return record;
    const prompt = runner.exercise.type === "match" ? record.prompt : [q.text, q.math].filter(Boolean).join(" ");
    return { prompt: plainText(prompt), answer: plainText(record.answer), given: plainText(record.given) };
  }

  function mistakeRecordOf(q, given) {
    const type = runner.exercise.type;
    if (type === "match") return { prompt: q.a, answer: q.b || VOCAB[q.word]?.he || "", given: "" };
    if (type === "truefalse") {
      const answer = q.correct ? "נכון" : `לא נכון${q.fix ? ` — ${q.fix}` : ""}`;
      const prompt = q.img ? `${q.text} (בתמונה: ${VOCAB[q.word]?.en || q.word})` : q.text;
      return { prompt, answer, given: given ? "נכון" : "לא נכון" };
    }
    if (type === "find-error") return { prompt: q.text, answer: `${errorWords(q)} ← ${q.fix}`, given };
    if (type === "sentence-choice") return { prompt: q.he || q.context || "", answer: q.answer, given };
    if (type === "translate" && runner.exercise.dir === "en-he") return { prompt: q.en, answer: q.he, given };
    if (type === "dictation" && !q.word) return { prompt: q.he || "", answer: q.answer, given };
    if (q.word) return { prompt: q.text ? `${q.text} (${q.he})` : q.he, answer: q.en, given };
    if (type === "order") return { prompt: q.he || "", answer: q.answer, given };
    return { prompt: q.hint ? `${q.text} (${q.hint})` : q.text, answer: q.answer, given };
  }

  function onWrong(question, messageHtml, given = "") {
    runner.mistakes.push(question);
    runner.mistakeLog.push(mistakeRecord(question, given));
    bankAnswer(question, false, given);
    playSfx("wrong");
    const isLast = runner.index === runner.round.length - 1;
    $("#engFeedback").innerHTML = `
      <span class="eng-feedback-msg is-wrong">${ICONS.cross}<span dir="auto">${messageHtml}</span></span>
      <button type="button" class="btn btn-primary btn-candy font-cartoon eng-next" id="engNext">${esc(isLast ? t("finish") : t("next"))}</button>`;
    $("#engNext").addEventListener("click", goNext);
    $("#engNext").focus({ preventScroll: true });
    fitCard();
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
        // `pic`: a picture word to look at and hear ("which letter does it
        // start with?"), with no letters or sound line to give it away.
        const pic = q.pic && wordItem(q.pic);
        renderRunnerShell(`
          ${instructionsHtml()}
          ${figHtml(q)}
          ${pic ? `<div class="eng-picture-box eng-picture-box--small"><img class="eng-picture-img" src="${esc(pic.img)}" alt="" draggable="false" />${speakBtn(pic.en)}</div>` : ""}
          <div class="eng-sentence" dir="${TEXT_DIR}"><p id="engSentence">${sentenceHtml(q)}</p>${contextHtml(q)}${translationHtml(q)}</div>
          <div class="eng-options" dir="${TEXT_DIR}">
            ${options
              .map(
                (opt, i) =>
                  `<button type="button" class="eng-option js-answer" data-option="${esc(opt)}"><span class="eng-option-key">${i + 1}</span>${aHtml(opt)}</button>`
              )
              .join("")}
          </div>
          ${feedbackHtml}`,
          questionProgress()
        );
        answerButtons().forEach((btn) => btn.addEventListener("click", () => this.answer(q, btn.dataset.option)));
        // The picture's word plays on its own, as in the listening exercise.
        const shown = runner.index;
        if (pic) setTimeout(() => runner.index === shown && !runner.answered && speak(pic.en), 350);
      },
      answer(q, choice) {
        if (runner.answered) return;
        runner.answered = true;
        const isRight = choice === q.answer;
        lockAnswers();
        if (inTest()) {
          answerButtons().find((btn) => btn.dataset.option === choice)?.classList.add("is-picked");
          $("#engSentence").innerHTML = sentenceHtml(q, choice, "picked");
          testAnswer(q, isRight, choice);
          return;
        }
        answerButtons().forEach((btn) => {
          if (btn.dataset.option === q.answer) btn.classList.add("is-right");
          else if (btn.dataset.option === choice) btn.classList.add("is-wrong");
        });
        $("#engSentence").innerHTML = sentenceHtml(q, q.answer, isRight ? "right" : "wrong");
        if (isRight) onRight();
        else onWrong(q, wrongHtml(q.answer), choice);
      },
      review: (q) =>
        SUBJECT
          ? `<span dir="rtl">${sentenceHtml(q, q.answer, "right")}${hasBlank(q) ? "" : ` ← <strong>${aHtml(q.answer)}</strong>`}</span>`
          : `<span dir="ltr">${sentenceHtml(q, q.answer, "right")}${q.context ? ` <span class="eng-context-inline">${esc(q.context)}</span>` : ""}</span>`,
    },

    truefalse: {
      // A question with `img` asks whether the word fits the picture.
      render(q) {
        // The word is the picture's caption, and its fix shows under it.
        const prompt = q.img
          ? `<div class="eng-picture-box eng-picture-box--tf"><img class="eng-picture-img" src="${esc(q.img)}" alt="" draggable="false" /><p class="eng-picture-word" id="engSentence" dir="ltr">${esc(q.text)}${speakBtn(q.text, "eng-speak--inline")}</p>${sayRowHtml(q.text)}<div id="engFix" dir="ltr"></div></div>`
          : `${figHtml(q)}<div class="eng-sentence" dir="${TEXT_DIR}"><p id="engSentence">${SUBJECT ? sentenceHtml(q) : esc(q.text)}</p><div id="engFix"></div>${translationHtml(q)}</div>`;
        renderRunnerShell(`
          ${instructionsHtml()}
          ${prompt}
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
        if (inTest()) {
          answerButtons().find((btn) => (btn.dataset.value === "true") === value)?.classList.add("is-picked");
          testAnswer(q, isRight, value);
          return;
        }
        answerButtons().forEach((btn) => {
          const btnValue = btn.dataset.value === "true";
          if (btnValue === q.correct) btn.classList.add("is-right");
          else if (btnValue === value) btn.classList.add("is-wrong");
        });
        if (!q.correct && q.fix) {
          $("#engSentence").classList.add("is-struck");
          $("#engFix").innerHTML = `<p class="eng-fix">${ICONS.check}<span>${aHtml(q.fix)}</span></p>`;
        }
        if (isRight) onRight(t("correct"), q.correct ? AUTO_NEXT_MS : AUTO_NEXT_WITH_FIX_MS);
        else onWrong(q, esc(q.correct ? t("sentenceWasRight") : t("sentenceWasWrong")), value);
      },
      review: (q) => {
        if (q.img) {
          const word = q.correct ? q.text : q.fix;
          return `<span class="eng-review-word"><img src="${esc(q.img)}" alt="" /><span dir="ltr">${esc(word)}</span> — ${esc(VOCAB[q.word]?.he || "")}</span>`;
        }
        if (SUBJECT) {
          const said = `${q.text ? aHtml(q.text) : ""}${q.math ? ` ${mathLineHtml(q)}` : ""}`;
          return q.correct || !q.fix
            ? `<span dir="rtl">${said} <span class="eng-review-tag">${esc(t(q.correct ? "trueBtn" : "falseBtn"))}</span></span>`
            : `<span dir="rtl"><s class="eng-review-wrong">${said}</s> ← <strong>${aHtml(q.fix)}</strong></span>`;
        }
        return q.correct
          ? `<span dir="ltr">${esc(q.text)}</span> <span class="eng-review-tag">${esc(t("trueBtn"))}</span>`
          : `<span dir="ltr"><s class="eng-review-wrong">${esc(q.text)}</s> → <strong>${esc(q.fix || "")}</strong></span>`;
      },
    },

    write: {
      render(q) {
        const solo = (q.word && !q.text) || (SUBJECT && !hasBlank(q));
        // A subject answer that is a plain number gets the number keyboard
        // (not a negative one: that keyboard has no minus on some phones).
        const numeric = SUBJECT && /^\d+(\.\d+)?$/.test(String(q.answer)) ? ' inputmode="decimal"' : "";
        const input = `<input type="text" class="eng-input" id="engInput" dir="${SUBJECT ? "auto" : "ltr"}"${numeric} autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done" aria-label="${esc(t("typeHere"))}" placeholder="${esc(solo ? t("typeHere") : "")}" />`;
        if (SUBJECT) {
          // The answer goes in the blank of the math line or the question; a
          // question without one gets the box under it.
          const wrap = `<span class="eng-input-wrap">${input}<span id="engCorrection"></span></span>`;
          let body = qHtml(q.text);
          if (q.math) body = `${q.text ? `<span class="eng-q-text">${qHtml(q.text)}</span>` : ""}${mathLineHtml(q, solo ? "" : wrap)}`;
          else if (!solo) body = body.split("___").map((part, i) => (i === 1 ? wrap + part : part)).join("");
          renderRunnerShell(`
            ${instructionsHtml()}
            ${figHtml(q)}
            <div class="eng-sentence" dir="rtl"><p id="engSentence">${body}</p></div>
            ${solo ? `<div class="eng-write-solo">${wrap}</div>` : ""}
            <div class="eng-actions"><button type="button" class="btn btn-primary btn-candy font-cartoon eng-check" id="engCheck">${esc(t("check"))}</button></div>
            ${feedbackHtml}`,
            questionProgress()
          );
          this.bind(q);
          return;
        }
        const sentence = (he) => {
          const parts = esc(q.text).split("___");
          const hint = q.hint ? ` <span class="eng-hint">(${esc(q.hint)})</span>` : "";
          return `<div class="eng-sentence" dir="ltr"><p id="engSentence">${parts[0]}<span class="eng-input-wrap">${input}<span id="engCorrection"></span></span>${hint}${parts.slice(1).join("___")}</p>${translationHtml({ he })}</div>`;
        };
        // A picture word on its own, or (a new exercise) inside a sentence.
        const picture = q.word
          ? `<div class="eng-picture-box${solo ? "" : " eng-picture-box--small"}"><img class="eng-picture-img" src="${esc(q.img)}" alt="" draggable="false" />${pictureHeHtml(q)}</div>`
          : "";
        const prompt = solo ? `${picture}<div class="eng-write-solo" dir="ltr">${input}<span id="engCorrection"></span></div>` : `${picture}${sentence(q.word ? q.sentenceHe : q.he)}`;
        renderRunnerShell(`
          ${instructionsHtml()}
          ${prompt}
          <div class="eng-actions"><button type="button" class="btn btn-primary btn-candy font-cartoon eng-check" id="engCheck">${esc(t("check"))}</button></div>
          ${feedbackHtml}`,
          questionProgress()
        );
        this.bind(q);
      },
      bind(q) {
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
        const accepted = [answer, ...(q.accept || [])];
        const isRight =
          accepted.map(normalize).includes(normalize(inputEl.value)) || (SUBJECT && accepted.some((a) => sameNumber(a, inputEl.value)));
        inputEl.readOnly = true;
        if (inTest()) {
          inputEl.classList.add("is-picked");
          $(".eng-actions", views.exercise())?.classList.add("hidden");
          testAnswer(q, isRight, inputEl.value.trim());
          return;
        }
        inputEl.classList.add(isRight ? "is-right" : "is-wrong");
        $(".eng-actions", views.exercise())?.classList.add("hidden");
        if (isRight) {
          onRight();
        } else {
          $("#engCorrection").innerHTML = `<span class="eng-correction">${aHtml(answer)}</span>`;
          onWrong(q, wrongHtml(answer), inputEl.value.trim());
        }
      },
      review: (q) => {
        if (q.word) return `<span class="eng-review-word"><img src="${esc(q.img)}" alt="" /><span dir="ltr">${esc(q.en)}</span> — ${esc(q.he)}</span>`;
        if (SUBJECT) return TYPES.choice.review(q);
        return `<span dir="ltr">${sentenceHtml(q, q.answer, "right")}</span>`;
      },
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
          <div class="eng-order-line" id="engOrderLine" dir="${TEXT_DIR}"></div>
          <div class="eng-order-bank" id="engOrderBank" dir="${TEXT_DIR}"></div>
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
        if (inTest()) {
          $("#engOrderLine").classList.add("is-picked");
          testAnswer(q, isRight, placed.map((i) => tokens[i]).join(" "));
          return;
        }
        $("#engOrderLine").classList.add(isRight ? "is-right" : "is-wrong");
        if (isRight) onRight();
        else onWrong(q, `${esc(t("fixLabel"))} <span dir="${TEXT_DIR}">${esc(q.answer)}</span>`, placed.map((i) => tokens[i]).join(" "));
      },
      review: (q) => `<span dir="${TEXT_DIR}">${esc(q.answer)}</span>${q.he ? ` <span class="eng-review-he">${esc(q.he)}</span>` : ""}`,
    },

    picture: {
      render(q) {
        const options = wordOptions(q);
        renderRunnerShell(`
          ${instructionsHtml()}
          <div class="eng-picture-box${q.text ? " eng-picture-box--small" : ""}"><img class="eng-picture-img" src="${esc(q.img)}" alt="" draggable="false" /></div>
          ${q.text ? wordSentenceHtml(q) : ""}
          <div class="eng-options" dir="ltr">
            ${options
              .map(
                (o, i) =>
                  `<button type="button" class="eng-option js-answer" data-word="${esc(o.word)}"><span class="eng-option-key">${i + 1}</span>${esc(o.en)}${sayOptHtml(o.en)}</button>`
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
        // A new exercise shows the word inside a sentence.
        const prompt = q.text
          ? wordSentenceHtml(q, true)
          : wordPromptHtml(q.en);
        renderRunnerShell(`
          ${instructionsHtml()}
          ${prompt}
          ${picOptionsHtml(wordOptions(q))}
          ${feedbackHtml}`,
          questionProgress()
        );
        answerButtons().forEach((btn) => btn.addEventListener("click", () => pictureAnswer(q, btn.dataset.word)));
      },
    },

    listen: {
      render(q) {
        // A new exercise says the word inside a whole sentence.
        const said = q.text ? fullSentence(q) : q.en;
        const prompt = canSpeak()
          ? `<div class="eng-listen-prompt">
               <button type="button" class="eng-listen-btn" id="engListenBtn" aria-label="${esc(t("play"))}">${ICONS.listen}</button>
               <span class="eng-listen-label" id="engListenLabel"${q.text ? ' dir="auto"' : ""}>${esc(t("playAgain"))}</span>
             </div>`
          : `<div class="eng-listen-prompt"><p class="eng-listen-fallback">${esc(t("noSpeech"))}</p><span class="eng-word-big${q.text ? " eng-word-big--sentence" : ""}" dir="ltr">${esc(said)}</span></div>`;
        renderRunnerShell(`
          ${instructionsHtml()}
          ${prompt}
          ${picOptionsHtml(wordOptions(q))}
          ${feedbackHtml}`,
          questionProgress()
        );
        answerButtons().forEach((btn) => btn.addEventListener("click", () => pictureAnswer(q, btn.dataset.word)));
        $("#engListenBtn")?.addEventListener("click", () => speak(said));
        // Clicking the previous answer counts as user activation, so the
        // browser lets the word play on its own.
        setTimeout(() => {
          if (runner.round[runner.index] === q && !runner.answered) speak(said);
        }, 350);
      },
    },

    match: {
      render(board) {
        const sideA = shuffle(board.pairs.map((p, i) => ({ p, i })));
        const sideB = shuffle(board.pairs.map((p, i) => ({ p, i })));
        runner.state = { board, selected: null, matched: new Set(), errored: new Set() };
        // Whole sentences (new exercises) get smaller text and their own height.
        // A subject's Hebrew explanations are longer words than English ones.
        const long = (text) => (text.includes("___") || text.length > (SUBJECT ? 40 : 26) ? " eng-match-item--long" : "");
        const itemB = ({ p, i }) =>
          p.img
            ? `<button type="button" class="eng-match-item eng-match-item--img" data-side="b" data-i="${i}"><img src="${esc(p.img)}" alt="" draggable="false" /></button>`
            : `<button type="button" class="eng-match-item${long(p.b)}" data-side="b" data-i="${i}" dir="auto">${aHtml(p.b)}</button>`;
        const total = board.pairs.length;
        renderRunnerShell(
          `
          ${instructionsHtml()}
          <div class="eng-match" dir="${TEXT_DIR}">
            <div class="eng-match-col">${sideA.map(({ p, i }) => `<button type="button" class="eng-match-item${long(p.a)}" data-side="a" data-i="${i}" dir="${SUBJECT ? "auto" : "ltr"}">${aHtml(p.a)}${sayOptHtml(p.a)}</button>`).join("")}</div>
            <div class="eng-match-col">${sideB.map(itemB).join("")}</div>
          </div>
          ${feedbackHtml}`,
          progressHtml({ label: t("matchProgress", 0, total), total, done: 0 })
        );
        $$(".eng-match-item").forEach((item) => item.addEventListener("click", () => this.pick(item)));
        fitMatchBoard();
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
          $("#engBar").innerHTML = barHtml(total, done, -1, done - 1);
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
          bankAnswer(p, !errored.has(i));
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
          : `<span dir="${SUBJECT ? "auto" : "ltr"}">${aHtml(p.a)}</span> — <span dir="auto">${aHtml(p.b)}</span>`,
    },
  };
  TYPES["pick-picture"].review = TYPES.picture.review;
  TYPES.listen.review = TYPES.picture.review;

  /* ── Exercise types built by english-more.js ── */

  // The wrong words of a find-error question, without end punctuation.
  function errorWords(q) {
    return q.text.split(" ").slice(q.from, q.to).join(" ").replace(/[.,!?;:]+$/, "");
  }

  TYPES["find-error"] = {
    render(q) {
      const tokens = q.text.split(" ");
      const hint = q.hint ? ` <span class="eng-hint">(${esc(q.hint)})</span>` : "";
      renderRunnerShell(`
        ${instructionsHtml()}
        <div class="eng-sentence eng-sentence--tokens" dir="ltr">
          <p id="engSentence">${tokens.map((tk, i) => `<button type="button" class="eng-token js-token" data-i="${i}">${esc(tk)}</button>`).join("")}${hint}</p>
          ${contextHtml(q)}
          <div id="engFix"></div>
          ${translationHtml(q)}
        </div>
        ${feedbackHtml}`,
        questionProgress()
      );
      $$(".js-token", views.exercise()).forEach((btn) => btn.addEventListener("click", () => this.answer(q, Number(btn.dataset.i))));
    },
    answer(q, index) {
      if (runner.answered) return;
      runner.answered = true;
      const isRight = index >= q.from && index < q.to;
      $$(".js-token", views.exercise()).forEach((btn) => {
        const i = Number(btn.dataset.i);
        btn.disabled = true;
        if (i >= q.from && i < q.to) btn.classList.add("is-error", isRight ? "is-found" : "is-missed");
        else if (i === index) btn.classList.add("is-miss");
      });
      $("#engFix").innerHTML = `<p class="eng-fix">${ICONS.check}<span>${esc(q.full)}</span></p>`;
      if (isRight) onRight(t("foundError"), AUTO_NEXT_WITH_FIX_MS);
      else
        onWrong(
          q,
          `${esc(t("errorWas"))} <bdi dir="ltr">${esc(errorWords(q))}</bdi> · ${esc(t("shouldBe"))} <bdi dir="ltr">${esc(q.fix)}</bdi>`,
          q.text.split(" ")[index].replace(/[.,!?;:]+$/, "")
        );
    },
    review: (q) =>
      `<span dir="ltr"><s class="eng-review-wrong">${esc(errorWords(q))}</s> → <strong>${esc(q.fix)}</strong> · ${esc(q.full)}</span>`,
  };

  TYPES["sentence-choice"] = {
    render(q) {
      const options = shuffle(q.options);
      renderRunnerShell(`
        ${instructionsHtml()}
        ${q.he ? `<p class="eng-order-he">${esc(q.he)}</p>` : ""}
        ${q.context ? `<div class="eng-sc-context" dir="ltr">${contextHtml(q)}</div>` : ""}
        <div class="eng-options eng-options--sentences" dir="ltr">
          ${options
            .map(
              (opt, i) =>
                `<button type="button" class="eng-option eng-option--sentence js-answer" data-option="${esc(opt)}"><span class="eng-option-key">${i + 1}</span>${esc(opt)}</button>`
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
      lockAnswers();
      answerButtons().forEach((btn) => {
        if (btn.dataset.option === q.answer) btn.classList.add("is-right");
        else if (btn.dataset.option === choice) btn.classList.add("is-wrong");
      });
      if (choice === q.answer) onRight();
      else onWrong(q, `${esc(t("fixLabel"))} <bdi dir="ltr">${esc(q.answer)}</bdi>`, choice);
    },
    review: (q) => `<span dir="ltr">${esc(q.answer)}</span>${q.he ? ` <span class="eng-review-he">${esc(q.he)}</span>` : ""}`,
  };

  /* A conversation with Robo (english-chat.js): his line, out loud, and three
     replies to choose from. The exchange before stays on screen above it,
     so the chat reads on; the right reply then joins the chat as the
     student's message. A line on its own (my mistakes, a mixed round, a
     mistakes retry) has no exchange before it. */
  function chatRowHtml(who, text, he, extra = "") {
    const bot = who === "bot";
    return `
      <div class="eng-chat-row is-${who}">
        <span class="eng-chat-avatar" role="img" aria-label="${esc(t(bot ? "chatBot" : "chatMe"))}">${bot ? ICONS.robo : ICONS.me}</span>
        <div class="eng-chat-bubble">
          <p class="eng-chat-text" lang="en" dir="ltr">${esc(text)}${extra}</p>
          ${he ? `<p class="eng-translation eng-chat-he" dir="rtl" lang="he">${esc(he)}</p>` : ""}
        </div>
      </div>`;
  }

  TYPES.chat = {
    render(q) {
      const prev = !runner.review && !runner.isRetry && runner.index > 0 ? runner.round[runner.index - 1] : null;
      const options = shuffle(q.options);
      renderRunnerShell(`
        ${instructionsHtml()}
        <div class="eng-chat" id="engChat" dir="ltr">
          ${prev ? `<div class="eng-chat-prev">${chatRowHtml("bot", prev.text, prev.he)}${chatRowHtml("me", prev.answer, prev.replyHe)}</div>` : ""}
          ${chatRowHtml("bot", q.text, q.he, speakBtn(q.text, "eng-speak--inline"))}
          <div id="engChatReply"></div>
        </div>
        <div class="eng-options eng-options--sentences eng-chat-options" dir="ltr">
          ${options
            .map(
              (opt, i) =>
                `<button type="button" class="eng-option eng-option--sentence js-answer" data-option="${esc(opt)}"><span class="eng-option-key">${i + 1}</span>${esc(opt)}</button>`
            )
            .join("")}
        </div>
        ${feedbackHtml}`,
        questionProgress()
      );
      answerButtons().forEach((btn) => btn.addEventListener("click", () => this.answer(q, btn.dataset.option)));
      // Robo says his line on his own.
      const shown = runner.index;
      setTimeout(() => runner.index === shown && runner.phase === "question" && !runner.answered && speak(q.text), 350);
    },
    answer(q, choice) {
      if (runner.answered) return;
      runner.answered = true;
      const isRight = choice === q.answer;
      lockAnswers();
      if (inTest()) {
        answerButtons().find((btn) => btn.dataset.option === choice)?.classList.add("is-picked");
        testAnswer(q, isRight, choice);
        return;
      }
      answerButtons().forEach((btn) => {
        if (btn.dataset.option === q.answer) btn.classList.add("is-right");
        else if (btn.dataset.option === choice) btn.classList.add("is-wrong");
      });
      $("#engChatReply").innerHTML = chatRowHtml("me", q.answer, q.replyHe);
      speak(q.answer);
      if (isRight) onRight(t("correct"), AUTO_NEXT_MS + 600);
      else onWrong(q, esc(t("chatWrong")), choice);
    },
    review: (q) => `<span dir="ltr">${esc(q.text)} → <strong>${esc(q.answer)}</strong></span>`,
  };

  // A short picture word gets two letters of another word as decoys.
  function wordDecoys(q) {
    if (q.en.replace(/[^A-Za-z]/g, "").length > 4) return [];
    const other = shuffle(runner.exercise.words.filter((id) => id !== q.word && VOCAB[id]))[0];
    return other ? shuffle([...VOCAB[other].en.replace(/[^A-Za-z]/g, "")]).slice(0, 2) : [];
  }

  // Spell the answer with letter tiles. Spaces, apostrophes and hyphens stay
  // fixed in the answer line; only letters are tiles.
  TYPES.letters = {
    render(q) {
      const answer = q.word ? q.en : q.answer;
      const chars = [...answer];
      const slots = chars.map((c, i) => (/[A-Za-z]/.test(c) ? i : -1)).filter((i) => i >= 0);
      const letters = slots.map((i) => chars[i]);
      let tiles = shuffle([...letters, ...(q.word ? wordDecoys(q) : q.extra || [])]);
      for (let tries = 0; tries < 6 && tiles.length > 1 && tiles.slice(0, letters.length).join("") === letters.join(""); tries++) {
        tiles = shuffle(tiles);
      }
      runner.state = { chars, slots, tiles, placed: [] };
      const prompt = q.word
        ? `<div class="eng-picture-box eng-picture-box--small"><img class="eng-picture-img" src="${esc(q.img)}" alt="" draggable="false" />${pictureHeHtml(q)}</div>`
        : `<div class="eng-sentence" dir="ltr"><p id="engSentence">${sentenceHtml(q)}</p>${translationHtml(q)}</div>`;
      renderRunnerShell(`
        ${instructionsHtml()}
        ${prompt}
        <div class="eng-letter-slots" id="engSlots" dir="ltr"></div>
        <div class="eng-letter-bank" id="engBank" dir="ltr"></div>
        ${feedbackWithCheckHtml(true)}`,
        questionProgress()
      );
      $("#engCheck").addEventListener("click", () => this.answer(q));
      this.draw();
    },
    draw() {
      const { chars, slots, tiles, placed } = runner.state;
      let next = 0;
      $("#engSlots").innerHTML = chars
        .map((c, i) => {
          if (!slots.includes(i)) return c === " " ? `<span class="eng-letter-gap"></span>` : `<span class="eng-letter-fixed">${esc(c)}</span>`;
          const n = next++;
          const tile = placed[n];
          return tile == null
            ? `<span class="eng-letter-slot" aria-label="${esc(t("lettersLabel", n + 1))}"></span>`
            : `<button type="button" class="eng-letter-slot is-filled" data-tile="${tile}">${esc(tiles[tile])}</button>`;
        })
        .join("");
      $("#engBank").innerHTML = tiles
        .map((ch, i) => {
          const used = placed.includes(i);
          return `<button type="button" class="eng-chip eng-letter-tile${used ? " is-used" : ""}" data-tile="${i}"${used ? ' tabindex="-1" aria-hidden="true"' : ""}>${esc(ch)}</button>`;
        })
        .join("");
      const check = $("#engCheck");
      if (check) check.disabled = runner.answered || placed.length !== slots.length;
      if (runner.answered) {
        $$("#engSlots button").forEach((btn) => {
          btn.disabled = true;
        });
        return;
      }
      $$("#engSlots .is-filled").forEach((btn) => btn.addEventListener("click", () => this.remove(Number(btn.dataset.tile))));
      $$("#engBank .eng-letter-tile:not(.is-used)").forEach((btn) => btn.addEventListener("click", () => this.place(Number(btn.dataset.tile))));
    },
    place(tile) {
      const st = runner.state;
      if (runner.answered || st.placed.length >= st.slots.length || st.placed.includes(tile)) return;
      st.placed = [...st.placed, tile];
      this.draw();
    },
    remove(tile) {
      if (runner.answered) return;
      runner.state.placed = runner.state.placed.filter((i) => i !== tile);
      this.draw();
    },
    // Typing on a keyboard places the first free tile with that letter.
    key(e) {
      const st = runner.state;
      if (e.key === "Backspace") {
        e.preventDefault();
        if (st.placed.length) this.remove(st.placed[st.placed.length - 1]);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (st.placed.length === st.slots.length) $("#engCheck")?.click();
      } else if (/^[a-z]$/i.test(e.key)) {
        const tile = st.tiles.findIndex((ch, i) => !st.placed.includes(i) && ch.toLowerCase() === e.key.toLowerCase());
        if (tile < 0) return;
        e.preventDefault();
        this.place(tile);
      }
    },
    answer(q) {
      if (runner.answered) return;
      const { chars, slots, tiles, placed } = runner.state;
      if (placed.length !== slots.length) return;
      runner.answered = true;
      let next = 0;
      const built = chars.map((c, i) => (slots.includes(i) ? tiles[placed[next++]] : c)).join("");
      const answer = q.word ? q.en : q.answer;
      const isRight = [answer, ...(q.accept || [])].map(normalize).includes(normalize(built));
      this.draw();
      $("#engSlots").classList.add(isRight ? "is-right" : "is-wrong");
      $("#engBank").classList.add("hidden");
      if (!q.word) $("#engSentence").innerHTML = sentenceHtml(q, answer, isRight ? "right" : "wrong");
      if (isRight) onRight(q.word ? `${t("correct")} ${q.en} — ${q.he}` : t("correct"));
      else onWrong(q, `${esc(t("wrong", ""))}<bdi dir="ltr">${esc(answer)}</bdi>`, built);
    },
    review: (q) => (q.word ? TYPES.picture.review(q) : `<span dir="ltr">${sentenceHtml(q, q.answer, "right")}</span>`),
  };

  /* Dictation answers are compared word by word: case, punctuation and
     contractions don't matter ("isn't" = "is not"), and numbers up to 20 may
     be digits. */
  const CONTRACTIONS = [
    [/\bcan't\b/g, "can not"],
    [/\bcannot\b/g, "can not"],
    [/\bwon't\b/g, "will not"],
    [/n't\b/g, " not"],
    [/'m\b/g, " am"],
    [/'re\b/g, " are"],
    [/'ll\b/g, " will"],
    [/'ve\b/g, " have"],
    [/'d\b/g, " would"],
  ];
  const NUMBER_WORDS = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty".split(" ");

  function dictationWords(str) {
    let text = normalize(str).replace(/[.,!?;:"“”()]/g, " ").replace(/[-–—]/g, " ");
    CONTRACTIONS.forEach(([re, full]) => {
      text = text.replace(re, full);
    });
    return text
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => (/^\d+$/.test(w) && Number(w) <= 20 ? NUMBER_WORDS[Number(w)] : w))
      .join(" ");
  }

  TYPES.dictation = {
    render(q) {
      const said = q.word ? q.en : q.answer;
      const spoken = canSpeak();
      // The picture would give a word away, so it shows only after the answer
      // — or as the prompt, with the Hebrew, when the browser can't speak.
      const picture = q.word
        ? `<div class="eng-picture-box eng-picture-box--small${spoken ? " hidden" : ""}" id="engDictPic"><img class="eng-picture-img" src="${esc(q.img)}" alt="" draggable="false" />${pictureHeHtml(q)}</div>`
        : "";
      const prompt = spoken
        ? `<div class="eng-listen-prompt eng-dict-prompt">
             <button type="button" class="eng-listen-btn" id="engListenBtn" aria-label="${esc(t("play"))}">${ICONS.listen}</button>
             <button type="button" class="eng-tool eng-slow-btn" id="engSlowBtn" title="${esc(t("slowLabel"))}">${ICONS.slow}<span>${esc(t("slow"))}</span></button>
           </div>
           ${q.word ? "" : `<div class="eng-dict-tr">${translationHtml(q)}</div>`}`
        : `<p class="eng-listen-fallback">${esc(t("noSpeechWrite"))}</p>${q.word ? "" : `<p class="eng-order-he">${esc(q.he)}</p>`}`;
      const input = `<input type="text" class="eng-input" id="engInput" dir="ltr" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done" aria-label="${esc(t("typeHere"))}" placeholder="${esc(t("typeHere"))}" />`;
      renderRunnerShell(`
        ${instructionsHtml()}
        ${picture}
        ${prompt}
        <div class="eng-write-solo${q.word ? "" : " eng-write-solo--sentence"}" dir="ltr">${input}<span id="engCorrection"></span></div>
        ${feedbackWithCheckHtml()}`,
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
      $("#engListenBtn")?.addEventListener("click", () => speak(said));
      $("#engSlowBtn")?.addEventListener("click", () => speak(said, 0.55));
      inputEl.focus({ preventScroll: true });
      // Clicking the previous answer counts as user activation, so the
      // browser lets it play on its own.
      setTimeout(() => {
        if (runner.round[runner.index] === q && !runner.answered) speak(said);
      }, 350);
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
      const said = q.word ? q.en : q.answer;
      const given = dictationWords(inputEl.value);
      const isRight = [said, ...(q.accept || [])].some((a) => dictationWords(a) === given);
      inputEl.readOnly = true;
      inputEl.classList.add(isRight ? "is-right" : "is-wrong");
      $("#engDictPic")?.classList.remove("hidden");
      if (isRight) {
        onRight(q.word ? `${t("correct")} ${q.en} — ${q.he}` : t("correct"));
      } else {
        $("#engCorrection").innerHTML = `<span class="eng-correction">${esc(said)}</span>`;
        onWrong(q, `${esc(t("wrong", ""))}<bdi dir="ltr">${esc(said)}</bdi>`, inputEl.value.trim());
      }
    },
    review: (q) =>
      q.word ? TYPES.picture.review(q) : `<span dir="ltr">${esc(q.answer)}</span>${q.he ? ` <span class="eng-review-he">${esc(q.he)}</span>` : ""}`,
  };

  // A vocabulary word one way or the other: "en-he" shows the English word
  // and Hebrew answers, "he-en" the other way round. No pictures, so every
  // word of the topic can take part.
  TYPES.translate = {
    render(q) {
      const toHe = runner.exercise.dir === "en-he";
      const label = (o) => (toHe ? o.he : o.en);
      const others = shuffle(runner.exercise.words.map(wordItem).filter((o) => o && label(o) !== label(q)));
      const options = shuffle([q, ...others.filter((o, i) => others.findIndex((x) => label(x) === label(o)) === i).slice(0, 3)]);
      const prompt = toHe
        ? wordPromptHtml(q.en)
        : `<div class="eng-word-prompt"><span class="eng-word-big eng-word-big--he" dir="rtl" lang="he">${esc(q.he)}</span></div>`;
      renderRunnerShell(`
        ${instructionsHtml()}
        ${prompt}
        <div class="eng-options" dir="${toHe ? "rtl" : "ltr"}">
          ${options
            .map(
              (o, i) =>
                `<button type="button" class="eng-option js-answer${toHe ? " eng-option--he" : ""}" data-word="${esc(o.word)}"${toHe ? ' lang="he"' : ""}><span class="eng-option-key">${i + 1}</span>${esc(label(o))}${toHe ? "" : sayOptHtml(o.en)}</button>`
            )
            .join("")}
        </div>
        ${feedbackHtml}`,
        questionProgress()
      );
      answerButtons().forEach((btn) => btn.addEventListener("click", () => pictureAnswer(q, btn.dataset.word)));
    },
    review: (q) => `<span dir="ltr">${esc(q.en)}</span> — ${esc(q.he)}`,
  };

  /* ── Speaking: the word plays, the student clicks the microphone and says
     it, and the browser's speech recognition hears it. Only where the
     browser can recognize speech (Chrome, Edge, Safari) — elsewhere the
     exercise isn't listed. Each word has SPEAK_TRIES tries; hearing nothing
     doesn't use one up. Saying the word inside a few others ("a cat", "it's
     a cat") counts. Its questions stay out of the mistake bank, since a
     review round may run where there is no microphone. ── */

  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  const SPEAK_TRIES = 3;
  let listening = null;

  function canListen() {
    return !!Recognition && window.isSecureContext !== false;
  }

  function stopListening() {
    const rec = listening;
    listening = null;
    try {
      rec?.abort();
    } catch {
      /* ignore */
    }
  }

  // What was said, as plain words: no case or punctuation, numbers as words.
  function spokenWords(str) {
    return dictationWords(str).replace(/^(a|an|the) /, "");
  }

  function saidRight(q, heard) {
    const accepted = [q.en, ...(q.accept || [])].map(spokenWords);
    return heard.some((said) => {
      const words = ` ${spokenWords(said)} `;
      return accepted.some((a) => words.includes(` ${a} `));
    });
  }

  TYPES.speak = {
    render(q) {
      runner.state = { tries: 0 };
      const mic = canListen()
        ? `<div class="eng-mic-row">
             <button type="button" class="eng-mic-btn" id="engMicBtn" aria-label="${esc(t("speakMic"))}">${ICONS.mic}</button>
             <span class="eng-mic-label" id="engMicLabel">${esc(t("speakTap"))}</span>
           </div>`
        : `<p class="eng-listen-fallback">${esc(t("speakNoSupport"))}</p>`;
      renderRunnerShell(`
        ${instructionsHtml()}
        <div class="eng-picture-box eng-picture-box--small"><img class="eng-picture-img" src="${esc(q.img)}" alt="" draggable="false" />${pictureHeHtml(q)}</div>
        <p class="eng-speak-word" dir="ltr">${esc(q.en)}${speakBtn(q.en, "eng-speak--inline")}</p>
        ${mic}
        <p class="eng-heard" id="engHeard" aria-live="polite"></p>
        <div class="eng-actions"><button type="button" class="btn btn-candy font-cartoon eng-btn-secondary eng-skip" id="engSkip">${esc(t("speakSkip"))}</button></div>
        ${feedbackHtml}`,
        questionProgress()
      );
      $("#engMicBtn")?.addEventListener("click", () => this.listen(q));
      $("#engSkip").addEventListener("click", () => this.fail(q, ""));
      // Clicking the previous answer counts as user activation, so the
      // browser lets the word play on its own.
      setTimeout(() => {
        if (runner.round[runner.index] === q && !runner.answered && !listening) speak(q.en);
      }, 350);
    },
    // A second click while listening stops it.
    listen(q) {
      if (runner.answered) return;
      if (listening) {
        stopListening();
        this.idle();
        return;
      }
      window.PleyiSpeech.stop();
      const rec = new Recognition();
      rec.lang = "en-US";
      rec.interimResults = false;
      rec.continuous = false;
      rec.maxAlternatives = 5;
      let heard = [];
      let error = "";
      rec.onresult = (e) => {
        heard = Array.from(e.results[0] || [], (alt) => alt.transcript).filter(Boolean);
      };
      rec.onerror = (e) => {
        error = e.error;
      };
      rec.onend = () => {
        // Stopped by the student, or the question is gone.
        if (listening !== rec) return;
        listening = null;
        this.idle();
        if (error === "not-allowed" || error === "service-not-allowed") this.note(t("speakNoMic"));
        else if (error === "network") this.note(t("speakOffline"));
        else if (!heard.length) this.note(t("speakNoSound"));
        else this.check(q, heard);
      };
      listening = rec;
      $("#engMicBtn")?.classList.add("is-on");
      $("#engMicLabel").textContent = t("speakListening");
      $("#engHeard").textContent = "";
      try {
        rec.start();
      } catch {
        listening = null;
        this.idle();
      }
    },
    idle() {
      $("#engMicBtn")?.classList.remove("is-on");
      const label = $("#engMicLabel");
      if (label) label.textContent = t("speakTap");
    },
    note(text) {
      const line = $("#engHeard");
      if (line) line.textContent = text;
      fitCard();
    },
    check(q, heard) {
      const said = `<span>${esc(t("speakHeard"))}</span> <bdi dir="ltr">${esc(heard[0])}</bdi>`;
      if (saidRight(q, heard)) {
        runner.answered = true;
        this.done();
        $("#engHeard").innerHTML = said;
        onRight(`${t("speakRight")} ${q.en}`);
        return;
      }
      runner.state.tries++;
      const left = SPEAK_TRIES - runner.state.tries;
      if (left > 0) {
        $("#engHeard").innerHTML = `${said} · ${esc(t("speakAgain", left))}`;
        playSfx("wrong");
        fitCard();
        return;
      }
      $("#engHeard").innerHTML = said;
      this.fail(q, heard[0]);
    },
    fail(q, given) {
      if (runner.answered) return;
      runner.answered = true;
      stopListening();
      this.done();
      onWrong(q, `${esc(t("speakAnswer"))} <bdi dir="ltr">${esc(q.en)}</bdi>`, given);
    },
    // Answered: the microphone and the skip button go.
    done() {
      $(".eng-mic-row", views.exercise())?.classList.add("hidden");
      $(".eng-actions", views.exercise())?.classList.add("hidden");
    },
    review: (q) => TYPES.picture.review(q),
  };

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

  /* A picture word inside a new sentence (made by the server): the text has
     a ___ where the word goes. */

  function fullSentence(q) {
    return q.text.replace("___", q.en);
  }

  // `shown` puts the word in its place (pick-picture reads it there);
  // otherwise the sentence keeps its blank until the answer.
  function wordSentenceHtml(q, shown = false) {
    const say = shown ? speakBtn(fullSentence(q), "eng-speak--sentence") : "";
    return `<div class="eng-sentence eng-sentence--word" dir="ltr"><p id="engSentence">${sentenceHtml(q, shown ? q.en : "", "word")}${say}</p>${translationHtml({ he: q.sentenceHe })}</div>`;
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
    $("#engListenLabel")?.replaceChildren(document.createTextNode(q.text ? fullSentence(q) : q.en));
    if (q.text && runner.exercise.type === "picture") $("#engSentence").innerHTML = sentenceHtml(q, q.en, isRight ? "right" : "wrong");
    if (isRight) {
      onRight(`${t("correct")} ${q.en} — ${q.he}`);
    } else {
      // What the student picked, as it read on the button.
      const picked = runner.exercise.dir === "en-he" ? VOCAB[wordId]?.he : VOCAB[wordId]?.en;
      onWrong(q, `${esc(t("wrong", ""))}<span dir="ltr">${esc(q.en)}</span> — ${esc(q.he)} ${speakBtn(q.en, "eng-speak--inline")}`, picked || wordId);
      $$("#engFeedback .eng-speak").forEach((btn) => btn.addEventListener("click", () => speak(btn.dataset.say)));
    }
  }

  /* ── Reading passages (unseen) ──
     A passage is a list of paragraphs in which [word] or [two words] marks a
     word the student has to find. Stage "mark" (only when the unit has
     `mark`): click every such word in the text — each one found is a point,
     each wrong click takes one away; a unit without it starts with stage
     "read", the passage alone. Stage "questions": multiple choice (mc),
     true / false (tf) and open questions, one at a time and without the
     passage — "Back to the text" shows it again for a moment. */

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
      stage: marking ? "mark" : "read",
      found: new Set(),
      misses: new Set(),
      revealed: new Set(),
      markScore: 0,
      qScore: 0,
    };
    runner.total = (marking ? targets.length : 0) + runner.round.length;
    renderReading();
  }

  function startQuestions() {
    runner.read.stage = "questions";
    runner.index = 0;
    prepareQuestion();
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

  // One segment for the first step (reading the passage, or marking in it)
  // plus one per question.
  function readingProgress() {
    const st = runner.read;
    const first = st.stage !== "questions";
    const pos = first ? 0 : 1 + runner.index;
    const fresh = runner.barIndex === pos ? -1 : pos - 1;
    runner.barIndex = pos;
    const label = first ? t(st.stage === "mark" ? "markStep" : "readStep") : t("questionNum", runner.index + 1, runner.round.length);
    return progressHtml({ label, total: 1 + runner.round.length, done: pos, current: pos, fresh });
  }

  // Words can be clicked while marking, or — with "Translate words" on — to
  // see their meaning, in both stages (then a click doesn't mark).
  function marking() {
    return runner.read.stage === "mark" && !markComplete() && !prefs.words;
  }

  function passageClass() {
    return `eng-read-text${marking() ? " is-marking" : ""}${prefs.words ? " is-dict" : ""}`;
  }

  function passageHtml() {
    const st = runner.read;
    const markable = marking();
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
        // could break between a word and the period after it. Numbers have
        // nothing to translate.
        html =
          markable || (prefs.words && /[A-Za-z]/.test(tok.text))
            ? `<span class="eng-tok${cls}" role="button" tabindex="0" data-t="${i}">${html}</span>`
            : `<span class="eng-tok${cls}" data-t="${i}">${html}</span>`;
      }
      (paras[tok.p] ||= []).push(html);
    });
    return paras.map((p) => `<p>${p.join("")}</p>`).join("");
  }

  // Redraws the passage's words after "Translate words" is switched; the
  // task next to it stays as it is.
  function refreshPassage() {
    const text = $("#engReadText");
    if (!text || !runner.read) return;
    dict.close();
    text.className = passageClass();
    text.innerHTML = passageHtml();
    $("#engDictNote")?.classList.toggle("hidden", !prefs.words || markComplete());
  }

  function clickWord(tok) {
    if (prefs.words) dict.toggle(tok);
    else markToken(tok);
  }

  function renderReading() {
    const st = runner.read;
    const ex = runner.exercise;
    runner.phase = st.stage === "questions" ? "question" : st.stage;
    dict.at = -1;
    const glossary = ex.passage.glossary?.length
      ? `<p class="eng-read-glossary"><span class="eng-read-glossary-title" dir="auto">${esc(t("glossary"))}</span>${ex.passage.glossary
          .map((g) => `<span class="eng-read-gloss"><b>${esc(g.en)}</b> = <span dir="rtl" lang="he">${esc(g.he)}</span></span>`)
          .join("")}</p>`
      : "";
    // Like every exercise, the instruction sits above the card. The card
    // holds one thing at a time: first the passage (with the marking count
    // and button under it), then the questions, with the passage a button
    // away.
    const marking = st.stage === "mark";
    const under = marking
      ? `<div class="eng-read-mark-foot">
          <div class="eng-read-count" id="engMarkCount" aria-live="polite"></div>
          <button type="button" class="eng-read-reveal${markComplete() ? " hidden" : ""}" id="engMarkReveal">${esc(t("markReveal"))}</button>
          <button type="button" class="btn btn-primary btn-candy font-cartoon eng-check${markComplete() ? "" : " hidden"}" id="engToQuestions">${esc(t("toQuestions"))}</button>
        </div>`
      : `<div class="eng-read-go"><button type="button" class="btn btn-primary btn-candy font-cartoon eng-check" id="engReadGo">${esc(t(st.stage === "read" ? "toQuestions" : "backToQuestion"))}</button></div>`;
    renderRunnerShell(
      `${readingInstructionsHtml()}
      <div class="eng-read eng-read--paged is-${st.stage}">
        <div class="eng-read-side">
          <article class="eng-read-passage" id="engReadPassage" lang="en" dir="ltr">
            <h3 class="eng-read-title">${esc(ex.passage.title)}</h3>
            <div class="${passageClass()}" id="engReadText">${passageHtml()}</div>
            ${glossary}
          </article>
          ${under}
        </div>
        <div class="eng-read-task" id="engReadTask"></div>
      </div>`,
      readingProgress()
    );
    if (marking) {
      showMarkCount();
      $("#engMarkReveal").addEventListener("click", revealMarks);
      $("#engToQuestions").addEventListener("click", finishMarking);
    }
    const text = $("#engReadText");
    text.addEventListener("click", (e) => {
      const tok = e.target.closest(".eng-tok[tabindex]");
      if (tok) clickWord(tok);
    });
    text.addEventListener("keydown", (e) => {
      const tok = e.target.closest?.(".eng-tok[tabindex]");
      if (!tok || (e.key !== "Enter" && e.key !== " ")) return;
      e.preventDefault();
      clickWord(tok);
    });
    $("#engReadGo")?.addEventListener("click", () => {
      if (runner.read.stage === "read") startQuestions();
      else setTextOpen(false);
    });
    renderReadingTask();
  }

  // While answering, swaps the question for the passage, or back.
  function setTextOpen(open) {
    const read = $(".eng-read");
    if (!read || read.classList.contains("is-text-open") === open) return;
    dict.close();
    read.classList.toggle("is-text-open", open);
    // Keyboard focus follows to the box that is now on screen; a question
    // waiting for a typed answer gets its cursor back.
    const input = $("#engInput");
    if (open) $("#engReadGo")?.focus({ preventScroll: true });
    else if (input && !runner.answered && window.matchMedia("(hover: hover)").matches) input.focus({ preventScroll: true });
    else $("#engReadBack")?.focus({ preventScroll: true });
  }

  function renderReadingTask() {
    const box = $("#engReadTask");
    if (!box) return;
    // A new task brings the task box back if the passage was enlarged.
    setTextOpen(false);
    if (runner.read.stage === "questions") renderQuestionTask(box);
    box.scrollTop = 0;
  }

  /* Marking stage */

  // The count with a bar that fills as words are found. Once every word is
  // found or shown, the closing message takes its place, so nothing below
  // it moves.
  function markCountHtml() {
    const st = runner.read;
    if (markComplete()) return markDoneHtml();
    const misses = st.misses.size;
    return `
      <span class="eng-read-count-line">
        <span class="eng-read-found">${esc(t("markFoundLabel"))} <b>${st.found.size}</b> ${esc(t("markOf", st.targets.length))}</span>
        ${misses ? `<span class="eng-read-misses">${esc(t("markMisses", misses))}</span>` : ""}
      </span>
      <span class="eng-read-meter" aria-hidden="true"><i></i></span>`;
  }

  function showMarkCount() {
    const box = $("#engMarkCount");
    const st = runner.read;
    box.innerHTML = markCountHtml();
    const bar = box.querySelector(".eng-read-meter i");
    if (bar) bar.style.width = `${(100 * st.found.size) / st.targets.length}%`;
  }

  function markDoneHtml() {
    return runner.read.revealed.size
      ? `<span class="eng-feedback-msg is-shown">${ICONS.highlighter}<span>${esc(t("markRevealed"))}</span></span>`
      : `<span class="eng-feedback-msg is-right">${ICONS.check}<span>${esc(t("markAllFound"))}</span></span>`;
  }

  // Above the card: what to do now. While marking, the instruction comes
  // with what to look for as chips (one phrase each, never broken across
  // lines).
  function readingInstructionsHtml() {
    const st = runner.read;
    if (st.stage !== "mark") {
      return instrBoxHtml(`<p class="eng-instr-line">${esc(t(st.stage === "read" ? "readInstr" : "questionsInstr"))}</p>`);
    }
    const mark = runner.exercise.mark;
    const hints = mark.hint ? mark.hint.split(" · ") : [];
    const chips = hints.length
      ? `<ul class="eng-read-chips${hints.length > 10 ? " is-many" : ""}">${hints.map((h) => `<li dir="ltr" lang="en">${esc(h)}</li>`).join("")}</ul>`
      : "";
    return instrBoxHtml(
      `<p class="eng-read-instr">${mixedText(loc(mark, "text"))}</p>
        ${chips}
        <p class="eng-read-dict-note${prefs.words && !markComplete() ? "" : " hidden"}" id="engDictNote">${ICONS.wordMeaning}<span>${esc(t("dictMarkNote"))}</span></p>`,
      " eng-read-instructions"
    );
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
    showMarkCount();
    if (!markComplete()) return;
    // Every word is found or shown: the text locks and the questions open
    // (its words still open their meaning when "Translate words" is on).
    $("#engReadText").classList.remove("is-marking");
    if (!prefs.words) {
      $$("#engReadText .eng-tok[tabindex]").forEach((tok) => {
        tok.removeAttribute("tabindex");
        tok.removeAttribute("role");
      });
    }
    $("#engDictNote")?.classList.add("hidden");
    $("#engMarkReveal").classList.add("hidden");
    $("#engToQuestions").classList.remove("hidden");
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
    startQuestions();
  }

  /* Word translation: with "Translate words" on, clicking a word in the
     passage opens a bubble with its Hebrew meaning — from the passage's own
     `words` (passages written by the AI) or english-dict.js. A word that
     is part of a phrase there ("wakes up", "a lot of") shows the phrase. */

  const DICT = window.ENGLISH_DICT || {};
  // "is there" is "is there…?" only at the start of a question ("The cat is
  // there."), and "going to" is the future only before a verb ("going to the
  // park"), so a phrase in the running text never starts with these. A
  // marked group of words ([going to]) is still looked up as a whole.
  const NO_PHRASE_START = new Set(["am", "is", "are", "was", "were", "will", "do", "does", "did", "be", "going"]);

  const dictKey = (text) => text.toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, " ").trim();

  function dictGet(key) {
    const own = runner.exercise?.passage?.words;
    return (own && Object.hasOwn(own, key) && own[key]) || (Object.hasOwn(DICT, key) && DICT[key]) || "";
  }

  // Forms a word may come from: cats → cat, played → play, making → make,
  // bigger → big, happily → happy. The likelier ones come first ("uses" is
  // "use", not "us").
  function baseForms(word) {
    const out = [];
    const add = (w) => {
      if (w.length > 1 && w !== word && !out.includes(w)) out.push(w);
    };
    const strip = (suffix, ...ends) => {
      if (!word.endsWith(suffix) || word.length < suffix.length + 2) return;
      const stem = word.slice(0, -suffix.length);
      ends.forEach((end) => add(stem + end));
      if (/([b-df-hj-np-tv-z])\1$/.test(stem)) add(stem.slice(0, -1));
    };
    strip("ies", "y");
    strip("s", "");
    strip("es", "");
    strip("ied", "y");
    strip("ed", "e", "");
    strip("ing", "e", "");
    strip("ier", "y");
    strip("iest", "y");
    strip("er", "e", "");
    strip("est", "e", "");
    strip("ily", "y");
    strip("ly", "");
    return out;
  }

  // { he, base } for a word or phrase, or null; `base` is set when the
  // meaning is another form's (played → play).
  function lookup(text) {
    const key = dictKey(text);
    const he = dictGet(key);
    if (he) return { he };
    const owner = key.match(/^(.+)'s$/) || key.match(/^(.+s)'$/);
    if (owner) {
      const found = lookup(owner[1]);
      return found ? { he: `של ${found.he}`, base: found.base } : null;
    }
    if (/[\s-]/.test(key)) return null;
    for (const base of baseForms(key)) {
      const baseHe = dictGet(base);
      if (baseHe) return { he: baseHe, base };
    }
    return null;
  }

  // The longest phrase (up to three words in a row, inside one sentence)
  // around word `i` that the dictionary has.
  function phraseAt(i) {
    const toks = runner.read.tokens;
    const step = (j, dir) => {
      const gap = toks[j + dir];
      const k = j + 2 * dir;
      return gap && !gap.word && /^\s+$/.test(gap.text) && toks[k]?.word && toks[k].p === toks[j].p ? k : -1;
    };
    const line = [i];
    for (let j = i, n = 0; n < 2 && (j = step(j, -1)) >= 0; n++) line.unshift(j);
    const at = line.length - 1;
    for (let j = i, n = 0; n < 2 && (j = step(j, 1)) >= 0; n++) line.push(j);
    for (const size of [3, 2]) {
      for (let s = Math.max(0, at - size + 1); s <= at && s + size <= line.length; s++) {
        const idx = line.slice(s, s + size);
        const text = idx.map((k) => toks[k].text).join(" ");
        if (NO_PHRASE_START.has(dictKey(toks[idx[0]].text))) continue;
        const he = dictGet(dictKey(text));
        if (he) return { idx, text, lines: [{ he }] };
      }
    }
    return null;
  }

  function meaningOf(i) {
    const tok = runner.read.tokens[i];
    const phrase = phraseAt(i);
    if (phrase) return phrase;
    const found = lookup(tok.text);
    if (found) return { idx: [i], text: tok.text, lines: [found] };
    // A marked group of words ("is eating") with no entry of its own: the
    // meaning of each word.
    if (/\s/.test(tok.text)) {
      const lines = tok.text.split(/\s+/).map((word) => ({ word, ...(lookup(word) || { he: "" }) }));
      if (lines.some((l) => l.he)) return { idx: [i], text: tok.text, lines };
    }
    return { idx: [i], text: tok.text, lines: [] };
  }

  function dictBubbleHtml(m) {
    const lines = m.lines.length
      ? m.lines
          .map(
            (l) =>
              `<p class="eng-dict-he" dir="rtl" lang="he">${l.word ? `<b dir="ltr" lang="en">${esc(l.word)}</b> ` : ""}${esc(l.he || "—")}${
                l.base ? `<span class="eng-dict-base">${esc(t("dictFrom", l.base))}</span>` : ""
              }</p>`
          )
          .join("")
      : `<p class="eng-dict-none" dir="auto">${esc(t("dictNone"))}</p>`;
    return `
      <div class="eng-dict-head">
        <span class="eng-dict-word">${esc(m.text)}</span>
        ${speakBtn(m.text, "eng-dict-speak")}
      </div>
      ${lines}`;
  }

  // The bubble lives inside the passage box, under the word (over it when
  // there's no room below), and scrolls with the text.
  const dict = {
    at: -1,
    toggle(tok) {
      const i = Number(tok.dataset.t);
      if (this.at === i && $("#engDictPop")) this.close();
      else this.open(i);
    },
    open(i) {
      this.close();
      const passage = $("#engReadPassage");
      const tok = $(`#engReadText .eng-tok[data-t="${i}"]`);
      if (!passage || !tok) return;
      const m = meaningOf(i);
      this.at = i;
      m.idx.forEach((k) => $(`#engReadText .eng-tok[data-t="${k}"]`)?.classList.add("is-looked"));
      const pop = document.createElement("div");
      pop.className = "eng-dict-pop";
      pop.id = "engDictPop";
      pop.setAttribute("role", "status");
      pop.innerHTML = dictBubbleHtml(m);
      passage.appendChild(pop);
      $(".eng-speak", pop)?.addEventListener("click", (e) => {
        e.stopPropagation();
        speak(e.currentTarget.dataset.say);
      });
      this.place(pop, tok, passage);
    },
    place(pop, tok, passage) {
      const box = passage.getBoundingClientRect();
      const r = tok.getClientRects()[0] || tok.getBoundingClientRect();
      const x = r.left - box.left - passage.clientLeft;
      const y = r.top - box.top - passage.clientTop + passage.scrollTop;
      const w = pop.offsetWidth;
      const h = pop.offsetHeight;
      const below = y + r.height + 6;
      const above = y - h - 6;
      const fitsBelow = below + h <= passage.scrollTop + passage.clientHeight;
      const top = fitsBelow || above < passage.scrollTop ? below : above;
      pop.style.left = `${Math.max(6, Math.min(x + r.width / 2 - w / 2, passage.clientWidth - w - 6))}px`;
      pop.style.top = `${top}px`;
      // Scroll the passage box (not scrollIntoView, which would also scroll
      // the fixed page) so the word and its bubble are both in view.
      const from = Math.min(top, y) - 6;
      const to = Math.max(top + h, y + r.height) + 6;
      if (to > passage.scrollTop + passage.clientHeight) passage.scrollTop = Math.min(from, to - passage.clientHeight);
      else if (from < passage.scrollTop) passage.scrollTop = from;
    },
    close() {
      $("#engDictPop")?.remove();
      $$("#engReadText .eng-tok.is-looked").forEach((el) => el.classList.remove("is-looked"));
      this.at = -1;
    },
  };

  /* Questions stage */

  const OPTION_KEYS_HE = ["א", "ב", "ג", "ד", "ה"];

  function openQuestionText(q) {
    return lang() === "en" && q.qEn ? q.qEn : q.q;
  }

  // Whether a question has a Hebrew version for "Hebrew questions".
  function hebrewQuestion(q) {
    return !!(q?.he || (q?.type === "open" && q.lang === "he"));
  }

  // A question as it is normally shown (English; a level 1–2 open question
  // in the page's language) and in Hebrew.
  function questionTexts(q) {
    if (q.type === "open") return { en: openQuestionText(q), he: q.lang === "he" ? q.q : q.he || "" };
    return { en: q.q, he: q.he || "" };
  }

  // Both versions go on the page, and the card's "Hebrew questions" switch
  // (.is-he-q) shows one — so switching never loses an answer in progress.
  // The element around them needs the class "has-he".
  function biText(en, he) {
    return `<span class="eng-q-en" dir="ltr" lang="en">${esc(en)}</span><span class="eng-q-he" dir="rtl" lang="he">${esc(he)}</span>`;
  }

  function questionHtml(q) {
    const { en, he } = questionTexts(q);
    if (!he || he === en) return `<p class="eng-read-q" dir="${q.type === "open" ? "auto" : "ltr"}">${esc(en)}</p>`;
    return `<p class="eng-read-q has-he">${biText(en, he)}</p>`;
  }

  function optionHe(q, i) {
    return (q.he && q.optionsHe?.[i]) || "";
  }

  // The right option of a multiple-choice question.
  function mcAnswerHtml(q) {
    const he = optionHe(q, q.options.indexOf(q.answer));
    return he ? `<span class="has-he">${biText(q.answer, he)}</span>` : `<span dir="ltr">${esc(q.answer)}</span>`;
  }

  function renderQuestionTask(box) {
    const q = runner.round[runner.index];
    let body;
    if (q.type === "mc") {
      const option = (oi, k) => {
        const he = optionHe(q, oi);
        return he
          ? `<button type="button" class="eng-read-option has-he js-answer" data-i="${oi}"><span class="eng-read-option-key">${biText(OPTION_KEYS[k], OPTION_KEYS_HE[k])}</span><span class="eng-read-option-text">${biText(q.options[oi], he)}</span></button>`
          : `<button type="button" class="eng-read-option js-answer" data-i="${oi}" dir="ltr"><span class="eng-read-option-key">${OPTION_KEYS[k]}</span><span class="eng-read-option-text">${esc(q.options[oi])}</span></button>`;
      };
      body = `
        ${questionHtml(q)}
        <div class="eng-read-options">${runner.state.order.map(option).join("")}</div>`;
    } else if (q.type === "tf") {
      body = `
        ${questionHtml(q)}
        <div class="eng-options eng-options--tf">
          <button type="button" class="eng-tf-btn eng-tf-btn--true js-answer" data-value="true">${ICONS.check}<span>${esc(t("trueBtn"))}</span></button>
          <button type="button" class="eng-tf-btn eng-tf-btn--false js-answer" data-value="false">${ICONS.cross}<span>${esc(t("falseBtn"))}</span></button>
        </div>`;
    } else {
      const inHebrew = q.lang === "he";
      const langNote = inHebrew ? (lang() === "he" ? t("answerHe") : t("answerAny")) : t("answerEn");
      body = `
        ${questionHtml(q)}
        <p class="eng-read-lang">${ICONS.write}<span>${esc(langNote)}</span></p>
        <textarea class="eng-read-input" id="engInput" rows="2" dir="${inHebrew ? "auto" : "ltr"}" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="done" aria-label="${esc(t("typeHere"))}" placeholder="${esc(t("typeHere"))}"></textarea>
        <div id="engModel"></div>
        <div class="eng-actions"><button type="button" class="btn btn-primary btn-candy font-cartoon eng-check" id="engCheck">${esc(t("check"))}</button></div>`;
    }
    box.innerHTML = `
      <div class="eng-read-q-head">
        <p class="eng-read-step">${esc(t("questionNum", runner.index + 1, runner.round.length))}</p>
        <button type="button" class="eng-read-back" id="engReadBack">${ICONS.reading}<span>${esc(t("backToText"))}</span></button>
      </div>
      ${body}
      <div class="eng-feedback eng-read-feedback" id="engFeedback" aria-live="polite"></div>`;
    $("#engReadBack").addEventListener("click", () => setTextOpen(true));

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
    else readWrong(q, `${esc(t("wrong", ""))}${mcAnswerHtml(q)}`, q.options[chosen]);
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
      const { en, he } = questionTexts(q);
      const question = he && he !== en ? `<span class="eng-review-line has-he">${biText(en, he)}</span>` : `<span class="eng-review-line" dir="auto">${esc(en)}</span>`;
      const answer =
        q.type === "mc"
          ? mcAnswerHtml(q)
          : `<bdi>${esc(q.type === "tf" ? t(q.answer ? "trueBtn" : "falseBtn") : lang() === "en" && q.answerEn ? q.answerEn : q.answer)}</bdi>`;
      const yours = q.type === "open" ? `<span class="eng-review-line eng-review-he"><span>${esc(t("yourAnswer"))}</span> <bdi>${esc(given)}</bdi></span>` : "";
      return `${question}<span class="eng-review-line eng-review-answer">${ICONS.check}${answer}</span>${yours}`;
    },
  };

  // A finished mistakes retry: the round it fixed, with every answer fixed
  // now added to that round's score.
  function fixedResult() {
    const { fix, score } = runner;
    return fix ? { score: Math.min(fix.total, fix.score + score), total: fix.total } : null;
  }

  // Sends a finished round to the student's file (when this device opened the
  // teacher's personal link) — once, so re-rendering the results on a language
  // switch doesn't resend it.
  function recordRound() {
    if (runner.recorded) return;
    runner.recorded = true;
    const { score, total, topic, exercise, isRetry, isNew, mistakeLog, startedAt, review } = runner;
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
      isNew,
      level: exerciseLevel(exercise),
      durationSec: Math.round((Date.now() - startedAt) / 1000),
      mistakes: mistakeLog,
    };
    const fixed = fixedResult();
    if (fixed) Object.assign(activity, { fixedScore: fixed.score, fixedTotal: fixed.total });
    // A mixed practice task counts as an exercise of its own, so finishing
    // it completes the task, and fixing its mistakes raises its grade. A
    // review round mixes many exercises too, but it is saved as practice of
    // its own, and like any mistakes practice it earns half the points.
    // Titles are in Hebrew, like the teacher's page.
    if (review?.daily) {
      // One round a day keeps the streak: in the file for a linked student
      // (the server answers with it), in this browser for a visitor.
      const levels = review.items.map((item) => exerciseLevel(item.source));
      Object.assign(activity, {
        topicId: DAILY_ROUTE,
        topicTitle: STR.he.dailyTitle,
        exerciseId: dayKey(),
        exerciseTitle: STR.he.dailyTitle,
        type: "daily",
        level: Math.round(levels.reduce((a, b) => a + b, 0) / Math.max(1, levels.length)) || 1,
      });
      if (!window.StudentProgress?.isLinked()) saveDailyDay(dayKey());
    } else if (review?.mix) {
      const levels = review.items.map((item) => exerciseLevel(item.source));
      Object.assign(activity, {
        topicId: MIX_ROUTE,
        topicTitle: STR.he.mixTitle,
        exerciseId: review.mix.exerciseId,
        exerciseTitle: review.mix.exerciseTitle || STR.he.mixTitle,
        type: "mix",
        level: Math.round(levels.reduce((a, b) => a + b, 0) / Math.max(1, levels.length)) || 1,
      });
    } else if (review) {
      const levels = review.items.map((item) => exerciseLevel(item.source));
      Object.assign(activity, {
        topicId: REVIEW_ROUTE,
        topicTitle: STR.he.reviewCardTitle,
        exerciseId: review.topicId || "all",
        exerciseTitle: review.topicId ? `${STR.he.reviewTitle} · ${findTopic(review.topicId)?.title || review.topicId}` : STR.he.reviewTitle,
        type: "review",
        isRetry: true,
        level: Math.round(levels.reduce((a, b) => a + b, 0) / Math.max(1, levels.length)) || 1,
      });
    }
    const round = runner.round;
    window.StudentProgress?.record(activity).then((result) => {
      if (result?.daily) dailyFresh = result.daily;
      // The student may have started another round meanwhile.
      if (!result || runner.round !== round) return;
      runner.earned = result;
      showEarned(result);
    });
  }

  /* ── Points earned (a linked student's results screen) ── */

  function earnedHtml(result) {
    if (!result?.earned) return "";
    const total = result.points ? ` · ${t("earnedTotal", result.points.total)}` : "";
    return `<span class="eng-earned-pill" title="${esc(t("earned", result.earned) + total)}">${ICONS.star}<span>${esc(t("earned", result.earned))}</span></span>`;
  }

  // Fills the slot in the header bar of the results screen (exercises), or
  // the header pills of a game's results screen.
  function showEarned(result) {
    const slot = $("#engEarned") || (runner.phase === "game" && $(".eng-game-results") && $("#engGameHud"));
    if (slot) slot.innerHTML = earnedHtml(result);
  }

  /* ── A grade of 90 and up: confetti over the screen, and the linked
     student's first name on top of the results, letter by letter on a teal
     marker. Visitors without a student link get the confetti only. ── */

  const CONFETTI_COLORS = ["#ffe135", "#00e5cc", "#ff7eb6", "#4da6ff", "#7ee08c", "#ff9f43"];

  function launchConfetti() {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    $(".eng-confetti")?.remove();
    const layer = document.createElement("div");
    layer.className = "eng-confetti";
    layer.setAttribute("aria-hidden", "true");
    for (let i = 0; i < 90; i++) {
      const piece = document.createElement("i");
      piece.style.setProperty("--x", `${Math.random() * 100}%`);
      piece.style.setProperty("--delay", `${Math.random() * 0.9}s`);
      piece.style.setProperty("--dur", `${2.4 + Math.random() * 1.6}s`);
      piece.style.setProperty("--drift", `${Math.round(Math.random() * 120 - 60)}px`);
      piece.style.setProperty("--rot", `${(Math.random() > 0.5 ? 1 : -1) * (360 + Math.round(Math.random() * 540))}deg`);
      piece.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
      if (i % 4 === 0) piece.className = "is-round";
      layer.appendChild(piece);
    }
    document.body.appendChild(layer);
    setTimeout(() => layer.remove(), 5200);
  }

  // A name split into letters (a letter with its niqqud stays whole).
  function nameLetters(text) {
    if (window.Intl?.Segmenter) return Array.from(new Intl.Segmenter().segment(text), (s) => s.segment);
    return Array.from(text);
  }

  // `slot`: the results block the name goes on top of.
  function celebrate(grade, slot) {
    if (grade < 90) return;
    launchConfetti();
    window.StudentProgress?.profile().then((student) => {
      const name = String(student?.name || "").trim().split(/\s+/)[0];
      if (!name || !slot?.isConnected || $(".eng-cheer", slot)) return;
      const letters = nameLetters(name)
        .map((ch, i) => `<span style="--i:${i}">${esc(ch)}</span>`)
        .join("");
      slot.insertAdjacentHTML(
        "afterbegin",
        `<div class="eng-cheer">
          <span class="eng-cheer-lead">${esc(t(grade === 100 ? "cheerPerfect" : "cheerGreat"))}</span>
          <span class="eng-cheer-name font-cartoon">
            <span class="eng-cheer-spark" aria-hidden="true">${ICONS.star}</span>
            <bdi class="eng-cheer-letters" dir="auto" aria-label="${esc(name)}">${letters}</bdi>
            <span class="eng-cheer-spark" aria-hidden="true">${ICONS.star}</span>
          </span>
        </div>`
      );
    });
  }

  function homeworkButtonHtml() {
    const home = window.StudentProgress?.homeUrl();
    return home ? `<a class="btn btn-candy font-cartoon eng-btn-secondary" href="${esc(home)}">${esc(t("backToHomework"))}</a>` : "";
  }

  function renderResults() {
    if (runner.review?.test) {
      renderTestResults();
      return;
    }
    if (runner.review?.daily) {
      renderDailyResults();
      return;
    }
    if (runner.review?.mix) {
      renderMixResults();
      return;
    }
    if (runner.review) {
      renderReviewResults();
      return;
    }
    if (runner.exercise.type === "exam") {
      renderExamResults();
      return;
    }
    const { score, total, mistakes, topic, exercise, isRetry } = runner;
    runner.phase = "results";
    recordRound();
    window.MistakeBank?.flush();
    // A mistakes retry shows the grade of the round it fixed, after the fix.
    const fixed = fixedResult();
    const shown = fixed || { score, total };
    const ratio = shown.total ? shown.score / shown.total : 0;
    const grade = Math.round(ratio * 100);
    const stars = ratio === 1 ? 3 : ratio >= 0.7 ? 2 : ratio >= 0.4 ? 1 : 0;
    const message = fixed
      ? t(score === total ? "fixedAll" : score ? "fixedSome" : "fixedNone")
      : ratio === 1 ? t("perfect") : ratio >= 0.7 ? t("great") : t("keepGoing");

    // A mistakes-only retry is a partial round: only the round it fixed counts.
    if (!isRetry || fixed) saveBest(`${topic.id}/${exercise.id}`, shown.score, shown.total);
    // Exercises built in the browser (english-more.js) have no AI-made items.
    if (!runner.prepared && !exercise.derived) {
      runner.prepared = true;
      preparePractice(topic, exercise);
    }

    // A reading round reports its two parts separately; it has no
    // mistakes-only retry, since its questions depend on the whole passage.
    const isReading = exercise.type === "reading";
    const read = runner.read;
    const countLine = isReading
      ? [read.marking ? t("partMark", read.markScore, read.targets.length) : "", t("partQuestions", read.qScore, runner.round.length)]
          .filter(Boolean)
          .join(" · ")
      : fixed
        ? t("fixedCount", score, total, fixed.score, fixed.total)
        : t("score", score, total);

    // The wrong answers aren't listed with their right answers, so that
    // "practice my mistakes" really fixes them.
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
        <p class="eng-results-msg" aria-live="polite">${esc(message)}</p>
        <div class="eng-results-actions">
          ${againButtonHtml()}
          ${mistakes.length && !isReading ? `<button type="button" class="btn btn-candy font-cartoon eng-btn-secondary" id="engRetryMistakes">${esc(t("retryMistakes"))}</button>` : ""}
          ${homeworkButtonHtml()}
        </div>
      </div>`,
      `<div class="eng-earned" id="engEarned" aria-live="polite">${earnedHtml(runner.earned)}</div>`
    );
    // A mistakes-only retry is no real grade to celebrate — unless it fixed one.
    if (!isRetry || fixed) celebrate(grade, $(".eng-results"));

    $("#engAgain").addEventListener("click", makeNewRound);
    $("#engRetryMistakes")?.addEventListener("click", () => {
      const retry = exercise.type === "match" ? [{ pairs: shuffle(mistakes) }] : shuffle(mistakes);
      startExercise(topic, exercise, retry, "retry", fixed || { score, total });
    });
  }

  /* ── "My mistakes": a round of questions from the mistake bank
     (mistake-bank.js). Each question is shown with its own exercise, so its
     options, words and instructions are the ones it was asked with. ── */

  const REVIEW_SIZE = 10;
  let reviewToken = 0;

  // A bank entry as a runner question, or null when its exercise is no
  // longer on the site. A matching pair comes back on its own: a word with a
  // picture as "what's in the picture?", a text pair as a choice between the
  // exercise's other answers.
  function reviewItem(entry) {
    const topic = findTopic(entry.topicId);
    const source = findExercise(topic, entry.exerciseId);
    const item = entry.item;
    if (!source || !item || typeof item !== "object" || !TYPES[source.type] || source.type === "reading") return null;
    const base = { id: entry.id, topic, source, item };
    if (source.type !== "match") {
      if (item.word && !VOCAB[item.word]) return null;
      return { ...base, exercise: source, q: item };
    }
    if (item.word) {
      const word = wordItem(item.word);
      const words = source.words || [];
      if (!word || words.length < 2) return null;
      const exercise = { ...source, type: "picture", words, instructions: STR.he.reviewPictureInstr, instructionsEn: STR.en.reviewPictureInstr };
      return { ...base, exercise, q: word };
    }
    const others = shuffle([...new Set((source.pairs || []).map((p) => p.b).filter((b) => b && b !== item.b))]).slice(0, 3);
    if (!item.a || !item.b || !others.length) return null;
    const exercise = { ...source, type: "choice", options: null, instructions: STR.he.reviewPairInstr, instructionsEn: STR.en.reviewPairInstr };
    return { ...base, exercise, q: { text: `${item.a} → ___`, options: [item.b, ...others], answer: item.b } };
  }

  // The questions practiced longest ago come first, so each one gets some
  // time between its reviews; the round itself is shuffled.
  function buildReview(topicId) {
    const entries = window.MistakeBank.list()
      .filter((e) => !topicId || e.topicId === topicId)
      .sort((a, b) => String(a.lastAt).localeCompare(String(b.lastAt)) || (a.streak || 0) - (b.streak || 0));
    const items = [];
    for (const entry of entries) {
      if (items.length >= REVIEW_SIZE) break;
      const item = reviewItem(entry);
      if (item) items.push(item);
    }
    return shuffle(items);
  }

  // A linked student's bank comes from their file first.
  async function openReview(topicId) {
    const token = ++reviewToken;
    const topic = findTopic(topicId);
    renderReviewMessage(t("loading"), "", topic ? `#${topic.id}` : "#");
    await window.MistakeBank?.ready();
    if (token !== reviewToken || decodeURIComponent(location.hash.replace(/^#/, "")).split("/")[0] !== REVIEW_ROUTE) return;
    startReview(topic ? topic.id : "");
  }

  function startReview(topicId = "") {
    clearTimeout(runner.timer);
    stopExamTimer();
    runner.exam = null;
    const back = topicId ? `#${topicId}` : "#";
    const items = window.MistakeBank ? buildReview(topicId) : [];
    if (!items.length) {
      runner.review = null;
      const mastered = window.MistakeBank?.mastered() || 0;
      renderReviewMessage(t("reviewEmpty"), mastered ? t("reviewCardDone", mastered) : t("reviewEmptyLead"), back);
      return;
    }
    startMixedRound({ topicId, items, out: 0, back });
  }

  // A round of questions from many exercises (a review or a mixed practice).
  // `fix`: the round whose mistakes these are, as in startExercise.
  function startMixedRound(review, fix = null) {
    const { items } = review;
    runner.review = review;
    runner.topic = items[0].topic;
    runner.exercise = items[0].exercise;
    runner.round = items.map((item) => item.q);
    runner.total = runner.round.length;
    runner.isRetry = !!fix;
    runner.fix = fix;
    runner.isNew = false;
    runner.newRequest = null;
    runner.prepared = true;
    runner.index = 0;
    runner.barIndex = 0;
    runner.score = 0;
    runner.mistakes = [];
    runner.mistakeLog = [];
    runner.startedAt = Date.now();
    runner.recorded = false;
    runner.earned = null;
    renderQuestion();
  }

  // The review screen with nothing to practice (or while the bank loads).
  // `lead` comes with a button back (`backText`: its label, when it leads
  // somewhere else than the topics or a topic).
  function renderReviewMessage(title, lead, back, heading = t("reviewTitle"), backText = "") {
    runner.phase = "message";
    const view = views.exercise();
    view.classList.remove("is-reading");
    const backLabel = backText || (back === "#" || back === `#${DAILY_ROUTE}` ? t("back") : t("backToTopic"));
    view.innerHTML = `
      <div class="eng-runner-head">
        <div class="eng-runner-top">
          <a class="eng-back" href="${esc(back)}" aria-label="${esc(backLabel)}" title="${esc(backLabel)}">${ICONS.back}</a>
          <div class="eng-runner-title-row"><h2 class="font-cartoon eng-runner-title">${esc(heading)}</h2></div>
        </div>
      </div>
      <div class="eng-runner-card eng-review-empty">
        <span class="eng-review-empty-icon">${lead ? ICONS.review : ICONS.spinner}</span>
        <p class="eng-review-empty-title">${esc(title)}</p>
        ${lead ? `<p class="eng-review-empty-lead">${esc(lead)}</p><a class="btn btn-primary btn-candy font-cartoon" href="${esc(back)}">${esc(backLabel)}</a>` : ""}
      </div>`;
  }

  // Runs `fn` with a review question's exercise in the runner, for the
  // helpers that read it (the results list shows each mistake its own way).
  function withExercise(item, fn) {
    const saved = runner.exercise;
    runner.exercise = item.exercise;
    try {
      return fn();
    } finally {
      runner.exercise = saved;
    }
  }

  function renderReviewResults() {
    const { score, total, mistakes, review } = runner;
    runner.phase = "results";
    recordRound();
    window.MistakeBank?.flush();
    const ratio = total ? score / total : 0;
    const stars = ratio === 1 ? 3 : ratio >= 0.7 ? 2 : ratio >= 0.4 ? 1 : 0;
    // A subject page counts only its own topics' questions (the bank keeps
    // English ones too).
    const bank = window.MistakeBank;
    const left = (SUBJECT && !review.topicId ? TOPICS.reduce((n, tp) => n + (bank?.count(tp.id) || 0), 0) : bank?.count(review.topicId)) || 0;
    const status = [review.out ? t("reviewOutCount", review.out) : "", t("reviewLeft", left)].filter(Boolean).join(" · ");
    const list = mistakes
      .map((q) => {
        const item = review.items.find((it) => it.q === q);
        return item ? `<li>${withExercise(item, () => (TYPES[item.exercise.type] || TYPES.choice).review(q))}</li>` : "";
      })
      .join("");
    const backLabel = review.back === "#" ? t("back") : t("backToTopic");
    renderRunnerShell(
      `
      <div class="eng-results">
        <div class="eng-stars" aria-hidden="true">
          ${[1, 2, 3].map((n) => `<span class="eng-star${n <= stars ? " is-on" : ""}">${ICONS.star}</span>`).join("")}
        </div>
        <div class="eng-grade">
          <span class="eng-grade-label">${esc(t("gradeLabel"))}</span>
          <p class="eng-score font-cartoon">${Math.round(ratio * 100)}</p>
        </div>
        <p class="eng-results-count">${esc(t("score", score, total))}</p>
        <p class="eng-results-msg">${esc(status)}</p>
        <div class="eng-results-actions">
          ${left ? `<button type="button" class="btn btn-primary btn-candy font-cartoon" id="engReviewAgain">${esc(t("reviewAgain"))}</button>` : ""}
          <a class="btn btn-candy font-cartoon eng-btn-secondary" href="${esc(review.back)}">${esc(backLabel)}</a>
          ${homeworkButtonHtml()}
        </div>
        ${list ? `<div class="eng-mistakes"><h3>${esc(t("mistakesTitle"))}</h3><ul>${list}</ul></div>` : ""}
      </div>`,
      `<div class="eng-earned" id="engEarned" aria-live="polite">${earnedHtml(runner.earned)}</div>`
    );
    celebrate(Math.round(ratio * 100), $(".eng-results"));
    $("#engReviewAgain")?.addEventListener("click", () => startReview(review.topicId));
  }

  /* ── Mixed practice: a task the teacher sends with questions from every
     exercise the student solved, mixed together (#mix/<task id>). The task
     lists the exercises; it runs like a review round, each question with its
     own exercise, and its wrong answers go to the mistake bank as usual. ── */

  const MIX_ROUTE = "mix";
  const MIX_SIZE = 12;
  let mixToken = 0;

  // Questions taken in turn from each exercise, so every one gets a share.
  function buildMix(keys, size = MIX_SIZE) {
    const pools = shuffle(keys)
      .map((key) => {
        const [topicId, exerciseId] = String(key).split("/");
        const ex = findExercise(findTopic(topicId), exerciseId);
        if (!ex || ["reading", "exam", "speak"].includes(ex.type)) return [];
        return shuffle(poolOf(ex)).map((item) => ({ id: `${topicId}/${exerciseId}/${itemKey(item)}`, topicId, exerciseId, item }));
      })
      .filter((pool) => pool.length);
    const items = [];
    for (let i = 0; items.length < size && pools.some((pool) => pool.length); i = (i + 1) % pools.length) {
      const entry = pools[i].shift();
      const item = entry && reviewItem(entry);
      if (item) items.push(item);
    }
    return shuffle(items);
  }

  // The task comes from the linked student's file.
  async function openMix(taskId) {
    const token = ++mixToken;
    renderReviewMessage(t("loading"), "", "#", t("mixTitle"));
    const student = await window.StudentProgress?.profile();
    if (token !== mixToken || decodeURIComponent(location.hash.replace(/^#/, "")).split("/")[0] !== MIX_ROUTE) return;
    const task = (student?.homework || []).find((hw) => hw.topicId === MIX_ROUTE && hw.exerciseId === taskId);
    startMix(task);
  }

  // `items`: the questions to ask again (practicing a round's mistakes).
  function startMix(task, items = null, fix = null) {
    clearTimeout(runner.timer);
    stopExamTimer();
    runner.exam = null;
    const round = items || (task ? buildMix(task.items || []) : []);
    if (!round.length) {
      runner.review = null;
      renderReviewMessage(t("mixMissing"), t("mixMissingLead"), "#", t("mixTitle"));
      return;
    }
    startMixedRound({ mix: task, items: round, out: 0, back: "#" }, fix);
  }

  // Like an exercise's results: the grade (after a fix, the fixed one) and
  // a way to practice the mistakes, without the right answers.
  function renderMixResults() {
    const { score, total, mistakes, review } = runner;
    runner.phase = "results";
    recordRound();
    window.MistakeBank?.flush();
    const fixed = fixedResult();
    const shown = fixed || { score, total };
    const ratio = shown.total ? shown.score / shown.total : 0;
    const grade = Math.round(ratio * 100);
    const stars = ratio === 1 ? 3 : ratio >= 0.7 ? 2 : ratio >= 0.4 ? 1 : 0;
    const message = fixed
      ? t(score === total ? "fixedAll" : score ? "fixedSome" : "fixedNone")
      : ratio === 1 ? t("perfect") : ratio >= 0.7 ? t("great") : t("keepGoing");
    renderRunnerShell(
      `
      <div class="eng-results">
        <div class="eng-stars" aria-hidden="true">
          ${[1, 2, 3].map((n) => `<span class="eng-star${n <= stars ? " is-on" : ""}">${ICONS.star}</span>`).join("")}
        </div>
        <div class="eng-grade">
          <span class="eng-grade-label">${esc(t("gradeLabel"))}</span>
          <p class="eng-score font-cartoon">${grade}</p>
        </div>
        <p class="eng-results-count">${esc(fixed ? t("fixedCount", score, total, fixed.score, fixed.total) : t("score", score, total))}</p>
        <p class="eng-results-msg" aria-live="polite">${esc(message)}</p>
        <div class="eng-results-actions">
          <button type="button" class="btn btn-primary btn-candy font-cartoon" id="engMixAgain">${esc(t("mixAgain"))}</button>
          ${mistakes.length ? `<button type="button" class="btn btn-candy font-cartoon eng-btn-secondary" id="engRetryMistakes">${esc(t("retryMistakes"))}</button>` : ""}
          ${homeworkButtonHtml()}
        </div>
      </div>`,
      `<div class="eng-earned" id="engEarned" aria-live="polite">${earnedHtml(runner.earned)}</div>`
    );
    celebrate(grade, $(".eng-results"));
    $("#engMixAgain").addEventListener("click", () => startMix(review.mix));
    $("#engRetryMistakes")?.addEventListener("click", () => {
      const wrong = review.items.filter((item) => mistakes.includes(item.q));
      startMix(review.mix, shuffle(wrong), shown);
    });
  }

  /* ── Tests (#test/<id>): a test the teacher sent from the student's file,
     with questions of its own for every topic (english-tests.js). It runs
     like a mixed round, but shows no right or wrong on the way: the grade,
     and each topic's grade, come once it is handed in, and go to the
     teacher. Leaving in the middle keeps the place on this device. A test is
     handed in once; then the student can ask for a retake, which the
     teacher opens (lib/student-progress.js). ── */

  const TEST_ROUTE = "test";
  const TEST_NEXT_MS = 350;
  const TEST_PROGRESS_KEY = "pleyi-test-progress";
  const TEST_LEVEL = { choice: 1, truefalse: 2, order: 2, write: 3 };
  let testToken = 0;
  const testExercises = {};

  function testIsOpen(test) {
    return (test.attempts || []).length < (test.allowed || 1);
  }

  // One made-up exercise per kind of question, for its instructions.
  function testExercise(q) {
    const ask = q.ask || q.type;
    if (!testExercises[ask]) {
      const asks = window.ENGLISH_TEST_ASK || {};
      const [en, he] = asks[ask] || asks[q.type] || ["", ""];
      testExercises[ask] = { id: `test-${ask}`, type: q.type, title: STR.he.testTitle, titleEn: STR.en.testTitle, instructions: he, instructionsEn: en, level: TEST_LEVEL[q.type] || 1 };
    }
    return testExercises[ask];
  }

  // "topicId:index" — a question of the topic's test bank.
  function testItem(key) {
    const [topicId, index] = String(key).split(":");
    const topic = findTopic(topicId);
    const q = window.ENGLISH_TESTS?.[topicId]?.[Number(index)];
    if (!topic || !q) return null;
    const exercise = testExercise(q);
    return { id: key, topic, source: exercise, exercise, q, item: q };
  }

  // `perTopic` questions of each topic, in the order the teacher picked them;
  // a retake asks first the ones the last hand-in didn't.
  function buildTest(test) {
    const last = new Set(test.attempts?.[test.attempts.length - 1]?.asked || []);
    return (test.topics || []).flatMap((tp) => {
      const keys = (window.ENGLISH_TESTS?.[tp.id] || []).map((_, i) => `${tp.id}:${i}`);
      const fresh = [...shuffle(keys.filter((k) => !last.has(k))), ...shuffle(keys.filter((k) => last.has(k)))];
      return shuffle(fresh.slice(0, test.perTopic || 5)).map(testItem).filter(Boolean);
    });
  }

  // The place in a test, kept per student, test and hand-in on this device.
  function testProgressKey(test) {
    return `${window.StudentProgress?.key() || ""}/${test.id}/${(test.attempts || []).length}`;
  }

  function readTestProgress(test) {
    try {
      return (JSON.parse(localStorage.getItem(TEST_PROGRESS_KEY)) || {})[testProgressKey(test)] || null;
    } catch {
      return null;
    }
  }

  // `value` null forgets it.
  function writeTestProgress(test, value) {
    try {
      const all = JSON.parse(localStorage.getItem(TEST_PROGRESS_KEY)) || {};
      if (value) all[testProgressKey(test)] = value;
      else delete all[testProgressKey(test)];
      localStorage.setItem(TEST_PROGRESS_KEY, JSON.stringify(all));
    } catch {
      /* ignore */
    }
  }

  // After every answer: the questions, the next one, and the wrong ones.
  function saveTestProgress(next = runner.index + 1) {
    const { review } = runner;
    if (!review?.test) return;
    writeTestProgress(review.test, {
      keys: review.items.map((it) => it.id),
      index: next,
      wrong: runner.mistakes.map((q) => review.items.findIndex((it) => it.q === q)),
      log: runner.mistakeLog,
      startedAt: runner.startedAt,
    });
  }

  function testHome() {
    return window.StudentProgress?.homeUrl() || "#";
  }

  function onTestRoute() {
    return decodeURIComponent(location.hash.replace(/^#/, "")).split("/")[0] === TEST_ROUTE;
  }

  // The test comes from the linked student's file, as it is now (a retake
  // may have been opened a minute ago).
  async function openTest(testId) {
    const token = ++testToken;
    renderReviewMessage(t("loading"), "", testHome(), t("testTitle"));
    const student = await window.StudentProgress?.profile({ fresh: true });
    if (token !== testToken || !onTestRoute()) return;
    const test = (student?.tests || []).find((x) => x.id === testId);
    runner.review = null;
    if (!test) {
      renderReviewMessage(t("testMissing"), t(student ? "testMissingLead" : "testLinkOnly"), testHome(), t("testTitle"), t("backToHomework"));
      return;
    }
    const saved = readTestProgress(test);
    // Handed in, but the answer from the server never came: send it again.
    if (testIsOpen(test) && saved && saved.index >= saved.keys.length) {
      startTest(test, saved);
      return;
    }
    if (testIsOpen(test)) renderTestIntro(test, saved);
    else renderTestDone(test);
  }

  function testTopicsHtml(test) {
    return `<ul class="eng-test-topics">${(test.topics || []).map((tp) => `<li>${esc(loc(findTopic(tp.id) || tp, "title"))}</li>`).join("")}</ul>`;
  }

  function testHeadHtml(test) {
    return `
      <div class="eng-runner-head">
        <div class="eng-runner-top">
          <a class="eng-back" href="${esc(testHome())}" aria-label="${esc(t("backToHomework"))}" title="${esc(t("backToHomework"))}">${ICONS.back}</a>
          <div class="eng-runner-title-row"><h2 class="font-cartoon eng-runner-title">${esc(test.title || t("testTitle"))}</h2></div>
        </div>
      </div>`;
  }

  // Before the first question: the topics, how many questions, the rules.
  function renderTestIntro(test, saved) {
    runner.phase = "message";
    const view = views.exercise();
    view.classList.remove("is-reading");
    const count = saved?.keys?.length || (test.topics || []).reduce((n, tp) => n + Math.min(test.perTopic || 5, window.ENGLISH_TESTS?.[tp.id]?.length || 0), 0);
    const retake = (test.attempts || []).length > 0;
    view.innerHTML = `
      ${testHeadHtml(test)}
      <div class="eng-runner-card eng-review-empty eng-test-intro">
        <span class="eng-review-empty-icon">${ICONS.exam}</span>
        ${retake ? `<span class="eng-test-badge">${esc(t("testRetakeBadge"))}</span>` : ""}
        ${testTopicsHtml(test)}
        <p class="eng-test-count">${esc(t("testCount", count))}</p>
        <ul class="eng-test-rules">${t("testRules").map((line) => `<li>${esc(line)}</li>`).join("")}</ul>
        ${saved?.index ? `<p class="eng-test-resume">${esc(t("testResume", saved.index, saved.keys.length))}</p>` : ""}
        ${test.note ? `<p class="eng-test-note"><b>${esc(t("testNote"))}</b> ${esc(test.note)}</p>` : ""}
        <button type="button" class="btn btn-primary btn-candy font-cartoon" id="engTestGo">${esc(t(saved?.index ? "testGoOn" : "testStart"))}</button>
      </div>`;
    $("#engTestGo").addEventListener("click", () => startTest(test, readTestProgress(test)));
    $("#engTestGo").focus({ preventScroll: true });
  }

  // `saved`: the place this device kept, to go on from it.
  function startTest(test, saved = null) {
    clearTimeout(runner.timer);
    stopExamTimer();
    runner.exam = null;
    let items = saved ? saved.keys.map(testItem) : null;
    // The test bank changed since: start over with new questions.
    if (!items || !items.length || items.some((it) => !it)) {
      saved = null;
      items = buildTest(test);
    }
    if (!items.length) {
      renderReviewMessage(t("testMissing"), t("testMissingLead"), testHome(), t("testTitle"), t("backToHomework"));
      return;
    }
    runner.testSend = null;
    startMixedRound({ test, items, out: 0, back: testHome() });
    if (!saved) {
      saveTestProgress(0);
      return;
    }
    runner.index = Math.min(saved.index, items.length);
    runner.barIndex = runner.index;
    runner.mistakes = (saved.wrong || []).map((i) => items[i]?.q).filter(Boolean);
    runner.mistakeLog = saved.log || [];
    runner.score = runner.index - runner.mistakes.length;
    runner.startedAt = saved.startedAt || runner.startedAt;
    if (runner.index >= items.length) renderResults();
    else renderQuestion();
  }

  // Right answers and questions of every topic of the test.
  function testByTopic() {
    const out = {};
    runner.review.items.forEach((it) => {
      const r = (out[it.topic.id] ||= { score: 0, total: 0 });
      r.total++;
      if (!runner.mistakes.includes(it.q)) r.score++;
    });
    return out;
  }

  function testGradeOf(score, total) {
    return total ? Math.round((score / total) * 100) : 0;
  }

  function testByTopicHtml(test, byTopic) {
    const rows = (test.topics || [])
      .filter((tp) => byTopic?.[tp.id]?.total)
      .map((tp) => {
        const r = byTopic[tp.id];
        return `<li><span class="eng-test-topic-name">${esc(loc(findTopic(tp.id) || tp, "title"))}</span><span class="eng-test-topic-score" dir="ltr">${r.score}/${r.total}</span></li>`;
      });
    return rows.length > 1 ? `<div class="eng-test-by-topic"><h3>${esc(t("testByTopic"))}</h3><ul>${rows.join("")}</ul></div>` : "";
  }

  // The grade, each topic's grade, and the hand-in: it goes to the server
  // once, and a failed one can be sent again.
  function renderTestResults() {
    const { score, total, review } = runner;
    runner.phase = "results";
    const grade = testGradeOf(score, total);
    renderRunnerShell(
      `
      <div class="eng-results eng-test-results">
        <div class="eng-grade">
          <span class="eng-grade-label">${esc(t("gradeLabel"))}</span>
          <p class="eng-score font-cartoon">${grade}</p>
        </div>
        <p class="eng-results-count">${esc(t("score", score, total))}</p>
        ${testByTopicHtml(review.test, testByTopic())}
        <p class="eng-results-msg eng-test-status" id="engTestStatus" aria-live="polite"></p>
        <div class="eng-results-actions" id="engTestActions"></div>
      </div>`,
      `<div class="eng-earned" id="engEarned" aria-live="polite">${earnedHtml(runner.earned)}</div>`
    );
    celebrate(grade, $(".eng-results"));
    sendTest();
  }

  function sendTest() {
    const { review } = runner;
    const test = review.test;
    const send = (runner.testSend ||= { state: "idle" });
    if (send.state === "idle" || send.state === "failed") {
      send.state = "sending";
      const levels = review.items.map((it) => exerciseLevel(it.exercise));
      const activity = {
        kind: "exercise",
        topicId: TEST_ROUTE,
        topicTitle: STR.he.testTitle,
        exerciseId: test.id,
        exerciseTitle: test.title || STR.he.testTitle,
        type: "test",
        level: Math.round(levels.reduce((a, b) => a + b, 0) / Math.max(1, levels.length)) || 1,
        score: runner.score,
        total: runner.total,
        durationSec: Math.round((Date.now() - runner.startedAt) / 1000),
        mistakes: runner.mistakeLog,
        byTopic: testByTopic(),
        asked: review.items.map((it) => it.id),
      };
      window.StudentProgress.submitTest(activity).then((res) => {
        // A test handed in already (another device, or an answer that got
        // lost on the way) counts as sent.
        send.state = res.ok || res.done ? "sent" : "failed";
        send.error = res.ok ? "" : res.error;
        send.done = !res.ok && res.done;
        if (send.state === "sent") {
          writeTestProgress(test, null);
          test.attempts = [...(test.attempts || []), { score: runner.score, total: runner.total }];
        }
        if (runner.review !== review || runner.phase !== "results") return;
        if (res.ok) {
          runner.earned = res;
          showEarned(res);
        }
        showTestStatus();
      });
    }
    showTestStatus();
  }

  function showTestStatus() {
    const status = $("#engTestStatus");
    const actions = $("#engTestActions");
    const send = runner.testSend;
    if (!status || !actions || !send) return;
    const test = runner.review.test;
    status.textContent = send.state === "sending" ? t("testSaving") : send.state === "sent" ? (send.done ? t("testDoneTitle") : t("testSaved")) : send.error;
    status.classList.toggle("is-error", send.state === "failed");
    actions.innerHTML = `
      ${send.state === "failed" ? `<button type="button" class="btn btn-primary btn-candy font-cartoon" id="engTestResend">${esc(t("testRetry"))}</button>` : ""}
      ${send.state === "sent" ? retakeHtml(test) : ""}
      ${homeworkButtonHtml()}`;
    $("#engTestResend")?.addEventListener("click", sendTest);
    bindRetake(test);
  }

  // The way to a retake once a test is handed in: a button, or where the
  // request stands.
  function retakeHtml(test) {
    if (test.retakeAt) return `<p class="eng-test-asked">${esc(t("testAsked"))}</p>`;
    return `
      ${test.retakeDeclinedAt ? `<p class="eng-test-asked">${esc(t("testDeclined"))}</p>` : ""}
      <button type="button" class="btn btn-candy font-cartoon eng-btn-secondary" id="engTestRetake">${esc(t("testAskRetake"))}</button>`;
  }

  function bindRetake(test) {
    const btn = $("#engTestRetake");
    btn?.addEventListener("click", async () => {
      btn.disabled = true;
      const res = await window.StudentProgress.askRetake(test.id);
      if (!btn.isConnected) return;
      if (res.ok) {
        Object.assign(test, { retakeAt: res.test?.retakeAt || new Date().toISOString(), retakeDeclinedAt: null });
        btn.outerHTML = `<p class="eng-test-asked">${esc(t("testAsked"))}</p>`;
        $("#engTestStatus")?.classList.remove("is-error");
      } else {
        btn.disabled = false;
        const status = $("#engTestStatus");
        if (status) {
          status.textContent = res.error;
          status.classList.add("is-error");
        }
      }
    });
  }

  // Opening a test that was handed in: its last grade, and the retake.
  function renderTestDone(test) {
    runner.phase = "message";
    const view = views.exercise();
    view.classList.remove("is-reading");
    const last = test.attempts[test.attempts.length - 1] || {};
    view.innerHTML = `
      ${testHeadHtml(test)}
      <div class="eng-runner-card">
        <div class="eng-results eng-test-results">
          <p class="eng-test-done-title">${esc(t("testDoneTitle"))}</p>
          <div class="eng-grade">
            <span class="eng-grade-label">${esc(t("gradeLabel"))}</span>
            <p class="eng-score font-cartoon">${testGradeOf(last.score, last.total)}</p>
          </div>
          <p class="eng-results-count">${esc(t("score", last.score || 0, last.total || 0))}</p>
          ${testByTopicHtml(test, last.byTopic)}
          <p class="eng-results-msg eng-test-status" id="engTestStatus" aria-live="polite"></p>
          <div class="eng-results-actions">${retakeHtml(test)}${homeworkButtonHtml()}</div>
        </div>
      </div>`;
    bindRetake(test);
  }

  /* ── The daily challenge: five short questions a day, mixed from the
     exercises the student already finished (their file's and this
     browser's), or from the first topics of the path for a new visitor.
     Finishing a round on a new day keeps the streak of days in a row going:
     a linked student's in their file (lib/student-progress.js has the same
     rules), a visitor's in this browser.

     "#daily" is its page (the streak and the week), "#daily/go" a round. ── */

  const DAILY_ROUTE = "daily";
  const DAILY_GO = "go";
  const DAILY_SIZE = 5;
  const DAILY_KEY = "pleyi-daily";
  const DAILY_DAYS_KEPT = 60;
  let dailyToken = 0;
  // A linked student's streak after a round, newer than their cached profile.
  let dailyFresh = null;

  // Today in Israel, as YYYY-MM-DD — the day the server counts too.
  function dayKey(date = new Date()) {
    return date.toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" });
  }

  function dayBefore(day) {
    const d = new Date(`${day}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().slice(0, 10);
  }

  // A visitor's streak, kept in this browser.
  function readDaily() {
    try {
      const saved = JSON.parse(localStorage.getItem(DAILY_KEY));
      return saved && saved.owner === ownerTag() ? saved : null;
    } catch {
      return null;
    }
  }

  function saveDailyDay(day) {
    const s = { streak: 0, best: 0, last: "", days: [], ...readDaily(), owner: ownerTag() };
    if (s.last === day) return;
    s.streak = s.last === dayBefore(day) ? s.streak + 1 : 1;
    s.best = Math.max(s.best, s.streak);
    s.last = day;
    s.days = [...s.days, day].slice(-DAILY_DAYS_KEPT);
    try {
      localStorage.setItem(DAILY_KEY, JSON.stringify(s));
    } catch {
      /* ignore */
    }
  }

  // { streak, best, doneToday, week: [{ day, done }] } — the shape the
  // server sends for a linked student.
  function dailyViewOf(saved) {
    const today = dayKey();
    const s = saved || {};
    const done = new Set(s.days || []);
    const week = [];
    for (let i = 0, day = today; i < 7; i++, day = dayBefore(day)) week.unshift({ day, done: done.has(day) });
    return {
      streak: s.last === today || s.last === dayBefore(today) ? s.streak || 0 : 0,
      best: s.best || 0,
      doneToday: s.last === today,
      week,
    };
  }

  async function dailyState() {
    if (window.StudentProgress?.isLinked()) {
      const student = await window.StudentProgress.profile();
      if (student?.daily) return dailyFresh || student.daily;
    }
    return dailyViewOf(readDaily());
  }

  // The streak once today's round is done, worked out ahead of the server.
  function dailyAfter(view) {
    if (view.doneToday) return view;
    const streak = view.streak + 1;
    return {
      streak,
      best: Math.max(view.best, streak),
      doneToday: true,
      week: view.week.map((d, i) => (i === view.week.length - 1 ? { ...d, done: true } : d)),
    };
  }

  function dailyFits(ex) {
    return ex && !["reading", "exam", "speak"].includes(ex.type);
  }

  async function dailyKeys() {
    const student = await window.StudentProgress?.profile();
    const solved = [...new Set([...(student?.finished || []), ...Object.keys(readBest())])].filter((key) => {
      const [topicId, exerciseId] = key.split("/");
      return dailyFits(findExercise(findTopic(topicId), exerciseId));
    });
    if (solved.length >= 2) return solved;
    return pathTopics()
      .slice(0, 3)
      .flatMap((topic) => (topic.exercises || []).filter((ex) => dailyFits(ex) && exerciseLevel(ex) === 1).map((ex) => `${topic.id}/${ex.id}`));
  }

  async function openDaily() {
    const token = ++dailyToken;
    renderReviewMessage(t("loading"), "", `#${DAILY_ROUTE}`, t("dailyTitle"));
    const [keys, before] = await Promise.all([dailyKeys(), dailyState()]);
    if (token !== dailyToken || decodeURIComponent(location.hash.replace(/^#/, "")).split("/")[0] !== DAILY_ROUTE) return;
    startDaily({ keys, before });
  }

  function startDaily(daily) {
    clearTimeout(runner.timer);
    stopExamTimer();
    runner.exam = null;
    const round = buildMix(daily.keys, DAILY_SIZE);
    if (!round.length) {
      runner.review = null;
      renderReviewMessage(t("dailyMissing"), t("dailyMissingLead"), "#", t("dailyTitle"));
      return;
    }
    startMixedRound({ daily: { ...daily, after: null }, items: round, out: 0, back: `#${DAILY_ROUTE}` });
  }

  // The 7 days as dots, today last, each with its weekday's letter.
  function dailyWeekHtml(view, cls = "eng-daily-week") {
    const letters = t("dayLetters");
    return `
      <ol class="${cls}" aria-label="${esc(t("dailyWeek"))}">
        ${view.week
          .map((d) => {
            const letter = letters[new Date(`${d.day}T12:00:00Z`).getUTCDay()];
            return `<li class="${d.done ? "is-done" : ""}${d.day === dayKey() ? " is-today" : ""}" aria-label="${esc(t(d.done ? "dailyDayDone" : "dailyDayMissed", letter))}"><i aria-hidden="true">${d.done ? ICONS.check : ""}</i><span aria-hidden="true">${esc(letter)}</span></li>`;
          })
          .join("")}
      </ol>`;
  }

  function renderDailyResults() {
    const { score, total, review } = runner;
    runner.phase = "results";
    const daily = review.daily;
    // Worked out once, so a language switch doesn't count today twice.
    daily.after = daily.after || dailyAfter(daily.before);
    recordRound();
    window.MistakeBank?.flush();
    const view = daily.after;
    const again = daily.before.doneToday;
    renderRunnerShell(
      `
      <div class="eng-results eng-daily-results">
        <div class="eng-daily-flame${again ? "" : " is-new"}">${ICONS.flame}<span class="font-cartoon">${view.streak}</span></div>
        <p class="eng-daily-big font-cartoon">${esc(t("dailyStreakBig", view.streak))}</p>
        ${dailyWeekHtml(view)}
        <p class="eng-results-count">${esc(t("score", score, total))}</p>
        <p class="eng-results-msg">${esc(t(again ? "dailyAgainToday" : "dailyTomorrow"))}</p>
        ${view.best > 1 ? `<p class="eng-daily-best">${esc(t("dailyBest", view.best))}</p>` : ""}
        <div class="eng-results-actions">
          <button type="button" class="btn btn-primary btn-candy font-cartoon" id="engDailyMore">${esc(t("dailyMore"))}</button>
          ${homeworkButtonHtml()}
        </div>
      </div>`,
      `<div class="eng-earned" id="engEarned" aria-live="polite">${earnedHtml(runner.earned)}</div>`
    );
    if (!again) launchConfetti();
    $("#engDailyMore").addEventListener("click", () => startDaily({ keys: daily.keys, before: view }));
  }

  // "#daily": what the challenge is, the streak, the last 7 days, and the
  // way into today's round.
  async function renderDailyPage() {
    const view = views.topic();
    if (!view) return;
    const token = ++dailyToken;
    view.innerHTML = `<p class="eng-fc-loading">${esc(t("loading"))}</p>`;
    const state = await dailyState();
    if (token !== dailyToken || views.topic()?.classList.contains("hidden")) return;
    view.innerHTML = `
      <div class="eng-topic-head">
        <a class="eng-back" href="#" aria-label="${esc(t("back"))}" title="${esc(t("back"))}">${ICONS.back}</a>
        <h2 class="font-cartoon eng-topic-heading">${esc(t("dailyTitle"))}</h2>
      </div>
      <div class="eng-fc-intro">${t("dailyPageLead").map((line) => `<p>${esc(line)}</p>`).join("")}</div>
      <section class="eng-daily-card eng-daily-page${state.doneToday ? " is-done" : ""}">
        <div class="eng-daily-flame">${ICONS.flameColor}${state.streak ?`<span class="font-cartoon">${state.streak}</span>` : ""}</div>
        <p class="eng-daily-big font-cartoon">${esc(state.streak ? t("dailyStreak", state.streak) : t("dailyStreakNone"))}</p>
        ${dailyWeekHtml(state)}
        ${state.best > 1 ? `<p class="eng-daily-best">${esc(t("dailyBest", state.best))}</p>` : ""}
        ${state.doneToday ? `<p class="eng-daily-lead">${esc(t("dailyLeadDone"))}</p>` : ""}
        <a class="btn ${state.doneToday ? "" : "btn-primary "}btn-candy font-cartoon eng-daily-go" href="#${DAILY_ROUTE}/${DAILY_GO}">${esc(t(state.doneToday ? "dailyMore" : "dailyStart"))}</a>
      </section>`;
    dockBack();
    refreshTopDaily();
  }

  /* ── Word cards (#cards): the vocabulary words (english-vocab.js) on
     flashcards that come back on a schedule of their own. A card shows an
     English word; the student flips it to see the picture and the Hebrew,
     and says whether they knew it. Every "I knew it" moves the word a box
     up and further away (CARDS_GAP: tomorrow, in 3 days, a week, two weeks,
     a month); "not yet" sends it back to box 1 and asks it again a few cards
     later. A new word is first shown open, then asked later in the round.
     A word in box CARDS_LEARNED or higher is learned.

     "#cards" is the page of the cards, "#cards/today" today's round (the
     words due today and up to CARDS_NEW_A_DAY new ones) and "#cards/<id>"
     a round of one category. A visitor's boxes live in this browser; a
     linked student's also in their file (GET/POST /api/cards), loaded once
     and sent in small batches, like the mistake bank. ── */

  /* ── "#chat": every conversation with Robo (english-chat.js), by level.
     A chat opens as an exercise of its topic (#chat/<id>), and its back
     arrow leads here. ── */

  const CHAT_ROUTE = "chat";

  function findChat(id) {
    return (window.ENGLISH_CHATS || []).find((c) => c.exercise.id === id) || null;
  }

  function renderChatHub() {
    const view = views.topic();
    if (!view) return;
    const chats = window.ENGLISH_CHATS || [];
    const best = readBest();
    const started = readStarted();
    const levels = [1, 2, 3]
      .map((level) => {
        const tiles = chats
          .filter((c) => c.exercise.level === level)
          .map(
            ({ topic, exercise }) => `
              <a class="eng-chat-tile" href="#${CHAT_ROUTE}/${esc(exercise.id)}">
                <span class="eng-chat-tile-avatar" aria-hidden="true">${ICONS.robo}</span>
                <span class="eng-chat-tile-title">${esc(loc(exercise, "scene"))}</span>
                ${statusHtml(exerciseStatus(topic, exercise, best, started))}
              </a>`
          )
          .join("");
        return tiles
          ? `
            <div class="eng-chat-level">
              <h3 class="eng-fc-sub font-cartoon">${esc(t("chatLevels")[level - 1])}</h3>
              <div class="eng-chat-grid">${tiles}</div>
            </div>`
          : "";
      })
      .join("");
    view.innerHTML = `
      <div class="eng-topic-head">
        <a class="eng-back" href="#" aria-label="${esc(t("back"))}" title="${esc(t("back"))}">${ICONS.back}</a>
        <h2 class="font-cartoon eng-topic-heading">${esc(t("chatTitle"))}</h2>
        ${t("chatTitleEn") ? `<p class="eng-topic-heading-en" dir="ltr">${esc(t("chatTitleEn"))}</p>` : ""}
      </div>
      <div class="eng-fc-intro eng-chat-intro">
        <span class="eng-chat-intro-robo" aria-hidden="true">${ICONS.robo}</span>
        <div>${t("chatLead").map((line) => `<p>${esc(line)}</p>`).join("")}</div>
      </div>
      ${levels}`;
    dockBack();
  }

  const CARDS_ROUTE = "cards";
  const CARDS_TODAY = "today";
  const CARDS_KEY = "pleyi-cards";
  const CARDS_LEARNED = 4;
  const CARDS_TOP = 6;
  // The days until a word comes back, by the box it moved up to.
  const CARDS_GAP = { 2: 1, 3: 3, 4: 7, 5: 14, 6: 30 };
  const CARDS_ROUND = 15;
  const CARDS_NEW_A_DAY = 8;
  const CARDS_AGAIN_AFTER = 3;
  const CARDS_AGAIN_MAX = 2;
  const CARDS_BATCH = 30;
  const CARDS_FLUSH_MS = 3000;
  let cardsToken = 0;
  let cards = null;

  function dayPlus(day, days) {
    const d = new Date(`${day}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
  }

  // Where every word stands for whoever practices on this device:
  // word id → { b: box, d: the day it comes back, f: the day it was first shown }.
  const cardsStore = (() => {
    let owner = null;
    let words = null;
    // A linked student's changes that the server doesn't have yet.
    let queue = [];
    let loaded = null;
    let flushing = null;
    let timer = null;

    function storeName() {
      return `${CARDS_KEY}-${owner}`;
    }

    function current() {
      const tag = ownerTag();
      if (words && owner === tag) return words;
      owner = tag;
      queue = [];
      loaded = null;
      try {
        const saved = JSON.parse(localStorage.getItem(storeName()));
        words = saved && typeof saved === "object" ? saved : {};
      } catch {
        words = {};
      }
      return words;
    }

    function save() {
      try {
        localStorage.setItem(storeName(), JSON.stringify(words));
      } catch {
        /* ignore */
      }
    }

    // A linked student's boxes come from their file once per page load;
    // changes made before they arrive are put back on top.
    function ready() {
      current();
      const key = window.StudentProgress?.key();
      if (!key) return Promise.resolve(words);
      if (!loaded) {
        const tag = owner;
        loaded = fetch("/api/cards", { headers: { "X-Student-Key": key } })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (!data?.ok || owner !== tag) return words;
            words = { ...data.words };
            queue.forEach(({ id, ...place }) => {
              words[id] = place;
            });
            save();
            return words;
          })
          // Offline: the copy in this browser.
          .catch(() => words);
      }
      return loaded;
    }

    // `keepalive` lets the last batch go out while the page is closing.
    function flush(keepalive = false) {
      clearTimeout(timer);
      const key = window.StudentProgress?.key();
      if (!key || !queue.length) return Promise.resolve();
      if (flushing) return flushing;
      flushing = (async () => {
        while (queue.length) {
          const ops = queue.slice(0, CARDS_BATCH);
          try {
            const res = await fetch("/api/cards", {
              method: "POST",
              headers: { "Content-Type": "application/json", "X-Student-Key": key },
              body: JSON.stringify({ ops }),
              keepalive,
            });
            // A server error keeps the changes for the next try; a link that
            // no longer works (404) drops them.
            if (!res.ok && res.status !== 404) break;
            queue = queue.slice(ops.length);
          } catch {
            break;
          }
        }
      })().finally(() => {
        flushing = null;
      });
      return flushing;
    }

    function set(id, place) {
      current()[id] = place;
      save();
      if (!window.StudentProgress?.key()) return;
      queue = [...queue.filter((op) => op.id !== id), { id, ...place }];
      clearTimeout(timer);
      timer = setTimeout(() => flush(), CARDS_FLUSH_MS);
    }

    window.addEventListener("pagehide", () => flush(true));
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flush(true);
    });

    return { ready, flush, set, get: (id) => current()[id] || null, all: () => current() };
  })();

  // The categories in the order of the vocabulary stage on the path.
  function cardsCategories() {
    const order = PATH.flatMap((stage) => stage.topics);
    const place = (cat) => {
      const i = order.indexOf(`vocab-${cat.id}`);
      return i < 0 ? order.length : i;
    };
    return [...(window.ENGLISH_VOCAB_CATEGORIES || [])].sort((a, b) => place(a) - place(b));
  }

  function cardsWordIds(cats) {
    return [...new Set(cats.flatMap((cat) => cat.words.map((w) => w.id)))].filter((id) => VOCAB[id]);
  }

  function cardsCount(cats = cardsCategories()) {
    const today = dayKey();
    const all = cardsStore.all();
    const ids = cardsWordIds(cats);
    const placed = ids.map((id) => all[id]).filter(Boolean);
    return {
      total: ids.length,
      learned: placed.filter((p) => p.b >= CARDS_LEARNED).length,
      due: placed.filter((p) => p.d <= today).length,
      fresh: ids.length - placed.length,
    };
  }

  // How many new words today's round may still bring.
  function cardsNewRoom() {
    const today = dayKey();
    const shown = Object.values(cardsStore.all()).filter((p) => p.f === today).length;
    return Math.max(0, CARDS_NEW_A_DAY - shown);
  }

  // The words due first (the lowest boxes, then the longest waiting), then
  // new words in path order. A category's round isn't held to the day's
  // new words: the student picked it.
  function cardsRound(catId) {
    const today = dayKey();
    const all = cardsStore.all();
    const cats = catId === CARDS_TODAY ? cardsCategories() : cardsCategories().filter((cat) => cat.id === catId);
    const ids = cardsWordIds(cats);
    const due = ids
      .filter((id) => all[id] && all[id].d <= today)
      .sort((a, b) => all[a].b - all[b].b || all[a].d.localeCompare(all[b].d))
      .slice(0, CARDS_ROUND);
    const room = Math.min(catId === CARDS_TODAY ? cardsNewRoom() : CARDS_NEW_A_DAY, CARDS_ROUND - due.length);
    const fresh = ids.filter((id) => !all[id]).slice(0, Math.max(0, room));
    return [...shuffle(due).map((id) => ({ id })), ...fresh.map((id) => ({ id, fresh: true }))];
  }

  // A small bar of the words learned.
  function cardsBarHtml(n, all) {
    return `<span class="eng-fc-bar" role="img" aria-label="${esc(t("cardsLearned", n, all))}"><i style="width:${all ? Math.round((n / all) * 100) : 0}%"></i></span>`;
  }

  // "#cards": today's round and a tile for every category.
  async function renderCardsHub() {
    const view = views.topic();
    if (!view) return;
    const token = ++cardsToken;
    view.innerHTML = `<p class="eng-fc-loading">${esc(t("loading"))}</p>`;
    await cardsStore.ready();
    if (token !== cardsToken || views.topic()?.classList.contains("hidden")) return;
    const count = cardsCount();
    const fresh = Math.min(count.fresh, cardsNewRoom());
    const today = [count.due ? t("cardsDueLine", count.due) : "", fresh ? t("cardsNewLine", fresh) : ""].filter(Boolean);
    const tiles = cardsCategories()
      .map((cat) => {
        const n = cardsCount([cat]);
        return `
          <article class="eng-topic-card">
            <a class="eng-topic-tile has-img eng-fc-tile" href="#${CARDS_ROUTE}/${esc(cat.id)}">
              <img class="eng-topic-img" src="${esc(imgUrl(VOCAB[cat.cover]?.img || cat.cover))}" alt="" draggable="false" />
              <span class="eng-topic-title">${esc(loc(cat, "title"))}</span>
              ${cardsBarHtml(n.learned, n.total)}
              <span class="btn btn-primary btn-candy font-cartoon eng-topic-open">${esc(t("cardsGo"))}</span>
            </a>
          </article>`;
      })
      .join("");
    view.innerHTML = `
      <div class="eng-topic-head">
        <a class="eng-back" href="#" aria-label="${esc(t("back"))}" title="${esc(t("back"))}">${ICONS.back}</a>
        <h2 class="font-cartoon eng-topic-heading">${esc(t("cardsTitle"))}</h2>
        ${t("cardsTitleEn") ? `<p class="eng-topic-heading-en" dir="ltr">${esc(t("cardsTitleEn"))}</p>` : ""}
      </div>
      <div class="eng-fc-intro">${t("cardsLead").map((line) => `<p>${esc(line)}</p>`).join("")}</div>
      <section class="eng-daily-card eng-fc-today">
        <div class="eng-daily-head">
          <span class="eng-daily-icon">${ICONS.cards}</span>
          <div class="eng-daily-text">
            <h3 class="eng-daily-title"><span class="eng-daily-key">${esc(t("cardsToday"))}</span></h3>
            ${(today.length ? today : [t("cardsTodayDone")]).map((line) => `<p class="eng-daily-lead">${esc(line)}</p>`).join("")}
          </div>
        </div>
        <p class="eng-daily-streak">${esc(t("cardsLearned", count.learned, count.total))}</p>
        ${cardsBarHtml(count.learned, count.total)}
        ${today.length ? `<a class="btn btn-primary btn-candy font-cartoon eng-daily-go" href="#${CARDS_ROUTE}/${CARDS_TODAY}">${esc(t("cardsGo"))}</a>` : ""}
      </section>
      <h3 class="eng-fc-sub font-cartoon">${esc(t("cardsTopics"))}</h3>
      <div class="eng-topic-grid">${tiles}</div>`;
    dockBack();
  }

  function renderCardsShell(inner, progress = "") {
    runner.phase = "cards";
    const view = views.exercise();
    view.classList.remove("is-reading");
    document.documentElement.classList.remove("eng-soft");
    view.innerHTML = `
      <div class="eng-runner-head">
        <div class="eng-runner-top">
          <a class="eng-back" href="#${CARDS_ROUTE}" aria-label="${esc(t("cardsBack"))}" title="${esc(t("cardsBack"))}">${ICONS.back}</a>
          <div class="eng-runner-title-row"><h2 class="font-cartoon eng-runner-title">${esc(t("cardsTitle"))}</h2></div>
          <div class="eng-runner-tools"></div>
        </div>
        ${progress}
      </div>
      <div class="eng-runner-card eng-runner-card--cards">${inner}</div>`;
  }

  async function openCards(catId) {
    const token = ++cardsToken;
    renderCardsShell(`<div class="eng-review-empty"><span class="eng-review-empty-icon">${ICONS.spinner}</span><p class="eng-review-empty-title">${esc(t("loading"))}</p></div>`);
    await cardsStore.ready();
    if (token !== cardsToken || decodeURIComponent(location.hash.replace(/^#/, "")).split("/")[0] !== CARDS_ROUTE) return;
    const list = cardsRound(catId);
    // `first`: each word's first answer in the round (true = knew it).
    cards = { catId, list, index: 0, flipped: false, first: new Map(), learnedBefore: cardsCount().learned };
    if (list.length) renderCardsStep();
    else
      renderCardsShell(`
        <div class="eng-review-empty">
          <span class="eng-review-empty-icon">${ICONS.cards}</span>
          <p class="eng-review-empty-title">${esc(t("cardsNone"))}</p>
          <p class="eng-review-empty-lead">${esc(t("cardsNoneLead"))}</p>
          <a class="btn btn-primary btn-candy font-cartoon" href="#${CARDS_ROUTE}">${esc(t("cardsBack"))}</a>
        </div>`);
  }

  function renderCardsStep() {
    const { list, index, flipped } = cards;
    const card = list[index];
    const word = wordItem(card.id);
    const open = card.fresh || flipped;
    const progress = progressHtml({ label: t("cardsProgress", index + 1, list.length), total: list.length, done: index, current: index });
    const actions = card.fresh
      ? `<button type="button" class="btn btn-primary btn-candy font-cartoon" id="engFcGot">${esc(t("cardsGotIt"))}</button>`
      : flipped
        ? `<button type="button" class="btn btn-candy font-cartoon eng-fc-no" id="engFcNo">${esc(t("cardsNotYet"))}</button>
           <button type="button" class="btn btn-primary btn-candy font-cartoon eng-fc-yes" id="engFcYes">${esc(t("cardsKnew"))}</button>`
        : `<button type="button" class="btn btn-primary btn-candy font-cartoon" id="engFcFlip">${esc(t("cardsFlip"))}</button>`;
    const wordHtml = canSpeak()
      ? `<button type="button" class="eng-fc-word eng-word-tap" data-say="${esc(word.en)}" aria-label="${esc(t("speakWord", word.en))}"><span class="eng-fc-en" lang="en">${esc(word.en)}</span><span class="eng-fc-ear" aria-hidden="true">${ICONS.listen}</span></button>`
      : `<span class="eng-fc-word"><span class="eng-fc-en" lang="en">${esc(word.en)}</span></span>`;
    renderCardsShell(
      `
      <div class="eng-fc">
        <p class="eng-fc-tag${card.fresh ? " is-new" : ""}">${esc(t(card.fresh ? "cardsNew" : "cardsAsk"))}</p>
        <div class="eng-fc-card${open ? " is-open" : ""}${flipped ? " is-flipped" : ""}">
          <div class="eng-fc-front" dir="ltr">
            ${wordHtml}
            ${word.say ? `<span class="eng-fc-say" dir="rtl" lang="he">${esc(word.say)}</span>` : ""}
          </div>
          <button type="button" class="eng-fc-back" id="engFcBack"${open ? " disabled" : ""} aria-label="${esc(t("cardsFlip"))}">
            <span class="eng-fc-cover" aria-hidden="true">?</span>
            <span class="eng-fc-meaning">
              <img class="eng-fc-img" src="${esc(word.img)}" alt="" draggable="false" />
              <span class="eng-fc-he">${esc(word.he)}</span>
            </span>
          </button>
        </div>
        <div class="eng-fc-actions">${actions}</div>
      </div>`,
      progress
    );
    const view = views.exercise();
    $$(".eng-word-tap", view).forEach((btn) => btn.addEventListener("click", () => speak(btn.dataset.say)));
    $("#engFcBack", view)?.addEventListener("click", cardsFlip);
    $("#engFcFlip", view)?.addEventListener("click", cardsFlip);
    $("#engFcGot", view)?.addEventListener("click", cardsGotIt);
    $("#engFcYes", view)?.addEventListener("click", () => cardsAnswer(true));
    $("#engFcNo", view)?.addEventListener("click", () => cardsAnswer(false));
    // The word is said as the card comes up (not again when it flips).
    if (!flipped) speak(word.en);
    $(".eng-fc-actions .btn-primary", view)?.focus({ preventScroll: true });
  }

  function cardsFlip() {
    if (!cards || cards.flipped || cards.list[cards.index]?.fresh) return;
    cards.flipped = true;
    renderCardsStep();
  }

  // Asked again a few cards later in the round.
  function cardsLater(card) {
    cards.list.splice(Math.min(cards.list.length, cards.index + 1 + CARDS_AGAIN_AFTER), 0, card);
  }

  // A new word goes into box 1, to be asked later in this round.
  function cardsGotIt() {
    const card = cards.list[cards.index];
    const today = dayKey();
    cardsStore.set(card.id, { b: 1, d: today, f: today });
    cardsLater({ id: card.id });
    cardsNext();
  }

  function cardsAnswer(knew) {
    const card = cards.list[cards.index];
    const today = dayKey();
    const was = cardsStore.get(card.id) || { b: 1, f: today };
    if (!cards.first.has(card.id)) cards.first.set(card.id, knew);
    if (knew) {
      const b = Math.min(CARDS_TOP, was.b + 1);
      cardsStore.set(card.id, { b, d: dayPlus(today, CARDS_GAP[b]), f: was.f });
    } else {
      cardsStore.set(card.id, { b: 1, d: today, f: was.f });
      if ((card.again || 0) < CARDS_AGAIN_MAX) cardsLater({ id: card.id, again: (card.again || 0) + 1 });
    }
    cardsNext();
  }

  function cardsNext() {
    cards.flipped = false;
    cards.index++;
    if (cards.index < cards.list.length) renderCardsStep();
    else renderCardsResults();
  }

  function renderCardsResults() {
    cardsStore.flush();
    const asked = cards.first.size;
    const knew = [...cards.first.values()].filter(Boolean).length;
    const learnedNow = Math.max(0, cardsCount().learned - cards.learnedBefore);
    const tomorrow = dayPlus(dayKey(), 1);
    const waiting = Object.values(cardsStore.all()).filter((p) => p.d <= tomorrow).length;
    const more = cardsRound(cards.catId).length;
    renderCardsShell(`
      <div class="eng-results eng-fc-results">
        <div class="eng-fc-medal">${ICONS.cards}</div>
        <p class="eng-daily-big font-cartoon">${esc(t("cardsDoneBig"))}</p>
        <p class="eng-results-count">${esc(t("cardsScore", knew, asked))}</p>
        ${learnedNow ? `<p class="eng-results-msg">${esc(t("cardsLearnedNow", learnedNow))}</p>` : ""}
        <p class="eng-results-msg">${esc(t("cardsTomorrow", waiting))}</p>
        <div class="eng-results-actions">
          ${more ? `<button type="button" class="btn btn-primary btn-candy font-cartoon" id="engFcMore">${esc(t("cardsMore"))}</button>` : ""}
          <a class="btn btn-candy font-cartoon" href="#${CARDS_ROUTE}">${esc(t("cardsBack"))}</a>
        </div>
      </div>`);
    if (asked && knew === asked) launchConfetti();
    $("#engFcMore")?.addEventListener("click", () => openCards(cards.catId));
  }

  /* ── Reading exams (english-exams.js): the passage on one side and one
     question at a time on the other, as in the reading runner, but nothing
     is checked until the student hands the exam in. Answers can change until
     then and are kept in this browser with the timer's deadline, so leaving
     the page and coming back continues the same exam (and a deadline that
     passed meanwhile hands it in). A question is worth one point, or half
     for one of two right picks or an order that is half right; the student's
     file gets half-points, so the score there is a whole number. ── */

  const EXAM_KEY = "pleyi-english-exams";
  let examTimer = null;

  function stopExamTimer() {
    clearInterval(examTimer);
    examTimer = null;
  }

  // Whoever practices on this device: a student who opened their link (a
  // hash of it), or "guest".
  function ownerTag() {
    const key = window.StudentProgress?.key() || "";
    let h = 5381;
    for (let i = 0; i < key.length; i++) h = (h * 33 + key.charCodeAt(i)) | 0;
    return key ? (h >>> 0).toString(36) : "guest";
  }

  // Saved exams of whoever practices on this device.
  function examSaveId(ex) {
    return `${ownerTag()}/${ex.id}`;
  }

  function readExamSaves() {
    try {
      return JSON.parse(localStorage.getItem(EXAM_KEY)) || {};
    } catch {
      return {};
    }
  }

  function loadExamSave(ex) {
    const save = readExamSaves()[examSaveId(ex)];
    return save && Array.isArray(save.answers) && save.answers.length === ex.questions.length ? save : null;
  }

  function storeExamSave(ex, save) {
    const all = readExamSaves();
    if (save) all[examSaveId(ex)] = save;
    else delete all[examSaveId(ex)];
    try {
      localStorage.setItem(EXAM_KEY, JSON.stringify(all));
    } catch {
      /* ignore */
    }
  }

  function saveExam() {
    const st = runner.exam;
    if (!st?.answers) return;
    const { answers, orders, timed, startedAt, deadline, current } = st;
    storeExamSave(runner.exercise, { answers, orders, timed, startedAt, deadline, current });
  }

  // Sentences end at . ! or ? (with any closing quote) before a space and a
  // capital letter, a digit or an opening quote — so a quote that ends with
  // "!" inside a sentence (“Thank you!” said Ari.) stays one sentence.
  function splitSentences(para) {
    const out = [];
    const re = /[.!?]+["”’)]*\s+(?=[A-Z0-9“"‘(])/g;
    let start = 0;
    let m;
    while ((m = re.exec(para))) {
      const end = m.index + m[0].length;
      out.push(para.slice(start, end).trim());
      start = end;
    }
    if (start < para.length) out.push(para.slice(start).trim());
    return out;
  }

  function examClock(ms) {
    const sec = Math.max(0, Math.ceil(ms / 1000));
    return t("minutesSeconds", Math.floor(sec / 60), sec % 60);
  }

  // Options, picks and events show in an order of their own, kept for the
  // whole exam. Events never start out in the right order.
  function examOrder(q) {
    if (q.type === "mc" || q.type === "multi") return shuffle(q.options.map((_, i) => i));
    if (q.type !== "sequence") return null;
    const ids = q.items.map((_, i) => i);
    let order = shuffle(ids);
    for (let tries = 0; tries < 8 && order.every((v, i) => v === i); tries++) order = shuffle(ids);
    return order;
  }

  function examAnswered(i) {
    const q = runner.round[i];
    const a = runner.exam?.answers?.[i];
    if (a == null) return false;
    if (typeof a === "string") return !!a.trim();
    if (Array.isArray(a)) return a.length === (q.type === "multi" ? q.answers.length : q.items.length);
    return true;
  }

  function examAnsweredCount() {
    return runner.round.filter((_, i) => examAnswered(i)).length;
  }

  function startExam() {
    const ex = runner.exercise;
    const sentences = ex.passage.text.flatMap(splitSentences);
    const save = loadExamSave(ex);
    runner.exam = { sentences, saved: save };
    runner.phase = "intro";
    if (save?.timed && save.deadline <= Date.now()) {
      // The time ran out while the student was away: what they answered is
      // handed in, and an exam with no answers starts over.
      if (save.answers.some((a) => a != null && a !== "")) {
        Object.assign(runner.exam, save, { timeUp: true });
        finishExam();
        return;
      }
      storeExamSave(ex, null);
      runner.exam.saved = null;
    }
    renderExamIntro();
  }

  function renderExamIntro() {
    runner.phase = "intro";
    const ex = runner.exercise;
    const save = runner.exam.saved;
    const facts = [
      [ICONS.clock, t("examFactTime", ex.minutes)],
      [ICONS.choice, t("examFactQuestions", ex.questions.length)],
      [ICONS.reading, t("examFactWords", passageWordCount(ex))],
    ];
    const rules = [...t("examRules"), t(ex.level <= 2 ? "examRulesHe" : "examRulesEn")];
    const left = save?.timed ? examClock(save.deadline - Date.now()) : "";
    const actions = save
      ? `<button type="button" class="btn btn-primary btn-candy font-cartoon" id="engExamResume">${esc(t("examResume"))}</button>
         <button type="button" class="btn btn-candy font-cartoon eng-btn-secondary" id="engExamRestart">${esc(t("examRestart"))}</button>`
      : `<button type="button" class="btn btn-primary btn-candy font-cartoon eng-exam-start" id="engExamStart">${ICONS.clock}<span>${esc(t("examStart"))}</span></button>
         <button type="button" class="btn btn-candy font-cartoon eng-btn-secondary" id="engExamUntimed">${esc(t("examStartUntimed"))}</button>`;
    renderRunnerShell(`
      <div class="eng-exam-intro">
        <span class="eng-exam-intro-icon">${ICONS.exam}</span>
        <h3 class="eng-exam-intro-title" dir="ltr">${esc(ex.passage.title)}</h3>
        <ul class="eng-exam-facts">${facts.map(([icon, text]) => `<li>${icon}<span>${esc(text)}</span></li>`).join("")}</ul>
        ${save ? `<p class="eng-exam-resume-note">${esc(t("examResumeNote", left))}</p>` : ""}
        <ul class="eng-exam-rules">${rules.map((rule) => `<li>${esc(rule)}</li>`).join("")}</ul>
        <div class="eng-results-actions eng-exam-intro-actions">${actions}</div>
      </div>`);
    $("#engExamStart")?.addEventListener("click", () => beginExam(true));
    $("#engExamUntimed")?.addEventListener("click", () => beginExam(false));
    $("#engExamResume")?.addEventListener("click", resumeExam);
    $("#engExamRestart")?.addEventListener("click", () => {
      storeExamSave(ex, null);
      runner.exam.saved = null;
      renderExamIntro();
    });
  }

  function beginExam(timed) {
    const ex = runner.exercise;
    const now = Date.now();
    Object.assign(runner.exam, {
      answers: ex.questions.map(() => null),
      orders: ex.questions.map(examOrder),
      timed,
      startedAt: now,
      deadline: timed ? now + ex.minutes * 60000 : null,
      current: 0,
      stage: "read",
      saved: null,
    });
    runner.startedAt = now;
    saveExam();
    renderExam();
  }

  function resumeExam() {
    const st = runner.exam;
    Object.assign(st, st.saved, { saved: null });
    // A save from before the orders were kept gets new ones.
    if (!Array.isArray(st.orders)) st.orders = runner.round.map(examOrder);
    st.current = Math.min(Math.max(0, st.current || 0), runner.round.length - 1);
    // The passage was read before: straight back to the question.
    st.stage = "questions";
    runner.startedAt = st.startedAt;
    renderExam();
  }

  function examPassageHtml() {
    let s = 0;
    return runner.exercise.passage.text
      .map((para, p) => {
        const sentences = splitSentences(para)
          .map((text) => `<span class="eng-sent" data-s="${s++}">${esc(text)}</span>`)
          .join(" ");
        return `<p class="eng-exam-para" data-p="${p + 1}"><span class="eng-para-num" aria-label="${esc(t("paragraph", p + 1))}">${p + 1}</span>${sentences}</p>`;
      })
      .join("");
  }

  function examGlossaryHtml(ex) {
    if (!ex.passage.glossary?.length) return "";
    return `<p class="eng-read-glossary"><span class="eng-read-glossary-title" dir="auto">${esc(t("glossary"))}</span>${ex.passage.glossary
      .map((g) => `<span class="eng-read-gloss"><b>${esc(g.en)}</b> = <span dir="rtl" lang="he">${esc(g.he)}</span></span>`)
      .join("")}</p>`;
  }

  // The passage box, with one button under it: "To the questions" while
  // reading it first, then back to the question (or to the results).
  function examSideHtml(goLabel) {
    const ex = runner.exercise;
    return `
      <div class="eng-read-side">
        <article class="eng-read-passage" id="engReadPassage" lang="en" dir="ltr">
          <h3 class="eng-read-title">${esc(ex.passage.title)}</h3>
          <div class="eng-read-text eng-exam-text" id="engExamText">${examPassageHtml()}</div>
          ${examGlossaryHtml(ex)}
        </article>
        <div class="eng-read-go"><button type="button" class="btn btn-primary btn-candy font-cartoon eng-check" id="engReadGo">${esc(t(goLabel))}</button></div>
      </div>`;
  }

  // As in the reading runner, the card holds the passage or the question,
  // never both: "Back to the text" swaps them, the button under the
  // passage swaps back.
  function setExamTextOpen(open) {
    const read = $(".eng-read");
    if (!read || read.classList.contains("is-text-open") === open) return;
    read.classList.toggle("is-text-open", open);
    $(open ? "#engReadGo" : "#engReadBack")?.focus({ preventScroll: true });
  }

  // From reading the passage first to the questions.
  function showExamQuestions() {
    const st = runner.exam;
    if (st.stage !== "read") return;
    st.stage = "questions";
    $(".eng-read")?.classList.replace("is-read", "is-questions");
    const go = $("#engReadGo");
    if (go) go.textContent = t("backToQuestion");
  }

  // The header: a button per question (answered ones filled, the current
  // one yellow) and the timer.
  function examProgressHtml() {
    return `
      <div class="eng-progress eng-exam-progress" id="engProgress">
        ${examNavHtml()}
        <span class="eng-exam-timer${runner.exam.timed ? "" : " is-untimed"}" id="engExamTimer" role="timer">${ICONS.clock}<span id="engExamTime"></span></span>
      </div>`;
  }

  function startExamClock() {
    stopExamTimer();
    tickExam();
    examTimer = setInterval(tickExam, 1000);
  }

  function tickExam() {
    const st = runner.exam;
    if (!st?.answers || runner.phase !== "exam") {
      stopExamTimer();
      return;
    }
    const now = Date.now();
    const time = $("#engExamTime");
    const box = $("#engExamTimer");
    if (!st.timed) {
      const text = examClock(now - st.startedAt);
      if (time) time.textContent = text;
      box?.setAttribute("aria-label", t("examElapsed", text));
      return;
    }
    const left = st.deadline - now;
    if (left <= 0) {
      st.timeUp = true;
      finishExam();
      return;
    }
    const text = examClock(left);
    if (time) time.textContent = text;
    box?.setAttribute("aria-label", t("examTimeLeft", text));
    box?.classList.toggle("is-low", left <= 5 * 60000);
    box?.classList.toggle("is-urgent", left <= 60000);
  }

  // The passage alone first, then the questions one at a time.
  function renderExam() {
    runner.phase = "exam";
    const st = runner.exam;
    st.confirming = false;
    renderRunnerShell(
      `<div class="eng-read eng-read--paged eng-exam is-${st.stage}">${examSideHtml(st.stage === "read" ? "toQuestions" : "backToQuestion")}<div class="eng-read-task eng-exam-task" id="engExamTask"></div></div>`,
      examProgressHtml()
    );
    const text = $("#engExamText");
    const pick = (el) => {
      const sent = el.closest?.(".eng-sent[tabindex]");
      if (sent) chooseQuote(Number(sent.dataset.s));
    };
    text.addEventListener("click", (e) => pick(e.target));
    text.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      if (!e.target.closest?.(".eng-sent[tabindex]")) return;
      e.preventDefault();
      pick(e.target);
    });
    $("#engReadGo").addEventListener("click", () => (runner.exam.stage === "read" ? goExamQuestion(runner.exam.current) : setExamTextOpen(false)));
    bindExamNav();
    renderExamTask();
    startExamClock();
  }

  // The header's question buttons and timer, after an answer changed or
  // the student moved to another question.
  function refreshExamChrome() {
    const progress = $("#engProgress");
    if (progress) progress.outerHTML = examProgressHtml();
    tickExam();
    bindExamNav();
  }

  // A quote question makes the passage's sentences clickable; a vocabulary
  // question points at its paragraph.
  function syncExamPassage() {
    const text = $("#engExamText");
    if (!text) return;
    const st = runner.exam;
    const q = runner.round[st.current];
    const asking = runner.phase === "exam" && st.stage === "questions" && !st.confirming;
    const quoting = asking && q?.type === "quote";
    text.classList.toggle("is-quoting", quoting);
    $$(".eng-sent", text).forEach((el) => {
      const chosen = quoting && st.answers[st.current] === Number(el.dataset.s);
      el.classList.toggle("is-quoted", chosen);
      if (quoting) {
        el.setAttribute("role", "button");
        el.setAttribute("tabindex", "0");
        el.setAttribute("aria-pressed", String(chosen));
      } else {
        el.removeAttribute("role");
        el.removeAttribute("tabindex");
        el.removeAttribute("aria-pressed");
      }
    });
    const para = asking && q?.type === "word" ? q.para : 0;
    $$(".eng-exam-para", text).forEach((p) => p.classList.toggle("is-pointed", Number(p.dataset.p) === para));
  }

  function examNavHtml() {
    const st = runner.exam;
    const dots = runner.round
      .map((_, i) => {
        const done = examAnswered(i);
        const cur = i === st.current && st.stage === "questions" && !st.confirming;
        return `<button type="button" class="eng-exam-dot${done ? " is-answered" : ""}${cur ? " is-current" : ""}" data-go="${i}" aria-label="${esc(t("examQuestionLabel", i + 1, done))}"${cur ? ' aria-current="step"' : ""}>${i + 1}</button>`;
      })
      .join("");
    return `<div class="eng-exam-dots" id="engExamNav" role="group" aria-label="${esc(t("examNavLabel"))}">${dots}</div>`;
  }

  function bindExamNav() {
    $$("#engExamNav [data-go]").forEach((btn) => btn.addEventListener("click", () => goExamQuestion(Number(btn.dataset.go))));
    // On a phone the buttons may scroll sideways: the current one comes
    // into view (not scrollIntoView, which would also move the fixed page).
    const dots = $("#engExamNav");
    const cur = $("#engExamNav .eng-exam-dot.is-current");
    if (dots && cur && dots.scrollWidth > dots.clientWidth) {
      dots.scrollLeft += cur.getBoundingClientRect().left - dots.getBoundingClientRect().left - (dots.clientWidth - cur.offsetWidth) / 2;
    }
  }

  function goExamQuestion(i) {
    const st = runner.exam;
    st.current = Math.min(Math.max(0, i), runner.round.length - 1);
    st.confirming = false;
    showExamQuestions();
    saveExam();
    renderExamTask();
    refreshExamChrome();
  }

  function confirmExam() {
    runner.exam.confirming = true;
    renderExamTask();
    refreshExamChrome();
  }

  // A complete-the-sentence question shows its blank as a line.
  function examQuestionHtml(q) {
    if (q.type !== "complete") return questionHtml(q);
    const parts = esc(q.q).split("___");
    return `<p class="eng-read-q" dir="ltr">${parts.join(`<span class="eng-exam-blank"></span>`)}</p>`;
  }

  function examNote(text) {
    return `<p class="eng-read-lang eng-exam-note">${ICONS.write}<span>${esc(text)}</span></p>`;
  }

  function examAnswerHtml(q, i) {
    const st = runner.exam;
    const a = st.answers[i];
    const order = st.orders[i];
    const typed = (multiline, inHebrew) =>
      multiline
        ? `<textarea class="eng-read-input" id="engExamInput" rows="3" dir="${inHebrew ? "auto" : "ltr"}" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="${esc(t("typeHere"))}" placeholder="${esc(t("typeHere"))}">${esc(a || "")}</textarea>`
        : `<input type="text" class="eng-input eng-exam-word" id="engExamInput" dir="ltr" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="next" aria-label="${esc(t("typeHere"))}" placeholder="${esc(t("typeHere"))}" value="${esc(a || "")}" />`;
    if (q.type === "mc") {
      return `<div class="eng-read-options">${order
        .map(
          (oi, k) =>
            `<button type="button" class="eng-read-option eng-exam-choice${a === oi ? " is-selected" : ""}" data-i="${oi}" aria-pressed="${a === oi}" dir="ltr"><span class="eng-read-option-key">${OPTION_KEYS[k]}</span><span class="eng-read-option-text">${esc(q.options[oi])}</span></button>`
        )
        .join("")}</div>`;
    }
    if (q.type === "tf") {
      const btn = (value, cls, icon, label) =>
        `<button type="button" class="eng-tf-btn ${cls} eng-exam-choice${a === value ? " is-selected" : ""}" data-value="${value}" aria-pressed="${a === value}">${icon}<span>${esc(t(label))}</span></button>`;
      return `<div class="eng-options eng-options--tf">${btn(true, "eng-tf-btn--true", ICONS.check, "trueBtn")}${btn(false, "eng-tf-btn--false", ICONS.cross, "falseBtn")}</div>`;
    }
    if (q.type === "open") {
      const inHebrew = q.lang === "he";
      return `${examNote(inHebrew ? (lang() === "he" ? t("answerHe") : t("answerAny")) : t("answerEn"))}${typed(true, inHebrew)}`;
    }
    if (q.type === "complete") return `${examNote(t("examCompleteHow"))}${typed(true, false)}`;
    if (q.type === "word") return `${examNote(t("examWordHow"))}${typed(false, false)}`;
    if (q.type === "multi") {
      const picks = a || [];
      return `
        ${examNote(t("examPickTwo", q.answers.length))}
        <div class="eng-read-options">${order
          .map((oi) => {
            const on = picks.includes(oi);
            return `<button type="button" class="eng-read-option eng-exam-choice eng-exam-check${on ? " is-selected" : ""}" data-i="${oi}" aria-pressed="${on}" dir="ltr"><span class="eng-read-option-key eng-exam-box">${on ? ICONS.check : ""}</span><span class="eng-read-option-text">${esc(q.options[oi])}</span></button>`;
          })
          .join("")}</div>
        <p class="eng-exam-hint" id="engExamHint" aria-live="polite"></p>`;
    }
    if (q.type === "quote") {
      const chosen = a == null ? "" : st.sentences[a];
      return `
        <div class="eng-exam-quote${chosen ? "" : " is-empty"}">
          ${chosen ? `<span class="eng-exam-quote-label">${esc(t("examQuoteChosen"))}</span><span class="eng-exam-quote-text" dir="ltr" lang="en">${esc(chosen)}</span>` : `<span>${esc(t("examQuoteNone"))}</span>`}
        </div>
        <div class="eng-exam-quote-actions">
          <button type="button" class="eng-read-back eng-exam-pick" id="engExamPick">${ICONS.reading}<span>${esc(t("examQuotePick"))}</span></button>
          ${chosen ? `<button type="button" class="eng-text-btn eng-exam-clear" id="engExamClear">${esc(t("examQuoteClear"))}</button>` : ""}
        </div>`;
    }
    // sequence
    const placed = a || [];
    return `
      ${examNote(t("examSequenceHow"))}
      <div class="eng-exam-seq">${order
        .map((k) => {
          const pos = placed.indexOf(k);
          return `<button type="button" class="eng-exam-seq-item${pos >= 0 ? " is-placed" : ""}" data-k="${k}" aria-pressed="${pos >= 0}" dir="ltr"><span class="eng-exam-seq-num">${pos >= 0 ? pos + 1 : ""}</span><span class="eng-exam-seq-text">${esc(q.items[k])}</span></button>`;
        })
        .join("")}</div>
      ${placed.length ? `<button type="button" class="eng-text-btn eng-exam-clear" id="engExamClear">${esc(t("examSequenceClear"))}</button>` : ""}`;
  }

  function setExamAnswer(i, value) {
    const before = examAnswered(i);
    runner.exam.answers[i] = value;
    saveExam();
    if (examAnswered(i) !== before) refreshExamChrome();
  }

  // Click answers redraw the answer area; typed ones only save, so the
  // cursor stays where it is.
  function renderExamAnswer() {
    const st = runner.exam;
    const i = st.current;
    const q = runner.round[i];
    const box = $("#engExamAnswer");
    if (!box) return;
    box.innerHTML = examAnswerHtml(q, i);
    const redraw = (value) => {
      setExamAnswer(i, value);
      renderExamAnswer();
    };
    if (q.type === "mc") $$(".eng-exam-choice", box).forEach((btn) => btn.addEventListener("click", () => redraw(Number(btn.dataset.i))));
    else if (q.type === "tf") $$(".eng-exam-choice", box).forEach((btn) => btn.addEventListener("click", () => redraw(btn.dataset.value === "true")));
    else if (q.type === "multi") {
      $$(".eng-exam-choice", box).forEach((btn) =>
        btn.addEventListener("click", () => {
          const oi = Number(btn.dataset.i);
          const picks = st.answers[i] || [];
          if (picks.includes(oi)) redraw(picks.filter((p) => p !== oi));
          else if (picks.length >= q.answers.length) {
            const hint = $("#engExamHint");
            if (hint) hint.textContent = t("examPickedMax", q.answers.length);
          } else redraw([...picks, oi]);
        })
      );
    } else if (q.type === "sequence") {
      $$(".eng-exam-seq-item", box).forEach((btn) =>
        btn.addEventListener("click", () => {
          const k = Number(btn.dataset.k);
          const placed = st.answers[i] || [];
          redraw(placed.includes(k) ? placed.filter((p) => p !== k) : [...placed, k]);
        })
      );
      $("#engExamClear", box)?.addEventListener("click", () => redraw([]));
    } else if (q.type === "quote") {
      $("#engExamPick", box).addEventListener("click", () => setExamTextOpen(true));
      $("#engExamClear", box)?.addEventListener("click", () => {
        redraw(null);
        syncExamPassage();
      });
    } else {
      const input = $("#engExamInput", box);
      input.addEventListener("input", () => setExamAnswer(i, input.value));
      input.addEventListener("keydown", (e) => {
        if (e.key !== "Enter" || e.shiftKey) return;
        e.preventDefault();
        if (i < runner.round.length - 1) goExamQuestion(i + 1);
        else confirmExam();
      });
      // Phones would pop the keyboard over the passage; let the student tap in.
      if (window.matchMedia("(hover: hover)").matches) input.focus({ preventScroll: true });
    }
  }

  function chooseQuote(s) {
    const st = runner.exam;
    if (runner.phase !== "exam" || st.confirming || runner.round[st.current]?.type !== "quote") return;
    setExamAnswer(st.current, st.answers[st.current] === s ? null : s);
    syncExamPassage();
    renderExamAnswer();
    // The chosen sentence lights up, then the question comes back with it.
    if (st.answers[st.current] != null) setTimeout(() => setExamTextOpen(false), 450);
  }

  function renderExamTask() {
    const box = $("#engExamTask");
    if (!box) return;
    const st = runner.exam;
    // A new task brings the question back if the passage was open.
    setExamTextOpen(false);
    const n = runner.round.length;
    if (st.confirming) {
      const missing = n - examAnsweredCount();
      box.innerHTML = `
        <div class="eng-exam-confirm">
          <span class="eng-exam-confirm-icon">${ICONS.flag}</span>
          <h3 class="eng-exam-confirm-title">${esc(t("examConfirmTitle"))}</h3>
          <p class="eng-exam-confirm-text">${esc(missing ? t("examConfirmMissing", missing) : t("examConfirmAll"))} ${esc(t("examConfirmNote"))}</p>
          <div class="eng-exam-confirm-actions">
            <button type="button" class="btn btn-primary btn-candy font-cartoon" id="engExamYes">${esc(t("examConfirmYes"))}</button>
            <button type="button" class="btn btn-candy font-cartoon eng-btn-secondary" id="engExamNo">${esc(t("examConfirmNo"))}</button>
          </div>
        </div>`;
      $("#engExamYes").addEventListener("click", finishExam);
      $("#engExamNo").addEventListener("click", () => goExamQuestion(st.current));
      $("#engExamYes").focus({ preventScroll: true });
      syncExamPassage();
      return;
    }
    const i = st.current;
    const q = runner.round[i];
    const last = i === n - 1;
    box.innerHTML = `
      <div class="eng-read-q-head">
        <p class="eng-exam-step"><span class="eng-exam-step-num">${esc(t("questionNum", i + 1, n))} · </span>${esc(t("examTypeOne")[q.type] || "")}</p>
        <button type="button" class="eng-read-back" id="engReadBack">${ICONS.reading}<span>${esc(t("backToText"))}</span></button>
      </div>
      ${examQuestionHtml(q)}
      <div class="eng-exam-answer" id="engExamAnswer"></div>
      <div class="eng-exam-foot">
        <button type="button" class="eng-read-reveal eng-exam-prev" id="engExamPrev"${i === 0 ? " disabled" : ""}>${esc(t("examPrev"))}</button>
        <button type="button" class="btn btn-primary btn-candy font-cartoon eng-check" id="engExamNext">${esc(t(last ? "examSubmit" : "examNext"))}</button>
      </div>`;
    renderExamAnswer();
    $("#engReadBack").addEventListener("click", () => setExamTextOpen(true));
    $("#engExamPrev").addEventListener("click", () => goExamQuestion(i - 1));
    $("#engExamNext").addEventListener("click", () => (last ? confirmExam() : goExamQuestion(i + 1)));
    syncExamPassage();
    box.scrollTop = 0;
  }

  // { credit (0, ½ or 1), given, right, model } for one question: what the
  // student answered and the right answer, as text.
  function gradeExamQuestion(q, a) {
    const sentences = runner.exam.sentences;
    if (q.type === "mc") return { credit: a != null && q.options[a] === q.answer ? 1 : 0, given: a == null ? "" : q.options[a], right: q.answer };
    if (q.type === "tf") return { credit: a === q.answer ? 1 : 0, given: a == null ? "" : t(a ? "trueBtn" : "falseBtn"), right: t(q.answer ? "trueBtn" : "falseBtn") };
    if (q.type === "open" || q.type === "complete") {
      const given = String(a || "").trim();
      return { credit: given && openIsRight(q, given) ? 1 : 0, given, right: lang() === "en" && q.answerEn ? q.answerEn : q.answer, model: true };
    }
    if (q.type === "word") {
      const given = String(a || "").trim();
      const right = [q.answer, ...(q.accept || [])].map(normalize).includes(normalize(given));
      return { credit: given && right ? 1 : 0, given, right: q.answer };
    }
    if (q.type === "multi") {
      const picks = (a || []).slice(0, q.answers.length);
      const hits = picks.filter((oi) => q.answers.includes(q.options[oi])).length;
      return { credit: hits / q.answers.length, given: picks.map((oi) => q.options[oi]).join(" · "), right: q.answers.join(" · ") };
    }
    if (q.type === "quote") {
      const rights = [].concat(q.answer);
      const given = a == null ? "" : sentences[a] || "";
      return { credit: given && rights.map(normalize).includes(normalize(given)) ? 1 : 0, given, right: rights[0] };
    }
    // sequence: all in place is a point; at least half in place, half a point.
    const order = a || [];
    const inPlace = order.filter((k, pos) => k === pos).length;
    const n = q.items.length;
    const credit = order.length === n && inPlace === n ? 1 : inPlace * 2 >= n ? 0.5 : 0;
    return { credit, given: order.map((k) => q.items[k]).join(" → "), right: q.items.join(" → ") };
  }

  function finishExam() {
    const st = runner.exam;
    if (!st || runner.phase === "results") return;
    stopExamTimer();
    const now = Date.now();
    st.usedMs = (st.timed ? Math.min(now, st.deadline) : now) - st.startedAt;
    st.results = runner.round.map((q, i) => ({ q, i, ...gradeExamQuestion(q, st.answers[i]) }));
    storeExamSave(runner.exercise, null);
    runner.startedAt = st.startedAt;
    runner.score = Math.round(st.results.reduce((sum, r) => sum + r.credit, 0) * 2);
    runner.total = runner.round.length * 2;
    runner.mistakes = [];
    // What the teacher's page lists, in Hebrew where the question is.
    runner.mistakeLog = st.results
      .filter((r) => r.credit < 1)
      .map((r) => ({ prompt: questionTexts(r.q).en, answer: r.right, given: r.given || "—" }));
    renderResults();
    playSfx("finish");
  }

  function examPoints(x) {
    return Number.isInteger(x) ? String(x) : x.toFixed(1);
  }

  function renderExamResults() {
    const st = runner.exam;
    const { topic, exercise: ex } = runner;
    runner.phase = "results";
    recordRound();
    saveBest(`${topic.id}/${ex.id}`, runner.score, runner.total);
    const grade = Math.round((100 * runner.score) / runner.total);
    const types = Object.keys(t("examTypes")).filter((type) => st.results.some((r) => r.q.type === type));
    const rows = types
      .map((type) => {
        const list = st.results.filter((r) => r.q.type === type);
        const got = list.reduce((sum, r) => sum + r.credit, 0);
        const cls = got === list.length ? " is-right" : got === 0 ? " is-wrong" : "";
        return `<li class="eng-exam-brow${cls}"><span>${esc(t("examTypes")[type])}</span><b dir="ltr">${examPoints(got)}/${list.length}</b></li>`;
      })
      .join("");
    const items = st.results
      .map((r) => {
        const { en, he } = questionTexts(r.q);
        const question = he && he !== en ? `<span class="has-he">${biText(en, he)}</span>` : `<span dir="auto">${esc(en)}</span>`;
        const cls = r.credit === 1 ? "is-right" : r.credit > 0 ? "is-half" : "is-wrong";
        const mark = r.credit === 1 ? ICONS.check : r.credit > 0 ? ICONS.star : ICONS.cross;
        const showRight = r.credit < 1 || r.model;
        return `
          <li class="eng-exam-ritem ${cls}">
            <span class="eng-exam-rmark">${mark}</span>
            <div class="eng-exam-rbody">
              <span class="eng-exam-rtype">${r.i + 1} · ${esc(t("examTypeOne")[r.q.type] || "")}${r.credit > 0 && r.credit < 1 ? ` · ${esc(t("examPartial"))}` : ""}</span>
              <p class="eng-exam-rq">${question}</p>
              <p class="eng-exam-rline"><span class="eng-exam-rlabel">${esc(t("examYours"))}</span> <bdi class="${r.given ? "" : "is-none"}">${esc(r.given || t("examNoAnswer"))}</bdi></p>
              ${showRight ? `<p class="eng-exam-rline eng-exam-rright"><span class="eng-exam-rlabel">${esc(t(r.model ? "examModel" : "examRight"))}</span> <bdi>${esc(r.right)}</bdi></p>` : ""}
            </div>
          </li>`;
      })
      .join("");
    renderRunnerShell(
      `
      <div class="eng-read eng-read--paged eng-exam is-questions">
        ${examSideHtml("examBackToResults")}
        <div class="eng-read-task eng-exam-task">
          <div class="eng-exam-score">
            <div class="eng-grade">
              <span class="eng-grade-label">${esc(t("examGrade"))}</span>
              <p class="eng-score font-cartoon">${grade}</p>
            </div>
            <div class="eng-exam-score-text">
              ${st.timeUp ? `<p class="eng-exam-timeup">${ICONS.clock}<span>${esc(t("examTimeUp"))}</span></p>` : ""}
              <p class="eng-exam-used">${esc(t("examTimeUsed", examClock(st.usedMs)))}</p>
            </div>
          </div>
          <div class="eng-exam-breakdown">
            <h4>${esc(t("examByType"))}</h4>
            <ul>${rows}</ul>
          </div>
          <div class="eng-results-actions eng-exam-actions">
            <button type="button" class="btn btn-primary btn-candy font-cartoon" id="engExamRetake">${esc(t("examRetake"))}</button>
            <a class="btn btn-candy font-cartoon eng-btn-secondary" href="#${esc(topic.id)}">${esc(t("examAll"))}</a>
            ${homeworkButtonHtml()}
          </div>
          <div class="eng-exam-review">
            <div class="eng-read-q-head">
              <h4>${esc(t("examReview"))}</h4>
              <button type="button" class="eng-read-back" id="engReadBack">${ICONS.reading}<span>${esc(t("examPassage"))}</span></button>
            </div>
            <ol>${items}</ol>
          </div>
        </div>
      </div>`,
      `<div class="eng-earned" id="engEarned" aria-live="polite">${earnedHtml(runner.earned)}</div>`
    );
    celebrate(grade, $(".eng-exam-task"));
    // The passage, with the quote answers marked, is a button away.
    $("#engReadBack").addEventListener("click", () => setExamTextOpen(true));
    $("#engReadGo").addEventListener("click", () => setExamTextOpen(false));
    // The right sentence of each quote question, and a wrong one picked.
    st.results
      .filter((r) => r.q.type === "quote")
      .forEach((r) => {
        const rights = [].concat(r.q.answer).map(normalize);
        st.sentences.forEach((sent, s) => {
          const el = $(`#engExamText .eng-sent[data-s="${s}"]`);
          if (rights.includes(normalize(sent))) el?.classList.add("is-quote-right");
          else if (st.answers[r.i] === s) el?.classList.add("is-quote-wrong");
        });
      });
    $("#engExamRetake").addEventListener("click", () => startExercise(topic, ex));
  }

  // The exams topic: how an exam works, then the exams of each level.
  function examsPageHtml(topic, best, started) {
    const levels = [1, 2, 3, 4]
      .map((level) => {
        const list = topic.exercises.filter((ex) => ex.level === level);
        if (!list.length) return "";
        const cards = list
          .map((ex) => {
            const record = best[`${topic.id}/${ex.id}`];
            const bars = [1, 2, 3, 4].map((n) => `<i${n <= ex.level ? ' class="is-on"' : ""}></i>`).join("");
            return `
              <div class="eng-level-card eng-level-card--${ex.level} eng-exam-card is-library">
                <span class="eng-level-head">
                  <span class="eng-level-name">${esc(t("level", ex.level))}</span>
                  <span class="eng-level-bars" role="img" aria-label="${esc(t("levelName", ex.level))}">${bars}</span>
                </span>
                <a class="eng-level-title eng-card-link" href="#${esc(topic.id)}/${esc(ex.id)}" dir="auto">${esc(passageTitle(ex))}</a>
                <span class="eng-level-meta">${esc(t("examMeta", passageWordCount(ex), ex.questions.length, ex.minutes))}</span>
                ${statusHtml(exerciseStatus(topic, ex, best, started))}
                ${record ? `<span class="eng-ex-best">${esc(t("examBest", Math.round((100 * record.score) / record.total)))}</span>` : ""}
              </div>`;
          })
          .join("");
        return `
          <section class="eng-step">
            <h3 class="eng-step-title"><span class="eng-step-num eng-step-num--level-${level}">${level}</span>${esc(`${t("level", level)} · ${t("levelName", level)}`)}</h3>
            <div class="eng-level-grid">${cards}</div>
          </section>`;
      })
      .join("");
    return `
      <p class="eng-step-lead eng-step-lead--page">${esc(t("examsLead"))}</p>
      <ul class="eng-exam-how">${t("examHow").map((line) => `<li>${esc(line)}</li>`).join("")}</ul>
      ${levels}`;
  }

  // On the Bagrut topic: the way to the timed exams.
  function examLinkHtml() {
    return `
      <a class="eng-exam-link" href="#${EXAMS_TOPIC}">
        <span class="eng-exam-link-icon">${ICONS.exam}</span>
        <span class="eng-exam-link-text">${esc(t("examLink"))}</span>
        <span class="btn btn-primary btn-candy font-cartoon eng-exam-link-go">${esc(t("examLinkGo"))}</span>
      </a>`;
  }

  function bindRunnerKeys() {
    document.addEventListener("keydown", (e) => {
      if (views.exercise()?.classList.contains("hidden") || slideViewer.isOpen() || help.isOpen()) return;
      if (document.querySelector("#lessonPlayer:not(.hidden)")) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (runner.phase !== "question") return;
      // A reading question is hidden while its passage is open.
      if ($(".eng-read.is-text-open")) return;
      // Typing exercises handle their own keys inside the input.
      if (e.target.closest?.("input, textarea, .eng-settings, .eng-instr")) return;
      if (!runner.answered && runner.exercise?.type === "letters") {
        TYPES.letters.key(e);
        return;
      }
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
    return ex.type === "reading" ? passageTitle(ex) : loc(ex, "title");
  }

  // The exercise on paper (english-exercise-sheets.js), where it has a paper
  // form.
  function paperBtnHtml(topic, ex) {
    if (SUBJECT || !window.EnglishExerciseSheets?.canPrint(ex)) return "";
    const href = `/services/english-worksheet?topic=${encodeURIComponent(topic.id)}&exercise=${encodeURIComponent(ex.id)}`;
    const label = esc(t("paperSheet", exerciseName(ex)));
    return `<a class="eng-info-btn" href="${esc(href)}" aria-label="${label}" title="${label}">${ICONS.download}</a>`;
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
    const fill = `<span class="${cls}${answer.length === 1 ? " is-letter" : ""}">${aHtml(answer)}</span>`;
    if (SUBJECT) {
      // A typed answer without a blank to go in shows on a line of its own.
      const typed = !hasBlank(q) && cls === "eng-help-typed" ? `<p class="eng-help-sentence">${fill}</p>` : "";
      if (q.math) {
        const text = q.text ? `<p class="eng-help-q" dir="rtl">${qHtml(q.text)}</p>` : "";
        return `${text}<p class="eng-help-sentence" dir="ltr">${mathLineHtml(q, q.math.includes("___") ? fill : "")}</p>${typed}`;
      }
      const parts = qHtml(q.text).split("___");
      return `<p class="eng-help-sentence" dir="rtl">${parts.length < 2 ? parts[0] : `${parts[0]}${fill}${parts.slice(1).join("___")}`}</p>${typed}`;
    }
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
    return `<div class="eng-help-options" dir="${TEXT_DIR}">${options
      .map((o) => (o === answer ? `<span class="eng-help-opt is-right">${ICONS.check}${aHtml(o)}</span>` : `<span class="eng-help-opt">${aHtml(o)}</span>`))
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
        ${q.say ? `<span class="eng-help-context eng-help-say" lang="he">${esc(t("soundsLike"))} ${esc(q.say)}</span>` : ""}
        ${helpTranslation(q.he)}
        ${helpOptions(options, q.answer)}`;
    },
    truefalse(ex) {
      if (ex.questions[0]?.img) {
        const q = ex.questions.find((item) => !item.correct) || ex.questions[0];
        return `
          <span class="eng-help-picture"><img src="${esc(q.img)}" alt="" draggable="false" /></span>
          <div class="eng-help-tf-row">
            <p class="eng-help-sentence" dir="ltr">${esc(q.text)}</p>
            ${helpBadge(q.correct)}
            ${q.correct ? "" : `<p class="eng-help-fix"><span>${esc(t("fixWordLabel"))}</span><b dir="ltr">${esc(q.fix)}</b></p>`}
          </div>`;
      }
      const right = ex.questions.find((q) => q.correct);
      const wrong = ex.questions.find((q) => !q.correct && q.fix) || ex.questions.find((q) => !q.correct);
      const said = (q) => (SUBJECT ? `${qHtml(q.text)}${q.math ? ` ${mathLineHtml(q)}` : ""}` : esc(q.text));
      const row = (q) => `
        <div class="eng-help-tf-row">
          <p class="eng-help-sentence" dir="${TEXT_DIR}">${said(q)}</p>
          ${helpBadge(q.correct)}
          ${!q.correct && q.fix ? `<p class="eng-help-fix"><span>${esc(t("fixLabel"))}</span><b dir="${TEXT_DIR}">${aHtml(q.fix)}</b></p>` : ""}
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
      const chips = (list, cls = "") => `<div class="eng-help-chips" dir="${TEXT_DIR}">${list.map((w) => `<span class="eng-help-chip${cls}">${esc(w)}</span>`).join("")}</div>`;
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
        <div class="eng-help-pairs" dir="${TEXT_DIR}">${pairs
          .map(
            (p) => `
              <div class="eng-help-pair">
                <span class="eng-help-chip is-right">${aHtml(p.a)}</span>
                <span class="eng-help-pair-line"></span>
                ${p.img ? `<span class="eng-help-pic is-right eng-help-pic--small"><img src="${esc(p.img)}" alt="" draggable="false" /></span>` : `<span class="eng-help-chip is-right" dir="auto">${aHtml(p.b)}</span>`}
              </div>`
          )
          .join("")}</div>`;
    },
    "find-error"(ex) {
      const q = ex.questions.reduce((a, b) => (b.text.length < a.text.length ? b : a));
      const words = q.text
        .split(" ")
        .map((tk, i) => (i >= q.from && i < q.to ? `<span class="eng-help-error">${esc(tk)}</span>` : esc(tk)))
        .join(" ");
      return `
        <p class="eng-help-sentence" dir="ltr">${words}</p>
        ${helpArrow}
        <p class="eng-help-sentence" dir="ltr"><span class="eng-help-fill">${esc(q.full)}</span></p>`;
    },
    "sentence-choice"(ex) {
      const q = ex.questions.reduce((a, b) => (b.answer.length < a.answer.length ? b : a));
      return `
        ${q.he ? `<p class="eng-help-tr eng-help-tr--prompt" dir="rtl" lang="he">${esc(q.he)}</p>` : ""}
        <div class="eng-help-sentences" dir="ltr">${answerInMiddle(q.options.slice(0, 3), q.answer)
          .map((o) => (o === q.answer ? `<span class="eng-help-opt is-right">${ICONS.check}${esc(o)}</span>` : `<span class="eng-help-opt">${esc(o)}</span>`))
          .join("")}</div>`;
    },
    chat(ex) {
      const q = ex.questions[0];
      return `
        <div class="eng-help-chat" dir="ltr"><span class="eng-help-chat-avatar">${ICONS.robo}</span><span class="eng-help-chat-line">${esc(q.text)}</span></div>
        ${q.he ? `<p class="eng-help-tr eng-help-tr--prompt" dir="rtl" lang="he">${esc(q.he)}</p>` : ""}
        <div class="eng-help-sentences" dir="ltr">${answerInMiddle(q.options.slice(0, 3), q.answer)
          .map((o) => (o === q.answer ? `<span class="eng-help-opt is-right">${ICONS.check}${esc(o)}</span>` : `<span class="eng-help-opt">${esc(o)}</span>`))
          .join("")}</div>`;
    },
    letters(ex) {
      const chips = (list, cls = "") => `<div class="eng-help-chips" dir="ltr">${list.map((c) => `<span class="eng-help-chip${cls}">${esc(c)}</span>`).join("")}</div>`;
      if (ex.words) {
        const [w] = helpWords(ex, 1);
        const letters = [...w.en.replace(/[^A-Za-z]/g, "")];
        return `
          <span class="eng-help-picture"><img src="${esc(w.img)}" alt="" draggable="false" /><span>${esc(w.he)}</span></span>
          ${chips(scrambleWords(letters))}
          ${helpArrow}
          ${chips([w.en], " is-right")}`;
      }
      const q = ex.questions[0];
      return `
        ${helpSentence(q, q.answer, "eng-help-fill")}
        ${chips(scrambleWords([...q.answer.replace(/[^A-Za-z]/g, ""), ...(q.extra || [])]))}`;
    },
    dictation(ex) {
      const said = ex.words ? helpWords(ex, 1)[0].en : ex.questions.reduce((a, b) => (b.answer.length < a.answer.length ? b : a)).answer;
      const prompt = canSpeak()
        ? `<button type="button" class="eng-help-speak" data-say="${esc(said)}" aria-label="${esc(t("speakWord", said))}">${ICONS.listen}</button>`
        : "";
      return `
        <div class="eng-help-listen">${prompt}<span class="eng-help-heard" dir="ltr">“${esc(said)}”</span></div>
        <p class="eng-help-sentence" dir="ltr"><span class="eng-help-typed">${esc(said)}</span></p>`;
    },
    speak(ex) {
      const [w] = helpWords(ex, 1);
      return `
        <span class="eng-help-picture"><img src="${esc(w.img)}" alt="" draggable="false" /><span>${esc(w.he)}</span></span>
        <div class="eng-help-listen"><span class="eng-help-mic">${ICONS.mic}</span><span class="eng-help-heard" dir="ltr">“${esc(w.en)}”</span></div>`;
    },
    translate(ex) {
      const words = helpWords(ex);
      const [w] = words;
      const toHe = ex.dir === "en-he";
      const label = (item) => (toHe ? item.he : item.en);
      return `
        <p class="eng-help-word"${toHe ? ' dir="ltr"' : ' dir="rtl" lang="he"'}>${esc(toHe ? w.en : w.he)}</p>
        <div class="eng-help-options" dir="${toHe ? "rtl" : "ltr"}">${answerInMiddle(words.map(label), label(w))
          .map((o) => (o === label(w) ? `<span class="eng-help-opt is-right">${ICONS.check}${esc(o)}</span>` : `<span class="eng-help-opt">${esc(o)}</span>`))
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
        if (e.target.closest("[data-help-lesson]")) {
          const { topic, lessonId } = current;
          close(false);
          openTopicLesson(topic, lessonId);
        }
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

    // A topic's slide lesson: its length and summary, and the way in.
    function renderLesson() {
      const { topic, lessonId } = current;
      const lesson = lessonById(lessonId);
      if (!lesson) return;
      const facts = factsHtml([levelLabel(lessonLevel(topic)), t("slides", lesson.slides?.length || 0)]);
      // A numbered lesson has its own summary; the topic's is for all of it.
      const summary = (topicLessonIds(topic).length < 2 && loc(topic, "lessonSummary")) || lesson.summary || "";
      root.innerHTML = `
        <div class="eng-help-backdrop" data-help-close></div>
        <div class="eng-help-card eng-help-card--lesson">
          <div class="eng-help-head">
            <div class="eng-help-heading">
              <h2 class="eng-help-title" id="engHelpTitle">${lessonTitleHtml(topic, lessonId)}</h2>
              <p class="eng-help-facts">${facts}</p>
            </div>
            <button type="button" class="eng-help-close" data-help-close aria-label="${esc(t("close"))}">${ICONS.cross}</button>
          </div>
          ${
            summary
              ? `<div class="eng-help-block">
                  <h3 class="eng-help-label">${esc(t("lessonWhat"))}</h3>
                  <p class="eng-help-what">${mixedText(summary)}</p>
                </div>`
              : ""
          }
          <div class="eng-help-actions">
            <button type="button" class="btn btn-primary btn-candy font-cartoon eng-help-go" data-help-lesson>${esc(t("openLesson"))}</button>
          </div>
        </div>`;
    }

    function render() {
      if (current.lesson) return renderLesson();
      const { topic, ex, inRunner } = current;
      const isReading = ex.type === "reading";
      const level = exerciseLevel(ex);
      const count = isReading ? t("readingMeta", passageWordCount(ex), ex.questions.length) : exerciseCountLabel(ex);
      const record = readBest()[`${topic.id}/${ex.id}`];
      // In progress on a big exercise: how much of it the rounds went through.
      const status = exerciseStatus(topic, ex);
      const covered = status === "progress" && !fitsOneRound(ex) ? Math.min(99, Math.floor(100 * coverage(topic, ex))) : 0;
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
            <div class="eng-help-heading">
              <h2 class="eng-help-title" id="engHelpTitle">${esc(t("helpButton"))}</h2>
              <p class="eng-help-facts">${factsHtml([levelLabel(level), count])}${
                record ? ` <span class="eng-ex-best">${esc(t("best", record.score, record.total))}</span>` : ""
              }</p>
              ${status ? `<p class="eng-help-status">${statusHtml(status)}${covered ? `<span>${esc(t("statusCovered", covered))}</span>` : ""}</p>` : ""}
            </div>
            <button type="button" class="eng-help-close" data-help-close aria-label="${esc(t("close"))}">${ICONS.cross}</button>
          </div>
          <div class="eng-help-block">
            <h3 class="eng-help-label">${esc(t("helpWhat"))}</h3>
            <p class="eng-help-what">${byLine(what, mixedText)}</p>
            ${tip ? `<p class="eng-help-tip">${mixedText(tip)}</p>` : ""}
            ${isReading ? `<p class="eng-help-tip">${mixedText(t("helpReadTools"))}</p>` : ""}
          </div>
          <div class="eng-help-block">
            <div class="eng-help-example">${(HELP_EXAMPLES[ex.type] || HELP_EXAMPLES.choice)(ex)}</div>
          </div>
          <div class="eng-help-actions">${action}</div>
        </div>`;
    }

    function open(topic, ex, inRunner, opener) {
      show({ topic, ex, inRunner }, opener);
    }

    function openLesson(topic, opener, lessonId = topicLessonIds(topic)[0]) {
      show({ topic, lesson: true, lessonId }, opener);
    }

    function show(state, opener) {
      if (!root) build();
      current = state;
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
      window.PleyiSpeech.stop();
      if (restoreFocus) {
        // A language switch may have re-rendered the button that opened the dialog.
        const target = lastFocus?.isConnected
          ? lastFocus
          : $(current.lesson ? `[data-lesson-info="${CSS.escape(current.lessonId)}"]` : `[data-help="${CSS.escape(current.ex.id)}"]`);
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

    return { open, openLesson, close, isOpen, refresh };
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

  // Not the page's first view: back from practice, refreshTopBoard asks again.
  let routed = false;

  function route() {
    const again = routed;
    routed = true;
    clearTimeout(runner.timer);
    stopGame();
    stopExamTimer();
    runner.back = null;
    readAloud.stop();
    window.PleyiSpeech.stop();
    stopListening();
    if (slideViewer.isOpen()) slideViewer.close();
    const [topicId, exerciseId] = decodeURIComponent(location.hash.replace(/^#/, "")).split("/");
    if (topicId === REVIEW_ROUTE) {
      if (gameLessonReturn) forgetLessonReturn();
      showView("exercise");
      openReview(exerciseId || "");
      window.scrollTo({ top: 0 });
      return;
    }
    if (topicId === MIX_ROUTE) {
      if (gameLessonReturn) forgetLessonReturn();
      showView("exercise");
      openMix(exerciseId || "");
      window.scrollTo({ top: 0 });
      return;
    }
    if (topicId === DAILY_ROUTE && !SUBJECT) {
      if (gameLessonReturn) forgetLessonReturn();
      if (exerciseId === DAILY_GO) {
        showView("exercise");
        openDaily();
      } else {
        showView("topic");
        renderDailyPage();
      }
      window.scrollTo({ top: 0 });
      return;
    }
    if (topicId === TEST_ROUTE && !SUBJECT) {
      if (gameLessonReturn) forgetLessonReturn();
      showView("exercise");
      openTest(exerciseId || "");
      window.scrollTo({ top: 0 });
      return;
    }
    if (topicId === VOCAB_ROUTE) {
      if (gameLessonReturn) forgetLessonReturn();
      showView("topic");
      renderVocabHub();
      dockBack();
      window.scrollTo({ top: 0 });
      return;
    }
    if (topicId === CHAT_ROUTE && !SUBJECT) {
      if (gameLessonReturn) forgetLessonReturn();
      const chat = exerciseId && findChat(exerciseId);
      if (chat) {
        showView("exercise");
        runner.back = `#${CHAT_ROUTE}`;
        startExercise(chat.topic, chat.exercise);
      } else {
        showView("topic");
        renderChatHub();
      }
      window.scrollTo({ top: 0 });
      return;
    }
    if (topicId === CARDS_ROUTE && !SUBJECT) {
      if (gameLessonReturn) forgetLessonReturn();
      if (exerciseId) {
        showView("exercise");
        openCards(exerciseId);
      } else {
        showView("topic");
        renderCardsHub();
      }
      window.scrollTo({ top: 0 });
      return;
    }
    const topic = findTopic(topicId);
    const exercise = findExercise(topic, exerciseId);
    const game = !exercise && findGame(topic, exerciseId);
    // A lesson task's link (#<topic>/lesson-<id>): the topic's page with the
    // lesson open over it. The address drops the lesson, so closing it
    // leaves the student on the topic.
    const lessonId = /^lesson-(.+)$/.exec(exerciseId || "")?.[1];
    if (topic && lessonId && topicLessonIds(topic).includes(lessonId)) {
      history.replaceState(null, "", `${location.pathname}${location.search}#${encodeURIComponent(topic.id)}`);
      if (gameLessonReturn) forgetLessonReturn();
      showView("topic");
      renderTopic(topic);
      dockBack();
      window.scrollTo({ top: 0 });
      openTopicLesson(topic, lessonId);
      return;
    }
    // Leaving a game that came from a lesson drops the way back to it.
    if (gameLessonReturn && !(game && gameLessonReturn.pictureGame === `${topic.id}/game-${game.id}`)) forgetLessonReturn();

    if (topic && exercise) {
      showView("exercise");
      startExercise(topic, exercise);
    } else if (topic && game) {
      showView("exercise");
      startGame(topic, game);
    } else if (topic) {
      showView("topic");
      renderTopic(topic);
      dockBack();
    } else {
      showView("topics");
      renderTopicGrid();
      // Just the topics: the daily challenge's page is the flame on top, and the
      // word cards have a card in the lessons library (ready-lessons.html).
      refreshTopDaily();
      // Back from a topic: the practice there may have earned a certificate.
      refreshTopBoard(again);
      dockSiteBack();
    }
    window.scrollTo({ top: 0 });
  }

  // The mistake bank changed (an answer, or a student's bank arriving from
  // their file): the line on a topic's page follows.
  function refreshReviewLinks() {
    const slot = $("#engReviewSlot");
    if (slot && !views.topic()?.classList.contains("hidden")) {
      const topic = findTopic(decodeURIComponent(location.hash.replace(/^#/, "")).split("/")[0]);
      if (topic) slot.innerHTML = reviewStripHtml(topic);
    }
  }

  // The exercises the linked student finished, on any device, from their
  // file: the open topic page redraws with them.
  function loadFileFinished() {
    window.StudentProgress?.profile().then((student) => {
      if (!student?.finished?.length) return;
      fileFinished = new Set(student.finished);
      refreshTopicStatus();
    });
  }

  function refreshTopicStatus() {
    if (views.topic()?.classList.contains("hidden")) return;
    const topic = findTopic(decodeURIComponent(location.hash.replace(/^#/, "")).split("/")[0]);
    if (topic) {
      renderTopic(topic);
      dockBack();
    }
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
    // A click anywhere but on the word bubble or another word (or Escape)
    // closes the bubble.
    document.addEventListener("pointerdown", (e) => {
      if ($("#engDictPop") && !e.target.closest?.("#engDictPop, #engReadText .eng-tok[tabindex]")) dict.close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && $("#engDictPop")) dict.close();
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
      } else if (activeGame) {
        activeGame.relabel();
      } else if (runner.phase === "message") {
        // The "my mistakes" screen while it loads or has nothing to show.
        route();
      } else if (runner.phase === "cards") {
        // A word card keeps its place; the round's end screen comes back as it was.
        if (!cards?.list.length) route();
        else if (cards.index < cards.list.length) renderCardsStep();
        else renderCardsResults();
      } else if (runner.phase === "results") {
        renderResults();
      } else if (runner.exercise?.type === "exam") {
        // Every answer is saved as it is given, so the exam can redraw.
        if (runner.phase === "intro") renderExamIntro();
        else renderExam();
      } else if (runner.exercise?.type === "reading") {
        // Marked words are kept in state, so the reading and marking stages
        // can always re-render; a question only before it is answered, and
        // never one with typed text in it.
        const q = runner.round[runner.index];
        if (runner.read.stage !== "questions" || (!runner.answered && q?.type !== "open")) renderReading();
      } else if (!runner.answered && !["write", "order", "match", "listen", "letters", "dictation", "speak"].includes(runner.exercise?.type)) {
        renderQuestion();
      }
    });
    renderStudentBar();
    loadFileFinished();
    window.addEventListener("pleyi:mistakes", refreshReviewLinks);
    window.MistakeBank?.ready();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
