/* Quick multiplayer smoke test — teacher + student sockets */
const { io } = require("socket.io-client");

const URL = process.env.TEST_URL || "http://localhost:3456";

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function connect() {
  return io(URL, { transports: ["websocket"], forceNew: true });
}

async function runGame(gameId, actionFn) {
  const teacher = connect();
  const student = connect();

  const code = await new Promise((resolve, reject) => {
    teacher.emit("room:create", { name: "Teacher" }, (res) => {
      if (!res?.ok) reject(new Error(res?.error || "create failed"));
      else resolve(res.code);
    });
  });

  const joinData = await new Promise((resolve, reject) => {
    student.emit("room:join", { code, name: "Student" }, (res) => {
      if (!res?.ok) reject(new Error(res?.error || "join failed"));
      else resolve(res);
    });
  });

  if (joinData.activeGame !== gameId && joinData.gameState) {
    console.warn(`  join carried gameState for ${joinData.activeGame}`);
  }

  await new Promise((resolve, reject) => {
    teacher.emit("game:start", { gameId }, (res) => {
      if (!res?.ok) reject(new Error(res?.error || "start failed"));
      else resolve();
    });
  });

  let teacherState = null;
  let studentState = null;

  teacher.on("game:state", (p) => {
    teacherState = p;
  });
  student.on("game:state", (p) => {
    studentState = p;
  });

  await wait(150);
  if (!teacherState?.state) throw new Error("teacher missing game state");
  if (!studentState?.state) throw new Error("student missing game state");

  await actionFn({ teacher, student, teacherState, studentState, code });

  teacher.close();
  student.close();
}

async function main() {
  console.log("Testing multiplayer at", URL);

  await runGame("spot-diff", async ({ teacher, student, teacherState }) => {
    const diff = teacherState.state.diffIndex;
    await new Promise((resolve) => {
      teacher.emit("game:action", { action: "pick", data: { index: diff } }, (res) => {
        if (!res?.ok || !res.correct) throw new Error("spot-diff teacher pick failed");
        resolve();
      });
    });
    await wait(200);
  });
  console.log("✓ spot-diff race");

  await runGame("vocabulary-duel", async ({ teacher, teacherState }) => {
    const correct = teacherState.state.question.correct;
    await new Promise((resolve) => {
      teacher.emit("game:action", { action: "answer", data: { answer: correct } }, (res) => {
        if (!res?.ok || !res.correct) throw new Error("vocab answer failed");
        resolve();
      });
    });
    await wait(200);
  });
  console.log("✓ vocabulary-duel race");

  await runGame("candy-match", async ({ teacher, teacherState }) => {
    const grid = teacherState.state.grid;
    const byPos = (r, c) => grid.find((t) => t.r === r && t.c === c);
    const a = byPos(0, 0);
    const b = byPos(0, 1);
    if (!a || !b) throw new Error("candy grid missing tiles");
    await new Promise((resolve) => {
      teacher.emit("game:action", { action: "select", data: { id: a.id } }, () => resolve());
    });
    await new Promise((resolve) => {
      teacher.emit("game:action", { action: "select", data: { id: b.id } }, (res) => {
        if (!res?.ok) throw new Error("candy swap failed");
        resolve();
      });
    });
    await wait(200);
  });
  console.log("✓ candy-match turn");

  console.log("\nAll multiplayer smoke tests passed.");
  process.exit(0);
}

main().catch((e) => {
  console.error("FAIL:", e.message);
  process.exit(1);
});
