/* Personal room — 3 tiles + modal library */

(function () {
  const catalog = window.GAMES_CATALOG;
  const contentSection = document.getElementById("myRoomContent");

  const SECTION_CONTAINERS = {
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

  function emptyMessage(section) {
    if (section === "created") {
      const text = window.I18n?.t("myRoom.empty.createdText") || "עדיין לא יצרת משחקים.";
      const link = window.I18n?.t("myRoom.empty.createdLink") || "פתחו חדר חדש";
      return `${text} <a href="/room?create=1">${link}</a>`;
    }
    const messages = {
      favorites: window.I18n?.t("myRoom.empty.favorites") || "אין עדיין מועדפים.",
      recent: window.I18n?.t("myRoom.empty.recent") || "עדיין אין היסטוריה.",
    };
    return messages[section] || "";
  }

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
    if (section === "favorites") return { type: "saved", items: savedGames.filter((g) => g.starred) };
    if (section === "created") return { type: "saved", items: savedGames };
    return { type: "recent", items: playHistory };
  }

  function renderSection(section) {
    const container = SECTION_CONTAINERS[section];
    if (!container) return;
    const { type, items } = getSectionItems(section);

    if (!items.length) {
      container.innerHTML = `<p class="room-list-empty">${emptyMessage(section)}</p>`;
      return;
    }

    if (type === "saved") {
      const showDelete = section === "created";
      container.innerHTML = items.map((g) => savedRowHtml(g, { showStar: true, showDelete })).join("");
    } else {
      container.innerHTML = items.map(recentRowHtml).join("");
    }

    bindSectionActions(container, section);
  }

  function renderAllSections() {
    Object.keys(SECTION_CONTAINERS).forEach(renderSection);
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
      window.__myRoomPlayHistory = PREVIEW_HISTORY.map((e) => ({
        ...e,
        dateKey: UserData.dateKeyFromTimestamp(e.playedAt),
      }));
      window.MyRoomCalendar?.setHistory(window.__myRoomPlayHistory);
      renderAllSections();
      return;
    }

    try {
      [savedGames, playHistory] = await Promise.all([
        UserData.getSavedGames(),
        UserData.getPlayHistory(120),
      ]);
      window.__myRoomPlayHistory = playHistory.map((e) => ({
        ...e,
        dateKey: UserData.dateKeyFromTimestamp(e.playedAt),
      }));
      window.MyRoomCalendar?.setHistory(window.__myRoomPlayHistory);
      renderAllSections();
    } catch (err) {
      console.error(err);
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
