"use client";

import { useEffect, useState } from "react";
import { useMotionSettings } from "./motion-utils";

const COLORS = [
  "#d4af37",
  "#f0d060",
  "#00a651",
  "#e63946",
  "#ffffff",
  "#a8861e",
];

type TrackerCelebrationProps = {
  /** Burst confetti on initial mount (winner state) */
  burst?: boolean;
};

export function TrackerCelebration({ burst = false }: TrackerCelebrationProps) {
  const { reduceMotion, isMobile } = useMotionSettings();
  const [pieces, setPieces] = useState<
    {
      id: number;
      left: number;
      delay: number;
      color: string;
      size: number;
    }[]
  >([]);

  useEffect(() => {
    if (reduceMotion) return;

    const count = burst ? (isMobile ? 35 : 70) : isMobile ? 25 : 50;
    setPieces(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: burst ? Math.random() * 0.5 : Math.random() * 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 6 + Math.random() * 8,
      }))
    );
  }, [burst, reduceMotion, isMobile]);

  if (reduceMotion || pieces.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className={burst ? "confetti-piece confetti-burst" : "confetti-piece"}
          style={{
            left: `${piece.left}%`,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            animationDuration: burst
              ? `${2 + Math.random() * 1.5}s`
              : `${2.5 + Math.random() * 2}s`,
            animationDelay: `${piece.delay}s`,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  );
}
