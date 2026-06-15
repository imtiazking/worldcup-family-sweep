"use client";

import { motion } from "framer-motion";
import { floatTransition, revealTransition, useMotionSettings } from "./motion-utils";

type FloatingTrophyProps = {
  hasWinner: boolean;
};

export function FloatingTrophy({ hasWinner }: FloatingTrophyProps) {
  const { reduceMotion, isMobile, intensity } = useMotionSettings();

  return (
    <motion.div
      className="relative mx-auto mt-8"
      initial={reduceMotion ? false : { scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={revealTransition(0, reduceMotion)}
    >
      <motion.div
        className={[
          "absolute inset-0 rounded-full",
          hasWinner ? "tracker-trophy-shimmer" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: hasWinner ? 1 : 0.6 }}
        transition={{ duration: 1.2, delay: 0.2 }}
        style={{
          boxShadow: "0 0 80px rgba(212, 175, 55, 0.35)",
        }}
      />

      <motion.div
        className="relative flex h-40 w-40 items-center justify-center rounded-full border border-wc-gold/30 bg-wc-gold/10 text-8xl shadow-[0_0_80px_rgba(245,197,66,0.25)]"
        animate={
          reduceMotion
            ? undefined
            : {
                y: [-6 * intensity, 6 * intensity, -6 * intensity],
              }
        }
        transition={floatTransition(reduceMotion, isMobile)}
      >
        <span className={hasWinner ? "tracker-trophy-icon-shimmer" : ""}>
          🏆
        </span>
      </motion.div>
    </motion.div>
  );
}
