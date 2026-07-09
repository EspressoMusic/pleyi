require("dotenv").config();

const express = require("express");
const http = require("http");
const fs = require("fs");
const crypto = require("crypto");
const { Server } = require("socket.io");
const path = require("path");
const bookingsLib = require("./lib/bookings");
const miniGames = require("./lib/mini-games");
const roomsLib = require("./lib/rooms");
const { parseLearningContent, normalizeLearningContent } = require("./lib/parse-content");
const { compatibleRoomGames } = require("./lib/room-games");
const premiumLib = require("./lib/premium");
const aiLesson = require("./lib/ai-lesson");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/join", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "join.html"));
});

app.get("/games", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "games.html"));
});

app.get("/room", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "room.html"));
});

app.get("/premium", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "premium.html"));
});

app.get("/play/:gameId", (req, res) => {
  const valid = [
    "word-runner", "spot-diff", "candy-match", "word-shop",
    "vocabulary-duel", "word-memory", "hangman", "sentence-scramble", "spelling-bee",
    "tower-stack",
    "math-blitz", "math-duel", "math-memory", "math-tower", "math-runner", "math-shop",
  ];
  if (!valid.includes(req.params.gameId)) {
    return res.status(404).send("Game not found");
  }
  res.sendFile(path.join(__dirname, "public", "play.html"));
});

function getFirebaseConfig() {
  if (process.env.FIREBASE_API_KEY) {
    return {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
    };
  }
  const configPath = path.join(__dirname, "data", "firebase.json");
  if (fs.existsSync(configPath)) {
    try {
      return JSON.parse(fs.readFileSync(configPath, "utf8"));
    } catch {
      /* ignore */
    }
  }
  return {};
}

app.get("/api/firebase-config", (_req, res) => {
  res.json(getFirebaseConfig());
});

/* ── Premium subscription API ── */
app.get("/api/premium/plans", (_req, res) => {
  const bookingSettings = bookingsLib.getSettings();
  res.json({
    ok: true,
    plans: premiumLib.PLANS,
    premiumGames: premiumLib.PREMIUM_GAMES,
    freeWeeklyCustomGames: premiumLib.FREE_WEEKLY_CUSTOM_GAMES,
    settings: {
      bitPhone: bookingSettings.bitPhone,
      bitPayName: bookingSettings.bitPayName,
      currencySymbol: bookingSettings.currencySymbol || "₪",
    },
  });
});

app.get("/api/premium/status", (req, res) => {
  const uid = String(req.query.uid || "").trim();
  if (!uid) return res.status(400).json({ ok: false, error: "חסר מזהה משתמש" });
  res.json({ ok: true, ...premiumLib.getStatus(uid) });
});

