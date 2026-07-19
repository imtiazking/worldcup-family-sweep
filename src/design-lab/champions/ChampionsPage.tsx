"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { CHAMPIONS_PROTOTYPE } from "./constants";
import { useCeremonyMotion } from "./useCeremonyMotion";
import { useCeremonySequence } from "./useCeremonySequence";
import type { CeremonyLabControls } from "./types";
import { CeremonyBackground } from "./components/CeremonyBackground";
import { ChampionHero } from "./components/ChampionHero";
import { CeremonyControls } from "./components/CeremonyControls";
import { ClosingSection } from "./components/ClosingSection";
import {
  DEFAULT_CONTROLS,
  DesignLabPanel,
} from "./components/DesignLabPanel";
import styles from "./champions.module.css";

export function ChampionsPage() {
  const [controls, setControls] = useState<CeremonyLabControls>(DEFAULT_CONTROLS);
  const [replayKey, setReplayKey] = useState(0);

  const { reduceMotion, isMobile, intensity } = useCeremonyMotion(
    controls.motionIntensity,
  );

  const { isStepActive, ceremonyComplete } = useCeremonySequence({
    reduceMotion,
    replayKey,
  });

  const confettiCount = useMemo(() => {
    const mobile = controls.viewportPreview === "mobile" || isMobile;
    const base = mobile ? 6 : 18;
    return controls.motionIntensity === "low"
      ? Math.max(4, Math.floor(base * 0.6))
      : base;
  }, [controls.motionIntensity, controls.viewportPreview, isMobile]);

  const handleReplay = useCallback(() => {
    setReplayKey((value) => value + 1);
  }, []);

  const handleReset = useCallback(() => {
    setControls(DEFAULT_CONTROLS);
    setReplayKey((value) => value + 1);
  }, []);

  const showConfetti =
    controls.confettiEnabled && (isStepActive("confetti") || ceremonyComplete);
  const showFireworks =
    controls.fireworksEnabled && (isStepActive("confetti") || ceremonyComplete);
  const lightsOn =
    controls.stadiumLightsEnabled &&
    (isStepActive("lights") || ceremonyComplete);

  return (
    <div
      className={styles.shell}
      data-preview={controls.viewportPreview}
      data-reduced-motion={reduceMotion ? "true" : "false"}
      data-confetti={controls.confettiEnabled ? "true" : "false"}
      data-fireworks={controls.fireworksEnabled ? "true" : "false"}
      data-lights={controls.stadiumLightsEnabled ? "true" : "false"}
      data-intensity={controls.motionIntensity}
      data-layout={controls.viewportPreview === "mobile" || isMobile ? "mobile" : "desktop"}
      style={{ "--ceremony-intensity": intensity } as React.CSSProperties}
    >
      <CeremonyBackground
        lightsOn={lightsOn}
        showConfetti={showConfetti}
        showFireworks={showFireworks}
        confettiCount={confettiCount}
      />

      <header className={styles.topBar}>
        <span className={styles.labTag}>Design Lab · Champions Ceremony</span>
        <Link href="/tracker" className={styles.backLink}>
          ← Back to Tracker
        </Link>
      </header>

      <ChampionHero
        champion={CHAMPIONS_PROTOTYPE.champion}
        runnerUp={CHAMPIONS_PROTOTYPE.runnerUp}
        secondRunnerUp={CHAMPIONS_PROTOTYPE.secondRunnerUp}
        isStepActive={isStepActive}
        ceremonyComplete={ceremonyComplete}
        reduceMotion={reduceMotion}
        foregroundConfetti={showConfetti}
        foregroundFireworks={showFireworks}
        isMobile={controls.viewportPreview === "mobile" || isMobile}
      />

      <ClosingSection visible={ceremonyComplete} reduceMotion={reduceMotion} />
      <CeremonyControls onReplay={handleReplay} />

      <DesignLabPanel
        controls={controls}
        onChange={setControls}
        onReplay={handleReplay}
        onReset={handleReset}
      />
    </div>
  );
}
