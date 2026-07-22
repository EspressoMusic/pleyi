/* Solo playable games — full engines for /play/:gameId */

const SoloGames = {
  names: {
    "word-runner": "רץ וקופץ",
    "spot-diff": "מצא את ההבדלים",
    "candy-match": "ממתקים Match 3",
    "word-shop": "חנות קטנה",
    "vocabulary-duel": "Duel מילים",
    "word-memory": "זיכרון מילים",
    hangman: "איש תלוי",
    "sentence-scramble": "בניית משפט",
    "spelling-bee": "איות",
    "tower-stack": "מגדל מילים",
    "math-blitz": "ברק מתמטי",
    "math-duel": "Duel מתמטי",
    "math-memory": "זיכרון מספרים",
    "math-tower": "מגדל מספרים",
    "math-runner": "רץ ומחשב",
    "math-shop": "חנות מתמטית",
  },

  _aliases: {
    "math-duel": "vocabulary-duel",
    "math-memory": "word-memory",
    "math-tower": "tower-stack",
    "math-runner": "word-runner",
    "math-shop": "word-shop",
  },

  _data() {
    return typeof getGameData === "function" ? getGameData(window._currentGameId) : VOCAB_DATA;
  },

  mount(gameId, root, ui) {
    const resolved = this._aliases[gameId] || gameId;
    const fn = {
      "word-runner": this.mountWordRunner,
      "spot-diff": this.mountSpotDiff,
      "candy-match": this.mountCandyMatch,
      "word-shop": this.mountWordShop,
      "vocabulary-duel": this.mountVocabDuel,
      "word-memory": this.mountMemory,
      hangman: this.mountHangman,
      "sentence-scramble": this.mountScramble,
      "spelling-bee": this.mountSpelling,
      "tower-stack": this.mountTowerStack,
      "math-blitz": this.mountMathBlitz,
    }[resolved];

    if (!fn) return null;
    window._currentGameId = gameId;
    return fn.call(this, root, ui);
  },

  overlayHtml(title, desc, btnId, btnText = "התחל!", extraClass = "") {
    const overlayCls = ["solo-overlay", extraClass].filter(Boolean).join(" ");
    return `
      <div class="${overlayCls}" id="${btnId}Overlay">
        <h2 class="font-cartoon">${title}</h2>
        <p>${desc}</p>
        <button type="button" class="btn btn-primary btn-candy solo-play-again" id="${btnId}Start">${btnText}</button>
      </div>
      <div class="solo-overlay hidden" id="${btnId}Over">
        <h2 class="font-cartoon" id="${btnId}OverTitle">Game Over</h2>
        <p id="${btnId}OverMsg"></p>
        <button type="button" class="solo-play-again" id="${btnId}Retry">שחק שוב</button>
      </div>`;
  },

  bindStartRetry(prefix, onStart) {
    const start = document.getElementById(`${prefix}Start`);
    const retry = document.getElementById(`${prefix}Retry`);
    const startOverlay = document.getElementById(`${prefix}Overlay`);
    const overOverlay = document.getElementById(`${prefix}Over`);

    const go = () => {
      startOverlay?.classList.add("hidden");
      overOverlay?.classList.add("hidden");
      onStart();
    };

    start?.addEventListener("click", go);
    retry?.addEventListener("click", go);
    return go;
  },

  showGameOver(prefix, title, msg) {
    document.getElementById(`${prefix}OverTitle`).textContent = title;
    document.getElementById(`${prefix}OverMsg`).textContent = msg;
    document.getElementById(`${prefix}Over`)?.classList.remove("hidden");
  },

  /* ── Temple Run word runner ── */
  mountWordRunner(root, ui) {
    const D = this._data();
    root.innerHTML = `
      <div class="solo-game-wrap wr-wrap">
        ${this.overlayHtml(
          "רץ וקופץ",
          "עברו לנתיב של המילה הנכונה באנגלית. פגיעה במילה שגויה = Game Over! חצים ← → או כפתורים.",
          "wr"
        )}
        <div class="solo-hud wr-hud hidden" id="wrHud">
          <span>תפוס: <strong id="wrHint" dir="ltr">—</strong></span>
          <span class="solo-lives" id="wrLives">❤️❤️❤️</span>
          <span>מהירות: <strong id="wrSpeed">1</strong></span>
        </div>
        <canvas class="wr-canvas" id="wrCanvas"></canvas>
        <div class="wr-controls hidden" id="wrControls">
          <button type="button" id="wrLeft" aria-label="שמאל">←</button>
          <button type="button" id="wrRight" aria-label="ימין">→</button>
        </div>
      </div>`;

    const canvas = document.getElementById("wrCanvas");
    const ctx = canvas.getContext("2d");
    const hud = document.getElementById("wrHud");
    const controls = document.getElementById("wrControls");
    let animId = 0;
    let running = false;
    let score = 0;
    let lives = 3;
    let lane = 1;
    let speed = 2.2;
    let level = 1;
    let target = null;
    let words = [];
    let spawnTimer = 0;
    let lastTs = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * devicePixelRatio;
      canvas.height = rect.height * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };

    const laneX = (ln, w) => {
      const lw = w / 3;
      return lw * ln + lw / 2;
    };

    const newTarget = () => {
      target = D.one();
      document.getElementById("wrHint").textContent = `${target.emoji || ""} ${target.he} (${target.hint})`;
    };

    const spawnWave = () => {
      if (!target) newTarget();
      const correctLane = Math.floor(Math.random() * 3);
      const wrongPool = D.pick(6, [target.en]);
      let wi = 0;
      for (let i = 0; i < 3; i++) {
        const isCorrect = i === correctLane;
        words.push({
          text: isCorrect ? target.en : wrongPool[wi++].en,
          lane: i,
          y: -40,
          isCorrect,
          hit: false,
        });
      }
    };

    let roadOffset = 0;
    let runBounce = 0;

    const drawRoad = (w, h) => {
      const GE = window.GameEngine;
      const sky = ctx.createLinearGradient(0, 0, 0, h * 0.55);
      sky.addColorStop(0, "#5ec6ff");
      sky.addColorStop(1, "#3a9ee8");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h * 0.55);

      ctx.fillStyle = "#2d9a55";
      ctx.beginPath();
      ctx.moveTo(0, h * 0.45);
      ctx.lineTo(w, h * 0.45);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      const horizon = h * 0.45;
      ctx.fillStyle = "#444";
      ctx.beginPath();
      ctx.moveTo(w * 0.18, horizon);
      ctx.lineTo(w * 0.82, horizon);
      ctx.lineTo(w * 0.68, h - 80);
      ctx.lineTo(w * 0.32, h - 80);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#555";
      ctx.beginPath();
      ctx.moveTo(w * 0.32, h - 80);
      ctx.lineTo(w * 0.68, h - 80);
      ctx.lineTo(w * 0.62, h);
      ctx.lineTo(w * 0.38, h);
      ctx.closePath();
      ctx.fill();

      for (let i = 0; i < 8; i++) {
        const t = ((i * 0.12 + roadOffset) % 1);
        const y = horizon + (h - 80 - horizon) * t;
        const l1 = w * GE.lerp(0.32, 0.18, t);
        const r1 = w * GE.lerp(0.68, 0.82, t);
        const l2 = w * GE.lerp(0.38, 0.18, t + 0.08);
        const r2 = w * GE.lerp(0.62, 0.82, t + 0.08);
        ctx.fillStyle = i % 2 ? "#666" : "#5a5a5a";
        ctx.beginPath();
        ctx.moveTo(l1, y);
        ctx.lineTo(r1, y);
        ctx.lineTo(r2, y + (h - 80 - horizon) * 0.08);
        ctx.lineTo(l2, y + (h - 80 - horizon) * 0.08);
        ctx.closePath();
        ctx.fill();
      }

      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = 3;
      ctx.setLineDash([18, 14]);
      ctx.beginPath();
      ctx.moveTo(w / 2, horizon);
      ctx.lineTo(w / 2, h - 80);
      ctx.stroke();
      ctx.setLineDash([]);
    };

    const laneXAtY = (ln, w, y) => {
      const GE = window.GameEngine;
      const h = canvas.getBoundingClientRect().height;
      const horizon = h * 0.45;
      const t = GE.clamp((y - horizon) / (h - 80 - horizon), 0, 1);
      const left = w * GE.lerp(0.18, 0.32, t);
      const right = w * GE.lerp(0.82, 0.68, t);
      const third = (right - left) / 3;
      return left + third * ln + third / 2;
    };

    const draw = () => {
      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;
      const GE = window.GameEngine;

      drawRoad(w, h);

      words.forEach((wd) => {
        const x = laneXAtY(wd.lane, w, wd.y);
        const t = GE.clamp((wd.y - h * 0.45) / (h - 80 - h * 0.45), 0.05, 1);
        const bw = GE.lerp(w * 0.12, w / 3 - 16, t);
        const bh = GE.lerp(20, 48, t);

        ctx.fillStyle = wd.isCorrect ? "#FFE135" : "#FF9ECF";
        if (wd.isCorrect) {
          ctx.shadowColor = "#FFE135";
          ctx.shadowBlur = 12;
        }
        ctx.strokeStyle = "#1a0a2e";
        ctx.lineWidth = 3;
        roundRect(ctx, x - bw / 2, wd.y, bw, bh, 10);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#1a0a2e";
        ctx.font = `900 ${Math.max(11, bh * 0.38)}px Google Sans, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(wd.text, x, wd.y + bh * 0.62);
      });

      const px = laneX(lane, w);
      runBounce = Math.sin(roadOffset * Math.PI * 2) * 4;
      ctx.font = "52px serif";
      ctx.textAlign = "center";
      ctx.fillText("🏃", px, h - 28 + runBounce);
    };

    function roundRect(c, x, y, wd, ht, r) {
      c.beginPath();
      c.moveTo(x + r, y);
      c.lineTo(x + wd - r, y);
      c.quadraticCurveTo(x + wd, y, x + wd, y + r);
      c.lineTo(x + wd, y + ht - r);
      c.quadraticCurveTo(x + wd, y + ht, x + wd - r, y + ht);
      c.lineTo(x + r, y + ht);
      c.quadraticCurveTo(x, y + ht, x, y + ht - r);
      c.lineTo(x, y + r);
      c.quadraticCurveTo(x, y, x + r, y);
      c.closePath();
    }

    const updateLives = () => {
      document.getElementById("wrLives").textContent = "❤️".repeat(lives) + "🖤".repeat(3 - lives);
    };

    const gameOver = (reason) => {
      running = false;
      cancelAnimationFrame(animId);
      ui.onGameOver(score, reason);
      SoloGames.showGameOver("wr", "Game Over!", `${reason} · ניקוד: ${score}`);
    };

    const loop = (ts) => {
      if (!running) return;
      const dt = Math.min(ts - lastTs, 50);
      lastTs = ts;
      roadOffset = (roadOffset + speed * 0.004 * (dt / 16)) % 1;
      spawnTimer += dt;
      if (spawnTimer > Math.max(900 - level * 40, 450)) {
        spawnWave();
        spawnTimer = 0;
      }

      const h = canvas.getBoundingClientRect().height;
      const catchY = h - 100;

      words = words.filter((wd) => {
        wd.y += speed * (dt / 16);
        if (wd.y > h + 50) {
          if (wd.isCorrect && !wd.hit) {
            lives--;
            updateLives();
            if (lives <= 0) gameOver("פספסת מילה נכונה");
          }
          return false;
        }
        if (wd.y >= catchY && wd.y < catchY + 50 && !wd.hit) {
          wd.hit = true;
          if (wd.lane === lane) {
            if (wd.isCorrect) {
              score += 10 + level;
              ui.setScore(score);
              window.GameEngine?.sfxCorrect();
              level = Math.floor(score / 50) + 1;
              speed = 2.2 + level * 0.25;
              document.getElementById("wrSpeed").textContent = String(level);
              newTarget();
            } else {
              gameOver(`פגעת ב"${wd.text}" — לא נכון!`);
              return false;
            }
          }
        }
        return wd.y < h + 60;
      });

      draw();
      animId = requestAnimationFrame(loop);
    };

    const move = (dir) => {
      if (!running) return;
      lane = Math.max(0, Math.min(2, lane + dir));
    };

    const onKey = (e) => {
      if (e.key === "ArrowLeft" || e.key === "a") move(-1);
      if (e.key === "ArrowRight" || e.key === "d") move(1);
    };

    const startGame = () => {
      running = true;
      score = 0;
      lives = 3;
      lane = 1;
      speed = 2.2;
      level = 1;
      words = [];
      spawnTimer = 0;
      lastTs = performance.now();
      ui.setScore(0);
      updateLives();
      document.getElementById("wrSpeed").textContent = "1";
      newTarget();
      hud.classList.remove("hidden");
      controls.classList.remove("hidden");
      resize();
      animId = requestAnimationFrame(loop);
    };

    window.addEventListener("resize", resize);
    window.addEventListener("keydown", onKey);
    document.getElementById("wrLeft").addEventListener("click", () => move(-1));
    document.getElementById("wrRight").addEventListener("click", () => move(1));

    let touchX = 0;
    canvas.addEventListener(
      "touchstart",
      (e) => {
        touchX = e.touches[0].clientX;
      },
      { passive: true }
    );
    canvas.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 30) move(dx > 0 ? 1 : -1);
    });

    SoloGames.bindStartRetry("wr", startGame);

    return () => {
      running = false;
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKey);
    };
  },

  /* ── Spot the difference ── */
  mountSpotDiff(root, ui) {
    const D = this._data();
    let round = 0;
    let score = 0;
    const maxRounds = 10;

    const render = () => {
      const items = D.pick(6);
      const diffIdx = Math.floor(Math.random() * 6);
      const wrong = D.one([items[diffIdx].en]);
      const left = items;
      const right = items.map((it, i) => (i === diffIdx ? wrong : it));

      root.innerHTML = `
        <div class="solo-game-wrap">
          ${round === 0 ? SoloGames.overlayHtml("מצא את ההבדלים", "לחצו על הפריט השונה בין שני הלוחות.", "sd") : ""}
          <div class="solo-hud">
            <span>סיבוב ${round + 1}/${maxRounds}</span>
            <span>ניקוד: <strong id="sdScore">${score}</strong></span>
          </div>
          <div class="spot-solo-board">
            <div class="spot-solo-panel"><h4>A</h4><div class="spot-solo-grid" id="sdLeft"></div></div>
            <div class="spot-solo-panel"><h4>B</h4><div class="spot-solo-grid" id="sdRight"></div></div>
          </div>
          <div id="sdMsg"></div>
        </div>`;

      if (round === 0) SoloGames.bindStartRetry("sd", () => {});

      const cell = (item, i, side) =>
        `<button type="button" class="spot-solo-cell" data-i="${i}" data-side="${side}">
          <span class="emoji">${item.emoji || "⭐"}</span>
          <span dir="ltr">${item.en}</span>
        </button>`;

      document.getElementById("sdLeft").innerHTML = left.map((it, i) => cell(it, i, "left")).join("");
      document.getElementById("sdRight").innerHTML = right.map((it, i) => cell(it, i, "right")).join("");

      const onPick = (idx) => {
        if (idx === diffIdx) {
          score += 15;
          ui.setScore(score);
          round++;
          if (round >= maxRounds) {
            root.innerHTML = `<div class="solo-msg ok">כל הכבוד! ניקוד: ${score}<br><button class="solo-play-again" onclick="location.reload()">שחק שוב</button></div>`;
            ui.onGameOver(score, "סיום");
            return;
          }
          setTimeout(render, 400);
        } else {
          const btn = root.querySelector(`[data-i="${idx}"]`);
          btn?.classList.add("wrong");
          score = Math.max(0, score - 5);
          ui.setScore(score);
          document.getElementById("sdMsg").innerHTML = `<div class="solo-msg bad">לא נכון! -5</div>`;
        }
      };

      root.querySelectorAll(".spot-solo-cell").forEach((btn) => {
        btn.addEventListener("click", () => onPick(Number(btn.dataset.i)));
      });
    };

    render();
    return () => {};
  },

  /* ── Candy Match 3 ── */
  mountCandyMatch(root, ui) {
    const D = this._data();
    const COLORS = ["yellow", "pink", "purple", "teal"];
    const ROWS = 6;
    const COLS = 6;
    let grid = [];
    let selected = null;
    let score = 0;
    let moves = 30;

    const makeGrid = () => {
      grid = [];
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          grid.push({
            id: `${r}-${c}`,
            r,
            c,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            word: D.VOCAB[Math.floor(Math.random() * D.VOCAB.length)].en,
          });
        }
      }
    };

    const at = (r, c) => grid.find((t) => t.r === r && t.c === c);

    const findMatches = () => {
      const m = new Set();
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS - 2; c++) {
          const a = at(r, c);
          const b = at(r, c + 1);
          const d = at(r, c + 2);
          if (a && b && d && a.color === b.color && b.color === d.color) {
            m.add(a.id);
            m.add(b.id);
            m.add(d.id);
          }
        }
      }
      for (let c = 0; c < COLS; c++) {
        for (let r = 0; r < ROWS - 2; r++) {
          const a = at(r, c);
          const b = at(r + 1, c);
          const d = at(r + 2, c);
          if (a && b && d && a.color === b.color && b.color === d.color) {
            m.add(a.id);
            m.add(b.id);
            m.add(d.id);
          }
        }
      }
      return m;
    };

    const resolve = () => {
      let matched = findMatches();
      let total = 0;
      while (matched.size) {
        total += matched.size;
        matched.forEach((id) => {
          const t = grid.find((x) => x.id === id);
          if (t) {
            t.color = COLORS[Math.floor(Math.random() * COLORS.length)];
            t.word = D.VOCAB[Math.floor(Math.random() * D.VOCAB.length)].en;
          }
        });
        matched = findMatches();
      }
      return total;
    };

    const render = () => {
      root.innerHTML = `
        <div class="solo-game-wrap">
          <div class="solo-hud">
            <span>מהלכים: <strong>${moves}</strong></span>
            <span>ניקוד: <strong id="cmScore">${score}</strong></span>
          </div>
          <p style="font-weight:800;text-align:center;margin:0 0 10px">החליפו שני ממתקים סמוכים — 3+ מאותו צבע!</p>
          <div class="candy-solo-grid" id="cmGrid"></div>
          <div id="cmMsg"></div>
        </div>`;

      const el = document.getElementById("cmGrid");
      el.innerHTML = [...grid]
        .sort((a, b) => a.r - b.r || a.c - b.c)
        .map(
          (t) =>
            `<button type="button" class="candy-solo-tile candy-${t.color} ${selected === t.id ? "selected" : ""}" data-id="${t.id}">${t.word}</button>`
        )
        .join("");

      el.querySelectorAll(".candy-solo-tile").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (moves <= 0) return;
          const id = btn.dataset.id;
          const tile = grid.find((t) => t.id === id);
          if (!selected) {
            selected = id;
            render();
            return;
          }
          if (selected === id) {
            selected = null;
            render();
            return;
          }
          const a = grid.find((t) => t.id === selected);
          if (Math.abs(a.r - tile.r) + Math.abs(a.c - tile.c) !== 1) {
            selected = id;
            render();
            return;
          }
          const tmp = { color: a.color, word: a.word };
          a.color = tile.color;
          a.word = tile.word;
          tile.color = tmp.color;
          tile.word = tmp.word;
          selected = null;
          moves--;
          const chain = resolve();
          if (chain > 0) {
            score += chain * 5;
            ui.setScore(score);
          } else {
            a.color = tmp.color;
            a.word = tmp.word;
            tile.color = tmp.color;
            tile.word = tmp.word;
          }
          if (moves <= 0) {
            document.getElementById("cmMsg").innerHTML =
              `<div class="solo-msg ok">סיום! ניקוד: ${score}<br><button class="solo-play-again" onclick="location.reload()">שחק שוב</button></div>`;
            ui.onGameOver(score, "סיום");
            return;
          }
          render();
        });
      });
    };

    makeGrid();
    while (findMatches().size) makeGrid();
    render();
    return () => {};
  },

  /* ── Word shop ── */
  mountWordShop(root, ui) {
    const D = this._data();
    let score = 0;
    let round = 0;
    let timeLeft = 0;
    let timer = null;
    const maxRounds = 12;

    const nextRound = () => {
      if (round >= maxRounds) {
        clearInterval(timer);
        root.innerHTML = `<div class="solo-msg ok">החנות נסגרה! ניקוד: ${score}<br><button class="solo-play-again" onclick="location.reload()">שחק שוב</button></div>`;
        ui.onGameOver(score, "סיום");
        return;
      }
      const wanted = D.one();
      const shelf = D.shuffle([wanted, ...D.pick(5, [wanted.en])]).slice(0, 6);
      timeLeft = 8;
      round++;

      root.innerHTML = `
        <div class="solo-game-wrap">
          <div class="solo-hud">
            <span>לקוח ${round}/${maxRounds}</span>
            <span>⏱ <strong id="wsTime">${timeLeft}</strong></span>
            <span>ניקוד: <strong id="wsScore">${score}</strong></span>
          </div>
          <div class="shop-solo-customer">
            <span class="emoji">🧑</span>
            <p class="shop-solo-request">Can I have a ${wanted.en}, please?</p>
            <p>${wanted.he}</p>
          </div>
          <div class="shop-solo-shelf" id="wsShelf"></div>
          <div id="wsMsg"></div>
        </div>`;

      document.getElementById("wsShelf").innerHTML = shelf
        .map(
          (it) =>
            `<button type="button" class="shop-solo-item" data-en="${it.en}">
              <span class="emoji">${it.emoji || "⭐"}</span>
              <span dir="ltr">${it.en}</span>
            </button>`
        )
        .join("");

      clearInterval(timer);
      timer = setInterval(() => {
        timeLeft--;
        const tEl = document.getElementById("wsTime");
        if (tEl) tEl.textContent = String(timeLeft);
        if (timeLeft <= 0) {
          clearInterval(timer);
          document.getElementById("wsMsg").innerHTML = `<div class="solo-msg bad">הזמן נגמר!</div>`;
          setTimeout(nextRound, 800);
        }
      }, 1000);

      root.querySelectorAll(".shop-solo-item").forEach((btn) => {
        btn.addEventListener("click", () => {
          clearInterval(timer);
          if (btn.dataset.en === wanted.en) {
            score += 14 + timeLeft;
            ui.setScore(score);
            document.getElementById("wsMsg").innerHTML = `<div class="solo-msg ok">נכון! +${14 + timeLeft}</div>`;
          } else {
            score = Math.max(0, score - 5);
            ui.setScore(score);
            document.getElementById("wsMsg").innerHTML = `<div class="solo-msg bad">לא נכון!</div>`;
          }
          setTimeout(nextRound, 700);
        });
      });
    };

    root.innerHTML = `<div class="solo-game-wrap">${SoloGames.overlayHtml("חנות קטנה", "שרתו את הלקוח — לחצו על המוצר הנכון לפני שהזמן נגמר!", "ws")}</div>`;
    SoloGames.bindStartRetry("ws", nextRound);

    return () => clearInterval(timer);
  },

  /* ── Vocabulary duel solo ── */
  mountVocabDuel(root, ui) {
    const D = this._data();
    let score = 0;
    let q = 0;
    const total = 10;
    let timer = null;
    let timeLeft = 0;
    const QUESTION_TIME = 30;

    const timerEnabled = () => !window.PlaySettings?.get("vocabulary-duel")?.disableTimer;

    const clearQTimer = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    const syncPlayHud = (qNum, seconds, showTimer) => {
      const qPill = document.getElementById("playQuestionPill");
      const qEl = document.getElementById("playQuestionNum");
      const tPill = document.getElementById("playTimerPill");
      const tEl = document.getElementById("playTimerNum");
      if (qPill && qEl) {
        qPill.classList.remove("hidden");
        qEl.textContent = `${qNum}/${total}`;
      }
      if (tPill && tEl) {
        tPill.classList.toggle("hidden", !showTimer);
        if (showTimer) tEl.textContent = String(seconds);
      }
    };

    const hidePlayHud = () => {
      document.getElementById("playQuestionPill")?.classList.add("hidden");
      document.getElementById("playTimerPill")?.classList.add("hidden");
    };

    const showQ = () => {
      clearQTimer();
      if (q >= total) {
        hidePlayHud();
        root.innerHTML = `<div class="solo-msg ok">סיום! ניקוד: ${score}<br><button class="solo-play-again" onclick="location.reload()">שחק שוב</button></div>`;
        ui.onGameOver(score, "סיום");
        return;
      }
      const question = D.quizQuestion();
      q++;
      const showTimer = timerEnabled();
      syncPlayHud(q, QUESTION_TIME, showTimer);

      root.innerHTML = `
        <div class="solo-game-wrap solo-game-wrap--vd">
          <p class="vd-prompt">מה התרגום?</p>
          <div class="vd-word-box">
            <div class="solo-quiz-word">${question.word}</div>
          </div>
          <div class="solo-options solo-options--vd" id="vdOpts"></div>
          <div id="vdMsg"></div>
        </div>`;

      document.getElementById("vdOpts").innerHTML = question.options
        .map(
          (opt, i) =>
            `<button type="button" class="solo-option solo-option--c${i}" data-a="${opt}"><span class="solo-option-num">${i + 1}</span><span class="solo-option-text">${opt}</span></button>`
        )
        .join("");

      let answered = false;

      const reveal = (picked) => {
        root.querySelectorAll(".solo-option").forEach((b) => {
          b.disabled = true;
          if (b.dataset.a === question.correct) b.classList.add("correct");
          else if (b === picked) b.classList.add("wrong");
        });
      };

      root.querySelectorAll(".solo-option").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (answered) return;
          answered = true;
          clearQTimer();
          const ok = btn.dataset.a === question.correct;
          reveal(btn);
          if (ok) {
            score += 10;
            ui.setScore(score);
          }
          setTimeout(showQ, 700);
        });
      });

      if (showTimer) {
        timeLeft = QUESTION_TIME;
        timer = setInterval(() => {
          timeLeft--;
          const tEl = document.getElementById("playTimerNum");
          if (tEl) tEl.textContent = String(timeLeft);
          if (timeLeft <= 0 && !answered) {
            answered = true;
            clearQTimer();
            reveal(null);
            const msg = document.getElementById("vdMsg");
            if (msg) msg.innerHTML = `<div class="solo-msg bad">הזמן נגמר!</div>`;
            setTimeout(showQ, 800);
          }
        }, 1000);
      }
    };

    const onSettings = (e) => {
      if (e.detail?.gameId !== "vocabulary-duel" || e.detail?.key !== "disableTimer") return;
      if (e.detail.value) {
        clearQTimer();
        document.getElementById("playTimerPill")?.classList.add("hidden");
      }
    };
    window.addEventListener("play-settings-change", onSettings);

    root.innerHTML = `<div class="solo-game-wrap">${SoloGames.overlayHtml("טריוויה", "ענו על השאלות — מה התרגום של המילה?", "vd")}</div>`;
    SoloGames.bindStartRetry("vd", showQ);
    return () => {
      clearQTimer();
      hidePlayHud();
      window.removeEventListener("play-settings-change", onSettings);
    };
  },

  /* ── Memory ── */
  mountMemory(root, ui) {
    const D = this._data();
    let score = 0;
    let flipped = [];
    let lock = false;
    let cards = [];
    let started = false;

    const pairCount = () => {
      const wanted = window.PlaySettings?.get("word-memory")?.pairCount || 6;
      const max = Math.max(2, D.VOCAB?.length || 6);
      return Math.min(wanted, max);
    };

    const gridLayout = (count) => {
      if (count <= 6) return { cols: 3, rows: 2 };
      if (count <= 8) return { cols: 4, rows: 2 };
      if (count <= 9) return { cols: 3, rows: 3 };
      return { cols: 4, rows: 3 };
    };

    const applyGridLayout = () => {
      const { cols, rows } = gridLayout(pairCount());
      root.querySelectorAll(".memory-solo-grid").forEach((grid) => {
        grid.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
        grid.style.gridTemplateRows = `repeat(${rows}, minmax(0, 1fr))`;
      });
    };

    const resetGame = () => {
      score = 0;
      ui.setScore(0);
      build();
      root.querySelector(".solo-msg")?.remove();
      if (started) {
        renderGrid();
        applyGridLayout();
      }
    };

    const build = () => {
      const items = D.pick(pairCount());
      const enCards = D.shuffle(
        items.map((it, i) => ({ id: `e${i}`, pair: i, text: it.en, group: "a", face: false, matched: false }))
      );
      const heCards = D.shuffle(
        items.map((it, i) => ({ id: `h${i}`, pair: i, text: it.he, group: "b", face: false, matched: false }))
      );
      cards = [...enCards, ...heCards];
      flipped = [];
      lock = false;
    };

    const FLIP_MS = 280;

    const animateFlip = (btn, flipped) => {
      if (!btn) return;
      btn.classList.add("is-flipping");
      btn.classList.toggle("is-flipped", flipped);
      setTimeout(() => btn.classList.remove("is-flipping"), FLIP_MS + 30);
    };

    const escapeHtml = (str) =>
      String(str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

    const fitMemoryCardTexts = () => {
      root.querySelectorAll(".memory-solo-card-front").forEach((front) => {
        const textEl = front.querySelector(".memory-solo-card-text");
        if (!textEl || !front.clientWidth) return;
        textEl.style.fontSize = "";
        textEl.style.whiteSpace = "nowrap";
        textEl.style.lineHeight = "1.15";
        let size = parseFloat(getComputedStyle(textEl).fontSize) || 18;
        const maxW = front.clientWidth - 10;
        const maxH = front.clientHeight - 10;
        let guard = 0;
        while (guard < 48 && (textEl.scrollWidth > maxW || textEl.scrollHeight > maxH) && size > 8) {
          size -= 1;
          textEl.style.fontSize = `${size}px`;
          guard += 1;
        }
        if (textEl.scrollWidth > maxW || textEl.scrollHeight > maxH) {
          textEl.style.whiteSpace = "normal";
          while (guard < 64 && textEl.scrollHeight > maxH && size > 8) {
            size -= 1;
            textEl.style.fontSize = `${size}px`;
            guard += 1;
          }
        }
      });
    };

    const cardHtml = (c) => {
      const cls = ["memory-solo-card", c.face || c.matched ? "is-flipped" : "", c.matched ? "matched" : ""]
        .filter(Boolean)
        .join(" ");
      const dir = c.group === "a" ? "ltr" : "rtl";
      return `<button type="button" class="${cls}" data-id="${c.id}"${c.matched ? " disabled" : ""}>
        <span class="memory-solo-card-front" dir="${dir}"><span class="memory-solo-card-text">${escapeHtml(c.text)}</span></span>
        <span class="memory-solo-card-back" aria-hidden="true">?</span>
      </button>`;
    };

    const renderGrid = () => {
      const gridA = root.querySelector("#memGridA");
      const gridB = root.querySelector("#memGridB");
      if (gridA) gridA.innerHTML = cards.filter((c) => c.group === "a").map(cardHtml).join("");
      if (gridB) gridB.innerHTML = cards.filter((c) => c.group === "b").map(cardHtml).join("");
      requestAnimationFrame(fitMemoryCardTexts);
    };

    const render = () => {
      const allMatched = cards.every((c) => c.matched);
      if (!started) {
        started = true;
        root.innerHTML = `
          <div class="solo-game-wrap">
            <div class="memory-solo-board">
              <div class="memory-solo-group memory-solo-group--a">
                <div class="memory-solo-grid" id="memGridA"></div>
              </div>
              <div class="memory-solo-group memory-solo-group--b">
                <div class="memory-solo-grid" id="memGridB"></div>
              </div>
            </div>
          </div>`;
      }

      if (allMatched) {
        root.querySelector(".solo-game-wrap")?.insertAdjacentHTML(
          "beforeend",
          `<div class="solo-msg ok">כל הזוגות! ניקוד: ${score}<br><button class="solo-play-again" onclick="location.reload()">שחק שוב</button></div>`
        );
        ui.onGameOver(score, "סיום");
        return;
      }

      renderGrid();
      applyGridLayout();
    };

    const onCardClick = (e) => {
      const btn = e.target.closest(".memory-solo-card:not([disabled])");
      if (!btn || !root.contains(btn) || lock) return;
      if (btn.classList.contains("is-flipped") || btn.classList.contains("is-flipping")) return;
      const card = cards.find((c) => c.id === btn.dataset.id);
      if (!card || card.face || card.matched) return;

      card.face = true;
      animateFlip(btn, true);
      flipped.push(card);

      if (flipped.length === 2) {
        lock = true;
        const [a, b] = flipped;
        if (a.pair === b.pair) {
          a.matched = true;
          b.matched = true;
          score += 15;
          ui.setScore(score);
          const btnA = root.querySelector(`.memory-solo-card[data-id="${a.id}"]`);
          const btnB = root.querySelector(`.memory-solo-card[data-id="${b.id}"]`);
          btnA?.classList.add("matched", "is-match-pop");
          btnB?.classList.add("matched", "is-match-pop");
          btnA?.setAttribute("disabled", "");
          btnB?.setAttribute("disabled", "");
          flipped = [];
          lock = false;
          if (cards.every((c) => c.matched)) {
            setTimeout(() => {
              root.querySelector(".solo-game-wrap")?.insertAdjacentHTML(
                "beforeend",
                `<div class="solo-msg ok">כל הזוגות! ניקוד: ${score}<br><button class="solo-play-again" onclick="location.reload()">שחק שוב</button></div>`
              );
              ui.onGameOver(score, "סיום");
            }, 450);
          }
        } else {
          setTimeout(() => {
            const btnA = root.querySelector(`.memory-solo-card[data-id="${a.id}"]`);
            const btnB = root.querySelector(`.memory-solo-card[data-id="${b.id}"]`);
            animateFlip(btnA, false);
            animateFlip(btnB, false);
            setTimeout(() => {
              a.face = false;
              b.face = false;
              flipped = [];
              lock = false;
            }, FLIP_MS);
          }, 620);
        }
      }
    };

    root.innerHTML = `<div class="solo-game-wrap">${SoloGames.overlayHtml("זיכרון מילים", "הפכו קלפים ומצאו זוגות", "mem")}</div>`;
    root.addEventListener("click", onCardClick);
    const onSettings = (e) => {
      if (e.detail?.gameId !== "word-memory" || e.detail?.key !== "pairCount") return;
      resetGame();
    };
    window.addEventListener("play-settings-change", onSettings);
    SoloGames.bindStartRetry("mem", () => {
      build();
      render();
    });
    return () => {
      root.removeEventListener("click", onCardClick);
      window.removeEventListener("play-settings-change", onSettings);
    };
  },

  /* ── Hangman ── */
  mountHangman(root, ui) {
    const D = this._data();
    let score = 0;
    let word = "";
    let guessed = [];
    let wrong = 0;
    const maxWrong = 7;
    let currentItem = null;

    const escapeHtml = (s) =>
      String(s || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    const hangmanSvg = () => `
      <svg class="hangman-solo-svg" viewBox="0 0 200 220" aria-hidden="true">
        <g class="hm-gallows" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round">
          <line x1="20" y1="210" x2="120" y2="210"/>
          <line x1="50" y1="210" x2="50" y2="24"/>
          <line x1="50" y1="24" x2="130" y2="24"/>
          <line x1="130" y1="24" x2="130" y2="52"/>
        </g>
        <circle class="hm-part" data-step="1" cx="130" cy="68" r="16" stroke="currentColor" stroke-width="4" fill="none"/>
        <line class="hm-part" data-step="2" x1="130" y1="84" x2="130" y2="138" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
        <line class="hm-part" data-step="3" x1="130" y1="98" x2="98" y2="118" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
        <line class="hm-part" data-step="4" x1="130" y1="98" x2="162" y2="118" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
        <line class="hm-part" data-step="5" x1="130" y1="138" x2="104" y2="178" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
        <line class="hm-part" data-step="6" x1="130" y1="138" x2="156" y2="178" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
      </svg>`;

    const buildShell = () => {
      root.innerHTML = `
        <div class="solo-game-wrap hangman-solo-wrap">
          ${SoloGames.overlayHtml("איש תלוי", "נחשו אותיות", "hm")}
          <div class="hangman-solo hidden" id="hmStage" aria-live="polite">
            <div class="hangman-solo-card">
              <div class="hangman-solo-hint" id="hmHint"></div>
              <div class="hangman-solo-body">
                <div class="hangman-solo-figure-wrap">
                  ${hangmanSvg()}
                  <div class="hangman-solo-lives" id="hmLives" aria-label="ניסיונות שנותרו"></div>
                </div>
                <div class="hangman-solo-slots" id="hmSlots" dir="ltr"></div>
              </div>
              <div class="hangman-solo-letters" id="hmLetters" dir="ltr"></div>
              <div class="hangman-solo-result hidden" id="hmResult"></div>
            </div>
          </div>
        </div>`;
    };

    const renderLives = () => {
      const el = document.getElementById("hmLives");
      if (!el) return;
      el.innerHTML = Array.from({ length: maxWrong }, (_, i) => {
        const lost = i < wrong;
        return `<span class="hangman-solo-life${lost ? " is-lost" : ""}"></span>`;
      }).join("");
    };

    const updateFigure = (animateLast = false) => {
      root.querySelectorAll(".hm-part").forEach((part) => {
        const step = Number(part.dataset.step);
        const visible = step <= wrong;
        part.classList.toggle("is-visible", visible);
        if (animateLast && visible && step === wrong) {
          part.classList.add("is-new");
          part.addEventListener("animationend", () => part.classList.remove("is-new"), { once: true });
        }
      });
    };

    const renderSlots = (revealLetter = null) => {
      const el = document.getElementById("hmSlots");
      if (!el) return;
      el.innerHTML = [...word]
        .map((ch) => {
          if (ch === " ") return `<span class="hangman-slot is-space"></span>`;
          const show = guessed.includes(ch);
          const justRevealed = revealLetter === ch && show;
          return `<span class="hangman-slot${show ? " is-revealed" : ""}${justRevealed ? " is-pop" : ""}">
            <span class="hangman-slot-letter">${show ? escapeHtml(ch) : ""}</span>
          </span>`;
        })
        .join("");
      if (revealLetter) {
        el.querySelectorAll(".hangman-slot.is-pop").forEach((slot) => {
          slot.addEventListener("animationend", () => slot.classList.remove("is-pop"), { once: true });
        });
      }
    };

    const renderKeyboard = (clickedLetter = null, wasCorrect = null) => {
      const el = document.getElementById("hmLetters");
      if (!el) return;
      el.innerHTML = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
        .map((L) => {
          const used = guessed.includes(L);
          let cls = "hangman-key";
          if (used) cls += wasCorrect === true && L === clickedLetter ? " is-correct" : " is-used";
          if (used && wasCorrect === false && L === clickedLetter) cls += " is-wrong";
          return `<button type="button" class="${cls}" data-l="${L}" ${used ? "disabled" : ""}>${L}</button>`;
        })
        .join("");

      el.querySelectorAll("button:not([disabled])").forEach((btn) => {
        btn.addEventListener("click", () => onGuess(btn.dataset.l));
      });

      if (clickedLetter) {
        const btn = el.querySelector(`[data-l="${clickedLetter}"]`);
        if (btn) {
          btn.addEventListener("animationend", () => btn.classList.remove("is-wrong", "is-correct"), { once: true });
        }
      }
    };

    const renderHint = () => {
      const el = document.getElementById("hmHint");
      if (!el || !currentItem) return;
      el.innerHTML = `
        <span class="hangman-solo-hint-badge">רמז</span>
        <span class="hangman-solo-hint-he font-cartoon">${escapeHtml(currentItem.he)}</span>
        ${currentItem.hint ? `<span class="hangman-solo-hint-en">${escapeHtml(currentItem.hint)}</span>` : ""}`;
    };

    const showResult = (type, message) => {
      const el = document.getElementById("hmResult");
      if (!el) return;
      el.className = `hangman-solo-result is-${type}`;
      el.textContent = message;
      el.classList.remove("hidden");
    };

    const hideResult = () => {
      document.getElementById("hmResult")?.classList.add("hidden");
    };

    const isWon = () => [...word.replace(/ /g, "")].every((ch) => guessed.includes(ch));
    const isLost = () => wrong >= maxWrong;

    const onGuess = (letter) => {
      if (!letter || guessed.includes(letter) || isWon() || isLost()) return;
      guessed.push(letter);
      const correct = word.includes(letter);
      if (!correct) wrong++;

      renderSlots(correct ? letter : null);
      renderLives();
      updateFigure(!correct);
      renderKeyboard(letter, correct);

      if (!correct) {
        document.getElementById("hmStage")?.classList.add("is-shake");
        document.getElementById("hmStage")?.addEventListener(
          "animationend",
          () => document.getElementById("hmStage")?.classList.remove("is-shake"),
          { once: true }
        );
      }

      if (isWon()) {
        score += 20;
        ui.setScore(score);
        document.getElementById("hmStage")?.classList.add("is-win");
        showResult("win", "כל הכבוד! 🎉");
        setTimeout(() => beginWord(true), 1400);
        return;
      }

      if (isLost()) {
        const el = document.getElementById("hmSlots");
        if (el) {
          el.innerHTML = [...word]
            .map((ch) => {
              if (ch === " ") return `<span class="hangman-slot is-space"></span>`;
              const show = guessed.includes(ch);
              return `<span class="hangman-slot is-revealed${show ? "" : " is-missed"}">
                <span class="hangman-slot-letter">${escapeHtml(ch)}</span>
              </span>`;
            })
            .join("");
        }
        showResult("lose", `המילה: ${word}`);
        setTimeout(() => beginWord(true), 2200);
      }
    };

    const beginWord = (animated) => {
      hideResult();
      document.getElementById("hmStage")?.classList.remove("is-win", "is-word-enter");
      currentItem = D.one();
      word = currentItem.en.toUpperCase();
      guessed = [];
      wrong = 0;

      renderHint();
      renderLives();
      updateFigure(false);
      renderSlots();
      renderKeyboard();

      const stage = document.getElementById("hmStage");
      if (animated && stage) {
        void stage.offsetWidth;
        stage.classList.add("is-word-enter");
        stage.querySelectorAll(".hangman-slot:not(.is-space)").forEach((slot, i) => {
          slot.style.animationDelay = `${i * 45}ms`;
        });
        stage.addEventListener("animationend", () => stage.classList.remove("is-word-enter"), { once: true });
      }
    };

    buildShell();

    SoloGames.bindStartRetry("hm", () => {
      document.getElementById("hmStage")?.classList.remove("hidden");
      beginWord(true);
    });

    return () => {};
  },

  /* ── Sentence scramble ── */
  mountScramble(root, ui) {
    const D = this._data();
    let score = 0;
    let round = 0;
    const max = 8;

    const next = () => {
      if (round >= max) {
        root.innerHTML = `<div class="solo-msg ok">סיום! ניקוד: ${score}<br><button class="solo-play-again" onclick="location.reload()">שחק שוב</button></div>`;
        ui.onGameOver(score, "סיום");
        return;
      }
      const s = D.SENTENCES[Math.floor(Math.random() * D.SENTENCES.length)];
      const answer = s.words.join(" ");
      let bank = D.shuffle([...s.words]);
      let built = [];
      round++;

      const draw = () => {
        root.innerHTML = `
          <div class="solo-game-wrap">
            <div class="solo-hud"><span>משפט ${round}/${max}</span><span>ניקוד: <strong>${score}</strong></span></div>
            <p style="text-align:center;font-weight:800">${s.he}</p>
            <div class="scramble-solo-chips" id="scBuilt">${built.map((w, i) => `<button type="button" class="scramble-chip" data-i="${i}">${w}</button>`).join("") || "..."}</div>
            <div class="scramble-solo-bank" id="scBank">${bank.map((w, i) => `<button type="button" class="scramble-chip" data-bi="${i}">${w}</button>`).join("")}</div>
            <button type="button" class="btn btn-primary btn-candy" id="scCheck">בדוק ✓</button>
            <div id="scMsg"></div>
          </div>`;

        root.querySelectorAll("#scBuilt .scramble-chip").forEach((btn) => {
          btn.addEventListener("click", () => {
            const i = Number(btn.dataset.i);
            bank.push(built[i]);
            built.splice(i, 1);
            draw();
          });
        });

        root.querySelectorAll("#scBank .scramble-chip").forEach((btn) => {
          btn.addEventListener("click", () => {
            const i = Number(btn.dataset.bi);
            built.push(bank[i]);
            bank.splice(i, 1);
            draw();
          });
        });

        document.getElementById("scCheck").addEventListener("click", () => {
          const attempt = built.join(" ");
          if (attempt.toLowerCase() === answer.toLowerCase()) {
            score += 12;
            ui.setScore(score);
            document.getElementById("scMsg").innerHTML = `<div class="solo-msg ok">מעולה!</div>`;
            setTimeout(next, 600);
          } else {
            document.getElementById("scMsg").innerHTML = `<div class="solo-msg bad">לא בדיוק — נסו שוב</div>`;
          }
        });
      };
      draw();
    };

    root.innerHTML = `<div class="solo-game-wrap">${SoloGames.overlayHtml("בניית משפט", "לחצו על מילים לפי הסדר הנכון", "sc")}</div>`;
    SoloGames.bindStartRetry("sc", next);
    return () => {};
  },

  /* ── Spelling bee ── */
  mountSpelling(root, ui) {
    const D = this._data();
    let score = 0;
    let round = 0;
    const max = 10;

    const next = () => {
      if (round >= max) {
        root.innerHTML = `<div class="solo-msg ok">סיום! ניקוד: ${score}<br><button class="solo-play-again" onclick="location.reload()">שחק שוב</button></div>`;
        ui.onGameOver(score, "סיום");
        return;
      }
      const item = D.one();
      round++;

      root.innerHTML = `
        <div class="solo-game-wrap">
          <div class="solo-hud"><span>מילה ${round}/${max}</span><span>ניקוד: <strong>${score}</strong></span></div>
          <p style="text-align:center;font-weight:900;font-size:28px">${item.he}</p>
          <p style="text-align:center;font-weight:700">${item.hint}</p>
          <input type="text" class="spelling-solo-input" id="spIn" placeholder="type in English..." autocomplete="off" />
          <button type="button" class="btn btn-primary btn-candy btn-full" id="spGo">שלח</button>
          <div id="spMsg"></div>
        </div>`;

      const check = () => {
        const val = document.getElementById("spIn").value.trim().toLowerCase();
        if (val === item.en.toLowerCase()) {
          score += 10;
          ui.setScore(score);
          document.getElementById("spMsg").innerHTML = `<div class="solo-msg ok">נכון!</div>`;
          setTimeout(next, 600);
        } else {
          document.getElementById("spMsg").innerHTML = `<div class="solo-msg bad">לא נכון — ${item.en}</div>`;
          setTimeout(next, 1000);
        }
      };

      document.getElementById("spGo").addEventListener("click", check);
      document.getElementById("spIn").addEventListener("keydown", (e) => {
        if (e.key === "Enter") check();
      });
      document.getElementById("spIn").focus();
    };

    root.innerHTML = `<div class="solo-game-wrap">${SoloGames.overlayHtml("איות", "כתבו את המילה באנגלית לפי הרמז", "sp")}</div>`;
    SoloGames.bindStartRetry("sp", next);
    return () => {};
  },

  /* ── Tower Stack Pro ── */
  mountTowerStack(root, ui) {
    if (window.TowerStackPro) return TowerStackPro.mount(root, ui, this._data());
    return null;
  },

  /* ── Math Blitz Pro ── */
  mountMathBlitz(root, ui) {
    if (window.MathBlitzPro) return MathBlitzPro.mount(root, ui, this._data());
    return null;
  },
};