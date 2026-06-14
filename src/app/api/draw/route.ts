import { NextResponse } from "next/server";
import { drawTeam } from "@/lib/data";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = body?.token;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    const result = await drawTeam(token);

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Draw failed";

    if (message.includes("Invalid invite token")) {
      return NextResponse.json({ error: "Invalid invite link" }, { status: 404 });
    }

    if (message.includes("No teams remaining")) {
      return NextResponse.json(
        { error: "All teams have been drawn" },
        { status: 409 }
      );
    }

    console.error("Draw error:", error);
    return NextResponse.json({ error: "Draw failed" }, { status: 500 });
  }
}
