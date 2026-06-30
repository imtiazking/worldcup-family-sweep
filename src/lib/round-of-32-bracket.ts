import {
  VERIFIED_EXTERNAL_ADVANCERS,
  VERIFIED_FAMILY_TEAM_STATUSES,
  type ExternalBracketAdvancer,
  type VerifiedTeamStatus,
} from "@/lib/world-cup-verified-snapshot";

export type { ExternalBracketAdvancer };
import type { WorldCup26EnrichmentMap } from "@/lib/providers/worldcup26-provider";
import type { TrackerRow } from "@/lib/tracker";

export type BracketStatus = "through" | "pending" | "eliminated";

export type OpponentKind = "confirmed" | "projected" | "tbc";

export type BracketOpponent = {
  label: string;
  kind: OpponentKind;
  date?: string;
  time?: string;
  venue?: string;
};

export type SweepBracketEntry = {
  row: TrackerRow;
  /** Denormalized flag for bracket nodes — always set from team row */
  flagEmoji: string;
  status: BracketStatus;
  /** Round of 32 opponent slot (qualified teams only) */
  r32Opponent: BracketOpponent | null;
  /** Group-stage or qualification path line for pending teams */
  pendingLine: string | null;
  side: "left" | "right";
  /** For mutual confirmed sweep pairings — metadata only on primary */
  confirmedFixtureRole?: "primary" | "secondary" | null;
};

const SNAPSHOT_BY_TEAM = new Map<string, VerifiedTeamStatus>(
  VERIFIED_FAMILY_TEAM_STATUSES.map((t) => [t.teamName.toLowerCase(), t]),
);

const GROUP_SLOT_PATTERN =
  /\bgroup\s+[a-l]\s+(?:winner|runners?-up|runner-up|2nd|3rd)\b/i;
const THIRD_PLACE_PATTERN = /\b3rd\s+place\b/i;

function extractDate(fixture: string): string | undefined {
  const iso = fixture.match(/(\d{1,2}\s+[A-Za-z]{3})/);
  if (iso) return iso[1];
  const paren = fixture.match(/\((\d{1,2}\s+[A-Za-z]{3}[^)]*)\)/);
  if (paren) return paren[1].split(",")[0].trim();
  return undefined;
}

function extractVenue(fixture: string): string | undefined {
  const paren = fixture.match(/\([^)]*,\s*([^)]+)\)/);
  return paren?.[1]?.trim();
}

function isNamedNationalTeam(text: string): boolean {
  const lower = text.toLowerCase();
  if (GROUP_SLOT_PATTERN.test(lower)) return false;
  if (THIRD_PLACE_PATTERN.test(lower)) return false;
  if (/\b(groups?\s+[a-l])/i.test(lower)) return false;
  if (lower.includes("opponent tbd")) return false;
  if (lower.includes("tbd")) return false;
  return /^[A-Z]/.test(text.trim()) && text.trim().length > 2;
}

/**
 * Parse verified snapshot nextFixture for R32 opponent display.
 * Confirmed only when a specific opponent nation is named (not a group slot).
 */
