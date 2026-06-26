import type {
  ApiFixture,
  ApiStandingsGroup,
} from "@/lib/world-cup-provider/api-football-client";
import {
  STAGE_ORDER,
  type TournamentStageName,
  buildTeamUpdatesFromApiData,
} from "@/lib/world-cup-provider/tournament-engine";
import type { TeamIdMap } from "@/lib/api-football-team-map";
import { resolveSweepTeamName } from "@/lib/api-football-team-map";

export type ClassificationConfidence = "high" | "low" | "ambiguous";

export type LiveTeamClassification = {
  teamName: string;
  status: "active" | "eliminated" | "winner";
  stage: string;
  nextStageProbability: number | null;
  bucket: "qualified" | "pending" | "eliminated";
  confidence: ClassificationConfidence;
};

export type ExistingTeamStatus = {
  team_name: string;
  status: string;
  stage: string;
  next_stage_probability: number | null;
};

export type ApiFootballSyncLogs = {
  standingsGroups: number;
  standingsTeams: number;
  roundsCount: number;
  fixturesTotal: number;
  fixtureStatusBreakdown: Record<string, number>;
  apiTeamsCount: number;
  mappedSweepTeams: string[];
  unmappedSweepTeams: string[];
  ambiguousTeams: string[];
  qualified: number;
  pending: number;
  eliminated: number;
};

function isGroupRound(round: string): boolean {
  return /group/i.test(round);
}

function isRoundOf32Round(round: string): boolean {
  const r = round.toLowerCase();
  return (
    r.includes("round of 32") ||
    r.includes("1/16") ||
    r.includes("32nd") ||
    r.includes("last 32")
  );
}

function isQualifiedExisting(row: ExistingTeamStatus): boolean {
  const prob = row.next_stage_probability;
  return (
    row.status === "active" &&
    prob !== null &&
    prob >= 100 &&
    row.stage !== "Group Stage"
  );
}

function toPendingClassification(
  teamName: string,
  existing?: ExistingTeamStatus,
): LiveTeamClassification {
  if (existing) {
    return {
      teamName,
      status: existing.status as LiveTeamClassification["status"],
      stage: existing.stage,
      nextStageProbability: existing.next_stage_probability,
      bucket:
        existing.status === "eliminated"
          ? "eliminated"
          : isQualifiedExisting(existing)
            ? "qualified"
            : "pending",
      confidence: "ambiguous",
    };
  }

  return {
    teamName,
    status: "active",
    stage: "Group Stage",
    nextStageProbability: null,
    bucket: "pending",
    confidence: "ambiguous",
  };
}

function classifyBucket(
  status: string,
  stage: string,
  nextStageProbability: number | null,
): "qualified" | "pending" | "eliminated" {
  if (status === "eliminated") return "eliminated";
  if (status === "winner") return "qualified";
  if (
    status === "active" &&
    nextStageProbability !== null &&
    nextStageProbability >= 100 &&
    stage !== "Group Stage"
  ) {
    return "qualified";
  }
  return "pending";
}

function standingRowForTeam(
  standings: ApiStandingsGroup[],
  teamName: string,
  teamIdMap: TeamIdMap,
): { row: ApiStandingsGroup[number]; description: string } | null {
  for (const group of standings) {
    for (const row of group) {
      const mapped = resolveSweepTeamName(
        row.team.id,
        row.team.name,
        teamIdMap,
      );
      if (mapped === teamName) {
        return { row, description: (row.description ?? "").toLowerCase() };
      }
    }
  }
  return null;
}

function classifyFromStandings(
  teamName: string,
  standings: ApiStandingsGroup[],
  teamIdMap: TeamIdMap,
): LiveTeamClassification | null {
  const match = standingRowForTeam(standings, teamName, teamIdMap);
  if (!match) return null;

  const { row, description } = match;

  if (
    description.includes("eliminated") ||
    description.includes("relegation") ||
    description.includes("did not qualify")
  ) {
    return {
      teamName,
      status: "eliminated",
      stage: "Group Stage",
      nextStageProbability: null,
      bucket: "eliminated",
      confidence: "high",
    };
  }

  if (
    description.includes("round of 32") ||
    description.includes("1/16") ||
    description.includes("knockout") ||
    description.includes("playoff") ||
    (description.includes("advance") && description.includes("further round"))
  ) {
    return {
      teamName,
      status: "active",
      stage: "Round of 32",
      nextStageProbability: 100,
      bucket: "qualified",
      confidence: "high",
    };
  }

  if (row.all.played >= 3 && row.rank >= 4) {
    return {
      teamName,
      status: "eliminated",
      stage: "Group Stage",
      nextStageProbability: null,
      bucket: "eliminated",
      confidence: "high",
    };
  }

  if (row.all.played < 3 && row.rank >= 4) {
    return {
      teamName,
      status: "active",
      stage: "Group Stage",
      nextStageProbability: null,
      bucket: "pending",
      confidence: "ambiguous",
    };
  }

  return {
    teamName,
    status: "active",
    stage: "Group Stage",
    nextStageProbability: null,
    bucket: "pending",
    confidence: "low",
  };
}

function classifyFromRoundOf32Fixtures(
  teamName: string,
  fixtures: ApiFixture[],
  teamIdMap: TeamIdMap,
): LiveTeamClassification | null {
  for (const fixture of fixtures) {
    if (!isRoundOf32Round(fixture.league.round)) continue;

    for (const side of [fixture.teams.home, fixture.teams.away]) {
      const mapped = resolveSweepTeamName(side.id, side.name, teamIdMap);
      if (mapped !== teamName) continue;

      return {
        teamName,
        status: "active",
        stage: "Round of 32",
        nextStageProbability: 100,
        bucket: "qualified",
        confidence: "high",
      };
    }
  }

  return null;
}

