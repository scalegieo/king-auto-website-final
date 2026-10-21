import "server-only";

import { createSign } from "crypto";
import type { KeywordPerformance } from "./types";

type ServiceAccount = {
  client_email: string;
  private_key: string;
};

export async function fetchSearchConsole(now: Date): Promise<{
  configured: boolean;
  rows: KeywordPerformance[];
  note: string;
}> {
  const raw = process.env.GOOGLE_SEARCH_CONSOLE_JSON;
  const siteUrl = process.env.SEARCH_CONSOLE_SITE_URL;
  if (!raw || !siteUrl) {
    return {
      configured: false,
      rows: [],
      note: "Search Console is not connected. Set GOOGLE_SEARCH_CONSOLE_JSON and SEARCH_CONSOLE_SITE_URL to store real queries. Positions are not estimated.",
    };
  }

  let account: ServiceAccount;
  try {
    account = JSON.parse(raw) as ServiceAccount;
  } catch {
    return {
      configured: true,
      rows: [],
      note: "Search Console credentials are set but are not valid JSON.",
    };
  }
  if (!account.client_email || !account.private_key) {
    return {
      configured: true,
      rows: [],
      note: "Search Console JSON is missing client_email or private_key.",
    };
  }

  try {
    const token = await googleAccessToken(
      account,
      "https://www.googleapis.com/auth/webmasters.readonly"
    );
    const end = now.toISOString().slice(0, 10);
    const startDate = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const endpoint = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDate,
        endDate: end,
        dimensions: ["query", "page"],
        rowLimit: 50,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      return {
        configured: true,
        rows: [],
        note: `Search Console request failed (${res.status}). ${text.slice(0, 180)}`,
      };
    }
    const json = (await res.json()) as {
      rows?: Array<{
        keys?: string[];
        clicks?: number;
        impressions?: number;
        ctr?: number;
        position?: number;
      }>;
    };
    const rows: KeywordPerformance[] = (json.rows || []).map((row) => ({
      query: row.keys?.[0] || "",
      page: row.keys?.[1],
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: row.ctr || 0,
      position: row.position || 0,
      startDate,
      endDate: end,
    }));
    return {
      configured: true,
      rows: rows.filter((row) => row.query),
      note: `Search Console rows for ${startDate} to ${end}.`,
    };
  } catch (err) {
    return {
      configured: true,
      rows: [],
      note: err instanceof Error ? err.message : "Search Console request failed.",
    };
  }
}

export async function googleAccessToken(
  account: ServiceAccount,
  scope: string
): Promise<string> {
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const claim = base64url(
    JSON.stringify({
      iss: account.client_email,
      scope,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    })
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claim}`);
  signer.end();
  const signature = signer.sign(account.private_key, "base64url");
  const assertion = `${header}.${claim}.${signature}`;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!res.ok) {
    throw new Error(`Google token request failed (${res.status}).`);
  }
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error("Google token response had no access token.");
  return json.access_token;
}

function base64url(value: string): string {
  return Buffer.from(value).toString("base64url");
}
