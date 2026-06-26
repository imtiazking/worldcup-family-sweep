/**
 * Secondary enrichment provider for worldcup26.ir (rezarahiminia/worldcup2026).
 *
 * Source of truth: VERIFIED_FAMILY_TEAM_STATUSES in world-cup-verified-snapshot.ts
 * This module NEVER writes qualification status. It only enriches fixture metadata
 * (dates, stadiums, group labels, R32 placeholder slots) when healthy and fresh.
 */

import {
  VERIFIED_FAMILY_TEAM_STATUSES,
  type VerifiedTeamStatus,
} from "@/lib/world-cup-verified-snapshot";
import { SWEEP_TEAM_NAMES } from "@/lib/world-cup-provider/team-name-map";

const DEFAULT_BASE_URL = "https://worldcup26.ir";
const DEFAULT_CACHE_TTL_MS = 15 * 60 * 1000;
const DEFAULT_MAX_DATA_AGE_MS = 12 * 60 * 60 * 1000;

export type WorldCup26HealthStatus = {
  ok: boolean;
  status?: string;
  timestamp?: string;
  version?: string;
  database?: { status?: string; name?: string };
  error?: string;
  checkedAt: string;
};

export type WorldCup26Game = {
  id: string;
  type: string;
  group?: string;
  local_date?: string;
  stadium_id?: string;
  finished?: string;
  home_team_id?: string;
  away_team_id?: string;
  home_team_name_en?: string;
  away_team_name_en?: string;
  home_team_label?: string;
  away_team_label?: string;
};

export type WorldCup26Team = {
  id: string;
  name_en: string;
  groups?: string;
  fifa_code?: string;
};

export type WorldCup26GroupStanding = {
  team_id: string;
  mp?: string;
  pts?: string;
  gd?: string;
};

export type WorldCup26Group = {
  name: string;
  teams: WorldCup26GroupStanding[];
  updatedAt?: string;
};

export type WorldCup26Stadium = {
  id: string;
  name_en?: string;
  fifa_name?: string;
  city_en?: string;
};

export type WorldCup26Bundle = {
  fetchedAt: string;
  health: WorldCup26HealthStatus;
  games: WorldCup26Game[];
  groups: WorldCup26Group[];
  teams: WorldCup26Team[];
  stadiums: WorldCup26Stadium[];
};

export type WorldCup26TeamEnrichment = {
  groupLabel: string | null;
  fixtureDate: string | null;
  fixtureTime: string | null;
  stadium: string | null;
  r32OpponentSlot: string | null;
  r32MatchId: string | null;
};

/** Serializable enrichment map for server → client props */
export type WorldCup26EnrichmentMap = Record<string, WorldCup26TeamEnrichment>;

export type WorldCup26Mismatch = {
  teamName: string;
  field: string;
  verified: string;
  api: string;
};

type CacheEntry<T> = { data: T; expiresAt: number };

const responseCache = new Map<string, CacheEntry<unknown>>();

function baseUrl(): string {
  return (process.env.WORLD_CUP26_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, "");
}

export function isWorldCup26Enabled(): boolean {
  const flag = process.env.WORLD_CUP26_ENABLED?.toLowerCase();
  if (flag === "false" || flag === "0") return false;
  return true;
}

function cacheTtlMs(): number {
  const raw = Number(process.env.WORLD_CUP26_CACHE_TTL_MS);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_CACHE_TTL_MS;
}

function maxDataAgeMs(): number {
  const raw = Number(process.env.WORLD_CUP26_MAX_DATA_AGE_MS);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_MAX_DATA_AGE_MS;
}

