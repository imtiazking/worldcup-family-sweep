import Link from "next/link";

type ChampionCeremonyButtonProps = {
  className?: string;
};

export function ChampionCeremonyButton({
  className = "",
}: ChampionCeremonyButtonProps) {
  return (
    <Link
      href="/champions"
      className={[
        "inline-flex items-center justify-center rounded-full border border-wc-gold/50 bg-wc-gold/15 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-wc-gold transition hover:bg-wc-gold/25",
        className,
      ].join(" ")}
    >
      View Champion Ceremony
    </Link>
  );
}
