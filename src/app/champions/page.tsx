import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProductionChampionsCeremony } from "@/components/champions/ProductionChampionsCeremony";
import { buildCeremonyDataFromRows } from "@/lib/champions-ceremony";
import { createPublicClient } from "@/lib/supabase";
import type { TrackerRow } from "@/lib/tracker";

export const metadata: Metadata = {
  title: "Champions — World Cup Family Sweep 2026",
  description:
    "Celebrate the 2026 Family World Cup Sweep champion and finalists.",
};

export const dynamic = "force-dynamic";

export default async function ChampionsPage() {
  const supabase = createPublicClient();

  const { data: assignments } = await supabase
    .from("assignments")
    .select("participant_id, team_id");

  const { data: participants } = await supabase
    .from("participants")
    .select("id, name");

  const { data: teams } = await supabase.from("teams").select("id, name, flag_emoji");

  const { data: statuses } = await supabase
    .from("team_status")
    .select("team_name, status, stage, next_stage_probability");

  const participantMap = new Map(
    (participants ?? []).map((p) => [p.id, p]),
  );
  const teamMap = new Map((teams ?? []).map((t) => [t.id, t]));
  const statusMap = new Map(
    (statuses ?? []).map((s) => [s.team_name.trim().toLowerCase(), s]),
  );

  const rows: TrackerRow[] = (assignments ?? []).map((assignment) => {
    const team = teamMap.get(assignment.team_id) ?? null;
    const lookupKey = team?.name?.trim().toLowerCase() ?? "";
    const found = statusMap.get(lookupKey);

    return {
      participant: participantMap.get(assignment.participant_id) ?? null,
      team,
      team_status: found
        ? {
            team_name: found.team_name,
            status: found.status.trim().toLowerCase(),
            stage: found.stage,
            next_stage_probability: found.next_stage_probability ?? null,
          }
        : {
            team_name: team?.name ?? "",
            status: "active",
            stage: "Group Stage",
            next_stage_probability: null,
          },
    };
  });

  const ceremonyData = buildCeremonyDataFromRows(rows);
  if (!ceremonyData) {
    redirect("/tracker");
  }

  return <ProductionChampionsCeremony data={ceremonyData} />;
}
