import type { ParticipantWithAssignment } from "@/lib/types";

type ParticipantCardProps = {
  participant: ParticipantWithAssignment;
  drawn: boolean;
};

export function ParticipantCard({ participant, drawn }: ParticipantCardProps) {
  const team = participant.assignment?.team;

  return (
    <div
      className={`wc-card flex items-center gap-4 rounded-xl p-4 transition ${
        drawn ? "border-wc-gold/30" : "border-white/10 opacity-70"
      }`}
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
          drawn
            ? "bg-wc-gold/20 text-wc-gold"
            : "bg-white/5 text-white/40"
        }`}
      >
        {drawn && team ? team.flag_emoji : "?"}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-[family-name:var(--font-bebas)] text-lg tracking-wide">
          {participant.name}
        </p>
        {drawn && team ? (
          <p className="truncate text-sm text-wc-gold">{team.name}</p>
        ) : (
          <p className="text-sm text-white/40">Waiting to spin...</p>
        )}
      </div>
      {drawn && (
        <span className="shrink-0 text-xs uppercase tracking-wider text-wc-green">
          ✓ Drawn
        </span>
      )}
    </div>
  );
}
