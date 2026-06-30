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
const mobileEliminatedSlice =
  html.match(/Eliminated[\s\S]*?(?=Official tournament|No sweep teams|$)/i)?.[0] ??
  "";
const mobilePendingSlice =
  html.match(/Still in group stage[\s\S]*?(?=Eliminated|No sweep teams|$)/i)?.[0] ??
  "";
const awaitingSlice =
  html.match(/Awaiting qualification[\s\S]*?(?=Through to Round of 32|$)/i)?.[0] ??
  "";

const mobileThroughBadges = (mobileThroughSlice.match(/>Through</g) || []).length;
const mobilePendingBadges = (mobilePendingSlice.match(/>Pending</g) || []).length;
const awaitingPendingBadges = (awaitingSlice.match(/>Pending</g) || []).length;

const groupStageCount = (() => {
  const m = html.match(/Group Stage<\/h3>[\s\S]*?text-white\/40">(\d+)/);
  return m ? Number(m[1]) : -1;
})();

const r32StageCount = (() => {
  const m = html.match(/Round of 32<\/h3>[\s\S]*?text-white\/40">(\d+)/);
  return m ? Number(m[1]) : -1;
})();

const r16StageCount = (() => {
  const m = html.match(/Round of 16<\/h3>[\s\S]*?text-white\/40">(\d+)/);
  return m ? Number(m[1]) : -1;
})();

const bracketSlice =
  html.match(
    /World Cup Round of 32[\s\S]*?(?=mx-auto mt-10 flex max-w-2xl flex-col)/i,
  )?.[0] ?? "";
const bracketThroughOnly = bracketSlice.split(/Eliminated/i)[0] ?? bracketSlice;

const tournamentProgressPercent = (() => {
  const beforeKnockout = html.match(
    />(\d{1,3})%<\/p>[\s\S]{0,120}?Knockout calendar/i,
  );
  if (beforeKnockout) return Number(beforeKnockout[1]);
  return -1;
})();

const nonFamily = ["South Africa", "Canada", "Paraguay", "Japan", "Ivory Coast"];

const checks = [
  ["HTTP 200", res.status === 200],
  ["Tournament progress above 0%", tournamentProgressPercent > 0],
  ["Group stage complete copy", /Group stage complete/i.test(html)],
  ["Round of 32 active copy", /Round of 32 active/i.test(html)],
  [
    "Next match is France family fixture",
    /France[\s\S]{0,120}?Round of 32[\s\S]{0,80}?30 Jun/i.test(html),
  ],
  ["South Africa absent", !/South Africa/i.test(html)],
  ["Canada absent", !/Canada/i.test(html)],
  ["Paraguay absent", !/Paraguay/i.test(html)],
  ["Japan absent", !/Japan/i.test(html)],
  ["Ivory Coast absent", !/Ivory Coast/i.test(html)],
  ["Stage ladder Round of 32 = 12", r32StageCount === 12],
  ["Stage ladder Round of 16 = 3", r16StageCount === 3],
  ["Mobile through section = 10", mobileThroughBadges === 10],
  ["Round of 16 qualified: Brazil", /Round of 16 qualified[\s\S]*?Brazil/i.test(html)],
  ["Round of 16 qualified: Morocco", /Round of 16 qualified[\s\S]*?Morocco/i.test(html)],
  ["Round of 16 qualified: Norway", /Round of 16 qualified[\s\S]*?Norway/i.test(html)],
  ["Germany knocked out", /Knocked Out[\s\S]{0,3000}?Germany/i.test(html)],
  ["Netherlands knocked out", /Knocked Out[\s\S]{0,3000}?Netherlands/i.test(html)],
  ["Alive teams count = 13", /Alive Teams[\s\S]{0,120}?>\s*13\s*</i.test(html)],
  ["Eliminated teams count = 2", /Eliminated Teams[\s\S]{0,120}?>\s*2\s*</i.test(html)],
  ["France still alive in tracker", /Still Alive[\s\S]{0,4000}?France/i.test(html)],
  [
    "Norway vs Ivory Coast removed",
    !/Norway[\s\S]{0,800}?Ivory Coast/i.test(html) &&
      !/Ivory Coast[\s\S]{0,800}?Norway/i.test(html),
  ],
  [
    "Brazil vs Japan removed from R32 bracket",
    !/Brazil[\s\S]{0,1200}?Japan/i.test(mobileThroughSlice) &&
      !/Brazil[\s\S]{0,1200}?Japan/i.test(bracketThroughOnly),
  ],
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
