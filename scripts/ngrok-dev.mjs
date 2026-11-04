// scripts/ngrok-dev.mjs
// Starts an ngrok tunnel for local development using values from .env.
//
// Requires the ngrok CLI (e.g. `winget install Ngrok.Ngrok`). The script
// locates `ngrok` on PATH, or falls back to the standard winget install path.
import { spawn } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { delimiter, join } from "node:path";

process.loadEnvFile(new URL("../.env", import.meta.url));

const domain = process.env.NGROK_SERVER_URL;
const authToken = process.env.NGROK_AUTH_TOKEN;
const port = process.env.NGROK_PORT ?? "3000";

if (!domain) {
  console.error("NGROK_SERVER_URL is not set in .env");
  process.exit(1);
}

function findNgrok() {
  const exe = process.platform === "win32" ? "ngrok.exe" : "ngrok";

  for (const dir of (process.env.PATH ?? "").split(delimiter)) {
    if (dir && existsSync(join(dir, exe))) return join(dir, exe);
  }

  if (process.platform === "win32") {
    const localAppData = process.env.LOCALAPPDATA ?? "";
    const linksDir = join(localAppData, "Microsoft", "WinGet", "Links");
    if (existsSync(join(linksDir, exe))) return join(linksDir, exe);

    const packagesDir = join(localAppData, "Microsoft", "WinGet", "Packages");
    try {
      for (const name of readdirSync(packagesDir)) {
        if (name.toLowerCase().startsWith("ngrok")) {
          const candidate = join(packagesDir, name, exe);
          if (existsSync(candidate)) return candidate;
        }
      }
    } catch {
      // ignore
    }
  }

  return null;
}

const ngrok = findNgrok();
if (!ngrok) {
  console.error(
    "The `ngrok` executable was not found.\n" +
      "Install it with: winget install Ngrok.Ngrok\n" +
      "Then restart your terminal and try again.",
  );
  process.exit(1);
}

function run(args) {
  return new Promise((resolve) => {
    const child = spawn(ngrok, args, { stdio: "inherit" });
    child.on("error", (error) => {
      console.error(`Failed to launch ngrok: ${error.message}`);
      if (process.platform === "win32" && /access is denied/i.test(error.message)) {
        console.error(
          "Windows Defender may be blocking ngrok.exe as 'potentially unwanted software'.\n" +
            "Add an exclusion in Windows Security -> Virus & threat protection -> Manage settings -> Exclusions.",
        );
      }
      resolve(1);
    });
    child.on("exit", (code) => resolve(code ?? 0));
  });
}

if (authToken) {
  const code = await run(["config", "add-authtoken", authToken]);
  if (code !== 0) {
    console.error("Failed to configure the ngrok authtoken.");
    process.exit(code);
  }
}

process.exit(await run(["http", `--domain=${domain}`, port]));
