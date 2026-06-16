"use client";

import type { LoserWheelResultRow } from "@/lib/loser-wheel";

type HallOfTheFallenProps = {
  results: LoserWheelResultRow[];
};

export function HallOfTheFallen({ results }: HallOfTheFallenProps) {
  if (results.length === 0) {
    return (
      <div className="wc-card mt-8 p-6 text-center">
        <h3 className="font-[family-name:var(--font-bebas)] text-2xl text-wc-gold">
          Hall of the Fallen
        </h3>
        <p className="mt-2 text-sm text-white/45">
          No wheel spins yet. When a team is eliminated, their fate awaits here.
        </p>
      </div>
    );
  }

  return (
    <section className="mt-8" aria-labelledby="hall-of-fallen-title">
      <h3
        id="hall-of-fallen-title"
        className="mb-4 text-center font-[family-name:var(--font-bebas)] text-3xl text-wc-gold"
      >
        💀 Hall of the Fallen
      </h3>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((result) => (
          <li
            key={result.id}
            className="wc-card border-white/5 bg-wc-navy-light/60 p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-white">
                  {result.participantName}
                </p>
                <p className="text-sm text-white/50">
                  {result.teamFlag} {result.teamName}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-white/35">
                  {result.stage}
                </p>
              </div>
              <span className="text-2xl" aria-hidden>
                {result.segment.emoji}
              </span>
            </div>
            <p className="mt-3 font-[family-name:var(--font-bebas)] text-xl text-wc-gold">
              {result.segment.reveal}
            </p>
            <p className="mt-1 text-[10px] text-white/30">
              {new Date(result.spun_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
