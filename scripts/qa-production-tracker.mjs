/**
 * Production smoke + enrichment QA for /tracker.
 */
const BASE = "https://worldcup-family-sweep.vercel.app";

const res = await fetch(`${BASE}/tracker`);
const html = await res.text();

const mobileThroughSlice =
  html.match(/Through to Round of 32[\s\S]*?(?=Still in group stage)/i)?.[0] ?? "";
const mobilePendingSlice =
  html.match(/Still in group stage[\s\S]{0,12000}/i)?.[0] ?? "";
const awaitingSlice =
  html.match(/Awaiting qualification[\s\S]*?(?=Through to Round of 32)/i)?.[0] ?? "";

const mobileThroughBadges = (mobileThroughSlice.match(/>Through</g) || []).length;
const mobilePendingBadges = (mobilePendingSlice.match(/>Pending</g) || []).length;
const awaitingPendingBadges = (awaitingSlice.match(/>Pending</g) || []).length;
const totalPendingBadges = (html.match(/>Pending</g) || []).length;

const groupStageCount = (() => {
  const m = html.match(/Group Stage<\/h3>[\s\S]*?text-white\/40">(\d+)/);
  return m ? Number(m[1]) : -1;
})();

const r32StageCount = (() => {
  const m = html.match(/Round of 32<\/h3>[\s\S]*?text-white\/40">(\d+)/);
  return m ? Number(m[1]) : -1;
})();

const r32LadderSlice =
  html.match(/Round of 32<\/h3>[\s\S]*?(?=Round of 16<\/h3>)/i)?.[0] ?? "";
const r32LadderVsCount = (r32LadderSlice.match(/\bvs\b/gi) || []).length;
const r32LadderHasNlMaFixture =
  /Netherlands[\s\S]{0,400}?vs[\s\S]{0,400}?Morocco/i.test(r32LadderSlice) ||
  /Morocco[\s\S]{0,400}?vs[\s\S]{0,400}?Netherlands/i.test(r32LadderSlice);
const r32LadderFlagCircles = (r32LadderSlice.match(/rounded-full bg-white/g) || []).length;

const stadiumHints = [
  "Miami Stadium",
  "Mexico City Stadium",
  "Boston Stadium",
  "Houston Stadium",
  "BC Place Vancouver",
];
const stadiumHits = stadiumHints.filter((s) => html.includes(s)).length;

const checks = [
  ["HTTP 200", res.status === 200],
  ["Round of 32 section", /World Cup Round of 32/i.test(html)],
  ["Tournament Path ladder", /Tournament Path/i.test(html) && /Round of 16/i.test(html)],
  ["Desktop bracket breakpoint", html.includes("hidden px-4 py-8 md:block")],
  ["Mobile cards breakpoint", html.includes("md:hidden")],
  ["Projected labels present", (html.match(/Projected/g) || []).length >= 4],
  ["TBC slots present", (html.match(/\bTBC\b/g) || []).length >= 5],
  ["Participant names (Owned by)", (html.match(/Owned by/g) || []).length >= 15],
  ["Awaiting qualification section", /Awaiting qualification/i.test(html)],
  ["No application error", !/Application error/i.test(html)],
  ["Stage ladder Group Stage = 4", groupStageCount === 4],
  ["Stage ladder Round of 32 = 11", r32StageCount === 11],
  ["Mobile through section = 11", mobileThroughBadges === 11],
  ["Mobile pending section = 4", mobilePendingBadges === 4],
  ["Desktop awaiting qualification = 4", awaitingPendingBadges === 4],
  ["Bracket Pending badges (desktop+mobile) = 8", totalPendingBadges === 8],
  [
    "Netherlands primary: Confirmed fixture metadata visible",
    /Netherlands[\s\S]{0,1200}?Confirmed[\s\S]{0,120}?29 Jun/i.test(html),
  ],
  [
    "Morocco secondary: shows Netherlands without duplicate date",
    /Morocco[\s\S]{0,800}?Netherlands/i.test(html) &&
      !/Morocco[\s\S]{0,800}?Confirmed[\s\S]{0,120}?29 Jun/i.test(html),
  ],
  [
    "R32 stage ladder: Netherlands vs Morocco once",
    r32LadderHasNlMaFixture && r32LadderVsCount === 1,
  ],
  [
    "R32 stage ladder: circular flags present",
    r32LadderFlagCircles >= 2,
  ],
  [
    "No duplicate uppercase Confirmed badges",
    (html.match(/>Confirmed</g) || []).length === 0,
  ],
  ["Stadium metadata present", stadiumHits >= 2],
  ["Kickoff time metadata present", /\d{1,2}:\d{2}/.test(html)],
];

let failed = 0;
console.log("\n=== Production /tracker QA ===\n");
for (const [name, pass] of checks) {
  console.log(`[${pass ? "PASS" : "FAIL"}] ${name}`);
  if (!pass) failed += 1;
}

console.log("\nCounts:");
console.log(`  Group Stage ladder: ${groupStageCount}`);
console.log(`  Round of 32 ladder: ${r32StageCount}`);
console.log(`  Mobile through badges: ${mobileThroughBadges}`);
console.log(`  Mobile pending badges: ${mobilePendingBadges}`);
console.log(`  Awaiting qualification badges: ${awaitingPendingBadges}`);
console.log(`  R32 ladder vs count: ${r32LadderVsCount}`);
console.log(`  R32 ladder flag circles: ${r32LadderFlagCircles}`);
console.log(`  Stadium names matched: ${stadiumHits}/${stadiumHints.length}`);

const scripts = [...html.matchAll(/src="(\/_next\/static\/[^"]+)"/g)].map((m) => m[1]);
let chunkFails = 0;
for (const src of scripts) {
  const r = await fetch(`${BASE}${src}`);
  if (!r.ok) {
    console.log(`[FAIL] chunk ${src} -> ${r.status}`);
    chunkFails += 1;
  }
}
console.log(`\n[${chunkFails === 0 ? "PASS" : "FAIL"}] All ${scripts.length} JS chunks load`);

process.exit(failed + chunkFails > 0 ? 1 : 0);
