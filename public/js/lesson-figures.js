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
    // ang: the sharp angle at the bottom right, marked and named.
    if (o.ang) s += arcs(Q, R, T, 1, 56) + label(Q.x - 92, Q.y - 22, o.ang, 34, "#b71c1c");
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

  /* ---------- numbers on a line, circles, chance and graphs ---------- */

  // A number shown in a drawing: a real minus, no float noise (0.30000004).
  const num = (v) => {
    const r = Math.round(v * 1000) / 1000;
    return r < 0 ? `−${-r}` : String(r);
  };
  const arrowHead = (tip, from, color = "#000", size = 14) => {
    const u = V.unit(V.sub(tip, from));
    const n = P(-u.y, u.x);
    const back = V.sub(tip, V.mul(u, size));
    return poly([tip, V.add(back, V.mul(n, size * 0.6)), V.sub(back, V.mul(n, size * 0.6))], color, 2);
  };

  // A number line from `from` to `to` in steps of `step` (left to right, as
  // in math). labels: the values to name (all when left out); hl: values
  // marked with a red dot; jump: [a, b] — an arrow from a to b over the line.
  // ray: { at, dir, open } — the numbers from `at` on, to the right (dir 1) or
  // to the left (dir -1); open: `at` itself is not one of them. size: of the
  // numbers, for a line with few of them.
  function numline({ from = -5, to = 5, step = 1, labels, hl = [], jump, ray, size = 26 }) {
    const n = Math.round((to - from) / step);
    const u = Math.min(60, 600 / n);
    const x0 = 44;
    const y = 104;
    const W = x0 * 2 + n * u;
    const at = (v) => x0 + ((v - from) / step) * u;
    const same = (a, b) => Math.abs(a - b) < step / 100;
    let s = seg(P(x0 - 26, y), P(W - x0 + 26, y), "#000", 5);
    s += arrowHead(P(W - x0 + 34, y), P(0, y)) + arrowHead(P(x0 - 34, y), P(W, y));
    for (let k = 0; k <= n; k++) {
      const v = from + k * step;
      const x = at(v);
      const zero = same(v, 0);
      s += seg(P(x, y - 13), P(x, y + 13), "#000", zero ? 6 : 4);
      if (!labels || labels.some((l) => same(l, v))) s += label(x, y + Math.round(22 + size * 0.7), num(v), size, zero ? COL.deep : "#000");
    }
    if (jump) {
      const [a, b] = jump.map(at);
      const h = Math.min(74, Math.abs(b - a) * 0.45 + 24);
      const tip = P(b, y - 16);
      const c = P((a + b) / 2, y - 16 - h * 2);
      s += `<path d="M${f1(a)} ${y - 16} Q${f1(c.x)} ${f1(c.y)} ${f1(b)} ${y - 30}" fill="none" stroke="${COL.orange}" stroke-width="6" stroke-linecap="round"/>`;
      s += arrowHead(tip, P(b - Math.sign(b - a) * 6, y - 40), COL.orange, 16);
    }
    if (ray) {
      const end = ray.dir > 0 ? W - x0 + 26 : x0 - 26;
      s += seg(P(at(ray.at), y), P(end, y), COL.orange, 11);
      s += arrowHead(P(end + ray.dir * 12, y), P(at(ray.at), y), COL.orange, 20);
      s += `<circle cx="${f1(at(ray.at))}" cy="${y}" r="12" fill="${ray.open ? SOFT : COL.orange}" stroke="#000" stroke-width="4.5"/>`;
    }
    hl.forEach((v) => (s += `<circle cx="${f1(at(v))}" cy="${y}" r="11" fill="${COL.red}" stroke="#000" stroke-width="3.5"/>`));
    return svg(jump ? `0 0 ${f1(W)} 160` : `0 64 ${f1(W)} ${Math.round(65 + size * 1.2)}`, s);
  }

  // A thermometer from min to max degrees, filled up to t; 0 is marked.
  function thermo({ t = 0, min = -10, max = 30 }) {
    const top = 34;
    const bottom = 300;
    const yOf = (v) => bottom - ((v - min) / (max - min)) * (bottom - top);
    let s = `<rect x="66" y="${top - 18}" width="40" height="${bottom - top + 50}" rx="20" fill="${SOFT}" stroke="#000" stroke-width="5"/>`;
    s += `<rect x="76" y="${f1(yOf(t))}" width="20" height="${f1(bottom + 30 - yOf(t))}" fill="${COL.red}"/>`;
    s += `<circle cx="86" cy="${bottom + 44}" r="32" fill="${COL.red}" stroke="#000" stroke-width="5"/>`;
    for (let v = min; v <= max; v += 10) {
      const yy = yOf(v);
      s += seg(P(110, yy), P(v === 0 ? 140 : 128, yy), "#000", v === 0 ? 6 : 4);
      s += label(170, yy, num(v), 28, v === 0 ? COL.deep : "#000");
    }
    s += seg(P(54, yOf(t)), P(76, yOf(t)), COL.orange, 6) + label(28, yOf(t), num(t), 26, "#b71c1c");
    return svg("0 0 210 390", s);
  }
  thermo.tall = true;

  // A circle: show "center", "radius", "diameter", "perimeter" or "area".
  function circle({ show = "center", r = "r", d = "d" }) {
    const C = P(150, 140);
    const R = 112;
    const fill = show === "area" ? TEAL : SOFT;
    let s = `<circle cx="${C.x}" cy="${C.y}" r="${R}" fill="${fill}" stroke="${show === "perimeter" ? COL.orange : "#000"}" stroke-width="${show === "perimeter" ? 11 : 5}"/>`;
    if (show === "radius" || show === "perimeter" || show === "area") {
      s += seg(C, P(C.x + R, C.y), COL.deep, 7) + label(C.x + R / 2, C.y - 22, r, 32, COL.deep);
    }
    if (show === "diameter") s += seg(P(C.x - R, C.y), P(C.x + R, C.y), COL.deep, 7) + label(C.x + 48, C.y - 22, d, 32, COL.deep);
    s += `<circle cx="${C.x}" cy="${C.y}" r="8" fill="#000"/>`;
    return svg("0 0 300 280", s);
  }

  // The six faces of a die, 1–3 on top and 4–6 under them; hl: the faces
  // the slide counts.
  const PIPS = {
    1: [[1, 1]],
    2: [[0, 0], [2, 2]],
    3: [[0, 0], [1, 1], [2, 2]],
    4: [[0, 0], [2, 0], [0, 2], [2, 2]],
    5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]],
    6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]],
  };
  function dice({ hl = [] }) {
    const size = 92;
    const gap = 22;
    let s = "";
    for (let f = 1; f <= 6; f++) {
      const x = 8 + ((f - 1) % 3) * (size + gap);
      const y = 8 + Math.floor((f - 1) / 3) * (size + gap);
      s += `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="16" fill="${hl.includes(f) ? TEAL : SOFT}" stroke="#000" stroke-width="5"/>`;
      PIPS[f].forEach(([c, r]) => (s += `<circle cx="${x + 22 + c * 24}" cy="${y + 22 + r * 24}" r="8.5" fill="#000"/>`));
    }
    return svg(`0 0 ${16 + 3 * size + 2 * gap} ${16 + 2 * size + gap}`, s);
  }

  // Axes with a grid from min to max on both; points: [[x, y, name], ...];
  // walk: dashed steps from the origin to the first point (right, then up).
  // line: [[x1, y1], [x2, y2]] — a straight line through the points (a
  // linear function's graph), drawn under them.
  function axes({ min = 0, max = 6, points = [], walk = false, line, line2, parab }) {
    const n = max - min;
    const u = Math.min(52, 330 / n);
    const pad = 46;
    const X = (v) => pad + (v - min) * u;
    const Y = (v) => pad + (max - v) * u;
    let s = "";
    for (let v = min; v <= max; v++) {
      s += seg(P(X(v), Y(min)), P(X(v), Y(max)), "#c7d2dc", 2) + seg(P(X(min), Y(v)), P(X(max), Y(v)), "#c7d2dc", 2);
    }
    s += seg(P(X(min) - 8, Y(0)), P(X(max) + 14, Y(0)), "#000", 5) + arrowHead(P(X(max) + 24, Y(0)), P(0, Y(0)));
    s += seg(P(X(0), Y(min) + 8), P(X(0), Y(max) - 14), "#000", 5) + arrowHead(P(X(0), Y(max) - 24), P(X(0), Y(0)));
    s += label(X(max) + 26, Y(0) + 26, "x", 28) + label(X(0) - 24, Y(max) - 22, "y", 28);
    for (let v = min; v <= max; v++) {
      if (v === 0) continue;
      s += label(X(v), Y(0) + 22, num(v), 20) + label(X(0) - 18, Y(v), num(v), 20);
    }
    s += label(X(0) - 16, Y(0) + 20, "0", 20);
    if (walk && points[0]) {
      const [px, py] = points[0];
      const dash = 'stroke-dasharray="10 8"';
      s += seg(P(X(0), Y(0)), P(X(px), Y(0)), COL.orange, 6, dash) + seg(P(X(px), Y(0)), P(X(px), Y(py)), COL.orange, 6, dash);
    }
    if (line) s += seg(P(X(line[0][0]), Y(line[0][1])), P(X(line[1][0]), Y(line[1][1])), COL.deep, 6);
    if (line2) s += seg(P(X(line2[0][0]), Y(line2[0][1])), P(X(line2[1][0]), Y(line2[1][1])), COL.orange, 6);
    // parab: [a, p, q] – the parabola y = a(x - p)² + q, cut at the grid.
    if (parab) {
      const [a, p, q] = parab;
      const pts = [];
      for (let x = min; x <= max + 1e-9; x += 0.05) {
        const y = a * (x - p) ** 2 + q;
        if (y >= min - 0.05 && y <= max + 0.05) pts.push(`${f1(X(x))},${f1(Y(y))}`);
      }
      s += `<polyline points="${pts.join(" ")}" fill="none" stroke="${COL.deep}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>`;
    }
    points.forEach(([px, py, name]) => {
      s += `<circle cx="${f1(X(px))}" cy="${f1(Y(py))}" r="9" fill="${COL.red}" stroke="#000" stroke-width="3"/>`;
      if (name) s += label(X(px) + (px < max - 1 ? 20 : -20), Y(py) - 22, name, 26, "#b71c1c");
    });
    return svg(`0 0 ${f1(2 * pad + n * u + 20)} ${f1(2 * pad + n * u)}`, s);
  }

  // A value scale on the left of a chart: lines and numbers every `step`.
  function scale(x1, x2, base, top, max, step) {
    let s = "";
    for (let v = 0; v <= max; v += step) {
      const y = base - (v / max) * (base - top);
      s += seg(P(x1, y), P(x2, y), "#c7d2dc", 2) + label(x1 - 22, y, num(v), 20);
    }
    return s;
  }

  // Bars for [[name, value], ...], the first on the right; hl: the index of
  // the bar being read (a dashed line from its top to the scale).
  function bargraph({ data = [], hl = -1, max = 10, step = 2 }) {
    const bw = 64;
    const gap = 30;
    const left = 56;
    const base = 230;
    const top = 20;
    const W = left + data.length * (bw + gap) + 10;
    let s = scale(left, W - 6, base, top, max, step);
    data.forEach(([name, v], i) => {
      const x = W - 16 - (i + 1) * (bw + gap) + gap;
      const y = base - (v / max) * (base - top);
      s += `<rect x="${x}" y="${f1(y)}" width="${bw}" height="${f1(base - y)}" fill="${i === hl ? COL.orange : TEAL}" stroke="#000" stroke-width="4"/>`;
      s += label(x + bw / 2, base + 26, name, 22);
      if (i === hl) s += seg(P(left, y), P(x, y), COL.orange, 4, 'stroke-dasharray="9 7"');
    });
    s += seg(P(left, top - 6), P(left, base), "#000", 4) + seg(P(left, base), P(W - 6, base), "#000", 4);
    return svg(`0 0 ${W} ${base + 46}`, s);
  }

  // A line through [[time, value], ...], time going right; hl: the index of
  // the point being read (dashed lines to both axes).
  function linegraph({ data = [], hl = -1, max = 30, step = 5 }) {
    const left = 56;
    const base = 230;
    const top = 20;
    const dx = 90;
    const W = left + 40 + (data.length - 1) * dx + 40;
    const pt = (i) => P(left + 40 + i * dx, base - (data[i][1] / max) * (base - top));
    let s = scale(left, W - 6, base, top, max, step);
    s += `<polyline points="${data.map((_, i) => `${f1(pt(i).x)},${f1(pt(i).y)}`).join(" ")}" fill="none" stroke="${COL.blue}" stroke-width="6" stroke-linejoin="round"/>`;
    data.forEach(([time], i) => {
      const p = pt(i);
      if (i === hl) {
        const dash = 'stroke-dasharray="9 7"';
        s += seg(P(left, p.y), p, COL.orange, 4, dash) + seg(p, P(p.x, base), COL.orange, 4, dash);
      }
      s += `<circle cx="${f1(p.x)}" cy="${f1(p.y)}" r="${i === hl ? 11 : 8}" fill="${i === hl ? COL.red : COL.yellow}" stroke="#000" stroke-width="3"/>`;
      s += label(p.x, base + 26, time, 22);
    });
    s += seg(P(left, top - 6), P(left, base), "#000", 4) + seg(P(left, base), P(W - 6, base), "#000", 4);
    return svg(`0 0 ${W} ${base + 46}`, s);
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

  // A label with a white halo, readable on top of a colored drawing.
  const haloLabel = (x, y, t, size = 24, color = "#000") =>
    label(x, y, t, size, color).replace("<text ", '<text stroke="#fff" stroke-width="6" paint-order="stroke" stroke-linejoin="round" ');

  // Particles of a solid, a liquid and a gas in three boxes, the solid on
  // the right; hl: "solid", "liquid" or "gas" (the others are faded).
  const LIQUID = [[18, 148], [40, 146], [62, 149], [84, 147], [106, 148], [124, 146], [28, 126], [50, 124], [74, 128], [96, 125], [118, 127], [16, 105], [40, 104], [66, 106], [90, 102], [112, 108]];
  const GAS = [[25, 40], [100, 52], [60, 86], [118, 112], [30, 132], [84, 148]];
  function states({ hl = "" }) {
    const boxes = [["solid", "מוצק", 420], ["liquid", "נוזל", 220], ["gas", "גז", 20]];
    let s = "";
    boxes.forEach(([id, name, x]) => {
      let dots = [];
      if (id === "solid") for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) dots.push([22 + c * 24, 44 + r * 24]);
      if (id === "liquid") dots = LIQUID;
      if (id === "gas") dots = GAS;
      let g = `<rect x="${x}" y="20" width="140" height="146" rx="12" fill="${SOFT}" stroke="#000" stroke-width="5"/>`;
      dots.forEach(([dx, dy]) => (g += `<circle cx="${x + dx}" cy="${dy + 4}" r="10.5" fill="${COL.blue}" stroke="#000" stroke-width="2.5"/>`));
      g += label(x + 70, 196, name, 30);
      s += `<g${hl && hl !== id ? ' opacity="0.3"' : ""}>${g}</g>`;
    });
    return svg("0 0 580 218", s);
  }

  // A cell: type "animal" or "plant"; labels: name the parts; hl: the part
  // the slide is about ("membrane", "nucleus", "cytoplasm", "wall",
  // "vacuole", "chloroplast"), drawn in orange with its name in red.
  function cell({ type = "animal", labels = false, hl = "" }) {
    const ring = (part, w = 4) => (hl === part ? `stroke="${COL.orange}" stroke-width="${w + 4}"` : `stroke="#000" stroke-width="${w}"`);
    let s = "";
    let tags = [];
    const nucleus = (x, y, r) =>
      `<circle cx="${x}" cy="${y}" r="${r}" fill="#b39ddb" ${ring("nucleus")}/><circle cx="${x + 6}" cy="${y - 6}" r="${r * 0.3}" fill="#7e57c2"/>`;
    if (type === "plant") {
      s += `<rect x="40" y="26" width="220" height="226" rx="18" fill="none" stroke="${hl === "wall" ? COL.orange : "#2e7d32"}" stroke-width="14"/>`;
      s += `<rect x="52" y="38" width="196" height="202" rx="10" fill="#e8f5d0" ${ring("membrane", 3)}/>`;
      s += `<ellipse cx="128" cy="148" rx="58" ry="66" fill="#cfe8ff" ${ring("vacuole", 3)}/>`;
      s += nucleus(212, 88, 26);
      [[78, 60], [140, 58], [226, 150], [222, 210], [150, 228], [78, 226]].forEach(
        ([x, y]) => (s += `<ellipse cx="${x}" cy="${y}" rx="15" ry="8.5" fill="#4caf50" ${ring("chloroplast", 2.5)}/>`)
      );
      tags = [["wall", "דופן התא", 262, 44, 40], ["nucleus", "גרעין", 238, 92, 100], ["vacuole", "חלולית", 176, 160, 160], ["chloroplast", "כלורופלסט", 238, 214, 220]];
    } else {
      s += `<path d="M60 140 C60 70 120 40 170 46 C235 54 262 100 254 150 C246 205 200 238 140 232 C82 226 60 190 60 140 Z" fill="#ffe7a8" ${ring("membrane", 5)}/>`;
      [[104, 172, 20], [212, 186, -25], [108, 96, 35]].forEach(
        ([x, y, rot]) => (s += `<ellipse cx="${x}" cy="${y}" rx="17" ry="8" transform="rotate(${rot} ${x} ${y})" fill="${COL.orange}" stroke="#000" stroke-width="2.5"/>`)
      );
      s += nucleus(165, 130, 36);
      tags = [["membrane", "קרום התא", 240, 84, 50], ["nucleus", "גרעין", 200, 132, 140], ["cytoplasm", "ציטופלסמה", 214, 204, 226]];
    }
    if (!labels) return svg("0 0 300 280", s);
    tags.forEach(([part, name, x, y, ty]) => {
      const on = hl === part;
      s += seg(P(x, y), P(300, ty), on ? COL.orange : "#000", on ? 4 : 3) + label(380, ty, name, on ? 28 : 25, on ? "#b71c1c" : "#000");
    });
    return svg("0 0 470 280", s);
  }

  // The sun (on the right edge) and the eight planets in order, numbered;
  // hl: the planet the slide is about (1–8), the others faded.
  const PLANETS = [
    [8, "#9e9e9e"], [13, "#e6c27a"], [14, COL.blue], [10, "#d84315"],
    [32, "#d7a86e"], [26, "#e8d18a"], [18, "#8fe3f0"], [17, "#4a6fe3"],
  ];
  function planets({ hl = 0 }) {
    let s = `<circle cx="800" cy="100" r="118" fill="${COL.yellow}" stroke="#000" stroke-width="5"/>`;
    let x = 660;
    PLANETS.forEach(([r, color], i) => {
      x -= i ? r + PLANETS[i - 1][0] + 30 : r;
      const on = hl === i + 1;
      let g = `<circle cx="${x}" cy="100" r="${r}" fill="${color}" stroke="${on ? COL.orange : "#000"}" stroke-width="${on ? 6 : 3.5}"/>`;
      if (i === 2) g += `<path d="M${x - 6} ${100 - 8} q6 -4 10 2 q-2 8 -10 6 z" fill="#4caf50"/>`;
      if (i === 5) g += `<ellipse cx="${x}" cy="100" rx="${r + 16}" ry="7" fill="none" stroke="#000" stroke-width="3.5"/>`;
      g += label(x, 162, String(i + 1), on ? 30 : 24, on ? "#b71c1c" : "#000");
      s += `<g${hl && !on ? ' opacity="0.35"' : ""}>${g}</g>`;
    });
    return svg(`${x - 40} 30 ${800 - x + 40} 150`, s);
  }

  // The earth and the sun. show "spin": the earth turns — the side facing
  // the sun has day; "orbit": the earth goes around the sun in a year.
  function earth({ show = "spin" }) {
    const globe = (cx, cy, r) =>
      `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${COL.blue}" stroke="#000" stroke-width="4"/>` +
      `<path d="M${cx - r * 0.5} ${cy - r * 0.55} q${r * 0.4} ${-r * 0.1} ${r * 0.55} ${r * 0.3} q${-r * 0.1} ${r * 0.4} ${-r * 0.45} ${r * 0.35} z" fill="#4caf50"/>` +
      `<path d="M${cx + r * 0.15} ${cy + r * 0.15} q${r * 0.4} ${-r * 0.05} ${r * 0.45} ${r * 0.35} q${-r * 0.25} ${r * 0.3} ${-r * 0.5} ${r * 0.1} z" fill="#4caf50"/>`;
    if (show === "orbit") {
      let s = `<ellipse cx="230" cy="130" rx="190" ry="88" fill="none" stroke="#000" stroke-width="3" stroke-dasharray="10 8"/>`;
      s += `<circle cx="230" cy="130" r="42" fill="${COL.yellow}" stroke="#000" stroke-width="4"/>`;
      s += globe(420, 130, 20);
      s += `<path d="M300 46 Q260 40 220 42" fill="none" stroke="${COL.orange}" stroke-width="6" stroke-linecap="round"/>` + arrowHead(P(204, 43), P(260, 40), COL.orange, 16);
      s += label(230, 240, "365 ימים", 28);
      return svg("0 0 460 262", s);
    }
    let s = `<circle cx="470" cy="140" r="90" fill="${COL.yellow}" stroke="#000" stroke-width="5"/>`;
    for (let i = 0; i < 5; i++) {
      const a = Math.PI * (0.75 + i * 0.125);
      s += seg(P(470 + 100 * Math.cos(a), 140 + 100 * Math.sin(a)), P(470 + 122 * Math.cos(a), 140 + 122 * Math.sin(a)), COL.orange, 6);
    }
    s += globe(170, 140, 96);
    s += `<path d="M170 44 A96 96 0 0 0 170 236 Z" fill="#1a2a5e" opacity="0.72"/>`;
    s += label(206, 140, "יום", 30) + label(130, 140, "לילה", 30, "#fff");
    s += `<path d="M96 30 Q170 0 244 30" fill="none" stroke="${COL.orange}" stroke-width="6" stroke-linecap="round"/>` + arrowHead(P(256, 38), P(232, 22), COL.orange, 16);
    return svg("0 0 520 260", s);
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

  // The world, simplified: the continents from rough lon/lat outlines
  // (islands join their continent). show: "names" (every continent named),
  // "oceans" (the oceans named; hl: one in red) or "zones" (the equator and
  // the hot, mild and cold belts); hl: a continent or a list of them,
  // colored, with their names; israel: a red dot on Israel.
  const WORLD = {
    namerica: [
      [[-168, 66], [-162, 70], [-150, 71], [-140, 70], [-128, 70], [-115, 68], [-100, 68], [-95, 72], [-85, 70], [-80, 64], [-88, 58], [-93, 59], [-82, 52], [-78, 57], [-72, 61], [-62, 58], [-56, 52], [-60, 47], [-66, 44], [-70, 42], [-74, 40], [-76, 35], [-81, 31], [-80, 25], [-82, 27], [-84, 30], [-90, 30], [-94, 29], [-97, 26], [-97, 22], [-94, 18], [-90, 21], [-87, 21], [-88, 16], [-84, 15], [-83, 10], [-79, 9], [-80, 7], [-84, 9], [-87, 13], [-92, 15], [-97, 16], [-105, 20], [-106, 23], [-110, 24], [-112, 29], [-115, 30], [-117, 33], [-121, 35], [-124, 40], [-124, 46], [-125, 49], [-131, 54], [-136, 58], [-142, 60], [-150, 61], [-155, 58], [-160, 59], [-164, 62], [-165, 64]],
      [[-55, 60], [-43, 60], [-35, 66], [-22, 70], [-20, 76], [-18, 81], [-35, 83], [-60, 82], [-70, 78], [-62, 76], [-58, 72], [-53, 68], [-52, 64]],
    ],
    samerica: [
      [[-79, 9], [-75, 11], [-71, 12], [-64, 10], [-60, 8], [-52, 4], [-50, 0], [-44, -2], [-35, -5], [-37, -12], [-39, -17], [-41, -22], [-45, -23], [-48, -26], [-53, -34], [-58, -38], [-62, -39], [-65, -42], [-67, -46], [-66, -49], [-69, -52], [-68, -55], [-72, -53], [-75, -48], [-73, -40], [-72, -30], [-71, -25], [-70, -18], [-75, -15], [-78, -10], [-81, -5], [-80, -1], [-78, 2], [-77, 7]],
    ],
    europe: [
      [[-9, 37], [-9, 43], [-2, 43.5], [-1, 46], [-4, 48], [2, 51], [5, 53], [8, 54], [8, 57], [10, 58], [6, 58], [5, 62], [11, 64], [15, 68], [20, 70], [28, 71], [33, 69], [40, 67], [45, 68], [53, 68], [60, 69], [60, 60], [58, 55], [52, 50], [49, 46], [46, 44], [41, 42], [37, 45], [33, 46], [30, 45], [28, 43], [28, 41], [26, 41], [23, 40], [23, 37], [21, 38], [20, 40], [19, 42], [16, 44], [13, 45.5], [16, 41], [18, 40], [16, 38], [15, 40], [12, 42], [10, 44], [7, 43.5], [3, 43], [3, 41.5], [0, 39], [-1, 37], [-5, 36]],
      [[-5, 50], [1, 51], [2, 53], [-1, 55], [-2, 57], [-4, 58.6], [-6, 57], [-5, 55], [-3, 54], [-5, 52]],
      [[-10, 52], [-6, 52], [-6, 55], [-8, 55], [-10, 54]],
      [[-24, 64], [-14, 64.5], [-14, 66], [-22, 66.5]],
    ],
    asia: [
      [[60, 69], [68, 70], [73, 73], [80, 73], [90, 75], [100, 77], [112, 74], [125, 73], [140, 72], [150, 71], [160, 70], [170, 70], [180, 68], [180, 65], [175, 62], [165, 60], [162, 56], [158, 52], [156, 57], [150, 59], [142, 59], [136, 55], [140, 52], [141, 48], [135, 43], [130, 42], [129, 36], [126, 35], [126, 38], [122, 40], [118, 38], [120, 35], [122, 31], [120, 27], [117, 23], [110, 21], [108, 22], [106, 19], [108, 15], [109, 12], [105, 9], [103, 11], [100, 13], [101, 7], [104, 1.3], [101, 3], [98, 8], [98, 16], [94, 17], [92, 22], [89, 22], [86, 20], [80, 15], [80, 10], [77, 8], [73, 16], [72, 21], [67, 24], [62, 25], [57, 25.5], [56, 27], [52, 28], [50, 30], [48, 30], [50, 26], [51, 24], [56, 25], [57, 23], [60, 22], [58, 20], [55, 17], [52, 16], [45, 13], [43, 13], [42, 16], [39, 21], [37, 25], [35, 28], [34.4, 28], [32.6, 30], [32.3, 31.2], [34.2, 31.3], [35, 33], [36, 35], [36, 36.5], [32, 36.5], [29, 36.5], [27, 37.5], [26.5, 40], [28, 41], [30, 41.2], [33, 42], [36, 41.5], [41, 41], [41, 42], [46, 44], [49, 46], [52, 50], [58, 55], [60, 60]],
      [[130, 31], [132, 34], [135, 34], [140, 35], [141, 38], [142, 41], [140, 40], [139, 37], [136, 36], [132, 35]],
      [[95, 5.5], [98, 4], [104, -2], [106, -6], [102, -4], [99, 0]],
      [[109, 1], [111, -3], [116, -4], [119, 1], [117, 7], [114, 4]],
      [[105, -6], [114, -8], [110, -8]],
      [[120, 18], [122, 18], [126, 7], [122, 7]],
      [[80, 9.5], [82, 7], [81, 6], [79.8, 7]],
    ],
    africa: [
      [[33, 28], [35, 24], [37, 20], [39, 16], [43, 12], [51, 11.8], [51, 10], [48, 5], [41, -2], [40, -10], [40.5, -15], [35, -20], [35, -24], [33, -26], [32.5, -29], [28, -33], [20, -35], [18, -33], [17, -29], [15, -26], [12, -18], [13, -12], [12, -5], [9, -1], [10, 3], [8, 4.5], [4, 6.3], [-2, 4.8], [-8, 4.4], [-11, 6.8], [-13, 9], [-15, 11], [-17, 14.7], [-16, 19], [-17, 21], [-14, 26], [-10, 29], [-9.5, 32], [-6, 35.8], [-2, 35.1], [3, 36.8], [10, 37.2], [11, 35], [10.5, 33.5], [15, 32.3], [19, 30.5], [20, 32], [23, 32.7], [25, 31.6], [29, 30.9], [32.3, 31.2], [32.6, 30]],
      [[44, -25], [47, -25], [50, -15], [49, -12], [44, -17]],
    ],
    australia: [
      [[114, -22], [114, -27], [115, -34], [118, -35], [124, -34], [129, -31.5], [132, -32], [135, -35], [138, -34], [140, -38], [146, -39], [150, -37], [153, -32], [153, -25], [146, -19], [145, -15], [142, -11], [141, -15], [139, -17], [136, -15], [137, -12], [132, -11], [129, -15], [126, -14], [122, -17], [120, -19.5]],
      [[145, -41], [148, -41], [147, -43.5]],
      [[131, -1], [141, -3], [150, -10], [143, -9], [138, -8], [134, -4]],
      [[172, -35], [178, -38], [174, -41], [167, -46], [171, -44], [174, -39]],
    ],
    antarctica: [[[-180, -68], [-120, -72], [-60, -64], [-40, -75], [0, -70], [60, -67], [120, -66], [180, -70], [180, -78], [-180, -78]]],
  };
  const WORLD_NAMES = {
    namerica: ["צפון אמריקה", -100, 48],
    samerica: ["דרום אמריקה", -58, -14],
    europe: ["אירופה", 18, 52],
    asia: ["אסיה", 95, 50],
    africa: ["אפריקה", 20, 6],
    australia: ["אוסטרליה", 134, -25],
    antarctica: ["אנטארקטיקה", 0, -73],
  };
  const WORLD_COLORS = { namerica: "#ffcc80", samerica: "#a5d6a7", europe: "#b39ddb", asia: "#fff59d", africa: "#ffab91", australia: "#80deea", antarctica: "#eceff1" };
  const OCEANS = {
    pacific: ["השקט", -140, -5],
    atlantic: ["האטלנטי", -38, 22],
    indian: ["ההודי", 76, -22],
    arctic: ["הקרח הצפוני", 30, 78],
    southern: ["הדרומי", -100, -60],
  };
  const wX = (lon) => f1((lon + 180) * 2);
  const wY = (lat) => f1((84 - lat) * 2);

  function world({ show = "", hl = "", israel = false }) {
    let s = `<rect x="0" y="0" width="720" height="324" fill="${COL.sea}"/>`;
    if (show === "zones") {
      s += `<rect x="0" y="${wY(23.5)}" width="720" height="${f1(wY(-23.5) - wY(23.5))}" fill="${COL.orange}" opacity="0.28"/>`;
      s += `<rect x="0" y="0" width="720" height="${wY(66.5)}" fill="#fff" opacity="0.6"/>`;
      s += `<rect x="0" y="${wY(-66.5)}" width="720" height="${f1(324 - wY(-66.5))}" fill="#fff" opacity="0.6"/>`;
    }
    // hl names an ocean in "oceans", otherwise one continent or a list of them.
    const lit = show === "oceans" ? [] : [].concat(hl || []);
    Object.entries(WORLD).forEach(([id, shapes]) => {
      const fill = show === "names" ? WORLD_COLORS[id] : lit.includes(id) ? TEAL : lit.length ? "#e6efe2" : "#cdeac4";
      shapes.forEach((pts) => (s += `<polygon points="${pts.map(([lon, lat]) => `${wX(lon)},${wY(lat)}`).join(" ")}" fill="${fill}" stroke="#000" stroke-width="1.8" stroke-linejoin="round"/>`));
    });
    if (show === "zones") {
      s += seg(P(0, wY(0)), P(720, wY(0)), COL.red, 4);
      [23.5, -23.5, 66.5, -66.5].forEach((lat) => (s += seg(P(0, wY(lat)), P(720, wY(lat)), "#000", 2.5, 'stroke-dasharray="10 7"')));
      s += haloLabel(150, wY(0) - 16, "קו המשווה", 26, "#b71c1c");
      [["קר", 76], ["ממוזג", 45], ["חם", 12], ["ממוזג", -45]].forEach(([t, lat]) => (s += haloLabel(672, wY(lat), t, 26)));
    }
    if (show === "names") Object.values(WORLD_NAMES).forEach(([t, lon, lat]) => (s += haloLabel(wX(lon), wY(lat), t, 24)));
    lit.forEach((id) => {
      const [t, lon, lat] = WORLD_NAMES[id];
      s += haloLabel(wX(lon), wY(lat), t, lit.length > 1 ? 26 : 30, "#00695c");
    });
    if (show === "oceans") {
      Object.entries(OCEANS).forEach(([id, [t, lon, lat]]) => (s += haloLabel(wX(lon), wY(lat), t, hl === id ? 30 : 23, hl === id ? "#b71c1c" : "#00497a")));
    }
    if (israel) {
      s += `<circle cx="${wX(35)}" cy="${wY(31.5)}" r="7" fill="${COL.red}" stroke="#000" stroke-width="2.5"/>`;
      s += seg(P(wX(35) + 6, wY(31.5) + 4), P(wX(35) + 44, wY(31.5) + 30), "#000", 2.5) + haloLabel(wX(35) + 74, wY(31.5) + 38, "ישראל", 24, "#b71c1c");
    }
    return svg("0 0 720 324", s);
  }

  /* ---------- angles and directions ---------- */

  // One angle of `deg` degrees: a ray to the right and one turned up from it,
  // its size written inside (label: other text, or false for none). A right
  // angle gets the small square instead of an arc.
  function angle({ deg = 60, label: text }) {
    const T = P(180, 206);
    const A = P(340, 206);
    const r = (deg * Math.PI) / 180;
    const B = P(T.x + 156 * Math.cos(r), T.y - 156 * Math.sin(r));
    let s = deg === 90 ? rightMark(T, A, B, 34, COL.yellow) : arcs(T, A, B, 1, 48);
    s += seg(T, A, "#000", 6) + seg(T, B, "#000", 6);
    s += `<circle cx="${T.x}" cy="${T.y}" r="7" fill="#000"/>`;
    if (text !== false) {
      const m = r / 2;
      s += label(T.x + 88 * Math.cos(m), T.y - 88 * Math.sin(m) - (deg > 150 ? 18 : 0), text || `${deg}°`, 32, COL.deep);
    }
    return svg("0 0 360 230", s);
  }

  // A triangle with its three angles written in the corners: a = [bottom
  // right, top, bottom left], numbers (degrees) or "?".
  function tri({ a = [60, 60, 60] }) {
    const pts = [P(340, 250), P(150, 40), P(30, 250)];
    const cen = centroid(pts);
    let s = poly(pts, COL.tq, 6);
    pts.forEach((p, i) => {
      const q = pts[(i + 1) % 3];
      const o = pts[(i + 2) % 3];
      s += arcs(p, q, o, 1, 34);
      const toward = V.unit(V.sub(cen, p));
      const at = V.add(p, V.mul(toward, i === 1 ? 74 : 70));
      const t = a[i] === "?" ? "?" : `${a[i]}°`;
      s += label(at.x, at.y, t, 28, a[i] === "?" ? COL.red : "#000");
    });
    return svg("0 0 370 280", s);
  }

  // The four directions on a map; hl: "n" | "s" | "e" | "w" in red.
  function compass({ hl = "" }) {
    const C = P(170, 170);
    const dirs = { n: [0, -1, "צפון"], e: [1, 0, "מזרח"], s: [0, 1, "דרום"], w: [-1, 0, "מערב"] };
    let s = `<circle cx="${C.x}" cy="${C.y}" r="104" fill="${SOFT}" stroke="#000" stroke-width="4"/>`;
    Object.entries(dirs).forEach(([id, [dx, dy, t]]) => {
      const tip = P(C.x + dx * 96, C.y + dy * 96);
      const side1 = P(C.x - dy * 22, C.y + dx * 22);
      const side2 = P(C.x + dy * 22, C.y - dx * 22);
      s += poly([tip, side1, C, side2], hl === id ? COL.red : id === "n" ? TEAL : COL.yl, 4);
      s += label(C.x + dx * 156, C.y + dy * 140, t, hl === id ? 32 : 28, hl === id ? "#b71c1c" : "#000");
    });
    s += `<circle cx="${C.x}" cy="${C.y}" r="9" fill="#000"/>`;
    return svg("-30 0 400 340", s);
  }

  /* ---------- measures and solids ---------- */

  // A ruler from 0 to max cm and a bar len cm long on it, from 0.
  function ruler({ len = 6, max = 10 }) {
    const u = 50;
    const x0 = 34;
    const W = 2 * x0 + max * u;
    const end = x0 + len * u;
    let s = `<rect x="${x0}" y="20" width="${len * u}" height="32" rx="8" fill="${TEAL}" stroke="#000" stroke-width="5"/>`;
    s += seg(P(end, 56), P(end, 84), COL.orange, 5, 'stroke-dasharray="7 6"');
    s += `<rect x="${x0 - 22}" y="86" width="${max * u + 44}" height="80" rx="10" fill="${COL.yl}" stroke="#000" stroke-width="5"/>`;
    for (let i = 0; i <= max * 10; i++) {
      const x = x0 + (i * u) / 10;
      const long = i % 10 === 0;
      s += seg(P(x, 86), P(x, 86 + (long ? 30 : i % 5 === 0 ? 21 : 12)), "#000", long ? 3.5 : 2);
    }
    for (let c = 0; c <= max; c++) s += label(x0 + c * u, 144, c, 24, c === len ? "#b71c1c" : "#000");
    return svg(`0 0 ${W} 178`, s);
  }

  // A box (a cuboid) w long, h high and d deep, drawn at a slant. labels:
  // true writes w, h and d on its edges, [w, h, d] other text, false none;
  // grid: the unit cubes' lines on its faces.
  function box({ w = 3, h = 2, d = 2, labels = true, grid = false }) {
    const k = 0.42;
    const u = Math.min(64, 280 / (w + d * k), 190 / (h + d * k));
    const dx = d * u * k;
    const ox = 50;
    const oy = 24 + dx + h * u;
    const fx = ox + w * u;
    const top = oy - h * u;
    let s = poly([P(ox, oy), P(fx, oy), P(fx, top), P(ox, top)], TEAL);
    s += poly([P(ox, top), P(fx, top), P(fx + dx, top - dx), P(ox + dx, top - dx)], COL.tq);
    s += poly([P(fx, oy), P(fx + dx, oy - dx), P(fx + dx, top - dx), P(fx, top)], "#00bfa8");
    if (grid) {
      const g = (A, B) => seg(A, B, "#000", 2);
      for (let i = 1; i < w; i++) s += g(P(ox + i * u, oy), P(ox + i * u, top)) + g(P(ox + i * u, top), P(ox + i * u + dx, top - dx));
      for (let j = 1; j < h; j++) s += g(P(ox, oy - j * u), P(fx, oy - j * u)) + g(P(fx, oy - j * u), P(fx + dx, oy - j * u - dx));
      for (let t = 1; t < d; t++) {
        const e = (dx * t) / d;
        s += g(P(ox + e, top - e), P(fx + e, top - e)) + g(P(fx + e, oy - e), P(fx + e, top - e));
      }
    }
    if (labels) {
      const [lw, lh, ld] = Array.isArray(labels) ? labels : [w, h, d];
      s += label((ox + fx) / 2, oy + 26, lw, 30) + label(ox - 24, (oy + top) / 2, lh, 30) + label(fx + dx / 2 + 24, oy - dx / 2 + 12, ld, 30);
    }
    return svg(`0 0 ${f1(fx + dx + 56)} ${f1(oy + 48)}`, s);
  }

  // Five solids in a row (the first on the right), names under them; hl
  // shows one: "cube" | "box" | "cylinder" | "pyramid" | "sphere".
  function solids({ hl = "" }) {
    const prism = (x, y, w, h, dd) =>
      poly([P(x, y), P(x + w, y), P(x + w, y + h), P(x, y + h)], TEAL, 4) +
      poly([P(x, y), P(x + w, y), P(x + w + dd, y - dd), P(x + dd, y - dd)], COL.tq, 4) +
      poly([P(x + w, y), P(x + w + dd, y - dd), P(x + w + dd, y + h - dd), P(x + w, y + h)], "#00bfa8", 4);
    const hidden = 'stroke-dasharray="7 6"';
    const draw = {
      cube: (x) => prism(x + 14, 40, 72, 72, 28),
      box: (x) => prism(x + 4, 58, 92, 54, 26),
      cylinder: (x) => {
        const cx = x + 60;
        return (
          `<path d="M${cx - 42} 26 L${cx - 42} 104 A42 14 0 0 0 ${cx + 42} 104 L${cx + 42} 26 Z" fill="${TEAL}" stroke="#000" stroke-width="4" stroke-linejoin="round"/>` +
          `<path d="M${cx - 42} 104 A42 14 0 0 1 ${cx + 42} 104" fill="none" stroke="#000" stroke-width="2.5" ${hidden}/>` +
          `<ellipse cx="${cx}" cy="26" rx="42" ry="14" fill="${COL.tq}" stroke="#000" stroke-width="4"/>`
        );
      },
      pyramid: (x) => {
        const [A, B, C, D, T] = [P(x + 6, 112), P(x + 84, 112), P(x + 114, 90), P(x + 36, 90), P(x + 58, 12)];
        return seg(D, A, "#000", 2.5, hidden) + seg(D, C, "#000", 2.5, hidden) + seg(D, T, "#000", 2.5, hidden) + poly([A, B, T], TEAL, 4) + poly([B, C, T], "#00bfa8", 4);
      },
      sphere: (x) => {
        const cx = x + 60;
        return (
          `<circle cx="${cx}" cy="62" r="50" fill="${TEAL}" stroke="#000" stroke-width="4"/>` +
          `<path d="M${cx - 50} 62 A50 15 0 0 0 ${cx + 50} 62" fill="none" stroke="#000" stroke-width="3"/>` +
          `<path d="M${cx - 50} 62 A50 15 0 0 1 ${cx + 50} 62" fill="none" stroke="#000" stroke-width="2.5" ${hidden}/>`
        );
      },
    };
    const names = { cube: "קובייה", box: "תיבה", cylinder: "גליל", pyramid: "פירמידה", sphere: "כדור" };
    const order = Object.keys(draw);
    let s = "";
    order.forEach((id, i) => {
      const x = 10 + (order.length - 1 - i) * 140;
      s += `<g${hl && hl !== id ? ' opacity="0.3"' : ""}>${draw[id](x)}${label(x + 60, 150, names[id], 26)}</g>`;
    });
    return svg("0 0 710 172", s);
  }

  /* ---------- magnets and the earth ---------- */

  // Bar magnets, N in red and S in blue. mode: "one", "clips" (paper clips
  // hanging on its ends), "attract" (S N  S N, arrows toward each other) or
  // "repel" (S N  N S, arrows apart).
  function magnet({ mode = "one" }) {
    const bar = (x, y, flip) => {
      const [a, b] = flip ? [["S", COL.blue], ["N", COL.red]] : [["N", COL.red], ["S", COL.blue]];
      return (
        `<rect x="${x}" y="${y}" width="100" height="60" fill="${a[1]}"/><rect x="${x + 100}" y="${y}" width="100" height="60" fill="${b[1]}"/>` +
        `<rect x="${x}" y="${y}" width="200" height="60" rx="6" fill="none" stroke="#000" stroke-width="5"/>` +
        label(x + 50, y + 31, a[0], 34, "#fff") +
        label(x + 150, y + 31, b[0], 34, "#fff")
      );
    };
    const arrow = (x1, x2, y) => {
      const dir = Math.sign(x2 - x1);
      return seg(P(x1, y), P(x2 - dir * 10, y), "#000", 5) + poly([P(x2, y), P(x2 - dir * 16, y - 10), P(x2 - dir * 16, y + 10)], "#000", 2);
    };
    if (mode === "attract") return svg("0 0 500 120", bar(14, 30, true) + bar(286, 30, true) + arrow(224, 246, 60) + arrow(276, 254, 60));
    if (mode === "repel") return svg("0 0 540 120", bar(14, 30, true) + bar(326, 30, false) + arrow(258, 230, 60) + arrow(282, 310, 60));
    let s = bar(60, 24, false);
    if (mode === "clips") {
      const clip = (x, y) =>
        `<rect x="${x}" y="${y}" width="18" height="44" rx="9" fill="none" stroke="#555" stroke-width="4"/><rect x="${x + 5}" y="${y + 8}" width="8" height="28" rx="4" fill="none" stroke="#555" stroke-width="3"/>`;
      [[64, 84], [86, 84], [72, 124], [234, 84], [218, 84]].forEach(([x, y]) => (s += clip(x, y)));
      return svg("0 0 320 176", s);
    }
    return svg("0 0 320 108", s);
  }

  // The earth cut open: crust, mantle, outer and inner core, named on the
  // right. hl: "crust" | "mantle" | "outer" | "inner" | "core" (both cores).
  function layers({ hl = "" }) {
    const cx = 150;
    const cy = 150;
    const list = [
      ["crust", "קרום", 140, "#a1887f", -50, 134, 40],
      ["mantle", "מעטפת", 128, COL.orange, -14, 101, 112],
      ["outer", "גלעין חיצוני", 74, COL.yellow, 22, 56, 184],
      ["inner", "גלעין פנימי", 38, COL.red, 58, 18, 256],
    ];
    const on = (id) => !hl || hl === id || (hl === "core" && (id === "outer" || id === "inner"));
    let s = "";
    list.forEach(([id, , r, fill]) => (s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="#000" stroke-width="4"${on(id) ? "" : ' opacity="0.3"'}/>`));
    list.forEach(([id, name, , , deg, rr, ty]) => {
      const a = (deg * Math.PI) / 180;
      const from = P(cx + rr * Math.cos(a), cy + rr * Math.sin(a));
      const big = hl && on(id);
      s += `<circle cx="${f1(from.x)}" cy="${f1(from.y)}" r="5" fill="#000"/>` + seg(from, P(352, ty), "#000", 3);
      s += label(440, ty, name, big ? 30 : 26, big ? "#b71c1c" : "#000");
    });
    return svg("0 0 530 300", s);
  }

  /* ---------- symmetry, moving shapes, similar triangles, short multiplication ---------- */

  const axisLine = (A, B) => seg(A, B, COL.orange, 6, 'stroke-dasharray="14 10"');

  // A shape with its lines of symmetry.
  function sym({ k = "house" }) {
    const c = P(150, 130);
    let s = "";
    if (k === "house") {
      s = poly([P(150, 24), P(250, 104), P(250, 236), P(50, 236), P(50, 104)], TEAL, 6) + axisLine(P(150, 6), P(150, 254));
    }
    if (k === "butterfly") {
      const wings = [
        [P(150, 116), P(244, 40), P(276, 112), P(150, 136)],
        [P(150, 136), P(250, 148), P(220, 222), P(150, 160)],
      ];
      wings.forEach((w) => {
        s += poly(w, TEAL, 5) + poly(w.map((p) => P(300 - p.x, p.y)), TEAL, 5);
      });
      s += `<ellipse cx="150" cy="134" rx="11" ry="46" fill="${COL.yl}" stroke="#000" stroke-width="5"/>` + axisLine(P(150, 8), P(150, 252));
    }
    if (k === "rect") {
      s = poly([P(40, 70), P(260, 70), P(260, 190), P(40, 190)], TEAL, 6) + axisLine(P(150, 40), P(150, 220)) + axisLine(P(14, 130), P(286, 130));
    }
    if (k === "square") {
      s = poly([P(60, 40), P(240, 40), P(240, 220), P(60, 220)], TEAL, 6);
      s += axisLine(P(150, 12), P(150, 248)) + axisLine(P(34, 130), P(266, 130)) + axisLine(P(40, 20), P(260, 240)) + axisLine(P(260, 20), P(40, 240));
    }
    if (k === "tri") {
      const R = 112;
      const pts = [-90, 30, 150].map((d) => P(150 + R * Math.cos((d * Math.PI) / 180), 148 + R * Math.sin((d * Math.PI) / 180)));
      s = poly(pts, TEAL, 6);
      const cen = P(150, 148);
      pts.forEach((p) => {
        const u = V.unit(V.sub(cen, p));
        s += axisLine(V.add(p, V.mul(u, -18)), V.add(cen, V.mul(u, R * 0.5 + 22)));
      });
    }
    if (k === "circle") {
      s = `<circle cx="150" cy="130" r="100" fill="${TEAL}" stroke="#000" stroke-width="6"/>`;
      [0, 45, 90, 135].forEach((d) => {
        const u = P(Math.cos((d * Math.PI) / 180), Math.sin((d * Math.PI) / 180));
        s += axisLine(V.add(c, V.mul(u, -118)), V.add(c, V.mul(u, 118)));
      });
    }
    if (k === "none") s = poly([P(40, 220), P(270, 220), P(90, 50)], TEAL, 6);
    return svg("0 0 300 260", s);
  }

  // A shape on a grid and where it goes. mode: reflect (with `dist`, the
  // distance from the mirror line), translate or rotate.
  function transform({ mode = "reflect", dist = false }) {
    const u = 40;
    const G = ([x, y]) => P(10 + x * u, 10 + y * u);
    const shape = [[1, 1], [3, 1], [3, 2], [2, 2], [2, 4], [1, 4]];
    const move = {
      reflect: ([x, y]) => [12 - x, y],
      translate: ([x, y]) => [x + 7, y + 3],
      rotate: ([x, y]) => [12 - x, 8 - y],
    }[mode];
    let s = "";
    for (let x = 0; x <= 12; x++) s += seg(G([x, 0]), G([x, 8]), "#c7d2dc", 2);
    for (let y = 0; y <= 8; y++) s += seg(G([0, y]), G([12, y]), "#c7d2dc", 2);
    s += poly(shape.map(G), TEAL) + poly(shape.map(move).map(G), COL.yl);
    if (mode === "reflect") {
      s += axisLine(G([6, 0]), G([6, 8]));
      if (dist) {
        s += seg(G([3, 1]), G([9, 1]), COL.red, 5);
        s += label(G([4.5, 0.5]).x, G([4.5, 0.5]).y, "3", 28, "#b71c1c") + label(G([7.5, 0.5]).x, G([7.5, 0.5]).y, "3", 28, "#b71c1c");
      }
    }
    if (mode === "translate") {
      const from = G([3.2, 2.2]);
      const to = G([7.6, 4.4]);
      s += seg(from, to, COL.orange, 7) + arrowHead(V.add(to, V.mul(V.unit(V.sub(to, from)), 12)), from);
    }
    if (mode === "rotate") s += `<circle cx="${G([6, 4]).x}" cy="${G([6, 4]).y}" r="11" fill="${COL.red}" stroke="#000" stroke-width="3.5"/>`;
    return svg("0 0 500 340", s);
  }

  // A small and a big similar triangle (3-4-5 and twice that). sides: labels of
  // [bottom, side, long side] of each one; angles: mark the equal angles.
  function similar({ small = [], big = [], angles = false }) {
    const t1 = [P(40, 300), P(200, 300), P(200, 180)];
    const t2 = [P(310, 300), P(630, 300), P(630, 60)];
    const marks = angles ? { angles: [1, 2, 3] } : {};
    let s = markedTri(t1, ["A", "B", "C"], COL.tq, marks) + markedTri(t2, ["D", "E", "F"], COL.yl, marks);
    [[t1, small], [t2, big]].forEach(([t, sides]) => {
      const cen = centroid(t);
      sides.forEach((text, i) => {
        if (text !== "") s += sLabel(t[i], t[(i + 1) % 3], cen, String(text), 30);
      });
    });
    return svg("0 0 700 350", s);
  }

  // The square of (a + b) cut into its four parts.
  function binom({ a = "a", b = "b" }) {
    const A = 170;
    const B = 90;
    const x0 = 60;
    const y0 = 50;
    const box = (x, y, w, h, fill, t, size = 32) =>
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="#000" stroke-width="5"/>` + label(x + w / 2, y + h / 2, t, size);
    let s = box(x0, y0, A, A, TEAL, `${a}²`) + box(x0 + A, y0, B, A, COL.yl, `${a}${b}`) + box(x0, y0 + A, A, B, COL.yl, `${a}${b}`) + box(x0 + A, y0 + A, B, B, COL.tq, `${b}²`);
    s += label(x0 + A / 2, y0 - 24, a, 30) + label(x0 + A + B / 2, y0 - 24, b, 30);
    s += label(x0 - 26, y0 + A / 2, a, 30) + label(x0 - 26, y0 + A + B / 2, b, 30);
    return svg("0 0 340 330", s);
  }

  /* ---------- written multiplication and division, quadrilaterals, mixed numbers ---------- */

  const COL_W = 46;
  const ROW_H = 58;

  // An exercise written in columns. upto: how many digits of the answer are
  // already written, from the right (the newest one in orange, its column
  // marked); with a two-digit multiplier, how many rows (the last one is the
  // sum). hide: the exercise alone, to solve.
  function vmult({ a = 23, b = 4, upto = Infinity, hide = false }) {
    const aDigits = [...String(a)].reverse().map(Number);
    const bDigits = [...String(b)].reverse().map(Number);
    const two = bDigits.length > 1;
    const product = String(a * b);
    const shown = hide ? 0 : upto;
    const cols = Math.max(product.length, String(a).length, bDigits.length + 1) + 1;
    const X = (col) => 14 + (cols - col - 0.5) * COL_W;
    const digits = (t, row, color = "#000", first = 0, count = t.length) =>
      [...t]
        .reverse()
        .map((d, c) => (c >= first && c < first + count ? label(X(c), row * ROW_H + 30, d, 38, color) : ""))
        .join("");
    const rule = (row) => seg(P(10, row * ROW_H + 2), P(X(0) + COL_W / 2 + 4, row * ROW_H + 2), "#000", 5);
    let s = "";
    let row = 1;
    if (!two && Number.isFinite(shown) && shown > 0 && shown <= aDigits.length) {
      s += `<rect x="${X(shown - 1) - COL_W / 2}" y="${ROW_H}" width="${COL_W}" height="${ROW_H}" rx="8" fill="${COL.yl}"/>`;
      s += `<rect x="${X(0) - COL_W / 2}" y="${2 * ROW_H}" width="${COL_W}" height="${ROW_H}" rx="8" fill="${COL.yl}"/>`;
    }
    s += digits(String(a), row);
    row += 1;
    s += digits(String(b), row) + label(X(cols - 1), row * ROW_H + 30, "×", 36);
    row += 1;
    s += rule(row);
    if (two) {
      bDigits.forEach((d, i) => {
        if (shown <= i) return;
        const part = String(a * d) + "0".repeat(i);
        s += digits(part, row, shown === i + 1 ? COL.orange : "#000", i) + digits(part, row, COL.deep, 0, i);
        row += 1;
      });
      if (shown > 2) {
        s += rule(row) + digits(product, row, COL.orange);
        row += 1;
      }
      if (shown === 0) row += 1;
    } else {
      // The digit carried over sits small above the next column.
      let carry = 0;
      aDigits.forEach((d, c) => {
        carry = Math.floor((d * b + carry) / 10);
        if (carry && c + 1 < aDigits.length && c < shown) s += label(X(c + 1), 36, carry, 28, COL.orange);
      });
      const done = Math.min(shown, product.length);
      if (done) {
        const finished = !Number.isFinite(shown);
        s += digits(product, row, "#000", 0, finished ? done : done - 1);
        if (!finished) s += digits(product, row, COL.orange, done - 1, 1);
      }
      row += 1;
    }
    return svg(`0 8 ${f1(cols * COL_W + 28)} ${row * ROW_H + 4}`, s);
  }

  // Long division with its bar: the divisor on the left, the answer above.
  // Every digit of the answer is 3 stages: write it, multiply and subtract,
  // bring the next digit down. upto: the stages already done (the newest in
  // orange).
  function vdiv({ n = 84, d = 4, upto = Infinity }) {
    const digits = [...String(n)].map(Number);
    const steps = [];
    let cur = 0;
    digits.forEach((digit, i) => {
      cur = cur * 10 + digit;
      if (!steps.length && cur < d && i < digits.length - 1) return;
      const q = Math.floor(cur / d);
      steps.push({ i, q, prod: q * d, rem: cur - q * d });
      cur -= q * d;
    });
    const lead = String(d).length * COL_W + 22;
    const X = (i) => 14 + lead + (i + 0.5) * COL_W;
    const barY = ROW_H + 2;
    const right = (t, end, row, color) =>
      [...String(t)]
        .reverse()
        .map((c, k) => label(X(end - k), row * ROW_H + 30, c, 38, color))
        .join("");
    const last = digits.length - 1;
    let s = seg(P(lead + 8, barY), P(X(last) + COL_W / 2 + 6, barY), "#000", 5);
    s += `<path d="M${lead + 8} ${barY} Q${lead + 26} ${barY + ROW_H / 2} ${lead + 8} ${barY + ROW_H}" fill="none" stroke="#000" stroke-width="5" stroke-linecap="round"/>`;
    s += label(lead / 2 + 2, ROW_H + 30, d, 38);
    digits.forEach((digit, i) => (s += label(X(i), ROW_H + 30, digit, 38)));
    let row = 2;
    let stage = 0;
    for (let k = 0; k < steps.length; k++) {
      const st = steps[k];
      const fresh = (at) => (upto === at ? COL.orange : "#000");
      stage += 1;
      if (upto < stage) break;
      s += label(X(st.i), 30, st.q, 38, fresh(stage));
      stage += 1;
      if (upto < stage) break;
      const width = String(st.prod).length;
      s += right(st.prod, st.i, row, fresh(stage));
      s += label(X(st.i - width) + 14, row * ROW_H + 30, "−", 34, fresh(stage));
      row += 1;
      s += seg(P(X(st.i - width + 1) - COL_W / 2 - 4, row * ROW_H + 2), P(X(st.i) + COL_W / 2 + 2, row * ROW_H + 2), "#000", 4);
      s += right(st.rem, st.i, row, fresh(stage));
      row += 1;
      if (k === steps.length - 1) break;
      stage += 1;
      if (upto < stage) break;
      s += label(X(st.i + 1), (row - 1) * ROW_H + 30, digits[st.i + 1], 38, upto === stage ? COL.orange : COL.deep);
    }
    return svg(`0 0 ${f1(X(last) + COL_W / 2 + 16)} ${Math.max(row, 2) * ROW_H + 4}`, s);
  }

  // A quadrilateral or a triangle. base, top, h: names or lengths written on
  // the bottom side, the top side and the height (dashed); parallel: arrows on
  // the parallel sides; equal: marks on equal sides; half: the triangle inside
  // its rectangle.
  const QUADS = {
    square: [P(70, 20), P(230, 20), P(230, 180), P(70, 180)],
    rect: [P(30, 50), P(270, 50), P(270, 170), P(30, 170)],
    parallelogram: [P(80, 40), P(300, 40), P(230, 180), P(10, 180)],
    rhombus: [P(155, 10), P(285, 100), P(155, 190), P(25, 100)],
    trapezoid: [P(90, 40), P(230, 40), P(300, 180), P(10, 180)],
    triangle: [P(110, 20), P(290, 180), P(10, 180)],
  };
  function quad({ k = "parallelogram", base, top, h, parallel = false, equal = false, half = false }) {
    const pts = QUADS[k];
    const [A, B, C, D] = pts;
    const isTri = k === "triangle";
    const bottomL = isTri ? C : D;
    const bottomR = isTri ? B : C;
    let s = "";
    if (half) s += `<rect x="${bottomL.x}" y="${A.y}" width="${bottomR.x - bottomL.x}" height="${bottomR.y - A.y}" fill="${SOFT}" stroke="#000" stroke-width="4" stroke-dasharray="12 9"/>`;
    s += poly(pts, TEAL, 6);
    if (h) {
      const foot = P(A.x, bottomL.y);
      s += seg(A, foot, COL.orange, 6, 'stroke-dasharray="12 9"') + rightMark(foot, A, bottomR, 20);
      s += label(A.x + 26, (A.y + foot.y) / 2, h, 34);
    }
    if (base) s += label((bottomL.x + bottomR.x) / 2, bottomL.y + 30, base, 32);
    if (top) s += label((A.x + B.x) / 2, A.y - 24, top, 32);
    if (parallel) {
      const mark = (U, W, n) => {
        const M = V.mid(U, W);
        const dir = V.unit(V.sub(W, U));
        for (let i = 0; i < n; i++) s += arrowHead(V.add(M, V.mul(dir, 10 + i * 18)), M, COL.orange, 20);
      };
      mark(A, B, 1);
      mark(D, C, 1);
      if (k !== "trapezoid") {
        mark(D, A, 2);
        mark(C, B, 2);
      }
    }
    if (equal) pts.forEach((p, i) => (s += ticks(p, pts[(i + 1) % pts.length], 1)));
    return svg("-14 -22 338 246", s);
  }

  // Whole pizzas and a part of one, in a row: whole, then k of n slices.
  function mixed({ whole = 1, n = 2, k = 1 }) {
    const r = 56;
    const gap = 14;
    const count = whole + (k ? 1 : 0);
    let s = "";
    for (let p = 0; p < count; p++) {
      const cx = r + 6 + p * (2 * r + gap);
      const colored = p < whole ? n : k;
      for (let i = 0; i < n; i++) {
        const a1 = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        const a2 = -Math.PI / 2 + ((i + 1) * 2 * Math.PI) / n;
        s += `<path d="M${cx} ${r + 6} L${f1(cx + r * Math.cos(a1))} ${f1(r + 6 + r * Math.sin(a1))} A${r} ${r} 0 0 1 ${f1(cx + r * Math.cos(a2))} ${f1(r + 6 + r * Math.sin(a2))} Z" fill="${
          i < colored ? TEAL : SOFT
        }" stroke="#000" stroke-width="4" stroke-linejoin="round"/>`;
      }
    }
    return svg(`0 0 ${count * (2 * r + gap) - gap + 12} ${2 * r + 12}`, s);
  }

  window.LESSON_FIGURES = {
    pie, equal, bars, hundred, groups, shapes, shape, area,
    right, ladder, diag, pair, aaa, kite, bowtie, balance, balls, parts, cross, scalemap,
    numline, thermo, circle, dice, axes, bargraph, linegraph,
    plant, growth, circuit, states, cell, planets, earth,
    israel, timeline, world,
    angle, tri, compass,
    ruler, box, solids, magnet, layers,
    sym, transform, similar, binom,
    vmult, vdiv, quad, mixed,
  };
})();
