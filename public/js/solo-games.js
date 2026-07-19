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

  overlayHtml(title, desc, btnId, btnText = "התחל!") {
    return `
      <div class="solo-overlay" id="${btnId}Overlay">
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

    const showQ = () => {
      if (q >= total) {
        root.innerHTML = `<div class="solo-msg ok">סיום! ניקוד: ${score}<br><button class="solo-play-again" onclick="location.reload()">שחק שוב</button></div>`;
        ui.onGameOver(score, "סיום");
        return;
      }
      const question = D.quizQuestion();
      q++;
      root.innerHTML = `
        <div class="solo-game-wrap">
          <div class="solo-hud"><span>שאלה ${q}/${total}</span><span>ניקוד: <strong>${score}</strong></span></div>
          <p style="font-weight:800;text-align:center">מה התרגום?</p>
          <div class="solo-quiz-word">${question.word}</div>
          <p style="text-align:center;font-weight:700;color:var(--muted)">${question.hint}</p>
          <div class="solo-options" id="vdOpts"></div>
        </div>`;

      document.getElementById("vdOpts").innerHTML = question.options
        .map((opt) => `<button type="button" class="solo-option" data-a="${opt}">${opt}</button>`)
        .join("");

      root.querySelectorAll(".solo-option").forEach((btn) => {
        btn.addEventListener("click", () => {
          const ok = btn.dataset.a === question.correct;
          root.querySelectorAll(".solo-option").forEach((b) => {
            b.disabled = true;
            if (b.dataset.a === question.correct) b.classList.add("correct");
            else if (b === btn) b.classList.add("wrong");
          });
          if (ok) {
            score += 10;
            ui.setScore(score);
          }
          setTimeout(showQ, 700);
        });
      });
    };

    root.innerHTML = `<div class="solo-game-wrap">${SoloGames.overlayHtml("Duel מילים", "ענו על 10 שאלות — מה התרגום של המילה?", "vd")}</div>`;
    SoloGames.bindStartRetry("vd", showQ);
    return () => {};
  },

  /* ── Memory ── */
  mountMemory(root, ui) {
    const D = this._data();
    let score = 0;
    let flipped = [];
    let lock = false;
    let cards = [];
    let started = false;

    const build = () => {
      const items = D.pick(6);
      cards = D.shuffle(
        items.flatMap((it, i) => [
          { id: `e${i}`, pair: i, text: it.en, face: false, matched: false },
          { id: `h${i}`, pair: i, text: it.he, face: false, matched: false },
        ])
      );
      flipped = [];
      lock = false;
    };

    const cardHtml = (c) => {
      const cls = ["memory-solo-card", c.face || c.matched ? "face" : "", c.matched ? "matched" : ""]
        .filter(Boolean)
        .join(" ");
      return `<button type="button" class="${cls}" data-id="${c.id}">${c.face || c.matched ? c.text : "?"}</button>`;
    };

    const renderGrid = () => {
      const grid = root.querySelector("#memGrid");
      const scoreEl = root.querySelector("#memScore");
      if (scoreEl) scoreEl.textContent = String(score);
      if (!grid) return;
      grid.innerHTML = cards.map(cardHtml).join("");
    };

    const render = () => {
      const allMatched = cards.every((c) => c.matched);
      if (!started) {
        started = true;
        root.innerHTML = `
          <div class="solo-game-wrap">
            <div class="solo-hud"><span>התאימו זוגות</span><span>ניקוד: <strong id="memScore">${score}</strong></span></div>
            <div class="memory-solo-grid" id="memGrid"></div>
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
    };

    const onCardClick = (e) => {
      const btn = e.target.closest(".memory-solo-card");
      if (!btn || !root.contains(btn) || lock) return;
      const card = cards.find((c) => c.id === btn.dataset.id);
      if (!card || card.face || card.matched) return;

      card.face = true;
      btn.classList.add("face");
      btn.textContent = card.text;
      flipped.push(card);

      if (flipped.length === 2) {
        lock = true;
        const [a, b] = flipped;
        if (a.pair === b.pair) {
          a.matched = true;
          b.matched = true;
          score += 15;
          ui.setScore(score);
          flipped = [];
          lock = false;
          render();
        } else {
          setTimeout(() => {
            a.face = false;
            b.face = false;
            flipped = [];
            lock = false;
            renderGrid();
          }, 700);
        }
      }
    };

    root.innerHTML = `<div class="solo-game-wrap">${SoloGames.overlayHtml("זיכרון מילים", "הפכו קלפים ומצאו זוגות en ↔ he", "mem")}</div>`;
    root.addEventListener("click", onCardClick);
    SoloGames.bindStartRetry("mem", () => {
      build();
      render();
    });
    return () => root.removeEventListener("click", onCardClick);
  },

  /* ── Hangman ── */
  mountHangman(root, ui) {
    const D = this._data();
    let score = 0;
    let word = "";
    let guessed = [];
    let wrong = 0;
    const maxWrong = 7;

    const newWord = () => {
      const item = D.one();
      word = item.en.toUpperCase();
      guessed = [];
      wrong = 0;
      render(item);
    };

    const render = (item) => {
      const display = [...word].map((ch) => (guessed.includes(ch) ? ch : "_")).join(" ");
      const won = [...word.replace(/ /g, "")].every((ch) => guessed.includes(ch));
      const lost = wrong >= maxWrong;

      root.innerHTML = `
        <div class="solo-game-wrap">
          <div class="solo-hud"><span>טעויות: ${wrong}/${maxWrong}</span><span>ניקוד: <strong>${score}</strong></span></div>
          <p style="text-align:center;font-weight:800">${item?.hint || ""} · ${item?.he || ""}</p>
          <div class="hangman-solo-display">${display}</div>
          <div class="hangman-solo-letters" id="hmLetters"></div>
          ${won ? `<div class="solo-msg ok">ניצחון!</div>` : ""}
          ${lost ? `<div class="solo-msg bad">המילה: ${word}</div>` : ""}
        </div>`;

      if (won || lost) {
        if (won) {
          score += 20;
          ui.setScore(score);
        }
        setTimeout(newWord, won ? 1200 : 1800);
        return;
      }

      document.getElementById("hmLetters").innerHTML = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
        .map(
          (L) =>
            `<button type="button" class="${guessed.includes(L) ? "used" : ""}" data-l="${L}" ${guessed.includes(L) ? "disabled" : ""}>${L}</button>`
        )
        .join("");

      root.querySelectorAll("#hmLetters button:not([disabled])").forEach((btn) => {
        btn.addEventListener("click", () => {
          const L = btn.dataset.l;
          guessed.push(L);
          if (!word.includes(L)) wrong++;
          render(item);
        });
      });
    };

    root.innerHTML = `<div class="solo-game-wrap">${SoloGames.overlayHtml("איש תלוי", "נחשו אותיות — לפני שנג зак!", "hm")}</div>`;
    SoloGames.bindStartRetry("hm", () => {
      const item = D.one();
      word = item.en.toUpperCase();
      guessed = [];
      wrong = 0;
      render(item);
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