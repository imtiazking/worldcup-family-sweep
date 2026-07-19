"use client";

import Link from "next/link";
import styles from "../champions.module.css";

type CeremonyControlsProps = {
  onReplay: () => void;
};

export function CeremonyControls({ onReplay }: CeremonyControlsProps) {
  return (
    <div className={styles.controlsRow}>
      <button type="button" className={styles.controlBtn} onClick={onReplay}>
        Replay Ceremony
      </button>
      <Link href="/tracker" className={styles.controlBtn}>
        Back to Tracker
      </Link>
    </div>
  );
}
