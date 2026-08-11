import { NextResponse } from "next/server";
import {
  formatCrmErrorForClient,
  postToGoogleSheetsCrm,
  type VehicleMatchLeadPayload,
} from "@/lib/google-sheets-crm";

interface CarRequestBody {
  formType?: string;
  fullName?: string;
  name?: string;
  phone?: string;
  email?: string;
  vehicleWanted?: string;
  vehicleWant?: string;
  budget?: string;
  notes?: string;
}

export async function POST(request: Request) {
  let body: CarRequestBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const fullName = (body.fullName ?? body.name)?.trim();
  const phone = body.phone?.trim();
  const email = body.email?.trim();
  const vehicleWanted = (body.vehicleWanted ?? body.vehicleWant)?.trim();

  if (!fullName || !phone || !email || !vehicleWanted) {
    return NextResponse.json(
      { error: "Name, phone, email, and vehicle description are required." },
      { status: 400 }
    );
  }

  const payload: VehicleMatchLeadPayload = {
    formType: "vehicle_match",
    fullName,
    phone,
    email,
    vehicleWanted,
    budget: body.budget?.trim() || "",
    notes: body.notes?.trim() || "",
  };

  try {
    await postToGoogleSheetsCrm(payload);
  } catch (err) {
    console.error("[car-request] Google Sheets CRM error:", err);
    return NextResponse.json(
      { error: formatCrmErrorForClient(err) },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
