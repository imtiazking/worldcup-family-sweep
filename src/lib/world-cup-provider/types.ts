/**
 * World Cup data provider types.
 *
 * Default provider: api-football (when API_FOOTBALL_KEY is set).
 * Manual fallback: WORLD_CUP_PROVIDER=noop
 */

export type TeamTournamentStatus = "active" | "eliminated" | "winner";

export type ProviderTeamUpdate = {
  teamName: string;
  status: TeamTournamentStatus;
  stage: string;
  /** Optional 0–100 estimate from provider predictions API */
  nextStageProbability?: number | null;
};

export type ProviderTournamentSnapshot = {
  fetchedAt: string;
  teams: ProviderTeamUpdate[];
  tournamentComplete: boolean;
  winnerTeamName: string | null;
};

export interface WorldCupDataProvider {
  readonly name: string;
  fetchTournamentSnapshot(): Promise<ProviderTournamentSnapshot>;
}

export type WorldCupProviderId = "noop" | "api-football" | "custom";

export function getConfiguredProviderId(): WorldCupProviderId {
  const explicit = process.env.WORLD_CUP_PROVIDER?.toLowerCase();

  // Manual override — safe fallback, never calls external API
  if (explicit === "noop") {
    return "noop";
  }

  if (explicit === "custom") {
    return "custom";
  }

  // Auto-enable API-Football when key is present
  if (process.env.API_FOOTBALL_KEY) {
    return "api-football";
  }

  if (explicit === "api-football") {
    return "api-football";
  }

  return "noop";
}
