/* Tower Stack Pro — premium word tower game */

window.TowerStackPro = {
  mount(root, ui, D) {
    const GE = window.GameEngine;
    const ICONS = {
      heart: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.6s-8-4.8-8-10.5a4.4 4.4 0 0 1 8-2.6 4.4 4.4 0 0 1 8 2.6c0 5.7-8 10.5-8 10.5Z"/></svg>`,
      check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5L20 7"/></svg>`,
      cross: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>`,
      play: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7Z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,
      retry: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.6M4 3.5v5.1h5.1"/></svg>`,
    };
    root.innerHTML = `
      <div class="solo-game-wrap ts-pro-wrap">
        <div class="ts-pro-shell hidden" id="tsProShell">
          <canvas class="ts-pro-canvas" id="tsProCanvas"></canvas>
          <div class="ts-pro-ui">
            <div class="ts-pro-hud">
              <div class="ts-pro-hearts" id="tsProLives"></div>
              <div class="ts-pro-stat"><span>קומות</span><strong id="tsProHeight">0</strong></div>
              <div class="ts-pro-stat"><span>שלב</span><strong id="tsProStage">1</strong></div>
            </div>
            <div class="ts-pro-timer hidden" id="tsProTimer"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="15" class="ts-pro-timer-track"/><circle cx="20" cy="20" r="15" pathLength="100" id="tsProTimerRing"/></svg><span id="tsProTimerNum">8</span></div>
          </div>
          <div class="ts-pro-controls hidden" id="tsProControls">
            <button type="button" class="ts-pro-btn ts-pro-btn--no" id="tsProNo">${ICONS.cross}לא נכון</button>
            <button type="button" class="ts-pro-btn ts-pro-btn--yes" id="tsProYes">${ICONS.check}נכון</button>
          </div>
        </div>
        <div class="ts-pro-overlay" id="tsProStart">
          <div class="ts-pro-overlay-card">
            <h2><span class="ts-pro-key">מגדל מילים</span></h2>
            <p>קוביות נופלות מהשמיים: מילה, ואז פירוש.<br>החליטו: הפירוש נכון או לא נכון?<br>בנו את המגדל הכי גבוה!</p>
            <button type="button" class="ts-pro-start-btn" id="tsProStartBtn">${ICONS.play}התחל</button>
          </div>
        </div>
        <div class="ts-pro-overlay hidden" id="tsProOver">
          <div class="ts-pro-overlay-card ts-pro-overlay-card--over">
            <h2><span class="ts-pro-key" id="tsProOverTitle">המשחק נגמר</span></h2>
            <p id="tsProOverMsg"></p>
            <button type="button" class="ts-pro-start-btn" id="tsProRetry">${ICONS.retry}שחקו שוב</button>
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
    let stage = 0;
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
    const CUBE_DEPTH = 4;
    const BLOCK_GAP = 8;
    // Site look: flat sticker blocks with an ink border and a hard offset shadow.
    const INK = "#000";
    const FONT = "Rubik, system-ui, sans-serif";
    const SHADOW_X = 5;
    const SHADOW_Y = 6;
    const EN_COLOR = { fill: "#62ebe0" };
    const HE_COLOR = { fill: "#FFE135" };

    let controlsH = 112;
    // The answer buttons float over the canvas bottom; measure them so the tower stands above them.
    const measureControls = () => {
      const el = document.getElementById("tsProControls");
      const wasHidden = el.classList.contains("hidden");
      el.classList.remove("hidden");
      if (el.offsetHeight) controlsH = el.offsetHeight;
      if (wasHidden) el.classList.add("hidden");
    };

    const resize = () => {
      measureControls();
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.round(rect.width * devicePixelRatio);
      canvas.height = Math.round(rect.height * devicePixelRatio);
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      syncFallingPosition();
    };

    const cw = () => canvas.getBoundingClientRect().width;
    const ch = () => canvas.getBoundingClientRect().height;
    const blockW = () => Math.min(300, cw() * 0.74);
    const groundY = () => ch() - controlsH;
    const blockYForIndex = (idx) => {
      const base = groundY() - (idx + 1) * BLOCK_H;
      return idx > 0 ? base - idx * (CUBE_DEPTH + BLOCK_GAP) : base;
    };
    const nextBlockTargetY = () => blockYForIndex(tower.length);

    const getCameraFocusY = () => {
      const cubeTop = CUBE_DEPTH + 8;
      if (falling) return nextBlockTargetY() - cubeTop;
      if (resolveAnim?.block) return resolveAnim.block.targetY - cubeTop;
      if (tower.length) return blockYForIndex(tower.length - 1) - cubeTop;
      return groundY() - BLOCK_H;
    };

    const syncCamera = (instant = false) => {
      const h = ch();
      const focusY = getCameraFocusY();
      const desiredScreenY = Math.max(96, h * 0.28);
      cameraTarget = Math.max(0, desiredScreenY - focusY);
      if (instant) cameraY = cameraTarget;
    };

    const syncFallingPosition = () => {
      if (!falling) return;
      falling.targetY = nextBlockTargetY();
      if (phase === "he-judge") falling.y = falling.targetY;
    };

    const initClouds = () => {
      clouds = Array.from({ length: 4 }, (_, i) => ({
        x: (i * cw()) / 3 + Math.random() * 60,
        y: 80 + Math.random() * ch() * 0.25,
        w: 70 + Math.random() * 40,
        speed: 0.08 + Math.random() * 0.12,
        opacity: 0.75 + Math.random() * 0.2,
      }));
      cloudsFar = Array.from({ length: 3 }, (_, i) => ({
        x: (i * cw()) / 2.5,
        y: 60 + Math.random() * ch() * 0.2,
        w: 110 + Math.random() * 50,
        speed: 0.03 + Math.random() * 0.05,
        opacity: 0.45,
      }));
    };

    // Pale sky with the site's soft teal dots, drawn once into a pattern tile.
    let dotPattern = null;
    const getDotPattern = () => {
      if (dotPattern) return dotPattern;
      const tile = document.createElement("canvas");
      tile.width = 36;
      tile.height = 36;
      const t = tile.getContext("2d");
      t.fillStyle = "rgba(0, 158, 142, 0.16)";
      [[9, 9], [27, 27]].forEach(([x, y]) => {
        t.beginPath();
        t.arc(x, y, 2.4, 0, Math.PI * 2);
        t.fill();
      });
      dotPattern = ctx.createPattern(tile, "repeat");
      return dotPattern;
    };

    const drawSky = (w, h) => {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#eaf5ff");
      g.addColorStop(1, "#B8FFF5");
      ctx.fillStyle = g;
      ctx.fillRect(-20, -20, w + 40, h + 40);
      ctx.fillStyle = getDotPattern();
      ctx.fillRect(-20, -20, w + 40, h + 40);
    };

    const drawSun = (w) => {
      const sunX = w - 46;
      const sunY = 104 + Math.sin(time * 0.001) * 3;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + time * 0.0003;
        ctx.beginPath();
        ctx.moveTo(sunX + Math.cos(a) * 28, sunY + Math.sin(a) * 28);
        ctx.lineTo(sunX + Math.cos(a) * 36, sunY + Math.sin(a) * 36);
        ctx.stroke();
      }
      ctx.fillStyle = "#FFE135";
      ctx.beginPath();
      ctx.arc(sunX, sunY, 21, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    };

    // Cartoon clouds: stroking every puff twice as thick and then filling them
    // leaves one ink outline around the whole cloud.
    const drawClouds = (list, outlined) => {
      list.forEach((c) => {
        const puffs = [[0, 0, 0.28], [0.28, -0.06, 0.22], [0.52, 0, 0.26], [0.72, 0.04, 0.18]];
        ctx.beginPath();
        puffs.forEach(([dx, dy, r]) => {
          const px = c.x + dx * c.w;
          const py = c.y + dy * c.w;
          ctx.moveTo(px + r * c.w, py);
          ctx.arc(px, py, r * c.w, 0, Math.PI * 2);
        });
        if (outlined) {
          ctx.strokeStyle = INK;
          ctx.lineWidth = 6;
          ctx.stroke();
          ctx.fillStyle = "#fff";
        } else {
          ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
        }
        ctx.fill();
      });
    };

    const drawGround = (w, gy, bw) => {
      ctx.fillStyle = "#00C9B7";
      ctx.fillRect(-20, gy, w + 40, 400);
      ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
      for (let x = 10; x < w; x += 34) ctx.fillRect(x, gy + 14, 16, 5);
      ctx.fillStyle = INK;
      ctx.fillRect(-20, gy, w + 40, 4);
      ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
      ctx.beginPath();
      ctx.ellipse(w / 2 + SHADOW_X, gy + 9, bw / 2 + 14, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    };

    const roundRectPath = (x, y, w, h, r) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    };

    const drawBlock = ({ x, y, w, h, text, kind, color, rot = 0, scale = 1 }) => {
      ctx.save();
      ctx.translate(x, y + h / 2);
      ctx.rotate(rot);
      ctx.scale(scale, scale);
      const left = -w / 2;
      const top = -h / 2;
      ctx.fillStyle = INK;
      roundRectPath(left + SHADOW_X, top + SHADOW_Y, w, h, 14);
      ctx.fill();
      ctx.fillStyle = color.fill;
      roundRectPath(left, top, w, h, 14);
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // One big line; a long definition that would get small splits into two.
      const fit = (lines, max) => {
        let size = max;
        ctx.font = `900 ${size}px ${FONT}`;
        while (size > 12 && lines.some((l) => ctx.measureText(l).width > w - 28)) {
          size -= 1;
          ctx.font = `900 ${size}px ${FONT}`;
        }
        return size;
      };
      let lines = [text];
      let fontSize = fit(lines, Math.round(h * 0.46));
      const words = text.split(" ");
      if (fontSize < 22 && words.length > 1) {
        let best = 1;
        for (let i = 1; i < words.length; i++) {
          const diff = Math.abs(words.slice(0, i).join(" ").length - words.slice(i).join(" ").length);
          if (diff < Math.abs(words.slice(0, best).join(" ").length - words.slice(best).join(" ").length)) best = i;
        }
        const two = [words.slice(0, best).join(" "), words.slice(best).join(" ")];
        const twoSize = fit(two, Math.round(h * 0.34));
        if (twoSize > fontSize) {
          lines = two;
          fontSize = twoSize;
        }
      }
      ctx.font = `900 ${fontSize}px ${FONT}`;
      ctx.fillStyle = INK;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.direction = kind === "en" ? "ltr" : "rtl";
      const lineH = fontSize * 1.15;
      lines.forEach((l, i) => ctx.fillText(l, 0, 2 + (i - (lines.length - 1) / 2) * lineH));
      ctx.restore();
    };

    const drawPopups = (list) => {
      list.forEach((p) => {
        ctx.globalAlpha = Math.min(1, p.life);
        ctx.font = `900 30px ${FONT}`;
        ctx.textAlign = "center";
        ctx.lineJoin = "round";
        ctx.strokeStyle = INK;
        ctx.lineWidth = 6;
        ctx.strokeText(p.text, p.x, p.y);
        ctx.fillStyle = p.color;
        ctx.fillText(p.text, p.x, p.y);
      });
      ctx.globalAlpha = 1;
    };

    const updateHud = () => {
      document.getElementById("tsProLives").innerHTML = Array.from({ length: 3 }, (_, i) =>
        `<span class="ts-pro-heart${i < lives ? " is-on" : ""}">${ICONS.heart}</span>`
      ).join("");
      document.getElementById("tsProHeight").textContent = String(Math.floor(tower.length / 2));
      document.getElementById("tsProStage").textContent = String(stage);
    };

    const pickWord = () => {
      const pool = D.VOCAB.filter((v) => !usedWords.includes(v.en));
      const item = pool.length ? pool[Math.floor(Math.random() * pool.length)] : D.one();
      usedWords.push(item.en);
      if (usedWords.length >= D.VOCAB.length) usedWords = [item.en];
      return item;
    };

    const makeBlock = (kind, text, emoji, color) => ({
      kind,
      text,
      emoji: emoji || "",
      x: cw() / 2,
      y: -BLOCK_H - 40,
      targetY: nextBlockTargetY(),
      vy: 0,
      w: blockW(),
      h: BLOCK_H,
      color,
      rot: 0,
    });

    const startEnFall = () => {
      currentWord = pickWord();
      stage = (stage % D.VOCAB.length) + 1;
      updateHud();
      phase = "en-fall";
      document.getElementById("tsProControls").classList.add("hidden");
      document.getElementById("tsProTimer").classList.add("hidden");
      GE.sfxWhoosh();
      falling = makeBlock("en", currentWord.en, "", EN_COLOR);
      trails = [];
    };

    const startHeFall = () => {
      isCorrectTranslation = Math.random() < 0.52;
      const wrong = D.one([currentWord.en]);
      const displayHe = isCorrectTranslation ? currentWord.he : wrong.he;
      phase = "he-fall";
      GE.sfxWhoosh();
      falling = makeBlock("he", displayHe, "", HE_COLOR);
      falling.targetY = nextBlockTargetY();
      trails = [];
    };

    const syncTimerSetting = () => {
      timerEnabled = !window.PlaySettings?.get("tower-stack")?.disableTimer;
    };

    const beginJudge = () => {
      phase = "he-judge";
      trails = [];
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
      requestAnimationFrame(() => {
        resize();
        syncFallingPosition();
        syncCamera(true);
      });
    };

    const endGame = () => {
      running = false;
      cancelAnimationFrame(animId);
      document.getElementById("tsProControls").classList.add("hidden");
      document.getElementById("tsProTimer").classList.add("hidden");
      ui.onGameOver(score, "game over");
            document.getElementById("tsProOverMsg").textContent = `גובה: ${Math.floor(tower.length / 2)} קומות · ניקוד: ${score}`;
      document.getElementById("tsProOver").classList.remove("hidden");
    };

    const resolveAnswer = (playerSaysCorrect) => {
      if (phase !== "he-judge") return;
      syncFallingPosition();
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
        if (streak >= 3) GE.addPopup(popups, cw() / 2, ch() * 0.35, `${streak} ברצף!`, "#ff9ec7");
      } else {
        lives--;
        streak = 0;
        shake = 18;
        flash = 0.5;
        GE.sfxWrong();
        GE.addPopup(popups, cw() / 2, ch() * 0.4, "טעות!", "#ff8a80");
        GE.burst(particles, cw() / 2, falling.targetY + BLOCK_H / 2, { colors: ["#ff8a80", "#ff4f6d", "#fff"], count: 30 });
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
        GE.burst(particles, cw() / 2, falling.targetY, { colors: ["#FFE135", "#62ebe0", "#fff", "#00C9B7"], count: 36, speed: 5 });
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
        GE.burst(particles, cw() / 2, falling.targetY + BLOCK_H / 2, { colors: ["#FFE135", "#fff", "#ccc"], count: 20, speed: 3 });
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

      drawSky(w, h);
      drawClouds(cloudsFar, false);
      drawSun(w);
      drawClouds(clouds, true);

      syncCamera();
      const camEase = phase === "he-judge" ? 0.14 : 0.08;
      cameraY += (cameraTarget - cameraY) * camEase;

      ctx.save();
      ctx.translate(0, cameraY);

      const swayX = Math.sin(time * 0.003 + towerSway * 10) * towerSway * 40;
      if (towerSway > 0.001) towerSway *= 0.95;

      drawGround(w, groundY(), bw);

      tower.forEach((block, idx) => {
        const by = blockYForIndex(idx);
        drawBlock({ ...block, x: w / 2 + swayX * (idx / Math.max(tower.length, 1)), y: by, w: bw, h: BLOCK_H });
      });

      if (phase === "en-fall" || phase === "he-fall") {
        trails.forEach((t) => {
          ctx.globalAlpha = t.alpha;
          drawBlock({ ...t, scale: 0.95 });
        });
        ctx.globalAlpha = 1;
      }

      if (falling) {
        const baseY = phase === "he-judge" ? nextBlockTargetY() : falling.y;
        const hover = phase === "he-judge" ? Math.sin(time * 0.006) * 4 : 0;
        drawBlock({ ...falling, y: baseY + hover, w: bw, h: BLOCK_H });
      }

      if (resolveAnim) {
        const a = resolveAnim;
        const b = a.block;
        if (a.type === "stack") {
          const ease = GE.easeOutBounce(Math.min(a.t, 1));
          drawBlock({ ...b, y: b.targetY - 30 * (1 - ease), w: bw, h: BLOCK_H });
        } else {
          const t = Math.min(a.t, 1);
          a.rot += a.rotV;
          a.vy += 0.6;
          const ty = b.y + a.vy * t * 60 + t * t * 80;
          const tx = b.x + a.dir * t * t * 160;
          drawBlock({ ...b, x: tx, y: ty, w: bw, h: BLOCK_H, rot: a.rot, scale: 1 - t * 0.2 });
        }
      }

      GE.drawParticles(ctx, particles);
      ctx.restore();

      drawPopups(popups);

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
        falling.targetY = nextBlockTargetY();
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
            GE.burst(particles, cw() / 2, falling.targetY, { count: 20, colors: ["#62ebe0", "#fff"] });
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
      stage = 0;
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
