"use client";

import { motion } from "framer-motion";
import type { NextTournamentFixture } from "@/lib/tournament-progress";
import { revealTransition, useMotionSettings } from "./motion-utils";

type NextFixtureSummaryProps = {
  fixture: NextTournamentFixture;
  className?: string;
};

export function NextFixtureSummary({
  fixture,
  className = "",
}: NextFixtureSummaryProps) {
  const { reduceMotion } = useMotionSettings();

  return (
    <motion.p
      className={[
        "text-center text-sm text-white/60 md:text-base",
        className,
      ].join(" ")}
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={revealTransition(0.18, reduceMotion)}
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-wc-gold/70 md:text-xs">
        Next match
      </span>
      <span className="mt-1 block font-[family-name:var(--font-bebas)] text-xl tracking-wide text-white md:text-2xl">
        {fixture.label}
      </span>
    </motion.p>
  );
}
