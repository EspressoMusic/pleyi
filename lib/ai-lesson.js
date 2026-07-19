/* Convert free-form lesson text into structured game content via LLM */

const { normalizeLearningContent } = require("./parse-content");
const { compatibleRoomGames } = require("./room-games");

const VALID_SUBJECTS = ["english", "math", "lifeskills", "science"];

const ENGLISH_GAMES = [
  "word-memory",
  "hangman",
  "spot-diff",
  "tower-stack",
  "word-shop",
  "vocabulary-duel",
  "sentence-scramble",
];

const MATH_GAMES = ["math-memory", "math-duel", "math-blitz", "math-tower", "math-runner", "math-shop"];

function isConfigured() {
  return !!(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY);
}

function getProvider() {
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.GEMINI_API_KEY) return "gemini";
  return null;
}

function pickGameForContent(items, subject) {
  const n = items.length;
  if (subject === "math") {
    if (n >= 6) return "math-memory";
    if (n >= 4) return "math-duel";
    return "math-blitz";
  }
  if (n >= 6) return "word-memory";
  if (n >= 4) return "vocabulary-duel";
  if (n >= 3) return "tower-stack";
  return "vocabulary-duel";
}

function subjectRules(subject) {
  switch (subject) {
    case "math":
      return {
        pairHint: "left = math exercise (e.g. 5+3), right = numeric answer only",
        games: MATH_GAMES,
        titleHint: "short Hebrew title for a math practice game",
      };
    case "lifeskills":
      return {
        pairHint: "left = life skill term in Hebrew, right = brief Hebrew explanation",
        games: ENGLISH_GAMES.filter((id) => id !== "sentence-scramble"),
        titleHint: "short Hebrew title for a life skills learning game",
      };
    case "science":
      return {
        pairHint: "left = science term (Hebrew or formula), right = Hebrew definition",
        games: ENGLISH_GAMES.filter((id) => id !== "sentence-scramble"),
        titleHint: "short Hebrew title for a science vocabulary game",
      };
    default:
      return {
        pairHint: "left = English word or short phrase, right = Hebrew translation",
        games: ENGLISH_GAMES,
        titleHint: "short Hebrew title for an English vocabulary game",
      };
  }
}

function buildPrompt(lessonText, subject) {
  const rules = subjectRules(subject);
  return `You help Israeli teachers turn lesson content into data for educational games.

Subject: ${subject}
Pair rules: ${rules.pairHint}
- Extract 8–24 useful pairs from the lesson (max 30).
- Skip titles, instructions, page numbers, and empty lines.
- Do not invent facts not implied by the lesson; prefer what is clearly taught.
- Choose gameId from: ${rules.games.join(", ")}
- Title: ${rules.titleHint}

Return ONLY valid JSON (no markdown):
{"title":"...","gameId":"...","pairs":[{"left":"...","right":"..."}]}

Lesson content:
${String(lessonText || "").slice(0, 12000)}`;
}

function extractJson(text) {
  const raw = String(text || "").trim();
  if (!raw) throw new Error("תשובה ריקה מה-AI");

  try {
    return JSON.parse(raw);
  } catch {
    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced) {
      return JSON.parse(fenced[1].trim());
    }
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(raw.slice(start, end + 1));
    }
    throw new Error("לא הצלחנו לפענח את תשובת ה-AI");
  }
}

function pairsToText(pairs) {
  return pairs
    .map((p) => {
      const left = String(p?.left ?? p?.en ?? p?.a ?? "").trim();
      const right = String(p?.right ?? p?.he ?? p?.b ?? "").trim();
      if (!left || !right) return null;
      return `${left}=${right}`;
    })
    .filter(Boolean)
    .join("\n");
}

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.35,
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
      },
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || `Gemini error (${res.status})`;
    throw new Error(msg);
  }

  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
  return text;
}

async function callOpenAI(prompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.35,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You output only valid JSON for educational game builders.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || `OpenAI error (${res.status})`;
    throw new Error(msg);
  }

  return data?.choices?.[0]?.message?.content || "";
}

