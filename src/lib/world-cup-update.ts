import { createServiceClient } from "@/lib/supabase";
import { createWorldCupProvider } from "@/lib/world-cup-provider";
import type { ProviderTeamUpdate } from "@/lib/world-cup-provider/types";

export type WorldCupUpdateResult = {
  ok: boolean;
  provider: string;
  updated: number;
  skipped: number;
  winnerDetected: string | null;
  message: string;
};

async function getAllowedTeamNames(): Promise<Set<string>> {
  try {
    const supabase = createServiceClient();
    const { data } = await supabase.from("teams").select("name");
    return new Set((data ?? []).map((row) => row.name));
  } catch {
    return new Set();
  }
}

/**
 * Applies provider snapshot to the team_status table.
 * Only updates teams that exist in the sweep `teams` table — never touches
 * assignments, participants, or invite data.
 */
export async function applyTournamentSnapshot(
  teams: ProviderTeamUpdate[]
): Promise<{ updated: number; skipped: number; winnerDetected: string | null }> {
  if (teams.length === 0) {
    return { updated: 0, skipped: 0, winnerDetected: null };
  }

  const allowedNames = await getAllowedTeamNames();
  const supabase = createServiceClient();
  let updated = 0;
  let skipped = 0;
  let winnerDetected: string | null = null;

  for (const team of teams) {
    if (allowedNames.size > 0 && !allowedNames.has(team.teamName)) {
      skipped += 1;
      continue;
    }

    const { error } = await supabase.from("team_status").upsert(
      {
        team_name: team.teamName,
        status: team.status,
        stage: team.stage,
      },
      { onConflict: "team_name" }
    );

    if (error) {
      console.error(
        `[world-cup-update] Failed to update ${team.teamName}:`,
        error.message
      );
      skipped += 1;
      continue;
    }

    updated += 1;
    if (team.status === "winner") {
      winnerDetected = team.teamName;
    }
  }

  return { updated, skipped, winnerDetected };
}

/**
 * Orchestrates a full World Cup status sync from the configured provider.
 * On API failure, returns an error without modifying existing team_status rows.
 */
export async function runWorldCupStatusUpdate(): Promise<WorldCupUpdateResult> {
  const provider = createWorldCupProvider();

  let snapshot;
  try {
    snapshot = await provider.fetchTournamentSnapshot();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Provider fetch failed";
    return {
      ok: false,
      provider: provider.name,
      updated: 0,
      skipped: 0,
      winnerDetected: null,
      message: `Sync aborted — existing data preserved. ${message}`,
    };
  }

  if (snapshot.teams.length === 0) {
    return {
      ok: true,
      provider: provider.name,
      updated: 0,
      skipped: 0,
      winnerDetected: snapshot.winnerTeamName,
      message:
        provider.name === "noop"
          ? "No provider data (noop). Set API_FOOTBALL_KEY and WORLD_CUP_PROVIDER=api-football to enable sync."
          : "No team updates returned from provider.",
    };
  }

  const { updated, skipped, winnerDetected } = await applyTournamentSnapshot(
    snapshot.teams
  );

  const detectedWinner =
    winnerDetected ?? snapshot.winnerTeamName ?? null;

  return {
    ok: true,
    provider: provider.name,
    updated,
    skipped,
    winnerDetected: detectedWinner,
    message: `Synced ${updated} team(s) from ${provider.name}${skipped ? ` (${skipped} skipped)` : ""}.`,
  };
}
