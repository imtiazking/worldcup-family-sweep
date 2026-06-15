export const dynamic = "force-dynamic";

import Link from "next/link";
import { createPublicClient } from "@/lib/supabase";

type Row = {
    participant: { name: string }[];
    team: { name: string; flag_emoji: string }[];
    team_status: { status: string; stage: string } | null;
  };

type TeamStatus = {
    team_name: string;
    status: string;
    stage: string;
  };

export default async function TrackerPage() {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("assignments")
    .select(`
        participant:participants!assignments_participant_id_fkey ( name ),
        team:teams!assignments_team_id_fkey ( name, flag_emoji )
      `);

  const { data: statuses } = await supabase
    .from("team_status")
    .select("*");

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-4xl text-wc-gold">Tracker unavailable</h1>
        <p className="mt-3 text-white/50">Could not load sweep data.</p>
      </div>
    );
  }

  const statusMap = new Map(
    (statuses ?? []).map((s: TeamStatus) => [s.team_name, s])
  );

  const rows: Row[] = (data ?? []).map((r) => ({
    ...r,
    team_status: statusMap.get(r.team?.[0]?.name) ?? {
      status: "active",
      stage: "Group Stage",
    },
  }));

  const winner = rows.find((r) => r.team_status?.status === "winner");
  const alive = rows.filter((r) => r.team_status?.status !== "eliminated" && r.team_status?.status !== "winner");
  const eliminated = rows.filter((r) => r.team_status?.status === "eliminated");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-wc-gold/60">
          Family World Cup Sweep
        </p>

        <h1 className="mt-3 font-[family-name:var(--font-bebas)] text-6xl tracking-wide text-wc-gold sm:text-8xl">
          Survival Tracker
        </h1>

        <div className="mx-auto mt-8 flex h-40 w-40 items-center justify-center rounded-full border border-wc-gold/30 bg-wc-gold/10 text-8xl shadow-[0_0_80px_rgba(245,197,66,0.25)]">
          🏆
        </div>

        {winner ? (
          <div className="mt-6">
            <p className="text-sm uppercase tracking-[0.25em] text-wc-gold/60">
              World Cup Sweep Winner
            </p>
            <p className="mt-2 font-[family-name:var(--font-bebas)] text-5xl text-white">
            {winner.participant?.[0]?.name} — {winner.team?.[0]?.flag_emoji} {winner.team?.[0]?.name}
            </p>
          </div>
        ) : (
          <p className="mt-5 text-white/50">
            Track who is still alive, who advances, and who gets knocked out.
          </p>
        )}

        <Link
          href="/results"
          className="mt-6 inline-block rounded-full border border-wc-gold/30 px-5 py-2 text-sm text-wc-gold hover:bg-wc-gold/10"
        >
          View Draw Results
        </Link>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <section className="wc-card rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-bebas)] text-4xl text-wc-gold">
              Still Alive
            </h2>
            <span className="rounded-full bg-wc-gold/10 px-4 py-1 text-sm text-wc-gold">
              {alive.length} teams
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {alive.map((row, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                  <p className="text-5xl">{row.team?.[0]?.flag_emoji}</p>
                    <h3 className="mt-3 font-[family-name:var(--font-bebas)] text-3xl text-white">
                     {row.team?.[0]?.name}
                    </h3>
                    <p className="text-sm text-white/50">
                    Owned by {row.participant?.[0]?.name}
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                    Alive
                  </span>
                </div>

                <div className="mt-5 rounded-xl bg-wc-navy/70 px-4 py-3">
                  <p className="text-xs uppercase tracking-wider text-white/40">
                    Current Stage
                  </p>
                  <p className="font-[family-name:var(--font-bebas)] text-2xl text-wc-gold">
                    {row.team_status?.stage ?? "Group Stage"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="wc-card rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-bebas)] text-4xl text-red-300">
              Knocked Out
            </h2>
            <span className="rounded-full bg-red-400/10 px-4 py-1 text-sm text-red-300">
              {eliminated.length}
            </span>
          </div>

          <div className="mt-6 space-y-3">
            {eliminated.length === 0 && (
              <p className="rounded-2xl bg-white/[0.04] p-5 text-white/50">
                No teams knocked out yet.
              </p>
            )}

            {eliminated.map((row, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-2xl border border-red-400/10 bg-red-400/[0.04] px-4 py-4 opacity-70"
              >
                <div>
                  <p className="font-[family-name:var(--font-bebas)] text-2xl text-white">
                    {row.team?.[0]?.flag_emoji} {row.team?.[0]?.name}
                  </p>
                  <p className="text-sm text-white/40">
                  {row.participant?.[0]?.name}
                  </p>
                </div>
                <span className="text-xs text-red-300">
                  {row.team_status?.stage}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}