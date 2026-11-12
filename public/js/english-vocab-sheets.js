/* Learn English — a printable sheet for every vocabulary topic, built from
   the topic's own words (english-vocab.js) and added to ENGLISH_PRINTABLES
   (english-printables.js), so it prints like the written packs. Loaded after
   english-data.js.

   The sheet: name the pictures (with the words in the "Remember!" box as a
   word bank), translate words into English, and build words from letters.
   The same words come out on every visit (picked by a hash), so a printed
   copy and its answer key always match. Girls' and women's words and
   pictures stay out. */

(function () {
  const PACKS = window.ENGLISH_PRINTABLES;
  const VOCAB = window.ENGLISH_VOCAB || {};
  if (!PACKS) return;

  const LEAVE_OUT = new Set(["mother", "sister", "grandmother", "family", "hair", "dress", "skirt"]);
  const PICTURES = 6;
  const TRANSLATE = 4;
  const LETTERS = 3;

  function hash(str) {
    let h = 2166136261;
    for (const ch of String(str)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
    return h;
  }

  function mixed(list, seed) {
    const out = [...list].sort((a, b) => hash(seed + a) - hash(seed + b));
    // Never the word itself already in order.
    if (out.length > 1 && out.join("") === list.join("")) out.push(out.shift());
    return out;
  }

  function topicWords(topic) {
    const ids = new Set();
    (topic.exercises || []).forEach((ex) => (ex.words || []).forEach((id) => ids.add(id)));
    return [...ids].filter((id) => VOCAB[id] && !LEAVE_OUT.has(id));
  }

  function build(topic) {
    const words = mixed(topicWords(topic), topic.id).map((id) => ({ id, en: VOCAB[id].en, he: VOCAB[id].he, img: VOCAB[id].img || id }));
    if (words.length < 4) return null;
    const pictures = words.slice(0, PICTURES);
    const rest = words.slice(PICTURES);
    const translate = (rest.length >= 2 ? rest : words).slice(0, TRANSLATE);
    const spellable = words.filter((w) => /^[a-z]{3,7}$/i.test(w.en));
    const letters = [...spellable.filter((w) => !pictures.includes(w)), ...spellable.filter((w) => pictures.includes(w))].slice(0, LETTERS);
    // Three picture cards to a row only fit short words.
    const long = pictures.some((w) => w.en.length > 6);
    const tasks = [
      {
        type: "fill",
        instructions: "הסתכלו וכתבו את המילה באנגלית.",
        instructionsEn: "Look and write the word.",
        cols: long ? 2 : 3,
        items: pictures.map((w) => ({ img: w.img, text: "___", answer: w.en })),
      },
      {
        type: "rewrite",
        instructions: "תרגמו לאנגלית.",
        instructionsEn: "Translate into English.",
        items: translate.map((w) => ({ text: w.he, answer: w.en })),
      },
    ];
    if (letters.length) {
      tasks.push({
        type: "order",
        instructions: "סדרו את האותיות למילה.",
        instructionsEn: "Put the letters in order.",
        items: letters.map((w) => ({ words: mixed([...w.en.toLowerCase()], w.id), answer: w.en.toLowerCase() })),
      });
    }
    return {
      sheets: [
        {
          id: "words",
          title: topic.title,
          titleEn: topic.titleEn || topic.title,
          remember: {
            note: "מחסן מילים — בחרו מכאן:",
            noteEn: "Word bank — choose from here:",
            chips: mixed(pictures.map((w) => w.en), `${topic.id}/bank`),
          },
          tasks,
        },
      ],
    };
  }

  (window.ENGLISH_TOPICS || []).forEach((topic) => {
    if ((topic.group !== "vocab" && topic.id !== "vocabulary") || PACKS[topic.id]) return;
    const pack = build(topic);
    if (pack) PACKS[topic.id] = pack;
  });
})();
