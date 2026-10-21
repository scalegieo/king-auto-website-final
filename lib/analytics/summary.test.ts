import assert from "node:assert/strict";
import test from "node:test";
import { emptyDay, summarizeAnalytics, type AnalyticsStore } from "./summary";
import { nextSeoRun } from "../seo-system/schedule";

test("next SEO run is the following Monday at 15:00 UTC", () => {
  const tuesday = new Date("2026-10-20T18:00:00.000Z");
  const next = nextSeoRun(tuesday);
  assert.equal(next.toISOString(), "2026-10-26T15:00:00.000Z");
});

test("analytics summary counts people, views, and taps without inventing days", () => {
  const day = emptyDay();
  day.views = 3;
  day.clicks = 2;
  day.visitorIds = ["a", "b"];
  day.pages["/"] = { views: 2, clicks: 1 };
  day.pages["/inventory"] = { views: 1, clicks: 1 };
  day.clicksByLabel["Inventory"] = 2;
  const store: AnalyticsStore = { days: { "2026-10-20": day } };
  const summary = summarizeAnalytics(store, "2026-10-20");
  assert.equal(summary.today.visitors, 2);
  assert.equal(summary.today.views, 3);
  assert.equal(summary.today.clicks, 2);
  assert.equal(summary.days30.views, 3);
  assert.equal(summary.topPages[0]?.path, "/");
  assert.equal(summary.topClicks[0]?.label, "Inventory");
  const older = summarizeAnalytics(store, "2026-11-20");
  assert.equal(older.today.views, 0);
  assert.equal(older.days30.views, 0);
});
