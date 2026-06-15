import { NextResponse } from "next/server";
import { getProviderStatus } from "@/lib/world-cup-provider";
import { runWorldCupStatusUpdate } from "@/lib/world-cup-update";

/**
 * World Cup status sync endpoint.
 *
 * Vercel Cron calls GET daily at 01:00 UTC (02:00 UK BST during summer).
 * Manual trigger: POST or GET with Authorization: Bearer <CRON_SECRET>
 *
 * @see docs/world-cup-auto-update.md
 */
async function handleUpdate(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET is not configured" },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runWorldCupStatusUpdate();
    return NextResponse.json(result, { status: result.ok ? 200 : 502 });
  } catch (error) {
    console.error("[update-world-cup-status]", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Update failed",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    const status = getProviderStatus();
    return NextResponse.json({
      endpoint: "/api/update-world-cup-status",
      methods: ["GET", "POST"],
      schedule: "Daily at 01:00 UTC (02:00 UK time during BST)",
      provider: status.providerId,
      wired: status.wired,
      hasApiKey: status.hasApiKey,
      documentation: "docs/world-cup-auto-update.md",
    });
  }

  return handleUpdate(request);
}

export async function POST(request: Request) {
  return handleUpdate(request);
}
