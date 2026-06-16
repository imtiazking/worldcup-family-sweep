"use client";

import { motion } from "framer-motion";
import { GoldFootballTrophyIcon } from "./GoldFootballTrophyIcon";
import { floatTransition, revealTransition, useMotionSettings } from "./motion-utils";

type FloatingTrophyProps = {
  hasWinner: boolean;
  className?: string;
};

export function FloatingTrophy({
  hasWinner,
  className = "",
}: FloatingTrophyProps) {
  const { reduceMotion, isMobile, intensity } = useMotionSettings();

  return (
    <motion.div
      className={[
        "relative mx-auto mt-3 max-md:max-w-[190px] md:mt-8",
        className,
      ].join(" ")}
      initial={reduceMotion ? false : { scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={revealTransition(0, reduceMotion)}
    >
      {/* Spotlight */}
      <div
        className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.22)_0%,transparent_68%)]"
        aria-hidden
      />

      {/* Gold halo */}
      <motion.div
        className={[
          "absolute inset-0 rounded-full",
          hasWinner ? "tracker-trophy-shimmer" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: hasWinner ? 1 : 0.55 }}
        transition={{ duration: 1.2, delay: 0.2 }}
        style={{
          boxShadow: isMobile
            ? "0 0 36px rgba(212, 175, 55, 0.28)"
            : "0 0 80px rgba(212, 175, 55, 0.35)",
        }}
        aria-hidden
      />

      <motion.div
        className={[
          "relative flex items-center justify-center rounded-full",
          "border border-wc-gold/30 bg-wc-gold/10",
          "h-[170px] min-h-[150px] w-[170px]",
          "max-md:shadow-[0_0_40px_rgba(245,197,66,0.2)]",
          "md:h-40 md:min-h-0 md:w-40 md:shadow-[0_0_80px_rgba(245,197,66,0.25)]",
        ].join(" ")}
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
            className="tracker-trophy-first-shine pointer-events-none absolute inset-0 overflow-hidden rounded-full"
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
          <GoldFootballTrophyIcon />
        </div>
      </motion.div>
    </motion.div>
  );
}
