import { getTournamentPhaseProgress, type TournamentPhaseProgress } from "@/lib/tournament-progress";

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
  next_stage_probability?: number | null;
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
  /** Family sweep elimination rate (legacy field; not used for tournament bar). */
  eliminationPercent: number;
  tournamentProgress: TournamentPhaseProgress;
};

export function computeTournamentStats(rows: TrackerRow[]): TournamentStats {
  const total = rows.length;
  const eliminated = rows.filter(
    (r) => r.team_status.status === "eliminated",
  ).length;
  const alive = rows.filter(
    (r) => r.team_status.status !== "eliminated",
  ).length;
  const eliminationPercent =
    total > 0 ? Math.round((eliminated / total) * 100) : 0;

  return {
    alive,
    eliminated,
    total,
    eliminationPercent,
    tournamentProgress: getTournamentPhaseProgress(),
  };
}

export type LeaderboardEntry = {
  rank: number;
  participantName: string;
  teamName: string;
  teamFlag: string;
  stage: TournamentStage;
  depth: number;
  status: string;
  nextStageChance: NextStageChanceDisplay;
};

export type NextStageChanceVariant =
  | "winner"
  | "eliminated"
  | "qualified"
  | "probability"
  | "pending";

export type NextStageChanceDisplay = {
  text: string;
  variant: NextStageChanceVariant;
  probability?: number;
  nextStage?: TournamentStage | null;
};

export function getNextStage(current: TournamentStage): TournamentStage | null {
  const idx = TOURNAMENT_STAGES.indexOf(current);
  if (idx < 0 || idx >= TOURNAMENT_STAGES.length - 1) {
    return null;
  }
  return TOURNAMENT_STAGES[idx + 1];
}

/**
 * Display label for estimated next-stage progression (not betting odds).
 */
export function getNextStageChanceDisplay(
  row: TrackerRow
): NextStageChanceDisplay {
  const status = row.team_status.status;
  const currentStage = getStageForRow(row);
  const nextStage = getNextStage(currentStage);
  const rawProb = row.team_status.next_stage_probability;
  const prob =
    rawProb !== null && rawProb !== undefined && !Number.isNaN(Number(rawProb))
      ? Number(rawProb)
      : null;

  if (status === "winner") {
    return { text: "Champion", variant: "winner", nextStage: null };
  }

  if (status === "eliminated") {
    return { text: "Eliminated", variant: "eliminated", nextStage: null };
  }

  if (prob !== null && prob >= 100) {
    return {
      text: "Qualified to next stage",
      variant: "qualified",
      probability: 100,
      nextStage,
    };
  }

  if (prob !== null) {
    const pct = Math.round(Math.min(100, Math.max(0, prob)));
    const target = nextStage ?? "next stage";
    return {
      text: `Chance to reach ${target}: ${pct}%`,
      variant: "probability",
      probability: pct,
      nextStage,
    };
  }

  if (nextStage) {
    return {
      text: "Chance pending",
      variant: "pending",
      nextStage,
    };
  }

  return { text: "Chance pending", variant: "pending", nextStage: null };
}

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
    nextStageChance: getNextStageChanceDisplay(row),
  }));
}
