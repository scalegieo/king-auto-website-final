import type { Vehicle, VehicleStatus } from "./types";

/**
 * Parses Dealr / dealer inventory CSV exports (active units).
 * Headers are matched flexibly — confirm column names against Dealr's sample file
 * once King Auto's feed is live.
 */
export function parseDealrInventoryCsv(csvText: string): Vehicle[] {
  const rows = parseCsvToRecords(csvText);
  const vehicles: Vehicle[] = [];

  for (const row of rows) {
    const vehicle = mapRowToVehicle(row);
    if (vehicle && vehicle.status !== "sold") {
      vehicles.push(vehicle);
    }
  }

  return vehicles;
}

function parseCsvToRecords(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);
  const records: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    const record: Record<string, string> = {};
    headers.forEach((h, idx) => {
      record[h] = (cells[idx] ?? "").trim();
    });
    records.push(record);
  }

  return records;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function normalizeHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function pick(row: Record<string, string>, keys: string[]): string {
  for (const key of keys) {
    const v = row[key];
    if (v) return v;
  }
  return "";
}

function mapRowToVehicle(row: Record<string, string>): Vehicle | null {
  const make = pick(row, ["make", "vehiclemake", "makename"]);
  const model = pick(row, ["model", "vehiclemodel", "modelname"]);
  const yearRaw = pick(row, ["year", "vehicleyear", "modelyear"]);
  const year = parseInt(yearRaw.replace(/\D/g, ""), 10);

  if (!make || !model || !year || year < 1980 || year > 2030) {
    return null;
  }

  const stockNumber = pick(row, [
    "stock",
    "stocknumber",
    "stockno",
    "stocknum",
    "inventoryid",
  ]);
  const vin = pick(row, ["vin", "vinnumber"]);
  const id = stockNumber || vin || `${year}-${make}-${model}-${vehiclesHash(row)}`;

  const priceRaw = pick(row, [
    "price",
    "internetprice",
    "sellingprice",
    "saleprice",
    "listprice",
    "vehicleprice",
  ]);
  const mileageRaw = pick(row, [
    "mileage",
    "miles",
    "odometer",
    "odometerreading",
  ]);

  const price = parseMoney(priceRaw);
  const mileage = parseInt(mileageRaw.replace(/\D/g, ""), 10) || 0;

  const trim = pick(row, ["trim", "series", "style", "trimlevel"]) || undefined;

  const image =
    pick(row, [
      "photo",
      "photourl",
      "image",
      "imageurl",
      "primaryimage",
      "image1",
      "mainphoto",
      "photourl1",
    ]) ||
    `https://placehold.co/800x500/0a0a0a/D4AF37/png?text=${encodeURIComponent(
      `${year} ${make} ${model}`
    )}`;

  const status = mapStatus(pick(row, ["status", "inventorystatus", "stockstatus"]));

  return {
    id,
    make,
    model,
    year,
    price: price > 0 ? price : 0,
    mileage,
    image,
    status,
    trim,
    vin: vin || undefined,
    stockNumber: stockNumber || undefined,
  };
}

function vehiclesHash(row: Record<string, string>): string {
  return Object.values(row).join("|").slice(0, 24);
}

function parseMoney(value: string): number {
  const n = parseFloat(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? Math.round(n) : 0;
}

function mapStatus(raw: string): VehicleStatus {
  const s = raw.toLowerCase();
  if (/sold|wholesale|inactive|deleted/.test(s)) return "sold";
  if (/pending|hold|deposit/.test(s)) return "pending";
  return "available";
}
