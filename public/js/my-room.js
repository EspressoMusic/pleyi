/* Personal room — 3 tiles + modal library */

(function () {
  const catalog = window.GAMES_CATALOG;
  const contentSection = document.getElementById("myRoomContent");
  const myRoomName = document.getElementById("myRoomName");
  const roomModal = document.getElementById("roomModal");
  const roomModalTitle = document.getElementById("roomModalTitle");
  const roomModalList = document.getElementById("roomModalList");

  const SECTIONS = {
    favorites: { title: "משחקים שאהבתי" },
    created: { title: "משחקים שיצרתי" },
    recent: { title: "שיחקתי לאחרונה" },
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
  let openSection = null;

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

  function updateHeader(user) {
    const name = user?.name || "משתמש";
    if (myRoomName) myRoomName.textContent = `שלום! ${name}`;
  }

  function emptyMessage(section) {
    const messages = {
      favorites: "אין עדיין מועדפים.",
      created: 'עדיין לא יצרת משחקים. <a href="/room?create=1">פתחו חדר חדש</a>',
      recent: "עדיין אין היסטוריה.",
    };
    return messages[section] || "";
  }

  function savedRowHtml(g, { showStar = true, showDelete = false } = {}) {
    return `
      <div class="room-list-row">
        <div class="room-list-info">
          <p class="room-list-title">${escapeHtml(g.title)}</p>
          <p class="room-list-meta">${escapeHtml(subjectLabel(g.subject))} · ${escapeHtml(gameName(g.gameId))}</p>
        </div>
        <div class="room-list-actions">
          ${
            showStar
              ? `<button type="button" class="room-list-star${g.starred ? " is-active" : ""}" data-star="${escapeHtml(g.id)}" aria-label="מועדפים">${g.starred ? "★" : "☆"}</button>`
              : ""
          }
          <button type="button" class="room-list-play" data-play="${escapeHtml(g.id)}">שחק</button>
          ${showDelete ? `<button type="button" class="room-list-delete" data-delete="${escapeHtml(g.id)}" aria-label="מחק">🗑</button>` : ""}
        </div>
      </div>`;
  }

  function recentRowHtml(e) {
    const meta = e.reason ? `ניקוד ${e.score} · ${escapeHtml(e.reason)}` : `ניקוד ${e.score ?? 0}`;
    return `
      <div class="room-list-row">
        <div class="room-list-info">
          <p class="room-list-title">${escapeHtml(e.gameTitle)}</p>
          <p class="room-list-meta">${meta}</p>
        </div>
        <div class="room-list-actions">
          <a href="/play/${escapeHtml(e.gameId)}" class="room-list-play">שחק</a>
        </div>
      </div>`;
  }

  function getSectionItems(section) {
    if (section === "favorites") return { type: "saved", items: savedGames.filter((g) => g.starred) };
    if (section === "created") return { type: "saved", items: savedGames };
    return { type: "recent", items: playHistory };
  }

  function renderModal(section) {
    const { type, items } = getSectionItems(section);
    roomModalTitle.textContent = SECTIONS[section]?.title || "";

    if (!items.length) {
      roomModalList.innerHTML = `<p class="room-list-empty">${emptyMessage(section)}</p>`;
      return;
    }

    if (type === "saved") {
      const showDelete = section === "created";
      roomModalList.innerHTML = items.map((g) => savedRowHtml(g, { showStar: true, showDelete })).join("");
    } else {
      roomModalList.innerHTML = items.map(recentRowHtml).join("");
    }

    bindModalActions();
  }

  function bindModalActions() {
    roomModalList.querySelectorAll("[data-play]").forEach((btn) => {
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

    roomModalList.querySelectorAll("[data-star]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const res = await UserData.toggleSavedGameStar(btn.dataset.star);
        if (!res.ok) {
          showToast(res.error || "לא ניתן לעדכן");
          return;
        }
        await loadData();
        if (openSection) renderModal(openSection);
      });
    });

    roomModalList.querySelectorAll("[data-delete]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm("למחוק את המשחק?")) return;
        await UserData.deleteSavedGame(btn.dataset.delete);
        await loadData();
        if (openSection) renderModal(openSection);
        showToast("נמחק");
      });
    });
  }

  function openModal(section) {
    openSection = section;
    renderModal(section);
    if (roomModal) roomModal.dataset.section = section;
    roomModal?.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => {
      roomModal?.classList.add("is-open");
    });
  }

  function closeModal() {
    openSection = null;
    roomModal?.classList.remove("is-open");
    document.body.style.overflow = "";
    setTimeout(() => {
      if (!roomModal?.classList.contains("is-open")) {
        roomModal?.classList.add("hidden");
        if (roomModal) delete roomModal.dataset.section;
      }
    }, 320);
  }

  document.querySelectorAll(".room-menu-row[data-section]").forEach((row) => {
    row.addEventListener("click", () => openModal(row.dataset.section));
  });

  document.getElementById("roomModalClose")?.addEventListener("click", closeModal);
  document.getElementById("roomModalBackdrop")?.addEventListener("click", closeModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && roomModal?.classList.contains("is-open")) {
      closeModal();
    }
  });

  async function loadData() {
    if (usePreviewData()) {
      savedGames = PREVIEW_SAVED;
      playHistory = PREVIEW_HISTORY;
      window.__myRoomPlayHistory = PREVIEW_HISTORY.map((e) => ({
        ...e,
        dateKey: UserData.dateKeyFromTimestamp(e.playedAt),
      }));
      window.MyRoomCalendar?.setHistory(window.__myRoomPlayHistory);
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
    } catch (err) {
      console.error(err);
      showToast("לא הצלחנו לטעון נתונים");
    }
  }

  function showRoom(user) {
    contentSection?.classList.remove("hidden");
    updateHeader(user);
    loadData();
  }

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
