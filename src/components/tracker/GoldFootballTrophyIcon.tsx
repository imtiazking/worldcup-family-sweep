"use client";

import { useId } from "react";

type GoldFootballTrophyIconProps = {
  className?: string;
};

/** Fallback SVG when the World Cup trophy image cannot load. */
export function GoldFootballTrophyIcon({
  className = "h-[88px] w-[72px] md:h-[96px] md:w-[80px]",
}: GoldFootballTrophyIconProps) {
  const uid = useId().replace(/:/g, "");
  const gold = `trophy-gold-${uid}`;
  const goldDark = `trophy-gold-dark-${uid}`;
  const shine = `trophy-shine-${uid}`;

  return (
    <svg
      role="img"
      aria-label="Gold football trophy"
      viewBox="0 0 80 96"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Gold football trophy</title>
      <defs>
        <linearGradient id={gold} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f5e6a8" />
          <stop offset="45%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#9a7b28" />
        </linearGradient>
        <linearGradient id={goldDark} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#c9a227" />
          <stop offset="100%" stopColor="#7a6118" />
        </linearGradient>
        <radialGradient id={shine} cx="35%" cy="25%" r="55%">
          <stop offset="0%" stopColor="#fff8dc" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Base */}
      <rect
        x="18"
        y="84"
        width="44"
        height="6"
        rx="2"
        fill={`url(#${goldDark})`}
      />
      <rect x="28" y="76" width="24" height="8" rx="1" fill={`url(#${gold})`} />

      {/* Stem */}
      <path
        d="M36 58 L36 76 L44 76 L44 58 Z"
        fill={`url(#${goldDark})`}
      />

      {/* Cup body — classic generic goblet */}
      <path
        d="M40 12 C24 12 14 24 14 38 C14 50 22 56 40 58 C58 56 66 50 66 38 C66 24 56 12 40 12 Z"
        fill={`url(#${gold})`}
      />
      <ellipse cx="40" cy="38" rx="26" ry="20" fill={`url(#${shine})`} />

      {/* Left handle */}
      <path
        d="M14 30 C4 30 2 42 8 48 C12 52 14 48 14 44"
        fill="none"
        stroke={`url(#${gold})`}
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Right handle */}
      <path
        d="M66 30 C76 30 78 42 72 48 C68 52 66 48 66 44"
        fill="none"
        stroke={`url(#${gold})`}
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Football on top — generic pentagon hint */}
      <circle cx="40" cy="10" r="9" fill="#1a2d1a" stroke={`url(#${gold})`} strokeWidth="1.5" />
      <path
        d="M40 4 L43 8 L42 13 L38 13 L37 8 Z"
        fill={`url(#${gold})`}
        opacity="0.95"
      />
      <path
        d="M34 11 L37 14 L40 12 L43 14 L46 11"
        fill="none"
        stroke="#d4af37"
        strokeWidth="0.8"
        opacity="0.7"
      />
    </svg>
  );
}
