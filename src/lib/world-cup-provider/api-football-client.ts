/**
 * API-Football HTTP client.
 *
 * API key: set API_FOOTBALL_KEY in .env.local / Vercel environment variables.
 * Get a free key at https://www.api-football.com/
 *
 * Header required: x-apisports-key
 */

const API_FOOTBALL_BASE = "https://v3.football.api-sports.io";

export class ApiFootballError extends Error {
  constructor(
    message: string,
    readonly statusCode?: number,
    readonly endpoint?: string,
  ) {
    super(message);
    this.name = "ApiFootballError";
  }
}

export class ApiFootballRateLimitError extends ApiFootballError {
  constructor(endpoint: string) {
    super(`API-Football rate limit exceeded: ${endpoint}`, 429, endpoint);
    this.name = "ApiFootballRateLimitError";
  }
}

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

export type ApiLeagueTeam = {
  team: {
    id: number;
    name: string;
    code: string | null;
    country: string;
    logo: string;
  };
  venue: {
    id: number;
    name: string;
    city: string;
  };
};

const WORLD_CUP_PARAMS = {
  league: WORLD_CUP_LEAGUE_ID,
  season: WORLD_CUP_SEASON,
} as const;

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

  if (response.status === 429) {
    throw new ApiFootballRateLimitError(endpoint);
  }

  if (!response.ok) {
    throw new ApiFootballError(
      `API-Football request failed (${response.status}): ${endpoint}`,
      response.status,
      endpoint,
    );
  }

  const data = (await response.json()) as ApiFootballResponse<T>;

  if (data.errors && Object.keys(data.errors).length > 0) {
    const message =
      typeof data.errors === "object" && !Array.isArray(data.errors)
        ? JSON.stringify(data.errors)
        : String(data.errors);
    const lower = message.toLowerCase();
    if (lower.includes("rate limit") || lower.includes("too many")) {
      throw new ApiFootballRateLimitError(endpoint);
    }
    throw new ApiFootballError(`API-Football error: ${message}`, undefined, endpoint);
  }

  return data;
}

/** GET /fixtures?league=1&season=2026 */
export async function fetchAllFixtures(): Promise<ApiFixture[]> {
  const data = await apiFootballFetch<ApiFixture[]>("fixtures", {
    ...WORLD_CUP_PARAMS,
  });

  return data.response ?? [];
}

/** Completed matches only — used by tournament sync logic. */
export async function fetchCompletedFixtures(): Promise<ApiFixture[]> {
  const data = await apiFootballFetch<ApiFixture[]>("fixtures", {
    ...WORLD_CUP_PARAMS,
    status: "FT",
  });

  return data.response ?? [];
}

/** GET /standings?league=1&season=2026 */
export async function fetchStandings(): Promise<ApiStandingsGroup[]> {
  const data = await apiFootballFetch<ApiStandingsGroup[]>("standings", {
    ...WORLD_CUP_PARAMS,
  });

  return data.response ?? [];
}

/** GET /fixtures/rounds?league=1&season=2026 */
export async function fetchFixtureRounds(): Promise<string[]> {
  const data = await apiFootballFetch<string[]>("fixtures/rounds", {
    ...WORLD_CUP_PARAMS,
  });

  return data.response ?? [];
}

/** GET /teams?league=1&season=2026 */
export async function fetchLeagueTeams(): Promise<ApiLeagueTeam[]> {
  const data = await apiFootballFetch<ApiLeagueTeam[]>("teams", {
    ...WORLD_CUP_PARAMS,
  });

  return data.response ?? [];
}
