import Link from "next/link";
import { getSweepStatus } from "@/lib/data";
import { ProgressBar } from "@/components/ProgressBar";
import { ParticipantCard } from "@/components/ParticipantCard";

export const metadata = {
  title: "Results — World Cup Family Sweep 2026",
  description: "See who drew which team in the family World Cup sweep.",
};

export const revalidate = 10;

export default async function ResultsPage() {
  let status = null;
  let error = false;

  try {
    status = await getSweepStatus();
  } catch {
    error = true;
  }

  if (error || !status) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-4xl">⚠️</p>
        <h1 className="mt-4 font-[family-name:var(--font-bebas)] text-3xl text-wc-gold">
          Unable to Load Results
        </h1>
        <p className="mt-3 text-sm text-white/60">
          Configure Supabase and run the database migration to see results.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm text-wc-gold underline"
        >
          Back to home
        </Link>
      </div>
    );
  }

  const drawn = status.participants.filter((p) => p.assignment);
  const waiting = status.participants.filter((p) => !p.assignment);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-wc-gold/60">
          Live Results
        </p>
        <h1 className="font-[family-name:var(--font-bebas)] text-4xl tracking-wide sm:text-5xl">
          <span className="wc-gold-text">Sweep Results</span>
        </h1>
      </div>

      <div className="wc-card mt-10 rounded-2xl p-6">
        <ProgressBar completed={status.completed} total={status.total} />
      </div>

      {drawn.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 font-[family-name:var(--font-bebas)] text-2xl tracking-wide text-wc-gold">
            Teams Drawn ({drawn.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {drawn.map((p) => (
              <ParticipantCard key={p.id} participant={p} drawn />
            ))}
          </div>
        </section>
      )}

      {waiting.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 font-[family-name:var(--font-bebas)] text-2xl tracking-wide text-white/70">
            Waiting to Draw ({waiting.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {waiting.map((p) => (
              <ParticipantCard key={p.id} participant={p} drawn={false} />
            ))}
          </div>
        </section>
      )}

      {status.completed === status.total && (
        <div className="wc-card mt-10 rounded-2xl p-8 text-center pulse-gold">
          <p className="text-5xl">🏆</p>
          <p className="mt-4 font-[family-name:var(--font-bebas)] text-3xl text-wc-gold">
            Sweep Complete!
          </p>
          <p className="mt-2 text-sm text-white/60">
            All {status.total} participants have drawn their teams. May the best
            nation win!
          </p>
        </div>
      )}
    </div>
  );
}
