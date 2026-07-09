/* Pleyi — preset content by subject + topic + level for solo play */

(function () {
  const english = [
    { en: "cat", he: "חתול", hint: "Meow!", emoji: "🐱", level: 1, topic: "animals" },
    { en: "dog", he: "כלב", hint: "Woof!", emoji: "🐶", level: 1, topic: "animals" },
    { en: "apple", he: "תפוח", hint: "A red or green fruit", emoji: "🍎", level: 1, topic: "food" },
    { en: "book", he: "ספר", hint: "You read it", emoji: "📚", level: 1, topic: "school" },
    { en: "house", he: "בית", hint: "Where you live", emoji: "🏠", level: 1, topic: "family" },
    { en: "water", he: "מים", hint: "You drink it every day", emoji: "💧", level: 1, topic: "nature" },
    { en: "happy", he: "שמח", hint: "Feeling good", emoji: "😊", level: 1, topic: "actions" },
    { en: "blue", he: "כחול", hint: "Color of the sky", emoji: "🔵", level: 1, topic: "nature" },
    { en: "big", he: "גדול", hint: "Not small", emoji: "🐘", level: 1, topic: "actions" },
    { en: "small", he: "קטן", hint: "Not big", emoji: "🐜", level: 1, topic: "actions" },
    { en: "friend", he: "חבר", hint: "Someone you like", emoji: "👫", level: 1, topic: "family" },
    { en: "school", he: "בית ספר", hint: "Where students learn", emoji: "🏫", level: 1, topic: "school" },
    { en: "eat", he: "לאכול", hint: "What you do with food", emoji: "🍽️", level: 2, topic: "food" },
    { en: "sleep", he: "לישון", hint: "What you do at night", emoji: "😴", level: 2, topic: "actions" },
    { en: "run", he: "לרוץ", hint: "Move fast on foot", emoji: "🏃", level: 2, topic: "actions" },
    { en: "sun", he: "שמש", hint: "Bright in the sky", emoji: "☀️", level: 2, topic: "nature" },
    { en: "rain", he: "גשם", hint: "Water from clouds", emoji: "🌧️", level: 2, topic: "nature" },
    { en: "family", he: "משפחה", hint: "Parents and siblings", emoji: "👨‍👩‍👧", level: 2, topic: "family" },
    { en: "teacher", he: "מורה", hint: "Teaches students", emoji: "👩‍🏫", level: 2, topic: "school" },
    { en: "student", he: "תלמיד", hint: "Learns at school", emoji: "🧑‍🎓", level: 2, topic: "school" },
    { en: "learn", he: "ללמוד", hint: "What we do in class", emoji: "📖", level: 2, topic: "school" },
    { en: "write", he: "לכתוב", hint: "Use a pen", emoji: "✏️", level: 2, topic: "school" },
    { en: "read", he: "לקרוא", hint: "Look at words in a book", emoji: "📕", level: 2, topic: "school" },
    { en: "beautiful", he: "יפה", hint: "Very pretty", emoji: "✨", level: 3, topic: "actions" },
    { en: "quickly", he: "מהר", hint: "In a fast way", emoji: "⚡", level: 3, topic: "actions" },
  ];

  const math = [
    { en: "5 + 3", he: "8", hint: "חיבור", emoji: "➕", level: 1, topic: "addition" },
    { en: "9 + 6", he: "15", hint: "חיבור", emoji: "➕", level: 1, topic: "addition" },
    { en: "12 − 4", he: "8", hint: "חיסור", emoji: "➖", level: 1, topic: "subtraction" },
    { en: "20 − 7", he: "13", hint: "חיסור", emoji: "➖", level: 1, topic: "subtraction" },
    { en: "6 × 7", he: "42", hint: "כפל", emoji: "✖️", level: 2, topic: "multiplication" },
    { en: "8 × 4", he: "32", hint: "כפל", emoji: "✖️", level: 2, topic: "multiplication" },
    { en: "56 ÷ 8", he: "7", hint: "חילוק", emoji: "➗", level: 2, topic: "division" },
    { en: "45 ÷ 9", he: "5", hint: "חילוק", emoji: "➗", level: 2, topic: "division" },
    { en: "7 × 8", he: "56", hint: "כפל", emoji: "✖️", level: 2, topic: "multiplication" },
    { en: "15 + 25", he: "40", hint: "חיבור", emoji: "➕", level: 2, topic: "addition" },
    { en: "100 − 37", he: "63", hint: "חיסור", emoji: "➖", level: 2, topic: "subtraction" },
    { en: "11 × 11", he: "121", hint: "כפל", emoji: "✖️", level: 3, topic: "multiplication" },
    { en: "72 ÷ 6", he: "12", hint: "חילוק", emoji: "➗", level: 3, topic: "division" },
    { en: "3²", he: "9", hint: "חזקה", emoji: "²", level: 3, topic: "advanced" },
    { en: "√16", he: "4", hint: "שורש", emoji: "√", level: 3, topic: "advanced" },
    { en: "50% מ-80", he: "40", hint: "אחוזים", emoji: "%", level: 3, topic: "advanced" },
    { en: "¼ + ¼", he: "½", hint: "שברים", emoji: "¼", level: 3, topic: "advanced" },
    { en: "144 ÷ 12", he: "12", hint: "חילוק", emoji: "➗", level: 3, topic: "division" },
    { en: "25 + 18", he: "43", hint: "חיבור", emoji: "➕", level: 3, topic: "addition" },
    { en: "90 − 45", he: "45", hint: "חיסור", emoji: "➖", level: 3, topic: "subtraction" },
  ];

  const lifeskills = [
    { en: "האזנה פעילה", he: "להקשיב תוך הבנת הדובר", hint: "מה זה האזנה פעילה?", emoji: "🌱", level: 1, topic: "communication" },
    { en: "תקשורת בלתי מילולית", he: "שפת גוף ומבט", hint: "איך מעבירים מסר בלי מילים?", emoji: "🌱", level: 1, topic: "communication" },
    { en: "אמפתיה", he: "הבנת רגשות האחר", hint: "מה זה אמפתיה?", emoji: "🌱", level: 1, topic: "emotions" },
    { en: "כבוד הדדי", he: "התייחסות מכבדת לאחרים", hint: "מה זה כבוד הדדי?", emoji: "🌱", level: 1, topic: "social" },
    { en: "בטיחות בדרכים", he: "חצייה בצומת ושימוש במעבר חצייה", hint: "איך חוצים כביש בבטחה?", emoji: "🌱", level: 1, topic: "safety" },
    { en: "תזונה מאוזנת", he: "ארוחה עם ירקות, חלבונים ופחמימות", hint: "מהי ארוחה בריאה?", emoji: "🌱", level: 1, topic: "health" },
    { en: "תקציב", he: "תוכנית לניהול הכנסות והוצאות", hint: "מה זה תקציב?", emoji: "🌱", level: 2, topic: "money" },
    { en: "חיסכון", he: "הפרשת כסף לעתיד", hint: "מה זה חיסכון?", emoji: "🌱", level: 2, topic: "money" },
    { en: "ניהול זמן", he: "תכנון משימות לפי סדר עדיפויות", hint: "איך מנהלים זמן?", emoji: "🌱", level: 2, topic: "planning" },
    { en: "קבלת החלטות", he: "בחירה מושכלת בין אפשרויות", hint: "מה זה קבלת החלטות?", emoji: "🌱", level: 2, topic: "thinking" },
    { en: "פתרון בעיות", he: "זיהוי בעיה וחיפוש פתרון", hint: "איך פותרים בעיה?", emoji: "🌱", level: 2, topic: "thinking" },
    { en: "עבודת צוות", he: "שיתוף פעולה להשגת מטרה משותפת", hint: "מה זה עבודת צוות?", emoji: "🌱", level: 2, topic: "social" },
    { en: "ויסות רגשות", he: "ניהול תגובות רגשיות", hint: "מה זה ויסות רגשות?", emoji: "🌱", level: 3, topic: "emotions" },
    { en: "התמודדות עם לחץ", he: "שימוש בטכניקות הרגעה", hint: "איך מתמודדים עם לחץ?", emoji: "🌱", level: 3, topic: "emotions" },
    { en: "צרכנות נבונה", he: "השוואת מחירים לפני קנייה", hint: "מה זה צרכנות נבונה?", emoji: "🌱", level: 3, topic: "money" },
    { en: "בטיחות באינטרנט", he: "שמירה על פרטיות וזהירות ברשת", hint: "איך נשארים בטוחים ברשת?", emoji: "🌱", level: 3, topic: "safety" },
  ];

  const science = [
    { en: "H2O", he: "מים", hint: "מה ההגדרה של H2O?", emoji: "🔬", level: 1, topic: "matter" },
    { en: "O2", he: "חמצן", hint: "מה אנחנו נושמים?", emoji: "🔬", level: 1, topic: "matter" },
    { en: "אטום", he: "יחידת החומר", hint: "מהו היחידה הקטנה ביותר?", emoji: "🔬", level: 1, topic: "atoms" },
    { en: "מוצק", he: "מצב קשה", hint: "מצב צבירה אחד", emoji: "🔬", level: 1, topic: "matter" },
    { en: "נוזל", he: "מצב זורם", hint: "מצב צבירה שני", emoji: "🔬", level: 1, topic: "matter" },
    { en: "גז", he: "מצב מרחף", hint: "מצב צבירה שלישי", emoji: "🔬", level: 1, topic: "matter" },
    { en: "CO2", he: "פחמן דו-חמצני", hint: "מה אנחנו נושפים?", emoji: "🔬", level: 2, topic: "matter" },
    { en: "מולקולה", he: "שני אטומים ומעלה", hint: "מהו קשר של אטומים?", emoji: "🔬", level: 2, topic: "atoms" },
    { en: "צמח", he: "יצור ירוק", hint: "מי מבצע פוטוסינתזה?", emoji: "🔬", level: 2, topic: "life" },
    { en: "שמש", he: "מקור האור", hint: "מקור האנרגיה לצמחים", emoji: "🔬", level: 2, topic: "life" },
    { en: "כוח", he: "דחף או משיכה", hint: "מה גורם לתנועה?", emoji: "🔬", level: 2, topic: "forces" },
    { en: "אנרגיה", he: "יכולת לבצע עבודה", hint: "מה נמדד בג׳אול?", emoji: "🔬", level: 2, topic: "forces" },
    { en: "DNA", he: "חומר תורשתי", hint: "מה מעביר תכונות?", emoji: "🔬", level: 3, topic: "life" },
    { en: "אלקטרון", he: "מטען שלילי", hint: "חלקיק במעטפת האטום", emoji: "🔬", level: 3, topic: "atoms" },
    { en: "פרוטון", he: "מטען חיובי", hint: "חלקיק בגרעין", emoji: "🔬", level: 3, topic: "atoms" },
    { en: "כבידה", he: "כוח משיכה", hint: "מה מושך אותנו למטה?", emoji: "🔬", level: 3, topic: "forces" },
  ];

  const TOPICS = {
    english: [
      { id: "all", label: "הכל — מילים מעורבות" },
      { id: "animals", label: "חיות — Animals" },
      { id: "food", label: "אוכל — Food" },
      { id: "school", label: "לימודים — School" },
      { id: "nature", label: "טבע — Nature" },
      { id: "family", label: "משפחה — Family" },
      { id: "actions", label: "פעלים ותארים — Verbs" },
    ],
    math: [
      { id: "all", label: "הכל — תרגילים מעורבים" },
      { id: "addition", label: "חיבור" },
      { id: "subtraction", label: "חיסור" },
      { id: "multiplication", label: "כפל" },
      { id: "division", label: "חילוק" },
      { id: "advanced", label: "מתקדם — שברים ואחוזים" },
    ],
    lifeskills: [
      { id: "all", label: "הכל — מושגים מעורבים" },
      { id: "communication", label: "תקשורת" },
      { id: "emotions", label: "רגשות והתמודדות" },
      { id: "social", label: "חברה ושיתוף פעולה" },
      { id: "money", label: "כסף וכלכלה" },
      { id: "health", label: "בריאות ותזונה" },
      { id: "safety", label: "בטיחות" },
      { id: "planning", label: "תכנון וניהול זמן" },
      { id: "thinking", label: "חשיבה ופתרון בעיות" },
    ],
    science: [
      { id: "all", label: "הכל — מושגים מעורבים" },
      { id: "matter", label: "חומר ומצבי צבירה" },
      { id: "atoms", label: "אטומים ומולקולות" },
      { id: "life", label: "חיים וצמחים" },
      { id: "forces", label: "כוח ואנרגיה" },
    ],
  };

  const englishSentences = [
    { words: ["I", "love", "English"], he: "אני אוהב אנגלית", level: 1 },
    { words: ["The", "cat", "is", "sleeping"], he: "החתול ישן", level: 1 },
    { words: ["My", "friend", "is", "happy"], he: "החבר שלי שמח", level: 2 },
    { words: ["She", "reads", "a", "book"], he: "היא קוראת ספר", level: 2 },
    { words: ["We", "go", "to", "school"], he: "אנחנו הולכים לבית ספר", level: 2 },
    { words: ["It", "is", "raining", "today"], he: "יורד גשם היום", level: 3 },
    { words: ["Please", "drink", "water"], he: "בבקשה שתו מים", level: 3 },
    { words: ["The", "sun", "is", "big"], he: "השמש גדולה", level: 3 },
  ];

  const LEVELS = [
    { id: "easy", label: "קל — בסיסי", max: 1 },
    { id: "medium", label: "בינוני", max: 2 },
    { id: "hard", label: "קשה — מתקדם", max: 3 },
  ];

  const DATASETS = { english, math, lifeskills, science };

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function getTopics(subject) {
    return TOPICS[subject] || TOPICS.english;
  }

  function topicLabel(subject, topicId) {
    return getTopics(subject).find((t) => t.id === topicId)?.label || topicId;
  }

  function getPool(subject, levelId, topicId) {
    const maxLevel = LEVELS.find((l) => l.id === levelId)?.max || 3;
    const base = DATASETS[subject] || english;
    let pool = base.filter((item) => (item.level || 1) <= maxLevel);
    if (topicId && topicId !== "all") {
      const filtered = pool.filter((item) => item.topic === topicId);
      if (filtered.length >= 4) pool = filtered;
    }
    if (pool.length < 4) pool = base.filter((item) => (item.level || 1) <= maxLevel);
    if (pool.length < 4) pool = base;
    return pool;
  }

  function getSentences(subject, levelId) {
    if (subject !== "english") return [];
    const maxLevel = LEVELS.find((l) => l.id === levelId)?.max || 3;
    return englishSentences.filter((s) => (s.level || 1) <= maxLevel);
  }

  function buildGameData(subject, levelId, topicId) {
    const vocab = getPool(subject, levelId, topicId);
    const sentences = getSentences(subject, levelId);

    return {
      VOCAB: vocab,
      SENTENCES: sentences.length ? sentences : englishSentences.slice(0, 4),
      shuffle,
      pick(n, exclude = []) {
        const ex = new Set(exclude);
        const pool = this.VOCAB.filter((v) => !ex.has(v.en));
        return shuffle(pool).slice(0, n);
      },
      one(exclude = []) {
        return this.pick(1, exclude)[0];
      },
      quizQuestion() {
        const correct = this.one();
        const wrong = this.pick(3, [correct.en]);
        return {
          word: correct.en,
          hint: correct.hint,
          he: correct.he,
          correct: correct.he,
          options: shuffle([correct.he, ...wrong.map((w) => w.he)]),
        };
      },
    };
  }

  function levelLabel(levelId) {
    return LEVELS.find((l) => l.id === levelId)?.label || levelId;
  }

  function launchPlay({ subject, gameId, level, topic, gameTitle }) {
    if (window.PleyiPremium?.isPremiumGame?.(gameId) && !window.PleyiPremium.canPlayGame(gameId)) {
      window.PleyiPremium.openModal(gameId);
      return;
    }

    const vocab = getPool(subject, level, topic || "all");
    const subjects = window.GAMES_CATALOG?.subjects || {};
    const subjectLabel = subjects[subject] || subject;
    const topicText = topic && topic !== "all" ? topicLabel(subject, topic) : "";
    const title = `${gameTitle || gameId} — ${subjectLabel}${topicText ? ` · ${topicText.split("—")[0].trim()}` : ""}`;

    sessionStorage.setItem(
      "gameclass-custom",
      JSON.stringify({
        subject,
        gameId,
        vocab,
        level,
        topic: topic || "all",
        title,
        isPreset: true,
      })
    );
    let roomQ = "";
    try {
      const host = JSON.parse(sessionStorage.getItem("gameclass-host") || "null");
      if (host?.code) roomQ = `?room=${encodeURIComponent(host.code)}`;
    } catch {
      /* ignore */
    }
    window.location.assign(`/play/${gameId}${roomQ}`);
  }

  window.GAME_CONTENT = {
    LEVELS,
    TOPICS,
    getTopics,
    topicLabel,
    getPool,
    buildGameData,
    levelLabel,
    launchPlay,
  };
})();
