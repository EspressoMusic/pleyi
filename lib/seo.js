const fs = require("fs");
const path = require("path");
const vm = require("vm");

/**
 * Pages for search engines and AI assistants. The English section of the site
 * (/services/english) is drawn in the browser, so a crawler that doesn't run
 * JavaScript sees an empty page. This module reads the same data files the
 * browser does and renders them as plain HTML:
 *
 *   /english                   every topic, in the learning path's stages
 *   /english/<topic>           a topic's short lessons, words, quiz and exercises
 *   /english/reading/<id>      one reading passage or reading exam
 *
 * plus /sitemap.xml and /llms.txt, which list them next to the site's other
 * pages. Every page links to the matching place in the interactive site.
 * The pages are built once, when the server starts.
 */

const SITE = "https://pleyschool.com";
const PUBLIC_DIR = path.join(__dirname, "..", "public");
const JS_DIR = path.join(PUBLIC_DIR, "js");
// The browser's load order (services/english.html) — later files add to the
// topics the earlier ones made.
const DATA_FILES = [
  "english-vocab.js",
  "english-lessons.js",
  "english-data.js",
  "english-reading.js",
  "english-dict.js",
  "english-more.js",
  "english-exams.js",
];
const CSS = `<link rel="stylesheet" href="/styles.css?v=70"/>
  <link rel="stylesheet" href="/css/clean-site.css?v=87"/>
  <link rel="stylesheet" href="/css/legal.css?v=3"/>
  <link rel="stylesheet" href="/css/blog.css?v=1"/>
  <link rel="stylesheet" href="/css/english-guide.css?v=1"/>
  <link rel="stylesheet" href="/css/accessibility.css?v=1" />`;
const LEVEL_NAMES = ["", "קל", "בינוני", "מתקדם", "מאתגר"];

// The site's own pages, for the sitemap: [url path, file, changefreq, priority].
const STATIC_PAGES = [
  ["/", "index.html", "weekly", "1.0"],
  ["/services/ready-lessons", "services/ready-lessons.html", "weekly", "0.9"],
  ["/services/english", "services/english.html", "weekly", "0.9"],
  ["/english", null, "weekly", "0.9"],
  ["/services/worksheets", "services/worksheets.html", "weekly", "0.9"],
  ["/services/game-builder", "services/game-builder.html", "weekly", "0.9"],
  ["/services/family", "services/family.html", "weekly", "0.9"],
  ["/lesson-plans", "lesson-plans.html", "weekly", "0.8"],
  ["/premium", "premium.html", "monthly", "0.6"],
  ["/blog", "blog/index.html", "weekly", "0.7"],
  ["/blog/english-games-for-classroom", "blog/english-games-for-classroom.html", "monthly", "0.6"],
  ["/blog/quick-lesson-plan-guide", "blog/quick-lesson-plan-guide.html", "monthly", "0.6"],
  ["/blog/printable-english-worksheets-guide", "blog/printable-english-worksheets-guide.html", "monthly", "0.6"],
  ["/blog/digital-vs-frontal-classroom-games", "blog/digital-vs-frontal-classroom-games.html", "monthly", "0.6"],
  ["/blog/family-english-practice-at-home", "blog/family-english-practice-at-home.html", "monthly", "0.6"],
  ["/blog/substitute-teacher-lesson-plan", "blog/substitute-teacher-lesson-plan.html", "monthly", "0.6"],
  ["/blog/choosing-game-by-age-level", "blog/choosing-game-by-age-level.html", "monthly", "0.6"],
  ["/blog/english-classroom-games-faq", "blog/english-classroom-games-faq.html", "monthly", "0.6"],
  ["/legal/privacy.html", "legal/privacy.html", "yearly", "0.2"],
  ["/legal/terms.html", "legal/terms.html", "yearly", "0.2"],
  ["/legal/cookies.html", "legal/cookies.html", "yearly", "0.2"],
  ["/legal/accessibility.html", "legal/accessibility.html", "yearly", "0.2"],
];

function loadData() {
  const win = {};
  const context = vm.createContext({ window: win });
  DATA_FILES.forEach((file) => {
    vm.runInContext(fs.readFileSync(path.join(JS_DIR, file), "utf8"), context, { filename: file });
  });
  return win;
}

function pageTitle(file) {
  try {
    const match = fs.readFileSync(path.join(PUBLIC_DIR, file), "utf8").match(/<title>([^<]+)<\/title>/);
    return match ? match[1].replace(/\s*\|\s*Pleyi\s*$/, "").trim() : null;
  } catch {
    return null;
  }
}

function fileDate(file) {
  try {
    return fs.statSync(path.join(PUBLIC_DIR, file)).mtime.toISOString().slice(0, 10);
  } catch {
    return null;
  }
}

