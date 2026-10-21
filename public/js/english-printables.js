/* Learn English — printable worksheets, one pack per topic (keyed by topic id).

   Rendered as A4 pages by english-worksheet.js (/services/english-worksheet
   ?topic=<id>&sheet=<id>) and listed on the topic page by english-learning.js.
   The content is new practice, not a copy of the online exercises. Keep it
   free of girls and romance: boys, men, animals and objects only — "she" only
   where the grammar rule itself lists it. Each sheet must fit one A4 page.

   Pack:  { sheets: [sheet] }
   Sheet: { id, title, titleEn, remember?, tasks }
   - remember: the rule box under the header.
       { note, noteEn, chips: ["I → am", ...] }
   - title / instructions are Hebrew, *En English (the Hebrew line is shown
     under the English one when the site is in Hebrew).

   Task types (every task: type, instructions, instructionsEn, items):
   - circle:  circle the right word.  options: [...] for every item, or
              per-item `options`.   items: [{ text: "I ___ ten.", answer }]
   - fill:    write in the blank.   items: [{ text, answer, img?, example? }]
              cols: items per row. `img` (a vocab picture id) turns the
              items into picture cards.
   - rewrite: rewrite the sentence on the line next to it.
              items: [{ text, answer, alt? }] — `alt` is another accepted
              answer, shown small in the answer key. A Hebrew `text` is a
              translation task. example: { text, answer } is shown solved.
   - order:   put the words in order. items: [{ words: [...], answer }]
              The words are listed already mixed, so every printed copy
              (and the answer key) shows the same order.
   - about:   sentence starters about yourself. items: [{ text, sample }] —
              the sample answer is shown in the answer key.
   An item with `example: true` is printed already solved. */

