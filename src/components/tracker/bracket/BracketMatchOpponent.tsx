import type { SweepBracketData, SweepBracketEntry } from "@/lib/round-of-32-bracket";
import { getTeamFlagFromEntries } from "@/lib/round-of-32-bracket";
import { BracketOpponentNode } from "./BracketNodes";

type BracketMatchOpponentProps = {
  entry: SweepBracketEntry;
  through: SweepBracketData["through"];
  align?: "left" | "right";
  compact?: boolean;
};

export function BracketMatchOpponent({
  entry,
  through,
  align = "right",
  compact = false,
}: BracketMatchOpponentProps) {
  const opponent = entry.r32Opponent;
  if (!opponent) return null;

  const opponentFlag = getTeamFlagFromEntries(through, opponent.label);

  return (
    <BracketOpponentNode
      opponent={opponent}
      align={align}
      compact={compact}
      variant={opponent.kind === "confirmed" ? "slim" : "full"}
      opponentFlag={opponentFlag}
    />
  );
}

/** Strip kickoff dates from pending lines in the bracket UI */
export function formatBracketPendingSummary(line: string | null): string | null {
  if (!line) return null;
  return line
    .replace(/\s*·\s*\d{1,2}\s+[A-Za-z]{3}.*$/i, "")
    .replace(/\s+\d{1,2}\s+[A-Za-z]{3}.*$/i, "")
    .trim();
}
