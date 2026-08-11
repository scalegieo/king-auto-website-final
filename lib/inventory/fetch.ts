import "server-only";

import { readFile } from "fs/promises";
import path from "path";
import { parseDealrInventoryCsv } from "./dealr-csv";
import type { Vehicle } from "./types";
import { MOCK_INVENTORY } from "./mock-data";

const REVALIDATE =
  Number(process.env.INVENTORY_REVALIDATE_SECONDS) > 0
    ? Number(process.env.INVENTORY_REVALIDATE_SECONDS)
    : 300;

/**
 * Primary inventory loader for King Auto.
 *
 * Order:
 * 1) Dealr FTP export (credentials from Dealr support)
 * 2) DEALR_INVENTORY_URL (HTTP CSV)
 * 3) DEALR_INVENTORY_FILE / dev sample CSV
 * 4) Mock data fallback
 */
export async function fetchInventory(): Promise<Vehicle[]> {
  try {
    const fromFtp = await fetchFromDealrFtp();
    if (fromFtp.length > 0) return fromFtp;

    const fromUrl = await fetchFromUrl();
    if (fromUrl.length > 0) return fromUrl;

    const fromFile = await fetchFromLocalFile();
    if (fromFile.length > 0) return fromFile;
  } catch (err) {
    console.error("[inventory] feed error:", err);
  }

  return MOCK_INVENTORY;
}

export function getInventoryRevalidateSeconds(): number {
  return REVALIDATE;
}

async function fetchFromDealrFtp(): Promise<Vehicle[]> {
  const host = process.env.DEALR_FTP_HOST;
  const user = process.env.DEALR_FTP_USERNAME;
  const password = process.env.DEALR_FTP_PASSWORD;
  const filename = process.env.DEALR_FTP_FILENAME || "inventory.csv";

  if (!host || !user || !password) return [];

  const { Client } = await import("basic-ftp");
  const os = await import("os");
  const tmpPath = path.join(os.tmpdir(), `dealr-${Date.now()}.csv`);

  const client = new Client(30_000);
  try {
    await client.access({
      host,
      user,
      password,
      secure: process.env.DEALR_FTP_SECURE === "true",
    });
    await client.downloadTo(tmpPath, filename);
    const csv = await readFile(tmpPath, "utf-8");
    return parseDealrInventoryCsv(csv);
  } finally {
    client.close();
  }
}

async function fetchFromUrl(): Promise<Vehicle[]> {
  const url = process.env.DEALR_INVENTORY_URL;
  if (!url) return [];

  const res = await fetch(url, {
    next: { revalidate: REVALIDATE },
  });
  if (!res.ok) {
    throw new Error(`Dealr URL inventory failed: ${res.status}`);
  }
  const csv = await res.text();
  return parseDealrInventoryCsv(csv);
}

async function fetchFromLocalFile(): Promise<Vehicle[]> {
  const explicit = process.env.DEALR_INVENTORY_FILE;
  if (!explicit && process.env.NODE_ENV !== "development") {
    return [];
  }

  const file = explicit || "data/sample-dealr-inventory.csv";
  const fullPath = path.isAbsolute(file)
    ? file
    : path.join(process.cwd(), file);

  try {
    const csv = await readFile(fullPath, "utf-8");
    return parseDealrInventoryCsv(csv);
  } catch {
    return [];
  }
}