app.post("/api/premium/subscribe", (req, res) => {
  try {
    const { uid, email, planId, method } = req.body || {};
    const record = premiumLib.activateSubscription(uid, email, planId, method);
    res.json({
      ok: true,
      ...premiumLib.getStatus(uid),
      paymentId: record.paymentId,
    });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
});

/* ── AI lesson → game content ── */
app.get("/api/ai/status", (_req, res) => {
  res.json({
    ok: true,
    configured: aiLesson.isConfigured(),
    provider: aiLesson.getProvider(),
  });
});

app.post("/api/ai/generate-game", async (req, res) => {
  try {
    const { lessonText, subject } = req.body || {};
    const result = await aiLesson.generateGameFromLesson({ lessonText, subject });
    res.json({ ok: true, ...result });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
});

/* ── Booking API ── */
function teacherAuth(req, res, next) {
  const pin = req.headers["x-teacher-pin"];
  if (!bookingsLib.verifyTeacherPin(pin)) {
    return res.status(401).json({ ok: false, error: "קוד מורה שגוי" });
  }
  next();
}

app.get("/api/booking/settings", (_req, res) => {
  const s = bookingsLib.getSettings();
  res.json({
    ok: true,
    pricePerLesson: s.pricePerLesson,
    currency: s.currency,
    currencySymbol: s.currencySymbol,
    lessonDurationMinutes: s.lessonDurationMinutes,
    lessonName: s.lessonName,
    bitPhone: s.bitPhone,
    whatsappPhone: s.whatsappPhone || s.bitPhone,
    bitPayName: s.bitPayName,
    paymentMode: process.env.STRIPE_SECRET_KEY ? "stripe" : "bit",
  });
});

app.get("/api/booking/month", (req, res) => {
  const year = Number(req.query.year);
  const month = Number(req.query.month);
  if (!year || !month) return res.status(400).json({ ok: false, error: "שנה וחודש חובה" });
  const settings = bookingsLib.getSettings();
  const days = bookingsLib.getMonthAvailability(year, month, settings, bookingsLib.getBookings());
  res.json({ ok: true, days });
});

app.get("/api/booking/slots", (req, res) => {
  const date = req.query.date;
  if (!date) return res.status(400).json({ ok: false, error: "תאריך חובה" });
  const settings = bookingsLib.getSettings();
  const slots = bookingsLib.generateSlotsForDate(date, settings, bookingsLib.getBookings());
  res.json({ ok: true, slots, settings: { pricePerLesson: settings.pricePerLesson, currencySymbol: settings.currencySymbol, lessonDurationMinutes: settings.lessonDurationMinutes } });
});

app.post("/api/bookings", (req, res) => {
  try {
    const booking = bookingsLib.createBooking(req.body);
    io.to("teacher-dashboard").emit("booking:new", booking);
    res.json({ ok: true, booking });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
});

app.post("/api/bookings/:id/pay", (req, res) => {
  try {
    const method = req.body?.method || "bit";
    const booking =
      method === "card"
        ? bookingsLib.processDemoPayment(req.params.id)
        : bookingsLib.processBitPayment(req.params.id);
    io.to("teacher-dashboard").emit("booking:paid", booking);
    res.json({ ok: true, booking });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
});

app.get("/api/teacher/bookings", teacherAuth, (_req, res) => {
  res.json({ ok: true, bookings: bookingsLib.getTeacherBookings() });
});

app.patch("/api/teacher/bookings/:id", teacherAuth, (req, res) => {
  try {
    const { status } = req.body;
    if (!["paid", "cancelled", "completed"].includes(status)) {
      return res.status(400).json({ ok: false, error: "סטטוס לא תקין" });
    }
    const booking = bookingsLib.updateBookingStatus(req.params.id, status);
    io.to("teacher-dashboard").emit("booking:updated", booking);
    res.json({ ok: true, booking });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
});

const rooms = new Map();

function generateCode() {
  let code;
  do {
    code = String(Math.floor(100000 + Math.random() * 900000));
  } while (rooms.has(code));
  return code;
}

function scheduleTeacherGrace(code) {
  const room = getRoom(code);
  if (!room) return;
  if (room.teacherGraceTimer) clearTimeout(room.teacherGraceTimer);
  room.teacherId = null;
  room.teacherGraceTimer = setTimeout(() => {
    const r = getRoom(code);
    if (r && !r.teacherId) {
      rooms.delete(code);
      io.to(`room:${code}`).emit("room:closed", { reason: "המורה התנתק" });
    }
  }, 60000);
}

function clearTeacherGrace(room) {
  if (room?.teacherGraceTimer) {
    clearTimeout(room.teacherGraceTimer);
    room.teacherGraceTimer = null;
  }
}

function closeRoom(code, reason) {
  const room = getRoom(code);
  if (!room) return;
  clearTeacherGrace(room);
  rooms.delete(code);
  io.to(`room:${code}`).emit("room:closed", { reason });
}

function getRoom(code) {
  return rooms.get(String(code));
}

function roomSummary(room) {
  return roomsLib.roomSummary(room);
}

function emitRoom(code) {
  const room = getRoom(code);
  if (!room) return;
  io.to(`room:${code}`).emit("room:update", roomSummary(room));
}

function getRole(room, socketId) {
  return roomsLib.getRole(room, socketId);
}

function bothConnected(room) {
  return roomsLib.hasStudents(room);
}

function scorePlayer(room, socketId, role, points) {
  roomsLib.addScore(room, socketId, role, points);
}

/* ── Vocabulary bank ── */
const VOCAB = [
  { en: "apple", he: "תפוח", hint: "A red or green fruit" },
  { en: "book", he: "ספר", hint: "You read it" },
  { en: "house", he: "בית", hint: "Where you live" },
  { en: "water", he: "מים", hint: "You drink it every day" },
  { en: "friend", he: "חבר", hint: "Someone you like" },
  { en: "school", he: "בית ספר", hint: "Where students learn" },
  { en: "happy", he: "שמח", hint: "Feeling good" },
  { en: "run", he: "לרוץ", hint: "Move fast on foot" },
  { en: "blue", he: "כחול", hint: "Color of the sky" },
  { en: "cat", he: "חתול", hint: "Meow!" },
  { en: "dog", he: "כלב", hint: "Woof!" },
  { en: "eat", he: "לאכול", hint: "What you do with food" },
  { en: "sleep", he: "לישון", hint: "What you do at night" },
  { en: "big", he: "גדול", hint: "Not small" },
  { en: "small", he: "קטן", hint: "Not big" },
  { en: "learn", he: "ללמוד", hint: "What we do in class" },
  { en: "write", he: "לכתוב", hint: "Use a pen" },
  { en: "read", he: "לקרוא", hint: "Look at words in a book" },
  { en: "sun", he: "שמש", hint: "Bright in the sky" },
  { en: "rain", he: "גשם", hint: "Water from clouds" },
  { en: "family", he: "משפחה", hint: "Parents and siblings" },
  { en: "teacher", he: "מורה", hint: "Teaches students" },
  { en: "student", he: "תלמיד", hint: "Learns at school" },
  { en: "beautiful", he: "יפה", hint: "Very pretty" },
  { en: "quickly", he: "מהר", hint: "In a fast way" },
];

const SENTENCES = [
  { words: ["I", "love", "English"], he: "אני אוהב אנגלית" },
  { words: ["She", "reads", "a", "book"], he: "היא קוראת ספר" },
  { words: ["We", "go", "to", "school"], he: "אנגלית: We go to school" },
  { words: ["The", "cat", "is", "sleeping"], he: "החתול ישן" },
  { words: ["My", "friend", "is", "happy"], he: "החבר שלי שמח" },
  { words: ["It", "is", "raining", "today"], he: "יורד גשם היום" },
  { words: ["Please", "drink", "water"], he: "בבקשה שתו מים" },
  { words: ["The", "sun", "is", "big"], he: "השמש גדולה" },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom(arr, n) {
  return shuffle(arr).slice(0, n);
}

function getRoomLearningItems(room) {
  if (room.learningMaterial?.trim()) {
    const items = parseLearningContent(room.learningMaterial);
    room.learningItems = items;
    return items;
  }
  return room.learningItems || [];
}

function getRoomVocab(room) {
  const items = getRoomLearningItems(room);
  if (items.length) return items;
  return VOCAB;
}

function makeQuizQuestion(vocab, exclude = new Set()) {
  const pool = vocab.filter((v) => !exclude.has(v.en));
  if (!pool.length) return makeQuizQuestion(vocab);
  const correct = pool[Math.floor(Math.random() * pool.length)];
  const wrongPool = vocab.filter((v) => v.en !== correct.en);
  const wrong = pickRandom(wrongPool, Math.min(3, wrongPool.length));
  const options = shuffle([correct.he, ...wrong.map((w) => w.he)]);
  return {
    word: correct.en,
    hint: correct.hint,
    correct: correct.he,
    options,
  };
}

function makeMemoryPairs(vocab) {
  const count = Math.min(6, vocab.length);
  const items = pickRandom(vocab, count);
  const cards = [];
  items.forEach((item, i) => {
    cards.push({ id: `en-${i}`, pairId: i, text: item.en, type: "en" });
    cards.push({ id: `he-${i}`, pairId: i, text: item.he, type: "he" });
  });
  return shuffle(cards);
}

function makeHangmanWord(vocab) {
  const item = vocab[Math.floor(Math.random() * vocab.length)];
  return { word: item.en.toUpperCase(), hint: item.hint, he: item.he };
}

function makeScramble(vocab) {
  const sentences = vocab.filter((v) => String(v.en || "").includes(" "));
  if (sentences.length) {
    const s = sentences[Math.floor(Math.random() * sentences.length)];
    const words = s.en.split(/\s+/).filter(Boolean);
    return {
      words: shuffle([...words]),
      answer: words.join(" "),
      he: s.he,
    };
  }
  const s = SENTENCES[Math.floor(Math.random() * SENTENCES.length)];
  return {
    words: shuffle([...s.words]),
    answer: s.words.join(" "),
    he: s.he,
  };
}

function makeSpellingRound(vocab) {
  const item = vocab[Math.floor(Math.random() * vocab.length)];
  return { word: item.en, hint: item.hint, he: item.he };
}

function resetGameState(room, gameId) {
  const vocab = getRoomVocab(room);
  room.activeGame = gameId;
  room.gameState = { phase: "ready", round: 0 };

  if (gameId === "vocabulary-duel") {
    room.gameState = {
      phase: "playing",
      round: 1,
      maxRounds: 8,
      question: makeQuizQuestion(vocab),
      answers: {},
      roundWinner: null,
    };
  } else if (gameId === "word-memory") {
    const cards = makeMemoryPairs(vocab);
    room.gameState = {
      phase: "playing",
      cards: cards.map((c) => ({ ...c, matched: false, faceUp: false })),
      turn: "teacher",
      flipped: [],
      pairsFound: { teacher: 0, student: 0 },
    };
  } else if (gameId === "hangman") {
    const { word, hint, he } = makeHangmanWord(vocab);
    room.gameState = {
      phase: "playing",
      word,
      hint,
      he,
      guessed: [],
      wrongGuesses: 0,
      maxWrong: 7,
      won: false,
      lost: false,
    };
  } else if (gameId === "sentence-scramble") {
    const s = makeScramble(vocab);
    room.gameState = {
      phase: "playing",
      round: 1,
      maxRounds: 5,
      scrambled: s.words,
      answer: s.answer,
      he: s.he,
      submissions: {},
      submissionIds: {},
      roundWinner: null,
      roundWinnerId: null,
    };
  } else if (gameId === "spelling-bee") {
    room.gameState = {
      phase: "playing",
      round: 1,
      maxRounds: 6,
      current: makeSpellingRound(vocab),
      submissions: {},
      submissionIds: {},
      roundWinner: null,
      roundWinnerId: null,
    };
  } else if (gameId === "spot-diff") {
    room.gameState = miniGames.makeSpotDiffState(vocab);
  } else if (gameId === "word-runner") {
    room.gameState = miniGames.makeRunnerState(vocab);
  } else if (gameId === "candy-match") {
    room.gameState = miniGames.makeCandyState(vocab);
  } else if (gameId === "word-shop") {
    room.gameState = miniGames.makeShopState(vocab);
  }
}

function broadcastGame(code) {
  const room = getRoom(code);
  if (!room) return;
  io.to(`room:${code}`).emit("game:state", {
    activeGame: room.activeGame,
    state: room.gameState,
    scores: roomSummary(room).scores,
  });
}

function sendGameStateToSocket(socket, room) {
  if (!room?.activeGame || !room.gameState) return;
  socket.emit("game:state", {
    activeGame: room.activeGame,
    state: room.gameState,
    scores: roomSummary(room).scores,
  });
}

io.on("connection", (socket) => {
  socket.data.roomCode = null;
  socket.data.role = null;

  socket.on("teacher:subscribe", ({ pin }, cb) => {
    if (!bookingsLib.verifyTeacherPin(pin)) {
      return cb?.({ ok: false, error: "קוד מורה שגוי" });
    }
    socket.join("teacher-dashboard");
    socket.data.teacherAuthed = true;
    cb?.({ ok: true, bookings: bookingsLib.getTeacherBookings() });
  });

  socket.on("room:create", ({ name }, cb) => {
    const code = generateCode();
    const teacherToken = crypto.randomBytes(16).toString("hex");
    const room = roomsLib.createRoom(code, socket.id, name, teacherToken);
    rooms.set(code, room);
    socket.data.roomCode = code;
    socket.data.role = "teacher";
    socket.join(`room:${code}`);
    cb?.({ ok: true, teacherToken, ...roomSummary(room), role: "teacher" });
  });

  socket.on("room:host-rejoin", ({ code, token }, cb) => {
    const room = getRoom(code);
    if (!room || room.teacherToken !== token) {
      return cb?.({ ok: false, error: "חדר לא נמצא — פתחו חדר חדש מהדף הראשי" });
    }
    clearTeacherGrace(room);
    room.teacherId = socket.id;
    room.managerId = socket.id;
    socket.data.roomCode = code;
    socket.data.role = "teacher";
    socket.join(`room:${code}`);
    cb?.({
      ok: true,
      ...roomSummary(room),
      role: "teacher",
      gameState: room.activeGame ? room.gameState : null,
    });
    emitRoom(code);
  });

  socket.on("room:leave-teacher", (_payload, cb) => {
    const code = socket.data.roomCode;
    const room = getRoom(code);
    if (room && socket.data.role === "teacher") {
      closeRoom(code, "החדר נסגר");
    }
    socket.data.roomCode = null;
    socket.data.role = null;
    cb?.({ ok: true });
  });

  socket.on("room:join", ({ code, name }, cb) => {
    const room = getRoom(code);
    if (!room) return cb?.({ ok: false, error: "חדר לא נמצא. בדקו את הקוד." });
    if (room.students.has(socket.id)) {
      return cb?.({ ok: false, error: "כבר מחובר/ת לחדר זה." });
    }
    const studentName = (name || "תלמיד").trim().slice(0, 24);
    if (Array.from(room.students.values()).some((s) => s.name === studentName)) {
      return cb?.({ ok: false, error: "השם תפוס — בחרו שם אחר." });
    }
    if (room.students.size >= 30) {
      return cb?.({ ok: false, error: "החדר מלא (30 תלמידים)." });
    }

    room.students.set(socket.id, { name: studentName, score: 0, suspended: false });
    socket.data.roomCode = code;
    socket.data.role = "student";
    socket.data.playerId = socket.id;
    socket.join(`room:${code}`);

    cb?.({
      ok: true,
      ...roomSummary(room),
      role: "student",
      playerId: socket.id,
      gameState: room.activeGame ? room.gameState : null,
    });
    emitRoom(code);
    sendGameStateToSocket(socket, room);
    io.to(`room:${code}`).emit("room:student-joined", { name: studentName, id: socket.id });
  });

  socket.on("game:start", ({ gameId, uid }, cb) => {
    const code = socket.data.roomCode;
    const room = getRoom(code);
    if (!room || !roomsLib.isManager(room, socket.id)) {
      return cb?.({ ok: false, error: "רק המורה יכול להתחיל משחק" });
    }
    if (premiumLib.isPremiumGame(gameId)) {
      const premium = uid ? premiumLib.getStatus(uid) : { isPremium: false };
      if (!premium.isPremium) {
        return cb?.({ ok: false, error: "משחק פרימיום — נדרש מנוי פעיל" });
      }
    }
    const items = getRoomLearningItems(room);
    if (items.length) {
      const allowed = compatibleRoomGames(items);
      if (!allowed.includes(gameId)) {
        return cb?.({ ok: false, error: "משחק זה לא מתאים לחומר הלימודי שהוגדר" });
      }
    }
    resetGameState(room, gameId);
    room.scores = { teacher: 0 };
    room.students.forEach((s) => {
      s.score = 0;
    });
    cb?.({ ok: true });
    broadcastGame(code);
  });

  socket.on("game:action", (payload, cb) => {
    const code = socket.data.roomCode;
    const room = getRoom(code);
    if (!room || !room.activeGame) return cb?.({ ok: false });

    const role = getRole(room, socket.id);
    if (!role) return cb?.({ ok: false });
    if (role === "student" && roomsLib.isSuspended(room, socket.id)) {
      return cb?.({ ok: false, error: "הושהיתם על ידי המורה" });
    }
    if (role === "student" && room.studentsCanPlay !== true) {
      return cb?.({ ok: false, error: "מצב צפייה — רק המורה משחק" });
    }

    const { action, data } = payload;
    const state = room.gameState;

    if (room.activeGame === "vocabulary-duel" && action === "answer") {
      const pk = roomsLib.playerKey(room, socket.id, role);
      if (state.answers[pk] || state.phase !== "playing") return cb?.({ ok: false });
      state.answers[pk] = data.answer;
      const correct = data.answer === state.question.correct;
      if (correct) scorePlayer(room, socket.id, role, 10);
      broadcastGame(code);
      emitRoom(code);
      return cb?.({ ok: true, correct });
    }

    if (room.activeGame === "vocabulary-duel" && action === "next-round") {
      if (socket.data.role !== "teacher") return cb?.({ ok: false });
      const vocab = getRoomVocab(room);
      if (state.round >= state.maxRounds) {
        state.phase = "finished";
        broadcastGame(code);
        return cb?.({ ok: true });
      }
      state.round++;
      state.question = makeQuizQuestion(vocab);
      state.answers = {};
      state.roundWinner = null;
      state.phase = "playing";
      broadcastGame(code);
      return cb?.({ ok: true });
    }

    if (room.activeGame === "word-memory" && action === "flip") {
      if (state.phase !== "playing") return cb?.({ ok: false });
      if (role === "student" && room.studentsCanPlay !== true) {
        return cb?.({ ok: false, error: "מצב צפייה — רק המורה משחק" });
      }
      const activeTurn = room.studentsCanPlay === true ? state.turn : "teacher";
      if (activeTurn !== role) return cb?.({ ok: false });
      const cardId = data.cardId;
      const card = state.cards.find((c) => c.id === cardId);
      if (!card || card.matched || card.faceUp) return cb?.({ ok: false });

      card.faceUp = true;
      state.flipped.push(cardId);

      if (state.flipped.length === 2) {
        const [a, b] = state.flipped.map((id) => state.cards.find((c) => c.id === id));
        if (a.pairId === b.pairId) {
          a.matched = true;
          b.matched = true;
          state.pairsFound[role]++;
          scorePlayer(room, socket.id, role, 15);
          state.flipped = [];
          if (state.cards.every((c) => c.matched)) {
            state.phase = "finished";
            const t = state.pairsFound.teacher;
            const s = state.pairsFound.student;
            state.winner = t > s ? "teacher" : s > t ? "student" : "tie";
          }
        } else {
          state.phase = "checking";
          setTimeout(() => {
            a.faceUp = false;
            b.faceUp = false;
            state.flipped = [];
            state.turn = room.studentsCanPlay === true ? (state.turn === "teacher" ? "student" : "teacher") : "teacher";
            state.phase = "playing";
            broadcastGame(code);
          }, 900);
        }
      }
      broadcastGame(code);
      return cb?.({ ok: true });
    }

    if (room.activeGame === "hangman" && action === "guess") {
      if (state.won || state.lost) return cb?.({ ok: false });
      const letter = (data.letter || "").toUpperCase();
      if (!letter || letter.length !== 1 || state.guessed.includes(letter)) {
        return cb?.({ ok: false });
      }
      state.guessed.push(letter);
      if (!state.word.includes(letter)) {
        state.wrongGuesses++;
        if (state.wrongGuesses >= state.maxWrong) {
          state.lost = true;
          state.phase = "finished";
        }
      } else {
        const allFound = [...state.word.replace(/ /g, "")].every(
          (ch) => state.guessed.includes(ch)
        );
        if (allFound) {
          state.won = true;
          state.phase = "finished";
          scorePlayer(room, room.teacherId, "teacher", 20);
          room.students.forEach((_s, sid) => scorePlayer(room, sid, "student", 20));
        }
      }
      broadcastGame(code);
      return cb?.({ ok: true });
    }

    if (room.activeGame === "hangman" && action === "new-word") {
      if (socket.data.role !== "teacher") return cb?.({ ok: false });
      const vocab = getRoomVocab(room);
      const { word, hint, he } = makeHangmanWord(vocab);
      Object.assign(state, {
        word,
        hint,
        he,
        guessed: [],
        wrongGuesses: 0,
        won: false,
        lost: false,
        phase: "playing",
      });
      broadcastGame(code);
      return cb?.({ ok: true });
    }

    if (room.activeGame === "sentence-scramble" && action === "submit") {
      if (state.submissions[role]) return cb?.({ ok: false });
      const attempt = (data.sentence || "").trim();
      state.submissionIds = state.submissionIds || {};
      state.submissionIds[role] = socket.id;
      state.submissions[role] = attempt;
      const correct = attempt.toLowerCase() === state.answer.toLowerCase();
      if (correct) {
        scorePlayer(room, socket.id, role, 12);
        state.roundWinner = role;
        state.roundWinnerId = socket.id;
        state.phase = "round-end";
        broadcastGame(code);
        return cb?.({ ok: true, correct: true });
      }
      const other = role === "teacher" ? "student" : "teacher";
      if (state.submissions[other] !== undefined) {
        const tOk = state.submissions.teacher.toLowerCase() === state.answer.toLowerCase();
        const sOk = state.submissions.student.toLowerCase() === state.answer.toLowerCase();
        if (tOk && !sOk) {
          state.roundWinner = "teacher";
          state.roundWinnerId = state.submissionIds.teacher || room.teacherId;
        } else if (sOk && !tOk) {
          state.roundWinner = "student";
          state.roundWinnerId = state.submissionIds.student || null;
        } else if (tOk && sOk) state.roundWinner = "tie";
        else state.roundWinner = "none";
        state.phase = "round-end";
      }
      broadcastGame(code);
      return cb?.({ ok: true, correct: false });
    }

    if (room.activeGame === "sentence-scramble" && action === "next-round") {
      if (socket.data.role !== "teacher") return cb?.({ ok: false });
      const vocab = getRoomVocab(room);
      if (state.round >= state.maxRounds) {
        state.phase = "finished";
        broadcastGame(code);
        return cb?.({ ok: true });
      }
      const s = makeScramble(vocab);
      state.round++;
      state.scrambled = s.words;
      state.answer = s.answer;
      state.he = s.he;
      state.submissions = {};
      state.submissionIds = {};
      state.roundWinner = null;
      state.roundWinnerId = null;
      state.phase = "playing";
      broadcastGame(code);
      return cb?.({ ok: true });
    }

    if (room.activeGame === "spelling-bee" && action === "submit") {
      if (state.submissions[role]) return cb?.({ ok: false });
      const attempt = (data.spelling || "").trim().toLowerCase();
      state.submissionIds = state.submissionIds || {};
      state.submissionIds[role] = socket.id;
      state.submissions[role] = attempt;
      const correct = attempt === state.current.word.toLowerCase();
      if (correct) {
        scorePlayer(room, socket.id, role, 10);
        state.roundWinner = role;
        state.roundWinnerId = socket.id;
        state.phase = "round-end";
        broadcastGame(code);
        return cb?.({ ok: true, correct: true });
      }
      const other = role === "teacher" ? "student" : "teacher";
      if (state.submissions[other] !== undefined) {
        const tOk = state.submissions.teacher === state.current.word.toLowerCase();
        const sOk = state.submissions.student === state.current.word.toLowerCase();
        if (tOk && !sOk) {
          state.roundWinner = "teacher";
          state.roundWinnerId = state.submissionIds.teacher || room.teacherId;
        } else if (sOk && !tOk) {
          state.roundWinner = "student";
          state.roundWinnerId = state.submissionIds.student || null;
        } else if (tOk && sOk) state.roundWinner = "tie";
        else state.roundWinner = "none";
        state.phase = "round-end";
      }
      broadcastGame(code);
      return cb?.({ ok: true, correct: false });
    }

    if (room.activeGame === "spelling-bee" && action === "next-round") {
      if (socket.data.role !== "teacher") return cb?.({ ok: false });
      const vocab = getRoomVocab(room);
      if (state.round >= state.maxRounds) {
        state.phase = "finished";
        broadcastGame(code);
        return cb?.({ ok: true });
      }
      state.round++;
      state.current = makeSpellingRound(vocab);
      state.submissions = {};
      state.submissionIds = {};
      state.roundWinner = null;
      state.roundWinnerId = null;
      state.phase = "playing";
      broadcastGame(code);
      return cb?.({ ok: true });
    }

    const addScoreFn = (r, pts) => {
      const sid = r === "teacher" ? room.teacherId : socket.id;
      scorePlayer(room, sid, r, pts);
    };
    let miniResult = null;

    const teacherOnly = room.studentsCanPlay !== true;
    const vocab = getRoomVocab(room);

    if (room.activeGame === "spot-diff") {
      miniResult = miniGames.handleSpotDiff(state, role, action, data, addScoreFn, vocab, teacherOnly);
      if (action === "next-round" && socket.data.role !== "teacher") return cb?.({ ok: false });
    } else if (room.activeGame === "word-runner") {
      miniResult = miniGames.handleRunner(state, role, action, data, addScoreFn, vocab, teacherOnly);
      if (action === "next-round" && socket.data.role !== "teacher") return cb?.({ ok: false });
    } else if (room.activeGame === "candy-match") {
      miniResult = miniGames.handleCandy(state, role, action, data, addScoreFn, vocab, teacherOnly);
    } else if (room.activeGame === "word-shop") {
      miniResult = miniGames.handleShop(state, role, action, data, addScoreFn, vocab, teacherOnly);
      if (action === "next-round" && socket.data.role !== "teacher") return cb?.({ ok: false });
    }

    if (miniResult) {
      if (state.phase === "finished" && room.activeGame === "candy-match") {
        const t = room.scores.teacher;
        const s = room.scores.student;
        state.winner = t > s ? "teacher" : s > t ? "student" : "tie";
      }
      broadcastGame(code);
      return cb?.(miniResult);
    }

    if (action === "leave-game") {
      room.activeGame = null;
      room.gameState = {};
      emitRoom(code);
      io.to(`room:${code}`).emit("game:left");
      return cb?.({ ok: true });
    }

    cb?.({ ok: false });
  });

  socket.on("room:chat", ({ emoji }, cb) => {
    const code = socket.data.roomCode;
    const room = getRoom(code);
    if (!room) return cb?.({ ok: false });

    const role = getRole(room, socket.id);
    if (!role) return cb?.({ ok: false });
    if (role === "student" && roomsLib.isSuspended(room, socket.id)) {
      return cb?.({ ok: false, error: "הושהיתם" });
    }
    if (role === "student" && room.enableReactions === false) {
      return cb?.({ ok: false, error: "תגובות כבויות בחדר זה" });
    }

    const allowed = ["😀", "👍", "🎉", "❤️", "😂", "🔥", "👏", "🤔", "😮", "🙌", "💪", "⭐"];
    const e = String(emoji || "").trim();
    if (!allowed.includes(e)) return cb?.({ ok: false });

    const fromName =
      role === "teacher" ? room.teacherName || "מורה" : room.students.get(socket.id)?.name || "תלמיד";
    const msg = roomsLib.addChatMessage(room, {
      fromId: socket.id,
      fromName,
      role,
      emoji: e,
    });
    if (room.enableChat !== false) {
      io.to(`room:${code}`).emit("room:chat", msg);
    } else {
      if (room.teacherId) io.to(room.teacherId).emit("room:chat", msg);
      if (role === "student") io.to(socket.id).emit("room:chat", msg);
    }
    cb?.({ ok: true });
  });

  socket.on("room:kick", ({ studentId }, cb) => {
    const code = socket.data.roomCode;
    const room = getRoom(code);
    if (!room || socket.data.role !== "teacher") return cb?.({ ok: false, error: "אין הרשאה" });
    if (!studentId || !room.students.has(studentId)) return cb?.({ ok: false, error: "תלמיד לא נמצא" });

    const student = room.students.get(studentId);
    room.students.delete(studentId);
    io.to(studentId).emit("room:kicked", { reason: "הוצאתם מהחדר על ידי המורה" });
    const kickedSocket = io.sockets.sockets.get(studentId);
    if (kickedSocket) {
      kickedSocket.leave(`room:${code}`);
      kickedSocket.data.roomCode = null;
      kickedSocket.data.role = null;
    }
    if (room.students.size === 0) {
      room.activeGame = null;
      room.gameState = {};
      io.to(`room:${code}`).emit("game:left");
    }
    emitRoom(code);
    io.to(`room:${code}`).emit("room:student-left", { name: student?.name || "תלמיד", id: studentId });
    cb?.({ ok: true });
  });

  socket.on("room:suspend", ({ studentId, suspend }, cb) => {
    const code = socket.data.roomCode;
    const room = getRoom(code);
    if (!room || socket.data.role !== "teacher") return cb?.({ ok: false, error: "אין הרשאה" });
    const student = room.students.get(studentId);
    if (!student) return cb?.({ ok: false, error: "תלמיד לא נמצא" });

    student.suspended = suspend !== false;
    io.to(studentId).emit("room:suspended", { suspended: student.suspended });
    emitRoom(code);
    cb?.({ ok: true, suspended: student.suspended });
  });

  socket.on("room:update-settings", (payload, cb) => {
    const code = socket.data.roomCode;
    const room = getRoom(code);
    if (!room || !roomsLib.isManager(room, socket.id)) {
      return cb?.({ ok: false, error: "אין הרשאה" });
    }
    if (typeof payload.showParticipantsToGuests === "boolean") {
      room.showParticipantsToGuests = payload.showParticipantsToGuests;
    }
    if (typeof payload.enableReactions === "boolean") {
      room.enableReactions = payload.enableReactions;
    }
    if (typeof payload.enableChat === "boolean") {
      room.enableChat = payload.enableChat;
    }
    if (typeof payload.enableGameSound === "boolean") {
      room.enableGameSound = payload.enableGameSound;
    }
    if ("studentsCanPlay" in payload) {
      room.studentsCanPlay = payload.studentsCanPlay === true;
      if (room.studentsCanPlay !== true && room.gameState?.turn) {
        room.gameState.turn = "teacher";
      }
    }
    emitRoom(code);
    if (room.studentsCanPlay !== true && room.activeGame) {
      broadcastGame(code);
    }
    cb?.({
      ok: true,
      showParticipantsToGuests: room.showParticipantsToGuests !== false,
      enableReactions: room.enableReactions !== false,
      enableChat: room.enableChat !== false,
      enableGameSound: room.enableGameSound !== false,
      studentsCanPlay: room.studentsCanPlay === true,
    });
  });

  socket.on("room:update-learning-material", ({ content }, cb) => {
    const code = socket.data.roomCode;
    const room = getRoom(code);
    if (!room || !roomsLib.isManager(room, socket.id)) {
      return cb?.({ ok: false, error: "אין הרשאה" });
    }

    const text = String(content || "").trim();
    if (!text) {
      room.learningMaterial = "";
      room.learningItems = [];
      emitRoom(code);
      return cb?.({
        ok: true,
        learningMaterial: "",
        learningItemCount: 0,
        compatibleGames: compatibleRoomGames([]),
      });
    }

    const { items, normalized } = normalizeLearningContent(text);
    if (!items.length) {
      return cb?.({
        ok: false,
        error: "לא הצלחנו לזהות פריטים — נסו להדביק זוגות מילים, למשל: apple=תפוח",
      });
    }

    room.learningMaterial = normalized;
    room.learningItems = items;
    emitRoom(code);
    cb?.({
      ok: true,
      learningMaterial: room.learningMaterial,
      learningItemCount: items.length,
      compatibleGames: compatibleRoomGames(items),
    });
  });

  socket.on("room:transfer-manager", ({ targetId }, cb) => {
    const code = socket.data.roomCode;
    const room = getRoom(code);
    if (!room || !roomsLib.isManager(room, socket.id)) {
      return cb?.({ ok: false, error: "רק מנהל/ת החדר יכול/ה להעביר ניהול" });
    }
    if (!targetId || targetId === socket.id || !room.students.has(targetId)) {
      return cb?.({ ok: false, error: "משתתף/ת לא נמצא/ה" });
    }

    const newManagerSocket = io.sockets.sockets.get(targetId);
    if (!newManagerSocket) {
      return cb?.({ ok: false, error: "המשתתף/ת לא מחובר/ת" });
    }

    const oldManagerId = socket.id;
    const newTeacherToken = crypto.randomBytes(16).toString("hex");

    room.students.delete(targetId);
    room.teacherId = targetId;
    room.managerId = targetId;
    room.teacherToken = newTeacherToken;

    newManagerSocket.data.role = "teacher";
    newManagerSocket.data.roomCode = code;
    delete newManagerSocket.data.playerId;

    socket.data.role = null;
    socket.data.roomCode = null;
    socket.leave(`room:${code}`);

    newManagerSocket.emit("room:manager-transferred", {
      demoted: false,
      role: "teacher",
      teacherToken: newTeacherToken,
      code,
      message: "קיבלת/י את ניהול החדר!",
    });

    socket.emit("room:manager-transferred", {
      demoted: true,
      code,
      message: "העברת את ניהול החדר. אפשר להצטרף מחדש כמשתתף/ת.",
    });

    emitRoom(code);
    cb?.({ ok: true });
  });

  socket.on("disconnect", () => {
    const code = socket.data.roomCode;
    if (!code) return;
    const room = getRoom(code);
    if (!room) return;

    const role = getRole(room, socket.id);
    if (role === "teacher") {
      scheduleTeacherGrace(code);
    } else if (role === "student") {
      const student = room.students.get(socket.id);
      room.students.delete(socket.id);
      if (room.students.size === 0) {
        room.activeGame = null;
        room.gameState = {};
      }
      io.to(`room:${code}`).emit("room:student-left", {
        name: student?.name || "תלמיד",
        id: socket.id,
      });
      emitRoom(code);
    }
  });
});

const PORT = process.env.PORT || 3456;
server.listen(PORT, () => {
  console.log(`Pleyi → http://localhost:${PORT}`);
});
