export type AnalyticsDay = {
  views: number;
  clicks: number;
  visitorIds: string[];
  pages: Record<string, { views: number; clicks: number }>;
  clicksByLabel: Record<string, number>;
};

export type AnalyticsStore = {
  days: Record<string, AnalyticsDay>;
};

export type AnalyticsTotals = {
  views: number;
  clicks: number;
  visitors: number;
};

export type AnalyticsSummary = {
  today: AnalyticsTotals;
  days7: AnalyticsTotals;
  days30: AnalyticsTotals;
  topPages: Array<{ path: string; views: number; clicks: number }>;
  topClicks: Array<{ label: string; count: number }>;
};

export function emptyAnalytics(): AnalyticsStore {
  return { days: {} };
}

export function emptyDay(): AnalyticsDay {
  return { views: 0, clicks: 0, visitorIds: [], pages: {}, clicksByLabel: {} };
}

export function summarizeAnalytics(store: AnalyticsStore, today: string): AnalyticsSummary {
  const keys = Object.keys(store.days).sort();
  const last30 = keys.filter((day) => day >= shiftDate(today, 29) && day <= today);
  const last7 = last30.filter((day) => day >= shiftDate(today, 6));
  return {
    today: totals(store, [today]),
    days7: totals(store, last7),
    days30: totals(store, last30),
    topPages: topPages(store, last30),
    topClicks: topClicks(store, last30),
  };
}

export function shiftDate(isoDay: string, daysBack: number): string {
  const date = new Date(`${isoDay}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - daysBack);
  return date.toISOString().slice(0, 10);
}

function totals(store: AnalyticsStore, days: string[]): AnalyticsTotals {
  const visitors = new Set<string>();
  let views = 0;
  let clicks = 0;
  for (const day of days) {
    const row = store.days[day];
    if (!row) continue;
    views += row.views;
    clicks += row.clicks;
    for (const id of row.visitorIds) visitors.add(id);
  }
  return { views, clicks, visitors: visitors.size };
}

function topPages(store: AnalyticsStore, days: string[]) {
  const pages = new Map<string, { views: number; clicks: number }>();
  for (const day of days) {
    const row = store.days[day];
    if (!row) continue;
    for (const [path, stat] of Object.entries(row.pages)) {
      const current = pages.get(path) || { views: 0, clicks: 0 };
      current.views += stat.views;
      current.clicks += stat.clicks;
      pages.set(path, current);
    }
  }
  return Array.from(pages.entries())
    .map(([path, stat]) => ({ path, ...stat }))
    .sort((a, b) => b.views - a.views || b.clicks - a.clicks)
    .slice(0, 8);
}

function topClicks(store: AnalyticsStore, days: string[]) {
  const labels = new Map<string, number>();
  for (const day of days) {
    const row = store.days[day];
    if (!row) continue;
    for (const [label, count] of Object.entries(row.clicksByLabel)) {
      labels.set(label, (labels.get(label) || 0) + count);
    }
  }
  return Array.from(labels.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}
