/* תקין או לא תקין? — a game on the PAT city (road-city.js): each round a
   different case at a crossroads downtown (the fox crosses, gets off a bus;
   a car drives up to a light or a sign; grandpa, a boy on a bike); the
   picture stops at the moment that matters and the player says whether it
   was right. road-safety.js lists the game and calls
   RsCases.start(stage, ui, kit).

   Every case is written around a crossroads: its box is tiles x 0..2,
   y 0..2. The street the cases happen on runs along x (down-right on
   screen): cars going up-left (heading 2) drive on y 0.5, cars going
   down-right (heading 0) on y 1.5. Its zebra is the column x 2..3, the
   sidewalks are y -2..0 (north) and y 2..4 (south). */

(function () {
  const R = window.RoadCity;
  if (!R) return;

  // Downtown's four crossroads (their top tile): each case is played at one.
  const CROSSROADS = [[34, 48], [52, 48], [34, 66], [52, 66]];
  // What the camera must show (world units: a tile is 64 wide, 32 high).
  const VIEW_W = 350;
  const VIEW_H = 290;
  const WALK = 1.7;
  const DRIVE = 3.4;
  const Z = 2.5;
  const WL = 0.5;
  const EL = 1.5;
  const CAM = [3.3, 0.6];

  const shuffle = (list) => {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  /* ── Paths: keys [t, x, y, opts]; a key's opts (ease, face, v) are for the
     stretch from it to the next key ── */

  // From (x, y): ["to", x, y, speed?] at a steady speed, ["brake", x, y] to
  // a stop, ["start", x, y] from a stop, ["wait", seconds, face?].
  function path(x, y, steps, v = WALK) {
    const keys = [[0, x, y, {}]];
    let t = 0;
    for (const [kind, a, b, c] of steps) {
      const cur = keys[keys.length - 1];
      if (kind === "wait") {
        if (b != null) cur[3].face = b;
        t += a;
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

  /* ── The cast: each is a function of the time ── */

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

  // The fox on a path; there from `from` on (off a bus, say).
  function fox(keys, from = 0) {
    return (t) => {
      if (t < from) return null;
      const p = track(keys, t);
      const f = R.facing(headingAt(keys, p));
      const rate = p.moving ? (keys[p.i][3].v || WALK) / WALK : 1;
      return { type: "fox", x: p.x, y: p.y, anim: p.moving ? "walk" : "idle", back: f.back, flip: f.flip, ms: t * 1000 * rate };
    };
  }

  // One of the city's people ("kid", "grandpa", "man") on a path, fading in
  // at `from`; `wear`: { dark } or { vest }.
  function person(keys, kind, from = 0, v = 1, wear = {}) {
    return (t) => {
      if (t < from) return null;
      const p = track(keys, t);
      const f = R.facing(headingAt(keys, p));
      return { type: "person", kind, v, ...wear, x: p.x, y: p.y, walking: p.moving, back: f.back, flip: f.flip, ms: t * 1000, alpha: Math.min(1, (t - from) / 0.4) };
    };
  }

  // A boy on a bike, a helmet on.
  function rider(keys) {
    return (t) => {
      const p = track(keys, t);
      return { type: "rider", x: p.x, y: p.y, h: headingAt(keys, p), v: 1, helmet: true, moving: p.moving, ms: t * 1000 };
    };
  }

  // Its brake lights on while it brakes.
  function car(keys, h, look = Math.floor(Math.random() * R.CAR_LOOKS)) {
    return (t) => {
      const p = track(keys, t);
      return { type: "car", x: p.x, y: p.y, h, look, back: p.moving && keys[p.i][3].ease === "out" ? "brake" : undefined };
    };
  }

  function bus(keys, h) {
    return (t) => {
      const p = track(keys, t);
      return { type: "bus", x: p.x, y: p.y, h };
    };
  }

  function service(keys, h, kind = "ambulance") {
    return (t) => {
      const p = track(keys, t);
      return { type: "service", kind, x: p.x, y: p.y, h };
    };
  }

  // A ball by someone's feet, rolling along its path from `from` on.
  function ball(keys, from) {
    return (t) => {
      const p = track(keys, Math.max(0, t - from));
      return { type: "ball", x: p.x, y: p.y, z: 0 };
    };
  }

  // A light's states from times on: [[0, "red"], [2, "green"], ...];
  // "blink" is a flashing green (held on while the picture stands still) —
  // only on the cars' light: in Israel the walkers' green doesn't flash, it
  // turns straight to red.
  function light(type, x, y, steps) {
    return (t, still) => {
      let on = steps[0][1];
      for (const [at, s] of steps) if (t >= at) on = s;
      if (on === "blink") on = still || Math.floor(t * 2.5) % 2 === 0 ? "green" : "off";
      return { type, x, y, on };
    };
  }

  const sign = (kind, x, y, value) => () => ({ type: "sign", kind, x, y, value });

  // A bubble over another of the cast, between two times. The canvas
  // writes left to right: the marks keep "40 קמ״ש" and "צפצוף!" in Hebrew order.
  function bubble(of, text, z, from = 0, to = Infinity) {
    const rtl = `‏${text}‏`;
    return (t, still) => {
      if (t < from || t >= to) return null;
      const a = of(t, still);
      return a && { type: "bubble", x: a.x, y: a.y, z, text: rtl };
    };
  }

  /* ── The cases: none of them plain (a green light and nothing else);
     each has a catch to notice — the man that turns red halfway, the
     second lane, the ambulance, the bus that pulls away. The picture stops
     once the catch shows (the car already past the line, the honk). ── */

  const ASK_FOX = "האם השועל עשה נכון?";
  const ASK_CAR = "האם הנהג נהג נכון?";
  const walkLight = (steps) => light("walkLight", 3.3, -0.35, steps);
  const carLight = (steps) => light("carLight", 3.85, -0.35, steps);
  const waiting = (x = 4.4) => car(path(x, WL, [["wait", 20]]), 2);

  // Halfway over when the man turns red (the walkers' green doesn't flash).
  const HALF = 1.6;
  const turnsRed = () => walkLight([[0, "green"], [HALF, "red"]]);

  // Grandpa crosses slowly from the south side, and is still on the zebra
  // when the cars' light turns green (at GO), right in front of the car.
  const GO = 3;
  const slowly = () => path(Z, 2, [["wait", 0.2, 3], ["to", Z, -1.3, 0.5], ["wait", 9, 3]]);
  const grandpaLights = () => [walkLight([[0, "green"], [1, "red"]]), carLight([[0, "red"], [GO - 0.4, "redyellow"], [GO, "green"]])];

  // A bus stopped at x 6.4 on the north lane; its door is a tile ahead of
  // its middle, on the sidewalk's side.
  const BUS_MID = 6.4;
  const BUS_DOOR = BUS_MID - 1.02;

  // A car stopped on the south lane with a boy getting out of it.
  const PARKED = 6.4;

  // A ball rolls from by his feet on the north sidewalk to the north lane.
  const BALL_X = 5.6;
  const KICK = 0.7;
  const rolls = () => path(BALL_X, -0.95, [["to", BALL_X, 0, 1.6], ["brake", BALL_X, 0.45, 1.6]]);

  // Waiting for the bus, which pulls in to the stop: on the curb's edge
  // (`edge`), or back by the wall until it has stopped.
  function busWait(edge) {
    const b = path(BUS_MID + 7, WL, [["to", BUS_MID + 2.6, WL], ["brake", BUS_MID, WL], ["wait", 20]], DRIVE);
    const stop = b[2][0];
    const near = reach(b, "x", BUS_MID + 2.2);
    const x = BUS_DOOR - 0.1;
    const f = edge
      ? path(x, -1.2, [["wait", 0.3, 0], ["to", x, -0.1, 1.2], ["wait", near + 0.6 - (0.3 + 1.1 / 1.2), 0], ["to", x, -0.7, 2.4], ["wait", 9, 0]])
      : path(x, -1.2, [["wait", stop + 0.3, 0], ["to", BUS_DOOR, -0.3, 1.2], ["wait", 9, 1]]);
    const bs = bus(b, 2);
    const fx = fox(f);
    return {
      ok: !edge,
      ask: "האם השועל מחכה במקום טוב?",
      cam: [4.6, 0.3],
      say: "השועל מחכה לאוטובוס",
      why: edge
        ? "מחכים לאוטובוס רחוק משפת המדרכה. הוא נכנס לתחנה קרוב מאוד אליה."
        : "חיכה רחוק משפת המדרכה, והלך לדלת רק כשהאוטובוס עצר לגמרי.",
      pause: near,
      end: edge ? stop + 0.4 : endOf(f) - 9 + 0.4,
      cast: [sign("bus", BUS_MID - 0.8, -0.38), bs, fx, ...(edge ? [bubble(bs, "צפצוף!", 56, near - 0.2, stop), bubble(fx, "!", 66, near - 0.1, stop + 0.4)] : [])],
    };
  }

  // At night a boy waits by a crosswalk with no lights as a car comes: in
  // a bright vest the driver sees him from far and stops; in dark clothes
  // the driver doesn't see him, and drives on.
  function atNight(vest) {
    const c = vest ? path(14, WL, [["to", 8.2, WL], ["brake", 4.1, WL], ["wait", 20]], DRIVE) : path(14, WL, [["to", -8, WL]], DRIVE);
    const stop = vest ? c[2][0] : 0;
    const k = vest ? path(Z + 0.1, -1.5, [["to", Z + 0.1, -0.5, 1], ["wait", stop - 0.6, 0], ["to", Z + 0.1, 3.1, 1]]) : path(Z + 0.1, -1.5, [["to", Z + 0.1, -0.5, 1], ["wait", 20, 0]]);
    const at = reach(c, "x", 6.6);
    const kid = person(k, "kid", 0, 1, vest ? { vest: true } : { dark: true });
    return {
      ok: vest,
      night: true,
      ask: "האם הילד לבוש נכון לחושך?",
      say: "בלילה: ילד מחכה במעבר החצייה",
      why: vest
        ? "בלילה לובשים אפוד זוהר או בגדים בהירים. הנהג ראה את הילד מרחוק, ועצר."
        : "בבגדים כהים בלילה הנהגים לא רואים אותך. לובשים אפוד זוהר או בגדים בהירים.",
      pause: at,
      end: vest ? reach(k, "y", 2.4) : reach(c, "x", 0),
      cast: [car(c, 2), kid, ...(vest ? [] : [bubble(kid, "!", 56, at + 0.4, at + 1.6)])],
    };
  }

  // Green for the car, and a fire engine comes down the cross street: the
  // car waits for it (`waits`), or drives on and has to stop in the middle.
  function fireEngine(waits) {
    if (waits) {
      const s = path(0.5, -12, [["wait", 1.5], ["to", 0.5, 12, 6]]);
      const go = reach(s, "y", 2.1) + 0.4;
      const brake = [["to", 7.9, WL], ["brake", 4.1, WL]];
      const stop = endOf(path(13, WL, brake, DRIVE));
      const c = path(13, WL, [...brake, ["wait", go - stop], ["start", 0, WL], ["to", -7, WL]], DRIVE);
      const fe = service(s, 1, "fire");
      return {
        ok: true,
        ask: ASK_CAR,
        cam: [2.4, -0.5],
        say: "מכונית מגיעה לרמזור ירוק",
        why: "ירוק לנהג – אבל כבאית עם סירנה באה. הנהג עצר ונתן לה לעבור קודם.",
        pause: reach(s, "y", -2.1),
        end: reach(c, "x", 0),
        cast: [walkLight([[0, "red"]]), carLight([[0, "green"]]), car(c, 2), fe, bubble(fe, "סירנה", 56, 0, reach(s, "y", 1))],
      };
    }
    // it drives into the crossroads, and stops right in the fire engine's way
    const c = path(13, WL, [["to", 3.6, WL], ["brake", 1, WL], ["wait", 9]], DRIVE);
    const at = reach(c, "x", 3.9);
    const s = path(0.5, -12, [["wait", at - 9.6 / 6], ["to", 0.5, -2.2], ["brake", 0.5, -1], ["wait", 9]], 6);
    const fe = service(s, 1, "fire");
    return {
      ok: false,
      ask: ASK_CAR,
      cam: [2.4, -0.5],
      say: "מכונית מגיעה לרמזור ירוק",
      why: "גם בירוק: שומעים סירנה? עוצרים ונותנים לכבאית לעבור קודם.",
      pause: c[2][0] - 0.3,
      end: c[2][0] + 0.6,
      cast: [walkLight([[0, "red"]]), carLight([[0, "green"]]), car(c, 2), fe, bubble(fe, "סירנה", 56)],
    };
  }

  // Waiting at the red: off on the red-and-yellow (`early`), or not till the
  // green. The picture stops with the early car already out on the zebra.
  function redYellow(early) {
    const c = path(4.1, WL, [["wait", early ? 1.05 : 2.75], ["start", 1.5, WL, 2.4], ["to", -8, WL, 2.4]]);
    return {
      ok: !early,
      ask: ASK_CAR,
      say: "מכונית מחכה ברמזור",
      why: early ? "אדום וצהוב ביחד – עוד לא נוסעים! מתכוננים, ומחכים לירוק." : "אדום וצהוב – עוד מחכים. הנהג יצא רק כשהאור התחלף לירוק.",
      pause: 2.55,
      end: reach(c, "x", 0),
      cast: [walkLight([[0, "red"]]), carLight([[0, "red"], [1, "redyellow"], [2.7, "green"]]), car(c, 2)],
    };
  }

  const CASES = [
    // (the first is the game's card too)
    () => {
      const f = path(Z, -1.4, [["wait", 0.5, 1], ["to", Z, 3.1]]);
      const wl = turnsRed();
      return {
        ok: true,
        say: "השועל חוצה במעבר החצייה",
        why: "התחיל לחצות בירוק, ובאמצע האיש התחלף לאדום? ממשיכים בהליכה עד הצד השני – לא חוזרים אחורה.",
        pause: reach(f, "y", 1.3),
        end: endOf(f) + 0.3,
        cast: [wl, carLight([[0, "red"]]), waiting(), fox(f), bubble(wl, "התחלף לאדום", 84, HALF, 3.4)],
      };
    },
    () => {
      const f = path(Z, -1.4, [["wait", 0.5, 1], ["to", Z, 0.9], ["wait", 0.35, 1], ["to", Z, -1.2, 2.6], ["wait", 3, 1]]);
      const wl = turnsRed();
      const back = f[3][0];
      return {
        ok: false,
        say: "השועל חוצה במעבר החצייה",
        why: "האיש התחלף לאדום באמצע? לא חוזרים אחורה – ממשיכים בהליכה לצד השני.",
        pause: back + 0.3,
        end: back + 1.2,
        cast: [wl, carLight([[0, "red"]]), waiting(), fox(f), bubble(wl, "התחלף לאדום", 84, HALF, 3.4)],
      };
    },
    // The cars' green flashes, turns yellow, then red, and the car stops:
    // he goes, but his man is still red.
    () => {
      const c = path(12, WL, [["to", 7.9, WL], ["brake", 4.1, WL], ["wait", 20]], DRIVE);
      const stop = c[2][0];
      const f = path(Z, -0.45, [["wait", stop + 0.3, 1], ["to", Z, 3.1]]);
      const wl = walkLight([[0, "red"]]);
      return {
        ok: false,
        say: "השועל מחכה לאיש הירוק",
        why: "המכונית עצרה – אבל האיש עוד אדום. חוצים רק כשהאיש ירוק.",
        pause: reach(f, "y", 0.4),
        end: endOf(f) + 0.3,
        cast: [wl, carLight([[0, "blink"], [0.9, "yellow"], [2.3, "red"]]), car(c, 2), fox(f), bubble(wl, "עוד אדום", 84, stop + 0.3)],
      };
    },
    // Green for him, but a car comes on through its red: he steps out
    // without looking, and it stops right by him.
    () => {
      const f = path(Z, -0.45, [["wait", 1.6, 1], ["to", Z, 0.25], ["wait", 1.1, 1], ["to", Z, 3.1]]);
      const c = path(13, WL, [["to", 5.2, WL], ["brake", 3.45, WL], ["wait", 9]], 4.6);
      const cr = car(c, 2);
      const fx = fox(f);
      const at = reach(c, "x", 3.7);
      return {
        ok: false,
        say: "השועל מחכה לאיש הירוק",
        why: "האיש ירוק – אבל המכונית לא עצרה! גם בירוק מסתכלים, ומחכים שהמכוניות יעצרו לגמרי.",
        pause: at,
        end: endOf(f) + 0.3,
        cast: [walkLight([[0, "red"], [1.5, "green"]]), carLight([[0, "red"]]), cr, fx, bubble(cr, "צפצוף!", 112, at - 0.25, at + 1.2), bubble(fx, "!", 66, at - 0.15, at + 1.1)],
      };
    },
    // One car stopped for him; the other lane didn't.
    () => {
      const a = path(13, WL, [["to", 7.6, WL], ["brake", 4.1, WL], ["wait", 20]], DRIVE);
      const f = path(Z, -0.45, [["wait", a[2][0] + 0.2, 1], ["to", Z, 0.95], ["wait", 2, 1], ["to", Z, 3.1]]);
      const at = reach(f, "y", 0.8);
      const b = path(-12, EL, [["wait", at - 0.75 - 9.4 / DRIVE], ["to", -2.6, EL], ["brake", 0.9, EL], ["wait", 20]], DRIVE);
      const cb = car(b, 0);
      const fx = fox(f);
      const scare = f[2][0];
      return {
        ok: false,
        cam: [2.8, 0.9],
        say: "מכונית עוצרת לשועל",
        why: "מכונית אחת עצרה – זה לא אומר שכולן עצרו. בודקים גם את הנתיב השני.",
        pause: at,
        end: reach(f, "y", 2.3),
        cast: [car(a, 2), cb, fx, bubble(cb, "צפצוף!", 50, at - 0.3, at + 1.4), bubble(fx, "!", 66, at - 0.1, scare + 1.6)],
      };
    },
    () => {
      const f = path(Z, -0.45, [["wait", 3.3, 1], ["to", Z, 3.1]]);
      const s = path(16, EL, [["to", -9, EL]], 6.5);
      const amb = service(s, 2);
      return {
        ok: true,
        say: "השועל רוצה לחצות את הכביש",
        why: "אמבולנס עם סירנה – מחכים שיעבור, גם כשהאיש ירוק.",
        pause: reach(s, "x", 6),
        end: reach(f, "y", 2.3),
        cast: [walkLight([[0, "green"]]), carLight([[0, "red"]]), waiting(), amb, fox(f), bubble(amb, "סירנה", 50, 0, reach(s, "x", -2))],
      };
    },
    // Waiting for the green, but on the road by the south curb: the car
    // has to go round him.
    () => {
      const f = path(Z, 3.1, [["to", Z, 1.8], ["wait", 9, 3]]);
      const c = path(-8, EL, [["wait", 0.6], ["to", -0.4, EL], ["to", 1.4, 0.95], ["to", 3.6, 0.95], ["to", 5.4, EL], ["to", 14, EL]], 3);
      const cr = car(c, 0);
      const d = path(13, WL, [["wait", 1.6], ["to", -8, WL]], DRIVE);
      return {
        ok: false,
        ask: "האם השועל מחכה במקום טוב?",
        say: "השועל מחכה לאיש הירוק",
        why: "מחכים על המדרכה, צעד לפני שפת הכביש – לא על הכביש.",
        pause: reach(c, "x", -0.6),
        end: reach(c, "x", 6),
        cast: [walkLight([[0, "red"]]), carLight([[0, "green"]]), cr, car(d, 2), fox(f), bubble(cr, "צפצוף!", 50, reach(c, "x", -1.4), reach(c, "x", 4.4))],
      };
    },
    // Off the bus, and over in front of it while it pulls away.
    () => {
      const b = path(BUS_MID + 3.4, WL, [["brake", BUS_MID, WL], ["wait", 20]], DRIVE);
      const off = b[1][0] + 0.4;
      const f = path(BUS_DOOR, -0.2, [["wait", off], ["to", BUS_DOOR, -0.45], ["to", BUS_MID - 2, -0.45], ["to", BUS_MID - 2, 3.1]]);
      const go = reach(f, "y", 0.15);
      // it sets off as he steps in front of it, and stops short
      b.splice(2, 1, [go, BUS_MID, WL, { ease: "in", v: 1.4 }], [go + 0.5, BUS_MID - 0.35, WL, { ease: "out", v: 1.4 }], [go + 0.9, BUS_MID - 0.5, WL, {}], [go + 9, BUS_MID - 0.5, WL, {}]);
      const fx = fox(f, off);
      return {
        ok: false,
        say: "השועל ירד מהאוטובוס",
        why: "לא חוצים לפני אוטובוס שעומד – הנהג לא רואה אותך. מחכים שייסע, וחוצים במעבר החצייה.",
        pause: go + 0.45,
        end: reach(f, "y", 2.3),
        cast: [sign("bus", BUS_MID - 0.8, -0.38), bus(b, 2), fx, bubble(fx, "!", 66, go + 0.5, go + 1.6)],
      };
    },
    // Off the bus: he waits till it has gone, then over the zebra.
    () => {
      const b = path(BUS_MID + 3.4, WL, [["brake", BUS_MID, WL], ["wait", 1.6], ["start", BUS_MID - 3, WL], ["to", -10, WL]], DRIVE);
      const off = b[1][0] + 0.4;
      const leaves = b[2][0];
      // along the sidewalk while it pulls away; at the zebra once it has gone
      const f = path(BUS_DOOR, -0.2, [["wait", off], ["to", BUS_DOOR, -1.4], ["wait", leaves + 0.3 - off - 1.2 / WALK, 1], ["to", Z, -1.4], ["to", Z, -0.4], ["wait", 0.4, 0], ["wait", 0.4, 2], ["to", Z, 3.1]]);
      const fx = fox(f, off);
      return {
        ok: true,
        say: "השועל ירד מהאוטובוס",
        why: "חיכה שהאוטובוס ייסע, הלך למעבר החצייה, הסתכל – ורק אז חצה.",
        pause: reach(f, "y", 0.3),
        end: endOf(f) + 0.2,
        cast: [sign("bus", BUS_MID - 0.8, -0.38), bus(b, 2), fx, bubble(fx, "מחכה", 66, off + 1.2 / WALK, leaves + 0.3)],
      };
    },
    () => {
      const f = path(Z, -1.4, [["wait", 0.6, 1], ["to", Z, 3.1, 4.8]]);
      return {
        ok: false,
        // a still can't show running: the question says it
        ask: "השועל רץ במעבר החצייה. האם זה נכון?",
        say: "השועל רוצה לחצות את הכביש",
        why: "גם בירוק חוצים בהליכה, לא בריצה. בריצה אפשר ליפול.",
        pause: reach(f, "y", 0.9),
        end: endOf(f) + 0.5,
        cast: [walkLight([[0, "green"]]), carLight([[0, "red"]]), waiting(), fox(f)],
      };
    },
    () => {
      const f = path(6.1, 3.2, [["wait", 0.5, 3], ["to", 6.1, -1.3]]);
      const c = path(13, WL, [["to", 9.9, WL, DRIVE], ["brake", 8, WL], ["wait", 5]]);
      return {
        ok: false,
        cam: [4.4, 0.9],
        say: "השועל רוצה לחצות את הכביש",
        why: "לא חוצים בין מכוניות חונות. הנהגים לא רואים אותך.",
        pause: reach(f, "y", 0.95),
        end: endOf(f) + 0.3,
        cast: [car(path(4.9, EL, [["wait", 20]]), 0), car(path(7.3, EL, [["wait", 20]]), 0), car(c, 2), fox(f)],
      };
    },
    () => {
      const r = path(Z, -1.7, [["wait", 0.4, 1], ["to", Z, 3.4, 2.6]]);
      return {
        ok: false,
        ask: "האם הרוכב עשה נכון?",
        say: "ילד על אופניים מגיע למעבר החצייה",
        why: "במעבר חצייה יורדים מהאופניים, ומובילים אותם ביד.",
        pause: reach(r, "y", 0.9),
        end: endOf(r),
        cast: [walkLight([[0, "green"]]), carLight([[0, "red"]]), waiting(), rider(r)],
      };
    },
    () => {
      // out on the road side, then round the back of the car
      const k = path(PARKED + 0.1, 0.92, [["wait", 3.6, 0], ["to", PARKED - 1.2, 0.92, 1], ["to", PARKED - 1.2, 3.1, 1]]);
      const c = path(14, WL, [["wait", 0.8], ["to", -6, WL]], DRIVE);
      return {
        ok: false,
        ask: "האם הילד יצא נכון מהמכונית?",
        say: "הילד יוצא מהמכונית",
        why: "יוצאים מהמכונית רק מהדלת של המדרכה. בצד של הכביש נוסעות מכוניות.",
        cam: [5.4, 1.1],
        pause: reach(c, "x", PARKED + 1.8),
        end: reach(c, "x", PARKED - 3),
        cast: [car(path(PARKED, EL, [["wait", 20]]), 0), person(k, "kid", 0.3), car(c, 2)],
      };
    },
    () => {
      const k = path(PARKED + 0.1, 2.08, [["wait", 0.7, 1], ["to", PARKED + 0.1, 3.1, 1], ["wait", 9, 1]]);
      const c = path(14, WL, [["wait", 0.8], ["to", -6, WL]], DRIVE);
      return {
        ok: true,
        ask: "האם הילד יצא נכון מהמכונית?",
        say: "הילד יוצא מהמכונית",
        why: "יצא מהדלת של המדרכה – רחוק מהמכוניות שנוסעות.",
        cam: [5.4, 1.1],
        pause: reach(c, "x", PARKED + 1.8),
        end: reach(c, "x", PARKED - 3),
        cast: [car(path(PARKED, EL, [["wait", 20]]), 0), person(k, "kid", 0.3), car(c, 2)],
      };
    },
    () => {
      const f = path(Z, -1.4, [["to", Z, -0.5], ["wait", 2.9, 1], ["to", Z, 3.1]]);
      const c = path(12, WL, [["to", 7.9, WL, DRIVE], ["brake", 4.1, WL], ["wait", 2.6], ["start", 0, WL], ["to", -6, WL]], DRIVE);
      return {
        ok: true,
        ask: ASK_CAR,
        say: "מכונית מגיעה למעבר החצייה",
        why: "מישהו מחכה במעבר החצייה? הנהג עוצר לפניו.",
        pause: reach(f, "y", 0.55),
        end: endOf(c) - 0.6,
        cast: [car(c, 2), fox(f)],
      };
    },
    () => {
      const f = path(Z, -1.4, [["to", Z, -0.35], ["wait", 0.55, 1], ["to", Z, -1.2, 2.6], ["wait", 4, 1]]);
      const c = path(13.5, WL, [["to", -7, WL, 4.6]]);
      const fx = fox(f);
      return {
        ok: false,
        ask: ASK_CAR,
        say: "מכונית מגיעה למעבר החצייה",
        why: "השועל חיכה במעבר החצייה. הנהג היה צריך לעצור.",
        pause: reach(c, "x", 3),
        end: reach(c, "x", -3),
        cast: [car(c, 2), fx, bubble(fx, "!", 66, 1.1, 3.4)],
      };
    },
    // Green for the car, but grandpa isn't over yet.
    () => {
      const c = path(4.1, WL, [["wait", GO + 0.05], ["start", 3.85, WL], ["brake", 3.7, WL], ["wait", 1.9], ["start", 0, WL, DRIVE], ["to", -7, WL, DRIVE]], 1.6);
      const cr = car(c, 2);
      return {
        ok: false,
        ask: ASK_CAR,
        say: "סבא חוצה את הכביש לאט",
        why: "האור התחלף לירוק, אבל סבא עוד בכביש. הנהג מחכה שיסיים לחצות.",
        pause: GO + 0.6,
        end: GO + 2.4,
        cast: [...grandpaLights(), cr, person(slowly(), "grandpa"), bubble(cr, "צפצוף!", 50, GO + 0.1, GO + 1.4)],
      };
    },
    () => {
      const c = path(4.1, WL, [["wait", GO + 2.1], ["start", 0, WL], ["to", -7, WL]], DRIVE);
      return {
        ok: true,
        ask: ASK_CAR,
        say: "סבא חוצה את הכביש לאט",
        why: "ירוק לנהג – אבל קודם נותנים לסבא לסיים לחצות.",
        pause: GO + 0.6,
        end: GO + 2.8,
        cast: [...grandpaLights(), car(c, 2), person(slowly(), "grandpa")],
      };
    },
    // A give way sign and no one coming: slow down, look, and go on.
    () => {
      const c = path(12, WL, [["to", 6, WL, DRIVE], ["to", 4.4, WL, 2.2], ["to", 2.4, WL, 1], ["to", 1, WL, 1.6], ["to", -7, WL, 3]]);
      return {
        ok: true,
        ask: ASK_CAR,
        cam: [2.8, 0.6],
        say: "מכונית מגיעה לתמרור",
        why: "תן זכות קדימה: מאטים ומסתכלים. אין אף אחד? אפשר להמשיך בלי לעצור.",
        pause: reach(c, "x", 2.7),
        end: reach(c, "x", -2),
        cast: [sign("giveway", 3.75, -0.4), car(c, 2)],
      };
    },
    () => {
      const c = path(12, WL, [["to", -7, WL, 3.6]]);
      const x = path(0.5, -6.5, [["to", 0.5, -3.4, DRIVE], ["brake", 0.5, -1.7], ["wait", 4]]);
      const cx = car(x, 1);
      return {
        ok: false,
        ask: ASK_CAR,
        cam: [2.8, 0.6],
        say: "מכונית מגיעה לתמרור",
        why: "תן זכות קדימה – נותנים למכונית בכביש השני לעבור קודם.",
        pause: reach(c, "x", 2.4),
        end: reach(c, "x", -2),
        cast: [sign("giveway", 3.75, -0.4), cx, car(c, 2), bubble(cx, "צפצוף!", 50, x[1][0], reach(c, "x", -1))],
      };
    },
    () => {
      const c = path(12, WL, [["to", 7.9, WL, DRIVE], ["brake", 4.1, WL], ["wait", 2], ["start", 0, WL], ["to", -6, WL]], DRIVE);
      const stop = c[2][0];
      const x = path(0.5, -8, [["wait", stop - 1.6], ["to", 0.5, 9, DRIVE]]);
      return {
        ok: true,
        ask: ASK_CAR,
        cam: [2.8, 0.6],
        say: "מכונית מגיעה לתמרור",
        why: "עצר לגמרי בתמרור עצור, ונתן למכונית השנייה לעבור.",
        pause: stop + 0.7,
        end: stop + 3.6,
        cast: [sign("stop", 3.75, -0.4), car(x, 1), car(c, 2)],
      };
    },
    // Speed signs: the number on the car against the number on the sign.
    () => {
      const c = path(15, WL, [["to", -7, WL, 4.6]]);
      const cr = car(c, 2);
      return {
        ok: false,
        ask: ASK_CAR,
        cam: [4.8, 0.5],
        say: "מכונית נוסעת ליד תמרור",
        why: "התמרור אומר 30, והנהג נוסע 40. גם קצת יותר מהר – זה מהר מדי!",
        pause: reach(c, "x", 7.6),
        end: reach(c, "x", 1),
        cast: [sign("speed", 8.6, -0.4, 30), cr, bubble(cr, "40 קמ״ש", 46)],
      };
    },
    () => {
      const c = path(13, WL, [["to", -7, WL, 3.2]]);
      const cr = car(c, 2);
      return {
        ok: true,
        ask: ASK_CAR,
        cam: [4.8, 0.5],
        say: "מכונית נוסעת ליד תמרור",
        why: "התמרור אומר 50 – לא נוסעים יותר מ־50. הנהג נוסע 40, וזה בסדר.",
        pause: reach(c, "x", 7.6),
        end: reach(c, "x", 4.5),
        cast: [sign("speed", 8.6, -0.4, 50), cr, bubble(cr, "40 קמ״ש", 46)],
      };
    },
    () => {
      const f = path(Z, -1.4, [["to", Z, -0.6], ["wait", 4, 1]]);
      const fx = fox(f);
      return {
        ok: false,
        ask: "האם המכונית עומדת במקום טוב?",
        say: "השועל רוצה לחצות את הכביש",
        why: "אסור לעצור על מעבר חצייה. ככה אי אפשר לעבור בו.",
        pause: 1.5,
        end: 2.2,
        cast: [car(path(Z + 0.1, WL, [["wait", 20]]), 2), fx, bubble(fx, "?", 66, 0.9)],
      };
    },
    // Red for him and no car in sight: he looks and goes; one comes fast
    // from the far side.
    () => {
      const f = path(Z, -1.4, [["to", Z, -0.45], ["wait", 0.45, 0], ["wait", 0.45, 2], ["to", Z, 3.1]]);
      const at = reach(f, "y", 0.15);
      const c = path(-8.5, EL, [["wait", at - 0.25], ["to", -1.5, EL], ["brake", 1, EL], ["wait", 9]], 6.5);
      const cr = car(c, 0);
      const fx = fox(f);
      return {
        ok: false,
        say: "השועל רוצה לחצות את הכביש",
        why: "באדום לא חוצים – גם כשהכביש ריק. מכונית יכולה להגיע פתאום, ומהר.",
        pause: reach(f, "y", 0.45),
        end: endOf(f) + 0.3,
        cast: [walkLight([[0, "red"]]), carLight([[0, "green"]]), cr, fx, bubble(cr, "צפצוף!", 50, at + 0.5, at + 2), bubble(fx, "!", 66, at + 0.6, at + 1.9)],
      };
    },
    // Green for him while the car still brakes: he waits till it has stopped.
    () => {
      const c = path(13, WL, [["to", 7.6, WL], ["brake", 4.1, WL], ["wait", 20]], 4.6);
      const f = path(Z, -0.45, [["wait", c[2][0] + 0.5, 1], ["to", Z, 3.1]]);
      return {
        ok: true,
        say: "השועל מחכה לאיש הירוק",
        why: "האיש התחלף לירוק, אבל המכונית עוד נסעה. השועל חיכה שתעצור לגמרי – ורק אז חצה.",
        pause: 2,
        end: endOf(f) + 0.3,
        cast: [walkLight([[0, "red"], [1.5, "green"]]), carLight([[0, "yellow"], [0.7, "red"]]), car(c, 2), fox(f)],
      };
    },
    // A car stops for him, but the far lane is still coming: he waits on the curb.
    () => {
      const a = path(13, WL, [["to", 7.6, WL], ["brake", 4.1, WL], ["wait", 20]], DRIVE);
      const stop = a[2][0];
      const b = path(-12, EL, [["wait", stop - 2.4], ["to", 14, EL]], DRIVE);
      const go = reach(b, "x", 4.4);
      const f = path(Z, -0.45, [["wait", stop + 0.3, 1], ["wait", go - stop - 0.3, 2], ["to", Z, 3.1]]);
      return {
        ok: true,
        cam: [2.8, 0.9],
        say: "מכונית עוצרת לשועל",
        why: "מכונית אחת עצרה, אבל בנתיב השני עוד באה מכונית. השועל חיכה שתעבור – ורק אז חצה.",
        pause: reach(b, "x", 0),
        end: endOf(f) + 0.3,
        cast: [car(a, 2), car(b, 0), fox(f)],
      };
    },
    // A crosswalk with no lights: he walks straight on, without stopping to look.
    () => {
      const f = path(Z, -1.9, [["to", Z, 3.1]]);
      const at = reach(f, "y", 0.1);
      const c = path(12.2, WL, [["wait", Math.max(0, at - 5.6 / 4.6)], ["to", 6.6, WL], ["brake", 4.1, WL], ["wait", 9]], 4.6);
      const cr = car(c, 2);
      const fx = fox(f);
      return {
        ok: false,
        say: "השועל הולך למעבר החצייה",
        why: "גם במעבר חצייה עוצרים על המדרכה, ומסתכלים לשני הצדדים. חוצים רק כשהמכוניות עצרו.",
        pause: at,
        end: endOf(f) + 0.3,
        cast: [cr, fx, bubble(cr, "צפצוף!", 50, at - 0.2, at + 1.4), bubble(fx, "!", 66, at - 0.1, at + 1.2)],
      };
    },
    // His ball rolls into the road, and he runs after it.
    () => {
      const f = path(BALL_X + 0.1, -1.3, [["wait", KICK + 0.35, 1], ["to", BALL_X + 0.1, 0.1, 3.2], ["wait", 9, 1]]);
      const at = reach(f, "y", -0.1);
      const c = path(14.5, WL, [["wait", Math.max(0, at - 4.9 / 4.6)], ["to", 9.6, WL], ["brake", 6.85, WL], ["wait", 9]], 4.6);
      const cr = car(c, 2);
      const fx = fox(f);
      return {
        ok: false,
        cam: [5.4, 0.3],
        say: "הכדור של השועל מתגלגל לכביש",
        why: "כדור התגלגל לכביש? לא רצים אחריו! נשארים על המדרכה, וקוראים למבוגר.",
        pause: at,
        end: c[3][0] + 0.6,
        cast: [ball(rolls(), KICK), cr, fx, bubble(cr, "צפצוף!", 50, at - 0.2, at + 1.6), bubble(fx, "!", 66, at - 0.1, at + 1.8)],
      };
    },
    // His ball rolls into the road: he stays on the sidewalk and calls; a
    // man fetches it once the car has stopped.
    () => {
      const brake = [["wait", 0.9], ["to", 9.6, WL], ["brake", 6.85, WL]];
      const stop = endOf(path(14.5, WL, brake, 4.6));
      const m = path(6.7, -1.5, [["wait", stop + 0.3, 2], ["to", BALL_X + 0.25, 0.2, 1.4], ["wait", 0.4], ["to", 6.7, -1.5, 1.4], ["wait", 9, 2]]);
      const picked = m[2][0] + 0.2;
      const back = m[4][0];
      const c = path(14.5, WL, [...brake, ["wait", back + 0.3 - stop], ["start", 3, WL, DRIVE], ["to", -8, WL, DRIVE]], 4.6);
      const roll = ball(rolls(), KICK);
      const fx = fox(path(BALL_X + 0.1, -1.3, [["wait", 20, 1]]));
      return {
        ok: true,
        cam: [5.4, 0.3],
        say: "הכדור של השועל מתגלגל לכביש",
        why: "השועל נשאר על המדרכה וקרא למבוגר. המבוגר הביא את הכדור – רק כשהמכונית עצרה.",
        pause: KICK + 1.3,
        end: reach(c, "x", 2),
        cast: [
          (t) => {
            if (t < picked) return roll(t);
            const p = track(m, Math.min(t, back));
            return { type: "ball", x: p.x - 0.12, y: p.y + 0.06, z: t < back ? 16 : 0 };
          },
          car(c, 2),
          person(m, "man", 0, 2),
          fx,
          bubble(fx, "הכדור!", 66, KICK + 0.3, stop),
        ],
      };
    },
    () => busWait(true),
    () => busWait(false),
    () => atNight(false),
    () => atNight(true),
    // A short cut: on the green, but corner to corner over the crossroads.
    () => {
      const f = path(2.3, -1.3, [["wait", 0.5, 1], ["to", 2.1, -0.35], ["to", -0.3, 2.35], ["to", -0.5, 3.1]]);
      const at = reach(f, "x", 1.1);
      const c = path(0.5, -10, [["wait", Math.max(0, at - 6.6 / 4.6)], ["to", 0.5, -3.4], ["brake", 0.5, -0.2], ["wait", 9]], 4.6);
      const cr = car(c, 1);
      return {
        ok: false,
        cam: [1.4, 0.7],
        say: "השועל רוצה להגיע לפינה השנייה של הצומת",
        why: "קיצור דרך באלכסון באמצע הצומת – מסוכן! חוצים רק במעבר החצייה, גם כשזה ארוך יותר.",
        pause: at,
        end: endOf(f) + 0.3,
        cast: [walkLight([[0, "green"]]), carLight([[0, "red"]]), cr, fox(f), bubble(cr, "צפצוף!", 50, at + 0.4, at + 1.8)],
      };
    },
    // A stop sign and no one coming: he slows right down, but doesn't stop.
    () => {
      const c = path(12, WL, [["to", 6, WL, DRIVE], ["to", 4.4, WL, 2.2], ["to", 2.4, WL, 0.9], ["to", 1, WL, 1.6], ["to", -7, WL, 3]]);
      const cr = car(c, 2);
      return {
        ok: false,
        ask: ASK_CAR,
        cam: [2.8, 0.6],
        say: "מכונית מגיעה לתמרור",
        why: "בתמרור עצור עוצרים לגמרי – גם כשאין אף אחד. רק להאט זה לא מספיק.",
        pause: reach(c, "x", 3.2),
        end: reach(c, "x", -2),
        cast: [sign("stop", 3.75, -0.4), cr, bubble(cr, "10 קמ״ש", 46, reach(c, "x", 4.4), reach(c, "x", 1.4))],
      };
    },
    () => redYellow(true),
    () => redYellow(false),
    // The green flashes, then turns yellow while the car is still far: it stops.
    () => {
      const c = path(12, WL, [["to", 7.9, WL], ["brake", 4.1, WL], ["wait", 9]], DRIVE);
      const yellow = c[1][0];
      return {
        ok: true,
        ask: ASK_CAR,
        say: "מכונית מגיעה לרמזור",
        why: "ירוק מהבהב, ואחריו צהוב: עוצרים, אם אפשר. הנהג היה רחוק – אז הוא האט ועצר.",
        pause: yellow + 1.1,
        end: c[2][0] + 0.8,
        cast: [walkLight([[0, "red"], [yellow + 2.8, "green"]]), carLight([[0, "blink"], [yellow, "yellow"], [yellow + 2, "red"]]), car(c, 2)],
      };
    },
    () => fireEngine(true),
    () => fireEngine(false),
    // Straight on over the crossroads, into a one-way street the wrong way.
    () => {
      const c = path(11, WL, [["to", 2, WL, DRIVE], ["to", -1.2, WL, 2.4], ["brake", -2.2, WL, 2.4], ["wait", 9]]);
      const o = path(-12, WL, [["wait", 2.3], ["to", -6.2, WL], ["brake", -4.1, WL], ["wait", 9]], DRIVE);
      const oc = car(o, 0);
      return {
        ok: false,
        ask: ASK_CAR,
        // the one-way street in sight, with the cars that come down it
        cam: [-1.8, 0.6],
        say: "מכונית נוסעת ישר בצומת",
        why: "התמרור אומר: אין כניסה. זה רחוב חד־סטרי – המכוניות בו באות רק מולך.",
        // once he is in, with the cars coming at him
        pause: o[2][0] + 0.3,
        end: o[3][0] + 0.6,
        cast: [
          sign("noentry", -0.6, -0.45),
          car(c, 2),
          oc,
          car(path(-14, EL, [["wait", 2.7], ["to", -6.6, EL], ["brake", -4.6, EL], ["wait", 9]], DRIVE), 0),
          bubble(oc, "צפצוף!", 50, o[2][0], o[3][0] + 0.6),
        ],
      };
    },
    () => {
      const c = path(13, WL, [["to", -7, WL, 2.6]]);
      const cr = car(c, 2);
      return {
        ok: true,
        ask: ASK_CAR,
        cam: [4.8, 0.5],
        say: "מכונית נוסעת ליד תמרור",
        why: "התמרור אומר 30, והנהג נוסע 30 – בדיוק כמה שמותר.",
        pause: reach(c, "x", 7.6),
        end: reach(c, "x", 4.5),
        cast: [sign("speed", 8.6, -0.4, 30), cr, bubble(cr, "30 קמ״ש", 46)],
      };
    },
  ];

  const REPLAY = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.6-5.9"/><path d="M4 4v4.5h4.5"/></svg>`;

  // Draws a case's frame at time t into a canvas (the cards, a still).
  function still(canvas, make, t, view) {
    const c = make();
    const at = CROSSROADS[0];
    const cam = c.cam || CAM;
    const scene = new R.Scene(canvas);
    scene.night = !!c.night;
    scene.cam = { x: at[0] + cam[0], y: at[1] + cam[1], zoom: Math.min(scene.w / view[0], scene.h / view[1]) };
    const actors = c.cast.map((part) => part(t, true)).filter(Boolean);
    scene.draw(t, actors.map((a) => ({ ...a, x: a.x + at[0], y: a.y + at[1] })));
  }

  // The game's card: the fox on the crosswalk, drawn whenever the card gets
  // a size (the games page may still be hidden when the card is made).
  let cards = null;
  function art() {
    cards ??= new ResizeObserver((list) => {
      for (const { target } of list) if (target.clientWidth) still(target, CASES[0], 1.5, [260, 150]);
    });
    requestAnimationFrame(() => document.querySelectorAll(".rs-cases-art").forEach((canvas) => cards.observe(canvas)));
    return `<canvas class="rs-cases-art" aria-hidden="true"></canvas>`;
  }

  /* ── The game ── */

  function start(stage, ui, kit) {
    const ROUND = 8;
    // Every round has right and wrong ones: 3 right, 5 wrong, mixed.
    const probe = CASES.map((make) => make().ok);
    const goods = shuffle(CASES.filter((_, i) => probe[i])).slice(0, 3);
    const bads = shuffle(CASES.filter((_, i) => !probe[i])).slice(0, ROUND - goods.length);
    const items = shuffle([...goods, ...bads]);

    stage.innerHTML = `
      <div class="rs-cases">
        <div class="rs-cases-board">
          <canvas class="rs-cases-canvas" aria-hidden="true"></canvas>
          <button type="button" class="rs-cases-replay font-cartoon" hidden>${REPLAY}<span>צפו שוב</span></button>
        </div>
        <p class="rs-feedback" aria-live="polite"></p>
        <div class="rs-safe-btns rs-cases-btns">
          <button type="button" class="btn btn-candy font-cartoon rs-safe-btn rs-safe-btn--yes" data-case="1">${kit.icons.check}<span>תקין</span></button>
          <button type="button" class="btn btn-candy font-cartoon rs-safe-btn rs-safe-btn--no" data-case="0">${kit.icons.cross}<span>לא תקין</span></button>
        </div>
        <button type="button" class="btn btn-primary btn-candy font-cartoon rs-cases-next" hidden>הבא</button>
      </div>`;
    const canvas = stage.querySelector(".rs-cases-canvas");
    const msg = stage.querySelector(".rs-feedback");
    const btns = [...stage.querySelectorAll(".rs-safe-btn")];
    const next = stage.querySelector(".rs-cases-next");
    const replay = stage.querySelector(".rs-cases-replay");
    const scene = new R.Scene(canvas);

    let index = 0;
    let right = 0;
    let now = null;
    let at = [0, 0];
    let phase = "play";
    let t = 0;
    let t0 = 0;
    let raf = 0;

    const status = () => ui.status(`<span class="rs-chip">${Math.min(index + 1, ROUND)}/${ROUND}</span><span class="rs-chip">נכון ${right}</span>`);

    function fit() {
      scene.resize();
      scene.night = !!now.night;
      const cam = now.cam || CAM;
      scene.cam = { x: at[0] + cam[0], y: at[1] + cam[1], zoom: Math.min(scene.w / VIEW_W, scene.h / VIEW_H) };
    }

    function draw() {
      const still = phase === "ask";
      const actors = [];
      for (const part of now.cast) {
        const a = part(t, still);
        if (a) actors.push({ ...a, x: a.x + at[0], y: a.y + at[1] });
      }
      scene.draw(t, actors);
    }

    function frame(ms) {
      raf = 0;
      if (!t0) t0 = ms - t * 1000;
      t = (ms - t0) / 1000;
      if (phase === "play" && t >= now.pause) {
        t = now.pause;
        ask();
      } else if (phase === "done" && t >= now.end) t = now.end;
      draw();
      if (phase === "play" || (phase === "done" && t < now.end)) raf = requestAnimationFrame(frame);
    }

    function run(from) {
      cancelAnimationFrame(raf);
      t = from;
      t0 = 0;
      raf = requestAnimationFrame(frame);
    }

    function play() {
      phase = "play";
      kit.say(msg, now.say);
      btns.forEach((b) => (b.disabled = true));
      replay.hidden = true;
      run(0);
    }

    function ask() {
      phase = "ask";
      kit.say(msg, now.ask || ASK_FOX);
      btns.forEach((b) => (b.disabled = false));
      replay.hidden = false;
    }

    function show() {
      now = items[index]();
      at = CROSSROADS[Math.floor(Math.random() * CROSSROADS.length)];
      btns.forEach((b) => b.classList.remove("is-right", "is-wrong"));
      stage.querySelector(".rs-cases-btns").hidden = false;
      next.hidden = true;
      status();
      fit();
      play();
    }

    function answer(b) {
      const ok = (b.dataset.case === "1") === now.ok;
      if (ok) right++;
      phase = "done";
      replay.hidden = true;
      btns.forEach((x) => {
        x.disabled = true;
        if ((x.dataset.case === "1") === now.ok) x.classList.add("is-right");
      });
      if (!ok) b.classList.add("is-wrong");
      kit.say(msg, `${ok ? "נכון!" : now.ok ? "זה היה תקין." : "זה לא היה תקין."} ${now.why}`, ok ? "good" : "bad");
      status();
      // the rest of the case plays out, then on to the next
      run(t);
      setTimeout(() => {
        if (phase !== "done") return;
        stage.querySelector(".rs-cases-btns").hidden = true;
        next.hidden = false;
        next.textContent = index + 1 < ROUND ? "הבא" : "לתוצאות";
        next.focus();
      }, 700);
    }

    stage.addEventListener("click", (e) => {
      const b = e.target.closest(".rs-safe-btn");
      if (b && !b.disabled && phase === "ask") return answer(b);
      if (e.target.closest(".rs-cases-replay") && phase === "ask") return play();
      if (e.target.closest(".rs-cases-next")) {
        index++;
        if (index < ROUND) return show();
        const stars = right >= 8 ? 3 : right >= 6 ? 2 : right >= 4 ? 1 : 0;
        ui.finish({ stars, score: `${right} מתוך ${ROUND}`, text: right >= 8 ? "מעולה! אתם מבינים מה נכון בכביש." : "כל הכבוד! נסו שוב ותגיעו ל־8." });
      }
    });

    const resize = new ResizeObserver(() => {
      if (!now) return;
      fit();
      draw();
    });
    resize.observe(canvas);
    show();
    return () => {
      cancelAnimationFrame(raf);
      resize.disconnect();
      phase = "off";
    };
  }

  window.RsCases = { start, art, still, CASES, CROSSROADS, VIEW_W, VIEW_H, CAM };
})();
