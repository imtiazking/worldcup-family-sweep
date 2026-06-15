"use client";

import { motion } from "framer-motion";
import type { TrackerRow } from "@/lib/tracker";
import { revealTransition, useMotionSettings } from "./motion-utils";

type TrackerTeamCardsProps = {
  alive: TrackerRow[];
  eliminated: TrackerRow[];
};

export function TrackerTeamCards({ alive, eliminated }: TrackerTeamCardsProps) {
  const { reduceMotion, intensity } = useMotionSettings();

  return (
    <motion.div
      className="mt-12 grid gap-6 lg:grid-cols-[1fr_0.8fr]"
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={revealTransition(0.6, reduceMotion)}
    >
      <section className="wc-card rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-bebas)] text-4xl text-wc-gold">
            Still Alive
          </h2>
          <span className="rounded-full bg-wc-gold/10 px-4 py-1 text-sm text-wc-gold">
            {alive.length} teams
          </span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {alive.map((row, i) => (
            <motion.div
              key={i}
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
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="wc-card rounded-3xl p-6">
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
              key={i}
              className="flex items-center justify-between rounded-2xl border border-red-400/10 bg-red-400/[0.04] px-4 py-4"
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
              <div>
                <p className="font-[family-name:var(--font-bebas)] text-2xl text-white">
                  {row.team?.flag_emoji} {row.team?.name}
                </p>
                <p className="text-sm text-white/40">
                  {row.participant?.name}
                </p>
              </div>
              <span className="tracker-eliminated-badge rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-300">
                {row.team_status.stage}
              </span>
            </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
