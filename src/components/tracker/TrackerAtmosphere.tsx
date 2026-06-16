"use client";

import { useMotionSettings } from "./motion-utils";

export function TrackerAtmosphere() {
  const { reduceMotion, isMobile } = useMotionSettings();

  if (reduceMotion) return null;

  const particleCount = isMobile ? 4 : 14;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden max-md:opacity-80"
      aria-hidden
    >
      <div className="tracker-light-ray tracker-light-ray-1" />
      <div className="tracker-light-ray tracker-light-ray-2 max-md:hidden" />
      <div className="tracker-light-ray tracker-light-ray-3 max-md:hidden" />

      {Array.from({ length: particleCount }).map((_, i) => (
        <span
          key={i}
          className="tracker-particle"
          style={{
            left: `${8 + ((i * 37) % 84)}%`,
            top: `${5 + ((i * 23) % 90)}%`,
            animationDelay: `${i * 0.7}s`,
            animationDuration: `${14 + (i % 5) * 2}s`,
          }}
        />
      ))}
    </div>
  );
}
