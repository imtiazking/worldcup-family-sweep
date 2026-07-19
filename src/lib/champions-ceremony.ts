import {
  buildLeaderboard,
  normalizeStage,
  type TrackerRow,
} from "@/lib/tracker";
import type { CeremonyParticipant } from "@/design-lab/champions/types";
import { CHAMPIONS_PROTOTYPE } from "@/design-lab/champions/constants";

export type ChampionsCeremonyData = {
  eventTitle: string;
  championHeading: string;
  championSubheading: string;
  champion: CeremonyParticipant;
  runnerUp: CeremonyParticipant;
  secondRunnerUp: CeremonyParticipant;
  closing: (typeof CHAMPIONS_PROTOTYPE)["closing"];
};

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

/**
 * Builds production ceremony participants from verified tracker rows.
 * Second runner-up = highest-ranked eliminated semi-finalist (family sweep podium).
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

  const thirdPlaceEntry = buildLeaderboard(rows).find(
    (entry) =>
      entry.status === "eliminated" && entry.stage === "Semi Final",
  );
  const thirdPlaceRow = thirdPlaceEntry
    ? rows.find(
        (row) =>
          row.participant?.name === thirdPlaceEntry.participantName &&
          row.team?.name === thirdPlaceEntry.teamName,
      )
    : undefined;

  if (!thirdPlaceRow) return null;

  return {
    eventTitle: CHAMPIONS_PROTOTYPE.eventTitle,
    championHeading: CHAMPIONS_PROTOTYPE.championHeading,
    championSubheading: CHAMPIONS_PROTOTYPE.championSubheading,
    champion: toCeremonyParticipant(winner, "Champion"),
    runnerUp: toCeremonyParticipant(runnerUpRow, "Runner-up"),
    secondRunnerUp: toCeremonyParticipant(
      thirdPlaceRow,
      "Second runner-up",
    ),
    closing: CHAMPIONS_PROTOTYPE.closing,
  };
}
