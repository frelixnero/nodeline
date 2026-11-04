// scripts/next-dev.mjs
// Starts the Next.js dev server, first freeing the dev port so a stale
// `next dev` from a previous run can't wedge the process on startup.
import { spawn, execSync } from "node:child_process";

const PORT = process.env.NEXT_PORT ?? "3000";

function freePort() {
  if (process.platform !== "win32") return;

  let output = "";
  try {
    output = execSync("netstat -ano -p TCP", { encoding: "utf8" });
  } catch {
    return; // netstat unavailable; proceed without cleanup
  }

  const pids = new Set();
  for (const line of output.split(/\r?\n/)) {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 5 || parts[3] !== "LISTENING") continue;
    const local = parts[1];
    const port = local.slice(local.lastIndexOf(":") + 1);
    if (port === PORT) pids.add(parts[4]);
  }

  for (const pid of pids) {
    if (pid === String(process.pid)) continue;
    console.log(`[next-dev] Port ${PORT} is in use (PID ${pid}); killing stale server.`);
    try {
      execSync(`taskkill /PID ${pid} /T /F`, { stdio: "inherit" });
    } catch {
      // process may have exited between the netstat check and taskkill
    }
  }
}

freePort();

const isWin = process.platform === "win32";
const child = isWin
  ? spawn("cmd.exe", ["/d", "/s", "/c", "npm run dev"], { stdio: "inherit" })
  : spawn("npm", ["run", "dev"], { stdio: "inherit" });

child.on("error", (error) => {
  console.error(`[next-dev] Failed to launch dev server: ${error.message}`);
  process.exit(1);
});

child.on("exit", (code) => process.exit(code ?? 0));
