"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { LoserWheelResult } from "@/lib/loser-wheel";
import type { LeaderboardEntry, TournamentStats, TrackerRow } from "@/lib/tracker";
import {
  buildWheelVisibilityDebug,
  logWheelVisibilityDebug,
} from "@/lib/wheel-visibility-debug";
import { AliveTeamsSection } from "./AliveTeamsSection";
import { FamilyLeaderboard } from "./FamilyLeaderboard";
import { FloatingTrophy } from "./FloatingTrophy";
import { KnockedOutTeamsSection } from "./KnockedOutTeamsSection";
import { LosersWheelTab } from "./loser-wheel/LosersWheelTab";
import { TournamentPath } from "./TournamentPath";
import { TournamentStatsStrip } from "./TournamentStatsStrip";
import { TrackerAtmosphere } from "./TrackerAtmosphere";
import { TrackerSoundControl } from "./TrackerSoundControl";
import { TrackerSoundProvider } from "./TrackerSoundProvider";
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
  wheelResults: LoserWheelResult[];
  lastStatusSync?: string | null;
  /** Temporary debug — remove after wheel join verified */
  debugEliminatedCount?: number;
  debugStatusesRowCount?: number;
};

function formatLastUpdated(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  });
}

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
      <TrackerSoundControl className="mt-2" />
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
  wheelResults,
  lastStatusSync,
  debugEliminatedCount,
  debugStatusesRowCount,
}: TrackerExperienceProps) {
  const { reduceMotion } = useMotionSettings();
  const [activeTab, setActiveTab] = useState<TrackerTab>("overview");
  const hasWinner = !!winner;

  useEffect(() => {
    const debug = buildWheelVisibilityDebug(eliminated, rows, wheelResults);
    logWheelVisibilityDebug("client TrackerExperience", debug);
    console.log("[LoserWheel debug] tab/panel state:", {
      activeTab,
      losersWheelTabInNav: true,
      mobilePanelShown: activeTab === "losers-wheel",
      desktopWheelSectionMounted: true,
    });
  }, [eliminated, rows, wheelResults, activeTab]);

  return (
    <TrackerSoundProvider>
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

          {lastStatusSync && (
            <motion.p
              className="mt-2 text-xs text-white/40 md:text-sm"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={revealTransition(0.12, reduceMotion)}
            >
              Last updated: {formatLastUpdated(lastStatusSync)} UTC
            </motion.p>
          )}

          {/* Mobile: trophy + stats immediately below title, above tabs */}
          <div className="md:hidden">
            <FloatingTrophy hasWinner={hasWinner} />
            <TrackerSoundControl className="mt-2" />
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

        {/* Temporary debug banner — remove after wheel join verified */}
        {debugEliminatedCount !== undefined && (
          <p className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-center text-xs text-amber-200">
            Eliminated Count: {debugEliminatedCount}
            {debugStatusesRowCount !== undefined && (
              <>
                {" "}
                · team_status rows from API: {debugStatusesRowCount}
                {debugStatusesRowCount === 0 && (
                  <span className="block text-amber-400/90">
                    (0 rows = RLS blocking team_status — run migration 004)
                  </span>
                )}
              </>
            )}
          </p>
        )}

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

        <MobileTabPanel tab="losers-wheel" activeTab={activeTab} mobileOnly>
          <LosersWheelTab
            eliminated={eliminated}
            wheelResults={wheelResults}
            rows={rows}
          />
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

        <div className="hidden md:block">
          <LosersWheelTab
            eliminated={eliminated}
            wheelResults={wheelResults}
            rows={rows}
          />
        </div>
      </div>
    </div>
    </TrackerSoundProvider>
  );
}
