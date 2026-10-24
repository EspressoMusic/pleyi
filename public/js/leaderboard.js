/* Class leaderboard — every student file of the same teacher, ranked by the
   points they earned practicing (lib/student-progress.js). Shown on the
   Learn English page and the student's homework page (/s/<key>), for the
   student whose link this device opened, and on the teacher's students page.

   Leaderboard.boardHtml(rows, { period, limit })
     rows: [{ name, total, week, isMe }]; period: "week" | "total";
     limit: show only the top `limit` (and the student's own row below them).
   Leaderboard.bind(box, rows, opts) — renders the board with week / all-time
     tabs into `box`, and switches between them.
   Leaderboard.open() — the linked student's full board in a dialog.
   Leaderboard.rulesHtml() — how points are earned. */

window.Leaderboard = (() => {
  const PERIOD_KEY = "pleyi-leaderboard-period";

  const STR = {
    he: {
      title: "טבלת השיאים",
      week: "השבוע",
      total: "כל הזמנים",
      periods: "תקופה",
      points: (n) => `${n.toLocaleString("he-IL")} נק׳`,
      pointsFull: (n) => (n === 1 ? "נקודה אחת" : `${n.toLocaleString("he-IL")} נקודות`),
      rank: (n) => `מקום ${n}`,
      me: "אני",
      empty: "עוד אין נקודות. כל תשובה נכונה מקדמת אתכם בטבלה!",
      weekEmpty: "השבוע עוד אין נקודות — מי יהיה הראשון?",
      rulesTitle: "איך צוברים נקודות?",
      rules: [
        "כל תשובה נכונה: 10 נקודות ברמה 1, 15 ברמה 2 ו-20 ברמה 3 (בקטעי קריאה ברמה 4: 25).",
        "סבב בלי אף טעות: עוד 20 נקודות בונוס.",
        "גם משחקים נותנים נקודות — לפי התשובות הנכונות והכוכבים.",
        "תרגול הטעויות שווה חצי מהנקודות.",
        "הנקודות של השבוע מתחילות מאפס בכל יום ראשון.",
      ],
      close: "סגירה",
      loading: "טוען את הטבלה…",
      error: "לא הצלחנו לטעון את הטבלה. בדקו את החיבור ונסו שוב.",
    },
    en: {
      title: "Leaderboard",
      week: "This week",
      total: "All time",
      periods: "Period",
      points: (n) => `${n.toLocaleString("en-US")} pts`,
      pointsFull: (n) => (n === 1 ? "1 point" : `${n.toLocaleString("en-US")} points`),
      rank: (n) => `Rank ${n}`,
      me: "Me",
      empty: "No points yet. Every right answer moves you up!",
      weekEmpty: "No points this week yet — who will be first?",
      rulesTitle: "How do I earn points?",
      rules: [
        "Every right answer: 10 points on level 1, 15 on level 2 and 20 on level 3 (level 4 reading passages: 25).",
        "A round without a single mistake: a 20-point bonus.",
        "Games earn points too — for right answers and stars.",
        "Practicing your mistakes earns half the points.",
        "This week's points start from zero every Sunday.",
      ],
      close: "Close",
      loading: "Loading the leaderboard…",
      error: "We couldn't load the leaderboard. Check your connection and try again.",
    },
  };

  const ICONS = {
    trophy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 4h10v5a5 5 0 0 1-10 0V4Z"/><path d="M7 6H4v1.5A3.5 3.5 0 0 0 7.5 11M17 6h3v1.5a3.5 3.5 0 0 1-3.5 3.5M12 14v3.5M8 21h8M9.5 17.5h5l.5 3.5H9l.5-3.5Z"/></svg>`,
    cross: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>`,
  };

  function lang() {
    return window.I18n?.lang === "en" ? "en" : "he";
  }

  function t(key, ...args) {
    const val = STR[lang()][key];
    return typeof val === "function" ? val(...args) : val;
  }

  function esc(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function savedPeriod() {
    try {
      return localStorage.getItem(PERIOD_KEY) === "total" ? "total" : "week";
    } catch {
      return "week";
    }
  }

  function savePeriod(period) {
    try {
      localStorage.setItem(PERIOD_KEY, period);
    } catch {
      /* ignore */
    }
  }

  // Highest first; equal points share a rank (1, 1, 3).
  function ranked(rows, period) {
    const sorted = [...rows].sort((a, b) => b[period] - a[period] || String(a.name).localeCompare(String(b.name), "he"));
    return sorted.map((row) => ({ ...row, points: row[period], rank: 1 + sorted.filter((r) => r[period] > row[period]).length }));
  }

  function rowHtml(row) {
    const medal = row.points > 0 && row.rank <= 3 ? ` is-rank-${row.rank}` : "";
    return `
      <li class="lb-row${row.isMe ? " is-me" : ""}${medal}">
        <span class="lb-rank" aria-label="${esc(t("rank", row.rank))}">${row.rank}</span>
        <span class="lb-name">${esc(row.name)}${row.isMe ? ` <span class="lb-me">${esc(t("me"))}</span>` : ""}</span>
        <span class="lb-points" aria-label="${esc(t("pointsFull", row.points))}">${esc(t("points", row.points))}</span>
      </li>`;
  }

  function boardHtml(rows, { period = "week", limit = 0 } = {}) {
    const list = ranked(rows, period);
    const scored = list.filter((row) => row.points > 0);
    if (!scored.length) {
      const me = list.find((row) => row.isMe);
      return `
        <p class="lb-empty">${esc(t(period === "week" ? "weekEmpty" : "empty"))}</p>
        ${me ? `<ol class="lb-list">${rowHtml(me)}</ol>` : ""}`;
    }
    // A short board shows the top of the class, plus the student's own row
    // when they are further down.
    const shown = limit ? scored.slice(0, limit) : list;
    const me = list.find((row) => row.isMe);
    const meBelow = limit && me && !shown.includes(me);
    return `
      <ol class="lb-list">
        ${shown.map(rowHtml).join("")}
        ${meBelow ? `<li class="lb-gap" aria-hidden="true">…</li>${rowHtml(me)}` : ""}
      </ol>`;
  }

  function tabsHtml(period) {
    return `
      <div class="lb-tabs" role="tablist" aria-label="${esc(t("periods"))}">
        ${["week", "total"]
          .map((p) => `<button type="button" class="lb-tab" role="tab" data-period="${p}" aria-selected="${p === period}">${esc(t(p))}</button>`)
          .join("")}
      </div>`;
  }

  function rulesHtml() {
    return `
      <details class="lb-rules">
        <summary>${esc(t("rulesTitle"))}</summary>
        <ul>${t("rules").map((rule) => `<li>${esc(rule)}</li>`).join("")}</ul>
      </details>`;
  }

  // The board with its week / all-time tabs, inside `box`.
  function bind(box, rows, opts = {}) {
    let period = opts.period || savedPeriod();
    const draw = () => {
      box.innerHTML = `${tabsHtml(period)}<div class="lb-board" role="tabpanel">${boardHtml(rows, { ...opts, period })}</div>`;
      box.querySelectorAll(".lb-tab").forEach((tab) =>
        tab.addEventListener("click", () => {
          if (tab.dataset.period === period) return;
          period = tab.dataset.period;
          savePeriod(period);
          draw();
          box.querySelector(`.lb-tab[data-period="${period}"]`)?.focus({ preventScroll: true });
        })
      );
    };
    draw();
  }

  /* ── The dialog (appended to body, so its position needs !important —
     styles.css makes every direct child of body position: relative) ── */

  let root = null;
  let lastFocus = null;
  let openRun = 0;

  function build() {
    root = document.createElement("div");
    root.className = "lb-dialog hidden";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-labelledby", "lbDialogTitle");
    document.body.appendChild(root);
    root.addEventListener("click", (e) => {
      if (e.target.closest("[data-lb-close]")) close();
    });
    document.addEventListener("keydown", (e) => {
      if (!isOpen()) return;
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "Tab") {
        const items = [...root.querySelectorAll("button, summary")];
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  function shell(body) {
    root.innerHTML = `
      <div class="lb-backdrop" data-lb-close></div>
      <div class="lb-card">
        <div class="lb-head">
          <span class="lb-icon">${ICONS.trophy}</span>
          <h2 class="lb-title" id="lbDialogTitle">${esc(t("title"))}</h2>
          <button type="button" class="lb-close" data-lb-close aria-label="${esc(t("close"))}">${ICONS.cross}</button>
        </div>
        <div class="lb-body" id="lbDialogBody">${body}</div>
        ${rulesHtml()}
      </div>`;
  }

  async function open() {
    if (!root) build();
    const run = ++openRun;
    lastFocus = document.activeElement;
    shell(`<p class="lb-empty">${esc(t("loading"))}</p>`);
    root.classList.remove("hidden");
    document.body.classList.add("lb-open");
    root.querySelector(".lb-close").focus({ preventScroll: true });
    const data = await window.StudentProgress?.leaderboard();
    if (run !== openRun || !isOpen()) return;
    const body = root.querySelector("#lbDialogBody");
    if (!data) body.innerHTML = `<p class="lb-empty">${esc(t("error"))}</p>`;
    else bind(body, data.rows);
  }

  function close() {
    if (!isOpen()) return;
    root.classList.add("hidden");
    document.body.classList.remove("lb-open");
    if (lastFocus?.isConnected) lastFocus.focus({ preventScroll: true });
  }

  function isOpen() {
    return !!root && !root.classList.contains("hidden");
  }

  return { boardHtml, bind, open, close, isOpen, rulesHtml, icon: ICONS.trophy };
})();
