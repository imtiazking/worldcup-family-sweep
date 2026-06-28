import type {
  BracketOpponent,
  BracketStatus,
  SweepBracketEntry,
} from "@/lib/round-of-32-bracket";
import { flagEmojiToTwemojiSrc } from "@/lib/team-flags";
import Image from "next/image";

const STATUS_LABELS: Record<BracketStatus, string> = {
  through: "Through",
  pending: "Pending",
  eliminated: "Eliminated",
};

const STATUS_STYLES: Record<BracketStatus, string> = {
  through: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  pending: "bg-amber-100 text-amber-900 ring-amber-200",
  eliminated: "bg-red-100 text-red-800 ring-red-200",
};

type BracketStatusBadgeProps = {
  status: BracketStatus;
};

export function BracketStatusBadge({ status }: BracketStatusBadgeProps) {
  return (
    <span
      className={[
        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1",
        STATUS_STYLES[status],
      ].join(" ")}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

type BracketFlagCircleProps = {
  flag: string;
  compact?: boolean;
  className?: string;
};

/** Circular flag node — shared by bracket cards and stage ladder fixtures */
export function BracketFlagCircle({
  flag,
  compact = false,
  className = "",
}: BracketFlagCircleProps) {
  const twemojiSrc = flagEmojiToTwemojiSrc(flag);
  const sizeClass = compact
    ? "h-12 w-12"
    : "h-14 w-14 sm:h-16 sm:w-16";
  const imgClass = compact ? "h-8 w-8" : "h-9 w-9 sm:h-10 sm:w-10";

  return (
    <div
      className={[
        "flex shrink-0 items-center justify-center rounded-full bg-white shadow-[0_2px_12px_rgba(15,23,42,0.12)] ring-1 ring-slate-200",
        sizeClass,
        !twemojiSrc &&
          (compact
            ? "text-2xl leading-none"
            : "text-3xl leading-none sm:text-4xl"),
        className,
      ].join(" ")}
      aria-hidden
    >
      {twemojiSrc ? (
        <Image
          src={twemojiSrc}
          alt=""
          width={compact ? 32 : 40}
          height={compact ? 32 : 40}
          className={`${imgClass} object-contain`}
          draggable={false}
          unoptimized
        />
      ) : (
        <span className="emoji-flag">{flag}</span>
      )}
    </div>
  );
}

type BracketTeamNodeProps = {
  entry: SweepBracketEntry;
  align?: "left" | "right";
  compact?: boolean;
};

export function BracketTeamNode({
  entry,
  align = "left",
  compact = false,
}: BracketTeamNodeProps) {
  const { row, status } = entry;
  const isRight = align === "right";

  return (
    <div
      className={[
        "flex min-w-0 items-center gap-3",
        isRight ? "flex-row-reverse text-right" : "text-left",
      ].join(" ")}
    >
      <BracketFlagCircle
        flag={entry.flagEmoji}
        compact={compact}
        className={status === "eliminated" ? "grayscale opacity-60" : ""}
      />

      <div className="min-w-0 flex-1">
        <p
          className={[
            "truncate font-semibold text-slate-900",
            compact ? "text-sm" : "text-sm sm:text-base",
          ].join(" ")}
        >
          {row.team?.name ?? "Unknown"}
        </p>
        <p className="truncate text-xs text-slate-500">
          {row.participant?.name ?? "Unassigned"}
        </p>
        <div className={["mt-1", isRight ? "flex justify-end" : ""].join(" ")}>
          <BracketStatusBadge status={status} />
        </div>
      </div>
    </div>
  );
}

type BracketOpponentNodeProps = {
  opponent: BracketOpponent | null;
  align?: "left" | "right";
  compact?: boolean;
  variant?: "full" | "slim";
  opponentFlag?: string;
};

export function BracketOpponentNode({
  opponent,
  align = "right",
  compact = false,
  variant = "full",
  opponentFlag,
}: BracketOpponentNodeProps) {
  const isTbc = !opponent || opponent.kind === "tbc";
  const label = opponent?.label ?? "TBC";
  const isSlim = variant === "slim";
  const isRight = align === "right";

  if (isSlim && opponent?.kind === "confirmed") {
    return (
      <div
        className={[
          "flex min-w-0 items-center gap-2",
          isRight ? "flex-row-reverse text-right" : "flex-row text-left",
        ].join(" ")}
      >
        <BracketFlagCircle flag={opponentFlag ?? "⚽"} compact={compact} />
        <div className="min-w-0">
          <p
            className={[
              "truncate font-medium text-slate-700",
              compact ? "text-sm" : "text-sm sm:text-base",
            ].join(" ")}
          >
            {label}
          </p>
        </div>
      </div>
    );
  }

  const kindLabel =
    opponent?.kind === "confirmed"
      ? "Confirmed"
      : opponent?.kind === "projected"
        ? "Projected"
        : "TBC";

  const showOpponentFlag = Boolean(opponentFlag) && !isTbc;

  return (
    <div
      className={[
        "flex min-w-0 items-center gap-2",
        isRight ? "flex-row-reverse text-right" : "flex-row text-left",
      ].join(" ")}
    >
      {showOpponentFlag ? (
        <BracketFlagCircle flag={opponentFlag!} compact={compact} />
      ) : (
        <div
          className={[
            "flex shrink-0 items-center justify-center rounded-full border-2 border-dashed",
            compact ? "h-12 w-12" : "h-14 w-14 sm:h-16 sm:w-16",
            isTbc
              ? "border-slate-300 bg-slate-100 text-slate-400"
              : "border-slate-300 bg-slate-50 text-slate-500",
          ].join(" ")}
          aria-hidden
        >
          <span className="text-[10px] font-bold uppercase tracking-wide sm:text-xs">
            {isTbc ? "TBC" : "?"}
          </span>
        </div>
      )}
      <div className="min-w-0">
        <p
          className={[
            "truncate font-medium text-slate-600",
            compact ? "text-xs" : "text-xs sm:text-sm",
          ].join(" ")}
        >
          {label}
        </p>
        <p className="text-[10px] uppercase tracking-wide text-slate-400">
          {kindLabel}
        </p>
      </div>
    </div>
  );
}
