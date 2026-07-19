"use client";

import { motion } from "framer-motion";
import type {
  FinalMatchupData,
  SemiFinalResultDetail,
  SweepBracketData,
} from "@/lib/round-of-32-bracket";
import { formatCompletedFixtureScore } from "@/lib/world-cup-verified-snapshot";
import { revealTransition, useMotionSettings } from "./motion-utils";
import { FinalHeroTrophy } from "./FinalHeroTrophy";
import { LiveGoalEvents } from "./LiveGoalEvents";
import styles from "./world-cup-final-hero.module.css";

type WorldCupFinalHeroProps = {
  matchup: FinalMatchupData;
  semiFinalResults: SemiFinalResultDetail[];
};

const CONFETTI_SPECS = [
  { left: "6%", delay: "0s", duration: "14s" },
  { left: "14%", delay: "2.5s", duration: "16s" },
  { left: "22%", delay: "1s", duration: "13s" },
  { left: "31%", delay: "4s", duration: "15s" },
  { left: "39%", delay: "0.5s", duration: "17s" },
  { left: "48%", delay: "3s", duration: "14s" },
  { left: "56%", delay: "1.8s", duration: "16s" },
  { left: "64%", delay: "5s", duration: "13s" },
  { left: "72%", delay: "2.2s", duration: "15s" },
  { left: "80%", delay: "3.8s", duration: "14s" },
  { left: "88%", delay: "1.2s", duration: "16s" },
  { left: "94%", delay: "4.5s", duration: "13s" },
] as const;

function formatFinalDate(dateUk: string): string {
  const normalized = dateUk.trim().toLowerCase();
  if (normalized === "19 jul") return "19 JULY 2026";
  return `${dateUk.toUpperCase()} 2026`;
}

function sortSemiFinalResults(
  results: SemiFinalResultDetail[],
): SemiFinalResultDetail[] {
  return [...results].sort((a, b) => {
    if (a.homeTeam === "France") return -1;
    if (b.homeTeam === "France") return 1;
    return 0;
  });
}

function FinalistCard({
  side,
  flagEmoji,
  country,
  participant,
  reduceMotion,
  delay,
}: {
  side: "home" | "away";
  flagEmoji: string;
  country: string;
  participant: string | null;
  reduceMotion: boolean;
  delay: number;
}) {
  return (
    <motion.article
      className={[
        styles.finalistCard,
        side === "home" ? styles.finalistCardHome : styles.finalistCardAway,
      ].join(" ")}
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={revealTransition(delay, reduceMotion)}
    >
      <p className={styles.cardFlag} aria-hidden>
        {flagEmoji}
      </p>
      <p className={styles.cardCountry}>{country.toUpperCase()}</p>
      <p className={styles.cardStars} aria-hidden>
        ★ ★ ★ ★ ★
      </p>
      {participant && (
        <p className={styles.cardParticipant}>{participant.toUpperCase()}</p>
      )}
    </motion.article>
  );
}

