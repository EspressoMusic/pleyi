/* Learn English — reading exams ("unseen" tests): a passage and questions of
   every kind, with a timer. The student answers everything, can go back and
   change answers, and sees the grade and the right answers only after
   handing the exam in (english-learning.js runs it). Loaded after
   english-reading.js; adds the exams as one topic in the reading group.

   Exam: { id, level, title, text: [paragraphs], glossary?: [{ en, he }], questions }
   - level 1 (easiest) to 4, the same scale as the reading passages; the time
     limit comes from MINUTES.
   - text: plain paragraphs, numbered on screen so questions can point to
     one ("in paragraph 2"). The page splits them into sentences at . ! or ?
     followed by a space and a capital letter, so the text uses no
     abbreviations like "Mr." or "a.m.".
   - questions:
       { type: "mc", q, he?, options: [...], answer }       answer is one of the options
       { type: "tf", q, he?, answer: true | false }
       { type: "open", q, lang: "he" | "en", answer, keywords, qEn?, answerEn? }
       { type: "complete", q, answer, keywords }            q has a ___ to complete, in English
       { type: "word", q, he?, para, answer, accept? }       a word from paragraph `para`
       { type: "multi", q, he?, options: [...], answers: [two of the options] }
       { type: "quote", q, he?, answer }                    the sentence to click in the
                                                            text, or a list of right ones
       { type: "sequence", q, he?, items: [...] }           events in the right order
     Levels 1–2 carry `he` (shown by the translation toggle), and their open
     questions are asked and answered in Hebrew; levels 3–4 are all English.
     keywords work as in english-reading.js: groups of words, and an answer
     is right when it has a word from every group.
   - Content rules: boys, men, animals and objects; no romance, and nothing
     that happens on Shabbat. */

