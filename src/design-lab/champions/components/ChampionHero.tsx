"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";
import { CHAMPIONS_PROTOTYPE } from "../constants";
import type {
  CeremonyParticipant,
  CeremonyPodiumData,
  CeremonyPresentation,
  CeremonySequenceStep,
} from "../types";
import { CeremonyStage } from "./CeremonyStage";
import { RunnerUpPanel } from "./RunnerUpPanel";
import { WinnerNameplate } from "./WinnerNameplate";
import styles from "../champions.module.css";

type ChampionHeroProps = {
  presentation?: CeremonyPresentation;
  champion: CeremonyParticipant;
  runnerUp: CeremonyParticipant;
  secondRunnerUp: CeremonyParticipant;
  podium?: CeremonyPodiumData;
  isStepActive: (step: CeremonySequenceStep) => boolean;
  ceremonyComplete: boolean;
  progress?: number;
  reduceMotion: boolean;
  foregroundConfetti: boolean;
  foregroundFireworks: boolean;
  isMobile: boolean;
};

export function ChampionHero({
  presentation = "trophy-podium",
  champion,
  runnerUp,
  secondRunnerUp,
  podium,
  isStepActive,
  ceremonyComplete,
  progress = 0,
  reduceMotion,
  foregroundConfetti,
  foregroundFireworks,
  isMobile,
}: ChampionHeroProps) {
  const isTrophyMode = presentation === "trophy-podium";
  const isFamilyPodium = presentation === "family-podium";
  const isPodiumLayout = isTrophyMode || isFamilyPodium;
  const titleVisible = isStepActive("title");
  const runnersVisible = isStepActive("runners");
  const winnerVisible = isStepActive("winner");
  const glowActive = isStepActive("glow") || ceremonyComplete;
  const climaxGlow = isPodiumLayout && (isStepActive("glow") || ceremonyComplete);
  const nameplateVisible = isStepActive("nameplate") || ceremonyComplete;
  const confettiBurst = isStepActive("confetti") || (isPodiumLayout && winnerVisible);
  const impactBurst = isStepActive("glow");
  const stadiumLightsBoost = isStepActive("glow") || confettiBurst;
  const spotlightsActive =
    isStepActive("lights") || isStepActive("podium-rise") || ceremonyComplete;

  const podiumBaseVisible =
    isStepActive("podium-rise") || ceremonyComplete;
  const thirdPodiumVisible = isStepActive("third-rise") || ceremonyComplete;
  const secondPodiumVisible = isStepActive("second-rise") || ceremonyComplete;
  const spainPodiumVisible = winnerVisible || ceremonyComplete;

  const podiumRiseVisible = isStepActive("podium-rise");

  const cameraStyle = useMemo(() => {
    if (!isPodiumLayout || reduceMotion) return undefined;
    const dolly = Math.min(1, progress / 0.54);
    const orbit =
      progress >= 0.72 ? Math.min(1, (progress - 0.72) / 0.28) : 0;
    const wide = 1 - dolly * 0.22;
    return {
      "--ceremony-dolly": dolly,
      "--ceremony-orbit": orbit,
      "--ceremony-wide-scale": wide,
    } as React.CSSProperties;
  }, [isPodiumLayout, progress, reduceMotion]);

  const sceneControls = useAnimation();
  const impactPlayedRef = useRef(false);

  useEffect(() => {
    if (reduceMotion) {
      sceneControls.set({ opacity: 1 });
      return;
    }

    if (isPodiumLayout ? podiumRiseVisible : winnerVisible) {
      sceneControls.start({
        opacity: 1,
        transition: { duration: 1.15, ease: [0.22, 1, 0.36, 1] },
      });
    } else {
      sceneControls.set({ opacity: 0 });
      impactPlayedRef.current = false;
    }
  }, [isPodiumLayout, podiumRiseVisible, reduceMotion, sceneControls, winnerVisible]);

  useEffect(() => {
    if (reduceMotion || !impactBurst || impactPlayedRef.current || !isTrophyMode) {
      return;
    }

    impactPlayedRef.current = true;
  }, [impactBurst, isTrophyMode, reduceMotion]);

  const familyPodiumVisible = winnerVisible || ceremonyComplete;

  return (
    <section
      className={[
        styles.heroSection,
        isPodiumLayout ? styles.heroSectionTrophy : "",
        isFamilyPodium ? styles.heroSectionFamilyPodium : "",
      ].join(" ")}
      data-mobile-layout={isMobile ? "true" : "false"}
      aria-labelledby="champions-main-title"
    >
      <div className={styles.heroInner}>
        {(!isTrophyMode || isFamilyPodium) && (
          <p className={styles.eyebrow}>{CHAMPIONS_PROTOTYPE.eventTitle}</p>
        )}

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
          className={[
            styles.sceneCamera,
            isPodiumLayout ? styles.sceneCameraTrophy : "",
            isPodiumLayout && (isStepActive("camera-orbit") || ceremonyComplete)
              ? styles.sceneCameraOrbit
              : "",
          ].join(" ")}
          style={cameraStyle}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={sceneControls}
        >
          <div
            className={[
              styles.stageLayout,
              isPodiumLayout ? styles.stageLayoutTrophy : "",
            ].join(" ")}
          >
            <div className={styles.championColumn}>
              <CeremonyStage
                presentation={presentation}
                podium={podium}
                glowActive={glowActive}
                climaxGlow={climaxGlow}
                spotlightsActive={spotlightsActive}
                podiumVisible={
                  isPodiumLayout ? spainPodiumVisible : familyPodiumVisible
                }
                podiumBaseVisible={podiumBaseVisible}
                thirdPodiumVisible={thirdPodiumVisible}
                secondPodiumVisible={secondPodiumVisible}
                reduceMotion={reduceMotion}
                foregroundConfetti={foregroundConfetti}
                foregroundFireworks={foregroundFireworks}
                confettiBurst={confettiBurst}
                impactBurst={impactBurst && !ceremonyComplete}
                ceremonySettled={ceremonyComplete}
                stadiumLightsBoost={stadiumLightsBoost}
                isMobile={isMobile}
              />
              {presentation === "family" && (
                <WinnerNameplate
                  participant={champion}
                  visible={nameplateVisible}
                  reduceMotion={reduceMotion}
                  glowEnabled={!ceremonyComplete}
                  compact={isMobile}
                />
              )}
            </div>

            {presentation === "family" && (
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
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