async function generateGameFromLesson({ lessonText, subject = "english" }) {
  if (!isConfigured()) {
    throw new Error("שירות ה-AI לא מוגדר — הוסיפו GEMINI_API_KEY או OPENAI_API_KEY לשרת");
  }

  const text = String(lessonText || "").trim();
  if (text.length < 8) {
    throw new Error("הדביקו תוכן שיעור (לפחות כמה מילים)");
  }

  const subj = VALID_SUBJECTS.includes(subject) ? subject : "english";
  const prompt = buildPrompt(text, subj);
  const provider = getProvider();
  const raw = provider === "openai" ? await callOpenAI(prompt) : await callGemini(prompt);
  const parsed = extractJson(raw);

  const pairs = Array.isArray(parsed?.pairs) ? parsed.pairs : [];
  const draft = pairsToText(pairs);
  if (!draft) {
    throw new Error("ה-AI לא מצא זוגות מתאימים — נסו להדביק טקסט עם מילים או תרגילים");
  }

  const { items, normalized } = normalizeLearningContent(draft, subj);
  if (items.length < 2) {
    throw new Error("לא נוצרו מספיק פריטים — נסו טקסט עם יותר מילים או תרגילים");
  }

  const rules = subjectRules(subj);
  let gameId = String(parsed?.gameId || "").trim();
  if (!rules.games.includes(gameId)) {
    gameId = pickGameForContent(items, subj);
  }

  const title = String(parsed?.title || "").trim().slice(0, 80) || "שיעור מותאם";

  return {
    title,
    subject: subj,
    gameId,
    items,
    normalized,
    itemCount: items.length,
    compatibleGames: compatibleRoomGames(items),
    provider,
  };
}

function buildLessonPlanPrompt({ topic, material, durationMinutes, gradeLevel }) {
  return `You create short, practical Hebrew lesson plans for Israeli teachers.

Topic: ${String(topic || "").trim()}
Grade level: ${String(gradeLevel || "כללי").trim()}
Target duration: ${Number(durationMinutes) || 45} minutes

Lesson material / content:
${String(material || "").slice(0, 12000)}

Rules:
- Write in Hebrew only.
- Keep it SIMPLE, SHORT, and ORGANIZED — suitable for a busy teacher.
- 4–5 sections max. Each section: title, duration in minutes, 1–3 short sentences.
- Do not invent facts far beyond the provided material.

Return ONLY valid JSON (no markdown):
{"title":"...","topic":"...","durationMinutes":45,"goal":"...","sections":[{"title":"...","duration":5,"content":"..."}],"materials":["..."],"tips":["..."]}`;
}

function normalizeLessonPlan(parsed, fallback = {}) {
  const durationMinutes = Math.min(120, Math.max(15, Number(parsed?.durationMinutes) || fallback.durationMinutes || 45));
  const sections = (Array.isArray(parsed?.sections) ? parsed.sections : [])
    .slice(0, 6)
    .map((s) => ({
      title: String(s?.title || "שלב").trim().slice(0, 60) || "שלב",
      duration: Math.min(60, Math.max(1, Number(s?.duration) || 5)),
      content: String(s?.content || "").trim().slice(0, 600),
    }))
    .filter((s) => s.content);

  if (!sections.length) {
    throw new Error("לא נוצרו שלבי שיעור");
  }

  return {
    title: String(parsed?.title || fallback.title || "מערך שיעור").trim().slice(0, 100),
    topic: String(parsed?.topic || fallback.topic || "").trim().slice(0, 100),
    durationMinutes,
    gradeLevel: String(parsed?.gradeLevel || fallback.gradeLevel || "").trim().slice(0, 40),
    goal: String(parsed?.goal || fallback.goal || "").trim().slice(0, 400),
    sections,
    materials: (Array.isArray(parsed?.materials) ? parsed.materials : [])
      .map((m) => String(m || "").trim())
      .filter(Boolean)
      .slice(0, 8),
    tips: (Array.isArray(parsed?.tips) ? parsed.tips : [])
      .map((t) => String(t || "").trim())
      .filter(Boolean)
      .slice(0, 5),
  };
}

