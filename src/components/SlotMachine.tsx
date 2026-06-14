"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Celebration } from "./Celebration";

type Team = {
  id: string;
  name: string;
  flag_emoji: string;
};

type SlotMachineProps = {
  token: string;
  participantName: string;
  initialTeam?: {
    name: string;
    flag: string;
  } | null;
};

const ITEM_HEIGHT = 80;
const SPIN_DURATION = 4000;

export function SlotMachine({
  token,
  participantName,
  initialTeam,
}: SlotMachineProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(!initialTeam);
  const [spinning, setSpinning] = useState(false);
  const [revealed, setRevealed] = useState(!!initialTeam);
  const [result, setResult] = useState<{
    name: string;
    flag: string;
  } | null>(initialTeam ?? null);
  const [error, setError] = useState<string | null>(null);
  const [displayItems, setDisplayItems] = useState<string[]>(
    initialTeam ? [`${initialTeam.flag} ${initialTeam.name}`] : []
  );
  const [offset, setOffset] = useState(0);
  const reelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialTeam) return;

    async function fetchTeams() {
      try {
        const res = await fetch(`/api/teams?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load teams");
        setTeams(data.teams);
        const labels = data.teams.map(
          (t: Team) => `${t.flag_emoji} ${t.name}`
        );
        setDisplayItems([...labels, ...labels, ...labels]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    }

    fetchTeams();
  }, [token, initialTeam]);

  const spin = useCallback(async () => {
    if (spinning || revealed) return;

    setSpinning(true);
    setError(null);

    try {
      const res = await fetch("/api/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Draw failed");
      }

      const winningTeam = {
        name: data.teamName,
        flag: data.teamFlag,
      };

      const allLabels = teams.map((t) => `${t.flag_emoji} ${t.name}`);
      const winLabel = `${winningTeam.flag} ${winningTeam.name}`;

      const spinSequence: string[] = [];
      for (let i = 0; i < 30; i++) {
        const randomTeam =
          allLabels[Math.floor(Math.random() * allLabels.length)];
        spinSequence.push(randomTeam);
      }
      spinSequence.push(winLabel);

      const extendedSequence = [...spinSequence, ...spinSequence.slice(-3)];
      setDisplayItems(extendedSequence);

      const finalIndex = spinSequence.length - 1;
      const targetOffset = finalIndex * ITEM_HEIGHT;

      requestAnimationFrame(() => {
        setOffset(0);
        requestAnimationFrame(() => {
          setOffset(targetOffset);
        });
      });

      setTimeout(() => {
        setResult(winningTeam);
        setRevealed(true);
        setSpinning(false);
      }, SPIN_DURATION);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Draw failed");
      setSpinning(false);
    }
  }, [spinning, revealed, token, teams]);

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-wc-gold/30 border-t-wc-gold" />
        <p className="text-sm text-white/50">Loading your draw...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <p className="mb-2 text-sm uppercase tracking-[0.2em] text-white/50">
        Welcome
      </p>
      <h2 className="font-[family-name:var(--font-bebas)] text-4xl tracking-wide text-wc-gold sm:text-5xl">
        {participantName}
      </h2>

      <div className="relative mt-10 w-full max-w-sm">
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-b from-wc-gold/40 to-wc-gold-dark/20 blur-sm" />
        <div className="slot-window relative overflow-hidden rounded-2xl">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-wc-navy to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-wc-navy to-transparent" />

          <div
            className="pointer-events-none absolute inset-x-4 top-1/2 z-20 -translate-y-1/2 rounded-lg border-2 border-wc-gold/60 bg-wc-gold/5"
            style={{ height: ITEM_HEIGHT }}
          />

          <div
            className="relative overflow-hidden"
            style={{ height: ITEM_HEIGHT }}
          >
            <div
              ref={reelRef}
              className="slot-reel"
              style={{
                transform: `translateY(-${offset}px)`,
                transition: spinning
                  ? `transform ${SPIN_DURATION}ms cubic-bezier(0.15, 0.85, 0.25, 1)`
                  : "none",
              }}
            >
              {(displayItems.length > 0
                ? displayItems
                : ["⚽ Spin to draw!"]
              ).map((item, i) => (
                <div
                  key={`${item}-${i}`}
                  className="flex h-20 items-center justify-center px-4"
                >
                  <span className="font-[family-name:var(--font-bebas)] text-2xl tracking-wide sm:text-3xl">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-2 flex justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 w-2 rounded-full bg-wc-gold/40"
              style={{
                animation: spinning
                  ? `pulse 0.5s ease-in-out ${i * 0.15}s infinite alternate`
                  : undefined,
              }}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {revealed && result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", damping: 12 }}
            className="mt-8 text-center"
          >
            <p className="text-sm uppercase tracking-wider text-wc-gold/70">
              Your Team
            </p>
            <p className="mt-2 text-6xl">{result.flag}</p>
            <p className="font-[family-name:var(--font-bebas)] text-4xl tracking-wide text-white sm:text-5xl">
              {result.name}
            </p>
            <p className="mt-3 text-sm text-white/50">
              Locked in forever. Good luck! 🏆
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="mt-4 text-center text-sm text-wc-red">{error}</p>
      )}

      {!revealed && (
        <button
          onClick={spin}
          disabled={spinning || teams.length === 0}
          className="wc-btn-gold pulse-gold mt-10 rounded-full px-12 py-4 font-[family-name:var(--font-bebas)] text-xl uppercase tracking-widest"
        >
          {spinning ? "Spinning..." : "Spin!"}
        </button>
      )}

      {revealed && <Celebration />}
    </div>
  );
}
