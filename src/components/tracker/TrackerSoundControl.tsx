"use client";

import { SoundEqualizer } from "./SoundEqualizer";
import { useTrackerSound } from "./TrackerSoundProvider";
import { useMotionSettings } from "./motion-utils";

type TrackerSoundControlProps = {
  className?: string;
};

export function TrackerSoundControl({ className = "" }: TrackerSoundControlProps) {
  const { enabled, isPlaying, hydrated, toggleSound } = useTrackerSound();
  const { reduceMotion } = useMotionSettings();

  if (!hydrated) {
    return null;
  }

  const showEqualizer = enabled && isPlaying;

  return (
    <button
      type="button"
      onClick={toggleSound}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-full",
        "border border-wc-gold/25 bg-wc-gold/5 px-3.5 py-1.5",
        "text-xs text-wc-gold/90 transition-colors",
        "hover:border-wc-gold/40 hover:bg-wc-gold/10",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wc-gold/50",
        className,
      ].join(" ")}
      aria-pressed={enabled}
      aria-label={
        enabled
          ? "Music on. Tap to mute World Cup atmosphere music."
          : "Music off. Tap to play World Cup atmosphere music."
      }
    >
      <span aria-hidden>{enabled ? "🔊" : "🔇"}</span>
      <span>{enabled ? "Music On" : "Music Off"}</span>
      {showEqualizer && <SoundEqualizer reduceMotion={reduceMotion} />}
    </button>
  );
}
