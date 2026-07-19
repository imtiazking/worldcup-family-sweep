export type CeremonyParticipant = {
  name: string;
  team: string;
  flagEmoji: string;
  positionLabel: string;
};

export type MotionIntensityLevel = "low" | "medium" | "high";

export type ViewportPreview = "desktop" | "tablet" | "mobile";

export type CeremonyLabControls = {
  confettiEnabled: boolean;
  fireworksEnabled: boolean;
  stadiumLightsEnabled: boolean;
  motionIntensity: MotionIntensityLevel;
  viewportPreview: ViewportPreview;
};

export type CeremonySequenceStep =
  | "idle"
  | "background"
  | "lights"
  | "title"
  | "runners"
  | "winner"
  | "glow"
  | "nameplate"
  | "confetti"
  | "complete";