(function () {
  const TOPICS = window.ENGLISH_TOPICS || [];

  const MINUTES = { 1: 15, 2: 20, 3: 30, 4: 40 };

  const EXAMS = [
    /* ── Level 1 ── */
    {
      id: "peanut",
      level: 1,
      title: "Peanut the Class Hamster",
      text: [
        "There is a hamster in our classroom. His name is Peanut. He is small and brown, and he has a short white tail. Peanut lives in a big cage near the window.",
        "Every morning, one student gives Peanut food and fresh water. Peanut likes seeds, carrots and apples. He sleeps in the day and plays at night. Sometimes he hides food in his cheeks!",
        "On Thursday, our teacher said, “Yoav, you can take Peanut home for the weekend.” I was very happy! At home, my little brother and I watched Peanut run on his wheel. On Sunday, I brought him back to school.",
      ],
      questions: [
        {
          type: "mc",
          q: "Where does Peanut live?",
          he: "איפה פינאט גר?",
          options: ["in a box under the table", "in a big cage near the window", "in the teacher's bag"],
          answer: "in a big cage near the window",
        },
        {
          type: "mc",
          q: "What does Peanut like to eat?",
          he: "מה פינאט אוהב לאכול?",
          options: ["bread and cheese", "fish and rice", "seeds, carrots and apples"],
          answer: "seeds, carrots and apples",
        },
        { type: "tf", q: "Peanut sleeps at night.", he: "פינאט ישן בלילה.", answer: false },
        { type: "tf", q: "Peanut has a white tail.", he: "לפינאט יש זנב לבן.", answer: true },
        {
          type: "word",
          q: "Find the word in paragraph 2 that means “מים”.",
          he: "מצאו בפסקה 2 את המילה שפירושה „מים”.",
          para: 2,
          answer: "water",
        },
        {
          type: "mc",
          q: "Who said that Yoav can take Peanut home?",
          he: "מי אמר שיואב יכול לקחת את פינאט הביתה?",
          options: ["the teacher", "his little brother", "his dad"],
          answer: "the teacher",
        },
        {
          type: "sequence",
          q: "Put the events in the right order.",
          he: "סדרו את האירועים לפי הסדר שבו קרו.",
          items: ["The teacher spoke to Yoav.", "Yoav and his brother watched Peanut run.", "Yoav brought Peanut back to school."],
        },
        {
          type: "open",
          lang: "he",
          q: "מה פינאט עושה לפעמים עם האוכל שלו?",
          qEn: "What does Peanut sometimes do with his food?",
          answer: "הוא מחביא אותו בלחיים.",
          answerEn: "He hides it in his cheeks.",
          keywords: [["לחי", "מחביא", "מסתיר", "החביא", "cheek", "hide", "hid"]],
        },
      ],
    },
    {
      id: "grandpa-boat",
      level: 1,
      title: "Fishing with Grandpa",
      text: [
        "My name is Eitan. My grandpa lives in Tiberias, near the Sea of Galilee. Grandpa is seventy years old, but he is very strong. In the summer, I visit him for a week.",
        "Grandpa has an old blue boat. Every morning, we get up at five o'clock and go out on the water. The sun is not hot yet, and the lake is quiet. Grandpa gives me a fishing rod, and we wait.",
        "Yesterday, I caught my first fish! It was big and silver. I wanted to take a photo, but the fish jumped back into the water. Grandpa laughed and said, “Next time, hold it with two hands.”",
      ],
      questions: [
        {
          type: "mc",
          q: "Where does Eitan's grandpa live?",
          he: "איפה גר סבא של איתן?",
          options: ["in Eilat", "in Tiberias", "in Haifa"],
          answer: "in Tiberias",
        },
        {
          type: "mc",
          q: "When does Eitan visit his grandpa?",
          he: "מתי איתן מבקר את סבא שלו?",
          options: ["in the summer", "in the winter", "on his birthday"],
          answer: "in the summer",
        },
        { type: "tf", q: "Grandpa's boat is new.", he: "הסירה של סבא חדשה.", answer: false },
        {
          type: "mc",
          q: "What time do they get up?",
          he: "באיזו שעה הם קמים?",
          options: ["at seven o'clock", "at ten o'clock", "at five o'clock"],
          answer: "at five o'clock",
        },
        {
          type: "word",
          q: "Find the word in paragraph 2 that means “שקט”.",
          he: "מצאו בפסקה 2 את המילה שפירושה „שקט”.",
          para: 2,
          answer: "quiet",
        },
        { type: "tf", q: "The fish was big and silver.", he: "הדג היה גדול וכסוף.", answer: true },
        {
          type: "sequence",
          q: "Put the events in the right order.",
          he: "סדרו את האירועים לפי הסדר שבו קרו.",
          items: ["Eitan caught a big fish.", "The fish jumped back into the water.", "Grandpa laughed."],
        },
        {
          type: "open",
          lang: "he",
          q: "למה איתן לא צילם את הדג?",
          qEn: "Why didn't Eitan take a photo of the fish?",
          answer: "כי הדג קפץ בחזרה למים.",
          answerEn: "Because the fish jumped back into the water.",
          keywords: [["קפץ", "ברח", "חזר", "jump", "water", "back"]],
        },
      ],
    },
    {
      id: "lost-kite",
      level: 1,
      title: "The Lost Kite",
      text: [
        "Ari has a new kite. It is red and yellow, and it looks like a big bird. After school, Ari and his dad went to the park to fly it.",
        "It was a windy day. The kite went up, up, up into the sky. Suddenly, the string broke! The kite flew away and fell into a tall tree. Ari was very sad.",
        "Then an old man came with a long ladder. He climbed up and got the kite down. “Thank you!” said Ari. The man smiled. “I had a kite like this when I was a boy,” he said. The next day, Ari flew his kite again, and this time he held the string very tight.",
      ],
      questions: [
        {
          type: "mc",
          q: "What does the kite look like?",
          he: "למה העפיפון דומה?",
          options: ["a big fish", "a big bird", "a red car"],
          answer: "a big bird",
        },
        {
          type: "mc",
          q: "When did Ari and his dad go to the park?",
          he: "מתי ארי ואבא שלו הלכו לפארק?",
          options: ["after school", "early in the morning", "at night"],
          answer: "after school",
        },
        { type: "tf", q: "It was a windy day.", he: "זה היה יום עם הרבה רוח.", answer: true },
        { type: "tf", q: "The kite fell into the lake.", he: "העפיפון נפל לאגם.", answer: false },
        {
          type: "word",
          q: "Find the word in paragraph 2 that means “עצוב”.",
          he: "מצאו בפסקה 2 את המילה שפירושה „עצוב”.",
          para: 2,
          answer: "sad",
        },
        {
          type: "mc",
          q: "Who got the kite down?",
          he: "מי הוריד את העפיפון?",
          options: ["Ari's dad", "a teacher", "an old man"],
          answer: "an old man",
        },
        {
          type: "sequence",
          q: "Put the events in the right order.",
          he: "סדרו את האירועים לפי הסדר שבו קרו.",
          items: ["The string broke.", "The kite fell into a tree.", "A man climbed up a ladder.", "Ari flew his kite again."],
        },
        {
          type: "open",
          lang: "he",
          q: "מה האיש סיפר לארי?",
          qEn: "What did the man tell Ari?",
          answer: "שהיה לו עפיפון כזה כשהיה ילד.",
          answerEn: "He had a kite like this when he was a boy.",
          keywords: [["ילד", "קטן", "צעיר", "boy", "young", "child", "kid"]],
        },
      ],
    },
    {
      id: "food-truck",
      level: 1,
      title: "Dad's Food Truck",
      text: [
        "My dad has a food truck. It is white and green, and it says “Falafel King” on the side. Every day, Dad drives the truck to the beach in Tel Aviv.",
        "Dad makes falafel, salads and hot chips. People come from far away to eat his falafel. They say it is the best in the city.",
        "On Fridays, I help Dad in the truck. I cut tomatoes and cucumbers, and I give people napkins. At two o'clock, we close the truck and go home to get ready for Shabbat. Dad always gives me the last falafel. It is my favorite part of the day!",
      ],
      questions: [
        {
          type: "mc",
          q: "Where does Dad drive the truck every day?",
          he: "לאן אבא נוסע עם המשאית כל יום?",
          options: ["to the school", "to the beach", "to the airport"],
          answer: "to the beach",
        },
        {
          type: "mc",
          q: "What color is the truck?",
          he: "באיזה צבע המשאית?",
          options: ["white and green", "red and blue", "yellow and black"],
          answer: "white and green",
        },
        { type: "tf", q: "People say Dad's falafel is the best in the city.", he: "אנשים אומרים שהפלאפל של אבא הוא הכי טוב בעיר.", answer: true },
        {
          type: "word",
          q: "Find the word in paragraph 3 that means “עגבניות”.",
          he: "מצאו בפסקה 3 את המילה שפירושה „עגבניות”.",
          para: 3,
          answer: "tomatoes",
        },
        { type: "tf", q: "The writer helps Dad every day.", he: "הכותב עוזר לאבא כל יום.", answer: false },
        {
          type: "mc",
          q: "When do they close the truck on Fridays?",
          he: "מתי הם סוגרים את המשאית בימי שישי?",
          options: ["at six o'clock", "at ten o'clock", "at two o'clock"],
          answer: "at two o'clock",
        },
        {
          type: "sequence",
          q: "Put the events of a Friday in the right order.",
          he: "סדרו את האירועים של יום שישי לפי הסדר.",
          items: ["Dad drives the truck to the beach.", "The writer cuts tomatoes and cucumbers.", "They close the truck and go home."],
        },
        {
          type: "open",
          lang: "he",
          q: "מה החלק הכי אהוב על הכותב ביום?",
          qEn: "What is the writer's favorite part of the day?",
          answer: "כשאבא נותן לו את הפלאפל האחרון.",
          answerEn: "When Dad gives him the last falafel.",
          keywords: [["אחרון", "last"]],
        },
      ],
    },

    /* ── Level 2 ── */
    {
      id: "robot-club",
      level: 2,
      title: "The Robot Club",
      text: [
        "Every Tuesday after school, twelve boys meet in the science room. They are the members of the Robot Club. This year, the club had a big goal: to build a robot that can help the planet.",
        "The boys talked for a long time. Then Amir had an idea. “Many people throw plastic and paper into the same bin,” he said. “Our robot can sort them!” Everyone liked the idea, and their teacher said it was a great plan.",
        "Building the robot was not easy. The first robot was too slow. The second one could not tell the difference between plastic and paper. Some days, the boys wanted to stop. But the boys did not give up. They worked for three months and tried again and again.",
        "In June, the club took the robot to a national competition in Haifa. Their robot, Sorty, sorted fifty pieces of rubbish in two minutes. It did not win first place, but the judges gave the boys a special prize for the best idea. “We learned that mistakes are part of the work,” said Amir.",
      ],
      questions: [
        {
          type: "mc",
          q: "When does the Robot Club meet?",
          he: "מתי נפגש מועדון הרובוטים?",
          options: ["every morning before school", "every Tuesday after school", "every Friday"],
          answer: "every Tuesday after school",
        },
        {
          type: "mc",
          q: "What was Amir's idea?",
          he: "מה היה הרעיון של אמיר?",
          options: ["a robot that cleans the classroom", "a robot that plays football", "a robot that sorts plastic and paper"],
          answer: "a robot that sorts plastic and paper",
        },
        { type: "tf", q: "The first robot worked very well.", he: "הרובוט הראשון עבד טוב מאוד.", answer: false },
        {
          type: "word",
          q: "Find the word in paragraph 4 that means “תחרות”.",
          he: "מצאו בפסקה 4 את המילה שפירושה „תחרות”.",
          para: 4,
          answer: "competition",
        },
        {
          type: "multi",
          q: "Which TWO sentences are true according to the text?",
          he: "אילו שני משפטים נכונים לפי הטקסט?",
          options: ["The boys worked on the robot for three months.", "The robot won first place.", "The competition was in Haifa.", "The club has twenty members."],
          answers: ["The boys worked on the robot for three months.", "The competition was in Haifa."],
        },
        {
          type: "quote",
          q: "Which sentence shows that the boys didn't stop when things went wrong?",
          he: "איזה משפט מראה שהבנים לא הפסיקו כשדברים לא הצליחו?",
          answer: "But the boys did not give up.",
        },
        { type: "tf", q: "The judges gave the boys a special prize.", he: "השופטים נתנו לבנים פרס מיוחד.", answer: true },
        {
          type: "mc",
          q: "How many pieces of rubbish did Sorty sort in two minutes?",
          he: "כמה פריטי פסולת מיין סורטי בשתי דקות?",
          options: ["fifteen", "twelve", "fifty"],
          answer: "fifty",
        },
        {
          type: "open",
          lang: "he",
          q: "מה אמיר למד מהעבודה על הרובוט?",
          qEn: "What did Amir learn from working on the robot?",
          answer: "שטעויות הן חלק מהעבודה.",
          answerEn: "That mistakes are part of the work.",
          keywords: [["טעו", "טעות", "mistake", "wrong"]],
        },
      ],
    },
    {
      id: "storks",
      level: 2,
      title: "The Storks Are Coming",
      glossary: [
        { en: "migration", he: "נדידה" },
        { en: "beak", he: "מקור" },
        { en: "continents", he: "יבשות" },
      ],
      text: [
        "Every autumn, something amazing happens in the sky over Israel. Millions of birds fly over the country on their way from Europe to Africa. In the spring, they fly back north again. This long trip is called migration.",
        "One of these birds is the white stork. Storks are big birds with long red legs and a long red beak. They cannot fly for many hours by moving their wings, because it uses too much energy. Instead, they look for warm air that goes up, and they ride on it.",
        "Last October, Noam and his grandfather went to the Hula Valley to watch the birds. They got up very early and sat quietly near the lake. At first, they saw only a few ducks. Then Grandpa pointed at the sky. Hundreds of storks were flying over them in a big circle!",
        "“Why do they fly over Israel?” asked Noam. Grandpa explained that Israel is like a bridge between three continents: Europe, Asia and Africa. The birds stop here to rest and eat before the long trip over the desert. Noam took many photos. “This is better than any movie,” he said.",
      ],
      questions: [
        {
          type: "mc",
          q: "What is migration?",
          he: "מה זו נדידה?",
          options: ["a kind of big bird", "a long trip that birds make every year", "a lake in the north"],
          answer: "a long trip that birds make every year",
        },
        {
          type: "mc",
          q: "Why don't storks fly for many hours by moving their wings?",
          he: "למה החסידות לא עפות שעות רבות בעזרת תנועת הכנפיים?",
          options: ["Their wings are too short.", "It uses too much energy.", "They are afraid of the wind."],
          answer: "It uses too much energy.",
        },
        { type: "tf", q: "Storks have long red legs.", he: "לחסידות יש רגליים ארוכות ואדומות.", answer: true },
        {
          type: "word",
          q: "Find the word in paragraph 3 that means “הצביע”.",
          he: "מצאו בפסקה 3 את המילה שפירושה „הצביע”.",
          para: 3,
          answer: "pointed",
        },
        { type: "tf", q: "Noam and his grandfather went to the Hula Valley in the spring.", he: "נועם וסבא שלו נסעו לעמק החולה באביב.", answer: false },
        {
          type: "quote",
          q: "Which sentence tells us where the birds fly in the autumn?",
          he: "איזה משפט מספר לאן הציפורים עפות בסתיו?",
          answer: "Millions of birds fly over the country on their way from Europe to Africa.",
        },
        {
          type: "multi",
          q: "Which TWO things did Noam and Grandpa do at the Hula Valley?",
          he: "אילו שני דברים עשו נועם וסבא בעמק החולה?",
          options: ["They got up very early.", "They fed the storks.", "They sat near the lake.", "They swam in the lake."],
          answers: ["They got up very early.", "They sat near the lake."],
        },
        {
          type: "mc",
          q: "According to Grandpa, why do the birds stop in Israel?",
          he: "לפי סבא, למה הציפורים עוצרות בישראל?",
          options: ["to build their nests", "to rest and eat", "to meet other birds"],
          answer: "to rest and eat",
        },
        {
          type: "open",
          lang: "he",
          q: "למה ישראל דומה ל„גשר”, לפי סבא?",
          qEn: "Why is Israel like a “bridge”, according to Grandpa?",
          answer: "כי היא נמצאת בין שלוש יבשות: אירופה, אסיה ואפריקה.",
          answerEn: "Because it is between three continents: Europe, Asia and Africa.",
          keywords: [["יבש", "שלוש", "אירופה", "אפריקה", "אסיה", "continent", "three", "europe", "africa", "asia"]],
        },
      ],
    },
    {
      id: "lighthouse",
      level: 2,
      title: "The Lighthouse Keeper",
      glossary: [
        { en: "lighthouse", he: "מגדלור" },
        { en: "keeper", he: "שומר" },
        { en: "coast", he: "חוף" },
      ],
      text: [
        "On a small hill above the sea stands an old white lighthouse. For forty years, a man named Shimon took care of it. He was the lighthouse keeper.",
        "In the past, lighthouses were very important. There was no GPS, and ships could not see the rocks near the coast at night. The strong light at the top of the lighthouse warned the ships and showed them the way. Every evening, Shimon climbed the 120 steps to the top and turned on the light. In stormy weather, he stayed awake all night.",
        "Today, the light turns on by itself, and the lighthouse does not need a keeper. But Shimon still lives in the little house next to it. Last week, our class visited him. He showed us the huge lamp and told us stories about storms and ships. We also saw his old notebook, where he wrote about every ship he saw.",
        "“Were you ever lonely?” I asked him. Shimon smiled. “Never,” he said. “I had the sea, the birds and my books. And every ship that passed safely was like a friend.”",
      ],
      questions: [
        {
          type: "mc",
          q: "How long did Shimon take care of the lighthouse?",
          he: "כמה זמן שמעון שמר על המגדלור?",
          options: ["for four years", "for fourteen years", "for forty years"],
          answer: "for forty years",
        },
        {
          type: "mc",
          q: "Why were lighthouses important in the past?",
          he: "למה מגדלורים היו חשובים בעבר?",
          options: ["They showed ships the way at night.", "They were homes for sailors.", "They sold fish to the city."],
          answer: "They showed ships the way at night.",
        },
        { type: "tf", q: "Shimon climbed 120 steps every evening.", he: "שמעון טיפס 120 מדרגות בכל ערב.", answer: true },
        {
          type: "quote",
          q: "Which sentence shows that Shimon worked very hard in bad weather?",
          he: "איזה משפט מראה ששמעון עבד קשה מאוד במזג אוויר רע?",
          answer: "In stormy weather, he stayed awake all night.",
        },
        { type: "tf", q: "Today, Shimon turns on the light every evening.", he: "היום שמעון מדליק את האור בכל ערב.", answer: false },
        {
          type: "word",
          q: "Find the word in paragraph 3 that means “ענק, גדול מאוד”.",
          he: "מצאו בפסקה 3 את המילה שפירושה „ענק, גדול מאוד”.",
          para: 3,
          answer: "huge",
        },
        {
          type: "multi",
          q: "Which TWO things did the class see at Shimon's place?",
          he: "אילו שני דברים ראתה הכיתה אצל שמעון?",
          options: ["the huge lamp", "a new ship", "his old notebook", "a map of the sea"],
          answers: ["the huge lamp", "his old notebook"],
        },
        {
          type: "mc",
          q: "How did Shimon feel about the ships that passed safely?",
          he: "מה שמעון הרגיש כלפי האוניות שעברו בשלום?",
          options: ["He was afraid of them.", "Each one was like a friend.", "He didn't care about them."],
          answer: "Each one was like a friend.",
        },
        {
          type: "open",
          lang: "he",
          q: "האם שמעון הרגיש בודד? הסבירו.",
          qEn: "Did Shimon feel lonely? Explain.",
          answer: "לא. היו לו הים, הציפורים והספרים שלו.",
          answerEn: "No. He had the sea, the birds and his books.",
          keywords: [["הים", "ציפור", "ספר", "חבר", "sea", "bird", "book", "friend", "never"]],
        },
      ],
    },
    {
      id: "food-bank",
      level: 2,
      title: "Boxes of Kindness",
      glossary: [
        { en: "food bank", he: "בנק מזון" },
        { en: "packing", he: "אריזה" },
        { en: "manager", he: "מנהל" },
      ],
      text: [
        "Two weeks before Passover, the students of class 6B did something special. Instead of a regular school day, they went to a food bank in their city.",
        "A food bank collects food from shops, factories and people, and gives it to families who need help. Before the holidays, many families cannot buy everything they need. Some people are sick, and some don't have work. The food bank tries to make sure that every family can have a holiday meal.",
        "The students worked in a huge warehouse. Some of them sorted cans and bottles. Others checked the dates on the packages. Yonatan and Itai were in charge of packing. In each box, they put rice, oil, matzot, vegetables, fruit and a bottle of grape juice. By two o'clock, they had packed three hundred boxes!",
        "At the end of the day, the manager of the food bank thanked the class. “Tomorrow, these boxes will go to three hundred families,” he said. On the bus back to school, Itai was tired but happy. “I thought it would be boring,” he told Yonatan, “but it was the best day of the year.”",
      ],
      questions: [
        {
          type: "mc",
          q: "When did class 6B go to the food bank?",
          he: "מתי כיתה ו'2 הלכה לבנק המזון?",
          options: ["two weeks before Passover", "on the first day of Passover", "two weeks after Passover"],
          answer: "two weeks before Passover",
        },
        {
          type: "mc",
          q: "What does a food bank do?",
          he: "מה עושה בנק מזון?",
          options: ["It sells cheap food in shops.", "It collects food and gives it to families who need help.", "It teaches children how to cook."],
          answer: "It collects food and gives it to families who need help.",
        },
        { type: "tf", q: "All the students packed boxes.", he: "כל התלמידים ארזו קופסאות.", answer: false },
        {
          type: "word",
          q: "Find the word in paragraph 3 that means “מחסן”.",
          he: "מצאו בפסקה 3 את המילה שפירושה „מחסן”.",
          para: 3,
          answer: "warehouse",
        },
        {
          type: "multi",
          q: "Which TWO things were in each box?",
          he: "אילו שני דברים היו בכל קופסה?",
          options: ["rice", "chocolate", "matzot", "bread"],
          answers: ["rice", "matzot"],
        },
        {
          type: "quote",
          q: "Which sentence shows how much work Yonatan and Itai did?",
          he: "איזה משפט מראה כמה עבודה עשו יונתן ואיתי?",
          answer: "By two o'clock, they had packed three hundred boxes!",
        },
        { type: "tf", q: "The boxes will go to three hundred families.", he: "הקופסאות יגיעו לשלוש מאות משפחות.", answer: true },
        {
          type: "mc",
          q: "How did Itai feel on the bus back to school?",
          he: "איך איתי הרגיש באוטובוס בדרך חזרה לבית הספר?",
          options: ["bored and sad", "tired but happy", "angry"],
          answer: "tired but happy",
        },
        {
          type: "open",
          lang: "he",
          q: "מה איתי חשב לפני היום הזה, ומה הוא חשב בסופו?",
          qEn: "What did Itai think before the day, and what did he think at the end?",
          answer: "הוא חשב שיהיה משעמם, אבל זה היה היום הכי טוב בשנה.",
          answerEn: "He thought it would be boring, but it was the best day of the year.",
          keywords: [
            ["משעמם", "שעמום", "בורינג", "boring", "bored"],
            ["טוב", "מעולה", "כיף", "best", "good", "great", "fun"],
          ],
        },
      ],
    },

    /* ── Level 3 ── */
    {
      id: "forest-man",
      level: 3,
      title: "The Man Who Planted a Forest",
      glossary: [
        { en: "sandbar", he: "אי חול בנהר" },
        { en: "shade", he: "צל" },
        { en: "hectare", he: "הקטר (10 דונם)" },
      ],
      text: [
        "In 1979, a sixteen-year-old boy named Jadav Payeng found something terrible on a sandbar in the Brahmaputra River in India. After a big flood, hundreds of snakes had died on the hot sand. There were no trees to give them shade. Jadav was shocked. He understood that without trees, animals could not survive there.",
        "Jadav decided to do something about it. He planted twenty bamboo plants on the sandbar. Nobody helped him, and many people thought he was wasting his time. Some people even laughed at him. But every day, he came back to water his plants and to plant new ones. He carried water from the river by hand, and he brought red ants from his village to make the soil better.",
        "Year after year, the small trees grew, and Jadav kept planting. He did all this work alone, for more than thirty years. Slowly, the empty sandbar became a forest. Today, the forest covers more than 500 hectares, which is bigger than Central Park in New York. It is called the Molai Forest, after Jadav's nickname.",
        "The forest is now home to many animals. Deer, rabbits, monkeys and many kinds of birds live there. Even elephants visit it every year, and tigers and rhinos have been seen there too. The forest also protects the island from floods, because the roots of the trees hold the soil. Scientists who visited the forest were amazed that one man had created it.",
        "In 2015, the government of India gave Jadav one of the country's highest awards. People now call him “the Forest Man of India.” When people ask him why he did it, his answer is simple: “If we cut the trees, we will not survive. Nature gives us everything, so we must protect it.”",
      ],
      questions: [
        {
          type: "mc",
          q: "What did Jadav find on the sandbar in 1979?",
          options: ["A group of elephants.", "Many snakes that had died in the heat.", "A forest that was burning.", "A boat that was stuck in the sand."],
          answer: "Many snakes that had died in the heat.",
        },
        {
          type: "mc",
          q: "How did Jadav water his plants?",
          options: ["He used a big machine.", "He waited for the rain.", "His friends helped him.", "He carried water from the river by hand."],
          answer: "He carried water from the river by hand.",
        },
        { type: "word", q: "Find a word in paragraph 1 that means “very surprised and upset”.", para: 1, answer: "shocked" },
        { type: "tf", q: "Jadav got a lot of help from the people in his village.", answer: false },
        {
          type: "quote",
          q: "Which sentence shows that Jadav's forest is very big?",
          answer: "Today, the forest covers more than 500 hectares, which is bigger than Central Park in New York.",
        },
        {
          type: "multi",
          q: "Which TWO animals live in or visit the forest, according to paragraph 4?",
          options: ["elephants", "camels", "monkeys", "bears"],
          answers: ["elephants", "monkeys"],
        },
        {
          type: "complete",
          q: "Complete the sentence: The forest protects the island from floods because ___",
          answer: "the roots of the trees hold the soil.",
          keywords: [["root", "hold", "soil"]],
        },
        {
          type: "mc",
          q: "What is the Molai Forest named after?",
          options: ["a river in India", "a famous scientist", "Jadav's nickname", "a kind of bamboo"],
          answer: "Jadav's nickname",
        },
        {
          type: "open",
          lang: "en",
          q: "Why did Jadav start planting trees? Give one reason.",
          answer: "Because he saw that without trees, the animals could not survive.",
          keywords: [["animal", "snake", "surviv", "shade", "die", "dead", "live"]],
        },
        {
          type: "open",
          lang: "en",
          q: "What does Jadav believe about nature? Write one idea.",
          answer: "Nature gives us everything, so we must protect it.",
          keywords: [["protect", "everything", "surviv", "cut", "save", "take care", "need"]],
        },
      ],
    },
    {
      id: "bicycle",
      level: 3,
      title: "Two Wheels Through History",
      glossary: [
        { en: "inventor", he: "ממציא" },
        { en: "uncomfortable", he: "לא נוח" },
        { en: "chain", he: "שרשרת" },
      ],
      text: [
        "Today, there are more than a billion bicycles in the world. It is one of the most popular ways to travel. But the first bicycle looked very different from the one you ride today. In fact, it did not even have pedals!",
        "The first bicycle was built in 1817 by a German inventor named Karl Drais. It was made of wood, and it had two wheels and a seat. To move, the rider sat on the seat and pushed the ground with his feet, like a child on a balance bike. People called it the “running machine.”",
        "In the 1860s, inventors in France added pedals to the front wheel. Now riders could keep their feet off the ground. However, these bicycles were very uncomfortable. They had wooden wheels with iron around them, and every stone on the road shook the rider. That is why people gave them the nickname “boneshakers.”",
        "Next came the penny-farthing, a bicycle with a huge front wheel and a tiny back wheel. The big wheel made it fast, but it was also dangerous. The rider sat high above the ground, and if the bicycle hit a rock, he could fall on his head.",
        "Finally, in 1885, an English inventor named John Kemp Starley built the “safety bicycle.” It had two wheels of the same size and a chain that connected the pedals to the back wheel. It was safe, comfortable and easy to ride. Soon, millions of people were riding bicycles to work and to school. Almost every bicycle today is based on his design.",
        "Bicycles are still changing. Today there are electric bicycles, folding bicycles and bicycles made of very light materials. But the idea is the same as it was two hundred years ago: two wheels, one rider, and the joy of moving forward.",
      ],
      questions: [
        {
          type: "mc",
          q: "What was special about the first bicycle?",
          options: ["It had three wheels.", "It was made of metal.", "It did not have pedals.", "It had an engine."],
          answer: "It did not have pedals.",
        },
        {
          type: "mc",
          q: "Why were the bicycles of the 1860s called “boneshakers”?",
          options: ["They were made of bones.", "Every stone on the road shook the rider.", "They were very fast.", "They had huge front wheels."],
          answer: "Every stone on the road shook the rider.",
        },
        { type: "word", q: "Find a word in paragraph 4 that means “very small”.", para: 4, answer: "tiny" },
        { type: "tf", q: "The penny-farthing was fast but dangerous.", answer: true },
        {
          type: "quote",
          q: "Which sentence explains how riders moved the first bicycle?",
          answer: "To move, the rider sat on the seat and pushed the ground with his feet, like a child on a balance bike.",
        },
        {
          type: "multi",
          q: "Which TWO facts about the safety bicycle are true?",
          options: ["Its wheels were the same size.", "It had a huge front wheel.", "It had a chain.", "It was made only of wood."],
          answers: ["Its wheels were the same size.", "It had a chain."],
        },
        {
          type: "complete",
          q: "Complete the sentence: The penny-farthing was dangerous because ___",
          answer: "the rider sat high above the ground and could fall on his head.",
          keywords: [["high", "fall", "rock", "head"]],
        },
        {
          type: "mc",
          q: "What is the main idea of the text?",
          options: [
            "Karl Drais was the most important inventor in history.",
            "Riding a bicycle is dangerous.",
            "The bicycle changed a lot until it became the bicycle we know today.",
            "Electric bicycles are better than regular ones.",
          ],
          answer: "The bicycle changed a lot until it became the bicycle we know today.",
        },
        {
          type: "open",
          lang: "en",
          q: "Who built the first bicycle, and when?",
          answer: "Karl Drais built it in 1817.",
          keywords: [["drais", "karl"], ["1817"]],
        },
        {
          type: "open",
          lang: "en",
          q: "According to the last paragraph, what has not changed in two hundred years?",
          answer: "The idea: two wheels, one rider and the joy of moving forward.",
          keywords: [["wheel", "rider", "joy", "idea", "forward"]],
        },
      ],
    },
    {
      id: "working-dogs",
      level: 3,
      title: "Dogs with Important Jobs",
      glossary: [
        { en: "volunteer", he: "מתנדב" },
        { en: "search and rescue", he: "חיפוש והצלה" },
        { en: "earthquake", he: "רעידת אדמה" },
      ],
      text: [
        "Most dogs are pets. They play, sleep and wait for their owners to come home. But some dogs have real jobs, and they work very hard to help people.",
        "Guide dogs help people who cannot see. A guide dog walks next to its owner and helps him cross streets, find doors and stay away from dangerous places. When a guide dog is working, it must not play or eat food from the street. That is why people should never pet a guide dog without asking first.",
        "Training a guide dog takes a long time. When the dog is a small puppy, it lives with a volunteer family for about a year. The family teaches the puppy to be calm around people, cars and noise. After that, the dog goes to a special school, where trainers work with it for several more months. Not every dog passes the training. Only the calmest and smartest dogs become guide dogs.",
        "Other dogs work in search and rescue. After an earthquake, these dogs can find people under buildings that have fallen down. A dog's nose is thousands of times stronger than a human's, so it can smell a person even under many layers of stone. The dogs are trained to bark when they find someone. Rescue dogs and their trainers often travel to other countries to help after a disaster.",
        "There are also therapy dogs, which visit hospitals and old people's homes. They don't do anything special. They just sit with people and let them pet them. But doctors say that this simple contact can make patients feel calmer and happier.",
        "Whether they guide, search or comfort, working dogs show us that a dog can be much more than a pet. For many people, a dog is a helper, a hero and a best friend.",
      ],
      questions: [
        {
          type: "mc",
          q: "What is the text mainly about?",
          options: ["how to choose a pet dog", "dogs that help people in different ways", "why dogs like to play", "the history of dogs"],
          answer: "dogs that help people in different ways",
        },
        {
          type: "mc",
          q: "Why should people not pet a guide dog without asking first?",
          options: ["Guide dogs bite.", "Guide dogs are often sick.", "The owner doesn't like people.", "The dog may be working."],
          answer: "The dog may be working.",
        },
        { type: "word", q: "Find a word in paragraph 3 that means “quiet and relaxed”.", para: 3, answer: "calm" },
        { type: "tf", q: "Every dog that starts the training becomes a guide dog.", answer: false },
        {
          type: "quote",
          q: "Which sentence explains why search and rescue dogs can find people under buildings?",
          answer: "A dog's nose is thousands of times stronger than a human's, so it can smell a person even under many layers of stone.",
        },
        {
          type: "multi",
          q: "Which TWO things does a guide dog help its owner do?",
          options: ["cross streets", "read books", "find doors", "cook food"],
          answers: ["cross streets", "find doors"],
        },
        {
          type: "complete",
          q: "Complete the sentence: When a guide dog is a small puppy, it lives with ___",
          answer: "a volunteer family for about a year.",
          keywords: [["volunteer", "family"]],
        },
        {
          type: "mc",
          q: "Where do therapy dogs go?",
          options: ["to schools for dogs", "to buildings after earthquakes", "to hospitals and old people's homes", "to busy streets"],
          answer: "to hospitals and old people's homes",
        },
        {
          type: "open",
          lang: "en",
          q: "What does the volunteer family teach the puppy?",
          answer: "To be calm around people, cars and noise.",
          keywords: [["calm", "quiet", "relax"]],
        },
        {
          type: "open",
          lang: "en",
          q: "How can therapy dogs help patients, according to doctors?",
          answer: "They can make patients feel calmer and happier.",
          keywords: [["calm", "happ", "better", "relax", "good"]],
        },
      ],
    },
    {
      id: "hezekiah-tunnel",
      level: 3,
      title: "The Tunnel Under the City of David",
      glossary: [
        { en: "spring", he: "מעיין" },
        { en: "enemy", he: "אויב" },
        { en: "inscription", he: "כתובת חקוקה" },
      ],
      text: [
        "About 2,700 years ago, Jerusalem was in great danger. The Assyrian army, one of the strongest armies in the world at that time, was coming to attack the city. King Hezekiah knew that if the enemy surrounded Jerusalem, the people inside would need water to survive.",
        "The city's main source of water was the Gihon Spring. The problem was that the spring was outside the city walls. So Hezekiah decided on a bold plan: to dig a tunnel through the rock that would bring the water from the spring into the city. That way, the people of Jerusalem would have water, and the enemy would not.",
        "The workers had no machines. They dug with simple tools, working by the light of oil lamps. To finish faster, two teams started digging from the two ends of the tunnel and tried to meet in the middle. This was very difficult, because they could not see each other through the rock. In some places, the tunnel turns and twists, and nobody knows exactly how the teams found their way.",
        "In the end, they succeeded. The tunnel is 533 meters long, and the water still flows through it today. The Bible also tells about this tunnel, in the Book of Kings. In 1880, a boy who was playing in the tunnel discovered an inscription on the wall. It describes the moment when the two teams heard each other's voices through the rock and broke through to meet. This inscription is one of the oldest Hebrew writings ever found.",
        "Today, visitors can walk through Hezekiah's Tunnel in the City of David. The tunnel is narrow and dark, and in some places the water reaches your knees. The walk takes about half an hour. Bring a flashlight and shoes that can get wet, and imagine the workers who dug it with their hands, almost three thousand years ago.",
      ],
      questions: [
        {
          type: "mc",
          q: "Why was Jerusalem in danger?",
          options: ["There was a big earthquake.", "A strong army was coming to attack it.", "The spring was dry.", "The city walls fell down."],
          answer: "A strong army was coming to attack it.",
        },
        {
          type: "mc",
          q: "What was the problem with the Gihon Spring?",
          options: ["Its water was dirty.", "It was too far from the sea.", "It was outside the city walls.", "It was under the king's palace."],
          answer: "It was outside the city walls.",
        },
        { type: "word", q: "Find a word in paragraph 2 that means “brave and daring”.", para: 2, answer: "bold" },
        { type: "tf", q: "The workers used machines to dig the tunnel.", answer: false },
        {
          type: "quote",
          q: "Which sentence explains why the plan was good for Jerusalem and bad for the enemy?",
          answer: "That way, the people of Jerusalem would have water, and the enemy would not.",
        },
        {
          type: "multi",
          q: "Which TWO facts about the tunnel are true?",
          options: ["It is 533 meters long.", "It was dug in one year.", "Water still flows through it today.", "It is closed to visitors."],
          answers: ["It is 533 meters long.", "Water still flows through it today."],
        },
        {
          type: "complete",
          q: "Complete the sentence: Two teams dug from the two ends of the tunnel in order to ___",
          answer: "finish faster.",
          keywords: [["fast", "quick", "sooner", "time", "early"]],
        },
        {
          type: "mc",
          q: "Who discovered the inscription in 1880?",
          options: ["King Hezekiah", "a team of workers", "a tourist with a flashlight", "a boy who was playing in the tunnel"],
          answer: "a boy who was playing in the tunnel",
        },
        {
          type: "open",
          lang: "en",
          q: "What does the inscription describe?",
          answer: "The moment when the two teams heard each other's voices and met.",
          keywords: [["met", "meet", "heard", "hear", "voice", "broke"]],
        },
        {
          type: "open",
          lang: "en",
          q: "What should visitors bring to the tunnel? Write one thing.",
          answer: "A flashlight, or shoes that can get wet.",
          keywords: [["flashlight", "torch", "light", "lamp", "shoe", "boot", "sandal"]],
        },
      ],
    },

    /* ── Level 4 ── */
    {
      id: "habits",
      level: 4,
      title: "The Power of Habits",
      glossary: [
        { en: "automatically", he: "באופן אוטומטי" },
        { en: "cue", he: "סימן, טריגר" },
        { en: "routine", he: "שגרה" },
        { en: "reward", he: "פרס, תגמול" },
      ],
      text: [
        "Think about what you did this morning. You probably woke up, brushed your teeth, got dressed and ate breakfast without thinking much about any of it. Scientists believe that about forty percent of the things we do every day are not real decisions. They are habits.",
        "A habit is something we do so often that our brain does it almost automatically. This is actually a smart system. If we had to think carefully about every small action, like how to tie our shoes, we would be exhausted by lunchtime. Habits save the brain's energy for new problems and important decisions. That is why you can think about other things while you walk to school.",
        "According to researchers, every habit has three parts. First, there is a cue, something that tells the brain to start the habit, such as a place, a time or a feeling. Second, there is the routine, which is the action itself. Third, there is the reward, the good feeling we get at the end. For example, when a boy comes home from school (the cue), he might open the fridge and eat a snack (the routine), and then feel less hungry and more relaxed (the reward). After many repetitions, the brain connects the cue with the reward, and the habit becomes automatic.",
        "This is good news and bad news. The bad news is that bad habits, like staying up late with a phone, are very hard to break. The good news is that we can use the same system to build good habits. Experts suggest a few simple steps. Start small: if you want to read more, begin with two pages a night, not fifty. Connect the new habit to an old one: read right after you brush your teeth. And give yourself a reward, even a small one, like marking a calendar.",
        "How long does it take to build a new habit? Many people believe it takes twenty-one days, but a study from University College London found that the real answer is different. On average, it took the people in the study sixty-six days, and for some of them it took much longer. Some needed less than three weeks, and others needed more than eight months. The study also found that missing one day did not ruin the process.",
        "In other words, building a habit is not about being perfect. It is about coming back again and again, until one day you notice that the thing that was once hard has become a part of who you are.",
      ],
      questions: [
        {
          type: "mc",
          q: "According to paragraph 1, what are about forty percent of the things we do every day?",
          options: ["real decisions", "habits", "mistakes", "new problems"],
          answer: "habits",
        },
        {
          type: "mc",
          q: "Why does the writer call habits “a smart system”?",
          options: [
            "They make us faster runners.",
            "They help us remember our dreams.",
            "They save the brain's energy for new problems and important decisions.",
            "They stop us from making any decisions.",
          ],
          answer: "They save the brain's energy for new problems and important decisions.",
        },
        { type: "word", q: "Find a word in paragraph 2 that means “very tired”.", para: 2, answer: "exhausted" },
        {
          type: "multi",
          q: "Which TWO are parts of every habit, according to the researchers?",
          options: ["the cue", "the decision", "the reward", "the problem"],
          answers: ["the cue", "the reward"],
        },
        {
          type: "complete",
          q: "Complete the sentence: Bad habits are a problem because ___",
          answer: "they are very hard to break.",
          keywords: [["hard", "difficult", "break", "stop", "quit"]],
        },
        {
          type: "quote",
          q: "Which sentence gives an example of connecting a new habit to an old one?",
          answer: "Connect the new habit to an old one: read right after you brush your teeth.",
        },
        { type: "tf", q: "The study found that missing one day ruins the process of building a habit.", answer: false },
        {
          type: "complete",
          q: "Complete the sentence: On average, the people in the study needed ___",
          answer: "sixty-six days to build a new habit.",
          keywords: [["sixty-six", "sixty six", "66"]],
        },
        {
          type: "open",
          lang: "en",
          q: "What does the writer suggest if you want to read more? Write one step.",
          answer: "Start small, with two pages a night.",
          keywords: [["small", "two pages", "2 pages", "after", "brush", "teeth", "reward", "calendar"]],
        },
        {
          type: "open",
          lang: "en",
          q: "What is the main message of the last paragraph?",
          answer: "Building a habit is not about being perfect, but about coming back again and again.",
          keywords: [["perfect", "again", "keep", "continu", "try", "give up"]],
        },
      ],
    },
    {
      id: "beresheet",
      level: 4,
      title: "Beresheet: A Small Country Aims for the Moon",
      glossary: [
        { en: "spacecraft", he: "חללית" },
        { en: "non-profit organization", he: "עמותה" },
        { en: "orbit", he: "מסלול סביב" },
        { en: "budget", he: "תקציב" },
      ],
      text: [
        "In the middle of the night, on February 22, 2019, many Israelis stayed awake to watch a rocket take off from Florida, in the United States. On board was a small spacecraft called Beresheet, the Hebrew word for “In the beginning,” the first word of the Bible. Its mission was to land on the Moon. If it succeeded, Israel would become only the fourth country in history to land a spacecraft on the Moon, after the Soviet Union, the United States and China.",
        "The story of Beresheet began in 2011, when three young Israeli engineers decided to join an international competition. The competition offered a prize of millions of dollars to the first private team to land a spacecraft on the Moon. The engineers had a big dream but very little money, so they started a non-profit organization called SpaceIL and asked people and companies to help.",
        "Building a spacecraft for the Moon usually costs hundreds of millions of dollars and needs thousands of workers. SpaceIL built Beresheet with a much smaller budget, about one hundred million dollars, and a small team of engineers and volunteers. The spacecraft was about the size of a washing machine, which made it one of the smallest spacecraft ever to try to land on the Moon.",
        "Instead of flying straight to the Moon, Beresheet traveled around the Earth in bigger and bigger circles, using as little fuel as possible. The trip was long, but it was the only way to reach the Moon with such a small amount of fuel. After about six weeks, it entered orbit around the Moon. This alone was a historic moment: Israel became the seventh country to orbit the Moon.",
        "On April 11, 2019, the team began the landing. In the control room in Yehud, everyone held their breath as the spacecraft came closer and closer to the surface. Then, when it was already very close to the Moon, a problem in one of its parts caused the main engine to shut down. The team tried to restart it, but it was too late. Beresheet crashed into the Moon.",
        "The engineers were disappointed, but they were also proud. Their tiny spacecraft had traveled millions of kilometers, and it had shown the world what a small team with a big dream could do. Beresheet also carried a small time capsule with drawings by children, Israeli songs and a copy of the Bible. Just two days after the crash, SpaceIL announced that it would build a new spacecraft, Beresheet 2. Their message was simple: if you don't succeed the first time, try again.",
      ],
      questions: [
        {
          type: "mc",
          q: "What does the name Beresheet mean?",
          options: ["To the Moon", "A small country", "In the beginning", "A big dream"],
          answer: "In the beginning",
        },
        {
          type: "mc",
          q: "Why did the engineers start a non-profit organization?",
          options: [
            "They wanted to sell spacecraft to other countries.",
            "They had very little money and needed help from others.",
            "The government told them to do it.",
            "They wanted to keep the prize for themselves.",
          ],
          answer: "They had very little money and needed help from others.",
        },
        { type: "word", q: "Find a word in paragraph 3 that means “the amount of money you plan to spend”.", para: 3, answer: "budget" },
        {
          type: "multi",
          q: "Which TWO facts about Beresheet are true?",
          options: [
            "It was about the size of a washing machine.",
            "It was built by thousands of workers.",
            "It cost about one hundred million dollars.",
            "It flew straight to the Moon.",
          ],
          answers: ["It was about the size of a washing machine.", "It cost about one hundred million dollars."],
        },
        {
          type: "quote",
          q: "Which sentence explains why Beresheet traveled around the Earth in bigger and bigger circles?",
          answer: [
            "The trip was long, but it was the only way to reach the Moon with such a small amount of fuel.",
            "Instead of flying straight to the Moon, Beresheet traveled around the Earth in bigger and bigger circles, using as little fuel as possible.",
          ],
        },
        {
          type: "complete",
          q: "Complete the sentence: Beresheet crashed because ___",
          answer: "a problem in one of its parts caused the main engine to shut down.",
          keywords: [["engine", "problem", "part", "shut"]],
        },
        {
          type: "mc",
          q: "What happened when Beresheet entered orbit around the Moon?",
          options: [
            "Israel won the international competition.",
            "Israel became the first country to land on the Moon.",
            "The team found water on the Moon.",
            "Israel became the seventh country to orbit the Moon.",
          ],
          answer: "Israel became the seventh country to orbit the Moon.",
        },
        {
          type: "complete",
          q: "Complete the sentence: Even after the crash, the engineers were proud because ___",
          answer: "their tiny spacecraft had traveled millions of kilometers and showed what a small team with a big dream could do.",
          keywords: [["travel", "million", "show", "small team", "dream", "far"]],
        },
        {
          type: "open",
          lang: "en",
          q: "What did SpaceIL announce two days after the crash?",
          answer: "That it would build a new spacecraft, Beresheet 2.",
          keywords: [["new", "beresheet 2", "another", "second", "again", "build"]],
        },
        {
          type: "open",
          lang: "en",
          q: "What lesson can we learn from the story of Beresheet? Explain in your own words.",
          answer: "If you don't succeed the first time, you should not give up and try again.",
          keywords: [["try", "again", "give up", "dream", "fail", "succeed", "keep", "never"]],
        },
      ],
    },
    {
      id: "phones-at-school",
      level: 4,
      title: "Should Phones Be Banned at School?",
      glossary: [
        { en: "ban", he: "איסור; לאסור" },
        { en: "distraction", he: "הסחת דעת" },
        { en: "cyberbullying", he: "בריונות ברשת" },
        { en: "debate", he: "ויכוח, דיון" },
      ],
      text: [
        "Walk into almost any school during a break, and you will see the same picture: students standing in small groups, each one looking down at a phone. Some students even send messages to friends who are standing right next to them. Phones have become a part of children's lives, but more and more schools are asking an important question: should phones be allowed at school at all?",
        "Some countries have already decided. In 2018, France passed a law that bans phones in primary and middle schools. Since then, other countries and many individual schools have made similar rules. In some schools, students must turn off their phones and keep them in their bags. In others, they leave them in a special locker at the entrance.",
        "People who support the ban give several reasons. First, they say that phones are a distraction. A student who is waiting for a message cannot fully concentrate on the lesson. One study in England found that students' test results improved after their schools banned phones, especially among weaker students. Second, supporters believe that without phones, students talk and play together more during breaks. Several principals report that after the ban, the schoolyard became louder, in a good way. Finally, they point out that a ban can protect students from cyberbullying during the school day.",
        "Not everyone agrees. Some parents want to be able to reach their children at any moment, especially in an emergency. Others argue that phones can be useful learning tools: students can use them to look up information, take photos of the board or practice languages with apps. Banning phones, they say, is like banning pens because some students draw on their desks. Some students also say that a ban treats them like small children who cannot control themselves.",
        "Many experts suggest a middle way. Instead of a total ban, schools can make clear rules: phones stay off during lessons unless the teacher asks students to use them, and breaks are phone-free. Supporters of this idea say that it is not enough to take phones away. Schools should also teach students how to use technology wisely, because after school, the phones will be back in their hands. For example, students can learn how to check if information online is true.",
        "The debate is not over, and different schools will probably continue to choose different answers. One thing, however, is clear: the question is not really about phones. It is about what kind of place we want school to be. Perhaps the best answer is the one that students, parents and teachers build together.",
      ],
      questions: [
        {
          type: "mc",
          q: "What did France do in 2018?",
          options: [
            "It gave every student a phone.",
            "It passed a law that bans phones in primary and middle schools.",
            "It closed its schools for a week.",
            "It built special lockers in every city.",
          ],
          answer: "It passed a law that bans phones in primary and middle schools.",
        },
        {
          type: "mc",
          q: "Why do supporters of the ban say that phones are a distraction?",
          options: [
            "Phones are too expensive for students.",
            "Phones make the schoolyard louder.",
            "A student waiting for a message cannot concentrate on the lesson.",
            "Teachers don't know how to use phones.",
          ],
          answer: "A student waiting for a message cannot concentrate on the lesson.",
        },
        { type: "word", q: "Find a word in paragraph 3 that means “the heads of schools”.", para: 3, answer: "principals" },
        {
          type: "multi",
          q: "Which TWO reasons do people who are against the ban give?",
          options: [
            "Parents want to reach their children in an emergency.",
            "A ban protects students from cyberbullying.",
            "Phones can be useful learning tools.",
            "Students talk more during breaks without phones.",
          ],
          answers: ["Parents want to reach their children in an emergency.", "Phones can be useful learning tools."],
        },
        {
          type: "quote",
          q: "Which sentence shows that a ban may help weaker students?",
          answer: "One study in England found that students' test results improved after their schools banned phones, especially among weaker students.",
        },
        {
          type: "complete",
          q: "Complete the sentence: Some people compare banning phones to ___",
          answer: "banning pens because some students draw on their desks.",
          keywords: [["pen"]],
        },
        { type: "tf", q: "According to the text, all the experts agree that phones should be completely banned.", answer: false },
        {
          type: "complete",
          q: "Complete the sentence: Schools should teach students to use technology wisely because ___",
          answer: "after school, the phones will be back in their hands.",
          keywords: [["after school", "back", "hand", "home", "later"]],
        },
        {
          type: "mc",
          q: "What is the purpose of the text?",
          options: [
            "to sell a new kind of phone",
            "to tell a story about one student",
            "to explain how phones work",
            "to present different opinions about phones at school",
          ],
          answer: "to present different opinions about phones at school",
        },
        {
          type: "open",
          lang: "en",
          q: "According to the last paragraph, what is the question really about?",
          answer: "It is about what kind of place we want school to be.",
          keywords: [["place", "kind", "should be", "want", "like"]],
        },
      ],
    },
    {
      id: "ben-yehuda",
      level: 4,
      title: "The Man Who Brought a Language Back to Life",
      glossary: [
        { en: "prayer", he: "תפילה" },
        { en: "unite", he: "לאחד" },
        { en: "root", he: "שורש" },
        { en: "holy", he: "קדוש" },
      ],
      text: [
        "For almost two thousand years, Hebrew was a language of prayer and study. Jews all over the world read the Bible and the Talmud in Hebrew, wrote letters and books in it, and prayed in it every day. But almost nobody spoke Hebrew at home. Children grew up speaking Yiddish, Ladino, Arabic or the language of the country where they lived.",
        "Eliezer Ben-Yehuda wanted to change that. He was born in 1858 in a small town in Lithuania and studied in a religious school as a child, where he became fascinated by the Hebrew language. As a young man, he came to believe that if the Jewish people returned to their land, they would need one language to unite them. That language, he decided, had to be Hebrew.",
        "In 1881, Ben-Yehuda moved to Jerusalem. He made a decision that surprised many people: from now on, his family would speak only Hebrew at home. When his son Ben-Zion was born the next year, he became the first child in modern times to grow up with Hebrew as his first language. It was not easy. There were no Hebrew words for many everyday things, and the family was sometimes lonely, because most people around them did not understand them.",
        "To solve the problem of missing words, Ben-Yehuda started inventing them. Often he took an old Hebrew root and gave it a new form or a new meaning. When he could not find a fitting root in Hebrew, he sometimes looked for one in Aramaic or Arabic, languages that are close to Hebrew. Some of the words he created are used by millions of people today, like milon (dictionary) and glida (ice cream). He also started a Hebrew newspaper and began writing a huge dictionary of the Hebrew language, both old and new.",
        "Many people were against his ideas. Some religious leaders believed that Hebrew was too holy to be used for everyday talk, and others thought that bringing an old language back to life was simply impossible. But slowly, more families began speaking Hebrew, and schools started teaching in Hebrew. In 1890, Ben-Yehuda and others founded the Hebrew Language Committee, which later became the Academy of the Hebrew Language.",
        "Ben-Yehuda died in 1922, and his dictionary was completed many years after his death. He did not live to see the State of Israel, but his dream came true. Today, more than nine million people speak Hebrew, and it is the only language in history that went from almost no native speakers back to being the everyday language of a whole nation. Every time you ask for a glida, you are using a small piece of his dream.",
      ],
      questions: [
        {
          type: "mc",
          q: "Before Ben-Yehuda, how did most Jews use Hebrew?",
          options: [
            "only for speaking with their children",
            "for prayer, study and writing, but not for speaking at home",
            "only in the Land of Israel",
            "they did not use Hebrew at all",
          ],
          answer: "for prayer, study and writing, but not for speaking at home",
        },
        {
          type: "mc",
          q: "Why did Ben-Yehuda believe the Jewish people needed Hebrew?",
          options: [
            "It was easier than other languages.",
            "Their children did not like Yiddish.",
            "The government asked him to choose a language.",
            "They would need one language to unite them in their land.",
          ],
          answer: "They would need one language to unite them in their land.",
        },
        { type: "word", q: "Find a word in paragraph 2 that means “very interested in something”.", para: 2, answer: "fascinated" },
        { type: "tf", q: "Ben-Zion was the first child in modern times to grow up with Hebrew as his first language.", answer: true },
        {
          type: "quote",
          q: "Which sentence shows that life was hard for the Ben-Yehuda family?",
          answer: [
            "There were no Hebrew words for many everyday things, and the family was sometimes lonely, because most people around them did not understand them.",
            "It was not easy.",
          ],
        },
        {
          type: "multi",
          q: "Which TWO things did Ben-Yehuda do to solve the problem of missing words?",
          options: [
            "He gave old Hebrew roots a new form or meaning.",
            "He borrowed most of his words from French.",
            "He looked for roots in Aramaic or Arabic.",
            "He asked children to invent new words.",
          ],
          answers: ["He gave old Hebrew roots a new form or meaning.", "He looked for roots in Aramaic or Arabic."],
        },
        {
          type: "complete",
          q: "Complete the sentence: Some religious leaders were against Ben-Yehuda's ideas because ___",
          answer: "they believed Hebrew was too holy to be used for everyday talk.",
          keywords: [["holy", "sacred", "kodesh"]],
        },
        {
          type: "mc",
          q: "What did the Hebrew Language Committee later become?",
          options: ["a Hebrew newspaper", "the Academy of the Hebrew Language", "a school in Jerusalem", "the first Hebrew dictionary"],
          answer: "the Academy of the Hebrew Language",
        },
        {
          type: "complete",
          q: "Complete the sentence: Ben-Yehuda did not live to see the State of Israel, but ___",
          answer: "his dream came true.",
          keywords: [["dream", "came true", "today", "million"]],
        },
        {
          type: "open",
          lang: "en",
          q: "Why is Hebrew special among the languages of the world, according to the last paragraph?",
          answer: "It is the only language that went from almost no native speakers back to being the everyday language of a whole nation.",
          keywords: [["only", "first", "no other"], ["speaker", "everyday", "nation", "back", "spoken", "life", "again"]],
        },
      ],
    },
  ];

  const examTitle = (exam) => ({ title: `רמה ${exam.level} · ${exam.title}`, titleEn: `Level ${exam.level} · ${exam.title}` });

  TOPICS.push({
    id: "exams",
    group: "reading",
    title: "מבחני הבנת הנקרא",
    titleEn: "Reading Exams",
    exercises: EXAMS.map((exam) => ({
      id: `exam-${exam.id}`,
      type: "exam",
      level: exam.level,
      minutes: MINUTES[exam.level],
      ...examTitle(exam),
      passage: { title: exam.title, text: exam.text, glossary: exam.glossary || null },
      questions: exam.questions,
    })),
  });
})();
