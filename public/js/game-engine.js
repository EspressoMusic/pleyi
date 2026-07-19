/* Pleyi — shared premium game engine (canvas, particles, sfx) */

window.GameEngine = {
  easeOutBack(t) {
    const c = 1.70158;
    return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
  },

  easeOutBounce(t) {
    if (t < 1 / 2.75) return 7.5625 * t * t;
    if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
  },

  lerp(a, b, t) {
    return a + (b - a) * t;
  },

  clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  },

  /* ── Web Audio SFX (no external files) ── */
  _audio: null,
  _soundEnabled: true,

  setSoundEnabled(on) {
    this._soundEnabled = on !== false;
  },

  isSoundEnabled() {
    return this._soundEnabled !== false;
  },

  applyRoomSound(room) {
    this.setSoundEnabled(room?.enableGameSound !== false);
  },

  sfx() {
    if (!this._audio) {
      try {
        this._audio = new (window.AudioContext || window.webkitAudioContext)();
      } catch {
        return null;
      }
    }
    if (this._audio.state === "suspended") this._audio.resume();
    return this._audio;
  },

  playTone(freq, dur = 0.12, type = "sine", vol = 0.08) {
    if (!this.isSoundEnabled()) return;
    const ctx = this.sfx();
    if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + dur);
  },

  sfxStack() {
    this.playTone(520, 0.1, "sine", 0.1);
    setTimeout(() => this.playTone(780, 0.08, "sine", 0.07), 40);
  },

  sfxWrong() {
    this.playTone(180, 0.25, "sawtooth", 0.06);
    setTimeout(() => this.playTone(120, 0.3, "sawtooth", 0.05), 80);
  },

  sfxCorrect() {
    this.playTone(440, 0.08, "triangle", 0.09);
    setTimeout(() => this.playTone(660, 0.1, "triangle", 0.08), 60);
    setTimeout(() => this.playTone(880, 0.12, "triangle", 0.06), 120);
  },

  sfxWhoosh() {
    this.playTone(300, 0.15, "sine", 0.03);
  },

  /* ── Particle system ── */
  createParticles() {
    return [];
  },

  burst(particles, x, y, opts = {}) {
    const {
      count = 24,
      colors = ["#FFE135", "#FF9ECF", "#fff", "#4A90FF"],
      speed = 4,
      life = 1,
      gravity = 0.15,
      size = 5,
    } = opts;
    for (let i = 0; i < count; i++) {
      const ang = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const sp = speed * (0.5 + Math.random());
      particles.push({
        x,
        y,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp - 2,
        life: life * (0.6 + Math.random() * 0.4),
        maxLife: life,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: size * (0.5 + Math.random()),
        gravity,
      });
    }
  },

  updateParticles(particles, dt) {
    const s = dt / 16;
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * s;
      p.y += p.vy * s;
      p.vy += p.gravity * s;
      p.life -= (dt / 1000) * 1.2;
      if (p.life <= 0) particles.splice(i, 1);
    }
  },

  drawParticles(ctx, particles) {
    particles.forEach((p) => {
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  },

  /* ── Premium sky ── */
  drawSky(ctx, w, h, time = 0) {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#5ec6ff");
    g.addColorStop(0.45, "#3a9ee8");
    g.addColorStop(1, "#1a6fbf");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    const sunX = w * 0.82;
    const sunY = h * 0.14 + Math.sin(time * 0.001) * 4;
    const sunG = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 70);
    sunG.addColorStop(0, "rgba(255,240,120,0.95)");
    sunG.addColorStop(0.4, "rgba(255,220,80,0.4)");
    sunG.addColorStop(1, "rgba(255,200,0,0)");
    ctx.fillStyle = sunG;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 70, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FFE566";
    ctx.beginPath();
    ctx.arc(sunX, sunY, 28, 0, Math.PI * 2);
    ctx.fill();
  },

  drawCloudLayer(ctx, clouds, parallax = 1) {
    clouds.forEach((c) => {
      ctx.fillStyle = `rgba(255,255,255,${c.opacity || 0.88})`;
      const x = c.x;
      const y = c.y;
      const w = c.w;
      ctx.beginPath();
      ctx.arc(x, y, w * 0.28, 0, Math.PI * 2);
      ctx.arc(x + w * 0.28, y - w * 0.06, w * 0.22, 0, Math.PI * 2);
      ctx.arc(x + w * 0.52, y, w * 0.26, 0, Math.PI * 2);
      ctx.arc(x + w * 0.72, y + w * 0.04, w * 0.18, 0, Math.PI * 2);
      ctx.fill();
    });
  },

  /* ── Premium 3D cube ── */
  drawCube(ctx, block, opts = {}) {
    const { x, y, w, h, text, emoji, color, kind, rot = 0, scale = 1, glow = false } = block;
    const d = (opts.depth || 16) * scale;
    ctx.save();
    ctx.translate(x, y + h / 2);
    ctx.rotate(rot);
    ctx.scale(scale, scale);
    ctx.translate(-x, -(y + h / 2));

    const dx = x - w / 2;
    const dy = y;

    if (glow) {
      ctx.shadowColor = color.glow || "#FFE135";
      ctx.shadowBlur = 24;
    }

    const sideG = ctx.createLinearGradient(dx + w, dy, dx + w + d, dy);
    sideG.addColorStop(0, color.side);
    sideG.addColorStop(1, color.sideDark || color.side);
    ctx.fillStyle = sideG;
    ctx.beginPath();
    ctx.moveTo(dx + w, dy);
    ctx.lineTo(dx + w + d, dy - d);
    ctx.lineTo(dx + w + d, dy + h - d);
    ctx.lineTo(dx + w, dy + h);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(26,10,46,0.6)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = color.top;
    ctx.beginPath();
    ctx.moveTo(dx, dy);
    ctx.lineTo(dx + d, dy - d);
    ctx.lineTo(dx + w + d, dy - d);
    ctx.lineTo(dx + w, dy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    const frontG = ctx.createLinearGradient(dx, dy, dx, dy + h);
    frontG.addColorStop(0, color.frontLight || color.front);
    frontG.addColorStop(0.5, color.front);
    frontG.addColorStop(1, color.frontDark || color.front);
    ctx.fillStyle = frontG;
    ctx.fillRect(dx, dy, w, h);
    ctx.strokeStyle = "#1a0a2e";
    ctx.lineWidth = 3;
    ctx.strokeRect(dx, dy, w, h);

    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fillRect(dx + 6, dy + 6, w * 0.35, h * 0.12);

    ctx.fillStyle = "#1a0a2e";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (emoji) {
      ctx.font = `${Math.round(h * 0.38)}px serif`;
      ctx.fillText(emoji, x, dy + h * 0.32);
    }
    const fontSize = Math.min(h * 0.38, Math.max(14, w / (text.length * 0.52)));
    ctx.font = `900 ${fontSize}px Google Sans, sans-serif`;
    ctx.direction = kind === "en" ? "ltr" : "rtl";
    ctx.fillText(text, x, dy + h * (emoji ? 0.64 : 0.52));
    ctx.direction = "inherit";
    ctx.restore();
  },

  drawGround(ctx, w, gy, bw) {
    ctx.fillStyle = "#2d9a55";
    ctx.fillRect(0, gy, w, 200);
    const gg = ctx.createLinearGradient(0, gy, 0, gy + 20);
    gg.addColorStop(0, "#5ecf7a");
    gg.addColorStop(1, "#2d9a55");
    ctx.fillStyle = gg;
    ctx.fillRect(0, gy, w, 12);
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.beginPath();
    ctx.ellipse(w / 2, gy + 6, bw / 2 + 20, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  },

  /* ── Floating score popup ── */
  createPopups() {
    return [];
  },

  addPopup(popups, x, y, text, color = "#FFE135") {
    popups.push({ x, y, text, color, life: 1.2, vy: -2 });
  },

  updatePopups(popups, dt) {
    const s = dt / 16;
    for (let i = popups.length - 1; i >= 0; i--) {
      popups[i].y += popups[i].vy * s;
      popups[i].life -= dt / 1000;
      if (popups[i].life <= 0) popups.splice(i, 1);
    }
  },

  drawPopups(ctx, popups) {
    popups.forEach((p) => {
      ctx.globalAlpha = Math.min(1, p.life);
      ctx.font = "900 28px Google Sans, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = p.color;
      ctx.strokeStyle = "#1a0a2e";
      ctx.lineWidth = 4;
      ctx.strokeText(p.text, p.x, p.y);
      ctx.fillText(p.text, p.x, p.y);
    });
    ctx.globalAlpha = 1;
  },

  _lastWinFxKey: null,

  getRoundWinMeta(gameState) {
    if (!gameState) return null;
    const winner = gameState.roundWinner ?? gameState.winner ?? null;
    if (!winner || winner === "tie" || winner === "none") return null;
    if (gameState.phase !== "round-end" && gameState.phase !== "finished") return null;
    return {
      winner,
      winnerId: gameState.roundWinnerId || null,
      key: `${gameState.round ?? 0}-${winner}-${gameState.roundWinnerId || ""}`,
    };
  },

  resetWinCelebration() {
    this._lastWinFxKey = null;
  },

  celebrateRoundWin(gameState, room) {
    const meta = this.getRoundWinMeta(gameState);
    if (!meta) return null;
    if (meta.key !== this._lastWinFxKey) {
      this._lastWinFxKey = meta.key;
      if (room?.studentsCanPlay !== true) {
        this.launchConfetti();
      }
      this.sfxCorrect();
    }
    return meta;
  },

  participantWinConfettiHtml() {
    return `<span class="participant-win-confetti" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>`;
  },

  launchConfetti(opts = {}) {
    const layer = document.createElement("div");
    layer.className = "win-confetti-layer";
    layer.setAttribute("aria-hidden", "true");
    const colors = ["#FFE135", "#FF9ECF", "#B967FF", "#00E5CC", "#FFD700", "#FF6B35", "#fff"];
    const count = opts.count || 60;
    for (let i = 0; i < count; i++) {
      const piece = document.createElement("i");
      piece.className = "win-confetti-piece";
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.background = colors[i % colors.length];
      piece.style.animationDelay = `${Math.random() * 0.4}s`;
      piece.style.animationDuration = `${2.4 + Math.random() * 1.6}s`;
      piece.style.transform = `rotate(${Math.random() * 360}deg)`;
      if (Math.random() > 0.5) piece.style.borderRadius = "50%";
      layer.appendChild(piece);
    }
    document.body.appendChild(layer);
    setTimeout(() => layer.remove(), 4200);
  },
};
