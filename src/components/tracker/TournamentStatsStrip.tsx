"use client";

import { motion } from "framer-motion";
import type { TournamentStats } from "@/lib/tracker";
import { revealTransition, useMotionSettings } from "./motion-utils";

type TournamentStatsStripProps = {
  stats: TournamentStats;
};

export function TournamentStatsStrip({ stats }: TournamentStatsStripProps) {
  const { reduceMotion } = useMotionSettings();

  return (
    <motion.section
      className="wc-card mt-8 rounded-2xl p-5 sm:p-6"
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={revealTransition(0.15, reduceMotion)}
    >
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
