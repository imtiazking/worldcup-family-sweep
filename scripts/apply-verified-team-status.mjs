/**
 * Apply verified World Cup 2026 team statuses to Supabase.
 * Run: node scripts/apply-verified-team-status.mjs
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnvFile() {
  const envPath = resolve(root, ".env.local");
  if (!existsSync(envPath)) return;
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

loadEnvFile();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const SOURCE =
  "Wikipedia 2026 FIFA World Cup group pages (FIFA standings, through 23 Jun 2026)";
const AS_OF = new Date().toISOString();

/** @type {import('../src/lib/world-cup-verified-snapshot.ts').VerifiedTeamStatus[]} */
const STATUSES = [
  {
    teamName: "Mexico",
    status: "active",
    stage: "Round of 32",
    nextStageProbability: 100,
    reason:
      "FIFA (A) — Group A winners after 2 wins (incl. 1–0 vs South Korea, 18 Jun).",
    nextFixture: "Round of 32 (opponent TBD)",
  },
  {
    teamName: "United States",
    status: "active",
    stage: "Round of 32",
    nextStageProbability: 100,
    reason:
      "FIFA (A) — Group D winners, 6 pts from 2 wins. Confirmed after Turkey eliminated 19 Jun.",
    nextFixture: "Round of 32 (opponent TBD)",
  },
  {
    teamName: "Germany",
    status: "active",
    stage: "Round of 32",
    nextStageProbability: 100,
    reason: "FIFA (A) — Group E leaders, 6 pts from 2 wins.",
    nextFixture: "Round of 32 (opponent TBD)",
  },
  {
    teamName: "Brazil",
    status: "active",
    stage: "Group Stage",
    nextStageProbability: null,
    reason: "Group C leaders, 4 pts. Not FIFA (A) — vs Scotland 24 Jun.",
    nextFixture: "24 Jun — Scotland vs Brazil",
  },
  {
    teamName: "France",
    status: "active",
    stage: "Round of 32",
    nextStageProbability: 100,
    reason: "FIFA (A) — Group I winners, 6 pts from 2 wins.",
    nextFixture: "Round of 32 (opponent TBD)",
  },
  {
    teamName: "Norway",
    status: "active",
    stage: "Round of 32",
    nextStageProbability: 100,
    reason: "FIFA (A) — Group I runners-up, 6 pts from 2 wins.",
    nextFixture: "Round of 32 vs Group E runner-up",
  },
  {
    teamName: "Argentina",
    status: "active",
    stage: "Round of 32",
    nextStageProbability: 100,
    reason: "FIFA (A) — Group J winners, 6 pts from 2 wins.",
    nextFixture: "Round of 32 vs Group H runner-up",
  },
  {
    teamName: "Switzerland",
    status: "active",
    stage: "Group Stage",
    nextStageProbability: null,
    reason: "Group B 2nd, 4 pts. Not FIFA (A) — final match vs Canada 24 Jun.",
    nextFixture: "24 Jun — Switzerland vs Canada",
  },
  {
    teamName: "Morocco",
    status: "active",
    stage: "Group Stage",
    nextStageProbability: null,
    reason: "Group C 2nd, 4 pts. Not FIFA (A) — vs Haiti 24 Jun.",
    nextFixture: "24 Jun — Morocco vs Haiti",
  },
  {
    teamName: "Belgium",
    status: "active",
    stage: "Group Stage",
    nextStageProbability: null,
    reason: "Group G 3rd, 2 pts (0W 2D). vs New Zealand 26 Jun.",
    nextFixture: "26 Jun — New Zealand vs Belgium",
  },
  {
    teamName: "Spain",
    status: "active",
    stage: "Group Stage",
    nextStageProbability: null,
    reason: "Group H leaders, 4 pts. Not FIFA (A) — vs Uruguay 26 Jun.",
    nextFixture: "26 Jun — Uruguay vs Spain",
  },
  {
    teamName: "Portugal",
    status: "active",
    stage: "Group Stage",
    nextStageProbability: null,
    reason: "Group K leaders, 4 pts. Not FIFA (A) — vs Colombia 27 Jun.",
    nextFixture: "27 Jun — Colombia vs Portugal",
  },
  {
    teamName: "Colombia",
    status: "active",
    stage: "Group Stage",
    nextStageProbability: null,
    reason: "Group K 2nd, 3 pts. vs DR Congo 23 Jun, then Portugal 27 Jun.",
    nextFixture: "23 Jun — Colombia vs DR Congo",
  },
  {
    teamName: "England",
    status: "active",
    stage: "Group Stage",
    nextStageProbability: null,
    reason: "Group L leaders, 4 pts. Not FIFA (A) — vs Panama 27 Jun.",
    nextFixture: "27 Jun — Panama vs England",
  },
  {
    teamName: "Netherlands",
    status: "active",
    stage: "Group Stage",
    nextStageProbability: null,
    reason: "Group F — group stage in progress; not FIFA (A) confirmed.",
    nextFixture: "Group F matchday 3 (FIFA schedule)",
  },
];

const supabase = createClient(url, serviceKey);

const { data: teams, error: teamsError } = await supabase
  .from("teams")
  .select("name")
  .order("name");

if (teamsError) {
  console.error("Failed to load teams:", teamsError.message);
  process.exit(1);
}

const allowed = new Set((teams ?? []).map((t) => t.name));
let updated = 0;
let skipped = 0;

for (const row of STATUSES) {
  if (!allowed.has(row.teamName)) {
    skipped += 1;
    continue;
  }

  const payload = {
    team_name: row.teamName,
    status: row.status,
    stage: row.stage,
    next_stage_probability: row.nextStageProbability,
  };

  const { error } = await supabase
    .from("team_status")
    .upsert(payload, { onConflict: "team_name" });

  if (error) {
    console.error(`Failed ${row.teamName}:`, error.message);
    skipped += 1;
  } else {
    updated += 1;
    console.log(`✓ ${row.teamName} → ${row.stage} (${row.status})`);
  }
}

const metaPayload = {
  key: "last_status_sync",
  value: JSON.stringify({ at: AS_OF, source: SOURCE }),
  updated_at: AS_OF,
};

const { error: metaError } = await supabase
  .from("tournament_meta")
  .upsert(metaPayload, { onConflict: "key" });

if (metaError) {
  console.warn(
    "team_status updated but tournament_meta failed (run migration 005):",
    metaError.message,
  );
} else {
  console.log(`\nMeta: last_status_sync @ ${AS_OF}`);
}

console.log(`\nDone: ${updated} updated, ${skipped} skipped.`);
