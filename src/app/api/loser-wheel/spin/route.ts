import { NextResponse } from "next/server";
import { pickRandomPrizeId } from "@/lib/loser-wheel";
import { createPublicClient, createServiceClient } from "@/lib/supabase";

type SpinBody = {
  participantId?: string;
  teamId?: string;
};

export async function POST(request: Request) {
  let body: SpinBody;

  try {
    body = (await request.json()) as SpinBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { participantId, teamId } = body;

  if (!participantId || !teamId) {
    return NextResponse.json(
      { error: "participantId and teamId are required" },
      { status: 400 },
    );
  }

  const publicClient = createPublicClient();

  const { data: assignment, error: assignmentError } = await publicClient
    .from("assignments")
    .select("participant_id, team_id")
    .eq("participant_id", participantId)
    .eq("team_id", teamId)
    .maybeSingle();

  if (assignmentError || !assignment) {
    return NextResponse.json(
      { error: "Invalid participant or team" },
      { status: 400 },
    );
  }

  const { data: team } = await publicClient
    .from("teams")
    .select("name")
    .eq("id", teamId)
    .maybeSingle();

  if (!team?.name) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  const { data: status } = await publicClient
    .from("team_status")
    .select("status")
    .eq("team_name", team.name)
    .maybeSingle();

  if (status?.status !== "eliminated") {
    return NextResponse.json(
      { error: "Team is not eliminated yet" },
      { status: 409 },
    );
  }

  const serviceClient = createServiceClient();

  const { data: existing } = await serviceClient
    .from("loser_wheel_results")
    .select("id, prize, spun_at")
    .eq("participant_id", participantId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      {
        error: "Already spun",
        prize: existing.prize,
        spunAt: existing.spun_at,
      },
      { status: 409 },
    );
  }

  const prize = pickRandomPrizeId();

  const { data: inserted, error: insertError } = await serviceClient
    .from("loser_wheel_results")
    .insert({
      participant_id: participantId,
      team_id: teamId,
      prize,
    })
    .select("id, participant_id, team_id, prize, spun_at")
    .single();

  if (insertError) {
    return NextResponse.json(
      { error: "Could not save wheel result" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    result: inserted,
    prize,
  });
}