/* ── Text helpers ── */

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// "**am**" marks the word a slide is about.
function rich(value) {
  return esc(value).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

function plain(value) {
  return String(value ?? "").replace(/\*\*/g, "");
}

// Reading passages bracket the words the student marks: "[He] is tall."
function unbracket(value) {
  return String(value ?? "").replace(/\[([^\]]+)\]/g, "$1");
}

function en(value, tag = "span") {
  return `<${tag} dir="ltr" lang="en">${rich(value)}</${tag}>`;
}

function clip(value, max = 155) {
  const text = plain(value).replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1).replace(/\s+\S*$/, "")}…` : text;
}

function jsonLd(data) {
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;
}

/* ── Page shell (the blog's) ── */

function breadcrumbLd(trail) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map(([name, url], i) => ({ "@type": "ListItem", position: i + 1, name, item: `${SITE}${url}` })),
  };
}

function page({ url, title, description, h1, kicker, body, ld = [], trail }) {
  const fullTitle = `${title} | Pleyi`;
  const crumbs = trail
    .map(([name, href], i) => (i === trail.length - 1 ? `<span aria-current="page">${esc(name)}</span>` : `<a href="${href}">${esc(name)}</a>`))
    .join(' <span class="eg-crumb-sep" aria-hidden="true">›</span> ');
  return `<!DOCTYPE html>
<html lang="he" dir="rtl" data-theme="light">
<head>
  <script src="/js/theme.js?v=1"></script>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="theme-color" content="#00C9B7" />
  <link rel="manifest" href="/manifest.webmanifest"/>
  <link rel="icon" href="/icons/icon.svg" type="image/svg+xml"/>
  <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png"/>
  <title>${esc(fullTitle)}</title>
  <meta name="description" content="${esc(description)}"/>
  <link rel="canonical" href="${SITE}${url}"/>
  <meta property="og:type" content="article"/>
  <meta property="og:site_name" content="Pleyi"/>
  <meta property="og:title" content="${esc(title)}"/>
  <meta property="og:description" content="${esc(description)}"/>
  <meta property="og:url" content="${SITE}${url}"/>
  <meta property="og:image" content="${SITE}/images/pleyi-logo.png"/>
  <meta property="og:locale" content="he_IL"/>
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="${esc(title)}"/>
  <meta name="twitter:description" content="${esc(description)}"/>
  <meta name="twitter:image" content="${SITE}/images/pleyi-logo.png"/>
  ${CSS}
  ${[breadcrumbLd(trail), ...ld].map(jsonLd).join("\n  ")}
</head>
<body class="clean-site eg-page">

  <div class="scroll-progress" id="scrollProgress"></div>

  <header class="navbar scrolled" id="navbar">
    <div class="container nav-inner">
      <nav class="nav-links" id="navLinks">
        <a href="/" class="nav-pill">בית</a>
        <a href="/services/ready-lessons" class="nav-pill">שיעורים</a>
        <a href="/english" class="nav-pill">מדריך אנגלית</a>
        <a href="/blog" class="nav-pill">בלוג</a>
        <a href="/#contact" class="nav-pill">צור קשר</a>
      </nav>
      <div class="nav-actions">
        <button class="menu-toggle" id="menuToggle" aria-label="תפריט"><span></span><span></span><span></span></button>
      </div>
    </div>
  </header>

  <nav class="mobile-nav" id="mobileNav">
    <a href="/">בית</a>
    <a href="/services/ready-lessons">שיעורים</a>
    <a href="/english">מדריך אנגלית</a>
    <a href="/blog">בלוג</a>
    <a href="/#contact">צור קשר</a>
  </nav>

  <main class="legal-page">
    <div class="container">
      <nav class="eg-crumbs" aria-label="מיקום בדף">${crumbs}</nav>
      ${kicker ? `<p class="eg-kicker"><span>${kicker}</span></p>` : ""}
      <h1>${h1}</h1>
${body}
    </div>
  </main>

  <footer class="site-footer section-yellow">
    <div class="container footer-inner">
      <p class="footer-tagline font-cartoon"><span>לימוד במשחקים — </span><span class="footer-tagline-accent">בכל שיעור!</span></p>
      <nav class="site-legal-nav" aria-label="מידע משפטי">
        <a href="/blog">בלוג</a>
        <a href="/english">מדריך אנגלית</a>
        <a href="/legal/terms.html">תקנון</a>
        <a href="/legal/privacy.html">פרטיות</a>
        <a href="/legal/cookies.html">עוגיות</a>
        <a href="/legal/accessibility.html">נגישות</a>
      </nav>
    </div>
  </footer>

  <script src="/js/service-landing.js?v=5"></script>
  <script src="/js/cookie-consent.js?v=4"></script>
