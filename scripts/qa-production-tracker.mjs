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

const stadiumHints = [
  "Miami Stadium",
  "Mexico City Stadium",
  "Boston Stadium",
  "Houston Stadium",
  "BC Place Vancouver",
];
const stadiumHits = stadiumHints.filter((s) => html.includes(s)).length;

const netherlandsPending =
  /Netherlands[\s\S]{0,400}?Pending/i.test(html) &&
  !/Netherlands[\s\S]{0,200}?Through/i.test(
    html.match(/Netherlands[\s\S]{0,400}/)?.[0] ?? "",
  );

const checks = [
  ["HTTP 200", res.status === 200],
  ["Round of 32 section", /World Cup Round of 32/i.test(html)],
  ["Tournament Path ladder", /Tournament Path/i.test(html) && /Round of 16/i.test(html)],
  ["Desktop bracket breakpoint", html.includes("hidden px-4 py-8 md:block")],
  ["Mobile cards breakpoint", html.includes("md:hidden")],
  ["No Confirmed opponent badges", !/>Confirmed</i.test(html)],
  ["Projected labels present", (html.match(/Projected/g) || []).length >= 4],
  ["TBC slots present", (html.match(/\bTBC\b/g) || []).length >= 5],
  ["Participant names (Owned by)", (html.match(/Owned by/g) || []).length >= 15],
  ["Awaiting qualification section", /Awaiting qualification/i.test(html)],
  ["No application error", !/Application error/i.test(html)],
  ["Stage ladder Group Stage = 5", groupStageCount === 5],
  ["Stage ladder Round of 32 = 10", r32StageCount === 10],
  ["Mobile through section = 10", mobileThroughBadges === 10],
  ["Mobile pending section = 5", mobilePendingBadges === 5],
  ["Desktop awaiting qualification = 5", awaitingPendingBadges === 5],
  ["Bracket Pending badges (desktop+mobile) = 10", totalPendingBadges === 10],
  ["Netherlands still Pending (mismatch not applied)", netherlandsPending],
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
console.log(`  Confirmed badges: ${(html.match(/>Confirmed</g) || []).length}`);
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
