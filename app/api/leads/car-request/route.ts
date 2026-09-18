import { NextResponse } from "next/server";
import {
  formatLeadErrorForClient,
  postKingAutoLeadFromServer,
} from "@/lib/king-auto-leads";

interface Body {
  full_name?: string;
  fullName?: string;
  name?: string;
  phone?: string;
  email?: string;
  vehicle_wanted?: string;
  vehicleWanted?: string;
  vehicleWant?: string;
  budget_range?: string;
  budget?: string;
  notes?: string;
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const full_name = (body.full_name ?? body.fullName ?? body.name)?.trim();
  const phone = body.phone?.trim();
  const email = body.email?.trim();
  const vehicle_wanted = (
    body.vehicle_wanted ??
    body.vehicleWanted ??
    body.vehicleWant
  )?.trim();
  const budget_range = (body.budget_range ?? body.budget ?? "").trim();
  const notes = (body.notes ?? "").trim();

  if (!full_name || !phone || !email || !vehicle_wanted) {
    return NextResponse.json(
      { error: "Name, phone, email, and vehicle description are required." },
      { status: 400 }
    );
  }

  try {
    await postKingAutoLeadFromServer({
      form_type: "vehicle_match_request",
      full_name,
      phone,
      email,
      vehicle_wanted,
      budget_range,
      notes,
    });
  } catch (err) {
    console.error("[vehicle-match] webhook error:", err);
    return NextResponse.json(
      { error: formatLeadErrorForClient(err) },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
