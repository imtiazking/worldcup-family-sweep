/**
 * Prototype ceremony data — replace with live Supabase results in production.
 */
export const CHAMPIONS_PROTOTYPE = {
  eventTitle: "FIFA WORLD CUP",
  championHeading: "WORLD CUP 2026",
  championSubheading: "FINAL STANDINGS",
  podium: {
    first: {
      place: 1 as const,
      team: "Spain",
      flagEmoji: "🇪🇸",
      medal: "gold" as const,
      placeLabel: "🥇 1st",
      roleLabel: "WORLD CUP CHAMPIONS",
      panelLabel: "World Champions",
      panelIcon: "🏆",
    },
    second: {
      place: 2 as const,
      team: "Argentina",
      flagEmoji: "🇦🇷",
      medal: "silver" as const,
      placeLabel: "🥈 2nd",
      roleLabel: "RUNNER-UP",
      panelLabel: "Runner-up",
      panelIcon: "🥈",
    },
    third: {
      place: 3 as const,
      team: "England",
      flagEmoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
      medal: "bronze" as const,
      placeLabel: "🥉 3rd",
      roleLabel: "THIRD PLACE",
      panelLabel: "Third Place",
      panelIcon: "🥉",
    },
  },
  /** Legacy family sweep participants — used by production `/champions`. */
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
    name: "Siyana",
    team: "England",
    flagEmoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    positionLabel: "Third place",
  },
  final: {
    homeTeam: "Spain",
    awayTeam: "Argentina",
    scoreHome: 1,
    scoreAway: 0,
    afterExtraTime: true,
    display: "Spain 1–0 Argentina (AET)",
  },
  closing: {
    heading: "THE CHAMPIONS",
    tagline: "Glory. Bragging Rights. Family Legend.",
    footnote: "One tournament. One winner. Forever remembered.",
  },
} as const;

/** Extracted FIFA World Cup trophy from the ceremony reference (transparent PNG). */
export const WORLD_CUP_TROPHY_IMAGE_SRC =
  "/design-lab/world-cup-trophy-reference.png";
export const WORLD_CUP_TROPHY_IMAGE_WIDTH = 313;
export const WORLD_CUP_TROPHY_IMAGE_HEIGHT = 255;

/** Reference podium imagery — blocks + circular platform from the design reference. */
export const WORLD_CUP_PODIUM_PLATFORM_SRC =
  "/design-lab/world-cup-podium-platform-reference.png";
export const WORLD_CUP_PODIUM_PLATFORM_WIDTH = 627;
export const WORLD_CUP_PODIUM_PLATFORM_HEIGHT = 128;

export const WORLD_CUP_PODIUM_BLOCK_SRC = {
  left: "/design-lab/world-cup-podium-left-reference.png",
  center: "/design-lab/world-cup-podium-center-reference.png",
  right: "/design-lab/world-cup-podium-right-reference.png",
} as const;

export const WORLD_CUP_PODIUM_BLOCK_SIZE = {
  left: { width: 231, height: 288 },
  center: { width: 301, height: 312 },
  right: { width: 232, height: 272 },
} as const;

/** Production ceremony trophy — extracted from supplied reference (transparent PNG). */
export const PRODUCTION_WORLD_CUP_TROPHY_IMAGE_SRC =
  "/champions/world-cup-trophy.png";
export const PRODUCTION_WORLD_CUP_TROPHY_IMAGE_WIDTH = 229;
export const PRODUCTION_WORLD_CUP_TROPHY_IMAGE_HEIGHT = 216;

/** Transparent champion cut-out (legacy — superseded by production trophy hero). */
export const CHAMPION_CUTOUT_IMAGE_SRC = "/design-lab/champion-cutout.png";

/** Intrinsic dimensions of the supplied cut-out (portrait). */
export const CHAMPION_CUTOUT_IMAGE_WIDTH = 682;
export const CHAMPION_CUTOUT_IMAGE_HEIGHT = 1024;

export const CEREMONY_OPENING_MS = 4200;

/** Extended trophy presentation timeline (7s). */
export const TROPHY_CEREMONY_MS = 7000;

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