</body>
</html>`;
}

function cta(text, links) {
  const buttons = links
    .map(([label, href], i) => `<a href="${href}" class="btn btn-primary btn-candy font-cartoon${i ? " eg-btn-alt" : ""}">${esc(label)}</a>`)
    .join("\n          ");
  return `      <div class="blog-cta eg-cta">
        <p>${esc(text)}</p>
        <div class="eg-cta-buttons">
          ${buttons}
        </div>
      </div>`;
}

/* ── The guide ── */

function buildGuide() {
  const data = loadData();
  const topics = data.ENGLISH_TOPICS || [];
  const vocab = data.ENGLISH_VOCAB || {};
  const lessons = new Map((data.ENGLISH_SHORT_LESSONS || []).map((lesson) => [lesson.id, lesson]));
  const categories = new Map((data.ENGLISH_VOCAB_CATEGORIES || []).map((cat) => [`vocab-${cat.id}`, cat]));
  const stages = data.ENGLISH_PATH || [];
  const levels = data.ENGLISH_LESSON_LEVELS || {};
  const updated = DATA_FILES.map((file) => fileDate(`js/${file}`)).filter(Boolean).sort().pop();

  const topicById = new Map(topics.map((topic) => [topic.id, topic]));
  // Path order, then anything the path leaves out.
  const ordered = [...new Set([...stages.flatMap((stage) => stage.topics), ...topics.map((topic) => topic.id)])]
    .map((id) => topicById.get(id))
    .filter(Boolean);
  const stageOf = new Map();
  stages.forEach((stage, i) => stage.topics.forEach((id) => stageOf.set(id, { ...stage, num: i + 1 })));

  const passages = [];
  ordered.forEach((topic) => {
    topic.exercises
      .filter((ex) => (ex.type === "reading" || ex.type === "exam") && ex.passage)
      .forEach((ex) => passages.push({ ...ex, topic }));
  });

  const isVocab = (topic) => topic.group === "vocab";
  const isPassageTopic = (topic) => topic.id === "reading" || topic.id === "exams";
  // A topic with one lesson names it in `lesson` (a vocabulary topic's picture
  // lesson isn't a short lesson, and is drawn from its category instead).
  const topicLessons = (topic) => (topic.lessons || [topic.lesson]).map((id) => lessons.get(id)).filter(Boolean);
  const topicUrl = (topic) => `/english/${topic.id}`;
  const passageUrl = (ex) => `/english/reading/${ex.id}`;
  const passageKind = (ex) => (ex.type === "exam" ? "מבחן הבנת הנקרא" : "קטע קריאה");

  // "כמויות: some, any, much, many" → ["כמויות", "some, any, much, many"];
  // "מה השעה?" → ["מה השעה", ""].
  function titleParts(topic) {
    const [name, rest = ""] = topic.title.replace(/\?$/, "").split(/:\s*/);
    return [name, rest];
  }

  // "כמויות באנגלית – some, any, much, many", "פועל להיות באנגלית (To Be)"
  function topicTitle(topic) {
    const [name, rest] = titleParts(topic);
    return rest ? `${name} באנגלית – ${rest}` : `${name} באנגלית (${topic.titleEn})`;
  }

  // One line per lesson; a topic without short lessons has its lesson's.
  function topicSummaries(topic) {
    if (topic.id === "reading") return ["קטעי קריאה קצרים באנגלית בארבע רמות, עם שאלות הבנה."];
    if (topic.id === "exams") return ["מבחנים בהבנת הנקרא באנגלית בארבע רמות — קטע ושאלות מכל הסוגים."];
    const summaries = topicLessons(topic).map((lesson) => lesson.summary);
    return summaries.length ? summaries : [topic.lessonSummary].filter(Boolean);
  }

  const topicSummary = (topic) => topicSummaries(topic).join(" · ");

  // A picture-vocabulary topic's words: its category's, or the ones its
  // picture exercises use.
  function topicWords(topic) {
    const cat = categories.get(topic.id);
    if (cat) return cat.words.map((w) => [w.en, w.he]);
    const ids = [...new Set(topic.exercises.flatMap((ex) => ex.words || []))];
    return ids.map((id) => vocab[id]).filter(Boolean).map((w) => [w.en, w.he]);
  }

  function topicHeading(topic) {
    if (isPassageTopic(topic)) return esc(topic.title);
    const [name, rest] = titleParts(topic);
    return `${esc(name)} באנגלית <span class="eg-h1-en">${en(rest || topic.titleEn)}</span>`;
  }

  /* Lesson slides as text: titles, lines, "from → to" tables, examples with
     their translation and the wrong/right pair. */
  function slideHtml(slide) {
    const parts = [`<h4>${rich(slide.title)}</h4>`];
    (slide.lines || []).forEach((line) => parts.push(`<p>${rich(line)}</p>`));
    if (slide.table?.length) {
      parts.push(`<ul class="eg-table">${slide.table
        .map(([from, to]) => `<li>${en(from)} <span class="eg-arrow" aria-hidden="true">←</span> ${en(to)}</li>`)
        .join("")}</ul>`);
    }
    if (slide.examples?.length) {
      parts.push(`<ul class="eg-examples">${slide.examples
        .map(([sentence, he]) => `<li>${en(sentence)}${he ? ` <span class="eg-he">${rich(he)}</span>` : ""}</li>`)
        .join("")}</ul>`);
    }
    if (slide.compare) {
      parts.push(`<p class="eg-compare"><span class="eg-wrong">לא נכון ${en(slide.compare[0])}</span> <span class="eg-right">נכון ${en(slide.compare[1])}</span></p>`);
    }
    return `<div class="eg-slide">${parts.join("\n")}</div>`;
  }

  function quizHtml(quiz) {
    if (!quiz?.length) return "";
    const items = quiz.map(([q, he, options, answer, why]) => `<li>
            <p class="eg-q">${en(q)}${he ? ` <span class="eg-he">${rich(he)}</span>` : ""}</p>
            <p class="eg-options">${options.map((option) => en(option)).join(' <span aria-hidden="true">·</span> ')}</p>
            <details><summary>תשובה</summary><p>${en(options[answer])} ${why ? `— ${rich(why)}` : ""}</p></details>
          </li>`);
    return `<h3>בודקים את עצמנו</h3>
        <ol class="eg-quiz">${items.join("")}</ol>`;
  }

  function wordsHtml(words) {
    if (!words?.length) return "";
    return `<ul class="eg-words">${words.map(([word, he]) => `<li>${en(word)} <span class="eg-he">${rich(he)}</span></li>`).join("")}</ul>`;
  }

  function lessonHtml(lesson, num, count) {
    const heading = count > 1 ? `שיעור ${num} – ${lesson.part || lesson.name}` : lesson.part ? `השיעור – ${lesson.part}` : "השיעור";
    return `      <section class="blog-content eg-lesson" id="${esc(lesson.id)}">
        <h2>${rich(heading)}</h2>
        ${count > 1 ? `<p class="eg-summary">${rich(lesson.summary)}</p>` : ""}
        ${lesson.slides.map(slideHtml).join("\n        ")}
        <h3>מילים מהשיעור</h3>
        ${wordsHtml(lesson.vocab)}
        ${quizHtml(lesson.quiz)}
        ${lesson.discuss?.length ? `<h3>שאלות לדיון בכיתה</h3>
        <ul>${lesson.discuss.map((q) => `<li>${rich(q)}</li>`).join("")}</ul>` : ""}
        <p class="eg-open"><a href="/services/english?lesson=${encodeURIComponent(lesson.id)}">פתיחת השיעור כמצגת, עם חידון ומשחקים</a></p>
      </section>`;
  }

  function vocabHtml(topic) {
    const cat = categories.get(topic.id) || {};
    const words = topicWords(topic);
    if (!words.length) return "";
    return `      <section class="blog-content eg-lesson" id="${esc(topic.lesson || topic.id)}">
        <h2>המילים</h2>
        ${wordsHtml(words)}
        ${cat.sentences?.length ? `<h3>משפטים לדוגמה</h3>
        <ul class="eg-examples">${cat.sentences.map((s) => `<li>${en(s.en)} <span class="eg-he">${rich(s.he)}</span></li>`).join("")}</ul>` : ""}
        ${cat.discussion?.he?.length ? `<h3>שאלות לדיון בכיתה</h3>
        <ul>${cat.discussion.he.map((q) => `<li>${rich(q)}</li>`).join("")}</ul>` : ""}
        <p class="eg-open"><a href="/services/english?lesson=${encodeURIComponent(topic.lesson || topic.id)}">פתיחת השיעור עם התמונות</a></p>
      </section>`;
  }

  function passageListHtml(list, heading) {
    if (!list.length) return "";
    const byLevel = [1, 2, 3, 4].map((level) => list.filter((ex) => ex.level === level)).filter((group) => group.length);
    return `      <section class="blog-content eg-passages">
        <h2>${esc(heading)}</h2>
        ${byLevel.map((group) => `<h3>רמה ${group[0].level} – ${LEVEL_NAMES[group[0].level]}</h3>
        <ul>${group.map((ex) => `<li><a href="${passageUrl(ex)}">${en(ex.passage.title)}</a>${ex.passage.titleHe ? ` <span class="eg-he">${esc(ex.passage.titleHe)}</span>` : ""}</li>`).join("")}</ul>`).join("\n        ")}
      </section>`;
  }

  function exercisesHtml(topic) {
    const list = topic.exercises.filter((ex) => ex.type !== "reading" && ex.type !== "exam");
    if (!list.length) return "";
    return `      <section class="blog-content eg-exercises">
        <h2>תרגול באתר</h2>
        <p>${list.length} תרגילים אינטראקטיביים עם בדיקה מיידית:</p>
        <ul>${list.map((ex) => `<li><a href="/services/english#${encodeURIComponent(topic.id)}/${encodeURIComponent(ex.id)}">${rich(ex.title)}</a></li>`).join("")}</ul>
      </section>`;
  }

  function neighborsHtml(topic) {
    const i = ordered.indexOf(topic);
    const prev = ordered[i - 1];
    const next = ordered[i + 1];
    const links = [
      prev && `<a href="${topicUrl(prev)}" rel="prev">הנושא הקודם – ${esc(prev.title)}</a>`,
      next && `<a href="${topicUrl(next)}" rel="next">הנושא הבא – ${esc(next.title)}</a>`,
    ].filter(Boolean);
    return `      <nav class="blog-related eg-neighbors" aria-label="נושאים סמוכים">
        <h2>ממשיכים ללמוד</h2>
        <ul>${links.map((link) => `<li>${link}</li>`).join("")}<li><a href="/english">כל הנושאים</a></li></ul>
      </nav>`;
  }

  function topicPage(topic) {
    const url = topicUrl(topic);
    const stage = stageOf.get(topic.id);
    const list = topicLessons(topic);
    const level = levels[topic.id] || 1;
    const topicPassages = passages.filter((ex) => ex.topic === topic);
    const summary = topicSummary(topic);
    const pictureWords = !list.length && !isPassageTopic(topic);
    const facts = [
      stage && `שלב ${stage.num} – ${esc(stage.title)}`,
      !isPassageTopic(topic) && `רמה ${LEVEL_NAMES[level]}`,
      list.length > 1 && `${list.length} שיעורים קצרים`,
      topicPassages.length && `${topicPassages.length} ${topic.id === "exams" ? "מבחנים" : "קטעי קריאה"}`,
    ].filter(Boolean);

    let title;
    let description;
    if (isPassageTopic(topic)) {
      title = `${topic.title} באנגלית – בארבע רמות, עם שאלות`;
      description = clip(summary);
    } else if (pictureWords) {
      title = `${topicTitle(topic)} – מילים עם תרגום ותרגול`;
      const words = topicWords(topic).slice(0, 6).map(([word, he]) => `${word} – ${he}`).join(", ");
      description = clip(`${topic.title} באנגלית עם תרגום לעברית: ${words} ועוד. שיעור עם תמונות ותרגול.`);
    } else {
      title = `${topicTitle(topic)} – הסבר, דוגמאות ותרגול`;
      description = clip(`${summary} הסבר בעברית פשוטה, דוגמאות עם תרגום, שאלות ותרגול.`);
    }

    const firstLesson = list[0]?.id || topic.lesson;
    const openLinks = [
      firstLesson && ["לפתיחת השיעור", `/services/english?lesson=${encodeURIComponent(firstLesson)}`],
      ["לתרגול באתר", `/services/english#${encodeURIComponent(topic.id)}`],
    ].filter(Boolean);

    const body = [
      `      <p class="blog-article-meta">${facts.join(" · ")}</p>`,
      ...topicSummaries(topic).map((line) => `      <p class="eg-lead">${rich(line)}</p>`),
      ...list.map((lesson, i) => lessonHtml(lesson, i + 1, list.length)),
      pictureWords ? vocabHtml(topic) : "",
      isPassageTopic(topic) ? passageListHtml(topicPassages, topic.id === "exams" ? "המבחנים" : "הקטעים") : passageListHtml(topicPassages, "קטעי קריאה בנושא"),
      exercisesHtml(topic),
      cta("רוצים לתרגל את הנושא עם משחקים ובדיקה מיידית?", openLinks),
      neighborsHtml(topic),
    ].filter(Boolean).join("\n\n");

    const ld = {
      "@context": "https://schema.org",
      "@type": "LearningResource",
      name: plain(title),
      description,
      url: `${SITE}${url}`,
      inLanguage: "he",
      learningResourceType: isPassageTopic(topic) ? "Reading" : "Lesson",
      educationalLevel: isPassageTopic(topic) ? undefined : LEVEL_NAMES[level],
      teaches: topic.titleEn,
      about: { "@type": "Thing", name: "English language" },
      dateModified: updated,
      provider: { "@type": "Organization", name: "Pleyi", url: `${SITE}/` },
      hasPart: list.map((lesson, i) => ({
        "@type": "LearningResource",
        name: list.length > 1 ? `שיעור ${i + 1} – ${plain(lesson.part || lesson.name)}` : plain(lesson.part || lesson.name),
        description: lesson.summary,
        url: `${SITE}${url}#${lesson.id}`,
      })),
    };

    return {
      url,
      html: page({
        url,
        title,
        description,
        h1: topicHeading(topic),
        kicker: isPassageTopic(topic) ? "קוראים באנגלית" : pictureWords ? "אוצר מילים" : "דקדוק באנגלית",
        body,
        ld: [ld],
        trail: [["בית", "/"], ["מדריך אנגלית", "/english"], [topic.title, url]],
      }),
    };
  }

  function questionHtml(q) {
    const he = q.he && q.he !== q.q ? ` <span class="eg-he">${esc(q.he)}</span>` : "";
    const text = `<p class="eg-q"><span dir="auto">${esc(unbracket(q.q))}</span>${he}</p>`;
    if (q.type === "mc" || q.type === "multi") {
      return `<li>${text}<ul class="eg-choices">${q.options.map((option) => `<li>${en(option)}</li>`).join("")}</ul></li>`;
    }
    if (q.type === "tf") return `<li>${text}<p class="eg-options">נכון או לא נכון</p></li>`;
    if (q.type === "sequence") {
      return `<li>${text}<ul class="eg-choices">${q.items.map((item) => `<li>${en(item)}</li>`).join("")}</ul></li>`;
    }
    return `<li>${text}</li>`;
  }

  function passagePage(ex) {
    const url = passageUrl(ex);
    const { passage, topic } = ex;
    const kind = passageKind(ex);
    const isExam = ex.type === "exam";
    const isLibrary = isPassageTopic(topic);
    const firstParagraph = unbracket(passage.text[0]);
    // Two topics can have a passage with the same name; the topic tells them apart.
    const title = `${kind} באנגלית ${passage.title} – רמה ${ex.level}${isLibrary ? "" : `, ${titleParts(topic)[0]}`}, עם שאלות`;
    const description = clip(`${kind} באנגלית ברמה ${ex.level} (${LEVEL_NAMES[ex.level]})${isLibrary ? "" : ` בנושא ${topic.title}`}${passage.titleHe ? ` – ${passage.titleHe}` : ""}. ${firstParagraph}`);
    const facts = [`רמה ${ex.level} – ${LEVEL_NAMES[ex.level]}`, isLibrary ? null : `נושא – <a href="${topicUrl(topic)}">${esc(topic.title)}</a>`, `${ex.questions.length} שאלות`].filter(Boolean);
    const related = passages.filter((other) => other.topic === topic && other !== ex).slice(0, 8);

    const body = [
      `      <p class="blog-article-meta">${facts.join(" · ")}</p>`,
      passage.titleHe ? `      <p class="eg-lead">${esc(passage.titleHe)}</p>` : "",
      `      <article class="blog-content eg-passage" dir="ltr" lang="en">
        ${passage.text.map((paragraph, i) => `<p>${isExam ? `<span class="eg-para-num">${i + 1}</span> ` : ""}${esc(unbracket(paragraph))}</p>`).join("\n        ")}
      </article>`,
      passage.glossary?.length ? `      <section class="blog-content eg-glossary">
        <h2>מילים חשובות</h2>
        ${wordsHtml(passage.glossary.map((g) => [g.en, g.he]))}
      </section>` : "",
      ex.mark?.text ? `      <section class="blog-content">
        <h2>משימת סימון</h2>
        <p>${esc(ex.mark.text)}</p>
        ${ex.mark.hint ? `<p>${en(ex.mark.hint)}</p>` : ""}
      </section>` : "",
      `      <section class="blog-content eg-questions">
        <h2>השאלות</h2>
        <ol>${ex.questions.map(questionHtml).join("")}</ol>
        <p>את התשובות בודקים באתר – כל תשובה מקבלת משוב מיד${isExam ? ", והציון מופיע בסוף המבחן" : ""}.</p>
      </section>`,
      cta(isExam ? "רוצים לעשות את המבחן עם שעון ולקבל ציון?" : "רוצים לענות על השאלות ולקבל משוב מיד?", [
        [isExam ? "למבחן באתר" : "לקטע באתר", `/services/english#${encodeURIComponent(topic.id)}/${encodeURIComponent(ex.id)}`],
        [isLibrary ? `כל ה${topic.title}` : `לנושא ${topic.title}`, topicUrl(topic)],
      ]),
      related.length ? `      <nav class="blog-related" aria-label="קטעים נוספים">
        <h2>עוד ${isExam ? "מבחנים" : "קטעים"}</h2>
        <ul>${related.map((other) => `<li><a href="${passageUrl(other)}">${en(other.passage.title)} <span class="eg-he">רמה ${other.level}</span></a></li>`).join("")}</ul>
      </nav>` : "",
    ].filter(Boolean).join("\n\n");

    const ld = {
      "@context": "https://schema.org",
      "@type": "LearningResource",
      name: `${passage.title}${passage.titleHe ? ` – ${passage.titleHe}` : ""}`,
      description,
      url: `${SITE}${url}`,
      inLanguage: ["en", "he"],
      learningResourceType: isExam ? "Assessment" : "Reading",
      educationalLevel: `רמה ${ex.level}`,
      about: { "@type": "Thing", name: "English reading comprehension" },
      dateModified: updated,
      provider: { "@type": "Organization", name: "Pleyi", url: `${SITE}/` },
    };

    const trail = [["בית", "/"], ["מדריך אנגלית", "/english"], [topic.title, topicUrl(topic)], [passage.title, url]];
    return {
      url,
      html: page({ url, title, description, h1: en(passage.title), kicker: `${kind} באנגלית`, body, ld: [ld], trail }),
    };
  }

  function hubPage() {
    const url = "/english";
    const lessonCount = lessons.size;
    const readingCount = passages.filter((ex) => ex.type === "reading").length;
    const examCount = passages.filter((ex) => ex.type === "exam").length;
    const learnTopics = ordered.filter((topic) => !isPassageTopic(topic));
    const title = "לומדים אנגלית – כל הנושאים לפי הסדר, מהאותיות ועד הבגרות";
    const description = clip(`מדריך אנגלית בעברית פשוטה: ${learnTopics.length} נושאים ב־${stages.length} שלבים, ${lessonCount} שיעורים קצרים, ${readingCount} קטעי קריאה ו־${examCount} מבחנים בהבנת הנקרא.`);

    const faq = [
      [
        "מה יש במדריך האנגלית של Pleyi?",
        `${learnTopics.length} נושאים – דקדוק ואוצר מילים – עם ${lessonCount} שיעורים קצרים, ${readingCount} קטעי קריאה בארבע רמות ו־${examCount} מבחנים בהבנת הנקרא. לכל נושא יש הסבר, דוגמאות עם תרגום, שאלות ותרגול באתר.`,
      ],
      [
        "באיזה סדר כדאי ללמוד אנגלית?",
        `לפי ${stages.length} שלבים: ${stages.map((stage, i) => `${i + 1}. ${stage.title}`).join(", ")}.`,
      ],
      [
        "באיזו שפה כתובים ההסברים?",
        "ההסברים בעברית פשוטה – רעיון אחד בכל פעם. הדוגמאות באנגלית, ולכל משפט יש תרגום.",
      ],
      [
        "איך מורה שולח תרגול לתלמידים?",
        "המורה פותח לכל תלמיד קישור אישי. התלמיד נכנס בלי הרשמה, והמורה רואה מה הוא תרגל.",
      ],
    ];

    const stageSections = stages.map((stage, i) => {
      const items = stage.topics.map((id) => topicById.get(id)).filter(Boolean);
      return `      <section class="blog-content eg-stage">
        <p class="eg-kicker"><span>שלב ${i + 1}</span></p>
        <h2>${esc(stage.title)} <span class="eg-h2-en">${en(stage.titleEn)}</span></h2>
        <ul class="eg-topic-list">${items.map((topic) => `<li><a href="${topicUrl(topic)}">${esc(topic.title)}</a>${isPassageTopic(topic) ? "" : ` <span class="eg-he">${en(topic.titleEn)}</span>`}<p>${rich(clip(topicSummary(topic), 140))}</p></li>`).join("")}</ul>
      </section>`;
    });

    const body = [
      `      <p class="eg-lead">כל נושאי האנגלית לילדים ולמתחילים, לפי הסדר שבו כדאי ללמוד אותם – מהאותיות הראשונות, דרך פועל להיות והזמנים, ועד קטעי קריאה ושאלות בסגנון בגרות.</p>`,
      `      <p class="eg-lead">לכל נושא יש הסבר בעברית פשוטה, דוגמאות עם תרגום, שאלות לבדיקה ותרגול באתר.</p>`,
      ...stageSections,
      `      <section class="blog-content eg-faq">
        <h2>שאלות נפוצות</h2>
        ${faq.map(([q, a]) => `<h3>${esc(q)}</h3>
        <p>${esc(a)}</p>`).join("\n        ")}
      </section>`,
      cta("רוצים ללמוד עם משחקים, חידונים ובדיקה מיידית?", [["ללמוד אנגלית באתר", "/services/english"], ["שיעורים מוכנים לכיתה", "/services/ready-lessons"]]),
    ].join("\n\n");

    const ld = [
      {
        "@context": "https://schema.org",
        "@type": "Course",
        name: "לומדים אנגלית – מהאותיות ועד הבגרות",
        description,
        url: `${SITE}${url}`,
        inLanguage: "he",
        provider: { "@type": "Organization", name: "Pleyi", url: `${SITE}/` },
        hasPart: ordered.map((topic) => ({ "@type": "LearningResource", name: topic.title, url: `${SITE}${topicUrl(topic)}` })),
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
      },
    ];

    return {
      url,
      html: page({ url, title, description, h1: "לומדים אנגלית – כל הנושאים", kicker: "מדריך אנגלית", body, ld, trail: [["בית", "/"], ["מדריך אנגלית", url]] }),
    };
  }

  const pages = new Map();
  [hubPage(), ...ordered.map(topicPage), ...passages.map(passagePage)].forEach((built) => pages.set(built.url, built.html));

  return { pages, updated, ordered, passages, topicUrl, passageUrl, topicSummary, isPassageTopic, stages, lessonCount: lessons.size };
}

