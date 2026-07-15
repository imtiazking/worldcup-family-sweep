import { VERIFIED_SNAPSHOT_AS_OF, getNextFamilySweepFixtureLabel } from "@/lib/world-cup-verified-snapshot";
import type { TournamentStage } from "@/lib/tracker";

export type PhaseStatus = "complete" | "in_progress" | "pending";

export type TournamentPhase = {
  id: TournamentStage;
  label: string;
  status: PhaseStatus;
};

export type NextTournamentFixture = {
  label: string;
  home: string;
  away: string;
  dateUk: string;
  timeUk: string;
};

/** Next family sweep knockout fixture (World Cup Final). */
export const NEXT_TOURNAMENT_FIXTURE: NextTournamentFixture = (() => {
  const label = getNextFamilySweepFixtureLabel();
  const familyMatch = label.match(
    /^(.+?)\s+vs\s+(.+?)\s+—\s+Final\s+·\s+(.+?),\s+(.+)$/,
  );
  return {
    home: familyMatch?.[1]?.trim() ?? "Spain",
    away: familyMatch?.[2]?.trim() ?? "Argentina",
    dateUk: familyMatch?.[3]?.trim() ?? "19 Jul",
    timeUk: familyMatch?.[4]?.trim() ?? "20:00",
    label,
  };
})();

const PHASE_WEIGHTS: Partial<Record<TournamentStage, number>> = {
  "Group Stage": 50,
  "Round of 32": 10,
  "Round of 16": 10,
  "Quarter Final": 10,
  "Semi Final": 10,
  Final: 10,
};

const DISPLAY_PHASES: Array<{ id: TournamentStage; label: string }> = [
  { id: "Group Stage", label: "Group Stage" },
  { id: "Round of 32", label: "Round of 32" },
  { id: "Round of 16", label: "Round of 16" },
  { id: "Quarter Final", label: "Quarter-finals" },
  { id: "Semi Final", label: "Semi-finals" },
  { id: "Final", label: "Final" },
];

/** Share of the current in-progress phase counted toward overall tournament %. */
const IN_PROGRESS_PHASE_FRACTION = 0.25;

export type TournamentPhaseProgress = {
  asOf: string;
  currentStage: TournamentStage;
  currentStageLabel: string;
  phases: TournamentPhase[];
  overallPercent: number;
  groupStagePercent: number;
  progressCaption: string;
  nextFixture: NextTournamentFixture;
};

function buildPhasesForFinal(): TournamentPhase[] {
  return DISPLAY_PHASES.map((phase) => {
    if (
      phase.id === "Group Stage" ||
      phase.id === "Round of 32" ||
      phase.id === "Round of 16" ||
      phase.id === "Quarter Final" ||
      phase.id === "Semi Final"
    ) {
      return { ...phase, status: "complete" as const };
    }
    if (phase.id === "Final") {
      return { ...phase, status: "in_progress" as const };
    }
    return { ...phase, status: "pending" as const };
  });
}

function computeOverallPercent(phases: TournamentPhase[]): number {
  let total = 0;

  for (const phase of phases) {
    const weight = PHASE_WEIGHTS[phase.id] ?? 0;
    if (phase.status === "complete") {
      total += weight;
      continue;
    }
    if (phase.status === "in_progress") {
      total += weight * IN_PROGRESS_PHASE_FRACTION;
      break;
    }
    break;
  }

  return Math.round(Math.min(100, Math.max(0, total)));
}

function computeGroupStagePercent(phases: TournamentPhase[]): number {
  const group = phases.find((p) => p.id === "Group Stage");
  if (!group) return 0;
  if (group.status === "complete") return 100;
  if (group.status === "in_progress") {
    return Math.round(100 * IN_PROGRESS_PHASE_FRACTION);
  }
  return 0;
}

function buildProgressCaption(phases: TournamentPhase[]): string {
  const group = phases.find((p) => p.id === "Group Stage");
  const active = phases.find((p) => p.status === "in_progress");

  if (group?.status === "complete" && active) {
    return `Group stage complete · ${active.label} active`;
  }
  if (group?.status === "in_progress") {
    return "Group stage in progress";
  }
  if (active) {
    return `${active.label} active`;
  }
  return "Tournament underway";
}

/**
 * Tournament-wide knockout progress (independent of family sweep eliminations).
 * Updated through 15 Jul 2026 — semi-finals complete; Spain vs Argentina in the Final.
 */
export function getTournamentPhaseProgress(): TournamentPhaseProgress {
  const phases = buildPhasesForFinal();
  const current = phases.find((p) => p.status === "in_progress") ?? phases[0];

  return {
    asOf: VERIFIED_SNAPSHOT_AS_OF,
    currentStage: current.id,
    currentStageLabel: current.label,
    phases,
    overallPercent: computeOverallPercent(phases),
    groupStagePercent: computeGroupStagePercent(phases),
    progressCaption: buildProgressCaption(phases),
    nextFixture: NEXT_TOURNAMENT_FIXTURE,
  };
}

export function formatPhaseStatus(status: PhaseStatus): string {
  switch (status) {
    case "complete":
      return "Complete";
    case "in_progress":
      return "In progress";
    default:
      return "Pending";
  }
}
