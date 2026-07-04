/**
 * Manually verified World Cup 2026 group status for family sweep teams.
 * Source: FIFA standings via Wikipedia group pages (updated through 4 Jul 2026).
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
  /** Set only when the Round of 16 opponent is officially locked */
  r16OpponentLocked?: string | null;
  /** UK kickoff time for locked Round of 16 fixtures */
  r16KickoffUk?: string | null;
};

export const VERIFIED_SNAPSHOT_SOURCE =
  "Wikipedia 2026 FIFA World Cup group pages (FIFA standings, through 4 Jul 2026)";

export const VERIFIED_SNAPSHOT_AS_OF = "2026-07-04T12:00:00Z";

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
    nextFixture: "Round of 16 vs England (6 Jul, 1am UK)",
    r16OpponentLocked: "England",
    r16KickoffUk: "1am UK",
  },
  {
    teamName: "United States",
    status: "active",
    stage: "Round of 16",
    nextStageProbability: 100,
    reason: "Advanced to Round of 16 — Round of 32 complete (2 Jul).",
    nextFixture: "Round of 16 vs Belgium (7 Jul, 1am UK)",
    r16OpponentLocked: "Belgium",
    r16KickoffUk: "1am UK",
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
    nextFixture: "Round of 16 vs Norway (5 Jul, 9pm UK)",
    r16OpponentLocked: "Norway",
    r16KickoffUk: "9pm UK",
  },
  {
    teamName: "France",
    status: "active",
    stage: "Round of 16",
    nextStageProbability: 100,
    reason: "Advanced to Round of 16 — Round of 32 complete (30 Jun).",
    nextFixture: "Round of 16 vs Paraguay (4 Jul, 10pm UK)",
    r16OpponentLocked: "Paraguay",
    r16KickoffUk: "10pm UK",
  },
  {
    teamName: "Norway",
    status: "active",
    stage: "Round of 16",
    nextStageProbability: 100,
    reason: "Advanced to Round of 16 — Round of 32 complete (30 Jun).",
    nextFixture: "Round of 16 vs Brazil (5 Jul, 9pm UK)",
    r16OpponentLocked: "Brazil",
    r16KickoffUk: "9pm UK",
  },
  {
    teamName: "Argentina",
    status: "active",
    stage: "Round of 16",
    nextStageProbability: 100,
    reason: "Advanced to Round of 16 — Round of 32 complete (3 Jul).",
    nextFixture: "Round of 16 vs Egypt (7 Jul, 5pm UK)",
    r16OpponentLocked: "Egypt",
    r16KickoffUk: "5pm UK",
  },
  {
    teamName: "Switzerland",
    status: "active",
    stage: "Round of 16",
    nextStageProbability: 100,
    reason: "Advanced to Round of 16 — Round of 32 complete (3 Jul).",
    nextFixture: "Round of 16 vs Colombia (7 Jul, 9pm UK)",
    r16OpponentLocked: "Colombia",
    r16KickoffUk: "9pm UK",
  },
  {
    teamName: "Morocco",
    status: "active",
    stage: "Round of 16",
    nextStageProbability: 100,
    reason: "Advanced to Round of 16 — Round of 32 complete (30 Jun).",
    nextFixture: "Round of 16 vs Canada (4 Jul, 6pm UK)",
    r16OpponentLocked: "Canada",
    r16KickoffUk: "6pm UK",
  },
  {
    teamName: "Colombia",
    status: "active",
    stage: "Round of 16",
    nextStageProbability: 100,
    reason: "Advanced to Round of 16 — Round of 32 complete (4 Jul).",
    nextFixture: "Round of 16 vs Switzerland (7 Jul, 9pm UK)",
    r16OpponentLocked: "Switzerland",
    r16KickoffUk: "9pm UK",
  },
  {
    teamName: "Belgium",
    status: "active",
    stage: "Round of 16",
    nextStageProbability: 100,
    reason: "Advanced to Round of 16 — Round of 32 complete (1 Jul).",
    nextFixture: "Round of 16 vs United States (7 Jul, 1am UK)",
    r16OpponentLocked: "United States",
    r16KickoffUk: "1am UK",
  },
  {
    teamName: "Spain",
    status: "active",
    stage: "Round of 16",
    nextStageProbability: 100,
    reason: "Advanced to Round of 16 — Round of 32 complete (2 Jul).",
    nextFixture: "Round of 16 vs Portugal (6 Jul, 8pm UK)",
    r16OpponentLocked: "Portugal",
    r16KickoffUk: "8pm UK",
  },
  {
    teamName: "Portugal",
    status: "active",
    stage: "Round of 16",
    nextStageProbability: 100,
    reason: "Advanced to Round of 16 — Round of 32 complete (3 Jul).",
    nextFixture: "Round of 16 vs Spain (6 Jul, 8pm UK)",
    r16OpponentLocked: "Spain",
    r16KickoffUk: "8pm UK",
  },
  {
    teamName: "England",
    status: "active",
    stage: "Round of 16",
    nextStageProbability: 100,
    reason: "Advanced to Round of 16 — Round of 32 complete (1 Jul).",
    nextFixture: "Round of 16 vs Mexico (6 Jul, 1am UK)",
    r16OpponentLocked: "Mexico",
    r16KickoffUk: "1am UK",
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

/** Upcoming Round of 16 fixtures — family sweep teams with official opponents */
export const VERIFIED_UPCOMING_FAMILY_FIXTURES: Array<{
  homeTeam: string;
  awayOpponent: string;
  dateUk: string;
  timeUk: string;
}> = [
  { homeTeam: "Morocco", awayOpponent: "Canada", dateUk: "4 Jul", timeUk: "6pm UK" },
  { homeTeam: "France", awayOpponent: "Paraguay", dateUk: "4 Jul", timeUk: "10pm UK" },
  { homeTeam: "Brazil", awayOpponent: "Norway", dateUk: "5 Jul", timeUk: "9pm UK" },
  { homeTeam: "Mexico", awayOpponent: "England", dateUk: "6 Jul", timeUk: "1am UK" },
  { homeTeam: "Portugal", awayOpponent: "Spain", dateUk: "6 Jul", timeUk: "8pm UK" },
  { homeTeam: "United States", awayOpponent: "Belgium", dateUk: "7 Jul", timeUk: "1am UK" },
  { homeTeam: "Argentina", awayOpponent: "Egypt", dateUk: "7 Jul", timeUk: "5pm UK" },
  { homeTeam: "Switzerland", awayOpponent: "Colombia", dateUk: "7 Jul", timeUk: "9pm UK" },
];

export function getNextFamilySweepFixtureLabel(): string {
  const next = VERIFIED_UPCOMING_FAMILY_FIXTURES[0];
  return `${next.homeTeam} vs ${next.awayOpponent} — Round of 16 · ${next.dateUk}, ${next.timeUk}`;
}

/** Non-sweep nations eliminated on 28 Jun 2026 (reference only — not synced to team_status) */
export const VERIFIED_ELIMINATED_REFERENCE = [
  { teamName: "Jordan", reason: "Group J — lost 1–3 vs Argentina (28 Jun)" },
  { teamName: "Uzbekistan", reason: "Group K — lost 1–3 vs DR Congo (28 Jun)" },
] as const;
