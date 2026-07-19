"use client";

import styles from "../champions.module.css";

export function CeremonyPodium({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <div className={styles.podiumRoot} aria-hidden>
      <div className={styles.podiumSideLeft + " " + styles.podiumSide} />
      <div className={styles.podiumSideRight + " " + styles.podiumSide} />
      <div className={styles.podiumCenter} />
      <div className={styles.podiumReflection} />
      <div className={styles.podiumParticles}>
        {Array.from({ length: 8 }).map((_, index) => (
          <span
            key={index}
            className={styles.podiumParticle}
            style={{
              left: `${12 + index * 10}%`,
              animationDelay: `${index * 0.35}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
