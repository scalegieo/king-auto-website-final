import { NextResponse } from "next/server";
import { requestIsAdmin } from "@/lib/seo-system/auth";
import { answerAdminQuestion, wantsSeoScan } from "@/lib/seo-system/ask";
import { executeWeeklyRun } from "@/lib/seo-system/run";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  if (!requestIsAdmin(request)) {
    return NextResponse.json({ error: "Enter the PIN first." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    message?: string;
    history?: Array<{ role?: string; content?: string }>;
  } | null;
  const message = body?.message?.trim() || "";
  if (!message) {
    return NextResponse.json({ error: "Ask a question first." }, { status: 400 });
  }

  const history = (body?.history || [])
    .filter(
      (item): item is { role: "user" | "assistant"; content: string } =>
        (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string"
    )
    .slice(-8);

  let scanNote: string | undefined;
  if (wantsSeoScan(message)) {
    try {
      const run = await executeWeeklyRun();
      scanNote = `Scan ${run.status}. ${run.vehiclesScanned} vehicles, ${run.changesQueued} waiting for approval.`;
    } catch (err) {
      scanNote = err instanceof Error ? err.message : "The scan failed.";
    }
  }

  try {
    const result = await answerAdminQuestion({ message, history, scanNote });
    if (!result.ok) {
      return NextResponse.json({ error: result.error, scanNote }, { status: 502 });
    }
    return NextResponse.json({ answer: result.answer, scanNote });
  } catch (err) {
    const error = err instanceof Error ? err.message : "The assistant failed.";
    return NextResponse.json({ error }, { status: 502 });
  }
}
