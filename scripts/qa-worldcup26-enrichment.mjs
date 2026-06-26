/**
 * QA: worldcup26 enrichment must not alter qualification or opponent kinds.
 * Run: npx tsx scripts/qa-worldcup26-enrichment.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env.local");

if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    process.env[t.slice(0, eq).trim()] ??= t.slice(eq + 1).trim();
  }
}

const { buildSweepBracketData } = await import(
  "../src/lib/round-of-32-bracket.ts"
);
const {
  checkWorldCup26Health,
  fetchWorldCup26Bundle,
  buildWorldCup26Enrichment,
  compareWorldCup26ToVerifiedSnapshot,
  clearWorldCup26Cache,
} = await import("../src/lib/providers/worldcup26-provider.ts");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing Supabase env");
  process.exit(1);
}

const supabase = createClient(url, key);

const { data: assignments } = await supabase
  .from("assignments")
  .select("participant_id, team_id");
const { data: participants } = await supabase.from("participants").select("id, name");
const { data: teams } = await supabase.from("teams").select("id, name, flag_emoji");
const { data: statuses } = await supabase
  .from("team_status")
  .select("team_name, status, stage, next_stage_probability");

const participantMap = new Map((participants ?? []).map((p) => [p.id, p]));
const teamMap = new Map((teams ?? []).map((t) => [t.id, t]));
const statusMap = new Map(
  (statuses ?? []).map((s) => [s.team_name.toLowerCase(), s]),
);

const rows = (assignments ?? []).map((a) => {
  const team = teamMap.get(a.team_id) ?? null;
  const found = statusMap.get(team?.name?.toLowerCase() ?? "");
  return {
    participant: participantMap.get(a.participant_id) ?? null,
    team,
    team_status: found
      ? {
          team_name: found.team_name,
          status: found.status,
          stage: found.stage,
          next_stage_probability: found.next_stage_probability,
        }
      : {
          team_name: team?.name ?? "",
          status: "active",
          stage: "Group Stage",
          next_stage_probability: null,
        },
  };
});

function snapshotEntries(data) {
  const all = [...data.through, ...data.pending, ...data.eliminated];
  return all.map((e) => ({
    team: e.row.team?.name,
    status: e.status,
    kind: e.r32Opponent?.kind ?? null,
    label: e.r32Opponent?.label ?? null,
    pendingLine: e.pendingLine ?? null,
  }));
}

const baseline = buildSweepBracketData(rows);
const baselineSnap = snapshotEntries(baseline);

clearWorldCup26Cache();
const health = await checkWorldCup26Health();
const bundle = await fetchWorldCup26Bundle();
const mismatches = bundle ? compareWorldCup26ToVerifiedSnapshot(bundle) : [];
const enrichment = bundle ? buildWorldCup26Enrichment(bundle) : null;
const enriched = buildSweepBracketData(rows, enrichment);
const enrichedSnap = snapshotEntries(enriched);

let failed = 0;

console.log("\n=== worldcup26 Enrichment QA ===\n");
console.log(`[${health.ok ? "PASS" : "FAIL"}] Provider health`);
if (!health.ok) {
  console.log("       ", health.error ?? "unhealthy");
  failed += 1;
}

console.log(`[${bundle ? "PASS" : "FAIL"}] Bundle fetch (fail-closed ok)`);
if (!bundle) failed += 1;

console.log(
  `[INFO] Snapshot mismatches logged (not applied): ${mismatches.length}`,
);
if (mismatches.length) {
  for (const m of mismatches.slice(0, 5)) {
    console.log(`       ${m.teamName} ${m.field}: verified=${m.verified} api=${m.api}`);
  }
}

const checks = [
  {
    name: "Through count unchanged",
    pass: baseline.through.length === enriched.through.length,
    detail: `${baseline.through.length} -> ${enriched.through.length}`,
  },
  {
    name: "Pending count unchanged",
    pass: baseline.pending.length === enriched.pending.length,
    detail: `${baseline.pending.length} -> ${enriched.pending.length}`,
  },
  {
    name: "Bracket status per team unchanged",
    pass: baselineSnap.every((b) => {
      const e = enrichedSnap.find((x) => x.team === b.team);
      return e && e.status === b.status;
    }),
    detail: "through/pending/eliminated",
  },
  {
    name: "Opponent kind per team unchanged",
    pass: baselineSnap.every((b) => {
      const e = enrichedSnap.find((x) => x.team === b.team);
      return e && e.kind === b.kind;
    }),
    detail: "confirmed/projected/tbc",
  },
  {
    name: "Confirmed team rows unchanged after enrichment",
    pass:
      enrichedSnap.filter((e) => e.kind === "confirmed").length ===
      baselineSnap.filter((e) => e.kind === "confirmed").length,
    detail: `confirmed team rows=${enrichedSnap.filter((e) => e.kind === "confirmed").length}`,
  },
];

for (const c of checks) {
  console.log(`[${c.pass ? "PASS" : "FAIL"}] ${c.name}`);
  console.log(`       ${c.detail}`);
  if (!c.pass) failed += 1;
}

const kindChanges = baselineSnap.filter((b) => {
  const e = enrichedSnap.find((x) => x.team === b.team);
  return e && e.kind !== b.kind;
});
if (kindChanges.length) {
  console.log("\nOpponent kind regressions:");
  for (const c of kindChanges) {
    const e = enrichedSnap.find((x) => x.team === c.team);
    console.log(`  ${c.team}: ${c.kind} -> ${e?.kind}`);
  }
}

if (enrichment) {
  const withDates = Object.values(enrichment).filter((e) => e.fixtureDate).length;
  const withStadiums = Object.values(enrichment).filter((e) => e.stadium).length;
  console.log(`\n[INFO] Enrichment applied: ${withDates} dates, ${withStadiums} stadiums`);
}

process.exit(failed > 0 ? 1 : 0);
