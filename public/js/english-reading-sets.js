/* Learn English — reading by topic: one tile per theme on the path's
   "קטעי קריאה לפי נושאים" stage, like the vocabulary tiles. Each theme has
   six passages, from a few short sentences (level 1) to a longer text
   (level 4), and every passage asks the kinds of questions of a school
   unseen: multiple choice, true / false, a word from the text, complete
   the sentence, two right answers, the events in order, a sentence chosen
   from the text and an open question.
   Loaded after english-reading.js; adds every theme as a topic in the
   "reading" group. The runner (english-learning.js) shows the passage alone
   first, then one question at a time, with "Translate words" and "Hebrew
   questions" to help (every word here is in english-dict.js).

   Unit: { level, title, titleHe, text: [paragraphs], questions }
   Questions are written with the helpers below; a right answer is always
   written first (the page shuffles the options):
     mc(q, he, options, optionsHe)          options[0] is right
     tf(q, he, answer)
     word(he, answer, accept?)              "find the word that means…"
     complete(q, answer, keys?)             q has ___; right when it has a key
     multi(q, he, options, optionsHe)       the first two options are right
     seq(items)                             the events, in the right order
     quote(q, he, sentence)                 exactly one sentence of the text
     openHe(q, qEn, answer, answerEn, keys) levels 1–2, answered in Hebrew
     openEn(q, he, answer, keys)            levels 3–4, answered in English
   Content rules: boys, men, animals and objects; no romance; nothing that
   happens on Shabbat. The text splits into sentences at . ! or ? followed by
   a space and a capital letter, so no abbreviations like "Mr." and no
   letters with accents. */

