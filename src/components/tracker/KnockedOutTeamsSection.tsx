"use client";

import { motion } from "framer-motion";
import {
  getNextStageChanceDisplay,
  type TrackerRow,
} from "@/lib/tracker";
import { NextStageChance } from "./NextStageChance";
import { revealTransition, useMotionSettings } from "./motion-utils";

type KnockedOutTeamsSectionProps = {
  eliminated: TrackerRow[];
  className?: string;
};

export function KnockedOutTeamsSection({
  eliminated,
  className = "",
}: KnockedOutTeamsSectionProps) {
  const { reduceMotion, intensity } = useMotionSettings();

  return (
    <motion.section
      className={["wc-card rounded-3xl p-6", className].join(" ")}
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={revealTransition(0.6, reduceMotion)}
    >
      <div className="flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-bebas)] text-4xl text-red-300">
          Knocked Out
        </h2>
        <span className="rounded-full bg-red-400/10 px-4 py-1 text-sm text-red-300">
          {eliminated.length}
        </span>
      </div>

      <div className="mt-6 space-y-3">
        {eliminated.length === 0 && (
          <p className="rounded-2xl bg-white/[0.04] p-5 text-white/50">
            No teams knocked out yet.
          </p>
        )}

        {eliminated.map((row, i) => (
          <motion.div
            key={`${row.team?.id ?? i}`}
            className="flex items-center justify-between gap-3 rounded-2xl border border-red-400/10 bg-red-400/[0.04] px-4 py-4"
            initial={
              reduceMotion
                ? { opacity: 0.7, filter: "grayscale(1)" }
                : { opacity: 0, filter: "grayscale(1)" }
            }
            animate={{ opacity: 0.7, filter: "grayscale(1)" }}
            transition={{
              duration: reduceMotion ? 0 : 0.55,
              delay: reduceMotion ? 0 : 0.7 + i * 0.05 * intensity,
            }}
          >
            <div className="min-w-0 flex-1">
              <p className="font-[family-name:var(--font-bebas)] text-2xl text-white">
                {row.team?.flag_emoji} {row.team?.name}
              </p>
              <p className="text-sm text-white/40">
                {row.participant?.name}
              </p>
              <NextStageChance
                chance={getNextStageChanceDisplay(row)}
                compact
              />
            </div>
            <span className="tracker-eliminated-badge shrink-0 rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-300">
              {row.team_status.stage}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
