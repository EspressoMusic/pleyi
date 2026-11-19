/* Takes the phone screenshots of the road-safety site's "מה חדש" cards
   (road-news.js) from the local site: for each card a big picture
   (<name>.webp, 618×1372) and its thumb (<name>-thumb.webp, the top of the
   screen, 240×320), in public/images/news/road/.

   Run with the server up (npm start): node scripts/capture-road-news.js
   Then bump SHOTS_V in public/js/road-news.js.

   Uses the installed Chrome over the DevTools protocol (no extra packages).
   Firebase's CDN is blocked, as it times out here and holds the page. */

const { spawn } = require("child_process");
const http = require("http");
const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");

const HOST = "http://localhost:3456";
const OUT = path.join(__dirname, "..", "public", "images", "news", "road");
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const W = 412;
const H = 915;
const DPR = 1.5;
const QUALITY = 74;
const THUMB_W = 240;

// Runs before every page: no cookie bar, no mascot or its guide.
const PRELOAD = `
  try { localStorage.setItem("gameclass-cookies-v1", "accepted"); localStorage.setItem("pleyi-owl-greeted", "1"); localStorage.setItem("pleyi-tour-off", "1"); localStorage.setItem("pleyi-lang", "he"); } catch (e) {}
  document.addEventListener("DOMContentLoaded", () => {
    const s = document.createElement("style");
    s.textContent = ".site-owl,.site-fox,.site-owl-bubble,.site-fox-bubble,.site-guide-btn{visibility:hidden!important}";
    document.head.appendChild(s);
  });`;

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
  const port = 9300 + Math.floor(Math.random() * 500);
  const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${port}`, "--no-first-run", "--disable-gpu", "--hide-scrollbars", `--user-data-dir=${process.env.TEMP || "/tmp"}/road-news-${port}`, "about:blank"], { stdio: "ignore" });
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
    const js = async (expression) => (await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result.value;
    // Through a blank page, so a new #hash loads the page afresh.
    const go = async (url, wait) => {
      await send("Page.navigate", { url: "about:blank" });
      await sleep(200);
      await send("Page.navigate", { url: HOST + url });
      await sleep(wait);
    };
    const waitFor = async (expr, ms) => {
      for (let t = 0; t < ms; t += 250) {
        if (await js(expr)) return true;
        await sleep(250);
      }
      return false;
    };
    const grab = async (clip) => Buffer.from((await send("Page.captureScreenshot", { format: "webp", quality: QUALITY, ...(clip && { clip }) })).data, "base64");
    const shot = async (name) => {
      fs.writeFileSync(path.join(OUT, `${name}.webp`), await grab());
      fs.writeFileSync(path.join(OUT, `${name}-thumb.webp`), await grab({ x: 0, y: 0, width: W, height: (W * 4) / 3, scale: THUMB_W / (W * DPR) }));
      console.log("saved", name);
    };

    fs.mkdirSync(OUT, { recursive: true });
    await send("Page.enable");
    await send("Network.enable");
    await send("Network.setBlockedURLs", { urls: ["*gstatic.com*"] });
    await send("Page.addScriptToEvaluateOnNewDocument", { source: PRELOAD });
    await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: DPR, mobile: true });
    await send("Emulation.setTouchEmulationEnabled", { enabled: true });

    // תקין או לא תקין?: the case plays, then stops for the answer.
    await go("/road-safety#games", 2500);
    await js(`document.querySelector('[data-rs-game="cases"]').click()`);
    await waitFor(`!document.querySelector('.rs-cases-replay')?.hidden`, 20000);
    await sleep(400);
    await shot("cases");

    // A lesson's moving drawing (its pictures load slowly).
    await go("/road-safety#lessons", 2500);
    await js(`document.querySelector('[data-rs-lesson="road-walk"]').click()`);
    await sleep(7000);
    await shot("city");

    // הסבר מורחב: the button in the lesson's top bar.
    await go("/road-safety#lessons", 2500);
    await js(`document.querySelector('[data-rs-lesson="road-lights"]').click()`);
    await sleep(5000);
    await js(`document.querySelector('.lesson-player-more').click()`);
    await sleep(2500);
    await shot("more");

    await go("/road-safety#lessons", 3000);
    await shot("lessons");

    await go("/road-safety#practice", 3000);
    await shot("practice");

    await go("/road-safety#games", 3000);
    await shot("games");
    ws.close();
  } finally {
    chrome.kill();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
