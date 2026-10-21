import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, cookieIsAdmin } from "@/lib/seo-system/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  if (!cookieIsAdmin(cookies().get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: "Enter the PIN first." }, { status: 401 });
  }
  const hook = process.env.VERCEL_DEPLOY_HOOK?.trim();
  if (!hook) {
    return NextResponse.json(
      {
        error:
          "The live site updates when this project is pushed to GitHub. Set VERCEL_DEPLOY_HOOK to redeploy from this button.",
      },
      { status: 503 }
    );
  }
  const res = await fetch(hook, { method: "POST" });
  if (!res.ok) {
    return NextResponse.json({ error: `Vercel did not start a deploy (${res.status}).` }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