async function fetchJson<T>(path: string, timeoutMs = 12_000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${baseUrl()}${path}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      next: { revalidate: 0 },
    });
    if (!res.ok) {
      throw new Error(`${path} returned HTTP ${res.status}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

async function cachedFetch<T>(key: string, loader: () => Promise<T>): Promise<T> {
  const hit = responseCache.get(key) as CacheEntry<T> | undefined;
  if (hit && hit.expiresAt > Date.now()) {
    return hit.data;
  }
  const data = await loader();
  responseCache.set(key, { data, expiresAt: Date.now() + cacheTtlMs() });
  return data;
}

/** Clears in-memory cache (tests / manual refresh). */
export function clearWorldCup26Cache(): void {
  responseCache.clear();
}

export async function checkWorldCup26Health(): Promise<WorldCup26HealthStatus> {
  const checkedAt = new Date().toISOString();
  if (!isWorldCup26Enabled()) {
    return { ok: false, error: "WORLD_CUP26_ENABLED=false", checkedAt };
  }

  try {
    const raw = await cachedFetch("health", () =>
      fetchJson<{
        status?: string;
        timestamp?: string;
        version?: string;
        database?: { status?: string; name?: string };
      }>("/health"),
    );

    const ok =
      raw.status === "healthy" && raw.database?.status === "connected";

    return {
      ok,
      status: raw.status,
      timestamp: raw.timestamp,
      version: raw.version,
      database: raw.database,
      checkedAt,
      error: ok ? undefined : "Health check failed or database disconnected",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Health request failed",
      checkedAt,
    };
  }
}

function isBundleFresh(bundle: WorldCup26Bundle): boolean {
  const stamps: number[] = [];

  if (bundle.health.timestamp) {
    const t = Date.parse(bundle.health.timestamp);
    if (!Number.isNaN(t)) stamps.push(t);
  }

  for (const group of bundle.groups) {
    if (group.updatedAt) {
      const t = Date.parse(group.updatedAt);
      if (!Number.isNaN(t)) stamps.push(t);
    }
  }

  if (stamps.length === 0) return false;

  const newest = Math.max(...stamps);
  return Date.now() - newest <= maxDataAgeMs();
}

function parseGamesResponse(raw: { games?: WorldCup26Game[] }): WorldCup26Game[] {
  return raw.games ?? [];
}

function parseTeamsResponse(raw: { teams?: WorldCup26Team[] }): WorldCup26Team[] {
  return raw.teams ?? [];
}

function parseGroupsResponse(raw: { groups?: WorldCup26Group[] }): WorldCup26Group[] {
  return raw.groups ?? [];
}

function parseStadiumsResponse(raw: {
  stadiums?: WorldCup26Stadium[];
}): WorldCup26Stadium[] {
  return raw.stadiums ?? [];
}

/**
 * Fetches all worldcup26.ir endpoints. Returns null on failure or stale data (fail closed).
 */
export async function fetchWorldCup26Bundle(): Promise<WorldCup26Bundle | null> {
  if (!isWorldCup26Enabled()) {
    return null;
  }

  const health = await checkWorldCup26Health();
  if (!health.ok) {
    console.warn("[worldcup26] Health check failed — skipping enrichment", health);
    return null;
  }

  try {
    const [gamesRaw, groupsRaw, teamsRaw, stadiumsRaw] = await Promise.all([
      cachedFetch("games", () => fetchJson<{ games?: WorldCup26Game[] }>("/get/games")),
      cachedFetch("groups", () =>
        fetchJson<{ groups?: WorldCup26Group[] }>("/get/groups"),
      ),
      cachedFetch("teams", () => fetchJson<{ teams?: WorldCup26Team[] }>("/get/teams")),
      cachedFetch("stadiums", () =>
        fetchJson<{ stadiums?: WorldCup26Stadium[] }>("/get/stadiums"),
      ),
    ]);

    const bundle: WorldCup26Bundle = {
      fetchedAt: new Date().toISOString(),
      health,
      games: parseGamesResponse(gamesRaw),
      groups: parseGroupsResponse(groupsRaw),
      teams: parseTeamsResponse(teamsRaw),
      stadiums: parseStadiumsResponse(stadiumsRaw),
    };

    if (!isBundleFresh(bundle)) {
      console.warn("[worldcup26] Bundle stale — skipping enrichment", {
        healthTimestamp: bundle.health.timestamp,
        groupUpdates: bundle.groups.map((g) => g.updatedAt),
      });
      return null;
    }

    if (bundle.games.length === 0 || bundle.teams.length === 0) {
      console.warn("[worldcup26] Empty games or teams — skipping enrichment");
      return null;
    }

    return bundle;
  } catch (error) {
    console.warn(
      "[worldcup26] Fetch failed — skipping enrichment",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Parses worldcup26 local_date "MM/DD/YYYY HH:mm" */
export function parseWorldCup26LocalDate(localDate: string): {
  dateLabel: string;
  timeLabel: string;
} | null {
  const match = localDate.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})/,
  );
  if (!match) return null;

  const month = Number(match[1]);
  const day = Number(match[2]);
  const hour = match[4];
  const minute = match[5];

  if (month < 1 || month > 12) return null;

  return {
    dateLabel: `${day} ${MONTHS[month - 1]}`,
    timeLabel: `${hour}:${minute}`,
  };
}

/** Maps API bracket labels to snapshot-style slot text */
export function formatWorldCup26SlotLabel(label: string): string {
  const trimmed = label.trim();

  const winner = trimmed.match(/^Winner Group ([A-L])$/i);
  if (winner) return `Group ${winner[1].toUpperCase()} winner`;

  const runner = trimmed.match(/^Runner-up Group ([A-L])$/i);
  if (runner) return `Group ${runner[1].toUpperCase()} runner-up`;

  const third = trimmed.match(/^3rd Group ([A-L](?:\/[A-L])*)/i);
  if (third) {
    const letters = third[1].split("/").join(", ");
    return `3rd place from Groups ${letters}`;
  }

  return trimmed;
}

function stadiumName(
  stadiumId: string | undefined,
  stadiumById: Map<string, WorldCup26Stadium>,
): string | null {
  if (!stadiumId) return null;
  const stadium = stadiumById.get(stadiumId);
  return stadium?.fifa_name ?? stadium?.name_en ?? null;
}

function sortedGroupTeams(group: WorldCup26Group): WorldCup26GroupStanding[] {
  return [...group.teams].sort((a, b) => {
    const ptsA = Number(a.pts ?? 0);
    const ptsB = Number(b.pts ?? 0);
    if (ptsB !== ptsA) return ptsB - ptsA;
    const gdA = Number(a.gd ?? 0);
    const gdB = Number(b.gd ?? 0);
    return gdB - gdA;
  });
}

function inferGroupRole(
  teamId: string,
  group: WorldCup26Group | undefined,
): "winner" | "runner-up" | "other" | null {
  if (!group) return null;
  const ordered = sortedGroupTeams(group);
  const idx = ordered.findIndex((t) => t.team_id === teamId);
  if (idx === 0) return "winner";
  if (idx === 1) return "runner-up";
  return "other";
}

function findR32GameForTeam(
  team: WorldCup26Team,
  games: WorldCup26Game[],
  groups: WorldCup26Group[],
): WorldCup26Game | null {
  const r32 = games.filter((g) => g.type === "r32");
  const byName = r32.find(
    (g) =>
      g.home_team_name_en === team.name_en ||
      g.away_team_name_en === team.name_en,
  );
  if (byName) return byName;

  const groupLetter = team.groups?.toUpperCase();
  if (!groupLetter) return null;

  const group = groups.find((g) => g.name.toUpperCase() === groupLetter);
  const role = inferGroupRole(team.id, group);
  if (!role || role === "other") return null;

  const winnerPattern = `Winner Group ${groupLetter}`;
  const runnerPattern = `Runner-up Group ${groupLetter}`;

  return (
    r32.find((g) => {
      const home = g.home_team_label ?? "";
      const away = g.away_team_label ?? "";
      if (role === "winner") {
        return home === winnerPattern || away === winnerPattern;
      }
      return home === runnerPattern || away === runnerPattern;
    }) ?? null
  );
}

function opponentSlotForTeamInR32(
  game: WorldCup26Game,
  team: WorldCup26Team,
  groups: WorldCup26Group[],
): string | null {
  const groupLetter = team.groups?.toUpperCase();
  const group = groupLetter
    ? groups.find((g) => g.name.toUpperCase() === groupLetter)
    : undefined;
  const role = inferGroupRole(team.id, group);

  const homeLabel = game.home_team_label ?? "";
  const awayLabel = game.away_team_label ?? "";

  if (game.home_team_name_en === team.name_en) {
    if (awayLabel) return formatWorldCup26SlotLabel(awayLabel);
    return game.away_team_name_en ?? null;
  }

  if (game.away_team_name_en === team.name_en) {
    if (homeLabel) return formatWorldCup26SlotLabel(homeLabel);
    return game.home_team_name_en ?? null;
  }

  if (!groupLetter || !role || role === "other") return null;

  const winnerPattern = `Winner Group ${groupLetter}`;
  const runnerPattern = `Runner-up Group ${groupLetter}`;

  if (role === "winner") {
    if (homeLabel === winnerPattern && awayLabel) {
      return formatWorldCup26SlotLabel(awayLabel);
    }
    if (awayLabel === winnerPattern && homeLabel) {
      return formatWorldCup26SlotLabel(homeLabel);
    }
  }

  if (role === "runner-up") {
    if (homeLabel === runnerPattern && awayLabel) {
      return formatWorldCup26SlotLabel(awayLabel);
    }
    if (awayLabel === runnerPattern && homeLabel) {
      return formatWorldCup26SlotLabel(homeLabel);
    }
  }

  return null;
}

function findNextGroupGame(
  team: WorldCup26Team,
  games: WorldCup26Game[],
): WorldCup26Game | null {
  const upcoming = games
    .filter(
      (g) =>
        g.type === "group" &&
        g.finished?.toUpperCase() !== "TRUE" &&
        (g.home_team_name_en === team.name_en ||
          g.away_team_name_en === team.name_en),
    )
    .sort((a, b) =>
      (a.local_date ?? "").localeCompare(b.local_date ?? ""),
    );

  return upcoming[0] ?? null;
}

function buildTeamEnrichment(
  teamName: string,
  bundle: WorldCup26Bundle,
  verified: VerifiedTeamStatus,
): WorldCup26TeamEnrichment {
  const teamByName = new Map(
    bundle.teams.map((t) => [t.name_en.toLowerCase(), t]),
  );
  const stadiumById = new Map(bundle.stadiums.map((s) => [s.id, s]));
  const apiTeam = teamByName.get(teamName.toLowerCase());

  const empty: WorldCup26TeamEnrichment = {
    groupLabel: apiTeam?.groups ? `Group ${apiTeam.groups.toUpperCase()}` : null,
    fixtureDate: null,
    fixtureTime: null,
    stadium: null,
    r32OpponentSlot: null,
    r32MatchId: null,
  };

  if (!apiTeam) return empty;

  const isThrough =
    verified.stage === "Round of 32" &&
    verified.nextStageProbability !== null &&
    verified.nextStageProbability >= 100;

  if (isThrough) {
    const r32 = findR32GameForTeam(apiTeam, bundle.games, bundle.groups);
    if (!r32?.local_date) return empty;

    const parsed = parseWorldCup26LocalDate(r32.local_date);
    return {
      groupLabel: empty.groupLabel,
      fixtureDate: parsed?.dateLabel ?? null,
      fixtureTime: parsed?.timeLabel ?? null,
      stadium: stadiumName(r32.stadium_id, stadiumById),
      r32OpponentSlot: opponentSlotForTeamInR32(r32, apiTeam, bundle.groups),
      r32MatchId: r32.id,
    };
  }

  const nextGroup = findNextGroupGame(apiTeam, bundle.games);
  if (!nextGroup?.local_date) return empty;

  const parsed = parseWorldCup26LocalDate(nextGroup.local_date);
  return {
    groupLabel: empty.groupLabel,
    fixtureDate: parsed?.dateLabel ?? null,
    fixtureTime: parsed?.timeLabel ?? null,
    stadium: stadiumName(nextGroup.stadium_id, stadiumById),
    r32OpponentSlot: null,
    r32MatchId: null,
  };
}

export function buildWorldCup26Enrichment(
  bundle: WorldCup26Bundle,
): WorldCup26EnrichmentMap {
  const verifiedByName = new Map(
    VERIFIED_FAMILY_TEAM_STATUSES.map((v) => [v.teamName.toLowerCase(), v]),
  );

  const result: WorldCup26EnrichmentMap = {};

  for (const teamName of SWEEP_TEAM_NAMES) {
    const verified = verifiedByName.get(teamName.toLowerCase());
    if (!verified) continue;
    result[teamName] = buildTeamEnrichment(teamName, bundle, verified);
  }

  return result;
}

function extractVerifiedGroupLetter(verified: VerifiedTeamStatus): string | null {
  const fromReason = verified.reason.match(/\bGroup ([A-L])\b/i);
  if (fromReason) return fromReason[1].toUpperCase();
  return null;
}

function isVerifiedThrough(verified: VerifiedTeamStatus): boolean {
  return (
    verified.stage === "Round of 32" &&
    verified.nextStageProbability !== null &&
    verified.nextStageProbability >= 100
  );
}

/**
 * Compares API standings/group data to verified snapshot. Logs only — never mutates snapshot.
 */
export function compareWorldCup26ToVerifiedSnapshot(
  bundle: WorldCup26Bundle,
): WorldCup26Mismatch[] {
  const mismatches: WorldCup26Mismatch[] = [];
  const teamByName = new Map(
    bundle.teams.map((t) => [t.name_en.toLowerCase(), t]),
  );
  const groupByLetter = new Map(
    bundle.groups.map((g) => [g.name.toUpperCase(), g]),
  );

  for (const verified of VERIFIED_FAMILY_TEAM_STATUSES) {
    const apiTeam = teamByName.get(verified.teamName.toLowerCase());
    if (!apiTeam) {
      mismatches.push({
        teamName: verified.teamName,
        field: "team_presence",
        verified: "in sweep snapshot",
        api: "missing from /get/teams",
      });
      continue;
    }

    const verifiedGroup = extractVerifiedGroupLetter(verified);
    const apiGroup = apiTeam.groups?.toUpperCase() ?? null;
    if (verifiedGroup && apiGroup && verifiedGroup !== apiGroup) {
      mismatches.push({
        teamName: verified.teamName,
        field: "group",
        verified: verifiedGroup,
        api: apiGroup,
      });
    }

    const group = apiGroup ? groupByLetter.get(apiGroup) : undefined;
    const role = inferGroupRole(apiTeam.id, group);
    const through = isVerifiedThrough(verified);
    const groupComplete = group?.teams.every((t) => Number(t.mp ?? 0) >= 3);

    if (through && groupComplete && role === "other") {
      mismatches.push({
        teamName: verified.teamName,
        field: "qualification",
        verified: "through (Round of 32)",
        api: `group ${apiGroup} position 3+ after group complete`,
      });
    }

    if (!through && role === "winner" && groupComplete) {
      mismatches.push({
        teamName: verified.teamName,
        field: "qualification",
        verified: "pending (group stage)",
        api: `group ${apiGroup} winner after group complete`,
      });
    }
  }

  return mismatches;
}

export function logWorldCup26Mismatches(mismatches: WorldCup26Mismatch[]): void {
  if (mismatches.length === 0) {
    console.info("[worldcup26] Verified snapshot comparison: no mismatches");
    return;
  }
  console.warn(
    `[worldcup26] Verified snapshot comparison: ${mismatches.length} mismatch(es) (not applied)`,
    mismatches,
  );
}

/**
 * Loads enrichment for sweep teams. Fail closed — returns null if provider unhealthy.
 */
export async function loadWorldCup26Enrichment(): Promise<WorldCup26EnrichmentMap | null> {
  const bundle = await fetchWorldCup26Bundle();
  if (!bundle) return null;

  const mismatches = compareWorldCup26ToVerifiedSnapshot(bundle);
  logWorldCup26Mismatches(mismatches);

  return buildWorldCup26Enrichment(bundle);
}
