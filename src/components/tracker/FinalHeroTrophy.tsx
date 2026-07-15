"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import { GoldFootballTrophyIcon } from "./GoldFootballTrophyIcon";
import { TrophyStadiumAtmosphere } from "./TrophyStadiumAtmosphere";
import { floatTransition, revealTransition, useMotionSettings } from "./motion-utils";
import styles from "./world-cup-final-hero.module.css";

const TROPHY_SRC = "/images/world-cup-trophy.png";
const TROPHY_WIDTH = 341;
const TROPHY_HEIGHT = 521;

export function FinalHeroTrophy() {
  const { reduceMotion, isMobile, intensity } = useMotionSettings();
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      className={styles.trophyWrap}
      initial={reduceMotion ? false : { scale: 0.88, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={revealTransition(0.12, reduceMotion)}
    >
      <TrophyStadiumAtmosphere />
      <div className="tracker-trophy-glow-outer" aria-hidden />
      <div className={styles.trophyGlowInner} aria-hidden />

      <motion.div
        className={styles.trophyFloat}
        animate={
          reduceMotion
            ? undefined
            : {
                y: [-4 * intensity, 4 * intensity, -4 * intensity],
              }
        }
        transition={floatTransition(reduceMotion, isMobile)}
      >
        {imageError ? (
          <GoldFootballTrophyIcon className={styles.trophyFallback} />
        ) : (
          <Image
            src={TROPHY_SRC}
            alt="FIFA World Cup trophy"
            width={TROPHY_WIDTH}
            height={TROPHY_HEIGHT}
            className={styles.trophyImage}
            priority
            onError={() => setImageError(true)}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
