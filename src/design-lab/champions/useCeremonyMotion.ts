"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { MOTION_INTENSITY_MULTIPLIER } from "./constants";
import type { MotionIntensityLevel } from "./types";

export function useCeremonyMotion(motionIntensity: MotionIntensityLevel) {
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const reduceMotion = prefersReducedMotion === true;
  const intensityMultiplier = MOTION_INTENSITY_MULTIPLIER[motionIntensity];

  const intensity = useMemo(() => {
    if (reduceMotion) return 0;
    const base = isMobile ? 0.75 : 1;
    return base * intensityMultiplier;
  }, [intensityMultiplier, isMobile, reduceMotion]);

  return {
    reduceMotion,
    isMobile,
    intensity,
    intensityMultiplier,
  };
}
