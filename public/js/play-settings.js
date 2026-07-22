/* Per-game settings for /play — persisted in sessionStorage */

(function () {
  const STORAGE_KEY = "gameclass-play-settings";

  const SCHEMA = {
    "word-memory": [
      {
        key: "pairCount",
        type: "select",
        label: "מספר זוגות",
        default: 6,
        options: [
          { value: 6, label: "6 זוגות (12 קלפים)" },
          { value: 8, label: "8 זוגות (16 קלפים)" },
          { value: 9, label: "9 זוגות (18 קלפים)" },
          { value: 12, label: "12 זוגות (24 קלפים)" },
        ],
      },
    ],
    "vocabulary-duel": [{ key: "disableTimer", label: "בטל טיימר", default: false }],
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
        let val = stored[def.key] ?? def.default;
        if (def.type === "select") val = Number(val);
        out[def.key] = val;
      }
      return out;
    },

    set(gameId, key, value) {
      const all = loadAll();
      if (!all[gameId]) all[gameId] = {};
      const def = (SCHEMA[gameId] || []).find((d) => d.key === key);
      if (def?.type === "select") value = Number(value);
      all[gameId][key] = value;
      saveAll(all);
      window.dispatchEvent(
        new CustomEvent("play-settings-change", { detail: { gameId, key, value } })
      );
    },
  };
})();
