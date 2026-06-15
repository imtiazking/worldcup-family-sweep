export const dynamic = "force-dynamic";
import Link from "next/link";
import { getSweepStatus } from "@/lib/data";

export default async function HomePage() {
  let status = null;
  let error = false;

  try {
    status = await getSweepStatus();
  } catch {
    error = true;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-20">
      <div className="text-center">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-wc-gold/70">
          FIFA World Cup 2026
        </p>
        <h1 className="font-[family-name:var(--font-bebas)] text-5xl leading-none tracking-wide sm:text-7xl">
          <span className="wc-gold-text">Family Sweep</span>
        </h1>
        <p className="mx-auto mt-6 max-w-md text-base text-white/60 sm:text-lg">
          Each family member has a private invite link. Spin the slot machine once
          to claim your World Cup team.
        </p>
      </div>

      <div className="wc-card mt-12 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <div className="text-center sm:text-left">
            <p className="text-sm uppercase tracking-wider text-white/50">
              Draw Progress
            </p>
            {error ? (
              <p className="mt-1 text-lg text-wc-red">
                Connect Supabase to see live progress
              </p>
            ) : (
              <p className="mt-1 font-[family-name:var(--font-bebas)] text-4xl text-wc-gold">
                {status?.completed ?? 0}/{status?.total ?? 11}
              </p>
            )}
          </div>
          <Link
            href="/results"
            className="wc-btn-gold rounded-full px-8 py-3 text-sm uppercase tracking-wider"
          >
            View Results
          </Link>
        </div>

        {!error && status && (
          <div className="mt-6">
            <div className="h-2 overflow-hidden rounded-full bg-wc-navy-light">
              <div
                className="h-full rounded-full bg-gradient-to-r from-wc-gold-dark via-wc-gold to-wc-gold-light transition-all duration-700"
                style={{
                  width: `${(status.completed / status.total) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="wc-card rounded-xl p-5">
          <span className="text-2xl">🎰</span>
          <h2 className="mt-2 font-[family-name:var(--font-bebas)] text-xl tracking-wide text-wc-gold">
            Slot Machine Draw
          </h2>
          <p className="mt-2 text-sm text-white/60">
            Premium spin animation reveals your team. One spin only — locked
            forever.
          </p>
        </div>
        <div className="wc-card rounded-xl p-5">
          <span className="text-2xl">🔒</span>
          <h2 className="mt-2 font-[family-name:var(--font-bebas)] text-xl tracking-wide text-wc-gold">
            Private Links
          </h2>
          <p className="mt-2 text-sm text-white/60">
            Your invite link is unique to you. No one else can draw on your
            behalf.
          </p>
        </div>
      </div>

      <p className="mt-12 text-center text-xs text-white/30">
        USA · Canada · Mexico 2026
      </p>
    </div>
  );
}
