import { createServiceClient } from "@/lib/supabase";
import {
  fetchCompletedFixtures,
  fetchStandings,
} from "./api-football-client";
import { SWEEP_TEAM_NAMES } from "./team-name-map";
import { buildTeamUpdatesFromApiData } from "./tournament-engine";
import type {
  ProviderTournamentSnapshot,
  WorldCupDataProvider,
} from "./types";

async function getTrackedTeamNames(): Promise<string[]> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase.from("teams").select("name").order("name");

    if (error || !data?.length) {
      return [...SWEEP_TEAM_NAMES];
    }

    return data.map((row) => row.name);
  } catch {
    return [...SWEEP_TEAM_NAMES];
  }
}

/**
 * Live World Cup 2026 provider using API-Football (api-sports.io).
 *
 * Requires API_FOOTBALL_KEY in environment variables.
 * Register at https://www.api-football.com/ and paste the key in Vercel.
 *
 * Uses league=1, season=2026, completed fixtures only (status=FT).
 */
export class ApiFootballProvider implements WorldCupDataProvider {
  readonly name = "api-football";

  async fetchTournamentSnapshot(): Promise<ProviderTournamentSnapshot> {
    const trackedTeams = await getTrackedTeamNames();

    const [fixtures, standings] = await Promise.all([
      fetchCompletedFixtures(),
      fetchStandings(),
    ]);

    const teams = buildTeamUpdatesFromApiData(
      trackedTeams,
      fixtures,
      standings
    );

    const winner = teams.find((t) => t.status === "winner") ?? null;

    return {
      fetchedAt: new Date().toISOString(),
      teams,
      tournamentComplete: winner !== null,
      winnerTeamName: winner?.teamName ?? null,
    };
  }
}
