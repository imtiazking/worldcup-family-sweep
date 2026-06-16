import { getStageDepth, type TrackerRow } from "@/lib/tracker";

export type WheelPrizeId =
  | "doughnuts"
  | "drinks"
  | "chocolates"
  | "biscuits"
  | "pizza"
  | "mystery"
  | "football-snacks"
  | "nibbles";

export type WheelSegment = {
  id: WheelPrizeId;
  emoji: string;
  label: string;
  reveal: string;
  color: string;
};

export const WHEEL_SEGMENTS: WheelSegment[] = [
  {
    id: "doughnuts",
    emoji: "🍩",
    label: "Doughnuts",
    reveal: "BRING DOUGHNUTS",
    color: "#c9a227",
  },
  {
    id: "drinks",
    emoji: "🥤",
    label: "Drinks",
    reveal: "BRING DRINKS",
    color: "#e63946",
  },
  {
    id: "chocolates",
    emoji: "🍫",
    label: "Chocolates",
    reveal: "BRING CHOCOLATES",
    color: "#8b5a2b",
  },
  {
    id: "biscuits",
    emoji: "🍪",
    label: "Biscuits",
    reveal: "BRING BISCUITS",
    color: "#d4a574",
  },
  {
    id: "pizza",
    emoji: "🍕",
    label: "Pizza",
    reveal: "BRING PIZZA",
    color: "#e85d04",
  },
  {
    id: "mystery",
    emoji: "🎁",
    label: "Mystery Gift",
    reveal: "BRING A MYSTERY GIFT",
    color: "#9b5de5",
  },
  {
    id: "football-snacks",
    emoji: "⚽",
    label: "Football Snacks",
    reveal: "BRING FOOTBALL SNACKS",
    color: "#2a9d8f",
  },
  {
    id: "nibbles",
    emoji: "🥜",
    label: "Nibbles",
    reveal: "BRING NIBBLES",
    color: "#f4a261",
  },
];

export type LoserWheelResult = {
  id: string;
  participant_id: string;
  team_id: string;
  prize: string;
  spun_at: string;
};

export type LoserWheelResultRow = LoserWheelResult & {
  participantName: string;
  teamName: string;
  teamFlag: string;
  stage: string;
  segment: WheelSegment;
};

export function getSegmentByPrizeId(prizeId: string): WheelSegment | undefined {
  return WHEEL_SEGMENTS.find((s) => s.id === prizeId);
}

export function getSegmentIndex(prizeId: string): number {
  return WHEEL_SEGMENTS.findIndex((s) => s.id === prizeId);
}

export function pickRandomPrizeId(): WheelPrizeId {
  const index = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
  return WHEEL_SEGMENTS[index]?.id ?? "doughnuts";
}

/** Deepest-stage eliminated row without a wheel result — next to spin. */
export function getNextUnspunEliminated(
  eliminated: TrackerRow[],
  spunParticipantIds: Set<string>,
): TrackerRow | undefined {
  return [...eliminated]
    .filter((row) => row.participant?.id && !spunParticipantIds.has(row.participant.id))
    .sort((a, b) => {
      const depthDiff = getStageDepth(b) - getStageDepth(a);
      if (depthDiff !== 0) return depthDiff;
      const nameA = a.participant?.name ?? "";
      const nameB = b.participant?.name ?? "";
      return nameA.localeCompare(nameB);
    })[0];
}

export function enrichWheelResults(
  results: LoserWheelResult[],
  rows: TrackerRow[],
): LoserWheelResultRow[] {
  const rowByParticipant = new Map(
    rows
      .filter((r) => r.participant?.id)
      .map((r) => [r.participant!.id, r]),
  );

  return results
    .map((result) => {
      const row = rowByParticipant.get(result.participant_id);
      const segment =
        getSegmentByPrizeId(result.prize) ?? WHEEL_SEGMENTS[0]!;

      return {
        ...result,
        participantName: row?.participant?.name ?? "Unknown",
        teamName: row?.team?.name ?? "Unknown",
        teamFlag: row?.team?.flag_emoji ?? "⚽",
        stage: row?.team_status.stage ?? "Eliminated",
        segment,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.spun_at).getTime() - new Date(a.spun_at).getTime(),
    );
}

/** Rotation (deg) to land segment index under top pointer after `fullSpins`. */
export function getWheelRotationForSegment(
  segmentIndex: number,
  fullSpins: number,
): number {
  const segmentAngle = 360 / WHEEL_SEGMENTS.length;
  const segmentCenter = segmentIndex * segmentAngle + segmentAngle / 2;
  return fullSpins * 360 + (360 - segmentCenter);
}
