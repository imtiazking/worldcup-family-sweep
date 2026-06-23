import type { ProviderTeamUpdate, TeamTournamentStatus } from "./types";
import type { ApiFixture, ApiStandingsGroup } from "./api-football-client";
import { normalizeApiTeamName } from "./team-name-map";

export const STAGE_ORDER = [
  "Group Stage",
  "Round of 32",
  "Round of 16",
  "Quarter Final",
  "Semi Final",
  "Final",
  "World Cup Winner",
] as const;

export type TournamentStageName = (typeof STAGE_ORDER)[number];

type TeamState = {
  status: TeamTournamentStatus;
  stage: TournamentStageName;
};

type RoundMapping = {
  stage: TournamentStageName;
  next: TournamentStageName;
};

function isGroupRound(round: string): boolean {
  return /group/i.test(round);
}

function mapKnockoutRound(round: string): RoundMapping | null {
  const r = round.toLowerCase();

  if (r.includes("round of 32") || r.includes("1/16") || r.includes("32nd")) {
    return { stage: "Round of 32", next: "Round of 16" };
  }
  if (r.includes("round of 16") || r.includes("1/8") || r.includes("16th")) {
    return { stage: "Round of 16", next: "Quarter Final" };
  }
  if (r.includes("quarter")) {
    return { stage: "Quarter Final", next: "Semi Final" };
  }
  if (r.includes("semi")) {
    return { stage: "Semi Final", next: "Final" };
  }
  if (r === "final" || r.includes("world cup - final")) {
    return { stage: "Final", next: "World Cup Winner" };
  }

  return null;
}

function createInitialStates(
  trackedTeams: string[]
): Map<string, TeamState> {
  const states = new Map<string, TeamState>();

  for (const team of trackedTeams) {
    states.set(team, { status: "active", stage: "Group Stage" });
  }

  return states;
}

function applyStandings(
  standings: ApiStandingsGroup[],
  states: Map<string, TeamState>
): void {
  for (const group of standings) {
    for (const row of group) {
      const teamName = normalizeApiTeamName(row.team.name);
      if (!teamName || !states.has(teamName)) continue;

      const description = (row.description ?? "").toLowerCase();

      if (
        description.includes("eliminated") ||
        description.includes("relegation") ||
        description.includes("did not qualify")
      ) {
        states.set(teamName, { status: "eliminated", stage: "Group Stage" });
        continue;
      }

      if (
        description.includes("round of 32") ||
        description.includes("1/16") ||
        description.includes("knockout") ||
        description.includes("playoff")
      ) {
        const current = states.get(teamName)!;
        if (current.status === "active") {
          states.set(teamName, { status: "active", stage: "Round of 32" });
        }
        continue;
      }

      if (
        description.includes("advance") &&
        description.includes("further round")
      ) {
        const current = states.get(teamName)!;
        if (current.status === "active") {
          states.set(teamName, { status: "active", stage: "Round of 32" });
        }
        continue;
      }

      // Group of 4: 4th place is eliminated once all group games are played
      if (row.all.played >= 3 && row.rank >= 4) {
        states.set(teamName, { status: "eliminated", stage: "Group Stage" });
      }
    }
  }
}

function applyKnockoutFixtures(
  fixtures: ApiFixture[],
  states: Map<string, TeamState>
): void {
  const knockout = fixtures
    .filter((f) => !isGroupRound(f.league.round))
    .sort(
      (a, b) =>
        new Date(a.fixture.date).getTime() -
        new Date(b.fixture.date).getTime()
    );

  for (const fixture of knockout) {
    const mapping = mapKnockoutRound(fixture.league.round);
    if (!mapping) continue;

    const home = normalizeApiTeamName(fixture.teams.home.name);
    const away = normalizeApiTeamName(fixture.teams.away.name);

    const homeTracked = home ? states.has(home) : false;
    const awayTracked = away ? states.has(away) : false;
    if (!homeTracked && !awayTracked) continue;

    const homeWon = fixture.teams.home.winner === true;
    const awayWon = fixture.teams.away.winner === true;

    if (!homeWon && !awayWon) continue;

    const winner = homeWon ? home : away;
    const loser = homeWon ? away : home;

    if (mapping.stage === "Final") {
      if (winner && states.has(winner)) {
        states.set(winner, {
          status: "winner",
          stage: "World Cup Winner",
        });
      }
      if (loser && states.has(loser)) {
        states.set(loser, { status: "eliminated", stage: "Final" });
      }
      continue;
    }

    if (winner && states.has(winner)) {
      const current = states.get(winner)!;
      if (current.status !== "winner") {
        states.set(winner, { status: "active", stage: mapping.next });
      }
    }

    if (loser && states.has(loser)) {
      states.set(loser, { status: "eliminated", stage: mapping.stage });
    }
  }
}

/**
 * Derives team_status updates for sweep teams from completed fixtures
 * and standings returned by API-Football.
 */
export function buildTeamUpdatesFromApiData(
  trackedTeams: string[],
  fixtures: ApiFixture[],
  standings: ApiStandingsGroup[]
): ProviderTeamUpdate[] {
  const states = createInitialStates(trackedTeams);

  applyStandings(standings, states);
  applyKnockoutFixtures(fixtures, states);

  return trackedTeams.map((teamName) => {
    const state = states.get(teamName) ?? {
      status: "active" as const,
      stage: "Group Stage" as const,
    };

    return {
      teamName,
      status: state.status,
      stage: state.stage,
      nextStageProbability:
        state.status === "active" &&
        state.stage !== "Group Stage" &&
        state.stage !== "World Cup Winner"
          ? 100
          : undefined,
    };
  });
}
