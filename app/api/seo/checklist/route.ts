import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, cookieIsAdmin } from "@/lib/seo-system/auth";
import { checklistItem } from "@/lib/seo-system/checklist";
import { loadStore, saveStore } from "@/lib/seo-system/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!cookieIsAdmin(cookies().get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: "Enter the PIN first." }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as { id?: string; done?: boolean } | null;
  if (!body?.id || typeof body.done !== "boolean") {
    return NextResponse.json({ error: "id and done are required." }, { status: 400 });
  }
  const item = checklistItem(body.id);
  if (!item || item.owner !== "you") {
    return NextResponse.json({ error: "That item is handled by the scan." }, { status: 400 });
  }
  const store = await loadStore();
  store.checklist = store.checklist || {};
  if (body.done) store.checklist[body.id] = new Date().toISOString();
  else delete store.checklist[body.id];
  const persistence = await saveStore(store);
  return NextResponse.json({ ok: true, persistence, checklist: store.checklist });
}
