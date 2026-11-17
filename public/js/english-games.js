/* Learn English — vocabulary games for the picture-vocabulary topics (the
   "vocab" group and the basic "vocabulary" topic). english-learning.js lists
   them on the topic page and runs them in the fixed exercise screen at
   "#<topic>/game-<id>"; the games themselves live here.

   EnglishGames.list            — [{ id, title, titleEn, desc, descEn, icon }]
   EnglishGames.usable(words)   — the words a game may show (no pictures of
                                  girls or women); a topic needs MIN_WORDS.
   EnglishGames.listFor(words)  — the games a topic with these words can
                                  play (bingo needs more: game.minWords).
   EnglishGames.bestText(topicId, gameId) — "Your record: …" or "".
   EnglishGames.start(gameId, ctx) → { stop(), relabel() }
     ctx: { topic, words: [{ word, en, he, img }], shell(inner, hud),
            speak(text), canSpeak(), sfx(name), homeworkHtml(), copyLink(),
            record(activity), icons: { listen, star, link },
            backToLesson — set when the game was opened from a lesson's
            games slide; the results then lead back there }

   Every game opens on a how-to screen with a start button, so timers only
   run once the student is ready, and ends on a results screen with stars,
   the score, the personal record and the words worth going over again.
   A game with `modes` (bingo) shows a button per mode instead of the start
   button, and runs until the student leaves it. Dictation is the letter
   scramble with `extras` (letters that aren't in the word), played by ear. */

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const BEST_KEY = "pleyi-english-game-best";
  const MIN_WORDS = 4;
  // These pictures show a girl or a woman, and the games show pictures only.
  const SKIP_PICTURES = new Set(["mother", "sister", "grandmother", "family", "hair"]);

  const ICONS = {
    memory: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="6" width="10" height="14" rx="2"/><path d="M8.5 4.6 9 4a2 2 0 0 1 1.6-.6l8.4.9a2 2 0 0 1 1.8 2.2l-1.2 11.2a2 2 0 0 1-2.2 1.8l-2.4-.3"/><path d="M5.9 11a1.7 1.7 0 1 1 2.4 1.5c-.5.3-.8.7-.8 1.2v.3"/><circle cx="7.5" cy="16.6" r=".6" fill="currentColor"/></svg>`,
    speed: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="13.5" r="8"/><path d="M12 9.5v4l2.6 2.2M9.5 2.5h5M12 2.5v3M19.4 5.6l1.4 1.4"/></svg>`,
    balloons: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.5c-3.7 0-6.5 2.9-6.5 6.7 0 4.2 3.3 7.7 6.5 7.7s6.5-3.5 6.5-7.7c0-3.8-2.8-6.7-6.5-6.7Z"/><path d="m10.8 16.8-.9 1.6h4.2l-.9-1.6"/><path d="M12 18.4c0 1.7-1.6 1.9-1.6 3.4"/><path d="M8.8 7.4a3.6 3.6 0 0 1 2.4-2"/></svg>`,
    hunt: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5.5 5.5"/><path d="M8 8.5a3.2 3.2 0 0 1 2.4-1.2"/></svg>`,
    scramble: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="9" width="6" height="7" rx="1.5"/><rect x="9" y="5" width="6" height="7" rx="1.5"/><rect x="16" y="11" width="6" height="7" rx="1.5"/><path d="M4 20.5c2.5 1 5 1 7.5 0M11 3.2c-1.8-.9-4-.6-5.5.8"/></svg>`,
    heart: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.6s-8-4.8-8-10.5a4.4 4.4 0 0 1 8-2.6 4.4 4.4 0 0 1 8 2.6c0 5.7-8 10.5-8 10.5Z"/></svg>`,
    moves: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 11.5a8 8 0 0 1 13.6-5.2L20 8.6M20 3.5v5.1h-5.1"/><path d="M20 12.5a8 8 0 0 1-13.6 5.2L4 15.4M4 20.5v-5.1h5.1"/></svg>`,
    hint: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3Z"/></svg>`,
    trophy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 4h10v5a5 5 0 0 1-10 0V4Z"/><path d="M7 6H4v1.5A3.5 3.5 0 0 0 7.5 11M17 6h3v1.5a3.5 3.5 0 0 1-3.5 3.5M12 14v3.5M8 21h8M9.5 17.5h5l.5 3.5H9l.5-3.5Z"/></svg>`,
    question: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8.8 8.6a3.3 3.3 0 1 1 4.6 3c-.9.4-1.4 1.2-1.4 2.2v.7"/><circle cx="12" cy="18.3" r="1.2" fill="currentColor" stroke="none"/></svg>`,
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5L20 7"/></svg>`,
    cross: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>`,
    bingo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="6" cy="6" r="1.5" fill="currentColor"/><circle cx="18" cy="18" r="1.5" fill="currentColor"/></svg>`,
    adventure: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20.5c3.5 0 4-3.5 7-4.5s5.5.5 6.5-3.5" stroke-dasharray="2.6 2.6"/><circle cx="4" cy="20.5" r="1.3" fill="currentColor"/><path d="M17.5 12V3.5"/><path d="M17.5 3.5H22l-1.4 2.2L22 8h-4.5"/></svg>`,
    board: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="3.5" width="19" height="13" rx="2"/><path d="M12 16.5v4M8 20.5h8"/></svg>`,
    phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M10.5 18.5h3"/></svg>`,
    print: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/></svg>`,
    picture: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="8.5" cy="9.5" r="1.8"/><path d="m21 15.5-5-5L6 20"/></svg>`,
    home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5.5h4V20"/></svg>`,
    flag: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 21V4"/><path d="M5 4h12l-2.2 3.5L17 11H5"/></svg>`,
    sentence: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="5" width="7.5" height="6" rx="1.5"/><rect x="11.5" y="5" width="4.5" height="6" rx="1.5"/><rect x="2" y="14" width="5" height="6" rx="1.5"/><rect x="9" y="14" width="7" height="6" rx="1.5"/><path d="M19 8h2.5M19 17h2.5"/></svg>`,
    dictation: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.5 9.5a5.5 5.5 0 0 1 11 0c0 3.2-3.2 4.2-3.2 7.3a3.3 3.3 0 0 1-6.1 1.7"/><path d="M9.6 9.8a2.4 2.4 0 0 1 4.8 0c0 1.4-1.2 1.9-1.8 2.8"/><path d="M19.5 3.5c1.3 1.2 2 2.9 2 4.7s-.7 3.5-2 4.7"/></svg>`,
    snake: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 20h9a3.5 3.5 0 0 0 0-7H8.5a3.5 3.5 0 0 1 0-7H15"/><circle cx="17.8" cy="6" r="2.8"/><path d="M20.6 6h1.9"/><circle cx="18.3" cy="5.2" r=".5" fill="currentColor"/></svg>`,
    arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19.5v-15M5 11.5l7-7 7 7"/></svg>`,
    slow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 16.5h13a3 3 0 0 0 3-3v-1.5"/><path d="M5.5 16.5a6 6 0 0 1 12 0"/><path d="M19.5 12h1.5a1.5 1.5 0 0 0 0-3h-1.5v3Z"/><path d="M7 16.5V19M15.5 16.5V19"/></svg>`,
  };

  const STR = {
    he: {
      start: "מתחילים!",
      again: "משחק נוסף",
      backToTopic: "חזרה לנושא",
      backToLesson: "חזרה לשיעור",
      copyLink: "העתקת קישור למשחק",
      newBest: "שיא חדש!",
      bestLine: (v) => `השיא שלך: ${v}`,
      points: (n) => (n === 1 ? "נקודה אחת" : `${n} נקודות`),
      movesCount: (n) => (n === 1 ? "תור אחד" : `${n} תורות`),
      pointsLabel: "נקודות",
      movesLabel: "תורות",
      hudMoves: "תורות",
      hudPairs: "זוגות",
      hudTime: "זמן",
      hudScore: "נקודות",
      hudWord: "מילה",
      hudLives: (n) => `נשארו ${n} לבבות`,
      perfect: "מושלם! אתם אלופים!",
      great: "כל הכבוד!",
      good: "יפה מאוד! עוד קצת ותשברו את השיא.",
      keepGoing: "תרגול עושה מושלם — נסו שוב!",
      reviewTitle: "מילים לחזור עליהן (לחצו כדי לשמוע)",
      speakWord: (w) => `השמע: ${w}`,

      memoryHow: "כל הקלפים הפוכים. הופכים שני קלפים: אם המילה מתאימה לתמונה — הם נשארים פתוחים. מצאו את כל הזוגות בכמה שפחות תורות!",
      memoryCard: (n) => `קלף ${n}`,
      memoryResult: (time) => `סיימתם בזמן ${time}`,

      speedHow: "מופיעה תמונה — בוחרים מהר את המילה הנכונה. יש לכם 60 שניות. כל טעות מורידה 3 שניות, וכל 5 תשובות נכונות ברצף מוסיפות 5 שניות!",
      plusTime: (n) => `רצף! +${n} שניות`,
      minusTime: (n) => `−${n} שניות`,
      timeUp: "נגמר הזמן!",
      speedResult: (right, wrong) =>
        `${right === 1 ? "תשובה נכונה אחת" : `${right} תשובות נכונות`} · ${wrong === 0 ? "בלי טעויות" : wrong === 1 ? "טעות אחת" : `${wrong} טעויות`}`,

      balloonsHow: "למעלה כתובה מילה באנגלית, ואפשר גם לשמוע אותה. פוצצו את הבלון עם התמונה שלה לפני שהוא עף! טעות או בלון שברח מורידים לב — ויש לכם 3. הבלונים עפים מהר יותר ככל שמצליחים.",
      popThis: "פוצצו את:",
      sayTarget: "השמעת המילה",
      escaped: (w) => `הבלון ברח! זה היה ${w}`,
      wrongPop: (en, he) => `זה ${en} — ${he}`,
      outOfLives: "נגמרו הלבבות!",
      balloonsResult: (n) => (n === 1 ? "פוצצתם בלון אחד" : `פוצצתם ${n} בלונים`),

      scrambleHow: "סדרו את האותיות וכתבו באנגלית את המילה שבתמונה. לוחצים על האותיות לפי הסדר, ולחיצה על אות שכבר הונחה מחזירה אותה. נתקעתם? כפתור הרמז מגלה אות — אבל מוריד נקודות.",
      hint: "רמז",
      tryAgain: "כמעט! נסו שוב",
      slotLabel: (n) => `אות ${n}`,
      scrambleResult: (clean, total) => `${clean} מתוך ${total} מילים בלי עזרה`,

      huntHow: "בתמונה יש המון דברים, ורק חלק מהם שייכים לנושא.\nלחצו על מה ששייך לנושא: תשמעו איך אומרים אותו ותראו איך כותבים אותו.\nכל מה שתמצאו נאסף לסרגל למטה. אספו את כולם!",
      huntFind: "מצאו בתמונה:",
      huntFindTray: "מצאו בתמונה את מה שבסרגל למטה",
      huntMiss: "זה לא מה שמחפשים. נסו משהו אחר",
      huntThing: (n) => `חפץ ${n}`,
      huntSlot: (n) => `מקום ${n} בסרגל, עדיין ריק`,
      hudFound: "נמצאו",
      huntResult: (time, misses) => `סיימתם בזמן ${time} · ${misses === 0 ? "בלי טעויות" : misses === 1 ? "טעות אחת" : `${misses} טעויות`}`,

      adventureHow: "השועל יוצא לטיול, ויש לו 8 צעדים עד הבית.\nבכל צעד יש משפט קצר באנגלית.\nבוחרים את התמונה או את המילה הנכונה — והשועל מתקדם!",
      advPickPic: "בחרו את התמונה של המילה המסומנת",
      advPickWord: "איזו מילה חסרה במשפט?",
      advTryAgain: "לא נורא, נסו שוב",
      advHomeHe: "השועל הגיע הביתה!",
      hudStep: "צעד",
      adventureResult: (first, total) => `${first} מתוך ${total} בניסיון הראשון`,

      bingoHow: "המורה קורא מילים באנגלית, ולכל תלמיד יש כרטיס עם 9 תמונות.\nשומעים מילה שיש בכרטיס? מסמנים אותה.\nשלוש בשורה, בטור או באלכסון — בינגו!",
      bingoModeBoard: "לוח המורה",
      bingoModeCard: "כרטיס בטלפון",
      bingoModePrint: "הדפסת כרטיסים",
      bingoNext: "המילה הבאה",
      bingoFirst: "לחצו על ״המילה הבאה״ כדי להתחיל",
      bingoShowPic: "הצגת התמונה",
      bingoCheck: "בדיקת כרטיס",
      bingoNewRound: "סבב חדש",
      bingoAllCalled: "כל המילים נקראו",
      bingoCalledList: "המילים שנקראו",
      hudCalled: "נקראו",
      bingoCheckPrompt: "מספר הכרטיס:",
      bingoCheckGo: "בדיקה",
      bingoCheckBack: "חזרה ללוח",
      bingoCheckWin: "בינגו! יש שורה מלאה",
      bingoCheckNo: "עוד אין שורה מלאה",
      bingoCheckBad: "כתבו מספר מ־1 עד 999",
      bingoCardTip: "שומעים מילה שיש בכרטיס? לוחצים על התמונה שלה.",
      hudCard: "כרטיס",
      bingoWin: (n) => `בינגו! הראו למורה את כרטיס ${n}`,
      bingoNewCard: "כרטיס חדש",
      bingoNewCardSure: "בטוחים? לחצו שוב",

      sentenceHow: "יש תמונה, ומתחתיה המשפט בעברית.\nלוחצים על המילים באנגלית לפי הסדר — ובונים את המשפט.\nמילה שלא באה עכשיו לא נכנסת. נסו מילה אחרת!",
      senNotYet: "לא זאת. איזו מילה באה עכשיו?",
      hudSentence: "משפט",
      sentenceResult: (clean, total) => `${clean} מתוך ${total} משפטים בלי טעויות`,

      dictationHow: "שומעים מילה באנגלית — בלי לראות תמונה!\nכותבים אותה באותיות שלמטה. יש שם גם כמה אותיות מיותרות.\nאפשר לשמוע שוב, גם לאט. כשמצליחים — רואים את התמונה.",
      dicListen: "השמעה",
      dicSlow: "לאט",
      dicAsk: "מה שמעתם?",

      snakeHow: "למעלה כתובה מילה באנגלית, ואפשר גם לשמוע אותה.\nמובילים את הנחש אל התמונה שלה — והוא גדל!\nתמונה לא נכונה או נגיעה בזנב מורידות לב, ויש לכם 3.\nמזיזים בחצים, בכפתורים או בהחלקה על המסך.",
      snakeEat: "הנחש צריך לאכול:",
      snakeReady: "מוכנים...",
      snakeTail: "אוי! הנחש נגע בזנב",
      snakeKeys: { up: "למעלה", down: "למטה", left: "שמאלה", right: "ימינה" },
      snakeResult: (n) => (n === 1 ? "הנחש אכל תמונה אחת" : `הנחש אכל ${n} תמונות`),
    },
    en: {
      start: "Start!",
      again: "Play again",
      backToTopic: "Back to topic",
      backToLesson: "Back to the lesson",
      copyLink: "Copy a link to this game",
      newBest: "New record!",
      bestLine: (v) => `Your record: ${v}`,
      points: (n) => (n === 1 ? "1 point" : `${n} points`),
      movesCount: (n) => (n === 1 ? "1 move" : `${n} moves`),
      pointsLabel: "Points",
      movesLabel: "Moves",
      hudMoves: "Moves",
      hudPairs: "Pairs",
      hudTime: "Time",
      hudScore: "Points",
      hudWord: "Word",
      hudLives: (n) => `${n} hearts left`,
      perfect: "Perfect! You're a champion!",
      great: "Well done!",
      good: "Very nice! A little more and you'll break your record.",
      keepGoing: "Practice makes perfect — try again!",
      reviewTitle: "Words to go over (click to hear them)",
      speakWord: (w) => `Play: ${w}`,

      memoryHow: "All the cards are face down. Flip two cards: if the word matches the picture, they stay open. Find all the pairs in as few moves as you can!",
      memoryCard: (n) => `Card ${n}`,
      memoryResult: (time) => `Finished in ${time}`,

      speedHow: "A picture appears — quickly choose the right word. You have 60 seconds. Every mistake takes away 3 seconds, and every 5 right answers in a row add 5 seconds!",
      plusTime: (n) => `Streak! +${n} seconds`,
      minusTime: (n) => `−${n} seconds`,
      timeUp: "Time's up!",
      speedResult: (right, wrong) => `${right} right · ${wrong === 0 ? "no mistakes" : wrong === 1 ? "1 mistake" : `${wrong} mistakes`}`,

      balloonsHow: "An English word is written at the top, and you can hear it too. Pop the balloon with its picture before it flies away! A mistake or a balloon that gets away costs a heart — and you have 3. The balloons fly faster as you succeed.",
      popThis: "Pop the:",
      sayTarget: "Play the word",
      escaped: (w) => `It got away! That was ${w}`,
      wrongPop: (en) => `That's ${en}`,
      outOfLives: "No hearts left!",
      balloonsResult: (n) => (n === 1 ? "You popped 1 balloon" : `You popped ${n} balloons`),

      scrambleHow: "Put the letters in order to spell the English word for the picture. Click the letters in order; clicking a letter you already placed sends it back. Stuck? The hint button shows a letter — but costs points.",
      hint: "Hint",
      tryAgain: "Almost! Try again",
      slotLabel: (n) => `Letter ${n}`,
      scrambleResult: (clean, total) => `${clean} of ${total} words without help`,

      huntHow: "The picture is full of things, and only some of them belong to the topic.\nClick what belongs: you'll hear how to say it and see how to write it.\nEverything you find goes to the bar at the bottom. Collect them all!",
      huntFind: "Find in the picture:",
      huntFindTray: "Find the things from the bar below",
      huntMiss: "That's not what we're looking for. Try something else",
      huntThing: (n) => `Thing ${n}`,
      huntSlot: (n) => `Place ${n} in the bar, still empty`,
      hudFound: "Found",
      huntResult: (time, misses) => `Finished in ${time} · ${misses === 0 ? "no mistakes" : misses === 1 ? "1 mistake" : `${misses} mistakes`}`,

      adventureHow: "The fox is going for a walk, and home is 8 steps away.\nEvery step has a short English sentence.\nChoose the right picture or word — and the fox moves on!",
      advPickPic: "Choose the picture of the marked word",
      advPickWord: "Which word is missing?",
      advTryAgain: "Never mind, try again",
      advHomeHe: "",
      hudStep: "Step",
      adventureResult: (first, total) => `${first} of ${total} on the first try`,

      bingoHow: "The teacher calls out English words, and every student has a card with 9 pictures.\nHear a word that's on your card? Mark it.\nThree in a row, a column or a diagonal — bingo!",
      bingoModeBoard: "Teacher's board",
      bingoModeCard: "Card on a phone",
      bingoModePrint: "Print cards",
      bingoNext: "Next word",
      bingoFirst: "Click “Next word” to start",
      bingoShowPic: "Show the picture",
      bingoCheck: "Check a card",
      bingoNewRound: "New round",
      bingoAllCalled: "All the words were called",
      bingoCalledList: "Words called so far",
      hudCalled: "Called",
      bingoCheckPrompt: "Card number:",
      bingoCheckGo: "Check",
      bingoCheckBack: "Back to the board",
      bingoCheckWin: "Bingo! A full line",
      bingoCheckNo: "No full line yet",
      bingoCheckBad: "Write a number from 1 to 999",
      bingoCardTip: "Hear a word that's on your card? Tap its picture.",
      hudCard: "Card",
      bingoWin: (n) => `Bingo! Show the teacher card ${n}`,
      bingoNewCard: "New card",
      bingoNewCardSure: "Sure? Tap again",

      sentenceHow: "There's a picture, and the sentence in Hebrew under it.\nTap the English words in order — and build the sentence.\nA word that doesn't come next won't go in. Try another one!",
      senNotYet: "Not that one. Which word comes next?",
      hudSentence: "Sentence",
      sentenceResult: (clean, total) => `${clean} of ${total} sentences without mistakes`,

      dictationHow: "You hear an English word — without seeing a picture!\nSpell it with the letters below. Some of them are extra.\nYou can listen again, slowly too. Get it right — and see the picture.",
      dicListen: "Listen",
      dicSlow: "Slowly",
      dicAsk: "What did you hear?",

      snakeHow: "An English word is written at the top, and you can hear it too.\nSteer the snake to its picture — and it grows!\nA wrong picture or touching the tail costs a heart, and you have 3.\nSteer with the arrow keys, the buttons or a swipe.",
      snakeEat: "The snake wants:",
      snakeReady: "Ready...",
      snakeTail: "Oops! The snake hit its tail",
      snakeKeys: { up: "Up", down: "Down", left: "Left", right: "Right" },
      snakeResult: (n) => (n === 1 ? "The snake ate 1 picture" : `The snake ate ${n} pictures`),
    },
  };

  function lang() {
    return window.I18n?.lang === "en" ? "en" : "he";
  }

  function T(key, ...args) {
    const val = STR[lang()][key] ?? STR.he[key];
    return typeof val === "function" ? val(...args) : val;
  }

  function loc(obj, field) {
    return (lang() === "en" && obj[`${field}En`]) || obj[field] || "";
  }

  function esc(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function shuffle(list) {
    const a = [...list];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pickOne(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function clockText(sec) {
    return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
  }

  /* ── Records (this device only) ── */

  function readBest() {
    try {
      return JSON.parse(localStorage.getItem(BEST_KEY)) || {};
    } catch {
      return {};
    }
  }

  // Returns true when `value` is a new record.
  function saveBest(key, value, lowerIsBetter) {
    const all = readBest();
    const prev = all[key];
    if (prev != null && (lowerIsBetter ? prev <= value : prev >= value)) return false;
    all[key] = value;
    try {
      localStorage.setItem(BEST_KEY, JSON.stringify(all));
    } catch {
      /* ignore */
    }
    return true;
  }

  /* ── Header pills (score, time, moves…) ── */

  function pillHtml(id, icon, label, value) {
    return `<span class="eng-hud-pill" id="${id}" title="${esc(label)}">${icon}<span class="eng-hud-label">${esc(label)}</span><b class="eng-hud-value">${esc(value)}</b></span>`;
  }

  function setPill(id, value) {
    const el = $(`#${id} .eng-hud-value`);
    if (el) el.textContent = value;
  }

  function bumpPill(id, cls = "is-bumped") {
    const el = $(`#${id}`);
    if (!el) return;
    el.classList.remove("is-bumped", "is-hit");
    void el.offsetWidth;
    el.classList.add(cls);
  }

  function flash(html, kind = "") {
    const box = $("#engGameFlash");
    if (!box) return;
    const icon = kind === "right" ? ICONS.check : kind === "wrong" ? ICONS.cross : "";
    box.innerHTML = `<span class="eng-game-flash-msg${kind ? ` is-${kind}` : ""}">${icon}<span>${html}</span></span>`;
  }

  /* ── One game session: timers, frames and listeners that `stop()` (leaving
     the screen) or the next phase clear in one go. ── */

  function createRun(game, ctx) {
    const timers = new Set();
    let raf = 0;
    let offs = [];
    const run = {
      game,
      ctx,
      words: ctx.words,
      key: `${ctx.topic.id}/${game.id}`,
      phase: "intro",
      stopped: false,
      result: null,
      startedAt: 0,
      later(fn, ms) {
        const id = setTimeout(() => {
          timers.delete(id);
          if (!run.stopped) fn();
        }, ms);
        timers.add(id);
        return id;
      },
      cancel(id) {
        clearTimeout(id);
        timers.delete(id);
      },
      frame(fn) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame((ts) => {
          if (!run.stopped) fn(ts);
        });
      },
      on(target, type, fn, opts) {
        target.addEventListener(type, fn, opts);
        offs.push(() => target.removeEventListener(type, fn, opts));
      },
      observe(el, fn) {
        if (!window.ResizeObserver) {
          run.on(window, "resize", fn);
          return;
        }
        const ro = new ResizeObserver(() => fn());
        ro.observe(el);
        offs.push(() => ro.disconnect());
      },
      clear() {
        timers.forEach((id) => clearTimeout(id));
        timers.clear();
        cancelAnimationFrame(raf);
        offs.forEach((off) => off());
        offs = [];
      },
      stop() {
        run.stopped = true;
        run.clear();
      },
      shell(inner, hud = "") {
        return ctx.shell(inner, hud);
      },
      sfx(name) {
        ctx.sfx?.(name);
      },
      speak(text, rate) {
        ctx.speak?.(text, rate);
      },
    };
    return run;
  }

  function speakBtnHtml(run, text, id = "", extraClass = "") {
    if (!run.ctx.canSpeak?.()) return "";
    return `<button type="button" class="eng-speak ${extraClass}"${id ? ` id="${id}"` : ""} data-say="${esc(text)}" aria-label="${esc(T("speakWord", text))}">${run.ctx.icons.listen}</button>`;
  }

  /* ── How-to screen ── */

  function showIntro(run) {
    run.clear();
    run.phase = "intro";
    const { game } = run;
    const best = bestText(run.ctx.topic.id, game.id);
    const modeHtml = (mode) => {
      const inner = `${mode.icon}<span>${esc(T(mode.label))}</span>`;
      const cls = `eng-game-mode${mode.primary ? " is-primary" : ""}`;
      return mode.href
        ? `<a class="${cls}" href="${esc(mode.href(run))}">${inner}</a>`
        : `<button type="button" class="${cls}" data-mode="${esc(mode.id)}">${inner}</button>`;
    };
    run.shell(`
      <div class="eng-game-intro">
        <span class="eng-game-badge eng-game-badge--${game.id}">${game.icon}</span>
        <p class="eng-game-howto">${esc(T(`${game.id}How`))}</p>
        ${best ? `<p class="eng-game-best">${ICONS.trophy}<span>${esc(best)}</span></p>` : ""}
        ${
          game.modes
            ? `<div class="eng-game-modes">${game.modes.map(modeHtml).join("")}</div>`
            : `<button type="button" class="btn btn-primary btn-candy font-cartoon eng-game-start" id="engGameStart">${esc(T("start"))}</button>`
        }
      </div>`);
    // Pictures and sounds load while the student reads the how-to.
    (game.pictures?.(run) || run.words.map((w) => w.img)).forEach((src) => {
      const img = new Image();
      img.src = src;
    });
    window.PleyiSpeech?.preload(run.words.map((w) => w.en));
    $$("[data-mode]").forEach((btn) => btn.addEventListener("click", () => begin(run, btn.dataset.mode)));
    const btn = $("#engGameStart");
    btn?.addEventListener("click", () => begin(run));
    (btn || $(".eng-game-mode"))?.focus({ preventScroll: true });
  }

  function begin(run, mode = run.mode) {
    run.clear();
    run.phase = "play";
    run.mode = mode;
    run.result = null;
    run.startedAt = Date.now();
    run.game.play(run);
  }

  /* ── Results screen ──
     r: { value, label, detail, stars, correct, review: [words], recordScore }
     correct: right answers, for the class leaderboard's points. */

  function finish(run, r) {
    run.clear();
    run.phase = "results";
    const { game, ctx } = run;
    r.isBest = saveBest(run.key, r.value, !!game.lowerIsBetter);
    run.result = r;
    ctx.record?.({
      kind: "game",
      gameId: run.key,
      gameTitle: `${game.title} · ${ctx.topic.title}`,
      score: r.recordScore ?? r.value,
      // Points on the class leaderboard: per right answer and per star.
      correct: r.correct,
      stars: r.stars,
      durationSec: Math.round((Date.now() - run.startedAt) / 1000),
    });
    run.sfx("finish");
    renderResults(run);
  }

  function renderResults(run) {
    const r = run.result;
    const { game, ctx } = run;
    const message = r.stars === 3 ? T("perfect") : r.stars === 2 ? T("great") : r.stars === 1 ? T("good") : T("keepGoing");
    const best = bestText(ctx.topic.id, game.id);
    const review = (r.review || []).slice(0, 8);
    const reviewHtml = review.length
      ? `<div class="eng-game-review">
          <h3>${esc(T("reviewTitle"))}</h3>
          <ul>${review
            .map(
              (w) => `
            <li><button type="button" class="eng-game-chip" data-say="${esc(w.en)}">
              <img src="${esc(w.img)}" alt="" draggable="false" />
              <span class="eng-game-chip-en" dir="ltr">${esc(w.en)}</span>
              <span class="eng-game-chip-he">${esc(w.he)}</span>
            </button></li>`
            )
            .join("")}</ul>
        </div>`
      : "";
    run.shell(`
      <div class="eng-results eng-game-results">
        <div class="eng-stars" aria-hidden="true">
          ${[1, 2, 3].map((n) => `<span class="eng-star${n <= r.stars ? " is-on" : ""}">${ctx.icons.star}</span>`).join("")}
        </div>
        <div class="eng-grade">
          <span class="eng-grade-label">${esc(T(r.label))}</span>
          <p class="eng-score font-cartoon">${esc(r.value)}</p>
        </div>
        ${
          r.isBest
            ? `<p class="eng-game-best is-new">${ICONS.trophy}<span>${esc(T("newBest"))}</span></p>`
            : best
              ? `<p class="eng-game-best">${ICONS.trophy}<span>${esc(best)}</span></p>`
              : ""
        }
        <p class="eng-results-count">${esc(r.detail)}</p>
        <p class="eng-results-msg">${esc(message)}</p>
        <div class="eng-results-actions">
          <button type="button" class="btn btn-primary btn-candy font-cartoon" id="engGameAgain">${esc(T("again"))}</button>
          ${
            ctx.backToLesson
              ? `<button type="button" class="btn btn-candy font-cartoon eng-btn-secondary" id="engGameToLesson">${esc(T("backToLesson"))}</button>`
              : `<a class="btn btn-candy font-cartoon eng-btn-secondary" href="#${esc(ctx.topic.id)}">${esc(T("backToTopic"))}</a>`
          }
          ${ctx.homeworkHtml?.() || ""}
        </div>
        ${reviewHtml}
        <button type="button" class="eng-copy-link" id="engGameCopy">${ctx.icons.link}<span>${esc(T("copyLink"))}</span></button>
      </div>`);
    $("#engGameAgain").addEventListener("click", () => begin(run));
    $("#engGameToLesson")?.addEventListener("click", () => ctx.backToLesson());
    $("#engGameCopy").addEventListener("click", () => ctx.copyLink?.());
    $$(".eng-game-chip").forEach((chip) => chip.addEventListener("click", () => run.speak(chip.dataset.say)));
  }

  /* ── Lays a grid of `count` square cells out to fill `stage`: tries every
     column count and keeps the one with the biggest cells. ── */

  function fitGrid(run, stage, board, count, maxCell) {
    const apply = () => {
      const W = stage.clientWidth;
      const H = stage.clientHeight;
      if (!W || !H) return;
      const gap = Math.min(W, H) < 420 ? 8 : 12;
      let best = { rank: 0, cell: 0, cols: count };
      for (let cols = 1; cols <= count; cols++) {
        const rows = Math.ceil(count / cols);
        const cell = Math.min((W - gap * (cols - 1)) / cols, (H - gap * (rows - 1)) / rows);
        // An uneven last row looks messy — prefer layouts without one.
        const rank = cell * (count % cols === 0 ? 1 : 0.94);
        if (rank > best.rank) best = { rank, cell, cols };
      }
      board.style.setProperty("--cols", best.cols);
      board.style.setProperty("--cell", `${Math.floor(Math.min(best.cell, maxCell))}px`);
      board.style.setProperty("--gap", `${gap}px`);
    };
    apply();
    run.observe(stage, apply);
  }

  /* ════════ Game 1: Memory — find each word and its picture ════════ */

  function playMemory(run) {
    const chosen = shuffle(run.words).slice(0, Math.min(6, run.words.length));
    const cards = shuffle(chosen.flatMap((w) => [{ w, kind: "img" }, { w, kind: "word" }]));
    const st = { open: [], found: 0, moves: 0, closeTimer: 0, pairs: chosen.length };

    const cardHtml = (c, i) => {
      const longest = Math.max(...c.w.en.split(/\s+/).map((part) => part.length));
      const front =
        c.kind === "img"
          ? `<img src="${esc(c.w.img)}" alt="" draggable="false" />`
          : `<span class="eng-mem-word" lang="en" dir="ltr" style="--len:${Math.max(4, longest)}">${esc(c.w.en)}</span>`;
      return `
        <button type="button" class="eng-mem-card" data-i="${i}" aria-label="${esc(T("memoryCard", i + 1))}">
          <span class="eng-mem-inner">
            <span class="eng-mem-face eng-mem-back">${ICONS.question}</span>
            <span class="eng-mem-face eng-mem-front">${front}</span>
          </span>
        </button>`;
    };

    run.shell(
      `
      <div class="eng-game-stage" id="engGameStage">
        <div class="eng-mem-board" id="engMemBoard" dir="ltr">${cards.map(cardHtml).join("")}</div>
      </div>
      <div class="eng-game-flash" id="engGameFlash" aria-live="polite"></div>`,
      pillHtml("engHudMoves", ICONS.moves, T("hudMoves"), 0) + pillHtml("engHudPairs", ICONS.memory, T("hudPairs"), `0/${st.pairs}`)
    );

    const cardEl = (i) => $(`.eng-mem-card[data-i="${i}"]`);
    fitGrid(run, $("#engGameStage"), $("#engMemBoard"), cards.length, 170);

    function closeOpen() {
      run.cancel(st.closeTimer);
      st.open.forEach((i) => {
        cards[i].open = false;
        const el = cardEl(i);
        el.classList.remove("is-open", "is-miss");
        el.setAttribute("aria-label", T("memoryCard", i + 1));
      });
      st.open = [];
    }

    function flip(i) {
      const card = cards[i];
      // A wrong pair still showing closes right away when the next card is
      // picked — which may be one of those two.
      if (st.open.length === 2) closeOpen();
      if (card.done || card.open) return;
      card.open = true;
      const el = cardEl(i);
      el.classList.add("is-open");
      el.setAttribute("aria-label", card.kind === "img" ? card.w.he : card.w.en);
      run.sfx("flip");
      st.open.push(i);
      if (st.open.length < 2) return;

      st.moves++;
      setPill("engHudMoves", st.moves);
      const [a, b] = st.open.map((j) => cards[j]);
      if (a.w.word === b.w.word) {
        st.open.forEach((j) => {
          cards[j].done = true;
          cardEl(j).classList.add("is-matched");
          cardEl(j).disabled = true;
        });
        st.open = [];
        st.found++;
        setPill("engHudPairs", `${st.found}/${st.pairs}`);
        bumpPill("engHudPairs");
        run.sfx("right");
        run.speak(a.w.en);
        flash(`<bdi dir="ltr">${esc(a.w.en)}</bdi> — ${esc(a.w.he)}`, "right");
        if (st.found === st.pairs) run.later(done, 1100);
      } else {
        st.open.forEach((j) => cardEl(j).classList.add("is-miss"));
        st.closeTimer = run.later(closeOpen, 1200);
      }
    }

    function done() {
      const sec = Math.round((Date.now() - run.startedAt) / 1000);
      const { moves, pairs } = st;
      finish(run, {
        value: moves,
        label: "movesLabel",
        detail: T("memoryResult", clockText(sec)),
        stars: moves <= pairs * 1.5 ? 3 : moves <= pairs * 2.25 ? 2 : 1,
        correct: pairs,
        recordScore: T("movesCount", moves),
      });
    }

    $$(".eng-mem-card").forEach((btn) => btn.addEventListener("click", () => flip(Number(btn.dataset.i))));
  }

  /* ════════ Game 2: Beat the clock — name as many pictures as you can ════════ */

  function playSpeed(run) {
    const DURATION = 60000;
    const st = { score: 0, wrong: 0, streak: 0, endAt: performance.now() + DURATION, q: null, locked: false, over: false, missed: new Map(), hiddenLeft: null };

    run.shell(
      `
      <div class="eng-time-bar" aria-hidden="true"><span class="eng-time-fill" id="engTimeFill"></span></div>
      <div class="eng-game-stage eng-speed-stage" id="engGameStage">
        <img class="eng-speed-img" id="engSpeedImg" alt="" draggable="false" />
      </div>
      <div class="eng-speed-options" id="engSpeedOptions" dir="ltr"></div>
      <div class="eng-game-flash" id="engGameFlash" aria-live="polite"></div>`,
      pillHtml("engHudTime", ICONS.speed, T("hudTime"), 60) + pillHtml("engHudScore", run.ctx.icons.star, T("hudScore"), 0)
    );

    const img = $("#engSpeedImg");
    const optionsBox = $("#engSpeedOptions");
    const fill = $("#engTimeFill");

    function next() {
      if (st.over) return;
      const q = pickOne(run.words.filter((w) => w.word !== st.q?.word));
      st.q = q;
      st.locked = false;
      const options = shuffle([q, ...shuffle(run.words.filter((w) => w.word !== q.word)).slice(0, 3)]);
      img.src = q.img;
      img.classList.remove("is-in");
      void img.offsetWidth;
      img.classList.add("is-in");
      optionsBox.innerHTML = options
        .map(
          (o, i) =>
            `<button type="button" class="eng-option eng-speed-option" data-word="${esc(o.word)}"><span class="eng-option-key">${i + 1}</span>${esc(o.en)}</button>`
        )
        .join("");
      $$(".eng-speed-option", optionsBox).forEach((btn) => btn.addEventListener("click", () => answer(btn)));
    }

    function answer(btn) {
      if (st.locked || st.over) return;
      st.locked = true;
      const q = st.q;
      $$(".eng-speed-option", optionsBox).forEach((b) => {
        b.disabled = true;
        if (b.dataset.word === q.word) b.classList.add("is-right");
      });
      if (btn.dataset.word === q.word) {
        st.score++;
        st.streak++;
        setPill("engHudScore", st.score);
        bumpPill("engHudScore");
        run.sfx("right");
        if (st.streak % 5 === 0) {
          st.endAt += 5000;
          bumpPill("engHudTime");
          flash(esc(T("plusTime", 5)), "right");
        } else {
          flash(`<bdi dir="ltr">${esc(q.en)}</bdi> — ${esc(q.he)}`, "right");
        }
        run.later(next, 420);
      } else {
        st.wrong++;
        st.streak = 0;
        st.endAt -= 3000;
        st.missed.set(q.word, q);
        btn.classList.add("is-wrong");
        bumpPill("engHudTime", "is-hit");
        run.sfx("wrong");
        flash(`${esc(T("minusTime", 3))} · <bdi dir="ltr">${esc(q.en)}</bdi> — ${esc(q.he)}`, "wrong");
        run.later(next, 1150);
      }
    }

    let shownSec = 60;
    function loop() {
      if (st.over) return;
      const left = Math.max(0, st.endAt - performance.now());
      fill.style.transform = `scaleX(${Math.min(1, left / DURATION)})`;
      const sec = Math.ceil(left / 1000);
      if (sec !== shownSec) {
        shownSec = sec;
        setPill("engHudTime", sec);
        $("#engHudTime")?.classList.toggle("is-low", sec <= 10);
        fill.classList.toggle("is-low", sec <= 10);
      }
      if (left <= 0) {
        end();
        return;
      }
      run.frame(loop);
    }

    function end() {
      st.over = true;
      $$(".eng-speed-option", optionsBox).forEach((b) => (b.disabled = true));
      flash(esc(T("timeUp")));
      run.later(() => {
        const { score, wrong } = st;
        finish(run, {
          value: score,
          label: "pointsLabel",
          detail: T("speedResult", score, wrong),
          stars: score >= 20 ? 3 : score >= 12 ? 2 : score >= 5 ? 1 : 0,
          correct: score,
          review: [...st.missed.values()],
        });
      }, 1000);
    }

    // The clock stops while the tab is hidden.
    run.on(document, "visibilitychange", () => {
      if (st.over) return;
      if (document.hidden) {
        st.hiddenLeft = st.endAt - performance.now();
      } else if (st.hiddenLeft != null) {
        st.endAt = performance.now() + st.hiddenLeft;
        st.hiddenLeft = null;
        run.frame(loop);
      }
    });
    run.on(document, "keydown", (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey || !/^[1-4]$/.test(e.key)) return;
      const btn = $$(".eng-speed-option", optionsBox)[Number(e.key) - 1];
      if (btn && !btn.disabled) {
        e.preventDefault();
        btn.click();
      }
    });

    next();
    run.frame(loop);
  }

  /* ════════ Game 3: Balloon pop — pop the balloon with the word's picture ════════ */

  function playBalloons(run) {
    const LIVES = 3;
    const st = { score: 0, lives: LIVES, balloons: [], target: null, lastTs: 0, spawnIn: 0, over: false, missed: new Map(), color: 0 };

    const heartsHtml = () =>
      `<span class="eng-hud-pill eng-hud-hearts" id="engHudLives" role="img" aria-label="${esc(T("hudLives", st.lives))}">${Array.from(
        { length: LIVES },
        (_, i) => `<span class="eng-heart${i < st.lives ? " is-on" : ""}">${ICONS.heart}</span>`
      ).join("")}</span>`;

    run.shell(
      `
      <div class="eng-balloon-target">
        <span class="eng-balloon-target-label">${esc(T("popThis"))}</span>
        <span class="eng-balloon-word" id="engBalloonWord" dir="ltr"></span>
        ${run.ctx.canSpeak?.() ? `<button type="button" class="eng-speak" id="engBalloonSay" aria-label="${esc(T("sayTarget"))}">${run.ctx.icons.listen}</button>` : ""}
      </div>
      <div class="eng-game-stage eng-balloon-sky" id="engGameStage">
        <span class="eng-cloud eng-cloud--1" aria-hidden="true"></span>
        <span class="eng-cloud eng-cloud--2" aria-hidden="true"></span>
        <div class="eng-game-flash eng-balloon-flash" id="engGameFlash" aria-live="polite"></div>
      </div>`,
      heartsHtml() + pillHtml("engHudScore", run.ctx.icons.star, T("hudScore"), 0)
    );

    const sky = $("#engGameStage");
    const wordEl = $("#engBalloonWord");

    const balloonSize = () => Math.round(Math.max(66, Math.min(126, sky.clientWidth / 3.7, sky.clientHeight / 3.3)));
    // Seconds a balloon takes to cross the sky — shorter as the score grows.
    const travelSec = () => Math.max(3.6, 8 - st.score * 0.2);
    // Balloons still in play (a wrongly clicked one keeps floating, disabled).
    const live = () => st.balloons.filter((b) => !b.gone && !b.hit);
    const targetInSky = () => live().some((b) => b.word.word === st.target.word);

    function newTarget() {
      st.target = pickOne(run.words.filter((w) => w.word !== st.target?.word));
      wordEl.textContent = st.target.en;
      wordEl.classList.remove("is-in");
      void wordEl.offsetWidth;
      wordEl.classList.add("is-in");
      run.later(() => run.speak(st.target.en), 250);
      // Send its balloon up soon when none is in the sky yet.
      if (!targetInSky()) st.spawnIn = Math.min(st.spawnIn, 0.15);
    }

    function spawn() {
      const W = sky.clientWidth;
      const H = sky.clientHeight;
      if (!W || !H) return false;
      const s = balloonSize();
      const h = s * 1.55;
      const lanes = Math.max(2, Math.min(5, Math.floor(W / (s * 1.15))));
      const laneW = W / lanes;
      // A lane is free once its last balloon has floated clear of the bottom.
      const busy = new Set(st.balloons.filter((b) => !b.removed && b.y > H - h * 1.05).map((b) => b.lane));
      const free = [...Array(lanes).keys()].filter((l) => !busy.has(l));
      if (!free.length) return false;
      const lane = pickOne(free);

      let word;
      if (!targetInSky()) {
        word = st.target;
      } else {
        const inSky = new Set(live().map((b) => b.word.word));
        const others = run.words.filter((w) => w.word !== st.target.word);
        const fresh = others.filter((w) => !inSky.has(w.word));
        word = pickOne(fresh.length ? fresh : others);
      }

      const el = document.createElement("button");
      el.type = "button";
      el.className = `eng-balloon eng-balloon--c${st.color++ % 6}`;
      el.style.setProperty("--size", `${s}px`);
      el.setAttribute("aria-label", word.he);
      el.innerHTML = `<span class="eng-balloon-body"><img src="${esc(word.img)}" alt="" draggable="false" /></span><span class="eng-balloon-string"></span>`;
      const x = lane * laneW + (laneW - s) / 2 + (Math.random() - 0.5) * Math.max(0, laneW - s) * 0.6;
      const b = { el, word, lane, x, y: H + 4, s, h, speed: (H + h) / travelSec(), phase: Math.random() * Math.PI * 2, gone: false, removed: false };
      el.style.transform = `translate3d(${x}px, ${b.y}px, 0)`;
      sky.appendChild(el);
      st.balloons.push(b);
      return true;
    }

    function remove(b) {
      b.gone = true;
      b.removed = true;
      b.el.remove();
    }

    function loseLife(messageHtml) {
      st.lives = Math.max(0, st.lives - 1);
      const hearts = $("#engHudLives");
      if (hearts) hearts.outerHTML = heartsHtml();
      bumpPill("engHudLives", "is-hit");
      run.sfx("wrong");
      flash(messageHtml, "wrong");
      if (st.lives === 0) gameOver();
    }

    function hit(el) {
      const b = st.balloons.find((x) => x.el === el);
      if (!b || b.gone || b.hit || st.over) return;
      b.hit = true;
      el.disabled = true;
      if (b.word.word === st.target.word) {
        b.gone = true;
        el.classList.add("is-popped");
        run.later(() => remove(b), 420);
        st.score++;
        setPill("engHudScore", st.score);
        bumpPill("engHudScore");
        run.sfx("pop");
        flash(`<bdi dir="ltr">${esc(b.word.en)}</bdi> — ${esc(b.word.he)}`, "right");
        newTarget();
      } else {
        el.classList.add("is-wrong");
        st.missed.set(st.target.word, st.target);
        loseLife(`<bdi>${esc(T("wrongPop", b.word.en, b.word.he))}</bdi>`);
      }
    }

    function loop(ts) {
      if (st.over) return;
      const dt = st.lastTs ? Math.min(0.05, (ts - st.lastTs) / 1000) : 0;
      st.lastTs = ts;
      st.spawnIn -= dt;
      if (st.spawnIn <= 0) st.spawnIn = spawn() ? Math.max(0.6, travelSec() / 5.5) : 0.2;
      const t = ts / 1000;
      for (const b of st.balloons) {
        if (b.gone) continue;
        b.y -= b.speed * dt;
        const sway = Math.sin(t * 1.6 + b.phase) * b.s * 0.08;
        b.el.style.transform = `translate3d(${b.x + sway}px, ${b.y}px, 0)`;
        if (b.y < -b.h) {
          const wasTarget = !b.hit && b.word.word === st.target.word;
          remove(b);
          if (wasTarget) {
            st.missed.set(b.word.word, b.word);
            loseLife(`${esc(T("escaped", ""))}<bdi dir="ltr">${esc(b.word.en)}</bdi>`);
            if (st.over) return;
            newTarget();
          }
        }
      }
      st.balloons = st.balloons.filter((b) => !b.removed);
      run.frame(loop);
    }

    function gameOver() {
      st.over = true;
      live().forEach((b) => (b.el.disabled = true));
      flash(esc(T("outOfLives")), "wrong");
      run.later(() => {
        const { score } = st;
        finish(run, {
          value: score,
          label: "pointsLabel",
          detail: T("balloonsResult", score),
          stars: score >= 20 ? 3 : score >= 10 ? 2 : score >= 4 ? 1 : 0,
          correct: score,
          review: [...st.missed.values()],
        });
      }, 1400);
    }

    // Balloons move, so they react on press rather than on a full click;
    // keyboard presses (click with detail 0) still count.
    sky.addEventListener("pointerdown", (e) => {
      const el = e.target.closest(".eng-balloon");
      if (!el) return;
      e.preventDefault();
      hit(el);
    });
    sky.addEventListener("click", (e) => {
      const el = e.target.closest(".eng-balloon");
      if (el && e.detail === 0) hit(el);
    });
    $("#engBalloonSay")?.addEventListener("click", () => run.speak(st.target.en));
    // Coming back to the tab doesn't jump the balloons forward.
    run.on(document, "visibilitychange", () => {
      if (!document.hidden) st.lastTs = 0;
    });

    newTarget();
    run.frame(loop);
  }

  /* ════════ Game 4: Letter scramble — spell the picture's word with tiles ════════ */

  const isLetter = (ch) => /[A-Za-z]/.test(ch);
  // Dictation mixes this many letters that aren't in the word into the tiles.
  const DICTATION_EXTRAS = 3;

  function extraLetters(answer, count) {
    const have = new Set(answer.map((ch) => ch.toLowerCase()));
    return shuffle([..."abcdefghijklmnoprstuwy"].filter((ch) => !have.has(ch))).slice(0, count);
  }

  // listen: the dictation game — the word is only heard, its picture and
  // Hebrew show once it is spelled, and the tiles have extra letters.
  function playScramble(run, listen = false) {
    // Without a voice, dictation shows the picture after all.
    listen = listen && !!run.ctx.canSpeak?.();
    const list = shuffle(run.words.filter((w) => [...w.en].filter(isLetter).length >= 2)).slice(0, 8);
    const st = { list, index: 0, score: 0, clean: 0, missed: new Map(), cur: null, max: list.length * 10 };
    const hud = () =>
      pillHtml("engHudWord", run.game.icon, T("hudWord"), `${st.index + 1}/${list.length}`) +
      pillHtml("engHudScore", run.ctx.icons.star, T("hudScore"), st.score);

    function renderWord() {
      const w = list[st.index];
      const chars = [...w.en];
      const answer = chars.filter(isLetter);
      // Shuffle until the tiles don't already spell the word.
      let order = shuffle(answer.map((_, k) => k));
      for (let tries = 0; tries < 12 && order.every((k, i) => answer[k].toLowerCase() === answer[i].toLowerCase()); tries++) {
        order = shuffle(order);
      }
      let tiles = order.map((k) => answer[k]);
      if (run.game.extras) tiles = shuffle([...tiles, ...extraLetters(answer, run.game.extras)]);
      st.cur = {
        w,
        answer,
        tiles: tiles.map((ch) => ({ ch, used: false })),
        slots: answer.map(() => null),
        locked: new Set(),
        hints: 0,
        wrongs: 0,
        done: false,
        checking: false,
      };

      let slot = 0;
      const slotsHtml = w.en
        .split(" ")
        .map(
          (part) =>
            `<span class="eng-scr-word">${[...part]
              .map((ch) =>
                isLetter(ch)
                  ? `<button type="button" class="eng-scr-slot" data-s="${slot}" aria-label="${esc(T("slotLabel", ++slot))}"></button>`
                  : `<span class="eng-scr-fixed">${esc(ch)}</span>`
              )
              .join("")}</span>`
        )
        .join("");
      const longest = Math.max(...w.en.split(" ").map((part) => part.length));

      run.shell(
        `
        <div class="eng-game-stage eng-scr-stage" id="engGameStage">
          ${
            listen
              ? `<div class="eng-dic-ear">
                  <button type="button" class="eng-dic-play" id="engDicPlay" aria-label="${esc(T("dicListen"))}">${run.ctx.icons.listen}</button>
                  <button type="button" class="eng-tool eng-dic-slow" id="engDicSlow">${ICONS.slow}<span>${esc(T("dicSlow"))}</span></button>
                </div>`
              : `<img class="eng-scr-img" src="${esc(w.img)}" alt="" draggable="false" />`
          }
        </div>
        <p class="eng-scr-he${listen ? " is-ask" : ""}" id="engScrHe">${esc(listen ? T("dicAsk") : w.he)}</p>
        <div class="eng-scr-board" dir="ltr" style="--n:${Math.max(6, longest, Math.ceil(answer.length / 2))}">
          <div class="eng-scr-slots" id="engScrSlots">${slotsHtml}</div>
          <div class="eng-scr-tiles" id="engScrTiles">${st.cur.tiles
            .map((tile, k) => `<button type="button" class="eng-scr-tile" data-k="${k}">${esc(tile.ch)}</button>`)
            .join("")}</div>
        </div>
        <div class="eng-scr-actions">
          <button type="button" class="eng-tool eng-scr-hint" id="engScrHint">${ICONS.hint}<span>${esc(T("hint"))}</span></button>
        </div>
        <div class="eng-game-flash" id="engGameFlash" aria-live="polite"></div>`,
        hud()
      );

      $$(".eng-scr-tile").forEach((btn) => btn.addEventListener("click", () => place(Number(btn.dataset.k))));
      $$(".eng-scr-slot").forEach((btn) => btn.addEventListener("click", () => unplace(Number(btn.dataset.s))));
      $("#engScrHint").addEventListener("click", hint);
      if (listen) {
        $("#engDicPlay").addEventListener("click", () => run.speak(w.en));
        $("#engDicSlow").addEventListener("click", () => run.speak(w.en, 0.55));
        run.later(() => run.speak(w.en), 350);
      }
    }

    const slotEl = (s) => $(`.eng-scr-slot[data-s="${s}"]`);
    const tileEl = (k) => $(`.eng-scr-tile[data-k="${k}"]`);

    function setSlot(s, k) {
      const cur = st.cur;
      cur.slots[s] = k;
      const el = slotEl(s);
      el.textContent = k == null ? "" : cur.tiles[k].ch;
      el.classList.toggle("is-filled", k != null);
    }

    function place(k, s = st.cur.slots.indexOf(null)) {
      const cur = st.cur;
      if (cur.done || cur.checking || cur.tiles[k].used || s < 0) return;
      cur.tiles[k].used = true;
      tileEl(k).classList.add("is-used");
      tileEl(k).disabled = true;
      setSlot(s, k);
      run.sfx("tick");
      if (!cur.slots.includes(null)) check();
    }

    function unplace(s) {
      const cur = st.cur;
      const k = cur.slots[s];
      if (cur.done || cur.checking || k == null || cur.locked.has(s)) return;
      cur.tiles[k].used = false;
      tileEl(k).classList.remove("is-used");
      tileEl(k).disabled = false;
      setSlot(s, null);
    }

    function returnLoose() {
      st.cur.slots.forEach((k, s) => {
        if (k != null && !st.cur.locked.has(s)) unplace(s);
      });
    }

    function check() {
      const cur = st.cur;
      const word = cur.slots.map((k) => cur.tiles[k].ch).join("");
      if (word.toLowerCase() === cur.answer.join("").toLowerCase()) {
        solved();
        return;
      }
      cur.wrongs++;
      cur.checking = true;
      $$(".eng-scr-slot:not(.is-hint)").forEach((el) => el.classList.add("is-wrong"));
      run.sfx("wrong");
      flash(esc(T("tryAgain")), "wrong");
      run.later(() => {
        cur.checking = false;
        $$(".eng-scr-slot").forEach((el) => el.classList.remove("is-wrong"));
        returnLoose();
      }, 750);
    }

    function hint() {
      const cur = st.cur;
      if (cur.done || cur.checking) return;
      returnLoose();
      const s = cur.slots.indexOf(null);
      if (s < 0) return;
      const need = cur.answer[s].toLowerCase();
      const k = cur.tiles.findIndex((tile) => !tile.used && tile.ch.toLowerCase() === need);
      if (k < 0) return;
      cur.hints++;
      cur.locked.add(s);
      slotEl(s).classList.add("is-hint");
      slotEl(s).disabled = true;
      place(k, s);
    }

    function solved() {
      const cur = st.cur;
      cur.done = true;
      const points = Math.max(0, 10 - 3 * cur.hints - 2 * cur.wrongs);
      st.score += points;
      if (!cur.hints && !cur.wrongs) st.clean++;
      else st.missed.set(cur.w.word, cur.w);
      setPill("engHudScore", st.score);
      bumpPill("engHudScore");
      $$(".eng-scr-slot").forEach((el) => {
        el.classList.add("is-right");
        el.disabled = true;
      });
      $("#engScrHint").disabled = true;
      if (listen) {
        $("#engGameStage").innerHTML = `<img class="eng-scr-img" src="${esc(cur.w.img)}" alt="" draggable="false" />`;
        const he = $("#engScrHe");
        he.textContent = cur.w.he;
        he.classList.remove("is-ask");
      }
      run.sfx("right");
      run.speak(cur.w.en);
      flash(`<bdi dir="ltr">${esc(cur.w.en)}</bdi> — ${esc(cur.w.he)} · <bdi dir="ltr">+${points}</bdi>`, "right");
      run.later(() => {
        st.index++;
        if (st.index < list.length) {
          renderWord();
          return;
        }
        const ratio = st.max ? st.score / st.max : 0;
        finish(run, {
          value: st.score,
          label: "pointsLabel",
          detail: T("scrambleResult", st.clean, list.length),
          stars: ratio >= 0.9 ? 3 : ratio >= 0.65 ? 2 : ratio >= 0.35 ? 1 : 0,
          review: [...st.missed.values()],
          // A word is worth 10, less for hints and wrong tries.
          correct: Math.round(st.score / 10),
          recordScore: `${st.score}/${st.max}`,
        });
      }, 1500);
    }

    // On a computer the letters can be typed, and Backspace takes one back.
    run.on(document, "keydown", (e) => {
      const cur = st.cur;
      if (!cur || cur.done || cur.checking || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "Backspace") {
        const s = cur.slots.map((k, i) => (k != null && !cur.locked.has(i) ? i : -1)).filter((i) => i >= 0).pop();
        if (s != null) {
          e.preventDefault();
          unplace(s);
        }
        return;
      }
      if (e.key.length !== 1 || !isLetter(e.key)) return;
      const k = cur.tiles.findIndex((tile) => !tile.used && tile.ch.toLowerCase() === e.key.toLowerCase());
      if (k >= 0) {
        e.preventDefault();
        place(k);
      }
    });

    renderWord();
  }

  /* ── Catalog ── */

  /* ════════ Game 5: Find them in the picture — a busy picture (scenes in
     english-hunt-scenes.js), and the topic's things are somewhere in it ════════ */

  const SCENE_W = 1000;
  const SCENE_H = 625;
  // On a phone the picture stays this wide and pans sideways, so that things
  // are still big enough to tap.
  const SCENE_MIN_WIDTH = 600;
  const HUNT_MAX_WORDS = 12;

  function huntSetup(run) {
    const { topics } = window.ENGLISH_HUNT;
    return topics[run.ctx.topic.id] || topics.vocabulary;
  }

  function vocabPicture(name) {
    return `/images/english/vocab/${name}.svg`;
  }

  // Sets everything on the scene's spots: the topic's words first, then the
  // extras for as long as there are free spots.
  function huntItems(setup, words) {
    const scene = window.ENGLISH_HUNT.scenes[setup.scene];
    const open = {};
    Object.entries(scene.spots).forEach(([group, spots]) => {
      open[group] = shuffle(spots);
    });
    const place = { ...scene.place, ...setup.place };
    const items = [];
    const add = (name, img, word) => {
      const spot = open[place[name]]?.pop() || open.any.pop();
      if (spot) items.push({ img, word, x: spot[0], y: spot[1], size: spot[2] * (setup.scale || 1) });
    };
    words.forEach((w) => add(w.word, w.img, w));
    const taken = new Set(words.map((w) => w.word));
    shuffle(setup.extras)
      .filter((name) => !taken.has(name))
      .forEach((name) => add(name, vocabPicture(name)));
    return items;
  }

  function playHunt(run) {
    const setup = huntSetup(run);
    const chosen = run.words.length > HUNT_MAX_WORDS ? shuffle(run.words).slice(0, HUNT_MAX_WORDS) : run.words;
    const items = huntItems(setup, chosen);
    const targets = items.filter((item) => item.word).map((item) => item.word);
    const total = targets.length;
    const topicTitle = loc(run.ctx.topic, "title");
    const st = { found: 0, misses: 0, hints: 0, hinted: new Set(), wordHtml: "", backTimer: 0 };

    const itemHtml = (item, i) => {
      const left = ((item.x - item.size / 2) / SCENE_W) * 100;
      const top = ((item.y - item.size) / SCENE_H) * 100;
      const width = (item.size / SCENE_W) * 100;
      return `<button type="button" class="eng-hunt-item" data-i="${i}" style="left:${left.toFixed(2)}%;top:${top.toFixed(2)}%;width:${width.toFixed(2)}%;z-index:${item.y}" aria-label="${esc(T("huntThing", i + 1))}"><img src="${esc(item.img)}" alt="" draggable="false" /></button>`;
    };
    const slotHtml = (w, i) => `
      <button type="button" class="eng-hunt-slot" data-slot="${i}" disabled aria-label="${esc(T("huntSlot", i + 1))}">
        <img src="${esc(w.img)}" alt="" draggable="false" />
        <span class="eng-hunt-slot-word" lang="en" dir="ltr" style="--len:${Math.max(4, w.en.length)}"></span>
      </button>`;

    st.wordHtml = setup.byTray
      ? `<span class="eng-hunt-find">${esc(T("huntFindTray"))}</span>`
      : `<span class="eng-hunt-find">${esc(T("huntFind"))} <b>${esc(topicTitle)}</b></span>`;

    const card = run.shell(
      `
      <div class="eng-hunt-bar">
        <div class="eng-hunt-word" id="engHuntWord" aria-live="polite">${st.wordHtml}</div>
        <button type="button" class="eng-tool eng-hunt-hint" id="engHuntHint">${ICONS.hint}<span>${esc(T("hint"))}</span></button>
      </div>
      <div class="eng-game-stage eng-hunt-stage" id="engGameStage" dir="ltr">
        <div class="eng-hunt-scene" id="engHuntScene" style="background-image:url('${esc(window.ENGLISH_HUNT.sceneUrl(setup.scene))}')">${items.map(itemHtml).join("")}</div>
      </div>
      <div class="eng-hunt-tray" id="engHuntTray" dir="ltr" style="--slots:${total}">${targets.map(slotHtml).join("")}</div>`,
      pillHtml("engHudFound", ICONS.hunt, T("hudFound"), `0/${total}`) + pillHtml("engHudScore", run.ctx.icons.star, T("hudScore"), 0)
    );

    const stage = $("#engGameStage");
    const scene = $("#engHuntScene");
    const wordBox = $("#engHuntWord");
    const hintBtn = $("#engHuntHint");
    const itemEl = (i) => $(`.eng-hunt-item[data-i="${i}"]`);

    let centered = false;
    const fit = () => {
      const W = stage.clientWidth;
      const H = stage.clientHeight;
      if (!W || !H) return;
      const byHeight = Math.floor(((H - 10) * SCENE_W) / SCENE_H);
      const whole = Math.min(W - 10, byHeight);
      const width = whole >= SCENE_MIN_WIDTH ? whole : Math.max(byHeight, SCENE_MIN_WIDTH);
      scene.style.width = `${width}px`;
      card.style.setProperty("--hunt-ink", `${Math.min(3, Math.max(1.5, width / 420)).toFixed(2)}px`);
      if (!centered) {
        centered = true;
        stage.scrollLeft = (stage.scrollWidth - W) / 2;
      }
    };
    fit();
    run.observe(stage, fit);

    function setScore() {
      setPill("engHudScore", Math.max(0, st.found * 10 - st.misses * 2 - st.hints * 3));
    }

    function wordLine(w) {
      const say = w.say ? `<span class="eng-say-row" dir="rtl" lang="he"><span class="eng-say eng-say-line">${esc(w.say)}</span></span>` : "";
      return `
        <span class="eng-hunt-word-en" lang="en" dir="ltr">${esc(w.en)}</span>
        ${speakBtnHtml(run, w.en)}
        <span class="eng-hunt-word-he">${esc(w.he)}${say}</span>`;
    }

    function showWord(w) {
      run.cancel(st.backTimer);
      st.wordHtml = wordLine(w);
      wordBox.innerHTML = st.wordHtml;
    }

    // Says what was clicked, and floats the word above the thing for a moment.
    function bubble(item, w) {
      const el = document.createElement("span");
      el.className = "eng-hunt-bubble";
      el.lang = "en";
      el.dir = "ltr";
      el.textContent = w.en;
      const top = (item.y - item.size) / SCENE_H;
      el.style.left = `${Math.min(90, Math.max(10, (item.x / SCENE_W) * 100))}%`;
      if (top < 0.14) {
        el.style.top = `${(item.y / SCENE_H) * 100}%`;
        el.classList.add("is-below");
      } else {
        el.style.top = `${top * 100}%`;
      }
      scene.appendChild(el);
      run.later(() => el.remove(), 1300);
    }

    function collect(el, item) {
      const w = item.word;
      const slotIndex = targets.indexOf(w);
      const slot = $(`.eng-hunt-slot[data-slot="${slotIndex}"]`);
      st.found++;
      el.disabled = true;
      el.classList.remove("is-hint");
      el.classList.add("is-found");
      setPill("engHudFound", `${st.found}/${total}`);
      bumpPill("engHudFound");
      setScore();
      run.sfx("right");
      run.speak(w.en);
      showWord(w);
      bubble(item, w);

      const fill = () => {
        slot.classList.add("is-filled");
        slot.disabled = false;
        slot.setAttribute("aria-label", w.en);
        $(".eng-hunt-slot-word", slot).textContent = w.en;
      };
      run.later(() => {
        const from = $("img", el).getBoundingClientRect();
        const to = $("img", slot).getBoundingClientRect();
        el.classList.add("is-gone");
        const fly = $("img", el).cloneNode();
        fly.className = "eng-hunt-fly";
        fly.style.cssText = `left:${from.left}px;top:${from.top}px;width:${from.width}px;height:${from.height}px`;
        card.appendChild(fly);
        fly.animate(
          [
            { transform: "translate(0, 0) scale(1)" },
            { transform: `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${to.width / from.width})` },
          ],
          { duration: 480, easing: "cubic-bezier(0.45, -0.1, 0.35, 1)", fill: "forwards" }
        );
        run.later(() => {
          fly.remove();
          fill();
        }, 480);
      }, 420);
      if (st.found === total) {
        hintBtn.disabled = true;
        run.later(done, 1900);
      }
    }

    function miss(el) {
      el.classList.remove("is-miss");
      void el.offsetWidth;
      el.classList.add("is-miss");
      run.sfx("miss");
      // The same thing clicked again costs nothing more.
      if (!el.dataset.missed) {
        el.dataset.missed = "1";
        st.misses++;
        setScore();
      }
      wordBox.innerHTML = `<span class="eng-hunt-miss">${esc(T("huntMiss"))}</span>`;
      run.cancel(st.backTimer);
      st.backTimer = run.later(() => {
        wordBox.innerHTML = st.wordHtml;
      }, 1500);
    }

    function hint() {
      const left = items.map((item, i) => ({ item, i })).filter(({ item, i }) => item.word && !itemEl(i).disabled);
      if (!left.length) return;
      const { item, i } = pickOne(left);
      st.hints++;
      st.hinted.add(item.word);
      setScore();
      run.sfx("flip");
      const el = itemEl(i);
      el.classList.add("is-hint");
      el.scrollIntoView?.({ block: "nearest", inline: "center", behavior: "smooth" });
      hintBtn.disabled = true;
      run.later(() => {
        el.classList.remove("is-hint");
        hintBtn.disabled = false;
      }, 2400);
    }

    function done() {
      const sec = Math.round((Date.now() - run.startedAt) / 1000);
      const value = Math.max(0, total * 10 - st.misses * 2 - st.hints * 3);
      const slips = st.misses + st.hints;
      finish(run, {
        value,
        label: "pointsLabel",
        detail: T("huntResult", clockText(sec), st.misses),
        stars: slips === 0 ? 3 : slips <= 3 ? 2 : 1,
        correct: total,
        recordScore: T("points", value),
        review: [...st.hinted],
      });
    }

    run.on(scene, "click", (e) => {
      const el = e.target.closest(".eng-hunt-item");
      if (!el || el.disabled) return;
      const i = Number(el.dataset.i);
      const item = items[i];
      if (item.word) collect(el, item);
      else miss(el);
    });
    // A word in the tray: hear it and see it again.
    run.on($("#engHuntTray"), "click", (e) => {
      const slot = e.target.closest(".eng-hunt-slot");
      if (!slot || slot.disabled) return;
      const w = targets[Number(slot.dataset.slot)];
      run.speak(w.en);
      showWord(w);
    });
    run.on(wordBox, "click", (e) => {
      const btn = e.target.closest(".eng-speak");
      if (btn) run.speak(btn.dataset.say);
    });
    run.on(hintBtn, "click", hint);
  }

  /* ════════ Game 6: Fox adventure — a short story on a path: every right
     answer takes the fox one stop closer to home. The stops take turns:
     read the marked word and pick its picture, or see the picture in the
     sentence and pick the missing word. ════════ */

  const ADV_STEPS = 8;
  // Said without "a" / "an".
  const NO_ARTICLE = new Set([
    "bread", "cheese", "milk", "water", "ice cream", "pants", "shoes", "socks", "gloves", "scissors",
    "rain", "snow", "wind", "candles", "challah", "apple and honey", "matzah",
  ]);

  // The sentences of each topic (its id without "vocab-"): {w} is the word,
  // {a w} the word with "a" / "an", {A w} the same starting a sentence. Every
  // sentence must fit every word of the topic. The Hebrew line keeps the
  // blank, so it never gives the answer away.
  const STORIES = {
    animals: [
      { en: "The fox sees {a w}.", he: "השועל רואה ___" },
      { en: "The fox plays with {a w}.", he: "השועל משחק עם ___" },
      { en: "The fox meets {a w}.", he: "השועל פוגש ___" },
      { en: "Look! {A w}!", he: "תראו! ___!" },
    ],
    food: [
      { en: "The fox finds {a w}.", he: "השועל מוצא ___" },
      { en: "The fox wants {a w}.", he: "השועל רוצה ___" },
      { en: "The fox has {a w}.", he: "לשועל יש ___" },
      { en: "Look! {A w}!", he: "תראו! ___!" },
    ],
    colors: [
      { en: "The fox finds {a w} ball.", he: "השועל מוצא כדור ___" },
      { en: "The fox has {a w} hat.", he: "לשועל יש כובע ___" },
      { en: "The fox sees {a w} flower.", he: "השועל רואה פרח ___" },
      { en: "The fox likes {w}.", he: "השועל אוהב ___" },
    ],
    numbers: [
      { en: "The fox finds the number {w}.", he: "השועל מוצא את המספר ___" },
      { en: "The fox counts to {w}.", he: "השועל סופר עד ___" },
      { en: "The fox sees the number {w}.", he: "השועל רואה את המספר ___" },
    ],
    body: [
      { en: "The fox shows his {w}.", he: "השועל מראה את ___ שלו" },
      { en: "The fox washes his {w}.", he: "השועל רוחץ את ___ שלו" },
      { en: "Look at the fox's {w}!", he: "תראו את ___ של השועל!" },
    ],
    clothes: [
      { en: "The fox puts on his {w}.", he: "השועל לובש את ___ שלו" },
      { en: "The fox finds his {w}.", he: "השועל מוצא את ___ שלו" },
      { en: "The fox likes his {w}.", he: "השועל אוהב את ___ שלו" },
    ],
    family: [
      { en: "The fox sees the {w}.", he: "השועל רואה את ___" },
      { en: "The fox plays with the {w}.", he: "השועל משחק עם ___" },
      { en: "The fox meets the {w}.", he: "השועל פוגש את ___" },
    ],
    school: [
      { en: "The fox takes his {w}.", he: "השועל לוקח את ___ שלו" },
      { en: "The fox finds his {w}.", he: "השועל מוצא את ___ שלו" },
      { en: "The fox looks at his {w}.", he: "השועל מסתכל על ___ שלו" },
    ],
    home: [
      { en: "The fox cleans the {w}.", he: "השועל מנקה את ___" },
      { en: "The fox looks at the {w}.", he: "השועל מסתכל על ___" },
      { en: "The fox sees the {w}.", he: "השועל רואה את ___" },
    ],
    kitchen: [
      { en: "The fox washes the {w}.", he: "השועל שוטף את ___" },
      { en: "The fox takes the {w}.", he: "השועל לוקח את ___" },
      { en: "The fox finds {a w}.", he: "השועל מוצא ___" },
    ],
    nature: [
      { en: "The fox likes the {w}.", he: "השועל אוהב את ___" },
      { en: "The fox talks about the {w}.", he: "השועל מדבר על ___" },
      { en: "The fox sings about the {w}.", he: "השועל שר על ___" },
    ],
    transport: [
      { en: "The fox sees {a w}.", he: "השועל רואה ___" },
      { en: "The fox goes by {w}.", he: "השועל נוסע ב־___" },
      { en: "Look! {A w}!", he: "תראו! ___!" },
    ],
    feelings: [
      { en: "The fox is {w}.", he: "השועל ___" },
      { en: "Today the fox is {w}.", he: "היום השועל ___" },
      { en: "The fox feels {w}.", he: "השועל מרגיש ___" },
    ],
    opposites: [
      { en: "Look! It is {w}.", he: "תראו! זה ___" },
      { en: "The fox sees something {w}.", he: "השועל רואה משהו ___" },
      { en: "The fox says: it is {w}!", he: "השועל אומר: זה ___!" },
    ],
    actions: [
      { en: "The fox can {w}.", he: "השועל יודע ___" },
      { en: "The fox likes to {w}.", he: "השועל אוהב ___" },
      { en: "Now the fox wants to {w}.", he: "עכשיו השועל רוצה ___" },
    ],
    places: [
      { en: "The fox goes to the {w}.", he: "השועל הולך ל־___" },
      { en: "The fox sees the {w}.", he: "השועל רואה את ___" },
      { en: "Where is the {w}?", he: "איפה ___?" },
    ],
    jobs: [
      { en: "The fox meets {a w}.", he: "השועל פוגש ___" },
      { en: "The fox wants to be {a w}.", he: "השועל רוצה להיות ___" },
      { en: "The fox talks to the {w}.", he: "השועל מדבר עם ___" },
    ],
    hobbies: [
      { en: "The fox likes {w}.", he: "השועל אוהב ___" },
      { en: "The fox loves {w}.", he: "השועל מאוד אוהב ___" },
      { en: "The fox and his friend like {w}.", he: "השועל והחבר שלו אוהבים ___" },
    ],
    holidays: [
      { en: "The fox sees the {w}.", he: "השועל רואה את ___" },
      { en: "Look at the {w}!", he: "תראו את ___!" },
      { en: "The fox likes the {w}.", he: "השועל אוהב את ___" },
    ],
    default: [
      { en: "The fox finds {a w}.", he: "השועל מוצא ___" },
      { en: "The fox draws {a w}.", he: "השועל מצייר ___" },
      { en: "Look! {A w}!", he: "תראו! ___!" },
    ],
  };

  function article(en) {
    const word = en.toLowerCase();
    if (NO_ARTICLE.has(word)) return "";
    return /^[aeiou]/.test(word) ? "an" : "a";
  }

  // The sentence around the word: { before, word, after }.
  function storyLine(frame, w) {
    const m = /\{(a |A )?w\}/.exec(frame.en);
    let before = frame.en.slice(0, m.index);
    const after = frame.en.slice(m.index + m[0].length);
    const art = m[1] ? article(w.en) : "";
    const capital = m[1] === "A ";
    let word = w.en;
    if (art) before += `${capital ? art[0].toUpperCase() + art.slice(1) : art} `;
    else if (capital) word = word[0].toUpperCase() + word.slice(1);
    return { before, word, after };
  }

  // A smooth line through the stops (a Catmull-Rom curve as Béziers).
  function smoothPath(pts) {
    const f = (n) => n.toFixed(2);
    let d = `M${f(pts[0].x)} ${f(pts[0].y)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      d += ` C${f(p1.x + (p2.x - p0.x) / 6)} ${f(p1.y + (p2.y - p0.y) / 6)} ${f(p2.x - (p3.x - p1.x) / 6)} ${f(p2.y - (p3.y - p1.y) / 6)} ${f(p2.x)} ${f(p2.y)}`;
    }
    return d;
  }

  function playAdventure(run) {
    const frames = STORIES[run.ctx.topic.id.replace(/^vocab-/, "")] || STORIES.default;
    // Eight words, never the same one twice in a row.
    const targets = [];
    let bag = [];
    while (targets.length < ADV_STEPS) {
      if (!bag.length) bag = shuffle(run.words);
      const w = bag.pop();
      if (w.word !== targets[targets.length - 1]?.word) targets.push(w);
    }
    const firstFrame = Math.floor(Math.random() * frames.length);
    const st = { i: 0, score: 0, firstTry: 0, cur: null, missed: new Map() };

    // The path follows the reading direction: home is where a line ends.
    const rtl = document.documentElement.dir === "rtl";
    const stops = Array.from({ length: ADV_STEPS + 1 }, (_, k) => {
      const x = 7 + (86 * k) / ADV_STEPS;
      return { x: rtl ? 100 - x : x, y: 70 - 16 * Math.sin((k * Math.PI) / 2) };
    });
    const at = (p) => `left:${p.x.toFixed(2)}%;top:${p.y.toFixed(2)}%`;
    const fox = window.PleyiFox?.svg ? `<span class="site-fox-fig">${window.PleyiFox.svg}</span>` : `<span class="eng-adv-fox-dot"></span>`;

    run.shell(
      `
      <div class="eng-adv-trail" id="engAdvTrail" aria-hidden="true">
        <svg class="eng-adv-path" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="${smoothPath(stops)}"/></svg>
        ${stops
          .map(
            (p, k) =>
              `<span class="eng-adv-stop${k === 0 ? " is-done" : ""}${k === ADV_STEPS ? " is-home" : ""}" data-stop="${k}" style="${at(p)}">${k === ADV_STEPS ? ICONS.home : ""}</span>`
          )
          .join("")}
        <span class="eng-adv-fox" id="engAdvFox" style="${at(stops[0])}">${fox}</span>
      </div>
      <p class="eng-adv-ask" id="engAdvAsk"></p>
      <div class="eng-adv-story" id="engAdvStory" aria-live="polite"></div>
      <div class="eng-game-stage eng-adv-stage" id="engGameStage">
        <div class="eng-adv-options" id="engAdvOptions" dir="ltr"></div>
      </div>
      <div class="eng-game-flash" id="engGameFlash" aria-live="polite"></div>`,
      pillHtml("engHudStep", ICONS.flag, T("hudStep"), `1/${ADV_STEPS}`) + pillHtml("engHudScore", run.ctx.icons.star, T("hudScore"), 0)
    );

    const stage = $("#engGameStage");
    const optionsBox = $("#engAdvOptions");
    const story = $("#engAdvStory");
    const ask = $("#engAdvAsk");
    const foxEl = $("#engAdvFox");

    // Picture options: three squares as big as the stage allows.
    const fitOptions = () => {
      if (!optionsBox.classList.contains("is-pic")) return;
      const W = stage.clientWidth;
      const H = stage.clientHeight;
      if (!W || !H) return;
      const gap = W < 420 ? 10 : 16;
      optionsBox.style.setProperty("--gap", `${gap}px`);
      optionsBox.style.setProperty("--cell", `${Math.floor(Math.max(60, Math.min((W - gap * 2) / 3, H - 8, 190)))}px`);
    };
    run.observe(stage, fitOptions);

    function storyHtml(cur, solved) {
      const { line, w } = cur;
      const showWord = cur.type === "pic" || solved;
      const slot = showWord
        ? `<b class="lp-key eng-adv-word">${esc(line.word)}</b>`
        : `<span class="eng-adv-blank"><img src="${esc(w.img)}" alt="" draggable="false" /></span>`;
      return `
        <p class="eng-adv-line" lang="en" dir="ltr">${esc(line.before)}${slot}${esc(line.after)}${showWord ? speakBtnHtml(run, w.en, "", "eng-speak--inline") : ""}</p>
        ${lang() === "he" ? `<p class="eng-adv-he">${esc(cur.frame.he)}</p>` : ""}`;
    }

    // With "a" / "an" before the gap, the other words take the same one, so
    // the article doesn't give the answer away.
    function othersFor(w, type, frame) {
      const others = shuffle(run.words.filter((o) => o.word !== w.word));
      if (type !== "word" || !/\{(a |A )w\}/.test(frame.en)) return others.slice(0, 2);
      const same = others.filter((o) => article(o.en) === article(w.en));
      return [...same, ...others.filter((o) => !same.includes(o))].slice(0, 2);
    }

    function render() {
      const w = targets[st.i];
      const type = st.i % 2 === 0 ? "pic" : "word";
      const frame = frames[(firstFrame + st.i) % frames.length];
      const options = shuffle([w, ...othersFor(w, type, frame)]);
      st.cur = { w, type, frame, line: storyLine(frame, w), tries: 0, done: false };
      setPill("engHudStep", `${st.i + 1}/${ADV_STEPS}`);
      ask.textContent = T(type === "pic" ? "advPickPic" : "advPickWord");
      story.innerHTML = storyHtml(st.cur, false);
      story.classList.remove("is-in");
      void story.offsetWidth;
      story.classList.add("is-in");
      optionsBox.className = `eng-adv-options is-${type}`;
      optionsBox.innerHTML = options
        .map((o, k) =>
          type === "pic"
            ? `<button type="button" class="eng-pic-option eng-adv-pic" data-word="${esc(o.word)}" aria-label="${esc(o.he)}"><span class="eng-option-key">${k + 1}</span><img src="${esc(o.img)}" alt="" draggable="false" /></button>`
            : `<button type="button" class="eng-option eng-adv-opt" data-word="${esc(o.word)}"><span class="eng-option-key">${k + 1}</span>${esc(o.en)}</button>`
        )
        .join("");
      fitOptions();
      flash("");
    }

    function moveFox(k) {
      foxEl.style.cssText = at(stops[k]);
      foxEl.classList.remove("is-hop");
      void foxEl.offsetWidth;
      foxEl.classList.add("is-hop");
      $(`.eng-adv-stop[data-stop="${k}"]`)?.classList.add("is-done");
    }

    function answer(btn) {
      const cur = st.cur;
      if (!cur || cur.done || btn.disabled) return;
      if (btn.dataset.word !== cur.w.word) {
        cur.tries++;
        st.missed.set(cur.w.word, cur.w);
        btn.classList.add("is-wrong");
        btn.disabled = true;
        run.sfx("wrong");
        flash(esc(T("advTryAgain")), "wrong");
        return;
      }
      cur.done = true;
      btn.classList.add("is-right");
      $$("button", optionsBox).forEach((b) => (b.disabled = true));
      st.score += [10, 5][cur.tries] ?? 2;
      if (!cur.tries) st.firstTry++;
      setPill("engHudScore", st.score);
      bumpPill("engHudScore");
      run.sfx("right");
      run.speak(cur.w.en);
      story.innerHTML = storyHtml(cur, true);
      flash(`<bdi dir="ltr">${esc(cur.w.en)}</bdi> — ${esc(cur.w.he)}`, "right");
      st.i++;
      run.later(() => moveFox(st.i), 350);
      run.later(st.i < ADV_STEPS ? render : arrive, 1500);
    }

    function arrive() {
      ask.textContent = "";
      optionsBox.innerHTML = "";
      story.innerHTML = `
        <p class="eng-adv-line eng-adv-end" lang="en" dir="ltr">The fox is home!</p>
        ${T("advHomeHe") ? `<p class="eng-adv-he">${esc(T("advHomeHe"))}</p>` : ""}`;
      $("#engAdvTrail").classList.add("is-home");
      flash("");
      run.later(() => {
        const max = ADV_STEPS * 10;
        const ratio = st.score / max;
        finish(run, {
          value: st.score,
          label: "pointsLabel",
          detail: T("adventureResult", st.firstTry, ADV_STEPS),
          stars: ratio >= 0.9 ? 3 : ratio >= 0.65 ? 2 : ratio >= 0.35 ? 1 : 0,
          correct: st.firstTry,
          recordScore: `${st.score}/${max}`,
          review: [...st.missed.values()],
        });
      }, 1600);
    }

    run.on(optionsBox, "click", (e) => {
      const btn = e.target.closest("button");
      if (btn) answer(btn);
    });
    run.on(story, "click", (e) => {
      const btn = e.target.closest(".eng-speak");
      if (btn) run.speak(btn.dataset.say);
    });
    run.on(document, "keydown", (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey || !/^[1-3]$/.test(e.key)) return;
      const btn = $$("button", optionsBox)[Number(e.key) - 1];
      if (btn && !btn.disabled) {
        e.preventDefault();
        answer(btn);
      }
    });

    render();
  }

  /* ════════ Game 7: Class bingo — the teacher calls the words on the board,
     and every student marks them on a card: on a phone or a printed one
     (english-worksheet.js ?bingo=). The cards come from english-bingo.js by
     their number, so the board can check any card. ════════ */

  const BINGO_KEY = "pleyi-english-bingo";
  // A phone card keeps its marks through a reload, for about one lesson.
  const BINGO_KEEP_MS = 6 * 60 * 60 * 1000;

  // kind: "localStorage" or "sessionStorage" — read inside the try, since
  // even reaching it throws where site data is blocked.
  function readStore(kind, key) {
    try {
      return JSON.parse(window[kind].getItem(key)) || {};
    } catch {
      return {};
    }
  }

  function writeStore(kind, key, value) {
    try {
      window[kind].setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }

  function bingoIds(run) {
    return run.words.map((w) => w.word);
  }

  // The print page gets the very words the board calls, so its cards match.
  function bingoPrintHref(run) {
    return `/services/english-worksheet?topic=${encodeURIComponent(run.ctx.topic.id)}&bingo=${bingoIds(run).map(encodeURIComponent).join(",")}`;
  }

  function playBingoBoard(run) {
    const topicId = run.ctx.topic.id;
    const byId = new Map(run.words.map((w) => [w.word, w]));
    // The round survives a reload of the board (this tab only).
    const saved = readStore("sessionStorage", BINGO_KEY)[topicId];
    const valid = saved?.order?.length === byId.size && saved.order.every((id) => byId.has(id));
    const st = {
      order: valid ? saved.order : shuffle(bingoIds(run)),
      count: valid ? Math.min(saved.count || 0, byId.size) : 0,
      pic: false,
      checking: false,
    };

    run.shell(
      `
      <div class="eng-game-stage eng-bingo-stage" id="engGameStage">
        <div class="eng-bingo-ball" id="engBingoBall" aria-live="polite"></div>
        <div class="eng-bingo-check" id="engBingoCheck" hidden>
          <div class="eng-bingo-check-head">
            <h3 class="eng-bingo-check-title"><span class="lp-key">${esc(T("bingoCheck"))}</span></h3>
            <button type="button" class="eng-tool" id="engBingoCheckClose">${esc(T("bingoCheckBack"))}</button>
          </div>
          <form class="eng-bingo-check-form" id="engBingoCheckForm">
            <label for="engBingoNum">${esc(T("bingoCheckPrompt"))}</label>
            <input type="text" id="engBingoNum" inputmode="numeric" maxlength="3" autocomplete="off" dir="ltr" />
            <button type="submit" class="eng-tool">${ICONS.hunt}<span>${esc(T("bingoCheckGo"))}</span></button>
          </form>
          <div class="eng-bingo-check-result" id="engBingoCheckResult"></div>
        </div>
      </div>
      <div class="eng-bingo-controls">
        <button type="button" class="btn btn-primary btn-candy font-cartoon eng-bingo-next" id="engBingoNext"></button>
        <button type="button" class="eng-tool" id="engBingoPic" aria-pressed="false">${ICONS.picture}<span>${esc(T("bingoShowPic"))}</span></button>
        <button type="button" class="eng-tool" id="engBingoCheckBtn" aria-pressed="false">${ICONS.hunt}<span>${esc(T("bingoCheck"))}</span></button>
        <button type="button" class="eng-tool" id="engBingoNew">${ICONS.moves}<span>${esc(T("bingoNewRound"))}</span></button>
      </div>
      <ul class="eng-bingo-called" id="engBingoCalled" dir="ltr" aria-label="${esc(T("bingoCalledList"))}"></ul>`,
      pillHtml("engHudCalled", ICONS.bingo, T("hudCalled"), `${st.count}/${byId.size}`)
    );

    const ball = $("#engBingoBall");
    const checkBox = $("#engBingoCheck");
    const result = $("#engBingoCheckResult");
    const nextBtn = $("#engBingoNext");
    const picBtn = $("#engBingoPic");
    const checkBtn = $("#engBingoCheckBtn");

    function save() {
      const all = readStore("sessionStorage", BINGO_KEY);
      all[topicId] = { order: st.order, count: st.count };
      writeStore("sessionStorage", BINGO_KEY, all);
    }

    function renderBall(fresh) {
      if (!st.count) {
        ball.innerHTML = `<span class="eng-bingo-badge">${ICONS.bingo}</span><span class="eng-bingo-wait">${esc(T("bingoFirst"))}</span>`;
        return;
      }
      const w = byId.get(st.order[st.count - 1]);
      const say = w.say ? `<span class="eng-say-row" dir="rtl" lang="he"><span class="eng-say eng-say-line">${esc(w.say)}</span></span>` : "";
      ball.innerHTML = `
        <span class="eng-bingo-count">${st.count}</span>
        ${st.pic ? `<img class="eng-bingo-pic" src="${esc(w.img)}" alt="${esc(w.he)}" draggable="false" />` : ""}
        <span class="eng-bingo-word-row">
          <span class="eng-bingo-word" lang="en" dir="ltr">${esc(w.en)}</span>
          ${speakBtnHtml(run, w.en)}
        </span>
        ${say}`;
      if (fresh) {
        ball.classList.remove("is-in");
        void ball.offsetWidth;
        ball.classList.add("is-in");
      }
    }

    // Newest first, so the last few words are always in view.
    function renderCalled() {
      $("#engBingoCalled").innerHTML = st.order
        .slice(0, st.count)
        .reverse()
        .map((id) => {
          const w = byId.get(id);
          return `<li><button type="button" class="eng-game-chip eng-bingo-chip" data-say="${esc(w.en)}"><img src="${esc(w.img)}" alt="" draggable="false" /><span class="eng-game-chip-en">${esc(w.en)}</span></button></li>`;
        })
        .join("");
    }

    function sync() {
      const all = st.count >= byId.size;
      nextBtn.textContent = T(all ? "bingoAllCalled" : "bingoNext");
      nextBtn.disabled = all;
      picBtn.disabled = !st.count;
      picBtn.setAttribute("aria-pressed", String(st.pic));
      checkBtn.setAttribute("aria-pressed", String(st.checking));
      setPill("engHudCalled", `${st.count}/${byId.size}`);
    }

    function next() {
      if (st.count >= byId.size) return;
      if (st.checking) closeCheck();
      st.count++;
      save();
      run.sfx("flip");
      run.speak(byId.get(st.order[st.count - 1]).en);
      renderBall(true);
      renderCalled();
      sync();
      bumpPill("engHudCalled");
    }

    function newRound() {
      st.order = shuffle(bingoIds(run));
      st.count = 0;
      save();
      closeCheck();
      renderBall(true);
      renderCalled();
      sync();
    }

    function openCheck() {
      st.checking = true;
      ball.hidden = true;
      checkBox.hidden = false;
      result.innerHTML = "";
      $("#engBingoNum").value = "";
      $("#engBingoNum").focus({ preventScroll: true });
      sync();
    }

    function closeCheck() {
      st.checking = false;
      ball.hidden = false;
      checkBox.hidden = true;
      sync();
    }

    // The card as the student has it, with the called words lit up.
    function showCard(n) {
      const ids = window.EnglishBingo.card(bingoIds(run), n);
      const called = new Set(st.order.slice(0, st.count));
      const lines = window.EnglishBingo.lines((i) => called.has(ids[i]));
      const inLine = new Set(lines.flat());
      result.innerHTML = `
        <div class="eng-bingo-mini" id="engBingoMini" dir="ltr">${ids
          .map((id, i) => {
            const w = byId.get(id);
            return `<span class="eng-bingo-mini-cell${called.has(id) ? " is-called" : ""}${inLine.has(i) ? " is-line" : ""}"><img src="${esc(w.img)}" alt="${esc(w.en)}" draggable="false" /></span>`;
          })
          .join("")}</div>
        <p class="eng-bingo-verdict${lines.length ? " is-win" : ""}">${lines.length ? ICONS.check : ""}<span>${esc(T(lines.length ? "bingoCheckWin" : "bingoCheckNo"))}</span></p>`;
      run.sfx(lines.length ? "right" : "tick");
      fitMini();
    }

    const fitMini = () => {
      const mini = $("#engBingoMini");
      if (!mini || checkBox.hidden) return;
      const verdict = $(".eng-bingo-verdict", result);
      const room = Math.min(result.clientWidth, result.clientHeight - (verdict?.offsetHeight || 0) - 8, 300);
      mini.style.setProperty("--size", `${Math.max(90, Math.floor(room))}px`);
    };
    run.observe($("#engGameStage"), fitMini);

    run.on(nextBtn, "click", next);
    run.on(picBtn, "click", () => {
      st.pic = !st.pic;
      renderBall(false);
      sync();
    });
    run.on(checkBtn, "click", () => (st.checking ? closeCheck() : openCheck()));
    run.on($("#engBingoCheckClose"), "click", closeCheck);
    run.on($("#engBingoNew"), "click", newRound);
    run.on($("#engBingoCheckForm"), "submit", (e) => {
      e.preventDefault();
      const raw = $("#engBingoNum").value.trim();
      const n = Number(raw);
      if (!/^\d{1,3}$/.test(raw) || n < 1) {
        result.innerHTML = `<p class="eng-bingo-verdict is-bad">${esc(T("bingoCheckBad"))}</p>`;
        return;
      }
      showCard(n);
    });
    run.on($("#engGameStage"), "click", (e) => {
      const btn = e.target.closest(".eng-speak");
      if (btn) run.speak(btn.dataset.say);
    });
    run.on($("#engBingoCalled"), "click", (e) => {
      const chip = e.target.closest(".eng-bingo-chip");
      if (chip) run.speak(chip.dataset.say);
    });

    renderBall(false);
    renderCalled();
    sync();
    nextBtn.focus({ preventScroll: true });
  }

  function playBingoCard(run) {
    const topicId = run.ctx.topic.id;
    const byId = new Map(run.words.map((w) => [w.word, w]));
    // Phone cards are numbered from 100, so they rarely share a number with
    // the printed ones (1, 2, 3…) — the same number is the same card.
    const freshCard = () => ({ n: 100 + Math.floor(Math.random() * 900), marks: new Set() });
    const kept = readStore("localStorage", BINGO_KEY)[topicId];
    const st = kept?.n && Date.now() - (kept.at || 0) < BINGO_KEEP_MS ? { n: kept.n, marks: new Set(kept.marks || []) } : freshCard();
    let won = false;
    let sureTimer = 0;

    function save() {
      const all = readStore("localStorage", BINGO_KEY);
      all[topicId] = { n: st.n, marks: [...st.marks], at: Date.now() };
      writeStore("localStorage", BINGO_KEY, all);
    }

    function render() {
      won = false;
      const ids = window.EnglishBingo.card(bingoIds(run), st.n);
      run.shell(
        `
        <p class="eng-bingo-tip">${esc(T("bingoCardTip"))}</p>
        <div class="eng-game-stage eng-bingo-card-stage" id="engGameStage">
          <div class="eng-bingo-card" id="engBingoCard" dir="ltr">${ids
            .map((id, i) => {
              const w = byId.get(id);
              const on = st.marks.has(i);
              return `<button type="button" class="eng-bingo-cell${on ? " is-marked" : ""}" data-i="${i}" aria-pressed="${on}" aria-label="${esc(w.he)}"><img src="${esc(w.img)}" alt="" draggable="false" /><span class="eng-bingo-stamp" aria-hidden="true">${ICONS.check}</span></button>`;
            })
            .join("")}</div>
        </div>
        <div class="eng-game-flash" id="engGameFlash" aria-live="polite"></div>
        <div class="eng-bingo-card-actions">
          <button type="button" class="eng-tool" id="engBingoNewCard">${ICONS.moves}<span>${esc(T("bingoNewCard"))}</span></button>
        </div>`,
        pillHtml("engHudCard", ICONS.bingo, T("hudCard"), st.n)
      );

      const stage = $("#engGameStage");
      const board = $("#engBingoCard");
      const fit = () => {
        const W = stage.clientWidth;
        const H = stage.clientHeight;
        if (!W || !H) return;
        const gap = Math.min(W, H) < 420 ? 8 : 12;
        board.style.setProperty("--gap", `${gap}px`);
        board.style.setProperty("--cell", `${Math.floor(Math.min((W - gap * 2) / 3, (H - gap * 2) / 3, 190))}px`);
      };
      fit();
      run.observe(stage, fit);
      run.on(board, "click", (e) => {
        const cell = e.target.closest(".eng-bingo-cell");
        if (cell) toggle(cell);
      });
      run.on($("#engBingoNewCard"), "click", newCard);
      checkLines();
    }

    function toggle(cell) {
      const i = Number(cell.dataset.i);
      const on = !st.marks.has(i);
      if (on) st.marks.add(i);
      else st.marks.delete(i);
      cell.classList.toggle("is-marked", on);
      cell.setAttribute("aria-pressed", String(on));
      run.sfx(on ? "pop" : "tick");
      save();
      checkLines();
    }

    function checkLines() {
      const inLine = new Set(window.EnglishBingo.lines((i) => st.marks.has(i)).flat());
      $$(".eng-bingo-cell").forEach((cell) => cell.classList.toggle("is-line", inLine.has(Number(cell.dataset.i))));
      $("#engBingoCard").classList.toggle("is-bingo", inLine.size > 0);
      if (inLine.size && !won) {
        won = true;
        run.sfx("finish");
        flash(esc(T("bingoWin", st.n)), "right");
      } else if (!inLine.size && won) {
        won = false;
        flash("");
      }
    }

    // A card with marks asks once more before it is thrown away.
    function newCard() {
      const btn = $("#engBingoNewCard");
      if (st.marks.size && !btn.classList.contains("is-sure")) {
        btn.classList.add("is-sure");
        $("span", btn).textContent = T("bingoNewCardSure");
        run.cancel(sureTimer);
        sureTimer = run.later(() => {
          btn.classList.remove("is-sure");
          $("span", btn).textContent = T("bingoNewCard");
        }, 3000);
        return;
      }
      run.clear();
      Object.assign(st, freshCard());
      save();
      run.sfx("flip");
      render();
    }

    save();
    render();
  }

  /* ════════ Game 8: Build a sentence — the fox's sentences of the topic
     (STORIES) come apart into word tiles, tapped in order. A tile that
     doesn't come next shakes and stays put. ════════ */

  const SENTENCE_ROUNDS = 6;

  // { tiles: ["The", "fox", "sees", "a", "cat"], end: ".", text } — the
  // topic's word stays one tile even when it is two words ("ice cream").
  function sentenceTiles(line) {
    const text = `${line.before}${line.word}${line.after}`;
    const end = /[.!?]$/.exec(text)?.[0] || "";
    const words = (s) => s.split(/\s+/).filter(Boolean);
    return { tiles: [...words(line.before), line.word, ...words(line.after.slice(0, line.after.length - end.length))], end, text };
  }

  function playSentence(run) {
    const frames = STORIES[run.ctx.topic.id.replace(/^vocab-/, "")] || STORIES.default;
    const targets = [];
    let bag = [];
    while (targets.length < SENTENCE_ROUNDS) {
      if (!bag.length) bag = shuffle(run.words);
      const w = bag.pop();
      if (w.word !== targets[targets.length - 1]?.word) targets.push(w);
    }
    const firstFrame = Math.floor(Math.random() * frames.length);
    const st = { i: 0, score: 0, clean: 0, cur: null, missed: new Map() };
    const max = SENTENCE_ROUNDS * 10;

    function render() {
      const w = targets[st.i];
      const frame = frames[(firstFrame + st.i) % frames.length];
      const parts = sentenceTiles(storyLine(frame, w));
      // Shuffled, but never already in order.
      let order = shuffle(parts.tiles.map((_, k) => k));
      for (let tries = 0; tries < 12 && order.every((k, i) => parts.tiles[k] === parts.tiles[i]); tries++) order = shuffle(order);
      st.cur = { w, parts, next: 0, wrongs: 0, missHere: 0, done: false };

      run.shell(
        `
        <div class="eng-game-stage eng-sen-stage" id="engGameStage">
          <img class="eng-scr-img eng-sen-img" src="${esc(w.img)}" alt="" draggable="false" />
        </div>
        ${lang() === "he" ? `<p class="eng-sen-he">${esc(frame.he)}</p>` : ""}
        <div class="eng-sen-line" id="engSenLine" lang="en" dir="ltr">
          ${parts.tiles.map((_, k) => `<span class="eng-sen-gap" data-slot="${k}"></span>`).join("")}${parts.end ? `<span class="eng-sen-end">${esc(parts.end)}</span>` : ""}
        </div>
        <div class="eng-sen-tiles" id="engSenTiles" lang="en" dir="ltr">
          ${order.map((k) => `<button type="button" class="eng-sen-tile" data-text="${esc(parts.tiles[k])}">${esc(parts.tiles[k])}</button>`).join("")}
        </div>
        <div class="eng-game-flash" id="engGameFlash" aria-live="polite"></div>`,
        pillHtml("engHudStep", ICONS.sentence, T("hudSentence"), `${st.i + 1}/${SENTENCE_ROUNDS}`) + pillHtml("engHudScore", run.ctx.icons.star, T("hudScore"), st.score)
      );
      run.on($("#engSenTiles"), "click", (e) => {
        const btn = e.target.closest(".eng-sen-tile");
        if (btn) pick(btn);
      });
    }

    function pick(btn) {
      const cur = st.cur;
      if (cur.done || btn.classList.contains("is-used")) return;
      const want = cur.parts.tiles[cur.next];
      if (btn.dataset.text !== want) {
        cur.wrongs++;
        cur.missHere++;
        btn.classList.remove("is-wrong");
        void btn.offsetWidth;
        btn.classList.add("is-wrong");
        run.later(() => btn.classList.remove("is-wrong"), 700);
        run.sfx("wrong");
        flash(esc(T("senNotYet")), "wrong");
        // Two misses at the same place: the right tile lights up.
        if (cur.missHere >= 2) $$(".eng-sen-tile:not(.is-used)").find((b) => b.dataset.text === want)?.classList.add("is-glow");
        return;
      }
      btn.classList.add("is-used");
      btn.disabled = true;
      $$(".eng-sen-tile.is-glow").forEach((b) => b.classList.remove("is-glow"));
      const gap = $(`.eng-sen-gap[data-slot="${cur.next}"]`);
      gap.textContent = want;
      gap.classList.add("is-filled");
      cur.next++;
      cur.missHere = 0;
      run.sfx("tick");
      flash("");
      if (cur.next === cur.parts.tiles.length) solved();
    }

    function solved() {
      const cur = st.cur;
      cur.done = true;
      const points = Math.max(2, 10 - 2 * cur.wrongs);
      st.score += points;
      if (!cur.wrongs) st.clean++;
      else st.missed.set(cur.w.word, cur.w);
      setPill("engHudScore", st.score);
      bumpPill("engHudScore");
      $("#engSenLine").classList.add("is-right");
      run.sfx("right");
      run.speak(cur.parts.text);
      flash(`<bdi dir="ltr">${esc(cur.w.en)}</bdi> — ${esc(cur.w.he)} · <bdi dir="ltr">+${points}</bdi>`, "right");
      run.later(() => {
        st.i++;
        if (st.i < SENTENCE_ROUNDS) {
          render();
          return;
        }
        const ratio = st.score / max;
        finish(run, {
          value: st.score,
          label: "pointsLabel",
          detail: T("sentenceResult", st.clean, SENTENCE_ROUNDS),
          stars: ratio >= 0.9 ? 3 : ratio >= 0.65 ? 2 : ratio >= 0.35 ? 1 : 0,
          correct: Math.round(st.score / 10),
          recordScore: `${st.score}/${max}`,
          review: [...st.missed.values()],
        });
      }, 2200);
    }

    render();
  }

  /* ════════ Game 10: Word snake — the word is on top; steer the snake to
     its picture and it grows. Another picture or its own tail costs a
     heart; the walls let it through to the other side. ════════ */

  const SNAKE_LIVES = 3;
  const SNAKE_FOODS = 3;
  const SNAKE_DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const SNAKE_OPPOSITE = { up: "down", down: "up", left: "right", right: "left" };
  const SNAKE_TURN = { up: 0, right: 90, down: 180, left: 270 };
  const SNAKE_KEYS = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right", w: "up", s: "down", a: "left", d: "right" };

  function playSnake(run) {
    const st = {
      snake: [],
      dir: "right",
      queue: [],
      grow: 0,
      foods: [],
      target: null,
      score: 0,
      lives: SNAKE_LIVES,
      missed: new Map(),
      over: false,
      paused: true,
      timer: 0,
    };

    const heartsHtml = () =>
      `<span class="eng-hud-pill eng-hud-hearts" id="engHudLives" role="img" aria-label="${esc(T("hudLives", st.lives))}">${Array.from(
        { length: SNAKE_LIVES },
        (_, i) => `<span class="eng-heart${i < st.lives ? " is-on" : ""}">${ICONS.heart}</span>`
      ).join("")}</span>`;
    const keys = T("snakeKeys");

    run.shell(
      `
      <div class="eng-balloon-target">
        <span class="eng-balloon-target-label">${esc(T("snakeEat"))}</span>
        <span class="eng-balloon-word" id="engSnakeWord" dir="ltr"></span>
        ${run.ctx.canSpeak?.() ? `<button type="button" class="eng-speak" id="engSnakeSay" aria-label="${esc(T("sayTarget"))}">${run.ctx.icons.listen}</button>` : ""}
      </div>
      <div class="eng-game-stage eng-snake-stage" id="engGameStage">
        <div class="eng-snake-board" id="engSnakeBoard" dir="ltr"></div>
      </div>
      <div class="eng-snake-pad" dir="ltr">
        ${["left", "up", "down", "right"]
          .map((d) => `<button type="button" class="eng-snake-key" data-dir="${d}" style="--turn:${SNAKE_TURN[d]}deg" aria-label="${esc(keys[d])}">${ICONS.arrow}</button>`)
          .join("")}
      </div>
      <div class="eng-game-flash" id="engGameFlash" aria-live="polite"></div>`,
      heartsHtml() + pillHtml("engHudScore", run.ctx.icons.star, T("hudScore"), 0)
    );

    const stage = $("#engGameStage");
    const board = $("#engSnakeBoard");
    const wordEl = $("#engSnakeWord");

    // The grid is set once, from the room there is at the start; a resize
    // only changes the size of its cells.
    const W0 = stage.clientWidth || 600;
    const H0 = stage.clientHeight || 400;
    const want = Math.max(40, Math.min(64, Math.min(W0, H0) / 7));
    const cols = Math.max(7, Math.min(14, Math.floor(W0 / want)));
    const rows = Math.max(6, Math.min(11, Math.floor(H0 / want)));
    board.style.setProperty("--cols", cols);
    board.style.setProperty("--rows", rows);
    const fit = () => {
      const W = stage.clientWidth;
      const H = stage.clientHeight;
      if (W && H) board.style.setProperty("--cell", `${Math.floor(Math.min(W / cols, H / rows))}px`);
    };
    fit();
    run.observe(stage, fit);

    const place = (el, p) => {
      el.style.setProperty("--x", p.x);
      el.style.setProperty("--y", p.y);
    };
    const same = (a, b) => a.x === b.x && a.y === b.y;
    const speed = () => Math.max(170, 380 - st.score * 12);

    function draw() {
      const segs = $$(".eng-snake-seg", board);
      for (let k = segs.length; k < st.snake.length; k++) {
        const el = document.createElement("span");
        el.className = "eng-snake-seg";
        // The first one is always the head.
        if (k === 0) el.innerHTML = `<i class="eng-snake-eye"></i><i class="eng-snake-eye"></i>`;
        board.appendChild(el);
        segs.push(el);
      }
      segs.slice(st.snake.length).forEach((el) => el.remove());
      st.snake.forEach((p, k) => {
        const el = segs[k];
        place(el, p);
        el.classList.toggle("is-head", k === 0);
        el.classList.toggle("is-tail", k > 0 && k === st.snake.length - 1);
      });
      segs[0].style.setProperty("--turn", `${SNAKE_TURN[st.dir]}deg`);
    }

    // Cells for pictures: not on the snake, nor just ahead of its head.
    function freeCells() {
      const head = st.snake[0];
      const [dx, dy] = SNAKE_DIRS[st.dir];
      const ahead = [1, 2, 3].map((n) => ({ x: (head.x + dx * n + cols) % cols, y: (head.y + dy * n + rows) % rows }));
      const cells = [];
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const p = { x, y };
          if (st.snake.some((s) => same(s, p)) || ahead.some((a) => same(a, p)) || st.foods.some((f) => same(f, p))) continue;
          // Pictures don't stand right next to each other.
          if (st.foods.some((f) => Math.abs(f.x - x) <= 1 && Math.abs(f.y - y) <= 1)) continue;
          cells.push(p);
        }
      }
      return cells;
    }

    function addFood(word) {
      const p = pickOne(freeCells());
      if (!p) return false;
      const el = document.createElement("span");
      el.className = "eng-snake-food";
      el.innerHTML = `<img src="${esc(word.img)}" alt="" draggable="false" />`;
      place(el, p);
      board.appendChild(el);
      st.foods.push({ ...p, word, el });
      return true;
    }

    function removeFood(food) {
      food.el.remove();
      st.foods = st.foods.filter((f) => f !== food);
    }

    function setFoods() {
      st.foods.forEach((f) => f.el.remove());
      st.foods = [];
      if (!addFood(st.target)) return false;
      shuffle(run.words.filter((w) => w.word !== st.target.word))
        .slice(0, SNAKE_FOODS - 1)
        .forEach(addFood);
      return true;
    }

    function newTarget() {
      st.target = pickOne(run.words.filter((w) => w.word !== st.target?.word));
      wordEl.textContent = st.target.en;
      wordEl.classList.remove("is-in");
      void wordEl.offsetWidth;
      wordEl.classList.add("is-in");
      run.later(() => run.speak(st.target.en), 250);
      return setFoods();
    }

    function resetSnake() {
      const y = Math.floor(rows / 2);
      const x = Math.max(2, Math.floor(cols / 2) - 1);
      st.snake = [{ x, y }, { x: x - 1, y }, { x: x - 2, y }];
      st.dir = "right";
      st.queue = [];
      st.grow = 0;
      draw();
    }

    function go(ms) {
      run.cancel(st.timer);
      st.paused = false;
      st.timer = run.later(tick, ms);
    }

    function loseLife(messageHtml) {
      st.lives = Math.max(0, st.lives - 1);
      const hearts = $("#engHudLives");
      if (hearts) hearts.outerHTML = heartsHtml();
      bumpPill("engHudLives", "is-hit");
      run.sfx("wrong");
      flash(messageHtml, "wrong");
      if (st.lives === 0) gameOver();
    }

    function eat(food) {
      if (food.word.word === st.target.word) {
        st.score++;
        st.grow++;
        setPill("engHudScore", st.score);
        bumpPill("engHudScore");
        run.sfx("pop");
        flash(`<bdi dir="ltr">${esc(food.word.en)}</bdi> — ${esc(food.word.he)}`, "right");
        if (!newTarget()) gameOver();
        return;
      }
      st.missed.set(st.target.word, st.target);
      removeFood(food);
      loseLife(`<bdi>${esc(T("wrongPop", food.word.en, food.word.he))}</bdi>`);
      if (st.over) return;
      // Another wrong picture somewhere else, so there are always choices.
      const shown = new Set(st.foods.map((f) => f.word.word));
      const other = pickOne(run.words.filter((w) => !shown.has(w.word) && w.word !== food.word.word));
      if (other) addFood(other);
    }

    function crash() {
      st.paused = true;
      board.classList.add("is-crash");
      loseLife(esc(T("snakeTail")));
      if (st.over) return;
      run.later(() => {
        board.classList.remove("is-crash");
        resetSnake();
        // Pictures under the new snake move away.
        st.foods.filter((f) => st.snake.some((s) => same(s, f))).forEach((f) => {
          removeFood(f);
          addFood(f.word);
        });
        go(700);
      }, 1100);
    }

    function tick() {
      if (st.over || st.paused) return;
      if (st.queue.length) st.dir = st.queue.shift();
      const [dx, dy] = SNAKE_DIRS[st.dir];
      const head = st.snake[0];
      const next = { x: (head.x + dx + cols) % cols, y: (head.y + dy + rows) % rows };
      // The tail moves out of the way, unless the snake is growing.
      const body = st.grow > 0 ? st.snake : st.snake.slice(0, -1);
      if (body.some((p) => same(p, next))) {
        crash();
        return;
      }
      st.snake.unshift(next);
      if (st.grow > 0) st.grow--;
      else st.snake.pop();
      const food = st.foods.find((f) => same(f, next));
      if (food) eat(food);
      if (st.over) return;
      draw();
      st.timer = run.later(tick, speed());
    }

    function turn(dir) {
      if (st.over) return;
      const last = st.queue[st.queue.length - 1] || st.dir;
      if (dir === last || dir === SNAKE_OPPOSITE[last] || st.queue.length >= 2) return;
      st.queue.push(dir);
    }

    function gameOver() {
      st.over = true;
      st.paused = true;
      run.cancel(st.timer);
      flash(esc(T("outOfLives")), "wrong");
      run.later(() => {
        const { score } = st;
        finish(run, {
          value: score,
          label: "pointsLabel",
          detail: T("snakeResult", score),
          stars: score >= 15 ? 3 : score >= 8 ? 2 : score >= 3 ? 1 : 0,
          correct: score,
          review: [...st.missed.values()],
        });
      }, 1400);
    }

    // The buttons react on press, like a game pad; keyboard presses (a click
    // with detail 0) still count.
    $$(".eng-snake-key").forEach((btn) => {
      btn.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        turn(btn.dataset.dir);
      });
      btn.addEventListener("click", (e) => {
        if (e.detail === 0) turn(btn.dataset.dir);
      });
    });
    run.on(document, "keydown", (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const dir = SNAKE_KEYS[e.key] || SNAKE_KEYS[e.key.toLowerCase()];
      if (!dir) return;
      e.preventDefault();
      turn(dir);
    });
    // A swipe on the board turns the snake as soon as the finger has moved
    // far enough, so one long swipe can turn twice.
    let swipe = null;
    stage.addEventListener("pointerdown", (e) => {
      swipe = { x: e.clientX, y: e.clientY, id: e.pointerId };
    });
    stage.addEventListener("pointermove", (e) => {
      if (!swipe || swipe.id !== e.pointerId) return;
      const dx = e.clientX - swipe.x;
      const dy = e.clientY - swipe.y;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
      turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up");
      swipe = { x: e.clientX, y: e.clientY, id: e.pointerId };
    });
    ["pointerup", "pointercancel"].forEach((type) => stage.addEventListener(type, () => (swipe = null)));
    $("#engSnakeSay")?.addEventListener("click", () => run.speak(st.target.en));
    // The snake waits while the tab is hidden.
    run.on(document, "visibilitychange", () => {
      if (st.over) return;
      if (document.hidden) {
        run.cancel(st.timer);
      } else if (!st.paused) {
        go(600);
      }
    });

    resetSnake();
    newTarget();
    flash(esc(T("snakeReady")));
    go(1300);
    run.later(() => flash(""), 1300);
  }

  const GAMES = [
    {
      id: "hunt",
      title: "מצאו בתמונה",
      titleEn: "Find Them in the Picture",
      desc: "מוצאים בתמונה מלאת חפצים את כל הדברים של הנושא",
      descEn: "Find all the topic's things in a picture full of objects",
      icon: ICONS.hunt,
      bestValue: (v) => T("points", v),
      pictures: (run) => {
        const setup = huntSetup(run);
        return [window.ENGLISH_HUNT.sceneUrl(setup.scene), ...run.words.map((w) => w.img), ...setup.extras.map(vocabPicture)];
      },
      play: playHunt,
    },
    {
      id: "memory",
      title: "משחק הזיכרון",
      titleEn: "Memory Game",
      desc: "הופכים קלפים ומוצאים כל מילה עם התמונה שלה",
      descEn: "Flip cards and find each word with its picture",
      icon: ICONS.memory,
      lowerIsBetter: true,
      bestValue: (v) => T("movesCount", v),
      play: playMemory,
    },
    {
      id: "speed",
      title: "מרוץ נגד השעון",
      titleEn: "Beat the Clock",
      desc: "כמה תמונות תזהו ב-60 שניות?",
      descEn: "How many pictures can you name in 60 seconds?",
      icon: ICONS.speed,
      bestValue: (v) => T("points", v),
      play: playSpeed,
    },
    {
      id: "balloons",
      title: "פיצוץ בלונים",
      titleEn: "Balloon Pop",
      desc: "שומעים מילה ומפוצצים את הבלון הנכון — לפני שהוא עף",
      descEn: "Hear a word and pop the right balloon before it flies away",
      icon: ICONS.balloons,
      bestValue: (v) => T("points", v),
      play: playBalloons,
    },
    {
      id: "scramble",
      title: "אותיות מבולבלות",
      titleEn: "Letter Scramble",
      desc: "מסדרים את האותיות וכותבים את המילה שבתמונה",
      descEn: "Unscramble the letters to spell the picture's word",
      icon: ICONS.scramble,
      bestValue: (v) => T("points", v),
      play: playScramble,
    },
    {
      id: "adventure",
      title: "הרפתקת השועל",
      titleEn: "Fox Adventure",
      desc: "כל תשובה נכונה מקדמת את השועל צעד אחד בדרך הביתה",
      descEn: "Every right answer takes the fox one step closer to home",
      icon: ICONS.adventure,
      bestValue: (v) => T("points", v),
      play: playAdventure,
    },
    {
      id: "sentence",
      title: "בונים משפט",
      titleEn: "Build a Sentence",
      desc: "מסדרים את המילים לפי הסדר ובונים משפט קצר באנגלית",
      descEn: "Put the words in order to build a short English sentence",
      icon: ICONS.sentence,
      bestValue: (v) => T("points", v),
      play: playSentence,
    },
    {
      // Game 9: the letter scramble by ear (playScramble's listen mode).
      id: "dictation",
      title: "הכתבה",
      titleEn: "Dictation",
      desc: "שומעים מילה וכותבים אותה — בלי לראות תמונה",
      descEn: "Hear a word and spell it — without seeing a picture",
      icon: ICONS.dictation,
      extras: DICTATION_EXTRAS,
      bestValue: (v) => T("points", v),
      play: (run) => playScramble(run, true),
    },
    {
      id: "snake",
      title: "נחש המילים",
      titleEn: "Word Snake",
      desc: "מובילים את הנחש אל התמונה של המילה — והוא גדל",
      descEn: "Steer the snake to the word's picture — and watch it grow",
      icon: ICONS.snake,
      bestValue: (v) => T("points", v),
      play: playSnake,
    },
    {
      id: "bingo",
      title: "בינגו כיתתי",
      titleEn: "Class Bingo",
      desc: "המורה קורא מילים, וכל תלמיד מסמן אותן בכרטיס שלו — בטלפון או על דף",
      descEn: "The teacher calls out words, and every student marks them on a card — on a phone or on paper",
      icon: ICONS.bingo,
      // One word more than a card's nine (english-bingo.js MIN_WORDS).
      minWords: 10,
      modes: [
        { id: "board", icon: ICONS.board, label: "bingoModeBoard", primary: true },
        { id: "card", icon: ICONS.phone, label: "bingoModeCard" },
        { id: "print", icon: ICONS.print, label: "bingoModePrint", href: bingoPrintHref },
      ],
      play: (run) => (run.mode === "card" ? playBingoCard(run) : playBingoBoard(run)),
    },
  ];

  function find(id) {
    return GAMES.find((g) => g.id === id) || null;
  }

  function fits(game, words) {
    return (words || []).length >= (game.minWords || MIN_WORDS);
  }

  function bestText(topicId, gameId) {
    const game = find(gameId);
    const value = readBest()[`${topicId}/${gameId}`];
    return game && value != null ? T("bestLine", game.bestValue(value)) : "";
  }

  window.EnglishGames = {
    MIN_WORDS,
    list: GAMES,
    find,
    fits,
    listFor: (words) => GAMES.filter((game) => fits(game, words)),
    loc,
    bestText,
    usable(words) {
      return (words || []).filter((w) => w && !SKIP_PICTURES.has(w.word));
    },
    start(gameId, ctx) {
      const game = find(gameId);
      if (!game) return null;
      const run = createRun(game, ctx);
      showIntro(run);
      return {
        game,
        stop: () => run.stop(),
        // A language switch redraws the how-to and results screens; a game in
        // progress keeps going as it is.
        relabel() {
          if (run.stopped) return;
          if (run.phase === "intro") showIntro(run);
          else if (run.phase === "results" && run.result) renderResults(run);
        },
      };
    },
  };
})();
