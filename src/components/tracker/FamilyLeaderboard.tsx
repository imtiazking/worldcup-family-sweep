"use client";

import { motion } from "framer-motion";
import type { LeaderboardEntry } from "@/lib/tracker";
import { NextStageChance } from "./NextStageChance";
import { revealTransition, useMotionSettings } from "./motion-utils";

type FamilyLeaderboardProps = {
  entries: LeaderboardEntry[];
};

function podiumClass(rank: number): string {
  switch (rank) {
    case 1:
      return "tracker-podium-gold border-yellow-400/50 bg-gradient-to-r from-yellow-500/15 via-wc-gold/10 to-yellow-500/5 sm:-translate-y-1";
    case 2:
      return "tracker-podium-silver border-slate-300/40 bg-gradient-to-r from-slate-400/10 to-white/5";
    case 3:
      return "tracker-podium-bronze border-amber-600/40 bg-gradient-to-r from-amber-700/10 to-amber-900/5";
    default:
      return "border-white/10 bg-white/[0.03]";
  }
}

function rankBadgeClass(rank: number): string {
  switch (rank) {
    case 1:
      return "bg-yellow-500/25 text-yellow-200 ring-2 ring-yellow-400/40";
    case 2:
      return "bg-slate-400/20 text-slate-200 ring-2 ring-slate-300/30";
    case 3:
      return "bg-amber-700/25 text-amber-200 ring-2 ring-amber-600/35";
    default:
      return "bg-white/5 text-white/50";
  }
}

export function FamilyLeaderboard({ entries }: FamilyLeaderboardProps) {
  const { reduceMotion, intensity } = useMotionSettings();

  return (
    <motion.section
      className="wc-card mt-12 rounded-3xl p-6 sm:p-8"
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={revealTransition(0.45, reduceMotion)}
    >
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
        {entries.map((entry, index) => (
          <motion.li
            key={`${entry.participantName}-${entry.teamName}`}
            className={[
              "flex items-center gap-4 rounded-2xl border px-4 py-4 transition",
              podiumClass(entry.rank),
              entry.status === "winner" && "tracker-winner-glow",
            ]
              .filter(Boolean)
              .join(" ")}
            initial={reduceMotion ? false : { opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.5,
              delay: reduceMotion ? 0 : 0.5 + index * 0.06 * intensity,
              ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={
              reduceMotion || entry.rank > 3
                ? undefined
                : { scale: 1.01, y: -2 }
            }
          >
            <span
              className={[
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-[family-name:var(--font-bebas)] text-xl",
                rankBadgeClass(entry.rank),
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
              <NextStageChance chance={entry.nextStageChance} compact />
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
          </motion.li>
        ))}
      </ol>
    </motion.section>
  );
}
