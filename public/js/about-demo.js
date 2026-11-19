/* The demo on the home page ("מי אנחנו") — a short tour of the real site:
   library → a lesson → its games → exercises → the student's page.
   data-site-demo="road" plays the road-safety site's tour instead (on
   /road-safety): lessons → a lesson → a game → an exercise.

   - Every home screen is a real screenshot (images/demo/, taken at 1024x640
     from the "הר געש" lesson); a pretend cursor moves and clicks between
     them. The road tour's screens are simple drawn HTML (road-safety.html).
   - Home click spots are in % of the screen, read off the same screenshots:
     scripts/capture-home-demo.js retakes them all and prints the new spots
     (the game and quiz answers move every time). A road click names a
     data-hit spot instead, and { done } shows the answer as right.
   - It plays only while on screen, and never plays under
     prefers-reduced-motion (the first screen just stays). */

(function () {
  const root = document.querySelector("[data-site-demo]");
  if (!root) return;
  const screen = root.querySelector(".about-demo-screen");
  const url = root.querySelector(".about-demo-url-path");
  const cursor = root.querySelector(".about-demo-cursor");
  const ripple = root.querySelector(".about-demo-click");
  const shots = new Map([...root.querySelectorAll("[data-shot]")].map((img) => [img.dataset.shot, img]));

  const MOVE_MS = 750;
  const STUDENT_PATH = "/s/Kx7m2Q";

  // shot: the screen to show; click: where the cursor goes and clicks next;
  // wait: how long it stays (ms).
  const TOURS = {};
  TOURS.home = [
    { shot: "library", path: "/services/ready-lessons", wait: 1600 },
    { click: [70.7, 39.6] },
    { shot: "library-menu", wait: 500 },
    { click: [70.7, 86.2] },
    { shot: "subject", path: "/services/health", wait: 700 },
    { click: [72.7, 91] },
    { shot: "topic", path: "/services/health#volcano", wait: 800 },
    { click: [13.3, 38.1] },
    { shot: "slide1", path: "/services/ready-lessons?lesson=volcano", wait: 2000 },
    { click: [3.3, 52.2] },
    { shot: "slide2", wait: 2000 },
    { click: [3.3, 52.2] },
    { shot: "games", wait: 800 },
    { click: [62.3, 36.3] },
    { shot: "game", path: "/play/vocabulary-duel", wait: 1100 },
    { click: [66.8, 48.8] },
    { shot: "game-right", wait: 1700 },
    { shot: "topic", path: "/services/health#volcano", wait: 900 },
    { click: [9, 58.4] },
    { shot: "exercise", path: "/services/health#volcano/facts", wait: 1000 },
    { click: [65.4, 44.7] },
    { shot: "exercise-right", wait: 1700 },
    { shot: "student", path: STUDENT_PATH, wait: 1600 },
    { click: [40, 22.6] },
    { shot: "student-map", wait: 2600 },
  ];
  TOURS.road = [
    { shot: "lessons", wait: 1500 },
    { click: "lesson" },
    { shot: "slide1", wait: 2000 },
    { click: "next1" },
    { shot: "slide2", wait: 2000 },
    { click: "next2" },
    { shot: "game", wait: 1100 },
    { click: "safe" },
    { done: true, wait: 1700 },
    { shot: "exercise", wait: 1300 },
    { click: "answer" },
    { done: true, wait: 2200 },
  ];
  const TOUR = TOURS[root.dataset.siteDemo] || TOURS.home;

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let run = 0;
  let visible = false;
  let wake = null;
  let current = null;

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Waits until the demo is on screen and the tab is showing.
  function whenShown() {
    if (visible && !document.hidden) return Promise.resolve();
    return new Promise((resolve) => {
      wake = resolve;
    });
  }

  function onShowChange() {
    if (visible && !document.hidden && wake) {
      wake();
      wake = null;
    }
  }

  // The new screen fades in over the old one, which stays whole until then.
  function show(name, path) {
    shots.forEach((img, key) => {
      if (key === name || !img.classList.contains("is-on")) return;
      img.classList.replace("is-on", "is-prev");
      setTimeout(() => img.classList.remove("is-prev"), 400);
    });
    shots.get(name).classList.remove("is-done");
    shots.get(name).classList.add("is-on");
    current = name;
    if (path && url) url.textContent = path;
  }

  function placeCursor([x, y]) {
    cursor.style.left = `${x}%`;
    cursor.style.top = `${y}%`;
  }

  // A data-hit name → the middle of that spot, in % of the screen.
  function spotOf(at) {
    if (Array.isArray(at)) return at;
    const r = root.querySelector(`[data-hit="${at}"]`).getBoundingClientRect();
    const s = screen.getBoundingClientRect();
    return [((r.left + r.width / 2 - s.left) / s.width) * 100, ((r.top + r.height / 2 - s.top) / s.height) * 100];
  }

  async function click(spot) {
    const at = spotOf(spot);
    cursor.classList.add("is-shown");
    placeCursor(at);
    await sleep(MOVE_MS + 150);
    ripple.style.left = `${at[0]}%`;
    ripple.style.top = `${at[1]}%`;
    ripple.classList.remove("is-on");
    void ripple.offsetWidth;
    ripple.classList.add("is-on");
    cursor.classList.add("is-pressed");
    await sleep(160);
    cursor.classList.remove("is-pressed");
    await sleep(140);
  }

  function apply(item) {
    if (item.shot) show(item.shot, item.path);
    if (item.done) shots.get(current).classList.add("is-done");
  }

  async function play(from, delay = 0) {
    const id = ++run;
    let i = from;
    await sleep(delay);
    for (;;) {
      await whenShown();
      if (id !== run) return;
      const item = TOUR[i];
      if (item.click) await click(item.click);
      else apply(item);
      if (item.wait) await sleep(item.wait);
      if (id !== run) return;
      i = (i + 1) % TOUR.length;
      if (i === 0) cursor.classList.remove("is-shown");
    }
  }

  apply(TOUR[0]);
  if (reduced) return;

  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    onShowChange();
  }, { threshold: 0.35 }).observe(screen);
  document.addEventListener("visibilitychange", onShowChange);

  play(1, TOUR[0].wait);
})();
