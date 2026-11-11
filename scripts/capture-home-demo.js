/* Retakes the screenshots of the home-page demo (about-demo.js) from the
   local site, and prints where each click lands on them.

   Run with the server up (npm start): node scripts/capture-home-demo.js
   Then copy the printed click spots into TOUR in public/js/about-demo.js
   (and bump the ?v= of the pictures in index.html).

   Uses the installed Chrome over the DevTools protocol (no extra packages).
   The student page uses the first local student file that has tasks, shown
   as "יוסי" with an upcoming due date. */

const { spawn } = require("child_process");
const http = require("http");
const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");

const HOST = "http://localhost:3456";
const OUT = path.join(__dirname, "..", "public", "images", "demo");
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const W = 1024;
const H = 640;
const DPR = 1.5;
const QUALITY = 72;

// The volcano lesson's words and quiz answers, to click the right option.
const WORDS = { "הר געש": "הר מיוחד שיכול לפלוט", "לבה": "סלע נוזלי ולוהט", "עשן": "ענן כבד שעולה", "מאגמה": "סלע נוזלי וחם מאוד", "לוע": "הפתח שבראש", "התפרצות": "הרגע שבו הר הגעש", "אפר געשי": "אבק ופירורי סלע", "הר געש פעיל": "שהתפרץ לאחרונה", "הר געש רדום": "שלא התפרץ הרבה זמן", "הר געש כבוי": "שלא צפוי להתפרץ", "וולקנולוג": "מדען שחוקר", "וולקנולוגים": "מדענים שחוקרים", "קרום כדור הארץ": "השכבה החיצונית" };
const FACTS = { "מה זו מאגמה?": "סלע נוזלי מתחת לאדמה", "איך קוראים למאגמה כשהיא יוצאת החוצה?": "לבה", "מה זה לוע?": "הפתח בראש ההר", "למה המאגמה עולה?": "הלחץ בפנים ההר גדל", "כמה חמה הלבה יכולה להיות?": "יותר מ־1,000 מעלות", "מה קורה ללבה כשהיא מתקררת?": "הופכת לסלע קשה", "מה יוצא מהר געש?": "לבה, עשן ואפר", "איך קוראים למדענים שחוקרים הרי געש?": "וולקנולוגים" };

// Runs before every page: no cookie bar, no mascot, a tidy demo student.
const PRELOAD = `
  try { localStorage.setItem("gameclass-cookies-v1", "accepted"); localStorage.setItem("pleyi-owl-greeted", "1"); localStorage.setItem("pleyi-lang", "he"); } catch (e) {}
  document.addEventListener("DOMContentLoaded", () => {
    const s = document.createElement("style");
    s.textContent = ".site-owl,.site-fox,.site-owl-bubble,.site-fox-bubble{visibility:hidden!important}";
    document.head.appendChild(s);
  });
  (function () {
    const f = window.fetch;
    window.fetch = async function (u) {
      const r = await f.apply(this, arguments);
      if (!String(u).includes("/api/student/")) return r;
      const d = await r.clone().json();
      if (d.student) {
        d.student.name = "יוסי";
        (d.student.homework || []).forEach((h) => { if (!h.doneAt) h.dueDate = "2026-11-12"; });
      }
      return new Response(JSON.stringify(d), { status: r.status, headers: { "Content-Type": "application/json" } });
    };
  })();`;

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

function studentKey() {
  const file = path.join(__dirname, "..", "data", "student-progress.json");
  const students = Object.values(JSON.parse(fs.readFileSync(file, "utf8")).students || {});
  const student = students.find((s) => (s.homework || []).length);
  if (!student) throw new Error("No local student file with tasks (data/student-progress.json).");
  return student.key;
}

// Center of an element, in % of the screen.
const spotOf = (expr) => `(() => { const e = ${expr}; if (!e) return null; const r = e.getBoundingClientRect();
  return [+((r.left + r.width / 2) / ${W} * 100).toFixed(1), +((r.top + r.height / 2) / ${H} * 100).toFixed(1)]; })()`;
const byText = (sel, text) => `[...document.querySelectorAll(${JSON.stringify(sel)})].find((e) => e.offsetParent && e.textContent.replace(/\\s+/g, " ").includes(${JSON.stringify(text)}))`;

