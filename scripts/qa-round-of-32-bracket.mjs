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
const { flagEmojiToTwemojiSrc } = await import("../src/lib/team-flags.ts");
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
  ...data.roundOf16Qualified.map((e) => e.row.team?.name),
  ...data.pending.map((e) => e.row.team?.name),
  ...data.eliminated.map((e) => e.row.team?.name),
];
const unique = new Set(allNames.filter(Boolean));
const missingParticipants = rows.filter((r) => !r.participant?.name);

const allEntries = [
  ...data.through,
  ...data.roundOf16Qualified,
  ...data.pending,
  ...data.eliminated,
];
const missingFlags = allEntries.filter(
  (e) => !e.flagEmoji || e.flagEmoji === "⚽" || !e.row.team?.flag_emoji,
);
const twemojiResolvable = allEntries.filter((e) =>
  Boolean(flagEmojiToTwemojiSrc(e.flagEmoji)),
);

const nonFamilyNames = [
  "Paraguay",
  "Japan",
  "Ivory Coast",
  "South Africa",
  "Canada",
  "Sweden",
];
const serialized = JSON.stringify(data);
const nonFamilyVisible = nonFamilyNames.filter((name) =>
  serialized.includes(name),
);

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
    name: "Through count = 5",
    pass: data.through.length === 5,
    detail: `through=${data.through.length}`,
  },
  {
    id: 3.5,
    name: "Round of 16 qualified = 8 teams",
    pass:
      data.roundOf16Qualified.length === 8 &&
      [
        "Brazil",
        "Morocco",
        "Norway",
        "France",
        "Mexico",
        "England",
        "Belgium",
        "United States",
      ].every((name) =>
        data.roundOf16Qualified.some((e) => e.row.team?.name === name),
      ),
    detail: `r16=${data.roundOf16Qualified.map((e) => e.row.team?.name).join(", ")}`,
  },
  {
    id: 3.6,
    name: "Eliminated = Germany, Netherlands",
    pass:
      data.eliminated.length === 2 &&
      data.eliminated.some((e) => e.row.team?.name === "Germany") &&
      data.eliminated.some((e) => e.row.team?.name === "Netherlands"),
    detail: `eliminated=${data.eliminated.map((e) => e.row.team?.name).join(", ")}`,
  },
  {
    id: 4,
    name: "Pending count = 0",
    pass: data.pending.length === 0,
    detail: `pending=${data.pending.map((e) => e.row.team?.name).join(", ") || "none"}`,
  },
  {
    id: 5,
    name: "Pending R32 teams in through",
    pass: ["Spain", "Portugal", "Switzerland", "Argentina", "Colombia"].every(
      (name) => data.through.some((e) => e.row.team?.name === name),
    ),
    detail: data.through.map((e) => e.row.team?.name).join(", "),
  },
  {
    id: 6,
    name: "No non-family opponent labels on through rows",
    pass: data.through.every((e) => !e.r32Opponent?.label),
    detail: `opponents=${data.through.map((e) => e.r32Opponent?.label).join(",")}`,
  },
  {
    id: 7,
    name: "Non-family teams absent from bracket data",
    pass: nonFamilyVisible.length === 0,
    detail:
      nonFamilyVisible.length === 0
        ? "ok"
        : `found: ${nonFamilyVisible.join(", ")}`,
  },
  {
    id: 8,
    name: "External advancers hidden from family UI",
    pass: data.externalAdvancers.length === 0,
    detail: `external=${data.externalAdvancers.length}`,
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
    id: 13,
    name: "Every team node has flag emoji in bracket data",
    pass: missingFlags.length === 0 && allEntries.length === 15,
    detail:
      missingFlags.length === 0
        ? `entries=${allEntries.length}`
        : missingFlags.map((e) => e.row.team?.name).join(", "),
  },
  {
    id: 14,
    name: "All 15 flags resolve to Twemoji (no initials fallback)",
    pass: twemojiResolvable.length === 15,
    detail: `twemoji=${twemojiResolvable.length}/15`,
  },
  {
    id: 18,
    name: "Germany eliminated without Paraguay reference",
    pass: !data.eliminated
      .find((e) => e.row.team?.name === "Germany")
      ?.pendingLine?.includes("Paraguay"),
    detail:
      data.eliminated.find((e) => e.row.team?.name === "Germany")?.pendingLine ??
      "none",
  },
  {
    id: 19,
    name: "Netherlands eliminated with lost-to-Morocco line",
    pass: data.eliminated
      .find((e) => e.row.team?.name === "Netherlands")
      ?.pendingLine?.includes("Morocco"),
    detail:
      data.eliminated.find((e) => e.row.team?.name === "Netherlands")
        ?.pendingLine ?? "none",
  },
  {
    id: 21,
    name: "France not in R32 through (advanced to R16)",
    pass: !data.through.some((e) => e.row.team?.name === "France"),
    detail: data.roundOf16Qualified.map((e) => e.row.team?.name).join(", "),
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
console.log("R16 teams:", data.roundOf16Qualified.map((e) => e.row.team?.name).join(", "));

process.exit(failed > 0 ? 1 : 0);
