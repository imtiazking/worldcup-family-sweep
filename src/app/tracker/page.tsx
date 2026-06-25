export const dynamic = "force-dynamic";

import { createPublicClient } from "@/lib/supabase";
import { TrackerExperience } from "@/components/tracker/TrackerExperience";
import {
  buildLeaderboard,
  computeTournamentStats,
  type TrackerRow,
} from "@/lib/tracker";
import {
  buildWheelVisibilityDebug,
  logWheelVisibilityDebug,
} from "@/lib/wheel-visibility-debug";
import { parseTournamentSyncMeta } from "@/lib/sync-verified-team-status";

type Assignment = {
  participant_id: string;
  team_id: string;
};

type Participant = {
  id: string;
  name: string;
};

type Team = {
  id: string;
  name: string;
  flag_emoji: string;
};

type TeamStatus = {
  team_name: string;
  status: string;
  stage: string;
  next_stage_probability?: number | null;
};

function normalizeStatusValue(status: string): string {
  return status.trim().toLowerCase();
}

function normalizeTeamKey(name: string): string {
  return name.trim().toLowerCase();
}

export default async function TrackerPage() {
  const supabase = createPublicClient();

  const { data: assignments, error: assignmentsError } = await supabase
    .from("assignments")
    .select("participant_id, team_id");

  const { data: participants, error: participantsError } = await supabase
    .from("participants")
    .select("id, name");

  const { data: teams, error: teamsError } = await supabase
    .from("teams")
    .select("id, name, flag_emoji");

  const { data: statuses, error: statusesError } = await supabase
    .from("team_status")
    .select("team_name, status, stage, next_stage_probability");

  const { data: metaRows } = await supabase
    .from("tournament_meta")
    .select("key, value, updated_at")
    .eq("key", "last_status_sync")
    .maybeSingle();

  const syncInfo = parseTournamentSyncMeta(
    metaRows?.value,
    metaRows?.updated_at ?? null,
  );
  const lastStatusSync = syncInfo.lastSyncAt;

  if (assignmentsError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-4xl text-wc-gold">Tracker unavailable</h1>
        <p className="mt-3 text-white/50">Could not load sweep data.</p>
      </div>
    );
  }

  const participantMap = new Map(
    (participants ?? []).map((p: Participant) => [p.id, p]),
  );

  const teamMap = new Map(
    (teams ?? []).map((t: Team) => [t.id, t]),
  );

  const statusMap = new Map(
    (statuses ?? []).map((s: TeamStatus) => [
      normalizeTeamKey(s.team_name),
      s,
    ]),
  );

  const belgiumTeam = (teams ?? []).find(
    (t: Team) => normalizeTeamKey(t.name) === "belgium",
  );
  const belgiumAssignment = belgiumTeam
    ? (assignments ?? []).find(
        (a: Assignment) => a.team_id === belgiumTeam.id,
      )
    : undefined;
  const belgiumStatusRaw = statusMap.get("belgium");

  const rows: TrackerRow[] = (assignments ?? []).map((a: Assignment) => {
    const team = teamMap.get(a.team_id) ?? null;
    const lookupKey = normalizeTeamKey(team?.name ?? "");
    const found = statusMap.get(lookupKey);

    return {
      participant: participantMap.get(a.participant_id) ?? null,
      team,
      team_status: (() => {
        if (found) {
          return {
            team_name: found.team_name,
            status: normalizeStatusValue(found.status),
            stage: found.stage,
            next_stage_probability: found.next_stage_probability ?? null,
          };
        }
        return {
          team_name: team?.name ?? "",
          status: "active",
          stage: "Group Stage",
          next_stage_probability: null,
        };
      })(),
    };
  });

  const winner = rows.find((r) => r.team_status.status === "winner");
  const alive = rows.filter(
    (r) =>
      r.team_status.status !== "eliminated" &&
      r.team_status.status !== "winner",
  );
  const eliminated = rows.filter(
    (r) => r.team_status.status === "eliminated",
  );

  const rowSummary = rows.map((r) => ({
    team: r.team?.name ?? null,
    participant: r.participant?.name ?? null,
    status: r.team_status?.status ?? null,
    stage: r.team_status?.stage ?? null,
  }));

  const belgiumRow = rows.find(
    (r) => normalizeTeamKey(r.team?.name ?? "") === "belgium",
  );

  console.log("[Tracker debug] eliminated.length:", eliminated.length);
  console.log("[Tracker debug] all rows:", rowSummary);
  console.log("[Tracker debug] Belgium join check:", {
    belgiumInTeams: Boolean(belgiumTeam),
    belgiumTeamId: belgiumTeam?.id ?? null,
    belgiumInAssignments: Boolean(belgiumAssignment),
    belgiumAssignmentParticipantId: belgiumAssignment?.participant_id ?? null,
    belgiumInTeamStatusMap: Boolean(belgiumStatusRaw),
    belgiumStatusRaw: belgiumStatusRaw ?? null,
    belgiumRow: belgiumRow
      ? {
          team: belgiumRow.team?.name,
          participant: belgiumRow.participant?.name,
          status: belgiumRow.team_status.status,
          stage: belgiumRow.team_status.stage,
        }
      : null,
    whyActiveIfNotEliminated:
      belgiumRow?.team_status.status === "active"
        ? !belgiumStatusRaw
          ? "team_status row not returned to anon client (likely RLS) — defaulted to active"
          : "status join succeeded but value is not eliminated"
        : null,
  });
  console.log("[Tracker debug] statusMap.keys():", [...statusMap.keys()]);
  console.log(
    "[Tracker debug] teamMap values:",
    [...teamMap.values()].map((t) => ({ id: t.id, name: t.name })),
  );
  console.log("[Tracker debug] query errors:", {
    participantsError: participantsError?.message ?? null,
    teamsError: teamsError?.message ?? null,
    statusesError: statusesError?.message ?? null,
    statusesRowCount: statuses?.length ?? 0,
  });

  const stats = computeTournamentStats(rows);
  const leaderboard = buildLeaderboard(rows);

  const { data: wheelResults, error: wheelResultsError } = await supabase
    .from("loser_wheel_results")
    .select("id, participant_id, team_id, prize, spun_at")
    .order("spun_at", { ascending: false });

  if (wheelResultsError) {
    console.warn(
      "[LoserWheel debug] loser_wheel_results query failed:",
      wheelResultsError.message,
    );
  }

  const wheelResultsSafe = wheelResults ?? [];

  logWheelVisibilityDebug(
    "server tracker/page.tsx",
    buildWheelVisibilityDebug(eliminated, rows, wheelResultsSafe),
  );

  return (
    <TrackerExperience
      rows={rows}
      winner={winner}
      alive={alive}
      eliminated={eliminated}
      stats={stats}
      leaderboard={leaderboard}
      wheelResults={wheelResultsSafe}
      lastStatusSync={lastStatusSync}
      syncInfo={syncInfo}
      debugEliminatedCount={eliminated.length}
      debugStatusesRowCount={statuses?.length ?? 0}
    />
  );
}