export function WorldCupFinalHero({
  matchup,
  semiFinalResults,
}: WorldCupFinalHeroProps) {
  const { reduceMotion } = useMotionSettings();
  const orderedSemiFinals = sortSemiFinalResults(semiFinalResults);

  return (
    <section className={styles.hero} aria-labelledby="world-cup-final-heading">
      <div className={styles.atmosphere} aria-hidden>
        <div className={styles.stadiumLights} />
        <div className={styles.ambientLight} />
        {!reduceMotion && (
          <div className={styles.confettiLayer}>
            {CONFETTI_SPECS.map((spec, index) => (
              <span
                key={index}
                className={styles.confettiPiece}
                style={{
                  left: spec.left,
                  animationDelay: spec.delay,
                  animationDuration: spec.duration,
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className={styles.inner}>
        <header className={styles.header}>
          {matchup.live ? (
            <div className={styles.liveBanner} aria-live="polite">
              <div className={styles.liveIndicator}>
                <span className={styles.liveDot} aria-hidden />
                <span className={styles.liveLabel}>LIVE</span>
                <span className={styles.liveStatus}>{matchup.live.statusLabel}</span>
              </div>
              <p id="world-cup-final-heading" className={styles.liveBannerTitle}>
                WORLD CUP FINAL LIVE
              </p>
              <p className={styles.liveScore}>
                {matchup.homeTeam} {matchup.live.scoreHome}–{matchup.live.scoreAway}{" "}
                {matchup.awayTeam}
              </p>
              <p className={styles.livePhase}>Extra time in progress</p>
              {matchup.live.phaseSummary && (
                <p className={styles.liveLead}>{matchup.live.phaseSummary}</p>
              )}
              <p className={styles.liveAfter90}>
                {matchup.live.scoreAfter90Home}–{matchup.live.scoreAfter90Away} after
                90 minutes
              </p>
              <LiveGoalEvents
                events={matchup.live.matchEvents}
                className={styles.liveGoals}
                itemClassName={styles.liveGoalItem}
              />
              {matchup.live.matchNote && (
                <p className={styles.liveNote}>{matchup.live.matchNote}</p>
              )}
            </div>
          ) : (
            <>
              <p className={styles.eyebrow}>FIFA World Cup 2026</p>
              <h2 id="world-cup-final-heading" className={styles.title}>
                <span className={styles.titleStars} aria-hidden>
                  ★{" "}
                </span>
                WORLD CUP FINAL
                <span className={styles.titleStars} aria-hidden>
                  {" "}
                  ★
                </span>
              </h2>
              <p className={styles.subtitle}>
                THE ULTIMATE SHOWDOWN
                <span className={styles.subtitleRule} aria-hidden />
              </p>
            </>
          )}
        </header>

        <div className={styles.matchup}>
          <FinalistCard
            side="home"
            flagEmoji={matchup.homeFlagEmoji}
            country={matchup.homeTeam}
            participant={matchup.homeParticipant}
            reduceMotion={reduceMotion}
            delay={0.04}
          />

          <div className={styles.trophyStage}>
            {matchup.live ? (
              <p className={styles.liveCentreScore} aria-label={`Score ${matchup.live.scoreHome} to ${matchup.live.scoreAway}`}>
                <span className={styles.liveCentreScoreNum}>{matchup.live.scoreHome}</span>
                <span className={styles.liveCentreScoreSep}>–</span>
                <span className={styles.liveCentreScoreNum}>{matchup.live.scoreAway}</span>
              </p>
            ) : (
              <>
                <span className={styles.vsLeft} aria-hidden>
                  VS
                </span>
                <FinalHeroTrophy />
                <span className={styles.vsRight} aria-hidden>
                  VS
                </span>
              </>
            )}
          </div>

          <FinalistCard
            side="away"
            flagEmoji={matchup.awayFlagEmoji}
            country={matchup.awayTeam}
            participant={matchup.awayParticipant}
            reduceMotion={reduceMotion}
            delay={0.08}
          />
        </div>

        <div className={styles.matchInfo}>
          <div className={styles.matchInfoItem}>
            <span className={styles.matchInfoLabel}>Date</span>
            <span className={styles.matchInfoValue}>
              {formatFinalDate(matchup.dateUk)}
            </span>
          </div>
          <div className={styles.matchInfoItem}>
            <span className={styles.matchInfoLabel}>Kick-off</span>
            <span className={styles.matchInfoValue}>
              {matchup.timeUk} UK TIME
            </span>
          </div>
          <div className={styles.matchInfoItem}>
            <span className={styles.matchInfoLabel}>Venue</span>
            <span className={styles.matchInfoValue}>
              {(matchup.venueStadium ?? matchup.venue ?? "").toUpperCase()}
            </span>
            {matchup.venueCity && (
              <span className={styles.matchInfoSub}>
                {matchup.venueCity.toUpperCase()}
              </span>
            )}
          </div>
        </div>

        <aside className={styles.grandPrize} aria-label="Grand prize">
          <p className={styles.grandPrizeTitle}>★ THE GRAND PRIZE ★</p>
          <p className={styles.grandPrizeTagline}>
            Glory. Bragging Rights. Family Legend.
          </p>
          <p className={styles.grandPrizeFootnote}>
            {matchup.live
              ? "Final in progress — result pending."
              : "One winner will be crowned champion."}
          </p>
        </aside>

        {orderedSemiFinals.length > 0 && (
          <div className={styles.semiFinalSection}>
            <h3 className={styles.semiFinalHeading}>Semi-finals complete</h3>
            <div className={styles.semiFinalGrid}>
              {orderedSemiFinals.map((fixture) => (
                <article
                  key={`${fixture.homeTeam}-${fixture.awayTeam}`}
                  className={styles.semiFinalCard}
                >
                  <p className={styles.semiFinalScore}>
                    {formatCompletedFixtureScore(fixture)}
                  </p>
                  <ul className={styles.semiFinalOutcomes}>
                    {fixture.loserParticipant && (
                      <li
                        className={[
                          styles.semiFinalOutcome,
                          styles.semiFinalOutcomeEliminated,
                        ].join(" ")}
                      >
                        <strong>{fixture.loserParticipant}</strong> — eliminated
                      </li>
                    )}
                    {fixture.winnerParticipant && (
                      <li
                        className={[
                          styles.semiFinalOutcome,
                          styles.semiFinalOutcomeThrough,
                        ].join(" ")}
                      >
                        <strong>{fixture.winnerParticipant}</strong> — through to
                        final
                      </li>
                    )}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export function WorldCupFinalHeroFromData({
  data,
}: {
  data: Pick<SweepBracketData, "finalMatchup" | "completedSemiFinalDetails">;
}) {
  if (!data.finalMatchup) return null;

  return (
    <WorldCupFinalHero
      matchup={data.finalMatchup}
      semiFinalResults={data.completedSemiFinalDetails}
    />
  );
}
