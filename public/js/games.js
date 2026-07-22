/* Game renderers — each returns HTML and binds events */

const GAME_NAMES = {
  "vocabulary-duel": "טריוויה",
  "word-memory": "זיכרון מילים",
  hangman: "איש תלוי",
  "sentence-scramble": "בניית משפט",
  "spelling-bee": "איות",
  "spot-diff": "מצא את ההבדלים",
  "word-runner": "רץ וקופץ",
  "candy-match": "ממתקים — Match 3",
  "word-shop": "חנות קטנה",
};

function roleLabel(role, room) {
  if (role === "teacher") return room?.teacherName || "מורה";
  return room?.studentName || "תלמיד";
}

function winnerText(winner, room) {
  if (winner === "tie") return "תיקו!";
  if (winner === "none") return "אף אחד לא צדק הפעם";
  if (room?.studentsCanPlay !== true) return "כל הכבוד!";
  if (winner === "teacher") return `${roleLabel("teacher", room)} ניצח/ה!`;
  if (winner === "student") return `${roleLabel("student", room)} ניצח/ה!`;
  return "";
}

function roundResultClass(winner) {
  const isWin = winner && winner !== "tie" && winner !== "none";
  return isWin ? "round-result round-result--win" : "round-result";
}

function raceWaitStatus(clicks, ctx, phase) {
  if (phase !== "playing" || clicks?.[ctx.role] === undefined) return "";
  if (isTeacherOnlyRoom(ctx)) return "";
  const other = ctx.role === "teacher" ? "student" : "teacher";
  if (clicks[other] !== undefined) return "";
  return `<div class="game-status waiting">ממתינים ל${roleLabel(other, ctx.room)}...</div>`;
}

function canPlayGame(ctx) {
  if (ctx.role === "teacher") return true;
  return ctx.room?.studentsCanPlay === true;
}

function watchModeBanner(ctx) {
  if (canPlayGame(ctx)) return "";
  return `<div class="game-watch-banner" role="status">👀 מצב צפייה — המורה מנחה, אין אפשרות לענות</div>`;
}

function isTeacherOnlyRoom(ctx) {
  return ctx.room?.studentsCanPlay !== true;
}

function effectiveGameTurn(state, ctx) {
  return isTeacherOnlyRoom(ctx) ? "teacher" : state.turn;
}

