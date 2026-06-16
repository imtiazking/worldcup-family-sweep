"use client";

type WheelSoundToggleProps = {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  className?: string;
};

export function WheelSoundToggle({
  enabled,
  onToggle,
  className = "",
}: WheelSoundToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(!enabled)}
      className={[
        "inline-flex items-center gap-1.5 rounded-full border border-wc-gold/25",
        "bg-black/40 px-3 py-1.5 text-xs text-wc-gold/90 backdrop-blur-sm",
        "hover:border-wc-gold/40 hover:bg-wc-gold/10",
        className,
      ].join(" ")}
      aria-pressed={enabled}
      aria-label={
        enabled
          ? "Wheel sound on. Tap to mute."
          : "Wheel sound off. Tap to enable."
      }
    >
      <span aria-hidden>{enabled ? "🔊" : "🔇"}</span>
    </button>
  );
}
