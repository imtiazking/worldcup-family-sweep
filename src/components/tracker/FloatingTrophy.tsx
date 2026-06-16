"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import { GoldFootballTrophyIcon } from "./GoldFootballTrophyIcon";
import { floatTransition, revealTransition, useMotionSettings } from "./motion-utils";

type FloatingTrophyProps = {
  hasWinner: boolean;
  className?: string;
};

const TROPHY_SRC = "/images/world-cup-trophy.png";
const TROPHY_WIDTH = 341;
const TROPHY_HEIGHT = 521;

export function FloatingTrophy({
  hasWinner,
  className = "",
}: FloatingTrophyProps) {
  const { reduceMotion, isMobile, intensity } = useMotionSettings();
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      className={[
        "relative mx-auto flex w-full max-w-[200px] flex-col items-center justify-center",
        "mt-3 md:mt-8 md:max-w-[280px]",
        className,
      ].join(" ")}
      initial={reduceMotion ? false : { scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={revealTransition(0, reduceMotion)}
    >
      {/* Spotlight — reduced ~50% so the trophy stays focal */}
      <div
        className="pointer-events-none absolute left-1/2 top-[52%] h-[115%] w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.11)_0%,transparent_70%)]"
        aria-hidden
      />

      {/* Gold halo */}
      <motion.div
        className={[
          "pointer-events-none absolute left-1/2 top-1/2 h-[88%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full",
          hasWinner ? "tracker-trophy-shimmer" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: hasWinner ? 1 : 0.55 }}
        transition={{ duration: 1.2, delay: 0.2 }}
        style={{
          boxShadow: isMobile
            ? "0 0 36px rgba(212, 175, 55, 0.14)"
            : "0 0 80px rgba(212, 175, 55, 0.175)",
        }}
        aria-hidden
      />

      <motion.div
        className="relative flex items-center justify-center"
        animate={
          reduceMotion
            ? undefined
            : {
                y: [-6 * intensity, 6 * intensity, -6 * intensity],
              }
        }
        transition={floatTransition(reduceMotion, isMobile)}
      >
        {/* First-load shine sweep */}
        {!reduceMotion && (
          <motion.div
            className="tracker-trophy-first-shine pointer-events-none absolute inset-0 overflow-hidden"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ delay: 0.4, duration: 1.4, ease: "easeOut" }}
            aria-hidden
          />
        )}

        <div
          className={[
            hasWinner ? "tracker-trophy-icon-shimmer" : "",
            "relative z-10 flex items-center justify-center",
          ].join(" ")}
        >
          {imageError ? (
            <GoldFootballTrophyIcon className="h-[170px] w-auto md:h-[240px]" />
          ) : (
            <Image
              src={TROPHY_SRC}
              alt="FIFA World Cup trophy"
              width={TROPHY_WIDTH}
              height={TROPHY_HEIGHT}
              className="h-[170px] w-auto object-contain md:h-[240px]"
              priority
              onError={() => setImageError(true)}
            />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
