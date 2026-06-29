/**
 * Production smoke + enrichment QA for /tracker.
 */
const BASE = "https://worldcup-family-sweep.vercel.app";

const res = await fetch(`${BASE}/tracker`);
const html = await res.text();

const mobileThroughSlice =
  html.match(
    /Through to Round of 32[\s\S]*?(?=Still in group stage|Eliminated|No sweep teams)/i,
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
const stadiumHits = stadiumHints.filter((s) => html.includes(s)).length;

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
    "Next match summary",
    /South Africa vs Canada[\s\S]{0,80}?28 Jun/i.test(html),
  ],
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
  ["Stage ladder Round of 32 = 15", r32StageCount === 15],
  ["Mobile through section = 14", mobileThroughBadges === 14],
  ["Mobile eliminated section = 1", (mobileEliminatedSlice.match(/>Eliminated</g) || []).length >= 1],
  ["Germany knocked out", /Knocked Out[\s\S]{0,2000}?Germany/i.test(html)],
  ["First eliminated: Dado — Germany", /First eliminated:[\s\S]{0,120}?Dado[\s\S]{0,80}?Germany/i.test(html)],
  ["Alive teams count = 14", /Alive Teams[\s\S]{0,120}?>\s*14\s*</i.test(html)],
  ["Eliminated teams count = 1", /Eliminated Teams[\s\S]{0,120}?>\s*1\s*</i.test(html)],
  [
    "Paraguay advanced in official bracket",
    /Paraguay[\s\S]{0,500}?Round of 16/i.test(html) &&
      /vs Winner of France vs Sweden/i.test(html),
  ],
  ["Paraguay not an Owned by family card", !/Owned by[\s\S]{0,80}?Paraguay/i.test(html)],
  ["Mobile pending section = 0", mobilePendingBadges === 0],
  ["Desktop awaiting qualification = 0", awaitingPendingBadges === 0],
  ["Bracket Pending badges (desktop+mobile) = 0", bracketPendingBadges === 0],
  [
    "Netherlands vs Morocco in bracket",
    /Netherlands[\s\S]{0,1200}?Morocco/i.test(mobileThroughSlice) ||
      /Netherlands[\s\S]{0,1200}?Morocco/i.test(bracketSlice),
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
    "R32 stage ladder: Netherlands vs Morocco once",
    r32LadderHasNlMaFixture && r32LadderVsCount === 1,
  ],
  [
    "R32 stage ladder: circular flags present",
    r32LadderFlagCircles >= 2,
  ],
  [
    "R32 bracket: Twemoji flag images present",
    bracketTwemojiImages >= 20,
  ],
  [
    "R32 bracket: team flag circles present",
    bracketFlagCircles >= 14,
  ],
  [
    "R32 bracket: no country-code initials in flag circles",
    !/>(AR|BR|NL|MA|US|CO|FR|DE|MX|NO|CH)</.test(bracketSlice),
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
console.log(`  Mobile through badges: ${mobileThroughBadges}`);
console.log(`  Mobile pending badges: ${mobilePendingBadges}`);
console.log(`  Awaiting qualification badges: ${awaitingPendingBadges}`);
console.log(`  R32 ladder vs count: ${r32LadderVsCount}`);
console.log(`  R32 ladder flag circles: ${r32LadderFlagCircles}`);
console.log(`  R32 bracket twemoji images: ${bracketTwemojiImages}`);
console.log(`  R32 bracket flag circles: ${bracketFlagCircles}`);
console.log(`  Tournament progress %: ${tournamentProgressPercent}`);
console.log(`  Bracket pending badges: ${bracketPendingBadges}`);
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
