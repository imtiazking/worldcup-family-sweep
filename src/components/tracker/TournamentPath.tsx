import {
  TOURNAMENT_STAGES,
  groupRowsByStage,
  type TrackerRow,
} from "@/lib/tracker";
import { PathTeamCard } from "./PathTeamCard";
import { TrackerCelebration } from "./TrackerCelebration";

type TournamentPathProps = {
  rows: TrackerRow[];
  hasWinner: boolean;
};

export function TournamentPath({ rows, hasWinner }: TournamentPathProps) {
  const teamsByStage = groupRowsByStage(rows);

  return (
    <section className="wc-card relative mt-12 overflow-hidden rounded-3xl p-5 sm:p-8">
      {hasWinner && <TrackerCelebration />}

      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-wc-gold/60">
          Knockout Bracket
        </p>
        <h2 className="font-[family-name:var(--font-bebas)] text-4xl tracking-wide text-wc-gold sm:text-5xl">
          Tournament Path
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-white/50">
          Teams advance through each stage as the World Cup progresses.
        </p>
      </div>

      <div className="mx-auto mt-10 flex max-w-2xl flex-col items-center">
        {TOURNAMENT_STAGES.map((stage, index) => {
          const stageTeams = teamsByStage.get(stage) ?? [];
          const isWinnerStage = stage === "World Cup Winner";

          return (
            <div key={stage} className="flex w-full flex-col items-center">
              <div
                className={[
                  "w-full rounded-2xl border p-4 sm:p-5",
                  isWinnerStage
                    ? "border-wc-gold/40 bg-wc-gold/[0.06]"
                    : "border-white/10 bg-white/[0.03]",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3
                    className={[
                      "font-[family-name:var(--font-bebas)] text-2xl tracking-wide sm:text-3xl",
                      isWinnerStage ? "text-wc-gold-light" : "text-wc-gold",
                    ].join(" ")}
                  >
                    {isWinnerStage && (
                      <span className="mr-2" aria-hidden>
                        🏆
                      </span>
                    )}
                    {stage}
                  </h3>
                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/40">
                    {stageTeams.length}
                  </span>
                </div>

                {stageTeams.length > 0 ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {stageTeams.map((row, i) => (
                      <PathTeamCard
                        key={`${row.team?.id ?? row.participant?.id ?? i}`}
                        row={row}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-white/30">
                    {isWinnerStage
                      ? "Champion to be crowned..."
                      : "No teams at this stage"}
                  </p>
                )}
              </div>

              {index < TOURNAMENT_STAGES.length - 1 && (
                <div
                  className="flex flex-col items-center py-2 text-wc-gold/50"
                  aria-hidden
                >
                  <div className="h-4 w-px bg-gradient-to-b from-wc-gold/40 to-wc-gold/10" />
                  <span className="my-1 text-lg leading-none">↓</span>
                  <div className="h-4 w-px bg-gradient-to-b from-wc-gold/10 to-wc-gold/40" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
