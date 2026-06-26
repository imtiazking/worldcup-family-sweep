/**
 * Manually verified World Cup 2026 group status for family sweep teams.
 * Source: FIFA standings via Wikipedia group pages (updated through 25 Jun 2026).
 * Only teams with FIFA "(A) Advance to a further round" or completed group
 * top-two placement are marked qualified.
 */

export type VerifiedTeamStatus = {
  teamName: string;
  status: "active" | "eliminated";
  stage: string;
  nextStageProbability: number | null;
  reason: string;
  nextFixture: string | null;
  /** Set only when the Round of 32 opponent is officially locked */
  r32OpponentLocked?: string | null;
};

export const VERIFIED_SNAPSHOT_SOURCE =
  "Wikipedia 2026 FIFA World Cup group pages (FIFA standings, through 26 Jun 2026)";

export const VERIFIED_SNAPSHOT_AS_OF = "2026-06-26T23:59:00Z";

export const VERIFIED_FAMILY_TEAM_STATUSES: VerifiedTeamStatus[] = [
  {
    teamName: "Mexico",
    status: "active",
    stage: "Round of 32",
    nextStageProbability: 100,
    reason:
      "FIFA (A) — Group A winners (9 pts, +6 GD). Group complete.",
    nextFixture: "Round of 32 vs 3rd place from Groups C/E/F/H/I (30 Jun, Mexico City)",
  },
  {
    teamName: "United States",
    status: "active",
    stage: "Round of 32",
    nextStageProbability: 100,
    reason:
      "FIFA (A) — Group D winners (6 pts from 2 wins). Confirmed after Turkey eliminated 19 Jun.",
    nextFixture: "Round of 32 vs 3rd place from Groups B/E/F/I/J (1 Jul, Santa Clara)",
  },
  {
    teamName: "Germany",
    status: "active",
    stage: "Round of 32",
    nextStageProbability: 100,
    reason:
      "FIFA (A) — Group E winners (6 pts, +7 GD from 2 wins).",
    nextFixture: "Round of 32 vs 3rd place from Groups A/B/C/D/F (29 Jun, Boston)",
  },
  {
    teamName: "Brazil",
    status: "active",
    stage: "Round of 32",
    nextStageProbability: 100,
    reason:
      "FIFA (A) — Group C winners after 3–0 vs Scotland (24 Jun). Final table: 7 pts, +6 GD.",
    nextFixture: "Round of 32 vs Group F runner-up (29 Jun, Houston)",
  },
  {
    teamName: "France",
    status: "active",
    stage: "Round of 32",
    nextStageProbability: 100,
    reason:
      "FIFA (A) — Group I winners (6 pts from 2 wins). Advanced with Norway.",
    nextFixture: "Round of 32 vs 3rd place from Groups C/D/F/G/H (30 Jun, New York)",
  },
  {
    teamName: "Norway",
    status: "active",
    stage: "Round of 32",
    nextStageProbability: 100,
    reason:
      "FIFA (A) — Group I runners-up (6 pts from 2 wins). Advanced with France.",
    nextFixture: "Round of 32 vs Group E runner-up (30 Jun, Dallas)",
  },
  {
    teamName: "Argentina",
    status: "active",
    stage: "Round of 32",
    nextStageProbability: 100,
    reason:
      "FIFA (A) — Group J winners (6 pts from 2 wins).",
    nextFixture: "Round of 32 vs Group H runner-up (3 Jul, Miami)",
  },
  {
    teamName: "Switzerland",
    status: "active",
    stage: "Round of 32",
    nextStageProbability: 100,
    reason:
      "FIFA (A) — Group B winners after 2–1 vs Canada (24 Jun). Group complete: 7 pts, +4 GD.",
    nextFixture: "Round of 32 vs 3rd place from Groups E/F/G/I/J (2 Jul, Vancouver)",
  },
  {
    teamName: "Morocco",
    status: "active",
    stage: "Round of 32",
    nextStageProbability: 100,
    reason:
      "FIFA (A) — Group C runners-up after 4–2 vs Haiti (24 Jun). Group complete: 7 pts, +3 GD.",
    nextFixture: "Round of 32 vs Netherlands (29 Jun, Monterrey)",
    r32OpponentLocked: "Netherlands",
  },
  {
    teamName: "Colombia",
    status: "active",
    stage: "Round of 32",
    nextStageProbability: 100,
    reason:
      "FIFA (A) — Group K leaders (6 pts from 2 wins). Mathematically through before final matchday.",
    nextFixture:
      "Round of 32 opponent TBC (group match vs Portugal 27 Jun still to play)",
  },
  {
    teamName: "Belgium",
    status: "active",
    stage: "Group Stage",
    nextStageProbability: null,
    reason:
      "Group G 3rd, 2 pts (0W 2D). Not eliminated — final match vs New Zealand on 26 Jun; Egypt vs Iran same day decides top two.",
    nextFixture: "26 Jun — New Zealand vs Belgium (BC Place, Vancouver)",
  },
  {
    teamName: "Spain",
    status: "active",
    stage: "Group Stage",
    nextStageProbability: null,
    reason:
      "Group H leaders, 4 pts (1W 1D, +4 GD). Not FIFA (A) — final match vs Uruguay on 26 Jun decides top two.",
    nextFixture: "26 Jun — Uruguay vs Spain (Estadio Akron, Zapopan)",
  },
  {
    teamName: "Portugal",
    status: "active",
    stage: "Group Stage",
    nextStageProbability: null,
    reason:
      "Group K 2nd, 4 pts (+5 GD). Not FIFA (A) individually — final vs Colombia on 27 Jun; DR Congo can still reach 4 pts.",
    nextFixture: "27 Jun — Colombia vs Portugal (Hard Rock Stadium, Miami)",
  },
  {
    teamName: "England",
    status: "active",
    stage: "Group Stage",
    nextStageProbability: null,
    reason:
      "Group L leaders, 4 pts (+2 GD), level with Ghana. Not FIFA (A) — Panama away on 27 Jun; Croatia vs Ghana same day.",
    nextFixture: "27 Jun — Panama vs England (MetLife Stadium, East Rutherford)",
  },
  {
    teamName: "Netherlands",
    status: "active",
    stage: "Round of 32",
    nextStageProbability: 100,
    reason:
      "FIFA (A) — Group F winners after final matchday. Group complete.",
    nextFixture: "Round of 32 vs Morocco (29 Jun, Monterrey)",
    r32OpponentLocked: "Morocco",
  },
];
