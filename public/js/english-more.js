/* Learn English — more ways to practice every topic, on three levels.

   Every exercise gets a `level` unless it sets its own: 1 easy (recognize —
   pictures, matching, picking a word), 2 medium (work with sentences and
   spelling — true / false, find the mistake, build a sentence or a word),
   3 advanced (produce — type the answer, take dictation). english-learning.js
   groups a topic's exercises by level, and a right answer on a harder level
   earns more points (lib/student-progress.js keeps the same defaults).

   The new exercises are built from the content each topic already has, so
   nothing is written twice:
   - grammar topics: find-error (choice blanks filled with a wrong option, and
     true / false sentences whose fix changes one or two words),
     sentence-choice (the choice blanks as whole sentences), letters (one-word
     write answers as letter tiles), dictation (the order sentences).
   - topics with picture words (the vocabulary topics, and grammar topics
     like telling the time): true / false with pictures, translate (both
     ways), match English ↔ Hebrew, letters and dictation.
   Built exercises are marked `derived`: the server's "create new exercises"
   doesn't know them, so their results screen leaves that button out.

   New exercise types (rendered by english-learning.js):
   - find-error:      tap the wrong word. questions: [{ text, from, to, fix, full, hint?, context?, he? }]
                      Words from..to-1 of `text` (split on spaces) are wrong;
                      `fix` replaces them and `full` is the fixed sentence.
   - sentence-choice: pick the right sentence. questions: [{ options, answer, he?, context? }]
   - letters:         tap letter tiles to spell the answer. questions:
                      [{ text, hint?, answer, extra?, he? }] (extra: decoy
                      letters), or words: [vocab ids] for the word in a picture.
   - dictation:       hear it, type it. questions: [{ answer, he? }] or words: [vocab ids].
   - translate:       words: [vocab ids]; dir "en-he" (read the English word,
                      pick the Hebrew) or "he-en".
   truefalse questions may carry `img` and `word`: does the word fit the picture? */

