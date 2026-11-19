/* Retakes the screenshots of the road-safety site's demo ("מי אנחנו" on
   /road-safety, about-demo.js's "road" tour) from the local site, and prints
   where each click lands on them.

   Run with the server up (npm start): node scripts/capture-road-demo.js
   Then copy the printed click spots into TOURS.road in public/js/about-demo.js
   (and bump the ?v= of the pictures in road-safety.html).

   Uses the installed Chrome over the DevTools protocol (no extra packages).
   Firebase's CDN is blocked, as it times out here and holds the page. */

const { spawn } = require("child_process");
const http = require("http");
const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");

const HOST = "http://localhost:3456";
const OUT = path.join(__dirname, "..", "public", "images", "demo", "road");
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const W = 1024;
const H = 640;
const DPR = 1.5;
const QUALITY = 72;

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

// Center of an element, in % of the screen.
const spotOf = (expr) => `(() => { const e = ${expr}; if (!e) return null; const r = e.getBoundingClientRect();
  return [+((r.left + r.width / 2) / ${W} * 100).toFixed(1), +((r.top + r.height / 2) / ${H} * 100).toFixed(1)]; })()`;
const byText = (sel, text) => `[...document.querySelectorAll(${JSON.stringify(sel)})].find((e) => e.offsetParent && e.textContent.replace(/\\s+/g, " ").includes(${JSON.stringify(text)}))`;

async function main() {
  const port = 9300 + Math.floor(Math.random() * 500);
  const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${port}`, "--no-first-run", "--disable-gpu", "--hide-scrollbars", `--user-data-dir=${process.env.TEMP || "/tmp"}/road-demo-${port}`, "about:blank"], { stdio: "ignore" });
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
    const grab = async () => Buffer.from((await send("Page.captureScreenshot", { format: "webp", quality: QUALITY })).data, "base64");
    const save = (name, data) => { fs.writeFileSync(path.join(OUT, `${name}.webp`), data); console.log("saved", name); };
    const shot = async (name) => save(name, await grab());
    const spot = async (label, expr) => console.log(`  click on ${label}:`, JSON.stringify(await js(spotOf(expr))));

    fs.mkdirSync(OUT, { recursive: true });
    await send("Page.enable");
    await send("Network.enable");
    await send("Network.setBlockedURLs", { urls: ["*gstatic.com*"] });
    await send("Page.addScriptToEvaluateOnNewDocument", { source: PRELOAD });
    await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: DPR, mobile: false });

    await go("/road-safety", 3500);
    await shot("home");
    await spot("לספריית השיעורים", `document.querySelector('.rs-hero-actions a')`);

    await go("/road-safety#lessons", 3000);
    await shot("lessons");
    const firstLesson = `document.querySelector('[data-rs-lesson]')`;
    await spot("first lesson", firstLesson);
    await spot("משחקים tab", `document.querySelector('.rs-tab[data-rs-page="games"]')`);

    // The lesson: its pictures load slowly.
    await js(`${firstLesson}.click()`);
    await sleep(6000);
    const next = `document.querySelector('#lessonPlayerNext')`;
    await shot("slide1");
    await spot("next slide", next);
    await js(`${next}.click()`);
    await sleep(3000);
    await shot("slide2");
    await spot("next slide", next);
    await js(`${next}.click()`);
    await sleep(3000);
    await shot("slide3");
    await spot("close lesson", `document.querySelector('#lessonPlayerClose')`);

    await go("/road-safety#games", 3000);
    await shot("games");
    const playSafe = `document.querySelector('.rs-open[data-rs-game="safe"]')`;
    await spot("בטוח או מסוכן – לשחק", playSafe);
    await spot("תרגילים tab", `document.querySelector('.rs-tab[data-rs-page="practice"]')`);

    // The question is random: "בטוח" is clicked until it is the right answer.
    const yes = `document.querySelector('.rs-safe .eng-option[data-safe="1"]')`;
    for (let i = 0; i < 20; i++) {
      await js(`${playSafe}.click()`);
      await sleep(900);
      const before = await grab();
      const at = await js(spotOf(yes));
      await js(`${yes}.click()`);
      await sleep(450);
      if (await js(`${yes}.classList.contains("is-right")`)) {
        save("game", before);
        console.log("  click on בטוח:", JSON.stringify(at));
        await shot("game-right");
        await spot("close game", `document.querySelector('#rsGameClose')`);
        break;
      }
      await js(`document.querySelector('#rsGameClose').click()`);
      await sleep(300);
    }

    await go("/road-safety#practice", 3000);
    await shot("practice");
    await spot("הולכים ברחוב", `${byText(".eng-topic-card", "הולכים ברחוב")}?.querySelector('.eng-topic-open, button, a')`);

    await go("/road-safety#road-walk", 3000);
    await shot("topic");
    await spot("לתרגול (איפה הולכים?)", `(() => { const leaf = (e) => [...e.querySelectorAll("*")].find((b) => !b.children.length && b.textContent.trim() === "לתרגול");
      let e = [...document.querySelectorAll(".eng-ex-title")].find((t) => t.textContent.trim() === "איפה הולכים?");
      while (e && !leaf(e)) e = e.parentElement; return e && leaf(e); })()`);

    await go("/road-safety#road-walk/where", 3500);
    const rightAnswer = `(() => { const ex = window.LEARN_SUBJECT.topics.find((t) => t.id === "road-walk").exercises.find((x) => x.id === "where");
      const q = ex.questions.find((x) => document.body.innerText.includes(x.text));
      return q && [...document.querySelectorAll(".js-answer")].find((b) => b.offsetParent && b.textContent.trim().endsWith(q.answer)); })()`;
    await shot("exercise");
    await spot("right answer", rightAnswer);
    await js(`${rightAnswer}.click()`);
    await sleep(600);
    await shot("exercise-right");
    ws.close();
  } finally {
    chrome.kill();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
