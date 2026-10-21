import type { Vehicle } from "@/lib/inventory/types";
import { vehicleHref, vehicleName } from "@/lib/inventory/slug";

export type RelatedCard = {
  href: string;
  name: string;
  price?: number;
  mileage?: number;
};

/** Currently available cars that are actually close to this one. */
export function relatedVehicles(vehicle: Vehicle, inventory: Vehicle[], limit = 4): RelatedCard[] {
  const self = vehicleHref(vehicle);
  const scored = inventory
    .filter((item) => vehicleHref(item) !== self && item.status !== "sold")
    .map((item) => ({ item, score: scorePair(vehicle, item) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.item.price - b.item.price);

  return scored.slice(0, limit).map(({ item }) => ({
    href: vehicleHref(item),
    name: vehicleName(item),
    price: item.price > 0 ? item.price : undefined,
    mileage: item.mileage > 0 ? item.mileage : undefined,
  }));
}

function scorePair(a: Vehicle, b: Vehicle): number {
  let score = 0;
  if (same(a.make, b.make)) score += 3;
  if (same(a.model, b.model)) score += 5;
  if (Math.abs(a.year - b.year) <= 2) score += 1;
  if (a.price > 0 && b.price > 0) {
    const gap = Math.abs(a.price - b.price) / Math.max(a.price, b.price);
    if (gap <= 0.2) score += 2;
  }
  if (a.mileage > 0 && b.mileage > 0) {
    const gap = Math.abs(a.mileage - b.mileage) / Math.max(a.mileage, b.mileage);
    if (gap <= 0.3) score += 1;
  }
  return score;
}

function same(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}
