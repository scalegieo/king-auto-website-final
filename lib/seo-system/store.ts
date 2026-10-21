import "server-only";

import { mkdir, readFile, rename, writeFile } from "fs/promises";
import path from "path";
import { emptyStore, type SeoStore } from "./types";

const MAX_WEEKS = 26;

function dataDir(): string {
  return process.env.SEO_DATA_DIR || path.join(process.cwd(), "data", "seo");
}

function filePath(): string {
  return path.join(dataDir(), "store.json");
}

export async function loadStore(): Promise<SeoStore> {
  const remote = await loadRemote();
  if (remote) return remote;
  try {
    const raw = await readFile(filePath(), "utf8");
    return { ...emptyStore(), ...JSON.parse(raw) } as SeoStore;
  } catch {
    return emptyStore();
  }
}

export async function saveStore(store: SeoStore): Promise<"file" | "remote" | "file+remote" | "none"> {
  const trimmed = trimStore(store);
  let fileOk = false;
  let remoteOk = false;
  try {
    await mkdir(dataDir(), { recursive: true });
    const dest = filePath();
    const tmp = `${dest}.${process.pid}.tmp`;
    await writeFile(tmp, JSON.stringify(trimmed), "utf8");
    await rename(tmp, dest);
    fileOk = true;
  } catch (err) {
    console.error("[seo] file store write failed:", err);
  }
  remoteOk = await saveRemote(trimmed);
  if (fileOk && remoteOk) return "file+remote";
  if (remoteOk) return "remote";
  if (fileOk) return "file";
  return "none";
}

export async function readOverride(pagePath: string): Promise<{
  title?: string;
  description?: string;
} | null> {
  const store = await loadStore();
  return store.overrides[pagePath] ?? null;
}

function trimStore(store: SeoStore): SeoStore {
  return {
    ...store,
    snapshots: store.snapshots.slice(-MAX_WEEKS),
    runs: store.runs.slice(-MAX_WEEKS),
    reports: store.reports.slice(-MAX_WEEKS),
    issues: store.issues.slice(-800),
    recommendations: store.recommendations.slice(-400),
    changes: store.changes.slice(-400),
    linkOpportunities: store.linkOpportunities.slice(-200),
    searchRows: store.searchRows.slice(-250),
  };
}

async function loadRemote(): Promise<SeoStore | null> {
  const url = process.env.SEO_STATE_URL;
  const token = process.env.SEO_STATE_TOKEN;
  if (!url || !token) return null;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return { ...emptyStore(), ...(await res.json()) } as SeoStore;
  } catch {
    return null;
  }
}

async function saveRemote(store: SeoStore): Promise<boolean> {
  const url = process.env.SEO_STATE_URL;
  const token = process.env.SEO_STATE_TOKEN;
  if (!url || !token) return false;
  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(store),
    });
    return res.ok;
  } catch (err) {
    console.error("[seo] remote store write failed:", err);
    return false;
  }
}
