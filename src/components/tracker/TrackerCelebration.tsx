"use client";

import { useEffect, useState } from "react";

const COLORS = [
  "#d4af37",
  "#f0d060",
  "#00a651",
  "#e63946",
  "#ffffff",
  "#a8861e",
];

export function TrackerCelebration() {
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
    setPieces(
      Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 6 + Math.random() * 8,
      }))
    );
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="confetti-piece"
          style={{
            left: `${piece.left}%`,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            animationDuration: `${2.5 + Math.random() * 2}s`,
            animationDelay: `${piece.delay}s`,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  );
}
