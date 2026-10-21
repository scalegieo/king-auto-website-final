import { NextResponse } from "next/server";
import { cronAuthorized, requestIsAdmin } from "@/lib/seo-system/auth";
import { executeWeeklyRun } from "@/lib/seo-system/run";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  return run(request);
}

export async function POST(request: Request) {
  return run(request);
}

async function run(request: Request) {
  if (!cronAuthorized(request) && !requestIsAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await executeWeeklyRun();
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "SEO run failed.";
    const status = message.includes("already in progress") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
