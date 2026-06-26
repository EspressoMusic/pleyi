/* Kill process listening on a port (Windows-safe — skips PID 0) */
const { execSync } = require("child_process");

const port = String(process.argv[2] || "3456");

function killWindows() {
  try {
    const out = execSync(`netstat -ano | findstr :${port}`, { encoding: "utf8" });
    const pids = new Set();
    for (const line of out.split(/\r?\n/)) {
      if (!line.includes("LISTENING")) continue;
      const parts = line.trim().split(/\s+/);
      const pid = parseInt(parts[parts.length - 1], 10);
      if (Number.isFinite(pid) && pid > 0) pids.add(pid);
    }
    if (!pids.size) {
      console.log(`Port ${port} is free.`);
      return;
    }
    for (const pid of pids) {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: "inherit" });
        console.log(`Stopped PID ${pid}`);
      } catch {
        console.warn(`Could not stop PID ${pid}`);
      }
    }
  } catch {
    console.log(`Port ${port} is free.`);
  }
}

function killUnix() {
  try {
    const out = execSync(`lsof -ti :${port}`, { encoding: "utf8" }).trim();
    if (!out) {
      console.log(`Port ${port} is free.`);
      return;
    }
    for (const pid of out.split(/\s+/)) {
      if (pid) {
        execSync(`kill -9 ${pid}`, { stdio: "inherit" });
        console.log(`Stopped PID ${pid}`);
      }
    }
  } catch {
    console.log(`Port ${port} is free.`);
  }
}

if (process.platform === "win32") killWindows();
else killUnix();
