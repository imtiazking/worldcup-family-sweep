"use client";

import { motion } from "framer-motion";
import type { TournamentStats } from "@/lib/tracker";
import { revealTransition, useMotionSettings } from "./motion-utils";

type TournamentStatsStripProps = {
  stats: TournamentStats;
  className?: string;
};

export function TournamentStatsStrip({
  stats,
  className = "",
}: TournamentStatsStripProps) {
  const { reduceMotion } = useMotionSettings();

  return (
    <motion.section
      className={[
        "wc-card mt-3 rounded-2xl p-4 max-md:mt-3 md:mt-8 md:p-5 sm:p-6",
        className,
      ].join(" ")}
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={revealTransition(0.15, reduceMotion)}
    >
      <div className="grid gap-3 max-md:gap-2 sm:grid-cols-3 sm:gap-4">
        <div className="text-center sm:text-left">
          <p className="text-[10px] uppercase tracking-wider text-white/40 md:text-xs">
            Alive Teams
          </p>
          <p className="font-[family-name:var(--font-bebas)] text-3xl text-emerald-300 md:text-4xl">
            {stats.alive}
          </p>
        </div>

        <div className="text-center">
          <p className="text-[10px] uppercase tracking-wider text-white/40 md:text-xs">
            Eliminated Teams
          </p>
          <p className="font-[family-name:var(--font-bebas)] text-3xl text-red-300 md:text-4xl">
            {stats.eliminated}
          </p>
        </div>

        <div className="text-center sm:text-right">
          <p className="text-[10px] uppercase tracking-wider text-white/40 md:text-xs">
            Tournament Progress
          </p>
          <p className="font-[family-name:var(--font-bebas)] text-3xl text-wc-gold md:text-4xl">
            {stats.progressPercent}%
          </p>
        </div>
      </div>

      <div className="mt-3 max-md:mt-2 md:mt-5">
        <div className="mb-2 flex justify-between text-xs text-white/40">
          <span>Elimination progress</span>
          <span>
            {stats.eliminated} of {stats.total} teams
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-wc-navy-light">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-wc-gold-dark via-wc-gold to-wc-gold-light"
            initial={{ width: reduceMotion ? `${stats.progressPercent}%` : "0%" }}
            animate={{ width: `${stats.progressPercent}%` }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 1.4, delay: 0.4, ease: [0.22, 1, 0.36, 1] }
            }
          />
        </div>
      </div>
    </motion.section>
  );
}
