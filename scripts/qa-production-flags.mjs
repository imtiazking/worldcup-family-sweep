/**
 * Extended production flag QA for /tracker after Twemoji deploy.
 */
const BASE = "https://worldcup-family-sweep.vercel.app";

const res = await fetch(`${BASE}/tracker`);
const html = await res.text();

const bracket =
  html.match(
    /World Cup Round of 32[\s\S]*?(?=mx-auto mt-10 flex max-w-2xl flex-col)/i,
  )?.[0] ?? "";
const ladder =
  html.match(/Round of 32<\/h3>[\s\S]*?(?=Round of 16<\/h3>)/i)?.[0] ?? "";
const mobileThrough =
  html.match(
    /Through to Round of 32[\s\S]*?(?=Still in group stage|Round of 16 qualified|Eliminated|No sweep teams)/i,
  )?.[0] ?? "";
const mobilePending =
  html.match(/Still in group stage[\s\S]*?(?=Eliminated|No sweep teams|$)/i)?.[0] ??
  "";

const twemojiBracket = (bracket.match(/twemoji@14\.0\.2/g) || []).length;
const twemojiAll = (html.match(/twemoji@14\.0\.2/g) || []).length;
const twemojiLadder = (ladder.match(/twemoji@14\.0\.2/g) || []).length;
const flagCirclesBracket = (bracket.match(/rounded-full bg-white shadow/g) || [])
  .length;
const flagCirclesAll = (html.match(/rounded-full bg-white shadow/g) || []).length;
const flagCirclesLadder = (ladder.match(/rounded-full bg-white shadow/g) || [])
  .length;
const initials =
  bracket.match(/>(AR|BR|NL|MA|US|CO|FR|DE|MX|NO|CH|BE|ES|PT)</g) || [];
const tbc = (bracket.match(/\bTBC\b/g) || []).length;
const questionMarks = (bracket.match(/>\?<\/span>/g) || []).length;

const nlTwemoji = html.includes("1f1f3-1f1f1");
const maTwemoji = html.includes("1f1f2-1f1e6");
const engTwemoji = html.includes("1f3f4-e0067-e0062-e0065-e006e-e0067-e007f");

const groupM = html.match(/Group Stage<\/h3>[\s\S]*?text-white\/40">(\d+)/);
const r32M = html.match(/Round of 32<\/h3>[\s\S]*?text-white\/40">(\d+)/);
const groupCount = groupM ? Number(groupM[1]) : -1;
const r32Count = r32M ? Number(r32M[1]) : -1;
const throughBadges = (mobileThrough.match(/>Through</g) || []).length;
const pendingBadges = (mobilePending.match(/>Pending</g) || []).length;

const scripts = [...html.matchAll(/src="(\/_next\/static\/[^"]+)"/g)].map(
  (m) => m[1],
);
let chunkFails = 0;
for (const src of scripts) {
  const r = await fetch(`${BASE}${src}`);
  if (!r.ok) {
    console.log(`[FAIL] chunk ${src} -> ${r.status}`);
    chunkFails += 1;
  }
}

// Twemoji URLs may ship in client JS for the bracket (use client)
let twemojiInChunks = 0;
for (const src of scripts) {
  const r = await fetch(`${BASE}${src}`);
  if (!r.ok) continue;
  const js = await r.text();
  if (js.includes("twemoji@14.0.2")) twemojiInChunks += 1;
}

const checks = [
  ["HTTP 200", res.status === 200],
  ["Twemoji in page HTML or JS bundles", twemojiAll >= 15 || twemojiInChunks > 0],
  ["Bracket section present", /World Cup Round of 32/i.test(html)],
  ["No country-code initials in bracket HTML", initials.length === 0],
  ["Ladder flag circles >= 2", flagCirclesLadder >= 2],
  ["NL twemoji resolvable on page", nlTwemoji],
  ["MA twemoji resolvable on page", maTwemoji],
  ["England twemoji on page", engTwemoji],
  ["TBC placeholders absent in bracket", tbc === 0],
  ["Bracket Twemoji images >= 28", twemojiBracket >= 28],
  ["Bracket flag circles >= 28", flagCirclesBracket >= 28],
  ["Group Stage count = 0", groupCount === 0],
  ["R32 ladder count = 12", r32Count === 12],
  ["Round of 16 ladder count = 3", (() => {
    const m = html.match(/Round of 16<\/h3>[\s\S]*?text-white\/40">(\d+)/);
    return m ? Number(m[1]) === 3 : false;
  })()],
  ["Through badges = 10", throughBadges === 10],
  ["Non-family teams absent from page", !/Paraguay|Ivory Coast|South Africa|Canada|Japan/i.test(html)],
  ["Pending badges = 0", pendingBadges === 0],
  [
    "R32 bracket: no dates or stadiums",
    !/\d{1,2}\s+Jun/i.test(bracket) &&
      !/\d{1,2}:\d{2}/.test(bracket) &&
      !/Monterrey|Boston|Houston|Miami Stadium/i.test(bracket),
  ],
  ["All JS chunks load", chunkFails === 0],
  ["No application error", !/Application error/i.test(html)],
];

let failed = 0;
console.log("\n=== Production Flag QA (/tracker) ===\n");
for (const [name, pass] of checks) {
  console.log(`[${pass ? "PASS" : "FAIL"}] ${name}`);
  if (!pass) failed += 1;
}

console.log("\nCounts:");
console.log(`  twemoji in bracket HTML: ${twemojiBracket}`);
console.log(`  twemoji in full HTML: ${twemojiAll}`);
console.log(`  twemoji in JS chunks: ${twemojiInChunks} chunk(s)`);
console.log(`  flag circles bracket: ${flagCirclesBracket}`);
console.log(`  flag circles all: ${flagCirclesAll}`);
console.log(`  flag circles ladder: ${flagCirclesLadder}`);
console.log(`  TBC: ${tbc}  ?: ${questionMarks}`);
console.log(`  Group/R32 ladder: ${groupCount}/${r32Count}`);
console.log(`  Through/Pending: ${throughBadges}/${pendingBadges}`);

process.exit(failed > 0 ? 1 : 0);
