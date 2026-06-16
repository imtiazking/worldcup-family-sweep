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
  showAutoplayPrompt: boolean;
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

function readSoundPreference(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "false") return false;
    if (stored === "true") return true;
  } catch {
    // localStorage unavailable
  }
  return true;
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
  const startingRef = useRef(false);
  const [enabled, setEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [showAutoplayPrompt, setShowAutoplayPrompt] = useState(false);

  const playWithFadeIn = useCallback((): Promise<boolean> => {
    const audio = audioRef.current;
    if (!audio) return Promise.resolve(false);

    cancelFade(fadeRef);
    audio.volume = 0;

    return audio
      .play()
      .then(() => {
        setIsPlaying(true);
        setShowAutoplayPrompt(false);
        fadeVolume(audio, 0, TARGET_VOLUME, FADE_IN_MS, fadeRef);
        return true;
      })
      .catch(() => {
        setIsPlaying(false);
        setShowAutoplayPrompt(true);
        return false;
      });
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

  useEffect(() => {
    const audio = new Audio(AUDIO_SRC);
    audio.loop = true;
    audio.preload = "metadata";
    audio.volume = 0;
    audioRef.current = audio;

    const preferred = readSoundPreference();
    setEnabled(preferred);
    setShowAutoplayPrompt(preferred);
    setHydrated(true);

    return () => {
      cancelFade(fadeRef);
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!hydrated || !enabled || isPlaying) return;

    const tryStart = () => {
      if (startingRef.current) return;
      startingRef.current = true;
      void playWithFadeIn().finally(() => {
        startingRef.current = false;
      });
    };

    const options: AddEventListenerOptions = { passive: true, capture: true };
    const events = ["click", "touchstart", "scroll", "keydown"] as const;

    for (const event of events) {
      window.addEventListener(event, tryStart, options);
    }

    return () => {
      for (const event of events) {
        window.removeEventListener(event, tryStart, options);
      }
    };
  }, [hydrated, enabled, isPlaying, playWithFadeIn]);

  const toggleSound = useCallback(() => {
    if (enabled) {
      setEnabled(false);
      setShowAutoplayPrompt(false);
      try {
        localStorage.setItem(STORAGE_KEY, "false");
      } catch {
        // ignore
      }
      fadeOutAndPause();
      return;
    }

    setEnabled(true);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // ignore
    }
    void playWithFadeIn();
  }, [enabled, playWithFadeIn, fadeOutAndPause]);

  return (
    <TrackerSoundContext.Provider
      value={{
        enabled,
        isPlaying,
        hydrated,
        showAutoplayPrompt,
        toggleSound,
      }}
    >
      {children}
      {hydrated && showAutoplayPrompt && enabled && !isPlaying && (
        <p
          className="pointer-events-none fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full border border-wc-gold/25 bg-black/75 px-4 py-2 text-center text-xs text-wc-gold/90 shadow-[0_0_24px_rgba(245,197,66,0.12)] backdrop-blur-sm"
          role="status"
          aria-live="polite"
        >
          🎵 Tap anywhere to start World Cup atmosphere
        </p>
      )}
    </TrackerSoundContext.Provider>
  );
}