(function () {
  const TOPICS = window.ENGLISH_TOPICS || [];
  const VOCAB = window.ENGLISH_VOCAB || {};

  const TYPE_LEVEL = {
    choice: 1,
    match: 1,
    picture: 1,
    "pick-picture": 1,
    translate: 1,
    listen: 2,
    truefalse: 2,
    order: 2,
    letters: 2,
    "find-error": 2,
    "sentence-choice": 2,
    write: 3,
    dictation: 3,
  };

  const WORD_TYPES = ["picture", "pick-picture", "listen", "write", "match"];
  // These pictures show a girl or a woman (the same list as english-games.js),
  // so exercises that show pictures leave them out.
  const NO_PICTURE = new Set(["mother", "sister", "grandmother", "family", "hair"]);
  const MIN_ITEMS = 6;

  // A whole-word blank ("I ___ happy."), not a missing letter ("___og").
  const WORD_BLANK = /(^|\s)___(?=[\s.,!?;:]|$)/;
  const END_PUNCT = /[.,!?;:]+$/;

  // Derived items are picked the same way on every visit, so their keys (and
  // with them the "seen" history) stay stable.
  function hash(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = (h * 33 + str.charCodeAt(i)) | 0;
    return h >>> 0;
  }

  function pick(list, seed) {
    return list[hash(seed) % list.length];
  }

  function uniqueBy(list, key) {
    const seen = new Set();
    return list.filter((item) => {
      const k = key(item);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }

  function fill(text, word) {
    return text.replace("___", word);
  }

  function own(topic, type) {
    return (topic.exercises || []).filter((ex) => ex.type === type && !ex.derived);
  }

  /* ── Grammar topics ── */

  // Choice questions with a whole-word blank, each with its options.
  function choiceItems(topic) {
    return own(topic, "choice")
      .filter((ex) => ex.questions)
      .flatMap((ex) => ex.questions.map((q) => ({ q, options: q.options || ex.options || [] })))
      .filter(({ q, options }) => WORD_BLANK.test(q.text) && options.length >= 2 && options.includes(q.answer));
  }

  // The blank filled with one of the wrong options.
  function errorFromChoice({ q, options }) {
    const tokens = q.text.split(" ");
    if (tokens.length < 3) return null;
    const wrong = pick(
      options.filter((o) => o !== q.answer),
      q.text
    );
    const at = tokens.findIndex((tk) => tk.includes("___"));
    const wrongTokens = tokens[at].replace("___", wrong).split(" ");
    return {
      text: [...tokens.slice(0, at), ...wrongTokens, ...tokens.slice(at + 1)].join(" "),
      from: at,
      to: at + wrongTokens.length,
      fix: q.answer.replace(END_PUNCT, ""),
      full: fill(q.text, q.answer),
      hint: q.hint,
      context: q.context,
      he: q.he,
    };
  }

  // A wrong true / false sentence whose fix swaps one or two words. Question —
  // answer pairs ("Who is …? — In April.") are left out: either half could be
  // the wrong one.
  function errorFromFix(q) {
    if (q.correct || !q.fix || q.img || q.text.includes(" — ")) return null;
    const a = q.text.split(" ");
    const b = q.fix.split(" ");
    if (a.length < 4) return null;
    let s = 0;
    while (s < a.length && s < b.length && a[s] === b[s]) s++;
    let e = 0;
    while (e < a.length - s && e < b.length - s && a[a.length - 1 - e] === b[b.length - 1 - e]) e++;
    const wrong = a.length - e - s;
    const right = b.length - e - s;
    if (wrong < 1 || wrong > 2 || right < 1 || right > 3) return null;
    return { text: q.text, from: s, to: s + wrong, fix: b.slice(s, s + right).join(" ").replace(END_PUNCT, ""), full: q.fix, he: q.he };
  }

  // The right sentence and up to three wrong ones. The Hebrew is the prompt
  // only when it translates the whole sentence (no ___ in it).
  function sentenceFromChoice({ q, options }) {
    const others = options.filter((o) => o !== q.answer);
    const start = hash(q.text) % others.length;
    const wrongs = [...others.slice(start), ...others.slice(0, start)].slice(0, 3);
    const answer = fill(q.text, q.answer);
    const sentences = [answer, ...wrongs.map((o) => fill(q.text, o))];
    // Four sentences have to fit a phone screen, a line each.
    if (sentences.some((s) => s.length > 48)) return null;
    return { answer, options: sentences, he: q.he && !q.he.includes("___") ? q.he : "", context: q.context, say: q.say };
  }

  const letterCount = (word) => word.replace(/[^A-Za-z]/g, "").length;

  // A few letters from another answer, so a short word isn't spelled just
  // by using up every tile (is / are, he / she).
  function decoys(answer, answers) {
    if (letterCount(answer) > 5) return [];
    const others = answers.filter((a) => a.toLowerCase() !== answer.toLowerCase());
    if (!others.length) return [];
    return [...pick(others, answer).replace(/[^A-Za-z]/g, "")].slice(0, 3);
  }

  function lettersFromWrite(topic) {
    return own(topic, "write")
      .filter((ex) => ex.questions)
      .flatMap((ex) => {
        const answers = [...new Set(ex.questions.map((q) => q.answer))];
        return ex.questions
          .filter((q) => /^[A-Za-z']+$/.test(q.answer) && letterCount(q.answer) >= 2 && letterCount(q.answer) <= 10)
          .map((q) => ({ text: q.text, hint: q.hint, answer: q.answer, he: q.he, extra: decoys(q.answer, answers) }));
      });
  }

  // Sentences a student can spell from hearing them: 2–8 words, at least one
  // real word (not "A B C D E"), and no names — a capital letter after the
  // first word other than "I" is a name, a day or a place. Each needs its
  // Hebrew, which is the prompt where the browser can't speak.
  function dictationFromOrder(topic) {
    return own(topic, "order")
      .flatMap((ex) => ex.questions)
      .filter((q) => {
        const tokens = q.answer.split(" ");
        return (
          tokens.length >= 2 &&
          tokens.length <= 8 &&
          tokens.some((tk) => letterCount(tk) >= 3) &&
          !tokens.slice(1).some((tk) => /^[A-Z]/.test(tk) && !/^I(?:'|’|$)/.test(tk))
        );
      })
      .filter((q) => q.he)
      .map((q) => ({ answer: q.answer, he: q.he }));
  }

  function grammarExercises(topic) {
    const list = [];
    const choices = choiceItems(topic);

    const errors = uniqueBy(
      [...choices.map(errorFromChoice), ...own(topic, "truefalse").flatMap((ex) => ex.questions.map(errorFromFix))].filter(Boolean),
      (q) => q.text
    );
    if (errors.length >= MIN_ITEMS) {
      list.push({
        id: `${topic.id}--find-error`,
        type: "find-error",
        title: "מצאו את הטעות",
        titleEn: "Find the mistake",
        instructions: "במשפט יש טעות אחת. לחצו על המילה שלא נכונה.",
        instructionsEn: "There is one mistake in the sentence. Click the wrong word.",
        roundSize: 8,
        questions: errors,
      });
    }

    const sentences = uniqueBy(choices.map(sentenceFromChoice).filter(Boolean), (q) => q.answer);
    if (sentences.length >= MIN_ITEMS) {
      list.push({
        id: `${topic.id}--sentence-choice`,
        type: "sentence-choice",
        title: "איזה משפט נכון?",
        titleEn: "Which sentence is right?",
        instructions: "בחרו את המשפט שכתוב נכון.",
        instructionsEn: "Choose the sentence that is written correctly.",
        roundSize: 8,
        questions: sentences,
      });
    }

    const letters = uniqueBy(lettersFromWrite(topic), (q) => `${q.text}|${q.answer}`);
    if (letters.length >= MIN_ITEMS) {
      list.push({
        id: `${topic.id}--letters`,
        type: "letters",
        title: "בונים מילה מאותיות",
        titleEn: "Build the word",
        instructions: "לחצו על האותיות לפי הסדר וכתבו את המילה החסרה. שימו לב — יש גם אותיות מיותרות!",
        instructionsEn: "Click the letters in order to spell the missing word. Careful — some letters are extra!",
        roundSize: 8,
        questions: letters,
      });
    }

    const dictation = uniqueBy(dictationFromOrder(topic), (q) => q.answer);
    if (dictation.length >= MIN_ITEMS) {
      list.push({
        id: `${topic.id}--dictation`,
        type: "dictation",
        speech: true,
        title: "הכתבה: שומעים וכותבים",
        titleEn: "Dictation",
        instructions: "הקשיבו למשפט וכתבו אותו באנגלית.",
        instructionsEn: "Listen to the sentence and type it in English.",
        roundSize: 6,
        questions: dictation,
      });
    }
    return list;
  }

  /* ── Picture-vocabulary topics ── */

  function topicWords(topic) {
    const ids = new Set();
    (topic.exercises || []).forEach((ex) => {
      if (WORD_TYPES.includes(ex.type) && !ex.derived) (ex.words || []).forEach((id) => ids.add(id));
    });
    return [...ids].filter((id) => VOCAB[id]);
  }

  // Every word twice: once with its own name (true) and once with another
  // word's (false, fixed to its own).
  function pictureTrueFalse(words) {
    return words.flatMap((id) => {
      const other = pick(
        words.filter((w) => w !== id && VOCAB[w].en !== VOCAB[id].en),
        id
      );
      const img = `/images/english/vocab/${VOCAB[id].img || id}.svg`;
      return [
        { text: VOCAB[id].en, correct: true, img, word: id },
        { text: VOCAB[other].en, correct: false, fix: VOCAB[id].en, img, word: id },
      ];
    });
  }

  function vocabExercises(topic) {
    const all = topicWords(topic);
    if (all.length < MIN_ITEMS) return [];
    const pictured = all.filter((id) => !NO_PICTURE.has(id));
    const spellable = pictured.filter((id) => /^[A-Za-z' -]+$/.test(VOCAB[id].en) && letterCount(VOCAB[id].en) >= 2 && letterCount(VOCAB[id].en) <= 10);
    const list = [];
    const roundOf = (n) => Math.min(10, n);

    if (pictured.length >= MIN_ITEMS) {
      list.push({
        id: `${topic.id}--pic-truefalse`,
        type: "truefalse",
        level: 1,
        title: "מתאים לתמונה?",
        titleEn: "Does it fit the picture?",
        instructions: "האם המילה מתאימה לתמונה? לחצו על „נכון” או על „לא נכון”.",
        instructionsEn: "Does the word match the picture? Click \"True\" or \"False\".",
        roundSize: 10,
        questions: pictureTrueFalse(pictured),
      });
    }
    list.push(
      {
        id: `${topic.id}--translate-en-he`,
        type: "translate",
        dir: "en-he",
        level: 1,
        title: "מה זה בעברית?",
        titleEn: "What is it in Hebrew?",
        instructions: "קראו את המילה באנגלית ובחרו את התרגום שלה לעברית.",
        instructionsEn: "Read the English word and choose its Hebrew translation.",
        roundSize: roundOf(all.length),
        words: all,
      },
      {
        id: `${topic.id}--match-he`,
        type: "match",
        level: 1,
        title: "התאמה: אנגלית ועברית",
        titleEn: "Match: English and Hebrew",
        instructions: "חברו כל מילה באנגלית לתרגום שלה בעברית.",
        instructionsEn: "Match each English word to its Hebrew translation.",
        boardSize: 6,
        pairs: uniqueBy(all, (id) => VOCAB[id].en).map((id) => ({ a: VOCAB[id].en, b: VOCAB[id].he })),
      },
      {
        id: `${topic.id}--translate-he-en`,
        type: "translate",
        dir: "he-en",
        level: 2,
        title: "איך אומרים באנגלית?",
        titleEn: "How do you say it in English?",
        instructions: "קראו את המילה בעברית ובחרו איך אומרים אותה באנגלית.",
        instructionsEn: "Read the Hebrew word and choose how to say it in English.",
        roundSize: roundOf(all.length),
        words: all,
      }
    );
    if (spellable.length >= MIN_ITEMS) {
      list.push({
        id: `${topic.id}--letters`,
        type: "letters",
        title: "בונים את המילה",
        titleEn: "Spell the word",
        instructions: "לחצו על האותיות לפי הסדר וכתבו באנגלית את המילה שבתמונה.",
        instructionsEn: "Click the letters in order to spell the word in the picture.",
        roundSize: roundOf(spellable.length),
        words: spellable,
      });
    }
    if (pictured.length >= MIN_ITEMS) {
      list.push({
        id: `${topic.id}--dictation`,
        type: "dictation",
        speech: true,
        title: "הכתבה: שומעים וכותבים",
        titleEn: "Dictation",
        instructions: "הקשיבו למילה וכתבו אותה באנגלית.",
        instructionsEn: "Listen to the word and type it in English.",
        roundSize: roundOf(pictured.length),
        words: pictured,
      });
    }
    return list;
  }

  TOPICS.forEach((topic) => {
    if (!topic.exercises || topic.group === "reading") return;
    // Any topic with enough picture words gets the vocabulary exercises too.
    const extra = [...grammarExercises(topic), ...vocabExercises(topic)];
    // A topic's own exercise with the same id wins.
    const taken = new Set(topic.exercises.map((ex) => ex.id));
    extra.forEach((ex) => {
      if (taken.has(ex.id)) return;
      taken.add(ex.id);
      topic.exercises.push({ ...ex, derived: true });
    });
    topic.exercises.forEach((ex) => {
      if (ex.type !== "reading" && !ex.level) ex.level = TYPE_LEVEL[ex.type] || 1;
    });
  });

  window.ENGLISH_TYPE_LEVEL = TYPE_LEVEL;
})();
