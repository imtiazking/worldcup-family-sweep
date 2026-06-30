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

const { buildSweepBracketData, getTeamFlagFromEntries } = await import(
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
    id: 3.5,
    name: "Round of 16 qualified = Brazil, Morocco",
    pass:
      data.roundOf16Qualified.length === 2 &&
      data.roundOf16Qualified.some((e) => e.row.team?.name === "Brazil") &&
      data.roundOf16Qualified.some((e) => e.row.team?.name === "Morocco"),
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
    name: "Belgium, Spain, England through with confirmed R32 opponents",
    pass: (() => {
      const be = data.through.find((e) => e.row.team?.name === "Belgium");
      const es = data.through.find((e) => e.row.team?.name === "Spain");
      const en = data.through.find((e) => e.row.team?.name === "England");
      const pt = data.through.find((e) => e.row.team?.name === "Portugal");
      return (
        be?.status === "through" &&
        es?.status === "through" &&
        en?.status === "through" &&
        pt?.status === "through" &&
        be?.r32Opponent?.label === "Senegal" &&
        es?.r32Opponent?.label === "Austria" &&
        en?.r32Opponent?.label === "DR Congo" &&
        pt?.r32Opponent?.label === "Croatia"
      );
    })(),
    detail: `BE=${data.through.find((e) => e.row.team?.name === "Belgium")?.r32Opponent?.label} ES=${data.through.find((e) => e.row.team?.name === "Spain")?.r32Opponent?.label} EN=${data.through.find((e) => e.row.team?.name === "England")?.r32Opponent?.label} PT=${data.through.find((e) => e.row.team?.name === "Portugal")?.r32Opponent?.label}`,
  },
  {
    id: 6,
    name: "Confirmed fixtures = 11",
    pass: confirmedFixtures === 11,
    detail: `fixtures=${confirmedFixtures}`,
  },
  {
    id: 16,
    name: "Locked opponents exclude Japan, Paraguay, Morocco (completed R32)",
    pass: (() => {
      const labels = confirmed.map((e) => e.r32Opponent?.label);
      return (
        !labels.includes("Japan") &&
        !labels.includes("Paraguay") &&
        !labels.includes("Morocco") &&
        labels.includes("Sweden") &&
        labels.includes("Cape Verde") &&
        labels.includes("Bosnia and Herzegovina") &&
        labels.includes("Ivory Coast") &&
        labels.includes("Ghana") &&
        labels.includes("DR Congo") &&
        labels.includes("Croatia")
      );
    })(),
    detail: confirmed.map((e) => `${e.row.team?.name}:${e.r32Opponent?.label}`).join(", "),
  },
  {
    id: 7,
    name: "No TBC or projected slots remain",
    pass: tbc.length === 0 && projected.length === 0,
    detail: `tbc=${tbc.length} projected=${projected.length}`,
  },
  {
    id: 11,
    name: "NL-Morocco pairing removed from R32 through list",
    pass:
      !data.through.some((e) => e.row.team?.name === "Netherlands") &&
      !data.through.some((e) => e.row.team?.name === "Morocco") &&
      !data.through.some((e) => e.r32Opponent?.label === "Morocco") &&
      !data.through.some((e) => e.r32Opponent?.label === "Netherlands"),
    detail: `through=${data.through.map((e) => e.row.team?.name).join(", ")}`,
  },
  {
    id: 12,
    name: "Confirmed opponents visible on all locked rows",
    pass:
      confirmed.length === 11 &&
      confirmed.every((e) => Boolean(e.r32Opponent?.label)),
    detail: confirmed.map((e) => e.r32Opponent?.label).join(", "),
  },
  {
    id: 8,
    name: "All through rows have UK kickoff times",
    pass: confirmed.every((e) => Boolean(e.r32Opponent?.time)),
    detail: confirmed.map((e) => `${e.row.team?.name}:${e.r32Opponent?.time}`).join("; "),
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
    id: 15,
    name: "External opponent flags resolvable",
    pass: [
      "Japan",
      "Ivory Coast",
      "Sweden",
      "Bosnia and Herzegovina",
      "Cape Verde",
      "Ecuador",
      "Ghana",
      "Senegal",
      "Austria",
      "Croatia",
      "Algeria",
      "DR Congo",
    ].every((name) => Boolean(getTeamFlagFromEntries(data.through, name))),
    detail: "Japan, Ivory Coast, Sweden, Bosnia, Cape Verde, Ecuador, Ghana, Senegal, Austria, Croatia, Algeria, DR Congo",
  },
  {
    id: 17,
    name: "Paraguay external advancer present (not a sweep participant)",
    pass:
      data.externalAdvancers.length === 1 &&
      data.externalAdvancers[0]?.teamName === "Paraguay" &&
      data.externalAdvancers[0]?.nextFixture.includes("France vs Sweden"),
    detail: data.externalAdvancers.map((a) => `${a.teamName}:${a.nextFixture}`).join(", "),
  },
  {
    id: 18,
    name: "Germany eliminated with lost-to-Paraguay line",
    pass: data.eliminated
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
    id: 20,
    name: "Brazil not in R32 through (advanced to R16)",
    pass: !data.through.some((e) => e.row.team?.name === "Brazil"),
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
console.log("Pending teams:", data.pending.map((e) => e.row.team?.name).join(", "));
console.log("\nExpected sweep teams:", SWEEP_TEAM_NAMES.length);

process.exit(failed > 0 ? 1 : 0);
