"use client";

import styles from "../champions.module.css";

type CeremonyBackgroundProps = {
  lightsOn: boolean;
  showConfetti: boolean;
  showFireworks: boolean;
  confettiCount: number;
};

const FIREWORK_COUNT = 3;

export function CeremonyBackground({
  lightsOn,
  showConfetti,
  showFireworks,
  confettiCount,
}: CeremonyBackgroundProps) {
  return (
    <div className={styles.backgroundRoot} aria-hidden>
      <div className={styles.stadiumSeats} />
      <div className={styles.crowdLights} />
      <div className={styles.haze} />
      <div className={styles.halo} />
      <div className={styles.lensFlare} />

      <div
        className={[styles.lightArrays, lightsOn ? styles.lightArraysOn : ""].join(
          " ",
        )}
      >
        <span className={styles.lightBeam} />
        <span className={styles.lightBeam} />
        <span className={styles.lightBeam} />
        <span className={styles.lightBeam} />
      </div>

      {showFireworks && (
        <div className={styles.fireworksLayer}>
          {Array.from({ length: FIREWORK_COUNT }).map((_, index) => (
            <span key={index} className={styles.firework} />
          ))}
        </div>
      )}

      {showConfetti && (
        <div className={styles.confettiLayer}>
          {Array.from({ length: confettiCount }).map((_, index) => (
            <span
              key={index}
              className={[
                styles.confettiPiece,
                index % 2 === 0
                  ? styles.confettiPieceGold
                  : styles.confettiPieceWhite,
              ].join(" ")}
              style={{
                left: `${4 + (index * 7.5) % 92}%`,
                animationDelay: `${(index % 8) * 0.45}s`,
                animationDuration: `${12 + (index % 5)}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
