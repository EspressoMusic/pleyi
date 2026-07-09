/* Convert free-form lesson text into structured game content via LLM */

const { normalizeLearningContent } = require("./parse-content");
const { compatibleRoomGames } = require("./room-games");

const VALID_SUBJECTS = ["english", "math", "tanakh", "science"];

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
  if (process.env.GEMINI_API_KEY) return "gemini";
  if (process.env.OPENAI_API_KEY) return "openai";
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
    case "tanakh":
      return {
        pairHint: "left = Hebrew word from Tanakh, right = brief Hebrew meaning",
        games: ENGLISH_GAMES.filter((id) => id !== "sentence-scramble"),
        titleHint: "short Hebrew title for a Tanakh vocabulary game",
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
  const raw = provider === "gemini" ? await callGemini(prompt) : await callOpenAI(prompt);
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

module.exports = {
  isConfigured,
  getProvider,
  generateGameFromLesson,
  pickGameForContent,
};
