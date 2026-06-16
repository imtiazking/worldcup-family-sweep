"use client";

import { useMemo, useState } from "react";
import type { TrackerRow } from "@/lib/tracker";
import {
  enrichWheelResults,
  getNextUnspunEliminated,
  type LoserWheelResult,
  type LoserWheelResultRow,
} from "@/lib/loser-wheel";
import { readWheelSoundPreference, saveWheelSoundPreference } from "./useWheelAudio";
import { HallOfTheFallen } from "./HallOfTheFallen";
import { LosersWheelSpinner } from "./LosersWheelSpinner";

type LosersWheelTabProps = {
  eliminated: TrackerRow[];
  wheelResults: LoserWheelResult[];
  rows: TrackerRow[];
};

export function LosersWheelTab({
  eliminated,
  wheelResults: initialResults,
  rows,
}: LosersWheelTabProps) {
  const [results, setResults] = useState<LoserWheelResultRow[]>(() =>
    enrichWheelResults(initialResults, rows),
  );
  const [soundEnabled, setSoundEnabled] = useState(() =>
    typeof window !== "undefined" ? readWheelSoundPreference() : true,
  );
  const [celebratingId, setCelebratingId] = useState<string | null>(null);

  const spunIds = useMemo(
    () => new Set(results.map((r) => r.participant_id)),
    [results],
  );

  const nextSubject = useMemo(
    () => getNextUnspunEliminated(eliminated, spunIds),
    [eliminated, spunIds],
  );

  const displaySubject = useMemo(() => {
    if (celebratingId) {
      const celebrating = eliminated.find(
        (row) => row.participant?.id === celebratingId,
      );
      if (celebrating) return celebrating;
    }
    return nextSubject;
  }, [celebratingId, eliminated, nextSubject]);

  const handleSpun = (result: LoserWheelResultRow) => {
    setResults((prev) => {
      const filtered = prev.filter(
        (r) => r.participant_id !== result.participant_id,
      );
      return [result, ...filtered];
    });
    setCelebratingId(result.participant_id);
  };

  const handleCelebrateEnd = () => {
    setCelebratingId(null);
  };

  if (eliminated.length === 0) {
    return (
      <div className="wc-card mt-4 p-8 text-center md:mt-6">
        <p className="text-4xl" aria-hidden>
          🎡
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-bebas)] text-3xl text-wc-gold">
          Loser&apos;s Wheel
        </h2>
        <p className="mt-2 text-white/50">
          No eliminations yet. When a team falls, the wheel awaits.
        </p>
      </div>
    );
  }

  return (
    <div className="relative -mx-4 mt-2 overflow-hidden rounded-2xl border border-wc-gold/15 bg-gradient-to-b from-wc-navy via-[#0d1528] to-wc-navy md:mx-0 md:mt-6">
      {displaySubject ? (
        <LosersWheelSpinner
          key={displaySubject.participant?.id}
          subject={displaySubject}
          soundEnabled={soundEnabled}
          onSoundToggle={(value) => {
            setSoundEnabled(value);
            saveWheelSoundPreference(value);
          }}
          onSpun={handleSpun}
          onCelebrateEnd={handleCelebrateEnd}
        />
      ) : (
        <div className="px-4 py-12 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-wc-gold/60">
            All fallen have spun
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-bebas)] text-4xl text-white">
            The wheel rests… for now
          </h2>
        </div>
      )}

      <div className="px-4 pb-8">
        <HallOfTheFallen results={results} />
      </div>
    </div>
  );
}
