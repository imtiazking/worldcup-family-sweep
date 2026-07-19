/**
 * Prototype ceremony data — replace with live Supabase results in production.
 */
export const CHAMPIONS_PROTOTYPE = {
  eventTitle: "FAMILY WORLD CUP SWEEP 2026",
  championHeading: "CHAMPION",
  championSubheading: "WORLD CUP WINNER",
  champion: {
    name: "Zavier",
    team: "Spain",
    flagEmoji: "🇪🇸",
    positionLabel: "Champion",
  },
  runnerUp: {
    name: "Imi",
    team: "Argentina",
    flagEmoji: "🇦🇷",
    positionLabel: "Runner-up",
  },
  secondRunnerUp: {
    name: "Nabeel",
    team: "France",
    flagEmoji: "🇫🇷",
    positionLabel: "Second runner-up",
  },
  closing: {
    heading: "THE CHAMPIONS",
    tagline: "Glory. Bragging Rights. Family Legend.",
    footnote: "One tournament. One winner. Forever remembered.",
  },
} as const;

/** Transparent champion cut-out for the ceremony stage. */
export const CHAMPION_CUTOUT_IMAGE_SRC = "/design-lab/champion-cutout.png";

/** Intrinsic dimensions of the supplied cut-out (portrait). */
export const CHAMPION_CUTOUT_IMAGE_WIDTH = 682;
export const CHAMPION_CUTOUT_IMAGE_HEIGHT = 1024;

export const CEREMONY_OPENING_MS = 4200;

/** Normalised timeline position (0–1) for the trophy-lift impact beat. */
export const CEREMONY_IMPACT_AT = 0.56;

/** Desktop ceremony stage width cap (rem). */
export const CEREMONY_STAGE_MAX_WIDTH_REM = 43.5;

/** Mobile ceremony stage width cap (rem). */
export const CEREMONY_STAGE_MOBILE_MAX_WIDTH_REM = 25.4;

export const MOTION_INTENSITY_MULTIPLIER = {
  low: 0.45,
  medium: 1,
  high: 1.35,
} as const;
