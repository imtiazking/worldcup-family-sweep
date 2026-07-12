/**
 * Manually verified World Cup 2026 knockout status for family sweep teams.
 * Source: Official quarter-final results (updated through 12 Jul 2026).
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
  "Official 2026 FIFA World Cup quarter-final results (through 12 Jul 2026)";

export const VERIFIED_SNAPSHOT_AS_OF = "2026-07-12T08:00:00Z";

export type ExternalBracketAdvancer = {
  teamName: string;
  flagEmoji: string;
  advancedTo: string;
  defeatedSweepTeam?: string;
  nextFixture: string;
};

export const VERIFIED_EXTERNAL_ADVANCERS: ExternalBracketAdvancer[] = [];

export type CompletedFamilyFixture = {
  homeTeam: string;
  awayTeam: string;
  scoreHome: number;
  scoreAway: number;
  stage: string;
  afterExtraTime?: boolean;
};

/** Confirmed family-sweep knockout results (most recent first). */
export const VERIFIED_COMPLETED_FAMILY_FIXTURES: CompletedFamilyFixture[] = [
  {
    homeTeam: "Argentina",
    awayTeam: "Switzerland",
    scoreHome: 3,
    scoreAway: 1,
    stage: "Quarter-finals",
    afterExtraTime: true,
  },
  {
    homeTeam: "Norway",
    awayTeam: "England",
    scoreHome: 1,
    scoreAway: 2,
    stage: "Quarter-finals",
    afterExtraTime: true,
  },
];

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
    status: "eliminated",
    stage: "Round of 16",
    nextStageProbability: 0,
    reason: "Eliminated in Round of 16 — lost to Belgium 4-1 (7 Jul).",
    nextFixture: null,
    r16OpponentLocked: "Belgium",
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
    stage: "Semi Final",
    nextStageProbability: 100,
    reason: "Advanced to Semi-finals — beat Morocco 2-0 (11 Jul).",
    nextFixture: "Semi-finals vs Spain (14 Jul 2026)",
  },
  {
    teamName: "Norway",
    status: "eliminated",
    stage: "Quarter Final",
    nextStageProbability: 0,
    reason: "Eliminated in Quarter-finals — lost to England 2-1 (AET, 11 Jul).",
    nextFixture: null,
    r16OpponentLocked: "Brazil",
  },
  {
    teamName: "Argentina",
    status: "active",
    stage: "Semi Final",
    nextStageProbability: 100,
    reason: "Advanced to Semi-finals — beat Switzerland 3-1 (AET, 11 Jul).",
    nextFixture: "Semi-finals vs England (15 Jul 2026)",
    r16OpponentLocked: "Egypt",
  },
  {
    teamName: "Switzerland",
    status: "eliminated",
    stage: "Quarter Final",
    nextStageProbability: 0,
    reason: "Eliminated in Quarter-finals — lost to Argentina 3-1 (AET, 11 Jul).",
    nextFixture: null,
    r16OpponentLocked: "Colombia",
  },
  {
    teamName: "Morocco",
    status: "eliminated",
    stage: "Quarter Final",
    nextStageProbability: 0,
    reason: "Eliminated in Quarter-finals — lost to France 2-0 (11 Jul).",
    nextFixture: null,
  },
  {
    teamName: "Colombia",
    status: "eliminated",
    stage: "Round of 16",
    nextStageProbability: 0,
    reason: "Eliminated in Round of 16 — lost to Switzerland (7 Jul).",
    nextFixture: null,
    r16OpponentLocked: "Switzerland",
  },
  {
    teamName: "Belgium",
    status: "eliminated",
    stage: "Quarter Final",
    nextStageProbability: 0,
    reason: "Eliminated in Quarter-finals — lost to Spain 2-1 (11 Jul).",
    nextFixture: null,
    r16OpponentLocked: "United States",
  },
  {
    teamName: "Spain",
    status: "active",
    stage: "Semi Final",
    nextStageProbability: 100,
    reason: "Advanced to Semi-finals — beat Belgium 2-1 (11 Jul).",
    nextFixture: "Semi-finals vs France (14 Jul 2026)",
    r16OpponentLocked: "Portugal",
  },
  {
    teamName: "Portugal",
    status: "eliminated",
    stage: "Round of 16",
    nextStageProbability: 0,
    reason: "Eliminated in Round of 16 — lost to Spain (6 Jul).",
    nextFixture: null,
    r16OpponentLocked: "Spain",
  },
  {
    teamName: "England",
    status: "active",
    stage: "Semi Final",
    nextStageProbability: 100,
    reason: "Advanced to Semi-finals — beat Norway 2-1 (AET, 11 Jul).",
    nextFixture: "Semi-finals vs Argentina (15 Jul 2026)",
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

/** Upcoming semi-final fixtures — remaining family sweep ties only */
export const VERIFIED_UPCOMING_FAMILY_FIXTURES: Array<{
  homeTeam: string;
  awayOpponent: string;
  dateUk: string;
  timeUk: string;
}> = [
  { homeTeam: "France", awayOpponent: "Spain", dateUk: "14 Jul", timeUk: "TBC" },
  {
    homeTeam: "England",
    awayOpponent: "Argentina",
    dateUk: "15 Jul",
    timeUk: "TBC",
  },
];

export function getNextFamilySweepFixtureLabel(): string {
  const next = VERIFIED_UPCOMING_FAMILY_FIXTURES[0];
  return `${next.homeTeam} vs ${next.awayOpponent} — Semi-finals · ${next.dateUk}, ${next.timeUk}`;
}

export function formatCompletedFixtureScore(
  fixture: CompletedFamilyFixture,
): string {
  const suffix = fixture.afterExtraTime ? " (AET)" : "";
  return `${fixture.homeTeam} ${fixture.scoreHome}–${fixture.scoreAway} ${fixture.awayTeam}${suffix}`;
}

export const VERIFIED_ELIMINATED_REFERENCE = [
  { teamName: "Jordan", reason: "Group J — lost 1–3 vs Argentina (28 Jun)" },
  { teamName: "Uzbekistan", reason: "Group K — lost 1–3 vs DR Congo (28 Jun)" },
] as const;
