"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/results", label: "Results" },
  { href: "/tracker", label: "Tracker" },
] as const;

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 sm:gap-2">
      {NAV_ITEMS.map((item, index) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <span key={item.href} className="flex items-center gap-1 sm:gap-2">
            {index > 0 && (
              <span className="text-wc-gold/30" aria-hidden>
                |
              </span>
            )}
            <Link
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={[
                "rounded-full px-3 py-1.5 text-xs font-medium transition sm:px-4 sm:text-sm",
                isActive
                  ? "border border-wc-gold bg-wc-gold/15 text-wc-gold-light shadow-[0_0_16px_rgba(212,175,55,0.2)]"
                  : "border border-transparent text-wc-gold/70 hover:border-wc-gold/30 hover:bg-wc-gold/10 hover:text-wc-gold",
              ].join(" ")}
            >
              {item.label}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}
