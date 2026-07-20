export type CeremonyParticipant = {
  name: string;
  team: string;
  flagEmoji: string;
  positionLabel: string;
};

export type CeremonyPodiumEntry = {
  place: 1 | 2 | 3;
  team: string;
  flagEmoji: string;
  medal: "gold" | "silver" | "bronze";
  placeLabel: string;
  roleLabel: string;
  panelLabel: string;
  panelIcon: string;
  participantName?: string;
};

export type CeremonyPodiumData = {
  first: CeremonyPodiumEntry;
  second: CeremonyPodiumEntry;
  third: CeremonyPodiumEntry;
};

export type CeremonyFinalData = {
  scoreLine: string;
  note: string;
};

export type CeremonyPresentation = "family" | "family-podium" | "trophy-podium";

export type MotionIntensityLevel = "low" | "medium" | "high";

export type ViewportPreview = "desktop" | "tablet" | "mobile";

export type CeremonyLabControls = {
  confettiEnabled: boolean;
  fireworksEnabled: boolean;
  stadiumLightsEnabled: boolean;
  motionIntensity: MotionIntensityLevel;
  viewportPreview: ViewportPreview;
  reducedMotionPreview: boolean;
};

export type CeremonySequenceStep =
  | "idle"
  | "background"
  | "lights"
  | "title"
  | "podium-rise"
  | "third-rise"
  | "second-rise"
  | "runners"
  | "winner"
  | "glow"
  | "nameplate"
  | "confetti"
  | "camera-orbit"
  | "complete";
