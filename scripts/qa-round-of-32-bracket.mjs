/**
 * QA checks for Round of 32 bracket data.
 * Run: npx tsx scripts/qa-round-of-32-bracket.mjs
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
const { SWEEP_TEAM_NAMES } = await import(
  "../src/lib/world-cup-provider/team-name-map.ts"
);

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

const data = buildSweepBracketData(rows);
const allNames = [
  ...data.through.map((e) => e.row.team?.name),
  ...data.pending.map((e) => e.row.team?.name),
  ...data.eliminated.map((e) => e.row.team?.name),
];
const unique = new Set(allNames.filter(Boolean));
const confirmed = data.through.filter((e) => e.r32Opponent?.kind === "confirmed");
const projected = data.through.filter((e) => e.r32Opponent?.kind === "projected");
const tbc = data.through.filter((e) => e.r32Opponent?.kind === "tbc");
const missingParticipants = rows.filter((r) => !r.participant?.name);

function countConfirmedFixtures(entries) {
  const pairs = new Set();
  for (const e of entries) {
    if (e.r32Opponent?.kind !== "confirmed") continue;
    const team = e.row.team?.name;
    const opp = e.r32Opponent.label;
    if (!team || !opp) continue;
    pairs.add([team, opp].sort().join("|"));
  }
  return pairs.size;
}

const confirmedFixtures = countConfirmedFixtures(data.through);

const checks = [
  {
    id: 1,
    name: "Total sweep teams",
    pass: rows.length === 15,
    detail: `rows=${rows.length}`,
  },
  {
    id: 2,
    name: "Each team appears once in bracket data",
    pass: unique.size === allNames.filter(Boolean).length && unique.size === 15,
    detail: `unique=${unique.size} total=${allNames.filter(Boolean).length}`,
  },
  {
    id: 3,
    name: "Through count = 11",
    pass: data.through.length === 11,
    detail: `through=${data.through.length}`,
  },
  {
    id: 4,
    name: "Pending count = 4",
    pass: data.pending.length === 4,
    detail: `pending=${data.pending.length}`,
  },
  {
    id: 5,
    name: "Confirmed team rows = 2 (Netherlands, Morocco)",
    pass:
      confirmed.length === 2 &&
      confirmed.some((e) => e.row.team?.name === "Netherlands" && e.r32Opponent?.label === "Morocco") &&
      confirmed.some((e) => e.row.team?.name === "Morocco" && e.r32Opponent?.label === "Netherlands"),
    detail: confirmed.map((e) => `${e.row.team?.name}:${e.r32Opponent?.label}`).join(", ") || "none",
  },
  {
    id: 6,
    name: "Confirmed fixtures = 1 (Netherlands vs Morocco)",
    pass: confirmedFixtures === 1,
    detail: `fixtures=${confirmedFixtures}`,
  },
  {
    id: 7,
    name: "TBC slots present for unknown/3rd-place",
    pass: tbc.length >= 4,
    detail: `tbc=${tbc.length} (${tbc.map((e) => e.row.team?.name).join(", ")})`,
  },
  {
    id: 11,
    name: "Confirmed metadata on primary row only (Netherlands)",
    pass: (() => {
      const nl = data.through.find((e) => e.row.team?.name === "Netherlands");
      const ma = data.through.find((e) => e.row.team?.name === "Morocco");
      const primaryWithDate = data.through.filter(
        (e) =>
          e.confirmedFixtureRole === "primary" &&
          e.r32Opponent?.kind === "confirmed" &&
          e.r32Opponent.date,
      );
      return (
        nl?.confirmedFixtureRole === "primary" &&
        ma?.confirmedFixtureRole === "secondary" &&
        primaryWithDate.length >= 1 &&
        Boolean(nl?.r32Opponent?.date)
      );
    })(),
    detail: `primary=${data.through
      .filter((e) => e.confirmedFixtureRole === "primary")
      .map((e) => e.row.team?.name)
      .join(", ")}`,
  },
  {
    id: 12,
    name: "Confirmed opponents still visible on both team rows",
    pass:
      confirmed.length === 2 &&
      confirmed.every((e) => Boolean(e.r32Opponent?.label)),
    detail: confirmed.map((e) => e.r32Opponent?.label).join(", "),
  },
  {
    id: 8,
    name: "Projected labels present",
    pass: projected.length >= 3,
    detail: `projected=${projected.length} (${projected.map((e) => `${e.row.team?.name}:${e.r32Opponent?.label}`).join("; ")})`,
  },
  {
    id: 9,
    name: "All participants assigned",
    pass: missingParticipants.length === 0,
    detail:
      missingParticipants.length === 0
        ? "ok"
        : missingParticipants.map((r) => r.team?.name).join(", "),
  },
  {
    id: 10,
    name: "Pending lines use correct opponents",
    pass: data.pending.every((e) => {
      const line = e.pendingLine ?? "";
      const team = e.row.team?.name ?? "";
      return !line.includes(`plays ${team}`);
    }),
    detail: data.pending.map((e) => `${e.row.team?.name}: ${e.pendingLine}`).join(" | "),
  },
];

let failed = 0;
console.log("\n=== Round of 32 Bracket QA ===\n");
for (const c of checks) {
  const mark = c.pass ? "PASS" : "FAIL";
  if (!c.pass) failed += 1;
  console.log(`[${mark}] #${c.id} ${c.name}`);
  console.log(`       ${c.detail}\n`);
}

console.log("Through teams:", data.through.map((e) => e.row.team?.name).join(", "));
console.log("Pending teams:", data.pending.map((e) => e.row.team?.name).join(", "));
console.log("\nExpected sweep teams:", SWEEP_TEAM_NAMES.length);

process.exit(failed > 0 ? 1 : 0);
