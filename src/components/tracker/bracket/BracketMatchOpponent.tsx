import type { SweepBracketData, SweepBracketEntry } from "@/lib/round-of-32-bracket";
import { getTeamFlagFromEntries } from "@/lib/round-of-32-bracket";
import {
  BracketOpponentNode,
  ConfirmedFixtureMeta,
} from "./BracketNodes";

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

  const role = entry.confirmedFixtureRole;
  const opponentFlag = getTeamFlagFromEntries(through, opponent.label);

  if (opponent.kind === "confirmed" && role === "primary") {
    return (
      <div className="flex flex-col gap-1.5">
        <ConfirmedFixtureMeta opponent={opponent} align={align} compact={compact} />
        <BracketOpponentNode
          opponent={opponent}
          align={align}
          compact={compact}
          variant="slim"
          opponentFlag={opponentFlag}
        />
      </div>
    );
  }

  if (opponent.kind === "confirmed" && role === "secondary") {
    return (
      <BracketOpponentNode
        opponent={opponent}
        align={align}
        compact={compact}
        variant="slim"
        opponentFlag={opponentFlag}
      />
    );
  }

  return (
    <BracketOpponentNode
      opponent={opponent}
      align={align}
      compact={compact}
      variant="full"
    />
  );
}
