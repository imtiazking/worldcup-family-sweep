"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import type { LeaderboardEntry, TournamentStats, TrackerRow } from "@/lib/tracker";
import { AliveTeamsSection } from "./AliveTeamsSection";
import { FamilyLeaderboard } from "./FamilyLeaderboard";
import { FloatingTrophy } from "./FloatingTrophy";
import { KnockedOutTeamsSection } from "./KnockedOutTeamsSection";
import { TournamentPath } from "./TournamentPath";
import { TournamentStatsStrip } from "./TournamentStatsStrip";
import { TrackerAtmosphere } from "./TrackerAtmosphere";
import { TrackerTeamCards } from "./TrackerTeamCards";
import {
  MobileTabPanel,
  TrackerMobileTabs,
  type TrackerTab,
} from "./TrackerMobileTabs";
import { WinnerBanner } from "./WinnerBanner";
import { revealTransition, useMotionSettings } from "./motion-utils";

type TrackerExperienceProps = {
  rows: TrackerRow[];
  winner: TrackerRow | undefined;
  alive: TrackerRow[];
  eliminated: TrackerRow[];
  stats: TournamentStats;
  leaderboard: LeaderboardEntry[];
};

function OverviewExtras({
  stats,
  winner,
  hasWinner,
  mobileOnly = false,
}: {
  stats: TournamentStats;
  winner: TrackerRow | undefined;
  hasWinner: boolean;
  mobileOnly?: boolean;
}) {
  const wrapperClass = mobileOnly ? "md:hidden" : "hidden md:block";

  return (
    <div className={wrapperClass}>
      <TournamentStatsStrip stats={stats} />
      {winner && <WinnerBanner winner={winner} />}
      <FloatingTrophy hasWinner={hasWinner} />
    </div>
  );
}

export function TrackerExperience({
  rows,
  winner,
  alive,
  eliminated,
  stats,
  leaderboard,
}: TrackerExperienceProps) {
  const { reduceMotion } = useMotionSettings();
  const [activeTab, setActiveTab] = useState<TrackerTab>("overview");
  const hasWinner = !!winner;

  return (
    <div className="relative">
      <TrackerAtmosphere />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-10">
        <div className="text-center">
          <motion.p
            className="text-xs uppercase tracking-[0.35em] text-wc-gold/60"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={revealTransition(0, reduceMotion)}
          >
            Family World Cup Sweep
          </motion.p>

          <motion.h1
            className="mt-3 font-[family-name:var(--font-bebas)] text-6xl tracking-wide text-wc-gold sm:text-8xl"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={revealTransition(0.05, reduceMotion)}
          >
            Survival Tracker
          </motion.h1>

          <OverviewExtras
            stats={stats}
            winner={winner}
            hasWinner={hasWinner}
          />

          {winner ? (
            <motion.div
              className="mt-6"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={revealTransition(0.2, reduceMotion)}
            >
              <p className="text-sm uppercase tracking-[0.25em] text-wc-gold/60">
                World Cup Sweep Winner
              </p>
              <p className="mt-2 font-[family-name:var(--font-bebas)] text-4xl text-white sm:text-5xl">
                {winner.participant?.name} — {winner.team?.flag_emoji}{" "}
                {winner.team?.name}
              </p>
            </motion.div>
          ) : (
            <motion.p
              className="mt-5 text-white/50"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={revealTransition(0.2, reduceMotion)}
            >
              Track who is still alive, who advances, and who gets knocked out.
            </motion.p>
          )}

          <motion.div
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={revealTransition(0.25, reduceMotion)}
          >
            <Link
              href="/results"
              className="mt-6 inline-block rounded-full border border-wc-gold/30 px-5 py-2 text-sm text-wc-gold hover:bg-wc-gold/10"
            >
              View Draw Results
            </Link>
          </motion.div>
        </div>

        <TrackerMobileTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <MobileTabPanel tab="overview" activeTab={activeTab}>
          <OverviewExtras
            stats={stats}
            winner={winner}
            hasWinner={hasWinner}
            mobileOnly
          />
          <div className="max-md:mt-2">
            <TournamentPath rows={rows} hasWinner={hasWinner} />
          </div>
        </MobileTabPanel>

        <MobileTabPanel tab="rankings" activeTab={activeTab}>
          <div className="max-md:mt-2">
            <FamilyLeaderboard entries={leaderboard} />
          </div>
        </MobileTabPanel>

        <MobileTabPanel tab="alive" activeTab={activeTab} mobileOnly>
          <div className="max-md:mt-2">
            <AliveTeamsSection alive={alive} className="max-md:mt-0" />
          </div>
        </MobileTabPanel>

        <MobileTabPanel tab="knocked-out" activeTab={activeTab} mobileOnly>
          <div className="max-md:mt-2">
            <KnockedOutTeamsSection
              eliminated={eliminated}
              className="max-md:mt-0"
            />
          </div>
        </MobileTabPanel>

        {/* Desktop: combined team cards grid */}
        <div className="hidden md:block">
          <TrackerTeamCards alive={alive} eliminated={eliminated} />
        </div>
      </div>
    </div>
  );
}
