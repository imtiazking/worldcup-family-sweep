"use client";

import { useCallback, useEffect, useState } from "react";
import { CEREMONY_OPENING_MS } from "./constants";
import type { CeremonySequenceStep } from "./types";

const STEP_TIMELINE: Array<{ step: CeremonySequenceStep; at: number }> = [
  { step: "background", at: 0 },
  { step: "lights", at: 0.08 },
  { step: "runners", at: 0.28 },
  { step: "winner", at: 0.44 },
  { step: "title", at: 0.54 },
  { step: "glow", at: 0.56 },
  { step: "nameplate", at: 0.62 },
  { step: "confetti", at: 0.72 },
  { step: "complete", at: 1 },
];

export function useCeremonySequence({
  reduceMotion,
  replayKey,
}: {
  reduceMotion: boolean;
  replayKey: number;
}) {
  const [step, setStep] = useState<CeremonySequenceStep>("idle");
  const [progress, setProgress] = useState(0);

  const replay = useCallback(() => {
    setStep("idle");
    setProgress(0);
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setStep("complete");
      setProgress(1);
      return;
    }

    setStep("background");
    setProgress(0);

    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const ratio = Math.min(elapsed / CEREMONY_OPENING_MS, 1);
      setProgress(ratio);

      const current =
        [...STEP_TIMELINE].reverse().find((entry) => ratio >= entry.at)?.step ??
        "background";
      setStep(current);

      if (ratio < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduceMotion, replayKey]);

  const isStepActive = useCallback(
    (target: CeremonySequenceStep) => {
      if (reduceMotion) return true;
      const order: CeremonySequenceStep[] = [
        "idle",
        "background",
        "lights",
        "title",
        "runners",
        "winner",
        "glow",
        "nameplate",
        "confetti",
        "complete",
      ];
      return order.indexOf(step) >= order.indexOf(target);
    },
    [reduceMotion, step],
  );

  return {
    step,
    progress,
    isStepActive,
    replay,
    ceremonyComplete: step === "complete" || reduceMotion,
  };
}
