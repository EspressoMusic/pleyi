/* A stage certificate as a picture (who earns one: lib/english-map.js).
   It is drawn on a canvas, so the same picture shows in the dialog,
   downloads, shares and prints.

   PleyiCertificate.draw({ name, line, stage, stageEn, date }) resolves to
   the canvas: `line` is the "על סיום שלב …" sentence, `date` a ready string. */

(function () {
  const W = 2000;
  const H = 1414; // A4, landscape
  const FONT = "Rubik, system-ui, sans-serif";
  const INK = "#000";
  const PAPER = "#fff4d6";
  const TEAL = "#00E5CC";
  const TEAL_SOFT = "#8cf3e8"; // the slides' teal marker (.stu-key)
  const YELLOW = "#FFE135";

  // The site's fox in a graduation cap.
  const FOX = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 132">
      <g fill="#f7b55e" stroke="#000" stroke-width="7" stroke-linejoin="round">
        <path d="M80 123C100 128 117 116 115 97C114 86 105 82 99 87C104 96 101 108 84 109Z"/>
        <path d="M50 44C42 30 22 13 9 5C6 22 13 45 30 61Z"/>
        <path d="M70 44C78 30 98 13 111 5C114 22 107 45 90 61Z"/>
        <path d="M60 86C80 86 90 102 90 114C90 122 80 126 60 126C40 126 30 122 30 114C30 102 40 86 60 86Z"/>
        <path d="M60 40C79 40 95 51 95 67C95 81 79 94 60 94C41 94 25 81 25 67C25 51 41 40 60 40Z"/>
      </g>
      <path fill="#fff1d9" d="M60 72C70 72 77 78 80 85C74 91 67 94 60 94C53 94 46 91 40 85C43 78 50 72 60 72Z"/>
      <path fill="none" stroke="#000" stroke-width="7" d="M60 40C79 40 95 51 95 67C95 81 79 94 60 94C41 94 25 81 25 67C25 51 41 40 60 40Z"/>
      <circle cx="47" cy="65" r="5.6"/><circle cx="73" cy="65" r="5.6"/>
      <path d="M54 77Q60 74 66 77Q63.5 83 60 83.5Q56.5 83 54 77Z"/>
      <g fill="#3a4050" stroke="#000" stroke-width="7" stroke-linejoin="round">
        <path d="M44 41V34Q60 29 76 34V41Q60 47 44 41Z"/>
        <path d="M60 21L89 30.5L60 40L31 30.5Z"/>
      </g>
    </svg>`;

  let foxImage = null;

  function loadFox() {
    if (!foxImage) {
      foxImage = new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(FOX)}`;
      });
    }
    return foxImage;
  }

  async function loadFonts() {
    try {
      await Promise.all([document.fonts.load(`900 100px ${FONT}`, "אב"), document.fonts.load(`700 100px ${FONT}`, "אב")]);
    } catch {
      /* the system font draws it */
    }
  }

  // Text centred on x, shrunk until it fits `max` wide; returns its width.
  function text(ctx, str, x, y, { size, weight = 900, max = 1500, dir = "rtl" }) {
    let px = size;
    do {
      ctx.font = `${weight} ${px}px ${FONT}`;
      px -= 4;
    } while (ctx.measureText(str).width > max && px > 20);
    ctx.direction = dir;
    ctx.textAlign = "center";
    ctx.fillStyle = INK;
    ctx.fillText(str, x, y);
    return ctx.measureText(str).width;
  }

  function line(ctx, x1, x2, y, width) {
    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.lineTo(x2, y);
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.strokeStyle = INK;
    ctx.stroke();
  }

  function star(ctx, cx, cy, outer, inner) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? inner : outer;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
    }
    ctx.closePath();
  }

  // A yellow medal with two teal ribbons.
  function medal(ctx, cx, cy, r) {
    ctx.lineJoin = "round";
    ctx.lineWidth = 9;
    ctx.strokeStyle = INK;
    [-1, 1].forEach((side) => {
      const x = cx + side * r * 0.45;
      ctx.beginPath();
      ctx.moveTo(x - r * 0.32, cy);
      ctx.lineTo(x + r * 0.32, cy);
      ctx.lineTo(x + side * r * 0.35 + r * 0.3, cy + r * 1.75);
      ctx.lineTo(x + side * r * 0.35, cy + r * 1.45);
      ctx.lineTo(x + side * r * 0.35 - r * 0.3, cy + r * 1.75);
      ctx.closePath();
      ctx.fillStyle = TEAL;
      ctx.fill();
      ctx.stroke();
    });
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = YELLOW;
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.74, 0, Math.PI * 2);
    ctx.lineWidth = 5;
    ctx.stroke();
    star(ctx, cx, cy, r * 0.48, r * 0.2);
    ctx.fillStyle = INK;
    ctx.fill();
  }

  async function draw({ name, line: forLine, stage, stageEn, date }) {
    await Promise.all([loadFonts(), loadFox()]);
    const fox = await loadFox();
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    const cx = W / 2;

    // Paper, a black frame and a teal one inside it.
    const glow = ctx.createRadialGradient(cx, H * 0.42, 100, cx, H * 0.42, W * 0.6);
    glow.addColorStop(0, "#fffdf3");
    glow.addColorStop(1, PAPER);
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);
    ctx.beginPath();
    ctx.roundRect(40, 40, W - 80, H - 80, 48);
    ctx.lineWidth = 16;
    ctx.strokeStyle = INK;
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(80, 80, W - 160, H - 160, 28);
    ctx.lineWidth = 8;
    ctx.strokeStyle = TEAL;
    ctx.stroke();

    medal(ctx, cx, 215, 88);

    // The title on the teal marker.
    ctx.font = `900 118px ${FONT}`;
    const kicker = "תעודת הצטיינות";
    const kw = ctx.measureText(kicker).width;
    ctx.beginPath();
    ctx.roundRect(cx - kw / 2 - 30, 418, kw + 60, 96, 18);
    ctx.fillStyle = TEAL_SOFT;
    ctx.fill();
    text(ctx, kicker, cx, 490, { size: 118 });

    text(ctx, "תעודה זו מוענקת ל", cx, 600, { size: 50, weight: 700 });
    const nw = text(ctx, name, cx, 748, { size: 150 });
    const half = Math.max(nw / 2 + 40, 340);
    line(ctx, cx - half, cx + half, 790, 7);

    text(ctx, forLine, cx, 892, { size: 54, weight: 700 });
    text(ctx, stage, cx, 1000, { size: 92 });
    if (stageEn) text(ctx, stageEn, cx, 1068, { size: 50, weight: 700, dir: "ltr" });

    // Signature lines on both sides, the fox and the site in the middle.
    const sides = [
      { x: W - 470, label: "תאריך", value: date },
      { x: 470, label: "חתימת המורה", value: "" },
    ];
    sides.forEach(({ x, label, value }) => {
      if (value) text(ctx, value, x, 1220, { size: 44, weight: 700, max: 380 });
      line(ctx, x - 190, x + 190, 1245, 5);
      text(ctx, label, x, 1295, { size: 36, weight: 700 });
    });
    if (fox) ctx.drawImage(fox, cx - 68, 1115, 136, 150);
    text(ctx, "pleyschool.com", cx, 1305, { size: 34, weight: 700, dir: "ltr" });

    return canvas;
  }

  window.PleyiCertificate = { draw };
})();
