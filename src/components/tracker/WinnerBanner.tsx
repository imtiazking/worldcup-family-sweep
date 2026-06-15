import type { TrackerRow } from "@/lib/tracker";
import { TrackerCelebration } from "./TrackerCelebration";

type WinnerBannerProps = {
  winner: TrackerRow;
};

export function WinnerBanner({ winner }: WinnerBannerProps) {
  return (
    <section className="relative mt-8 w-full overflow-hidden rounded-3xl border border-wc-gold/50 bg-gradient-to-br from-wc-gold/20 via-wc-navy-card to-wc-navy tracker-winner-glow">
      <TrackerCelebration />

      <div className="relative z-10 px-6 py-10 text-center sm:px-12 sm:py-14">
        <p className="text-xs uppercase tracking-[0.4em] text-wc-gold-light sm:text-sm">
          🏆 World Cup Sweep Champion
        </p>

        <p className="mt-4 font-[family-name:var(--font-bebas)] text-5xl leading-none tracking-wide text-white sm:text-7xl">
          {winner.participant?.name}
        </p>

        <p className="mt-4 text-5xl sm:text-6xl">{winner.team?.flag_emoji}</p>

        <p className="mt-2 font-[family-name:var(--font-bebas)] text-3xl tracking-wide text-wc-gold sm:text-5xl">
          {winner.team?.name}
        </p>

        <p className="mt-6 text-sm text-white/60 sm:text-base">
          Winner of the 2026 Family Sweep
        </p>
      </div>
    </section>
  );
}
