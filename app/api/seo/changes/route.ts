import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, cookieIsAdmin, cronAuthorized } from "@/lib/seo-system/auth";
import { decideChange } from "@/lib/seo-system/engine";
import { loadStore, saveStore } from "@/lib/seo-system/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const cookie = cookies().get(ADMIN_COOKIE)?.value;
  if (!cookieIsAdmin(cookie) && !cronAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as {
    id?: string;
    action?: "approve" | "reject" | "rollback";
  } | null;
  if (!body?.id || !body.action) {
    return NextResponse.json({ error: "id and action are required." }, { status: 400 });
  }
  const store = await loadStore();
  const result = decideChange(store, body.id, body.action, new Date().toISOString());
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  const persistence = await saveStore(result.store);
  return NextResponse.json({ ok: true, persistence });
}
