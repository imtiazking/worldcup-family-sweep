"use client";

import { motion } from "framer-motion";
import { useMotionSettings } from "./motion-utils";

export function BracketConnector() {
  const { reduceMotion } = useMotionSettings();

  if (reduceMotion) {
    return (
      <div className="flex flex-col items-center py-2 text-wc-gold/50" aria-hidden>
        <div className="h-4 w-px bg-wc-gold/20" />
        <span className="my-1 text-lg leading-none">↓</span>
        <div className="h-4 w-px bg-wc-gold/20" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-2" aria-hidden>
      <div className="relative h-4 w-1 overflow-hidden rounded-full bg-wc-gold/10">
        <div className="bracket-energy-line absolute inset-0" />
      </div>
      <motion.span
        className="my-1 text-lg leading-none text-wc-gold/60"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        ↓
      </motion.span>
      <div className="relative h-4 w-1 overflow-hidden rounded-full bg-wc-gold/10">
        <div className="bracket-energy-line bracket-energy-line-delay absolute inset-0" />
      </div>
    </div>
  );
}
