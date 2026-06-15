import type { LeaderboardEntry } from "@/lib/tracker";

type FamilyLeaderboardProps = {
  entries: LeaderboardEntry[];
};

export function FamilyLeaderboard({ entries }: FamilyLeaderboardProps) {
  return (
    <section className="wc-card mt-12 rounded-3xl p-6 sm:p-8">
      <div className="text-center sm:text-left">
        <p className="text-xs uppercase tracking-[0.3em] text-wc-gold/60">
          Family Rankings
        </p>
        <h2 className="font-[family-name:var(--font-bebas)] text-4xl tracking-wide text-wc-gold sm:text-5xl">
          🏆 Best Position
        </h2>
        <p className="mt-2 text-sm text-white/50">
          Sorted by deepest tournament stage reached.
        </p>
      </div>

      <ol className="mt-8 space-y-3">
        {entries.map((entry) => (
          <li
            key={`${entry.participantName}-${entry.teamName}`}
            className={[
              "flex items-center gap-4 rounded-2xl border px-4 py-4 transition",
              entry.rank === 1
                ? "border-wc-gold/40 bg-wc-gold/10"
                : "border-white/10 bg-white/[0.03]",
              entry.status === "winner" && "tracker-winner-glow",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span
              className={[
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-[family-name:var(--font-bebas)] text-xl",
                entry.rank === 1
                  ? "bg-wc-gold/20 text-wc-gold"
                  : "bg-white/5 text-white/50",
              ].join(" ")}
            >
              {entry.rank}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate font-[family-name:var(--font-bebas)] text-xl tracking-wide text-white sm:text-2xl">
                {entry.participantName}
                <span className="text-white/40"> — </span>
                <span className="text-wc-gold-light">
                  {entry.teamFlag} {entry.teamName}
                </span>
              </p>
              <p className="text-sm text-white/50">{entry.stage}</p>
            </div>

            {entry.status === "winner" && (
              <span className="shrink-0 text-2xl" aria-label="Champion">
                🏆
              </span>
            )}
            {entry.status === "active" && (
              <span className="shrink-0 rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                Alive
              </span>
            )}
            {entry.status === "eliminated" && (
              <span className="shrink-0 rounded-full bg-red-400/10 px-3 py-1 text-xs text-red-300">
                Out
              </span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
