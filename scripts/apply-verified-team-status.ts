/**
 * Apply verified World Cup 2026 team statuses to Supabase.
 * Run: npm run sync:team-status
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { runVerifiedTeamStatusSync } from "../src/lib/sync-verified-team-status";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env.local");

if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

async function main() {
  const result = await runVerifiedTeamStatusSync();

  for (const team of result.updatedTeams) {
    console.log(`✓ ${team}`);
  }

  console.log(`\n${result.message}`);
  console.log(
    JSON.stringify(
      {
        ok: result.ok,
        qualified: result.qualified,
        pending: result.pending,
        eliminated: result.eliminated,
        updatedTeams: result.updatedTeams,
        lastSyncAt: result.lastSyncAt,
      },
      null,
      2,
    ),
  );

  if (!result.ok) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
