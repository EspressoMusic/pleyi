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
};
