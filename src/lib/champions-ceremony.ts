import {
  CHAMPIONS_PROTOTYPE,
} from "@/design-lab/champions/constants";
import type {
  CeremonyFinalData,
  CeremonyParticipant,
  CeremonyPodiumData,
  CeremonyPodiumEntry,
} from "@/design-lab/champions/types";
import type { TrackerRow } from "@/lib/tracker";
import { normalizeStage } from "@/lib/tracker";

export type ChampionsCeremonyData = {
  eventTitle: string;
  championHeading: string;
  championSubheading: string;
  champion: CeremonyParticipant;
  runnerUp: CeremonyParticipant;
  secondRunnerUp: CeremonyParticipant;
  podium: CeremonyPodiumData;
  final: CeremonyFinalData;
  closing: (typeof CHAMPIONS_PROTOTYPE)["closing"];
};

/** Verified tournament third place — family sweep maps to England (Siyana). */
const VERIFIED_THIRD_PLACE_TEAM = "england";

function toCeremonyParticipant(
  row: TrackerRow,
  positionLabel: string,
): CeremonyParticipant {
  return {
    name: row.participant?.name ?? "Unknown",
    team: row.team?.name ?? "Unknown",
    flagEmoji: row.team?.flag_emoji ?? "⚽",
    positionLabel,
  };
}

function buildPodiumEntry(
  participant: CeremonyParticipant,
  place: 1 | 2 | 3,
): CeremonyPodiumEntry {
  const prototype =
    place === 1
      ? CHAMPIONS_PROTOTYPE.podium.first
      : place === 2
        ? CHAMPIONS_PROTOTYPE.podium.second
        : CHAMPIONS_PROTOTYPE.podium.third;

  const placeLabel =
    place === 1
      ? "🥇 1ST PLACE"
      : place === 2
        ? "🥈 2ND PLACE"
        : "🥉 3RD PLACE";

  const roleLabel =
    place === 1
      ? "WORLD CUP CHAMPION"
      : place === 2
        ? "RUNNER-UP"
        : "THIRD PLACE";

  return {
    ...prototype,
    team: participant.team,
    flagEmoji: participant.flagEmoji,
    placeLabel,
    roleLabel,
    participantName: participant.name,
  };
}

/**
 * Builds production ceremony participants from verified tracker rows.
 * Third place uses the verified England assignment (tournament bronze medalist).
 */
export function buildCeremonyDataFromRows(
  rows: TrackerRow[],
): ChampionsCeremonyData | null {
  const winner = rows.find((row) => row.team_status.status === "winner");
  if (!winner) return null;

  const runnerUpRow = rows.find(
    (row) =>
      row.team_status.status === "eliminated" &&
      normalizeStage(row.team_status.stage) === "Final",
  );
  if (!runnerUpRow) return null;

  const thirdPlaceRow = rows.find(
    (row) => row.team?.name?.trim().toLowerCase() === VERIFIED_THIRD_PLACE_TEAM,
  );
  if (!thirdPlaceRow) return null;

  const champion = toCeremonyParticipant(winner, "Champion");
  const runnerUp = toCeremonyParticipant(runnerUpRow, "Runner-up");
  const secondRunnerUp = toCeremonyParticipant(thirdPlaceRow, "Third place");

  return {
    eventTitle: CHAMPIONS_PROTOTYPE.eventTitle,
    championHeading: CHAMPIONS_PROTOTYPE.championHeading,
    championSubheading: CHAMPIONS_PROTOTYPE.championSubheading,
    champion,
    runnerUp,
    secondRunnerUp,
    podium: {
      first: buildPodiumEntry(champion, 1),
      second: buildPodiumEntry(runnerUp, 2),
      third: buildPodiumEntry(secondRunnerUp, 3),
    },
    final: {
      scoreLine: "SPAIN 1–0 ARGENTINA",
      note: "AET",
    },
    closing: CHAMPIONS_PROTOTYPE.closing,
  };
}
