"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "tracker-sound-enabled";
const AUDIO_SRC = "/audio/world-rhythm.mp3";
const TARGET_VOLUME = 0.1;
const FADE_IN_MS = 2000;
const FADE_OUT_MS = 1000;

type TrackerSoundContextValue = {
  enabled: boolean;
  isPlaying: boolean;
  hydrated: boolean;
  toggleSound: () => void;
};

const TrackerSoundContext = createContext<TrackerSoundContextValue | null>(null);

export function useTrackerSound() {
  const ctx = useContext(TrackerSoundContext);
  if (!ctx) {
    throw new Error("useTrackerSound must be used within TrackerSoundProvider");
  }
  return ctx;
}

function cancelFade(rafRef: React.MutableRefObject<number | null>) {
  if (rafRef.current !== null) {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }
}

function fadeVolume(
  audio: HTMLAudioElement,
  from: number,
  to: number,
  duration: number,
  rafRef: React.MutableRefObject<number | null>,
  onComplete?: () => void,
) {
  cancelFade(rafRef);
  const start = performance.now();

  const tick = (now: number) => {
    const progress = Math.min((now - start) / duration, 1);
    audio.volume = from + (to - from) * progress;

    if (progress < 1) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      rafRef.current = null;
      onComplete?.();
    }
  };

  rafRef.current = requestAnimationFrame(tick);
}

export function TrackerSoundProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<number | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const audio = new Audio(AUDIO_SRC);
    audio.loop = true;
    audio.preload = "metadata";
    audio.volume = 0;
    audioRef.current = audio;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "true") {
        setEnabled(true);
      }
    } catch {
      // localStorage unavailable
    }

    setHydrated(true);

    return () => {
      cancelFade(fadeRef);
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, []);

  const playWithFadeIn = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    cancelFade(fadeRef);
    audio.volume = 0;

    const startPlayback = () => {
      void audio
        .play()
        .then(() => {
          setIsPlaying(true);
          fadeVolume(audio, 0, TARGET_VOLUME, FADE_IN_MS, fadeRef);
        })
        .catch(() => {
          setIsPlaying(false);
        });
    };

    startPlayback();
  }, []);

  const fadeOutAndPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    cancelFade(fadeRef);

    if (audio.paused) {
      audio.volume = 0;
      setIsPlaying(false);
      return;
    }

    fadeVolume(audio, audio.volume, 0, FADE_OUT_MS, fadeRef, () => {
      audio.pause();
      audio.volume = 0;
      setIsPlaying(false);
    });
  }, []);

  const toggleSound = useCallback(() => {
    if (!enabled) {
      setEnabled(true);
      try {
        localStorage.setItem(STORAGE_KEY, "true");
      } catch {
        // ignore
      }
      playWithFadeIn();
      return;
    }

    const audio = audioRef.current;
    if (audio?.paused) {
      playWithFadeIn();
      return;
    }

    setEnabled(false);
    try {
      localStorage.setItem(STORAGE_KEY, "false");
    } catch {
      // ignore
    }
    fadeOutAndPause();
  }, [enabled, playWithFadeIn, fadeOutAndPause]);

  return (
    <TrackerSoundContext.Provider
      value={{ enabled, isPlaying, hydrated, toggleSound }}
    >
      {children}
    </TrackerSoundContext.Provider>
  );
}
