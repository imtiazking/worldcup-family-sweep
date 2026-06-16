"use client";

import { useCallback, useEffect, useRef } from "react";

const WHEEL_SOUND_KEY = "loser-wheel-sound-enabled";

export function readWheelSoundPreference(): boolean {
  try {
    const stored = localStorage.getItem(WHEEL_SOUND_KEY);
    if (stored === "false") return false;
    if (stored === "true") return true;
  } catch {
    // ignore
  }
  return true;
}

export function saveWheelSoundPreference(enabled: boolean) {
  try {
    localStorage.setItem(WHEEL_SOUND_KEY, enabled ? "true" : "false");
  } catch {
    // ignore
  }
}

type UseWheelAudioOptions = {
  enabled: boolean;
};

export function useWheelAudio({ enabled }: UseWheelAudioOptions) {
  const ctxRef = useRef<AudioContext | null>(null);

  const getContext = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!ctxRef.current) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      ctxRef.current = new Ctx();
    }
    return ctxRef.current;
  }, []);

  useEffect(() => {
    return () => {
      void ctxRef.current?.close();
      ctxRef.current = null;
    };
  }, []);

  const playTick = useCallback(
    (volume = 0.15) => {
      if (!enabled) return;
      const ctx = getContext();
      if (!ctx) return;

      void ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = 900 + Math.random() * 200;
      gain.gain.value = volume;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.stop(ctx.currentTime + 0.05);
    },
    [enabled, getContext],
  );

  const playRevealSting = useCallback(() => {
    if (!enabled) return;
    const ctx = getContext();
    if (!ctx) return;

    void ctx.resume();

    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * 0.08;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.12, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.4);
    });
  }, [enabled, getContext]);

  return { playTick, playRevealSting };
}