/* ── Sitemap and llms.txt ── */

function sitemapXml(guide) {
  const entries = STATIC_PAGES.map(([url, file, changefreq, priority]) => ({
    url,
    lastmod: file ? fileDate(file) : guide.updated,
    changefreq,
    priority,
  }));
  guide.ordered.forEach((topic) => entries.push({ url: guide.topicUrl(topic), lastmod: guide.updated, changefreq: "monthly", priority: "0.8" }));
  guide.passages.forEach((ex) => entries.push({ url: guide.passageUrl(ex), lastmod: guide.updated, changefreq: "monthly", priority: "0.6" }));
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map((entry) => `  <url>
    <loc>${SITE}${entry.url}</loc>${entry.lastmod ? `
    <lastmod>${entry.lastmod}</lastmod>` : ""}
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join("\n")}
</urlset>
`;
}

// https://llmstxt.org — a short map of the site for AI assistants.
function llmsTxt(guide) {
  const link = (name, url, note) => `- [${name}](${SITE}${url})${note ? `: ${note}` : ""}`;
  const learnTopics = guide.ordered.filter((topic) => !guide.isPassageTopic(topic));
  return `# Pleyi

> Pleyi (pleyschool.com) is a Hebrew learning site for teachers, students and parents in Israel: ready-made classroom lessons, live classroom games that students join from their phones, printable worksheets, and a full English course for Hebrew speakers — from the first letters to reading comprehension and Bagrut-style questions. The site is in Hebrew; the English examples come with Hebrew translations.

Teachers open a classroom game room and students join from their phones. Teachers can also give each student a personal practice link — students do not need to sign up.

## English course (plain-text pages)

- [All English topics in learning order](${SITE}/english): ${learnTopics.length} topics in ${guide.stages.length} stages, ${guide.lessonCount} short lessons, reading passages and reading exams.
${guide.ordered.map((topic) => link(topic.title, guide.topicUrl(topic), `${topic.titleEn} — ${plain(clip(guide.topicSummary(topic), 140))}`)).join("\n")}

## Main pages

${link("Home", "/", "Learning through games for teachers")}
${link("Ready lessons", "/services/ready-lessons", "Ready-made classroom lessons with slides, a quiz and games")}
${link("Learn English (interactive)", "/services/english", "Interactive lessons, exercises, reading passages and exams")}
${link("Printable worksheets", "/services/worksheets")}
${link("Game builder", "/services/game-builder", "Turn lesson material into a classroom game")}
${link("Family practice", "/services/family", "English practice at home")}
${link("Lesson plans", "/lesson-plans")}

## Blog

${link("Blog", "/blog", "Articles for English teachers")}
${STATIC_PAGES.filter(([url]) => url.startsWith("/blog/")).map(([url, file]) => link(pageTitle(file) || url, url)).join("\n")}

## Optional

${link("Accessibility", "/legal/accessibility.html")}
${link("Privacy", "/legal/privacy.html")}
${link("Terms", "/legal/terms.html")}
`;
}

let built = null;
function guide() {
  if (!built) {
    const g = buildGuide();
    built = { ...g, sitemap: sitemapXml(g), llms: llmsTxt(g) };
  }
  return built;
}

/** Adds the guide's routes, the sitemap and llms.txt to an express app. */
function mount(app) {
  app.get(["/english", "/english/:topic", "/english/reading/:id"], (req, res, next) => {
    const html = guide().pages.get(req.path.replace(/\/$/, "") || "/english");
    if (!html) return next();
    res.type("html").send(html);
  });
  app.get("/sitemap.xml", (_req, res) => {
    res.type("application/xml").send(guide().sitemap);
  });
  app.get("/llms.txt", (_req, res) => {
    res.type("text/plain; charset=utf-8").send(guide().llms);
  });
}

module.exports = { mount, guide };
