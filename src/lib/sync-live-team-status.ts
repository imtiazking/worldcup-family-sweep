import {
  fetchAllFixtures,
  fetchFixtureRounds,
  fetchLeagueTeams,
  fetchStandings,
  type ApiFixture,
  type ApiLeagueTeam,
  type ApiStandingsGroup,
  ApiFootballError,
  ApiFootballRateLimitError,
} from "@/lib/world-cup-provider/api-football-client";
import { buildTeamIdMap } from "@/lib/api-football-team-map";
import {
  buildFixtureStatusBreakdown,
  classifySweepTeamsFromApi,
  isDatasetAmbiguous,
  isValidApiFootballData,
  type ApiFootballSyncLogs,
  type ExistingTeamStatus,
  type LiveTeamClassification,
} from "@/lib/api-football-live-classifier";
import {
  applyTeamStatusRows,
  runVerifiedTeamStatusSync,
  type VerifiedSyncResult,
} from "@/lib/sync-verified-team-status";
import {
  SYNC_SOURCE_API_ERROR,
  SYNC_SOURCE_FALLBACK,
  SYNC_SOURCE_LIVE,
} from "@/lib/sync-sources";
import { createServiceClient } from "@/lib/supabase";

export type ApiFootballBundle = {
  standings: ApiStandingsGroup[];
  fixtures: ApiFixture[];
  rounds: string[];
  teams: ApiLeagueTeam[];
  fetchedAt: string;
};

async function fetchApiFootballBundle(): Promise<ApiFootballBundle> {
  const [standings, fixtures, rounds, teams] = await Promise.all([
    fetchStandings(),
    fetchAllFixtures(),
    fetchFixtureRounds(),
    fetchLeagueTeams(),
  ]);

  return {
    standings,
    fixtures,
    rounds,
    teams,
    fetchedAt: new Date().toISOString(),
  };
}

function buildApiLogs(
  bundle: ApiFootballBundle,
  mappedSweepTeams: string[],
  unmappedSweepTeams: string[],
  classificationLogs: Pick<
    ApiFootballSyncLogs,
    "ambiguousTeams" | "qualified" | "pending" | "eliminated"
  >,
): ApiFootballSyncLogs {
  return {
    standingsGroups: bundle.standings.length,
    standingsTeams: bundle.standings.reduce(
      (sum, group) => sum + group.length,
      0,
    ),
    roundsCount: bundle.rounds.length,
    fixturesTotal: bundle.fixtures.length,
    fixtureStatusBreakdown: buildFixtureStatusBreakdown(bundle.fixtures),
    apiTeamsCount: bundle.teams.length,
    mappedSweepTeams,
    unmappedSweepTeams,
    ambiguousTeams: classificationLogs.ambiguousTeams,
    qualified: classificationLogs.qualified,
    pending: classificationLogs.pending,
    eliminated: classificationLogs.eliminated,
  };
}

function logApiFootballSync(logs: ApiFootballSyncLogs, prefix: string): void {
  console.info(`[sync-team-status] ${prefix}`, {
    standingsGroups: logs.standingsGroups,
    standingsTeams: logs.standingsTeams,
    roundsCount: logs.roundsCount,
    fixturesTotal: logs.fixturesTotal,
    fixtureStatusBreakdown: logs.fixtureStatusBreakdown,
    apiTeamsCount: logs.apiTeamsCount,
    mappedSweepTeams: logs.mappedSweepTeams,
    unmappedSweepTeams: logs.unmappedSweepTeams,
    ambiguousTeams: logs.ambiguousTeams,
    qualified: logs.qualified,
    pending: logs.pending,
    eliminated: logs.eliminated,
  });
}

async function readExistingTeamStatuses(): Promise<
  Map<string, ExistingTeamStatus>
> {
  const map = new Map<string, ExistingTeamStatus>();
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("team_status")
      .select("team_name, status, stage, next_stage_probability");

    for (const row of data ?? []) {
      map.set(row.team_name, {
        team_name: row.team_name,
        status: row.status,
        stage: row.stage,
        next_stage_probability: row.next_stage_probability,
      });
    }
  } catch {
    // Non-fatal — merge safety is best-effort when DB read fails.
  }
  return map;
}

async function readTrackedTeamNames(): Promise<string[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.from("teams").select("name").order("name");
  if (error || !data?.length) {
    throw new Error(error?.message ?? "No teams found in sweep");
  }
  return data.map((row) => row.name);
}

function classificationsToSnapshotRows(
  classifications: LiveTeamClassification[],
) {
  return classifications.map((row) => ({
    teamName: row.teamName,
    status: row.status,
    stage: row.stage,
    nextStageProbability: row.nextStageProbability,
  }));
}

async function runLiveApiSync(
  bundle: ApiFootballBundle,
): Promise<VerifiedSyncResult> {
  const { map, mappedSweepTeams, unmappedSweepTeams } = buildTeamIdMap(
    bundle.teams,
  );
  const trackedTeams = await readTrackedTeamNames();
  const existingByTeam = await readExistingTeamStatuses();

  const { classifications, logs: classificationLogs } = classifySweepTeamsFromApi(
    trackedTeams,
    bundle.standings,
    bundle.fixtures,
    map,
    mappedSweepTeams,
    unmappedSweepTeams,
    existingByTeam,
  );

  const logs = buildApiLogs(
    bundle,
    mappedSweepTeams,
    unmappedSweepTeams,
    classificationLogs,
  );
  logApiFootballSync(logs, "API-Football live sync");

  return applyTeamStatusRows(
    classificationsToSnapshotRows(classifications),
    SYNC_SOURCE_LIVE,
    logs,
  );
}

/**
 * Tries API-Football live data first; falls back to verified snapshot on failure.
 */
export async function runLiveFirstTeamStatusSync(): Promise<VerifiedSyncResult> {
  const apiKey = process.env.API_FOOTBALL_KEY?.trim();

  if (!apiKey) {
    console.warn(
      "[sync-team-status] API_FOOTBALL_KEY missing — using verified snapshot fallback",
    );
    return runVerifiedTeamStatusSync({
      source: SYNC_SOURCE_FALLBACK,
      reason: "API_FOOTBALL_KEY not configured",
    });
  }

  try {
    const bundle = await fetchApiFootballBundle();

    if (!isValidApiFootballData(bundle.standings, bundle.rounds)) {
      console.warn(
        "[sync-team-status] API-Football returned invalid standings/rounds — snapshot fallback",
        {
          standingsGroups: bundle.standings.length,
          roundsCount: bundle.rounds.length,
        },
      );
      return runVerifiedTeamStatusSync({
        source: SYNC_SOURCE_FALLBACK,
        reason: "Invalid or empty standings/rounds from API-Football",
      });
    }

    if (isDatasetAmbiguous(bundle.standings, bundle.rounds)) {
      console.warn(
        "[sync-team-status] API-Football data ambiguous — snapshot fallback",
      );
      return runVerifiedTeamStatusSync({
        source: SYNC_SOURCE_FALLBACK,
        reason: "Ambiguous API-Football dataset",
      });
    }

    return await runLiveApiSync(bundle);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "API-Football sync failed";
    const isRateLimit = error instanceof ApiFootballRateLimitError;
    const isApiError = error instanceof ApiFootballError || isRateLimit;

    console.error("[sync-team-status] API-Football error — snapshot fallback", {
      message,
      isRateLimit,
    });

    return runVerifiedTeamStatusSync({
      source: isApiError ? SYNC_SOURCE_API_ERROR : SYNC_SOURCE_FALLBACK,
      reason: message,
    });
  }
}