window.ENGLISH_PRINTABLES = {
  tobe: {
    sheets: [
      {
        id: "forms",
        title: "am, is, are",
        titleEn: "am, is, are",
        remember: {
          note: "בוחרים את הצורה לפי מי שמדברים עליו:",
          noteEn: "Choose the form by who the sentence is about:",
          chips: ["I → am", "he, she, it → is", "you, we, they → are"],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            options: ["am", "is", "are"],
            items: [
              { text: "I ___ a student.", answer: "am" },
              { text: "My brother ___ nine years old.", answer: "is" },
              { text: "We ___ at school.", answer: "are" },
              { text: "The dog ___ hungry.", answer: "is" },
              { text: "Tom and Ben ___ in the garden.", answer: "are" },
              { text: "You ___ my best friend.", answer: "are" },
            ],
          },
          {
            type: "fill",
            instructions: "הסתכלו וכתבו am, is או are.",
            instructionsEn: "Look and write am, is or are.",
            cols: 2,
            items: [
              { img: "happy", text: "I ___ happy.", answer: "am" },
              { img: "father", text: "He ___ my dad.", answer: "is" },
              { img: "brother", text: "You ___ my brother.", answer: "are" },
              { img: "cat", text: "It ___ a cat.", answer: "is" },
            ],
          },
          {
            type: "fill",
            instructions: "כתבו את הקיצור.",
            instructionsEn: "Write the short form.",
            cols: 2,
            items: [
              { text: "I am = ___", answer: "I'm", example: true },
              { text: "you are = ___", answer: "you're" },
              { text: "he is = ___", answer: "he's" },
              { text: "it is = ___", answer: "it's" },
              { text: "we are = ___", answer: "we're" },
              { text: "they are = ___", answer: "they're" },
            ],
          },
        ],
      },

      {
        id: "negative",
        title: "שלילה",
        titleEn: "Negatives",
        remember: {
          note: "כדי לשלול, מוסיפים not אחרי am / is / are.",
          noteEn: "To make a negative, add not after am / is / are.",
          chips: ["I am not → I'm not", "is not → isn't", "are not → aren't"],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            options: ["am not", "isn't", "aren't"],
            items: [
              { text: "I ___ hungry.", answer: "am not" },
              { text: "The cat ___ black.", answer: "isn't" },
              { text: "My friends ___ at home.", answer: "aren't" },
              { text: "We ___ late.", answer: "aren't" },
            ],
          },
          {
            type: "fill",
            instructions: "הסתכלו וכתבו is או isn't.",
            instructionsEn: "Look and write is or isn't.",
            cols: 2,
            items: [
              { img: "dog", text: "It ___ a cat.", answer: "isn't" },
              { img: "apple", text: "It ___ an apple.", answer: "is" },
              { img: "elephant", text: "It ___ small.", answer: "isn't" },
              { img: "lion", text: "It ___ a lion.", answer: "is" },
            ],
          },
          {
            type: "rewrite",
            instructions: "כתבו את המשפט בשלילה.",
            instructionsEn: "Write the sentence in the negative.",
            example: { text: "I am hungry.", answer: "I am not hungry." },
            items: [
              { text: "He is at home.", answer: "He isn't at home." },
              { text: "They are my cousins.", answer: "They aren't my cousins." },
              { text: "The water is cold.", answer: "The water isn't cold." },
              { text: "I am ten years old.", answer: "I'm not ten years old." },
            ],
          },
        ],
      },

      {
        id: "questions",
        title: "שאלות",
        titleEn: "Questions",
        remember: {
          note: "בשאלה, am / is / are עוברים להתחלה.",
          noteEn: "In a question, am / is / are moves to the start.",
          chips: ["You are ready. → Are you ready?", "He is happy. → Is he happy?"],
        },
        tasks: [
          {
            type: "fill",
            instructions: "השלימו Am, Is או Are.",
            instructionsEn: "Write Am, Is or Are.",
            cols: 2,
            items: [
              { text: "___ you ready?", answer: "Are" },
              { text: "___ he your teacher?", answer: "Is" },
              { text: "___ I late?", answer: "Am" },
              { text: "___ they your friends?", answer: "Are" },
              { text: "___ it cold today?", answer: "Is" },
              { text: "___ the books on the table?", answer: "Are" },
            ],
          },
          {
            type: "rewrite",
            instructions: "הפכו את המשפט לשאלה.",
            instructionsEn: "Make the sentence a question.",
            example: { text: "You are ready.", answer: "Are you ready?" },
            items: [
              { text: "He is your brother.", answer: "Is he your brother?" },
              { text: "They are at the park.", answer: "Are they at the park?" },
              { text: "The cat is hungry.", answer: "Is the cat hungry?" },
              { text: "Your dad is at work.", answer: "Is your dad at work?" },
            ],
          },
          {
            type: "order",
            instructions: "סדרו את המילים למשפט.",
            instructionsEn: "Put the words in order.",
            items: [
              { words: ["tall", "is", "he", "?"], answer: "Is he tall?" },
              { words: ["not", "I", "tired", "am", "."], answer: "I am not tired." },
              { words: ["late", "we", "not", "are", "."], answer: "We are not late." },
              { words: ["your", "is", "book", "this", "?"], answer: "Is this your book?" },
            ],
          },
        ],
      },

      {
        id: "review",
        title: "חזרה",
        titleEn: "Review",
        remember: {
          note: "באנגלית חייבים am, is או are — גם כשבעברית אין מילה כזאת:",
          noteEn: "In English you must use am, is or are:",
          chips: ["אני עייף = I am tired.", "הם בבית = They are at home."],
        },
        tasks: [
          {
            type: "rewrite",
            instructions: "מצאו את הטעות ותקנו.",
            instructionsEn: "Find the mistake and fix it.",
            example: { text: "He are my brother.", answer: "He is my brother." },
            items: [
              { text: "The dogs is big.", answer: "The dogs are big." },
              { text: "My brother hungry.", answer: "My brother is hungry." },
              { text: "I tired today.", answer: "I am tired today.", alt: "I'm tired today." },
            ],
          },
          {
            type: "rewrite",
            instructions: "תרגמו לאנגלית.",
            instructionsEn: "Translate into English.",
            items: [
              { text: "אני שמח.", answer: "I am happy.", alt: "I'm happy." },
              { text: "הוא המורה שלי.", answer: "He is my teacher.", alt: "He's my teacher." },
              { text: "הם לא בבית.", answer: "They aren't at home." },
              { text: "אתה מוכן?", answer: "Are you ready?" },
            ],
          },
          {
            type: "about",
            instructions: "כתבו על עצמכם.",
            instructionsEn: "Write about yourself.",
            items: [
              { text: "My name is ___.", sample: "Daniel" },
              { text: "I am ___ years old.", sample: "ten" },
              { text: "Today I am ___.", sample: "happy" },
            ],
          },
        ],
      },
    ],
  },
};
