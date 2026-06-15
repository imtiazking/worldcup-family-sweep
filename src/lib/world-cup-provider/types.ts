/**
 * World Cup data provider types.
 *
 * Implement a concrete provider (e.g. API-Football, FIFA feed) by extending
 * WorldCupDataProvider. The noop provider is used until one is configured.
 */

export type TeamTournamentStatus = "active" | "eliminated" | "winner";

export type ProviderTeamUpdate = {
  teamName: string;
  status: TeamTournamentStatus;
  stage: string;
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
  const id = process.env.WORLD_CUP_PROVIDER?.toLowerCase();

  if (id === "api-football" || id === "custom") {
    return id;
  }

  return "noop";
}
