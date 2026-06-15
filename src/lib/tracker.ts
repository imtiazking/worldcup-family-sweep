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

export function getStageDepth(row: TrackerRow): number {
  const stage = getStageForRow(row);
  return TOURNAMENT_STAGES.indexOf(stage);
}

export function getDisplayStage(row: TrackerRow): TournamentStage {
  return getStageForRow(row);
}

export type TournamentStats = {
  alive: number;
  eliminated: number;
  total: number;
  progressPercent: number;
};

export function computeTournamentStats(rows: TrackerRow[]): TournamentStats {
  const total = rows.length;
  const eliminated = rows.filter(
    (r) => r.team_status.status === "eliminated"
  ).length;
  const alive = rows.filter(
    (r) =>
      r.team_status.status !== "eliminated" &&
      r.team_status.status !== "winner"
  ).length;
  const progressPercent =
    total > 0 ? Math.round((eliminated / total) * 100) : 0;

  return { alive, eliminated, total, progressPercent };
}

export type LeaderboardEntry = {
  rank: number;
  participantName: string;
  teamName: string;
  teamFlag: string;
  stage: TournamentStage;
  depth: number;
  status: string;
};

export function buildLeaderboard(rows: TrackerRow[]): LeaderboardEntry[] {
  const sorted = [...rows].sort((a, b) => {
    const depthDiff = getStageDepth(b) - getStageDepth(a);
    if (depthDiff !== 0) return depthDiff;

    const nameA = a.participant?.name ?? "";
    const nameB = b.participant?.name ?? "";
    return nameA.localeCompare(nameB);
  });

  return sorted.map((row, index) => ({
    rank: index + 1,
    participantName: row.participant?.name ?? "Unknown",
    teamName: row.team?.name ?? "Unknown",
    teamFlag: row.team?.flag_emoji ?? "⚽",
    stage: getDisplayStage(row),
    depth: getStageDepth(row),
    status: row.team_status.status,
  }));
}
