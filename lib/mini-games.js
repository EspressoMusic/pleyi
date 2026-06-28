/* Mini-game engines — spot diff, runner, candy match, word shop */

const EMOJI = {
  apple: "🍎", book: "📚", water: "💧", friend: "👫", school: "🏫",
  happy: "😊", run: "🏃", blue: "🔵", cat: "🐱", dog: "🐶", eat: "🍽️",
  sleep: "😴", big: "🐘", small: "🐜", sun: "☀️", rain: "🌧️", tree: "🌳",
  fish: "🐟", bird: "🐦", red: "🔴", green: "🟢", milk: "🥛", bread: "🍞",
  chair: "🪑", table: "🪵", door: "🚪", window: "🪟", phone: "📱",
  house: "🏠", family: "👨‍👩‍👧", learn: "📖", write: "✏️", read: "📕",
};

function emoji(en) {
  return EMOJI[en] || "⭐";
}

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

function itemCard(v) {
  return { en: v.en, he: v.he, emoji: emoji(v.en) };
}

function makeSpotDiffState(VOCAB) {
  const items = pickRandom(VOCAB, 6);
  const diffIdx = Math.floor(Math.random() * 6);
  const wrong = pickRandom(VOCAB.filter((v) => v.en !== items[diffIdx].en), 1)[0];
  const left = items.map(itemCard);
  const right = left.map((item, i) => (i === diffIdx ? itemCard(wrong) : { ...item }));
  return {
    phase: "playing",
    round: 1,
    maxRounds: 8,
    left,
    right,
    diffIndex: diffIdx,
    clicks: {},
    roundWinner: null,
  };
}

function handleSpotDiff(state, role, action, data, addScore, VOCAB, teacherOnly = false) {
  if (action === "pick" && state.phase === "playing") {
    if (state.clicks[role] !== undefined) return null;
    const idx = Number(data.index);
    if (Number.isNaN(idx) || idx < 0 || idx > 5) return null;
    state.clicks[role] = idx;
    const correct = idx === state.diffIndex;
    if (correct) {
      addScore(role, 15);
      state.roundWinner = role;
      state.phase = "round-end";
      return { ok: true, correct: true };
    }
    const other = role === "teacher" ? "student" : "teacher";
    if (teacherOnly || state.clicks[other] !== undefined) {
      state.roundWinner = teacherOnly
        ? "none"
        : state.clicks[other] === state.diffIndex
          ? other
          : "none";
      state.phase = "round-end";
    }
    return { ok: true, correct: false };
  }
  if (action === "next-round" && state.phase === "round-end") {
    if (state.round >= state.maxRounds) {
      state.phase = "finished";
      return { ok: true };
    }
    Object.assign(state, makeSpotDiffState(VOCAB), { round: state.round + 1, phase: "playing" });
    return { ok: true };
  }
  return null;
}

function makeRunnerState(VOCAB) {
  return { ...makeRunnerRound(VOCAB), round: 1, maxRounds: 10, distance: { teacher: 0, student: 0 } };
}

function makeRunnerRound(VOCAB) {
  const item = VOCAB[Math.floor(Math.random() * VOCAB.length)];
  const wrong = pickRandom(VOCAB.filter((v) => v.en !== item.en), 2);
  return {
    phase: "playing",
    obstacle: { word: item.en, hint: item.he, emoji: emoji(item.en) },
    options: shuffle([item.en, ...wrong.map((w) => w.en)]),
    correct: item.en,
    clicks: {},
    roundWinner: null,
  };
}

function handleRunner(state, role, action, data, addScore, VOCAB, teacherOnly = false) {
  if (action === "jump" && state.phase === "playing") {
    if (state.clicks[role] !== undefined) return null;
    const choice = data.choice;
    state.clicks[role] = choice;
    const correct = choice === state.correct;
    if (correct) {
      addScore(role, 12);
      state.distance[role] = (state.distance[role] || 0) + 100;
      state.roundWinner = role;
      state.phase = "round-end";
      return { ok: true, correct: true };
    }
    const other = role === "teacher" ? "student" : "teacher";
    if (teacherOnly || state.clicks[other] !== undefined) {
      state.roundWinner = teacherOnly
        ? "none"
        : state.clicks[other] === state.correct
          ? other
          : "none";
      state.phase = "round-end";
    }
    return { ok: true, correct: false };
  }
  if (action === "next-round" && state.phase === "round-end") {
    if (state.round >= state.maxRounds) {
      state.phase = "finished";
      return { ok: true };
    }
    const next = makeRunnerRound(VOCAB);
    state.round++;
    Object.assign(state, next, { distance: state.distance });
    return { ok: true };
  }
  return null;
}

const CANDY_COLORS = ["yellow", "pink", "purple", "teal"];

function makeCandyGrid(VOCAB, rows = 6, cols = 6) {
  const grid = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const color = CANDY_COLORS[Math.floor(Math.random() * CANDY_COLORS.length)];
      const word = VOCAB[Math.floor(Math.random() * VOCAB.length)].en;
      grid.push({ id: `${r}-${c}`, r, c, color, word });
    }
  }
  return grid;
}

function gridAt(grid, r, c) {
  return grid.find((t) => t.r === r && t.c === c);
}

function findMatchIds(grid, rows, cols) {
  const matched = new Set();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols - 2; c++) {
      const a = gridAt(grid, r, c);
      const b = gridAt(grid, r, c + 1);
      const d = gridAt(grid, r, c + 2);
      if (a && b && d && a.color === b.color && b.color === d.color) {
        matched.add(a.id);
        matched.add(b.id);
        matched.add(d.id);
      }
    }
  }
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows - 2; r++) {
      const a = gridAt(grid, r, c);
      const b = gridAt(grid, r + 1, c);
      const d = gridAt(grid, r + 2, c);
      if (a && b && d && a.color === b.color && b.color === d.color) {
        matched.add(a.id);
        matched.add(b.id);
        matched.add(d.id);
      }
    }
  }
  return matched;
}

