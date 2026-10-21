import "server-only";

import { randomUUID } from "crypto";
import { SITE_URL } from "@/lib/dealership";
import { fetchLiveInventory } from "@/lib/inventory/fetch";
import {
  analyzeSite,
  buildReport,
  diffInventory,
  normalizeInventory,
  previousSnapshot,
  programWeek,
  themeForWeek,
} from "./engine";
import { fetchSearchConsole } from "./search-console";
import { loadStore, saveStore } from "./store";
import type { AutomationRun, SeoStore } from "./types";

const LOCK_MS = 30 * 60 * 1000;

export async function executeWeeklyRun(now = new Date()): Promise<AutomationRun> {
  const store = await loadStore();
  if (store.running) {
    const age = now.getTime() - new Date(store.running.startedAt).getTime();
    if (age < LOCK_MS) {
      throw new Error("An SEO run is already in progress.");
    }
  }

  const id = randomUUID();
  const startedAt = now.toISOString();
  const week = programWeek(store.programStartedAt, now);
  const theme = themeForWeek(week);
  const run: AutomationRun = {
    id,
    startedAt,
    status: "running",
    week,
    theme: theme.theme,
    vehiclesScanned: 0,
    pagesScanned: 0,
    changesApplied: 0,
    changesQueued: 0,
    errors: [],
    notes: [],
    persistence: "none",
  };

  store.running = { id, startedAt };
  store.runs.push(run);
  if (!store.programStartedAt) store.programStartedAt = startedAt;
  await saveStore(store);

  try {
    const live = await fetchLiveInventory();
    if (live.length === 0) {
      run.status = "failed";
      run.finishedAt = new Date().toISOString();
      run.errors.push(
        "The live Dealr feed returned no vehicles. History was not changed, so cars were not marked sold."
      );
      return run;
    }

    const previous = previousSnapshot(store.snapshots);
    const normalized = normalizeInventory(live, store.vehicles, startedAt);
    const isBaseline = previous.length === 0;
    const events = diffInventory(previous, normalized).filter(
      (event) => !(isBaseline && event.type === "new")
    );
    const search = await fetchSearchConsole(now);
    const httpNotes = await probeProduction();
    const analysis = analyzeSite({
      runId: id,
      now: startedAt,
      week,
      vehicles: normalized,
      previous,
      events,
      existing: store,
      searchRows: search.rows,
    });

    for (const note of httpNotes) {
      analysis.issues.push({
        id: `http-${note.path}`,
        runId: id,
        path: note.path,
        severity: note.ok ? "info" : "warning",
        code: "http_status",
        message: note.message,
        createdAt: startedAt,
      });
    }

    store.vehicles = Object.fromEntries(normalized.map((vehicle) => [vehicle.key, vehicle]));
    store.snapshots.push({ runId: id, at: startedAt, vehicles: normalized });
    store.issues.push(...analysis.issues);
    store.recommendations.push(...analysis.recommendations);
    store.changes.push(...analysis.appliedChanges, ...analysis.pendingChanges);
    store.overrides = analysis.overrides;
    store.linkOpportunities = analysis.links;
    store.searchRows = search.rows;
    store.searchNote = search.note;
    store.reports.push(
      buildReport({
        runId: id,
        now: startedAt,
        week,
        vehicles: normalized,
        events,
        issues: analysis.issues,
        recommendations: analysis.recommendations,
        applied: analysis.appliedChanges.length,
        queued: analysis.pendingChanges.length,
        searchRows: search.rows,
        previousScores: store.reports.length
          ? store.reports[store.reports.length - 1].scores
          : undefined,
      })
    );

    run.vehiclesScanned = normalized.length;
    run.pagesScanned = normalized.length + 2 + httpNotes.length;
    run.changesApplied = analysis.appliedChanges.length;
    run.changesQueued = analysis.pendingChanges.length;
    run.status = "completed";
    run.finishedAt = new Date().toISOString();
    if (isBaseline) {
      run.notes.push(
        `Baseline recorded ${normalized.length} live vehicles. They are not counted as new arrivals.`
      );
    }
  } catch (err) {
    run.status = "failed";
    run.finishedAt = new Date().toISOString();
    run.errors.push(err instanceof Error ? err.message : "SEO run failed.");
  } finally {
    store.running = null;
    await finishRun(store, run);
  }

  return run;
}

async function finishRun(store: SeoStore, run: AutomationRun) {
  const saved = await saveStore(store);
  run.persistence = saved;
  if (saved === "none" && run.status === "completed") {
    run.status = "completed_not_persisted";
    run.persistence = await saveStore(store);
    return;
  }
  if (saved !== "none") await saveStore(store);
}

async function probeProduction(): Promise<Array<{ path: string; ok: boolean; message: string }>> {
  const targets = ["/", "/robots.txt", "/sitemap.xml", "/inventory"];
  const notes: Array<{ path: string; ok: boolean; message: string }> = [];
  for (const path of targets) {
    try {
      const res = await fetch(`${SITE_URL}${path}`, {
        method: "GET",
        redirect: "follow",
        signal: AbortSignal.timeout(12_000),
        headers: { "User-Agent": `KingAutoSEO/1.0 (+${SITE_URL})` },
      });
      const ok = res.status >= 200 && res.status < 400;
      notes.push({
        path,
        ok,
        message: `${SITE_URL}${path} returned HTTP ${res.status}.`,
      });
    } catch (err) {
      notes.push({
        path,
        ok: false,
        message: `${SITE_URL}${path} could not be fetched (${err instanceof Error ? err.message : "error"}).`,
      });
    }
  }
  return notes;
}
