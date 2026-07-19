import type { FinalMatchupData } from "@/lib/round-of-32-bracket";

type FinalMatchupSummaryProps = {
  matchup: FinalMatchupData;
  className?: string;
};

export function FinalMatchupSummary({
  matchup,
  className = "",
}: FinalMatchupSummaryProps) {
  const live = matchup.live;

  return (
    <article
      className={[
        "rounded-2xl border px-6 py-5 text-center",
        live
          ? "border-red-300/60 bg-red-50/80"
          : "border-amber-200 bg-amber-50/80",
        className,
      ].join(" ")}
    >
      {live ? (
        <>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="premium-live-dot h-2 w-2 rounded-full bg-red-500" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600">
              {live.statusLabel}
            </span>
          </div>
          <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-red-700/80">
            World Cup Final Live
          </p>
          <p className="mt-2 font-[family-name:var(--font-bebas)] text-3xl tracking-wide text-slate-900">
            {matchup.homeTeam} {live.scoreHome}–{live.scoreAway} {matchup.awayTeam}
          </p>
          {matchup.homeParticipant && matchup.awayParticipant && (
            <p className="mt-2 text-sm font-medium text-slate-700">
              {matchup.homeParticipant} vs {matchup.awayParticipant}
            </p>
          )}
          <p className="mt-3 text-xs font-medium text-slate-700">
            Extra time in progress
          </p>
          <p className="mt-1 text-xs text-slate-600">
            {live.scoreAfter90Home}–{live.scoreAfter90Away} after 90 minutes
          </p>
          {live.matchNote && (
            <p className="mt-2 text-xs text-slate-500">{live.matchNote}</p>
          )}
        </>
      ) : (
        <>
          <p className="font-[family-name:var(--font-bebas)] text-3xl tracking-wide text-slate-900">
            {matchup.homeTeam} vs {matchup.awayTeam}
          </p>
          {matchup.homeParticipant && matchup.awayParticipant && (
            <p className="mt-2 text-sm font-medium text-slate-700">
              {matchup.homeParticipant} vs {matchup.awayParticipant}
            </p>
          )}
          <p className="mt-3 text-xs text-slate-600">
            {matchup.dateUk} · {matchup.timeUk} UK
          </p>
          {matchup.venue && (
            <p className="mt-1 text-xs text-slate-500">{matchup.venue}</p>
          )}
        </>
      )}
    </article>
  );
}