function buildTemplateLessonPlan({ topic, material, durationMinutes = 45, gradeLevel = "" }) {
  const cleanTopic = String(topic || "").trim();
  const cleanMaterial = String(material || "").trim();
  const lines = cleanMaterial.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const bullets = lines.length ? lines : [cleanMaterial];
  const title = cleanTopic || bullets[0]?.slice(0, 60) || "מערך שיעור";
  const intro = Math.max(5, Math.round(durationMinutes * 0.1));
  const teach = Math.max(10, Math.round(durationMinutes * 0.35));
  const practice = Math.max(10, Math.round(durationMinutes * 0.3));
  const activity = Math.max(8, Math.round(durationMinutes * 0.15));
  const summary = Math.max(5, durationMinutes - intro - teach - practice - activity);
  const keyPoints = bullets.slice(0, 4).map((b) => `• ${b}`).join("\n");

  return normalizeLessonPlan(
    {
      title: `מערך שיעור: ${title}`,
      topic: title,
      durationMinutes,
      gradeLevel,
      goal: `בסוף השיעור התלמידים יבינו את הנושא "${title}" ויוכלו ליישם את עיקרי החומר.`,
      sections: [
        {
          title: "פתיחה",
          duration: intro,
          content: `חיבור קצר לנושא "${title}" — שאלת פתיחה או דוגמה מהחיים.`,
        },
        {
          title: "העברת החומר",
          duration: teach,
          content: keyPoints || cleanMaterial.slice(0, 400),
        },
        {
          title: "תרגול מודרך",
          duration: practice,
          content: "תרגול בזוגות או בכיתה על נקודות מפתח מהחומר. בדיקת הבנה קצרה.",
        },
        {
          title: "פעילות / משחק",
          duration: activity,
          content: "משחק קצר מ-Pleyi או פעילות אינטראקטивית לחיזוק החומר.",
        },
        {
          title: "סיכום",
          duration: summary,
          content: "שאלות סיכום — מה למדנו היום? מה נשאר פתוח?",
        },
      ],
      materials: ["לוח / מסך", "חומרי השיעור"],
      tips: ["זו טיוטה ראשונית — ערכו לפי הכיתה שלכם", "אפשר לחבר משחק מ-Pleyi לשלב הפעילות"],
    },
    { title: `מערך שיעור: ${title}`, topic: title, durationMinutes, gradeLevel }
  );
}

async function generateLessonPlan({ topic, material, durationMinutes = 45, gradeLevel = "" }) {
  const cleanTopic = String(topic || "").trim();
  const cleanMaterial = String(material || "").trim();
  if (!cleanTopic && !cleanMaterial) {
    throw new Error("נא להזין נושא או חומר לשיעור");
  }
  if (cleanMaterial.length < 8 && !cleanTopic) {
    throw new Error("החומר קצר מדי — הוסיפו עוד פרטים");
  }

  const fallback = buildTemplateLessonPlan({
    topic: cleanTopic,
    material: cleanMaterial,
    durationMinutes,
    gradeLevel,
  });

  if (!isConfigured()) {
    return { ...fallback, source: "template", aiReady: false };
  }

  const provider = getProvider();
  const prompt = buildLessonPlanPrompt({
    topic: cleanTopic || fallback.topic,
    material: cleanMaterial,
    durationMinutes,
    gradeLevel,
  });

  const raw = provider === "openai" ? await callOpenAI(prompt) : await callGemini(prompt);
  const parsed = extractJson(raw);
  const plan = normalizeLessonPlan(parsed, fallback);

  return {
    ...plan,
    source: "ai",
    aiReady: true,
    provider,
  };
}

module.exports = {
  isConfigured,
  getProvider,
  generateGameFromLesson,
  generateLessonPlan,
  pickGameForContent,
};
