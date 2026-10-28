/* Drawings for the subject lessons (subject-lessons.js): a slide's
   `fig: { kind, ... }` becomes the SVG that LESSON_FIGURES[kind] returns.
   Thick black outlines and flat colors, like the rest of the site. */
(function () {
  const TEAL = "#00e5cc";
  const SOFT = "#eaf5ff";
  const COL = { tq: "#b8fff5", yl: "#fff3b0", deep: "#00897b", orange: "#ff7a00", yellow: "#ffe135", blue: "#4da6ff", red: "#ff3b5c", sea: "#9fd3ff" };
  const f1 = (n) => +n.toFixed(1);
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const hasHebrew = (s) => /[֐-׿]/.test(s);
  // Hebrew labels read right to left; math labels ("1 : 100") left to right.
  const label = (x, y, t, size = 26, color = "#000") =>
    `<text x="${f1(x)}" y="${f1(y)}" font-size="${size}" font-weight="800" fill="${color}" text-anchor="middle" dominant-baseline="central" direction="${
      hasHebrew(String(t)) ? "rtl" : "ltr"
    }">${esc(t)}</text>`;
  const svg = (vb, body) => `<svg class="lp-fig-svg" viewBox="${vb}" role="img" aria-hidden="true">${body}</svg>`;

  /* ---------- geometry helpers ---------- */
  const P = (x, y) => ({ x, y });
  const V = {
    sub: (a, b) => P(a.x - b.x, a.y - b.y),
    add: (a, b) => P(a.x + b.x, a.y + b.y),
    mul: (a, k) => P(a.x * k, a.y * k),
    unit: (a) => {
      const l = Math.hypot(a.x, a.y) || 1;
      return P(a.x / l, a.y / l);
    },
    mid: (a, b) => P((a.x + b.x) / 2, (a.y + b.y) / 2),
  };
  const centroid = (pts) => P(pts.reduce((s, p) => s + p.x, 0) / pts.length, pts.reduce((s, p) => s + p.y, 0) / pts.length);
  const poly = (pts, fill, w = 5) =>
    `<polygon points="${pts.map((p) => `${f1(p.x)},${f1(p.y)}`).join(" ")}" fill="${fill}" stroke="#000" stroke-width="${w}" stroke-linejoin="round"/>`;
  const seg = (A, B, color = "#000", w = 5, extra = "") =>
    `<line x1="${f1(A.x)}" y1="${f1(A.y)}" x2="${f1(B.x)}" y2="${f1(B.y)}" stroke="${color}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`;

  // Equal-side marks: n short ticks across the middle of AB.
  function ticks(A, B, n) {
    let s = "";
    const u = V.unit(V.sub(B, A));
    const nn = P(-u.y, u.x);
    const M = V.mid(A, B);
    for (let k = 0; k < n; k++) {
      const c = V.add(M, V.mul(u, (k - (n - 1) / 2) * 11));
      s += seg(V.add(c, V.mul(nn, -13)), V.add(c, V.mul(nn, 13)), "#000", 4);
    }
    return s;
  }

  // Equal-angle marks: n arcs at the corner T between TA and TB.
  function arcs(T, A, B, n, r0 = 34) {
    let s = "";
    const a1 = Math.atan2(A.y - T.y, A.x - T.x);
    const a2 = Math.atan2(B.y - T.y, B.x - T.x);
    const sweep = (A.x - T.x) * (B.y - T.y) - (A.y - T.y) * (B.x - T.x) > 0 ? 1 : 0;
    for (let k = 0; k < n; k++) {
      const r = r0 + k * 9;
      const p1 = P(T.x + r * Math.cos(a1), T.y + r * Math.sin(a1));
      const p2 = P(T.x + r * Math.cos(a2), T.y + r * Math.sin(a2));
      s += `<path d="M${f1(p1.x)} ${f1(p1.y)} A${r} ${r} 0 0 ${sweep} ${f1(p2.x)} ${f1(p2.y)}" fill="none" stroke="${COL.orange}" stroke-width="4.5" stroke-linecap="round"/>`;
    }
    return s;
  }

  // The small square of a right angle at T.
  function rightMark(T, A, B, size = 30, fill = "none") {
    const u1 = V.mul(V.unit(V.sub(A, T)), size);
    const u2 = V.mul(V.unit(V.sub(B, T)), size);
    const p1 = V.add(T, u1);
    const p2 = V.add(p1, u2);
    const p3 = V.add(T, u2);
    return `<path d="M${f1(T.x)} ${f1(T.y)} L${f1(p1.x)} ${f1(p1.y)} L${f1(p2.x)} ${f1(p2.y)} L${f1(p3.x)} ${f1(p3.y)} Z" fill="${fill}" stroke="none"/><path d="M${f1(p1.x)} ${f1(p1.y)} L${f1(p2.x)} ${f1(p2.y)} L${f1(p3.x)} ${f1(p3.y)}" fill="none" stroke="#000" stroke-width="3.5"/>`;
  }

  // A corner's name, pushed away from the shape's center.
  const vLabel = (T, cen, t, d = 30) => {
    const p = V.add(T, V.mul(V.unit(V.sub(T, cen)), d));
    return label(p.x, p.y, t, 34);
  };

  // A side's label, pushed out of the shape far enough to clear the line.
  function sLabel(A, B, cen, t, size = 34) {
    const M = V.mid(A, B);
    const u = V.unit(V.sub(B, A));
    let nn = P(-u.y, u.x);
    if ((M.x - cen.x) * nn.x + (M.y - cen.y) * nn.y < 0) nn = V.mul(nn, -1);
    const w = [...t].length * size * 0.6;
    const d = 14 + (Math.abs(nn.x) * w) / 2 + (Math.abs(nn.y) * size) / 2;
    const p = V.add(M, V.mul(nn, d));
    return label(p.x, p.y, t, size);
  }

  // Triangle with marks: sides [AB, BC, CA] get tick counts, angles [A, B, C]
  // get arc counts; marked sides are drawn in deep teal.
  function markedTri(pts, names, fill, marks) {
    const [A, B, C] = pts;
    const cen = centroid(pts);
    const sides = [[A, B], [B, C], [C, A]];
    let s = poly(pts, fill);
    sides.forEach(([X, Y], i) => {
      if (marks.sides?.[i]) s += seg(X, Y, COL.deep, 8);
    });
    sides.forEach(([X, Y], i) => {
      if (marks.sides?.[i]) s += ticks(X, Y, marks.sides[i]);
    });
    [[A, B, C], [B, C, A], [C, A, B]].forEach(([T, X, Y], i) => {
      if (marks.angles?.[i]) s += arcs(T, X, Y, marks.angles[i]);
    });
    if (names) pts.forEach((p, i) => (s += vLabel(p, cen, names[i])));
    return s;
  }

  const PAIR_MARKS = {
    none: {},
    all: { sides: [1, 2, 3], angles: [1, 2, 3] },
    sas: { sides: [1, 0, 2], angles: [1, 0, 0] },
    asa: { sides: [1, 0, 0], angles: [1, 2, 0] },
    sss: { sides: [1, 2, 3], angles: [0, 0, 0] },
    // AB and the longer BC, with the angle across from BC (at A).
    ssa: { sides: [1, 2, 0], angles: [1, 0, 0] },
  };

  // A stacked fraction drawn in the SVG (labels beside fraction bars).
  const fracLabel = (x, y, n, d, size = 30) =>
    label(x, y - size * 0.62, n, size) + seg(P(x - size * 0.5, y), P(x + size * 0.5, y), "#000", 3.5) + label(x, y + size * 0.62, d, size);

  /* ---------- fractions ---------- */

  // A round pizza cut into n equal slices, k of them colored.
  function pie({ n = 4, k = 1 }) {
    const cx = 110;
    const cy = 110;
    const r = 96;
    if (n === 1) return svg("0 0 220 220", `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${k ? TEAL : SOFT}" stroke="#000" stroke-width="5"/>`);
    const at = (i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      return [f1(cx + r * Math.cos(a)), f1(cy + r * Math.sin(a))];
    };
    let s = "";
    for (let i = 0; i < n; i++) {
      const [x1, y1] = at(i);
      const [x2, y2] = at(i + 1);
      s += `<path d="M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2} Z" fill="${i < k ? TEAL : SOFT}" stroke="#000" stroke-width="5" stroke-linejoin="round"/>`;
    }
    return svg("0 0 220 220", s);
  }

  // Two bars: one cut into parts of different sizes, one into equal parts.
  // Each bar's label sits above it, so the drawing stays narrow on a phone.
  function equal() {
    const bar = (y, cuts, fill) => {
      let s = `<rect x="15" y="${y}" width="270" height="64" rx="10" fill="${fill}" stroke="#000" stroke-width="5"/>`;
      cuts.forEach((x) => (s += `<line x1="${15 + x}" y1="${y}" x2="${15 + x}" y2="${y + 64}" stroke="#000" stroke-width="5"/>`));
      return s;
    };
    const wrong = `<path d="M193 7l24 24M217 7l-24 24" stroke="#c62828" stroke-width="7" stroke-linecap="round"/>`;
    const right = `<path d="M171 141l11 11 21-23" fill="none" stroke="#2e7d32" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`;
    return svg(
      "0 0 300 250",
      wrong +
        label(131, 19, "לא שווים", 26, "#b71c1c") +
        bar(44, [40, 170], SOFT) +
        right +
        label(128, 141, "שווים", 26, "#1b5e20") +
        bar(170, [90, 180], TEAL)
    );
  }

  // Fraction bars of the same length, one under the other: rows [[n, k], ...]
  // — cut into n equal parts, k colored from the right (Hebrew reads right to
  // left), with the fraction on the right.
  function bars({ rows = [[2, 1], [4, 1]] }) {
    const W = 300;
    const H = 58;
    const gap = 34;
    let s = "";
    rows.forEach(([n, k], r) => {
      const y = 14 + r * (H + gap);
      const w = W / n;
      for (let i = 0; i < n; i++) {
        const x = 14 + W - (i + 1) * w;
        s += `<rect x="${f1(x)}" y="${y}" width="${f1(w)}" height="${H}" fill="${i < k ? TEAL : SOFT}" stroke="#000" stroke-width="4.5"/>`;
      }
      s += fracLabel(14 + W + 46, y + H / 2, k, n, 26);
    });
    return svg(`0 0 ${W + 90} ${14 + rows.length * (H + gap) - gap + 14}`, s);
  }

  /* ---------- numbers ---------- */

  // A 10 by 10 grid with k squares colored — k out of 100 (percents).
  function hundred({ k = 50 }) {
    const c = 24;
    let s = "";
    for (let i = 0; i < 100; i++) {
      const row = Math.floor(i / 10);
      const col = i % 10;
      s += `<rect x="${8 + (9 - col) * c}" y="${8 + row * c}" width="${c}" height="${c}" fill="${i < k ? TEAL : SOFT}" stroke="#000" stroke-width="2"/>`;
    }
    s += `<rect x="8" y="8" width="${10 * c}" height="${10 * c}" fill="none" stroke="#000" stroke-width="5"/>`;
    return svg(`0 0 ${16 + 10 * c} ${16 + 10 * c}`, s);
  }

  // g boxes with n balls in each — g times n (multiplication).
  function groups({ g = 3, n = 4 }) {
    const cols = Math.ceil(n / 2);
    const d = 30;
    const w = cols * d + 22;
    const h = (n > 1 ? 2 : 1) * d + 22;
    const gap = 16;
    let s = "";
    for (let b = 0; b < g; b++) {
      const x0 = 8 + (g - 1 - b) * (w + gap);
      s += `<rect x="${x0}" y="8" width="${w}" height="${h}" rx="14" fill="${SOFT}" stroke="#000" stroke-width="4"/>`;
      for (let i = 0; i < n; i++) {
        const cx = x0 + w - 11 - d / 2 - (i % cols) * d;
        const cy = 8 + 11 + d / 2 + Math.floor(i / cols) * d;
        s += `<circle cx="${cx}" cy="${cy}" r="11" fill="${COL.yellow}" stroke="#000" stroke-width="3"/>`;
      }
    }
    return svg(`0 0 ${16 + g * w + (g - 1) * gap} ${h + 16}`, s);
  }

  /* ---------- shapes ---------- */
  const SHAPE_NAMES = { triangle: "משולש", square: "ריבוע", rect: "מלבן", circle: "עיגול" };

  function shapePath(k, x, y, size, fill, w = 5) {
    if (k === "triangle") return poly([P(x + size / 2, y), P(x + size, y + size), P(x, y + size)], fill, w);
    if (k === "square") return `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${fill}" stroke="#000" stroke-width="${w}" stroke-linejoin="round"/>`;
    if (k === "rect") return `<rect x="${x - size * 0.2}" y="${y + size * 0.22}" width="${size * 1.4}" height="${size * 0.78}" fill="${fill}" stroke="#000" stroke-width="${w}" stroke-linejoin="round"/>`;
    return `<circle cx="${x + size / 2}" cy="${y + size / 2}" r="${size / 2}" fill="${fill}" stroke="#000" stroke-width="${w}"/>`;
  }

  // The four shapes in a row (first on the right), names under them; hl
  // colors one.
  function shapes({ hl = "" }) {
    const order = ["triangle", "square", "rect", "circle"];
    const size = 90;
    let s = "";
    order.forEach((k, i) => {
      const x = 30 + (order.length - 1 - i) * 150;
      const fill = !hl || hl === k ? TEAL : SOFT;
      s += `<g${hl && hl !== k ? ' opacity="0.35"' : ""}>${shapePath(k, x, 12, size, fill)}${label(x + size / 2, 138, SHAPE_NAMES[k], 28)}</g>`;
    });
    return svg("0 0 620 160", s);
  }

  // One big shape: its corners as dots (dots) and its sides numbered (sides).
  function shape({ k = "triangle", dots = false, sides = false }) {
    let corners = [];
    let s = "";
    if (k === "triangle") corners = [P(150, 24), P(266, 216), P(34, 216)];
    if (k === "square") corners = [P(60, 30), P(240, 30), P(240, 210), P(60, 210)];
    if (k === "rect") corners = [P(20, 60), P(280, 60), P(280, 200), P(20, 200)];
    if (k === "circle") s += `<circle cx="150" cy="120" r="100" fill="${TEAL}" stroke="#000" stroke-width="6"/>`;
    else s += poly(corners, TEAL, 6);
    const cen = corners.length ? centroid(corners) : P(150, 120);
    if (sides) corners.forEach((p, i) => (s += sLabel(p, corners[(i + 1) % corners.length], cen, String(i + 1), 30)));
    if (k === "square" && sides) corners.forEach((p, i) => (s += ticks(p, corners[(i + 1) % 4], 1)));
    if (dots) corners.forEach((p) => (s += `<circle cx="${p.x}" cy="${p.y}" r="11" fill="${COL.red}" stroke="#000" stroke-width="3.5"/>`));
    return svg("-30 -16 360 272", s);
  }

  // A w by h rectangle of unit squares. mode "area" colors the squares,
  // "perimeter" draws the way around it.
  function area({ w = 4, h = 3, mode = "area" }) {
    const c = 46;
    const x0 = 50;
    const y0 = 12;
    let s = "";
    for (let r = 0; r < h; r++) {
      for (let i = 0; i < w; i++) {
        s += `<rect x="${x0 + i * c}" y="${y0 + r * c}" width="${c}" height="${c}" fill="${mode === "area" ? TEAL : SOFT}" stroke="#000" stroke-width="2.5"/>`;
      }
    }
    s += `<rect x="${x0}" y="${y0}" width="${w * c}" height="${h * c}" fill="none" stroke="${mode === "perimeter" ? COL.orange : "#000"}" stroke-width="${mode === "perimeter" ? 9 : 5}" stroke-linejoin="round"/>`;
    s += label(x0 + (w * c) / 2, y0 + h * c + 26, w, 30) + label(x0 - 24, y0 + (h * c) / 2, h, 30);
    return svg(`0 0 ${x0 + w * c + 20} ${y0 + h * c + 48}`, s);
  }

  /* ---------- grade 8 geometry and ratio ---------- */

  // A right triangle: a, b the legs, c the hypotenuse (hl: in orange),
  // mark: the right angle in yellow with "90°".
  function right(o) {
    const R = P(90, 320);
    const T = P(90, 80);
    const Q = P(410, 320);
    const cen = centroid([R, T, Q]);
    let s = poly([R, T, Q], COL.tq);
    if (o.hl) s += seg(T, Q, COL.orange, 9);
    s += o.mark ? rightMark(R, T, Q, 44, COL.yellow) : rightMark(R, T, Q, 30);
    if (o.mark) s += label(168, 262, "90°", 36);
    if (o.a) s += sLabel(R, T, cen, o.a);
    if (o.b) s += sLabel(R, Q, cen, o.b);
    if (o.c) s += sLabel(T, Q, cen, o.c);
    return svg("0 0 480 380", s);
  }

  // A 5 m ladder against a wall, its foot 3 m away; h: the height label.
  function ladder(o) {
    const F = P(170, 320);
    const B = P(350, 320);
    const W = P(350, 80);
    let s = `<rect x="350" y="40" width="34" height="280" fill="#e5e7eb" stroke="#000" stroke-width="4"/>`;
    s += seg(P(30, 320), P(440, 320), "#000", 5);
    for (let x = 40; x < 440; x += 26) s += seg(P(x, 324), P(x - 14, 340), "#000", 2.5);
    s += rightMark(B, F, W, 28);
    const u = V.unit(V.sub(W, F));
    const off = V.mul(P(-u.y, u.x), 10);
    s += seg(V.add(F, off), V.add(W, off), "#a0522d", 6) + seg(V.sub(F, off), V.sub(W, off), "#a0522d", 6);
    for (let k = 1; k < 9; k++) {
      const c = V.add(F, V.mul(V.sub(W, F), k / 9));
      s += seg(V.add(c, off), V.sub(c, off), "#a0522d", 5);
    }
    s += label(228, 180, "5", 38) + label(262, 296, "3", 38) + label(415, 200, o.h || "?", 38);
    return svg("0 0 460 370", s);
  }

  // An 8 by 6 rectangle and its diagonal d.
  function diag() {
    const A = P(50, 310);
    const B = P(410, 310);
    const C = P(410, 50);
    const D = P(50, 50);
    let s = poly([A, B, C, D], SOFT);
    s += poly([A, B, C], COL.tq);
    s += seg(A, C, COL.orange, 9);
    s += rightMark(B, A, C, 28);
    s += label(230, 342, "8", 38) + label(440, 180, "6", 38) + label(205, 152, "d", 38);
    return svg("0 0 470 370", s);
  }

  // Two triangles ABC and DEF; marks: which equal parts are marked.
  function pair(o) {
    const marks = PAIR_MARKS[o.marks || "none"];
    const t1 = [P(60, 290), P(260, 290), P(110, 80)];
    const t2 = t1.map((p) => P(p.x + 310, p.y));
    return svg("0 0 640 340", markedTri(t1, ["A", "B", "C"], COL.tq, marks) + markedTri(t2, ["D", "E", "F"], COL.yl, marks));
  }

  // A small and a big triangle with the same angles.
  function aaa() {
    const small = [P(50, 300), P(200, 300), P(90, 160)];
    const big = small.map((p) => P(290 + (p.x - 50) * 1.6, 300 - (300 - p.y) * 1.6));
    const marks = { angles: [1, 2, 3] };
    return svg("0 0 560 330", markedTri(small, null, COL.tq, marks) + markedTri(big, null, COL.yl, marks));
  }

  // A kite ABCD split by AC; marks: the equal sides, angles: B and D.
  function kite(o) {
    const A = P(240, 40);
    const B = P(90, 160);
    const C = P(240, 380);
    const D = P(390, 160);
    let s = poly([A, B, C], COL.tq) + poly([A, D, C], COL.yl);
    s += seg(A, C, COL.orange, 8);
    if (o.marks) s += ticks(A, B, 1) + ticks(A, D, 1) + ticks(C, B, 2) + ticks(C, D, 2);
    if (o.angles) s += arcs(B, A, C, 1, 36) + arcs(D, A, C, 1, 36);
    const cen = P(240, 200);
    [[A, "A"], [B, "B"], [C, "C"], [D, "D"]].forEach(([p, n]) => (s += vLabel(p, cen, n, 30)));
    return svg("0 0 480 420", s);
  }

  // Two lines crossing at C — the angles across from each other.
  function bowtie() {
    const A = P(60, 60);
    const B = P(60, 300);
    const C = P(240, 180);
    const D = P(420, 300);
    const E = P(420, 60);
    let s = poly([A, B, C], COL.tq) + poly([D, E, C], COL.yl);
    s += arcs(C, A, B, 1, 44) + arcs(C, D, E, 1, 44);
    s += vLabel(A, C, "A", 28) + vLabel(B, C, "B", 28) + vLabel(D, C, "D", 28) + vLabel(E, C, "E", 28);
    s += label(240, 140, "C", 34);
    return svg("0 0 480 360", s);
  }

  // Scales: x and 2 balls on one side, 5 balls on the other (x + 2 = 5).
  function balance() {
    let s = poly([P(196, 330), P(264, 330), P(230, 286)], "#e5e7eb", 4);
    s += seg(P(230, 300), P(230, 112), "#000", 7);
    s += seg(P(70, 110), P(390, 110), "#000", 8);
    s += `<circle cx="230" cy="110" r="11" fill="${COL.yellow}" stroke="#000" stroke-width="4"/>`;
    [110, 350].forEach((x) => {
      s += seg(P(x, 110), P(x - 52, 204), "#000", 3) + seg(P(x, 110), P(x + 52, 204), "#000", 3);
      s += `<path d="M${x - 62} 204 Q${x} 250 ${x + 62} 204 Z" fill="${SOFT}" stroke="#000" stroke-width="4"/>`;
    });
    s += `<rect x="62" y="152" width="48" height="48" rx="6" fill="${COL.tq}" stroke="#000" stroke-width="4"/>` + label(86, 176, "x", 34);
    const ball = (x, y) => `<circle cx="${x}" cy="${y}" r="12" fill="${COL.yellow}" stroke="#000" stroke-width="3"/>`;
    s += ball(130, 188) + ball(156, 188);
    s += ball(322, 188) + ball(348, 188) + ball(374, 188) + ball(335, 164) + ball(361, 164);
    return svg("0 0 460 345", s);
  }

  // a blue balls over b yellow balls (a ratio).
  function balls(o) {
    const row = (n, y, fill) => {
      let s = "";
      const gap = 84;
      const x0 = 210 - ((n - 1) * gap) / 2;
      for (let i = 0; i < n; i++) s += `<circle cx="${x0 + i * gap}" cy="${y}" r="32" fill="${fill}" stroke="#000" stroke-width="4"/>`;
      return s;
    };
    return svg("0 0 420 250", row(o.a, 70, COL.blue) + row(o.b, 180, COL.yellow));
  }

  // 20 candies shared in the ratio a : b — the parts, each showing `each`.
  function parts(o) {
    const box = 88;
    const row = (name, n, y, fill) => {
      let s = label(495, y + 34, name, 34);
      for (let i = 0; i < n; i++) {
        const x = 430 - (i + 1) * box;
        s += `<rect x="${x}" y="${y}" width="${box}" height="68" fill="${fill}" stroke="#000" stroke-width="4"/>` + label(x + box / 2, y + 34, o.each, 36);
      }
      return s;
    };
    return svg("0 0 560 250", row("יוסי", o.a, 20, COL.tq) + row("דני", o.b, 120, COL.yl) + label(280, 225, "ביחד 20 סוכריות", 28));
  }

  // a/b = c/d with the two crossed products.
  function cross(o) {
    let s = seg(P(150, 66), P(292, 178), COL.orange, 6, 'opacity="0.85"') + seg(P(150, 178), P(292, 66), COL.deep, 6, 'opacity="0.85"');
    const t = (x, y, v) =>
      `<text x="${x}" y="${y}" font-size="66" font-weight="800" text-anchor="middle" dominant-baseline="central" direction="ltr" stroke="#fff" stroke-width="12" paint-order="stroke">${esc(v)}</text>`;
    s += t(118, 64, o.a) + seg(P(84, 122), P(152, 122), "#000", 6) + t(118, 180, o.b);
    s += t(222, 122, "=");
    s += t(326, 64, o.c) + seg(P(292, 122), P(360, 122), "#000", 6) + t(326, 180, o.d);
    return svg("0 0 440 250", s);
  }

  // A map with two towns 5 cm apart and its scale.
  function scalemap() {
    let s = `<rect x="20" y="20" width="420" height="300" rx="20" fill="#dff5d8" stroke="#000" stroke-width="4"/>`;
    s += `<path d="M20 78 C110 30 170 120 260 74 S390 40 440 70" fill="none" stroke="${COL.blue}" stroke-width="12" stroke-linecap="round"/>`;
    const A = P(95, 175);
    const B = P(355, 205);
    s += seg(A, B, "#000", 4, 'stroke-dasharray="12 10"');
    [A, B].forEach((p) => (s += `<circle cx="${p.x}" cy="${p.y}" r="15" fill="${COL.red}" stroke="#000" stroke-width="4"/>`));
    s += label(95, 140, "עיר א׳", 30) + label(355, 170, "עיר ב׳", 30) + label(225, 222, "5 ס״מ", 30);
    s += `<rect x="250" y="258" width="172" height="44" rx="10" fill="${SOFT}" stroke="#000" stroke-width="3"/>` + label(336, 280, "1 : 100,000", 28);
    return svg("0 0 460 340", s);
  }

  /* ---------- science ---------- */

  // A flower in the ground. hl: the part the slide is about (the rest is
  // faded); labels: name all four parts.
  function plant({ hl = "", labels = false }) {
    const fade = (part) => (hl && hl !== part ? ' opacity="0.3"' : "");
    const ring = (part) => (hl === part ? 7 : 4);
    const ground = `<rect x="10" y="232" width="280" height="96" rx="12" fill="#d7b48a" stroke="#000" stroke-width="4"/>`;
    const roots = `<g${fade("roots")} fill="none" stroke="#8d5a2b" stroke-width="${ring("roots") + 2}" stroke-linecap="round">
      <path d="M150 232 L150 296"/><path d="M150 252 Q126 268 112 298"/><path d="M150 252 Q174 268 188 298"/>
      <path d="M150 276 Q134 290 128 314"/><path d="M150 276 Q166 290 172 314"/></g>`;
    const stem = `<path${fade("stem")} d="M150 236 L150 96" stroke="#2e7d32" stroke-width="${hl === "stem" ? 14 : 10}" stroke-linecap="round"/>`;
    const leaf = (cx, cy, rot) =>
      `<ellipse cx="${cx}" cy="${cy}" rx="40" ry="15" transform="rotate(${rot} ${cx} ${cy})" fill="#4caf50" stroke="#000" stroke-width="${ring("leaves")}"/>`;
    const leaves = `<g${fade("leaves")}>${leaf(114, 180, 28)}${leaf(186, 146, -28)}</g>`;
    let petals = "";
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      petals += `<circle cx="${f1(150 + 24 * Math.cos(a))}" cy="${f1(76 + 24 * Math.sin(a))}" r="17" fill="#ff8fb1" stroke="#000" stroke-width="${ring("flower")}"/>`;
    }
    const flower = `<g${fade("flower")}>${petals}<circle cx="150" cy="76" r="15" fill="#ffe135" stroke="#000" stroke-width="${ring("flower")}"/></g>`;
    let names = "";
    if (labels) {
      const tag = (x1, y1, x2, y2, t, ty) =>
        `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#000" stroke-width="3"/>` + label(348, ty, t, 30);
      names =
        tag(194, 70, 290, 70, "פרח", 70) +
        tag(222, 140, 290, 140, "עלים", 140) +
        tag(156, 206, 290, 206, "גבעול", 206) +
        tag(190, 290, 290, 290, "שורשים", 290);
    }
    return svg(labels ? "0 0 400 336" : "0 0 300 336", ground + roots + stem + leaves + flower + names);
  }

  // From seed to plant in four steps, the first on the right; hl: the step
  // the slide is about (1–4), the others faded.
  function growth({ hl = 0 }) {
    const G = 150;
    let s = `<rect x="6" y="${G}" width="588" height="86" rx="12" fill="#d7b48a" stroke="#000" stroke-width="4"/>`;
    const seed = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="17" ry="11" fill="#c47f2c" stroke="#000" stroke-width="3.5"/>`;
    const root = (x, len) => `<path d="M${x} ${G + 24} Q${x - 8} ${G + 24 + len / 2} ${x + 2} ${G + 24 + len}" fill="none" stroke="#8d5a2b" stroke-width="5" stroke-linecap="round"/>`;
    const stem = (x, top) => `<path d="M${x} ${G + 16} L${x} ${top}" stroke="#2e7d32" stroke-width="7" stroke-linecap="round"/>`;
    const leaf = (cx, cy, rot, r = 22) =>
      `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r * 0.42}" transform="rotate(${rot} ${cx} ${cy})" fill="#4caf50" stroke="#000" stroke-width="3.5"/>`;
    const steps = [
      (x) => seed(x, G + 30),
      (x) => seed(x, G + 24) + root(x, 44),
      (x) => root(x, 50) + stem(x, G - 46) + leaf(x - 18, G - 44, 25, 18) + leaf(x + 18, G - 50, -25, 18) + seed(x, G + 22),
      (x) => root(x, 56) + stem(x, G - 118) + leaf(x - 26, G - 40, 28) + leaf(x + 26, G - 70, -28) + leaf(x - 26, G - 100, 28) + leaf(x + 24, G - 122, -20),
    ];
    steps.forEach((draw, i) => {
      const x = 525 - i * 150;
      s += `<g${hl && hl !== i + 1 ? ' opacity="0.3"' : ""}>${draw(x)}</g>`;
      if (i < 3) s += `<path d="M${x - 50} 70 L${x - 100} 70 M${x - 88} 58 L${x - 100} 70 L${x - 88} 82" fill="none" stroke="#000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
    });
    return svg("0 0 600 244", s);
  }

  // A battery, wires and a bulb. closed: the switch is closed and the bulb
  // lights; item: a thing put in the gap instead of the switch (lit says if
  // it lets the electricity through).
  function circuit({ closed = false, item = "", lit }) {
    const on = lit ?? closed;
    const L = 50;
    const R = 300;
    const T = 70;
    const B = 230;
    let s = "";
    const wire = (pts) => `<polyline points="${pts.map(([x, y]) => `${x},${y}`).join(" ")}" fill="none" stroke="#000" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>`;
    s += wire([[L, 125], [L, T], [155, T]]) + wire([[195, T], [R, T], [R, B], [220, B]]) + wire([[140, B], [L, B], [L, 185]]);
    // The battery, upright on the left wire.
    s += `<rect x="${L - 22}" y="122" width="44" height="66" rx="6" fill="${COL.yellow}" stroke="#000" stroke-width="4"/>`;
    s += `<rect x="${L - 9}" y="113" width="18" height="10" rx="2" fill="#9ca3af" stroke="#000" stroke-width="3"/>`;
    s += label(L, 138, "+", 26) + label(L, 172, "−", 26);
    // The bulb on the top wire.
    if (on) {
      for (let i = 0; i < 7; i++) {
        const a = Math.PI + (i * Math.PI) / 6;
        s += seg(P(175 + 36 * Math.cos(a), 34 + 36 * Math.sin(a)), P(175 + 50 * Math.cos(a), 34 + 50 * Math.sin(a)), COL.orange, 5);
      }
    }
    s += `<circle cx="175" cy="34" r="27" fill="${on ? COL.yellow : SOFT}" stroke="#000" stroke-width="4"/>`;
    s += `<path d="M166 52 L170 30 L175 40 L180 30 L184 52" fill="none" stroke="#000" stroke-width="3" stroke-linejoin="round"/>`;
    s += `<rect x="158" y="56" width="34" height="24" rx="4" fill="#9ca3af" stroke="#000" stroke-width="4"/>`;
    // The bottom gap: a switch or the thing being tested.
    s += `<circle cx="140" cy="${B}" r="8" fill="#000"/><circle cx="220" cy="${B}" r="8" fill="#000"/>`;
    if (item) {
      s += `<rect x="146" y="${B - 22}" width="68" height="44" rx="10" fill="${COL.tq}" stroke="#000" stroke-width="4"/>` + label(180, B, item, 22);
    } else if (closed) {
      s += seg(P(140, B), P(220, B), "#000", 7);
    } else {
      s += seg(P(140, B), P(208, B - 44), "#000", 7);
    }
    return svg("0 0 350 262", s);
  }

  /* ---------- geography and history ---------- */

  // The Land of Israel, simplified: the outline from lon/lat points, the
  // seas, the Kinneret and the Jordan. show: "regions" (north / center /
  // south bands, hl colors one), "water" (names the seas and the river) or
  // "cities" (dots and names; hl marks one).
  const IL = [
    [35.105, 33.093], [35.2, 33.08], [35.37, 33.06], [35.5, 33.09], [35.57, 33.28], [35.63, 33.25], [35.8, 33.33], [35.86, 33.2],
    [35.88, 33.05], [35.93, 32.9], [35.8, 32.72], [35.65, 32.68], [35.57, 32.55], [35.55, 32.3], [35.53, 32.05], [35.55, 31.78],
    [35.53, 31.5], [35.47, 31.2], [35.4, 31.05], [35.3, 30.8], [35.18, 30.4], [35.05, 29.95], [34.97, 29.55], [34.9, 29.49],
    [34.75, 29.95], [34.6, 30.35], [34.5, 30.65], [34.4, 30.95], [34.27, 31.22], [34.22, 31.3], [34.38, 31.47], [34.55, 31.67],
    [34.64, 31.8], [34.73, 32.0], [34.77, 32.08], [34.82, 32.25], [34.85, 32.33], [34.89, 32.5], [34.92, 32.65], [34.955, 32.83],
    [35.04, 32.82], [35.07, 32.92], [35.1, 33.0],
  ];
  const ilX = (lon) => f1((lon - 34.15) * 68.2 + 100);
  const ilY = (lat) => f1((33.4 - lat) * 80 + 10);
  const ilPts = (pts) => pts.map(([lon, lat]) => `${ilX(lon)},${ilY(lat)}`).join(" ");
  // [name, lon, lat, label offset] — offsets keep names off the lakes.
  const IL_CITIES = {
    jerusalem: ["ירושלים", 35.21, 31.78, 74],
    telaviv: ["תל אביב", 34.78, 32.08, -54],
    haifa: ["חיפה", 34.99, 32.79, -42],
    beersheva: ["באר שבע", 34.79, 31.25, -60],
    eilat: ["אילת", 34.95, 29.56, 42],
    tiberias: ["טבריה", 35.53, 32.79, 54],
  };
  // North of 32.35 and south of 31.6 (lat): the three bands' edges.
  const IL_BANDS = { north: [0, ilY(32.35)], center: [ilY(32.35), ilY(31.6)], south: [ilY(31.6), 340] };

  function israel({ show = "regions", hl = "" }) {
    const outline = ilPts(IL);
    // The Mediterranean: from the left edge to the coast, on north past Rosh
    // HaNikra and on south-west past Gaza along Sinai.
    const coast = IL.slice(29).concat([IL[0]]).reverse();
    let s = `<polygon points="0,0 ${ilX(35.2)},0 ${ilPts(coast)} ${ilX(33.9)},${ilY(31.1)} 0,${ilY(31.05)}" fill="${COL.sea}"/>`;
    s += `<polygon points="${ilPts([[34.9, 29.49], [34.97, 29.55], [35.02, 29.38], [34.86, 29.36]])}" fill="${COL.sea}" stroke="#000" stroke-width="2"/>`;
    s += `<defs><clipPath id="il-clip"><polygon points="${outline}"/></clipPath></defs>`;
    s += `<polygon points="${outline}" fill="#dff5d8"/>`;
    if (show === "regions") {
      Object.entries(IL_BANDS).forEach(([band, [y1, y2]]) => {
        const fill = hl === band || !hl ? (band === "north" ? "#b9f0c9" : band === "center" ? TEAL : COL.yl) : "#eef2f0";
        s += `<rect x="0" y="${y1}" width="345" height="${y2 - y1}" fill="${fill}" clip-path="url(#il-clip)"/>`;
      });
      [IL_BANDS.center[0], IL_BANDS.south[0]].forEach((y) => (s += `<line x1="0" y1="${y}" x2="345" y2="${y}" stroke="#000" stroke-width="3" stroke-dasharray="8 6" clip-path="url(#il-clip)"/>`));
    }
    s += `<polygon points="${outline}" fill="none" stroke="#000" stroke-width="4" stroke-linejoin="round"/>`;
    // The Jordan (from the north to the Kinneret and on to the Dead Sea),
    // the Kinneret and the Dead Sea — drawn bigger than life so they show.
    const jordanHl = hl === "jordan";
    s += `<polyline points="${ilPts([[35.63, 33.24], [35.61, 33.05], [35.6, 32.9]])}" fill="none" stroke="${COL.blue}" stroke-width="${jordanHl ? 6 : 4}" stroke-linecap="round"/>`;
    s += `<polyline points="${ilPts([[35.57, 32.72], [35.555, 32.5], [35.545, 32.25], [35.53, 32.0], [35.54, 31.8]])}" fill="none" stroke="${COL.blue}" stroke-width="${jordanHl ? 6 : 4}" stroke-linecap="round"/>`;
    const lake = (lon, lat, rx, ry, id) =>
      `<ellipse cx="${ilX(lon)}" cy="${ilY(lat)}" rx="${rx}" ry="${ry}" fill="${COL.blue}" stroke="#000" stroke-width="${hl === id ? 4 : 2.5}"/>`;
    s += lake(35.59, 32.82, 7, 11, "kinneret") + lake(35.5, 31.48, 7, 27, "deadsea");
    if (show === "regions") {
      s += label(282, (IL_BANDS.north[0] + IL_BANDS.north[1]) / 2 + 14, "צפון", 26);
      s += label(282, (IL_BANDS.center[0] + IL_BANDS.center[1]) / 2, "מרכז", 26);
      s += label(282, 240, "דרום", 26);
      s += label(52, 150, "הים", 22) + label(52, 174, "התיכון", 22);
    }
    if (show === "water") {
      const tag = (lon, lat, tx, ty, t, id) => {
        const bold = hl === id;
        return seg(P(ilX(lon), ilY(lat)), P(tx - 46, ty), "#000", bold ? 3.5 : 2.5) + label(tx, ty, t, bold ? 26 : 22, bold ? "#00695c" : "#000");
      };
      s += label(52, 150, "הים", 24, hl === "sea" ? "#00695c" : "#000") + label(52, 176, "התיכון", 24, hl === "sea" ? "#00695c" : "#000");
      s += tag(35.6, 32.82, 292, 52, "הכנרת", "kinneret");
      s += tag(35.555, 32.4, 292, 96, "הירדן", "jordan");
      s += tag(35.52, 31.48, 292, 160, "ים המלח", "deadsea");
      s += tag(34.95, 29.43, 280, 318, "ים סוף", "redsea");
    }
    if (show === "cities") {
      Object.entries(IL_CITIES).forEach(([id, [name, lon, lat, dx]]) => {
        const x = ilX(lon);
        const y = ilY(lat);
        const big = hl === id;
        s += `<circle cx="${x}" cy="${y}" r="${big ? 9 : 6}" fill="${big ? COL.red : "#000"}" stroke="#000" stroke-width="2"/>`;
        s += label(x + dx, y, name, big ? 25 : 21, big ? "#b71c1c" : "#000");
      });
    }
    return svg("0 0 345 340", s);
  }
  // A tall drawing: it sits beside the slide's lines instead of under them.
  israel.tall = true;

  // Events in order down a line, the first on top, each name to the left of
  // its dot; hl: the one the slide is about (1-based). Upright, so it stays
  // readable on a phone and sits beside the text on a wide slide.
  function timeline({ items = [], hl = 0 }) {
    const step = 62;
    const x = 262;
    const H = (items.length - 1) * step + 64;
    let s = seg(P(x, 14), P(x, H - 14), "#000", 5);
    items.forEach((t, i) => {
      const y = 32 + i * step;
      const on = hl === i + 1;
      s += `<circle cx="${x}" cy="${y}" r="${on ? 15 : 11}" fill="${on ? COL.red : TEAL}" stroke="#000" stroke-width="4"/>`;
      // A Hebrew name alone reads right to left either way; "end" puts its
      // right edge next to the dot.
      s += `<text x="${x - 28}" y="${y}" font-size="${on ? 31 : 28}" font-weight="800" fill="${on ? "#b71c1c" : "#000"}" text-anchor="end" dominant-baseline="central" direction="ltr">${esc(t)}</text>`;
    });
    return svg(`0 0 300 ${H}`, s);
  }
  timeline.tall = true;

  window.LESSON_FIGURES = {
    pie, equal, bars, hundred, groups, shapes, shape, area,
    right, ladder, diag, pair, aaa, kite, bowtie, balance, balls, parts, cross, scalemap,
    plant, growth, circuit, israel, timeline,
  };
})();
