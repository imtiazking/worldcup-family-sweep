"use client";

import { useState } from "react";
import type { CeremonyLabControls, MotionIntensityLevel, ViewportPreview } from "../types";
import styles from "../champions.module.css";

const DEFAULT_CONTROLS: CeremonyLabControls = {
  confettiEnabled: true,
  fireworksEnabled: true,
  stadiumLightsEnabled: true,
  motionIntensity: "medium",
  viewportPreview: "desktop",
};

type DesignLabPanelProps = {
  controls: CeremonyLabControls;
  onChange: (controls: CeremonyLabControls) => void;
  onReplay: () => void;
  onReset: () => void;
};

export function DesignLabPanel({
  controls,
  onChange,
  onReplay,
  onReset,
}: DesignLabPanelProps) {
  const [open, setOpen] = useState(true);

  const update = <K extends keyof CeremonyLabControls>(
    key: K,
    value: CeremonyLabControls[K],
  ) => {
    onChange({ ...controls, [key]: value });
  };

  return (
    <div className={styles.labPanel}>
      <button
        type="button"
        className={styles.labPanelToggle}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        Design Lab Controls {open ? "▾" : "▸"}
      </button>

      {open && (
        <div className={styles.labPanelBody}>
          <div className={styles.labField}>
            <button type="button" className={styles.controlBtn} onClick={onReplay}>
              Replay ceremony
            </button>
          </div>

          <label className={styles.labField}>
            <span className={styles.labLabel}>Motion intensity</span>
            <select
              className={styles.labSelect}
              value={controls.motionIntensity}
              onChange={(event) =>
                update("motionIntensity", event.target.value as MotionIntensityLevel)
              }
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>

          <label className={styles.labField}>
            <span className={styles.labLabel}>Viewport preview</span>
            <select
              className={styles.labSelect}
              value={controls.viewportPreview}
              onChange={(event) =>
                update("viewportPreview", event.target.value as ViewportPreview)
              }
            >
              <option value="desktop">Desktop</option>
              <option value="tablet">Tablet</option>
              <option value="mobile">Mobile</option>
            </select>
          </label>

          <label className={[styles.labField, styles.labCheckboxRow].join(" ")}>
            <input
              type="checkbox"
              checked={controls.confettiEnabled}
              onChange={(event) => update("confettiEnabled", event.target.checked)}
            />
            <span className={styles.labLabel}>Confetti</span>
          </label>

          <label className={[styles.labField, styles.labCheckboxRow].join(" ")}>
            <input
              type="checkbox"
              checked={controls.fireworksEnabled}
              onChange={(event) => update("fireworksEnabled", event.target.checked)}
            />
            <span className={styles.labLabel}>Fireworks</span>
          </label>

          <label className={[styles.labField, styles.labCheckboxRow].join(" ")}>
            <input
              type="checkbox"
              checked={controls.stadiumLightsEnabled}
              onChange={(event) =>
                update("stadiumLightsEnabled", event.target.checked)
              }
            />
            <span className={styles.labLabel}>Stadium lights</span>
          </label>

          <div className={styles.labField}>
            <button type="button" className={styles.controlBtn} onClick={onReset}>
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export { DEFAULT_CONTROLS };
