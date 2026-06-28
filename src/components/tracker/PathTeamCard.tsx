import type { TrackerRow } from "@/lib/tracker";
import { getNextStageChanceDisplay } from "@/lib/tracker";
import { BracketFlagCircle } from "./bracket/BracketNodes";
import { NextStageChance } from "./NextStageChance";

type PathTeamCardProps = {
  row: TrackerRow;
};

export function PathTeamCard({ row }: PathTeamCardProps) {
  const status = row.team_status.status;
  const isWinner = status === "winner";
  const isEliminated = status === "eliminated";
  const isAlive = !isWinner && !isEliminated;

  return (
    <div
      className={[
        "rounded-xl border px-3 py-3 transition-all sm:px-4",
        isAlive &&
          "tracker-alive-pulse border-wc-gold/70 bg-wc-gold/5 opacity-100",
        isEliminated &&
          "border-white/10 bg-white/[0.02] opacity-50 grayscale",
        isWinner &&
          "tracker-winner-glow border-wc-gold bg-gradient-to-br from-wc-gold/20 to-wc-gold/5",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <BracketFlagCircle
              flag={row.team?.flag_emoji ?? "⚽"}
              compact
            />
            {isWinner && (
              <span className="text-xl" aria-hidden>
                🏆
              </span>
            )}
          </div>
          <p className="mt-1 truncate font-[family-name:var(--font-bebas)] text-xl tracking-wide text-white sm:text-2xl">
            {row.team?.name}
          </p>
          <p
            className={[
              "truncate text-sm",
              isWinner
                ? "font-semibold text-wc-gold-light"
                : "text-white/50",
            ].join(" ")}
          >
            {isWinner ? (
              <>
                Champion:{" "}
                <span className="text-wc-gold">{row.participant?.name}</span>
              </>
            ) : (
              <>Owned by {row.participant?.name}</>
            )}
          </p>
          <NextStageChance
            chance={getNextStageChanceDisplay(row)}
            compact
          />
        </div>

        {isEliminated && (
          <span className="shrink-0 rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-300 sm:text-xs">
            Out
          </span>
        )}
        {isAlive && (
          <span className="shrink-0 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300 sm:text-xs">
            Alive
          </span>
        )}
      </div>
    </div>
  );
}
