/* Short English lessons — every grammar topic split into short lessons, one
   idea per slide, in very simple Hebrew. ready-lessons.js turns each entry
   into a full lesson (shortLesson): it adds the quiz, the class
   discussion, the games and the end slides.

   Lesson: { id, topic, name, part?, summary, vocab, slides, quiz, discuss }
   - topic: the english-data.js topic; its `lessons` list sets the order.
   - name: the topic's short name; a topic with several lessons shows
     "<name> <n> – <part>" in the lessons library and "שיעור <n> – <part>"
     on its topic page.
   - vocab: [[en, he], ...] — the words the games use.
   - slides: { title, lines?, table?, examples?, flow?, compare? }
       lines: short Hebrew lines. table: [[from, to], ...] rows with an arrow.
       examples: [[en, he], ...] cards; "**am**" marks the word the slide is
       about. flow: a down arrow between the examples. compare: [wrong, right].
   - quiz: [[q, he, options, answer, why], ...] — "___" is the blank.
   - discuss: the class-discussion questions.

   Hebrew lines: never put . , : ? ! right after an English word (in RTL the
   mark jumps to the wrong side) — end the line with a Hebrew word or with the
   English word alone. No girls' names, pictures or sentences about girls;
   "she" appears only in the rules (he, she, it). */
