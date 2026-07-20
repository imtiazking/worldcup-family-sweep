"use client";

import { useEffect, useState } from "react";
import { CHAMPIONS_PROTOTYPE } from "../constants";
import type { CeremonyPresentation } from "../types";
import { CeremonyPodium } from "./CeremonyPodium";
import { CeremonySpotlights } from "./CeremonySpotlights";
import { WinnersPodiumStand } from "./WinnersPodiumStand";
import { WorldCupTrophy } from "./WorldCupTrophy";
import styles from "../champions.module.css";

type CeremonyStageProps = {
  presentation?: CeremonyPresentation;
  glowActive: boolean;
  climaxGlow?: boolean;
  spotlightsActive?: boolean;
  podiumVisible: boolean;
  podiumBaseVisible?: boolean;
  thirdPodiumVisible?: boolean;
  secondPodiumVisible?: boolean;
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
  presentation = "family",
  glowActive,
  climaxGlow = false,
  spotlightsActive = false,
  podiumVisible,
  podiumBaseVisible = false,
  thirdPodiumVisible = false,
  secondPodiumVisible = false,
  reduceMotion,
  foregroundConfetti,
  foregroundFireworks,
  confettiBurst,
  impactBurst,
  ceremonySettled,
  stadiumLightsBoost,
  isMobile,
}: CeremonyStageProps) {
  const isTrophyMode = presentation === "trophy-podium";
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
    isTrophyMode ? styles.ceremonyStageTrophy : "",
  ].join(" ");

  const fireworkCount = isMobile ? MOBILE_FIREWORKS : DESKTOP_FIREWORKS;

  const winnerLayerClass = [
    styles.stageWinnerLayer,
    isTrophyMode ? styles.stageWinnerLayerTrophy : styles.stageWinnerLayerPodiumOnly,
  ].join(" ");

  return (
    <div className={styles.ceremonyStageRoot}>
      <div className={stageClass}>
        <div className={styles.stageFarStadium} aria-hidden>
          <div className={styles.stageStadiumArc} />
          <div className={styles.stageStadiumCrowd} />
        </div>

        <div className={styles.stageCrowdLights} aria-hidden>
          <span className={styles.stageCrowdBeam} />
          <span className={styles.stageCrowdBeam} />
          <span className={styles.stageCrowdBeam} />
          <span className={styles.stageCrowdBeam} />
        </div>

        {foregroundFireworks && (
          <div className={styles.stageFireworks} aria-hidden>
            {Array.from({ length: fireworkCount }).map((_, index) => (
              <span key={index} className={styles.stageFirework} />
            ))}
          </div>
        )}

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

        <div className={winnerLayerClass}>
          {isTrophyMode && (
            <>
              <div
                className={[
                  styles.trophyGodRays,
                  glowActive ? styles.trophyGodRaysActive : "",
                  styles.trophyGodRaysHero,
                ].join(" ")}
                aria-hidden
              />
              <div
                className={[
                  styles.trophyHalo,
                  glowActive ? styles.trophyHaloPulse : "",
                  styles.trophyHaloHero,
                ].join(" ")}
                aria-hidden
              />
              <div
                className={[styles.trophyBloom, styles.trophyBloomHero].join(" ")}
                aria-hidden
              />
              <div
                className={[styles.trophyCoreGlow, styles.trophyCoreGlowHero].join(" ")}
                aria-hidden
              />
              <div
                className={[styles.trophyParticles, styles.trophyParticlesHero].join(" ")}
                aria-hidden
              >
                {Array.from({ length: isMobile ? 6 : 12 }).map((_, index) => (
                  <span
                    key={index}
                    className={styles.trophyParticle}
                    style={{
                      left: `${20 + index * 5.5}%`,
                      animationDelay: `${index * 0.28}s`,
                    }}
                  />
                ))}
              </div>

              {showBurstFlash && (
                <div
                  className={[styles.stageImpactBurst, styles.stageImpactBurstHero].join(
                    " ",
                  )}
                  aria-hidden
                />
              )}

              <CeremonySpotlights
                active={spotlightsActive}
                climax={climaxGlow}
                reduceMotion={reduceMotion}
              />
            </>
          )}

          {isTrophyMode ? (
            <div className={styles.trophyHeroStack}>
              <WorldCupTrophy
                glowActive={glowActive}
                climaxGlow={climaxGlow}
                reduceMotion={reduceMotion}
              />
              <WinnersPodiumStand
                first={CHAMPIONS_PROTOTYPE.podium.first}
                second={CHAMPIONS_PROTOTYPE.podium.second}
                third={CHAMPIONS_PROTOTYPE.podium.third}
                podiumBaseVisible={podiumBaseVisible}
                thirdVisible={thirdPodiumVisible}
                secondVisible={secondPodiumVisible}
                centerVisible={podiumVisible}
                reduceMotion={reduceMotion}
                goldPulse={climaxGlow}
              />
            </div>
          ) : (
            <CeremonyPodium visible={podiumVisible} />
          )}

          <div className={styles.stagePodiumShadow} aria-hidden />
          <div className={styles.stagePedestalMist} aria-hidden />
        </div>

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
