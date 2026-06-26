"use client";

import { motion } from "framer-motion";
import type { WorldCup26EnrichmentMap } from "@/lib/providers/worldcup26-provider";
import type { TrackerRow } from "@/lib/tracker";
import { buildSweepBracketData } from "@/lib/round-of-32-bracket";
import { BracketOpponentNode, BracketTeamNode } from "./bracket/BracketNodes";
import { RoundOf32MobileCards } from "./RoundOf32MobileCards";
import { revealTransition, useMotionSettings } from "./motion-utils";

type RoundOf32BracketProps = {
  rows: TrackerRow[];
  fixtureEnrichment?: WorldCup26EnrichmentMap | null;
};

function DesktopMatchRow({
  entry,
  side,
}: {
  entry: ReturnType<typeof buildSweepBracketData>["through"][number];
  side: "left" | "right";
}) {
  const isLeft = side === "left";

  return (
    <div className="relative flex items-center gap-2">
      {isLeft ? (
        <>
          <div className="w-[min(100%,220px)] shrink-0">
            <BracketTeamNode entry={entry} align="left" />
          </div>
          <div className="h-px flex-1 bg-slate-300" />
          <div className="w-[min(100%,160px)] shrink-0">
            <BracketOpponentNode
              opponent={entry.r32Opponent}
              align="right"
            />
          </div>
        </>
      ) : (
        <>
          <div className="w-[min(100%,160px)] shrink-0">
            <BracketOpponentNode
              opponent={entry.r32Opponent}
              align="left"
            />
          </div>
          <div className="h-px flex-1 bg-slate-300" />
          <div className="w-[min(100%,220px)] shrink-0">
            <BracketTeamNode entry={entry} align="right" />
          </div>
        </>
      )}
    </div>
  );
}

function CenterSpine({ pairCount }: { pairCount: number }) {
  const height = Math.max(pairCount * 88, 120);

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
        className="overflow-visible"
        fill="none"
      >
        {Array.from({ length: pairCount }).map((_, i) => {
          const y = 44 + i * 88;
          const midY = height / 2;
          return (
            <g key={i}>
              <path
                d={`M0 ${y} H20 V${midY} H44`}
                stroke="#CBD5E1"
                strokeWidth="1.25"
              />
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
  const { reduceMotion } = useMotionSettings();
  const data = buildSweepBracketData(rows, fixtureEnrichment);
  const left = data.through.filter((e) => e.side === "left");
  const right = data.through.filter((e) => e.side === "right");
  const pairCount = Math.max(left.length, right.length);

  return (
    <motion.section
      className="mt-6 overflow-hidden rounded-3xl bg-white shadow-[0_8px_40px_rgba(0,0,0,0.18)] ring-1 ring-slate-200/80 md:mt-10"
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={revealTransition(0.15, reduceMotion)}
    >
      <div className="border-b border-slate-100 px-4 py-6 text-center sm:px-8 sm:py-8">
        <h2 className="text-xs font-medium uppercase tracking-[0.45em] text-slate-400 sm:text-sm">
          World Cup Round of 32
        </h2>
        <p className="mt-2 text-[10px] text-slate-400 sm:text-xs">
          Family sweep teams · opponents from verified snapshot
        </p>
      </div>

      {/* Desktop bracket */}
      <div className="hidden px-4 py-8 md:block lg:px-10 lg:py-10">
        <div className="mx-auto flex max-w-6xl items-stretch justify-between gap-4">
          <div className="flex flex-1 flex-col justify-center gap-10">
            {left.map((entry) => (
              <DesktopMatchRow key={entry.row.team?.id} entry={entry} side="left" />
            ))}
          </div>

          <CenterSpine pairCount={pairCount} />

          <div className="flex flex-1 flex-col justify-center gap-10">
            {right.map((entry) => (
              <DesktopMatchRow key={entry.row.team?.id} entry={entry} side="right" />
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
                      Pending — {entry.pendingLine}
                    </p>
                  )}
                </div>
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
