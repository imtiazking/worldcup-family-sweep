"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { EASE_BROADCAST, useMotionSettings } from "./motion-utils";

export type TrackerTab =
  | "overview"
  | "rankings"
  | "alive"
  | "knocked-out"
  | "losers-wheel";

const TABS: { id: TrackerTab; label: string; shortLabel?: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "rankings", label: "Rankings" },
  { id: "losers-wheel", label: "Loser's Wheel", shortLabel: "Wheel" },
  { id: "alive", label: "Alive" },
  { id: "knocked-out", label: "Knocked Out", shortLabel: "Out" },
];

type TrackerMobileTabsProps = {
  activeTab: TrackerTab;
  onTabChange: (tab: TrackerTab) => void;
};

export function TrackerMobileTabs({
  activeTab,
  onTabChange,
}: TrackerMobileTabsProps) {
  const { reduceMotion } = useMotionSettings();

  return (
    <nav
      className="sticky top-16 z-30 -mx-4 mt-2 border-b border-wc-gold/20 bg-wc-navy/95 px-3 py-2 backdrop-blur-md md:hidden"
      aria-label="Tracker sections"
    >
      <div className="flex gap-1 overflow-x-auto rounded-full border border-wc-gold/25 bg-wc-navy-light/80 p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              aria-selected={isActive}
              role="tab"
              className={[
                "relative shrink-0 rounded-full px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider transition-colors sm:px-4 sm:text-xs",
                isActive ? "text-wc-navy" : "text-wc-gold/70",
              ].join(" ")}
            >
              {isActive && (
                <motion.span
                  layoutId="tracker-tab-indicator"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-wc-gold-light via-wc-gold to-wc-gold-dark shadow-[0_2px_12px_rgba(212,175,55,0.35)]"
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 400, damping: 32 }
                  }
                />
              )}
              <span className="relative z-10 sm:hidden">
                {tab.shortLabel ?? tab.label}
              </span>
              <span className="relative z-10 hidden sm:inline">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

type MobileTabPanelProps = {
  tab: TrackerTab;
  activeTab: TrackerTab;
  children: ReactNode;
  className?: string;
  /** When true, panel is mobile-only (desktop uses separate layout) */
  mobileOnly?: boolean;
};

export function MobileTabPanel({
  tab,
  activeTab,
  children,
  className = "",
  mobileOnly = false,
}: MobileTabPanelProps) {
  const { reduceMotion } = useMotionSettings();
  const isActive = activeTab === tab;

  return (
    <div
      role="tabpanel"
      aria-hidden={!isActive}
      className={[
        isActive ? "max-md:block" : "max-md:hidden",
        mobileOnly ? "md:hidden" : "md:contents",
        className,
      ].join(" ")}
    >
      <motion.div
        className="max-md:block md:contents"
        initial={false}
        animate={
          isActive
            ? { opacity: 1, y: 0 }
            : { opacity: reduceMotion ? 1 : 0.98, y: 0 }
        }
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 0.3, ease: EASE_BROADCAST }
        }
      >
        {children}
      </motion.div>
    </div>
  );
}
