/* Math vocabulary — same shape as VOCAB_DATA for game engines */

window.MATH_DATA = {
  VOCAB: [
    { en: "5 + 3", he: "8", hint: "חיבור", emoji: "➕" },
    { en: "12 − 4", he: "8", hint: "חיסור", emoji: "➖" },
    { en: "6 × 7", he: "42", hint: "כפל", emoji: "✖️" },
    { en: "56 ÷ 8", he: "7", hint: "חילוק", emoji: "➗" },
    { en: "9 + 6", he: "15", hint: "חיבור", emoji: "➕" },
    { en: "20 − 7", he: "13", hint: "חיסור", emoji: "➖" },
    { en: "8 × 4", he: "32", hint: "כפל", emoji: "✖️" },
    { en: "45 ÷ 9", he: "5", hint: "חילוק", emoji: "➗" },
    { en: "15 + 25", he: "40", hint: "חיבור", emoji: "➕" },
    { en: "100 − 37", he: "63", hint: "חיסור", emoji: "➖" },
    { en: "11 × 11", he: "121", hint: "כפל", emoji: "✖️" },
    { en: "72 ÷ 6", he: "12", hint: "חילוק", emoji: "➗" },
    { en: "3²", he: "9", hint: "חזקה", emoji: "²" },
    { en: "√16", he: "4", hint: "שורש", emoji: "√" },
    { en: "50% מ-80", he: "40", hint: "אחוזים", emoji: "%" },
    { en: "¼ + ¼", he: "½", hint: "שברים", emoji: "¼" },
    { en: "7 × 8", he: "56", hint: "כפל", emoji: "✖️" },
    { en: "144 ÷ 12", he: "12", hint: "חילוק", emoji: "➗" },
    { en: "25 + 18", he: "43", hint: "חיבור", emoji: "➕" },
    { en: "90 − 45", he: "45", hint: "חיסור", emoji: "➖" },
  ],

  SENTENCES: [],

  shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },

  pick(n, exclude = []) {
    const ex = new Set(exclude);
    const pool = this.VOCAB.filter((v) => !ex.has(v.en));
    return this.shuffle(pool).slice(0, n);
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
      options: this.shuffle([correct.he, ...wrong.map((w) => w.he)]),
    };
  },
};
