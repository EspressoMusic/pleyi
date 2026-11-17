/* Student progress — a student opens the personal link the teacher sent
   (/s/<key>, or any page with ?s=<key>). The key is remembered on this device,
   and from then on finished exercises, opened lessons and played games are
   saved to that student's file. No sign-in; visitors without a key aren't
   recorded. */

window.StudentProgress = (() => {
  const STORAGE_KEY = "pleyi-student-key";
  // Set in this tab when it came through the student's own link (/s/<key>
  // or ?s=<key>). A visit that came through the site has none, so the page
  // stays the site's (no hello with the student's name, no student menu).
  const SESSION_KEY = "pleyi-student-session";
  const KEY_PATTERN = /^[A-Za-z0-9_-]{20,64}$/;
  let profilePromise = null;

  function key() {
    try {
      const value = localStorage.getItem(STORAGE_KEY) || "";
      return KEY_PATTERN.test(value) ? value : "";
    } catch {
      return "";
    }
  }

  function setKey(value) {
    if (!KEY_PATTERN.test(String(value || ""))) return false;
    try {
      if (localStorage.getItem(STORAGE_KEY) !== value) profilePromise = null;
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      return false;
    }
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
    return true;
  }

  function clear() {
    profilePromise = null;
    try {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
  }

  // 404: the file was deleted or its link replaced; 403: the teacher turned
  // the student's sign-in off. Either way this device forgets the key.
  function gone(res) {
    return res.status === 404 || res.status === 403;
  }

  function fromLink() {
    try {
      return !!key() && sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      return false;
    }
  }

  // ?s=<key> on any page links this device to the student, then the
  // parameter is dropped so the address bar stays clean.
  function captureFromUrl() {
    const url = new URL(location.href);
    const fromUrl = url.searchParams.get("s");
    if (!fromUrl) return;
    setKey(fromUrl);
    url.searchParams.delete("s");
    history.replaceState(history.state, "", url.pathname + url.search + url.hash);
  }

  // { name, homework } for the linked student, or null (and the stale key is
  // forgotten) when the teacher deleted the file or replaced its link.
  // `fresh`: ask again, for what changed since (a certificate just earned).
  function profile({ fresh = false } = {}) {
    const current = key();
    if (!current) return Promise.resolve(null);
    if (!profilePromise || fresh) {
      profilePromise = fetch(`/api/student/${encodeURIComponent(current)}`)
        .then(async (res) => {
          if (gone(res)) {
            clear();
            return null;
          }
          const data = await res.json();
          return data.ok ? data.student : null;
        })
        .catch(() => {
          profilePromise = null;
          return null;
        });
    }
    return profilePromise;
  }

  // Resolves to { earned, points: { total, week } } once saved — the points
  // this activity earned and the student's new totals (and after a daily
  // challenge, `daily`: the streak) — or null. Pages that
  // show the totals listen for the "pleyi:points" event.
  async function record(activity) {
    const current = key();
    if (!current) return null;
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Student-Key": current },
        body: JSON.stringify({ activity }),
        keepalive: true,
      });
      if (gone(res)) clear();
      if (!res.ok) return null;
      const data = await res.json();
      const result = { earned: data.earned || 0, points: data.points || null, ...(data.daily ? { daily: data.daily } : {}) };
      if (result.points) window.dispatchEvent(new CustomEvent("pleyi:points", { detail: result }));
      return result;
    } catch (err) {
      console.warn("progress save failed", err);
      return null;
    }
  }

  // A test handed in. Unlike record(), says why it wasn't saved:
  // { ok, earned, points } or { ok: false, error, done } — `done` when the
  // test was handed in already (on this device or another).
  async function submitTest(activity) {
    const current = key();
    if (!current) return { ok: false, error: "המבחן נשמר רק מהקישור האישי" };
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Student-Key": current },
        body: JSON.stringify({ activity }),
      });
      if (gone(res)) clear();
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) return { ok: false, error: data.error || "המבחן לא נשמר", done: res.status === 409 };
      profilePromise = null;
      const result = { ok: true, earned: data.earned || 0, points: data.points || null };
      if (result.points) window.dispatchEvent(new CustomEvent("pleyi:points", { detail: result }));
      return result;
    } catch {
      return { ok: false, error: "אין חיבור לאינטרנט — המבחן לא נשמר עדיין" };
    }
  }

  // "בקשת מבחן חוזר": { ok, test } or { ok: false, error }.
  async function askRetake(testId) {
    const current = key();
    if (!current) return { ok: false, error: "צריך את הקישור האישי" };
    try {
      const res = await fetch("/api/test-retake", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Student-Key": current },
        body: JSON.stringify({ testId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) return { ok: false, error: data.error || "הבקשה לא נשלחה" };
      profilePromise = null;
      return { ok: true, test: data.test };
    } catch {
      return { ok: false, error: "אין חיבור לאינטרנט — נסו שוב" };
    }
  }

  // { rows: [{ name, total, week, isMe }], weekOf } for the student's class, or null.
  async function leaderboard() {
    const current = key();
    if (!current) return null;
    try {
      const res = await fetch("/api/leaderboard", { headers: { "X-Student-Key": current } });
      if (gone(res)) clear();
      const data = await res.json();
      return data.ok ? { rows: data.rows || [], weekOf: data.weekOf } : null;
    } catch {
      return null;
    }
  }

  /* Certificates (lib/english-map.js, one per stage, by its English title)
     earned since this device last showed the student's prizes. The first
     look takes the ones earned already as seen, so they don't all come at
     once. */
  const CERTS_SEEN_KEY = "pleyi-certs-seen";

  function earnedCertificates(student) {
    return (student?.map?.stages || []).filter((stage) => stage.cert?.earned).map((stage) => stage.titleEn);
  }

  function markCertificatesSeen(student) {
    const current = key();
    if (!current) return;
    try {
      const all = JSON.parse(localStorage.getItem(CERTS_SEEN_KEY)) || {};
      all[current] = earnedCertificates(student);
      localStorage.setItem(CERTS_SEEN_KEY, JSON.stringify(all));
    } catch {
      /* ignore */
    }
  }

  function newCertificates(student) {
    const current = key();
    if (!current) return [];
    let all = null;
    try {
      all = JSON.parse(localStorage.getItem(CERTS_SEEN_KEY)) || {};
    } catch {
      return [];
    }
    if (!all[current]) {
      markCertificatesSeen(student);
      return [];
    }
    const seen = new Set(all[current]);
    return earnedCertificates(student).filter((id) => !seen.has(id));
  }

  captureFromUrl();

  return {
    key,
    setKey,
    clear,
    isLinked: () => !!key(),
    fromLink,
    profile,
    record,
    submitTest,
    askRetake,
    leaderboard,
    newCertificates,
    markCertificatesSeen,
    homeUrl: () => (key() ? `/s/${encodeURIComponent(key())}` : null),
  };
})();
