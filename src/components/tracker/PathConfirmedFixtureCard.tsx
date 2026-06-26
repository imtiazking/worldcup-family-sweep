import type { ConfirmedMutualFixture } from "@/lib/round-of-32-bracket";
import { BracketFlagCircle } from "./bracket/BracketNodes";

type PathConfirmedFixtureCardProps = {
  fixture: ConfirmedMutualFixture;
};

function StageFixtureSide({
  flag,
  teamName,
  participantName,
}: {
  flag: string;
  teamName: string;
  participantName: string | undefined;
}) {
  return (
    <div className="flex min-w-0 max-w-full items-center gap-2">
      <BracketFlagCircle flag={flag} compact />
      <div className="min-w-0">
        <p className="truncate font-[family-name:var(--font-bebas)] text-lg tracking-wide text-white sm:text-xl">
          {teamName}
        </p>
        <p className="truncate text-xs text-white/50 sm:text-sm">
          {participantName ?? "Unassigned"}
        </p>
      </div>
    </div>
  );
}

export function PathConfirmedFixtureCard({ fixture }: PathConfirmedFixtureCardProps) {
  const { primary, secondary } = fixture;
  const opponent = primary.r32Opponent;
  const metaParts = ["Confirmed"];
  if (opponent?.date) metaParts.push(opponent.date);
  if (opponent?.venue) metaParts.push(opponent.venue);

  const teamA = primary.row;
  const teamB = secondary.row;

  return (
    <div className="tracker-alive-pulse col-span-1 rounded-xl border border-wc-gold/70 bg-wc-gold/5 px-3 py-3 sm:col-span-2 sm:px-4">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-3 sm:gap-x-3">
        <StageFixtureSide
          flag={teamA.team?.flag_emoji ?? "⚽"}
          teamName={teamA.team?.name ?? "Unknown"}
          participantName={teamA.participant?.name}
        />
        <span className="shrink-0 px-1 text-xs font-medium uppercase tracking-wider text-white/40 sm:text-sm">
          vs
        </span>
        <StageFixtureSide
          flag={teamB.team?.flag_emoji ?? "⚽"}
          teamName={teamB.team?.name ?? "Unknown"}
          participantName={teamB.participant?.name}
        />
      </div>
      <p className="mt-2 text-xs font-medium text-emerald-300 sm:text-sm">
        {metaParts.join(" · ")}
      </p>
    </div>
  );
}
