/* Ready lessons — catalog, filters, player, minimal cards */

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const SUBJECT_LABELS = { english: "אנגלית", math: "חשבון", lifeskills: "כישורי חיים", health: "נפלאות הבריאה", body: "גוף האדם" };
  const SUBJECT_LABELS_EN = { english: "English", math: "Math", lifeskills: "Life Skills", health: "Health Wonders", body: "Human Body" };
  const ACTIVE_SUBJECTS = ["english", "lifeskills", "health", "body"];
  const LESSON_SHARE_PATH = "/services/ready-lessons.html";
  const LP_SPEAKER_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 5V4L8 9H4Z"/><path d="M16.2 8.8a5 5 0 0 1 0 6.4"/><path d="M18.8 6.2a9 9 0 0 1 0 11.6"/></svg>`;

  function curLang() {
    return window.I18n?.lang === "en" ? "en" : "he";
  }

  function subjectLabel(subject) {
    return (curLang() === "en" ? SUBJECT_LABELS_EN[subject] : SUBJECT_LABELS[subject]) || subject;
  }

  const GRADE_GROUP_LABELS = {
    all: { he: "הכל", en: "All" },
    ag: { he: "א–ג", en: "Grades 1–3" },
    dv: { he: "ד–ו", en: "Grades 4–6" },
    zh: { he: "ז–ח", en: "Grades 7–8" },
  };

  function gradeGroupLabel(code) {
    return GRADE_GROUP_LABELS[code]?.[curLang()] || GRADE_GROUP_LABELS.all[curLang()];
  }

  function formatGradeLabel(label) {
    if (curLang() !== "en") return label;
    return label === "כל הכיתות" ? "All grades" : label;
  }

  function formatDuration(duration) {
    if (curLang() !== "en") return duration;
    const m = String(duration).match(/(\d+)/);
    return m ? `${m[1]} min` : duration;
  }

  // Merges a lesson's English overrides (lesson.en) on top of its Hebrew
  // source when the UI is in English — text fields only, ids/config as-is.
  function localizeLesson(lesson) {
    if (!lesson) return lesson;
    if (curLang() !== "en" || !lesson.en) return lesson;
    return { ...lesson, ...lesson.en, id: lesson.id };
  }

  const STANDARD_LESSON_GAMES = [
    { id: "vocabulary-duel", label: "טריוויה", labelEn: "Trivia", icon: "⚔️" },
    { id: "tower-stack", label: "מגדל מילים", labelEn: "Word Tower", icon: "🗼" },
    { id: "hangman", label: "איש תלוי", labelEn: "Hangman", icon: "🎯" },
    { id: "spot-diff", label: "מצא הבדלים", labelEn: "Spot the Differences", icon: "🔍" },
  ];

  // Picture vocabulary shared by the vocabulary lesson's picture slides
  // (both languages) and its game vocab list.
  const VOCAB_PICTURES = {
    cat: { en: "cat", he: "חתול" },
    dog: { en: "dog", he: "כלב" },
    fish: { en: "fish", he: "דג" },
    bird: { en: "bird", he: "ציפור" },
    apple: { en: "apple", he: "תפוח" },
    banana: { en: "banana", he: "בננה" },
    icecream: { en: "ice cream", he: "גלידה" },
    book: { en: "book", he: "ספר" },
    pencil: { en: "pencil", he: "עיפרון" },
    cup: { en: "cup", he: "כוס" },
    clock: { en: "clock", he: "שעון" },
    ball: { en: "ball", he: "כדור" },
    house: { en: "house", he: "בית" },
    car: { en: "car", he: "מכונית" },
    umbrella: { en: "umbrella", he: "מטרייה" },
    tree: { en: "tree", he: "עץ" },
    flower: { en: "flower", he: "פרח" },
    sun: { en: "sun", he: "שמש" },
    moon: { en: "moon", he: "ירח" },
    star: { en: "star", he: "כוכב" },
  };

  function vocabPictures(...ids) {
    return ids.map((id) => ({ ...VOCAB_PICTURES[id], img: `/images/english/vocab/${id}.svg` }));
  }

  // Ball-and-box scenes for the prepositions lesson (the same pictures as its
  // "Where is the ball?" exercise on the Learn English page).
  const PREPOSITION_PICTURES = [
    { en: "in", he: "בתוך", img: "/images/english/vocab/prep-in.svg" },
    { en: "on", he: "על", img: "/images/english/vocab/prep-on.svg" },
    { en: "under", he: "מתחת", img: "/images/english/vocab/prep-under.svg" },
    { en: "next to", he: "ליד", img: "/images/english/vocab/prep-next-to.svg" },
    { en: "between", he: "בין", img: "/images/english/vocab/prep-between.svg" },
  ];

  const LESSON_CATALOG = {
    volcano: {
      id: "volcano",
      name: "הר געש",
      nameMain: "הר געש",
      namePart: "",
      subject: "health",
      grades: ["ag", "dv", "zh"],
      topic: "volcano",
      gradeLabel: "כל הכיתות",
      duration: "20 דק'",
      summary: "מכירים הר געש מקרוב — איך הוא בנוי, מה קורה בפנים כדור הארץ, ולמה הוא מתפרץ. עם משחק בסוף.",
      vocab: [
        { en: "הר געש", he: "הר מיוחד שיכול לפלוט אבנים לוהטות, עשן ולבה מתוך פנים כדור הארץ" },
        { en: "לבה", he: "סלע נוזלי ולוהט שיוצא מהר הגעש בזמן התפרצות" },
        { en: "עשן", he: "ענן כבד שעולה מהלוע אל השמיים בזמן התפרצות" },
        { en: "מאגמה", he: "סלע נוזלי וחם מאוד שנמצא עמוק מתחת לאדמה" },
        { en: "לוע", he: "הפתח שבראש הר הגעש שממנו יוצאת הלבה" },
        { en: "התפרצות", he: "הרגע שבו הר הגעש פולט לבה, עשן ואבנים" },
        { en: "אפר געשי", he: "אבק ופירורי סלע קטנים שנפלטים מהר הגעש" },
        { en: "הר געש פעיל", he: "הר געש שהתפרץ לאחרונה ועלול להתפרץ שוב" },
        { en: "הר געש רדום", he: "הר געש שלא התפרץ הרבה זמן אבל עדיין עלול להתעורר" },
        { en: "הר געש כבוי", he: "הר געש שלא צפוי להתפרץ שוב לעולם" },
        { en: "וולקנולוג", he: "מדען שחוקר הרי געש" },
        { en: "וולקנולוגים", he: "מדענים שחוקרים הרי געש" },
        { en: "קרום כדור הארץ", he: "השכבה החיצונית והמוצקה שעליה אנחנו חיים" },
      ],
      games: STANDARD_LESSON_GAMES,
      pdfSlides: [
        "/images/lessons/volcano/slide-1.png",
        "/images/lessons/volcano/slide-2.png",
        "/images/lessons/volcano/slide-3.png",
        "/images/lessons/volcano/slide-4.png",
        "/images/lessons/volcano/slide-5.png",
        "/images/lessons/volcano/slide-6.png",
        "/images/lessons/volcano/slide-7.png",
      ],
      slides: [
        {
          type: "content",
          title: "מה זה **הר געש**?",
          subtitle: "פתיחה",
          body: "**הר געש** הוא הר מיוחד שיכול לפלוט אבנים לוהטות, עשן ולבה מתוך פנים כדור הארץ.\n\nהיום נכיר איך הוא בנוי, מה קורה בפנים שלו, ולמה הוא **מתפרץ**.",
        },
        {
          type: "content",
          title: "**מילים חשובות**",
          subtitle: "אוצר מושגים",
          body: "לוע — הפתח שבראש הר הגעש שממנו יוצאת הלבה.\n\nמאגמה — סלע נוזלי וחם מאוד שנמצא עמוק מתחת לאדמה. כשהיא יוצאת החוצה קוראים לה לבה.\n\nהתפרצות — הרגע שבו הר הגעש פולט לבה, עשן ואבנים.",
        },
        {
          type: "content",
          title: "איך הר געש **מתפרץ**?",
          subtitle: "בפנים ההר",
          body: "עמוק מתחת לאדמה יש **מאגמה** — סלע נוזלי וחם מאוד.\n\nכשהלחץ בפנים ההר גדל, המאגמה עולה דרך הלוע שבראש ההר.\n\nכשהיא יוצאת החוצה היא נקראת **לבה**, ויחד איתה יוצאים גם עשן ואפר געשי.",
        },
        {
          type: "content",
          title: "צפו: **הר געש** בפעולה",
          subtitle: "סרטון קצר",
          body: "סרטון קצר (3 דקות) שמראה איך **מאגמה** עולה, יוצאת מההר כ**לבה**, ובונה את צורת ההר.",
          video: "https://www.youtube.com/watch?v=K7Oq9_DU1Mc",
          videoTitle: "All About Volcanoes — SciShow Kids",
        },
        {
          type: "content",
          title: "כמה חם **הלבה**?",
          subtitle: "עובדה מרתקת",
          body: "לבה יכולה להגיע לחום של יותר מ-**1,000 מעלות צלזיוס** — חם מספיק כדי להתיך מתכת!\n\nלמרות שהיא נראית איטית, לבה יכולה לזרום במהירות של עשרות קילומטרים בשעה במורד ההר.\n\nכשהיא מתקררת, הלבה הופכת לאט לאט לסלע קשה חדש.",
        },
        {
          type: "content",
          title: "**פעיל**, רדום או כבוי?",
          subtitle: "סוגי הרי געש",
          body: "**הר געש פעיל** הוא הר שהתפרץ לאחרונה או עלול להתפרץ שוב בקרוב.\n\n**הר געש רדום** לא התפרץ הרבה מאוד זמן, אבל עדיין יכול להתעורר יום אחד.\n\n**הר געש כבוי** כבר לא צפוי להתפרץ שוב לעולם.",
        },
        {
          type: "content",
          title: "**מה יוצא** מהר געש?",
          subtitle: "שאלה ותשובה",
          body: "**מה יוצא** מהר געש כשהוא **מתפרץ**?\n\nלבה — סלע נוזלי ולוהט שזורם במורד ההר.\n\nעשן — ענן כבד שעולה מהלוע אל השמיים.\n\nאפר געשי — אבק ופירורי סלע קטנטנים שיכולים לנסוע רחוק מאוד ברוח.",
        },
        {
          type: "content",
          title: "הרי געש **בעולם האמיתי**",
          subtitle: "חיבור לחיים",
          body: "יש **אלפי הרי געש** בעולם — חלקם על היבשה וחלקם עמוק בים.\n\nהר הגעש קילאווהה שבהוואי הוא אחד הפעילים ביותר בעולם, וממשיך להתפרץ במשך שנים רבות.\n\nמדענים שנקראים **וולקנולוגים** חוקרים הרי געש כדי לדעת מתי הם עלולים להתפרץ, ולשמור על אנשים שגרים בקרבתם בבטחה.",
        },
        {
          type: "content",
          title: "דיון כיתתי",
          subtitle: "שאלות על השיעור",
          body: "אם הייתם **וולקנולוגים** וגיליתם שהר געש עלול להתפרץ בקרוב, מה הייתם עושים כדי לשמור על התושבים בסביבה?\n\nמה מכל מה שלמדנו על הרי געש הפתיע אתכם הכי הרבה?",
        },
        { type: "games", title: "זמן לתרגל!", subtitle: "משחקים" },
        {
          type: "content",
          title: "סוף השיעור",
          subtitle: "כל הכבוד!",
          body: "תודה על ההשתתפות!",
        },
      ],

      en: {
        name: "Volcano",
        nameMain: "Volcano",
        namePart: "",
        summary: "Get to know volcanoes up close — how they're built, what happens inside the Earth, and why they erupt. With a game at the end.",
        vocab: [
          { en: "Volcano", he: "A special mountain that can shoot out hot rocks, smoke, and lava from deep inside the Earth." },
          { en: "Lava", he: "Hot liquid rock that flows out of a volcano during an eruption." },
          { en: "Smoke", he: "A thick cloud that rises from the crater into the sky during an eruption." },
          { en: "Magma", he: "Very hot liquid rock found deep underground." },
          { en: "Crater", he: "The opening at the top of a volcano that lava flows out of." },
          { en: "Eruption", he: "The moment when a volcano blasts out lava, smoke, and rocks." },
          { en: "Volcanic ash", he: "Tiny bits of dust and rock that are thrown out of a volcano." },
          { en: "Active volcano", he: "A volcano that has erupted recently and could erupt again soon." },
          { en: "Dormant volcano", he: "A volcano that hasn't erupted in a long time but could still wake up one day." },
          { en: "Extinct volcano", he: "A volcano that is not expected to ever erupt again." },
          { en: "Volcanologist", he: "A scientist who studies volcanoes." },
          { en: "Volcanologists", he: "Scientists who study volcanoes." },
          { en: "Earth's crust", he: "The solid outer layer of the Earth that we live on." },
        ],
        slides: [
          {
            type: "content",
            title: "What is a **Volcano**?",
            subtitle: "Opening",
            body: "A **volcano** is a special mountain that can shoot out hot rocks, smoke, and lava from deep inside the Earth.\n\nToday we'll learn how it's built, what happens inside it, and why it **erupts**.",
          },
          {
            type: "content",
            title: "**Important words**",
            subtitle: "Vocabulary",
            body: "Crater — the opening at the top of a volcano that lava flows out of.\n\nMagma — very hot liquid rock found deep underground. When it comes out, it's called lava.\n\nEruption — the moment when a volcano blasts out lava, smoke, and rocks.",
          },
          {
            type: "content",
            title: "How does a volcano **erupt**?",
            subtitle: "Inside the mountain",
            body: "Deep underground there is **magma** — very hot liquid rock.\n\nWhen the pressure inside the mountain builds up, the magma rises through the crater at the top.\n\nWhen it comes out, it's called **lava**, and smoke and volcanic ash come out along with it.",
          },
          {
            type: "content",
            title: "Watch: **Volcano** in action",
            subtitle: "Short video",
            body: "A short video (3 minutes) showing how **magma** rises, comes out of the mountain as **lava**, and builds the shape of the mountain.",
            video: "https://www.youtube.com/watch?v=K7Oq9_DU1Mc",
            videoTitle: "All About Volcanoes — SciShow Kids",
          },
          {
            type: "content",
            title: "How hot is **lava**?",
            subtitle: "Fun fact",
            body: "Lava can reach temperatures of more than **1,000 degrees Celsius** — hot enough to melt metal!\n\nEven though it looks slow, lava can flow down a mountain at dozens of kilometers per hour.\n\nAs it cools, lava slowly turns into new, hard rock.",
          },
          {
            type: "content",
            title: "**Active**, dormant, or extinct?",
            subtitle: "Types of volcanoes",
            body: "An **active volcano** has erupted recently or could erupt again soon.\n\nA **dormant volcano** hasn't erupted in a very long time, but it could still wake up one day.\n\nAn **extinct volcano** is not expected to ever erupt again.",
          },
          {
            type: "content",
            title: "**What comes out** of a volcano?",
            subtitle: "Question & answer",
            body: "**What comes out** of a volcano when it **erupts**?\n\nLava — hot liquid rock that flows down the mountain.\n\nSmoke — a thick cloud that rises from the crater into the sky.\n\nVolcanic ash — tiny bits of dust and rock that can travel very far in the wind.",
          },
          {
            type: "content",
            title: "Volcanoes **around the world**",
            subtitle: "Real-life connection",
            body: "There are **thousands of volcanoes** in the world — some on land and some deep in the ocean.\n\nKilauea, in Hawaii, is one of the most active volcanoes in the world, and has kept erupting for many years.\n\nScientists called **volcanologists** study volcanoes to know when they might erupt, and to keep nearby residents safe.",
          },
          {
            type: "content",
            title: "Class discussion",
            subtitle: "Questions about the lesson",
            body: "If you were **volcanologists** and discovered that a volcano might erupt soon, what would you do to keep nearby residents safe?\n\nWhat surprised you the most about everything we learned about volcanoes?",
          },
          { type: "games", title: "Time to practice!", subtitle: "Games" },
          {
            type: "content",
            title: "End of lesson",
            subtitle: "Well done!",
            body: "Thanks for participating!",
          },
        ],
      },
    },

    health: {
      id: "health",
      name: "גוף האדם - הלב",
      nameMain: "גוף האדם",
      namePart: "הלב",
      subject: "body",
      grades: ["ag", "dv", "zh"],
      topic: "health",
      gradeLabel: "כל הכיתות",
      duration: "25 דק'",
      summary: "מכירים את הלב מקרוב — איך הוא נראה, איך הוא עובד, ולמה הוא כל כך חשוב לגוף שלנו. עם משחק בסוף.",
      vocab: [
        { en: "לב", he: "האיבר שדופק ושואב דם לכל חלקי הגוף" },
        { en: "דופק", he: "הקצב שבו הלב פועם כל הזמן" },
        { en: "דם", he: "הנוזל שהלב שולח לכל הגוף — מביא חמצן ומזון לתאים" },
        { en: "עורקים", he: "צינורות שמעבירים דם מהלב לשאר הגוף" },
        { en: "ורידים", he: "צינורות שמחזירים את הדם בחזרה אל הלב" },
        { en: "חמצן", he: "גז שהדם נושא לכל התאים כדי שיהיה להם אנרגיה" },
        { en: "שריר הלב", he: "השריר החזק שמתכווץ ומרפה ובכך גורם ללב לפעום" },
        { en: "מחזור הדם", he: "המסלול שבו הדם עובר מהלב לגוף וחזרה" },
        { en: "דופק מהיר", he: "קצב לב מהיר — למשל אחרי ריצה או התרגשות" },
        { en: "מנוחה", he: "זמן שבו הלב פועם לאט ורגוע" },
        { en: "התעמלות", he: "פעילות גופנית שמחזקת את שריר הלב" },
        { en: "רופא לב", he: "רופא מומחה שבודק ושומר על בריאות הלב" },
      ],
      games: STANDARD_LESSON_GAMES,
      slides: [
        {
          type: "content",
          title: "מה זה **הלב**?",
          subtitle: "פתיחה",
          body: "הלב הוא **שריר קטן וחזק**, בערך בגודל אגרוף, שנמצא בחזה שלנו.\n\nהוא פועם בלי הפסקה, יום ולילה, לאורך כל החיים שלנו — ודואג לשלוח דם לכל הגוף.",
        },
        {
          type: "content",
          title: "**מילים חשובות**",
          subtitle: "אוצר מושגים",
          body: "לב — האיבר שדופק ושואב דם לכל הגוף.\n\nדופק — הקצב שבו הלב פועם.\n\nעורקים — צינורות שמעבירים דם מהלב לגוף.\n\nורידים — צינורות שמחזירים את הדם בחזרה אל הלב.",
        },
        {
          type: "content",
          title: "איך **הלב** עובד?",
          subtitle: "בפנים הגוף",
          body: "בכל פעימה, ה**לב מתכווץ** ודוחף דם דרך ה**עורקים** לכל חלקי הגוף — עד לקצות האצבעות.\n\nהדם חוזר אל הלב דרך ה**ורידים**, ואז הכל מתחיל מחדש — שוב ושוב, כל היום.",
        },
        {
          type: "content",
          title: "למה **הלב** כל כך חשוב?",
          subtitle: "התפקיד של הלב",
          body: "הדם שהלב שולח נושא **חמצן** ומזון לכל תא בגוף.\n\nבלי הלב, שום איבר לא היה מקבל את מה שהוא צריך כדי לעבוד — לכן הלב הוא אחד האיברים הכי חשובים שלנו.",
        },
        {
          type: "content",
          title: "מתי **הדופק** משתנה?",
          subtitle: "מהיר ואיטי",
          body: "כשאנחנו **רצים, מתרגשים או משחקים** — הלב פועם מהר יותר כדי לשלוח יותר דם לשרירים.\n\nכשאנחנו **נחים או ישנים** — הלב פועם לאט ורגוע, כי הגוף לא צריך אנרגיה רבה.",
        },
        {
          type: "content",
          title: "איך **מחזקים** את הלב?",
          subtitle: "הרגלים טובים",
          body: "**התעמלות** — ריצה, קפיצה ומשחק בחוץ מחזקות את שריר הלב.\n\n**שינה מספקת** — נותנת ללב לנוח ולהתחזק.\n\n**אכילת פרי וירקות ושתיית מים** — עוזרות ללב לעבוד טוב.",
        },
        {
          type: "content",
          title: "דיון כיתתי",
          subtitle: "שאלות על השיעור",
          body: "אילו פעילויות במהלך היום גורמות ל**דופק** שלכם להיות מהיר יותר?\n\nמה אתם יכולים להתחיל לעשות מהיום כדי לחזק את הלב שלכם?",
        },
        { type: "games", title: "זמן לתרגל!", subtitle: "משחקים" },
        {
          type: "content",
          title: "סוף השיעור",
          subtitle: "כל הכבוד!",
          body: "תודה על ההשתתפות!",
        },
      ],

      en: {
        name: "Human Body - The Heart",
        nameMain: "Human Body",
        namePart: "The Heart",
        summary: "Get to know the heart up close — what it looks like, how it works, and why it's so important to our body. With a game at the end.",
        vocab: [
          { en: "Heart", he: "The organ that beats and pumps blood to every part of the body." },
          { en: "Pulse", he: "The rhythm at which the heart keeps beating." },
          { en: "Blood", he: "The fluid the heart sends around the body — it carries oxygen and food to our cells." },
          { en: "Arteries", he: "Tubes that carry blood from the heart to the rest of the body." },
          { en: "Veins", he: "Tubes that carry blood back to the heart." },
          { en: "Oxygen", he: "A gas that blood carries to every cell so it has energy." },
          { en: "Heart muscle", he: "The strong muscle that squeezes and relaxes, making the heart beat." },
          { en: "Blood circulation", he: "The path blood takes from the heart to the body and back again." },
          { en: "Fast pulse", he: "A quick heartbeat — for example after running or getting excited." },
          { en: "Rest", he: "A time when the heart beats slowly and calmly." },
          { en: "Exercise", he: "Physical activity that strengthens the heart muscle." },
          { en: "Heart doctor", he: "A doctor who specializes in checking and protecting heart health." },
        ],
        slides: [
          {
            type: "content",
            title: "What is the **Heart**?",
            subtitle: "Opening",
            body: "The heart is a **small, powerful muscle**, about the size of a fist, that sits in our chest.\n\nIt beats without stopping, day and night, our whole life — sending blood to every part of the body.",
          },
          {
            type: "content",
            title: "**Important words**",
            subtitle: "Vocabulary",
            body: "Heart — the organ that beats and pumps blood around the body.\n\nPulse — the rhythm at which the heart beats.\n\nArteries — tubes that carry blood from the heart to the body.\n\nVeins — tubes that carry blood back to the heart.",
          },
          {
            type: "content",
            title: "How does the **Heart** work?",
            subtitle: "Inside the body",
            body: "With every beat, the **heart squeezes** and pushes blood through the **arteries** to every part of the body — all the way to our fingertips.\n\nThe blood returns to the heart through the **veins**, and then it all starts again — over and over, all day long.",
          },
          {
            type: "content",
            title: "Why is the **Heart** so important?",
            subtitle: "The heart's job",
            body: "The blood the heart sends carries **oxygen** and food to every cell in the body.\n\nWithout the heart, no organ would get what it needs to work — that's why the heart is one of our most important organs.",
          },
          {
            type: "content",
            title: "When does the **Pulse** change?",
            subtitle: "Fast and slow",
            body: "When we're **running, excited, or playing** — the heart beats faster to send more blood to the muscles.\n\nWhen we're **resting or sleeping** — the heart beats slowly and calmly, because the body doesn't need much energy.",
          },
          {
            type: "content",
            title: "How do you **strengthen** your heart?",
            subtitle: "Good habits",
            body: "**Exercise** — running, jumping, and playing outside strengthen the heart muscle.\n\n**Enough sleep** — lets the heart rest and grow stronger.\n\n**Eating fruit and vegetables and drinking water** — help the heart work well.",
          },
          {
            type: "content",
            title: "Class discussion",
            subtitle: "Questions about the lesson",
            body: "Which activities during your day make your **pulse** beat faster?\n\nWhat can you start doing today to strengthen your heart?",
          },
          { type: "games", title: "Time to practice!", subtitle: "Games" },
          {
            type: "content",
            title: "End of lesson",
            subtitle: "Well done!",
            body: "Thanks for participating!",
          },
        ],
      },
    },

    lungs: {
      id: "lungs",
      name: "גוף האדם - ריאות ונשימה",
      nameMain: "גוף האדם",
      namePart: "ריאות ונשימה",
      subject: "body",
      grades: ["ag", "dv", "zh"],
      topic: "lungs",
      gradeLabel: "כל הכיתות",
      duration: "25 דק'",
      summary: "מכירים את הריאות מקרוב — איך אנחנו נושמים, למה זה כל כך חשוב, ואיך שומרים על ריאות בריאות. עם משחק בסוף.",
      vocab: [
        { en: "ריאות", he: "שני איברים ספוגיים בחזה שעוזרים לנו לנשום" },
        { en: "נשימה", he: "התהליך שבו אנחנו שואפים אוויר פנימה ונושפים אותו החוצה" },
        { en: "שאיפה", he: "שאיבת אוויר פנימה אל הריאות" },
        { en: "נשיפה", he: "הוצאת אוויר מהריאות החוצה" },
        { en: "קנה הנשימה", he: "הצינור שדרכו האוויר עובר מהגרון אל הריאות" },
        { en: "חמצן", he: "גז באוויר שהגוף צריך כדי לייצר אנרגיה" },
        { en: "פחמן דו חמצני", he: "גז שהגוף פולט החוצה בנשיפה" },
        { en: "סרעפת", he: "שריר מתחת לריאות שעוזר לשאוף ולנשוף אוויר" },
        { en: "נשימה עמוקה", he: "שאיפה איטית ומלאה של אוויר שמרגיעה את הגוף" },
        { en: "ריאות בריאות", he: "ריאות שעובדות היטב ולא נפגעות מעשן או זיהום" },
      ],
      games: STANDARD_LESSON_GAMES,
      slides: [
        {
          type: "content",
          title: "מה זו **הריאה**?",
          subtitle: "פתיחה",
          body: "הריאות הן **שני איברים ספוגיים** גדולים שנמצאים בחזה שלנו, אחד מכל צד של הלב.\n\nהן מתמלאות ומתרוקנות מאוויר בכל נשימה שאנחנו לוקחים — יום ולילה, בלי הפסקה.",
        },
        {
          type: "content",
          title: "**מילים חשובות**",
          subtitle: "אוצר מושגים",
          body: "שאיפה — שאיבת אוויר פנימה אל הריאות.\n\nנשיפה — הוצאת אוויר מהריאות החוצה.\n\nקנה הנשימה — הצינור שדרכו האוויר עובר מהגרון אל הריאות.",
        },
        {
          type: "content",
          title: "איך **הנשימה** עובדת?",
          subtitle: "בפנים הגוף",
          body: "כשאנחנו שואפים, האוויר עובר דרך האף או הפה, יורד ב**קנה הנשימה**, ומגיע ל**ריאות**.\n\nהריאות לוקחות מהאוויר **חמצן** ומעבירות אותו לדם, ובתמורה פולטות **פחמן דו חמצני** שהגוף לא צריך.",
        },
        {
          type: "content",
          title: "למה **הנשימה** כל כך חשובה?",
          subtitle: "התפקיד של הריאות",
          body: "כל תא בגוף שלנו צריך **חמצן** כדי לעבוד ולייצר אנרגיה.\n\nבלי נשימה, הדם לא היה מקבל חמצן, והגוף לא היה יכול לתפקד — לכן אנחנו נושמים אוטומטית, גם בלי לחשוב על זה.",
        },
        {
          type: "content",
          title: "מתי **הנשימה** משתנה?",
          subtitle: "מהירה ואיטית",
          body: "כשאנחנו **רצים או מתאמצים** — הנשימה מהירה יותר, כדי להביא יותר חמצן לשרירים.\n\nכשאנחנו **נחים או נרגעים** — הנשימה איטית ועמוקה, וזה עוזר לגוף להירגע.",
        },
        {
          type: "content",
          title: "איך **מחזקים** את הריאות?",
          subtitle: "הרגלים טובים",
          body: "**פעילות גופנית** — ריצה, שחייה ומשחק בחוץ מחזקות את הריאות.\n\n**אוויר נקי** — הימנעות מעשן ומזיהום שומרת על ריאות בריאות.\n\n**נשימות עמוקות** — כמה נשימות עמוקות ביום עוזרות לריאות ולגוף להירגע.",
        },
        {
          type: "content",
          title: "דיון כיתתי",
          subtitle: "שאלות על השיעור",
          body: "שימו רגע יד על החזה ונשמו עמוק — מתי אתם שמים לב שה**נשימה** שלכם משתנה?\n\nמה אתם יכולים לעשות כדי לשמור על ריאות בריאות?",
        },
        { type: "games", title: "זמן לתרגל!", subtitle: "משחקים" },
        {
          type: "content",
          title: "סוף השיעור",
          subtitle: "כל הכבוד!",
          body: "תודה על ההשתתפות!",
        },
      ],

      en: {
        name: "Human Body - Lungs & Breathing",
        nameMain: "Human Body",
        namePart: "Lungs & Breathing",
        summary: "Get to know the lungs up close — how we breathe, why it matters so much, and how to keep our lungs healthy. With a game at the end.",
        vocab: [
          { en: "Lungs", he: "Two spongy organs in the chest that help us breathe." },
          { en: "Breathing", he: "The process of drawing air in and pushing it back out." },
          { en: "Inhale", he: "To draw air into the lungs." },
          { en: "Exhale", he: "To push air out of the lungs." },
          { en: "Windpipe", he: "The tube that carries air from the throat to the lungs." },
          { en: "Oxygen", he: "A gas in the air that the body needs to make energy." },
          { en: "Carbon dioxide", he: "A gas the body breathes out." },
          { en: "Diaphragm", he: "A muscle under the lungs that helps us inhale and exhale." },
          { en: "Deep breathing", he: "A slow, full breath of air that calms the body." },
          { en: "Healthy lungs", he: "Lungs that work well and aren't damaged by smoke or pollution." },
        ],
        slides: [
          {
            type: "content",
            title: "What is a **Lung**?",
            subtitle: "Opening",
            body: "The lungs are **two large, spongy organs** in our chest, one on each side of the heart.\n\nThey fill and empty with air every time we breathe — day and night, without stopping.",
          },
          {
            type: "content",
            title: "**Important words**",
            subtitle: "Vocabulary",
            body: "Inhale — to draw air into the lungs.\n\nExhale — to push air out of the lungs.\n\nWindpipe — the tube that carries air from the throat to the lungs.",
          },
          {
            type: "content",
            title: "How does **Breathing** work?",
            subtitle: "Inside the body",
            body: "When we inhale, air travels through the nose or mouth, down the **windpipe**, and into the **lungs**.\n\nThe lungs take **oxygen** from the air and pass it into the blood, and in exchange release **carbon dioxide** the body doesn't need.",
          },
          {
            type: "content",
            title: "Why is **Breathing** so important?",
            subtitle: "The lungs' job",
            body: "Every cell in our body needs **oxygen** to work and make energy.\n\nWithout breathing, the blood wouldn't get oxygen, and the body couldn't function — that's why we breathe automatically, without even thinking about it.",
          },
          {
            type: "content",
            title: "When does **Breathing** change?",
            subtitle: "Fast and slow",
            body: "When we're **running or working hard** — breathing speeds up, to bring more oxygen to the muscles.\n\nWhen we're **resting or relaxing** — breathing is slow and deep, and that helps the body relax.",
          },
          {
            type: "content",
            title: "How do you **strengthen** your lungs?",
            subtitle: "Good habits",
            body: "**Exercise** — running, swimming, and playing outside strengthen the lungs.\n\n**Clean air** — avoiding smoke and pollution keeps lungs healthy.\n\n**Deep breaths** — a few deep breaths a day help the lungs and the body relax.",
          },
          {
            type: "content",
            title: "Class discussion",
            subtitle: "Questions about the lesson",
            body: "Put a hand on your chest for a moment and breathe deeply — when do you notice your **breathing** change?\n\nWhat can you do to keep your lungs healthy?",
          },
          { type: "games", title: "Time to practice!", subtitle: "Games" },
          {
            type: "content",
            title: "End of lesson",
            subtitle: "Well done!",
            body: "Thanks for participating!",
          },
        ],
      },
    },

    brain: {
      id: "brain",
      name: "גוף האדם - המוח",
      nameMain: "גוף האדם",
      namePart: "המוח",
      subject: "body",
      grades: ["ag", "dv", "zh"],
      topic: "brain",
      gradeLabel: "כל הכיתות",
      duration: "25 דק'",
      summary: "מכירים את המוח מקרוב — איך הוא שולט בגוף, איך זיכרון ולמידה עובדים, ואיך שומרים עליו חד וממוקד. עם משחק בסוף.",
      vocab: [
        { en: "מוח", he: "האיבר שנמצא בתוך הגולגולת ושולט על כל מה שהגוף עושה וחושב" },
        { en: "גולגולת", he: "העצם הקשה שמגנה על המוח" },
        { en: "עצבים", he: "חוטים דקים שמעבירים מסרים בין המוח לשאר הגוף" },
        { en: "זיכרון", he: "היכולת של המוח לשמור ולהיזכר במידע" },
        { en: "חשיבה", he: "התהליך שבו המוח מעבד מידע ופותר בעיות" },
        { en: "רפלקס", he: "תגובה מהירה ואוטומטית של הגוף בלי לחשוב" },
        { en: "חוט השדרה", he: "כביש העצבים הראשי שמחבר את המוח לשאר הגוף" },
        { en: "חושים", he: "הדרכים שבהן אנחנו קולטים מידע מהעולם — ראייה, שמיעה ועוד" },
        { en: "ריכוז", he: "היכולת להתמקד במשימה אחת לאורך זמן" },
        { en: "שינה", he: "זמן מנוחה שבו המוח מעבד ומסדר את מה שלמדנו" },
      ],
      games: STANDARD_LESSON_GAMES,
      slides: [
        {
          type: "content",
          title: "מה זה **המוח**?",
          subtitle: "פתיחה",
          body: "המוח הוא האיבר שנמצא בתוך ה**גולגולת** שלנו, ומוגן על ידי עצם קשה.\n\nהוא ה\"מפקד\" של הגוף — שולט על כל תנועה, מחשבה והרגשה שיש לנו.",
        },
        {
          type: "content",
          title: "**מילים חשובות**",
          subtitle: "אוצר מושגים",
          body: "עצבים — חוטים דקים שמעבירים מסרים בין המוח לגוף.\n\nחוט השדרה — כביש העצבים הראשי שמחבר את המוח לשאר הגוף.\n\nזיכרון — היכולת של המוח לשמור ולהיזכר במידע.",
        },
        {
          type: "content",
          title: "איך **המוח** עובד?",
          subtitle: "בפנים הגוף",
          body: "המוח שולח ומקבל מסרים דרך **עצבים** ודרך ה**חוט שדרה** שיורד לכל הגוף.\n\nכשאנחנו נוגעים במשהו חם, ה**עצבים** שולחים מסר מהיר למוח, והמוח שולח בחזרה פקודה להזיז את היד — זה נקרא **רפלקס**.",
        },
        {
          type: "content",
          title: "למה **המוח** כל כך חשוב?",
          subtitle: "התפקיד של המוח",
          body: "המוח שולט על הנשימה, הדופק, התנועה, הדיבור, הזיכרון וגם על הרגשות שלנו.\n\nכל **חוש** שיש לנו — ראייה, שמיעה, ריח, טעם ומגע — עובר דרך המוח כדי שנבין מה קורה סביבנו.",
        },
        {
          type: "content",
          title: "מתי **המוח** עובד הכי טוב?",
          subtitle: "ער ועייף",
          body: "כשאנחנו **ערים ורעננים** — קל יותר להתרכז וללמוד דברים חדשים.\n\nכשאנחנו **עייפים** — קשה יותר להתרכז, ולכן ה**שינה** כל כך חשובה למוח.",
        },
        {
          type: "content",
          title: "איך **מחזקים** את המוח?",
          subtitle: "הרגלים טובים",
          body: "**קריאה ולמידה** — מאתגרות את המוח ומחזקות אותו.\n\n**שינה מספקת** — נותנת למוח זמן לעבד ולסדר את מה שלמדנו.\n\n**אכילה נכונה ושתיית מים** — עוזרות למוח לעבוד בריכוז.",
        },
        {
          type: "content",
          title: "דיון כיתתי",
          subtitle: "שאלות על השיעור",
          body: "מתי אתם מרגישים שה**מוח** שלכם עובד הכי טוב, ומתי הכי קשה לכם להתרכז?\n\nמה אתם עושים כדי לתת למוח שלכם לנוח ולהתחזק?",
        },
        { type: "games", title: "זמן לתרגל!", subtitle: "משחקים" },
        {
          type: "content",
          title: "סוף השיעור",
          subtitle: "כל הכבוד!",
          body: "תודה על ההשתתפות!",
        },
      ],

      en: {
        name: "Human Body - The Brain",
        nameMain: "Human Body",
        namePart: "The Brain",
        summary: "Get to know the brain up close — how it controls the body, how memory and learning work, and how to keep it sharp and focused. With a game at the end.",
        vocab: [
          { en: "Brain", he: "The organ inside the skull that controls everything the body does and thinks." },
          { en: "Skull", he: "The hard bone that protects the brain." },
          { en: "Nerves", he: "Thin wires that carry messages between the brain and the rest of the body." },
          { en: "Memory", he: "The brain's ability to store and recall information." },
          { en: "Thinking", he: "The process by which the brain processes information and solves problems." },
          { en: "Reflex", he: "A fast, automatic response of the body without thinking." },
          { en: "Spinal cord", he: "The main nerve highway that connects the brain to the rest of the body." },
          { en: "Senses", he: "The ways we take in information from the world — sight, hearing, and more." },
          { en: "Focus", he: "The ability to concentrate on one task for a period of time." },
          { en: "Sleep", he: "A time of rest when the brain processes and organizes what we've learned." },
        ],
        slides: [
          {
            type: "content",
            title: "What is the **Brain**?",
            subtitle: "Opening",
            body: "The brain is the organ inside our **skull**, protected by hard bone.\n\nIt's the body's \"commander\" — controlling every movement, thought, and feeling we have.",
          },
          {
            type: "content",
            title: "**Important words**",
            subtitle: "Vocabulary",
            body: "Nerves — thin wires that carry messages between the brain and the body.\n\nSpinal cord — the main nerve highway that connects the brain to the rest of the body.\n\nMemory — the brain's ability to store and recall information.",
          },
          {
            type: "content",
            title: "How does the **Brain** work?",
            subtitle: "Inside the body",
            body: "The brain sends and receives messages through **nerves** and through the **spinal cord**, which runs down through the whole body.\n\nWhen we touch something hot, the **nerves** send a fast message to the brain, and the brain sends back an order to move the hand — this is called a **reflex**.",
          },
          {
            type: "content",
            title: "Why is the **Brain** so important?",
            subtitle: "The brain's job",
            body: "The brain controls breathing, heartbeat, movement, speech, memory, and even our feelings.\n\nEvery **sense** we have — sight, hearing, smell, taste, and touch — goes through the brain so we can understand what's happening around us.",
          },
          {
            type: "content",
            title: "When does the **Brain** work best?",
            subtitle: "Awake and tired",
            body: "When we're **awake and rested** — it's easier to focus and learn new things.\n\nWhen we're **tired** — it's harder to concentrate, which is why **sleep** is so important for the brain.",
          },
          {
            type: "content",
            title: "How do you **strengthen** your brain?",
            subtitle: "Good habits",
            body: "**Reading and learning** — challenge the brain and strengthen it.\n\n**Enough sleep** — gives the brain time to process and organize what we've learned.\n\n**Eating well and drinking water** — help the brain work with focus.",
          },
          {
            type: "content",
            title: "Class discussion",
            subtitle: "Questions about the lesson",
            body: "When do you feel your **brain** working best, and when is it hardest for you to focus?\n\nWhat do you do to let your brain rest and grow stronger?",
          },
          { type: "games", title: "Time to practice!", subtitle: "Games" },
          {
            type: "content",
            title: "End of lesson",
            subtitle: "Well done!",
            body: "Thanks for participating!",
          },
        ],
      },
    },

    skeleton: {
      id: "skeleton",
      name: "גוף האדם - שרירים ועצמות",
      nameMain: "גוף האדם",
      namePart: "שרירים ועצמות",
      subject: "body",
      grades: ["ag", "dv", "zh"],
      topic: "skeleton",
      gradeLabel: "כל הכיתות",
      duration: "25 דק'",
      summary: "מכירים את השלד והשרירים מקרוב — איך הם נותנים לגוף צורה ותנועה, ואיך שומרים עליהם חזקים. עם משחק בסוף.",
      vocab: [
        { en: "שלד", he: "כל העצמות בגוף ביחד, שנותנות לו צורה ותמיכה" },
        { en: "עצם", he: "חלק קשיח בגוף שבונה את השלד" },
        { en: "שריר", he: "רקמה בגוף שמתכווצת ומרפה ומאפשרת תנועה" },
        { en: "מפרק", he: "המקום שבו שתי עצמות נפגשות ומאפשרות תנועה" },
        { en: "גידים", he: "רצועות שמחברות שרירים לעצמות" },
        { en: "עמוד שדרה", he: "שורת העצמות באמצע הגב שתומכת בגוף" },
        { en: "כיווץ שריר", he: "כאשר השריר מתקצר ומייצר תנועה" },
        { en: "גמישות", he: "היכולת של הגוף לזוז בקלות ובטווח תנועה רחב" },
        { en: "שבר", he: "סדק או שבירה בעצם" },
        { en: "סידן", he: "חומר מזין שמחזק את העצמות" },
      ],
      games: STANDARD_LESSON_GAMES,
      slides: [
        {
          type: "content",
          title: "מה זה **השלד**?",
          subtitle: "פתיחה",
          body: "השלד הוא כל ה**עצמות** בגוף שלנו ביחד — יש לנו מעל 200 עצמות שנותנות לגוף צורה, תמיכה וחוזק.\n\nבלי שלד, הגוף שלנו לא היה יכול לעמוד או לזוז.",
        },
        {
          type: "content",
          title: "**מילים חשובות**",
          subtitle: "אוצר מושגים",
          body: "עצם — חלק קשיח שבונה את השלד.\n\nמפרק — המקום שבו שתי עצמות נפגשות ומאפשרות תנועה.\n\nשריר — רקמה שמתכווצת ומרפה ומאפשרת לנו לזוז.",
        },
        {
          type: "content",
          title: "איך **השרירים והעצמות** עובדים ביחד?",
          subtitle: "בפנים הגוף",
          body: "**שרירים** מחוברים לעצמות באמצעות **גידים**.\n\nכשהשריר **מתכווץ**, הוא מושך את העצם ומזיז אותה — כך אנחנו הולכים, קופצים ומרימים דברים.",
        },
        {
          type: "content",
          title: "למה **השלד והשרירים** כל כך חשובים?",
          subtitle: "התפקיד שלהם",
          body: "השלד שומר על צורת הגוף ומגן על איברים חשובים — למשל הגולגולת מגנה על המוח.\n\nהשרירים מאפשרים לנו לזוז, לרוץ, לדבר ואפילו לחייך — כמעט כל תנועה בגוף דורשת שריר.",
        },
        {
          type: "content",
          title: "מה קורה כשעצם **נשברת**?",
          subtitle: "בריאה או שבורה",
          body: "לפעמים, אחרי מכה חזקה, עצם יכולה לעבור **שבר** — סדק או שבירה.\n\nהגוף שלנו מסוגל לרפא עצמות שבורות לאט לאט, אבל צריך זמן ולפעמים גם גבס שעוזר לעצם להישאר במקום עד שהיא מחלימה.",
        },
        {
          type: "content",
          title: "איך **מחזקים** שרירים ועצמות?",
          subtitle: "הרגלים טובים",
          body: "**תזונה עשירה בסידן** — כמו חלב וגבינות, עוזרת לעצמות להיות חזקות.\n\n**פעילות גופנית** — ריצה, טיפוס וקפיצה מחזקות שרירים ועצמות.\n\n**יציבה נכונה** — ישיבה ועמידה זקופה שומרות על עמוד השדרה בריא.",
        },
        {
          type: "content",
          title: "דיון כיתתי",
          subtitle: "שאלות על השיעור",
          body: "אילו פעילויות גופניות אתם עושים שמחזקות **שרירים** ו**עצמות**?\n\nמה חשוב לעשות כשחבר נפגע ואתם חושבים שהוא עבר **שבר**?",
        },
        { type: "games", title: "זמן לתרגל!", subtitle: "משחקים" },
        {
          type: "content",
          title: "סוף השיעור",
          subtitle: "כל הכבוד!",
          body: "תודה על ההשתתפות!",
        },
      ],

      en: {
        name: "Human Body - Muscles & Bones",
        nameMain: "Human Body",
        namePart: "Muscles & Bones",
        summary: "Get to know the skeleton and muscles up close — how they give the body shape and movement, and how to keep them strong. With a game at the end.",
        vocab: [
          { en: "Skeleton", he: "All the bones in the body together, which give it shape and support." },
          { en: "Bone", he: "A hard part of the body that builds the skeleton." },
          { en: "Muscle", he: "Tissue in the body that squeezes and relaxes, allowing movement." },
          { en: "Joint", he: "The place where two bones meet and allow movement." },
          { en: "Tendons", he: "Bands that connect muscles to bones." },
          { en: "Spine", he: "The row of bones down the middle of the back that supports the body." },
          { en: "Muscle contraction", he: "When a muscle shortens and creates movement." },
          { en: "Flexibility", he: "The body's ability to move easily through a wide range of motion." },
          { en: "Fracture", he: "A crack or break in a bone." },
          { en: "Calcium", he: "A nutrient that strengthens bones." },
        ],
        slides: [
          {
            type: "content",
            title: "What is the **Skeleton**?",
            subtitle: "Opening",
            body: "The skeleton is all the **bones** in our body together — we have more than 200 bones that give the body shape, support, and strength.\n\nWithout a skeleton, our body couldn't stand or move.",
          },
          {
            type: "content",
            title: "**Important words**",
            subtitle: "Vocabulary",
            body: "Bone — a hard part that builds the skeleton.\n\nJoint — the place where two bones meet and allow movement.\n\nMuscle — tissue that squeezes and relaxes, letting us move.",
          },
          {
            type: "content",
            title: "How do **Muscles and Bones** work together?",
            subtitle: "Inside the body",
            body: "**Muscles** are connected to bones by **tendons**.\n\nWhen a muscle **contracts**, it pulls the bone and moves it — that's how we walk, jump, and lift things.",
          },
          {
            type: "content",
            title: "Why are the **Skeleton and Muscles** so important?",
            subtitle: "Their job",
            body: "The skeleton keeps the body's shape and protects important organs — for example, the skull protects the brain.\n\nMuscles let us move, run, talk, and even smile — almost every movement in the body needs a muscle.",
          },
          {
            type: "content",
            title: "What happens when a bone **breaks**?",
            subtitle: "Healthy or broken",
            body: "Sometimes, after a hard knock, a bone can get a **fracture** — a crack or break.\n\nOur body can heal broken bones slowly over time, but it takes time, and sometimes a cast helps hold the bone in place until it heals.",
          },
          {
            type: "content",
            title: "How do you **strengthen** muscles and bones?",
            subtitle: "Good habits",
            body: "**Foods rich in calcium** — like milk and cheese, help bones grow strong.\n\n**Exercise** — running, climbing, and jumping strengthen muscles and bones.\n\n**Good posture** — sitting and standing up straight keeps the spine healthy.",
          },
          {
            type: "content",
            title: "Class discussion",
            subtitle: "Questions about the lesson",
            body: "What physical activities do you do that strengthen your **muscles** and **bones**?\n\nWhat's important to do when a friend is hurt and you think they might have a **fracture**?",
          },
          { type: "games", title: "Time to practice!", subtitle: "Games" },
          {
            type: "content",
            title: "End of lesson",
            subtitle: "Well done!",
            body: "Thanks for participating!",
          },
        ],
      },
    },

    digestion: {
      id: "digestion",
      name: "גוף האדם - מערכת העיכול",
      nameMain: "גוף האדם",
      namePart: "מערכת העיכול",
      subject: "body",
      grades: ["ag", "dv", "zh"],
      topic: "digestion",
      gradeLabel: "כל הכיתות",
      duration: "25 דק'",
      summary: "מכירים את מערכת העיכול מקרוב — מה קורה לאוכל מהרגע שנכנס לפה ועד הסוף, ואיך שומרים עליה בריאה. עם משחק בסוף.",
      vocab: [
        { en: "מערכת עיכול", he: "שרשרת האיברים שמעבדת את האוכל שאנחנו אוכלים" },
        { en: "קיבה", he: "איבר בבטן שמפרק את האוכל בעזרת חומצות" },
        { en: "ושט", he: "הצינור שמעביר את האוכל מהפה אל הקיבה" },
        { en: "מעיים", he: "צינורות ארוכים שממשיכים לפרק את האוכל וסופגים ממנו חומרים מזינים" },
        { en: "רוק", he: "נוזל בפה שמתחיל לפרק את האוכל כבר בלעיסה" },
        { en: "עיכול", he: "התהליך שבו הגוף מפרק אוכל לחומרים שהוא יכול להשתמש בהם" },
        { en: "חומרים מזינים", he: "חומרים באוכל שהגוף צריך כדי לגדול ולתפקד" },
        { en: "כבד", he: "איבר שעוזר לעכל שומן ומנקה רעלים מהדם" },
        { en: "מעי גס", he: "החלק האחרון של המעיים, שסופג מים ומכין את הפסולת ליציאה" },
        { en: "תזונה מאוזנת", he: "אכילה של מגוון מזונות בריאים בכמות מתאימה" },
      ],
      games: STANDARD_LESSON_GAMES,
      slides: [
        {
          type: "content",
          title: "מה זו **מערכת העיכול**?",
          subtitle: "פתיחה",
          body: "מערכת העיכול היא שרשרת ארוכה של איברים שהופכת את האוכל שאנחנו אוכלים לאנרגיה ולחומרים שהגוף צריך.\n\nהיא מתחילה בפה שלנו וממשיכה דרך הגוף כולו.",
        },
        {
          type: "content",
          title: "**מילים חשובות**",
          subtitle: "אוצר מושגים",
          body: "קיבה — איבר בבטן שמפרק את האוכל בעזרת חומצות.\n\nמעיים — צינורות ארוכים שממשיכים לפרק אוכל וסופגים ממנו חומרים מזינים.\n\nושט — הצינור שמעביר את האוכל מהפה אל הקיבה.",
        },
        {
          type: "content",
          title: "איך **העיכול** עובד?",
          subtitle: "בפנים הגוף",
          body: "כשאנחנו לועסים אוכל, ה**רוק** מתחיל לפרק אותו, והוא יורד דרך ה**ושט** אל ה**קיבה**.\n\nבקיבה האוכל מתערבב עם חומצות וממשיך למעיים, שם הגוף סופג ממנו **חומרים מזינים** לדם.",
        },
        {
          type: "content",
          title: "למה **העיכול** כל כך חשוב?",
          subtitle: "התפקיד של מערכת העיכול",
          body: "העיכול הופך את האוכל ל**חומרים מזינים** ואנרגיה שהגוף צריך כדי לגדול, לזוז ולחשוב.\n\nבלי עיכול תקין, הגוף לא היה מקבל את מה שהוא צריך כדי לתפקד כל יום.",
        },
        {
          type: "content",
          title: "מה קורה **בסוף** התהליך?",
          subtitle: "השלב האחרון",
          body: "אחרי שהמעיים סופגים את כל החומרים המזינים, מה שנשאר עובר אל ה**מעי הגס**.\n\nשם נספגים המים האחרונים, והפסולת שנשארת יוצאת מהגוף כשאנחנו הולכים לשירותים.",
        },
        {
          type: "content",
          title: "איך **שומרים** על מערכת עיכול בריאה?",
          subtitle: "הרגלים טובים",
          body: "**תזונה מאוזנת** — אכילת ירקות, פירות וסיבים תזונתיים עוזרת לעיכול לעבוד טוב.\n\n**שתיית מים** — עוזרת למערכת העיכול לפעול בקלות.\n\n**לעיסה איטית** — לעיסה טובה של האוכל מקלה על הקיבה.",
        },
        {
          type: "content",
          title: "דיון כיתתי",
          subtitle: "שאלות על השיעור",
          body: "אילו מזונות אתם אוכלים שעוזרים ל**מערכת העיכול** לעבוד טוב?\n\nלמה חשוב ללעוס אוכל לאט ולא למהר לבלוע?",
        },
        { type: "games", title: "זמן לתרגל!", subtitle: "משחקים" },
        {
          type: "content",
          title: "סוף השיעור",
          subtitle: "כל הכבוד!",
          body: "תודה על ההשתתפות!",
        },
      ],

      en: {
        name: "Human Body - Digestive System",
        nameMain: "Human Body",
        namePart: "Digestive System",
        summary: "Get to know the digestive system up close — what happens to food from the moment it enters the mouth until the end, and how to keep it healthy. With a game at the end.",
        vocab: [
          { en: "Digestive system", he: "The chain of organs that processes the food we eat." },
          { en: "Stomach", he: "An organ in the belly that breaks down food using acids." },
          { en: "Esophagus", he: "The tube that carries food from the mouth to the stomach." },
          { en: "Intestines", he: "Long tubes that keep breaking down food and absorb nutrients from it." },
          { en: "Saliva", he: "A fluid in the mouth that starts breaking down food while chewing." },
          { en: "Digestion", he: "The process by which the body breaks food down into things it can use." },
          { en: "Nutrients", he: "Substances in food that the body needs to grow and function." },
          { en: "Liver", he: "An organ that helps digest fat and clears toxins from the blood." },
          { en: "Large intestine", he: "The last part of the intestines, which absorbs water and prepares waste to leave the body." },
          { en: "Balanced diet", he: "Eating a variety of healthy foods in the right amounts." },
        ],
        slides: [
          {
            type: "content",
            title: "What is the **Digestive System**?",
            subtitle: "Opening",
            body: "The digestive system is a long chain of organs that turns the food we eat into energy and things the body needs.\n\nIt starts in our mouth and continues through the whole body.",
          },
          {
            type: "content",
            title: "**Important words**",
            subtitle: "Vocabulary",
            body: "Stomach — an organ in the belly that breaks down food using acids.\n\nIntestines — long tubes that keep breaking down food and absorb nutrients from it.\n\nEsophagus — the tube that carries food from the mouth to the stomach.",
          },
          {
            type: "content",
            title: "How does **Digestion** work?",
            subtitle: "Inside the body",
            body: "When we chew food, **saliva** starts breaking it down, and it travels down the **esophagus** into the **stomach**.\n\nIn the stomach, food mixes with acids and moves on to the intestines, where the body absorbs **nutrients** from it into the blood.",
          },
          {
            type: "content",
            title: "Why is **Digestion** so important?",
            subtitle: "The digestive system's job",
            body: "Digestion turns food into the **nutrients** and energy the body needs to grow, move, and think.\n\nWithout proper digestion, the body wouldn't get what it needs to work every day.",
          },
          {
            type: "content",
            title: "What happens **at the end** of the process?",
            subtitle: "The final stage",
            body: "After the intestines absorb all the nutrients, what's left moves on to the **large intestine**.\n\nThere the last of the water is absorbed, and the waste that remains leaves the body when we go to the bathroom.",
          },
          {
            type: "content",
            title: "How do you **keep** your digestive system healthy?",
            subtitle: "Good habits",
            body: "**Balanced diet** — eating vegetables, fruit, and fiber helps digestion work well.\n\n**Drinking water** — helps the digestive system run smoothly.\n\n**Chewing slowly** — chewing food well makes it easier on the stomach.",
          },
          {
            type: "content",
            title: "Class discussion",
            subtitle: "Questions about the lesson",
            body: "Which foods do you eat that help your **digestive system** work well?\n\nWhy is it important to chew food slowly instead of rushing to swallow it?",
          },
          { type: "games", title: "Time to practice!", subtitle: "Games" },
          {
            type: "content",
            title: "End of lesson",
            subtitle: "Well done!",
            body: "Thanks for participating!",
          },
        ],
      },
    },

    money: {
      id: "money",
      name: "כישורי חיים - ניהול כסף וקניות חכמות",
      nameMain: "כישורי חיים",
      namePart: "ניהול כסף וקניות חכמות",
      subject: "lifeskills",
      grades: ["ag", "dv", "zh"],
      topic: "money",
      gradeLabel: "כל הכיתות",
      duration: "30 דק'",
      summary: "לומדים מה זה תקציב, איך מבדילים בין צרכים לרצונות, ואיך עושים קניה חכמה וחוסכים כסף בתבונה. עם משחק בסוף.",
      vocab: [
        { en: "תקציב", he: "תוכנית שמראה כמה כסף יש לנו וכמה בכוונתנו להוציא ולחסוך" },
        { en: "הכנסה", he: "כסף שמקבלים, למשל דמי כיס או משכורת" },
        { en: "הוצאה", he: "כסף שמוציאים כדי לקנות או לשלם על משהו" },
        { en: "חיסכון", he: "כסף ששומרים ולא מוציאים עכשיו, לשימוש בעתיד" },
        { en: "צרכים", he: "דברים שחייבים כדי לחיות, כמו אוכל, בגדים ומקום לגור בו" },
        { en: "רצונות", he: "דברים שהיינו רוצים לקנות, אבל לא חייבים כדי לחיות" },
        { en: "מחיר", he: "כמה כסף צריך לשלם כדי לקנות משהו" },
        { en: "הנחה", he: "הורדה זמנית במחיר של מוצר" },
        { en: "השוואת מחירים", he: "בדיקה של מחיר אותו מוצר במקומות שונים לפני קניה" },
        { en: "קניה חכמה", he: "החלטה מחושבת לפני שקונים, ולא קניה מתוך דחף רגעי" },
        { en: "דמי כיס", he: "כסף קטן וקבוע שילדים מקבלים מההורים" },
        { en: "חשבון בנק", he: "מקום בבנק ששומרים בו כסף" },
        { en: "ריבית", he: "תוספת כסף קטנה שהבנק נותן על כסף ששמור בחיסכון" },
        { en: "יעד חיסכון", he: "סכום כסף שמציבים לעצמנו מטרה לחסוך לקראתו" },
      ],
      games: STANDARD_LESSON_GAMES,
      slides: [
        {
          type: "content",
          title: "מה זה **תקציב**?",
          subtitle: "פתיחה",
          body: "**תקציב** הוא תוכנית פשוטה שעוזרת לנו לדעת כמה כסף יש לנו, וכמה אנחנו מתכננים להוציא ולחסוך ממנו.\n\nגם מבוגרים וגם ילדים יכולים לנהל תקציב — למשל, לתכנן איך להשתמש בדמי הכיס השבועיים.\n\nהיום נלמד איך מבדילים בין **צרכים** ל**רצונות**, ואיך עושים **קניה חכמה** עם הכסף שיש לנו.",
        },
        {
          type: "content",
          title: "**מילים חשובות**",
          subtitle: "אוצר מושגים",
          body: "תקציב — תוכנית שמראה כמה כסף יש לנו וכמה בכוונתנו להוציא ולחסוך.\n\nהכנסה — כסף שמקבלים, למשל דמי כיס.\n\nהוצאה — כסף שמוציאים כדי לקנות או לשלם על משהו.\n\nחיסכון — כסף ששומרים ולא מוציאים עכשיו, לשימוש בעתיד.",
        },
        {
          type: "content",
          title: "**צרכים** מול **רצונות**",
          subtitle: "מה חשוב באמת?",
          body: "**צרכים** הם דברים שאנחנו חייבים כדי לחיות — כמו אוכל, בגדים ומקום לגור בו.\n\n**רצונות** הם דברים שהיינו שמחים לקנות, כמו צעצוע חדש או ממתק — אבל אנחנו לא חייבים אותם כדי לחיות.\n\nלפני שקונים משהו, שווה לשאול: זה **צורך** או **רצון**? זה עוזר להחליט אם באמת כדאי לקנות אותו עכשיו.",
        },
        {
          type: "content",
          title: "איך בונים **תקציב**?",
          subtitle: "שלב אחר שלב",
          body: "קודם בודקים כמה **הכנסה** יש — למשל, כמה **דמי כיס** מקבלים בשבוע.\n\nאז מחליטים כמה מהכסף הולך ל**הוצאות** (כמו ממתק או משחק), וכמה הולך ל**חיסכון**.\n\nתקציב טוב משאיר תמיד קצת כסף בצד לחיסכון — גם אם זה סכום קטן.",
        },
        {
          type: "content",
          title: "מה זו **קניה חכמה**?",
          subtitle: "לפני שקונים",
          body: "**קניה חכמה** מתחילה בשאלה: האם אני באמת צריך את זה, או שאני קונה מתוך דחף רגעי?\n\nכדאי לבדוק את ה**מחיר** במקום אחד או שניים לפני שקונים — זה נקרא **השוואת מחירים**, ולפעמים אפשר למצוא את אותו המוצר בזול יותר.\n\nגם כדאי לחכות יום או יומיים לפני קניה גדולה — אם עדיין רוצים את זה אחרי שחיכינו, כנראה שזה באמת חשוב לנו.",
        },
        {
          type: "content",
          title: "**הנחות** ומבצעים — תמיד כדאי?",
          subtitle: "להיזהר ממלכודות",
          body: "**הנחה** היא הורדה זמנית במחיר, אבל לא כל מבצע הוא באמת חיסכון.\n\nלפעמים חנויות מציגות \"מבצע\" על מוצר שממילא לא היינו קונים — וכך בסוף מוציאים יותר כסף, לא פחות.\n\nהכלל הזהב: קונים רק דברים שבאמת צריכים, גם אם יש עליהם הנחה.",
        },
        {
          type: "content",
          title: "חוסכים לקראת **יעד**",
          subtitle: "תכנון לטווח ארוך",
          body: "**יעד חיסכון** הוא סכום כסף שמציבים לעצמנו מטרה לחסוך אליו — למשל, כדי לקנות משחק חדש.\n\nהדרך הכי טובה היא לשים כל שבוע חלק קטן מה**דמי כיס** בצד, עד שמגיעים ליעד.\n\nכשהכסף נשמר ב**חשבון בנק**, לפעמים הבנק מוסיף עליו גם קצת **ריבית** — כלומר, הכסף גדל מעצמו עם הזמן.",
        },
        {
          type: "content",
          title: "**אחריות** עם דמי כיס",
          subtitle: "הרגלים טובים",
          body: "**דמי כיס** הם הזדמנות מצוינת ללמוד לנהל כסף בעצמנו, גם בסכומים קטנים.\n\nכדאי לחלק אותם מראש: חלק ל**הוצאות** יומיומיות, וחלק ל**חיסכון** לקראת משהו גדול יותר.\n\nככל שמתרגלים לנהל תקציב קטן היום, כך יהיה קל יותר לנהל כסף גדול יותר כשגדלים.",
        },
        {
          type: "content",
          title: "דיון כיתתי",
          subtitle: "שאלות על השיעור",
          body: "חשבו על משהו שקניתם לאחרונה — זה היה **צורך** או **רצון**? איך החלטתם?\n\nאם הייתם מקבלים 50 שקלים **דמי כיס** השבוע, איך הייתם מחלקים אותם בין הוצאות ל**חיסכון**?",
        },
        { type: "games", title: "זמן לתרגל!", subtitle: "משחקים" },
        {
          type: "content",
          title: "סוף השיעור",
          subtitle: "כל הכבוד!",
          body: "תודה על ההשתתפות!",
        },
      ],

      en: {
        name: "Life Skills - Money & Smart Shopping",
        nameMain: "Life Skills",
        namePart: "Money & Smart Shopping",
        summary: "Learn what a budget is, how to tell needs from wants, and how to shop smart and save money wisely. With a game at the end.",
        vocab: [
          { en: "Budget", he: "A plan that shows how much money we have and how much we intend to spend and save." },
          { en: "Income", he: "Money you receive, like allowance or a salary." },
          { en: "Expense", he: "Money spent to buy or pay for something." },
          { en: "Savings", he: "Money kept and not spent now, for use in the future." },
          { en: "Needs", he: "Things you must have to live, like food, clothes, and a place to live." },
          { en: "Wants", he: "Things you would like to buy, but don't need in order to live." },
          { en: "Price", he: "How much money you have to pay to buy something." },
          { en: "Discount", he: "A temporary reduction in a product's price." },
          { en: "Comparing prices", he: "Checking the price of the same product in different places before buying." },
          { en: "Smart shopping", he: "A thought-out decision before buying, instead of an impulse buy." },
          { en: "Allowance", he: "A small, regular amount of money kids get from their parents." },
          { en: "Bank account", he: "A place at a bank where money is kept." },
          { en: "Interest", he: "A small amount of extra money a bank adds to money kept in savings." },
          { en: "Savings goal", he: "An amount of money we set as a target to save toward." },
        ],
        slides: [
          {
            type: "content",
            title: "What is a **Budget**?",
            subtitle: "Opening",
            body: "A **budget** is a simple plan that helps us know how much money we have, and how much we plan to spend and save from it.\n\nBoth grown-ups and kids can manage a budget — for example, planning how to use weekly allowance.\n\nToday we'll learn how to tell **needs** from **wants**, and how to make a **smart purchase** with the money we have.",
          },
          {
            type: "content",
            title: "**Important words**",
            subtitle: "Vocabulary",
            body: "Budget — a plan that shows how much money we have and how much we intend to spend and save.\n\nIncome — money you receive, like allowance.\n\nExpense — money spent to buy or pay for something.\n\nSavings — money kept and not spent now, for use in the future.",
          },
          {
            type: "content",
            title: "**Needs** vs. **Wants**",
            subtitle: "What really matters?",
            body: "**Needs** are things we must have to live — like food, clothes, and a place to live.\n\n**Wants** are things we'd be happy to buy, like a new toy or candy — but we don't need them to live.\n\nBefore buying something, it's worth asking: is this a **need** or a **want**? It helps decide if it's really worth buying right now.",
          },
          {
            type: "content",
            title: "How do you build a **Budget**?",
            subtitle: "Step by step",
            body: "First, check how much **income** you have — for example, how much **allowance** you get per week.\n\nThen decide how much of the money goes to **expenses** (like candy or a game), and how much goes to **savings**.\n\nA good budget always leaves a little money aside for savings — even if it's a small amount.",
          },
          {
            type: "content",
            title: "What is **Smart Shopping**?",
            subtitle: "Before you buy",
            body: "**Smart shopping** starts with a question: do I really need this, or am I buying on impulse?\n\nIt's worth checking the **price** in one or two places before buying — that's called **comparing prices**, and sometimes you can find the same product cheaper.\n\nIt also helps to wait a day or two before a big purchase — if you still want it after waiting, it's probably really important to you.",
          },
          {
            type: "content",
            title: "**Discounts** and sales — always worth it?",
            subtitle: "Watch out for traps",
            body: "A **discount** is a temporary price cut, but not every sale is really a saving.\n\nSometimes stores show a \"sale\" on a product you wouldn't have bought anyway — and you end up spending more money, not less.\n\nThe golden rule: only buy things you really need, even if they're on sale.",
          },
          {
            type: "content",
            title: "Saving toward a **Goal**",
            subtitle: "Planning for the long run",
            body: "A **savings goal** is an amount of money we set as a target to save toward — for example, to buy a new game.\n\nThe best way is to set aside a small part of your **allowance** every week, until you reach the goal.\n\nWhen money is kept in a **bank account**, the bank sometimes adds a bit of **interest** too — meaning the money grows on its own over time.",
          },
          {
            type: "content",
            title: "**Responsibility** with allowance",
            subtitle: "Good habits",
            body: "**Allowance** is a great chance to learn to manage money on your own, even in small amounts.\n\nIt helps to split it in advance: part for everyday **expenses**, and part for **savings** toward something bigger.\n\nThe more you practice managing a small budget today, the easier it will be to manage bigger money when you grow up.",
          },
          {
            type: "content",
            title: "Class discussion",
            subtitle: "Questions about the lesson",
            body: "Think of something you bought recently — was it a **need** or a **want**? How did you decide?\n\nIf you got $10 **allowance** this week, how would you split it between spending and **saving**?",
          },
          { type: "games", title: "Time to practice!", subtitle: "Games" },
          {
            type: "content",
            title: "End of lesson",
            subtitle: "Well done!",
            body: "Thanks for participating!",
          },
        ],
      },
    },

    time: {
      id: "time",
      name: "כישורי חיים - ניהול זמן ותכנון",
      nameMain: "כישורי חיים",
      namePart: "ניהול זמן ותכנון",
      subject: "lifeskills",
      grades: ["ag", "dv", "zh"],
      topic: "time",
      gradeLabel: "כל הכיתות",
      duration: "30 דק'",
      summary: "לומדים איך לתכנן את היום, לקבוע סדר עדיפויות, להתמודד עם דחיינות והסחות דעת, ולשמור על איזון בין לימודים, משחק ומנוחה. עם משחק בסוף.",
      vocab: [
        { en: "תכנון", he: "לחשוב מראש איך נשתמש בזמן שלנו" },
        { en: "לוח זמנים", he: "רשימה שמראה מתי עושים כל פעילות במהלך היום" },
        { en: "סדר עדיפויות", he: "החלטה מה חשוב לעשות קודם" },
        { en: "דחיינות", he: "הרגל של דחיית משימות למועד מאוחר יותר" },
        { en: "יעד", he: "מטרה שרוצים להשיג" },
        { en: "הפסקה", he: "זמן קצר של מנוחה בין משימות" },
        { en: "שגרה", he: "סדר קבוע של פעולות שחוזר על עצמו כל יום" },
        { en: "הסחת דעת", he: "משהו שמפריע להתרכז במשימה" },
        { en: "ניהול זמן", he: "היכולת לתכנן ולנצל את הזמן בצורה יעילה" },
        { en: "מועד אחרון", he: "התאריך או השעה שבהם משימה חייבת להיות מוכנה" },
        { en: "משימה", he: "דבר שצריך לעשות" },
        { en: "איזון", he: "חלוקה נכונה של זמן בין לימודים, משחק ומנוחה" },
        { en: "ריכוז", he: "היכולת להישאר ממוקדים במשימה אחת לאורך זמן" },
      ],
      games: STANDARD_LESSON_GAMES,
      slides: [
        {
          type: "content",
          title: "מה זה **ניהול זמן**?",
          subtitle: "פתיחה",
          body: "**ניהול זמן** הוא היכולת לתכנן ולנצל את הזמן שיש לנו בצורה יעילה — כדי להספיק גם ללמוד, גם לשחק וגם לנוח.\n\nלכולנו יש בדיוק אותו מספר שעות ביום, אבל אנשים שיודעים **לתכנן** מצליחים להספיק יותר ולהרגיש פחות לחוצים.\n\nהיום נלמד איך בונים **לוח זמנים**, איך קובעים **סדר עדיפויות**, ואיך מתמודדים עם **דחיינות**.",
        },
        {
          type: "content",
          title: "**מילים חשובות**",
          subtitle: "אוצר מושגים",
          body: "תכנון — לחשוב מראש איך נשתמש בזמן שלנו.\n\nלוח זמנים — רשימה שמראה מתי עושים כל פעילות במהלך היום.\n\nסדר עדיפויות — החלטה מה חשוב לעשות קודם.\n\nדחיינות — הרגל של דחיית משימות למועד מאוחר יותר.",
        },
        {
          type: "content",
          title: "קובעים **סדר עדיפויות**",
          subtitle: "מה חשוב קודם?",
          body: "לא כל ה**משימות** שלנו באותה חשיבות — יש כאלה שדחופות יותר, ויש כאלה שיכולות לחכות.\n\n**סדר עדיפויות** טוב מתחיל בשאלה: מה חייב להיעשות היום, ומה יכול לחכות למחר?\n\nכדאי להתחיל דווקא מהמשימה הכי פחות נעימה — כך היא לא תישאר תלויה מעל הראש כל היום.",
        },
        {
          type: "content",
          title: "בונים **לוח זמנים** יומי",
          subtitle: "מהבוקר עד הערב",
          body: "**לוח זמנים** טוב מחלק את היום לבלוקים ברורים — זמן ל**שגרה** של הבוקר, זמן ללימודים, וזמן למשחק ומנוחה.\n\nכדאי לרשום את לוח הזמנים על דף או ביומן — כך רואים אותו בבירור ולא שוכחים משימות.\n\nחשוב להשאיר גם זמן פנוי לא מתוכנן — לפעמים דברים לוקחים יותר זמן ממה שחשבנו.",
        },
        {
          type: "content",
          title: "מה זו **דחיינות**?",
          subtitle: "האויב של הזמן",
          body: "**דחיינות** היא ההרגל לדחות משימה למועד מאוחר יותר, גם כשיודעים שצריך לעשות אותה.\n\nהיא קורית כי משימה נראית לנו קשה או משעממת — אז אנחנו מעדיפים לעשות משהו כיפי יותר קודם.\n\nדרך טובה להתגבר על דחיינות: להתחיל רק ב-5 דקות עבודה על המשימה. לרוב, אחרי שמתחילים — קל יותר להמשיך.",
        },
        {
          type: "content",
          title: "מתמודדים עם **הסחות דעת**",
          subtitle: "שומרים על ריכוז",
          body: "**הסחת דעת** היא כל דבר שמפריע לנו להתרכז — כמו טלפון, טלוויזיה ברקע או רעש.\n\nכשעובדים על משימה חשובה, כדאי להרחיק הסחות דעת מראש — למשל לכבות התראות בטלפון.\n\n**הפסקה** קצרה בין משימות בעצם עוזרת ל**ריכוז** — המוח מקבל רגע לנוח ולחזור רענן.",
        },
        {
          type: "content",
          title: "מציבים **יעדים** קטנים וגדולים",
          subtitle: "לאן אנחנו מכוונים?",
          body: "**יעד** הוא מטרה שרוצים להשיג — למשל לסיים שיעורי בית לפני הארוחה, או לקרוא ספר שלם עד סוף החודש.\n\nיעד גדול קל יותר להשיג כשמחלקים אותו למשימות קטנות יותר, אחת בכל פעם.\n\nכל **מועד אחרון** שמגיעים אליו בזמן נותן תחושת הצלחה — וזה מעודד להמשיך לתכנן טוב.",
        },
        {
          type: "content",
          title: "שומרים על **איזון**",
          subtitle: "לימודים, משחק ומנוחה",
          body: "**איזון** טוב אומר שיש בלוח הזמנים שלנו גם זמן ללימודים, גם למשחק וגם למנוחה — לא רק אחד מהם.\n\nיום עמוס מדי בלי **הפסקות** מעייף את הגוף והמוח, וקשה יותר להתרכז.\n\nכשיש **שגרה** קבועה עם זמן קבוע לשינה, לימודים ומשחק — קל יותר להרגיש רגועים ומאורגנים.",
        },
        {
          type: "content",
          title: "דיון כיתתי",
          subtitle: "שאלות על השיעור",
          body: "מה הדבר שאתם הכי נוטים לדחות בגלל **דחיינות**? למה אתם חושבים שזה קורה?\n\nאיזו **הסחת דעת** הכי מפריעה לכם להתרכז, ואיך אפשר להתמודד איתה?",
        },
        { type: "games", title: "זמן לתרגל!", subtitle: "משחקים" },
        {
          type: "content",
          title: "סוף השיעור",
          subtitle: "כל הכבוד!",
          body: "תודה על ההשתתפות!",
        },
      ],

      en: {
        name: "Life Skills - Time Management & Planning",
        nameMain: "Life Skills",
        namePart: "Time Management & Planning",
        summary: "Learn how to plan your day, set priorities, deal with procrastination and distractions, and keep a balance between studying, playing, and resting. With a game at the end.",
        vocab: [
          { en: "Planning", he: "Thinking ahead about how we'll use our time." },
          { en: "Schedule", he: "A list that shows when to do each activity during the day." },
          { en: "Priorities", he: "Deciding what's important to do first." },
          { en: "Procrastination", he: "The habit of putting off tasks to a later time." },
          { en: "Goal", he: "Something you want to achieve." },
          { en: "Break", he: "A short rest between tasks." },
          { en: "Routine", he: "A fixed order of actions that repeats every day." },
          { en: "Distraction", he: "Something that interrupts your focus on a task." },
          { en: "Time management", he: "The ability to plan and use time efficiently." },
          { en: "Deadline", he: "The date or time by which a task must be ready." },
          { en: "Task", he: "Something that needs to get done." },
          { en: "Balance", he: "Splitting time correctly between studying, playing, and resting." },
          { en: "Focus", he: "The ability to stay concentrated on one task for a period of time." },
        ],
        slides: [
          {
            type: "content",
            title: "What is **Time Management**?",
            subtitle: "Opening",
            body: "**Time management** is the ability to plan and use the time we have efficiently — so we can fit in studying, playing, and resting.\n\nWe all have exactly the same number of hours in a day, but people who know how to **plan** manage to get more done and feel less stressed.\n\nToday we'll learn how to build a **schedule**, how to set **priorities**, and how to deal with **procrastination**.",
          },
          {
            type: "content",
            title: "**Important words**",
            subtitle: "Vocabulary",
            body: "Planning — thinking ahead about how we'll use our time.\n\nSchedule — a list that shows when to do each activity during the day.\n\nPriorities — deciding what's important to do first.\n\nProcrastination — the habit of putting off tasks to a later time.",
          },
          {
            type: "content",
            title: "Setting **Priorities**",
            subtitle: "What matters first?",
            body: "Not all our **tasks** are equally important — some are more urgent, and some can wait.\n\nGood **priorities** start with a question: what must get done today, and what can wait until tomorrow?\n\nIt helps to start with the least pleasant task — that way it doesn't hang over your head all day.",
          },
          {
            type: "content",
            title: "Building a daily **Schedule**",
            subtitle: "From morning to night",
            body: "A good **schedule** splits the day into clear blocks — time for a morning **routine**, time for studying, and time for playing and resting.\n\nIt helps to write the schedule on paper or in a planner — that way you see it clearly and don't forget tasks.\n\nIt's important to leave some unplanned free time too — sometimes things take longer than we thought.",
          },
          {
            type: "content",
            title: "What is **Procrastination**?",
            subtitle: "The enemy of time",
            body: "**Procrastination** is the habit of putting off a task to later, even when you know you need to do it.\n\nIt happens because a task seems hard or boring — so we'd rather do something more fun first.\n\nA good way to beat procrastination: start with just 5 minutes of work on the task. Usually, once you start, it's easier to keep going.",
          },
          {
            type: "content",
            title: "Dealing with **Distractions**",
            subtitle: "Staying focused",
            body: "A **distraction** is anything that stops us from focusing — like a phone, background TV, or noise.\n\nWhen working on an important task, it helps to remove distractions in advance — for example, turning off phone notifications.\n\nA short **break** between tasks actually helps **focus** — the brain gets a moment to rest and comes back refreshed.",
          },
          {
            type: "content",
            title: "Setting Small and Big **Goals**",
            subtitle: "Where are we heading?",
            body: "A **goal** is something you want to achieve — like finishing homework before dinner, or reading a whole book by the end of the month.\n\nA big goal is easier to reach when you break it into smaller tasks, one at a time.\n\nHitting a **deadline** on time gives a feeling of success — and that encourages you to keep planning well.",
          },
          {
            type: "content",
            title: "Keeping a **Balance**",
            subtitle: "Studying, playing, and resting",
            body: "A good **balance** means your schedule has time for studying, for playing, and for resting — not just one of them.\n\nA day that's too packed with no **breaks** tires out the body and mind, making it harder to focus.\n\nWhen there's a steady **routine** with set times for sleep, studying, and play, it's easier to feel calm and organized.",
          },
          {
            type: "content",
            title: "Class discussion",
            subtitle: "Questions about the lesson",
            body: "What's the thing you tend to put off most because of **procrastination**? Why do you think that happens?\n\nWhich **distraction** bothers your focus the most, and how can you deal with it?",
          },
          { type: "games", title: "Time to practice!", subtitle: "Games" },
          {
            type: "content",
            title: "End of lesson",
            subtitle: "Well done!",
            body: "Thanks for participating!",
          },
        ],
      },
    },

    communication: {
      id: "communication",
      name: "כישורי חיים - תקשורת ופתרון קונפליקטים",
      nameMain: "כישורי חיים",
      namePart: "תקשורת ופתרון קונפליקטים",
      subject: "lifeskills",
      grades: ["ag", "dv", "zh"],
      topic: "communication",
      gradeLabel: "כל הכיתות",
      duration: "30 דק'",
      summary: "לומדים מה זו הקשבה פעילה, איך מזהים קונפליקט ופותרים אותו בכבוד, ואיך מביעים רגשות ומרגיעים את עצמנו כשכועסים. עם משחק בסוף.",
      vocab: [
        { en: "תקשורת", he: "העברת מחשבות, רגשות ומידע בין אנשים" },
        { en: "הקשבה פעילה", he: "הקשבה מלאה למה שהאדם השני אומר, בלי להפריע" },
        { en: "אמפתיה", he: "היכולת להבין ולהרגיש את מה שאדם אחר מרגיש" },
        { en: "קונפליקט", he: "מצב של חילוקי דעות או ריב בין אנשים" },
        { en: "פשרה", he: "הסכמה שבה כל צד מוותר קצת כדי להגיע לפתרון משותף" },
        { en: "שפת גוף", he: "תנועות ותנוחות של הגוף שמעבירות מסר בלי מילים" },
        { en: "הבעת רגשות", he: "לספר לאחרים איך מרגישים, במילים" },
        { en: "כבוד הדדי", he: "יחס נעים ומכבד בין שני הצדדים" },
        { en: "טון דיבור", he: "הצליל והאופן שבו אומרים משהו" },
        { en: "פתרון בעיות", he: "תהליך של מציאת פתרון למצב קשה" },
        { en: "הרגעה עצמית", he: "דרכים להירגע כשכועסים או מתוסכלים" },
        { en: "הסכמה", he: "מצב שבו שני צדדים מסכימים על משהו ביחד" },
        { en: "נקודת מבט", he: "הדרך שבה אדם מסוים רואה ומבין מצב מסוים" },
      ],
      games: STANDARD_LESSON_GAMES,
      slides: [
        {
          type: "content",
          title: "מה זו **תקשורת** טובה?",
          subtitle: "פתיחה",
          body: "**תקשורת** היא הדרך שבה אנחנו מעבירים מחשבות, רגשות ומידע לאנשים אחרים — במילים, בטון הדיבור ובשפת הגוף.\n\nתקשורת טובה עוזרת לנו להבין אחרים, ולגרום להם להבין אותנו — וגם למנוע **קונפליקטים** רבים לפני שהם מתחילים.\n\nהיום נלמד מה זו **הקשבה פעילה**, ואיך פותרים חילוקי דעות בכבוד.",
        },
        {
          type: "content",
          title: "**מילים חשובות**",
          subtitle: "אוצר מושגים",
          body: "תקשורת — העברת מחשבות, רגשות ומידע בין אנשים.\n\nהקשבה פעילה — הקשבה מלאה למה שהאדם השני אומר, בלי להפריע.\n\nאמפתיה — היכולת להבין ולהרגיש את מה שאדם אחר מרגיש.\n\nקונפליקט — מצב של חילוקי דעות או ריב בין אנשים.",
        },
        {
          type: "content",
          title: "מה זו **הקשבה פעילה**?",
          subtitle: "להקשיב באמת",
          body: "**הקשבה פעילה** אומרת להקשיב באמת למה שמישהו אומר, ולא רק לחכות לתור שלנו לדבר.\n\nכשמקשיבים באמת, שומרים על קשר עין, לא קוטעים את הדובר, ולפעמים אפילו חוזרים במילים שלנו על מה ששמענו — כדי לוודא שהבנו נכון.\n\nהקשבה טובה גורמת לאדם השני להרגיש שרואים ומכבדים אותו.",
        },
        {
          type: "content",
          title: "**שפת גוף** וטון דיבור",
          subtitle: "מעבר למילים",
          body: "לפעמים אנחנו אומרים דבר אחד במילים, אבל ה**שפת גוף** שלנו מעבירה מסר אחר לגמרי.\n\n**טון דיבור** רגוע ונעים גורם לאנשים להקשיב יותר, בעוד שטון כועס עלול לגרום להם להתגונן.\n\nכשמדברים עם מישהו, שווה לשים לב גם למה שהגוף שלנו \"אומר\" — הבעות פנים, יציבה ומגע עין.",
        },
        {
          type: "content",
          title: "מה זה **קונפליקט**?",
          subtitle: "למה זה קורה",
          body: "**קונפליקט** הוא מצב שבו לשני אנשים יש דעות, רצונות או צרכים שונים — וזה קורה לכולם, גם בין חברים טובים.\n\nקונפליקט הוא לא בהכרח דבר רע — הוא הזדמנות ללמוד להקשיב ל**נקודת המבט** של האדם השני.\n\nהבעיה מתחילה כשלא יודעים איך לדבר על זה בכבוד, ואז זה יכול להפוך לריב.",
        },
        {
          type: "content",
          title: "איך פותרים **קונפליקט**?",
          subtitle: "בדרך בריאה",
          body: "ראשית, כל צד מספר איך הוא מרגיש, בלי צעקות ובלי להאשים.\n\nאז מקשיבים לנקודת המבט של הצד השני — גם אם לא מסכימים איתה.\n\nלבסוף, מחפשים **פשרה**: פתרון שבו כל צד מוותר קצת, כדי להגיע ל**הסכמה** ששני הצדדים יכולים לחיות איתה.",
        },
        {
          type: "content",
          title: "מה זו **אמפתיה**?",
          subtitle: "להבין את הצד השני",
          body: "**אמפתיה** היא היכולת להבין ולהרגיש מה אדם אחר מרגיש, גם אם אנחנו לא באותו מצב.\n\nכששואלים את עצמנו \"איך הייתי מרגיש במקומו?\" — קל יותר להגיב בעדינות וב**כבוד הדדי**.\n\nאמפתיה לא אומרת להסכים תמיד עם האדם השני — היא אומרת להבין אותו, גם כשחושבים אחרת.",
        },
        {
          type: "content",
          title: "**הרגעה עצמית** כשכועסים",
          subtitle: "לפני שמגיבים",
          body: "כשאנחנו כועסים, קל להגיד דברים שמתחרטים עליהם אחר כך.\n\n**הרגעה עצמית** יכולה להיות משהו פשוט — לספור עד עשר, לנשום עמוק, או לצאת לרגע מהמצב לפני שמגיבים.\n\nרק אחרי שנרגענו קצת, קל יותר להביע רגשות במילים בצורה ברורה ומכבדת, במקום בצעקות.",
        },
        {
          type: "content",
          title: "דיון כיתתי",
          subtitle: "שאלות על השיעור",
          body: "תחשבו על **קונפליקט** קטן שהיה לכם עם חבר או עם אח או אחות — איך פתרתם אותו?\n\nמה ההבדל בין להקשיב \"סתם\" לבין **הקשבה פעילה**?",
        },
        { type: "games", title: "זמן לתרגל!", subtitle: "משחקים" },
        {
          type: "content",
          title: "סוף השיעור",
          subtitle: "כל הכבוד!",
          body: "תודה על ההשתתפות!",
        },
      ],

      en: {
        name: "Life Skills - Communication & Conflict Resolution",
        nameMain: "Life Skills",
        namePart: "Communication & Conflict Resolution",
        summary: "Learn what active listening is, how to spot a conflict and resolve it respectfully, and how to express feelings and calm yourself down when angry. With a game at the end.",
        vocab: [
          { en: "Communication", he: "Passing thoughts, feelings, and information between people." },
          { en: "Active listening", he: "Listening fully to what another person is saying, without interrupting." },
          { en: "Empathy", he: "The ability to understand and feel what another person is feeling." },
          { en: "Conflict", he: "A situation of disagreement or argument between people." },
          { en: "Compromise", he: "An agreement in which each side gives up a little to reach a shared solution." },
          { en: "Body language", he: "Body movements and posture that send a message without words." },
          { en: "Expressing feelings", he: "Telling others how you feel, in words." },
          { en: "Mutual respect", he: "A pleasant, respectful attitude between both sides." },
          { en: "Tone of voice", he: "The sound and way something is said." },
          { en: "Problem-solving", he: "A process of finding a solution to a difficult situation." },
          { en: "Self-calming", he: "Ways to calm down when angry or frustrated." },
          { en: "Agreement", he: "A situation in which both sides agree on something together." },
          { en: "Point of view", he: "The way a particular person sees and understands a certain situation." },
        ],
        slides: [
          {
            type: "content",
            title: "What is good **Communication**?",
            subtitle: "Opening",
            body: "**Communication** is the way we pass thoughts, feelings, and information to other people — through words, tone of voice, and body language.\n\nGood communication helps us understand others, and helps them understand us — and it also prevents many **conflicts** before they even start.\n\nToday we'll learn what **active listening** is, and how to resolve disagreements respectfully.",
          },
          {
            type: "content",
            title: "**Important words**",
            subtitle: "Vocabulary",
            body: "Communication — passing thoughts, feelings, and information between people.\n\nActive listening — listening fully to what another person is saying, without interrupting.\n\nEmpathy — the ability to understand and feel what another person is feeling.\n\nConflict — a situation of disagreement or argument between people.",
          },
          {
            type: "content",
            title: "What is **Active Listening**?",
            subtitle: "Really listening",
            body: "**Active listening** means really listening to what someone is saying, instead of just waiting for your turn to talk.\n\nWhen you really listen, you keep eye contact, don't interrupt the speaker, and sometimes even repeat back what you heard in your own words — to make sure you understood correctly.\n\nGood listening makes the other person feel seen and respected.",
          },
          {
            type: "content",
            title: "**Body Language** and Tone of Voice",
            subtitle: "Beyond words",
            body: "Sometimes we say one thing in words, but our **body language** sends a completely different message.\n\nA calm, pleasant **tone of voice** makes people listen more, while an angry tone can make them get defensive.\n\nWhen talking to someone, it's worth paying attention to what your body is \"saying\" too — facial expressions, posture, and eye contact.",
          },
          {
            type: "content",
            title: "What is a **Conflict**?",
            subtitle: "Why it happens",
            body: "A **conflict** is a situation where two people have different opinions, wants, or needs — and it happens to everyone, even good friends.\n\nA conflict isn't necessarily a bad thing — it's a chance to learn to listen to the other person's **point of view**.\n\nThe problem starts when people don't know how to talk about it respectfully, and then it can turn into a fight.",
          },
          {
            type: "content",
            title: "How do you resolve a **Conflict**?",
            subtitle: "In a healthy way",
            body: "First, each side says how they feel, without shouting and without blaming.\n\nThen you listen to the other side's point of view — even if you don't agree with it.\n\nFinally, look for a **compromise**: a solution where each side gives up a little, to reach an **agreement** both sides can live with.",
          },
          {
            type: "content",
            title: "What is **Empathy**?",
            subtitle: "Understanding the other side",
            body: "**Empathy** is the ability to understand and feel what another person is feeling, even if we're not in the same situation.\n\nWhen we ask ourselves \"how would I feel in their place?\" — it's easier to respond gently and with **mutual respect**.\n\nEmpathy doesn't mean always agreeing with the other person — it means understanding them, even when you think differently.",
          },
          {
            type: "content",
            title: "**Self-Calming** when angry",
            subtitle: "Before you react",
            body: "When we're angry, it's easy to say things we regret later.\n\n**Self-calming** can be something simple — counting to ten, taking a deep breath, or stepping away from the situation for a moment before reacting.\n\nOnly after calming down a bit is it easier to express feelings in words clearly and respectfully, instead of shouting.",
          },
          {
            type: "content",
            title: "Class discussion",
            subtitle: "Questions about the lesson",
            body: "Think of a small **conflict** you had with a friend or a sibling — how did you resolve it?\n\nWhat's the difference between listening \"just because\" and **active listening**?",
          },
          { type: "games", title: "Time to practice!", subtitle: "Games" },
          {
            type: "content",
            title: "End of lesson",
            subtitle: "Well done!",
            body: "Thanks for participating!",
          },
        ],
      },
    },

    safety: {
      id: "safety",
      name: "כישורי חיים - בטיחות ברשת",
      nameMain: "כישורי חיים",
      namePart: "בטיחות ברשת",
      subject: "lifeskills",
      grades: ["ag", "dv", "zh"],
      topic: "safety",
      gradeLabel: "כל הכיתות",
      duration: "30 דק'",
      summary: "לומדים איך לשמור על מידע אישי, לזהות סכנות ברשת, להתמודד עם בריונות ברשת, ולשמור על הרגלי מסך בריאים. עם משחק בסוף.",
      vocab: [
        { en: "אינטרנט", he: "רשת ענקית שמחברת מחשבים וטלפונים בכל העולם" },
        { en: "מידע אישי", he: "פרטים כמו שם מלא, כתובת או מספר טלפון שצריך לשמור בפרטיות" },
        { en: "סיסמה", he: "צירוף סודי של אותיות וספרות ששומר על חשבון בטוח" },
        { en: "פרטיות", he: "שמירה על מידע אישי מפני זרים" },
        { en: "זר מקוון", he: "אדם שלא באמת מכירים, גם אם מדברים איתו באינטרנט" },
        { en: "בריונות ברשת", he: "פגיעה או הטרדה של מישהו דרך האינטרנט" },
        { en: "הודעה חשודה", he: "הודעה שמנסה לגרום למישהו לעשות משהו לא בטוח" },
        { en: "דיווח", he: "פנייה למבוגר אחראי או לאתר על משהו לא תקין שקרה ברשת" },
        { en: "חסימה", he: "פעולה שמונעת מאדם מסוים ליצור קשר איתנו באינטרנט" },
        { en: "תוכן לא מתאים", he: "תמונות, סרטונים או טקסט שלא מתאימים לגיל שלנו" },
        { en: "אימות דו-שלבי", he: "שיטת אבטחה שדורשת שני שלבים כדי להיכנס לחשבון" },
        { en: "זמן מסך", he: "הזמן שמבלים מול מסכים כמו טלפון או מחשב" },
        { en: "מבוגר אחראי", he: "הורה, מורה או מבוגר אחר שאפשר לפנות אליו בבעיה" },
      ],
      games: STANDARD_LESSON_GAMES,
      slides: [
        {
          type: "content",
          title: "למה **בטיחות ברשת** חשובה?",
          subtitle: "פתיחה",
          body: "**האינטרנט** הוא כלי מדהים — אפשר ללמוד, לשחק ולדבר עם חברים דרכו. אבל בדיוק כמו בעולם האמיתי, צריך לדעת איך להישאר בטוחים בו.\n\nכמו שלא נותנים לזר ברחוב את הכתובת שלנו, כך גם ברשת חשוב לשמור על **מידע אישי**.\n\nהיום נלמד איך מזהים סכנות ברשת, ומה עושים כשמשהו לא מרגיש בסדר.",
        },
        {
          type: "content",
          title: "**מילים חשובות**",
          subtitle: "אוצר מושגים",
          body: "מידע אישי — פרטים כמו שם מלא, כתובת או טלפון שצריך לשמור בפרטיות.\n\nסיסמה — צירוף סודי של אותיות וספרות ששומר על חשבון בטוח.\n\nזר מקוון — אדם שלא באמת מכירים, גם אם מדברים איתו באינטרנט.\n\nדיווח — פנייה למבוגר אחראי על משהו לא תקין שקרה ברשת.",
        },
        {
          type: "content",
          title: "מה לא **משתפים** ברשת?",
          subtitle: "שומרים על מידע אישי",
          body: "**מידע אישי** כולל שם מלא, כתובת בית, מספר טלפון, שם בית ספר ותמונות פרטיות — כל אלה צריכים להישאר פרטיים.\n\nגם אם מישהו נחמד באינטרנט מבקש פרטים כאלה, לא חייבים לשתף — אפשר תמיד לשאול **מבוגר אחראי** לפני שעונים.\n\nחוק פשוט: אם לא הייתי אומר את זה לזר ברחוב, לא אומרים את זה גם ברשת.",
        },
        {
          type: "content",
          title: "**סיסמאות** חזקות ופרטיות",
          subtitle: "שומרים על החשבון בטוח",
          body: "**סיסמה** טובה משלבת אותיות, ספרות וסימנים, וקשה לזרים לנחש אותה.\n\nחשוב לא לשתף סיסמה עם אף אחד, חוץ מהורה או מבוגר אחראי בבית.\n\nכשאפשר, כדאי להפעיל **אימות דו-שלבי** — זה מוסיף שלב נוסף שמוודא שרק אנחנו נכנסים לחשבון שלנו.",
        },
        {
          type: "content",
          title: "**זרים** ברשת",
          subtitle: "להיזהר גם כשמכירים \"וירטואלית\"",
          body: "**זר מקוון** הוא אדם שמעולם לא פגשנו באמת, גם אם דיברנו איתו הרבה באינטרנט ונדמה לנו שאנחנו מכירים אותו.\n\nלפעמים אנשים ברשת לא באמת מי שהם אומרים שהם — לכן לעולם לא נפגשים עם מישהו שהכרנו רק באינטרנט בלי מבוגר.\n\nאם **הודעה חשודה** מבקשת פגישה, תמונות או מידע אישי — הצעד הראשון הוא לספר למבוגר אחראי.",
        },
        {
          type: "content",
          title: "מה זו **בריונות ברשת**?",
          subtitle: "לזהות ולהגיב נכון",
          body: "**בריונות ברשת** היא כשמישהו פוגע, מעליב או מטריד אדם אחר דרך הודעות, רשתות חברתיות או משחקים מקוונים.\n\nאם זה קורה לנו, לא עונים בכעס ולא ממשיכים את השיחה — במקום זה שומרים הוכחה (כמו צילום מסך) ומדווחים למבוגר אחראי.\n\nרוב האתרים והאפליקציות מאפשרים גם **חסימה** ו**דיווח** על משתמש שמתנהג לא יפה — זה בסדר גמור להשתמש בכלים האלה.",
        },
        {
          type: "content",
          title: "מתי **מדווחים** על משהו?",
          subtitle: "אם משהו לא מרגיש בסדר",
          body: "אם נתקלים ב**תוכן לא מתאים**, בהודעה מוזרה, או במשהו שגורם לתחושה לא נעימה — הכלל הוא תמיד אותו דבר: לספר למבוגר.\n\nאין שום דבר \"מביך\" בלדווח — זה בדיוק מה שאנשים אחראים ברשת עושים.\n\nככל שמדווחים ומדברים על זה מהר יותר, כך קל יותר לפתור את הבעיה.",
        },
        {
          type: "content",
          title: "הרגלים בריאים מול **מסך**",
          subtitle: "שימוש מאוזן",
          body: "**זמן מסך** הוא הזמן שמבלים מול טלפון, טאבלט או מחשב — וגם הוא צריך להיות מאוזן, בדיוק כמו כל דבר אחר.\n\nהפסקות מהמסך, משחק בחוץ ושינה טובה חשובים לא פחות מזמן המסך עצמו.\n\nכשמשלבים בטיחות ברשת עם הרגלי מסך בריאים — האינטרנט יכול להישאר מקום כיפי ובטוח.",
        },
        {
          type: "content",
          title: "דיון כיתתי",
          subtitle: "שאלות על השיעור",
          body: "אילו סוגי **מידע אישי** אסור לשתף ברשת, ולמה?\n\nמה הייתם עושים אם הייתם מקבלים **הודעה חשודה** ממישהו שאתם לא מכירים באמת?",
        },
        { type: "games", title: "זמן לתרגל!", subtitle: "משחקים" },
        {
          type: "content",
          title: "סוף השיעור",
          subtitle: "כל הכבוד!",
          body: "תודה על ההשתתפות!",
        },
      ],

      en: {
        name: "Life Skills - Online Safety",
        nameMain: "Life Skills",
        namePart: "Online Safety",
        summary: "Learn how to protect personal information, spot dangers online, deal with cyberbullying, and keep healthy screen habits. With a game at the end.",
        vocab: [
          { en: "Internet", he: "A giant network that connects computers and phones all over the world." },
          { en: "Personal information", he: "Details like full name, address, or phone number that should stay private." },
          { en: "Password", he: "A secret combination of letters and numbers that keeps an account safe." },
          { en: "Privacy", he: "Keeping personal information away from strangers." },
          { en: "Online stranger", he: "Someone you don't really know, even if you talk to them online." },
          { en: "Cyberbullying", he: "Hurting or harassing someone through the internet." },
          { en: "Suspicious message", he: "A message that tries to get someone to do something unsafe." },
          { en: "Reporting", he: "Telling a trusted adult or a website about something wrong that happened online." },
          { en: "Blocking", he: "An action that stops a certain person from contacting us online." },
          { en: "Inappropriate content", he: "Pictures, videos, or text that aren't suitable for our age." },
          { en: "Two-step verification", he: "A security method that requires two steps to log into an account." },
          { en: "Screen time", he: "The time spent in front of screens like a phone or computer." },
          { en: "Trusted adult", he: "A parent, teacher, or other adult you can turn to with a problem." },
        ],
        slides: [
          {
            type: "content",
            title: "Why is **Online Safety** important?",
            subtitle: "Opening",
            body: "The **internet** is an amazing tool — you can learn, play, and talk with friends through it. But just like in the real world, you need to know how to stay safe there.\n\nJust like you wouldn't give a stranger on the street your address, it's important to protect **personal information** online too.\n\nToday we'll learn how to spot dangers online, and what to do when something doesn't feel right.",
          },
          {
            type: "content",
            title: "**Important words**",
            subtitle: "Vocabulary",
            body: "Personal information — details like full name, address, or phone number that should stay private.\n\nPassword — a secret combination of letters and numbers that keeps an account safe.\n\nOnline stranger — someone you don't really know, even if you talk to them online.\n\nReporting — telling a trusted adult about something wrong that happened online.",
          },
          {
            type: "content",
            title: "What should you **not share** online?",
            subtitle: "Protecting personal information",
            body: "**Personal information** includes full name, home address, phone number, school name, and private photos — all of this should stay private.\n\nEven if someone nice online asks for details like these, you don't have to share them — you can always ask a **trusted adult** before answering.\n\nSimple rule: if you wouldn't tell it to a stranger on the street, don't say it online either.",
          },
          {
            type: "content",
            title: "Strong, Private **Passwords**",
            subtitle: "Keeping your account safe",
            body: "A good **password** mixes letters, numbers, and symbols, and is hard for strangers to guess.\n\nIt's important not to share a password with anyone, except a parent or trusted adult at home.\n\nWhen you can, it's worth turning on **two-step verification** — this adds an extra step that makes sure only you can log into your account.",
          },
          {
            type: "content",
            title: "**Strangers** Online",
            subtitle: "Careful even when it feels like you \"know\" them",
            body: "An **online stranger** is someone you've never really met, even if you've talked to them a lot online and it feels like you know them.\n\nSometimes people online aren't really who they say they are — so you should never meet up in person with someone you only met online, without an adult.\n\nIf a **suspicious message** asks to meet up, or asks for photos or personal information — the first step is to tell a trusted adult.",
          },
          {
            type: "content",
            title: "What is **Cyberbullying**?",
            subtitle: "Spotting it and responding right",
            body: "**Cyberbullying** is when someone hurts, insults, or harasses another person through messages, social media, or online games.\n\nIf it happens to you, don't respond in anger and don't keep the conversation going — instead, save proof (like a screenshot) and report it to a trusted adult.\n\nMost sites and apps also let you **block** and **report** a user who's behaving badly — it's completely okay to use these tools.",
          },
          {
            type: "content",
            title: "When do you **Report** something?",
            subtitle: "If something doesn't feel right",
            body: "If you come across **inappropriate content**, a strange message, or something that makes you feel uncomfortable — the rule is always the same: tell an adult.\n\nThere's nothing \"embarrassing\" about reporting — that's exactly what responsible people online do.\n\nThe faster you report and talk about it, the easier it is to solve the problem.",
          },
          {
            type: "content",
            title: "Healthy **Screen** Habits",
            subtitle: "Balanced use",
            body: "**Screen time** is the time spent on a phone, tablet, or computer — and it needs balance too, just like everything else.\n\nBreaks from screens, playing outside, and good sleep matter just as much as screen time itself.\n\nWhen you combine online safety with healthy screen habits, the internet can stay a fun and safe place.",
          },
          {
            type: "content",
            title: "Class discussion",
            subtitle: "Questions about the lesson",
            body: "What kinds of **personal information** should never be shared online, and why?\n\nWhat would you do if you got a **suspicious message** from someone you don't really know?",
          },
          { type: "games", title: "Time to practice!", subtitle: "Games" },
          {
            type: "content",
            title: "End of lesson",
            subtitle: "Well done!",
            body: "Thanks for participating!",
          },
        ],
      },
    },

    tsunami: {
      id: "tsunami",
      name: "פלאי הטבע - צונאמי",
      nameMain: "פלאי הטבע",
      namePart: "צונאמי",
      subject: "health",
      grades: ["ag", "dv", "zh"],
      topic: "tsunami",
      gradeLabel: "כל הכיתות",
      duration: "20 דק'",
      summary: "מכירים צונאמי מקרוב — איך גל ענק נוצר מרעידת אדמה מתחת לים, ואיך אנשים נשארים בטוחים כשהוא מגיע. עם משחק בסוף.",
      vocab: [
        { en: "צונאמי", he: "גל ענק וחזק באוקיינוס שנוצר בדרך כלל מרעידת אדמה בקרקעית הים" },
        { en: "רעידת אדמה ימית", he: "רעידת אדמה שקורית מתחת לקרקעית האוקיינוס" },
        { en: "לוחות טקטוניים", he: "חלקים ענקיים של קרום כדור הארץ שזזים לאט לאט" },
        { en: "אזעקת צונאמי", he: "אות אזהרה שמודיע לאנשים להתרחק מהחוף ולעלות לגובה" },
        { en: "פינוי", he: "יציאה מהירה ומאורגנת ממקום מסוכן לביטחון" },
        { en: "אנרגיה", he: "כוח שהצונאמי נושא איתו ממרחק גדול באוקיינוס" },
        { en: "חוף", he: "האזור שבו היבשה נפגשת עם הים" },
        { en: "מים רדודים", he: "מים לא עמוקים ליד החוף, שם הגל נהיה גבוה יותר" },
        { en: "מערכת התרעה מוקדמת", he: "מערכת שמזהה רעידות אדמה ימיות ומזהירה תושבים לפני שהצונאמי מגיע" },
        { en: "סייסמולוג", he: "מדען שחוקר רעידות אדמה וצונאמי" },
      ],
      games: STANDARD_LESSON_GAMES,
      slides: [
        {
          type: "content",
          title: "מה זה **צונאמי**?",
          subtitle: "פתיחה",
          body: "**צונאמי** הוא גל ענק וחזק שנוצר באוקיינוס, בדרך כלל בעקבות רעידת אדמה מתחת לים.\n\nבניגוד לגלים רגילים שרואים בים, צונאמי יכול לנסוע מהר מאוד ולהגיע לחופים במרחק של אלפי קילומטרים.\n\nהיום נלמד איך צונאמי נוצר, למה הוא כל כך מסוכן, ואיך אנשים נשארים בטוחים כשהוא מגיע.",
        },
        {
          type: "content",
          title: "**מילים חשובות**",
          subtitle: "אוצר מושגים",
          body: "**רעידת אדמה ימית** — רעידת אדמה שקורית מתחת לקרקעית האוקיינוס, לרוב הגורם העיקרי לצונאמי.\n\n**לוחות טקטוניים** — חלקים ענקיים של קרום כדור הארץ שזזים לאט לאט ולפעמים מתנגשים.\n\n**אזעקת צונאמי** — אות אזהרה שמודיע לאנשים להתרחק מהחוף ולעלות לגובה.",
        },
        {
          type: "content",
          title: "איך **צונאמי** נוצר?",
          subtitle: "מתחת לפני הים",
          body: "עמוק באוקיינוס יש **לוחות טקטוניים** ענקיים שנעים לאט. כשהם מתנגשים או נשברים בפתאומיות, נוצרת **רעידת אדמה ימית**.\n\nהזעזוע הפתאומי דוחף כמות עצומה של מים כלפי מעלה, ויוצר סדרה של גלים שמתפשטים לכל הכיוונים — זהו הצונאמי.\n\nבלב האוקיינוס הגלים האלה יכולים להיות נמוכים ומהירים מאוד, אבל כשהם מתקרבים ל**מים רדודים** ליד החוף הם מאטים ומתגבהים בענק.",
        },
        {
          type: "content",
          title: "מה קורה **כשהצונאמי מגיע**?",
          subtitle: "בהתקרבות לחוף",
          body: "כשהצונאמי מתקרב ל**חוף**, לפעמים המים בים נסוגים אחורה בפתאומיות וחושפים את קרקעית הים — זהו סימן אזהרה חשוב.\n\nדקות אחר כך מגיע הגל עצמו, שיכול להיות גבוה כמו בניין ולנוע ביבשה למרחק גדול.\n\nה**אנרגיה** שהצונאמי נושא איתו יכולה לנסוע אלפי קילומטרים באוקיינוס מבלי לאבד הרבה מכוחה.",
        },
        {
          type: "content",
          title: "עובדה מרתקת",
          subtitle: "עובדה מרתקת",
          body: "צונאמי יכול לנוע באוקיינוס הפתוח במהירות של מטוס נוסעים — מעל 700 קילומטרים בשעה!\n\nלמרות זאת, בלב הים הגל כמעט ולא מורגש, כי הוא נמוך ורחב מאוד — הסכנה האמיתית מתחילה רק כשהוא מגיע ל**מים רדודים** ליד החוף.",
        },
        {
          type: "content",
          title: "איך **נשארים בטוחים**?",
          subtitle: "בטיחות",
          body: "כשיש **אזעקת צונאמי**, הכלל הראשון הוא לזוז לגובה ולהתרחק מהחוף מהר ככל האפשר, ולא לחכות לראות את הגל.\n\nאם רואים את המים נסוגים בפתאומיות מהחוף, זה סימן לברוח מיד — לא ללכת לבדוק מקרוב.\n\nבאזורים רבים בעולם יש היום **מערכת התרעה מוקדמת** שמזהה רעידות אדמה ימיות ומזהירה תושבים לפני שהצונאמי מגיע.",
        },
        {
          type: "content",
          title: "דיון כיתתי",
          subtitle: "שאלות על השיעור",
          body: "אם הייתם בחוף וראיתם את המים נסוגים בפתאומיות אחורה, מה הייתם עושים?\n\nלמה חשוב שיהיו מערכות התרעה מוקדמת לצונאמי, גם אם הן לא תמיד מדויקות ב-100%?",
        },
        { type: "games", title: "זמן לתרגל!", subtitle: "משחקים" },
        {
          type: "content",
          title: "סוף השיעור",
          subtitle: "כל הכבוד!",
          body: "תודה על ההשתתפות!",
        },
      ],

      en: {
        name: "Wonders of Nature - Tsunami",
        nameMain: "Wonders of Nature",
        namePart: "Tsunami",
        summary: "Get to know tsunamis up close — how a huge wave forms from an earthquake under the sea, and how people stay safe when it arrives. With a game at the end.",
        vocab: [
          { en: "Tsunami", he: "A huge, powerful ocean wave usually caused by an earthquake on the sea floor." },
          { en: "Undersea earthquake", he: "An earthquake that happens beneath the ocean floor." },
          { en: "Tectonic plates", he: "Giant pieces of the Earth's crust that move very slowly." },
          { en: "Tsunami warning", he: "An alert signal that tells people to move away from the coast and go to higher ground." },
          { en: "Evacuation", he: "Leaving a dangerous place quickly and in an organized way, to safety." },
          { en: "Energy", he: "The power a tsunami carries over a huge distance across the ocean." },
          { en: "Coast", he: "The area where land meets the sea." },
          { en: "Shallow water", he: "Water that isn't deep, near the coast, where the wave grows taller." },
          { en: "Early warning system", he: "A system that detects undersea earthquakes and warns residents before a tsunami arrives." },
          { en: "Seismologist", he: "A scientist who studies earthquakes and tsunamis." },
        ],
        slides: [
          {
            type: "content",
            title: "What is a **Tsunami**?",
            subtitle: "Opening",
            body: "A **tsunami** is a huge, powerful wave that forms in the ocean, usually following an earthquake under the sea.\n\nUnlike regular waves you see at the beach, a tsunami can travel very fast and reach coasts thousands of kilometers away.\n\nToday we'll learn how a tsunami forms, why it's so dangerous, and how people stay safe when it arrives.",
          },
          {
            type: "content",
            title: "**Important words**",
            subtitle: "Vocabulary",
            body: "**Undersea earthquake** — an earthquake that happens beneath the ocean floor, usually the main cause of a tsunami.\n\n**Tectonic plates** — giant pieces of the Earth's crust that move very slowly and sometimes collide.\n\n**Tsunami warning** — an alert signal that tells people to move away from the coast and go to higher ground.",
          },
          {
            type: "content",
            title: "How does a **Tsunami** form?",
            subtitle: "Beneath the sea surface",
            body: "Deep in the ocean there are huge **tectonic plates** that move slowly. When they suddenly collide or break, an **undersea earthquake** happens.\n\nThe sudden shock pushes a massive amount of water upward, creating a series of waves that spread out in every direction — that's the tsunami.\n\nIn the middle of the ocean these waves can be low and very fast, but as they approach **shallow water** near the coast, they slow down and grow to a huge height.",
          },
          {
            type: "content",
            title: "What happens **when the tsunami arrives**?",
            subtitle: "Approaching the coast",
            body: "As a tsunami nears the **coast**, sometimes the sea suddenly pulls back and exposes the ocean floor — this is an important warning sign.\n\nMinutes later the wave itself arrives, which can be as tall as a building and travel far inland.\n\nThe **energy** a tsunami carries can travel thousands of kilometers across the ocean without losing much of its power.",
          },
          {
            type: "content",
            title: "Fun fact",
            subtitle: "Fun fact",
            body: "A tsunami can travel across the open ocean at the speed of a passenger jet — over 700 kilometers per hour!\n\nEven so, out in the deep sea the wave is barely noticeable, because it's so low and wide — the real danger only begins once it reaches **shallow water** near the coast.",
          },
          {
            type: "content",
            title: "How do people **stay safe**?",
            subtitle: "Safety",
            body: "When there's a **tsunami warning**, the first rule is to move to higher ground and away from the coast as fast as possible, without waiting to see the wave.\n\nIf you see the water suddenly pull back from the shore, that's a sign to run immediately — not to go look up close.\n\nMany places around the world now have an **early warning system** that detects undersea earthquakes and warns residents before a tsunami arrives.",
          },
          {
            type: "content",
            title: "Class discussion",
            subtitle: "Questions about the lesson",
            body: "If you were at the beach and saw the water suddenly pull back, what would you do?\n\nWhy is it important to have early warning systems for tsunamis, even if they're not always 100% accurate?",
          },
          { type: "games", title: "Time to practice!", subtitle: "Games" },
          {
            type: "content",
            title: "End of lesson",
            subtitle: "Well done!",
            body: "Thanks for participating!",
          },
        ],
      },
    },

    earthquake: {
      id: "earthquake",
      name: "פלאי הטבע - רעידת אדמה",
      nameMain: "פלאי הטבע",
      namePart: "רעידת אדמה",
      subject: "health",
      grades: ["ag", "dv", "zh"],
      topic: "earthquake",
      gradeLabel: "כל הכיתות",
      duration: "20 דק'",
      summary: "מכירים רעידת אדמה מקרוב — למה כדור הארץ רועד, איך מודדים רעידות, ואיך שומרים על בטיחות כשהאדמה זזה. עם משחק בסוף.",
      vocab: [
        { en: "רעידת אדמה", he: "זעזוע פתאומי בקרקע שנגרם מתנועה עמוק באדמה" },
        { en: "קרום כדור הארץ", he: "השכבה החיצונית והמוצקה שעליה אנחנו חיים" },
        { en: "לוחות טקטוניים", he: "חלקים ענקיים מהקרום שנעים לאט לאט כל הזמן" },
        { en: "שבר", he: "קו בקרום כדור הארץ שבו שני לוחות נפגשים ועלולים להחליק" },
        { en: "מוקד", he: "הנקודה עמוק באדמה שבה מתחילה רעידת האדמה" },
        { en: "גלי רעד", he: "גלי אנרגיה שנעים מהמוקד ומרעידים את הקרקע סביב" },
        { en: "סייסמוגרף", he: "מכשיר שמודד ומצייר את הרעד של רעידת אדמה" },
        { en: "עוצמה", he: "מספר שמראה כמה חזקה הייתה רעידת האדמה" },
        { en: "רעידת משנה", he: "רעידה קטנה יותר שקורית אחרי הרעידה העיקרית" },
        { en: "סייסמולוג", he: "מדען שחוקר רעידות אדמה" },
      ],
      games: STANDARD_LESSON_GAMES,
      slides: [
        {
          type: "content",
          title: "מה זו **רעידת אדמה**?",
          subtitle: "פתיחה",
          body: "**רעידת אדמה** היא זעזוע פתאומי של הקרקע שמתחת לרגליים שלנו.\n\nהיא קורית כשמשהו זז עמוק בתוך כדור הארץ, הרבה מתחת לפני השטח שאנחנו רואים.\n\nהיום נלמד למה זה קורה, איך מדענים מודדים רעידות אדמה, ואיך נשארים בטוחים כשהאדמה זזה.",
        },
        {
          type: "content",
          title: "**מילים חשובות**",
          subtitle: "אוצר מושגים",
          body: "**לוחות טקטוניים** — חלקים ענקיים מקרום כדור הארץ שנעים לאט לאט כל הזמן.\n\n**שבר** — קו בקרום שבו שני לוחות נפגשים ועלולים להחליק זה על זה.\n\n**מוקד** — הנקודה עמוק באדמה שבה מתחילה רעידת האדמה.\n\n**סייסמוגרף** — מכשיר שמודד ומצייר את הרעד.",
        },
        {
          type: "content",
          title: "איך **רעידת אדמה** קורית?",
          subtitle: "מתחת לקרקע",
          body: "כדור הארץ מכוסה ב**לוחות טקטוניים** ענקיים שנעים לאט מאוד — לפעמים רק כמה סנטימטרים בשנה.\n\nכשהלוחות נתקעים אחד בשני ליד **שבר**, נבנה לחץ עצום עם הזמן. כשהלחץ גדול מדי, הלוחות מחליקים בפתאומיות.\n\nההחלקה הפתאומית הזו משחררת אנרגיה ענקית שנעה כ**גלי רעד** מה**מוקד** ומרעידה את הקרקע סביב.",
        },
        {
          type: "content",
          title: "כמה **חזקה** רעידת האדמה?",
          subtitle: "מודדים את הרעד",
          body: "מדענים משתמשים ב**סייסמוגרף** כדי לרשום את הרעד ולחשב את ה**עוצמה** של רעידת האדמה.\n\nרעידות קטנות קורות כל הזמן ורוב האנשים לא מרגישים אותן, אבל רעידות חזקות מאוד יכולות לזעזע בניינים וכבישים.\n\nלפעמים אחרי הרעידה הראשית מגיעות **רעידות משנה** — רעידות קטנות יותר שממשיכות כמה שעות או ימים אחר כך.",
        },
        {
          type: "content",
          title: "עובדה מרתקת",
          subtitle: "עובדה מרתקת",
          body: "בכל יום קורות בעולם אלפי רעידות אדמה קטנות — רובן כל כך חלשות שאף אחד לא מרגיש אותן.\n\nיפן, שנמצאת על כמה שברים גדולים, חווה יותר רעידות אדמה מכל מדינה אחרת בעולם, ולכן הבניינים שם נבנים במיוחד כדי לעמוד ברעידות.",
        },
        {
          type: "content",
          title: "איך **נשארים בטוחים**?",
          subtitle: "בטיחות",
          body: "כשמרגישים רעידת אדמה, הכלל הוא: **לרדת, להתכסות ולהחזיק** — לרדת לרצפה, להתכסות מתחת לשולחן יציב, ולהחזיק בו עד שהרעד נגמר.\n\nחשוב להתרחק מחלונות, מדפים גבוהים ורהיטים שעלולים ליפול.\n\nמשפחות רבות באזורים שבהם יש רעידות אדמה מכינות מראש ערכת חירום עם מים, פנס ותרופות ראשונות.",
        },
        {
          type: "content",
          title: "דיון כיתתי",
          subtitle: "שאלות על השיעור",
          body: "אם הייתם מרגישים רעידת אדמה עכשיו בכיתה, לאן הייתם הולכים כדי להיות הכי בטוחים?\n\nלמה חשוב שמשפחות באזורי רעידות אדמה יכינו מראש ערכת חירום?",
        },
        { type: "games", title: "זמן לתרגל!", subtitle: "משחקים" },
        {
          type: "content",
          title: "סוף השיעור",
          subtitle: "כל הכבוד!",
          body: "תודה על ההשתתפות!",
        },
      ],

      en: {
        name: "Wonders of Nature - Earthquake",
        nameMain: "Wonders of Nature",
        namePart: "Earthquake",
        summary: "Get to know earthquakes up close — why the Earth shakes, how scientists measure them, and how to stay safe when the ground moves. With a game at the end.",
        vocab: [
          { en: "Earthquake", he: "A sudden shaking of the ground caused by movement deep underground." },
          { en: "Earth's crust", he: "The solid outer layer of the Earth that we live on." },
          { en: "Tectonic plates", he: "Giant pieces of the crust that move very slowly all the time." },
          { en: "Fault", he: "A line in the Earth's crust where two plates meet and can slip." },
          { en: "Focus", he: "The point deep underground where an earthquake begins." },
          { en: "Seismic waves", he: "Waves of energy that travel out from the focus and shake the ground around it." },
          { en: "Seismograph", he: "A device that measures and records the shaking of an earthquake." },
          { en: "Magnitude", he: "A number that shows how strong an earthquake was." },
          { en: "Aftershock", he: "A smaller quake that happens after the main earthquake." },
          { en: "Seismologist", he: "A scientist who studies earthquakes." },
        ],
        slides: [
          {
            type: "content",
            title: "What is an **Earthquake**?",
            subtitle: "Opening",
            body: "An **earthquake** is a sudden shaking of the ground beneath our feet.\n\nIt happens when something moves deep inside the Earth, far below the surface we see.\n\nToday we'll learn why this happens, how scientists measure earthquakes, and how to stay safe when the ground shakes.",
          },
          {
            type: "content",
            title: "**Important words**",
            subtitle: "Vocabulary",
            body: "**Tectonic plates** — giant pieces of the Earth's crust that move very slowly all the time.\n\n**Fault** — a line in the crust where two plates meet and can slip against each other.\n\n**Focus** — the point deep underground where an earthquake begins.\n\n**Seismograph** — a device that measures and records the shaking.",
          },
          {
            type: "content",
            title: "How does an **Earthquake** happen?",
            subtitle: "Beneath the ground",
            body: "The Earth is covered by huge **tectonic plates** that move very slowly — sometimes just a few centimeters a year.\n\nWhen plates get stuck against each other near a **fault**, huge pressure builds up over time. When the pressure gets too strong, the plates suddenly slip.\n\nThat sudden slip releases enormous energy that travels as **seismic waves** from the **focus** and shakes the ground around it.",
          },
          {
            type: "content",
            title: "How **strong** is an earthquake?",
            subtitle: "Measuring the shake",
            body: "Scientists use a **seismograph** to record the shaking and calculate the **magnitude** of an earthquake.\n\nSmall earthquakes happen all the time and most people don't feel them, but very strong ones can shake buildings and roads.\n\nSometimes after the main quake, **aftershocks** arrive — smaller quakes that continue for hours or days afterward.",
          },
          {
            type: "content",
            title: "Fun fact",
            subtitle: "Fun fact",
            body: "Every day, thousands of small earthquakes happen around the world — most so weak that nobody feels them.\n\nJapan, which sits on several major faults, experiences more earthquakes than any other country in the world, so its buildings are specially built to withstand shaking.",
          },
          {
            type: "content",
            title: "How do you **stay safe**?",
            subtitle: "Safety",
            body: "When you feel an earthquake, the rule is: **drop, cover, and hold on** — drop to the floor, cover yourself under a sturdy table, and hold on until the shaking stops.\n\nIt's important to stay away from windows, tall shelves, and furniture that could fall.\n\nMany families in earthquake areas prepare an emergency kit in advance with water, a flashlight, and first-aid supplies.",
          },
          {
            type: "content",
            title: "Class discussion",
            subtitle: "Questions about the lesson",
            body: "If you felt an earthquake right now in class, where would you go to be the safest?\n\nWhy is it important for families in earthquake areas to prepare an emergency kit in advance?",
          },
          { type: "games", title: "Time to practice!", subtitle: "Games" },
          {
            type: "content",
            title: "End of lesson",
            subtitle: "Well done!",
            body: "Thanks for participating!",
          },
        ],
      },
    },

    hurricane: {
      id: "hurricane",
      name: "פלאי הטבע - הוריקן",
      nameMain: "פלאי הטבע",
      namePart: "הוריקן",
      subject: "health",
      grades: ["ag", "dv", "zh"],
      topic: "hurricane",
      gradeLabel: "כל הכיתות",
      duration: "20 דק'",
      summary: "מכירים הוריקן מקרוב — איך סופה ענקית נבנית מעל האוקיינוס, מה זו עין הסופה, ואיך אנשים מתכוננים אליה. עם משחק בסוף.",
      vocab: [
        { en: "הוריקן", he: "סופה ענקית וחזקה עם רוחות סוערות וגשם עז שנוצרת מעל מים חמים" },
        { en: "סופה טרופית", he: "סופה שמתחילה להתחזק מעל אוקיינוס חם ועלולה להפוך להוריקן" },
        { en: "עין הסופה", he: "האזור השקט במרכז ההוריקן" },
        { en: "קיר העין", he: "הטבעת שמסביב לעין, שם הרוחות הכי חזקות" },
        { en: "אדים", he: "מים חמים שהופכים לגז ועולים לאוויר ומזינים את הסופה" },
        { en: "קטגוריה", he: "מספר שמראה כמה חזקה הסופה, לפי מהירות הרוח" },
        { en: "גאות סערה", he: "עליית מפלס הים לכיוון החוף בזמן הוריקן" },
        { en: "פינוי", he: "יציאה מסודרת מאזור מסוכן לפני שהסופה מגיעה" },
        { en: "מרכז הוריקנים", he: "מקום שבו מדענים עוקבים אחרי הוריקנים ומזהירים מפניהם" },
        { en: "עונת הוריקנים", he: "תקופת השנה שבה יש הכי הרבה הוריקנים" },
      ],
      games: STANDARD_LESSON_GAMES,
      slides: [
        {
          type: "content",
          title: "מה זה **הוריקן**?",
          subtitle: "פתיחה",
          body: "**הוריקן** הוא סופה ענקית וחזקה שנוצרת מעל מים חמים באוקיינוס, עם רוחות סוערות וגשם עז.\n\nהוריקן יכול להיות רחב כמו מדינה שלמה ולנוע לאיטו במשך ימים לפני שהוא מגיע ליבשה.\n\nהיום נלמד איך הוריקן נבנה, מה זו **עין הסופה**, ואיך אנשים מתכוננים אליו.",
        },
        {
          type: "content",
          title: "**מילים חשובות**",
          subtitle: "אוצר מושגים",
          body: "**עין הסופה** — האזור השקט במרכז ההוריקן.\n\n**קיר העין** — הטבעת שמסביב לעין, שם הרוחות הכי חזקות.\n\n**אדים** — מים חמים שהופכים לגז ועולים לאוויר ומזינים את הסופה.\n\n**קטגוריה** — מספר שמראה כמה חזקה הסופה.",
        },
        {
          type: "content",
          title: "איך **הוריקן** נבנה?",
          subtitle: "מעל האוקיינוס",
          body: "כשמים באוקיינוס חמים מאוד, הם הופכים ל**אדים** שעולים לאוויר ויוצרים עננים גדולים.\n\nהאוויר החם עולה מהר, ואוויר קר יותר נכנס למלא את מקומו — כך נוצרת תנועה מסתובבת ענקית.\n\nככל שהסופה אוספת יותר חום ואנרגיה מהמים, הרוחות מתחזקות והיא הופכת מ**סופה טרופית** ל**הוריקן**.",
        },
        {
          type: "content",
          title: "מה יש **בתוך** הוריקן?",
          subtitle: "עין הסופה",
          body: "במרכז ההוריקן יש **עין הסופה** — אזור שקט ובהיר שבו כמעט אין רוח או גשם.\n\nמסביב לעין נמצא ה**קיר העין**, שם נמצאות הרוחות הכי חזקות והגשם הכי עז בכל הסופה.\n\nכשההוריקן מגיע ליבשה, הוא יכול לגרום גם ל**גאות סערה** — עלייה גדולה במפלס הים שמציפה את החוף.",
        },
        {
          type: "content",
          title: "עובדה מרתקת",
          subtitle: "עובדה מרתקת",
          body: "הוריקן יכול להיות רחב יותר מ-1,000 קילומטרים — כמעט כמו מדינה שלמה!\n\nלמרות שהוא נראה כמו כדור מסתובב מהחלל, בתוכו יש כמות אנרגיה עצומה — כל זה מגיע רק מחום המים באוקיינוס.",
        },
        {
          type: "content",
          title: "איך **מתכוננים** להוריקן?",
          subtitle: "בטיחות",
          body: "מדענים ב**מרכז הוריקנים** עוקבים אחרי הסופות מהחלל ומהאוויר, ומזהירים תושבים ימים מראש לפני שההוריקן מגיע.\n\nכשמכריזים על **פינוי**, חשוב לעזוב את האזור המסוכן מהר ולפי ההוראות, ולא לחכות לראות את הסופה מקרוב.\n\nמשפחות באזורי הוריקנים מכינות מראש ערכת חירום עם מים, אוכל ופנסים, וסוגרות את החלונות בלוחות מיוחדים.",
        },
        {
          type: "content",
          title: "דיון כיתתי",
          subtitle: "שאלות על השיעור",
          body: "למה חשוב לעזוב אזור מסוכן מיד כשמכריזים על פינוי, גם אם ההוריקן עוד לא הגיע?\n\nמה מכל מה שלמדנו על הוריקנים הפתיע אתכם הכי הרבה?",
        },
        { type: "games", title: "זמן לתרגל!", subtitle: "משחקים" },
        {
          type: "content",
          title: "סוף השיעור",
          subtitle: "כל הכבוד!",
          body: "תודה על ההשתתפות!",
        },
      ],

      en: {
        name: "Wonders of Nature - Hurricane",
        nameMain: "Wonders of Nature",
        namePart: "Hurricane",
        summary: "Get to know hurricanes up close — how a giant storm builds over the ocean, what the eye of the storm is, and how people prepare for it. With a game at the end.",
        vocab: [
          { en: "Hurricane", he: "A huge, powerful storm with fierce winds and heavy rain that forms over warm ocean water." },
          { en: "Tropical storm", he: "A storm that starts growing stronger over a warm ocean and might turn into a hurricane." },
          { en: "Eye of the storm", he: "The calm area at the center of a hurricane." },
          { en: "Eyewall", he: "The ring around the eye, where the winds are the strongest." },
          { en: "Water vapor", he: "Warm water that turns into gas and rises into the air, feeding the storm." },
          { en: "Category", he: "A number that shows how strong a storm is, based on wind speed." },
          { en: "Storm surge", he: "A rise in sea level toward the coast during a hurricane." },
          { en: "Evacuation", he: "Leaving a dangerous area in an organized way before a storm arrives." },
          { en: "Hurricane center", he: "A place where scientists track hurricanes and warn people about them." },
          { en: "Hurricane season", he: "The time of year with the most hurricanes." },
        ],
        slides: [
          {
            type: "content",
            title: "What is a **Hurricane**?",
            subtitle: "Opening",
            body: "A **hurricane** is a huge, powerful storm that forms over warm ocean water, with fierce winds and heavy rain.\n\nA hurricane can be as wide as an entire country and move slowly for days before it reaches land.\n\nToday we'll learn how a hurricane builds, what the **eye of the storm** is, and how people prepare for it.",
          },
          {
            type: "content",
            title: "**Important words**",
            subtitle: "Vocabulary",
            body: "**Eye of the storm** — the calm area at the center of a hurricane.\n\n**Eyewall** — the ring around the eye, where the winds are strongest.\n\n**Water vapor** — warm water that turns into gas and rises into the air, feeding the storm.\n\n**Category** — a number that shows how strong the storm is.",
          },
          {
            type: "content",
            title: "How does a **Hurricane** build?",
            subtitle: "Over the ocean",
            body: "When ocean water is very warm, it turns into **water vapor** that rises into the air and forms big clouds.\n\nThe warm air rises quickly, and cooler air rushes in to take its place — creating a giant spinning motion.\n\nAs the storm gathers more heat and energy from the water, the winds get stronger and it grows from a **tropical storm** into a **hurricane**.",
          },
          {
            type: "content",
            title: "What's **inside** a hurricane?",
            subtitle: "The eye of the storm",
            body: "At the center of a hurricane is the **eye of the storm** — a calm, clear area with almost no wind or rain.\n\nAround the eye is the **eyewall**, where the strongest winds and heaviest rain in the whole storm are found.\n\nWhen a hurricane reaches land, it can also cause a **storm surge** — a huge rise in sea level that floods the coast.",
          },
          {
            type: "content",
            title: "Fun fact",
            subtitle: "Fun fact",
            body: "A hurricane can be wider than 1,000 kilometers — almost like an entire country!\n\nEven though it looks like a spinning ball from space, it holds a massive amount of energy — all of it coming from the heat of the ocean water.",
          },
          {
            type: "content",
            title: "How do people **prepare** for a hurricane?",
            subtitle: "Safety",
            body: "Scientists at the **hurricane center** track storms from space and the air, warning residents days before a hurricane arrives.\n\nWhen an **evacuation** is announced, it's important to leave the dangerous area quickly and follow instructions, instead of waiting to see the storm up close.\n\nFamilies in hurricane areas prepare an emergency kit in advance with water, food, and flashlights, and cover their windows with special boards.",
          },
          {
            type: "content",
            title: "Class discussion",
            subtitle: "Questions about the lesson",
            body: "Why is it important to leave a dangerous area right away when an evacuation is announced, even if the hurricane hasn't arrived yet?\n\nWhat surprised you the most about everything we learned about hurricanes?",
          },
          { type: "games", title: "Time to practice!", subtitle: "Games" },
          {
            type: "content",
            title: "End of lesson",
            subtitle: "Well done!",
            body: "Thanks for participating!",
          },
        ],
      },
    },

    tornado: {
      id: "tornado",
      name: "פלאי הטבע - טורנדו",
      nameMain: "פלאי הטבע",
      namePart: "טורנדו",
      subject: "health",
      grades: ["ag", "dv", "zh"],
      topic: "tornado",
      gradeLabel: "כל הכיתות",
      duration: "20 דק'",
      summary: "מכירים טורנדו מקרוב — איך משפך ענן מסתובב נוצר מתוך סופת רעמים, ואיך אנשים נשארים בטוחים כשהוא מגיע. עם משחק בסוף.",
      vocab: [
        { en: "טורנדו", he: "עמוד אוויר מסתובב במהירות גבוהה שנוגע באדמה" },
        { en: "משפך ענן", he: "הצורה שנראית כמו משפך שיורדת מהעננים לפני שטורנדו נוגע באדמה" },
        { en: "סופת רעמים", he: "סופה עם רעמים, ברקים וגשם עז שממנה נוצרים לעיתים טורנדו" },
        { en: "אוויר חם ואוויר קר", he: "שתי מסות אוויר שונות שכאשר נפגשות יוצרות תנאים לסופה" },
        { en: "מהירות רוח", he: "המהירות שבה הרוח נעה בתוך הטורנדו" },
        { en: "אזעקת טורנדו", he: "אות אזהרה שמודיע לאנשים למצוא מחסה מיד" },
        { en: "מרתף מקלט", he: "חדר נמוך ובטוח שאפשר להתחבא בו בזמן טורנדו" },
        { en: "ציידי סופות", he: "אנשים שעוקבים אחרי טורנדו כדי ללמוד עליו ולהזהיר אחרים" },
        { en: "מסלול הרס", he: "השביל שבו הטורנדו עובר ומשאיר נזק אחריו" },
      ],
      games: STANDARD_LESSON_GAMES,
      slides: [
        {
          type: "content",
          title: "מה זה **טורנדו**?",
          subtitle: "פתיחה",
          body: "**טורנדו** הוא עמוד אוויר מסתובב במהירות גבוהה מאוד שנוגע באדמה ויכול לגרום נזק גדול תוך דקות ספורות.\n\nהוא נראה כמו **משפך ענן** שיורד מהשמיים אל הקרקע, ולרוב נוצר מתוך סופת רעמים חזקה.\n\nהיום נלמד איך טורנדו נוצר, ואיך אנשים נשארים בטוחים כשהוא מתקרב.",
        },
        {
          type: "content",
          title: "**מילים חשובות**",
          subtitle: "אוצר מושגים",
          body: "**משפך ענן** — הצורה שנראית כמו משפך היורדת מהעננים לפני שהטורנדו נוגע באדמה.\n\n**סופת רעמים** — סופה עם רעמים, ברקים וגשם עז שממנה נוצרים לפעמים טורנדו.\n\n**אזעקת טורנדו** — אות אזהרה שמודיע לאנשים למצוא מחסה מיד.",
        },
        {
          type: "content",
          title: "איך **טורנדו** נוצר?",
          subtitle: "בתוך סופת הרעמים",
          body: "טורנדו מתחיל להיווצר כש**אוויר חם** ולח נפגש עם **אוויר קר** ויבש בתוך **סופת רעמים** חזקה.\n\nהמפגש בין האוויר החם לקר יוצר תנועה מסתובבת בתוך הענן.\n\nכשהסיבוב הזה מתחזק ויורד עד לקרקע, נוצר עמוד אוויר מסתובב במהירות עצומה — זהו הטורנדו.",
        },
        {
          type: "content",
          title: "כמה **חזק** טורנדו יכול להיות?",
          subtitle: "כוח הרוח",
          body: "**מהירות הרוח** בתוך טורנדו יכולה להגיע ליותר מ-300 קילומטרים בשעה — מהר בהרבה מהרוח החזקה ביותר בהוריקן.\n\nרוח כזו יכולה להרים מכוניות, לעקור עצים ולהרוס בתים תוך שניות ספורות.\n\nהטורנדו נע לאורך **מסלול הרס** שיכול להיות קצר או להימשך כמה קילומטרים.",
        },
        {
          type: "content",
          title: "עובדה מרתקת",
          subtitle: "עובדה מרתקת",
          body: "רוב הטורנדו בעולם קורים באזור בארצות הברית שנקרא \"שדרת הטורנדו\", בגלל שם נפגש אוויר חם וקר בתדירות גבוהה.\n\n**ציידי סופות** הם אנשים שנוסעים במיוחד כדי לצלם ולחקור טורנדו — עבודה מרגשת אבל גם מסוכנת מאוד.",
        },
        {
          type: "content",
          title: "איך **נשארים בטוחים**?",
          subtitle: "בטיחות",
          body: "כששומעים **אזעקת טורנדו**, הכלל הוא למצוא מחסה מיד — הכי טוב ב**מרתף מקלט** או בחדר פנימי ללא חלונות.\n\nאם נמצאים בחוץ ואין מחסה, עדיף לשכב במקום נמוך ולהתרחק מעצים ומכוניות.\n\nחשוב אף פעם לא לנסות לראות טורנדו מקרוב — הוא יכול לשנות כיוון ומהירות בפתאומיות.",
        },
        {
          type: "content",
          title: "דיון כיתתי",
          subtitle: "שאלות על השיעור",
          body: "אם הייתם בבית ושומעים אזעקת טורנדו, לאיזה חדר בבית הייתם הולכים ולמה?\n\nמה ההבדל בין סופת רעמים רגילה לבין סופת רעמים שיוצרת טורנדו?",
        },
        { type: "games", title: "זמן לתרגל!", subtitle: "משחקים" },
        {
          type: "content",
          title: "סוף השיעור",
          subtitle: "כל הכבוד!",
          body: "תודה על ההשתתפות!",
        },
      ],

      en: {
        name: "Wonders of Nature - Tornado",
        nameMain: "Wonders of Nature",
        namePart: "Tornado",
        summary: "Get to know tornadoes up close — how a spinning funnel cloud forms out of a thunderstorm, and how people stay safe when it arrives. With a game at the end.",
        vocab: [
          { en: "Tornado", he: "A column of air spinning at very high speed that touches the ground." },
          { en: "Funnel cloud", he: "The funnel-shaped form that drops from the clouds before a tornado touches the ground." },
          { en: "Thunderstorm", he: "A storm with thunder, lightning, and heavy rain that sometimes produces tornadoes." },
          { en: "Warm air and cold air", he: "Two different air masses that create storm conditions when they meet." },
          { en: "Wind speed", he: "How fast the wind moves inside a tornado." },
          { en: "Tornado warning", he: "An alert signal that tells people to find shelter immediately." },
          { en: "Storm shelter", he: "A low, safe room to hide in during a tornado." },
          { en: "Storm chasers", he: "People who follow tornadoes to study them and warn others." },
          { en: "Damage path", he: "The trail a tornado follows, leaving damage behind it." },
        ],
        slides: [
          {
            type: "content",
            title: "What is a **Tornado**?",
            subtitle: "Opening",
            body: "A **tornado** is a column of air spinning at extremely high speed that touches the ground and can cause huge damage within minutes.\n\nIt looks like a **funnel cloud** dropping from the sky to the ground, and usually forms out of a powerful thunderstorm.\n\nToday we'll learn how a tornado forms, and how people stay safe when it gets close.",
          },
          {
            type: "content",
            title: "**Important words**",
            subtitle: "Vocabulary",
            body: "**Funnel cloud** — the funnel-shaped form that drops from the clouds before a tornado touches the ground.\n\n**Thunderstorm** — a storm with thunder, lightning, and heavy rain that sometimes produces tornadoes.\n\n**Tornado warning** — an alert signal that tells people to find shelter immediately.",
          },
          {
            type: "content",
            title: "How does a **Tornado** form?",
            subtitle: "Inside the thunderstorm",
            body: "A tornado starts forming when **warm, humid air** meets **cold, dry air** inside a powerful **thunderstorm**.\n\nThe meeting of warm and cold air creates a spinning motion inside the cloud.\n\nWhen that spin gets stronger and reaches down to the ground, a column of air spinning at tremendous speed forms — that's the tornado.",
          },
          {
            type: "content",
            title: "How **strong** can a tornado be?",
            subtitle: "The power of the wind",
            body: "The **wind speed** inside a tornado can reach more than 300 kilometers per hour — much faster than the strongest wind in a hurricane.\n\nWinds like that can lift cars, uproot trees, and destroy houses within seconds.\n\nA tornado moves along a **damage path** that can be short or stretch for several kilometers.",
          },
          {
            type: "content",
            title: "Fun fact",
            subtitle: "Fun fact",
            body: "Most of the world's tornadoes happen in an area of the United States called \"Tornado Alley,\" because warm and cold air meet there very often.\n\n**Storm chasers** are people who travel specifically to film and study tornadoes — an exciting but also very dangerous job.",
          },
          {
            type: "content",
            title: "How do you **stay safe**?",
            subtitle: "Safety",
            body: "When you hear a **tornado warning**, the rule is to find shelter immediately — best in a **storm shelter** or an inner room with no windows.\n\nIf you're outside with no shelter nearby, it's better to lie down low and stay away from trees and cars.\n\nIt's important to never try to see a tornado up close — it can suddenly change direction and speed.",
          },
          {
            type: "content",
            title: "Class discussion",
            subtitle: "Questions about the lesson",
            body: "If you were at home and heard a tornado warning, which room in the house would you go to, and why?\n\nWhat's the difference between a regular thunderstorm and one that produces a tornado?",
          },
          { type: "games", title: "Time to practice!", subtitle: "Games" },
          {
            type: "content",
            title: "End of lesson",
            subtitle: "Well done!",
            body: "Thanks for participating!",
          },
        ],
      },
    },

    thunderstorm: {
      id: "thunderstorm",
      name: "פלאי הטבע - ברקים ורעמים",
      nameMain: "פלאי הטבע",
      namePart: "ברקים ורעמים",
      subject: "health",
      grades: ["ag", "dv", "zh"],
      topic: "thunderstorm",
      gradeLabel: "כל הכיתות",
      duration: "20 דק'",
      summary: "מכירים סופות רעמים מקרוב — איך נוצר ברק, למה שומעים רעם אחריו, ואיך נשארים בטוחים בזמן סופה. עם משחק בסוף.",
      vocab: [
        { en: "ברק", he: "פריקה חשמלית ענקית ומהירה שקורית בשמיים בזמן סופה" },
        { en: "רעם", he: "הרעש החזק שנשמע אחרי הברק" },
        { en: "עננת סערה", he: "ענן גבוה וכהה שבתוכו נוצרים ברקים ורעמים" },
        { en: "מטען חשמלי", he: "כוח חשמלי שנבנה בתוך העננים מהתנגשות של טיפות מים וגבישי קרח" },
        { en: "מוליך ברקים", he: "מוט מתכת שמגן על בניינים מפגיעת ברק" },
        { en: "כלל 30/30", he: "כלל שעוזר לדעת מתי הברק קרוב מדי ומתי בטוח לחזור החוצה" },
        { en: "מהירות אור", he: "המהירות שבה האור מהברק מגיע לעינינו, כמעט מיידית" },
        { en: "מהירות קול", he: "המהירות שבה הרעם מגיע לאוזניים שלנו, לאט יותר מהאור" },
        { en: "סופת קיץ", he: "סופת רעמים שקורית בדרך כלל בימי קיץ חמים" },
      ],
      games: STANDARD_LESSON_GAMES,
      slides: [
        {
          type: "content",
          title: "מה זה **ברק**?",
          subtitle: "פתיחה",
          body: "**ברק** הוא פריקה חשמלית ענקית ומהירה שקורית בשמיים בזמן סופת רעמים.\n\nהוא נמשך רק חלקיק שנייה, אבל חם יותר מפני השמש ומאיר את כל השמיים.\n\nהיום נלמד איך ברק נוצר, למה שומעים **רעם** אחריו, ואיך נשארים בטוחים בזמן סופה.",
        },
        {
          type: "content",
          title: "**מילים חשובות**",
          subtitle: "אוצר מושגים",
          body: "**עננת סערה** — ענן גבוה וכהה שבתוכו נוצרים ברקים ורעמים.\n\n**מטען חשמלי** — כוח חשמלי שנבנה בתוך העננים.\n\n**רעם** — הרעש החזק שנשמע אחרי הברק.",
        },
        {
          type: "content",
          title: "איך **ברק** נוצר?",
          subtitle: "בתוך עננת הסערה",
          body: "בתוך **עננת סערה** גדולה, טיפות מים וגבישי קרח קטנים מתנגשים אחד בשני שוב ושוב.\n\nההתנגשויות בונות **מטען חשמלי** ענק בתוך הענן — חלק עליון עם מטען אחד וחלק תחתון עם מטען הפוך.\n\nכשההבדל במטען נהיה גדול מדי, נפרקת כמות עצומה של חשמל בבת אחת — זהו הברק.",
        },
        {
          type: "content",
          title: "למה שומעים **רעם**?",
          subtitle: "אור וקול",
          body: "הברק מחמם את האוויר סביבו למעלה מ-25,000 מעלות צלזיוס תוך רגע — חם יותר מפני השמש!\n\nהחום הפתאומי גורם לאוויר להתרחב במהירות עצומה ולרעוד — הרעד הזה הוא הרעם ששומעים.\n\nרואים את הברק כמעט מיד כי **מהירות אור** גבוהה מאוד, אבל שומעים את הרעם קצת אחר כך כי **מהירות קול** איטית יותר.",
        },
        {
          type: "content",
          title: "עובדה מרתקת",
          subtitle: "עובדה מרתקת",
          body: "אפשר לדעת כמה רחוק ברק פגע: סופרים את השניות בין הברק לרעם ומחלקים ב-3 כדי לקבל את המרחק בקילומטרים בקירוב.\n\nבכל רגע נתון מתרחשים בעולם בערך 2,000 סופות רעמים במקביל!",
        },
        {
          type: "content",
          title: "איך **נשארים בטוחים**?",
          subtitle: "בטיחות",
          body: "**כלל 30/30** אומר: אם שומעים רעם פחות מ-30 שניות אחרי הברק, נכנסים מיד פנימה; וצריך לחכות 30 דקות אחרי הרעם האחרון לפני שחוזרים החוצה.\n\nבזמן סופה עדיף להישאר בבית, להתרחק מחלונות פתוחים, ולא לעמוד מתחת לעץ גבוה ובודד.\n\nבניינים גבוהים מוגנים לרוב עם **מוליך ברקים** — מוט מתכת שמעביר את הברק בבטחה לאדמה.",
        },
        {
          type: "content",
          title: "דיון כיתתי",
          subtitle: "שאלות על השיעור",
          body: "למה חשוב להיכנס פנימה מיד כששומעים רעם קרוב, גם אם עדיין לא יורד גשם?\n\nאיך אפשר לדעת בקירוב כמה רחוק פגע ברק, לפי מה שלמדנו היום?",
        },
        { type: "games", title: "זמן לתרגל!", subtitle: "משחקים" },
        {
          type: "content",
          title: "סוף השיעור",
          subtitle: "כל הכבוד!",
          body: "תודה על ההשתתפות!",
        },
      ],

      en: {
        name: "Wonders of Nature - Thunder & Lightning",
        nameMain: "Wonders of Nature",
        namePart: "Thunder & Lightning",
        summary: "Get to know thunderstorms up close — how lightning forms, why we hear thunder after it, and how to stay safe during a storm. With a game at the end.",
        vocab: [
          { en: "Lightning", he: "A huge, fast electrical discharge that happens in the sky during a storm." },
          { en: "Thunder", he: "The loud sound heard after a lightning flash." },
          { en: "Storm cloud", he: "A tall, dark cloud that lightning and thunder form inside." },
          { en: "Electric charge", he: "Electrical power that builds up inside clouds from colliding water drops and ice crystals." },
          { en: "Lightning rod", he: "A metal rod that protects buildings from a lightning strike." },
          { en: "30/30 rule", he: "A rule that helps you know when lightning is too close and when it's safe to go back outside." },
          { en: "Speed of light", he: "The speed at which light from the lightning reaches our eyes, almost instantly." },
          { en: "Speed of sound", he: "The speed at which thunder reaches our ears, slower than light." },
          { en: "Summer storm", he: "A thunderstorm that usually happens on hot summer days." },
        ],
        slides: [
          {
            type: "content",
            title: "What is **Lightning**?",
            subtitle: "Opening",
            body: "**Lightning** is a huge, fast electrical discharge that happens in the sky during a thunderstorm.\n\nIt lasts only a split second, but it's hotter than the surface of the sun and lights up the whole sky.\n\nToday we'll learn how lightning forms, why we hear **thunder** after it, and how to stay safe during a storm.",
          },
          {
            type: "content",
            title: "**Important words**",
            subtitle: "Vocabulary",
            body: "**Storm cloud** — a tall, dark cloud that lightning and thunder form inside.\n\n**Electric charge** — electrical power that builds up inside the clouds.\n\n**Thunder** — the loud sound heard after the lightning flash.",
          },
          {
            type: "content",
            title: "How does **Lightning** form?",
            subtitle: "Inside the storm cloud",
            body: "Inside a big **storm cloud**, tiny water drops and ice crystals crash into each other again and again.\n\nThese collisions build up a huge **electric charge** inside the cloud — the top part with one charge and the bottom part with the opposite charge.\n\nWhen the difference in charge gets too big, an enormous amount of electricity is released all at once — that's the lightning.",
          },
          {
            type: "content",
            title: "Why do you hear **Thunder**?",
            subtitle: "Light and sound",
            body: "Lightning heats the air around it to more than 25,000 degrees Celsius in an instant — hotter than the surface of the sun!\n\nThat sudden heat makes the air expand incredibly fast and vibrate — that vibration is the thunder you hear.\n\nYou see the lightning almost instantly because the **speed of light** is very fast, but you hear the thunder a bit later because the **speed of sound** is slower.",
          },
          {
            type: "content",
            title: "Fun fact",
            subtitle: "Fun fact",
            body: "You can tell how far away lightning struck: count the seconds between the flash and the thunder, and divide by 3 to get the distance in kilometers, roughly.\n\nAt any given moment, about 2,000 thunderstorms are happening around the world at the same time!",
          },
          {
            type: "content",
            title: "How do you **stay safe**?",
            subtitle: "Safety",
            body: "The **30/30 rule** says: if you hear thunder less than 30 seconds after the lightning, go inside right away; and wait 30 minutes after the last thunder before going back outside.\n\nDuring a storm it's best to stay indoors, keep away from open windows, and not stand under a tall, lone tree.\n\nTall buildings are usually protected by a **lightning rod** — a metal rod that safely carries the lightning down to the ground.",
          },
          {
            type: "content",
            title: "Class discussion",
            subtitle: "Questions about the lesson",
            body: "Why is it important to go inside right away when you hear thunder close by, even if it's not raining yet?\n\nBased on what we learned today, how can you roughly tell how far away a lightning strike was?",
          },
          { type: "games", title: "Time to practice!", subtitle: "Games" },
          {
            type: "content",
            title: "End of lesson",
            subtitle: "Well done!",
            body: "Thanks for participating!",
          },
        ],
      },
    },

    avalanche: {
      id: "avalanche",
      name: "פלאי הטבע - מפולת שלגים",
      nameMain: "פלאי הטבע",
      namePart: "מפולת שלגים",
      subject: "health",
      grades: ["ag", "dv", "zh"],
      topic: "avalanche",
      gradeLabel: "כל הכיתות",
      duration: "20 דק'",
      summary: "מכירים מפולת שלגים מקרוב — איך שכבות שלג על הר תלול נשברות ונופלות בפתאומיות, ואיך שומרים על בטיחות בהרים. עם משחק בסוף.",
      vocab: [
        { en: "מפולת שלגים", he: "כמות גדולה של שלג שנשברת ונופלת במורד הר בפתאומיות ובמהירות" },
        { en: "שכבת שלג", he: "שכבה אחת מתוך כמה שכבות שלג שנערמות זו על זו על ההר" },
        { en: "הר תלול", he: "הר עם שיפוע חד שעליו שלג יכול להחליק בקלות" },
        { en: "משקל שלג", he: "הכובד של השלג שמצטבר ולוחץ על השכבות שמתחתיו" },
        { en: "טריגר", he: "משהו שגורם למפולת להתחיל, כמו רעש, תנועה או שינוי חום" },
        { en: "מד מפולות", he: "מכשיר שעוזר לאתר אנשים שנקברו מתחת לשלג" },
        { en: "ציוד חילוץ", he: "כלים מיוחדים שעוזרים למצוא ולחלץ אנשים ממפולת" },
        { en: "כלב חילוץ", he: "כלב מאומן שמריח ומוצא אנשים קבורים מתחת לשלג" },
        { en: "אזור סיכון", he: "מקום בהר שבו יש סיכוי גבוה יותר למפולת שלגים" },
      ],
      games: STANDARD_LESSON_GAMES,
      slides: [
        {
          type: "content",
          title: "מה זו **מפולת שלגים**?",
          subtitle: "פתיחה",
          body: "**מפולת שלגים** היא כמות גדולה של שלג שנשברת בפתאומיות ונופלת במורד **הר תלול** במהירות עצומה.\n\nהיא יכולה לקרות בשניות ספורות, ולזוז מהר יותר ממכונית שנוסעת בכביש.\n\nהיום נלמד למה מפולות שלגים קורות, ואיך אנשים בהרים נשארים בטוחים.",
        },
        {
          type: "content",
          title: "**מילים חשובות**",
          subtitle: "אוצר מושגים",
          body: "**שכבת שלג** — שכבה אחת מתוך כמה שכבות שלג שנערמות זו על זו על ההר.\n\n**טריגר** — משהו שגורם למפולת להתחיל, כמו רעש או תנועה.\n\n**אזור סיכון** — מקום בהר שבו יש סיכוי גבוה יותר למפולת.",
        },
        {
          type: "content",
          title: "איך **מפולת שלגים** מתחילה?",
          subtitle: "על ההר",
          body: "כשיורד שלג פעם אחר פעם, נוצרות **שכבות שלג** רבות שנערמות זו על זו על **הר תלול**.\n\nלפעמים השכבות לא נדבקות היטב אחת לשנייה — למשל אם שכבה אחת רכה מדי או קפואה בצורה שונה מהשכבה שמתחתיה.\n\nכש**משקל השלג** נהיה כבד מדי, מספיק **טריגר** קטן — כמו רעש חזק, גולש שעובר, או אפילו שינוי חום — כדי לגרום לכל השכבה להחליק בבת אחת.",
        },
        {
          type: "content",
          title: "כמה **מהירה** מפולת שלגים?",
          subtitle: "כוח וזרימה",
          body: "מפולת שלגים גדולה יכולה לנוע במהירות של יותר מ-100 קילומטרים בשעה תוך שניות ספורות.\n\nהיא נושאת איתה לא רק שלג, אלא גם קרח, אבנים ועצים שנקרעים מהקרקע בדרך.\n\nמי שנקבר מתחת למפולת יכול להיעזר רק בדקות הראשונות — לכן חשוב מאוד שיהיו כלים למציאה מהירה.",
        },
        {
          type: "content",
          title: "עובדה מרתקת",
          subtitle: "עובדה מרתקת",
          body: "**כלבי חילוץ** מאומנים יכולים למצוא אדם קבור מתחת לשלג הרבה יותר מהר מבני אדם — לפעמים תוך דקות ספורות בלבד.\n\nגולשים וחוקרים רבים נושאים איתם **מד מפולות** — מכשיר קטן ששולח אות שעוזר למצוא אותם אם הם נקברים.",
        },
        {
          type: "content",
          title: "איך **נשארים בטוחים**?",
          subtitle: "בטיחות",
          body: "לפני שיוצאים להר בחורף, חשוב לבדוק את תחזית הסיכון למפולות ולהימנע מ**אזורי סיכון** ידועים.\n\nמי שהולך בהרים מושלגים לוקח לרוב **ציוד חילוץ** — כולל מד מפולות, את ולוח חיפוש.\n\nאם רואים מפולת מתקרבת, הכלל הוא לנסות לזוז הצידה מחוץ למסלול שלה, ולא לרוץ ישר קדימה.",
        },
        {
          type: "content",
          title: "דיון כיתתי",
          subtitle: "שאלות על השיעור",
          body: "למה חשוב לבדוק תחזית סיכון למפולות לפני שיוצאים להר בחורף?\n\nמה מכל מה שלמדנו על מפולות שלגים הפתיע אתכם הכי הרבה?",
        },
        { type: "games", title: "זמן לתרגל!", subtitle: "משחקים" },
        {
          type: "content",
          title: "סוף השיעור",
          subtitle: "כל הכבוד!",
          body: "תודה על ההשתתפות!",
        },
      ],

      en: {
        name: "Wonders of Nature - Avalanche",
        nameMain: "Wonders of Nature",
        namePart: "Avalanche",
        summary: "Get to know avalanches up close — how layers of snow on a steep mountain break loose and fall suddenly, and how to stay safe in the mountains. With a game at the end.",
        vocab: [
          { en: "Avalanche", he: "A huge amount of snow that breaks loose and slides down a mountain suddenly and fast." },
          { en: "Snow layer", he: "One layer among several layers of snow stacked on top of each other on a mountain." },
          { en: "Steep slope", he: "A mountain with a sharp incline where snow can slide easily." },
          { en: "Snow weight", he: "The heaviness of snow that builds up and presses on the layers beneath it." },
          { en: "Trigger", he: "Something that sets off an avalanche, like a noise, movement, or a change in temperature." },
          { en: "Avalanche beacon", he: "A device that helps locate people buried under the snow." },
          { en: "Rescue gear", he: "Special tools that help find and rescue people from an avalanche." },
          { en: "Rescue dog", he: "A trained dog that sniffs out and finds people buried under snow." },
          { en: "Risk zone", he: "A place on a mountain with a higher chance of an avalanche." },
        ],
        slides: [
          {
            type: "content",
            title: "What is an **Avalanche**?",
            subtitle: "Opening",
            body: "An **avalanche** is a huge amount of snow that suddenly breaks loose and slides down a **steep slope** at tremendous speed.\n\nIt can happen within seconds, and move faster than a car driving on a road.\n\nToday we'll learn why avalanches happen, and how people in the mountains stay safe.",
          },
          {
            type: "content",
            title: "**Important words**",
            subtitle: "Vocabulary",
            body: "**Snow layer** — one layer among several layers of snow stacked on top of each other on a mountain.\n\n**Trigger** — something that sets off an avalanche, like a noise or movement.\n\n**Risk zone** — a place on a mountain with a higher chance of an avalanche.",
          },
          {
            type: "content",
            title: "How does an **Avalanche** start?",
            subtitle: "On the mountain",
            body: "When snow falls again and again, many **snow layers** pile up on top of each other on a **steep slope**.\n\nSometimes the layers don't stick well to each other — for example if one layer is too soft or froze differently from the layer beneath it.\n\nWhen the **snow weight** gets too heavy, a small **trigger** — like a loud noise, a skier passing by, or even a change in temperature — can be enough to make the whole layer slide at once.",
          },
          {
            type: "content",
            title: "How **fast** is an avalanche?",
            subtitle: "Power and flow",
            body: "A big avalanche can move at more than 100 kilometers per hour within seconds.\n\nIt carries not just snow, but also ice, rocks, and trees that get torn up along the way.\n\nSomeone buried under an avalanche can only be helped in the first few minutes — that's why it's so important to have tools for finding people quickly.",
          },
          {
            type: "content",
            title: "Fun fact",
            subtitle: "Fun fact",
            body: "Trained **rescue dogs** can find a person buried under snow much faster than people can — sometimes within just a few minutes.\n\nMany skiers and hikers carry an **avalanche beacon** — a small device that sends a signal to help find them if they get buried.",
          },
          {
            type: "content",
            title: "How do you **stay safe**?",
            subtitle: "Safety",
            body: "Before heading into the mountains in winter, it's important to check the avalanche risk forecast and avoid known **risk zones**.\n\nPeople hiking in snowy mountains usually carry **rescue gear** — including an avalanche beacon, a shovel, and a probe.\n\nIf you see an avalanche coming, the rule is to try to move sideways out of its path, not to run straight ahead of it.",
          },
          {
            type: "content",
            title: "Class discussion",
            subtitle: "Questions about the lesson",
            body: "Why is it important to check the avalanche risk forecast before heading into the mountains in winter?\n\nWhat surprised you the most about everything we learned about avalanches?",
          },
          { type: "games", title: "Time to practice!", subtitle: "Games" },
          {
            type: "content",
            title: "End of lesson",
            subtitle: "Well done!",
            body: "Thanks for participating!",
          },
        ],
      },
    },

    rainbow: {
      id: "rainbow",
      name: "פלאי הטבע - קשת בענן",
      nameMain: "פלאי הטבע",
      namePart: "קשת בענן",
      subject: "health",
      grades: ["ag", "dv", "zh"],
      topic: "rainbow",
      gradeLabel: "כל הכיתות",
      duration: "20 דק'",
      summary: "מכירים את הקשת בענן מקרוב — איך אור השמש הופך לצבעים, ולמה קשת תמיד נראית בצורת קשת. עם משחק בסוף.",
      vocab: [
        { en: "קשת בענן", he: "תופעה צבעונית בשמיים שנוצרת כשאור שמש עובר דרך טיפות גשם" },
        { en: "אור לבן", he: "האור שמגיע מהשמש, שנראה לבן אבל למעשה מכיל את כל הצבעים" },
        { en: "שבירת אור", he: "כשקרן אור משנה כיוון בזמן שהיא עוברת מחומר אחד לחומר אחר, כמו מאוויר למים" },
        { en: "ספקטרום", he: "כל הצבעים שמרכיבים את האור הלבן, מסודרים אחד ליד השני" },
        { en: "טיפת גשם", he: "כדור קטן של מים שדרכו האור נשבר ומתפזר לצבעים" },
        { en: "החזרה", he: "כשהאור פוגע במשהו וחוזר לכיוון אחר, כמו מבפנים טיפת הגשם" },
        { en: "קשת כפולה", he: "שתי קשתות שנראות יחד בשמיים, כשהצבעים בשנייה הפוכים" },
        { en: "זווית ראייה", he: "הכיוון שממנו האדם מסתכל על הקשת ביחס לשמש" },
      ],
      games: STANDARD_LESSON_GAMES,
      slides: [
        {
          type: "content",
          title: "מה זו **קשת בענן**?",
          subtitle: "פתיחה",
          body: "**קשת בענן** היא אחת התופעות היפות ביותר בטבע — קשת צבעונית שמופיעה בשמיים אחרי הגשם, כשהשמש עדיין זורחת.\n\nהיא נוצרת כש**אור לבן** מהשמש עובר דרך **טיפות גשם** קטנות שנשארות באוויר.\n\nהיום נלמד למה הקשת מלאה בצבעים, ולמה היא תמיד נראית בצורת קשת.",
        },
        {
          type: "content",
          title: "**מילים חשובות**",
          subtitle: "אוצר מושגים",
          body: "**אור לבן** — האור שמגיע מהשמש, שנראה לבן אבל למעשה מכיל את כל הצבעים.\n\n**שבירת אור** — כשקרן אור משנה כיוון בזמן שהיא עוברת מחומר אחד לחומר אחר.\n\n**ספקטרום** — כל הצבעים שמרכיבים יחד את האור הלבן.",
        },
        {
          type: "content",
          title: "איך **הצבעים** נוצרים?",
          subtitle: "בתוך טיפת הגשם",
          body: "אור השמש נראה לבן, אבל הוא מורכב למעשה מכל צבעי ה**ספקטרום** — אדום, כתום, צהוב, ירוק, כחול וסגול.\n\nכשאור נכנס ל**טיפת גשם**, הוא נשבר — כלומר משנה כיוון קצת — וכל צבע נשבר בזווית קצת אחרת.\n\nהאור ממשיך פנימה, פוגע בדופן האחורית של הטיפה ועובר **החזרה**, ואז נשבר שוב ביציאה — כך כל הצבעים מתפזרים ונראים בנפרד כקשת.",
        },
        {
          type: "content",
          title: "למה קשת היא **בצורת** קשת?",
          subtitle: "הצורה המושלמת",
          body: "כל טיפת גשם שולחת רק צבע אחד לכיוון העיניים שלנו, בזווית מדויקת של בערך 42 מעלות מהשמש.\n\nכשמסתכלים על אלפי טיפות גשם ביחד, כל אחת שולחת צבע אחר לכיוון שלנו — וביחד הן יוצרות את קשת הצבעים המושלמת.\n\nבגלל שהזווית הזו זהה בכל הכיוונים, הקשת תמיד נראית כמו חצי עיגול מושלם.",
        },
        {
          type: "content",
          title: "עובדה מרתקת",
          subtitle: "עובדה מרתקת",
          body: "לפעמים אפשר לראות **קשת כפולה** — קשת שנייה, חלשה יותר, שמופיעה מעל הראשונה עם הצבעים הפוכים.\n\nכל אדם רואה קשת קצת שונה, כי הקשת תלויה ב**זווית הראייה** שלו — אין באמת \"מקום\" קבוע שבו נמצאת הקשת בשמיים.",
        },
        {
          type: "content",
          title: "**איפה** רואים קשתות בעולם?",
          subtitle: "חיבור לחיים",
          body: "אפשר לראות קשת בכל מקום בעולם שבו יש גשם ושמש ביחד — ליד מפלים, במרססי מים, ואפילו ליד ברז מים ביום שמשי.\n\nכדי לראות קשת, השמש צריכה להיות מאחורי הגב שלנו והגשם מולנו — לכן קשתות בדרך כלל נראות בבוקר או אחר הצהריים, כשהשמש נמוכה בשמיים.\n\nבתרבויות רבות בעולם הקשת נחשבת לסמל של תקווה ויופי.",
        },
        {
          type: "content",
          title: "דיון כיתתי",
          subtitle: "שאלות על השיעור",
          body: "איפה ראיתם קשת בעצמכם, וכמה צבעים הצלחתם לזהות בה?\n\nלמה לדעתכם צריך גם שמש וגם גשם ביחד כדי לראות קשת?",
        },
        { type: "games", title: "זמן לתרגל!", subtitle: "משחקים" },
        {
          type: "content",
          title: "סוף השיעור",
          subtitle: "כל הכבוד!",
          body: "תודה על ההשתתפות!",
        },
      ],

      en: {
        name: "Wonders of Nature - Rainbow",
        nameMain: "Wonders of Nature",
        namePart: "Rainbow",
        summary: "Get to know rainbows up close — how sunlight turns into colors, and why a rainbow is always shaped like an arc. With a game at the end.",
        vocab: [
          { en: "Rainbow", he: "A colorful phenomenon in the sky formed when sunlight passes through raindrops." },
          { en: "White light", he: "The light that comes from the sun, which looks white but actually contains every color." },
          { en: "Refraction", he: "When a ray of light changes direction as it passes from one substance into another, like from air into water." },
          { en: "Spectrum", he: "All the colors that make up white light, arranged next to each other." },
          { en: "Raindrop", he: "A tiny ball of water that light bends and spreads into colors as it passes through." },
          { en: "Reflection", he: "When light hits something and bounces back in another direction, like inside a raindrop." },
          { en: "Double rainbow", he: "Two rainbows seen together in the sky, with the colors in the second one reversed." },
          { en: "Viewing angle", he: "The direction a person is looking from, relative to the sun, to see the rainbow." },
        ],
        slides: [
          {
            type: "content",
            title: "What is a **Rainbow**?",
            subtitle: "Opening",
            body: "A **rainbow** is one of the most beautiful sights in nature — a colorful arc that appears in the sky after rain, while the sun is still shining.\n\nIt forms when **white light** from the sun passes through tiny **raindrops** still floating in the air.\n\nToday we'll learn why the rainbow is full of colors, and why it's always shaped like an arc.",
          },
          {
            type: "content",
            title: "**Important words**",
            subtitle: "Vocabulary",
            body: "**White light** — the light that comes from the sun, which looks white but actually contains every color.\n\n**Refraction** — when a ray of light changes direction as it passes from one substance into another.\n\n**Spectrum** — all the colors that make up white light together.",
          },
          {
            type: "content",
            title: "How do the **Colors** form?",
            subtitle: "Inside a raindrop",
            body: "Sunlight looks white, but it's actually made up of every color in the **spectrum** — red, orange, yellow, green, blue, and violet.\n\nWhen light enters a **raindrop**, it bends — meaning it changes direction slightly — and each color bends at a slightly different angle.\n\nThe light keeps going, hits the back wall of the drop, and **reflects**, then bends again as it exits — that's how all the colors spread apart and appear separately as a rainbow.",
          },
          {
            type: "content",
            title: "Why is a rainbow **shaped** like an arc?",
            subtitle: "The perfect shape",
            body: "Every raindrop sends just one color toward our eyes, at a precise angle of about 42 degrees from the sun.\n\nWhen you look at thousands of raindrops together, each one sends a different color toward you — and together they create the perfect arc of colors.\n\nBecause this angle is the same in every direction, a rainbow always looks like a perfect half-circle.",
          },
          {
            type: "content",
            title: "Fun fact",
            subtitle: "Fun fact",
            body: "Sometimes you can see a **double rainbow** — a second, fainter rainbow that appears above the first one, with its colors reversed.\n\nEvery person sees a slightly different rainbow, because it depends on their own **viewing angle** — there's no real fixed \"place\" where the rainbow sits in the sky.",
          },
          {
            type: "content",
            title: "**Where** do you see rainbows around the world?",
            subtitle: "Real-life connection",
            body: "You can see a rainbow anywhere in the world where there's rain and sun together — near waterfalls, in water sprinklers, and even near a garden hose on a sunny day.\n\nTo see a rainbow, the sun needs to be behind you and the rain in front of you — that's why rainbows usually appear in the morning or afternoon, when the sun is low in the sky.\n\nIn many cultures around the world, the rainbow is seen as a symbol of hope and beauty.",
          },
          {
            type: "content",
            title: "Class discussion",
            subtitle: "Questions about the lesson",
            body: "Where have you seen a rainbow yourself, and how many colors were you able to spot in it?\n\nWhy do you think you need both sun and rain together to see a rainbow?",
          },
          { type: "games", title: "Time to practice!", subtitle: "Games" },
          {
            type: "content",
            title: "End of lesson",
            subtitle: "Well done!",
            body: "Thanks for participating!",
          },
        ],
      },
    },

    aurora: {
      id: "aurora",
      name: "פלאי הטבע - זוהר קוטבי",
      nameMain: "פלאי הטבע",
      namePart: "זוהר קוטבי",
      subject: "health",
      grades: ["ag", "dv", "zh"],
      topic: "aurora",
      gradeLabel: "כל הכיתות",
      duration: "20 דק'",
      summary: "מכירים את הזוהר הקוטבי מקרוב — איך חלקיקים מהשמש יוצרים אורות רוקדים בשמי הלילה ליד הקטבים. עם משחק בסוף.",
      vocab: [
        { en: "זוהר קוטבי", he: "אורות צבעוניים שרוקדים בשמי הלילה ליד קוטבי כדור הארץ" },
        { en: "רוח שמש", he: "זרם של חלקיקים טעונים שנשלח מהשמש לכל כיוון בחלל" },
        { en: "שדה מגנטי", he: "הכוח הבלתי נראה שמקיף את כדור הארץ ומגן עליו" },
        { en: "אטמוספירה", he: "שכבת האוויר שעוטפת את כדור הארץ" },
        { en: "חלקיק טעון", he: "חלקיק זעיר עם מטען חשמלי שמגיע מהשמש" },
        { en: "קוטב צפוני וקוטב דרומי", he: "שתי הנקודות שבהן השדה המגנטי הכי חזק ורואים הכי הרבה זוהר" },
        { en: "התנגשות", he: "כשחלקיק מהשמש פוגע במולקולת אוויר וגורם לה לזרוח" },
        { en: "צבעי הזוהר", he: "הגוונים השונים של הזוהר הקוטבי, כמו ירוק, ורוד וסגול" },
      ],
      games: STANDARD_LESSON_GAMES,
      slides: [
        {
          type: "content",
          title: "מה זה **זוהר קוטבי**?",
          subtitle: "פתיחה",
          body: "**זוהר קוטבי** הוא תופעה מדהימה שבה אורות צבעוניים נראים רוקדים בשמי הלילה, בעיקר ליד הקטבים של כדור הארץ.\n\nהוא יכול להיראות ירוק, ורוד, סגול או כחול, וזז לאט כמו וילון ענק בשמיים.\n\nהיום נלמד מאיפה מגיע הזוהר הקוטבי, ולמה רואים אותו רק באזורים מסוימים.",
        },
        {
          type: "content",
          title: "**מילים חשובות**",
          subtitle: "אוצר מושגים",
          body: "**רוח שמש** — זרם של חלקיקים טעונים שנשלח מהשמש לכל כיוון בחלל.\n\n**שדה מגנטי** — הכוח הבלתי נראה שמקיף את כדור הארץ ומגן עליו.\n\n**אטמוספירה** — שכבת האוויר שעוטפת את כדור הארץ.",
        },
        {
          type: "content",
          title: "איך **הזוהר** נוצר?",
          subtitle: "מהשמש עד השמיים",
          body: "השמש שולחת כל הזמן **רוח שמש** — זרם של **חלקיקים טעונים** שנעים בחלל במהירות עצומה.\n\nכשהחלקיקים האלה מגיעים לכדור הארץ, ה**שדה המגנטי** שלנו מפנה אותם בעיקר לכיוון ה**קוטב הצפוני** וה**קוטב הדרומי**.\n\nשם החלקיקים נכנסים ל**אטמוספירה** ומתנגשים במולקולות אוויר — ה**התנגשות** הזו גורמת למולקולות לזרוח בצבעים שונים.",
        },
        {
          type: "content",
          title: "מאיפה מגיעים **הצבעים**?",
          subtitle: "תערוכת אור",
          body: "**צבעי הזוהר** תלויים בסוג המולקולה שהחלקיק פוגע בה ובגובה שבו זה קורה.\n\nחמצן בגובה נמוך יוצר בדרך כלל ירוק — הצבע הכי נפוץ בזוהר הקוטבי — ובגובה גבוה יותר הוא יכול ליצור אדום.\n\nחנקן יכול ליצור גוונים של כחול וסגול, ולכן לפעמים רואים כמה צבעים רוקדים יחד באותו זוהר.",
        },
        {
          type: "content",
          title: "עובדה מרתקת",
          subtitle: "עובדה מרתקת",
          body: "לזוהר הקוטבי בקוטב הצפוני קוראים \"אורורה בוריאליס\", ולזוהר בקוטב הדרומי קוראים \"אורורה אוסטרליס\" — שתי התופעות קורות באותו זמן בדיוק, כמו תמונת מראה.\n\nזוהרים חזקים במיוחד קרו בעבר בעקבות סופות שמש גדולות, ולעיתים היו נראים אפילו הרחק מהקטבים.",
        },
        {
          type: "content",
          title: "**איפה** רואים זוהר קוטבי?",
          subtitle: "חיבור לחיים",
          body: "אפשר לראות זוהר קוטבי בעיקר במדינות קרובות לקטבים, כמו נורווגיה, איסלנד, קנדה ואלסקה, בלילות חשוכים וצלולים.\n\nכדי לראות אותו טוב, כדאי להתרחק מאורות עיר ולחכות בלילה קר וללא עננים.\n\nמדענים חוקרים את **רוח השמש** גם כדי להבין איך היא משפיעה על לוויינים ומערכות תקשורת בכדור הארץ.",
        },
        {
          type: "content",
          title: "דיון כיתתי",
          subtitle: "שאלות על השיעור",
          body: "אילו צבעים הייתם הכי רוצים לראות בזוהר קוטבי, ולמה?\n\nלמה לדעתכם צריך שמיים חשוכים ונקיים מעננים כדי לראות זוהר קוטבי טוב?",
        },
        { type: "games", title: "זמן לתרגל!", subtitle: "משחקים" },
        {
          type: "content",
          title: "סוף השיעור",
          subtitle: "כל הכבוד!",
          body: "תודה על ההשתתפות!",
        },
      ],

      en: {
        name: "Wonders of Nature - Aurora",
        nameMain: "Wonders of Nature",
        namePart: "Aurora",
        summary: "Get to know the aurora up close — how particles from the sun create dancing lights in the night sky near the poles. With a game at the end.",
        vocab: [
          { en: "Aurora", he: "Colorful lights that dance in the night sky near the Earth's poles." },
          { en: "Solar wind", he: "A stream of charged particles sent out from the sun in every direction into space." },
          { en: "Magnetic field", he: "The invisible force that surrounds the Earth and protects it." },
          { en: "Atmosphere", he: "The layer of air that surrounds the Earth." },
          { en: "Charged particle", he: "A tiny particle with an electric charge that comes from the sun." },
          { en: "North Pole and South Pole", he: "The two points where the magnetic field is strongest and the most aurora is seen." },
          { en: "Collision", he: "When a particle from the sun hits an air molecule and makes it glow." },
          { en: "Aurora colors", he: "The different shades of the aurora, like green, pink, and purple." },
        ],
        slides: [
          {
            type: "content",
            title: "What is an **Aurora**?",
            subtitle: "Opening",
            body: "An **aurora** is an amazing phenomenon where colorful lights seem to dance in the night sky, mostly near the Earth's poles.\n\nIt can look green, pink, purple, or blue, and moves slowly like a giant curtain in the sky.\n\nToday we'll learn where the aurora comes from, and why you can only see it in certain places.",
          },
          {
            type: "content",
            title: "**Important words**",
            subtitle: "Vocabulary",
            body: "**Solar wind** — a stream of charged particles sent out from the sun in every direction into space.\n\n**Magnetic field** — the invisible force that surrounds the Earth and protects it.\n\n**Atmosphere** — the layer of air that surrounds the Earth.",
          },
          {
            type: "content",
            title: "How does the **Aurora** form?",
            subtitle: "From the sun to the sky",
            body: "The sun constantly sends out **solar wind** — a stream of **charged particles** moving through space at tremendous speed.\n\nWhen these particles reach Earth, our **magnetic field** steers most of them toward the **North Pole** and the **South Pole**.\n\nThere the particles enter the **atmosphere** and **collide** with air molecules — that collision makes the molecules glow in different colors.",
          },
          {
            type: "content",
            title: "Where do the **Colors** come from?",
            subtitle: "A light show",
            body: "The **aurora colors** depend on which type of molecule the particle hits, and at what height.\n\nOxygen at lower heights usually creates green — the most common color in an aurora — and at higher altitudes it can create red.\n\nNitrogen can create shades of blue and purple, which is why sometimes you see several colors dancing together in the same aurora.",
          },
          {
            type: "content",
            title: "Fun fact",
            subtitle: "Fun fact",
            body: "The aurora at the North Pole is called \"Aurora Borealis,\" and the one at the South Pole is called \"Aurora Australis\" — the two happen at exactly the same time, like a mirror image.\n\nEspecially strong auroras have happened in the past following huge solar storms, and were sometimes seen even far away from the poles.",
          },
          {
            type: "content",
            title: "**Where** do you see the aurora?",
            subtitle: "Real-life connection",
            body: "You can see the aurora mostly in countries close to the poles, like Norway, Iceland, Canada, and Alaska, on dark, clear nights.\n\nTo see it well, it helps to get away from city lights and wait for a cold night with no clouds.\n\nScientists study the **solar wind** to understand how it affects satellites and communication systems on Earth too.",
          },
          {
            type: "content",
            title: "Class discussion",
            subtitle: "Questions about the lesson",
            body: "Which colors would you most want to see in an aurora, and why?\n\nWhy do you think you need dark, cloud-free skies to see a good aurora?",
          },
          { type: "games", title: "Time to practice!", subtitle: "Games" },
          {
            type: "content",
            title: "End of lesson",
            subtitle: "Well done!",
            body: "Thanks for participating!",
          },
        ],
      },
    },

    geyser: {
      id: "geyser",
      name: "פלאי הטבע - גייזר",
      nameMain: "פלאי הטבע",
      namePart: "גייזר",
      subject: "health",
      grades: ["ag", "dv", "zh"],
      topic: "geyser",
      gradeLabel: "כל הכיתות",
      duration: "20 דק'",
      summary: "מכירים גייזר מקרוב — איך מים תת-קרקעיים מתחממים ומתפרצים לגובה, ומה גורם לגייזר להתפרץ שוב ושוב. עם משחק בסוף.",
      vocab: [
        { en: "גייזר", he: "מעיין חם מיוחד שפולט לפתע עמוד מים רותחים ואדים לגובה" },
        { en: "מים תת קרקעיים", he: "מים שנמצאים עמוק מתחת לפני הקרקע" },
        { en: "חום געשי", he: "חום שמגיע מסלעים חמים עמוק באדמה, קרוב לאזורי פעילות געשית" },
        { en: "לחץ", he: "כוח שנבנה כשמים חמים נכלאים בתעלה צרה מתחת לאדמה" },
        { en: "תעלת גייזר", he: "המסלול הצר והמפותל שדרכו המים עולים אל פני השטח" },
        { en: "אדים", he: "מים שהפכו לגז בגלל חום גבוה" },
        { en: "מרווח התפרצות", he: "משך הזמן שעובר בין התפרצות אחת לשנייה באותו גייזר" },
        { en: "מעיין חם", he: "מקור מים חמים שיוצא מהאדמה בלי להתפרץ, בניגוד לגייזר" },
      ],
      games: STANDARD_LESSON_GAMES,
      slides: [
        {
          type: "content",
          title: "מה זה **גייזר**?",
          subtitle: "פתיחה",
          body: "**גייזר** הוא מעיין חם מיוחד שפולט לפתע עמוד ענק של מים רותחים ו**אדים** לגובה של עשרות מטרים.\n\nבניגוד למעיין חם רגיל שזורם בשקט, הגייזר מתפרץ באנרגיה, ולפעמים אפילו בקצב קבוע וצפוי.\n\nהיום נלמד מאיפה מגיע החום למים, ולמה גייזר מתפרץ דווקא ברגעים מסוימים.",
        },
        {
          type: "content",
          title: "**מילים חשובות**",
          subtitle: "אוצר מושגים",
          body: "**מים תת קרקעיים** — מים שנמצאים עמוק מתחת לפני הקרקע.\n\n**חום געשי** — חום שמגיע מסלעים חמים עמוק באדמה.\n\n**תעלת גייזר** — המסלול הצר שדרכו המים עולים אל פני השטח.",
        },
        {
          type: "content",
          title: "איך **גייזר** מתחמם?",
          subtitle: "עמוק באדמה",
          body: "עמוק מתחת לאדמה, **מים תת קרקעיים** זורמים ליד סלעים חמים מאוד שמקבלים **חום געשי** מפנים כדור הארץ.\n\nהמים מתחממים בתוך **תעלת גייזר** צרה ומפותלת, אבל בגלל הלחץ מהמים שמעליהם, הם לא הופכים מיד לאדים.\n\nהמים ממשיכים להתחמם עד שהם חמים מספיק כדי להפוך פתאום לאדים בבת אחת — וזה מה שדוחף את המים למעלה בהתפרצות.",
        },
        {
          type: "content",
          title: "מה קורה **בהתפרצות**?",
          subtitle: "רגע הפרץ",
          body: "כשהמים בתעלה הופכים ל**אדים** בבת אחת, נוצר **לחץ** עצום שדוחף את כל המים שמעליהם החוצה במהירות.\n\nעמוד המים והאדים יכול להגיע לגובה של יותר מ-50 מטרים באוויר, ולהימשך בין כמה שניות לכמה דקות.\n\nאחרי ההתפרצות, המים חוזרים לאט לאט להתמלא ולהתחמם מחדש, עד ההתפרצות הבאה.",
        },
        {
          type: "content",
          title: "עובדה מרתקת",
          subtitle: "עובדה מרתקת",
          body: "הגייזר המפורסם ביותר בעולם נקרא \"אולד פייתפול\", ונמצא בפארק ילוסטון בארצות הברית — הוא מתפרץ בקביעות כל 60 עד 110 דקות בערך.\n\nיש בעולם פחות מ-1,000 גייזרים פעילים, ורובם נמצאים באזורים עם פעילות געשית, כמו ילוסטון, איסלנד וניו זילנד.",
        },
        {
          type: "content",
          title: "כל **גייזר** שונה",
          subtitle: "חיבור לחיים",
          body: "לכל גייזר יש **מרווח התפרצות** משלו — חלק מתפרצים כל כמה דקות, וחלק רק פעם בכמה שעות או ימים.\n\nמדענים חוקרים גייזרים כדי להבין טוב יותר את הפעילות מתחת לפני כדור הארץ, ולפעמים גם משתמשים בחום הזה כדי לייצר חשמל נקי.\n\nאזורי גייזרים הם גם מקום מגורים מיוחד לחיידקים זעירים שאוהבים חום קיצוני, שכמעט אי אפשר למצוא בשום מקום אחר.",
        },
        {
          type: "content",
          title: "דיון כיתתי",
          subtitle: "שאלות על השיעור",
          body: "למה לדעתכם גייזר מתפרץ כל פרק זמן קבוע, ולא נשאר פשוט זורם כמו מעיין רגיל?\n\nהאם הייתם רוצים לראות גייזר מתפרץ מקרוב? למה כן או לא?",
        },
        { type: "games", title: "זמן לתרגל!", subtitle: "משחקים" },
        {
          type: "content",
          title: "סוף השיעור",
          subtitle: "כל הכבוד!",
          body: "תודה על ההשתתפות!",
        },
      ],

      en: {
        name: "Wonders of Nature - Geyser",
        nameMain: "Wonders of Nature",
        namePart: "Geyser",
        summary: "Get to know geysers up close — how underground water heats up and shoots into the air, and what makes a geyser erupt again and again. With a game at the end.",
        vocab: [
          { en: "Geyser", he: "A special hot spring that suddenly shoots a column of boiling water and steam into the air." },
          { en: "Underground water", he: "Water found deep beneath the surface of the ground." },
          { en: "Volcanic heat", he: "Heat that comes from hot rocks deep underground, near areas of volcanic activity." },
          { en: "Pressure", he: "A force that builds up when hot water is trapped in a narrow underground channel." },
          { en: "Geyser channel", he: "The narrow, winding path that water rises through to reach the surface." },
          { en: "Steam", he: "Water that has turned into gas because of high heat." },
          { en: "Eruption interval", he: "The amount of time that passes between one eruption and the next in the same geyser." },
          { en: "Hot spring", he: "A source of hot water that flows out of the ground without erupting, unlike a geyser." },
        ],
        slides: [
          {
            type: "content",
            title: "What is a **Geyser**?",
            subtitle: "Opening",
            body: "A **geyser** is a special hot spring that suddenly shoots a huge column of boiling water and **steam** dozens of meters into the air.\n\nUnlike a regular hot spring that flows quietly, a geyser erupts with energy, and sometimes even at a steady, predictable pace.\n\nToday we'll learn where the heat in the water comes from, and why a geyser erupts at particular moments.",
          },
          {
            type: "content",
            title: "**Important words**",
            subtitle: "Vocabulary",
            body: "**Underground water** — water found deep beneath the surface of the ground.\n\n**Volcanic heat** — heat that comes from hot rocks deep underground.\n\n**Geyser channel** — the narrow path that water rises through to reach the surface.",
          },
          {
            type: "content",
            title: "How does a **Geyser** heat up?",
            subtitle: "Deep underground",
            body: "Deep underground, **underground water** flows past extremely hot rocks that get **volcanic heat** from inside the Earth.\n\nThe water heats up inside a narrow, winding **geyser channel**, but because of the pressure from the water above it, it doesn't turn into steam right away.\n\nThe water keeps heating up until it's hot enough to suddenly turn into steam all at once — and that's what pushes the water upward in an eruption.",
          },
          {
            type: "content",
            title: "What happens **during an eruption**?",
            subtitle: "The moment it bursts",
            body: "When the water in the channel suddenly turns to **steam**, huge **pressure** builds up and pushes all the water above it out quickly.\n\nThe column of water and steam can shoot more than 50 meters into the air, and last anywhere from a few seconds to a few minutes.\n\nAfter the eruption, the water slowly refills and reheats, until the next eruption.",
          },
          {
            type: "content",
            title: "Fun fact",
            subtitle: "Fun fact",
            body: "The most famous geyser in the world is called \"Old Faithful,\" found in Yellowstone National Park in the United States — it erupts reliably about every 60 to 110 minutes.\n\nThere are fewer than 1,000 active geysers in the world, and most are found in areas with volcanic activity, like Yellowstone, Iceland, and New Zealand.",
          },
          {
            type: "content",
            title: "Every **Geyser** is different",
            subtitle: "Real-life connection",
            body: "Every geyser has its own **eruption interval** — some erupt every few minutes, and some only once every few hours or days.\n\nScientists study geysers to better understand activity beneath the Earth's surface, and sometimes even use that heat to produce clean electricity.\n\nGeyser areas are also a special home for tiny microbes that love extreme heat, which can barely be found anywhere else.",
          },
          {
            type: "content",
            title: "Class discussion",
            subtitle: "Questions about the lesson",
            body: "Why do you think a geyser erupts at set intervals, instead of just flowing steadily like a regular spring?\n\nWould you want to see a geyser erupt up close? Why or why not?",
          },
          { type: "games", title: "Time to practice!", subtitle: "Games" },
          {
            type: "content",
            title: "End of lesson",
            subtitle: "Well done!",
            body: "Thanks for participating!",
          },
        ],
      },
    },

    glacier: {
      id: "glacier",
      name: "פלאי הטבע - קרחון",
      nameMain: "פלאי הטבע",
      namePart: "קרחון",
      subject: "health",
      grades: ["ag", "dv", "zh"],
      topic: "glacier",
      gradeLabel: "כל הכיתות",
      duration: "20 דק'",
      summary: "מכירים קרחון מקרוב — איך שלג הופך לענק קרח שזורם לאט, ולמה קרחונים כל כך חשובים לכדור הארץ. עם משחק בסוף.",
      vocab: [
        { en: "קרחון", he: "גוש ענק של קרח שנוצר משלג דחוס במשך שנים רבות וזז לאט על הקרקע" },
        { en: "שלג דחוס", he: "שכבות שלג שנלחצות זו על זו במשך שנים והופכות לקרח קשה" },
        { en: "זרימת קרחון", he: "התנועה האיטית מאוד של הקרחון במורד ההר או העמק" },
        { en: "קרחון ימי", he: "קרחון שמגיע עד לים ולפעמים שובר ממנו חלקים לתוך המים" },
        { en: "קרחוני", he: "גוש קרח גדול שנשבר מקרחון ימי וצף באוקיינוס" },
        { en: "התכה", he: "התהליך שבו קרח הופך למים בגלל חום" },
        { en: "שכבת קרח", he: "שכבה אחת מתוך שכבות רבות שמרכיבות את הקרחון, כל אחת מתקופה אחרת" },
        { en: "מי קרחונים", he: "מים נקיים שמגיעים מהתכת קרחונים ומזינים נהרות ואגמים" },
      ],
      games: STANDARD_LESSON_GAMES,
      slides: [
        {
          type: "content",
          title: "מה זה **קרחון**?",
          subtitle: "פתיחה",
          body: "**קרחון** הוא גוש ענק של קרח שנוצר מ**שלג דחוס** שהצטבר במשך מאות ואלפי שנים, וזז לאט מאוד על פני הקרקע.\n\nקרחונים אפשר למצוא בהרים גבוהים ובאזורים קרים במיוחד, כמו הקוטב הצפוני והדרומי.\n\nהיום נלמד איך קרחון נוצר, איך הוא זז, ולמה הוא כל כך חשוב לכדור הארץ.",
        },
        {
          type: "content",
          title: "**מילים חשובות**",
          subtitle: "אוצר מושגים",
          body: "**שלג דחוס** — שכבות שלג שנלחצות זו על זו במשך שנים והופכות לקרח קשה.\n\n**זרימת קרחון** — התנועה האיטית מאוד של הקרחון במורד ההר.\n\n**קרחוני** — גוש קרח גדול שנשבר מקרחון ימי וצף באוקיינוס.",
        },
        {
          type: "content",
          title: "איך **קרחון** נוצר?",
          subtitle: "שנה אחר שנה",
          body: "בכל חורף יורד שלג חדש על אזורים קרים במיוחד, ובקיץ רק חלק ממנו נמס.\n\nמה שנשאר נדחס עם השנים בעזרת משקל ה**שכבות** שמעליו, עד שהוא הופך מ**שלג דחוס** לקרח קשה וכבד.\n\nכשהקרח מצטבר לגובה עצום, הוא נהיה כבד כל כך שהוא מתחיל לזוז לאט לאט במורד ההר — זוהי **זרימת קרחון**.",
        },
        {
          type: "content",
          title: "לאן **הקרחון** זז?",
          subtitle: "עד הים ובחזרה",
          body: "חלק מהקרחונים נשארים בהרים, אבל **קרחון ימי** ממשיך לזרום עד שהוא מגיע לאוקיינוס.\n\nכשקצה הקרחון הימי מגיע למים, לפעמים נשברים ממנו חלקים גדולים שצפים כ**קרחוני** ענקיים באוקיינוס.\n\nהתהליך הזה, שבו קרח נשבר ונופל למים, קורה באופן טבעי גם בקרחונים בריאים.",
        },
        {
          type: "content",
          title: "עובדה מרתקת",
          subtitle: "עובדה מרתקת",
          body: "קרחונים מסוימים זזים רק כמה סנטימטרים בשנה, בעוד אחרים יכולים לזוז מטרים רבים ביום — כמעט כמו נהר קרח איטי.\n\nכמעט 70 אחוז מכל המים המתוקים בעולם שמורים בתוך קרחונים וקרח קוטבי — יותר מבכל הנהרות והאגמים ביחד.",
        },
        {
          type: "content",
          title: "למה **קרחונים** חשובים?",
          subtitle: "חיבור לחיים",
          body: "מ**מי קרחונים** ניזונים נהרות ואגמים רבים בעולם, שמספקים מים נקיים לאנשים, לבעלי חיים ולחקלאות.\n\nמדענים עוקבים אחרי קרחונים כדי להבין שינויים באקלים של כדור הארץ, כי **התכה** מהירה מדי של קרחונים יכולה להשפיע על מפלס הים בכל העולם.\n\nקרחונים גם שומרים בתוכם \"רשומות\" של אוויר עתיק מלפני אלפי שנים, שעוזרות למדענים ללמוד איך האקלים השתנה עם הזמן.",
        },
        {
          type: "content",
          title: "דיון כיתתי",
          subtitle: "שאלות על השיעור",
          body: "למה לדעתכם חשוב לשמור על קרחונים בריאים, גם אם הם נמצאים רחוק מהבית שלנו?\n\nמה מכל מה שלמדנו על קרחונים הפתיע אתכם הכי הרבה?",
        },
        { type: "games", title: "זמן לתרגל!", subtitle: "משחקים" },
        {
          type: "content",
          title: "סוף השיעור",
          subtitle: "כל הכבוד!",
          body: "תודה על ההשתתפות!",
        },
      ],

      en: {
        name: "Wonders of Nature - Glacier",
        nameMain: "Wonders of Nature",
        namePart: "Glacier",
        summary: "Get to know glaciers up close — how snow turns into a giant slab of slowly flowing ice, and why glaciers matter so much to the Earth. With a game at the end.",
        vocab: [
          { en: "Glacier", he: "A huge block of ice formed from compacted snow over many years, that moves slowly over the ground." },
          { en: "Compacted snow", he: "Layers of snow pressed together over the years that turn into hard ice." },
          { en: "Glacier flow", he: "The very slow movement of a glacier down a mountain or valley." },
          { en: "Tidewater glacier", he: "A glacier that reaches all the way to the sea, sometimes breaking off pieces into the water." },
          { en: "Iceberg", he: "A huge block of ice that breaks off a tidewater glacier and floats in the ocean." },
          { en: "Melting", he: "The process by which ice turns into water because of heat." },
          { en: "Ice layer", he: "One layer among many that make up a glacier, each from a different time period." },
          { en: "Glacial meltwater", he: "Clean water that comes from melting glaciers and feeds rivers and lakes." },
        ],
        slides: [
          {
            type: "content",
            title: "What is a **Glacier**?",
            subtitle: "Opening",
            body: "A **glacier** is a huge block of ice formed from **compacted snow** that has built up over hundreds and thousands of years, and moves very slowly over the ground.\n\nGlaciers can be found on high mountains and in especially cold regions, like the North and South Poles.\n\nToday we'll learn how a glacier forms, how it moves, and why it matters so much to the Earth.",
          },
          {
            type: "content",
            title: "**Important words**",
            subtitle: "Vocabulary",
            body: "**Compacted snow** — layers of snow pressed together over the years that turn into hard ice.\n\n**Glacier flow** — the very slow movement of a glacier down a mountain.\n\n**Iceberg** — a huge block of ice that breaks off a tidewater glacier and floats in the ocean.",
          },
          {
            type: "content",
            title: "How does a **Glacier** form?",
            subtitle: "Year after year",
            body: "Every winter, new snow falls on especially cold regions, and in summer only some of it melts.\n\nWhat's left gets compacted over the years by the weight of the **layers** above it, until it turns from **compacted snow** into hard, heavy ice.\n\nWhen the ice piles up to a huge height, it gets so heavy that it starts to slowly move down the mountain — this is called **glacier flow**.",
          },
          {
            type: "content",
            title: "Where does a **Glacier** move?",
            subtitle: "To the sea and back",
            body: "Some glaciers stay in the mountains, but a **tidewater glacier** keeps flowing until it reaches the ocean.\n\nWhen the edge of a tidewater glacier reaches the water, sometimes large pieces break off and float as giant **icebergs** in the ocean.\n\nThis process, where ice breaks and falls into the water, happens naturally in healthy glaciers too.",
          },
          {
            type: "content",
            title: "Fun fact",
            subtitle: "Fun fact",
            body: "Some glaciers move just a few centimeters a year, while others can move many meters in a single day — almost like a slow river of ice.\n\nAlmost 70 percent of all the fresh water in the world is stored inside glaciers and polar ice — more than all the rivers and lakes combined.",
          },
          {
            type: "content",
            title: "Why are **Glaciers** important?",
            subtitle: "Real-life connection",
            body: "**Glacial meltwater** feeds many of the world's rivers and lakes, providing clean water to people, animals, and farms.\n\nScientists track glaciers to understand changes in Earth's climate, because glaciers **melting** too quickly can affect sea levels around the world.\n\nGlaciers also keep \"records\" of ancient air from thousands of years ago, which help scientists learn how the climate has changed over time.",
          },
          {
            type: "content",
            title: "Class discussion",
            subtitle: "Questions about the lesson",
            body: "Why do you think it's important to keep glaciers healthy, even if they're far from our home?\n\nWhat surprised you the most about everything we learned about glaciers?",
          },
          { type: "games", title: "Time to practice!", subtitle: "Games" },
          {
            type: "content",
            title: "End of lesson",
            subtitle: "Well done!",
            body: "Thanks for participating!",
          },
        ],
      },
    },

    vocabulary: {
      id: "vocabulary",
      name: "אנגלית - אוצר מילים בתמונות",
      nameMain: "אנגלית",
      namePart: "אוצר מילים בתמונות",
      subject: "english",
      grades: ["ag", "dv", "zh"],
      topic: "vocabulary",
      gradeLabel: "כל הכיתות",
      duration: "25 דק'",
      summary: "מכירים 20 מילים בסיסיות באנגלית דרך תמונות — בעלי חיים, אוכל, חפצים ודברים בטבע — ובונים איתן משפט ראשון. עם משחק בסוף.",
      vocab: Object.values(VOCAB_PICTURES).map(({ en, he }) => ({ en, he })),
      games: STANDARD_LESSON_GAMES,
      gameTopic: "vocabulary",
      slides: [
        {
          type: "content",
          title: "לומדים **מילים**",
          subtitle: "פתיחה",
          body: "היום נכיר 20 מילים.\nלכל מילה יש תמונה.\n\nלוחצים, שומעים ואומרים בקול:\nLook, listen and say!",
        },
        {
          type: "content",
          title: "**בעלי חיים**",
          subtitle: "Animals",
          pictures: [
            { en: "cat", he: "חתול", img: "/images/english/vocab/cat.svg" },
            { en: "dog", he: "כלב", img: "/images/english/vocab/dog.svg" },
            { en: "fish", he: "דג", img: "/images/english/vocab/fish.svg" },
            { en: "bird", he: "ציפור", img: "/images/english/vocab/bird.svg" },
          ],
        },
        {
          type: "content",
          title: "**אוכל**",
          subtitle: "Food",
          pictures: [
            { en: "apple", he: "תפוח", img: "/images/english/vocab/apple.svg" },
            { en: "banana", he: "בננה", img: "/images/english/vocab/banana.svg" },
            { en: "ice cream", he: "גלידה", img: "/images/english/vocab/icecream.svg" },
          ],
        },
        {
          type: "content",
          title: "**בבית ובבית הספר**",
          subtitle: "At home and at school",
          pictures: [
            { en: "book", he: "ספר", img: "/images/english/vocab/book.svg" },
            { en: "pencil", he: "עיפרון", img: "/images/english/vocab/pencil.svg" },
            { en: "cup", he: "כוס", img: "/images/english/vocab/cup.svg" },
            { en: "clock", he: "שעון", img: "/images/english/vocab/clock.svg" },
            { en: "ball", he: "כדור", img: "/images/english/vocab/ball.svg" },
          ],
        },
        {
          type: "content",
          title: "**בחוץ**",
          subtitle: "Outside",
          pictures: [
            { en: "house", he: "בית", img: "/images/english/vocab/house.svg" },
            { en: "car", he: "מכונית", img: "/images/english/vocab/car.svg" },
            { en: "umbrella", he: "מטרייה", img: "/images/english/vocab/umbrella.svg" },
            { en: "tree", he: "עץ", img: "/images/english/vocab/tree.svg" },
            { en: "flower", he: "פרח", img: "/images/english/vocab/flower.svg" },
          ],
        },
        {
          type: "content",
          title: "**בשמיים**",
          subtitle: "In the sky",
          pictures: [
            { en: "sun", he: "שמש", img: "/images/english/vocab/sun.svg" },
            { en: "moon", he: "ירח", img: "/images/english/vocab/moon.svg" },
            { en: "star", he: "כוכב", img: "/images/english/vocab/star.svg" },
          ],
        },
        {
          type: "content",
          title: "**This is a**",
          subtitle: "זה...",
          body: "זה — This is a\nThis is a cat.\nThis is a book.",
        },
        {
          type: "content",
          title: "**a** או **an**",
          subtitle: "לפני a, e, i, o, u",
          body: "לפני a, e, i, o, u אומרים an\nThis is an apple.\nThis is an umbrella.",
        },
        {
          type: "content",
          title: "**יותר מאחד**",
          subtitle: "רבים",
          body: "מוסיפים s בסוף:\none cat, two cats\none book, three books",
        },
        {
          type: "content",
          title: "טעויות נפוצות",
          subtitle: "שימו לב",
          body: "לא שוכחים את ה-a\nנכון:\nThis is a dog.\nלא נכון:\nThis is dog.",
        },
        {
          type: "quiz",
          title: "בואו **נבדוק**",
          subtitle: "שאלות",
          questions: [
            { q: "This is ___ apple.", he: "זה תפוח", options: ["a", "an"], answer: 1 },
            { q: "This is ___ dog.", he: "זה כלב", options: ["a", "an"], answer: 0 },
            { q: "one cat, two ___", he: "חתול אחד, שני חתולים", options: ["cat", "cats"], answer: 1 },
            { q: "This is ___ umbrella.", he: "זו מטריה", options: ["a", "an"], answer: 1 },
            { q: "one book, two ___", he: "ספר אחד, שני ספרים", options: ["book", "books"], answer: 1 },
            { q: "איך אומרים עץ באנגלית?", options: ["tree", "house", "car"], answer: 0 },
          ],
        },
        {
          type: "content",
          title: "דיון כיתתי",
          subtitle: "שאלות על השיעור",
          body: "איזו מילה חדשה אהבתם הכי הרבה היום?\n\nמה בכיתה אתם כבר יודעים להגיד באנגלית?",
        },
        { type: "games", title: "זמן לתרגל!", subtitle: "משחקים" },
        {
          type: "content",
          title: "סוף השיעור",
          subtitle: "כל הכבוד!",
          body: "תודה על ההשתתפות!",
        },
      ],

      en: {
        name: "English - Picture Vocabulary",
        nameMain: "English",
        namePart: "Picture Vocabulary",
        summary: "Learn 20 basic English words through pictures — animals, food, objects, and nature — and build a first sentence with them. With a game at the end.",
        slides: [
          {
            type: "content",
            title: "Learning **words** with **pictures**",
            subtitle: "Opening",
            body: "Today we'll meet 20 new English words — every word has a picture.\n\nClick each word to hear how to say it, and try saying it out loud:\nLook, listen and say!",
          },
          { type: "content", title: "**Animals**", subtitle: "בעלי חיים", pictures: vocabPictures("cat", "dog", "fish", "bird") },
          { type: "content", title: "**Food**", subtitle: "אוכל", pictures: vocabPictures("apple", "banana", "icecream") },
          { type: "content", title: "**At home and at school**", subtitle: "בבית ובבית הספר", pictures: vocabPictures("book", "pencil", "cup", "clock", "ball") },
          { type: "content", title: "**Outside**", subtitle: "בחוץ", pictures: vocabPictures("house", "car", "umbrella", "tree", "flower") },
          { type: "content", title: "**In the sky**", subtitle: "בשמיים", pictures: vocabPictures("sun", "moon", "star") },
          {
            type: "content",
            title: "A first sentence: **This is a**",
            subtitle: "First sentence",
            body: "With the new words we can already build a full sentence:\nThis is a cat.\nThis is a book.\n\nBefore a word that starts with a vowel (a, e, i, o, u) we say an instead of a:\nThis is an apple.\nThis is an umbrella.",
          },
          {
            type: "content",
            title: "**More than one**",
            subtitle: "Plurals",
            body: "When there is more than one, we add s to the end of the word:\none cat, two cats\none book, three books\none star, many stars\n\nNow you can count anything in English!",
          },
          {
            type: "content",
            title: "Common mistakes",
            subtitle: "Watch out",
            body: "A common mistake is forgetting a before the word. Correct:\nThis is a dog.\nNot:\nThis is dog.\n\nAnother mistake is saying a before a word that starts with a vowel. Correct:\nThis is an apple.",
          },
          {
            type: "content",
            title: "Class discussion",
            subtitle: "Questions about the lesson",
            body: "Which new word did you like most today? How do you say it in English?\n\nLook around the classroom — which objects can you already name in English?",
          },
          { type: "games", title: "Time to practice!", subtitle: "Games" },
          {
            type: "content",
            title: "End of lesson",
            subtitle: "Well done!",
            body: "Thanks for participating!",
          },
        ],
      },
    },

  };

  // Vocabulary-by-topic lessons, one per category in english-vocab.js (loaded
  // before this file on the pages that show them): an opening, the words in
  // picture slides of four or five, example sentences, a class discussion
  // and the games.
  function vocabCategoryLesson(cat) {
    const pictures = cat.words.map((w) => ({ en: w.en, he: w.he, img: `/images/english/vocab/${w.id}.svg` }));
    // The sentences' translations also open from the popup (the English
    // version of the slide shows the English lines alone).
    if (window.LESSON_SENTENCES_HE) {
      cat.sentences.forEach((s) => { window.LESSON_SENTENCES_HE[s.en] ??= s.he; });
    }
    const perSlide = pictures.length % 5 === 0 ? 5 : 4;
    const groups = [];
    for (let i = 0; i < pictures.length; i += perSlide) groups.push(pictures.slice(i, i + perSlide));
    // A last slide with a single picture joins the one before it.
    if (groups.length > 1 && groups[groups.length - 1].length === 1) groups[groups.length - 2].push(...groups.pop());
    // English lines become speakable sentences in the player (no ** inside them).
    const sentences = cat.sentences.map((s) => `${s.en}\n${s.he}`).join("\n\n");
    const sentencesEn = cat.sentences.map((s) => s.en).join("\n\n");
    const count = pictures.length;
    return {
      id: `vocab-${cat.id}`,
      name: `אנגלית - אוצר מילים: ${cat.title}`,
      nameMain: "אנגלית",
      namePart: `אוצר מילים: ${cat.title}`,
      subject: "english",
      grades: ["ag", "dv", "zh"],
      topic: "vocab-topics",
      gradeLabel: "כל הכיתות",
      duration: "20 דק'",
      summary: `מכירים ${count} מילים באנגלית בנושא ${cat.title} — לכל מילה יש תמונה, ואפשר לשמוע איך אומרים אותה. עם משחק בסוף.`,
      vocab: pictures.map(({ en, he }) => ({ en, he })),
      games: STANDARD_LESSON_GAMES,
      gameTopic: `vocab-${cat.id}`,
      slides: [
        {
          type: "content",
          title: `לומדים מילים: **${cat.title}**`,
          subtitle: "פתיחה",
          body: `היום נכיר ${count} מילים באנגלית בנושא ${cat.title} — לכל מילה יש תמונה.\n\nלחצו על כל מילה כדי לשמוע איך אומרים אותה, ונסו להגיד אותה בקול:\nLook, listen and say!`,
        },
        ...groups.map((group) => ({ type: "content", title: `**${cat.title}**`, subtitle: cat.titleEn, pictures: group })),
        { type: "content", title: "משפטים עם **המילים**", subtitle: "משפטים", body: sentences },
        { type: "content", title: "דיון כיתתי", subtitle: "שאלות על השיעור", body: cat.discussion.he.join("\n\n") },
        { type: "games", title: "זמן לתרגל!", subtitle: "משחקים" },
        { type: "content", title: "סוף השיעור", subtitle: "כל הכבוד!", body: "תודה על ההשתתפות!" },
      ],
      en: {
        name: `English - Vocabulary: ${cat.titleEn}`,
        nameMain: "English",
        namePart: `Vocabulary: ${cat.titleEn}`,
        summary: `Learn ${count} English words about ${cat.titleEn.toLowerCase()} — every word has a picture and you can hear how to say it. With a game at the end.`,
        slides: [
          {
            type: "content",
            title: `Learning words: **${cat.titleEn}**`,
            subtitle: "Opening",
            body: `Today we'll meet ${count} English words about ${cat.titleEn.toLowerCase()} — every word has a picture.\n\nClick each word to hear how to say it, and try saying it out loud:\nLook, listen and say!`,
          },
          ...groups.map((group) => ({ type: "content", title: `**${cat.titleEn}**`, subtitle: cat.title, pictures: group })),
          { type: "content", title: "Sentences with **the words**", subtitle: "Sentences", body: sentencesEn },
          { type: "content", title: "Class discussion", subtitle: "Questions about the lesson", body: cat.discussion.en.join("\n\n") },
          { type: "games", title: "Time to practice!", subtitle: "Games" },
          { type: "content", title: "End of lesson", subtitle: "Well done!", body: "Thanks for participating!" },
        ],
      },
    };
  }

  (window.ENGLISH_VOCAB_CATEGORIES || []).forEach((cat) => {
    LESSON_CATALOG[`vocab-${cat.id}`] = vocabCategoryLesson(cat);
  });

  // Short English lessons (english-lessons.js): a grammar topic split into
  // short lessons. Each entry gets the slides every lesson ends with — the
  // quiz, the class discussion, the games and the end slide. `num` / `count`
  // number the lesson inside its topic ("פועל להיות 2 – לא ושאלות").
  function shortEnglishLesson(entry, num, count) {
    const numbered = count > 1 ? `${entry.name} ${num}` : entry.name;
    return {
      id: entry.id,
      name: `אנגלית - ${numbered}`,
      nameMain: "אנגלית",
      namePart: count > 1 && entry.part ? `${numbered} – ${entry.part}` : entry.name,
      partTitle: entry.part || "",
      subject: "english",
      grades: ["ag", "dv", "zh"],
      topic: entry.topic,
      gradeLabel: "כל הכיתות",
      duration: "15 דק'",
      summary: entry.summary,
      vocab: entry.vocab.map(([en, he]) => ({ en, he })),
      games: STANDARD_LESSON_GAMES,
      slides: [
        ...entry.slides.map(({ examples, compare, ...slide }) => ({
          type: "content",
          ...slide,
          ...(examples && { examples: examples.map(([en, he]) => ({ en, he })) }),
          ...(compare && { compare: { wrong: compare[0], right: compare[1] } }),
        })),
        {
          type: "quiz",
          title: "בואו **נבדוק**",
          subtitle: "שאלות",
          questions: entry.quiz.map(([q, he, options, answer, why]) => ({ q, ...(he && { he }), options, answer, why })),
        },
        { type: "content", title: "דיון כיתתי", subtitle: "שאלות על השיעור", body: entry.discuss.join("\n\n") },
        { type: "games", title: "זמן לתרגל!", subtitle: "משחקים" },
        { type: "content", title: "סוף השיעור", subtitle: "כל הכבוד!", body: "תודה על ההשתתפות!" },
      ],
    };
  }

  const shortLessons = window.ENGLISH_SHORT_LESSONS || [];
  shortLessons.forEach((entry) => {
    const siblings = shortLessons.filter((other) => other.topic === entry.topic);
    LESSON_CATALOG[entry.id] = shortEnglishLesson(entry, siblings.indexOf(entry) + 1, siblings.length);
  });
  // The long lesson a split topic had kept its topic's id ("tobe"); old links
  // and saved progress open the topic's first short lesson. Not enumerable,
  // so nothing that lists the catalog shows it twice.
  shortLessons.forEach((entry) => {
    if (LESSON_CATALOG[entry.topic]) return;
    Object.defineProperty(LESSON_CATALOG, entry.topic, { value: LESSON_CATALOG[entry.id], enumerable: false });
  });

  const LESSON_TOPICS = {
    english: {
      ag: [
        { id: "letters", label: "אותיות וצלילים" },
        { id: "phonics", label: "צירופי אותיות" },
        { id: "pronouns", label: "כינויי גוף" },
        { id: "possessives", label: "כינויי שייכות" },
        { id: "verbs", label: "פעלים" },
        { id: "tobe", label: "פועל להיות (To Be)" },
        { id: "have-has", label: "יש לי, יש לו (Have / Has)" },
        { id: "there-is", label: "יש: There is / There are" },
        { id: "vocabulary", label: "אוצר מילים בתמונות" },
        { id: "calendar", label: "ימים, חודשים ועונות" },
        { id: "telling-time", label: "מה השעה?" },
        { id: "prepositions", label: "מילות יחס ומיקום" },
        { id: "connectors", label: "מילות קישור" },
        { id: "plurals", label: "יחיד ורבים" },
        { id: "quantifiers", label: "כמויות: some, any, much, many" },
        { id: "articles", label: "מילות הצבעה ויידוע" },
        { id: "comparatives", label: "השוואה: bigger, the biggest" },
        { id: "questions", label: "מילות שאלה" },
        { id: "negation", label: "שלילה ושאלות" },
        { id: "frequency", label: "תדירות: always, usually, never" },
        { id: "tenses", label: "זמנים בסיסיים" },
        { id: "progressive", label: "הווה מתמשך" },
        { id: "going-to", label: "עתיד: going to" },
        { id: "irregular-verbs", label: "פעלים חשובים" },
        { id: "modals", label: "חובה ועצה: must, should, have to" },
        { id: "word-building", label: "בניית מילים: un-, re-, -er, -ful" },
        { id: "bagrut", label: "שאלות בגרות" },
        { id: "vocab-topics", label: "אוצר מילים לפי נושאים", labelEn: "Vocabulary by topic" },
      ],
      dv: [
        { id: "letters", label: "אותיות וצלילים" },
        { id: "phonics", label: "צירופי אותיות" },
        { id: "pronouns", label: "כינויי גוף" },
        { id: "possessives", label: "כינויי שייכות" },
        { id: "verbs", label: "פעלים" },
        { id: "tobe", label: "פועל להיות (To Be)" },
        { id: "have-has", label: "יש לי, יש לו (Have / Has)" },
        { id: "there-is", label: "יש: There is / There are" },
        { id: "vocabulary", label: "אוצר מילים בתמונות" },
        { id: "calendar", label: "ימים, חודשים ועונות" },
        { id: "telling-time", label: "מה השעה?" },
        { id: "prepositions", label: "מילות יחס ומיקום" },
        { id: "connectors", label: "מילות קישור" },
        { id: "plurals", label: "יחיד ורבים" },
        { id: "quantifiers", label: "כמויות: some, any, much, many" },
        { id: "articles", label: "מילות הצבעה ויידוע" },
        { id: "comparatives", label: "השוואה: bigger, the biggest" },
        { id: "questions", label: "מילות שאלה" },
        { id: "negation", label: "שלילה ושאלות" },
        { id: "frequency", label: "תדירות: always, usually, never" },
        { id: "tenses", label: "זמנים בסיסיים" },
        { id: "progressive", label: "הווה מתמשך" },
        { id: "going-to", label: "עתיד: going to" },
        { id: "irregular-verbs", label: "פעלים חשובים" },
        { id: "modals", label: "חובה ועצה: must, should, have to" },
        { id: "word-building", label: "בניית מילים: un-, re-, -er, -ful" },
        { id: "bagrut", label: "שאלות בגרות" },
        { id: "vocab-topics", label: "אוצר מילים לפי נושאים", labelEn: "Vocabulary by topic" },
      ],
      zh: [
        { id: "letters", label: "אותיות וצלילים" },
        { id: "phonics", label: "צירופי אותיות" },
        { id: "pronouns", label: "כינויי גוף" },
        { id: "possessives", label: "כינויי שייכות" },
        { id: "verbs", label: "פעלים" },
        { id: "tobe", label: "פועל להיות (To Be)" },
        { id: "have-has", label: "יש לי, יש לו (Have / Has)" },
        { id: "there-is", label: "יש: There is / There are" },
        { id: "vocabulary", label: "אוצר מילים בתמונות" },
        { id: "calendar", label: "ימים, חודשים ועונות" },
        { id: "telling-time", label: "מה השעה?" },
        { id: "prepositions", label: "מילות יחס ומיקום" },
        { id: "connectors", label: "מילות קישור" },
        { id: "plurals", label: "יחיד ורבים" },
        { id: "quantifiers", label: "כמויות: some, any, much, many" },
        { id: "articles", label: "מילות הצבעה ויידוע" },
        { id: "comparatives", label: "השוואה: bigger, the biggest" },
        { id: "questions", label: "מילות שאלה" },
        { id: "negation", label: "שלילה ושאלות" },
        { id: "frequency", label: "תדירות: always, usually, never" },
        { id: "tenses", label: "זמנים בסיסיים" },
        { id: "progressive", label: "הווה מתמשך" },
        { id: "going-to", label: "עתיד: going to" },
        { id: "irregular-verbs", label: "פעלים חשובים" },
        { id: "modals", label: "חובה ועצה: must, should, have to" },
        { id: "word-building", label: "בניית מילים: un-, re-, -er, -ful" },
        { id: "bagrut", label: "שאלות בגרות" },
        { id: "vocab-topics", label: "אוצר מילים לפי נושאים", labelEn: "Vocabulary by topic" },
      ],
    },
    lifeskills: {
      ag: [
        { id: "money", label: "ניהול כסף וקניות חכמות" },
        { id: "time", label: "ניהול זמן ותכנון" },
        { id: "communication", label: "תקשורת ופתרון קונפליקטים" },
        { id: "safety", label: "בטיחות ברשת" },
      ],
      dv: [
        { id: "money", label: "ניהול כסף וקניות חכמות" },
        { id: "time", label: "ניהול זמן ותכנון" },
        { id: "communication", label: "תקשורת ופתרון קונפליקטים" },
        { id: "safety", label: "בטיחות ברשת" },
      ],
      zh: [
        { id: "money", label: "ניהול כסף וקניות חכמות" },
        { id: "time", label: "ניהול זמן ותכנון" },
        { id: "communication", label: "תקשורת ופתרון קונפליקטים" },
        { id: "safety", label: "בטיחות ברשת" },
      ],
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
    health: {
      ag: [
        { id: "volcano", label: "הר געש" },
        { id: "tsunami", label: "צונאמי" },
        { id: "earthquake", label: "רעידת אדמה" },
        { id: "hurricane", label: "הוריקן" },
        { id: "tornado", label: "טורנדו" },
        { id: "thunderstorm", label: "ברקים ורעמים" },
        { id: "avalanche", label: "מפולת שלגים" },
        { id: "rainbow", label: "קשת בענן" },
        { id: "aurora", label: "זוהר קוטבי" },
        { id: "geyser", label: "גייזר" },
        { id: "glacier", label: "קרחון" },
      ],
      dv: [
        { id: "volcano", label: "הר געש" },
        { id: "tsunami", label: "צונאמי" },
        { id: "earthquake", label: "רעידת אדמה" },
        { id: "hurricane", label: "הוריקן" },
        { id: "tornado", label: "טורנדו" },
        { id: "thunderstorm", label: "ברקים ורעמים" },
        { id: "avalanche", label: "מפולת שלגים" },
        { id: "rainbow", label: "קשת בענן" },
        { id: "aurora", label: "זוהר קוטבי" },
        { id: "geyser", label: "גייזר" },
        { id: "glacier", label: "קרחון" },
      ],
      zh: [
        { id: "volcano", label: "הר געש" },
        { id: "tsunami", label: "צונאמי" },
        { id: "earthquake", label: "רעידת אדמה" },
        { id: "hurricane", label: "הוריקן" },
        { id: "tornado", label: "טורנדו" },
        { id: "thunderstorm", label: "ברקים ורעמים" },
        { id: "avalanche", label: "מפולת שלגים" },
        { id: "rainbow", label: "קשת בענן" },
        { id: "aurora", label: "זוהר קוטבי" },
        { id: "geyser", label: "גייזר" },
        { id: "glacier", label: "קרחון" },
      ],
    },
    body: {
      ag: [
        { id: "health", label: "הלב" },
        { id: "lungs", label: "ריאות ונשימה" },
        { id: "brain", label: "המוח" },
        { id: "skeleton", label: "שרירים ועצמות" },
        { id: "digestion", label: "מערכת העיכול" },
      ],
      dv: [
        { id: "health", label: "הלב" },
        { id: "lungs", label: "ריאות ונשימה" },
        { id: "brain", label: "המוח" },
        { id: "skeleton", label: "שרירים ועצמות" },
        { id: "digestion", label: "מערכת העיכול" },
      ],
      zh: [
        { id: "health", label: "הלב" },
        { id: "lungs", label: "ריאות ונשימה" },
        { id: "brain", label: "המוח" },
        { id: "skeleton", label: "שרירים ועצמות" },
        { id: "digestion", label: "מערכת העיכול" },
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
      if (!menu) return;
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
      const subjects = state.subject === "all" ? ACTIVE_SUBJECTS : [state.subject];
      const grades = state.grade === "all" ? ["ag", "dv", "zh"] : [state.grade];
      const seen = new Map();
      subjects.forEach((subject) => {
        grades.forEach((grade) => {
          (LESSON_TOPICS[subject]?.[grade] || []).forEach((topic) => {
            if (!seen.has(topic.id)) {
              // Derive the label from the lesson itself (already localized)
              // instead of duplicating translated topic names separately.
              const topicLesson = localizeLesson(LESSON_CATALOG[topic.id]);
              const plain = curLang() === "en" && topic.labelEn ? topic.labelEn : topic.label;
              // A split topic's id leads to its first short lesson, whose
              // name is only that lesson's ("פועל להיות 1 – ...").
              const ownLesson = topicLesson && topicLesson.id === topic.id;
              const label = ownLesson ? topicLesson.namePart || topicLesson.nameMain || plain : plain;
              seen.set(topic.id, label);
            }
          });
        });
      });
      return [{ id: "all", label: gradeGroupLabel("all") }, ...[...seen.entries()].map(([id, label]) => ({ id, label }))];
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
      if (topicValue) topicValue.textContent = current?.label || gradeGroupLabel("all");

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
        const inActiveSubjects = ACTIVE_SUBJECTS.includes(lesson.subject);
        const matchSubject =
          inActiveSubjects && (state.subject === "all" || lesson.subject === state.subject);
        const matchGrade = state.grade === "all" || lesson.grades.includes(state.grade);
        const matchTopic = state.topic === "all" || lesson.topic === state.topic;
        const show = matchSubject && matchGrade && matchTopic;
        card.classList.toggle("hidden", !show);
        if (show) visible += 1;
      });
      empty?.classList.toggle("hidden", visible > 0);
    }

    // Card titles sit in a fixed square (see lesson-player.css) with
    // overflow:hidden — a long title (more likely in English than in the
    // original short Hebrew labels) can overflow that box and hide the
    // subtitle underneath it. Shrink via --card-fit the same way
    // fitSlideContent() shrinks dense lesson slides, instead of clipping.
    const CARD_FIT_MIN = 0.55;
    const CARD_FIT_STEP = 0.05;
    function fitLessonCardTitle(wrap) {
      if (!wrap) return;
      wrap.style.removeProperty("--card-fit");
      const nameEl = $(".svc-lesson-name", wrap);
      const partEl = $(".svc-lesson-part", wrap);
      if (!nameEl && !partEl) return;
      // wrap is absolutely positioned (inset: 0) so its own scrollHeight
      // never reflects overflowing children — measure the two text lines
      // directly against the padding-box space actually available for them.
      const cs = getComputedStyle(wrap);
      const available = wrap.clientHeight - parseFloat(cs.paddingTop || "0") - parseFloat(cs.paddingBottom || "0");
      const gap = nameEl && partEl ? parseFloat(cs.rowGap || cs.gap || "0") || 0 : 0;
      const needed = () => (nameEl?.offsetHeight || 0) + (partEl?.offsetHeight || 0) + gap;
      let scale = 1;
      while (scale > CARD_FIT_MIN + 1e-6 && needed() > available) {
        scale = Math.max(CARD_FIT_MIN, scale - CARD_FIT_STEP);
        wrap.style.setProperty("--card-fit", scale.toFixed(2));
      }
    }

    if (typeof ResizeObserver !== "undefined") {
      cards.forEach((card) => {
        const preview = $(".svc-lesson-preview", card);
        const wrap = $(".svc-lesson-title-wrap", card);
        if (!preview || !wrap) return;
        // Observe the fixed-size outer square, not the wrap we resize the
        // font of, so shrinking the font doesn't retrigger the observer.
        new ResizeObserver(() => fitLessonCardTitle(wrap)).observe(preview);
      });
    }

    function relabelLessonCards() {
      const lang = curLang();
      cards.forEach((card) => {
        const lesson = localizeLesson(LESSON_CATALOG[card.dataset.lesson]);
        if (!lesson) return;
        const nameEl = $(".svc-lesson-name", card);
        const partEl = $(".svc-lesson-part", card);
        if (nameEl) nameEl.textContent = lesson.nameMain || lesson.name;
        if (partEl) partEl.textContent = lesson.namePart || "";
        const openBtn = $(".js-lesson-open", card);
        if (openBtn && !openBtn.hidden) openBtn.textContent = lang === "en" ? "Open" : "פתיחה";
        const infoToggle = $(".svc-lesson-info-toggle", card);
        if (infoToggle) infoToggle.setAttribute("aria-label", lang === "en" ? "Lesson info" : "מידע על השיעור");
        const badge = $(".svc-lesson-learned-badge", card);
        if (badge) badge.textContent = lang === "en" ? "Learned" : "נלמד";
        fitLessonCardTitle($(".svc-lesson-title-wrap", card));
      });
      if (empty) {
        empty.textContent =
          lang === "en" ? "No lessons match these filters." : "לא נמצאו שיעורים לפי הסינון.";
      }
    }

    function relabelFilterMenus() {
      $$("button[data-subject]", filtersRoot).forEach((btn) => {
        btn.textContent = btn.dataset.subject === "all" ? gradeGroupLabel("all") : subjectLabel(btn.dataset.subject);
      });
      $$("button[data-grade]", filtersRoot).forEach((btn) => {
        btn.textContent = gradeGroupLabel(btn.dataset.grade);
      });
      if (subjectValue) {
        subjectValue.textContent = state.subject === "all" ? gradeGroupLabel("all") : subjectLabel(state.subject);
      }
      if (gradeValue) gradeValue.textContent = gradeGroupLabel(state.grade);
      renderTopicMenu();
      relabelLessonCards();
    }

    window.addEventListener("gameclass:lang", relabelFilterMenus);

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
    relabelFilterMenus();
  }

  function showToast(msg) {
    const t = $("#toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.remove("hidden");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => t.classList.add("hidden"), 2800);
  }

  // --- Favorite lessons (requires login; synced to Firestore) ---
  let favoriteLessonIds = new Set();

  async function refreshFavoriteLessons() {
    if (!window.GameAuth?.getUser()) {
      favoriteLessonIds = new Set();
      return;
    }
    try {
      favoriteLessonIds = new Set(await UserData.getFavoriteLessons());
    } catch (err) {
      console.error(err);
    }
  }

  function syncFavBtnState(lessonId) {
    if (!lessonId) return;
    const modalBtn = $("#lessonInfoFavBtn");
    if (modalBtn?.dataset.lesson !== lessonId) return;
    const active = favoriteLessonIds.has(lessonId);
    const label =
      curLang() === "en"
        ? active
          ? "Remove lesson from saved"
          : "Save lesson"
        : active
          ? "הסרת השיעור מהשמורים"
          : "שמירת השיעור";
    modalBtn.classList.toggle("is-active", active);
    modalBtn.setAttribute("aria-pressed", active ? "true" : "false");
    modalBtn.setAttribute("aria-label", label);
  }

  function syncAllFavButtons() {
    const lessonId = $("#lessonInfoFavBtn")?.dataset.lesson;
    if (lessonId) syncFavBtnState(lessonId);
  }

  const FAV_CONFETTI_COLORS = ["#ff3b5c", "#ffd23f", "#4da6ff", "#7ee08c", "#c792ff"];

  function spawnFavConfetti(btn) {
    if (!btn) return;
    const layer = document.createElement("span");
    layer.className = "fav-confetti";
    const pieceCount = 10;
    for (let i = 0; i < pieceCount; i++) {
      const piece = document.createElement("span");
      piece.className = "fav-confetti-piece";
      const angle = (Math.PI * 2 * i) / pieceCount + (Math.random() * 0.5 - 0.25);
      const distance = 22 + Math.random() * 14;
      piece.style.setProperty("--fav-confetti-x", `${Math.cos(angle) * distance}px`);
      piece.style.setProperty("--fav-confetti-y", `${Math.sin(angle) * distance}px`);
      piece.style.setProperty("--fav-confetti-rot", `${Math.floor(Math.random() * 360)}deg`);
      piece.style.setProperty("--fav-confetti-delay", `${Math.random() * 0.05}s`);
      piece.style.background = FAV_CONFETTI_COLORS[i % FAV_CONFETTI_COLORS.length];
      layer.appendChild(piece);
    }
    btn.appendChild(layer);
    setTimeout(() => layer.remove(), 900);

    btn.classList.remove("just-activated");
    void btn.offsetWidth;
    btn.classList.add("just-activated");
    setTimeout(() => btn.classList.remove("just-activated"), 600);
  }

  async function toggleFavoriteLesson(lessonId, btn) {
    if (!window.GameAuth?.getUser()) {
      showToast(curLang() === "en" ? "Log in before saving lessons" : "לא ניתן לשמור את השיעור לפני התחברות למערכת");
      window.GameAuth?.handleLoginClick({ redirect: false });
      return;
    }

    const res = await UserData.toggleFavoriteLesson(lessonId);
    if (!res.ok) {
      showToast(res.error || (curLang() === "en" ? "Couldn't save right now" : "לא ניתן לשמור כרגע"));
      return;
    }

    if (res.favorited) {
      favoriteLessonIds.add(lessonId);
      spawnFavConfetti(btn);
    } else {
      favoriteLessonIds.delete(lessonId);
    }
    syncFavBtnState(lessonId);
    showToast(
      curLang() === "en"
        ? res.favorited
          ? "Lesson saved"
          : "Lesson removed from saved"
        : res.favorited
          ? "השיעור נשמר"
          : "השיעור הוסר מהשמורים"
    );
  }

  function isLessonLocked(lesson) {
    return !!lesson?.premium && !window.PleyiPremium?.hasPremium?.();
  }

  function setLessonOpenButtonState(openBtn, lesson) {
    if (!openBtn || !lesson) return;
    const locked = isLessonLocked(lesson);
    openBtn.hidden = locked;
    if (!locked) openBtn.textContent = curLang() === "en" ? "Open" : "פתיחה";
  }

  function openLessonInfoModal(lessonId) {
    const lesson = localizeLesson(LESSON_CATALOG[lessonId]);
    const modal = $("#lessonInfoModal");
    if (!lesson || !modal) return;

    modal.classList.remove("hidden");

    $("#lessonInfoTitle").textContent = lesson.nameMain || lesson.name;
    $("#lessonInfoSubject").textContent = subjectLabel(lesson.subject);
    $("#lessonInfoGrade").textContent = formatGradeLabel(lesson.gradeLabel);
    $("#lessonInfoDuration").textContent = formatDuration(lesson.duration);
    $("#lessonInfoSummary").textContent = lesson.summary;
    $("#lessonInfoLearnedBadge")?.classList.toggle("hidden", !getLearnedLessons().includes(lessonId));
    $("#lessonInfoPremiumBadge")?.classList.toggle("hidden", !lesson.premium || !!window.PleyiPremium?.hasPremium?.());

    const openBtn = $("#lessonInfoOpenBtn");
    if (openBtn) {
      openBtn.dataset.lesson = lessonId;
      setLessonOpenButtonState(openBtn, lesson);
    }
    const shareBtn = $("#lessonInfoShareBtn");
    if (shareBtn) shareBtn.dataset.lesson = lessonId;
    const shareLabel = $("#lessonInfoShareLabel");
    if (shareLabel) shareLabel.textContent = curLang() === "en" ? "Share lesson" : "שיתוף השיעור";
    const links = buildShareLinks(lessonId);
    const waLink = $("#lessonInfoShareWhatsapp");
    if (waLink && links) waLink.href = links.whatsapp;
    const emailLink = $("#lessonInfoShareEmail");
    if (emailLink && links) emailLink.href = links.email;

    const favBtn = $("#lessonInfoFavBtn");
    if (favBtn) favBtn.dataset.lesson = lessonId;
    syncFavBtnState(lessonId);
  }

  function closeLessonInfoModal() {
    $("#lessonInfoModal")?.classList.add("hidden");
  }

  function buildShareLinks(lessonId) {
    const lesson = localizeLesson(LESSON_CATALOG[lessonId]);
    if (!lesson) return null;
    const url = `${window.location.origin}${LESSON_SHARE_PATH}?lesson=${encodeURIComponent(lessonId)}`;
    const name = lesson.nameMain || lesson.name;
    const text =
      curLang() === "en" ? `Come learn "${name}" with Pleyi!` : `בואו ללמוד את השיעור "${name}" עם Pleyi!`;
    const title = curLang() === "en" ? `Lesson: ${name}` : `שיעור: ${name}`;
    return {
      url,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
      email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`,
    };
  }

  async function copyShareLink(lessonId) {
    const links = buildShareLinks(lessonId);
    if (!links) return;
    const shareLabel = $("#lessonInfoShareLabel");
    try {
      await navigator.clipboard.writeText(links.url);
      if (shareLabel) {
        const copiedLabel = curLang() === "en" ? "Link copied!" : "הקישור הועתק!";
        const shareLabelText = curLang() === "en" ? "Share lesson" : "שיתוף השיעור";
        shareLabel.textContent = copiedLabel;
        setTimeout(() => {
          if (shareLabel.textContent === copiedLabel) shareLabel.textContent = shareLabelText;
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

      const preview = $(".svc-lesson-preview", card);
      preview?.addEventListener("click", (e) => {
        if (e.target.closest(".svc-lesson-info-toggle")) {
          e.preventDefault();
          e.stopPropagation();
          openLessonInfoModal(card.dataset.lesson);
          return;
        }
        const lessonId = card.dataset.lesson;
        const lesson = LESSON_CATALOG[lessonId];
        if (!lesson) return;
        e.preventDefault();
        e.stopPropagation();
        if (isLessonLocked(lesson)) {
          window.PleyiPremium?.ensureLessonAccess?.(lessonId, lesson.nameMain || lesson.name);
          return;
        }
        openLessonSlides?.(lessonId);
      });
    });

    $("#lessonInfoClose")?.addEventListener("click", closeLessonInfoModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeLessonInfoModal();
    });
    $("#lessonInfoOpenBtn")?.addEventListener("click", closeLessonInfoModal);
    $("#lessonInfoFavBtn")?.addEventListener("click", (e) => {
      toggleFavoriteLesson(e.currentTarget.dataset.lesson, e.currentTarget);
    });

    const shareBtn = $("#lessonInfoShareBtn");
    const shareMenu = $("#lessonInfoShareMenu");
    function closeShareMenu() {
      shareMenu?.classList.add("hidden");
      shareBtn?.setAttribute("aria-expanded", "false");
    }
    shareBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      const willOpen = shareMenu?.classList.contains("hidden");
      closeShareMenu();
      if (willOpen) {
        shareMenu?.classList.remove("hidden");
        shareBtn.setAttribute("aria-expanded", "true");
      }
    });
    shareMenu?.addEventListener("click", (e) => e.stopPropagation());
    $("#lessonInfoShareCopy")?.addEventListener("click", () => {
      copyShareLink(shareBtn?.dataset.lesson);
      closeShareMenu();
    });
    $("#lessonInfoShareWhatsapp")?.addEventListener("click", closeShareMenu);
    $("#lessonInfoShareEmail")?.addEventListener("click", closeShareMenu);
    document.addEventListener("click", closeShareMenu);

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (!shareMenu?.classList.contains("hidden")) {
        closeShareMenu();
        return;
      }
      if (!modal.classList.contains("hidden")) closeLessonInfoModal();
    });
  }

  function tryOpenSharedLesson() {
    const lessonId = new URLSearchParams(window.location.search).get("lesson");
    if (lessonId && LESSON_CATALOG[lessonId]) openLessonSlides?.(lessonId);
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
    // Pages that embed the player without the lesson grid have no card.
    const card = $(`.svc-lesson-card[data-lesson="${lessonId}"]`);
    if (!card) return;
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

  function parseYoutubeId(input) {
    if (!input) return "";
    const str = String(input).trim();
    if (/^[\w-]{11}$/.test(str)) return str;
    try {
      const url = new URL(str);
      if (url.hostname.includes("youtu.be")) return url.pathname.slice(1).split("/")[0];
      if (url.hostname.includes("youtube.com")) {
        if (url.pathname.startsWith("/embed/")) return url.pathname.split("/")[2] || "";
        return url.searchParams.get("v") || "";
      }
    } catch {
      /* not a URL */
    }
    return "";
  }

  function renderYoutubeEmbed(input, title = "סרטון YouTube") {
    const id = parseYoutubeId(input);
    if (!id) return "";
    const src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?rel=0&modestbranding=1&playsinline=1`;
    return `
      <div class="lp-slide-video">
        <div class="lp-slide-video-frame">
          <iframe
            src="${src}"
            title="${escAttr(title)}"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            loading="lazy"
          ></iframe>
        </div>
      </div>`;
  }

  function containsHebrew(str) {
    return /[֐-׿]/.test(str);
  }

  function containsLatinLetter(str) {
    return /[A-Za-z]/.test(str);
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function isHebrewLetter(ch) {
    return /[\u0590-\u05FF]/.test(ch);
  }

  // Word-boundary check for the glossary-term matcher below. Must cover Latin
  // letters too (not just Hebrew) so English lesson content doesn't match a
  // term as a substring inside a longer word (e.g. "Heart" inside "Heartbeat").
  function isWordLetter(ch) {
    return /[\u0590-\u05FFA-Za-z]/.test(ch);
  }

  // `buildReplacement` receives the exact matched substring (preserving its
  // original casing) so "Magma" in the vocab list still matches — and
  // displays correctly as — a lowercase "magma" written mid-sentence.
  // Hebrew has no letter casing, so this is a no-op there; it only matters
  // now that lesson content can be English.
  function replaceTermInPlainText(text, word, buildReplacement, once = false) {
    const needle = escHtml(word);
    if (!needle) return text;
    const needleLower = needle.toLowerCase();
    const textLower = text.toLowerCase();
    let result = "";
    let i = 0;
    while (i < text.length) {
      const idx = textLower.indexOf(needleLower, i);
      if (idx === -1) {
        result += text.slice(i);
        break;
      }
      const before = idx > 0 ? text[idx - 1] : "";
      const after = idx + needle.length < text.length ? text[idx + needle.length] : "";
      const atBoundary =
        (!before || !isWordLetter(before)) && (!after || !isWordLetter(after));
      if (atBoundary) {
        const matched = text.slice(idx, idx + needle.length);
        result += text.slice(i, idx) + buildReplacement(matched);
        if (once) return result + text.slice(idx + needle.length);
        i = idx + needle.length;
      } else {
        result += text.slice(i, idx + 1);
        i = idx + 1;
      }
    }
    return result;
  }

  function replaceOutsideTags(html, search, buildReplacement, { once = false } = {}) {
    if (!search) return html;
    let replaced = false;
    return html
      .split(/(<[^>]+>)/g)
      .map((part) => {
        if (part.startsWith("<") || (once && replaced)) return part;
        const next = replaceTermInPlainText(part, search, buildReplacement, once);
        if (once && next !== part) replaced = true;
        return next;
      })
      .join("");
  }

  function formatLessonText(text, { terms = [], markedTerms = null } = {}) {
    let out = escHtml(text);
    out = out.replace(/\*\*(.+?)\*\*/g, '<strong class="lp-em">$1</strong>');
    const sorted = [...terms].sort((a, b) => b.word.length - a.word.length);
    for (const { word, def } of sorted) {
      if (markedTerms?.has(word)) continue;
      const buildRep = (matched) =>
        `<span class="lp-term" tabindex="0" data-explain="${escAttr(def)}">${escHtml(matched)}</span>`;
      const next = replaceOutsideTags(out, word, buildRep, { once: true });
      if (next !== out) {
        markedTerms?.add(word);
        out = next;
      }
    }
    return out;
  }

  function glossaryTermsFromLesson(lesson, slide) {
    const seen = new Map();
    const add = (word, def) => {
      const w = String(word || "").trim();
      const d = String(def || "").trim();
      if (w && d && !seen.has(w)) seen.set(w, d);
    };
    (slide?.terms || []).forEach((t) => add(t.word || t.en, t.def || t.he));
    if (lesson?.subject && lesson.subject !== "english") {
      (lesson.vocab || []).forEach((v) => add(v.en, v.he));
    }
    return [...seen.entries()].map(([word, def]) => ({ word, def }));
  }

  function formatGlossaryDefinitionLine(line, terms, markedTerms) {
    const match = String(line)
      .trim()
      .match(/^(.+?)\s[—–-]\s([\s\S]+)$/);
    if (!match) return null;
    const termPart = match[1].trim().replace(/\*\*(.+?)\*\*/g, "$1").trim();
    const definition = match[2].trim();
    const isVocabTerm = terms.some((t) => t.word === termPart);
    if (!isVocabTerm) return null;
    markedTerms?.add(termPart);
    return `<strong class="lp-em">${escHtml(termPart)}</strong> — ${escHtml(definition)}`;
  }

  function isGlossaryDefinitionLine(line, terms) {
    const match = String(line)
      .trim()
      .match(/^(.+?)\s[—–-]\s([\s\S]+)$/);
    if (!match) return false;
    const termPart = match[1].trim().replace(/\*\*(.+?)\*\*/g, "$1").trim();
    return terms.some((t) => t.word === termPart);
  }

  function formatSlideLine(line, terms, markedTerms) {
    if (!line.trim()) return line;
    const glossaryLine = formatGlossaryDefinitionLine(line, terms, markedTerms);
    if (glossaryLine) return glossaryLine;
    return formatLessonText(line, { terms, markedTerms });
  }

  function buildSlideBody(body, slide, lesson) {
    const hebrew = lesson?.subject !== "english";
    const terms = hebrew ? glossaryTermsFromLesson(lesson, slide) : [];
    const lines = body.split("\n").map((l) => l.trim()).filter(Boolean);
    const glossaryLines = lines.filter((line) => isGlossaryDefinitionLine(line, terms));
    const otherLines = lines.filter((line) => !isGlossaryDefinitionLine(line, terms));

    if (glossaryLines.length < 2) {
      return {
        html: `<p class="lp-slide-body">${wrapSlideBody(body, slide, lesson)}</p>`,
        layout: "default",
      };
    }

    const markedTerms = new Set();
    const glossaryHtml = glossaryLines
      .map((line) => `<div class="lp-slide-glossary-item">${formatSlideLine(line, terms, markedTerms)}</div>`)
      .join("");
    const leadHtml = otherLines.map((line) => formatSlideLine(line, terms, markedTerms)).join("<br>");

    const html = `<div class="lp-slide-body-layout">${leadHtml ? `<p class="lp-slide-body lp-slide-body-lead">${leadHtml}</p>` : ""}<div class="lp-slide-glossary-grid">${glossaryHtml}</div></div>`;
    return { html, layout: "glossary-grid" };
  }

  function wrapSlideBody(body, slide, lesson) {
    // Non-"english"-subject lessons (life skills / body / nature) rely purely
    // on glossary-term matching for interactivity, in whichever language is
    // active — the line-based "sayable" wrapping below is for genuine
    // English-vocabulary lessons only, where isolated foreign words are
    // embedded in otherwise base-language text.
    if (lesson?.subject !== "english") {
      const terms = glossaryTermsFromLesson(lesson, slide);
      const markedTerms = new Set();
      return body
        .split("\n")
        .map((line) => {
          if (!line.trim()) return line;
          const glossaryLine = formatGlossaryDefinitionLine(line, terms, markedTerms);
          if (glossaryLine) return glossaryLine;
          return formatLessonText(line, { terms, markedTerms });
        })
        .join("<br>");
    }
    return wrapSayableBody(body, slide.say, lesson?.vocab);
  }

  function renderSpeakBtn(speak) {
    const text = String(speak || "").trim();
    if (!text) return "";
    const label = curLang() === "en" ? `Play pronunciation: ${text}` : `השמע הגייה: ${text}`;
    return `<button type="button" class="lp-speak-btn" data-say="${escAttr(text)}" aria-label="${escAttr(label)}">${LP_SPEAKER_ICON}</button>`;
  }

  // Hebrew meaning of an English word inside a Hebrew line: the lesson's own
  // vocab first (worded for this lesson), then the site dictionary
  // (english-dict.js).
  function inlineEnglishMeaning(word, vocab) {
    const key = word.trim().toLowerCase();
    const own = (vocab || []).find((v) => String(v.en || "").toLowerCase() === key);
    return own?.he || window.ENGLISH_DICT?.[key] || "";
  }

  function inlineEnglishChip(word, vocab) {
    const he = inlineEnglishMeaning(word, vocab);
    return `<button type="button" class="lp-en-word" data-en="${escAttr(word)}" data-he="${escAttr(he)}">${word}</button>`;
  }

  // English words inside a Hebrew line ("עם I אומרים am") become chips: they
  // read as English at a glance, and a tap gives the meaning and the sound.
  // A list ("he, she, it") gets a chip per word. The run sits in an LTR span:
  // the phrase keeps its own order and, when short, never breaks across lines
  // (a wrapped "There / is" reads backwards in RTL). A curated lp-say phrase
  // is tappable already, so its text is left as is.
  function isolateInlineEnglish(html, vocab) {
    let sayDepth = 0;
    return html
      .split(/(<[^>]+>)/)
      .map((part) => {
        if (part.startsWith("<")) {
          if (sayDepth) sayDepth += part.startsWith("</span") ? -1 : part.startsWith("<span") ? 1 : 0;
          else if (part.includes("lp-say-wrap")) sayDepth = 1;
          return part;
        }
        if (sayDepth) return part;
        // (?<![&A-Za-z]): not the "amp" of an escaped "&amp;".
        return part.replace(/(?<![&A-Za-z])[A-Za-z](?:[A-Za-z'’]|[ ,/-]+(?=[A-Za-z]))*/g, (run) => {
          const chips = run
            .split(/(\s*[,/]\s*)/)
            .map((piece, i) => (i % 2 ? piece : inlineEnglishChip(piece, vocab)))
            .join("");
          return `<span class="lp-en${run.length <= 24 ? " lp-en--nowrap" : ""}" dir="ltr">${chips}</span>`;
        });
      })
      .join("");
  }

  // Wraps standalone English lines and any curated `say` phrases in clickable
  // <span class="lp-say"> spans so tapping them opens the translation/explanation
  // popup (same one vocab words use), with a speaker button to hear it aloud.
  function wrapSayableBody(body, sayList, vocab) {
    const remaining = (sayList || []).map((entry) =>
      typeof entry === "string" ? { match: entry, speak: entry, explain: "" } : entry
    );

    // wholeLine: an English sentence on a line of its own — styled apart
    // (gap above, balanced wrap) so stacked sentences don't run together.
    function sayTag(display, speak, explain, wholeLine) {
      // Without a curated explanation, the popup shows the line's Hebrew
      // translation (lesson-sentences-he.js), so a student alone gets it.
      const popupText = explain || window.LESSON_SENTENCES_HE?.[String(speak).trim()] || "";
      // dir="ltr": an English sentence inside a Hebrew (RTL) slide would
      // otherwise show its final period at the start of the line.
      return `<span class="lp-say-wrap${wholeLine ? " lp-say-wrap--line" : ""}"><span class="lp-say" dir="ltr" data-say="${escAttr(speak)}" data-explain="${escAttr(popupText)}">${display}</span>${renderSpeakBtn(speak)}</span>`;
    }

    return body
      .split("\n")
      .map((line) => {
        if (!line.trim()) return line;

        // "~ הוא שמח" — the Hebrew meaning of the example above it, shown
        // small under it so a student alone understands the sentence.
        if (line.trim().startsWith("~")) {
          return `<span class="lp-tr">${isolateInlineEnglish(escHtml(line.trim().slice(1).trim()), vocab)}</span>`;
        }

        // Prefer a curated whole-line match first — it carries an explanation.
        const wholeLineIdx = !containsHebrew(line)
          ? remaining.findIndex((entry) => entry.match === line.trim())
          : -1;
        if (wholeLineIdx !== -1) {
          const entry = remaining[wholeLineIdx];
          remaining.splice(wholeLineIdx, 1);
          return sayTag(line, entry.speak, entry.explain, true);
        }

        if (!containsHebrew(line) && containsLatinLetter(line)) {
          return sayTag(line, line.trim(), "", true);
        }

        let result = line.replace(/\*\*(.+?)\*\*/g, '<strong class="lp-em">$1</strong>');
        for (let i = remaining.length - 1; i >= 0; i--) {
          const entry = remaining[i];
          const idx = result.indexOf(entry.match);
          if (idx === -1) continue;
          result = result.slice(0, idx) + sayTag(entry.match, entry.speak, entry.explain) + result.slice(idx + entry.match.length);
          remaining.splice(i, 1);
        }
        return containsHebrew(line) ? isolateInlineEnglish(result, vocab) : result;
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
        // Back to whichever page opened the lesson (lessons library or the
        // Learn English page), including its #topic hash.
        returnUrl: `${window.location.pathname}${window.location.hash}`,
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

  // A picture game runs on the Learn English page, on the lesson's topic; its
  // results screen leads back to this slide (english-learning.js reads the
  // same return key that play.html does, plus which game it is for).
  function launchPictureGame(lesson, gameId, slideIndex, closePlayer) {
    const target = `${lesson.gameTopic}/game-${gameId}`;
    sessionStorage.setItem(
      LESSON_RETURN_KEY,
      JSON.stringify({
        lessonId: lesson.id,
        slideIndex,
        returnUrl: `${window.location.pathname}${window.location.hash}`,
        lessonName: lesson.name,
        pictureGame: target,
      })
    );
    if (/^\/services\/english(\.html)?$/.test(window.location.pathname)) {
      closePlayer();
      window.location.hash = target;
    } else {
      window.location.href = `/services/english#${target}`;
    }
  }

  let openLessonSlides = null;
  let resumeLessonSlides = null;

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
    const pdfBtn = $("#lessonPlayerPdfToggle");
    const backdrop = $("#lessonPlayerBackdrop");
    const shell = $(".lesson-player-shell", player);
    const slideWrapEl = $(".lesson-player-slide-wrap", player);
    if (!player || !slideEl) return;

    // Dense slides (long glossary lists, etc.) can be taller than the slide
    // viewport — shrink font sizes/gaps (via the --lp-fit CSS var consumed
    // throughout lesson-player.css) instead of letting the slide scroll.
    const LP_FIT_MIN = 0.45;
    const LP_FIT_STEP = 0.03;
    function fitSlideContent() {
      if (!slideWrapEl) return;
      slideEl.style.removeProperty("--lp-fit");
      const available = slideWrapEl.clientHeight;
      if (!available) return;
      let scale = 1;
      while (scale > LP_FIT_MIN + 1e-6 && slideEl.scrollHeight > available) {
        scale = Math.max(LP_FIT_MIN, scale - LP_FIT_STEP);
        slideEl.style.setProperty("--lp-fit", scale.toFixed(2));
      }
    }
    if (typeof ResizeObserver !== "undefined" && slideWrapEl) {
      new ResizeObserver(fitSlideContent).observe(slideWrapEl);
    }

    if (player.parentElement !== document.body) {
      document.body.appendChild(player);
    }

    bindLessonPlayerBackground(shell, bgBtn, bgMenu);

    let lesson = null;
    let steps = [];
    let index = 0;
    let pdfMode = false;

    const EXPAND_ICON = `<svg class="lesson-player-expand-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H3v5M16 3h5v5M16 21h5v-5M8 21H3v-5"/></svg>`;
    const COMPRESS_ICON = `<svg class="lesson-player-expand-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 14h6v6M20 10h-6V4M14 20v-6h6M10 4v6H4"/></svg>`;

    function setExpanded(expanded) {
      player.classList.toggle("is-expanded", expanded);
      document.body.classList.toggle("lesson-player-expanded", expanded);
      if (expandBtn) {
        expandBtn.setAttribute("aria-pressed", expanded ? "true" : "false");
        expandBtn.setAttribute(
          "aria-label",
          curLang() === "en"
            ? expanded
              ? "Exit fullscreen"
              : "Fullscreen"
            : expanded
              ? "חזור לחלון קטן"
              : "הגדל למסך מלא"
        );
        expandBtn.innerHTML = expanded ? COMPRESS_ICON : EXPAND_ICON;
      }
    }

    // The nav arrow glyphs point toward reading-start direction, so they must
    // flip with the language's text direction (RTL Hebrew vs LTR English).
    function relabelPlayerChrome() {
      const en = curLang() === "en";
      const prevArrow = en ? "←" : "→";
      const nextArrow = en ? "→" : "←";
      [prevBtn, prevMobile].forEach((btn) => {
        if (!btn) return;
        btn.textContent = prevArrow;
        btn.setAttribute("aria-label", en ? "Previous slide" : "שקופית קודמת");
      });
      [nextBtn, nextMobile].forEach((btn) => {
        if (!btn) return;
        btn.textContent = nextArrow;
        btn.setAttribute("aria-label", en ? "Next slide" : "שקופית הבאה");
      });
      closeBtn?.setAttribute("aria-label", en ? "Close" : "סגירה");
      bgBtn?.setAttribute("aria-label", en ? "Slide background" : "רקע לשקופיות");
      bgBtn?.setAttribute("title", en ? "Slide background" : "רקע לשקופיות");
      pdfBtn?.setAttribute("aria-label", en ? "Show PDF slides" : "הצג את מצגת ה-PDF");
      pdfBtn?.setAttribute("title", en ? "PDF slides" : "מצגת PDF");
      setExpanded(player.classList.contains("is-expanded"));
    }
    window.addEventListener("gameclass:lang", relabelPlayerChrome);
    // i18n.js's own initial setLang() may run (and dispatch this event) before
    // this listener is registered, so also apply the current language once now.
    relabelPlayerChrome();

    const SPEAKER_ICON = LP_SPEAKER_ICON;

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
      if (el.classList.contains("lp-word")) return "lp-word-active";
      if (el.classList.contains("lp-en-word")) return "lp-en-word-active";
      if (el.classList.contains("lp-term")) return "lp-term-active";
      return "lp-say-active";
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
      const isWord = btn.classList.contains("lp-word") || btn.classList.contains("lp-en-word");
      const isTerm = btn.classList.contains("lp-term");
      const speakWordText = isWord ? btn.dataset.en : isTerm ? "" : btn.dataset.say;
      popup.dataset.word = speakWordText || "";
      const popupText =
        (isWord ? btn.dataset.he : isTerm ? btn.dataset.explain : btn.dataset.explain || btn.dataset.say) || "";
      const popupTextEl = $(".lp-word-popup-text", popup);
      popupTextEl.textContent = popupText;
      popupTextEl.dir = containsHebrew(popupText) ? "rtl" : "ltr";
      $(".lp-word-popup-speak", popup).classList.toggle("hidden", !speakWordText);
      popup.classList.remove("hidden");
      positionWordPopup(btn);
    }

    let termHoverTimer = null;

    function bindTermHover() {
      $$(".lp-term", slideEl).forEach((term) => {
        term.addEventListener("mouseenter", () => {
          clearTimeout(termHoverTimer);
          openWordPopup(term);
        });
        term.addEventListener("mouseleave", () => {
          termHoverTimer = setTimeout(() => {
            if (activeWordBtn === term) closeWordPopup();
          }, 140);
        });
        term.addEventListener("focus", () => openWordPopup(term));
        term.addEventListener("blur", () => {
          if (activeWordBtn === term) closeWordPopup();
        });
      });
    }

    function popElement(el, variant = "pop") {
      const cls = variant === "celebrate" ? "is-celebrating" : "is-popped";
      el.classList.remove("is-popped", "is-celebrating");
      void el.offsetWidth;
      el.classList.add(cls);
      el.addEventListener("animationend", () => el.classList.remove(cls), { once: true });
    }

    slideEl.addEventListener("click", (e) => {
      const speakBtn = e.target.closest(".lp-speak-btn");
      if (speakBtn) {
        e.stopPropagation();
        speakWord(speakBtn.dataset.say);
        popElement(speakBtn);
        return;
      }
      // An example card's English sentence: its meaning is already under it,
      // so a tap just says it.
      const exampleBtn = e.target.closest(".lp-ex-en");
      if (exampleBtn) {
        e.stopPropagation();
        speakWord(exampleBtn.dataset.say);
        popElement(exampleBtn);
        return;
      }
      // An English word inside a Hebrew line: its meaning when the lesson or
      // the dictionary has one, otherwise just its sound.
      const enWord = e.target.closest(".lp-en-word");
      if (enWord) {
        e.stopPropagation();
        if (enWord.dataset.he) {
          openWordPopup(enWord);
        } else {
          speakWord(enWord.dataset.en);
          popElement(enWord);
        }
        return;
      }
      const wordBtn = e.target.closest(".lp-word");
      if (wordBtn) {
        e.stopPropagation();
        openWordPopup(wordBtn);
        return;
      }
      const termBtn = e.target.closest(".lp-term");
      if (termBtn) {
        e.stopPropagation();
        openWordPopup(termBtn);
        return;
      }
      const sayEl = e.target.closest(".lp-say");
      if (sayEl) {
        e.stopPropagation();
        popElement(sayEl);
        openWordPopup(sayEl);
        return;
      }
      const quizOpt = e.target.closest(".lp-quiz-opt");
      if (quizOpt) {
        answerQuiz(quizOpt);
        return;
      }
      if (e.target.closest(".lp-quiz-next")) {
        nextQuizQuestion();
        return;
      }
      if (e.target.closest(".lp-quiz-retry")) restartQuiz();
    });

    document.addEventListener("click", () => closeWordPopup());
    window.addEventListener("resize", () => closeWordPopup());
    window.addEventListener("scroll", () => closeWordPopup(), true);

    function renderGamesSlide(slide) {
      const en = curLang() === "en";
      const classGames = (lesson.games || [])
        .map(
          (g) =>
            `<button type="button" class="lp-game-btn" data-game-id="${g.id}">
              <span class="lp-game-btn-icon" aria-hidden="true">${g.icon || "🎮"}</span>
              <span class="lp-game-btn-label">${en ? g.labelEn : g.label}</span>
            </button>`
        )
        .join("");
      // Vocabulary lessons also offer the picture games of the Learn English
      // page (english-games.js), played there on the lesson's words.
      const pictureGames = lesson.gameTopic ? window.EnglishGames?.list || [] : [];
      const options = pictureGames.length
        ? `
          <div class="lp-game-group">
            <p class="lp-game-group-title">${en ? "Picture games" : "משחקי תמונות"}</p>
            <div class="lp-game-options lp-game-options--wide">
              ${pictureGames
                .map(
                  (g) =>
                    `<button type="button" class="lp-game-btn lp-game-btn--picture lp-game-btn--${g.id}" data-picture-game="${g.id}">
                      <span class="lp-game-btn-icon" aria-hidden="true">${g.icon}</span>
                      <span class="lp-game-btn-label">${en ? g.titleEn : g.title}</span>
                    </button>`
                )
                .join("")}
            </div>
          </div>
          <div class="lp-game-group">
            <p class="lp-game-group-title">${en ? "More games" : "משחקים נוספים"}</p>
            <div class="lp-game-options lp-game-options--wide">${classGames}</div>
          </div>`
        : `<div class="lp-game-options">${classGames}</div>`;
      return `
        <div class="lp-slide-inner">
          <div class="lp-slide-head">
            <h2 class="lp-slide-title">${slide.title}</h2>
          </div>
          <div class="lp-slide-body-wrap">
            <div class="lp-slide-games">${options}</div>
          </div>
        </div>`;
    }

    // Quiz slide: a few short questions, one at a time — the student picks an
    // answer, sees right away if it's right, and a wrong pick can be retried.
    let quizState = null;

    function quizQuestionHtml() {
      const en = curLang() === "en";
      const { slide, i } = quizState;
      const q = slide.questions[i];
      const total = slide.questions.length;
      const qHtml = escHtml(q.q).split("___").join('<span class="lp-quiz-blank"></span>');
      const options = q.options
        .map(
          (o, k) =>
            `<button type="button" class="lp-quiz-opt" data-k="${k}" dir="${containsHebrew(o) ? "rtl" : "ltr"}">${escHtml(o)}</button>`
        )
        .join("");
      return `
        <p class="lp-quiz-count">${en ? `Question ${i + 1} of ${total}` : `שאלה ${i + 1} מתוך ${total}`}</p>
        ${q.he ? `<p class="lp-quiz-hint" dir="rtl">${escHtml(q.he)}</p>` : ""}
        <p class="lp-quiz-q" dir="${containsHebrew(q.q) ? "rtl" : "ltr"}">${qHtml}</p>
        <div class="lp-quiz-options">${options}</div>
        <p class="lp-quiz-feedback" aria-live="polite"></p>
        <button type="button" class="lp-quiz-next is-pending" tabindex="-1" aria-hidden="true">${
          i + 1 < total ? (en ? "Next question" : "לשאלה הבאה") : en ? "Finish" : "סיום"
        }</button>`;
    }

    function quizDoneHtml() {
      const en = curLang() === "en";
      const { slide, firstTry } = quizState;
      const total = slide.questions.length;
      return `
        <p class="lp-quiz-done-title">${en ? "Well done!" : "כל הכבוד!"}</p>
        <p class="lp-quiz-done-score">${
          en
            ? `${firstTry} of ${total} right on the first try`
            : `${firstTry} מתוך ${total} נכון כבר בניסיון הראשון`
        }</p>
        <button type="button" class="lp-quiz-retry">${en ? "Try again" : "לנסות שוב"}</button>`;
    }

    function renderQuizSlide(slide) {
      quizState = { slide, i: 0, firstTry: 0, missed: false, answered: false };
      return `
        <div class="lp-slide-inner lp-slide-inner--quiz">
          <div class="lp-slide-text-col">
            <div class="lp-slide-head">
              <h2 class="lp-slide-title">${formatLessonText(slide.title || "")}</h2>
            </div>
            <div class="lp-slide-body-wrap">
              <div class="lp-quiz">${quizQuestionHtml()}</div>
            </div>
          </div>
        </div>`;
    }

    function setQuizHtml(html) {
      const box = $(".lp-quiz", slideEl);
      if (!box) return;
      box.innerHTML = html;
      fitSlideContent();
    }

    function answerQuiz(btn) {
      if (!quizState || quizState.answered) return;
      const en = curLang() === "en";
      const q = quizState.slide.questions[quizState.i];
      const box = btn.closest(".lp-quiz");
      const feedback = $(".lp-quiz-feedback", box);
      if (Number(btn.dataset.k) === q.answer) {
        quizState.answered = true;
        if (!quizState.missed) quizState.firstTry += 1;
        btn.classList.add("is-correct");
        $$(".lp-quiz-opt", box).forEach((b) => (b.disabled = true));
        const blank = $(".lp-quiz-blank", box);
        if (blank) {
          blank.textContent = q.options[q.answer];
          blank.classList.add("is-filled");
        }
        feedback.textContent = en ? "Correct! Well done" : "נכון! כל הכבוד";
        feedback.className = "lp-quiz-feedback is-correct";
        const next = $(".lp-quiz-next", box);
        next.classList.remove("is-pending");
        next.removeAttribute("tabindex");
        next.removeAttribute("aria-hidden");
        // The filled-in blank can make the question line wrap.
        fitSlideContent();
      } else {
        quizState.missed = true;
        btn.classList.add("is-wrong");
        btn.disabled = true;
        feedback.textContent = en ? "Not quite — try again" : "לא נכון — נסו שוב";
        // A short "why" under the feedback, so a student alone sees the rule.
        if (q.why && !en) {
          feedback.insertAdjacentHTML(
            "beforeend",
            `<span class="lp-quiz-why" dir="rtl">${isolateInlineEnglish(escHtml(q.why), lesson?.vocab)}</span>`
          );
        }
        feedback.className = "lp-quiz-feedback is-wrong";
        fitSlideContent();
      }
    }

    function nextQuizQuestion() {
      if (!quizState?.answered) return;
      quizState.i += 1;
      quizState.missed = false;
      quizState.answered = false;
      setQuizHtml(quizState.i < quizState.slide.questions.length ? quizQuestionHtml() : quizDoneHtml());
    }

    function restartQuiz() {
      if (!quizState) return;
      Object.assign(quizState, { i: 0, firstTry: 0, missed: false, answered: false });
      setQuizHtml(quizQuestionHtml());
    }

    function renderVolcanoMountainScene(modifierClass) {
      return `
        <div class="lp-volcano-scene${modifierClass}" aria-hidden="true">
          <div class="lp-volcano-sky"></div>
          <svg class="lp-volcano-mountain" viewBox="0 0 200 170" preserveAspectRatio="xMidYMax meet">
            <defs>
              <linearGradient id="lpVolcanoBody" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#5b3d2e"/>
                <stop offset="100%" stop-color="#2f2019"/>
              </linearGradient>
              <linearGradient id="lpVolcanoLava" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#fff2b0"/>
                <stop offset="45%" stop-color="#ffb347"/>
                <stop offset="100%" stop-color="#ff4d2e"/>
              </linearGradient>
              <radialGradient id="lpVolcanoCrater" cx="50%" cy="35%" r="65%">
                <stop offset="0%" stop-color="#fff8dc"/>
                <stop offset="45%" stop-color="#ffb347"/>
                <stop offset="100%" stop-color="#ff4d2e" stop-opacity="0"/>
              </radialGradient>
            </defs>
            <path fill="url(#lpVolcanoBody)" d="M14 168 L92 58 Q100 46 108 58 L186 168 Z"/>
            <path class="lp-volcano-lava-streak lp-volcano-lava-streak--l" fill="url(#lpVolcanoLava)" d="M97 62 C88 95 74 122 64 168 L78 168 C90 124 98 98 105 66 Z"/>
            <path class="lp-volcano-lava-streak lp-volcano-lava-streak--r" fill="url(#lpVolcanoLava)" d="M103 62 C112 95 126 122 136 168 L122 168 C110 124 102 98 95 66 Z"/>
            <ellipse class="lp-volcano-crater" fill="url(#lpVolcanoCrater)" cx="100" cy="59" rx="20" ry="12"/>
          </svg>
          <div class="lp-volcano-smoke">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
          <div class="lp-volcano-embers">
            <i></i><i></i><i></i><i></i><i></i><i></i><i></i>
          </div>
        </div>`;
    }

    function isHebrewLesson() {
      return curLang() !== "en";
    }

    function renderVolcanoOutputScene(hebrew = true) {
      const labels = hebrew
        ? { lava: "לבה", smoke: "עשן", ash: "אפר געשי" }
        : { lava: "Lava", smoke: "Smoke", ash: "Ash" };
      return `
        <div class="lp-volcano-scene lp-volcano-scene--output" aria-hidden="true">
          <div class="lp-volcano-output-badge lp-volcano-output-badge--lava">
            <span class="lp-volcano-output-drop"></span>
            <span class="lp-volcano-output-label">${labels.lava}</span>
          </div>
          <div class="lp-volcano-output-badge lp-volcano-output-badge--smoke">
            <span class="lp-volcano-output-puff"></span>
            <span class="lp-volcano-output-label">${labels.smoke}</span>
          </div>
          <div class="lp-volcano-output-badge lp-volcano-output-badge--ash">
            <span class="lp-volcano-output-fleck"></span><span class="lp-volcano-output-fleck"></span><span class="lp-volcano-output-fleck"></span>
            <span class="lp-volcano-output-label">${labels.ash}</span>
          </div>
        </div>`;
    }

    function renderVolcanoWorldScene() {
      return `
        <div class="lp-volcano-scene lp-volcano-scene--world" aria-hidden="true">
          <div class="lp-volcano-sky lp-volcano-sky--dusk"></div>
          <svg class="lp-volcano-range" viewBox="0 0 200 170" preserveAspectRatio="xMidYMax meet">
            <path class="lp-volcano-range-back" d="M0 168 L38 100 L68 132 L100 78 L132 128 L162 92 L200 168 Z"/>
            <path class="lp-volcano-range-front" d="M0 168 L55 118 L90 168 L120 112 L150 168 L200 132 L200 168 Z"/>
            <circle class="lp-volcano-range-glow" cx="100" cy="80" r="4.5"/>
          </svg>
          <div class="lp-volcano-range-smoke"><span></span><span></span></div>
          <div class="lp-volcano-range-markers"><i></i><i></i><i></i></div>
        </div>`;
    }

    function renderVolcanoEarthScene() {
      return `
        <div class="lp-volcano-scene lp-volcano-scene--earth" aria-hidden="true">
          <div class="lp-volcano-earth-sky"></div>
          <svg class="lp-volcano-earth-cut" viewBox="0 0 200 170" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="lpEarthCrust" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#8b6914"/>
                <stop offset="100%" stop-color="#5c3d1e"/>
              </linearGradient>
              <radialGradient id="lpEarthMagma" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#fff4b0"/>
                <stop offset="55%" stop-color="#ff7a2f"/>
                <stop offset="100%" stop-color="#c41e0f"/>
              </radialGradient>
            </defs>
            <rect fill="#7cb342" x="0" y="0" width="200" height="28"/>
            <path fill="#5d4037" d="M78 28 L100 8 L122 28 Z"/>
            <ellipse class="lp-volcano-earth-crater" fill="#ff6b35" cx="100" cy="12" rx="8" ry="4"/>
            <rect fill="url(#lpEarthCrust)" x="0" y="28" width="200" height="52"/>
            <rect class="lp-volcano-earth-magma" fill="url(#lpEarthMagma)" x="52" y="88" width="96" height="48" rx="18"/>
            <path class="lp-volcano-earth-vent" fill="url(#lpEarthMagma)" d="M92 88 L100 28 L108 88 Z"/>
            <rect fill="#4e342e" x="0" y="136" width="200" height="34"/>
          </svg>
        </div>`;
    }

    function renderVolcanoStatusScene(hebrew = true) {
      const labels = hebrew
        ? { active: "פעיל", dormant: "רדום", extinct: "כבוי" }
        : { active: "Active", dormant: "Dormant", extinct: "Extinct" };
      return `
        <div class="lp-volcano-scene lp-volcano-scene--status" aria-hidden="true">
          <div class="lp-volcano-status-sky"></div>
          <div class="lp-volcano-status-grid">
            <div class="lp-volcano-status-item lp-volcano-status-item--active">
              <svg viewBox="0 0 60 70" aria-hidden="true">
                <path fill="#4e342e" d="M8 68 L30 18 L52 68 Z"/>
                <ellipse class="lp-volcano-status-glow" fill="#ff6b35" cx="30" cy="20" rx="7" ry="4"/>
              </svg>
              <div class="lp-volcano-status-smoke"><span></span><span></span></div>
              <small>${labels.active}</small>
            </div>
            <div class="lp-volcano-status-item lp-volcano-status-item--dormant">
              <svg viewBox="0 0 60 70" aria-hidden="true">
                <path fill="#5d4037" d="M10 68 L30 24 L50 68 Z"/>
                <ellipse fill="#8d6e63" cx="30" cy="26" rx="5" ry="3"/>
              </svg>
              <small>${labels.dormant}</small>
            </div>
            <div class="lp-volcano-status-item lp-volcano-status-item--extinct">
              <svg viewBox="0 0 60 70" aria-hidden="true">
                <path fill="#9e9e9e" d="M12 68 L30 30 L48 68 Z"/>
                <path fill="#bdbdbd" d="M22 68 L30 38 L38 68 Z"/>
              </svg>
              <small>${labels.extinct}</small>
            </div>
          </div>
        </div>`;
    }

    function renderVolcanoScene(variant, { hebrew = true } = {}) {
      if (variant === "output") return renderVolcanoOutputScene(hebrew);
      if (variant === "world") return renderVolcanoWorldScene();
      if (variant === "earth") return renderVolcanoEarthScene();
      if (variant === "status") return renderVolcanoStatusScene(hebrew);
      if (variant === "lava") return renderVolcanoMountainScene(" lp-volcano-scene--lava");
      const modifierClass =
        variant === "celebrate"
          ? " lp-volcano-scene--celebrate"
          : variant === "calm"
            ? " lp-volcano-scene--calm"
            : variant === "erupting"
              ? ""
              : "";
      return renderVolcanoMountainScene(modifierClass);
    }

    // A structured English slide, in this order: short Hebrew `lines`, a
    // `table` of [from, to] rows ("I" → "am"), `examples` as cards (English
    // on top, its Hebrew meaning under it; `flow` puts a down arrow between
    // them) and a `compare` pair { wrong, right }. "**am**" in an English
    // sentence marks the word the slide is about.
    const LP_ARROW_ICON = (dir) =>
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${
        dir === "down" ? "M12 4v16M5 13l7 7 7-7" : dir === "left" ? "M20 12H4M11 5l-7 7 7 7" : "M4 12h16M13 5l7 7-7 7"
      }"/></svg>`;
    const LP_RIGHT_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>`;
    const LP_WRONG_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" aria-hidden="true"><path d="M17 7 7 17M7 7l10 10"/></svg>`;

    function stepsEnglishHtml(text) {
      return escHtml(text).replace(/\*\*(.+?)\*\*/g, '<b class="lp-key">$1</b>');
    }

    function stepsHebrewHtml(text) {
      return isolateInlineEnglish(
        escHtml(text).replace(/\*\*(.+?)\*\*/g, '<strong class="lp-em">$1</strong>'),
        lesson?.vocab
      );
    }

    function stepsCellHtml(text) {
      return containsHebrew(text)
        ? `<span class="lp-steps-cell" dir="rtl">${stepsHebrewHtml(text)}</span>`
        : `<span class="lp-steps-cell" dir="ltr">${stepsEnglishHtml(text)}</span>`;
    }

    function stepsExampleHtml(ex) {
      const say = ex.en.replace(/\*\*/g, "");
      return `
        <div class="lp-ex">
          <button type="button" class="lp-ex-en" dir="ltr" data-say="${escAttr(say)}"><span>${stepsEnglishHtml(ex.en)}</span><span class="lp-ex-speak">${LP_SPEAKER_ICON}</span></button>
          ${ex.he ? `<span class="lp-ex-he" dir="rtl">${stepsHebrewHtml(ex.he)}</span>` : ""}
        </div>`;
    }

    function renderStepsBody(slide) {
      const hebrew = isHebrewLesson();
      const parts = (slide.lines || []).map((line) => `<p class="lp-steps-line">${stepsHebrewHtml(line)}</p>`);
      if (slide.table?.length) {
        const arrow = `<span class="lp-steps-arrow">${LP_ARROW_ICON(hebrew ? "left" : "right")}</span>`;
        parts.push(
          `<div class="lp-steps-table">${slide.table
            .map(([from, to]) => `<div class="lp-steps-row">${stepsCellHtml(from)}${arrow}${stepsCellHtml(to)}</div>`)
            .join("")}</div>`
        );
      }
      if (slide.examples?.length) {
        const joiner = slide.flow ? `<span class="lp-ex-flow">${LP_ARROW_ICON("down")}</span>` : "";
        parts.push(`<div class="lp-ex-list${slide.flow ? " is-flow" : ""}">${slide.examples.map(stepsExampleHtml).join(joiner)}</div>`);
      }
      if (slide.compare) {
        const row = (kind, text, icon, label) => `
          <div class="lp-compare-row is-${kind}">
            <span class="lp-compare-mark">${icon}<span>${label}</span></span>
            <span class="lp-compare-text" dir="ltr">${stepsEnglishHtml(text)}</span>
          </div>`;
        parts.push(
          `<div class="lp-compare">${row("wrong", slide.compare.wrong, LP_WRONG_ICON, hebrew ? "לא נכון" : "Wrong")}${row(
            "right",
            slide.compare.right,
            LP_RIGHT_ICON,
            hebrew ? "נכון" : "Right"
          )}</div>`
        );
      }
      return `<div class="lp-steps">${parts.join("")}</div>`;
    }

    function renderContentSlide(slide, { isLast = false } = {}) {
      let bodyHtml = "";
      let bodyLayout = "default";

      if (slide.lines || slide.table || slide.examples || slide.compare) {
        bodyHtml = renderStepsBody(slide);
      } else if (slide.pictures?.length) {
        bodyHtml = `<ul class="lp-picture-grid" data-count="${slide.pictures.length}">${slide.pictures
          .map(
            (p) =>
              `<li class="lp-picture-card"><img class="lp-picture-img" src="${escAttr(p.img)}" alt="${escAttr(p.en)}" draggable="false" /><span class="lp-word-cell"><button type="button" class="lp-word" dir="ltr" data-en="${escAttr(p.en)}" data-he="${escAttr(p.he)}">${escHtml(p.en)}</button>${renderSpeakBtn(p.en)}</span><span class="lp-picture-he">${escHtml(p.he)}</span></li>`
          )
          .join("")}</ul>`;
        bodyLayout = "pictures";
      } else if (slide.items?.length) {
        bodyHtml = `<ul class="lp-slide-list">${slide.items
          .map(
            (it) =>
              `<li><span class="lp-word-cell"><button type="button" class="lp-word" dir="ltr" data-en="${escAttr(it.en)}" data-he="${escAttr(it.he)}">${escHtml(it.en)}</button>${renderSpeakBtn(it.en)}</span><span>${escHtml(it.he)}</span></li>`
          )
          .join("")}</ul>`;
      } else if (slide.body) {
        const built = buildSlideBody(slide.body, slide, lesson);
        bodyLayout = built.layout;
        bodyHtml = built.html;
      }

      const videoHtml = slide.video ? renderYoutubeEmbed(slide.video, slide.videoTitle) : "";
      const visualHtml =
        slide.visual && slide.visual.startsWith("volcano-")
          ? renderVolcanoScene(slide.visual.slice("volcano-".length), { hebrew: isHebrewLesson() })
          : "";
      const useGlossaryGrid = bodyLayout === "glossary-grid";
      if (useGlossaryGrid && visualHtml) {
        bodyHtml = bodyHtml.replace(
          '<div class="lp-slide-glossary-grid">',
          `<div class="lp-slide-glossary-visual">${visualHtml}</div><div class="lp-slide-glossary-grid">`
        );
      }
      const sideHtml = useGlossaryGrid ? "" : videoHtml || visualHtml;
      const hasSideVisual = !!(sideHtml && !videoHtml);

      const titleHtml = formatLessonText(slide.title || "");

      return `
        <div class="lp-slide-inner${hasSideVisual ? " has-visual" : ""}${useGlossaryGrid ? " has-glossary-grid" : ""}${bodyLayout === "pictures" ? " has-pictures" : ""}${videoHtml ? " has-video" : ""}${isLast ? " lp-slide-inner--outro" : ""}">
          ${isLast ? '<div class="lp-outro-confetti" aria-hidden="true"></div>' : ""}
          <div class="lp-slide-text-col">
            <div class="lp-slide-head">
              <h2 class="lp-slide-title">${titleHtml}</h2>
            </div>
            <div class="lp-slide-body-wrap">
              ${bodyHtml}
            </div>
          </div>
          ${sideHtml}
        </div>`;
    }

    function renderPdfImageSlide(slide) {
      return `
        <div class="lp-slide-inner lp-slide-inner--pdf">
          <img class="lp-pdf-slide-img" src="${escAttr(slide.src)}" alt="" />
        </div>`;
    }

    const LP_OUTRO_CONFETTI_COLORS = ["#ff3b5c", "#ffd23f", "#4da6ff", "#7ee08c", "#c792ff", "#ff9f43"];

    function spawnOutroConfetti(inner) {
      const layer = $(".lp-outro-confetti", inner);
      if (!layer) return;
      if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
      const pieceCount = 26;
      for (let i = 0; i < pieceCount; i++) {
        const piece = document.createElement("span");
        piece.className = "lp-outro-confetti-piece";
        piece.style.setProperty("--lp-confetti-x", `${Math.random() * 100}%`);
        piece.style.setProperty("--lp-confetti-delay", `${Math.random() * 0.6}s`);
        piece.style.setProperty("--lp-confetti-duration", `${1.8 + Math.random() * 1.2}s`);
        piece.style.setProperty("--lp-confetti-drift", `${Math.random() * 60 - 30}px`);
        piece.style.setProperty("--lp-confetti-rot", `${(Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 360)}deg`);
        piece.style.background = LP_OUTRO_CONFETTI_COLORS[i % LP_OUTRO_CONFETTI_COLORS.length];
        layer.appendChild(piece);
      }
    }

    function animateSlide(html, direction = 0) {
      const current = $(".lp-slide-inner", slideEl);

      const showNew = () => {
        slideEl.innerHTML = html;
        const inner = $(".lp-slide-inner", slideEl);
        if (!inner) return;
        fitSlideContent();
        if (inner.classList.contains("lp-slide-inner--outro")) spawnOutroConfetti(inner);
        if (direction > 0) inner.classList.add("from-next");
        if (direction < 0) inner.classList.add("from-prev");
        requestAnimationFrame(() => {
          requestAnimationFrame(() => inner.classList.add("is-visible"));
        });

        $$(".lp-game-btn[data-game-id]", slideEl).forEach((btn) => {
          btn.addEventListener("click", () => launchLessonGame(lesson, btn.dataset.gameId, index));
        });
        $$(".lp-game-btn[data-picture-game]", slideEl).forEach((btn) => {
          btn.addEventListener("click", () => launchPictureGame(lesson, btn.dataset.pictureGame, index, close));
        });
        bindTermHover();
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
      const html =
        slide.type === "games"
          ? renderGamesSlide(slide)
          : slide.type === "quiz"
            ? renderQuizSlide(slide)
          : slide.type === "pdf-image"
            ? renderPdfImageSlide(slide)
            : renderContentSlide(slide, { isLast: index === steps.length - 1 });
      animateSlide(html, direction);
      updateNav();
      if (index === steps.length - 1) markLessonLearned(lesson.id);
    }

    function buildSteps() {
      if (pdfMode && lesson.pdfSlides?.length) {
        const pdfImageSteps = lesson.pdfSlides.map((src) => ({ type: "pdf-image", src }));
        const tailSteps = (lesson.slides || []).filter((s) => s.type === "games" || s === lesson.slides[lesson.slides.length - 1]);
        return [...pdfImageSteps, ...tailSteps];
      }
      return lesson.slides || [];
    }

    function setPdfMode(on) {
      pdfMode = on;
      if (pdfBtn) pdfBtn.setAttribute("aria-pressed", on ? "true" : "false");
      steps = buildSteps();
      index = 0;
      renderDots();
      renderStep();
    }

    function goTo(i) {
      if (i < 0 || i >= steps.length) return;
      closeWordPopup();
      const direction = i > index ? 1 : i < index ? -1 : 0;
      index = i;
      renderStep(direction);
    }

    // startIndex: open straight on that slide (back from a picture game) —
    // rendering slide 0 first would race its exit animation.
    function open(lessonId, startIndex = 0) {
      lesson = localizeLesson(LESSON_CATALOG[lessonId]);
      if (!lesson) return;
      if (lesson.premium && !window.PleyiPremium?.hasPremium?.()) {
        window.PleyiPremium?.ensureLessonAccess?.(lessonId, lesson.nameMain || lesson.name);
        lesson = null;
        return;
      }
      // The PDF slide images are baked-in Hebrew graphics that can't be
      // localized — fall back to the (translatable) text slides in English.
      const hasPdf = curLang() !== "en" && !!lesson.pdfSlides?.length;
      pdfMode = hasPdf;
      if (pdfBtn) {
        pdfBtn.classList.toggle("hidden", curLang() === "en" || !lesson.pdfSlides?.length);
        pdfBtn.setAttribute("aria-pressed", pdfMode ? "true" : "false");
      }
      steps = buildSteps();
      index = Number.isInteger(startIndex) && startIndex > 0 && startIndex < steps.length ? startIndex : 0;
      player.dataset.lessonId = lessonId;
      renderDots();
      renderStep();
      player.classList.remove("hidden");
      player.setAttribute("aria-hidden", "false");
      setExpanded(pdfMode);
      document.body.style.overflow = "hidden";
    }
    openLessonSlides = open;
    resumeLessonSlides = (lessonId, slideIndex) => open(lessonId, Number(slideIndex) || 0);

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
    pdfBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      const next = !pdfMode;
      setPdfMode(next);
      setExpanded(next);
    });
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

  const LOCK_ICON_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';

  function updateLessonLocks() {
    const unlocked = !!window.PleyiPremium?.hasPremium?.();
    $$(".svc-lesson-card[data-lesson]").forEach((card) => {
      const lesson = LESSON_CATALOG[card.dataset.lesson];
      if (!lesson) return;
      const locked = !!lesson.premium && !unlocked;
      card.classList.toggle("is-premium-locked", locked);

      let badge = $(".svc-lesson-premium-lock", card);
      if (locked && !badge) {
        $(".svc-lesson-preview", card)?.insertAdjacentHTML(
          "afterbegin",
          `<span class="svc-lesson-premium-lock" aria-hidden="true">${LOCK_ICON_SVG}<span>פרימיום</span></span>`
        );
      } else if (!locked && badge) {
        badge.remove();
      }

      const openBtn = $(".js-lesson-open", card);
      setLessonOpenButtonState(openBtn, lesson);
    });
  }

  function init() {
    syncLessonCardTitles();
    bindLessonFilters();
    bindLessonInfoModal();
    bindLessonPlayer();
    applyLearnedBadges();
    updateLessonLocks();
    document.addEventListener("premium-updated", updateLessonLocks);
    tryOpenSharedLesson();

    window.GameAuth?.bindModals(showToast);
    window.GameAuth?.onUserChange(async () => {
      await refreshFavoriteLessons();
      syncAllFavButtons();
    });
    refreshFavoriteLessons().then(syncAllFavButtons);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.ReadyLessons = {
    catalog: LESSON_CATALOG,
    subjectLabels: SUBJECT_LABELS,
    openLesson: (lessonId) => openLessonSlides?.(lessonId),
    resumeLesson: (lessonId, slideIndex) => resumeLessonSlides?.(lessonId, slideIndex),
    localize: localizeLesson,
  };
})();
