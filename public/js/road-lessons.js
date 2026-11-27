/* The road-safety lessons' drawings as moving pictures of the PAT city
   (road-city.js): a boy walks on the sidewalk, cars stop at the zebra, the
   lights change — over and over, like the map in the game.

   A road slide's fig with `city: "<scene>"` comes out of lesson-figures.js
   as <div class="lf-city" data-city="<scene>"> with the flat drawing in it;
   lesson-figures.js loads this file (and road-city.js) the first time, and
   this file puts a canvas over each such box and plays its scene while it's
   on screen.

   Every scene happens around one of downtown's crossroads, in tiles from
   its top tile (as in road-cases.js): the street runs along x (down-right
   on screen) — cars going up-left (heading 2) on y 0.5, cars going
   down-right (heading 0) on y 1.5 — with its zebra at x 2..3 and the
   sidewalks at y -2..0 (north) and y 2..4 (south). The cross street runs
   along y at x 0..2: heading 1 (down-left) on x 0.5, heading 3 on x 1.5. */

(function () {
  const R = window.RoadCity;
  if (!R || window.RoadLessons) return;

  const CROSSROADS = [[34, 48], [52, 48], [34, 66], [52, 66]];
  // What the camera shows (world units: a tile is 64 wide, 32 high).
  const VIEW = [250, 188];
  const NEAR = [215, 161];
  const WALK = 1.5;
  const DRIVE = 3.4;
  const Z = 2.5;
  const WL = 0.5;
  const EL = 1.5;
  const KID = 1;
  const FADE = 0.4;
  const REDUCED = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const mod = (a, n) => ((a % n) + n) % n;

  /* ── Paths: keys [t, x, y, opts], as in road-cases.js ── */

  // From (x, y): ["to", x, y, speed?] at a steady speed, ["brake", x, y] to
  // a stop, ["start", x, y] from a stop, ["wait", seconds, face?], ["till",
  // time, face?] (waits there until that time in the loop).
  function path(x, y, steps, v = WALK) {
    const keys = [[0, x, y, {}]];
    let t = 0;
    for (const [kind, a, b, c] of steps) {
      const cur = keys[keys.length - 1];
      if (kind === "wait" || kind === "till") {
        if (b != null) cur[3].face = b;
        t = kind === "till" ? Math.max(t, a) : t + a;
      } else {
        const speed = c ?? v;
        const ease = kind === "brake" ? "out" : kind === "start" ? "in" : null;
        if (ease) cur[3].ease = ease;
        cur[3].v = speed;
        t += ((ease ? 2 : 1) * Math.hypot(a - x, b - y)) / speed;
        x = a;
        y = b;
      }
      keys.push([t, x, y, {}]);
    }
    return keys;
  }

  const eased = (ease, k) => (ease === "out" ? 1 - (1 - k) * (1 - k) : ease === "in" ? k * k : k);

  function track(keys, t) {
    let i = 0;
    while (i < keys.length - 1 && t >= keys[i + 1][0]) i++;
    const a = keys[i];
    const b = keys[Math.min(i + 1, keys.length - 1)];
    const span = b[0] - a[0];
    const k = span > 0 ? eased(a[3].ease, Math.min(1, Math.max(0, (t - a[0]) / span))) : 0;
    const moving = span > 0 && t < b[0] && (a[1] !== b[1] || a[2] !== b[2]);
    return { x: a[1] + (b[1] - a[1]) * k, y: a[2] + (b[2] - a[2]) * k, i, moving };
  }

  const headingOf = (dx, dy) => (Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 0 : 2) : dy > 0 ? 1 : 3);

  // When a path first gets to `value` on an axis ("x" or "y").
  function reach(keys, axis, value) {
    const n = axis === "x" ? 1 : 2;
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i];
      const b = keys[i + 1];
      if ((value - a[n]) * (value - b[n]) > 0 || a[n] === b[n]) continue;
      const p = (value - a[n]) / (b[n] - a[n]);
      const k = a[3].ease === "out" ? 1 - Math.sqrt(1 - p) : a[3].ease === "in" ? Math.sqrt(p) : p;
      return a[0] + (b[0] - a[0]) * k;
    }
    return keys[keys.length - 1][0];
  }

  const endOf = (keys) => keys[keys.length - 1][0];

  // How long a car takes from x to a stop at `stop` (driving, then braking
  // over the last 3.4 tiles), as path() counts it.
  const toStop = (from, stop) => (Math.abs(from - stop) - 3.4) / DRIVE + 2;

  /* ── The cast: each is a function of the time in the loop ── */

  // The way someone on a path faces at a point of it (track()): the way
  // they go, or standing, their `face` or the way of their next walk.
  function headingAt(keys, p) {
    if (p.moving) return headingOf(keys[p.i + 1][1] - keys[p.i][1], keys[p.i + 1][2] - keys[p.i][2]);
    if (keys[p.i][3].face != null) return keys[p.i][3].face;
    for (let j = p.i; j < keys.length - 1; j++) {
      const dx = keys[j + 1][1] - keys[j][1];
      const dy = keys[j + 1][2] - keys[j][2];
      if (dx || dy) return headingOf(dx, dy);
    }
    return 1;
  }

  const fade = (t, from, to) => Math.max(0, Math.min(1, (t - from) / FADE, (to - t) / FADE));

  // Someone walking a path; seen from `show[0]` to `show[1]` (fading in and
  // out), all the loop when it's not given. `wear`: { dark } or { vest }.
  function walker(keys, kind = "kid", v = KID, show = null, wear = {}) {
    const [from, to] = show || [0, Infinity];
    return (t) => {
      if (t < from || t > to) return null;
      const p = track(keys, t);
      const f = R.facing(headingAt(keys, p));
      const alpha = show ? fade(t, from, to) : 1;
      return { type: "person", kind, v, ...wear, x: p.x, y: p.y, walking: p.moving, back: f.back, flip: f.flip, ms: t * 1000, alpha };
    };
  }

  // A boy walking the whole path, fading in at its start and out at its end.
  const kid = (keys, v = KID, kind = "kid", wear) => walker(keys, kind, v, [keys[0][0], endOf(keys)], wear);

  // A boy riding a bike along a path, a helmet on (unless `helmet: false`),
  // fading in and out at its ends; `lamps`: his bike's lights on.
  function rider(keys, { v = KID, helmet = true, lamps = false } = {}) {
    const from = keys.find((k, i) => i === keys.length - 1 || keys[i + 1][1] !== k[1] || keys[i + 1][2] !== k[2])[0];
    const to = endOf(keys);
    return (t) => {
      if (t < from || t > to) return null;
      const p = track(keys, t);
      return { type: "rider", x: p.x, y: p.y, h: headingAt(keys, p), v, helmet, lamps, moving: p.moving, ms: t * 1000, alpha: fade(t, from, to) };
    };
  }

  // `back`: which of its back lights are on at a time ("reverse", "brake").
  function car(keys, h, look, back) {
    return (t) => {
      const p = track(keys, t);
      return { type: "car", x: p.x, y: p.y, h, look, back: back?.(t) };
    };
  }

  function bus(keys, h) {
    return (t) => {
      const p = track(keys, t);
      return { type: "bus", x: p.x, y: p.y, h };
    };
  }

  // A car driving from (x0, y0) to (x1, y1) heading h, setting off `at`
  // seconds into a loop of `loop`, and again every loop.
  function drive(x0, y0, x1, y1, h, at, look, loop, v = DRIVE) {
    const keys = path(x0, y0, [["to", x1, y1, v]], v);
    return (t) => {
      const u = mod(t - at, loop);
      return u > endOf(keys) ? null : { type: "car", ...track(keys, u), h, look };
    };
  }

  // A car going by on the street (lane "w": up-left, "e": down-right; or
  // the cross street's "s": down-left, "n": up-right), setting off at `at`
  // seconds into a loop of `loop`; it comes round again every loop.
  function pass(lane, at, look, loop, v = DRIVE) {
    const [x0, y0, x1, y1, h] = {
      w: [13, WL, -9, WL, 2],
      e: [-9, EL, 13, EL, 0],
      s: [0.5, -9, 0.5, 11, 1],
      n: [1.5, 11, 1.5, -9, 3],
    }[lane];
    const keys = path(x0, y0, [["to", x1, y1, v]], v);
    const end = endOf(keys);
    return (t) => {
      const u = mod(t - at, loop);
      if (u > end) return null;
      const p = track(keys, u);
      return { type: "car", x: p.x, y: p.y, h, look };
    };
  }

  // A light's states from times on: [[0, "red"], [2, "green"], ...];
  // "blink" is a flashing green — only on the cars' light: in Israel the
  // walkers' green doesn't flash, it turns straight to red.
  function stateAt(list, t) {
    let on = list[0][1];
    for (const [at, s] of list) if (t >= at) on = s;
    return on;
  }
  function steps(list, t) {
    const on = stateAt(list, t);
    return on === "blink" ? (Math.floor(t * 2.5) % 2 === 0 ? "green" : "off") : on;
  }

  const walkLight = (list, x = 3.3, y = -0.35) => (t) => ({ type: "walkLight", x, y, on: steps(list, t) });
  const carLight = (list, x = 3.85, y = -0.35) => (t) => ({ type: "carLight", x, y, on: steps(list, t) });
  // The cars' light with the walkers' one under it, on one pole.
  const bothLights = (cars, walk, x = 3.6, y = -0.35) => (t) => ({ type: "carLight", x, y, on: steps(cars, t), walk: steps(walk, t) });
  const sign = (kind, x, y, value) => () => ({ type: "sign", kind, x, y, value });

  // A bubble over another of the cast, between two times.
  function bubble(of, text, z, from = 0, to = Infinity, color) {
    return (t) => {
      if (t < from || t >= to) return null;
      const a = of(t);
      return a && { type: "bubble", x: a.x, y: a.y, z, text, color };
    };
  }

  // A word over a spot on the ground.
  const label = (x, y, text, z = 6, color) => () => ({ type: "bubble", x, y, z, text, color });

  // Paint on the ground (road-city.js's marks), its points from the scene's
  // spot: "fill" (a wider road, a field's grass), "line", "dashes", "curb",
  // "trail" (a way to walk), "cross", "rails".
  const mark = (kind, pts, opts) => () => ({ type: "mark", x: 0, y: 0, kind, pts, ...opts });
  // A glowing ring round a spot that pulses, to point it out, while `on(t)`.
  const glow = (pts, on = () => true) => (t) => (on(t) ? { type: "mark", x: 0, y: 0, kind: "area", pts, alpha: 0.65 + 0.35 * Math.sin(t * 4.5) } : null);
  // One of the city's own things (a tree, flowers) put on a tile.
  const prop = (defId, x, y) => () => ({ type: "prop", defId, x, y });

  // A car on a path that turns: it faces the way it goes.
  function turner(keys, look) {
    return (t) => {
      const p = track(keys, t);
      return { type: "car", x: p.x, y: p.y, h: headingAt(keys, p), look };
    };
  }

  // A car that comes to the stop line of its light (`lane` as in pass()),
  // stands there from `arrive` till `go`, and drives on — every loop.
  const STOPS = {
    w: [13, WL, 4.35, WL, -9, WL, 2],
    e: [-9, EL, -1.85, EL, 13, EL, 0],
    s: [0.5, -9, 0.5, -1.85, 0.5, 11, 1],
    n: [1.5, 11, 1.5, 3.85, 1.5, -9, 3],
  };
  function stopGo(lane, arrive, go, look, loop) {
    const [x0, y0, sx, sy, x1, y1, h] = STOPS[lane];
    const ux = Math.sign(sx - x0);
    const uy = Math.sign(sy - y0);
    const keys = path(x0, y0, [["to", sx - ux * 3.4, sy - uy * 3.4, DRIVE], ["brake", sx, sy], ["wait", go - arrive], ["start", sx + ux * 3.4, sy + uy * 3.4], ["to", x1, y1]], DRIVE);
    const at = arrive - keys[2][0];
    const end = endOf(keys);
    return (t) => {
      const u = mod(t - at, loop);
      if (u > end) return null;
      const p = track(keys, u);
      return { type: "car", x: p.x, y: p.y, h, look, back: u > keys[1][0] && u < keys[3][0] ? "brake" : null };
    };
  }

  // A level crossing's barrier: its arm points along heading `dir`; down
  // from `down[0]` to `down[1]`, up again from `up[0]` to `up[1]`; its lamps
  // flash from the first to the last.
  const gate = (x, y, dir, down, up) => (t) => {
    const k = (t - down[0]) / (down[1] - down[0]);
    const r = (t - up[0]) / (up[1] - up[0]);
    const raised = t < down[0] ? 1 : t < down[1] ? 1 - k : t < up[0] ? 0 : t < up[1] ? r : 1;
    return { type: "gate", x, y, dir, up: raised, flash: t >= down[0] - 0.6 && t < up[1] };
  };

  // A train of carriages (the engine first) along heading h on the line y
  // (h 0: going down-right along x), its engine's middle at x0 + v(t - at).
  function train(y, h, x0, at, v, cars = 3) {
    const step = h === 0 ? -2.62 : 2.62;
    return [...Array(cars)].map((_, i) => (t) => (t < at ? null : { type: "train", x: x0 + (h === 0 ? 1 : -1) * v * (t - at) + i * step, y, h, engine: i === 0 }));
  }

  // A bubble over someone while one of the cars is near them.
  function whenNear(of, cars, text, color) {
    return (t) => {
      const a = of(t);
      if (!a || a.alpha < 1) return null;
      const near = cars.some((c) => {
        const q = c(t);
        return q && Math.hypot(q.x - a.x, q.y - a.y) < 4.2;
      });
      return near ? { type: "bubble", x: a.x, y: a.y, z: 46, text, color } : null;
    };
  }

  const GREEN_INK = "#1b7a3a";
  const RED_INK = "#c62828";

  /* ── The scenes: each makes { at, cam, view, loop, still, cast } ── */

  // The boy's way over the zebra at x: down the sidewalk to the curb, the
  // `stay` steps there, across, and off along the far sidewalk.
  const across = (x, stay = []) => path(x, -3.2, [["to", x, -0.4], ...stay, ["to", x, 3], ["to", x + 3.4, 3]]);

  // A car waiting at x on a lane the whole loop.
  const parked = (x, lane, look) => car(path(x, lane === "w" ? WL : EL, [["wait", 99]]), lane === "w" ? 2 : 0, look);

  const [A, B, C, D] = CROSSROADS;

  // The class on the sidewalk, one after another a step apart, a grown-up
  // first; on a trip one last too, and the kids in bright vests.
  function column({ word, trip = false }) {
    const Y = -1.25;
    const V = 1.2;
    const D = 8;
    const loop = D / V + 1.4;
    const walk = (x, kind, v, wear) => walker(path(x, Y, [["to", x + D, Y]], V), kind, v, [0, D / V], wear);
    const lead = walk(7.4, "man", 1);
    const kids = [6.3, 5.35, 4.4, 3.45].map((x, i) => walk(x, "kid", i % 3, trip ? { vest: true } : {}));
    const cast = [pass("w", 0.6, 4, loop), pass("e", 3.6, 1, loop), pass("w", 6.6, 3, loop), lead, ...kids];
    if (trip) {
      const last = walk(2.35, "man", 2);
      cast.push(last, bubble(lead, "מבוגר", 50, 0, Infinity, GREEN_INK), bubble(last, "מבוגר", 50, 0, Infinity, GREEN_INK));
    } else cast.push(bubble(kids[1], word, 46, 0, Infinity, GREEN_INK));
    return { at: A, cam: trip ? [8.1, -2.1] : [8.9, -1.85], view: trip ? [290, 218] : VIEW, loop, still: 3.4, cast };
  }

  // From home to school at the lights: along the sidewalk to the crosswalk,
  // over it on green, and back along the other sidewalk (the green way).
  // `short`: also the short way straight over the road (red, crossed out),
  // which the cars drive over.
  function toSchool(short) {
    const HOME = 6.4;
    const Y0 = -1.3;
    const Y1 = 2.75;
    const loop = 11.2;
    const CARS = [[0, "green"], [1.6, "blink"], [2.8, "yellow"], [4, "red"], [9.6, "redyellow"], [10.4, "green"]];
    const WALKS = [[0, "red"], [4.8, "green"], [9.2, "red"]];
    const GO = 5;
    const way = (dx, dy) => path(HOME + dx, Y0 + dy, [["to", Z + dx, Y0 + dy], ["to", Z + dx, -0.45], ["till", GO, 1], ["to", Z + dx, Y1 + dy], ["to", HOME + dx, Y1 + dy]]);
    const boy = way(0, 0);
    const dad = way(0.45, -0.4);
    const k = walker(boy, "kid", 0, [0, endOf(boy)]);
    const cast = [
      mark("trail", [[HOME, Y0], [Z, Y0], [Z, Y1], [HOME - 0.6, Y1]], { color: GREEN_INK }),
      bothLights(CARS, WALKS, 3.7),
      pass("w", 0.1, 1, loop),
      stopGo("w", 5.6, 10.6, 4, loop),
      pass("e", 0, 5, loop),
      k,
      walker(dad, "man", 1, [0, endOf(dad)]),
    ];
    if (short) {
      cast.unshift(mark("trail", [[HOME + 1.2, Y0 + 0.3], [HOME + 1.2, Y1 - 0.3]], { color: RED_INK }), mark("cross", [[HOME + 1.2, 1]]));
      cast.push(label(HOME + 1.2, 1, "קצר", 18, RED_INK), label(Z, 1, "בטוח", 18, GREEN_INK));
    } else {
      cast.push(label(HOME, Y0, "הבית", 10), label(HOME - 0.6, Y1, "בית הספר", 10));
    }
    return { at: C, cam: [4.2, 0.4], view: [300, 226], loop, still: 6, cast };
  }

  // Signs in a row on the sidewalk, each with its name over it; a boy walks
  // by and cars go past. list: [kind, name].
  function signRow(list) {
    const loop = 10;
    const x0 = 5.2;
    const STEP = 2.5;
    const cast = [];
    list.forEach(([kind, name], i) => cast.push(sign(kind, x0 + i * STEP, 2.4), label(x0 + i * STEP, 2.4, name, 59)));
    cast.push(kid(path(2.6, 3.3, [["to", 13.4, 3.3]], 1.3)), pass("w", 1, 3, loop), pass("e", 4.4, 1, loop), pass("w", 6.8, 5, loop));
    return { at: D, cam: [x0 + ((list.length - 1) * STEP) / 2 - 1.1, 1.3], view: list.length > 2 ? [290, 218] : NEAR, loop, still: 2.4, cast };
  }

  // The markings at the crosswalk (from the street's crossroads): the zebra,
  // the stop line before it, the solid line down the middle and the red-and-
  // white curb by it; `at`: where its name goes.
  const MARKS = {
    zebra: { pts: [[2.04, 0.04], [2.96, 0.04], [2.96, 1.96], [2.04, 1.96]], word: "מעבר חצייה", at: [2.5, 1.5] },
    stop: { pts: [[3.38, 0.05], [3.66, 0.05], [3.66, 0.95], [3.38, 0.95]], word: "קו עצירה", at: [3.52, 0.5] },
    center: { pts: [[4, 0.88], [9.4, 0.88], [9.4, 1.12], [4, 1.12]], word: "קו הפרדה", at: [7.2, 1] },
    curb: { pts: [[3.2, -0.16], [6.4, -0.16], [6.4, 0.24], [3.2, 0.24]], word: "אדום-לבן", at: [4.8, 0] },
  };
  const PAINTED = [mark("line", [[3.52, 0.05], [3.52, 0.95]], { w: 4.6 }), mark("line", [[3.66, 1], [15, 1]], { w: 2.6 }), mark("curb", [[3.2, 0], [6.4, 0]])];
  const STOP = 4.42;

  // The street with its markings; `ids`: the ones pointed out (a glowing
  // ring and its name), one after another every 2.6 s when there are more.
  function markings(ids) {
    const on = (i) => (t) => ids.length === 1 || Math.floor(t / 2.6) % ids.length === i;
    const show = ids.flatMap((id, i) => {
      const m = MARKS[id];
      const lit = on(i);
      return [glow(m.pts, lit), (t) => (lit(t) ? { type: "bubble", x: m.at[0], y: m.at[1], z: 10, text: m.word } : null)];
    });
    if (ids.length === 1 && ids[0] === "curb") {
      // nobody stops by the curb, so the boy sees and is seen; the cars park further on
      const f = across(Z, [["wait", 2.6, 1]]);
      const k = kid(f);
      const curb = reach(f, "y", -0.4);
      const loop = endOf(f) + 0.6;
      return {
        at: B,
        cam: [3.6, -0.1],
        loop,
        still: curb + 1.4,
        cast: [...PAINTED, ...show, parked(8.2, "w", 3), pass("e", curb - 1.2, 5, loop), k, bubble(k, "רואים טוב", 46, curb, curb + 2.6, GREEN_INK)],
      };
    }
    // the boy crosses on the zebra; the car stops before the stop line for him
    const f = across(Z, [["wait", 0.8, 1]]);
    const curb = reach(f, "y", -0.4);
    const off = reach(f, "y", 2.3);
    const c = path(13, WL, [["wait", Math.max(0, curb + 0.2 - toStop(13, STOP))], ["to", 7.8, WL, DRIVE], ["brake", STOP, WL], ["wait", off - curb], ["start", 1, WL], ["to", -9, WL]], DRIVE);
    const loop = Math.max(endOf(c), endOf(f)) + 0.6;
    const cr = car(c, 2, 1, (t) => (t >= c[2][0] && t < c[4][0] ? "brake" : null));
    const cast = [...PAINTED, ...show, cr, pass("e", -1.4, 5, loop), pass("e", off + 0.8, 0, loop), kid(f)];
    return { at: B, cam: [3.5, 0.2], loop, still: reach(f, "y", 0.6), cast };
  }

  // Out of town, on the bare land past downtown's front edge: a field
  // painted green, with trees on it.
  const GRASS = "#a6d176";
  const TREES = ["streetTree", "parkPine", "yardTree", "yardPine"];
  const field = (x0, y0, x1, y1) => mark("fill", [[x0, y0], [x1, y1]], { color: GRASS });
  const treeRow = (x0, x1, y, step = 3, skip = () => false) => {
    const out = [];
    for (let x = x0, i = 0; x <= x1; x += step, i++) if (!skip(x)) out.push(prop(TREES[(i + Math.round(y)) % TREES.length], Math.round(x), y));
    return out;
  };

  // The intercity road: 4 lanes along x (y 95..99), a solid line down the
  // middle. Cars going up-left keep to y 95.5 / 96.5, down-right to 97.5 / 98.5.
  const HW = 95;
  const FAST = 5;
  const highway = (x0, x1) => [
    field(x0 - 6, 86, x1 + 6, 110),
    mark("fill", [[x0, HW], [x1, HW + 4]]),
    mark("line", [[x0, HW + 0.14], [x1, HW + 0.14]], { w: 2 }),
    mark("line", [[x0, HW + 3.86], [x1, HW + 3.86]], { w: 2 }),
    mark("dashes", [[x0, HW + 1], [x1, HW + 1]]),
    mark("dashes", [[x0, HW + 3], [x1, HW + 3]]),
    mark("line", [[x0, HW + 2], [x1, HW + 2]], { w: 3 }),
    ...treeRow(x0 - 2, x1 + 2, HW - 3),
    ...treeRow(x0 - 0.7, x1 + 2, HW + 6),
  ];
  // A car on the intercity road: lane 0..3 from the top, setting off at `at` in a loop.
  const hwCar = (lane, at, look, loop, x0, x1, v = FAST) => {
    const y = HW + 0.5 + lane;
    return lane < 2 ? drive(x1, y, x0, y, 2, at, look, loop, v) : drive(x0, y, x1, y, 0, at, look, loop, v);
  };

  const SCENES = {
    // מדרכה וכביש: a boy on the sidewalk, cars on the road.
    sidewalk: () => {
      const loop = 10;
      return {
        at: A,
        cam: [8.4, 0.6],
        loop,
        still: 4.2,
        cast: [
          kid(path(3, -1.2, [["to", 15, -1.2]])),
          pass("w", 0.4, 1, loop),
          pass("e", 2.6, 3, loop),
          pass("w", 5.6, 5, loop),
          pass("e", 7.8, 0, loop),
          label(7.6, -1.7, "מדרכה", 6),
          label(9.6, 1, "כביש", 4),
        ],
      };
    },

    // רחוק משפת הכביש: walking on the side away from the road.
    far: () => {
      const loop = 10;
      const k = kid(path(3, -1.72, [["to", 15, -1.72]]));
      return {
        at: A,
        cam: [8.4, 0.4],
        loop,
        still: 4.2,
        cast: [k, pass("w", 0.6, 4, loop), pass("e", 3.4, 1, loop), pass("w", 6.4, 3, loop), bubble(k, "רחוק מהכביש", 46, 0, Infinity, GREEN_INK)],
      };
    },

    // אין מדרכה: on the grass by the road, on its left, facing the cars.
    noside: () => {
      const loop = 10;
      const r0 = [10, 11, 12, 13, 14].find((x) => R.isRoad(x, 40));
      const k = kid(path(r0 - 0.7, 47, [["to", r0 - 0.7, 34]], 1.4));
      return {
        at: [0, 0],
        cam: [r0 + 0.2, 40.8],
        loop,
        still: 4.4,
        cast: [
          k,
          drive(r0 + 0.5, 30, 52, 1, 1.4, 1, loop),
          drive(r0 + 0.5, 30, 52, 1, 6.6, 3, loop),
          drive(r0 + 1.5, 52, 30, 3, 3.8, 5, loop),
          bubble(k, "מול המכוניות", 46, 0, Infinity, GREEN_INK),
        ],
      };
    },

    // מעבר חצייה: the boy crosses on the zebra; the car stops for him.
    zebra: () => {
      const f = across(Z, [["wait", 0.8, 1]]);
      const curb = reach(f, "y", -0.4);
      const off = reach(f, "y", 2.3);
      const c = path(13, WL, [["wait", Math.max(0, curb + 0.2 - toStop(13, 4.2))], ["to", 7.6, WL, DRIVE], ["brake", 4.2, WL], ["wait", off - curb], ["start", 0, WL], ["to", -9, WL]], DRIVE);
      const loop = Math.max(endOf(c), endOf(f)) + 0.6;
      return { at: B, cam: [3, 0.9], loop, still: reach(f, "y", 1), cast: [car(c, 2, 3), pass("e", -1.4, 5, loop), kid(f)] };
    },

    // עוצרים בשפת המדרכה: the boy stops at the edge, cars go by.
    stop: () => {
      const f = across(Z, [["wait", 3.4, 1]]);
      const curb = reach(f, "y", -0.4);
      const k = kid(f);
      const loop = endOf(f) + 0.6;
      return {
        at: B,
        cam: [3, 0.9],
        loop,
        still: curb + 1.5,
        cast: [pass("w", curb - 1.6, 1, loop), pass("e", curb - 1, 5, loop), k, bubble(k, "עוצרים", 46, curb, curb + 3.4, RED_INK)],
      };
    },

    // מסתכלים לשני הצדדים: left, right and left again, then across.
    look: () => {
      const f = across(Z, [["wait", 1.2, 0], ["wait", 1.2, 2], ["wait", 1.1, 0], ["wait", 0.3, 1]]);
      const at = reach(f, "y", -0.4);
      const k = kid(f);
      const loop = endOf(f) + 0.6;
      const look = (text, from) => bubble(k, text, 46, from, from + 1.05);
      return {
        at: B,
        cam: [3, 0.9],
        loop,
        still: at + 0.6,
        cast: [pass("w", at - 2.4, 1, loop), k, look("שמאלה", at), look("ימינה", at + 1.2), look("שמאלה", at + 2.4)],
      };
    },

    // חוצים בהליכה: the walkers' light is green, the cars wait.
    walk: () => {
      const f = across(Z - 0.2);
      const m = path(Z + 3.6, 3, [["wait", 0.6], ["to", Z + 0.3, 3], ["to", Z + 0.3, -3.2]], 1.3);
      const loop = endOf(m) + 0.6;
      return {
        at: B,
        cam: [3, 0.9],
        loop,
        still: reach(f, "y", 1),
        cast: [
          bothLights([[0, "red"]], [[0, "green"]], 3.7),
          parked(4.6, "w", 4),
          parked(-1.4, "e", 1),
          pass("s", 0.2, 5, loop),
          pass("n", 3.6, 0, loop),
          kid(f),
          walker(m, "man", 1, [0.6, endOf(m)]),
        ],
      };
    },

    // מה זה רמזור: the crossroads' lights go round; cars and the boy follow them.
    lights: () => {
      const loop = 15;
      const CARS = [[0, "green"], [4.3, "blink"], [5.5, "yellow"], [6.8, "red"], [13.8, "redyellow"]];
      const WALKS = [[0, "red"], [7.6, "green"], [12.6, "red"]];
      // the boy gets to the curb on red and crosses on green
      const f = path(Z, -3.2, [["wait", 3.4], ["to", Z, -0.4], ["wait", 7.8 - 3.4 - 2.8 / WALK, 1], ["to", Z, 3], ["to", Z + 3.4, 3]]);
      // a car waits on red at the end of the loop, and goes on green at its start
      const waits = car(path(4.2, WL, [["wait", 0.5], ["start", 0, WL], ["to", -9, WL]], DRIVE), 2, 1);
      const comes = car(path(13, WL, [["wait", 8.6], ["to", 7.6, WL, DRIVE], ["brake", 4.2, WL], ["wait", 99]], DRIVE), 2, 1);
      return {
        at: C,
        cam: [3, 0.9],
        loop,
        still: 9.2,
        cast: [
          bothLights(CARS, WALKS, 3.7),
          (t) => (t < 8.6 ? waits(t) : comes(t)),
          pass("w", 1.4, 3, loop),
          pass("e", 0.6, 5, loop),
          pass("e", 2.6, 0, loop),
          pass("s", 7.2, 4, loop),
          pass("n", 9.2, 6, loop),
          walker(f, "kid", KID, [3.4, endOf(f)]),
        ],
      };
    },

    // איש אדום: the walkers' light is red; the boy stands and waits.
    plightRed: () => {
      const loop = 8;
      return {
        at: C,
        cam: [3.1, 0.8],
        view: NEAR,
        loop,
        still: 2,
        cast: [
          walkLight([[0, "red"]]),
          carLight([[0, "green"]]),
          walker(path(Z - 0.1, -0.45, [["wait", 99, 1]])),
          walker(path(Z + 0.3, 2.45, [["wait", 99, 3]]), "man", 2),
          pass("w", 0.3, 1, loop),
          pass("e", 1.9, 5, loop),
          pass("w", 4.2, 3, loop),
          pass("e", 5.8, 0, loop),
        ],
      };
    },

    // איש ירוק: the walkers' light is green; the boy crosses.
    plightGreen: () => {
      const f = across(Z - 0.1, [["wait", 0.3, 1]]);
      const loop = endOf(f) + 0.6;
      return {
        at: C,
        cam: [3.1, 0.8],
        view: NEAR,
        loop,
        still: reach(f, "y", 0.9),
        cast: [walkLight([[0, "green"]]), carLight([[0, "red"]]), parked(4.7, "w", 4), parked(-1.4, "e", 1), pass("s", 1, 5, loop), pass("n", 4, 0, loop), kid(f)],
      };
    },

    // התחלף לאדום באמצע: the boy starts over on green; halfway the man turns
    // red (in Israel it doesn't flash first), and he walks on to the other
    // side. The cars wait for him.
    plightMidway: () => {
      const f = across(Z - 0.1, [["wait", 0.3, 1]]);
      const mid = reach(f, "y", 1);
      const over = reach(f, "y", 2.4);
      const loop = endOf(f) + 0.6;
      const k = kid(f);
      return {
        at: C,
        cam: [3.1, 0.8],
        view: NEAR,
        loop,
        still: mid + 0.5,
        cast: [
          walkLight([[0, "green"], [mid, "red"]]),
          carLight([[0, "red"], [over + 0.6, "redyellow"]]),
          car(path(4.6, WL, [["wait", 99]]), 2, 4),
          pass("s", 1, 5, loop),
          k,
          bubble(k, "ממשיכים", 46, mid, over, GREEN_INK),
        ],
      };
    },

    // רמזור למכוניות: red, red and yellow, green, flashing green, yellow —
    // the car does as it says.
    clight: () => {
      const loop = 12;
      const CARS = [[0, "red"], [3, "redyellow"], [4, "green"], [7, "blink"], [8.4, "yellow"], [9.6, "red"]];
      const NAMES = { red: ["אדום", RED_INK], redyellow: ["אדום וצהוב", "#b26a00"], green: ["ירוק", GREEN_INK], blink: ["ירוק מהבהב", GREEN_INK], yellow: ["צהוב", "#b26a00"] };
      const waits = car(path(4.2, WL, [["wait", 4.2], ["start", 0, WL], ["to", -9, WL]], DRIVE), 2, 0);
      const comes = car(path(13, WL, [["wait", 8], ["to", 7.6, WL, DRIVE], ["brake", 4.2, WL], ["wait", 99]], DRIVE), 2, 0);
      return {
        at: C,
        cam: [2.6, -0.8],
        view: NEAR,
        loop,
        still: 1,
        cast: [
          carLight(CARS, 3.6, -0.4),
          (t) => (t < 8 ? waits(t) : comes(t)),
          pass("w", 5, 5, loop),
          pass("s", 9.7, 3, loop),
          (t) => {
            const [text, color] = NAMES[stateAt(CARS, t)];
            return { type: "bubble", x: 3.6, y: -0.4, z: 78, text, color };
          },
        ],
      };
    },

    // מה זה תמרור: three signs along the street.
    signs: () => {
      const loop = 10;
      return {
        at: D,
        cam: [7.6, 1.5],
        view: NEAR,
        loop,
        still: 2,
        cast: [
          sign("stop", 5.8, 2.4),
          sign("crosswalk", 7.2, 2.4),
          sign("children", 9.9, 2.4),
          kid(path(3.4, 3.3, [["to", 13, 3.3]], 1.3)),
          pass("w", 1, 3, loop),
          pass("e", 4.4, 1, loop),
          pass("w", 6.8, 5, loop),
        ],
      };
    },

    // תמרור עצור: the car stops right by the sign, lets the other car by, goes on.
    stopSign: () => {
      const c = path(13, WL, [["to", 7.6, WL, DRIVE], ["brake", 4.2, WL], ["wait", 2.6], ["start", 0, WL], ["to", -9, WL]], DRIVE);
      const stop = c[2][0];
      const cr = car(c, 2, 1);
      const x = path(0.5, -9, [["wait", stop - 1.2], ["to", 0.5, 11, DRIVE]]);
      return {
        at: D,
        cam: [3.2, 0.6],
        view: NEAR,
        loop: endOf(c) + 0.4,
        still: stop + 0.8,
        cast: [sign("stop", 3.75, -0.4), cr, car(x, 1, 5), bubble(cr, "עוצרים", 46, stop, stop + 2.6, RED_INK)],
      };
    },

    // מעבר חצייה (תמרור): the blue sign by the zebra, the boy crosses on it.
    crosswalkSign: () => {
      const f = across(Z - 0.1, [["wait", 0.8, 1]]);
      const curb = reach(f, "y", -0.4);
      const off = reach(f, "y", 2.3);
      const c = path(13, WL, [["wait", Math.max(0, curb + 0.2 - toStop(13, 4.4))], ["to", 7.8, WL, DRIVE], ["brake", 4.4, WL], ["wait", off - curb], ["start", 0, WL], ["to", -9, WL]], DRIVE);
      return { at: D, cam: [3.2, 0.8], view: NEAR, loop: Math.max(endOf(c), endOf(f)) + 0.6, still: reach(f, "y", 0.9), cast: [sign("crosswalk", 3.45, -0.4), car(c, 2, 5), kid(f)] };
    },

    // זהירות ילדים: kids on the sidewalk, the car goes slowly.
    children: () => {
      const c = car(path(15, WL, [["to", -3, WL, 1.9]], 1.9), 2, 3);
      return {
        at: D,
        cam: [8, 1.4],
        view: NEAR,
        loop: 10,
        still: 3.4,
        cast: [
          sign("children", 8.8, 2.4),
          kid(path(3.6, 3.1, [["to", 13, 3.1]], 1.1), 0),
          kid(path(2.8, 3.6, [["to", 12.2, 3.6]], 1.1), 2),
          c,
          bubble(c, "לאט", 40, 0, Infinity, GREEN_INK),
        ],
      };
    },

    // אין כניסה: a one-way street; cars only come out of it.
    noentry: () => {
      const loop = 9;
      return {
        at: A,
        cam: [1.8, 0.2],
        view: NEAR,
        loop,
        still: 2,
        cast: [sign("noentry", 2.35, -0.45), pass("s", 0.5, 1, loop), pass("s", 5, 3, loop), pass("w", 2.4, 5, loop), pass("e", 6.4, 0, loop)],
      };
    },

    // מכוניות חונות: the boy steps out between parked cars; the driver can't see him.
    parked: () => {
      const loop = 11;
      const f = path(6.2, 3.4, [["wait", 0.4, 3], ["to", 6.2, 2.1], ["to", 6.2, 1.6, 0.8], ["wait", 1.8, 3], ["to", 6.2, 3.4], ["to", 9.8, 3.4]]);
      const out = reach(f, "y", 1.6);
      const k = kid(f);
      return {
        at: A,
        cam: [6.2, 1.5],
        view: NEAR,
        loop,
        still: out + 0.8,
        cast: [parked(5, "e", 1), parked(7.4, "e", 4), pass("w", out + 0.4 - 2, 0, loop), k, bubble(k, "!", 46, out + 0.2, out + 1.8, RED_INK)],
      };
    },

    // נוסעת אחורה: between two buildings a car backs out over the sidewalk,
    // its white lights on; the boy and his dad stop and wait till it's gone.
    reverse: () => {
      const X = 10.2;
      const lit = 1.8;
      const out = path(X, -4.4, [["wait", 2.3], ["start", X, -3.4, 1.3], ["to", X, -0.5, 1.3], ["brake", X, WL, 1.3], ["wait", 0.5]], 1.3);
      const turn = endOf(out);
      const away = path(X, WL, [["start", X - 4, WL], ["to", -9, WL]], DRIVE);
      const backs = car(out, 3, 1, (t) => (t >= lit ? "reverse" : null));
      const goes = car(away, 2, 1);
      const c = (t) => (t < turn ? { ...backs(t), alpha: fade(t, 0, Infinity) } : goes(t - turn));
      // they stop short of the lamp post, so it doesn't hide them
      const f = path(3.6, -1.5, [["to", 6.8, -1.5, 1.2], ["wait", turn + 0.6 - 3.2 / 1.2, 0], ["to", 15.4, -1.5, 1.2]]);
      const m = path(3.1, -0.95, [["to", 6.3, -0.95, 1.2], ["wait", turn + 0.6 - 3.2 / 1.2, 0], ["to", 14.9, -0.95, 1.2]]);
      const k = kid(f);
      const loop = endOf(f) + 0.4;
      return {
        at: D,
        cam: [9.22, -2.02],
        view: [306, 218],
        loop,
        still: 5.6,
        cast: [
          c,
          pass("e", 4.6 - 19 / DRIVE + loop, 5, loop),
          pass("e", 11.2 - 19 / DRIVE, 3, loop),
          k,
          walker(m, "man", 2, [0, endOf(m)]),
          bubble(c, "נוסעת אחורה", 44, lit, turn),
          bubble(k, "עוצרים", 46, 3.2 / 1.2, turn + 0.6, RED_INK),
        ],
      };
    },

    // מכונית לא עוצרת מיד: a ball rolls into the road and both cars brake at
    // the same spot — the slow one stops far from it, the fast one only just.
    // The boy stays on the sidewalk; his dad fetches the ball once it's safe.
    brake: () => {
      const BX = 5.5;
      const FEET = [BX, -0.95];
      const DAD = [6.3, -1.45];
      const T = 2.4;
      const REACT = 0.5;
      const DECEL = 1.7;
      const roll = path(...FEET, [["to", BX, 0, 1.6], ["brake", BX, 0.45, 1.6]]);
      const kick = T - reach(roll, "y", 0);
      // where both see the ball: the fast car stops with its front a little short of it
      const seen = BX + 0.7 + 0.72 + DRIVE * REACT + (DRIVE * DRIVE) / (2 * DECEL);
      const run = (v, look) => {
        const stopAt = seen - v * REACT - (v * v) / (2 * DECEL);
        const stop = T + REACT + v / DECEL;
        // to the ball, back to the boy to put it down by his feet, and back to his place
        const keys = path(...DAD, [["wait", stop + 0.5, 1], ["to", BX + 0.25, 0.15, 1.4], ["wait", 0.4], ["to", BX + 0.35, FEET[1], 1.4], ["wait", 0.4, 2], ["to", ...DAD, 1.4], ["wait", 0.3, 1]]);
        const picked = keys[2][0] + 0.2;
        const down = keys[4][0] + 0.2;
        const go = keys[4][0] + 0.3;
        const c = path(seen + v * T, WL, [["to", seen, WL, v], ["to", seen - v * REACT, WL, v], ["brake", stopAt, WL, v], ["wait", go - stop], ["start", stopAt - 3, WL, DRIVE], ["to", -9, WL, DRIVE]]);
        const ball = (u) => {
          if (u < kick || u >= down) return null;
          if (u < picked) return { ...track(roll, u - kick), z: 0 };
          const p = track(keys, u);
          return { x: p.x - 0.12, y: p.y + 0.06, z: 16 };
        };
        return { car: car(c, 2, look, (u) => (u >= T + REACT && u < go ? "brake" : null)), dad: walker(keys, "man", 2), stop, go, ball, len: reach(c, "x", 1.5) };
      };
      const slow = run(DRIVE / 2, 1);
      const fast = run(DRIVE, 0);
      const s2 = slow.len - 2;
      const loop = s2 + fast.len - 2;
      const u2 = (t) => mod(t - s2, loop);
      const half = (from, len, fn) => (t) => {
        const u = mod(t - from, loop);
        return u < len ? fn(u) : null;
      };
      const dad = (t) => (u2(t) >= fast.stop && u2(t) < fast.len ? fast.dad(u2(t)) : slow.dad(t));
      const ball = (t) => ({ type: "ball", ...(fast.ball(u2(t)) || slow.ball(t) || { x: FEET[0], y: FEET[1], z: 0 }) });
      const slowCar = half(0, slow.len, slow.car);
      const fastCar = half(s2, fast.len, fast.car);
      return {
        at: C,
        cam: [7.85, -0.35],
        view: [270, 200],
        loop,
        still: slow.stop + 0.3,
        cast: [
          slowCar,
          fastCar,
          walker(path(BX, -1.3, [["wait", 99, 1]])),
          dad,
          ball,
          // only while it drives: stopped, the fast car's would hide the boy
          half(0, slow.len, bubble(slow.car, "לאט", 40, 0, slow.stop - 0.4, GREEN_INK)),
          half(s2, fast.len, bubble(fast.car, "מהר", 40, 0, fast.stop - 0.4, RED_INK)),
        ],
      };
    },

    // בחושך: at night the boy in a bright vest shines in the headlights; the one in dark clothes can't be seen.
    night: () => {
      const loop = 11;
      const cars = [pass("w", 1.2, 1, loop), pass("e", 4.8, 6, loop), pass("w", 7.6, 3, loop)];
      const bright = kid(path(4.6, -1.05, [["to", 15, -1.05]], 1.1), 0, "kid", { vest: true });
      const dark = kid(path(2, -1.05, [["to", 12.4, -1.05]], 1.1), 1, "kid", { dark: true });
      return {
        at: A,
        cam: [8, -0.5],
        night: true,
        loop,
        still: 2.6,
        cast: [...cars, bright, dark, whenNear(bright, cars, "רואים", GREEN_INK), whenNear(dark, cars, "לא רואים", RED_INK)],
      };
    },

    // מחכים בתחנה: the boy waits by the bus stop, away from the curb, until the bus stops.
    busWait: () => {
      const s = R.busStop;
      const road = [1, 2, 3, 4, 5].map((d) => s.y + d).find((y) => R.isRoad(s.x, y));
      const lane = road + 0.5;
      const door = s.x;
      // the bus's door is 1 tile ahead of its middle, on its right (the curb's) side
      const mid = door + 1.02;
      const b = path(mid + 13, lane, [["to", mid + 4.5, lane, DRIVE], ["brake", mid, lane], ["wait", 3.2], ["start", mid - 4, lane], ["to", mid - 9, lane]], DRIVE);
      const stop = b[2][0];
      const wait = s.y + 1.3;
      const f = path(door + 3.4, wait, [["to", door + 0.4, wait, 1.2], ["wait", stop + 0.4 - 3 / 1.2, 1], ["to", door, road - 0.25, 0.9]]);
      const k = walker(f, "kid", KID, [0, endOf(f)]);
      const loop = endOf(b) + 0.4;
      return {
        at: [0, 0],
        cam: [s.x, s.y + 1.35],
        view: NEAR,
        loop,
        still: stop - 1.2,
        cast: [bus(b, 2), drive(s.x - 12, lane + 1, s.x + 14, lane + 1, 0, 0.8, 5, loop), k, bubble(k, "מחכים", 46, 3 / 1.2, stop + 0.4, RED_INK)],
      };
    },

    // ירדנו מהאוטובוס: off the bus, wait till it has gone, then over the zebra.
    busAfter: () => {
      const mid = 7.2;
      const door = mid - 1.02;
      const b = path(15, WL, [["to", mid + 4.5, WL, DRIVE], ["brake", mid, WL], ["wait", 2.4], ["start", mid - 4, WL], ["to", -10, WL]], DRIVE);
      const off = b[2][0] + 0.5;
      const gone = reach(b, "x", 0.4);
      const f = path(door, -0.2, [["wait", off], ["to", door, -1.5, 0.9], ["wait", gone - off - 1.45, 1], ["to", Z, -1.5], ["to", Z, -0.4], ["wait", 0.5, 0], ["to", Z, 3], ["to", Z + 3.4, 3]]);
      const k = walker(f, "kid", KID, [off, endOf(f)]);
      return {
        at: B,
        cam: [5.2, 0.3],
        loop: endOf(f) + 0.5,
        still: off + 2.2,
        cast: [sign("bus", 6.4, -0.38), bus(b, 2), pass("e", off - 2, 5, endOf(f) + 0.5), k, bubble(k, "מחכים", 46, off + 1.45, gone, RED_INK)],
      };
    },

    // קסדה – תמיד!: riding in the park with a helmet on.
    bikeHelmet: () => {
      const loop = 8;
      const r = rider(path(63.4, 76.4, [["to", 69.6, 76.4, 2]], 2));
      return {
        at: [0, 0],
        cam: [66.3, 75.9],
        view: NEAR,
        loop,
        still: 1.6,
        cast: [r, rider(path(69.6, 75.6, [["wait", 3.4], ["to", 63.4, 75.6, 2]], 2), { v: 0 }), bubble(r, "קסדה", 54, 0, 3.3, GREEN_INK)],
      };
    },

    // שביל אופניים: the blue sign where the bike path starts; riders on it.
    bikePath: () => {
      const loop = 8;
      return {
        at: [0, 0],
        cam: [66.3, 75.8],
        view: NEAR,
        loop,
        still: 1.4,
        cast: [sign("bike", 67.5, 74.6), rider(path(63.4, 76.4, [["to", 69.6, 76.4, 2]], 2)), rider(path(69.6, 75.6, [["wait", 3.6], ["to", 63.4, 75.6, 2]], 2), { v: 2 })],
      };
    },

    // רואים אותנו: at night the bike's white light in front and red one at the back.
    bikeLights: () => {
      const loop = 8;
      return {
        at: [0, 0],
        cam: [66.3, 75.9],
        view: NEAR,
        night: true,
        loop,
        still: 1.4,
        cast: [rider(path(63.4, 76.4, [["to", 69.6, 76.4, 2]], 2), { lamps: true }), rider(path(69.6, 75.6, [["wait", 3.6], ["to", 63.4, 75.6, 2]], 2), { v: 0, lamps: true })],
      };
    },

    // מרווח בטור: one after another, a step apart.
    groupGap: () => column({ word: "מרווח" }),
    // יוצאים לטיול: the class with a grown-up first and one last.
    groupTrip: () => column({ trip: true }),
    // בוחרים דרך בטוחה: the way to school we chose.
    schoolRoute: () => toSchool(false),
    // קצר או בטוח?: the short way over the road, or the safe one at the lights.
    shortSafe: () => toSchool(true),

    // The three kinds of signs, and stop / give way.
    signsWarn: () => signRow([["children", "ילדים"], ["walkers", "מעבר חצייה"]]),
    signsBan: () => signRow([["noentry", "אין כניסה"], ["nowalk", "אסור ללכת"]]),
    signsStop: () => signRow([["stop", "עצור"], ["giveway", "תן זכות קדימה"]]),
    signsInfo: () => signRow([["crosswalk", "מעבר חצייה"], ["bus", "תחנה"], ["parking", "חניה"]]),

    // ציורים על הכביש: each marking pointed out in turn; then one each.
    marksAll: () => markings(["zebra", "stop", "center", "curb"]),
    marksZebra: () => markings(["zebra"]),
    marksStop: () => markings(["stop"]),
    marksCenter: () => markings(["center"]),
    marksCurb: () => markings(["curb"]),

    // כביש רחב: two lanes each way, the solid line between them.
    wideRoad: () => {
      const loop = 10;
      const x0 = 3.1;
      const x1 = 22;
      const lanes = [-0.5, 0.5, 1.5, 2.5];
      const go = (lane, at, look, v = DRIVE) =>
        lane < 2 ? drive(x1 - 0.5, lanes[lane], x0 + 0.3, lanes[lane], 2, at, look, loop, v) : drive(x0 + 0.3, lanes[lane], x1 - 0.5, lanes[lane], 0, at, look, loop, v);
      return {
        at: D,
        cam: [9.8, 0.5],
        loop,
        still: 2.6,
        cast: [
          mark("fill", [[x0, -1], [x1, 0.3]]),
          mark("fill", [[x0, 1.92], [x1, 3]]),
          mark("curb", [[x0, -1], [x1, -1]], { color: "#a9a191" }),
          mark("line", [[x0, 3], [x1, 3]], { color: "rgba(43,29,14,0.32)", w: 1.2 }),
          mark("dashes", [[x0, 0], [x1, 0]]),
          mark("dashes", [[x0, 2], [x1, 2]]),
          mark("line", [[x0, 1], [x1, 1]], { w: 2.6 }),
          glow([[6.6, 0.88], [13.4, 0.88], [13.4, 1.12], [6.6, 1.12]]),
          go(0, 0.3, 1),
          go(1, 2.2, 3, 2.8),
          go(2, 1, 5),
          go(3, 3.4, 6, 2.8),
          go(0, 5.6, 4),
          go(1, 7.4, 0),
          go(2, 6.2, 2),
          go(3, 8.6, 1, 2.8),
          kid(path(5.6, -1.5, [["to", 14.4, -1.5]], 1.2), 1),
          label(8.8, 0, "2 נתיבים", 12),
          label(11.8, 2, "2 נתיבים", 12),
        ],
      };
    },

    // מפגש עם מסילה: out of town the road crosses the railway; the lights
    // flash, the barriers come down, the cars and the boy wait for the train.
    railCross: () => {
      const RX = 40;
      const RY = 96;
      const loop = 13.6;
      const down = [1.8, 3];
      const up = [8.2, 9.2];
      const go = 9.6;
      const braking = (t) => (t >= 1.8 && t < go ? "brake" : null);
      const north = path(RX + 0.5, 84, [["to", RX + 0.5, 90.1, DRIVE], ["brake", RX + 0.5, 93.5], ["till", go], ["start", RX + 0.5, 96.9], ["to", RX + 0.5, 112]], DRIVE);
      const south = path(RX + 1.5, 108, [["to", RX + 1.5, 101.9, DRIVE], ["brake", RX + 1.5, 98.5], ["till", go + 0.3], ["start", RX + 1.5, 95.1], ["to", RX + 1.5, 80]], DRIVE);
      const f = path(RX - 1.7, 89.4, [["to", RX - 1.7, 94.1], ["till", up[1] + 0.2, 1], ["to", RX - 1.7, 101.4]]);
      const k = walker(f, "kid", 2, [0, endOf(f)]);
      return {
        at: [0, 0],
        cam: [RX + 0.2, RY - 1.6],
        view: [290, 218],
        loop,
        still: 5.9,
        cast: [
          field(26, 86, 56, 110),
          mark("fill", [[RX, 86], [RX + 2, 110]]),
          mark("line", [[RX + 0.12, 86], [RX + 0.12, 110]], { w: 2 }),
          mark("line", [[RX + 1.88, 86], [RX + 1.88, 110]], { w: 2 }),
          mark("dashes", [[RX + 1, 86], [RX + 1, 110]]),
          mark("line", [[RX + 0.06, 94.1], [RX + 0.94, 94.1]], { w: 4.4 }),
          mark("line", [[RX + 1.06, 97.9], [RX + 1.94, 97.9]], { w: 4.4 }),
          mark("rails", [[26, RY], [56, RY]], { gap: [13.9, 16.1] }),
          prop("streetTree", 36, 92),
          prop("parkPine", 35, 99),
          prop("yardPine", 44, 92),
          prop("streetTree", 45, 100),
          prop("parkPine", 37, 102),
          prop("yardTree", 47, 93),
          prop("parkFlowers", 43, 94),
          sign("rail", RX - 0.45, 90.4),
          gate(RX - 0.35, RY - 1.4, 0, down, up),
          gate(RX + 2.35, RY + 1.4, 2, down, up),
          car(north, 1, 1, braking),
          car(south, 3, 5, braking),
          ...train(RY, 0, 24, 3.2, 6.5),
          k,
          bubble(k, "מחכים", 46, down[0], up[1], RED_INK),
        ],
      };
    },

    // חגורת בטיחות: dad and the boy get in on the sidewalk's side and buckle
    // up — over the shoulder and the hips — and only then the car goes.
    beltCar: () => {
      const loop = 11.6;
      const CX = 7;
      const boy = path(9.8, -1.2, [["to", CX + 0.35, -1.2], ["to", CX + 0.35, -0.3, 1.2]]);
      const dad = path(10.4, -1.6, [["to", CX - 0.3, -1.6], ["to", CX - 0.3, -0.3, 1.2]]);
      const sit = Math.max(endOf(boy), endOf(dad)) + 0.3;
      const go = sit + 3.9;
      const drives = car(path(CX, WL, [["till", go], ["start", CX - 3.4, WL], ["to", -9, WL]], DRIVE), 2, 1);
      const cr = (t) => ({ ...drives(t), alpha: fade(t, 0, Infinity) });
      const says = [["חוגרים", sit, sit + 1.3], ["על הכתף", sit + 1.3, sit + 2.6], ["ועל הירכיים", sit + 2.6, go]];
      return {
        at: D,
        cam: [7.6, -0.3],
        view: NEAR,
        loop,
        still: sit + 1.8,
        cast: [
          cr,
          pass("e", 1.2, 3, loop),
          pass("e", 7.6, 0, loop),
          walker(boy, "kid", 0, [0, endOf(boy)]),
          walker(dad, "man", 1, [0, endOf(dad)]),
          ...says.map(([text, from, to]) => bubble(cr, text, 46, from, to, GREEN_INK)),
          bubble(cr, "חגורים", 46, go, go + 2.4, GREEN_INK),
        ],
      };
    },

    // יושבים וחוגרים: the shuttle stops, the kids get on one by one, sit
    // down and buckle up; only then it goes.
    beltShuttle: () => {
      const s = R.busStop;
      const road = [1, 2, 3, 4, 5].map((d) => s.y + d).find((y) => R.isRoad(s.x, y));
      const lane = road + 0.5;
      const door = s.x;
      const mid = door + 1.02;
      const b = path(mid + 13, lane, [["to", mid + 4.5, lane, DRIVE], ["brake", mid, lane], ["wait", 5.6], ["start", mid - 4, lane], ["to", mid - 9, lane]], DRIVE);
      const stop = b[2][0];
      const leave = b[3][0];
      const wait = s.y + 1.3;
      const kids = [0, 1, 2].map((i) => {
        const keys = path(door + 0.6 + i * 0.75, wait, [["till", stop + 0.4 + i * 1, 1], ["to", door, road - 0.25, 0.9]]);
        return walker(keys, "kid", i, [0, endOf(keys)]);
      });
      const bs = bus(b, 2);
      return {
        at: [0, 0],
        cam: [s.x, s.y + 1.35],
        view: NEAR,
        loop: endOf(b) + 0.4,
        still: leave - 0.8,
        cast: [bs, ...kids, bubble(bs, "יושבים וחוגרים", 62, stop + 3.4, leave, GREEN_INK), bubble(bs, "חגורים", 62, leave, leave + 2.2, GREEN_INK)],
      };
    },

    // נסיעה בחג: a long way on the intercity road, buckled up all the way;
    // the camera rides along with the family's car.
    beltTrip: () => {
      const x0 = 12;
      const x1 = 72;
      const V = 3.4;
      const loop = 36 / V;
      const fx = (t) => 21 + V * t;
      const fam = (t) => ({ type: "car", x: fx(t), y: HW + 3.5, h: 0, look: 4 });
      return {
        at: [0, 0],
        cam: (t) => [fx(t) + 0.5, HW + 2.1],
        loop,
        still: 3,
        cast: [
          ...highway(x0, x1),
          fam,
          hwCar(2, 1, 1, loop, x0, x1, 5.4),
          hwCar(1, 0.4, 3, loop, x0, x1),
          hwCar(0, 2.6, 5, loop, x0, x1),
          hwCar(1, 5.2, 0, loop, x0, x1),
          hwCar(0, 7.4, 2, loop, x0, x1),
          bubble(fam, "חגורים כל הדרך", 46, 0, Infinity, GREEN_INK),
        ],
      };
    },

    // כביש בין-עירוני: fast cars on four lanes, no sidewalk, and the sign: no walking here.
    intercity: () => {
      const x0 = 26;
      const x1 = 56;
      const loop = 8;
      return {
        at: [0, 0],
        cam: [40.8, HW + 2.2],
        loop,
        still: 2.2,
        cast: [
          ...highway(x0, x1),
          sign("nowalk", 41.2, HW + 4.4),
          label(41.2, HW + 4.4, "אסור ללכת", 59, RED_INK),
          sign("speed", 44.4, HW + 4.4, 90),
          hwCar(0, 0.2, 1, loop, x0, x1),
          hwCar(1, 1.6, 3, loop, x0, x1),
          hwCar(2, 0.8, 5, loop, x0, x1),
          hwCar(3, 2.4, 0, loop, x0, x1),
          hwCar(0, 4.2, 4, loop, x0, x1),
          hwCar(2, 4.8, 2, loop, x0, x1),
          hwCar(3, 6.2, 6, loop, x0, x1),
          hwCar(1, 5.6, 1, loop, x0, x1),
        ],
      };
    },

    // צומת: cars come from every side and take turns by the lights; the boy
    // crosses on his green.
    junction: () => {
      const loop = 16;
      const STREET = [[0, "green"], [4.8, "blink"], [6, "yellow"], [7, "red"], [15.2, "redyellow"]];
      const CROSS = [[0, "red"], [7.6, "redyellow"], [8.2, "green"], [12.4, "blink"], [13.6, "yellow"], [14.6, "red"]];
      const WALKS = [[0, "red"], [8.4, "green"], [13.2, "red"]];
      const f = path(Z, -3.2, [["to", Z, -0.45], ["till", 8.6, 1], ["to", Z, 3], ["to", Z + 3.4, 3]]);
      return {
        at: C,
        cam: [1.4, 0.9],
        loop,
        still: 4.6,
        cast: [
          bothLights(STREET, WALKS, 3.7),
          carLight(CROSS, -0.4, -1.5),
          pass("w", 0.2, 1, loop),
          pass("e", 1, 5, loop),
          stopGo("w", 8.6, 16.3, 3, loop),
          stopGo("e", 9.2, 16.5, 6, loop),
          stopGo("s", 2.6, 8.4, 4, loop),
          stopGo("n", 3.4, 8.6, 2, loop),
          pass("s", 9.6, 0, loop),
          pass("n", 10.4, 5, loop),
          walker(f, "kid", 0, [0, endOf(f)]),
        ],
      };
    },

    // ליד הצומת: by the crossroads the cars slow down, so it's easy for
    // them to stop for the boy.
    junctionSlow: () => {
      const c = path(12, WL, [["to", 8.8, WL, DRIVE], ["to", 6.6, WL, 1.6], ["brake", STOP, WL, 1.6], ["wait", 3.2], ["start", 1, WL], ["to", -9, WL]], DRIVE);
      const stop = c[3][0];
      const cr = car(c, 2, 1, (t) => (t >= c[2][0] && t < c[4][0] ? "brake" : null));
      const f = across(Z, [["till", stop + 0.2, 1]]);
      return {
        at: B,
        cam: [3.8, 0],
        loop: endOf(c) + 0.4,
        still: c[2][0] + 0.6,
        cast: [cr, pass("e", 0.6, 5, endOf(c) + 0.4), kid(f), bubble(cr, "מאטה", 40, c[1][0], stop, GREEN_INK)],
      };
    },
  };

  /* ── Playing them ── */

  const boxes = new Map();
  let raf = 0;

  function paint(b, t, clock) {
    const { scene, plan } = b;
    const [ax, ay] = plan.at;
    const view = plan.view || VIEW;
    // a camera that moves (following a car) is a function of the time
    const cam = typeof plan.cam === "function" ? plan.cam(t) : plan.cam;
    scene.cam = { x: ax + cam[0], y: ay + cam[1], zoom: Math.min(scene.w / view[0], scene.h / view[1]) };
    scene.night = !!plan.night;
    const actors = [];
    for (const part of plan.cast) {
      const a = part(t);
      if (a) actors.push({ ...a, x: a.x + ax, y: a.y + ay });
    }
    scene.draw(clock, actors);
  }

  function frame(now) {
    raf = 0;
    let any = false;
    for (const [box, b] of boxes) {
      if (!box.isConnected) {
        seen.unobserve(box);
        sized.unobserve(box);
        boxes.delete(box);
        continue;
      }
      if (!b.on || !b.scene.w) continue;
      if (REDUCED) {
        if (b.dirty) paint(b, b.plan.still, b.plan.still);
      } else {
        const clock = (now - b.t0) / 1000;
        paint(b, mod(clock, b.plan.loop), clock);
        any = true;
      }
      b.dirty = false;
    }
    if (any) tick();
  }

  const tick = () => (raf ||= requestAnimationFrame(frame));

  const seen = new IntersectionObserver((list) => {
    for (const { target, isIntersecting } of list) {
      const b = boxes.get(target);
      if (!b) continue;
      if (isIntersecting && !b.on) b.t0 = performance.now();
      b.on = isIntersecting;
      b.dirty = true;
    }
    tick();
  });

  const sized = new ResizeObserver((list) => {
    for (const { target } of list) {
      const b = boxes.get(target);
      if (!b) continue;
      b.scene.resize();
      b.dirty = true;
    }
    tick();
  });

  function mount(box) {
    const make = SCENES[box.dataset.city];
    if (!make || boxes.has(box)) return;
    const canvas = document.createElement("canvas");
    canvas.className = "lf-city-canvas";
    canvas.setAttribute("aria-hidden", "true");
    // as lesson-player.css has it, for a page without it
    canvas.style.cssText = "position:absolute;inset:0;display:block;width:100%;height:100%";
    box.style.position = "relative";
    box.prepend(canvas);
    box.classList.add("is-live");
    boxes.set(box, { scene: new R.Scene(canvas), plan: make(), t0: performance.now(), on: false, dirty: true });
    seen.observe(box);
    sized.observe(box);
    if (!box.classList.contains("lf-city--big")) zoomable(box);
  }

  /* ── Big: a tap on a scene plays it over the whole screen ── */

  const CLOSE_ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>`;
  let big = null;
  let bigFrom = null;

  function zoomable(box) {
    box.classList.add("is-zoomable");
    box.setAttribute("role", "button");
    box.setAttribute("aria-label", "הגדלה למסך מלא");
    box.tabIndex = 0;
    box.addEventListener("click", () => enlarge(box));
    box.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      enlarge(box);
    });
  }

  // The big one is a new box of the same scene, so it mounts like any other.
  // Inside the lesson player when there is one: it sits above the page.
  function enlarge(box) {
    shrink();
    big = document.createElement("div");
    big.className = "lf-city-big";
    big.innerHTML = `<button type="button" class="lf-city-big-close" aria-label="סגירה">${CLOSE_ICON}</button><div class="lf-city lf-city--big" data-city="${box.dataset.city}"></div>`;
    big.addEventListener("click", shrink);
    bigFrom = box;
    (box.closest(".lesson-player") || document.body).appendChild(big);
    big.querySelector("button").focus();
  }

  function shrink() {
    if (!big) return;
    big.remove();
    big = null;
    if (bigFrom.isConnected) bigFrom.focus({ preventScroll: true });
  }

  // Escape closes the big scene only (not the lesson), and the arrows don't
  // turn the slide under it.
  window.addEventListener(
    "keydown",
    (e) => {
      if (!big || !/^(Escape|Arrow)/.test(e.key)) return;
      e.stopImmediatePropagation();
      if (e.key === "Escape") shrink();
    },
    true
  );

  const scan = (root) => root.querySelectorAll?.(".lf-city:not(.is-live)").forEach(mount);

  new MutationObserver((list) => {
    for (const m of list) for (const node of m.addedNodes) if (node.nodeType === 1) node.matches(".lf-city") ? mount(node) : scan(node);
  }).observe(document.documentElement, { childList: true, subtree: true });
  scan(document);

  // A still of a scene at time t, into a canvas (for checking them by eye).
  function still(canvas, id, t) {
    const plan = SCENES[id]();
    paint({ scene: new R.Scene(canvas), plan }, t ?? plan.still, t ?? plan.still);
    return plan;
  }

  window.RoadLessons = { SCENES, still };
})();
