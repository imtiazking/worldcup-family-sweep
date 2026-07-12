"use client";

import { motion } from "framer-motion";
import { formatCompletedFixtureScore } from "@/lib/world-cup-verified-snapshot";
import type { SweepBracketData } from "@/lib/round-of-32-bracket";
import { BracketTeamNode } from "./bracket/BracketNodes";
import { ExternalAdvancerCard } from "./bracket/ExternalAdvancerCard";
import {
  BracketMatchOpponent,
  formatBracketPendingSummary,
} from "./bracket/BracketMatchOpponent";
import { LAYOUT_SPRING, useMotionSettings } from "./motion-utils";
import { usePremiumTracker } from "./premium/PremiumTrackerContext";
import { BroadcastStrap } from "./premium/BroadcastStrap";

type RoundOf32MobileCardsProps = {
  data: SweepBracketData;
};

type MobileMatchCardProps = {
  entry: SweepBracketData["through"][number];
  through?: SweepBracketData["through"];
  showOpponent?: boolean;
  premium?: boolean;
  reduceMotion?: boolean;
  layoutId?: string;
  eliminated?: boolean;
  advanced?: boolean;
};

function MobileMatchCard({
  entry,
  through = [],
  showOpponent = false,
  premium = false,
  reduceMotion = false,
  layoutId,
  eliminated = false,
  advanced = false,
}: MobileMatchCardProps) {
  const className = [
    "rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm",
    premium && advanced ? "premium-bracket-advance" : "",
  ].join(" ");

  const content = (
    <>
      <BracketTeamNode entry={entry} compact />
      {showOpponent && entry.r32Opponent && (
        <div className="mt-3 space-y-2 border-t border-slate-200 pt-3">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
            vs
          </span>
          <BracketMatchOpponent
            entry={entry}
            through={through}
            align="left"
            compact
          />
        </div>
      )}
      {entry.status === "through" && entry.pendingLine && (
        <p className="mt-3 border-t border-slate-200 pt-3 text-xs text-slate-600">
          {formatBracketPendingSummary(entry.pendingLine)}
        </p>
      )}
      {entry.status === "pending" && entry.pendingLine && (
        <p className="mt-3 border-t border-amber-100 pt-3 text-xs text-amber-900/90">
          Pending — {formatBracketPendingSummary(entry.pendingLine)}
        </p>
      )}
      {entry.status === "eliminated" && entry.pendingLine && (
        <p className="mt-3 border-t border-red-100 pt-3 text-xs text-red-900/90">
          {formatBracketPendingSummary(entry.pendingLine)}
        </p>
      )}
    </>
  );

  if (!premium) {
    return <article className={className}>{content}</article>;
  }

  return (
    <motion.article
      layout={!reduceMotion}
      layoutId={layoutId}
      transition={LAYOUT_SPRING}
      initial={
        eliminated && !reduceMotion
          ? { opacity: 0.85, filter: "grayscale(1)" }
          : false
      }
      animate={
        eliminated
          ? { opacity: 0.85, filter: "grayscale(1)" }
          : { opacity: 1, filter: "grayscale(0)" }
      }
      className={className}
    >
      {content}
    </motion.article>
  );
}

function SectionTitle({
  premium,
  children,
}: {
  premium: boolean;
  children: string;
}) {
  if (premium) {
    return (
      <div className="mb-3 flex justify-center">
        <BroadcastStrap>{children}</BroadcastStrap>
      </div>
    );
  }
  return (
    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
      {children}
    </p>
  );
}

