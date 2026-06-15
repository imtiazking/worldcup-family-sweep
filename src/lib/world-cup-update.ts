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

/**
 * Applies provider snapshot to the team_status table.
 * Each team row is upserted by team_name.
 */
export async function applyTournamentSnapshot(
  teams: ProviderTeamUpdate[]
): Promise<{ updated: number; skipped: number; winnerDetected: string | null }> {
  if (teams.length === 0) {
    return { updated: 0, skipped: 0, winnerDetected: null };
  }

  const supabase = createServiceClient();
  let updated = 0;
  let skipped = 0;
  let winnerDetected: string | null = null;

  for (const team of teams) {
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
 */
export async function runWorldCupStatusUpdate(): Promise<WorldCupUpdateResult> {
  const provider = createWorldCupProvider();
  const snapshot = await provider.fetchTournamentSnapshot();

  const { updated, skipped, winnerDetected } = await applyTournamentSnapshot(
    snapshot.teams
  );

  const detectedWinner =
    winnerDetected ?? snapshot.winnerTeamName ?? null;

  if (snapshot.teams.length === 0) {
    return {
      ok: true,
      provider: provider.name,
      updated: 0,
      skipped: 0,
      winnerDetected: detectedWinner,
      message:
        "No provider data available. Configure WORLD_CUP_PROVIDER to enable automated updates.",
    };
  }

  return {
    ok: true,
    provider: provider.name,
    updated,
    skipped,
    winnerDetected: detectedWinner,
    message: `Synced ${updated} team(s) from ${provider.name}.`,
  };
}