const Games = {
  render(activeGame, state, ctx) {
    const fn = {
      "vocabulary-duel": this.renderVocabularyDuel,
      "word-memory": this.renderWordMemory,
      hangman: this.renderHangman,
      "sentence-scramble": this.renderSentenceScramble,
      "spelling-bee": this.renderSpellingBee,
      "spot-diff": this.renderSpotDiff,
      "word-runner": this.renderWordRunner,
      "candy-match": this.renderCandyMatch,
      "word-shop": this.renderWordShop,
    }[activeGame];

    if (!fn) return "<p>משחק לא נמצא</p>";
    return watchModeBanner(ctx) + fn.call(this, state, ctx);
  },

  bind(activeGame, root, ctx) {
    const fn = {
      "vocabulary-duel": this.bindVocabularyDuel,
      "word-memory": this.bindWordMemory,
      hangman: this.bindHangman,
      "sentence-scramble": this.bindSentenceScramble,
      "spelling-bee": this.bindSpellingBee,
      "spot-diff": this.bindSpotDiff,
      "word-runner": this.bindWordRunner,
      "candy-match": this.bindCandyMatch,
      "word-shop": this.bindWordShop,
    }[activeGame];

    if (fn) {
      if (ctx.role !== "teacher" && !canPlayGame(ctx)) return;
      fn.call(this, root, ctx);
    }
  },

  renderVocabularyDuel(state, ctx) {
    const { question, round, maxRounds, phase, answers, roundWinner } = state;
    const pk = ctx.playerKey || ctx.role;
    const myAnswer = answers?.[pk];
    const showResults = phase === "round-end" || phase === "finished";
    const answeredCount = answers ? Object.keys(answers).length : 0;

    let optionsHtml = question.options
      .map(
        (opt) => {
          let cls = "quiz-option";
          if (myAnswer === opt) cls += " selected";
          if (showResults) {
            if (opt === question.correct) cls += " correct";
            else if (myAnswer === opt) cls += " wrong";
          }
          return `<button class="${cls}" data-answer="${opt}" ${myAnswer || showResults || !canPlayGame(ctx) ? "disabled" : ""}>${opt}</button>`;
        }
      )
      .join("");

    let statusHtml = "";
    if (myAnswer && phase === "playing") {
      statusHtml = `<div class="game-status waiting">ענית! ממתינים לשאר השחקנים...</div>`;
    }
    if (ctx.role === "teacher" && phase === "playing") {
      statusHtml += `<div class="game-status">ענו: ${answeredCount} שחקנים</div>`;
    }
    if (showResults) {
      const myOk = myAnswer === question.correct;
      statusHtml += `<div class="${roundResultClass(myOk ? "teacher" : null)}"><h4>${myOk ? "נכון! ✓" : "לא נכון"}</h4><p>המילה: <strong dir="ltr">${question.word}</strong> = ${question.correct}</p></div>`;
    }
    if (phase === "finished") {
      const sc = ctx.scores || {};
      statusHtml += `<div class="game-status win">סיום! ניקוד מורה: ${sc.teacher ?? 0}</div>`;
    }

    const nextBtn =
      ctx.role === "teacher" && showResults && phase !== "finished"
        ? `<div class="game-actions"><button class="btn btn-primary" id="nextRoundBtn">סיבוב הבא →</button></div>`
        : ctx.role === "teacher" && phase === "playing"
          ? `<div class="game-actions"><button class="btn btn-primary" id="nextRoundBtn">סיבוב הבא →</button></div>`
          : "";

    return `
      <div class="game-round-info">סיבוב ${round} מתוך ${maxRounds}</div>
      <div class="game-question">${question.word}</div>
      <div class="game-hint">${question.hint}</div>
      <div class="quiz-options">${optionsHtml}</div>
      ${statusHtml}
      ${nextBtn}
    `;
  },

  bindVocabularyDuel(root, ctx) {
    root.querySelectorAll(".quiz-option:not([disabled])").forEach((btn) => {
      btn.addEventListener("click", () => {
        ctx.sendAction("answer", { answer: btn.dataset.answer });
      });
    });
    root.querySelector("#nextRoundBtn")?.addEventListener("click", () => {
      ctx.sendAction("next-round");
    });
  },

  renderWordMemory(state, ctx) {
    const { cards, phase, pairsFound, winner } = state;
    const turn = effectiveGameTurn(state, ctx);
    const isMyTurn = turn === ctx.role;
    const canFlip = phase === "playing" && isMyTurn && canPlayGame(ctx);
    const watchOnly = isTeacherOnlyRoom(ctx);

    const cardsHtml = cards
      .map((c) => {
        const isFlipped = c.faceUp || c.matched;
        const cls = ["memory-card", isFlipped ? "is-flipped" : "", c.matched ? "is-matched" : ""]
          .filter(Boolean)
          .join(" ");
        const isDisabled = !canFlip || c.matched || c.faceUp;
        return `<button type="button" class="${cls}" data-id="${c.id}"${isDisabled ? " disabled" : ""}>
          <span class="memory-card-inner">
            <span class="memory-card-side memory-card-back" aria-hidden="true">?</span>
            <span class="memory-card-side memory-card-front">${c.text}</span>
          </span>
        </button>`;
      })
      .join("");

    const turnLabel = isMyTurn ? "שלך!" : roleLabel(turn, ctx.room);
    const turnHtml =
      watchOnly && ctx.role === "teacher"
        ? ""
        : watchOnly && ctx.role === "student"
          ? `
      <div class="memory-turn-bar" role="status" aria-live="polite">
        <span class="memory-turn-player">המורה מנחה את המשחק</span>
      </div>`
          : isMyTurn
            ? `
      <div class="memory-turn-bar memory-turn-bar--mine" role="status" aria-live="polite">
        <span class="memory-turn-player">התור שלך!</span>
      </div>`
            : `
      <div class="memory-turn-bar" role="status" aria-live="polite">
        <span class="memory-turn-player"><span class="memory-turn-prefix">תור</span> <span class="memory-turn-of">של</span> <span class="memory-turn-name">${turnLabel}</span></span>
      </div>`;

    let headHtml = `
      <div class="memory-score-bar" aria-label="ניקוד זוגות">
        <span class="memory-score-title">זוגות</span>
        <span class="memory-score-pill">${roleLabel("teacher", ctx.room)}: <strong>${pairsFound.teacher}</strong></span>
        ${watchOnly ? "" : `<span class="memory-score-pill">${roleLabel("student", ctx.room)}: <strong>${pairsFound.student}</strong></span>`}
      </div>`;

    if (phase === "finished") {
      headHtml += `<div class="${roundResultClass(winner)}"><h4>${winnerText(winner, ctx.room)}</h4></div>`;
    }

    return `
      <div class="word-memory-game">
        ${turnHtml}
        <div class="word-memory-head">${headHtml}</div>
        <div class="memory-grid">${cardsHtml}</div>
      </div>`;
  },

  bindWordMemory(root, ctx) {
    const prevFlipped = root._memoryFlippedIds || new Set();

    const animateFlip = (card, flipped) => {
      const inner = card.querySelector(".memory-card-inner");
      if (!inner) return;
      card.classList.add("is-flipping");
      if (flipped) {
        card.classList.remove("is-flipped");
        void card.offsetWidth;
        card.classList.add("is-flipped");
      } else {
        card.classList.add("is-flipped");
        void card.offsetWidth;
        card.classList.remove("is-flipped");
      }
      inner.addEventListener(
        "transitionend",
        () => card.classList.remove("is-flipping"),
        { once: true }
      );
    };

    root.querySelectorAll(".memory-card").forEach((card) => {
      const id = card.dataset.id;
      const shouldFlip = card.classList.contains("is-flipped");

      if (shouldFlip && !prevFlipped.has(id)) {
        animateFlip(card, true);
      } else if (!shouldFlip && prevFlipped.has(id)) {
        animateFlip(card, false);
      }
    });

    root._memoryFlippedIds = new Set(
      [...root.querySelectorAll(".memory-card.is-flipped")].map((c) => c.dataset.id)
    );

    if (root._memoryClickBound) return;
    root._memoryClickBound = true;
    root.addEventListener("click", (e) => {
      const btn = e.target.closest(".memory-card:not([disabled])");
      if (!btn || !root.contains(btn)) return;
      if (btn.classList.contains("is-flipped") || btn.classList.contains("is-flipping")) return;
      animateFlip(btn, true);
      root._memoryFlippedIds.add(btn.dataset.id);
      ctx.sendAction("flip", { cardId: btn.dataset.id });
    });
  },

  renderHangman(state, ctx) {
    const { word, hint, he, guessed, wrongGuesses, maxWrong, won, lost, phase } = state;
    const display = [...word]
      .map((ch) => (ch === " " ? " " : guessed.includes(ch) ? ch : "_"))
      .join(" ");
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const lettersHtml = letters
      .map((L) => {
        let cls = "letter-btn";
        if (guessed.includes(L)) {
          cls += word.includes(L) ? " used-correct" : " used-wrong";
        }
        return `<button class="${cls}" data-letter="${L}" ${guessed.includes(L) || won || lost || !canPlayGame(ctx) ? "disabled" : ""}>${L}</button>`;
      })
      .join("");

    let result = "";
    if (won) result = `<div class="game-status win">כל הכבוד! המילה הייתה ${word}</div>`;
    if (lost) result = `<div class="game-status" style="color:var(--danger)">המילה הייתה: ${word}</div>`;

    const newWordBtn =
      phase === "finished" && ctx?.role === "teacher"
        ? `<div class="game-actions"><button class="btn btn-primary" id="newWordBtn">מילה חדשה</button></div>`
        : "";

    return `
      <div class="hangman-game">
        <p class="hangman-misses">טעויות: ${wrongGuesses}/${maxWrong}</p>
        <div class="hangman-display">${display}</div>
        <p class="hangman-hint">${hint} · ${he}</p>
        <div class="hangman-letters">${lettersHtml}</div>
        ${result}
        ${newWordBtn}
      </div>
    `;
  },

  bindHangman(root, ctx) {
    root.querySelectorAll(".letter-btn:not([disabled])").forEach((btn) => {
      btn.addEventListener("click", () => {
        ctx.sendAction("guess", { letter: btn.dataset.letter });
      });
    });
    root.querySelector("#newWordBtn")?.addEventListener("click", () => {
      ctx.sendAction("new-word");
    });
  },

  renderSentenceScramble(state, ctx) {
    const { scrambled, answer, he, round, maxRounds, phase, submissions, roundWinner } = state;
    const mySubmit = submissions?.[ctx.role];
    const showResults = phase === "round-end" || phase === "finished";

    const poolHtml = scrambled
      .map((w, i) => `<button type="button" class="scramble-chip" data-word="${w}" data-idx="${i}">${w}</button>`)
      .join("");

    let status = "";
    if (mySubmit !== undefined && phase === "playing") {
      status = `<div class="game-status waiting">שלחת! ממתינים לצד השני...</div>`;
    }
    if (showResults) {
      status += `<div class="${roundResultClass(roundWinner)}"><h4>${winnerText(roundWinner, ctx.room)}</h4><p dir="ltr"><strong>${answer}</strong></p><p>${he}</p></div>`;
    }
    if (phase === "finished") {
      status += `<div class="game-status win">סיום! ניקוד — מורה: ${ctx.scores.teacher} | תלמיד: ${ctx.scores.student}</div>`;
    }

    const form =
      !showResults && mySubmit === undefined && canPlayGame(ctx)
        ? `
      <div class="sentence-scramble-workspace">
        <section class="scramble-build-section" aria-label="בניית משפט">
          <p class="scramble-section-label">המשפט שלי</p>
          <div class="scramble-input-area" id="sentenceArea"></div>
        </section>
        <section class="scramble-pool-section" aria-label="מילים לבחירה">
          <p class="scramble-section-label">בחרו מילים</p>
          <div class="scramble-words" id="wordPool">${poolHtml}</div>
        </section>
        <div class="game-actions sentence-scramble-actions">
          <button class="btn btn-outline btn-sm" id="clearSentence">נקה</button>
          <button class="btn btn-primary" id="submitSentence">שלח משפט</button>
        </div>
      </div>`
        : !showResults && !canPlayGame(ctx)
          ? `<div class="scramble-watch-pool">${scrambled.map((w) => `<span class="scramble-chip scramble-chip--static">${w}</span>`).join("")}</div>`
          : "";

    const nextBtn =
      ctx.role === "teacher" && showResults && phase !== "finished"
        ? `<div class="game-actions"><button class="btn btn-primary" id="nextRoundBtn">סיבוב הבא →</button></div>`
        : "";

    return `
      <div class="sentence-scramble-game">
      <div class="sentence-scramble-head">
        <div class="sentence-scramble-round">
          <span class="sentence-scramble-round-label font-cartoon">סיבוב</span>
          <span class="sentence-scramble-round-num font-cartoon">${round}/${maxRounds}</span>
        </div>
        <p class="sentence-scramble-prompt">${he}</p>
      </div>
      ${form}
      ${status}
      ${nextBtn}
      </div>
    `;
  },

  bindSentenceScramble(root, ctx) {
    const area = root.querySelector("#sentenceArea");
    const pool = root.querySelector("#wordPool");
    if (!area || !pool) return;

    const selected = [];

    function renderArea() {
      if (selected.length === 0) {
        area.classList.add("is-empty");
        area.innerHTML = '<span class="scramble-area-hint">לחצו על מילים למטה כדי לבנות את המשפט</span>';
      } else {
        area.classList.remove("is-empty");
        area.innerHTML = selected
          .map(
            (w, i) =>
              `<button type="button" class="scramble-chip in-sentence" data-i="${i}">${w}</button>`
          )
          .join("");
      }
      area.querySelectorAll(".scramble-chip").forEach((chip) => {
        chip.addEventListener("click", () => {
          const idx = Number(chip.dataset.i);
          const word = selected.splice(idx, 1)[0];
          pool.querySelector(`[data-word="${word}"][disabled]`)?.removeAttribute("disabled");
          renderArea();
        });
      });
    }

    pool.querySelectorAll(".scramble-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        if (chip.disabled) return;
        selected.push(chip.dataset.word);
        chip.disabled = true;
        renderArea();
      });
    });

    root.querySelector("#clearSentence")?.addEventListener("click", () => {
      selected.length = 0;
      pool.querySelectorAll(".scramble-chip").forEach((c) => c.removeAttribute("disabled"));
      renderArea();
    });

    root.querySelector("#submitSentence")?.addEventListener("click", () => {
      ctx.sendAction("submit", { sentence: selected.join(" ") });
    });

    root.querySelector("#nextRoundBtn")?.addEventListener("click", () => {
      ctx.sendAction("next-round");
    });

    renderArea();
  },

  renderSpellingBee(state, ctx) {
    const { current, round, maxRounds, phase, submissions, roundWinner } = state;
    const mySubmit = submissions?.[ctx.role];
    const showResults = phase === "round-end" || phase === "finished";

    let form = "";
    if (!showResults && mySubmit === undefined && canPlayGame(ctx)) {
      form = `
        <div class="game-hint">${current.hint} · ${current.he}</div>
        <input type="text" class="spelling-input" id="spellingInput" placeholder="Type the word..." autocomplete="off" autocapitalize="off" />
        <div class="game-actions"><button class="btn btn-primary" id="submitSpelling">שלח</button></div>`;
    }

    let status = "";
    if (mySubmit !== undefined && phase === "playing") {
      status = `<div class="game-status waiting">ממתינים לצד השני...</div>`;
    }
    if (showResults) {
      status += `<div class="${roundResultClass(roundWinner)}"><h4>${winnerText(roundWinner, ctx.room)}</h4><p>המילה: <strong dir="ltr">${current.word}</strong></p></div>`;
    }
    if (phase === "finished") {
      status += `<div class="game-status win">סיום! ניקוד — מורה: ${ctx.scores.teacher} | תלמיד: ${ctx.scores.student}</div>`;
    }

    const nextBtn =
      ctx.role === "teacher" && showResults && phase !== "finished"
        ? `<div class="game-actions"><button class="btn btn-primary" id="nextRoundBtn">סיבוב הבא →</button></div>`
        : "";

    return `
      <div class="game-round-info">סיבוב ${round}/${maxRounds}</div>
      ${form}
      ${status}
      ${nextBtn}
    `;
  },

  bindSpellingBee(root, ctx) {
    root.querySelector("#submitSpelling")?.addEventListener("click", () => {
      const val = root.querySelector("#spellingInput")?.value || "";
      ctx.sendAction("submit", { spelling: val });
    });
    root.querySelector("#spellingInput")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") root.querySelector("#submitSpelling")?.click();
    });
    root.querySelector("#nextRoundBtn")?.addEventListener("click", () => {
      ctx.sendAction("next-round");
    });
  },

  renderSpotDiff(state, ctx) {
    const { left, right, round, maxRounds, phase, clicks, roundWinner } = state;
    const myPick = clicks?.[ctx.role];
    const showEnd = phase === "round-end" || phase === "finished";

    const watchOnly = isTeacherOnlyRoom(ctx);

    const panel = (items, side) =>
      items
        .map(
          (item, i) => {
            let cls = "spot-cell";
            if (myPick === i) cls += " picked";
            if (showEnd && i === state.diffIndex) cls += " correct";
            if (showEnd && myPick === i && myPick !== state.diffIndex) cls += " wrong";
            return `<button type="button" class="${cls}" data-index="${i}" data-side="${side}" ${myPick !== undefined || showEnd || !canPlayGame(ctx) ? "disabled" : ""}>
              <span class="spot-emoji">${item.emoji}</span>
              <span class="spot-word" dir="ltr">${item.en}</span>
            </button>`;
          }
        )
        .join("");

    let status = "";
    status += raceWaitStatus(clicks, ctx, phase);
    if (showEnd) status += `<div class="${roundResultClass(roundWinner)}"><h4>${winnerText(roundWinner, ctx.room)}</h4></div>`;
    if (phase === "finished") {
      status += `<div class="game-status win">סיום! ניקוד — מורה: ${ctx.scores.teacher}${watchOnly ? "" : ` | תלמיד: ${ctx.scores.student}`}</div>`;
    }

    const nextBtn =
      ctx.role === "teacher" && phase === "round-end"
        ? `<div class="game-actions"><button class="btn btn-primary" id="nextRoundBtn">סיבוב הבא →</button></div>`
        : "";

    return `
      <div class="spot-diff-game">
        <div class="spot-diff-intro">
          <div class="memory-score-bar spot-diff-round-bar" aria-label="סיבוב">
            <span class="memory-score-title">סיבוב</span>
            <span class="memory-score-pill">${round}/${maxRounds}</span>
          </div>
          <div class="spot-diff-prompt-zone">
            <p class="spot-diff-prompt"><span class="spot-diff-prompt-text">מצאו את ההבדל בין התמונות!</span></p>
          </div>
        </div>
        <div class="spot-diff-board">
          <div class="spot-panel" aria-label="לוח A">
            <div class="spot-panel-label">A</div>
            <div class="spot-grid">${panel(left, "left")}</div>
          </div>
          <div class="spot-panel" aria-label="לוח B">
            <div class="spot-panel-label">B</div>
            <div class="spot-grid">${panel(right, "right")}</div>
          </div>
        </div>
        <div class="spot-diff-foot">${status}${nextBtn}</div>
      </div>`;
  },

  bindSpotDiff(root, ctx) {
    root.querySelectorAll(".spot-cell:not([disabled])").forEach((btn) => {
      btn.addEventListener("click", () => {
        ctx.sendAction("pick", { index: Number(btn.dataset.index) });
      });
    });
    root.querySelector("#nextRoundBtn")?.addEventListener("click", () => ctx.sendAction("next-round"));
  },

  renderWordRunner(state, ctx) {
    const { obstacle, options, round, maxRounds, phase, clicks, roundWinner, distance } = state;
    const myPick = clicks?.[ctx.role];
    const showEnd = phase === "round-end" || phase === "finished";

    const opts = options
      .map(
        (opt) =>
          `<button type="button" class="runner-lane-btn ${myPick === opt ? "picked" : ""}" data-choice="${opt}" ${myPick || showEnd || !canPlayGame(ctx) ? "disabled" : ""} dir="ltr">${opt}</button>`
      )
      .join("");

    let status = "";
    status += raceWaitStatus(clicks, ctx, phase);
    if (showEnd) status += `<div class="${roundResultClass(roundWinner)}"><h4>${winnerText(roundWinner, ctx.room)}</h4><p dir="ltr">${obstacle.emoji} ${obstacle.word} = ${obstacle.hint}</p></div>`;
    if (phase === "finished") status += `<div class="game-status win">מרathon סיים! מורה: ${distance.teacher}m | תלמיד: ${distance.student}m</div>`;

    const nextBtn =
      ctx.role === "teacher" && phase === "round-end"
        ? `<div class="game-actions"><button class="btn btn-primary" id="nextRoundBtn">מכשול הבא →</button></div>`
        : "";

    return `
      <div class="game-round-info">סיבוב ${round}/${maxRounds}</div>
      <div class="runner-scene">
        <div class="runner-sky"></div>
        <div class="runner-ground"></div>
        <div class="runner-player">🏃</div>
        <div class="runner-obstacle">${obstacle.emoji}<span dir="ltr">${obstacle.word}</span></div>
      </div>
      <p class="game-hint">קפצו מעל המכשול — בחרו את המילה הנכונה (${obstacle.hint})</p>
      <div class="runner-lanes">${opts}</div>
      ${status}${nextBtn}
    `;
  },

  bindWordRunner(root, ctx) {
    root.querySelectorAll(".runner-lane-btn:not([disabled])").forEach((btn) => {
      btn.addEventListener("click", () => ctx.sendAction("jump", { choice: btn.dataset.choice }));
    });
    root.querySelector("#nextRoundBtn")?.addEventListener("click", () => ctx.sendAction("next-round"));
  },

  renderCandyMatch(state, ctx) {
    const { grid, selected, phase, lastMatch, rows, cols, moves, maxMoves, winner } = state;
    const turn = effectiveGameTurn(state, ctx);
    const isMyTurn = turn === ctx.role;
    const watchOnly = isTeacherOnlyRoom(ctx);
    const colorClass = (c) => `candy-${c}`;

    const tiles = [...grid]
      .sort((a, b) => a.r - b.r || a.c - b.c)
      .map(
        (t) =>
          `<button type="button" class="candy-tile ${colorClass(t.color)} ${selected === t.id ? "selected" : ""}" data-id="${t.id}" ${!isMyTurn || phase !== "playing" || !canPlayGame(ctx) ? "disabled" : ""}>
            <span dir="ltr">${t.word}</span>
          </button>`
      )
      .join("");

    const totalMoves = (moves?.teacher || 0) + (moves?.student || 0);
    let status = "";
    if (watchOnly && ctx.role === "student") {
      status = `<div class="game-status">המורה מנחה את המשחק</div>`;
    } else {
      status = `<div class="game-status">${isMyTurn ? (watchOnly ? "המורה מנחה — התור שלך!" : "התור שלך!") : `תור ${roleLabel(turn, ctx.room)}`}</div>`;
    }
    status += `<div class="game-round-info">מהלכים: ${totalMoves}/${maxMoves} · מורה ${moves?.teacher || 0} | תלמיד ${moves?.student || 0}</div>`;
    if (lastMatch > 0) status += `<div class="game-hint">+${lastMatch * 5} נקודות על ${lastMatch} ממתקים!</div>`;
    if (phase === "finished") {
      status += `<div class="${roundResultClass(winner)}"><h4>${winnerText(winner, ctx.room)}</h4></div>`;
      status += `<div class="game-status win">ניקוד — מורה: ${ctx.scores.teacher} | תלמיד: ${ctx.scores.student}</div>`;
    }

    return `
      <div class="game-round-info">Match 3 — התאימו 3 ממתקים מאותו צבע!</div>
      <div class="candy-grid" style="--cols:${cols}">${tiles}</div>
      ${status}
    `;
  },

  bindCandyMatch(root, ctx) {
    root.querySelectorAll(".candy-tile:not([disabled])").forEach((btn) => {
      btn.addEventListener("click", () => ctx.sendAction("select", { id: btn.dataset.id }));
    });
  },

  renderWordShop(state, ctx) {
    const { request, requestHe, shelf, round, maxRounds, phase, clicks, roundWinner } = state;
    const myPick = clicks?.[ctx.role];
    const showEnd = phase === "round-end" || phase === "finished";

    const items = shelf
      .map(
        (item) =>
          `<button type="button" class="shop-item ${myPick === item.en ? "picked" : ""}" data-en="${item.en}" ${myPick || showEnd || !canPlayGame(ctx) ? "disabled" : ""}>
            <span class="shop-emoji">${item.emoji}</span>
            <span dir="ltr">${item.en}</span>
          </button>`
      )
      .join("");

    let status = "";
    status += raceWaitStatus(clicks, ctx, phase);
    if (showEnd) status += `<div class="${roundResultClass(roundWinner)}"><h4>${winnerText(roundWinner, ctx.room)}</h4></div>`;
    if (phase === "finished") status += `<div class="game-status win">החנות נסגרה! ניקוד — מורה: ${ctx.scores.teacher} | תלמיד: ${ctx.scores.student}</div>`;

    const nextBtn =
      ctx.role === "teacher" && phase === "round-end"
        ? `<div class="game-actions"><button class="btn btn-primary" id="nextRoundBtn">לקוח הבא →</button></div>`
        : "";

    return `
      <div class="game-round-info">סיבוב ${round}/${maxRounds}</div>
      <div class="shop-customer">
        <span class="shop-customer-emoji">🧑</span>
        <p class="shop-request" dir="ltr">${request}</p>
        <p class="game-hint">${requestHe}</p>
      </div>
      <div class="shop-shelf">${items}</div>
      ${status}${nextBtn}
    `;
  },

  bindWordShop(root, ctx) {
    root.querySelectorAll(".shop-item:not([disabled])").forEach((btn) => {
      btn.addEventListener("click", () => ctx.sendAction("sell", { en: btn.dataset.en }));
    });
    root.querySelector("#nextRoundBtn")?.addEventListener("click", () => ctx.sendAction("next-round"));
  },

  previewState(gameId) {
    const states = {
      "vocabulary-duel": {
        phase: "round-end",
        round: 3,
        maxRounds: 8,
        question: {
          word: "Apple",
          hint: "מה התרגום?",
          options: ["תפוח", "בננה", "ענבים", "תות"],
          correct: "תפוח",
        },
        answers: { teacher: "תפוח", student: "בננה" },
        roundWinner: "teacher",
      },
      "word-memory": {
        phase: "playing",
        cards: [
          { id: 1, text: "Dog", matched: true, faceUp: true },
          { id: 2, text: "כלב", matched: true, faceUp: true },
          { id: 3, text: "Cat", matched: false, faceUp: true },
          { id: 4, text: "?", matched: false, faceUp: false },
          { id: 5, text: "Sun", matched: false, faceUp: false },
          { id: 6, text: "?", matched: false, faceUp: false },
        ],
        turn: "student",
        pairsFound: { teacher: 2, student: 1 },
      },
      hangman: {
        phase: "playing",
        word: "HAPPY",
        hint: "A feeling when you smile",
        he: "שמח",
        guessed: ["H", "A", "P"],
        wrongGuesses: 1,
        maxWrong: 7,
        won: false,
        lost: false,
      },
      "sentence-scramble": {
        phase: "playing",
        round: 2,
        maxRounds: 5,
        scrambled: ["is", "English", "fun", "learning"],
        answer: "Learning English is fun",
        he: "ללמוד אנגלית זה כיף",
        submissions: {},
        roundWinner: null,
      },
      "spelling-bee": {
        phase: "playing",
        round: 1,
        maxRounds: 6,
        current: { word: "Beautiful", hint: "Something pretty", he: "יפה" },
        submissions: {},
        roundWinner: null,
      },
      "spot-diff": {
        phase: "playing",
        round: 2,
        maxRounds: 8,
        left: [
          { en: "apple", emoji: "🍎" },
          { en: "book", emoji: "📚" },
          { en: "cat", emoji: "🐱" },
          { en: "dog", emoji: "🐶" },
          { en: "sun", emoji: "☀️" },
          { en: "fish", emoji: "🐟" },
        ],
        right: [
          { en: "apple", emoji: "🍎" },
          { en: "book", emoji: "📚" },
          { en: "cat", emoji: "🐱" },
          { en: "water", emoji: "💧" },
          { en: "sun", emoji: "☀️" },
          { en: "fish", emoji: "🐟" },
        ],
        diffIndex: 3,
        clicks: {},
        roundWinner: null,
      },
      "word-runner": {
        phase: "playing",
        round: 1,
        maxRounds: 10,
        obstacle: { word: "run", hint: "לרוץ", emoji: "🏃" },
        options: ["run", "sleep", "eat"],
        correct: "run",
        clicks: {},
        distance: { teacher: 200, student: 100 },
        roundWinner: null,
      },
      "candy-match": {
        phase: "playing",
        rows: 6,
        cols: 6,
        grid: [
          { id: "0-0", r: 0, c: 0, color: "yellow", word: "apple" },
          { id: "0-1", r: 0, c: 1, color: "yellow", word: "book" },
          { id: "0-2", r: 0, c: 2, color: "yellow", word: "cat" },
          { id: "0-3", r: 0, c: 3, color: "pink", word: "dog" },
          { id: "0-4", r: 0, c: 4, color: "purple", word: "sun" },
          { id: "0-5", r: 0, c: 5, color: "teal", word: "fish" },
        ],
        turn: "teacher",
        selected: null,
        lastMatch: 0,
        moves: { teacher: 2, student: 1 },
      },
      "word-shop": {
        phase: "playing",
        round: 1,
        maxRounds: 8,
        request: "Can I have a apple, please?",
        requestHe: "תפוח",
        correct: "apple",
        shelf: [
          { en: "apple", emoji: "🍎", he: "תפוח" },
          { en: "book", emoji: "📚", he: "ספר" },
          { en: "water", emoji: "💧", he: "מים" },
        ],
        clicks: {},
        roundWinner: null,
      },
    };
    return states[gameId];
  },

  renderPreview(gameId) {
    const state = this.previewState(gameId);
    if (!state) return "<p>תצוגה מקדימה לא זמינה</p>";
    const ctx = {
      role: "teacher",
      room: { teacherName: "מורה", studentName: "תלמיד" },
      scores: { teacher: 30, student: 20 },
      sendAction: () => {},
    };
    return this.render(gameId, state, ctx);
  },

  previewDescription(gameId) {
    const desc = {
      "vocabulary-duel": "שניכם עונים על שאלות אמריקאיות — מי עונה נכון ראשון מקבל נקודות.",
      "word-memory": "לוח זיכרון משותף — תורות לפי תור, התאימו מילה באנגלית לעברית.",
      hangman: "נחשו אותיות ביחד — כל ניחוש נכון מקרב אתכם לניצחון.",
      "sentence-scramble": "סדרו מילים מבולבלות למשפט נכון — שניכם שולחים תשובה.",
      "spelling-bee": "ראו רמז ואייתו את המילה — מי מצליח קודם?",
      "spot-diff": "שני לוחות כמעט זהים — מי מוצא את ההבדל ראשון?",
      "word-runner": "ריצה וקפיצה — בחרו את המילה הנכונה כדי לקפוץ מעל המכשול!",
      "candy-match": "Match 3 כמו בטלפון — התאימו 3 ממתקים מאותו צבע ולמדו מילים.",
      "word-shop": "נהלו חנות — מי משרת את הלקוח עם המוצר הנכון ראשון?",
    };
    return desc[gameId] || "";
  },
};