function mergeClassifications(
  engineResult: LiveTeamClassification,
  standingResult: LiveTeamClassification | null,
  r32Result: LiveTeamClassification | null,
): LiveTeamClassification {
  const candidates = [engineResult, standingResult, r32Result].filter(
    Boolean,
  ) as LiveTeamClassification[];

  const eliminated = candidates.find(
    (c) => c.bucket === "eliminated" && c.confidence === "high",
  );
  if (eliminated) return eliminated;

  const qualified = candidates
    .filter((c) => c.bucket === "qualified")
    .sort((a, b) => {
      const stageRank = (stage: string) =>
        STAGE_ORDER.indexOf(stage as TournamentStageName);
      return stageRank(b.stage) - stageRank(a.stage);
    })[0];

  if (qualified && qualified.confidence !== "ambiguous") {
    return qualified;
  }

  const ambiguous = candidates.find((c) => c.confidence === "ambiguous");
  if (ambiguous) return ambiguous;

  return engineResult;
}

export function mergeWithExistingStatus(
  classified: LiveTeamClassification,
  existing?: ExistingTeamStatus,
): LiveTeamClassification {
  if (!existing) return classified;

  if (classified.confidence === "ambiguous") {
    return toPendingClassification(classified.teamName, existing);
  }

  if (isQualifiedExisting(existing)) {
    if (
      classified.confidence === "high" &&
      classified.bucket === "eliminated"
    ) {
      return classified;
    }

    if (classified.bucket === "qualified") {
      return classified;
    }

    return {
      teamName: existing.team_name,
      status: existing.status as LiveTeamClassification["status"],
      stage: existing.stage,
      nextStageProbability: existing.next_stage_probability,
      bucket: "qualified",
      confidence: "high",
    };
  }

  return classified;
}

export function classifySweepTeamsFromApi(
  trackedTeams: string[],
  standings: ApiStandingsGroup[],
  fixtures: ApiFixture[],
  teamIdMap: TeamIdMap,
  mappedSweepTeams: string[],
  unmappedSweepTeams: string[],
  existingByTeam: Map<string, ExistingTeamStatus>,
): {
  classifications: LiveTeamClassification[];
  logs: Pick<
    ApiFootballSyncLogs,
    "ambiguousTeams" | "qualified" | "pending" | "eliminated"
  >;
} {
  const completedFixtures = fixtures.filter(
    (f) => f.fixture.status.short === "FT",
  );
  const engineUpdates = buildTeamUpdatesFromApiData(
    trackedTeams,
    completedFixtures,
    standings,
  );

  const classifications: LiveTeamClassification[] = [];
  const ambiguousTeams: string[] = [];

  for (const teamName of trackedTeams) {
    const existing = existingByTeam.get(teamName);
    const engineUpdate = engineUpdates.find((u) => u.teamName === teamName);
    const engineResult: LiveTeamClassification = {
      teamName,
      status: engineUpdate?.status ?? "active",
      stage: engineUpdate?.stage ?? "Group Stage",
      nextStageProbability: engineUpdate?.nextStageProbability ?? null,
      bucket: "pending",
      confidence: "low",
    };
    engineResult.bucket = classifyBucket(
      engineResult.status,
      engineResult.stage,
      engineResult.nextStageProbability,
    );

    let merged = mergeClassifications(
      engineResult,
      classifyFromStandings(teamName, standings, teamIdMap),
      classifyFromRoundOf32Fixtures(teamName, fixtures, teamIdMap),
    );

    if (unmappedSweepTeams.includes(teamName)) {
      merged = toPendingClassification(teamName, existing);
    } else if (!mappedSweepTeams.includes(teamName)) {
      merged = toPendingClassification(teamName, existing);
    }

    const finalRow = mergeWithExistingStatus(merged, existing);
    classifications.push(finalRow);

    if (
      finalRow.confidence === "ambiguous" ||
      unmappedSweepTeams.includes(teamName)
    ) {
      ambiguousTeams.push(teamName);
    }
  }

  const uniqueAmbiguous = [...new Set(ambiguousTeams)];
  let qualified = 0;
  let pending = 0;
  let eliminated = 0;

  for (const row of classifications) {
    const bucket = classifyBucket(
      row.status,
      row.stage,
      row.nextStageProbability,
    );
    if (bucket === "qualified") qualified += 1;
    else if (bucket === "eliminated") eliminated += 1;
    else pending += 1;
  }

  return {
    classifications,
    logs: {
      ambiguousTeams: uniqueAmbiguous,
      qualified,
      pending,
      eliminated,
    },
  };
}

export function buildFixtureStatusBreakdown(
  fixtures: ApiFixture[],
): Record<string, number> {
  const breakdown: Record<string, number> = {};
  for (const fixture of fixtures) {
    const status = fixture.fixture.status.short;
    breakdown[status] = (breakdown[status] ?? 0) + 1;
  }
  return breakdown;
}

export function isValidApiFootballData(
  standings: ApiStandingsGroup[],
  rounds: string[],
): boolean {
  if (!standings.length || !rounds.length) return false;

  const standingsTeams = standings.reduce((sum, group) => sum + group.length, 0);
  if (standingsTeams < 12) return false;

  const hasGroupRound = rounds.some((round) => isGroupRound(round));
  if (!hasGroupRound) return false;

  return true;
}

export function isDatasetAmbiguous(
  standings: ApiStandingsGroup[],
  rounds: string[],
): boolean {
  if (!isValidApiFootballData(standings, rounds)) return true;
  return standings.every((group) => group.length === 0);
}
