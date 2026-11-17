/* Draws the app icon — the site's fox (site-fox.js) on teal — and writes
   every size of it: public/icons/icon.svg (the browser tab), icon-192/512
   (the installed app), icon-maskable-512 (Android cuts it to its own shape,
   so the fox sits inside the middle circle), apple-touch-icon (iPhones), and
   the Android app's launcher icon when ../pleyi-android is there.

   Run: node scripts/make-app-icons.js
   Then bump ?v= on the icon links (pages, lib/seo.js, server.js manifest).

   Uses the installed Chrome over the DevTools protocol (no extra packages). */

const { spawn } = require("child_process");
const http = require("http");
const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const ICONS = path.join(__dirname, "..", "public", "icons");
const ANDROID_ICON = path.join(__dirname, "..", "..", "pleyi-android", "app", "src", "main", "res", "mipmap-xxxhdpi", "ic_launcher.png");

const HEAD = "M60 40C79 40 95 51 95 67C95 81 79 94 60 94C41 94 25 81 25 67C25 51 41 40 60 40Z";
const FOX = `<g fill="#f7b55e" stroke="#000" stroke-width="8" stroke-linejoin="round" stroke-linecap="round">
    <path d="M80 123C100 128 117 116 115 97C114 86 105 82 99 87C104 96 101 108 84 109Z"/>
    <path d="M50 44C42 30 22 13 9 5C6 22 13 45 30 61Z"/>
    <path d="M70 44C78 30 98 13 111 5C114 22 107 45 90 61Z"/>
    <path d="M60 86C80 86 90 102 90 114C90 122 80 126 60 126C40 126 30 122 30 114C30 102 40 86 60 86Z"/>
    <path d="${HEAD}"/>
    <path fill="#fff1d9" stroke="none" d="M60 72C70 72 77 78 80 85C74 91 67 94 60 94C53 94 46 91 40 85C43 78 50 72 60 72Z"/>
    <path fill="none" d="${HEAD}"/>
    <circle fill="#000" stroke="none" cx="47" cy="65" r="5.6"/>
    <circle fill="#000" stroke="none" cx="73" cy="65" r="5.6"/>
    <path fill="#000" stroke="none" d="M54 77Q60 74 66 77Q63.5 83 60 83.5Q56.5 83 54 77Z"/>
    <path fill="#3a4050" d="M44 41V34Q60 29 76 34V41Q60 47 44 41Z"/>
    <path fill="#3a4050" d="M60 21L89 30.5L60 40L31 30.5Z"/>
  </g>`;

// The fox's middle (its drawing spans about 1–121 × 1–130), and how big it
// is drawn: the maskable one keeps its ear tips inside Android's safe circle.
const FOX_CENTER = [61, 66];
const SCALE = { full: 2.75, maskable: 2.3 };

function iconSvg({ rounded = false, maskable = false } = {}) {
  const scale = maskable ? SCALE.maskable : SCALE.full;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="3" dy="4" stdDeviation="0" flood-color="#000" flood-opacity="1"/>
    </filter>
  </defs>
  <rect width="512" height="512"${rounded ? ' rx="112"' : ""} fill="#00C9B7"/>
  <g filter="url(#shadow)" transform="translate(256 256) scale(${scale}) translate(${-FOX_CENTER[0]} ${-FOX_CENTER[1]})">
  ${FOX}
  </g>
</svg>
`;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getJSON(url) {
  return new Promise((resolve, reject) =>
    http
      .get(url, (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => resolve(JSON.parse(body)));
      })
      .on("error", reject)
  );
}

async function main() {
  fs.writeFileSync(path.join(ICONS, "icon.svg"), iconSvg({ rounded: true }));
  console.log("saved icon.svg");

  const port = 9300 + Math.floor(Math.random() * 500);
  const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${port}`, "--no-first-run", "--disable-gpu", "--hide-scrollbars", `--user-data-dir=${process.env.TEMP || "/tmp"}/app-icons-${port}`, "about:blank"], { stdio: "ignore" });
  try {
    let targets;
    for (let i = 0; i < 40 && !targets; i++) {
      targets = await getJSON(`http://127.0.0.1:${port}/json`).catch(() => sleep(250));
    }
    const ws = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl);
    await new Promise((resolve) => ws.on("open", resolve));
    let id = 0;
    const pending = new Map();
    ws.on("message", (m) => {
      const msg = JSON.parse(m);
      if (pending.has(msg.id)) pending.get(msg.id)(msg.result);
      pending.delete(msg.id);
    });
    const send = (method, params = {}) => new Promise((resolve) => { pending.set(++id, resolve); ws.send(JSON.stringify({ id, method, params })); });

    await send("Page.enable");
    // Rounded corners stay see-through.
    await send("Emulation.setDefaultBackgroundColorOverride", { color: { r: 0, g: 0, b: 0, a: 0 } });

    const render = async (file, size, options) => {
      await send("Emulation.setDeviceMetricsOverride", { width: size, height: size, deviceScaleFactor: 1, mobile: false });
      const html = `<!DOCTYPE html><style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${iconSvg(options)}`;
      await send("Page.navigate", { url: `data:text/html;charset=utf-8,${encodeURIComponent(html)}` });
      await sleep(400);
      const { data } = await send("Page.captureScreenshot", { format: "png" });
      fs.writeFileSync(file, Buffer.from(data, "base64"));
      console.log("saved", path.relative(path.join(__dirname, ".."), file));
    };

    await render(path.join(ICONS, "icon-192.png"), 192, {});
    await render(path.join(ICONS, "icon-512.png"), 512, {});
    await render(path.join(ICONS, "icon-maskable-512.png"), 512, { maskable: true });
    await render(path.join(ICONS, "apple-touch-icon.png"), 180, {});
    if (fs.existsSync(path.dirname(ANDROID_ICON))) await render(ANDROID_ICON, 192, { rounded: true });
  } finally {
    chrome.kill();
  }
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  }
);
