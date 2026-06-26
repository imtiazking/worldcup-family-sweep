import { NextResponse } from "next/server";
import { runLiveFirstTeamStatusSync } from "@/lib/sync-live-team-status";
import {
  SYNC_SOURCE_API_ERROR,
  SYNC_SOURCE_FALLBACK,
  SYNC_SOURCE_LIVE,
  formatSyncSourceLabel,
} from "@/lib/sync-sources";

function isAuthorized(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;

  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${cronSecret}`) return true;

  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  return key === cronSecret;
}

async function handleSync() {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      {
        ok: false,
        error: "CRON_SECRET is not configured",
      },
      { status: 500 },
    );
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      {
        ok: false,
        error: "SUPABASE_SERVICE_ROLE_KEY is not configured",
      },
      { status: 500 },
    );
  }

  try {
    const result = await runLiveFirstTeamStatusSync();
    return NextResponse.json(result, { status: result.ok ? 200 : 502 });
  } catch (error) {
    console.error("[sync-team-status]", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Sync failed",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({
      endpoint: "/api/sync-team-status",
      methods: ["GET", "POST"],
      schedule: "Daily at 06:00 UTC (Hobby plan — once per day max)",
      auth: "Authorization: Bearer <CRON_SECRET> or ?key=<CRON_SECRET>",
      mode: "API-Football live-first with verified snapshot fallback",
      sources: {
        live: formatSyncSourceLabel(SYNC_SOURCE_LIVE),
        fallback: formatSyncSourceLabel(SYNC_SOURCE_FALLBACK),
        apiError: formatSyncSourceLabel(SYNC_SOURCE_API_ERROR),
      },
      requiredEnv: ["CRON_SECRET", "SUPABASE_SERVICE_ROLE_KEY", "API_FOOTBALL_KEY"],
      npmScript: "npm run sync:team-status",
      probeScript: "npm run probe:api-football",
    });
  }

  return handleSync();
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  return handleSync();
}
