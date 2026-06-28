"use client";

import { motion } from "framer-motion";
import {
  getNextStageChanceDisplay,
  type TrackerRow,
} from "@/lib/tracker";
import { VERIFIED_FAMILY_TEAM_STATUSES } from "@/lib/world-cup-verified-snapshot";
import { parseR32Opponent } from "@/lib/round-of-32-bracket";
import { NextStageChance } from "./NextStageChance";
import { revealTransition, useMotionSettings } from "./motion-utils";

const SNAPSHOT_BY_TEAM = new Map(
  VERIFIED_FAMILY_TEAM_STATUSES.map((t) => [t.teamName.toLowerCase(), t]),
);

function formatNextMatch(row: TrackerRow): string | null {
  const teamName = row.team?.name ?? "";
  const snapshot = SNAPSHOT_BY_TEAM.get(teamName.toLowerCase());
  if (!snapshot || row.team_status.status === "eliminated") return null;

  const opponent = parseR32Opponent(
    snapshot.nextFixture,
    snapshot.r32OpponentLocked,
    snapshot.r32KickoffUk,
  );
  if (!opponent || opponent.kind !== "confirmed") return null;

  const parts = [`vs ${opponent.label}`];
  if (opponent.date) parts.push(opponent.date);
  if (opponent.time) parts.push(opponent.time);
  return parts.join(" · ");
}

type AliveTeamsSectionProps = {
  alive: TrackerRow[];
  className?: string;
};

export function AliveTeamsSection({
  alive,
  className = "",
}: AliveTeamsSectionProps) {
  const { reduceMotion, intensity } = useMotionSettings();

  return (
    <motion.section
      className={["wc-card rounded-3xl p-6", className].join(" ")}
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={revealTransition(0.6, reduceMotion)}
    >
      <div className="flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-bebas)] text-4xl text-wc-gold">
          Still Alive
        </h2>
        <span className="rounded-full bg-wc-gold/10 px-4 py-1 text-sm text-wc-gold">
          {alive.length} teams
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {alive.map((row, i) => {
          const nextMatch = formatNextMatch(row);
          return (
          <motion.div
            key={`${row.team?.id ?? i}`}
            className="tracker-alive-card rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-lg"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.45,
              delay: reduceMotion ? 0 : 0.65 + i * 0.05 * intensity,
            }}
            whileHover={
              reduceMotion
                ? undefined
                : { y: -8, scale: 1.02, transition: { duration: 0.25 } }
            }
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-5xl">{row.team?.flag_emoji}</p>
                <h3 className="mt-3 font-[family-name:var(--font-bebas)] text-3xl text-white">
                  {row.team?.name}
                </h3>
                <p className="text-sm text-white/50">
                  Owned by {row.participant?.name}
                </p>
              </div>

              <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                Alive
              </span>
            </div>

            <div className="mt-5 rounded-xl bg-wc-navy/70 px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-white/40">
                Current Stage
              </p>
              <p className="font-[family-name:var(--font-bebas)] text-2xl text-wc-gold">
                {row.team_status.stage}
              </p>
              {nextMatch && (
                <p className="mt-2 text-sm text-white/70">
                  Next: {nextMatch}
                </p>
              )}
              <NextStageChance
                chance={getNextStageChanceDisplay(row)}
                compact
              />
            </div>
          </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