export function RoundOf32MobileCards({ data }: RoundOf32MobileCardsProps) {
  const premium = usePremiumTracker();
  const { reduceMotion } = useMotionSettings();
  const allEntries = [
    ...data.through,
    ...data.semiFinalQualified,
    ...data.quarterFinalQualified,
    ...data.roundOf16Qualified,
    ...data.pending,
    ...data.eliminated,
  ];

  return (
    <div className="space-y-6 px-4 py-6">
      {data.through.length > 0 && (
        <div>
          <SectionTitle premium={premium}>Through to Round of 32</SectionTitle>
          <div className="space-y-3">
            {data.through.map((entry) => (
              <MobileMatchCard
                key={entry.row.team?.id}
                entry={entry}
                through={data.through}
                premium={premium}
                reduceMotion={reduceMotion}
                layoutId={premium ? `r32-${entry.row.team?.id}` : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {data.semiFinalQualified.length > 0 && (
        <div>
          <SectionTitle premium={premium}>Semi-finalists</SectionTitle>
          <div className="space-y-3">
            {data.semiFinalQualified.map((entry) => (
              <MobileMatchCard
                key={entry.row.team?.id}
                entry={entry}
                premium={premium}
                reduceMotion={reduceMotion}
                layoutId={premium ? `sf-${entry.row.team?.id}` : undefined}
                advanced
              />
            ))}
          </div>
        </div>
      )}

      {data.completedQuarterFinals.length > 0 && (
        <div>
          <SectionTitle premium={premium}>Quarter-finals — Final</SectionTitle>
          <div className="space-y-3">
            {data.completedQuarterFinals.map((fixture) => (
              <article
                key={`${fixture.homeTeam}-${fixture.awayTeam}`}
                className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-center shadow-sm"
              >
                <p className="font-[family-name:var(--font-bebas)] text-2xl tracking-wide text-slate-800">
                  {formatCompletedFixtureScore(fixture)}
                </p>
              </article>
            ))}
          </div>
        </div>
      )}

      {data.quarterFinalQualified.length > 0 && (
        <div>
          <SectionTitle premium={premium}>Quarter Finalists</SectionTitle>
          <div className="space-y-3">
            {data.quarterFinalQualified.map((entry) => (
              <MobileMatchCard
                key={entry.row.team?.id}
                entry={entry}
                premium={premium}
                reduceMotion={reduceMotion}
                layoutId={premium ? `qf-${entry.row.team?.id}` : undefined}
                advanced
              />
            ))}
          </div>
        </div>
      )}

      {data.roundOf16Qualified.length > 0 && (
        <div>
          <SectionTitle premium={premium}>Round of 16</SectionTitle>
          <div className="space-y-3">
            {data.roundOf16Qualified.map((entry) => (
              <MobileMatchCard
                key={entry.row.team?.id}
                entry={entry}
                premium={premium}
                reduceMotion={reduceMotion}
                layoutId={premium ? `r16-${entry.row.team?.id}` : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {data.pending.length > 0 && (
        <div>
          <SectionTitle premium={premium}>Group Stage</SectionTitle>
          <div className="space-y-3">
            {data.pending.map((entry) => (
              <MobileMatchCard
                key={entry.row.team?.id}
                entry={entry}
                premium={premium}
                reduceMotion={reduceMotion}
              />
            ))}
          </div>
        </div>
      )}

      {data.eliminated.length > 0 && (
        <div>
          <SectionTitle premium={premium}>Eliminated</SectionTitle>
          <div className="space-y-3">
            {data.eliminated.map((entry) => (
              <MobileMatchCard
                key={entry.row.team?.id}
                entry={entry}
                premium={premium}
                reduceMotion={reduceMotion}
                eliminated
              />
            ))}
          </div>
        </div>
      )}

      {data.externalAdvancers.length > 0 && (
        <div>
          <SectionTitle premium={premium}>
            Official tournament — advanced
          </SectionTitle>
          <div className="space-y-3">
            {data.externalAdvancers.map((advancer) => (
              <ExternalAdvancerCard key={advancer.teamName} advancer={advancer} />
            ))}
          </div>
        </div>
      )}

      {allEntries.length === 0 &&
        data.externalAdvancers.length === 0 && (
        <p className="py-8 text-center text-sm text-slate-400">
          No sweep teams to display yet.
        </p>
      )}
    </div>
  );
}
