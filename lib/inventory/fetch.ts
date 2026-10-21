import "server-only";

import { readFile } from "fs/promises";
import path from "path";
import { parseDealrInventoryCsv } from "./dealr-csv";
import { vehicleRouteId, vehicleSlug } from "./slug";
import {
  dealrInventoryPageUrl,
  dealrVehiclePageUrl,
  parseDealrInventoryHtml,
  parseDealrVehiclePhotos,
} from "./dealr-html";
import { SITE_URL } from "@/lib/dealership";
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
 * 3) Public Dealr inventory page (live lot)
 * 4) DEALR_INVENTORY_FILE / dev sample CSV
 * 5) Mock data fallback (fetchInventory only — not used for public SEO pages)
 */
export async function fetchInventory(): Promise<Vehicle[]> {
  const live = await fetchIndexableInventory();
  if (live.length > 0) return live;
  return MOCK_INVENTORY;
}

/** Real lot only. Empty when every live source fails — never mock cars. */
/** FTP, HTTP CSV, or the public Dealr listing. No sample file and no mock cars. */
export async function fetchLiveInventory(): Promise<Vehicle[]> {
  try {
    const fromFtp = await fetchFromDealrFtp();
    if (fromFtp.length > 0) return fromFtp;

    const fromUrl = await fetchFromUrl();
    if (fromUrl.length > 0) return fromUrl;

    const fromHtml = await fetchFromDealrHtml();
    if (fromHtml.length > 0) return fromHtml;
  } catch (err) {
    console.error("[inventory] live feed error:", err);
  }

  return [];
}

export async function fetchIndexableInventory(): Promise<Vehicle[]> {
  const live = await fetchLiveInventory();
  if (live.length > 0) return live;

  try {
    const fromFile = await fetchFromLocalFile();
    if (fromFile.length > 0) return fromFile;
  } catch (err) {
    console.error("[inventory] feed error:", err);
  }

  return [];
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

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Dealr URL inventory failed: ${res.status}`);
  }
  const csv = await res.text();
  return parseDealrInventoryCsv(csv);
}

async function fetchFromDealrHtml(): Promise<Vehicle[]> {
  const res = await fetch(dealrInventoryPageUrl(), {
    headers: {
      "User-Agent": `KingAutoInc/1.0 (+${SITE_URL})`,
      Accept: "text/html",
    },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const html = await res.text();
  return parseDealrInventoryHtml(html);
}

export async function getVehicle(
  slug: string,
  id: string
): Promise<Vehicle | null> {
  const vehicles = await fetchIndexableInventory();
  const vehicle = vehicles.find(
    (item) => vehicleSlug(item) === slug && vehicleRouteId(item) === id
  );
  if (!vehicle) return null;
  return enrichDealrPhotos(vehicle);
}

async function enrichDealrPhotos(vehicle: Vehicle): Promise<Vehicle> {
  if (!vehicle.slug || !/^\d+$/.test(vehicle.id)) return vehicle;

  try {
    const res = await fetch(dealrVehiclePageUrl(vehicle.slug, vehicle.id), {
      headers: {
        "User-Agent": `KingAutoInc/1.0 (+${SITE_URL})`,
        Accept: "text/html",
      },
      cache: "no-store",
    });
    if (!res.ok) return vehicle;
    const photos = parseDealrVehiclePhotos(await res.text());
    if (photos.length === 0) return vehicle;
    return { ...vehicle, image: photos[0], images: photos };
  } catch {
    return vehicle;
  }
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
