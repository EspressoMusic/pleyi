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

  greetings: {
    sheets: [
      {
        id: "hello",
        title: "שלום ולהתראות",
        titleEn: "Hello and Goodbye",
        remember: {
          note: "מה אומרים בכל שעה ביום:",
          noteEn: "What we say at each time of day:",
          chips: ["Good morning = בוקר טוב", "Good evening = ערב טוב", "Good night = לילה טוב", "Goodbye = להתראות"],
        },
        tasks: [
          {
            type: "rewrite",
            instructions: "תרגמו לאנגלית.",
            instructionsEn: "Translate into English.",
            example: { text: "שלום", answer: "Hello" },
            items: [
              { text: "בוקר טוב", answer: "Good morning" },
              { text: "לילה טוב", answer: "Good night" },
              { text: "להתראות", answer: "Goodbye", alt: "Bye" },
              { text: "תודה", answer: "Thank you" },
            ],
          },
          {
            type: "fill",
            instructions: "השלימו את המילה החסרה.",
            instructionsEn: "Write the missing word.",
            cols: 2,
            items: [
              { text: "Thank ___!", answer: "you" },
              { text: "You're ___.", answer: "welcome" },
              { text: "See you ___!", answer: "tomorrow" },
              { text: "Excuse ___!", answer: "me" },
            ],
          },
          {
            type: "circle",
            instructions: "הקיפו את התשובה הנכונה.",
            instructionsEn: "Circle the right answer.",
            items: [
              { text: "Thank you! — ___", options: ["You're welcome.", "Good night."], answer: "You're welcome." },
              { text: "Good morning, Ben! — ___", options: ["Good morning, Dan!", "Goodbye, Dan!"], answer: "Good morning, Dan!" },
              { text: "Bye, Dan! — ___", options: ["Hello, Ben!", "Bye, Ben!"], answer: "Bye, Ben!" },
            ],
          },
        ],
      },

      {
        id: "name",
        title: "מציגים את עצמנו",
        titleEn: "My Name Is",
        remember: {
          note: "כך שואלים ועונים:",
          noteEn: "How we ask and answer:",
          chips: ["What is your name? → My name is Dan.", "How old are you? → I am ten.", "Where are you from? → I am from Israel."],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            items: [
              { text: "My name ___ Dan.", options: ["is", "am"], answer: "is" },
              { text: "What ___ your name?", options: ["are", "is"], answer: "is" },
              { text: "I ___ ten years old.", options: ["am", "is"], answer: "am" },
              { text: "How old ___ you?", options: ["is", "are"], answer: "are" },
              { text: "I am ___ Israel.", options: ["from", "to"], answer: "from" },
              { text: "Nice to ___ you.", options: ["name", "meet"], answer: "meet" },
            ],
          },
          {
            type: "order",
            instructions: "סדרו את המילים למשפט.",
            instructionsEn: "Put the words in order.",
            items: [
              { words: ["name", "Ben", "my", "is", "."], answer: "My name is Ben." },
              { words: ["you", "are", "old", "how", "?"], answer: "How old are you?" },
              { words: ["from", "I", "Israel", "am", "."], answer: "I am from Israel." },
              { words: ["your", "what", "name", "is", "?"], answer: "What is your name?" },
            ],
          },
          {
            type: "about",
            instructions: "כתבו על עצמכם.",
            instructionsEn: "Write about yourself.",
            items: [
              { text: "Hello! My name is ___.", sample: "Yossi" },
              { text: "I am ___ years old.", sample: "nine" },
              { text: "I am from ___.", sample: "Israel" },
            ],
          },
        ],
      },

      {
        id: "polite",
        title: "תודה, בבקשה, סליחה",
        titleEn: "Thank You, Please, Sorry",
        remember: {
          note: "מילים של נימוס:",
          noteEn: "Polite words:",
          chips: ["Thank you = תודה", "Please = בבקשה", "Sorry = סליחה", "You're welcome = על לא דבר"],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            items: [
              { text: "I am late. ___!", options: ["Please", "Sorry"], answer: "Sorry" },
              { text: "Water, ___.", options: ["please", "sorry"], answer: "please" },
              { text: "Here is your book. — ___!", options: ["Good night", "Thank you"], answer: "Thank you" },
              { text: "Thank you! — You're ___.", options: ["welcome", "sorry"], answer: "welcome" },
            ],
          },
          {
            type: "rewrite",
            instructions: "תרגמו לאנגלית.",
            instructionsEn: "Translate into English.",
            example: { text: "תודה", answer: "Thank you" },
            items: [
              { text: "בבקשה", answer: "Please" },
              { text: "סליחה", answer: "Sorry", alt: "Excuse me" },
              { text: "על לא דבר", answer: "You're welcome" },
              { text: "נעים מאוד", answer: "Nice to meet you" },
            ],
          },
          {
            type: "order",
            instructions: "סדרו את המילים למשפט.",
            instructionsEn: "Put the words in order.",
            items: [
              { words: ["welcome", "you're", "."], answer: "You're welcome." },
              { words: ["meet", "to", "nice", "you", "."], answer: "Nice to meet you." },
              { words: ["you", "tomorrow", "see", "!"], answer: "See you tomorrow!" },
            ],
          },
        ],
      },

      {
        id: "review",
        title: "חזרה",
        titleEn: "Review",
        remember: {
          note: "שאלה ותשובה בשיחה:",
          noteEn: "A question and its answer:",
          chips: ["How are you? → I am fine, thank you.", "Nice to meet you. → Nice to meet you too."],
        },
        tasks: [
          {
            type: "rewrite",
            instructions: "מצאו את הטעות ותקנו.",
            instructionsEn: "Find the mistake and fix it.",
            example: { text: "My name Dan.", answer: "My name is Dan." },
            items: [
              { text: "How you are?", answer: "How are you?" },
              { text: "I fine, thank you.", answer: "I am fine, thank you.", alt: "I'm fine, thank you." },
              { text: "What your name?", answer: "What is your name?" },
            ],
          },
          {
            type: "fill",
            instructions: "השלימו את השיחה.",
            instructionsEn: "Complete the conversation.",
            items: [
              { text: "A: Hello! What is your ___?", answer: "name" },
              { text: "B: My name is Ben. How ___ you?", answer: "are" },
              { text: "A: I am ___, thank you.", answer: "fine" },
              { text: "B: Nice to ___ you.", answer: "meet" },
            ],
          },
          {
            type: "circle",
            instructions: "הקיפו את התשובה הנכונה.",
            instructionsEn: "Circle the right answer.",
            items: [
              { text: "How old are you? — ___", options: ["I am fine.", "I am ten."], answer: "I am ten." },
              { text: "Where are you from? — ___", options: ["I am from Israel.", "My name is Ben."], answer: "I am from Israel." },
              { text: "Nice to meet you. — ___", options: ["Good night.", "Nice to meet you too."], answer: "Nice to meet you too." },
            ],
          },
        ],
      },
    ],
  },

  pronouns: {
    sheets: [
      {
        id: "he-it",
        title: "הוא, זה, הם",
        titleEn: "He, It, They",
        remember: {
          note: "במקום השם, אומרים כינוי גוף:",
          noteEn: "Instead of the name, use a pronoun:",
          chips: ["I = אני", "you = אתה / אתם", "he = הוא", "she = היא", "it = זה (לא אדם)", "we = אנחנו", "they = הם"],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את כינוי הגוף הנכון.",
            instructionsEn: "Circle the right pronoun.",
            options: ["He", "It", "They"],
            items: [
              { text: "Dan is my friend. ___ is nine.", answer: "He" },
              { text: "The dog is big. ___ is brown.", answer: "It" },
              { text: "Ben and Tom are here. ___ are my friends.", answer: "They" },
              { text: "My dad is at home. ___ is tired.", answer: "He" },
              { text: "The cats are small. ___ are cute.", answer: "They" },
            ],
          },
          {
            type: "fill",
            instructions: "הסתכלו וכתבו He או It.",
            instructionsEn: "Look and write He or It.",
            cols: 2,
            items: [
              { img: "father", text: "___ is my dad.", answer: "He" },
              { img: "dog", text: "___ is a dog.", answer: "It" },
              { img: "grandfather", text: "___ is old.", answer: "He" },
              { img: "apple", text: "___ is red.", answer: "It" },
            ],
          },
          {
            type: "rewrite",
            instructions: "כתבו את המשפט עם כינוי גוף.",
            instructionsEn: "Write the sentence with a pronoun.",
            example: { text: "Dan is happy.", answer: "He is happy." },
            items: [
              { text: "The cat is black.", answer: "It is black." },
              { text: "Tom and Ben are at school.", answer: "They are at school." },
              { text: "My brother is tall.", answer: "He is tall." },
            ],
          },
        ],
      },

      {
        id: "we-they",
        title: "אנחנו והם",
        titleEn: "We and They",
        remember: {
          note: "על יותר מאחד אומרים we או they:",
          noteEn: "For more than one, say we or they:",
          chips: ["Dan and I → we", "Tom and Ben → they", "the books → they"],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את כינוי הגוף הנכון.",
            instructionsEn: "Circle the right pronoun.",
            options: ["We", "They"],
            items: [
              { text: "Tom and I are ten. ___ are in class 4.", answer: "We" },
              { text: "The dogs are big. ___ are black.", answer: "They" },
              { text: "My parents are at work. ___ are busy.", answer: "They" },
              { text: "Dan and I are friends. ___ are in the park.", answer: "We" },
            ],
          },
          {
            type: "fill",
            instructions: "כתבו את כינוי הגוף.",
            instructionsEn: "Write the pronoun.",
            cols: 2,
            items: [
              { text: "Ben and I = ___", answer: "we", example: true },
              { text: "the cats = ___", answer: "they" },
              { text: "my dad = ___", answer: "he" },
              { text: "the book = ___", answer: "it" },
              { text: "Dan and Tom = ___", answer: "they" },
              { text: "my brother and I = ___", answer: "we" },
            ],
          },
          {
            type: "order",
            instructions: "סדרו את המילים למשפט.",
            instructionsEn: "Put the words in order.",
            items: [
              { words: ["are", "we", "school", "at", "."], answer: "We are at school." },
              { words: ["is", "it", "big", "dog", "a", "."], answer: "It is a big dog." },
              { words: ["happy", "they", "are", "."], answer: "They are happy." },
              { words: ["my", "he", "brother", "is", "."], answer: "He is my brother." },
            ],
          },
        ],
      },

      {
        id: "translate",
        title: "מעברית לאנגלית",
        titleEn: "From Hebrew to English",
        remember: {
          note: "באנגלית you הוא גם אתה וגם אתם:",
          noteEn: "In English, you is one person or many:",
          chips: ["אתה = you", "אתם = you", "הם = they", "חפץ או חיה = it"],
        },
        tasks: [
          {
            type: "rewrite",
            instructions: "תרגמו לאנגלית.",
            instructionsEn: "Translate into English.",
            example: { text: "אני שמח.", answer: "I am happy." },
            items: [
              { text: "אנחנו בבית.", answer: "We are at home." },
              { text: "הם עייפים.", answer: "They are tired." },
              { text: "זה כלב גדול.", answer: "It is a big dog." },
              { text: "אתה מוכן?", answer: "Are you ready?" },
            ],
          },
          {
            type: "circle",
            instructions: "הקיפו את כינוי הגוף הנכון.",
            instructionsEn: "Circle the right pronoun.",
            items: [
              { text: "Ben is ten. ___ is my brother.", options: ["It", "He"], answer: "He" },
              { text: "The book is new. ___ is blue.", options: ["It", "He"], answer: "It" },
              { text: "Tom and Ben are here. ___ are friends.", options: ["We", "They"], answer: "They" },
              { text: "Dan and I are in class. ___ are students.", options: ["We", "They"], answer: "We" },
            ],
          },
          {
            type: "order",
            instructions: "סדרו את המילים למשפט.",
            instructionsEn: "Put the words in order.",
            items: [
              { words: ["you", "ready", "are", "?"], answer: "Are you ready?" },
              { words: ["not", "he", "is", "home", "at", "."], answer: "He is not at home." },
              { words: ["are", "they", "brothers", "."], answer: "They are brothers." },
            ],
          },
        ],
      },

      {
        id: "review",
        title: "חזרה",
        titleEn: "Review",
        remember: {
          note: "בוחרים כינוי גוף לפי מי שמדברים עליו:",
          noteEn: "Choose the pronoun by who you talk about:",
          chips: ["a boy, a man → he", "an animal, a thing → it", "me and others → we", "many → they"],
        },
        tasks: [
          {
            type: "rewrite",
            instructions: "מצאו את הטעות ותקנו.",
            instructionsEn: "Find the mistake and fix it.",
            example: { text: "The dog is big. He is brown.", answer: "The dog is big. It is brown." },
            items: [
              { text: "My dad is at work. It is busy.", answer: "My dad is at work. He is busy." },
              { text: "The books are new. We are red.", answer: "The books are new. They are red." },
              { text: "Tom and I are friends. They are ten.", answer: "Tom and I are friends. We are ten." },
            ],
          },
          {
            type: "fill",
            instructions: "כתבו I, you, he, it, we או they.",
            instructionsEn: "Write I, you, he, it, we or they.",
            cols: 2,
            items: [
              { text: "Hello! ___ am Ben.", answer: "I" },
              { text: "Dan, ___ are my friend!", answer: "you" },
              { text: "Look at the bird! ___ is small.", answer: "It" },
              { text: "Tom and Ben? ___ are at school.", answer: "They" },
              { text: "My grandpa is old. ___ is 80.", answer: "He" },
              { text: "Ben and I: ___ are hungry.", answer: "we" },
            ],
          },
          {
            type: "about",
            instructions: "כתבו על חבר שלכם.",
            instructionsEn: "Write about your friend.",
            items: [
              { text: "My best friend is ___.", sample: "Yossi" },
              { text: "He is ___ years old.", sample: "ten" },
              { text: "We are ___.", sample: "in class 4" },
            ],
          },
        ],
      },
    ],
  },

  articles: {
    sheets: [
      {
        id: "a-an",
        title: "a או an",
        titleEn: "a or an",
        remember: {
          note: "לפני a, e, i, o, u כותבים an:",
          noteEn: "Before a, e, i, o, u, write an:",
          chips: ["a dog", "a ball", "an apple", "an egg", "an elephant"],
        },
        tasks: [
          {
            type: "fill",
            instructions: "הסתכלו וכתבו a או an.",
            instructionsEn: "Look and write a or an.",
            cols: 2,
            items: [
              { img: "apple", text: "It is ___ apple.", answer: "an" },
              { img: "dog", text: "It is ___ dog.", answer: "a" },
              { img: "egg", text: "It is ___ egg.", answer: "an" },
              { img: "ball", text: "It is ___ ball.", answer: "a" },
            ],
          },
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            options: ["a", "an"],
            items: [
              { text: "I have ___ cat.", answer: "a" },
              { text: "It is ___ umbrella.", answer: "an" },
              { text: "I have ___ bike.", answer: "a" },
              { text: "It is ___ old car.", answer: "an" },
              { text: "He is ___ boy.", answer: "a" },
            ],
          },
          {
            type: "fill",
            instructions: "כתבו a או an.",
            instructionsEn: "Write a or an.",
            cols: 3,
            items: [
              { text: "___ book", answer: "a" },
              { text: "___ orange", answer: "an" },
              { text: "___ pen", answer: "a" },
              { text: "___ eye", answer: "an" },
              { text: "___ hat", answer: "a" },
              { text: "___ elephant", answer: "an" },
            ],
          },
        ],
      },

      {
        id: "the",
        title: "a או the",
        titleEn: "a or the",
        remember: {
          note: "a – משהו אחד, כלשהו. the – משהו שכבר מכירים:",
          noteEn: "a – any one thing. the – a thing we already know:",
          chips: ["I have a dog. The dog is big.", "the sun", "the moon"],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            items: [
              { text: "I have a dog. ___ dog is big.", options: ["A", "The"], answer: "The" },
              { text: "Look at ___ sun!", options: ["a", "the"], answer: "the" },
              { text: "I have ___ new bike.", options: ["a", "the"], answer: "a" },
              { text: "Look at ___ moon!", options: ["a", "the"], answer: "the" },
              { text: "He is ___ teacher.", options: ["a", "the"], answer: "a" },
              { text: "I have a cat. ___ cat is black.", options: ["A", "The"], answer: "The" },
            ],
          },
          {
            type: "fill",
            instructions: "כתבו a, an או the.",
            instructionsEn: "Write a, an or the.",
            cols: 2,
            items: [
              { text: "I have ___ egg.", answer: "an" },
              { text: "Open ___ door, please.", answer: "the" },
              { text: "It is ___ big house.", answer: "a" },
              { text: "Look at ___ stars!", answer: "the" },
            ],
          },
          {
            type: "rewrite",
            instructions: "תרגמו לאנגלית.",
            instructionsEn: "Translate into English.",
            example: { text: "יש לי כלב.", answer: "I have a dog." },
            items: [
              { text: "זה תפוח.", answer: "It is an apple." },
              { text: "הכלב גדול.", answer: "The dog is big." },
              { text: "השמש חמה.", answer: "The sun is hot." },
              { text: "זה ספר חדש.", answer: "It is a new book." },
            ],
          },
        ],
      },

      {
        id: "this-that",
        title: "this, that, these, those",
        titleEn: "this, that, these, those",
        remember: {
          note: "קרוב או רחוק, אחד או הרבה:",
          noteEn: "Near or far, one or many:",
          chips: ["this – קרוב, אחד", "that – רחוק, אחד", "these – קרוב, הרבה", "those – רחוק, הרבה"],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            items: [
              { text: "___ is my bag. (near)", options: ["This", "That"], answer: "This" },
              { text: "___ are my shoes. (near)", options: ["This", "These"], answer: "These" },
              { text: "___ is a bird. (far)", options: ["That", "Those"], answer: "That" },
              { text: "___ are big trees. (far)", options: ["That", "Those"], answer: "Those" },
              { text: "___ apples are red. (near)", options: ["This", "These"], answer: "These" },
            ],
          },
          {
            type: "rewrite",
            instructions: "כתבו את המשפט ברבים.",
            instructionsEn: "Write the sentence for many.",
            example: { text: "This is a cat.", answer: "These are cats." },
            items: [
              { text: "This is a book.", answer: "These are books." },
              { text: "That is a car.", answer: "Those are cars." },
              { text: "This is my pen.", answer: "These are my pens." },
            ],
          },
          {
            type: "order",
            instructions: "סדרו את המילים למשפט.",
            instructionsEn: "Put the words in order.",
            items: [
              { words: ["is", "this", "bag", "my", "."], answer: "This is my bag." },
              { words: ["are", "these", "my", "shoes", "."], answer: "These are my shoes." },
              { words: ["that", "a", "is", "dog", "?"], answer: "Is that a dog?" },
            ],
          },
        ],
      },

      {
        id: "review",
        title: "חזרה",
        titleEn: "Review",
        remember: {
          note: "לפני הרבה לא כותבים a או an:",
          noteEn: "Many things get no a or an:",
          chips: ["a cat → cats", "an egg → eggs", "this cat → these cats"],
        },
        tasks: [
          {
            type: "rewrite",
            instructions: "מצאו את הטעות ותקנו.",
            instructionsEn: "Find the mistake and fix it.",
            example: { text: "It is a apple.", answer: "It is an apple." },
            items: [
              { text: "This are my books.", answer: "These are my books." },
              { text: "I have an dog.", answer: "I have a dog." },
              { text: "Look at a sun!", answer: "Look at the sun!" },
              { text: "Those is my bike.", answer: "That is my bike." },
            ],
          },
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            items: [
              { text: "I have ___ orange.", options: ["a", "an"], answer: "an" },
              { text: "___ sun is hot.", options: ["A", "The"], answer: "The" },
              { text: "___ are my friends.", options: ["This", "These"], answer: "These" },
              { text: "He is ___ good boy.", options: ["a", "an"], answer: "a" },
            ],
          },
          {
            type: "rewrite",
            instructions: "תרגמו לאנגלית.",
            instructionsEn: "Translate into English.",
            items: [
              { text: "אלה הספרים שלי.", answer: "These are my books." },
              { text: "זה חתול.", answer: "This is a cat.", alt: "It is a cat." },
              { text: "ההוא כלב גדול.", answer: "That is a big dog." },
              { text: "יש לי ביצה.", answer: "I have an egg." },
            ],
          },
        ],
      },
    ],
  },

  plurals: {
    sheets: [
      {
        id: "s",
        title: "מוסיפים s",
        titleEn: "Add s",
        remember: {
          note: "ברוב המילים, ברבים מוסיפים s:",
          noteEn: "For most words, add s for many:",
          chips: ["a cat → cats", "a book → books", "a ball → balls"],
        },
        tasks: [
          {
            type: "fill",
            instructions: "הסתכלו וכתבו ברבים.",
            instructionsEn: "Look and write the plural.",
            cols: 2,
            items: [
              { img: "cat", text: "two ___", answer: "cats" },
              { img: "dog", text: "three ___", answer: "dogs" },
              { img: "car", text: "two ___", answer: "cars" },
              { img: "book", text: "four ___", answer: "books" },
            ],
          },
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            items: [
              { text: "I have two ___.", options: ["dog", "dogs"], answer: "dogs" },
              { text: "It is a ___.", options: ["pen", "pens"], answer: "pen" },
              { text: "Three ___ are on the table.", options: ["cup", "cups"], answer: "cups" },
              { text: "I have one ___.", options: ["bike", "bikes"], answer: "bike" },
              { text: "Look at the five ___!", options: ["bird", "birds"], answer: "birds" },
            ],
          },
          {
            type: "fill",
            instructions: "כתבו ברבים.",
            instructionsEn: "Write the plural.",
            cols: 2,
            items: [
              { text: "apple → ___", answer: "apples" },
              { text: "pen → ___", answer: "pens" },
              { text: "bag → ___", answer: "bags" },
              { text: "tree → ___", answer: "trees" },
              { text: "egg → ___", answer: "eggs" },
              { text: "chair → ___", answer: "chairs" },
            ],
          },
        ],
      },

      {
        id: "es-ies",
        title: "es ו־ies",
        titleEn: "es and ies",
        remember: {
          note: "אחרי s, sh, ch, x מוסיפים es. עיצור ואחריו y — הופך ל־ies:",
          noteEn: "After s, sh, ch, x add es. A consonant + y becomes ies:",
          chips: ["a bus → buses", "a box → boxes", "a watch → watches", "a baby → babies", "a city → cities"],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את הסוף הנכון.",
            instructionsEn: "Circle the right ending.",
            options: ["s", "es", "ies"],
            items: [
              { text: "two box___", answer: "es" },
              { text: "three bus___", answer: "es" },
              { text: "two cat___", answer: "s" },
              { text: "four bab___ (baby)", answer: "ies" },
              { text: "two dish___", answer: "es" },
              { text: "five cit___ (city)", answer: "ies" },
            ],
          },
          {
            type: "fill",
            instructions: "כתבו ברבים.",
            instructionsEn: "Write the plural.",
            cols: 2,
            items: [
              { text: "a watch → two ___", answer: "watches" },
              { text: "a fox → two ___", answer: "foxes" },
              { text: "a baby → two ___", answer: "babies" },
              { text: "a class → two ___", answer: "classes" },
              { text: "a city → two ___", answer: "cities" },
              { text: "a bus → two ___", answer: "buses" },
            ],
          },
          {
            type: "rewrite",
            instructions: "כתבו את המשפט ברבים.",
            instructionsEn: "Write the sentence for many.",
            example: { text: "It is a box.", answer: "They are boxes." },
            items: [
              { text: "It is a bus.", answer: "They are buses." },
              { text: "It is a baby.", answer: "They are babies." },
              { text: "It is a dish.", answer: "They are dishes." },
            ],
          },
        ],
      },

      {
        id: "special",
        title: "מילים מיוחדות",
        titleEn: "Special Plurals",
        remember: {
          note: "יש מילים שמשתנות לגמרי ברבים:",
          noteEn: "Some words change completely:",
          chips: ["child → children", "man → men", "foot → feet", "tooth → teeth", "leaf → leaves", "fish → fish", "sheep → sheep"],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            items: [
              { text: "Three ___ are in the park.", options: ["childs", "children"], answer: "children" },
              { text: "I have two ___.", options: ["feet", "foots"], answer: "feet" },
              { text: "The ___ are at work.", options: ["mans", "men"], answer: "men" },
              { text: "My ___ are white.", options: ["teeth", "tooths"], answer: "teeth" },
              { text: "I see three ___ in the water.", options: ["fishes", "fish"], answer: "fish" },
              { text: "The ___ are green.", options: ["leaves", "leafs"], answer: "leaves" },
            ],
          },
          {
            type: "fill",
            instructions: "כתבו ברבים.",
            instructionsEn: "Write the plural.",
            cols: 2,
            items: [
              { text: "man → ___", answer: "men" },
              { text: "child → ___", answer: "children" },
              { text: "foot → ___", answer: "feet" },
              { text: "sheep → ___", answer: "sheep" },
              { text: "wolf → ___", answer: "wolves" },
              { text: "tooth → ___", answer: "teeth" },
            ],
          },
          {
            type: "rewrite",
            instructions: "מצאו את הטעות ותקנו.",
            instructionsEn: "Find the mistake and fix it.",
            example: { text: "I have two foots.", answer: "I have two feet." },
            items: [
              { text: "The childs are happy.", answer: "The children are happy." },
              { text: "Three mans are here.", answer: "Three men are here." },
              { text: "I see two fishes.", answer: "I see two fish." },
            ],
          },
        ],
      },

      {
        id: "review",
        title: "חזרה",
        titleEn: "Review",
        remember: {
          note: "a / an רק לפני אחד. ברבים — בלי a:",
          noteEn: "Only one thing gets a / an. Many get no a:",
          chips: ["a cat → cats", "a box → boxes", "a baby → babies", "a child → children"],
        },
        tasks: [
          {
            type: "fill",
            instructions: "כתבו ברבים.",
            instructionsEn: "Write the plural.",
            cols: 2,
            items: [
              { text: "dog → ___", answer: "dogs" },
              { text: "box → ___", answer: "boxes" },
              { text: "baby → ___", answer: "babies" },
              { text: "man → ___", answer: "men" },
              { text: "bus → ___", answer: "buses" },
              { text: "tooth → ___", answer: "teeth" },
            ],
          },
          {
            type: "rewrite",
            instructions: "תרגמו לאנגלית.",
            instructionsEn: "Translate into English.",
            items: [
              { text: "יש לי שני חתולים.", answer: "I have two cats." },
              { text: "הילדים בבית.", answer: "The children are at home." },
              { text: "הכלבים גדולים.", answer: "The dogs are big." },
              { text: "אלה קופסאות.", answer: "These are boxes.", alt: "They are boxes." },
            ],
          },
          {
            type: "order",
            instructions: "סדרו את המילים למשפט.",
            instructionsEn: "Put the words in order.",
            items: [
              { words: ["are", "the", "happy", "children"], answer: "The children are happy." },
              { words: ["have", "I", "two", "dogs"], answer: "I have two dogs." },
              { words: ["feet", "my", "cold", "are"], answer: "My feet are cold." },
            ],
          },
        ],
      },
    ],
  },

  possessives: {
    sheets: [
      {
        id: "my-his",
        title: "my, your, his",
        titleEn: "my, your, his",
        remember: {
          note: "כינוי שייכות בא לפני שם העצם:",
          noteEn: "A possessive comes before the noun:",
          chips: ["I → my", "you → your", "he → his", "she → her", "it → its", "we → our", "they → their"],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            items: [
              { text: "I have a bag. It is ___ bag.", options: ["my", "his"], answer: "my" },
              { text: "This is Tom. ___ bag is red.", options: ["Your", "His"], answer: "His" },
              { text: "We are in class 4. ___ class is big.", options: ["Our", "Their"], answer: "Our" },
              { text: "Tom and Ben are brothers. ___ dog is black.", options: ["Our", "Their"], answer: "Their" },
              { text: "The cat eats ___ food.", options: ["its", "his"], answer: "its" },
            ],
          },
          {
            type: "fill",
            instructions: "כתבו my, his או its.",
            instructionsEn: "Write my, his or its.",
            items: [
              { text: "This is my dad. ___ name is David.", answer: "His" },
              { text: "I have a bag. This is ___ bag.", answer: "my" },
              { text: "The cat is in ___ bed.", answer: "its" },
              { text: "This is Ben. ___ bike is new.", answer: "His" },
            ],
          },
          {
            type: "rewrite",
            instructions: "תרגמו לאנגלית.",
            instructionsEn: "Translate into English.",
            example: { text: "הספר שלי", answer: "my book" },
            items: [
              { text: "התיק שלך", answer: "your bag" },
              { text: "הכלב שלו", answer: "his dog" },
              { text: "הבית שלהם", answer: "their house" },
            ],
          },
        ],
      },

      {
        id: "whose",
        title: "של מי? 's",
        titleEn: "Tom's, Whose?",
        remember: {
          note: "כדי לומר של מי, מוסיפים 's לשם:",
          noteEn: "To say whose it is, add 's to the name:",
          chips: ["Tom's bag = התיק של תום", "Dan's dog = הכלב של דן", "Whose bag is it? = של מי התיק?"],
        },
        tasks: [
          {
            type: "rewrite",
            instructions: "תרגמו לאנגלית עם 's.",
            instructionsEn: "Translate into English with 's.",
            example: { text: "התיק של תום", answer: "Tom's bag" },
            items: [
              { text: "הכלב של דן", answer: "Dan's dog" },
              { text: "האופניים של בן", answer: "Ben's bike" },
              { text: "הספר של אבא", answer: "Dad's book" },
              { text: "הבית של סבא", answer: "Grandpa's house" },
            ],
          },
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            items: [
              { text: "This is ___ pen.", options: ["Bens", "Ben's"], answer: "Ben's" },
              { text: "___ bag is it?", options: ["Whose", "Who"], answer: "Whose" },
              { text: "It is ___ hat.", options: ["Dan's", "Dan"], answer: "Dan's" },
              { text: "___ book is this?", options: ["What", "Whose"], answer: "Whose" },
            ],
          },
          {
            type: "order",
            instructions: "סדרו את המילים למשפט.",
            instructionsEn: "Put the words in order.",
            items: [
              { words: ["is", "bag", "whose", "this", "?"], answer: "Whose bag is this?" },
              { words: ["Tom's", "is", "it", "bike", "."], answer: "It is Tom's bike." },
              { words: ["Dan's", "is", "dog", "this", "."], answer: "This is Dan's dog." },
            ],
          },
        ],
      },

      {
        id: "mine",
        title: "mine, yours",
        titleEn: "mine, yours",
        remember: {
          note: "כשאין שם עצם אחרי המילה — mine, yours:",
          noteEn: "When no noun comes after it — mine, yours:",
          chips: ["my book → mine", "your bag → yours", "his pen → his", "her pen → hers", "our house → ours", "their car → theirs"],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            items: [
              { text: "This book is ___.", options: ["my", "mine"], answer: "mine" },
              { text: "This is ___ book.", options: ["my", "mine"], answer: "my" },
              { text: "Is this bag ___?", options: ["your", "yours"], answer: "yours" },
              { text: "It is ___ bike.", options: ["your", "yours"], answer: "your" },
              { text: "This is ___ car.", options: ["their", "theirs"], answer: "their" },
            ],
          },
          {
            type: "rewrite",
            instructions: "כתבו את המשפט מחדש.",
            instructionsEn: "Write the sentence again.",
            example: { text: "This is my pen.", answer: "This pen is mine." },
            items: [
              { text: "This is your bag.", answer: "This bag is yours." },
              { text: "This is his bike.", answer: "This bike is his." },
              { text: "This is their dog.", answer: "This dog is theirs." },
            ],
          },
          {
            type: "fill",
            instructions: "השלימו mine או yours.",
            instructionsEn: "Write mine or yours.",
            items: [
              { text: "A: Whose pen is this? Is it ___?", answer: "yours" },
              { text: "B: Yes, it is ___. Thank you!", answer: "mine" },
              { text: "A: Is this book ___, too?", answer: "yours" },
              { text: "B: No, it isn't ___.", answer: "mine" },
            ],
          },
        ],
      },

      {
        id: "review",
        title: "חזרה",
        titleEn: "Review",
        remember: {
          note: "my עם שם עצם אחריו, mine בלי:",
          noteEn: "my + a noun, mine on its own:",
          chips: ["It is my bag. = The bag is mine.", "Whose bag is it? — It is Tom's."],
        },
        tasks: [
          {
            type: "rewrite",
            instructions: "מצאו את הטעות ותקנו.",
            instructionsEn: "Find the mistake and fix it.",
            example: { text: "This is mine book.", answer: "This is my book." },
            items: [
              { text: "Is this you pen?", answer: "Is this your pen?" },
              { text: "The bike is my.", answer: "The bike is mine." },
              { text: "Tom bag is red.", answer: "Tom's bag is red." },
              { text: "Who bag is this?", answer: "Whose bag is this?" },
            ],
          },
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            items: [
              { text: "I am Ben. ___ dog is white.", options: ["My", "His"], answer: "My" },
              { text: "Dan is ten. ___ brother is six.", options: ["Their", "His"], answer: "His" },
              { text: "We are brothers. ___ dad is a doctor.", options: ["Our", "Their"], answer: "Our" },
              { text: "The dog is in ___ bed.", options: ["his", "its"], answer: "its" },
            ],
          },
          {
            type: "rewrite",
            instructions: "תרגמו לאנגלית.",
            instructionsEn: "Translate into English.",
            items: [
              { text: "זה התיק שלי.", answer: "This is my bag." },
              { text: "הספר הזה שלך.", answer: "This book is yours." },
              { text: "של מי הכלב?", answer: "Whose dog is it?", alt: "Whose dog is this?" },
              { text: "זה הכדור של דן.", answer: "This is Dan's ball.", alt: "It is Dan's ball." },
            ],
          },
        ],
      },
    ],
  },

  "have-has": {
    sheets: [
      {
        id: "have-has",
        title: "have או has",
        titleEn: "have or has",
        remember: {
          note: "עם he, she, it — has. עם כל השאר — have:",
          noteEn: "he, she, it → has. All the others → have:",
          chips: ["I have", "you have", "we have", "they have", "he has", "it has"],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            options: ["have", "has"],
            items: [
              { text: "I ___ a dog.", answer: "have" },
              { text: "He ___ a bike.", answer: "has" },
              { text: "We ___ a big house.", answer: "have" },
              { text: "The cat ___ a ball.", answer: "has" },
              { text: "My brother ___ a new bag.", answer: "has" },
              { text: "They ___ two cats.", answer: "have" },
            ],
          },
          {
            type: "fill",
            instructions: "הסתכלו וכתבו have או has.",
            instructionsEn: "Look and write have or has.",
            cols: 2,
            items: [
              { img: "bike", text: "I ___ a bike.", answer: "have" },
              { img: "dog", text: "Ben ___ a dog.", answer: "has" },
              { img: "car", text: "My dad ___ a car.", answer: "has" },
              { img: "cat", text: "We ___ a cat.", answer: "have" },
            ],
          },
          {
            type: "rewrite",
            instructions: "כתבו את המשפט עם He.",
            instructionsEn: "Write the sentence with He.",
            example: { text: "I have a ball.", answer: "He has a ball." },
            items: [
              { text: "I have a pen.", answer: "He has a pen." },
              { text: "We have two cats.", answer: "He has two cats." },
              { text: "They have a big bag.", answer: "He has a big bag." },
            ],
          },
        ],
      },

      {
        id: "negative",
        title: "שלילה",
        titleEn: "don't have, doesn't have",
        remember: {
          note: "בשלילה: don't have. עם he, she, it — doesn't have:",
          noteEn: "Negative: don't have. With he, she, it — doesn't have:",
          chips: ["I don't have a pet.", "They don't have a car.", "He doesn't have a bike."],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            options: ["don't", "doesn't"],
            items: [
              { text: "I ___ have a cat.", answer: "don't" },
              { text: "He ___ have a bike.", answer: "doesn't" },
              { text: "We ___ have a car.", answer: "don't" },
              { text: "The dog ___ have a bed.", answer: "doesn't" },
              { text: "My brother ___ have a computer.", answer: "doesn't" },
            ],
          },
          {
            type: "rewrite",
            instructions: "כתבו את המשפט בשלילה.",
            instructionsEn: "Write the sentence in the negative.",
            example: { text: "I have a dog.", answer: "I don't have a dog." },
            items: [
              { text: "We have a big house.", answer: "We don't have a big house." },
              { text: "He has a bike.", answer: "He doesn't have a bike." },
              { text: "Dan has a pen.", answer: "Dan doesn't have a pen." },
            ],
          },
          {
            type: "order",
            instructions: "סדרו את המילים למשפט.",
            instructionsEn: "Put the words in order.",
            items: [
              { words: ["have", "don't", "I", "pet", "a"], answer: "I don't have a pet." },
              { words: ["doesn't", "he", "a", "pen", "have"], answer: "He doesn't have a pen." },
              { words: ["have", "we", "car", "don't", "a"], answer: "We don't have a car." },
            ],
          },
        ],
      },

      {
        id: "questions",
        title: "שאלות",
        titleEn: "Do you have? Does he have?",
        remember: {
          note: "בשאלה: Do you have…? עם he, she, it — Does he have…?",
          noteEn: "Questions: Do you have…? With he, she, it — Does he have…?",
          chips: ["Do you have a pet? — Yes, I do. / No, I don't.", "Does he have a bike? — Yes, he does. / No, he doesn't."],
        },
        tasks: [
          {
            type: "fill",
            instructions: "כתבו Do או Does.",
            instructionsEn: "Write Do or Does.",
            cols: 2,
            items: [
              { text: "___ you have a dog?", answer: "Do" },
              { text: "___ he have a bike?", answer: "Does" },
              { text: "___ they have a car?", answer: "Do" },
              { text: "___ Ben have a cat?", answer: "Does" },
              { text: "___ we have English today?", answer: "Do" },
              { text: "___ the dog have a ball?", answer: "Does" },
            ],
          },
          {
            type: "circle",
            instructions: "הקיפו את התשובה הנכונה.",
            instructionsEn: "Circle the right answer.",
            items: [
              { text: "Do you have a pen? — Yes, I ___.", options: ["do", "does"], answer: "do" },
              { text: "Does he have a bike? — No, he ___.", options: ["don't", "doesn't"], answer: "doesn't" },
              { text: "Do they have a cat? — Yes, they ___.", options: ["do", "does"], answer: "do" },
              { text: "Does Dan have a dog? — Yes, he ___.", options: ["do", "does"], answer: "does" },
            ],
          },
          {
            type: "rewrite",
            instructions: "הפכו את המשפט לשאלה.",
            instructionsEn: "Make the sentence a question.",
            example: { text: "You have a dog.", answer: "Do you have a dog?" },
            items: [
              { text: "He has a bike.", answer: "Does he have a bike?" },
              { text: "They have a big house.", answer: "Do they have a big house?" },
              { text: "Ben has a cat.", answer: "Does Ben have a cat?" },
            ],
          },
        ],
      },

      {
        id: "review",
        title: "חזרה",
        titleEn: "Review",
        remember: {
          note: "אחרי does ו־doesn't תמיד have (לא has):",
          noteEn: "After does and doesn't, always have (not has):",
          chips: ["He has a bike.", "He doesn't have a bike.", "Does he have a bike?"],
        },
        tasks: [
          {
            type: "rewrite",
            instructions: "מצאו את הטעות ותקנו.",
            instructionsEn: "Find the mistake and fix it.",
            example: { text: "He have a dog.", answer: "He has a dog." },
            items: [
              { text: "I has a bag.", answer: "I have a bag." },
              { text: "He doesn't has a pen.", answer: "He doesn't have a pen." },
              { text: "Does he has a car?", answer: "Does he have a car?" },
              { text: "They doesn't have a cat.", answer: "They don't have a cat." },
            ],
          },
          {
            type: "rewrite",
            instructions: "תרגמו לאנגלית.",
            instructionsEn: "Translate into English.",
            items: [
              { text: "יש לי כלב.", answer: "I have a dog." },
              { text: "יש לו אופניים.", answer: "He has a bike." },
              { text: "אין לנו מכונית.", answer: "We don't have a car." },
              { text: "יש לך עט?", answer: "Do you have a pen?" },
            ],
          },
          {
            type: "about",
            instructions: "כתבו על עצמכם.",
            instructionsEn: "Write about yourself.",
            items: [
              { text: "I have ___.", sample: "a dog" },
              { text: "I don't have ___.", sample: "a cat" },
              { text: "My friend has ___.", sample: "a bike" },
            ],
          },
        ],
      },
    ],
  },

  "there-is": {
    sheets: [
      {
        id: "is-are",
        title: "There is או There are",
        titleEn: "There is, There are",
        remember: {
          note: "יש אחד — There is. יש הרבה — There are:",
          noteEn: "One — There is. Many — There are:",
          chips: ["There is a cat.", "There are two cats."],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            options: ["is", "are"],
            items: [
              { text: "There ___ a dog in the garden.", answer: "is" },
              { text: "There ___ three books on the table.", answer: "are" },
              { text: "There ___ a big tree in the park.", answer: "is" },
              { text: "There ___ two boys in the room.", answer: "are" },
              { text: "There ___ an apple in the bag.", answer: "is" },
              { text: "There ___ many stars in the sky.", answer: "are" },
            ],
          },
          {
            type: "fill",
            instructions: "כתבו is או are.",
            instructionsEn: "Write is or are.",
            cols: 2,
            items: [
              { text: "There ___ a cup.", answer: "is" },
              { text: "There ___ two cups.", answer: "are" },
              { text: "There ___ a lamp.", answer: "is" },
              { text: "There ___ five pens.", answer: "are" },
              { text: "There ___ a door.", answer: "is" },
              { text: "There ___ three windows.", answer: "are" },
            ],
          },
          {
            type: "rewrite",
            instructions: "כתבו את המשפט עם two.",
            instructionsEn: "Write the sentence with two.",
            example: { text: "There is a cat.", answer: "There are two cats." },
            items: [
              { text: "There is a dog.", answer: "There are two dogs." },
              { text: "There is a box.", answer: "There are two boxes." },
              { text: "There is a child.", answer: "There are two children." },
            ],
          },
        ],
      },

      {
        id: "negative",
        title: "אין",
        titleEn: "There isn't, There aren't",
        remember: {
          note: "כדי לומר אין, מוסיפים not:",
          noteEn: "To say there isn't, add not:",
          chips: ["There is not = There isn't", "There are not = There aren't"],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            options: ["isn't", "aren't"],
            items: [
              { text: "There ___ a cat here.", answer: "isn't" },
              { text: "There ___ books on the table.", answer: "aren't" },
              { text: "There ___ a park near my house.", answer: "isn't" },
              { text: "There ___ two beds in the room.", answer: "aren't" },
            ],
          },
          {
            type: "rewrite",
            instructions: "כתבו את המשפט בשלילה.",
            instructionsEn: "Write the sentence in the negative.",
            example: { text: "There is a cat.", answer: "There isn't a cat." },
            items: [
              { text: "There is a park.", answer: "There isn't a park." },
              { text: "There are books on the table.", answer: "There aren't books on the table." },
              { text: "There is a car here.", answer: "There isn't a car here." },
            ],
          },
          {
            type: "order",
            instructions: "סדרו את המילים למשפט.",
            instructionsEn: "Put the words in order.",
            items: [
              { words: ["isn't", "there", "a", "cat", "here"], answer: "There isn't a cat here." },
              { words: ["aren't", "there", "chairs", "two"], answer: "There aren't two chairs." },
              { words: ["is", "there", "a", "tree", "big"], answer: "There is a big tree." },
            ],
          },
        ],
      },

      {
        id: "questions",
        title: "שאלות ו־How many",
        titleEn: "Is there? How many?",
        remember: {
          note: "בשאלה, is או are עוברים להתחלה:",
          noteEn: "In a question, is or are moves to the start:",
          chips: ["Is there a park? — Yes, there is.", "Are there two beds? — No, there aren't.", "How many cats are there?"],
        },
        tasks: [
          {
            type: "fill",
            instructions: "כתבו Is או Are.",
            instructionsEn: "Write Is or Are.",
            cols: 2,
            items: [
              { text: "___ there a park?", answer: "Is" },
              { text: "___ there two beds?", answer: "Are" },
              { text: "___ there a dog in the house?", answer: "Is" },
              { text: "___ there many cars?", answer: "Are" },
              { text: "___ there an apple?", answer: "Is" },
              { text: "___ there three pens?", answer: "Are" },
            ],
          },
          {
            type: "circle",
            instructions: "הקיפו את התשובה הנכונה.",
            instructionsEn: "Circle the right answer.",
            items: [
              { text: "Is there a cat? — Yes, there ___.", options: ["is", "are"], answer: "is" },
              { text: "Are there two boys? — No, there ___.", options: ["isn't", "aren't"], answer: "aren't" },
              { text: "Is there a TV? — No, there ___.", options: ["isn't", "aren't"], answer: "isn't" },
              { text: "Are there books? — Yes, there ___.", options: ["is", "are"], answer: "are" },
            ],
          },
          {
            type: "order",
            instructions: "סדרו את המילים למשפט.",
            instructionsEn: "Put the words in order.",
            items: [
              { words: ["are", "how", "there", "many"], answer: "How many are there?" },
              { words: ["there", "a", "is", "park"], answer: "Is there a park?" },
              { words: ["are", "there", "three", "cats"], answer: "There are three cats." },
            ],
          },
        ],
      },

      {
        id: "review",
        title: "חזרה",
        titleEn: "Review",
        remember: {
          note: "בעברית: יש, אין. באנגלית is או are — לפי אחד או הרבה:",
          noteEn: "One or many decides is or are:",
          chips: ["יש כלב = There is a dog.", "יש שני כלבים = There are two dogs.", "אין חתול = There isn't a cat."],
        },
        tasks: [
          {
            type: "rewrite",
            instructions: "מצאו את הטעות ותקנו.",
            instructionsEn: "Find the mistake and fix it.",
            example: { text: "There are a cat.", answer: "There is a cat." },
            items: [
              { text: "There is two dogs.", answer: "There are two dogs." },
              { text: "There a park here.", answer: "There is a park here." },
              { text: "Is there two beds?", answer: "Are there two beds?" },
              { text: "How many cat are there?", answer: "How many cats are there?" },
            ],
          },
          {
            type: "rewrite",
            instructions: "תרגמו לאנגלית.",
            instructionsEn: "Translate into English.",
            items: [
              { text: "יש חתול בגינה.", answer: "There is a cat in the garden." },
              { text: "אין פארק.", answer: "There isn't a park." },
              { text: "יש כלב?", answer: "Is there a dog?" },
            ],
          },
          {
            type: "about",
            instructions: "כתבו על החדר שלכם.",
            instructionsEn: "Write about your room.",
            items: [
              { text: "In my room there is ___.", sample: "a bed" },
              { text: "In my room there are ___.", sample: "two chairs" },
              { text: "There isn't ___ in my room.", sample: "a TV" },
            ],
          },
        ],
      },
    ],
  },

  prepositions: {
    sheets: [
      {
        id: "in-on-under",
        title: "in, on, under",
        titleEn: "in, on, under",
        remember: {
          note: "איפה זה נמצא?",
          noteEn: "Where is it?",
          chips: ["in = בתוך", "on = על", "under = מתחת ל־"],
        },
        tasks: [
          {
            type: "fill",
            instructions: "איפה הכדור? הסתכלו וכתבו in, on או under.",
            instructionsEn: "Where is the ball? Look and write in, on or under.",
            cols: 2,
            items: [
              { img: "prep-in", text: "___ the box.", answer: "in" },
              { img: "prep-on", text: "___ the box.", answer: "on" },
              { img: "prep-under", text: "___ the table.", answer: "under" },
            ],
          },
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            options: ["in", "on", "under"],
            items: [
              { text: "The book is ___ the table.", answer: "on" },
              { text: "The cat is ___ the bed.", answer: "under" },
              { text: "The pen is ___ the bag.", answer: "in" },
              { text: "The cup is ___ the table.", answer: "on" },
              { text: "The milk is ___ the fridge.", answer: "in" },
            ],
          },
          {
            type: "rewrite",
            instructions: "תרגמו לאנגלית.",
            instructionsEn: "Translate into English.",
            example: { text: "הכדור בקופסה.", answer: "The ball is in the box." },
            items: [
              { text: "הספר על השולחן.", answer: "The book is on the table." },
              { text: "החתול מתחת למיטה.", answer: "The cat is under the bed." },
              { text: "העט בתיק.", answer: "The pen is in the bag." },
            ],
          },
        ],
      },

      {
        id: "next-to",
        title: "next to, between, behind",
        titleEn: "next to, between, behind",
        remember: {
          note: "עוד מילים של מקום:",
          noteEn: "More place words:",
          chips: ["next to = ליד", "between = בין", "behind = מאחורי", "in front of = מול"],
        },
        tasks: [
          {
            type: "fill",
            instructions: "איפה הכדור? הסתכלו וכתבו.",
            instructionsEn: "Where is the ball? Look and write.",
            cols: 2,
            items: [
              { img: "prep-next-to", text: "___ the box.", answer: "next to" },
              { img: "prep-between", text: "___ the boxes.", answer: "between" },
              { img: "prep-on", text: "___ the box.", answer: "on" },
              { img: "prep-under", text: "___ the table.", answer: "under" },
            ],
          },
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            items: [
              { text: "I sit ___ Ben.", options: ["next to", "between"], answer: "next to" },
              { text: "The ball is ___ the two boxes.", options: ["behind", "between"], answer: "between" },
              { text: "The dog is ___ the tree.", options: ["behind", "between"], answer: "behind" },
              { text: "The car is ___ the house.", options: ["in front of", "between"], answer: "in front of" },
            ],
          },
          {
            type: "order",
            instructions: "סדרו את המילים למשפט.",
            instructionsEn: "Put the words in order.",
            items: [
              { words: ["next", "sit", "I", "to", "Ben"], answer: "I sit next to Ben." },
              { words: ["behind", "it", "the", "is", "tree"], answer: "It is behind the tree." },
              { words: ["the", "is", "where", "ball"], answer: "Where is the ball?" },
            ],
          },
        ],
      },

      {
        id: "at",
        title: "at home, at school",
        titleEn: "at home, at school",
        remember: {
          note: "על מקום שהולכים אליו כל יום אומרים at:",
          noteEn: "For places we go to every day, say at:",
          chips: ["at home = בבית", "at school = בבית הספר", "at work = בעבודה"],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            options: ["at", "in", "on"],
            items: [
              { text: "I am ___ school.", answer: "at" },
              { text: "Dad is ___ work.", answer: "at" },
              { text: "The cat is ___ the box.", answer: "in" },
              { text: "We are ___ home.", answer: "at" },
              { text: "The pen is ___ the table.", answer: "on" },
            ],
          },
          {
            type: "rewrite",
            instructions: "תרגמו לאנגלית.",
            instructionsEn: "Translate into English.",
            example: { text: "אני בבית.", answer: "I am at home." },
            items: [
              { text: "הוא בבית הספר.", answer: "He is at school." },
              { text: "אבא בעבודה.", answer: "Dad is at work." },
              { text: "הם בבית.", answer: "They are at home." },
            ],
          },
          {
            type: "about",
            instructions: "כתבו על עצמכם.",
            instructionsEn: "Write about yourself.",
            items: [
              { text: "In the morning I am at ___.", sample: "school" },
              { text: "In the evening I am at ___.", sample: "home" },
              { text: "My bag is ___ my room.", sample: "in" },
            ],
          },
        ],
      },

      {
        id: "review",
        title: "חזרה",
        titleEn: "Review",
        remember: {
          note: "Where is…? שואלת איפה משהו נמצא:",
          noteEn: "Where is…? asks where something is:",
          chips: ["Where is the cat? — It is under the bed.", "Where are the books? — They are on the table."],
        },
        tasks: [
          {
            type: "rewrite",
            instructions: "מצאו את הטעות ותקנו.",
            instructionsEn: "Find the mistake and fix it.",
            example: { text: "I sit next Ben.", answer: "I sit next to Ben." },
            items: [
              { text: "The ball is between the box.", answer: "The ball is between the boxes." },
              { text: "The dog is behind of the tree.", answer: "The dog is behind the tree." },
              { text: "He is at the home.", answer: "He is at home." },
            ],
          },
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            items: [
              { text: "Where is the cat? It is ___ the bed.", options: ["under", "at"], answer: "under" },
              { text: "Where are the books? They are ___ the table.", options: ["between", "on"], answer: "on" },
              { text: "Where is Dan? He is ___ school.", options: ["at", "under"], answer: "at" },
              { text: "The ball is ___ the two boxes.", options: ["on", "between"], answer: "between" },
            ],
          },
          {
            type: "order",
            instructions: "סדרו את המילים למשפט.",
            instructionsEn: "Put the words in order.",
            items: [
              { words: ["the", "where", "is", "cat"], answer: "Where is the cat?" },
              { words: ["are", "the", "where", "books"], answer: "Where are the books?" },
              { words: ["under", "it", "the", "is", "bed"], answer: "It is under the bed." },
            ],
          },
        ],
      },
    ],
  },

  /* ── From here on, a sheet for every short lesson of the topic (and two
     for a topic with one lesson or none). ── */

  letters: {
    sheets: [
      {
        id: "abc",
        title: "ה־ABC",
        titleEn: "The ABC",
        remember: {
          note: "לכל אות יש אות גדולה ואות קטנה:",
          noteEn: "Every letter has a big and a small form:",
          chips: ["A a", "B b", "D d", "G g", "M m", "S s"],
        },
        tasks: [
          {
            type: "fill",
            instructions: "כתבו את האות הקטנה.",
            instructionsEn: "Write the small letter.",
            cols: 3,
            items: [
              { text: "A → ___", answer: "a", example: true },
              { text: "B → ___", answer: "b" },
              { text: "D → ___", answer: "d" },
              { text: "G → ___", answer: "g" },
              { text: "M → ___", answer: "m" },
              { text: "T → ___", answer: "t" },
            ],
          },
          {
            type: "fill",
            instructions: "הסתכלו וכתבו את האות הראשונה.",
            instructionsEn: "Look and write the first letter.",
            cols: 3,
            items: [
              { img: "cat", text: "___at", answer: "c" },
              { img: "dog", text: "___og", answer: "d" },
              { img: "sun", text: "___un", answer: "s" },
              { img: "ball", text: "___all", answer: "b" },
              { img: "moon", text: "___oon", answer: "m" },
              { img: "fish", text: "___ish", answer: "f" },
            ],
          },
          {
            type: "fill",
            instructions: "כתבו את האות החסרה.",
            instructionsEn: "Write the missing letter.",
            cols: 3,
            items: [
              { text: "A B ___ D", answer: "C" },
              { text: "K L ___ N", answer: "M" },
              { text: "R S ___ U", answer: "T" },
              { text: "E F ___ H", answer: "G" },
              { text: "O P ___ R", answer: "Q" },
              { text: "W X ___ Z", answer: "Y" },
            ],
          },
        ],
      },

      {
        id: "vowels",
        title: "תנועות וקריאה",
        titleEn: "Vowels: a, e, i, o, u",
        remember: {
          note: "התנועות באנגלית:",
          noteEn: "The vowels in English:",
          chips: ["a — cat", "e — bed", "i — six", "o — dog", "u — sun"],
        },
        tasks: [
          {
            type: "fill",
            instructions: "הסתכלו וכתבו את התנועה החסרה.",
            instructionsEn: "Look and write the missing vowel.",
            cols: 3,
            items: [
              { img: "cat", text: "c___t", answer: "a" },
              { img: "bed", text: "b___d", answer: "e" },
              { img: "num-6", text: "s___x", answer: "i" },
              { img: "dog", text: "d___g", answer: "o" },
              { img: "sun", text: "s___n", answer: "u" },
              { img: "pen", text: "p___n", answer: "e" },
            ],
          },
          {
            type: "rewrite",
            instructions: "תרגמו לאנגלית.",
            instructionsEn: "Translate into English.",
            example: { text: "חתול", answer: "cat" },
            items: [
              { text: "כלב", answer: "dog" },
              { text: "שמש", answer: "sun" },
              { text: "מיטה", answer: "bed" },
            ],
          },
          {
            type: "order",
            instructions: "סדרו את האותיות למילה.",
            instructionsEn: "Put the letters in order.",
            items: [
              { words: ["o", "d", "g"], answer: "dog" },
              { words: ["n", "s", "u"], answer: "sun" },
              { words: ["d", "e", "b"], answer: "bed" },
              { words: ["x", "i", "s"], answer: "six" },
            ],
          },
        ],
      },
    ],
  },

  phonics: {
    sheets: [
      {
        id: "sh-ch-th",
        title: "שתי אותיות — צליל אחד",
        titleEn: "sh, ch, th",
        remember: {
          note: "שתי אותיות יחד — צליל אחד:",
          noteEn: "Two letters together make one sound:",
          chips: ["sh — fish", "ch — chair", "th — three"],
        },
        tasks: [
          {
            type: "fill",
            instructions: "הסתכלו וכתבו sh, ch או th.",
            instructionsEn: "Look and write sh, ch or th.",
            cols: 2,
            items: [
              { img: "fish", text: "fi___", answer: "sh" },
              { img: "chair", text: "___air", answer: "ch" },
              { img: "num-3", text: "___ree", answer: "th" },
              { img: "shoes", text: "___oes", answer: "sh" },
              { img: "cheese", text: "___eese", answer: "ch" },
              { img: "mouth", text: "mou___", answer: "th" },
            ],
          },
          {
            type: "circle",
            instructions: "הקיפו את האותיות הנכונות.",
            instructionsEn: "Circle the right letters.",
            options: ["sh", "ch", "th"],
            items: [
              { text: "lun___", answer: "ch" },
              { text: "___ank you", answer: "th" },
              { text: "bru___", answer: "sh" },
              { text: "tea___er", answer: "ch" },
            ],
          },
          {
            type: "rewrite",
            instructions: "תרגמו לאנגלית.",
            instructionsEn: "Translate into English.",
            example: { text: "דג", answer: "fish" },
            items: [
              { text: "כיסא", answer: "chair" },
              { text: "שלוש", answer: "three" },
              { text: "נעליים", answer: "shoes" },
            ],
          },
        ],
      },

      {
        id: "ee-oo",
        title: "ee, oo, e שקטה",
        titleEn: "ee, oo and Silent e",
        remember: {
          note: "ee נשמע אִי, oo נשמע אוּ, ו־e בסוף המילה לא נשמעת:",
          noteEn: "ee says “ee”, oo says “oo”, and an e at the end is silent:",
          chips: ["tree", "moon", "cap → cape", "kit → kite"],
        },
        tasks: [
          {
            type: "fill",
            instructions: "הסתכלו וכתבו ee או oo.",
            instructionsEn: "Look and write ee or oo.",
            cols: 3,
            items: [
              { img: "tree", text: "tr___", answer: "ee" },
              { img: "moon", text: "m___n", answer: "oo" },
              { img: "foot", text: "f___t", answer: "oo" },
              { img: "num-3", text: "thr___", answer: "ee" },
              { img: "book", text: "b___k", answer: "oo" },
              { img: "tooth", text: "t___th", answer: "oo" },
            ],
          },
          {
            type: "circle",
            instructions: "הקיפו את האותיות הנכונות.",
            instructionsEn: "Circle the right letters.",
            options: ["ee", "oo"],
            items: [
              { text: "gr___n", answer: "ee" },
              { text: "sch___l", answer: "oo" },
              { text: "sl___p", answer: "ee" },
              { text: "f___d", answer: "oo" },
            ],
          },
          {
            type: "fill",
            instructions: "הוסיפו e בסוף וכתבו את המילה החדשה.",
            instructionsEn: "Add a silent e and write the new word.",
            cols: 2,
            items: [
              { text: "cap → ___", answer: "cape" },
              { text: "kit → ___", answer: "kite" },
              { text: "hop → ___", answer: "hope" },
              { text: "cut → ___", answer: "cute" },
            ],
          },
        ],
      },
    ],
  },

  verbs: {
    sheets: [
      {
        id: "verbs",
        title: "מה עושים?",
        titleEn: "What Do We Do?",
        remember: {
          note: "פעלים הם מילים של עשייה:",
          noteEn: "Verbs are doing words:",
          chips: ["play = משחקים", "eat = אוכלים", "read = קוראים", "run = רצים", "drink = שותים", "sleep = ישנים"],
        },
        tasks: [
          {
            type: "fill",
            instructions: "כתבו את הפועל המתאים.",
            instructionsEn: "Write the right verb.",
            cols: 2,
            items: [
              { text: "I ___ water.", answer: "drink" },
              { text: "I ___ a book.", answer: "read" },
              { text: "I ___ at night.", answer: "sleep" },
              { text: "I ___ fast.", answer: "run" },
              { text: "I ___ pizza.", answer: "eat" },
              { text: "I ___ football.", answer: "play" },
            ],
          },
          {
            type: "circle",
            instructions: "הקיפו את הפועל הנכון.",
            instructionsEn: "Circle the right verb.",
            items: [
              { text: "We ___ lunch.", options: ["eat", "sleep"], answer: "eat" },
              { text: "They ___ books.", options: ["drink", "read"], answer: "read" },
              { text: "You ___ water.", options: ["drink", "run"], answer: "drink" },
              { text: "I ___ to school every day.", options: ["go", "eat"], answer: "go" },
            ],
          },
          {
            type: "rewrite",
            instructions: "תרגמו לאנגלית.",
            instructionsEn: "Translate into English.",
            example: { text: "אני משחק.", answer: "I play." },
            items: [
              { text: "אנחנו אוכלים.", answer: "We eat." },
              { text: "הם קוראים ספרים.", answer: "They read books." },
              { text: "אתה שותה מים.", answer: "You drink water." },
            ],
          },
        ],
      },

      {
        id: "he-plays",
        title: "he plays",
        titleEn: "He Plays",
        remember: {
          note: "עם he, she, it מוסיפים s לפועל:",
          noteEn: "With he, she, it, add s to the verb:",
          chips: ["I play → he plays", "I eat → he eats", "I watch → he watches", "I go → he goes"],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את הפועל הנכון.",
            instructionsEn: "Circle the right verb.",
            items: [
              { text: "He ___ football.", options: ["play", "plays"], answer: "plays" },
              { text: "I ___ pizza.", options: ["eat", "eats"], answer: "eat" },
              { text: "The dog ___ fast.", options: ["run", "runs"], answer: "runs" },
              { text: "We ___ books.", options: ["read", "reads"], answer: "read" },
              { text: "Tom ___ TV.", options: ["watch", "watches"], answer: "watches" },
            ],
          },
          {
            type: "fill",
            instructions: "כתבו את הפועל עם s, es או ies.",
            instructionsEn: "Write the verb with s, es or ies.",
            cols: 2,
            items: [
              { text: "play → he ___", answer: "plays" },
              { text: "eat → he ___", answer: "eats" },
              { text: "watch → he ___", answer: "watches" },
              { text: "go → he ___", answer: "goes" },
              { text: "fly → it ___", answer: "flies" },
              { text: "wash → he ___", answer: "washes" },
            ],
          },
          {
            type: "rewrite",
            instructions: "כתבו את המשפט עם He.",
            instructionsEn: "Write the sentence with He.",
            example: { text: "I play football.", answer: "He plays football." },
            items: [
              { text: "I eat pizza.", answer: "He eats pizza." },
              { text: "I read books.", answer: "He reads books." },
              { text: "I go to school.", answer: "He goes to school." },
            ],
          },
        ],
      },
    ],
  },

  "object-pronouns": {
    sheets: [
      {
        id: "me-him",
        title: "me, him, them",
        titleEn: "me, him, them",
        remember: {
          note: "אחרי הפועל אומרים me, him, them:",
          noteEn: "After the verb, say me, him, them:",
          chips: ["I → me", "he → him", "she → her", "we → us", "they → them"],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            items: [
              { text: "Dan sees ___.", options: ["I", "me"], answer: "me" },
              { text: "I help Ben. I help ___.", options: ["he", "him"], answer: "him" },
              { text: "We call the boys. We call ___.", options: ["they", "them"], answer: "them" },
              { text: "He helps Dan and me. He helps ___.", options: ["we", "us"], answer: "us" },
              { text: "I like the dog. I like ___.", options: ["it", "him"], answer: "it" },
            ],
          },
          {
            type: "rewrite",
            instructions: "כתבו את המשפט עם me, him, it, us או them.",
            instructionsEn: "Write the sentence with me, him, it, us or them.",
            example: { text: "I see Dan.", answer: "I see him." },
            items: [
              { text: "I like the cats.", answer: "I like them." },
              { text: "Dad calls Ben and me.", answer: "Dad calls us." },
              { text: "I help my brother.", answer: "I help him." },
            ],
          },
          {
            type: "fill",
            instructions: "כתבו את המילה שבאה אחרי הפועל.",
            instructionsEn: "Write the word that comes after the verb.",
            cols: 3,
            items: [
              { text: "I → ___", answer: "me", example: true },
              { text: "he → ___", answer: "him" },
              { text: "we → ___", answer: "us" },
              { text: "they → ___", answer: "them" },
              { text: "it → ___", answer: "it" },
              { text: "you → ___", answer: "you" },
            ],
          },
        ],
      },

      {
        id: "with-me",
        title: "with me, for him",
        titleEn: "with me, for him, to them",
        remember: {
          note: "גם אחרי with, to, for באים me, him, them:",
          noteEn: "After with, to, for come me, him, them too:",
          chips: ["with me = איתי", "for him = בשבילו", "to them = אליהם"],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            items: [
              { text: "Come with ___!", options: ["I", "me"], answer: "me" },
              { text: "This book is for Dan. It is for ___.", options: ["him", "he"], answer: "him" },
              { text: "I play with Dan and Ben. I play with ___.", options: ["they", "them"], answer: "them" },
              { text: "He talks to Ben and me. He talks to ___.", options: ["us", "we"], answer: "us" },
            ],
          },
          {
            type: "rewrite",
            instructions: "תרגמו לאנגלית.",
            instructionsEn: "Translate into English.",
            example: { text: "בוא איתי!", answer: "Come with me!" },
            items: [
              { text: "זה בשבילו.", answer: "This is for him." },
              { text: "אני משחק איתם.", answer: "I play with them." },
              { text: "הוא מדבר אלינו.", answer: "He talks to us." },
            ],
          },
          {
            type: "order",
            instructions: "סדרו את המילים למשפט.",
            instructionsEn: "Put the words in order.",
            items: [
              { words: ["me", "with", "come"], answer: "Come with me!" },
              { words: ["him", "for", "is", "this"], answer: "This is for him." },
              { words: ["them", "with", "play", "I"], answer: "I play with them." },
            ],
          },
        ],
      },
    ],
  },

  negation: {
    sheets: [
      {
        id: "dont",
        title: "don't / doesn't",
        titleEn: "don't, doesn't",
        remember: {
          note: "בשלילה don't, ועם he, she, it — doesn't. אחרי doesn't הפועל בלי s:",
          noteEn: "Negative: don't; with he, she, it — doesn't. After doesn't, no s:",
          chips: ["I don't like fish.", "He doesn't swim.", "doesn't play (no s)"],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            options: ["don't", "doesn't"],
            items: [
              { text: "I ___ like fish.", answer: "don't" },
              { text: "He ___ swim.", answer: "doesn't" },
              { text: "We ___ play here.", answer: "don't" },
              { text: "The cat ___ eat bread.", answer: "doesn't" },
              { text: "They ___ eat meat.", answer: "don't" },
            ],
          },
          {
            type: "rewrite",
            instructions: "כתבו את המשפט בשלילה.",
            instructionsEn: "Write the sentence in the negative.",
            example: { text: "I like milk.", answer: "I don't like milk." },
            items: [
              { text: "He plays football.", answer: "He doesn't play football." },
              { text: "We eat fish.", answer: "We don't eat fish." },
              { text: "The dog runs.", answer: "The dog doesn't run." },
            ],
          },
          {
            type: "fill",
            instructions: "כתבו don't או doesn't.",
            instructionsEn: "Write don't or doesn't.",
            cols: 2,
            items: [
              { text: "You ___ run.", answer: "don't" },
              { text: "Dan ___ read.", answer: "doesn't" },
              { text: "It ___ fly.", answer: "doesn't" },
              { text: "I ___ sing.", answer: "don't" },
            ],
          },
        ],
      },

      {
        id: "do-does",
        title: "Do / Does – שאלות",
        titleEn: "Do you? Does he?",
        remember: {
          note: "בשאלה Do, ועם he, she, it — Does. אחרי Does הפועל בלי s:",
          noteEn: "Questions: Do; with he, she, it — Does. After Does, no s:",
          chips: ["Do you like pizza? — Yes, I do.", "Does he like dogs? — No, he doesn't."],
        },
        tasks: [
          {
            type: "fill",
            instructions: "כתבו Do או Does.",
            instructionsEn: "Write Do or Does.",
            cols: 2,
            items: [
              { text: "___ you like pizza?", answer: "Do" },
              { text: "___ he like dogs?", answer: "Does" },
              { text: "___ they play football?", answer: "Do" },
              { text: "___ the bus stop here?", answer: "Does" },
              { text: "___ you live here?", answer: "Do" },
              { text: "___ Dan read books?", answer: "Does" },
            ],
          },
          {
            type: "circle",
            instructions: "הקיפו את התשובה הנכונה.",
            instructionsEn: "Circle the right answer.",
            items: [
              { text: "Do you like fish? — Yes, I ___.", options: ["do", "does"], answer: "do" },
              { text: "Does he swim? — No, he ___.", options: ["don't", "doesn't"], answer: "doesn't" },
              { text: "Do they play? — Yes, they ___.", options: ["do", "does"], answer: "do" },
              { text: "Does the dog run? — Yes, it ___.", options: ["do", "does"], answer: "does" },
            ],
          },
          {
            type: "rewrite",
            instructions: "הפכו את המשפט לשאלה.",
            instructionsEn: "Make the sentence a question.",
            example: { text: "You like pizza.", answer: "Do you like pizza?" },
            items: [
              { text: "He likes dogs.", answer: "Does he like dogs?" },
              { text: "They live here.", answer: "Do they live here?" },
              { text: "Dan plays football.", answer: "Does Dan play football?" },
            ],
          },
        ],
      },
    ],
  },

  imperatives: {
    sheets: [
      {
        id: "commands",
        title: "Sit down, Don't run",
        titleEn: "Sit Down! Don't Run!",
        remember: {
          note: "בציווי מתחילים בפועל. כדי לומר אל — Don't:",
          noteEn: "A command starts with the verb. To say “don't” — Don't:",
          chips: ["Sit down.", "Open your book.", "Don't run.", "Close the door, please."],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            items: [
              { text: "___ your book.", options: ["Open", "Opens"], answer: "Open" },
              { text: "___ run!", options: ["Not", "Don't"], answer: "Don't" },
              { text: "Sit ___, please.", options: ["down", "up"], answer: "down" },
              { text: "Stand ___!", options: ["up", "down"], answer: "up" },
            ],
          },
          {
            type: "rewrite",
            instructions: "כתבו עם Don't.",
            instructionsEn: "Write it with Don't.",
            example: { text: "Run.", answer: "Don't run." },
            items: [
              { text: "Talk.", answer: "Don't talk." },
              { text: "Open the door.", answer: "Don't open the door." },
              { text: "Sit down.", answer: "Don't sit down." },
            ],
          },
          {
            type: "rewrite",
            instructions: "תרגמו לאנגלית.",
            instructionsEn: "Translate into English.",
            example: { text: "שב.", answer: "Sit down." },
            items: [
              { text: "פתח את הספר.", answer: "Open the book.", alt: "Open your book." },
              { text: "אל תרוץ!", answer: "Don't run!" },
              { text: "תקשיב לי.", answer: "Listen to me." },
            ],
          },
        ],
      },

      {
        id: "lets",
        title: "בואו נעשה",
        titleEn: "Let's Play!",
        remember: {
          note: "Let's = בואו. אחרי Let's בא פועל, בלי to:",
          noteEn: "Let's + a verb, with no to:",
          chips: ["Let's play.", "Let's go home.", "Let's read a book."],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            items: [
              { text: "Let's ___ football.", options: ["play", "to play"], answer: "play" },
              { text: "Let's ___ a song.", options: ["sing", "sings"], answer: "sing" },
              { text: "Let's ___ a book.", options: ["reading", "read"], answer: "read" },
              { text: "Let's ___ home.", options: ["go", "goes"], answer: "go" },
            ],
          },
          {
            type: "order",
            instructions: "סדרו את המילים למשפט.",
            instructionsEn: "Put the words in order.",
            items: [
              { words: ["home", "go", "let's"], answer: "Let's go home." },
              { words: ["a", "read", "let's", "book"], answer: "Let's read a book." },
              { words: ["song", "sing", "a", "let's"], answer: "Let's sing a song." },
            ],
          },
          {
            type: "rewrite",
            instructions: "מצאו את הטעות ותקנו.",
            instructionsEn: "Find the mistake and fix it.",
            example: { text: "Let's to play.", answer: "Let's play." },
            items: [
              { text: "Let's plays football.", answer: "Let's play football." },
              { text: "Not run!", answer: "Don't run!" },
              { text: "Opens your book.", answer: "Open your book." },
            ],
          },
        ],
      },
    ],
  },

  questions: {
    sheets: [
      {
        id: "what-who-where",
        title: "What, Who, Where",
        titleEn: "What? Who? Where?",
        remember: {
          note: "What = מה, Who = מי, Where = איפה:",
          noteEn: "What, Who and Where:",
          chips: ["What is your name?", "Who is he?", "Where is my bag?"],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את מילת השאלה הנכונה.",
            instructionsEn: "Circle the right question word.",
            options: ["What", "Who", "Where"],
            items: [
              { text: "___ is your name?", answer: "What" },
              { text: "___ is your teacher?", answer: "Who" },
              { text: "___ is my bag?", answer: "Where" },
              { text: "___ is this?", answer: "What" },
            ],
          },
          {
            type: "circle",
            instructions: "הקיפו את התשובה הנכונה.",
            instructionsEn: "Circle the right answer.",
            items: [
              { text: "Who is he? — ___", options: ["He is my brother.", "He is at school."], answer: "He is my brother." },
              { text: "Where is the cat? — ___", options: ["It is a cat.", "It is under the bed."], answer: "It is under the bed." },
              { text: "What is this? — ___", options: ["It is a pen.", "It is on the table."], answer: "It is a pen." },
            ],
          },
          {
            type: "rewrite",
            instructions: "תרגמו לאנגלית.",
            instructionsEn: "Translate into English.",
            example: { text: "מה זה?", answer: "What is this?" },
            items: [
              { text: "מי המורה שלך?", answer: "Who is your teacher?" },
              { text: "איפה הכלב?", answer: "Where is the dog?" },
              { text: "מה השם שלך?", answer: "What is your name?" },
            ],
          },
        ],
      },

      {
        id: "when-why-how",
        title: "When, Why, How",
        titleEn: "When? Why? How?",
        remember: {
          note: "When = מתי, Why = למה, How = איך:",
          noteEn: "When, Why and How:",
          chips: ["When is your birthday?", "Why? — Because…", "How old are you?", "How many cats?"],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את מילת השאלה הנכונה.",
            instructionsEn: "Circle the right question word.",
            options: ["When", "Why", "How"],
            items: [
              { text: "___ is your birthday? — In May.", answer: "When" },
              { text: "___ are you? — I am fine.", answer: "How" },
              { text: "___ are you happy? — Because it is my birthday.", answer: "Why" },
              { text: "___ old are you?", answer: "How" },
            ],
          },
          {
            type: "circle",
            instructions: "הקיפו את התשובה הנכונה.",
            instructionsEn: "Circle the right answer.",
            items: [
              { text: "When is your birthday? — ___", options: ["It is in May.", "Because it is hot."], answer: "It is in May." },
              { text: "Why are you happy? — ___", options: ["I am ten.", "Because it is my birthday."], answer: "Because it is my birthday." },
              { text: "How many cats do you have? — ___", options: ["Two cats.", "In May."], answer: "Two cats." },
            ],
          },
          {
            type: "order",
            instructions: "סדרו את המילים לשאלה.",
            instructionsEn: "Put the words in order.",
            items: [
              { words: ["your", "when", "birthday", "is"], answer: "When is your birthday?" },
              { words: ["you", "are", "how", "old"], answer: "How old are you?" },
              { words: ["happy", "you", "why", "are"], answer: "Why are you happy?" },
            ],
          },
        ],
      },
    ],
  },

  frequency: {
    sheets: [
      {
        id: "always-never",
        title: "always, never",
        titleEn: "always, sometimes, never",
        remember: {
          note: "כמה פעמים? מ־always ועד never:",
          noteEn: "How often? From always to never:",
          chips: ["always = תמיד", "usually = בדרך כלל", "often = הרבה פעמים", "sometimes = לפעמים", "never = אף פעם"],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            items: [
              { text: "I ___ brush my teeth in the morning. (100%)", options: ["always", "never"], answer: "always" },
              { text: "We ___ go to school on Saturday. (0%)", options: ["always", "never"], answer: "never" },
              { text: "He ___ eats eggs for breakfast. (80%)", options: ["usually", "never"], answer: "usually" },
              { text: "They ___ play chess. (30%)", options: ["always", "sometimes"], answer: "sometimes" },
            ],
          },
          {
            type: "rewrite",
            instructions: "הכניסו את המילה למשפט.",
            instructionsEn: "Put the word in the sentence.",
            example: { text: "I eat breakfast. (always)", answer: "I always eat breakfast." },
            items: [
              { text: "He reads books. (often)", answer: "He often reads books." },
              { text: "We play football. (sometimes)", answer: "We sometimes play football." },
              { text: "They watch TV. (never)", answer: "They never watch TV." },
            ],
          },
          {
            type: "about",
            instructions: "כתבו על עצמכם.",
            instructionsEn: "Write about yourself.",
            items: [
              { text: "I always ___.", sample: "brush my teeth" },
              { text: "I sometimes ___.", sample: "play chess" },
              { text: "I never ___.", sample: "eat fish" },
            ],
          },
        ],
      },

      {
        id: "position",
        title: "איפה המילה במשפט",
        titleEn: "Where Does the Word Go?",
        remember: {
          note: "לפני הפועל, אבל אחרי am, is, are:",
          noteEn: "Before the verb, but after am, is, are:",
          chips: ["I always eat breakfast.", "He is never late."],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המשפט הנכון.",
            instructionsEn: "Circle the right sentence.",
            items: [
              { text: "___", options: ["He never is late.", "He is never late."], answer: "He is never late." },
              { text: "___", options: ["We usually eat at seven.", "We eat usually at seven."], answer: "We usually eat at seven." },
              { text: "___", options: ["I brush always my teeth.", "I always brush my teeth."], answer: "I always brush my teeth." },
              { text: "___", options: ["My brother is always hungry.", "My brother always is hungry."], answer: "My brother is always hungry." },
            ],
          },
          {
            type: "rewrite",
            instructions: "הכניסו את המילה למשפט.",
            instructionsEn: "Put the word in the sentence.",
            example: { text: "He is late. (never)", answer: "He is never late." },
            items: [
              { text: "I am happy. (always)", answer: "I am always happy." },
              { text: "We walk to school. (usually)", answer: "We usually walk to school." },
              { text: "My cat sleeps here. (often)", answer: "My cat often sleeps here." },
            ],
          },
          {
            type: "order",
            instructions: "סדרו את המילים למשפט.",
            instructionsEn: "Put the words in order.",
            items: [
              { words: ["late", "is", "never", "he"], answer: "He is never late." },
              { words: ["always", "I", "breakfast", "eat"], answer: "I always eat breakfast." },
              { words: ["often", "he", "reads"], answer: "He often reads." },
            ],
          },
        ],
      },
    ],
  },

  calendar: {
    sheets: [
      {
        id: "days",
        title: "ימי השבוע",
        titleEn: "Days of the Week",
        remember: {
          note: "ימי השבוע מתחילים באות גדולה:",
          noteEn: "The days start with a capital letter:",
          chips: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        },
        tasks: [
          {
            type: "fill",
            instructions: "כתבו את היום הבא.",
            instructionsEn: "Write the next day.",
            cols: 2,
            items: [
              { text: "Sunday → ___", answer: "Monday" },
              { text: "Monday → ___", answer: "Tuesday" },
              { text: "Wednesday → ___", answer: "Thursday" },
              { text: "Thursday → ___", answer: "Friday" },
              { text: "Friday → ___", answer: "Saturday" },
              { text: "Saturday → ___", answer: "Sunday" },
            ],
          },
          {
            type: "rewrite",
            instructions: "תרגמו לאנגלית.",
            instructionsEn: "Translate into English.",
            example: { text: "יום ראשון", answer: "Sunday" },
            items: [
              { text: "יום שלישי", answer: "Tuesday" },
              { text: "יום חמישי", answer: "Thursday" },
              { text: "שבת", answer: "Saturday", alt: "Shabbat" },
            ],
          },
          {
            type: "circle",
            instructions: "הקיפו את התשובה הנכונה.",
            instructionsEn: "Circle the right answer.",
            items: [
              { text: "What day is it today? — It is ___.", options: ["monday", "Monday"], answer: "Monday" },
              { text: "We rest on ___.", options: ["Saturday", "Tuesday"], answer: "Saturday" },
              { text: "I play football ___ Monday.", options: ["on", "in"], answer: "on" },
              { text: "The day after Sunday is ___.", options: ["Friday", "Monday"], answer: "Monday" },
            ],
          },
        ],
      },

      {
        id: "months",
        title: "חודשים ועונות",
        titleEn: "Months and Seasons",
        remember: {
          note: "העונות בשנה:",
          noteEn: "The seasons of the year:",
          chips: ["winter = חורף", "spring = אביב", "summer = קיץ", "autumn = סתיו"],
        },
        tasks: [
          {
            type: "fill",
            instructions: "כתבו את החודש הבא.",
            instructionsEn: "Write the next month.",
            cols: 2,
            items: [
              { text: "January → ___", answer: "February" },
              { text: "March → ___", answer: "April" },
              { text: "May → ___", answer: "June" },
              { text: "July → ___", answer: "August" },
              { text: "September → ___", answer: "October" },
              { text: "November → ___", answer: "December" },
            ],
          },
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            items: [
              { text: "It is hot in ___.", options: ["summer", "winter"], answer: "summer" },
              { text: "It is cold in ___.", options: ["summer", "winter"], answer: "winter" },
              { text: "My birthday is ___ May.", options: ["in", "on"], answer: "in" },
              { text: "Flowers grow in ___.", options: ["autumn", "spring"], answer: "spring" },
            ],
          },
          {
            type: "about",
            instructions: "כתבו על עצמכם.",
            instructionsEn: "Write about yourself.",
            items: [
              { text: "My birthday is in ___.", sample: "May" },
              { text: "My favorite season is ___.", sample: "summer" },
              { text: "Today is ___.", sample: "Monday" },
            ],
          },
        ],
      },
    ],
  },

  ordinals: {
    sheets: [
      {
        id: "first",
        title: "first, second, third",
        titleEn: "first, second, third",
        remember: {
          note: "מספר סידורי אומר באיזה מקום:",
          noteEn: "Ordinal numbers say which place:",
          chips: ["one → first", "two → second", "three → third", "four → fourth", "five → fifth"],
        },
        tasks: [
          {
            type: "fill",
            instructions: "כתבו את המספר הסידורי.",
            instructionsEn: "Write the ordinal number.",
            cols: 2,
            items: [
              { text: "one → ___", answer: "first", example: true },
              { text: "two → ___", answer: "second" },
              { text: "three → ___", answer: "third" },
              { text: "four → ___", answer: "fourth" },
              { text: "five → ___", answer: "fifth" },
              { text: "ten → ___", answer: "tenth" },
            ],
          },
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            items: [
              { text: "Dan is ___ in line. (1)", options: ["first", "one"], answer: "first" },
              { text: "This is the ___ door. (2)", options: ["two", "second"], answer: "second" },
              { text: "I am in the ___ grade. (5)", options: ["fifth", "five"], answer: "fifth" },
              { text: "We live on the ___ floor. (3)", options: ["three", "third"], answer: "third" },
            ],
          },
          {
            type: "rewrite",
            instructions: "מצאו את הטעות ותקנו.",
            instructionsEn: "Find the mistake and fix it.",
            example: { text: "This is the two door.", answer: "This is the second door." },
            items: [
              { text: "I am in the four grade.", answer: "I am in the fourth grade." },
              { text: "He is the one in line.", answer: "He is the first in line." },
              { text: "We live on the three floor.", answer: "We live on the third floor." },
            ],
          },
        ],
      },

      {
        id: "more",
        title: "עוד מספרים סידוריים",
        titleEn: "sixth, eighth, twelfth",
        remember: {
          note: "ברוב המספרים מוסיפים th:",
          noteEn: "Most numbers just add th:",
          chips: ["six → sixth", "seven → seventh", "eight → eighth", "nine → ninth", "twelve → twelfth"],
        },
        tasks: [
          {
            type: "fill",
            instructions: "כתבו את המספר הסידורי.",
            instructionsEn: "Write the ordinal number.",
            cols: 2,
            items: [
              { text: "six → ___", answer: "sixth" },
              { text: "seven → ___", answer: "seventh" },
              { text: "eight → ___", answer: "eighth" },
              { text: "nine → ___", answer: "ninth" },
              { text: "eleven → ___", answer: "eleventh" },
              { text: "twelve → ___", answer: "twelfth" },
            ],
          },
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            items: [
              { text: "December is the ___ month. (12)", options: ["twelve", "twelfth"], answer: "twelfth" },
              { text: "Saturday is the ___ day of the week. (7)", options: ["seventh", "seven"], answer: "seventh" },
              { text: "He is in the ___ grade. (6)", options: ["six", "sixth"], answer: "sixth" },
              { text: "My birthday is on the ___ of May. (9)", options: ["ninth", "nine"], answer: "ninth" },
            ],
          },
          {
            type: "about",
            instructions: "כתבו על עצמכם.",
            instructionsEn: "Write about yourself.",
            items: [
              { text: "I am in the ___ grade.", sample: "fifth" },
              { text: "I sit in the ___ row.", sample: "second" },
              { text: "My birthday is in the ___ month.", sample: "fifth" },
            ],
          },
        ],
      },
    ],
  },

  "telling-time": {
    sheets: [
      {
        id: "oclock",
        title: "o'clock ו־half past",
        titleEn: "o'clock and half past",
        remember: {
          note: "שעה עגולה — o'clock. וחצי — half past:",
          noteEn: "A whole hour — o'clock. Thirty minutes past — half past:",
          chips: ["3:00 = three o'clock", "7:30 = half past seven"],
        },
        tasks: [
          {
            type: "fill",
            instructions: "הסתכלו וכתבו מה השעה.",
            instructionsEn: "Look and write the time.",
            cols: 2,
            items: [
              { img: "time-0300", text: "___", answer: "three o'clock" },
              { img: "time-0600", text: "___", answer: "six o'clock" },
              { img: "time-0900", text: "___", answer: "nine o'clock" },
              { img: "time-0230", text: "___", answer: "half past two" },
            ],
          },
          {
            type: "circle",
            instructions: "הקיפו את התשובה הנכונה.",
            instructionsEn: "Circle the right answer.",
            items: [
              { text: "7:30 — It is ___ seven.", options: ["half past", "quarter past"], answer: "half past" },
              { text: "9:00 — It is nine ___.", options: ["o'clock", "half"], answer: "o'clock" },
              { text: "2:30 — It is half past ___.", options: ["two", "three"], answer: "two" },
            ],
          },
          {
            type: "fill",
            instructions: "כתבו את השעה באנגלית.",
            instructionsEn: "Write the time in English.",
            cols: 2,
            items: [
              { text: "4:00 → ___", answer: "four o'clock" },
              { text: "10:30 → ___", answer: "half past ten" },
              { text: "8:00 → ___", answer: "eight o'clock" },
              { text: "1:30 → ___", answer: "half past one" },
            ],
          },
        ],
      },

      {
        id: "quarter",
        title: "quarter past, quarter to",
        titleEn: "quarter past, quarter to",
        remember: {
          note: "ורבע — quarter past. רבע ל־ — quarter to:",
          noteEn: "15 minutes past — quarter past. 15 minutes to — quarter to:",
          chips: ["4:15 = quarter past four", "5:45 = quarter to six"],
        },
        tasks: [
          {
            type: "fill",
            instructions: "הסתכלו וכתבו מה השעה.",
            instructionsEn: "Look and write the time.",
            items: [
              { img: "time-0415", text: "It is ___.", answer: "quarter past four" },
              { img: "time-0545", text: "It is ___.", answer: "quarter to six" },
            ],
          },
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            items: [
              { text: "4:15 — It is quarter ___ four.", options: ["past", "to"], answer: "past" },
              { text: "5:45 — It is quarter ___ six.", options: ["past", "to"], answer: "to" },
              { text: "8:15 — It is ___ past eight.", options: ["quarter", "half"], answer: "quarter" },
              { text: "1:45 — It is quarter to ___.", options: ["one", "two"], answer: "two" },
            ],
          },
          {
            type: "rewrite",
            instructions: "כתבו את השעה באנגלית.",
            instructionsEn: "Write the time in English.",
            example: { text: "7:15", answer: "quarter past seven" },
            items: [
              { text: "3:45", answer: "quarter to four" },
              { text: "10:15", answer: "quarter past ten" },
              { text: "6:30", answer: "half past six" },
            ],
          },
        ],
      },
    ],
  },

  "time-prepositions": {
    sheets: [
      {
        id: "at-on-in",
        title: "at, on, in של זמן",
        titleEn: "at, on, in (Time)",
        remember: {
          note: "at לשעה, on ליום, in לחודש ולעונה:",
          noteEn: "at + a time, on + a day, in + a month or a season:",
          chips: ["at seven", "on Sunday", "in May", "in summer"],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            options: ["at", "on", "in"],
            items: [
              { text: "I wake up ___ seven.", answer: "at" },
              { text: "We rest ___ Shabbat.", answer: "on" },
              { text: "My birthday is ___ May.", answer: "in" },
              { text: "We swim ___ summer.", answer: "in" },
              { text: "I go to school ___ Sunday.", answer: "on" },
            ],
          },
          {
            type: "fill",
            instructions: "כתבו at, on או in.",
            instructionsEn: "Write at, on or in.",
            cols: 3,
            items: [
              { text: "___ eight", answer: "at" },
              { text: "___ Monday", answer: "on" },
              { text: "___ June", answer: "in" },
              { text: "___ winter", answer: "in" },
              { text: "___ night", answer: "at" },
              { text: "___ Friday", answer: "on" },
            ],
          },
          {
            type: "rewrite",
            instructions: "מצאו את הטעות ותקנו.",
            instructionsEn: "Find the mistake and fix it.",
            example: { text: "I go to school in Sunday.", answer: "I go to school on Sunday." },
            items: [
              { text: "School starts on eight.", answer: "School starts at eight." },
              { text: "We swim at summer.", answer: "We swim in summer." },
              { text: "I sleep in night.", answer: "I sleep at night." },
            ],
          },
        ],
      },

      {
        id: "morning",
        title: "in the morning, at night",
        titleEn: "in the morning, at night",
        remember: {
          note: "in the morning / afternoon / evening, אבל at night:",
          noteEn: "in the morning, afternoon and evening — but at night:",
          chips: ["in the morning", "in the afternoon", "in the evening", "at night", "on Friday morning"],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            items: [
              { text: "I eat breakfast ___ the morning.", options: ["in", "at"], answer: "in" },
              { text: "I sleep ___ night.", options: ["in", "at"], answer: "at" },
              { text: "We play ___ the afternoon.", options: ["in", "on"], answer: "in" },
              { text: "We go to the synagogue ___ Friday evening.", options: ["in", "on"], answer: "on" },
            ],
          },
          {
            type: "rewrite",
            instructions: "תרגמו לאנגלית.",
            instructionsEn: "Translate into English.",
            example: { text: "בשבע בבוקר", answer: "at seven in the morning" },
            items: [
              { text: "ביום ראשון", answer: "on Sunday" },
              { text: "בקיץ", answer: "in summer" },
              { text: "בלילה", answer: "at night" },
            ],
          },
          {
            type: "about",
            instructions: "כתבו על עצמכם.",
            instructionsEn: "Write about yourself.",
            items: [
              { text: "I wake up at ___.", sample: "seven" },
              { text: "In the afternoon I ___.", sample: "play football" },
              { text: "In summer I ___.", sample: "swim" },
            ],
          },
        ],
      },
    ],
  },

  "present-simple": {
    sheets: [
      {
        id: "i-play",
        title: "I play / he plays",
        titleEn: "I Play, He Plays",
        remember: {
          note: "בהווה פשוט אומרים מה עושים בדרך כלל. עם he, she, it מוסיפים s:",
          noteEn: "Present simple — what we usually do. With he, she, it, add s:",
          chips: ["I play every day.", "He plays every day.", "Cats like milk."],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את הפועל הנכון.",
            instructionsEn: "Circle the right verb.",
            items: [
              { text: "Dan ___ a book.", options: ["read", "reads"], answer: "reads" },
              { text: "We ___ in the park.", options: ["play", "plays"], answer: "play" },
              { text: "The dog ___ a lot.", options: ["sleep", "sleeps"], answer: "sleeps" },
              { text: "They ___ lunch at school.", options: ["eat", "eats"], answer: "eat" },
              { text: "My dad ___ tea.", options: ["drink", "drinks"], answer: "drinks" },
            ],
          },
          {
            type: "rewrite",
            instructions: "כתבו את המשפט עם He.",
            instructionsEn: "Write the sentence with He.",
            example: { text: "I play every day.", answer: "He plays every day." },
            items: [
              { text: "I eat pizza.", answer: "He eats pizza." },
              { text: "I read a book.", answer: "He reads a book." },
              { text: "I like milk.", answer: "He likes milk." },
            ],
          },
          {
            type: "about",
            instructions: "כתבו על עצמכם.",
            instructionsEn: "Write about yourself.",
            items: [
              { text: "Every day I ___.", sample: "go to school" },
              { text: "On Sundays I ___.", sample: "play football" },
              { text: "My friend ___.", sample: "likes pizza" },
            ],
          },
        ],
      },

      {
        id: "s-es-ies",
        title: "s, es או ies",
        titleEn: "s, es or ies",
        remember: {
          note: "אחרי sh, ch, s, x מוסיפים es. עיצור ואחריו y — ies:",
          noteEn: "After sh, ch, s, x add es. A consonant + y becomes ies:",
          chips: ["plays", "watches", "goes", "studies", "has"],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את הסוף הנכון.",
            instructionsEn: "Circle the right ending.",
            options: ["s", "es", "ies"],
            items: [
              { text: "He watch___ TV.", answer: "es" },
              { text: "Dan play___ football.", answer: "s" },
              { text: "The baby cr___. (cry)", answer: "ies" },
              { text: "He fix___ the bike.", answer: "es" },
              { text: "My brother stud___ English. (study)", answer: "ies" },
            ],
          },
          {
            type: "fill",
            instructions: "כתבו את הפועל עם he.",
            instructionsEn: "Write the verb with he.",
            cols: 2,
            items: [
              { text: "go → he ___", answer: "goes" },
              { text: "do → he ___", answer: "does" },
              { text: "wash → he ___", answer: "washes" },
              { text: "fly → it ___", answer: "flies" },
              { text: "buy → he ___", answer: "buys" },
              { text: "have → he ___", answer: "has" },
            ],
          },
          {
            type: "rewrite",
            instructions: "מצאו את הטעות ותקנו.",
            instructionsEn: "Find the mistake and fix it.",
            example: { text: "He gos home.", answer: "He goes home." },
            items: [
              { text: "Dan watchs TV.", answer: "Dan watches TV." },
              { text: "He studys English.", answer: "He studies English." },
              { text: "My dad have a car.", answer: "My dad has a car." },
            ],
          },
        ],
      },

      {
        id: "not-questions",
        title: "לא ושאלות",
        titleEn: "don't, doesn't, Do, Does",
        remember: {
          note: "שלילה don't / doesn't, שאלה Do / Does — ואחריהם הפועל בלי s:",
          noteEn: "don't / doesn't and Do / Does — then the verb with no s:",
          chips: ["He doesn't like fish.", "Does he like pizza?", "Yes, he does."],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            items: [
              { text: "The cat ___ swim.", options: ["don't", "doesn't"], answer: "doesn't" },
              { text: "___ you play chess?", options: ["Do", "Does"], answer: "Do" },
              { text: "___ he like pizza?", options: ["Do", "Does"], answer: "Does" },
              { text: "Does the bus ___ here?", options: ["stop", "stops"], answer: "stop" },
            ],
          },
          {
            type: "rewrite",
            instructions: "כתבו את המשפט בשלילה.",
            instructionsEn: "Write the sentence in the negative.",
            example: { text: "He plays chess.", answer: "He doesn't play chess." },
            items: [
              { text: "They like fish.", answer: "They don't like fish." },
              { text: "Dan reads books.", answer: "Dan doesn't read books." },
              { text: "I swim every day.", answer: "I don't swim every day." },
            ],
          },
          {
            type: "rewrite",
            instructions: "הפכו את המשפט לשאלה.",
            instructionsEn: "Make the sentence a question.",
            example: { text: "You play chess.", answer: "Do you play chess?" },
            items: [
              { text: "He likes pizza.", answer: "Does he like pizza?" },
              { text: "They swim.", answer: "Do they swim?" },
            ],
          },
        ],
      },
    ],
  },

  progressive: {
    sheets: [
      {
        id: "now",
        title: "מה קורה עכשיו?",
        titleEn: "What Is Happening Now?",
        remember: {
          note: "עכשיו: am / is / are ואחריהם פועל עם ing:",
          noteEn: "Now: am / is / are + a verb with ing:",
          chips: ["I am playing.", "He is reading.", "They are eating.", "run → running", "make → making"],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            options: ["am", "is", "are"],
            items: [
              { text: "I ___ reading.", answer: "am" },
              { text: "He ___ playing.", answer: "is" },
              { text: "They ___ eating apples.", answer: "are" },
              { text: "We ___ watching TV now.", answer: "are" },
              { text: "The dog ___ running.", answer: "is" },
            ],
          },
          {
            type: "fill",
            instructions: "כתבו את הפועל עם ing.",
            instructionsEn: "Write the verb with ing.",
            cols: 2,
            items: [
              { text: "play → ___", answer: "playing" },
              { text: "read → ___", answer: "reading" },
              { text: "make → ___", answer: "making" },
              { text: "run → ___", answer: "running" },
              { text: "swim → ___", answer: "swimming" },
              { text: "eat → ___", answer: "eating" },
            ],
          },
          {
            type: "rewrite",
            instructions: "תרגמו לאנגלית.",
            instructionsEn: "Translate into English.",
            example: { text: "אני קורא עכשיו.", answer: "I am reading now." },
            items: [
              { text: "הוא משחק כדורגל.", answer: "He is playing football." },
              { text: "אנחנו אוכלים.", answer: "We are eating." },
              { text: "הכלב רץ.", answer: "The dog is running." },
            ],
          },
        ],
      },

      {
        id: "now-or-every-day",
        title: "לא, שאלות, עכשיו או כל יום",
        titleEn: "Now or Every Day?",
        remember: {
          note: "עכשיו — is playing. כל יום — plays:",
          noteEn: "Now — is playing. Every day — plays:",
          chips: ["I am playing now.", "I play every day.", "He isn't sleeping.", "Are you playing?"],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את הפועל הנכון.",
            instructionsEn: "Circle the right verb.",
            items: [
              { text: "I ___ football now.", options: ["play", "am playing"], answer: "am playing" },
              { text: "I ___ football every day.", options: ["play", "am playing"], answer: "play" },
              { text: "Look! The dog ___.", options: ["runs", "is running"], answer: "is running" },
              { text: "He ___ to school every day.", options: ["walks", "is walking"], answer: "walks" },
            ],
          },
          {
            type: "rewrite",
            instructions: "הפכו את המשפט לשאלה.",
            instructionsEn: "Make the sentence a question.",
            example: { text: "You are playing.", answer: "Are you playing?" },
            items: [
              { text: "He is eating.", answer: "Is he eating?" },
              { text: "They are reading.", answer: "Are they reading?" },
              { text: "The cat is sleeping.", answer: "Is the cat sleeping?" },
            ],
          },
          {
            type: "fill",
            instructions: "כתבו isn't או aren't.",
            instructionsEn: "Write isn't or aren't.",
            cols: 2,
            items: [
              { text: "He ___ sleeping.", answer: "isn't" },
              { text: "We ___ running.", answer: "aren't" },
              { text: "It ___ raining.", answer: "isn't" },
              { text: "They ___ playing.", answer: "aren't" },
            ],
          },
        ],
      },
    ],
  },

  "past-simple": {
    sheets: [
      {
        id: "ed",
        title: "פעלים עם ed",
        titleEn: "Verbs with ed",
        remember: {
          note: "בעבר מוסיפים ed. מילים של עבר: yesterday, last week, ago:",
          noteEn: "In the past, add ed. Past words: yesterday, last week, ago:",
          chips: ["play → played", "like → liked", "study → studied", "stop → stopped"],
        },
        tasks: [
          {
            type: "fill",
            instructions: "כתבו בעבר.",
            instructionsEn: "Write the past.",
            cols: 2,
            items: [
              { text: "clean → ___", answer: "cleaned" },
              { text: "jump → ___", answer: "jumped" },
              { text: "like → ___", answer: "liked" },
              { text: "live → ___", answer: "lived" },
              { text: "cry → ___", answer: "cried" },
              { text: "stop → ___", answer: "stopped" },
            ],
          },
          {
            type: "circle",
            instructions: "הקיפו את הפועל הנכון.",
            instructionsEn: "Circle the right verb.",
            items: [
              { text: "I ___ football yesterday.", options: ["play", "played"], answer: "played" },
              { text: "We ___ home last night.", options: ["walked", "walk"], answer: "walked" },
              { text: "He ___ his room an hour ago.", options: ["cleans", "cleaned"], answer: "cleaned" },
              { text: "They ___ English last week.", options: ["studied", "study"], answer: "studied" },
            ],
          },
          {
            type: "rewrite",
            instructions: "כתבו את המשפט עם yesterday.",
            instructionsEn: "Write the sentence with yesterday.",
            example: { text: "I play every day.", answer: "I played yesterday." },
            items: [
              { text: "I walk home every day.", answer: "I walked home yesterday." },
              { text: "He cleans his room every day.", answer: "He cleaned his room yesterday." },
              { text: "We watch TV every day.", answer: "We watched TV yesterday." },
            ],
          },
        ],
      },

      {
        id: "special",
        title: "פעלים מיוחדים",
        titleEn: "Special Past Verbs",
        remember: {
          note: "יש פעלים שבעבר משתנים לגמרי:",
          noteEn: "Some verbs change completely in the past:",
          chips: ["go → went", "eat → ate", "see → saw", "have → had", "come → came", "do → did"],
        },
        tasks: [
          {
            type: "fill",
            instructions: "כתבו בעבר.",
            instructionsEn: "Write the past.",
            cols: 2,
            items: [
              { text: "go → ___", answer: "went" },
              { text: "eat → ___", answer: "ate" },
              { text: "see → ___", answer: "saw" },
              { text: "buy → ___", answer: "bought" },
              { text: "make → ___", answer: "made" },
              { text: "take → ___", answer: "took" },
            ],
          },
          {
            type: "circle",
            instructions: "הקיפו את הפועל הנכון.",
            instructionsEn: "Circle the right verb.",
            items: [
              { text: "I ___ to school yesterday.", options: ["goed", "went"], answer: "went" },
              { text: "We ___ pizza last night.", options: ["ate", "eated"], answer: "ate" },
              { text: "Dad ___ a cake.", options: ["maked", "made"], answer: "made" },
              { text: "They ___ home at five.", options: ["came", "comed"], answer: "came" },
            ],
          },
          {
            type: "rewrite",
            instructions: "תרגמו לאנגלית.",
            instructionsEn: "Translate into English.",
            example: { text: "הלכתי הביתה.", answer: "I went home." },
            items: [
              { text: "ראיתי כלב גדול.", answer: "I saw a big dog." },
              { text: "אכלנו פיצה.", answer: "We ate pizza." },
              { text: "עשיתי שיעורי בית.", answer: "I did my homework." },
            ],
          },
        ],
      },

      {
        id: "didnt-did",
        title: "didn't / Did",
        titleEn: "didn't, Did",
        remember: {
          note: "אחרי didn't ו־Did הפועל חוזר לצורה הרגילה:",
          noteEn: "After didn't and Did, the verb goes back to its base form:",
          chips: ["I didn't go.", "Did you play?", "Yes, I did. / No, I didn't."],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את הפועל הנכון.",
            instructionsEn: "Circle the right verb.",
            items: [
              { text: "He didn't ___.", options: ["went", "go"], answer: "go" },
              { text: "I didn't ___ lunch.", options: ["eat", "ate"], answer: "eat" },
              { text: "Did you ___ football?", options: ["play", "played"], answer: "play" },
              { text: "Did they ___ the game?", options: ["saw", "see"], answer: "see" },
            ],
          },
          {
            type: "rewrite",
            instructions: "כתבו את המשפט בשלילה.",
            instructionsEn: "Write the sentence in the negative.",
            example: { text: "I went to school.", answer: "I didn't go to school." },
            items: [
              { text: "He ate pizza.", answer: "He didn't eat pizza." },
              { text: "We played football.", answer: "We didn't play football." },
              { text: "They saw the dog.", answer: "They didn't see the dog." },
            ],
          },
          {
            type: "rewrite",
            instructions: "הפכו את המשפט לשאלה.",
            instructionsEn: "Make the sentence a question.",
            example: { text: "You played football.", answer: "Did you play football?" },
            items: [
              { text: "He saw the game.", answer: "Did he see the game?" },
              { text: "They ate lunch.", answer: "Did they eat lunch?" },
            ],
          },
        ],
      },
    ],
  },

  "irregular-verbs": {
    sheets: [
      {
        id: "went-ate",
        title: "went, ate, saw",
        titleEn: "went, ate, saw",
        remember: {
          note: "פעלים חשובים בעבר:",
          noteEn: "Important verbs in the past:",
          chips: ["go → went", "eat → ate", "see → saw", "have → had", "take → took", "make → made"],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את הפועל הנכון.",
            instructionsEn: "Circle the right verb.",
            items: [
              { text: "We ___ to the beach.", options: ["went", "goed"], answer: "went" },
              { text: "I ___ a sandwich.", options: ["eated", "ate"], answer: "ate" },
              { text: "He ___ a big dog.", options: ["saw", "seed"], answer: "saw" },
              { text: "They ___ a good time.", options: ["haved", "had"], answer: "had" },
              { text: "I ___ my bag.", options: ["took", "taked"], answer: "took" },
            ],
          },
          {
            type: "fill",
            instructions: "כתבו את הפועל בעבר.",
            instructionsEn: "Write the verb in the past.",
            cols: 2,
            items: [
              { text: "We ___ home. (come)", answer: "came" },
              { text: "I ___ a cake. (make)", answer: "made" },
              { text: "He ___ to school. (go)", answer: "went" },
              { text: "They ___ apples. (eat)", answer: "ate" },
            ],
          },
          {
            type: "order",
            instructions: "סדרו את המילים למשפט.",
            instructionsEn: "Put the words in order.",
            items: [
              { words: ["went", "we", "beach", "the", "to"], answer: "We went to the beach." },
              { words: ["saw", "dog", "a", "I"], answer: "I saw a dog." },
              { words: ["ate", "he", "sandwich", "a"], answer: "He ate a sandwich." },
            ],
          },
        ],
      },

      {
        id: "can",
        title: "can / could",
        titleEn: "can, could",
        remember: {
          note: "can — יכול, could — יכולתי. אחריהם פועל בלי s:",
          noteEn: "can — now, could — in the past. Then a verb with no s:",
          chips: ["I can swim.", "A cat can't fly.", "Can you help me?", "I could read when I was five."],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            items: [
              { text: "He can ___.", options: ["swim", "swims"], answer: "swim" },
              { text: "A cat ___ fly.", options: ["can", "can't"], answer: "can't" },
              { text: "___ you help me?", options: ["Can", "Do"], answer: "Can" },
              { text: "I ___ read when I was five.", options: ["could", "can"], answer: "could" },
              { text: "I couldn't ___ last night.", options: ["slept", "sleep"], answer: "sleep" },
            ],
          },
          {
            type: "rewrite",
            instructions: "מצאו את הטעות ותקנו.",
            instructionsEn: "Find the mistake and fix it.",
            example: { text: "He can swims.", answer: "He can swim." },
            items: [
              { text: "I can to ride a bike.", answer: "I can ride a bike." },
              { text: "Can you helps me?", answer: "Can you help me?" },
              { text: "He cans read.", answer: "He can read." },
            ],
          },
          {
            type: "about",
            instructions: "כתבו על עצמכם.",
            instructionsEn: "Write about yourself.",
            items: [
              { text: "I can ___.", sample: "swim" },
              { text: "I can't ___.", sample: "fly" },
              { text: "When I was five, I could ___.", sample: "ride a bike" },
            ],
          },
        ],
      },
    ],
  },

  "past-progressive": {
    sheets: [
      {
        id: "was-playing",
        title: "was / were + ing",
        titleEn: "I Was Playing",
        remember: {
          note: "מה קרה באותו רגע בעבר: was / were ופועל עם ing:",
          noteEn: "What was happening at that moment: was / were + ing:",
          chips: ["I was reading.", "They were playing.", "He wasn't sleeping.", "Were you eating?"],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            options: ["was", "were"],
            items: [
              { text: "At eight I ___ reading.", answer: "was" },
              { text: "They ___ playing football.", answer: "were" },
              { text: "He ___ eating lunch.", answer: "was" },
              { text: "We ___ watching TV.", answer: "were" },
              { text: "The dog ___ running.", answer: "was" },
            ],
          },
          {
            type: "rewrite",
            instructions: "כתבו את המשפט בעבר.",
            instructionsEn: "Write the sentence in the past.",
            example: { text: "I am reading.", answer: "I was reading." },
            items: [
              { text: "They are playing.", answer: "They were playing." },
              { text: "He is eating.", answer: "He was eating." },
              { text: "We are sleeping.", answer: "We were sleeping." },
            ],
          },
          {
            type: "fill",
            instructions: "כתבו wasn't או weren't.",
            instructionsEn: "Write wasn't or weren't.",
            cols: 2,
            items: [
              { text: "I ___ sleeping.", answer: "wasn't" },
              { text: "They ___ playing.", answer: "weren't" },
              { text: "He ___ reading.", answer: "wasn't" },
              { text: "We ___ eating.", answer: "weren't" },
            ],
          },
        ],
      },

      {
        id: "when-while",
        title: "when ו־while",
        titleEn: "when and while",
        remember: {
          note: "פעולה ארוכה (was reading) ופעולה קצרה שקטעה אותה (came):",
          noteEn: "A long action (was reading) and a short one that stops it (came):",
          chips: ["I was reading when Dad came.", "While I was walking, I saw a dog."],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            items: [
              { text: "I was ___ when Dad came.", options: ["read", "reading"], answer: "reading" },
              { text: "We were eating when Dad ___.", options: ["came", "was coming"], answer: "came" },
              { text: "He ___ playing at five.", options: ["was", "were"], answer: "was" },
              { text: "While they ___ walking, they saw a cat.", options: ["was", "were"], answer: "were" },
            ],
          },
          {
            type: "rewrite",
            instructions: "חברו את המשפטים עם when.",
            instructionsEn: "Join the sentences with when.",
            example: { text: "I was reading. Dad came.", answer: "I was reading when Dad came." },
            items: [
              { text: "We were eating. Grandpa came.", answer: "We were eating when Grandpa came." },
              { text: "He was sleeping. I called.", answer: "He was sleeping when I called." },
            ],
          },
          {
            type: "rewrite",
            instructions: "מצאו את הטעות ותקנו.",
            instructionsEn: "Find the mistake and fix it.",
            example: { text: "I was read when Dad came.", answer: "I was reading when Dad came." },
            items: [
              { text: "They was playing at five.", answer: "They were playing at five." },
              { text: "He playing at five.", answer: "He was playing at five." },
            ],
          },
        ],
      },
    ],
  },

  "used-to": {
    sheets: [
      {
        id: "used-to",
        title: "מה היה פעם?",
        titleEn: "used to",
        remember: {
          note: "used to — משהו שהיה פעם, ועכשיו כבר לא:",
          noteEn: "used to — something that was true before, but not now:",
          chips: ["I used to live in Haifa.", "He used to play here.", "It used to be a shop."],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            items: [
              { text: "I used to ___ in Eilat.", options: ["live", "lived"], answer: "live" },
              { text: "He used to ___ football.", options: ["plays", "play"], answer: "play" },
              { text: "We ___ to walk to school.", options: ["used", "use"], answer: "used" },
              { text: "It used to ___ small.", options: ["be", "is"], answer: "be" },
            ],
          },
          {
            type: "rewrite",
            instructions: "כתבו את המשפט עם used to.",
            instructionsEn: "Write the sentence with used to.",
            example: { text: "I lived in Haifa.", answer: "I used to live in Haifa." },
            items: [
              { text: "He played here.", answer: "He used to play here." },
              { text: "We walked to school.", answer: "We used to walk to school." },
              { text: "I liked milk.", answer: "I used to like milk." },
            ],
          },
          {
            type: "about",
            instructions: "כתבו על עצמכם.",
            instructionsEn: "Write about yourself.",
            items: [
              { text: "When I was little, I used to ___.", sample: "play with blocks" },
              { text: "I used to like ___.", sample: "milk" },
              { text: "Now I like ___.", sample: "juice" },
            ],
          },
        ],
      },

      {
        id: "didnt-use-to",
        title: "לא ושאלות",
        titleEn: "didn't use to, Did you use to?",
        remember: {
          note: "אחרי didn't ו־Did כותבים use to (בלי d):",
          noteEn: "After didn't and Did, write use to (no d):",
          chips: ["I didn't use to like fish.", "Did you use to play here?", "Yes, I did."],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            items: [
              { text: "I didn't ___ to like fish.", options: ["used", "use"], answer: "use" },
              { text: "Did you use to ___ here?", options: ["play", "played"], answer: "play" },
              { text: "He ___ use to read.", options: ["didn't", "doesn't"], answer: "didn't" },
              { text: "Did he use to swim? — Yes, he ___.", options: ["did", "used"], answer: "did" },
            ],
          },
          {
            type: "rewrite",
            instructions: "כתבו את המשפט בשלילה.",
            instructionsEn: "Write the sentence in the negative.",
            example: { text: "I used to like fish.", answer: "I didn't use to like fish." },
            items: [
              { text: "We used to have a car.", answer: "We didn't use to have a car." },
              { text: "He used to read.", answer: "He didn't use to read." },
            ],
          },
          {
            type: "rewrite",
            instructions: "מצאו את הטעות ותקנו.",
            instructionsEn: "Find the mistake and fix it.",
            example: { text: "I didn't used to play.", answer: "I didn't use to play." },
            items: [
              { text: "Did you used to swim?", answer: "Did you use to swim?" },
              { text: "He use to live here.", answer: "He used to live here." },
            ],
          },
        ],
      },
    ],
  },

  "future-simple": {
    sheets: [
      {
        id: "will",
        title: "will",
        titleEn: "will",
        remember: {
          note: "בעתיד: will ואחריו פועל, לכל הגופים:",
          noteEn: "The future: will + a verb, for everyone:",
          chips: ["I will go.", "He will go.", "I'll = I will", "tomorrow, next week, soon"],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            items: [
              { text: "I will ___ tomorrow.", options: ["play", "played"], answer: "play" },
              { text: "He will ___ Grandpa.", options: ["visits", "visit"], answer: "visit" },
              { text: "It ___ rain tomorrow.", options: ["will", "wills"], answer: "will" },
              { text: "We will go ___.", options: ["yesterday", "next week"], answer: "next week" },
            ],
          },
          {
            type: "fill",
            instructions: "כתבו את הקיצור.",
            instructionsEn: "Write the short form.",
            cols: 2,
            items: [
              { text: "I will = ___", answer: "I'll", example: true },
              { text: "he will = ___", answer: "he'll" },
              { text: "we will = ___", answer: "we'll" },
              { text: "they will = ___", answer: "they'll" },
              { text: "you will = ___", answer: "you'll" },
              { text: "it will = ___", answer: "it'll" },
            ],
          },
          {
            type: "rewrite",
            instructions: "כתבו את המשפט עם tomorrow.",
            instructionsEn: "Write the sentence with tomorrow.",
            example: { text: "I play today.", answer: "I will play tomorrow." },
            items: [
              { text: "He visits Grandpa today.", answer: "He will visit Grandpa tomorrow." },
              { text: "We go to the park today.", answer: "We will go to the park tomorrow." },
              { text: "It rains today.", answer: "It will rain tomorrow." },
            ],
          },
        ],
      },

      {
        id: "wont",
        title: "won't / Will",
        titleEn: "won't, Will you?",
        remember: {
          note: "won't = will not. בשאלה Will בא בהתחלה:",
          noteEn: "won't = will not. In a question, Will comes first:",
          chips: ["I won't be late.", "Will you come?", "Yes, I will. / No, I won't."],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            items: [
              { text: "It won't ___.", options: ["rain", "rains"], answer: "rain" },
              { text: "___ you come?", options: ["Will", "Do"], answer: "Will" },
              { text: "I ___ be late.", options: ["won't", "willn't"], answer: "won't" },
              { text: "Will he help us? — Yes, he ___.", options: ["will", "won't"], answer: "will" },
            ],
          },
          {
            type: "rewrite",
            instructions: "כתבו את המשפט בשלילה.",
            instructionsEn: "Write the sentence in the negative.",
            example: { text: "I will be late.", answer: "I won't be late." },
            items: [
              { text: "He will come.", answer: "He won't come." },
              { text: "It will rain.", answer: "It won't rain." },
              { text: "We will play.", answer: "We won't play." },
            ],
          },
          {
            type: "rewrite",
            instructions: "הפכו את המשפט לשאלה.",
            instructionsEn: "Make the sentence a question.",
            example: { text: "You will come.", answer: "Will you come?" },
            items: [
              { text: "He will help us.", answer: "Will he help us?" },
              { text: "It will rain tomorrow.", answer: "Will it rain tomorrow?" },
            ],
          },
        ],
      },
    ],
  },

  "going-to": {
    sheets: [
      {
        id: "going-to",
        title: "מה אני הולך לעשות",
        titleEn: "I Am Going to…",
        remember: {
          note: "תוכנית לעתיד: am / is / are + going to + פועל:",
          noteEn: "A plan: am / is / are + going to + a verb:",
          chips: ["I am going to visit Grandpa.", "He is going to play.", "It is going to rain."],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            options: ["am", "is", "are"],
            items: [
              { text: "I ___ going to visit Grandpa.", answer: "am" },
              { text: "He ___ going to play football.", answer: "is" },
              { text: "We ___ going to watch a movie.", answer: "are" },
              { text: "It ___ going to rain.", answer: "is" },
              { text: "They ___ going to go to Eilat.", answer: "are" },
            ],
          },
          {
            type: "rewrite",
            instructions: "כתבו את המשפט עם going to.",
            instructionsEn: "Write the sentence with going to.",
            example: { text: "I visit Grandpa.", answer: "I am going to visit Grandpa." },
            items: [
              { text: "He buys a bike.", answer: "He is going to buy a bike." },
              { text: "We watch a movie.", answer: "We are going to watch a movie." },
              { text: "They play football.", answer: "They are going to play football." },
            ],
          },
          {
            type: "about",
            instructions: "כתבו על התוכניות שלכם.",
            instructionsEn: "Write about your plans.",
            items: [
              { text: "Tonight I am going to ___.", sample: "read a book" },
              { text: "Tomorrow I am going to ___.", sample: "play football" },
              { text: "Next week I am going to ___.", sample: "visit Grandpa" },
            ],
          },
        ],
      },

      {
        id: "not-questions",
        title: "לא ושאלות",
        titleEn: "Not Going to? Are You Going to?",
        remember: {
          note: "שלילה: not אחרי am / is / are. שאלה: am / is / are בהתחלה:",
          noteEn: "Negative: not after am / is / are. Question: am / is / are first:",
          chips: ["I am not going to watch TV.", "Are you going to play?", "Is it going to rain?"],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            items: [
              { text: "I ___ going to watch TV tonight.", options: ["am not", "not am"], answer: "am not" },
              { text: "___ you going to play tomorrow?", options: ["Are", "Do"], answer: "Are" },
              { text: "He ___ going to come.", options: ["isn't", "aren't"], answer: "isn't" },
              { text: "___ it going to rain today?", options: ["Is", "Are"], answer: "Is" },
            ],
          },
          {
            type: "rewrite",
            instructions: "הפכו את המשפט לשאלה.",
            instructionsEn: "Make the sentence a question.",
            example: { text: "You are going to play.", answer: "Are you going to play?" },
            items: [
              { text: "He is going to come.", answer: "Is he going to come?" },
              { text: "It is going to rain.", answer: "Is it going to rain?" },
              { text: "They are going to swim.", answer: "Are they going to swim?" },
            ],
          },
          {
            type: "order",
            instructions: "סדרו את המילים למשפט.",
            instructionsEn: "Put the words in order.",
            items: [
              { words: ["to", "going", "rain", "is", "it"], answer: "It is going to rain." },
              { words: ["going", "are", "to", "we", "swim"], answer: "We are going to swim." },
              { words: ["is", "going", "he", "read", "to"], answer: "He is going to read." },
            ],
          },
        ],
      },
    ],
  },

  tenses: {
    sheets: [
      {
        id: "was-were",
        title: "was / were",
        titleEn: "was, were",
        remember: {
          note: "העבר של am / is הוא was. העבר של are הוא were:",
          noteEn: "The past of am / is is was. The past of are is were:",
          chips: ["I was happy.", "We were at school.", "It wasn't cold.", "Were you at home?"],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            options: ["was", "were"],
            items: [
              { text: "I ___ at home yesterday.", answer: "was" },
              { text: "We ___ at school.", answer: "were" },
              { text: "It ___ cold.", answer: "was" },
              { text: "They ___ tired.", answer: "were" },
              { text: "He ___ happy.", answer: "was" },
            ],
          },
          {
            type: "rewrite",
            instructions: "כתבו את המשפט בעבר.",
            instructionsEn: "Write the sentence in the past.",
            example: { text: "I am happy.", answer: "I was happy." },
            items: [
              { text: "They are late.", answer: "They were late." },
              { text: "It is cold.", answer: "It was cold." },
              { text: "We are at home.", answer: "We were at home." },
            ],
          },
          {
            type: "fill",
            instructions: "כתבו Was או Were.",
            instructionsEn: "Write Was or Were.",
            cols: 2,
            items: [
              { text: "___ he sick?", answer: "Was" },
              { text: "___ you at home?", answer: "Were" },
              { text: "___ they late?", answer: "Were" },
              { text: "___ it cold?", answer: "Was" },
            ],
          },
        ],
      },

      {
        id: "ed",
        title: "עבר עם ed",
        titleEn: "The Past with ed",
        remember: {
          note: "בעבר מוסיפים ed:",
          noteEn: "In the past, add ed:",
          chips: ["walk → walked", "watch → watched", "study → studied", "yesterday", "two days ago"],
        },
        tasks: [
          {
            type: "fill",
            instructions: "כתבו בעבר.",
            instructionsEn: "Write the past.",
            cols: 2,
            items: [
              { text: "walk → ___", answer: "walked" },
              { text: "watch → ___", answer: "watched" },
              { text: "play → ___", answer: "played" },
              { text: "like → ___", answer: "liked" },
              { text: "study → ___", answer: "studied" },
              { text: "clean → ___", answer: "cleaned" },
            ],
          },
          {
            type: "circle",
            instructions: "הקיפו את הפועל הנכון.",
            instructionsEn: "Circle the right verb.",
            items: [
              { text: "He ___ TV yesterday.", options: ["watch", "watched"], answer: "watched" },
              { text: "We ___ home last week.", options: ["walked", "walk"], answer: "walked" },
              { text: "I ___ English two days ago.", options: ["study", "studied"], answer: "studied" },
              { text: "They ___ football yesterday.", options: ["played", "play"], answer: "played" },
            ],
          },
          {
            type: "rewrite",
            instructions: "תרגמו לאנגלית.",
            instructionsEn: "Translate into English.",
            example: { text: "שיחקתי אתמול.", answer: "I played yesterday." },
            items: [
              { text: "הוא הלך הביתה.", answer: "He walked home." },
              { text: "צפינו בטלוויזיה.", answer: "We watched TV." },
              { text: "הם למדו אנגלית.", answer: "They studied English." },
            ],
          },
        ],
      },

      {
        id: "didnt-did",
        title: "didn't / Did",
        titleEn: "didn't, Did",
        remember: {
          note: "אחרי didn't ו־Did — הפועל בלי ed:",
          noteEn: "After didn't and Did — the verb without ed:",
          chips: ["I didn't play.", "Did you play football?", "Yes, I did. / No, I didn't."],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            items: [
              { text: "I didn't ___.", options: ["played", "play"], answer: "play" },
              { text: "Did he ___ you?", options: ["call", "called"], answer: "call" },
              { text: "We didn't ___ TV.", options: ["watch", "watched"], answer: "watch" },
              { text: "Did you play? — No, I ___.", options: ["didn't", "don't"], answer: "didn't" },
            ],
          },
          {
            type: "rewrite",
            instructions: "כתבו את המשפט בשלילה.",
            instructionsEn: "Write the sentence in the negative.",
            example: { text: "I played.", answer: "I didn't play." },
            items: [
              { text: "He watched TV.", answer: "He didn't watch TV." },
              { text: "We walked home.", answer: "We didn't walk home." },
              { text: "They cleaned the room.", answer: "They didn't clean the room." },
            ],
          },
          {
            type: "rewrite",
            instructions: "הפכו את המשפט לשאלה.",
            instructionsEn: "Make the sentence a question.",
            example: { text: "You played football.", answer: "Did you play football?" },
            items: [
              { text: "He called you.", answer: "Did he call you?" },
              { text: "They watched TV.", answer: "Did they watch TV?" },
            ],
          },
        ],
      },

      {
        id: "three-tenses",
        title: "הווה, עבר ועתיד",
        titleEn: "Present, Past and Future",
        remember: {
          note: "כל יום — play. אתמול — played. מחר — will play:",
          noteEn: "Every day — play. Yesterday — played. Tomorrow — will play:",
          chips: ["I walk every day.", "I walked yesterday.", "I will walk tomorrow."],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את הפועל הנכון.",
            instructionsEn: "Circle the right verb.",
            items: [
              { text: "I ___ to school every day.", options: ["walk", "walked"], answer: "walk" },
              { text: "I ___ to school yesterday.", options: ["walk", "walked"], answer: "walked" },
              { text: "I ___ to school tomorrow.", options: ["will walk", "walked"], answer: "will walk" },
              { text: "It ___ rain tomorrow.", options: ["will", "did"], answer: "will" },
            ],
          },
          {
            type: "rewrite",
            instructions: "כתבו את המשפט לפי המילה בסוגריים.",
            instructionsEn: "Write the sentence for the time in brackets.",
            example: { text: "I play. (yesterday)", answer: "I played yesterday." },
            items: [
              { text: "I play. (tomorrow)", answer: "I will play tomorrow." },
              { text: "He walks. (yesterday)", answer: "He walked yesterday." },
              { text: "We watch TV. (tomorrow)", answer: "We will watch TV tomorrow." },
            ],
          },
          {
            type: "rewrite",
            instructions: "מצאו את הטעות ותקנו.",
            instructionsEn: "Find the mistake and fix it.",
            example: { text: "I will played.", answer: "I will play." },
            items: [
              { text: "He walk yesterday.", answer: "He walked yesterday." },
              { text: "I will goes tomorrow.", answer: "I will go tomorrow." },
            ],
          },
        ],
      },
    ],
  },

  modals: {
    sheets: [
      {
        id: "must",
        title: "must / mustn't",
        titleEn: "must, mustn't",
        remember: {
          note: "must — חייבים. mustn't — אסור. אחריהם פועל בלי to:",
          noteEn: "must — you have to. mustn't — you are not allowed. Then a verb, no to:",
          chips: ["You must wear a helmet.", "You mustn't run here.", "We must listen."],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            items: [
              { text: "You ___ stop at a red light.", options: ["must", "mustn't"], answer: "must" },
              { text: "You ___ cross on red.", options: ["must", "mustn't"], answer: "mustn't" },
              { text: "We ___ be late.", options: ["must", "mustn't"], answer: "mustn't" },
              { text: "You must ___ a helmet.", options: ["wear", "to wear"], answer: "wear" },
            ],
          },
          {
            type: "rewrite",
            instructions: "מצאו את הטעות ותקנו.",
            instructionsEn: "Find the mistake and fix it.",
            example: { text: "You must to go.", answer: "You must go." },
            items: [
              { text: "He musts listen.", answer: "He must listen." },
              { text: "You must not to run.", answer: "You must not run." },
            ],
          },
          {
            type: "about",
            instructions: "כתבו על הכללים בכיתה ובבית.",
            instructionsEn: "Write about the rules in class and at home.",
            items: [
              { text: "In class we must ___.", sample: "listen" },
              { text: "In class we mustn't ___.", sample: "run" },
              { text: "At home I must ___.", sample: "clean my room" },
            ],
          },
        ],
      },

      {
        id: "should-have-to",
        title: "should / have to",
        titleEn: "should, have to",
        remember: {
          note: "should — כדאי. have to — צריך. עם he, she, it — has to:",
          noteEn: "should — a good idea. have to — you need to. he, she, it — has to:",
          chips: ["You should sleep early.", "You shouldn't eat too much candy.", "I have to study.", "He has to clean his room."],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            items: [
              { text: "You ___ drink water.", options: ["should", "shouldn't"], answer: "should" },
              { text: "You ___ eat too much candy.", options: ["should", "shouldn't"], answer: "shouldn't" },
              { text: "He ___ to clean his room.", options: ["has", "have"], answer: "has" },
              { text: "We ___ to go now.", options: ["have", "has"], answer: "have" },
            ],
          },
          {
            type: "fill",
            instructions: "כתבו have to או has to.",
            instructionsEn: "Write have to or has to.",
            cols: 2,
            items: [
              { text: "I ___ study.", answer: "have to" },
              { text: "He ___ go.", answer: "has to" },
              { text: "They ___ wait.", answer: "have to" },
              { text: "Dan ___ help.", answer: "has to" },
            ],
          },
          {
            type: "rewrite",
            instructions: "מצאו את הטעות ותקנו.",
            instructionsEn: "Find the mistake and fix it.",
            example: { text: "He have to go.", answer: "He has to go." },
            items: [
              { text: "You should to sleep.", answer: "You should sleep." },
              { text: "We has to go now.", answer: "We have to go now." },
              { text: "I have study.", answer: "I have to study." },
            ],
          },
        ],
      },
    ],
  },

  connectors: {
    sheets: [
      {
        id: "and-but-because",
        title: "and, but, because",
        titleEn: "and, but, because",
        remember: {
          note: "and — וגם, but — אבל, because — כי, or — או:",
          noteEn: "and, but, because and or:",
          chips: ["I like apples and bananas.", "I am tired, but I am happy.", "I am happy because it is Friday."],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את מילת החיבור הנכונה.",
            instructionsEn: "Circle the right word.",
            options: ["and", "but", "because"],
            items: [
              { text: "I like apples ___ bananas.", answer: "and" },
              { text: "I am tired, ___ I am happy.", answer: "but" },
              { text: "I am happy ___ it is Friday.", answer: "because" },
              { text: "He runs ___ jumps.", answer: "and" },
              { text: "I am cold ___ it is winter.", answer: "because" },
            ],
          },
          {
            type: "fill",
            instructions: "כתבו and, but, because או or.",
            instructionsEn: "Write and, but, because or or.",
            items: [
              { text: "It is late, ___ I am not tired.", answer: "but" },
              { text: "Do you want tea ___ juice?", answer: "or" },
              { text: "We eat ___ drink.", answer: "and" },
              { text: "I am wet ___ it is raining.", answer: "because" },
            ],
          },
          {
            type: "rewrite",
            instructions: "חברו את המשפטים.",
            instructionsEn: "Join the sentences.",
            example: { text: "I am hungry. It is lunch time.", answer: "I am hungry because it is lunch time." },
            items: [
              { text: "I like dogs. I like cats.", answer: "I like dogs and cats." },
              { text: "He is small. He is strong.", answer: "He is small, but he is strong." },
            ],
          },
        ],
      },

      {
        id: "so-before-after",
        title: "so, before, after",
        titleEn: "so, before, after",
        remember: {
          note: "so — לכן, before — לפני, after — אחרי, first… then — קודם… אחר כך:",
          noteEn: "so, before, after, and first… then:",
          chips: ["It was cold, so I wore a coat.", "I wash my hands before lunch.", "We play after school."],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            items: [
              { text: "It was cold, ___ I wore a coat.", options: ["so", "because"], answer: "so" },
              { text: "I wash my hands ___ lunch.", options: ["before", "after"], answer: "before" },
              { text: "I ate ___ I was hungry.", options: ["because", "so"], answer: "because" },
              { text: "I was hungry, ___ I ate.", options: ["so", "because"], answer: "so" },
            ],
          },
          {
            type: "fill",
            instructions: "כתבו then, before או so.",
            instructionsEn: "Write then, before or so.",
            items: [
              { text: "First I eat, ___ I play.", answer: "then" },
              { text: "I brush my teeth ___ I go to bed.", answer: "before" },
              { text: "I am tired, ___ I will sleep.", answer: "so" },
            ],
          },
          {
            type: "rewrite",
            instructions: "חברו את המשפטים עם so.",
            instructionsEn: "Join the sentences with so.",
            example: { text: "It was cold. I wore a coat.", answer: "It was cold, so I wore a coat." },
            items: [
              { text: "I was hungry. I ate.", answer: "I was hungry, so I ate." },
              { text: "It is late. I go home.", answer: "It is late, so I go home." },
            ],
          },
        ],
      },
    ],
  },

  comparatives: {
    sheets: [
      {
        id: "bigger",
        title: "גדול יותר, הכי גדול",
        titleEn: "bigger, the biggest",
        remember: {
          note: "משווים בין שניים — er ו־than. הכי — the ו־est:",
          noteEn: "Comparing two — er + than. The most — the + est:",
          chips: ["tall → taller → the tallest", "big → bigger → the biggest", "happy → happier → the happiest"],
        },
        tasks: [
          {
            type: "fill",
            instructions: "כתבו את צורת ההשוואה.",
            instructionsEn: "Write the comparative.",
            cols: 2,
            items: [
              { text: "tall → ___", answer: "taller" },
              { text: "small → ___", answer: "smaller" },
              { text: "big → ___", answer: "bigger" },
              { text: "hot → ___", answer: "hotter" },
              { text: "happy → ___", answer: "happier" },
              { text: "fast → ___", answer: "faster" },
            ],
          },
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            items: [
              { text: "Tom is ___ than Ben.", options: ["tall", "taller"], answer: "taller" },
              { text: "A car is faster ___ a bike.", options: ["than", "then"], answer: "than" },
              { text: "He is the ___ in the class.", options: ["tallest", "taller"], answer: "tallest" },
              { text: "Today is ___ than yesterday.", options: ["more hot", "hotter"], answer: "hotter" },
            ],
          },
          {
            type: "rewrite",
            instructions: "מצאו את הטעות ותקנו.",
            instructionsEn: "Find the mistake and fix it.",
            example: { text: "It is more bigger.", answer: "It is bigger." },
            items: [
              { text: "Dan is tall than Ben.", answer: "Dan is taller than Ben." },
              { text: "He is the bigest boy.", answer: "He is the biggest boy." },
              { text: "I am happyer today.", answer: "I am happier today." },
            ],
          },
        ],
      },

      {
        id: "more-better",
        title: "more, most, better",
        titleEn: "more, the most, better",
        remember: {
          note: "מילים ארוכות — more / the most. מילים מיוחדות — good, bad:",
          noteEn: "Long words — more / the most. Special words — good, bad:",
          chips: ["interesting → more interesting", "good → better → the best", "bad → worse → the worst"],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            items: [
              { text: "This book is ___ than that book.", options: ["interestinger", "more interesting"], answer: "more interesting" },
              { text: "It is the ___ beautiful park.", options: ["most", "more"], answer: "most" },
              { text: "Pizza is ___ than soup.", options: ["gooder", "better"], answer: "better" },
              { text: "He is my ___ friend.", options: ["best", "goodest"], answer: "best" },
              { text: "This is the ___ day of the year.", options: ["baddest", "worst"], answer: "worst" },
            ],
          },
          {
            type: "fill",
            instructions: "כתבו את הצורה הנכונה.",
            instructionsEn: "Write the right form.",
            cols: 2,
            items: [
              { text: "good → ___", answer: "better" },
              { text: "bad → ___", answer: "worse" },
              { text: "good → the ___", answer: "best" },
              { text: "bad → the ___", answer: "worst" },
            ],
          },
          {
            type: "rewrite",
            instructions: "תרגמו לאנגלית.",
            instructionsEn: "Translate into English.",
            example: { text: "הוא החבר הכי טוב שלי.", answer: "He is my best friend." },
            items: [
              { text: "פיצה יותר טובה ממרק.", answer: "Pizza is better than soup." },
              { text: "זה הספר הכי מעניין.", answer: "This is the most interesting book." },
            ],
          },
        ],
      },
    ],
  },

  quantifiers: {
    sheets: [
      {
        id: "some-any",
        title: "some / any",
        titleEn: "some, any",
        remember: {
          note: "some במשפט רגיל, any בשלילה ובשאלה:",
          noteEn: "some in normal sentences, any in negatives and questions:",
          chips: ["I have some apples.", "I don't have any bread.", "Do you have any milk?"],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            options: ["some", "any"],
            items: [
              { text: "I have ___ apples.", answer: "some" },
              { text: "I don't have ___ bread.", answer: "any" },
              { text: "Do you have ___ milk?", answer: "any" },
              { text: "We need ___ water.", answer: "some" },
              { text: "There aren't ___ chairs.", answer: "any" },
            ],
          },
          {
            type: "rewrite",
            instructions: "כתבו את המשפט בשלילה.",
            instructionsEn: "Write the sentence in the negative.",
            example: { text: "I have some money.", answer: "I don't have any money." },
            items: [
              { text: "We have some milk.", answer: "We don't have any milk." },
              { text: "He has some books.", answer: "He doesn't have any books." },
            ],
          },
          {
            type: "rewrite",
            instructions: "הפכו את המשפט לשאלה.",
            instructionsEn: "Make the sentence a question.",
            example: { text: "You have some bread.", answer: "Do you have any bread?" },
            items: [{ text: "They have some pens.", answer: "Do they have any pens?" }],
          },
        ],
      },

      {
        id: "many-much",
        title: "many / much / a lot of",
        titleEn: "many, much, a lot of",
        remember: {
          note: "דברים שסופרים — many. דברים שלא סופרים — much. a lot of — לשניהם:",
          noteEn: "Things we count — many. Things we don't count — much. a lot of — both:",
          chips: ["many books", "much water", "a lot of friends", "How many? How much?"],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            items: [
              { text: "I don't have ___ books.", options: ["many", "much"], answer: "many" },
              { text: "There isn't ___ water.", options: ["many", "much"], answer: "much" },
              { text: "How ___ pens do you have?", options: ["many", "much"], answer: "many" },
              { text: "How ___ milk is there?", options: ["many", "much"], answer: "much" },
              { text: "I have ___ friends.", options: ["much", "a lot of"], answer: "a lot of" },
            ],
          },
          {
            type: "fill",
            instructions: "כתבו How many או How much.",
            instructionsEn: "Write How many or How much.",
            cols: 2,
            items: [
              { text: "___ apples?", answer: "How many" },
              { text: "___ juice?", answer: "How much" },
              { text: "___ cats?", answer: "How many" },
              { text: "___ bread?", answer: "How much" },
            ],
          },
          {
            type: "rewrite",
            instructions: "מצאו את הטעות ותקנו.",
            instructionsEn: "Find the mistake and fix it.",
            example: { text: "How many water?", answer: "How much water?" },
            items: [
              { text: "I don't have much books.", answer: "I don't have many books." },
              { text: "He drinks a lot milk.", answer: "He drinks a lot of milk." },
            ],
          },
        ],
      },
    ],
  },

  "word-building": {
    sheets: [
      {
        id: "un-dis-re",
        title: "un, dis, re",
        titleEn: "un, dis, re",
        remember: {
          note: "un ו־dis — ההפך. re — שוב:",
          noteEn: "un and dis — the opposite. re — again:",
          chips: ["happy → unhappy", "like → dislike", "write → rewrite"],
        },
        tasks: [
          {
            type: "fill",
            instructions: "כתבו את ההפך.",
            instructionsEn: "Write the opposite.",
            cols: 2,
            items: [
              { text: "happy → ___", answer: "unhappy" },
              { text: "kind → ___", answer: "unkind" },
              { text: "like → ___", answer: "dislike" },
              { text: "agree → ___", answer: "disagree" },
            ],
          },
          {
            type: "circle",
            instructions: "הקיפו את התחילית הנכונה.",
            instructionsEn: "Circle the right beginning.",
            options: ["un", "dis", "re"],
            items: [
              { text: "I ___like rain.", answer: "dis" },
              { text: "He is ___happy today.", answer: "un" },
              { text: "Please ___write the word.", answer: "re" },
              { text: "Can you ___lock the door?", answer: "un" },
              { text: "Let's ___play the game!", answer: "re" },
            ],
          },
          {
            type: "rewrite",
            instructions: "כתבו מילה אחת עם re.",
            instructionsEn: "Write one word with re.",
            example: { text: "do it again", answer: "redo" },
            items: [
              { text: "write it again", answer: "rewrite" },
              { text: "play it again", answer: "replay" },
            ],
          },
        ],
      },

      {
        id: "er-ful-less-ly",
        title: "er, ful, less, ly",
        titleEn: "er, ful, less, ly",
        remember: {
          note: "er — מי שעושה, ful — מלא, less — בלי, ly — איך:",
          noteEn: "er — who does it, ful — full of, less — without, ly — how:",
          chips: ["teach → teacher", "help → helpful", "care → careless", "quick → quickly"],
        },
        tasks: [
          {
            type: "fill",
            instructions: "כתבו את המילה החדשה.",
            instructionsEn: "Write the new word.",
            cols: 2,
            items: [
              { text: "play + er → ___", answer: "player" },
              { text: "paint + er → ___", answer: "painter" },
              { text: "help + ful → ___", answer: "helpful" },
              { text: "color + ful → ___", answer: "colorful" },
              { text: "use + less → ___", answer: "useless" },
              { text: "slow + ly → ___", answer: "slowly" },
            ],
          },
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            items: [
              { text: "He runs ___.", options: ["quick", "quickly"], answer: "quickly" },
              { text: "Be ___ with the knife!", options: ["careful", "careless"], answer: "careful" },
              { text: "My dad is a ___.", options: ["teach", "teacher"], answer: "teacher" },
              { text: "The broken pen is ___.", options: ["useful", "useless"], answer: "useless" },
            ],
          },
          {
            type: "rewrite",
            instructions: "מצאו את הטעות ותקנו.",
            instructionsEn: "Find the mistake and fix it.",
            example: { text: "Walk slow.", answer: "Walk slowly." },
            items: [
              { text: "He is very helpfull.", answer: "He is very helpful." },
              { text: "The room is colorfull.", answer: "The room is colorful." },
            ],
          },
        ],
      },
    ],
  },

  "present-perfect": {
    sheets: [
      {
        id: "have-done",
        title: "have / has + פועל",
        titleEn: "I Have Finished",
        remember: {
          note: "have / has ואחריהם הצורה השלישית של הפועל:",
          noteEn: "have / has + the third form of the verb:",
          chips: ["I have finished.", "He has washed the car.", "eat → eaten", "see → seen", "go → gone"],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            options: ["have", "has"],
            items: [
              { text: "I ___ finished my homework.", answer: "have" },
              { text: "He ___ washed the car.", answer: "has" },
              { text: "We ___ cleaned the room.", answer: "have" },
              { text: "Dan ___ lost his key.", answer: "has" },
              { text: "They ___ eaten lunch.", answer: "have" },
            ],
          },
          {
            type: "fill",
            instructions: "כתבו את הצורה השלישית.",
            instructionsEn: "Write the third form.",
            cols: 2,
            items: [
              { text: "finish → ___", answer: "finished" },
              { text: "clean → ___", answer: "cleaned" },
              { text: "eat → ___", answer: "eaten" },
              { text: "see → ___", answer: "seen" },
              { text: "go → ___", answer: "gone" },
              { text: "do → ___", answer: "done" },
            ],
          },
          {
            type: "rewrite",
            instructions: "כתבו את המשפט בשלילה.",
            instructionsEn: "Write the sentence in the negative.",
            example: { text: "I have seen this movie.", answer: "I haven't seen this movie." },
            items: [
              { text: "He has done his homework.", answer: "He hasn't done his homework." },
              { text: "We have eaten lunch.", answer: "We haven't eaten lunch." },
            ],
          },
        ],
      },

      {
        id: "ever-never",
        title: "ever / never",
        titleEn: "Have You Ever…?",
        remember: {
          note: "Have you ever…? — אי פעם. never — אף פעם, בלי not:",
          noteEn: "Have you ever…? — at any time. never — at no time, with no not:",
          chips: ["Have you ever been to Eilat?", "Yes, I have. / No, I haven't.", "I have never seen snow."],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            items: [
              { text: "___ you ever seen a lion?", options: ["Have", "Has"], answer: "Have" },
              { text: "Has he ever ___ in a plane?", options: ["flown", "fly"], answer: "flown" },
              { text: "I have ___ been to London.", options: ["ever", "never"], answer: "never" },
              { text: "Have you eaten sushi? — Yes, I ___.", options: ["have", "has"], answer: "have" },
            ],
          },
          {
            type: "rewrite",
            instructions: "הפכו לשאלה עם ever.",
            instructionsEn: "Make a question with ever.",
            example: { text: "You have been to Eilat.", answer: "Have you ever been to Eilat?" },
            items: [
              { text: "He has seen a lion.", answer: "Has he ever seen a lion?" },
              { text: "They have eaten sushi.", answer: "Have they ever eaten sushi?" },
            ],
          },
          {
            type: "rewrite",
            instructions: "מצאו את הטעות ותקנו.",
            instructionsEn: "Find the mistake and fix it.",
            example: { text: "I haven't never seen it.", answer: "I have never seen it." },
            items: [
              { text: "Have you ever see snow?", answer: "Have you ever seen snow?" },
              { text: "He have been to Jerusalem.", answer: "He has been to Jerusalem." },
            ],
          },
        ],
      },

      {
        id: "for-since",
        title: "for / since",
        titleEn: "for and since",
        remember: {
          note: "for — כמה זמן. since — ממתי:",
          noteEn: "for — how long. since — from when:",
          chips: ["for two years", "for ten minutes", "since Monday", "since eight o'clock"],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו for או since.",
            instructionsEn: "Circle for or since.",
            options: ["for", "since"],
            items: [
              { text: "___ two years", answer: "for" },
              { text: "___ Monday", answer: "since" },
              { text: "___ ten minutes", answer: "for" },
              { text: "___ eight o'clock", answer: "since" },
              { text: "___ a long time", answer: "for" },
            ],
          },
          {
            type: "fill",
            instructions: "כתבו for או since.",
            instructionsEn: "Write for or since.",
            items: [
              { text: "I have lived here ___ two years.", answer: "for" },
              { text: "He has been sick ___ Monday.", answer: "since" },
              { text: "I have known Dan ___ two weeks.", answer: "for" },
              { text: "We have been here ___ eight o'clock.", answer: "since" },
            ],
          },
          {
            type: "rewrite",
            instructions: "מצאו את הטעות ותקנו.",
            instructionsEn: "Find the mistake and fix it.",
            example: { text: "I live here for two years.", answer: "I have lived here for two years." },
            items: [{ text: "He is sick since Monday.", answer: "He has been sick since Monday." }],
          },
        ],
      },
    ],
  },

  conditionals: {
    sheets: [
      {
        id: "if-will",
        title: "If + will",
        titleEn: "If It Rains, I Will…",
        remember: {
          note: "אחרי If — הווה. בחלק השני — will:",
          noteEn: "After If — the present. In the other part — will:",
          chips: ["If it rains, I will stay home.", "If you study, you will pass the test."],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            items: [
              { text: "If it ___, I will stay home.", options: ["rains", "will rain"], answer: "rains" },
              { text: "If he comes, we ___ play.", options: ["will", "are"], answer: "will" },
              { text: "If he is hungry, he ___ eat.", options: ["is", "will"], answer: "will" },
              { text: "If you study, you will ___ the test.", options: ["pass", "passed"], answer: "pass" },
            ],
          },
          {
            type: "rewrite",
            instructions: "חברו את המשפטים עם If.",
            instructionsEn: "Join the sentences with If.",
            example: { text: "It rains. I will stay home.", answer: "If it rains, I will stay home." },
            items: [
              { text: "It is hot. We will swim.", answer: "If it is hot, we will swim." },
              { text: "He comes. We will play.", answer: "If he comes, we will play." },
            ],
          },
          {
            type: "rewrite",
            instructions: "מצאו את הטעות ותקנו.",
            instructionsEn: "Find the mistake and fix it.",
            example: { text: "If it will rain, I will stay.", answer: "If it rains, I will stay." },
            items: [{ text: "If he will come, we will play.", answer: "If he comes, we will play." }],
          },
        ],
      },

      {
        id: "facts",
        title: "עובדות והרגלים",
        titleEn: "If You Heat Ice, It Melts",
        remember: {
          note: "עובדה או הרגל — הווה בשני החלקים. אפשר גם when:",
          noteEn: "A fact or a habit — the present in both parts. when works too:",
          chips: ["If you heat ice, it melts.", "If I am tired, I go to bed early.", "When it rains, the street gets wet."],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את הפועל הנכון.",
            instructionsEn: "Circle the right verb.",
            items: [
              { text: "If you heat ice, it ___.", options: ["melts", "melted"], answer: "melts" },
              { text: "If water gets very cold, it ___.", options: ["freeze", "freezes"], answer: "freezes" },
              { text: "If my dog is hungry, he ___.", options: ["barks", "bark"], answer: "barks" },
              { text: "If I am tired, I ___ to bed early.", options: ["goes", "go"], answer: "go" },
            ],
          },
          {
            type: "fill",
            instructions: "כתבו את הפועל בהווה.",
            instructionsEn: "Write the verb in the present.",
            items: [
              { text: "If you mix blue and yellow, you ___ green. (get)", answer: "get" },
              { text: "If he is cold, he ___ a coat. (wear)", answer: "wears" },
              { text: "When it rains, the street ___ wet. (get)", answer: "gets" },
            ],
          },
          {
            type: "rewrite",
            instructions: "מצאו את הטעות ותקנו.",
            instructionsEn: "Find the mistake and fix it.",
            example: { text: "If he is cold, he wear a coat.", answer: "If he is cold, he wears a coat." },
            items: [{ text: "If you heat ice, it melt.", answer: "If you heat ice, it melts." }],
          },
        ],
      },

      {
        id: "if-were",
        title: "If I were, I would",
        titleEn: "If I Were a Bird…",
        remember: {
          note: "משהו דמיוני — If ועבר, ובחלק השני would:",
          noteEn: "Something imaginary — If + the past, and would in the other part:",
          chips: ["If I had a bike, I would ride to school.", "If I were a bird, I would fly.", "If I were you, I would ask."],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            items: [
              { text: "If I ___ a bike, I would ride to school.", options: ["had", "have"], answer: "had" },
              { text: "If I were a bird, I ___ fly.", options: ["will", "would"], answer: "would" },
              { text: "If I ___ you, I would ask the teacher.", options: ["were", "am"], answer: "were" },
              { text: "If we lived near the sea, we ___ swim.", options: ["would", "will"], answer: "would" },
            ],
          },
          {
            type: "rewrite",
            instructions: "מצאו את הטעות ותקנו.",
            instructionsEn: "Find the mistake and fix it.",
            example: { text: "If I would have a bike, I would ride.", answer: "If I had a bike, I would ride." },
            items: [{ text: "If I am a bird, I would fly.", answer: "If I were a bird, I would fly." }],
          },
          {
            type: "about",
            instructions: "כתבו מה הייתם עושים.",
            instructionsEn: "Write what you would do.",
            items: [
              { text: "If I were a bird, I would ___.", sample: "fly to Eilat" },
              { text: "If I had a lot of money, I would ___.", sample: "buy a bike" },
              { text: "If I were the teacher, I would ___.", sample: "play games in class" },
            ],
          },
        ],
      },
    ],
  },

  passive: {
    sheets: [
      {
        id: "is-made",
        title: "is / are + צורה שלישית",
        titleEn: "It Is Made of Wood",
        remember: {
          note: "סביל: is / are ואחריהם הצורה השלישית של הפועל:",
          noteEn: "The passive: is / are + the third form of the verb:",
          chips: ["The room is cleaned every day.", "Oranges are grown in Israel.", "The table is made of wood."],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            options: ["is", "are"],
            items: [
              { text: "The room ___ cleaned every day.", answer: "is" },
              { text: "The shops ___ closed on Shabbat.", answer: "are" },
              { text: "English ___ spoken in many countries.", answer: "is" },
              { text: "Oranges ___ grown in Israel.", answer: "are" },
              { text: "Bottles ___ made of glass.", answer: "are" },
            ],
          },
          {
            type: "fill",
            instructions: "כתבו את הצורה השלישית.",
            instructionsEn: "Write the third form.",
            cols: 2,
            items: [
              { text: "make → ___", answer: "made" },
              { text: "write → ___", answer: "written" },
              { text: "speak → ___", answer: "spoken" },
              { text: "grow → ___", answer: "grown" },
              { text: "clean → ___", answer: "cleaned" },
              { text: "wash → ___", answer: "washed" },
            ],
          },
          {
            type: "rewrite",
            instructions: "כתבו את המשפט בסביל.",
            instructionsEn: "Write the sentence in the passive.",
            example: { text: "Someone cleans the room.", answer: "The room is cleaned." },
            items: [
              { text: "Someone washes the car.", answer: "The car is washed." },
              { text: "Someone closes the shops.", answer: "The shops are closed." },
            ],
          },
        ],
      },

      {
        id: "was-built",
        title: "was / were + by",
        titleEn: "It Was Built by…",
        remember: {
          note: "סביל בעבר: was / were. מי עשה את זה — by:",
          noteEn: "The passive in the past: was / were. Who did it — by:",
          chips: ["The Temple was built in Jerusalem.", "The cookies were eaten.", "The cake was made by my grandpa."],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            options: ["was", "were"],
            items: [
              { text: "The window ___ broken yesterday.", answer: "was" },
              { text: "The cookies ___ eaten.", answer: "were" },
              { text: "The book ___ written by Dan.", answer: "was" },
              { text: "The houses ___ built last year.", answer: "were" },
            ],
          },
          {
            type: "rewrite",
            instructions: "כתבו את המשפט בסביל עם by.",
            instructionsEn: "Write the sentence in the passive with by.",
            example: { text: "Dan painted the wall.", answer: "The wall was painted by Dan." },
            items: [
              { text: "Grandpa made the cake.", answer: "The cake was made by Grandpa." },
              { text: "Ben found the key.", answer: "The key was found by Ben." },
            ],
          },
          {
            type: "rewrite",
            instructions: "מצאו את הטעות ותקנו.",
            instructionsEn: "Find the mistake and fix it.",
            example: { text: "The cookies was eaten.", answer: "The cookies were eaten." },
            items: [{ text: "The book was write by Dan.", answer: "The book was written by Dan." }],
          },
        ],
      },
    ],
  },

  "reported-speech": {
    sheets: [
      {
        id: "said-that",
        title: "הוא אמר ש...",
        titleEn: "He Said That…",
        remember: {
          note: "מספרים מה מישהו אמר — said that, והזמן זז אחורה:",
          noteEn: "Telling what someone said — said that, and the tense moves back:",
          chips: ["am / is → was", "are → were", "like → liked", "will → would"],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            items: [
              { text: "“I am tired.” → Dan said that he ___ tired.", options: ["is", "was"], answer: "was" },
              { text: "“I am hungry.” → Tom said that he ___ hungry.", options: ["was", "am"], answer: "was" },
              { text: "“I like football.” → Ben said that he ___ football.", options: ["likes", "liked"], answer: "liked" },
              { text: "“I will help you.” → Dad said that he ___ help me.", options: ["would", "will"], answer: "would" },
            ],
          },
          {
            type: "fill",
            instructions: "כתבו את הצורה בדיבור עקיף.",
            instructionsEn: "Write the reported form.",
            cols: 2,
            items: [
              { text: "am → ___", answer: "was" },
              { text: "are → ___", answer: "were" },
              { text: "like → ___", answer: "liked" },
              { text: "will → ___", answer: "would" },
            ],
          },
          {
            type: "rewrite",
            instructions: "כתבו מה הוא אמר.",
            instructionsEn: "Write what he said.",
            example: { text: "Dan: I am tired.", answer: "Dan said that he was tired." },
            items: [
              { text: "Ben: I am happy.", answer: "Ben said that he was happy." },
              { text: "Tom: I like pizza.", answer: "Tom said that he liked pizza." },
              { text: "Dad: I will come.", answer: "Dad said that he would come." },
            ],
          },
        ],
      },

      {
        id: "told-asked",
        title: "told / asked",
        titleEn: "He Told Me to… He Asked Me…",
        remember: {
          note: "בקשה — told me to. איסור — told me not to. שאלה — asked:",
          noteEn: "An order — told me to. Don't — told me not to. A question — asked:",
          chips: ["Dad told me to sit down.", "Dad told me not to run.", "Tom asked me where I lived.", "Ben asked me if I was hungry."],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            items: [
              { text: "“Sit down.” → Dad told me ___ sit down.", options: ["to", "that"], answer: "to" },
              { text: "“Don't run.” → Dad told me ___ run.", options: ["don't", "not to"], answer: "not to" },
              { text: "“Where do you live?” → Tom asked me where I ___.", options: ["lived", "live"], answer: "lived" },
              { text: "“Are you hungry?” → Ben asked me ___ I was hungry.", options: ["that", "if"], answer: "if" },
            ],
          },
          {
            type: "rewrite",
            instructions: "כתבו מה הוא ביקש.",
            instructionsEn: "Write what he told you.",
            example: { text: "Dad: Close the door.", answer: "Dad told me to close the door." },
            items: [
              { text: "Grandpa: Wear a coat.", answer: "Grandpa told me to wear a coat." },
              { text: "Dad: Don't be late.", answer: "Dad told me not to be late." },
            ],
          },
          {
            type: "rewrite",
            instructions: "מצאו את הטעות ותקנו.",
            instructionsEn: "Find the mistake and fix it.",
            example: { text: "He asked where did I live.", answer: "He asked where I lived." },
            items: [{ text: "He told me don't run.", answer: "He told me not to run." }],
          },
        ],
      },
    ],
  },

  "relative-clauses": {
    sheets: [
      {
        id: "who",
        title: "who – על אנשים",
        titleEn: "who",
        remember: {
          note: "who מחבר משפט על אדם:",
          noteEn: "who joins a sentence about a person:",
          chips: ["I have a friend who lives in Haifa.", "The boy who sits here is my friend."],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            items: [
              { text: "I have a friend ___ lives in Haifa.", options: ["which", "who"], answer: "who" },
              { text: "I know a boy who ___ swim.", options: ["can", "he can"], answer: "can" },
              { text: "The man who lives here ___ a doctor.", options: ["he is", "is"], answer: "is" },
              { text: "I have a teacher who ___ me.", options: ["helps", "he helps"], answer: "helps" },
            ],
          },
          {
            type: "rewrite",
            instructions: "חברו את המשפטים עם who.",
            instructionsEn: "Join the sentences with who.",
            example: { text: "I have a friend. He lives in Haifa.", answer: "I have a friend who lives in Haifa." },
            items: [
              { text: "I know a boy. He sings.", answer: "I know a boy who sings." },
              { text: "I have a teacher. He helps me.", answer: "I have a teacher who helps me." },
            ],
          },
          {
            type: "rewrite",
            instructions: "מצאו את הטעות ותקנו.",
            instructionsEn: "Find the mistake and fix it.",
            example: { text: "I know a boy who he plays.", answer: "I know a boy who plays." },
            items: [{ text: "The boy which sits here is Dan.", answer: "The boy who sits here is Dan." }],
          },
        ],
      },

      {
        id: "which-that",
        title: "which ו־that",
        titleEn: "which and that",
        remember: {
          note: "which על דברים וחיות. that — על הכול:",
          noteEn: "which — for things and animals. that — for everything:",
          chips: ["the book which is on the table", "I have a dog that runs fast.", "This is the bus that goes to Haifa."],
        },
        tasks: [
          {
            type: "circle",
            instructions: "הקיפו את המילה הנכונה.",
            instructionsEn: "Circle the right word.",
            items: [
              { text: "This is the book ___ is on the table.", options: ["which", "who"], answer: "which" },
              { text: "I have a dog ___ runs fast.", options: ["who", "that"], answer: "that" },
              { text: "This is the bus that ___ to Haifa.", options: ["goes", "it goes"], answer: "goes" },
              { text: "The boy ___ sings is my brother.", options: ["which", "who"], answer: "who" },
            ],
          },
          {
            type: "rewrite",
            instructions: "חברו את המשפטים עם which.",
            instructionsEn: "Join the sentences with which.",
            example: { text: "This is a bag. It is big.", answer: "This is a bag which is big." },
            items: [
              { text: "I have a cat. It sleeps a lot.", answer: "I have a cat which sleeps a lot." },
              { text: "This is a car. It is red.", answer: "This is a car which is red." },
            ],
          },
          {
            type: "rewrite",
            instructions: "מצאו את הטעות ותקנו.",
            instructionsEn: "Find the mistake and fix it.",
            example: { text: "the book who I read", answer: "the book which I read" },
            items: [{ text: "I have a dog which it runs fast.", answer: "I have a dog which runs fast." }],
          },
        ],
      },
    ],
  },
};
