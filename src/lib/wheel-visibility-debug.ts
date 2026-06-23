import {
  getNextUnspunEliminated,
  type LoserWheelResult,
} from "@/lib/loser-wheel";
import type { TrackerRow } from "@/lib/tracker";

export type WheelVisibilityDebug = {
  eliminatedLength: number;
  eliminatedTeams: Array<{
    participantName: string | null;
    participantId: string | null;
    teamName: string | null;
    teamId: string | null;
    status: string;
    stage: string;
    hasParticipantId: boolean;
  }>;
  wheelResultsCount: number;
  spunParticipantIds: string[];
  nextEligibleLoser: {
    participantName: string | null;
    participantId: string | null;
    teamName: string | null;
    teamId: string | null;
    stage: string;
  } | null;
  conditions: {
    tabAlwaysInNav: true;
    mobilePanelVisible: "activeTab === 'losers-wheel'";
    desktopSectionVisible: "md:block section below team cards (always mounted)";
    wheelSpinnerVisible: "eliminated.length > 0 && displaySubject != null";
    emptyNoEliminations: "eliminated.length === 0";
    emptyAllSpun: "eliminated.length > 0 && displaySubject == null";
    nextEligibleFilter:
      "participant.id exists AND participant.id not in spunParticipantIds";
  };
  belgium: {
    inEliminatedArray: boolean;
    inRows: boolean;
    rowStatus: string | null;
    rowStage: string | null;
    participantId: string | null;
    alreadySpun: boolean;
    filteredOutReason: string | null;
  };
};

export function buildWheelVisibilityDebug(
  eliminated: TrackerRow[],
  rows: TrackerRow[],
  wheelResults: LoserWheelResult[],
): WheelVisibilityDebug {
  const spunIds = new Set(wheelResults.map((r) => r.participant_id));
  const nextEligible = getNextUnspunEliminated(eliminated, spunIds);

  const belgiumRow = rows.find(
    (r) => r.team?.name?.toLowerCase() === "belgium",
  );
  const belgiumEliminated = eliminated.find(
    (r) => r.team?.name?.toLowerCase() === "belgium",
  );

  let belgiumFilteredReason: string | null = null;
  if (belgiumEliminated && !nextEligible) {
    if (!belgiumEliminated.participant?.id) {
      belgiumFilteredReason = "participant lookup failed (no participant.id)";
    } else if (spunIds.has(belgiumEliminated.participant.id)) {
      belgiumFilteredReason = "wheel result already exists for participant";
    } else {
      belgiumFilteredReason =
        "not selected as next eligible (another eliminated player may rank higher)";
    }
  } else if (belgiumRow && !belgiumEliminated) {
    belgiumFilteredReason = `not in eliminated array (row status="${belgiumRow.team_status.status}")`;
  } else if (!belgiumRow) {
    belgiumFilteredReason = "Belgium not found in assignments/teams join";
  }

  return {
    eliminatedLength: eliminated.length,
    eliminatedTeams: eliminated.map((row) => ({
      participantName: row.participant?.name ?? null,
      participantId: row.participant?.id ?? null,
      teamName: row.team?.name ?? null,
      teamId: row.team?.id ?? null,
      status: row.team_status.status,
      stage: row.team_status.stage,
      hasParticipantId: Boolean(row.participant?.id),
    })),
    wheelResultsCount: wheelResults.length,
    spunParticipantIds: [...spunIds],
    nextEligibleLoser: nextEligible
      ? {
          participantName: nextEligible.participant?.name ?? null,
          participantId: nextEligible.participant?.id ?? null,
          teamName: nextEligible.team?.name ?? null,
          teamId: nextEligible.team?.id ?? null,
          stage: nextEligible.team_status.stage,
        }
      : null,
    conditions: {
      tabAlwaysInNav: true,
      mobilePanelVisible: "activeTab === 'losers-wheel'",
      desktopSectionVisible:
        "md:block section below team cards (always mounted)",
      wheelSpinnerVisible: "eliminated.length > 0 && displaySubject != null",
      emptyNoEliminations: "eliminated.length === 0",
      emptyAllSpun: "eliminated.length > 0 && displaySubject == null",
      nextEligibleFilter:
        "participant.id exists AND participant.id not in spunParticipantIds",
    },
    belgium: {
      inEliminatedArray: Boolean(belgiumEliminated),
      inRows: Boolean(belgiumRow),
      rowStatus: belgiumRow?.team_status.status ?? null,
      rowStage: belgiumRow?.team_status.stage ?? null,
      participantId: belgiumRow?.participant?.id ?? null,
      alreadySpun: belgiumRow?.participant?.id
        ? spunIds.has(belgiumRow.participant.id)
        : false,
      filteredOutReason: belgiumFilteredReason,
    },
  };
}

export function logWheelVisibilityDebug(
  label: string,
  debug: WheelVisibilityDebug,
): void {
  console.group(`[LoserWheel debug] ${label}`);
  console.log("eliminated.length:", debug.eliminatedLength);
  console.log("eliminated teams:", debug.eliminatedTeams);
  console.log("wheelResults count:", debug.wheelResultsCount);
  console.log("spunParticipantIds:", debug.spunParticipantIds);
  console.log("nextEligibleLoser:", debug.nextEligibleLoser);
  console.log("Belgium:", debug.belgium);
  console.log("visibility conditions:", debug.conditions);
  console.log("wheel spinner should show:", {
    spinner:
      debug.eliminatedLength > 0 && debug.nextEligibleLoser != null,
    emptyNoEliminations: debug.eliminatedLength === 0,
    emptyAllSpun:
      debug.eliminatedLength > 0 && debug.nextEligibleLoser == null,
  });
  console.groupEnd();
}
