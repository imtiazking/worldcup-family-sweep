/**
 * Manually verified World Cup 2026 knockout status for family sweep teams.
 * Source: Official results — World Cup Final complete (19 Jul 2026, AET).
 */

export type VerifiedTeamStatus = {
  teamName: string;
  status: "active" | "eliminated" | "winner";
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
  "Official 2026 FIFA World Cup Final — verified full-time result (19 Jul 2026, AET)";

export const VERIFIED_SNAPSHOT_AS_OF = "2026-07-19T22:04:00Z";

export type FamilyFixtureGoalEvent = {
  minute: number;
  scorer: string;
  teamName: string;
};

export type FamilyFixtureMatchStatus =
  | "scheduled"
  | "live"
  | "extra_time"
  | "finished";

export type UpcomingFamilyFixture = {
  homeTeam: string;
  awayOpponent: string;
  dateUk: string;
  timeUk: string;
  venue?: string;
  matchStatus?: FamilyFixtureMatchStatus;
  scoreHome?: number;
  scoreAway?: number;
  scoreAfter90Home?: number;
  scoreAfter90Away?: number;
  matchNote?: string;
  matchEvents?: FamilyFixtureGoalEvent[];
};

export type FinalMatchLiveState = {
  status: "live" | "extra_time";
  scoreHome: number;
  scoreAway: number;
  scoreAfter90Home: number;
  scoreAfter90Away: number;
  matchNote: string | null;
  statusLabel: string;
  phaseSummary: string;
  matchEvents: FamilyFixtureGoalEvent[];
};

export function formatFamilyFixtureGoalEvent(
  event: FamilyFixtureGoalEvent,
): string {
  return `${event.minute}' — ${event.scorer} — ${event.teamName}`;
}

export function buildLivePhaseSummary(fixture: UpcomingFamilyFixture): string {
  const home = fixture.scoreHome ?? 0;
  const away = fixture.scoreAway ?? 0;

  if (home === away) {
    return "Extra time in progress";
  }

  const leader = home > away ? fixture.homeTeam : fixture.awayOpponent;
  return `${leader} lead ${home}–${away} in extra time`;
}

export function isFamilyFixtureLive(
  fixture: UpcomingFamilyFixture | null | undefined,
): boolean {
  return (
    fixture?.matchStatus === "live" || fixture?.matchStatus === "extra_time"
  );
}

export function buildFinalMatchLiveState(
  fixture: UpcomingFamilyFixture,
): FinalMatchLiveState | null {
  if (!isFamilyFixtureLive(fixture)) return null;

  const status = fixture.matchStatus === "extra_time" ? "extra_time" : "live";

  return {
    status,
    scoreHome: fixture.scoreHome ?? 0,
    scoreAway: fixture.scoreAway ?? 0,
    scoreAfter90Home: fixture.scoreAfter90Home ?? fixture.scoreHome ?? 0,
    scoreAfter90Away: fixture.scoreAfter90Away ?? fixture.scoreAway ?? 0,
    matchNote: fixture.matchNote ?? null,
    statusLabel: status === "extra_time" ? "LIVE — EXTRA TIME" : "LIVE",
    phaseSummary: buildLivePhaseSummary(fixture),
    matchEvents: fixture.matchEvents ?? [],
  };
}

export function formatFinalLiveScore(fixture: UpcomingFamilyFixture): string {
  return `${fixture.homeTeam} ${fixture.scoreHome ?? 0}–${fixture.scoreAway ?? 0} ${fixture.awayOpponent}`;
}

export type VerifiedFinalResult = {
  homeTeam: string;
  awayTeam: string;
  scoreHome: number;
  scoreAway: number;
  afterExtraTime: true;
  dateUk: string;
  timeUk: string;
  venue: string;
  statusLabel: string;
  winnerTeam: string;
  loserTeam: string;
  winnerParticipant: string;
  loserParticipant: string;
  winningGoal: FamilyFixtureGoalEvent;
};

export const VERIFIED_FINAL_RESULT: VerifiedFinalResult = {
  homeTeam: "Spain",
  awayTeam: "Argentina",
  scoreHome: 1,
  scoreAway: 0,
  afterExtraTime: true,
  dateUk: "19 Jul",
  timeUk: "20:00",
  venue: "New York/New Jersey Stadium, East Rutherford",
  statusLabel: "Full time after extra time",
  winnerTeam: "Spain",
  loserTeam: "Argentina",
  winnerParticipant: "Zavier",
  loserParticipant: "Imi",
  winningGoal: { minute: 106, scorer: "Ferran Torres", teamName: "Spain" },
};

export function isTournamentComplete(): boolean {
  return VERIFIED_FINAL_RESULT !== null;
}

export function getVerifiedFinalResult(): VerifiedFinalResult | null {
  return VERIFIED_FINAL_RESULT;
}

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
    homeTeam: "Spain",
    awayTeam: "Argentina",
    scoreHome: 1,
    scoreAway: 0,
    stage: "Final",
    afterExtraTime: true,
  },
  {
    homeTeam: "England",
    awayTeam: "Argentina",
    scoreHome: 1,
    scoreAway: 2,
    stage: "Semi-finals",
  },
  {
    homeTeam: "France",
    awayTeam: "Spain",
    scoreHome: 0,
    scoreAway: 2,
    stage: "Semi-finals",
  },
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
    status: "eliminated",
    stage: "Semi Final",
    nextStageProbability: 0,
    reason: "Eliminated in Semi-finals — lost to Spain 0-2 (14 Jul).",
    nextFixture: null,
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
    status: "eliminated",
    stage: "Final",
    nextStageProbability: 0,
    reason:
      "Runners-up — lost World Cup Final 0–1 to Spain (AET, 19 Jul). Ferran Torres 106'.",
    nextFixture: null,
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
    status: "winner",
    stage: "World Cup Winner",
    nextStageProbability: 100,
    reason:
      "World Cup champions — beat Argentina 1–0 (AET, 19 Jul). Ferran Torres 106'.",
    nextFixture: null,
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
    status: "eliminated",
    stage: "Semi Final",
    nextStageProbability: 0,
    reason: "Eliminated in Semi-finals — lost to Argentina 1-2 (15 Jul).",
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

/** No remaining fixtures — tournament complete. */
export const VERIFIED_UPCOMING_FAMILY_FIXTURES: UpcomingFamilyFixture[] = [];

export function getActiveFamilyFixture(): UpcomingFamilyFixture | null {
  return VERIFIED_UPCOMING_FAMILY_FIXTURES[0] ?? null;
}

export function getNextFamilySweepFixtureLabel(): string {
  const finalResult = getVerifiedFinalResult();
  if (finalResult) {
    const suffix = finalResult.afterExtraTime ? " (AET)" : "";
    return `${finalResult.homeTeam} ${finalResult.scoreHome}–${finalResult.scoreAway} ${finalResult.awayTeam}${suffix} — Final complete`;
  }

  const next = VERIFIED_UPCOMING_FAMILY_FIXTURES[0];
  if (!next) return "Tournament complete";

  if (isFamilyFixtureLive(next)) {
    return `LIVE — EXTRA TIME: ${formatFinalLiveScore(next)}`;
  }

  return `${next.homeTeam} vs ${next.awayOpponent} — Final · ${next.dateUk}, ${next.timeUk}`;
}

export function getCompletedFixturesForStage(
  stage: string,
): CompletedFamilyFixture[] {
  return VERIFIED_COMPLETED_FAMILY_FIXTURES.filter((f) => f.stage === stage);
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