(function () {
  const TOPICS = window.ENGLISH_TOPICS || [];

  const mc = (q, he, options, optionsHe) => ({ type: "mc", q, he, options, optionsHe, answer: options[0] });
  const tf = (q, he, answer) => ({ type: "tf", q, he, answer });
  const word = (he, answer, accept) => ({
    type: "word",
    q: `Find the word in the text that means “${he}”.`,
    he: `מצאו בטקסט את המילה שפירושה „${he}”.`,
    answer,
    ...(accept ? { accept } : {}),
  });
  const complete = (q, answer, keys) => ({ type: "complete", q, answer, keywords: [keys || [answer.toLowerCase()]] });
  const multi = (q, he, options, optionsHe) => ({ type: "multi", q, he, options, optionsHe, answers: options.slice(0, 2) });
  const seq = (items) => ({ type: "sequence", q: "Put the events in the right order.", he: "סדרו את האירועים לפי הסדר הנכון.", items });
  const quote = (q, he, answer) => ({ type: "quote", q, he, answer });
  const openHe = (q, qEn, answer, answerEn, keys) => ({ type: "open", lang: "he", q, qEn, answer, answerEn, keywords: [keys] });
  const openEn = (q, he, answer, keys) => ({ type: "open", lang: "en", q, he, answer, keywords: [keys] });

  const SETS = [];

  /* ── Animals ── */
  SETS.push({
    id: "read-animals",
    title: "קריאה: חיות",
    titleEn: "Reading: Animals",
    cover: "lion",
    units: [
      {
        level: 1,
        title: "My Dog Max",
        titleHe: "הכלב שלי מקס",
        text: [
          "I have a dog. His name is Max. Max is big and brown. He has long ears and a short tail.",
          "Max likes to run in the park. He likes to play with a ball too. At night, Max sleeps next to my bed.",
        ],
        questions: [
          mc("What color is Max?", "באיזה צבע מקס?", ["brown", "black", "white"], ["חום", "שחור", "לבן"]),
          tf("Max has a long tail.", "למקס יש זנב ארוך.", false),
          word("אוזניים", "ears", ["ear"]),
          mc("Where does Max sleep?", "איפה מקס ישן?", ["next to my bed", "in the park", "in the kitchen"], ["ליד המיטה שלי", "בפארק", "במטבח"]),
          openHe("מה מקס אוהב לעשות בפארק?", "What does Max like to do in the park?", "לרוץ ולשחק בכדור.", "To run and play with a ball.", ["רץ", "רוץ", "ריצ", "כדור", "שחק", "משחק", "run", "play", "ball"]),
        ],
      },
      {
        level: 1,
        title: "The Busy Bee",
        titleHe: "הדבורה החרוצה",
        text: [
          "A bee is a small insect. It has six legs and four wings. Bees are yellow and black.",
          "Bees fly from flower to flower. They make honey in a hive. Many bees live together in one hive.",
        ],
        questions: [
          mc("How many legs does a bee have?", "כמה רגליים יש לדבורה?", ["six", "four", "eight"], ["שש", "ארבע", "שמונה"]),
          tf("Bees are yellow and black.", "דבורים צהובות ושחורות.", true),
          complete("Bees make honey in a ___.", "hive"),
          word("כנפיים", "wings", ["wing"]),
          openHe("איפה הדבורים גרות?", "Where do bees live?", "בכוורת, הרבה דבורים ביחד.", "In a hive, many bees together.", ["כוורת", "hive"]),
        ],
      },
      {
        level: 2,
        title: "Speedy the Turtle",
        titleHe: "ספידי הצב",
        text: [
          "Our family has a turtle. His name is Speedy, but he is very slow! Speedy is twenty years old. He is older than me.",
          "Speedy lives in our garden. He eats lettuce, tomatoes and strawberries. In the winter, when it is cold, Speedy sleeps for three months. He hides under the leaves and does not eat at all.",
          "In the spring, Speedy wakes up. He is very hungry, so we give him a big plate of fruit.",
        ],
        questions: [
          mc("Why is the name Speedy funny?", "למה השם ספידי מצחיק?", ["because he is very slow", "because he is very big", "because he is very young"], ["כי הוא איטי מאוד", "כי הוא גדול מאוד", "כי הוא צעיר מאוד"]),
          tf("Speedy is younger than the writer.", "ספידי צעיר יותר מהכותב.", false),
          multi("Which two foods does Speedy eat?", "אילו שני מאכלים ספידי אוכל?", ["lettuce", "strawberries", "bread", "meat"], ["חסה", "תותים", "לחם", "בשר"]),
          word("עלים", "leaves"),
          complete("In the winter, Speedy sleeps for three ___.", "months", ["month"]),
          openHe("מה המשפחה עושה כשספידי מתעורר באביב? למה?", "What does the family do when Speedy wakes up in the spring? Why?", "נותנים לו צלחת גדולה של פירות, כי הוא רעב מאוד.", "They give him a big plate of fruit, because he is very hungry.", ["פירות", "פרי", "צלחת", "אוכל", "רעב", "fruit", "plate", "food", "hungry"]),
        ],
      },
      {
        level: 2,
        title: "Dolphins",
        titleHe: "דולפינים",
        text: [
          "Dolphins live in the sea, but they are not fish. They are mammals, like cows and dogs. Dolphins must come up to the top of the water to breathe air.",
          "Dolphins are very smart. They live in groups and help each other. They talk with clicks and whistles. Every dolphin has its own whistle, like a name!",
        ],
        questions: [
          tf("Dolphins are fish.", "דולפינים הם דגים.", false),
          mc("Why do dolphins come up to the top of the water?", "למה דולפינים עולים אל פני המים?", ["to breathe air", "to eat", "to sleep"], ["כדי לנשום אוויר", "כדי לאכול", "כדי לישון"]),
          complete("Dolphins are mammals, like cows and ___.", "dogs", ["dog"]),
          multi("Which two things are true about dolphins?", "אילו שני דברים נכונים לגבי דולפינים?", ["They live in groups.", "They talk with clicks and whistles.", "They live in rivers.", "They sleep all day."], ["הם חיים בקבוצות.", "הם מדברים בנקישות ובשריקות.", "הם חיים בנהרות.", "הם ישנים כל היום."]),
          word("חכמים", "smart"),
          openHe("למה השריקה של כל דולפין היא כמו שם?", "Why is every dolphin's whistle like a name?", "כי לכל דולפין יש שריקה משלו.", "Because every dolphin has its own whistle.", ["משלו", "שלו", "מיוחד", "שונה", "own", "its", "different"]),
        ],
      },
      {
        level: 3,
        title: "The Camel: A Desert Hero",
        titleHe: "הגמל: גיבור המדבר",
        text: [
          "Camels live in the desert, where it is very hot in the day and cold at night. There is almost no water and very little food there. But camels are made for this hard place.",
          "A camel can walk for many days without drinking. When it finds water, it can drink about one hundred liters in only ten minutes! Many people think that camels keep water in their humps, but that is not true. The hump is full of fat. When there is no food, the camel uses the fat for energy.",
          "Camels also have long eyelashes and can close their noses. This keeps the sand out of their eyes and noses in a sandstorm. For thousands of years, people have used camels to carry things across the desert. That is why they are called “ships of the desert.”",
        ],
        questions: [
          mc("What is the desert like at night?", "איך המדבר בלילה?", ["cold", "hot", "rainy", "windy"], ["קר", "חם", "גשום", "סוער"]),
          tf("A camel's hump is full of water.", "הדבשת של הגמל מלאה במים.", false),
          quote("Choose the sentence that shows how fast a camel can drink.", "בחרו את המשפט שמראה כמה מהר גמל יכול לשתות.", "When it finds water, it can drink about one hundred liters in only ten minutes!"),
          complete("When there is no food, the camel uses the fat for ___.", "energy"),
          word("חול", "sand"),
          multi("Which two things help camels in a sandstorm?", "אילו שני דברים עוזרים לגמלים בסופת חול?", ["long eyelashes", "closing their noses", "a big hump", "long legs"], ["ריסים ארוכים", "סגירת האף", "דבשת גדולה", "רגליים ארוכות"]),
          openEn("Why are camels called “ships of the desert”?", "למה קוראים לגמלים „ספינות המדבר”?", "Because people use them to carry things across the desert.", ["carry", "across", "travel", "bring", "move"]),
        ],
      },
      {
        level: 4,
        title: "The Dog Who Waited",
        titleHe: "הכלב שחיכה",
        text: [
          "About one hundred years ago, a professor in Tokyo, Japan, got a puppy. He called the dog Hachiko. Every morning, Hachiko walked with the professor to the train station. Every evening, the dog waited at the station, and they walked home together.",
          "One day in 1925, the professor did not come back. He became very sick at work and died. Hachiko did not understand. The next evening, he went to the station and waited. The professor did not come.",
          "Hachiko came back to the station the next day, and the day after that. People tried to take him to a new home, but he always ran back to the station. He waited there every evening for almost ten years.",
          "The people of Tokyo were amazed by the dog's loyalty. In 1934, they put a statue of Hachiko near the station. Today, it is a famous meeting place, and people from all over the world come to see it.",
        ],
        questions: [
          mc("Where did Hachiko wait every evening?", "איפה האצ'יקו חיכה כל ערב?", ["at the train station", "at the professor's office", "at the park", "at home"], ["בתחנת הרכבת", "במשרד של הפרופסור", "בפארק", "בבית"]),
          seq(["The professor got a puppy.", "The professor did not come back from work.", "Hachiko waited at the station for almost ten years.", "People put a statue of Hachiko near the station."]),
          tf("Hachiko was happy in his new home.", "האצ'יקו היה מאושר בבית החדש שלו.", false),
          quote("Choose the sentence that shows that Hachiko did not want a new home.", "בחרו את המשפט שמראה שהאצ'יקו לא רצה בית חדש.", "People tried to take him to a new home, but he always ran back to the station."),
          word("נאמנות", "loyalty"),
          multi("Which two sentences about the statue are true?", "אילו שני משפטים על הפסל נכונים?", ["It is near the station.", "People from all over the world come to see it.", "The professor made it.", "It was made in 1925."], ["הוא ליד התחנה.", "אנשים מכל העולם באים לראות אותו.", "הפרופסור הכין אותו.", "הוא נעשה ב־1925."]),
          openEn("Why did the people of Tokyo put a statue of Hachiko near the station?", "למה תושבי טוקיו הציבו פסל של האצ'יקו ליד התחנה?", "Because they were amazed by his loyalty: he waited for the professor for almost ten years.", ["loyal", "amaz", "wait", "love"]),
        ],
      },
    ],
  });

  /* ── School ── */
  SETS.push({
    id: "read-school",
    title: "קריאה: בית הספר",
    titleEn: "Reading: School",
    cover: "place-school",
    units: [
      {
        level: 1,
        title: "My Classroom",
        titleHe: "הכיתה שלי",
        text: [
          "My name is Noam. I am in the third grade. My classroom is big and bright. There are twenty desks in the room.",
          "My teacher's name is Avi. He is nice and funny. I sit next to my friend Ben. We like to read books together.",
        ],
        questions: [
          mc("What grade is Noam in?", "באיזו כיתה נועם?", ["third", "second", "fourth"], ["שלישית", "שנייה", "רביעית"]),
          tf("There are thirty desks in the classroom.", "יש שלושים שולחנות בכיתה.", false),
          word("מצחיק", "funny"),
          mc("Who sits next to Noam?", "מי יושב ליד נועם?", ["Ben", "Avi", "Dan"], ["בן", "אבי", "דן"]),
          openHe("מה נועם ובן אוהבים לעשות ביחד?", "What do Noam and Ben like to do together?", "לקרוא ספרים.", "To read books.", ["קרא", "קורא", "ספר", "read", "book"]),
        ],
      },
      {
        level: 1,
        title: "My School Bag",
        titleHe: "התיק שלי",
        text: [
          "Look in my school bag! There are three books and two notebooks. There is a pencil case too.",
          "In my pencil case, I have a pen, two pencils, an eraser and a ruler. My bag is blue and very heavy!",
        ],
        questions: [
          mc("How many notebooks are in the bag?", "כמה מחברות יש בתיק?", ["two", "three", "one"], ["שתיים", "שלוש", "אחת"]),
          tf("The bag is red.", "התיק אדום.", false),
          complete("In my pencil case, I have a pen, two pencils, an eraser and a ___.", "ruler"),
          word("כבד", "heavy"),
          openHe("מה יש בקלמר? כתבו שני דברים.", "What is in the pencil case? Write two things.", "עט, עפרונות, מחק וסרגל.", "A pen, pencils, an eraser and a ruler.", ["עט", "עיפרון", "עפרון", "עפרונות", "מחק", "סרגל", "pen", "pencil", "eraser", "ruler"]),
        ],
      },
      {
        level: 2,
        title: "The Class Trip",
        titleHe: "הטיול של הכיתה",
        text: [
          "Last week, our class went on a trip to the Science Museum in Jerusalem. We went by bus. The trip took two hours, and we sang songs all the way.",
          "At the museum, we saw a big model of the moon and a real robot. My favorite part was the room with the light games. We made our shadows dance on the wall! At the end of the day, we were tired but very happy.",
        ],
        questions: [
          mc("Where did the class go?", "לאן הכיתה נסעה?", ["to a science museum", "to the zoo", "to the beach"], ["למוזיאון מדע", "לגן החיות", "לחוף הים"]),
          tf("The class went by train.", "הכיתה נסעה ברכבת.", false),
          multi("Which two things did the class see at the museum?", "אילו שני דברים הכיתה ראתה במוזיאון?", ["a model of the moon", "a real robot", "a big ship", "a dinosaur"], ["דגם של הירח", "רובוט אמיתי", "ספינה גדולה", "דינוזאור"]),
          complete("We made our shadows dance on the ___.", "wall"),
          word("עייפים", "tired"),
          openHe("מה עשו הילדים באוטובוס?", "What did the children do on the bus?", "הם שרו שירים כל הדרך.", "They sang songs all the way.", ["שר", "שיר", "sang", "sing", "song"]),
        ],
      },
      {
        level: 2,
        title: "A New Boy in Class",
        titleHe: "ילד חדש בכיתה",
        text: [
          "On Sunday, a new boy came to our class. His name was Ilan, and he came from France. He did not speak Hebrew well, and he looked sad and shy.",
          "At the break, I asked him, “Do you want to play football with us?” Ilan smiled and said, “Yes, please!” He was a great player. Now Ilan is my good friend, and I help him with Hebrew. He teaches me French words too.",
        ],
        questions: [
          mc("Where did Ilan come from?", "מאיפה אילן הגיע?", ["from France", "from England", "from Spain"], ["מצרפת", "מאנגליה", "מספרד"]),
          tf("On his first day, Ilan looked happy.", "ביום הראשון אילן נראה שמח.", false),
          word("ביישן", "shy"),
          complete("At the break, Ilan played ___ with the writer.", "football", ["football", "soccer"]),
          multi("Which two sentences are true now?", "אילו שני משפטים נכונים עכשיו?", ["Ilan is the writer's good friend.", "Ilan teaches the writer French words.", "Ilan is still sad.", "Ilan does not play football."], ["אילן הוא חבר טוב של הכותב.", "אילן מלמד את הכותב מילים בצרפתית.", "אילן עדיין עצוב.", "אילן לא משחק כדורגל."]),
          openHe("איך הכותב עוזר לאילן?", "How does the writer help Ilan?", "הוא עוזר לו בעברית.", "He helps him with Hebrew.", ["עברית", "hebrew"]),
        ],
      },
      {
        level: 3,
        title: "The Class Newspaper",
        titleHe: "העיתון של הכיתה",
        text: [
          "This year, our class decided to make a newspaper. Our teacher said that every student could choose a job. Some students wanted to write stories, and others wanted to take pictures.",
          "I chose to be the sports reporter. Every week, I watched the games at the break and wrote about them. My friend Gil drew funny pictures, and Omer checked all the spelling. It was hard work, because we had to finish everything by Thursday.",
          "When the first newspaper was ready, we printed fifty copies. We gave them to the other classes, to our parents and to the principal. Everyone loved it! Now the whole school is waiting for the next one.",
        ],
        questions: [
          mc("What job did the writer choose?", "איזה תפקיד הכותב בחר?", ["sports reporter", "photographer", "artist", "spelling checker"], ["כתב ספורט", "צלם", "צייר", "בודק איות"]),
          tf("The newspaper had to be ready by Sunday.", "העיתון היה צריך להיות מוכן עד יום ראשון.", false),
          seq(["The class decided to make a newspaper.", "Every student chose a job.", "They printed fifty copies.", "The whole school waited for the next newspaper."]),
          quote("Choose the sentence that tells what Gil and Omer did.", "בחרו את המשפט שמספר מה גיל ועומר עשו.", "My friend Gil drew funny pictures, and Omer checked all the spelling."),
          word("עותקים", "copies"),
          complete("It was hard work, because we had to finish everything by ___.", "Thursday"),
          openEn("Who got copies of the newspaper? Write two.", "מי קיבל עותקים של העיתון? כתבו שניים.", "The other classes, the parents and the principal.", ["class", "parent", "principal"]),
        ],
      },
      {
        level: 4,
        title: "The Boy Who Hated Reading",
        titleHe: "הילד ששנא לקרוא",
        text: [
          "Yonatan was eleven years old, and he hated reading. Books were boring, he said. When his teacher gave the class a book to read, Yonatan only looked at the pictures. His grades in English were going down.",
          "One day, the school librarian, an old man named Shimon, called Yonatan to the library. He asked Yonatan what he liked. Yonatan thought for a moment and answered, “Space, rockets and planets.” Shimon smiled and gave him a book about the first trip to the moon.",
          "Yonatan took the book home without much hope. But after the first page, he could not stop. He read until late at night, and he finished the book in two days. The next week, he asked for another one, and then another.",
          "By the end of the year, Yonatan had read twenty books. His grades went up, and he even started writing his own space stories. He told Shimon that he never really hated reading. He just had not found the right book.",
        ],
        questions: [
          mc("Why didn't Yonatan like reading at first?", "למה יונתן לא אהב לקרוא בהתחלה?", ["He thought books were boring.", "He could not see well.", "He had no time.", "He had no books at home."], ["הוא חשב שספרים משעממים.", "הוא לא ראה טוב.", "לא היה לו זמן.", "לא היו לו ספרים בבית."]),
          tf("Shimon gave Yonatan a book about animals.", "שמעון נתן ליונתן ספר על בעלי חיים.", false),
          seq(["Yonatan only looked at the pictures in books.", "Shimon asked Yonatan what he liked.", "Yonatan finished a book in two days.", "Yonatan started writing his own space stories."]),
          quote("Choose the sentence that shows that Yonatan loved the book from the start.", "בחרו את המשפט שמראה שיונתן אהב את הספר כבר מההתחלה.", "But after the first page, he could not stop."),
          word("ספרן", "librarian"),
          multi("Which two things happened by the end of the year?", "אילו שני דברים קרו עד סוף השנה?", ["Yonatan had read twenty books.", "His grades went up.", "He became a librarian.", "He went to space."], ["יונתן קרא עשרים ספרים.", "הציונים שלו עלו.", "הוא נהיה ספרן.", "הוא טס לחלל."]),
          openEn("What did Yonatan learn about reading?", "מה יונתן למד על קריאה?", "That he never really hated reading: he just had to find the right book.", ["right", "find", "found"]),
        ],
      },
    ],
  });

  /* ── Family and home ── */
  SETS.push({
    id: "read-family",
    title: "קריאה: משפחה ובית",
    titleEn: "Reading: Family and Home",
    cover: "house",
    units: [
      {
        level: 1,
        title: "My Big Family",
        titleHe: "המשפחה הגדולה שלי",
        text: [
          "My name is Eli. I live in a small house with my family. I have two big brothers and a baby brother.",
          "My grandpa lives with us too. He tells us stories every night. I love my family!",
        ],
        questions: [
          mc("How many brothers does Eli have?", "כמה אחים יש לאלי?", ["three", "two", "one"], ["שלושה", "שניים", "אחד"]),
          tf("Eli lives in a big house.", "אלי גר בבית גדול.", false),
          word("סיפורים", "stories", ["story"]),
          mc("Who tells stories every night?", "מי מספר סיפורים כל לילה?", ["Grandpa", "the baby", "Eli"], ["סבא", "התינוק", "אלי"]),
          openHe("מי גר עם אלי בבית? כתבו שניים.", "Who lives with Eli? Write two.", "האחים שלו וסבא.", "His brothers and his grandpa.", ["אח", "סבא", "משפח", "brother", "grandpa", "family"]),
        ],
      },
      {
        level: 1,
        title: "Our Kitchen",
        titleHe: "המטבח שלנו",
        text: [
          "Our kitchen is small, but it is my favorite room. There is a big table in the middle.",
          "In the morning, Dad makes eggs and toast. We eat breakfast together at the table. Then I wash the cups and plates.",
        ],
        questions: [
          mc("What does Dad make in the morning?", "מה אבא מכין בבוקר?", ["eggs and toast", "pizza", "soup"], ["ביצים וטוסט", "פיצה", "מרק"]),
          tf("The kitchen is very big.", "המטבח גדול מאוד.", false),
          complete("There is a big table in the ___.", "middle"),
          word("לשטוף", "wash"),
          openHe("מה הכותב עושה אחרי ארוחת הבוקר?", "What does the writer do after breakfast?", "הוא שוטף את הכוסות והצלחות.", "He washes the cups and plates.", ["שוטף", "שטיפ", "כוס", "צלח", "כלים", "wash", "cup", "plate"]),
        ],
      },
      {
        level: 2,
        title: "Moving Day",
        titleHe: "יום המעבר",
        text: [
          "Last month, my family moved to a new apartment in Haifa. Moving was a lot of work! We put all our things in big boxes. There were forty boxes in the end.",
          "A big truck came and took the boxes to the new apartment. Our new home is on the fifth floor, and it has a balcony. From the balcony, I can see the sea. The best part is that now I have my own room!",
        ],
        questions: [
          mc("Where is the new apartment?", "איפה הדירה החדשה?", ["in Haifa", "in Eilat", "in Tel Aviv"], ["בחיפה", "באילת", "בתל אביב"]),
          tf("The family had forty boxes.", "למשפחה היו ארבעים ארגזים.", true),
          word("מרפסת", "balcony"),
          multi("Which two things are true about the new apartment?", "אילו שני דברים נכונים לגבי הדירה החדשה?", ["It is on the fifth floor.", "You can see the sea from it.", "It has a garden.", "It is very small."], ["היא בקומה החמישית.", "אפשר לראות ממנה את הים.", "יש לה גינה.", "היא קטנה מאוד."]),
          complete("A big ___ took the boxes to the new apartment.", "truck"),
          openHe("מה הדבר הכי טוב בדירה החדשה, לפי הכותב?", "What is the best part of the new apartment, for the writer?", "שיש לו חדר משלו.", "That he has his own room.", ["חדר", "room"]),
        ],
      },
      {
        level: 2,
        title: "Fixing the Bike with Dad",
        titleHe: "מתקנים אופניים עם אבא",
        text: [
          "On Friday morning, my bike was broken. The chain was off, and the back wheel was flat. I was sad, because I wanted to ride to the park.",
          "Dad said, “Let's fix it together.” First, we put air in the wheel. Then Dad showed me how to put the chain back on. My hands were black and dirty, but I did not care. After one hour, my bike was as good as new!",
        ],
        questions: [
          mc("What was wrong with the bike?", "מה היה לא בסדר באופניים?", ["The chain was off and a wheel was flat.", "The seat was broken.", "The bike was too small."], ["השרשרת יצאה וגלגל היה בלי אוויר.", "המושב היה שבור.", "האופניים היו קטנים מדי."]),
          tf("The writer and Dad fixed the bike in one hour.", "הכותב ואבא תיקנו את האופניים בשעה אחת.", true),
          word("מלוכלכות", "dirty"),
          complete("First, we put ___ in the wheel.", "air"),
          multi("Which two sentences are true?", "אילו שני משפטים נכונים?", ["Dad showed the writer how to put the chain back on.", "The writer wanted to ride to the park.", "Dad fixed the bike alone.", "The bike was new."], ["אבא הראה לכותב איך להחזיר את השרשרת.", "הכותב רצה לרכוב לפארק.", "אבא תיקן את האופניים לבד.", "האופניים היו חדשים."]),
          openHe("למה הכותב היה עצוב בבוקר?", "Why was the writer sad in the morning?", "כי האופניים היו שבורים והוא רצה לרכוב לפארק.", "Because his bike was broken and he wanted to ride to the park.", ["שבור", "פארק", "לרכוב", "רכיב", "broken", "park", "ride"]),
        ],
      },
      {
        level: 3,
        title: "The Night the Lights Went Out",
        titleHe: "הלילה שבו האורות כבו",
        text: [
          "Last winter, there was a big storm in our town. At seven o'clock in the evening, all the lights in our house suddenly went out. The TV stopped, the fridge was quiet, and it was completely dark.",
          "At first, my little brother was scared. Dad found some candles and a flashlight in the kitchen drawer. We all sat together in the living room under a big blanket. Grandpa told us stories about his childhood in Morocco, when there was no electricity in his village at all.",
          "We played word games and laughed a lot. At ten o'clock, the lights came back on. My little brother asked Dad to turn them off again! It was the best evening of the winter.",
        ],
        questions: [
          mc("What happened at seven o'clock?", "מה קרה בשעה שבע?", ["The lights went out.", "Grandpa came home.", "The storm stopped.", "The TV broke."], ["האורות כבו.", "סבא הגיע הביתה.", "הסערה נפסקה.", "הטלוויזיה התקלקלה."]),
          tf("The family sat in the kitchen under a blanket.", "המשפחה ישבה במטבח מתחת לשמיכה.", false),
          quote("Choose the sentence that shows that the little brother enjoyed the evening.", "בחרו את המשפט שמראה שהאח הקטן נהנה מהערב.", "My little brother asked Dad to turn them off again!"),
          seq(["There was a big storm.", "The lights went out.", "Grandpa told stories.", "The lights came back on."]),
          word("פנס", "flashlight"),
          complete("Dad found candles and a flashlight in the kitchen ___.", "drawer"),
          openEn("What was Grandpa's village like when he was a child?", "איך היה הכפר של סבא כשהוא היה ילד?", "There was no electricity in his village at all.", ["electric", "light", "power"]),
        ],
      },
      {
        level: 4,
        title: "The Family Tree",
        titleHe: "עץ המשפחה",
        text: [
          "When our teacher asked us to make a family tree, I thought it would be easy. I knew my parents, my grandparents and my uncles. But when I asked my grandfather about his parents, I found out how little I knew.",
          "Grandpa took out an old box of photos and letters. He told me that his father, Yosef, was born in Yemen in 1920. As a young man, Yosef walked for weeks across the desert to reach the sea, and from there he sailed to the Land of Israel. He arrived with only a small bag and a book of prayers.",
          "In Israel, Yosef worked as a builder. He helped to build some of the first houses in our town. Grandpa showed me a picture of him standing on a roof, holding a hammer and smiling.",
          "My family tree had twenty-five names in the end. But for me, the best part was not the tree. It was the afternoons I spent with Grandpa, listening to stories I had never heard before.",
        ],
        questions: [
          mc("Why did the writer start asking questions about his family?", "למה הכותב התחיל לשאול שאלות על המשפחה שלו?", ["for a school project", "for a birthday", "because he found a box", "because his uncle asked him"], ["בשביל עבודה לבית הספר", "בשביל יום הולדת", "כי הוא מצא קופסה", "כי הדוד שלו ביקש"]),
          tf("Yosef came to Israel with a lot of money.", "יוסף הגיע לישראל עם הרבה כסף.", false),
          quote("Choose the sentence that shows what Yosef brought with him to Israel.", "בחרו את המשפט שמראה מה יוסף הביא איתו לארץ.", "He arrived with only a small bag and a book of prayers."),
          seq(["Yosef was born in Yemen.", "Yosef walked across the desert.", "Yosef sailed to the Land of Israel.", "Yosef helped to build houses in the town."]),
          word("פטיש", "hammer"),
          multi("Which two sentences are true?", "אילו שני משפטים נכונים?", ["Yosef worked as a builder.", "The family tree had twenty-five names.", "Grandpa was born in Yemen in 1920.", "The writer made the tree in one day."], ["יוסף עבד כבנאי.", "בעץ המשפחה היו עשרים וחמישה שמות.", "סבא נולד בתימן ב־1920.", "הכותב הכין את העץ ביום אחד."]),
          openEn("What was the best part of the project for the writer?", "מה היה החלק הכי טוב בעבודה בשביל הכותב?", "The afternoons he spent with Grandpa, listening to his stories.", ["grandpa", "grandfather", "stor", "listen", "afternoon"]),
        ],
      },
    ],
  });

  /* ── Food ── */
  SETS.push({
    id: "read-food",
    title: "קריאה: אוכל",
    titleEn: "Reading: Food",
    cover: "pizza",
    units: [
      {
        level: 1,
        title: "Pizza Night",
        titleHe: "ערב פיצה",
        text: [
          "Every Thursday is pizza night in our house. Dad makes the pizza, and I help him.",
          "We put tomato sauce, cheese and olives on the pizza. Then we put it in the hot oven. Yum! It smells great.",
        ],
        questions: [
          mc("When is pizza night?", "מתי ערב הפיצה?", ["every Thursday", "every Monday", "every day"], ["כל יום חמישי", "כל יום שני", "כל יום"]),
          tf("The writer helps Dad.", "הכותב עוזר לאבא.", true),
          word("זיתים", "olives", ["olive"]),
          mc("Where do they put the pizza?", "איפה שמים את הפיצה?", ["in the hot oven", "in the fridge", "on the window"], ["בתנור החם", "במקרר", "על החלון"]),
          openHe("מה שמים על הפיצה? כתבו שני דברים.", "What do they put on the pizza? Write two things.", "רוטב עגבניות, גבינה וזיתים.", "Tomato sauce, cheese and olives.", ["רוטב", "עגבני", "גבינ", "זית", "tomato", "sauce", "cheese", "olive"]),
        ],
      },
      {
        level: 1,
        title: "An Apple a Day",
        titleHe: "תפוח ביום",
        text: [
          "Apples are good for you. They have lots of vitamins. Apples can be red, green or yellow.",
          "I eat an apple every day at school. I like green apples best, because they are sweet and sour.",
        ],
        questions: [
          mc("What colors can apples be?", "באילו צבעים יכולים להיות תפוחים?", ["red, green or yellow", "blue or pink", "black or white"], ["אדום, ירוק או צהוב", "כחול או ורוד", "שחור או לבן"]),
          tf("The writer eats an apple every day.", "הכותב אוכל תפוח כל יום.", true),
          complete("I like ___ apples best.", "green"),
          word("חמוץ", "sour"),
          openHe("למה הכותב אוהב תפוחים ירוקים?", "Why does the writer like green apples?", "כי הם מתוקים וחמוצים.", "Because they are sweet and sour.", ["מתוק", "חמוץ", "sweet", "sour"]),
        ],
      },
      {
        level: 2,
        title: "The Falafel Stand",
        titleHe: "דוכן הפלאפל",
        text: [
          "Near my school, there is a small falafel stand. A man named Moshe works there. He has made falafel for thirty years, and everyone in town knows him.",
          "Moshe makes the falafel balls from chickpeas. He fries them in hot oil until they are brown and crispy. Then he puts them in a pita with salad and tahini. On hot days, the line at his stand is very long. But Moshe always smiles and says that good things are worth waiting for.",
        ],
        questions: [
          mc("What does Moshe make the falafel from?", "ממה משה מכין את הפלאפל?", ["chickpeas", "potatoes", "rice"], ["גרגירי חומוס", "תפוחי אדמה", "אורז"]),
          tf("Moshe has made falafel for ten years.", "משה מכין פלאפל כבר עשר שנים.", false),
          multi("What does Moshe put in the pita with the falafel? Choose two.", "מה משה שם בפיתה עם הפלאפל? בחרו שניים.", ["salad", "tahini", "ketchup", "cheese"], ["סלט", "טחינה", "קטשופ", "גבינה"]),
          word("פריכים", "crispy"),
          complete("He fries them in hot ___.", "oil"),
          openHe("מה קורה בדוכן בימים חמים?", "What happens at the stand on hot days?", "התור ארוך מאוד.", "The line is very long.", ["תור", "ארוך", "line", "long"]),
        ],
      },
      {
        level: 2,
        title: "Bread around the World",
        titleHe: "לחם מסביב לעולם",
        text: [
          "People all over the world eat bread, but it looks different in every country. In France, people love the baguette, a long and thin bread. In Mexico, people eat flat corn bread called tortillas.",
          "In Israel, we eat pita every day, and on Friday many families buy challah for Shabbat. Challah is soft and sweet, and it often has seeds on top. In India, people eat naan, a soft bread from a very hot oven.",
        ],
        questions: [
          mc("What is a baguette?", "מה זה באגט?", ["a long and thin bread", "a flat corn bread", "a sweet cake"], ["לחם ארוך ודק", "לחם תירס שטוח", "עוגה מתוקה"]),
          tf("People in Mexico eat tortillas.", "אנשים במקסיקו אוכלים טורטיות.", true),
          multi("Which two things are true about challah?", "אילו שני דברים נכונים לגבי חלה?", ["It is soft and sweet.", "It often has seeds on top.", "It is long and thin.", "It is made from corn."], ["היא רכה ומתוקה.", "לעיתים קרובות יש עליה זרעים.", "היא ארוכה ודקה.", "היא עשויה מתירס."]),
          word("שטוח", "flat"),
          complete("In India, people eat ___.", "naan"),
          openHe("מתי משפחות רבות בישראל קונות חלה?", "When do many families in Israel buy challah?", "ביום שישי, לשבת.", "On Friday, for Shabbat.", ["שישי", "שבת", "friday", "shabbat"]),
        ],
      },
      {
        level: 3,
        title: "The Cooking Contest",
        titleHe: "תחרות הבישול",
        text: [
          "Every year, our school has a cooking contest for the sixth grade. This year, my friend Ari and I decided to make vegetable soup. We practiced at home three times, and Ari's dad helped us choose the best vegetables at the market.",
          "On the day of the contest, everything went wrong at first. We forgot the salt at home, and the pot was too small. But we did not give up. We borrowed salt from another team and cooked the soup in two pots.",
          "When the judges tasted our soup, they were quiet for a long moment. Then one of them smiled and said it was the best soup of the day. We did not win first prize, but we got a special prize for teamwork. I was proud of us.",
        ],
        questions: [
          mc("What did Ari and the writer cook?", "מה ארי והכותב בישלו?", ["vegetable soup", "a chocolate cake", "pasta", "a salad"], ["מרק ירקות", "עוגת שוקולד", "פסטה", "סלט"]),
          tf("The boys won first prize.", "הבנים זכו בפרס הראשון.", false),
          quote("Choose the sentence that shows how the boys solved their problems.", "בחרו את המשפט שמראה איך הבנים פתרו את הבעיות שלהם.", "We borrowed salt from another team and cooked the soup in two pots."),
          seq(["The boys practiced at home.", "They forgot the salt.", "The judges tasted the soup.", "They got a prize for teamwork."]),
          word("שופטים", "judges", ["judge"]),
          complete("We did not win first prize, but we got a special prize for ___.", "teamwork"),
          openEn("What went wrong on the day of the contest? Write one thing.", "מה השתבש ביום התחרות? כתבו דבר אחד.", "They forgot the salt at home, and the pot was too small.", ["salt", "pot", "small", "forgot"]),
        ],
      },
      {
        level: 4,
        title: "The Story of the Potato",
        titleHe: "הסיפור של תפוח האדמה",
        text: [
          "Today, people all over the world eat potatoes: fried, baked, boiled or mashed. But five hundred years ago, nobody in Europe had ever seen a potato. Potatoes grew only in South America, high in the mountains of Peru.",
          "Spanish sailors brought the first potatoes to Europe in the 1500s. At first, people did not trust this strange food. Some thought it was poison, and others grew the plant only for its pretty flowers. Farmers fed potatoes to their animals, not to their families.",
          "Slowly, people saw that potatoes were cheap, easy to grow and very filling. In the 1700s, a French scientist named Antoine Parmentier worked hard to change people's minds. He gave potato dinners to famous guests and grew potatoes in a field near Paris. He even put guards around the field, so people would think the potatoes were valuable. At night, people came and took them!",
          "Today, the potato is one of the most important foods on Earth. It feeds millions of people every day.",
        ],
        questions: [
          mc("Where did potatoes first grow?", "איפה גדלו תפוחי אדמה לראשונה?", ["in South America", "in France", "in Spain", "in Africa"], ["בדרום אמריקה", "בצרפת", "בספרד", "באפריקה"]),
          tf("At first, people in Europe loved potatoes.", "בהתחלה, אנשים באירופה אהבו תפוחי אדמה.", false),
          multi("Which two things did people in Europe do with potatoes at first?", "אילו שני דברים עשו אנשים באירופה עם תפוחי אדמה בהתחלה?", ["They fed them to their animals.", "They grew them for their flowers.", "They sold them in Paris.", "They ate them every day."], ["הם האכילו בהם את בעלי החיים.", "הם גידלו אותם בשביל הפרחים.", "הם מכרו אותם בפריז.", "הם אכלו אותם כל יום."]),
          quote("Choose the sentence that shows Parmentier's clever trick.", "בחרו את המשפט שמראה את התרגיל החכם של פרמנטייה.", "He even put guards around the field, so people would think the potatoes were valuable."),
          seq(["Potatoes grew only in South America.", "Spanish sailors brought potatoes to Europe.", "Parmentier grew potatoes near Paris.", "The potato became one of the most important foods."]),
          word("רעל", "poison"),
          openEn("Why did people slowly start to eat potatoes? Write one reason.", "למה אנשים התחילו לאט לאט לאכול תפוחי אדמה? כתבו סיבה אחת.", "Because potatoes were cheap, easy to grow and very filling.", ["cheap", "easy", "filling", "grow"]),
        ],
      },
    ],
  });

  /* ── Sports and hobbies ── */
  SETS.push({
    id: "read-sports",
    title: "קריאה: ספורט ותחביבים",
    titleEn: "Reading: Sports and Hobbies",
    cover: "sport-football",
    units: [
      {
        level: 1,
        title: "I Love Football",
        titleHe: "אני אוהב כדורגל",
        text: [
          "My name is Dan. I love football. I play football with my friends after school.",
          "I am the goalkeeper. I stop the ball with my hands. My team wears red shirts. Go, red team!",
        ],
        questions: [
          mc("When does Dan play football?", "מתי דן משחק כדורגל?", ["after school", "in the morning", "at night"], ["אחרי בית הספר", "בבוקר", "בלילה"]),
          tf("Dan's team wears blue shirts.", "הקבוצה של דן לובשת חולצות כחולות.", false),
          word("שוער", "goalkeeper"),
          mc("How does Dan stop the ball?", "איך דן עוצר את הכדור?", ["with his hands", "with his head", "with his feet"], ["עם הידיים", "עם הראש", "עם הרגליים"]),
          openHe("עם מי דן משחק כדורגל?", "Who does Dan play football with?", "עם החברים שלו.", "With his friends.", ["חבר", "friend"]),
        ],
      },
      {
        level: 1,
        title: "The Chess Club",
        titleHe: "חוג השחמט",
        text: [
          "On Tuesday, I go to the chess club. There are ten boys in the club.",
          "Chess is a quiet game. You need to think a lot. My grandpa taught me to play. Now I can win against him!",
        ],
        questions: [
          mc("When does the writer go to the chess club?", "מתי הכותב הולך לחוג השחמט?", ["on Tuesday", "on Sunday", "on Friday"], ["ביום שלישי", "ביום ראשון", "ביום שישי"]),
          tf("Chess is a loud game.", "שחמט הוא משחק רועש.", false),
          complete("There are ten ___ in the club.", "boys", ["boy"]),
          word("שקט", "quiet"),
          openHe("מי לימד את הכותב לשחק שחמט?", "Who taught the writer to play chess?", "סבא שלו.", "His grandpa.", ["סבא", "grandpa", "grandfather"]),
        ],
      },
      {
        level: 2,
        title: "Learning to Swim",
        titleHe: "לומדים לשחות",
        text: [
          "When I was six, I was afraid of the water. I did not want to go in the pool. My dad said, “Don't worry. You will learn slowly.”",
          "Every Monday, I had a swimming lesson with a coach named Uri. First, I learned to put my face in the water. Then I learned to kick my legs. After two months, I could swim across the pool! Now I am ten, and I swim on the school team.",
        ],
        questions: [
          mc("How old was the writer when he was afraid of the water?", "בן כמה היה הכותב כשפחד מהמים?", ["six", "ten", "eight"], ["שש", "עשר", "שמונה"]),
          tf("The writer had swimming lessons every Monday.", "לכותב היו שיעורי שחייה כל יום שני.", true),
          multi("Which two things did the writer learn first?", "אילו שני דברים הכותב למד בהתחלה?", ["to put his face in the water", "to kick his legs", "to jump into the pool", "to swim on his back"], ["לשים את הפנים במים", "לבעוט ברגליים", "לקפוץ לבריכה", "לשחות על הגב"]),
          word("מאמן", "coach"),
          complete("After two months, I could swim across the ___.", "pool"),
          openHe("מה הכותב עושה היום, כשהוא בן עשר?", "What does the writer do now, at ten?", "הוא שוחה בנבחרת של בית הספר.", "He swims on the school team.", ["שוחה", "שחי", "נבחרת", "קבוצ", "swim", "team"]),
        ],
      },
      {
        level: 2,
        title: "My Stamp Collection",
        titleHe: "אוסף הבולים שלי",
        text: [
          "I have a hobby: I collect stamps. I have more than five hundred stamps from forty countries. I keep them in three big albums.",
          "My oldest stamp is from 1948, the year Israel was born. My favorite stamp is from Japan. It has a picture of a beautiful mountain with snow on top. When I look at my stamps, I feel like I am traveling around the world.",
        ],
        questions: [
          mc("How many countries are the stamps from?", "מכמה ארצות הבולים?", ["forty", "five hundred", "three"], ["ארבעים", "חמש מאות", "שלוש"]),
          tf("The writer keeps his stamps in a box.", "הכותב שומר את הבולים שלו בקופסה.", false),
          word("לאסוף", "collect"),
          complete("My oldest stamp is from ___.", "1948"),
          multi("Which two things are true about the stamp from Japan?", "אילו שני דברים נכונים לגבי הבול מיפן?", ["It is the writer's favorite.", "It has a mountain with snow.", "It is from 1948.", "It has a picture of the sea."], ["הוא הבול האהוב על הכותב.", "יש עליו הר עם שלג.", "הוא משנת 1948.", "יש עליו תמונה של הים."]),
          openHe("איך הכותב מרגיש כשהוא מסתכל על הבולים?", "How does the writer feel when he looks at his stamps?", "כאילו הוא מטייל מסביב לעולם.", "Like he is traveling around the world.", ["מטייל", "טיול", "עולם", "travel", "world"]),
        ],
      },
      {
        level: 3,
        title: "The Marathon",
        titleHe: "המרתון",
        text: [
          "My uncle Benny started running when he was forty-five years old. At first, he could only run for five minutes before he had to stop. His legs hurt, and he was out of breath. But he did not give up.",
          "Every morning at six o'clock, Benny went running in the park. Each week, he ran a little more. After one year, he could run ten kilometers without stopping. Then he decided on a bigger goal: the Jerusalem Marathon, forty-two kilometers long.",
          "On the day of the race, our whole family stood near the finish line with signs. After four and a half hours, we saw Benny. He was slow and very tired, but he was smiling. When he crossed the line, he lifted his arms high in the air.",
        ],
        questions: [
          mc("How old was Benny when he started running?", "בן כמה היה בני כשהתחיל לרוץ?", ["forty-five", "forty-two", "ten", "six"], ["ארבעים וחמש", "ארבעים ושתיים", "עשר", "שש"]),
          tf("Benny could run ten kilometers after one month.", "בני יכול היה לרוץ עשרה קילומטרים אחרי חודש אחד.", false),
          seq(["Benny could only run for five minutes.", "Benny ran ten kilometers without stopping.", "Benny decided to run the Jerusalem Marathon.", "Benny crossed the finish line."]),
          quote("Choose the sentence that shows how hard running was for Benny at first.", "בחרו את המשפט שמראה כמה קשה היה לבני לרוץ בהתחלה.", "His legs hurt, and he was out of breath."),
          word("מטרה", "goal"),
          complete("The Jerusalem Marathon is forty-two ___ long.", "kilometers", ["kilometer", "km"]),
          openEn("What did the family do on the day of the race?", "מה המשפחה עשתה ביום המרוץ?", "They stood near the finish line with signs.", ["finish", "sign", "stood", "wait", "line"]),
        ],
      },
      {
        level: 4,
        title: "Music from Trash",
        titleHe: "מוזיקה מאשפה",
        text: [
          "Cateura is a poor town in Paraguay, built next to a huge garbage dump. Many families there make money by collecting trash that can be sold. For the children of Cateura, a real violin was a dream. A violin cost more than a family's house.",
          "In 2006, a music teacher named Favio Chavez came to work in Cateura. He wanted to teach the children music, but he had only a few instruments. Then a worker at the dump, a man named Nicolas Gomez, had an idea. He could build instruments from the trash!",
          "Nicolas made violins from old metal cans and pieces of wood. He made a cello from an oil can and a flute from old water pipes. Even old forks became parts of the instruments. The children practiced every day, and slowly, the strange instruments began to make beautiful music.",
          "Today, the Recycled Orchestra of Cateura plays concerts all over the world. Its message is simple: the world sends us trash, and we send back music.",
        ],
        questions: [
          mc("Why was a real violin a dream for the children of Cateura?", "למה כינור אמיתי היה חלום בשביל הילדים בקטאורה?", ["It cost more than a family's house.", "There was no music teacher.", "The children did not like music.", "It was too big for them."], ["הוא עלה יותר מבית של משפחה.", "לא היה מורה למוזיקה.", "הילדים לא אהבו מוזיקה.", "הוא היה גדול מדי בשבילם."]),
          tf("Favio Chavez built the instruments from trash.", "פאביו צ'אבס בנה את הכלים מאשפה.", false),
          seq(["Favio Chavez came to work in Cateura.", "Nicolas Gomez had an idea.", "Nicolas made instruments from trash.", "The orchestra played concerts all over the world."]),
          multi("Which two things did Nicolas use to make instruments?", "באילו שני דברים ניקולס השתמש כדי לבנות כלים?", ["old metal cans", "water pipes", "plastic bags", "old shoes"], ["פחיות מתכת ישנות", "צינורות מים", "שקיות ניילון", "נעליים ישנות"]),
          quote("Choose the sentence that shows how the children learned to play.", "בחרו את המשפט שמראה איך הילדים למדו לנגן.", "The children practiced every day, and slowly, the strange instruments began to make beautiful music."),
          word("אשפה", "trash", ["garbage"]),
          openEn("What is the message of the Recycled Orchestra?", "מה המסר של התזמורת הממוחזרת?", "The world sends us trash, and we send back music.", ["music"]),
        ],
      },
    ],
  });

  /* ── Nature and weather ── */
  SETS.push({
    id: "read-nature",
    title: "קריאה: טבע ומזג אוויר",
    titleEn: "Reading: Nature and Weather",
    cover: "rainbow",
    units: [
      {
        level: 1,
        title: "A Rainy Day",
        titleHe: "יום גשום",
        text: [
          "Today it is raining. The sky is gray, and it is cold outside.",
          "I wear my coat and my boots. I take my big umbrella. I jump in the puddles on the way to school. Splash!",
        ],
        questions: [
          mc("What color is the sky?", "באיזה צבע השמיים?", ["gray", "blue", "yellow"], ["אפור", "כחול", "צהוב"]),
          tf("It is hot outside.", "בחוץ חם.", false),
          word("מגפיים", "boots"),
          mc("What does the writer take?", "מה הכותב לוקח?", ["his big umbrella", "his ball", "his bike"], ["את המטרייה הגדולה שלו", "את הכדור שלו", "את האופניים שלו"]),
          openHe("מה הכותב עושה בדרך לבית הספר?", "What does the writer do on the way to school?", "הוא קופץ בשלוליות.", "He jumps in the puddles.", ["קופץ", "קפיצ", "שלולי", "jump", "puddle"]),
        ],
      },
      {
        level: 1,
        title: "The Old Tree",
        titleHe: "העץ הזקן",
        text: [
          "There is a big tree in our yard. It is an old olive tree. It is more than one hundred years old!",
          "Birds live in the tree. In the summer, we sit in its shade. In the autumn, we pick olives from it.",
        ],
        questions: [
          mc("What kind of tree is it?", "איזה עץ זה?", ["an olive tree", "an apple tree", "a palm tree"], ["עץ זית", "עץ תפוח", "עץ דקל"]),
          tf("The tree is more than one hundred years old.", "העץ בן יותר ממאה שנה.", true),
          complete("In the summer, we sit in its ___.", "shade"),
          word("חצר", "yard"),
          openHe("מה עושים עם העץ בסתיו?", "What do they do with the tree in the autumn?", "קוטפים ממנו זיתים.", "They pick olives from it.", ["קוטפ", "קטיפ", "זית", "pick", "olive"]),
        ],
      },
      {
        level: 2,
        title: "Snow in Jerusalem",
        titleHe: "שלג בירושלים",
        text: [
          "It almost never snows in my city, Jerusalem. But last winter, something special happened. When I woke up in the morning, everything outside was white!",
          "There was no school that day, so my brothers and I ran outside. We made a big snowman with a carrot for a nose and stones for eyes. Then we had a snowball fight with our neighbors. In the afternoon, the sun came out, and by the evening, the snow was almost gone.",
        ],
        questions: [
          mc("What did the writer see when he woke up?", "מה הכותב ראה כשהתעורר?", ["Everything was white.", "There was a big storm.", "There was a rainbow."], ["הכול היה לבן.", "הייתה סערה גדולה.", "הייתה קשת בענן."]),
          tf("It snows in Jerusalem every winter.", "בכל חורף יורד שלג בירושלים.", false),
          multi("What did they use to make the snowman? Choose two.", "במה הם השתמשו כדי לבנות את איש השלג? בחרו שניים.", ["a carrot", "stones", "a hat", "a ball"], ["גזר", "אבנים", "כובע", "כדור"]),
          word("שכנים", "neighbors"),
          complete("In the afternoon, the ___ came out.", "sun"),
          openHe("למה הילדים לא הלכו לבית הספר באותו יום?", "Why didn't the children go to school that day?", "כי לא היו לימודים בגלל השלג.", "Because there was no school that day, because of the snow.", ["לימוד", "בית ספר", "בית הספר", "שלג", "school", "snow"]),
        ],
      },
      {
        level: 2,
        title: "The Life of a Butterfly",
        titleHe: "החיים של פרפר",
        text: [
          "A butterfly starts its life as a tiny egg on a leaf. A small caterpillar comes out of the egg. The caterpillar is very hungry, and it eats leaves all day. It grows bigger and bigger.",
          "After two weeks, the caterpillar makes a hard case around its body. Inside the case, something amazing happens. The caterpillar changes slowly. After ten days, the case opens, and a beautiful butterfly comes out. It opens its wings and flies away.",
        ],
        questions: [
          mc("What does the caterpillar eat?", "מה הזחל אוכל?", ["leaves", "flowers", "eggs"], ["עלים", "פרחים", "ביצים"]),
          tf("A butterfly starts its life as an egg.", "פרפר מתחיל את חייו כביצה.", true),
          word("זחל", "caterpillar"),
          complete("After two weeks, the caterpillar makes a hard ___ around its body.", "case"),
          multi("Which two sentences are true?", "אילו שני משפטים נכונים?", ["The caterpillar grows bigger and bigger.", "The butterfly comes out after ten days.", "The egg is very big.", "The caterpillar sleeps all day."], ["הזחל גדל ועוד גדל.", "הפרפר יוצא אחרי עשרה ימים.", "הביצה גדולה מאוד.", "הזחל ישן כל היום."]),
          openHe("מה הפרפר עושה כשהוא יוצא?", "What does the butterfly do when it comes out?", "הוא פותח את הכנפיים ועף.", "It opens its wings and flies away.", ["כנפ", "עף", "מעופף", "wing", "fl"]),
        ],
      },
      {
        level: 3,
        title: "Every Drop Counts",
        titleHe: "כל טיפה חשובה",
        text: [
          "Israel is a small country with very little rain. For many years, people here worried about water. The Sea of Galilee, our biggest lake, was getting lower and lower.",
          "Today, Israel uses clever ways to save water. Farmers use drip irrigation: thin pipes bring a few drops of water straight to the roots of each plant, so no water is wasted. Almost ninety percent of the water from our homes is cleaned and used again on farms.",
          "Israel also takes salt out of seawater to make fresh water. Big factories near the sea do this every day. But saving water starts at home, too. You can take shorter showers and turn off the tap while you brush your teeth.",
        ],
        questions: [
          mc("Why did people in Israel worry about water?", "למה אנשים בישראל דאגו בגלל מים?", ["There is very little rain.", "The sea is too big.", "It rains too much.", "There are too many lakes."], ["יורד מעט מאוד גשם.", "הים גדול מדי.", "יורד יותר מדי גשם.", "יש יותר מדי אגמים."]),
          tf("Almost ninety percent of the water from homes is used again on farms.", "כמעט תשעים אחוז מהמים מהבתים משמשים שוב בחקלאות.", true),
          quote("Choose the sentence that explains how drip irrigation works.", "בחרו את המשפט שמסביר איך עובדת השקיה בטפטוף.", "Farmers use drip irrigation: thin pipes bring a few drops of water straight to the roots of each plant, so no water is wasted."),
          word("שורשים", "roots"),
          complete("Israel takes salt out of ___ to make fresh water.", "seawater", ["seawater", "sea"]),
          multi("Which two things can you do at home to save water?", "אילו שני דברים אפשר לעשות בבית כדי לחסוך במים?", ["take shorter showers", "turn off the tap while you brush your teeth", "water the garden at noon", "fill the bath every day"], ["להתקלח מקלחות קצרות יותר", "לסגור את הברז בזמן צחצוח שיניים", "להשקות את הגינה בצהריים", "למלא את האמבטיה כל יום"]),
          openEn("What was happening to the Sea of Galilee?", "מה קרה לכנרת?", "It was getting lower and lower.", ["lower", "low", "less", "small"]),
        ],
      },
      {
        level: 4,
        title: "The Island Born from Fire",
        titleHe: "האי שנולד מאש",
        text: [
          "On a cold morning in November 1963, the crew of a fishing boat near Iceland saw something strange. Black smoke was rising from the sea. At first, the captain thought another ship was on fire. But there was no ship. Under the water, a volcano was erupting.",
          "The eruption went on for more than three years. Hot lava came up from the bottom of the sea and cooled in the cold water. Slowly, a new island grew. People called it Surtsey, after a fire giant from an old story of Iceland.",
          "Scientists were very excited. Here was a chance to see how life comes to a brand-new land. They decided that only a few scientists could visit the island, so people would not bring seeds or animals with them by mistake.",
          "The first plant was found in 1965. Its seeds came with the sea water. Later, birds came and brought more seeds. Today, more than sixty kinds of plants grow on Surtsey, and many birds build their nests there. The island that was born from fire is now full of life.",
        ],
        questions: [
          mc("What did the fishermen see in November 1963?", "מה ראו הדייגים בנובמבר 1963?", ["black smoke rising from the sea", "a ship on fire", "a big whale", "a new boat"], ["עשן שחור שעולה מהים", "ספינה בוערת", "לווייתן גדול", "סירה חדשה"]),
          seq(["Black smoke rose from the sea.", "A new island grew.", "The first plant was found on Surtsey.", "Birds brought more seeds."]),
          tf("Anyone can visit Surtsey.", "כל אחד יכול לבקר בסורטסיי.", false),
          quote("Choose the sentence that explains why only a few scientists can visit the island.", "בחרו את המשפט שמסביר למה רק מעט מדענים יכולים לבקר באי.", "They decided that only a few scientists could visit the island, so people would not bring seeds or animals with them by mistake."),
          word("קנים", "nests"),
          multi("How did seeds come to Surtsey? Choose two.", "איך הגיעו זרעים לסורטסיי? בחרו שניים.", ["with the sea water", "with birds", "with the scientists", "with the fishing boat"], ["עם מי הים", "עם ציפורים", "עם המדענים", "עם סירת הדייגים"]),
          openEn("Why were the scientists excited about Surtsey?", "למה המדענים התרגשו בגלל סורטסיי?", "It was a chance to see how life comes to a brand-new land.", ["life", "plant", "new land", "brand"]),
        ],
      },
    ],
  });

  /* ── Trips in Israel ── */
  SETS.push({
    id: "read-israel",
    title: "קריאה: טיולים בישראל",
    titleEn: "Reading: Trips in Israel",
    cover: "bus",
    units: [
      {
        level: 1,
        title: "At the Beach in Eilat",
        titleHe: "בחוף באילת",
        text: [
          "In the summer, my family goes to Eilat. It is very hot there.",
          "The sea is blue and clear. I swim and look at the colorful fish. My dad and I build a big sand castle.",
        ],
        questions: [
          mc("Where does the family go in the summer?", "לאן המשפחה נוסעת בקיץ?", ["to Eilat", "to Haifa", "to the mountains"], ["לאילת", "לחיפה", "להרים"]),
          tf("It is cold in Eilat.", "באילת קר.", false),
          word("צבעוניים", "colorful"),
          mc("What do the writer and his dad build?", "מה הכותב ואבא שלו בונים?", ["a sand castle", "a boat", "a house"], ["ארמון חול", "סירה", "בית"]),
          openHe("מה הכותב עושה בים?", "What does the writer do in the sea?", "הוא שוחה ומסתכל על הדגים הצבעוניים.", "He swims and looks at the colorful fish.", ["שוחה", "שחי", "דג", "swim", "fish"]),
        ],
      },
      {
        level: 1,
        title: "A Trip to the Golan",
        titleHe: "טיול בגולן",
        text: [
          "Today our class is on a trip in the Golan. We walk on a path next to a river.",
          "The water is cold. There are big rocks and green trees. At the end of the path, we see a waterfall. It is so beautiful!",
        ],
        questions: [
          mc("Where is the class?", "איפה הכיתה?", ["in the Golan", "in the desert", "in the city"], ["בגולן", "במדבר", "בעיר"]),
          tf("The water in the river is hot.", "המים בנחל חמים.", false),
          complete("At the end of the path, we see a ___.", "waterfall"),
          word("שביל", "path"),
          openHe("מה יש ליד הנחל? כתבו דבר אחד.", "What is next to the river? Write one thing.", "סלעים גדולים ועצים ירוקים.", "Big rocks and green trees.", ["סלע", "עץ", "עצים", "rock", "tree"]),
        ],
      },
      {
        level: 2,
        title: "Masada at Sunrise",
        titleHe: "מצדה בזריחה",
        text: [
          "Last spring, my dad and I climbed Masada. We started at four o'clock in the morning, when it was still dark. The path was long and steep, and we stopped many times to drink water.",
          "After one hour, we reached the top. Just then, the sun came up over the mountains of Jordan. The sky turned orange and pink, and the Dead Sea below us began to shine. Dad told me the story of the people who lived on Masada two thousand years ago. It was a morning I will never forget.",
        ],
        questions: [
          mc("When did they start climbing?", "מתי הם התחילו לטפס?", ["at four o'clock in the morning", "at noon", "in the evening"], ["בארבע לפנות בוקר", "בצהריים", "בערב"]),
          tf("The path was short and easy.", "השביל היה קצר וקל.", false),
          multi("What did they see from the top? Choose two.", "מה הם ראו מלמעלה? בחרו שניים.", ["the sun coming up", "the Dead Sea", "a big city", "a forest"], ["את השמש עולה", "את ים המלח", "עיר גדולה", "יער"]),
          word("תלול", "steep"),
          complete("After one hour, we reached the ___.", "top"),
          openHe("מה אבא סיפר לכותב למעלה?", "What did Dad tell the writer at the top?", "את הסיפור של האנשים שגרו במצדה לפני אלפיים שנה.", "The story of the people who lived on Masada two thousand years ago.", ["סיפור", "מצדה", "אנשים", "אלפיים", "story", "people", "masada"]),
        ],
      },
      {
        level: 2,
        title: "The Old City of Akko",
        titleHe: "העיר העתיקה של עכו",
        text: [
          "Akko is one of the oldest cities in the world. It is on the coast in the north of Israel. The old part of the city has thick stone walls and narrow streets.",
          "Under the city, there is a long tunnel. Hundreds of years ago, knights dug it to go from their castle to the sea. Today, visitors walk through the tunnel with flashlights. After that, you can eat fresh fish at the port and watch the boats come in.",
        ],
        questions: [
          mc("Where is Akko?", "איפה עכו?", ["on the coast in the north of Israel", "in the desert", "near Eilat"], ["על החוף בצפון ישראל", "במדבר", "ליד אילת"]),
          tf("The old city has wide streets.", "בעיר העתיקה יש רחובות רחבים.", false),
          word("אבירים", "knights", ["knight"]),
          complete("Visitors walk through the tunnel with ___.", "flashlights", ["flashlight", "torch"]),
          multi("Which two things can you do in Akko?", "אילו שני דברים אפשר לעשות בעכו?", ["walk through a tunnel", "eat fresh fish at the port", "ski on the mountain", "ride a camel in the desert"], ["ללכת במנהרה", "לאכול דגים טריים בנמל", "לגלוש בסקי על ההר", "לרכוב על גמל במדבר"]),
          openHe("למה האבירים חפרו את המנהרה?", "Why did the knights dig the tunnel?", "כדי ללכת מהטירה שלהם אל הים.", "To go from their castle to the sea.", ["טיר", "ים", "מבצר", "castle", "sea"]),
        ],
      },
      {
        level: 3,
        title: "Lost on the Trail",
        titleHe: "אבודים בשביל",
        text: [
          "Last summer, my cousin Omri and I went on a hike in the Ein Gedi nature reserve with our fathers. The trail went up through the desert to a small spring. We saw ibexes jumping on the rocks above us.",
          "Near the spring, Omri and I ran ahead to look at a hyrax sitting in the sun. When we turned around, our fathers were gone. We called their names, but nobody answered. The trail split into two paths, and we did not know which one to take.",
          "I remembered what our guide at school had said: when you are lost, stay in one place. So we sat in the shade, drank some water and waited. After twenty minutes, we heard Dad's voice. He was not angry. He hugged us and said that we did exactly the right thing.",
        ],
        questions: [
          mc("What animals did the boys see on the rocks?", "אילו בעלי חיים הילדים ראו על הסלעים?", ["ibexes", "camels", "dogs", "goats"], ["יעלים", "גמלים", "כלבים", "עזים"]),
          tf("Dad was angry with the boys.", "אבא כעס על הילדים.", false),
          seq(["The boys saw ibexes on the rocks.", "The boys ran ahead to look at a hyrax.", "The boys sat in the shade and waited.", "The boys heard Dad's voice."]),
          quote("Choose the sentence that tells what to do when you are lost.", "בחרו את המשפט שאומר מה לעשות כשהולכים לאיבוד.", "I remembered what our guide at school had said: when you are lost, stay in one place."),
          word("מעיין", "spring"),
          complete("The trail split into two ___.", "paths", ["path"]),
          openEn("Why did Dad say that the boys did the right thing?", "למה אבא אמר שהילדים עשו את הדבר הנכון?", "Because they stayed in one place and waited.", ["stay", "wait", "place", "sat"]),
        ],
      },
      {
        level: 4,
        title: "The Train to Jerusalem",
        titleHe: "הרכבת לירושלים",
        text: [
          "For more than one hundred years, the trip by train from the coast to Jerusalem was slow. The first railway opened in 1892. The train climbed through the mountains on a narrow, winding track, and the trip from Jaffa took almost four hours.",
          "Over the years, people dreamed of a faster train. But building one was very hard. Jerusalem is high in the mountains, about eight hundred meters above the sea. Engineers had to plan a new line that would go straight through the hills, not around them.",
          "The work took about fifteen years. Workers dug long tunnels under the mountains and built tall bridges over the valleys. One of the bridges is about ninety-five meters high, the tallest railway bridge in Israel. The station in Jerusalem was built eighty meters under the ground, and it is one of the deepest train stations in the world.",
          "In 2018, the new fast train began to run. Today, the trip from Tel Aviv to Jerusalem takes only about thirty-five minutes.",
        ],
        questions: [
          mc("When did the first railway to Jerusalem open?", "מתי נפתחה מסילת הרכבת הראשונה לירושלים?", ["in 1892", "in 2018", "in 1948", "in 1900"], ["ב־1892", "ב־2018", "ב־1948", "ב־1900"]),
          tf("The old train went straight through the hills.", "הרכבת הישנה נסעה ישר דרך הגבעות.", false),
          quote("Choose the sentence that explains why building a fast train was hard.", "בחרו את המשפט שמסביר למה היה קשה לבנות רכבת מהירה.", "Jerusalem is high in the mountains, about eight hundred meters above the sea."),
          multi("Which two things did the workers build?", "אילו שני דברים הפועלים בנו?", ["long tunnels", "tall bridges", "a new airport", "a big port"], ["מנהרות ארוכות", "גשרים גבוהים", "שדה תעופה חדש", "נמל גדול"]),
          seq(["The first railway opened.", "People dreamed of a faster train.", "Workers dug tunnels and built bridges.", "The new fast train began to run."]),
          word("מהנדסים", "engineers", ["engineer"]),
          openEn("How long does the trip from Tel Aviv to Jerusalem take today?", "כמה זמן לוקחת היום הנסיעה מתל אביב לירושלים?", "About thirty-five minutes.", ["thirty", "35"]),
        ],
      },
    ],
  });

  /* ── Science and inventions ── */
  SETS.push({
    id: "read-science",
    title: "קריאה: מדע והמצאות",
    titleEn: "Reading: Science and Inventions",
    cover: "computer",
    units: [
      {
        level: 1,
        title: "The Moon",
        titleHe: "הירח",
        text: [
          "Look at the sky at night. You can see the moon. The moon is big and round. Sometimes it looks like a thin smile!",
          "There is no air on the moon, so you can't breathe there. Men walked on the moon in 1969.",
        ],
        questions: [
          mc("When can you see the moon?", "מתי אפשר לראות את הירח?", ["at night", "only in the morning", "never"], ["בלילה", "רק בבוקר", "אף פעם"]),
          tf("There is air on the moon.", "יש אוויר על הירח.", false),
          word("עגול", "round"),
          mc("When did men walk on the moon?", "מתי אנשים הלכו על הירח?", ["in 1969", "in 2000", "in 1900"], ["ב־1969", "ב־2000", "ב־1900"]),
          openHe("למה אי אפשר לנשום על הירח?", "Why can't you breathe on the moon?", "כי אין שם אוויר.", "Because there is no air there.", ["אוויר", "אויר", "air"]),
        ],
      },
      {
        level: 1,
        title: "My Robot",
        titleHe: "הרובוט שלי",
        text: [
          "I have a toy robot. His name is Bolt. Bolt is small and silver. He has two arms and four wheels.",
          "Bolt can move and talk. He can say hello and good night. I charge him with a cable every evening.",
        ],
        questions: [
          mc("What color is Bolt?", "באיזה צבע בולט?", ["silver", "red", "green"], ["כסוף", "אדום", "ירוק"]),
          tf("Bolt has two legs.", "לבולט יש שתי רגליים.", false),
          complete("Bolt has two arms and four ___.", "wheels", ["wheel"]),
          word("כבל", "cable"),
          openHe("מה בולט יכול לעשות? כתבו דבר אחד.", "What can Bolt do? Write one thing.", "לזוז ולדבר.", "Move and talk.", ["זז", "לזוז", "מדבר", "לדבר", "אומר", "שלום", "move", "talk", "say", "hello"]),
        ],
      },
      {
        level: 2,
        title: "Why Is the Sky Blue?",
        titleHe: "למה השמיים כחולים?",
        text: [
          "Have you ever asked why the sky is blue? The light from the sun looks white, but it has all the colors of the rainbow in it.",
          "When sunlight comes into the air around the Earth, the blue light bounces around in every direction. So when we look up, we see blue everywhere. In the evening, the sun is low, and its light travels a longer way through the air. That is why the sky turns orange and red at sunset.",
        ],
        questions: [
          mc("What color does sunlight look?", "באיזה צבע נראה אור השמש?", ["white", "blue", "green"], ["לבן", "כחול", "ירוק"]),
          tf("Sunlight has all the colors of the rainbow in it.", "באור השמש יש את כל צבעי הקשת.", true),
          multi("What colors is the sky at sunset? Choose two.", "באילו צבעים השמיים בשקיעה? בחרו שניים.", ["orange", "red", "green", "black"], ["כתום", "אדום", "ירוק", "שחור"]),
          word("שקיעה", "sunset"),
          complete("In the evening, the sun is ___.", "low"),
          openHe("למה אנחנו רואים כחול בכל מקום כשאנחנו מסתכלים למעלה?", "Why do we see blue everywhere when we look up?", "כי האור הכחול מקפץ לכל הכיוונים באוויר.", "Because the blue light bounces around in every direction in the air.", ["כחול", "כיוונ", "מקפץ", "קופץ", "blue", "direction", "bounce"]),
        ],
      },
      {
        level: 2,
        title: "The Wright Brothers",
        titleHe: "האחים רייט",
        text: [
          "Wilbur and Orville Wright were two brothers from America. As boys, they loved to build things. Their father once gave them a toy helicopter, and they played with it until it broke. Then they built a new one.",
          "When they grew up, the brothers had a bike shop. But they dreamed of flying. They built gliders and tested them again and again. On December 17, 1903, Orville flew the first airplane with an engine. The flight was only twelve seconds long, but it changed the world.",
        ],
        questions: [
          mc("What did the brothers have when they grew up?", "מה היה לאחים כשגדלו?", ["a bike shop", "a car factory", "a toy shop"], ["חנות אופניים", "מפעל מכוניות", "חנות צעצועים"]),
          tf("The first flight was twelve minutes long.", "הטיסה הראשונה נמשכה שתים עשרה דקות.", false),
          word("חלמו", "dreamed"),
          complete("Their father once gave them a toy ___.", "helicopter"),
          multi("Which two sentences are true?", "אילו שני משפטים נכונים?", ["The brothers loved to build things.", "Orville flew the first airplane with an engine.", "Wilbur and Orville were from England.", "The first flight was in 1803."], ["האחים אהבו לבנות דברים.", "אורוויל הטיס את המטוס הראשון עם מנוע.", "וילבר ואורוויל היו מאנגליה.", "הטיסה הראשונה הייתה ב־1803."]),
          openHe("מה עשו האחים כשמסוק הצעצוע נשבר?", "What did the brothers do when the toy helicopter broke?", "הם בנו מסוק חדש.", "They built a new one.", ["בנו", "בנה", "חדש", "built", "build", "new"]),
        ],
      },
      {
        level: 3,
        title: "The Melted Chocolate Bar",
        titleHe: "חטיף השוקולד שנמס",
        text: [
          "In 1945, an American engineer named Percy Spencer was working with radar machines. These machines use invisible waves to find airplanes in the sky. One day, Percy stood near a machine and put his hand in his pocket. The chocolate bar in his pocket had melted!",
          "Percy was curious. The next day, he brought some corn kernels and put them near the machine. Soon, they began to pop all over the room. Then he tried an egg. It got so hot that it exploded in the face of another worker!",
          "Percy understood that the waves could cook food very quickly. His company built the first microwave oven in 1947. It was almost two meters tall and very expensive. Today, small microwave ovens are in millions of kitchens around the world, all because of a melted chocolate bar.",
        ],
        questions: [
          mc("What did Percy find in his pocket?", "מה פרסי מצא בכיס שלו?", ["a melted chocolate bar", "a broken egg", "popcorn", "a small radar"], ["חטיף שוקולד נמס", "ביצה שבורה", "פופקורן", "מכ״ם קטן"]),
          tf("The first microwave oven was small and cheap.", "המיקרוגל הראשון היה קטן וזול.", false),
          seq(["Percy's chocolate bar melted.", "Percy put corn kernels near the machine.", "An egg exploded.", "His company built the first microwave oven."]),
          quote("Choose the sentence that shows that Percy wanted to understand what happened.", "בחרו את המשפט שמראה שפרסי רצה להבין מה קרה.", "Percy was curious."),
          word("בלתי נראים", "invisible"),
          complete("Percy understood that the waves could cook food very ___.", "quickly", ["quick", "fast"]),
          openEn("What do radar machines do?", "מה עושות מכונות מכ״ם?", "They use invisible waves to find airplanes in the sky.", ["find", "airplane", "plane", "wave"]),
        ],
      },
      {
        level: 4,
        title: "The Secret Dance of the Bees",
        titleHe: "הריקוד הסודי של הדבורים",
        text: [
          "For thousands of years, people watched bees fly from flower to flower. But one question puzzled scientists: when a bee finds a field full of flowers, how does it tell the other bees where to go?",
          "In the 1920s, an Austrian scientist named Karl von Frisch decided to find the answer. He built hives with glass walls, so he could watch the bees inside. He put bowls of sugar water in different places and marked the bees that found them with small dots of paint.",
          "What he saw amazed him. When a marked bee came back to the hive, it did a special dance. If the food was close, the bee danced in a circle. If the food was far away, it did a “waggle dance”: it walked in a straight line and shook its body from side to side. The direction of the line showed where the food was, and the length of the dance showed how far it was.",
          "At first, many scientists did not believe that tiny insects could talk with each other in this way. But other researchers did the same tests and got the same results. In 1973, von Frisch won the Nobel Prize for his discovery.",
        ],
        questions: [
          mc("What question puzzled scientists?", "איזו שאלה הטרידה את המדענים?", ["how bees tell other bees where the food is", "how bees make honey", "why bees are yellow", "how long bees live"], ["איך דבורים מספרות לדבורים אחרות איפה האוכל", "איך דבורים מכינות דבש", "למה דבורים צהובות", "כמה זמן דבורים חיות"]),
          tf("At first, all scientists believed von Frisch.", "בהתחלה, כל המדענים האמינו לפון פריש.", false),
          multi("Which two things does the waggle dance show?", "אילו שני דברים ריקוד הכשכוש מראה?", ["where the food is", "how far the food is", "how much honey there is", "how old the bee is"], ["איפה האוכל", "כמה רחוק האוכל", "כמה דבש יש", "בת כמה הדבורה"]),
          quote("Choose the sentence that tells what a bee does when the food is close.", "בחרו את המשפט שמספר מה דבורה עושה כשהאוכל קרוב.", "If the food was close, the bee danced in a circle."),
          seq(["Von Frisch built hives with glass walls.", "He marked bees with dots of paint.", "He saw the bees dance.", "He won the Nobel Prize."]),
          word("תגלית", "discovery"),
          openEn("Why did von Frisch build hives with glass walls?", "למה פון פריש בנה כוורות עם קירות זכוכית?", "So he could watch the bees inside.", ["watch", "see", "look", "inside"]),
        ],
      },
    ],
  });

  /* ── Holidays ── */
  SETS.push({
    id: "read-holidays",
    title: "קריאה: חגים",
    titleEn: "Reading: Holidays",
    cover: "hol-menorah",
    units: [
      {
        level: 1,
        title: "Hanukkah Lights",
        titleHe: "אורות חנוכה",
        text: [
          "Hanukkah is a holiday of light. It is eight days long.",
          "Every night, we light candles in the menorah. On the first night, we light one candle. On the last night, we light eight! We eat sufganiyot and play with a dreidel.",
        ],
        questions: [
          mc("How long is Hanukkah?", "כמה זמן נמשכת חנוכה?", ["eight days", "one day", "seven days"], ["שמונה ימים", "יום אחד", "שבעה ימים"]),
          tf("On the first night, we light eight candles.", "בלילה הראשון מדליקים שמונה נרות.", false),
          word("נרות", "candles", ["candle"]),
          mc("What do we play with?", "במה משחקים?", ["a dreidel", "a ball", "a kite"], ["סביבון", "כדור", "עפיפון"]),
          openHe("מה אוכלים בחנוכה, לפי הטקסט?", "What do we eat on Hanukkah, according to the text?", "סופגניות.", "Sufganiyot (doughnuts).", ["סופגני", "sufganiyot", "doughnut", "donut"]),
        ],
      },
      {
        level: 1,
        title: "Our Sukkah",
        titleHe: "הסוכה שלנו",
        text: [
          "Every year, Dad and I build a sukkah in our yard. We use wood and palm leaves for the roof.",
          "My brothers and I make paper chains and pictures. We hang them in the sukkah. For seven days, we eat all our meals there.",
        ],
        questions: [
          mc("Where do they build the sukkah?", "איפה בונים את הסוכה?", ["in the yard", "on the roof", "in the park"], ["בחצר", "על הגג", "בפארק"]),
          tf("They eat in the sukkah for seven days.", "אוכלים בסוכה שבעה ימים.", true),
          complete("We use wood and palm leaves for the ___.", "roof"),
          word("ארוחות", "meals", ["meal"]),
          openHe("מה הילדים מכינים לסוכה?", "What do the children make for the sukkah?", "שרשראות נייר וציורים.", "Paper chains and pictures.", ["שרשר", "נייר", "ציור", "תמונ", "chain", "paper", "picture"]),
        ],
      },
      {
        level: 2,
        title: "The Birthday of the Trees",
        titleHe: "יום ההולדת של העצים",
        text: [
          "Tu BiShvat is the New Year of the trees. It comes in the winter, when the almond trees start to bloom with white and pink flowers.",
          "On Tu BiShvat, many children in Israel plant trees. Last year, my class planted ten small trees near our school. We dug holes, put the trees in and gave them water. We also ate dried fruit, like figs, dates and raisins. Now our trees are bigger than me!",
        ],
        questions: [
          mc("What is Tu BiShvat?", "מה זה ט״ו בשבט?", ["the New Year of the trees", "a summer holiday", "a day of sports"], ["ראש השנה לאילנות", "חג בקיץ", "יום ספורט"]),
          tf("Tu BiShvat comes in the summer.", "ט״ו בשבט חל בקיץ.", false),
          multi("What dried fruit did the class eat? Choose two.", "אילו פירות יבשים הכיתה אכלה? בחרו שניים.", ["figs", "dates", "apples", "oranges"], ["תאנים", "תמרים", "תפוחים", "תפוזים"]),
          word("שקד", "almond"),
          complete("Last year, my class planted ten small ___.", "trees", ["tree"]),
          openHe("איך הילדים שתלו את העצים? כתבו דבר אחד שעשו.", "How did the children plant the trees? Write one thing they did.", "הם חפרו בורות, שמו את העצים והשקו אותם.", "They dug holes, put the trees in and gave them water.", ["חפר", "בור", "מים", "השק", "שמו", "dug", "hole", "water"]),
        ],
      },
      {
        level: 2,
        title: "The Seder Night",
        titleHe: "ליל הסדר",
        text: [
          "Passover is the holiday of freedom. On the first night, our whole family sits around a long table for the Seder. We read the Haggadah, which tells the story of how the Jews left Egypt.",
          "The youngest child asks the Four Questions. This year, it was my little brother, Yair. He was nervous, but he sang beautifully. Later, Grandpa hid the afikoman, and all the children looked for it. I found it under a pillow on the sofa!",
        ],
        questions: [
          mc("What does the Haggadah tell?", "מה ההגדה מספרת?", ["how the Jews left Egypt", "how to build a sukkah", "how to make matzah"], ["איך היהודים יצאו ממצרים", "איך בונים סוכה", "איך מכינים מצה"]),
          tf("The oldest child asks the Four Questions.", "הילד הכי גדול שואל את ארבע הקושיות.", false),
          word("חופש", "freedom"),
          complete("I found the afikoman under a ___ on the sofa.", "pillow"),
          multi("Which two sentences about Yair are true?", "אילו שני משפטים על יאיר נכונים?", ["He is the writer's little brother.", "He sang the Four Questions.", "He hid the afikoman.", "He found the afikoman."], ["הוא האח הקטן של הכותב.", "הוא שר את ארבע הקושיות.", "הוא החביא את האפיקומן.", "הוא מצא את האפיקומן."]),
          openHe("מי החביא את האפיקומן?", "Who hid the afikoman?", "סבא.", "Grandpa.", ["סבא", "grandpa", "grandfather"]),
        ],
      },
      {
        level: 3,
        title: "Purim at the Hospital",
        titleHe: "פורים בבית החולים",
        text: [
          "Every Purim, my scout group does something special. We do not only dress up and eat hamantaschen. We also visit children who must spend the holiday in the hospital.",
          "This year, I dressed up as a clown, with a red nose and huge shoes. My friend Itamar came as a magician. Before the visit, we prepared fifty bags of mishloach manot with candy, cookies and small toys. We also practiced a funny show for two weeks.",
          "At the hospital, some of the children were too sick to leave their beds, so we went from room to room. Itamar did magic tricks, and I fell over my big shoes on purpose. The children laughed so hard! One little boy told me that it was the best day he had had in the hospital. That made it my best Purim ever.",
        ],
        questions: [
          mc("What did the writer dress up as?", "למה הכותב התחפש?", ["a clown", "a magician", "a doctor", "a king"], ["ליצן", "קוסם", "רופא", "מלך"]),
          tf("All the children at the hospital came to see the show in one room.", "כל הילדים בבית החולים באו לראות את ההצגה בחדר אחד.", false),
          quote("Choose the sentence that shows that the writer fell on purpose.", "בחרו את המשפט שמראה שהכותב נפל בכוונה.", "Itamar did magic tricks, and I fell over my big shoes on purpose."),
          seq(["The scouts prepared fifty bags of mishloach manot.", "They practiced a funny show.", "They went from room to room in the hospital.", "A little boy said it was his best day in the hospital."]),
          word("קוסם", "magician"),
          complete("Before the visit, we prepared fifty bags of mishloach manot with candy, cookies and small ___.", "toys", ["toy"]),
          openEn("Why was it the writer's best Purim ever?", "למה זה היה הפורים הכי טוב של הכותב?", "Because a little boy said it was the best day he had had in the hospital.", ["boy", "child", "best day", "laugh", "happy"]),
        ],
      },
      {
        level: 4,
        title: "The Shofar Maker",
        titleHe: "יצרן השופרות",
        text: [
          "In a small workshop in the north of Israel, a man named Yehuda makes shofars. His grandfather started the workshop more than sixty years ago, and today Yehuda's sons work with him. In the weeks before Rosh Hashanah, they work from morning until night.",
          "Making a shofar takes a lot of time and patience. A shofar is made from the horn of a ram or a kudu, a large African antelope. First, Yehuda cleans the horn and takes out what is inside. Then he heats it slowly, so he can change its shape. After that, he drills a small hole at the narrow end. This is the part that the player blows into.",
          "The hardest part comes last. Yehuda blows into every shofar he makes. If the sound is not clear and strong, he works on it again. Sometimes a horn cannot be saved at all. Yehuda says that a shofar is not a toy, because it has to call people to wake up and think about their lives.",
          "Today, Yehuda's shofars are sent to Jewish communities all over the world. When he hears a shofar on Rosh Hashanah, he always wonders if it is one of his.",
        ],
        questions: [
          mc("Who started the workshop?", "מי הקים את בית המלאכה?", ["Yehuda's grandfather", "Yehuda", "Yehuda's sons", "a man from Africa"], ["הסבא של יהודה", "יהודה", "הבנים של יהודה", "אדם מאפריקה"]),
          tf("Yehuda never blows into the shofars he makes.", "יהודה אף פעם לא תוקע בשופרות שהוא מכין.", false),
          seq(["Yehuda cleans the horn.", "He heats the horn slowly.", "He drills a small hole.", "He blows into the shofar."]),
          quote("Choose the sentence that shows what Yehuda does if the sound is not good.", "בחרו את המשפט שמראה מה יהודה עושה אם הצליל לא טוב.", "If the sound is not clear and strong, he works on it again."),
          multi("From which two animals' horns are shofars made?", "מקרניים של אילו שני בעלי חיים מכינים שופרות?", ["a ram", "a kudu", "a cow", "a camel"], ["איל", "קודו", "פרה", "גמל"]),
          word("סבלנות", "patience"),
          openEn("Why does Yehuda say that a shofar is not a toy?", "למה יהודה אומר ששופר הוא לא צעצוע?", "Because it has to call people to wake up and think about their lives.", ["wake", "think", "call", "lives", "life"]),
        ],
      },
    ],
  });

  /* ── Short stories ── */
  SETS.push({
    id: "read-stories",
    title: "קריאה: סיפורים קצרים",
    titleEn: "Reading: Short Stories",
    cover: "book",
    units: [
      {
        level: 1,
        title: "The Lost Kite",
        titleHe: "העפיפון שעף",
        text: [
          "Ben has a new kite. It is red and yellow. Ben runs, and the kite flies high in the sky.",
          "Oh no! The wind is too strong. The kite flies away and gets stuck in a tree. Ben's big brother climbs the tree and brings it back.",
        ],
        questions: [
          mc("What colors is the kite?", "באילו צבעים העפיפון?", ["red and yellow", "blue and green", "black and white"], ["אדום וצהוב", "כחול וירוק", "שחור ולבן"]),
          tf("The kite gets stuck in a house.", "העפיפון נתקע בבית.", false),
          word("חזקה", "strong"),
          mc("Who brings the kite back?", "מי מחזיר את העפיפון?", ["Ben's big brother", "Ben's dad", "Ben"], ["האח הגדול של בן", "אבא של בן", "בן"]),
          openHe("למה העפיפון עף משם?", "Why does the kite fly away?", "כי הרוח חזקה מדי.", "Because the wind is too strong.", ["רוח", "חזק", "wind", "strong"]),
        ],
      },
      {
        level: 1,
        title: "The Lion and the Mouse",
        titleHe: "האריה והעכבר",
        text: [
          "A big lion is sleeping. A little mouse runs on his nose. The lion wakes up and catches the mouse. The mouse says, “Please let me go! One day, I will help you.” The lion laughs and lets him go.",
          "The next week, the lion is caught in a net. The little mouse comes and bites the net. Now the lion is free!",
        ],
        questions: [
          mc("What does the mouse run on?", "על מה העכבר רץ?", ["the lion's nose", "the lion's tail", "a tree"], ["האף של האריה", "הזנב של האריה", "עץ"]),
          tf("The lion eats the mouse.", "האריה אוכל את העכבר.", false),
          complete("The next week, the lion is caught in a ___.", "net"),
          word("חופשי", "free"),
          openHe("איך העכבר עוזר לאריה?", "How does the mouse help the lion?", "הוא כוסס את הרשת, והאריה משתחרר.", "He bites the net, and the lion is free.", ["רשת", "כוסס", "נוגס", "חותך", "net", "bite"]),
        ],
      },
      {
        level: 2,
        title: "The Wrong Bus",
        titleHe: "האוטובוס הלא נכון",
        text: [
          "On his first day at his new school, Roy got on the bus he thought was number 18. He sat by the window and listened to music. After twenty minutes, he looked outside. He did not know any of the streets!",
          "Roy was scared, but he went to the driver and asked for help. The driver smiled and said that this was bus 81, not 18. He called Roy's school and told them what happened. Then he drove Roy all the way to the school gate. Roy was late, but he had a great story to tell his new class.",
        ],
        questions: [
          mc("Which bus did Roy get on?", "על איזה אוטובוס רועי עלה?", ["bus 81", "bus 18", "bus 20"], ["קו 81", "קו 18", "קו 20"]),
          tf("Roy asked the driver for help.", "רועי ביקש עזרה מהנהג.", true),
          multi("What did the driver do? Choose two.", "מה הנהג עשה? בחרו שניים.", ["He called Roy's school.", "He drove Roy to the school gate.", "He got angry with Roy.", "He called Roy's dad."], ["הוא התקשר לבית הספר של רועי.", "הוא הסיע את רועי עד שער בית הספר.", "הוא כעס על רועי.", "הוא התקשר לאבא של רועי."]),
          word("שער", "gate"),
          complete("Roy was late, but he had a great ___ to tell his new class.", "story"),
          openHe("מה רועי עשה כשראה שהוא לא מכיר את הרחובות?", "What did Roy do when he saw that he didn't know the streets?", "הוא הלך לנהג וביקש עזרה.", "He went to the driver and asked for help.", ["נהג", "עזרה", "ביקש", "שאל", "driver", "help", "ask"]),
        ],
      },
      {
        level: 2,
        title: "The Fox and the Grapes",
        titleHe: "השועל והענבים",
        text: [
          "One hot summer day, a hungry fox walked through a field. Suddenly, he saw a bunch of big purple grapes. They were hanging from a vine high above his head. The fox thought the grapes looked sweet and juicy.",
          "The fox jumped as high as he could, but he could not reach the grapes. He tried again and again until he was very tired. Finally, he walked away with his nose in the air. He said that the grapes were probably sour anyway. People still say this when someone pretends not to want something he cannot get.",
        ],
        questions: [
          mc("What color were the grapes?", "באיזה צבע היו הענבים?", ["purple", "green", "red"], ["סגול", "ירוק", "אדום"]),
          tf("The fox reached the grapes on his last try.", "השועל הגיע לענבים בניסיון האחרון.", false),
          word("עסיסיים", "juicy"),
          complete("The fox jumped as high as he could, but he could not ___ the grapes.", "reach", ["reach", "get"]),
          multi("Which two sentences are true?", "אילו שני משפטים נכונים?", ["The fox was hungry.", "The fox tried many times.", "The fox ate the grapes.", "It was a cold winter day."], ["השועל היה רעב.", "השועל ניסה הרבה פעמים.", "השועל אכל את הענבים.", "זה היה יום חורף קר."]),
          openHe("למה השועל אמר שהענבים חמוצים?", "Why did the fox say the grapes were sour?", "כי הוא לא הצליח להגיע אליהם, אז הוא העמיד פנים שהוא לא רוצה אותם.", "Because he could not reach them, so he pretended he didn't want them.", ["הגיע", "להגיע", "השיג", "הצליח", "מעמיד", "העמיד", "reach", "get", "pretend", "could"]),
        ],
      },
      {
        level: 3,
        title: "The Wallet",
        titleHe: "הארנק",
        text: [
          "On his way home from school, Ido found a brown wallet on the sidewalk. Inside, there were five hundred shekels, a bus card and an ID card with a man's photo. Ido had never held so much money in his life.",
          "For a moment, Ido thought about the new soccer shoes he wanted. But then he looked at the photo again. The man was old, and he had kind eyes. Ido imagined how worried he must be. He put the wallet in his bag and walked straight to the police station.",
          "The next evening, someone knocked on Ido's door. It was the old man from the photo. He explained that the money was for his medicine. He thanked Ido again and again and gave him a small box. Inside was an old pocket watch. The man said that his father had given it to him when he was Ido's age, and now it belonged to an honest boy.",
        ],
        questions: [
          mc("Where did Ido find the wallet?", "איפה עידו מצא את הארנק?", ["on the sidewalk", "at school", "on the bus", "in the park"], ["על המדרכה", "בבית הספר", "באוטובוס", "בפארק"]),
          tf("Ido used the money to buy soccer shoes.", "עידו השתמש בכסף כדי לקנות נעלי כדורגל.", false),
          quote("Choose the sentence that shows that Ido thought about how the man felt.", "בחרו את המשפט שמראה שעידו חשב על מה שהאיש מרגיש.", "Ido imagined how worried he must be."),
          seq(["Ido found a wallet.", "Ido thought about new soccer shoes.", "Ido took the wallet to the police station.", "The old man gave Ido a pocket watch."]),
          word("ארנק", "wallet"),
          complete("The man explained that the money was for his ___.", "medicine"),
          openEn("What was in the box that the man gave Ido?", "מה היה בקופסה שהאיש נתן לעידו?", "An old pocket watch.", ["watch", "clock"]),
        ],
      },
      {
        level: 4,
        title: "Stone Soup",
        titleHe: "מרק אבנים",
        text: [
          "Long ago, a tired traveler arrived in a small village. He was very hungry, but the people of the village were poor, and they did not want to share their food with a stranger. They closed their doors and windows when he walked by.",
          "The traveler did not get angry. He put a big pot in the middle of the village square, filled it with water and lit a fire under it. Then he took a smooth gray stone out of his bag and dropped it into the pot. A curious boy came closer and asked what he was making. The traveler told him it was stone soup. He said it was delicious, but it would be even better with an onion.",
          "The boy ran home and came back with an onion. Soon, other people came out to see. One man brought carrots, and another brought potatoes. An old farmer added some salt and beans. Little by little, the pot filled up with good things.",
          "That evening, the whole village sat together and ate the best soup they had ever tasted. Everyone wanted to know the secret of the magic stone. The traveler only smiled. He knew that the real secret was not the stone at all. It was sharing.",
        ],
        questions: [
          mc("Why did the villagers close their doors?", "למה תושבי הכפר סגרו את הדלתות?", ["They did not want to share their food.", "It was very cold.", "They were sleeping.", "They were afraid of the fire."], ["הם לא רצו לחלוק את האוכל שלהם.", "היה קר מאוד.", "הם ישנו.", "הם פחדו מהאש."]),
          tf("The traveler got angry at the villagers.", "המטייל כעס על תושבי הכפר.", false),
          seq(["The traveler put a pot of water on a fire.", "He dropped a stone into the pot.", "A boy brought an onion.", "The whole village ate the soup together."]),
          multi("Which two things did the villagers bring?", "אילו שני דברים תושבי הכפר הביאו?", ["carrots", "potatoes", "meat", "rice"], ["גזר", "תפוחי אדמה", "בשר", "אורז"]),
          quote("Choose the sentence that tells the real secret of the soup.", "בחרו את המשפט שמספר מה הסוד האמיתי של המרק.", "It was sharing."),
          word("אדם זר", "stranger"),
          openEn("How did the traveler get the villagers to help?", "איך המטייל גרם לתושבי הכפר לעזור?", "He said the stone soup would be even better with more things, so they brought food.", ["better", "stone", "soup", "curious", "onion", "brought", "bring"]),
        ],
      },
    ],
  });

  /* ── Every theme becomes a topic in the "reading" group: its passages are
     "reading" exercises, numbered in level order. ── */
  SETS.forEach((set) => {
    TOPICS.push({
      id: set.id,
      group: "reading",
      title: set.title,
      titleEn: set.titleEn,
      cover: set.cover,
      exercises: set.units.map((unit, i) => ({
        id: `${set.id}-${i + 1}`,
        type: "reading",
        level: unit.level,
        title: `רמה ${unit.level} · ${unit.title}`,
        titleEn: `Level ${unit.level} · ${unit.title}`,
        passage: { title: unit.title, titleHe: unit.titleHe, text: unit.text, glossary: null },
        mark: null,
        questions: unit.questions,
      })),
    });
  });

})();
