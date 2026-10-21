import "server-only";

import { mkdir, readFile, rename, writeFile } from "fs/promises";
import path from "path";
import {
  emptyAnalytics,
  emptyDay,
  summarizeAnalytics,
  type AnalyticsStore,
  type AnalyticsSummary,
} from "./summary";

const MAX_VISITORS = 4000;
const MAX_LABELS = 40;

function filePath(): string {
  const dir = process.env.SEO_DATA_DIR || path.join(process.cwd(), "data", "analytics");
  return path.join(dir, "events.json");
}

export async function loadAnalytics(): Promise<AnalyticsStore> {
  try {
    const raw = await readFile(filePath(), "utf8");
    const parsed = JSON.parse(raw) as AnalyticsStore;
    return { days: parsed.days || {} };
  } catch {
    return emptyAnalytics();
  }
}

export async function analyticsSummary(now = new Date()): Promise<AnalyticsSummary> {
  const store = await loadAnalytics();
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Denver",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  return summarizeAnalytics(store, today);
}

let writeQueue: Promise<void> = Promise.resolve();

export function recordHit(input: {
  type: "view" | "click";
  path: string;
  visitorId: string;
  label?: string;
  now?: Date;
}): Promise<void> {
  const job = writeQueue.then(() => saveHit(input));
  writeQueue = job.then(
    () => undefined,
    () => undefined
  );
  return job;
}

async function saveHit(input: {
  type: "view" | "click";
  path: string;
  visitorId: string;
  label?: string;
  now?: Date;
}): Promise<void> {
  const now = input.now || new Date();
  const day = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Denver",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const store = await loadAnalytics();
  const row = store.days[day] || emptyDay();
  const page = row.pages[input.path] || { views: 0, clicks: 0 };

  if (!row.visitorIds.includes(input.visitorId) && row.visitorIds.length < MAX_VISITORS) {
    row.visitorIds.push(input.visitorId);
  }

  if (input.type === "view") {
    row.views += 1;
    page.views += 1;
  } else {
    row.clicks += 1;
    page.clicks += 1;
    const label = (input.label || "Tap").slice(0, 80);
    row.clicksByLabel[label] = (row.clicksByLabel[label] || 0) + 1;
    const entries = Object.entries(row.clicksByLabel).sort((a, b) => b[1] - a[1]);
    row.clicksByLabel = Object.fromEntries(entries.slice(0, MAX_LABELS));
  }

  row.pages[input.path] = page;
  store.days[day] = row;

  const cutoff = new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  for (const key of Object.keys(store.days)) {
    if (key < cutoff) delete store.days[key];
  }

  const dest = filePath();
  await mkdir(path.dirname(dest), { recursive: true });
  const tmp = `${dest}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tmp, JSON.stringify(store), "utf8");
  await rename(tmp, dest);
}
