"use client";

import { motion } from "framer-motion";
import type { TrackerRow } from "@/lib/tracker";
import { TrackerCelebration } from "./TrackerCelebration";
import { revealTransition, useMotionSettings } from "./motion-utils";

type WinnerBannerProps = {
  winner: TrackerRow;
};

export function WinnerBanner({ winner }: WinnerBannerProps) {
  const { reduceMotion } = useMotionSettings();

  return (
    <motion.section
      className="tracker-champion-banner relative mt-8 w-full overflow-hidden rounded-3xl border border-wc-gold/50 bg-gradient-to-br from-wc-gold/20 via-wc-navy-card to-wc-navy tracker-winner-glow"
      initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={revealTransition(0.1, reduceMotion)}
    >
      <TrackerCelebration burst />
      <div className="tracker-banner-sweep pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative z-10 px-6 py-10 text-center sm:px-12 sm:py-14">
        <p className="text-xs uppercase tracking-[0.4em] text-wc-gold-light sm:text-sm">
          🏆 World Cup Sweep Champion
        </p>

        <p className="mt-4 font-[family-name:var(--font-bebas)] text-5xl leading-none tracking-wide text-white sm:text-7xl">
          {winner.participant?.name}
        </p>

        <p className="tracker-trophy-icon-shimmer mt-4 text-5xl sm:text-6xl">
          {winner.team?.flag_emoji}
        </p>

        <p className="mt-2 font-[family-name:var(--font-bebas)] text-3xl tracking-wide text-wc-gold sm:text-5xl">
          {winner.team?.name}
        </p>

        <p className="mt-6 text-sm text-white/60 sm:text-base">
          Winner of the 2026 Family Sweep
        </p>
      </div>
    </motion.section>
  );
}
