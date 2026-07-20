"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import type { ChampionsCeremonyData } from "@/lib/champions-ceremony";
import { useCeremonyMotion } from "@/design-lab/champions/useCeremonyMotion";
import { useCeremonySequence } from "@/design-lab/champions/useCeremonySequence";
import { CeremonyBackground } from "@/design-lab/champions/components/CeremonyBackground";
import { ChampionHero } from "@/design-lab/champions/components/ChampionHero";
import { CeremonyControls } from "@/design-lab/champions/components/CeremonyControls";
import { CeremonyFinalScore } from "@/design-lab/champions/components/CeremonyFinalScore";
import { ClosingSection } from "@/design-lab/champions/components/ClosingSection";
import styles from "@/design-lab/champions/champions.module.css";

type ProductionChampionsCeremonyProps = {
  data: ChampionsCeremonyData;
};

export function ProductionChampionsCeremony({
  data,
}: ProductionChampionsCeremonyProps) {
  const [replayKey, setReplayKey] = useState(0);
  const { reduceMotion, isMobile, intensity } = useCeremonyMotion("high");

  const { isStepActive, ceremonyComplete, progress } = useCeremonySequence({
    reduceMotion,
    replayKey,
    variant: "trophy",
  });

  const confettiCount = useMemo(() => {
    const base = isMobile ? 6 : 18;
    return base;
  }, [isMobile]);

  const handleReplay = useCallback(() => {
    setReplayKey((value) => value + 1);
  }, []);

  const showConfetti = isStepActive("confetti") || ceremonyComplete;
  const showFireworks = isStepActive("confetti") || ceremonyComplete;
  const lightsOn = isStepActive("lights") || ceremonyComplete;
  const finalScoreVisible = isStepActive("nameplate") || ceremonyComplete;

  return (
    <div
      className={styles.shell}
      data-reduced-motion={reduceMotion ? "true" : "false"}
      data-confetti="true"
      data-fireworks="true"
      data-lights="true"
      data-intensity="high"
      data-layout={isMobile ? "mobile" : "desktop"}
      style={{ "--ceremony-intensity": intensity } as React.CSSProperties}
    >
      <CeremonyBackground
        lightsOn={lightsOn}
        showConfetti={showConfetti}
        showFireworks={showFireworks}
        confettiCount={confettiCount}
      />

      <header className={styles.topBar}>
        <span className={styles.labTag}>World Cup Family Sweep 2026</span>
        <Link href="/tracker" className={styles.backLink}>
          ← Back to Tracker
        </Link>
      </header>

      <ChampionHero
        presentation="family-podium"
        champion={data.champion}
        runnerUp={data.runnerUp}
        secondRunnerUp={data.secondRunnerUp}
        podium={data.podium}
        isStepActive={isStepActive}
        ceremonyComplete={ceremonyComplete}
        progress={progress}
        reduceMotion={reduceMotion}
        foregroundConfetti={showConfetti}
        foregroundFireworks={showFireworks}
        isMobile={isMobile}
      />

      <CeremonyFinalScore
        final={data.final}
        visible={finalScoreVisible}
        reduceMotion={reduceMotion}
      />

      <ClosingSection
        visible={ceremonyComplete}
        reduceMotion={reduceMotion}
        heading={data.closing.heading}
        tagline={data.closing.tagline}
        footnote={data.closing.footnote}
      />
      <CeremonyControls onReplay={handleReplay} />
    </div>
  );
}
