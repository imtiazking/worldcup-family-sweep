"use client";

import { useEffect, useState } from "react";
import { useMotionSettings } from "./motion-utils";

type FlashPoint = {
  id: number;
  x: number;
  y: number;
};

/**
 * Subtle stadium presentation layer behind the trophy hero.
 * CSS-driven silhouette + mist; one tiny flash element recycled via timeout.
 */
export function TrophyStadiumAtmosphere() {
  const { reduceMotion, isMobile } = useMotionSettings();
  const [flash, setFlash] = useState<FlashPoint | null>(null);

  useEffect(() => {
    if (reduceMotion) return;

    let clearFlashTimeout: ReturnType<typeof setTimeout> | undefined;
    let scheduleTimeout: ReturnType<typeof setTimeout> | undefined;
    let mounted = true;

    const scheduleFlash = () => {
      const delay = 6000 + Math.random() * 4000;
      scheduleTimeout = setTimeout(() => {
        if (!mounted) return;

        setFlash({
          id: Date.now(),
          x: 12 + Math.random() * 76,
          y: 18 + Math.random() * 55,
        });

        clearFlashTimeout = setTimeout(() => {
          if (mounted) setFlash(null);
        }, 100 + Math.random() * 100);

        scheduleFlash();
      }, delay);
    };

    const initialDelay = setTimeout(scheduleFlash, 2000 + Math.random() * 3000);

    return () => {
      mounted = false;
      clearTimeout(initialDelay);
      clearTimeout(scheduleTimeout);
      clearTimeout(clearFlashTimeout);
    };
  }, [reduceMotion]);

  return (
    <div
      className={[
        "tracker-stadium-atmosphere pointer-events-none absolute inset-0 z-0 overflow-hidden",
        isMobile ? "tracker-stadium-atmosphere--mobile" : "",
      ].join(" ")}
      aria-hidden
    >
      <svg
        className="tracker-stadium-silhouette"
        viewBox="0 0 280 200"
        preserveAspectRatio="xMidYMax meet"
      >
        <defs>
          <linearGradient id="stadium-rim-gold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(245,197,66,0.5)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.7)" />
            <stop offset="100%" stopColor="rgba(245,197,66,0.5)" />
          </linearGradient>
        </defs>

        {/* Stadium bowl rim */}
        <path
          d="M 16 138 Q 140 52 264 138"
          fill="none"
          stroke="url(#stadium-rim-gold)"
          strokeWidth="1.4"
        />
        <path
          d="M 42 132 Q 140 78 238 132"
          fill="none"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="0.7"
        />

        {/* Floodlight towers */}
        <path
          d="M 38 138 L 32 92"
          stroke="rgba(245,197,66,0.55)"
          strokeWidth="1"
        />
        <path
          d="M 242 138 L 248 92"
          stroke="rgba(245,197,66,0.55)"
          strokeWidth="1"
        />

        {/* Curved light beams */}
        <path
          d="M 32 92 Q 70 72 108 88"
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="0.6"
        />
        <path
          d="M 248 92 Q 210 72 172 88"
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="0.6"
        />
        <path
          d="M 32 92 Q 140 68 248 92"
          fill="none"
          stroke="rgba(245,197,66,0.2)"
          strokeWidth="0.5"
        />

        {/* Rim lights */}
        {[50, 80, 110, 140, 170, 200, 230].map((x, i) => {
          const t = (x - 16) / (264 - 16);
          const y = 138 - Math.sin(t * Math.PI) * 86;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="1.6"
              fill={i % 2 === 0 ? "rgba(245,197,66,0.65)" : "rgba(255,255,255,0.5)"}
            />
          );
        })}
      </svg>

      <div className="tracker-trophy-mist" />

      {!reduceMotion && flash && (
        <span
          key={flash.id}
          className="tracker-camera-flash"
          style={{ left: `${flash.x}%`, top: `${flash.y}%` }}
        />
      )}
    </div>
  );
}
