import type { Vehicle } from "./types";

const DEFAULT_DEALR_PAGE = "https://staging.dealr.website/39483";

export function dealrInventoryPageUrl(): string {
  return (
    process.env.DEALR_PUBLIC_INVENTORY_URL || DEFAULT_DEALR_PAGE
  ).replace(/\/$/, "");
}

export function dealrVehiclePageUrl(slug: string, id: string): string {
  return `${dealrInventoryPageUrl()}/inventory/${slug}/${id}`;
}

/**
 * Parses the public Dealr inventory listing (the same page embedded on the site)
 * into vehicles we can give our own URLs and search titles.
 */
export function parseDealrInventoryHtml(html: string): Vehicle[] {
  const cleaned = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  const chunks =
    cleaned.match(
      /<div class="dealr-inventory-list__vehicle [\s\S]*?(?=<div class="dealr-inventory-list__vehicle |$)/g
    ) || [];
  const vehicles: Vehicle[] = [];
  const seen = new Set<string>();

  for (const chunk of chunks) {
    const href = chunk.match(/href="inventory\/([^"/]+)\/(\d+)"/);
    if (!href) continue;

    const slug = href[1];
    const id = href[2];
    if (seen.has(id)) continue;

    const inquiry = chunk.match(
      /vehicle-inquiry="([^"|]+)\|(\d{4})\|([^|]+)\|([^"]*)"/
    );
    const title = decodeText(chunk.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i)?.[1] || "");
    const headline = decodeText(
      chunk.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i)?.[1] || ""
    );
    const image =
      chunk.match(
        /<img[^>]+src="(https:\/\/cdn\.dealrimages\.com[^"]+)"/i
      )?.[1] || "";

    const year = inquiry ? Number(inquiry[2]) : Number(title.slice(0, 4));
    const make = inquiry?.[3]?.trim() || "";
    const model = inquiry?.[4]?.trim() || "";
    if (!make || !model || !year || year < 1980 || year > 2035) continue;

    const prefix = `${year} ${make} ${model}`;
    const trim = title.toLowerCase().startsWith(prefix.toLowerCase())
      ? title.slice(prefix.length).trim() || undefined
      : undefined;

    const details = parseDetailPairs(chunk);
    const priceMatch = chunk.match(
      /dealr-inventory-price[\s\S]{0,180}?\$([\d,]+)/i
    );
    const price = priceMatch
      ? Number(priceMatch[1].replace(/,/g, ""))
      : 0;

    seen.add(id);
    vehicles.push({
      id,
      slug,
      year,
      make,
      model,
      trim,
      headline: headline || undefined,
      price: Number.isFinite(price) ? price : 0,
      mileage: parseInt((details.mileage || "").replace(/\D/g, ""), 10) || 0,
      stockNumber: details.stock || undefined,
      drivetrain: details.drivetrain,
      transmission: details.transmission,
      exteriorColor: details.exterior,
      interiorColor: details.interior,
      engine: details.engine,
      mpgCity: parseOptionalInt(details.mpgcity),
      mpgHighway: parseOptionalInt(details.mpghighway),
      vin: inquiry?.[1] || undefined,
      image:
        image ||
        `https://placehold.co/800x500/0a0a0a/D4AF37/png?text=${encodeURIComponent(
          `${year} ${make} ${model}`
        )}`,
      status: "available",
    });
  }

  return vehicles;
}

/** Larger unique photos from a Dealr vehicle page. */
export function parseDealrVehiclePhotos(html: string): string[] {
  const urls = html.match(/https:\/\/cdn\.dealrimages\.com\/[^"'\s>]+/g) || [];
  const best = new Map<string, { url: string; size: number }>();

  for (const raw of urls) {
    let parsed: URL;
    try {
      parsed = new URL(raw.replace(/&amp;/g, "&"));
    } catch {
      continue;
    }
    const key = decodeURIComponent(parsed.pathname);
    const size = Number(parsed.searchParams.get("h") || parsed.searchParams.get("w") || 0);
    const current = best.get(key);
    if (!current || size > current.size) {
      parsed.searchParams.set("w", "1200");
      parsed.searchParams.delete("h");
      best.set(key, { url: parsed.toString(), size });
    }
  }

  return Array.from(best.values())
    .slice(0, 12)
    .map((item) => item.url);
}

function parseDetailPairs(chunk: string): Record<string, string> {
  const out: Record<string, string> = {};
  const re =
    /item__key[^>]*>([\s\S]*?)<\/div>[\s\S]*?item__value[^>]*>([\s\S]*?)<\/div>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(chunk))) {
    const key = decodeText(match[1]).toLowerCase().replace(/[^a-z0-9]/g, "");
    const value = decodeText(match[2]);
    if (key && value) out[key] = value;
  }
  return out;
}

function decodeText(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseOptionalInt(value?: string): number | undefined {
  if (!value) return undefined;
  const n = parseInt(value.replace(/\D/g, ""), 10);
  return Number.isFinite(n) ? n : undefined;
}