export function parseR32Opponent(
  fixture: string | null,
  lockedOpponent?: string | null,
  kickoffUk?: string | null,
): BracketOpponent | null {
  if (lockedOpponent?.trim()) {
    return {
      label: lockedOpponent.trim(),
      kind: "confirmed",
      date: fixture ? extractDate(fixture) : undefined,
      time: kickoffUk?.trim() || undefined,
      venue: fixture ? extractVenue(fixture) : undefined,
    };
  }

  if (!fixture || !/^round of 32/i.test(fixture.trim())) {
    return { label: "TBC", kind: "tbc" };
  }

  if (/opponent\s+tbc/i.test(fixture)) {
    return { label: "TBC", kind: "tbc", date: extractDate(fixture) };
  }

  const date = extractDate(fixture);
  const venue = extractVenue(fixture);

  if (THIRD_PLACE_PATTERN.test(fixture) || /\b3rd\s+place\s+from\s+groups\b/i.test(fixture)) {
    return { label: "TBC", kind: "tbc", date, venue };
  }

  const vsMatch = fixture.match(/vs\s+(.+?)(?:\s*\(|$)/i);
  let opponentRaw = vsMatch?.[1]?.trim() ?? "";
  opponentRaw = opponentRaw.replace(/\s+\d{1,2}\s+[A-Za-z]{3}.*$/i, "").trim();

  if (GROUP_SLOT_PATTERN.test(opponentRaw) || GROUP_SLOT_PATTERN.test(fixture)) {
    const slot = opponentRaw.match(GROUP_SLOT_PATTERN)?.[0] ?? opponentRaw;
    return {
      label: slot.replace(/\s+/g, " "),
      kind: "projected",
      date,
      venue,
    };
  }

  if (isNamedNationalTeam(opponentRaw)) {
    return { label: opponentRaw, kind: "confirmed", date, venue };
  }

  if (opponentRaw) {
    return { label: opponentRaw, kind: "projected", date, venue };
  }

  return { label: "TBC", kind: "tbc", date, venue };
}

/** Group-stage pending line from snapshot nextFixture */
export function parsePendingLine(fixture: string | null): string | null {
  if (!fixture) return null;

  const date = extractDate(fixture);
  const dashMatch = fixture.match(/—\s*(.+)$/);
  if (dashMatch) {
    const matchup = dashMatch[1].trim();
  const vsParts = matchup.split(/\s+vs\s+/i);
    if (vsParts.length === 2) {
      const [a, b] = vsParts;
      return date ? `plays ${b.trim()} or ${a.trim()} · ${date}` : `plays ${matchup}`;
    }
    return date ? `${matchup} · ${date}` : matchup;
  }

  return date ? fixture.replace(/Round of 32\s*/i, "").trim() : fixture;
}

export function getBracketStatus(row: TrackerRow): BracketStatus {
  const { status, stage, next_stage_probability } = row.team_status;
  if (status === "eliminated") return "eliminated";
  if (
    status === "active" &&
    stage === "Round of 32" &&
    next_stage_probability !== null &&
    Number(next_stage_probability) >= 100
  ) {
    return "through";
  }
  return "pending";
}

function snapshotForTeam(teamName: string): VerifiedTeamStatus | undefined {
  return SNAPSHOT_BY_TEAM.get(teamName.toLowerCase());
}

function parseGroupOpponent(fixture: string, teamName: string): string | null {
  const matchup = fixture.split(/—/).pop()?.trim() ?? fixture;
  const cleaned = matchup.replace(/\s*\([^)]*\)\s*$/, "").trim();
  const vs = cleaned.match(/^(.+?)\s+vs\s+(.+)$/i);
  if (!vs) return null;

  const a = vs[1].trim();
  const b = vs[2].trim();
  const team = teamName.toLowerCase();

  if (a.toLowerCase() === team) return b;
  if (b.toLowerCase() === team) return a;
  return null;
}

function applyOpponentEnrichment(
  opponent: BracketOpponent | null,
  enrichment: WorldCup26EnrichmentMap[string] | undefined,
): BracketOpponent | null {
  if (!opponent || !enrichment) return opponent;

  const next: BracketOpponent = { ...opponent };

  if (enrichment.fixtureDate) {
    next.date = enrichment.fixtureDate;
  }
  if (enrichment.fixtureTime) {
    next.time = enrichment.fixtureTime;
  }
  if (enrichment.stadium) {
    next.venue = enrichment.stadium;
  }

  if (
    enrichment.r32OpponentSlot &&
    (opponent.kind === "projected" || opponent.kind === "tbc")
  ) {
    const slot = enrichment.r32OpponentSlot;
    const isNamedTeam = /^[A-Z]/.test(slot) && !/group|3rd|place|tbc/i.test(slot);
    if (!isNamedTeam) {
      next.label = slot;
    }
  }

  return next;
}

function applyPendingLineEnrichment(
  line: string | null,
  enrichment: WorldCup26EnrichmentMap[string] | undefined,
): string | null {
  if (!line || !enrichment) return line;

  const parts: string[] = [line];

  if (enrichment.fixtureTime && !line.includes(enrichment.fixtureTime)) {
    parts.push(enrichment.fixtureTime);
  }
  if (enrichment.stadium && !line.includes(enrichment.stadium)) {
    parts.push(enrichment.stadium);
  }

  return parts.length > 1 ? parts.join(" · ") : line;
}

