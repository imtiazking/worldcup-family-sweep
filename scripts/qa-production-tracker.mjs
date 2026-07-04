/**
 * Production smoke + enrichment QA for /tracker.
 */
const BASE = "https://worldcup-family-sweep.vercel.app";

const res = await fetch(`${BASE}/tracker`);
const html = await res.text();

const mobileThroughSlice =
  html.match(
    /Through to Round of 32[\s\S]*?(?=Still in group stage|Round of 16 qualified|Eliminated|No sweep teams)/i,
  )?.[0] ?? "";
const r16QualifiedSlice =
  html.match(/Round of 16 qualified[\s\S]*?(?=Eliminated|Through to Round of 32|$)/i)?.[0] ??
  "";

const mobileThroughBadges = (mobileThroughSlice.match(/>Through</g) || []).length;

const r32StageCount = (() => {
  const m = html.match(/Round of 32<\/h3>[\s\S]*?text-white\/40">(\d+)/);
  return m ? Number(m[1]) : -1;
})();

const r16StageCount = (() => {
  const m = html.match(/Round of 16<\/h3>[\s\S]*?text-white\/40">(\d+)/);
  return m ? Number(m[1]) : -1;
})();

const tournamentProgressPercent = (() => {
  const beforeKnockout = html.match(
    />(\d{1,3})(?:<!-- -->)?%<\/p>[\s\S]{0,120}?Knockout calendar/i,
  );
  if (beforeKnockout) return Number(beforeKnockout[1]);
  return -1;
})();

const r16QualifiedTeams = [
  "Brazil",
  "Morocco",
  "Norway",
  "France",
  "Mexico",
  "England",
  "Belgium",
  "United States",
  "Spain",
  "Portugal",
  "Switzerland",
  "Argentina",
  "Colombia",
];

const r16Fixtures = [
  ["Morocco", "Canada"],
  ["France", "Paraguay"],
  ["Brazil", "Norway"],
  ["Mexico", "England"],
  ["Portugal", "Spain"],
  ["United States", "Belgium"],
  ["Argentina", "Egypt"],
  ["Switzerland", "Colombia"],
];

const bannedNonFamily = [
  "South Africa",
  "Japan",
  "Ivory Coast",
  "Paraguay",
  "Egypt",
  "Canada",
];

const checks = [
  ["HTTP 200", res.status === 200],
  ["Tournament progress above 50%", tournamentProgressPercent >= 60],
  ["Group stage complete copy", /Group stage complete/i.test(html)],
  ["Round of 16 active copy", /Round of 16 active/i.test(html)],
  [
    "Next match is Morocco vs Canada R16",
    /Morocco[\s\S]{0,80}?vs[\s\S]{0,80}?Canada[\s\S]{0,120}?Round of 16[\s\S]{0,80}?4 Jul/i.test(
      html,
    ),
  ],
  ["Stage ladder Round of 32 = 2", r32StageCount === 2],
  ["Stage ladder Round of 16 = 13", r16StageCount === 13],
  ["Mobile R32 through section = 0", mobileThroughBadges === 0],
  ...r16QualifiedTeams.map((team) => [
    `Round of 16 qualified: ${team}`,
    new RegExp(`Round of 16 qualified[\\s\\S]*?${team}`, "i").test(html),
  ]),
  ["Germany knocked out", /Knocked Out[\s\S]{0,3000}?Germany/i.test(html)],
  ["Netherlands knocked out", /Knocked Out[\s\S]{0,3000}?Netherlands/i.test(html)],
  ["Alive teams count = 13", /Alive Teams[\s\S]{0,120}?>\s*13\s*</i.test(html)],
  ["Eliminated teams count = 2", /Eliminated Teams[\s\S]{0,120}?>\s*2\s*</i.test(html)],
  ...r16Fixtures.map(([home, away]) => [
    `R16 fixture ${home} vs ${away}`,
    new RegExp(`${home}[\\s\\S]{0,120}?${away}|${away}[\\s\\S]{0,120}?${home}`, "i").test(
      html,
    ),
  ]),
  ...bannedNonFamily.map((name) => [
    `${name} not in R16 qualified team list`,
    !new RegExp(
      `Round of 16 qualified[\\s\\S]*?font-bebas[\\s\\S]{0,200}?${name}`,
      "i",
    ).test(r16QualifiedSlice),
  ]),
  ["No application error", !/Application error/i.test(html)],
];

let failed = 0;
console.log("\n=== Production /tracker QA ===\n");
for (const [name, pass] of checks) {
  console.log(`[${pass ? "PASS" : "FAIL"}] ${name}`);
  if (!pass) failed += 1;
}

console.log("\nCounts:");
console.log(`  Round of 32 ladder: ${r32StageCount}`);
console.log(`  Round of 16 ladder: ${r16StageCount}`);
console.log(`  Mobile through badges: ${mobileThroughBadges}`);
console.log(`  Tournament progress %: ${tournamentProgressPercent}`);

const scripts = [...html.matchAll(/src="(\/_next\/static\/[^"]+)"/g)].map((m) => m[1]);
let chunkFails = 0;
for (const src of scripts) {
  const r = await fetch(`${BASE}${src}`);
  if (!r.ok) chunkFails += 1;
}
console.log(`\n[${chunkFails === 0 ? "PASS" : "FAIL"}] All ${scripts.length} JS chunks load`);

process.exit(failed + chunkFails > 0 ? 1 : 0);
