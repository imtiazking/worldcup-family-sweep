"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";
import { CHAMPIONS_PROTOTYPE } from "../constants";
import type { CeremonyParticipant, CeremonySequenceStep } from "../types";
import { CeremonyStage } from "./CeremonyStage";
import { RunnerUpPanel } from "./RunnerUpPanel";
import { WinnerNameplate } from "./WinnerNameplate";
import styles from "../champions.module.css";

type ChampionHeroProps = {
  champion: CeremonyParticipant;
  runnerUp: CeremonyParticipant;
  secondRunnerUp: CeremonyParticipant;
  isStepActive: (step: CeremonySequenceStep) => boolean;
  ceremonyComplete: boolean;
  reduceMotion: boolean;
  foregroundConfetti: boolean;
  foregroundFireworks: boolean;
  isMobile: boolean;
};

export function ChampionHero({
  champion,
  runnerUp,
  secondRunnerUp,
  isStepActive,
  ceremonyComplete,
  reduceMotion,
  foregroundConfetti,
  foregroundFireworks,
  isMobile,
}: ChampionHeroProps) {
  const titleVisible = isStepActive("title");
  const runnersVisible = isStepActive("runners");
  const winnerVisible = isStepActive("winner");
  const glowActive = isStepActive("glow") || ceremonyComplete;
  const nameplateVisible = isStepActive("nameplate") || ceremonyComplete;
  const confettiBurst = isStepActive("confetti");
  const impactBurst = isStepActive("glow");
  const stadiumLightsBoost = isStepActive("glow") || confettiBurst;

  const sceneControls = useAnimation();
  const impactPlayedRef = useRef(false);

  useEffect(() => {
    if (reduceMotion) {
      sceneControls.set({ opacity: 1, scale: 1, y: 0 });
      return;
    }

    if (winnerVisible) {
      sceneControls.start({
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { duration: 1.15, ease: [0.22, 1, 0.36, 1] },
      });
    } else {
      sceneControls.set({ opacity: 0, scale: 0.96, y: 40 });
      impactPlayedRef.current = false;
    }
  }, [reduceMotion, sceneControls, winnerVisible]);

  useEffect(() => {
    if (reduceMotion || !impactBurst || impactPlayedRef.current) return;

    impactPlayedRef.current = true;
    void sceneControls.start({
      scale: [1, 1.012, 1],
      y: [0, -3, 0],
      transition: {
        duration: 0.72,
        times: [0, 0.38, 1],
        ease: [0.22, 1, 0.36, 1],
      },
    });
  }, [impactBurst, reduceMotion, sceneControls]);

  return (
    <section
      className={styles.heroSection}
      data-mobile-layout={isMobile ? "true" : "false"}
      aria-labelledby="champions-main-title"
    >
      <div className={styles.heroInner}>
        <p className={styles.eyebrow}>{CHAMPIONS_PROTOTYPE.eventTitle}</p>

        <div className={styles.titleBlock}>
          <motion.div
            className={styles.titleSweep}
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={
              titleVisible
                ? { opacity: 1, y: 0 }
                : reduceMotion
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 18 }
            }
            transition={{
              duration: reduceMotion ? 0 : 0.75,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <h1 id="champions-main-title" className={styles.mainTitle}>
              {CHAMPIONS_PROTOTYPE.championHeading}
            </h1>
          </motion.div>
          <motion.p
            className={styles.subTitle}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: titleVisible ? 1 : reduceMotion ? 1 : 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.6,
              delay: reduceMotion ? 0 : 0.12,
            }}
          >
            {CHAMPIONS_PROTOTYPE.championSubheading}
          </motion.p>
        </div>

        <motion.div
          className={styles.sceneCamera}
          initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: 40 }}
          animate={sceneControls}
        >
          <div className={styles.stageLayout}>
            <div className={styles.championColumn}>
              <CeremonyStage
                participantName={champion.name}
                glowActive={glowActive}
                podiumVisible={winnerVisible || ceremonyComplete}
                reduceMotion={reduceMotion}
                foregroundConfetti={foregroundConfetti}
                foregroundFireworks={foregroundFireworks}
                confettiBurst={confettiBurst}
                impactBurst={impactBurst && !ceremonyComplete}
                ceremonySettled={ceremonyComplete}
                stadiumLightsBoost={stadiumLightsBoost}
                isMobile={isMobile}
              />
              <WinnerNameplate
                participant={champion}
                visible={nameplateVisible}
                reduceMotion={reduceMotion}
                glowEnabled={!ceremonyComplete}
                compact={isMobile}
              />
            </div>

            <div className={styles.runnersMobileStack}>
              <RunnerUpPanel
                participant={runnerUp}
                variant="silver"
                visible={runnersVisible}
                reduceMotion={reduceMotion}
                floatEnabled={false}
                side="left"
                compact={isMobile}
              />
              <RunnerUpPanel
                participant={secondRunnerUp}
                variant="bronze"
                visible={runnersVisible}
                reduceMotion={reduceMotion}
                floatEnabled={false}
                side="right"
                compact={isMobile}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
