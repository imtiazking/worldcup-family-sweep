/**
 * Probe API-Football World Cup 2026 endpoints.
 *
 * Usage:
 *   API_FOOTBALL_KEY=... npx tsx scripts/probe-api-football.ts
 *
 * Or add API_FOOTBALL_KEY to .env.local and run:
 *   npx tsx scripts/probe-api-football.ts
 */

import {
  fetchAllFixtures,
  fetchCompletedFixtures,
  fetchFixtureRounds,
  fetchLeagueTeams,
  fetchStandings,
  WORLD_CUP_LEAGUE_ID,
  WORLD_CUP_SEASON,
} from "../src/lib/world-cup-provider/api-football-client";
import { SWEEP_TEAM_NAMES, normalizeApiTeamName } from "../src/lib/world-cup-provider/team-name-map";

async function main() {
  console.log(
    `API-Football probe — league=${WORLD_CUP_LEAGUE_ID} season=${WORLD_CUP_SEASON}\n`
  );

  const [rounds, teams, standings, allFixtures, completedFixtures] =
    await Promise.all([
      fetchFixtureRounds(),
      fetchLeagueTeams(),
      fetchStandings(),
      fetchAllFixtures(),
      fetchCompletedFixtures(),
    ]);

  console.log(`fixtures/rounds: ${rounds.length} rounds`);
  console.log(rounds.slice(0, 12).map((r) => `  - ${r}`).join("\n"));
  if (rounds.length > 12) console.log(`  ... +${rounds.length - 12} more`);

  const apiNames = teams.map((t) => t.team.name);
  console.log(`\nteams: ${apiNames.length} in tournament`);
  const matched = SWEEP_TEAM_NAMES.filter((name) =>
    apiNames.some((api) => normalizeApiTeamName(api) === name)
  );
  const unmatched = SWEEP_TEAM_NAMES.filter((name) => !matched.includes(name));
  console.log(`  sweep teams matched: ${matched.length}/${SWEEP_TEAM_NAMES.length}`);
  if (unmatched.length) {
    console.log(`  missing from API list: ${unmatched.join(", ")}`);
  }

  console.log(`\nstandings: ${standings.length} groups`);
  for (const group of standings.slice(0, 3)) {
    const label = group[0]?.group ?? "?";
    console.log(`  Group ${label}: ${group.length} teams`);
  }

  const statusCounts: Record<string, number> = {};
  for (const f of allFixtures) {
    const s = f.fixture.status.short;
    statusCounts[s] = (statusCounts[s] ?? 0) + 1;
  }
  console.log(`\nfixtures (all): ${allFixtures.length}`);
  console.log(`  statuses: ${JSON.stringify(statusCounts)}`);
  console.log(`fixtures (FT only): ${completedFixtures.length}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
