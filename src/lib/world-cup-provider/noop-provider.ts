import type {
  ProviderTournamentSnapshot,
  WorldCupDataProvider,
} from "./types";

/**
 * Placeholder provider — returns an empty snapshot.
 * Wire a real provider by setting WORLD_CUP_PROVIDER in environment variables.
 */
export class NoopWorldCupProvider implements WorldCupDataProvider {
  readonly name = "noop";

  async fetchTournamentSnapshot(): Promise<ProviderTournamentSnapshot> {
    return {
      fetchedAt: new Date().toISOString(),
      teams: [],
      tournamentComplete: false,
      winnerTeamName: null,
    };
  }
}
