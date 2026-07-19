"use client";

import { motion } from "framer-motion";
import { CHAMPIONS_PROTOTYPE } from "../constants";
import styles from "../champions.module.css";

type ClosingSectionProps = {
  visible: boolean;
  reduceMotion: boolean;
  heading?: string;
  tagline?: string;
  footnote?: string;
};

export function ClosingSection({
  visible,
  reduceMotion,
  heading,
  tagline,
  footnote,
}: ClosingSectionProps) {
  const { closing } = CHAMPIONS_PROTOTYPE;

  return (
    <motion.section
      className={styles.closingSection}
      aria-labelledby="champions-closing-heading"
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={
        visible
          ? { opacity: 1, y: 0 }
          : reduceMotion
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 12 }
      }
      transition={{ duration: reduceMotion ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={styles.trophyDivider} aria-hidden>
        <span className={styles.trophyDividerLine} />
        <span className={styles.trophyDividerIcon}>⚽</span>
        <span className={styles.trophyDividerLine} />
      </div>
      <h2 id="champions-closing-heading" className={styles.closingTitle}>
        {heading ?? closing.heading}
      </h2>
      <p className={styles.closingTagline}>{tagline ?? closing.tagline}</p>
      <p className={styles.closingFootnote}>{footnote ?? closing.footnote}</p>
    </motion.section>
  );
}
