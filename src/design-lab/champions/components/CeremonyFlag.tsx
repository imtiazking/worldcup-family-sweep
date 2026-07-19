"use client";

import Image from "next/image";
import { flagEmojiToTwemojiSrc } from "@/lib/team-flags";
import styles from "../champions.module.css";

type CeremonyFlagProps = {
  emoji: string;
  teamName: string;
  size?: "md" | "lg";
};

export function CeremonyFlag({
  emoji,
  teamName,
  size = "md",
}: CeremonyFlagProps) {
  const twemojiSrc = flagEmojiToTwemojiSrc(emoji);
  const sizeClass =
    size === "lg" ? styles.ceremonyFlagLg : styles.ceremonyFlagMd;
  const dimension = size === "lg" ? 40 : 32;

  return (
    <span className={sizeClass} role="img" aria-label={`${teamName} flag`}>
      {twemojiSrc ? (
        <Image
          src={twemojiSrc}
          alt=""
          width={dimension}
          height={dimension}
          className={styles.ceremonyFlagImg}
          draggable={false}
          unoptimized
        />
      ) : (
        <span aria-hidden>{emoji}</span>
      )}
    </span>
  );
}
