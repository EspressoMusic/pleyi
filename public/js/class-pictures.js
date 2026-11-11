/* The pictures of "בלשי תמונה" (class-games.js), hand-painted on a canvas in
   the look of the dinosaur jungle in the PAT game: soft muted shapes, a pencil
   line that goes over itself twice, hatching in the shade, haze far away,
   light through the trees and a grain over everything.

   Every scene paints itself on W x H. Each question: [question, answer, clue
   lines, marks]; with no answer the clue lines are the answer. A mark is
   [x, y, rx, ry] on the same W x H: where the answer is in the picture,
   ringed once the answer is shown. No pictures of girls or women here. */

(function () {
  const W = 1600;
  const H = 1000;
  const INK = "#1f2a17";

  // --- The paint box ---

  /** Stable pseudo-random 0..1, so a picture is the same every time. */
  function hash(x, y, salt = 0) {
    const s = Math.sin(x * 127.1 + y * 311.7 + salt * 74.7) * 43758.5453;
    return s - Math.floor(s);
  }

  const rgba = ([r, g, b], a = 1) => `rgba(${r},${g},${b},${a})`;

  /** A color made lighter (f > 0) or darker (f < 0). */
  function tint(hex, f) {
    const n = parseInt(hex.slice(1), 16);
    const ch = (v) => Math.round(f >= 0 ? v + (255 - v) * f : v * (1 + f));
    return `rgb(${ch((n >> 16) & 255)},${ch((n >> 8) & 255)},${ch(n & 255)})`;
  }

  function trace(ctx, pts, closed = true) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    if (closed) ctx.closePath();
  }

  function oval(ctx, cx, cy, rx, ry, rot = 0) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, Math.max(0.01, rx), Math.max(0.01, ry), rot, 0, Math.PI * 2);
  }

  /** A soft outline through a few corners (Catmull-Rom). */
  function smooth(pts, closed = true, steps = 8) {
    const n = pts.length;
    const get = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
    const out = [];
    const segs = closed ? n : n - 1;
    for (let i = 0; i < segs; i++) {
      const p0 = get(i - 1);
      const p1 = get(i);
      const p2 = get(i + 1);
      const p3 = get(i + 2);
      for (let s = 0; s < steps; s++) {
        const t = s / steps;
        const t2 = t * t;
        const t3 = t2 * t;
        out.push([0, 1].map((k) => 0.5 * (2 * p1[k] + (p2[k] - p0[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (3 * p1[k] - p0[k] - 3 * p2[k] + p3[k]) * t3)));
      }
    }
    if (!closed) out.push(pts[n - 1]);
    return out;
  }

  /** Points round an ellipse. */
  function ring(cx, cy, rx, ry, n = 28) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
    }
    return pts;
  }

  /** The pencil: two passes over an outline, each a hair off and uneven. */
  function sketch(ctx, pts, lw = 2.4, closed = true, seed = 0, ink = INK) {
    ctx.save();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = ink;
    for (let pass = 0; pass < 2; pass++) {
      const j = (pass ? 1.7 : 0.8) * (lw / 2.4);
      ctx.beginPath();
      pts.forEach(([x, y], i) => {
        const dx = (hash(i, seed, pass * 7 + 1) - 0.5) * j;
        const dy = (hash(i, seed, pass * 7 + 2) - 0.5) * j;
        if (i) ctx.lineTo(x + dx, y + dy);
        else ctx.moveTo(x + dx, y + dy);
      });
      if (closed) ctx.closePath();
      ctx.globalAlpha = pass ? 0.35 : 0.85;
      ctx.lineWidth = pass ? lw * 0.6 : lw;
      ctx.stroke();
    }
    ctx.restore();
  }

  /** A filled shape, outlined in pencil. */
  function shape(ctx, pts, fill, lw = 2.4, seed = 0) {
    trace(ctx, pts);
    ctx.fillStyle = fill;
    ctx.fill();
    if (lw) sketch(ctx, pts, lw, true, seed);
  }

  /** Paints inside a shape only. */
  function inside(ctx, pts, paint) {
    ctx.save();
    trace(ctx, pts);
    ctx.clip();
    paint();
    ctx.restore();
  }

  /** A limb or a stick: an inked line with the color inside it. */
  function tube(ctx, pts, w, color, lw = 2.4) {
    const line = pts.length > 2 ? smooth(pts, false, 6) : pts;
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    trace(ctx, line, false);
    ctx.strokeStyle = INK;
    ctx.globalAlpha = 0.85;
    ctx.lineWidth = w + lw * 2;
    ctx.stroke();
    ctx.globalAlpha = 1;
    trace(ctx, line, false);
    ctx.strokeStyle = color;
    ctx.lineWidth = w;
    ctx.stroke();
    ctx.restore();
  }

  function lin(ctx, x0, y0, x1, y1, stops) {
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    for (const [k, c] of stops) g.addColorStop(k, c);
    return g;
  }

  /** Soft blotches of a color: the painted unevenness of a wall or the ground. */
  function blotches(ctx, x, y, w, h, seed, rgb, count, size, alpha = 0.18) {
    for (let i = 0; i < count; i++) {
      const px = x + hash(i, seed, 21) * w;
      const py = y + hash(i, seed, 22) * h;
      const r = size * (0.5 + hash(i, seed, 23));
      const g = ctx.createRadialGradient(px, py, 0, px, py, r);
      g.addColorStop(0, rgba(rgb, alpha * (0.5 + hash(i, seed, 24) * 0.5)));
      g.addColorStop(1, rgba(rgb, 0));
      ctx.fillStyle = g;
      ctx.fillRect(px - r, py - r, r * 2, r * 2);
    }
  }

  /** Specks scattered over a box. */
  function specks(ctx, x, y, w, h, seed, color, count, size = 1.6) {
    ctx.fillStyle = color;
    for (let i = 0; i < count; i++) {
      const r = size * (0.3 + hash(i, seed, 13) * 0.9);
      ctx.globalAlpha = 0.25 + hash(i, seed, 14) * 0.45;
      oval(ctx, x + hash(i, seed, 11) * w, y + hash(i, seed, 12) * h, r, r * 0.8);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /** Pencil hatching across a box at an angle (clip first): the shade. */
  function hatch(ctx, x, y, w, h, angle, gap, color, lw = 1.1, seed = 0) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.lineCap = "round";
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    const span = w + h;
    for (let d = -span, i = 0; d < span; d += gap, i++) {
      const cx = x + w / 2 - dy * d;
      const cy = y + h / 2 + dx * d;
      const len = span * (0.7 + hash(i, seed, 31) * 0.3);
      ctx.globalAlpha = 0.3 + hash(i, seed, 32) * 0.4;
      ctx.beginPath();
      ctx.moveTo(cx - dx * len, cy - dy * len);
      ctx.lineTo(cx + dx * len, cy + dy * len);
      ctx.stroke();
    }
    ctx.restore();
  }

  function softShadow(ctx, cx, cy, rx, ry, alpha = 0.3, rgb = [30, 24, 10]) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, ry / rx);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    g.addColorStop(0, rgba(rgb, alpha));
    g.addColorStop(0.6, rgba(rgb, alpha * 0.55));
    g.addColorStop(1, rgba(rgb, 0));
    ctx.fillStyle = g;
    ctx.fillRect(-rx, -rx, rx * 2, rx * 2);
    ctx.restore();
  }

  /** A long shadow cast along the ground, away from a low sun (dir -1 = to the left). */
  function castShadow(ctx, x, y, len, width, dir, alpha = 0.38) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(dir, 1);
    const g = ctx.createLinearGradient(0, 0, len, 0);
    g.addColorStop(0, `rgba(40,26,20,${alpha})`);
    g.addColorStop(1, "rgba(40,26,20,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-width * 0.2, -width * 0.18);
    ctx.quadraticCurveTo(len * 0.5, -width * 0.5, len, -width * 0.12);
    ctx.lineTo(len, width * 0.12);
    ctx.quadraticCurveTo(len * 0.5, width * 0.5, -width * 0.2, width * 0.18);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /** A warm glow round a light (it brightens what's under it). */
  function glow(ctx, x, y, r, rgb, alpha = 0.5) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgba(rgb, alpha));
    g.addColorStop(0.35, rgba(rgb, alpha * 0.45));
    g.addColorStop(1, rgba(rgb, 0));
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.restore();
  }

  function wash(ctx, color, op, alpha) {
    ctx.save();
    ctx.globalCompositeOperation = op;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  let grainCanvas = null;
  function grain() {
    if (grainCanvas) return grainCanvas;
    grainCanvas = document.createElement("canvas");
    grainCanvas.width = 200;
    grainCanvas.height = 200;
    const g = grainCanvas.getContext("2d");
    const img = g.createImageData(200, 200);
    for (let i = 0; i < 200 * 200; i++) {
      const v = 128 + (hash(i % 200, Math.floor(i / 200), 3) - 0.5) * 120;
      img.data[i * 4] = v;
      img.data[i * 4 + 1] = v;
      img.data[i * 4 + 2] = v;
      img.data[i * 4 + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    return grainCanvas;
  }

  /** The last touch on every picture: paper grain and a soft dark edge. */
  function paperAndVignette(ctx, rgb, strength = 0.5) {
    ctx.save();
    ctx.globalCompositeOperation = "overlay";
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = ctx.createPattern(grain(), "repeat");
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
    const r = Math.hypot(W, H) / 2;
    const g = ctx.createRadialGradient(W / 2, H * 0.48, r * 0.45, W / 2, H / 2, r * 1.02);
    g.addColorStop(0, rgba(rgb, 0));
    g.addColorStop(1, rgba(rgb, strength));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  /** Shafts of light slanting down (from the left, or from the right with dir -1). */
  function rays(ctx, rgb, alpha, dir = 1) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (let i = 0; i < 4; i++) {
      const x = dir > 0 ? W * (0.04 + i * 0.25) : W * (0.96 - i * 0.25);
      const a = alpha * (0.7 + hash(i, 5, 1) * 0.6);
      const g = ctx.createLinearGradient(x, 0, x + dir * H * 0.45, H);
      g.addColorStop(0, rgba(rgb, a));
      g.addColorStop(1, rgba(rgb, 0));
      ctx.fillStyle = g;
      const wd = 70 + i * 16;
      trace(ctx, [[x, 0], [x + dir * wd, 0], [x + dir * (wd + H * 0.45), H], [x + dir * (H * 0.45 - 30), H]]);
      ctx.fill();
    }
    ctx.restore();
  }

  // --- Far away ---

  function sky(ctx, horizon, [top, mid, low]) {
    const fill = lin(ctx, 0, 0, 0, horizon + 40, [[0, top], [0.55, mid], [1, low]]);
    ctx.fillStyle = fill;
    ctx.fillRect(0, 0, W, H);
    return fill;
  }

  function halo(ctx, x, y, r, rgb, alpha) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgba(rgb, alpha));
    g.addColorStop(0.25, rgba(rgb, alpha * 0.45));
    g.addColorStop(1, rgba(rgb, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  /** Layers of hills and treetops, misty far away and darker nearer. */
  function hills(ctx, horizon, layers, mist, onLayer) {
    layers.forEach(([drop, color, bump, crown], li) => {
      const base = horizon + drop;
      ctx.beginPath();
      ctx.moveTo(-20, H + 20);
      for (let x = -20; x <= W + 20; x += 8) {
        const u = x / bump;
        const hill = Math.sin(u * 0.35 + li * 1.3) * 22 + Math.sin(u * 0.9 + li * 2) * 10;
        const crowns = Math.abs(Math.sin(u * 2.6 + li)) * crown;
        ctx.lineTo(x, base - hill - crowns);
      }
      ctx.lineTo(W + 20, H + 20);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      onLayer?.(li, base);
      ctx.fillStyle = lin(ctx, 0, base - 70, 0, base + 110, [[0, rgba(mist, 0)], [0.55, rgba(mist, 0.32)], [1, rgba(mist, 0)]]);
      ctx.fillRect(0, base - 70, W, 180);
    });
  }

  /** A long-neck far off in the mist, a flat silhouette. */
  function farLongNeck(ctx, x, y, s, color, flip = false) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(flip ? -s : s, s);
    ctx.fillStyle = color;
    oval(ctx, 0, -14, 26, 13);
    ctx.fill();
    for (const dx of [-16, -8, 10, 18]) ctx.fillRect(dx - 3, -8, 6, 16);
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(-22, -14);
    ctx.quadraticCurveTo(-50, -10, -66, 2);
    ctx.stroke();
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(18, -20);
    ctx.quadraticCurveTo(34, -60, 32, -84);
    ctx.stroke();
    oval(ctx, 36, -86, 7, 4);
    ctx.fill();
    ctx.restore();
  }

  /** A volcano; its smoke drifts with the wind (lean < 0 = to the left). */
  function volcano(ctx, vx, vy, half, height, o = {}) {
    const top = vy - height;
    const mouth = half * 0.16;
    const body = [[vx - half, vy], [vx - mouth * 1.2, top + 4], [vx + mouth, top], [vx + half, vy]];
    trace(ctx, body);
    ctx.fillStyle = o.color || "#8d9a8a";
    ctx.fill();
    ctx.fillStyle = "rgba(60,66,60,0.32)";
    trace(ctx, [[vx + mouth, top], [vx + half, vy], [vx + mouth * 1.6, vy]]);
    ctx.fill();
    if (o.pen) {
      inside(ctx, body, () => hatch(ctx, vx, top, half, height, 1.1, 9, "rgba(40,40,36,0.5)", 1.2, 3));
      sketch(ctx, body, 2.4, false, 4);
    }
    if (o.lava) {
      for (const [dx, len] of [[-0.3, 0.55], [0.15, 0.4], [-0.05, 0.75]]) {
        const pts = [[vx + dx * mouth * 2, top + 2], [vx + dx * half * 0.6, top + height * len * 0.5], [vx + dx * half * 0.9 - 10, top + height * len]];
        tube(ctx, pts, 9, "#e8742c", 1.2);
        glow(ctx, pts[1][0], pts[1][1], 60, [255, 120, 40], 0.35);
      }
    }
    glow(ctx, vx, top, o.glowR || 50, [255, 120, 60], o.glowA || 0.45);
    const n = o.puffs || 10;
    for (let i = 0; i < n; i++) {
      const k = i / n;
      const r = (o.puffR || 22) + k * (o.puffGrow || 80);
      ctx.fillStyle = rgba(o.smoke || [150, 150, 140], (o.smokeA || 0.42) * (1 - k * 0.6));
      oval(ctx, vx + k * (o.lean ?? 120) + Math.sin(i * 1.7) * 12, top - 10 - k * (o.rise || 220), r, r * 0.72);
      ctx.fill();
    }
  }

  // --- The ground and the plants ---

  /** The ground from a soft wavy line down to the bottom edge. */
  function ground(ctx, y0, top, bottom, seed) {
    const pts = [[-20, H + 20]];
    for (let x = -20; x <= W + 20; x += 20) pts.push([x, y0 + Math.sin(x / 210 + seed) * 12 + Math.sin(x / 70 + seed * 2) * 4]);
    pts.push([W + 20, H + 20]);
    trace(ctx, pts);
    ctx.fillStyle = lin(ctx, 0, y0 - 20, 0, H, [[0, top], [1, bottom]]);
    ctx.fill();
    inside(ctx, pts, () => {
      blotches(ctx, 0, y0, W, H - y0, seed, [190, 200, 120], 26, 90, 0.22);
      blotches(ctx, 0, y0, W, H - y0, seed + 1, [30, 40, 18], 24, 80, 0.22);
    });
    // grass tufts
    ctx.save();
    ctx.lineCap = "round";
    for (let i = 0; i < 140; i++) {
      const x = hash(i, seed, 41) * W;
      const y = y0 + 20 + hash(i, seed, 42) * (H - y0 - 10);
      const s = 0.5 + ((y - y0) / (H - y0)) * 0.9;
      ctx.strokeStyle = hash(i, seed, 43) > 0.5 ? "rgba(48,66,26,0.55)" : "rgba(160,170,90,0.5)";
      ctx.lineWidth = 1.6 * s;
      for (let b = -2; b <= 2; b++) {
        ctx.beginPath();
        ctx.moveTo(x + b * 2 * s, y);
        ctx.quadraticCurveTo(x + b * 4 * s, y - 8 * s, x + b * 7 * s, y - (12 + hash(i, b, 44) * 8) * s);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  /** A patch of mud (where footprints show). */
  function mud(ctx, cx, cy, rx, ry, seed) {
    const pts = smooth(ring(cx, cy, rx, ry, 14).map(([x, y], i) => [x + (hash(i, seed, 1) - 0.5) * rx * 0.2, y + (hash(i, seed, 2) - 0.5) * ry * 0.3]));
    trace(ctx, pts);
    ctx.fillStyle = lin(ctx, 0, cy - ry, 0, cy + ry, [[0, "#9a8658"], [1, "#7a6640"]]);
    ctx.fill();
    inside(ctx, pts, () => {
      blotches(ctx, cx - rx, cy - ry, rx * 2, ry * 2, seed, [60, 44, 20], 16, ry * 0.5, 0.3);
      blotches(ctx, cx - rx, cy - ry, rx * 2, ry * 2, seed + 3, [220, 200, 150], 12, ry * 0.4, 0.2);
      specks(ctx, cx - rx, cy - ry, rx * 2, ry * 2, seed, "#4a3a20", 90, 2.2);
    });
  }

  const bez = (a, c, b, k) => [0, 1].map((i) => (1 - k) * (1 - k) * a[i] + 2 * (1 - k) * k * c[i] + k * k * b[i]);
  const bezD = (a, c, b, k) => [0, 1].map((i) => 2 * (1 - k) * (c[i] - a[i]) + 2 * k * (b[i] - c[i]));

  /** One fern frond: a curved rib with leaflets along it. */
  function frond(ctx, x, y, a0, len, color, bend = -0.3, width = 18) {
    const a = [x, y];
    const tip = [x + Math.cos(a0) * len, y + Math.sin(a0) * len];
    const mid = [x + Math.cos(a0 + bend) * len * 0.55, y + Math.sin(a0 + bend) * len * 0.55];
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    ctx.lineWidth = Math.max(2, width * 0.2);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(mid[0], mid[1], tip[0], tip[1]);
    ctx.stroke();
    const steps = Math.max(8, Math.round(len / 9));
    ctx.lineWidth = Math.max(1.6, width * 0.22);
    for (let s = 2; s < steps; s++) {
      const k = s / steps;
      const q = bez(a, mid, tip, k);
      const d = bezD(a, mid, tip, k);
      const nl = Math.hypot(d[0], d[1]) || 1;
      const ll = width * Math.sin(k * Math.PI) + 3;
      for (const sd of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(q[0], q[1]);
        ctx.lineTo(q[0] + (-d[1] / nl) * ll * sd + (d[0] / nl) * ll * 0.45, q[1] + (d[0] / nl) * ll * sd + (d[1] / nl) * ll * 0.45);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  /** A fern: fronds fanning up from one root; `lean` bends them all with the wind (< 0 = left). */
  function fern(ctx, x, y, size, lean = 0, colors = ["#2e4a24", "#3e5a2c", "#4f6b34"], n = 7) {
    for (let i = 0; i < n; i++) {
      const k = n === 1 ? 0.5 : i / (n - 1);
      const a = -Math.PI * (0.12 + 0.76 * k) + lean * 0.5;
      const bend = (Math.cos(a) > 0 ? 0.35 : -0.35) + lean * 0.4;
      frond(ctx, x, y, a, size * (0.7 + Math.sin(k * Math.PI) * 0.35), colors[i % colors.length], bend, size * 0.13);
    }
  }

  /** A leafy bush: a dome of clumps, the back ones first. */
  function bush(ctx, cx, cy, r, color = "#5f7a3a", seed = 1) {
    softShadow(ctx, cx, cy + 4, r * 1.1, r * 0.22, 0.35);
    fern(ctx, cx - r * 0.3, cy - r * 0.5, r * 0.8, -0.2, ["#3e5a2c", "#4f6b34"], 4);
    fern(ctx, cx + r * 0.35, cy - r * 0.45, r * 0.75, 0.2, ["#3e5a2c", "#4f6b34"], 4);
    const clumps = [
      [-0.55, -0.55, 0.42], [0.1, -0.85, 0.46], [0.6, -0.5, 0.4],
      [-0.85, -0.2, 0.34], [-0.25, -0.35, 0.5], [0.35, -0.3, 0.48], [0.85, -0.18, 0.32],
      [-0.5, -0.1, 0.36], [0.1, -0.12, 0.38], [0.6, -0.08, 0.3],
    ].map(([dx, dy, k], i) => [cx + dx * r + (hash(i, seed, 1) - 0.5) * r * 0.12, cy + dy * r, r * k * (0.9 + hash(i, seed, 2) * 0.2)]);
    clumps.forEach(([x, y, rr], i) => {
      const pts = smooth(ring(x, y, rr, rr * 0.86, 12).map(([px, py], j) => [px + (hash(j, i, seed) - 0.5) * rr * 0.18, py + (hash(j, i, seed + 1) - 0.5) * rr * 0.18]));
      shape(ctx, pts, lin(ctx, x, y - rr, x, y + rr, [[0, tint(color, 0.25)], [1, tint(color, -0.3)]]), 2.2, i + seed);
      inside(ctx, pts, () => {
        blotches(ctx, x - rr, y - rr, rr * 2, rr, i, [210, 220, 140], 4, rr * 0.4, 0.3);
        ctx.strokeStyle = "rgba(30,44,16,0.35)";
        ctx.lineWidth = 1.4;
        for (let l = 0; l < 7; l++) {
          const lx = x + (hash(l, i, 7) - 0.5) * rr * 1.4;
          const ly = y + (hash(l, i, 8) - 0.2) * rr;
          ctx.beginPath();
          ctx.arc(lx, ly, rr * 0.22, Math.PI * 1.1, Math.PI * 1.9);
          ctx.stroke();
        }
      });
    });
  }

  /** A big tree: a rooted trunk with bark, and a crown of leafy clumps. */
  function tree(ctx, x, base, height, crownR, o = {}) {
    const top = base - height;
    softShadow(ctx, x, base, crownR * 0.9, 26, 0.35);
    const tw = crownR * 0.17;
    const trunk = smooth([[x - tw * 2.2, base], [x - tw * 1.1, base - 40], [x - tw * 0.85, top + crownR * 0.6], [x + tw * 0.8, top + crownR * 0.6], [x + tw * 1.1, base - 40], [x + tw * 2.4, base]], true, 6);
    shape(ctx, trunk, lin(ctx, x - 40, 0, x + 40, 0, [[0, "#7a5a3a"], [1, "#4a3420"]]), 2.6, 5);
    inside(ctx, trunk, () => {
      ctx.strokeStyle = "rgba(30,20,10,0.45)";
      ctx.lineWidth = 1.6;
      for (let i = 0; i < 14; i++) {
        const bx = x - 20 + hash(i, 1, 9) * 40;
        ctx.beginPath();
        ctx.moveTo(bx, base - hash(i, 2, 9) * 60);
        ctx.quadraticCurveTo(bx + (hash(i, 3, 9) - 0.5) * 16, base - height * 0.4, bx + (hash(i, 4, 9) - 0.5) * 10, top + crownR);
        ctx.stroke();
      }
      hatch(ctx, x + 6, top, 50, height, 1.2, 7, "rgba(20,12,4,0.5)", 1.1, 2);
    });
    const clumps = o.clumps || [[-0.55, 0.15, 0.55], [0.55, 0.12, 0.55], [0, -0.25, 0.62], [-0.3, 0.35, 0.5], [0.35, 0.38, 0.5], [0, 0.18, 0.55]];
    clumps.forEach(([dx, dy, k], i) => {
      const cx = x + dx * crownR;
      const cy = top + crownR * 0.4 + dy * crownR;
      const rr = crownR * k;
      const pts = smooth(ring(cx, cy, rr, rr * 0.82, 14).map(([px, py], j) => [px + (hash(j, i, 31) - 0.5) * rr * 0.16, py + (hash(j, i, 32) - 0.5) * rr * 0.16]));
      shape(ctx, pts, lin(ctx, cx, cy - rr, cx, cy + rr, [[0, o.leafLight || "#7f9a4c"], [1, o.leafDark || "#3f5a2c"]]), 2.4, i + 40);
      inside(ctx, pts, () => {
        blotches(ctx, cx - rr, cy - rr, rr * 2, rr, i, [220, 230, 150], 4, rr * 0.35, 0.3);
        hatch(ctx, cx - rr, cy + rr * 0.2, rr * 2, rr, 0.9, 8, "rgba(20,36,12,0.5)", 1.1, i);
      });
    });
    // vines hanging from the crown
    ctx.save();
    ctx.strokeStyle = "rgba(50,70,30,0.8)";
    ctx.lineWidth = 2.4;
    for (let i = 0; i < 5; i++) {
      const vx = x + (hash(i, 7, 7) - 0.5) * crownR * 1.4;
      const vy = top + crownR * 0.8;
      ctx.beginPath();
      ctx.moveTo(vx, vy);
      ctx.quadraticCurveTo(vx + 10, vy + 50, vx - 4, vy + 60 + hash(i, 8, 7) * 90);
      ctx.stroke();
    }
    ctx.restore();
  }

  /** A rock, shaded on the side away from the light (light 1 = from the left, -1 = from the right). */
  function rock(ctx, x, y, w, h, seed, color = "#9a978a", light = 1) {
    softShadow(ctx, x, y, w * 0.62, h * 0.14, 0.35);
    const pts = smooth([[x - w / 2, y], [x - w * 0.46, y - h * 0.45], [x - w * 0.22, y - h * (0.9 + hash(1, seed) * 0.1)], [x + w * 0.12, y - h], [x + w * 0.4, y - h * 0.62], [x + w / 2, y]], true, 6);
    const lit = tint(color, 0.18);
    const dark = tint(color, -0.35);
    shape(ctx, pts, lin(ctx, x - w / 2, 0, x + w / 2, 0, light > 0 ? [[0, lit], [1, dark]] : [[0, dark], [1, lit]]), 2.6, seed);
    inside(ctx, pts, () => {
      blotches(ctx, x - w / 2, y - h, w, h, seed, [60, 60, 50], 6, h * 0.25, 0.25);
      specks(ctx, x - w / 2, y - h, w, h, seed, "#3a3a30", 40, 2);
      hatch(ctx, light > 0 ? x + w * 0.1 : x - w / 2, y - h, w * 0.4, h, 1.15, 8, "rgba(30,30,24,0.5)", 1.2, seed);
      // moss on top
      blotches(ctx, x - w / 2, y - h, w, h * 0.35, seed + 2, [110, 140, 60], 5, h * 0.25, 0.4);
    });
    const crack = [[x - w * 0.05, y - h * 0.8], [x + w * 0.02, y - h * 0.5], [x - w * 0.06, y - h * 0.3]];
    sketch(ctx, crack, 1.8, false, seed + 9);
  }

  /** A lagoon: a muddy shore, the water and the sky in it. */
  function lagoon(ctx, cx, cy, rx, ry, [top, bottom], seed) {
    const shore = smooth(ring(cx, cy, rx + 24, ry + 14, 16).map(([x, y], i) => [x + (hash(i, seed, 3) - 0.5) * 30, y + (hash(i, seed, 4) - 0.5) * 12]));
    shape(ctx, shore, "#8a7a52", 0, 0);
    const water = smooth(ring(cx, cy, rx, ry, 16).map(([x, y], i) => [x + (hash(i, seed, 5) - 0.5) * 22, y + (hash(i, seed, 6) - 0.5) * 8]));
    shape(ctx, water, lin(ctx, 0, cy - ry, 0, cy + ry, [[0, top], [1, bottom]]), 2.6, seed);
    return water;
  }

  function ripples(ctx, cx, cy, rx, ry, seed, color = "rgba(255,250,230,0.5)") {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    ctx.lineWidth = 2.2;
    for (let i = 0; i < 16; i++) {
      const x = cx + (hash(i, seed, 1) - 0.5) * rx * 1.6;
      const y = cy + (hash(i, seed, 2) - 0.5) * ry * 1.4;
      const len = 18 + hash(i, seed, 3) * 36;
      ctx.beginPath();
      ctx.moveTo(x - len / 2, y);
      ctx.quadraticCurveTo(x, y - 5, x + len / 2, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  // --- Animals ---

  /** A long-neck, facing right (flip to face left), its feet at (x, y). Cut off below `waterline` (local units). */
  function longNeck(ctx, x, y, s, o = {}) {
    const c = o.color || "#7d8f6a";
    const dark = tint(c, -0.28);
    const lw = 2.6 / s;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(o.flip ? -s : s, s);
    if (o.waterline != null) {
      ctx.beginPath();
      ctx.rect(-500, -700, 1000, 700 + o.waterline);
      ctx.clip();
    }
    const leg = (lx, color, seed) => {
      const pts = [[lx - 21, -112], [lx + 21, -112], [lx + 22, -14], [lx + 28, 0], [lx - 26, 0], [lx - 22, -14]];
      shape(ctx, pts, color, lw, seed);
      inside(ctx, pts, () => hatch(ctx, lx, -112, 30, 112, 1.2, 7, "rgba(20,30,14,0.45)", 1.1 / s, seed));
      sketch(ctx, [[lx - 8, -2], [lx - 8, -10]], lw * 0.7, false, seed);
      sketch(ctx, [[lx + 8, -2], [lx + 8, -10]], lw * 0.7, false, seed + 1);
    };
    const walk = o.walk ? 14 : 0;
    leg(-62 + walk, dark, 1);
    leg(82 - walk, dark, 2);
    leg(-98 - walk, c, 3);
    leg(46 + walk, c, 4);
    const tail = smooth([[-100, -152], [-200, -124], [-292, -64], [-350, -24], [-300, -42], [-205, -90], [-112, -80]], true, 8);
    shape(ctx, tail, lin(ctx, 0, -150, 0, -30, [[0, tint(c, 0.12)], [1, dark]]), lw, 5);
    const body = smooth([[-138, -114], [-96, -180], [0, -202], [96, -184], [146, -130], [122, -66], [0, -50], [-118, -64]], true, 10);
    shape(ctx, body, lin(ctx, 0, -205, 0, -50, [[0, tint(c, 0.2)], [0.55, c], [1, dark]]), lw, 6);
    inside(ctx, body, () => {
      blotches(ctx, -120, -205, 240, 70, 3, [50, 60, 40], 9, 18, 0.45);
      hatch(ctx, -130, -100, 260, 60, 0.4, 7, "rgba(20,30,14,0.45)", 1.1 / s, 7);
    });
    const neck = o.headDown
      ? smooth([[78, -176], [170, -180], [240, -120], [262, -40], [292, -40], [270, -140], [190, -210], [116, -132]], true, 8)
      : smooth([[74, -172], [150, -252], [184, -346], [198, -394], [230, -402], [214, -350], [184, -238], [134, -138]], true, 8);
    shape(ctx, neck, lin(ctx, 0, -400, 0, -120, [[0, tint(c, 0.15)], [1, c]]), lw, 8);
    const hx = o.headDown ? 280 : 216;
    const hy = o.headDown ? -36 : -398;
    const head = smooth([[hx - 22, hy + 4], [hx - 6, hy - 18], [hx + 26, hy - 16], [hx + 46, hy - 2], [hx + 30, hy + 12], [hx - 10, hy + 14]], true, 6);
    shape(ctx, head, tint(c, 0.12), lw, 9);
    oval(ctx, hx + 14, hy - 6, 3.6, 3.6);
    ctx.fillStyle = INK;
    ctx.fill();
    sketch(ctx, [[hx + 44, hy + 2], [hx + 14, hy + 6]], lw * 0.8, false, 10);
    if (o.leaves) {
      for (let i = 0; i < 4; i++) {
        const lx = hx + 40 + i * 6;
        const ly = hy + 4 + (i % 2) * 8;
        const leaf = smooth(ring(lx, ly, 10, 5, 8), true, 3);
        shape(ctx, leaf, i % 2 ? "#6f8a3a" : "#8aa04a", lw * 0.6, i);
      }
    }
    ctx.restore();
  }

  /** A small hunter dinosaur, facing right (flip to face left), its feet at (x, y). */
  function raptor(ctx, x, y, s, o = {}) {
    const c = o.color || "#a8743e";
    const dark = tint(c, -0.3);
    const lw = 2.4 / s;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(o.flip ? -s : s, s);
    if (o.run) {
      tube(ctx, [[-8, -80], [-34, -52]], 16, dark, lw);
      tube(ctx, [[-34, -52], [-64, -34], [-82, -16]], 8, dark, lw);
      tube(ctx, [[8, -80], [40, -58]], 17, c, lw);
      tube(ctx, [[40, -58], [52, -30], [80, -24]], 8, c, lw);
    } else {
      tube(ctx, [[-8, -78], [6, -44]], 16, dark, lw);
      tube(ctx, [[6, -44], [-4, -16], [20, -2]], 8, dark, lw);
      tube(ctx, [[8, -78], [24, -44]], 17, c, lw);
      tube(ctx, [[24, -44], [14, -16], [40, -2]], 8, c, lw);
    }
    const body = smooth([[-242, -132], [-150, -124], [-60, -110], [-10, -118], [42, -112], [68, -98], [62, -72], [20, -60], [-30, -66], [-80, -86], [-160, -110], [-238, -128]], true, 8);
    shape(ctx, body, lin(ctx, 0, -125, 0, -60, [[0, tint(c, 0.15)], [1, dark]]), lw, 11);
    inside(ctx, body, () => {
      if (o.stripes) {
        ctx.strokeStyle = "rgba(60,34,14,0.75)";
        ctx.lineWidth = 9;
        ctx.lineCap = "round";
        for (let i = 0; i < 9; i++) {
          const sx = -220 + i * 30;
          ctx.beginPath();
          ctx.moveTo(sx, -140);
          ctx.lineTo(sx + 14, -100);
          ctx.stroke();
        }
      }
      hatch(ctx, -200, -95, 270, 40, 0.3, 7, "rgba(40,20,8,0.45)", 1 / s, 12);
    });
    tube(ctx, [[50, -88], [62, -74], [76, -70]], 6, c, lw);
    const head = smooth([[46, -100], [64, -128], [92, -144], [130, -142], [150, -130], [142, -120], [112, -118], [92, -108], [74, -86]], true, 6);
    shape(ctx, head, tint(c, 0.08), lw, 13);
    if (o.sleep) {
      sketch(ctx, [[98, -136], [104, -132], [112, -134]], lw, false, 14);
    } else {
      oval(ctx, 104, -133, 3.8, 3.8);
      ctx.fillStyle = INK;
      ctx.fill();
      oval(ctx, 105, -134.5, 1.3, 1.3);
      ctx.fillStyle = "#fff";
      ctx.fill();
    }
    sketch(ctx, [[148, -126], [108, -122]], lw * 0.8, false, 15);
    ctx.restore();
  }

  /** A small dinosaur asleep, curled on the ground, its tail round its feet. */
  function sleeper(ctx, x, y, s, o = {}) {
    const c = o.color || "#a8743e";
    const dark = tint(c, -0.3);
    const lw = 2.4 / s;
    softShadow(ctx, x, y, 120 * s, 18 * s, 0.4);
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(o.flip ? -s : s, s);
    const tail = smooth([[-70, -20], [-120, -10], [-110, 6], [-30, 8], [60, 4], [110, -2], [60, -10], [-40, -4]], true, 8);
    const body = smooth([[-90, -10], [-70, -62], [0, -84], [60, -66], [80, -20], [40, -4], [-50, -2]], true, 10);
    shape(ctx, body, lin(ctx, 0, -84, 0, 0, [[0, tint(c, 0.15)], [1, dark]]), lw, 21);
    inside(ctx, body, () => {
      ctx.strokeStyle = "rgba(60,34,14,0.7)";
      ctx.lineWidth = 8;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(-60 + i * 28, -90);
        ctx.lineTo(-50 + i * 28, -56);
        ctx.stroke();
      }
    });
    shape(ctx, tail, dark, lw, 22);
    const head = smooth([[50, -30], [70, -52], [110, -54], [138, -40], [128, -24], [80, -18]], true, 6);
    shape(ctx, head, tint(c, 0.08), lw, 23);
    sketch(ctx, [[88, -42], [96, -38], [104, -41]], lw, false, 24);
    // little breaths
    ctx.strokeStyle = "rgba(255,255,240,0.7)";
    ctx.lineWidth = 2.4 / s;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(150 + i * 14, -60 - i * 16, 5 + i * 3, Math.PI * 1.2, Math.PI * 1.9);
      ctx.stroke();
    }
    ctx.restore();
  }

  /** A flying reptile, facing right (flip to face left). */
  function ptero(ctx, x, y, s, o = {}) {
    const c = o.color || "#6a5a52";
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(o.flip ? -s : s, s);
    const up = o.up ? -40 : 0;
    const wing = smooth([[-170, -6 + up], [-90, -36 + up / 2], [-20, -18], [0, -24], [20, -18], [90, -36 + up / 2], [170, -6 + up], [80, -10], [20, 6], [-20, 6], [-80, -10]], true, 5);
    shape(ctx, wing, c, 2.2 / s, 31);
    const head = smooth([[12, -20], [44, -30], [82, -24], [44, -14]], true, 4);
    shape(ctx, head, tint(c, 0.1), 2.2 / s, 32);
    tube(ctx, [[34, -26], [16, -48]], 5, tint(c, 0.1), 1.6 / s);
    ctx.restore();
  }

  // --- Things ---

  function egg(ctx, x, y, s, rot, seed) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    const pts = smooth([[0, -32 * s], [20 * s, -8 * s], [16 * s, 18 * s], [0, 24 * s], [-16 * s, 18 * s], [-20 * s, -8 * s]], true, 6);
    shape(ctx, pts, lin(ctx, -20 * s, -30 * s, 20 * s, 24 * s, [[0, "#f6efd6"], [1, "#c8b88c"]]), 2.2, seed);
    inside(ctx, pts, () => specks(ctx, -20 * s, -32 * s, 40 * s, 56 * s, seed, "#7a6a48", 26, 2.6 * s));
    ctx.restore();
  }

  /** Half an eggshell, its broken edge zigzag. */
  function shell(ctx, x, y, s, rot, seed) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    const zig = [];
    for (let i = 0; i <= 6; i++) zig.push([-20 * s + i * (40 * s) / 6, (i % 2 ? -8 : 2) * s]);
    const pts = [...smooth([[20 * s, 0], [16 * s, 18 * s], [0, 24 * s], [-16 * s, 18 * s], [-20 * s, 0]], false, 5), ...zig];
    shape(ctx, pts, lin(ctx, 0, -8 * s, 0, 24 * s, [[0, "#f3ecd2"], [1, "#bfae80"]]), 2, seed);
    oval(ctx, 0, 0, 16 * s, 5 * s);
    ctx.fillStyle = "rgba(120,100,60,0.35)";
    ctx.fill();
    ctx.restore();
  }

  /** A nest of twigs; `fill` paints what's in it before its front rim goes on. */
  function nest(ctx, x, y, r, fill) {
    softShadow(ctx, x, y + r * 0.2, r * 1.3, r * 0.32, 0.45);
    const bowl = smooth(ring(x, y, r, r * 0.42, 16));
    shape(ctx, bowl, lin(ctx, 0, y - r * 0.4, 0, y + r * 0.4, [[0, "#3a2a18"], [1, "#6a4e2c"]]), 2.4, 51);
    fill?.();
    ctx.save();
    ctx.lineCap = "round";
    for (let i = 0; i < 90; i++) {
      const a = Math.PI * (0.05 + hash(i, 5, 1) * 0.9);
      const rr = r * (0.82 + hash(i, 5, 2) * 0.32);
      const px = x + Math.cos(a) * rr;
      const py = y + Math.sin(a) * rr * 0.46;
      const len = 26 + hash(i, 5, 3) * 30;
      const ang = a + Math.PI / 2 + (hash(i, 5, 4) - 0.5) * 0.9;
      ctx.strokeStyle = ["#5a4024", "#7a5a34", "#8e6e40", "#4a3218"][i % 4];
      ctx.lineWidth = 3 + hash(i, 5, 5) * 2;
      ctx.beginPath();
      ctx.moveTo(px - Math.cos(ang) * len / 2, py - Math.sin(ang) * len / 2 * 0.5);
      ctx.lineTo(px + Math.cos(ang) * len / 2, py + Math.sin(ang) * len / 2 * 0.5);
      ctx.stroke();
    }
    ctx.restore();
  }

  /** Footprints. Each points its toes along `ang`. */
  function print3(ctx, x, y, s, ang) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    ctx.scale(1, 0.55);
    for (const [a, len] of [[-0.55, 1], [0, 1.15], [0.55, 1]]) {
      oval(ctx, Math.cos(a) * 15 * s * len, Math.sin(a) * 15 * s * len, 14 * s * len, 4.6 * s, a);
      ctx.fillStyle = "rgba(56,40,18,0.7)";
      ctx.fill();
    }
    oval(ctx, -4 * s, 0, 7 * s, 6 * s);
    ctx.fill();
    ctx.restore();
  }

  function printRound(ctx, x, y, s, ang) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    ctx.scale(1, 0.5);
    oval(ctx, 0, 0, 30 * s, 26 * s);
    ctx.fillStyle = "rgba(56,40,18,0.62)";
    ctx.fill();
    for (const a of [-0.6, 0, 0.6]) {
      oval(ctx, Math.cos(a) * 34 * s, Math.sin(a) * 30 * s, 7 * s, 6 * s);
      ctx.fill();
    }
    ctx.strokeStyle = "rgba(230,214,170,0.35)";
    ctx.lineWidth = 3;
    oval(ctx, -2, -3, 30 * s, 26 * s);
    ctx.stroke();
    ctx.restore();
  }

  function printFoot(ctx, x, y, s, ang, left) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    ctx.scale(1, left ? 0.55 : -0.55);
    ctx.fillStyle = "rgba(40,30,20,0.6)";
    const sole = smooth([[-22 * s, 0], [-14 * s, -9 * s], [8 * s, -10 * s], [20 * s, -6 * s], [18 * s, 6 * s], [0, 7 * s], [-16 * s, 6 * s]], true, 5);
    trace(ctx, sole);
    ctx.fill();
    [[27, -9, 4.4], [27, -2, 3.4], [25, 4, 3], [22, 9, 2.6], [18, 12, 2.2]].forEach(([tx, ty, r]) => {
      oval(ctx, tx * s, ty * s, r * s, r * s);
      ctx.fill();
    });
    ctx.restore();
  }

  /** A line of footprints from one spot to another, left and right in turn. */
  function trail(ctx, from, to, n, s, kind, spread) {
    const ang = Math.atan2(to[1] - from[1], to[0] - from[0]);
    for (let i = 0; i < n; i++) {
      const k = n === 1 ? 0 : i / (n - 1);
      const side = i % 2 ? 1 : -1;
      const px = from[0] + (to[0] - from[0]) * k - Math.sin(ang) * spread * side;
      const py = from[1] + (to[1] - from[1]) * k + Math.cos(ang) * spread * side * 0.5;
      kind(ctx, px, py, s, ang, side > 0);
    }
  }

  function bone(ctx, x, y, s, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    tube(ctx, [[-26 * s, 0], [26 * s, 0]], 9 * s, "#efe6cf", 2);
    for (const ex of [-1, 1]) {
      for (const ey of [-1, 1]) {
        oval(ctx, ex * 28 * s, ey * 6 * s, 8 * s, 8 * s);
        ctx.fillStyle = "#efe6cf";
        ctx.fill();
        sketch(ctx, ring(ex * 28 * s, ey * 6 * s, 8 * s, 8 * s, 10), 2, true, 61);
      }
    }
    ctx.restore();
  }

  /** A campfire: logs, flames, embers and a warm glow. */
  function campfire(ctx, x, y, s) {
    softShadow(ctx, x, y + 6, 110 * s, 22 * s, 0.5);
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      rock(ctx, x + Math.cos(a) * 80 * s, y + Math.sin(a) * 22 * s + 8, 34 * s, 24 * s, 70 + i, "#7d7a70");
    }
    tube(ctx, [[x - 70 * s, y + 6], [x + 50 * s, y - 24 * s]], 18 * s, "#5a3e24");
    tube(ctx, [[x + 70 * s, y + 6], [x - 50 * s, y - 24 * s]], 18 * s, "#6a4a2a");
    glow(ctx, x, y - 50 * s, 380 * s, [255, 150, 60], 0.5);
    const flame = (fx, fy, fw, fh, color) => {
      ctx.beginPath();
      ctx.moveTo(fx - fw, fy);
      ctx.quadraticCurveTo(fx - fw * 1.1, fy - fh * 0.5, fx, fy - fh);
      ctx.quadraticCurveTo(fx + fw * 1.1, fy - fh * 0.5, fx + fw, fy);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    };
    flame(x, y - 10 * s, 46 * s, 130 * s, "#e8742c");
    flame(x - 30 * s, y - 6 * s, 24 * s, 80 * s, "#e8742c");
    flame(x + 30 * s, y - 6 * s, 26 * s, 90 * s, "#d9602a");
    flame(x, y - 10 * s, 26 * s, 84 * s, "#ffc24b");
    flame(x, y - 10 * s, 12 * s, 44 * s, "#fff1b8");
    for (let i = 0; i < 14; i++) {
      oval(ctx, x + (hash(i, 9, 1) - 0.5) * 120 * s, y - 120 * s - hash(i, 9, 2) * 160 * s, 2.6, 2.6);
      ctx.fillStyle = "#ffb050";
      ctx.fill();
    }
    for (let i = 0; i < 6; i++) {
      const k = i / 6;
      ctx.fillStyle = `rgba(160,150,140,${0.3 * (1 - k)})`;
      oval(ctx, x + k * 60 * s + Math.sin(i * 2) * 14, y - 170 * s - k * 220 * s, (24 + k * 50) * s, (18 + k * 36) * s);
      ctx.fill();
    }
  }

  /** A crescent moon; the night sky (`skyFill`) bites its right side away. */
  function moon(ctx, x, y, r, skyFill) {
    oval(ctx, x, y, r, r);
    ctx.fillStyle = "#f4ecc8";
    ctx.fill();
    oval(ctx, x + r * 0.42, y - r * 0.22, r * 0.84, r * 0.84);
    ctx.fillStyle = skyFill;
    ctx.fill();
    glow(ctx, x, y, r * 5, [200, 210, 255], 0.3);
  }

  function stars(ctx, n, maxY, seed) {
    for (let i = 0; i < n; i++) {
      const x = hash(i, seed, 1) * W;
      const y = hash(i, seed, 2) * maxY;
      const r = 1 + hash(i, seed, 3) * 2.2;
      ctx.fillStyle = `rgba(255,246,210,${0.5 + hash(i, seed, 4) * 0.5})`;
      oval(ctx, x, y, r, r);
      ctx.fill();
      if (r > 2.6) glow(ctx, x, y, 14, [255, 240, 200], 0.4);
    }
  }

  // Things that don't belong with the dinosaurs.

  function kite(ctx, x, y, s, to) {
    ctx.save();
    ctx.strokeStyle = "rgba(40,30,20,0.7)";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(x, y + 60 * s);
    ctx.quadraticCurveTo((x + to[0]) / 2 + 60, (y + to[1]) / 2, to[0], to[1]);
    ctx.stroke();
    ctx.restore();
    const tail = [[x, y + 60 * s], [x - 20 * s, y + 110 * s], [x + 10 * s, y + 160 * s], [x - 14 * s, y + 210 * s]];
    sketch(ctx, smooth(tail, false, 6), 2, false, 81);
    tail.slice(1).forEach(([bx, by], i) => {
      trace(ctx, [[bx - 12 * s, by - 6 * s], [bx, by], [bx - 12 * s, by + 6 * s]]);
      ctx.fillStyle = i % 2 ? "#e8b44a" : "#c9503c";
      ctx.fill();
      trace(ctx, [[bx + 12 * s, by - 6 * s], [bx, by], [bx + 12 * s, by + 6 * s]]);
      ctx.fill();
    });
    const body = [[x, y - 70 * s], [x + 46 * s, y - 10 * s], [x, y + 60 * s], [x - 46 * s, y - 10 * s]];
    shape(ctx, body, "#c9503c", 2.4, 82);
    trace(ctx, [[x, y - 70 * s], [x + 46 * s, y - 10 * s], [x, y - 10 * s]]);
    ctx.fillStyle = "#e8b44a";
    ctx.fill();
    trace(ctx, [[x, y + 60 * s], [x - 46 * s, y - 10 * s], [x, y - 10 * s]]);
    ctx.fill();
    sketch(ctx, [[x, y - 70 * s], [x, y + 60 * s]], 1.8, false, 83);
    sketch(ctx, [[x - 46 * s, y - 10 * s], [x + 46 * s, y - 10 * s]], 1.8, false, 84);
  }

  function bicycle(ctx, x, y, s, rot = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    const wheel = (wx) => {
      ctx.strokeStyle = "#2a2a28";
      ctx.lineWidth = 7 * s;
      oval(ctx, wx, -46 * s, 44 * s, 44 * s);
      ctx.stroke();
      ctx.strokeStyle = "rgba(60,60,56,0.7)";
      ctx.lineWidth = 1.4;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI;
        ctx.beginPath();
        ctx.moveTo(wx - Math.cos(a) * 40 * s, -46 * s - Math.sin(a) * 40 * s);
        ctx.lineTo(wx + Math.cos(a) * 40 * s, -46 * s + Math.sin(a) * 40 * s);
        ctx.stroke();
      }
    };
    wheel(-60 * s);
    wheel(60 * s);
    const red = "#b8402e";
    tube(ctx, [[-60 * s, -46 * s], [-10 * s, -46 * s], [36 * s, -96 * s]], 6 * s, red, 1.6);
    tube(ctx, [[-10 * s, -46 * s], [-34 * s, -104 * s]], 6 * s, red, 1.6);
    tube(ctx, [[-34 * s, -100 * s], [36 * s, -96 * s]], 6 * s, red, 1.6);
    tube(ctx, [[36 * s, -96 * s], [60 * s, -46 * s]], 6 * s, red, 1.6);
    tube(ctx, [[-60 * s, -46 * s], [-34 * s, -100 * s]], 5 * s, red, 1.6);
    tube(ctx, [[-50 * s, -110 * s], [-20 * s, -110 * s]], 8 * s, "#2a2a28", 1.6);
    tube(ctx, [[36 * s, -96 * s], [40 * s, -118 * s], [58 * s, -122 * s]], 5 * s, "#5a5a56", 1.6);
    ctx.restore();
  }

  function ball(ctx, x, y, r) {
    softShadow(ctx, x, y + r * 0.9, r * 1.2, r * 0.3, 0.4);
    const pts = ring(x, y, r, r, 30);
    shape(ctx, pts, lin(ctx, x - r, y - r, x + r, y + r, [[0, "#fbf6e8"], [1, "#b8b4a4"]]), 2.4, 91);
    inside(ctx, pts, () => {
      ctx.fillStyle = "#2a2a28";
      const pent = (px, py, pr, rot) => {
        const p = [];
        for (let i = 0; i < 5; i++) p.push([px + Math.cos(rot + (i * 2 * Math.PI) / 5) * pr, py + Math.sin(rot + (i * 2 * Math.PI) / 5) * pr]);
        trace(ctx, p);
        ctx.fill();
      };
      pent(x, y, r * 0.32, -Math.PI / 2);
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
        pent(x + Math.cos(a) * r * 0.95, y + Math.sin(a) * r * 0.95, r * 0.3, a + Math.PI);
      }
    });
  }

  function sign(ctx, x, y, s) {
    softShadow(ctx, x, y, 30 * s, 8 * s, 0.35);
    tube(ctx, [[x, y], [x, y - 190 * s]], 8 * s, "#9a9a96", 1.8);
    const r = 42 * s;
    shape(ctx, ring(x, y - 210 * s, r, r, 30), "#c33a2c", 2.6, 92);
    shape(ctx, ring(x, y - 210 * s, r * 0.72, r * 0.72, 30), "#f4efe2", 0, 0);
    trace(ctx, [[x - r * 0.5, y - 210 * s - r * 0.14], [x + r * 0.5, y - 210 * s - r * 0.14], [x + r * 0.5, y - 210 * s + r * 0.14], [x - r * 0.5, y - 210 * s + r * 0.14]]);
    ctx.fillStyle = "#c33a2c";
    ctx.fill();
  }

  // --- The scenes ---

  /** Who took the egg? A clearing in the dinosaurs' jungle, the wind blowing to the left. */
  function sceneNest(ctx) {
    const hz = 540;
    sky(ctx, hz, ["#7f9f94", "#b9c9a6", "#e8e6c2"]);
    halo(ctx, 420, 200, 440, [255, 250, 214], 0.8);
    volcano(ctx, 1240, hz + 34, 300, 250, { lean: -440, rise: 280, puffs: 12, puffGrow: 70 });
    hills(ctx, hz, [[22, "#a3b59a", 90, 10], [50, "#87a084", 70, 14], [86, "#6c8a6c", 56, 18]], [236, 240, 220], (li, base) => {
      if (li === 1) farLongNeck(ctx, 960, base - 12, 0.8, "rgba(100,124,104,0.85)");
    });
    ground(ctx, 660, "#86964e", "#4f5e34", 3);
    mud(ctx, 1020, 880, 640, 120, 4);
    tree(ctx, 200, 905, 660, 175);
    longNeck(ctx, 600, 912, 1.05, { flip: true, leaves: true });
    // the long-neck's own path: big round prints along the bottom, nowhere near the nest
    trail(ctx, [1580, 972], [700, 958], 10, 0.95, printRound, 16);
    // the thief's path: small three-toed prints from the nest into the bush
    trail(ctx, [880, 846], [1170, 838], 7, 1, print3, 12);
    nest(ctx, 790, 820, 96, () => {
      egg(ctx, 752, 800, 1, -0.2, 1);
      egg(ctx, 796, 790, 1.05, 0.05, 2);
      egg(ctx, 836, 806, 0.95, 0.3, 3);
    });
    raptor(ctx, 1320, 812, 0.95, { flip: true, stripes: true });
    bush(ctx, 1280, 830, 160, "#5f7a3a", 2);
    fern(ctx, 1180, 850, 90, -0.5, ["#3e5a2c", "#4f6b34"], 5);
    shell(ctx, 1140, 884, 1, -0.3, 4);
    shell(ctx, 1188, 896, 0.9, 0.5, 5);
    // ferns in front, all bent left by the wind
    fern(ctx, -20, 1010, 260, -0.5);
    fern(ctx, 420, 1015, 150, -0.5, ["#3e5a2c", "#4f6b34", "#2e4a24"], 6);
    fern(ctx, 1620, 1012, 240, -0.5);
    rays(ctx, [255, 246, 200], 0.1);
    wash(ctx, "#d6e6a0", "soft-light", 0.3);
    paperAndVignette(ctx, [16, 30, 12], 0.5);
  }

  /** The lagoon late in the day: the sun is low on the right, out of the picture. */
  function sceneLagoon(ctx) {
    const hz = 470;
    sky(ctx, hz, ["#8a8aa0", "#d8ae8e", "#f2d6a4"]);
    halo(ctx, 1640, 420, 620, [255, 214, 150], 0.75);
    hills(ctx, hz, [[24, "#b39c90", 100, 10], [56, "#98897c", 76, 14], [96, "#7b7a66", 60, 18]], [244, 222, 196], (li, base) => {
      if (li === 1) {
        farLongNeck(ctx, 330, base - 10, 0.85, "rgba(110,98,92,0.9)");
        farLongNeck(ctx, 560, base - 4, 0.7, "rgba(110,98,92,0.85)", true);
      }
    });
    ground(ctx, 600, "#a49c62", "#5a643a", 7);
    const water = lagoon(ctx, 830, 760, 520, 150, ["#c9b49a", "#7a8a8c"], 8);
    // the long-neck in the middle of the lagoon: the water only covers its feet
    const lx = 900;
    const ly = 800;
    const ls = 1.15;
    const wl = -24;
    ctx.save();
    trace(ctx, water);
    ctx.clip();
    ctx.globalAlpha = 0.28;
    ctx.translate(0, 2 * (ly + wl * ls));
    ctx.scale(1, -1);
    longNeck(ctx, lx, ly, ls, { flip: true, color: "#6f6a5a", waterline: wl });
    ctx.restore();
    longNeck(ctx, lx, ly, ls, { flip: true, color: "#7d7a64", waterline: wl });
    ctx.strokeStyle = "rgba(255,240,210,0.7)";
    ctx.lineWidth = 2.4;
    for (const leg of [-98, -62, 46, 82]) {
      const x = lx - leg * ls;
      oval(ctx, x, ly + wl * ls + 2, 34, 7);
      ctx.stroke();
    }
    ripples(ctx, 830, 770, 460, 110, 9);
    // the small one on the shore, its shadow long to the left
    castShadow(ctx, 230, 890, 280, 64, -1, 0.5);
    raptor(ctx, 240, 890, 0.85, { color: "#9a6e44" });
    // a big rock on the right shore; only the head of the one hiding behind it shows
    ctx.save();
    ctx.beginPath();
    ctx.rect(1100, 600, 220, 400);
    ctx.clip();
    raptor(ctx, 1330, 860, 1, { flip: true, color: "#8a7a4e", stripes: true });
    ctx.restore();
    castShadow(ctx, 1330, 938, 340, 120, -1, 0.5);
    rock(ctx, 1340, 940, 380, 240, 11, "#a69a86", -1);
    castShadow(ctx, 530, 950, 240, 74, -1, 0.5);
    rock(ctx, 540, 952, 140, 80, 12, "#a69a86", -1);
    fern(ctx, 1620, 1010, 220, -0.2, ["#4e5a2c", "#5e6a34", "#3e4a24"]);
    fern(ctx, -30, 1012, 200, 0.1, ["#4e5a2c", "#5e6a34", "#3e4a24"], 6);
    rays(ctx, [255, 220, 170], 0.12, -1);
    wash(ctx, "#f0c890", "soft-light", 0.32);
    paperAndVignette(ctx, [40, 20, 10], 0.5);
  }

  /** A cave at night, the fire still burning, footprints going off to the right. */
  function sceneCave(ctx) {
    const hz = 520;
    const night = sky(ctx, hz, ["#141a33", "#28335c", "#46507a"]);
    stars(ctx, 90, 460, 3);
    moon(ctx, 1380, 150, 46, night);
    hills(ctx, hz, [[30, "#2e3854", 100, 10], [66, "#263048", 70, 16]], [90, 100, 140]);
    ground(ctx, 650, "#3e4a3a", "#1e261c", 5);
    // the cliff and the mouth of the cave
    const cliff = smooth([[-40, 1010], [-40, 140], [160, 90], [420, 120], [700, 200], [880, 360], [960, 560], [1000, 720], [1040, 1010]], true, 8);
    shape(ctx, cliff, lin(ctx, 0, 100, 900, 900, [[0, "#6a6e5e"], [1, "#3a3d33"]]), 2.8, 21);
    inside(ctx, cliff, () => {
      blotches(ctx, 0, 100, 1000, 900, 22, [20, 22, 18], 20, 90, 0.35);
      hatch(ctx, 560, 200, 480, 820, 1.1, 9, "rgba(10,12,10,0.5)", 1.2, 23);
      specks(ctx, 0, 100, 1000, 900, 24, "#1a1a16", 220, 2.4);
    });
    const mouth = smooth([[250, 900], [262, 600], [330, 450], [470, 400], [610, 450], [690, 600], [710, 900]], true, 8);
    trace(ctx, mouth);
    const inner = ctx.createRadialGradient(480, 820, 30, 480, 700, 420);
    inner.addColorStop(0, "#6a3a1c");
    inner.addColorStop(0.5, "#2a1a10");
    inner.addColorStop(1, "#120c08");
    ctx.fillStyle = inner;
    ctx.fill();
    sketch(ctx, mouth, 2.8, false, 25);
    // a long-neck painted on the cave wall, and hand prints
    inside(ctx, mouth, () => {
      ctx.save();
      ctx.globalAlpha = 0.75;
      ctx.strokeStyle = "#c46a34";
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.ellipse(400, 560, 50, 24, 0, 0, Math.PI * 2);
      ctx.moveTo(440, 550);
      ctx.quadraticCurveTo(480, 500, 476, 470);
      ctx.moveTo(360, 560);
      ctx.quadraticCurveTo(320, 570, 300, 600);
      for (const dx of [-30, -12, 14, 30]) {
        ctx.moveTo(400 + dx, 580);
        ctx.lineTo(400 + dx, 610);
      }
      ctx.stroke();
      ctx.fillStyle = "#c46a34";
      for (const [hx, hy] of [[560, 520], [600, 560]]) {
        oval(ctx, hx, hy, 14, 16);
        ctx.fill();
        for (let f = 0; f < 5; f++) {
          oval(ctx, hx - 12 + f * 6, hy - 22 - (f === 0 ? -6 : f === 2 ? 4 : 0), 3.4, 8);
          ctx.fill();
        }
      }
      ctx.restore();
    });
    // trees in the dark on the right, and a muddy path into them with footprints on it
    for (const [tx, ty, th, tr] of [[1260, 760, 420, 110], [1440, 790, 480, 130], [1590, 770, 440, 120]]) {
      tree(ctx, tx, ty, th, tr, { leafLight: "#3a4a3a", leafDark: "#1a241a" });
    }
    const path = smooth([[700, 950], [900, 900], [1120, 860], [1340, 830], [1360, 860], [1130, 905], [910, 955], [720, 990]], true, 8);
    trace(ctx, path);
    ctx.fillStyle = "#7a6c50";
    ctx.fill();
    inside(ctx, path, () => blotches(ctx, 700, 820, 680, 180, 26, [30, 24, 16], 10, 40, 0.3));
    trail(ctx, [800, 940], [1310, 852], 9, 1.1, printFoot, 13);
    // three stones round the fire, a bone by each one
    rock(ctx, 320, 900, 90, 60, 31, "#8a8476");
    rock(ctx, 680, 904, 90, 60, 32, "#8a8476");
    rock(ctx, 560, 958, 96, 56, 33, "#8a8476");
    bone(ctx, 330, 940, 0.9, 0.3);
    bone(ctx, 700, 948, 0.9, -0.4);
    bone(ctx, 460, 972, 0.85, 0.1);
    campfire(ctx, 500, 880, 0.9);
    fern(ctx, -30, 1012, 220, 0.2, ["#1e2a1a", "#26321e", "#18221a"]);
    wash(ctx, "#203060", "multiply", 0.25);
    glow(ctx, 500, 820, 300, [255, 140, 60], 0.25);
    paperAndVignette(ctx, [4, 6, 16], 0.6);
  }

  /** The volcano wakes up: everyone runs to the left, except one. */
  function sceneVolcano(ctx) {
    const hz = 560;
    sky(ctx, hz, ["#5a4a4c", "#a8806a", "#dcbc98"]);
    halo(ctx, 300, 160, 380, [255, 230, 190], 0.5);
    hills(ctx, hz, [[26, "#a08a7a", 90, 8], [60, "#857a68", 70, 12]], [230, 210, 190]);
    volcano(ctx, 1150, 690, 560, 470, { color: "#7a6a5e", pen: true, lava: true, lean: 160, rise: 520, puffs: 16, puffR: 40, puffGrow: 180, smoke: [60, 54, 54], smokeA: 0.75, glowR: 140, glowA: 0.7 });
    // stones tumbling down the slope
    for (const [rx, ry, rr] of [[930, 420, 18], [1010, 520, 14], [1330, 470, 16], [880, 560, 12]]) {
      shape(ctx, smooth(ring(rx, ry, rr, rr * 0.8, 7), true, 3), "#4a403a", 2, rx);
      ctx.strokeStyle = "rgba(90,70,60,0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(rx + 10, ry - 20);
      ctx.lineTo(rx + 34, ry - 44);
      ctx.stroke();
    }
    ground(ctx, 680, "#8e8a58", "#4c5434", 9);
    // flying away
    ptero(ctx, 420, 250, 0.5, { flip: true });
    ptero(ctx, 600, 190, 0.42, { flip: true, up: true });
    ptero(ctx, 300, 330, 0.36, { flip: true });
    // running away, dust behind them
    const dust = (x, y, r) => {
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = `rgba(200,180,150,${0.35 - i * 0.05})`;
        oval(ctx, x + i * r * 0.7, y - i * 6, r * (0.6 + i * 0.15), r * (0.4 + i * 0.1));
        ctx.fill();
      }
    };
    dust(560, 905, 40);
    longNeck(ctx, 440, 910, 0.85, { flip: true, walk: true, color: "#7a8466" });
    dust(860, 880, 30);
    raptor(ctx, 760, 870, 0.8, { flip: true, run: true, stripes: true });
    dust(1050, 960, 30);
    raptor(ctx, 950, 950, 0.85, { flip: true, run: true, color: "#9a6a3e" });
    dust(260, 960, 26);
    raptor(ctx, 170, 955, 0.75, { flip: true, run: true, color: "#8a7040", stripes: true });
    // the one who sleeps through it all, near the volcano
    sleeper(ctx, 1390, 930, 0.8, { flip: true });
    fern(ctx, 1520, 960, 150, 0, ["#3e4a24", "#4e5a2c"], 5);
    fern(ctx, 1640, 1012, 220, -0.2, ["#3e4a24", "#4e5a2c", "#2e3a1c"]);
    fern(ctx, -20, 1012, 180, 0.2, ["#3e4a24", "#4e5a2c", "#2e3a1c"], 6);
    glow(ctx, 1150, 240, 500, [255, 100, 40], 0.18);
    wash(ctx, "#e0a070", "soft-light", 0.35);
    paperAndVignette(ctx, [40, 12, 8], 0.55);
  }

  /** A day in the jungle, with four things from our time hidden in it. */
  function sceneOdd(ctx) {
    const hz = 520;
    sky(ctx, hz, ["#7f9f94", "#b9c9a6", "#e8e6c2"]);
    halo(ctx, 1200, 180, 420, [255, 250, 214], 0.8);
    volcano(ctx, 380, hz + 30, 260, 210, { lean: 160, rise: 240 });
    hills(ctx, hz, [[22, "#a3b59a", 90, 10], [50, "#87a084", 70, 14], [86, "#6c8a6c", 56, 18]], [236, 240, 220], (li, base) => {
      if (li === 1) {
        farLongNeck(ctx, 760, base - 10, 0.8, "rgba(100,124,104,0.85)");
        farLongNeck(ctx, 1380, base - 4, 0.6, "rgba(100,124,104,0.8)", true);
      }
    });
    ground(ctx, 650, "#86964e", "#4f5e34", 11);
    const water = lagoon(ctx, 1180, 760, 260, 70, ["#b9cdb4", "#6f8a86"], 12);
    ripples(ctx, 1180, 760, 220, 50, 13);
    void water;
    tree(ctx, 1460, 900, 640, 170);
    bicycle(ctx, 1385, 900, 0.85, -0.12);
    longNeck(ctx, 860, 860, 0.95, { headDown: true, color: "#7d8f6a" });
    // a little one flying a kite
    kite(ctx, 470, 210, 0.9, [342, 750]);
    raptor(ctx, 300, 860, 0.85, { color: "#a8743e", stripes: true });
    nest(ctx, 600, 930, 70, () => {
      egg(ctx, 580, 916, 0.8, -0.2, 6);
      egg(ctx, 618, 912, 0.8, 0.2, 7);
    });
    fern(ctx, 960, 1004, 170, 0.1, ["#3e5a2c", "#4f6b34", "#2e4a24"], 6);
    ball(ctx, 1060, 962, 30);
    sign(ctx, 160, 990, 0.8);
    fern(ctx, -30, 1012, 230, 0.2);
    fern(ctx, 250, 1014, 150, -0.1, ["#3e5a2c", "#4f6b34", "#2e4a24"], 5);
    fern(ctx, 1630, 1012, 230, -0.2);
    rays(ctx, [255, 246, 200], 0.1, -1);
    wash(ctx, "#d6e6a0", "soft-light", 0.3);
    paperAndVignette(ctx, [16, 30, 12], 0.5);
  }

  const scenes = [
    {
      draw: sceneNest,
      questions: [
        ["מישהו גנב ביצה מהקן. מי הגנב?", "הדינוזאור הקטן שמתחבא בשיח",
          ["עקבות קטנות של שלוש אצבעות יוצאות מהקן ונגמרות בשיח.", "הזנב שלו מציץ מאחורי השיח.", "העקבות הגדולות בכלל לא מגיעות לקן."],
          [[1385, 715, 200, 125], [1030, 842, 190, 50]]],
        ["כמה ביצים היו בקן בהתחלה?", "ארבע",
          ["בקן נשארו שלוש ביצים.", "ליד השיח יש קליפות של עוד ביצה אחת."],
          [[790, 795, 130, 75], [1164, 884, 70, 40]]],
        ["לאיזה צד נושבת הרוח?", "שמאלה",
          ["העשן של הר הגעש נמשך שמאלה.", "גם השרכים מתכופפים שמאלה."],
          [[1010, 170, 300, 160], [1530, 900, 110, 110]]],
      ],
    },
    {
      draw: sceneLagoon,
      questions: [
        ["השמש לא נמצאת בתמונה. באיזה צד היא?", "בצד ימין",
          ["כל הצללים נופלים שמאלה — הצד ההפוך לשמש.", "וגם השמיים בצד ימין הכי בהירים."],
          [[150, 890, 150, 45], [1150, 935, 220, 55]]],
        ["האם המים באגם עמוקים?", "לא",
          ["צוואר־הארוך עומד באמצע האגם.", "המים מכסים לו רק את כפות הרגליים."],
          [[905, 752, 160, 40]]],
        ["כמה דינוזאורים יש בתמונה?", "חמישה",
          ["שניים רחוק על הגבעה.", "צוואר־ארוך באגם וקטן על החוף.", "ועוד אחד שמציץ מאחורי הסלע.", "ההשתקפות במים לא נחשבת!"],
          [[440, 530, 190, 60], [840, 580, 230, 230], [240, 820, 110, 90], [1220, 740, 90, 60]]],
      ],
    },
    {
      draw: sceneCave,
      questions: [
        ["איך יודעים שמישהו היה כאן ממש לפני רגע?", "המדורה עוד בוערת",
          ["אם היו הולכים מזמן — האש כבר הייתה כבויה."],
          [[500, 820, 130, 120]]],
        ["לאן הלכו מי שישבו כאן?", "ימינה, אל היער",
          ["העקבות יוצאות מהמדורה.", "האצבעות של כפות הרגליים מצביעות ימינה."],
          [[1070, 890, 300, 70]]],
        ["כמה ישבו סביב המדורה?", "שלושה",
          ["יש שלוש אבנים לשבת עליהן.", "וליד כל אבן יש עצם שאכלו ממנה."],
          [[325, 905, 80, 60], [690, 912, 80, 60], [520, 965, 100, 45]]],
      ],
    },
    {
      draw: sceneVolcano,
      questions: [
        ["מאיפה מגיעה הסכנה?", "מהר הגעש",
          ["כל החיות בורחות לצד השני.", "בפסגה יש אש, לבה ועשן שחור."],
          [[1150, 200, 260, 180]]],
        ["מי עוד לא יודע שיש סכנה?", "הדינוזאור שישן ליד השרך",
          ["כולם רצים — רק הוא שוכב בעיניים עצומות."],
          [[1380, 905, 140, 70]]],
        ["לאיזה צד נושבת הרוח?", "ימינה",
          ["העשן של הר הגעש נמשך ימינה.", "לכן החיות בורחות שמאלה — רחוק מהעשן."],
          [[1250, 110, 180, 120]]],
      ],
    },
    {
      draw: sceneOdd,
      questions: [
        ["מצאו ארבעה דברים שלא היו בימי הדינוזאורים.", "",
          ["עפיפון בשמיים.", "אופניים ליד העץ.", "כדורגל בדשא.", "תמרור בין השרכים."],
          [[460, 230, 80, 120], [1385, 860, 110, 70], [1060, 962, 50, 45], [160, 830, 70, 90]]],
      ],
    },
  ];

  window.ClassPictures = { W, H, scenes };
})();
