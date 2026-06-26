import type {
  BracketOpponent,
  BracketStatus,
  SweepBracketEntry,
} from "@/lib/round-of-32-bracket";

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
  return (
    <div
      className={[
        "flex shrink-0 items-center justify-center rounded-full bg-white shadow-[0_2px_12px_rgba(15,23,42,0.12)] ring-1 ring-slate-200",
        compact
          ? "h-12 w-12 text-2xl"
          : "h-14 w-14 text-3xl sm:h-16 sm:w-16 sm:text-4xl",
        className,
      ].join(" ")}
      aria-hidden
    >
      {flag}
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
        flag={row.team?.flag_emoji ?? "⚽"}
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

type ConfirmedFixtureMetaProps = {
  opponent: BracketOpponent;
  align?: "left" | "right";
  compact?: boolean;
};

/** Full confirmed fixture line — shown once per mutual pairing (primary row). */
export function ConfirmedFixtureMeta({
  opponent,
  align = "left",
  compact = false,
}: ConfirmedFixtureMetaProps) {
  const isRight = align === "right";
  const parts = ["Confirmed"];
  if (opponent.date) parts.push(opponent.date);
  if (opponent.venue) parts.push(opponent.venue);

  return (
    <p
      className={[
        "font-medium text-emerald-700",
        compact ? "text-[11px]" : "text-xs sm:text-sm",
        isRight ? "text-right" : "text-left",
      ].join(" ")}
    >
      {parts.join(" · ")}
    </p>
  );
}

type BracketOpponentNodeProps = {
  opponent: BracketOpponent | null;
  align?: "left" | "right";
  compact?: boolean;
  variant?: "full" | "slim";
  opponentFlag?: string;
  showConfirmedOpponentLabel?: boolean;
};

export function BracketOpponentNode({
  opponent,
  align = "right",
  compact = false,
  variant = "full",
  opponentFlag,
  showConfirmedOpponentLabel = false,
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
          {showConfirmedOpponentLabel && (
            <p className="text-[10px] uppercase tracking-wide text-slate-400">
              Confirmed opponent
            </p>
          )}
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

  return (
    <div
      className={[
        "flex min-w-0 items-center gap-2",
        isRight ? "flex-row-reverse text-right" : "flex-row text-left",
      ].join(" ")}
    >
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
          {opponent?.date ? ` · ${opponent.date}` : ""}
        </p>
      </div>
    </div>
  );
}
