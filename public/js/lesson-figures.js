/* Drawings for the subject lessons (subject-lessons.js): a slide's
   `fig: { kind, ... }` becomes the SVG that LESSON_FIGURES[kind] returns.
   Thick black outlines and flat colors, like the rest of the site. */
(function () {
  const TEAL = "#00e5cc";
  const SOFT = "#eaf5ff";
  const f1 = (n) => +n.toFixed(1);
  // Hebrew labels read right to left.
  const label = (x, y, t, size = 26, color = "#000") =>
    `<text x="${x}" y="${y}" font-size="${size}" font-weight="800" fill="${color}" text-anchor="middle" dominant-baseline="central" direction="rtl">${t}</text>`;
  const svg = (vb, body) => `<svg class="lp-fig-svg" viewBox="${vb}" role="img" aria-hidden="true">${body}</svg>`;

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

  window.LESSON_FIGURES = { pie, equal, plant };
})();
