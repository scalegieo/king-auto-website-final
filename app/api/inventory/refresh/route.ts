import { NextResponse } from "next/server";
import { fetchInventory } from "@/lib/inventory/fetch";

/**
 * Optional cron hook: pull latest Dealr CSV and confirm parse count.
 * Protect with INVENTORY_SYNC_SECRET in production.
 */
export async function GET(request: Request) {
  const secret = process.env.INVENTORY_SYNC_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const vehicles = await fetchInventory();

  return NextResponse.json({
    ok: true,
    count: vehicles.length,
    timestamp: new Date().toISOString(),
  });
}
