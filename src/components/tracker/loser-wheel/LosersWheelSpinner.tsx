"use client";

import { motion, useMotionValue, animate } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import type { TrackerRow } from "@/lib/tracker";
import {
  getSegmentIndex,
  type LoserWheelResultRow,
  type WheelSegment,
  WHEEL_SEGMENTS,
} from "@/lib/loser-wheel";
import { EASE_BROADCAST, useMotionSettings } from "../motion-utils";
import { LosersWheelDisc } from "./LosersWheelDisc";
import { useWheelAudio } from "./useWheelAudio";
import { WheelSoundToggle } from "./WheelSoundToggle";
import { WheelStageEffects } from "./WheelStageEffects";

type LosersWheelSpinnerProps = {
  subject: TrackerRow;
  soundEnabled: boolean;
  onSoundToggle: (enabled: boolean) => void;
  onSpun: (result: LoserWheelResultRow) => void;
  onCelebrateEnd?: () => void;
};

type SpinPhase = "idle" | "spinning" | "revealed";

function computeNextRotation(
  current: number,
  segmentIndex: number,
  fullSpins: number,
): number {
  const segmentAngle = 360 / WHEEL_SEGMENTS.length;
  const segmentCenter = segmentIndex * segmentAngle + segmentAngle / 2;
  const targetMod = (360 - segmentCenter + 360) % 360;
  const currentMod = ((current % 360) + 360) % 360;
  let delta = targetMod - currentMod;
  if (delta <= 0) delta += 360;
  return current + fullSpins * 360 + delta;
}

