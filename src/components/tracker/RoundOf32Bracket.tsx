"use client";

import { motion } from "framer-motion";
import type { WorldCup26EnrichmentMap } from "@/lib/providers/worldcup26-provider";
import type { TrackerRow } from "@/lib/tracker";
import { buildSweepBracketData } from "@/lib/round-of-32-bracket";
import { formatCompletedFixtureScore } from "@/lib/world-cup-verified-snapshot";
import { BracketTeamNode } from "./bracket/BracketNodes";
import {
  BracketMatchOpponent,
  formatBracketPendingSummary,
} from "./bracket/BracketMatchOpponent";
import { RoundOf32MobileCards } from "./RoundOf32MobileCards";
import { ExternalAdvancerCard } from "./bracket/ExternalAdvancerCard";
import { revealTransition, LAYOUT_SPRING, useMotionSettings } from "./motion-utils";
import { usePremiumTracker } from "./premium/PremiumTrackerContext";
import { usePremiumEventDirector } from "./premium/PremiumEventDirectorContext";
import { BroadcastStrap } from "./premium/BroadcastStrap";

type RoundOf32BracketProps = {
  rows: TrackerRow[];
  fixtureEnrichment?: WorldCup26EnrichmentMap | null;
};

function DesktopMatchRow({
  entry,
  side,
  through,
}: {
  entry: ReturnType<typeof buildSweepBracketData>["through"][number];
  side: "left" | "right";
  through: ReturnType<typeof buildSweepBracketData>["through"];
}) {
  const isLeft = side === "left";

  return (
    <div className="relative flex items-center gap-2">
      {isLeft ? (
        <>
          <div className="w-[min(100%,220px)] shrink-0">
            <BracketTeamNode entry={entry} align="left" />
            {entry.pendingLine && (
              <p className="mt-1 text-[10px] text-slate-500">
                {formatBracketPendingSummary(entry.pendingLine)}
              </p>
            )}
          </div>
          <div className="h-px flex-1 bg-slate-300" />
          <div className="w-[min(100%,160px)] shrink-0">
            <BracketMatchOpponent entry={entry} through={through} align="right" />
          </div>
        </>
      ) : (
        <>
          <div className="w-[min(100%,160px)] shrink-0">
            <BracketMatchOpponent entry={entry} through={through} align="left" />
          </div>
          <div className="h-px flex-1 bg-slate-300" />
          <div className="w-[min(100%,220px)] shrink-0">
            <BracketTeamNode entry={entry} align="right" />
            {entry.pendingLine && (
              <p className="mt-1 text-right text-[10px] text-slate-500">
                {formatBracketPendingSummary(entry.pendingLine)}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function CenterSpine({ pairCount }: { pairCount: number }) {
  const height = Math.max(pairCount * 88, 120);
  const premium = usePremiumTracker();
  const { reduceMotion, intensity } = useMotionSettings();
  const midY = height / 2;

  return (
    <div
      className="relative hidden w-16 flex-col items-center justify-center md:flex lg:w-20"
      style={{ minHeight: height }}
      aria-hidden
    >
      <svg
        width="64"
        height={height}
        viewBox={`0 0 64 ${height}`}
        className={premium ? "premium-bracket-spine overflow-visible" : "overflow-visible"}
        fill="none"
      >
        {Array.from({ length: pairCount }).map((_, i) => {
          const y = 44 + i * 88;
          const d = `M0 ${y} H20 V${midY} H44`;
          if (premium && !reduceMotion) {
            return (
              <g key={i}>
                <motion.path
                  d={d}
                  stroke="#CBD5E1"
                  strokeWidth="1.25"
                  initial={{ pathLength: 0, opacity: 0.3 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.9 + i * 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                />
                <motion.path
                  d={d}
                  stroke="rgba(212,175,55,0.7)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 1.2 + i * 0.15,
                    delay: 0.3,
                    ease: "easeInOut",
                  }}
                  className="premium-bracket-energy-path"
                  style={{
                    filter: `drop-shadow(0 0 ${4 * intensity}px rgba(212,175,55,0.5))`,
                  }}
                />
              </g>
            );
          }
          return (
            <g key={i}>
              <path d={d} stroke="#CBD5E1" strokeWidth="1.25" />
            </g>
          );
        })}
        <circle
          cx="44"
          cy={height / 2 - 20}
          r="14"
          fill="#F8FAFC"
          stroke="#CBD5E1"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        <circle
          cx="44"
          cy={height / 2 + 20}
          r="14"
          fill="#F8FAFC"
          stroke="#CBD5E1"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        <path
          d={`M44 ${height / 2 - 6} V${height / 2 + 6}`}
          stroke="#CBD5E1"
          strokeWidth="1.25"
        />
      </svg>
      <p className="mt-2 text-center text-[9px] uppercase tracking-[0.2em] text-slate-400">
        Round of 16
      </p>
    </div>
  );
}

export function RoundOf32Bracket({
  rows,
  fixtureEnrichment = null,
}: RoundOf32BracketProps) {
  const { reduceMotion, intensity } = useMotionSettings();
  const premium = usePremiumTracker();
  const { eventActive, activeEvent } = usePremiumEventDirector();
  const data = buildSweepBracketData(rows, fixtureEnrichment);
  const left = data.through.filter((e) => e.side === "left");
  const right = data.through.filter((e) => e.side === "right");
  const pairCount = Math.max(left.length, right.length);

  return (
    <motion.section
      className="mt-6 overflow-hidden rounded-3xl bg-white shadow-[0_8px_40px_rgba(0,0,0,0.18)] ring-1 ring-slate-200/80 md:mt-10"
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={revealTransition(0.15, reduceMotion)}
    >
      <div className="border-b border-slate-100 px-4 py-6 text-center sm:px-8 sm:py-8">
        <h2 className="text-xs font-medium uppercase tracking-[0.45em] text-slate-400 sm:text-sm">
          World Cup Round of 32
        </h2>
        <p className="mt-2 text-[10px] text-slate-400 sm:text-xs">
          Family sweep teams
        </p>
      </div>

      {/* Desktop bracket */}
      <div className="hidden px-4 py-8 md:block lg:px-10 lg:py-10">
        <div className="mx-auto flex max-w-6xl items-stretch justify-between gap-4">
          <div className="flex flex-1 flex-col justify-center gap-10">
            {left.map((entry) => (
              <DesktopMatchRow
                key={entry.row.team?.id}
                entry={entry}
                side="left"
                through={data.through}
              />
            ))}
          </div>

          <CenterSpine pairCount={pairCount} />

          <div className="flex flex-1 flex-col justify-center gap-10">
            {right.map((entry) => (
              <DesktopMatchRow
                key={entry.row.team?.id}
                entry={entry}
                side="right"
                through={data.through}
              />
            ))}
          </div>
        </div>

        {data.pending.length > 0 && (
          <div className="mt-10 border-t border-slate-100 pt-8">
            <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
              Awaiting qualification
            </p>
            <div className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-2">
              {data.pending.map((entry) => (
                <div
                  key={entry.row.team?.id}
                  className="rounded-2xl border border-amber-100 bg-amber-50/60 px-4 py-3"
                >
                  <BracketTeamNode entry={entry} compact />
                  {entry.pendingLine && (
                    <p className="mt-2 text-xs text-amber-900/80">
                      Pending —{" "}
                      {formatBracketPendingSummary(entry.pendingLine)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.semiFinalQualified.length > 0 && (
          <div className="mt-10 border-t border-slate-100 pt-8">
            {premium ? (
              <div className="mb-4 flex justify-center">
                <BroadcastStrap>Semi-finalists</BroadcastStrap>
              </div>
            ) : (
              <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Semi-final qualified
              </p>
            )}
            <div className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-2">
              {data.semiFinalQualified.map((entry) => (
                <motion.div
                  key={entry.row.team?.id}
                  layout={premium && !reduceMotion}
                  layoutId={premium ? `sf-${entry.row.team?.id}` : undefined}
                  transition={premium ? LAYOUT_SPRING : undefined}
                  className={[
                    "rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3",
                    premium ? "premium-bracket-advance premium-winner-glow" : "",
                  ].join(" ")}
                  {...(premium && !reduceMotion
                    ? {
                        initial: { opacity: 0, x: -40 * intensity, scale: 0.92 },
                        whileInView: { opacity: 1, x: 0, scale: 1 },
                        viewport: { once: true, margin: "-40px" },
                      }
                    : {})}
                >
                  <BracketTeamNode entry={entry} compact />
                  {entry.pendingLine && (
                    <p className="mt-2 text-xs text-emerald-900/80">
                      {formatBracketPendingSummary(entry.pendingLine)}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {data.completedQuarterFinals.length > 0 && (
          <div className="mt-10 border-t border-slate-100 pt-8">
            {premium ? (
              <div className="mb-4 flex justify-center">
                <BroadcastStrap>Quarter-finals — Final</BroadcastStrap>
              </div>
            ) : (
              <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Quarter-finals complete
              </p>
            )}
            <div className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-2">
              {data.completedQuarterFinals.map((fixture) => (
                <div
                  key={`${fixture.homeTeam}-${fixture.awayTeam}`}
                  className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-center"
                >
                  <p className="font-[family-name:var(--font-bebas)] text-2xl tracking-wide text-slate-800">
                    {formatCompletedFixtureScore(fixture)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.quarterFinalQualified.length > 0 && (
          <div className="mt-10 border-t border-slate-100 pt-8">
            {premium ? (
              <div className="mb-4 flex justify-center">
                <BroadcastStrap>Quarter Finalists</BroadcastStrap>
              </div>
            ) : (
              <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Quarter-final qualified
              </p>
            )}
            <div className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-2">
              {data.quarterFinalQualified.map((entry) => {
                const isEventTeam =
                  eventActive &&
                  activeEvent &&
                  entry.row.team?.name?.toLowerCase() ===
                    activeEvent.teamName.toLowerCase();
                return (
                <motion.div
                  key={entry.row.team?.id}
                  layout={premium && !reduceMotion}
                  layoutId={premium ? `qf-${entry.row.team?.id}` : undefined}
                  transition={premium ? LAYOUT_SPRING : undefined}
                  className={[
                    "rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3",
                    premium ? "premium-bracket-advance premium-winner-glow" : "",
                    isEventTeam ? "premium-team-travel" : "",
                  ].join(" ")}
                  {...(premium && !reduceMotion
                    ? {
                        initial: { opacity: 0, x: -40 * intensity, scale: 0.92 },
                        whileInView: { opacity: 1, x: 0, scale: 1 },
                        viewport: { once: true, margin: "-40px" },
                      }
                    : {})}
                >
                  <BracketTeamNode entry={entry} compact />
                  {entry.pendingLine && (
                    <p className="mt-2 text-xs text-emerald-900/80">
                      {formatBracketPendingSummary(entry.pendingLine)}
                    </p>
                  )}
                </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {data.roundOf16Qualified.length > 0 && (
          <div className="mt-10 border-t border-slate-100 pt-8">
            {premium ? (
              <div className="mb-4 flex justify-center">
                <BroadcastStrap>Round of 16</BroadcastStrap>
              </div>
            ) : (
              <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Round of 16 qualified
              </p>
            )}
            <div className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-2">
              {data.roundOf16Qualified.map((entry) => (
                <motion.div
                  key={entry.row.team?.id}
                  layout={premium && !reduceMotion}
                  layoutId={premium ? `r16-${entry.row.team?.id}` : undefined}
                  transition={premium ? LAYOUT_SPRING : undefined}
                  className="rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3"
                  {...(premium && !reduceMotion
                    ? {
                        initial: { opacity: 0, y: 24 * intensity },
                        whileInView: { opacity: 1, y: 0 },
                        viewport: { once: true, margin: "-40px" },
                      }
                    : {})}
                >
                  <BracketTeamNode entry={entry} compact />
                  {entry.pendingLine && (
                    <p className="mt-2 text-xs text-emerald-900/80">
                      {formatBracketPendingSummary(entry.pendingLine)}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {data.eliminated.length > 0 && (
          <div className="mt-10 border-t border-slate-100 pt-8">
            {premium ? (
              <div className="mb-4 flex justify-center">
                <BroadcastStrap>Eliminated</BroadcastStrap>
              </div>
            ) : (
              <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Eliminated
              </p>
            )}
            <div className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-2">
              {data.eliminated.map((entry) => (
                <motion.div
                  key={entry.row.team?.id}
                  layout={premium && !reduceMotion}
                  initial={
                    premium && !reduceMotion
                      ? { opacity: 0, y: 20 * intensity, filter: "grayscale(0.5)" }
                      : false
                  }
                  whileInView={
                    premium && !reduceMotion
                      ? { opacity: 0.85, filter: "grayscale(1)" }
                      : undefined
                  }
                  viewport={premium ? { once: true, margin: "-40px" } : undefined}
                  animate={
                    !premium || reduceMotion
                      ? { opacity: 0.85, filter: "grayscale(1)" }
                      : undefined
                  }
                  transition={premium ? { duration: 0.65 } : undefined}
                  className="rounded-2xl border border-red-100 bg-red-50/60 px-4 py-3"
                >
                  <BracketTeamNode entry={entry} compact />
                  {entry.pendingLine && (
                    <p className="mt-2 text-xs text-red-900/80">
                      {formatBracketPendingSummary(entry.pendingLine)}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {data.externalAdvancers.length > 0 && (
          <div className="mt-10 border-t border-slate-100 pt-8">
            <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
              Official tournament — advanced
            </p>
            <div className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-2">
              {data.externalAdvancers.map((advancer) => (
                <ExternalAdvancerCard
                  key={advancer.teamName}
                  advancer={advancer}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile stacked cards */}
      <div className="md:hidden">
        <RoundOf32MobileCards data={data} />
      </div>
    </motion.section>
  );
}
