"use client";

import { AliveTeamsSection } from "./AliveTeamsSection";
import { KnockedOutTeamsSection } from "./KnockedOutTeamsSection";
import type { TrackerRow } from "@/lib/tracker";

type TrackerTeamCardsProps = {
  alive: TrackerRow[];
  eliminated: TrackerRow[];
};

/** Desktop side-by-side alive + knocked out layout */
export function TrackerTeamCards({
  alive,
  eliminated,
}: TrackerTeamCardsProps) {
  return (
    <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
      <AliveTeamsSection alive={alive} />
      <KnockedOutTeamsSection eliminated={eliminated} />
    </div>
  );
}