/** Non-sweep nations with locked R32 opponents */
const EXTERNAL_OPPONENT_FLAGS: Record<string, string> = {
  japan: "🇯🇵",
  paraguay: "🇵🇾",
  "ivory coast": "🇨🇮",
  "côte d'ivoire": "🇨🇮",
  sweden: "🇸🇪",
  "bosnia and herzegovina": "🇧🇦",
  "cape verde": "🇨🇻",
  ecuador: "🇪🇨",
  ghana: "🇬🇭",
  senegal: "🇸🇳",
  austria: "🇦🇹",
  croatia: "🇭🇷",
  algeria: "🇩🇿",
  "dr congo": "🇨🇩",
};

/** Flag emoji for sweep team or known external R32 opponent */
export function getTeamFlagFromEntries(
  entries: SweepBracketEntry[],
  teamName: string,
): string | undefined {
  const found = entries.find(
    (e) => e.row.team?.name?.toLowerCase() === teamName.toLowerCase(),
  );
  if (found?.row.team?.flag_emoji) return found.row.team.flag_emoji;
  return EXTERNAL_OPPONENT_FLAGS[teamName.toLowerCase()];
}

/**
 * Mutual confirmed pairings: alphabetically later team is primary (full metadata once).
 * Unpaired confirmed rows stay primary.
 */
function assignConfirmedFixtureRoles(through: SweepBracketEntry[]): void {
  const byName = new Map(
    through.map((e) => [e.row.team?.name?.toLowerCase() ?? "", e]),
  );

  for (const entry of through) {
    const team = entry.row.team?.name;
    const opp = entry.r32Opponent;
    if (!team || opp?.kind !== "confirmed") continue;

    const oppEntry = byName.get(opp.label.toLowerCase());
    if (
      !oppEntry?.r32Opponent ||
      oppEntry.r32Opponent.kind !== "confirmed" ||
      oppEntry.r32Opponent.label.toLowerCase() !== team.toLowerCase()
    ) {
      continue;
    }

    const primary =
      team.localeCompare(opp.label, undefined, { sensitivity: "base" }) > 0
        ? team
        : opp.label;
    entry.confirmedFixtureRole = team === primary ? "primary" : "secondary";
  }

  for (const entry of through) {
    if (entry.r32Opponent?.kind === "confirmed" && !entry.confirmedFixtureRole) {
      entry.confirmedFixtureRole = "primary";
    }
  }
}

export type ConfirmedMutualFixture = {
  primary: SweepBracketEntry;
  secondary: SweepBracketEntry;
};

/** Mutual confirmed R32 pairings for single-fixture stage ladder display */
export function getConfirmedMutualFixtures(
  through: SweepBracketEntry[],
): ConfirmedMutualFixture[] {
  const seen = new Set<string>();
  const result: ConfirmedMutualFixture[] = [];

  for (const entry of through) {
    if (entry.confirmedFixtureRole !== "primary" || entry.r32Opponent?.kind !== "confirmed") {
      continue;
    }

    const teamA = entry.row.team?.name ?? "";
    const teamB = entry.r32Opponent.label;
    const key = [teamA, teamB].sort().join("|");
    if (seen.has(key)) continue;
    seen.add(key);

    const secondary = through.find((e) => e.row.team?.name === teamB);
    if (!secondary) continue;

    result.push({ primary: entry, secondary });
  }

  return result;
}

export type SweepBracketData = {
  through: SweepBracketEntry[];
  pending: SweepBracketEntry[];
  eliminated: SweepBracketEntry[];
  /** Family sweep teams qualified to Round of 16 */
  roundOf16Qualified: SweepBracketEntry[];
  /** Official tournament advancers that are not family sweep participants */
  externalAdvancers: ExternalBracketAdvancer[];
};

function isRoundOf16Qualified(row: TrackerRow): boolean {
  const { status, stage, next_stage_probability } = row.team_status;
  return (
    status === "active" &&
    stage === "Round of 16" &&
    next_stage_probability !== null &&
    Number(next_stage_probability) >= 100
  );
}

