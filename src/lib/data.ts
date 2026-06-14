import { createPublicClient } from "@/lib/supabase";
import type {
  ParticipantWithAssignment,
  SweepStatus,
  Team,
} from "@/lib/types";

export async function getParticipantByToken(token: string) {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("participants")
    .select(
      `
      id,
      name,
      invite_token,
      created_at,
      assignments (
        id,
        participant_id,
        team_id,
        drawn_at,
        teams (
          id,
          name,
          flag_emoji,
          created_at
        )
      )
    `
    )
    .eq("invite_token", token)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const assignmentRow = Array.isArray(data.assignments)
    ? data.assignments[0]
    : data.assignments;

  return {
    id: data.id,
    name: data.name,
    invite_token: data.invite_token,
    created_at: data.created_at,
    assignment: assignmentRow
      ? {
          id: assignmentRow.id,
          participant_id: assignmentRow.participant_id,
          team_id: assignmentRow.team_id,
          drawn_at: assignmentRow.drawn_at,
          team: (Array.isArray(assignmentRow.teams)
            ? assignmentRow.teams[0]
            : assignmentRow.teams) as Team,
        }
      : null,
  } as ParticipantWithAssignment;
}

export async function getSweepStatus(): Promise<SweepStatus> {
  const supabase = createPublicClient();

  const { data: participants, error } = await supabase
    .from("participants")
    .select(
      `
      id,
      name,
      invite_token,
      created_at,
      assignments (
        id,
        participant_id,
        team_id,
        drawn_at,
        teams (
          id,
          name,
          flag_emoji,
          created_at
        )
      )
    `
    )
    .order("name");

  if (error) throw error;

  const { data: teams, error: teamsError } = await supabase
    .from("teams")
    .select("*")
    .order("name");

  if (teamsError) throw teamsError;

  const participantsWithAssignments: ParticipantWithAssignment[] = (
    participants ?? []
  ).map((p) => {
    const assignmentRow = Array.isArray(p.assignments)
      ? p.assignments[0]
      : p.assignments;

    return {
      id: p.id,
      name: p.name,
      invite_token: p.invite_token,
      created_at: p.created_at,
      assignment: assignmentRow
        ? {
            id: assignmentRow.id,
            participant_id: assignmentRow.participant_id,
            team_id: assignmentRow.team_id,
            drawn_at: assignmentRow.drawn_at,
            team: (Array.isArray(assignmentRow.teams)
              ? assignmentRow.teams[0]
              : assignmentRow.teams) as Team,
          }
        : null,
    };
  });

  const assignedTeamIds = new Set(
    participantsWithAssignments
      .filter((p) => p.assignment)
      .map((p) => p.assignment!.team_id)
  );

  const remainingTeams = (teams ?? []).filter(
    (team) => !assignedTeamIds.has(team.id)
  ) as Team[];

  const completed = participantsWithAssignments.filter(
    (p) => p.assignment !== null
  ).length;

  return {
    participants: participantsWithAssignments,
    total: participantsWithAssignments.length,
    completed,
    remainingTeams,
  };
}

export async function getRemainingTeams(): Promise<Team[]> {
  const status = await getSweepStatus();
  return status.remainingTeams;
}

export async function drawTeam(token: string) {
  const { createServiceClient } = await import("@/lib/supabase");
  const supabase = createServiceClient();

  const { data, error } = await supabase.rpc("draw_team", {
    p_invite_token: token,
  });

  if (error) throw error;

  const row = Array.isArray(data) ? data[0] : data;

  if (!row) {
    throw new Error("Draw failed");
  }

  return {
    participantName: row.participant_name as string,
    teamName: row.team_name as string,
    teamFlag: row.team_flag as string,
    alreadyDrawn: row.already_drawn as boolean,
  };
}
