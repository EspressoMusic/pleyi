/* Bootstrap /play/:gameId */

(function () {
  const path = window.location.pathname.replace(/\/+$/, "");
  const match = path.match(/^\/play\/([a-z-]+)$/);
  const gameId = match ? match[1] : null;

  const titleEl = document.getElementById("playTitle");
  const scoreEl = document.getElementById("playScore");
  const root = document.getElementById("playRoot");

  if (!gameId || !SoloGames.names[gameId]) {
    titleEl.textContent = "משחק לא נמצא";
    root.innerHTML = `<div class="play-error"><p>המשחק לא קיים.</p><p><a href="/">← חזרה לאתר</a></p></div>`;
    return;
  }

  titleEl.textContent = SoloGames.names[gameId];
  document.title = `${SoloGames.names[gameId]} — English Play`;

  const ui = {
    setScore(n) {
      scoreEl.textContent = String(n);
    },
    onGameOver(score, reason) {
      console.log("game over", gameId, score, reason);
    },
  };

  const cleanup = SoloGames.mount(gameId, root, ui);
  window.addEventListener("beforeunload", () => cleanup?.());
})();
