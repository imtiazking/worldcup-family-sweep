"use client";

import { TrackerCelebration } from "../TrackerCelebration";
import { useMotionSettings } from "../motion-utils";

type WheelStageEffectsProps = {
  active: boolean;
  intense?: boolean;
};

export function WheelStageEffects({
  active,
  intense = false,
}: WheelStageEffectsProps) {
  const { reduceMotion } = useMotionSettings();

  if (!active || reduceMotion) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="losers-wheel-spotlight losers-wheel-spotlight-center" />
      <div className="losers-wheel-spotlight losers-wheel-spotlight-left" />
      <div className="losers-wheel-spotlight losers-wheel-spotlight-right" />
      {intense && (
        <>
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="losers-wheel-gold-particle"
              style={{
                left: `${10 + ((i * 17) % 80)}%`,
                top: `${8 + ((i * 23) % 75)}%`,
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </>
      )}
      <TrackerCelebration burst={intense} />
    </div>
  );
}
