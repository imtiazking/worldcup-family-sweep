"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

export function useMotionSettings() {
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const reduceMotion = prefersReducedMotion === true;

  return {
    reduceMotion,
    isMobile,
    /** Scale animation intensity down on mobile */
    intensity: reduceMotion ? 0 : isMobile ? 0.6 : 1,
  };
}

export const EASE_BROADCAST = [0.22, 1, 0.36, 1] as const;

export function revealTransition(delay: number, reduceMotion: boolean) {
  if (reduceMotion) {
    return { duration: 0 };
  }
  return {
    duration: 0.65,
    delay,
    ease: EASE_BROADCAST,
  };
}

export function floatTransition(reduceMotion: boolean, isMobile: boolean) {
  if (reduceMotion) return undefined;
  return {
    duration: isMobile ? 8 : 6,
    repeat: Infinity,
    ease: "easeInOut" as const,
  };
}
