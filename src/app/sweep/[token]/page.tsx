import { notFound } from "next/navigation";
import { getParticipantByToken } from "@/lib/data";
import { SlotMachine } from "@/components/SlotMachine";

type PageProps = {
  params: Promise<{ token: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { token } = await params;
  const participant = await getParticipantByToken(token).catch(() => null);

  if (!participant) {
    return { title: "Invalid Link — World Cup Sweep" };
  }

  return {
    title: `${participant.name}'s Draw — World Cup Sweep 2026`,
    description: `Spin the slot machine to claim your World Cup 2026 team, ${participant.name}!`,
  };
}

export default async function SweepPage({ params }: PageProps) {
  const { token } = await params;

  let participant;
  try {
    participant = await getParticipantByToken(token);
  } catch {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-4xl">⚠️</p>
        <h1 className="mt-4 font-[family-name:var(--font-bebas)] text-3xl text-wc-gold">
          Database Not Connected
        </h1>
        <p className="mt-3 text-sm text-white/60">
          Please configure your Supabase environment variables and run the
          migration.
        </p>
      </div>
    );
  }

  if (!participant) {
    notFound();
  }

  const existingTeam = participant.assignment?.team
    ? {
        name: participant.assignment.team.name,
        flag: participant.assignment.team.flag_emoji,
      }
    : null;

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:py-16">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-wc-gold/60">
          Private Invite
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-bebas)] text-3xl tracking-wide sm:text-4xl">
          <span className="wc-gold-text">Your Draw</span>
        </h1>
      </div>

      <div className="wc-card mt-10 rounded-2xl p-6 sm:p-10">
        <SlotMachine
          token={token}
          participantName={participant.name}
          initialTeam={existingTeam}
        />
      </div>

      <p className="mt-8 text-center text-xs text-white/30">
        This link is unique to you. You can only spin once.
      </p>
    </div>
  );
}
