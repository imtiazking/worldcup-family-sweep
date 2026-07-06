/**
 * Production smoke + enrichment QA for /tracker.
 */
const BASE = "https://worldcup-family-sweep.vercel.app";

const res = await fetch(`${BASE}/tracker`);
const html = await res.text();

const r16QualifiedSlice =
  html.match(/Round of 16 qualified[\s\S]*?(?=Eliminated|Quarter-final|Through to Round of 32|$)/i)?.[0] ??
  "";
const qfQualifiedSlice =
  html.match(/Quarter-final qualified[\s\S]*?(?=Round of 16 qualified|Eliminated|$)/i)?.[0] ??
  "";

const r32StageCount = (() => {
  const m = html.match(/Round of 32<\/h3>[\s\S]*?text-white\/40">(\d+)/);
  return m ? Number(m[1]) : -1;
})();

const r16StageCount = (() => {
  const m = html.match(/Round of 16<\/h3>[\s\S]*?text-white\/40">(\d+)/);
  return m ? Number(m[1]) : -1;
})();

const qfStageCount = (() => {
  const m = html.match(/Quarter Final<\/h3>[\s\S]*?text-white\/40">(\d+)/);
  return m ? Number(m[1]) : -1;
})();

const tournamentProgressPercent = (() => {
  const beforeKnockout = html.match(
    />(\d{1,3})(?:<!-- -->)?%<\/p>[\s\S]{0,120}?Knockout calendar/i,
  );
  if (beforeKnockout) return Number(beforeKnockout[1]);
  return -1;
})();

const qfTeams = ["France", "Norway", "England"];
const r16RemainingTeams = [
  "Morocco",
  "Portugal",
  "Spain",
  "Belgium",
  "United States",
  "Argentina",
  "Switzerland",
  "Colombia",
];
const eliminatedTeams = ["Germany", "Netherlands", "Brazil", "Mexico"];

const remainingR16Checks = [
  ["Portugal vs Spain", /Portugal vs Spain[\s\S]{0,80}?Round of 16/i.test(html)],
  ["United States vs Belgium", /vs Belgium[\s\S]{0,80}?Round of 16/i.test(html)],
  ["Argentina vs Egypt", /vs Egypt[\s\S]{0,80}?Round of 16/i.test(html)],
  ["Switzerland vs Colombia", /vs Colombia[\s\S]{0,80}?Round of 16/i.test(html)],
];

const completedR16Absent = [
  ["France vs Paraguay removed", !/France vs Paraguay/i.test(html)],
  ["Brazil vs Norway removed from next match", !/Brazil vs Norway[\s\S]{0,80}?Round of 16/i.test(html)],
  ["Mexico vs England removed from next match", !/Mexico vs England[\s\S]{0,80}?Round of 16/i.test(html)],
  ["Morocco vs Canada removed from next match", !/Morocco vs Canada[\s\S]{0,80}?Round of 16/i.test(html)],
];

const bannedNonFamily = ["South Africa", "Japan", "Ivory Coast", "Paraguay", "Egypt", "Canada"];

const checks = [
  ["HTTP 200", res.status === 200],
  ["Tournament progress above 60%", tournamentProgressPercent >= 60],
  ["Group stage complete copy", /Group stage complete/i.test(html)],
  ["Round of 16 active copy", /Round of 16 active/i.test(html)],
  [
    "Next match is Portugal vs Spain R16",
    /Portugal vs Spain[\s\S]{0,120}?Round of 16[\s\S]{0,80}?6 Jul/i.test(html),
  ],
  ["Stage ladder Round of 32 = 2", r32StageCount === 2],
  ["Stage ladder Round of 16 = 10", r16StageCount === 10],
  ["Stage ladder Quarter-finals = 3", qfStageCount === 3],
  ...qfTeams.map((team) => [
    `Quarter-final qualified: ${team}`,
    new RegExp(`Quarter-final qualified[\\s\\S]*?${team}`, "i").test(html),
  ]),
  ...r16RemainingTeams.map((team) => [
    `Round of 16 qualified: ${team}`,
    new RegExp(`Round of 16 qualified[\\s\\S]*?${team}`, "i").test(html),
  ]),
  ["Brazil not in QF qualified", !/font-semibold[^"]*">Brazil<\/p>/i.test(qfQualifiedSlice)],
  ["Mexico not in QF qualified", !/font-semibold[^"]*">Mexico<\/p>/i.test(qfQualifiedSlice)],
  ...eliminatedTeams.map((team) => [
    `${team} knocked out`,
    new RegExp(`Knocked Out[\\s\\S]{0,4000}?${team}`, "i").test(html),
  ]),
  ["Alive teams count = 11", /Alive Teams[\s\S]{0,120}?>\s*11\s*</i.test(html)],
  ["Eliminated teams count = 4", /Eliminated Teams[\s\S]{0,120}?>\s*4\s*</i.test(html)],
  ...remainingR16Checks,
  ...completedR16Absent,
  ...bannedNonFamily.map((name) => [
    `${name} not in QF qualified team list`,
    !new RegExp(
      `Quarter-final qualified[\\s\\S]*?font-bebas[\\s\\S]{0,200}?${name}`,
      "i",
    ).test(qfQualifiedSlice),
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
console.log(`  Quarter-finals ladder: ${qfStageCount}`);
console.log(`  Tournament progress %: ${tournamentProgressPercent}`);

const scripts = [...html.matchAll(/src="(\/_next\/static\/[^"]+)"/g)].map((m) => m[1]);
let chunkFails = 0;
for (const src of scripts) {
  const r = await fetch(`${BASE}${src}`);
  if (!r.ok) chunkFails += 1;
}
console.log(`\n[${chunkFails === 0 ? "PASS" : "FAIL"}] All ${scripts.length} JS chunks load`);

process.exit(failed + chunkFails > 0 ? 1 : 0);