export function LosersWheelSpinner({
  subject,
  soundEnabled,
  onSoundToggle,
  onSpun,
  onCelebrateEnd,
}: LosersWheelSpinnerProps) {
  const { reduceMotion, isMobile } = useMotionSettings();
  const rotation = useMotionValue(0);
  const [displayRotation, setDisplayRotation] = useState(0);
  const [phase, setPhase] = useState<SpinPhase>("idle");
  const [revealedSegment, setRevealedSegment] = useState<WheelSegment | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const tickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const celebrateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rotationRef = useRef(0);
  const { playTick, playRevealSting } = useWheelAudio({ enabled: soundEnabled });

  useEffect(() => {
    const unsub = rotation.on("change", (v) => setDisplayRotation(v));
    return unsub;
  }, [rotation]);

  const stopTicks = useCallback(() => {
    if (tickTimeoutRef.current) {
      clearTimeout(tickTimeoutRef.current);
      tickTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopTicks();
      if (celebrateTimeoutRef.current) {
        clearTimeout(celebrateTimeoutRef.current);
      }
    };
  }, [stopTicks]);

  const startTicks = useCallback(
    (durationMs: number) => {
      stopTicks();
      const start = performance.now();

      const scheduleTick = () => {
        const elapsed = performance.now() - start;
        if (elapsed >= durationMs) {
          playTick(0.2);
          return;
        }
        const progress = elapsed / durationMs;
        const speedFactor = 1 - Math.pow(progress, 2.2);
        playTick(0.08 + speedFactor * 0.14);
        const nextDelay = 40 + speedFactor * 160;
        tickTimeoutRef.current = setTimeout(scheduleTick, nextDelay);
      };

      scheduleTick();
    },
    [playTick, stopTicks],
  );

  const handleSpin = async () => {
    if (phase !== "idle") return;
    if (!subject.participant?.id || !subject.team?.id) return;

    setError(null);
    setPhase("spinning");

    let prizeId: string;
    let apiResult: {
      id: string;
      participant_id: string;
      team_id: string;
      prize: string;
      spun_at: string;
    };

    try {
      const res = await fetch("/api/loser-wheel/spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId: subject.participant.id,
          teamId: subject.team.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Spin failed");
      }

      prizeId = data.prize as string;
      apiResult = data.result as typeof apiResult;
    } catch (err) {
      setPhase("idle");
      setError(err instanceof Error ? err.message : "Spin failed");
      return;
    }

    const segmentIndex = getSegmentIndex(prizeId);
    const segment = WHEEL_SEGMENTS[segmentIndex] ?? WHEEL_SEGMENTS[0]!;
    const fullSpins = 5 + Math.floor(Math.random() * 4);
    const spinDuration = reduceMotion ? 0.4 : 6 + Math.random() * 4;
    const target = computeNextRotation(
      rotationRef.current,
      segmentIndex,
      fullSpins,
    );
    rotationRef.current = target;

    if (!reduceMotion) {
      startTicks(spinDuration * 1000);
    }

    await animate(rotation, target, {
      duration: spinDuration,
      ease: reduceMotion ? "easeOut" : [0.12, 0.85, 0.15, 1],
    });

    stopTicks();
    if (!reduceMotion) {
      playTick(0.18);
      setTimeout(() => playTick(0.12), 120);
      setTimeout(() => playTick(0.08), 240);
    }
    playRevealSting();

    setRevealedSegment(segment);
    setPhase("revealed");

    onSpun({
      ...apiResult,
      participantName: subject.participant.name,
      teamName: subject.team.name,
      teamFlag: subject.team.flag_emoji,
      stage: subject.team_status.stage,
      segment,
    });

    const celebrateMs = reduceMotion ? 1500 : 4500;
    celebrateTimeoutRef.current = setTimeout(() => {
      onCelebrateEnd?.();
    }, celebrateMs);
  };

  const canSpin = phase === "idle";

  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center px-2 py-6 md:min-h-[75vh]">
      <WheelStageEffects
        active
        intense={phase === "spinning" || phase === "revealed"}
      />

      <div className="absolute right-2 top-2 z-20 md:right-4 md:top-4">
        <WheelSoundToggle enabled={soundEnabled} onToggle={onSoundToggle} />
      </div>

      <motion.div
        className="relative z-10 text-center"
        initial={false}
        animate={{ opacity: 1 }}
      >
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-red-400/90">
          💀 Team Eliminated
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-bebas)] text-4xl text-white sm:text-5xl">
          {subject.participant?.name}
        </h2>
        <p className="mt-1 text-xl text-wc-gold sm:text-2xl">
          {subject.team?.flag_emoji} {subject.team?.name}
        </p>
        <p className="mt-2 text-sm uppercase tracking-widest text-white/45">
          Spin the Loser&apos;s Wheel
        </p>
      </motion.div>

      <div className="relative z-10 mt-6 flex w-full justify-center">
        <LosersWheelDisc
          rotation={displayRotation}
          spinning={phase === "spinning"}
        />
      </div>

      {phase === "revealed" && revealedSegment && (
        <motion.div
          className="relative z-10 mt-8 w-full max-w-md"
          initial={reduceMotion ? false : { scale: 0.85, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.65, ease: EASE_BROADCAST }
          }
        >
          <div className="wc-card border-wc-gold/40 bg-gradient-to-b from-wc-gold/15 to-transparent p-6 text-center shadow-[0_0_48px_rgba(245,197,66,0.2)]">
            <p className="font-[family-name:var(--font-bebas)] text-4xl leading-tight text-wc-gold sm:text-5xl">
              {revealedSegment.emoji} {revealedSegment.reveal}
            </p>
            <p className="mt-3 text-sm text-white/60">
              for the next family gathering
            </p>
          </div>
        </motion.div>
      )}

      {canSpin && (
        <motion.button
          type="button"
          onClick={() => void handleSpin()}
          className={[
            "relative z-10 mt-8 rounded-full px-8 py-4",
            "bg-gradient-to-r from-wc-gold-light via-wc-gold to-wc-gold-dark",
            "font-[family-name:var(--font-bebas)] text-2xl tracking-wide text-wc-navy",
            "shadow-[0_0_32px_rgba(245,197,66,0.45)]",
            "hover:brightness-110 active:scale-[0.98]",
            isMobile ? "px-6 py-3.5 text-xl" : "",
          ].join(" ")}
          whileTap={reduceMotion ? undefined : { scale: 0.97 }}
          aria-label="Spin the loser's wheel"
        >
          🎡 SPIN THE WHEEL
        </motion.button>
      )}

      {phase === "revealed" && (
        <p className="relative z-10 mt-4 text-xs uppercase tracking-widest text-white/40">
          Wheel locked — result saved
        </p>
      )}

      {error && (
        <p className="relative z-10 mt-4 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
