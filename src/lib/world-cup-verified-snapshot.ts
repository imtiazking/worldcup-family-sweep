/**
 * Manually verified World Cup 2026 group status for family sweep teams.
 * Source: FIFA standings via Wikipedia group pages (updated through 2 Jul 2026).
 * Only teams with FIFA "(A) Advance to a further round" or completed group
 * top-two / best-third placement are marked qualified.
 */

export type VerifiedTeamStatus = {
  teamName: string;
  status: "active" | "eliminated";
  stage: string;
  nextStageProbability: number | null;
  reason: string;
  nextFixture: string | null;
  /** Set only when the Round of 32 opponent is officially locked */
  r32OpponentLocked?: string | null;
  /** UK kickoff time for locked Round of 32 fixtures */
  r32KickoffUk?: string | null;
};

export const VERIFIED_SNAPSHOT_SOURCE =
  "Wikipedia 2026 FIFA World Cup group pages (FIFA standings, through 2 Jul 2026)";

export const VERIFIED_SNAPSHOT_AS_OF = "2026-07-02T12:00:00Z";

/** Non-sweep nations that advanced in the official knockout bracket (reference only — not shown in family UI) */
export type ExternalBracketAdvancer = {
  teamName: string;
  flagEmoji: string;
  advancedTo: string;
  defeatedSweepTeam?: string;
  nextFixture: string;
};

export const VERIFIED_EXTERNAL_ADVANCERS: ExternalBracketAdvancer[] = [];

export const VERIFIED_FAMILY_TEAM_STATUSES: VerifiedTeamStatus[] = [
  {
    teamName: "Mexico",
    status: "active",
    stage: "Round of 16",
    nextStageProbability: 100,
    reason: "Advanced to Round of 16 — Round of 32 complete (1 Jul).",
    nextFixture: null,
  },
  {
    teamName: "United States",
    status: "active",
    stage: "Round of 16",
    nextStageProbability: 100,
    reason: "Advanced to Round of 16 — Round of 32 complete (2 Jul).",
    nextFixture: null,
  },
  {
    teamName: "Germany",
    status: "eliminated",
    stage: "Round of 32",
    nextStageProbability: 0,
    reason:
      "Eliminated in Round of 32 (29 Jun). First family sweep knockout.",
    nextFixture: null,
  },
  {
    teamName: "Brazil",
    status: "active",
    stage: "Round of 16",
    nextStageProbability: 100,
    reason: "Advanced to Round of 16 — Round of 32 complete (29 Jun).",
    nextFixture: null,
  },
  {
    teamName: "France",
    status: "active",
    stage: "Round of 16",
    nextStageProbability: 100,
    reason: "Advanced to Round of 16 — Round of 32 complete (30 Jun).",
    nextFixture: null,
  },
  {
    teamName: "Norway",
    status: "active",
    stage: "Round of 16",
    nextStageProbability: 100,
    reason: "Advanced to Round of 16 — Round of 32 complete (30 Jun).",
    nextFixture: null,
  },
  {
    teamName: "Argentina",
    status: "active",
    stage: "Round of 32",
    nextStageProbability: 100,
    reason: "FIFA (A) — Group J winners. Round of 32 fixture pending.",
    nextFixture: "Round of 32 vs Cape Verde (3 Jul, 11pm UK)",
    r32OpponentLocked: "Cape Verde",
    r32KickoffUk: "11pm UK",
  },
  {
    teamName: "Switzerland",
    status: "active",
    stage: "Round of 32",
    nextStageProbability: 100,
    reason: "FIFA (A) — Group B winners. Round of 32 fixture pending.",
    nextFixture: "Round of 32 vs Algeria (3 Jul, 4am UK)",
    r32OpponentLocked: "Algeria",
    r32KickoffUk: "4am UK",
  },
  {
    teamName: "Morocco",
    status: "active",
    stage: "Round of 16",
    nextStageProbability: 100,
    reason: "Advanced to Round of 16 — Round of 32 complete (30 Jun).",
    nextFixture: null,
  },
  {
    teamName: "Colombia",
    status: "active",
    stage: "Round of 32",
    nextStageProbability: 100,
    reason: "FIFA (A) — Group K winners. Round of 32 fixture pending.",
    nextFixture: "Round of 32 vs Ghana (4 Jul, 2:30am UK)",
    r32OpponentLocked: "Ghana",
    r32KickoffUk: "2:30am UK",
  },
  {
    teamName: "Belgium",
    status: "active",
    stage: "Round of 16",
    nextStageProbability: 100,
    reason: "Advanced to Round of 16 — Round of 32 complete (1 Jul).",
    nextFixture: null,
  },
  {
    teamName: "Spain",
    status: "active",
    stage: "Round of 32",
    nextStageProbability: 100,
    reason: "FIFA (A) — Group H advanced. Round of 32 fixture pending.",
    nextFixture: "Round of 32 vs Austria (2 Jul, 8pm UK)",
    r32OpponentLocked: "Austria",
    r32KickoffUk: "8pm UK",
  },
  {
    teamName: "Portugal",
    status: "active",
    stage: "Round of 32",
    nextStageProbability: 100,
    reason: "FIFA (A) — Advanced from Group K. Round of 32 fixture pending.",
    nextFixture: "Round of 32 vs Croatia (3 Jul, midnight UK)",
    r32OpponentLocked: "Croatia",
    r32KickoffUk: "midnight UK",
  },
  {
    teamName: "England",
    status: "active",
    stage: "Round of 16",
    nextStageProbability: 100,
    reason: "Advanced to Round of 16 — Round of 32 complete (1 Jul).",
    nextFixture: null,
  },
  {
    teamName: "Netherlands",
    status: "eliminated",
    stage: "Round of 32",
    nextStageProbability: 0,
    reason: "Eliminated in Round of 32 (30 Jun).",
    nextFixture: null,
    r32OpponentLocked: "Morocco",
  },
];

/** Upcoming Round of 32 fixtures — pending family sweep teams only (no opponent names) */
export const VERIFIED_UPCOMING_FAMILY_FIXTURES: Array<{
  teamName: string;
  dateUk: string;
  timeUk: string;
}> = [
  { teamName: "Spain", dateUk: "2 Jul", timeUk: "8pm UK" },
  { teamName: "Switzerland", dateUk: "3 Jul", timeUk: "4am UK" },
  { teamName: "Portugal", dateUk: "3 Jul", timeUk: "midnight UK" },
  { teamName: "Argentina", dateUk: "3 Jul", timeUk: "11pm UK" },
  { teamName: "Colombia", dateUk: "4 Jul", timeUk: "2:30am UK" },
];

export function getNextFamilySweepFixtureLabel(): string {
  const next = VERIFIED_UPCOMING_FAMILY_FIXTURES[0];
  return `${next.teamName} — Round of 32 · ${next.dateUk}, ${next.timeUk}`;
}

/** Non-sweep nations eliminated on 28 Jun 2026 (reference only — not synced to team_status) */
export const VERIFIED_ELIMINATED_REFERENCE = [
  { teamName: "Jordan", reason: "Group J — lost 1–3 vs Argentina (28 Jun)" },
  { teamName: "Uzbekistan", reason: "Group K — lost 1–3 vs DR Congo (28 Jun)" },
] as const;
