import type { SweepBracketData } from "@/lib/round-of-32-bracket";
import { BracketTeamNode } from "./bracket/BracketNodes";
import {
  BracketMatchOpponent,
  formatBracketPendingSummary,
} from "./bracket/BracketMatchOpponent";

type RoundOf32MobileCardsProps = {
  data: SweepBracketData;
};

function MobileMatchCard({
  entry,
  through = [],
  showOpponent = false,
}: {
  entry: SweepBracketData["through"][number];
  through?: SweepBracketData["through"];
  showOpponent?: boolean;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm">
      <BracketTeamNode entry={entry} compact />
      {showOpponent && entry.r32Opponent && (
        <div className="mt-3 space-y-2 border-t border-slate-200 pt-3">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
            vs
          </span>
          <BracketMatchOpponent
            entry={entry}
            through={through}
            align="left"
            compact
          />
        </div>
      )}
      {entry.status === "pending" && entry.pendingLine && (
        <p className="mt-3 border-t border-amber-100 pt-3 text-xs text-amber-900/90">
          Pending — {formatBracketPendingSummary(entry.pendingLine)}
        </p>
      )}
    </article>
  );
}

export function RoundOf32MobileCards({ data }: RoundOf32MobileCardsProps) {
  const allEntries = [...data.through, ...data.pending, ...data.eliminated];

  return (
    <div className="space-y-6 px-4 py-6">
      {data.through.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            Through to Round of 32
          </p>
          <div className="space-y-3">
            {data.through.map((entry) => (
              <MobileMatchCard
                key={entry.row.team?.id}
                entry={entry}
                through={data.through}
                showOpponent
              />
            ))}
          </div>
        </div>
      )}

      {data.pending.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            Still in group stage
          </p>
          <div className="space-y-3">
            {data.pending.map((entry) => (
              <MobileMatchCard key={entry.row.team?.id} entry={entry} />
            ))}
          </div>
        </div>
      )}

      {data.eliminated.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            Eliminated
          </p>
          <div className="space-y-3">
            {data.eliminated.map((entry) => (
              <MobileMatchCard key={entry.row.team?.id} entry={entry} />
            ))}
          </div>
        </div>
      )}

      {allEntries.length === 0 && (
        <p className="py-8 text-center text-sm text-slate-400">
          No sweep teams to display yet.
        </p>
      )}
    </div>
  );
}
