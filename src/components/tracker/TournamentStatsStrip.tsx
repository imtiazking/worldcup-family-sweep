"use client";

import { motion } from "framer-motion";
import type { TournamentStats } from "@/lib/tracker";
import {
  formatPhaseStatus,
  type PhaseStatus,
} from "@/lib/tournament-progress";
import { revealTransition, useMotionSettings } from "./motion-utils";

type TournamentStatsStripProps = {
  stats: TournamentStats;
  className?: string;
};

const PHASE_STATUS_STYLES: Record<PhaseStatus, string> = {
  complete: "text-emerald-300",
  in_progress: "text-wc-gold",
  pending: "text-white/35",
};

const PHASE_DOT_STYLES: Record<PhaseStatus, string> = {
  complete: "bg-emerald-400 ring-emerald-400/30",
  in_progress: "bg-wc-gold ring-wc-gold/40 animate-pulse",
  pending: "bg-white/20 ring-white/10",
};

function PhaseRow({
  label,
  status,
}: {
  label: string;
  status: PhaseStatus;
}) {
  return (
    <li className="flex items-center justify-between gap-3 text-sm">
      <span className="text-white/70">{label}</span>
      <span
        className={[
          "inline-flex items-center gap-2 font-medium",
          PHASE_STATUS_STYLES[status],
        ].join(" ")}
      >
        <span
          className={[
            "h-2 w-2 shrink-0 rounded-full ring-2",
            PHASE_DOT_STYLES[status],
          ].join(" ")}
          aria-hidden
        />
        {formatPhaseStatus(status)}
      </span>
    </li>
  );
}

export function TournamentStatsStrip({
  stats,
  className = "",
}: TournamentStatsStripProps) {
  const { reduceMotion } = useMotionSettings();
  const progress = stats.tournamentProgress;
  const barPercent = progress.overallPercent;

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
          <p className="mt-0.5 text-[10px] text-white/35 md:text-xs">
            Family sweep still in
          </p>
        </div>

        <div className="text-center">
          <p className="text-[10px] uppercase tracking-wider text-white/40 md:text-xs">
            Eliminated Teams
          </p>
          <p className="font-[family-name:var(--font-bebas)] text-3xl text-red-300 md:text-4xl">
            {stats.eliminated}
          </p>
          <p className="mt-0.5 text-[10px] text-white/35 md:text-xs">
            Knocked out of sweep
          </p>
        </div>

        <div className="text-center sm:text-right">
          <p className="text-[10px] uppercase tracking-wider text-white/40 md:text-xs">
            Tournament Progress
          </p>
          <p className="font-[family-name:var(--font-bebas)] text-3xl text-wc-gold md:text-4xl">
            {barPercent}%
          </p>
          <p className="mt-0.5 text-[10px] text-white/35 md:text-xs">
            Knockout calendar
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-wc-gold/20 bg-wc-navy/50 p-4 md:mt-5 md:p-5">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-wc-gold/80 md:text-xs">
              Tournament Progress
            </p>
            <p className="mt-1 text-sm text-white/50">
              Current stage:{" "}
              <span className="font-medium text-wc-gold">
                {progress.currentStageLabel}
              </span>
            </p>
          </div>
          <p className="text-xs text-white/40 sm:text-right">
            Group stage:{" "}
            <span className="text-emerald-300">
              {progress.groupStagePercent}% complete
            </span>
          </p>
        </div>

        <ul className="space-y-2.5 border-b border-white/10 pb-4">
          {progress.phases.map((phase) => (
            <PhaseRow
              key={phase.id}
              label={phase.label}
              status={phase.status}
            />
          ))}
        </ul>

        <div className="mt-4">
          <div className="mb-2 flex justify-between text-xs text-white/40">
            <span>Tournament progress</span>
            <span>{progress.progressCaption}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-wc-navy-light">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-wc-gold-dark via-wc-gold to-wc-gold-light"
              initial={{ width: reduceMotion ? `${barPercent}%` : "0%" }}
              animate={{ width: `${barPercent}%` }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 1.4, delay: 0.4, ease: [0.22, 1, 0.36, 1] }
              }
            />
          </div>
        </div>
      </div>
    </motion.section>
  );
}
