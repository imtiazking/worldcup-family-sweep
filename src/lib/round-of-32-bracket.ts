import {
  VERIFIED_FAMILY_TEAM_STATUSES,
  type VerifiedTeamStatus,
} from "@/lib/world-cup-verified-snapshot";
import type { WorldCup26EnrichmentMap } from "@/lib/providers/worldcup26-provider";
import type { TrackerRow } from "@/lib/tracker";

export type BracketStatus = "through" | "pending" | "eliminated";

export type OpponentKind = "confirmed" | "projected" | "tbc";

export type BracketOpponent = {
  label: string;
  kind: OpponentKind;
  date?: string;
  venue?: string;
};

export type SweepBracketEntry = {
  row: TrackerRow;
  status: BracketStatus;
  /** Round of 32 opponent slot (qualified teams only) */
  r32Opponent: BracketOpponent | null;
  /** Group-stage or qualification path line for pending teams */
  pendingLine: string | null;
  side: "left" | "right";
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
): BracketOpponent | null {
  if (lockedOpponent?.trim()) {
    return {
      label: lockedOpponent.trim(),
      kind: "confirmed",
      date: fixture ? extractDate(fixture) : undefined,
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

export type SweepBracketData = {
  through: SweepBracketEntry[];
  pending: SweepBracketEntry[];
  eliminated: SweepBracketEntry[];
};

export function buildSweepBracketData(
  rows: TrackerRow[],
  enrichment?: WorldCup26EnrichmentMap | null,
): SweepBracketData {
  const through: SweepBracketEntry[] = [];
  const pending: SweepBracketEntry[] = [];
  const eliminated: SweepBracketEntry[] = [];

  for (const row of rows) {
    const teamName = row.team?.name ?? "";
    const snapshot = snapshotForTeam(teamName);
    const status = getBracketStatus(row);

    const base = {
      row,
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
      eliminated.push({ ...base });
    }
  }

  const sortByName = (a: SweepBracketEntry, b: SweepBracketEntry) =>
    (a.row.team?.name ?? "").localeCompare(b.row.team?.name ?? "");

  through.sort(sortByName);
  pending.sort(sortByName);
  eliminated.sort(sortByName);

  const half = Math.ceil(through.length / 2);
  const throughWithSides = [
    ...through.slice(0, half).map((e) => ({ ...e, side: "left" as const })),
    ...through.slice(half).map((e) => ({ ...e, side: "right" as const })),
  ];

  return { through: throughWithSides, pending, eliminated };
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
