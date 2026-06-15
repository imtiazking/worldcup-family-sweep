import type { TournamentStats } from "@/lib/tracker";

type TournamentStatsStripProps = {
  stats: TournamentStats;
};

export function TournamentStatsStrip({ stats }: TournamentStatsStripProps) {
  return (
    <section className="wc-card mt-8 rounded-2xl p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="text-center sm:text-left">
          <p className="text-xs uppercase tracking-wider text-white/40">
            Alive Teams
          </p>
          <p className="font-[family-name:var(--font-bebas)] text-4xl text-emerald-300">
            {stats.alive}
          </p>
        </div>

        <div className="text-center">
          <p className="text-xs uppercase tracking-wider text-white/40">
            Eliminated Teams
          </p>
          <p className="font-[family-name:var(--font-bebas)] text-4xl text-red-300">
            {stats.eliminated}
          </p>
        </div>

        <div className="text-center sm:text-right">
          <p className="text-xs uppercase tracking-wider text-white/40">
            Tournament Progress
          </p>
          <p className="font-[family-name:var(--font-bebas)] text-4xl text-wc-gold">
            {stats.progressPercent}%
          </p>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex justify-between text-xs text-white/40">
          <span>Elimination progress</span>
          <span>
            {stats.eliminated} of {stats.total} teams
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-wc-navy-light">
          <div
            className="h-full rounded-full bg-gradient-to-r from-wc-gold-dark via-wc-gold to-wc-gold-light transition-all duration-700"
            style={{ width: `${stats.progressPercent}%` }}
          />
        </div>
      </div>
    </section>
  );
}
