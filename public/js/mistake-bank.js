/* Mistake bank — every question a student gets wrong in the English practice
   waits here until they answer it right GOAL times in a row; a new mistake
   starts its count over. The Learn English page practices it as "my
   mistakes" (english-learning.js).

   A visitor's bank lives in this browser. A device that opened a student's
   personal link also keeps it in the student's file (lib/student-progress.js,
   same rules), so it follows the student to every device: the page loads it
   from there, keeps a copy here, and sends answers in small batches. */

window.MistakeBank = (() => {
  const GOAL = 3;
  const CAP = 200;
  const STORE = "pleyi-mistakes";
  const BATCH = 10;
  const FLUSH_MS = 3000;

  // Whose bank is in memory: the student's link key, or "" for a visitor.
  let owner = null;
  let bank = null;
  // Answers of a linked student that the server doesn't have yet.
  let queue = [];
  let loaded = null;
  let flushing = null;
  let timer = null;

  function linkKey() {
    return window.StudentProgress?.key() || "";
  }

  // One copy per student, so a shared classroom computer keeps them apart.
  function storeName(key) {
    if (!key) return STORE;
    let h = 5381;
    for (let i = 0; i < key.length; i++) h = (h * 33 + key.charCodeAt(i)) | 0;
    return `${STORE}-${(h >>> 0).toString(36)}`;
  }

  function read(key) {
    try {
      const data = JSON.parse(localStorage.getItem(storeName(key)));
      if (Array.isArray(data?.entries)) return { entries: data.entries, mastered: data.mastered || 0 };
    } catch {
      /* ignore */
    }
    return { entries: [], mastered: 0 };
  }

  function save() {
    try {
      localStorage.setItem(storeName(owner), JSON.stringify(bank));
    } catch {
      /* ignore */
    }
  }

  // The bank of whoever practices on this device now.
  function current() {
    const key = linkKey();
    if (bank && owner === key) return bank;
    owner = key;
    bank = read(key);
    queue = [];
    loaded = null;
    return bank;
  }

  function changed() {
    save();
    window.dispatchEvent(new CustomEvent("pleyi:mistakes"));
  }

  // When the bank is full, the questions closest to leaving it (and then the
  // oldest mistakes) make room.
  function trim(target) {
    if (target.entries.length <= CAP) return;
    const keep = new Set(
      [...target.entries]
        .sort((a, b) => (a.streak || 0) - (b.streak || 0) || String(b.wrongAt).localeCompare(String(a.wrongAt)))
        .slice(0, CAP)
        .map((e) => e.id)
    );
    target.entries = target.entries.filter((e) => keep.has(e.id));
  }

  // The same rules as applyReview in lib/student-progress.js. Returns true
  // when a right answer took the question out of the bank.
  function apply(target, op, at) {
    const i = target.entries.findIndex((e) => e.id === op.id);
    const entry = i >= 0 ? target.entries[i] : null;
    if (op.right) {
      if (!entry) return false;
      entry.streak = (entry.streak || 0) + 1;
      entry.lastAt = at;
      if (entry.streak < GOAL) return false;
      target.entries.splice(i, 1);
      target.mastered = (target.mastered || 0) + 1;
      return true;
    }
    const { right, ...fields } = op;
    const next = { ...fields, streak: 0, wrong: (entry?.wrong || 0) + 1, firstAt: entry?.firstAt || at, lastAt: at, wrongAt: at };
    if (entry) target.entries[i] = next;
    else target.entries.push(next);
    trim(target);
    return false;
  }

  // A linked student's bank comes from their file once per page load; answers
  // given before it arrives are applied again on top of it.
  function ready() {
    current();
    if (!owner) return Promise.resolve(bank);
    if (!loaded) {
      const key = owner;
      loaded = fetch("/api/review", { headers: { "X-Student-Key": key } })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!data?.ok || owner !== key) return bank;
          bank = { entries: data.entries || [], mastered: data.mastered || 0 };
          const at = new Date().toISOString();
          queue.forEach((op) => apply(bank, op, at));
          changed();
          return bank;
        })
        // Offline: the copy in this browser.
        .catch(() => bank);
    }
    return loaded;
  }

  // `keepalive` lets the last batch go out while the page is closing.
  function flush(keepalive = false) {
    clearTimeout(timer);
    if (!owner || !queue.length) return Promise.resolve();
    if (flushing) return flushing;
    flushing = (async () => {
      await ready();
      while (queue.length && owner) {
        const key = owner;
        const ops = queue.slice(0, BATCH);
        try {
          const res = await fetch("/api/review", {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Student-Key": key },
            body: JSON.stringify({ ops }),
            keepalive,
          });
          if (owner !== key) break;
          // A server error keeps the answers for the next try; a link that
          // no longer works (404) drops them.
          if (!res.ok && res.status !== 404) break;
          queue = queue.slice(ops.length);
        } catch {
          break;
        }
      }
    })().finally(() => {
      flushing = null;
    });
    return flushing;
  }

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(() => flush(), FLUSH_MS);
  }

  /* One answer to a question. `info` describes a wrong one: { topicId,
     exerciseId, topicTitle, exerciseTitle, type, level, item (the question
     as it was asked), prompt, answer (plain text for the teacher) }. A right
     answer only counts for a question that is already in the bank. Returns
     true when it took the question out. */
  function answer(id, right, info = {}) {
    current();
    if (right && !bank.entries.some((e) => e.id === id)) return false;
    const op = right ? { id, right: true } : { ...info, id, right: false };
    const out = apply(bank, op, new Date().toISOString());
    if (owner) {
      queue.push(op);
      schedule();
    }
    changed();
    return out;
  }

  function list() {
    return current().entries.slice();
  }

  function count(topicId = "") {
    return current().entries.filter((e) => !topicId || e.topicId === topicId).length;
  }

  function streakOf(id) {
    return current().entries.find((e) => e.id === id)?.streak || 0;
  }

  // Another tab of the site changed this browser's copy.
  window.addEventListener("storage", (e) => {
    if (!bank || e.key !== storeName(owner)) return;
    bank = read(owner);
    window.dispatchEvent(new CustomEvent("pleyi:mistakes"));
  });

  window.addEventListener("pagehide", () => flush(true));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush(true);
  });

  return {
    GOAL,
    ready,
    answer,
    list,
    count,
    mastered: () => current().mastered || 0,
    streakOf,
    flush,
  };
})();
