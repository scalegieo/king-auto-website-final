/**
 * King Auto WEB Leads Forms — Google Apps Script webhook.
 * Spreadsheet: “King Auto WEB Leads Forms”
 * Email notify: mykingauto@gmail.com
 * Hardcoded — no env required for production lead capture.
 */

import { DEALERSHIP } from "@/lib/dealership";

export const KING_AUTO_LEADS_WEBHOOK =
  "https://script.google.com/macros/s/AKfycbzuzZ_5mk58haefVGy-n_uz0XJr5bUAfWODXt3IzyLMm6e1Ehhu3D0q_SIsxFelvJoF/exec";

export type PreApprovalLead = {
  form_type: "pre_approval";
  full_name: string;
  phone: string;
  email: string;
  vehicle_interest: string;
  budget: string;
  credit_score: string;
};

export type VehicleMatchLead = {
  form_type: "vehicle_match_request";
  full_name: string;
  phone: string;
  email: string;
  vehicle_wanted: string;
  budget_range: string;
  notes: string;
};

export type KingAutoLeadPayload = PreApprovalLead | VehicleMatchLead;

/**
 * Client-side submit (as required by Apps Script CORS setup).
 * mode: "no-cors" → opaque response; treat network success as submitted.
 */
export async function submitKingAutoLead(
  payload: KingAutoLeadPayload
): Promise<void> {
  await fetch(KING_AUTO_LEADS_WEBHOOK, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

/** Server-side submit (API routes) — can follow redirects and read body. */
export async function postKingAutoLeadFromServer(
  payload: KingAutoLeadPayload
): Promise<void> {
  const response = await fetch(KING_AUTO_LEADS_WEBHOOK, {
    method: "POST",
    redirect: "follow",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  // Apps Script often returns 200 with empty/HTML after redirect; treat 2xx as ok
  if (!response.ok && response.status !== 302) {
    const text = await response.text().catch(() => "");
    console.error(
      "[king-auto-leads] webhook HTTP",
      response.status,
      text.slice(0, 300)
    );
    throw new Error(`Lead webhook HTTP ${response.status}`);
  }
}

export function formatLeadErrorForClient(err: unknown): string {
  const msg = err instanceof Error ? err.message : "";
  const call = `call ${DEALERSHIP.phoneDisplay}`;
  if (msg.includes("webhook HTTP") || msg.includes("Failed to fetch")) {
    return `Could not reach our lead system. Please try again or ${call}.`;
  }
  return `Something went wrong. Please try again or ${call}.`;
}
