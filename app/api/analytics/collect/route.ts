import { NextResponse } from "next/server";
import { recordHit } from "@/lib/analytics/store";

export const dynamic = "force-dynamic";

const VISITOR = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const raw = await request.text().catch(() => "");
  let body: { type?: string; path?: string; visitorId?: string; label?: string } | null = null;
  try {
    body = JSON.parse(raw) as { type?: string; path?: string; visitorId?: string; label?: string };
  } catch {
    body = null;
  }

  if (!body || (body.type !== "view" && body.type !== "click")) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const pagePath = body.path || "";
  if (
    !pagePath.startsWith("/") ||
    pagePath.length > 180 ||
    pagePath.startsWith("/admin") ||
    pagePath.startsWith("/api")
  ) {
    return NextResponse.json({ ok: true });
  }
  if (!body.visitorId || !VISITOR.test(body.visitorId)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    await recordHit({
      type: body.type,
      path: pagePath,
      visitorId: body.visitorId,
      label: body.type === "click" ? body.label : undefined,
    });
  } catch (err) {
    console.error("[analytics]", err);
  }
  return NextResponse.json({ ok: true });
}
