"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  CHAMPION_CUTOUT_IMAGE_HEIGHT,
  CHAMPION_CUTOUT_IMAGE_SRC,
  CHAMPION_CUTOUT_IMAGE_WIDTH,
} from "../constants";
import { CeremonyPodium } from "./CeremonyPodium";
import styles from "../champions.module.css";

type CeremonyStageProps = {
  participantName: string;
  glowActive: boolean;
  podiumVisible: boolean;
  reduceMotion: boolean;
  foregroundConfetti: boolean;
  foregroundFireworks: boolean;
  confettiBurst: boolean;
  impactBurst: boolean;
  ceremonySettled: boolean;
  stadiumLightsBoost: boolean;
  isMobile: boolean;
};

const FOREGROUND_CONFETTI_DESKTOP = 12;
const FOREGROUND_CONFETTI_MOBILE = 4;
const REAR_CONFETTI_DESKTOP = 9;
const REAR_CONFETTI_MOBILE = 3;
const MOBILE_FIREWORKS = 2;
const DESKTOP_FIREWORKS = 4;

export function CeremonyStage({
  participantName,
  glowActive,
  podiumVisible,
  reduceMotion,
  foregroundConfetti,
  foregroundFireworks,
  confettiBurst,
  impactBurst,
  ceremonySettled,
  stadiumLightsBoost,
  isMobile,
}: CeremonyStageProps) {
  const rearConfettiCount = isMobile ? REAR_CONFETTI_MOBILE : REAR_CONFETTI_DESKTOP;
  const foregroundConfettiCount = isMobile
    ? FOREGROUND_CONFETTI_MOBILE
    : FOREGROUND_CONFETTI_DESKTOP;

  const [showBurstFlash, setShowBurstFlash] = useState(false);

  useEffect(() => {
    if (!impactBurst || reduceMotion) return;
    setShowBurstFlash(true);
    const timer = window.setTimeout(() => setShowBurstFlash(false), 900);
    return () => window.clearTimeout(timer);
  }, [impactBurst, reduceMotion]);

  const stageClass = [
    styles.ceremonyStage,
    isMobile ? styles.ceremonyStageMobile : "",
    ceremonySettled ? styles.ceremonyStageSettled : "",
    stadiumLightsBoost ? styles.ceremonyStageLightsBoost : "",
  ].join(" ");

  const fireworkCount = isMobile ? MOBILE_FIREWORKS : DESKTOP_FIREWORKS;

  return (
    <div className={styles.ceremonyStageRoot}>
      <div className={stageClass}>
        {/* Layer 1 — far stadium */}
        <div className={styles.stageFarStadium} aria-hidden>
          <div className={styles.stageStadiumArc} />
          <div className={styles.stageStadiumCrowd} />
        </div>

        {/* Layer 2 — crowd lights */}
        <div className={styles.stageCrowdLights} aria-hidden>
          <span className={styles.stageCrowdBeam} />
          <span className={styles.stageCrowdBeam} />
          <span className={styles.stageCrowdBeam} />
          <span className={styles.stageCrowdBeam} />
        </div>

        {/* Layer 3 — background fireworks */}
        {foregroundFireworks && (
          <div className={styles.stageFireworks} aria-hidden>
            {Array.from({ length: fireworkCount }).map((_, index) => (
              <span key={index} className={styles.stageFirework} />
            ))}
          </div>
        )}

        {/* Rear confetti — passes behind the winner */}
        {foregroundConfetti && (
          <div className={styles.stageConfettiRear} aria-hidden>
            {Array.from({ length: rearConfettiCount }).map((_, index) => (
              <span
                key={index}
                className={[
                  styles.stageConfetti,
                  styles.stageConfettiRearPiece,
                  index % 2 === 0
                    ? styles.stageConfettiGold
                    : styles.stageConfettiWhite,
                  confettiBurst ? styles.stageConfettiBurst : "",
                ].join(" ")}
                style={{
                  left: `${8 + (index * 9.5) % 84}%`,
                  animationDelay: confettiBurst
                    ? `${index * 0.05}s`
                    : `${(index % 5) * 0.55}s`,
                  animationDuration: confettiBurst
                    ? `${7 + (index % 3)}s`
                    : `${12 + (index % 4)}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Layer 4 — trophy rear lighting + champion cut-out */}
        <div className={styles.stageWinnerLayer}>
          <div
            className={[
              styles.trophyGodRays,
              glowActive ? styles.trophyGodRaysActive : "",
            ].join(" ")}
            aria-hidden
          />
          <div
            className={[
              styles.trophyHalo,
              glowActive ? styles.trophyHaloPulse : "",
            ].join(" ")}
            aria-hidden
          />
          <div className={styles.trophyBloom} aria-hidden />
          <div className={styles.trophyCoreGlow} aria-hidden />
          <div className={styles.trophyParticles} aria-hidden>
            {Array.from({ length: isMobile ? 4 : 8 }).map((_, index) => (
              <span
                key={index}
                className={styles.trophyParticle}
                style={{
                  left: `${30 + index * 5}%`,
                  animationDelay: `${index * 0.32}s`,
                }}
              />
            ))}
          </div>

          {showBurstFlash && (
            <div className={styles.stageImpactBurst} aria-hidden />
          )}

          <div className={styles.winnerCutoutWrap}>
            <div className={styles.winnerRimLight} aria-hidden />
            <Image
              src={CHAMPION_CUTOUT_IMAGE_SRC}
              alt={`${participantName} lifting the FIFA World Cup trophy`}
              width={CHAMPION_CUTOUT_IMAGE_WIDTH}
              height={CHAMPION_CUTOUT_IMAGE_HEIGHT}
              className={styles.winnerCutout}
              priority
              sizes="(max-width: 767px) 78vw, (max-width: 1024px) 58vw, 43.5rem"
            />
          </div>

          <CeremonyPodium visible={podiumVisible} />
          <div className={styles.stagePodiumShadow} aria-hidden />
          <div className={styles.stageContactShadow} aria-hidden />

          <div className={styles.stageLegSmoke} aria-hidden />
          <div className={styles.stagePedestalMist} aria-hidden />
        </div>

        {/* Layer 5 — foreground atmosphere */}
        <div className={styles.stageForeground} aria-hidden>
          <div className={styles.stageSmokeLeft} />
          <div className={styles.stageSmokeRight} />
          <div className={styles.stageFloorHaze} />
          <div className={styles.stageLightRays}>
            <span className={styles.stageLightRay} />
            <span className={styles.stageLightRay} />
            <span className={styles.stageLightRay} />
          </div>
          <div className={styles.stageLensFlare} />

          {foregroundConfetti &&
            Array.from({ length: foregroundConfettiCount }).map((_, index) => (
              <span
                key={index}
                className={[
                  styles.stageConfetti,
                  styles.stageConfettiFrontPiece,
                  index % 2 === 0
                    ? styles.stageConfettiGold
                    : styles.stageConfettiWhite,
                  confettiBurst ? styles.stageConfettiBurst : "",
                ].join(" ")}
                style={{
                  left: `${3 + (index * 7.2) % 94}%`,
                  animationDelay: confettiBurst
                    ? `${0.08 + index * 0.04}s`
                    : `${(index % 6) * 0.45}s`,
                  animationDuration: confettiBurst
                    ? `${6.5 + (index % 3) * 0.5}s`
                    : `${11 + (index % 4)}s`,
                }}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
