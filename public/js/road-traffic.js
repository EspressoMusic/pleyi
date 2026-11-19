/* The roads of /road-safety (road-traffic.css):
   - the background, as on the Pleyi site (ambient-bg.js) in sky blue: dots
     falling slowly and two waves on the sides (html.rs-road-bg);
   - every empty <div class="rs-road"> becomes a strip of road between two
     parts of the page: a rough black road, a white dashed line and a zebra,
     one of the map's cars that stops before it and one of its people who
     crosses while it waits;
   - every <… class="rs-asphalt"> gets the same rough asphalt behind it.
   window.RsTraffic.scan() fills .rs-road and .rs-asphalt elements added later. */

(function () {
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const pick = (list) => list[Math.floor(Math.random() * list.length)];
  const rand = (a, b) => a + Math.random() * (b - a);

  /* ── The background ── */

  const DOT_COLORS = ["rgba(0, 96, 176, 0.75)", "rgba(0, 78, 150, 0.82)", "rgba(0, 120, 200, 0.7)", "rgba(0, 66, 130, 0.78)"];
  const DOT_GLOWS = ["rgba(0, 78, 150, 0.35)", "rgba(0, 96, 176, 0.28)", "rgba(0, 66, 130, 0.32)"];

  const sideSvg = () =>
    `<svg viewBox="0 0 140 1000" preserveAspectRatio="none" aria-hidden="true">` +
    `<path fill="rgba(0,96,176,0.16)" d="M0,0 C72,95 18,210 88,340 C118,420 42,560 96,690 C124,770 54,900 0,1000 L0,0 Z"/>` +
    `<path fill="rgba(0,78,150,0.26)" d="M0,0 C48,160 92,300 36,460 C-8,610 64,760 28,1000 L0,1000 L0,0 Z"/>` +
    `</svg>`;

  function background() {
    if (document.querySelector(".rs-ambient")) return;
    const layer = document.createElement("div");
    layer.className = "rs-ambient";
    layer.setAttribute("aria-hidden", "true");
    let html = ["left", "right"].map((side) => `<div class="rs-amb-side rs-amb-side--${side}">${sideSvg()}</div>`).join("");
    for (let i = 0; i < (reduced ? 18 : 44); i++) {
      const dur = rand(14, 40);
      const style = [
        `--dot-size:${rand(2, 7).toFixed(1)}px`,
        `--dot-opacity:${rand(0.18, 0.6).toFixed(2)}`,
        `--drift:${rand(-28, 28).toFixed(0)}px`,
        `--dot-color:${pick(DOT_COLORS)}`,
        `--dot-glow:${pick(DOT_GLOWS)}`,
        `left:${rand(0, 100).toFixed(1)}%`,
        `animation-duration:${dur.toFixed(1)}s`,
        `animation-delay:${(-rand(0, dur)).toFixed(1)}s`,
      ];
      if (reduced) style.push(`top:${rand(0, 100).toFixed(1)}%`);
      html += `<span class="rs-amb-dot" style="${style.join(";")}"></span>`;
    }
    layer.innerHTML = html;
    document.body.prepend(layer);
  }

  // On the site's own pages (data-rs-page: home, lessons, games, practice);
  // an exercise topic page or the exercise screen keeps the light sky.
  function syncBackground() {
    const root = document.documentElement;
    const page = root.dataset.rsPage;
    const on = page
      ? page !== "engine"
      : root.classList.contains("eng-topics-open") && !root.classList.contains("eng-runner-open");
    if (root.classList.contains("rs-road-bg") !== on) root.classList.toggle("rs-road-bg", on);
  }

  /* ── The roads between the parts: a rough black road with a white dashed
     line down its middle and a zebra across it (the dashes stop short of
     it). One of the map's cars (road-city.js, PAT's own drawing and ink;
     now and then a pickup, a jeep, a sports car, a mini or a police car),
     seen from the side and a little from above, comes, brakes and stops
     before the zebra (its brake light on), one of its people crosses, and
     the car drives on. Drawn on a canvas, in units of a strip H tall; on
     every other strip the car comes from the right in the top lane and the
     person crosses upward, their back to us. ── */

  const City = window.RoadCity;
  const H = 64;
  const MID = H / 2;
  // Half the zebra's width, the room between it and the dashes, a dash and the gap after it.
  const ZEBRA = 22;
  const CLEAR = 12;
  const DASH = 22;
  const GAP = 18;
  // The map's car and people, at this size of theirs.
  const K = 0.8;
  const CAR_BACK = City ? City.SIDE_CAR.back * K : 0;
  const CAR_FRONT = City ? City.SIDE_CAR.front * K : 0;
  const WHO = ["man", "kid", "grandpa"];
  // Where the car's near wheels touch the road: in the bottom lane, and (flipped) in the top one.
  const LANES = [60, 32];
  // Units a second, how far before its stop a car starts braking, how fast it picks up again.
  const SPEED = 120;
  const BRAKE = 60;
  const PULL = 100;
  const WALK = 26;
  // How far past the bottom edge the person's feet are when they're out of sight.
  const OUT = 44;
  const ASPHALT = "#2a2c30";
  const PAINT = "#f2f1ea";

  // One car and one crossing: the times (seconds from the start) and the places.
  function plan(road) {
    const zx = road.w / 2;
    const from = -CAR_FRONT - 16;
    const stop = zx - ZEBRA - 10 - CAR_FRONT;
    const out = road.w + CAR_BACK + 16;
    const brakeAt = Math.max(0, stop - from - BRAKE) / SPEED;
    const stopAt = brakeAt + (2 * BRAKE) / SPEED;
    // down from the top edge, or (flipped) up from the bottom one
    const [a, b] = road.flip ? [H + OUT, -2] : [-2, H + OUT];
    const walkAt = stopAt + 0.3;
    // the car goes once he's off the road, nearly out of sight
    const clear = road.flip ? 2 : H + 20;
    const goAt = walkAt + Math.abs(clear - a) / WALK + 0.2;
    const there = walkAt + Math.abs(b - a) / WALK;
    const full = (SPEED * SPEED) / (2 * PULL);
    const endAt = goAt + SPEED / PULL + (out - stop - full) / SPEED;
    return { zx, from, stop, out, brakeAt, stopAt, a, b, walkAt, goAt, there, full, length: Math.max(endAt, there) + 1 };
  }

  function carX(p, t) {
    if (t < p.brakeAt) return p.from + SPEED * t;
    if (t < p.stopAt) return p.stop - ((SPEED * SPEED) / (4 * BRAKE)) * (p.stopAt - t) ** 2;
    if (t < p.goAt) return p.stop;
    const u = t - p.goAt;
    if (u < SPEED / PULL) return p.stop + 0.5 * PULL * u * u;
    return p.stop + p.full + SPEED * (u - SPEED / PULL);
  }

  function manAt(p, t) {
    if (t < p.walkAt || t > p.there) return null;
    const walked = (t - p.walkAt) * WALK;
    return { y: p.a + Math.sign(p.b - p.a) * walked, walked, back: p.b < p.a };
  }

  /* The asphalt, w by h units: its patches, grit and a few cracks; at a
     rough below 1, less grit and fewer cracks. */
  function asphalt(ctx, w, h, rough = 1) {
    ctx.fillStyle = ASPHALT;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < (w * h) / (14 * H); i++) {
      ctx.beginPath();
      ctx.ellipse(rand(0, w), rand(0, h), rand(6, 22), rand(3, 9), rand(0, Math.PI), 0, Math.PI * 2);
      ctx.fillStyle = Math.random() < 0.5 ? "rgba(255, 255, 255, 0.025)" : "rgba(0, 0, 0, 0.09)";
      ctx.fill();
    }
    for (let i = 0; i < (w * h * rough) / 5; i++) {
      const r = rand(0.25, 0.9);
      ctx.fillStyle = Math.random() < 0.55 ? `rgba(150, 156, 166, ${rand(0.25, 0.6).toFixed(2)})` : `rgba(0, 0, 0, ${rand(0.3, 0.6).toFixed(2)})`;
      ctx.fillRect(rand(0, w), rand(0, h), r, r);
    }
    ctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
    ctx.lineWidth = 0.6;
    ctx.lineCap = "round";
    for (let i = 0; i < (w * h * rough) / (160 * H); i++) {
      let x = rand(0, w);
      let y = rand(4, h - 4);
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let j = 0; j < 4; j++) {
        x += rand(3, 8) * (Math.random() < 0.5 ? -1 : 1);
        y += rand(-4, 4);
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }

  /* The road, drawn once per size into a canvas of its own: the asphalt,
     then the paint, worn in specks. */
  function street(road) {
    const { dpr, s, w } = road;
    const bg = road.bg || (road.bg = document.createElement("canvas"));
    bg.width = road.canvas.width;
    bg.height = road.canvas.height;
    const ctx = bg.getContext("2d");
    ctx.setTransform(dpr * s, 0, 0, dpr * s, 0, 0);
    asphalt(ctx, w, H);
    const zx = w / 2;
    const paint = [];
    // the dashes, outward from the zebra both ways
    for (let d = ZEBRA + CLEAR; d < zx + DASH; d += DASH + GAP) {
      paint.push([zx + d, MID - 1.5, DASH, 3], [zx - d - DASH, MID - 1.5, DASH, 3]);
    }
    const stripe = 7;
    for (let i = 0; i < 5; i++) paint.push([zx - ZEBRA, 4 + i * ((H - 8 - stripe) / 4), ZEBRA * 2, stripe]);
    ctx.fillStyle = PAINT;
    for (const [x, y, pw, ph] of paint) ctx.fillRect(x, y, pw, ph);
    for (const [x, y, pw, ph] of paint) {
      for (let i = 0; i < (pw * ph) / 10; i++) {
        const r = rand(0.3, 1);
        ctx.fillStyle = `rgba(42, 44, 48, ${rand(0.35, 0.8).toFixed(2)})`;
        ctx.fillRect(x + rand(0, pw - r), y + rand(0, ph - r), r, r);
      }
    }
  }

  function draw(road) {
    // a strip on a hidden page has no size yet; it's drawn once it shows
    if (!road.canvas.width || !road.canvas.height) return;
    const { ctx, s, dpr, w } = road;
    const p = road.plan;
    // without motion: the car waits and the person is on the zebra
    const t = reduced ? p.walkAt + (MID + 14) / WALK : road.t;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(road.bg, 0, 0);
    if (!City) return;
    ctx.setTransform(dpr * s, 0, 0, dpr * s, 0, 0);
    if (road.flip) ctx.transform(-1, 0, 0, 1, w, 0);
    road.city.begin(dpr * s * K);
    const at = (x, y, paint) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(K, K);
      paint();
      ctx.restore();
    };
    const g = LANES[road.flip ? 1 : 0];
    const x = carX(p, t);
    const man = manAt(p, t);
    const person = () => at(p.zx, man.y, () => road.city.person(ctx, { ...road.who, walking: true, back: man.back }, t * 1000));
    // back to front: whoever stands farther from us first
    if (man && man.y < g) person();
    if (x > p.from - 5 && x < p.out + 5) at(x, g, () => road.city.car(ctx, road.look, t >= p.brakeAt && t < p.goAt + 0.15));
    if (man && man.y >= g) person();
  }

  const pickWho = () => ({ kind: pick(WHO), v: Math.floor(Math.random() * 3) });
  // Mostly the map's own cars; now and then one it hasn't got (a pickup, a jeep, a sports car, a mini, a police car).
  const SPECIAL = 0.3;
  const pickLook = (not) => pick((Math.random() < SPECIAL ? City.SIDE_CAR_SPECIALS : City.SIDE_CAR_LOOKS).filter((l) => l !== not));

  const roads = [];
  let running = false;
  let last = 0;

  // Only when the strip's size changed (a phone's address bar coming and going doesn't count).
  function fit(road) {
    const r = road.canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (r.width === road.cw && r.height === road.ch && dpr === road.dpr) return;
    road.cw = r.width;
    road.ch = r.height;
    road.dpr = dpr;
    road.s = Math.max(1, r.height) / H;
    road.w = Math.max(1, r.width) / road.s;
    road.canvas.width = Math.round(r.width * dpr);
    road.canvas.height = Math.round(r.height * dpr);
    road.plan = plan(road);
    street(road);
  }

  function tick(now) {
    const visible = roads.filter((r) => r.visible);
    running = visible.length > 0;
    if (!running) return;
    requestAnimationFrame(tick);
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
    last = now;
    for (const road of visible) {
      road.t += dt;
      if (road.t >= road.plan.length) {
        road.t -= road.plan.length;
        if (City) road.look = pickLook(road.look);
        road.who = pickWho();
      }
      draw(road);
    }
  }

  function start() {
    if (running || reduced) return;
    running = true;
    last = 0;
    requestAnimationFrame(tick);
  }

  const watcher =
    "IntersectionObserver" in window &&
    new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const road = roads.find((r) => r.el === entry.target);
        if (!road) continue;
        road.visible = entry.isIntersecting;
        if (road.visible) {
          fit(road);
          draw(road);
        }
      }
      start();
    });

  function makeRoad(el) {
    el.innerHTML = `<canvas class="rs-road-canvas"></canvas>`;
    el.dataset.rsRoad = "1";
    el.setAttribute("aria-hidden", "true");
    const canvas = el.querySelector("canvas");
    const road = { el, canvas, ctx: canvas.getContext("2d"), flip: roads.length % 2 === 1, t: 0, visible: !watcher };
    if (City) Object.assign(road, { city: new City.Strip(), look: pickLook(), who: pickWho() });
    roads.push(road);
    fit(road);
    // each strip at its own point of the round, its car on its way in
    road.t = rand(0, road.plan.stopAt * 0.8);
    draw(road);
    if (watcher) watcher.observe(el);
  }

  /* ── A whole part on the strips' rough asphalt, without their paint
     (class rs-asphalt): a canvas behind the part, its grit
     at about a strip's size, drawn again when the part's size changes.
     With rs-asphalt--soft (the game cards) it is only a little rough. ── */

  // CSS pixels to a unit, about a strip's (70-80px tall for its 64 units).
  const GRAIN = 1.2;
  const SOFT = 0.35;

  function paveLot(lot) {
    const r = lot.el.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    // a part on a hidden page has no size; it's paved once it shows
    if (!r.width || !r.height || (r.width === lot.cw && r.height === lot.ch && dpr === lot.dpr)) return;
    Object.assign(lot, { cw: r.width, ch: r.height, dpr });
    lot.canvas.width = Math.round(r.width * dpr);
    lot.canvas.height = Math.round(r.height * dpr);
    const ctx = lot.canvas.getContext("2d");
    ctx.setTransform(dpr * GRAIN, 0, 0, dpr * GRAIN, 0, 0);
    asphalt(ctx, r.width / GRAIN, r.height / GRAIN, lot.el.classList.contains("rs-asphalt--soft") ? SOFT : 1);
  }

  function makeLot(el) {
    el.dataset.rsAsphalt = "1";
    const canvas = document.createElement("canvas");
    canvas.className = "rs-asphalt-canvas";
    canvas.setAttribute("aria-hidden", "true");
    el.prepend(canvas);
    const lot = { el, canvas, timer: 0 };
    paveLot(lot);
    if (!("ResizeObserver" in window)) return;
    // at once when it first shows, otherwise once the resizing stops
    new ResizeObserver(() => {
      clearTimeout(lot.timer);
      if (!lot.cw) paveLot(lot);
      else lot.timer = setTimeout(() => paveLot(lot), 150);
    }).observe(el);
  }

  function scan() {
    document.querySelectorAll(".rs-road:not([data-rs-road])").forEach(makeRoad);
    document.querySelectorAll(".rs-asphalt:not([data-rs-asphalt])").forEach(makeLot);
    if (!watcher) start();
  }

  let resizeTimer = 0;
  addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      for (const road of roads) {
        fit(road);
        draw(road);
      }
    }, 150);
  });

  function init() {
    background();
    syncBackground();
    new MutationObserver(syncBackground).observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-rs-page"] });
    scan();
    addEventListener("hashchange", () => setTimeout(scan, 50));
  }

  window.RsTraffic = { scan };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
