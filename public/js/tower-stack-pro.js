/* Tower Stack Pro — premium word tower game */

window.TowerStackPro = {
  mount(root, ui, D) {
    const GE = window.GameEngine;
    root.innerHTML = `
      <div class="solo-game-wrap ts-pro-wrap">
        <div class="ts-pro-shell hidden" id="tsProShell">
          <canvas class="ts-pro-canvas" id="tsProCanvas"></canvas>
          <div class="ts-pro-ui">
            <div class="ts-pro-hud">
              <div class="ts-pro-stat"><span>❤️</span><div class="ts-pro-hearts" id="tsProLives"></div></div>
              <div class="ts-pro-stat"><span>🔥</span><strong id="tsProStreak">0</strong></div>
              <div class="ts-pro-stat"><span>🏗️</span><strong id="tsProHeight">0</strong></div>
            </div>
            <div class="ts-pro-word-bar hidden" id="tsProWordBar">
              <span class="ts-pro-label">מילה:</span>
              <strong id="tsProEnWord" dir="ltr">—</strong>
            </div>
            <div class="ts-pro-timer hidden" id="tsProTimer"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" id="tsProTimerRing"/></svg><span id="tsProTimerNum">8</span></div>
          </div>
          <div class="ts-pro-controls hidden" id="tsProControls">
            <button type="button" class="ts-pro-btn ts-pro-btn--no" id="tsProNo">✗ לא נכון</button>
            <button type="button" class="ts-pro-btn ts-pro-btn--yes" id="tsProYes">✓ נכון</button>
          </div>
        </div>
        <div class="ts-pro-overlay" id="tsProStart">
          <div class="ts-pro-overlay-card">
            <h2>מגדל מילים</h2>
            <p>קוביות נופלות מהשמיים — מילה באנגלית, ואז פירוש בעברית.<br>החליטו נכון או לא נכון. בנו את המגדל הגבוה ביותר!</p>
            <button type="button" class="ts-pro-start-btn" id="tsProStartBtn">▶ התחל</button>
          </div>
        </div>
        <div class="ts-pro-overlay hidden" id="tsProOver">
          <div class="ts-pro-overlay-card ts-pro-overlay-card--over">
            <h2 id="tsProOverTitle">Game Over</h2>
            <p id="tsProOverMsg"></p>
            <button type="button" class="ts-pro-start-btn" id="tsProRetry">↻ שחק שוב</button>
          </div>
        </div>
      </div>`;

    const canvas = document.getElementById("tsProCanvas");
    const ctx = canvas.getContext("2d");
    let animId = 0;
    let running = false;
    let score = 0;
    let lives = 3;
    let streak = 0;
    let tower = [];
    let falling = null;
    let resolveAnim = null;
    let currentWord = null;
    let isCorrectTranslation = false;
    let phase = "idle";
    let cameraY = 0;
    let cameraTarget = 0;
    let shake = 0;
    let flash = 0;
    let towerSway = 0;
    let usedWords = [];
    let lastTs = 0;
    let time = 0;
    const judgeTime = 8;
    let judgeLeft = 8;
    let timerEnabled = true;
    let particles = GE.createParticles();
    let popups = GE.createPopups();
    let clouds = [];
    let cloudsFar = [];
    let trails = [];

    const BLOCK_H = 62;
    const EN_COLOR = {
      front: "#3B82F6",
      frontLight: "#60A5FA",
      frontDark: "#2563EB",
      top: "#93C5FD",
      side: "#1D4ED8",
      sideDark: "#1E3A8A",
      glow: "#60A5FA",
    };
    const HE_COLOR = {
      front: "#F59E0B",
      frontLight: "#FBBF24",
      frontDark: "#D97706",
      top: "#FDE68A",
      side: "#B45309",
      sideDark: "#92400E",
      glow: "#FBBF24",
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.round(rect.width * devicePixelRatio);
      canvas.height = Math.round(rect.height * devicePixelRatio);
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };

    const cw = () => canvas.getBoundingClientRect().width;
    const ch = () => canvas.getBoundingClientRect().height;
    const blockW = () => Math.min(300, cw() * 0.74);
    const groundY = () => ch() - 56;
    const towerTopY = () => groundY() - tower.length * BLOCK_H;

    const initClouds = () => {
      clouds = Array.from({ length: 8 }, (_, i) => ({
        x: (i * cw()) / 5 + Math.random() * 80,
        y: 20 + Math.random() * ch() * 0.3,
        w: 80 + Math.random() * 60,
        speed: 0.08 + Math.random() * 0.12,
        opacity: 0.75 + Math.random() * 0.2,
      }));
      cloudsFar = Array.from({ length: 5 }, (_, i) => ({
        x: (i * cw()) / 4,
        y: 40 + Math.random() * ch() * 0.2,
        w: 120 + Math.random() * 80,
        speed: 0.03 + Math.random() * 0.05,
        opacity: 0.45,
      }));
    };

    const updateHud = () => {
      document.getElementById("tsProLives").innerHTML = Array.from({ length: 3 }, (_, i) =>
        `<span class="${i < lives ? "on" : "off"}">♥</span>`
      ).join("");
      document.getElementById("tsProStreak").textContent = String(streak);
      document.getElementById("tsProHeight").textContent = String(Math.floor(tower.length / 2));
    };

    const pickWord = () => {
      const pool = D.VOCAB.filter((v) => !usedWords.includes(v.en));
      const item = pool.length ? pool[Math.floor(Math.random() * pool.length)] : D.one();
      usedWords.push(item.en);
      if (usedWords.length > D.VOCAB.length - 2) usedWords = [item.en];
      return item;
    };

    const makeBlock = (kind, text, emoji, color) => ({
      kind,
      text,
      emoji: emoji || "",
      x: cw() / 2,
      y: -BLOCK_H - 40,
      targetY: towerTopY() - BLOCK_H,
      vy: 0,
      w: blockW(),
      h: BLOCK_H,
      color,
      rot: 0,
    });

    const startEnFall = () => {
      currentWord = pickWord();
      phase = "en-fall";
      document.getElementById("tsProControls").classList.add("hidden");
      document.getElementById("tsProTimer").classList.add("hidden");
      document.getElementById("tsProWordBar").classList.add("hidden");
      GE.sfxWhoosh();
      falling = makeBlock("en", currentWord.en, currentWord.emoji, EN_COLOR);
      trails = [];
    };

    const startHeFall = () => {
      isCorrectTranslation = Math.random() < 0.52;
      const wrong = D.one([currentWord.en]);
      const displayHe = isCorrectTranslation ? currentWord.he : wrong.he;
      phase = "he-fall";
      document.getElementById("tsProWordBar").classList.remove("hidden");
      document.getElementById("tsProEnWord").textContent = currentWord.en;
      GE.sfxWhoosh();
      falling = makeBlock("he", displayHe, "", HE_COLOR);
      falling.targetY = towerTopY() - BLOCK_H;
      trails = [];
    };

    const syncTimerSetting = () => {
      timerEnabled = !window.PlaySettings?.get("tower-stack")?.disableTimer;
    };

    const beginJudge = () => {
      phase = "he-judge";
      trails = [];
      falling.y = falling.targetY;
      falling.vy = 0;
      syncTimerSetting();
      judgeLeft = judgeTime;
      document.getElementById("tsProControls").classList.remove("hidden");
      if (timerEnabled) {
        document.getElementById("tsProTimer").classList.remove("hidden");
        document.getElementById("tsProTimerNum").textContent = String(Math.ceil(judgeLeft));
      } else {
        document.getElementById("tsProTimer").classList.add("hidden");
      }
    };

    const endGame = () => {
      running = false;
      cancelAnimationFrame(animId);
      document.getElementById("tsProControls").classList.add("hidden");
      document.getElementById("tsProTimer").classList.add("hidden");
      ui.onGameOver(score, "game over");
      document.getElementById("tsProOverTitle").textContent = "Game Over";
      document.getElementById("tsProOverMsg").textContent = `גובה: ${Math.floor(tower.length / 2)} קומות · ניקוד: ${score}`;
      document.getElementById("tsProOver").classList.remove("hidden");
    };

    const resolveAnswer = (playerSaysCorrect) => {
      if (phase !== "he-judge") return;
      document.getElementById("tsProControls").classList.add("hidden");
      document.getElementById("tsProTimer").classList.add("hidden");

      const playerRight = playerSaysCorrect === isCorrectTranslation;
      const shouldStack = playerRight && isCorrectTranslation;

      if (playerRight) {
        const pts = 15 + streak * 5;
        score += pts;
        streak++;
        ui.setScore(score);
        flash = 0.35;
        GE.sfxCorrect();
        GE.addPopup(popups, cw() / 2, ch() * 0.4, `+${pts}`, "#FFE135");
        if (streak >= 3) GE.addPopup(popups, cw() / 2, ch() * 0.35, `🔥 x${streak}!`, "#FF9ECF");
      } else {
        lives--;
        streak = 0;
        shake = 18;
        flash = 0.5;
        GE.sfxWrong();
        GE.addPopup(popups, cw() / 2, ch() * 0.4, "טעות!", "#e07070");
        GE.burst(particles, cw() / 2, falling.targetY + BLOCK_H / 2, { colors: ["#e07070", "#ff4444", "#fff"], count: 30 });
        updateHud();
        if (lives <= 0) {
          phase = "resolve";
          resolveAnim = { type: "tumble", block: { ...falling }, dir: Math.random() > 0.5 ? 1 : -1, rot: 0, rotV: 0.12, vy: 0, t: 0, onDone: endGame };
          falling = null;
          return;
        }
      }

      phase = "resolve";
      if (shouldStack) {
        GE.sfxStack();
        GE.burst(particles, cw() / 2, falling.targetY, { colors: ["#FFE135", "#FBBF24", "#fff", "#4ADE80"], count: 36, speed: 5 });
        towerSway = 0.08;
        resolveAnim = {
          type: "stack",
          block: { ...falling, targetY: falling.targetY },
          t: 0,
          onDone: () => {
            tower.push({ ...resolveAnim.block, kind: "he" });
            updateHud();
            resolveAnim = null;
            setTimeout(startEnFall, 550);
          },
        };
      } else {
        resolveAnim = {
          type: "tumble",
          block: { ...falling },
          dir: Math.random() > 0.5 ? 1 : -1,
          rot: 0,
          rotV: (0.08 + Math.random() * 0.06) * (Math.random() > 0.5 ? 1 : -1),
          vy: 0,
          t: 0,
          onDone: () => {
            resolveAnim = null;
            setTimeout(startEnFall, 700);
          },
        };
        GE.burst(particles, cw() / 2, falling.targetY + BLOCK_H / 2, { colors: ["#F59E0B", "#fff", "#ccc"], count: 20, speed: 3 });
      }
      falling = null;
      updateHud();
    };

    const draw = () => {
      const w = cw();
      const h = ch();
      const bw = blockW();

      ctx.save();
      if (shake > 0.5) {
        ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
        shake *= 0.88;
      }

      if (flash > 0) {
        ctx.fillStyle = `rgba(255,255,255,${flash * 0.4})`;
        ctx.fillRect(0, 0, w, h);
        flash *= 0.9;
      }

      GE.drawSky(ctx, w, h, time);
      GE.drawCloudLayer(ctx, cloudsFar);
      GE.drawCloudLayer(ctx, clouds);

      cameraTarget = Math.max(0, tower.length * BLOCK_H - h * 0.42);
      cameraY += (cameraTarget - cameraY) * 0.06;

      ctx.save();
      ctx.translate(0, cameraY);

      const swayX = Math.sin(time * 0.003 + towerSway * 10) * towerSway * 40;
      if (towerSway > 0.001) towerSway *= 0.95;

      GE.drawGround(ctx, w, groundY(), bw);

      tower.forEach((block, idx) => {
        const by = groundY() - (idx + 1) * BLOCK_H;
        GE.drawCube(ctx, { ...block, x: w / 2 + swayX * (idx / Math.max(tower.length, 1)), y: by, w: bw, h: BLOCK_H });
      });

      if (phase === "en-fall" || phase === "he-fall") {
        trails.forEach((t) => {
          ctx.globalAlpha = t.alpha;
          GE.drawCube(ctx, { ...t, scale: 0.95 });
        });
        ctx.globalAlpha = 1;
      }

      if (falling) {
        const hover = phase === "he-judge" ? Math.sin(time * 0.006) * 4 : 0;
        const glow = false;
        GE.drawCube(ctx, { ...falling, y: falling.y + hover, w: bw, h: BLOCK_H, glow });
      }

      if (resolveAnim) {
        const a = resolveAnim;
        const b = a.block;
        if (a.type === "stack") {
          const ease = GE.easeOutBounce(Math.min(a.t, 1));
          GE.drawCube(ctx, { ...b, y: b.targetY - 30 * (1 - ease), w: bw, h: BLOCK_H, glow: a.t < 0.3 });
        } else {
          const t = Math.min(a.t, 1);
          a.rot += a.rotV;
          a.vy += 0.6;
          const ty = b.y + a.vy * t * 60 + t * t * 80;
          const tx = b.x + a.dir * t * t * 160;
          GE.drawCube(ctx, { ...b, x: tx, y: ty, w: bw, h: BLOCK_H, rot: a.rot, scale: 1 - t * 0.2 });
        }
      }

      GE.drawParticles(ctx, particles);
      ctx.restore();

      GE.drawPopups(ctx, popups);

      if (phase === "he-judge" && timerEnabled) {
        const ring = document.getElementById("tsProTimerRing");
        if (ring) {
          const pct = judgeLeft / judgeTime;
          ring.setAttribute("stroke-dasharray", `${pct * 100} 100`);
        }
      }

      ctx.restore();
    };

    const update = (dt) => {
      time += dt;
      clouds.forEach((c) => {
        c.x += c.speed * (dt / 16);
        if (c.x > cw() + 150) c.x = -150;
      });
      cloudsFar.forEach((c) => {
        c.x += c.speed * (dt / 16);
        if (c.x > cw() + 200) c.x = -200;
      });

      GE.updateParticles(particles, dt);
      GE.updatePopups(popups, dt);

      if (falling && (phase === "en-fall" || phase === "he-fall")) {
        falling.vy += 0.65 * (dt / 16);
        falling.y += falling.vy * (dt / 16);
        falling.targetY = towerTopY() - BLOCK_H;
        if (phase === "en-fall" || phase === "he-fall") {
          trails.unshift({ ...falling, alpha: 0.18 });
          if (trails.length > 3) trails.pop();
          trails.forEach((t, i) => {
            t.alpha = 0.16 - i * 0.05;
          });
        }

        if (falling.y >= falling.targetY) {
          if (phase === "en-fall") {
            falling.y = falling.targetY;
            GE.sfxStack();
            GE.burst(particles, cw() / 2, falling.targetY, { count: 20, colors: ["#60A5FA", "#fff"] });
            tower.push({ ...falling, kind: "en" });
            falling = null;
            trails = [];
            towerSway = 0.05;
            updateHud();
            phase = "wait";
            setTimeout(startHeFall, 800);
          } else {
            beginJudge();
          }
        }
      }

      if (phase === "he-judge" && timerEnabled) {
        judgeLeft -= dt / 1000;
        document.getElementById("tsProTimerNum").textContent = String(Math.max(0, Math.ceil(judgeLeft)));
        if (judgeLeft <= 0) resolveAnswer(false);
      }

      if (resolveAnim) {
        resolveAnim.t += (dt / 16) * 0.055;
        if (resolveAnim.t >= 1) resolveAnim.onDone?.();
      }
    };

    const loop = (ts) => {
      if (!running) return;
      const dt = Math.min(ts - lastTs, 50);
      lastTs = ts;
      update(dt);
      draw();
      animId = requestAnimationFrame(loop);
    };

    const startGame = () => {
      running = true;
      score = 0;
      lives = 3;
      streak = 0;
      tower = [];
      usedWords = [];
      cameraY = 0;
      cameraTarget = 0;
      particles = GE.createParticles();
      popups = GE.createPopups();
      document.getElementById("tsProStart").classList.add("hidden");
      document.getElementById("tsProOver").classList.add("hidden");
      document.getElementById("tsProShell").classList.remove("hidden");
      ui.setScore(0);
      updateHud();
      initClouds();
      resize();
      lastTs = performance.now();
      startEnFall();
      animId = requestAnimationFrame(loop);
    };

    window.addEventListener("resize", resize);
    document.getElementById("tsProStartBtn").addEventListener("click", startGame);
    document.getElementById("tsProRetry").addEventListener("click", startGame);
    document.getElementById("tsProYes").addEventListener("click", () => resolveAnswer(true));
    document.getElementById("tsProNo").addEventListener("click", () => resolveAnswer(false));

    window.addEventListener("play-settings-change", (e) => {
      if (e.detail?.gameId !== "tower-stack") return;
      syncTimerSetting();
      if (phase === "he-judge") {
        if (timerEnabled) {
          document.getElementById("tsProTimer")?.classList.remove("hidden");
        } else {
          document.getElementById("tsProTimer")?.classList.add("hidden");
        }
      }
    });

    syncTimerSetting();

    return () => {
      running = false;
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  },
};