window.ENGLISH_SHORT_LESSONS = [
  /* ---------- Stage 1: reading letters ---------- */
  {
    id: "letters-1",
    topic: "letters",
    name: "אותיות וצלילים",
    part: "ה־ABC",
    summary: "מכירים את 26 האותיות – אות גדולה, אות קטנה והצליל של כל אות.",
    vocab: [["A", "אֵי"], ["B", "בִּי"], ["C", "סִי"], ["D", "דִי"], ["ball", "כדור"], ["dog", "כלב"], ["moon", "ירח"], ["bed", "מיטה"]],
    slides: [
      {
        title: "**ה־ABC**",
        lines: ["באנגלית יש 26 אותיות", "ביחד הן נקראות ה־ABC"],
        examples: [["A B C D E F G H I J K L M", ""], ["N O P Q R S T U V W X Y Z", ""]],
      },
      {
        title: "גדולה **וקטנה**",
        lines: ["לכל אות יש שתי צורות"],
        table: [["A", "**a**"], ["B", "**b**"], ["D", "**d**"], ["G", "**g**"]],
      },
      {
        title: "מתי אות **גדולה**?",
        lines: ["בתחילת משפט", "ובשם של ילד או של מקום"],
        examples: [["**T**om is from **I**srael.", "טום מישראל"]],
      },
      {
        title: "שם **וצליל**",
        lines: ["לכל אות יש שם", "ובתוך מילה היא עושה צליל"],
        table: [["b", "בּ"], ["d", "ד"], ["m", "מ"], ["s", "ס"]],
      },
      {
        title: "**באיזו אות** מתחילה?",
        lines: ["מקשיבים לצליל הראשון במילה"],
        examples: [["**b**all", "כדור – מתחיל ב־b"], ["**m**oon", "ירח – מתחיל ב־m"]],
      },
      {
        title: "שימו **לב**",
        lines: ["b ו־d נראות דומות", "קוראים לאט ובודקים"],
        examples: [["**b**ed", "מיטה"], ["**d**og", "כלב"]],
      },
      {
        title: "**לסיכום**",
        lines: ["לכל אות יש צורה גדולה, צורה קטנה וצליל"],
        table: [["B b", "בּ"], ["M m", "מ"], ["S s", "ס"]],
      },
    ],
    quiz: [
      ["___og", "כלב – dog", ["d", "b", "p"], 0, "dog מתחיל בצליל ד"],
      ["G → ___", "האות הקטנה של G", ["g", "q", "j"], 0, "G גדולה ו־g קטנה"],
      ["___all", "כדור – ball", ["b", "d", "p"], 0, "ball מתחיל בצליל בּ"],
    ],
    discuss: ["איזו מילה באנגלית אתם כבר מכירים? באיזו אות היא מתחילה?", "מצאו בכיתה משהו שמתחיל בצליל בּ"],
  },
  {
    id: "letters-2",
    topic: "letters",
    name: "אותיות וצלילים",
    part: "תנועות וקריאה",
    summary: "לומדים את חמש התנועות וקוראים מילים קצרות.",
    vocab: [["cat", "חתול"], ["bed", "מיטה"], ["six", "שש"], ["dog", "כלב"], ["sun", "שמש"], ["hat", "כובע"], ["hot", "חם"]],
    slides: [
      {
        title: "**התנועות**",
        lines: ["חמש אותיות מיוחדות", "הן כמו הניקוד בעברית"],
        examples: [["a  e  i  o  u", ""]],
      },
      {
        title: "הצליל **הקצר**",
        lines: ["בתוך מילה קצרה – כל תנועה עושה צליל קצר"],
        table: [["a", "אֶ"], ["e", "אֶ"], ["i", "אִ"], ["o", "אוֹ"], ["u", "אַ"]],
      },
      {
        title: "**דוגמאות**",
        lines: ["שומעים את התנועה באמצע"],
        examples: [["c**a**t", "חתול"], ["b**e**d", "מיטה"], ["s**i**x", "שש"]],
      },
      {
        title: "עוד **דוגמאות**",
        lines: ["שומעים את התנועה באמצע"],
        examples: [["d**o**g", "כלב"], ["s**u**n", "שמש"]],
      },
      {
        title: "קוראים **מילה**",
        lines: ["אומרים צליל, ועוד צליל, ועוד צליל", "ומחברים"],
        flow: true,
        examples: [["d – o – g", ""], ["dog", "כלב"]],
      },
      {
        title: "מחליפים **אות**",
        lines: ["משנים תנועה אחת – ויש מילה חדשה"],
        examples: [["h**a**t", "כובע"], ["h**o**t", "חם"]],
      },
      {
        title: "שימו **לב**",
        lines: ["לא אומרים את שמות האותיות: סִי, אֵי, טִי", "אומרים את הצלילים ומחברים"],
        examples: [["cat", "חתול"]],
      },
    ],
    quiz: [
      ["איזו אות היא תנועה?", "", ["m", "a", "t"], 1, "a היא אחת מחמש התנועות"],
      ["s + u + n = ___", "", ["sun", "bus", "nut"], 0, "מחברים את הצלילים לפי הסדר"],
      ["d + o + g = ___", "", ["dig", "dog", "dot"], 1, "o נשמעת אוֹ"],
    ],
    discuss: ["כמה תנועות יש באנגלית? מי זוכר את כולן?", "קראו יחד: cat, dog, sun"],
  },
  {
    id: "phonics-1",
    topic: "phonics",
    name: "צירופי אותיות",
    part: "sh, ch, th",
    summary: "לומדים את sh, ch, th – שתי אותיות שעושות צליל אחד.",
    vocab: [["fish", "דג"], ["shoe", "נעל"], ["ship", "ספינה"], ["chair", "כיסא"], ["lunch", "ארוחת צהריים"], ["three", "שלוש"], ["bath", "אמבטיה"]],
    slides: [
      {
        title: "שתי אותיות – **צליל אחד**",
        lines: ["לפעמים שתי אותיות עושות יחד צליל אחד"],
        examples: [["fi**sh**", "דג"]],
      },
      {
        title: "**sh** – ש",
        lines: ["s ועוד h עושות ש"],
        examples: [["**sh**oe", "נעל"], ["fi**sh**", "דג"]],
      },
      {
        title: "**ch** – צ׳",
        lines: ["c ועוד h עושות צ׳"],
        examples: [["**ch**air", "כיסא"], ["lun**ch**", "ארוחת צהריים"]],
      },
      {
        title: "**th**",
        lines: ["שמים את הלשון בין השיניים", "ונושפים קצת אוויר"],
        examples: [["**th**ree", "שלוש"], ["ba**th**", "אמבטיה"]],
      },
      {
        title: "שימו **לב**",
        lines: ["sh זה לא ס ועוד ה", "זה צליל אחד – ש"],
        compare: ["s – hip", "**sh**ip"],
      },
      {
        title: "**לסיכום**",
        table: [["sh", "ש"], ["ch", "צ׳"], ["th", "לשון בין השיניים"]],
      },
    ],
    quiz: [
      ["___ip", "ספינה – ship", ["sh", "ch", "th"], 0, "ship מתחיל בצליל ש"],
      ["___air", "כיסא – chair", ["sh", "ch", "th"], 1, "ch עושה צ׳"],
      ["___ree", "שלוש – three", ["sh", "ch", "th"], 2, "three מתחיל ב־th"],
    ],
    discuss: ["תנו דוגמה למילה באנגלית עם sh", "איזו מילה בעברית מתחילה בצליל צ׳?"],
  },
  {
    id: "phonics-2",
    topic: "phonics",
    name: "צירופי אותיות",
    part: "ee, oo, e שקטה",
    summary: "לומדים את ee ו־oo – ואת ה־e השקטה בסוף המילה.",
    vocab: [["tree", "עץ"], ["green", "ירוק"], ["moon", "ירח"], ["school", "בית ספר"], ["cake", "עוגה"], ["bike", "אופניים"], ["home", "בית"]],
    slides: [
      {
        title: "**ee** – אִי ארוך",
        lines: ["שתי e יחד עושות אִי ארוך"],
        examples: [["tr**ee**", "עץ"], ["gr**ee**n", "ירוק"]],
      },
      {
        title: "**oo** – אוּ ארוך",
        lines: ["שתי o יחד עושות אוּ ארוך"],
        examples: [["m**oo**n", "ירח"], ["sch**oo**l", "בית ספר"]],
      },
      {
        title: "**e** שקטה",
        lines: ["e בסוף המילה לא נשמעת", "אבל היא משנה את התנועה"],
        flow: true,
        examples: [["cap", "כובע"], ["cap**e**", "גלימה"]],
      },
      {
        title: "עוד **דוגמאות**",
        lines: ["עם e שקטה – התנועה אומרת את השם שלה"],
        examples: [["c**a**k**e**", "עוגה"], ["b**i**k**e**", "אופניים"], ["h**o**m**e**", "בית"]],
      },
      {
        title: "שימו **לב**",
        lines: ["oo זה לא אוֹ ועוד אוֹ", "זה צליל אחד – אוּ ארוך"],
        compare: ["mo – on", "m**oo**n"],
      },
      {
        title: "**לסיכום**",
        table: [["ee", "אִי ארוך"], ["oo", "אוּ ארוך"], ["e בסוף", "לא נשמעת"]],
      },
    ],
    quiz: [
      ["tr___", "עץ – tree", ["ee", "oo"], 0, "ee עושה אִי ארוך"],
      ["sch___l", "בית ספר – school", ["ee", "oo"], 1, "oo עושה אוּ ארוך"],
      ["bik___", "אופניים – bike", ["e", "a", "o"], 0, "e שקטה בסוף משנה את i"],
    ],
    discuss: ["תנו דוגמה למילה עם ee או עם oo", "מה עושה ה־e השקטה בסוף המילה?"],
  },

  /* ---------- Stage 3: first sentence ---------- */
  {
    id: "pronouns",
    topic: "pronouns",
    name: "כינויי גוף",
    summary: "מילים קטנות שבאות במקום שם – I, you, he, she, it, we, they",
    vocab: [["I", "אני"], ["you", "אתה / אתם"], ["he", "הוא"], ["she", "היא"], ["it", "זה – חפץ או חיה"], ["we", "אנחנו"], ["they", "הם"]],
    slides: [
      {
        title: "מה זה **כינוי גוף**?",
        lines: ["מילה קטנה שבאה במקום שם"],
        flow: true,
        examples: [["**Tom** is tall.", "טום גבוה"], ["**He** is tall.", "הוא גבוה"]],
      },
      {
        title: "**I** – אני",
        lines: ["כשמדברים על עצמי – I", "תמיד באות גדולה"],
        examples: [["**I** am Dan.", "אני דן"]],
      },
      {
        title: "**he** / **she**",
        lines: ["he – הוא", "she – היא"],
        examples: [["**He** is my brother.", "הוא אח שלי"]],
      },
      {
        title: "**it** – זה",
        lines: ["it – על חפץ או על חיה"],
        examples: [["**It** is a ball.", "זה כדור"], ["**It** is a cat.", "זה חתול"]],
      },
      {
        title: "**we** / **they**",
        lines: ["we – אנחנו", "they – הם"],
        examples: [["**We** are friends.", "אנחנו חברים"], ["**They** are dogs.", "הם כלבים"]],
      },
      {
        title: "**you** – אתה וגם אתם",
        lines: ["you – לאחד או להרבה, אותה מילה"],
        examples: [["**You** are kind.", "אתה נחמד / אתם נחמדים"]],
      },
      {
        title: "**לסיכום**",
        table: [["I", "אני"], ["you", "אתה, אתם"], ["he / she / it", "הוא / היא / זה"], ["we", "אנחנו"], ["they", "הם"]],
      },
    ],
    quiz: [
      ["___ is a ball.", "זה כדור", ["He", "It", "They"], 1, "על חפץ אומרים it"],
      ["Tom and I → ___", "טום ואני", ["we", "they", "he"], 0, "אני ועוד מישהו – אנחנו"],
      ["Dan and Ben → ___", "דן ובן", ["he", "we", "they"], 2, "הם – they"],
    ],
    discuss: ["ספרו על חבר במשפט שמתחיל ב־He", "ספרו על החברים שלכם במשפט שמתחיל ב־We"],
  },
  {
    id: "tobe-1",
    topic: "tobe",
    name: "פועל להיות",
    part: "am, is, are",
    summary: "לומדים מתי אומרים am, מתי is ומתי are – עם דוגמאות קלות.",
    vocab: [["am", "בא עם I"], ["is", "בא עם he, she, it"], ["are", "בא עם you, we, they"], ["I'm", "קיצור של I am"], ["He's", "קיצור של He is"], ["They're", "קיצור של They are"], ["happy", "שמח"], ["tall", "גבוה"], ["friends", "חברים"]],
    slides: [
      {
        title: "פועל **להיות**",
        lines: ["בעברית אומרים: אני שמח", "באנגלית מוסיפים מילה קטנה באמצע"],
        examples: [["I **am** happy.", "אני שמח"]],
      },
      {
        title: "אני – **I am**",
        lines: ["עם I אומרים am"],
        examples: [["I **am** happy.", "אני שמח"], ["I **am** ten.", "אני בן עשר"]],
      },
      {
        title: "הוא, היא, זה – **is**",
        lines: ["עם he, she, it אומרים is"],
        examples: [["He **is** tall.", "הוא גבוה"], ["It **is** red.", "זה אדום"]],
      },
      {
        title: "אתה, אנחנו, הם – **are**",
        lines: ["עם you, we, they אומרים are"],
        examples: [["We **are** friends.", "אנחנו חברים"], ["They **are** happy.", "הם שמחים"]],
      },
      {
        title: "**לסיכום**",
        lines: ["בוחרים לפי מי שמדברים עליו"],
        table: [["I", "**am**"], ["he, she, it", "**is**"], ["you, we, they", "**are**"]],
      },
      {
        title: "שימו **לב**",
        lines: ["בעברית אין מילה כזאת", "באנגלית אסור לשכוח אותה"],
        compare: ["I happy.", "I **am** happy."],
      },
      {
        title: "מדברים **מהר**",
        lines: ["מחברים שתי מילים למילה אחת"],
        table: [["I am", "**I'm**"], ["He is", "**He's**"], ["They are", "**They're**"]],
      },
    ],
    quiz: [
      ["I ___ happy.", "אני שמח", ["am", "is", "are"], 0, "עם I תמיד אומרים am"],
      ["The dog ___ big.", "הכלב גדול", ["am", "is", "are"], 1, "כלב אחד הוא כמו it ולכן is"],
      ["We ___ friends.", "אנחנו חברים", ["am", "is", "are"], 2, "עם we אומרים are"],
    ],
    discuss: ["ספרו על עצמכם במשפט אחד עם I am", "ספרו על חבר במשפט אחד עם He is"],
  },
  {
    id: "tobe-2",
    topic: "tobe",
    name: "פועל להיות",
    part: "לא ושאלות",
    summary: "לומדים להגיד לא עם not, לשאול שאלה ולענות בקצרה.",
    vocab: [["not", "לא – בא אחרי am, is, are"], ["isn't", "קיצור של is not"], ["aren't", "קיצור של are not"], ["Is he", "האם הוא"], ["Are you", "האם אתה"], ["ready", "מוכן"], ["here", "כאן"], ["tired", "עייף"]],
    slides: [
      {
        title: "**נזכרים**",
        lines: ["היום לומדים להגיד **לא** ולשאול **שאלה**"],
        table: [["I", "**am**"], ["he, she, it", "**is**"], ["you, we, they", "**are**"]],
      },
      {
        title: "לא – **not**",
        lines: ["רוצים להגיד לא? מוסיפים not", "שמים אותו אחרי am, is, are"],
        examples: [["I am **not** tired.", "אני לא עייף"], ["He is **not** here.", "הוא לא כאן"]],
      },
      {
        title: "**isn't** / **aren't**",
        lines: ["גם את not אפשר לקצר"],
        table: [["is not", "**isn't**"], ["are not", "**aren't**"]],
        examples: [["They **aren't** ready.", "הם לא מוכנים"]],
      },
      {
        title: "איך **שואלים**?",
        lines: ["בשאלה is קופץ להתחלה"],
        flow: true,
        examples: [["He **is** happy.", "הוא שמח"], ["**Is** he happy?", "האם הוא שמח?"]],
      },
      {
        title: "עוד **שאלות**",
        lines: ["גם are קופץ להתחלה"],
        examples: [["**Are** you ready?", "האם אתה מוכן?"], ["**Are** they at home?", "האם הם בבית?"]],
      },
      {
        title: "תשובה **קצרה**",
        lines: ["על שאלה כזאת עונים קצר"],
        examples: [["**Is** he happy?", "האם הוא שמח?"], ["Yes, he **is**.", "כן, הוא שמח"], ["No, he **isn't**.", "לא, הוא לא שמח"]],
      },
      {
        title: "שימו **לב**",
        lines: ["בשאלה is בא ראשון"],
        compare: ["He is happy?", "**Is** he happy?"],
      },
      {
        title: "**לסיכום**",
        table: [["רגיל", "He **is** happy."], ["לא", "He **isn't** happy."], ["שאלה", "**Is** he happy?"]],
      },
    ],
    quiz: [
      ["He ___ here.", "הוא לא כאן", ["isn't", "aren't"], 0, "עם he אומרים is ולכן isn't"],
      ["___ you ready?", "האם אתה מוכן?", ["Am", "Is", "Are"], 2, "עם you אומרים are – ובשאלה הוא בא ראשון"],
      ["Is he happy? Yes, he ___.", "האם הוא שמח? כן", ["is", "isn't", "are"], 0, "כן – עונים עם is"],
    ],
    discuss: ["שאלו חבר שאלה שמתחילה ב־Are you", "ענו על השאלה בתשובה קצרה – כן או לא"],
  },
  {
    id: "articles-1",
    topic: "articles",
    name: "מילות הצבעה ויידוע",
    part: "a / an / the",
    summary: "מתי אומרים a, מתי an ומתי the – עם דוגמאות קלות.",
    vocab: [["a", "אחד – לפני עיצור"], ["an", "אחד – לפני תנועה"], ["the", "ה׳ הידיעה"], ["apple", "תפוח"], ["egg", "ביצה"], ["dog", "כלב"], ["sun", "שמש"]],
    slides: [
      {
        title: "**a** – אחד",
        lines: ["a באה לפני דבר אחד"],
        examples: [["**a** dog", "כלב"], ["**a** ball", "כדור"]],
      },
      {
        title: "**an** – לפני תנועה",
        lines: ["מילה שמתחילה ב־a, e, i, o, u", "מקבלת an"],
        examples: [["**an** apple", "תפוח"], ["**an** egg", "ביצה"]],
      },
      {
        title: "שימו **לב**",
        lines: ["לפני תנועה אומרים an"],
        compare: ["a apple", "**an** apple"],
      },
      {
        title: "**the** – ה׳ הידיעה",
        lines: ["the – כמו ה׳ בעברית", "דבר מסוים שכולם יודעים עליו"],
        examples: [["**the** sun", "השמש"], ["**the** door", "הדלת"]],
      },
      {
        title: "מתי **a** ומתי **the**",
        lines: ["פעם ראשונה – a", "אחר כך – the"],
        examples: [["I have **a** dog.", "יש לי כלב"], ["**The** dog is big.", "הכלב גדול"]],
      },
      {
        title: "**לסיכום**",
        table: [["דבר אחד", "**a**"], ["לפני תנועה", "**an**"], ["ה׳ הידיעה", "**the**"]],
      },
    ],
    quiz: [
      ["I eat ___ apple.", "אני אוכל תפוח", ["a", "an"], 1, "apple מתחיל בתנועה ולכן an"],
      ["He has ___ cat.", "יש לו חתול", ["a", "an"], 0, "cat מתחיל בעיצור ולכן a"],
      ["Look at ___ moon!", "תסתכלו על הירח", ["a", "the"], 1, "יש רק ירח אחד ולכן the"],
    ],
    discuss: ["מה יש לכם בתיק? ענו עם a או an", "מצאו בכיתה דבר ששמו באנגלית מתחיל בתנועה"],
  },
  {
    id: "articles-2",
    topic: "articles",
    name: "מילות הצבעה ויידוע",
    part: "this / that / these / those",
    summary: "מצביעים על דברים קרובים ורחוקים – אחד או הרבה.",
    vocab: [["this", "זה – קרוב"], ["that", "ההוא – רחוק"], ["these", "אלה – קרובים"], ["those", "ההם – רחוקים"], ["book", "ספר"], ["tree", "עץ"], ["shoes", "נעליים"]],
    slides: [
      {
        title: "**this** – זה",
        lines: ["this – דבר אחד שקרוב אליי"],
        examples: [["**This** is my book.", "זה הספר שלי"]],
      },
      {
        title: "**that** – ההוא",
        lines: ["that – דבר אחד שרחוק ממני"],
        examples: [["**That** is a tree.", "ההוא עץ"]],
      },
      {
        title: "**these** – אלה",
        lines: ["these – הרבה דברים קרובים"],
        examples: [["**These** are my shoes.", "אלה הנעליים שלי"]],
      },
      {
        title: "**those** – ההם",
        lines: ["those – הרבה דברים רחוקים"],
        examples: [["**Those** are birds.", "ההן ציפורים"]],
      },
      {
        title: "**לסיכום**",
        table: [["קרוב – אחד", "**this**"], ["רחוק – אחד", "**that**"], ["קרוב – הרבה", "**these**"], ["רחוק – הרבה", "**those**"]],
      },
      {
        title: "שימו **לב**",
        lines: ["על הרבה דברים אומרים these"],
        compare: ["This are my books.", "**These** are my books."],
      },
    ],
    quiz: [
      ["___ is my pen.", "זה העט שלי – קרוב", ["This", "These"], 0, "דבר אחד קרוב – this"],
      ["___ are my friends.", "אלה החברים שלי – קרובים", ["This", "These", "That"], 1, "הרבה וקרובים – these"],
      ["Look at ___ star!", "תסתכלו על הכוכב ההוא – רחוק", ["this", "that", "these"], 1, "דבר אחד רחוק – that"],
    ],
    discuss: ["הצביעו על משהו קרוב ואמרו This is", "הצביעו על משהו רחוק ואמרו That is"],
  },
  {
    id: "plurals-1",
    topic: "plurals",
    name: "יחיד ורבים",
    part: "s / es",
    summary: "אחד או הרבה? מוסיפים s או es בסוף המילה.",
    vocab: [["cat", "חתול"], ["cats", "חתולים"], ["box", "קופסה"], ["boxes", "קופסאות"], ["bus", "אוטובוס"], ["buses", "אוטובוסים"], ["books", "ספרים"]],
    slides: [
      {
        title: "אחד או **הרבה**?",
        lines: ["בעברית: ספר – ספרים", "באנגלית מוסיפים s בסוף"],
        flow: true,
        examples: [["book", "ספר"], ["book**s**", "ספרים"]],
      },
      {
        title: "מוסיפים **s**",
        lines: ["ברוב המילים – פשוט מוסיפים s"],
        table: [["cat", "cat**s**"], ["dog", "dog**s**"], ["pen", "pen**s**"]],
      },
      {
        title: "מוסיפים **es**",
        lines: ["מילה שנגמרת ב־s, x, sh, ch", "מקבלת es"],
        table: [["bus", "bus**es**"], ["box", "box**es**"], ["dish", "dish**es**"]],
      },
      {
        title: "**is** / **are**",
        lines: ["אחד – is", "הרבה – are"],
        examples: [["The cat **is** small.", "החתול קטן"], ["The cats **are** small.", "החתולים קטנים"]],
      },
      {
        title: "שימו **לב**",
        lines: ["גם אחרי מספר – מוסיפים s"],
        compare: ["two book", "two book**s**"],
      },
      {
        title: "**לסיכום**",
        table: [["רוב המילים", "**s**"], ["s, x, sh, ch בסוף", "**es**"]],
      },
    ],
    quiz: [
      ["three ___", "שלושה חתולים", ["cat", "cats", "cates"], 1, "ברוב המילים מוסיפים s"],
      ["two ___", "שתי קופסאות", ["boxs", "boxes"], 1, "box נגמרת ב־x ולכן es"],
      ["The dogs ___ big.", "הכלבים גדולים", ["is", "are"], 1, "הרבה – are"],
    ],
    discuss: ["ספרו מה יש בכיתה בעזרת מספר – two, three, four", "מה יש לכם בתיק? אמרו את זה ברבים"],
  },
  {
    id: "plurals-2",
    topic: "plurals",
    name: "יחיד ורבים",
    part: "מילים מיוחדות",
    summary: "מילים שמשתנות ברבים – baby, leaf, child ועוד.",
    vocab: [["baby", "תינוק"], ["babies", "תינוקות"], ["leaf", "עלה"], ["leaves", "עלים"], ["child", "ילד"], ["children", "ילדים"], ["man", "איש"], ["men", "אנשים"]],
    slides: [
      {
        title: "**y** הופכת ל־**ies**",
        lines: ["עיצור ואחריו y בסוף המילה", "מורידים את y ומוסיפים ies"],
        table: [["baby", "bab**ies**"], ["city", "cit**ies**"]],
      },
      {
        title: "**f** הופכת ל־**ves**",
        lines: ["מילה שנגמרת ב־f", "מקבלת ves"],
        table: [["leaf", "lea**ves**"], ["wolf", "wol**ves**"]],
      },
      {
        title: "מילים **מיוחדות**",
        lines: ["יש מילים שמשתנות לגמרי", "צריך לזכור אותן"],
        table: [["child", "**children**"], ["man", "**men**"], ["foot", "**feet**"], ["tooth", "**teeth**"]],
      },
      {
        title: "**אותה** מילה",
        lines: ["ויש מילים שלא משתנות בכלל"],
        table: [["fish", "fish"], ["sheep", "sheep"]],
      },
      {
        title: "שימו **לב**",
        lines: ["ילדים זה children"],
        compare: ["two childs", "two **children**"],
      },
    ],
    quiz: [
      ["two ___", "שני ילדים", ["childs", "children"], 1, "ילדים – children"],
      ["three ___", "שלושה תינוקות", ["babys", "babies"], 1, "y הופכת ל־ies"],
      ["many ___", "הרבה עלים", ["leafs", "leaves"], 1, "f הופכת ל־ves"],
    ],
    discuss: ["כמה ילדים יש בכיתה שלנו? ענו עם children", "מה עוד יש הרבה בכיתה? אמרו את זה באנגלית"],
  },

  /* ---------- Stage 4: what I have and where ---------- */
  {
    id: "possessives-1",
    topic: "possessives",
    name: "כינויי שייכות",
    part: "my, your, his",
    summary: "של מי זה? לומדים את my, your, his ועוד – עם דוגמאות קלות.",
    vocab: [["my", "שלי"], ["your", "שלך / שלכם"], ["his", "שלו"], ["her", "שלה"], ["its", "שלו – של חפץ או חיה"], ["our", "שלנו"], ["their", "שלהם"]],
    slides: [
      {
        title: "של **מי** זה?",
        lines: ["בעברית: הספר שלי", "באנגלית המילה שלי באה לפני"],
        examples: [["**my** book", "הספר שלי"]],
      },
      {
        title: "**my** / **your**",
        lines: ["my – שלי", "your – שלך"],
        examples: [["This is **my** bag.", "זה התיק שלי"], ["Is this **your** pen?", "זה העט שלך?"]],
      },
      {
        title: "**his** / **her**",
        lines: ["his – שלו", "her – שלה"],
        examples: [["**His** name is Tom.", "השם שלו טום"]],
      },
      {
        title: "**our** / **their**",
        lines: ["our – שלנו", "their – שלהם"],
        examples: [["**Our** class is big.", "הכיתה שלנו גדולה"], ["**Their** dog is black.", "הכלב שלהם שחור"]],
      },
      {
        title: "**its** – של חפץ או חיה",
        lines: ["its – שלו, של חיה או של חפץ"],
        examples: [["The cat eats **its** food.", "החתול אוכל את האוכל שלו"]],
      },
      {
        title: "**לסיכום**",
        table: [["I", "**my**"], ["you", "**your**"], ["he", "**his**"], ["she", "**her**"], ["it", "**its**"], ["we", "**our**"], ["they", "**their**"]],
      },
    ],
    quiz: [
      ["This is ___ ball.", "זה הכדור שלי", ["my", "me", "I"], 0, "שלי – my"],
      ["Tom has a dog. ___ dog is big.", "הכלב שלו גדול", ["His", "Her", "Its"], 0, "של טום – his"],
      ["We love ___ school.", "אנחנו אוהבים את בית הספר שלנו", ["their", "our", "your"], 1, "שלנו – our"],
    ],
    discuss: ["ספרו על משהו שלכם במשפט עם my", "ספרו על חבר במשפט עם his"],
  },
  {
    id: "possessives-2",
    topic: "possessives",
    name: "כינויי שייכות",
    part: "Tom's, Whose",
    summary: "לומדים להגיד של מי – Tom's ball – ולשאול עם Whose",
    vocab: [["Tom's", "של טום"], ["Whose", "של מי"], ["Dad's", "של אבא"], ["the dog's", "של הכלב"], ["their", "שלהם"], ["there", "שם"]],
    slides: [
      {
        title: "של מי? – **Tom's**",
        lines: ["מוסיפים לשם גרש ואות s", "וזה אומר של"],
        examples: [["Tom**'s** ball", "הכדור של טום"], ["Dad**'s** car", "המכונית של אבא"]],
      },
      {
        title: "עוד **דוגמאות**",
        examples: [["The dog**'s** bed", "המיטה של הכלב"], ["My brother**'s** room", "החדר של אח שלי"]],
      },
      {
        title: "**Whose** – של מי",
        lines: ["שואלים של מי עם Whose"],
        examples: [["**Whose** bag is this?", "של מי התיק הזה?"], ["It is Ben**'s** bag.", "זה התיק של בן"]],
      },
      {
        title: "**their** / **there**",
        lines: ["נשמעות אותו דבר – אבל הן שונות"],
        table: [["their", "שלהם"], ["there", "שם"]],
        examples: [["**Their** house is **there**.", "הבית שלהם שם"]],
      },
      {
        title: "שימו **לב**",
        lines: ["אחרי השם – גרש ואות s"],
        compare: ["Tom ball", "Tom**'s** ball"],
      },
      {
        title: "**לסיכום**",
        table: [["של טום", "**Tom's**"], ["של מי?", "**Whose**"], ["שלהם", "**their**"]],
      },
    ],
    quiz: [
      ["This is ___ bike.", "אלה האופניים של דן", ["Dan", "Dan's", "Dans"], 1, "של דן – Dan's"],
      ["___ pen is this?", "של מי העט הזה?", ["Who", "Whose", "What"], 1, "של מי – Whose"],
      ["The boys play with ___ ball.", "הבנים משחקים עם הכדור שלהם", ["their", "there"], 0, "שלהם – their"],
    ],
    discuss: ["הרימו חפץ של חבר ואמרו This is Tom's", "שאלו חבר: Whose bag is this"],
  },
  {
    id: "have-has-1",
    topic: "have-has",
    name: "יש לי, יש לו",
    part: "have / has",
    summary: "איך אומרים יש לי ויש לו – עם have ועם has",
    vocab: [["have", "יש ל־ (I, you, we, they)"], ["has", "יש ל־ (he, she, it)"], ["bike", "אופניים"], ["dog", "כלב"], ["brother", "אח"], ["ball", "כדור"]],
    slides: [
      {
        title: "איך אומרים **יש לי**?",
        lines: ["בעברית: יש לי כלב", "באנגלית אומרים have"],
        examples: [["I **have** a dog.", "יש לי כלב"]],
      },
      {
        title: "**have**",
        lines: ["עם I, you, we, they – have"],
        examples: [["We **have** a big house.", "יש לנו בית גדול"], ["They **have** two cats.", "יש להם שני חתולים"]],
      },
      {
        title: "**has**",
        lines: ["עם he, she, it – has"],
        examples: [["He **has** a bike.", "יש לו אופניים"], ["The dog **has** a ball.", "לכלב יש כדור"]],
      },
      {
        title: "שימו **לב**",
        lines: ["עם he אומרים has"],
        compare: ["He have a bike.", "He **has** a bike."],
      },
      {
        title: "**לסיכום**",
        table: [["I, you, we, they", "**have**"], ["he, she, it", "**has**"]],
      },
    ],
    quiz: [
      ["I ___ a cat.", "יש לי חתול", ["have", "has"], 0, "עם I אומרים have"],
      ["Tom ___ a red bike.", "לטום יש אופניים אדומים", ["have", "has"], 1, "טום זה he ולכן has"],
      ["We ___ a big garden.", "יש לנו גינה גדולה", ["have", "has"], 0, "עם we אומרים have"],
    ],
    discuss: ["ספרו מה יש לכם במשפט עם I have", "ספרו מה יש לחבר במשפט עם He has"],
  },
  {
    id: "have-has-2",
    topic: "have-has",
    name: "יש לי, יש לו",
    part: "לא ושאלות",
    summary: "אומרים אין לי ושואלים יש לך – עם don't ועם Do",
    vocab: [["don't have", "אין לי / אין לנו"], ["doesn't have", "אין לו"], ["Do you have", "יש לך?"], ["Does he have", "יש לו?"], ["pet", "חיית מחמד"]],
    slides: [
      {
        title: "**אין** לי",
        lines: ["אין לי? אומרים don't have"],
        examples: [["I **don't have** a pet.", "אין לי חיית מחמד"], ["They **don't have** a car.", "אין להם מכונית"]],
      },
      {
        title: "**אין** לו",
        lines: ["עם he, she, it – doesn't have"],
        examples: [["He **doesn't have** a bike.", "אין לו אופניים"]],
      },
      {
        title: "שימו **לב**",
        lines: ["אחרי doesn't – תמיד have"],
        compare: ["He doesn't has a bike.", "He doesn't **have** a bike."],
      },
      {
        title: "**יש** לך?",
        lines: ["שואלים עם Do בהתחלה"],
        examples: [["**Do** you have a pet?", "יש לך חיית מחמד?"], ["Yes, I **do**.", "כן"], ["No, I **don't**.", "לא"]],
      },
      {
        title: "**יש** לו?",
        lines: ["עם he, she, it – שואלים עם Does"],
        examples: [["**Does** he have a bike?", "יש לו אופניים?"], ["Yes, he **does**.", "כן"]],
      },
      {
        title: "**לסיכום**",
        table: [["יש לי", "I **have**"], ["אין לי", "I **don't have**"], ["יש לך?", "**Do** you have?"]],
      },
    ],
    quiz: [
      ["I ___ a phone.", "אין לי טלפון", ["don't have", "doesn't have"], 0, "עם I אומרים don't"],
      ["He ___ a dog.", "אין לו כלב", ["don't have", "doesn't have"], 1, "עם he אומרים doesn't"],
      ["___ you have a pen?", "יש לך עט?", ["Do", "Does", "Are"], 0, "עם you שואלים עם Do"],
    ],
    discuss: ["שאלו חבר: Do you have a pet", "ענו בתשובה קצרה – Yes, I do או No, I don't"],
  },
  {
    id: "there-is-1",
    topic: "there-is",
    name: "There is",
    part: "יש אחד, יש הרבה",
    summary: "אומרים יש – There is לדבר אחד ו־There are להרבה דברים",
    vocab: [["There is", "יש – דבר אחד"], ["There are", "יש – הרבה"], ["table", "שולחן"], ["garden", "גינה"], ["tree", "עץ"], ["room", "חדר"]],
    slides: [
      {
        title: "איך אומרים **יש**?",
        lines: ["מספרים מה נמצא במקום", "אומרים There is או There are"],
        examples: [["**There is** a cat in the garden.", "יש חתול בגינה"]],
      },
      {
        title: "**There is** – דבר אחד",
        lines: ["דבר אחד – There is"],
        examples: [["**There is** a book on the table.", "יש ספר על השולחן"], ["**There is** a tree in the yard.", "יש עץ בחצר"]],
      },
      {
        title: "**There are** – הרבה",
        lines: ["הרבה דברים – There are"],
        examples: [["**There are** two books on the table.", "יש שני ספרים על השולחן"], ["**There are** many kids here.", "יש פה הרבה ילדים"]],
      },
      {
        title: "**קיצור**",
        lines: ["את There is אפשר לקצר"],
        table: [["There is", "**There's**"]],
        examples: [["**There's** a dog here.", "יש פה כלב"]],
      },
      {
        title: "שימו **לב**",
        lines: ["הרבה דברים – are"],
        compare: ["There is three cats.", "There **are** three cats."],
      },
      {
        title: "**לסיכום**",
        table: [["דבר אחד", "There **is**"], ["הרבה", "There **are**"]],
      },
    ],
    quiz: [
      ["There ___ a bird in the tree.", "יש ציפור על העץ", ["is", "are"], 0, "ציפור אחת – is"],
      ["There ___ five boys in the room.", "יש חמישה בנים בחדר", ["is", "are"], 1, "הרבה – are"],
      ["There ___ an apple in my bag.", "יש תפוח בתיק שלי", ["is", "are"], 0, "תפוח אחד – is"],
    ],
    discuss: ["מה יש בכיתה שלנו? ענו עם There is", "מה יש בתיק שלכם? ענו עם There are"],
  },
  {
    id: "there-is-2",
    topic: "there-is",
    name: "There is",
    part: "אין, שאלות ו־How many",
    summary: "אומרים אין, שואלים אם יש, ושואלים כמה עם How many",
    vocab: [["There isn't", "אין – דבר אחד"], ["There aren't", "אין – הרבה"], ["Is there", "יש? – דבר אחד"], ["Are there", "יש? – הרבה"], ["How many", "כמה"]],
    slides: [
      {
        title: "**אין**",
        lines: ["אין? מוסיפים not ומקצרים"],
        table: [["There is not", "There **isn't**"], ["There are not", "There **aren't**"]],
        examples: [["There **isn't** a cat here.", "אין פה חתול"]],
      },
      {
        title: "יש? – **שאלה**",
        lines: ["בשאלה is קופץ להתחלה"],
        flow: true,
        examples: [["There **is** a park.", "יש פארק"], ["**Is** there a park?", "יש פארק?"]],
      },
      {
        title: "תשובה **קצרה**",
        lines: ["עונים קצר"],
        examples: [["**Are** there two beds?", "יש שתי מיטות?"], ["Yes, there **are**.", "כן, יש"], ["No, there **aren't**.", "לא, אין"]],
      },
      {
        title: "**How many** – כמה",
        lines: ["שואלים כמה עם How many"],
        examples: [["**How many** cats are there?", "כמה חתולים יש?"], ["There are three cats.", "יש שלושה חתולים"]],
      },
      {
        title: "שימו **לב**",
        lines: ["בשאלה is בא ראשון"],
        compare: ["There is a park?", "**Is** there a park?"],
      },
      {
        title: "**לסיכום**",
        table: [["יש", "There **is**"], ["אין", "There **isn't**"], ["יש?", "**Is** there?"], ["כמה?", "**How many**"]],
      },
    ],
    quiz: [
      ["There ___ a pool here.", "אין פה בריכה", ["isn't", "aren't"], 0, "דבר אחד – isn't"],
      ["___ there a shop near here?", "יש חנות קרוב לכאן?", ["Is", "Are"], 0, "חנות אחת – Is"],
      ["How ___ chairs are there?", "כמה כיסאות יש?", ["many", "much", "is"], 0, "כמה – How many"],
    ],
    discuss: ["שאלו חבר: Is there a park near your house", "כמה כיסאות יש בכיתה? ענו עם There are"],
  },
  {
    id: "prepositions-1",
    topic: "prepositions",
    name: "מילות יחס",
    part: "in, on, under",
    summary: "איפה זה נמצא? בתוך, על ומתחת – in, on, under",
    vocab: [["in", "בתוך"], ["on", "על"], ["under", "מתחת"], ["box", "קופסה"], ["table", "שולחן"], ["bed", "מיטה"], ["chair", "כיסא"]],
    slides: [
      {
        title: "איפה **זה**?",
        lines: ["מילים קטנות שאומרות איפה דבר נמצא"],
        examples: [["The ball is **in** the box.", "הכדור בתוך הקופסה"]],
      },
      {
        title: "**in** – בתוך",
        lines: ["in – בפנים"],
        examples: [["The cat is **in** the box.", "החתול בתוך הקופסה"], ["The pen is **in** my bag.", "העט בתוך התיק שלי"]],
      },
      {
        title: "**on** – על",
        lines: ["on – למעלה, נוגע בו"],
        examples: [["The book is **on** the table.", "הספר על השולחן"], ["The cup is **on** the chair.", "הכוס על הכיסא"]],
      },
      {
        title: "**under** – מתחת",
        lines: ["under – למטה, מתחת"],
        examples: [["The dog is **under** the bed.", "הכלב מתחת למיטה"], ["The ball is **under** the chair.", "הכדור מתחת לכיסא"]],
      },
      {
        title: "שימו **לב**",
        lines: ["משהו שמונח למעלה – on"],
        compare: ["The book is in the table.", "The book is **on** the table."],
      },
      {
        title: "**לסיכום**",
        table: [["בתוך", "**in**"], ["על", "**on**"], ["מתחת", "**under**"]],
      },
    ],
    quiz: [
      ["The fish is ___ the water.", "הדג בתוך המים", ["in", "on", "under"], 0, "בתוך – in"],
      ["The lamp is ___ the desk.", "המנורה על השולחן", ["in", "on", "under"], 1, "על – on"],
      ["The cat is ___ the table.", "החתול מתחת לשולחן", ["in", "on", "under"], 2, "מתחת – under"],
    ],
    discuss: ["איפה התיק שלכם עכשיו? ענו עם in, on או under", "שימו עיפרון במקום אחר ושאלו חבר: Where is the pencil"],
  },
  {
    id: "prepositions-2",
    topic: "prepositions",
    name: "מילות יחס",
    part: "next to, between, behind",
    summary: "עוד מילים של מקום – ליד, בין, מאחורי ולפני",
    vocab: [["next to", "ליד"], ["between", "בין"], ["behind", "מאחורי"], ["in front of", "לפני, מול"], ["at", "ב־ (מקום)"]],
    slides: [
      {
        title: "**next to** – ליד",
        lines: ["next to – ממש קרוב, בצד"],
        examples: [["The cat is **next to** the dog.", "החתול ליד הכלב"], ["I sit **next to** Ben.", "אני יושב ליד בן"]],
      },
      {
        title: "**between** – בין",
        lines: ["between – באמצע, בין שני דברים"],
        examples: [["The ball is **between** the boxes.", "הכדור בין הקופסאות"]],
      },
      {
        title: "**behind** – מאחורי",
        lines: ["behind – מאחור"],
        examples: [["The dog is **behind** the tree.", "הכלב מאחורי העץ"]],
      },
      {
        title: "**in front of** – לפני",
        lines: ["in front of – מקדימה"],
        examples: [["The car is **in front of** the house.", "המכונית לפני הבית"]],
      },
      {
        title: "**at** – ב־",
        lines: ["at – במקום מסוים"],
        examples: [["I am **at** school.", "אני בבית הספר"], ["He is **at** home.", "הוא בבית"]],
      },
      {
        title: "**לסיכום**",
        table: [["ליד", "**next to**"], ["בין", "**between**"], ["מאחורי", "**behind**"], ["לפני", "**in front of**"]],
      },
    ],
    quiz: [
      ["The bag is ___ the chair.", "התיק ליד הכיסא", ["next to", "under", "behind"], 0, "ליד – next to"],
      ["I sit ___ Tom and Ben.", "אני יושב בין טום לבן", ["behind", "between", "on"], 1, "בין שניים – between"],
      ["We are ___ school now.", "אנחנו בבית הספר עכשיו", ["at", "on", "under"], 0, "במקום – at"],
    ],
    discuss: ["ליד מי אתם יושבים בכיתה? ענו עם next to", "מה יש מאחוריכם עכשיו? ענו עם behind"],
  },

  /* ---------- Stage 5: what I do ---------- */
  {
    id: "verbs-1",
    topic: "verbs",
    name: "פעלים",
    part: "מה עושים?",
    summary: "פועל אומר מה עושים – ובכל משפט יש פועל.",
    vocab: [["play", "לשחק"], ["eat", "לאכול"], ["read", "לקרוא"], ["run", "לרוץ"], ["drink", "לשתות"], ["sleep", "לישון"], ["go", "ללכת"]],
    slides: [
      {
        title: "מה זה **פועל**?",
        lines: ["פועל – מילה שאומרת מה עושים"],
        table: [["play", "לשחק"], ["eat", "לאכול"], ["read", "לקרוא"], ["run", "לרוץ"]],
      },
      {
        title: "**מי** ואז **מה עושה**",
        lines: ["קודם מי – ואז מה הוא עושה"],
        examples: [["I **play** football.", "אני משחק כדורגל"], ["We **eat** lunch.", "אנחנו אוכלים ארוחת צהריים"]],
      },
      {
        title: "מוצאים את **הפועל**",
        lines: ["בכל משפט יש מילה של פעולה"],
        examples: [["They **read** books.", "הם קוראים ספרים"], ["You **drink** water.", "אתה שותה מים"]],
      },
      {
        title: "**כל יום**",
        lines: ["משהו שעושים כל יום", "הפועל נשאר כמו שהוא"],
        examples: [["I **go** to school every day.", "אני הולך לבית הספר כל יום"], ["We **sleep** at night.", "אנחנו ישנים בלילה"]],
      },
      {
        title: "שימו **לב**",
        lines: ["אסור לשכוח את הפועל"],
        compare: ["I football.", "I **play** football."],
      },
      {
        title: "**לסיכום**",
        lines: ["מי – ואז מה עושה"],
        table: [["אני משחק", "I **play**"], ["אנחנו אוכלים", "We **eat**"], ["הם קוראים", "They **read**"]],
      },
    ],
    quiz: [
      ["I ___ water.", "אני שותה מים", ["drink", "eat", "sleep"], 0, "לשתות – drink"],
      ["We ___ football.", "אנחנו משחקים כדורגל", ["read", "play", "go"], 1, "לשחק – play"],
      ["They ___ books.", "הם קוראים ספרים", ["read", "run", "eat"], 0, "לקרוא – read"],
    ],
    discuss: ["מה אתם עושים כל יום? ענו במשפט שמתחיל ב־I", "מה אתם אוהבים לשחק? ענו עם I play"],
  },
  {
    id: "verbs-2",
    topic: "verbs",
    name: "פעלים",
    part: "he plays",
    summary: "עם he, she, it מוסיפים s לפועל – כמו he plays",
    vocab: [["plays", "משחק (הוא)"], ["eats", "אוכל (הוא)"], ["goes", "הולך (הוא)"], ["watches", "צופה (הוא)"], ["has", "יש לו"], ["runs", "רץ (הוא)"]],
    slides: [
      {
        title: "מוסיפים **s**",
        lines: ["עם he, she, it – מוסיפים s לפועל"],
        flow: true,
        examples: [["I **play**.", "אני משחק"], ["He play**s**.", "הוא משחק"]],
      },
      {
        title: "עוד **דוגמאות**",
        lines: ["גם שם של ילד או של חיה – כמו he"],
        examples: [["Tom eat**s** pizza.", "טום אוכל פיצה"], ["The dog run**s**.", "הכלב רץ"]],
      },
      {
        title: "מוסיפים **es**",
        lines: ["פועל שנגמר ב־o, s, x, sh, ch", "מקבל es"],
        table: [["go", "go**es**"], ["watch", "watch**es**"], ["wash", "wash**es**"]],
      },
      {
        title: "פעלים **מיוחדים**",
        lines: ["have הופך ל־has", "y אחרי עיצור הופכת ל־ies"],
        table: [["have", "**has**"], ["fly", "fl**ies**"]],
      },
      {
        title: "שימו **לב**",
        lines: ["עם he לא שוכחים את ה־s"],
        compare: ["He play football.", "He play**s** football."],
      },
      {
        title: "**לסיכום**",
        table: [["I, you, we, they", "**play**"], ["he, she, it", "play**s**"]],
      },
    ],
    quiz: [
      ["He ___ football.", "הוא משחק כדורגל", ["play", "plays"], 1, "עם he מוסיפים s"],
      ["We ___ TV.", "אנחנו צופים בטלוויזיה", ["watch", "watches"], 0, "עם we – בלי s"],
      ["Ben ___ to school.", "בן הולך לבית הספר", ["go", "gos", "goes"], 2, "go נגמר ב־o ולכן goes"],
    ],
    discuss: ["מה חבר שלכם עושה אחרי בית הספר? ענו במשפט שמתחיל ב־He", "מה הכלב או החתול עושה? ענו במשפט שמתחיל ב־It"],
  },
  {
    id: "negation-1",
    topic: "negation",
    name: "שלילה ושאלות",
    part: "don't / doesn't",
    summary: "אומרים לא עם don't ועם doesn't לפני הפועל",
    vocab: [["don't", "לא – עם I, you, we, they"], ["doesn't", "לא – עם he, she, it"], ["like", "לאהוב"], ["eat", "לאכול"], ["swim", "לשחות"], ["play", "לשחק"]],
    slides: [
      {
        title: "איך אומרים **לא**?",
        lines: ["לפני הפועל מוסיפים don't"],
        flow: true,
        examples: [["I **like** fish.", "אני אוהב דגים"], ["I **don't** like fish.", "אני לא אוהב דגים"]],
      },
      {
        title: "**don't**",
        lines: ["עם I, you, we, they – don't"],
        examples: [["We **don't** play here.", "אנחנו לא משחקים פה"], ["They **don't** eat meat.", "הם לא אוכלים בשר"]],
      },
      {
        title: "**doesn't**",
        lines: ["עם he, she, it – doesn't"],
        examples: [["He **doesn't** swim.", "הוא לא שוחה"], ["The cat **doesn't** eat bread.", "החתול לא אוכל לחם"]],
      },
      {
        title: "שימו **לב**",
        lines: ["אחרי doesn't – הפועל בלי s"],
        compare: ["He doesn't plays.", "He doesn't **play**."],
      },
      {
        title: "**not** / **don't**",
        lines: ["עם am, is, are – not", "עם פועל – don't"],
        examples: [["I am **not** tired.", "אני לא עייף"], ["I **don't** run.", "אני לא רץ"]],
      },
      {
        title: "**לסיכום**",
        table: [["I, you, we, they", "**don't**"], ["he, she, it", "**doesn't**"]],
      },
    ],
    quiz: [
      ["I ___ like milk.", "אני לא אוהב חלב", ["don't", "doesn't"], 0, "עם I – don't"],
      ["Tom ___ play the piano.", "טום לא מנגן בפסנתר", ["don't", "doesn't"], 1, "טום זה he ולכן doesn't"],
      ["He doesn't ___ TV.", "הוא לא צופה בטלוויזיה", ["watch", "watches"], 0, "אחרי doesn't – בלי s"],
    ],
    discuss: ["ספרו משהו שאתם לא אוהבים – עם I don't like", "ספרו משהו שחבר לא עושה – עם He doesn't"],
  },
  {
    id: "negation-2",
    topic: "negation",
    name: "שלילה ושאלות",
    part: "Do / Does – שאלות",
    summary: "שואלים עם Do ועם Does ועונים בקצרה",
    vocab: [["Do", "שואלים עם I, you, we, they"], ["Does", "שואלים עם he, she, it"], ["Yes, I do", "כן"], ["No, I don't", "לא"], ["like", "לאהוב"], ["live", "לגור"]],
    slides: [
      {
        title: "איך **שואלים**?",
        lines: ["משפט עם פועל – מוסיפים Do בהתחלה"],
        flow: true,
        examples: [["You **like** pizza.", "אתה אוהב פיצה"], ["**Do** you like pizza?", "אתה אוהב פיצה?"]],
      },
      {
        title: "**Do**",
        lines: ["עם I, you, we, they – Do"],
        examples: [["**Do** they play football?", "הם משחקים כדורגל?"], ["**Do** you live here?", "אתה גר כאן?"]],
      },
      {
        title: "**Does**",
        lines: ["עם he, she, it – Does"],
        examples: [["**Does** he like dogs?", "הוא אוהב כלבים?"], ["**Does** the bus stop here?", "האוטובוס עוצר כאן?"]],
      },
      {
        title: "שימו **לב**",
        lines: ["אחרי Does – הפועל בלי s"],
        compare: ["Does he likes dogs?", "Does he **like** dogs?"],
      },
      {
        title: "תשובה **קצרה**",
        lines: ["עונים עם do או עם does"],
        examples: [["Yes, I **do**.", "כן"], ["No, he **doesn't**.", "לא"]],
      },
      {
        title: "**לסיכום**",
        table: [["I, you, we, they", "**Do** you like it?"], ["he, she, it", "**Does** he like it?"]],
      },
    ],
    quiz: [
      ["___ you like apples?", "אתה אוהב תפוחים?", ["Do", "Does"], 0, "עם you – Do"],
      ["___ he play football?", "הוא משחק כדורגל?", ["Do", "Does"], 1, "עם he – Does"],
      ["Do you swim? Yes, I ___.", "אתה שוחה? כן", ["do", "does", "am"], 0, "על Do עונים עם do"],
    ],
    discuss: ["שאלו חבר: Do you like pizza", "ענו בתשובה קצרה – Yes, I do או No, I don't"],
  },
  {
    id: "questions-1",
    topic: "questions",
    name: "מילות שאלה",
    part: "What, Who, Where",
    summary: "שואלים מה, מי ואיפה – What, Who, Where",
    vocab: [["What", "מה"], ["Who", "מי"], ["Where", "איפה"], ["name", "שם"], ["live", "לגור"], ["teacher", "מורה"]],
    slides: [
      {
        title: "מילות **שאלה**",
        lines: ["המילה בתחילת השאלה אומרת מה רוצים לדעת"],
        table: [["מה", "**What**"], ["מי", "**Who**"], ["איפה", "**Where**"]],
      },
      {
        title: "**What** – מה",
        lines: ["What – שואלים על דבר"],
        examples: [["**What** is your name?", "מה השם שלך?"], ["**What** is this?", "מה זה?"]],
      },
      {
        title: "**Who** – מי",
        lines: ["Who – שואלים על אדם"],
        examples: [["**Who** is he?", "מי הוא?"], ["**Who** is your teacher?", "מי המורה שלך?"]],
      },
      {
        title: "**Where** – איפה",
        lines: ["Where – שואלים על מקום"],
        examples: [["**Where** is my bag?", "איפה התיק שלי?"], ["**Where** do you live?", "איפה אתה גר?"]],
      },
      {
        title: "שאלה **ותשובה**",
        lines: ["עונים בדיוק על מה ששאלו"],
        examples: [["**Where** is Tom?", "איפה טום?"], ["He is at home.", "הוא בבית"]],
      },
      {
        title: "שימו **לב**",
        lines: ["רוצים לדעת איפה? שואלים עם Where"],
        compare: ["What is my pen?", "**Where** is my pen?"],
      },
    ],
    quiz: [
      ["___ is your name?", "מה השם שלך?", ["What", "Who", "Where"], 0, "מה – What"],
      ["___ is that boy?", "מי הילד ההוא?", ["What", "Who", "Where"], 1, "מי – Who"],
      ["___ is the park?", "איפה הפארק?", ["What", "Who", "Where"], 2, "איפה – Where"],
    ],
    discuss: ["שאלו חבר: What is your name", "שאלו חבר: Where do you live"],
  },
  {
    id: "questions-2",
    topic: "questions",
    name: "מילות שאלה",
    part: "When, Why, How",
    summary: "שואלים מתי, למה, איך וכמה – When, Why, How",
    vocab: [["When", "מתי"], ["Why", "למה"], ["How", "איך"], ["How many", "כמה"], ["How old", "בן כמה"], ["because", "כי"]],
    slides: [
      {
        title: "**When** – מתי",
        lines: ["When – שואלים על זמן"],
        examples: [["**When** is your birthday?", "מתי יום ההולדת שלך?"], ["It is in May.", "הוא במאי"]],
      },
      {
        title: "**Why** – למה",
        lines: ["Why – שואלים על סיבה", "עונים עם because – כי"],
        examples: [["**Why** are you happy?", "למה אתה שמח?"], ["**Because** it is my birthday.", "כי זה יום ההולדת שלי"]],
      },
      {
        title: "**How** – איך",
        lines: ["How – שואלים איך"],
        examples: [["**How** are you?", "מה שלומך?"], ["**How** do you go to school?", "איך אתה מגיע לבית הספר?"]],
      },
      {
        title: "**How many** – כמה",
        lines: ["How many – שואלים כמה"],
        examples: [["**How many** cats do you have?", "כמה חתולים יש לך?"]],
      },
      {
        title: "**How old** – בן כמה",
        lines: ["שואלים על גיל"],
        examples: [["**How old** are you?", "בן כמה אתה?"], ["I am ten.", "אני בן עשר"]],
      },
      {
        title: "**לסיכום**",
        table: [["מתי", "**When**"], ["למה", "**Why**"], ["איך", "**How**"], ["כמה", "**How many**"]],
      },
    ],
    quiz: [
      ["___ is the party?", "מתי המסיבה?", ["When", "Why", "How"], 0, "מתי – When"],
      ["___ are you sad?", "למה אתה עצוב?", ["When", "Why", "Where"], 1, "למה – Why"],
      ["___ many pens do you have?", "כמה עטים יש לך?", ["What", "How", "Who"], 1, "כמה – How many"],
    ],
    discuss: ["שאלו חבר: How old are you", "שאלו חבר: When is your birthday"],
  },
  {
    id: "frequency",
    topic: "frequency",
    name: "תדירות",
    summary: "כמה פעמים עושים משהו – always, sometimes, never ועוד",
    vocab: [["always", "תמיד"], ["usually", "בדרך כלל"], ["often", "הרבה פעמים"], ["sometimes", "לפעמים"], ["never", "אף פעם"], ["How often", "כל כמה זמן"]],
    slides: [
      {
        title: "כמה **פעמים**?",
        lines: ["מילים שאומרות כמה פעמים עושים משהו"],
        table: [["תמיד", "**always**"], ["בדרך כלל", "**usually**"], ["לפעמים", "**sometimes**"], ["אף פעם", "**never**"]],
      },
      {
        title: "**always** / **never**",
        lines: ["always – כל פעם", "never – אף פעם"],
        examples: [["I **always** eat breakfast.", "אני תמיד אוכל ארוחת בוקר"], ["I **never** drink coffee.", "אני אף פעם לא שותה קפה"]],
      },
      {
        title: "**usually** / **sometimes**",
        lines: ["usually – בדרך כלל", "sometimes – לפעמים"],
        examples: [["We **usually** walk to school.", "אנחנו בדרך כלל הולכים לבית הספר ברגל"], ["He **sometimes** plays chess.", "הוא לפעמים משחק שחמט"]],
      },
      {
        title: "איפה **במשפט**?",
        lines: ["לפני הפועל", "אבל אחרי am, is, are"],
        examples: [["I **often** read books.", "אני קורא ספרים הרבה פעמים"], ["He is **always** happy.", "הוא תמיד שמח"]],
      },
      {
        title: "שימו **לב**",
        lines: ["never כבר אומרת לא"],
        compare: ["I don't never eat meat.", "I **never** eat meat."],
      },
      {
        title: "**How often**",
        lines: ["שואלים כל כמה זמן"],
        examples: [["**How often** do you swim?", "כל כמה זמן אתה שוחה?"], ["I swim **every day**.", "אני שוחה כל יום"]],
      },
    ],
    quiz: [
      ["I ___ brush my teeth.", "אני תמיד מצחצח שיניים", ["always", "never"], 0, "תמיד – always"],
      ["He is ___ late.", "הוא אף פעם לא מאחר", ["never", "sometimes"], 0, "אף פעם – never"],
      ["We ___ go to the park.", "אנחנו לפעמים הולכים לפארק", ["always", "sometimes", "never"], 1, "לפעמים – sometimes"],
    ],
    discuss: ["מה אתם עושים תמיד? ענו עם always", "שאלו חבר: How often do you read"],
  },
  {
    id: "calendar-1",
    topic: "calendar",
    name: "ימים, חודשים ועונות",
    part: "ימי השבוע",
    summary: "לומדים את שבעת ימי השבוע ואיך אומרים ביום מסוים.",
    vocab: [["Sunday", "ראשון"], ["Monday", "שני"], ["Tuesday", "שלישי"], ["Wednesday", "רביעי"], ["Thursday", "חמישי"], ["Friday", "שישי"], ["Saturday", "שבת"]],
    slides: [
      {
        title: "ימי **השבוע**",
        lines: ["לכל יום יש שם באנגלית", "תמיד באות גדולה"],
        examples: [["Today is **Sunday**.", "היום יום ראשון"]],
      },
      {
        title: "ראשון עד **רביעי**",
        table: [["ראשון", "**Sunday**"], ["שני", "**Monday**"], ["שלישי", "**Tuesday**"], ["רביעי", "**Wednesday**"]],
      },
      {
        title: "חמישי עד **שבת**",
        table: [["חמישי", "**Thursday**"], ["שישי", "**Friday**"], ["שבת", "**Saturday**"]],
      },
      {
        title: "**on** – ביום",
        lines: ["ביום מסוים – on"],
        examples: [["I play football **on** Monday.", "אני משחק כדורגל ביום שני"], ["We rest **on** Saturday.", "אנחנו נחים בשבת"]],
      },
      {
        title: "מה **היום**?",
        lines: ["שואלים ועונים"],
        examples: [["What day is it today?", "איזה יום היום?"], ["It is **Tuesday**.", "היום יום שלישי"]],
      },
      {
        title: "שימו **לב**",
        lines: ["ימים תמיד באות גדולה"],
        compare: ["sunday", "**S**unday"],
      },
    ],
    quiz: [
      ["Today is ___.", "היום יום שני", ["Sunday", "Monday", "Friday"], 1, "שני – Monday"],
      ["I go to the park ___ Friday.", "אני הולך לפארק ביום שישי", ["in", "on", "at"], 1, "ביום – on"],
      ["The day after Sunday is ___.", "היום שאחרי ראשון", ["Monday", "Saturday", "Thursday"], 0, "אחרי ראשון בא שני – Monday"],
    ],
    discuss: ["איזה יום היום? ענו עם Today is", "איזה יום בשבוע אתם הכי אוהבים? למה?"],
  },
  {
    id: "calendar-2",
    topic: "calendar",
    name: "ימים, חודשים ועונות",
    part: "חודשים ועונות",
    summary: "שנים עשר החודשים, ארבע העונות, ומתי אומרים in",
    vocab: [["January", "ינואר"], ["May", "מאי"], ["July", "יולי"], ["winter", "חורף"], ["spring", "אביב"], ["summer", "קיץ"], ["autumn", "סתיו"]],
    slides: [
      {
        title: "**החודשים** 1",
        table: [["ינואר", "January"], ["פברואר", "February"], ["מרץ", "March"], ["אפריל", "April"], ["מאי", "May"], ["יוני", "June"]],
      },
      {
        title: "**החודשים** 2",
        table: [["יולי", "July"], ["אוגוסט", "August"], ["ספטמבר", "September"], ["אוקטובר", "October"], ["נובמבר", "November"], ["דצמבר", "December"]],
      },
      {
        title: "**העונות**",
        table: [["חורף", "**winter**"], ["אביב", "**spring**"], ["קיץ", "**summer**"], ["סתיו", "**autumn**"]],
      },
      {
        title: "**in** – בחודש ובעונה",
        lines: ["בחודש או בעונה – in"],
        examples: [["My birthday is **in** May.", "יום ההולדת שלי במאי"], ["It is hot **in** summer.", "חם בקיץ"]],
      },
      {
        title: "**on** / **in**",
        lines: ["ביום – on", "בחודש ובעונה – in"],
        examples: [["**on** Monday", "ביום שני"], ["**in** July", "ביולי"]],
      },
      {
        title: "שימו **לב**",
        lines: ["חודשים באות גדולה", "עונות באות קטנה"],
        compare: ["in january", "in **J**anuary"],
      },
    ],
    quiz: [
      ["My birthday is ___ June.", "יום ההולדת שלי ביוני", ["on", "in"], 1, "בחודש – in"],
      ["It is cold in ___.", "קר בחורף", ["summer", "winter"], 1, "חורף – winter"],
      ["We have a test ___ Sunday.", "יש לנו מבחן ביום ראשון", ["on", "in"], 0, "ביום – on"],
    ],
    discuss: ["מתי יום ההולדת שלכם? ענו עם My birthday is in", "איזו עונה אתם הכי אוהבים? למה?"],
  },
  {
    id: "telling-time",
    topic: "telling-time",
    name: "מה השעה?",
    summary: "אומרים את השעה – בדיוק, וחצי, ורבע ורבע ל",
    vocab: [["o'clock", "בדיוק"], ["half past", "וחצי"], ["quarter past", "ורבע"], ["quarter to", "רבע ל־"], ["What time is it", "מה השעה"], ["at", "בשעה"]],
    slides: [
      {
        title: "מה **השעה**?",
        lines: ["שואלים ועונים"],
        examples: [["What time is it?", "מה השעה?"], ["It is three **o'clock**.", "השעה שלוש"]],
      },
      {
        title: "**o'clock** – בדיוק",
        lines: ["שעה עגולה – o'clock"],
        examples: [["It is five **o'clock**.", "השעה חמש בדיוק"], ["It is ten **o'clock**.", "השעה עשר בדיוק"]],
      },
      {
        title: "**half past** – וחצי",
        lines: ["חצי שעה אחרי – half past"],
        examples: [["It is **half past** four.", "השעה ארבע וחצי"]],
      },
      {
        title: "**quarter past** – ורבע",
        lines: ["רבע שעה אחרי – quarter past"],
        examples: [["It is **quarter past** two.", "השעה שתיים ורבע"]],
      },
      {
        title: "**quarter to** – רבע ל",
        lines: ["רבע שעה לפני – quarter to"],
        examples: [["It is **quarter to** six.", "השעה רבע לשש"]],
      },
      {
        title: "**at** – בשעה",
        lines: ["בשעה מסוימת – at"],
        examples: [["School starts **at** eight.", "בית הספר מתחיל בשמונה"]],
      },
      {
        title: "**לסיכום**",
        table: [["בדיוק", "**o'clock**"], ["ורבע", "**quarter past**"], ["וחצי", "**half past**"], ["רבע ל", "**quarter to**"]],
      },
    ],
    quiz: [
      ["It is seven ___.", "השעה שבע בדיוק", ["o'clock", "half", "past"], 0, "בדיוק – o'clock"],
      ["It is ___ past one.", "השעה אחת וחצי", ["half", "quarter"], 0, "וחצי – half past"],
      ["I go to bed ___ nine.", "אני הולך לישון בתשע", ["in", "on", "at"], 2, "בשעה – at"],
    ],
    discuss: ["מתי אתם קמים בבוקר? ענו עם I get up at", "מה השעה עכשיו? ענו עם It is"],
  },

  /* ---------- Stage 6: now, yesterday and tomorrow ---------- */
  {
    id: "progressive-1",
    topic: "progressive",
    name: "הווה מתמשך",
    part: "מה קורה עכשיו?",
    summary: "משהו שקורה עכשיו – am, is, are ועוד פועל עם ing",
    vocab: [["playing", "משחק עכשיו"], ["eating", "אוכל עכשיו"], ["reading", "קורא עכשיו"], ["running", "רץ עכשיו"], ["swimming", "שוחה עכשיו"], ["now", "עכשיו"]],
    slides: [
      {
        title: "מה קורה **עכשיו**?",
        lines: ["משהו שקורה ממש עכשיו", "am, is, are ועוד פועל עם ing"],
        examples: [["I **am** read**ing**.", "אני קורא עכשיו"]],
      },
      {
        title: "**am** / **is** / **are** + **ing**",
        table: [["I", "**am** play**ing**"], ["he, she, it", "**is** play**ing**"], ["you, we, they", "**are** play**ing**"]],
      },
      {
        title: "**דוגמאות**",
        lines: ["מה הם עושים עכשיו?"],
        examples: [["He **is** eat**ing** an apple.", "הוא אוכל תפוח"], ["They **are** play**ing** football.", "הם משחקים כדורגל"]],
      },
      {
        title: "איך **כותבים**?",
        lines: ["e בסוף – מורידים אותה", "עיצור אחרי תנועה קצרה – מכפילים"],
        table: [["make", "mak**ing**"], ["run", "run**ning**"], ["swim", "swim**ming**"]],
      },
      {
        title: "שימו **לב**",
        lines: ["אסור לשכוח am, is, are"],
        compare: ["He playing.", "He **is** playing."],
      },
      {
        title: "**לסיכום**",
        lines: ["עכשיו – am, is, are ועוד ing"],
        examples: [["We **are** watch**ing** TV now.", "אנחנו צופים בטלוויזיה עכשיו"]],
      },
    ],
    quiz: [
      ["I ___ reading now.", "אני קורא עכשיו", ["am", "is", "are"], 0, "עם I – am"],
      ["They are ___.", "הם שוחים עכשיו", ["swim", "swiming", "swimming"], 2, "ב־swim מכפילים את m"],
      ["He is ___ a cake.", "הוא מכין עוגה עכשיו", ["makeing", "making"], 1, "מורידים את e – making"],
    ],
    discuss: ["מה אתם עושים עכשיו? ענו עם I am", "מה החבר שיושב לידכם עושה עכשיו? ענו עם He is"],
  },
  {
    id: "progressive-2",
    topic: "progressive",
    name: "הווה מתמשך",
    part: "לא, שאלות, עכשיו או כל יום",
    summary: "אומרים לא, שואלים, ומבדילים בין עכשיו לבין כל יום",
    vocab: [["isn't playing", "לא משחק עכשיו"], ["Are you", "האם אתה"], ["now", "עכשיו"], ["every day", "כל יום"], ["at the moment", "ברגע זה"]],
    slides: [
      {
        title: "**לא** – not",
        lines: ["מוסיפים not אחרי am, is, are"],
        examples: [["I am **not** sleeping.", "אני לא ישן"], ["He **isn't** running.", "הוא לא רץ"]],
      },
      {
        title: "**שאלה**",
        lines: ["am, is, are קופצים להתחלה"],
        flow: true,
        examples: [["You **are** playing.", "אתה משחק"], ["**Are** you playing?", "אתה משחק?"]],
      },
      {
        title: "תשובה **קצרה**",
        examples: [["**Is** he eating?", "הוא אוכל עכשיו?"], ["Yes, he **is**.", "כן"], ["No, he **isn't**.", "לא"]],
      },
      {
        title: "**עכשיו** או **כל יום**?",
        lines: ["עכשיו – am, is, are ועוד ing", "כל יום – פועל רגיל"],
        examples: [["I **am playing** now.", "אני משחק עכשיו"], ["I **play** every day.", "אני משחק כל יום"]],
      },
      {
        title: "מילים **שעוזרות**",
        table: [["עכשיו", "**now**"], ["ברגע זה", "**at the moment**"], ["כל יום", "**every day**"], ["בדרך כלל", "**usually**"]],
      },
      {
        title: "שימו **לב**",
        lines: ["עם now – משתמשים ב־ing"],
        compare: ["I play now.", "I **am playing** now."],
      },
    ],
    quiz: [
      ["He ___ sleeping now.", "הוא לא ישן עכשיו", ["isn't", "aren't"], 0, "עם he – isn't"],
      ["___ they eating?", "הם אוכלים עכשיו?", ["Is", "Are", "Do"], 1, "עם they – Are"],
      ["I ___ football every day.", "אני משחק כדורגל כל יום", ["play", "am playing"], 0, "כל יום – פועל רגיל"],
    ],
    discuss: ["שאלו חבר: Are you reading now", "מה אתם עושים כל יום? ומה אתם עושים עכשיו?"],
  },
  {
    id: "tenses-1",
    topic: "tenses",
    name: "זמנים",
    part: "was / were",
    summary: "בעבר am ו־is הופכים ל־was – ו־are הופך ל־were",
    vocab: [["was", "היה – עם I, he, she, it"], ["were", "היו – עם you, we, they"], ["wasn't", "לא היה"], ["weren't", "לא היו"], ["yesterday", "אתמול"]],
    slides: [
      {
        title: "**עבר** של להיות",
        lines: ["מדברים על אתמול – was ו־were"],
        examples: [["I **was** at home yesterday.", "הייתי בבית אתמול"]],
      },
      {
        title: "**was**",
        lines: ["עם I, he, she, it – was"],
        examples: [["He **was** happy.", "הוא היה שמח"], ["It **was** cold.", "היה קר"]],
      },
      {
        title: "**were**",
        lines: ["עם you, we, they – were"],
        examples: [["We **were** at school.", "היינו בבית הספר"], ["They **were** tired.", "הם היו עייפים"]],
      },
      {
        title: "**לא** היה",
        lines: ["מוסיפים not ומקצרים"],
        table: [["was not", "**wasn't**"], ["were not", "**weren't**"]],
        examples: [["I **wasn't** late.", "לא איחרתי"]],
      },
      {
        title: "**שאלה** בעבר",
        lines: ["was ו־were קופצים להתחלה"],
        examples: [["**Was** he sick?", "הוא היה חולה?"], ["**Were** you at home?", "היית בבית?"]],
      },
      {
        title: "שימו **לב**",
        lines: ["עם they – were"],
        compare: ["They was at home.", "They **were** at home."],
      },
      {
        title: "**לסיכום**",
        table: [["am, is", "**was**"], ["are", "**were**"]],
      },
    ],
    quiz: [
      ["I ___ at the park yesterday.", "הייתי בפארק אתמול", ["was", "were"], 0, "עם I – was"],
      ["We ___ happy.", "היינו שמחים", ["was", "were"], 1, "עם we – were"],
      ["___ you at school yesterday?", "היית בבית הספר אתמול?", ["Was", "Were"], 1, "עם you – Were"],
    ],
    discuss: ["איפה הייתם אתמול? ענו עם I was", "איך היה מזג האוויר אתמול? ענו עם It was"],
  },
  {
    id: "tenses-2",
    topic: "tenses",
    name: "זמנים",
    part: "עבר עם ed",
    summary: "מספרים מה עשינו אתמול – מוסיפים ed לפועל",
    vocab: [["played", "שיחק"], ["walked", "הלך"], ["watched", "צפה"], ["liked", "אהב"], ["yesterday", "אתמול"], ["last week", "בשבוע שעבר"]],
    slides: [
      {
        title: "מה **עשינו** אתמול?",
        lines: ["משהו שכבר קרה – מוסיפים ed"],
        flow: true,
        examples: [["I **play** every day.", "אני משחק כל יום"], ["I play**ed** yesterday.", "שיחקתי אתמול"]],
      },
      {
        title: "מוסיפים **ed**",
        table: [["play", "play**ed**"], ["walk", "walk**ed**"], ["watch", "watch**ed**"]],
      },
      {
        title: "**אותה** מילה לכולם",
        lines: ["בעבר אין s – כולם אותו דבר"],
        examples: [["He watch**ed** TV.", "הוא צפה בטלוויזיה"], ["We walk**ed** home.", "הלכנו הביתה"]],
      },
      {
        title: "איך **כותבים**?",
        lines: ["e בסוף – מוסיפים רק d", "y אחרי עיצור – ied"],
        table: [["like", "like**d**"], ["study", "stud**ied**"]],
      },
      {
        title: "מילים **שעוזרות**",
        table: [["אתמול", "**yesterday**"], ["בשבוע שעבר", "**last week**"], ["לפני יומיים", "**two days ago**"]],
      },
      {
        title: "שימו **לב**",
        lines: ["אתמול – הפועל עם ed"],
        compare: ["I play yesterday.", "I play**ed** yesterday."],
      },
    ],
    quiz: [
      ["I ___ football yesterday.", "שיחקתי כדורגל אתמול", ["play", "played"], 1, "אתמול – מוסיפים ed"],
      ["He ___ TV last night.", "הוא צפה בטלוויזיה אתמול בלילה", ["watched", "watches"], 0, "בעבר – watched"],
      ["We ___ the movie.", "אהבנו את הסרט", ["liked", "likeed"], 0, "e בסוף – מוסיפים רק d"],
    ],
    discuss: ["מה עשיתם אתמול? ענו עם פועל שנגמר ב־ed", "ספרו משהו שעשיתם בשבוע שעבר"],
  },
  {
    id: "tenses-3",
    topic: "tenses",
    name: "זמנים",
    part: "didn't / Did",
    summary: "אומרים לא בעבר עם didn't ושואלים עם Did",
    vocab: [["didn't", "לא – בעבר"], ["Did", "שואלים בעבר"], ["Yes, I did", "כן"], ["No, I didn't", "לא"], ["homework", "שיעורי בית"]],
    slides: [
      {
        title: "**לא** בעבר",
        lines: ["בעבר אומרים לא עם didn't", "ואחריו הפועל הרגיל"],
        examples: [["I **didn't** play.", "לא שיחקתי"], ["He **didn't** watch TV.", "הוא לא צפה בטלוויזיה"]],
      },
      {
        title: "שימו **לב**",
        lines: ["אחרי didn't – בלי ed"],
        compare: ["I didn't played.", "I didn't **play**."],
      },
      {
        title: "**שאלה** בעבר",
        lines: ["שואלים עם Did בהתחלה"],
        examples: [["**Did** you play football?", "שיחקת כדורגל?"], ["**Did** he call you?", "הוא התקשר אליך?"]],
      },
      {
        title: "תשובה **קצרה**",
        lines: ["עונים עם did או עם didn't"],
        examples: [["Yes, I **did**.", "כן"], ["No, I **didn't**.", "לא"]],
      },
      {
        title: "**לסיכום**",
        table: [["שיחקתי", "I play**ed**"], ["לא שיחקתי", "I **didn't** play"], ["שיחקת?", "**Did** you play?"]],
      },
    ],
    quiz: [
      ["I ___ go to school yesterday.", "לא הלכתי לבית הספר אתמול", ["don't", "didn't"], 1, "אתמול – didn't"],
      ["___ you see the game?", "ראית את המשחק?", ["Do", "Did"], 1, "בעבר שואלים עם Did"],
      ["He didn't ___ his homework.", "הוא לא עשה את שיעורי הבית", ["do", "did"], 0, "אחרי didn't – הפועל הרגיל"],
    ],
    discuss: ["שאלו חבר: Did you play yesterday", "ספרו משהו שלא עשיתם אתמול – עם I didn't"],
  },
  {
    id: "tenses-4",
    topic: "tenses",
    name: "זמנים",
    part: "הווה, עבר ועתיד",
    summary: "מתי זה קורה? מבדילים בין כל יום, אתמול ומחר.",
    vocab: [["every day", "כל יום"], ["yesterday", "אתמול"], ["tomorrow", "מחר"], ["will", "עתיד – יקרה"], ["now", "עכשיו"]],
    slides: [
      {
        title: "מתי **זה קורה**?",
        table: [["כל יום", "I **play**"], ["אתמול", "I **played**"], ["מחר", "I **will play**"]],
      },
      {
        title: "**הווה** – כל יום",
        lines: ["דברים שקורים תמיד או כל יום"],
        examples: [["I **walk** to school every day.", "אני הולך לבית הספר כל יום"]],
      },
      {
        title: "**עבר** – אתמול",
        lines: ["דברים שכבר קרו"],
        examples: [["I **walked** to school yesterday.", "הלכתי לבית הספר אתמול"]],
      },
      {
        title: "**עתיד** – מחר",
        lines: ["will ועוד פועל – משהו שיקרה"],
        examples: [["I **will** walk to school tomorrow.", "אלך לבית הספר מחר"], ["It **will** rain.", "ירד גשם"]],
      },
      {
        title: "שימו **לב**",
        lines: ["אחרי will – הפועל הרגיל"],
        compare: ["I will played.", "I will **play**."],
      },
      {
        title: "מילים **שעוזרות**",
        table: [["הווה", "**every day**"], ["עבר", "**yesterday**"], ["עתיד", "**tomorrow**"]],
      },
    ],
    quiz: [
      ["Yesterday I ___ my room.", "אתמול ניקיתי את החדר", ["clean", "cleaned", "will clean"], 1, "אתמול – עבר"],
      ["Tomorrow we ___ a test.", "מחר יהיה לנו מבחן", ["had", "have", "will have"], 2, "מחר – will"],
      ["He ___ milk every day.", "הוא שותה חלב כל יום", ["drinks", "drank", "will drink"], 0, "כל יום – הווה"],
    ],
    discuss: ["ספרו משהו שעשיתם אתמול ומשהו שתעשו מחר", "מה אתם עושים כל יום אחרי בית הספר?"],
  },
  {
    id: "irregular-verbs-1",
    topic: "irregular-verbs",
    name: "פעלים חשובים",
    part: "went, ate, saw",
    summary: "פעלים שבעבר משתנים לגמרי – go, eat, see ועוד",
    vocab: [["went", "הלך"], ["ate", "אכל"], ["saw", "ראה"], ["had", "היה לו"], ["came", "בא"], ["took", "לקח"], ["made", "הכין"]],
    slides: [
      {
        title: "פעלים **מיוחדים**",
        lines: ["יש פעלים שבעבר לא מקבלים ed", "הם משתנים לגמרי"],
        flow: true,
        examples: [["I **go** to school.", "אני הולך לבית הספר"], ["I **went** to school.", "הלכתי לבית הספר"]],
      },
      {
        title: "**go** – **went**",
        lines: ["go – ללכת", "went – הלך"],
        examples: [["We **went** to the beach.", "הלכנו לים"], ["He **went** home.", "הוא הלך הביתה"]],
      },
      {
        title: "**eat** – **ate**",
        lines: ["eat – לאכול", "ate – אכל"],
        examples: [["I **ate** a sandwich.", "אכלתי כריך"]],
      },
      {
        title: "**see** – **saw**",
        lines: ["see – לראות", "saw – ראה"],
        examples: [["I **saw** a big dog.", "ראיתי כלב גדול"]],
      },
      {
        title: "עוד **פעלים**",
        table: [["have", "**had**"], ["come", "**came**"], ["take", "**took**"], ["make", "**made**"]],
      },
      {
        title: "שימו **לב**",
        lines: ["go בעבר זה went"],
        compare: ["I goed home.", "I **went** home."],
      },
    ],
    quiz: [
      ["Yesterday I ___ to the park.", "אתמול הלכתי לפארק", ["goed", "went", "go"], 1, "go בעבר – went"],
      ["We ___ pizza last night.", "אכלנו פיצה אתמול בלילה", ["ate", "eated"], 0, "eat בעבר – ate"],
      ["He ___ a bird.", "הוא ראה ציפור", ["see", "saw"], 1, "see בעבר – saw"],
    ],
    discuss: ["לאן הלכתם בחופש? ענו עם I went", "מה אכלתם אתמול? ענו עם I ate"],
  },
  {
    id: "irregular-verbs-2",
    topic: "irregular-verbs",
    name: "פעלים חשובים",
    part: "can / could",
    summary: "can – יכול עכשיו, could – יכול בעבר",
    vocab: [["can", "יכול"], ["can't", "לא יכול"], ["could", "יכול – בעבר"], ["couldn't", "לא יכול – בעבר"], ["swim", "לשחות"], ["ride", "לרכוב"]],
    slides: [
      {
        title: "**can** – יכול",
        lines: ["can ועוד פועל – יכול לעשות"],
        examples: [["I **can** swim.", "אני יודע לשחות"], ["He **can** ride a bike.", "הוא יודע לרכוב על אופניים"]],
      },
      {
        title: "**can't** – לא יכול",
        lines: ["can't – קיצור של can not"],
        examples: [["I **can't** fly.", "אני לא יכול לעוף"], ["The cat **can't** read.", "החתול לא יודע לקרוא"]],
      },
      {
        title: "שאלה עם **Can**",
        lines: ["Can קופץ להתחלה"],
        examples: [["**Can** you help me?", "אתה יכול לעזור לי?"], ["Yes, I **can**.", "כן"]],
      },
      {
        title: "**could** – בעבר",
        lines: ["could – יכולתי, בעבר"],
        examples: [["I **could** read when I was five.", "ידעתי לקרוא כשהייתי בן חמש"], ["I **couldn't** sleep.", "לא יכולתי לישון"]],
      },
      {
        title: "שימו **לב**",
        lines: ["אחרי can – הפועל בלי s ובלי to"],
        compare: ["He can swims.", "He can **swim**."],
      },
      {
        title: "**לסיכום**",
        table: [["יכול", "**can**"], ["לא יכול", "**can't**"], ["יכולתי", "**could**"]],
      },
    ],
    quiz: [
      ["I ___ ride a bike.", "אני יודע לרכוב על אופניים", ["can", "cans"], 0, "can – תמיד בלי s"],
      ["Fish ___ walk.", "דגים לא יכולים ללכת", ["can", "can't"], 1, "לא יכול – can't"],
      ["Last year I ___ swim.", "בשנה שעברה לא ידעתי לשחות", ["can't", "couldn't"], 1, "בעבר – couldn't"],
    ],
    discuss: ["מה אתם יודעים לעשות? ענו עם I can", "מה לא יכולתם לעשות כשהייתם קטנים? ענו עם I couldn't"],
  },
  {
    id: "going-to",
    topic: "going-to",
    name: "עתיד: going to",
    summary: "מה אני עומד לעשות? am, is, are ועוד going to",
    vocab: [["going to", "עומד ל־"], ["tomorrow", "מחר"], ["next week", "בשבוע הבא"], ["visit", "לבקר"], ["rain", "גשם"]],
    slides: [
      {
        title: "מה **אני עומד** לעשות?",
        lines: ["תוכנית לעתיד – going to"],
        examples: [["I **am going to** play.", "אני הולך לשחק"]],
      },
      {
        title: "**am** / **is** / **are** + **going to**",
        table: [["I", "**am** going to"], ["he, she, it", "**is** going to"], ["you, we, they", "**are** going to"]],
      },
      {
        title: "**דוגמאות**",
        examples: [["He **is going to** visit his grandpa.", "הוא הולך לבקר את סבא שלו"], ["We **are going to** eat pizza.", "אנחנו הולכים לאכול פיצה"]],
      },
      {
        title: "**רואים** מה יקרה",
        lines: ["רואים סימן – ויודעים מה יקרה"],
        examples: [["Look at the clouds!", "תראו את העננים!"], ["It **is going to** rain.", "עומד לרדת גשם"]],
      },
      {
        title: "**לא** ו**שאלה**",
        examples: [["I **am not going to** go.", "אני לא הולך ללכת"], ["**Are** you **going to** come?", "אתה הולך לבוא?"]],
      },
      {
        title: "שימו **לב**",
        lines: ["אסור לשכוח am, is, are"],
        compare: ["I going to play.", "I **am** going to play."],
      },
    ],
    quiz: [
      ["I ___ going to read.", "אני הולך לקרוא", ["am", "is", "are"], 0, "עם I – am"],
      ["They are going ___ play.", "הם הולכים לשחק", ["to", "for", "at"], 0, "תמיד going to"],
      ["___ he going to come?", "הוא הולך לבוא?", ["Is", "Are", "Am"], 0, "עם he – Is"],
    ],
    discuss: ["מה אתם הולכים לעשות אחרי בית הספר? ענו עם I am going to", "מה אתם הולכים לעשות בחופש?"],
  },
  {
    id: "modals-1",
    topic: "modals",
    name: "חובה ועצה",
    part: "must / mustn't",
    summary: "must – חייבים, mustn't – אסור",
    vocab: [["must", "חייב"], ["mustn't", "אסור"], ["rule", "חוק"], ["helmet", "קסדה"], ["listen", "להקשיב"]],
    slides: [
      {
        title: "**must** – חייבים",
        lines: ["must ועוד פועל – חייבים לעשות"],
        examples: [["You **must** wear a helmet.", "אתה חייב לחבוש קסדה"], ["We **must** listen.", "אנחנו חייבים להקשיב"]],
      },
      {
        title: "**mustn't** – אסור",
        lines: ["mustn't – אסור לעשות"],
        examples: [["You **mustn't** run here.", "אסור לרוץ כאן"], ["We **mustn't** be late.", "אסור לנו לאחר"]],
      },
      {
        title: "**חוקים**",
        lines: ["משתמשים בהם בחוקים"],
        examples: [["You **must** stop at a red light.", "חייבים לעצור ברמזור אדום"], ["You **mustn't** cross on red.", "אסור לחצות באדום"]],
      },
      {
        title: "שימו **לב**",
        lines: ["אחרי must – בלי to"],
        compare: ["You must to go.", "You must **go**."],
      },
      {
        title: "**לסיכום**",
        table: [["חייבים", "**must**"], ["אסור", "**mustn't**"]],
      },
    ],
    quiz: [
      ["You ___ wear a seat belt.", "חייבים לחגור חגורת בטיחות", ["must", "mustn't"], 0, "חייבים – must"],
      ["You ___ touch the fire.", "אסור לגעת באש", ["must", "mustn't"], 1, "אסור – mustn't"],
      ["We must ___ quiet.", "אנחנו חייבים להיות בשקט", ["be", "to be"], 0, "אחרי must – בלי to"],
    ],
    discuss: ["תנו חוק אחד של הכיתה עם You must", "תנו חוק אחד של הכיתה עם You mustn't"],
  },
  {
    id: "modals-2",
    topic: "modals",
    name: "חובה ועצה",
    part: "should / have to",
    summary: "should – כדאי, have to – צריך",
    vocab: [["should", "כדאי"], ["shouldn't", "לא כדאי"], ["have to", "צריך"], ["has to", "צריך (הוא)"], ["study", "ללמוד"]],
    slides: [
      {
        title: "**should** – כדאי",
        lines: ["נותנים עצה עם should"],
        examples: [["You **should** sleep early.", "כדאי לך ללכת לישון מוקדם"], ["You **should** drink water.", "כדאי לך לשתות מים"]],
      },
      {
        title: "**shouldn't** – לא כדאי",
        lines: ["עצה לא לעשות – shouldn't"],
        examples: [["You **shouldn't** eat too much candy.", "לא כדאי לך לאכול יותר מדי ממתקים"]],
      },
      {
        title: "**have to** – צריך",
        lines: ["משהו שצריך לעשות – have to"],
        examples: [["I **have to** study.", "אני צריך ללמוד"], ["We **have to** go now.", "אנחנו צריכים ללכת עכשיו"]],
      },
      {
        title: "**has to**",
        lines: ["עם he, she, it – has to"],
        examples: [["He **has to** clean his room.", "הוא צריך לנקות את החדר שלו"]],
      },
      {
        title: "שימו **לב**",
        lines: ["עם he – has to"],
        compare: ["He have to go.", "He **has** to go."],
      },
      {
        title: "**לסיכום**",
        table: [["חייבים", "**must**"], ["צריך", "**have to**"], ["כדאי", "**should**"]],
      },
    ],
    quiz: [
      ["You ___ see a doctor.", "כדאי לך ללכת לרופא", ["should", "shouldn't"], 0, "כדאי – should"],
      ["I ___ to do my homework.", "אני צריך לעשות שיעורי בית", ["have", "has"], 0, "עם I – have to"],
      ["He ___ to wake up early.", "הוא צריך לקום מוקדם", ["have", "has"], 1, "עם he – has to"],
    ],
    discuss: ["תנו עצה לחבר עם You should", "מה אתם צריכים לעשות היום? ענו עם I have to"],
  },

  /* ---------- Stage 7: longer sentences ---------- */
  {
    id: "connectors-1",
    topic: "connectors",
    name: "מילות קישור",
    part: "and, but, because",
    summary: "מחברים שני משפטים – and, but, because, or",
    vocab: [["and", "ו־"], ["but", "אבל"], ["because", "כי"], ["or", "או"], ["tired", "עייף"], ["hungry", "רעב"]],
    slides: [
      {
        title: "מילים **שמחברות**",
        lines: ["מילה קטנה שמחברת שני משפטים"],
        table: [["ו־", "**and**"], ["אבל", "**but**"], ["כי", "**because**"], ["או", "**or**"]],
      },
      {
        title: "**and** – ו",
        lines: ["and – מוסיפים עוד דבר"],
        examples: [["I like apples **and** bananas.", "אני אוהב תפוחים ובננות"], ["He runs **and** jumps.", "הוא רץ וקופץ"]],
      },
      {
        title: "**but** – אבל",
        lines: ["but – משהו שונה או הפוך"],
        examples: [["I am tired, **but** I am happy.", "אני עייף, אבל אני שמח"]],
      },
      {
        title: "**because** – כי",
        lines: ["because – אומרים למה"],
        examples: [["I am happy **because** it is Friday.", "אני שמח כי היום שישי"]],
      },
      {
        title: "**or** – או",
        lines: ["or – בוחרים אחד"],
        examples: [["Do you want tea **or** juice?", "אתה רוצה תה או מיץ?"]],
      },
      {
        title: "שימו **לב**",
        lines: ["אומרים סיבה – עם because"],
        compare: ["I am cold but it is winter.", "I am cold **because** it is winter."],
      },
    ],
    quiz: [
      ["I have a cat ___ a dog.", "יש לי חתול וכלב", ["and", "but", "because"], 0, "ו – and"],
      ["He is small, ___ he is strong.", "הוא קטן, אבל הוא חזק", ["and", "but", "because"], 1, "אבל – but"],
      ["I eat ___ I am hungry.", "אני אוכל כי אני רעב", ["and", "but", "because"], 2, "כי – because"],
    ],
    discuss: ["ספרו שני דברים שאתם אוהבים – עם and", "למה אתם אוהבים את היום האהוב עליכם? ענו עם because"],
  },
  {
    id: "connectors-2",
    topic: "connectors",
    name: "מילות קישור",
    part: "so, before, after",
    summary: "so – אז, before – לפני, after – אחרי",
    vocab: [["so", "אז, לכן"], ["before", "לפני"], ["after", "אחרי"], ["first", "קודם"], ["then", "ואז"]],
    slides: [
      {
        title: "**so** – אז",
        lines: ["so – מה קרה בגלל זה"],
        examples: [["It was cold, **so** I wore a coat.", "היה קר, אז לבשתי מעיל"]],
      },
      {
        title: "**because** / **so**",
        lines: ["because – הסיבה", "so – מה קרה בגללה"],
        examples: [["I was hungry, **so** I ate.", "הייתי רעב, אז אכלתי"], ["I ate **because** I was hungry.", "אכלתי כי הייתי רעב"]],
      },
      {
        title: "**before** – לפני",
        lines: ["before – קודם"],
        examples: [["I wash my hands **before** lunch.", "אני שוטף ידיים לפני ארוחת הצהריים"]],
      },
      {
        title: "**after** – אחרי",
        lines: ["after – אחר כך"],
        examples: [["We play **after** school.", "אנחנו משחקים אחרי בית הספר"]],
      },
      {
        title: "**first** / **then**",
        lines: ["מספרים לפי הסדר"],
        examples: [["**First** I eat, **then** I play.", "קודם אני אוכל, ואז אני משחק"]],
      },
      {
        title: "**לסיכום**",
        table: [["אז, לכן", "**so**"], ["לפני", "**before**"], ["אחרי", "**after**"], ["ואז", "**then**"]],
      },
    ],
    quiz: [
      ["It rained, ___ we stayed home.", "ירד גשם, אז נשארנו בבית", ["so", "because"], 0, "אז – so"],
      ["I brush my teeth ___ bed.", "אני מצחצח שיניים לפני השינה", ["before", "after"], 0, "לפני – before"],
      ["We eat dinner ___ we come home.", "אנחנו אוכלים ארוחת ערב אחרי שחוזרים הביתה", ["before", "after"], 1, "אחרי – after"],
    ],
    discuss: ["מה אתם עושים לפני בית הספר? ענו עם before", "ספרו מה עשיתם אתמול לפי הסדר – עם first ו־then"],
  },
  {
    id: "comparatives-1",
    topic: "comparatives",
    name: "השוואה",
    part: "bigger, the biggest",
    summary: "יותר והכי – מוסיפים er ו־est",
    vocab: [["bigger", "יותר גדול"], ["the biggest", "הכי גדול"], ["taller", "יותר גבוה"], ["the tallest", "הכי גבוה"], ["than", "מאשר"], ["faster", "יותר מהיר"]],
    slides: [
      {
        title: "גדול, יותר גדול, **הכי** גדול",
        table: [["גדול", "big"], ["יותר גדול", "bigg**er**"], ["הכי גדול", "the bigg**est**"]],
      },
      {
        title: "**er** – יותר",
        lines: ["משווים שניים – מוסיפים er", "ואחרי זה than – מ"],
        examples: [["Tom is tall**er than** Ben.", "טום יותר גבוה מבן"], ["A car is fast**er than** a bike.", "מכונית יותר מהירה מאופניים"]],
      },
      {
        title: "**est** – הכי",
        lines: ["הכי מכולם – the ועוד est"],
        examples: [["He is **the** tall**est** in the class.", "הוא הכי גבוה בכיתה"]],
      },
      {
        title: "איך **כותבים**?",
        lines: ["y בסוף – ier", "עיצור אחרי תנועה קצרה – מכפילים"],
        table: [["happy", "happ**ier**"], ["big", "bigg**er**"], ["hot", "hott**est**"]],
      },
      {
        title: "שימו **לב**",
        lines: ["er כבר אומר יותר"],
        compare: ["more bigger", "bigg**er**"],
      },
      {
        title: "**לסיכום**",
        table: [["יותר", "**er** + than"], ["הכי", "the + **est**"]],
      },
    ],
    quiz: [
      ["An elephant is ___ than a dog.", "פיל יותר גדול מכלב", ["big", "bigger", "biggest"], 1, "יותר – er"],
      ["He is the ___ boy in the class.", "הוא הילד הכי גבוה בכיתה", ["taller", "tallest"], 1, "הכי – est"],
      ["Today is ___ than yesterday.", "היום יותר חם מאתמול", ["hoter", "hotter"], 1, "ב־hot מכפילים את t"],
    ],
    discuss: ["השוו בין שני דברים בכיתה עם bigger", "מי הכי מהיר במשפחה שלכם? ענו עם the fastest"],
  },
  {
    id: "comparatives-2",
    topic: "comparatives",
    name: "השוואה",
    part: "more, most, better",
    summary: "מילים ארוכות עם more ו־most – ומילים מיוחדות כמו good",
    vocab: [["more", "יותר"], ["the most", "הכי"], ["better", "יותר טוב"], ["the best", "הכי טוב"], ["worse", "יותר גרוע"], ["interesting", "מעניין"]],
    slides: [
      {
        title: "מילים **ארוכות**",
        lines: ["במילה ארוכה לא מוסיפים er", "אומרים more"],
        examples: [["This book is **more** interesting.", "הספר הזה יותר מעניין"]],
      },
      {
        title: "**the most** – הכי",
        lines: ["הכי – the most"],
        examples: [["It is **the most** beautiful park.", "זה הפארק הכי יפה"]],
      },
      {
        title: "**good** – **better** – **best**",
        table: [["טוב", "good"], ["יותר טוב", "**better**"], ["הכי טוב", "the **best**"]],
      },
      {
        title: "**bad** – **worse** – **worst**",
        table: [["רע", "bad"], ["יותר רע", "**worse**"], ["הכי רע", "the **worst**"]],
      },
      {
        title: "שימו **לב**",
        lines: ["good משתנה לגמרי"],
        compare: ["gooder", "**better**"],
      },
      {
        title: "**דוגמאות**",
        examples: [["Pizza is **better** than soup.", "פיצה יותר טובה ממרק"], ["He is my **best** friend.", "הוא החבר הכי טוב שלי"]],
      },
    ],
    quiz: [
      ["Math is ___ difficult than art.", "חשבון יותר קשה מאומנות", ["more", "most"], 0, "יותר – more"],
      ["He is the ___ player.", "הוא השחקן הכי טוב", ["good", "better", "best"], 2, "הכי טוב – best"],
      ["This movie is ___ than that one.", "הסרט הזה יותר טוב מההוא", ["gooder", "better"], 1, "good הופך ל־better"],
    ],
    discuss: ["מה האוכל הכי טוב בעיניכם? ענו עם the best", "מה יותר מעניין – ספר או סרט? ענו עם more interesting"],
  },
  {
    id: "quantifiers-1",
    topic: "quantifiers",
    name: "כמויות",
    part: "some / any",
    summary: "some – קצת, any – בשאלה ובמשפט עם לא",
    vocab: [["some", "קצת, כמה"], ["any", "בכלל – בשאלה ובשלילה"], ["milk", "חלב"], ["apples", "תפוחים"], ["bread", "לחם"]],
    slides: [
      {
        title: "**some** – קצת",
        lines: ["some – קצת, כמה", "במשפט רגיל"],
        examples: [["I have **some** apples.", "יש לי כמה תפוחים"], ["We need **some** milk.", "אנחנו צריכים קצת חלב"]],
      },
      {
        title: "**any** – במשפט עם לא",
        lines: ["במשפט עם לא – any"],
        examples: [["I don't have **any** apples.", "אין לי תפוחים בכלל"]],
      },
      {
        title: "**any** – בשאלה",
        lines: ["בשאלה – any"],
        examples: [["Do you have **any** bread?", "יש לך לחם?"]],
      },
      {
        title: "שימו **לב**",
        lines: ["אחרי don't – any"],
        compare: ["I don't have some money.", "I don't have **any** money."],
      },
      {
        title: "**לסיכום**",
        table: [["משפט רגיל", "**some**"], ["לא", "**any**"], ["שאלה", "**any**"]],
      },
    ],
    quiz: [
      ["There is ___ milk in the fridge.", "יש קצת חלב במקרר", ["some", "any"], 0, "משפט רגיל – some"],
      ["I don't have ___ pencils.", "אין לי עפרונות", ["some", "any"], 1, "משפט עם לא – any"],
      ["Are there ___ cookies?", "יש עוגיות?", ["some", "any"], 1, "שאלה – any"],
    ],
    discuss: ["מה יש לכם בתיק? ענו עם some", "שאלו חבר: Do you have any pets"],
  },
  {
    id: "quantifiers-2",
    topic: "quantifiers",
    name: "כמויות",
    part: "many / much / a lot of",
    summary: "הרבה – many לדברים שסופרים, much לדברים שלא סופרים",
    vocab: [["many", "הרבה – סופרים"], ["much", "הרבה – לא סופרים"], ["a lot of", "הרבה"], ["water", "מים"], ["How much", "כמה – לא סופרים"]],
    slides: [
      {
        title: "סופרים או **לא**?",
        lines: ["יש דברים שסופרים – ספר, שני ספרים", "ויש דברים שלא סופרים – מים, חלב"],
        table: [["סופרים", "books, apples"], ["לא סופרים", "water, milk"]],
      },
      {
        title: "**many** – הרבה",
        lines: ["דברים שסופרים – many"],
        examples: [["I don't have **many** books.", "אין לי הרבה ספרים"], ["**How many** pens?", "כמה עטים?"]],
      },
      {
        title: "**much** – הרבה",
        lines: ["דברים שלא סופרים – much"],
        examples: [["There isn't **much** water.", "אין הרבה מים"], ["**How much** milk?", "כמה חלב?"]],
      },
      {
        title: "**a lot of** – הרבה",
        lines: ["a lot of – מתאים לכל דבר"],
        examples: [["I have **a lot of** friends.", "יש לי הרבה חברים"], ["He drinks **a lot of** water.", "הוא שותה הרבה מים"]],
      },
      {
        title: "שימו **לב**",
        lines: ["מים לא סופרים – much"],
        compare: ["How many water?", "How **much** water?"],
      },
      {
        title: "**לסיכום**",
        table: [["סופרים", "**many**"], ["לא סופרים", "**much**"], ["הכל", "**a lot of**"]],
      },
    ],
    quiz: [
      ["How ___ apples do you want?", "כמה תפוחים אתה רוצה?", ["much", "many"], 1, "תפוחים סופרים – many"],
      ["I don't drink ___ juice.", "אני לא שותה הרבה מיץ", ["much", "many"], 0, "מיץ לא סופרים – much"],
      ["He has ___ toys.", "יש לו הרבה צעצועים", ["a lot of", "much"], 0, "הרבה – a lot of"],
    ],
    discuss: ["כמה ספרים יש לכם בבית? ענו עם many", "כמה מים אתם שותים ביום? ענו עם a lot of"],
  },
  {
    id: "word-building-1",
    topic: "word-building",
    name: "בניית מילים",
    part: "un, dis, re",
    summary: "מוסיפים חלק קטן בתחילת המילה – ומקבלים מילה חדשה.",
    vocab: [["happy", "שמח"], ["unhappy", "לא שמח"], ["like", "לאהוב"], ["dislike", "לא לאהוב"], ["redo", "לעשות שוב"], ["rewrite", "לכתוב שוב"]],
    slides: [
      {
        title: "בונים **מילים**",
        lines: ["מוסיפים חלק קטן למילה", "ומקבלים מילה חדשה"],
        flow: true,
        examples: [["happy", "שמח"], ["**un**happy", "לא שמח"]],
      },
      {
        title: "**un** – לא",
        lines: ["un בהתחלה – הפוך, לא"],
        table: [["happy", "**un**happy"], ["kind", "**un**kind"], ["lock", "**un**lock"]],
      },
      {
        title: "**dis** – לא",
        lines: ["גם dis בהתחלה אומר לא"],
        table: [["like", "**dis**like"], ["agree", "**dis**agree"]],
      },
      {
        title: "**re** – שוב",
        lines: ["re בהתחלה – עושים שוב"],
        table: [["do", "**re**do"], ["write", "**re**write"], ["play", "**re**play"]],
      },
      {
        title: "שימו **לב**",
        lines: ["לא שמח זה unhappy"],
        compare: ["dishappy", "**un**happy"],
      },
      {
        title: "**לסיכום**",
        table: [["לא", "**un**, **dis**"], ["שוב", "**re**"]],
      },
    ],
    quiz: [
      ["___happy", "לא שמח", ["un", "dis", "re"], 0, "לא שמח – unhappy"],
      ["___like", "לא אוהב", ["un", "dis", "re"], 1, "לא אוהב – dislike"],
      ["___write", "לכתוב שוב", ["un", "dis", "re"], 2, "שוב – re"],
    ],
    discuss: ["תנו מילה עם un ואמרו מה היא אומרת", "מה צריך לפעמים לעשות שוב? ענו עם מילה שמתחילה ב־re"],
  },
  {
    id: "word-building-2",
    topic: "word-building",
    name: "בניית מילים",
    part: "er, ful, less, ly",
    summary: "מוסיפים חלק קטן בסוף המילה – er, ful, less, ly",
    vocab: [["teacher", "מורה"], ["player", "שחקן"], ["helpful", "עוזר, מועיל"], ["careless", "לא זהיר"], ["slowly", "לאט"], ["quickly", "מהר"]],
    slides: [
      {
        title: "**er** – מי שעושה",
        lines: ["פועל ועוד er – מי שעושה את זה"],
        table: [["teach", "teach**er**"], ["play", "play**er**"], ["paint", "paint**er**"]],
      },
      {
        title: "**ful** – מלא",
        lines: ["ful בסוף – יש בו הרבה"],
        table: [["help", "help**ful**"], ["care", "care**ful**"], ["color", "color**ful**"]],
      },
      {
        title: "**less** – בלי",
        lines: ["less בסוף – בלי"],
        table: [["care", "care**less**"], ["use", "use**less**"]],
      },
      {
        title: "**ly** – איך",
        lines: ["ly בסוף – איך עושים משהו"],
        examples: [["He runs quick**ly**.", "הוא רץ מהר"], ["Walk slow**ly**.", "תלכו לאט"]],
      },
      {
        title: "שימו **לב**",
        lines: ["ful בסוף – רק l אחת"],
        compare: ["helpfull", "help**ful**"],
      },
      {
        title: "**לסיכום**",
        table: [["מי שעושה", "**er**"], ["מלא", "**ful**"], ["בלי", "**less**"], ["איך", "**ly**"]],
      },
    ],
    quiz: [
      ["A person who plays is a ___.", "מי שמשחק", ["player", "playful", "playly"], 0, "מי שעושה – er"],
      ["Be ___ on the road!", "תהיו זהירים בכביש", ["careful", "careless"], 0, "זהיר – careful"],
      ["He talks ___.", "הוא מדבר בשקט", ["quiet", "quietly"], 1, "איך – ly"],
    ],
    discuss: ["תנו מילה עם er – מי עושה מה?", "איך אתם הולכים לבית הספר? ענו עם מילה שנגמרת ב־ly"],
  },

  /* ---------- Stage 8: advanced sentences ---------- */
  {
    id: "present-perfect-1",
    topic: "present-perfect",
    name: "הווה מושלם",
    part: "have / has + פועל",
    summary: "משהו שכבר קרה – והתוצאה רואים עכשיו: I have finished",
    vocab: [["have finished", "סיימתי"], ["has cleaned", "ניקה"], ["eaten", "אכל (have eaten)"], ["seen", "ראה (have seen)"], ["gone", "הלך (have gone)"], ["done", "עשה (have done)"], ["haven't", "לא (have not)"]],
    slides: [
      {
        title: "**כבר** עשיתי",
        lines: ["משהו שקרה – ועכשיו רואים את התוצאה"],
        examples: [["I **have finished** my homework.", "סיימתי את שיעורי הבית – ועכשיו אני חופשי"]],
      },
      {
        title: "**have** / **has** + פועל",
        table: [["I, you, we, they", "**have** finished"], ["he, she, it", "**has** finished"]],
      },
      {
        title: "פועל רגיל – **ed**",
        lines: ["בפעלים רגילים מוסיפים ed – כמו בעבר"],
        examples: [["I **have cleaned** my room.", "ניקיתי את החדר שלי"], ["He **has washed** the car.", "הוא שטף את המכונית"]],
      },
      {
        title: "פעלים **מיוחדים**",
        lines: ["יש פעלים עם צורה משלהם"],
        table: [["eat", "**eaten**"], ["see", "**seen**"], ["go", "**gone**"], ["do", "**done**"]],
      },
      {
        title: "**דוגמאות**",
        examples: [["I **have eaten** lunch.", "אכלתי ארוחת צהריים"], ["He **has lost** his key.", "הוא איבד את המפתח שלו"]],
      },
      {
        title: "**haven't** / **hasn't**",
        lines: ["לא עשיתי – haven't"],
        examples: [["I **haven't** seen this movie.", "לא ראיתי את הסרט הזה"], ["He **hasn't** done his homework.", "הוא לא הכין את שיעורי הבית"]],
      },
      {
        title: "שימו **לב**",
        lines: ["עם he – has"],
        compare: ["He have finished.", "He **has** finished."],
      },
      {
        title: "**לסיכום**",
        table: [["אני, אתה, אנחנו", "**have** + פועל"], ["הוא", "**has** + פועל"], ["לא", "**haven't** / **hasn't**"]],
      },
    ],
    quiz: [
      ["I ___ finished my work.", "סיימתי את העבודה שלי", ["have", "has"], 0, "עם I – have"],
      ["He ___ cleaned his room.", "הוא ניקה את החדר שלו", ["have", "has"], 1, "עם he – has"],
      ["We have ___ pizza.", "אכלנו פיצה", ["ate", "eaten", "eat"], 1, "eat – eaten"],
      ["Dan ___ seen this movie.", "דן לא ראה את הסרט הזה", ["hasn't", "haven't"], 0, "עם Dan – hasn't"],
    ],
    discuss: ["מה כבר עשיתם היום? ענו עם I have", "איזה סרט עוד לא ראיתם? ענו עם I haven't seen"],
  },
  {
    id: "present-perfect-2",
    topic: "present-perfect",
    name: "הווה מושלם",
    part: "ever / never",
    summary: "שואלים אם פעם עשית משהו – Have you ever – ועונים עם never",
    vocab: [["ever", "אי פעם"], ["never", "אף פעם"], ["been", "היה (have been)"], ["Have you ever", "האם אי פעם"], ["flown", "טס (have flown)"], ["snow", "שלג"]],
    slides: [
      {
        title: "**פעם** בחיים",
        lines: ["Have you ever – האם אי פעם"],
        examples: [["**Have** you **ever** been to Eilat?", "היית פעם באילת?"]],
      },
      {
        title: "**שאלה**",
        lines: ["Have קופץ להתחלה"],
        flow: true,
        examples: [["You **have** seen a lion.", "ראית אריה"], ["**Have** you seen a lion?", "ראית אריה?"]],
      },
      {
        title: "**ever** – אי פעם",
        lines: ["ever בא לפני הפועל"],
        examples: [["Have you **ever** eaten sushi?", "אכלת פעם סושי?"], ["Has he **ever** flown in a plane?", "הוא טס פעם במטוס?"]],
      },
      {
        title: "**תשובה** קצרה",
        examples: [["Yes, I **have**.", "כן"], ["No, I **haven't**.", "לא"]],
      },
      {
        title: "**never** – אף פעם",
        lines: ["never – אף פעם לא"],
        examples: [["I have **never** seen snow.", "אף פעם לא ראיתי שלג"], ["He has **never** been to London.", "הוא אף פעם לא היה בלונדון"]],
      },
      {
        title: "**been** – הייתי",
        lines: ["been – הייתי במקום"],
        examples: [["I have **been** to Jerusalem.", "הייתי בירושלים"]],
      },
      {
        title: "שימו **לב**",
        lines: ["never כבר אומר לא", "לא מוסיפים עוד not"],
        compare: ["I haven't never seen it.", "I have **never** seen it."],
      },
      {
        title: "**לסיכום**",
        table: [["אי פעם?", "**Have** you **ever**"], ["אף פעם", "**never**"], ["הייתי ב־", "**been** to"]],
      },
    ],
    quiz: [
      ["___ you ever seen a camel?", "ראית פעם גמל?", ["Have", "Has"], 0, "עם you – Have"],
      ["Has he ever ___ to Paris?", "הוא היה פעם בפריז?", ["be", "been", "was"], 1, "be – been"],
      ["I have ___ eaten snails.", "אף פעם לא אכלתי חלזונות", ["ever", "never"], 1, "אף פעם – never"],
      ["Have you ever ridden a horse? Yes, I ___.", "רכבת פעם על סוס? כן", ["did", "has", "have"], 2, "עונים עם have"],
    ],
    discuss: ["שאלו חבר: Have you ever been to Eilat", "ספרו משהו שאף פעם לא עשיתם – עם I have never"],
  },
  {
    id: "conditionals-1",
    topic: "conditionals",
    name: "משפטי תנאי",
    part: "If + will",
    summary: "אם יקרה דבר אחד – יקרה דבר אחר: If it rains, I will stay home",
    vocab: [["if", "אם"], ["will", "עתיד – יקרה"], ["rain", "גשם, לרדת גשם"], ["stay home", "להישאר בבית"], ["pass", "לעבור (מבחן)"], ["hungry", "רעב"]],
    slides: [
      {
        title: "**if** – אם",
        lines: ["משפט עם תנאי"],
        examples: [["**If** it rains, I will stay home.", "אם ירד גשם, אשאר בבית"]],
      },
      {
        title: "**שני** חלקים",
        lines: ["חלק אחד – התנאי", "חלק שני – מה יקרה"],
        table: [["התנאי", "**If** it rains"], ["מה יקרה", "I **will** stay home"]],
      },
      {
        title: "**if** + הווה",
        lines: ["אחרי if – פועל בהווה", "גם כשמדברים על מחר"],
        examples: [["If he **comes** tomorrow, we will play.", "אם הוא יבוא מחר, נשחק"]],
      },
      {
        title: "**will** – מה יקרה",
        lines: ["בחלק השני – will ועוד פועל"],
        examples: [["If you study, you **will** pass the test.", "אם תלמד, תעבור את המבחן"], ["If he is hungry, he **will** eat.", "אם הוא יהיה רעב, הוא יאכל"]],
      },
      {
        title: "**if** באמצע",
        lines: ["אפשר להתחיל בחלק השני", "ואז אין פסיק"],
        flow: true,
        examples: [["If it is hot, we will swim.", "אם יהיה חם, נשחה"], ["We will swim **if** it is hot.", "נשחה אם יהיה חם"]],
      },
      {
        title: "שימו **לב**",
        lines: ["אחרי if – בלי will"],
        compare: ["If it will rain, I will stay home.", "If it **rains**, I will stay home."],
      },
      {
        title: "**לסיכום**",
        table: [["התנאי", "**If** + הווה"], ["מה יקרה", "**will** + פועל"]],
      },
    ],
    quiz: [
      ["If it ___, we will play inside.", "אם ירד גשם, נשחק בפנים", ["rains", "will rain"], 0, "אחרי if – הווה"],
      ["If you eat too much, you ___ sick.", "אם תאכל יותר מדי, תהיה חולה", ["are", "will be"], 1, "מה יקרה – will"],
      ["If he ___ hungry, he will eat.", "אם הוא יהיה רעב, הוא יאכל", ["will be", "is"], 1, "אחרי if – בלי will"],
      ["I will help you ___ you call me.", "אעזור לך אם תתקשר אליי", ["if", "will", "is"], 0, "if – אם"],
    ],
    discuss: ["מה תעשו אם ירד גשם מחר? ענו עם If it rains", "השלימו בקול: If I have time"],
  },
  {
    id: "conditionals-2",
    topic: "conditionals",
    name: "משפטי תנאי",
    part: "עובדות והרגלים",
    summary: "דברים שקורים תמיד – הווה בשני החלקים: If you heat ice, it melts",
    vocab: [["heat", "לחמם"], ["melt", "להימס"], ["freeze", "לקפוא"], ["mix", "לערבב"], ["get", "לקבל"], ["when", "כש־"]],
    slides: [
      {
        title: "**תמיד** קורה",
        lines: ["יש דברים שקורים כל פעם", "עובדות מהמדע ומהחיים"],
        examples: [["If you heat ice, it **melts**.", "אם מחממים קרח, הוא נמס"]],
      },
      {
        title: "**הווה** + **הווה**",
        lines: ["בשני החלקים – הווה", "כי זה קורה כל פעם"],
        table: [["התנאי", "If you **heat** ice"], ["מה קורה", "it **melts**"]],
      },
      {
        title: "**עובדות** מהמדע",
        examples: [["If you mix blue and yellow, you **get** green.", "אם מערבבים כחול וצהוב, מקבלים ירוק"], ["If water gets very cold, it **freezes**.", "אם מים מתקררים מאוד, הם קופאים"]],
      },
      {
        title: "**הרגלים** שלי",
        lines: ["גם דברים שקורים לי כל פעם"],
        examples: [["If I am tired, I **go** to bed early.", "כשאני עייף, אני הולך לישון מוקדם"], ["If my dog is hungry, he **barks**.", "כשהכלב שלי רעב, הוא נובח"]],
      },
      {
        title: "**when** – כש",
        lines: ["כאן אפשר להגיד גם when"],
        examples: [["**When** it rains, the street gets wet.", "כשיורד גשם, הרחוב נרטב"]],
      },
      {
        title: "**תמיד** או **מחר**",
        examples: [["If you heat ice, it **melts**.", "תמיד – הווה"], ["If it rains, I **will** stay home.", "פעם אחת, מחר – will"]],
      },
      {
        title: "שימו **לב**",
        lines: ["עם he, she, it – s בסוף הפועל"],
        compare: ["If he is cold, he wear a coat.", "If he is cold, he **wears** a coat."],
      },
      {
        title: "**לסיכום**",
        table: [["תמיד", "**If** + הווה, הווה"], ["פעם אחת", "**If** + הווה, **will**"]],
      },
    ],
    quiz: [
      ["If you heat water, it ___.", "אם מחממים מים, הם רותחים", ["boils", "boiled"], 0, "עובדה – הווה"],
      ["If you mix red and white, you ___ pink.", "אם מערבבים אדום ולבן, מקבלים ורוד", ["got", "get"], 1, "תמיד – הווה"],
      ["If my cat is hungry, it ___.", "כשהחתול שלי רעב, הוא מיילל", ["meow", "meows"], 1, "עם it – s בסוף"],
      ["If it rains tomorrow, I ___ stay home.", "אם ירד גשם מחר, אשאר בבית", ["will", "am"], 0, "מחר – will"],
    ],
    discuss: ["מה קורה אם שמים קרח בשמש?", "מה אתם עושים כשאתם עייפים? ענו עם If I am tired"],
  },
  {
    id: "passive-1",
    topic: "passive",
    name: "סביל",
    part: "is / are made",
    summary: "לא חשוב מי עושה – חשוב מה קורה לדבר: The room is cleaned every day",
    vocab: [["is made", "עשוי, מיוצר"], ["is cleaned", "מנוקה"], ["is spoken", "מדברים בה"], ["are grown", "מגדלים אותם"], ["made of", "עשוי מ־"], ["wood", "עץ (חומר)"], ["glass", "זכוכית"]],
    slides: [
      {
        title: "**מי** עושה?",
        lines: ["לפעמים לא חשוב מי עושה", "חשוב מה קורה לדבר"],
        flow: true,
        examples: [["Someone **cleans** the room every day.", "מישהו מנקה את החדר כל יום"], ["The room **is cleaned** every day.", "החדר מנוקה כל יום"]],
      },
      {
        title: "**is** / **are** + פועל",
        table: [["דבר אחד", "**is** cleaned"], ["הרבה דברים", "**are** cleaned"]],
      },
      {
        title: "פועל רגיל – **ed**",
        lines: ["כמו בעבר – מוסיפים ed"],
        examples: [["The shops **are closed** on Shabbat.", "החנויות סגורות בשבת"], ["The car **is washed** on Friday.", "שוטפים את המכונית ביום שישי"]],
      },
      {
        title: "פעלים **מיוחדים**",
        table: [["make", "**made**"], ["write", "**written**"], ["speak", "**spoken**"], ["grow", "**grown**"]],
      },
      {
        title: "**דוגמאות**",
        examples: [["English **is spoken** in many countries.", "מדברים אנגלית בהרבה ארצות"], ["Oranges **are grown** in Israel.", "מגדלים תפוזים בישראל"]],
      },
      {
        title: "**ממה** זה עשוי?",
        lines: ["made of – עשוי מ־"],
        examples: [["The table **is made of** wood.", "השולחן עשוי מעץ"], ["Bottles **are made of** glass.", "בקבוקים עשויים מזכוכית"]],
      },
      {
        title: "שימו **לב**",
        lines: ["אסור לשכוח is / are"],
        compare: ["The room cleaned every day.", "The room **is** cleaned every day."],
      },
      {
        title: "**לסיכום**",
        table: [["דבר אחד", "**is** + פועל"], ["הרבה דברים", "**are** + פועל"], ["עשוי מ־", "**made of**"]],
      },
    ],
    quiz: [
      ["The shop ___ closed on Shabbat.", "החנות סגורה בשבת", ["is", "are"], 0, "דבר אחד – is"],
      ["Oranges are ___ in Israel.", "מגדלים תפוזים בישראל", ["grow", "grown", "growing"], 1, "grow – grown"],
      ["Many books ___ written in English.", "הרבה ספרים כתובים באנגלית", ["is", "are"], 1, "הרבה ספרים – are"],
      ["The chair is made ___ wood.", "הכיסא עשוי מעץ", ["at", "on", "of"], 2, "עשוי מ־ – made of"],
    ],
    discuss: ["ממה עשוי השולחן שלכם? ענו עם It is made of", "אילו שפות מדברים בישראל? ענו עם is spoken"],
  },
  {
    id: "passive-2",
    topic: "passive",
    name: "סביל",
    part: "was built / by",
    summary: "סביל בעבר – was / were – ומי עשה את זה עם by",
    vocab: [["was built", "נבנה"], ["was broken", "נשבר"], ["were eaten", "נאכלו"], ["was written", "נכתב"], ["by", "על ידי"], ["found", "נמצא (was found)"]],
    slides: [
      {
        title: "סביל **בעבר**",
        lines: ["משהו שנעשה פעם – was / were"],
        examples: [["The Temple **was built** in Jerusalem.", "בית המקדש נבנה בירושלים"]],
      },
      {
        title: "**was** / **were**",
        table: [["דבר אחד", "**was** built"], ["הרבה דברים", "**were** built"]],
      },
      {
        title: "**דוגמאות**",
        examples: [["The window **was broken** yesterday.", "החלון נשבר אתמול"], ["The cookies **were eaten**.", "העוגיות נאכלו"]],
      },
      {
        title: "**by** – על ידי",
        lines: ["רוצים להגיד מי עשה? מוסיפים by"],
        examples: [["The book **was written by** Dan.", "הספר נכתב על ידי דן"], ["The cake **was made by** my grandpa.", "העוגה הוכנה על ידי סבא שלי"]],
      },
      {
        title: "**הופכים** משפט",
        lines: ["הדבר שקרה לו – עובר להתחלה"],
        flow: true,
        examples: [["Dan **painted** the wall.", "דן צבע את הקיר"], ["The wall **was painted by** Dan.", "הקיר נצבע על ידי דן"]],
      },
      {
        title: "**עוד** פעלים מיוחדים",
        table: [["build", "**built**"], ["break", "**broken**"], ["find", "**found**"], ["give", "**given**"]],
      },
      {
        title: "שימו **לב**",
        lines: ["הרבה דברים – were"],
        compare: ["The cookies was eaten.", "The cookies **were** eaten."],
      },
      {
        title: "**לסיכום**",
        table: [["היום", "**is** / **are** + פועל"], ["בעבר", "**was** / **were** + פועל"], ["מי עשה", "**by**"]],
      },
    ],
    quiz: [
      ["The window ___ broken yesterday.", "החלון נשבר אתמול", ["was", "were"], 0, "דבר אחד – was"],
      ["The letters ___ written by Ben.", "המכתבים נכתבו על ידי בן", ["was", "were"], 1, "הרבה מכתבים – were"],
      ["The house was built ___ my grandpa.", "הבית נבנה על ידי סבא שלי", ["of", "by", "from"], 1, "על ידי – by"],
      ["The keys were ___ under the bed.", "המפתחות נמצאו מתחת למיטה", ["found", "find"], 0, "find – found"],
    ],
    discuss: ["מתי נבנה בית הספר שלכם? ענו עם It was built", "מה נשבר פעם אצלכם בבית? ענו עם was broken"],
  },
  {
    id: "reported-speech-1",
    topic: "reported-speech",
    name: "דיבור עקיף",
    part: "said that",
    summary: "מספרים מה מישהו אמר: Dan said that he was tired",
    vocab: [["said", "אמר"], ["said that", "אמר ש־"], ["was", "היה (am / is)"], ["were", "היו (are)"], ["would", "will אחרי said"], ["tired", "עייף"]],
    slides: [
      {
        title: "**מה** הוא אמר?",
        lines: ["מספרים מה מישהו אמר", "בלי מירכאות"],
        flow: true,
        examples: [["Dan: “I am tired.”", "דן: אני עייף"], ["Dan **said that** he **was** tired.", "דן אמר שהוא עייף"]],
      },
      {
        title: "**said that** – אמר ש־",
        lines: ["said that – אמר ש־"],
        examples: [["He **said that** he liked pizza.", "הוא אמר שהוא אוהב פיצה"]],
      },
      {
        title: "**I** הופך **he**",
        lines: ["מי שדיבר – הופך ל־he"],
        flow: true,
        examples: [["Tom: “I am hungry.”", "תום: אני רעב"], ["Tom said that **he** was hungry.", "תום אמר שהוא רעב"]],
      },
      {
        title: "**צעד** אחורה בזמן",
        lines: ["הפועל זז צעד אחד אחורה"],
        table: [["am / is", "**was**"], ["are", "**were**"], ["like", "**liked**"], ["will", "**would**"]],
      },
      {
        title: "**דוגמה**",
        flow: true,
        examples: [["Ben: “I like football.”", "בן: אני אוהב כדורגל"], ["Ben said that he **liked** football.", "בן אמר שהוא אוהב כדורגל"]],
      },
      {
        title: "**will** הופך **would**",
        flow: true,
        examples: [["Dad: “I will help you.”", "אבא: אני אעזור לך"], ["Dad said that he **would** help me.", "אבא אמר שהוא יעזור לי"]],
      },
      {
        title: "שימו **לב**",
        lines: ["אחרי said – זזים אחורה בזמן"],
        compare: ["He said that he is tired.", "He said that he **was** tired."],
      },
      {
        title: "**לסיכום**",
        table: [["אמר ש־", "**said that**"], ["I", "**he**"], ["am / is", "**was**"], ["will", "**would**"]],
      },
    ],
    quiz: [
      ["Dan said that he ___ happy.", "דן אמר שהוא שמח", ["is", "was"], 1, "אחרי said – was"],
      ["Tom: “I am cold.” Tom said that ___ was cold.", "תום אמר שקר לו", ["he", "I"], 0, "I הופך he"],
      ["Ben said that he ___ pizza.", "בן אמר שהוא אוהב פיצה", ["likes", "liked"], 1, "like – liked"],
      ["Dad said that he ___ help me.", "אבא אמר שהוא יעזור לי", ["will", "would"], 1, "will – would"],
    ],
    discuss: ["מה המורה אמר לכם היום? ענו עם The teacher said that", "טלפון שבור: אחד אומר משפט, והשני מספר עם He said that"],
  },
  {
    id: "reported-speech-2",
    topic: "reported-speech",
    name: "דיבור עקיף",
    part: "told / asked",
    summary: "מספרים על בקשה ועל שאלה – told me to / asked me",
    vocab: [["told me to", "אמר לי ל־"], ["told me not to", "אמר לי לא ל־"], ["asked", "שאל"], ["asked me if", "שאל אותי אם"], ["where I lived", "איפה אני גר"], ["sit down", "לשבת"]],
    slides: [
      {
        title: "**בקשה** – told me to",
        lines: ["told me to – אמר לי ל־"],
        flow: true,
        examples: [["Dad: “Sit down.”", "אבא: שב"], ["Dad **told me to** sit down.", "אבא אמר לי לשבת"]],
      },
      {
        title: "**דוגמאות**",
        examples: [["The teacher **told us to** open our books.", "המורה אמר לנו לפתוח את הספרים"], ["Grandpa **told me to** wear a coat.", "סבא אמר לי ללבוש מעיל"]],
      },
      {
        title: "**לא** לעשות",
        lines: ["told me not to – אמר לי לא ל־"],
        flow: true,
        examples: [["Dad: “Don't run.”", "אבא: אל תרוץ"], ["Dad told me **not to** run.", "אבא אמר לי לא לרוץ"]],
      },
      {
        title: "**שאלה** – asked",
        lines: ["asked – שאל"],
        flow: true,
        examples: [["Tom: “Where do you live?”", "תום: איפה אתה גר?"], ["Tom **asked** me where I **lived**.", "תום שאל אותי איפה אני גר"]],
      },
      {
        title: "**כן** או **לא** – if",
        lines: ["שאלה בלי מילת שאלה – if"],
        flow: true,
        examples: [["Ben: “Are you hungry?”", "בן: אתה רעב?"], ["Ben asked me **if** I **was** hungry.", "בן שאל אותי אם אני רעב"]],
      },
      {
        title: "**סדר** רגיל",
        lines: ["אחרי asked – לא הופכים את הסדר", "ואין סימן שאלה בסוף"],
        examples: [["He asked me where **I lived**.", "הוא שאל אותי איפה אני גר"]],
      },
      {
        title: "שימו **לב**",
        lines: ["אחרי asked – סדר רגיל"],
        compare: ["He asked where did I live?", "He asked where **I lived**."],
      },
      {
        title: "**לסיכום**",
        table: [["בקשה", "**told** me **to**"], ["לא לעשות", "told me **not to**"], ["שאלה", "**asked** me where / if"]],
      },
    ],
    quiz: [
      ["The teacher told us ___ be quiet.", "המורה אמר לנו לשמור על שקט", ["to", "that", "if"], 0, "בקשה – told us to"],
      ["Dad told me ___ to run.", "אבא אמר לי לא לרוץ", ["don't", "not"], 1, "לא לעשות – not to"],
      ["He asked me where I ___.", "הוא שאל אותי איפה אני גר", ["do live", "lived"], 1, "סדר רגיל, וזמן עבר"],
      ["Ben asked me ___ I was hungry.", "בן שאל אותי אם אני רעב", ["that", "to", "if"], 2, "שאלת כן או לא – if"],
    ],
    discuss: ["מה ההורים אמרו לכם לעשות הבוקר? ענו עם They told me to", "שאלו חבר שאלה, ואחר כך ספרו לכיתה עם I asked him"],
  },

  /* ---------- Stage 9: reading and understanding ---------- */
  {
    id: "bagrut-1",
    topic: "bagrut",
    name: "שאלות בגרות",
    part: "איך קוראים קטע",
    summary: "איך ניגשים לקטע – קודם השאלות, ואז מחפשים את התשובה בקטע.",
    vocab: [["question", "שאלה"], ["answer", "תשובה"], ["true", "נכון"], ["false", "לא נכון"], ["text", "קטע"], ["word", "מילה"]],
    slides: [
      {
        title: "**קודם** השאלות",
        lines: ["לפני שקוראים את הקטע", "קוראים את השאלות"],
        table: [["1", "קוראים את השאלות"], ["2", "קוראים את הקטע"], ["3", "מחפשים את התשובה"]],
      },
      {
        title: "מחפשים **מילים**",
        lines: ["מוצאים בשאלה מילה חשובה", "ומחפשים אותה בקטע"],
        flow: true,
        examples: [["Where does Tom **live**?", "השאלה – איפה טום גר?"], ["Tom **lives** in Haifa.", "בקטע – טום גר בחיפה"]],
      },
      {
        title: "שאלה **אמריקאית**",
        lines: ["בוחרים תשובה אחת", "קודם פוסלים תשובות שבטוח לא נכונות"],
        examples: [["a. Eilat   b. Haifa   c. Paris", "בוחרים את מה שכתוב בקטע"]],
      },
      {
        title: "**נכון** או **לא נכון**",
        lines: ["בודקים מה כתוב בקטע", "לא מה שאנחנו חושבים"],
        table: [["True", "נכון"], ["False", "לא נכון"]],
      },
      {
        title: "**לסיכום**",
        lines: ["התשובה תמיד נמצאת בקטע"],
        table: [["1", "השאלות"], ["2", "הקטע"], ["3", "התשובה"]],
      },
    ],
    quiz: [
      ["מה עושים קודם?", "", ["קוראים את השאלות", "כותבים תשובה"], 0, "קודם קוראים את השאלות"],
      ["True = ___", "", ["נכון", "לא נכון"], 0, "True – נכון"],
      ["False = ___", "", ["נכון", "לא נכון"], 1, "False – לא נכון"],
    ],
    discuss: ["מה עוזר לכם להבין קטע באנגלית?", "למה כדאי לקרוא קודם את השאלות?"],
  },
  {
    id: "bagrut-2",
    topic: "bagrut",
    name: "שאלות בגרות",
    part: "שאלה פתוחה ומשלימים משפט",
    summary: "עונים במשפט מלא ומשלימים משפט לפי הקטע.",
    vocab: [["complete", "להשלים"], ["sentence", "משפט"], ["because", "כי"], ["Why", "למה"], ["full answer", "תשובה מלאה"]],
    slides: [
      {
        title: "שאלה **פתוחה**",
        lines: ["כותבים את התשובה במילים", "ומשתמשים במילים מהשאלה"],
        flow: true,
        examples: [["**Why** is Tom happy?", "למה טום שמח?"], ["Tom is happy **because** it is his birthday.", "טום שמח כי זה יום ההולדת שלו"]],
      },
      {
        title: "**משפט מלא**",
        lines: ["לא עונים במילה אחת"],
        compare: ["Birthday.", "Tom is happy **because** it is his birthday."],
      },
      {
        title: "**Why** – עונים עם because",
        examples: [["**Why** did he go home?", "למה הוא הלך הביתה?"], ["He went home **because** he was tired.", "הוא הלך הביתה כי הוא היה עייף"]],
      },
      {
        title: "משלימים **משפט**",
        lines: ["מוצאים את המשפט בקטע", "ומעתיקים את החלק שחסר"],
        flow: true,
        examples: [["Tom has a ___ dog.", "במבחן"], ["Tom has a **big** dog.", "בקטע"]],
      },
      {
        title: "**לסיכום**",
        table: [["1", "קוראים את השאלה"], ["2", "מוצאים בקטע"], ["3", "כותבים משפט מלא"]],
      },
    ],
    quiz: [
      ["Why is Ben sad? Ben is sad ___ his dog is sick.", "", ["because", "but", "so"], 0, "על Why עונים עם because"],
      ["איך עונים על שאלה פתוחה?", "", ["במשפט מלא", "במילה אחת"], 0, "תמיד עונים במשפט מלא"],
      ["מאיפה לוקחים את התשובה?", "", ["מהקטע", "מהראש"], 0, "התשובה תמיד נמצאת בקטע"],
    ],
    discuss: ["ענו במשפט מלא: What is your favorite food", "ענו במשפט מלא עם because על השאלה Why do you like summer"],
  },
];
