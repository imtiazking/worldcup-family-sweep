"use client";

import { motion } from "framer-motion";
import type { CeremonyParticipant } from "../types";
import { CeremonyFlag } from "./CeremonyFlag";
import styles from "../champions.module.css";

type WinnerNameplateProps = {
  participant: CeremonyParticipant;
  visible: boolean;
  reduceMotion: boolean;
  glowEnabled?: boolean;
  compact?: boolean;
};

export function WinnerNameplate({
  participant,
  visible,
  reduceMotion,
  glowEnabled = true,
  compact = false,
}: WinnerNameplateProps) {
  return (
    <motion.aside
      className={[
        styles.nameplate,
        compact ? styles.nameplateCompact : "",
        visible && glowEnabled ? styles.nameplateGlow : "",
      ].join(" ")}
      aria-label={`Champion: ${participant.name}, ${participant.team}`}
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={
        visible
          ? { opacity: 1, y: 0 }
          : reduceMotion
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 16 }
      }
      transition={{
        duration: reduceMotion ? 0 : 0.7,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <span className={styles.laurel + " " + styles.laurelLeft} aria-hidden />
      <span className={styles.laurel + " " + styles.laurelRight} aria-hidden />
      <p className={styles.nameplateFlag}>
        <CeremonyFlag
          emoji={participant.flagEmoji}
          teamName={participant.team}
          size="lg"
        />
      </p>
      <p className={styles.nameplateName}>{participant.name.toUpperCase()}</p>
      <p className={styles.nameplateTeam}>{participant.team.toUpperCase()}</p>
      <p className={styles.nameplateRole}>
        {participant.positionLabel.toUpperCase()}
      </p>
    </motion.aside>
  );
}
