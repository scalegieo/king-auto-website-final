import { NextResponse } from "next/server";
import {
  formatCrmErrorForClient,
  postToGoogleSheetsCrm,
  type QuickMatchLeadPayload,
} from "@/lib/google-sheets-crm";

interface QuickMatchBody {
  formType?: string;
  fullName?: string;
  phone?: string;
  email?: string;
  vehicleInterest?: string;
  creditScore?: string;
}

export async function POST(request: Request) {
  let body: QuickMatchBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const fullName = body.fullName?.trim();
  const phone = body.phone?.trim();
  const email = body.email?.trim();
  const vehicleInterest = body.vehicleInterest?.trim();
  const creditScore = body.creditScore?.trim();

  if (!fullName || !phone || !email || !vehicleInterest || !creditScore) {
    return NextResponse.json(
      { error: "All fields are required." },
      { status: 400 }
    );
  }

  const payload: QuickMatchLeadPayload = {
    formType: "quick_match",
    fullName,
    phone,
    email,
    vehicleInterest,
    creditScore,
  };

  try {
    await postToGoogleSheetsCrm(payload);
  } catch (err) {
    console.error("[quick-match] Google Sheets CRM error:", err);
    return NextResponse.json(
      { error: formatCrmErrorForClient(err) },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
