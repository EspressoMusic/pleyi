/* Idle runner — auto demo until teacher starts a game */

const RoomIdleRunner = (() => {
  let spawnTimer = null;
  let running = false;
  let root = null;
  let track = null;
  let player = null;

  function spawnObstacle() {
    if (!running || !track) return;
    const el = document.createElement("div");
    el.className = "room-idle-runner-obstacle";
    el.setAttribute("aria-hidden", "true");
    el.textContent = ["📚", "🎯", "⭐", "📖", "🔤"][Math.floor(Math.random() * 5)];
    track.appendChild(el);
    el.addEventListener("animationend", () => el.remove(), { once: true });

    if (player) {
      setTimeout(() => {
        if (!running || !player) return;
        player.classList.add("is-jumping");
        setTimeout(() => player.classList.remove("is-jumping"), 480);
      }, 1350);
    }
  }

  function start() {
    root = document.getElementById("roomIdleRunner");
    if (!root || running) return;
    track = root.querySelector(".room-idle-runner-track");
    player = root.querySelector(".room-idle-runner-player");
    if (!track || !player) return;

    running = true;
    root.classList.remove("hidden");
    spawnObstacle();
    spawnTimer = setInterval(spawnObstacle, 2800);
  }

  function stop() {
    running = false;
    clearInterval(spawnTimer);
    spawnTimer = null;
    if (track) track.innerHTML = "";
    player?.classList.remove("is-jumping");
    root = null;
    track = null;
    player = null;
  }

  return { start, stop };
})();
