const DEFAULT_WEBHOOK_URL =
  "https://script.google.com/macros/s/AKfycby98Zkhgq4O0Sf1ynFMgni9IfTJPFbLO5ImgBMiD3F76GM5IZUfpYlgu-_l_o6almZgsg/exec";

/** Legacy deployment — vehicle_match fails if the sheet tab name in that script is wrong. */
const LEGACY_WEBHOOK_URL =
  "https://script.google.com/macros/s/AKfycbzVuWboLgjezfjZ3ApSQZ-hBUyuz762BL7lgrQKa60dJ5sT3s4wdk5RRfC55Q0xVgaxPg/exec";

export function getGoogleSheetsCrmWebhookUrl(): string {
  return (
    process.env.GOOGLE_SHEETS_CRM_WEBHOOK?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_SHEETS_CRM_WEBHOOK?.trim() ||
    DEFAULT_WEBHOOK_URL
  );
}

export type VehicleMatchLeadPayload = {
  formType: "vehicle_match";
  fullName: string;
  phone: string;
  email: string;
  vehicleWanted: string;
  budget: string;
  notes: string;
};

export type QuickMatchLeadPayload = {
  formType: "quick_match";
  fullName: string;
  phone: string;
  email: string;
  vehicleInterest: string;
  creditScore: string;
};

type WebhookJsonResponse = {
  success?: boolean;
  error?: string;
  message?: string;
};

export function formatCrmErrorForClient(err: unknown): string {
  const msg = err instanceof Error ? err.message : "";

  if (
    msg.includes("appendRow") ||
    msg.includes("Vehicle Match Request") ||
    msg.includes("not found in spreadsheet")
  ) {
    return "We could not save your request right now. Please call the dealership directly.";
  }

  if (msg.includes("CRM webhook HTTP") || msg.includes("empty response")) {
    return "Could not reach our lead system. Please try again in a moment.";
  }

  if (msg.includes("HTML instead of JSON")) {
    return "Our lead form is misconfigured. Please call the dealership directly.";
  }

  return "Something went wrong. Please try again.";
}

export async function postToGoogleSheetsCrm(
  payload: VehicleMatchLeadPayload | QuickMatchLeadPayload
): Promise<void> {
  const url = getGoogleSheetsCrmWebhookUrl();

  if (url === LEGACY_WEBHOOK_URL) {
    console.warn(
      "[google-sheets-crm] GOOGLE_SHEETS_CRM_WEBHOOK points to a legacy Apps Script deployment. " +
        "Update it to the current web app URL (see docs/GOOGLE_SHEETS_CRM.md)."
    );
  }

  const body = JSON.stringify(payload);

  const response = await fetch(url, {
    method: "POST",
    redirect: "follow",
    headers: { "Content-Type": "application/json" },
    body,
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`CRM webhook HTTP ${response.status}`);
  }

  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("CRM webhook returned an empty response");
  }

  if (trimmed.startsWith("<") || trimmed.includes("<!DOCTYPE")) {
    throw new Error(
      "CRM webhook returned HTML instead of JSON. Check GOOGLE_SHEETS_CRM_WEBHOOK and Apps Script deployment."
    );
  }

  let data: WebhookJsonResponse;
  try {
    data = JSON.parse(trimmed) as WebhookJsonResponse;
  } catch {
    console.error(
      "[google-sheets-crm] non-JSON 200 response:",
      trimmed.slice(0, 500)
    );
    throw new Error(
      "CRM webhook returned an invalid response. Check GOOGLE_SHEETS_CRM_WEBHOOK and Apps Script deployment."
    );
  }

  if (data.success !== true) {
    const detail = data.error || data.message || trimmed;
    console.error("[google-sheets-crm] webhook rejected lead:", detail);
    throw new Error(detail);
  }
}
