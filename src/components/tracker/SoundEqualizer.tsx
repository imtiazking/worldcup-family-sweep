type SoundEqualizerProps = {
  reduceMotion: boolean;
};

export function SoundEqualizer({ reduceMotion }: SoundEqualizerProps) {
  return (
    <span
      className={[
        "tracker-sound-eq inline-flex items-end gap-[2px]",
        reduceMotion ? "tracker-sound-eq--static" : "",
      ].join(" ")}
      aria-hidden
    >
      <span className="tracker-sound-eq-bar tracker-sound-eq-bar-0" />
      <span className="tracker-sound-eq-bar tracker-sound-eq-bar-1" />
      <span className="tracker-sound-eq-bar tracker-sound-eq-bar-2" />
    </span>
  );
}
