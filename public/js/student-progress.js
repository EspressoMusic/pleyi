/* Student progress — a student opens the personal link the teacher sent
   (/s/<key>, or any page with ?s=<key>). The key is remembered on this device,
   and from then on finished exercises, opened lessons and played games are
   saved to that student's file. No sign-in; visitors without a key aren't
   recorded. */

window.StudentProgress = (() => {
  const STORAGE_KEY = "pleyi-student-key";
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
      return true;
    } catch {
      return false;
    }
  }

  function clear() {
    profilePromise = null;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
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
  function profile() {
    const current = key();
    if (!current) return Promise.resolve(null);
    if (!profilePromise) {
      profilePromise = fetch(`/api/student/${encodeURIComponent(current)}`)
        .then(async (res) => {
          if (res.status === 404) {
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

  async function record(activity) {
    const current = key();
    if (!current) return false;
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Student-Key": current },
        body: JSON.stringify({ activity }),
        keepalive: true,
      });
      if (res.status === 404) clear();
      return res.ok;
    } catch (err) {
      console.warn("progress save failed", err);
      return false;
    }
  }

  captureFromUrl();

  return {
    key,
    setKey,
    clear,
    isLinked: () => !!key(),
    profile,
    record,
    homeUrl: () => (key() ? `/s/${encodeURIComponent(key())}` : null),
  };
})();
