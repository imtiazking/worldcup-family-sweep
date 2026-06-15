export type TrackerParticipant = {
  id: string;
  name: string;
};

export type TrackerTeam = {
  id: string;
  name: string;
  flag_emoji: string;
};

export type TrackerTeamStatus = {
  team_name: string;
  status: string;
  stage: string;
};

export type TrackerRow = {
  participant: TrackerParticipant | null;
  team: TrackerTeam | null;
  team_status: TrackerTeamStatus;
};

export const TOURNAMENT_STAGES = [
  "Group Stage",
  "Round of 32",
  "Round of 16",
  "Quarter Final",
  "Semi Final",
  "Final",
  "World Cup Winner",
] as const;

export type TournamentStage = (typeof TOURNAMENT_STAGES)[number];

const STAGE_ALIASES: Record<string, TournamentStage> = {
  "group stage": "Group Stage",
  group: "Group Stage",
  "round of 32": "Round of 32",
  r32: "Round of 32",
  "last 32": "Round of 32",
  "round of 16": "Round of 16",
  r16: "Round of 16",
  "last 16": "Round of 16",
  "quarter final": "Quarter Final",
  "quarter-final": "Quarter Final",
  quarters: "Quarter Final",
  qf: "Quarter Final",
  "semi final": "Semi Final",
  "semi-final": "Semi Final",
  semifinal: "Semi Final",
  sf: "Semi Final",
  final: "Final",
  "world cup final": "Final",
  "world cup winner": "World Cup Winner",
  winner: "World Cup Winner",
  champions: "World Cup Winner",
};

export function normalizeStage(stage: string): TournamentStage {
  const key = stage.trim().toLowerCase();
  const matched = STAGE_ALIASES[key];
  if (matched) return matched;

  const byIncludes = TOURNAMENT_STAGES.find(
    (s) => s.toLowerCase() === key
  );
  if (byIncludes) return byIncludes;

  return "Group Stage";
}

export function getStageForRow(row: TrackerRow): TournamentStage {
  if (row.team_status.status === "winner") {
    return "World Cup Winner";
  }
  return normalizeStage(row.team_status.stage);
}

export function groupRowsByStage(
  rows: TrackerRow[]
): Map<TournamentStage, TrackerRow[]> {
  const grouped = new Map<TournamentStage, TrackerRow[]>();

  for (const stage of TOURNAMENT_STAGES) {
    grouped.set(stage, []);
  }

  for (const row of rows) {
    const stage = getStageForRow(row);
    grouped.get(stage)?.push(row);
  }

  return grouped;
}
