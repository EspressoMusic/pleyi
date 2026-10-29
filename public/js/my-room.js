/* Personal room — 3 tiles + modal library */

(function () {
  const catalog = window.GAMES_CATALOG;
  const contentSection = document.getElementById("myRoomContent");

  const SECTION_CONTAINERS = {
    lessons: document.getElementById("roomListLessons"),
    favorites: document.getElementById("roomListFavorites"),
    created: document.getElementById("roomListCreated"),
    recent: document.getElementById("roomListRecent"),
  };

  const PREVIEW =
    location.hostname === "localhost" &&
    new URLSearchParams(location.search).get("preview") === "teacher";

  const GUEST_PREVIEW_USER = {
    uid: "guest-preview",
    name: "אורח (דוגמה)",
    email: "guest@preview.local",
    photoURL: null,
  };

  const PREVIEW_SAVED = [
    {
      id: "preview-1",
      title: "אוצר מילים — יחידה 3",
      subject: "english",
      gameId: "word-memory",
      items: Array(12),
      starred: true,
      updatedAt: Date.now() - 86400000,
    },
    {
      id: "preview-2",
      title: "חיבור וחיסור — כיתה ג׳",
      subject: "math",
      gameId: "math-blitz",
      items: Array(20),
      starred: true,
      createdAt: Date.now() - 3 * 86400000,
    },
    {
      id: "preview-3",
      title: "מילות שאלה באנגלית",
      subject: "english",
      gameId: "vocabulary-duel",
      items: Array(8),
      starred: false,
      updatedAt: Date.now() - 7 * 86400000,
    },
  ];

  const PREVIEW_HISTORY = [
    {
      gameTitle: "מגדל מילים",
      gameId: "tower-stack",
      score: 840,
      isCustom: false,
      playedAt: Date.now() - 3600000,
    },
    {
      gameTitle: "אוצר מילים — יחידה 3",
      gameId: "word-memory",
      score: 12,
      isCustom: true,
      reason: "12/12",
      playedAt: Date.now() - 2 * 86400000,
    },
    {
      gameTitle: "ברק מתמטי",
      gameId: "math-blitz",
      score: 7,
      isCustom: false,
      reason: "7/10",
      playedAt: Date.now() - 5 * 86400000,
    },
  ];

  let savedGames = [];
  let playHistory = [];
  let savedLessonIds = [];

  // Saved lessons are opened from the lessons library (?lesson= opens the slides).
  const LESSON_OPEN_PATH = "/services/ready-lessons";

  function lessonById(id) {
    const lessons = window.ReadyLessons;
    const lesson = lessons?.catalog?.[id];
    return lesson ? lessons.localize(lesson) : null;
  }

  function isGuestPreviewAllowed() {
    if (window.GameAuth?.isDevHost?.()) return true;
    const host = location.hostname;
    return (
      (host === "localhost" || host === "127.0.0.1") &&
      new URLSearchParams(location.search).get("guest") === "1"
    );
  }

  function usePreviewData() {
    return (
      PREVIEW ||
      window.GameAuth?.isDevPreviewUser?.() ||
      sessionStorage.getItem("pleyi-guest-preview") === "1"
    );
  }

  function showToast(msg) {
    const t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.remove("hidden");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => t.classList.add("hidden"), 2800);
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function subjectLabel(key) {
    return catalog?.subjects?.[key] || key;
  }

  function gameName(gameId) {
    const all = catalog?.allGamesList?.() || [...(catalog?.english || []), ...(catalog?.math || [])];
    return all.find((g) => g.id === gameId)?.title || gameId;
  }

  // Shown only when every list is empty.
  const EMPTY_ALL_HTML = `עדיין לא שמרת שיעורים.<br>לשמירה לוחצים על סימן השמירה בחלון המידע של השיעור.<br><a href="${LESSON_OPEN_PATH}">לספריית השיעורים</a>`;

  function savedRowHtml(g, { showStar = true, showDelete = false } = {}) {
    const playLabel = window.I18n?.t("myRoom.play") || "שחק";
    const favLabel = window.I18n?.t("myRoom.favAria") || "מועדפים";
    const deleteLabel = window.I18n?.t("myRoom.deleteAria") || "מחק";
    return `
      <div class="room-list-row">
        <div class="room-list-info">
          <p class="room-list-title">${escapeHtml(g.title)}</p>
          <p class="room-list-meta">${escapeHtml(subjectLabel(g.subject))} · ${escapeHtml(gameName(g.gameId))}</p>
        </div>
        <div class="room-list-actions">
          ${
            showStar
              ? `<button type="button" class="room-list-star${g.starred ? " is-active" : ""}" data-star="${escapeHtml(g.id)}" aria-label="${escapeHtml(favLabel)}">${g.starred ? "★" : "☆"}</button>`
              : ""
          }
          <button type="button" class="room-list-play" data-play="${escapeHtml(g.id)}">${escapeHtml(playLabel)}</button>
          ${showDelete ? `<button type="button" class="room-list-delete" data-delete="${escapeHtml(g.id)}" aria-label="${escapeHtml(deleteLabel)}">🗑</button>` : ""}
        </div>
      </div>`;
  }

  const REMOVE_ICON_SVG =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  function lessonRowHtml(id) {
    const lesson = lessonById(id);
    const title = lesson.namePart ? `${lesson.nameMain} – ${lesson.namePart}` : lesson.nameMain || lesson.name;
    const subject = window.ReadyLessons.subjectLabels?.[lesson.subject] || "";
    return `
      <div class="room-list-row">
        <div class="room-list-info">
          <p class="room-list-title">${escapeHtml(title)}</p>
          ${subject ? `<p class="room-list-meta">${escapeHtml(subject)}</p>` : ""}
        </div>
        <div class="room-list-actions">
          <a href="${LESSON_OPEN_PATH}?lesson=${encodeURIComponent(id)}" class="room-list-play">פתיחה</a>
          <button type="button" class="room-list-delete" data-unsave-lesson="${escapeHtml(id)}" aria-label="הסרה מהשמורים" title="הסרה מהשמורים">${REMOVE_ICON_SVG}</button>
        </div>
      </div>`;
  }

  function recentRowHtml(e) {
    const playLabel = window.I18n?.t("myRoom.play") || "שחק";
    const scoreLabel = window.I18n?.t("play.score") || "ניקוד";
    const meta = e.reason ? `${scoreLabel} ${e.score} · ${escapeHtml(e.reason)}` : `${scoreLabel} ${e.score ?? 0}`;
    return `
      <div class="room-list-row">
        <div class="room-list-info">
          <p class="room-list-title">${escapeHtml(e.gameTitle)}</p>
          <p class="room-list-meta">${meta}</p>
        </div>
        <div class="room-list-actions">
          <a href="/play/${escapeHtml(e.gameId)}" class="room-list-play">${escapeHtml(playLabel)}</a>
        </div>
      </div>`;
  }

  function getSectionItems(section) {
    if (section === "lessons") return { type: "lessons", items: savedLessonIds.filter(lessonById) };
    if (section === "favorites") return { type: "saved", items: savedGames.filter((g) => g.starred) };
    if (section === "created") return { type: "saved", items: savedGames };
    return { type: "recent", items: playHistory };
  }

  function renderSection(section) {
    const container = SECTION_CONTAINERS[section];
    if (!container) return false;
    const { type, items } = getSectionItems(section);

    // An empty list is hidden, heading and all.
    container.closest(".room-list-section")?.classList.toggle("hidden", !items.length);

    if (!items.length) {
      container.innerHTML = "";
      return false;
    }

    if (type === "lessons") {
      container.innerHTML = items.map(lessonRowHtml).join("");
    } else if (type === "saved") {
      const showDelete = section === "created";
      container.innerHTML = items.map((g) => savedRowHtml(g, { showStar: true, showDelete })).join("");
    } else {
      container.innerHTML = items.map(recentRowHtml).join("");
    }

    bindSectionActions(container, section);
    return true;
  }

  function renderAllSections() {
    const anyShown = Object.keys(SECTION_CONTAINERS).map(renderSection).some(Boolean);
    const emptyAll = document.getElementById("roomEmptyAll");
    if (emptyAll) {
      emptyAll.innerHTML = EMPTY_ALL_HTML;
      emptyAll.classList.toggle("hidden", anyShown);
    }
    document.getElementById("roomFootLink")?.classList.toggle("hidden", !savedGames.length && !playHistory.length);
  }

  function bindSectionActions(container) {
    container.querySelectorAll("[data-play]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const game = savedGames.find((x) => x.id === btn.dataset.play);
        if (!game) return;
        UserData.launchGame({
          subject: game.subject,
          gameId: game.gameId,
          items: game.items,
          title: game.title,
          savedGameId: game.id,
        });
      });
    });

    container.querySelectorAll("[data-star]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const res = await UserData.toggleSavedGameStar(btn.dataset.star);
        if (!res.ok) {
          showToast(res.error || window.I18n?.t("myRoom.updateError") || "לא ניתן לעדכן");
          return;
        }
        await loadData();
        renderAllSections();
      });
    });

    container.querySelectorAll("[data-unsave-lesson]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const res = await UserData.toggleFavoriteLesson(btn.dataset.unsaveLesson);
        if (!res.ok) {
          showToast(res.error || "לא ניתן לעדכן");
          return;
        }
        await loadData();
        showToast("השיעור הוסר מהשמורים");
      });
    });

    container.querySelectorAll("[data-delete]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm(window.I18n?.t("myRoom.confirmDelete") || "למחוק את המשחק?")) return;
        await UserData.deleteSavedGame(btn.dataset.delete);
        await loadData();
        renderAllSections();
        showToast(window.I18n?.t("myRoom.deleted") || "נמחק");
      });
    });
  }

  async function loadData() {
    if (usePreviewData()) {
      savedGames = PREVIEW_SAVED;
      playHistory = PREVIEW_HISTORY;
      savedLessonIds = Object.keys(window.ReadyLessons?.catalog || {}).slice(0, 2);
      window.__myRoomPlayHistory = PREVIEW_HISTORY.map((e) => ({
        ...e,
        dateKey: UserData.dateKeyFromTimestamp(e.playedAt),
      }));
      window.MyRoomCalendar?.setHistory(window.__myRoomPlayHistory);
      renderAllSections();
      return;
    }

    // Each list loads on its own, so one failed query (e.g. a missing index) doesn't blank the others.
    const names = ["savedGames", "playHistory", "favoriteLessons"];
    const results = await Promise.allSettled([
      UserData.getSavedGames(),
      UserData.getPlayHistory(120),
      UserData.getFavoriteLessons(),
    ]);
    results.forEach((r, i) => {
      if (r.status === "rejected") console.error(`my-room: ${names[i]} failed to load`, r.reason);
    });
    [savedGames, playHistory, savedLessonIds] = results.map((r) => (r.status === "fulfilled" ? r.value : []));

    window.__myRoomPlayHistory = playHistory.map((e) => ({
      ...e,
      dateKey: UserData.dateKeyFromTimestamp(e.playedAt),
    }));
    window.MyRoomCalendar?.setHistory(window.__myRoomPlayHistory);
    renderAllSections();

    if (results.every((r) => r.status === "rejected")) {
      showToast(window.I18n?.t("myRoom.loadError") || "לא הצלחנו לטעון נתונים");
    }
  }

  let currentUser = null;

  function showRoom(user) {
    currentUser = user;
    contentSection?.classList.remove("hidden");
    loadData();
  }

  window.addEventListener("gameclass:lang", () => {
    if (!currentUser) return;
    renderAllSections();
  });

  function redirectToLogin() {
    if (window.GameAuth?.openLoginModal) {
      window.GameAuth.openLoginModal("/my-room");
      return;
    }
    window.location.replace("/?login=1&next=%2Fmy-room");
  }

  function enterGuestPreview() {
    sessionStorage.setItem("pleyi-guest-preview", "1");
    if (window.GameAuth?.signInDevPreview) {
      window.GameAuth.signInDevPreview({ redirect: false });
    } else {
      updateGuestNav(GUEST_PREVIEW_USER);
    }
    showRoom(GUEST_PREVIEW_USER);
  }
  function updateGuestNav(user) {
    document.getElementById("authLoginBtn")?.classList.add("hidden");
    document.getElementById("authUserMenu")?.classList.remove("hidden");
    const userName = document.getElementById("authUserName");
    if (userName) userName.textContent = user.name;
    const userPhoto = document.getElementById("authUserPhoto");
    const userInitial = document.getElementById("authUserInitial");
    if (userPhoto && userInitial) {
      if (user.photoURL) {
        userPhoto.src = user.photoURL;
        userPhoto.classList.remove("hidden");
        userInitial.classList.add("hidden");
      } else {
        userPhoto.removeAttribute("src");
        userPhoto.classList.add("hidden");
        userInitial.textContent = (user.name || "?").charAt(0).toUpperCase();
        userInitial.classList.remove("hidden");
      }
    }
  }

  function clearGuestPreview() {
    sessionStorage.removeItem("pleyi-guest-preview");
  }

  function applyPreviewUser() {
    const previewUser = {
      uid: "preview",
      name: "מורה לדוגמה",
      photoURL: null,
      email: "teacher@preview.local",
    };
    window.GameAuth?.setDevPreviewUser?.(previewUser);
    updateGuestNav(previewUser);
    showRoom(previewUser);
  }

  document.getElementById("myRoomCreateBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    sessionStorage.setItem("pleyi-open-custom", "1");
    window.location.href = "/room?create=1";
  });

  window.GameAuth?.bindModals(showToast);

  const autoGuest =
    isGuestPreviewAllowed() &&
    (new URLSearchParams(location.search).get("guest") === "1" ||
      sessionStorage.getItem("pleyi-guest-preview") === "1" ||
      sessionStorage.getItem("pleyi-dev-preview") === "1");

  function handleAuthState(user) {
    if (PREVIEW) return;
    if (!window.GameAuth?._ready) return;
    if (user) {
      showRoom(user);
      return;
    }
    if (autoGuest) {
      enterGuestPreview();
      return;
    }
    if (window.GameAuth?.isDevHost?.()) {
      enterGuestPreview();
      return;
    }
    clearGuestPreview();
    redirectToLogin();
  }

  window.GameAuth?.onUserChange(handleAuthState);

  if (PREVIEW) applyPreviewUser();
  else if (window.GameAuth?.getUser()) showRoom(window.GameAuth.getUser());
})();
