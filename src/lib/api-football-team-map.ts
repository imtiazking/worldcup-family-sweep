import type { ApiLeagueTeam } from "@/lib/world-cup-provider/api-football-client";
import {
  SWEEP_TEAM_NAMES,
  normalizeApiTeamName,
} from "@/lib/world-cup-provider/team-name-map";

export type TeamIdMap = {
  byId: Map<number, string>;
  byApiName: Map<string, string>;
};

export function buildTeamIdMap(apiTeams: ApiLeagueTeam[]): {
  map: TeamIdMap;
  mappedSweepTeams: string[];
  unmappedSweepTeams: string[];
} {
  const byId = new Map<number, string>();
  const byApiName = new Map<string, string>();
  const mappedSet = new Set<string>();

  for (const entry of apiTeams) {
    const sweepName = normalizeApiTeamName(entry.team.name);
    if (!sweepName) continue;

    byId.set(entry.team.id, sweepName);
    byApiName.set(entry.team.name.toLowerCase(), sweepName);
    mappedSet.add(sweepName);
  }

  const mappedSweepTeams = [...mappedSet].sort();
  const unmappedSweepTeams = SWEEP_TEAM_NAMES.filter(
    (name) => !mappedSet.has(name),
  );

  return {
    map: { byId, byApiName },
    mappedSweepTeams,
    unmappedSweepTeams,
  };
}

export function resolveSweepTeamName(
  teamId: number,
  apiName: string,
  map: TeamIdMap,
): string | null {
  const byId = map.byId.get(teamId);
  if (byId) return byId;

  return normalizeApiTeamName(apiName);
}
