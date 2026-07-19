"use client";

import { motion } from "framer-motion";
import type { CeremonyParticipant } from "../types";
import { CeremonyFlag } from "./CeremonyFlag";
import styles from "../champions.module.css";

type RunnerUpPanelProps = {
  participant: CeremonyParticipant;
  variant: "silver" | "bronze";
  visible: boolean;
  reduceMotion: boolean;
  floatEnabled: boolean;
  side: "left" | "right";
  compact?: boolean;
};

export function RunnerUpPanel({
  participant,
  variant,
  visible,
  reduceMotion,
  floatEnabled,
  side,
  compact = false,
}: RunnerUpPanelProps) {
  const panelClass =
    variant === "silver" ? styles.runnerPanelSilver : styles.runnerPanelBronze;
  const medal = variant === "silver" ? "🥈" : "🥉";
  const slideX = compact ? 0 : side === "left" ? -24 : 24;
  const slideY = compact ? 12 : 0;

  return (
    <motion.article
      className={[
        styles.runnerPanel,
        panelClass,
        side === "left" ? styles.runnerLeft : styles.runnerRight,
        compact ? styles.runnerPanelCompact : "",
      ].join(" ")}
      aria-label={`${participant.positionLabel}: ${participant.name}, ${participant.team}`}
      initial={reduceMotion ? false : { opacity: 0, x: slideX, y: slideY }}
      animate={
        visible
          ? {
              opacity: 1,
              x: 0,
              y: floatEnabled && !reduceMotion ? [0, -4, 0] : 0,
            }
          : reduceMotion
            ? { opacity: 1, x: 0, y: 0 }
            : { opacity: 0, x: slideX, y: slideY }
      }
      transition={{
        opacity: { duration: reduceMotion ? 0 : 0.75, ease: [0.22, 1, 0.36, 1] },
        x: { duration: reduceMotion ? 0 : 0.75, ease: [0.22, 1, 0.36, 1] },
        y: floatEnabled && !reduceMotion
          ? { duration: 7, repeat: Infinity, ease: "easeInOut" }
          : { duration: reduceMotion ? 0 : 0.75, ease: [0.22, 1, 0.36, 1] },
      }}
    >
      {compact ? (
        <>
          <p className={styles.runnerMedalCompact} aria-hidden>
            {medal}
          </p>
          <p className={styles.runnerFlagCompact}>
            <CeremonyFlag emoji={participant.flagEmoji} teamName={participant.team} />
          </p>
          <div className={styles.runnerCompactBody}>
            <p className={styles.runnerLabelCompact}>
              {participant.positionLabel.toUpperCase()}
            </p>
            <p className={styles.runnerTeamCompact}>
              {participant.team.toUpperCase()}
            </p>
            <p className={styles.runnerNameCompact}>
              {participant.name.toUpperCase()}
            </p>
          </div>
        </>
      ) : (
        <>
          <p className={styles.runnerLabel}>
            {participant.positionLabel.toUpperCase()}
          </p>
          <p className={styles.runnerMedal} aria-hidden>
            {medal}
          </p>
          <p className={styles.runnerFlag}>
            <CeremonyFlag emoji={participant.flagEmoji} teamName={participant.team} />
          </p>
          <p className={styles.runnerTeam}>{participant.team.toUpperCase()}</p>
          <p className={styles.runnerName}>{participant.name.toUpperCase()}</p>
        </>
      )}
    </motion.article>
  );
}
