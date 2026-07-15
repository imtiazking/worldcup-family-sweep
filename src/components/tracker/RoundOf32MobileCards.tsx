import { formatCompletedFixtureScore } from "@/lib/world-cup-verified-snapshot";
import type { SweepBracketData } from "@/lib/round-of-32-bracket";
import { BracketTeamNode } from "./bracket/BracketNodes";
import { ExternalAdvancerCard } from "./bracket/ExternalAdvancerCard";
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
      {entry.status === "through" && entry.pendingLine && (
        <p className="mt-3 border-t border-slate-200 pt-3 text-xs text-slate-600">
          {formatBracketPendingSummary(entry.pendingLine)}
        </p>
      )}
      {entry.status === "pending" && entry.pendingLine && (
        <p className="mt-3 border-t border-amber-100 pt-3 text-xs text-amber-900/90">
          Pending — {formatBracketPendingSummary(entry.pendingLine)}
        </p>
      )}
      {entry.status === "eliminated" && entry.pendingLine && (
        <p className="mt-3 border-t border-red-100 pt-3 text-xs text-red-900/90">
          {formatBracketPendingSummary(entry.pendingLine)}
        </p>
      )}
    </article>
  );
}

export function RoundOf32MobileCards({ data }: RoundOf32MobileCardsProps) {
  const allEntries = [
    ...data.through,
    ...data.finalQualified,
    ...data.semiFinalQualified,
    ...data.quarterFinalQualified,
    ...data.roundOf16Qualified,
    ...data.pending,
    ...data.eliminated,
  ];

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
              />
            ))}
          </div>
        </div>
      )}

      {data.finalMatchup && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            World Cup Final
          </p>
          <article className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-center shadow-sm">
            <p className="font-[family-name:var(--font-bebas)] text-3xl tracking-wide text-slate-900">
              {data.finalMatchup.homeTeam} vs {data.finalMatchup.awayTeam}
            </p>
            {data.finalMatchup.homeParticipant &&
              data.finalMatchup.awayParticipant && (
                <p className="mt-2 text-sm font-medium text-slate-700">
                  {data.finalMatchup.homeParticipant} vs{" "}
                  {data.finalMatchup.awayParticipant}
                </p>
              )}
            <p className="mt-3 text-xs text-slate-600">
              {data.finalMatchup.dateUk} · {data.finalMatchup.timeUk} UK
            </p>
            {data.finalMatchup.venue && (
              <p className="mt-1 text-xs text-slate-500">
                {data.finalMatchup.venue}
              </p>
            )}
          </article>
        </div>
      )}

      {data.finalQualified.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            Finalists
          </p>
          <div className="space-y-3">
            {data.finalQualified.map((entry) => (
              <MobileMatchCard key={entry.row.team?.id} entry={entry} />
            ))}
          </div>
        </div>
      )}

      {data.completedSemiFinals.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            Semi-finals complete
          </p>
          <div className="space-y-3">
            {data.completedSemiFinals.map((fixture) => (
              <article
                key={`${fixture.homeTeam}-${fixture.awayTeam}`}
                className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-center shadow-sm"
              >
                <p className="font-[family-name:var(--font-bebas)] text-2xl tracking-wide text-slate-800">
                  {formatCompletedFixtureScore(fixture)}
                </p>
              </article>
            ))}
          </div>
        </div>
      )}

      {data.semiFinalQualified.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            Semi-final qualified
          </p>
          <div className="space-y-3">
            {data.semiFinalQualified.map((entry) => (
              <MobileMatchCard key={entry.row.team?.id} entry={entry} />
            ))}
          </div>
        </div>
      )}

      {data.completedQuarterFinals.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            Quarter-finals complete
          </p>
          <div className="space-y-3">
            {data.completedQuarterFinals.map((fixture) => (
              <article
                key={`${fixture.homeTeam}-${fixture.awayTeam}`}
                className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-center shadow-sm"
              >
                <p className="font-[family-name:var(--font-bebas)] text-2xl tracking-wide text-slate-800">
                  {formatCompletedFixtureScore(fixture)}
                </p>
              </article>
            ))}
          </div>
        </div>
      )}

      {data.quarterFinalQualified.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            Quarter-final qualified
          </p>
          <div className="space-y-3">
            {data.quarterFinalQualified.map((entry) => (
              <MobileMatchCard key={entry.row.team?.id} entry={entry} />
            ))}
          </div>
        </div>
      )}

      {data.roundOf16Qualified.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            Round of 16 qualified
          </p>
          <div className="space-y-3">
            {data.roundOf16Qualified.map((entry) => (
              <MobileMatchCard key={entry.row.team?.id} entry={entry} />
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

      {data.externalAdvancers.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            Official tournament — advanced
          </p>
          <div className="space-y-3">
            {data.externalAdvancers.map((advancer) => (
              <ExternalAdvancerCard key={advancer.teamName} advancer={advancer} />
            ))}
          </div>
        </div>
      )}

      {allEntries.length === 0 &&
        data.externalAdvancers.length === 0 && (
        <p className="py-8 text-center text-sm text-slate-400">
          No sweep teams to display yet.
        </p>
      )}
    </div>
  );
}
