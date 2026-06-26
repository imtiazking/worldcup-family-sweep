import type { TrackerRow } from "@/lib/tracker";
import type { ConfirmedMutualFixture } from "@/lib/round-of-32-bracket";

export type StageLadderItem =
  | { kind: "fixture"; fixture: ConfirmedMutualFixture; sortKey: string }
  | { kind: "team"; row: TrackerRow; sortKey: string };

export function buildRoundOf32LadderItems(
  stageTeams: TrackerRow[],
  confirmedFixtures: ConfirmedMutualFixture[],
): StageLadderItem[] {
  const pairedNames = new Set(
    confirmedFixtures.flatMap((f) => [
      f.primary.row.team?.name?.toLowerCase() ?? "",
      f.secondary.row.team?.name?.toLowerCase() ?? "",
    ]),
  );

  const items: StageLadderItem[] = [
    ...confirmedFixtures.map((fixture) => ({
      kind: "fixture" as const,
      fixture,
      sortKey: fixture.primary.row.team?.name ?? "",
    })),
    ...stageTeams
      .filter((row) => !pairedNames.has(row.team?.name?.toLowerCase() ?? ""))
      .map((row) => ({
        kind: "team" as const,
        row,
        sortKey: row.team?.name ?? "",
      })),
  ];

  items.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  return items;
}
