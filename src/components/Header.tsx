import Link from "next/link";
import { NavLinks } from "@/components/NavLinks";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-wc-gold/20 bg-wc-navy/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-3">
          <span className="text-2xl" aria-hidden>
            ⚽
          </span>
          <div>
            <p className="font-[family-name:var(--font-bebas)] text-xl tracking-wider text-wc-gold sm:text-2xl">
              WORLD CUP SWEEP
            </p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 sm:text-xs">
              Family Draw 2026
            </p>
          </div>
        </Link>
        <NavLinks />
      </div>
    </header>
  );
}
