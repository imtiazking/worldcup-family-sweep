import {
  VERIFIED_UPCOMING_FAMILY_FIXTURES,
  VERIFIED_SNAPSHOT_AS_OF,
} from "@/lib/world-cup-verified-snapshot";
import { normalizeStage, type TrackerRow } from "@/lib/tracker";

const QUALIFIED_STAGES = new Set([
  "Quarter Final",
  "Semi Final",
  "Final",
  "World Cup Winner",
]);

const FIXTURE_VENUES: Record<string, string> = {
  "Portugal|Spain": "Dallas Stadium",
  "United States|Belgium": "Seattle Stadium",
  "Argentina|Egypt": "Atlanta Stadium",
  "Switzerland|Colombia": "Vancouver Stadium",
  "France|Spain": "TBC",
  "England|Argentina": "TBC",
  "Spain|Argentina": "New York/New Jersey Stadium, East Rutherford",
};

export type PremiumTrackerMetrics = {
  alive: number;
  eliminated: number;
  qualified: number;
  matchesRemaining: number;
  completionPercent: number;
  hasFixturesRemaining: boolean;
  snapshotAsOf: string;
};

export function computePremiumMetrics(
  rows: TrackerRow[],
  completionPercent: number,
): PremiumTrackerMetrics {
  const alive = rows.filter(
    (r) =>
      r.team_status.status !== "eliminated" &&
      r.team_status.status !== "winner",
  ).length;
  const eliminated = rows.filter(
    (r) => r.team_status.status === "eliminated",
  ).length;
  const qualified = rows.filter(
    (r) =>
      r.team_status.status === "active" &&
      QUALIFIED_STAGES.has(normalizeStage(r.team_status.stage)),
  ).length;
  const matchesRemaining = VERIFIED_UPCOMING_FAMILY_FIXTURES.length;

  return {
    alive,
    eliminated,
    qualified,
    matchesRemaining,
    completionPercent,
    hasFixturesRemaining: matchesRemaining > 0,
    snapshotAsOf: VERIFIED_SNAPSHOT_AS_OF,
  };
}

export function fixtureVenue(homeTeam: string, awayOpponent: string): string {
  const key = `${homeTeam}|${awayOpponent}`;
  const reverse = `${awayOpponent}|${homeTeam}`;
  return FIXTURE_VENUES[key] ?? FIXTURE_VENUES[reverse] ?? "Knockout stage";
}

/** Parse UK fixture label to approximate kickoff (BST, summer 2026). */
export function parseUkKickoff(dateUk: string, timeUk: string): Date | null {
  const dateMatch = dateUk.match(/(\d{1,2})\s+([A-Za-z]{3})/);
  if (!dateMatch) return null;

  const day = Number(dateMatch[1]);
  const monthStr = dateMatch[2].toLowerCase();
  const months: Record<string, number> = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11,
  };
  const month = months[monthStr.slice(0, 3)];
  if (month === undefined) return null;

  const timeLower = timeUk.toLowerCase();
  let hours = 12;
  let minutes = 0;

  const hm = timeLower.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
  if (hm) {
    hours = Number(hm[1]);
    minutes = hm[2] ? Number(hm[2]) : 0;
    const meridiem = hm[3];
    if (meridiem === "pm" && hours < 12) hours += 12;
    if (meridiem === "am" && hours === 12) hours = 0;
    if (!meridiem && timeLower.includes("pm") && hours < 12) hours += 12;
  }

  // BST = UTC+1 in July
  const utcHours = hours - 1;
  return new Date(Date.UTC(2026, month, day, utcHours, minutes, 0));
}

export function findFamilyParticipants(
  rows: TrackerRow[],
  teamA: string,
  teamB: string,
): { home: TrackerRow | null; away: TrackerRow | null } {
  const home =
    rows.find((r) => r.team?.name?.toLowerCase() === teamA.toLowerCase()) ??
    null;
  const away =
    rows.find((r) => r.team?.name?.toLowerCase() === teamB.toLowerCase()) ??
    null;
  return { home, away };
}
