/* Shared vocabulary — used by solo play & server */
window.VOCAB_DATA = {
  VOCAB: [
    { en: "apple", he: "תפוח", hint: "A red or green fruit", emoji: "🍎" },
    { en: "book", he: "ספר", hint: "You read it", emoji: "📚" },
    { en: "house", he: "בית", hint: "Where you live", emoji: "🏠" },
    { en: "water", he: "מים", hint: "You drink it every day", emoji: "💧" },
    { en: "friend", he: "חבר", hint: "Someone you like", emoji: "👫" },
    { en: "school", he: "בית ספר", hint: "Where students learn", emoji: "🏫" },
    { en: "happy", he: "שמח", hint: "Feeling good", emoji: "😊" },
    { en: "run", he: "לרוץ", hint: "Move fast on foot", emoji: "🏃" },
    { en: "blue", he: "כחול", hint: "Color of the sky", emoji: "🔵" },
    { en: "cat", he: "חתול", hint: "Meow!", emoji: "🐱" },
    { en: "dog", he: "כלב", hint: "Woof!", emoji: "🐶" },
    { en: "eat", he: "לאכול", hint: "What you do with food", emoji: "🍽️" },
    { en: "sleep", he: "לישון", hint: "What you do at night", emoji: "😴" },
    { en: "big", he: "גדול", hint: "Not small", emoji: "🐘" },
    { en: "small", he: "קטן", hint: "Not big", emoji: "🐜" },
    { en: "learn", he: "ללמוד", hint: "What we do in class", emoji: "📖" },
    { en: "write", he: "לכתוב", hint: "Use a pen", emoji: "✏️" },
    { en: "read", he: "לקרוא", hint: "Look at words in a book", emoji: "📕" },
    { en: "sun", he: "שמש", hint: "Bright in the sky", emoji: "☀️" },
    { en: "rain", he: "גשם", hint: "Water from clouds", emoji: "🌧️" },
    { en: "family", he: "משפחה", hint: "Parents and siblings", emoji: "👨‍👩‍👧" },
    { en: "teacher", he: "מורה", hint: "Teaches students", emoji: "👩‍🏫" },
    { en: "student", he: "תלמיד", hint: "Learns at school", emoji: "🧑‍🎓" },
    { en: "beautiful", he: "יפה", hint: "Very pretty", emoji: "✨" },
    { en: "quickly", he: "מהר", hint: "In a fast way", emoji: "⚡" },
  ],

  SENTENCES: [
    { words: ["I", "love", "English"], he: "אני אוהב אנגלית" },
    { words: ["She", "reads", "a", "book"], he: "היא קוראת ספר" },
    { words: ["We", "go", "to", "school"], he: "אנחנו הולכים לבית ספר" },
    { words: ["The", "cat", "is", "sleeping"], he: "החתול ישן" },
    { words: ["My", "friend", "is", "happy"], he: "החבר שלי שמח" },
    { words: ["It", "is", "raining", "today"], he: "יורד גשם היום" },
    { words: ["Please", "drink", "water"], he: "בבקשה שתו מים" },
    { words: ["The", "sun", "is", "big"], he: "השמש גדולה" },
  ],

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
