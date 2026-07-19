"use client";

import { motion } from "framer-motion";
import type { NextTournamentFixture } from "@/lib/tournament-progress";
import { revealTransition, useMotionSettings } from "./motion-utils";
import { LiveGoalEvents } from "./LiveGoalEvents";

type NextFixtureSummaryProps = {
  fixture: NextTournamentFixture;
  className?: string;
};

export function NextFixtureSummary({
  fixture,
  className = "",
}: NextFixtureSummaryProps) {
  const { reduceMotion } = useMotionSettings();
  const isLive = fixture.isLive === true;

  return (
    <motion.div
      className={[
        "text-center text-sm text-white/60 md:text-base",
        className,
      ].join(" ")}
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={revealTransition(0.18, reduceMotion)}
    >
      <div className="flex flex-wrap items-center justify-center gap-2">
        {isLive && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-200">
            <span className="premium-live-dot h-1.5 w-1.5 rounded-full bg-red-500" />
            LIVE
          </span>
        )}
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-wc-gold/70 md:text-xs">
          {isLive ? "World Cup Final Live" : "Next match"}
        </span>
      </div>
      <span className="mt-1 block font-[family-name:var(--font-bebas)] text-xl tracking-wide text-white md:text-2xl">
        {isLive
          ? `${fixture.home} ${fixture.scoreHome ?? 0}–${fixture.scoreAway ?? 0} ${fixture.away}`
          : fixture.label}
      </span>
      {isLive && (
        <>
          <span className="mt-1 block text-xs text-white/55">
            Extra time in progress
          </span>
          {fixture.phaseSummary && (
            <span className="mt-0.5 block text-xs font-medium text-white/65">
              {fixture.phaseSummary}
            </span>
          )}
          <span className="mt-0.5 block text-xs text-white/45">
            {fixture.scoreAfter90Home ?? 0}–{fixture.scoreAfter90Away ?? 0} after
            90 minutes
          </span>
          <LiveGoalEvents
            events={fixture.matchEvents ?? []}
            className="mt-1 space-y-0.5"
            itemClassName="text-xs text-white/50"
          />
          {fixture.matchNote && (
            <span className="mt-1 block text-xs text-white/40">
              {fixture.matchNote}
            </span>
          )}
        </>
      )}
    </motion.div>
  );
}