export function buildSweepBracketData(
  rows: TrackerRow[],
  enrichment?: WorldCup26EnrichmentMap | null,
): SweepBracketData {
  const through: SweepBracketEntry[] = [];
  const pending: SweepBracketEntry[] = [];
  const eliminated: SweepBracketEntry[] = [];
  const roundOf16Qualified: SweepBracketEntry[] = [];

  for (const row of rows) {
    const teamName = row.team?.name ?? "";
    const snapshot = snapshotForTeam(teamName);

    if (isRoundOf16Qualified(row)) {
      roundOf16Qualified.push({
        row,
        flagEmoji: row.team?.flag_emoji?.trim() || "⚽",
        status: "through",
        r32Opponent: null,
        pendingLine: "Qualified to Round of 16",
        side: "left",
      });
      continue;
    }

    const status = getBracketStatus(row);

    const base = {
      row,
      flagEmoji: row.team?.flag_emoji?.trim() || "⚽",
      status,
      r32Opponent: null as BracketOpponent | null,
      pendingLine: null as string | null,
      side: "left" as "left" | "right",
    };

    if (status === "through") {
      const teamEnrichment = enrichment?.[teamName];
      base.r32Opponent = applyOpponentEnrichment(
        parseR32Opponent(
          snapshot?.nextFixture ?? null,
          snapshot?.r32OpponentLocked ?? null,
          snapshot?.r32KickoffUk ?? null,
        ),
        teamEnrichment,
      );
      through.push({ ...base });
    } else if (status === "pending") {
      const fixture = snapshot?.nextFixture ?? null;
      const teamEnrichment = enrichment?.[teamName];
      if (fixture) {
        const opponent = parseGroupOpponent(fixture, teamName);
        const date = extractDate(fixture);
        base.pendingLine = applyPendingLineEnrichment(
          opponent
            ? date
              ? `plays ${opponent} · ${date}`
              : `plays ${opponent}`
            : parsePendingLine(fixture),
          teamEnrichment,
        );
      }
      pending.push({ ...base });
    } else {
      const externalAdvancer = VERIFIED_EXTERNAL_ADVANCERS.find(
        (a) => a.defeatedSweepTeam?.toLowerCase() === teamName.toLowerCase(),
      );
      if (externalAdvancer) {
        base.pendingLine = `lost to ${externalAdvancer.teamName}`;
        base.r32Opponent = {
          label: externalAdvancer.teamName,
          kind: "confirmed",
        };
      } else if (snapshot?.r32OpponentLocked) {
        base.pendingLine = `lost to ${snapshot.r32OpponentLocked}`;
        base.r32Opponent = {
          label: snapshot.r32OpponentLocked,
          kind: "confirmed",
        };
      }
      eliminated.push({ ...base });
    }
  }

  const sortByName = (a: SweepBracketEntry, b: SweepBracketEntry) =>
    (a.row.team?.name ?? "").localeCompare(b.row.team?.name ?? "");

  through.sort(sortByName);
  pending.sort(sortByName);
  eliminated.sort(sortByName);
  roundOf16Qualified.sort(sortByName);

  assignConfirmedFixtureRoles(through);

  const half = Math.ceil(through.length / 2);
  const throughWithSides = [
    ...through.slice(0, half).map((e) => ({ ...e, side: "left" as const })),
    ...through.slice(half).map((e) => ({ ...e, side: "right" as const })),
  ];

  return {
    through: throughWithSides,
    pending,
    eliminated,
    roundOf16Qualified,
    externalAdvancers: VERIFIED_EXTERNAL_ADVANCERS,
  };
}

/** @deprecated Use buildSweepBracketData */
export function buildSweepBracketEntries(
  rows: TrackerRow[],
): SweepBracketEntry[] {
  const data = buildSweepBracketData(rows);
  return [...data.through, ...data.pending, ...data.eliminated];
}

export function getThroughEntries(
  entries: SweepBracketEntry[],
): SweepBracketEntry[] {
  return entries.filter((e) => e.status === "through");
}

export function getPendingEntries(
  entries: SweepBracketEntry[],
): SweepBracketEntry[] {
  return entries.filter((e) => e.status === "pending");
}
