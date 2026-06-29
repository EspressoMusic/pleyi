/* Per-game settings for /play — persisted in sessionStorage */

(function () {
  const STORAGE_KEY = "gameclass-play-settings";

  const SCHEMA = {
    "tower-stack": [{ key: "disableTimer", label: "בטל טיימר", default: false }],
    "math-blitz": [{ key: "disableTimer", label: "בטל טיימר", default: false }],
  };

  function loadAll() {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function saveAll(data) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  window.PlaySettings = {
    schema(gameId) {
      return SCHEMA[gameId] || [];
    },

    get(gameId) {
      const stored = loadAll()[gameId] || {};
      const out = {};
      for (const def of SCHEMA[gameId] || []) {
        out[def.key] = stored[def.key] ?? def.default;
      }
      return out;
    },

    set(gameId, key, value) {
      const all = loadAll();
      if (!all[gameId]) all[gameId] = {};
      all[gameId][key] = value;
      saveAll(all);
      window.dispatchEvent(
        new CustomEvent("play-settings-change", { detail: { gameId, key, value } })
      );
    },
  };
})();
