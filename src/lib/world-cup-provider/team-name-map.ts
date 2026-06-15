/**
 * Maps API-Football team names to sweep `teams.name` values in Supabase.
 * Add aliases here if the API returns a different label.
 */
export const SWEEP_TEAM_NAMES = [
  "Spain",
  "France",
  "Germany",
  "Argentina",
  "England",
  "Portugal",
  "Brazil",
  "Netherlands",
  "Morocco",
  "Belgium",
  "Mexico",
] as const;

const API_NAME_ALIASES: Record<string, string> = {
  "spain": "Spain",
  "france": "France",
  "germany": "Germany",
  "argentina": "Argentina",
  "england": "England",
  "portugal": "Portugal",
  "brazil": "Brazil",
  "netherlands": "Netherlands",
  "morocco": "Morocco",
  "belgium": "Belgium",
  "mexico": "Mexico",
};

const SWEEP_NAME_SET = new Set<string>(SWEEP_TEAM_NAMES);

export function normalizeApiTeamName(apiName: string): string | null {
  const trimmed = apiName.trim();
  if (SWEEP_NAME_SET.has(trimmed)) return trimmed;

  const alias = API_NAME_ALIASES[trimmed.toLowerCase()];
  return alias ?? null;
}

export function isSweepTeam(name: string): boolean {
  return SWEEP_NAME_SET.has(name);
}
