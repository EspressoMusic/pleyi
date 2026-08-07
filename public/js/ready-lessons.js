/* Ready lessons — catalog, filters, player, minimal cards */

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const SUBJECT_LABELS = { english: "אנגלית", math: "חשבון", lifeskills: "כישורי חיים", health: "נפלאות הבריאה" };
  const ACTIVE_SUBJECTS = ["lifeskills", "health"];
  const LESSON_SHARE_PATH = "/services/ready-lessons.html";
  const LP_SPEAKER_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 5V4L8 9H4Z"/><path d="M16.2 8.8a5 5 0 0 1 0 6.4"/><path d="M18.8 6.2a9 9 0 0 1 0 11.6"/></svg>`;

  const STANDARD_LESSON_GAMES = [
    { id: "vocabulary-duel", label: "טריוויה", icon: "⚔️" },
    { id: "tower-stack", label: "מגדל מילים", icon: "🗼" },
    { id: "hangman", label: "איש תלוי", icon: "🎯" },
    { id: "spot-diff", label: "מצא הבדלים", icon: "🔍" },
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
      summary: "מכירים הר געש מקרוב — איך הוא בנוי, מה קורה בפנים כדור הארץ, ולמה הוא מתפרץ. עם אנימציית התפרצות ומשחק בסוף.",
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
      slides: [
        {
          type: "content",
          title: "מה זה **הר געש**?",
          subtitle: "פתיחה",
          visual: "volcano-calm",
          body: "**הר געש** הוא הר מיוחד שיכול לפלוט אבנים לוהטות, עשן ולבה מתוך פנים כדור הארץ.\n\nהיום נכיר איך הוא בנוי, מה קורה בפנים שלו, ולמה הוא **מתפרץ**.",
        },
        {
          type: "content",
          title: "**מילים חשובות**",
          subtitle: "אוצר מושגים",
          visual: "volcano-earth",
          body: "לוע — הפתח שבראש הר הגעש שממנו יוצאת הלבה.\n\nמאגמה — סלע נוזלי וחם מאוד שנמצא עמוק מתחת לאדמה. כשהיא יוצאת החוצה קוראים לה לבה.\n\nהתפרצות — הרגע שבו הר הגעש פולט לבה, עשן ואבנים.",
        },
        {
          type: "content",
          title: "איך הר געש **מתפרץ**?",
          subtitle: "בפנים ההר",
          visual: "volcano-erupting",
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
          visual: "volcano-lava",
          body: "לבה יכולה להגיע לחום של יותר מ-**1,000 מעלות צלזיוס** — חם מספיק כדי להתיך מתכת!\n\nלמרות שהיא נראית איטית, לבה יכולה לזרום במהירות של עשרות קילומטרים בשעה במורד ההר.\n\nכשהיא מתקררת, הלבה הופכת לאט לאט לסלע קשה חדש.",
        },
        {
          type: "content",
          title: "**פעיל**, רדום או כבוי?",
          subtitle: "סוגי הרי געש",
          visual: "volcano-status",
          body: "**הר געש פעיל** הוא הר שהתפרץ לאחרונה או עלול להתפרץ שוב בקרוב.\n\n**הר געש רדום** לא התפרץ הרבה מאוד זמן, אבל עדיין יכול להתעורר יום אחד.\n\n**הר געש כבוי** כבר לא צפוי להתפרץ שוב לעולם.",
        },
        {
          type: "content",
          title: "**מה יוצא** מהר געש?",
          subtitle: "שאלה ותשובה",
          visual: "volcano-output",
          body: "**מה יוצא** מהר געש כשהוא **מתפרץ**?\n\nלבה — סלע נוזלי ולוהט שזורם במורד ההר.\n\nעשן — ענן כבד שעולה מהלוע אל השמיים.\n\nאפר געשי — אבק ופירורי סלע קטנטנים שיכולים לנסוע רחוק מאוד ברוח.",
        },
        {
          type: "content",
          title: "הרי געש **בעולם האמיתי**",
          subtitle: "חיבור לחיים",
          visual: "volcano-world",
          body: "יש **אלפי הרי געש** בעולם — חלקם על היבשה וחלקם עמוק בים.\n\nהר הגעש קילאווהה שבהוואי הוא אחד הפעילים ביותר בעולם, וממשיך להתפרץ במשך שנים רבות.\n\nמדענים שנקראים **וולקנולוגים** חוקרים הרי געש כדי לדעת מתי הם עלולים להתפרץ, ולשמור על אנשים שגרים בקרבתם בבטחה.",
        },
        { type: "games", title: "זמן לתרגל!", subtitle: "משחקים" },
        {
          type: "content",
          title: "סוף השיעור",
          subtitle: "כל הכבוד!",
          visual: "volcano-celebrate",
          body: "תודה על ההשתתפות!",
        },
      ],
    },

    health: {
      id: "health",
      name: "גוף האדם - הלב",
      nameMain: "גוף האדם",
      namePart: "הלב",
      subject: "health",
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
        { type: "games", title: "זמן לתרגל!", subtitle: "משחקים" },
        {
          type: "content",
          title: "סוף השיעור",
          subtitle: "כל הכבוד!",
          body: "תודה על ההשתתפות!",
        },
      ],
    },

    lungs: {
      id: "lungs",
      name: "גוף האדם - ריאות ונשימה",
      nameMain: "גוף האדם",
      namePart: "ריאות ונשימה",
      subject: "health",
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
        { type: "games", title: "זמן לתרגל!", subtitle: "משחקים" },
        {
          type: "content",
          title: "סוף השיעור",
          subtitle: "כל הכבוד!",
          body: "תודה על ההשתתפות!",
        },
      ],
    },

    brain: {
      id: "brain",
      name: "גוף האדם - המוח",
      nameMain: "גוף האדם",
      namePart: "המוח",
      subject: "health",
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
        { type: "games", title: "זמן לתרגל!", subtitle: "משחקים" },
        {
          type: "content",
          title: "סוף השיעור",
          subtitle: "כל הכבוד!",
          body: "תודה על ההשתתפות!",
        },
      ],
    },

    skeleton: {
      id: "skeleton",
      name: "גוף האדם - שרירים ועצמות",
      nameMain: "גוף האדם",
      namePart: "שרירים ועצמות",
      subject: "health",
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
        { type: "games", title: "זמן לתרגל!", subtitle: "משחקים" },
        {
          type: "content",
          title: "סוף השיעור",
          subtitle: "כל הכבוד!",
          body: "תודה על ההשתתפות!",
        },
      ],
    },

    digestion: {
      id: "digestion",
      name: "גוף האדם - מערכת העיכול",
      nameMain: "גוף האדם",
      namePart: "מערכת העיכול",
      subject: "health",
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
        { id: "health", label: "הלב" },
        { id: "lungs", label: "ריאות ונשימה" },
        { id: "brain", label: "המוח" },
        { id: "skeleton", label: "שרירים ועצמות" },
        { id: "digestion", label: "מערכת העיכול" },
        { id: "volcano", label: "הר געש" },
      ],
      dv: [
        { id: "health", label: "הלב" },
        { id: "lungs", label: "ריאות ונשימה" },
        { id: "brain", label: "המוח" },
        { id: "skeleton", label: "שרירים ועצמות" },
        { id: "digestion", label: "מערכת העיכול" },
        { id: "volcano", label: "הר געש" },
      ],
      zh: [
        { id: "health", label: "הלב" },
        { id: "lungs", label: "ריאות ונשימה" },
        { id: "brain", label: "המוח" },
        { id: "skeleton", label: "שרירים ועצמות" },
        { id: "digestion", label: "מערכת העיכול" },
        { id: "volcano", label: "הר געש" },
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
      const subjects = state.subject === "all" ? ACTIVE_SUBJECTS : [state.subject];
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
    const label = active ? "הסרת השיעור מהשמורים" : "שמירת השיעור";
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
      showToast("לא ניתן לשמור את השיעור לפני התחברות למערכת");
      window.GameAuth?.handleLoginClick({ redirect: false });
      return;
    }

    const res = await UserData.toggleFavoriteLesson(lessonId);
    if (!res.ok) {
      showToast(res.error || "לא ניתן לשמור כרגע");
      return;
    }

    if (res.favorited) {
      favoriteLessonIds.add(lessonId);
      spawnFavConfetti(btn);
    } else {
      favoriteLessonIds.delete(lessonId);
    }
    syncFavBtnState(lessonId);
    showToast(res.favorited ? "השיעור נשמר" : "השיעור הוסר מהשמורים");
  }

  function isLessonLocked(lesson) {
    return !!lesson?.premium && !window.PleyiPremium?.hasPremium?.();
  }

  function setLessonOpenButtonState(openBtn, lesson) {
    if (!openBtn || !lesson) return;
    const locked = isLessonLocked(lesson);
    openBtn.hidden = locked;
    if (!locked) openBtn.textContent = "פתיחה";
  }

  function openLessonInfoModal(lessonId) {
    const lesson = LESSON_CATALOG[lessonId];
    const modal = $("#lessonInfoModal");
    if (!lesson || !modal) return;

    modal.classList.remove("hidden");

    $("#lessonInfoTitle").textContent = lesson.nameMain || lesson.name;
    $("#lessonInfoSubject").textContent = SUBJECT_LABELS[lesson.subject] || lesson.subject;
    $("#lessonInfoGrade").textContent = lesson.gradeLabel;
    $("#lessonInfoDuration").textContent = lesson.duration;
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
    if (shareLabel) shareLabel.textContent = "שיתוף השיעור";
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
    const lesson = LESSON_CATALOG[lessonId];
    if (!lesson) return null;
    const url = `${window.location.origin}${LESSON_SHARE_PATH}?lesson=${encodeURIComponent(lessonId)}`;
    const text = `בואו ללמוד "${lesson.nameMain || lesson.name}" באנגלית עם Pleyi!`;
    const title = `שיעור: ${lesson.nameMain || lesson.name}`;
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

  function replaceTermInPlainText(text, word, replacement, once = false) {
    const needle = escHtml(word);
    if (!needle) return text;
    let result = "";
    let i = 0;
    while (i < text.length) {
      const idx = text.indexOf(needle, i);
      if (idx === -1) {
        result += text.slice(i);
        break;
      }
      const before = idx > 0 ? text[idx - 1] : "";
      const after = idx + needle.length < text.length ? text[idx + needle.length] : "";
      const atBoundary =
        (!before || !isHebrewLetter(before)) && (!after || !isHebrewLetter(after));
      if (atBoundary) {
        result += text.slice(i, idx) + replacement;
        if (once) return result;
        i = idx + needle.length;
      } else {
        result += text.slice(i, idx + 1);
        i = idx + 1;
      }
    }
    return result;
  }

  function replaceOutsideTags(html, search, replacement, { once = false } = {}) {
    if (!search) return html;
    let replaced = false;
    return html
      .split(/(<[^>]+>)/g)
      .map((part) => {
        if (part.startsWith("<") || (once && replaced)) return part;
        const next = replaceTermInPlainText(part, search, replacement, once);
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
      const rep = `<span class="lp-term" tabindex="0" data-explain="${escAttr(def)}">${escHtml(word)}</span>`;
      const next = replaceOutsideTags(out, word, rep, { once: true });
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
    const hebrew = lesson?.subject !== "english";
    const terms = hebrew ? glossaryTermsFromLesson(lesson, slide) : [];
    const markedTerms = new Set();
    const preformatted = hebrew
      ? body
          .split("\n")
          .map((line) => {
            if (!line.trim()) return line;
            const glossaryLine = formatGlossaryDefinitionLine(line, terms, markedTerms);
            if (glossaryLine) return glossaryLine;
            return formatLessonText(line, { terms, markedTerms });
          })
          .join("\n")
      : body;
    return wrapSayableBody(preformatted, slide.say);
  }

  function renderSpeakBtn(speak) {
    const text = String(speak || "").trim();
    if (!text) return "";
    return `<button type="button" class="lp-speak-btn" data-say="${escAttr(text)}" aria-label="השמע באנגלית: ${escAttr(text)}">${LP_SPEAKER_ICON}</button>`;
  }

  // Wraps standalone English lines and any curated `say` phrases in clickable
  // <span class="lp-say"> spans so tapping them opens the translation/explanation
  // popup (same one vocab words use), with a speaker button to hear it aloud.
  function wrapSayableBody(body, sayList) {
    const remaining = (sayList || []).map((entry) =>
      typeof entry === "string" ? { match: entry, speak: entry, explain: "" } : entry
    );

    function sayTag(display, speak, explain) {
      return `<span class="lp-say-wrap"><span class="lp-say" data-say="${escAttr(speak)}" data-explain="${escAttr(explain || "")}">${display}</span>${renderSpeakBtn(speak)}</span>`;
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

  let openLessonSlides = null;

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
    const slideWrapEl = $(".lesson-player-slide-wrap", player);
    if (!player || !slideEl) return;

    // Dense slides (long glossary lists, etc.) can be taller than the slide
    // viewport — shrink font sizes/gaps (via the --lp-fit CSS var consumed
    // throughout lesson-player.css) instead of letting the slide scroll.
    const LP_FIT_MIN = 0.65;
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
      const isWord = btn.classList.contains("lp-word");
      const isTerm = btn.classList.contains("lp-term");
      const speakWordText = isWord ? btn.dataset.en : isTerm ? "" : btn.dataset.say;
      popup.dataset.word = speakWordText || "";
      $(".lp-word-popup-text", popup).textContent =
        (isWord ? btn.dataset.he : isTerm ? btn.dataset.explain : btn.dataset.explain || btn.dataset.say) || "";
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

    function isHebrewLesson(lessonData) {
      return lessonData?.subject !== "english";
    }

    function renderVolcanoOutputScene(hebrew = true) {
      const labels = hebrew
        ? { lava: "לבה", smoke: "עשן", ash: "אפר געשי" }
        : { lava: "lava", smoke: "smoke", ash: "ash" };
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

    function renderVolcanoStatusScene() {
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
              <small>פעיל</small>
            </div>
            <div class="lp-volcano-status-item lp-volcano-status-item--dormant">
              <svg viewBox="0 0 60 70" aria-hidden="true">
                <path fill="#5d4037" d="M10 68 L30 24 L50 68 Z"/>
                <ellipse fill="#8d6e63" cx="30" cy="26" rx="5" ry="3"/>
              </svg>
              <small>רדום</small>
            </div>
            <div class="lp-volcano-status-item lp-volcano-status-item--extinct">
              <svg viewBox="0 0 60 70" aria-hidden="true">
                <path fill="#9e9e9e" d="M12 68 L30 30 L48 68 Z"/>
                <path fill="#bdbdbd" d="M22 68 L30 38 L38 68 Z"/>
              </svg>
              <small>כבוי</small>
            </div>
          </div>
        </div>`;
    }

    function renderVolcanoScene(variant, { hebrew = true } = {}) {
      if (variant === "output") return renderVolcanoOutputScene(hebrew);
      if (variant === "world") return renderVolcanoWorldScene();
      if (variant === "earth") return renderVolcanoEarthScene();
      if (variant === "status") return renderVolcanoStatusScene();
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

    function renderContentSlide(slide) {
      let bodyHtml = "";
      let bodyLayout = "default";

      if (slide.items?.length) {
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
          ? renderVolcanoScene(slide.visual.slice("volcano-".length), { hebrew: isHebrewLesson(lesson) })
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
        <div class="lp-slide-inner${hasSideVisual ? " has-visual" : ""}${useGlossaryGrid ? " has-glossary-grid" : ""}${videoHtml ? " has-video" : ""}">
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

    function animateSlide(html, direction = 0) {
      const current = $(".lp-slide-inner", slideEl);

      const showNew = () => {
        slideEl.innerHTML = html;
        const inner = $(".lp-slide-inner", slideEl);
        if (!inner) return;
        fitSlideContent();
        if (direction > 0) inner.classList.add("from-next");
        if (direction < 0) inner.classList.add("from-prev");
        requestAnimationFrame(() => {
          requestAnimationFrame(() => inner.classList.add("is-visible"));
        });

        $$(".lp-game-btn", slideEl).forEach((btn) => {
          btn.addEventListener("click", () => launchLessonGame(lesson, btn.dataset.gameId, index));
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
      if (lesson.premium && !window.PleyiPremium?.hasPremium?.()) {
        window.PleyiPremium?.ensureLessonAccess?.(lessonId, lesson.nameMain || lesson.name);
        lesson = null;
        return;
      }
      steps = lesson.slides || [];
      index = 0;
      renderDots();
      renderStep();
      player.classList.remove("hidden");
      player.setAttribute("aria-hidden", "false");
      setExpanded(false);
      document.body.style.overflow = "hidden";
    }
    openLessonSlides = open;

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

  window.ReadyLessons = { catalog: LESSON_CATALOG, subjectLabels: SUBJECT_LABELS };
})();
