export const dynamic = "force-dynamic";

import { createPublicClient } from "@/lib/supabase";
import { TrackerExperience } from "@/components/tracker/TrackerExperience";
import {
  buildLeaderboard,
  computeTournamentStats,
  type TrackerRow,
} from "@/lib/tracker";

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

export default async function TrackerPage() {
  const supabase = createPublicClient();

  const { data: assignments, error } = await supabase
    .from("assignments")
    .select("participant_id, team_id");

  const { data: participants } = await supabase
    .from("participants")
    .select("id, name");

  const { data: teams } = await supabase
    .from("teams")
    .select("id, name, flag_emoji");

  const { data: statuses } = await supabase
    .from("team_status")
    .select("team_name, status, stage, next_stage_probability");

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-4xl text-wc-gold">Tracker unavailable</h1>
        <p className="mt-3 text-white/50">Could not load sweep data.</p>
      </div>
    );
  }

  const participantMap = new Map(
    (participants ?? []).map((p: Participant) => [p.id, p])
  );

  const teamMap = new Map(
    (teams ?? []).map((t: Team) => [t.id, t])
  );

  const statusMap = new Map(
    (statuses ?? []).map((s: TeamStatus) => [s.team_name, s])
  );

  const rows: TrackerRow[] = (assignments ?? []).map((a: Assignment) => {
    const team = teamMap.get(a.team_id) ?? null;

    return {
      participant: participantMap.get(a.participant_id) ?? null,
      team,
      team_status: (() => {
        const found = statusMap.get(team?.name ?? "");
        if (found) {
          return {
            team_name: found.team_name,
            status: found.status,
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
      r.team_status.status !== "winner"
  );
  const eliminated = rows.filter(
    (r) => r.team_status.status === "eliminated"
  );

  const stats = computeTournamentStats(rows);
  const leaderboard = buildLeaderboard(rows);

  const { data: wheelResults } = await supabase
    .from("loser_wheel_results")
    .select("id, participant_id, team_id, prize, spun_at")
    .order("spun_at", { ascending: false });

  return (
    <TrackerExperience
      rows={rows}
      winner={winner}
      alive={alive}
      eliminated={eliminated}
      stats={stats}
      leaderboard={leaderboard}
      wheelResults={wheelResults ?? []}
    />
  );
}
