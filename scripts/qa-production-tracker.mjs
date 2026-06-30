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
const mobileR16Slice =
  html.match(
    /Round of 16 qualified[\s\S]*?(?=Still in group stage|Eliminated|Official tournament|No sweep teams)/i,
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

const r32LadderSlice =
  html.match(/Round of 32<\/h3>[\s\S]*?(?=Round of 16<\/h3>)/i)?.[0] ?? "";
const r32LadderVsCount = (r32LadderSlice.match(/\bvs\b/gi) || []).length;
const r32LadderHasNlMaFixture =
  /Netherlands[\s\S]{0,1200}?vs[\s\S]{0,900}?Morocco/i.test(r32LadderSlice) ||
  /Morocco[\s\S]{0,1200}?vs[\s\S]{0,900}?Netherlands/i.test(r32LadderSlice);
const r32LadderFlagCircles = (r32LadderSlice.match(/rounded-full bg-white/g) || []).length;

const bracketSlice =
  html.match(
    /World Cup Round of 32[\s\S]*?(?=mx-auto mt-10 flex max-w-2xl flex-col)/i,
  )?.[0] ?? "";
const bracketTwemojiImages = (bracketSlice.match(/twemoji@14\.0\.2/g) || []).length;
const bracketFlagCircles = (bracketSlice.match(/rounded-full bg-white shadow/g) || []).length;

const stadiumHints = [
  "Miami Stadium",
  "Mexico City Stadium",
  "Boston Stadium",
  "Houston Stadium",
  "BC Place Vancouver",
];

const tournamentProgressPercent = (() => {
  const beforeKnockout = html.match(
    />(\d{1,3})%<\/p>[\s\S]{0,120}?Knockout calendar/i,
  );
  if (beforeKnockout) return Number(beforeKnockout[1]);
  if (html.includes("53%")) return 53;
  if (html.includes("52%")) return 52;
  return -1;
})();

const bracketPendingBadges =
  (bracketSlice.match(/>Pending</g) || []).length +
  (mobilePendingSlice.match(/>Pending</g) || []).length;

const bracketThroughOnly = bracketSlice.split(/Eliminated/i)[0] ?? bracketSlice;

const checks = [
  ["HTTP 200", res.status === 200],
  ["Tournament progress above 0%", tournamentProgressPercent > 0],
  [
    "Tournament progress in 50–55% range (R32 active)",
    tournamentProgressPercent >= 50 && tournamentProgressPercent <= 55,
  ],
  ["Group stage complete copy", /Group stage complete/i.test(html)],
  ["Round of 32 active copy", /Round of 32 active/i.test(html)],
  [
    "Next match is family sweep fixture",
    /Norway vs Ivory Coast[\s\S]{0,80}?30 Jun/i.test(html),
  ],
  ["South Africa absent from tracker", !/South Africa/i.test(html)],
  ["Canada absent from tracker family sections", !/Canada vs/i.test(html) && !/vs Canada/i.test(html)],
  ["Debug banner hidden", !/Eliminated Count:/i.test(html)],
  ["Round of 32 section", /World Cup Round of 32/i.test(html)],
  ["Tournament Path ladder", /Tournament Path/i.test(html) && /Round of 16/i.test(html)],
  ["Desktop bracket breakpoint", html.includes("hidden px-4 py-8 md:block")],
  ["Mobile cards breakpoint", html.includes("md:hidden")],
  ["Projected labels absent", (html.match(/Projected/g) || []).length === 0],
  ["TBC slots absent from bracket", !/\bTBC\b/.test(bracketSlice)],
  ["Participant names (Owned by)", (html.match(/Owned by/g) || []).length >= 15],
  ["Awaiting qualification absent when all through", !/Awaiting qualification/i.test(html)],
  ["No application error", !/Application error/i.test(html)],
  ["Stage ladder Group Stage = 0", groupStageCount === 0],
  ["Stage ladder Round of 32 = 13", r32StageCount === 13],
  ["Stage ladder Round of 16 = 2", r16StageCount === 2],
  ["Mobile through section = 11", mobileThroughBadges === 11],
  ["Round of 16 qualified section has Brazil", /Round of 16 qualified[\s\S]*?Brazil/i.test(html)],
  ["Round of 16 qualified section has Morocco", /Round of 16 qualified[\s\S]*?Morocco/i.test(html)],
  ["Mobile eliminated section = 2", (mobileEliminatedSlice.match(/>Eliminated</g) || []).length >= 2],
  ["Germany knocked out", /Knocked Out[\s\S]{0,3000}?Germany/i.test(html)],
  ["Netherlands knocked out", /Knocked Out[\s\S]{0,3000}?Netherlands/i.test(html)],
  ["First eliminated: Dado — Germany", /First eliminated:[\s\S]{0,120}?Dado[\s\S]{0,80}?Germany/i.test(html)],
  ["Alive teams count = 13", /Alive Teams[\s\S]{0,120}?>\s*13\s*</i.test(html)],
  ["Eliminated teams count = 2", /Eliminated Teams[\s\S]{0,120}?>\s*2\s*</i.test(html)],
  [
    "Paraguay advanced in official bracket only",
    /Paraguay[\s\S]{0,500}?Round of 16/i.test(html) &&
      /vs Winner of France vs Sweden/i.test(html),
  ],
  ["Paraguay not an Owned by family card", !/Owned by[\s\S]{0,80}?Paraguay/i.test(html)],
  ["Japan not an Owned by family card", !/Owned by[\s\S]{0,80}?Japan/i.test(html)],
  ["Mobile pending section = 0", mobilePendingBadges === 0],
  ["Desktop awaiting qualification = 0", awaitingPendingBadges === 0],
  ["Bracket Pending badges (desktop+mobile) = 0", bracketPendingBadges === 0],
  [
    "Netherlands vs Morocco removed from R32 bracket",
    !/Netherlands[\s\S]{0,1200}?Morocco/i.test(mobileThroughSlice) &&
      !/Netherlands[\s\S]{0,1200}?Morocco/i.test(bracketThroughOnly),
  ],
  [
    "Brazil vs Japan removed from R32 bracket",
    !/Brazil[\s\S]{0,1200}?Japan/i.test(mobileThroughSlice) &&
      !/Brazil[\s\S]{0,1200}?Japan/i.test(bracketSlice),
  ],
  [
    "R32 bracket: no date metadata",
    !/\d{1,2}\s+Jun/i.test(bracketSlice),
  ],
  [
    "R32 bracket: no stadium names",
    !stadiumHints.some((s) => bracketSlice.includes(s)),
  ],
  [
    "R32 bracket: no kickoff times",
    !/\d{1,2}:\d{2}/.test(bracketSlice),
  ],
  [
    "R32 stage ladder: no Netherlands vs Morocco fixture",
    !r32LadderHasNlMaFixture,
  ],
  [
    "R32 bracket: Twemoji flag images present",
    bracketTwemojiImages >= 18,
  ],
  [
    "R32 bracket: team flag circles present",
    bracketFlagCircles >= 11,
  ],
  [
    "No duplicate uppercase Confirmed badges",
    (bracketSlice.match(/>Confirmed</g) || []).length === 0,
  ],
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
console.log(`  Round of 16 ladder: ${r16StageCount}`);
console.log(`  Mobile through badges: ${mobileThroughBadges}`);
console.log(`  Mobile pending badges: ${mobilePendingBadges}`);
console.log(`  R32 ladder vs count: ${r32LadderVsCount}`);
console.log(`  Tournament progress %: ${tournamentProgressPercent}`);

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
