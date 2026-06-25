import { createServiceClient } from "@/lib/supabase";
import {
  VERIFIED_FAMILY_TEAM_STATUSES,
  VERIFIED_SNAPSHOT_SOURCE,
  type VerifiedTeamStatus,
} from "@/lib/world-cup-verified-snapshot";

export type TournamentSyncMeta = {
  at: string;
  lastSyncAt: string;
  source: string;
  status: "ok" | "failed";
  lastCheckedAt: string;
  qualified: number;
  pending: number;
  eliminated: number;
  updatedTeams: string[];
  error?: string;
};

export type VerifiedSyncResult = {
  ok: boolean;
  qualified: number;
  pending: number;
  eliminated: number;
  updatedTeams: string[];
  updated: number;
  skipped: number;
  lastSyncAt: string;
  dataSource: string;
  message: string;
  error?: string;
};

export type TrackerSyncInfo = {
  lastSyncAt: string | null;
  lastCheckedAt: string | null;
  dataSource: string | null;
  syncStatus: "ok" | "failed" | "unknown";
  syncError: string | null;
};

function classifyTeam(
  row: VerifiedTeamStatus,
): "qualified" | "pending" | "eliminated" {
  if (row.status === "eliminated") return "eliminated";
  if (row.nextStageProbability === 100 && row.stage !== "Group Stage") {
    return "qualified";
  }
  return "pending";
}

function countBuckets(statuses: VerifiedTeamStatus[]) {
  let qualified = 0;
  let pending = 0;
  let eliminated = 0;
  for (const row of statuses) {
    const bucket = classifyTeam(row);
    if (bucket === "qualified") qualified += 1;
    else if (bucket === "eliminated") eliminated += 1;
    else pending += 1;
  }
  return { qualified, pending, eliminated };
}

export function parseTournamentSyncMeta(
  value: string | null | undefined,
  updatedAt: string | null | undefined,
): TrackerSyncInfo {
  if (!value && !updatedAt) {
    return {
      lastSyncAt: null,
      lastCheckedAt: null,
      dataSource: null,
      syncStatus: "unknown",
      syncError: null,
    };
  }

  try {
    const parsed = JSON.parse(value ?? "{}") as Partial<TournamentSyncMeta> & {
      at?: string;
      source?: string;
    };

    const lastSyncAt =
      parsed.lastSyncAt ?? parsed.at ?? updatedAt ?? null;
    const lastCheckedAt = parsed.lastCheckedAt ?? lastSyncAt;
    const syncStatus =
      parsed.status === "failed"
        ? "failed"
        : parsed.status === "ok"
          ? "ok"
          : lastSyncAt
            ? "ok"
            : "unknown";

    return {
      lastSyncAt,
      lastCheckedAt,
      dataSource: parsed.source ?? null,
      syncStatus,
      syncError: parsed.error ?? null,
    };
  } catch {
    return {
      lastSyncAt: updatedAt ?? null,
      lastCheckedAt: updatedAt ?? null,
      dataSource: null,
      syncStatus: updatedAt ? "ok" : "unknown",
      syncError: null,
    };
  }
}

async function readExistingMeta(): Promise<Partial<TournamentSyncMeta> | null> {
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("tournament_meta")
      .select("value")
      .eq("key", "last_status_sync")
      .maybeSingle();

    if (!data?.value) return null;
    return JSON.parse(data.value) as Partial<TournamentSyncMeta>;
  } catch {
    return null;
  }
}

async function writeSyncMeta(meta: TournamentSyncMeta): Promise<string | null> {
  const supabase = createServiceClient();
  const { error } = await supabase.from("tournament_meta").upsert(
    {
      key: "last_status_sync",
      value: JSON.stringify(meta),
      updated_at: meta.lastCheckedAt,
    },
    { onConflict: "key" },
  );

  return error?.message ?? null;
}

/**
 * Applies the verified FIFA/Wikipedia snapshot to team_status and tournament_meta.
 * Same logic as `npm run sync:team-status`.
 */
export async function runVerifiedTeamStatusSync(): Promise<VerifiedSyncResult> {
  const now = new Date().toISOString();
  const dataSource = VERIFIED_SNAPSHOT_SOURCE;
  const { qualified, pending, eliminated } = countBuckets(
    VERIFIED_FAMILY_TEAM_STATUSES,
  );

  let supabase;
  try {
    supabase = createServiceClient();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Supabase client unavailable";
    return {
      ok: false,
      qualified,
      pending,
      eliminated,
      updatedTeams: [],
      updated: 0,
      skipped: VERIFIED_FAMILY_TEAM_STATUSES.length,
      lastSyncAt: now,
      dataSource,
      message: message,
      error: message,
    };
  }

  const { data: teams, error: teamsError } = await supabase
    .from("teams")
    .select("name");

  if (teamsError) {
    const existing = await readExistingMeta();
    await writeSyncMeta({
      at: existing?.lastSyncAt ?? existing?.at ?? now,
      lastSyncAt: existing?.lastSyncAt ?? existing?.at ?? now,
      source: dataSource,
      status: "failed",
      lastCheckedAt: now,
      qualified,
      pending,
      eliminated,
      updatedTeams: existing?.updatedTeams ?? [],
      error: teamsError.message,
    });

    return {
      ok: false,
      qualified,
      pending,
      eliminated,
      updatedTeams: [],
      updated: 0,
      skipped: VERIFIED_FAMILY_TEAM_STATUSES.length,
      lastSyncAt: existing?.lastSyncAt ?? existing?.at ?? now,
      dataSource,
      message: `Sync failed — existing data preserved. ${teamsError.message}`,
      error: teamsError.message,
    };
  }

  const allowed = new Set((teams ?? []).map((t) => t.name));
  let updated = 0;
  let skipped = 0;
  const updatedTeams: string[] = [];

  for (const row of VERIFIED_FAMILY_TEAM_STATUSES) {
    if (!allowed.has(row.teamName)) {
      skipped += 1;
      continue;
    }

    const payload = {
      team_name: row.teamName,
      status: row.status,
      stage: row.stage,
      next_stage_probability: row.nextStageProbability,
    };

    const { error } = await supabase
      .from("team_status")
      .upsert(payload, { onConflict: "team_name" });

    if (error) {
      console.error(`[sync-team-status] Failed ${row.teamName}:`, error.message);
      skipped += 1;
      continue;
    }

    updated += 1;
    updatedTeams.push(row.teamName);
  }

  const metaError = await writeSyncMeta({
    at: now,
    lastSyncAt: now,
    source: dataSource,
    status: "ok",
    lastCheckedAt: now,
    qualified,
    pending,
    eliminated,
    updatedTeams,
  });

  if (metaError) {
    return {
      ok: false,
      qualified,
      pending,
      eliminated,
      updatedTeams,
      updated,
      skipped,
      lastSyncAt: now,
      dataSource,
      message: `team_status updated but tournament_meta failed: ${metaError}`,
      error: metaError,
    };
  }

  return {
    ok: true,
    qualified,
    pending,
    eliminated,
    updatedTeams,
    updated,
    skipped,
    lastSyncAt: now,
    dataSource,
    message: `Synced ${updated} team(s) from verified snapshot (${qualified} qualified, ${pending} pending, ${eliminated} eliminated).`,
  };
}
