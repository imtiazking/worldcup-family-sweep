export type Participant = {
  id: string;
  name: string;
  invite_token: string;
  created_at: string;
};

export type Team = {
  id: string;
  name: string;
  flag_emoji: string;
  created_at: string;
};

export type Assignment = {
  id: string;
  participant_id: string;
  team_id: string;
  drawn_at: string;
};

export type ParticipantWithAssignment = Participant & {
  assignment: (Assignment & { team: Team }) | null;
};

export type DrawResult = {
  participantName: string;
  teamName: string;
  teamFlag: string;
  alreadyDrawn: boolean;
};

export type SweepStatus = {
  participants: ParticipantWithAssignment[];
  total: number;
  completed: number;
  remainingTeams: Team[];
};
