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

/** Desktop-only hero block — stats, banner, trophy */
function DesktopHeroExtras({
  stats,
  winner,
  hasWinner,
}: {
  stats: TournamentStats;
  winner: TrackerRow | undefined;
  hasWinner: boolean;
}) {
  return (
    <div className="hidden md:block">
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

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-5 md:py-10">
        <div className="text-center">
          <motion.p
            className="text-[10px] uppercase tracking-[0.25em] text-wc-gold/60 md:text-xs md:tracking-[0.35em]"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={revealTransition(0, reduceMotion)}
          >
            Family World Cup Sweep
          </motion.p>

          <motion.h1
            className="mt-1.5 font-[family-name:var(--font-bebas)] text-5xl tracking-wide text-wc-gold max-md:leading-none md:mt-3 md:text-6xl sm:text-8xl"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={revealTransition(0.05, reduceMotion)}
          >
            Survival Tracker
          </motion.h1>

          {/* Mobile: trophy + stats immediately below title, above tabs */}
          <div className="md:hidden">
            <FloatingTrophy hasWinner={hasWinner} />
            <TournamentStatsStrip stats={stats} className="mt-2" />
          </div>

          <DesktopHeroExtras
            stats={stats}
            winner={winner}
            hasWinner={hasWinner}
          />

          {/* Desktop: full winner block + subtitle */}
          <div className="hidden md:block">
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

          {/* Mobile: compact winner line */}
          {winner && (
            <p className="mt-2 text-sm text-white/70 md:hidden">
              <span className="text-wc-gold">🏆 {winner.participant?.name}</span>
              {" · "}
              {winner.team?.flag_emoji} {winner.team?.name}
            </p>
          )}
        </div>

        <TrackerMobileTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Overview: mobile = banner + path; desktop = path only (hero has rest) */}
        <MobileTabPanel tab="overview" activeTab={activeTab}>
          {winner && (
            <div className="mt-2 md:hidden">
              <WinnerBanner winner={winner} />
            </div>
          )}
          <div className="max-md:mt-2 md:mt-0">
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

        <div className="hidden md:block">
          <TrackerTeamCards alive={alive} eliminated={eliminated} />
        </div>
      </div>
    </div>
  );
}
