/* Ready lessons — catalog, filters, player, minimal cards */

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const SUBJECT_LABELS = { english: "אנגלית", math: "חשבון" };

  const LESSON_CATALOG = {
    intro: {
      id: "intro",
      name: "הקדמה לשפה האנגלית",
      nameMain: "הקדמה לשפה האנגלית",
      namePart: "",
      subject: "english",
      grades: ["ag", "dv", "zh"],
      topic: "intro",
      gradeLabel: "כל הכיתות",
      duration: "40 דק'",
      summary: "היכרות מקיפה עם השפה האנגלית — מאיפה היא מגיעה, האלפבית, בניית מילים ומשפטים, ולמה היא נחשבת לשפה בין-לאומית.",
      vocab: [
        { en: "book", he: "ספר" },
        { en: "phone", he: "טלפון" },
        { en: "computer", he: "מחשב" },
        { en: "internet", he: "אינטרנט" },
        { en: "video", he: "וידאו" },
        { en: "music", he: "מוזיקה" },
      ],
      games: [
        { id: "word-memory", label: "זיכרון מילים", icon: "🧠" },
        { id: "hangman", label: "איש תלוי", icon: "🎯" },
      ],
      slides: [
        {
          type: "content",
          title: "מהי השפה האנגלית?",
          subtitle: "פתיחה",
          body: "אנגלית היא אחת השפות המדוברות ביותר בעולם.\n\nאנשים משתמשים בה כדי לדבר, ללמוד, לעבוד ולתקשר עם אנשים ממדינות שונות.",
        },
        {
          type: "content",
          title: "היכן מדברים אנגלית?",
          subtitle: "שפה גלובלית",
          body: "אנגלית היא שפה מרכזית במדינות כמו ארצות הברית, בריטניה, קנדה, אוסטרליה וניו זילנד.\n\nבנוסף, מיליוני אנשים במדינות אחרות לומדים ומשתמשים באנגלית בכל יום.",
        },
        {
          type: "content",
          title: "שפה בין־לאומית",
          subtitle: "תקשורת בין עמים",
          body: "גם כאשר שני אנשים מגיעים ממדינות שונות, הם יכולים להשתמש באנגלית כדי להבין זה את זה.\n\nלכן אנגלית נחשבת לשפה בין־לאומית.",
        },
        {
          type: "content",
          title: "האלפבית האנגלי",
          subtitle: "אותיות",
          body: "באנגלית יש 26 אותיות.\n\nהאותיות מתחילות באות A ומסתיימות באות Z.\n\nלכל אות יש צורה גדולה וצורה קטנה, לדוגמה: A – a, B – b, C – c.",
          say: [
            { match: "A – a, B – b, C – c", speak: "A, B, C", explain: "לכל אות יש צורה גדולה (רישית) וצורה קטנה" },
          ],
        },
        {
          type: "content",
          title: "כותבים משמאל לימין",
          subtitle: "כיוון כתיבה",
          body: "בשונה מעברית, באנגלית כותבים וקוראים משמאל לימין.\n\nלדוגמה: English is easy.\n\nמתחילים לקרוא מצד שמאל וממשיכים לצד ימין.",
          say: [{ match: "English is easy.", speak: "English is easy.", explain: "אנגלית זה קל" }],
        },
        {
          type: "content",
          title: "מילים באנגלית",
          subtitle: "בניית מילים",
          body: "כל מילה באנגלית מורכבת מאותיות.\n\nכאשר מחברים את האותיות בצורה נכונה, נוצרת מילה בעלת משמעות.\n\nלדוגמה: B + O + O + K = BOOK — המילה book פירושה ספר.",
          say: [
            { match: "BOOK", speak: "BOOK", explain: "ספר — באותיות גדולות" },
            { match: "book", speak: "book", explain: "ספר — באותיות קטנות" },
          ],
        },
        {
          type: "content",
          title: "לא תמיד קוראים כמו שכותבים",
          subtitle: "הגייה",
          body: "באנגלית, לא תמיד אפשר לדעת את ההגייה של המילה רק לפי הכתיבה שלה.\n\nלפעמים אותה אות נשמעת בצורה שונה במילים שונות.\n\nלכן חשוב ללמוד גם איך המילה נכתבת וגם איך מבטאים אותה.",
        },
        {
          type: "content",
          title: "איך בנוי משפט באנגלית?",
          subtitle: "מבנה משפט",
          body: "במשפט פשוט באנגלית מופיעים בדרך כלל: מי עושה את הפעולה, מהי הפעולה ומהו המשך המשפט.\n\nלדוגמה: David reads a book. — דוד קורא ספר.",
          say: [{ match: "David reads a book.", speak: "David reads a book.", explain: "דוד קורא ספר" }],
        },
        {
          type: "content",
          title: "מילים רבות מוכרות לנו",
          subtitle: "מילים יומיומיות",
          body: "יש מילים רבות באנגלית שאנחנו כבר מכירים מחיי היום־יום, כמו Phone, Computer, Internet, Video, Music.\n\nאנחנו שומעים ורואים מילים באנגלית כמעט בכל מקום.",
          say: [
            { match: "Phone", speak: "Phone", explain: "טלפון" },
            { match: "Computer", speak: "Computer", explain: "מחשב" },
            { match: "Internet", speak: "Internet", explain: "אינטרנט" },
            { match: "Video", speak: "Video", explain: "וידאו" },
            { match: "Music", speak: "Music", explain: "מוזיקה" },
          ],
        },
        {
          type: "content",
          title: "אנגלית במחשב ובטלפון",
          subtitle: "טכנולוגיה",
          body: "חלק גדול מהאתרים, האפליקציות, המשחקים והתוכנות משתמשים באנגלית.\n\nהיכרות עם השפה עוזרת להבין כפתורים, הוראות והודעות שמופיעות על המסך.",
        },
        {
          type: "content",
          title: "אנגלית אינה זהה בכל מקום",
          subtitle: "ניבים שונים",
          body: "יש כמה סוגים של אנגלית.\n\nלדוגמה, האנגלית בבריטניה מעט שונה מהאנגלית בארצות הברית.\n\nלפעמים ההבדל הוא בהגייה, ולפעמים משתמשים במילים שונות לאותו הדבר.",
        },
        {
          type: "content",
          title: "שפה של מילים ומשפטים",
          subtitle: "סיכום",
          body: "כדי להבין אנגלית, מתחילים מאותיות ומילים.\n\nלאחר מכן מחברים את המילים למשפטים.\n\nככל שמכירים יותר מילים ומבינים את מבנה המשפט, קל יותר לקרוא, לכתוב ולדבר באנגלית.",
        },
        { type: "games", title: "זמן לתרגל!", subtitle: "משחקים" },
        {
          type: "content",
          title: "סוף השיעור",
          subtitle: "כל הכבוד!",
          body: "תודה על ההשתתפות!",
        },
      ],
    },

    colors: {
      id: "colors",
      name: "צבעים",
      nameMain: "צבעים",
      namePart: "",
      subject: "english",
      grades: ["ag"],
      topic: "colors",
      gradeLabel: "א׳-ג׳",
      duration: "25 דק'",
      summary: "לומדים את שמות הצבעים באנגלית, את סדר המילים הנכון במשפט, ומתרגלים עם דוגמאות ומשחק.",
      vocab: [
        { en: "red", he: "אדום" },
        { en: "blue", he: "כחול" },
        { en: "yellow", he: "צהוב" },
        { en: "green", he: "ירוק" },
        { en: "orange", he: "כתום" },
        { en: "purple", he: "סגול" },
        { en: "pink", he: "ורוד" },
        { en: "black", he: "שחור" },
      ],
      games: [
        { id: "word-memory", label: "זיכרון מילים", icon: "🧠" },
        { id: "spot-diff", label: "מצא את ההבדלים", icon: "🔍" },
      ],
      slides: [
        {
          type: "content",
          title: "מה זה צבעים באנגלית?",
          subtitle: "פתיחה",
          body: "צבעים הם מילים שעוזרות לנו לתאר איך דברים נראים.\n\nבאנגלית, לכל צבע יש מילה משלו — נכיר אותן אחת אחת.",
        },
        {
          type: "content",
          title: "Colors",
          subtitle: "אוצר מילים",
          items: [
            { en: "red", he: "אדום" },
            { en: "blue", he: "כחול" },
            { en: "yellow", he: "צהוב" },
            { en: "green", he: "ירוק" },
            { en: "orange", he: "כתום" },
            { en: "purple", he: "סגול" },
            { en: "pink", he: "ורוד" },
            { en: "black", he: "שחור" },
          ],
        },
        {
          type: "content",
          title: "הצבע בא לפני השם",
          subtitle: "כלל דקדוקי",
          body: "באנגלית, מילת הצבע תמיד באה לפני שם העצם.\n\nלדוגמה: a red apple (תפוח אדום), a blue sky (שמיים כחולים).\n\nשימו לב לסדר המילים — הצבע קודם!",
          say: [
            { match: "a red apple", speak: "a red apple", explain: "תפוח אדום" },
            { match: "a blue sky", speak: "a blue sky", explain: "שמיים כחולים" },
          ],
        },
        {
          type: "content",
          title: "Let's Practice",
          subtitle: "בואו נתרגל",
          body: "The sky is blue.\nThe sun is yellow.\nMy shirt is green.",
          say: [
            { match: "The sky is blue.", speak: "The sky is blue.", explain: "השמיים כחולים" },
            { match: "The sun is yellow.", speak: "The sun is yellow.", explain: "השמש צהובה" },
            { match: "My shirt is green.", speak: "My shirt is green.", explain: "החולצה שלי ירוקה" },
          ],
        },
        {
          type: "content",
          title: "איזה צבע זה?",
          subtitle: "שאלה ותשובה",
          body: "כדי לשאול על צבע אומרים: What color is it?\n\nהתשובה: It is red. / It is blue.\n\nנסו לשאול חבר: What color is your bag?",
          say: [
            { match: "What color is it?", speak: "What color is it?", explain: "איזה צבע זה?" },
            { match: "It is red.", speak: "It is red.", explain: "זה אדום" },
            { match: "It is blue.", speak: "It is blue.", explain: "זה כחול" },
            { match: "What color is your bag?", speak: "What color is your bag?", explain: "איזה צבע יש לתיק שלך?" },
          ],
        },
        {
          type: "content",
          title: "צבעים בעולם שלנו",
          subtitle: "חיבור לחיים",
          body: "ברמזור: red = עצור, yellow = המתן, green = סע.\n\nבקשת בענן יש הרבה צבעים: אדום, כתום, צהוב, ירוק, כחול, סגול.",
          say: [
            { match: "red", speak: "red", explain: "אדום" },
            { match: "yellow", speak: "yellow", explain: "צהוב" },
            { match: "green", speak: "green", explain: "ירוק" },
          ],
        },
        { type: "games", title: "זמן לתרגל!", subtitle: "משחקים" },
        {
          type: "content",
          title: "סוף השיעור",
          subtitle: "כל הכבוד!",
          body: "תודה על ההשתתפות!",
        },
      ],
    },

    numbers: {
      id: "numbers",
      name: "מספרים",
      nameMain: "מספרים",
      namePart: "",
      subject: "english",
      grades: ["ag"],
      topic: "numbers",
      gradeLabel: "א׳-ג׳",
      duration: "25 דק'",
      summary: "לומדים לספור באנגלית מ-1 עד 10, איך מוסיפים S לרבים, ומתרגלים עם שאלות ומשחק.",
      vocab: [
        { en: "one", he: "אחת" },
        { en: "two", he: "שתיים" },
        { en: "three", he: "שלוש" },
        { en: "four", he: "ארבע" },
        { en: "five", he: "חמש" },
        { en: "six", he: "שש" },
        { en: "seven", he: "שבע" },
        { en: "eight", he: "שמונה" },
        { en: "nine", he: "תשע" },
        { en: "ten", he: "עשר" },
      ],
      games: [
        { id: "hangman", label: "איש תלוי", icon: "🎯" },
        { id: "tower-stack", label: "מגדל מילים", icon: "🗼" },
      ],
      slides: [
        {
          type: "content",
          title: "למה לומדים מספרים?",
          subtitle: "פתיחה",
          body: "מספרים מלווים אותנו כל יום — לספור חברים, לדעת גיל, לקרוא מחיר ועוד.\n\nהיום נלמד לספור באנגלית מ-1 עד 10.",
        },
        {
          type: "content",
          title: "Numbers",
          subtitle: "אוצר מילים",
          items: [
            { en: "one", he: "אחת" },
            { en: "two", he: "שתיים" },
            { en: "three", he: "שלוש" },
            { en: "four", he: "ארבע" },
            { en: "five", he: "חמש" },
            { en: "six", he: "שש" },
            { en: "seven", he: "שבע" },
            { en: "eight", he: "שמונה" },
            { en: "nine", he: "תשע" },
            { en: "ten", he: "עשר" },
          ],
        },
        {
          type: "content",
          title: "סופרים חפצים",
          subtitle: "כלל דקדוקי",
          body: "כשסופרים יותר מדבר אחד, מוסיפים S בסוף המילה.\n\nלדוגמה: one book, two books, three books.\n\nשימו לב ל-S שמתווסף כשיש יותר מאחד!",
          say: [
            {
              match: "one book, two books, three books",
              speak: "one book, two books, three books",
              explain: "ספר אחד, שני ספרים, שלושה ספרים",
            },
          ],
        },
        {
          type: "content",
          title: "Let's Count",
          subtitle: "בואו נתרגל",
          body: "I have two hands.\nI see five fingers.\nCount to ten with me!",
          say: [
            { match: "I have two hands.", speak: "I have two hands.", explain: "יש לי שתי ידיים" },
            { match: "I see five fingers.", speak: "I see five fingers.", explain: "אני רואה חמש אצבעות" },
            { match: "Count to ten with me!", speak: "Count to ten with me!", explain: "ספרו עד עשר איתי!" },
          ],
        },
        {
          type: "content",
          title: "כמה יש?",
          subtitle: "שאלה ותשובה",
          body: "כדי לשאול כמה יש, אומרים: How many apples?\n\nהתשובה: Three apples.\n\nנסו לשאול: How many books do you have?",
          say: [
            { match: "How many apples?", speak: "How many apples?", explain: "כמה תפוחים יש?" },
            { match: "Three apples.", speak: "Three apples.", explain: "שלושה תפוחים" },
            { match: "How many books do you have?", speak: "How many books do you have?", explain: "כמה ספרים יש לך?" },
          ],
        },
        {
          type: "content",
          title: "מספרים בחיים שלנו",
          subtitle: "חיבור לחיים",
          body: "משתמשים במספרים כדי לומר גיל (I am eight years old), מספר טלפון, ומחיר בחנות.",
          say: [{ match: "I am eight years old", speak: "I am eight years old", explain: "אני בן/בת שמונה" }],
        },
        { type: "games", title: "זמן לתרגל!", subtitle: "משחקים" },
        {
          type: "content",
          title: "סוף השיעור",
          subtitle: "כל הכבוד!",
          body: "תודה על ההשתתפות!",
        },
      ],
    },

    animals: {
      id: "animals",
      name: "בעלי חיים",
      nameMain: "בעלי חיים",
      namePart: "",
      subject: "english",
      grades: ["ag"],
      topic: "animals",
      gradeLabel: "א׳-ג׳",
      duration: "25 דק'",
      summary: "מכירים שמות של בעלי חיים אהובים באנגלית, לומדים איך הם 'מדברים', ומתרגלים עם משפטים ומשחק.",
      vocab: [
        { en: "dog", he: "כלב" },
        { en: "cat", he: "חתול" },
        { en: "lion", he: "אריה" },
        { en: "elephant", he: "פיל" },
        { en: "bird", he: "ציפור" },
        { en: "fish", he: "דג" },
        { en: "rabbit", he: "ארנב" },
        { en: "horse", he: "סוס" },
      ],
      games: [
        { id: "word-memory", label: "זיכרון מילים", icon: "🧠" },
        { id: "hangman", label: "איש תלוי", icon: "🎯" },
      ],
      slides: [
        {
          type: "content",
          title: "עולם בעלי החיים",
          subtitle: "פתיחה",
          body: "יש המון בעלי חיים בעולם — בבית, בחווה וביער.\n\nהיום נלמד איך קוראים להם באנגלית.",
        },
        {
          type: "content",
          title: "Animals",
          subtitle: "אוצר מילים",
          items: [
            { en: "dog", he: "כלב" },
            { en: "cat", he: "חתול" },
            { en: "lion", he: "אריה" },
            { en: "elephant", he: "פיל" },
            { en: "bird", he: "ציפור" },
            { en: "fish", he: "דג" },
            { en: "rabbit", he: "ארנב" },
            { en: "horse", he: "סוס" },
          ],
        },
        {
          type: "content",
          title: "איך בעלי חיים מדברים?",
          subtitle: "קולות חיות",
          body: "A dog says woof!\nA cat says meow!\nA cow says moo!",
          say: [
            { match: "A dog says woof!", speak: "A dog says woof!", explain: "כלב אומר האו האו!" },
            { match: "A cat says meow!", speak: "A cat says meow!", explain: "חתול אומר מיאו!" },
            { match: "A cow says moo!", speak: "A cow says moo!", explain: "פרה אומרת מו!" },
          ],
        },
        {
          type: "content",
          title: "יש לי / אין לי",
          subtitle: "כלל דקדוקי",
          body: "כדי לומר שיש לי משהו: I have a dog.\n\nכדי לומר שאין לי: I don't have a cat.\n\nנסו להגיד משפט כזה על עצמכם!",
          say: [
            { match: "I have a dog.", speak: "I have a dog.", explain: "יש לי כלב" },
            { match: "I don't have a cat.", speak: "I don't have a cat.", explain: "אין לי חתול" },
          ],
        },
        {
          type: "content",
          title: "Let's Practice",
          subtitle: "בואו נתרגל",
          body: "The dog is big.\nThe bird can fly.\nFish live in water.",
          say: [
            { match: "The dog is big.", speak: "The dog is big.", explain: "הכלב גדול" },
            { match: "The bird can fly.", speak: "The bird can fly.", explain: "הציפור יכולה לעוף" },
            { match: "Fish live in water.", speak: "Fish live in water.", explain: "דגים חיים במים" },
          ],
        },
        { type: "games", title: "זמן לתרגל!", subtitle: "משחקים" },
        {
          type: "content",
          title: "סוף השיעור",
          subtitle: "כל הכבוד!",
          body: "תודה על ההשתתפות!",
        },
      ],
    },

    family: {
      id: "family",
      name: "משפחה",
      nameMain: "משפחה",
      namePart: "",
      subject: "english",
      grades: ["ag"],
      topic: "family",
      gradeLabel: "א׳-ג׳",
      duration: "25 דק'",
      summary: "לומדים איך אומרים בני משפחה באנגלית, איך מציגים אותם עם My, ומתרגלים עם שאלות ומשחק.",
      vocab: [
        { en: "mother", he: "אמא" },
        { en: "father", he: "אבא" },
        { en: "sister", he: "אחות" },
        { en: "brother", he: "אח" },
        { en: "grandmother", he: "סבתא" },
        { en: "grandfather", he: "סבא" },
      ],
      games: [
        { id: "vocabulary-duel", label: "טריוויה", icon: "⚔️" },
        { id: "word-memory", label: "זיכרון מילים", icon: "🧠" },
      ],
      slides: [
        {
          type: "content",
          title: "מי נמצא במשפחה שלי?",
          subtitle: "פתיחה",
          body: "לכל אחד יש משפחה — הורים, אחים, סבא וסבתא.\n\nהיום נלמד איך קוראים לבני המשפחה באנגלית.",
        },
        {
          type: "content",
          title: "Family",
          subtitle: "אוצר מילים",
          items: [
            { en: "mother", he: "אמא" },
            { en: "father", he: "אבא" },
            { en: "sister", he: "אחות" },
            { en: "brother", he: "אח" },
            { en: "grandmother", he: "סבתא" },
            { en: "grandfather", he: "סבא" },
          ],
        },
        {
          type: "content",
          title: "זה שלי — This is my",
          subtitle: "כלל דקדוקי",
          body: "כדי להציג בן משפחה אומרים: This is my mother.\n\nהמילה my פירושה שלי.\n\nנסו: This is my brother.",
          say: [
            { match: "This is my mother.", speak: "This is my mother.", explain: "זאת אמא שלי" },
            { match: "This is my brother.", speak: "This is my brother.", explain: "זה אח שלי" },
          ],
        },
        {
          type: "content",
          title: "Let's Practice",
          subtitle: "בואו נתרגל",
          body: "This is my mother.\nI love my family.\nMy brother is funny.",
          say: [
            { match: "This is my mother.", speak: "This is my mother.", explain: "זאת אמא שלי" },
            { match: "I love my family.", speak: "I love my family.", explain: "אני אוהב/אוהבת את המשפחה שלי" },
            { match: "My brother is funny.", speak: "My brother is funny.", explain: "אח שלי מצחיק" },
          ],
        },
        {
          type: "content",
          title: "מי זה?",
          subtitle: "שאלה ותשובה",
          body: "כדי לשאול מי זה, אומרים: Who is this?\n\nהתשובה: This is my sister.\n\nנסו לשאול על בן משפחה שלכם!",
          say: [
            { match: "Who is this?", speak: "Who is this?", explain: "מי זה?" },
            { match: "This is my sister.", speak: "This is my sister.", explain: "זאת אחות שלי" },
          ],
        },
        { type: "games", title: "זמן לתרגל!", subtitle: "משחקים" },
        {
          type: "content",
          title: "סוף השיעור",
          subtitle: "כל הכבוד!",
          body: "תודה על ההשתתפות!",
        },
      ],
    },
  };

  const LESSON_TOPICS = {
    english: {
      ag: [
        { id: "intro", label: "הקדמה" },
        { id: "colors", label: "צבעים" },
        { id: "numbers", label: "מספרים" },
        { id: "animals", label: "בעלי חיים" },
        { id: "family", label: "משפחה" },
      ],
      dv: [{ id: "intro", label: "הקדמה" }],
      zh: [{ id: "intro", label: "הקדמה" }],
    },
    math: {
      ag: [
        { id: "addition", label: "חיבור" },
        { id: "subtraction", label: "חיסור" },
        { id: "shapes", label: "צורות" },
      ],
      dv: [
        { id: "multiplication", label: "כפל" },
        { id: "division", label: "חילוק" },
        { id: "fractions", label: "שברים" },
      ],
      zh: [
        { id: "equations", label: "משוואות" },
        { id: "percentages", label: "אחוזים" },
        { id: "geometry", label: "גאומטריה" },
      ],
    },
  };

  function bindLessonFilters() {
    const filtersRoot = $("#lessonFilters");
    const topicMenu = $("#filterTopicMenu");
    const subjectValue = $("#filterSubjectValue");
    const gradeValue = $("#filterGradeValue");
    const topicValue = $("#filterTopicValue");
    const cards = $$(".svc-lesson-card[data-lesson]");
    const empty = $("#lessonEmptyState");
    if (!filtersRoot || !topicMenu || !cards.length) return;

    const state = { subject: "all", grade: "all", topic: "all" };
    let openDropdown = null;

    function closeDropdown() {
      if (!openDropdown) return;
      openDropdown.menu.classList.add("hidden");
      openDropdown.trigger.setAttribute("aria-expanded", "false");
      openDropdown.wrap.classList.remove("is-open");
      openDropdown = null;
    }

    function openDropdownMenu(wrap, trigger, menu) {
      if (openDropdown?.wrap === wrap) {
        closeDropdown();
        return;
      }
      closeDropdown();
      menu.classList.remove("hidden");
      trigger.setAttribute("aria-expanded", "true");
      wrap.classList.add("is-open");
      openDropdown = { wrap, trigger, menu };
    }

    function bindDropdown(wrap, trigger, menu, onSelect) {
      trigger?.addEventListener("click", (e) => {
        e.stopPropagation();
        openDropdownMenu(wrap, trigger, menu);
      });

      $$("button", menu).forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          $$("button", menu).forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          onSelect(btn);
          closeDropdown();
        });
      });
    }

    function getTopicOptions() {
      const subjects = state.subject === "all" ? Object.keys(LESSON_TOPICS) : [state.subject];
      const grades = state.grade === "all" ? ["ag", "dv", "zh"] : [state.grade];
      const seen = new Map();
      subjects.forEach((subject) => {
        grades.forEach((grade) => {
          (LESSON_TOPICS[subject]?.[grade] || []).forEach((topic) => {
            if (!seen.has(topic.id)) seen.set(topic.id, topic.label);
          });
        });
      });
      return [{ id: "all", label: "הכל" }, ...[...seen.entries()].map(([id, label]) => ({ id, label }))];
    }

    function renderTopicMenu() {
      const topics = getTopicOptions();
      if (!topics.some((t) => t.id === state.topic)) state.topic = "all";

      topicMenu.innerHTML = topics
        .map(
          (t) =>
            `<li><button type="button" data-topic="${t.id}" class="${state.topic === t.id ? "active" : ""}">${t.label}</button></li>`
        )
        .join("");

      const current = topics.find((t) => t.id === state.topic);
      if (topicValue) topicValue.textContent = current?.label || "הכל";

      $$("button", topicMenu).forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          state.topic = btn.dataset.topic;
          $$("button", topicMenu).forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          if (topicValue) topicValue.textContent = btn.textContent;
          closeDropdown();
          applyFilters();
        });
      });
    }

    function applyFilters() {
      let visible = 0;
      cards.forEach((card) => {
        const lesson = LESSON_CATALOG[card.dataset.lesson];
        if (!lesson) {
          card.classList.add("hidden");
          return;
        }
        const matchSubject = state.subject === "all" || lesson.subject === state.subject;
        const matchGrade = state.grade === "all" || lesson.grades.includes(state.grade);
        const matchTopic = state.topic === "all" || lesson.topic === state.topic;
        const show = matchSubject && matchGrade && matchTopic;
        card.classList.toggle("hidden", !show);
        if (show) visible += 1;
      });
      empty?.classList.toggle("hidden", visible > 0);
    }

    bindDropdown(
      $('[data-filter-key="subject"]', filtersRoot),
      $("#filterSubjectTrigger"),
      $("#filterSubjectMenu"),
      (btn) => {
        state.subject = btn.dataset.subject;
        if (subjectValue) subjectValue.textContent = btn.textContent;
        renderTopicMenu();
        applyFilters();
      }
    );

    bindDropdown(
      $('[data-filter-key="grade"]', filtersRoot),
      $("#filterGradeTrigger"),
      $("#filterGradeMenu"),
      (btn) => {
        state.grade = btn.dataset.grade;
        if (gradeValue) gradeValue.textContent = btn.textContent;
        renderTopicMenu();
        applyFilters();
      }
    );

    $("#filterTopicTrigger")?.addEventListener("click", (e) => {
      e.stopPropagation();
      const wrap = $('[data-filter-key="topic"]', filtersRoot);
      openDropdownMenu(wrap, $("#filterTopicTrigger"), topicMenu);
    });

    document.addEventListener("click", closeDropdown);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeDropdown();
    });

    renderTopicMenu();
    applyFilters();
  }

  const LESSON_SHARE_PATH = "/services/ready-lessons";

  function openLessonInfoModal(lessonId) {
    const lesson = LESSON_CATALOG[lessonId];
    const modal = $("#lessonInfoModal");
    if (!lesson || !modal) return;

    $("#lessonInfoTitle").textContent = lesson.nameMain || lesson.name;
    $("#lessonInfoSubject").textContent = SUBJECT_LABELS[lesson.subject] || lesson.subject;
    $("#lessonInfoGrade").textContent = lesson.gradeLabel;
    $("#lessonInfoDuration").textContent = lesson.duration;
    $("#lessonInfoSummary").textContent = lesson.summary;
    $("#lessonInfoLearnedBadge")?.classList.toggle("hidden", !getLearnedLessons().includes(lessonId));

    const openBtn = $("#lessonInfoOpenBtn");
    if (openBtn) openBtn.dataset.lesson = lessonId;
    const shareBtn = $("#lessonInfoShareBtn");
    if (shareBtn) shareBtn.dataset.lesson = lessonId;
    const shareLabel = $("#lessonInfoShareLabel");
    if (shareLabel) shareLabel.textContent = "שיתוף השיעור";

    modal.classList.remove("hidden");
  }

  function closeLessonInfoModal() {
    $("#lessonInfoModal")?.classList.add("hidden");
  }

  async function shareLesson(lessonId) {
    const lesson = LESSON_CATALOG[lessonId];
    if (!lesson) return;
    const shareLabel = $("#lessonInfoShareLabel");
    const url = `${window.location.origin}${LESSON_SHARE_PATH}?lesson=${encodeURIComponent(lessonId)}`;
    const title = `שיעור: ${lesson.nameMain || lesson.name}`;
    const text = `בואו ללמוד "${lesson.nameMain || lesson.name}" באנגלית עם Pleyi!`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (err) {
        if (err?.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      if (shareLabel) {
        shareLabel.textContent = "הקישור הועתק!";
        setTimeout(() => {
          if (shareLabel.textContent === "הקישור הועתק!") shareLabel.textContent = "שיתוף השיעור";
        }, 2000);
      }
    } catch {
      /* ignore */
    }
  }

  function bindLessonInfoModal() {
    const modal = $("#lessonInfoModal");
    if (!modal) return;

    $$(".svc-lesson-card[data-lesson]").forEach((card) => {
      const toggle = $(".svc-lesson-info-toggle", card);
      toggle?.addEventListener("click", (e) => {
        e.stopPropagation();
        openLessonInfoModal(card.dataset.lesson);
      });
    });

    $("#lessonInfoClose")?.addEventListener("click", closeLessonInfoModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeLessonInfoModal();
    });
    $("#lessonInfoOpenBtn")?.addEventListener("click", closeLessonInfoModal);
    $("#lessonInfoShareBtn")?.addEventListener("click", (e) => {
      shareLesson(e.currentTarget.dataset.lesson);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.classList.contains("hidden")) closeLessonInfoModal();
    });
  }

  function tryOpenSharedLesson() {
    const lessonId = new URLSearchParams(window.location.search).get("lesson");
    if (lessonId && LESSON_CATALOG[lessonId]) openLessonInfoModal(lessonId);
  }

  const LESSON_RETURN_KEY = "gameclass-lesson-return";
  const LESSON_RESTORE_KEY = "gameclass-lesson-restore";
  const LESSONS_LEARNED_KEY = "pleyi-lessons-learned";

  function getLearnedLessons() {
    try {
      const raw = JSON.parse(localStorage.getItem(LESSONS_LEARNED_KEY) || "[]");
      return Array.isArray(raw) ? raw : [];
    } catch {
      return [];
    }
  }

  function showLearnedBadge(lessonId) {
    const card = $(`.svc-lesson-card[data-lesson="${lessonId}"]`);
    $(".svc-lesson-learned-badge", card)?.classList.remove("hidden");
  }

  function markLessonLearned(lessonId) {
    const learned = getLearnedLessons();
    if (!learned.includes(lessonId)) {
      learned.push(lessonId);
      localStorage.setItem(LESSONS_LEARNED_KEY, JSON.stringify(learned));
    }
    showLearnedBadge(lessonId);
  }

  function applyLearnedBadges() {
    getLearnedLessons().forEach(showLearnedBadge);
  }

  const LP_BG_KEY = "pleyi-lesson-player-bg";
  const LP_BG_OPTIONS = [
    { id: "default", label: "ברירת מחדל" },
    { id: "mint", label: "מנטה" },
    { id: "peach", label: "אפרסק" },
    { id: "lavender", label: "לבנדר" },
    { id: "sky", label: "שמיים" },
    { id: "sand", label: "חול" },
    { id: "navy", label: "לילה", dark: true },
    { id: "plum", label: "ענבים", dark: true },
    { id: "forest", label: "יער", dark: true },
    { id: "charcoal", label: "פחם", dark: true },
  ];

  function bindLessonPlayerBackground(shell, bgBtn, bgMenu) {
    if (!shell || !bgBtn || !bgMenu) return;

    bgMenu.innerHTML = LP_BG_OPTIONS.map(
      (opt) =>
        `<button type="button" class="lp-bg-swatch" data-bg="${opt.id}" aria-label="${opt.label}" title="${opt.label}"></button>`
    ).join("");
    const swatches = $$(".lp-bg-swatch", bgMenu);

    function applyBackground(bgId) {
      const opt = LP_BG_OPTIONS.find((o) => o.id === bgId) || LP_BG_OPTIONS[0];
      shell.classList.remove(...LP_BG_OPTIONS.map((o) => `lp-bg-${o.id}`), "lp-bg-dark");
      if (opt.id !== "default") shell.classList.add(`lp-bg-${opt.id}`);
      if (opt.dark) shell.classList.add("lp-bg-dark");
      swatches.forEach((sw) => sw.classList.toggle("active", sw.dataset.bg === opt.id));
      try {
        localStorage.setItem(LP_BG_KEY, opt.id);
      } catch {
        /* ignore */
      }
    }

    function readBackground() {
      try {
        const stored = localStorage.getItem(LP_BG_KEY);
        if (LP_BG_OPTIONS.some((opt) => opt.id === stored)) return stored;
      } catch {
        /* ignore */
      }
      return "default";
    }

    function closeMenu() {
      bgMenu.classList.add("hidden");
      bgBtn.setAttribute("aria-expanded", "false");
    }

    applyBackground(readBackground());

    bgBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = !bgMenu.classList.contains("hidden");
      if (isOpen) {
        closeMenu();
        return;
      }
      bgMenu.classList.remove("hidden");
      bgBtn.setAttribute("aria-expanded", "true");
    });

    swatches.forEach((sw) => {
      sw.addEventListener("click", (e) => {
        e.stopPropagation();
        applyBackground(sw.dataset.bg);
        closeMenu();
      });
    });

    bgMenu.addEventListener("click", (e) => e.stopPropagation());
    document.addEventListener("click", closeMenu);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }


  function escAttr(str) {
    return String(str).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  }

  function containsHebrew(str) {
    return /[֐-׿]/.test(str);
  }

  function containsLatinLetter(str) {
    return /[A-Za-z]/.test(str);
  }

  // Wraps standalone English lines and any curated `say` phrases in clickable
  // <span class="lp-say"> spans so tapping them opens the translation/explanation
  // popup (same one vocab words use), with a speaker button to hear it aloud.
  function wrapSayableBody(body, sayList) {
    const remaining = (sayList || []).map((entry) =>
      typeof entry === "string" ? { match: entry, speak: entry, explain: "" } : entry
    );

    function sayTag(display, speak, explain) {
      return `<span class="lp-say" data-say="${escAttr(speak)}" data-explain="${escAttr(explain || "")}">${display}</span>`;
    }

    return body
      .split("\n")
      .map((line) => {
        if (!line.trim()) return line;

        // Prefer a curated whole-line match first — it carries an explanation.
        const wholeLineIdx = !containsHebrew(line)
          ? remaining.findIndex((entry) => entry.match === line.trim())
          : -1;
        if (wholeLineIdx !== -1) {
          const entry = remaining[wholeLineIdx];
          remaining.splice(wholeLineIdx, 1);
          return sayTag(line, entry.speak, entry.explain);
        }

        if (!containsHebrew(line) && containsLatinLetter(line)) {
          return sayTag(line, line.trim(), "");
        }

        let result = line;
        for (let i = remaining.length - 1; i >= 0; i--) {
          const entry = remaining[i];
          const idx = result.indexOf(entry.match);
          if (idx === -1) continue;
          result = result.slice(0, idx) + sayTag(entry.match, entry.speak, entry.explain) + result.slice(idx + entry.match.length);
          remaining.splice(i, 1);
        }
        return result;
      })
      .join("<br>");
  }

  function launchLessonGame(lesson, gameId, slideIndex) {
    const text = lesson.vocab.map((v) => `${v.en}=${v.he}`).join("\n");
    sessionStorage.setItem(
      LESSON_RETURN_KEY,
      JSON.stringify({
        lessonId: lesson.id,
        slideIndex,
        returnUrl: "/services/ready-lessons",
        lessonName: lesson.name,
      })
    );
    window.CreateGameFlow?.launchGame({
      text,
      items: lesson.vocab,
      subject: lesson.subject,
      gamePick: gameId,
    });
  }

  function bindLessonPlayer() {
    const player = $("#lessonPlayer");
    const slideEl = $("#lessonPlayerSlide");
    const progressEl = $("#lessonPlayerProgress");
    const dotsWrap = $("#lessonPlayerDots");
    const prevBtn = $("#lessonPlayerPrev");
    const nextBtn = $("#lessonPlayerNext");
    const prevMobile = $("#lessonPlayerPrevMobile");
    const nextMobile = $("#lessonPlayerNextMobile");
    const closeBtn = $("#lessonPlayerClose");
    const expandBtn = $("#lessonPlayerExpand");
    const bgBtn = $("#lessonPlayerBg");
    const bgMenu = $("#lessonPlayerBgMenu");
    const backdrop = $("#lessonPlayerBackdrop");
    const shell = $(".lesson-player-shell", player);
    if (!player || !slideEl) return;

    if (player.parentElement !== document.body) {
      document.body.appendChild(player);
    }

    bindLessonPlayerBackground(shell, bgBtn, bgMenu);

    let lesson = null;
    let steps = [];
    let index = 0;

    const EXPAND_ICON = `<svg class="lesson-player-expand-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H3v5M16 3h5v5M16 21h5v-5M8 21H3v-5"/></svg>`;
    const COMPRESS_ICON = `<svg class="lesson-player-expand-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 14h6v6M20 10h-6V4M14 20v-6h6M10 4v6H4"/></svg>`;

    function setExpanded(expanded) {
      player.classList.toggle("is-expanded", expanded);
      document.body.classList.toggle("lesson-player-expanded", expanded);
      if (expandBtn) {
        expandBtn.setAttribute("aria-pressed", expanded ? "true" : "false");
        expandBtn.setAttribute("aria-label", expanded ? "חזור לחלון קטן" : "הגדל למסך מלא");
        expandBtn.innerHTML = expanded ? COMPRESS_ICON : EXPAND_ICON;
      }
    }

    const SPEAKER_ICON = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 5V4L8 9H4Z"/><path d="M16.2 8.8a5 5 0 0 1 0 6.4"/><path d="M18.8 6.2a9 9 0 0 1 0 11.6"/></svg>`;

    let wordPopupEl = null;
    let activeWordBtn = null;

    // Default TTS voices are often the robotic system fallback — prefer a
    // natural/cloud voice (Edge/Chrome "Online (Natural)" or "Google US English")
    // when the browser offers one, otherwise fall back to whatever exists.
    let cachedVoice;
    const PREFERRED_VOICE_NAMES = [
      "Google US English",
      "Microsoft Aria Online (Natural)",
      "Microsoft Jenny Online (Natural)",
      "Microsoft Ana Online (Natural)",
      "Samantha",
    ];

    function pickVoice() {
      if (cachedVoice !== undefined) return cachedVoice;
      const voices = window.speechSynthesis?.getVoices?.() || [];
      if (!voices.length) return null;
      cachedVoice =
        voices.find((v) => PREFERRED_VOICE_NAMES.includes(v.name)) ||
        voices.find((v) => /^en/i.test(v.lang) && /(natural|online|google)/i.test(v.name)) ||
        voices.find((v) => v.lang === "en-US") ||
        voices.find((v) => /^en/i.test(v.lang)) ||
        null;
      return cachedVoice;
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.addEventListener("voiceschanged", () => {
        cachedVoice = undefined;
      });
    }

    function ensureWordPopup() {
      if (wordPopupEl) return wordPopupEl;
      wordPopupEl = document.createElement("div");
      wordPopupEl.id = "lpWordPopup";
      wordPopupEl.className = "lp-word-popup hidden";
      wordPopupEl.setAttribute("role", "tooltip");
      wordPopupEl.innerHTML = `
        <button type="button" class="lp-word-popup-speak" aria-label="השמע הגייה">${SPEAKER_ICON}</button>
        <span class="lp-word-popup-text"></span>
      `;
      document.body.appendChild(wordPopupEl);
      $(".lp-word-popup-speak", wordPopupEl).addEventListener("click", (e) => {
        e.stopPropagation();
        if (wordPopupEl.dataset.word) speakWord(wordPopupEl.dataset.word);
      });
      wordPopupEl.addEventListener("click", (e) => e.stopPropagation());
      return wordPopupEl;
    }

    function speakWord(word) {
      if (!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(word);
      utter.lang = "en-US";
      utter.rate = 0.92;
      utter.pitch = 1;
      const voice = pickVoice();
      if (voice) {
        utter.voice = voice;
        utter.lang = voice.lang;
      }
      window.speechSynthesis.speak(utter);
    }

    function activeClassFor(el) {
      return el.classList.contains("lp-word") ? "lp-word-active" : "lp-say-active";
    }

    function closeWordPopup() {
      if (!wordPopupEl || wordPopupEl.classList.contains("hidden")) return false;
      wordPopupEl.classList.add("hidden");
      if (activeWordBtn) activeWordBtn.classList.remove(activeClassFor(activeWordBtn));
      activeWordBtn = null;
      return true;
    }

    function positionWordPopup(btn) {
      const popup = wordPopupEl;
      const rect = btn.getBoundingClientRect();
      popup.style.left = "0px";
      popup.style.top = "0px";
      const popupRect = popup.getBoundingClientRect();

      let left = rect.left + rect.width / 2 - popupRect.width / 2;
      left = Math.max(8, Math.min(left, window.innerWidth - popupRect.width - 8));
      let top = rect.top - popupRect.height - 10;
      if (top < 8) top = rect.bottom + 10;
      popup.style.left = `${left}px`;
      popup.style.top = `${top}px`;
    }

    function openWordPopup(btn) {
      if (activeWordBtn === btn) {
        closeWordPopup();
        return;
      }
      const popup = ensureWordPopup();
      if (activeWordBtn) activeWordBtn.classList.remove(activeClassFor(activeWordBtn));
      activeWordBtn = btn;
      btn.classList.add(activeClassFor(btn));
      const isWord = btn.classList.contains("lp-word");
      popup.dataset.word = (isWord ? btn.dataset.en : btn.dataset.say) || "";
      $(".lp-word-popup-text", popup).textContent = (isWord ? btn.dataset.he : btn.dataset.explain || btn.dataset.say) || "";
      popup.classList.remove("hidden");
      positionWordPopup(btn);
    }

    function popElement(el, variant = "pop") {
      const cls = variant === "celebrate" ? "is-celebrating" : "is-popped";
      el.classList.remove("is-popped", "is-celebrating");
      void el.offsetWidth;
      el.classList.add(cls);
      el.addEventListener("animationend", () => el.classList.remove(cls), { once: true });
    }

    slideEl.addEventListener("click", (e) => {
      const wordBtn = e.target.closest(".lp-word");
      if (wordBtn) {
        e.stopPropagation();
        openWordPopup(wordBtn);
        return;
      }
      const sayEl = e.target.closest(".lp-say");
      if (sayEl) {
        e.stopPropagation();
        popElement(sayEl);
        openWordPopup(sayEl);
        return;
      }
      const orbBtn = e.target.closest(".lp-slide-orb");
      if (orbBtn) {
        e.stopPropagation();
        closeWordPopup();
        popElement(orbBtn, orbBtn.classList.contains("lp-slide-orb--celebrate") ? "celebrate" : "pop");
      }
    });

    document.addEventListener("click", () => closeWordPopup());
    window.addEventListener("resize", () => closeWordPopup());
    window.addEventListener("scroll", () => closeWordPopup(), true);

    function renderGamesSlide(slide) {
      const games = lesson.games || [];
      return `
        <div class="lp-slide-inner">
          <div class="lp-slide-head">
            <h2 class="lp-slide-title">${slide.title}</h2>
          </div>
          <div class="lp-slide-body-wrap">
            <p class="lp-slide-games-intro">בחרו משחק — התוכן יהיה מהמילים שלמדנו בשיעור.</p>
            <div class="lp-slide-games">
              <div class="lp-game-options">
                ${games
                  .map(
                    (g) =>
                      `<button type="button" class="lp-game-btn" data-game-id="${g.id}">
                        <span class="lp-game-btn-icon" aria-hidden="true">${g.icon || "🎮"}</span>
                        <span class="lp-game-btn-label">${g.label}</span>
                      </button>`
                  )
                  .join("")}
              </div>
            </div>
          </div>
        </div>`;
    }

    function renderContentSlide(slide) {
      let bodyHtml = "";
      let hasInteractiveBody = false;

      if (slide.items?.length) {
        bodyHtml = `<ul class="lp-slide-list">${slide.items
          .map(
            (it) =>
              `<li><button type="button" class="lp-word" dir="ltr" data-en="${it.en}" data-he="${it.he}">${it.en}</button><span>${it.he}</span></li>`
          )
          .join("")}</ul>`;
        hasInteractiveBody = true;
      } else if (slide.body) {
        bodyHtml = `<p class="lp-slide-body">${wrapSayableBody(slide.body, slide.say)}</p>`;
        hasInteractiveBody = bodyHtml.includes("lp-say");
      }

      const isClosing = slide.subtitle === "כל הכבוד!";
      const orbHtml = hasInteractiveBody
        ? ""
        : `<button type="button" class="lp-slide-orb${isClosing ? " lp-slide-orb--celebrate" : ""}" aria-label="קישוט">
            <span class="lp-slide-orb-inner">
              <span class="lp-slide-orb-ring"></span>
              <span class="lp-slide-orb-core"></span>
            </span>
          </button>`;

      return `
        ${orbHtml}
        <div class="lp-slide-inner">
          <div class="lp-slide-head">
            <h2 class="lp-slide-title">${slide.title}</h2>
          </div>
          <div class="lp-slide-body-wrap">
            ${bodyHtml}
          </div>
        </div>`;
    }

    function animateSlide(html, direction = 0) {
      const current = $(".lp-slide-inner", slideEl);

      const showNew = () => {
        slideEl.innerHTML = html;
        const inner = $(".lp-slide-inner", slideEl);
        if (!inner) return;
        if (direction > 0) inner.classList.add("from-next");
        if (direction < 0) inner.classList.add("from-prev");
        requestAnimationFrame(() => {
          requestAnimationFrame(() => inner.classList.add("is-visible"));
        });

        $$(".lp-game-btn", slideEl).forEach((btn) => {
          btn.addEventListener("click", () => launchLessonGame(lesson, btn.dataset.gameId, index));
        });
      };

      if (current?.classList.contains("is-visible")) {
        current.classList.add("is-exiting");
        if (direction > 0) current.classList.add("to-prev");
        if (direction < 0) current.classList.add("to-next");
        current.classList.remove("is-visible");
        setTimeout(showNew, 220);
        return;
      }

      showNew();
    }

    function renderDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = steps
        .map(
          (_, i) =>
            `<button type="button" class="lesson-player-dot${i === index ? " active" : ""}" data-i="${i}" aria-label="שקופית ${i + 1}"></button>`
        )
        .join("");
      $$(".lesson-player-dot", dotsWrap).forEach((dot) => {
        dot.addEventListener("click", () => goTo(Number(dot.dataset.i)));
      });
    }

    function updateNav() {
      const total = steps.length;
      if (progressEl) progressEl.textContent = `${index + 1} / ${total}`;
      const atStart = index === 0;
      const atEnd = index >= total - 1;
      [prevBtn, prevMobile].forEach((b) => {
        if (b) b.disabled = atStart;
      });
      [nextBtn, nextMobile].forEach((b) => {
        if (b) b.disabled = atEnd;
      });
      $$(".lesson-player-dot", dotsWrap).forEach((dot, i) => dot.classList.toggle("active", i === index));
    }

    function renderStep(direction = 0) {
      const slide = steps[index];
      const html = slide.type === "games" ? renderGamesSlide(slide) : renderContentSlide(slide);
      animateSlide(html, direction);
      updateNav();
      if (index === steps.length - 1) markLessonLearned(lesson.id);
    }

    function goTo(i) {
      if (i < 0 || i >= steps.length) return;
      closeWordPopup();
      const direction = i > index ? 1 : i < index ? -1 : 0;
      index = i;
      renderStep(direction);
    }

    function open(lessonId) {
      lesson = LESSON_CATALOG[lessonId];
      if (!lesson) return;
      steps = lesson.slides || [];
      index = 0;
      renderDots();
      renderStep();
      player.classList.remove("hidden");
      player.setAttribute("aria-hidden", "false");
      setExpanded(false);
      document.body.style.overflow = "hidden";
    }

    function close() {
      closeWordPopup();
      player.classList.add("hidden");
      player.setAttribute("aria-hidden", "true");
      setExpanded(false);
      document.body.style.overflow = "";
      lesson = null;
    }

    function step(delta) {
      goTo(index + delta);
    }

    $$(".js-lesson-open").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        open(btn.dataset.lesson);
      });
    });

    closeBtn?.addEventListener("click", close);
    expandBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      setExpanded(!player.classList.contains("is-expanded"));
    });
    backdrop?.addEventListener("click", close);
    $(".lesson-player-shell", player)?.addEventListener("click", (e) => e.stopPropagation());
    prevBtn?.addEventListener("click", () => step(-1));
    nextBtn?.addEventListener("click", () => step(1));
    prevMobile?.addEventListener("click", () => step(-1));
    nextMobile?.addEventListener("click", () => step(1));

    document.addEventListener("keydown", (e) => {
      if (player.classList.contains("hidden")) return;
      if (e.key === "Escape") {
        if (closeWordPopup()) return;
        close();
      }
      if (e.key === "ArrowLeft") step(1);
      if (e.key === "ArrowRight") step(-1);
    });

    function tryRestoreLessonFromGame() {
      const raw = sessionStorage.getItem(LESSON_RESTORE_KEY);
      if (!raw) return;
      sessionStorage.removeItem(LESSON_RESTORE_KEY);
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        return;
      }
      if (!data?.lessonId || !LESSON_CATALOG[data.lessonId]) return;
      open(data.lessonId);
      if (data.slideIndex === "end") {
        goTo(steps.length - 1);
        return;
      }
      const slideIndex = Number(data.slideIndex);
      if (Number.isFinite(slideIndex) && slideIndex > 0) {
        goTo(slideIndex);
      }
    }

    tryRestoreLessonFromGame();
  }

  function syncLessonCardTitles() {
    $$(".svc-lesson-card[data-lesson]").forEach((card) => {
      const lesson = LESSON_CATALOG[card.dataset.lesson];
      if (!lesson) return;
      const nameEl = $(".svc-lesson-name", card);
      const partEl = $(".svc-lesson-part", card);
      if (nameEl) nameEl.textContent = lesson.nameMain || lesson.name;
      if (partEl) partEl.textContent = lesson.namePart || "";
    });
  }

  function init() {
    syncLessonCardTitles();
    bindLessonFilters();
    bindLessonInfoModal();
    bindLessonPlayer();
    applyLearnedBadges();
    tryOpenSharedLesson();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.ReadyLessons = { catalog: LESSON_CATALOG, subjectLabels: SUBJECT_LABELS };
})();
