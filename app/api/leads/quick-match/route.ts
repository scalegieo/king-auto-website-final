import { NextResponse } from "next/server";
import {
  formatLeadErrorForClient,
  postKingAutoLeadFromServer,
} from "@/lib/king-auto-leads";

interface Body {
  full_name?: string;
  fullName?: string;
  phone?: string;
  email?: string;
  vehicle_interest?: string;
  vehicleInterest?: string;
  budget?: string;
  credit_score?: string;
  creditScore?: string;
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const full_name = (body.full_name ?? body.fullName)?.trim();
  const phone = body.phone?.trim();
  const email = body.email?.trim();
  const vehicle_interest = (
    body.vehicle_interest ?? body.vehicleInterest
  )?.trim();
  const budget = (body.budget ?? "").trim() || "Not specified";
  const credit_score = (body.credit_score ?? body.creditScore)?.trim();

  if (!full_name || !phone || !email || !vehicle_interest || !credit_score) {
    return NextResponse.json(
      { error: "Name, phone, email, vehicle interest, and credit score are required." },
      { status: 400 }
    );
  }

  try {
    await postKingAutoLeadFromServer({
      form_type: "pre_approval",
      full_name,
      phone,
      email,
      vehicle_interest,
      budget,
      credit_score,
    });
  } catch (err) {
    console.error("[pre-approval] webhook error:", err);
    return NextResponse.json(
      { error: formatLeadErrorForClient(err) },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
