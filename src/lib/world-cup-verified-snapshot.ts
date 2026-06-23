/**
 * Manually verified World Cup 2026 group status for family sweep teams.
 * Source: FIFA standings via Wikipedia group pages (updated through 23 Jun 2026).
 * Only teams with FIFA "(A) Advance to a further round" are marked qualified.
 */

export type VerifiedTeamStatus = {
  teamName: string;
  status: "active" | "eliminated";
  stage: string;
  nextStageProbability: number | null;
  reason: string;
  nextFixture: string | null;
};

export const VERIFIED_SNAPSHOT_SOURCE =
  "Wikipedia 2026 FIFA World Cup group pages (FIFA standings, through 23 Jun 2026)";

export const VERIFIED_SNAPSHOT_AS_OF = "2026-06-23T23:59:00Z";

export const VERIFIED_FAMILY_TEAM_STATUSES: VerifiedTeamStatus[] = [
  {
    teamName: "Mexico",
    status: "active",
    stage: "Round of 32",
    nextStageProbability: 100,
    reason:
      "FIFA (A) — Group A winners after 2 wins (incl. 1–0 vs South Korea, 18 Jun). First team confirmed for Round of 32.",
    nextFixture: "Round of 32 (opponent TBD — 3rd place from Groups C/E/F/H/I)",
  },
  {
    teamName: "United States",
    status: "active",
    stage: "Round of 32",
    nextStageProbability: 100,
    reason:
      "FIFA (A) — Group D winners, 6 pts from 2 wins (4–1 Paraguay, 2–0 Australia). Confirmed after Turkey eliminated 19 Jun.",
    nextFixture: "Round of 32 (opponent TBD — 3rd place from Groups B/E/F/I/J)",
  },
  {
    teamName: "Germany",
    status: "active",
    stage: "Round of 32",
    nextStageProbability: 100,
    reason:
      "FIFA (A) — Group E leaders, 6 pts from 2 wins (7–1 Curaçao, 2–1 Ivory Coast).",
    nextFixture: "Round of 32 (opponent TBD — 3rd place from Groups A/B/C/D/F)",
  },
  {
    teamName: "Brazil",
    status: "active",
    stage: "Group Stage",
    nextStageProbability: null,
    reason:
      "Group C leaders, 4 pts (1W 1D). Not FIFA (A) — final match vs Scotland on 24 Jun.",
    nextFixture: "24 Jun — Scotland vs Brazil (Hard Rock Stadium, Miami)",
  },
  {
    teamName: "France",
    status: "active",
    stage: "Round of 32",
    nextStageProbability: 100,
    reason:
      "FIFA (A) — Group I winners, 6 pts from 2 wins (3–1 Senegal, 3–0 Iraq).",
    nextFixture: "Round of 32 (opponent TBD — 3rd place from Groups C/D/F/G/H)",
  },
  {
    teamName: "Norway",
    status: "active",
    stage: "Round of 32",
    nextStageProbability: 100,
    reason:
      "FIFA (A) — Group I runners-up, 6 pts from 2 wins (4–1 Iraq, 3–2 Senegal).",
    nextFixture: "Round of 32 vs Group E runner-up",
  },
  {
    teamName: "Argentina",
    status: "active",
    stage: "Round of 32",
    nextStageProbability: 100,
    reason:
      "FIFA (A) — Group J winners, 6 pts from 2 wins (3–0 Algeria, 2–0 Austria).",
    nextFixture: "Round of 32 vs Group H runner-up",
  },
  {
    teamName: "Switzerland",
    status: "active",
    stage: "Group Stage",
    nextStageProbability: null,
    reason:
      "Group B 2nd, 4 pts (1W 1D). Not FIFA (A) — final match vs Canada on 24 Jun decides top two.",
    nextFixture: "24 Jun — Switzerland vs Canada (BC Place, Vancouver)",
  },
  {
    teamName: "Morocco",
    status: "active",
    stage: "Group Stage",
    nextStageProbability: null,
    reason:
      "Group C 2nd, 4 pts (1W 1D). Not FIFA (A) — one group match left; Brazil already through as group winners.",
    nextFixture: "24 Jun — Morocco vs Haiti (Mercedes-Benz Stadium, Atlanta)",
  },
  {
    teamName: "Belgium",
    status: "active",
    stage: "Group Stage",
    nextStageProbability: null,
    reason:
      "Group G 3rd, 2 pts (0W 2D). Not eliminated — final match vs New Zealand on 26 Jun.",
    nextFixture: "26 Jun — New Zealand vs Belgium (BC Place, Vancouver)",
  },
  {
    teamName: "Spain",
    status: "active",
    stage: "Group Stage",
    nextStageProbability: null,
    reason:
      "Group H leaders, 4 pts (1W 1D). Not FIFA (A) — must beat or draw Uruguay on 26 Jun to confirm.",
    nextFixture: "26 Jun — Uruguay vs Spain (Estadio Akron, Zapopan)",
  },
  {
    teamName: "Portugal",
    status: "active",
    stage: "Group Stage",
    nextStageProbability: null,
    reason:
      "Group K leaders, 4 pts (1W 1D). Not FIFA (A) — Colombia match on 27 Jun still to play.",
    nextFixture: "27 Jun — Colombia vs Portugal (Hard Rock Stadium, Miami)",
  },
  {
    teamName: "Colombia",
    status: "active",
    stage: "Group Stage",
    nextStageProbability: null,
    reason:
      "Group K 2nd, 3 pts from 1 win (3–1 Uzbekistan). DR Congo match on 23 Jun, then Portugal on 27 Jun.",
    nextFixture: "23 Jun — Colombia vs DR Congo (Estadio Akron, Zapopan)",
  },
  {
    teamName: "England",
    status: "active",
    stage: "Group Stage",
    nextStageProbability: null,
    reason:
      "Group L leaders, 4 pts (1W 1D). Not FIFA (A) — tied with Ghana; Panama away on 27 Jun.",
    nextFixture: "27 Jun — Panama vs England (MetLife Stadium, East Rutherford)",
  },
  {
    teamName: "Netherlands",
    status: "active",
    stage: "Group Stage",
    nextStageProbability: null,
    reason:
      "Group F — group stage in progress; no FIFA (A) confirmation for sweep team yet.",
    nextFixture: "Group F matchday 3 (see FIFA schedule)",
  },
];
