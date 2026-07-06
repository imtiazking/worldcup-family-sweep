/**
 * Manually verified World Cup 2026 group status for family sweep teams.
 * Source: FIFA standings via Wikipedia group pages (updated through 6 Jul 2026).
 */

export type VerifiedTeamStatus = {
  teamName: string;
  status: "active" | "eliminated";
  stage: string;
  nextStageProbability: number | null;
  reason: string;
  nextFixture: string | null;
  r32OpponentLocked?: string | null;
  r32KickoffUk?: string | null;
  r16OpponentLocked?: string | null;
  r16KickoffUk?: string | null;
};

export const VERIFIED_SNAPSHOT_SOURCE =
  "Wikipedia 2026 FIFA World Cup group pages (FIFA standings, through 6 Jul 2026)";

export const VERIFIED_SNAPSHOT_AS_OF = "2026-07-06T14:00:00Z";

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
    status: "eliminated",
    stage: "Round of 16",
    nextStageProbability: 0,
    reason: "Eliminated in Round of 16 — lost to England 3-2 (6 Jul).",
    nextFixture: null,
    r16OpponentLocked: "England",
  },
  {
    teamName: "United States",
    status: "active",
    stage: "Round of 16",
    nextStageProbability: 100,
    reason: "Round of 16 fixture pending.",
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
    status: "eliminated",
    stage: "Round of 16",
    nextStageProbability: 0,
    reason: "Eliminated in Round of 16 — lost to Norway 2-1 (5 Jul).",
    nextFixture: null,
    r16OpponentLocked: "Norway",
  },
  {
    teamName: "France",
    status: "active",
    stage: "Quarter Final",
    nextStageProbability: 100,
    reason: "Advanced to Quarter-finals — beat Paraguay 1-0 (4 Jul).",
    nextFixture: null,
  },
  {
    teamName: "Norway",
    status: "active",
    stage: "Quarter Final",
    nextStageProbability: 100,
    reason: "Advanced to Quarter-finals — beat Brazil 2-1 (5 Jul).",
    nextFixture: null,
  },
  {
    teamName: "Argentina",
    status: "active",
    stage: "Round of 16",
    nextStageProbability: 100,
    reason: "Round of 16 fixture pending.",
    nextFixture: "Round of 16 vs Egypt (7 Jul, 5pm UK)",
    r16OpponentLocked: "Egypt",
    r16KickoffUk: "5pm UK",
  },
  {
    teamName: "Switzerland",
    status: "active",
    stage: "Round of 16",
    nextStageProbability: 100,
    reason: "Round of 16 fixture pending.",
    nextFixture: "Round of 16 vs Colombia (7 Jul, 9pm UK)",
    r16OpponentLocked: "Colombia",
    r16KickoffUk: "9pm UK",
  },
  {
    teamName: "Morocco",
    status: "active",
    stage: "Round of 16",
    nextStageProbability: 100,
    reason: "Round of 16 — awaiting official next fixture.",
    nextFixture: null,
  },
  {
    teamName: "Colombia",
    status: "active",
    stage: "Round of 16",
    nextStageProbability: 100,
    reason: "Round of 16 fixture pending.",
    nextFixture: "Round of 16 vs Switzerland (7 Jul, 9pm UK)",
    r16OpponentLocked: "Switzerland",
    r16KickoffUk: "9pm UK",
  },
  {
    teamName: "Belgium",
    status: "active",
    stage: "Round of 16",
    nextStageProbability: 100,
    reason: "Round of 16 fixture pending.",
    nextFixture: "Round of 16 vs United States (7 Jul, 1am UK)",
    r16OpponentLocked: "United States",
    r16KickoffUk: "1am UK",
  },
  {
    teamName: "Spain",
    status: "active",
    stage: "Round of 16",
    nextStageProbability: 100,
    reason: "Round of 16 fixture pending.",
    nextFixture: "Round of 16 vs Portugal (6 Jul, 8pm UK)",
    r16OpponentLocked: "Portugal",
    r16KickoffUk: "8pm UK",
  },
  {
    teamName: "Portugal",
    status: "active",
    stage: "Round of 16",
    nextStageProbability: 100,
    reason: "Round of 16 fixture pending.",
    nextFixture: "Round of 16 vs Spain (6 Jul, 8pm UK)",
    r16OpponentLocked: "Spain",
    r16KickoffUk: "8pm UK",
  },
  {
    teamName: "England",
    status: "active",
    stage: "Quarter Final",
    nextStageProbability: 100,
    reason: "Advanced to Quarter-finals — beat Mexico 3-2 (6 Jul).",
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

/** Upcoming Round of 16 fixtures — remaining family sweep ties only */
export const VERIFIED_UPCOMING_FAMILY_FIXTURES: Array<{
  homeTeam: string;
  awayOpponent: string;
  dateUk: string;
  timeUk: string;
}> = [
  { homeTeam: "Portugal", awayOpponent: "Spain", dateUk: "6 Jul", timeUk: "8pm UK" },
  { homeTeam: "United States", awayOpponent: "Belgium", dateUk: "7 Jul", timeUk: "1am UK" },
  { homeTeam: "Argentina", awayOpponent: "Egypt", dateUk: "7 Jul", timeUk: "5pm UK" },
  { homeTeam: "Switzerland", awayOpponent: "Colombia", dateUk: "7 Jul", timeUk: "9pm UK" },
];

export function getNextFamilySweepFixtureLabel(): string {
  const next = VERIFIED_UPCOMING_FAMILY_FIXTURES[0];
  return `${next.homeTeam} vs ${next.awayOpponent} — Round of 16 · ${next.dateUk}, ${next.timeUk}`;
}

export const VERIFIED_ELIMINATED_REFERENCE = [
  { teamName: "Jordan", reason: "Group J — lost 1–3 vs Argentina (28 Jun)" },
  { teamName: "Uzbekistan", reason: "Group K — lost 1–3 vs DR Congo (28 Jun)" },
] as const;
