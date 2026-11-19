/* "מה חדש" on the road-safety site (/road-safety).
   - Home: the newest cards, one at a time, as on the Pleyi home page
     (news-carousel.js turns them; this file must load before it). The
     whole card opens #news.
   - #news: every update on a page of its own, by kind (lessons, games,
     exercises), each card with a button straight to the material.
   NEWS is newest first: a new update goes at the top, with a phone
   screenshot in /images/news/road/ (scripts/capture-road-news.js).
   A lesson, exercise topic or game that isn't in ANNOUNCED gets a card of
   its own at the top by itself (newNews), with its drawing for a picture. */
(function () {
  const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const SHOTS = "/images/news/road/";
  const SHOTS_V = 1;
  const HOME_CARDS = 5;

  const LESSONS = (window.SUBJECT_SHORT_LESSONS || []).filter((l) => l.subject === "road");
  const AREA = window.SUBJECT_AREAS?.["road-safety"] || { topics: [], path: [] };
  const GAMES = window.RsGames ? window.RsGames() : [];

  // go: a lesson (data-rs-lesson) or a game (data-rs-game) opens over the
  // page (road-safety.js); href goes to one of this site's pages.
  const NEWS = [
    {
      kind: "games",
      title: "משחק חדש: תקין או לא תקין?",
      lines: ["צופים במה שקורה בכביש", "ובוחרים: תקין או לא תקין"],
      shot: "cases",
      go: { label: "לשחק", game: "cases" },
    },
    {
      kind: "lessons",
      title: "ציורים זזים בשיעורים",
      lines: ["ילד הולך במדרכה ומכוניות עוצרות", "כמו ברחוב אמיתי"],
      shot: "city",
      go: { label: "לשיעור הראשון", lesson: "road-walk" },
    },
    {
      kind: "lessons",
      title: `${LESSONS.length} שיעורים קצרים`,
      lines: ["מהולכי רגל ועד אחריות בדרך", `${AREA.path.length} שלבים לפי הסדר`],
      shot: "lessons",
      go: { label: "לספריית השיעורים", href: "#lessons" },
    },
    {
      kind: "practice",
      title: "תרגילים לכל שיעור",
      lines: [`${AREA.topics.length} נושאים לתרגול`, "כל נושא לפי השיעור שלו"],
      shot: "practice",
      go: { label: "לתרגילים", href: "#practice" },
    },
    {
      kind: "lessons",
      title: "הסבר מורחב בכל שקופית",
      lines: ["כפתור למעלה מוסיף עוד הסבר", "כשהכיתה צריכה עוד קצת"],
      shot: "more",
      go: { label: "לספריית השיעורים", href: "#lessons" },
    },
    {
      kind: "games",
      title: "משחקים לכל הכיתה",
      lines: ["חוצים בירוק, זיכרון תמרורים", "בטוח או מסוכן ומה קודם"],
      shot: "games",
      go: { label: "למשחקים", href: "#games" },
    },
  ];

  // What was on the site on 2026-11-19. Anything added after it is
  // announced by newNews; once it has a card of its own in NEWS, add its id
  // here. A lesson and its exercise topic share an id.
  const ANNOUNCED_TOPICS = [
    "road-street", "road-body", "road-moves", "road-stop",
    "road-walk", "road-park", "road-cross", "road-lights", "road-group", "road-school",
    "road-signs", "road-signs2", "road-marks", "road-see", "road-rail",
    "road-car", "road-shuttle",
    "road-bike", "road-ride", "road-electric",
    "road-city", "road-busy", "road-free", "road-why", "road-wide", "road-junction", "road-route",
    "road-speed", "road-focus", "road-choice", "road-help",
    "road-winter", "road-holiday",
  ];
  // The picture games (find, wrong) are announced when their pictures come.
  const ANNOUNCED_GAMES = ["cases", "light", "memory", "safe", "order"];

  // Pictures for a new lesson or exercise topic, which has no screenshot.
  const ART = {
    lesson: () => `<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M60 30c-12-8-28-10-44-8v66c16-2 32 0 44 8 12-8 28-10 44-8V22c-16-2-32 0-44 8z" fill="#fff3a8" stroke="#000" stroke-width="5" stroke-linejoin="round"/><path d="M60 30v66M26 40c8-1 16 0 24 3M26 54c8-1 16 0 24 3M70 43c8-3 16-4 24-3M70 57c8-3 16-4 24-3" fill="none" stroke="#000" stroke-width="4" stroke-linecap="round"/></svg>`,
    practice: () => `<svg viewBox="0 0 120 120" aria-hidden="true"><rect x="22" y="14" width="76" height="92" rx="12" fill="#fff" stroke="#000" stroke-width="5"/><path d="m34 38 7 7 12-13M34 66l7 7 12-13" fill="none" stroke="#00a38f" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><path d="M62 40h24M62 68h24M34 92h52" stroke="#000" stroke-width="5" stroke-linecap="round"/></svg>`,
  };

  const stageOf = (id) => AREA.path.find((stage) => stage.topics.includes(id))?.title;

  function newNews() {
    const games = GAMES.filter((g) => !ANNOUNCED_GAMES.includes(g.id)).map((g) => ({
      kind: "games",
      title: `משחק חדש: ${g.title}`,
      lines: g.how.slice(0, 2),
      art: g.art,
      go: { label: "לשחק", game: g.id },
    }));
    const practiceIds = AREA.topics.map((t) => t.id);
    const lessons = LESSONS.filter((l) => !ANNOUNCED_TOPICS.includes(l.id)).map((l) => ({
      kind: "lessons",
      title: `שיעור חדש: ${l.name}`,
      lines: [
        stageOf(l.topic) ? `בשלב „${stageOf(l.topic)}”` : "בספריית השיעורים",
        practiceIds.includes(l.topic) ? "ויש גם תרגילים לפי השיעור" : "לוחצים ונכנסים לשיעור",
      ],
      art: ART.lesson,
      go: { label: "לשיעור", lesson: l.id },
    }));
    // Exercises with no lesson of their own (a new lesson's are on its card).
    const lessonTopics = LESSONS.map((l) => l.topic);
    const practice = AREA.topics
      .filter((t) => !ANNOUNCED_TOPICS.includes(t.id) && !lessonTopics.includes(t.id))
      .map((t) => ({
        kind: "practice",
        title: `תרגילים חדשים: ${t.title}`,
        lines: ["נושא חדש לתרגול", "לוחצים ומתחילים"],
        art: ART.practice,
        go: { label: "לתרגילים", href: `#${t.id}` },
      }));
    return [...games, ...lessons, ...practice];
  }

  const ALL = [...newNews(), ...NEWS];

  // The page's groups, in this order.
  const KINDS = [
    { id: "lessons", title: "שיעורים" },
    { id: "games", title: "משחקים" },
    { id: "practice", title: "תרגילים" },
  ];

  const big = (item) => `${SHOTS}${item.shot}.webp?v=${SHOTS_V}`;
  const thumb = (item) => `${SHOTS}${item.shot}-thumb.webp?v=${SHOTS_V}`;
  const thumbImg = (item) => `<img src="${esc(thumb(item))}" alt="" width="240" height="320" loading="lazy" draggable="false" />`;

  // On #news a screenshot opens big; a drawing (a new item's) stays put.
  function shotBtn(item) {
    if (!item.shot) return `<span class="news-shot news-shot--art">${item.art()}</span>`;
    return `
    <button type="button" class="news-shot" data-news-shots="${esc(big(item))}" aria-label="${esc(`לראות בתמונה: ${item.title}`)}">
      ${thumbImg(item)}
    </button>`;
  }

  // On the home page the picture is part of the card, which opens #news.
  const shotPic = (item) =>
    item.shot ? `<span class="news-shot">${thumbImg(item)}</span>` : `<span class="news-shot news-shot--art">${item.art()}</span>`;

  const lines = (item) => item.lines.map((line) => `<p class="news-text">${esc(line)}</p>`).join("");

  function goBtn({ label, lesson, game, href }) {
    const cls = "btn btn-primary btn-candy font-cartoon rs-news-go";
    if (lesson) return `<button type="button" class="${cls}" data-rs-lesson="${esc(lesson)}">${esc(label)}</button>`;
    if (game) return `<button type="button" class="${cls}" data-rs-game="${esc(game)}">${esc(label)}</button>`;
    return `<a class="${cls}" href="${esc(href)}">${esc(label)}</a>`;
  }

  function renderHome() {
    const list = document.getElementById("rsNewsList");
    if (!list) return;
    list.innerHTML = ALL.slice(0, HOME_CARDS)
      .map(
        (item, i) => `
        <li class="news-item rs-news-open${i ? "" : " is-active"}" aria-roledescription="slide" tabindex="0">
          <div class="news-body">
            <h3 class="news-title">${esc(item.title)}</h3>
            ${lines(item)}
          </div>
          ${shotPic(item)}
        </li>`
      )
      .join("");

    // A card opens #news, the page with every update.
    list.addEventListener("click", (e) => {
      if (e.target.closest(".rs-news-open")) location.hash = "news";
    });
    // Enter or space on a card opens it, as a click does.
    list.addEventListener("keydown", (e) => {
      if ((e.key === "Enter" || e.key === " ") && e.target.matches(".rs-news-open")) {
        e.preventDefault();
        e.target.click();
      }
    });
  }

  function renderPage() {
    const feed = document.getElementById("rsNewsFeed");
    if (!feed) return;
    feed.innerHTML = KINDS.map((kind) => ({ ...kind, items: ALL.filter((item) => item.kind === kind.id) }))
      .filter((kind) => kind.items.length)
      .map(
        (kind) => `
        <div class="rs-news-group">
          <h3 class="eng-group-title eng-path-title">${esc(kind.title)}</h3>
          <ol class="rs-news-cards">
            ${kind.items
              .map(
                (item) => `
              <li class="rs-news-card">
                <div class="news-body">
                  <h4 class="news-title">${esc(item.title)}</h4>
                  ${lines(item)}
                  <div class="rs-news-actions">${goBtn(item.go)}</div>
                </div>
                ${shotBtn(item)}
              </li>`
              )
              .join("")}
          </ol>
        </div>`
      )
      .join("");

    // A card's picture opens big in the home page's dialog (its close
    // button and backdrop are wired by news-carousel.js).
    feed.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-news-shots]");
      const zoom = document.querySelector(".news-zoom");
      if (!btn || !zoom) return;
      const title = btn.closest(".rs-news-card")?.querySelector(".news-title")?.textContent || "";
      const img = zoom.querySelector(".news-zoom-img");
      zoom.querySelector(".news-zoom-key").textContent = title;
      zoom.querySelector(".news-zoom-nav").hidden = true;
      img.src = btn.dataset.newsShots;
      img.alt = title;
      zoom.showModal();
    });
  }

  renderHome();
  renderPage();
})();
