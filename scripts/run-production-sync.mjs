import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvFile(path) {
  if (!existsSync(path)) return {};
  const env = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const env = {
  ...loadEnvFile(resolve(root, ".env.local")),
  ...loadEnvFile(resolve(root, ".env.vercel.sync")),
};

const cronSecret =
  process.env.CRON_SECRET?.trim() || env.CRON_SECRET?.trim();
if (!cronSecret) {
  console.error(
    "CRON_SECRET not found — use `vercel env run -e production -- node scripts/run-production-sync.mjs` or set in .env.local",
  );
  process.exit(1);
}

const url = `https://worldcup-family-sweep.vercel.app/api/sync-team-status?key=${encodeURIComponent(cronSecret)}`;

try {
  const response = await fetch(url, { cache: "no-store" });
  const body = await response.text();
  console.log(`HTTP_STATUS: ${response.status}`);
  console.log(body);
  process.exit(response.ok ? 0 : 1);
} catch (error) {
  console.error(
    "FETCH_ERROR:",
    error instanceof Error ? error.message : String(error),
  );
  process.exit(1);
}
