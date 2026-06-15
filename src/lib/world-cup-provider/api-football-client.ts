/**
 * API-Football HTTP client.
 *
 * API key: set API_FOOTBALL_KEY in .env.local / Vercel environment variables.
 * Get a free key at https://www.api-football.com/
 *
 * Header required: x-apisports-key
 */

const API_FOOTBALL_BASE = "https://v3.football.api-sports.io";

export const WORLD_CUP_LEAGUE_ID = "1";
export const WORLD_CUP_SEASON = "2026";

export type ApiFootballResponse<T> = {
  get: string;
  parameters: Record<string, string>;
  errors: Record<string, string> | string[];
  results: number;
  paging: { current: number; total: number };
  response: T;
};

export type ApiFixture = {
  fixture: {
    id: number;
    date: string;
    status: { short: string; long: string };
  };
  league: {
    id: number;
    name: string;
    round: string;
    season: number;
  };
  teams: {
    home: { id: number; name: string; winner: boolean | null };
    away: { id: number; name: string; winner: boolean | null };
  };
  goals: { home: number | null; away: number | null };
};

export type ApiStandingRow = {
  rank: number;
  team: { id: number; name: string };
  points: number;
  goalsDiff: number;
  group: string;
  description: string | null;
  status: string;
  all: { played: number; win: number; draw: number; lose: number };
};

export type ApiStandingsGroup = ApiStandingRow[];

export async function apiFootballFetch<T>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<ApiFootballResponse<T>> {
  // API_FOOTBALL_KEY — add in Vercel → Settings → Environment Variables
  const apiKey = process.env.API_FOOTBALL_KEY;

  if (!apiKey) {
    throw new Error(
      "API_FOOTBALL_KEY is not set. Add your key from https://www.api-football.com/"
    );
  }

  const url = new URL(`${API_FOOTBALL_BASE}/${endpoint}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString(), {
    headers: {
      "x-apisports-key": apiKey,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `API-Football request failed (${response.status}): ${endpoint}`
    );
  }

  const data = (await response.json()) as ApiFootballResponse<T>;

  if (data.errors && Object.keys(data.errors).length > 0) {
    const message =
      typeof data.errors === "object" && !Array.isArray(data.errors)
        ? JSON.stringify(data.errors)
        : String(data.errors);
    throw new Error(`API-Football error: ${message}`);
  }

  return data;
}

export async function fetchCompletedFixtures(): Promise<ApiFixture[]> {
  const data = await apiFootballFetch<ApiFixture[]>("fixtures", {
    league: WORLD_CUP_LEAGUE_ID,
    season: WORLD_CUP_SEASON,
    status: "FT",
  });

  return data.response ?? [];
}

export async function fetchStandings(): Promise<ApiStandingsGroup[]> {
  const data = await apiFootballFetch<ApiStandingsGroup[]>("standings", {
    league: WORLD_CUP_LEAGUE_ID,
    season: WORLD_CUP_SEASON,
  });

  return data.response ?? [];
}
