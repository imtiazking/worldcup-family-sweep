"use client";

import { motion } from "framer-motion";
import type { CeremonyFinalData } from "../types";
import styles from "../champions.module.css";

type CeremonyFinalScoreProps = {
  final: CeremonyFinalData;
  visible: boolean;
  reduceMotion: boolean;
};

export function CeremonyFinalScore({
  final,
  visible,
  reduceMotion,
}: CeremonyFinalScoreProps) {
  return (
    <motion.aside
      className={styles.ceremonyFinalScore}
      aria-label="Final match result"
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      transition={{ duration: reduceMotion ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className={styles.ceremonyFinalScoreLabel}>Final</p>
      <p className={styles.ceremonyFinalScoreLine}>{final.scoreLine}</p>
      <p className={styles.ceremonyFinalScoreNote}>{final.note}</p>
    </motion.aside>
  );
}