async function main() {
  const key = studentKey();
  const port = 9300 + Math.floor(Math.random() * 500);
  const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${port}`, "--no-first-run", "--disable-gpu", "--hide-scrollbars", `--user-data-dir=${process.env.TEMP || "/tmp"}/home-demo-${port}`, "about:blank"], { stdio: "ignore" });
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
    const go = async (url, wait) => { await send("Page.navigate", { url: HOST + url }); await sleep(wait); };
    const shot = async (name) => {
      const { data } = await send("Page.captureScreenshot", { format: "webp", quality: QUALITY });
      fs.writeFileSync(path.join(OUT, `${name}.webp`), Buffer.from(data, "base64"));
      console.log("saved", name);
    };
    const spot = async (label, expr) => console.log(`  click on ${label}:`, JSON.stringify(await js(spotOf(expr))));

    fs.mkdirSync(OUT, { recursive: true });
    await send("Page.enable");
    await send("Page.addScriptToEvaluateOnNewDocument", { source: PRELOAD });
    await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: DPR, mobile: false });

    // Library: only the title and the filters, without the grid of all the
    // lessons (too busy for the demo); the subject menu opens into the room
    // the hidden grid keeps under them.
    await go("/services/ready-lessons", 3500);
    await js(`document.querySelector('.svc-lesson-grid').style.visibility = "hidden"`);
    await js(`scrollTo(0, Math.round(document.querySelector('.svc-page-title').getBoundingClientRect().top + scrollY - 40))`);
    await sleep(1200);
    await shot("library");
    await spot("subject filter", `document.querySelector('#filterSubjectTrigger')`);
    // The menu scrolls inside; "נפלאות הבריאה" is at its end.
    await js(`document.querySelector('#filterSubjectTrigger').click()`);
    await sleep(500);
    await js(`(m => m.scrollTop = m.scrollHeight)(document.querySelector('#filterSubjectMenu'))`);
    await sleep(500);
    await shot("library-menu");
    await spot("נפלאות הבריאה", `document.querySelector('#filterSubjectMenu [data-subject="health"]')`);

    // Scrolled just enough for the first row of topics to show whole.
    await go("/services/health", 3500);
    await js(`(() => { const r = document.querySelector('.eng-topic-card').getBoundingClientRect();
      scrollTo(0, Math.max(0, Math.round(r.bottom + scrollY + 24 - ${H}))); })()`);
    await sleep(2000);
    await shot("subject");
    await spot("הר געש", `${byText(".eng-topic-card", "הר געש")}?.querySelector('.eng-topic-open')`);

    await go("/services/health#volcano", 3500);
    await shot("topic");
    await spot("פתיחת השיעור", byText("button, a", "פתיחת השיעור"));
    await spot("לתרגול (הר געש)", `(() => { const leaf = (e) => [...e.querySelectorAll("*")].find((b) => !b.children.length && b.textContent.trim() === "לתרגול");
      let e = [...document.querySelectorAll(".eng-ex-title")].find((t) => t.textContent.trim() === "הר געש");
      while (e && !leaf(e)) e = e.parentElement; return e && leaf(e); })()`);

    // The lesson: its pictures load slowly.
    await go("/services/ready-lessons?lesson=volcano", 9000);
    const next = `document.querySelector('.lesson-player-nav[aria-label="שקופית הבאה"]')`;
    await shot("slide1");
    await spot("next slide", next);
    await js(`${next}.click()`);
    await sleep(4500);
    await shot("slide2");
    await js(`document.querySelector('.lesson-player-dot[data-i="7"]').click()`);
    await sleep(1800);
    await shot("games");
    await spot("טריוויה", `document.querySelector('.lp-game-btn[data-game-id="vocabulary-duel"]')`);

    await js(`document.querySelector('.lp-game-btn[data-game-id="vocabulary-duel"]').click()`);
    await sleep(4500);
    await js(`document.querySelector('.solo-play-again').click()`);
    await sleep(2500);
    const rightWord = `(() => { const v = ${JSON.stringify(WORDS)};
      const q = [...document.querySelectorAll("body *")].filter((e) => e.offsetParent && !e.children.length && !e.closest(".solo-option")).map((e) => e.textContent.trim()).find((t) => v[t]);
      return [...document.querySelectorAll(".solo-option")].find((o) => o.textContent.includes(v[q])); })()`;
    await shot("game");
    await spot("right answer", rightWord);
    await js(`${rightWord}.click()`);
    await sleep(450);
    await shot("game-right");

    await go("/services/health#volcano/facts", 4000);
    const rightFact = `(() => { const f = ${JSON.stringify(FACTS)}; const q = Object.keys(f).find((k) => document.body.innerText.includes(k));
      return q && [...document.querySelectorAll(".js-answer")].find((b) => b.offsetParent && b.textContent.trim().endsWith(f[q])); })()`;
    await shot("exercise");
    await spot("right answer", rightFact);
    await js(`${rightFact}.click()`);
    await sleep(600);
    await shot("exercise-right");

    await go(`/s/${encodeURIComponent(key)}`, 4500);
    await shot("student");
    await spot("המפה שלי", byText(".stu-tab", "המפה שלי"));
    await js(`location.hash = "map"`);
    await sleep(2500);
    await shot("student-map");
    ws.close();
  } finally {
    chrome.kill();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
