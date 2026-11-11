/* Class games (/services/class-games) — whole-class games for שיעור חברה,
   not tied to any subject. The teacher opens a game on the board and it
   fills the screen: one card at a time, a timer where the game needs one. */

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);

  // "בלשי תמונה": the painted pictures and their questions (class-pictures.js).
  const PICTURES = window.ClassPictures?.scenes || [];

  const GAMES = [
    {
      id: "stand-up",
      kind: "standUp",
      type: "move",
      level: "easy",
      title: "קומו אם...",
      how: [
        "על הלוח מופיע משפט.",
        "מי שזה נכון לגביו — קם.",
        "כל השאר נשארים לשבת.",
        "אפשר לשאול את אחד העומדים עוד שאלה.",
      ],
      items: [
        "יש לכם אח קטן",
        "אתם אוהבים פיצה",
        "קמתם היום לפני השעה שבע",
        "יש לכם חיית מחמד בבית",
        "אתם אוהבים לשחק כדורגל",
        "נולדתם בחורף",
        "אתם אוהבים לצייר",
        "הייתם פעם בירושלים",
        "אתם יודעים לשחות",
        "אתם אוהבים גלידה יותר מעוגה",
        "יש לכם יותר משלושה אחים",
        "אתם אוהבים לקרוא ספרים",
        "עזרתם היום למישהו",
        "אתם הבכורים בבית",
        "אתם הכי קטנים בבית",
        "אתם אוהבים לבנות בלגו",
        "טסתם פעם במטוס",
        "אתם אוהבים לטייל בטבע",
        "ראיתם פעם שלג אמיתי",
        "אתם אוהבים חורף יותר מקיץ",
        "אכלתם היום ארוחת בוקר",
        "אתם יודעים לרכוב על אופניים",
        "אתם אוהבים שוקולד",
        "אתם כותבים ביד שמאל",
        "אמרתם היום תודה למישהו",
        "אתם אוהבים לשיר",
        "שתלתם פעם עץ או פרח",
        "אתם גרים בבניין",
        "אתם מפחדים קצת מהחושך",
        "אתם אוהבים ללכת לים",
        "אתם אוהבים משחקי קופסה",
        "עשיתם היום מעשה טוב",
        "אתם אוהבים תפוחים יותר מבננות",
        "אתם יודעים לשרוק",
        "הגעתם היום לבית הספר ברגל",
        "אתם אוהבים לבשל או לאפות",
        "יש לכם יום הולדת החודש",
        "יש לכם חבר טוב בכיתה הזאת",
        "אתם אוהבים לשחק בחוץ יותר מבבית",
        "למדתם השנה משהו חדש מחוץ לבית הספר",
      ],
    },
    {
      id: "would-you-rather",
      kind: "wouldYouRather",
      type: "talk",
      level: "easy",
      title: "מה הייתם מעדיפים?",
      how: [
        "על הלוח יש שתי אפשרויות.",
        "כל אחד בוחר אחת מהן.",
        "קודם מרימים יד מי שבחר בצהוב, ואחר כך מי שבחר בטורקיז.",
        "אפשר לשאול כמה תלמידים למה בחרו כך.",
      ],
      items: [
        ["לעוף כמו ציפור", "לשחות כמו דג"],
        ["להיות בלתי נראים", "לקרוא מחשבות"],
        ["לגור ליד הים", "לגור ביער"],
        ["קיץ כל השנה", "חורף כל השנה"],
        ["פיצה", "המבורגר"],
        ["כלב", "חתול"],
        ["לדבר עם בעלי חיים", "לדבר בכל השפות"],
        ["להיות גבוהים מאוד", "להיות חזקים מאוד"],
        ["לטייל בחלל", "לצלול לעומק הים"],
        ["לקום מוקדם מאוד", "ללכת לישון מאוחר מאוד"],
        ["רובוט שמסדר את החדר", "רובוט שמבשל בשבילכם"],
        ["לרוץ מהר כמו צ'יטה", "לקפוץ גבוה כמו קנגורו"],
        ["בית על עץ", "בית מתחת לאדמה"],
        ["טיול בג'ונגל", "טיול בקוטב הצפוני"],
        ["לאכול רק מתוק", "לאכול רק מלוח"],
        ["לנסוע ברכבת", "להפליג בספינה"],
        ["להיות ענקים", "להיות קטנים כמו נמלה"],
        ["לחזור לימי הדינוזאורים", "לקפוץ מאה שנה קדימה"],
        ["לנהוג באוטובוס", "לטוס במסוק"],
        ["חבר אחד טוב מאוד", "הרבה חברים"],
        ["לצייר יפה מאוד", "לנגן יפה מאוד"],
        ["לגור בטירה", "לגור בספינה"],
        ["לבנות משהו בעצמכם", "לקנות משהו מוכן"],
        ["אבטיח", "ענבים"],
        ["לטפס על הר", "לשוט בנהר"],
        ["לנשום מתחת למים", "לראות בחושך"],
        ["להיות המורה ליום אחד", "להיות המנהל ליום אחד"],
        ["תוכי שמדבר", "צב ענק"],
        ["לכתוב ספר", "לבנות בית"],
        ["שוקו חם", "לימונדה קרה"],
        ["ארוחת בוקר בערב", "ארוחת ערב בבוקר"],
        ["לעצור את הזמן", "לחזור אחורה בזמן"],
        ["לגור בעיר גדולה", "לגור בכפר קטן"],
        ["יום שלם בלי חשמל", "יום שלם בלי מים חמים"],
        ["להיות הכי מהירים בכיתה", "להיות הכי מצחיקים בכיתה"],
        ["לשחק בשלג", "לשחק בחול"],
        ["חופש בים", "חופש בהרים"],
        ["לדעת לעוף", "לדעת להיעלם"],
      ],
    },
    {
      id: "question-wheel",
      kind: "wheel",
      type: "talk",
      level: "medium",
      title: "גלגל השאלות",
      how: [
        "מסובבים את הגלגל.",
        "הגלגל עוצר על נושא, ומופיעה שאלה.",
        "המורה בוחר תלמיד שיענה.",
        "אפשר לתת לכמה תלמידים לענות על אותה שאלה.",
      ],
      items: [
        {
          label: "אוכל",
          questions: [
            "מה המאכל הכי אהוב עליך?",
            "מה הדבר הכי טעים שאכלת אי פעם?",
            "מה אוכלים אצלכם בשבת שהכי טעים לך?",
            "מתוק או מלוח — ומה בדיוק?",
            "איזה מאכל היית רוצה ללמוד להכין?",
          ],
        },
        {
          label: "חלומות",
          questions: [
            "באיזה מקצוע היית רוצה לעבוד בעתיד?",
            "אם היה לך כוח־על, מה הוא היה?",
            "מה היית עושה עם מיליון שקל?",
            "איזו המצאה היית רוצה שתהיה בעולם?",
            "מה היית רוצה ללמוד לעשות השנה?",
          ],
        },
        {
          label: "חברים",
          questions: [
            "מה עושה חבר טוב?",
            "מתי חבר עזר לך?",
            "איך אפשר לעזור לילד חדש בכיתה?",
            "מה הכי כיף לעשות עם חברים?",
            "איך משלימים אחרי ריב?",
          ],
        },
        {
          label: "טיולים",
          questions: [
            "לאן היית רוצה לטייל?",
            "מה הטיול הכי יפה שהיה לך?",
            "איזה מקום בארץ הכי יפה בעיניך?",
            "ים, הר או מדבר — מה הכי אהוב עליך?",
            "מה תמיד צריך לקחת לטיול?",
          ],
        },
        {
          label: "משפחה",
          questions: [
            "איזה מקום בבית הכי אהוב עליך?",
            "מה החג הכי אהוב עליך, ולמה?",
            "מה הכי כיף לעשות עם המשפחה?",
            "איזה מנהג מיוחד יש אצלכם בבית?",
            "במה הכי כיף לך לעזור בבית?",
          ],
        },
        {
          label: "תחביבים",
          questions: [
            "מה המשחק הכי אהוב עליך?",
            "איזה תחביב היית רוצה ללמוד?",
            "איזה ספר אהבת במיוחד?",
            "מה הכי כיף לעשות בהפסקה?",
            "מה עשית השבוע אחרי בית הספר?",
          ],
        },
        {
          label: "קצת עליי",
          questions: [
            "מה הצבע הכי אהוב עליך?",
            "מה משמח אותך?",
            "מה הדבר שהכי מצליח לך?",
            "איזו חיה הכי דומה לך, ולמה?",
            "מה הדבר הכי מצחיק שקרה לך?",
          ],
        },
        {
          label: "בית ספר",
          questions: [
            "מה היית משנה בבית הספר?",
            "מה הדבר הכי מעניין שלמדת השנה?",
            "מה עוזר לך להתרכז בשיעור?",
            "מה הכי כיף בכיתה שלנו?",
            "איזה כלל חשוב יש בכיתה שלנו?",
          ],
        },
      ],
    },
    {
      id: "charades",
      kind: "charades",
      type: "guess",
      level: "easy",
      title: "פנטומימה",
      how: [
        "קוראים לתלמיד אחד ללוח.",
        "כל השאר עוצמים עיניים.",
        "התלמיד מציץ במילה — והיא נעלמת.",
        "הוא מציג אותה בלי לדבר, וכולם מנחשים.",
        "יש דקה אחת לכל מילה.",
      ],
      items: [
        "קוף", "פיל", "נחש", "ארנב", "צפרדע", "תרנגול", "פינגווין", "קנגורו", "ציפור", "דג",
        "לצחצח שיניים", "לשחק כדורגל", "לרכוב על אופניים", "לשחות", "לבשל מרק", "לצבוע קיר",
        "לקפוץ בחבל", "לטפס על הר", "לדוג דגים", "לנגן בתוף", "לבנות מגדל", "לאכול ספגטי",
        "לכתוב מכתב", "להשקות עציץ", "לשטוף כלים", "לישון", "לנפח בלון", "לפתוח מתנה",
        "כבאי", "רופא", "טבח", "צלם", "נהג אוטובוס", "שוטר", "נגר", "טייס", "דוור", "גנן",
        "מטרייה בגשם", "טלפון מצלצל", "משקפת", "מצלמה", "מחשב", "מעלית", "מטאטא",
      ],
    },
    {
      id: "who-am-i",
      kind: "whoAmI",
      type: "guess",
      level: "medium",
      title: "מי אני?",
      how: [
        "תלמיד אחד עומד ליד הלוח, עם הגב אליו.",
        "המורה מציג מילה — כל הכיתה רואה אותה.",
        "התלמיד שואל שאלות של כן ולא.",
        "הכיתה עונה רק \"כן\" או \"לא\", עד שהוא מנחש.",
      ],
      items: [
        "חתול", "אריה", "ג'ירפה", "דבורה", "תנין", "ינשוף", "פרפר", "כריש", "סוס", "עכבר", "צב", "דולפין",
        "מטרייה", "אופניים", "מקרר", "שעון", "כדורגל", "מספריים", "עיפרון", "גיטרה", "מטוס", "רכבת",
        "צוללת", "משקפיים", "כרית", "נעל", "מפתח", "נר", "סולם",
        "כבאי", "רופא שיניים", "אופה", "טייס", "חקלאי", "אסטרונאוט", "צייר",
        "פיצה", "גלידה", "אבטיח", "תפוז", "הר געש", "ענן", "ירח", "קשת בענן",
      ],
    },
    {
      id: "riddles",
      kind: "riddles",
      type: "think",
      level: "hard",
      title: "חידות",
      how: [
        "על הלוח מופיעה חידה.",
        "חושבים בשקט.",
        "מי שיודע — מרים יד.",
        "אחר כך מציגים את התשובה.",
      ],
      items: [
        ["מה נהיה רטוב יותר ככל שהוא מייבש?", "מגבת"],
        ["למה יש שיניים, אבל הוא לא נושך?", "מסרק"],
        ["למה יש צוואר, אבל אין ראש?", "בקבוק"],
        ["מה רק עולה ואף פעם לא יורד?", "הגיל"],
        ["מה יורד ואף פעם לא עולה?", "הגשם"],
        ["מה נשבר ברגע שאומרים את השם שלו?", "השקט"],
        ["ככל שלוקחים ממנו יותר, הוא נהיה גדול יותר. מה זה?", "בור"],
        ["מה רץ, אבל אין לו רגליים?", "הזמן"],
        ["מה שייך לך, אבל אחרים משתמשים בו יותר ממך?", "השם שלך"],
        ["מה מלא חורים, ובכל זאת מחזיק מים?", "ספוג"],
        ["מה נמצא בדיוק באמצע ירושלים?", "האות ש"],
        ["מה מתחיל בתל אביב ונגמר באילת?", "האות ת"],
        ["מה אפשר לשבור בלי לגעת בו?", "הבטחה"],
        ["יש בי ערים בלי בתים, יערות בלי עצים ונהרות בלי מים. מה אני?", "מפה"],
        ["מה הולך אחריך לכל מקום, ונעלם בחושך?", "הצל"],
        ["מה נהיה קצר יותר ככל שהוא דולק?", "נר"],
        ["באיזה חודש יש 28 ימים?", "בכל החודשים"],
        ["לאבא של יוסי יש שלושה בנים: ראובן, שמעון, ו...?", "יוסי"],
        ["מה כבד יותר: קילו נוצות או קילו ברזל?", "שניהם שוקלים קילו"],
        ["יש לו גב וארבע רגליים, אבל הוא לא הולך. מה זה?", "כיסא"],
        ["יש לו הרבה דפים, אבל הוא לא עץ. מה זה?", "ספר"],
        ["ככל שיש ממנו יותר — רואים פחות. מה זה?", "החושך"],
        ["מי עונה בכל השפות, בלי שלמד אף אחת?", "ההד"],
        ["מה אפשר להחזיק ביד ימין, אבל אי אפשר להחזיק ביד שמאל?", "את יד שמאל"],
        ["על איזו שאלה אי אפשר לענות \"כן\"?", "\"אתה ישן?\""],
        ["מה הולך על ארבע בבוקר, על שתיים בצהריים ועל שלוש בערב?", "האדם — תינוק זוחל, מבוגר הולך, וזקן הולך עם מקל"],
      ],
    },
    {
      id: "find-it",
      kind: "findIt",
      type: "move",
      level: "easy",
      title: "מצאו בכיתה",
      how: [
        "על הלוח כתוב מה מחפשים.",
        "מפעילים את השעון ומחפשים בכיתה.",
        "מי שמצא — מצביע עליו ואומר מה זה.",
        "אפשר לשחק בקבוצות: כל קבוצה מוצאת כמה שיותר.",
      ],
      items: [
        { text: "משהו עגול", time: 30 },
        { text: "משהו אדום", time: 30 },
        { text: "משהו כחול", time: 30 },
        { text: "משהו ירוק", time: 30 },
        { text: "משהו בצורת ריבוע", time: 30 },
        { text: "משהו בצורת משולש", time: 30 },
        { text: "משהו רך", time: 30 },
        { text: "משהו כבד", time: 30 },
        { text: "משהו שעשוי מעץ", time: 30 },
        { text: "משהו שעשוי ממתכת", time: 30 },
        { text: "משהו שעשוי מפלסטיק", time: 30 },
        { text: "משהו שיש עליו מספרים", time: 30 },
        { text: "משהו שיש עליו אותיות באנגלית", time: 45 },
        { text: "משהו שכותבים בו", time: 30 },
        { text: "משהו שכותבים איתו", time: 30 },
        { text: "משהו קטן יותר מהאצבע שלכם", time: 30 },
        { text: "משהו ארוך יותר מסרגל", time: 30 },
        { text: "משהו שאפשר לפתוח ולסגור", time: 30 },
        { text: "משהו שאפשר לקפל", time: 30 },
        { text: "משהו שאפשר לגלגל", time: 30 },
        { text: "משהו שתלוי על הקיר", time: 30 },
        { text: "משהו שיש לו רגליים", time: 30 },
        { text: "משהו שיש לו מכסה", time: 30 },
        { text: "משהו שמאיר", time: 30 },
        { text: "משהו שמשמיע קול", time: 30 },
        { text: "משהו שאפשר לראות דרכו", time: 30 },
        { text: "משהו שיש בו חור", time: 30 },
        { text: "משהו שיש בו יותר משלושה צבעים", time: 45 },
        { text: "משהו שמתחיל באות כ", time: 45 },
        { text: "משהו שמתחיל באות ש", time: 45 },
        { text: "משהו שמתחיל באות מ", time: 45 },
        { text: "משהו שמתחיל באות ס", time: 45 },
        { text: "משהו שעוזר לנו ללמוד", time: 30 },
        { text: "שלושה דברים צהובים", time: 60 },
        { text: "חמישה דברים שעשויים מנייר", time: 60 },
        { text: "שני דברים שיש להם אותה צורה", time: 60 },
      ],
    },
    {
      id: "picture-detective",
      kind: "picture",
      type: "think",
      level: "medium",
      title: "בלשי תמונה",
      how: [
        "על הלוח יש תמונה ושאלה עליה.",
        "מסתכלים טוב על התמונה ומחפשים רמזים.",
        "מי שיודע — מרים יד ומסביר איך הוא יודע.",
        "בתשובה מופיע גם הרמז שבתמונה.",
      ],
      items: PICTURES,
    },
    {
      id: "class-challenge",
      kind: "challenge",
      type: "move",
      level: "medium",
      title: "אתגר כיתתי",
      how: [
        "כל הכיתה מקבלת אתגר אחד.",
        "עובדים יחד, כמו קבוצה אחת.",
        "מפעילים את השעון ומתחילים.",
        "מצליחים לפני שהזמן נגמר?",
      ],
      items: [
        { text: "עמדו בשורה לפי תאריך יום ההולדת — בלי לדבר!", time: 180 },
        { text: "עמדו בשורה לפי הגובה, מהנמוך לגבוה.", time: 120 },
        { text: "סופרים יחד עד 20. כל פעם מישהו אחר אומר מספר. אם שניים מדברים יחד — מתחילים מהתחלה!", time: 180 },
        { text: "מצאו שלושה דברים שנכונים לכל הכיתה.", time: 120 },
        { text: "בלי לדבר: התחלקו לקבוצות לפי חודש הלידה.", time: 120 },
        { text: "עמדו יחד כך שתיצרו עיגול גדול ומושלם.", time: 60 },
        { text: "מחאו כף כולם יחד, באותו רגע בדיוק — שלוש פעמים ברצף.", time: 60 },
        { text: "כל אחד אומר מילה טובה על מי שיושב לידו.", time: 120 },
        { text: "עמדו בשורה לפי אורך השם הפרטי — מהקצר לארוך.", time: 120 },
        { text: "בלי לדבר: התחלקו לקבוצות לפי מספר האחים שיש לכם.", time: 120 },
        { text: "דקה שלמה של שקט מוחלט. כל הכיתה מצליחה?", time: 60 },
        { text: "התחלקו לזוגות. כל זוג מוצא שלושה דברים ששניהם אוהבים.", time: 120 },
        { text: "עמדו בשורה לפי סדר הא״ב של השם הפרטי.", time: 180 },
        { text: "העבירו מחיאת כף במעגל — כמה שיותר מהר, בלי לפספס אף אחד.", time: 60 },
        { text: "בזוגות: אחד זז לאט, והשני מחקה אותו כמו מראה.", time: 60 },
        { text: "מצאו מישהו שאוהב את אותו המאכל כמוכם.", time: 60 },
      ],
    },
    {
      id: "story-chain",
      kind: "story",
      type: "talk",
      level: "hard",
      title: "סיפור בהמשכים",
      how: [
        "על הלוח מופיעה תחילת סיפור.",
        "כל תלמיד מוסיף משפט אחד בהמשך.",
        "\"מילה מפתיעה\" — מילה שחייבת להיכנס לסיפור.",
        "התלמיד האחרון סוגר את הסיפור.",
      ],
      items: [
        "בוקר אחד פתחתי את החלון — ובחצר עמד פיל...",
        "בדרך לבית הספר מצאנו מפה ישנה...",
        "יום אחד המורה נכנס לכיתה עם קופסה גדולה...",
        "החתול של השכנים התחיל פתאום לדבר...",
        "ירדנו למרתף, ומצאנו שם דלת קטנה...",
        "בטיול השנתי האוטובוס עצר באמצע המדבר...",
        "בחצר בית הספר נחתה חללית קטנה...",
        "פתחתי את המקרר, ושמעתי קול קטן אומר: שלום!",
        "סבא נתן לי קופסה ישנה ואמר: אל תפתח אותה עד מחר...",
        "התעוררנו בבוקר, וכל העיר הייתה מכוסה בשלג...",
        "הכדור שלנו התגלגל לתוך יער קסום...",
        "לכיתה שלנו הגיע תלמיד חדש — רובוט!",
        "מצאנו בגינה ביצה ענקית...",
        "הספר שקראתי התחיל פתאום לזהור...",
        "יצאנו לדוג, ובחכה עלה בקבוק ובתוכו מכתב...",
        "המעלית בבניין לא עצרה בקומה שלנו — היא המשיכה לעלות...",
        "בכל לילה, בדיוק בחצות, הצעצועים בחדר מתעוררים...",
        "הגשם לא הפסיק לרדת כבר שבוע, ופתאום...",
      ],
      twists: [
        "מטרייה", "דינוזאור", "פיצה", "טיל", "מפתח", "קוסם", "ענן", "שעון", "בלון", "מסוק",
        "אוצר", "גמל", "פנס", "סולם", "ג'ירפה", "כובע", "רכבת", "עוגה", "מכשף", "צוללת",
      ],
    },
  ];

  // The filter menus above the cards; every game has one of each.
  const TYPES = { move: "תנועה", talk: "שיחה", guess: "ניחוש", think: "חשיבה" };
  const LEVELS = { easy: "קל", medium: "בינוני", hard: "קשה" };

  const WHEEL_COLORS = ["#00c9b7", "#FFE135", "#B8FFF5", "#FFD4A3"];
  const PEEK_MS = 3000;
  const CHARADES_SECONDS = 60;
  const SPIN_MS = 4200;

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function shuffle(list) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  function pickFrom(list, avoid) {
    const pool = list.length > 1 ? list.filter((x) => x !== avoid) : list;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // --- The cards grid ---
  const grid = $("#classGamesGrid");
  if (!grid) return;

  grid.innerHTML = GAMES.map((game) => `
    <article class="cg-card" data-game="${game.id}">
      <button type="button" class="cg-card-info" aria-label="איך משחקים" aria-haspopup="dialog">i</button>
      <span class="cg-card-title">${escapeHtml(game.title)}</span>
      <button type="button" class="btn btn-primary btn-candy font-cartoon cg-card-play">שחק</button>
    </article>`).join("");

  // --- Filters: game type and level ---
  const filterBar = $("#cgFilters");
  const emptyNote = $("#cgEmpty");
  const filters = { type: "all", level: "all" };
  let openFilter = null;

  function closeFilter() {
    if (!openFilter) return;
    openFilter.classList.remove("is-open");
    $(".svc-filter-menu", openFilter).classList.add("hidden");
    $(".svc-filter-trigger", openFilter).setAttribute("aria-expanded", "false");
    openFilter = null;
  }

  function applyFilters() {
    let shown = 0;
    grid.querySelectorAll(".cg-card").forEach((card) => {
      const game = GAMES.find((g) => g.id === card.dataset.game);
      const show = (filters.type === "all" || game.type === filters.type)
        && (filters.level === "all" || game.level === filters.level);
      card.classList.toggle("hidden", !show);
      if (show) shown += 1;
    });
    emptyNote.classList.toggle("hidden", shown > 0);
  }

  [["type", TYPES], ["level", LEVELS]].forEach(([key, names]) => {
    const wrap = $(`[data-filter-key="${key}"]`, filterBar);
    const trigger = $(".svc-filter-trigger", wrap);
    const menu = $(".svc-filter-menu", wrap);
    menu.innerHTML = Object.entries({ all: "הכל", ...names }).map(([value, label]) =>
      `<li><button type="button" data-value="${value}"${value === "all" ? ' class="active"' : ""}>${label}</button></li>`).join("");

    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const wasOpen = openFilter === wrap;
      closeFilter();
      if (wasOpen) return;
      wrap.classList.add("is-open");
      menu.classList.remove("hidden");
      trigger.setAttribute("aria-expanded", "true");
      openFilter = wrap;
    });

    menu.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      e.stopPropagation();
      filters[key] = btn.dataset.value;
      menu.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b === btn));
      $(".svc-filter-trigger-value", wrap).textContent = btn.textContent;
      closeFilter();
      applyFilters();
    });
  });

  document.addEventListener("click", closeFilter);

  // --- "i" dialog: how to play ---
  const infoModal = $("#cgInfoModal");
  let infoGame = null;

  function openInfo(game) {
    infoGame = game;
    $("#cgInfoTitle").textContent = game.title;
    $("#cgInfoMeta").innerHTML = `
      <span><span class="cg-key">סוג משחק</span> ${TYPES[game.type]}</span>
      <span><span class="cg-key">רמה</span> ${LEVELS[game.level]}</span>`;
    $("#cgInfoHow").innerHTML = game.how.map((line) => `<li>${escapeHtml(line)}</li>`).join("");
    infoModal.classList.remove("hidden");
  }

  function closeInfo() {
    infoModal.classList.add("hidden");
    infoGame = null;
  }

  infoModal.addEventListener("click", (e) => {
    if (e.target === infoModal) closeInfo();
  });
  $("#cgInfoClose").addEventListener("click", closeInfo);
  $("#cgInfoPlay").addEventListener("click", () => {
    const game = infoGame;
    closeInfo();
    openGame(game);
  });

  grid.addEventListener("click", (e) => {
    const card = e.target.closest(".cg-card");
    if (!card) return;
    const game = GAMES.find((g) => g.id === card.dataset.game);
    if (e.target.closest(".cg-card-info")) openInfo(game);
    else openGame(game);
  });

  // --- The game screen ---
  const runner = document.createElement("div");
  runner.className = "cg-runner hidden";
  runner.setAttribute("role", "dialog");
  runner.setAttribute("aria-modal", "true");
  runner.setAttribute("aria-labelledby", "cgRunnerTitle");
  runner.innerHTML = `
    <header class="cg-bar">
      <button type="button" class="cg-round-btn" data-act="close" aria-label="סגירה">×</button>
      <h2 class="cg-title font-cartoon"><span class="cg-key" id="cgRunnerTitle"></span></h2>
      <div class="cg-bar-end">
        <span class="cg-count"></span>
        <button type="button" class="cg-round-btn" data-act="fullscreen" aria-label="מסך מלא">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>
        </button>
      </div>
    </header>
    <p class="cg-instr"></p>
    <div class="cg-stage"></div>
    <div class="cg-controls"></div>`;
  document.body.appendChild(runner);

  let game = null; // the open game
  let deck = []; // its items, shuffled
  let pos = 0;
  let view = {}; // the current card's state (answer shown, word peeked...)
  let peekTimer = null;
  let spinTimer = null;

  // --- Timer (challenges and charades) ---
  const timer = { left: 0, id: null };

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  function beep() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = beep.ctx || (beep.ctx = new Ctx());
      [0, 0.35].forEach((at) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = 740;
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.25, ctx.currentTime + at);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + at + 0.3);
        osc.start(ctx.currentTime + at);
        osc.stop(ctx.currentTime + at + 0.3);
      });
    } catch {
      /* no sound on this device */
    }
  }

  function paintTimer() {
    const box = $(".cg-timer", runner);
    if (!box) return;
    $(".cg-timer-time", box).textContent = formatTime(timer.left);
    box.classList.toggle("is-low", timer.left > 0 && timer.left <= 10);
    box.classList.toggle("is-done", timer.left === 0);
    const btn = $("[data-act='timer']", box);
    if (btn) btn.textContent = timer.id ? "עצירה" : timer.left === 0 ? "שוב" : "התחלה";
  }

  function stopTimer() {
    clearInterval(timer.id);
    timer.id = null;
  }

  function resetTimer(seconds) {
    stopTimer();
    timer.left = seconds;
  }

  function startTimer(onEnd) {
    stopTimer();
    timer.id = setInterval(() => {
      timer.left = Math.max(0, timer.left - 1);
      if (timer.left === 0) {
        stopTimer();
        beep();
        onEnd?.();
      }
      paintTimer();
    }, 1000);
    paintTimer();
  }

  function timerHtml(withButton) {
    return `
      <div class="cg-timer">
        <span class="cg-timer-time"></span>
        ${withButton ? `<button type="button" class="cg-timer-btn" data-act="timer"></button>` : ""}
      </div>`;
  }

  // --- Wheel ---
  function wheelSvg(cats) {
    const n = cats.length;
    const c = 150;
    const r = 144;
    const point = (deg, radius) => {
      const a = (deg * Math.PI) / 180;
      return `${(c + radius * Math.sin(a)).toFixed(2)},${(c - radius * Math.cos(a)).toFixed(2)}`;
    };
    const slices = cats.map((cat, i) => {
      const from = (i * 360) / n;
      const to = ((i + 1) * 360) / n;
      const mid = (from + to) / 2;
      return `
        <path d="M${c},${c} L${point(from, r)} A${r},${r} 0 0 1 ${point(to, r)} Z" fill="${WHEEL_COLORS[i % WHEEL_COLORS.length]}" stroke="#000" stroke-width="3" stroke-linejoin="round"/>
        <text x="${c}" y="${c - r * 0.7}" transform="rotate(${mid} ${c} ${c})" class="cg-wheel-label">${escapeHtml(cat.label)}</text>`;
    }).join("");
    return `
      <svg class="cg-wheel-disc" viewBox="0 0 300 300" aria-hidden="true" style="transform: rotate(${view.angle || 0}deg)">
        ${slices}
        <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="#000" stroke-width="4"/>
        <circle cx="${c}" cy="${c}" r="20" fill="#FFE135" stroke="#000" stroke-width="4"/>
      </svg>`;
  }

  function spinWheel() {
    if (view.spinning) return;
    const cats = game.items;
    const n = cats.length;
    const target = Math.floor(Math.random() * n);
    const slice = 360 / n;
    const mid = target * slice + slice / 2;
    const jitter = (Math.random() - 0.5) * slice * 0.6;
    const current = view.angle || 0;
    // The slice under the pointer (top) is the one whose middle sits at -angle.
    const rest = (((-mid + jitter - current) % 360) + 360) % 360;
    view.angle = current + 360 * 5 + rest;
    view.spinning = true;
    view.cat = null;
    render();
    // Re-rendered at the old angle; change it on the next frame so it animates.
    const disc = $(".cg-wheel-disc", runner);
    disc.style.transform = `rotate(${current}deg)`;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        disc.classList.add("is-spinning");
        disc.style.transform = `rotate(${view.angle}deg)`;
      });
    });
    spinTimer = setTimeout(() => {
      const cat = cats[target];
      view.used[target] = view.used[target] || [];
      let left = cat.questions.filter((q) => !view.used[target].includes(q));
      if (!left.length) {
        view.used[target] = [];
        left = cat.questions;
      }
      const question = left[Math.floor(Math.random() * left.length)];
      view.used[target].push(question);
      view.spinning = false;
      view.cat = cat.label;
      view.question = question;
      render();
    }, SPIN_MS + 150);
  }

  // --- Picture (בלשי תמונה) ---
  // Each picture is painted once, then kept as an image.
  const pictureSrc = new Map();

  function pictureImage(pic) {
    if (!pictureSrc.has(pic)) {
      const { W, H } = window.ClassPictures;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      pic.draw(canvas.getContext("2d"));
      pictureSrc.set(pic, canvas.toDataURL("image/jpeg", 0.9));
    }
    return pictureSrc.get(pic);
  }

  // The rings round the answer, drawn in once it's shown.
  function marksSvg(marks) {
    const { W, H } = window.ClassPictures;
    return `
      <svg class="cg-marks" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
        ${(marks || []).map(([x, y, rx, ry], i) => `
          <ellipse class="cg-mark-ink" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" pathLength="1" style="animation-delay:${i * 0.25}s"/>
          <ellipse class="cg-mark" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" pathLength="1" style="animation-delay:${i * 0.25}s"/>`).join("")}
      </svg>`;
  }

  function pictureHtml(item) {
    return `
      <img class="cg-pic-img" src="${pictureImage(item.pic)}" alt="">
      ${view.answer ? marksSvg(item.q[3]) : ""}`;
  }

  function makeDeck() {
    if (game.kind === "wheel") return [null];
    // One card per question; a picture's questions stay together.
    if (game.kind === "picture") return shuffle(game.items).flatMap((pic) => pic.questions.map((q) => ({ pic, q })));
    return shuffle(game.items);
  }

  // --- Each kind of game: instruction, card, buttons ---
  function button(act, label, { alt = false, disabled = false } = {}) {
    const look = alt ? "cg-btn-alt" : "btn-primary";
    return `<button type="button" class="btn ${look} btn-candy font-cartoon cg-btn" data-act="${act}"${disabled ? " disabled" : ""}>${label}</button>`;
  }

  const KINDS = {
    standUp: {
      instr: () => "מי שזה נכון לגביו — קם. כל השאר נשארים לשבת.",
      stage: (item) => `
        <div class="cg-big">
          <p class="cg-lead"><span class="cg-key">קומו אם...</span></p>
          <p class="cg-main">${escapeHtml(item)}</p>
        </div>`,
      controls: () => button("next", "הבא"),
    },
    wouldYouRather: {
      instr: () => "כל אחד בוחר. מרימים יד: קודם צהוב, אחר כך טורקיז.",
      stage: (item) => `
        <div class="cg-wyr">
          <div class="cg-wyr-option cg-wyr-option--a"><span>${escapeHtml(item[0])}</span></div>
          <span class="cg-wyr-or font-cartoon">או</span>
          <div class="cg-wyr-option cg-wyr-option--b"><span>${escapeHtml(item[1])}</span></div>
        </div>`,
      controls: () => button("next", "הבא"),
    },
    wheel: {
      instr: () => "מסובבים את הגלגל. מי שנבחר — עונה על השאלה.",
      stage: () => `
        <div class="cg-wheel-stage">
          <div class="cg-wheel">
            <svg class="cg-wheel-pointer" viewBox="0 0 40 44" aria-hidden="true"><path d="M4 4 H36 L20 40 Z" fill="#FFE135" stroke="#000" stroke-width="4" stroke-linejoin="round"/></svg>
            ${wheelSvg(game.items)}
          </div>
          <div class="cg-big cg-wheel-question">
            ${view.question && !view.spinning
              ? `<p class="cg-lead"><span class="cg-key">${escapeHtml(view.cat)}</span></p>
                 <p class="cg-main">${escapeHtml(view.question)}</p>`
              : `<p class="cg-main cg-muted">${view.spinning ? "הגלגל מסתובב..." : "סובבו את הגלגל!"}</p>`}
          </div>
        </div>`,
      controls: () => button("spin", "סובבו את הגלגל", { disabled: view.spinning }),
    },
    charades: {
      instr: () => ({
        ready: "קוראים לתלמיד ללוח. כל השאר עוצמים עיניים!",
        peek: "רק המציג מסתכל...",
        act: "פותחים עיניים ומנחשים! המציג לא מדבר.",
        shown: "זאת הייתה המילה!",
      })[view.phase],
      stage: (item) => {
        if (view.phase === "peek" || view.phase === "shown") {
          return `<div class="cg-big"><p class="cg-main cg-word">${escapeHtml(item)}</p></div>`;
        }
        return `<div class="cg-big cg-cover"><p class="cg-main">המילה מוסתרת</p></div>`;
      },
      controls: () => {
        if (view.phase === "ready") return button("peek", "הצצה למציג", { alt: true });
        if (view.phase === "peek") return "";
        if (view.phase === "act") return timerHtml(false) + button("peek", "הצצה שוב", { alt: true }) + button("reveal", "ניחשו! הצגת המילה");
        return button("next", "הבא");
      },
    },
    whoAmI: {
      instr: () => (view.phase === "shown"
        ? "המנחש שואל שאלות של כן ולא. הכיתה עונה רק \"כן\" או \"לא\"."
        : "תלמיד אחד עומד ליד הלוח, עם הגב אליו."),
      stage: (item) => (view.phase === "shown"
        ? `<div class="cg-big"><p class="cg-main cg-word">${escapeHtml(item)}</p></div>`
        : `<div class="cg-big cg-cover"><p class="cg-main">המילה מוסתרת</p></div>`),
      controls: () => (view.phase === "shown"
        ? button("next", "ניחש! הבא")
        : button("show", "הצגת המילה לכיתה", { alt: true })),
    },
    riddles: {
      instr: () => "חושבים בשקט. מי שיודע — מרים יד.",
      stage: (item) => `
        <div class="cg-big">
          <p class="cg-main">${escapeHtml(item[0])}</p>
          ${view.answer ? `<p class="cg-answer"><span class="cg-key">${escapeHtml(item[1])}</span></p>` : ""}
        </div>`,
      controls: () => (view.answer ? "" : button("answer", "הצגת התשובה", { alt: true })) + button("next", "הבא"),
    },
    findIt: {
      instr: () => "מפעילים את השעון ומחפשים. מי שמצא — מצביע עליו.",
      stage: (item) => `
        <div class="cg-big">
          <p class="cg-lead"><span class="cg-key">מצאו בכיתה...</span></p>
          <p class="cg-main">${escapeHtml(item.text)}</p>
        </div>`,
      controls: () => timerHtml(true) + button("next", "הבא"),
    },
    picture: {
      instr: () => "מסתכלים טוב על התמונה. מי שיודע — מרים יד ומסביר איך.",
      stage: (item) => `
        <div class="cg-pic-stage">
          <div class="cg-big cg-pic-card">
            <p class="cg-main">${escapeHtml(item.q[0])}</p>
            ${view.answer ? `
              <div class="cg-pic-answer">
                ${item.q[1] ? `<p class="cg-answer"><span class="cg-key">${escapeHtml(item.q[1])}</span></p>` : ""}
                <div class="cg-clues">${item.q[2].map((line) => `<p class="cg-clue">${escapeHtml(line)}</p>`).join("")}</div>
              </div>` : ""}
          </div>
          <div class="cg-pic-wrap">
            <button type="button" class="cg-pic" data-act="zoom" aria-label="הגדלת התמונה">
              ${pictureHtml(item)}
              <span class="cg-pic-zoom" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21M10.5 7.5v6M7.5 10.5h6"/></svg>
              </span>
            </button>
          </div>
        </div>
        ${view.zoom ? `
          <div class="cg-zoom" data-act="unzoom" role="dialog" aria-modal="true" aria-label="התמונה בגדול">
            <div class="cg-zoom-pic">${pictureHtml(item)}</div>
            <button type="button" class="cg-round-btn cg-zoom-close" data-act="unzoom" aria-label="סגירת ההגדלה">×</button>
          </div>` : ""}`,
      controls: () => (view.answer ? "" : button("answer", "הצגת התשובה", { alt: true })) + button("next", "הבא"),
    },
    challenge: {
      instr: () => "כל הכיתה עובדת יחד. מפעילים את השעון ומתחילים!",
      stage: (item) => `<div class="cg-big"><p class="cg-main">${escapeHtml(item.text)}</p></div>`,
      controls: () => timerHtml(true) + button("next", "הבא"),
    },
    story: {
      instr: () => "כל תלמיד מוסיף משפט אחד להמשך הסיפור.",
      stage: (item) => `
        <div class="cg-big">
          <p class="cg-main">${escapeHtml(item)}</p>
          ${view.twist ? `<p class="cg-answer">מילה שחייבת להיכנס לסיפור: <span class="cg-key">${escapeHtml(view.twist)}</span></p>` : ""}
        </div>`,
      controls: () => button("twist", "מילה מפתיעה", { alt: true }) + button("next", "סיפור חדש"),
    },
  };

  function freshView() {
    clearTimeout(peekTimer);
    view = { phase: "ready" };
    if (deck[pos]?.time) resetTimer(deck[pos].time);
    else stopTimer();
  }

  function render() {
    const kind = KINDS[game.kind];
    const item = deck[pos];
    $(".cg-instr", runner).textContent = kind.instr();
    $(".cg-stage", runner).innerHTML = kind.stage(item);
    $(".cg-controls", runner).innerHTML = kind.controls();
    $(".cg-count", runner).textContent = game.kind === "wheel" ? "" : `${pos + 1}/${deck.length}`;
    paintTimer();
  }

  function next() {
    pos += 1;
    if (pos >= deck.length) {
      deck = makeDeck();
      pos = 0;
    }
    freshView();
    render();
  }

  function peek() {
    stopTimer();
    view.phase = "peek";
    render();
    clearTimeout(peekTimer);
    peekTimer = setTimeout(() => {
      view.phase = "act";
      if (!view.started) {
        view.started = true;
        resetTimer(CHARADES_SECONDS);
      }
      render();
      startTimer(() => {
        view.phase = "shown";
        render();
      });
    }, PEEK_MS);
  }

  function openGame(target) {
    game = target;
    deck = makeDeck();
    pos = 0;
    freshView();
    if (game.kind === "wheel") view = { angle: 0, used: {} };
    $("#cgRunnerTitle").textContent = game.title;
    runner.classList.remove("hidden");
    document.documentElement.classList.add("cg-open");
    render();
    $("[data-act='close']", runner).focus();
  }

  function closeGame() {
    stopTimer();
    clearTimeout(peekTimer);
    clearTimeout(spinTimer);
    runner.classList.add("hidden");
    document.documentElement.classList.remove("cg-open");
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    game = null;
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    else document.documentElement.requestFullscreen?.().catch(() => {});
  }

  runner.addEventListener("click", (e) => {
    const act = e.target.closest("[data-act]")?.dataset.act;
    if (!act || !game) return;
    if (act === "close") closeGame();
    else if (act === "fullscreen") toggleFullscreen();
    else if (act === "next") next();
    else if (act === "spin") spinWheel();
    else if (act === "peek") peek();
    else if (act === "show") {
      view.phase = "shown";
      render();
    } else if (act === "reveal") {
      stopTimer();
      view.phase = "shown";
      render();
    } else if (act === "answer") {
      view.answer = true;
      render();
    } else if (act === "zoom" || act === "unzoom") {
      view.zoom = act === "zoom";
      render();
    } else if (act === "twist") {
      view.twist = pickFrom(game.twists, view.twist);
      render();
    } else if (act === "timer") {
      if (timer.id) stopTimer();
      else {
        if (timer.left === 0) timer.left = deck[pos].time;
        startTimer();
      }
      paintTimer();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (openFilter) closeFilter();
    else if (game && view.zoom) {
      view.zoom = false;
      render();
    } else if (game) closeGame();
    else if (!infoModal.classList.contains("hidden")) closeInfo();
  });
})();