function refillCandy(grid, matched, VOCAB) {
  matched.forEach((id) => {
    const tile = grid.find((t) => t.id === id);
    if (tile) {
      tile.color = CANDY_COLORS[Math.floor(Math.random() * CANDY_COLORS.length)];
      tile.word = VOCAB[Math.floor(Math.random() * VOCAB.length)].en;
    }
  });
}

function resolveCandyMatches(state, VOCAB, addScore, role) {
  let totalMatched = 0;
  let matched = findMatchIds(state.grid, state.rows, state.cols);
  while (matched.size > 0) {
    totalMatched += matched.size;
    const pts = matched.size * 5;
    addScore(role, pts);
    refillCandy(state.grid, matched, VOCAB);
    matched = findMatchIds(state.grid, state.rows, state.cols);
  }
  return totalMatched;
}

function makeCandyState(VOCAB) {
  let grid = makeCandyGrid(VOCAB);
  let guard = 0;
  while (findMatchIds(grid, 6, 6).size > 0 && guard++ < 20) {
    grid = makeCandyGrid(VOCAB);
  }
  return {
    phase: "playing",
    rows: 6,
    cols: 6,
    grid,
    turn: "teacher",
    selected: null,
    lastMatch: 0,
    moves: { teacher: 0, student: 0 },
    maxMoves: 30,
  };
}

function handleCandy(state, role, action, data, addScore, VOCAB, teacherOnly = false) {
  const activeTurn = teacherOnly ? "teacher" : state.turn;
  if (state.phase !== "playing" || activeTurn !== role) return null;

  if (action === "select") {
    const id = data.id;
    const tile = state.grid.find((t) => t.id === id);
    if (!tile) return null;

    if (!state.selected) {
      state.selected = id;
      return { ok: true };
    }
    if (state.selected === id) {
      state.selected = null;
      return { ok: true };
    }

    const a = state.grid.find((t) => t.id === state.selected);
    const dr = Math.abs(a.r - tile.r);
    const dc = Math.abs(a.c - tile.c);
    if (dr + dc !== 1) {
      state.selected = id;
      return { ok: true };
    }

    const tmpA = { color: a.color, word: a.word };
    const tmpB = { color: tile.color, word: tile.word };
    a.color = tmpB.color;
    a.word = tmpB.word;
    tile.color = tmpA.color;
    tile.word = tmpA.word;

    let matchedSize = findMatchIds(state.grid, state.rows, state.cols).size;
    state.selected = null;

    if (matchedSize > 0) {
      const chain = resolveCandyMatches(state, VOCAB, addScore, role);
      state.lastMatch = chain;
      state.moves[role]++;
    } else {
      a.color = tmpA.color;
      a.word = tmpA.word;
      tile.color = tmpB.color;
      tile.word = tmpB.word;
      state.turn = teacherOnly ? "teacher" : role === "teacher" ? "student" : "teacher";
      state.lastMatch = 0;
      state.moves[role]++;
    }

    const totalMoves = state.moves.teacher + state.moves.student;
    if (totalMoves >= state.maxMoves) {
      state.phase = "finished";
    }

    return { ok: true, matched: matchedSize };
  }
  return null;
}

function makeShopState(VOCAB) {
  const wanted = VOCAB[Math.floor(Math.random() * VOCAB.length)];
  const others = pickRandom(VOCAB.filter((v) => v.en !== wanted.en), 5);
  const shelf = shuffle([wanted, ...others]).slice(0, 6).map(itemCard);
  return {
    phase: "playing",
    round: 1,
    maxRounds: 8,
    request: `Can I have a ${wanted.en}, please?`,
    requestHe: wanted.he,
    correct: wanted.en,
    shelf,
    clicks: {},
    roundWinner: null,
  };
}

function handleShop(state, role, action, data, addScore, VOCAB, teacherOnly = false) {
  if (action === "sell" && state.phase === "playing") {
    if (state.clicks[role] !== undefined) return null;
    const choice = data.en;
    state.clicks[role] = choice;
    const correct = choice === state.correct;
    if (correct) {
      addScore(role, 14);
      state.roundWinner = role;
      state.phase = "round-end";
      return { ok: true, correct: true };
    }
    const other = role === "teacher" ? "student" : "teacher";
    if (teacherOnly || state.clicks[other] !== undefined) {
      state.roundWinner = teacherOnly
        ? "none"
        : state.clicks[other] === state.correct
          ? other
          : "none";
      state.phase = "round-end";
    }
    return { ok: true, correct: false };
  }
  if (action === "next-round" && state.phase === "round-end") {
    if (state.round >= state.maxRounds) {
      state.phase = "finished";
      return { ok: true };
    }
    const wanted = VOCAB[Math.floor(Math.random() * VOCAB.length)];
    const others = pickRandom(VOCAB.filter((v) => v.en !== wanted.en), 5);
    state.round++;
    state.request = `Can I have a ${wanted.en}, please?`;
    state.requestHe = wanted.he;
    state.correct = wanted.en;
    state.shelf = shuffle([wanted, ...others]).slice(0, 6).map(itemCard);
    state.clicks = {};
    state.roundWinner = null;
    state.phase = "playing";
    return { ok: true };
  }
  return null;
}

module.exports = {
  makeSpotDiffState,
  makeRunnerState,
  makeCandyState,
  makeShopState,
  handleSpotDiff,
  handleRunner,
  handleCandy,
  handleShop,
  emoji,
};
