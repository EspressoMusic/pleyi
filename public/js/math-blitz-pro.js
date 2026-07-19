/* Math Blitz Pro — canvas arcade quiz */

window.MathBlitzPro = {
  mount(root, ui, D) {
    const GE = window.GameEngine;
    root.innerHTML = `
      <div class="solo-game-wrap mb-pro-wrap">
        <canvas class="mb-pro-canvas" id="mbProCanvas"></canvas>
        <div class="mb-pro-overlay" id="mbProStart">
          <div class="ts-pro-overlay-card">
            <h2>⚡ ברק מתמטי</h2>
            <p>פתרו תרגילים בזמן — 3 טעויות וזה Game Over!<br>כל תשובה נכונה = נקודות + בונוס מהירות.</p>
            <button type="button" class="ts-pro-start-btn" id="mbProStartBtn">▶ התחל</button>
          </div>
        </div>
        <div class="mb-pro-overlay hidden" id="mbProOver">
          <div class="ts-pro-overlay-card ts-pro-overlay-card--over">
            <h2>Game Over</h2>
            <p id="mbProOverMsg"></p>
            <button type="button" class="ts-pro-start-btn" id="mbProRetry">↻ שחק שוב</button>
          </div>
        </div>
      </div>`;

    const canvas = document.getElementById("mbProCanvas");
    const ctx = canvas.getContext("2d");
    let animId = 0;
    let running = false;
    let score = 0;
    let lives = 3;
    let streak = 0;
    let qIndex = 0;
    let question = null;
    let timeLeft = 10;
    let maxTime = 10;
    let particles = GE.createParticles();
    let popups = GE.createPopups();
    let flash = 0;
    let shake = 0;
    let lastTs = 0;
    let time = 0;
    let buttons = [];
    let phase = "play";
    let feedback = null;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.round(rect.width * devicePixelRatio);
      canvas.height = Math.round(rect.height * devicePixelRatio);
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };

    const cw = () => canvas.getBoundingClientRect().width;
    const ch = () => canvas.getBoundingClientRect().height;

    const newQuestion = () => {
      question = D.quizQuestion();
      timeLeft = maxTime;
      phase = "play";
      feedback = null;
      const opts = question.options;
      const bw = Math.min(140, (cw() - 48) / 2);
      const bh = 64;
      const gap = 16;
      const totalW = bw * 2 + gap;
      const startX = (cw() - totalW) / 2;
      const y = ch() - bh - 24;
      buttons = [
        { x: startX + bw / 2, y: y, w: bw, h: bh, text: opts[0], answer: opts[0], scale: 1 },
        { x: startX + bw + gap + bw / 2, y: y, w: bw, h: bh, text: opts[1], answer: opts[1], scale: 1 },
        { x: startX + bw / 2, y: y - bh - gap, w: bw, h: bh, text: opts[2], answer: opts[2], scale: 1 },
        { x: startX + bw + gap + bw / 2, y: y - bh - gap, w: bw, h: bh, text: opts[3], answer: opts[3], scale: 1 },
      ];
    };

    const endGame = () => {
      running = false;
      cancelAnimationFrame(animId);
      ui.onGameOver(score, "game over");
      document.getElementById("mbProOverMsg").textContent = `ניקוד: ${score} · ${qIndex} תרגילים`;
      document.getElementById("mbProOver").classList.remove("hidden");
    };

    const pickAnswer = (ans) => {
      if (phase !== "play" || !question) return;
      phase = "feedback";
      const ok = ans === question.correct;
      qIndex++;

      buttons.forEach((b) => {
        if (b.answer === question.correct) b.highlight = "ok";
        else if (b.answer === ans && !ok) b.highlight = "bad";
      });

      if (ok) {
        const pts = 12 + Math.floor(timeLeft * 2) + streak * 4;
        score += pts;
        streak++;
        ui.setScore(score);
        flash = 0.3;
        GE.sfxCorrect();
        GE.burst(particles, cw() / 2, ch() * 0.45, { count: 28, colors: ["#FFE135", "#4ADE80", "#fff"] });
        GE.addPopup(popups, cw() / 2, ch() * 0.35, `+${pts}`, "#FFE135");
        feedback = { ok: true, t: 0 };
      } else {
        lives--;
        streak = 0;
        shake = 14;
        flash = 0.45;
        GE.sfxWrong();
        GE.burst(particles, cw() / 2, ch() * 0.45, { count: 22, colors: ["#e07070", "#ff4444"] });
        feedback = { ok: false, t: 0 };
        if (lives <= 0) {
          setTimeout(endGame, 900);
          return;
        }
      }
      setTimeout(() => {
        if (running) newQuestion();
      }, 750);
    };

    const draw = () => {
      const w = cw();
      const h = ch();

      ctx.save();
      if (shake > 0.5) {
        ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
        shake *= 0.88;
      }

      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "#1a0a2e");
      bg.addColorStop(0.5, "#2d1b69");
      bg.addColorStop(1, "#0066FF");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < 40; i++) {
        const sx = (i * 137.5 + time * 0.02) % w;
        const sy = (i * 97.3 + time * 0.015) % h;
        ctx.fillStyle = `rgba(255,255,255,${0.15 + (i % 5) * 0.05})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 1 + (i % 3), 0, Math.PI * 2);
        ctx.fill();
      }

      if (flash > 0) {
        ctx.fillStyle = `rgba(255,255,255,${flash * 0.35})`;
        ctx.fillRect(0, 0, w, h);
        flash *= 0.9;
      }

      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.font = "800 16px Google Sans,sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`❤️`.repeat(lives) + `🖤`.repeat(3 - lives), 20, 36);
      ctx.textAlign = "right";
      ctx.fillText(`🔥 ${streak}   ניקוד ${score}`, w - 20, 36);

      if (question) {
        const pulse = 1 + Math.sin(time * 0.005) * 0.02;
        ctx.save();
        ctx.translate(w / 2, h * 0.32);
        ctx.scale(pulse, pulse);
        ctx.fillStyle = "#FFE135";
        ctx.strokeStyle = "#1a0a2e";
        ctx.lineWidth = 6;
        ctx.font = `900 ${Math.min(56, w / (question.word.length * 0.45))}px Google Sans,sans-serif`;
        ctx.textAlign = "center";
        ctx.strokeText(question.word, 0, 0);
        ctx.fillText(question.word, 0, 0);
        ctx.restore();

        const ringR = 44;
        const cx = w - 56;
        const cy = 56;
        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = timeLeft < 4 ? "#e07070" : "#FFE135";
        ctx.beginPath();
        ctx.arc(cx, cy, ringR, -Math.PI / 2, -Math.PI / 2 + (timeLeft / maxTime) * Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "#fff";
        ctx.font = "900 22px Google Sans,sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(String(Math.ceil(timeLeft)), cx, cy + 8);
      }

      buttons.forEach((b) => {
        const sc = b.scale || 1;
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.scale(sc, sc);
        let fill = "#fff";
        if (b.highlight === "ok") fill = "#6bbf8a";
        if (b.highlight === "bad") fill = "#e07070";
        ctx.fillStyle = fill;
        ctx.strokeStyle = "#1a0a2e";
        ctx.lineWidth = 4;
        const rx = -b.w / 2;
        const ry = -b.h / 2;
        ctx.beginPath();
        ctx.roundRect(rx, ry, b.w, b.h, 16);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#1a0a2e";
        ctx.font = "900 26px Google Sans,sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(b.text, 0, 0);
        ctx.restore();
      });

      GE.drawParticles(ctx, particles);
      GE.drawPopups(ctx, popups);
      ctx.restore();
    };

    const update = (dt) => {
      time += dt;
      GE.updateParticles(particles, dt);
      GE.updatePopups(popups, dt);

      if (phase === "play" && question) {
        timeLeft -= dt / 1000;
        if (timeLeft <= 0) pickAnswer("");
      }

      buttons.forEach((b) => {
        b.scale += ((b.hover ? 1.06 : 1) - b.scale) * 0.2;
      });
    };

    const loop = (ts) => {
      if (!running) return;
      const dt = Math.min(ts - lastTs, 50);
      lastTs = ts;
      update(dt);
      draw();
      animId = requestAnimationFrame(loop);
    };

    const getBtn = (mx, my) =>
      buttons.find((b) => mx >= b.x - b.w / 2 && mx <= b.x + b.w / 2 && my >= b.y - b.h / 2 && my <= b.y + b.h / 2);

    const onPointer = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left;
      const my = (e.clientY ?? e.touches?.[0]?.clientY) - rect.top;
      const btn = getBtn(mx, my);
      if (btn && phase === "play") pickAnswer(btn.answer);
    };

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      buttons.forEach((b) => {
        b.hover = mx >= b.x - b.w / 2 && mx <= b.x + b.w / 2 && my >= b.y - b.h / 2 && my <= b.y + b.h / 2;
      });
    };

    const startGame = () => {
      running = true;
      score = 0;
      lives = 3;
      streak = 0;
      qIndex = 0;
      particles = GE.createParticles();
      popups = GE.createPopups();
      document.getElementById("mbProStart").classList.add("hidden");
      document.getElementById("mbProOver").classList.add("hidden");
      ui.setScore(0);
      resize();
      newQuestion();
      lastTs = performance.now();
      animId = requestAnimationFrame(loop);
    };

    window.addEventListener("resize", resize);
    canvas.addEventListener("click", onPointer);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("touchstart", onPointer, { passive: true });
    document.getElementById("mbProStartBtn").addEventListener("click", startGame);
    document.getElementById("mbProRetry").addEventListener("click", startGame);

    return () => {
      running = false;
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  },
};
