import { createServiceClient } from "@/lib/supabase";
import {
  VERIFIED_FAMILY_TEAM_STATUSES,
  VERIFIED_SNAPSHOT_SOURCE,
} from "@/lib/world-cup-verified-snapshot";
import type { ApiFootballSyncLogs } from "@/lib/api-football-live-classifier";
import {
  SYNC_SOURCE_API_ERROR,
  SYNC_SOURCE_FALLBACK,
  formatSyncSourceLabel,
} from "@/lib/sync-sources";

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
  reason?: string;
  logs?: ApiFootballSyncLogs;
};

export type TeamStatusRowInput = {
  teamName: string;
  status: string;
  stage: string;
  nextStageProbability: number | null;
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
  source: string;
  message: string;
  error?: string;
  logs?: ApiFootballSyncLogs;
};

export type TrackerSyncInfo = {
  lastSyncAt: string | null;
  lastCheckedAt: string | null;
  dataSource: string | null;
  syncStatus: "ok" | "failed" | "unknown";
  syncError: string | null;
};

function classifyTeam(
  row: Pick<TeamStatusRowInput, "status" | "stage" | "nextStageProbability">,
): "qualified" | "pending" | "eliminated" {
  if (row.status === "eliminated") return "eliminated";
  if (row.status === "winner") return "qualified";
  if (
    row.nextStageProbability !== null &&
    row.nextStageProbability >= 100 &&
    row.stage !== "Group Stage"
  ) {
    return "qualified";
  }
  return "pending";
}

function countBuckets(rows: TeamStatusRowInput[]) {
  let qualified = 0;
  let pending = 0;
  let eliminated = 0;
  for (const row of rows) {
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

    const source = parsed.source ?? null;

    return {
      lastSyncAt,
      lastCheckedAt,
      dataSource: source ? formatSyncSourceLabel(source) : null,
      syncStatus,
      syncError: parsed.error ?? parsed.reason ?? null,
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

export async function applyTeamStatusRows(
  rows: TeamStatusRowInput[],
  source: string,
  logs?: ApiFootballSyncLogs,
  reason?: string,
): Promise<VerifiedSyncResult> {
  const now = new Date().toISOString();
  const { qualified, pending, eliminated } = countBuckets(rows);
  const dataSource = formatSyncSourceLabel(source);

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
      skipped: rows.length,
      lastSyncAt: now,
      dataSource,
      source,
      message,
      error: message,
      logs,
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
      source,
      status: "failed",
      lastCheckedAt: now,
      qualified,
      pending,
      eliminated,
      updatedTeams: existing?.updatedTeams ?? [],
      error: teamsError.message,
      reason,
      logs,
    });

    return {
      ok: false,
      qualified,
      pending,
      eliminated,
      updatedTeams: [],
      updated: 0,
      skipped: rows.length,
      lastSyncAt: existing?.lastSyncAt ?? existing?.at ?? now,
      dataSource,
      source,
      message: `Sync failed — existing data preserved. ${teamsError.message}`,
      error: teamsError.message,
      logs,
    };
  }

  const allowed = new Set((teams ?? []).map((t) => t.name));
  let updated = 0;
  let skipped = 0;
  const updatedTeams: string[] = [];

  for (const row of rows) {
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
    source,
    status: "ok",
    lastCheckedAt: now,
    qualified,
    pending,
    eliminated,
    updatedTeams,
    reason,
    logs,
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
      source,
      message: `team_status updated but tournament_meta failed: ${metaError}`,
      error: metaError,
      logs,
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
    source,
    message: `Synced ${updated} team(s) from ${dataSource} (${qualified} qualified, ${pending} pending, ${eliminated} eliminated).`,
    logs,
  };
}

export type VerifiedSyncOptions = {
  source?: string;
  reason?: string;
};

/**
 * Applies the verified FIFA/Wikipedia snapshot to team_status and tournament_meta.
 */
export async function runVerifiedTeamStatusSync(
  options: VerifiedSyncOptions = {},
): Promise<VerifiedSyncResult> {
  const source = options.source ?? VERIFIED_SNAPSHOT_SOURCE;
  const rows: TeamStatusRowInput[] = VERIFIED_FAMILY_TEAM_STATUSES.map(
    (row) => ({
      teamName: row.teamName,
      status: row.status,
      stage: row.stage,
      nextStageProbability: row.nextStageProbability,
    }),
  );

  if (source === SYNC_SOURCE_FALLBACK || source === SYNC_SOURCE_API_ERROR) {
    console.info(
      `[sync-team-status] Verified snapshot fallback (${source})`,
      options.reason ?? "no reason",
    );
  }

  return applyTeamStatusRows(rows, source, undefined, options.reason);
}
