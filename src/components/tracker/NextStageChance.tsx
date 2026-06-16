import type { NextStageChanceDisplay } from "@/lib/tracker";

type NextStageChanceProps = {
  chance: NextStageChanceDisplay;
  compact?: boolean;
};

const VARIANT_STYLES: Record<
  NextStageChanceDisplay["variant"],
  string
> = {
  winner: "text-wc-gold-light",
  eliminated: "text-red-300/80",
  qualified: "text-emerald-300",
  probability: "text-wc-gold",
  pending: "text-white/40",
};

export function NextStageChance({
  chance,
  compact = false,
}: NextStageChanceProps) {
  return (
    <p
      className={[
        compact ? "text-xs" : "text-sm",
        "mt-1 leading-snug",
        VARIANT_STYLES[chance.variant],
      ].join(" ")}
    >
      {chance.text}
    </p>
  );
}
