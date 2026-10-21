import "server-only";

import { googleAccessToken } from "@/lib/seo-system/search-console";

export type GoogleTotals = {
  users: number;
  views: number;
  sessions: number;
};

export type GoogleAnalyticsSnapshot = {
  connected: boolean;
  note: string;
  today: GoogleTotals | null;
  days7: GoogleTotals | null;
  days28: GoogleTotals | null;
  topPages: Array<{ path: string; views: number; users: number }>;
};

const EMPTY: GoogleAnalyticsSnapshot = {
  connected: false,
  note: "Google Analytics is not connected. shopkingauto.com has no Google tag, so Google has no visitor history to return. These boxes stay empty instead of showing a made-up number.",
  today: null,
  days7: null,
  days28: null,
  topPages: [],
};

export async function fetchGoogleAnalytics(): Promise<GoogleAnalyticsSnapshot> {
  const propertyId = process.env.GA4_PROPERTY_ID?.trim() || "";
  const raw = process.env.GOOGLE_ANALYTICS_JSON || process.env.GOOGLE_SEARCH_CONSOLE_JSON;
  if (!/^\d+$/.test(propertyId) || !raw) return EMPTY;

  let account: { client_email?: string; private_key?: string };
  try {
    account = JSON.parse(raw) as { client_email?: string; private_key?: string };
  } catch {
    return { ...EMPTY, note: "Google Analytics credentials are set, but the JSON is invalid." };
  }
  if (!account.client_email || !account.private_key) {
    return { ...EMPTY, note: "Google Analytics JSON is missing client_email or private_key." };
  }

  try {
    const token = await googleAccessToken(
      { client_email: account.client_email, private_key: account.private_key },
      "https://www.googleapis.com/auth/analytics.readonly"
    );
    const [today, days7, days28, topPages] = await Promise.all([
      totals(token, propertyId, "today", "today"),
      totals(token, propertyId, "7daysAgo", "today"),
      totals(token, propertyId, "28daysAgo", "today"),
      pages(token, propertyId),
    ]);
    return {
      connected: true,
      note: "Numbers are from the Google Analytics 4 property. They are visitors Google recorded, not a ranking.",
      today,
      days7,
      days28,
      topPages,
    };
  } catch (err) {
    return {
      ...EMPTY,
      note: err instanceof Error ? err.message : "Google Analytics request failed.",
    };
  }
}

async function totals(
  token: string,
  propertyId: string,
  startDate: string,
  endDate: string
): Promise<GoogleTotals> {
  const row = await runReport(token, propertyId, {
    dateRanges: [{ startDate, endDate }],
    metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }, { name: "sessions" }],
  });
  const values = row.rows?.[0]?.metricValues || [];
  return {
    users: numberAt(values, 0),
    views: numberAt(values, 1),
    sessions: numberAt(values, 2),
  };
}

async function pages(token: string, propertyId: string) {
  const report = await runReport(token, propertyId, {
    dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
    dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
    orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    limit: 8,
  });
  return (report.rows || []).map((row) => ({
    path: row.dimensionValues?.[0]?.value || "/",
    views: numberAt(row.metricValues, 0),
    users: numberAt(row.metricValues, 1),
  }));
}

type Report = {
  rows?: Array<{
    dimensionValues?: Array<{ value?: string }>;
    metricValues?: Array<{ value?: string }>;
  }>;
};

async function runReport(
  token: string,
  propertyId: string,
  body: Record<string, unknown>
): Promise<Report> {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google Analytics request failed (${res.status}). ${text.slice(0, 180)}`);
  }
  return (await res.json()) as Report;
}

function numberAt(values: Array<{ value?: string }> | undefined, index: number): number {
  const parsed = Number(values?.[index]?.value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}
