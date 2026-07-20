"use client";

import Image from "next/image";
import {
  WORLD_CUP_PODIUM_BLOCK_SIZE,
  WORLD_CUP_PODIUM_BLOCK_SRC,
  WORLD_CUP_PODIUM_PLATFORM_HEIGHT,
  WORLD_CUP_PODIUM_PLATFORM_SRC,
  WORLD_CUP_PODIUM_PLATFORM_WIDTH,
} from "../constants";
import type { CeremonyPodiumEntry } from "../types";
import { CeremonyFlag } from "./CeremonyFlag";
import styles from "../champions.module.css";

type WinnersPodiumStandProps = {
  first: CeremonyPodiumEntry;
  second: CeremonyPodiumEntry;
  third: CeremonyPodiumEntry;
  podiumBaseVisible: boolean;
  thirdVisible: boolean;
  secondVisible: boolean;
  centerVisible: boolean;
  reduceMotion: boolean;
  goldPulse: boolean;
};

function PodiumStep({
  entry,
  position,
  visible,
  reduceMotion,
  medalPulse,
}: {
  entry: CeremonyPodiumEntry;
  position: "left" | "center" | "right";
  visible: boolean;
  reduceMotion: boolean;
  medalPulse?: boolean;
}) {
  const positionClass =
    position === "left"
      ? styles.winnersStepLeft
      : position === "center"
        ? styles.winnersStepCenter
        : styles.winnersStepRight;

  const blockSize = WORLD_CUP_PODIUM_BLOCK_SIZE[position];
  const blockSrc = WORLD_CUP_PODIUM_BLOCK_SRC[position];

  return (
    <article
      className={[
        styles.winnersStep,
        positionClass,
        visible ? styles.winnersStepVisible : "",
        reduceMotion ? styles.winnersStepReduced : "",
      ].join(" ")}
      aria-label={`${entry.placeLabel}: ${entry.team}`}
    >
      <div className={styles.winnersStepBlock}>
        <Image
          src={blockSrc}
          alt=""
          width={blockSize.width}
          height={blockSize.height}
          className={styles.winnersStepBlockImage}
          aria-hidden
          sizes="(max-width: 767px) 28vw, 11rem"
        />
        <div className={styles.winnersStepOverlay}>
          <p className={styles.winnersStepPlace}>{entry.placeLabel}</p>
          <div
            className={[
              styles.winnersStepFlag,
              medalPulse ? styles.winnersStepMedalPulse : "",
            ].join(" ")}
          >
            <CeremonyFlag
              emoji={entry.flagEmoji}
              teamName={entry.team}
              size="xl"
              wave
            />
          </div>
          <h3 className={styles.winnersStepTeam}>{entry.team.toUpperCase()}</h3>
          {entry.participantName ? (
            <p className={styles.winnersStepParticipant}>
              {entry.participantName.toUpperCase()}
            </p>
          ) : null}
          <p className={styles.winnersStepRole}>{entry.roleLabel}</p>
        </div>
      </div>
      <div className={styles.winnersStepCastShadow} aria-hidden />
    </article>
  );
}

export function WinnersPodiumStand({
  first,
  second,
  third,
  podiumBaseVisible,
  thirdVisible,
  secondVisible,
  centerVisible,
  reduceMotion,
  goldPulse,
}: WinnersPodiumStandProps) {
  return (
    <div
      className={[
        styles.winnersPodiumStand,
        podiumBaseVisible ? styles.winnersPodiumStandVisible : "",
        reduceMotion ? styles.winnersPodiumStandReduced : "",
      ].join(" ")}
      aria-label="World Cup winners podium"
    >
      <div className={styles.winnersPodiumStageShadow} aria-hidden />
      <div className={styles.winnersPodiumBlocks}>
        <PodiumStep
          entry={second}
          position="left"
          visible={secondVisible}
          reduceMotion={reduceMotion}
        />
        <PodiumStep
          entry={first}
          position="center"
          visible={centerVisible}
          reduceMotion={reduceMotion}
          medalPulse={goldPulse}
        />
        <PodiumStep
          entry={third}
          position="right"
          visible={thirdVisible}
          reduceMotion={reduceMotion}
        />
      </div>
      <div
        className={[
          styles.winnersPodiumPlatform,
          podiumBaseVisible ? styles.winnersPodiumPlatformVisible : "",
          reduceMotion ? styles.winnersPodiumPlatformReduced : "",
        ].join(" ")}
      >
        <Image
          src={WORLD_CUP_PODIUM_PLATFORM_SRC}
          alt=""
          width={WORLD_CUP_PODIUM_PLATFORM_WIDTH}
          height={WORLD_CUP_PODIUM_PLATFORM_HEIGHT}
          className={styles.winnersPodiumPlatformImage}
          aria-hidden
          sizes="(max-width: 767px) 92vw, 38rem"
        />
        <div className={styles.winnersPodiumFloorReflection} aria-hidden />
      </div>
    </div>
  );
}
