/* Pleyi — catalog by subject */

const SKILL_COLORS = {
  "זיכרון": "pink",
  "זוגות": "teal",
  "מהירות": "orange",
  "חידון": "purple",
  "תרגום": "blue",
  "אוצר מילים": "green",
  "פרימיום": "lime",
  "איות": "orange",
  "חשיבה": "purple",
  "כתיבה": "blue",
  "קשב": "lime",
  "השוואה": "teal",
  "אסטרטגיה": "green",
  "הבנה": "blue",
  "דקדוק": "purple",
  "משפטים": "pink",
  "חשבון": "orange",
  "אינטראקטיבי": "lime",
  "היגיון": "green",
  "פרשה": "pink",
  "מילים": "purple",
  "פסוקים": "teal",
  "מושגים": "green",
  "סיווג": "orange",
};

window.GAMES_CATALOG = {
  english: [
    { id: "tower-stack", title: "מגדל מילים", desc: "משחק arcade מלא — פיזיקה, חלקיקים, קוביות תלת-ממד וטיימר", icon: "🗼", color: "purple", tags: ["פרימיום", "אוצר מילים"] },
    { id: "word-runner", title: "רץ וקופץ", desc: "מסלול תלת-ממדי — רדפו מילים נכונות בקצב מהיר", icon: "🏃", color: "teal", tags: ["פרימיום", "מהירות"] },
    { id: "vocabulary-duel", title: "Duel מילים", desc: "מה התרגום? ענו מהר על 10 שאלות", icon: "⚔️", color: "yellow", tags: ["חידון", "תרגום"] },
    { id: "word-memory", title: "זיכרון מילים", desc: "התאימו זוגות en ↔ he", icon: "🧠", color: "pink", tags: ["זיכרון", "זוגות"] },
    { id: "hangman", title: "איש תלוי", desc: "נחשו את המילה לפני שנגמרו הניסיונות", icon: "🎯", color: "purple", tags: ["איות", "חשיבה"] },
    { id: "spelling-bee", title: "איות", desc: "כתבו את המילה באנגלית לפי הרמז", icon: "✏️", color: "teal", tags: ["כתיבה", "אוצר מילים"] },
    { id: "spot-diff", title: "מצא את ההבדלים", desc: "מצאו את הפריט השונה בין שני הלוחות", icon: "🔍", color: "yellow", tags: ["קשב", "השוואה"] },
    { id: "candy-match", title: "ממתקים Match 3", desc: "התאימו 3+ ממתקים מאותו צבע", icon: "🍬", color: "pink", tags: ["אסטרטגיה", "מהירות"] },
    { id: "word-shop", title: "חנות קטנה", desc: "שרתו לקוחות — מצאו את המוצר הנכון בזמן", icon: "🏪", color: "teal", tags: ["הבנה", "מהירות"] },
    { id: "sentence-scramble", title: "בניית משפט", desc: "סדרו מילים למשפט שלם באנגלית", icon: "📝", color: "purple", tags: ["דקדוק", "משפטים"] },
  ],
  math: [
    { id: "math-blitz", title: "ברק מתמטי", desc: "ארקייד canvas מלא — טיימר, חלקיקים, ואתגר מהירות", icon: "⚡", color: "yellow", tags: ["פרימיום", "חשבון"] },
    { id: "math-duel", title: "Duel מתמטי", desc: "מה התוצאה? ענו על 10 תרגילים", icon: "🔢", color: "teal", tags: ["חידון", "חשבון"] },
    { id: "math-memory", title: "זיכרון מספרים", desc: "התאימו תרגיל לתוצאה", icon: "🧩", color: "pink", tags: ["זיכרון", "חשבון"] },
    { id: "math-tower", title: "מגדל מספרים", desc: "קוביות עם תרגילים ותוצאות — בנו מגדל", icon: "🏗️", color: "purple", tags: ["חשבון", "אינטראקטיבי"] },
    { id: "math-runner", title: "רץ ומחשב", desc: "רדפו אחרי התשובה הנכונה בנתיבים", icon: "🎮", color: "teal", tags: ["מהירות", "חשבון"] },
    { id: "math-shop", title: "חנות מתמטית", desc: "מצאו את המוצר עם המחיר הנכון", icon: "🛒", color: "yellow", tags: ["חשבון", "היגיון"] },
  ],

  tanakh: [
    { id: "vocabulary-duel", title: "Duel מילים", desc: "מה הפירוש? ענו מהר על שאלות מהפרשה", icon: "", color: "yellow", tags: ["חידון", "אוצר מילים"] },
    { id: "word-memory", title: "זיכרון מילים", desc: "התאימו מילה בפרשה לפירוש שלה", icon: "", color: "pink", tags: ["זיכרון", "פרשה"] },
    { id: "hangman", title: "נחשו את המילה", desc: "נחשו מילה מהפרשה לפני שנגמרו הניסיונות", icon: "", color: "purple", tags: ["מילים", "חשיבה"] },
    { id: "sentence-scramble", title: "סדר פסוק", desc: "סדרו מילים לפסוק שלם", icon: "", color: "teal", tags: ["פסוקים", "הבנה"] },
    { id: "tower-stack", title: "מגדל מילים", desc: "בנו מגדל — בחרו את התרגום הנכון", icon: "", color: "purple", tags: ["אוצר מילים", "מהירות"] },
    { id: "spot-diff", title: "מצא את ההבדל", desc: "מצאו את המילה או הרעיון השונה", icon: "", color: "yellow", tags: ["קשב", "השוואה"] },
  ],

  science: [
    { id: "vocabulary-duel", title: "Duel מושגים", desc: "מה ההגדרה? ענו על מושגים מדעיים", icon: "", color: "yellow", tags: ["חידון", "מושגים"] },
    { id: "word-memory", title: "זיכרון מושגים", desc: "התאימו מושג להגדרה", icon: "", color: "pink", tags: ["זיכרון", "מושגים"] },
    { id: "math-blitz", title: "ברק מדעי", desc: "חישובים ונוסחאות בקצב מהיר", icon: "", color: "yellow", tags: ["חשבון", "מהירות"] },
    { id: "spot-diff", title: "השוואת תופעות", desc: "מצאו את ההבדל בין שני מצבים", icon: "", color: "teal", tags: ["קשב", "השוואה"] },
    { id: "word-runner", title: "רץ למושג", desc: "רדפו אחרי התשובה הנכונה בנתיב", icon: "", color: "teal", tags: ["מהירות", "מושגים"] },
    { id: "candy-match", title: "התאמת קטגוריות", desc: "התאימו פריטים מאותה קטגוריה מדעית", icon: "", color: "pink", tags: ["סיווג", "חשיבה"] },
  ],

  subjects: {
    english: "אנגלית",
    tanakh: "תנ״ך",
    math: "מתמטיקה",
    science: "מדעים",
  },

  subjectContent: {
    english: "אוצר מילים באנגלית — מילים, תרגום והגייה",
    tanakh: "מילים ומושגים מפרשות התנ״ך",
    math: "תרגילי חשבון, פעולות ופתרון בעיות",
    science: "מושגים מדעיים, הגדרות ומונחים",
  },

  gameMeta(game, subject) {
    return {
      about: this.gameSummary(game.desc),
      content: game.content || this.subjectContent[subject] || "",
      skills: game.skills || game.tags || [],
    };
  },

  skillColor(tag) {
    return SKILL_COLORS[tag] || "blue";
  },

  skillsForSubject(subject) {
    const set = new Set();
    for (const game of this[subject] || []) {
      for (const tag of game.tags || []) set.add(tag);
    }
    return [...set].sort((a, b) => a.localeCompare(b, "he"));
  },

  gameSummary(desc) {
    if (!desc) return "";
    const line = desc.split(/[—–]/)[0].trim();
    return line.endsWith(".") ? line : `${line}.`;
  },

  allSubjects() {
    return ["english", "tanakh", "math", "science"];
  },

  allGamesList() {
    return this.allSubjects().flatMap((s) => this[s] || []);
  },

  compatibleRoomGames(items) {
    const roomGames = [
      "word-memory",
      "hangman",
      "spot-diff",
      "tower-stack",
      "word-shop",
    ];
    if (!items?.length) return roomGames;

    const n = items.length;
    const out = [];
    if (n >= 2) out.push("word-memory");
    if (n >= 1) out.push("hangman");
    if (n >= 3) out.push("spot-diff", "tower-stack", "word-shop");
    return out.filter((id) => roomGames.includes(id));
  },

  pickGameForContent(items, subject) {
    const n = items.length;
    if (subject === "math") {
      if (n >= 6) return "math-memory";
      if (n >= 4) return "math-duel";
      return "math-blitz";
    }
    if (n >= 6) return "word-memory";
    if (n >= 4) return "vocabulary-duel";
    if (n >= 3) return "tower-stack";
    return "vocabulary-duel";
  },

  parseContent(text, subject) {
    if (window.LEARNING_PARSE?.parseLearningContent) {
      return window.LEARNING_PARSE.parseLearningContent(text, subject || "english");
    }
    const lines = text
      .split(/\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    const items = [];

    for (const line of lines) {
      const sep = line.includes("=") ? "=" : line.includes(":") ? ":" : line.includes(" - ") ? " - " : null;
      if (!sep) continue;
      const [a, b] = line.split(sep).map((s) => s.trim());
      if (!a || !b) continue;
      if (subject === "math") {
        items.push({ en: a, he: b, hint: "פתרו את התרגיל", emoji: "🔢" });
      } else if (subject === "tanakh") {
        items.push({ en: a, he: b, hint: `מה פירוש ${a}?`, emoji: "📖" });
      } else if (subject === "science") {
        items.push({ en: a, he: b, hint: `מה ההגדרה של ${a}?`, emoji: "🔬" });
      } else {
        items.push({ en: a, he: b, hint: `What is ${a}?`, emoji: "📖" });
      }
    }
    return items;
  },
};
